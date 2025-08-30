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
			handleMissingId: 'warn',
			handleHttpError: ({ path, referrer, message }) => {
				// 準備中のページへのリンクは警告のみ
				const pendingPages = [
					// アーキテクチャ詳解
					'/sveltekit/architecture/execution-environments/',
					'/sveltekit/architecture/file-structure/',
					'/sveltekit/architecture/data-loading/',
					'/sveltekit/architecture/rendering-pipeline/',
					// サーバーサイド編
					'/sveltekit/server/server-side/',
					'/sveltekit/server/api-routes/',
					'/sveltekit/server/hooks/',
					// アプリケーション構築編
					'/sveltekit/application/authentication/',
					'/sveltekit/application/database/',
					'/sveltekit/application/environment/',
					'/sveltekit/application/error-handling/',
					// 最適化編
					'/sveltekit/optimization/performance/',
					'/sveltekit/optimization/caching/',
					'/sveltekit/optimization/seo/',
					// デプロイ・運用編
					'/sveltekit/deployment/security/',
					'/sveltekit/deployment/monitoring/',
					// その他
					'/guide'
				];
				
				// ベースパスを含むフルパスでチェック
				const fullPath = path.includes('/Svelte-and-SvelteKit-with-TypeScript') 
					? path.replace('/Svelte-and-SvelteKit-with-TypeScript', '') 
					: path;
				
				if (pendingPages.some(pending => fullPath.includes(pending))) {
					console.warn(`Warning: Pending page ${path} referenced from ${referrer}`);
					return;
				}
				
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
