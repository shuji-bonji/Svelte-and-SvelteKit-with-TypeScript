<script>
  import Mermaid from '$lib/components/Mermaid.svelte';
  
  const fileExecutionOrderDiagram = `graph TB
    subgraph "サーバーサイド"
        LS["1. +layout.server.ts"]
        PS["2. +page.server.ts"]
    end
    
    subgraph "ユニバーサル"
        LU["3. +layout.ts"]
        PU["4. +page.ts"]
    end
    
    subgraph "コンポーネント"
        LC["5. +layout.svelte"]
        PC["6. +page.svelte"]
    end
    
    LS --> PS
    PS --> LU
    LU --> PU
    PU --> LC
    LC --> PC
    
    style LS fill:#ff6b6b
    style PS fill:#ff6b6b
    style LU fill:#4ecdc4
    style PU fill:#4ecdc4
    style LC fill:#45b7d1
    style PC fill:#45b7d1`;
</script>

---
title: プロジェクト構造と規約
description: SvelteKitプロジェクトの完全なディレクトリ構造と命名規約を理解する
---

SvelteKitは**規約重視（Convention over Configuration）**の設計思想を採用しています。ファイル名と配置場所が機能を決定するため、プロジェクト構造の理解が極めて重要です。このページでは、SvelteKitプロジェクトの完全な構造と各ファイルの役割を詳しく解説します。

## 基本的なプロジェクト構造

### 最小構成

```bash
my-sveltekit-app/
├── src/
│   ├── app.html          # HTMLテンプレート
│   ├── app.d.ts          # 型定義
│   └── routes/           # ページとAPI
│       └── +page.svelte  # ホームページ
├── static/               # 静的ファイル
├── package.json          # 依存関係
├── svelte.config.js      # Svelte設定
├── vite.config.js        # Vite設定
└── tsconfig.json         # TypeScript設定
```

### 完全な構成

```bash
my-sveltekit-app/
├── src/
│   ├── app.html              # アプリケーションシェル
│   ├── app.d.ts              # グローバル型定義
│   ├── app.css               # グローバルCSS
│   ├── hooks.server.ts       # サーバーフック
│   ├── hooks.client.ts       # クライアントフック
│   ├── service-worker.ts     # Service Worker
│   │
│   ├── lib/                  # 再利用可能コード ($lib)
│   │   ├── components/       # 共有コンポーネント
│   │   ├── stores/           # グローバルストア
│   │   ├── utils/            # ユーティリティ関数
│   │   ├── server/           # サーバー専用コード
│   │   └── types/            # 型定義
│   │
│   ├── params/               # ルートパラメータマッチャー
│   │   └── integer.ts        # カスタムマッチャー
│   │
│   └── routes/               # アプリケーションルート
│       ├── +layout.svelte    # ルートレイアウト
│       ├── +layout.ts        # レイアウトLoad関数
│       ├── +page.svelte      # ホームページ
│       ├── +error.svelte     # エラーページ
│       │
│       ├── about/
│       │   └── +page.svelte  # /about
│       │
│       ├── blog/
│       │   ├── +page.svelte  # /blog
│       │   └── [slug]/
│       │       ├── +page.ts  # Load関数
│       │       └── +page.svelte
│       │
│       └── api/
│           └── posts/
│               └── +server.ts # API: /api/posts
│
├── static/                   # 静的ファイル
│   ├── favicon.png
│   └── robots.txt
│
├── tests/                    # テストファイル
│   └── test.ts
│
├── .env                      # 環境変数
├── .env.example              # 環境変数サンプル
├── .gitignore               
├── package.json
├── svelte.config.js         # Svelte設定
├── vite.config.js           # Vite設定
├── tsconfig.json            # TypeScript設定
└── playwright.config.ts      # E2Eテスト設定
```

## ルートファイルの命名規約

### 特殊ファイル名一覧

SvelteKitは`+`プレフィックスで特殊ファイルを識別

| ファイル名 | 役割 | 実行環境 |
|-----------|------|---------|
| `+page.svelte` | ページコンポーネント | Universal |
| `+page.ts` | ページLoad関数 | Universal |
| `+page.server.ts` | サーバーLoad関数とActions | Server |
| `+layout.svelte` | レイアウトコンポーネント | Universal |
| `+layout.ts` | レイアウトLoad関数 | Universal |
| `+layout.server.ts` | サーバーレイアウトLoad | Server |
| `+error.svelte` | エラーページ | Universal |
| `+server.ts` | APIエンドポイント | Server |

### ファイルの実行順序

<Mermaid diagram={fileExecutionOrderDiagram} />

## src/ディレクトリ詳細

### app.html - アプリケーションシェル

```html
<!DOCTYPE html>
<html lang="%lang%">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%sveltekit.assets%/favicon.png" />
    <meta name="viewport" content="width=device-width" />
    %sveltekit.head%
  </head>
  <body data-sveltekit-preload-data="hover">
    <div style="display: contents">%sveltekit.body%</div>
  </body>
</html>
```

**プレースホルダー**:
- `%lang%` - 言語設定
- `%sveltekit.assets%` - アセットパス
- `%sveltekit.head%` - head要素の内容
- `%sveltekit.body%` - アプリケーション本体

### app.d.ts - 型定義

```typescript
/// <reference types="@sveltejs/kit" />

declare global {
  namespace App {
    interface Error {
      code?: string;
      id?: string;
    }
    
    interface Locals {
      user?: {
        id: string;
        email: string;
        role: 'admin' | 'user';
      };
      session?: string;
    }
    
    interface PageData {
      // ページデータの共通型
    }
    
    interface Platform {
      // プラットフォーム固有の型
      env?: {
        COUNTER: DurableObjectNamespace;
      };
    }
  }
}

export {};
```

### hooks.server.ts - サーバーフック

```typescript
import type { Handle, HandleServerError, HandleFetch } from '@sveltejs/kit';

// リクエスト処理
export const handle: Handle = async ({ event, resolve }) => {
  // 認証チェック
  const session = event.cookies.get('session');
  
  if (session) {
    event.locals.user = await getUserFromSession(session);
  }
  
  // レスポンス処理
  const response = await resolve(event);
  
  // セキュリティヘッダー追加
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  return response;
};

// エラーハンドリング
export const handleError: HandleServerError = async ({ error, event }) => {
  console.error('Server error:', error);
  
  return {
    message: 'Internal Server Error',
    code: 'INTERNAL_ERROR'
  };
};

// fetch処理のインターセプト
export const handleFetch: HandleFetch = async ({ request, fetch }) => {
  // APIリクエストに認証ヘッダー追加
  if (request.url.startsWith('https://api.example.com')) {
    request.headers.set('Authorization', `Bearer ${API_KEY}`);
  }
  
  return fetch(request);
};
```

## lib/ディレクトリ - 共有コード

### $libエイリアス

```typescript
// 絶対パスインポート
import Button from '$lib/components/Button.svelte';
import { user } from '$lib/stores/user.svelte.ts';
import { formatDate } from '$lib/utils/date';

// $lib = src/lib へのエイリアス
```

### 典型的な構成

```bash
src/lib/
├── components/           # UIコンポーネント
│   ├── Button.svelte
│   ├── Card.svelte
│   └── Modal.svelte
│
├── stores/              # グローバル状態
│   ├── user.svelte.ts   # ユーザーストア
│   └── theme.svelte.ts  # テーマストア
│
├── utils/               # ユーティリティ
│   ├── api.ts          # API呼び出し
│   ├── date.ts         # 日付処理
│   └── validation.ts   # バリデーション
│
├── server/              # サーバー専用
│   ├── database.ts     # DB接続
│   ├── auth.ts         # 認証ロジック
│   └── email.ts        # メール送信
│
└── types/               # 型定義
    ├── api.ts          # API型
    └── models.ts       # データモデル
```

### サーバー専用コードの分離

```typescript
// src/lib/server/database.ts
// このファイルはクライアントにバンドルされない
import { PrismaClient } from '@prisma/client';

// サーバーでのみインスタンス化
export const db = new PrismaClient();

// ❌ クライアントコードでインポートするとエラー
// import { db } from '$lib/server/database';
```

## routes/ディレクトリ - ルーティング

### 基本的なルート構造

```bash
routes/
├── +page.svelte         # / (ホーム)
├── about/
│   └── +page.svelte     # /about
├── products/
│   ├── +page.svelte     # /products
│   └── [id]/            # 動的ルート
│       └── +page.svelte # /products/123
└── blog/
    ├── +page.svelte     # /blog
    └── [...slug]/       # Rest parameters
        └── +page.svelte # /blog/2024/12/title
```

### ルートグループ

```bash
routes/
├── (marketing)/         # URLに影響しないグループ
│   ├── +layout.svelte   # マーケティングレイアウト
│   ├── +page.svelte     # /
│   └── pricing/
│       └── +page.svelte # /pricing
│
├── (app)/              # アプリケーションUI
│   ├── +layout.svelte  # アプリレイアウト  
│   └── dashboard/
│       └── +page.svelte # /dashboard
│
└── (api)/              # APIルート
    └── v1/
        └── users/
            └── +server.ts # /v1/users
```

### 特殊なルート記法

```bash
# 動的セグメント
[param]/+page.svelte      # /anything

# オプショナル
[[optional]]/+page.svelte # / または /value

# Rest Parameters
[...rest]/+page.svelte    # /a/b/c

# マッチャー付き
[id=integer]/+page.svelte # /123 (数字のみ)

# プライベート（ルーティング除外）
_components/              # URLにならない
```

## 設定ファイル

### svelte.config.js

```javascript
import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

export default {
  preprocess: vitePreprocess(),
  
  kit: {
    adapter: adapter(),
    
    alias: {
      '@components': 'src/lib/components',
      '@utils': 'src/lib/utils'
    },
    
    files: {
      assets: 'static',
      hooks: {
        client: 'src/hooks.client',
        server: 'src/hooks.server'
      },
      lib: 'src/lib',
      params: 'src/params',
      routes: 'src/routes',
      serviceWorker: 'src/service-worker',
      appTemplate: 'src/app.html',
      errorTemplate: 'src/error.html'
    },
    
    paths: {
      base: '',
      relative: true
    },
    
    prerender: {
      handleHttpError: 'warn',
      handleMissingId: 'warn'
    }
  }
};
```

### vite.config.js

```javascript
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  
  server: {
    port: 5173,
    strictPort: false,
    host: 'localhost'
  },
  
  preview: {
    port: 4173,
    strictPort: false
  },
  
  optimizeDeps: {
    include: ['lodash-es']
  },
  
  define: {
    __BUILD_TIME__: JSON.stringify(new Date().toISOString())
  }
});
```

### tsconfig.json

```typescript
// TypeScript設定ファイル (tsconfig.json)
const tsConfig = {
  "extends": "./.svelte-kit/tsconfig.json",
  "compilerOptions": {
    "allowJs": true,
    "checkJs": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "sourceMap": true,
    "strict": true,
    "moduleResolution": "bundler",
    "paths": {
      "$lib": ["./src/lib"],
      "$lib/*": ["./src/lib/*"]
    }
  }
};
```

## 環境変数

### .env ファイル

```bash
# 公開可能な変数（クライアントで使用可）
PUBLIC_API_URL=https://api.example.com
PUBLIC_SITE_NAME="My SvelteKit App"

# プライベート変数（サーバーのみ）
DATABASE_URL=postgresql://user:pass@localhost/db
SECRET_KEY=supersecret
API_KEY=xxx-xxx-xxx
```

### 環境変数の使用

```typescript
// クライアント＆サーバー
import { PUBLIC_API_URL } from '$env/static/public';
import { env } from '$env/dynamic/public';

// サーバーのみ
import { DATABASE_URL } from '$env/static/private';
import { env as privateEnv } from '$env/dynamic/private';

// 使用例
const response = await fetch(`${PUBLIC_API_URL}/users`);
```

## 静的ファイル

### static/ディレクトリ

```bash
static/
├── favicon.png       # /favicon.png
├── robots.txt       # /robots.txt
├── manifest.json    # /manifest.json
├── images/          
│   └── logo.png     # /images/logo.png
└── fonts/
    └── custom.woff2 # /fonts/custom.woff2
```

静的ファイルは直接URLでアクセス可能

```html
<img src="/images/logo.png" alt="Logo" />
<link rel="manifest" href="/manifest.json" />
```

## ビルド出力

### .svelte-kit/ディレクトリ

```bash
.svelte-kit/          # 自動生成（gitignore）
├── generated/        # 生成されたファイル
│   ├── client/      # クライアントマニフェスト
│   ├── server/      # サーバーマニフェスト
│   └── root.svelte  # ルートコンポーネント
├── types/           # 型定義
└── tsconfig.json    # TypeScript設定
```

### build/ディレクトリ

```bash
build/               # プロダクションビルド
├── client/          # クライアント資産
│   ├── _app/        # JSとCSSバンドル
│   └── [静的ファイル]
└── server/          # サーバーコード
    ├── chunks/      # 共有チャンク
    ├── entries/     # エントリーポイント
    └── index.js     # サーバー起動
```

## ベストプラクティス

### ディレクトリ構成のガイドライン

✅ **推奨事項**
- `$lib`を活用して共有コードを整理
- サーバー専用コードは`$lib/server`に配置
- ルートグループで関連ページをまとめる
- 型定義は`$lib/types`に集約

❌ **避けるべきこと**
- `routes`内に共有コンポーネントを配置
- クライアントコードに秘密情報を含める
- 深すぎるネスト構造（3階層まで推奨）

### 命名規約

```typescript
// ファイル名
PascalCase.svelte      // コンポーネント
camelCase.ts          // TypeScript/JavaScript
kebab-case/           // ディレクトリ

// 変数・関数名
const userName = '';   // キャメルケース
function getData() {}  // キャメルケース

// 定数
const API_KEY = '';    // アッパースネーク

// 型定義
type UserData = {};    // パスカルケース
interface ApiResponse {} // パスカルケース
```

## トラブルシューティング

:::warning[ファイルが認識されない]
- ファイル名が正しいか確認（`+`プレフィックス必須）
- 拡張子を確認（`.svelte`, `.ts`, `.js`）
- 開発サーバーを再起動
:::

:::tip[型定義が更新されない]
```bash
# 型定義を再生成
npm run dev
# または
npm run sync
```
:::

:::caution[静的ファイルが見つからない]
- `static/`ディレクトリに配置されているか確認
- URLパスが正しいか確認（`/`から始まる）
- ビルド後は`build/client/`を確認
:::

## まとめ

SvelteKitのプロジェクト構造は、
- **規約重視**: ファイル名が機能を決定
- **明確な分離**: クライアント/サーバーコードの明確な境界
- **型安全**: 自動生成される型定義
- **柔軟性**: カスタマイズ可能な設定

## 次のステップ

プロジェクト構造を理解したら、[ルーティング詳解](/sveltekit/routing/)で、より高度なルーティングテクニックを学びましょう。