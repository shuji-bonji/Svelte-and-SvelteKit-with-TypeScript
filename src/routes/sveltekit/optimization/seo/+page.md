---
title: SEO最適化
description: SvelteKitでのSEO最適化。svelte:headによるメタタグ管理、OGP・Twitter Card、構造化データ（JSON-LD）、サイトマップ、robots.txt、canonical URLをTypeScriptで実装
---

<script>
	import Admonition from '$lib/components/Admonition.svelte';
  import Mermaid from '$lib/components/Mermaid.svelte';

  const seoOverviewDiagram = `flowchart TB
    subgraph "ページ単位のSEO"
      direction TB
      Head["svelte:head"]
      Title["title / description"]
      OGP["OGP メタタグ"]
      TwitterCard["Twitter Card"]
      CanonicalURL["canonical URL"]
      JSONLD["構造化データ（JSON-LD）"]
    end

    subgraph "サイト全体のSEO"
      direction TB
      Sitemap["sitemap.xml"]
      Robots["robots.txt"]
      SSR["SSR（サーバーサイドレンダリング）"]
    end

    Head --> Title
    Head --> OGP
    Head --> TwitterCard
    Head --> CanonicalURL
    Head --> JSONLD

    style Head fill:#e8f5e9,stroke:#4caf50
    style SSR fill:#e3f2fd,stroke:#2196f3`;
</script>

SvelteKitはSSR（サーバーサイドレンダリング）をデフォルトでサポートしており、SEOに強いアプリケーションを構築できます。このページでは、メタタグ管理からサイトマップ生成まで、実践的なSEO実装パターンを解説します。

<Mermaid diagram={seoOverviewDiagram} />

## svelte:head によるメタタグ管理

`&lt;svelte:head&gt;`を使って、各ページのメタ情報を動的に設定します。

### 基本的な使い方

```svelte
<!-- +page.svelte -->
<script lang="ts">
  import type { PageProps } from './$types';

  let { data }: PageProps = $props();
</script>

<svelte:head>
  <title>{data.post.title} | マイブログ</title>
  <meta name="description" content={data.post.excerpt} />
  <link rel="canonical" href="https://example.com/posts/{data.post.slug}" />
</svelte:head>

<article>
  <h1>{data.post.title}</h1>
  <p>{data.post.content}</p>
</article>
```

### レイアウトでのデフォルト設定

レイアウトでサイト共通のメタタグを設定し、各ページで上書きできます。

```svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import type { LayoutProps } from './$types';

  let { data, children }: LayoutProps = $props();
</script>

<svelte:head>
  <!-- デフォルトのtitleとdescription -->
  <title>マイサイト</title>
  <meta name="description" content="TypeScriptで学ぶSvelte5とSvelteKit" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="icon" href="/favicon.png" />
</svelte:head>

{@render children()}
```

<Admonition type="note" title="titleの上書き">
子ページの`&lt;svelte:head&gt;`内で`<title>`を指定すると、レイアウトの`<title>`が上書きされます。`<meta name="description">`も同様です。
</Admonition>

## SEOメタデータコンポーネント

再利用可能なSEOコンポーネントを作成すると、各ページでの設定が簡潔になります。

```svelte
<!-- src/lib/components/SEO.svelte -->
<script lang="ts">
  interface Props {
    title: string;
    description: string;
    url: string;
    image?: string;
    type?: 'website' | 'article';
    publishedTime?: string;
    author?: string;
  }

  let {
    title,
    description,
    url,
    image = 'https://example.com/default-og.png',
    type = 'website',
    publishedTime,
    author
  }: Props = $props();

  const siteName = 'マイサイト';
  const fullTitle = `${title} | ${siteName}`;
</script>

<svelte:head>
  <!-- 基本メタタグ -->
  <title>{fullTitle}</title>
  <meta name="description" content={description} />
  <link rel="canonical" href={url} />

  <!-- OGP（Open Graph Protocol） -->
  <meta property="og:title" content={fullTitle} />
  <meta property="og:description" content={description} />
  <meta property="og:url" content={url} />
  <meta property="og:image" content={image} />
  <meta property="og:type" content={type} />
  <meta property="og:site_name" content={siteName} />
  <meta property="og:locale" content="ja_JP" />

  {#if type === 'article' && publishedTime}
    <meta property="article:published_time" content={publishedTime} />
  {/if}
  {#if author}
    <meta property="article:author" content={author} />
  {/if}

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={fullTitle} />
  <meta name="twitter:description" content={description} />
  <meta name="twitter:image" content={image} />
</svelte:head>
```

### 使用例

```svelte
<!-- +page.svelte -->
<script lang="ts">
  import type { PageProps } from './$types';
  import SEO from '$lib/components/SEO.svelte';
  import { page } from '$app/state';

  let { data }: PageProps = $props();
</script>

<SEO
  title={data.post.title}
  description={data.post.excerpt}
  url="https://example.com{page.url.pathname}"
  image={data.post.ogImage}
  type="article"
  publishedTime={data.post.createdAt}
  author={data.post.author.name}
/>

<article>
  <h1>{data.post.title}</h1>
</article>
```

## 構造化データ（JSON-LD）

検索エンジンにコンテンツの意味を伝えるため、JSON-LD形式の構造化データを埋め込みます。

```svelte
<!-- +page.svelte — ブログ記事の構造化データ -->
<script lang="ts">
  import type { PageProps } from './$types';

  let { data }: PageProps = $props();

  // JSON-LD構造化データを構築
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: data.post.title,
    description: data.post.excerpt,
    datePublished: data.post.createdAt,
    dateModified: data.post.updatedAt,
    author: {
      '@type': 'Person',
      name: data.post.author.name,
      url: data.post.author.url
    },
    publisher: {
      '@type': 'Organization',
      name: 'マイサイト',
      logo: {
        '@type': 'ImageObject',
        url: 'https://example.com/logo.png'
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://example.com/posts/${data.post.slug}`
    }
  };
</script>

<svelte:head>
  <!-- 構造化データを安全に埋め込む -->
  {@html `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`}
</svelte:head>
```

<Admonition type="warning" title="@htmlの使用に注意">
`&#123;@html&#125;`でJSON-LDを埋め込む場合、ユーザー入力が含まれる可能性がある値はサニタイズしてください。`JSON.stringify()`はXSS対策として`&lt;/script&gt;`を含む文字列のエスケープを行いませんので、必要に応じて追加のエスケープ処理を施してください。
</Admonition>

## サイトマップの自動生成

`+server.ts`を使ってサイトマップを動的に生成できます。

```typescript
// src/routes/sitemap.xml/+server.ts
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
  // データベースや静的ルートからURLリストを取得
  const posts = await db.post.findMany({
    where: { published: true },
    select: { slug: true, updatedAt: true },
  });

  const baseUrl = url.origin;

  // 静的ページのリスト
  const staticPages = [
    { path: '/', priority: '1.0', changefreq: 'weekly' },
    { path: '/about', priority: '0.8', changefreq: 'monthly' },
    { path: '/blog', priority: '0.9', changefreq: 'daily' },
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticPages
    .map(
      (page) => `
  <url>
    <loc>${baseUrl}${page.path}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`,
    )
    .join('')}
  ${posts
    .map(
      (post) => `
  <url>
    <loc>${baseUrl}/posts/${post.slug}</loc>
    <lastmod>${post.updatedAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`,
    )
    .join('')}
</urlset>`;

  return new Response(xml.trim(), {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'max-age=3600',
    },
  });
};
```

### 静的サイトの場合（prerender）

SSGの場合は、ビルド時にサイトマップを生成できます。

```typescript
// src/routes/sitemap.xml/+server.ts
import type { RequestHandler } from './$types';

// prerenderを有効にするとビルド時に生成される
export const prerender = true;

export const GET: RequestHandler = async () => {
  // ビルド時に実行される
  // ...
};
```

## robots.txt

```typescript
// src/routes/robots.txt/+server.ts
import type { RequestHandler } from './$types';

export const prerender = true;

export const GET: RequestHandler = async ({ url }) => {
  const body = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

Sitemap: ${url.origin}/sitemap.xml`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain' },
  });
};
```

## canonical URL の管理

重複コンテンツを防ぐため、正規URLを設定します。

```svelte
<script lang="ts">
  import { page } from '$app/state';

  // トレイリングスラッシュやクエリパラメータを正規化
  let canonicalUrl = $derived(
    `https://example.com${page.url.pathname}`.replace(/\/$/, '')
  );
</script>

<svelte:head>
  <link rel="canonical" href={canonicalUrl} />
</svelte:head>
```

### ページネーション

```svelte
<script lang="ts">
  import type { PageProps } from './$types';

  let { data }: PageProps = $props();
  const baseUrl = 'https://example.com/blog';
</script>

<svelte:head>
  <link rel="canonical" href="{baseUrl}?page={data.currentPage}" />

  {#if data.currentPage > 1}
    <link rel="prev" href="{baseUrl}?page={data.currentPage - 1}" />
  {/if}
  {#if data.currentPage < data.totalPages}
    <link rel="next" href="{baseUrl}?page={data.currentPage + 1}" />
  {/if}
</svelte:head>
```

## SSR と SEO の関係

SvelteKitはデフォルトでSSRが有効であり、検索エンジンのクローラーが完全にレンダリングされたHTMLを受け取ります。これはSEOの観点で非常に重要です。

```typescript
// +page.ts — ページ単位でSSRを制御
export const ssr = true; // デフォルト（SSR有効）
export const csr = true; // クライアントサイドでもハイドレーション

// SSRを無効にするとSEOに悪影響がある可能性がある
// export const ssr = false;
```

<Admonition type="tip" title="SSR + Prerender の組み合わせ">
コンテンツが静的な場合は`export const prerender = true`を設定することで、ビルド時にHTMLを生成できます。SSRのSEO利点を維持しつつ、サーバー負荷をゼロにできる最適な選択肢です。
</Admonition>

## よくある間違い

### SPAモードでのSEO対策不足

```typescript
// ❌ SSRを無効にするとクローラーがコンテンツを取得できない
export const ssr = false; // SPA専用ページ

// ✅ SEOが必要なページはSSRを有効にする
export const ssr = true; // デフォルト
```

### メタタグの動的生成漏れ

```svelte
<!-- ❌ ハードコードされたメタタグ -->
<svelte:head>
  <title>ブログ</title>
  <meta name="description" content="ブログページ" />
</svelte:head>

<!-- ✅ Load関数のデータから動的に生成 -->
<svelte:head>
  <title>{data.post.title} | マイブログ</title>
  <meta name="description" content={data.post.excerpt} />
</svelte:head>
```

## まとめ

SvelteKitでのSEO最適化は、SSRのデフォルトサポートという強力な基盤の上に成り立っています。`&lt;svelte:head&gt;`での動的メタタグ管理、再利用可能なSEOコンポーネント、JSON-LDによる構造化データ、`+server.ts`でのサイトマップ/robots.txt生成を組み合わせることで、包括的なSEO対策が実現できます。

## 次のステップ

- [レンダリング戦略](/sveltekit/basics/rendering-strategies/) — SSR/SSG/SPAの使い分け
- [APIルート](/sveltekit/server/api-routes/) — +server.tsの詳細
- [キャッシュ戦略](/sveltekit/optimization/caching/) — パフォーマンス最適化
