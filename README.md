# SvelteKit Store Auto-Population via Layout Data

This project demonstrates a robust method for automatically populating Svelte stores based on data loaded in `+page.server.ts`. It leverages a centralized synchronization module (`src/lib/stores/sync.ts`) that reacts to changes in `$page.data` within the root layout (`+layout.svelte`). Stores and related logic are separated by feature, and the layout dynamically updates the correct store based on markers embedded in the server data.

## Key Features

- Server-side data fetching using SvelteKit's `load` function.
- **Centralized Synchronization Logic:** A dedicated module (`src/lib/stores/sync.ts`) handles:
  - Defining a registry of stores to be synchronized.
  - **Dynamically generating** discriminated union types (`StoreSyncPayload`) for type-safe handling of different store data structures.
  - Providing a server-side helper function (`fetchAndUpdateStoreAutomatically`) to correctly format data before sending it to the client.
  - Providing a type guard (`isStoreSyncPayload`) to identify sync payloads on the client.
  - Providing a client-side update function (`updateStoreFromPayload`) that performs type-safe store updates.
- **Simplified Root Layout:** The root layout (`+layout.svelte`) imports and uses functions from the `sync.ts` module, keeping its own logic minimal.
- Stores organized into feature-specific files (e.g., `userStores.ts`, `userDetailStores.ts`).
- Page components remain simple, only needing to subscribe to the relevant stores.

## How It Works

### 1. Store Definition (e.g., `src/lib/userStores.ts`)

Feature-specific store files define the store instance, related types/interfaces, data fetching functions, and an exported constant for the store's unique name.

```typescript
// src/lib/userStores.ts
import { writable } from 'svelte/store';

// Export a unique name for this store
export const USERS_STORE_NAME = 'usersStore';

export interface User {
	/* ... */
}

export const usersStore = writable<User[]>([]);

export async function fetchUsers(): Promise<User[]> {
	/* ... */
}
```

```typescript
// src/lib/userDetailStores.ts
import { writable } from 'svelte/store';
import type { User } from './userStores';

// Export a unique name for this store
export const USER_DETAIL_STORE_NAME = 'userDetailStore';

export const userDetailStore = writable<User | null>(null);

export async function fetchUserDetails(id: string): Promise<User | null> {
	/* ... */
}
```

### 2. Server-Side Load Function (e.g., `+page.server.ts`)

The page's server `load` function imports the necessary data fetchers, store name constants, and the `fetchAndUpdateStoreAutomatically` helper from the central `sync.ts` module. It fetches data and uses `fetchAndUpdateStoreAutomatically` to wrap it before returning.

```typescript
// src/routes/+page.server.ts (Example for users list)
import { fetchUsers, USERS_STORE_NAME } from '$lib/userStores';
// Import the renamed function from sync module
import { fetchAndUpdateStoreAutomatically } from '$lib/stores/sync';

export const load: PageServerLoad = async () => {
	const usersPromise = fetchUsers().then((users) => {
		// Use the renamed helper and the store name constant
		return fetchAndUpdateStoreAutomatically(users, USERS_STORE_NAME);
	});
	return { users: usersPromise };
};
```

### 3. Central Synchronization Logic (`src/lib/stores/sync.ts`)

This module is the core of the auto-population mechanism. It imports stores and their names, defines the registry, dynamically generates types, and exports the necessary functions.

```typescript
// src/lib/stores/sync.ts
import * as UserDetailStores from '../userDetailStores';
import * as UserStores from '../userStores';

// Define the sync identifier
export const STORE_SYNC_IDENTIFIER = '__STORE_SYNC__';

// Define the central registry
const storeRegistry = {
	[UserStores.USERS_STORE_NAME]: UserStores.usersStore,
	[UserDetailStores.USER_DETAIL_STORE_NAME]: UserDetailStores.userDetailStore
} as const;

// --- Dynamic Type Generation ---
type StoreSetParam<S> = /* ... */ ;
type StorePayloadMap = { /* ... Mapped type based on storeRegistry ... */ };
export type StoreSyncPayload = StorePayloadMap[keyof StorePayloadMap]; // Discriminated Union
// --- End Dynamic Type Generation ---

// Server-side helper to create payloads (renamed)
export function fetchAndUpdateStoreAutomatically<K extends keyof typeof storeRegistry, /* ... */>(
    data: T,
    storeName: K
): StorePayloadMap[K] {
	return { /* ... returns marked payload object ... */ };
}

// Client-side type guard
export function isStoreSyncPayload(value: unknown): value is StoreSyncPayload {
    /* ... checks for marker and valid storeName ... */
}

// Client-side update function
export function updateStoreFromPayload(payload: StoreSyncPayload): boolean {
    /* ... uses switch on payload.storeName ... */
}
```

### 4. Root Layout Component (`+layout.svelte`)

The layout imports only the necessary functions from `sync.ts`. It subscribes to `$page.data`, iterates over the data, uses the type guard to identify sync payloads, and calls the update function.

```svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
    import { page } from '$app/stores';
    import {
        STORE_SYNC_IDENTIFIER, // May not be needed directly here anymore
        isStoreSyncPayload,
        updateStoreFromPayload
    } from '$lib/stores/sync';

    $: {
        const currentPageData = $page.data;
        (async () => {
            for (const key in currentPageData) {
                // ... await promise logic ...
                let value = /* resolved value */;

                // Use the type guard
                if (isStoreSyncPayload(value)) {
                    // Call the central update function
                    updateStoreFromPayload(value);
                }
            }
        })();
    }
</script>

<slot />
```

### 5. Page Component (e.g., `+page.svelte`)

The page component remains simple, importing only the specific store(s) it needs and using them directly.

```svelte
<!-- src/routes/+page.svelte -->
<script lang="ts">
	import { usersStore } from '$lib/userStores';
</script>

{#each $usersStore as user}
	<!-- ... display user -->
{/each}
```

## Benefits of This Approach

1.  **Centralized & Dynamic Logic:** Store update logic is contained within `sync.ts` and dynamically handles different stores based on the registry.
2.  **Improved Type Safety:** The use of discriminated unions, mapped types, and type guards ensures type-safe updates, eliminating previous reliance on `as any`.
3.  **Simplified Layout:** The root layout component (`+layout.svelte`) is significantly cleaner and delegates complex logic.
4.  **High Maintainability:** Adding new auto-populated stores primarily involves updating the store file itself and adding it to the `storeRegistry` in `sync.ts`. The layout and page components often require no changes.
5.  **Modular Stores:** Stores remain organized by feature.

## Considerations

- The core complexity is shifted to the `sync.ts` module, which utilizes advanced TypeScript features (Mapped Types, Conditional Types).
- Ensure consistency between the `storeName` constants exported from store files and those used in `sync.ts` and server `load` functions.

## Online Demo

You can try this demo without any setup by visiting the CodeSandbox link below:

[Open in CodeSandbox](https://codesandbox.io/p/github/gordonwoon/svelte-server-layout-store/main)

## Running the Project Locally

```bash
npm install
npm run dev
```
