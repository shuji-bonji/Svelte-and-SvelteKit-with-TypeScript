import adapter from '@sveltejs/adapter-static'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

/**
 * @type {import('@sveltejs/kit').Config}
 */
const config = {
	extensions: ['.svelte', '.md'],
	preprocess: [vitePreprocess()],
	kit: {
		adapter: adapter({
			pages: 'dist',
			assets: 'dist',
			fallback: undefined,
			precompress: false,
			strict: true
		}),
		paths: {
			base: '/Svelte-and-SvelteKit-with-TypeScript'
		},
		prerender: {
			handleHttpError: ({ path, referrer, message }) => {
				// Markdownファイル内のリンクエラーを無視
				if (path.startsWith('/') && !path.startsWith('/Svelte-and-SvelteKit-with-TypeScript')) {
					console.warn(`Warning: Link ${path} from ${referrer} needs base path`);
					return;
				}
				// その他のエラーはそのままスロー
				throw new Error(message);
			}
		}
	},
}

export default config
