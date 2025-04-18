import { fetchAndUpdateStoreAutomatically } from '$lib/stores/sync';
import { fetchUserDetails, USER_DETAIL_STORE_NAME } from '$lib/userDetailStores';
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	const userId = params.id;

	if (!userId) {
		throw error(400, 'User ID parameter is missing');
	}

	const userDetailPromise = fetchUserDetails(userId).then((details) => {
		if (!details) {
			throw error(404, `User with ID ${userId} not found`);
		}
		return fetchAndUpdateStoreAutomatically(details, USER_DETAIL_STORE_NAME);
	});

	return {
		userDetail: userDetailPromise,
		userId: userId
	};
};
