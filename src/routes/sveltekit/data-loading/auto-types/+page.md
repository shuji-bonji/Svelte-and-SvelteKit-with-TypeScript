---
title: TypeScript型の自動生成システム
description: SvelteKitが提供する./$typesによるTypeScript型の自動生成 - 型安全な開発を実現する仕組みと活用方法
---

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

SvelteKitは開発者が作成するファイルの種類に応じて、適切な型を自動的に生成します。これらの型は`./$types`からインポートして使用でき、ルートパラメータやデータの型安全性を保証します。

### Load関数の型（4種類）

Load関数は、ページやレイアウトのデータ取得を担当する重要な関数です。これらの型は、関数のパラメータと返り値を厳密に定義します。

| ファイル | 生成される型 | 用途 |
|---------|------------|------|
| `+page.ts` | `PageLoad` | ページのUniversal Load関数の型定義 |
| `+page.server.ts` | `PageServerLoad` | ページのServer Load関数の型定義 |
| `+layout.ts` | `LayoutLoad` | レイアウトのUniversal Load関数の型定義 |
| `+layout.server.ts` | `LayoutServerLoad` | レイアウトのServer Load関数の型定義 |

### データ型（4種類）

Svelteコンポーネントが受け取るデータの型定義です。Load関数の返り値が自動的にこれらの型として推論され、コンポーネント内で型安全にアクセスできます。

| コンポーネント | 生成される型 | 用途 |
|---------------|------------|------|
| `+page.svelte` | `PageData` | Load関数が返すデータの型（コンポーネントのprops） |
| `+page.svelte` | `PageServerData` | Server Load関数が返すデータの型 |
| `+layout.svelte` | `LayoutData` | Layout Load関数が返すデータの型 |
| `+layout.svelte` | `LayoutServerData` | Layout Server Load関数が返すデータの型 |

### Actions型（1種類）

フォーム処理を行うActions関数の型定義です。POSTリクエストの処理、バリデーション、データベース操作などのサーバーサイド処理を型安全に実装できます。

| ファイル | 生成される型 | 用途 |
|---------|------------|------|
| `+page.server.ts` | `Actions` | Form Actionsオブジェクトの型定義 |

### APIハンドラー型（1種類）

RESTful APIエンドポイントを作成するための型定義です。HTTPメソッド（GET、POST、PUT、DELETE等）に対応したハンドラー関数を型安全に実装できます。

| ファイル | 生成される型 | 用途 |
|---------|------------|------|
| `+server.ts` | `RequestHandler` | APIエンドポイント関数の型定義 |

### その他の特殊型（3種類）

特定の用途に特化した型定義です。静的サイト生成、カスタムパラメータ検証、設定管理などの高度な機能を型安全に実装するために使用します。

| 用途 | 生成される型 | 説明 |
|-----|------------|------|
| 静的パス生成 | `EntryGenerator` | 動的ルートの静的生成用 |
| パラメータ検証 | `ParamMatcher` | `src/params/*.ts`で使用 |
| 設定 | `Config` | プリレンダリング設定等 |

## 実践的な使用例

実際のプロジェクトでよく使用されるパターンを紹介します。これらの例を通じて、`./$types`がどのように型安全性を提供し、開発効率を向上させるかを理解できます。

### 1. Load関数での型定義

動的ルートパラメータを含むページでのデータ取得の例です。`PageLoad`型により、`params.slug`が自動的に`string`型として推論され、タイプミスを防ぎます。

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

Load関数から渡されたデータをSvelteコンポーネントで受け取る例です。`PageData`型により、Load関数の返り値の型が自動的に適用され、プロパティへの安全なアクセスが保証されます。

```svelte
<!-- src/routes/blog/[slug]/+page.svelte -->
<script lang="ts">
  import type { PageData } from './$types';
  
  // Load関数の返り値の型が自動的に適用される
  let { data }: { data: PageData } = $props();
  // data.post と data.slug が型安全にアクセス可能
</script>

<article>
  <h1>{data.post.title}</h1>
  <div>{@html data.post.content}</div>
</article>
```

### 3. Server LoadとForm Actions

サーバーサイドでのデータ取得とフォーム処理を行う例です。`PageServerLoad`で認証チェックとデータ取得を行い、`Actions`でCRUD操作を型安全に実装します。

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

RESTful APIエンドポイントの実装例です。`RequestHandler`型により、HTTPメソッド（GET、PUT、DELETE）ごとのハンドラーが型安全に定義でき、パラメータやレスポンスの型チェックが行われます。

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

ビルド時に動的ルートのページを静的生成（プリレンダリング）する例です。`EntryGenerator`で生成するパスのリストを定義し、各パスに対してページが事前生成されます。

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

URLパラメータのバリデーションを行うカスタムマッチャーの例です。`ParamMatcher`を使用して、特定のパターン（この例では整数）に一致するパラメータのみを受け入れるルートを作成できます。

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

## TypeScriptとの統合

SvelteKitは自動的に型を生成し、Load関数の引数と返り値を完全に型付けします。この強力な型システムにより、開発時のミスを大幅に削減できます。

### 型の自動補完

`./$types`からインポートした型は、VSCodeなどのIDEで完全な自動補完サポートを受けられます。

```typescript
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, url, fetch, parent }) => {
  // すべての引数が型付けされている
  // paramsのプロパティも自動補完される
  // 返り値も自動的に型チェックされる
  return {
    data: 'type-safe'
  };
};
```

### 型推論の活用

SvelteKitの型システムは、ルート構造から自動的に型を推論します。

```typescript
// src/routes/users/[id]/posts/[postId]/+page.ts
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
  // params.id と params.postId が自動的に推論される
  console.log(params.id);     // string型
  console.log(params.postId); // string型
  
  return {
    userId: params.id,
    postId: params.postId
  };
};
```

### 型安全なデータフロー

Load関数からコンポーネントまで、データフロー全体が型安全に保たれます。

```typescript
// +page.server.ts
import type { PageServerLoad } from './$types';

interface Post {
  id: string;
  title: string;
  content: string;
  author: {
    name: string;
    email: string;
  };
}

export const load: PageServerLoad = async () => {
  const post: Post = await getPost();
  
  return {
    post // 型が保持される
  };
};
```

```svelte
<!-- +page.svelte -->
<script lang="ts">
  import type { PageData } from './$types';
  
  let { data }: { data: PageData } = $props();
  // data.post は Post 型として認識される
  // data.post.author.name にアクセス可能
</script>

<h1>{data.post.title}</h1>
<p>by {data.post.author.name}</p>
```

## app.d.tsとの連携

SvelteKitでは`app.d.ts`ファイルを使用して、プロジェクト全体で共有されるグローバルな型定義を宣言できます。これらの型は`./$types`と自動的に統合され、アプリケーション全体で型安全性を保証します。

:::info[グローバル型定義について]
`app.d.ts`でのグローバル型定義については、[app.d.tsの役割]({base}/sveltekit/basics/global-types/)で詳しく解説しています。App.Locals、App.PageData、App.Error、App.PageState、App.Platformの5つの標準インターフェースの使い方を学びましょう。
:::

## ベストプラクティス

型安全性を最大限に活用し、バグを防ぐための実践的なガイドラインです。これらのパターンに従うことで、より堅牢なアプリケーションを構築できます。

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
  let { data }: { data: PageData } = $props();
</script>

<!-- ❌ 避けるべき：any型 -->
<script lang="ts">
  let { data }: { data: any } = $props();
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

開発中によく遭遇する型関連の問題と、その解決方法を紹介します。これらの対処法を知っておくことで、スムーズな開発が可能になります。

### 型が認識されない場合

`./$types`からインポートした型が認識されない場合の対処法です。多くの場合、TypeScript Language Serverの再起動で解決します。

1. **TypeScriptの再起動**: VSCodeでCmd/Ctrl+Shift+P → "TypeScript: Restart TS Server"
2. **ビルドエラーの確認**: `npm run check`を実行
3. **ファイル名の確認**: 正確に`+page.ts`等の命名規則に従っているか

### パラメータの型が`string`にならない

動的ルートパラメータの型に関する注意点です。URLパラメータは常に文字列として扱われるため、数値として使用する場合は明示的な変換が必要です。

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

- [Load関数とデータフェッチング]({base}/sveltekit/data-loading/) - Load関数の詳細
- [フォーム処理とActions]({base}/sveltekit/server/forms/) - Form Actionsの実装
- [APIルート設計]({base}/sveltekit/server/api-routes/) - RESTful APIの構築