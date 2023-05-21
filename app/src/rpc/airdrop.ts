import type { TidesClient } from '$src/TidesClient';
import {
  createAssociatedTokenAccount,
  createMint,
  mintTo,
} from '@solana/spl-token';
import { Keypair, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';

export let mint: PublicKey;

export const airdropAndSetMintForDev = async (
  client: TidesClient,
): Promise<void> => {
  const mintPayer = Keypair.generate();

  await client.provider.connection.confirmTransaction(
    await client.provider.connection.requestAirdrop(
      client.provider.wallet.publicKey,
      LAMPORTS_PER_SOL,
    ),
    'confirmed',
  );
  console.log('*** LOCALNET: airdropped SOL to user wallet ***');

  await client.provider.connection.confirmTransaction(
    await client.provider.connection.requestAirdrop(
      mintPayer.publicKey,
      LAMPORTS_PER_SOL,
    ),
    'confirmed',
  );
  console.log('*** LOCALNET: airdropped SOL to mint payer ***');

  const mintAuthority = Keypair.generate();

  mint = await createMint(
    client.provider.connection,
    mintPayer,
    mintAuthority.publicKey,
    null,
    6,
  );

  console.log('*** LOCALNET: mint created ***');

  console.log(mint.toBase58());

  try {
    const ata = await createAssociatedTokenAccount(
      client.provider.connection,
      mintPayer,
      mint,
      client.provider.wallet.publicKey,
    );
    console.log('*** LOCALNET: ata created ***');

    await mintTo(
      client.provider.connection,
      mintPayer,
      mint,
      ata,
      mintAuthority,
      10 ** 15,
    );

    console.log('*** LOCALNET: minted tokens to ata ***');
  } catch (e) {
    console.log(e);
  }
};
