import { fetchAndUpdateStoreAutomatically } from '$lib/stores/storeHelper';
import { fetchUserDetails, USER_DETAIL_STORE_NAME } from '$lib/stores/userDetailStores';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const userId = params.id;

	if (!userId) {
		throw error(400, 'User ID parameter is missing');
	}

	return {
		userDetail: fetchAndUpdateStoreAutomatically(fetchUserDetails(userId), USER_DETAIL_STORE_NAME),
		userId: userId
	};
};
