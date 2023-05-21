use anchor_lang::prelude::*;

#[account]
#[derive(Default)]
pub struct Config {
    pub initialized: bool,
    pub admin: Pubkey,
    pub exchange_paused: bool,
    pub funding_paused: bool,
    pub collateral_mint: Pubkey,
    pub collateral_vault: Pubkey,
    pub collateral_vault_authority: Pubkey,
    pub collateral_vault_nonce: u8,
    pub deposit_history: Pubkey,
    pub trade_history: Pubkey,
    pub funding_payment_history: Pubkey,
    pub funding_rate_history: Pubkey,
    pub liquidation_history: Pubkey,
    pub insurance_vault: Pubkey,
    pub insurance_vault_authority: Pubkey,
    pub insurance_vault_nonce: u8,
    pub treasury_vault: Pubkey,
    pub treasury_vault_authority: Pubkey,
    pub treasury_vault_nonce: u8,
    pub markets: Pubkey,

    // upgrade-ability
    pub padding0: u64,
    pub padding1: u64,
    pub padding2: u64,
    pub padding3: u64,
}
