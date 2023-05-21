import BN from 'bn.js';
import { SystemProgram } from '@solana/web3.js';
import type { AnchorProvider, IdlTypes, Program } from '@project-serum/anchor';
import type { Tides } from '../idl/tides';
import { getMarkets, getConfig } from './data';

export const marketResume = async (
  program: Program<Tides>,
  provider: AnchorProvider,
  marketIndex: number,
): Promise<string> => {
  const [config, configPda] = await getConfig(program);
  const [markets, marketsPda] = await getMarkets(program, config.markets);

  const market = (markets.markets as IdlTypes<Tides>['Market'][])[marketIndex];

  return program.methods
    .marketResume(new BN(market.index))
    .accounts({
      admin: provider.wallet.publicKey,
      config: configPda,
      markets: marketsPda,
      systemProgram: SystemProgram.programId,
    })
    .rpc();
};
