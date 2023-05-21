use anchor_lang::prelude::*;
use anchor_spl::associated_token::{self, AssociatedToken};
use anchor_spl::token::{Mint, Token, TokenAccount, self};
use crate::error::ErrorCode;
use crate::state::*;

#[derive(Accounts)]
pub struct MarketSideWithdraw<'info> {
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
    #[account(address = associated_token::ID)]
    pub associated_token_program: Program<'info, AssociatedToken>,
    #[account(address = token::ID)]
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<MarketSideWithdraw>,
    market_index: u64,
    option_side: OptionSide,
    withdraw_amount: u64,
) -> Result<()> {
    let markets = &mut ctx.accounts.markets.load_mut()?;
    let market = &mut markets.markets[market_index as usize];

    let market_data = if option_side == OptionSide::Call {
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

    let seeds = &[side_collateral_vault_ac_info.key.as_ref(), &[market_data.collateral_vault_nonce]];
    let signer_seeds = &[&seeds[..]];

    token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            token::Transfer {
                from: side_collateral_vault_ac_info,
                to: ctx.accounts.admin_ata.to_account_info(),
                authority: side_collateral_vault_authority_ac_info,
            },
        ).with_signer(signer_seeds),
        withdraw_amount,
    )?;

    Ok(())
}