import adapter from '@sveltejs/adapter-static'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

/**
 * @type {import('@sveltejs/kit').Config}
 */
const config = {
	extensions: ['.svelte', '.md'],
	preprocess: [vitePreprocess()],
	onwarn: (warning, handler) => {
		// .sveltepress/live-code内の自動生成ファイルの警告を抑制
		if (warning.filename && warning.filename.includes('.sveltepress/live-code/')) {
			return; // live-code内のすべての警告を無視
		}
		// その他の警告は通常通り処理
		handler(warning);
	},
	compilerOptions: {
		// ビルド時の警告制御
		warningFilter: (warning) => {
			// .sveltepress/live-code内の警告をフィルタ
			if (warning.filename && warning.filename.includes('.sveltepress/live-code/')) {
				return false; // 警告を表示しない
			}
			return true; // その他の警告は表示
		}
	},
	kit: {
		adapter: adapter({
			pages: 'dist',
			assets: 'dist',
			fallback: '404.html', // 404ページをフォールバックとして使用
			precompress: false,
			strict: false // strictモードを無効化してエラーを回避
		}),
		paths: {
			base: '/Svelte-and-SvelteKit-with-TypeScript'
		},
		prerender: {
			entries: ['*'],
			crawl: true,
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
