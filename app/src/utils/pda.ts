import { PublicKey } from '@solana/web3.js';
import { Buffer } from 'buffer';
import {
  USER_PDA_PREFIX,
  CONFIG_PDA_PREFIX,
  CALL_SEED,
  PUT_SEED,
  COLLATERAL_VAULT_SEED,
  INSURANCE_VAULT_SEED,
  TREASURY_VAULT_SEED,
} from '../utils/constants';
import { OptionSide } from '../types';

export const getUserPDA = (
  programId: PublicKey,
  userAddr: PublicKey,
): [PublicKey, number] => {
  return PublicKey.findProgramAddressSync(
    [encode(USER_PDA_PREFIX), userAddr.toBuffer()],
    programId,
  );
};

export const getConfigPDA = (programId: PublicKey): [PublicKey, number] => {
  return PublicKey.findProgramAddressSync(
    [encode(CONFIG_PDA_PREFIX)],
    programId,
  );
};

export const getGlobalTreasuryVaultTA = (
  programId: PublicKey,
): [PublicKey, number] => {
  return PublicKey.findProgramAddressSync(
    [encode(TREASURY_VAULT_SEED)],
    programId,
  );
};

export const getGlobalCollateralVaultTA = (
  programId: PublicKey,
): [PublicKey, number] => {
  return PublicKey.findProgramAddressSync(
    [encode(COLLATERAL_VAULT_SEED)],
    programId,
  );
};

export const getGlobalInsuranceVaultTA = (
  programId: PublicKey,
): [PublicKey, number] => {
  return PublicKey.findProgramAddressSync(
    [
      encode(INSURANCE_VAULT_SEED),
    ],
    programId
  )
}

export const getVaultAuthority = (
  programId: PublicKey,
  vault: PublicKey,
): [PublicKey, number] => {
  return PublicKey.findProgramAddressSync([vault.toBuffer()], programId);
};

export const getMarketCollateralVaultTA = (
  programId: PublicKey,
  side: OptionSide,
  quoteMint: PublicKey,
): [PublicKey, number] => {
  const sideSeed = side == OptionSide.Call ? CALL_SEED : PUT_SEED;

  return PublicKey.findProgramAddressSync(
    [encode(sideSeed), encode(COLLATERAL_VAULT_SEED), quoteMint.toBuffer()],
    programId,
  );
};

export const encode = (x: string) => Buffer.from(x)
