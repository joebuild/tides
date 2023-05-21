import { SystemProgram } from '@solana/web3.js';
import type {
  AnchorProvider,
  //IdlTypes,
  Program,
} from '@project-serum/anchor';
import type { Tides } from '../idl/tides';
import BN from 'bn.js';
import { getMarkets, getConfig } from './data';
import type { Markets, MarketSideData } from '../types';
import { getComputeIx } from '../utils/compute';

export const marketStatsUpdate = async (
  program: Program<Tides>,
  provider: AnchorProvider,
  marketIndex: number,
): Promise<string> => {
  const [config, configPda] = await getConfig(program);
  const [markets, marketsPda] = await getMarkets(program, config.markets);

  const market = (markets.markets as Markets)[marketIndex];

  const callMarketData = market.callMarketData as MarketSideData;
  const putMarketData = market.putMarketData as MarketSideData;

  const ixs = [getComputeIx(1000000)]

  return program.methods
    .marketStatsUpdate(new BN(market.index))
    .accounts({
      user: provider.wallet.publicKey,
      config: configPda,
      markets: marketsPda,
      callFundingData: callMarketData.fundingData,
      putFundingData: putMarketData.fundingData,
      oraclePriceFeed: market.oraclePriceFeed,
      systemProgram: SystemProgram.programId,
    })
    .preInstructions(ixs)
    .rpc();
};
