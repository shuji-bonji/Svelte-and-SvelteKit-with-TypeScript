---
title: SvelteKitファイルシステム
description: SvelteKitの特殊ファイルシステムをTypeScriptで完全理解。+page/+layout/+serverファイルの関係性、データフロー、実行環境を実践的なコード例で解説
---

<script lang="ts">
  import Mermaid from '$lib/components/Mermaid.svelte';
  
  // ファイル実行順序の図
  const fileExecutionFlow = `flowchart TB
    subgraph Server["サーバー環境"]
      LS["+layout.server.ts"]
      PS["+page.server.ts"]
    end
    
    subgraph Universal["ユニバーサル環境"]
      LT["+layout.ts"]
      PT["+page.ts"]
    end
    
    subgraph Client["クライアント環境"]
      LSV["+layout.svelte"]
      PSV["+page.svelte"]
    end
    
    LS -->|1. データ取得| PS
    PS -->|2. サーバーデータ| LT
    LT -->|3. 共通データ| PT
    PT -->|4. ページデータ| LSV
    LSV -->|5. レイアウト表示| PSV
    
    style LS fill:#ff6b6b,color:#fff
    style PS fill:#ff6b6b,color:#fff
    style LT fill:#4ecdc4,color:#fff
    style PT fill:#4ecdc4,color:#fff
    style LSV fill:#45b7d1,color:#fff
    style PSV fill:#45b7d1,color:#fff`;

  // データフローの図
  const dataFlowDiagram = `flowchart LR
    subgraph Load["Load関数"]
      SL["Server Load"]
      UL["Universal Load"]
    end
    
    subgraph Component["コンポーネント"]
      Layout["Layout"]
      Page["Page"]
    end
    
    SL -->|"{ user, session }"| UL
    UL -->|"data props"| Layout
    Layout -->|"slot"| Page
    
    style SL fill:#ff6b6b,color:#fff
    style UL fill:#4ecdc4,color:#fff
    style Layout fill:#45b7d1,color:#fff
    style Page fill:#96ceb4,color:#fff`;
</script>

SvelteKitのファイルシステムは、ファイル名によって機能と実行環境が決まる規約ベースの設計です。このガイドでは、特殊ファイルの役割、相互関係、データフロー、実行タイミングを体系的に解説します。

## 特殊ファイル一覧と実行環境

SvelteKitの特殊ファイルは`+`プレフィックスで識別され、それぞれ異なる役割と実行環境を持ちます。

### ファイル一覧表

| ファイル名 | 実行環境 | 役割 | 用途 | 秘密情報の扱い |
|-----------|---------|------|------|-------------|
| `+page.svelte` | ブラウザ | ページUI | UIコンポーネント | ❌ 不可 |
| `+page.ts` | サーバー＆ブラウザ | ユニバーサルload | 公開データ取得 | ❌ 不可 |
| `+page.server.ts` | サーバーのみ | サーバーload & actions | DB接続、フォーム処理 | ✅ 可能 |
| `+layout.svelte` | ブラウザ | 共通レイアウト | ヘッダー、ナビゲーション | ❌ 不可 |
| `+layout.ts` | サーバー＆ブラウザ | レイアウトデータ | 共通データ取得 | ❌ 不可 |
| `+layout.server.ts` | サーバーのみ | サーバーレイアウトデータ | 認証チェック | ✅ 可能 |
| `+server.ts` | サーバーのみ | APIエンドポイント | REST API | ✅ 可能 |
| `+error.svelte` | ブラウザ | エラーページ | エラー表示 | ❌ 不可 |

:::warning[セキュリティの重要性]
`.server.ts`ファイル以外では、環境変数や秘密鍵などの機密情報を扱わないでください。これらのファイルはクライアントにバンドルされる可能性があります。
:::

## ファイル間の関係性とデータフロー

### 実行順序の理解

<Mermaid diagram={fileExecutionFlow} />

SvelteKitは以下の順序でファイルを実行します。

1. **サーバー環境**: `+layout.server.ts` → `+page.server.ts`
2. **ユニバーサル環境**: `+layout.ts` → `+page.ts`
3. **クライアント環境**: `+layout.svelte` → `+page.svelte`

### データの流れ

<Mermaid diagram={dataFlowDiagram} />

データは親から子へ、サーバーからクライアントへと流れます。

```typescript
// +layout.server.ts - 認証チェック
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
  const user = await locals.getUser();
  
  return {
    user // このデータは子のload関数で利用可能
  };
};
```

```typescript
// +page.ts - 親のデータを受け取る
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
  const { user } = await parent(); // 親レイアウトのデータを取得
  
  const posts = user 
    ? await fetchUserPosts(user.id)
    : await fetchPublicPosts();
  
  return {
    user,
    posts
  };
};
```

```svelte
<!-- +page.svelte - データを表示 -->
<script lang="ts">
  import type { PageData } from './$types';
  
  export let data: PageData; // load関数の返り値
</script>

{#if data.user}
  <h1>Welcome, {data.user.name}!</h1>
{/if}

<ul>
  {#each data.posts as post}
    <li>{post.title}</li>
  {/each}
</ul>
```

## +page ファイル群の詳細

### +page.svelte - ページコンポーネント

ページのUIを定義するSvelteコンポーネントです。

```svelte
<script lang="ts">
  import type { PageData } from './$types';
  import { page } from '$app/stores';
  
  // Load関数からのデータ
  export let data: PageData;
  
  // フォームアクションの結果
  export let form: ActionData;
</script>

<h1>{data.title}</h1>

{#if form?.error}
  <p class="error">{form.error}</p>
{/if}

<form method="POST">
  <input name="title" value={form?.title ?? ''} />
  <button>Submit</button>
</form>
```

### +page.ts - ユニバーサルLoad関数

両環境で実行可能なデータ取得処理です。

```typescript
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, url, fetch, parent }) => {
  // URLパラメータ
  const id = params.id;
  
  // クエリパラメータ
  const query = url.searchParams.get('q');
  
  // 親のデータを待つ
  const parentData = await parent();
  
  // データ取得（fetchはSvelteKitが拡張したfetch）
  const response = await fetch(`/api/items/${id}`);
  const item = await response.json();
  
  return {
    ...parentData,
    item,
    query
  };
};

// ページ設定
export const prerender = false; // SSRを使用
export const ssr = true;        // サーバーサイドレンダリング有効
export const csr = true;        // クライアントサイドレンダリング有効
```

### +page.server.ts - サーバー専用処理

サーバーでのみ実行される処理とフォームアクションを定義します。

```typescript
import type { PageServerLoad, Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/database';

// サーバー専用のLoad関数
export const load: PageServerLoad = async ({ params, locals }) => {
  // データベースアクセス（サーバーのみ）
  const post = await db.post.findUnique({
    where: { id: params.id },
    include: { author: true }
  });
  
  if (!post) {
    throw error(404, 'Post not found');
  }
  
  // 権限チェック
  const canEdit = locals.user?.id === post.authorId;
  
  return {
    post,
    canEdit
  };
};

// フォームアクション
export const actions: Actions = {
  // デフォルトアクション
  default: async ({ request, locals }) => {
    const data = await request.formData();
    const title = data.get('title');
    
    // バリデーション
    if (!title || typeof title !== 'string') {
      return fail(400, { 
        title,
        error: 'Title is required' 
      });
    }
    
    // データベース更新
    try {
      await db.post.create({
        data: {
          title,
          authorId: locals.user.id
        }
      });
    } catch (e) {
      return fail(500, { 
        title,
        error: 'Failed to create post' 
      });
    }
    
    // 成功時はリダイレクト
    throw redirect(303, '/posts');
  },
  
  // 名前付きアクション
  delete: async ({ params }) => {
    await db.post.delete({
      where: { id: params.id }
    });
    
    throw redirect(303, '/posts');
  }
};
```

## +layout ファイル群の詳細

### +layout.svelte - レイアウトコンポーネント

子ページで共通して使用するレイアウトを定義します。

```svelte
<script lang="ts">
  import type { LayoutData } from './$types';
  import Header from '$lib/components/Header.svelte';
  import Footer from '$lib/components/Footer.svelte';
  
  export let data: LayoutData;
</script>

<div class="app">
  <Header user={data.user} />
  
  <main>
    <!-- 子ページがここにレンダリングされる -->
    <slot />
  </main>
  
  <Footer />
</div>

<style>
  .app {
    display: grid;
    grid-template-rows: auto 1fr auto;
    min-height: 100vh;
  }
</style>
```

### +layout.ts - レイアウトのユニバーサルLoad

すべての子ページで共有するデータを取得します。

```typescript
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ fetch }) => {
  // 全ページで必要な設定情報
  const config = await fetch('/api/config').then(r => r.json());
  
  // ナビゲーションメニュー
  const navigation = await fetch('/api/navigation').then(r => r.json());
  
  return {
    config,
    navigation
  };
};

// レイアウトグループ全体の設定
export const prerender = false;
export const trailingSlash = 'always';
```

### +layout.server.ts - サーバー専用レイアウト処理

認証チェックなど、セキュリティに関わる処理を実装します。

```typescript
import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';

export const load: LayoutServerLoad = async ({ cookies, url }) => {
  const token = cookies.get('session');
  
  // 認証が必要なページグループ
  if (url.pathname.startsWith('/admin')) {
    if (!token) {
      throw redirect(303, `/login?redirect=${url.pathname}`);
    }
    
    try {
      const user = jwt.verify(token, process.env.JWT_SECRET);
      
      if (user.role !== 'admin') {
        throw error(403, 'Admin access required');
      }
      
      return { user };
    } catch {
      cookies.delete('session');
      throw redirect(303, '/login');
    }
  }
  
  // 認証不要なページでもユーザー情報は返す
  if (token) {
    try {
      const user = jwt.verify(token, process.env.JWT_SECRET);
      return { user };
    } catch {
      cookies.delete('session');
    }
  }
  
  return {};
};
```

## +server.ts - APIエンドポイント

RESTful APIを実装するためのファイルです。

```typescript
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/database';

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
  if (!locals.user) {
    throw error(401, 'Authentication required');
  }
  
  const data = await request.json();
  
  const post = await db.post.create({
    data: {
      ...data,
      authorId: locals.user.id
    }
  });
  
  return json(post, { status: 201 });
};

// PUT /api/posts/[id]
export const PUT: RequestHandler = async ({ params, request }) => {
  const data = await request.json();
  
  const post = await db.post.update({
    where: { id: params.id },
    data
  });
  
  return json(post);
};

// DELETE /api/posts/[id]
export const DELETE: RequestHandler = async ({ params }) => {
  await db.post.delete({
    where: { id: params.id }
  });
  
  return new Response(null, { status: 204 });
};

// カスタムメソッド
export const PATCH: RequestHandler = async ({ params, request }) => {
  const updates = await request.json();
  
  const post = await db.post.update({
    where: { id: params.id },
    data: updates
  });
  
  return json(post);
};
```

## +error.svelte - エラーページ

エラーが発生した際に表示されるページです。

```svelte
<script lang="ts">
  import { page } from '$app/stores';
  import { dev } from '$app/environment';
</script>

<div class="error-page">
  <h1>{$page.status}</h1>
  <p>{$page.error?.message}</p>
  
  {#if $page.status === 404}
    <p>お探しのページは見つかりませんでした。</p>
    <a href="/">ホームに戻る</a>
  {:else if $page.status === 500}
    <p>サーバーエラーが発生しました。</p>
    {#if dev}
      <pre>{JSON.stringify($page.error, null, 2)}</pre>
    {/if}
  {:else if $page.status === 403}
    <p>このページへのアクセス権限がありません。</p>
  {/if}
</div>

<style>
  .error-page {
    text-align: center;
    padding: 2rem;
  }
  
  pre {
    text-align: left;
    background: #f4f4f4;
    padding: 1rem;
    border-radius: 0.5rem;
    overflow-x: auto;
  }
</style>
```

## 実行タイミングの詳細

### SSR（サーバーサイドレンダリング）時

1. **サーバー側**:
   ```
   +layout.server.ts → +page.server.ts → +layout.ts → +page.ts
   → +layout.svelte → +page.svelte
   ```

2. **クライアント側**（ハイドレーション）:
   ```
   +layout.ts → +page.ts → +layout.svelte → +page.svelte
   ```

### CSR（クライアントサイドレンダリング）時

クライアント側のみで実行:
```
+layout.ts → +page.ts → +layout.svelte → +page.svelte
```

### プリレンダリング時

ビルド時に一度だけ実行:
```
+layout.server.ts → +page.server.ts → +layout.ts → +page.ts
→ HTMLファイル生成
```

## ベストプラクティス

### 1. ファイルの使い分け

```typescript
// ❌ 悪い例：+page.tsで秘密情報を扱う
// +page.ts
export const load = async () => {
  // これはクライアントにも露出する！
  const apiKey = process.env.SECRET_API_KEY;
};

// ✅ 良い例：+page.server.tsで秘密情報を扱う
// +page.server.ts
export const load = async () => {
  // サーバーでのみ実行される
  const apiKey = process.env.SECRET_API_KEY;
  const data = await fetchWithApiKey(apiKey);
  
  return {
    data // APIキーは含まない
  };
};
```

### 2. データフローの最適化

```typescript
// 親レイアウトで共通データを取得
// +layout.server.ts
export const load = async ({ locals }) => {
  const user = await locals.getUser();
  return { user };
};

// 子ページで親のデータを活用
// +page.ts
export const load = async ({ parent, fetch }) => {
  const { user } = await parent();
  
  // userに応じた条件付きデータ取得
  if (user?.premium) {
    return { 
      content: await fetch('/api/premium-content').then(r => r.json())
    };
  }
  
  return { 
    content: await fetch('/api/free-content').then(r => r.json())
  };
};
```

### 3. エラーハンドリング

```typescript
// +page.server.ts
import { error, fail } from '@sveltejs/kit';

export const load = async ({ params }) => {
  const post = await getPost(params.id);
  
  if (!post) {
    // 404エラーページを表示
    throw error(404, {
      message: 'Post not found',
      id: params.id
    });
  }
  
  return { post };
};

export const actions = {
  update: async ({ request, params }) => {
    const data = await request.formData();
    
    try {
      await updatePost(params.id, data);
    } catch (e) {
      // フォームにエラーを返す
      return fail(400, {
        error: 'Failed to update post',
        values: Object.fromEntries(data)
      });
    }
    
    // 成功
    return { success: true };
  }
};
```

## トラブルシューティング

### よくある問題と解決方法

:::warning[TypeError: Cannot access 'X' before initialization]
**原因**: Load関数の循環参照
**解決**: `parent()`の呼び出しタイミングを確認し、必要な場合のみ呼び出す
:::

:::warning[Hydration mismatch]
**原因**: サーバーとクライアントで異なる内容をレンダリング
**解決**: `browser`変数を使用して条件分岐を適切に行う
:::

:::warning[500 Internal Server Error in production]
**原因**: `.server.ts`以外で環境変数にアクセス
**解決**: 環境変数へのアクセスは`.server.ts`ファイルに限定する
:::

## まとめ

SvelteKitのファイルシステムは、

- **規約ベース**: ファイル名が機能を決定
- **型安全**: TypeScriptの完全サポート
- **セキュア**: サーバー専用ファイルで機密情報を保護
- **効率的**: 適切なファイル分割でパフォーマンス最適化

これらの特殊ファイルを適切に使い分けることで、安全で高性能なWebアプリケーションを構築できます。

## 次のステップ

- [ルーティング詳解](/sveltekit/routing/) - URLとファイルの対応関係
- [Load関数とデータフェッチング](/sveltekit/data-loading/) - データ取得の詳細
- [フォーム処理とActions](/sveltekit/server/forms/) - フォーム処理の実装