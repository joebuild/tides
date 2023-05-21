use anchor_lang::prelude::*;

use crate::state::{Config, CONFIG_SEED};

#[derive(Accounts)]
pub struct ExchangeResume<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    #[account(
        mut,
        seeds = [CONFIG_SEED],
        bump,
        has_one = admin
    )]
    pub config: Box<Account<'info, Config>>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<ExchangeResume>,
) -> Result<()> {

    ctx.accounts.config.exchange_paused = false;

    Ok(())
}
