---
title: SPA/MPA混在アーキテクチャ - SvelteKitでハイブリッドアプリを構築
description: SvelteKitでSPAとMPAを混在させるハイブリッドアーキテクチャの実装方法。ページごとのレンダリング戦略、CSR/SSR切り替え、パフォーマンス最適化をTypeScript実践コードで解説
---

SvelteKitの強力な特徴の一つは、同じアプリケーション内でSPA（Single Page Application）とMPA（Multi Page Application）を柔軟に混在させられることです。このページでは、ページごとに最適なレンダリング戦略を選択するハイブリッドアーキテクチャの実装方法を解説します。

## この記事で学べること

- SPA・MPA・ハイブリッドの違いと選択基準
- ページごとにレンダリング戦略を切り替える方法
- `export const ssr = false` でCSR専用ページを作る
- 認証ページはSSR、ダッシュボードはSPAというパターン
- SEOが必要なページとインタラクティブなページの共存

## なぜSPA/MPA混在が必要か？

従来のフレームワークでは「完全SPA」か「完全SSR」かの二択を迫られることが多くありました。しかし、実際のアプリケーションではページの特性によって最適なレンダリング戦略が異なります。

### ページ種別ごとの推奨戦略

| ページ種別 | 推奨戦略 | 理由 |
|-----------|---------|------|
| ランディングページ | SSR/SSG | SEO、初期表示速度、OGP対応 |
| ブログ記事 | SSG | SEO、キャッシュ効率、CDN配信 |
| ログインページ | SSR | セキュリティ、フォーム処理 |
| ダッシュボード | CSR (SPA) | インタラクティブ性、リアルタイム更新 |
| 管理画面 | CSR (SPA) | 認証後のみ、SEO不要 |
| ECカート | CSR (SPA) | 状態管理、UX重視 |

### SvelteKitが提供する柔軟性

```typescript
// ページごとにレンダリング戦略を宣言的に指定
export const ssr = true;      // サーバーサイドレンダリング
export const csr = true;      // クライアントサイドレンダリング
export const prerender = true; // ビルド時に静的生成
```

## 実装パターン

### パターン1: ページ単位でSSRを無効化

最もシンプルなパターンは、特定のページでSSRを無効化することです。

```typescript
// src/routes/dashboard/+page.ts
export const ssr = false; // このページはクライアントのみでレンダリング
export const csr = true;  // CSRを有効化（デフォルトでtrue）

import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
  // この処理はクライアントサイドでのみ実行される
  const response = await fetch('/api/dashboard');
  const dashboard = await response.json();

  return { dashboard };
};
```

```svelte
<!-- src/routes/dashboard/+page.svelte -->
<script lang="ts">
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  // クライアントサイドでのみ利用可能なAPI
  let windowWidth = $state(0);

  $effect(() => {
    windowWidth = window.innerWidth;

    const handleResize = () => {
      windowWidth = window.innerWidth;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  });
</script>

<h1>ダッシュボード</h1>
<p>画面幅: {windowWidth}px</p>
```

### パターン2: レイアウト単位でSSRを制御

ルートグループを使って、セクション全体のレンダリング戦略を一括設定できます。

```
src/routes/
├── (marketing)/          # SSG/SSR - SEO重視
│   ├── +layout.ts        # ssr = true, prerender = true
│   ├── +page.svelte      # ランディングページ
│   ├── about/
│   │   └── +page.svelte
│   └── blog/
│       └── [slug]/
│           └── +page.svelte
├── (auth)/               # SSR - セキュリティ重視
│   ├── +layout.ts        # ssr = true
│   ├── login/
│   │   └── +page.svelte
│   └── register/
│       └── +page.svelte
└── (app)/                # CSR (SPA) - インタラクティブ性重視
    ├── +layout.ts        # ssr = false
    ├── +layout.svelte    # SPAのシェル
    ├── dashboard/
    │   └── +page.svelte
    ├── settings/
    │   └── +page.svelte
    └── projects/
        └── [id]/
            └── +page.svelte
```

#### (marketing) グループの設定

```typescript
// src/routes/(marketing)/+layout.ts
export const prerender = true; // ビルド時に静的生成
export const ssr = true;
```

#### (auth) グループの設定

```typescript
// src/routes/(auth)/+layout.ts
export const ssr = true;
// prerenderはfalse（動的なフォーム処理があるため）
```

#### (app) グループの設定

```typescript
// src/routes/(app)/+layout.ts
export const ssr = false; // 完全なCSR
export const csr = true;
```

```svelte
<!-- src/routes/(app)/+layout.svelte -->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { page } from '$app/stores';
  import AppSidebar from '$lib/components/AppSidebar.svelte';
  import AppHeader from '$lib/components/AppHeader.svelte';

  let { children }: { children?: Snippet } = $props();
</script>

<div class="app-shell">
  <AppHeader />
  <div class="app-content">
    <AppSidebar currentPath={$page.url.pathname} />
    <main>
      {@render children?.()}
    </main>
  </div>
</div>

<style>
  .app-shell {
    display: flex;
    flex-direction: column;
    height: 100vh;
  }

  .app-content {
    display: flex;
    flex: 1;
    overflow: hidden;
  }

  main {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
  }
</style>
```

### パターン3: 条件付きレンダリング（認証状態による分岐）

認証状態に応じてサーバーサイドで処理を分岐させるパターンです。

```typescript
// src/routes/+layout.server.ts
import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: LayoutServerLoad = async ({ cookies, url }) => {
  const sessionId = cookies.get('session');
  const isAuthenticated = !!sessionId;

  // 認証が必要なパスの定義
  const protectedPaths = ['/dashboard', '/settings', '/projects'];
  const isProtectedPath = protectedPaths.some(path =>
    url.pathname.startsWith(path)
  );

  // 認証が必要なページに未認証でアクセスした場合
  if (isProtectedPath && !isAuthenticated) {
    throw redirect(302, `/login?redirect=${encodeURIComponent(url.pathname)}`);
  }

  // 認証済みでログインページにアクセスした場合
  if (url.pathname === '/login' && isAuthenticated) {
    throw redirect(302, '/dashboard');
  }

  return {
    isAuthenticated,
    // ユーザー情報は必要に応じて取得
  };
};
```

### パターン4: ハイブリッドナビゲーション

SPAセクションとMPAセクション間のナビゲーションを最適化します。

```svelte
<!-- src/lib/components/Navigation.svelte -->
<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';

  interface NavItem {
    href: string;
    label: string;
    section: 'marketing' | 'app';
  }

  const navItems: NavItem[] = [
    { href: '/', label: 'ホーム', section: 'marketing' },
    { href: '/about', label: '会社概要', section: 'marketing' },
    { href: '/dashboard', label: 'ダッシュボード', section: 'app' },
    { href: '/settings', label: '設定', section: 'app' },
  ];

  // 現在のセクションを判定
  let currentSection = $derived(
    $page.url.pathname.startsWith('/dashboard') ||
    $page.url.pathname.startsWith('/settings')
      ? 'app'
      : 'marketing'
  );

  function handleNavigation(item: NavItem) {
    // 同じセクション内ならSPA遷移
    // 異なるセクションならフルページロード
    if (item.section === currentSection) {
      goto(item.href);
    } else {
      // フルページロードでセクション切り替え
      window.location.href = item.href;
    }
  }
</script>

<nav>
  {#each navItems as item}
    <button
      class:active={$page.url.pathname === item.href}
      onclick={() => handleNavigation(item)}
    >
      {item.label}
    </button>
  {/each}
</nav>
```

## 実践例：ECサイトのハイブリッド構成

実際のECサイトを例に、最適なハイブリッド構成を見てみましょう。

```
src/routes/
├── (public)/                    # SSG - SEO最重要
│   ├── +layout.ts              # prerender = true
│   ├── +page.svelte            # トップページ
│   ├── products/
│   │   ├── +page.svelte        # 商品一覧
│   │   └── [slug]/
│   │       └── +page.svelte    # 商品詳細（ISR可能）
│   └── categories/
│       └── [category]/
│           └── +page.svelte
│
├── (checkout)/                  # CSR - カート・決済
│   ├── +layout.ts              # ssr = false
│   ├── cart/
│   │   └── +page.svelte        # カート（状態管理重視）
│   ├── checkout/
│   │   └── +page.svelte        # 決済フロー
│   └── order-complete/
│       └── +page.svelte
│
├── (account)/                   # SSR + CSR混在
│   ├── +layout.server.ts       # 認証チェック
│   ├── profile/
│   │   └── +page.svelte        # プロフィール
│   ├── orders/
│   │   └── +page.svelte        # 注文履歴
│   └── favorites/
│       └── +page.svelte        # お気に入り
│
└── api/                         # APIエンドポイント
    ├── cart/
    │   └── +server.ts
    └── products/
        └── +server.ts
```

### カートの状態管理（CSR専用）

```typescript
// src/lib/stores/cart.svelte.ts
interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

function createCartStore() {
  let items = $state<CartItem[]>([]);
  let loading = $state(false);

  // ローカルストレージから復元
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('cart');
    if (saved) {
      items = JSON.parse(saved);
    }
  }

  // 変更時に自動保存
  $effect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart', JSON.stringify(items));
    }
  });

  return {
    get items() { return items; },
    get loading() { return loading; },
    get total() {
      return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    },
    get itemCount() {
      return items.reduce((sum, item) => sum + item.quantity, 0);
    },

    addItem(product: Omit<CartItem, 'quantity'>) {
      const existing = items.find(item => item.productId === product.productId);
      if (existing) {
        existing.quantity++;
      } else {
        items.push({ ...product, quantity: 1 });
      }
    },

    removeItem(productId: string) {
      const index = items.findIndex(item => item.productId === productId);
      if (index !== -1) {
        items.splice(index, 1);
      }
    },

    updateQuantity(productId: string, quantity: number) {
      const item = items.find(item => item.productId === productId);
      if (item) {
        if (quantity <= 0) {
          this.removeItem(productId);
        } else {
          item.quantity = quantity;
        }
      }
    },

    clear() {
      items = [];
    }
  };
}

export const cart = createCartStore();
```

## パフォーマンス最適化

### プリロード戦略

```svelte
<!-- SSRページからSPAセクションへの遷移を高速化 -->
<a
  href="/dashboard"
  data-sveltekit-preload-data="hover"
>
  ダッシュボードへ
</a>

<!-- SPAセクション内では即時プリロード -->
<a
  href="/dashboard/analytics"
  data-sveltekit-preload-data="tap"
>
  分析
</a>
```

### コード分割

```typescript
// src/routes/(app)/+layout.ts
export const ssr = false;

// 重いコンポーネントは動的インポート
export const load = async () => {
  // SPAセクションに入った時点でチャートライブラリをプリロード
  const chartModule = import('$lib/components/charts');

  return {
    // 必要に応じてPromiseを渡す
  };
};
```

## ベストプラクティス

### 1. セクション境界を明確に

```typescript
// src/lib/config/sections.ts
export const sections = {
  marketing: ['/', '/about', '/blog', '/pricing'],
  auth: ['/login', '/register', '/forgot-password'],
  app: ['/dashboard', '/settings', '/projects'],
} as const;

export function getSection(pathname: string): keyof typeof sections {
  for (const [section, paths] of Object.entries(sections)) {
    if (paths.some(path => pathname.startsWith(path))) {
      return section as keyof typeof sections;
    }
  }
  return 'marketing';
}
```

### 2. 共有状態の管理

```typescript
// src/lib/stores/app.svelte.ts
// グローバル状態はCSRセクションでのみ使用
function createAppStore() {
  let user = $state<User | null>(null);
  let theme = $state<'light' | 'dark'>('light');

  return {
    get user() { return user; },
    get theme() { return theme; },
    setUser(newUser: User | null) { user = newUser; },
    toggleTheme() { theme = theme === 'light' ? 'dark' : 'light'; }
  };
}

export const app = createAppStore();
```

### 3. SEOとUXのバランス

| 要件 | 解決策 |
|------|--------|
| SEOが必要 | SSR/SSG を使用 |
| OGP対応が必要 | SSR でメタタグを動的生成 |
| 初期表示速度 | SSG + CDN キャッシュ |
| インタラクティブ性 | CSR（SPA）を使用 |
| リアルタイム更新 | CSR + WebSocket/SSE |
| フォーム処理 | SSR + Progressive Enhancement |

## よくある質問（FAQ）

### Q: SPAセクションでも初期データは取得できる？

はい、`+page.ts` の load 関数はクライアントサイドで実行されます。

```typescript
// src/routes/(app)/dashboard/+page.ts
export const ssr = false;

export const load: PageLoad = async ({ fetch }) => {
  // クライアントサイドでAPIを呼び出し
  const res = await fetch('/api/dashboard');
  return { data: await res.json() };
};
```

### Q: SSRとCSRを動的に切り替えられる？

いいえ、`ssr` / `csr` / `prerender` は静的な値である必要があります。
動的な切り替えが必要な場合は、ルートグループを分けてください。

### Q: SPAセクションでブラウザバックは動作する？

はい、SvelteKitのクライアントサイドルーターがブラウザ履歴を適切に管理します。

## 関連ドキュメント

- [レンダリング戦略（基礎）](/sveltekit/basics/rendering-strategies/) - SSR/SSG/CSRの基本
- [レンダリング戦略（詳解）](/sveltekit/architecture/rendering-strategies/) - 詳細な動作原理
- [SPAモードとデータ無効化](/sveltekit/data-loading/spa-invalidation/) - CSRでのデータ更新
- [ルートグループ](/sveltekit/routing/advanced/) - (group)記法の詳細

## 次のステップ

ハイブリッドアーキテクチャを理解したら、次はデータフローの最適化を学びましょう。
[データロードアーキテクチャ](/sveltekit/architecture/data-loading/)では、サーバーとクライアント間のデータの流れを詳しく解説します。
