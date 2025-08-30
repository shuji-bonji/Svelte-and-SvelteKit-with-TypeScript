---
title: SvelteKitの自動型生成システム
description: ./$typesから自動生成される型の完全ガイド
---
:::caution[タイトル]
執筆中
:::
<script lang="ts">
  import { base } from '$app/paths';
</script>

SvelteKitは`./$types`という仮想モジュールを通じて、各ルートごとに型を自動生成します。これにより、**型安全性を保ちながら、ボイラープレートコードを削減**できます。

## `./$types`とは何か

`./$types`は**仮想モジュール**で、実際のファイルは存在しませんが、TypeScriptが認識する特別なモジュールです。SvelteKitが各ルートディレクトリごとに自動的に型定義を生成します。

### 主な特徴

- 📝 **自動生成**: ファイル名に基づいて適切な型が自動生成
- 🔄 **リアルタイム更新**: ルート構造の変更を即座に反映
- 🎯 **コンテキスト固有**: 各ルートに特化した型定義
- 🛡️ **型安全**: パラメータ、データ、レスポンスすべてが型チェック

## 自動生成される型の一覧

### Load関数の型（4種類）

| ファイル | 生成される型 | 用途 |
|---------|------------|------|
| `+page.ts` | `PageLoad` | ページのUniversal Load関数 |
| `+page.server.ts` | `PageServerLoad` | ページのServer Load関数 |
| `+layout.ts` | `LayoutLoad` | レイアウトのUniversal Load関数 |
| `+layout.server.ts` | `LayoutServerLoad` | レイアウトのServer Load関数 |

### データ型（4種類）

| コンポーネント | 生成される型 | 用途 |
|---------------|------------|------|
| `+page.svelte` | `PageData` | Universal Loadからのデータ |
| `+page.svelte` | `PageServerData` | Server Loadからのデータ |
| `+layout.svelte` | `LayoutData` | Layout Loadからのデータ |
| `+layout.svelte` | `LayoutServerData` | Layout Server Loadからのデータ |

### Actions型（1種類）

| ファイル | 生成される型 | 用途 |
|---------|------------|------|
| `+page.server.ts` | `Actions` | Form Actions（フォーム処理） |

### APIハンドラー型（1種類）

| ファイル | 生成される型 | 用途 |
|---------|------------|------|
| `+server.ts` | `RequestHandler` | RESTful APIエンドポイント |

### その他の特殊型（3種類）

| 用途 | 生成される型 | 説明 |
|-----|------------|------|
| 静的パス生成 | `EntryGenerator` | 動的ルートの静的生成用 |
| パラメータ検証 | `ParamMatcher` | `src/params/*.ts`で使用 |
| 設定 | `Config` | プリレンダリング設定等 |

## 実践的な使用例

### 1. Load関数での型定義

```typescript
// src/routes/blog/[slug]/+page.ts
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, fetch }) => {
  // params.slug は自動的に string 型として推論される
  const response = await fetch(`/api/blog/${params.slug}`);
  const post = await response.json();
  
  return {
    post,
    slug: params.slug
  };
};
```

### 2. コンポーネントでのデータ受け取り

```svelte
<!-- src/routes/blog/[slug]/+page.svelte -->
<script lang="ts">
  import type { PageData } from './$types';
  
  // Load関数の返り値の型が自動的に適用される
  export let data: PageData;
  // data.post と data.slug が型安全にアクセス可能
</script>

<article>
  <h1>{data.post.title}</h1>
  <div>{@html data.post.content}</div>
</article>
```

### 3. Server LoadとForm Actions

```typescript
// src/routes/admin/posts/+page.server.ts
import type { PageServerLoad, Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';

// Server Load関数
export const load: PageServerLoad = async ({ locals }) => {
  // locals.user は app.d.ts で定義した型が適用される
  if (!locals.user?.isAdmin) {
    throw redirect(307, '/login');
  }
  
  const posts = await db.posts.findMany();
  return { posts };
};

// Form Actions
export const actions: Actions = {
  create: async ({ request, locals }) => {
    const formData = await request.formData();
    const title = formData.get('title');
    const content = formData.get('content');
    
    if (!title || !content) {
      return fail(400, { 
        error: 'Title and content are required' 
      });
    }
    
    const post = await db.posts.create({
      data: {
        title: String(title),
        content: String(content),
        authorId: locals.user.id
      }
    });
    
    return { success: true, post };
  },
  
  delete: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get('id');
    
    await db.posts.delete({
      where: { id: String(id) }
    });
    
    throw redirect(303, '/admin/posts');
  }
};
```

### 4. APIエンドポイント

```typescript
// src/routes/api/posts/[id]/+server.ts
import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params }) => {
  // params.id は string 型として推論
  const post = await db.posts.findUnique({
    where: { id: params.id }
  });
  
  if (!post) {
    throw error(404, 'Post not found');
  }
  
  return json(post);
};

export const PUT: RequestHandler = async ({ params, request }) => {
  const data = await request.json();
  
  const updated = await db.posts.update({
    where: { id: params.id },
    data
  });
  
  return json(updated);
};

export const DELETE: RequestHandler = async ({ params }) => {
  await db.posts.delete({
    where: { id: params.id }
  });
  
  return new Response(null, { status: 204 });
};
```

### 5. 動的ルートの静的生成

```typescript
// src/routes/products/[category]/[id]/+page.ts
import type { PageLoad, EntryGenerator } from './$types';

// 静的生成するパスを定義
export const entries: EntryGenerator = () => {
  return [
    { category: 'electronics', id: 'laptop-1' },
    { category: 'electronics', id: 'phone-2' },
    { category: 'books', id: 'novel-1' }
  ];
};

export const load: PageLoad = async ({ params }) => {
  // params.category と params.id が型安全
  const product = await getProduct(params.category, params.id);
  return { product };
};
```

### 6. パラメータマッチャー

```typescript
// src/params/integer.ts
import type { ParamMatcher } from '@sveltejs/kit';

export const match: ParamMatcher = (param) => {
  return /^\d+$/.test(param);
};
```

```typescript
// src/routes/posts/[id=integer]/+page.ts で使用
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
  // params.id は integer マッチャーを通過した値のみ
  const postId = parseInt(params.id);
  // ...
};
```

## 高度な型定義

### app.d.tsとの連携

```typescript
// src/app.d.ts
declare global {
  namespace App {
    interface Locals {
      user: {
        id: string;
        email: string;
        isAdmin: boolean;
      } | null;
    }
    interface PageData {
      flash?: { type: 'success' | 'error'; message: string };
    }
    interface Error {
      code?: string;
      id?: string;
    }
  }
}

export {};
```

これらの型定義は`./$types`の型と自動的に統合されます。

```typescript
// Server Load関数で locals.user が型安全に
export const load: PageServerLoad = async ({ locals }) => {
  if (locals.user?.isAdmin) {
    // 管理者のみの処理
  }
};
```

## ベストプラクティス

### 1. 常に型を明示的にインポート

```typescript
// ✅ 良い例：明示的な型インポート
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
  // ...
};

// ❌ 避けるべき：型注釈なし
export const load = async () => {
  // 型推論が効かない場合がある
};
```

### 2. データの型を活用

```svelte
<script lang="ts">
  // ✅ 良い例：PageDataを使用
  import type { PageData } from './$types';
  export let data: PageData;
</script>

<!-- ❌ 避けるべき：any型 -->
<script lang="ts">
  export let data: any;
</script>
```

### 3. Actionsの返り値を型定義

```typescript
// ✅ 良い例：返り値の型を明確に
export const actions: Actions = {
  login: async ({ request }) => {
    // ...
    return {
      success: true,
      user: { id: '123', name: 'Alice' }
    } as const;
  }
};
```

## トラブルシューティング

### 型が認識されない場合

1. **TypeScriptの再起動**: VSCodeでCmd/Ctrl+Shift+P → "TypeScript: Restart TS Server"
2. **ビルドエラーの確認**: `npm run check`を実行
3. **ファイル名の確認**: 正確に`+page.ts`等の命名規則に従っているか

### パラメータの型が`string`にならない

動的ルートパラメータは常に`string`型です。数値が必要な場合は変換が必要

```typescript
export const load: PageLoad = async ({ params }) => {
  // params.id は string
  const id = parseInt(params.id, 10);
  if (isNaN(id)) {
    throw error(400, 'Invalid ID');
  }
};
```

## まとめ

`./$types`は、SvelteKitの型安全性の中核を担う機能です。

- 🎯 **自動生成**で開発効率が向上
- 🛡️ **型安全**でランタイムエラーを防止
- 📝 **ボイラープレート削減**でコードがシンプルに
- 🔄 **リアルタイム更新**で常に最新の型定義

これらの型を活用することで、より堅牢で保守しやすいSvelteKitアプリケーションを構築できます。

## 次のステップ

- [Load関数とデータフェッチング]({base}/sveltekit/basics/load-functions/) - Load関数の詳細
- [フォーム処理とActions]({base}/sveltekit/server/forms/) - Form Actionsの実装
- [APIルート設計]({base}/sveltekit/server/api-routes/) - RESTful APIの構築