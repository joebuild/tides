use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount, self};
use pyth_sdk_solana::{load_price_feed_from_account_info, PriceFeed, Price, PriceStatus};

use crate::{state::*, math_error};
use crate::error::ErrorCode;

#[derive(Accounts)]
pub struct MarketAdd<'info> {
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
    pub quote_mint: Box<Account<'info, Mint>>,
    pub collateral_mint: Box<Account<'info, Mint>>,
    #[account(
        init,
        seeds = [
            CALL_SEED,
            COLLATERAL_VAULT_SEED,
            quote_mint.key().as_ref()
        ],
        bump,
        payer = admin,
        token::mint = collateral_mint,
        token::authority = call_collateral_vault_authority
    )]
    pub call_collateral_vault: Box<Account<'info, TokenAccount>>,
    /// CHECK:
    pub call_collateral_vault_authority: AccountInfo<'info>,
    #[account(zero)]
    pub call_market_funding_data: AccountLoader<'info, FundingData>,
    #[account(
        init,
        seeds = [
            PUT_SEED,
            COLLATERAL_VAULT_SEED,
            quote_mint.key().as_ref()
        ],
        bump,
        payer = admin,
        token::mint = collateral_mint,
        token::authority = put_collateral_vault_authority
    )]
    pub put_collateral_vault: Box<Account<'info, TokenAccount>>,
    /// CHECK:
    pub put_collateral_vault_authority: AccountInfo<'info>,
    #[account(zero)]
    pub put_market_funding_data: AccountLoader<'info, FundingData>,
    /// CHECK:
    pub oracle_price_feed: AccountInfo<'info>,
    #[account(address = token::ID)]
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<MarketAdd>,
    initial_mark_price: u64,
    initial_mark_volatility: u64,
    symbol_quote: String,
    symbol_base: String,
) -> Result<()> {
    let markets = &mut ctx.accounts.markets.load_mut()?;

    let market_index = markets.markets
        .iter()
        .position(|&m| !m.initialized)
        .unwrap();

    let market = &markets.markets[market_index as usize];

    let call_funding_data = &mut ctx.accounts.call_market_funding_data.load_init()?;
    call_funding_data.market_index = market_index as u16;
    call_funding_data.side = OptionSide::Call;
    call_funding_data.funding_records_tier_0.interval_sec = SECONDS_IN_DAY / 100;
    call_funding_data.funding_records_tier_1.interval_sec = (SECONDS_IN_DAY / 100) * 10;
    call_funding_data.funding_records_tier_2.interval_sec = (SECONDS_IN_DAY / 100) * 10 * 10;

    let put_funding_data = &mut ctx.accounts.put_market_funding_data.load_init()?;
    put_funding_data.market_index = market_index as u16;
    put_funding_data.side = OptionSide::Put;
    put_funding_data.funding_records_tier_0.interval_sec = SECONDS_IN_DAY / 100;
    put_funding_data.funding_records_tier_1.interval_sec = (SECONDS_IN_DAY / 100) * 10;
    put_funding_data.funding_records_tier_2.interval_sec = (SECONDS_IN_DAY / 100) * 10 * 10;

    let now = Clock::get().unwrap().unix_timestamp.unsigned_abs();

    if market.initialized {
        return err!(ErrorCode::MarketIndexAlreadyInitialized);
    }

    let call_collateral_account_key = ctx.accounts.call_collateral_vault.to_account_info().key;
    let (call_collateral_account_authority, call_collateral_account_nonce) = Pubkey::find_program_address(&[call_collateral_account_key.as_ref()], ctx.program_id);

    if ctx.accounts.call_collateral_vault.owner != call_collateral_account_authority {
        return err!(ErrorCode::InvalidCollateralAccountAuthority);
    }

    let put_collateral_account_key = ctx.accounts.put_collateral_vault.to_account_info().key;
    let (put_collateral_account_authority, put_collateral_account_nonce) = Pubkey::find_program_address(&[put_collateral_account_key.as_ref()], ctx.program_id);

    if ctx.accounts.put_collateral_vault.owner != put_collateral_account_authority {
        return err!(ErrorCode::InvalidCollateralAccountAuthority);
    }

    let mut price_feed: PriceFeed = load_price_feed_from_account_info(&ctx.accounts.oracle_price_feed).unwrap();
    if Clock::get().unwrap().epoch == 0u64 {
        price_feed.status = PriceStatus::Trading; // FOR LOCAL TESTS
    }

    let oracle_price_obj: Price = price_feed.get_current_price().unwrap();
    let dec_scale_diff = i64::pow(10, (-oracle_price_obj.expo - ctx.accounts.collateral_mint.decimals as i32) as u32);
    assert!(-oracle_price_obj.expo >= ctx.accounts.collateral_mint.decimals as i32);
    
    let oracle_price = oracle_price_obj.price.abs().checked_div(dec_scale_diff).ok_or_else(math_error!())? as u64;

    let symbol_quote_bytes = symbol_quote.as_bytes();
    let symbol_base_bytes = symbol_base.as_bytes();

    let mut symbol_quote_byte_array = [0u8; 8];
    let mut symbol_base_byte_array = [0u8; 8];

    symbol_quote_byte_array[..symbol_quote_bytes.len()].copy_from_slice(&symbol_quote_bytes);
    symbol_base_byte_array[..symbol_base_bytes.len()].copy_from_slice(&symbol_base_bytes);

    let market = Market {
        initialized: true,
        index: market_index as u16,

        market_paused: false,

        mint_quote: ctx.accounts.quote_mint.to_account_info().key(),
        mint_base: ctx.accounts.collateral_mint.to_account_info().key(),
        
        oracle_price_feed: ctx.accounts.oracle_price_feed.to_account_info().key(),
        oracle_price: oracle_price,
        oracle_price_ts: now,

        ema_numerator_sum: oracle_price as u128,
        ema_denominator_sum: 1u128,
        ema_ts: now,

        call_market_data: MarketSideData {
            side: OptionSide::Call,
            collateral_vault: ctx.accounts.call_collateral_vault.to_account_info().key(),
            collateral_vault_authority: call_collateral_account_authority,
            collateral_vault_nonce: call_collateral_account_nonce,
            mark_price: initial_mark_price,
            mark_price_ts: now,
            quote_asset_amount_long: 0,
            quote_asset_amount_short: 0,
            quote_asset_amount_net: 0,
            funding_rate: 0,
            funding_rate_ts: now,
            funding_data: ctx.accounts.call_market_funding_data.to_account_info().key(),

            mark_volatility: initial_mark_volatility, // 4000000u64,

            current_depositor_collateral: 0u64,
            cumulative_fees_per_depositor_collateral: 0u64,
            cumulative_trading_difference_per_depositor_collateral: 0i64,
        },

        put_market_data: MarketSideData {
            side: OptionSide::Put,
            collateral_vault: ctx.accounts.put_collateral_vault.to_account_info().key(),
            collateral_vault_authority: put_collateral_account_authority,
            collateral_vault_nonce: put_collateral_account_nonce,
            mark_price: initial_mark_price,
            mark_price_ts: now,
            quote_asset_amount_long: 0,
            quote_asset_amount_short: 0,
            quote_asset_amount_net: 0,
            funding_rate: 0,
            funding_rate_ts: now,
            funding_data: ctx.accounts.put_market_funding_data.to_account_info().key(),

            mark_volatility: initial_mark_volatility,

            current_depositor_collateral: 0u64,
            cumulative_fees_per_depositor_collateral: 0u64,
            cumulative_trading_difference_per_depositor_collateral: 0i64,
        },

        funding_interval: FUNDING_INTERVAL_SEC,

        collateral_ratio_target: EXPOSURE_TARGET_NUMERATOR,
        collateral_ratio_max: EXPOSURE_MAX_NUMERATOR,
        collateral_ratio_delever: EXPOSURE_DELEVER_NUMERATOR,

        minimum_base_asset_trade_size: 0u64,

        collateral_mint: ctx.accounts.collateral_mint.to_account_info().key(),
        collateral_decimals: ctx.accounts.collateral_mint.decimals as u32,

        symbol_quote: symbol_quote_byte_array,
        symbol_base: symbol_base_byte_array,

        // upgrade-ability
        padding0: 0i64,
        padding1: 0i64,
    };

    markets.markets[market.index as usize] = market;

    Ok(())
}
