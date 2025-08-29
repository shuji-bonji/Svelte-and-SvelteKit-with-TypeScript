import { defaultTheme } from '@sveltepress/theme-default';
import { sveltepress } from '@sveltepress/vite';
import { defineConfig } from 'vite';
import type { Plugin } from 'vite';

// ビルド時の警告を環境変数で制御
process.env.VITE_PLUGIN_SVELTE_DISABLE_WARNINGS = 'true';

// Svelteの警告をフィルタリングするプラグイン
const svelteLiveCodeWarningFilter = (): Plugin => {
  return {
    name: 'svelte-livecode-warning-filter',
    enforce: 'pre',
    config(config) {
      if (!config.server) config.server = {};
      if (!config.server.hmr) config.server.hmr = {};

      // 開発サーバーの警告を抑制
      const originalWarn = console.warn;
      console.warn = (...args: any[]) => {
        const message = args[0]?.toString() || '';
        if (message.includes('.sveltepress/live-code/')) {
          return;
        }
        originalWarn(...args);
      };

      return config;
    },
  };
};

const config = defineConfig({
  plugins: [
    svelteLiveCodeWarningFilter(),
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
            title: 'Svelte',
            to: '/svelte/',
          },
          {
            title: 'SvelteKit',
            to: '/sveltekit/',
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
                {
                  title: 'なぜTypeScriptが必要か',
                  to: '/introduction/why-typescript/',
                },
                {
                  title: 'TypeScript設定',
                  to: '/introduction/typescript-setup/',
                },
              ],
            },
            {
              title: 'Svelte',
              collapsible: true,
              items: [
                { title: 'Svelte概要', to: '/svelte/' },
                {
                  title: '基本',
                  to: '/svelte/basics/',
                  collapsible: true,
                  items: [
                    { title: 'Svelteの基本概要', to: '/svelte/basics/' },
                    {
                      title: 'コンポーネントの基本',
                      to: '/svelte/basics/component-basics/',
                    },
                    {
                      title: 'テンプレート構文',
                      to: '/svelte/basics/template-syntax/',
                    },
                    {
                      title: 'コンポーネントライフサイクル',
                      to: '/svelte/basics/component-lifecycle/',
                    },
                    { title: 'use:アクション', to: '/svelte/basics/actions/' },
                    {
                      title: 'トランジション・アニメーション',
                      to: '/svelte/basics/transitions/',
                    },
                    {
                      title: 'TypeScript統合',
                      to: '/svelte/basics/typescript-integration/',
                    },
                  ],
                },
                {
                  title: 'Runesシステム',
                  to: '/svelte/runes/',
                  collapsible: true,
                  items: [
                    { title: 'Runesシステム概要', to: '/svelte/runes/' },
                    {
                      title: 'Runesシステム入門',
                      to: '/svelte/runes/runes-introduction/',
                    },
                    {
                      title: '$state - リアクティブな状態',
                      to: '/svelte/runes/state/',
                    },
                    {
                      title: '$derived - 派生値',
                      to: '/svelte/runes/derived/',
                    },
                    { title: '$effect - 副作用', to: '/svelte/runes/effect/' },
                    {
                      title: '$props - プロパティ',
                      to: '/svelte/runes/props/',
                    },
                    {
                      title: '$bindable - 双方向バインディング',
                      to: '/svelte/runes/bindable/',
                    },
                    {
                      title: '$host - カスタムエレメント',
                      to: '/svelte/runes/host/',
                    },
                    {
                      title: '$inspect - デバッグ',
                      to: '/svelte/runes/inspect/',
                    },
                    {
                      title: '他フレームワークとの比較',
                      to: '/svelte/runes/comparison/',
                    },
                  ],
                },
                {
                  title: '実践編',
                  to: '/svelte/advanced/',
                  collapsible: true,
                  collapsed: true,
                  items: [
                    { title: '実践概要', to: '/svelte/advanced/' },
                    {
                      title: 'リアクティブストア',
                      to: '/svelte/advanced/reactive-stores/',
                    },
                    {
                      title: 'クラスとリアクティビティ',
                      to: '/svelte/advanced/class-reactivity/',
                    },
                    {
                      title: '組み込みリアクティブクラス',
                      to: '/svelte/advanced/built-in-classes/',
                    },
                    { title: 'Snippets機能', to: '/svelte/advanced/snippets/' },
                    {
                      title: 'スクリプトコンテキスト',
                      to: '/svelte/advanced/script-context/',
                    },
                    {
                      title: 'コンポーネントパターン',
                      to: '/svelte/advanced/component-patterns/',
                    },
                    {
                      title: 'TypeScriptパターン',
                      to: '/svelte/advanced/typescript-patterns/',
                    },
                  ],
                },
              ],
            },
            {
              title: 'SvelteKit',
              collapsible: true,
              items: [
                { title: 'SvelteKit概要', to: '/sveltekit/' },
                {
                  title: '基礎編',
                  to: '/sveltekit/basics/',
                  collapsible: true,
                  items: [
                    { title: '基礎編概要', to: '/sveltekit/basics/' },
                    {
                      title: 'SvelteKit概要',
                      to: '/sveltekit/basics/overview/',
                    },
                    {
                      title: 'プロジェクト構造',
                      to: '/sveltekit/basics/project-structure/',
                    },
                    {
                      title: 'ルーティング詳解',
                      to: '/sveltekit/basics/routing/',
                    },
                    {
                      title: 'データ読み込み',
                      to: '/sveltekit/basics/load-functions/',
                    },
                  ],
                },
                {
                  title: 'アーキテクチャ詳解',
                  to: '/sveltekit/architecture/',
                  collapsible: true,
                  items: [
                    {
                      title: 'アーキテクチャ概要',
                      to: '/sveltekit/architecture/',
                    },
                    {
                      title: '実行環境別アーキテクチャ',
                      to: '/sveltekit/architecture/execution-environments/',
                    },
                    {
                      title: 'ファイル構成と実行環境',
                      to: '/sveltekit/architecture/file-structure/',
                    },
                    {
                      title: 'データロードフロー',
                      to: '/sveltekit/architecture/data-loading/',
                    },
                    {
                      title: 'レンダリングパイプライン',
                      to: '/sveltekit/architecture/rendering-pipeline/',
                    },
                  ],
                },
                {
                  title: 'サーバーサイド編',
                  to: '/sveltekit/server/',
                  collapsible: true,
                  items: [
                    { title: 'サーバーサイド編概要', to: '/sveltekit/server/' },
                    {
                      title: 'フォーム処理とActions',
                      to: '/sveltekit/basics/forms/',
                    },
                    {
                      title: 'サーバーサイド処理 (準備中)',
                      to: '/sveltekit/server-side/',
                    },
                    {
                      title: 'APIルート設計 (準備中)',
                      to: '/sveltekit/api-routes/',
                    },
                    { title: 'Hooks (準備中)', to: '/sveltekit/hooks/' },
                  ],
                },
                {
                  title: 'アプリケーション構築編',
                  to: '/sveltekit/application/',
                  collapsible: true,
                  collapsed: true,
                  items: [
                    {
                      title: 'アプリケーション構築編概要',
                      to: '/sveltekit/application/',
                    },
                    {
                      title: '認証・認可 (準備中)',
                      to: '/sveltekit/authentication/',
                    },
                    {
                      title: 'データベース統合 (準備中)',
                      to: '/sveltekit/database/',
                    },
                    {
                      title: '環境変数管理 (準備中)',
                      to: '/sveltekit/environment/',
                    },
                    {
                      title: 'エラーハンドリング (準備中)',
                      to: '/sveltekit/error-handling/',
                    },
                  ],
                },
                {
                  title: '最適化編',
                  to: '/sveltekit/optimization/',
                  collapsible: true,
                  collapsed: true,
                  items: [
                    { title: '最適化編概要', to: '/sveltekit/optimization/' },
                    {
                      title: 'パフォーマンス最適化 (準備中)',
                      to: '/sveltekit/performance/',
                    },
                    {
                      title: 'キャッシュ戦略 (準備中)',
                      to: '/sveltekit/caching/',
                    },
                    { title: 'SEO最適化 (準備中)', to: '/sveltekit/seo/' },
                  ],
                },
                {
                  title: 'デプロイ・運用編',
                  to: '/sveltekit/deployment/',
                  collapsible: true,
                  collapsed: true,
                  items: [
                    {
                      title: 'デプロイ・運用編概要',
                      to: '/sveltekit/deployment/',
                    },
                    {
                      title: 'プラットフォーム別デプロイ',
                      to: '/sveltekit/deployment/platforms/',
                    },
                    {
                      title: 'セキュリティ (準備中)',
                      to: '/sveltekit/security/',
                    },
                    {
                      title: 'モニタリング (準備中)',
                      to: '/sveltekit/monitoring/',
                    },
                  ],
                },
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
              ],
            },
            {
              title: 'ディープダイブ',
              collapsible: true,
              collapsed: true,
              items: [
                { title: '概要', to: '/deep-dive/' },
                {
                  title: 'コンパイル時最適化',
                  to: '/deep-dive/compile-time-optimization',
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
                  title: 'HTML <template> と Svelte #snippet の違い',
                  to: '/deep-dive/html-templates-and-snippets',
                },
                {
                  title: '素のJavaScript構文でリアクティビティを実現',
                  to: '/deep-dive/reactivity-with-plain-javascript-syntax',
                },
                {
                  title: 'レンダリング戦略 と アーキテクチャパターン',
                  to: '/deep-dive/rendering-strategies',
                },
                {
                  title: 'SvelteKitが自動生成する型の一覧',
                  to: '/deep-dive/auto-generated-types',
                },
              ],
            },
          ],
        },
        github:
          'https://github.com/shuji-bonji/Svelte-and-SvelteKit-with-TypeScript',
        logo: '/svelteAndTypescript.svg',
        editLink:
          'https://github.com/shuji-bonji/Svelte-and-SvelteKit-with-TypeScript/edit/main/src/routes/',
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
