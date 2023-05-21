import {SystemProgram} from '@solana/web3.js'
import type {AnchorProvider, Program} from '@project-serum/anchor'
import * as anchor from '@project-serum/anchor'
import type {Tides} from '../idl/tides'
import {getMarketCollateralVaultTA, getVaultAuthority} from "../utils/pda";
import BN from "bn.js";
import {ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID} from "@solana/spl-token";
import {getATA} from "../utils/tokens";
import { getConfig, getMarkets } from './data';
import { OptionSide, type Markets } from '../types';

export const marketSideWithdraw = async (
	program: Program<Tides>,
	provider: AnchorProvider,
	marketIndex: number,
	optionSide: OptionSide,
	amount: BN,
): Promise<string> => {
	const [config, configPda] = await getConfig(program)
	const [userAta] = getATA(config.collateralMint, provider.wallet.publicKey)
	const [markets, marketsPda] = await getMarkets(program, config.markets)
	
	const market = (markets.markets as Markets)[marketIndex]

	const [callCollateralVault] = getMarketCollateralVaultTA(program.programId, OptionSide.Call, market.mintQuote)
	const [callCollateralVaultAuthority] = getVaultAuthority(program.programId, callCollateralVault)

	const [putCollateralVault] = getMarketCollateralVaultTA(program.programId, OptionSide.Put, market.mintQuote)
	const [putCollateralVaultAuthority] = getVaultAuthority(program.programId, putCollateralVault)

	return program.methods.marketSideWithdraw(
			new BN(market.index),
			optionSide == OptionSide.Call ? { call: {} } : { put: {} },
			new BN(amount)
		)
		.accounts(
			{
				admin: provider.wallet.publicKey,
				adminAta: userAta,
				config: configPda,
				markets: marketsPda,
				quoteMint: market.mintQuote,
				collateralMint: market.collateralMint,
				callCollateralVault: callCollateralVault,
				callCollateralVaultAuthority: callCollateralVaultAuthority,
				putCollateralVault: putCollateralVault,
				putCollateralVaultAuthority: putCollateralVaultAuthority,
				associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
				tokenProgram: TOKEN_PROGRAM_ID,
				rent: anchor.web3.SYSVAR_RENT_PUBKEY,
				systemProgram: SystemProgram.programId,
			})
		.rpc()
}
