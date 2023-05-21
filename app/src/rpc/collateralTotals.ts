import type { AnchorProvider, Program } from '@project-serum/anchor';
import type { Tides } from '../idl/tides';
import { getConfig, getMarkets, getUserData, getUserPositions } from './data';
import {
  type MarketSideData,
  OptionSide,
  type Position,
  type Markets,
} from '../types';

export const collateralTotals = async (
  program: Program<Tides>,
  provider: AnchorProvider,
  marketIndex: number,
  optionSide: OptionSide,
): Promise<[number, number]> => {
  const [user] = await getUserData(program, provider.wallet.publicKey);
  const [config] = await getConfig(program);
  const [markets] = await getMarkets(program, config.markets);

  const market = (markets.markets as Markets)[marketIndex];
  const marketSide = (
    optionSide == OptionSide.Call ? market.callMarketData : market.putMarketData
  ) as MarketSideData;

  const marketCollateralBalance = (
    await provider.connection.getTokenAccountBalance(marketSide.collateralVault)
  ).value.uiAmount;
  const globalCollateralBalance = (
    await provider.connection.getTokenAccountBalance(config.collateralVault)
  ).value.uiAmount;

  const treasuryBalance = (
    await provider.connection.getTokenAccountBalance(config.treasuryVault)
  ).value.uiAmount;
  const insuranceBalance = (
    await provider.connection.getTokenAccountBalance(config.insuranceVault)
  ).value.uiAmount;

  const total =
    marketCollateralBalance +
    globalCollateralBalance +
    treasuryBalance +
    insuranceBalance;

  const [positions] = await getUserPositions(
    program,
    provider.wallet.publicKey,
  );

  const position = (positions.positions as Position[]).find(
    x => x.marketIndex == market.index,
  );

  const userTotal =
    position.totalCollateralDeposits.toNumber() + user.collateral.toNumber();

  console.log('marketCollateralBalance: ', marketCollateralBalance);
  console.log('globalCollateralBalance: ', globalCollateralBalance);
  console.log('treasuryBalance: ', treasuryBalance);
  console.log('insuranceBalance: ', insuranceBalance);

  console.log(
    'position.quoteAssetAmount: ',
    position.quoteAssetAmount.toNumber() / 10 ** 6,
  );

  console.log(
    'position.collateralDeposits: ',
    position.totalCollateralDeposits.toNumber() / 10 ** 6,
  );
  console.log(
    'user.account.collateral: ',
    user.collateral.toNumber() / 10 ** 6,
  );

  const constant =
    marketCollateralBalance +
    globalCollateralBalance +
    treasuryBalance +
    insuranceBalance; // + position.collateralDeposits.toNumber() / 10 ** 6 + user.account.collateral.toNumber() / 10 ** 6

  console.log('constant: ', constant);

  return [total, userTotal];
};
