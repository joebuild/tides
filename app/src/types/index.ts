import type { IdlAccounts, IdlTypes } from '@project-serum/anchor';
import type { PublicKey } from '@solana/web3.js';
import type { Tides } from '../idl/tides';

export type User = IdlAccounts<Tides>['user'];
export type UserDataWrapper = {
  account: User;
  publicKey: PublicKey;
};

export type UserPositions = IdlAccounts<Tides>['userPositions'];
export type UserHistory = IdlAccounts<Tides>['userHistory'];
export type Config = IdlAccounts<Tides>['config'];
export type Markets = IdlAccounts<Tides>['markets'];

export type FundingData = IdlAccounts<Tides>['fundingData'];
export type FundingRecordsTier = IdlTypes<Tides>['FundingRecordsTier'];
export type FundingRecord = IdlTypes<Tides>['FundingRecord'];

export type Position = IdlTypes<Tides>['Position'];
export type MarketSideData = IdlTypes<Tides>['MarketSideData'];
export type Market = IdlTypes<Tides>['Market'];

export type CollateralVaultPosition = IdlAccounts<Tides>['collateralVaultPosition'];

export type CollateralVaultPositionWrapped = {
  account: IdlAccounts<Tides>['collateralVaultPosition'];
  publicKey: PublicKey;
};

export type OrderRecord = IdlTypes<Tides>['OrderRecord'];

export enum OptionSide {
  Call,
  Put,
}

export enum OrderSide {
  Long,
  Short,
}

export type Exposure = {
  assetExposure: number;
  fundingExposure: number;
  totalExposure: number;
};

export type Point = {
  label: string;
  value: number;
};
