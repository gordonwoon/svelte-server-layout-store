import { writable } from 'svelte/store';
import { STORE_SYNC_IDENTIFIER, type User } from './userStores';
import { fetchUsers } from './userStores';

// --- Store Name Constant ---
export const USER_DETAIL_STORE_NAME = 'userDetailStore';
// --- End Store Name Constant ---

export const userDetailStore = writable<User | null>(null);

// --- Payload Type Definition ---
export type UserDetailStorePayload = {
	[STORE_SYNC_IDENTIFIER]: true;
	storeName: typeof USER_DETAIL_STORE_NAME; // Use constant for literal type
	data: User | null;
};
// --- End Payload Type Definition ---

export async function fetchUserDetails(id: string): Promise<User | null> {
	console.log(`[Mock API] Fetching details for user ID: ${id}`);
	// Simulate API delay
	await new Promise((resolve) => setTimeout(resolve, 800));

	const users = await fetchUsers();
	const user = users.find((u) => u.id.toString() === id);

	if (user) {
		return {
			...user,
			address: `${user.id} Mock St, Sample City`,
			phone: `555-01${user.id.toString().padStart(2, '0')}`
		};
	} else {
		console.error(`[Mock API] User not found for ID: ${id}`);
		return null;
	}
}
