import { SystemProgram } from '@solana/web3.js'
import type { AnchorProvider, Program } from '@project-serum/anchor'
import * as anchor from '@project-serum/anchor'
import type { Tides } from '../idl/tides'
import { getMarketCollateralVaultTA } from "../utils/pda";
import BN from "bn.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { getATA } from "../utils/tokens";
import { getConfig, getMarkets } from './data';
import { OptionSide, type Markets } from '../types';

export const collateralVaultPositionOpenBothSides = async (
	program: Program<Tides>,
	provider: AnchorProvider,
	marketIndex: number,
	amount: BN,
): Promise<string> => {
	const [config, configPda] = await getConfig(program)
	const [userAta] = getATA(config.collateralMint, provider.wallet.publicKey)
	const [markets, marketsPda] = await getMarkets(program, config.markets)

	const market = (markets.markets as Markets)[marketIndex]

	const [callCollateralVault] = getMarketCollateralVaultTA(program.programId, OptionSide.Call, market.mintQuote)
	const [putCollateralVault] = getMarketCollateralVaultTA(program.programId, OptionSide.Put, market.mintQuote)

	const callSidePosition = anchor.web3.Keypair.generate();
	const putSidePosition = anchor.web3.Keypair.generate();

	const callSideIx = await program.methods.collateralVaultPositionOpen(
		new BN(market.index),
		{ call: {} },
		amount.div(new BN(2))
	)
		.accounts(
			{
				user: provider.wallet.publicKey,
				userAta: userAta,
				position: callSidePosition.publicKey,
				config: configPda,
				markets: marketsPda,
				quoteMint: market.mintQuote,
				collateralMint: market.collateralMint,
				callCollateralVault: callCollateralVault,
				putCollateralVault: putCollateralVault,
				tokenProgram: TOKEN_PROGRAM_ID,
				systemProgram: SystemProgram.programId,
			})
		.instruction()

	return program.methods.collateralVaultPositionOpen(
		new BN(market.index),
		{ put: {} },
		amount.div(new BN(2))
	)
		.accounts(
			{
				user: provider.wallet.publicKey,
				userAta: userAta,
				position: putSidePosition.publicKey,
				config: configPda,
				markets: marketsPda,
				quoteMint: market.mintQuote,
				collateralMint: market.collateralMint,
				callCollateralVault: callCollateralVault,
				putCollateralVault: putCollateralVault,
				tokenProgram: TOKEN_PROGRAM_ID,
				systemProgram: SystemProgram.programId,
			})
		.signers([callSidePosition, putSidePosition])
		.postInstructions([callSideIx])
		.rpc()
}

export const collateralVaultPositionOpen = async (
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
	const [putCollateralVault] = getMarketCollateralVaultTA(program.programId, OptionSide.Put, market.mintQuote)

	const position = anchor.web3.Keypair.generate();

	return program.methods.collateralVaultPositionOpen(
		new BN(market.index),
		optionSide == OptionSide.Call ? { call: {} } : { put: {} },
		new BN(amount)
	)
		.accounts(
			{
				user: provider.wallet.publicKey,
				userAta: userAta,
				position: position.publicKey,
				config: configPda,
				markets: marketsPda,
				quoteMint: market.mintQuote,
				collateralMint: market.collateralMint,
				callCollateralVault: callCollateralVault,
				putCollateralVault: putCollateralVault,
				tokenProgram: TOKEN_PROGRAM_ID,
				systemProgram: SystemProgram.programId,
			})
		.signers([position])
		.rpc()
}