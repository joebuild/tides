use std::mem::size_of;

use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount, self};

use crate::{state::*, math_error};
use crate::error::ErrorCode;

#[derive(Accounts)]
pub struct CollateralVaultPositionOpen<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(
        mut,
        constraint = user.key() == user_ata.owner
    )]
    pub user_ata: Account<'info, TokenAccount>,
    #[account(
        init,
        payer = user,
        space = 8 + size_of::<CollateralVaultPosition>(),
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
    #[account(address = token::ID)]
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<CollateralVaultPositionOpen>,
    market_index: u64,
    option_side: OptionSide,
    deposit_amount: u64,
) -> Result<()> {
    let now = Clock::get().unwrap().unix_timestamp.unsigned_abs();

    // verify that this position has not yet been initialized
    if ctx.accounts.position.initialized {
        return err!(ErrorCode::PositionAlreadyInitialized);
    }

    let side_collateral_vault_ac_info = if option_side == OptionSide::Call {
        ctx.accounts.call_collateral_vault.to_account_info()
    } else {
        ctx.accounts.put_collateral_vault.to_account_info()
    };

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

    ctx.accounts.position.initialized = true;
    ctx.accounts.position.user = ctx.accounts.user.key();
    ctx.accounts.position.config = ctx.accounts.config.key();
    ctx.accounts.position.markets = ctx.accounts.markets.key();
    ctx.accounts.position.market_index = market_index as u16;
    ctx.accounts.position.side = option_side;
    ctx.accounts.position.collateral_mint = ctx.accounts.collateral_mint.key();
    ctx.accounts.position.collateral_vault = side_collateral_vault_ac_info.key();

    ctx.accounts.position.deposit_amount = deposit_amount;
    ctx.accounts.position.deposit_timestamp = now;

    ctx.accounts.position.cumulative_fees_per_depositor_collateral_at_deposit = market_data.cumulative_fees_per_depositor_collateral;
    ctx.accounts.position.cumulative_trading_difference_per_depositor_collateral_at_deposit = market_data.cumulative_trading_difference_per_depositor_collateral;

    token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            token::Transfer {
                from: ctx.accounts.user_ata.to_account_info(),
                to: side_collateral_vault_ac_info,
                authority: ctx.accounts.user.to_account_info(),
            },
        ),
        deposit_amount,
    )?;

    market_data.current_depositor_collateral = market_data.current_depositor_collateral
        .checked_add(deposit_amount)
        .ok_or_else(math_error!())?;

    // make sure to 'save' changes, this is probably avoidable with correct mut vars...
    if market_data.side == OptionSide::Call {
        market.call_market_data = market_data;
    } else {
        market.put_market_data = market_data;
    };

    Ok(())
}
