import { writable } from 'svelte/store';
import {
  TokenListProvider,
  ENV,
  type TokenInfo,
} from '@solana/spl-token-registry';
import type EventEmitter from 'eventemitter3';
import type { Program } from '@project-serum/anchor';
import type { Tides } from '$idl/tides';
import { getMarkets } from '$src/rpc/data';
import type { Market, Markets } from '$src/types';

export const tokens = writable([] as TokenInfo[]);
export const selectedToken = writable(null as TokenInfo);

export const getTokenList = async (): Promise<TokenInfo[]> => {
  const tokenProvider = await new TokenListProvider().resolve();
  const tokenList = tokenProvider.filterByChainId(ENV.MainnetBeta).getList();

  tokenList.reduce((map, item) => {
    map.set(item.symbol, item);
    return map;
  }, new Map());

  return tokenList;
};

export const markets = writable({} as Markets);
let marketsEmitter: EventEmitter = undefined;

export const selectedMarket = writable({} as Market);

export const setMarkets = async (program: Program<Tides>) => {
  const [marketsData, marketsPda] = await getMarkets(program);

  markets.set(marketsData as Markets);

  marketsEmitter = program.account.markets.subscribe(marketsPda, 'confirmed');
  marketsEmitter.on('change', account => {
    markets.set(account);
  });
};

export const unsetMarkets = async (program: Program<Tides>) => {
  const m = await getMarkets(program);
  program.account.markets.unsubscribe(m[1]);
};
