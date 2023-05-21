use anchor_lang::prelude::*;
use anchor_spl::associated_token::{self, AssociatedToken};
use anchor_spl::token::{Mint, Token, TokenAccount, self};

use crate::state::*;
use crate::error::ErrorCode;

#[derive(Accounts)]
pub struct MarketClose<'info> {
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
    /// CHECK:
    pub call_collateral_vault_authority: AccountInfo<'info>,
    #[account(
        mut,
        close = admin
    )]
    pub call_market_funding_data: AccountLoader<'info, FundingData>,
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
    #[account(
        mut,
        close = admin
    )]
    pub put_market_funding_data: AccountLoader<'info, FundingData>,
    #[account(address = associated_token::ID)]
    pub associated_token_program: Program<'info, AssociatedToken>,
    #[account(address = token::ID)]
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<MarketClose>,
    market_index: u64
) -> Result<()> {
    let markets = &mut ctx.accounts.markets.load_mut()?;
    let market = &markets.markets[market_index as usize];

    if !market.market_paused {
        return err!(ErrorCode::MarketNotPaused);
    }

    if market.call_market_data.quote_asset_amount_net != 0 || market.put_market_data.quote_asset_amount_net != 0 {
        return err!(ErrorCode::PositionsNotClosed);
    }

    if !market.initialized {
        return err!(ErrorCode::MarketIndexNotInitialized);
    }

    let call_collateral_account_key = ctx.accounts.call_collateral_vault.to_account_info().key;
    let (call_collateral_account_authority, _call_collateral_account_nonce) = Pubkey::find_program_address(&[call_collateral_account_key.as_ref()], ctx.program_id);

    if ctx.accounts.call_collateral_vault.owner != call_collateral_account_authority {
        return err!(ErrorCode::InvalidCollateralAccountAuthority);
    }

    let put_collateral_account_key = ctx.accounts.put_collateral_vault.to_account_info().key;
    let (put_collateral_account_authority, _put_collateral_account_nonce) = Pubkey::find_program_address(&[put_collateral_account_key.as_ref()], ctx.program_id);

    if ctx.accounts.put_collateral_vault.owner != put_collateral_account_authority {
        return err!(ErrorCode::InvalidCollateralAccountAuthority);
    }

    // verify that this is the correct market collateral vault
    if ctx.accounts.call_collateral_vault.to_account_info().key() != market.call_market_data.collateral_vault {
        return err!(ErrorCode::InvalidCollateralAccountForMarket);
    }

    if ctx.accounts.put_collateral_vault.to_account_info().key() != market.put_market_data.collateral_vault {
        return err!(ErrorCode::InvalidCollateralAccountForMarket);
    }

    // verify that this is the correct market collateral vault authority
    if ctx.accounts.call_collateral_vault_authority.to_account_info().key() != market.call_market_data.collateral_vault_authority {
        return err!(ErrorCode::InvalidCollateralAccountAuthorityForMarket);
    }

    if ctx.accounts.put_collateral_vault_authority.to_account_info().key() != market.put_market_data.collateral_vault_authority {
        return err!(ErrorCode::InvalidCollateralAccountAuthorityForMarket);
    }

    let call_seeds = &[ctx.accounts.call_collateral_vault.to_account_info().key.as_ref(), &[market.call_market_data.collateral_vault_nonce]];
    let call_signer_seeds = &[&call_seeds[..]];

    token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            token::Transfer {
                from: ctx.accounts.call_collateral_vault.to_account_info(),
                to: ctx.accounts.admin_ata.to_account_info(),
                authority: ctx.accounts.call_collateral_vault_authority.to_account_info(),
            },
        ).with_signer(call_signer_seeds),
        ctx.accounts.call_collateral_vault.amount,
    )?;

    let put_seeds = &[ctx.accounts.put_collateral_vault.to_account_info().key.as_ref(), &[market.put_market_data.collateral_vault_nonce]];
    let put_signer_seeds = &[&put_seeds[..]];

    token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            token::Transfer {
                from: ctx.accounts.put_collateral_vault.to_account_info(),
                to: ctx.accounts.admin_ata.to_account_info(),
                authority: ctx.accounts.put_collateral_vault_authority.to_account_info(),
            },
        ).with_signer(put_signer_seeds),
        ctx.accounts.put_collateral_vault.amount,
    )?;

    token::close_account(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            token::CloseAccount {
                account: ctx.accounts.call_collateral_vault.to_account_info(),
                destination: ctx.accounts.admin.to_account_info(),
                authority: ctx.accounts.call_collateral_vault_authority.to_account_info(),
            },
        ).with_signer(call_signer_seeds),
    )?;

    token::close_account(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            token::CloseAccount {
                account: ctx.accounts.put_collateral_vault.to_account_info(),
                destination: ctx.accounts.admin.to_account_info(),
                authority: ctx.accounts.put_collateral_vault_authority.to_account_info(),
            },
        ).with_signer(put_signer_seeds),
    )?;

    let market = Market::default();
    markets.markets[market_index as usize] = market;

    Ok(())
}
