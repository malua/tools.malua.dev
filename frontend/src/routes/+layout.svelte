<script lang="ts">
	import '@/app.css';
	import { untrack } from 'svelte';
	import { Toaster } from '@/lib/components/ui/sonner';
	import userStore from '@/lib/stores/user.svelte';
	import { page } from '$app/state';
	import { authBasedRedirection } from './layout.svelte';

	const { data, children } = $props();
	userStore.setUser(data.user);

	$effect(() => {
		untrack(authBasedRedirection);
		[page.url.pathname];
	});
</script>

<main>
	{@render children()}
</main>
<Toaster richColors />
