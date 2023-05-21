use anchor_lang::prelude::*;
use anchor_spl::associated_token::{self, AssociatedToken};
use anchor_spl::token::{Mint, Token, TokenAccount, self};
use crate::error::ErrorCode;
use crate::state::*;

#[derive(Accounts)]
pub struct InsuranceWithdraw<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    #[account(
        init_if_needed,
        associated_token::mint = collateral_mint,
        associated_token::authority = admin,
        payer = admin,
        constraint = admin.key() == admin_ata.owner
    )]
    pub admin_ata: Account<'info, TokenAccount>,
    #[account(
        mut,
        seeds = [CONFIG_SEED],
        bump,
        has_one = admin,
        has_one = insurance_vault,
        has_one = insurance_vault_authority,
    )]
    pub config: Box<Account<'info, Config>>,
    #[account(
        mut,
        seeds = [INSURANCE_VAULT_SEED],
        bump,
    )]
    pub insurance_vault: Account<'info, TokenAccount>,
    /// CHECK:
    pub insurance_vault_authority: AccountInfo<'info>,
    #[account(
        constraint = &config.collateral_mint.eq(&collateral_mint.key())
    )]
    pub collateral_mint: Account<'info, Mint>,
    #[account(address = associated_token::ID)]
    pub associated_token_program: Program<'info, AssociatedToken>,
    #[account(address = token::ID)]
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<InsuranceWithdraw>,
    withdraw_amount: u64,
) -> Result<()> {
    if ctx.accounts.insurance_vault.owner != *ctx.accounts.insurance_vault_authority.to_account_info().key {
        return err!(ErrorCode::InvalidInsuranceAccountAuthority);
    }

    let seeds = &[ctx.accounts.insurance_vault.to_account_info().key.as_ref(), &[ctx.accounts.config.insurance_vault_nonce]];
    let signer_seeds = &[&seeds[..]];

    token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            token::Transfer {
                from: ctx.accounts.insurance_vault.to_account_info(),
                to: ctx.accounts.admin_ata.to_account_info(),
                authority: ctx.accounts.insurance_vault_authority.to_account_info(),
            },
        ).with_signer(signer_seeds),
        withdraw_amount,
    )?;

    Ok(())
}