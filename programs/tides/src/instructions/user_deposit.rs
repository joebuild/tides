use anchor_lang::prelude::*;
use anchor_spl::associated_token::{AssociatedToken, self};
use anchor_spl::token;
use anchor_spl::token::{Mint, Token, TokenAccount};

use crate::{state::*, math_error};
use crate::error::ErrorCode;

#[derive(Accounts)]
#[instruction(
    deposit_amount: u64,
)]
pub struct UserDeposit<'info> {
    #[account(
        mut,
        constraint = user.key() == user_pda.user
    )]
    pub user: Signer<'info>,
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
    #[account(
        mut,
        constraint = user.key() == user_ata.owner
    )]
    pub user_ata: Account<'info, TokenAccount>,
    #[account(
        mut,
        seeds = [COLLATERAL_VAULT_SEED],
        bump,
    )]
    pub collateral_vault: Box<Account<'info, TokenAccount>>,
    #[account(
        constraint = &config.collateral_mint.eq(&collateral_mint.key())
    )]
    pub collateral_mint: Account<'info, Mint>,
    #[account(
        mut,
        seeds = [CONFIG_SEED],
        bump,
    )]
    pub config: Box<Account<'info, Config>>,
    #[account(address = associated_token::ID)]
    pub associated_token_program: Program<'info, AssociatedToken>,
    #[account(address = token::ID)]
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<UserDeposit>,
   deposit_amount: u64,
) -> Result<()> {

    if ctx.accounts.config.exchange_paused {
        return err!(ErrorCode::ExchangePaused);
    }

    token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            token::Transfer {
                from: ctx.accounts.user_ata.to_account_info(),
                to: ctx.accounts.collateral_vault.to_account_info(),
                authority: ctx.accounts.user.to_account_info(),
            },
        ),
        deposit_amount,
    )?;

    ctx.accounts.user_pda.collateral += deposit_amount as i64;
    ctx.accounts.user_pda.cumulative_deposits += deposit_amount;

    let net_deposits = ctx.accounts.user_pda.cumulative_deposits.checked_sub(ctx.accounts.user_pda.cumulative_withdrawals).ok_or_else(math_error!())?;

    if net_deposits > DEPOSIT_MAX_BETA && Clock::get().unwrap().epoch != 0u64 {
        return err!(ErrorCode::UserMaxDeposit);
    }

    Ok(())
}
