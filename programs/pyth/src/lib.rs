use anchor_lang::prelude::*;
mod pc;
use pc::Price;

declare_id!("ASfdvRMCan2aoWtbDi5HLXhz2CFfgEkuDoxc57bJLKLX");

#[program]
pub mod pyth {
    use pyth_sdk_solana::state::AccountType;

    use super::*;

    pub fn initialize(ctx: Context<Initialize>, price: i64, expo: i32, _conf: u64) -> Result<()> {
        let oracle = &ctx.accounts.price;

        let mut price_oracle = Price::load(oracle).unwrap();

        price_oracle.magic = 0xa1b2c3d4;
        price_oracle.ver = 2;
        price_oracle.atype = AccountType::Price as u32;

        price_oracle.agg.price = price;
        price_oracle.agg.conf = 0;

        price_oracle.twap = price;
        price_oracle.expo = expo;

        price_oracle.ptype = pc::PriceType::Price;
        
        Ok(())
    }

    pub fn set_price(ctx: Context<SetPrice>, price: i64) -> Result<()> {
        let oracle = &ctx.accounts.price;
        let mut price_oracle = Price::load(oracle).unwrap();

        price_oracle.twap = price_oracle
            .twap
            .checked_add(price)
            .unwrap()
            .checked_div(2)
            .unwrap(); //todo
        price_oracle.agg.price = price as i64;

        Ok(())
    }

    pub fn set_twap(ctx: Context<SetPrice>, twap: i64) -> Result<()> {
        let oracle = &ctx.accounts.price;
        let mut price_oracle = Price::load(oracle).unwrap();

        price_oracle.twap = twap;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct SetPrice<'info> {
    /// CHECK: this program is just for testing
    #[account(mut)]
    pub price: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    /// CHECK: this program is just for testing
    #[account(mut)]
    pub price: AccountInfo<'info>,
}
