<!-- src/routes/user/[id]/detail/+page.svelte -->
<script lang="ts">
    import { userDetailStore } from '$lib/userDetailStores';
    import type { PageData } from './$types';

    export let data: PageData;

    $: isLoading =
        !$userDetailStore ||
        $userDetailStore.id?.toString() !== data.userId?.toString();

</script>

<main>
    <h1>User Details (User ID: {data.userId})</h1>
    <a href="/">&larr; Back to Home</a>

    {#if isLoading}
        <p>Loading user details...</p>
    {:else if $userDetailStore}
        <div class="detail-card">
          <h2>{$userDetailStore.name}</h2>
          <p><strong>ID:</strong> {$userDetailStore.id}</p>
          <p><strong>Email:</strong> {$userDetailStore.email}</p>
          <p><strong>Address:</strong> {$userDetailStore.address || 'N/A'}</p>
          <p><strong>Phone:</strong> {$userDetailStore.phone || 'N/A'}</p>
        </div>
    {:else}
        <p class="error">User details could not be loaded or user not found.</p>
    {/if}

    <hr>
    <p><em>This page demonstrates using a store (<code>userDetailStore</code>) populated automatically by the root layout based on data loaded in this page's <code>+page.server.ts</code>.</em></p>
</main>

<style>
    main {
        padding: 2rem;
        max-width: 600px;
        margin: 2rem auto;
        font-family: system-ui, sans-serif;
        border: 1px solid #eee;
        border-radius: 8px;
        background-color: #fafafa;
    }
    h1 {
        color: #2d3748;
        margin-bottom: 1rem;
        font-size: 1.8rem;
    }
    a {
        display: inline-block;
        margin-bottom: 1.5rem;
        color: #3b82f6;
        text-decoration: none;
    }
    a:hover {
        text-decoration: underline;
    }
    .detail-card {
        background-color: white;
        padding: 1.5rem;
        border-radius: 6px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        margin-bottom: 1.5rem;
    }
    .detail-card h2 {
        margin-top: 0;
        margin-bottom: 1rem;
        color: #1a202c;
    }
    .detail-card p {
        margin: 0.5rem 0;
        line-height: 1.6;
        color: #4a5568;
    }
    strong {
        color: #2d3748;
    }
    hr {
        border: none;
        border-top: 1px solid #e2e8f0;
        margin: 2rem 0 1rem 0;
    }
    em {
        color: #718096;
        font-size: 0.9rem;
    }
    .error {
        color: #e53e3e;
        font-weight: bold;
    }
</style>
