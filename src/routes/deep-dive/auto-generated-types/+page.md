---
title: SvelteKitが自動生成する型の一覧
description: SvelteKitが生成する./$typesの中身を一覧し、PageDataやActionResultなど主要型の意味と拡張方法を整理。タイプセーフなloadやアクションを書くための参照として活用できる技術解説で、型エラーの防止に役立つ。各型の活用例付き。詳しい手順とチェックリスト付き。運用時の確認ポイントも掲載
---

**SvelteKitが自動生成する型は決まっていて、ファイル名に応じて特定の型が生成されます**。

## `./$types`から自動生成される型一覧

SvelteKitは、ルートディレクトリ内のファイル名に基づいて、適切な型定義を自動的に生成します。これにより、手動で型定義を書く必要がなく、型安全なアプリケーション開発が可能になります。

### 1. Load関数の型（4種類）

データ取得用のLoad関数に対して、ファイルの種類に応じた専用の型が自動生成されます。これらの型は、イベントオブジェクトのプロパティや返り値の型を厳密に定義します。

```typescript
// ファイル名 → 生成される型
+page.ts        → PageLoad        // ユニバーサル（クライアント/サーバー両方）でのページデータ取得
+page.server.ts → PageServerLoad  // サーバーサイドのみでのページデータ取得（Cookie、DBアクセス可）
+layout.ts      → LayoutLoad      // ユニバーサルでのレイアウトデータ取得
+layout.server.ts → LayoutServerLoad // サーバーサイドのみでのレイアウトデータ取得
```

### 2. データ型（2種類）

Svelteコンポーネント内で、Load関数から返されたデータを受け取るための型です。これらの型により、`data` propの中身が完全に型付けされます。

```typescript
// すべてのSvelteファイルで利用可能
+page.svelte    → PageData, PageServerData      // ページコンポーネント用のデータ型
+layout.svelte  → LayoutData, LayoutServerData  // レイアウトコンポーネント用のデータ型  
+error.svelte   → PageData                      // エラーページ用のデータ型
```

### 2-bis. Props 型（2種類、SvelteKit 2.16.0 以降）

`data` / `form` / `children` などのコンポーネントに渡される props 一式をまとめて型付けする**新世代の型**です。Svelte 5 Runes ベースのプロジェクトではこちらを使うのが推奨スタイルとなります。

```typescript
// Svelteコンポーネントの props をまとめて型付け
+page.svelte    → PageProps    // { data: PageData, form: ActionData }
+layout.svelte  → LayoutProps  // { data: LayoutData, children: Snippet }
```

:::tip[新世代型を優先する]
- `PageData` / `LayoutData` を**直接 import して個別に組み合わせる**書き方は SvelteKit 2.16.0 未満時代のレガシースタイルです
- 新規コードでは `PageProps` / `LayoutProps` を使い、`$props()` の戻り値を一括で型付けしてください
- このプロジェクトのコーディング規約（`.claude/skills/svelte5-coding-standards/SKILL.md`）でも新世代型を推奨しています
:::

### 3. Actions型（1種類）

フォーム処理や非GETリクエストを処理するためのサーバーサイド関数の型定義です。フォームのサブミッションやPOSTリクエストの処理に使用されます。

```typescript
// フォーム処理用
+page.server.ts → Actions  // default actionまたは名前付きactionの型定義
```

### 4. APIハンドラー型（1種類）

RESTful APIエンドポイントを作成するための型定義です。GET、POST、PUT、DELETE、PATCHなどのHTTPメソッドハンドラーに適用されます。

```typescript
// RESTful APIエンドポイント用
+server.ts → RequestHandler  // HTTPメソッド（GET/POST/PUT/DELETE等）のハンドラー型
```

### 5. その他の特殊型（3種類）

特定の機能を実現するための専用型定義です。静的サイト生成、動的ルートの検証、設定のエクスポートなどに使用されます。

```typescript
// 静的生成用 - プリレンダリングするパスの一覧を生成
+page.ts/+page.server.ts/+server.ts → EntryGenerator

// パラメータ検証用（src/paramsフォルダ内） - 動的ルートパラメータの形式を検証
src/params/*.ts → ParamMatcher

// プリレンダリング設定用 - ページ単位の設定をエクスポート
任意のファイル → Config
```

## 各型に含まれるプロパティ

Load関数に渡されるイベントオブジェクトのプロパティは、クライアントサイドとサーバーサイドで異なります。これらのプロパティを使用することで、リクエスト情報の取得や応答の制御が可能になります。

### LoadEvent型のプロパティ（すべてのLoad関数で共通）

```typescript
interface LoadEvent {
  // === ユニバーサル（クライアント/サーバー両方で利用可能） ===
  params: Record<string, string>;  // 動的ルートパラメータ（例：/blog/[slug]の slug）
  url: URL;                        // 現在のURL（クエリパラメータ含む）
  route: { id: string };           // ルートID（例："/blog/[slug]"）
  fetch: typeof fetch;             // SvelteKit拡張のfetch（Cookie自動送信、相対URL対応）
  setHeaders: Function;            // レスポンスヘッダー設定（キャッシュ制御など）
  depends: Function;               // 無効化の依存関係を宣言（invalidate時に再実行）
  parent: Function;                // 親レイアウトのデータを取得（データの継承）
  
  // === サーバーサイドのみ（+page.server.ts、+layout.server.ts） ===
  request?: Request;               // 元のHTTPリクエストオブジェクト
  locals?: App.Locals;             // リクエスト間で共有されるデータ（認証情報など）
  cookies?: Cookies;               // Cookie読み書き用のヘルパーオブジェクト
  platform?: App.Platform;         // デプロイ環境固有のAPI（Cloudflare Workers等）
}
```

## 型生成の完全マッピング表

| ファイル | 生成される型 | 用途 |
|---------|------------|------|
| `+page.ts` | `PageLoad` | クライアント/サーバー両方で実行されるデータ取得 |
| `+page.server.ts` | `PageServerLoad`, `Actions` | サーバーのみのデータ取得とフォーム処理 |
| `+layout.ts` | `LayoutLoad` | レイアウトのユニバーサルデータ取得 |
| `+layout.server.ts` | `LayoutServerLoad` | レイアウトのサーバーサイドデータ取得 |
| `+server.ts` | `RequestHandler` | APIエンドポイント（GET/POST/PUT/DELETE等） |
| `+page.svelte` | `PageProps` ✨**推奨**<br>`PageData`, `PageServerData`, `ActionData`（レガシー） | `PageProps` は `{ data, form }` をまとめて型付け |
| `+layout.svelte` | `LayoutProps` ✨**推奨**<br>`LayoutData`, `LayoutServerData`（レガシー） | `LayoutProps` は `{ data, children }` をまとめて型付け |
| `+error.svelte` | `PageData` | エラーページのprops |
| `src/params/*.ts` | `ParamMatcher` | 動的ルートのパラメータ検証 |

### `PageProps` / `LayoutProps` の使用例（推奨スタイル）

SvelteKit 2.16.0 以降では、コンポーネント側で `$props()` の型を `PageProps` / `LayoutProps` 1 つで完結できます。

```svelte
<!-- +page.svelte -->
<script lang="ts">
  import type { PageProps } from './$types';

  // PageProps は data: PageData と form: ActionData をまとめて型付け
  let { data, form }: PageProps = $props();
</script>

<h1>{data.title}</h1>

{#if form?.success}
  <p>送信成功</p>
{/if}
```

```svelte
<!-- +layout.svelte -->
<script lang="ts">
  import type { LayoutProps } from './$types';

  // LayoutProps は data: LayoutData と children: Snippet をまとめて型付け
  let { data, children }: LayoutProps = $props();
</script>

<nav>
  <a href="/">Home</a>
  <span>{data.user?.name}</span>
</nav>

<main>
  {@render children()}
</main>
```

:::caution[レガシーパターンとの対比]
**❌ レガシー（SvelteKit 2.16.0 未満、または個別型付け）**

```svelte
<script lang="ts">
  // PageData と ActionData を個別に import して型を組み立てる
  import type { PageData, ActionData } from './$types';
  let { data, form }: { data: PageData; form: ActionData } = $props();
</script>
```

**✅ 推奨（SvelteKit 2.16.0 以降）**

```svelte
<script lang="ts">
  // 1 つの型で props 全体を表現できる
  import type { PageProps } from './$types';
  let { data, form }: PageProps = $props();
</script>
```

`actions` を定義していない `+page.svelte` でも `PageProps` をそのまま使えます（`form` は `undefined` 型として推論されるので、参照しなければ問題ありません）。
:::

## 自動生成される型の使用例

実際のコードでどのように型が使用されるかを、ファイル種別ごとに詳しく見ていきます。

```typescript
// === +page.ts === 
// ユニバーサルLoad関数 - クライアント/サーバー両方で実行
import type { PageLoad } from './$types';
export const load: PageLoad = async (event) => {
  // event.params, event.url等が型付き
  const response = await event.fetch(`/api/data/${event.params.id}`);
  return {
    post: await response.json()
  };
};

// === +page.server.ts ===
// サーバーサイドLoad関数とActions
import type { PageServerLoad, Actions } from './$types';
export const load: PageServerLoad = async (event) => {
  // event.cookies, event.locals等も利用可能
  const session = event.cookies.get('session');
  const user = event.locals.user;  // hooks.server.tsで設定されたデータ
  
  return {
    user,
    sessionValid: !!session
  };
};

// フォーム処理用のActions
export const actions: Actions = {
  default: async (event) => {
    const formData = await event.request.formData();
    const email = formData.get('email');
    // フォーム処理ロジック
    return { success: true };
  },
  // 名前付きaction
  delete: async (event) => {
    // 削除処理
  }
};

// === +server.ts ===
// RESTful APIエンドポイント
import type { RequestHandler } from './$types';

// GETリクエストハンドラー
export const GET: RequestHandler = async (event) => {
  const data = await fetchDataFromDB(event.params.id);
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' }
  });
};

// POSTリクエストハンドラー
export const POST: RequestHandler = async (event) => {
  const body = await event.request.json();
  const result = await saveToDatabase(body);
  return new Response(JSON.stringify(result), { status: 201 });
};

// === +layout.ts ===
// レイアウト用のユニバーサルLoad関数
import type { LayoutLoad } from './$types';
export const load: LayoutLoad = async (event) => {
  // すべての子ページで利用可能なデータを返す
  return {
    navigation: await fetchNavigationData()
  };
};

// === +layout.server.ts ===
// レイアウト用のサーバーサイドLoad関数
import type { LayoutServerLoad } from './$types';
export const load: LayoutServerLoad = async (event) => {
  // 認証チェックなど、サーバーサイドでの処理
  const session = event.cookies.get('session');
  if (!session) {
    redirect(303, '/login');
  }
  
  return {
    user: await getUserFromSession(session)
  };
};

// === +page.svelte ===
// Svelteコンポーネントでのデータ受け取り
<script lang="ts">
  import type { PageProps } from './$types';
  
  // load関数の戻り値が自動的に型付けされる
  let { data }: PageProps = $props();
  
  // dataの中身はload関数の返り値の型と一致
  $effect(() => {
    console.log(data.post);  // 型安全にアクセス可能
  });
</script>

// === src/params/integer.ts ===
// カスタムパラメータマッチャー
import type { ParamMatcher } from '@sveltejs/kit';

// /user/[id=integer]のような動的ルートで使用
export const match: ParamMatcher = (param) => {
  return /^\d+$/.test(param);  // 整数のみマッチ
};

// === 静的生成（プリレンダリング）===
// ビルド時に生成するページのパラメータを指定
import type { EntryGenerator } from './$types';

export const entries: EntryGenerator = () => {
  // /blog/[slug]のすべてのパスを生成
  return [
    { slug: 'first-post' },
    { slug: 'second-post' },
    { slug: 'third-post' }
  ];
};

// prerender設定
export const prerender = true;  // このページをプリレンダリング
```

## `$app/types` モジュール（SvelteKit 2.26 以降）

SvelteKit 2.26 から導入された `$app/types` モジュールは、**アプリ全体のルート構造を型レベルで表現する**ためのジェネレーテッド型を提供します。`./$types`（個別ルートに紐づく型）に対し、こちらは**アプリ横断で使える汎用ユーティリティ型**という位置付けです。

```typescript
import type {
  RouteId,
  RouteParams,
  LayoutParams,
  Pathname,
  ResolvedPathname,
  Asset
} from '$app/types';
```

### `RouteId` — 存在するルート ID のユニオン型

アプリ内に存在する**すべてのルート ID** をユニオン型として列挙します。`page.route.id` や `event.route.id` の型として使われます。

```typescript
// 自動生成されるイメージ
type RouteId = '/' | '/about' | '/blog' | '/blog/[slug]' | '/admin/[...rest]';
```

これにより、存在しないルート ID を参照しようとするとコンパイル時にエラーになります。

### `RouteParams<R>` — ルートに紐づくパラメータ型

任意のルート ID `R` に対し、そのルートの `params` オブジェクトの型を取り出すユーティリティ型です。

```typescript
import type { RouteParams } from '$app/types';

type BlogParams = RouteParams<'/blog/[slug]'>;       // { slug: string }
type AdminParams = RouteParams<'/admin/[...rest]'>;  // { rest: string }
type RootParams = RouteParams<'/'>;                  // Record<string, never>
```

動的セグメント（`[slug]`、`[...rest]`、`[[optional]]`）が自動的に解析され、適切な型が生成されます。

### `LayoutParams<R>` — レイアウトのパラメータ型

`RouteParams` と似ていますが、**子ルートで定義された任意のパラメータも optional として含む**点が異なります。レイアウトは複数の子ルートをまたいで描画されるため、子側のパラメータが存在するかどうかは実行時にしか確定しないからです。

```typescript
import type { LayoutParams } from '$app/types';

// /blog レイアウト配下に /blog と /blog/[slug] がある場合
type BlogLayoutParams = LayoutParams<'/blog'>;
// → { slug?: string }（slug は子ルートでのみ存在するため optional）
```

### `Pathname` / `ResolvedPathname` — 型付きパス文字列

`Pathname` は**アプリ内に存在する有効な URL パスのユニオン型**です。動的セグメントを含むルートはテンプレートリテラル型として表現されます。

```typescript
type Pathname =
  | '/'
  | '/about'
  | '/blog'
  | `/blog/${string}`
  | `/admin/${string}`;
```

`ResolvedPathname` は `Pathname` に `base` パス（[`config.kit.paths.base`](https://kit.svelte.dev/docs/configuration#paths)）のプレフィックスを加えた型で、`page.url.pathname` の型として使われます。

### `Asset` — 静的アセットの型付き参照

`static/` ディレクトリ配下のファイルすべてをユニオン型として列挙します。タイポを防ぎつつ、`import` 由来のアセットパスもサポートします。

```typescript
type Asset = '/favicon.png' | '/robots.txt' | '/og-image.png' | (string & {});
```

### 実践的な使用例

これらの型を `goto`、`href`、`fetch` などと組み合わせると、URL に関わるあらゆる操作を型安全にできます。

```svelte
<script lang="ts">
  import { goto } from '$app/navigation';
  import type { Pathname, RouteId, RouteParams } from '$app/types';

  // RouteId は型レベルで存在するルートのみ受け付ける
  const target: RouteId = '/blog/[slug]';

  // RouteParams<R> でルートに紐づくパラメータを取り出す
  type BlogParams = RouteParams<'/blog/[slug]'>; // { slug: string }
  const params: BlogParams = { slug: 'hello-world' };

  // Pathname により goto に渡せる文字列が型付きになる
  const path: Pathname = '/about';

  function navigate() {
    goto(path);
  }
</script>

<button onclick={navigate}>About へ</button>

<!-- href も Pathname で型付け可能 -->
<a href={`/blog/${params.slug}` satisfies Pathname}>記事を読む</a>
```

サーバーサイドの `fetch` でも、内部 API への相対パスを `Pathname` で縛れます。

```typescript
// +page.server.ts
import type { PageServerLoad } from './$types';
import type { Pathname } from '$app/types';

export const load: PageServerLoad = async ({ fetch }) => {
  // 内部 API ルートは Pathname で型付け
  const endpoint: Pathname = '/api/posts';
  const response = await fetch(endpoint);

  return {
    posts: await response.json()
  };
};
```

:::info[`./$types` との使い分け]
| 対象 | モジュール | スコープ |
|------|-----------|---------|
| `PageLoad`、`PageProps`、`Actions` 等 | `./$types`（ルートごと） | そのルート専用の型 |
| `RouteId`、`Pathname`、`RouteParams<R>` 等 | `$app/types`（グローバル） | アプリ全体で再利用可能 |

`./$types` は**そのルート内で素直に使う型**、`$app/types` は**ナビゲーションヘルパーやユーティリティ関数の型シグネチャ**で活躍します。両者を組み合わせることで、コンポーネント内部の型整合性とアプリ横断のルーティング型安全性を両立できます。
:::

:::warning[バージョン要件]
`$app/types` モジュールは **SvelteKit 2.26 以降**で利用可能です。プロジェクトの `package.json` で `@sveltejs/kit` のバージョンを確認してください。
:::

## 型生成の内部動作

SvelteKitがどのように型を自動生成し、管理しているかを詳しく解説します。この仕組みを理解することで、型エラーのデバッグが容易になります。

### .svelte-kit/typesディレクトリの構造

SvelteKitは`npm run dev`や`npm run build`実行時に、`.svelte-kit/types`ディレクトリに型定義ファイルを自動生成します。

```
.svelte-kit/types/
├── src/
│   └── routes/
│       ├── $types.d.ts              # ルート / の型定義
│       ├── about/
│       │   └── $types.d.ts         # /about の型定義
│       └── blog/
│           ├── $types.d.ts         # /blog の型定義
│           └── [slug]/
│               └── $types.d.ts     # /blog/[slug] の型定義
└── app.d.ts                        # グローバル型定義
```

### 型生成のトリガーとタイミング

SvelteKitは以下のタイミングで型定義ファイルを自動生成・更新します。

1. **開発サーバー起動時** (`npm run dev`)
   - 全ルートの型を初期生成
   - ファイル監視を開始
   - 既存の`.svelte-kit/types`をクリーンアップ

2. **ファイル変更時**
   - `+page.ts`、`+server.ts`等の追加/削除/名前変更を検知
   - ルートディレクトリの追加/削除を検知
   - `app.d.ts`の変更を検知して全体を再生成

3. **ビルド時** (`npm run build`)
   - プロダクション用に全型を再生成
   - 不要な型定義を削除
   - 最適化された型定義を出力

### 生成される型の内部実装

`.svelte-kit/types/src/routes/$types.d.ts`の実際の内容を見てみましょう。SvelteKitは実際のファイルの内容を解析して、動的に型を生成しています。

```typescript
import type * as Kit from '@sveltejs/kit';

// ルートパラメータの型定義（動的ルートの場合は具体的な型になる）
type RouteParams = Record<string, string>;  // 例：{ slug: string } for /blog/[slug]
type RouteId = '/';  // このルートの一意識別子

// Load関数の型エクスポート
export type PageServerLoad = Kit.ServerLoad<RouteParams, {}, RouteId>;
export type PageLoad = Kit.Load<RouteParams, {}, RouteId>;

// イベントオブジェクトの型エクスポート
export type PageServerLoadEvent = Kit.ServerLoadEvent<RouteParams, {}, RouteId>;
export type PageLoadEvent = Kit.LoadEvent<RouteParams, {}, RouteId>;

// 実際のload関数の返り値から推論された型
export type PageData = Kit.AwaitedProperties<
  Awaited<ReturnType<typeof import('../../../../../src/routes/+page.js').load>>
>;

// サーバーサイドload関数の返り値から推論された型  
export type PageServerData = Kit.AwaitedProperties<
  Awaited<ReturnType<typeof import('../../../../../src/routes/+page.server.js').load>>
>;

// Actions型（+page.server.tsにactionsがある場合のみ）
export type Actions = Kit.Actions<RouteParams, RouteId>;
```

## 📐 生成される型の完全な定義

SvelteKitの型システムの核となるインターフェースの完全な定義を理解することで、より高度な型活用が可能になります。

### LoadEventの完全なインターフェース

```typescript
interface LoadEvent<
  Params extends Partial<Record<string, string>> = Partial<Record<string, string>>,
  Data extends Record<string, any> | void = Record<string, any> | void,
  RouteId extends string | null = string | null
> {
  // === コア機能 ===
  fetch: typeof fetch;                    // SvelteKit拡張のfetch（Cookie自動付与、相対URL対応）
  params: Params;                         // 動的ルートパラメータ（/blog/[slug]のslug等）
  route: { id: RouteId };                 // ルート識別子（デバッグ用）
  url: URL;                               // 完全なリクエストURL（クエリパラメータ含む）
  
  // === データ管理 ===
  depends(...deps: string[]): void;       // invalidate()で再実行する依存関係を宣言
  parent(): Promise<Data>;                // 親レイアウトのload関数の結果を取得
  setHeaders(headers: ResponseHeaders): void; // Cache-Control等のレスポンスヘッダー設定
  
  // === サーバーサイド専用 (ServerLoadEvent) ===
  request?: Request;                      // 元のHTTPリクエスト（ヘッダー、body等）
  locals?: App.Locals;                    // hooks.server.tsで設定したリクエストスコープデータ
  cookies?: Cookies;                      // Cookie読み書きのヘルパーAPI
  platform?: App.Platform;                // Cloudflare Workers等のプラットフォーム固有API
  getClientAddress?(): string;            // クライアントのIPアドレス取得
  isDataRequest?: boolean;                // クライアントサイドナビゲーションかどうか
  isSubRequest?: boolean;                 // fetch()による内部リクエストかどうか
}
```

### Actionsの完全な型定義

フォーム処理用のActions型は、複数の名前付きアクションをサポートし、成功・失敗の両方のケースを型安全に扱えます。

```typescript
type Actions<
  Params extends Partial<Record<string, string>> = Partial<Record<string, string>>,
  OutputData extends Record<string, any> | void = Record<string, any> | void,
  RouteId extends string | null = string | null
> = Record<string, Action<Params, OutputData, RouteId>>;  // 名前付きアクションのマップ

interface Action<Params, OutputData, RouteId> {
  (event: RequestEvent<Params, RouteId>): 
    | OutputData                                      // 成功時のデータ
    | Promise<OutputData>                            // 非同期処理の成功データ
    | ActionFailure<Record<string, unknown>>;        // fail()による失敗結果
}

// 使用例
export const actions: Actions = {
  default: async ({ request }) => {                  // デフォルトアクション
    // フォーム処理
  },
  update: async ({ request, params }) => {           // 名前付きアクション
    // 更新処理
  },
  delete: async ({ params }) => {                    // 削除用アクション
    // 削除処理
  }
};
```

### RequestHandlerの完全な型定義

APIエンドポイント用のRequestHandler型は、標準的なHTTPレスポンスを返すか、SvelteKitに処理を委ねることができます。

```typescript
interface RequestHandler<
  Params extends Partial<Record<string, string>> = Partial<Record<string, string>>,
  RouteId extends string | null = string | null
> {
  (event: RequestEvent<Params, RouteId>): 
    | Response                    // 標準のWeb APIレスポンス
    | Promise<Response>           // 非同期でレスポンスを返す
    | void                        // レスポンスを返さない（404として扱われる）
    | Promise<void>;              // 非同期処理後、レスポンスなし
}

// 使用例
export const GET: RequestHandler = async ({ params, url }) => {
  const data = await fetchData(params.id);
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' }
  });
};

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();
  const result = await createResource(body);
  return new Response(JSON.stringify(result), { 
    status: 201,
    headers: { 'Content-Type': 'application/json' }
  });
};
```

## 高度なカスタマイズ

SvelteKitの型システムは、プロジェクト固有の要件に合わせて拡張可能です。`app.d.ts`ファイルを使用して、グローバルな型定義をカスタマイズできます。

### app.d.tsでの型拡張パターン

```typescript
// src/app.d.ts
declare global {
  namespace App {
    // 1. Localsの拡張（認証情報など）
    // hooks.server.tsでevent.localsに設定するデータの型定義
    interface Locals {
      user?: {
        id: string;
        email: string;
        permissions: string[];        // 権限リスト
      };
      db?: DatabaseConnection;        // DBコネクション
      startTime?: number;              // パフォーマンス計測用
    }
    
    // 2. PageDataの拡張（全ページ共通データ）
    // すべてのページで利用可能な共通データ型
    interface PageData {
      meta?: {
        title: string;                 // ページタイトル
        description?: string;          // ページの説明（OGP / meta description）
        ogImage?: string;              // OGP画像URL
      };
      breadcrumbs?: Array<{            // パンくずリスト
        label: string;
        href: string;
      }>;
    }
    
    // 3. Errorの拡張（カスタムエラー）
    // error()関数で投げるエラーの型定義
    interface Error {
      code: 'FORBIDDEN' | 'NOT_FOUND' | 'SERVER_ERROR';  // エラーコード
      details?: Record<string, any>;   // 詳細情報
      timestamp?: number;               // 発生時刻
    }
    
    // 4. Platformの拡張（デプロイ環境固有）
    // Cloudflare Workers、Vercel等のプラットフォーム固有API
    interface Platform {
      env: {                            // 環境変数
        DB_CONNECTION_STRING: string;
        REDIS_URL: string;
        S3_BUCKET: string;
      };
      context: {                        // Cloudflare Workers Context
        waitUntil(promise: Promise<any>): void;  // バックグラウンド処理
      };
    }
  }
  
  // グローバル型の追加（プロジェクト全体で使用）
  type UserId = `user_${string}`;      // ユーザーIDの型安全な定義
  type PostId = `post_${string}`;      // 投稿IDの型安全な定義
  
  interface Window {
    // ブラウザグローバルの拡張
    __INITIAL_DATA__?: Record<string, any>;  // SSRで渡す初期データ
    gtag?: Function;                    // Google Analytics
  }
}

export {};  // モジュールとして扱うための必須エクスポート
```

### カスタムパラメータマッチャーとの連携

動的ルートのパラメータを検証し、型安全性を高めるためのカスタムマッチャーの実装例です。

```typescript
// src/params/uuid.ts
// UUID形式のパラメータのみを許可するマッチャー
import type { ParamMatcher } from '@sveltejs/kit';

export const match: ParamMatcher = (param): param is string => {
  // UUID v4形式の正規表現でチェック
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(param);
};

// src/params/integer.ts
// 整数のみを許可するマッチャー
export const match: ParamMatcher = (param): param is string => {
  return /^\d+$/.test(param) && parseInt(param) <= Number.MAX_SAFE_INTEGER;
};

// src/params/slug.ts  
// URLスラッグ形式のみを許可するマッチャー
export const match: ParamMatcher = (param): param is string => {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(param);
};

// src/routes/user/[id=uuid]/+page.ts
// マッチャーを使用した動的ルート
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
  // params.id は UUID形式であることが保証される
  const userId = params.id; // マッチャーによって検証済み
  
  const user = await fetchUser(userId);
  return { user };
};

// src/routes/blog/[year=integer]/[month=integer]/[slug=slug]/+page.ts
// 複数のマッチャーを組み合わせた例
export const load: PageLoad = async ({ params }) => {
  // すべてのパラメータが検証済み
  const year = parseInt(params.year);   // 整数であることが保証
  const month = parseInt(params.month); // 整数であることが保証  
  const slug = params.slug;             // スラッグ形式であることが保証
  
  const post = await fetchPost(year, month, slug);
  return { post };
};
```

## トラブルシューティング

型生成に関する一般的な問題と、その解決方法を詳しく解説します。

### 型が生成されない場合

#### 1. 開発サーバーの再起動
```bash
# Ctrl+C で停止後
npm run dev
```

#### 2. .svelte-kitディレクトリのクリーンアップ
```bash
rm -rf .svelte-kit
npm run dev
```

#### 3. TypeScript設定の確認

`tsconfig.json`ファイルが正しくSvelteKitの設定を継承しているか確認します。

```typescript
{
  "extends": "./.svelte-kit/tsconfig.json",  // SvelteKitの型定義を継承（必須）
  "compilerOptions": {
    "strict": true,                          // 厳密な型チェックを有効化
    "moduleResolution": "bundler",          // バンドラー向けのモジュール解決
    "allowJs": true,                        // JavaScriptファイルも含める
    "checkJs": false,                       // JSファイルの型チェック（オプション）
    "esModuleInterop": true,                // CommonJS/ESM相互運用
    "skipLibCheck": true                    // ライブラリの型チェックをスキップ（高速化）
  }
}
```

### 型の不整合が起きた場合

#### 1. VSCodeの再起動
- TypeScript Language Serverのリスタート
- Command Palette: "TypeScript: Restart TS Server"

#### 2. node_modulesの再インストール
```bash
rm -rf node_modules package-lock.json
npm install
```

#### 3. 型定義の手動確認
```bash
# 生成された型を直接確認
ls -la .svelte-kit/types/src/routes/
cat .svelte-kit/types/src/routes/$types.d.ts
```

### よくあるエラーと対処法

| エラー | 原因 | 対処法 |
|-------|------|--------|
| `Cannot find module './$types'` | 型がまだ生成されていない | `npm run dev`で開発サーバーを起動 |
| `Type 'PageLoad' does not satisfy...` | Load関数の返り値の型が不正 | 返り値がオブジェクトか確認、Promiseをawaitしているか確認 |
| `Property 'xxx' does not exist on type 'Locals'` | app.d.tsでの型定義漏れ | `src/app.d.ts`のApp.Localsインターフェースに型定義を追加 |
| `Argument of type 'xxx' is not assignable...` | パラメータの型不一致 | 動的ルートのパラメータ名とアクセスしている名前が一致するか確認 |
| `Type 'Actions' is not assignable...` | Actionsの構造が不正 | defaultまたは名前付きアクションが正しく定義されているか確認 |
| `Cannot find name 'PageData'` | インポート漏れ | `import type &#123; PageData &#125; from './$types'`を追加 |

## まとめ

SvelteKitの自動型生成システムは、以下の利点を提供します。

1. **完全な型安全性** - すべてのルートパラメータ、データ、APIが型付けされる
2. **開発効率の向上** - 手動での型定義が不要で、IDEの補完が効く
3. **実行時エラーの削減** - コンパイル時に型エラーを検出
4. **保守性の向上** - ファイル構造の変更に自動的に追従
5. **カスタマイズ性** - app.d.tsで プロジェクト固有の型を拡張可能

これらの型生成の仕組みを理解し活用することで、**型定義を手動で書くことなく、完全に型安全なSvelteKitアプリケーション**を構築できます。
