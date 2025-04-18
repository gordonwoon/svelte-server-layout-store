# SvelteKit Store Auto-Population via Layout ($page store)

This project demonstrates automatically populating Svelte stores based on data loaded in `+page.server.ts` by reacting to changes in the `$page` store within the root layout component (`+layout.svelte`). Stores and related logic are separated by feature, and the layout dynamically updates the correct store based on a marker.

## Key Features

- Server-side data fetching using the `load` function.
- Data marked for specific stores using a helper function.
- Stores organized into feature-specific files (e.g., `userStores.ts`).
- The root layout component (`+layout.svelte`) subscribes to the `$page` store.
- When `$page.data` changes, the layout inspects the data, finds marked items, and **dynamically updates the appropriate store** automatically based on the marker's `storeName`.
- Page components remain simple and only need to subscribe to the relevant stores.

## How It Works

### 1. Store Definition and Marking (e.g., `src/lib/userStores.ts`)

Feature-specific store files define the store, related types/interfaces, data fetching functions, and potentially shared utilities like the sync marker:

```typescript
// src/lib/userStores.ts
import { writable } from 'svelte/store';

export const STORE_SYNC_IDENTIFIER = '__STORE_SYNC__';

export interface User {
	/* ... */
}

export const usersStore = writable<User[]>([]);

export function markForStoreSync<T>(data: T, storeName: string) {
	/* ... */
}

export async function fetchUsers(): Promise<User[]> {
	/* ... */
}
```

```typescript
// src/lib/userDetailStores.ts
import { writable } from 'svelte/store';
import type { User } from './userStores';

export const userDetailStore = writable<User | null>(null);

export async function fetchUserDetails(id: string): Promise<User | null> {
	/* ... */
}
```

### 2. Server-Side Load Function (e.g., `+page.server.ts` or `user/[id]/detail/+page.server.ts`)

The page's server `load` function imports the necessary fetcher and marker functions, fetches data, and uses `markForStoreSync` before returning promises:

```typescript
// src/routes/user/[id]/detail/+page.server.ts
import { markForStoreSync } from '$lib/userStores';
import { fetchUserDetails } from '$lib/userDetailStores';

export const load: PageServerLoad = async ({ params }) => {
	const userDetailPromise = fetchUserDetails(params.id).then((details) => {
		if (!details) throw error(404, 'Not Found');
		return markForStoreSync(details, 'userDetailStore');
	});
	return { userDetail: userDetailPromise, userId: params.id };
};
```

### 3. Root Layout Component (`+layout.svelte`)

The layout imports all stores that can be auto-populated and defines a `storeRegistry` mapping names to store objects. The reactive logic finds marked data and uses the `storeName` to dynamically call `.set()` on the correct store from the registry (using `as any` for simplification).

```svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
    import { page } from '$app/stores';
    import { usersStore, STORE_SYNC_IDENTIFIER } from '$lib/userStores';
    import { userDetailStore } from '$lib/userDetailStores';

    // Map store names (from server) to actual store objects
    const storeRegistry = { usersStore, userDetailStore };

    $: {
        const currentPageData = $page.data;
        (async () => {
            for (const key in currentPageData) {
                // ... await promise logic ...
                let value = /* resolved value */;
                if (/* value is marked */) {
                    const { storeName, data: storeData } = value as { storeName: string; data: unknown };
                    const registryKey = storeName as keyof typeof storeRegistry;

                    if (storeRegistry[registryKey]) {
                        // Dynamically update the store
                        storeRegistry[registryKey].set(storeData as any);
                    } else {
                        console.warn(`No store registered for '${storeName}'`);
                    }
                }
            }
        })();
    }
</script>

<slot />
```

### 4. Page Component (e.g., `+page.svelte` or `user/[id]/detail/+page.svelte`)

The page component imports only the specific store(s) it needs to display data from and uses them directly:

```svelte
<!-- src/routes/user/[id]/detail/+page.svelte -->
<script lang="ts">
	import { userDetailStore } from '$lib/userDetailStores';
	export let data: PageData;
</script>

{#if $userDetailStore}
	<!-- Display $userDetailStore data -->
{/if}
```

## Benefits of This Approach

1.  **Centralized & Dynamic Logic:** Store update logic is in the layout and dynamically handles different stores.
2.  **Cleaner Pages:** Page components focus on displaying data.
3.  **Modular Stores:** Stores organized by feature.
4.  **Easier Maintenance:** Adding new auto-populated stores only requires adding them to the layout's `storeRegistry`.

## Considerations

- **Type Safety Trade-off:** The dynamic `storeRegistry[registryKey].set(storeData as any)` call bypasses strict TypeScript checks. Ensure the `storeName` passed from the server correctly matches the data type.
- The layout needs to import _all_ potentially auto-populated stores to include them in the registry.
- The reactive block runs on every `$page` change.

## Running the Project

```bash
npm install
npm run dev
```

Then open your browser to [http://localhost:5173](http://localhost:5173).
