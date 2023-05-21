import { SystemProgram } from '@solana/web3.js';
import type { AnchorProvider, IdlTypes, Program } from '@project-serum/anchor';
import type { Tides } from '../idl/tides';
import BN from 'bn.js';
import { getMarkets, getConfig } from './data';

export const marketsDestroy = async (
  program: Program<Tides>,
  provider: AnchorProvider
): Promise<string> => {
  const [config, configPda] = await getConfig(program);
  const [markets, marketsPda] = await getMarkets(program, config.markets);

  return program.methods
    .marketsDestroy()
    .accounts({
      admin: provider.wallet.publicKey,
      config: configPda,
      markets: marketsPda,
      systemProgram: SystemProgram.programId,
    })
    .rpc();
};
