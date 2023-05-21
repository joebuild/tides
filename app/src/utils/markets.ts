import {
  OptionSide,
  type Exposure,
  type Market,
  type MarketSideData,
} from '../types';

export const getOptionSideFromData = (side): OptionSide => {
  return Object.keys(side)[0] === 'call' ? OptionSide.Call : OptionSide.Put;
};

export const getExposure = (
  market: Market,
  marketSideData: MarketSideData,
): Exposure => {
  const assetPrice =
    market.oraclePrice.toNumber() / 10 ** market.collateralDecimals;
  const assetEma =
    market.emaNumeratorSum.div(market.emaDenominatorSum).toNumber() /
    10 ** market.collateralDecimals;

  const payoff = getPayoff(
    getOptionSideFromData(marketSideData.side),
    assetPrice,
    assetEma,
  );
  const mark =
    marketSideData.markPrice.toNumber() / 10 ** market.collateralDecimals;

  const feePerQuote = Math.abs(mark - payoff);
  const quoteNetAbs =
    marketSideData.quoteAssetAmountNet.abs().toNumber() /
    10 ** market.collateralDecimals;
  const fundingExposure = feePerQuote * quoteNetAbs;

  const assetExposure = quoteNetAbs * mark;

  return {
    assetExposure: assetExposure,
    fundingExposure: fundingExposure,
    totalExposure: assetExposure + fundingExposure,
  };
};

export function getPayoff(
  side: OptionSide,
  price: number,
  ema: number,
): number {
  return side === OptionSide.Call
    ? Math.max(price - ema, 0)
    : Math.max(ema - price, 0);
}
