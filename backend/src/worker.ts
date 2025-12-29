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

			// SvelteKit SSR will call honoApp.fetch() directly for API data,
			// so no custom fetch interception needed
			return svelteHandler.fetch(request, env, ctx);
		} catch (error) {
			return new Response(`Build frontend first: cd frontend && npm run build\n\nError: ${error}`, {
				status: 503
			});
		}
	}
} satisfies ExportedHandler<any>;
