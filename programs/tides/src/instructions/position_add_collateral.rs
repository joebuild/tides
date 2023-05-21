use anchor_lang::prelude::*;
use anchor_spl::token::{TokenAccount, self, Token};

use crate::state::*;
use crate::error::ErrorCode;
 
#[derive(Accounts)]
pub struct PositionAddCollateral<'info> {
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
    #[account(mut)]
    pub user_positions: AccountLoader<'info, UserPositions>,
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
    #[account(
        mut,
        seeds = [COLLATERAL_VAULT_SEED],
        bump,
    )]
    pub global_collateral_vault: Box<Account<'info, TokenAccount>>,
    #[account(mut)]
    pub market_collateral_vault: Box<Account<'info, TokenAccount>>,
    /// CHECK:
    #[account(
        constraint = &config.collateral_vault_authority.eq(&global_collateral_vault_authority.key())
    )]
    pub global_collateral_vault_authority: AccountInfo<'info>,
    #[account(address = token::ID)]
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn handler<'info>(ctx: Context<'_, '_, '_, 'info, PositionAddCollateral<'info>>,
    market_index: u64,
    option_side: OptionSide,
    collateral_amount: u64,
) -> Result<()> {
    // verify that this is the correct user_positions account
    let user_positions = &mut ctx.accounts.user_positions.load_mut()?;
    assert!(user_positions.user == ctx.accounts.user.to_account_info().key());

    let markets = &mut ctx.accounts.markets.load_mut()?;
    let market = &markets.markets[market_index as usize];

    if market.market_paused {
        return err!(ErrorCode::MarketPaused);
    }

    if ctx.accounts.config.exchange_paused {
        return err!(ErrorCode::ExchangePaused);
    }

    let market_data = if option_side == OptionSide::Call {
        market.call_market_data
    } else {
        market.put_market_data
    };

    // verify that this is the correct market collateral vault
    if ctx.accounts.market_collateral_vault.to_account_info().key() != market_data.collateral_vault {
        return err!(ErrorCode::InvalidCollateralAccountForMarket);
    }

    let position = &mut user_positions.positions.iter_mut()
        .find(|x| (x.market_index as u16) == market.index && x.side == option_side && x.active == true).unwrap();

    // verify that the user has the collateral to add
    if ctx.accounts.user_pda.collateral < collateral_amount as i64 {
        return err!(ErrorCode::InsufficientCollateral);
    }

    ctx.accounts.user_pda.collateral -= collateral_amount as i64 ;
    position.total_collateral_deposits += collateral_amount as i64;
    position.additional_collateral_deposits += collateral_amount as i64;

    let seeds = &[ctx.accounts.global_collateral_vault.to_account_info().key.as_ref(), &[ctx.accounts.config.collateral_vault_nonce]];
    let signer_seeds = &[&seeds[..]];
    
    // transfer additional collateral from global vault to market vault
    token::transfer(
        ctx.accounts.into_global_to_market_transfer().with_signer(signer_seeds),
        collateral_amount,
    )?;

    Ok(())
}

impl<'info> PositionAddCollateral<'info> {
    fn into_global_to_market_transfer(&self) -> CpiContext<'_, '_, '_, 'info, token::Transfer<'info>> {
        let cpi_accounts = token::Transfer {
            from: self.global_collateral_vault.to_account_info(),
            to: self.market_collateral_vault.to_account_info(),
            authority: self.global_collateral_vault_authority.to_account_info(),
        };
        let cpi_program = self.token_program.to_account_info();
        CpiContext::new(cpi_program, cpi_accounts)
    }
}