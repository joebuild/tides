use anchor_lang::prelude::*;
use rust_decimal::Decimal;
use crate::utils::{to_scaled_u64, to_scaled_i64};
use crate::{state::*, math_error};
use crate::state::{DEFAULT_PRECISION_U64, MarketSideData};

pub fn get_lp_fees_per_dollar(market_data: MarketSideData, fees: u64, market_collateral: u64, collateral_decimals: u32) -> Result<u64> {

    let fees_d = Decimal::new(fees.try_into().unwrap(), collateral_decimals);

    let total_market_collateral = Decimal::new(market_collateral.try_into().unwrap(), collateral_decimals);
    let lp_depositor_collateral = Decimal::new(market_data.current_depositor_collateral.try_into().unwrap(), collateral_decimals);

    let fee_fraction = Decimal::new(COLLATERAL_FEE_PROP_NUMERATOR.try_into().unwrap(), 4)
        .checked_div(Decimal::new(DEFAULT_PRECISION_U64.try_into().unwrap(), 4)).ok_or_else(math_error!())?;

    let lp_fraction_of_collateral = lp_depositor_collateral
        .checked_div(total_market_collateral).ok_or_else(math_error!())?;

    assert!(lp_fraction_of_collateral < Decimal::ONE);    

    let lp_fees = fees_d
        .checked_mul(fee_fraction).ok_or_else(math_error!())?
        .checked_mul(lp_fraction_of_collateral).ok_or_else(math_error!())?;

    let lp_fees_per_dollar = lp_fees
        .checked_div(lp_depositor_collateral).ok_or_else(math_error!())?;

    let lp_fees_per_dollar_u64 = to_scaled_u64(lp_fees_per_dollar, collateral_decimals).unwrap();

    Ok(lp_fees_per_dollar_u64)
}

pub fn get_lp_trading_diff_per_dollar(market_data: MarketSideData, trade_difference: i64, market_collateral: u64, collateral_decimals: u32) -> Result<i64> {

    let trade_diff_d = Decimal::new(trade_difference.try_into().unwrap(), collateral_decimals);

    let total_market_collateral = Decimal::new(market_collateral.try_into().unwrap(), collateral_decimals);
    let lp_depositor_collateral = Decimal::new(market_data.current_depositor_collateral.try_into().unwrap(), collateral_decimals);

    let lp_fraction_of_collateral = lp_depositor_collateral
        .checked_div(total_market_collateral).ok_or_else(math_error!())?;

    assert!(lp_fraction_of_collateral < Decimal::ONE);    

    let lp_trade_diff = trade_diff_d
        .checked_mul(lp_fraction_of_collateral).ok_or_else(math_error!())?;

    let lp_trade_diff_per_dollar = lp_trade_diff
        .checked_div(lp_depositor_collateral).ok_or_else(math_error!())?;

    let lp_trade_diff_per_dollar_i64 = to_scaled_i64(lp_trade_diff_per_dollar, collateral_decimals).unwrap();

    Ok(lp_trade_diff_per_dollar_i64)
}
