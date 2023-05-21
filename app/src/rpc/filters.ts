import type { GetProgramAccountsFilter, PublicKey } from '@solana/web3.js'

export const collateralVaultPositionsUserFilter = (
    userAddr: PublicKey,
): GetProgramAccountsFilter => {
    return ({
        memcmp: {
            offset:
                8 + // discriminator
                1, // initialized
            bytes: userAddr.toBase58(),
        },
    })
};