import { PublicKey, SystemProgram } from '@solana/web3.js';
import type { AnchorProvider, Program } from '@project-serum/anchor';
import * as anchor from '@project-serum/anchor';
import type { Tides } from '../idl/tides';
import { getMarketCollateralVaultTA, getVaultAuthority } from '../utils/pda';
import BN from 'bn.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { getConfig, getMarkets } from './data';
import { OptionSide } from '../types';

export const marketAdd = async (
  program: Program<Tides>,
  provider: AnchorProvider,
  quoteSymbol: string,
  baseSymbol: string,
  quoteMint: PublicKey,
  oraclePriceFeed: PublicKey,
  initialMarkPrice = new BN(10 ** 5),
): Promise<string> => {
  const [config, configPda] = await getConfig(program);
  const [markets, marketsPda] = await getMarkets(program, config.markets);

  const [callCollateralVault] = getMarketCollateralVaultTA(
    program.programId,
    OptionSide.Call,
    quoteMint,
  );
  const [callCollateralVaultAuthority] = getVaultAuthority(
    program.programId,
    callCollateralVault,
  );

  const [putCollateralVault] = getMarketCollateralVaultTA(
    program.programId,
    OptionSide.Put,
    quoteMint,
  );
  const [putCollateralVaultAuthority] = getVaultAuthority(
    program.programId,
    putCollateralVault,
  );

  const callMarketFundingData = anchor.web3.Keypair.generate();
  const putMarketFundingData = anchor.web3.Keypair.generate();

  const iniitialMarkVolatility = 3200000

  return program.methods
    .marketAdd(
      new BN(initialMarkPrice),
      new BN(iniitialMarkVolatility),
      quoteSymbol,
      baseSymbol
    )
    .accounts({
      admin: provider.wallet.publicKey,
      config: configPda,
      markets: marketsPda,
      quoteMint: quoteMint,
      collateralMint: config.collateralMint,
      callCollateralVault: callCollateralVault,
      callCollateralVaultAuthority: callCollateralVaultAuthority,
      callMarketFundingData: callMarketFundingData.publicKey,
      putCollateralVault: putCollateralVault,
      putCollateralVaultAuthority: putCollateralVaultAuthority,
      putMarketFundingData: putMarketFundingData.publicKey,
      oraclePriceFeed: oraclePriceFeed,
      tokenProgram: TOKEN_PROGRAM_ID,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      systemProgram: SystemProgram.programId,
    })
    .preInstructions([
      await program.account.fundingData.createInstruction(
        callMarketFundingData,
      ),
      await program.account.fundingData.createInstruction(putMarketFundingData),
    ])
    .signers([callMarketFundingData, putMarketFundingData])
    .rpc();
};
