extern crate anchor_lang;
extern crate anchor_spl;
extern crate solana_program;

use anchor_lang::prelude::*;

pub mod instructions;
pub mod state;
pub mod utils;
pub mod error;

use crate::instructions::*;
use crate::state::*;

declare_id!("tides1eCHZZ1wTJpFz3NbeGmN6hbNSeB1cwcTuar22w");

#[program]
pub mod tides {
    use super::*;

    pub fn initialize(
        ctx: Context<Initialize>,
    ) -> Result<()> {
        initialize::handler(
            ctx,
        )
    }

    pub fn user_create(
        ctx: Context<UserCreate>,
    ) -> Result<()> {
        user_create::handler(
            ctx,
        )
    }

    pub fn user_deposit(
        ctx: Context<UserDeposit>,
        deposit_amount: u64,
    ) -> Result<()> {
        user_deposit::handler(
            ctx,
            deposit_amount,
        )
    }

    pub fn user_withdraw(
        ctx: Context<UserWithdraw>,
        withdraw_amount: u64,
    ) -> Result<()> {
        user_withdraw::handler(
            ctx,
            withdraw_amount,
        )
    }

    pub fn market_add(
        ctx: Context<MarketAdd>,
        initial_mark_price: u64,
        initial_mark_volatility: u64,
        symbol_quote: String,
        symbol_base: String,
    ) -> Result<()> {
        market_add::handler(
            ctx,
            initial_mark_price,
            initial_mark_volatility,
            symbol_quote,
            symbol_base
        )
    }

    pub fn market_pause(
        ctx: Context<MarketPause>,
        market_index: u64,
    ) -> Result<()> {
        market_pause::handler(
            ctx,
            market_index
        )
    }

    pub fn market_close<'info>(
        ctx: Context<MarketClose>,
        market_index: u64,
    ) -> Result<()> {
        market_close::handler(
            ctx,
            market_index
        )
    }

    pub fn market_resume(
        ctx: Context<MarketResume>,
        market_index: u64,
    ) -> Result<()> {
        market_resume::handler(
            ctx,
            market_index
        )
    }

    pub fn exchange_pause(
        ctx: Context<ExchangePause>,
    ) -> Result<()> {
        exchange_pause::handler(
            ctx
        )
    }

    pub fn exchange_resume(
        ctx: Context<ExchangeResume>,
    ) -> Result<()> {
        exchange_resume::handler(
            ctx
        )
    }

    pub fn markets_destroy(
        ctx: Context<MarketsDestroy>,
    ) -> Result<()> {
        markets_destroy::handler(
            ctx,
        )
    }

    pub fn market_side_deposit(
        ctx: Context<MarketSideDeposit>,
        option_side: OptionSide,
        deposit_amount: u64,
    ) -> Result<()> {
        market_side_deposit::handler(
            ctx,
            option_side,
            deposit_amount,
        )
    }

    pub fn market_side_withdraw(
        ctx: Context<MarketSideWithdraw>,
        market_index: u64,
        option_side: OptionSide,
        withdraw_amount: u64,
    ) -> Result<()> {
        market_side_withdraw::handler(
            ctx,
            market_index,
            option_side,
            withdraw_amount,
        )
    }

    pub fn collateral_vault_position_open(
        ctx: Context<CollateralVaultPositionOpen>,
        market_index: u64,
        option_side: OptionSide,
        deposit_amount: u64,
    ) -> Result<()> {
        collateral_vault_position_open::handler(
            ctx,
            market_index,
            option_side,
            deposit_amount,
        )
    }

    pub fn collateral_vault_position_close(
        ctx: Context<CollateralVaultPositionClose>,
    ) -> Result<()> {
        collateral_vault_position_close::handler(
            ctx,
        )
    }

    pub fn insurance_withdraw(
        ctx: Context<InsuranceWithdraw>,
        withdraw_amount: u64,
    ) -> Result<()> {
        insurance_withdraw::handler(
            ctx,
            withdraw_amount,
        )
    }

    pub fn treasury_withdraw(
        ctx: Context<TreasuryWithdraw>,
        withdraw_amount: u64,
    ) -> Result<()> {
        treasury_withdraw::handler(
            ctx,
            withdraw_amount,
        )
    }

    pub fn global_collateral_withdraw(
        ctx: Context<GlobalCollateralWithdraw>,
        withdraw_amount: u64,
    ) -> Result<()> {
        global_collateral_withdraw::handler(
            ctx,
            withdraw_amount,
        )
    }

    pub fn position_change<'info>(
        ctx: Context<'_, '_, '_, 'info, PositionChange<'info>>,
        market_index: u64,
        option_side: OptionSide,
        quote_amount: i64,
        base_amount: u64,
        slippage_tolerance: u64,
        close_position: bool,
        reduce_only: bool,
    ) -> Result<()> {
        position_change::handler(
            ctx,
            market_index,
            option_side,
            quote_amount,
            base_amount,
            slippage_tolerance,
            close_position,
            reduce_only
        )
    }

    pub fn position_add_collateral<'info>(
        ctx: Context<'_, '_, '_, 'info, PositionAddCollateral<'info>>,
        market_index: u64,
        option_side: OptionSide,
        collateral_amount: u64,
    ) -> Result<()> {
        position_add_collateral::handler(
            ctx,
            market_index,
            option_side,
            collateral_amount
        )
    }

    pub fn position_delever(
        ctx: Context<PositionDelever>,
    ) -> Result<()> {
        position_delever::handler(
            ctx,
        )
    }

    pub fn position_liquidate<'info>(
        ctx: Context<'_, '_, '_, 'info, PositionLiquidate<'info>>,
        market_index: u64,
        option_side: OptionSide,
        quote_amount: i64,
        base_amount: u64,
    ) -> Result<()> {
        position_liquidate::handler(
            ctx,
            market_index,
            option_side,
            quote_amount,
            base_amount,
        )
    }

    pub fn market_stats_update(
        ctx: Context<MarketStatsUpdate>,
        market_index: u64,
    ) -> Result<()> {
        market_stats_update::handler(
            ctx,
            market_index
        )
    }
    
}