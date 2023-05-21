use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount, self};

use crate::{state::*, math_error};
use crate::error::ErrorCode;

#[derive(Accounts)]
pub struct CollateralVaultPositionClose<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(
        mut,
        constraint = user.key() == user_ata.owner
    )]
    pub user_ata: Account<'info, TokenAccount>,
    #[account(
        mut,
        has_one = user,
        has_one = config,
        has_one = markets,
        close = user,
    )]
    pub position: Account<'info, CollateralVaultPosition>,
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
    pub quote_mint: Box<Account<'info, Mint>>,
    #[account(
        constraint = &config.collateral_mint.eq(&collateral_mint.key())
    )]
    pub collateral_mint: Box<Account<'info, Mint>>,
    #[account(
        mut,
        seeds = [
            CALL_SEED,
            COLLATERAL_VAULT_SEED,
            quote_mint.key().as_ref()
        ],
        bump,
    )]
    pub call_collateral_vault: Box<Account<'info, TokenAccount>>,
    /// CHECK:
    pub call_collateral_vault_authority: AccountInfo<'info>,
    #[account(
        mut,
        seeds = [
            PUT_SEED,
            COLLATERAL_VAULT_SEED,
            quote_mint.key().as_ref()
        ],
        bump,
    )]
    pub put_collateral_vault: Box<Account<'info, TokenAccount>>,
    /// CHECK:
    pub put_collateral_vault_authority: AccountInfo<'info>,
    #[account(address = token::ID)]
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<CollateralVaultPositionClose>,
) -> Result<()> {
    let market_index = ctx.accounts.position.market_index;
    let option_side = ctx.accounts.position.side;

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

    let side_collateral_vault_ac_info = if option_side == OptionSide::Call {
        ctx.accounts.call_collateral_vault.to_account_info()
    } else {
        ctx.accounts.put_collateral_vault.to_account_info()
    };

    let side_collateral_vault_authority_ac_info = if option_side == OptionSide::Call {
        ctx.accounts.call_collateral_vault_authority.to_account_info()
    } else {
        ctx.accounts.put_collateral_vault_authority.to_account_info()
    };

    // verify that this is the correct market collateral vault
    if side_collateral_vault_ac_info.key() != market_data.collateral_vault {
        return err!(ErrorCode::InvalidCollateralAccountForMarket);
    }

    // verify that this is the correct market collateral vault authority
    if side_collateral_vault_authority_ac_info.key() != market_data.collateral_vault_authority {
        return err!(ErrorCode::InvalidCollateralAccountAuthorityForMarket);
    }

    let position = &mut ctx.accounts.position;

    let net_cumulative_fee_per = market_data.cumulative_fees_per_depositor_collateral
        .checked_sub(position.cumulative_fees_per_depositor_collateral_at_deposit).ok_or_else(math_error!())?;

    let total_earned_fees = position.deposit_amount
        .checked_mul(net_cumulative_fee_per).ok_or_else(math_error!())?
        .checked_div(u64::pow(10, market.collateral_decimals)).ok_or_else(math_error!())?;

    let net_cumulative_trading_diff_per = market_data.cumulative_trading_difference_per_depositor_collateral
        .checked_sub(position.cumulative_trading_difference_per_depositor_collateral_at_deposit).ok_or_else(math_error!())?;

    let total_trading_diff = (position.deposit_amount as i64)
        .checked_mul(net_cumulative_trading_diff_per).ok_or_else(math_error!())?
        .checked_div(i64::pow(10, market.collateral_decimals)).ok_or_else(math_error!())?;

    let total_position_value = (position.deposit_amount as i64)
        .checked_add(total_trading_diff).ok_or_else(math_error!())?
        .checked_add(total_earned_fees as i64).ok_or_else(math_error!())?;

    if total_position_value.is_positive() {
        let seeds = &[side_collateral_vault_ac_info.key.as_ref(), &[market_data.collateral_vault_nonce]];
        let signer_seeds = &[&seeds[..]];

        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                token::Transfer {
                    from: side_collateral_vault_ac_info,
                    to: ctx.accounts.user_ata.to_account_info(),
                    authority: side_collateral_vault_authority_ac_info,
                },
            ).with_signer(signer_seeds),
            total_position_value as u64,
        )?;
    }

    market_data.current_depositor_collateral = market_data.current_depositor_collateral
        .checked_sub(position.deposit_amount).ok_or_else(math_error!())?;

    // make sure to 'save' changes, this is probably avoidable with correct mut vars...
    if market_data.side == OptionSide::Call {
        market.call_market_data = market_data;
    } else {
        market.put_market_data = market_data;
    };

    Ok(())
}
