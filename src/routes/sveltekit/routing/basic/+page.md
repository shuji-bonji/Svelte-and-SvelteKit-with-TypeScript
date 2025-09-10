---
title: 基本ルーティング
description: SvelteKitの基本ルーティングをTypeScriptで学ぶ。ファイルベースルーティング、静的ルート、レイアウト、エラーハンドリングの実装方法を解説
---

<script>
  import Mermaid from '$lib/components/Mermaid.svelte';
  
  const urlMappingDiagram = `graph LR
    subgraph "ファイルシステム"
      Root["src/routes/"]
      Layout["+layout.svelte"]
      Home["+page.svelte"]
      About["about/+page.svelte"]
      Blog["blog/+page.svelte"]
      BlogNew["blog/new/+page.svelte"]
      Contact["contact/+page.svelte"]
    end

    subgraph "URL構造"
      URL1["/"]
      URL2["/about"]
      URL3["/blog"]
      URL4["/blog/new"]
      URL5["/contact"]
    end

    Home --> URL1
        
    Layout -.->|"全ページに適用"| URL1
    Layout -.->|"全ページに適用"| URL2
    Layout -.->|"全ページに適用"| URL3
    Layout -.->|"全ページに適用"| URL4
    Layout -.->|"全ページに適用"| URL5

    About --> URL2
    Blog --> URL3
    BlogNew --> URL4
    Contact --> URL5
    
    style Layout fill:#ffe0b2,stroke:#ff6f00,color:#000
    style Home fill:#e3f2fd,stroke:#1976d2,color:#000
    style About fill:#e3f2fd,stroke:#1976d2,color:#000
    style Blog fill:#e3f2fd,stroke:#1976d2,color:#000
    style BlogNew fill:#e3f2fd,stroke:#1976d2,color:#000
    style Contact fill:#e3f2fd,stroke:#1976d2,color:#000`;
    
  const layoutInheritanceDiagram = `graph TB
    subgraph "レイアウト階層"
      direction LR
      RootLayout["/+layout.svelte<br/>ヘッダー・フッター"]
      Header["$lib/components/<br/>Header.svelte<br/>ヘッダー"]
      Footer["$lib/components/<br/>Footer.svelte<br/>フッター"]
      BlogLayout["/blog/+layout.svelte<br/>サイドバー追加"]
      Sidebar["$lib/components/<br/>Sidebar.svelte<br/>サイドバー"]
      BlogPage["/blog/+page.svelte<br/>記事一覧"]
      BlogNewPage["/blog/new/+page.svelte<br/>新規投稿"]
    end
    
    RootLayout <--- Header
    RootLayout <--- Footer
    BlogLayout <--- Sidebar
    RootLayout --> BlogLayout
    BlogLayout --> BlogPage
    BlogLayout --> BlogNewPage
    
    style RootLayout fill:#fff3e0,stroke:#f57c00,color:#000
    style BlogLayout fill:#e8f5e9,stroke:#388e3c,color:#000
    style BlogPage fill:#e3f2fd,stroke:#1976d2,color:#000
    style BlogNewPage fill:#e3f2fd,stroke:#1976d2,color:#000`;
    
  const errorHandlingFlow = `sequenceDiagram
    participant User as ユーザー
    participant Browser as ブラウザ
    participant SvelteKit
    participant PageLoad as +page.ts
    participant ErrorPage as +error.svelte
    
    User->>Browser: 存在しないページへアクセス
    Browser->>SvelteKit: /invalid-page リクエスト
    SvelteKit->>PageLoad: ルート解決を試みる
    PageLoad--xSvelteKit: 404エラー発生
    
    SvelteKit->>ErrorPage: エラーページ表示
    Note over ErrorPage: 最も近い+error.svelte
    ErrorPage->>ErrorPage: status: 404<br/>message: "Not Found"
    ErrorPage-->>Browser: カスタムエラーページ
    Browser->>User: エラー表示
    
    rect rgba(220, 38, 127, 0.1)
        Note over ErrorPage: エラーは階層を遡って処理される
    end`;
</script>

SvelteKitはファイルシステムベースのルーティングを採用しています。`src/routes`ディレクトリ内のファイル構造がそのままURLパスになります。この直感的な仕組みにより、ディレクトリとファイルを作成するだけで新しいページを追加できます。

## ディレクトリ構造とURLの対応

`src/routes`ディレクトリの構造がそのままWebサイトのURL構造になります。この仕組みにより、URLパスの設計と管理が直感的になり、プロジェクトの構造を見るだけでサイトマップが理解できます。

### 基本的なマッピング

ディレクトリ構造とURLパスの対応関係を示します。各ファイルがどのURLにマッピングされるかを理解することで、効率的なルート設計が可能になります。

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

### ファイルシステムとURLのマッピング

以下の図は、ファイル構造がどのようにURLに変換されるかを視覚的に示しています。

<Mermaid diagram={urlMappingDiagram} />

## ページの作成

新しいページを作成するには、適切なディレクトリに`+page.svelte`ファイルを配置します。各ページはSvelteコンポーネントとして実装され、TypeScriptによる型安全な開発が可能です。

### 基本的なページコンポーネント

シンプルなページコンポーネントの実装例です。TypeScriptの型定義により、Load関数から渡されるデータの型安全性が保証されます。

```svelte
<!-- src/routes/about/+page.svelte -->
<script lang="ts">
  import type { PageData } from './$types';
  
  // Load関数からのデータ（もしあれば）
  let { data }: { data: PageData } = $props();
</script>

<h1>About Page</h1>
<p>This page is accessible at /about</p>
```

### TypeScriptでのデータ取得

Load関数を使用してページに必要なデータを取得します。返り値は自動的に型推論され、対応するSvelteコンポーネントで型安全に利用できます。

:::info[Load関数とは？]
Load関数は、ページやレイアウトのレンダリング前に実行される特別な関数です。APIからのデータ取得、データベースへのアクセス、計算処理などを行い、その結果をコンポーネントに渡します。サーバーサイドとクライアントサイドの両方で動作し、SvelteKitが自動的に最適な実行環境を選択します。

詳しくは [Load関数の基礎](/sveltekit/data-loading/basic/) で解説しています。
:::

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

Load関数から受け取ったデータをページで使用する例です。上記のLoad関数で返した`title`と`description`を、このSvelteコンポーネントで受け取り、`<h1>`タグと`<p>`タグに展開して表示しています。`PageData`型により、`data.title`や`data.description`へのアクセスが型安全に保証され、タイプミスや存在しないプロパティへのアクセスを防ぎます。

```svelte
<!-- src/routes/about/+page.svelte -->
<script lang="ts">
  import type { PageData } from './$types';
  
  let { data }: { data: PageData } = $props();
</script>

<h1>{data.title}</h1>
<p>{data.description}</p>
```

## レイアウト

レイアウトファイル（`+layout.svelte`）を使用することで、複数のページで共通のUI要素（ヘッダー、フッター、サイドバーなど）を効率的に管理できます。レイアウトは階層的に継承され、セクション別の設定も可能です。

### レイアウトの継承関係

以下の図は、レイアウトがどのように階層的に継承されるかを示しています。

<Mermaid diagram={layoutInheritanceDiagram} />

### グローバルレイアウト

すべてのページで共通して使用するレイアウトを定義します。`{@render children?.()}`で子ページのコンテンツがレンダリングされ、ヘッダーやフッターなどの共通要素を一元管理できます。

```svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import '../app.css';
  import Header from '$lib/components/Header.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import type { Snippet } from 'svelte';
  
  let { children }: { children?: Snippet } = $props();
</script>

<div class="app">
  <Header />
  
  <main>
    <!-- 子ページがここにレンダリングされる -->
    {@render children?.()}
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

特定のセクションでのみ使用するレイアウトを作成できます。この例では、ブログセクション専用のサイドバー付きレイアウトを実装しています。

```svelte
<!-- src/routes/blog/+layout.svelte -->
<script lang="ts">
  import BlogSidebar from '$lib/components/BlogSidebar.svelte';
  import type { Snippet } from 'svelte';
  
  let { children }: { children?: Snippet } = $props();
</script>

<div class="blog-layout">
  <aside>
    <BlogSidebar />
  </aside>
  
  <article>
    <!-- blog配下のページがここに表示される -->
    {@render children?.()}
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

レイアウトレベルでのデータ取得例です。ここで取得したデータは、すべての子ページで利用可能になり、ナビゲーションメニューなどの共通データを効率的に管理できます。

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

SvelteKitは堅牢なエラーハンドリングシステムを提供しています。`+error.svelte`ファイルでカスタムエラーページを定義し、404や500エラーなどの状況に応じた適切なユーザー体験を提供できます。

### エラー処理のフロー

以下の図は、エラーが発生した際のSvelteKitの処理フローを示しています。

<Mermaid diagram={errorHandlingFlow} />

### カスタムエラーページ

HTTPステータスコードに応じて適切なエラーメッセージを表示するカスタムエラーページの実装例です。`$page`ストアからエラー情報を取得し、ユーザーフレンドリーなメッセージを表示します。

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

Load関数内でエラーを発生させる方法です。`error`関数を使用して適切なHTTPステータスコードとメッセージを指定することで、カスタムエラーページに情報が渡されます。

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

画像、フォント、PDFなどの静的ファイルは`static`ディレクトリに配置します。これらのファイルはビルドプロセスを経ずに直接公開され、ルートパスからアクセス可能になります。

### publicディレクトリ

`static`ディレクトリ内のファイルは、ルートパスから直接アクセスできます。ビルドプロセスを経ずにそのまま公開されるため、画像やアイコンなどの静的リソースに最適です。

```
static/
├── favicon.png         → /favicon.png
├── robots.txt          → /robots.txt
└── images/
    └── logo.svg        → /images/logo.svg
```

#### 使用例

HTML内で静的ファイルを参照する際は、ルートパスからの絶対パスを指定します。

```svelte
<img src="/images/logo.svg" alt="Logo" />
<link rel="icon" href="/favicon.png" />
```

## ナビゲーション

SvelteKitは高速なクライアントサイドナビゲーションを提供します。通常の`<a>`タグを使用するだけで、自動的にSPAのような滑らかな画面遷移が実現され、プリフェッチによるパフォーマンス最適化も可能です。

### リンクの作成

ナビゲーションメニューの実装例です。`$page`ストアから現在のURL情報を取得し、アクティブなリンクをハイライト表示します。`class:`ディレクティブで条件付きクラスを適用しています。

```svelte
<script lang="ts">
  import { page } from '$app/stores';
  
  // 現在のパスを取得
  let currentPath = $derived($page.url.pathname);
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
<Expansion title="ナビゲーションコンポーネントの実装例">

  ### ナビゲーションコンポーネントの実装

  再利用可能なナビゲーションコンポーネントとして実装する場合の、具体的なファイル構成例です。

  ```
  src/
  ├── lib/
  │   └── components/
  │       └── Navigation.svelte   # ナビゲーションコンポーネント
  └── routes/
      ├── +layout.svelte          # ルートレイアウトで使用
      ├── +page.svelte            # ホームページ
      ├── about/
      │   └── +page.svelte        # About ページ
      └── blog/
          ├── +page.svelte        # ブログ一覧
          └── [slug]/
              └── +page.svelte    # 個別記事
  ```

  #### Navigation.svelte の実装
  ```svelte
  <!-- src/lib/components/Navigation.svelte -->
  <script lang="ts">
    import { page } from '$app/stores';
    
    type NavItem = {
      href: string;
      label: string;
      matchPath?: string; // パスマッチング用（オプション）
    };
    
    const navItems: NavItem[] = [
      { href: '/', label: 'Home' },
      { href: '/about', label: 'About' },
      { href: '/blog', label: 'Blog', matchPath: '/blog' }
    ];
    
    let currentPath = $derived($page.url.pathname);
    
    function isActive(item: NavItem): boolean {
      if (item.href === '/') {
        return currentPath === '/';
      }
      return currentPath.startsWith(item.matchPath || item.href);
    }
  </script>

  <nav>
    {#each navItems as item}
      <a 
        href={item.href} 
        class:active={isActive(item)}
        aria-current={isActive(item) ? 'page' : undefined}
      >
        {item.label}
      </a>
    {/each}
  </nav>
  ```

  #### レイアウトでの使用
  ```svelte
  <!-- src/routes/+layout.svelte -->
  <script lang="ts">
    import Navigation from '$lib/components/Navigation.svelte';
    import type { Snippet } from 'svelte';
    
    let { children }: { children?: Snippet } = $props();
  </script>

  <header>
    <Navigation />
  </header>

  <main>
    {@render children?.()}
  </main>
  ```
</Expansion>

### プリフェッチ

ページの事前読み込みでパフォーマンスを向上させます。`data-sveltekit-preload-data`属性を使用して、プリフェッチのタイミングを制御できます。ユーザーのインタラクションに応じて最適な戦略を選択しましょう。

```svelte
<!-- ホバー時に事前読み込み -->
<a href="/about" data-sveltekit-preload-data="hover">About</a>

<!-- 表示されたら即座に読み込み -->
<a href="/blog" data-sveltekit-preload-data="eager">Blog</a>

<!-- タップ時に読み込み（モバイル向け） -->
<a href="/contact" data-sveltekit-preload-data="tap">Contact</a>
```

## ページオプション（基本）

各ページの動作を制御するための基本的な設定オプションを紹介します。

```typescript
// src/routes/about/+page.ts
export const prerender = true;         // ビルド時に静的生成
export const ssr = true;                // SSR有効（デフォルト）
export const csr = true;                // CSR有効（デフォルト）
export const trailingSlash = 'always'; // URLの末尾に/を付ける
```

### よく使う設定

| 設定 | 説明 | デフォルト値 |
|------|------|------------|
| `prerender` | ビルド時に静的HTMLを生成 | `false` |
| `ssr` | サーバーサイドレンダリング | `true` |
| `csr` | クライアントサイドレンダリング | `true` |
| `trailingSlash` | URL末尾のスラッシュ処理 | `'never'` |

:::info[詳細な設定について]
条件付きプリレンダリング、エッジランタイム設定、キャッシュ制御などの高度な設定については、[高度なルーティング - ルートアノテーション](/sveltekit/routing/advanced/#ルートアノテーション)で詳しく解説しています。
:::

## 実践例：ブログサイトの構築

ここまで学んだ基本ルーティングの知識を活用して、実際のブログサイトを構築してみましょう。記事一覧、個別記事ページ、共通レイアウトなど、実践的な実装パターンを紹介します。

### ディレクトリ構造

実際のブログサイトのファイル構成例です。階層的なレイアウト、動的ルーティング（`[slug]`）、データ取得用の`.ts`ファイルなど、実践的な構成を示しています。

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

ブログ記事の一覧を取得して表示するページの実装例です。TypeScriptのインターフェースでブログ記事の型を定義し、APIから取得したデータを型安全に扱います。

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

取得したブログ記事を一覧表示するSvelteコンポーネントです。`{#each}`ブロックで記事をループ処理し、日付のフォーマットも日本語形式に変換しています。

```svelte
<!-- src/routes/blog/+page.svelte -->
<script lang="ts">
  import type { PageData } from './$types';
  
  let { data }: { data: PageData } = $props();
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

:::info[完全な実装例を見る]
実際に動作するブログシステムの実装例を2つ用意しています。

- **[ブログシステム（基礎）](/examples/blog-system/)** - 静的データを使った基本的なルーティング実装
- **[Markdownブログ（発展）](/examples/markdown-blog/)** - 動的ルーティング（`[slug]`）とMarkdownファイルの自動読み込み

これらの実装例では、この章で学んだ基本ルーティングの概念が実際にどのように使われているかを確認できます。
:::

## トラブルシューティング

開発中によく遭遇する問題とその解決方法をまとめました。404エラー、型エラー、ルーティングが機能しない場合など、具体的な対処法を説明します。

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

:::info[関連情報]
- **ファイルの実行環境**: 各ファイルがどこで実行されるかは[プロジェクト構造](/sveltekit/basics/project-structure/#レンダリングモード別の実行タイミング)を参照
- **レンダリング戦略**: SSR/SSG/SPAの選択は[レンダリング戦略](/sveltekit/basics/rendering-strategies/)を参照
- **特殊ファイルの詳細**: `+page`、`+layout`等の詳細は[特殊ファイルシステム](/sveltekit/basics/file-system/)を参照
:::

## 次のステップ

- [動的ルーティング](/sveltekit/routing/dynamic/) - 動的なURLパラメータの扱い方
- [特殊ファイルシステム](/sveltekit/basics/file-system/) - 特殊ファイルの詳細
- [Load関数とデータフェッチング](/sveltekit/data-loading/) - データ取得の詳細