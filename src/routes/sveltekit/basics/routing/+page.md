---
title: ルーティング完全ガイド
description: SvelteKitのルーティングシステムを完全マスター - 基本から高度な機能まで
---

:::caution[タイトル]
執筆中
:::

SvelteKitのルーティングシステムは、ファイルベースの直感的な設計でありながら、エンタープライズレベルのアプリケーションに必要な高度な機能を全て備えています。このガイドでは、基本的なルーティングから動的ルート、レイアウト、エラーハンドリングまで、実践的なTypeScriptコード例とともに完全解説します。

## 基本的なルーティング

SvelteKitはファイルシステムベースのルーティングを採用しています。`src/routes`ディレクトリ内のファイル構造がそのままURLパスになります。

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

## 動的ルーティング

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

### レイアウトグループ

UIを共有しながら、URLには影響しないグループ化

```
src/routes/
├── (app)/
│   ├── +layout.svelte        # アプリケーションレイアウト
│   ├── dashboard/+page.svelte
│   └── settings/+page.svelte
├── (marketing)/
│   ├── +layout.svelte        # マーケティングサイトレイアウト
│   ├── +page.svelte          # ホームページ
│   └── pricing/+page.svelte
```

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

## プログラマティックナビゲーション

### goto関数による遷移

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

### prefetch による事前読み込み

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

## ルートアノテーション

### プリレンダリングの設定

```typescript
// src/routes/blog/+page.ts
export const prerender = true; // ビルド時に静的生成
export const ssr = true;        // サーバーサイドレンダリング有効
export const csr = true;        // クライアントサイドレンダリング有効
```

### トレイリングスラッシュの制御

```typescript
// src/routes/+layout.ts
export const trailingSlash = 'always'; // 'never', 'always', 'ignore'
```

## 実践的な実装例

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

## トラブルシューティング

### よくあるエラーと解決方法

:::warning[404エラーが発生する]
- ファイル名が正しいか確認（`+page.svelte`、`+layout.svelte`）
- 動的パラメータの形式が正しいか（`[id]`、`[[optional]]`）
- ルートマッチャーが適切に動作しているか
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

## まとめ

SvelteKitのルーティングシステムは、
- **直感的**：ファイルベースで理解しやすい
- **型安全**：TypeScriptで完全な型サポート
- **柔軟**：動的ルート、レイアウト、エラー処理を完備
- **高性能**：プリフェッチ、ストリーミングSSR対応

## 次のステップ

[Load関数とデータフェッチング](/sveltekit/basics/load-functions/)で、データの取得と管理について詳しく学びましょう。