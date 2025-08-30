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

## 💡　重要なポイント

1. **これらの型はSvelteKitが提供する固定の型**
   - 開発者が新しい型を`./$types`に追加することはできない

2. **ファイル名によって生成される型が決まる**
   - `+page.ts` → 必ず`PageLoad`型
   - `+server.ts` → 必ず`RequestHandler`型

3. **カスタマイズはapp.d.tsで行う**
   ```typescript
   // src/app.d.ts
   namespace App {
     interface Locals { /* カスタム */ }
     interface PageData { /* カスタム */ }
   }
   ```

これらの型により、**型定義を手動で書くことなく、完全に型安全なSvelteKitアプリケーション**を構築できます。