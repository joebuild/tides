// import * as anchor from '@project-serum/anchor';
// import { getMarketCollateralVaultTA } from '../utils/pda';
import { SystemProgram } from '@solana/web3.js';
import type { Tides } from '../idl/tides';
import type BN from 'bn.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { getConfig, getMarkets } from './data';
import {
  OptionSide,
  type Market,
  type Markets,
  type MarketSideData,
} from '../types';
import { getATA } from '../utils/tokens';
import type {
  AnchorProvider,
  // IdlTypes,
  Program,
} from '@project-serum/anchor';

export const marketSideDeposit = async (
  program: Program<Tides>,
  provider: AnchorProvider,
  marketIndex: number,
  optionSide: OptionSide,
  depositAmount: BN,
): Promise<string> => {
  const [config, configPda] = await getConfig(program);
  const [markets, marketsPda] = await getMarkets(program, config.markets);

  const market = (markets.markets as Markets)[marketIndex] as Market;

  const callCollateralVault = (market.callMarketData as MarketSideData)
    .collateralVault;
  const putCollateralVault = (market.putMarketData as MarketSideData)
    .collateralVault;

  // const [callCollateralVault] = getMarketCollateralVaultTA(program.programId, OptionSide.Call, market.collateralMint)
  // const [putCollateralVault] = getMarketCollateralVaultTA(program.programId, OptionSide.Put, market.collateralMint)

  const [userAta] = getATA(config.collateralMint, provider.wallet.publicKey);

  return program.methods
    .marketSideDeposit(
      optionSide == OptionSide.Call ? { call: {} } : { put: {} },
      depositAmount,
    )
    .accounts({
      user: provider.wallet.publicKey,
      userAta: userAta,
      config: configPda,
      markets: marketsPda,
      quoteMint: market.mintQuote,
      collateralMint: config.collateralMint,
      callCollateralVault: callCollateralVault,
      putCollateralVault: putCollateralVault,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .rpc();
};
