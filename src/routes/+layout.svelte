<script lang="ts">
	import { page } from '$app/stores';
	import {
		usersStore,
		STORE_SYNC_IDENTIFIER,
		type User,
		USERS_STORE_NAME,
		type UsersStorePayload
	} from '$lib/userStores';
	import {
		userDetailStore,
		USER_DETAIL_STORE_NAME,
		type UserDetailStorePayload
	} from '$lib/userDetailStores';

	// Union type using imported types
	type StoreSyncPayload = UsersStorePayload | UserDetailStorePayload;

	// Use constants for store registry keys
	const storeRegistry = {
		[USERS_STORE_NAME]: usersStore,
		[USER_DETAIL_STORE_NAME]: userDetailStore
	};

	$: {
		const currentPageData = $page.data;

		(async () => {
			for (const key in currentPageData) {
				if (Object.prototype.hasOwnProperty.call(currentPageData, key)) {
					let value = currentPageData[key as keyof typeof currentPageData];

					if (value instanceof Promise) {
						try {
							value = await value;
						} catch (error) {
							if (error && typeof error === 'object' && STORE_SYNC_IDENTIFIER in error) {
								value = error;
							} else {
								console.error(`[$layout.svelte] Error resolving promise for key ${key}:`, error);
								continue;
							}
						}
					}

					if (
						value &&
						typeof value === 'object' &&
						!Array.isArray(value) &&
						STORE_SYNC_IDENTIFIER in value &&
						value[STORE_SYNC_IDENTIFIER] === true &&
						'storeName' in value &&
						(value.storeName === USERS_STORE_NAME || value.storeName === USER_DETAIL_STORE_NAME)
					) {
						const payload = value as StoreSyncPayload;
						const storeName = payload.storeName;

						console.log(`[$layout.svelte] Dynamically updating store '${storeName}'.`);

						switch (storeName) {
							case USERS_STORE_NAME:
								storeRegistry[storeName].set(payload.data);
								break;
							case USER_DETAIL_STORE_NAME:
								storeRegistry[storeName].set(payload.data);
								break;
						}
					}
				}
			}
		})();
	}
</script>

<slot />
