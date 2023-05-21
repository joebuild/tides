use std::cmp::{max, min};

use anchor_lang::prelude::*;
use num_traits::ToPrimitive;
use rust_decimal::{Decimal, MathematicalOps};
use spl_token::solana_program::pubkey::Pubkey;

use crate::{utils::{get_exposure_assets, get_exposure_funding_fees}, math_error};

use super::{DEFAULT_PRECISION_U64, OptionSide, ExposureStatus, FUNDING_TIER_SCALE, SECONDS_IN_DAY};

#[account(zero_copy)]
#[repr(packed)]
pub struct Markets {
    pub initialized: bool,
    pub markets: [Market; 64],
}

impl Default for Markets {
    fn default() -> Self {
        Markets {
            initialized: false,
            markets: [Market::default(); 64],
        }
    }
}

impl Markets {
    fn index_from_u64(index: u64) -> usize {
        std::convert::TryInto::try_into(index).unwrap()
    }

    pub fn get_market(&self, index: u64) -> &Market {
        &self.markets[Markets::index_from_u64(index)]
    }

    pub fn get_market_mut(&mut self, index: u64) -> &mut Market {
        &mut self.markets[Markets::index_from_u64(index)]
    }
}

#[zero_copy]
#[repr(packed)]
#[derive(Default)]
pub struct Market {
    pub initialized: bool,
    pub index: u16,

    pub market_paused: bool,

    pub mint_quote: Pubkey,
    pub mint_base: Pubkey,

    pub oracle_price_feed: Pubkey,
    pub oracle_price: u64, // saved here for convenience
    pub oracle_price_ts: u64,  // saved here for convenience
    
    pub ema_numerator_sum: u128,
    pub ema_denominator_sum: u128,
    pub ema_ts: u64,

    pub call_market_data: MarketSideData,
    pub put_market_data: MarketSideData,

    pub funding_interval: u64,

    pub collateral_ratio_target: u64,
    pub collateral_ratio_max: u64,
    pub collateral_ratio_delever: u64,

    pub minimum_base_asset_trade_size: u64,

    pub collateral_mint: Pubkey,
    pub collateral_decimals: u32,

    pub symbol_quote: [u8; 8],
    pub symbol_base: [u8; 8],

    // upgrade-ability
    pub padding0: i64,
    pub padding1: i64,
}

impl Market {
    pub fn get_ema(
        &self,
    ) -> Result<u64> {
        Ok(
            self.ema_numerator_sum
                .checked_mul(DEFAULT_PRECISION_U64.into()).ok_or_else(math_error!())?
                .checked_div(self.ema_denominator_sum).ok_or_else(math_error!())?
                .checked_div(DEFAULT_PRECISION_U64.into()).ok_or_else(math_error!())?
            as u64
        )
    }

    // this function costs about 60k cpu because of the exponent calc
    pub fn update_ema(
        &mut self,
        price: u64,
        now: u64,
    ) -> Result<()> {
        if now > self.ema_ts {
            let ts_diff = now.checked_sub(self.ema_ts).unwrap().checked_mul(DEFAULT_PRECISION_U64).unwrap();

            let neg_ts_diff_dec = Decimal::new(-(ts_diff as i64), 0);
            let halflife_dec = Decimal::new((SECONDS_IN_DAY * DEFAULT_PRECISION_U64) as i64, 0);

            let exp = neg_ts_diff_dec.checked_div(halflife_dec).unwrap();
            let scale = Decimal::TWO.checked_powd(exp).unwrap(); // <-- the expensive calc
    
            let numerator_dec = Decimal::from_i128_with_scale(self.ema_numerator_sum as i128, 0);
            let denominator_dec = Decimal::from_i128_with_scale(self.ema_denominator_sum as i128, 0);

            let new_numerator_dec = scale.checked_mul(numerator_dec).unwrap();
            let new_denominator_dec = scale.checked_mul(denominator_dec).unwrap();

            self.ema_numerator_sum = new_numerator_dec.to_u128().unwrap();
            self.ema_denominator_sum = new_denominator_dec.to_u128().unwrap();

            self.ema_numerator_sum += (ts_diff as u128).checked_mul(price as u128).unwrap();
            self.ema_denominator_sum += ts_diff as u128;

            self.ema_ts = now;
        }

        Ok(())
    }

    pub fn get_exposure(
        &self,
        option_side: OptionSide,
        collateral_vault_amount: u64,
        oracle_price: u64,
    ) -> Result<MarketExposure> {

        let market_side_data = if option_side == OptionSide::Call {
            self.call_market_data
        } else {
            self.put_market_data
        };

        let quote_asset_amount_net_abs = market_side_data.quote_asset_amount_net.abs() as u64;

        let funding_exposure = get_exposure_funding_fees(
            option_side,
            market_side_data.mark_price,
            self.get_ema()?,
            oracle_price,
            quote_asset_amount_net_abs,
            self.collateral_decimals
        )?;    

        let asset_exposure = get_exposure_assets(
            market_side_data.mark_price,
            quote_asset_amount_net_abs,
            self.collateral_decimals
        )?;

        let total_exposure = asset_exposure.checked_add(funding_exposure).ok_or_else(math_error!())?;

        let exposure_ratio_num = total_exposure
            .checked_mul(DEFAULT_PRECISION_U64).ok_or_else(math_error!())?
            .checked_div(collateral_vault_amount).ok_or_else(math_error!())?;

        let exposure_status = if exposure_ratio_num > self.collateral_ratio_delever {
            ExposureStatus::Delever
        } else if exposure_ratio_num > self.collateral_ratio_max {
            ExposureStatus::AboveMax
        } else if exposure_ratio_num >= self.collateral_ratio_target {
            ExposureStatus::AboveTarget
        } else {
            ExposureStatus::BelowTarget
        };

        let unexposed_collateral = max(
            (collateral_vault_amount as i64)
                .checked_sub(total_exposure as i64)
                .ok_or_else(math_error!())?, 
            0i64
        ) as u64;

        Ok(
            MarketExposure {
                ratio: exposure_ratio_num,
                status: exposure_status,
                asset_exposure: asset_exposure,
                funding_exposure: funding_exposure,
                total_exposure: total_exposure,
                total_collateral: collateral_vault_amount,
                unexposed_collateral: unexposed_collateral,
            }
        )
    }
}

#[zero_copy]
#[repr(packed)]
#[derive(Default)]
pub struct MarketSideData {
    pub side: OptionSide,
    pub collateral_vault: Pubkey,
    pub collateral_vault_authority: Pubkey,
    pub collateral_vault_nonce: u8,
    pub mark_price: u64,
    pub mark_price_ts: u64,
    pub quote_asset_amount_long: i64,
    pub quote_asset_amount_short: i64,
    pub quote_asset_amount_net: i64,
    pub funding_rate: i64, // saved here for convenience
    pub funding_rate_ts: u64, // saved here for convenience
    pub funding_data: Pubkey,

    pub mark_volatility: u64,

    pub current_depositor_collateral: u64,
    pub cumulative_fees_per_depositor_collateral: u64,
    pub cumulative_trading_difference_per_depositor_collateral: i64,
}

#[derive(Default, Clone, Copy, Debug)]
pub struct MarketExposure {
    pub ratio: u64,
    pub status: ExposureStatus,
    pub asset_exposure: u64,
    pub funding_exposure: u64,
    pub total_exposure: u64,
    pub total_collateral: u64,
    pub unexposed_collateral: u64,
}

#[derive(Default, Clone, Copy, Debug)]
pub struct OraclePriceData {
    pub price: i64,
    pub confidence: u64,
    pub delay: i64,
    pub has_sufficient_number_of_data_points: bool,
}

#[account(zero_copy)]
#[repr(packed)]
pub struct FundingData {
    pub market_index: u16,
    pub side: OptionSide,
    pub last_increment_ts: u64,
    pub funding_records_tier_0: FundingRecordsTier,
    pub funding_records_tier_1: FundingRecordsTier,
    pub funding_records_tier_2: FundingRecordsTier,
}

impl Default for FundingData {
    fn default() -> Self {
        let interval_sec_min = 864u64; // 86,400 seconds in a day, so break that up into 100 slices

        let mut tier_0 = FundingRecordsTier::default();
        tier_0.interval_sec = interval_sec_min;

        let mut tier_1 = FundingRecordsTier::default();
        tier_1.interval_sec = interval_sec_min * FUNDING_TIER_SCALE;

        let mut tier_2 = FundingRecordsTier::default();
        tier_2.interval_sec = interval_sec_min * FUNDING_TIER_SCALE * FUNDING_TIER_SCALE;

        FundingData {
            market_index: 0u16,
            side: OptionSide::Call,
            last_increment_ts: 0u64,
            funding_records_tier_0: tier_0,
            funding_records_tier_1: tier_1,
            funding_records_tier_2: tier_2,
        }
    }
}

impl FundingData {
    pub fn update(&mut self, funding_rate: i64, now: u64) -> Result<()> {
        // update the first tier
        self.funding_records_tier_0.update_forward(funding_rate, now)?;

        if self.funding_records_tier_0.head >= FUNDING_TIER_SCALE { // just make sure the count of records is high enough when starting
            let ts_start_tier_1 = max(
                self.funding_records_tier_1.get_newest().end_ts,
                self.funding_records_tier_0.get_oldest().start_ts // default to oldest of the higher resolution tier if the lower resolution tier isn't yet populated
            );
            let tier_0_funding_total = self.funding_records_tier_0.get_funding_total_since_ts(
                ts_start_tier_1,
                ts_start_tier_1 + self.funding_records_tier_1.interval_sec,
                false
            )?;
            self.funding_records_tier_1.update_complete(tier_0_funding_total, ts_start_tier_1, now)?;
        }

        if self.funding_records_tier_1.head >= FUNDING_TIER_SCALE { // just make sure the count of records is high enough when starting
            let ts_start_tier_2 = max(
                self.funding_records_tier_2.get_newest().end_ts,
                self.funding_records_tier_1.get_oldest().start_ts // default to oldest of the higher resolution tier if the lower resolution tier isn't yet populated
            );
            let tier_1_funding_total = self.funding_records_tier_1.get_funding_total_since_ts(
                ts_start_tier_2,
                ts_start_tier_2 + self.funding_records_tier_2.interval_sec,
                false
            )?;
            self.funding_records_tier_2.update_complete(tier_1_funding_total, ts_start_tier_2, now)?;
        }

        Ok(())
    }

    pub fn get_total_funding_since(&mut self, since_ts: u64, now: u64) -> Result<i64> {
        let tier_2_funding = self.funding_records_tier_2.get_funding_total_since_ts(since_ts, now, false)?;
        let tier_2_last_ts = max(self.funding_records_tier_2.get_newest().end_ts, since_ts);

        let tier_1_funding = self.funding_records_tier_1.get_funding_total_since_ts(tier_2_last_ts, now, false)?;
        let tier_1_last_ts = max(self.funding_records_tier_1.get_newest().end_ts, since_ts);

        let tier_0_funding = self.funding_records_tier_0.get_funding_total_since_ts(tier_1_last_ts, now, true)?;

        Ok(tier_2_funding + tier_1_funding + tier_0_funding)
    }

    pub fn get_current_funding_rate(&mut self) -> Result<i64> {
        Ok(self.funding_records_tier_0.get_newest().funding_rate)
    }
}

#[zero_copy]
#[repr(packed)]
pub struct FundingRecordsTier {
    pub head: u64,
    pub tail: u64,
    pub interval_sec: u64,
    pub funding_records: [FundingRecord; 100],
}

impl Default for FundingRecordsTier {
    fn default() -> Self {
        FundingRecordsTier {
            head: 0u64,
            tail: 0u64,
            interval_sec: 0u64,
            funding_records: [FundingRecord::default(); 100],
        }
    }    
}

impl FundingRecordsTier {
    fn append(&mut self, record: FundingRecord) -> Result<()> {
        self.funding_records[FundingRecordsTier::index_of(self.head)] = record;
        if FundingRecordsTier::index_of(self.head + 1) == FundingRecordsTier::index_of(self.tail) {
            self.tail += 1;
        }
        self.head += 1;

        Ok(())
    }

    pub fn index_of(counter: u64) -> usize {
        std::convert::TryInto::try_into(counter % 100).unwrap()
    }

    pub fn get_newest(&mut self) -> FundingRecord {
        self.funding_records[FundingRecordsTier::index_of(self.head - 1)]
    }

    pub fn get_oldest(&mut self) -> FundingRecord {
        self.funding_records[FundingRecordsTier::index_of(self.tail)]
    }

    pub fn update_forward(&mut self, funding_rate: i64, ts: u64) -> Result<()> {
        if self.can_add_forward_record(ts)? {
            let start_ts = 
                if self.tail == self.head { // if first record, then use current ts as the start
                    ts
                } else {
                    self.get_newest().end_ts
                };

            self.append(
                FundingRecord {
                    start_ts: start_ts,
                    end_ts: start_ts + self.interval_sec,
                    funding_rate,
                }
            )?
        }

        Ok(())
    }

    pub fn update_complete(&mut self, funding_rate: i64, start_ts_: u64, now: u64) -> Result<()> {
        if self.can_add_complete_record(now)? {
            let start_ts = 
                if self.tail == self.head { // if first record, then use current ts as the start
                    start_ts_
                } else {
                    self.get_newest().end_ts
                };

            self.append(
                FundingRecord {
                    start_ts: start_ts,
                    end_ts: start_ts + self.interval_sec,
                    funding_rate,
                }
            )?
        }

        Ok(())
    }

    pub fn can_add_forward_record(&mut self, ts: u64) -> Result<bool> {
        Ok(ts > self.get_newest().start_ts + self.interval_sec)
    }

    pub fn can_add_complete_record(&mut self, ts: u64) -> Result<bool> {
        Ok(ts > self.get_newest().end_ts + self.interval_sec)
    }

    pub fn get_funding_total_since_ts(&mut self, since_ts: u64, now: u64, return_partial: bool) -> Result<i64> {
        let mut funding_total = 0i64;
        if self.tail == self.head {
            return Ok(0i64)
        }

        // this could be optimized by starting at the head and working backwards, instead of scanning the whole array
        for record in self.funding_records.iter() {
            // complete interval coverage
            if since_ts <= record.start_ts && now >= record.end_ts {
                funding_total += record.funding_rate;

            // incomplete
            } else if ((since_ts > record.start_ts && since_ts < record.end_ts) || (now > record.start_ts && now < record.end_ts)) && return_partial {
                let start_coverage = max(record.start_ts, since_ts);
                let end_coverage = min(record.end_ts, now);

                let period_coverage = ((end_coverage - start_coverage) * DEFAULT_PRECISION_U64) / (record.end_ts - record.start_ts);

                let funding_addition = (period_coverage as i64 * record.funding_rate) / DEFAULT_PRECISION_U64 as i64;
                funding_total += funding_addition;
            }
        }
        return Ok(funding_total)
    }
}

#[zero_copy]
#[repr(packed)]
#[derive(Default)]
pub struct FundingRecord {
    pub start_ts: u64,
    pub end_ts: u64,
    pub funding_rate: i64,
}