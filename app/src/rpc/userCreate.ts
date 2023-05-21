import { Keypair, SystemProgram } from '@solana/web3.js';
import * as anchor from '@project-serum/anchor';
import type { AnchorProvider, Program } from '@project-serum/anchor';
import type { Tides } from '../idl/tides';
import { getUserPDA } from '../utils/pda';

export const userCreate = async (
  program: Program<Tides>,
  provider: AnchorProvider,
  devTestKeyPair?: Keypair,
): Promise<string> => {
  const userAddr = devTestKeyPair
    ? devTestKeyPair.publicKey
    : provider.wallet.publicKey;

  const [userPda] = getUserPDA(program.programId, provider.wallet.publicKey);

  const userPositions = anchor.web3.Keypair.generate();
  const userHistory = anchor.web3.Keypair.generate();

  const signers = [userPositions, userHistory];

  if (devTestKeyPair) {
    signers.push(devTestKeyPair);
  }

  return program.methods
    .userCreate()
    .accounts({
      user: userAddr,
      userPda: userPda,
      userPositions: userPositions.publicKey,
      userHistory: userHistory.publicKey,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      systemProgram: SystemProgram.programId,
    })
    .preInstructions([
      await program.account.userPositions.createInstruction(userPositions),
      await program.account.userHistory.createInstruction(userHistory),
    ])
    .signers(signers)
    .rpc();
};
