import { SystemProgram } from '@solana/web3.js';
import type { AnchorProvider, Program } from '@project-serum/anchor';
import type { Tides } from '../idl/tides';
import BN from 'bn.js';
import { getMarkets, getConfig, getUserData } from './data';
import { OptionSide, type Markets, type MarketSideData } from '../types';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

export const positionAddCollateral = async (
  program: Program<Tides>,
  provider: AnchorProvider,
  marketIndex: number,
  optionSide: OptionSide,
  collateralAmount: number,
): Promise<string> => {
  const [user, userPda] = await getUserData(program, provider.wallet.publicKey);
  const [config, configPda] = await getConfig(program);
  const [markets, marketsPda] = await getMarkets(program, config.markets);

  const market = (markets.markets as Markets)[marketIndex];
  const marketSide = (
    optionSide == OptionSide.Call ? market.callMarketData : market.putMarketData
  ) as MarketSideData;

  return program.methods
    .positionAddCollateral(
      new BN(market.index),
      optionSide == OptionSide.Call ? { call: {} } : { put: {} },
      new BN(collateralAmount),
    )
    .accounts({
      user: provider.wallet.publicKey,
      userPda: userPda,
      userPositions: user.positions,
      config: configPda,
      markets: marketsPda,
      globalCollateralVault: config.collateralVault,
      marketCollateralVault: marketSide.collateralVault,
      globalCollateralVaultAuthority: config.collateralVaultAuthority,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .rpc();
};
