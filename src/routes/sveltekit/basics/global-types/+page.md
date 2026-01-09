---
title: app.d.tsの役割
description: SvelteKitのapp.d.tsを用いたグローバル型定義の完全ガイド。App.Locals/PageData/Errorの拡張、セッション情報やAPIレスポンスの型付け、共通モジュール管理、フック・サーバーハンドラでの活用まで網羅し、型安全性と保守性を高める。サンプルとチェックリスト付き。運用時の確認ポイントも掲載
---

<script lang="ts">
  import { base } from '$app/paths';
</script>

SvelteKitでは`app.d.ts`ファイルを通じて、プロジェクト全体で使用するグローバルな型定義を宣言できます。これらの型は`./$types`と自動的に統合され、アプリケーション全体で型安全性を保証します。

## app.d.tsの役割

`app.d.ts`は、SvelteKitアプリケーション全体で共有される型定義の中心となるファイルです。ここで定義した型は、すべてのルート、コンポーネント、サーバーサイドコードで利用可能になります。

### 主な特徴

- 🌍 **グローバルスコープ**: プロジェクト全体で利用可能
- 🔄 **自動統合**: `./$types`と自動的に連携
- 🎯 **標準インターフェース**: SvelteKitが定める特定のインターフェースを拡張
- 🛡️ **型安全性**: 実行時エラーを未然に防ぐ

## 標準インターフェース

SvelteKitは`App`名前空間に5つの標準インターフェースを提供しています。これらを拡張することで、アプリケーション固有の型定義を追加できます。

### 5つの標準インターフェース一覧

| インターフェース | 用途 | 主な使用場所 |
|-----------------|------|------------|
| **App.Locals** | サーバーサイドのリクエストコンテキスト | hooks.server.ts、Load関数、Actions |
| **App.PageData** | すべてのページで共通のデータ型 | +layout.server.ts、+page.svelte |
| **App.Error** | カスタムエラー型 | error()関数、+error.svelte |
| **App.PageState** | 履歴エントリの状態 | pushState()、replaceState() |
| **App.Platform** | プラットフォーム固有のAPI | Cloudflare Workers、Vercel等 |

それでは、各インターフェースを詳しく見ていきましょう。

## 1. App.Locals - サーバーサイドのリクエストコンテキスト

サーバーサイドでリクエスト処理中に保持・共有されるデータの型定義です。`hooks.server.ts`で認証情報やセッションを検証・設定し、その後のLoad関数やActionsで利用します。リクエストのライフサイクル全体を通じて、サーバー側の処理間でデータを受け渡すための仕組みです。

```typescript
// src/app.d.ts
declare global {
  namespace App {
    interface Locals {
      user?: {
        id: string;
        email: string;
        role: 'admin' | 'user' | 'guest';
      };
      session?: {
        id: string;
        expiresAt: Date;
      };
    }
  }
}
```

### `hooks.server.ts`で設定し、Load関数やActionsで使用

```typescript
// hooks.server.ts
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  // セッションからユーザー情報を取得
  event.locals.user = await getUserFromSession(event.cookies);
  return resolve(event);
};

// +page.server.ts
import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) {
    throw redirect(303, '/login');
  }
  // locals.userが型安全に使える
  return {
    userData: locals.user
  };
};
```

## 2. App.PageData - すべてのページで共通のデータ型

アプリケーション全体のページで共通して使用されるデータの型を定義します。メタ情報、フラッシュメッセージ、パンくずリストなど、各ページのLoad関数の返り値に含まれる共通プロパティを管理します。

```typescript
interface PageData {
  // すべてのページで利用可能なデータ
  meta?: {
    title: string;
    description: string;
    ogImage?: string;
  };
  flash?: {
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
    dismissible?: boolean;
  };
  breadcrumbs?: Array<{
    label: string;
    href: string;
  }>;
}
```

### 使用例

```typescript
// +layout.server.ts
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async () => {
  return {
    meta: {
      title: 'マイアプリ',
      description: 'アプリケーションの説明文'
    }
  };
};
```

## 3. App.Error - カスタムエラー型

アプリケーションで発生するエラーの型をカスタマイズします。エラーコード、詳細情報、ステータスなどを追加して、より詳細なエラーハンドリングが可能になります。

```typescript
interface Error {
  message: string;
  code?: 'UNAUTHORIZED' | 'NOT_FOUND' | 'SERVER_ERROR' | 'VALIDATION_ERROR';
  details?: Record<string, any>;
  timestamp?: number;
  requestId?: string;
}
```

### `error()`関数で使用

```typescript
import { error } from '@sveltejs/kit';

// カスタムエラーを投げる
throw error(404, {
  message: 'ページが見つかりません',
  code: 'NOT_FOUND',
  details: {
    requestedPath: '/unknown-page'
  },
  timestamp: Date.now()
});
```

## 4. App.PageState - 履歴エントリの状態

ブラウザの履歴スタックに保存される状態の型定義です。スクロール位置、タブ選択状態、フォーム入力値など、ページ遷移時に保持したいUI状態を管理します。

```typescript
interface PageState {
  scrollY?: number;
  selectedTab?: string;
  expandedItems?: string[];
  formData?: Record<string, any>;
  filterState?: {
    category?: string;
    sortBy?: 'name' | 'date' | 'price';
  };
}
```

### `pushState`/`replaceState`で使用

```typescript
import { pushState, replaceState } from '$app/navigation';

// 状態を保存しながらナビゲーション
pushState('/products', {
  scrollY: window.scrollY,
  selectedTab: 'details',
  filterState: {
    category: 'electronics'
  }
});

// 現在の履歴エントリの状態を更新
replaceState('', {
  formData: {
    name: 'John',
    email: 'john@example.com'
  }
});
```

## 5. App.Platform - プラットフォーム固有のAPI

デプロイ先のプラットフォーム（Cloudflare Workers、Vercel、Netlifyなど）固有のAPIや環境変数の型定義です。各プラットフォームの特殊機能を型安全に利用できるようにします。

```typescript
interface Platform {
  // Cloudflare Workers の例
  env?: {
    DATABASE_URL: string;
    API_KEY: string;
    KV_NAMESPACE: KVNamespace;
    DURABLE_OBJECT: DurableObjectNamespace;
  };
  context?: {
    waitUntil(promise: Promise<any>): void;
    passThroughOnException(): void;
  };
  caches?: CacheStorage;
}
```

### プラットフォーム固有機能の使用

```typescript
// +page.server.ts
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ platform }) => {
  if (platform?.env?.KV_NAMESPACE) {
    // Cloudflare KV ストレージを使用
    const cachedData = await platform.env.KV_NAMESPACE.get('cache-key');
    if (cachedData) {
      return JSON.parse(cachedData);
    }
  }
  
  // 通常のデータ取得処理
  const data = await fetchData();
  
  // バックグラウンドでキャッシュを更新
  platform?.context?.waitUntil(
    platform.env?.KV_NAMESPACE?.put('cache-key', JSON.stringify(data))
  );
  
  return data;
};
```

## 完全な app.d.ts の例

実際のプロジェクトで使用できる、包括的な`app.d.ts`の設定例です。これらの型定義を組み合わせることで、プロジェクト全体で一貫した型安全性を実現し、開発効率と保守性が大幅に向上します。

```typescript
// src/app.d.ts
/// <reference types="@sveltejs/kit" />

declare global {
  namespace App {
    // 1. リクエスト固有のサーバーサイドデータ
    interface Locals {
      user?: {
        id: string;
        email: string;
        name: string;
        role: 'admin' | 'user' | 'guest';
        permissions: string[];
      };
      session?: {
        id: string;
        expiresAt: Date;
      };
      db?: DatabaseConnection;
      requestId?: string;
    }
    
    // 2. すべてのページで共有されるデータ
    interface PageData {
      meta?: {
        title: string;
        description: string;
        keywords?: string[];
        ogImage?: string;
      };
      flash?: {
        type: 'success' | 'error' | 'info' | 'warning';
        message: string;
        dismissible?: boolean;
      };
      breadcrumbs?: Array<{
        label: string;
        href: string;
      }>;
      currentUser?: {
        name: string;
        avatar?: string;
      };
    }
    
    // 3. カスタムエラー型
    interface Error {
      message: string;
      code?: 'UNAUTHORIZED' | 'NOT_FOUND' | 'SERVER_ERROR' | 'VALIDATION_ERROR';
      details?: Record<string, any>;
      timestamp?: number;
      requestId?: string;
      stack?: string;
    }
    
    // 4. 履歴エントリの状態
    interface PageState {
      scrollPosition?: number;
      selectedTab?: string;
      expandedItems?: string[];
      formData?: Record<string, any>;
      filterState?: {
        search?: string;
        category?: string;
        sortBy?: string;
        page?: number;
      };
    }
    
    // 5. プラットフォーム固有のAPI
    interface Platform {
      env?: {
        DATABASE_URL: string;
        JWT_SECRET: string;
        API_KEY: string;
        REDIS_URL?: string;
        S3_BUCKET?: string;
      };
      context?: {
        waitUntil(promise: Promise<any>): void;
        passThroughOnException(): void;
      };
    }
  }
  
  // カスタムグローバル型
  type UUID = `${string}-${string}-${string}-${string}-${string}`;
  type DateString = `${number}-${number}-${number}`;
  type Timestamp = number;
  
  // データベースの型定義例
  interface DatabaseConnection {
    query<T>(sql: string, params?: any[]): Promise<T[]>;
    execute(sql: string, params?: any[]): Promise<void>;
    transaction<T>(fn: () => Promise<T>): Promise<T>;
  }
  
  // ウィンドウオブジェクトの拡張
  interface Window {
    __INITIAL_DATA__?: Record<string, any>;
    __PUBLIC_ENV__?: Record<string, string>;
  }
}

// このファイルがモジュールとして扱われるようにする
export {};
```

## ベストプラクティス

### 1. 型定義の整理

```typescript
// ✅ 良い例：関連する型をグループ化
interface Locals {
  auth?: AuthData;
  db?: DatabaseConnection;
  cache?: CacheClient;
}

interface AuthData {
  user: User;
  session: Session;
  permissions: Permission[];
}

// ❌ 避けるべき：フラットな構造
interface Locals {
  userId?: string;
  userEmail?: string;
  userName?: string;
  sessionId?: string;
  sessionExpiresAt?: Date;
  // ... 多数のプロパティ
}
```

### 2. 型の再利用

```typescript
// 共通の型を定義して再利用
type UserRole = 'admin' | 'editor' | 'viewer' | 'guest';

interface BaseUser {
  id: string;
  email: string;
  role: UserRole;
}

interface Locals {
  user?: BaseUser & {
    permissions: string[];
  };
}

interface PageData {
  currentUser?: BaseUser & {
    avatar?: string;
  };
}
```

### 3. 適切なオプショナル型の使用

```typescript
// ✅ 良い例：必須とオプショナルを明確に区別
interface Error {
  message: string;          // 必須
  code?: string;            // オプショナル
  details?: Record<string, any>;
}

// ❌ 避けるべき：すべてオプショナル
interface Error {
  message?: string;
  code?: string;
  details?: Record<string, any>;
}
```

## トラブルシューティング

### 型が認識されない場合

1. **TypeScriptの設定確認**

#### `tsconfig.json`ファイルの設定を確認

```typescript
// tsconfig.json
const tsConfig = {
  "extends": "./.svelte-kit/tsconfig.json",
  "compilerOptions": {
    "strict": true
  }
};
```

2. **開発サーバーの再起動**
```bash
npm run dev
```

3. **VSCodeの場合**
- Cmd/Ctrl+Shift+P → "TypeScript: Restart TS Server"

### 型の競合が発生する場合

```typescript
// namespaceの使用を確認
declare global {
  namespace App {
    // ここに定義
  }
}

// exportを忘れずに
export {};
```

## まとめ

`app.d.ts`による型定義は、SvelteKitアプリケーションの型安全性の基盤です。

- 🌍 **グローバルな型定義**でプロジェクト全体の一貫性を確保
- 🛡️ **5つの標準インターフェース**で主要な機能をカバー
- 🔄 **`./$types`との自動統合**で開発効率が向上
- 🎯 **プラットフォーム固有の型**も安全に扱える

これらの型定義を適切に設定することで、大規模なアプリケーションでも型安全性を維持しながら効率的な開発が可能になります。

## 次のステップ

- [ルーティング概要]({base}/sveltekit/routing/) - SvelteKitのルーティングシステムを学ぶ
- [Load関数とデータフェッチング]({base}/sveltekit/data-loading/) - データ取得の基礎を理解
- [TypeScript型の自動生成システム]({base}/sveltekit/data-loading/typescript-types/) - `./$types`との連携を深く理解
