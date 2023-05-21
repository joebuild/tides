use std::mem::size_of;
use anchor_lang::prelude::*;
use anchor_spl::{token::{Mint, Token, TokenAccount, self}};

use crate::state::*;
use crate::error::ErrorCode;

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    #[account(
        init_if_needed,
        seeds = [CONFIG_SEED],
        space = 8 + size_of::<Config>(),
        bump,
        payer = admin
    )]
    pub config: Box<Account<'info, Config>>,
    pub collateral_mint: Box<Account<'info, Mint>>,
    #[account(
        init_if_needed,
        seeds = [COLLATERAL_VAULT_SEED],
        bump,
        payer = admin,
        token::mint = collateral_mint,
        token::authority = collateral_vault_authority
    )]
    pub collateral_vault: Box<Account<'info, TokenAccount>>,
    /// CHECK:
    pub collateral_vault_authority: AccountInfo<'info>,
    #[account(
        init_if_needed,
        seeds = [INSURANCE_VAULT_SEED],
        bump,
        payer = admin,
        token::mint = collateral_mint,
        token::authority = insurance_vault_authority
    )]
    pub insurance_vault: Box<Account<'info, TokenAccount>>,
    /// CHECK:
    pub insurance_vault_authority: AccountInfo<'info>,
    #[account(
        init_if_needed,
        seeds = [TREASURY_VAULT_SEED],
        bump,
        payer = admin,
        token::mint = collateral_mint,
        token::authority = treasury_vault_authority
    )]
    pub treasury_vault: Box<Account<'info, TokenAccount>>,
    /// CHECK:
    pub treasury_vault_authority: AccountInfo<'info>,
    #[account(zero)]
    pub markets: AccountLoader<'info, Markets>,
    #[account(address = token::ID)]
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<Initialize>,
) -> Result<()> {
    let collateral_account_key = ctx.accounts.collateral_vault.to_account_info().key;
    let (collateral_account_authority, collateral_account_nonce) = Pubkey::find_program_address(&[collateral_account_key.as_ref()], ctx.program_id);

    if ctx.accounts.collateral_vault.owner != collateral_account_authority {
        return err!(ErrorCode::InvalidCollateralAccountAuthority);
    }

    let insurance_account_key = ctx.accounts.insurance_vault.to_account_info().key;
    let (insurance_account_authority, insurance_account_nonce) = Pubkey::find_program_address(&[insurance_account_key.as_ref()], ctx.program_id);

    if ctx.accounts.insurance_vault.owner != insurance_account_authority {
        return err!(ErrorCode::InvalidInsuranceAccountAuthority);
    }

    let treasury_account_key = ctx.accounts.treasury_vault.to_account_info().key;
    let (treasury_account_authority, treasury_account_nonce) = Pubkey::find_program_address(&[treasury_account_key.as_ref()], ctx.program_id);

    if ctx.accounts.treasury_vault.owner != treasury_account_authority {
        return err!(ErrorCode::InvalidTreasuryAccountAuthority);
    }

    let markets = &mut ctx.accounts.markets.load_init()?;
    markets.initialized = true;

    **ctx.accounts.config = Config {
        initialized: true,
        admin: *ctx.accounts.admin.key,
        funding_paused: false,
        exchange_paused: false,
        collateral_mint: *ctx.accounts.collateral_mint.to_account_info().key,
        collateral_vault: *collateral_account_key,
        collateral_vault_authority: collateral_account_authority,
        collateral_vault_nonce: collateral_account_nonce,
        deposit_history: Pubkey::default(),
        trade_history: Pubkey::default(),
        funding_rate_history: Pubkey::default(),
        funding_payment_history: Pubkey::default(),
        liquidation_history: Pubkey::default(),
        insurance_vault: *insurance_account_key,
        insurance_vault_authority: insurance_account_authority,
        insurance_vault_nonce: insurance_account_nonce,
        treasury_vault: *treasury_account_key,
        treasury_vault_authority: treasury_account_authority,
        treasury_vault_nonce: treasury_account_nonce,
        markets: *ctx.accounts.markets.to_account_info().key,

        padding0: 0,
        padding1: 0,
        padding2: 0,
        padding3: 0,
    };

    Ok(())
}
