import { type User } from './userStores';
import { fetchUsers } from './userStores';
import { createStoreWithLoadingAndError } from './storeHelper';

export const USER_DETAIL_STORE_NAME = 'userDetailStore';

export const userDetailStore = createStoreWithLoadingAndError<User | null>(null);

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
