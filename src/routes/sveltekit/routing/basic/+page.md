---
title: 基本ルーティング
description: SvelteKitの基本ルーティングをTypeScriptで学ぶ。ファイルベースルーティング、静的ルート、レイアウト、エラーハンドリングの実装方法を解説
---

SvelteKitはファイルシステムベースのルーティングを採用しています。`src/routes`ディレクトリ内のファイル構造がそのままURLパスになります。この直感的な仕組みにより、ディレクトリとファイルを作成するだけで新しいページを追加できます。

## ディレクトリ構造とURLの対応

### 基本的なマッピング

```
src/routes/
├── +page.svelte              → /
├── +layout.svelte            → 全ページ共通レイアウト
├── about/
│   └── +page.svelte          → /about
├── blog/
│   ├── +page.svelte          → /blog
│   └── new/
│       └── +page.svelte      → /blog/new
└── contact/
    └── +page.svelte          → /contact
```

:::tip[重要なルール]
- `+page.svelte` がないディレクトリはルートとして認識されません
- `+layout.svelte` は子ルートに継承されます
- ディレクトリ名がそのままURLパスになります
:::

## ページの作成

### 基本的なページコンポーネント

```svelte
<!-- src/routes/about/+page.svelte -->
<script lang="ts">
  import type { PageData } from './$types';
  
  // Load関数からのデータ（もしあれば）
  export let data: PageData;
</script>

<h1>About Page</h1>
<p>This page is accessible at /about</p>
```

### TypeScriptでのデータ取得

```typescript
// src/routes/about/+page.ts
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
  return {
    title: 'About Us',
    description: 'Learn more about our company'
  };
};
```

```svelte
<!-- src/routes/about/+page.svelte -->
<script lang="ts">
  import type { PageData } from './$types';
  
  export let data: PageData;
</script>

<h1>{data.title}</h1>
<p>{data.description}</p>
```

## レイアウト

### グローバルレイアウト

すべてのページで共通して使用するレイアウトを定義します。

```svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import '../app.css';
  import Header from '$lib/components/Header.svelte';
  import Footer from '$lib/components/Footer.svelte';
</script>

<div class="app">
  <Header />
  
  <main>
    <!-- 子ページがここにレンダリングされる -->
    <slot />
  </main>
  
  <Footer />
</div>

<style>
  .app {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }
  
  main {
    flex: 1;
    padding: 2rem;
  }
</style>
```

### セクション別レイアウト

特定のセクションでのみ使用するレイアウトを作成できます。

```svelte
<!-- src/routes/blog/+layout.svelte -->
<script lang="ts">
  import BlogSidebar from '$lib/components/BlogSidebar.svelte';
</script>

<div class="blog-layout">
  <aside>
    <BlogSidebar />
  </aside>
  
  <article>
    <!-- blog配下のページがここに表示される -->
    <slot />
  </article>
</div>

<style>
  .blog-layout {
    display: grid;
    grid-template-columns: 250px 1fr;
    gap: 2rem;
  }
</style>
```

### レイアウトのデータ取得

```typescript
// src/routes/+layout.ts
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ fetch }) => {
  // 全ページで使用する共通データ
  const navigation = await fetch('/api/navigation').then(r => r.json());
  
  return {
    navigation
  };
};
```

## エラーハンドリング

### カスタムエラーページ

```svelte
<!-- src/routes/+error.svelte -->
<script lang="ts">
  import { page } from '$app/stores';
</script>

<div class="error-page">
  <h1>{$page.status}</h1>
  <p>{$page.error?.message || 'An error occurred'}</p>
  
  {#if $page.status === 404}
    <p>ページが見つかりませんでした。</p>
    <a href="/">ホームに戻る</a>
  {:else if $page.status === 500}
    <p>サーバーエラーが発生しました。</p>
    <p>しばらく時間をおいてから再度お試しください。</p>
  {/if}
</div>

<style>
  .error-page {
    text-align: center;
    padding: 4rem 2rem;
  }
  
  h1 {
    font-size: 4rem;
    margin-bottom: 1rem;
  }
</style>
```

### エラーのスロー

```typescript
// src/routes/posts/[id]/+page.ts
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, fetch }) => {
  const response = await fetch(`/api/posts/${params.id}`);
  
  if (!response.ok) {
    if (response.status === 404) {
      throw error(404, '記事が見つかりません');
    }
    throw error(500, 'サーバーエラーが発生しました');
  }
  
  return {
    post: await response.json()
  };
};
```

## 静的アセットの配置

### publicディレクトリ

`static`ディレクトリ内のファイルは、ルートパスから直接アクセスできます。

```
static/
├── favicon.png         → /favicon.png
├── robots.txt          → /robots.txt
└── images/
    └── logo.svg        → /images/logo.svg
```

#### 使用例

```svelte
<img src="/images/logo.svg" alt="Logo" />
<link rel="icon" href="/favicon.png" />
```

## ナビゲーション

### リンクの作成

```svelte
<script lang="ts">
  import { page } from '$app/stores';
  
  // 現在のパスを取得
  $: currentPath = $page.url.pathname;
</script>

<nav>
  <a href="/" class:active={currentPath === '/'}>Home</a>
  <a href="/about" class:active={currentPath === '/about'}>About</a>
  <a href="/blog" class:active={currentPath.startsWith('/blog')}>Blog</a>
</nav>

<style>
  a {
    padding: 0.5rem 1rem;
    text-decoration: none;
  }
  
  a.active {
    font-weight: bold;
    border-bottom: 2px solid currentColor;
  }
</style>
```

### プリフェッチ

ページの事前読み込みでパフォーマンスを向上させます。

```svelte
<!-- ホバー時に事前読み込み -->
<a href="/about" data-sveltekit-preload-data="hover">About</a>

<!-- 表示されたら即座に読み込み -->
<a href="/blog" data-sveltekit-preload-data="eager">Blog</a>

<!-- タップ時に読み込み（モバイル向け） -->
<a href="/contact" data-sveltekit-preload-data="tap">Contact</a>
```

## ページ設定

### ページごとの設定

```typescript
// src/routes/about/+page.ts
import type { PageLoad } from './$types';

// プリレンダリング設定
export const prerender = true;  // ビルド時に静的生成

// SSR設定
export const ssr = true;         // サーバーサイドレンダリング有効

// CSR設定
export const csr = true;         // クライアントサイドレンダリング有効

// トレイリングスラッシュ
export const trailingSlash = 'always'; // URLの末尾に/を付ける

export const load: PageLoad = async () => {
  // データ取得
};
```

## 実践例：ブログサイトの構築

### ディレクトリ構造

```
src/routes/
├── +layout.svelte           # サイト全体のレイアウト
├── +page.svelte             # ホームページ
├── +error.svelte            # エラーページ
├── about/
│   └── +page.svelte         # About ページ
└── blog/
    ├── +layout.svelte       # ブログセクションのレイアウト
    ├── +page.svelte         # ブログ一覧
    ├── +page.ts             # ブログ記事の取得
    └── [slug]/
        ├── +page.svelte     # 個別記事ページ
        └── +page.ts         # 記事データの取得
```

### ブログ一覧ページ

```typescript
// src/routes/blog/+page.ts
import type { PageLoad } from './$types';

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
}

export const load: PageLoad = async ({ fetch }) => {
  const response = await fetch('/api/posts');
  const posts: BlogPost[] = await response.json();
  
  return {
    posts
  };
};
```

```svelte
<!-- src/routes/blog/+page.svelte -->
<script lang="ts">
  import type { PageData } from './$types';
  
  export let data: PageData;
</script>

<h1>Blog Posts</h1>

<div class="posts">
  {#each data.posts as post}
    <article>
      <h2>
        <a href="/blog/{post.slug}">{post.title}</a>
      </h2>
      <time>{new Date(post.date).toLocaleDateString('ja-JP')}</time>
      <p>{post.excerpt}</p>
    </article>
  {/each}
</div>
```

## トラブルシューティング

### よくある問題と解決方法

:::warning[404エラーが発生する]
- ファイル名が正しいか確認（`+page.svelte`であること）
- ディレクトリ構造が正しいか確認
- 開発サーバーを再起動してみる
:::

:::tip[型エラーの解決]
自動生成される型が更新されない場合
```bash
npm run dev  # 開発サーバーを再起動
# または
npm run check  # 型チェックを実行
```
:::

## まとめ

SvelteKitの基本ルーティングは、

- **直感的**: ファイル構造 = URL構造
- **型安全**: TypeScriptによる完全な型サポート
- **柔軟**: レイアウトの継承とエラーハンドリング
- **高速**: 自動的なコード分割とプリフェッチ

## 次のステップ

- [動的ルーティング](/sveltekit/routing/dynamic/) - 動的なURLパラメータの扱い方
- [SvelteKitファイルシステム](/sveltekit/architecture/file-system/) - 特殊ファイルの詳細
- [Load関数とデータフェッチング](/sveltekit/data-loading/) - データ取得の詳細