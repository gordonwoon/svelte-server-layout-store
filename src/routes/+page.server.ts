import type { PageServerLoad } from './$types';
import { fetchUsers, markForStoreSync } from '$lib/userStores';

export const load: PageServerLoad = async () => {
	const usersPromise = fetchUsers().then((users) => markForStoreSync(users, 'usersStore'));

	return {
		users: usersPromise
	};
};
