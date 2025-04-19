<script lang="ts">
	import { usersStore } from '$lib/stores/userStores';

	// Extract nested stores for clarity and potentially better type inference
	$: loading = usersStore.loading;
	$: error = usersStore.error;
</script>

<main>
	<h1>User Stores Demo</h1>

	<div class="container">
		<div class="box">
			<h2>Users</h2>

			{#if $loading}
				<p>Loading users...</p>
			{:else if $error}
				<p style="color: red;">Error loading users: {$error.message}</p>
			{:else if $usersStore && $usersStore.length > 0}
				<ul>
					{#each $usersStore as user}
						<li>
							<strong>{user.name}</strong> ({user.email})
							<!-- Link to detail page -->
							<a href="/user/{user.id}/detail" style="margin-left: 1em; font-size: 0.9em;"
								>(View Details)</a
							>
						</li>
					{/each}
				</ul>
			{:else}
				<p>No users found.</p>
			{/if}
		</div>
	</div>

	<div class="info">
		<h3>How This Works (Layout Method)</h3>
		<p>
			The server-side load function returns promises wrapped with an identifier. The root layout's
			client-side <code>script</code> reacts to <code>$page.data</code> changes. It checks for the identifier,
			unwraps the data, and updates the stores. The page component simply uses the stores directly.
		</p>
	</div>
</main>

<style>
	main {
		max-width: 800px;
		margin: 0 auto;
		padding: 2rem;
		font-family: system-ui, sans-serif;
	}

	h1 {
		color: #3b82f6;
		margin-bottom: 1rem;
	}

	.container {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1.5rem;
		margin: 2rem 0;
	}

	.box {
		padding: 1.5rem;
		border-radius: 0.5rem;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
		background-color: white;
	}

	h2 {
		margin-top: 0;
		color: #4b5563;
		font-size: 1.5rem;
		border-bottom: 1px solid #e5e7eb;
		padding-bottom: 0.75rem;
		margin-bottom: 1rem;
	}

	ul {
		list-style-type: none;
		padding: 0;
	}

	li {
		padding: 0.5rem 0;
		border-bottom: 1px solid #f3f4f6;
	}

	li:last-child {
		border-bottom: none;
	}

	.info {
		margin-top: 2rem;
		padding: 1.5rem;
		background-color: #f8fafc;
		border-radius: 0.5rem;
		border-left: 4px solid #3b82f6;
	}

	h3 {
		margin-top: 0;
		color: #4b5563;
	}

	a {
		color: #3b82f6;
		text-decoration: none;
	}
	a:hover {
		text-decoration: underline;
	}
</style>
