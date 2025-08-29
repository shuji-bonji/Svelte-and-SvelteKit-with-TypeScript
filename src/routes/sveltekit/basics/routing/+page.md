---
title: ルーティング詳解
description: SvelteKitのルーティングシステムを詳細に解説 - 基本から高度な機能まで
---

SvelteKitのルーティングシステムは、ファイルベースの直感的な設計でありながら、エンタープライズレベルのアプリケーションに必要な高度な機能を全て備えています。このガイドでは、基本的なルーティングから動的ルート、レイアウト、エラーハンドリングまで、実践的なTypeScriptコード例とともに完全解説します。

## 特殊ファイル一覧

SvelteKitでは、`+`プレフィックスを持つ特殊なファイルがルーティングとレンダリングを制御します。これらのファイルは決められた役割を持ち、サーバーサイドとクライアントサイドで適切に実行されます。ファイル名によって実行環境が決まるため、秘密情報の取り扱いやパフォーマンス最適化を意識した設計が可能です。

| ファイル名 | 実行環境 | 役割 | 用途 |
|-----------|---------|------|------|
| `+page.svelte` | ブラウザ | ページUI | ページのUIコンポーネント |
| `+page.ts` | サーバー＆ブラウザ | ユニバーサルload | 両環境で実行可能なデータ取得 |
| `+page.server.ts` | サーバーのみ | サーバーload & actions | DB接続、秘密情報、フォーム処理 |
| `+layout.svelte` | ブラウザ | 共通レイアウト | ナビゲーション、ヘッダー、フッター |
| `+layout.ts` | サーバー＆ブラウザ | レイアウトデータ | 共通データの取得 |
| `+layout.server.ts` | サーバーのみ | サーバーレイアウトデータ | 認証チェック、権限確認 |
| `+server.ts` | サーバーのみ | APIエンドポイント | REST API、Webhooks |
| `+error.svelte` | ブラウザ | エラーページ | カスタムエラー表示 |

:::tip[使い分けのポイント]
- **`.ts`** - クライアントでも実行可能（公開情報のみ）
- **`.server.ts`** - サーバー限定（秘密情報、DB接続可）
- **`.svelte`** - UI表示用
:::

## ページルーティング編

ページの作成からレイアウト、エラーハンドリングまで、SvelteKitのページルーティングの基本から応用までを学びます。

### 基本的なルーティング

SvelteKitはファイルシステムベースのルーティングを採用しています。`src/routes`ディレクトリ内のファイル構造がそのままURLパスになります。この直感的な仕組みにより、ディレクトリとファイルを作成するだけで新しいページを追加でき、ルーティング設定ファイルを別途管理する必要がありません。

### ディレクトリ構造とURLの対応

```
src/routes/
├── +page.svelte              → /
├── +layout.svelte            → 全ページ共通レイアウト
├── about/
│   └── +page.svelte          → /about
├── blog/
│   ├── +page.svelte          → /blog
│   ├── [slug]/
│   │   └── +page.svelte      → /blog/:slug (動的)
│   └── new/
│       └── +page.svelte      → /blog/new
├── products/
│   ├── +page.svelte          → /products
│   ├── +page.ts              → /products (データ取得)
│   └── [id]/
│       ├── +page.svelte      → /products/:id
│       └── +page.ts          → /products/:id (データ取得)
└── api/
    └── posts/
        └── +server.ts        → /api/posts (APIエンドポイント)
```

:::tip[重要なルール]
- `+page.svelte` がないディレクトリはルートとして認識されません
- `+layout.svelte` は子ルートに継承されます
- `+server.ts` はAPIエンドポイントになります（ページではない）
:::

### ページの作成

```typescript
// src/routes/about/+page.svelte
<script lang="ts">
  // このページは /about でアクセス可能
</script>

<h1>About Page</h1>
```

### ルートパラメータの型安全な取得

```typescript
// src/routes/+page.ts
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, url }) => {
  // URLパラメータを型安全に取得
  const searchParams = url.searchParams;
  const query = searchParams.get('q');
  
  return {
    query
  };
};
```

### 動的ルーティング

URLの一部を変数として扱い、動的にコンテンツを生成できる機能です。ブログ記事、ユーザープロフィール、商品詳細ページなど、同じレイアウトで異なるデータを表示する場合に活用します。パラメータは自動的に型付けされるため、TypeScriptの恩恵を最大限に受けられます。


### 動的ルートパターン一覧

```
src/routes/
├── posts/
│   └── [id]/                 → /posts/123, /posts/abc
│       └── +page.svelte
├── users/
│   └── [username]/           → /users/john, /users/jane
│       ├── +page.svelte
│       └── posts/
│           └── [postId]/     → /users/john/posts/456
│               └── +page.svelte
├── docs/
│   └── [...slug]/            → /docs/guide/intro, /docs/api/ref/auth
│       └── +page.svelte
├── products/
│   └── [[category]]/         → /products, /products/electronics
│       └── +page.svelte
└── items/
    └── [id=integer]/         → /items/123 (数値のみマッチ)
        └── +page.svelte
```

:::info[動的ルートの種類]
- `[param]` - 必須パラメータ
- `[...param]` - Rest パラメータ（複数セグメント）
- `[[param]]` - オプショナルパラメータ
- `[param=matcher]` - マッチャー付きパラメータ
:::

### 基本的な動的ルート

動的ルートは角括弧`[]`を使用して定義します。

```typescript
// src/routes/posts/[id]/+page.ts
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
  // params.id が自動的に型付けされる
  const postId = params.id;
  
  const response = await fetch(`/api/posts/${postId}`);
  const post = await response.json();
  
  return {
    post
  };
};
```

```svelte
<!-- src/routes/posts/[id]/+page.svelte -->
<script lang="ts">
  import type { PageData } from './$types';
  
  export let data: PageData;
</script>

<article>
  <h1>{data.post.title}</h1>
  <p>{data.post.content}</p>
</article>
```

### 複数の動的セグメント

```typescript
// src/routes/users/[userId]/posts/[postId]/+page.ts
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
  // 両方のパラメータが型安全
  const { userId, postId } = params;
  
  return {
    userId,
    postId
  };
};
```

### Rest Parameters（可変長パラメータ）

`[...slug]`を使用して、複数のパスセグメントをキャプチャ

```typescript
// src/routes/docs/[...slug]/+page.ts
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
  // /docs/guide/routing/advanced → slug = 'guide/routing/advanced'
  const path = params.slug;
  
  const content = await loadMarkdownFile(path);
  
  return {
    content
  };
};
```

### オプショナルパラメータ

`[[optional]]`で囲むことで、パラメータをオプショナルにできます。

```typescript
// src/routes/products/[[category]]/+page.ts
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
  // /products → category = undefined
  // /products/electronics → category = 'electronics'
  const category = params.category;
  
  const products = category 
    ? await fetchProductsByCategory(category)
    : await fetchAllProducts();
  
  return {
    products,
    category
  };
};
```

## 高度なルーティングパターン

基本的なルーティングを超えて、より複雑な要件に対応するための高度な機能群です。パラメータの検証、レイアウトの組み合わせ、条件付きルーティングなど、実践的なアプリケーション開発で必要となる機能を提供します。

### ルートマッチャー

パラメータのバリデーションを行うカスタムマッチャー

```typescript
// src/params/integer.ts
import type { ParamMatcher } from '@sveltejs/kit';

export const match: ParamMatcher = (param) => {
  return /^\d+$/.test(param);
};
```

```typescript
// src/routes/posts/[id=integer]/+page.ts
// idパラメータは整数のみ受け付ける
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
  const id = parseInt(params.id, 10); // 安全に数値に変換
  // ...
};
```

### ルートグループ（レイアウトグループ）

括弧`()`で囲まれたディレクトリは、URLパスに影響を与えずにルートを論理的にグループ化できます。

#### 基本的な使い方

```
src/routes/
├── (app)/                    # URLパスには含まれない
│   ├── +layout.svelte        # アプリケーションレイアウト
│   ├── dashboard/            # /dashboard
│   │   └── +page.svelte
│   └── settings/             # /settings
│       └── +page.svelte
├── (marketing)/              # URLパスには含まれない
│   ├── +layout.svelte        # マーケティングサイトレイアウト
│   ├── +page.svelte          # / (ホームページ)
│   └── pricing/              # /pricing
│       └── +page.svelte
```

#### 認証が必要なルートグループ

:::tip[命名規則のベストプラクティス]
- `(authenticated)` or `(protected)` - 認証済みユーザー専用エリア
- `(auth)` - ログイン・登録などの認証関連ページ
- `(public)` - 誰でもアクセス可能なページ
- `(admin)` - 管理者専用エリア

括弧内の名前は自由ですが、チームで統一した命名規則を使用しましょう。
:::

```typescript
// src/routes/(protected)/+layout.server.ts
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
  // localsから認証情報を取得
  const user = await locals.getUser();
  
  if (!user) {
    // 未認証の場合はログインページへリダイレクト
    throw redirect(302, `/login?redirectTo=${url.pathname}`);
  }
  
  return {
    user
  };
};
```

```svelte
<!-- src/routes/(protected)/+layout.svelte -->
<script lang="ts">
  import type { LayoutData } from './$types';
  export let data: LayoutData;
</script>

<div class="authenticated-layout">
  <header>
    <nav>
      <span>Welcome, {data.user.name}!</span>
      <a href="/dashboard">Dashboard</a>
      <a href="/profile">Profile</a>
      <a href="/settings">Settings</a>
      <form method="POST" action="/logout">
        <button type="submit">Logout</button>
      </form>
    </nav>
  </header>
  
  <main>
    <slot />
  </main>
</div>
```

#### 認証ページ専用のルートグループ

```typescript
// src/routes/(auth)/+layout.server.ts
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
  // すでにログイン済みの場合はダッシュボードへ
  const user = await locals.getUser();
  
  if (user && !url.pathname.includes('logout')) {
    throw redirect(302, '/dashboard');
  }
  
  return {};
};
```

```svelte
<!-- src/routes/(auth)/+layout.svelte -->
<div class="auth-layout">
  <!-- シンプルなレイアウト（ヘッダーなし） -->
  <div class="auth-container">
    <img src="/logo.svg" alt="Logo" />
    <slot />
  </div>
</div>

<style>
  .auth-layout {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
  }
  
  .auth-container {
    max-width: 400px;
    width: 100%;
    padding: 2rem;
  }
</style>
```

#### 管理者専用ルートグループ

```typescript
// src/routes/(admin)/+layout.server.ts
import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
  const user = await locals.getUser();
  
  // 管理者権限チェック
  if (!user?.isAdmin) {
    throw error(403, 'Access denied: Admin only');
  }
  
  return {
    user
  };
};
```

#### 複数のルートグループの組み合わせ

```
src/routes/
├── (public)/
│   ├── +layout.svelte        # 公開レイアウト
│   ├── +page.svelte          # /
│   ├── about/                # /about
│   └── contact/              # /contact
├── (auth)/
│   ├── +layout.svelte        # 認証用レイアウト（ヘッダーなし）
│   ├── login/                # /login
│   └── register/             # /register
└── (app)/
    ├── +layout.server.ts     # 認証チェック
    ├── +layout.svelte        # アプリレイアウト
    ├── (user)/
    │   ├── dashboard/        # /dashboard
    │   └── profile/          # /profile
    └── (admin)/
        ├── +layout.server.ts # 管理者権限チェック
        ├── users/            # /users (管理者のみ)
        └── settings/         # /settings (管理者のみ)
```

:::tip[ルートグループの利点]
- **URL構造を変えずに**論理的な整理が可能
- グループごとに異なるレイアウトを適用
- 認証・認可ロジックをグループ単位で実装
- コードベースの保守性向上
:::

### 並列ルート

同じURLで複数のページを条件分岐

```typescript
// src/routes/profile/+page.server.ts
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const user = await locals.getUser();
  
  if (!user) {
    // ゲスト用のページを表示
    return {
      component: 'guest'
    };
  }
  
  // ログインユーザー用のページを表示
  return {
    component: 'member',
    user
  };
};
```

## ネストされたレイアウト

レイアウトファイルを階層的に配置することで、共通UIの継承と再利用を実現します。親レイアウトの内容を子レイアウトが引き継ぎ、段階的にUIを構築できます。これにより、グローバルナビゲーション、セクション固有のサイドバー、ページ固有のコンテンツを効率的に管理できます。

### レイアウトの継承

```svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import type { LayoutData } from './$types';
  export let data: LayoutData;
</script>

<nav>
  <!-- グローバルナビゲーション -->
</nav>

<slot />
```

```svelte
<!-- src/routes/admin/+layout.svelte -->
<script lang="ts">
  import type { LayoutData } from './$types';
  export let data: LayoutData;
</script>

<aside>
  <!-- 管理画面用サイドバー -->
</aside>

<main>
  <slot />
</main>
```

### レイアウトのリセット

`+layout@.svelte`で親レイアウトをリセット

```svelte
<!-- src/routes/fullscreen/+layout@.svelte -->
<!-- ルートレイアウトのみ適用される -->
<slot />
```

## エラーハンドリング

アプリケーションで発生するエラーを適切に処理し、ユーザーフレンドリーなエラーページを表示する仕組みです。404エラー、500エラー、カスタムエラーなど、様々なエラー状況に対応できます。`+error.svelte`ファイルを使用して、階層ごとに異なるエラー表示を実装できます。

### エラーページの実装

```svelte
<!-- src/routes/+error.svelte -->
<script lang="ts">
  import { page } from '$app/stores';
  
  $: status = $page.status;
  $: message = $page.error?.message || 'エラーが発生しました';
</script>

<div class="error-page">
  <h1>{status}</h1>
  <p>{message}</p>
  
  {#if status === 404}
    <p>お探しのページは見つかりませんでした。</p>
  {:else if status === 500}
    <p>サーバーエラーが発生しました。</p>
  {/if}
  
  <a href="/">ホームに戻る</a>
</div>
```

### カスタムエラーのスロー

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

### プログラマティックナビゲーション

JavaScriptコードから直接ページ遷移を制御する機能です。フォーム送信後のリダイレクト、条件に応じた動的な遷移、プリフェッチによる事前読み込みなど、インタラクティブなナビゲーションを実現します。`$app/navigation`モジュールが提供する関数群を使用します。

#### goto関数による遷移

```svelte
<script lang="ts">
  import { goto } from '$app/navigation';
  
  async function handleSubmit() {
    const result = await saveData();
    
    if (result.success) {
      // プログラマティックに遷移
      await goto('/success', { 
        replaceState: true,  // ブラウザ履歴を置き換え
        invalidateAll: true  // 全てのデータを再取得
      });
    }
  }
</script>
```

#### prefetch による事前読み込み

```svelte
<script lang="ts">
  import { prefetch, prefetchRoutes } from '$app/navigation';
  
  // 特定のルートを事前読み込み
  async function preloadRoute() {
    await prefetch('/posts/important');
  }
  
  // 複数のルートを一度に読み込み
  async function preloadMultiple() {
    await prefetchRoutes(['/about', '/contact']);
  }
</script>

<!-- ホバー時に自動で事前読み込み -->
<a href="/posts/123" data-sveltekit-preload-data>
  記事を読む
</a>
```

### ルートアノテーション

ページごとにレンダリング方法やキャッシュ戦略を細かく制御するための設定です。静的生成（プリレンダリング）、サーバーサイドレンダリング、クライアントサイドレンダリングの有効/無効を個別に設定でき、パフォーマンスとSEOの最適化を図れます。

#### プリレンダリングの設定

```typescript
// src/routes/blog/+page.ts
export const prerender = true; // ビルド時に静的生成
export const ssr = true;        // サーバーサイドレンダリング有効
export const csr = true;        // クライアントサイドレンダリング有効
```

#### トレイリングスラッシュの制御

```typescript
// src/routes/+layout.ts
export const trailingSlash = 'always'; // 'never', 'always', 'ignore'
```

## API編

SvelteKitでRESTful APIやWebhookエンドポイントを構築する方法を学びます。`+server.ts`ファイルを使用してHTTPメソッドに対応した処理を実装し、JSONレスポンスを返すAPIサーバーを構築できます。

### APIルートの基本

`+server.ts`ファイルを使用してAPIエンドポイントを作成します。このファイルはサーバーサイドでのみ実行され、HTTPメソッド（GET、POST、PUT、DELETE等）に対応した関数をエクスポートすることで、RESTful APIを実装できます。

#### ページルートとAPIルートの違い

```
src/routes/
├── posts/
│   ├── +page.svelte          → GET /posts (HTMLページ)
│   ├── +page.ts               → ページ用のデータ取得
│   └── [id]/
│       └── +page.svelte       → GET /posts/123 (HTMLページ)
├── api/
│   └── posts/
│       ├── +server.ts         → /api/posts (JSONレスポンス)
│       │                        GET: 一覧取得
│       │                        POST: 新規作成
│       └── [id]/
│           └── +server.ts     → /api/posts/123 (JSONレスポンス)
│                                GET: 詳細取得
│                                PUT: 更新
│                                DELETE: 削除
```

:::tip[アクセス方法の違い]
**ページルート（+page.svelte）**
- ブラウザで直接アクセス: `https://example.com/posts`
- HTMLページが返される
- ナビゲーションで遷移可能

**APIルート（+server.ts）**
- fetchでアクセス: `fetch('/api/posts')`
- JSONデータが返される
- 外部からもアクセス可能（CORS設定次第）
:::

#### 基本的なAPI実装

```typescript
// src/routes/api/posts/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// GET /api/posts
export const GET: RequestHandler = async ({ url, locals }) => {
  const limit = Number(url.searchParams.get('limit')) || 10;
  const offset = Number(url.searchParams.get('offset')) || 0;
  
  const posts = await db.post.findMany({
    take: limit,
    skip: offset,
    orderBy: { createdAt: 'desc' }
  });
  
  return json(posts);
};

// POST /api/posts
export const POST: RequestHandler = async ({ request, locals }) => {
  const session = await locals.getSession();
  
  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  const data = await request.json();
  
  // バリデーション
  if (!data.title || !data.content) {
    return json({ error: 'Missing required fields' }, { status: 400 });
  }
  
  const post = await db.post.create({
    data: {
      ...data,
      authorId: session.userId
    }
  });
  
  return json(post, { status: 201 });
};
```

### APIの使用とクライアント実装

作成したAPIエンドポイントをSvelteコンポーネントから呼び出す方法を示します。fetchを使用してデータの取得、作成、更新、削除を行う実装パターンを学びます。

#### クライアント側での使用例

```svelte
<!-- src/routes/posts/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  
  let posts = [];
  let newPostTitle = '';
  
  // GET: 投稿一覧を取得
  async function loadPosts() {
    const response = await fetch('/api/posts');
    posts = await response.json();
  }
  
  // POST: 新規投稿を作成
  async function createPost() {
    const response = await fetch('/api/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: newPostTitle,
        content: 'New post content'
      })
    });
    
    if (response.ok) {
      const newPost = await response.json();
      posts = [...posts, newPost];
      newPostTitle = '';
    }
  }
  
  // DELETE: 投稿を削除
  async function deletePost(id: string) {
    const response = await fetch(`/api/posts/${id}`, {
      method: 'DELETE'
    });
    
    if (response.ok) {
      posts = posts.filter(p => p.id !== id);
    }
  }
  
  onMount(loadPosts);
</script>

<ul>
  {#each posts as post}
    <li>
      {post.title}
      <button onclick={() => deletePost(post.id)}>削除</button>
    </li>
  {/each}
</ul>

<input bind:value={newPostTitle} placeholder="新しい投稿のタイトル" />
<button onclick={createPost}>投稿を作成</button>
```

#### 動的APIルート

```typescript
// src/routes/api/posts/[id]/+server.ts
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// GET /api/posts/:id
export const GET: RequestHandler = async ({ params }) => {
  const post = await db.post.findUnique({
    where: { id: params.id }
  });
  
  if (!post) {
    throw error(404, 'Post not found');
  }
  
  return json(post);
};

// PUT /api/posts/:id
export const PUT: RequestHandler = async ({ params, request, locals }) => {
  const session = await locals.getSession();
  const data = await request.json();
  
  const post = await db.post.findUnique({
    where: { id: params.id }
  });
  
  if (!post) {
    throw error(404, 'Post not found');
  }
  
  if (post.authorId !== session?.userId) {
    throw error(403, 'Forbidden');
  }
  
  const updated = await db.post.update({
    where: { id: params.id },
    data
  });
  
  return json(updated);
};

// DELETE /api/posts/:id
export const DELETE: RequestHandler = async ({ params, locals }) => {
  const session = await locals.getSession();
  
  if (!session?.isAdmin) {
    throw error(403, 'Admin only');
  }
  
  await db.post.delete({
    where: { id: params.id }
  });
  
  return new Response(null, { status: 204 });
};
```

### 外部からのアクセスとCORS

外部のクライアントやサービスからAPIを利用する場合の設定方法です。CORS（Cross-Origin Resource Sharing）の設定により、異なるドメインからのアクセスを制御できます。

#### cURLでのAPIアクセス例

```bash
# GET: 投稿一覧を取得
curl https://example.com/api/posts

# POST: 新規投稿を作成（認証トークン付き）
curl -X POST https://example.com/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title":"New Post","content":"Content here"}'

# PUT: 投稿を更新
curl -X PUT https://example.com/api/posts/123 \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated Title"}'

# DELETE: 投稿を削除
curl -X DELETE https://example.com/api/posts/123
```

#### CORS設定

```typescript
// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  const response = await resolve(event);
  
  // APIルートにCORSヘッダーを追加
  if (event.url.pathname.startsWith('/api')) {
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }
  
  return response;
};
```

:::warning[セキュリティの考慮]
プロダクション環境では、`Access-Control-Allow-Origin`に`*`を使用せず、信頼できるドメインのみを指定してください。
:::

## 実践編

実際のアプリケーション開発でよく使用されるパターンを、完全なコード例とともに紹介します。ページネーション、認証ガード、並列データ取得など、すぐに活用できる実装パターンを学べます。このセクションでは、これまで学んだ技術を組み合わせて実践的なアプリケーションを構築します。

### ページネーション付きリスト

```typescript
// src/routes/posts/+page.ts
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ url, fetch }) => {
  const page = Number(url.searchParams.get('page')) || 1;
  const limit = 10;
  
  const response = await fetch(`/api/posts?page=${page}&limit=${limit}`);
  const { posts, total } = await response.json();
  
  return {
    posts,
    pagination: {
      current: page,
      total: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1
    }
  };
};
```

```svelte
<!-- src/routes/posts/+page.svelte -->
<script lang="ts">
  import type { PageData } from './$types';
  
  export let data: PageData;
</script>

<ul>
  {#each data.posts as post}
    <li>
      <a href="/posts/{post.id}">{post.title}</a>
    </li>
  {/each}
</ul>

<nav aria-label="ページネーション">
  {#if data.pagination.hasPrev}
    <a href="?page={data.pagination.current - 1}">前へ</a>
  {/if}
  
  <span>{data.pagination.current} / {data.pagination.total}</span>
  
  {#if data.pagination.hasNext}
    <a href="?page={data.pagination.current + 1}">次へ</a>
  {/if}
</nav>
```

### 認証が必要なルート

```typescript
// src/routes/(authenticated)/+layout.server.ts
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
  const session = await locals.getSession();
  
  if (!session) {
    throw redirect(303, '/login');
  }
  
  return {
    user: session.user
  };
};
```

## パフォーマンス最適化

ルーティングとデータ取得を最適化し、高速なページ遷移とレスポンスを実現する技術です。並列データ取得、ストリーミングSSR、コード分割など、モダンなWeb開発のベストプラクティスを活用してユーザー体験を向上させます。

### データの並列読み込み

```typescript
// src/routes/dashboard/+page.ts
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, parent }) => {
  // 親レイアウトのデータを待つ
  const parentData = await parent();
  
  // 並列でデータを取得
  const [stats, activities, notifications] = await Promise.all([
    fetch('/api/stats').then(r => r.json()),
    fetch('/api/activities').then(r => r.json()),
    fetch('/api/notifications').then(r => r.json())
  ]);
  
  return {
    ...parentData,
    stats,
    activities,
    notifications
  };
};
```

### ストリーミングSSR

```typescript
// src/routes/feed/+page.server.ts
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
  // 即座に返すデータ
  const user = await fetch('/api/user').then(r => r.json());
  
  // ストリーミングで後から送信
  const posts = fetch('/api/feed')
    .then(r => r.json())
    .catch(() => []);
  
  return {
    user,
    streamed: {
      posts
    }
  };
};
```

## 高度なルーティングテクニック

エンタープライズレベルのアプリケーションで必要となる、より洗練されたルーティング技術です。条件付きリダイレクト、ミドルウェア処理、動的インポートなど、複雑な要件に対応するための実装パターンを紹介します。

### 条件付きリダイレクト

```typescript
// src/routes/+page.server.ts
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, cookies }) => {
  const user = await locals.getUser();
  
  // ユーザーの状態に応じて異なるページへリダイレクト
  if (user) {
    // 初回ログインの場合
    if (!user.hasCompletedOnboarding) {
      throw redirect(303, '/onboarding');
    }
    // 通常のユーザー
    throw redirect(303, '/dashboard');
  }
  
  // 未認証ユーザーはランディングページを表示
  return {};
};
```

### ミドルウェア的な処理（Hooks経由）

```typescript
// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  // 全てのルートで実行される前処理
  const session = await getSessionFromCookie(event.cookies.get('session'));
  
  // localsに認証情報を設定
  event.locals.user = session?.user || null;
  
  // 保護されたルートのチェック
  if (event.url.pathname.startsWith('/admin')) {
    if (!session?.user?.isAdmin) {
      return new Response('Forbidden', { status: 403 });
    }
  }
  
  // レスポンスを処理
  const response = await resolve(event);
  
  // 全てのルートで実行される後処理
  response.headers.set('X-Frame-Options', 'DENY');
  
  return response;
};
```

### 動的インポートとコード分割

```svelte
<!-- src/routes/heavy-component/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  
  let HeavyComponent: any;
  
  onMount(async () => {
    // 必要時のみコンポーネントをロード
    const module = await import('$lib/components/HeavyComponent.svelte');
    HeavyComponent = module.default;
  });
</script>

{#if HeavyComponent}
  <svelte:component this={HeavyComponent} />
{:else}
  <p>Loading...</p>
{/if}
```

## トラブルシューティング

ルーティング設定でよく遭遇する問題と、その解決方法をまとめました。404エラー、型エラー、リダイレクトループなど、開発中に発生しやすい問題への対処法を具体的に説明します。

### よくあるエラーと解決方法

:::warning[404エラーが発生する]
- ファイル名が正しいか確認（`+page.svelte`、`+layout.svelte`）
- 動的パラメータの形式が正しいか（`[id]`、`[[optional]]`）
- ルートマッチャーが適切に動作しているか
- ルートグループ`()`が誤ってURLパスに含まれていないか
:::

:::tip[型エラーの解決]
`$types`の自動生成を待つ
```bash
npm run dev
# または
npm run check
```
:::

:::caution[リダイレクトループ]
レイアウトでのリダイレクト時は、無限ループを避ける条件を必ず設定
```typescript
if (!session && !url.pathname.startsWith('/login')) {
  throw redirect(303, '/login');
}
```
:::

:::info[ルートグループのデバッグ]
ルートグループが期待通り動作しない場合
```bash
# ビルド結果を確認
npm run build
# 生成されたルートを確認
ls -la .svelte-kit/generated/client/app.js
```
:::

## まとめ

SvelteKitのルーティングシステムは、
- **直感的**：ファイルベースで理解しやすい
- **型安全**：TypeScriptで完全な型サポート
- **柔軟**：動的ルート、レイアウト、エラー処理を完備
- **高性能**：プリフェッチ、ストリーミングSSR対応

## 次のステップ

[Load関数とデータフェッチング](/sveltekit/basics/load-functions/)で、データの取得と管理について詳しく学びましょう。