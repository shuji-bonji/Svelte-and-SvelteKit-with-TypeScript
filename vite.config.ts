import { defaultTheme } from '@sveltepress/theme-default'
import { sveltepress } from '@sveltepress/vite'
import { defineConfig } from 'vite'

const config = defineConfig({
	plugins: [
		sveltepress({
			theme: defaultTheme({
				navbar: [
					{
						title: 'ホーム',
						to: '/'
					},
					{
						title: '入門',
						to: '/introduction/'
					},
					{
						title: 'Svelteの基本',
						to: '/svelte-basics/'
					},
					{
						title: 'Runes',
						to: '/runes/'
					},
					{
						title: '実践',
						to: '/advanced/'
					},
					{
						title: 'SvelteKit',
						to: '/sveltekit/'
					},
					{
						title: '実装例',
						to: '/examples/'
					}
				],
				sidebar: {
					'/': [
						{
							title: 'はじめに',
							collapsible: true,
							items: [
								{ title: 'Svelte 5の概要', to: '/introduction/' },
								{ title: 'なぜSvelteか', to: '/introduction/why-svelte/' },
								{ title: '環境構築', to: '/introduction/setup/' },
								{ title: 'TypeScript設定', to: '/introduction/typescript-setup/' },
								// { title: '機能デモ', to: '/introduction/features-demo/' }
							]
						},
						{
							title: 'Svelteの基本',
							collapsible: true,
							items: [
								{ title: 'Svelteの基本概要', to: '/svelte-basics/' },
								{ title: 'Hello World', to: '/svelte-basics/hello-world/' },
								{ title: 'コンポーネントの基本', to: '/svelte-basics/component-basics/' },
								{ title: 'TypeScript統合', to: '/svelte-basics/typescript-integration/' },
								{ title: 'スクリプトコンテキスト', to: '/svelte-basics/script-context/' }
							]
						},
						{
							title: 'Runesシステム',
							collapsible: true,
							items: [
								{ title: 'Runesシステム概要', to: '/runes/' },
								{ title: 'Runesシステム入門', to: '/runes/runes-introduction/' },
								{ title: '$stateルーン', to: '/runes/state/' },
								{ title: '$derivedルーン', to: '/runes/derived/' },
								{ title: '$effectルーン', to: '/runes/effect/' },
								{ title: '$propsルーン', to: '/runes/props/' },
								{ title: '$bindableルーン', to: '/runes/bindable/' }
							]
						},
						{
							title: '実践編',
							collapsible: true,
							items: [
								{ title: '実践概要', to: '/advanced/' },
								{ title: 'リアクティブストア', to: '/advanced/reactive-stores/' },
								{ title: 'クラスとリアクティビティ', to: '/advanced/class-reactivity/' },
								{ title: 'Snippets機能', to: '/advanced/snippets/' },
								{ title: 'コンポーネントパターン', to: '/advanced/component-patterns/' },
								{ title: 'TypeScriptパターン', to: '/advanced/typescript-patterns/' }
							]
						},
						{
							title: 'SvelteKit',
							collapsible: true,
							items: [
								{ title: 'SvelteKit概要', to: '/sveltekit/' },
								{ title: 'ルーティング', to: '/sveltekit/routing/' },
								{ title: 'Load関数', to: '/sveltekit/load-functions/' },
								{ title: 'サーバーサイド処理', to: '/sveltekit/server-side/' },
								{ title: 'フォーム処理', to: '/sveltekit/forms/' },
								{ title: 'APIルート', to: '/sveltekit/api-routes/' },
								{ title: 'デプロイメント', to: '/sveltekit/deployment/' }
							]
						},
						{
							title: '実装例',
							collapsible: true,
							items: [
								{ title: '実装例一覧', to: '/examples/' },
								{ title: 'TODOアプリ', to: '/examples/todo-app/' },
								{ title: '認証システム', to: '/examples/auth-system/' },
								{ title: 'データフェッチング', to: '/examples/data-fetching/' },
								{ title: 'WebSocket実装', to: '/examples/websocket/' }
							]
						}
					]
				},
				github: 'https://github.com/shuji-bonji/Svelte-and-SvelteKit-with-TypeScript',
				logo: '/sveltepress.svg',
				editLink: 'https://github.com/shuji-bonji/Svelte-and-SvelteKit-with-TypeScript/edit/main/src/routes/'
			}),
			siteConfig: {
				title: 'TypeScriptで学ぶ Svelte 5/SvelteKit',
				description: 'TypeScript による Svelte 5/SvelteKit 完全マスター学習ガイド'
			},
		}),
	],
})

export default config
