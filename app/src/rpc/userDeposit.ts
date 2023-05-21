import { Keypair, PublicKey, SystemProgram } from '@solana/web3.js';
import type { AnchorProvider, Program } from '@project-serum/anchor';
import * as anchor from '@project-serum/anchor';
import type { Tides } from '../idl/tides';
import {
  getConfigPDA,
  getGlobalCollateralVaultTA,
  getUserPDA,
} from '../utils/pda';
import type BN from 'bn.js';
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { getATA } from '../utils/tokens';

export const userDeposit = async (
  program: Program<Tides>,
  provider: AnchorProvider,
  amount: BN,
  collateralMint: PublicKey,
  devTestKeyPair?: Keypair,
): Promise<string> => {
  const userAddr = devTestKeyPair
    ? devTestKeyPair.publicKey
    : provider.wallet.publicKey;

  const [userPda] = getUserPDA(program.programId, userAddr);

  const [configPda] = getConfigPDA(program.programId);

  const [userAta] = getATA(collateralMint, userAddr);
  const [collateralVault] = getGlobalCollateralVaultTA(program.programId);

  const signers = [];

  if (devTestKeyPair) {
    signers.push(devTestKeyPair);
  }

  return program.methods
    .userDeposit(amount)
    .accounts({
      user: userAddr,
      userPda: userPda,
      userAta: userAta,
      collateralVault: collateralVault,
      collateralMint: collateralMint,
      config: configPda,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      tokenProgram: TOKEN_PROGRAM_ID,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      systemProgram: SystemProgram.programId,
    })
    .signers(signers)
    .rpc();
};
