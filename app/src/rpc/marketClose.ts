import { SystemProgram } from '@solana/web3.js';
import type { AnchorProvider, Program } from '@project-serum/anchor';
import * as anchor from '@project-serum/anchor';
import type { Tides } from '../idl/tides';
import BN from 'bn.js';
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { getConfig, getMarkets } from './data';
import type { Market, MarketSideData } from '../types';
import { getATA } from '../utils/tokens';

export const marketClose = async (
  program: Program<Tides>,
  provider: AnchorProvider,
  marketIndex: number,
): Promise<string> => {
  const [config, configPda] = await getConfig(program)
  const [userAta] = getATA(config.collateralMint, provider.wallet.publicKey)

  const [markets, marketsPda] = await getMarkets(program, config.markets);

  const market = markets.markets[marketIndex] as Market

  const callMarketData = market.callMarketData as MarketSideData
  const putMarketData = market.putMarketData as MarketSideData

  return program.methods
    .marketClose(
      new BN(marketIndex),
    )
    .accounts({
      admin: provider.wallet.publicKey,
      adminAta: userAta,
      config: configPda,
      markets: marketsPda,
      quoteMint: market.mintQuote,
      collateralMint: config.collateralMint,
      callCollateralVault: callMarketData.collateralVault,
      callCollateralVaultAuthority: callMarketData.collateralVaultAuthority,
      callMarketFundingData: callMarketData.fundingData,
      putCollateralVault: putMarketData.collateralVault,
      putCollateralVaultAuthority: putMarketData.collateralVaultAuthority,
      putMarketFundingData: putMarketData.fundingData,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      tokenProgram: TOKEN_PROGRAM_ID,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      systemProgram: SystemProgram.programId,
    })
    .rpc();
};
