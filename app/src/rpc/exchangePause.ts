import { SystemProgram } from '@solana/web3.js';
import type { AnchorProvider, IdlTypes, Program } from '@project-serum/anchor';
import type { Tides } from '../idl/tides';
import BN from 'bn.js';
import { getMarkets, getConfig } from './data';

export const exchangePause = async (
  program: Program<Tides>,
  provider: AnchorProvider
): Promise<string> => {
  const [config, configPda] = await getConfig(program);

  return program.methods
    .exchangePause()
    .accounts({
      admin: provider.wallet.publicKey,
      config: configPda,
      systemProgram: SystemProgram.programId,
    })
    .rpc();
};
