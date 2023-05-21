import type { Tides } from '$idl/tides';
import type { PublicKey } from '@solana/web3.js';
import type { Program } from '@project-serum/anchor';
import { writable } from 'svelte/store';
import type EventEmitter from 'eventemitter3';
import { getCollateralVaultPositionsForUser, getUserPositions } from '$src/rpc/data';
import type { Position } from '$src/types';

export const positions = writable([] as Position[]);
let positionsEmitter: EventEmitter = undefined;

export const setPositions = async (
  program: Program<Tides>,
  userAddr: PublicKey,
) => {
  try {
    const [positionsData, positionsPda] = await getUserPositions(
      program,
      userAddr,
    );
    const positionArray = positionsData.positions as Position[];

    positions.set(positionArray.filter(x => x.active));

    positionsEmitter = program.account.userPositions.subscribe(
      positionsPda,
      'confirmed',
    );
    positionsEmitter.on('change', account => {
      positions.set(account.positions.filter(p => p.active));
    });
  } catch (e) {
    console.log(e)
  }
};

export const cvPositions = writable([]);

export const setCvPositions = async (
  program: Program<Tides>,
  userAddr: PublicKey,
) => {
  try {
    const cvPositionsArray = await getCollateralVaultPositionsForUser(
      program,
      userAddr,
    );

    cvPositions.set(cvPositionsArray);
  } catch (e) {
    console.log(e)
  }
};