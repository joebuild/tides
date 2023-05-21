import BN from 'bn.js';
import { Keypair, PublicKey, SystemProgram } from '@solana/web3.js';
import { getMarkets, getConfig, getUserData } from './data';
import { OptionSide, type Markets, type MarketSideData } from '../types';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { getUserPDA } from '../utils/pda';
import type { AnchorProvider, Program } from '@project-serum/anchor';
import type { Tides } from '../idl/tides';
import { getComputeIx } from '../utils/compute';

export const positionLiquidate = async (
  program: Program<Tides>,
  provider: AnchorProvider,
  positionHolderAddr: PublicKey,
  marketIndex: number,
  optionSide: OptionSide,
  quoteAmount: number,
  baseAmount: number,
  devTestKeyPair?: Keypair,
): Promise<string> => {
  const liquidatooorAddr = devTestKeyPair
    ? devTestKeyPair.publicKey
    : provider.wallet.publicKey;

  const [liquidatooorPda] = getUserPDA(program.programId, liquidatooorAddr);

  const [user, userPda] = await getUserData(program, positionHolderAddr);
  const [config, configPda] = await getConfig(program);
  const [markets, marketsPda] = await getMarkets(program, config.markets);

  const market = (markets.markets as Markets)[marketIndex];
  const marketSide = (
    optionSide == OptionSide.Call ? market.callMarketData : market.putMarketData
  ) as MarketSideData;

  const signers = [];

  if (devTestKeyPair) {
    signers.push(devTestKeyPair);
  }

  const ixs = [getComputeIx(1000000)]

  return program.methods
    .positionLiquidate(
      new BN(market.index),
      optionSide == OptionSide.Call ? { call: {} } : { put: {} },
      new BN(quoteAmount),
      new BN(baseAmount),
    )
    .accounts({
      liquidatooor: liquidatooorAddr,
      liquidatooorPda: liquidatooorPda,
      user: positionHolderAddr,
      userPda: userPda,
      userPositions: user.positions,
      userHistory: user.history,
      config: configPda,
      markets: marketsPda,
      fundingData: marketSide.fundingData,
      globalCollateralVault: config.collateralVault,
      marketCollateralVault: marketSide.collateralVault,
      insuranceVault: config.insuranceVault,
      globalCollateralVaultAuthority: config.collateralVaultAuthority,
      marketCollateralVaultAuthority: marketSide.collateralVaultAuthority,
      treasuryVault: config.treasuryVault,
      oraclePriceFeed: market.oraclePriceFeed,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .preInstructions(ixs)
    .signers(signers)
    .rpc();
};
