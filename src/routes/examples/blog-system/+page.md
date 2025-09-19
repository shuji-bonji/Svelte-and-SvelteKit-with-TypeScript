---
title: Svelte 5 ブログシステム実装例
description: Svelte 5とSvelteKitでTypeScriptを使った最小構成のブログシステム実装。ルーティング、レイアウト、動的ルート、データ取得の実践的なサンプルコード
---

<script>
  import { resolve } from '$app/paths';
</script>

Svelte 5とSvelteKitを使用した、実践的なブログシステムの最小構成実装例です。ルーティング、レイアウト、動的ルート、データ取得など、実際の開発で必要な機能を網羅しています。

## 実装プロジェクト

このブログシステムの実装例が実際に動作しているデモサイトを確認できます。

- **デモサイト**: [https://shuji-bonji.github.io/svelte5-blog-example/](https://shuji-bonji.github.io/svelte5-blog-example/)
- **ソースコード**: [https://github.com/shuji-bonji/svelte5-blog-example](https://github.com/shuji-bonji/svelte5-blog-example)

:::info[このページで学べること]
- ファイルベースルーティングの実践的な活用
- 動的ルートを使った記事ページの実装
- TypeScriptによる型安全なデータ管理
- レイアウトシステムによるUI共通化
- ナビゲーションコンポーネントの実装
:::

### スクリーンショット

<div class="relative max-w-4xl mx-auto">
  <!-- スクリーンショット表示 -->
  <div class="relative overflow-hidden rounded-xl shadow-2xl">
    <!-- ライトモード画像（html.darkクラスがない場合に表示） -->
    <img
      src="{resolve('/images/examples/blog-example-light.png')}"
      alt="Blog - ライトモード"
      class="w-full transition-opacity duration-300 block dark:hidden"
    >
    <!-- ダークモード画像（html.darkクラスがある場合に表示） -->
    <img
      src="{resolve('/images/examples/blog-example-dark.png')}"
      alt="Blog - ダークモード"
      class="w-full transition-opacity duration-300 hidden dark:block"
    >
  </div>
  
  <!-- キャプション -->
  <p class="text-center text-gray-600 dark:text-gray-400 mt-3 text-sm">
    <span class="inline dark:hidden">ライトモード表示</span>
    <span class="hidden dark:inline">ダークモード表示</span>
  </p>
</div>


## プロジェクト構成

最小構成のブログシステムに必要なファイル構成です。

```
src/
├── lib/
│   ├── components/
│   │   ├── Navigation.svelte      # ナビゲーションバー
│   │   ├── ArticleCard.svelte     # 記事カード
│   │   └── Footer.svelte          # フッター
│   ├── data/
│   │   └── articles.ts             # 記事データ（モック）
│   └── types/
│       └── blog.ts                 # 型定義
├── routes/
│   ├── +layout.svelte              # 全体レイアウト
│   ├── +page.svelte                # ホームページ
│   ├── about/
│   │   └── +page.svelte            # Aboutページ
│   └── blog/
│       ├── +page.svelte            # 記事一覧
│       ├── +page.ts                # 記事一覧データ取得
│       └── [slug]/
│           ├── +page.svelte        # 個別記事ページ
│           └── +page.ts            # 記事データ取得
└── app.html                        # HTMLテンプレート
```

## 型定義

TypeScriptによる型安全な開発のための型定義です。

```typescript
// src/lib/types/blog.ts
export interface Article {
  slug: string;
  title: string;
  description: string;
  content: string;
  date: string;
  author: string;
  tags: string[];
  readTime: number; // 読了時間（分）
}

export interface ArticleMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  tags: string[];
  readTime: number;
}
```

## データ層

記事データを管理するモジュールです。実際のプロジェクトではAPIやCMSから取得します。

```typescript
// src/lib/data/articles.ts
import type { Article, ArticleMeta } from '$lib/types/blog';

// モックデータ（実際はAPIやCMSから取得）
const articles: Article[] = [
  {
    slug: 'getting-started-with-sveltekit',
    title: 'SvelteKitで始めるWebアプリ開発',
    description: 'SvelteKitの基本的な使い方と、最初のアプリケーションの作り方を解説します。',
    content: `# SvelteKitで始めるWebアプリ開発\n\n...記事の内容...`,
    date: '2024-01-15',
    author: '山田太郎',
    tags: ['SvelteKit', 'TypeScript', '入門'],
    readTime: 5
  },
  {
    slug: 'svelte5-runes-deep-dive',
    title: 'Svelte 5 Runesシステム完全解説',
    description: '$state、$derived、$effectなど、Svelte 5の新しいリアクティビティシステムを詳しく解説。',
    content: `# Svelte 5 Runesシステム完全解説\n\n...記事の内容...`,
    date: '2024-01-10',
    author: '鈴木花子',
    tags: ['Svelte 5', 'Runes', 'リアクティビティ'],
    readTime: 8
  },
  {
    slug: 'typescript-best-practices',
    title: 'TypeScriptベストプラクティス2024',
    description: 'Svelte/SvelteKitプロジェクトでのTypeScript活用法とベストプラクティス。',
    content: `# TypeScriptベストプラクティス2024\n\n...記事の内容...`,
    date: '2024-01-05',
    author: '佐藤次郎',
    tags: ['TypeScript', 'ベストプラクティス'],
    readTime: 10
  }
];

// 記事一覧を取得（メタデータのみ）
export function getArticles(): ArticleMeta[] {
  return articles
    .map(({ content, ...meta }) => meta)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// 個別記事を取得
export function getArticle(slug: string): Article | undefined {
  return articles.find(article => article.slug === slug);
}

// タグで記事を絞り込み
export function getArticlesByTag(tag: string): ArticleMeta[] {
  return getArticles().filter(article => article.tags.includes(tag));
}

// 全タグを取得
export function getAllTags(): string[] {
  const tags = new Set<string>();
  articles.forEach(article => {
    article.tags.forEach(tag => tags.add(tag));
  });
  return Array.from(tags).sort();
}
```

## コンポーネント実装

### ナビゲーションコンポーネント

```svelte
<!-- src/lib/components/Navigation.svelte -->
<script lang="ts">
  import { page } from '$app/stores';
  import { base, resolve } from '$app/paths';

  type NavItem = {
    href: string;
    label: string;
    matchPath?: string;
  };

  const navItems: NavItem[] = [
    { href: '/', label: 'ホーム' },
    { href: '/blog', label: 'ブログ', matchPath: '/blog' },
    { href: '/about', label: 'About' }
  ];

  let currentPath = $derived($page.url.pathname);

  function isActive(item: NavItem): boolean {
    const path = currentPath.replace(base, '') || '/';
    if (item.href === '/' && path === '/') {
      return true;
    }
    if (item.href !== '/' && path.startsWith(item.matchPath || item.href)) {
      return true;
    }
    return false;
  }

  // resolveを使用してナビゲーションURLを解決
  const homeUrl = resolve('/');
  const navUrls = $derived(navItems.map(item => ({
    ...item,
    resolvedUrl: resolve(item.href)
  })));
</script>

<nav class="navbar">
  <div class="nav-container">
    <a href={homeUrl} class="logo">My Blog</a>
    <ul class="nav-menu">
      {#each navUrls as item}
        <li>
          <a
            href={item.resolvedUrl}
            class:active={isActive(item)}
            aria-current={isActive(item) ? 'page' : undefined}
          >
            {item.label}
          </a>
        </li>
      {/each}
    </ul>
  </div>
</nav>

<style>
  .navbar {
    background: var(--color-bg-secondary);
    border-bottom: 1px solid var(--color-border);
    position: sticky;
    top: 0;
    z-index: 100;
  }
  
  .nav-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 1rem 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .logo {
    font-size: 1.5rem;
    font-weight: bold;
    text-decoration: none;
    color: var(--color-text);
  }
  
  .nav-menu {
    display: flex;
    gap: 2rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }
  
  .nav-menu a {
    text-decoration: none;
    color: var(--color-text-secondary);
    transition: color 0.2s;
  }
  
  .nav-menu a:hover,
  .nav-menu a.active {
    color: var(--color-primary);
  }
</style>
```

### 記事カードコンポーネント

```svelte
<!-- src/lib/components/ArticleCard.svelte -->
<script lang="ts">
  import type { ArticleMeta } from '$lib/types/blog';
  import { resolve } from '$app/paths';

  let { article }: { article: ArticleMeta } = $props();

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // resolveを使用して記事URLを解決
  const articleUrl = $derived(resolve(`/blog/${article.slug}`));
</script>

<article class="card">
  <a href={articleUrl} class="card-link">
    <h2>{article.title}</h2>
    <p class="description">{article.description}</p>
    <div class="meta">
      <time datetime={article.date}>{formatDate(article.date)}</time>
      <span class="author">by {article.author}</span>
      <span class="read-time">{article.readTime}分で読める</span>
    </div>
    <div class="tags">
      {#each article.tags as tag}
        <span class="tag">{tag}</span>
      {/each}
    </div>
  </a>
</article>

<style>
  .card {
    background: var(--color-bg-secondary);
    border-radius: 8px;
    padding: 1.5rem;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  
  .card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  .card-link {
    text-decoration: none;
    color: inherit;
    display: block;
  }
  
  h2 {
    margin: 0 0 0.5rem;
    color: var(--color-text);
  }
  
  .description {
    color: var(--color-text-secondary);
    margin: 0.5rem 0 1rem;
    line-height: 1.6;
  }
  
  .meta {
    display: flex;
    gap: 1rem;
    font-size: 0.875rem;
    color: var(--color-text-muted);
    margin-bottom: 0.5rem;
  }
  
  .tags {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }
  
  .tag {
    background: var(--color-primary-light);
    color: var(--color-primary);
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.875rem;
  }
</style>
```

## レイアウト実装

### ルートレイアウト

```svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import Navigation from '$lib/components/Navigation.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import type { Snippet } from 'svelte';
  
  let { children }: { children?: Snippet } = $props();
</script>

<div class="app">
  <Navigation />
  
  <main class="main">
    {@render children?.()}
  </main>
  
  <Footer />
</div>

<style>
  :global(:root) {
    --color-primary: #ff3e00;
    --color-primary-light: #ff3e0020;
    --color-bg: #ffffff;
    --color-bg-secondary: #f5f5f5;
    --color-text: #333333;
    --color-text-secondary: #666666;
    --color-text-muted: #999999;
    --color-border: #e0e0e0;
  }
  
  :global(body) {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
    background: var(--color-bg);
    color: var(--color-text);
  }
  
  .app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }
  
  .main {
    flex: 1;
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
    width: 100%;
  }
</style>
```


## ページ実装

### ホームページ

```svelte
<!-- src/routes/+page.svelte -->
<script lang="ts">
  import { getArticles } from '$lib/data/articles';
  import ArticleCard from '$lib/components/ArticleCard.svelte';
  import { resolve } from '$app/paths';

  // Svelte 5の$derivedを使用して最新記事を取得
  const recentArticles = $derived(getArticles().slice(0, 3));

  // resolveを使用してURLを解決
  const blogUrl = resolve('/blog');
</script>

<div class="home">
  <section class="hero">
    <h1>Welcome to My Blog</h1>
    <p>Svelte 5とSvelteKitで構築された、モダンなブログシステムです。</p>
  </section>

  <section class="recent-posts">
    <h2>最新の記事</h2>
    <div class="article-grid">
      {#each recentArticles as article}
        <ArticleCard {article} />
      {/each}
    </div>
    <a href={blogUrl} class="view-all">すべての記事を見る →</a>
  </section>
</div>

<style>
  .hero {
    text-align: center;
    padding: 4rem 0;
  }
  
  .hero h1 {
    font-size: 3rem;
    margin: 0 0 1rem;
  }
  
  .hero p {
    font-size: 1.25rem;
    color: var(--color-text-secondary);
  }
  
  .recent-posts {
    margin-top: 4rem;
  }
  
  .article-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 2rem;
    margin: 2rem 0;
  }
  
  .view-all {
    display: inline-block;
    margin-top: 1rem;
    color: var(--color-primary);
    text-decoration: none;
    font-weight: 500;
  }
</style>
```

### 記事一覧ページ

```svelte
<!-- src/routes/blog/+page.svelte -->
<script lang="ts">
  import type { PageData } from './$types';
  import ArticleCard from '$lib/components/ArticleCard.svelte';
  
  let { data }: { data: PageData } = $props();
</script>

<div class="blog-list">
  <h1>ブログ記事</h1>
  
  <div class="articles">
    {#each data.articles as article}
      <ArticleCard {article} />
    {/each}
  </div>
  
  {#if data.articles.length === 0}
    <p class="no-articles">記事が見つかりませんでした。</p>
  {/if}
</div>

<style>
  .blog-list h1 {
    margin-bottom: 2rem;
  }
  
  .filter-info {
    background: var(--color-primary-light);
    color: var(--color-primary);
    padding: 0.5rem 1rem;
    border-radius: 4px;
    margin-bottom: 2rem;
  }
  
  .articles {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }
  
  .no-articles {
    text-align: center;
    color: var(--color-text-secondary);
    padding: 4rem 0;
  }
</style>
```

```typescript
// src/routes/blog/+page.ts
import type { PageLoad } from './$types';
import { getArticles } from '$lib/data/articles';

export const load: PageLoad = async () => {
  const articles = getArticles();
  
  return {
    articles
  };
};
```

:::tip[静的サイト生成での注意点]
SvelteKitで静的サイト生成（SSG）を行う場合、`url.searchParams`はビルド時に使用できません。
タグフィルタリングなどの動的な機能は、クライアントサイドで実装するか、
タグごとに別ページを生成する必要があります。
:::

### 個別記事ページ

```svelte
<!-- src/routes/blog/[slug]/+page.svelte -->
<script lang="ts">
  import type { PageData } from './$types';
  import { marked } from 'marked'; // npm install marked
  import { resolve } from '$app/paths';

  let { data }: { data: PageData } = $props();

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Markdownをレンダリング（実際はより安全な処理が必要）
  let htmlContent = $derived(marked(data.article.content));
</script>

<article class="article">
  <header>
    <h1>{data.article.title}</h1>
    <div class="meta">
      <time datetime={data.article.date}>{formatDate(data.article.date)}</time>
      <span>by {data.article.author}</span>
      <span>{data.article.readTime}分で読める</span>
    </div>
    <div class="tags">
      {#each data.article.tags as tag}
        <a href="{resolve('/blog')}?tag={tag}" class="tag">{tag}</a>
      {/each}
    </div>
  </header>
  
  
  <div class="content">
    {@html htmlContent}
  </div>
  
  <footer>
    <a href={resolve('/blog')}>← ブログ一覧に戻る</a>
  </footer>
</article>

<style>
  .article {
    max-width: 800px;
    margin: 0 auto;
  }
  
  header {
    margin-bottom: 2rem;
  }
  
  h1 {
    margin: 0 0 1rem;
    font-size: 2.5rem;
    line-height: 1.2;
  }
  
  .meta {
    display: flex;
    gap: 1rem;
    color: var(--color-text-muted);
    margin-bottom: 1rem;
  }
  
  .tags {
    display: flex;
    gap: 0.5rem;
  }
  
  .tag {
    background: var(--color-primary-light);
    color: var(--color-primary);
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    text-decoration: none;
    font-size: 0.875rem;
  }
  
  .cover-image {
    width: 100%;
    border-radius: 8px;
    margin: 2rem 0;
  }
  
  .content {
    font-size: 1.125rem;
    line-height: 1.75;
  }
  
  .content :global(h2) {
    margin: 2rem 0 1rem;
  }
  
  .content :global(h3) {
    margin: 1.5rem 0 0.75rem;
  }
  
  .content :global(pre) {
    background: var(--color-bg-secondary);
    padding: 1rem;
    border-radius: 4px;
    overflow-x: auto;
  }
  
  footer {
    margin-top: 4rem;
    padding-top: 2rem;
    border-top: 1px solid var(--color-border);
  }
</style>
```

```typescript
// src/routes/blog/[slug]/+page.ts
import type { PageLoad } from './$types';
import { getArticle } from '$lib/data/articles';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async ({ params }) => {
  const article = getArticle(params.slug);
  
  if (!article) {
    error(404, {
      message: '記事が見つかりませんでした'
    });
  }
  
  return {
    article
  };
};
```

### エラーページ

```svelte
<!-- src/routes/+error.svelte -->
<script lang="ts">
  import { page } from '$app/stores';
  
  let status = $derived($page.status);
  let message = $derived($page.error?.message || 'ページが見つかりませんでした');
</script>

<div class="error-page">
  <h1>{status}</h1>
  <p>{message}</p>
  <a href="/">ホームへ戻る</a>
</div>

<style>
  .error-page {
    text-align: center;
    padding: 4rem 0;
  }
  
  h1 {
    font-size: 4rem;
    margin: 0;
    color: var(--color-primary);
  }
  
  p {
    color: var(--color-text-secondary);
    margin: 1rem 0;
  }
  
  a {
    display: inline-block;
    margin-top: 2rem;
    padding: 0.75rem 2rem;
    background: var(--color-primary);
    color: white;
    text-decoration: none;
    border-radius: 4px;
  }
</style>
```

## 機能拡張のアイデア

このブログシステムは最小構成ですが、以下の機能を追加することで実用的なシステムに拡張できます。

### 検索機能
- 記事のタイトル・内容検索
- タグによる絞り込み
- 全文検索の実装

### CMSとの統合
- Contentful、Strapi などのヘッドレスCMS
- Markdown ファイルベースのCMS
- GitHub APIを使った記事管理

### パフォーマンス最適化
- 画像の遅延読み込み
- 記事のプリフェッチ
- Static Site Generation (SSG)

### ユーザー機能
- コメントシステム
- いいね・ブックマーク
- ソーシャルシェア

## まとめ

このブログシステム実装例では、SvelteKitの主要機能を活用した実践的な構成を示しました。

#### 学んだポイント
- ファイルベースルーティングによる直感的なURL設計
- 動的ルート（`[slug]`）を使った個別ページ生成
- TypeScriptによる型安全な開発
- レイアウトシステムによるUI共通化
- Svelte 5のRunesシステムを使った状態管理

この実装をベースに、さらに機能を追加していくことで、本格的なブログシステムを構築できます。

## 関連リンク

- [基本ルーティング](/sveltekit/routing/basic/) - ルーティングの基礎
- [動的ルーティング](/sveltekit/routing/dynamic/) - 動的ルートの詳細
- [データ取得](/sveltekit/data-loading/basic/) - Load関数の使い方
- [レイアウト](/sveltekit/routing/basic/#レイアウト) - レイアウトシステムの詳細