import { fetchAndUpdateStoreAutomatically } from '$lib/stores/sync';
import { fetchUsers } from '$lib/userStores';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return {
		usersStore: fetchAndUpdateStoreAutomatically(fetchUsers(), 'usersStore')
	};
};
