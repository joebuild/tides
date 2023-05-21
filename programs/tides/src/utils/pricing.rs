use rust_decimal::prelude::*;
use anchor_lang::prelude::*;

use crate::{state::*, math_error};

use super::to_scaled_u64;

pub fn get_mark_price(
    market: Market,
    market_side_data: MarketSideData,
    oracle_price: u64,
    volatility: u64
) -> Result<u64> {
    // oracle price must be updated before this function call
    let oracle_price = Decimal::new(oracle_price.try_into().unwrap(), market.collateral_decimals);
    let mark_volatility = Decimal::new(volatility.try_into().unwrap(), VOLATILITY_PRECISION_DECIMALS);

    let ema_numerator = Decimal::from_i128_with_scale(market.ema_numerator_sum.try_into().unwrap(), 1); // scale here is 1 instead of "market.collateral_decimals" to fit in the u128
    let ema_denominator = Decimal::from_i128_with_scale(market.ema_denominator_sum.try_into().unwrap(), 1); // scale here is 1 instead of "market.collateral_decimals" to fit in the u128

    let strike = ema_numerator
        .checked_div(ema_denominator)
        .ok_or_else(math_error!())?
        .checked_div(Decimal::new(i64::pow(10, market.collateral_decimals), 0))
        .ok_or_else(math_error!())?;

    let s_over_k = oracle_price
        .checked_div(strike)
        .ok_or_else(math_error!())?;

    let vol_sq_over_2 = mark_volatility
        .checked_mul(mark_volatility)
        .ok_or_else(math_error!())?
        .checked_div(Decimal::TWO)
        .ok_or_else(math_error!())?;

    let d1 = s_over_k
        .checked_ln()
        .ok_or_else(math_error!())?
        .checked_add(vol_sq_over_2)
        .ok_or_else(math_error!())?
        .checked_div(mark_volatility)
        .ok_or_else(math_error!())?;

    let d2 = d1
        .checked_sub(mark_volatility)
        .ok_or_else(math_error!())?;

    let g = Decimal::from_str("0.57721").unwrap();

    let new_mark_price = if market_side_data.side == OptionSide::Call {
        let t1 = rust_decimal::MathematicalOps::norm_cdf(&d1)
            .checked_mul(oracle_price)
            .ok_or_else(math_error!())?;

        let t2 = rust_decimal::MathematicalOps::norm_cdf(&d2)
            .checked_mul(strike)
            .ok_or_else(math_error!())?;

        t1
            .checked_sub(t2)    
            .ok_or_else(math_error!())?
            .checked_mul(g)
            .ok_or_else(math_error!())?
    } else {
        let t1 = rust_decimal::MathematicalOps::norm_cdf(&-d2)
            .checked_mul(strike)
            .ok_or_else(math_error!())?;

        let t2 = rust_decimal::MathematicalOps::norm_cdf(&-d1)
            .checked_mul(oracle_price)
            .ok_or_else(math_error!())?;

        t1
            .checked_sub(t2)    
            .ok_or_else(math_error!())?
            .checked_mul(g)
            .ok_or_else(math_error!())?
    };

    let mark_price_u64 = to_scaled_u64(new_mark_price, market.collateral_decimals).unwrap();

    return Ok(mark_price_u64)
}

/* 
    the assumption here is that cross-position changes will be handled in separate instructions
    i.e. if someone is short and then goes long more than they were short, there will first be an instruction to close the short, and then another to open the remainder as a long
*/
pub fn get_volatility_impact(
    order_side: OrderSide,
    position_change: PositionChangeDirection,
    quote_order_amount: u64,
    base_order_amount: u64,
    mark_price: u64,
    market: Market,
    exposure: MarketExposure,
    volatility: u64
) -> Result<(u64, u64)> {
    // this function was transformed from a constant product to a constant sum, so the variable naming and calcs are more complex than necessary

    let mark_volatility: Decimal = Decimal::new(volatility.try_into().unwrap(), VOLATILITY_PRECISION_DECIMALS);
    let vol_scale: Decimal = Decimal::ONE
        .checked_div(Decimal::new(volatility.try_into().unwrap(), VOLATILITY_PRECISION_DECIMALS))
        .ok_or_else(math_error!())?;

    let mark_price_d: Decimal = Decimal::new(mark_price.try_into().unwrap(), market.collateral_decimals);

    // scale vol to get it closer to the vertex of the CF curve, this should be = 1, this calc is actually unnecessary
    let mark_volatility_scaled: Decimal = mark_volatility
        .checked_mul(vol_scale)
        .ok_or_else(math_error!())?;

    let mut unexposed: Decimal = Decimal::new(exposure.unexposed_collateral.try_into().unwrap(), market.collateral_decimals);
    let total_collateral: Decimal = Decimal::new(exposure.total_collateral.try_into().unwrap(), market.collateral_decimals);

    // if the funding gets extreme and >100% of collateral is exposed, maintain some minimum liquidity despite risk
    let lowest_liquidity_guardrail = total_collateral.checked_div(Decimal::TEN).ok_or_else(math_error!())?;
    if unexposed < lowest_liquidity_guardrail {
        unexposed = lowest_liquidity_guardrail;
    }

    let k_scale = Decimal::TEN;

    let quote_amount: Decimal = unexposed * k_scale * (Decimal::ONE / (Decimal::ONE + mark_volatility_scaled));
    let base_amount: Decimal = unexposed * k_scale * (mark_volatility_scaled / (Decimal::ONE + mark_volatility_scaled));

    let k: Decimal = quote_amount + base_amount;

    let (calculated_base_vol_amount, calculated_quote_vol_amount) =
        if position_change == PositionChangeDirection::Increase {
            let base_order_amount_d: Decimal = Decimal::new(base_order_amount.try_into().unwrap(), market.collateral_decimals);

            let temp_base_vol_amount: Decimal = 
                if order_side == OrderSide::Long {
                    base_amount
                        .checked_add(base_order_amount_d)
                        .ok_or_else(math_error!())?
                } else { // order_side == OrderSide::Short
                    base_amount
                        .checked_sub(base_order_amount_d)
                        .ok_or_else(math_error!())?
                };

            let temp_quote_vol_amount: Decimal = k
                .checked_sub(temp_base_vol_amount)
                .ok_or_else(math_error!())?;

            (temp_base_vol_amount, temp_quote_vol_amount)
        } else { // position_change == PositionChange::Decrease
            let quote_order_amount_d: Decimal = Decimal::new(quote_order_amount.try_into().unwrap(), market.collateral_decimals)
                .checked_mul(mark_price_d)
                .ok_or_else(math_error!())?;

            let temp_quote_vol_amount: Decimal = 
                if order_side == OrderSide::Long {
                    quote_amount
                        .checked_add(quote_order_amount_d)
                        .ok_or_else(math_error!())?
                } else { // order_side == OrderSide::Short
                    quote_amount
                        .checked_sub(quote_order_amount_d)
                        .ok_or_else(math_error!())?
                };

            let temp_base_vol_amount: Decimal = k
                .checked_sub(temp_quote_vol_amount)
                .ok_or_else(math_error!())?;        

            (temp_base_vol_amount, temp_quote_vol_amount)
        };

    let new_vol: Decimal = calculated_base_vol_amount
        .checked_div(calculated_quote_vol_amount)
        .ok_or_else(math_error!())?
        .checked_div(vol_scale)
        .ok_or_else(math_error!())?;

    let new_new_vol_u64 = to_scaled_u64(new_vol, VOLATILITY_PRECISION_DECIMALS).unwrap();

    let avg_volatility_fill_u64 = volatility
        .checked_add(new_new_vol_u64)
        .ok_or_else(math_error!())?
        .checked_div(2u64)
        .ok_or_else(math_error!())?;

    Ok((new_new_vol_u64, avg_volatility_fill_u64))
}
