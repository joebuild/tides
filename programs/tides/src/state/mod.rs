pub use enums::*;
pub use markets::*;
pub use config::*;
pub use user::*;
pub use positions::*;

pub mod enums;
pub mod markets;
pub mod config;
pub mod user;
pub mod positions;

pub const CONFIG_SEED: &[u8]            = b"config";

pub const COLLATERAL_VAULT_SEED: &[u8]  = b"collateral_vault";
pub const INSURANCE_VAULT_SEED: &[u8]   = b"insurance_vault";
pub const TREASURY_VAULT_SEED: &[u8]    = b"treasury_vault";

pub const PUT_SEED: &[u8]               = b"put";
pub const CALL_SEED: &[u8]              = b"call";

pub const USER_PDA_SEED_PREFIX: &[u8]   = b"user";

pub const DEFAULT_PRECISION_U64: u64            = 10_000;
pub const DEFAULT_PRECISION_I64: i64            = 10_000;

pub const VOLATILITY_PRECISION_DECIMALS: u32    = 8;

pub const EXPOSURE_TARGET_NUMERATOR: u64        = 4000;
pub const EXPOSURE_MAX_NUMERATOR: u64           = 7000;
pub const EXPOSURE_DELEVER_NUMERATOR: u64       = 8500;

pub const DEFAULT_FEE_NUMERATOR: u64            = 100;
pub const LIQUIDATION_FEE_NUMERATOR: u64        = 200;

pub const COLLATERAL_FEE_PROP_NUMERATOR: u64    = 5000;
pub const INSURANCE_FEE_PROP_NUMERATOR: u64     = 3000;
pub const TREASURY_FEE_PROP_NUMERATOR: u64      = 2000;

pub const FUNDING_INTERVAL_SEC: u64             = 600;
pub const SECONDS_IN_DAY: u64                   = 86_400;

pub const MARGIN_RATIO_INITIAL: u64             = 10_000;   // 10_000 = 100% -> no margin
pub const MARGIN_RATIO_MAINTENANCE: u64         = 2_000;    // 2_000 = 20%

pub const FUNDING_TIER_SCALE: u64               = 10;

pub const COLLATERAL_DECIMAL_SCALE: u64         = 1_000_000;

pub const DEPOSIT_MAX_BETA: u64                 = 100_000_000;