use anchor_lang::prelude::*;

use crate::state::{Markets, Config, CONFIG_SEED};

#[derive(Accounts)]
pub struct MarketPause<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
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
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<MarketPause>,
    market_index: u64,
) -> Result<()> {
    let markets = &mut ctx.accounts.markets.load_mut()?;
    let market = &mut markets.markets[market_index as usize];

    market.market_paused = true;

    Ok(())
}
