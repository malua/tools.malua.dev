<script lang="ts">
	import { Button } from '@/lib/components/ui/button';
	import { rootPageHandler } from './page.svelte';
	import Dialog from '@/lib/components/ui/dialog/dialog.svelte';
	import { goto } from '$app/navigation';
	import userStore from '@/lib/stores/user.svelte';
	import DataTable from './data-table/data-table.svelte';
	import type { Entry } from '@backend/services/db/schema';
	import { Form } from '@/lib/components/form';
	import type { Tag } from '@backend/api/tag';

	const user = userStore.user;

	let { data }: { data: { entries: Entry[]; tags: Tag[]; nameFilter: string; tagsFilter: string[] } } = $props();

	let isOpen = $state(false);
</script>

<div class="flex justify-between gap-2 px-4 py-2">
	{#if user}
		<Button onclick={() => (isOpen = true)}>Create new entry</Button>

		<Dialog {isOpen}>
			<Form cancel={() => (isOpen = false)} tags={data.tags}></Form>
		</Dialog>
		<Button class="cursor-pointer" variant="outline" onclick={rootPageHandler.signOut}>Sign Out</Button>
	{:else}
		<Button class="cursor-pointer" variant="outline" onclick={() => goto('/sign-in')}>Sign In</Button>
	{/if}
</div>

<div class="mx-4">
	<DataTable software={data.entries} tags={data.tags} nameFilter={data.nameFilter} tagsFilter={data.tagsFilter}
	></DataTable>
</div>
