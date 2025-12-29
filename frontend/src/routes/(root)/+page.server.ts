import type { PageServerLoad } from './$types';
import { dev } from '$app/environment';
import honoApp from '@backend/index';

export const load: PageServerLoad = async ({ platform, request, fetch, url }) => {
	const baseUrl = new URL(request.url).origin;

	// Get filter params from URL
	const nameFilter = url.searchParams.get('name') || '';
	const tagsFilter = url.searchParams.get('tags') || '';

	// Build query string for API
	const queryParams = new URLSearchParams();
	if (nameFilter) queryParams.set('name', nameFilter);
	if (tagsFilter) queryParams.set('tags', tagsFilter);
	const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

	// In development, use fetch (goes through Vite proxy to backend)
	// In production, call Hono internally (no HTTP, just function calls)
	if (dev || !platform?.env) {
		const [entriesRes, tagsRes] = await Promise.all([
			fetch(`/api/entry/list${queryString}`),
			fetch('/api/tag/list')
		]);

		const [{ entries }, { tags }] = await Promise.all([
			entriesRes.json() as Promise<{ entries: any[] }>,
			tagsRes.json() as Promise<{ tags: any[] }>
		]);

		return { entries, tags, nameFilter, tagsFilter: tagsFilter ? tagsFilter.split(',') : [] };
	}

	// Production: Call Hono internally (goes through all Hono middleware)

	const ctx = {
		waitUntil: () => {},
		passThroughOnException: () => {}
	} as unknown as ExecutionContext;

	const [entriesRes, tagsRes] = await Promise.all([
		honoApp.fetch(new Request(`${baseUrl}/api/entry/list${queryString}`), platform.env, ctx),
		honoApp.fetch(new Request(`${baseUrl}/api/tag/list`), platform.env, ctx)
	]);

	const [{ entries }, { tags }] = await Promise.all([
		entriesRes.json() as Promise<{ entries: any[] }>,
		tagsRes.json() as Promise<{ tags: any[] }>
	]);

	return {
		entries,
		tags,
		nameFilter,
		tagsFilter: tagsFilter ? tagsFilter.split(',') : []
	};
};
