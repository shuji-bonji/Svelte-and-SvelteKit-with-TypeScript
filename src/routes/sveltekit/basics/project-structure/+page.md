---
title: プロジェクト構造と規約
description: SvelteKitのプロジェクト構造をTypeScriptで理解する基礎ガイド - ディレクトリ構成、src/routes、src/lib、src/params、static、設定ファイル、特殊ファイルの役割を実例を交えて体系的に詳しく解説します
---

<script>
  import Mermaid from '$lib/components/Mermaid.svelte';
  
  const fileExecutionOrderDiagram = `flowchart TB

    Layout1["+layout.server.ts"]
    Page1["+page.server.ts"]
    Layout2["+layout.ts"]
    Page2["+page.ts"]
    Layout3["+layout.svelte"]
    Page3["+page.svelte"]
    
    Layout1 -->|1| Page1
    Page1 -->|2| Layout2
    Layout2 -->|3| Page2
    Page2 -->|4| Layout3
    Layout3 -->|5| Page3
    
    style Layout1 fill:#ff6b6b,color:#fff
    style Page1 fill:#ff6b6b,color:#fff
    style Layout2 fill:#4ecdc4,color:#fff
    style Page2 fill:#4ecdc4,color:#fff
    style Layout3 fill:#45b7d1,color:#fff
    style Page3 fill:#45b7d1,color:#fff`;
</script>

SvelteKitは **規約重視（Convention over Configuration）** の設計思想を採用しています。ファイル名と配置場所が機能を決定するため、プロジェクト構造の理解が極めて重要です。

このページでは、SvelteKitプロジェクトの完全な構造と各ファイルの役割を詳しく解説します。

## 基本的なプロジェクト構造

SvelteKitプロジェクトの基本的な構造を理解することで、効率的な開発が可能になります。まずは最小限の構成から始めて、必要に応じて拡張していきましょう。

### 最小構成

`npx sv create`で新規プロジェクトを作成した直後の、最も基本的なファイル構成です。この構成だけでも完全に動作するWebアプリケーションが構築できます。

```bash
my-sveltekit-app/
├── src/
│   ├── app.html          # HTMLテンプレート
│   ├── app.d.ts          # 型定義
│   ├── lib/              # 再利用可能コード
│   │   ├── assets/       # アセットファイル
│   │   │   └── favicon.svg
│   │   └── index.ts      # ライブラリエントリー
│   └── routes/           # ページとAPI
│       ├── +layout.svelte # ルートレイアウト
│       └── +page.svelte  # ホームページ
├── static/               # 静的ファイル
│   └── robots.txt        # クローラー設定
├── package.json          # 依存関係
├── svelte.config.js      # Svelte設定
├── vite.config.ts        # Vite設定
└── tsconfig.json         # TypeScript設定
```

:::tip[Svelte CLIについて]
最新の`npx sv create`コマンド（Svelte CLI v0.9.2以降）を使用すると、上記の構成が自動的に生成されます。旧来の`npm create svelte@latest`も引き続き使用可能です。
:::

### 完全な構成例

以下は、実際のプロダクション開発で使用される、すべての機能を含んだ構成例です。  
認証、API、静的ファイル、テストなど、エンタープライズ開発に必要な要素が含まれています。

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
├── vite.config.ts           # Vite設定
├── tsconfig.json            # TypeScript設定
└── playwright.config.ts      # E2Eテスト設定
```

## `src/`

アプリケーションのソースコードを格納する中心的なディレクトリです。ここにあるファイルはSvelteKitによって処理され、最適化されたコードに変換されます。

### `app.html` - アプリケーションシェル

すべてのページで使用されるHTMLテンプレートです。SvelteKitが生成するコンテンツを挿入するためのプレースホルダーを含んでいます。

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

#### プレースホルダー

app.htmlでは以下のプレースホルダーが使用できます。

- `%lang%` - HTML要素の言語属性
- `%sveltekit.assets%` - 静的アセットへのパス
- `%sveltekit.head%` - ページ固有のhead要素
- `%sveltekit.body%` - レンダリングされたアプリケーション
- `%sveltekit.nonce%` - CSP用のnonce値（セキュリティ）
- `%sveltekit.env.[NAME]%` - PUBLIC_プレフィックスの環境変数

:::info[詳細解説]
[SvelteKitプレースホルダー](/deep-dive/sveltekit-placeholders/)で、すべてのプレースホルダーの使用方法と参照元を詳しく解説しています。
:::

### `app.d.ts` - 型定義

アプリケーション全体で使用するグローバルな型定義を宣言するファイルです。エラー、ローカル状態、ページデータなど、SvelteKitの型システムを拡張できます。

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

### `hooks.server.ts` - サーバーフック

すべてのサーバーリクエストをインターセプトして処理できる強力なフックシステムです。認証、ロギング、セキュリティヘッダーの追加などの横断的な処理を実装できます。

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

## `lib/` - 共有コード

再利用可能なコンポーネントやユーティリティを整理して配置するディレクトリです。`$lib`エイリアスを使用することで、どこからでも簡単にインポートできます。

### `$lib`エイリアス

`src/lib`ディレクトリへの特別なインポートエイリアスです。相対パスの代わりに使用することで、ファイルの移動時にもインポートパスの修正が不要になります。

```typescript
// 絶対パスインポート
import Button from '$lib/components/Button.svelte';
import { user } from '$lib/stores/user.svelte.ts';
import { formatDate } from '$lib/utils/date';

// $lib = src/lib へのエイリアス
```

### 典型的な構成

実際のプロジェクトでよく使用される`lib`ディレクトリの構成例です。機能ごとにディレクトリを分けることで、メンテナンスが容易になります。

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

`$lib/server`ディレクトリ内のコードは自動的にサーバー専用として扱われ、クライアントバンドルから除外されます。データベース接続や秘密鍵などの機密情報を安全に扱えます。

```typescript
// src/lib/server/database.ts
// このファイルはクライアントにバンドルされない
import { PrismaClient } from '@prisma/client';

// サーバーでのみインスタンス化
export const db = new PrismaClient();

// ❌ クライアントコードでインポートするとエラー
// import { db } from '$lib/server/database';
```

### `$lib/api`と`src/routes/api`の使い分け

SvelteKitでは、API関連のコードを配置する場所として`$lib/api`と`src/routes/api`の2つの選択肢があります。それぞれ明確に異なる役割を持っています。

:::info[規約と慣例の違い]
- **`src/routes/api`**: SvelteKitの**規約**。`+server.ts`ファイルは自動的にHTTP APIエンドポイントになる
- **`$lib/api`**: コミュニティの**慣例**。技術的には`$lib/services`、`$lib/data`など任意の名前が使用可能
:::

#### `$lib/api` - サーバーサイドユーティリティ

`$lib/api`ディレクトリは、サーバーサイドのユーティリティ関数を配置する場所です。これらは**Web APIエンドポイントではなく**、`+page.server.ts`や`+layout.server.ts`から呼び出される内部的な処理です。

```typescript
// src/lib/api/posts.ts
// サーバーサイドユーティリティ（Web APIではない）
export async function getPosts() {
  const posts = await db.post.findMany();
  return posts;
}

export async function getPostBySlug(slug: string) {
  const post = await db.post.findUnique({
    where: { slug }
  });
  return post;
}
```

```typescript
// src/routes/blog/+page.server.ts
// Load関数から呼び出す
import { getPosts } from '$lib/api/posts';

export const load = async () => {
  const posts = await getPosts();
  return { posts };
};
```

#### `src/routes/api` - Web APIエンドポイント

`src/routes/api`以下の`+server.ts`ファイルは、実際のHTTP APIエンドポイントを定義します。これらはクライアントからfetchで呼び出し可能な**Web API**です。

```typescript
// src/routes/api/posts/+server.ts
// Web APIエンドポイント
import { json } from '@sveltejs/kit';
import { getPosts } from '$lib/api/posts';

export async function GET() {
  const posts = await getPosts();
  return json(posts);
}

export async function POST({ request }) {
  const data = await request.json();
  // 投稿作成処理
  return json({ success: true });
}
```

```typescript
// クライアントから呼び出し
const response = await fetch('/api/posts');
const posts = await response.json();
```

#### 使い分けのガイドライン

| 種類 | 配置場所 | 用途 | アクセス方法 |
|------|---------|------|------------|
| **サーバーサイドユーティリティ** | `$lib/api/` | Load関数やActions内で使用する処理<br/>データベースアクセス、外部API呼び出し | サーバーサイドコードからインポート |
| **Web APIエンドポイント** | `src/routes/api/` | RESTful API<br/>外部システムとの連携<br/>モバイルアプリのバックエンド | HTTPリクエスト（fetch） |

:::tip[実践的な使い方]
- **`$lib/api/`（慣例）**：データ取得・処理のユーティリティ関数（ファイルシステムやDBアクセスなど）
  - 他の名前でも可：`$lib/services/`、`$lib/data/`、`$lib/repositories/`など
- **`src/routes/api/`（規約）**：外部に公開するWeb APIエンドポイント（JSON APIなど）
  - 必ず`+server.ts`ファイルを使用し、HTTPメソッド（GET、POST等）をエクスポート
- クライアントから直接呼び出す必要がない処理は`$lib/`配下の任意の場所に配置
- サードパーティや別アプリケーションから呼び出す必要がある場合は`src/routes/api/`に配置
:::

## `routes/` - ルーティング

ファイルベースルーティングの中核となるディレクトリです。ディレクトリ構造がそのままURLパスになるため、直感的なルート設計が可能です。

### 基本的なルート構造

```bash
routes/
├── +page.svelte         # / (ホーム)
├── about/
│   └── +page.svelte     # /about
├── products/
│   ├── +page.svelte     # /products
│   └── [id]/            # 動的ルート
│       └── +page.svelte # /products/:id
└── (admin)/             # ルートグループ（URLに影響しない）
    └── dashboard/
        └── +page.svelte # /dashboard
```

:::info[ルーティングの詳細]
動的ルート、Restパラメータ、ルートグループ、マッチャーなどの高度なルーティング機能については、[ルーティング](/sveltekit/routing/)で詳しく解説しています。
:::

## ルートファイルの命名規約

SvelteKitはファイル名によって機能を決定します。特に`+`プレフィックスを持つファイルは特別な意味を持ち、フレームワークによって自動的に処理されます。

### 特殊ファイル名一覧

SvelteKitは`+`プレフィックスで特殊ファイルを識別します。各ファイルの実行環境は以下の通りです。

| ファイルパス例 | 役割 | 実行環境 |
|---------------|------|---------|  
| `+page.svelte` | ページコンポーネント | SSR時: サーバー → クライアント<br/>CSR時: クライアントのみ |
| `+page.ts` | ユニバーサルLoad関数 | SSR時: サーバー → クライアント<br/>CSR時: クライアントのみ |
| `+page.server.ts` | サーバー専用Load関数とActions | サーバーのみ<br/>（SSR/SSG/フォーム送信/API呼び出し時） |
| `+layout.svelte` | レイアウトコンポーネント | SSR時: サーバー → クライアント<br/>CSR時: クライアントのみ |
| `+layout.ts` | レイアウトのユニバーサルLoad関数 | SSR時: サーバー → クライアント<br/>CSR時: クライアントのみ |
| `+layout.server.ts` | レイアウトのサーバー専用Load関数 | サーバーのみ<br/>（SSR/SSG時） |
| `+error.svelte` | エラーページコンポーネント | SSR時: サーバー → クライアント<br/>CSR時: クライアントのみ |
| `+server.ts` | APIエンドポイント | サーバーのみ（API呼び出し時） |

:::tip[実行環境の理解]
- **ユニバーサル（.ts）**: サーバーとクライアント両方で実行可能なコード
- **サーバー専用（.server.ts）**: サーバーのみで実行され、データベースアクセスや秘密情報を扱える
- **コンポーネント（.svelte）**: SSR時はサーバーでHTMLを生成後、クライアントでハイドレーション
:::

### ファイルの基本的な実行順序

<Mermaid diagram={fileExecutionOrderDiagram} />

上記は基本的な実行順序です。実際の実行環境はレンダリングモードによって異なります。

### レンダリングモード別の実行タイミング

| ファイル | SSR（デフォルト） | SSG（prerender） | CSR（ssr: false） |
|---------|-----------------|----------------|------------------|
| **初回アクセス時** |
| `+layout.server.ts` | サーバーで実行 | ビルド時に実行 | 実行されない |
| `+page.server.ts` (load) | サーバーで実行 | ビルド時に実行 | 実行されない |
| `+layout.ts` | サーバー → クライアント | ビルド時 → クライアント | クライアントのみ |
| `+page.ts` | サーバー → クライアント | ビルド時 → クライアント | クライアントのみ |
| `+layout.svelte` | サーバー → クライアント | 静的HTML → クライアント | クライアントのみ |
| `+page.svelte` | サーバー → クライアント | 静的HTML → クライアント | クライアントのみ |
| **ページ遷移時** |
| `+layout.server.ts` | 実行されない | 実行されない | 実行されない |
| `+page.server.ts` (load) | 実行されない | 実行されない | 実行されない |
| `+layout.ts` | クライアントのみ | クライアントのみ | クライアントのみ |
| `+page.ts` | クライアントのみ | クライアントのみ | クライアントのみ |
| `+layout.svelte` | クライアントのみ | クライアントのみ | クライアントのみ |
| `+page.svelte` | クライアントのみ | クライアントのみ | クライアントのみ |
| **フォーム送信時** |
| `+page.server.ts` (actions) | サーバーで実行 | サーバーで実行 | サーバーで実行 |

:::tip[重要なポイント]
- **Actions（フォーム処理）**: すべてのモードでサーバーで実行されます
- **APIエンドポイント（+server.ts）**: すべてのモードで利用可能
- **ページ遷移後**: どのモードでもクライアントサイドナビゲーションになります
- 詳細なレンダリング戦略の違いは[レンダリング戦略とアーキテクチャパターン](/sveltekit/architecture/rendering-strategies/)で解説しています
:::

:::info[関連情報]
- **ルーティングの詳細**: URLとファイルのマッピングについては[ルーティング](/sveltekit/routing/)を参照
- **レンダリング戦略**: SSR/SSG/SPAの選択基準は[レンダリング戦略](/sveltekit/basics/rendering-strategies/)を参照
- **実行環境の深い理解**: [アーキテクチャ詳解](/sveltekit/architecture/)でより詳細な内部動作を解説
:::

## 設定ファイル

SvelteKitプロジェクトの動作を制御する重要な設定ファイル群です。ビルド、デプロイ、開発環境のカスタマイズが可能です。

### `svelte.config.js`

SvelteコンパイラとSvelteKitの動作をカスタマイズするメイン設定ファイルです。アダプターの選択、エイリアスの設定、プリレンダリングオプションなどを制御します。

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

### `vite.config.ts`

Viteビルドツールの設定ファイルです。開発サーバーの設定、ビルド最適化、環境変数の定義など、開発環境とビルドプロセスをカスタマイズできます。

```typescript
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

### `tsconfig.json`

TypeScriptコンパイラの設定ファイルです。型チェックの厳密度、モジュール解決、パスマッピングなどを設定します。SvelteKitが自動生成する設定を継承します。

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

セキュリティを保ちながら設定値を管理するための仕組みです。`PUBLIC_`プレフィックスの有無で、クライアントへの公開を制御できます。

### `.env` ファイル

環境変数を定義するファイルです。`PUBLIC_`プレフィックス付きの変数はクライアントに公開され、それ以外はサーバー専用となります。

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

SvelteKitは`$env`モジュールを通じて、型安全に環境変数にアクセスできます。静的・動的、公開・非公開の組み合わせで利用可能です。

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

ビルド処理を経由せずに直接配信されるファイルを配置するディレクトリです。画像、フォント、ファビコンなど、変更频度の低いリソースに適しています。

### `static/`

ビルド処理を経由せずに直接配信されるファイルの配置場所です。ファビコン、ロボットファイル、画像などの静的リソースを格納します。

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

コンパイルおよびビルド処理の結果が出力されるディレクトリです。通常はGit管理から除外し、デプロイ時に生成します。

### `.svelte-kit/`

SvelteKitが自動生成する一時ファイルが格納されるディレクトリです。型定義、マニフェスト、ルート情報などが含まれます。Git管理からは除外します。

```bash
.svelte-kit/          # 自動生成（gitignore）
├── generated/        # 生成されたファイル
│   ├── client/      # クライアントマニフェスト
│   ├── server/      # サーバーマニフェスト
│   └── root.svelte  # ルートコンポーネント
├── types/           # 型定義
└── tsconfig.json    # TypeScript設定
```

### `dist/` (adapter-static使用時)

`npm run build`実行時に生成されるプロダクションビルドの出力ディレクトリです。このプロジェクトでは`adapter-static`を使用しているため、`dist/`ディレクトリに静的ファイルが出力されます。

```bash
dist/                # 静的サイト出力（adapter-static）
├── _app/            # JSとCSSバンドル
│   ├── immutable/   # キャッシュ可能なアセット
│   └── version.json # バージョン情報
├── *.html           # プリレンダリングされたHTML
└── [その他の静的ファイル]
```

:::note[アダプター別の出力ディレクトリ]
使用するアダプターによって出力先が異なります。
- `adapter-static`: `dist/`（静的サイトジェネレーター）
- `adapter-node`: `build/`（Node.jsサーバー用）
- `adapter-vercel`: `.vercel/`（Vercelデプロイ用）
- `adapter-cloudflare`: `.cloudflare/`（Cloudflare Workers用）
- `adapter-netlify`: `.netlify/`（Netlifyデプロイ用）

設定は`svelte.config.js`の`adapter`オプションで指定します。
:::

## ベストプラクティス

実際のプロジェクト開発で蓄積された、効率的で保守しやすいコードを書くためのガイドラインです。

### ディレクトリ構成のガイドライン

整理されたディレクトリ構造を維持するためのガイドラインです。大規模プロジェクトでも保守性を高く保つためのベストプラクティスです。

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

コードベース全体で一貫性のある命名規約を守ることで、可読性と保守性が向上します。SvelteKitコミュニティで広く採用されているスタイルです。

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

開発中に遇遇する可能性のある一般的な問題とその解決方法です。ファイルが認識されない、型定義が更新されないなどの問題への対処法を説明します。

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
- ビルド後は`dist/`ディレクトリを確認
:::

## まとめ

プロジェクト構造の理解はSvelteKit開発の基礎です。規約に従うことで、フレームワークの強力な機能を最大限に活用できます。

SvelteKitのプロジェクト構造は、
- **規約重視**: ファイル名が機能を決定
- **明確な分離**: クライアント/サーバーコードの明確な境界
- **型安全**: 自動生成される型定義
- **柔軟性**: カスタマイズ可能な設定

## 次のステップ

プロジェクト構造を理解したら、[ルーティング](/sveltekit/routing/)で、より高度なルーティングテクニックを学びましょう。