import { writable } from 'svelte/store';

export const USERS_STORE_NAME = 'usersStore';

export interface User {
	id: number | string;
	name: string;
	email: string;
	address?: string;
	phone?: string;
}

export const usersStore = writable<User[]>([]);

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
