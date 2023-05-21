use anchor_lang::prelude::*;
use anchor_spl::token::{TokenAccount, self, Token};
use pyth_sdk_solana::{load_price_feed_from_account_info, PriceFeed, PriceStatus, Price};

use crate::{state::*, math_error};
use crate::error::ErrorCode;
use crate::utils::{get_funding_fee, get_mark_price, get_volatility_impact};

#[derive(Accounts)]
pub struct PositionLiquidate<'info> {
    #[account(
        mut,
        constraint = liquidatooor.key() == liquidatooor_pda.user
    )]
    pub liquidatooor: Signer<'info>,
    #[account(
        mut,
        seeds = [
            USER_PDA_SEED_PREFIX,
            liquidatooor.key().as_ref()
        ],
        bump,
    )]
    pub liquidatooor_pda: Box<Account<'info, User>>,
    /// CHECK:
    #[account(
        mut,
        constraint = user.key() == user_pda.user
    )]
    pub user: AccountInfo<'info>,
    #[account(
        mut,
        seeds = [
            USER_PDA_SEED_PREFIX,
            user.key().as_ref()
        ],
        bump,
        has_one = user
    )]
    pub user_pda: Box<Account<'info, User>>,
    #[account(mut)]
    pub user_positions: AccountLoader<'info, UserPositions>,
    #[account(mut)]
    pub user_history: AccountLoader<'info, UserHistory>,
    #[account(
        mut,
        seeds = [CONFIG_SEED],
        bump,
        has_one = markets
    )]
    pub config: Box<Account<'info, Config>>,
    #[account(
        mut,
        constraint = &config.markets.eq(&markets.key())
    )]
    pub markets: AccountLoader<'info, Markets>,
    #[account(mut)]
    pub funding_data: AccountLoader<'info, FundingData>,
    #[account(
        mut,
        seeds = [COLLATERAL_VAULT_SEED],
        bump,
    )]
    pub global_collateral_vault: Box<Account<'info, TokenAccount>>,
    #[account(mut)]
    pub market_collateral_vault: Box<Account<'info, TokenAccount>>,
    #[account(mut)]
    pub insurance_vault: Box<Account<'info, TokenAccount>>,
    /// CHECK:
    #[account(
        constraint = &config.collateral_vault_authority.eq(&global_collateral_vault_authority.key())
    )]
    pub global_collateral_vault_authority: AccountInfo<'info>,
    /// CHECK:
    pub market_collateral_vault_authority: AccountInfo<'info>,
    #[account(mut)]
    pub treasury_vault: Box<Account<'info, TokenAccount>>,
    /// CHECK:
    pub oracle_price_feed: AccountInfo<'info>,
    #[account(address = token::ID)]
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn handler<'info>(ctx: Context<'_, '_, '_, 'info, PositionLiquidate<'info>>,
    market_index: u64,
    option_side: OptionSide,
    quote_amount_input: i64,
    base_amount_input: u64,
) -> Result<()> {
    let close_position = true;
    let reduce_only = true;

    let now = Clock::get().unwrap().unix_timestamp.unsigned_abs();

    if quote_amount_input == 0i64 {
        return err!(ErrorCode::TradeSizeZero);
    }

    // verify that this is the correct user_positions account
    let user_positions = &mut ctx.accounts.user_positions.load_mut()?;
    assert!(user_positions.user == ctx.accounts.user.to_account_info().key());

    let user_history = &mut ctx.accounts.user_history.load_mut()?;
    assert!(user_history.user == ctx.accounts.user.to_account_info().key());

    let markets = &mut ctx.accounts.markets.load_mut()?;
    let market = &mut markets.markets[market_index as usize];

    if market.market_paused {
        return err!(ErrorCode::MarketPaused);
    }

    if ctx.accounts.config.exchange_paused {
        return err!(ErrorCode::ExchangePaused);
    }

    let mut market_data = if option_side == OptionSide::Call {
        market.call_market_data
    } else {
        market.put_market_data
    };

    // verify that this is the correct oracle price feed
    if ctx.accounts.oracle_price_feed.to_account_info().key() != market.oracle_price_feed {
        return err!(ErrorCode::InvalidOraclePriceFeed);
    }

    // verify that this is the correct market collateral vault
    if ctx.accounts.market_collateral_vault.to_account_info().key() != market_data.collateral_vault {
        return err!(ErrorCode::InvalidCollateralAccountForMarket);
    }

    // verify that this is the correct market collateral vault authority
    if ctx.accounts.market_collateral_vault_authority.to_account_info().key() != market_data.collateral_vault_authority {
        return err!(ErrorCode::InvalidCollateralAccountAuthorityForMarket);
    }

    // verify that this is the correct insurance vault
    if ctx.accounts.insurance_vault.to_account_info().key() != ctx.accounts.config.insurance_vault {
        return err!(ErrorCode::InvalidCollateralAccountForMarket);
    }

    // verify that this is the correct treasury vault
    if ctx.accounts.treasury_vault.to_account_info().key() != ctx.accounts.config.treasury_vault {
        return err!(ErrorCode::InvalidCollateralAccountForMarket);
    }

    let mut price_feed: PriceFeed = load_price_feed_from_account_info(&ctx.accounts.oracle_price_feed).unwrap();
    if Clock::get().unwrap().epoch == 0u64 {
        price_feed.status = PriceStatus::Trading; // FOR LOCAL TESTS
    }

    let oracle_price_obj: Price = price_feed.get_current_price().unwrap();
    let dec_scale_diff = i64::pow(10, (-oracle_price_obj.expo - market.collateral_decimals as i32) as u32);
    let oracle_price = oracle_price_obj.price.abs().checked_div(dec_scale_diff).ok_or_else(math_error!())? as u64;

    market.oracle_price = oracle_price;
    market.oracle_price_ts = now;

    // update ema
    market.update_ema(oracle_price, now)?;

    // try to update funding rate
    let funding_data = &mut ctx.accounts.funding_data.load_mut()?;

    // verify that this is the correct funding account
    if ctx.accounts.funding_data.to_account_info().key() != market_data.funding_data {
        return err!(ErrorCode::InvalidFundingRateAccountForMarketData);
    }

    if funding_data.funding_records_tier_0.can_add_forward_record(now)? {
        let updated_funding_rate = get_funding_fee(
            option_side,
            market_data.mark_price,
            market.get_ema()?,
            oracle_price,
            SECONDS_IN_DAY / funding_data.funding_records_tier_0.interval_sec,
        )?;
        funding_data.update(updated_funding_rate, now)?;
        market_data.funding_rate = funding_data.get_current_funding_rate()?;
        market_data.funding_rate_ts = now;
    }

    let mut position = *user_positions.positions.iter()
        .find(|x| (x.market_index as u16) == market.index && x.side == option_side && x.active == true)
        .ok_or(
            ErrorCode::PositionNotFound
        )?;

    // update cumulative funding
    let per_quote_funding = funding_data.get_total_funding_since(position.last_funding_ts, now)?;
    let total_funding = (per_quote_funding * position.quote_asset_amount.abs()) / (COLLATERAL_DECIMAL_SCALE as i64);

    if position.quote_asset_amount > 0 {
        // default is longs pay shorts, so if long then subtract
        position.last_cumulative_funding = position.last_cumulative_funding - total_funding;
    } else {
        // if short, then add
        position.last_cumulative_funding = position.last_cumulative_funding + total_funding;
    }

    position.last_funding_ts = now;

    // after updating funding, check position health
    let position_health = position.get_position_health(*market, market_data)?;

    // make sure the position is below the minimum health to proceed with liquidation
    if position_health > (MARGIN_RATIO_MAINTENANCE as i64) {
        return err!(ErrorCode::PositionCannotBeLiquidated);
    }

    // determine if this is a net increase or decrease in position size
    let current_quote = position.quote_asset_amount;
    let future_quote = position.quote_asset_amount + quote_amount_input;

    // orders that go cross-position (net long to net short or vice versa) need to be split up on the client side into two orders, due to the vAMM logic
    if (current_quote > 0 && future_quote < 0) || (current_quote < 0 && future_quote > 0) {
        return err!(ErrorCode::CrossPositionChange)
    }

    // long vs. short here is used in the context of the constant product vAMM, not related to whether the trade is increasing or decreasing
    // closing a long position is still considered long
    let order_side = if future_quote > 0 || current_quote > 0 {
        OrderSide::Long
    } else {
        OrderSide::Short
    };

    let direction = if future_quote.abs() > current_quote.abs() {
        PositionChangeDirection::Increase
    } else {
        PositionChangeDirection::Decrease
    };

    if close_position || reduce_only {
        assert!(direction == PositionChangeDirection::Decrease);
    }

    let quote_amount = quote_amount_input.abs() as u64;
    let base_amount = base_amount_input;

    // check current exposure
    let exposure_start = market.get_exposure(
        option_side,
        ctx.accounts.market_collateral_vault.amount,
        oracle_price
    )?;

    // get the updated option price based on changes in the underlying asset
    let updated_oracle_mark_price = get_mark_price(
        *market,
        market_data,
        oracle_price,
        market_data.mark_volatility
    )?;
    market_data.mark_price = updated_oracle_mark_price;
    market_data.mark_price_ts = now;

    // get the impact that the order has on volatility
    let (new_vol, avg_vol_fill) = get_volatility_impact(
        order_side,
        direction,
        quote_amount,
        base_amount,
        updated_oracle_mark_price,
        *market,
        exposure_start,
        market_data.mark_volatility
    )?;
    market_data.mark_volatility = new_vol;

    // get the new mark price based on changes in volatility
    let updated_order_mark_price = get_mark_price(
        *market,
        market_data,
        oracle_price,
        new_vol
    )?;
    market_data.mark_price = updated_order_mark_price;
    market_data.mark_price_ts = now;

    let avg_fill_price = get_mark_price(
        *market,
        market_data,
        oracle_price,
        avg_vol_fill
    )?;

    let (fill_amount_base, fill_amount_quote) =
        if direction == PositionChangeDirection::Increase {
            let temp_fill_amount_quote = base_amount
                .checked_mul(u64::pow(10, market.collateral_decimals))
                .ok_or_else(math_error!())?
                .checked_div(avg_fill_price)
                .ok_or_else(math_error!())?;
            (base_amount, temp_fill_amount_quote)
        } else { // direction == PositionChange::Decrease
            let temp_fill_amount_base = quote_amount
                .checked_mul(avg_fill_price)
                .ok_or_else(math_error!())?
                .checked_div(u64::pow(10, market.collateral_decimals))
                .ok_or_else(math_error!())?;
            (temp_fill_amount_base, quote_amount)
        };

    // fees: if position decrease (i.e. using assets to make a trade) then take the fee out after the trade
    let fee_from_decrease = {
        // calculate fees
        let base_amount_fee = fill_amount_base
            .checked_mul(DEFAULT_FEE_NUMERATOR).ok_or_else(math_error!())?
            .checked_div(DEFAULT_PRECISION_U64).ok_or_else(math_error!())?;

        base_amount_fee
    };

    let mut fee_from_liquidation = {
        // calculate fees
        let base_amount_fee = fill_amount_base
            .checked_mul(LIQUIDATION_FEE_NUMERATOR).ok_or_else(math_error!())?
            .checked_div(DEFAULT_PRECISION_U64).ok_or_else(math_error!())?;

        base_amount_fee
    };

    // for token transfers below, is modified based on calcs for decreasing a short position
    let mut transfer_amount = fill_amount_base;
    let mut funding_amount_payout = 0i64;

    // record all collateral/postion/price changes
    if order_side == OrderSide::Long && direction == PositionChangeDirection::Increase {
        market_data.quote_asset_amount_long += fill_amount_quote as i64;

        position.quote_asset_amount = position.quote_asset_amount + (fill_amount_quote as i64);
        position.total_collateral_deposits += fill_amount_base as i64;

    } else if order_side == OrderSide::Long && direction == PositionChangeDirection::Decrease {
        market_data.quote_asset_amount_long -= fill_amount_quote as i64;

        // get the proportion of the total user's position that was decreased
        let reduction_prop = fill_amount_quote * DEFAULT_PRECISION_U64 / (position.quote_asset_amount.abs() as u64);

        // translate the proportion of assets decreased into the portion of the collateral the user deposited
        let total_collateral_deposits_prop = ((position.total_collateral_deposits as u64 * reduction_prop) / DEFAULT_PRECISION_U64) as i64;
        let additional_collateral_deposits_prop = ((position.additional_collateral_deposits as u64 * reduction_prop) / DEFAULT_PRECISION_U64) as i64;
        let funding_rate_prop = (position.last_cumulative_funding as i64 * (reduction_prop as i64)) / (DEFAULT_PRECISION_U64 as i64);
        funding_amount_payout = funding_rate_prop;

        // get the balance/profit of the proportion that was decreased
        let balance = (fill_amount_base as i64) + funding_rate_prop + additional_collateral_deposits_prop;

        // if the balance is negative (and the position wasn't already liquidated) then set it to zero
        if balance > 0 {
            transfer_amount = balance as u64;
        } else {
            transfer_amount = 0;
        }

        position.quote_asset_amount -= fill_amount_quote as i64;
        position.total_collateral_deposits -= total_collateral_deposits_prop;
        position.additional_collateral_deposits -= additional_collateral_deposits_prop;
        position.last_cumulative_funding -= funding_rate_prop;

    } else if order_side == OrderSide::Short && direction == PositionChangeDirection::Increase {

        market_data.quote_asset_amount_short += fill_amount_quote as i64;

        position.quote_asset_amount = position.quote_asset_amount - (fill_amount_quote as i64);
        position.total_collateral_deposits += fill_amount_base as i64;

    } else { // order_side == OrderSide::Short && direction == PositionChangeDirection::Decrease
        market_data.quote_asset_amount_short -= fill_amount_quote as i64;

            // get the proportion of the total user's position that was decreased
            let reduction_prop = fill_amount_quote * DEFAULT_PRECISION_U64 / (position.quote_asset_amount.abs() as u64);

            // translate the proportion of assets decreased into the portion of the collateral the user deposited
            let total_collateral_deposits_prop = ((position.total_collateral_deposits as u64 * reduction_prop) / DEFAULT_PRECISION_U64) as i64;
            let additional_collateral_deposits_prop = ((position.additional_collateral_deposits as u64 * reduction_prop) / DEFAULT_PRECISION_U64) as i64;
            let funding_rate_prop = (position.last_cumulative_funding as i64 * (reduction_prop as i64)) / (DEFAULT_PRECISION_U64 as i64);
            funding_amount_payout = funding_rate_prop;

            // get the balance/profit of the proportion that was decreased
            let balance = total_collateral_deposits_prop * 2 - additional_collateral_deposits_prop - (fill_amount_base as i64) + funding_rate_prop;

            // if the balance is negative (and the position wasn't already liquidated) then set it to zero
            if balance > 0 {
                transfer_amount = balance as u64;
            } else {
                transfer_amount = 0;
            }

        position.quote_asset_amount += fill_amount_quote as i64;
        position.total_collateral_deposits -= total_collateral_deposits_prop;
        position.additional_collateral_deposits -= additional_collateral_deposits_prop;
        position.last_cumulative_funding -= funding_rate_prop;
    }

    if market_data.quote_asset_amount_long < 0 {
        // market_data.quote_asset_amount_long = 0;
        return err!(ErrorCode::NegativeAssetCalculation);
    }
    if market_data.quote_asset_amount_short < 0 {
        // market_data.quote_asset_amount_short = 0;
        return err!(ErrorCode::NegativeAssetCalculation);
    }
    market_data.quote_asset_amount_net = market_data.quote_asset_amount_long - market_data.quote_asset_amount_short;

    {
        let seeds = &[ctx.accounts.market_collateral_vault.to_account_info().key.as_ref(), &[market_data.collateral_vault_nonce]];
        let signer_seeds = &[&seeds[..]];

        // if the assets don't cover the debt, then don't transfer anything
        if transfer_amount as i64 + position.last_cumulative_funding > 0i64 {
            transfer_amount = (transfer_amount as i64 + position.last_cumulative_funding) as u64;
        } else {
            transfer_amount = 0;
        }

        // if the remaining assets don't cover the fee, then don't transfer anything
        if transfer_amount > fee_from_decrease {
            transfer_amount = transfer_amount - fee_from_decrease;
        } else {
            transfer_amount = 0;
        }

        // if the remaining assets are less than the liquidation fee, then the liquidator gets whatever is left
        if transfer_amount < fee_from_liquidation {
            fee_from_liquidation = transfer_amount;
        }

        ctx.accounts.user_pda.collateral = ctx.accounts.user_pda.collateral + ((transfer_amount - fee_from_liquidation) as i64);

        if fee_from_liquidation > 0 {
            ctx.accounts.liquidatooor_pda.collateral = ctx.accounts.liquidatooor_pda.collateral + (fee_from_liquidation as i64);
        }

        // if transfer amount is 0 don't do the transfer and forget the fees, our fault for not liquidating sooner
        if transfer_amount > 0 {
            // transfer collateral from market vault to global vault
            token::transfer(
                ctx.accounts.into_market_to_global_transfer().with_signer(signer_seeds),
                transfer_amount,
            )?;

            // transfer fees to: collateral vault? they're already there.

            // transfer fees to: insurance vault
            let insurance_vault_fee = (INSURANCE_FEE_PROP_NUMERATOR * fee_from_decrease) / DEFAULT_PRECISION_U64;
            token::transfer(
                ctx.accounts.into_market_to_insurance_transfer().with_signer(signer_seeds),
                insurance_vault_fee,
            )?;

            // transfer fees to: treasury vault
            let treasury_vault_fee = (TREASURY_FEE_PROP_NUMERATOR * fee_from_decrease) / DEFAULT_PRECISION_U64;
            token::transfer(
                ctx.accounts.into_market_to_treasury_transfer().with_signer(signer_seeds),
                treasury_vault_fee,
            )?;
        }
    }

    // make sure to 'save' changes, this is probably avoidable with correct mut vars... but i'm bad at rust :/
    if market_data.side == OptionSide::Call {
        market.call_market_data = market_data;
    } else {
        market.put_market_data = market_data;
    };
    user_positions.positions[position.position_index as usize] = position;

    // add history records
    user_history.append(
        OrderRecord {
            market_index: market.index,
            option_side: option_side,
            order_side: order_side,
            position_change_direction: direction,
            quote_amount: (fill_amount_quote as i64) * quote_amount_input.signum(),
            base_amount: fill_amount_base,
            collateral_deposits: 0i64,
            collateral_returned: 0i64,
            cumulative_funding: funding_amount_payout,
            fee: fee_from_decrease + fee_from_liquidation,
            ts: now,
        
            // upgrade-ability
            padding0: 0u64,
            padding1: 0u64,
            padding2: 0i64,
            padding3: 0i64,
        }
    )?;

    // check that an increase in exposure hasn't pushed exposure past the max
    let exposure_end = market.get_exposure(
        option_side,
        ctx.accounts.market_collateral_vault.amount,
        oracle_price
    )?;

    // make sure that this trade didn't push exposure past the max
    if (exposure_start.status == ExposureStatus::BelowTarget || exposure_start.status == ExposureStatus::AboveTarget) &&
        (exposure_end.status == ExposureStatus::AboveMax || exposure_end.status == ExposureStatus::Delever) {
        return err!(ErrorCode::MarketExposureAboveMax);
    }

    // reset the position struct so that it can be used for future positions
    if close_position {
        if position.quote_asset_amount != 0i64 || position.total_collateral_deposits != 0i64 {
            return err!(ErrorCode::NonZeroCollateralAfterClose);
        }

        // reset the position struct so that it can be used for future positions
        position.active = false;
        position.total_collateral_deposits = 0;
        position.additional_collateral_deposits = 0;
        position.last_cumulative_funding = 0;
        position.last_funding_ts = 0;

        // make sure to 'save' changes, this is probably avoidable with correct mut vars... but i'm bad at rust :/
        user_positions.positions[position.position_index as usize] = position;
    }

    Ok(())
}

impl<'info> PositionLiquidate<'info> {
    fn into_market_to_global_transfer(&self) -> CpiContext<'_, '_, '_, 'info, token::Transfer<'info>> {
        let cpi_accounts = token::Transfer {
            from: self.market_collateral_vault.to_account_info(),
            to: self.global_collateral_vault.to_account_info(),
            authority: self.market_collateral_vault_authority.to_account_info(),
        };
        let cpi_program = self.token_program.to_account_info();
        CpiContext::new(cpi_program, cpi_accounts)
    }

    fn into_market_to_insurance_transfer(&self) -> CpiContext<'_, '_, '_, 'info, token::Transfer<'info>> {
        let cpi_accounts = token::Transfer {
            from: self.market_collateral_vault.to_account_info(),
            to: self.insurance_vault.to_account_info(),
            authority: self.market_collateral_vault_authority.to_account_info(),
        };
        let cpi_program = self.token_program.to_account_info();
        CpiContext::new(cpi_program, cpi_accounts)
    }

    fn into_market_to_treasury_transfer(&self) -> CpiContext<'_, '_, '_, 'info, token::Transfer<'info>> {
        let cpi_accounts = token::Transfer {
            from: self.market_collateral_vault.to_account_info(),
            to: self.treasury_vault.to_account_info(),
            authority: self.market_collateral_vault_authority.to_account_info(),
        };
        let cpi_program = self.token_program.to_account_info();
        CpiContext::new(cpi_program, cpi_accounts)
    }
}