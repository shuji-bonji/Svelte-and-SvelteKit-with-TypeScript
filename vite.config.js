import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';

// 本番ビルドで GitHub Actions が BASE_PATH=/Svelte-and-SvelteKit-with-TypeScript を渡す。
// dev / ローカル build では空文字列。SvelteKit の paths.base と完全に揃える必要がある。
const base = process.env.BASE_PATH ?? '';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit(),
		SvelteKitPWA({
			// SvelteKit 統合: SW を src/ ではなく vite-plugin-pwa 側で生成（generateSW 戦略）
			strategies: 'generateSW',
			// 静的サイト出力（adapter-static）に合わせて scope を base 配下に固定
			scope: `${base}/`,
			base: `${base}/`,
			registerType: 'prompt', // 新版検知時にユーザーへ prompt（自動更新せず）
			injectRegister: false, // 登録は workbox-window 経由で手動制御（更新通知 UI に統合）
			pwaAssets: {
				disabled: true // 既に static/ に手動配置した icon-* を使うため無効化
			},
			manifest: {
				name: 'TypeScriptで学ぶ Svelte 5/SvelteKit 完全マスター学習ガイド',
				short_name: 'Svelte & Kit Guide',
				description:
					'TypeScript による Svelte 5 / SvelteKit の日本語完全学習ガイド。Runes、SSR/SSG、型安全な実装パターンを実践コードで解説',
				lang: 'ja',
				dir: 'ltr',
				start_url: `${base}/`,
				scope: `${base}/`,
				display: 'standalone',
				orientation: 'portrait-primary',
				theme_color: '#ff3e00',
				background_color: '#1a1a1a',
				categories: ['education', 'developer', 'books'],
				icons: [
					{
						src: `${base}/icon-192.png`,
						sizes: '192x192',
						type: 'image/png',
						purpose: 'any'
					},
					{
						src: `${base}/icon-512.png`,
						sizes: '512x512',
						type: 'image/png',
						purpose: 'any'
					},
					{
						src: `${base}/icon-maskable-512.png`,
						sizes: '512x512',
						type: 'image/png',
						purpose: 'maskable'
					}
				]
			},
			workbox: {
				// @vite-pwa/sveltekit は globDirectory をデフォルトで `.svelte-kit/output` にし、
				// `client/**` と `prerendered/**` プレフィックスで glob を解決する。
				// その後 manifestTransforms が `prerendered/pages/index.html` → `${base}/` のように
				// URL を base 起点へ変換するため、ここでは plugin プレフィックス前提で記述する。
				//
				// 戦略：
				//   - JS/CSS/フォント/アイコン等の静的アセット → precache（SW 起動時に必須）
				//   - 全 prerender ページ HTML → precache すると肥大化するためここでは含めず、
				//     runtime caching の NetworkFirst (pages-cache) に任せる
				globPatterns: [
					'client/**/*.{js,css,ico,png,svg,webp,woff,woff2,webmanifest}',
					'prerendered/pages/index.html' // トップだけ precache（オフライン起動の保険）
				],
				globIgnores: ['**/sw*', '**/workbox-*', 'server/**'],
				// navigateFallback は plugin デフォルト (`adapterFallback ?? base`) に任せる。
				// `${base}/` (= manifestTransforms 後の index.html URL) に自動で揃うため、
				// ここで明示すると precache URL とのズレで non-precached-url エラーになりやすい。
				navigateFallbackDenylist: [
					// 外部リソース・SW 自身・サイトマップは fallback 対象外
					/^\/api\//,
					/sw\.js$/,
					/sitemap\.xml$/
				],
				// runtime caching strategies
				runtimeCaching: [
					{
						// 記事ページ HTML: ネットワーク優先、失敗時はキャッシュ
						urlPattern: ({ request, url }) =>
							request.destination === 'document' &&
							url.origin === self.location.origin,
						handler: 'NetworkFirst',
						options: {
							cacheName: 'pages-cache',
							expiration: {
								maxEntries: 100,
								maxAgeSeconds: 60 * 60 * 24 * 30 // 30 日
							},
							networkTimeoutSeconds: 3
						}
					},
					{
						// 同一オリジンの画像（記事内図版など）
						urlPattern: ({ request, url }) =>
							request.destination === 'image' &&
							url.origin === self.location.origin,
						handler: 'StaleWhileRevalidate',
						options: {
							cacheName: 'images-cache',
							expiration: {
								maxEntries: 100,
								maxAgeSeconds: 60 * 60 * 24 * 60 // 60 日
							}
						}
					},
					{
						// Google Fonts / CDN フォント
						urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
						handler: 'CacheFirst',
						options: {
							cacheName: 'fonts-cache',
							expiration: {
								maxEntries: 30,
								maxAgeSeconds: 60 * 60 * 24 * 365 // 1 年
							}
						}
					}
					// NOTE: svelte.dev/playground の iframe は SW 介入なし（ネットワーク直通）。
					// クロスオリジン iframe は同一オリジンの SW スコープ外で、Playground 側 SW に委譲される。
				],
				cleanupOutdatedCaches: true,
				clientsClaim: false, // 更新時にユーザー確認後に切り替え
				skipWaiting: false
			},
			devOptions: {
				enabled: false, // dev サーバでは SW 無効（HMR 干渉回避）
				type: 'module',
				navigateFallback: '/'
			},
			kit: {
				// kit.outDir は SvelteKit の中間出力（.svelte-kit/output）を指す。
				// adapter-static の最終出力 (`dist/`) ではない。デフォルトに任せる。
				// trailingSlash: 'always' に追従（manifestTransforms が末尾スラッシュを付与する）
				trailingSlash: 'always'
			}
		})
	]
});
