<script lang="ts">
	import { Column, createRender, createTable, Render, Subscribe } from 'svelte-headless-table';
	import { writable } from 'svelte/store';
	import * as Table from '@/lib/components/ui/table';
	import { Button } from '@/lib/components/ui/button';
	import { Input } from '@/lib/components/ui/input';
	import Tags from '../tags/tags.svelte';
	import { api } from '@/lib/utils/api';
	import userStore from '@/lib/stores/user.svelte';
	import type { AnyPlugins } from 'svelte-headless-table/plugins';
	import { Avatar } from '@/lib/components/ui/avatar';
	import MultiSelect from 'svelte-multiselect';
	import type { Tag } from '@backend/api/tag';
	import { goto } from '$app/navigation';

	const {
		software = [],
		tags = [],
		nameFilter: initialNameFilter = '',
		tagsFilter: initialTagsFilter = []
	}: { software: any[]; tags: Tag[]; nameFilter?: string; tagsFilter?: string[] } = $props();

	let nameFilter = $state(initialNameFilter);
	let selectedTagFilters: string[] = $state(initialTagsFilter);

	const tagNames = tags.map((tag) => tag.name);

	function applyFilters() {
		const params = new URLSearchParams();
		if (nameFilter) params.set('name', nameFilter);
		if (selectedTagFilters.length > 0) params.set('tags', selectedTagFilters.join(','));
		const queryString = params.toString() ? `?${params.toString()}` : '';
		goto(`/${queryString}`, { invalidateAll: true });
	}

	const user = userStore.user;

	const softwareStore = writable(software);
	$effect(() => {
		softwareStore.set(software);
	});

	const table = createTable(softwareStore);

	const columnDefinitions: Column<any, AnyPlugins>[] = [
		table.column({
			id: 'icon',
			accessor: 'websiteUrl',
			header: '',
			cell: ({ value, row }) => {
				const name = row.cellForId['name'].value;
				const hostName = value ? new URL(value).hostname : '';
				const faviconUrl = value ? `https://favicone.com/${hostName}?s=24` : null;
				return createRender(Avatar, {
					src: faviconUrl,
					alt: 'Favicon of ' + value,
					fallback: name?.substring(0, 2)
				});
			}
		}),
		table.column({
			accessor: 'name',
			header: 'Name'
		}),
		table.column({
			accessor: 'entryTags',
			header: 'Tags',
			cell: ({ value }) => createRender(Tags, { tags: value.map((v) => v.tag) })
		}),
		table.column({
			accessor: 'websiteUrl',
			header: 'Website',
			cell: ({ value }) => createRender(Button, { variant: 'link', children: value, href: value, target: '_blank' })
		}),
		table.column({
			accessor: 'githubUrl',
			header: 'Github',
			cell: ({ value }) => createRender(Button, { variant: 'link', children: value, href: value, target: '_blank' })
		})
	];

	if (user) {
		columnDefinitions.push(
			table.column({
				accessor: ({ id }) => id,
				header: '',
				cell: ({ value }) =>
					createRender(Button, {
						variant: 'outline',
						children: 'Delete',
						onclick: async () => {
							await api.entry.delete[':id'].$delete({
								param: {
									id: value
								}
							});

							window.location.reload();
						}
					})
			})
		);
	}

	const columns = table.createColumns(columnDefinitions);

	const { headerRows, pageRows, tableAttrs, tableBodyAttrs } = table.createViewModel(columns);
</script>

<div class="mb-4 flex gap-4">
	<div class="flex-1">
		<Input
			placeholder="Filter by name..."
			bind:value={nameFilter}
			onkeydown={(e) => e.key === 'Enter' && applyFilters()}
		/>
	</div>
	<div class="w-64">
		<MultiSelect
			options={tagNames}
			bind:selected={selectedTagFilters}
			placeholder="Filter by tags..."
			on:change={applyFilters}
		/>
	</div>
</div>

<div class="rounded-md border">
	<Table.Root {...$tableAttrs}>
		<Table.Header>
			{#each $headerRows as headerRow}
				<Subscribe rowAttrs={headerRow.attrs()}>
					<Table.Row>
						{#each headerRow.cells as cell (cell.id)}
							<Subscribe attrs={cell.attrs()} let:attrs props={cell.props()}>
								<Table.Head {...attrs}>
									<Render of={cell.render()} />
								</Table.Head>
							</Subscribe>
						{/each}
					</Table.Row>
				</Subscribe>
			{/each}
		</Table.Header>
		<Table.Body {...$tableBodyAttrs}>
			{#each $pageRows as row (row.id)}
				<Subscribe rowAttrs={row.attrs()} let:rowAttrs>
					<Table.Row {...rowAttrs}>
						{#each row.cells as cell (cell.id)}
							<Subscribe attrs={cell.attrs()} let:attrs>
								<Table.Cell {...attrs}>
									<Render of={cell.render()} />
								</Table.Cell>
							</Subscribe>
						{/each}
					</Table.Row>
				</Subscribe>
			{/each}
		</Table.Body>
	</Table.Root>
</div>
