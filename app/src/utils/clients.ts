import { writable } from 'svelte/store';
import type { TidesClient } from '../TidesClient';
import type { TimestreamQueryClient } from '@aws-sdk/client-timestream-query';

export const tidesClient = writable<TidesClient>(undefined);

export const timestreamClient = writable<TimestreamQueryClient>(undefined);
