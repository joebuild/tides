use anchor_lang::prelude::*;
use spl_token::solana_program::pubkey::Pubkey;

use crate::OptionSide;

#[account]
#[derive(Default)]
pub struct CollateralVaultPosition {
    pub initialized: bool,

    pub user: Pubkey,
    pub config: Pubkey,

    pub markets: Pubkey,
    pub market_index: u16,
    pub side: OptionSide,

    pub collateral_mint: Pubkey,
    pub collateral_vault: Pubkey,

    pub deposit_amount: u64,
    pub deposit_timestamp: u64,

    pub cumulative_fees_per_depositor_collateral_at_deposit: u64,
    pub cumulative_trading_difference_per_depositor_collateral_at_deposit: i64,

    // upgrade-ability
    pub padding_0: Pubkey,
    pub padding_1: Pubkey,
    pub padding_2: u64,
    pub padding_3: u64,
    pub padding_4: i64,
}
