use anchor_lang::prelude::*;
use pyth_sdk_solana::{PriceFeed, PriceStatus, load_price_feed_from_account_info, Price};

use crate::{state::*, utils::{get_funding_fee, get_mark_price}, math_error};
use crate::error::ErrorCode;

#[derive(Accounts)]
pub struct MarketStatsUpdate<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
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
    pub call_funding_data: AccountLoader<'info, FundingData>,
    #[account(mut)]
    pub put_funding_data: AccountLoader<'info, FundingData>,
    /// CHECK:
    pub oracle_price_feed: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<MarketStatsUpdate>,
    market_index: u64,
) -> Result<()> {
    let now = Clock::get().unwrap().unix_timestamp.unsigned_abs();

    let markets = &mut ctx.accounts.markets.load_mut()?;
    let market = &mut markets.markets[market_index as usize];

    if market.market_paused {
        return err!(ErrorCode::MarketPaused);
    }

    if ctx.accounts.config.exchange_paused {
        return err!(ErrorCode::ExchangePaused);
    }

    let mut price_feed: PriceFeed = load_price_feed_from_account_info(&ctx.accounts.oracle_price_feed).unwrap();
    if Clock::get().unwrap().epoch == 0u64 {
        price_feed.status = PriceStatus::Trading; // JUST FOR DEV
    }

    let oracle_price_obj: Price = price_feed.get_current_price().unwrap();
    let dec_scale_diff = i64::pow(10, (-oracle_price_obj.expo - market.collateral_decimals as i32) as u32);
    let oracle_price = oracle_price_obj.price.abs().checked_div(dec_scale_diff).ok_or_else(math_error!())? as u64;

    market.oracle_price = oracle_price;
    market.oracle_price_ts = now;

    // update ema
    market.update_ema(oracle_price, now)?;

    // try to update call funding rate
    let call_funding_data = &mut ctx.accounts.call_funding_data.load_mut()?;
    if call_funding_data.funding_records_tier_0.can_add_forward_record(now)? {
        let updated_funding_rate = get_funding_fee(
            OptionSide::Call,
            market.call_market_data.mark_price,
            market.get_ema()?,
            oracle_price,
            SECONDS_IN_DAY / call_funding_data.funding_records_tier_0.interval_sec,
        )?;
        call_funding_data.update(updated_funding_rate, now)?;
        market.call_market_data.funding_rate = call_funding_data.get_current_funding_rate()?;
        market.call_market_data.funding_rate_ts = now;
    }

    // try to update put funding rate
    let put_funding_data = &mut ctx.accounts.put_funding_data.load_mut()?;
    if put_funding_data.funding_records_tier_0.can_add_forward_record(now)? {
        let updated_funding_rate = get_funding_fee(
            OptionSide::Put,
            market.put_market_data.mark_price,
            market.get_ema()?,
            oracle_price,
            SECONDS_IN_DAY / put_funding_data.funding_records_tier_0.interval_sec,
        )?;
        put_funding_data.update(updated_funding_rate, now)?;
        market.put_market_data.funding_rate = put_funding_data.get_current_funding_rate()?;
        market.put_market_data.funding_rate_ts = now;
    }

    // get the updated CALL option price based on changes in the underlying asset
    let updated_call_mark_price = get_mark_price(
        *market,
        market.call_market_data,
        oracle_price,
        market.call_market_data.mark_volatility
    )?;
    market.call_market_data.mark_price = updated_call_mark_price;
    market.call_market_data.mark_price_ts = now;

    // get the updated PUT option price based on changes in the underlying asset
    let updated_put_mark_price = get_mark_price(
        *market,
        market.put_market_data,
        oracle_price,
        market.put_market_data.mark_volatility
    )?;
    market.put_market_data.mark_price = updated_put_mark_price;
    market.put_market_data.mark_price_ts = now;

    Ok(())
}
