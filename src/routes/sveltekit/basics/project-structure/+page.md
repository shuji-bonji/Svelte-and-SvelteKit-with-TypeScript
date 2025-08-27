---
title: プロジェクト構造と規約
description: SvelteKitプロジェクトの完全なディレクトリ構造と命名規約を理解する
---

<script>
  import Mermaid from '$lib/components/Mermaid.svelte';
  
  const fileExecutionOrderDiagram = `graph TB
    subgraph "初回ロード時（SSR/SSG）"
        direction TB
        S1["1.+layout.server.ts<br/>(サーバー)"]
        S2["2.+page.server.ts<br/>(サーバー)"]
        S3["3.+layout.ts<br/>(サーバー)"]
        S4["4.+page.ts<br/>(サーバー)"]
        S5["5.+layout.svelte<br/>(サーバー→HTML生成)"]
        S6["6.+page.svelte<br/>(サーバー→HTML生成)"]
        S7["7.ハイドレーション<br/>(ブラウザ)"]
        
        S1 --> S2
        S2 --> S3
        S3 --> S4
        S4 --> S5
        S5 --> S6
        S6 --> S7
    end
    
    subgraph "クライアントサイドナビゲーション時"
        direction TB
        C1["1.+layout.ts<br/>(ブラウザ)"]
        C2["2.+page.ts<br/>(ブラウザ)"]
        C3["3.+layout.svelte<br/>(ブラウザ)"]
        C4["4.+page.svelte<br/>(ブラウザ)"]
        
        C1 --> C2
        C2 --> C3
        C3 --> C4
    end
    
    style S1 fill:#ff6b6b
    style S2 fill:#ff6b6b
    style S3 fill:#4ecdc4
    style S4 fill:#4ecdc4
    style S5 fill:#45b7d1
    style S6 fill:#45b7d1
    style S7 fill:#FFC107
    
    style C1 fill:#4ecdc4
    style C2 fill:#4ecdc4
    style C3 fill:#45b7d1
    style C4 fill:#45b7d1`;
</script>



SvelteKitは **規約重視（Convention over Configuration）** の設計思想を採用しています。ファイル名と配置場所が機能を決定するため、プロジェクト構造の理解が極めて重要です。このページでは、SvelteKitプロジェクトの完全な構造と各ファイルの役割を詳しく解説します。

## 基本的なプロジェクト構造

SvelteKitプロジェクトの基本的な構造を理解することで、効率的な開発が可能になります。まずは最小限の構成から始めて、必要に応じて拡張していきましょう。

### 最小構成

新規プロジェクトを作成した直後の、最も基本的なファイル構成です。この構成だけでも完全に動作するWebアプリケーションが構築できます。

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

実際のプロダクション開発で使用される、すべての機能を含んだ構成例です。認証、API、静的ファイル、テストなど、エンタープライズ開発に必要な要素が含まれています。

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

SvelteKitはファイル名によって機能を決定します。特に`+`プレフィックスを持つファイルは特別な意味を持ち、フレームワークによって自動的に処理されます。

### 特殊ファイル名一覧

SvelteKitは`+`プレフィックスで特殊ファイルを識別

| ファイル名 | 役割 | SSR/SSG<br/>（初回ロード） | ナビゲーション時 | CSR/SPA<br/>（ssr: false） |
|-----------|------|---------|---------|---------|
| `+page.svelte` | ページコンポーネント | サーバー → ブラウザ | ブラウザ | ブラウザのみ |
| `+page.ts` | ページLoad関数 | サーバー → ブラウザ | ブラウザ | ブラウザのみ |
| `+page.server.ts` | サーバーLoad関数とActions | サーバー | 実行されない | 実行されない |
| `+layout.svelte` | レイアウトコンポーネント | サーバー → ブラウザ | ブラウザ | ブラウザのみ |
| `+layout.ts` | レイアウトLoad関数 | サーバー → ブラウザ | ブラウザ | ブラウザのみ |
| `+layout.server.ts` | サーバーレイアウトLoad | サーバー | 実行されない | 実行されない |
| `+error.svelte` | エラーページ | サーバー → ブラウザ | ブラウザ | ブラウザのみ |
| `+server.ts` | APIエンドポイント | サーバー | サーバー（API呼び出し） | サーバー（API呼び出し） |

### ファイルの実行順序

<Mermaid diagram={fileExecutionOrderDiagram} />

:::info[実行環境について]
- **SSR/SSG（初回ロード）**: すべてのファイルがサーバーで実行され、HTMLが生成されます。その後、ブラウザでハイドレーションが行われます
- **ナビゲーション時**: SSR/SSGモードでも、ページ遷移時は`.server.ts`ファイル以外はブラウザで実行されます
- **CSR/SPA（`ssr: false`モード）**: 初回ロードを含め、アプリ全体がブラウザのみで動作し、`.server.ts`ファイルは一切実行されません。これが真のSPAモードです
- **ユニバーサルファイル**（`.ts`、`.svelte`）: 実行コンテキストに応じてサーバーまたはブラウザで動作します

**用語の整理**:
- CSR（Client-Side Rendering）= SPA（Single Page Application）として`ssr: false`で設定
- SSRアプリでのクライアントサイドナビゲーション ≠ CSR/SPA
:::

## src/ディレクトリ詳細

アプリケーションのソースコードを格納する中心的なディレクトリです。ここにあるファイルはSvelteKitによって処理され、最適化されたコードに変換されます。

### app.html - アプリケーションシェル

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

**プレースホルダー**:
- `%lang%` - 言語設定
- `%sveltekit.assets%` - アセットパス
- `%sveltekit.head%` - head要素の内容
- `%sveltekit.body%` - アプリケーション本体

### app.d.ts - 型定義

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

### hooks.server.ts - サーバーフック

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

## lib/ディレクトリ - 共有コード

再利用可能なコンポーネントやユーティリティを整理して配置するディレクトリです。`$lib`エイリアスを使用することで、どこからでも簡単にインポートできます。

### $libエイリアス

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

## routes/ディレクトリ - ルーティング

ファイルベースルーティングの中核となるディレクトリです。ディレクトリ構造がそのままURLパスになるため、直感的なルート設計が可能です。

### 基本的なルート構造

ディレクトリ構造がそのままURLパスにマッピングされる仕組みです。ファイルシステムベースの直感的なルーティングを実現します。

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

`()`で囲まれたディレクトリは、URLパスに影響を与えずにレイアウトや機能をグループ化できます。異なるセクション用のレイアウトを使い分ける際に便利です。

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

SvelteKitは動的ルーティングのための特殊な記法を提供します。`[]`を使用したパラメータ、Restパラメータ、マッチャーなど、柔軟なURL設計が可能です。

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

SvelteKitプロジェクトの動作を制御する重要な設定ファイル群です。ビルド、デプロイ、開発環境のカスタマイズが可能です。

### svelte.config.js

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

### vite.config.js

Viteビルドツールの設定ファイルです。開発サーバーの設定、ビルド最適化、環境変数の定義など、開発環境とビルドプロセスをカスタマイズできます。

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

### .env ファイル

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

### static/ディレクトリ

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

### .svelte-kit/ディレクトリ

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

### build/ディレクトリ

`npm run build`実行時に生成されるプロダクションビルドの出力ディレクトリです。クライアントコードとサーバーコードが最適化された状態で出力されます。

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
- ビルド後は`build/client/`を確認
:::

## まとめ

プロジェクト構造の理解はSvelteKit開発の基礎です。規約に従うことで、フレームワークの強力な機能を最大限に活用できます。

SvelteKitのプロジェクト構造は、
- **規約重視**: ファイル名が機能を決定
- **明確な分離**: クライアント/サーバーコードの明確な境界
- **型安全**: 自動生成される型定義
- **柔軟性**: カスタマイズ可能な設定

## 次のステップ

プロジェクト構造を理解したら、[ルーティング詳解](/sveltekit/basics/routing/)で、より高度なルーティングテクニックを学びましょう。