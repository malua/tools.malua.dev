<script lang="ts">
	import '@/app.css';
	import type { EnvUser } from '@backend/lib/types/app';
	import Cookies from 'js-cookie';
	import { untrack } from 'svelte';
	import { Toaster } from '@/lib/components/ui/sonner';
	import userStore from '@/lib/stores/user.svelte';
	import { page } from '$app/state';
	import { authBasedRedirection } from './layout.svelte';

	const user = JSON.parse(decodeURI(Cookies.get('user-data') ?? 'null')) as EnvUser;
	userStore.setUser(user);

	const { children } = $props();
	$effect(() => {
		untrack(authBasedRedirection);
		[page.url.pathname];
	});
</script>

<main>
	{@render children()}
</main>
<Toaster richColors />
