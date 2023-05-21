use std::cmp::max;
use rust_decimal::prelude::*;

use anchor_lang::prelude::*;

use crate::{state::*, math_error};

use super::misc::to_scaled_u64;

pub fn get_payoff(
    option_side: OptionSide,
    ema_price: i64,
    oracle_price: i64,
) -> i64 {
    let payoff = if option_side == OptionSide::Call {
        max(oracle_price - ema_price, 0i64)
    } else {
        max(ema_price - oracle_price, 0i64)
    };

    payoff as i64
}

pub fn get_funding_fee(
    option_side: OptionSide,
    mark_price: u64,
    ema_price: u64,
    oracle_price: u64,
    funding_frequency: u64,
) -> Result<i64> {
    let payoff = get_payoff(option_side, ema_price as i64, oracle_price as i64);

    let mark_minus_payoff = (mark_price as i64).checked_sub(payoff).ok_or_else(math_error!())?;

    let funding_fee = mark_minus_payoff
        .checked_div(funding_frequency as i64).ok_or_else(math_error!())?;

    Ok(funding_fee)
}

pub fn get_exposure_funding_fees(
    option_side: OptionSide,
    mark_price: u64,
    ema_price: u64,
    oracle_price: u64,
    quote_asset_amount_net_abs: u64,
    collateral_decimals: u32,
) -> Result<u64> {
    let payoff = get_payoff(option_side, ema_price as i64, oracle_price as i64);

    let funding_fee_per_quote = (mark_price as i64)
        .checked_sub(payoff)
        .ok_or_else(math_error!())?; // total daily, which works because the sum of series of 1/2, 1/4, 1/8, etc. = 1, for the ema halflife

    let funding_fee = (funding_fee_per_quote.abs() as u64)
        .checked_mul(quote_asset_amount_net_abs).ok_or_else(math_error!())?
        .checked_div(u64::pow(10, collateral_decimals)).ok_or_else(math_error!())?;

    Ok(funding_fee)
}

pub fn get_exposure_assets(
    mark_price: u64,
    quote_asset_amount_net_abs: u64,
    collateral_decimals: u32,
) -> Result<u64> {
    let asset_exposure = quote_asset_amount_net_abs
        .checked_mul(mark_price)
        .ok_or_else(math_error!())?
        .checked_div(u64::pow(10, collateral_decimals))
        .ok_or_else(math_error!())?;

    Ok(asset_exposure)
}

pub fn get_exposure_total(
    mark_price: u64,
    oracle_price: u64,
    ema_price: u64,
    quote_asset_amount_net_abs: u64,
    option_side: OptionSide,
    collateral_decimals: u32,
) -> Result<u64> {
    let asset_exposure = get_exposure_assets(
        mark_price,
        quote_asset_amount_net_abs,
        collateral_decimals
    )?;

    let funding_exposure = get_exposure_funding_fees(
        option_side,
        mark_price,
        ema_price,
        oracle_price,
        quote_asset_amount_net_abs,
        collateral_decimals
    )?;

    let total_exposure = asset_exposure.checked_add(funding_exposure).unwrap();

    Ok(total_exposure)
}

pub fn k_scale_d(exposure_ratio: u64) -> Result<Decimal> {
    let min_k = Decimal::ONE;

    let exposure_ratio_d = Decimal::new(exposure_ratio.try_into().unwrap(), 4);
    let exposure_target_d = Decimal::new(EXPOSURE_TARGET_NUMERATOR.try_into().unwrap(), 4);

    if exposure_ratio >= EXPOSURE_TARGET_NUMERATOR {
        return Ok(min_k)
    } else {
        let scale = Decimal::new(5, 0) * ((exposure_target_d - exposure_ratio_d) * (exposure_target_d - exposure_ratio_d)) + min_k;
        return Ok(scale)
    }
}

/* 
    the assumption here is that cross-position changes will be handled in separate instructions
    i.e. if someone is short and then goes long more than they were short, there will first be an instruction to close the short, and then another to open the remainder as a long
*/
pub fn get_constant_product_price_impact(
    order_side: OrderSide,
    position_change: PositionChangeDirection,
    quote_order_amount: Option<u64>,
    base_order_amount: Option<u64>,
    market: Market,
    market_side_data: MarketSideData,
    exposure: MarketExposure
) -> Result<(u64, u64, u64)> {
    let k_scale: Decimal = k_scale_d(exposure.ratio)?;
    let mark_price: Decimal = Decimal::new(market_side_data.mark_price.try_into().unwrap(), market.collateral_decimals);

    let mut unexposed: Decimal = Decimal::new(exposure.unexposed_collateral.try_into().unwrap(), market.collateral_decimals);
    let total_collateral: Decimal = Decimal::new(exposure.total_collateral.try_into().unwrap(), market.collateral_decimals);

    // if the funding gets extreme and >100% of collateral is exposed, maintain some minimum liquidity
    let lowest_liquidity_guardrail = total_collateral.checked_div(Decimal::TEN).ok_or_else(math_error!())?;

    if unexposed < lowest_liquidity_guardrail {
        unexposed = lowest_liquidity_guardrail;
    }

    let quote_amount: Decimal = (unexposed * (Decimal::ONE / (Decimal::ONE + mark_price))) * k_scale;
    let base_amount: Decimal = (unexposed * (mark_price / (Decimal::ONE + mark_price))) * k_scale;

    let k: Decimal = quote_amount * base_amount;

    let (fill_amount_quote, fill_amount_base, new_mark_price) = 
        if position_change == PositionChangeDirection::Increase {
            let base_order_amount_d: Decimal = Decimal::new(base_order_amount.unwrap().try_into().unwrap(), market.collateral_decimals);

            let temp_base_asset_amount: Decimal = 
                if order_side == OrderSide::Long {
                    // opening/increasing a long position, so simulate by adding collateral to the "base" side
                    base_amount + base_order_amount_d
                } else { // order_side == OrderSide::Short
                    // opening/increasing a short position, so simulate by removing collateral from the "base" side
                    base_amount - base_order_amount_d
                };

            let calculated_quote_asset_amount: Decimal = k.checked_div(temp_base_asset_amount).ok_or_else(math_error!())?;
            let new_mark_price: Decimal = temp_base_asset_amount
                .checked_div(calculated_quote_asset_amount)
                .ok_or_else(math_error!())?;

            let fill_amount_quote: Decimal = (calculated_quote_asset_amount - quote_amount).abs();

            let new_mark_price_u64 = to_scaled_u64(new_mark_price, market.collateral_decimals).unwrap();
            let fill_amount_quote_u64 = to_scaled_u64(fill_amount_quote, market.collateral_decimals).unwrap();

            (fill_amount_quote_u64, base_order_amount.unwrap(), new_mark_price_u64)
        } else { // position_change == PositionChange::Decrease
            let quote_order_amount_d: Decimal = Decimal::new(quote_order_amount.unwrap().try_into().unwrap(), market.collateral_decimals);

            let temp_quote_asset_amount: Decimal = 
                if order_side == OrderSide::Long {
                    // closing/decreasing a long position, so simulate by adding collateral to the "quote" side
                    quote_amount + quote_order_amount_d
                } else { // order_side == OrderSide::Short
                    // closing/decreasing a short position, so simulate by removing collateral from the "quote" side
                    quote_amount - quote_order_amount_d
                };

            let calculated_base_asset_amount: Decimal = k.checked_div(temp_quote_asset_amount).ok_or_else(math_error!())?;
            let new_mark_price: Decimal = calculated_base_asset_amount.checked_div(temp_quote_asset_amount).ok_or_else(math_error!())?;
            let fill_amount_base: Decimal = (calculated_base_asset_amount - base_amount).abs();

            let new_mark_price_u64 = to_scaled_u64(new_mark_price, market.collateral_decimals).unwrap();
            let fill_amount_base_u64 = to_scaled_u64(fill_amount_base, market.collateral_decimals).unwrap();

            (quote_order_amount.unwrap(), fill_amount_base_u64, new_mark_price_u64)
        };

    Ok((fill_amount_quote, fill_amount_base, new_mark_price))
}

#[cfg(test)]
mod tests {
    use super::*;

    const DECIMALS: u32 = 6;
    const PRECISION: u64 = 10u64.pow(DECIMALS);

    #[test]
    fn payoff() {
        let p1 = get_payoff(
            OptionSide::Call,
            5,
            10,
        );

        let p2 = get_payoff(
            OptionSide::Call,
            10,
            5,
        );

        let p3 = get_payoff(
            OptionSide::Put,
            5,
            10,
        );

        let p4 = get_payoff(
            OptionSide::Put,
            10,
            5,
        );
    
        assert!(p1 >= 0);
        assert!(p2 >= 0);
        assert!(p3 >= 0);
        assert!(p4 >= 0);
    }

    #[test]
    fn increase_long() {
        let order_side = OrderSide::Long;
        let position_change = PositionChangeDirection::Increase;
        let quote_order_amount: Option<u64> = None;
        let base_order_amount = Option::Some(100 * PRECISION);
 
        let mut market = Market::default();
        market.collateral_decimals = 6;

        let mut market_side_data = MarketSideData::default();
        market_side_data.mark_price = 3 * PRECISION;
        market_side_data.quote_asset_amount_long = (10000 * PRECISION) as i64;
        market_side_data.quote_asset_amount_short = (10000 * PRECISION) as i64;

        let mut exposure = MarketExposure::default();
        exposure.ratio = 4000u64;
        exposure.unexposed_collateral = 100000 * PRECISION;

        let (fill_amount_quote, fill_amount_base, new_mark_price) = get_constant_product_price_impact(
            order_side, 
            position_change,
            quote_order_amount,
            base_order_amount,
            market,
            market_side_data,
            exposure
        ).unwrap();

        let fill_amount_quote_pre_calcs = base_order_amount.unwrap() * PRECISION / market_side_data.mark_price;

        assert!(new_mark_price > market_side_data.mark_price);
        assert!(fill_amount_quote < fill_amount_quote_pre_calcs);
        assert_eq!(fill_amount_base, base_order_amount.unwrap());
    }

    #[test]
    fn decrease_long() {
        let order_side = OrderSide::Long;
        let position_change = PositionChangeDirection::Decrease;
        let quote_order_amount: Option<u64> =Option::Some(20 * PRECISION);
        let base_order_amount: Option<u64> = Option::Some(100 * PRECISION);
 
        let mut market = Market::default();
        market.collateral_decimals = 6;

        let mut market_side_data = MarketSideData::default();
        market_side_data.mark_price = 3 * PRECISION;
        market_side_data.quote_asset_amount_long = (10000 * PRECISION) as i64;
        market_side_data.quote_asset_amount_short = (10000 * PRECISION) as i64;

        let mut exposure = MarketExposure::default();
        exposure.ratio = 4000u64;
        exposure.unexposed_collateral = 100000 * PRECISION;

        let (fill_amount_quote, fill_amount_base, new_mark_price) = get_constant_product_price_impact(
            order_side, 
            position_change,
            quote_order_amount,
            base_order_amount,
            market,
            market_side_data,
            exposure
        ).unwrap();

        let fill_amount_base_pre_calcs = quote_order_amount.unwrap() * (market_side_data.mark_price / PRECISION);

        assert!(new_mark_price < market_side_data.mark_price);
        assert!(fill_amount_base < fill_amount_base_pre_calcs);
        assert_eq!(fill_amount_quote, quote_order_amount.unwrap());
    }

    #[test]
    fn increase_short() {
        let order_side = OrderSide::Short;
        let position_change = PositionChangeDirection::Increase;
        let quote_order_amount: Option<u64> =Option::Some(20 * PRECISION);
        let base_order_amount: Option<u64> = Option::Some(100 * PRECISION);
 
        let mut market = Market::default();
        market.collateral_decimals = 6;

        let mut market_side_data = MarketSideData::default();
        market_side_data.mark_price = 3 * PRECISION;
        market_side_data.quote_asset_amount_long = (10000 * PRECISION) as i64;
        market_side_data.quote_asset_amount_short = (10000 * PRECISION) as i64;

        let mut exposure = MarketExposure::default();
        exposure.ratio = 4000u64;
        exposure.unexposed_collateral = 100000 * PRECISION;

        let (fill_amount_quote, fill_amount_base, new_mark_price) = get_constant_product_price_impact(
            order_side, 
            position_change,
            quote_order_amount,
            base_order_amount,
            market,
            market_side_data,
            exposure
        ).unwrap();

        let fill_amount_quote_pre_calcs = base_order_amount.unwrap() * PRECISION / market_side_data.mark_price;

        assert!(new_mark_price < market_side_data.mark_price);
        assert!(fill_amount_quote > fill_amount_quote_pre_calcs);
        assert_eq!(fill_amount_base, base_order_amount.unwrap());
    }

    #[test]
    fn decrease_short() {
        let order_side = OrderSide::Short;
        let position_change = PositionChangeDirection::Decrease;
        let quote_order_amount: Option<u64> =Option::Some(20 * PRECISION);
        let base_order_amount: Option<u64> = Option::Some(100 * PRECISION);
 
        let mut market = Market::default();
        market.collateral_decimals = 6;

        let mut market_side_data = MarketSideData::default();
        market_side_data.mark_price = 3 * PRECISION;
        market_side_data.quote_asset_amount_long = (10000 * PRECISION) as i64;
        market_side_data.quote_asset_amount_short = (10000 * PRECISION) as i64;

        let mut exposure = MarketExposure::default();
        exposure.ratio = 4000u64;
        exposure.unexposed_collateral = 100000 * PRECISION;

        let (fill_amount_quote, fill_amount_base, new_mark_price) = get_constant_product_price_impact(
            order_side, 
            position_change,
            quote_order_amount,
            base_order_amount,
            market,
            market_side_data,
            exposure
        ).unwrap();

        let fill_amount_base_pre_calcs = quote_order_amount.unwrap() * (market_side_data.mark_price / PRECISION);

        assert!(new_mark_price > market_side_data.mark_price);
        assert!(fill_amount_base > fill_amount_base_pre_calcs);
        assert_eq!(fill_amount_quote, quote_order_amount.unwrap());
    }

    #[test]
    fn lower_collateral_bigger_price_impact() {
        let order_side = OrderSide::Long;
        let position_change = PositionChangeDirection::Increase;
        let quote_order_amount: Option<u64> =Option::Some(20 * PRECISION);
        let base_order_amount: Option<u64> = Option::Some(100 * PRECISION);
 
        let mut market = Market::default();
        market.collateral_decimals = 6;

        let mut market_side_data = MarketSideData::default();
        market_side_data.mark_price = 3 * PRECISION;
        market_side_data.quote_asset_amount_long = (10000 * PRECISION) as i64;
        market_side_data.quote_asset_amount_short = (10000 * PRECISION) as i64;

        let mut exposure = MarketExposure::default();
        exposure.ratio = 4000u64;
        exposure.unexposed_collateral = 100000 * PRECISION;

        let (_, _, new_mark_price_a) = get_constant_product_price_impact(
            order_side, 
            position_change,
            quote_order_amount,
            base_order_amount,
            market,
            market_side_data,
            exposure
        ).unwrap();

        exposure.unexposed_collateral = exposure.unexposed_collateral / 2;

        let (_, _, new_mark_price_b) = get_constant_product_price_impact(
            order_side, 
            position_change,
            quote_order_amount,
            base_order_amount,
            market,
            market_side_data,
            exposure
        ).unwrap();

        assert!(new_mark_price_b > new_mark_price_a);
    }

    #[test]
    fn higher_exposure_ratio_bigger_price_impact() {
        let order_side = OrderSide::Long;
        let position_change = PositionChangeDirection::Increase;
        let quote_order_amount: Option<u64> =Option::Some(20 * PRECISION);
        let base_order_amount: Option<u64> = Option::Some(100 * PRECISION);
 
        let mut market = Market::default();
        market.collateral_decimals = 6;

        let mut market_side_data = MarketSideData::default();
        market_side_data.mark_price = 3 * PRECISION;
        market_side_data.quote_asset_amount_long = (10000 * PRECISION) as i64;
        market_side_data.quote_asset_amount_short = (10000 * PRECISION) as i64;

        let mut exposure = MarketExposure::default();
        exposure.ratio = 4000u64;
        exposure.unexposed_collateral = 100000 * PRECISION;

        let (_, _, new_mark_price_a) = get_constant_product_price_impact(
            order_side, 
            position_change,
            quote_order_amount,
            base_order_amount,
            market,
            market_side_data,
            exposure
        ).unwrap();

        exposure.ratio = 6000u64;

        let (_, _, new_mark_price_b) = get_constant_product_price_impact(
            order_side, 
            position_change,
            quote_order_amount,
            base_order_amount,
            market,
            market_side_data,
            exposure
        ).unwrap();

        assert!(new_mark_price_b > new_mark_price_a);
    }

    #[test]
    fn buy_sell_no_profit() {
        let order_side = OrderSide::Long;
        let mut position_change = PositionChangeDirection::Increase;
        let mut quote_order_amount: Option<u64> = None;
        let mut base_order_amount: Option<u64> = Option::Some(100 * PRECISION);
 
        let mut market = Market::default();
        market.collateral_decimals = 6;

        let mut market_side_data = MarketSideData::default();
        market_side_data.mark_price = 3 * PRECISION;
        market_side_data.quote_asset_amount_long = (10000 * PRECISION) as i64;
        market_side_data.quote_asset_amount_short = (10000 * PRECISION) as i64;

        let mut exposure = MarketExposure::default();
        exposure.ratio = 4000u64;
        exposure.unexposed_collateral = 100000 * PRECISION;

        let mut profit = 0i64;

        let (fill_amount_quote_a, fill_amount_base_a, new_mark_price_a) = get_constant_product_price_impact(
            order_side, 
            position_change,
            quote_order_amount,
            base_order_amount,
            market,
            market_side_data,
            exposure
        ).unwrap();

        profit = profit - (fill_amount_base_a as i64);

        market_side_data.quote_asset_amount_long = market_side_data.quote_asset_amount_long + (fill_amount_quote_a as i64);
        market_side_data.mark_price = new_mark_price_a;

        position_change = PositionChangeDirection::Decrease;
        quote_order_amount = Option::Some(fill_amount_quote_a);
        base_order_amount = None;

        let (_, fill_amount_base_b, new_mark_price_b) = get_constant_product_price_impact(
            order_side, 
            position_change,
            quote_order_amount,
            base_order_amount,
            market,
            market_side_data,
            exposure
        ).unwrap();

        profit = profit + (fill_amount_base_b as i64);

        assert!(profit < 0i64);
        assert!(new_mark_price_b < 3 * PRECISION);
    }
}