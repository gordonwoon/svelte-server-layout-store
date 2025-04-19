import { fetchAndUpdateStoreAutomatically } from '$lib/stores/storeHelper';
import { fetchUsers, USERS_STORE_NAME } from '$lib/stores/userStores';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return {
		usersStore: fetchAndUpdateStoreAutomatically(fetchUsers(), USERS_STORE_NAME)
	};
};
