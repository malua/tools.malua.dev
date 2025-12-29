import { hc } from 'hono/client';
import type { AppType } from '@backend/index';

function getBaseUrl() {
	// Production: Same origin, use relative URLs
	if (import.meta.env.PROD) {
		return '';
	}

	// Development: Proxy to backend
	return 'http://localhost:8000';
}

export const { api } = hc<AppType>(getBaseUrl(), {
	fetch: (input: string | URL | globalThis.Request, init?: RequestInit) => {
		return fetch(input, {
			...init,
			credentials: 'include'
		});
	}
});
