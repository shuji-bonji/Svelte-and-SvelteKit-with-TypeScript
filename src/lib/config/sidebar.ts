// Shared sidebar configuration
// This is the single source of truth for sidebar structure
// Used by both vite.config.ts and navigation utilities

export interface SidebarItem {
  title: string;
  to: string;
  items?: SidebarItem[];
  collapsible?: boolean;
  collapsed?: boolean;
}

export const sidebarConfig: { [key: string]: SidebarItem[] } = {
  '/': [
    {
      title: 'はじめに',
      to: '/introduction/',
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
        { title: 'TypeScript設定', to: '/introduction/typescript-setup/' },
      ],
    },
    {
      title: 'Svelte',
      to: '/svelte/',
      collapsible: true,
      items: [
        { title: 'Svelte 5完全ガイド', to: '/svelte/' },
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
              title: '特別な要素',
              to: '/svelte/basics/special-elements/',
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
            { title: '$derived - 派生値', to: '/svelte/runes/derived/' },
            { title: '$effect - 副作用', to: '/svelte/runes/effect/' },
            { title: '$props - プロパティ', to: '/svelte/runes/props/' },
            {
              title: '$bindable - 双方向バインディング',
              to: '/svelte/runes/bindable/',
            },
            { title: '$host - カスタムエレメント', to: '/svelte/runes/host/' },
            { title: '$inspect - デバッグ', to: '/svelte/runes/inspect/' },
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
        // {
        //   title: 'アーキテクチャ',
        //   to: '/svelte/architecture/',
        //   collapsible: true,
        //   collapsed: true,
        //   items: [
        //     { title: 'アーキテクチャ概要', to: '/svelte/architecture/' },
        //     {
        //       title: 'SPA + 既存API統合',
        //       to: '/svelte/architecture/spa-patterns/',
        //     },
        //     {
        //       title: 'BaaS統合パターン',
        //       to: '/svelte/architecture/baas-integration/',
        //       items: [
        //         {
        //           title: 'Firebase統合',
        //           to: '/svelte/architecture/baas-integration/firebase/',
        //         },
        //         {
        //           title: 'Supabase統合',
        //           to: '/svelte/architecture/baas-integration/supabase/',
        //         },
        //       ],
        //     },
        //     {
        //       title: 'GraphQL統合',
        //       to: '/svelte/architecture/graphql/',
        //     },
        //     {
        //       title: 'マイクロフロントエンド',
        //       to: '/svelte/architecture/micro-frontends/',
        //     },
        //   ],
        // },
      ],
    },
    {
      title: 'SvelteKit',
      to: '/sveltekit/',
      collapsible: true,
      items: [
        { title: 'SvelteKit完全ガイド', to: '/sveltekit/' },
        {
          title: '基礎編',
          to: '/sveltekit/basics/',
          collapsible: true,
          items: [
            { title: '基礎編概要', to: '/sveltekit/basics/' },
            { title: 'SvelteKit概要', to: '/sveltekit/basics/overview/' },
            {
              title: 'プロジェクト構造',
              to: '/sveltekit/basics/project-structure/',
            },
            {
              title: '特殊ファイルシステム',
              to: '/sveltekit/basics/file-system/',
            },
            { title: '$appモジュール', to: '/sveltekit/basics/app-modules/' },
            {
              title: 'レンダリング戦略（基礎）',
              to: '/sveltekit/basics/rendering-strategies/',
            },
            { title: 'app.d.tsの役割', to: '/sveltekit/basics/global-types/' },
          ],
        },
        {
          title: 'ルーティング',
          to: '/sveltekit/routing/',
          collapsible: true,
          items: [
            { title: 'ルーティング概要', to: '/sveltekit/routing/' },
            { title: '基本ルーティング', to: '/sveltekit/routing/basic/' },
            { title: '動的ルーティング', to: '/sveltekit/routing/dynamic/' },
            { title: '高度なルーティング', to: '/sveltekit/routing/advanced/' },
          ],
        },
        {
          title: 'データ取得',
          to: '/sveltekit/data-loading/',
          collapsible: true,
          items: [
            {
              title: 'Load関数とデータフェッチング',
              to: '/sveltekit/data-loading/',
            },
            { title: 'Load関数の基礎', to: '/sveltekit/data-loading/basic/' },
            {
              title: 'TypeScript型の自動生成システム',
              to: '/sveltekit/data-loading/typescript-types/',
            },
            {
              title: 'データフローの詳細',
              to: '/sveltekit/data-loading/flow/',
            },
            {
              title: 'SPAモードとデータ無効化',
              to: '/sveltekit/data-loading/spa-invalidation/',
            },
            {
              title: 'ストリーミングSSR',
              to: '/sveltekit/data-loading/streaming/',
            },
            {
              title: 'データフェッチング戦略',
              to: '/sveltekit/data-loading/strategies/',
            },
          ],
        },
        {
          title: 'アーキテクチャ詳解',
          to: '/sveltekit/architecture/',
          collapsible: true,
          collapsed: true,
          items: [
            { title: 'アーキテクチャ概要', to: '/sveltekit/architecture/' },
            {
              title: 'レンダリング戦略（詳解）',
              to: '/sveltekit/architecture/rendering-strategies/',
            },
            {
              title: 'レンダリングパイプライン',
              to: '/sveltekit/architecture/rendering-pipeline/',
            },
            {
              title: 'アクセスログと分析戦略',
              to: '/sveltekit/architecture/access-logs/',
            },
            {
              title: 'データロードアーキテクチャ',
              to: '/sveltekit/architecture/data-loading/',
            },
            {
              title: 'ファイル構成と実行環境',
              to: '/sveltekit/architecture/file-structure/',
            },
            {
              title: 'ルーティング内部動作',
              to: '/sveltekit/architecture/routing-internals/',
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
              title: 'サーバーサイド処理',
              to: '/sveltekit/server/server-side/',
            },
            { title: 'フォーム処理とActions', to: '/sveltekit/server/forms/' },
            {
              title: 'APIルート設計',
              to: '/sveltekit/server/api-routes/',
            },
            { title: 'Hooks', to: '/sveltekit/server/hooks/' },
            { title: 'WebSocket/SSE', to: '/sveltekit/server/websocket-sse/' },
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
              to: '/sveltekit/application/authentication/',
            },
            {
              title: 'セッション管理と認証戦略',
              to: '/sveltekit/application/session/',
            },
            {
              title: '認証ベストプラクティス',
              to: '/sveltekit/application/auth-best-practices/',
            },
            {
              title: 'データベース統合 (準備中)',
              to: '/sveltekit/application/database/',
            },
            {
              title: '環境変数管理 (準備中)',
              to: '/sveltekit/application/environment/',
            },
            {
              title: 'エラーハンドリング (準備中)',
              to: '/sveltekit/application/error-handling/',
            },
            { title: 'テスト戦略', to: '/sveltekit/application/testing/' },
            {
              title: '状態管理パターン',
              to: '/sveltekit/application/state-management/',
            },
          ],
        },
        // {
        //   title: 'エンタープライズ開発',
        //   to: '/sveltekit/enterprise/',
        //   collapsible: true,
        //   collapsed: true,
        //   items: [
        //     {
        //       title: 'エンタープライズ開発概要',
        //       to: '/sveltekit/enterprise/',
        //     },
        //     {
        //       title: 'レイヤードアーキテクチャ',
        //       to: '/sveltekit/enterprise/layered-architecture/',
        //     },
        //     {
        //       title: 'ドメイン駆動設計（DDD）',
        //       to: '/sveltekit/enterprise/domain-driven-design/',
        //     },
        //     {
        //       title: 'リポジトリパターン',
        //       to: '/sveltekit/enterprise/repository-pattern/',
        //     },
        //     {
        //       title: '依存性注入（DI）',
        //       to: '/sveltekit/enterprise/dependency-injection/',
        //     },
        //     {
        //       title: 'ユニットテスト戦略',
        //       to: '/sveltekit/enterprise/testing-strategies/',
        //     },
        //     {
        //       title: 'Clean Architecture実装',
        //       to: '/sveltekit/enterprise/clean-architecture/',
        //     },
        //   ],
        // },
        {
          title: '最適化編',
          to: '/sveltekit/optimization/',
          collapsible: true,
          collapsed: true,
          items: [
            { title: '最適化編概要', to: '/sveltekit/optimization/' },
            {
              title: 'パフォーマンス最適化 (準備中)',
              to: '/sveltekit/optimization/performance/',
            },
            {
              title: 'ビルド最適化',
              to: '/sveltekit/optimization/build-optimization/',
            },
            {
              title: 'キャッシュ戦略',
              to: '/sveltekit/optimization/caching/',
            },
            { title: 'SEO最適化 (準備中)', to: '/sveltekit/optimization/seo/' },
          ],
        },
        {
          title: 'デプロイ・運用編',
          to: '/sveltekit/deployment/',
          collapsible: true,
          collapsed: true,
          items: [
            { title: 'デプロイ・運用編概要', to: '/sveltekit/deployment/' },
            {
              title: 'プラットフォーム別デプロイ',
              to: '/sveltekit/deployment/platforms/',
            },
            {
              title: '実行環境とランタイム',
              to: '/sveltekit/deployment/execution-environments/',
            },
            {
              title: 'セキュリティ (準備中)',
              to: '/sveltekit/deployment/security/',
            },
            {
              title: 'モニタリング (準備中)',
              to: '/sveltekit/deployment/monitoring/',
            },
          ],
        },
      ],
    },
    {
      title: '実装例',
      to: '/examples/',
      collapsible: true,
      items: [
        { title: '実装例一覧', to: '/examples/' },
        { title: 'ブログシステム（基礎）', to: '/examples/blog-system/' },
        { title: 'Markdownブログ（発展）', to: '/examples/markdown-blog/' },
        { title: 'TODOアプリ', to: '/examples/todo-app/' },
        { title: '認証システム概要', to: '/examples/auth-system/' },
        { title: 'Cookie/Session認証', to: '/examples/auth-cookie-session/' },
        { title: 'JWT認証', to: '/examples/auth-jwt/' },
        {
          title: 'ルートグループ認証（計画中）',
          to: '/examples/auth-route-groups/',
        },
        { title: 'データフェッチング', to: '/examples/data-fetching/' },
        { title: 'WebSocket実装', to: '/examples/websocket/' },
      ],
    },
    {
      title: 'リファレンス',
      to: '/reference/',
      collapsible: true,
      collapsed: false,
      items: [
        { title: '概要', to: '/reference/' },
        { title: 'Svelte 5 完全リファレンス', to: '/reference/svelte5/' },
        {
          title: 'SvelteKit 2.x 完全リファレンス',
          to: '/reference/sveltekit2/',
        },
      ],
    },
    {
      title: 'ディープダイブ',
      to: '/deep-dive/',
      collapsible: true,
      collapsed: true,
      items: [
        { title: '概要', to: '/deep-dive/' },
        {
          title: 'コンパイル時最適化',
          to: '/deep-dive/compile-time-optimization/',
        },
        {
          title: 'リアクティブ状態とバインディング',
          to: '/deep-dive/reactive-state-variables-vs-bindings/',
        },
        {
          title: '派生値の完全比較',
          to: '/deep-dive/derived-vs-effect-vs-derived-by/',
        },
        {
          title: 'HTMLテンプレートとSnippets',
          to: '/deep-dive/html-templates-and-snippets/',
        },
        {
          title: '素のJS構文でリアクティビティ',
          to: '/deep-dive/reactivity-with-plain-javascript-syntax/',
        },
        {
          title: 'SvelteKitが自動生成する型',
          to: '/deep-dive/auto-generated-types/',
        },
        {
          title: 'Web Components、Svelte、CSS戦略の実践ガイド',
          to: '/deep-dive/webcomponents-svelte-css-strategies/',
        },
        {
          title: 'SvelteKitプレースホルダー',
          to: '/deep-dive/sveltekit-placeholders/',
        },
      ],
    },
  ],
};
