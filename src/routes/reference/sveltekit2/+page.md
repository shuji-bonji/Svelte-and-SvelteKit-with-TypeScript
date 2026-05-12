---
title: SvelteKit 2.x 完全リファレンス
description: SvelteKit 2.xの包括的リファレンス - ファイルベースルーティング、データローディング、フォーム処理、APIルート、Hooks、デプロイメントまですべてを網羅
---

<script>
	import Admonition from '$lib/components/Admonition.svelte';
  import { base } from '$app/paths';
</script>

<Admonition type="tip" title="AI開発には公式のSvelte MCPサーバーの利用を推奨">

**Claude Desktop等のLLMを使った開発では、公式の[Svelte MCP](https://svelte.dev/docs/mcp)サーバーの利用を強く推奨します。**

Svelte MCPは、Svelteチームが提供する公式のModel Context Protocolサーバーで、以下の利点があります。

<ul>
<li><strong>常に最新</strong>: Svelte 5とSvelteKitの公式ドキュメントから直接情報を取得</li>
<li><strong>包括的な機能</strong>: ドキュメント検索、コード分析、自動修正提案、Playgroundリンク生成</li>
<li><strong>公式サポート</strong>: Svelteチームによる保守</li>
<li><strong>このリファレンスとの相乗効果</strong>: MCPで最新情報を取得し、このページで体系的な理解を深める</li>
</ul>

**セットアップ方法**（Claude Desktop）:

</Admonition>

```js
// claude_desktop_config.json
{
  "mcpServers": {
    "svelte": {
      "command": "npx",
      "args": ["-y", "@sveltejs/mcp"]
    }
  }
}
```

設定後、Claude Desktopを再起動してください。

**セットアップ方法**（Claude Code CLI）:

```bash
# プロジェクトスコープで追加（推奨）
claude mcp add svelte -- npx -y @sveltejs/mcp

# または、グローバルスコープで追加
claude mcp add --scope user svelte -- npx -y @sveltejs/mcp
```

設定後、Claude Codeを再起動してください。

```bash
# 登録済みMCPサーバーの一覧を確認
claude mcp list
```

会話中は `/mcp` コマンドでも接続状態を確認できます。

詳細: [Svelte MCP公式ドキュメント](https://svelte.dev/docs/mcp)

## SvelteKit 2.xとは

SvelteKitは、Svelteを使用したモダンなWebアプリケーション構築のためのフルスタックフレームワークです。

### 主な特徴

- **ファイルベースルーティング**: 直感的なプロジェクト構造
- **ハイブリッドレンダリング**: SSR/SSG/SPAの柔軟な選択
- **型安全**: TypeScriptによる完全な型サポート
- **Progressive Enhancement**: JavaScript無効環境でも動作
- **デフォルトSSR**: SEOとパフォーマンスの最適化

## プロジェクト構造

### 基本構造

```
src/
├── routes/              # ルートディレクトリ
│   ├── +layout.svelte   # ルートレイアウト
│   ├── +layout.ts       # レイアウトLoad関数
│   ├── +page.svelte     # ホームページ
│   ├── +page.ts         # ページLoad関数
│   └── +error.svelte    # エラーページ
├── lib/                 # 共有ライブラリ
│   ├── server/          # サーバー専用コード
│   └── components/      # 共有コンポーネント
├── hooks.server.ts      # サーバーフック
├── hooks.client.ts      # クライアントフック
└── app.d.ts            # 型定義
```

### ルートファイル一覧

| ファイル名          | 用途                     | 実行環境  |
| ------------------- | ------------------------ | --------- |
| `+page.svelte`      | ページコンポーネント     | Universal |
| `+page.ts`          | Universal Load関数       | Universal |
| `+page.server.ts`   | Server Load関数とActions | Server    |
| `+layout.svelte`    | レイアウトコンポーネント | Universal |
| `+layout.ts`        | レイアウトUniversal Load | Universal |
| `+layout.server.ts` | レイアウトServer Load    | Server    |
| `+server.ts`        | APIエンドポイント        | Server    |
| `+error.svelte`     | エラーページ             | Universal |

## 🛣 ルーティング

### 基本的なルーティング

```
src/routes/
├── about/+page.svelte         # /about
├── blog/
│   ├── +page.svelte           # /blog
│   └── [slug]/+page.svelte    # /blog/:slug
└── products/
    └── [...category]/+page.svelte # /products/a/b/c
```

### 動的ルート

```typescript
// src/routes/blog/[slug]/+page.ts
import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async ({ params, fetch }) => {
  const res = await fetch(`/api/posts/${params.slug}`);

  if (!res.ok) {
    error(404, 'Post not found');
  }

  const post = await res.json();

  return {
    post,
    slug: params.slug,
  };
};
```

### 高度なルーティングパターン

```
src/routes/
├── (auth)/                    # グループ化（URLに影響なし）
│   ├── login/+page.svelte     # /login
│   └── register/+page.svelte  # /register
├── [[lang]]/                  # オプショナルパラメータ
│   └── +page.svelte           # / または /en, /ja など
├── shop/
│   └── [...category]/         # Rest パラメータ
│       └── +page.svelte       # /shop/electronics/phones/apple
└── [id=integer]/              # パラメータマッチャー
    └── +page.svelte           # 整数のみマッチ
```

### パラメータマッチャー

```typescript
// src/params/integer.ts
import type { ParamMatcher } from '@sveltejs/kit';

export const match: ParamMatcher = (param) => {
  return /^\d+$/.test(param);
};
```

### Shallow routing

履歴エントリを作成せずにURLを更新する機能です。モーダルやタブなどの状態をURLに反映させる際に使用します。

```typescript
import { pushState, replaceState } from '$app/navigation';

// 新しい履歴エントリを作成（戻るボタンで戻れる）
pushState('/modal/open', { showModal: true });

// 現在の履歴エントリを置換（戻るボタンでは戻れない）
replaceState('/tab/settings', { activeTab: 'settings' });
```

#### 状態の取得

```svelte
<script lang="ts">
  import { page } from '$app/state';

  // shallow stateを取得
  let showModal = $derived(page.state?.showModal ?? false);
</script>

{#if showModal}
  <Modal onclose={() => history.back()} />
{/if}
```

### Link options

リンクのプリロード動作をカスタマイズするデータ属性です。

```svelte
<!-- hover時にプリロード（デフォルト） -->
<a href="/about">About</a>

<!-- コードを即座にプリロード（data は hover/tap で、ここはコード側） -->
<a href="/products" data-sveltekit-preload-code="eager">
  Products
</a>

<!-- タップ/クリック時にデータをプリロード -->
<a href="/heavy" data-sveltekit-preload-data="tap">
  Heavy Page
</a>

<!-- データのプリロードを無効化 -->
<a href="/external" data-sveltekit-preload-data="false">
  External
</a>

<!-- コードのみプリフェッチ（データは除く） -->
<a href="/lazy" data-sveltekit-preload-code>
  Lazy Load
</a>

<!-- ナビゲーション無効（フォーム送信等用） -->
<a href="/action" data-sveltekit-noscroll data-sveltekit-replacestate>
  No Scroll Action
</a>
```

## データローディング

### Universal Load関数（+page.ts）

```typescript
import type { PageLoad } from './$types';

export const load: PageLoad = async ({
  params,
  url,
  fetch,
  parent,
  depends,
  setHeaders,
}) => {
  // 親レイアウトのデータ取得
  const parentData = await parent();

  // URLパラメータ
  const page = url.searchParams.get('page') || '1';

  // データフェッチ（SSR対応）
  const response = await fetch(`/api/items?page=${page}`);
  const items = await response.json();

  // キャッシュヘッダー設定
  setHeaders({
    'cache-control': 'max-age=3600',
  });

  // 依存関係の宣言
  depends('app:items');

  return {
    items,
    page: parseInt(page),
    user: parentData.user,
  };
};
```

### Server Load関数（+page.server.ts）

```typescript
import type { PageServerLoad } from './$types';
import { redirect, error } from '@sveltejs/kit';
import { db } from '$lib/server/database';

export const load: PageServerLoad = async ({
  params,
  locals,
  cookies,
  platform,
}) => {
  // 認証チェック
  if (!locals.user) {
    redirect(303, '/login');
  }

  // データベースアクセス
  const data = await db.getData(params.id);

  if (!data) {
    error(404, 'Not found');
  }

  // 機密データを含む
  return {
    data,
    secretKey: process.env.SECRET_KEY,
  };
};
```

### ストリーミングSSR

```typescript
export const load: PageServerLoad = async () => {
  // 即座に返すデータ
  const critical = await fetchCriticalData();

  // ストリーミング（Promiseとして返す）
  return {
    critical,
    streamed: {
      slow: fetchSlowData(), // Promise
      verySlow: fetchVerySlowData(), // Promise
    },
  };
};
```

```svelte
<!-- +page.svelte -->
<script lang="ts">
  import type { PageProps } from './$types';
  let { data }: PageProps = $props();
</script>

<!-- 即座に表示 -->
<h1>{data.critical.title}</h1>

<!-- ストリーミングデータ -->
{#await data.streamed.slow}
  <Loading />
{:then slowData}
  <SlowContent {slowData} />
{:catch error}
  <Error {error} />
{/await}
```

## Remote Functions

SvelteKit 2.27+で導入されたサーバー連携機能です。型安全なサーバー関数を簡潔に定義でき、Standard Schemaによるバリデーション統合を備えます。

<Admonition type="info" title="ファイル規約: .remote.ts">

Remote Functionsは `.remote.ts`（または `.remote.js`）ファイルで定義します。これらのファイルはサーバーサイドでのみ実行され、クライアントからは自動的にRPCコールに変換されます。

</Admonition>

### query - データ取得

読み取り専用のデータ取得関数です。自動キャッシュ、重複排除が組み込まれています。

```typescript
// src/routes/users/[id]/page.remote.ts
import { query } from '$app/server';

export const getUser = query(async (id: string) => {
  const user = await db.user.findUnique({ where: { id } });
  return user;
});
```

```svelte
<!-- src/routes/users/[id]/+page.svelte -->
<script lang="ts">
  import { getUser } from './page.remote';

  // 型安全: userの型はサーバー関数の戻り値から推論
  const user = await getUser('123');
</script>
```

#### query.batch() - N+1問題の解決（v2.35+）

複数のクエリをバッチ処理して1つのリクエストにまとめます。サーバー側のコールバックは **引数の配列** を受け取り、**`(input, index) => output` 関数** を返します。

```typescript
// src/routes/weather.remote.ts
import * as v from 'valibot';
import { query } from '$app/server';
import * as db from '$lib/server/database';

export const getWeather = query.batch(v.string(), async (cityIds) => {
  const rows = await db.sql`SELECT * FROM weather WHERE city_id = ANY(${cityIds})`;
  const lookup = new Map(rows.map((w) => [w.city_id, w]));
  // 個別の呼び出しに対する解決関数を返す
  return (cityId) => lookup.get(cityId);
});
```

```svelte
<!-- 各コンポーネントから個別に呼び出してもバッチ処理される -->
{#each userIds as id}
  {@const user = await getUser(id)}
  <UserCard {user} />
{/each}
```

#### query.live() - リアルタイムストリーミング

`async function*`（async generator）を渡し、`yield` した値が逐次クライアントに届きます。`refresh()` は無く、代わりに **`connected` プロパティ** と **`reconnect()` メソッド** が生えます。SSR では最初に yield された値だけ返ってイテレーターは閉じます。

```typescript
import { query } from '$app/server';

export const getTime = query.live(async function* () {
  while (true) {
    yield new Date();
    await new Promise((r) => setTimeout(r, 1000));
  }
});
```

| 機能            | `query`         | `query.batch`        | `query.live`               |
| --------------- | --------------- | -------------------- | -------------------------- |
| 戻り値          | 単発の値        | 単発の値（集約）     | AsyncIterable              |
| キャッシュ      | 引数キー        | 引数キー             | 接続を共有                 |
| 再取得          | `.refresh()`    | `.refresh()`         | **無し**（`.reconnect()`） |
| 直接実行        | `.run()`        | `.run()`             | `.run()`（`AsyncGenerator`）|

#### .run() でキャッシュをバイパス

リアクティブコンテキスト外（イベントハンドラ等）でキャッシュをスキップして 1 回だけ実行したい場合は `.run()` を使います。`query.live` では `Promise<AsyncGenerator<T>>` を返します。

```typescript
async function refresh() {
  // キャッシュを使わず直接サーバーへリクエスト
  const data = await getData().run();
}
```

### form - フォーム処理

FormDataベースのミューテーション。Progressive Enhancement対応です。

```typescript
// src/routes/login/page.remote.ts
import { form } from '$app/server';
import * as v from 'valibot';

// Standard Schema（Valibot, Zod等）でバリデーション
const LoginSchema = v.object({
  email: v.pipe(v.string(), v.email()),
  password: v.pipe(v.string(), v.minLength(8)),
});

export const login = form(LoginSchema, async (data, { cookies }) => {
  const user = await authenticate(data);
  cookies.set('session', user.sessionId, { path: '/' });
  return { success: true, user };
});
```

#### form のフィールド API（`fields.*`）

スキーマから自動生成される `fields` ツリーは、HTML 入力要素・バリデーション・初期値設定をまとめて扱う API を提供します。

| API                                   | 用途                                                                            |
| ------------------------------------- | ------------------------------------------------------------------------------- |
| `fields.x.as(type)`                   | input 属性（`name` / `type` / `aria-invalid` 等）をスプレッド可能な形で返す      |
| `fields.x.as(type, value)`            | 第 2 引数で初期値・`radio` / `submit` / `hidden` の値を指定                      |
| `fields.x.issues()`                   | このフィールドの Issue 配列                                                     |
| `fields.x.value()` / `fields.x.set()` | 現在値の取得・更新                                                              |
| `fields.allIssues()`                  | フォーム全体の Issue（フィールド非依存含む）                                    |
| `form.validate({ includeUntouched })` | プログラム的にバリデーション実行                                                |
| `form.preflight(schema)`              | クライアント側で先行バリデーション（失敗時はサーバーに送らない）                |
| `form.for(id)`                        | 同じフォームを独立インスタンスとして複数生成（リスト編集）                      |
| `form.enhance(callback)`              | 送信処理をカスタマイズ（`callback({ form, data, submit })`）                    |
| `form.result`                         | ハンドラ戻り値が代入される ephemeral な値                                       |
| `form.pending`                        | 送信中のリクエスト数                                                            |

`field.as(type)` でサポートされる input type は `text` / `number` / `password` / `email` / `url` / `tel` / `search` / `date` / `datetime-local` / `time` / `color` / `range` / `file` / `checkbox` / `radio` / `submit` / `hidden` / `select` / `select multiple`。`_` プレフィックスのフィールド名（例: `_password`）はバリデーション失敗時に値が送り返されない（機密データ保護）。

#### enhance の `submit()` は boolean を返す

`await submit()` の戻り値で「バリデーション失敗」と「ネットワーク/サーバーエラー」を区別できます。

```svelte
<form
  {...login.enhance(async ({ form, submit }) => {
    try {
      if (await submit()) {
        form.reset(); // 自動 reset されないため明示
        // 成功時の処理
      } else {
        // preflight / サーバースキーマで弾かれた（=バリデーション失敗）
      }
    } catch (error) {
      // ネットワーク / 5xx / error() などの実行時エラー
    }
  })}
>
  <!-- ... -->
</form>
```

#### invalid() でプログラマティックバリデーション

`@sveltejs/kit` の `invalid()` は **special return**（`throw` 不要）。第 2 引数 `issue` から型安全な Issue ファクトリが取れる。

```typescript
import { invalid } from '@sveltejs/kit';

export const register = form(schema, async (data, issue) => {
  if (await db.exists(data.email)) {
    invalid(issue.email('既に使用されています'));
  }
});
```

### command - サーバーコマンド

イベントハンドラから呼び出す命令型のミューテーションです。

```typescript
// src/routes/posts/page.remote.ts
import { command } from '$app/server';

export const deletePost = command(async (id: string) => {
  await db.post.delete({ where: { id } });
  return { deleted: true };
});
```

```svelte
<script lang="ts">
  import { deletePost } from './page.remote';
</script>

<button onclick={async () => {
  const result = await deletePost(post.id);
  if (result.deleted) {
    // UIを更新
  }
}}>
  削除
</button>
```

### prerender - ビルド時データ生成

```typescript
// src/routes/page.remote.ts
import { prerender } from '$app/server';

export const getConfig = prerender(async () => {
  return await fetchConfiguration();
});
```

### Standard Schema バリデーション

Remote Functions は [Standard Schema](https://github.com/standard-schema/standard-schema) をサポートし、Zod、Valibot、ArkType等のバリデーションライブラリと統合できます。

```typescript
import { query, form } from '$app/server';
import * as v from 'valibot';

// queryでもスキーマバリデーション可能
const SearchSchema = v.object({
  q: v.pipe(v.string(), v.minLength(1)),
  page: v.pipe(v.number(), v.integer(), v.minValue(1)),
});

export const search = query(SearchSchema, async (params) => {
  // params は型安全（{ q: string, page: number }）
  return await db.posts.search(params);
});
```

### $app/server エクスポート一覧

| エクスポート         | 説明                                                                                |
| -------------------- | ----------------------------------------------------------------------------------- |
| `query`              | 読み取り専用データ取得（キャッシュ・重複排除付き）                                  |
| `query.batch`        | バッチクエリ（N+1問題解決、v2.35+）                                                 |
| `query.live`         | AsyncIterable によるリアルタイムストリーミング。`connected` / `reconnect()` を持つ  |
| `form`               | FormDataベースのミューテーション。`fields.*.as()` / `preflight` / `for` / `enhance` |
| `command`            | 命令型ミューテーション                                                              |
| `prerender`          | ビルド時データ生成（`inputs` で列挙、`dynamic: true` でランタイム動的取得も可）     |
| `getRequestEvent()`  | 現在のRequestEventへのアクセス（v2.20+）                                            |
| `requested()`        | クライアント要求の refresh / reconnect を `{ arg, query }` で受け取る                |
| `requested().refreshAll()` / `.reconnectAll()` | 一括 refresh / reconnect の短縮形                                                   |
| `read()`             | `import` したアセットを `Response` として読む（v2.4+）                              |

### Remote Functions の主要メソッド・プロパティ

#### query 系

| API                                  | 対象          | 用途                                                            |
| ------------------------------------ | ------------- | --------------------------------------------------------------- |
| `query(...)` / `query(schema, ...)`  | query         | 戻り値は `Promise<T>`。`.refresh()` / `.set()` / `.run()` を持つ |
| `.refresh()`                         | query / batch | サーバーから再取得                                              |
| `.set(value)`                        | query         | クライアントキャッシュを直接更新                                |
| `.withOverride(updater)`             | query         | 楽観的更新の差し替え。`submit().updates(...)` と組合せ          |
| `.run()`                             | 全 query 系   | キャッシュバイパス。`query.live` は `Promise<AsyncGenerator>`   |
| `query.loading` / `error` / `current`| query         | `await` の代替の状態プロパティ                                  |
| `live.connected` / `live.reconnect()`| query.live    | 接続状態と再接続                                                |

#### form / command 系

| API                                  | 対象           | 用途                                                            |
| ------------------------------------ | -------------- | --------------------------------------------------------------- |
| `form.fields.*`                      | form           | フィールド API ツリー（前述）                                   |
| `form.enhance(cb)`                   | form           | 送信カスタマイズ。`submit()` は `Promise<boolean>`              |
| `form.preflight(schema)`             | form           | クライアント先行バリデーション                                  |
| `form.for(id)`                       | form           | 独立フォームインスタンス（リスト編集）                          |
| `form.result` / `form.pending`       | form           | ハンドラ戻り値（ephemeral）/ 送信中リクエスト数                 |
| `submit().updates(...)`              | form / command | Single-flight: クライアントが更新対象を指定                     |
| `requested(fn, limit)`               | server         | クライアント要求を受け取る。`{ arg, query }` イテラブル          |
| `requested(fn, limit).refreshAll()`  | server         | 一括 refresh 短縮形                                             |
| `invalid(...)`                       | form handler   | プログラマティックバリデーション（`@sveltejs/kit`、`throw` 不要）|
| `'unchecked'`                        | 全 RFs         | スキーマ省略（型は手書き、慎重に使う）                          |

### experimental フラグの opt-in

Remote Functions は 2 つの experimental フラグを **両方** 有効にして本来の使い勝手になります。

```typescript
// svelte.config.js
const config = {
  kit: { experimental: { remoteFunctions: true } },
  compilerOptions: { experimental: { async: true } }, // <svelte:boundary> と併用
};
```

### transport hook（Universal hook）

`src/hooks.ts` の `transport` で **カスタム型のシリアライズ**（Remote Functions / Load / Form Actions 共通）を定義できます。

```typescript
// src/hooks.ts
import type { Transport } from '@sveltejs/kit';
import { Vector } from '$lib/math';

export const transport: Transport = {
  Vector: {
    encode: (value) => value instanceof Vector && [value.x, value.y],
    decode: ([x, y]) => new Vector(x, y),
  },
};
```

## Form Actions

### 基本的なActions

```typescript
// +page.server.ts
import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import { z } from 'zod';

// バリデーションスキーマ
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);

    // バリデーション
    const result = schema.safeParse(data);

    if (!result.success) {
      return fail(400, {
        data,
        errors: result.error.flatten().fieldErrors,
      });
    }

    // 処理実行
    const user = await authenticateUser(result.data);

    if (!user) {
      return fail(401, {
        data: result.data,
        message: 'Invalid credentials',
      });
    }

    // セッション設定
    cookies.set('session', user.sessionId, {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    });

    return { success: true };
  },
};
```

### 複数Actions

```typescript
export const actions: Actions = {
  create: async ({ request, locals }) => {
    const formData = await request.formData();
    const title = formData.get('title');

    if (!title || typeof title !== 'string') {
      return fail(400, {
        error: 'タイトルは必須です',
      });
    }

    const todo = await db.todo.create({
      data: {
        title,
        userId: locals.user.id,
      },
    });

    return { success: true, todo };
  },

  update: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get('id');
    const completed = formData.get('completed') === 'true';

    await db.todo.update({
      where: { id: String(id) },
      data: { completed },
    });

    return { success: true };
  },

  delete: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get('id');

    await db.todo.delete({
      where: { id: String(id) },
    });

    return { success: true };
  },
};
```

### Progressive Enhancement対応フォーム

```svelte
<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ActionData } from './$types';

  let { form }: { form: ActionData } = $props();
  let loading = $state(false);
</script>

<form
  method="POST"
  action="?/create"
  use:enhance={() => {
    loading = true;

    return async ({ result, update }) => {
      loading = false;

      if (result.type === 'success') {
        // 成功処理
        toast.success('作成しました');
      }

      await update();
    };
  }}
>
  <input name="title" required disabled={loading} />

  <button type="submit" disabled={loading}>
    {loading ? '作成中...' : '作成'}
  </button>
</form>

{#if form?.error}
  <p class="error">{form.error}</p>
{/if}
```

### ファイルアップロード

```typescript
export const actions: Actions = {
  upload: async ({ request }) => {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return fail(400, { message: 'No file uploaded' });
    }

    // ファイルサイズチェック
    if (file.size > 5 * 1024 * 1024) {
      return fail(400, { message: 'File too large' });
    }

    // ファイル保存
    const buffer = await file.arrayBuffer();
    const filename = `${crypto.randomUUID()}-${file.name}`;

    await saveFile(filename, buffer);

    return {
      success: true,
      filename,
    };
  },
};
```

## 🔌 APIルート

### RESTful API

```typescript
// src/routes/api/posts/+server.ts
import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url, locals }) => {
  // 認証チェック
  if (!locals.user) {
    error(401, 'Unauthorized');
  }

  // クエリパラメータ
  const page = parseInt(url.searchParams.get('page') ?? '1');
  const limit = parseInt(url.searchParams.get('limit') ?? '10');

  const posts = await db.posts.findMany({
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: 'desc' },
  });

  return json(posts);
};

export const POST: RequestHandler = async ({ request, locals }) => {
  const data = await request.json();

  // バリデーション
  const validated = validatePost(data);

  const post = await db.posts.create({
    data: {
      ...validated,
      authorId: locals.user.id,
    },
  });

  return json(post, { status: 201 });
};

export const DELETE: RequestHandler = async ({ params }) => {
  await db.posts.delete({
    where: { id: params.id },
  });

  return new Response(null, { status: 204 });
};
```

### Server-Sent Events (SSE)

```typescript
export const GET: RequestHandler = () => {
  const stream = new ReadableStream({
    start(controller) {
      let count = 0;

      const interval = setInterval(() => {
        controller.enqueue(`data: ${JSON.stringify({ count })}\n\n`);
        count++;

        if (count > 10) {
          clearInterval(interval);
          controller.close();
        }
      }, 1000);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
    },
  });
};
```

## 🪝 Hooks

### Server Hooks（hooks.server.ts）

```typescript
import type { Handle, HandleServerError, HandleFetch } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';

// 認証ミドルウェア
const authentication: Handle = async ({ event, resolve }) => {
  const session = event.cookies.get('session');

  if (session) {
    const user = await validateSession(session);
    event.locals.user = user;
  }

  return resolve(event);
};

// セキュリティヘッダー
const security: Handle = async ({ event, resolve }) => {
  const response = await resolve(event);

  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // CSP
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline';",
  );

  return response;
};

// ロギング
const logging: Handle = async ({ event, resolve }) => {
  const start = performance.now();

  const response = await resolve(event);

  const duration = performance.now() - start;
  console.log(`${event.request.method} ${event.url.pathname} - ${duration}ms`);

  return response;
};

// ミドルウェアを順番に実行
export const handle = sequence(authentication, security, logging);

// エラーハンドリング
export const handleError: HandleServerError = ({ error, event }) => {
  console.error('Server error:', error);

  // 本番環境では詳細を隠す
  if (import.meta.env.PROD) {
    return {
      message: 'Internal Server Error',
      code: 'INTERNAL_ERROR',
    };
  }

  return {
    message: error.message,
    stack: error.stack,
  };
};

// Fetch処理のカスタマイズ
export const handleFetch: HandleFetch = async ({ request, fetch }) => {
  // APIリクエストに認証ヘッダーを追加
  if (request.url.startsWith('https://api.example.com')) {
    request.headers.set('Authorization', `Bearer ${process.env.API_KEY}`);
  }

  return fetch(request);
};
```

### handleValidationError（hooks.server.ts）

Remote Functionsの Standard Schema バリデーションエラーをカスタマイズするフックです。引数は `{ event, issues }` の形で、`issues` は Standard Schema の Issue 配列が**トップレベルで**渡されます（`event.issues` ではない点に注意）。

```typescript
import type { HandleValidationError } from '@sveltejs/kit';

export const handleValidationError: HandleValidationError = ({
  event,
  issues,
}) => {
  // バリデーションエラーをカスタム形式で返す
  // (issues は event.issues ではなく、トップレベル引数として受け取る)
  return {
    message: 'バリデーションエラー',
    errors: issues.map((issue) => ({
      path: issue.path,
      message: issue.message,
    })),
  };
};
```

### Client Hooks（hooks.client.ts）

```typescript
import type { HandleClientError } from '@sveltejs/kit';

export const handleError: HandleClientError = ({ error, event }) => {
  console.error('Client error:', error);

  // エラー追跡
  if (import.meta.env.PROD) {
    // Sentryなどへ送信
    captureException(error);
  }

  return {
    message: 'アプリケーションエラーが発生しました',
    code: 'CLIENT_ERROR',
  };
};
```

## Server-only modules

サーバー専用コードをクライアントから保護する機能です。

### $lib/server ディレクトリ

```typescript
// src/lib/server/database.ts
import { PrismaClient } from '@prisma/client';

// このファイルはサーバーコードからのみインポート可能
export const prisma = new PrismaClient();
```

### .server ファイル

```typescript
// src/lib/auth.server.ts
import { hash, verify } from 'argon2';

export async function hashPassword(password: string) {
  return hash(password);
}
```

### プライベート環境変数

```typescript
// サーバーのみ（静的）
import { DATABASE_URL, API_SECRET } from '$env/static/private';

// サーバーのみ（動的）
import { env } from '$env/dynamic/private';
```

## Snapshots

ページ間ナビゲーション時にDOM状態を保持する機能です。

```svelte
<!-- +page.svelte -->
<script lang="ts">
  import type { Snapshot } from './$types';

  let comment = $state('');

  // snapshot オブジェクトをエクスポート
  export const snapshot: Snapshot<string> = {
    // ページを離れる直前に呼ばれる
    capture: () => comment,
    // ページに戻ってきた時に呼ばれる
    restore: (value) => comment = value
  };
</script>

<textarea bind:value={comment}></textarea>
```

### 複数値の保持

```typescript
interface FormSnapshot {
  title: string;
  content: string;
  step: number;
}

export const snapshot: Snapshot<FormSnapshot> = {
  capture: () => ({ title, content, step }),
  restore: (value) => {
    title = value.title;
    content = value.content;
    step = value.step;
  },
};
```

## レイアウト

### ネストレイアウト

```svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import type { LayoutData } from './$types';
  import type { Snippet } from 'svelte';

  let { data, children }: { data: LayoutData; children?: Snippet } = $props();
</script>

<header>
  <nav>
    {#if data.user}
      <a href="/dashboard">Dashboard</a>
      <form method="POST" action="/logout">
        <button>Logout</button>
      </form>
    {:else}
      <a href="/login">Login</a>
    {/if}
  </nav>
</header>

<main>
  {@render children?.()}
</main>

<footer>
  <p>&copy; 2025 My App</p>
</footer>
```

### グループレイアウト

```svelte
<!-- src/routes/(auth)/+layout.svelte -->
<script lang="ts">
  import type { Snippet } from 'svelte';
  let { children }: { children?: Snippet } = $props();
</script>

<div class="auth-container">
  <div class="auth-card">
    {@render children?.()}
  </div>
</div>
```

### レイアウトのリセット

```svelte
<!-- src/routes/admin/+layout@.svelte -->
<!-- @ でルートレイアウトにリセット -->
```

## 認証と認可

### 認証フロー実装

```typescript
// src/routes/login/+page.server.ts
import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import bcrypt from 'bcrypt';

export const load: PageServerLoad = async ({ locals }) => {
  if (locals.user) {
    redirect(303, '/dashboard');
  }
};

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    const formData = await request.formData();
    const email = formData.get('email');
    const password = formData.get('password');

    const user = await db.user.findUnique({
      where: { email: String(email) },
    });

    if (
      !user ||
      !(await bcrypt.compare(String(password), user.hashedPassword))
    ) {
      return fail(400, {
        email,
        error: 'メールアドレスまたはパスワードが正しくありません',
      });
    }

    const session = await createSession(user.id);

    cookies.set('session', session.token, {
      path: '/',
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30日
    });

    redirect(303, '/dashboard');
  },
};
```

### 保護されたルート

```typescript
// src/routes/admin/+layout.server.ts
import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: LayoutServerLoad = async ({ locals }) => {
  if (!locals.user) {
    redirect(303, '/login');
  }

  if (!locals.user.isAdmin) {
    redirect(303, '/unauthorized');
  }

  return {
    user: locals.user,
  };
};
```

## 型定義

### app.d.ts

```typescript
// src/app.d.ts
declare global {
  namespace App {
    interface Error {
      code?: string;
      message: string;
    }

    interface Locals {
      user: User | null;
      session: Session | null;
    }

    interface PageData {
      user?: User;
    }

    interface PageState {
      selected?: string;
    }

    interface Platform {
      env?: {
        DB: D1Database;
        CACHE: KVNamespace;
      };
    }
  }
}

export {};
```

### 自動生成される型

```typescript
// ./$types から自動生成
import type {
  PageLoad,
  PageData,
  PageProps, // Svelte 5推奨: data + form を含む
  PageServerLoad,
  PageServerData,
  LayoutLoad,
  LayoutData,
  LayoutProps, // Svelte 5推奨: data + children を含む
  LayoutServerLoad,
  LayoutServerData,
  Actions,
  ActionData,
  RequestHandler,
} from './$types';
```

#### PageProps / LayoutProps（Svelte 5推奨）

Svelte 5では `PageData` の代わりに `PageProps` を使用することが推奨されます。`PageProps` は `data` と `form` をまとめた型です。

```svelte
<!-- ❌ 旧パターン（動作はする） -->
<script lang="ts">
  import type { PageData, ActionData } from './$types';
  let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<!-- ✅ 新パターン（推奨） -->
<script lang="ts">
  import type { PageProps } from './$types';
  let { data, form }: PageProps = $props();
</script>
```

```svelte
<!-- +layout.svelte -->
<script lang="ts">
  import type { LayoutProps } from './$types';
  let { data, children }: LayoutProps = $props();
</script>
```

### $app/types - ルート型ユーティリティ（v2.26+）

型安全なルーティングのためのユーティリティ型です。`.svelte-kit/types` に自動生成されたルート情報をベースに、ビルド時のルート列挙と型推論を可能にします。

#### API 一覧

| 型                    | 用途                                                                | 例                                                          |
| --------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------- |
| `RouteId`             | アプリ内すべてのルート ID の合同型。`page.route.id` の型に使う      | `'/' \| '/blog/[slug]' \| '/users/[id]'`                    |
| `RouteParams<R>`      | 指定ルートのパラメータ型を取得                                      | `RouteParams<'/blog/[slug]'>` → `{ slug: string }`          |
| `LayoutParams<R>`     | レイアウトのパラメータ型（子ルートのオプショナルパラメータも含む） | `LayoutParams<'/(app)'>`                                    |
| `Pathname`            | アプリ内のすべての有効なパス名の合同型                              | `'/'` / `/blog/[slug]` 由来の文字列リテラル                 |
| `ResolvedPathname`    | `Pathname` + `paths.base` プレフィックス。`page.url.pathname` の型 | `${base}/blog/foo`                                          |
| `Asset`               | `static/` 配下のファイル名 + `import` で生成されるアセットパス     | `'/favicon.png' \| '/robots.txt' \| (string & {})`          |

```typescript
import type {
  RouteId,
  RouteParams,
  LayoutParams,
  Pathname,
  ResolvedPathname,
  Asset,
} from '$app/types';

// すべてのルートIDの合同型
type AllRoutes = RouteId;
// 例: '/about' | '/blog/[slug]' | '/users/[id]'

// 特定ルートのパラメータ型を取得
type BlogParams = RouteParams<'/blog/[slug]'>;
// { slug: string }

// レイアウトパラメータ（子ルートのオプショナルなもの含む）
type AppLayoutParams = LayoutParams<'/(app)'>;

// 型安全なパス名（存在しないルートはコンパイルエラー）
const path: Pathname = '/about';

// base パス込みの解決済みパス名
const resolved: ResolvedPathname = '/blog/foo';

// static/ 配下のアセット
const icon: Asset = '/favicon.png';
```

:::info[自動生成型の詳細]
これらの型は `.svelte-kit/types/` 配下に自動生成されます。生成タイミングや `./$types` との関係は [自動生成される型]({base}/deep-dive/auto-generated-types/) を参照してください。
:::

## 環境変数

### 静的環境変数

```typescript
// サーバーのみ
import { DATABASE_URL, API_SECRET } from '$env/static/private';

// パブリック
import { PUBLIC_API_URL, PUBLIC_SITE_NAME } from '$env/static/public';
```

### 動的環境変数

```typescript
import { env } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';

// 実行時に値が決まる
const port = env.PORT || '3000';
const apiUrl = publicEnv.PUBLIC_API_URL;
```

## デプロイメント

### アダプター設定

```javascript
// svelte.config.js
import adapter from '@sveltejs/adapter-auto';
// または特定プラットフォーム
// import adapter from '@sveltejs/adapter-vercel';
// import adapter from '@sveltejs/adapter-node';
// import adapter from '@sveltejs/adapter-cloudflare';

export default {
  kit: {
    adapter: adapter(),

    // プリレンダリング
    prerender: {
      handleHttpError: 'warn',
      entries: ['*'],
    },

    // CSP
    csp: {
      directives: {
        'script-src': ['self'],
        'style-src': ['self', 'unsafe-inline'],
      },
    },

    // パス設定
    paths: {
      base: process.env.BASE_PATH || '',
    },
  },
};
```

### ルート解決方式（`kit.router.resolution`）

SvelteKit 2.17+ で導入された、クライアント・サーバーどちらでルートマッチを行うかの切り替えオプションです。

| 値                    | 解決場所         | 特徴                                                                                                  |
| --------------------- | ---------------- | ----------------------------------------------------------------------------------------------------- |
| `'client'`（既定）    | クライアント側   | ルートマニフェストを初回ロード時にダウンロードし、以降のナビゲーションは即座に解決                    |
| `'server'`            | サーバー側       | 未訪問パスのたびにサーバーへ問い合わせる。マニフェスト不要・ルート一覧の隠蔽・ミドルウェア介在が可能 |

```javascript
// svelte.config.js
export default {
  kit: {
    router: {
      resolution: 'server', // ルート解決をサーバー側で行う
    },
  },
};
```

:::tip[`bundleStrategy` との関係]
ルートが多くマニフェストが膨らむアプリでは、`resolution: 'server'` + 後述の `bundleStrategy: 'split'`（既定）を組み合わせることで初回ロードを軽量化できます。プリレンダリング時は解決結果もプリレンダリングされます。
:::

### バンドル戦略（`kit.output.bundleStrategy`）

SvelteKit 2.13+ の出力形式オプション。アプリの JS/CSS をどう配信するかを指定します。

| 値                    | 出力形式                          | 用途                                                              |
| --------------------- | --------------------------------- | ----------------------------------------------------------------- |
| `'split'`（既定）     | エントリ毎にチャンク分割          | 通常の Web アプリ。コード分割で初回ロードを軽量化                 |
| `'single'`            | 単一の `.js` と `.css`            | 小規模アプリ・組み込み配信。HTTP リクエスト数を最小化             |
| `'inline'`            | HTML 内に全 JS/CSS をインライン   | サーバーレスなファイル配布・オフライン HTML 単体配布              |

```javascript
// svelte.config.js
export default {
  kit: {
    output: {
      bundleStrategy: 'inline', // すべての JS/CSS を HTML にインライン化
    },
  },
};
```

:::caution[`'inline'` 利用時のアセット]
`bundleStrategy: 'inline'` で画像等もインラインしたい場合は、Vite 側の `build.assetsInlineLimit` を `Infinity` などに引き上げ、アセットを `import` 経由で取り込む必要があります。
:::

### CSRF 設定（`kit.csrf`）

クロスサイトリクエストフォージェリ（CSRF）対策。本番環境でのみ動作し、ローカル開発では無効です。

| 設定                  | 型          | 説明                                                                                                  |
| --------------------- | ----------- | ----------------------------------------------------------------------------------------------------- |
| `checkOrigin`         | `boolean`   | （deprecated）`POST/PUT/PATCH/DELETE` 時に `Origin` ヘッダを検証。`trustedOrigins: ['*']` で代替推奨 |
| `trustedOrigins`      | `string[]` | 信頼するクロスオリジン送信元の配列。プロトコル込みで完全な origin を指定                              |

```javascript
// svelte.config.js
export default {
  kit: {
    csrf: {
      // 信頼するオリジンを明示（決済プロバイダや認証サービス等）
      trustedOrigins: [
        'https://payment-gateway.com',
        'https://auth.example.com',
      ],
    },
  },
};
```

:::warning[`trustedOrigins: ['*']` は最終手段]
`'*'` を含めるとすべてのオリジンからの送信を許可し、事実上 CSRF チェックを無効化します。完全に信頼できるオリジンのみ明示的に列挙すること。旧 `checkOrigin: false` 相当の挙動は `trustedOrigins: ['*']` で表現します。
:::

### レンダリングモード制御

```typescript
// +page.ts or +page.server.ts
export const prerender = true; // プリレンダリング
export const ssr = true; // SSR有効
export const csr = true; // CSR有効

// 動的プリレンダリング
export const entries = () => {
  return [{ slug: 'post-1' }, { slug: 'post-2' }];
};

// トレイリングスラッシュ
export const trailingSlash = 'always'; // 'never' | 'always' | 'ignore'
```

## パフォーマンス最適化

### プリフェッチ戦略

```svelte
<!-- hover時にプリフェッチ（デフォルト） -->
<a href="/about">About</a>

<!-- コードを即座にプリフェッチ（"eager" は preload-code のみ有効値） -->
<a href="/products" data-sveltekit-preload-code="eager">
  Products
</a>

<!-- タップ時にデータをプリフェッチ -->
<a href="/heavy" data-sveltekit-preload-data="tap">
  Heavy Page
</a>

<!-- データプリフェッチ無効（"false" を指定） -->
<a href="/external" data-sveltekit-preload-data="false">
  External
</a>

<!-- コードのみプリフェッチ -->
<a href="/lazy" data-sveltekit-preload-code>
  Lazy Load
</a>
```

### データ無効化

```typescript
import { invalidate, invalidateAll } from '$app/navigation';

// 特定URLの無効化
await invalidate('/api/data');

// カスタム識別子で無効化
await invalidate('app:data');

// すべて無効化
await invalidateAll();

// Load関数で依存関係宣言
export const load: PageLoad = async ({ depends }) => {
  depends('app:data');
  // ...
};
```

### キャッシュ戦略

```typescript
// src/routes/api/data/+server.ts
export const GET: RequestHandler = async ({ setHeaders }) => {
  const data = await fetchData();

  setHeaders({
    'cache-control': 'public, max-age=3600', // 1時間キャッシュ
    etag: generateEtag(data),
  });

  return json(data);
};
```

## CLI ツール（sv）

SvelteKitプロジェクト管理のためのCLIツールです。

### プロジェクト作成

```bash
# 新規プロジェクト作成
npx sv create my-app

# テンプレート選択
npx sv create my-app --template minimal
npx sv create my-app --template demo
npx sv create my-app --template library
```

### 開発ツール

```bash
# 依存関係の追加
npx sv add tailwindcss
npx sv add drizzle
npx sv add lucia

# 型チェック
npx sv check

# マイグレーション
npx sv migrate
```

## 高度な機能

### Service Worker / PWA

```typescript
// src/service-worker.ts
/// <reference types="@sveltejs/kit" />
import { build, files, version } from '$service-worker';

const CACHE = `cache-${version}`;
const ASSETS = [...build, ...files];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(async (keys) => {
      for (const key of keys) {
        if (key !== CACHE) await caches.delete(key);
      }
    }),
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    }),
  );
});
```

### WebSocket統合

```typescript
// vite.config.ts
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { Server } from 'socket.io';

export default defineConfig({
  plugins: [
    sveltekit(),
    {
      name: 'websocket-server',
      configureServer(server) {
        const io = new Server(server.httpServer);

        io.on('connection', (socket) => {
          console.log('Client connected');

          socket.on('message', (data) => {
            io.emit('broadcast', data);
          });
        });
      },
    },
  ],
});
```

### Observability（OpenTelemetry）

SvelteKitアプリケーションの監視・トレーシング設定です。

```typescript
// hooks.server.ts
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter({
    url: 'http://localhost:4318/v1/traces',
  }),
  serviceName: 'sveltekit-app',
});

sdk.start();
```

#### リクエストトレーシング

```typescript
import { trace } from '@opentelemetry/api';

const tracer = trace.getTracer('sveltekit');

export const handle: Handle = async ({ event, resolve }) => {
  return tracer.startActiveSpan('request', async (span) => {
    span.setAttribute('http.method', event.request.method);
    span.setAttribute('http.url', event.url.pathname);

    try {
      const response = await resolve(event);
      span.setAttribute('http.status_code', response.status);
      return response;
    } finally {
      span.end();
    }
  });
};
```

### Packaging（ライブラリ公開）

コンポーネントライブラリをnpmパッケージとして公開する方法です。

```bash
# ライブラリテンプレートでプロジェクト作成
npx sv create my-component-library
# "Library" を選択
```

#### package.json 設定

```json
{
  "name": "@yourorg/svelte-components",
  "version": "1.0.0",
  "type": "module",
  "files": ["dist"],
  "svelte": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "svelte": "./dist/index.js"
    },
    "./Button.svelte": {
      "types": "./dist/Button.svelte.d.ts",
      "svelte": "./dist/Button.svelte"
    }
  },
  "sideEffects": ["**/*.css"]
}
```

#### ビルドと公開

```bash
# ビルド
npx svelte-package

# 公開
npm publish --access public
```

## テスト

### 統合テスト

```typescript
import { expect, test } from '@playwright/test';

test('user can login', async ({ page }) => {
  await page.goto('/login');

  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL('/dashboard');
  await expect(page.locator('h1')).toContainText('Dashboard');
});
```

### APIテスト

```typescript
import { describe, it, expect } from 'vitest';

describe('API Routes', () => {
  it('GET /api/posts', async () => {
    const response = await fetch('/api/posts');
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
  });
});
```

## ベストプラクティス

### 1. 型安全性の確保

```typescript
// ✅ 良い例：./$typesから型をインポート
import type { PageLoad, Actions } from './$types';

// ❌ 避けるべき：手動の型定義
type MyPageLoad = (event: any) => any;
```

### 2. Progressive Enhancement

```svelte
<!-- ✅ 良い例：JavaScriptなしでも動作 -->
<form method="POST" use:enhance>
  <button type="submit">Submit</button>
</form>

<!-- ❌ 避けるべき：JavaScriptに依存 -->
<button onclick={handleSubmit}>Submit</button>
```

### 3. エラーハンドリング

```typescript
// ✅ 良い例：適切なエラーハンドリング
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  try {
    const data = await fetchData(params.id);
    return { data };
  } catch (err) {
    error(500, {
      message: 'Failed to load data',
      code: 'LOAD_ERROR',
    });
  }
};
```

### 4. エラーバウンダリー

```svelte
<!-- src/routes/+error.svelte -->
<script lang="ts">
  import { page } from '$app/state';

  // +error.svelte は page.error / page.status を使う（独自 props ではない）
  const status = $derived(page.status);
  const error = $derived(page.error);
</script>

<div class="error-page">
  <h1>{status}</h1>
  <p>{error?.message}</p>

  {#if import.meta.env.DEV}
    <pre>{JSON.stringify(error, null, 2)}</pre>
  {/if}

  <a href="/">ホームに戻る</a>
</div>
```

## 関連リソース

- [Svelte 5 完全リファレンス]({base}/reference/svelte5/) - Svelte 5の詳細
- [SvelteKit基礎編]({base}/sveltekit/basics/) - 基礎から学ぶ
- [実装例]({base}/examples/) - 実践的なサンプルコード

## まとめ

SvelteKit 2.xは、TypeScriptとの完全な統合により、型安全で高性能なフルスタックWebアプリケーションの構築を可能にします。Progressive Enhancementを重視し、JavaScript無効環境でも動作する堅牢なアプリケーションを効率的に開発できます。
