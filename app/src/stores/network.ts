import { writable } from 'svelte/store';

export enum Network {
  Mainnet = 'mainnet-beta',
  Devnet = 'devnet',
}

export const network = writable(Network.Mainnet);
