import { fetchAndUpdateStoreAutomatically } from '$lib/stores/sync';
import { fetchUserDetails, USER_DETAIL_STORE_NAME } from '$lib/userDetailStores';
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

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
