<script lang="ts">
    import { page } from '$app/stores';
    import { usersStore, STORE_SYNC_IDENTIFIER } from '$lib/userStores';
    import { userDetailStore } from '$lib/userDetailStores';
    import type { User } from '$lib/userStores';

    // Define the store registry - maps names provided by server to actual store objects
    const storeRegistry = {
        usersStore,
        userDetailStore
    };
    type StoreRegistryKeys = keyof typeof storeRegistry;

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
                        (value as any)[STORE_SYNC_IDENTIFIER] === true
                    ) {
                        const { storeName, data: storeData } = value as { storeName: string; data: unknown };
                        const registryKey = storeName as StoreRegistryKeys;

                        // Check if the store name is valid in our registry
                        if (storeRegistry[registryKey]) {
                            console.log(`[$layout.svelte] Dynamically updating store '${storeName}'.`);
                            // Directly call set using the store object from the registry.
                            // Use `as any` for simplification, accepting the type safety risk.
                            storeRegistry[registryKey].set(storeData as any);
                        } else {
                            console.warn(`[$layout.svelte] Store sync marker found, but no store registered for '${storeName}'`);
                        }
                    }
                }
            }
        })();
    }
</script>

<slot />
