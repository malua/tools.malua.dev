import honoApp from './index';

export default {
	async fetch(request: Request, env: any, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);

		// Route API requests to Hono
		if (url.pathname.startsWith('/api/')) {
			return honoApp.fetch(request, env, ctx);
		}

		// Route all other requests to SvelteKit SSR
		try {
			const { default: svelteHandler } = await import(
				'../../frontend/.svelte-kit/cloudflare/_worker.js'
			);

			// Create a custom fetch that routes API calls internally
			// This prevents SvelteKit SSR from making external requests to itself
			const customFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
				const fetchRequest = new Request(input, init);
				const fetchUrl = new URL(fetchRequest.url);

				// If this is an API call, route it internally to Hono instead of making external request
				if (fetchUrl.pathname.startsWith('/api/')) {
					return honoApp.fetch(fetchRequest, env, ctx);
				}

				// For other requests, use normal fetch
				return fetch(fetchRequest, init);
			};

			// Provide custom ASSETS binding and fetch to SvelteKit
			const envWithCustomFetch = {
				...env,
				ASSETS: {
					fetch: customFetch
				}
			};

			return svelteHandler.fetch(request, envWithCustomFetch, ctx);
		} catch (error) {
			return new Response(`Build frontend first: cd frontend && npm run build\n\nError: ${error}`, {
				status: 503
			});
		}
	}
} satisfies ExportedHandler<any>;
