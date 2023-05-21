import { SystemProgram } from '@solana/web3.js';
import { getMarkets, getConfig } from './data';
import type { AnchorProvider, Program } from '@project-serum/anchor';
import type { Tides } from '../idl/tides';

export const positionDelever = async (
  program: Program<Tides>,
  provider: AnchorProvider,
): Promise<string> => {
  const [config, configPda] = await getConfig(program);
  const [markets, marketsPda] = await getMarkets(program, config.markets);

  return program.methods
    .positionDelever()
    .accounts({
      admin: provider.wallet.publicKey,
      config: configPda,
      markets: marketsPda,
      systemProgram: SystemProgram.programId,
    })
    .rpc();
};
