import type { PublicKey } from '@solana/web3.js';
import type { IdlAccounts, Program } from '@project-serum/anchor';
import type { Tides } from '../idl/tides';
import { getConfigPDA, getUserPDA } from '../utils/pda';
import {
  type Market,
  type Markets,
  type Config,
  type User,
  type UserPositions,
  type UserHistory,
  type FundingData,
  OptionSide,
  type MarketSideData,
  type UserDataWrapper,
  type CollateralVaultPosition,
  type CollateralVaultPositionWrapped,
} from '../types';
import { collateralVaultPositionsUserFilter } from './filters';

export const getUserData = async (
  program: Program<Tides>,
  userAddress: PublicKey,
): Promise<[User, PublicKey]> => {
  const [userPda] = getUserPDA(program.programId, userAddress);

  return [await program.account.user.fetch(userPda), userPda];
};

export const getUserPositions = async (
  program: Program<Tides>,
  userAddress: PublicKey,
): Promise<[UserPositions, PublicKey]> => {
  const [userData] = await getUserData(program, userAddress);

  return [
    await program.account.userPositions.fetch(userData.positions),
    userData.positions,
  ];
};

export const getUserPositionsWithPda = async (
  program: Program<Tides>,
  userPositionAddress: PublicKey,
): Promise<[UserPositions, PublicKey]> => {
  return [
    await program.account.userPositions.fetch(userPositionAddress),
    userPositionAddress,
  ];
};

export const getUserHistory = async (
  program: Program<Tides>,
  userAddress: PublicKey,
): Promise<[UserHistory, PublicKey]> => {
  const [userData] = await getUserData(program, userAddress);

  return [
    await program.account.userHistory.fetch(userData.history),
    userData.history,
  ];
};

export const getAllUsersData = async (
  program: Program<Tides>,
): Promise<UserDataWrapper[]> => {
  return (await program.account.user.all()) as unknown as UserDataWrapper[];
};

export const getConfig = async (
  program: Program<Tides>,
): Promise<[Config, PublicKey]> => {
  const [configPda] = getConfigPDA(program.programId);

  return [await program.account.config.fetch(configPda), configPda];
};

export const getMarkets = async (
  program: Program<Tides>,
  marketsPdaOpt?: PublicKey,
): Promise<[Markets, PublicKey]> => {
  let marketsPda = marketsPdaOpt;

  if (!marketsPda) {
    const [config] = await getConfig(program);
    marketsPda = config.markets;
  }

  return [await program.account.markets.fetch(marketsPda), marketsPda];
};

export const getMarketByIndex = async (
  program: Program<Tides>,
  marketIndex: number,
): Promise<Market> => {
  const [config] = await getConfig(program);
  const [markets] = await getMarkets(program, config.markets);

  return (markets.markets as Market[])[marketIndex];
};

export const getFundingData = async (
  program: Program<Tides>,
  fundingDataAddr: PublicKey,
): Promise<[FundingData, PublicKey]> => {
  return [
    await program.account.fundingData.fetch(fundingDataAddr),
    fundingDataAddr,
  ];
};

export const getFundingDataForMarket = async (
  program: Program<Tides>,
  marketIndex: number,
  optionSide: OptionSide,
): Promise<[FundingData, PublicKey]> => {
  const market = await getMarketByIndex(program, marketIndex);

  return optionSide === OptionSide.Call
    ? getFundingData(
      program,
      (market.callMarketData as MarketSideData).fundingData,
    )
    : getFundingData(
      program,
      (market.putMarketData as MarketSideData).fundingData,
    );
};

export const getCollateralVaultPositionData = async (
  program: Program<Tides>,
  positionAddr: PublicKey,
): Promise<[CollateralVaultPosition, PublicKey]> => {
  return [await program.account.collateralVaultPosition.fetch(positionAddr), positionAddr];
};

export const getCollateralVaultPositionsForUser = async (
  program: Program<Tides>,
  userAddr: PublicKey,
): Promise<[[CollateralVaultPosition, PublicKey]]> => {
  const positionsWrapped = await program.account.collateralVaultPosition.all([collateralVaultPositionsUserFilter(userAddr)]) as unknown as CollateralVaultPositionWrapped[];
  return positionsWrapped.map(p => [p.account as CollateralVaultPosition, p.publicKey as PublicKey])
};