// vite.config.tsのサイドバー構造から自動的にナビゲーション構造を生成するユーティリティ

export interface NavItem {
  title: string;
  href: string;
}

export interface SidebarItem {
  title: string;
  to: string;
  items?: SidebarItem[];
  collapsible?: boolean;
  collapsed?: boolean;
}

// サイドバー構造をフラットなリストに変換
function flattenSidebar(items: SidebarItem[], result: NavItem[] = []): NavItem[] {
  for (const item of items) {
    // パスを正規化（末尾にスラッシュを追加）
    const normalizedPath = item.to.endsWith('/') ? item.to : item.to + '/';
    result.push({
      title: item.title,
      href: normalizedPath
    });
    
    if (item.items) {
      flattenSidebar(item.items, result);
    }
  }
  return result;
}

// 現在のパスから前後のページを取得
export function getNavigationFromSidebar(
  currentPath: string,
  sidebarConfig: { [key: string]: SidebarItem[] }
): { prev?: NavItem; next?: NavItem } {
  // すべてのサイドバーアイテムをフラットなリストに変換
  const allPages: NavItem[] = [];
  
  // すべてのセクションのアイテムを統合
  for (const section in sidebarConfig) {
    flattenSidebar(sidebarConfig[section], allPages);
  }
  
  // パスを正規化（末尾にスラッシュを追加）
  const normalizedCurrentPath = currentPath.endsWith('/') ? currentPath : currentPath + '/';
  
  // 現在のページのインデックスを見つける
  const currentIndex = allPages.findIndex(page => page.href === normalizedCurrentPath);
  
  if (currentIndex === -1) {
    return {}; // ページが見つからない場合
  }
  
  // 前後のページを取得
  const prev = currentIndex > 0 ? allPages[currentIndex - 1] : undefined;
  const next = currentIndex < allPages.length - 1 ? allPages[currentIndex + 1] : undefined;
  
  return { prev, next };
}

// vite.config.tsで定義されているサイドバー構造をエクスポート
// 実際の実装では、vite.config.tsから直接インポートするか、
// ビルド時に生成されるメタデータから取得する
export const sidebarConfig: { [key: string]: SidebarItem[] } = {
  '/': [
    {
      title: 'はじめに',
      to: '/introduction/',
      items: [
        { title: 'Svelte 5の概要', to: '/introduction/' },
        { title: 'なぜSvelteか', to: '/introduction/why-svelte/' },
        { title: 'なぜTypeScriptが必要か', to: '/introduction/why-typescript/' },
        { title: '環境構築', to: '/introduction/setup/' },
        { title: 'Hello World', to: '/introduction/hello-world/' },
        { title: 'TypeScript設定', to: '/introduction/typescript-setup/' },
      ],
    },
    {
      title: 'Svelte',
      to: '/svelte/',
      items: [
        { title: 'Svelte概要', to: '/svelte/' },
        {
          title: '基本',
          to: '/svelte/basics/',
          items: [
            { title: 'Svelteの基本概要', to: '/svelte/basics/' },
            { title: 'Hello World', to: '/svelte/basics/hello-world/' },
            { title: 'コンポーネントの基本', to: '/svelte/basics/component-basics/' },
            { title: 'テンプレート構文', to: '/svelte/basics/template-syntax/' },
            { title: 'コンポーネントライフサイクル', to: '/svelte/basics/component-lifecycle/' },
            { title: 'トランジション・アニメーション', to: '/svelte/basics/transitions/' },
            { title: 'use:アクション', to: '/svelte/basics/actions/' },
            { title: 'TypeScript統合', to: '/svelte/basics/typescript-integration/' },
          ],
        },
        {
          title: 'Runesシステム',
          to: '/svelte/runes/',
          items: [
            { title: 'Runesシステム概要', to: '/svelte/runes/' },
            { title: 'Runesシステム入門', to: '/svelte/runes/runes-introduction/' },
            { title: '$state - リアクティブな状態', to: '/svelte/runes/state/' },
            { title: '$derived - 派生値', to: '/svelte/runes/derived/' },
            { title: '$effect - 副作用', to: '/svelte/runes/effect/' },
            { title: '$props - プロパティ', to: '/svelte/runes/props/' },
            { title: '$bindable - 双方向バインディング', to: '/svelte/runes/bindable/' },
            { title: '$host - カスタムエレメント', to: '/svelte/runes/host/' },
            { title: '$inspect - デバッグ', to: '/svelte/runes/inspect/' },
            { title: '他フレームワークとの比較', to: '/svelte/runes/comparison/' },
          ],
        },
        {
          title: '実践編',
          to: '/svelte/advanced/',
          items: [
            { title: '実践概要', to: '/svelte/advanced/' },
            { title: 'リアクティブストア', to: '/svelte/advanced/reactive-stores/' },
            { title: 'クラスとリアクティビティ', to: '/svelte/advanced/class-reactivity/' },
            { title: '組み込みリアクティブクラス', to: '/svelte/advanced/built-in-classes/' },
            { title: 'Snippets機能', to: '/svelte/advanced/snippets/' },
            { title: 'スクリプトコンテキスト', to: '/svelte/advanced/script-context/' },
            { title: 'コンポーネントパターン', to: '/svelte/advanced/component-patterns/' },
            { title: 'TypeScriptパターン', to: '/svelte/advanced/typescript-patterns/' },
          ],
        },
      ],
    },
    {
      title: 'SvelteKit',
      to: '/sveltekit/',
      items: [
        { title: 'SvelteKit概要', to: '/sveltekit/' },
        {
          title: '基礎編',
          to: '/sveltekit/basics/',
          items: [
            { title: '基礎編概要', to: '/sveltekit/basics/' },
            { title: 'SvelteKit概要', to: '/sveltekit/basics/overview/' },
            { title: 'プロジェクト構造', to: '/sveltekit/basics/project-structure/' },
            { title: 'ルーティング詳解', to: '/sveltekit/basics/routing/' },
            { title: 'Load関数とデータフェッチング', to: '/sveltekit/basics/load-functions/' },
          ],
        },
        {
          title: 'アーキテクチャ詳解',
          to: '/sveltekit/architecture/',
          items: [
            { title: 'アーキテクチャ概要', to: '/sveltekit/architecture/' },
            { title: '実行環境別アーキテクチャ', to: '/sveltekit/architecture/execution-environments/' },
          ],
        },
        {
          title: 'サーバーサイド編',
          to: '/sveltekit/server/',
          items: [
            { title: 'サーバーサイド編概要', to: '/sveltekit/server/' },
            { title: 'フォーム処理とActions', to: '/sveltekit/server/forms/' },
          ],
        },
        {
          title: 'デプロイ・運用編',
          to: '/sveltekit/deployment/',
          items: [
            { title: 'デプロイ・運用編概要', to: '/sveltekit/deployment/' },
            { title: 'プラットフォーム別デプロイ', to: '/sveltekit/deployment/platforms/' },
          ],
        },
      ],
    },
    {
      title: '実装例',
      to: '/examples/',
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
      to: '/deep-dive/',
      items: [
        { title: '概要', to: '/deep-dive/' },
        { title: 'コンパイル時最適化', to: '/deep-dive/compile-time-optimization/' },
        { title: 'リアクティブ状態とバインディング', to: '/deep-dive/reactive-state-variables-vs-bindings/' },
        { title: '派生値の完全比較', to: '/deep-dive/derived-vs-effect-vs-derived-by/' },
        { title: 'HTMLテンプレートとSnippets', to: '/deep-dive/html-templates-and-snippets/' },
        { title: '素のJS構文でリアクティビティ', to: '/deep-dive/reactivity-with-plain-javascript-syntax/' },
        { title: 'レンダリング戦略', to: '/deep-dive/rendering-strategies/' },
        { title: 'SvelteKitが自動生成する型', to: '/deep-dive/auto-generated-types/' },
      ],
    },
  ],
};