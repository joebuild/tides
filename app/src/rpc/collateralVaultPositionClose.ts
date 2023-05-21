import { PublicKey, SystemProgram } from '@solana/web3.js';
import type { AnchorProvider, Program } from '@project-serum/anchor'
import type { Tides } from '../idl/tides'
import { getMarketCollateralVaultTA, getVaultAuthority } from "../utils/pda";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { getATA } from "../utils/tokens";
import { getCollateralVaultPositionData, getConfig, getMarkets } from './data';
import { OptionSide, type Markets } from '../types';


export const collateralVaultPositionClose = async (
	program: Program<Tides>,
	provider: AnchorProvider,
	positionAddr: PublicKey,
): Promise<string> => {
	const [config, configPda] = await getConfig(program)
	const [userAta] = getATA(config.collateralMint, provider.wallet.publicKey)
	const [markets, marketsPda] = await getMarkets(program, config.markets)

	const [position] = await getCollateralVaultPositionData(program, positionAddr)

	const market = (markets.markets as Markets)[position.marketIndex]

	const [callCollateralVault] = getMarketCollateralVaultTA(program.programId, OptionSide.Call, market.mintQuote)
	const [callCollateralVaultAuthority] = getVaultAuthority(program.programId, callCollateralVault)

	const [putCollateralVault] = getMarketCollateralVaultTA(program.programId, OptionSide.Put, market.mintQuote)
	const [putCollateralVaultAuthority] = getVaultAuthority(program.programId, putCollateralVault)

	return program.methods.collateralVaultPositionClose()
		.accounts(
			{
				user: provider.wallet.publicKey,
				userAta: userAta,
				position: positionAddr,
				config: configPda,
				markets: marketsPda,
				quoteMint: market.mintQuote,
				collateralMint: market.collateralMint,
				callCollateralVault: callCollateralVault,
				callCollateralVaultAuthority: callCollateralVaultAuthority,
				putCollateralVault: putCollateralVault,
				putCollateralVaultAuthority: putCollateralVaultAuthority,
				tokenProgram: TOKEN_PROGRAM_ID,
				systemProgram: SystemProgram.programId,
			})
		.rpc()
}
