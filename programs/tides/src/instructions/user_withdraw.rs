use anchor_lang::prelude::*;
use anchor_spl::associated_token::{AssociatedToken, self};
use anchor_spl::token;
use anchor_spl::token::{Mint, Token, TokenAccount};

use crate::state::*;
use crate::error::ErrorCode;

#[derive(Accounts)]
#[instruction(
    amount: u64,
)]
pub struct UserWithdraw<'info> {
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
        init_if_needed,
        associated_token::mint = collateral_mint,
        associated_token::authority = user,
        payer = user,
        constraint = user.key() == user_ata.owner
    )]
    pub user_ata: Account<'info, TokenAccount>,
    #[account(
        mut,
        seeds = [COLLATERAL_VAULT_SEED],
        bump,
    )]
    pub collateral_vault: Account<'info, TokenAccount>,
    /// CHECK:
    pub collateral_vault_authority: AccountInfo<'info>,
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
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<UserWithdraw>,
   withdraw_amount: u64,
) -> Result<()> {

    if ctx.accounts.config.exchange_paused {
        return err!(ErrorCode::ExchangePaused);
    }

    assert!(ctx.accounts.user_pda.collateral >= withdraw_amount as i64);

    if ctx.accounts.collateral_vault.owner != *ctx.accounts.collateral_vault_authority.to_account_info().key {
        return err!(ErrorCode::InvalidCollateralAccountAuthority);
    }

    let seeds = &[ctx.accounts.collateral_vault.to_account_info().key.as_ref(), &[ctx.accounts.config.collateral_vault_nonce]];
    let signer_seeds = &[&seeds[..]];

    token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            token::Transfer {
                from: ctx.accounts.collateral_vault.to_account_info(),
                to: ctx.accounts.user_ata.to_account_info(),
                authority: ctx.accounts.collateral_vault_authority.to_account_info(),
            },
        ).with_signer(signer_seeds),
        withdraw_amount,
    )?;

    ctx.accounts.user_pda.collateral -= withdraw_amount as i64;
    ctx.accounts.user_pda.cumulative_withdrawals += withdraw_amount;

    Ok(())
}