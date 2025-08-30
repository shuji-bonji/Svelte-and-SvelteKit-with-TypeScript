// ナビゲーション構造の定義
export interface NavItem {
  title: string;
  href: string;
}

export interface NavigationStructure {
  [key: string]: {
    prev?: NavItem;
    next?: NavItem;
  };
}

// 全ページのナビゲーション構造を定義
export const navigationStructure: NavigationStructure = {
  // Svelteトップページ
  '/svelte/': {
    next: { title: 'Svelteの基本', href: '/svelte/basics/' }
  },
  
  // Svelte基本編
  '/svelte/basics/': {
    prev: { title: 'Svelte完全ガイド', href: '/svelte/' },
    next: { title: 'Hello World', href: '/svelte/basics/hello-world/' }
  },
  '/svelte/basics/hello-world/': {
    prev: { title: 'Svelteの基本', href: '/svelte/basics/' },
    next: { title: 'コンポーネントの基本', href: '/svelte/basics/component-basics/' }
  },
  '/svelte/basics/component-basics/': {
    prev: { title: 'Hello World', href: '/svelte/basics/hello-world/' },
    next: { title: 'テンプレート構文', href: '/svelte/basics/template-syntax/' }
  },
  '/svelte/basics/template-syntax/': {
    prev: { title: 'コンポーネントの基本', href: '/svelte/basics/component-basics/' },
    next: { title: 'コンポーネントライフサイクル', href: '/svelte/basics/component-lifecycle/' }
  },
  '/svelte/basics/component-lifecycle/': {
    prev: { title: 'テンプレート構文', href: '/svelte/basics/template-syntax/' },
    next: { title: 'トランジション・アニメーション', href: '/svelte/basics/transitions/' }
  },
  '/svelte/basics/transitions/': {
    prev: { title: 'コンポーネントライフサイクル', href: '/svelte/basics/component-lifecycle/' },
    next: { title: 'use:アクション', href: '/svelte/basics/actions/' }
  },
  '/svelte/basics/actions/': {
    prev: { title: 'トランジション・アニメーション', href: '/svelte/basics/transitions/' },
    next: { title: 'TypeScript統合', href: '/svelte/basics/typescript-integration/' }
  },
  '/svelte/basics/typescript-integration/': {
    prev: { title: 'use:アクション', href: '/svelte/basics/actions/' },
    next: { title: 'Runesシステム', href: '/svelte/runes/' }
  },

  // Svelte Runesシステム
  '/svelte/runes/': {
    prev: { title: 'TypeScript統合', href: '/svelte/basics/typescript-integration/' },
    next: { title: 'Runesシステム入門', href: '/svelte/runes/runes-introduction/' }
  },
  '/svelte/runes/runes-introduction/': {
    prev: { title: 'Runesシステム', href: '/svelte/runes/' },
    next: { title: '$state - リアクティブな状態', href: '/svelte/runes/state/' }
  },
  '/svelte/runes/state/': {
    prev: { title: 'Runesシステム入門', href: '/svelte/runes/runes-introduction/' },
    next: { title: '$derived - 派生値', href: '/svelte/runes/derived/' }
  },
  '/svelte/runes/derived/': {
    prev: { title: '$state - リアクティブな状態', href: '/svelte/runes/state/' },
    next: { title: '$effect - 副作用', href: '/svelte/runes/effect/' }
  },
  '/svelte/runes/effect/': {
    prev: { title: '$derived - 派生値', href: '/svelte/runes/derived/' },
    next: { title: '$props - プロパティ', href: '/svelte/runes/props/' }
  },
  '/svelte/runes/props/': {
    prev: { title: '$effect - 副作用', href: '/svelte/runes/effect/' },
    next: { title: '$bindable - 双方向バインディング', href: '/svelte/runes/bindable/' }
  },
  '/svelte/runes/bindable/': {
    prev: { title: '$props - プロパティ', href: '/svelte/runes/props/' },
    next: { title: '$host - カスタムエレメント', href: '/svelte/runes/host/' }
  },
  '/svelte/runes/host/': {
    prev: { title: '$bindable - 双方向バインディング', href: '/svelte/runes/bindable/' },
    next: { title: '$inspect - デバッグ', href: '/svelte/runes/inspect/' }
  },
  '/svelte/runes/inspect/': {
    prev: { title: '$host - カスタムエレメント', href: '/svelte/runes/host/' },
    next: { title: '他フレームワークとの比較', href: '/svelte/runes/comparison/' }
  },
  '/svelte/runes/comparison/': {
    prev: { title: '$inspect - デバッグ', href: '/svelte/runes/inspect/' },
    next: { title: '実践概要', href: '/svelte/advanced/' }
  },

  // Svelte実践編
  '/svelte/advanced/': {
    prev: { title: '他フレームワークとの比較', href: '/svelte/runes/comparison/' },
    next: { title: 'リアクティブストア', href: '/svelte/advanced/reactive-stores/' }
  },
  '/svelte/advanced/reactive-stores/': {
    prev: { title: '実践概要', href: '/svelte/advanced/' },
    next: { title: 'クラスとリアクティビティ', href: '/svelte/advanced/class-reactivity/' }
  },
  '/svelte/advanced/class-reactivity/': {
    prev: { title: 'リアクティブストア', href: '/svelte/advanced/reactive-stores/' },
    next: { title: '組み込みリアクティブクラス', href: '/svelte/advanced/built-in-classes/' }
  },
  '/svelte/advanced/built-in-classes/': {
    prev: { title: 'クラスとリアクティビティ', href: '/svelte/advanced/class-reactivity/' },
    next: { title: 'Snippets機能', href: '/svelte/advanced/snippets/' }
  },
  '/svelte/advanced/snippets/': {
    prev: { title: '組み込みリアクティブクラス', href: '/svelte/advanced/built-in-classes/' },
    next: { title: 'スクリプトコンテキスト', href: '/svelte/advanced/script-context/' }
  },
  '/svelte/advanced/script-context/': {
    prev: { title: 'Snippets機能', href: '/svelte/advanced/snippets/' },
    next: { title: 'コンポーネントパターン', href: '/svelte/advanced/component-patterns/' }
  },
  '/svelte/advanced/component-patterns/': {
    prev: { title: 'スクリプトコンテキスト', href: '/svelte/advanced/script-context/' },
    next: { title: 'TypeScriptパターン', href: '/svelte/advanced/typescript-patterns/' }
  },
  '/svelte/advanced/typescript-patterns/': {
    prev: { title: 'コンポーネントパターン', href: '/svelte/advanced/component-patterns/' },
    next: { title: 'SvelteKit完全ガイド', href: '/sveltekit/' }
  },

  // SvelteKitトップページ
  '/sveltekit/': {
    prev: { title: 'TypeScriptパターン', href: '/svelte/advanced/typescript-patterns/' },
    next: { title: 'SvelteKit基礎編', href: '/sveltekit/basics/' }
  },

  // SvelteKit基礎編
  '/sveltekit/basics/': {
    prev: { title: 'SvelteKit完全ガイド', href: '/sveltekit/' },
    next: { title: 'SvelteKit概要', href: '/sveltekit/basics/overview/' }
  },
  '/sveltekit/basics/overview/': {
    prev: { title: '基礎編概要', href: '/sveltekit/basics/' },
    next: { title: 'プロジェクト構造と規約', href: '/sveltekit/basics/project-structure/' }
  },
  '/sveltekit/basics/project-structure/': {
    prev: { title: 'SvelteKit概要', href: '/sveltekit/basics/overview/' },
    next: { title: 'ルーティング完全ガイド', href: '/sveltekit/basics/routing/' }
  },
  '/sveltekit/basics/routing/': {
    prev: { title: 'プロジェクト構造と規約', href: '/sveltekit/basics/project-structure/' },
    next: { title: 'Load関数とデータフェッチング', href: '/sveltekit/basics/load-functions/' }
  },
  '/sveltekit/basics/load-functions/': {
    prev: { title: 'ルーティング完全ガイド', href: '/sveltekit/basics/routing/' },
    next: { title: 'アーキテクチャ概要', href: '/sveltekit/architecture/' }
  },

  // SvelteKitアーキテクチャ詳解
  '/sveltekit/architecture/': {
    prev: { title: 'Load関数とデータフェッチング', href: '/sveltekit/basics/load-functions/' },
    next: { title: '実行環境別アーキテクチャ', href: '/sveltekit/architecture/execution-environments/' }
  },
  '/sveltekit/architecture/execution-environments/': {
    prev: { title: 'アーキテクチャ詳解', href: '/sveltekit/architecture/' },
    next: { title: 'サーバーサイド編', href: '/sveltekit/server/' }
  },

  // SvelteKitサーバーサイド編
  '/sveltekit/server/': {
    prev: { title: '実行環境別アーキテクチャ', href: '/sveltekit/architecture/execution-environments/' },
    next: { title: 'フォーム処理とActions', href: '/sveltekit/server/forms/' }
  },
  '/sveltekit/server/forms/': {
    prev: { title: 'サーバーサイド編概要', href: '/sveltekit/server/' },
    next: { title: 'サーバーサイド処理', href: '/sveltekit/server/server-side/' }
  },

  // SvelteKitデプロイ編
  '/sveltekit/deployment/platforms/': {
    prev: { title: 'デプロイ・運用編概要', href: '/sveltekit/deployment/' },
    next: { title: 'セキュリティ', href: '/sveltekit/deployment/security/' }
  },

  // ディープダイブ（技術詳解）
  '/deep-dive/': {
    next: { title: 'コンパイル時最適化', href: '/deep-dive/compile-time-optimization/' }
  },
  '/deep-dive/compile-time-optimization/': {
    prev: { title: 'ディープダイブ - 技術詳解', href: '/deep-dive/' },
    next: { title: 'リアクティブ状態とバインディング', href: '/deep-dive/reactive-state-variables-vs-bindings/' }
  },
  '/deep-dive/reactive-state-variables-vs-bindings/': {
    prev: { title: 'コンパイル時最適化', href: '/deep-dive/compile-time-optimization/' },
    next: { title: '派生値の完全比較', href: '/deep-dive/derived-vs-effect-vs-derived-by/' }
  },
  '/deep-dive/derived-vs-effect-vs-derived-by/': {
    prev: { title: 'リアクティブ状態とバインディング', href: '/deep-dive/reactive-state-variables-vs-bindings/' },
    next: { title: 'HTMLテンプレートとSnippets', href: '/deep-dive/html-templates-and-snippets/' }
  },
  '/deep-dive/html-templates-and-snippets/': {
    prev: { title: '派生値の完全比較', href: '/deep-dive/derived-vs-effect-vs-derived-by/' },
    next: { title: '素のJS構文でリアクティビティ', href: '/deep-dive/reactivity-with-plain-javascript-syntax/' }
  },
  '/deep-dive/reactivity-with-plain-javascript-syntax/': {
    prev: { title: 'HTMLテンプレートとSnippets', href: '/deep-dive/html-templates-and-snippets/' },
    next: { title: 'レンダリング戦略', href: '/deep-dive/rendering-strategies/' }
  },
  '/deep-dive/rendering-strategies/': {
    prev: { title: '素のJS構文でリアクティビティ', href: '/deep-dive/reactivity-with-plain-javascript-syntax/' },
    next: { title: 'SvelteKitが自動生成する型', href: '/deep-dive/auto-generated-types/' }
  },
  '/deep-dive/auto-generated-types/': {
    prev: { title: 'レンダリング戦略', href: '/deep-dive/rendering-strategies/' }
  },

  // 実装例
  '/examples/': {
    next: { title: 'TODOアプリ', href: '/examples/todo-app/' }
  },
  '/examples/todo-app/': {
    prev: { title: '実装例一覧', href: '/examples/' },
    next: { title: '認証システム', href: '/examples/auth-system/' }
  },
  '/examples/auth-system/': {
    prev: { title: 'TODOアプリ', href: '/examples/todo-app/' },
    next: { title: 'データフェッチング', href: '/examples/data-fetching/' }
  },
  '/examples/data-fetching/': {
    prev: { title: '認証システム', href: '/examples/auth-system/' },
    next: { title: 'WebSocket実装', href: '/examples/websocket/' }
  },
  '/examples/websocket/': {
    prev: { title: 'データフェッチング', href: '/examples/data-fetching/' }
  },

  // Introduction
  '/introduction/': {
    next: { title: 'なぜSvelteか', href: '/introduction/why-svelte/' }
  },
  '/introduction/why-svelte/': {
    prev: { title: 'はじめに', href: '/introduction/' },
    next: { title: 'なぜTypeScriptか', href: '/introduction/why-typescript/' }
  },
  '/introduction/why-typescript/': {
    prev: { title: 'なぜSvelteか', href: '/introduction/why-svelte/' },
    next: { title: '環境構築', href: '/introduction/setup/' }
  },
  '/introduction/setup/': {
    prev: { title: 'なぜTypeScriptか', href: '/introduction/why-typescript/' },
    next: { title: 'Hello World', href: '/introduction/hello-world/' }
  },
  '/introduction/hello-world/': {
    prev: { title: '環境構築', href: '/introduction/setup/' },
    next: { title: 'TypeScript設定', href: '/introduction/typescript-setup/' }
  },
  '/introduction/typescript-setup/': {
    prev: { title: 'Hello World', href: '/introduction/hello-world/' },
    next: { title: 'Svelte 5完全ガイド', href: '/svelte/' }
  }
};

// 現在のパスからナビゲーション情報を取得
export function getNavigation(pathname: string): { prev?: NavItem; next?: NavItem } {
  // パスを正規化（末尾のスラッシュを確保）
  const normalizedPath = pathname.endsWith('/') ? pathname : pathname + '/';
  
  return navigationStructure[normalizedPath] || {};
}