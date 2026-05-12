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

再利用可能なSEOコンポーネントを作成すると、各ページでの設定が簡潔になります。`$app/paths` の `base` と `$app/state` の `page` を組み合わせることで、GitHub Pages などサブパス配下にデプロイしても正しい絶対URLを生成できます。

```svelte
<!-- src/lib/components/SEO.svelte -->
<script lang="ts">
  import { page } from '$app/state';
  import { base } from '$app/paths';

  interface Props {
    /** ページタイトル */
    title: string;
    /** ページ説明 */
    description: string;
    /** OGP 画像のパス（base 起点の絶対パス。例: '/og-image.png'） */
    imagePath?: string;
    /** OGP の type */
    type?: 'website' | 'article';
    publishedTime?: string;
    author?: string;
  }

  let {
    title,
    description,
    imagePath = '/og-image.png',
    type = 'website',
    publishedTime,
    author
  }: Props = $props();

  const siteName = 'マイサイト';

  // $props() で受け取った値は reactive なので、それを参照する派生値も $derived で包む
  const fullTitle = $derived(`${title} | ${siteName}`);

  // canonical / OGP URL: page.url.origin と base を組み合わせて絶対URLを作る
  // page は reactive なので $derived で包む必要がある
  const canonicalUrl = $derived(page.url.href);
  const ogImageUrl = $derived(`${page.url.origin}${base}${imagePath}`);
</script>

<svelte:head>
  <!-- 基本メタタグ -->
  <title>{fullTitle}</title>
  <meta name="description" content={description} />
  <link rel="canonical" href={canonicalUrl} />

  <!-- OGP（Open Graph Protocol） -->
  <meta property="og:title" content={fullTitle} />
  <meta property="og:description" content={description} />
  <meta property="og:url" content={canonicalUrl} />
  <meta property="og:image" content={ogImageUrl} />
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
  <meta name="twitter:image" content={ogImageUrl} />
</svelte:head>
```

<Admonition type="tip" title="本サイトの SeoMeta.svelte をケーススタディに">

本学習サイト（`/Svelte-and-SvelteKit-with-TypeScript/`）は GitHub Pages のサブパス配下で動作しており、`src/lib/components/SeoMeta.svelte` で **`page.url.origin` + `base` + アセットパス** という同じ組み立てを採用しています。`base` を含めることで、dev（`base = ''`）と prod（`base = '/Svelte-and-SvelteKit-with-TypeScript'`）の両方で OGP 画像 URL や canonical URL が正しく解決されます。

</Admonition>

### 使用例

```svelte
<!-- +page.svelte -->
<script lang="ts">
  import type { PageProps } from './$types';
  import SEO from '$lib/components/SEO.svelte';

  let { data }: PageProps = $props();
</script>

<SEO
  title={data.post.title}
  description={data.post.excerpt}
  imagePath={data.post.ogImagePath}
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

`data` や `page` のような reactive な値をローカル変数に展開する際は、Svelte 5 のコンパイラから `state_referenced_locally` 警告が出ます。**JSON-LD オブジェクトは `$derived` で包む**ことで、`data` の変更に追従しつつ警告を回避できます。

```svelte
<!-- +page.svelte — ブログ記事の構造化データ -->
<script lang="ts">
  import type { PageProps } from './$types';
  import { page } from '$app/state';
  import { base } from '$app/paths';

  let { data }: PageProps = $props();

  // canonical URL：base パスを含む絶対URLを組み立てる
  // trailingSlash: 'always' 環境では末尾スラッシュを含める
  const canonicalUrl = $derived(
    `${page.url.origin}${base}/posts/${data.post.slug}/`
  );

  // JSON-LD構造化データを $derived で包む
  // data や canonicalUrl が更新された場合も自動的に再計算される
  const jsonLd = $derived({
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
        url: `${page.url.origin}${base}/logo.png`
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl
    }
  });
</script>

<svelte:head>
  <link rel="canonical" href={canonicalUrl} />
  <!-- 構造化データを安全に埋め込む -->
  {@html `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`}
</svelte:head>
```

<Admonition type="caution" title="state_referenced_locally 警告の回避">

`const jsonLd = { headline: data.post.title, ... }` のように `$props()` で受け取った `data` をローカル定数に直接展開すると、**初期値しかキャプチャされません**。Svelte 5 では `state_referenced_locally` 警告として検出されます。

```ts
// NG: data の更新に追従しない（state_referenced_locally 警告が出る）
const jsonLd = {
  headline: data.post.title,
  // ...
};

// OK: $derived で包めば reactive に再計算される
const jsonLd = $derived({
  headline: data.post.title,
  // ...
});
```

</Admonition>

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

<Admonition type="info" title="ケーススタディ：本サイトの sitemap.xml 実装">

本学習サイトの `src/routes/sitemap.xml/+server.ts` は次のような方針で sitemap を生成しています。

- **`prerender = true`** によりビルド時に `dist/sitemap.xml` を静的出力
- **公開ドメインをハードコード**（`https://shuji-bonji.github.io/Svelte-and-SvelteKit-with-TypeScript`）してサブパスを含めた絶対URLを生成
- **`trailingSlash: 'always'` と整合**するように、`sidebar.ts` から取り出した各パス（例: `/sveltekit/optimization/seo/`）の末尾スラッシュを保持したまま `<loc>` に出力
- **`lastmod`** は `git log -1 --format=%cI -- <file>` で各ページの最終更新日時を取得（git 利用不可時は `fs.statSync` の mtime にフォールバック）

```typescript
// 本サイト src/routes/sitemap.xml/+server.ts の抜粋
const DOMAIN = 'https://shuji-bonji.github.io/Svelte-and-SvelteKit-with-TypeScript';

export function GET() {
  const entries = uniquePaths.map((path) => {
    const sourceFile = resolveSourceFile(path);
    const lastmod = sourceFile ? getLastModified(sourceFile) : null;
    // path は '/sveltekit/optimization/seo/' のように末尾スラッシュ付き
    const normalizedPath = path === '/' ? '' : path;
    return { loc: `${DOMAIN}${normalizedPath}`, lastmod };
  });
  // ...
}
```

`+server.ts` の `+server.ts` では `$app/paths` の `base` は利用できない（サーバー側のモジュールには注入されない）ため、**公開ドメインを定数として保持し、そこにパスを連結する**のがシンプルです。

</Admonition>

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

重複コンテンツを防ぐため、正規URL（canonical URL）を設定します。canonical URL を組み立てるときに押さえるべきポイントは次の 3 点です。

1. **`$app/state` の `page.url` を `$derived` 経由で参照する** — reactive な値なのでローカル定数に直接代入すると初期値しかキャプチャされません
2. **`$app/paths` の `base` を含める** — GitHub Pages などサブパス配下にデプロイしてもURLが破綻しないようにする
3. **`trailingSlash` の設定とパス末尾を一致させる** — `trailingSlash: 'always'` なら末尾スラッシュを含めて canonical を発行する

### 基本パターン：page.url.href を使う

最も単純で確実なのは `page.url.href` をそのまま canonical にする方法です。`page.url.origin` には現在のホスト名が、`page.url.pathname` には `base` を含んだ実際のパスが入っているため、自然と整合が取れます。

```svelte
<script lang="ts">
  import { page } from '$app/state';

  // page は reactive なので $derived で包む（state_referenced_locally 警告の回避）
  const canonicalUrl = $derived(page.url.href);
</script>

<svelte:head>
  <link rel="canonical" href={canonicalUrl} />
</svelte:head>
```

<Admonition type="info" title="ケーススタディ：本サイトの SeoMeta.svelte">

本学習サイト `src/lib/components/SeoMeta.svelte` も同じパターンを採用しています。

```svelte
<script lang="ts">
  import { page } from '$app/state';
  import { base } from '$app/paths';

  // OGP / Twitter Card 用の絶対 URL
  // page.url.origin は dev でも prod でも実ホストになるため、base 環境差を吸収できる
  let ogImageUrl = $derived(`${page.url.origin}${base}/og-image.png`);
  let canonicalUrl = $derived(page.url.href);
</script>
```

OGP 画像のような **`static/` 配下のアセット URL** を組み立てる場合は `base` を明示的に挟む必要があります。一方で `canonical` は `page.url.href` をそのまま使えば、`base` を含む現在のパスが自動的に反映されます。

</Admonition>

### 明示的にパスを組み立てるパターン

動的ルートで slug 等から canonical を組み立てたい場合は、`base` を含めた絶対URLを `$derived` で組み立てます。`trailingSlash: 'always'` 設定下ではパス末尾にスラッシュを付けることに注意してください。

```svelte
<script lang="ts">
  import type { PageProps } from './$types';
  import { page } from '$app/state';
  import { base } from '$app/paths';

  let { data }: PageProps = $props();

  // trailingSlash: 'always' のため末尾スラッシュを含める
  const canonicalUrl = $derived(
    `${page.url.origin}${base}/posts/${data.post.slug}/`
  );
</script>

<svelte:head>
  <link rel="canonical" href={canonicalUrl} />
</svelte:head>
```

<Admonition type="warning" title="trailingSlash と canonical の整合性">

SvelteKit の `trailingSlash` オプションは、URLが正規化される際の末尾スラッシュの扱いを決めます。`canonical` の値がこの設定とずれていると、`/about` と `/about/` が**別URL**として扱われ、SEO 上不利になります。

| `trailingSlash` 設定 | URL末尾 | canonical の組み立て例 |
|---|---|---|
| `'never'`（デフォルト） | スラッシュなし | `${origin}${base}/about` |
| `'always'` | スラッシュあり | `${origin}${base}/about/` |
| `'ignore'`（非推奨） | どちらも有効 | 一方に統一する必要がある |

本サイトは `src/routes/+layout.ts` で `export const trailingSlash = 'always'` を指定しているため、すべての canonical / sitemap URL は末尾スラッシュ付きで生成されています。

</Admonition>

### ページネーション

```svelte
<script lang="ts">
  import type { PageProps } from './$types';
  import { page } from '$app/state';
  import { base } from '$app/paths';

  let { data }: PageProps = $props();

  // base 込みの絶対URLを $derived で組み立てる
  const blogUrl = $derived(`${page.url.origin}${base}/blog/`);
  const canonicalUrl = $derived(`${blogUrl}?page=${data.currentPage}`);
  const prevUrl = $derived(`${blogUrl}?page=${data.currentPage - 1}`);
  const nextUrl = $derived(`${blogUrl}?page=${data.currentPage + 1}`);
</script>

<svelte:head>
  <link rel="canonical" href={canonicalUrl} />

  {#if data.currentPage > 1}
    <link rel="prev" href={prevUrl} />
  {/if}
  {#if data.currentPage < data.totalPages}
    <link rel="next" href={nextUrl} />
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

### JSON-LD オブジェクトを `$derived` で包み忘れる

`$props()` で受け取った `data` を直接ローカル定数に展開すると、**初期値しかキャプチャされず** `state_referenced_locally` 警告が出ます。クライアントサイドナビゲーション時にメタデータが更新されません。

```svelte
<script lang="ts">
  import type { PageProps } from './$types';
  let { data }: PageProps = $props();

  // ❌ data の更新に追従しない（state_referenced_locally 警告）
  const jsonLd = {
    headline: data.post.title,
    description: data.post.excerpt
  };

  // ✅ $derived で包めば reactive に再計算される
  const jsonLdOk = $derived({
    headline: data.post.title,
    description: data.post.excerpt
  });
</script>
```

### canonical URL に `base` を入れ忘れる / `trailingSlash` 設定と矛盾する

```svelte
<script lang="ts">
  import { page } from '$app/state';
  import { base } from '$app/paths';

  // ❌ サブパスにデプロイすると壊れる
  const bad1 = $derived(`https://example.com${page.url.pathname}`);

  // ❌ trailingSlash: 'always' の設定下で末尾スラッシュを除去している
  const bad2 = $derived(
    `${page.url.origin}${base}${page.url.pathname}`.replace(/\/$/, '')
  );

  // ✅ page.url.href をそのまま使う（base と trailingSlash が自動で反映される）
  const good = $derived(page.url.href);
</script>
```

## まとめ

SvelteKitでのSEO最適化は、SSRのデフォルトサポートという強力な基盤の上に成り立っています。`&lt;svelte:head&gt;`での動的メタタグ管理、再利用可能なSEOコンポーネント、JSON-LDによる構造化データ、`+server.ts`でのサイトマップ/robots.txt生成を組み合わせることで、包括的なSEO対策が実現できます。

## 次のステップ

- [レンダリング戦略](/sveltekit/basics/rendering-strategies/) — SSR/SSG/SPAの使い分け
- [APIルート](/sveltekit/server/api-routes/) — +server.tsの詳細
- [キャッシュ戦略](/sveltekit/optimization/caching/) — パフォーマンス最適化
