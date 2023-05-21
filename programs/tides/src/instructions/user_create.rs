use std::mem::size_of;

use anchor_lang::prelude::*;
use crate::state::*;

#[derive(Accounts)]
pub struct UserCreate<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(
        init,
        seeds = [
            USER_PDA_SEED_PREFIX,
            user.key().as_ref()
        ],
        bump,
        payer = user,
        space = 8 + size_of::<User>()
    )]
    pub user_pda: Box<Account<'info, User>>,
    #[account(zero)]
    pub user_positions: AccountLoader<'info, UserPositions>,
    #[account(zero)]
    pub user_history: AccountLoader<'info, UserHistory>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<UserCreate>,
) -> Result<()> {
    let user_key = *ctx.accounts.user.to_account_info().key;

    let user_positions = &mut ctx.accounts.user_positions.load_init()?;
    user_positions.user = user_key;

    let user_history = &mut ctx.accounts.user_history.load_init()?;
    user_history.user = user_key;

    ctx.accounts.user_pda.user = user_key;
    ctx.accounts.user_pda.positions = ctx.accounts.user_positions.to_account_info().key();
    ctx.accounts.user_pda.history = ctx.accounts.user_history.to_account_info().key();

    Ok(())
}
