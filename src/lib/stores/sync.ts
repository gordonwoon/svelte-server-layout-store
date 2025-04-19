import * as UserDetailStores from '../userDetailStores';
import * as UserStores from '../userStores';

export const STORE_SYNC_IDENTIFIER = '__STORE_SYNC__';

const storeRegistry = {
	[UserStores.USERS_STORE_NAME]: UserStores.usersStore,
	[UserDetailStores.USER_DETAIL_STORE_NAME]: UserDetailStores.userDetailStore
} as const;

export async function updateStoreFromPayload(payload: StoreSyncPayload): Promise<boolean> {
	console.log('updateStoreFromPayload', payload);
	const storeName = payload.storeName;

	// console.log(`[StoreSync] Dynamically updating store '${storeName}'.`);
	switch (storeName) {
		case UserStores.USERS_STORE_NAME:
			storeRegistry[storeName].set(await payload.data);
			break;
		case UserDetailStores.USER_DETAIL_STORE_NAME:
			storeRegistry[storeName].set(await payload.data);
			break;
	}
	return true;
}

export async function fetchAndUpdateStoreAutomatically<T>(
	data: T | Promise<T>,
	storeName: StoreSyncPayload['storeName']
) {
	return {
		[STORE_SYNC_IDENTIFIER]: true,
		storeName: storeName,
		data
	};
}

// Helper type to extract the parameter type of a Svelte store's 'set' method
type StoreSetParam<S> = S extends { set: (value: infer P) => void } ? P : never;

// 1. Map store names (keys of registry) to their specific payload structures
type StorePayloadMap = {
	[K in keyof typeof storeRegistry]: {
		[STORE_SYNC_IDENTIFIER]: true;
		storeName: K; // K is the literal type, e.g., 'usersStore'
		// Extract the data type expected by the corresponding store's set method
		data: StoreSetParam<(typeof storeRegistry)[K]>;
	};
};

// 2. Create the final discriminated union by getting a union of all values in the map
export type StoreSyncPayload = StorePayloadMap[keyof StorePayloadMap];

type PotentialPayload = {
	[key: string]: unknown;
};

// Type guard to check if an unknown value is a valid sync payload
export function isStoreSyncPayload(value: unknown): value is StoreSyncPayload {
	console.log('value', value);
	if (value && typeof value === 'object' && !Array.isArray(value)) {
		const potential = value as PotentialPayload;
		// Check for the identifier and that storeName is one of the *known keys* from our registry
		return (
			potential[STORE_SYNC_IDENTIFIER] === true &&
			typeof potential.storeName === 'string' &&
			potential.storeName in storeRegistry
		);
	}
	return false;
}
