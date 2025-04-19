export const STORE_UPDATE_SIGNATURE = '__STORE_SIGNATURE__';

import { writable, type Writable } from 'svelte/store';
import * as UserDetailStores from './userDetailStores';
import * as UserStores from './userStores';

const storeRegistry = {
	[UserStores.USERS_STORE_NAME]: UserStores.usersStore,
	[UserDetailStores.USER_DETAIL_STORE_NAME]: UserDetailStores.userDetailStore
} as const;

export async function updateStoreFromPayload(payload: StoreSyncPayload): Promise<boolean> {
	const storeName = payload.storeName;
	console.log(`[StoreSync] Dynamically updating store '${storeName}'.`);
	storeRegistry[storeName].loading.set(true);

	// to ensure type safety with discriminated union, we need to switch on the storeName
	switch (storeName) {
		case UserStores.USERS_STORE_NAME:
			storeRegistry[storeName].set(await payload.data);
			break;
		case UserDetailStores.USER_DETAIL_STORE_NAME:
			storeRegistry[storeName].set(await payload.data);
			break;
	}

	storeRegistry[storeName].loading.set(false);
	return true;
}

export async function fetchAndUpdateStoreAutomatically<T>(
	data: T | Promise<T>,
	storeName: StoreSyncPayload['storeName']
) {
	return {
		[STORE_UPDATE_SIGNATURE]: true,
		storeName: storeName,
		data
	};
}

// Helper type to extract the parameter type of a Svelte store's 'set' method
type StoreSetParam<S> = S extends { set: (value: infer P) => void } ? P : never;

// 1. Map store names (keys of registry) to their specific payload structures
type StorePayloadMap = {
	[K in keyof typeof storeRegistry]: {
		[STORE_UPDATE_SIGNATURE]: true;
		storeName: K; // K is the literal type, e.g., 'usersStore'
		// Extract the data type expected by the corresponding store's set method
		data:
			| StoreSetParam<(typeof storeRegistry)[K]>
			| Promise<StoreSetParam<(typeof storeRegistry)[K]>>;
	};
};

// 2. Create the final discriminated union by getting a union of all values in the map
export type StoreSyncPayload = StorePayloadMap[keyof StorePayloadMap];

type PotentialPayload = {
	[key: string]: unknown;
};

// Type guard to check if an unknown value is a valid sync payload
export function isStoreSignaturePayload(value: unknown): value is StoreSyncPayload {
	if (value && typeof value === 'object' && !Array.isArray(value)) {
		const potential = value as PotentialPayload;
		// Check for the identifier and that storeName is one of the *known keys* from our registry
		return (
			potential[STORE_UPDATE_SIGNATURE] === true &&
			typeof potential.storeName === 'string' &&
			potential.storeName in storeRegistry
		);
	}
	return false;
}

/**
 * Creates a store with loading and error states
 *
 * @param initialValue - Initial value for the store
 * @returns A store with initialize, handleError, handleLoading and other utility methods
 */
export function createStoreWithLoadingAndError<T>(initialValue: T): Writable<T> & {
	loading: Writable<boolean>;
	error: Writable<Error | null>;
} {
	// Create the base writable store
	const { subscribe, set, update } = writable<T>(initialValue);

	// Loading and error states
	const loading = writable<boolean>(false);
	const error = writable<Error | null>(null);

	return {
		subscribe,
		set,
		update,
		loading,
		error
	};
}
