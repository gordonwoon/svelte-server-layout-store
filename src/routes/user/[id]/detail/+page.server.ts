import { markForStoreSync } from '$lib/userStores';
import { fetchUserDetails } from '$lib/userDetailStores';
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	const userId = params.id;
	console.log(`[+page.server.ts /user/${userId}/detail] Loading data...`);

	if (!userId) {
		throw error(400, 'User ID parameter is missing');
	}

	const userDetailPromise = fetchUserDetails(userId).then((details) => {
		if (!details) {
			throw error(404, `User with ID ${userId} not found`);
		}
		return markForStoreSync(details, 'userDetailStore');
	});

	return {
		userDetail: userDetailPromise,
		userId: userId
	};
};
