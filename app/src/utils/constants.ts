import { Network } from '../stores/network';
import { PublicKey } from '@solana/web3.js';

export const CONFIG_PDA_PREFIX = 'config';

export const COLLATERAL_VAULT_SEED = 'collateral_vault';
export const INSURANCE_VAULT_SEED = 'insurance_vault';
export const TREASURY_VAULT_SEED = 'treasury_vault';

export const CALL_SEED = 'call';
export const PUT_SEED = 'put';
export const USER_PDA_PREFIX = 'user';

export const TIDES_PROGRAM_ID = new PublicKey(
  'tides1eCHZZ1wTJpFz3NbeGmN6hbNSeB1cwcTuar22w',
);
export const SOL_MINT_ADDRESS = new PublicKey(
  'So11111111111111111111111111111111111111112',
);

export const NETWORK_VARS = {
  MAINNET: {
    USDC: new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'),
    PYTH_PRICE_FEED_SOL: new PublicKey(
      'H6ARHf6YXhGYeQfUzQNGk6rDNnLBQKrenN712K4AQJEG',
    ),
  },
  DEVNET: {
    USDC: new PublicKey('Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr'),
    PYTH_PRICE_FEED_SOL: new PublicKey(
      'J83w4HKfqxwcq3BEMMkPFSppX3gqekLyLJBexebFVkix',
    ),
  },
};

export const getAddresses = (network: Network) => {
  if (network === Network.Mainnet) {
    return NETWORK_VARS.MAINNET;
  } else {
    return NETWORK_VARS.DEVNET;
  }
};
