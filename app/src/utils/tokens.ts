import { PublicKey } from '@solana/web3.js';
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import BN from 'bn.js';
import type { AnchorProvider } from '@project-serum/anchor';

export const getATATokenBalance = async (
  provider: AnchorProvider,
  mint: PublicKey,
  walletAddr?: PublicKey,
): Promise<BN> => {
  const [ata] = getATA(
    mint,
    walletAddr ? walletAddr : provider.wallet.publicKey,
  );

  return new BN(
    (await provider.connection.getTokenAccountBalance(ata)).value.amount,
  );
};

export const getTokenBalance = async (
  provider: AnchorProvider,
  mint: PublicKey,
  tokenAccount: PublicKey,
): Promise<BN> => {
  return new BN(
    (
      await provider.connection.getTokenAccountBalance(tokenAccount)
    ).value.amount,
  );
};

export const getATA = (mint: PublicKey, owner: PublicKey) => {
  return PublicKey.findProgramAddressSync(
    [owner.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    ASSOCIATED_TOKEN_PROGRAM_ID,
  );
};