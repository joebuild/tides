use num_traits::ToPrimitive;
use rust_decimal::Decimal;

pub fn to_scaled_u64(mut decimal: Decimal, scale: u32) -> Option<u64> {
    decimal.rescale(scale);
    decimal = decimal * Decimal::new(10i64.pow(scale), 0);
    decimal.to_u64()
}

pub fn to_scaled_i64(mut decimal: Decimal, scale: u32) -> Option<i64> {
    decimal.rescale(scale);
    decimal = decimal * Decimal::new(10i64.pow(scale), 0);
    decimal.to_i64()
}