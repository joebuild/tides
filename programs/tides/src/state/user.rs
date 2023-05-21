use anchor_lang::prelude::*;
use rust_decimal::Decimal;
use spl_token::solana_program::pubkey::Pubkey;

use crate::OptionSide;
use crate::OrderSide;
use crate::PositionChangeDirection;
use crate::math_error;
use crate::utils::to_scaled_i64;

use super::DEFAULT_PRECISION_I64;
use super::Market;
use super::MarketSideData;

#[account]
#[derive(Default)]
pub struct User {
    pub user: Pubkey,
    pub cumulative_deposits: u64,
    pub cumulative_withdrawals: u64,
    pub collateral: i64,
    pub positions: Pubkey,
    pub history: Pubkey,

    pub padding_0: Pubkey,
    pub padding_1: Pubkey,
    pub padding_2: Pubkey,
}

#[account(zero_copy)]
#[repr(packed)]
pub struct UserPositions {
    pub user: Pubkey,
    pub positions: [Position; 8],
}

impl Default for UserPositions {
    fn default() -> Self {
        let mut positions = [Position::default(); 8];

        for (i, position) in positions.iter_mut().enumerate() {
            position.position_index = i as u16;
        }

        UserPositions {
            user: Pubkey::default(),
            positions: positions,
        }
    }
}

#[zero_copy]
#[repr(packed)]
pub struct Position {
    pub active: bool,
    pub position_index: u16,
    pub market_index: u16,
    pub side: OptionSide,
    pub quote_asset_amount: i64,
    pub total_collateral_deposits: i64,
    pub additional_collateral_deposits: i64, // for calculating short balances, when someone adds more collateral to an at-risk position
    pub last_cumulative_funding: i64,
    pub last_funding_ts: u64,

    // upgrade-ability
    pub padding0: u64,
    pub padding1: u64,
    pub padding2: i64,
}

impl Default for Position {
    fn default() -> Self {
        Position {
            active: false,
            position_index: u16::MAX,
            market_index: u16::MAX,
            side: OptionSide::default(),
            quote_asset_amount: 0i64,
            total_collateral_deposits: 0i64,
            additional_collateral_deposits: 0i64, // for calculating short balances, when someone adds more collateral to an at-risk position

            last_cumulative_funding: 0i64,
            last_funding_ts: 0u64,

            padding0: 0u64,
            padding1: 0u64,
            padding2: 0i64,
        }
    }
}

impl Position {
    // this returns health out of 10000, where health is net value divided by collateral deposits
    // stats should be updated in liquidation function just prior to this call
    pub fn get_position_health(self, market: Market, market_side_data: MarketSideData) -> Result<i64> {
        let mark_price: Decimal = Decimal::new(market_side_data.mark_price.try_into().unwrap(), market.collateral_decimals);
        let quote_amount: Decimal = Decimal::new(self.quote_asset_amount.try_into().unwrap(), market.collateral_decimals);
        let quote_amount_abs: Decimal = quote_amount.abs();
        let funding: Decimal = Decimal::new(self.last_cumulative_funding.try_into().unwrap(), market.collateral_decimals);

        let asset_value_abs = quote_amount_abs
            .checked_mul(mark_price).ok_or_else(math_error!())?;

        let total_deposits: Decimal = Decimal::new(self.total_collateral_deposits.try_into().unwrap(), market.collateral_decimals);
        let additional_deposits: Decimal = Decimal::new(self.additional_collateral_deposits.try_into().unwrap(), market.collateral_decimals);

        let net_value = if self.quote_asset_amount > 0 {
            // position is long
            asset_value_abs
                .checked_add(additional_deposits).ok_or_else(math_error!())?
                .checked_add(funding).ok_or_else(math_error!())?
        } else {
            // position is short
            Decimal::TWO
                .checked_mul(total_deposits).ok_or_else(math_error!())?
                .checked_sub(additional_deposits).ok_or_else(math_error!())?
                .checked_sub(asset_value_abs).ok_or_else(math_error!())?
                .checked_add(funding).ok_or_else(math_error!())?
        };

        let net_value_u64 = to_scaled_i64(net_value, market.collateral_decimals).unwrap();

        let ratio = net_value_u64
            .checked_mul(DEFAULT_PRECISION_I64).ok_or_else(math_error!())?
            .checked_div(self.total_collateral_deposits).ok_or_else(math_error!())?;

        Ok(ratio)
    }
}

#[account(zero_copy)]
#[repr(packed)]
pub struct UserHistory {
    pub user: Pubkey,
    pub records: [OrderRecord; 100],
    pub head: u64,
    pub tail: u64,
}

impl Default for UserHistory {
    fn default() -> Self {
        UserHistory {
            user: Pubkey::default(),
            records: [OrderRecord::default(); 100],
            head: 0u64,
            tail: 0u64,
        }
    }
}

impl UserHistory {
    pub fn append(&mut self, record: OrderRecord) -> Result<()> {
        self.records[UserHistory::index_of(self.head)] = record;
        if UserHistory::index_of(self.head + 1) == UserHistory::index_of(self.tail) {
            self.tail += 1;
        }
        self.head += 1;
        Ok(())
    }

    pub fn index_of(counter: u64) -> usize {
        std::convert::TryInto::try_into(counter % 100).unwrap()
    }
}

#[zero_copy]
#[derive(Default)]
#[repr(packed)]
pub struct OrderRecord {
    pub market_index: u16,
    pub option_side: OptionSide,
    pub order_side: OrderSide,
    pub position_change_direction: PositionChangeDirection,
    pub quote_amount: i64,
    pub base_amount: u64,
    pub collateral_deposits: i64,
    pub collateral_returned: i64,
    pub cumulative_funding: i64,
    pub fee: u64,
    pub ts: u64,

    // upgrade-ability
    pub padding0: u64,
    pub padding1: u64,
    pub padding2: i64,
    pub padding3: i64,
}
