import {
  Keypair,
  SystemProgram,
  TransactionInstruction,
} from '@solana/web3.js';
import type { AnchorProvider, Program } from '@project-serum/anchor';
import type { Tides } from '../idl/tides';
import BN from 'bn.js';
import { getMarkets, getConfig, getUserData } from './data';
import { OptionSide, type Markets, type MarketSideData } from '../types';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { getComputeIx } from '../../src/utils/compute';

export const positionChange = async (
  program: Program<Tides>,
  provider: AnchorProvider,
  marketIndex: number,
  optionSide: OptionSide,
  quoteAmount: number,
  baseAmount: number,
  slippageTolerance: number,
  closePosition: boolean,
  reduceOnly: boolean,
  additionalIxs?: TransactionInstruction[],
  devTestKeyPair?: Keypair,
): Promise<string> => {
  const userAddr = devTestKeyPair
    ? devTestKeyPair.publicKey
    : provider.wallet.publicKey;

  const [user, userPda] = await getUserData(program, userAddr);
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

  let ixs = [getComputeIx(1000000)]
  ixs = ixs.concat(additionalIxs)

  return program.methods
    .positionChange(
      new BN(market.index),
      optionSide == OptionSide.Call ? { call: {} } : { put: {} },
      new BN(quoteAmount),
      new BN(baseAmount),
      new BN(slippageTolerance),
      closePosition,
      reduceOnly,
    )
    .accounts({
      user: userAddr,
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

export const positionChangeIx = async (
  program: Program<Tides>,
  provider: AnchorProvider,
  marketIndex: number,
  optionSide: OptionSide,
  quoteAmount: number,
  baseAmount: number,
  slippageTolerance: number,
  closePosition: boolean,
  reduceOnly: boolean,
  devTestKeyPair?: Keypair,
): Promise<TransactionInstruction> => {
  const userAddr = devTestKeyPair
    ? devTestKeyPair.publicKey
    : provider.wallet.publicKey;

  const [user, userPda] = await getUserData(program, userAddr);
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

  return program.methods
    .positionChange(
      new BN(market.index),
      optionSide == OptionSide.Call ? { call: {} } : { put: {} },
      new BN(quoteAmount),
      new BN(baseAmount),
      new BN(slippageTolerance),
      closePosition,
      reduceOnly,
    )
    .accounts({
      user: userAddr,
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
    .signers(signers)
    .instruction();
};
