use anchor_lang::{AnchorSerialize, AnchorDeserialize};

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Debug, Eq, PartialEq)]
pub enum OptionSide {
    Call,
    Put,
}

impl Default for OptionSide {
    fn default() -> Self {
        OptionSide::Call
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Debug, Eq, PartialEq)]
pub enum OrderSide {
    Long,
    Short,
}

impl Default for OrderSide {
    fn default() -> Self {
        OrderSide::Long
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Debug, Eq, PartialEq)]
pub enum PositionChangeDirection {
    Increase,
    Decrease,
}

impl Default for PositionChangeDirection {
    fn default() -> Self {
        PositionChangeDirection::Increase
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Debug, Eq, PartialEq)]
pub enum ExposureStatus {
    Delever,
    AboveMax,
    AboveTarget,
    BelowTarget,
}

impl Default for ExposureStatus {
    fn default() -> Self {
        ExposureStatus::AboveTarget
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Debug, Eq, PartialEq)]
pub enum ExposureDirection {
    Increase,
    Decrease,
}

impl Default for ExposureDirection {
    fn default() -> Self {
        ExposureDirection::Increase
    }
}