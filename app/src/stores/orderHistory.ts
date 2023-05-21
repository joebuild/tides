import type { Tides } from '$idl/tides';
import type { PublicKey } from '@solana/web3.js';
import type { Program } from '@project-serum/anchor';
import { writable } from 'svelte/store';
import type EventEmitter from 'eventemitter3';
import { getUserHistory } from '$src/rpc/data';
import type { OrderRecord } from '$src/types';

export const orderHistory = writable([] as OrderRecord[]);
let orderHistoryEmitter: EventEmitter = undefined;

export const setOrderHistory = async (
  program: Program<Tides>,
  userAddr: PublicKey,
) => {
  const [orderHistoryData, orderHistoryPda] = await getUserHistory(
    program,
    userAddr,
  );
  const orderHistoryArray = orderHistoryData.records as OrderRecord[];

  orderHistory.set(
    orderHistoryArray
      .filter(x => x.ts.toNumber() > 0)
      .sort((a, b) => (a.ts.toNumber() > b.ts.toNumber() ? -1 : 1)),
  );

  orderHistoryEmitter = program.account.userHistory.subscribe(
    orderHistoryPda,
    'confirmed',
  );
  orderHistoryEmitter.on('change', account => {
    orderHistory.set(
      account.records
        .filter(x => x.ts.toNumber() > 0)
        .sort((a, b) => (a.ts.toNumber() > b.ts.toNumber() ? -1 : 1)),
    );
  });
};
