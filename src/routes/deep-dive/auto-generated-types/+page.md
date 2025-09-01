---
title: SvelteKitが自動生成する型の一覧
description: SvelteKitが ./$types から自動生成される型の完全リスト
---

**SvelteKitが自動生成する型は決まっていて、ファイル名に応じて特定の型が生成されます**。

## 📋　`./$types`から自動生成される型一覧

### 1. Load関数の型（4種類）
```typescript
// ファイル名 → 生成される型
+page.ts        → PageLoad
+page.server.ts → PageServerLoad  
+layout.ts      → LayoutLoad
+layout.server.ts → LayoutServerLoad
```

### 2. データ型（2種類）
```typescript
// すべてのSvelteファイルで利用可能
+page.svelte    → PageData, PageServerData
+layout.svelte  → LayoutData, LayoutServerData
+error.svelte   → PageData
```

### 3. Actions型（1種類）
```typescript
// フォーム処理用
+page.server.ts → Actions
```

### 4. APIハンドラー型（1種類）
```typescript
// RESTful APIエンドポイント用
+server.ts → RequestHandler
```

### 5. その他の特殊型（3種類）
```typescript
// 静的生成用
+page.ts/+page.server.ts/+server.ts → EntryGenerator

// パラメータ検証用（src/paramsフォルダ内）
src/params/*.ts → ParamMatcher

// プリレンダリング設定用
任意のファイル → Config
```

## 🎯　各型に含まれるプロパティ

### LoadEvent型のプロパティ（すべてのLoad関数で共通）

```typescript
interface LoadEvent {
  // 自動生成される内容
  params: Record<string, string>;  // ルートパラメータ
  url: URL;                        // 現在のURL
  route: { id: string };           // ルートID
  fetch: typeof fetch;             // カスタムfetch関数
  setHeaders: Function;            // ヘッダー設定
  depends: Function;               // 依存関係の宣言
  parent: Function;                // 親レイアウトのデータ取得
  
  // サーバーサイドのみ
  request?: Request;               // HTTPリクエスト（サーバーのみ）
  locals?: App.Locals;             // サーバーローカル変数（サーバーのみ）
  cookies?: Cookies;               // Cookie操作（サーバーのみ）
  platform?: App.Platform;         // プラットフォーム固有（サーバーのみ）
}
```

## 📊　型生成の完全マッピング表

| ファイル | 生成される型 | 用途 |
|---------|------------|------|
| `+page.ts` | `PageLoad` | クライアント/サーバー両方で実行されるデータ取得 |
| `+page.server.ts` | `PageServerLoad`, `Actions` | サーバーのみのデータ取得とフォーム処理 |
| `+layout.ts` | `LayoutLoad` | レイアウトのユニバーサルデータ取得 |
| `+layout.server.ts` | `LayoutServerLoad` | レイアウトのサーバーサイドデータ取得 |
| `+server.ts` | `RequestHandler` | APIエンドポイント（GET/POST/PUT/DELETE等） |
| `+page.svelte` | `PageData`, `PageServerData` | ページコンポーネントのprops |
| `+layout.svelte` | `LayoutData`, `LayoutServerData` | レイアウトコンポーネントのprops |
| `+error.svelte` | `PageData` | エラーページのprops |
| `src/params/*.ts` | `ParamMatcher` | 動的ルートのパラメータ検証 |

## 🔧　自動生成される型の使用例

```typescript
// === +page.ts ===
import type { PageLoad } from './$types';
export const load: PageLoad = async (event) => {
  // event.params, event.url等が型付き
};

// === +page.server.ts ===
import type { PageServerLoad, Actions } from './$types';
export const load: PageServerLoad = async (event) => {
  // event.cookies, event.locals等も利用可能
};
export const actions: Actions = {
  default: async (event) => { /* ... */ }
};

// === +server.ts ===
import type { RequestHandler } from './$types';
export const GET: RequestHandler = async (event) => {
  return new Response();
};
export const POST: RequestHandler = async (event) => {
  return new Response();
};

// === +layout.ts ===
import type { LayoutLoad } from './$types';
export const load: LayoutLoad = async (event) => {
  // レイアウト用のデータ取得
};

// === +layout.server.ts ===
import type { LayoutServerLoad } from './$types';
export const load: LayoutServerLoad = async (event) => {
  // サーバーサイドレイアウト
};

// === +page.svelte ===
<script lang="ts">
  import type { PageData } from './$types';
  export let data: PageData;  // load関数の戻り値が型付き
</script>

// === src/params/integer.ts ===
import type { ParamMatcher } from '@sveltejs/kit';
export const match: ParamMatcher = (param) => {
  return /^\d+$/.test(param);
};

// === 静的生成（プリレンダリング）===
import type { EntryGenerator } from './$types';
export const entries: EntryGenerator = () => {
  return [{ slug: 'post-1' }];
};
```

## 🔍 型生成の内部動作

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

1. **開発サーバー起動時** (`npm run dev`)
   - 全ルートの型を初期生成
   - ファイル監視を開始

2. **ファイル変更時**
   - `+page.ts`、`+server.ts`等の追加/削除/名前変更
   - ルートディレクトリの追加/削除
   - `app.d.ts`の変更

3. **ビルド時** (`npm run build`)
   - プロダクション用に全型を再生成

### 生成される型の内部実装

`.svelte-kit/types/src/routes/$types.d.ts`の実際の内容

```typescript
import type * as Kit from '@sveltejs/kit';

type RouteParams = Record<string, string>;
type RouteId = '/';

export type PageServerLoad = Kit.ServerLoad<RouteParams, {}, RouteId>;
export type PageLoad = Kit.Load<RouteParams, {}, RouteId>;

export type PageServerLoadEvent = Kit.ServerLoadEvent<RouteParams, {}, RouteId>;
export type PageLoadEvent = Kit.LoadEvent<RouteParams, {}, RouteId>;

export type PageData = Kit.AwaitedProperties<
  Awaited<ReturnType<typeof import('../../../../../src/routes/+page.js').load>>
>;

export type PageServerData = Kit.AwaitedProperties<
  Awaited<ReturnType<typeof import('../../../../../src/routes/+page.server.js').load>>
>;
```

## 📐 生成される型の完全な定義

### LoadEventの完全なインターフェース

```typescript
interface LoadEvent<
  Params extends Partial<Record<string, string>> = Partial<Record<string, string>>,
  Data extends Record<string, any> | void = Record<string, any> | void,
  RouteId extends string | null = string | null
> {
  // コア機能
  fetch: typeof fetch;                    // 拡張されたfetch関数
  params: Params;                         // ルートパラメータ
  route: { id: RouteId };                 // ルートID
  url: URL;                               // リクエストURL
  
  // データ管理
  depends(...deps: string[]): void;       // 無効化の依存関係
  parent(): Promise<Data>;                // 親レイアウトのデータ
  setHeaders(headers: ResponseHeaders): void; // レスポンスヘッダー設定
  
  // サーバーサイド専用 (ServerLoadEvent)
  request?: Request;                      // HTTPリクエストオブジェクト
  locals?: App.Locals;                    // リクエスト固有データ
  cookies?: Cookies;                      // Cookie操作API
  platform?: App.Platform;                // プラットフォーム固有API
  getClientAddress?(): string;            // クライアントIPアドレス
  isDataRequest?: boolean;                // データリクエストかどうか
  isSubRequest?: boolean;                 // サブリクエストかどうか
}
```

### Actionsの完全な型定義

```typescript
type Actions<
  Params extends Partial<Record<string, string>> = Partial<Record<string, string>>,
  OutputData extends Record<string, any> | void = Record<string, any> | void,
  RouteId extends string | null = string | null
> = Record<string, Action<Params, OutputData, RouteId>>;

interface Action<Params, OutputData, RouteId> {
  (event: RequestEvent<Params, RouteId>): 
    | OutputData 
    | Promise<OutputData>
    | ActionFailure<Record<string, unknown>>;
}
```

### RequestHandlerの完全な型定義

```typescript
interface RequestHandler<
  Params extends Partial<Record<string, string>> = Partial<Record<string, string>>,
  RouteId extends string | null = string | null
> {
  (event: RequestEvent<Params, RouteId>): 
    | Response 
    | Promise<Response>
    | void
    | Promise<void>;
}
```

## 🛠 高度なカスタマイズ

### app.d.tsでの型拡張パターン

```typescript
// src/app.d.ts
declare global {
  namespace App {
    // 1. Localsの拡張（認証情報など）
    interface Locals {
      user?: {
        id: string;
        email: string;
        permissions: string[];
      };
      db?: DatabaseConnection;
    }
    
    // 2. PageDataの拡張（全ページ共通データ）
    interface PageData {
      meta?: {
        title: string;
        description: string;
        ogImage?: string;
      };
      breadcrumbs?: Array<{
        label: string;
        href: string;
      }>;
    }
    
    // 3. Errorの拡張（カスタムエラー）
    interface Error {
      code: 'FORBIDDEN' | 'NOT_FOUND' | 'SERVER_ERROR';
      details?: Record<string, any>;
      timestamp?: number;
    }
    
    // 4. Platformの拡張（デプロイ環境固有）
    interface Platform {
      env: {
        DB_CONNECTION_STRING: string;
        REDIS_URL: string;
        S3_BUCKET: string;
      };
      context: {
        waitUntil(promise: Promise<any>): void;
      };
    }
  }
  
  // グローバル型の追加
  type UserId = `user_${string}`;
  type PostId = `post_${string}`;
  
  interface Window {
    // ブラウザグローバルの拡張
    __INITIAL_DATA__?: Record<string, any>;
  }
}

export {};
```

### カスタムパラメータマッチャーとの連携

```typescript
// src/params/uuid.ts
import type { ParamMatcher } from '@sveltejs/kit';

export const match: ParamMatcher = (param): param is string => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(param);
};

// src/routes/user/[id=uuid]/+page.ts
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
  // params.id は UUID形式であることが保証される
  const userId = params.id; // string型、かつUUID形式
};
```

## 🔧 トラブルシューティング

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

`tsconfig.json`ファイルの設定を確認

```typescript
{
  "extends": "./.svelte-kit/tsconfig.json",
  "compilerOptions": {
    "strict": true,
    "moduleResolution": "bundler"
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
| `Cannot find module './$types'` | 型がまだ生成されていない | 開発サーバーを起動 |
| `Type 'PageLoad' does not satisfy...` | 返り値の型が不正 | Load関数の返り値を確認 |
| `Property 'xxx' does not exist on type 'Locals'` | app.d.tsの定義漏れ | App.Localsに型定義を追加 |
| `Argument of type 'xxx' is not assignable...` | パラメータの型不一致 | ルートパラメータを確認 |

## 💡 まとめ

これらの型により、**型定義を手動で書くことなく、完全に型安全なSvelteKitアプリケーション**を構築できます。型生成の仕組みを理解することで、より効率的なデバッグとカスタマイズが可能になります。