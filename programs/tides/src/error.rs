use anchor_lang::error_code;

#[error_code]
pub enum ErrorCode {
    #[msg("Non-zero collateral after position close")]
    NonZeroCollateralAfterClose,
    #[msg("Cross position change")]
    CrossPositionChange,
    #[msg("Market exposure is above max and this trade does not reduce exposure")]
    MarketExposureAboveMax,
    #[msg("Invalid oracle price feed")]
    InvalidOraclePriceFeed,
    #[msg("Invalid collateral account for given market")]
    InvalidCollateralAccountForMarket,
    #[msg("Invalid funding rate account for given market")]
    InvalidFundingRateAccountForMarketData,
    #[msg("Invalid collateral account authority for given market")]
    InvalidCollateralAccountAuthorityForMarket,
    #[msg("Tides is not the collateral account owner")]
    InvalidCollateralAccountAuthority,
    #[msg("Tides is not the insurance account owner")]
    InvalidTreasuryAccountAuthority,
    #[msg("Tides is not the treasury account owner")]
    InvalidInsuranceAccountAuthority,
    #[msg("Insufficient deposit")]
    InsufficientDeposit,
    #[msg("Insufficient collateral")]
    InsufficientCollateral,
    #[msg("Order too large for vault collateral")]
    OrderTooLargeForVaultCollateral,
    #[msg("Sufficient collateral")]
    SufficientCollateral,
    #[msg("Max number of positions taken")]
    MaxNumberOfPositions,
    #[msg("Position with these parameters not found")]
    PositionNotFound,
    #[msg("Admin Controls Prices Disabled")]
    AdminControlsPricesDisabled,
    #[msg("Market Index Not Initialized")]
    MarketIndexNotInitialized,
    #[msg("Market Index Already Initialized")]
    MarketIndexAlreadyInitialized,
    #[msg("User Account And User Positions Account Mismatch")]
    UserAccountAndUserPositionsAccountMismatch,
    #[msg("User Has No Position In Market")]
    UserHasNoPositionInMarket,
    #[msg("Invalid Initial Peg")]
    InvalidInitialPeg,
    #[msg("AMM repeg already configured with amt given")]
    InvalidRepegRedundant,
    #[msg("AMM repeg incorrect repeg direction")]
    InvalidRepegDirection,
    #[msg("AMM repeg out of bounds pnl")]
    InvalidRepegProfitability,
    #[msg("Slippage Outside Limit Price")]
    SlippageOutsideLimit,
    #[msg("Negative asset calculation")]
    NegativeAssetCalculation,
    #[msg("Trade Size Too Small")]
    TradeSizeTooSmall,
    #[msg("Quote Size Cannot Be Zero")]
    TradeSizeZero,
    #[msg("Price change too large when updating K")]
    InvalidUpdateK,
    #[msg("Admin tried to withdraw amount larger than fees collected")]
    AdminWithdrawTooLarge,
    #[msg("Math Error")]
    MathError,
    #[msg("Conversion to u128/u64 failed with an overflow or underflow")]
    BnConversionError,
    #[msg("Clock unavailable")]
    ClockUnavailable,
    #[msg("Unable To Load Oracles")]
    UnableToLoadOracle,
    #[msg("Oracle/Mark Spread Too Large")]
    OracleMarkSpreadLimit,
    #[msg("Tides history already initialized")]
    HistoryAlreadyInitialized,
    #[msg("Position already initialized")]
    PositionAlreadyInitialized,
    #[msg("Market is paused")]
    MarketPaused,
    #[msg("Market is not paused")]
    MarketNotPaused,
    #[msg("Positions must all be closed to close the market")]
    PositionsNotClosed,
    #[msg("Market is still initialized")]
    MarketStillInitialized,
    #[msg("Exchange is paused")]
    ExchangePaused,
    #[msg("Invalid whitelist token")]
    InvalidWhitelistToken,
    #[msg("Whitelist token not found")]
    WhitelistTokenNotFound,
    #[msg("Invalid discount token")]
    InvalidDiscountToken,
    #[msg("Discount token not found")]
    DiscountTokenNotFound,
    #[msg("Invalid referrer")]
    InvalidReferrer,
    #[msg("Referrer not found")]
    ReferrerNotFound,
    #[msg("InvalidOracle")]
    InvalidOracle,
    #[msg("OracleNotFound")]
    OracleNotFound,
    #[msg("Liquidations Blocked By Oracle")]
    LiquidationsBlockedByOracle,
    #[msg("Can not deposit more than max deposit")]
    UserMaxDeposit,
    #[msg("Can not delete user that still has collateral")]
    CantDeleteUserWithCollateral,
    #[msg("AMM funding out of bounds pnl")]
    InvalidFundingProfitability,
    #[msg("Casting Failure")]
    CastingFailure,
    #[msg("Invalid Order")]
    InvalidOrder,
    #[msg("User has no order")]
    UserHasNoOrder,
    #[msg("Order Amount Too Small")]
    OrderAmountTooSmall,
    #[msg("Max number of orders taken")]
    MaxNumberOfOrders,
    #[msg("Order does not exist")]
    OrderDoesNotExist,
    #[msg("Order not open")]
    OrderNotOpen,
    #[msg("CouldNotFillOrder")]
    CouldNotFillOrder,
    #[msg("Reduce only order increased risk")]
    ReduceOnlyOrderIncreasedRisk,
    #[msg("Order state already initialized")]
    OrderStateAlreadyInitialized,
    #[msg("Unable to load AccountLoader")]
    UnableToLoadAccountLoader,
    #[msg("Trade Size Too Large")]
    TradeSizeTooLarge,
    #[msg("Unable to write to remaining account")]
    UnableToWriteToRemainingAccount,
    #[msg("User cant refer themselves")]
    UserCantReferThemselves,
    #[msg("Did not receive expected referrer")]
    DidNotReceiveExpectedReferrer,
    #[msg("Could not deserialize referrer")]
    CouldNotDeserializeReferrer,
    #[msg("Market order must be in place and fill")]
    MarketOrderMustBeInPlaceAndFill,
    #[msg("User Order Id Already In Use")]
    UserOrderIdAlreadyInUse,
    #[msg("Position cannot be liquidated")]
    PositionCannotBeLiquidated,
    #[msg("Invalid Margin Ratio")]
    InvalidMarginRatio,
    #[msg("Cant Cancel Post Only Order")]
    CantCancelPostOnlyOrder,
    #[msg("InvalidOracleOffset")]
    InvalidOracleOffset,
    #[msg("CantExpireOrders")]
    CantExpireOrders,
    #[msg("UserMustForgoSettlement")]
    UserMustForgoSettlement,
    #[msg("NoAvailableCollateralToBeClaimed")]
    NoAvailableCollateralToBeClaimed,
    #[msg("SettlementNotEnabled")]
    SettlementNotEnabled,
    #[msg("MustCallSettlePositionFirst")]
    MustCallSettlePositionFirst,
}

#[macro_export]
macro_rules! print_error {
    ($err:expr) => {{
        || {
            let error_code: ErrorCode = $err;
            msg!("{:?} thrown at {}:{}", error_code, file!(), line!());
            $err
        }
    }};
}

#[macro_export]
macro_rules! math_error {
    () => {{
        || {
            let error_code = $crate::error::ErrorCode::MathError;
            msg!("Error {} thrown at {}:{}", error_code, file!(), line!());
            error_code
        }
    }};
}
