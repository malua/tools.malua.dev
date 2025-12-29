import { hc } from 'hono/client';
import type { AppType } from '@backend/index';

function getBaseUrl() {
	// SSR: Use empty string for same-Worker requests
	if (typeof window === 'undefined') {
		return '';
	}

	// Production: Same origin, use relative URLs
	if (import.meta.env.PROD) {
		return '';
	}

	// Development: Proxy to backend
	return 'http://localhost:8000';
}

// Create API client factory that accepts custom fetch
export function createApiClient(customFetch?: typeof fetch) {
	const fetchFn = customFetch || fetch;

	return hc<AppType>(getBaseUrl(), {
		fetch: (input: string | URL | globalThis.Request, init?: RequestInit) => {
			return fetchFn(input, {
				...init,
				credentials: 'include'
			});
		}
	});
}

// Default client for browser usage
export const { api } = createApiClient();
