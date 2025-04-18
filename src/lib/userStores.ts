import { writable } from 'svelte/store';

// Define a unique identifier for store sync
export const STORE_SYNC_IDENTIFIER = '__STORE_SYNC__';

export interface User {
	id: number | string;
	name: string;
	email: string;
	address?: string;
	phone?: string;
}

export const usersStore = writable<User[]>([]);

// Helper function to mark data with store identifier for auto-sync
export function markForStoreSync<T>(data: T, storeName: string) {
	return {
		[STORE_SYNC_IDENTIFIER]: true,
		storeName: storeName,
		data
	};
}

export async function fetchUsers(): Promise<User[]> {
	console.log('[Mock API] Fetching user list...');
	// Simulate API delay
	await new Promise((resolve) => setTimeout(resolve, 500));

	return [
		{ id: 1, name: 'John Doe', email: 'john@example.com' },
		{ id: 2, name: 'Jane Smith', email: 'jane@example.com' },
		{ id: 3, name: 'Bob Johnson', email: 'bob@example.com' }
	];
}
