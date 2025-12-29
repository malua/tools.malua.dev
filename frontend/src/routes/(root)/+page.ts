import { createApiClient } from '@/lib/utils/api';
import { browser } from '$app/environment';

export const load = async ({ fetch }) => {
	// In SSR (server-side), return empty data and let client fetch
	// This avoids the worker calling itself issue
	if (!browser) {
		return {
			entries: [],
			tags: []
		};
	}

	const { api } = createApiClient(fetch);

	const entriesRes = await api.entry.list.$get();
	const { entries } = await entriesRes.json();

	const tagRes = await api.tag.list.$get();
	const { tags } = await tagRes.json();

	return {
		entries,
		tags
	};
};
