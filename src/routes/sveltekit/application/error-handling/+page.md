---
title: エラーハンドリング
description: SvelteKitでのエラーハンドリング戦略。予期されるエラーと予期しないエラーの違い、error()関数、+error.svelte、handleErrorフック、レンダリングエラー対応をTypeScriptで解説
---

<script>
	import Admonition from '$lib/components/Admonition.svelte';
  import Mermaid from '$lib/components/Mermaid.svelte';

  const errorFlowDiagram = `flowchart TB
    subgraph "エラーの種類"
      direction TB
      Expected["予期されるエラー（Expected）<br/>error(404, 'Not found')"]
      Unexpected["予期しないエラー（Unexpected）<br/>throw new Error('DB接続失敗')"]
    end

    subgraph "処理フロー"
      direction TB
      ErrorFunc["error() 関数"]
      HandleError["handleError フック"]
      ErrorPage["+error.svelte"]
      FallbackPage["src/error.html（フォールバック）"]
    end

    Expected --> ErrorFunc
    ErrorFunc --> ErrorPage
    Unexpected --> HandleError
    HandleError --> ErrorPage

    ErrorPage -->|ルートレイアウトエラー| FallbackPage

    style Expected fill:#fff3e0,stroke:#f57c00
    style Unexpected fill:#ffebee,stroke:#d32f2f
    style ErrorFunc fill:#e8f5e9,stroke:#4caf50
    style HandleError fill:#e3f2fd,stroke:#2196f3`;

  const errorBoundaryDiagram = `flowchart TB
    subgraph "ルートツリー"
      direction TB
      RootLayout["+layout.svelte（ルート）"]
      RootError["+error.svelte（ルート）"]
      SubLayout["+layout.svelte（サブ）"]
      SubError["+error.svelte（サブ）"]
      Page["+page.svelte"]
    end

    Page -->|エラー発生| SubError
    SubLayout -->|エラー発生| RootError
    RootLayout -->|エラー発生| FallbackHTML["src/error.html"]

    style RootError fill:#e8f5e9,stroke:#4caf50
    style SubError fill:#e8f5e9,stroke:#4caf50
    style FallbackHTML fill:#ffebee,stroke:#d32f2f`;
</script>

SvelteKitはエラーを「予期されるエラー」と「予期しないエラー」の2種類に分類し、それぞれ異なる方法で処理します。このページでは、型安全なエラーハンドリングの設計から実装まで、包括的に解説します。

<Mermaid diagram={errorFlowDiagram} />

## 予期されるエラー（Expected Errors）

`@sveltejs/kit`の`error()`関数で作成するエラーです。「ユーザーが存在しないページにアクセスした」「権限がない」など、アプリケーションのロジックとして想定されるエラーに使用します。

### error() 関数の基本

```typescript
// +page.server.ts
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { db } from '$lib/server/database';

export const load: PageServerLoad = async ({ params }) => {
  const post = await db.post.findUnique({
    where: { slug: params.slug },
  });

  if (!post) {
    // 404エラーを発生させる
    // SvelteKitがキャッチし、+error.svelteをレンダリング
    error(404, {
      message: '記事が見つかりません',
    });
  }

  return { post };
};
```

`error()`は例外をスローするため、それ以降のコードは実行されません。第1引数にHTTPステータスコード、第2引数にエラーオブジェクトまたは文字列を渡します。

```typescript
// 文字列を渡す簡略記法
error(404, '記事が見つかりません');

// オブジェクトを渡す詳細記法（カスタムプロパティを含む場合）
error(404, {
  message: '記事が見つかりません',
  code: 'NOT_FOUND',
});
```

### Load関数でのエラー処理

```typescript
// +page.server.ts — 認証チェック付きのLoad関数
import type { PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals, params }) => {
  // 認証チェック
  if (!locals.user) {
    redirect(303, '/login');
  }

  // 権限チェック
  const post = await db.post.findUnique({
    where: { id: params.id },
  });

  if (!post) {
    error(404, { message: '記事が見つかりません', code: 'NOT_FOUND' });
  }

  if (post.authorId !== locals.user.id) {
    error(403, {
      message: 'この記事を編集する権限がありません',
      code: 'FORBIDDEN',
    });
  }

  return { post };
};
```

### Form Actionsでのエラー処理

Form Actionsでは`fail()`を使ってバリデーションエラーを返すのが一般的です。`error()`との使い分けに注意してください。

```typescript
// +page.server.ts
import type { Actions } from './$types';
import { fail, error } from '@sveltejs/kit';

export const actions = {
  create: async ({ request, locals }) => {
    if (!locals.user) {
      // 認証エラーは error() で（ページ遷移を伴う致命的エラー）
      error(401, '認証が必要です');
    }

    const formData = await request.formData();
    const title = formData.get('title')?.toString();

    if (!title || title.length < 3) {
      // バリデーションエラーは fail() で（フォーム状態を維持）
      return fail(400, {
        error: 'タイトルは3文字以上必要です',
        values: { title: title ?? '' },
      });
    }

    try {
      const post = await db.post.create({
        data: { title, authorId: locals.user.id },
      });
      return { success: true, post };
    } catch (err) {
      // DB制約違反など
      return fail(500, {
        error: '記事の作成に失敗しました',
        values: { title },
      });
    }
  },
} satisfies Actions;
```

<Admonition type="tip" title="error() と fail() の使い分け">

`error()` はページ全体をエラーページに置き換えます。`fail()` は現在のページを維持したままフォームの状態を返します。バリデーションエラーのように「ユーザーが修正できるエラー」には`fail()`、「修正不可能な致命的エラー」には`error()`を使いましょう。

</Admonition>

## 予期しないエラー（Unexpected Errors）

`error()`を使わずに発生した例外はすべて「予期しないエラー」として扱われます。データベース接続失敗、外部API障害、プログラミングミスなどが該当します。

予期しないエラーはセキュリティのため、ユーザーにはスタックトレースやエラー詳細が公開されません。デフォルトでは`&#123; message: "Internal Error" &#125;`が返されます。

```typescript
// +page.server.ts
export const load: PageServerLoad = async () => {
  // この例外は「予期しないエラー」として処理される
  const data = await fetch('https://api.example.com/data');

  if (!data.ok) {
    // これも予期しないエラー（throwされた通常の例外）
    throw new Error('外部API呼び出しに失敗');
    // → ユーザーには "Internal Error" のみ表示される
  }

  return { items: await data.json() };
};
```

## +error.svelte コンポーネント

エラーが発生すると、最も近い`+error.svelte`コンポーネントがレンダリングされます。

<Mermaid diagram={errorBoundaryDiagram} />

### 基本的な +error.svelte

```svelte
<!-- src/routes/+error.svelte -->
<script lang="ts">
  import { page } from '$app/state';
</script>

<div class="error-page">
  <h1>{page.status}</h1>
  <p>{page.error?.message}</p>

  {#if page.status === 404}
    <p>お探しのページは見つかりませんでした。</p>
    <a href="/">ホームに戻る</a>
  {:else}
    <p>予期しないエラーが発生しました。</p>
    <a href="/">ホームに戻る</a>
  {/if}
</div>
```

### ネストされたエラーページ

ルートの階層ごとに異なるエラーページを設定できます。エラーが発生すると、ツリーを上方向にたどって最も近い`+error.svelte`が使用されます。

```svelte
<!-- src/routes/admin/+error.svelte — 管理画面専用エラーページ -->
<script lang="ts">
  import { page } from '$app/state';
</script>

<div class="admin-error">
  <h1>管理画面エラー: {page.status}</h1>
  <p>{page.error?.message}</p>

  {#if page.status === 403}
    <p>管理者権限が必要です。</p>
    <a href="/login">ログインページへ</a>
  {:else}
    <a href="/admin">管理画面トップへ</a>
  {/if}
</div>
```

<Admonition type="warning" title="レイアウトのエラーに注意">

`+layout.svelte`や`+layout.server.ts`でエラーが発生した場合、同階層の`+error.svelte`は使用されません。**1つ上**の階層の`+error.svelte`が使われます。ルートレイアウトでエラーが発生した場合は`src/error.html`にフォールバックします。

</Admonition>

## handleError フック

予期しないエラーを一元的に処理するためのフックです。エラーログの送信やエラーオブジェクトの変換に使用します。

### サーバーサイド

```typescript
// src/hooks.server.ts
import type { HandleServerError } from '@sveltejs/kit';

export const handleError: HandleServerError = async ({
  error,
  event,
  status,
  message,
}) => {
  // エラーID生成（ユーザーサポート用）
  const errorId = crypto.randomUUID();

  // エラーログ（サーバーコンソール）
  console.error(`[${errorId}] ${status}: ${event.url.pathname}`, error);

  // 外部エラートラッキングサービスに送信
  // await reportToSentry({ error, errorId, url: event.url.pathname });

  // ユーザーに返すエラーオブジェクト（App.Error型に準拠）
  return {
    message: '予期しないエラーが発生しました',
    code: 'INTERNAL_ERROR',
    id: errorId,
  };
};
```

### クライアントサイド

```typescript
// src/hooks.client.ts
import type { HandleClientError } from '@sveltejs/kit';

export const handleError: HandleClientError = async ({
  error,
  status,
  message,
}) => {
  const errorId = crypto.randomUUID();

  console.error(`[Client Error ${errorId}]`, error);

  // クライアントサイドのエラートラッキング
  // await reportToSentry({ error, errorId });

  return {
    message: 'エラーが発生しました。ページをリロードしてください。',
    code: 'CLIENT_ERROR',
    id: errorId,
  };
};
```

## App.Error 型のカスタマイズ

エラーオブジェクトにカスタムプロパティを追加するには、`app.d.ts`で`App.Error`インターフェースを拡張します。

```typescript
// src/app.d.ts
declare global {
  namespace App {
    interface Error {
      // messageはデフォルトで含まれる（宣言不要）
      code?: string; // エラーコード
      id?: string; // トラッキング用エラーID
    }
    // ... 他のApp型定義
  }
}

export {};
```

これにより、`error()`関数や`handleError`フックで返すオブジェクトに型安全にカスタムプロパティを含められます。

```svelte
<!-- +error.svelte — カスタムプロパティを活用 -->
<script lang="ts">
  import { page } from '$app/state';
</script>

<h1>エラー {page.status}</h1>
<p>{page.error?.message}</p>

{#if page.error?.id}
  <p class="error-id">
    サポートにお問い合わせの際は、このIDをお伝えください: <code>{page.error.id}</code>
  </p>
{/if}
```

## フォールバックエラーページ

ルートレイアウトでエラーが発生した場合や、`+error.svelte`のレンダリング自体が失敗した場合に表示される静的HTMLです。

```html
<!-- src/error.html -->
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>エラー - %sveltekit.error.message%</title>
    <style>
      body {
        font-family: system-ui, sans-serif;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        margin: 0;
        background: #f5f5f5;
      }
      .error-container {
        text-align: center;
        padding: 2rem;
      }
      h1 {
        color: #d32f2f;
      }
    </style>
  </head>
  <body>
    <div class="error-container">
      <h1>%sveltekit.status%</h1>
      <p>%sveltekit.error.message%</p>
      <a href="/">ホームに戻る</a>
    </div>
  </body>
</html>
```

`%sveltekit.status%`と`%sveltekit.error.message%`はSvelteKitが自動的に置換します。

## レンダリングエラーの処理

SvelteKit 2.54+ / Svelte 5.53+では、実験的な`handleRenderingErrors`オプションを有効にすることで、コンポーネントのレンダリング中に発生したエラーもエラーバウンダリでキャッチできます。

```javascript
// svelte.config.js
/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    experimental: {
      handleRenderingErrors: true,
    },
  },
};

export default config;
```

このオプションを有効にすると、レンダリング中のエラーは`handleError`フックに渡された後、最も近い`+error.svelte`に表示されます。レンダリングエラーの場合、`page`オブジェクトは更新されず、エラーはpropsとして直接渡されます。

```svelte
<!-- +error.svelte — レンダリングエラー対応 -->
<script lang="ts">
  // レンダリングエラー時は error が props として渡される
  let { error }: { error: App.Error } = $props();
</script>

<h1>{error.message}</h1>
```

<Admonition type="info" title="svelte:boundary との関係">

`&lt;svelte:boundary&gt;`を使えば、コンポーネントレベルでエラーをキャッチすることも可能です。`handleRenderingErrors`が有効な場合、キャッチされたエラーは`handleError`フックを通過してから`&lt;svelte:boundary&gt;`の`failed`スニペットに渡されます。詳しくは[特別な要素](/svelte/basics/special-elements/)を参照してください。

</Admonition>

## APIルートでのエラー処理

`+server.ts`でのエラーは、リクエストの`Accept`ヘッダーに基づいてJSONまたはHTMLで返されます。

```typescript
// src/routes/api/posts/[id]/+server.ts
import type { RequestHandler } from './$types';
import { error, json } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params }) => {
  const post = await db.post.findUnique({
    where: { id: params.id },
  });

  if (!post) {
    // Accept: application/json の場合 → JSON
    // Accept: text/html の場合 → エラーページ
    error(404, { message: '記事が見つかりません', code: 'NOT_FOUND' });
  }

  return json(post);
};
```

## 実践例：包括的なエラーハンドリング

実際のアプリケーションで推奨されるエラーハンドリングのパターンです。

```typescript
// src/lib/server/errors.ts — エラーユーティリティ
import { error as svelteError } from '@sveltejs/kit';

// アプリケーション固有のエラーコードを定義
export const ErrorCodes = {
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  VALIDATION: 'VALIDATION',
  RATE_LIMITED: 'RATE_LIMITED',
  INTERNAL: 'INTERNAL',
} as const;

type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

// 型安全なエラー生成ヘルパー
export function appError(
  status: number,
  code: ErrorCode,
  message: string,
): never {
  svelteError(status, { message, code });
}
```

```typescript
// +page.server.ts — ヘルパーを使った実装
import type { PageServerLoad } from './$types';
import { appError, ErrorCodes } from '$lib/server/errors';

export const load: PageServerLoad = async ({ params, locals }) => {
  if (!locals.user) {
    appError(401, ErrorCodes.UNAUTHORIZED, 'ログインが必要です');
  }

  const post = await db.post.findUnique({
    where: { slug: params.slug },
  });

  if (!post) {
    appError(404, ErrorCodes.NOT_FOUND, '記事が見つかりません');
  }

  if (post.authorId !== locals.user.id && locals.user.role !== 'admin') {
    appError(403, ErrorCodes.FORBIDDEN, 'この記事を閲覧する権限がありません');
  }

  return { post };
};
```

## よくある間違い

### error() の戻り値を使おうとする

```typescript
// ❌ error()は never型を返す — 以降のコードは到達不能
const result = error(404, 'Not found');
return { data: result };

// ✅ error()はそれ自体で処理が終了する
error(404, 'Not found');
// ↑ この行の後のコードは実行されない
```

### 予期しないエラーの詳細をユーザーに露出する

```typescript
// ❌ handleErrorでエラー詳細をそのまま返す
export const handleError: HandleServerError = async ({ error }) => {
  return {
    message: (error as Error).message, // スタックトレースや内部情報が漏洩する可能性
  };
};

// ✅ 汎用的なメッセージを返し、詳細はログに記録
export const handleError: HandleServerError = async ({ error }) => {
  console.error('Unexpected error:', error);
  return {
    message: 'サーバーエラーが発生しました',
  };
};
```

## まとめ

SvelteKitのエラーハンドリングは、予期されるエラー（`error()`）と予期しないエラー（`handleError`フック）を明確に分離する設計です。`App.Error`型をカスタマイズしてエラーコードやトラッキングIDを追加し、`+error.svelte`の階層構造を活用することで、ユーザーフレンドリーかつ型安全なエラー処理が実現できます。

## 次のステップ

- [Hooks](/sveltekit/server/hooks/) — handleErrorフックの詳細設定
- [フォーム処理とActions](/sveltekit/server/forms/) — fail()によるフォームバリデーション
- [app.d.tsの役割](/sveltekit/basics/global-types/) — App.Error型の拡張
- [特別な要素](/svelte/basics/special-elements/) — svelte:boundaryでのコンポーネントレベルエラーキャッチ
