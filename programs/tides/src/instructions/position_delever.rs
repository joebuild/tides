use anchor_lang::prelude::*;

use crate::state::{CONFIG_SEED, Config, Markets};

#[derive(Accounts)]
pub struct PositionDelever<'info> {
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

pub fn handler(_ctx: Context<PositionDelever>,
) -> Result<()> {

    Ok(())
}
