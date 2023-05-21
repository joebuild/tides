import { PublicKey, SystemProgram } from '@solana/web3.js';
import type { AnchorProvider, Program } from '@project-serum/anchor';
import * as anchor from '@project-serum/anchor';
import type { Tides } from '../idl/tides';
import {
  getGlobalCollateralVaultTA,
  getGlobalInsuranceVaultTA,
  getConfigPDA,
  getGlobalTreasuryVaultTA,
  getVaultAuthority,
} from '../utils/pda';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

export const initialize = async (
  program: Program<Tides>,
  provider: AnchorProvider,
  collateralMint: PublicKey,
): Promise<string> => {
  const [configPda] = getConfigPDA(program.programId);

  const [collateralVault] = getGlobalCollateralVaultTA(program.programId);
  const [collateralVaultAuthority] = getVaultAuthority(
    program.programId,
    collateralVault,
  );

  const [insuranceVault] = getGlobalInsuranceVaultTA(program.programId);
  const [insuranceVaultAuthority] = getVaultAuthority(
    program.programId,
    insuranceVault,
  );

  const [treasuryVault] = getGlobalTreasuryVaultTA(program.programId);
  const [treasuryVaultAuthority] = getVaultAuthority(
    program.programId,
    treasuryVault,
  );

  const markets = anchor.web3.Keypair.generate();

  return program.methods
    .initialize()
    .accounts({
      admin: provider.wallet.publicKey,
      config: configPda,
      collateralMint: collateralMint,
      collateralVault: collateralVault,
      collateralVaultAuthority: collateralVaultAuthority,
      insuranceVault: insuranceVault,
      insuranceVaultAuthority: insuranceVaultAuthority,
      treasuryVault: treasuryVault,
      treasuryVaultAuthority: treasuryVaultAuthority,
      markets: markets.publicKey,
      tokenProgram: TOKEN_PROGRAM_ID,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      systemProgram: SystemProgram.programId,
    })
    .preInstructions([await program.account.markets.createInstruction(markets)])
    .signers([markets])
    .rpc();
};
