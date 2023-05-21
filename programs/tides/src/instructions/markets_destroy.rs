use anchor_lang::prelude::*;

use crate::state::*;
use crate::error::ErrorCode;

#[derive(Accounts)]
pub struct MarketsDestroy<'info> {
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
        constraint = &config.markets.eq(&markets.key()),
        close = admin
    )]
    pub markets: AccountLoader<'info, Markets>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<MarketsDestroy>,
) -> Result<()> {
    let markets = &mut ctx.accounts.markets.load_mut()?;

    for market in markets.markets.iter() {
        if market.initialized {
            return err!(ErrorCode::MarketStillInitialized);
        }
    }

    Ok(())
}
