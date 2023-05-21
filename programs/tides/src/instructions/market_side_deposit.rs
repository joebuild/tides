use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount, self};

use crate::state::*;

#[derive(Accounts)]
pub struct MarketSideDeposit<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(
        mut,
        constraint = user.key() == user_ata.owner
    )]
    pub user_ata: Account<'info, TokenAccount>,
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

pub fn handler(ctx: Context<MarketSideDeposit>,
    option_side: OptionSide,
    deposit_amount: u64,
) -> Result<()> {

    let side_collateral_vault_ac_info = if option_side == OptionSide::Call {
        ctx.accounts.call_collateral_vault.to_account_info()
    } else {
        ctx.accounts.put_collateral_vault.to_account_info()
    };

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

    Ok(())
}
