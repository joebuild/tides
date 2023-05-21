import type { MarketFunding } from '$src/stores/funding';
import { getOptionSideFromData } from './markets';
import { getUpdatedFundingForPosition } from '$src/utils/funding';
import { getFundingData } from '$src/rpc/data';
import type { Program } from '@project-serum/anchor';
import type { Tides } from '$idl/tides';
import {
  OptionSide,
  type Market,
  type MarketSideData,
  type Position,
} from '$src/types';

export function getQuoteAssetReadable(
  position: Position,
  marketsArray: Market[],
): number {
  if (position && marketsArray) {
    const market = marketsArray[position.marketIndex] as Market;
    return (
      position.quoteAssetAmount.toNumber() / 10 ** market.collateralDecimals
    );
  } else {
    return 0;
  }
}

export function getBaseAssetValueReadable(
  position: Position,
  marketsArray: Market[],
): number {
  if (position && marketsArray) {
    const optionSide = getOptionSideFromData(position.side);
    const market = marketsArray[position.marketIndex] as Market;
    const marketSideData = (
      optionSide === OptionSide.Call
        ? market.callMarketData
        : market.putMarketData
    ) as MarketSideData;

    const quoteAmount = getQuoteAssetReadable(position, marketsArray);

    return (
      (quoteAmount * marketSideData.markPrice.toNumber()) /
      10 ** market.collateralDecimals
    );
  } else {
    return 0;
  }
}

export function getNetValueReadable(
  position: Position,
  marketsArray: Market[],
  fundingData: MarketFunding[],
): number {
  if (position && marketsArray) {
    const optionSide = getOptionSideFromData(position.side);
    const market = marketsArray[position.marketIndex] as Market;
    const marketSideData = (
      optionSide === OptionSide.Call
        ? market.callMarketData
        : market.putMarketData
    ) as MarketSideData;

    const quoteAmount = getQuoteAssetReadable(position, marketsArray);

    if (quoteAmount > 0) {
      return (
        (quoteAmount * marketSideData.markPrice.toNumber()) /
          10 ** market.collateralDecimals +
        positionFunding(position, fundingData) /
          10 ** market.collateralDecimals +
        position.additionalCollateralDeposits.toNumber() /
          10 ** market.collateralDecimals
      );
    } else {
      return (
        2 *
          (position.totalCollateralDeposits.toNumber() /
            10 ** market.collateralDecimals) -
        position.additionalCollateralDeposits.toNumber() /
          10 ** market.collateralDecimals -
        (Math.abs(quoteAmount) * marketSideData.markPrice.toNumber()) /
          10 ** market.collateralDecimals +
        positionFunding(position, fundingData) / 10 ** market.collateralDecimals
      );
    }
  } else {
    return 0;
  }
}

export function getDepositedCollateralReadable(
  position: Position,
  marketsArray: Market[],
): number {
  if (position && marketsArray) {
    const market = marketsArray[position.marketIndex] as Market;

    return (
      position.totalCollateralDeposits.toNumber() /
        10 ** market.collateralDecimals -
      position.additionalCollateralDeposits.toNumber() /
        10 ** market.collateralDecimals
    );
  } else {
    return 0;
  }
}

export function healthPercent(
  position: Position,
  marketsArray: Market[],
  fundingData: MarketFunding[],
): number {
  return (
    (100 * getNetValueReadable(position, marketsArray, fundingData)) /
    getDepositedCollateralReadable(position, marketsArray)
  );
}

export function maxCollateralToAddReadable(
  position: Position,
  marketsArray: Market[],
  fundingData: MarketFunding[],
): number {
  return (
    getDepositedCollateralReadable(position, marketsArray) -
    getNetValueReadable(position, marketsArray, fundingData)
  );
}

export function positionFunding(
  position: Position,
  fundingData: MarketFunding[],
): number {
  const optionSide = getOptionSideFromData(position.side);

  if (fundingData && fundingData[position.marketIndex]) {
    const marketFundingData = fundingData[position.marketIndex];
    const fundingObj =
      optionSide === OptionSide.Call
        ? marketFundingData.callFunding
        : marketFundingData.putFunding;
    return getUpdatedFundingForPosition(position, fundingObj);
  } else {
    return 0;
  }
}

export async function getAllFundingData(
  program: Program<Tides>,
  markets: Market[],
): Promise<MarketFunding[]> {
  const fundingDataArray: MarketFunding[] = new Array<MarketFunding>(
    markets.length,
  );

  for (const [i, market] of markets.entries()) {
    const callSideData = market.callMarketData as MarketSideData;
    const putSideData = market.putMarketData as MarketSideData;

    if (market.initialized) {
      const callFundingAddr = callSideData.fundingData;
      const putFundingAddr = putSideData.fundingData;

      const [callFundingData] = await getFundingData(program, callFundingAddr);
      const [putFundingData] = await getFundingData(program, putFundingAddr);

      const marketFunding: MarketFunding = {
        marketIndex: market.index,
        callFunding: callFundingData,
        putFunding: putFundingData,
      };

      fundingDataArray[i] = marketFunding;
    }
  }

  return fundingDataArray;
}
