<script lang="ts">
	import { page } from '$app/stores';
	import {
		STORE_SYNC_IDENTIFIER,
		isStoreSyncPayload,
		updateStoreFromPayload
	} from '$lib/stores/sync';

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
							// Check if the error itself might be a sync payload
							if (error && typeof error === 'object' && STORE_SYNC_IDENTIFIER in error) {
								value = error;
							} else {
								console.error(`[$layout.svelte] Error resolving promise for key ${key}:`, error);
								continue;
							}
						}
					}

					// Use the type guard to check if the resolved value is a sync payload
					if (isStoreSyncPayload(value)) {
						// Call the central update function if it is
						updateStoreFromPayload(value);
					}
				}
			}
		})();
	}
</script>

<slot />
