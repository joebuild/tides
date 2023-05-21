import BN from 'bn.js';
import { PublicKey, TransactionInstruction } from '@solana/web3.js';

export const getComputeIx = (budget: number) => {
  const data = Buffer.from(
    Uint8Array.of(0, ...new BN(budget).toArray("le", 4), ...new BN(0).toArray("le", 4))
  );

  return new TransactionInstruction({
    keys: [],
    programId: new PublicKey('ComputeBudget111111111111111111111111111111'),
    data,
  });
};

