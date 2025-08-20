import { defaultTheme } from '@sveltepress/theme-default';
import { sveltepress } from '@sveltepress/vite';
import { defineConfig } from 'vite';

const config = defineConfig({
  plugins: [
    // @ts-ignore - Viteバージョンの互換性問題を回避
    sveltepress({
      theme: defaultTheme({
        navbar: [
          {
            title: 'ホーム',
            to: '/',
          },
          {
            title: 'はじめに',
            to: '/introduction/',
          },
          {
            title: 'ガイド',
            to: '/guide/',
          },
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
                { title: 'Hello World', to: '/introduction/hello-world/' },
                { title: 'なぜTypeScriptが必要か', to: '/introduction/why-typescript/' },
                { title: 'TypeScript設定', to: '/introduction/typescript-setup/' },
              ],
            },
            {
              title: 'Svelteの基本',
              collapsible: true,
              items: [
                { title: 'Svelteの基本概要', to: '/svelte-basics/' },
                { title: 'コンポーネントの基本', to: '/svelte-basics/component-basics/' },
                {
                  title: 'テンプレート構文',
                  to: '/svelte-basics/template-syntax/',
                },
                {
                  title: 'トランジション・アニメーション',
                  to: '/svelte-basics/transitions/',
                },
                {
                  title: 'TypeScript統合',
                  to: '/svelte-basics/typescript-integration/',
                },
                {
                  title: 'use:アクション',
                  to: '/svelte-basics/actions/',
                },
              ],
            },
            {
              title: 'Runesシステム',
              collapsible: true,
              items: [
                { title: 'Runesシステム概要', to: '/runes/' },
                { title: 'Runesシステム入門', to: '/runes/runes-introduction/' },
                { title: '$state - リアクティブな状態', to: '/runes/state/' },
                { title: '$derived - 派生値', to: '/runes/derived/' },
                { title: '$effect - 副作用', to: '/runes/effect/' },
                { title: '$props - プロパティ', to: '/runes/props/' },
                { title: '$bindable - 双方向バインディング', to: '/runes/bindable/' },
                { title: '$inspect - デバッグ', to: '/runes/inspect/' },
                { title: '他フレームワークとの比較', to: '/runes/comparison/' },
              ],
            },
            {
              title: '実践編',
              collapsible: true,
              items: [
                { title: '実践概要', to: '/advanced/' },
                {
                  title: 'リアクティブストア',
                  to: '/advanced/reactive-stores/',
                },
                {
                  title: 'クラスとリアクティビティ',
                  to: '/advanced/class-reactivity/',
                },
                {
                  title: '組み込みリアクティブクラス',
                  to: '/advanced/built-in-classes/',
                },
                { title: 'Snippets機能', to: '/advanced/snippets/' },
                {
                  title: 'スクリプトコンテキスト',
                  to: '/advanced/script-context/',
                },
                {
                  title: 'コンポーネントパターン',
                  to: '/advanced/component-patterns/',
                },
                {
                  title: 'TypeScriptパターン',
                  to: '/advanced/typescript-patterns/',
                },
              ],
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
                { title: 'デプロイメント', to: '/sveltekit/deployment/' },
              ],
            },
            {
              title: '実装例',
              collapsible: true,
              items: [
                { title: '実装例一覧', to: '/examples/' },
                { title: 'TODOアプリ', to: '/examples/todo-app/' },
                { title: '認証システム', to: '/examples/auth-system/' },
                { title: 'データフェッチング', to: '/examples/data-fetching/' },
                { title: 'WebSocket実装', to: '/examples/websocket/' },
                { title: 'Mermaidダイアグラム', to: '/examples/mermaid-demo/' },
                { title: '機能デモ', to: '/examples/features-demo/' },
              ],
            },
            {
              title: '技術詳解',
              collapsible: true,
              collapsed: true,
              items: [
                {
                  title: 'コンパイル時最適化',
                  to: '/deep-dive/compile-time-optimization',
                },
                {
                  title: 'Svelte 5におけるProxyオブジェクトの活用',
                  to: '/deep-dive/leveraging-proxy-objects-in-svelte-5',
                },
                {
                  title: '$stateとProxyオブジェクト',
                  to: '/deep-dive/state-use-proxy-object',
                },
                {
                  title: '$state.raw() vs $state() の違いと使い分け',
                  to: '/deep-dive/state-raw-vs-state',
                },
                {
                  title:
                    '$state: リアクティブな状態変数と、バインディングの違い',
                  to: '/deep-dive/reactive-state-variables-vs-bindings',
                },
                {
                  title:
                    '$state: $derived vs $effect vs derived.by 完全比較ガイド',
                  to: '/deep-dive/derived-vs-effect-vs-derived-by',
                },
                {
                  title: 'カスタムエレメントと通常のSvelteコンポーネントの違い',
                  to: '/deep-dive/custom-elements-vs-svelte-components',
                },
                {
                  title:
                    '@renderディレクティブとSnippetオブジェクト、#snippetディレクティブ',
                  to: '/deep-dive/render-directive-snippet-object-snippet-directive',
                },
                {
                  title: 'HTML <template> と Svelte #snippet の違い',
                  to: '/deep-dive/html-templates-and-snippets',
                },
              ],
            },
          ],
        },
        github:
          'https://github.com/shuji-bonji/Svelte-and-SvelteKit-with-TypeScript',
        logo: '/svelteAndTypescript.svg',
        editLink:
          'https://github.com/shuji-bonji/Svelte-and-SvelteKit-with-TypeScriptedit/main/src/routes/',
      }),
      siteConfig: {
        title: 'TypeScriptで学ぶ Svelte 5/SvelteKit',
        description:
          'TypeScript による Svelte 5/SvelteKit 完全マスター学習ガイド',
      },
    }),
  ],
});

export default config;
