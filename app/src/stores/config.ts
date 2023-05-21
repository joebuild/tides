import { writable } from 'svelte/store';
import type { Program } from '@project-serum/anchor';
import type { Tides } from '$idl/tides';
import { getConfig } from '$src/rpc/data';
import type { Config } from '$src/types';

export const config = writable({} as Config);

export const setConfig = async (program: Program<Tides>) => {
  const [configData] = await getConfig(program);
  config.set(configData)
};
