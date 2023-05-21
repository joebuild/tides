import { writable } from 'svelte/store';
import type { User } from '../types';
import type { TidesClient } from '$src/TidesClient';
import type EventEmitter from 'eventemitter3';

export const userData = writable({} as User);
let userDataEmitter: EventEmitter = undefined;

export const userExists = writable(false);

export const setUserData = async (client: TidesClient) => {
  try {
    const [userDataObj, userDataPda] = await client.getUser();
    userData.set(userDataObj);
    userExists.set(true);

    userDataEmitter = client.program.account.user.subscribe(
      userDataPda,
      'confirmed',
    );
    userDataEmitter.on('change', account => {
      userData.set(account);
    });
  } catch (e: unknown) {
    userExists.set(false);
  }
};
