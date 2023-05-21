import {SystemProgram} from '@solana/web3.js'
import type {AnchorProvider, Program} from '@project-serum/anchor'
import * as anchor from '@project-serum/anchor'
import type {Tides} from '../idl/tides'
import {getGlobalInsuranceVaultTA, getVaultAuthority} from "../utils/pda";
import type BN from "bn.js";
import {ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID} from "@solana/spl-token";
import {getATA} from "../utils/tokens";
import { getConfig } from './data';

export const insuranceWithdraw = async (
	program: Program<Tides>,
	provider: AnchorProvider,
	amount: BN,
): Promise<string> => {
	const [config, configPda] = await getConfig(program)

	const [userAta] = getATA(config.collateralMint, provider.wallet.publicKey)

	const [collateralVault] = getGlobalInsuranceVaultTA(program.programId)
	const [collateralVaultAuthority] = getVaultAuthority(program.programId, collateralVault)

	return program.methods.insuranceWithdraw(amount)
		.accounts(
			{
				admin: provider.wallet.publicKey,
				adminAta: userAta,
				config: configPda,
				insuranceVault: collateralVault,
				insuranceVaultAuthority: collateralVaultAuthority,
				collateralMint: config.collateralMint,
				associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
				tokenProgram: TOKEN_PROGRAM_ID,
				rent: anchor.web3.SYSVAR_RENT_PUBKEY,
				systemProgram: SystemProgram.programId,
			})
		.rpc()
}
