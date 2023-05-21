import type { Tides } from '$idl/tides';
import type { Program } from '@project-serum/anchor';
import { writable } from 'svelte/store';
import type EventEmitter from 'eventemitter3';
import { getFundingData, getMarkets } from '$src/rpc/data';
import type { FundingData, Market, MarketSideData } from '$src/types';

export type MarketFunding = {
  marketIndex: number;
  callFunding: FundingData;
  putFunding: FundingData;
};

export type MarketFundingEmitters = {
  callFundingEmitter: EventEmitter;
  putFundingEmitter: EventEmitter;
};

export const fundingData = writable([] as MarketFunding[]);

let fundingEmitters: MarketFundingEmitters[];

export const setFundingData = async (program: Program<Tides>) => {
  const [marketsData] = await getMarkets(program);

  const markets = (marketsData.markets as Market[]).filter(m => m.initialized);

  const fundingDataArray: MarketFunding[] = new Array<MarketFunding>(
    markets.length,
  );
  fundingEmitters = new Array<MarketFundingEmitters>(markets.length);

  for (const [i, market] of markets.entries()) {
    const callSideData = market.callMarketData as MarketSideData;
    const putSideData = market.putMarketData as MarketSideData;

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

    const callEmitter = program.account.fundingData.subscribe(
      callFundingAddr,
      'confirmed',
    );
    const putEmitter = program.account.fundingData.subscribe(
      putFundingAddr,
      'confirmed',
    );

    fundingEmitters[i] = {
      callFundingEmitter: callEmitter,
      putFundingEmitter: putEmitter,
    };

    callEmitter.on('change', account => {
      fundingData.update(marketFundingArray => {
        const fundingData = account as FundingData;
        const existing = marketFundingArray[fundingData.marketIndex];

        if (existing) {
          existing.callFunding = fundingData;
          marketFundingArray[fundingData.marketIndex] = existing;
        }

        return marketFundingArray;
      });
    });

    putEmitter.on('change', account => {
      fundingData.update(marketFundingArray => {
        const fundingData = account as FundingData;
        const existing = marketFundingArray[fundingData.marketIndex];

        if (existing) {
          existing.putFunding = fundingData;
          marketFundingArray[fundingData.marketIndex] = existing;
        }

        return marketFundingArray;
      });
    });
  }

  fundingData.set(fundingDataArray);
};
