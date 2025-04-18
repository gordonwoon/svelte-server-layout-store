import type { PageServerLoad } from './$types';
import { fetchUsers, USERS_STORE_NAME } from '$lib/userStores';
import { fetchAndUpdateStoreAutomatically } from '$lib/stores/sync';

export const load: PageServerLoad = async () => {
	const usersPromise = fetchUsers().then((users) =>
		fetchAndUpdateStoreAutomatically(users, USERS_STORE_NAME)
	);

	return {
		users: usersPromise
	};
};
