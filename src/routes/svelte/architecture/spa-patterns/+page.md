---
title: SPA + API構成
description: SvelteでSPAを構築し、Firebase、Supabase、GraphQLなどのバックエンドと統合する方法をTypeScriptで実装。実践的な構築パターンを解説
---

<script>
  import { base } from '$app/paths';
  import Mermaid from '$lib/components/Mermaid.svelte';
  
  const spaArchitecture = `flowchart LR
    subgraph Frontend["🌐 フロントエンド"]
      Svelte[Svelte SPA]
      Router[Client Router]
      Store[State Store]
    end
    
    subgraph Backend["☁️ バックエンド"]
      API[REST/GraphQL API]
      Auth[認証サービス]
      DB[(データベース)]
      Storage[ファイルストレージ]
    end
    
    Svelte --> Router
    Router --> Store
    Store <--> API
    API --> Auth
    API --> DB
    API --> Storage
    
    style Svelte fill:#ff3e00,color:#fff
    style API fill:#4CAF50,color:#fff
    style DB fill:#2196F3,color:#fff`;
</script>

Svelte単体でSPA（Single Page Application）を構築し、様々なバックエンドサービスと組み合わせる構成パターンです。SvelteKitを使わずに、より柔軟な構成でアプリケーションを構築できます。

## SPA + API構成の特徴

<Mermaid diagram={spaArchitecture} />

### メリット

- 🎯 **バックエンドの自由度** - 任意の言語・フレームワークを選択可能
- 🔧 **既存APIの活用** - 既に稼働しているAPIをそのまま利用
- ☁️ **BaaSの活用** - Firebase、Supabaseなどのサービスを最大限活用
- 📦 **シンプルなデプロイ** - 静的ファイルとしてCDNにデプロイ可能

### デメリット

- 🔍 **SEOの課題** - クライアントサイドレンダリングのため、SEO対策が必要
- ⚡ **初期表示の遅延** - JavaScriptのダウンロード・実行後に表示
- 🔐 **セキュリティ** - APIキーの管理、CORS設定などが必要

## 主要な統合パターン

<div class="grid grid-cols-1 gap-6 my-8">
  <a href="{base}/svelte/architecture/spa-patterns/firebase/" class="no-underline">
    <div class="p-6 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-lg transition-all">
      <div class="flex items-start gap-4">
        <div class="text-4xl">🔥</div>
        <div class="flex-1">
          <h3 class="font-bold text-xl mb-2 text-orange-600 dark:text-orange-400">Firebase統合</h3>
          <p class="text-sm text-gray-700 dark:text-gray-300 mb-3">
            Googleの包括的なBaaSプラットフォーム。認証、Firestore、Cloud Functions、Hostingなど、フルスタック開発に必要な機能を提供。
          </p>
          <div class="flex flex-wrap gap-2">
            <span class="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs rounded">認証</span>
            <span class="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs rounded">リアルタイムDB</span>
            <span class="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs rounded">ストレージ</span>
            <span class="px-2 py-1 bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 text-xs rounded">ホスティング</span>
          </div>
        </div>
      </div>
    </div>
  </a>

  <a href="{base}/svelte/architecture/spa-patterns/supabase/" class="no-underline">
    <div class="p-6 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-lg transition-all">
      <div class="flex items-start gap-4">
        <div class="text-4xl">⚡</div>
        <div class="flex-1">
          <h3 class="font-bold text-xl mb-2 text-orange-600 dark:text-orange-400">Supabase統合</h3>
          <p class="text-sm text-gray-700 dark:text-gray-300 mb-3">
            オープンソースのFirebase代替。PostgreSQLベース、リアルタイム機能、Row Level Securityなど、エンタープライズ向け機能が充実。
          </p>
          <div class="flex flex-wrap gap-2">
            <span class="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs rounded">PostgreSQL</span>
            <span class="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs rounded">リアルタイム</span>
            <span class="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs rounded">RLS</span>
            <span class="px-2 py-1 bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 text-xs rounded">Edge Functions</span>
          </div>
        </div>
      </div>
    </div>
  </a>

  <a href="{base}/svelte/architecture/spa-patterns/graphql/" class="no-underline">
    <div class="p-6 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-lg transition-all">
      <div class="flex items-start gap-4">
        <div class="text-4xl">🎯</div>
        <div class="flex-1">
          <h3 class="font-bold text-xl mb-2 text-orange-600 dark:text-orange-400">GraphQL統合</h3>
          <p class="text-sm text-gray-700 dark:text-gray-300 mb-3">
            Apollo Client、urql、Hasuraなどを使用したGraphQL統合。型安全で効率的なデータフェッチング、リアルタイムサブスクリプション対応。
          </p>
          <div class="flex flex-wrap gap-2">
            <span class="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs rounded">型安全</span>
            <span class="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs rounded">効率的なフェッチ</span>
            <span class="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs rounded">サブスクリプション</span>
            <span class="px-2 py-1 bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 text-xs rounded">キャッシュ</span>
          </div>
        </div>
      </div>
    </div>
  </a>
</div>

## 基本的なSPAセットアップ

SvelteでSPAを構築する際の基本的なセットアップ手順を説明します。ViteをビルドツールとしてTypeScript対応のSvelteプロジェクトを作成し、必要な機能を段階的に追加していきます。

### 1. Viteプロジェクトの作成

Viteは高速なビルドツールで、Svelteを完全にサポートしています。TypeScriptテンプレートを使用することで、最初から型安全な開発環境が整います。

```bash
# Viteの公式テンプレートを使用してプロジェクトを作成
npm create vite@latest my-svelte-spa -- --template svelte-ts

# プロジェクトディレクトリに移動
cd my-svelte-spa

# 依存関係をインストール
npm install
```

このコマンドで作成されるプロジェクトには、以下が含まれています。
- **Vite設定** - 高速なHMR（Hot Module Replacement）とビルド最適化
- **TypeScript設定** - 厳密な型チェックのための`tsconfig.json`
- **Svelte設定** - Svelte 5の最新機能を活用するための基本設定

### 2. ルーターの追加

SPAでは、クライアントサイドでのルーティングが必須です。`svelte-spa-router`は軽量で使いやすいルーターライブラリで、ハッシュベースとHistory APIベースの両方のルーティングに対応しています。

```bash
# SPAルーターパッケージをインストール
npm install svelte-spa-router
```

#### ルート定義の作成

ルートとコンポーネントのマッピングを定義します。TypeScriptの型推論により、ルート設定のミスを防ぎます。

```typescript
// src/routes.ts
import Home from './routes/Home.svelte';
import About from './routes/About.svelte';
import NotFound from './routes/NotFound.svelte';

// ルートパスとコンポーネントのマッピング
export const routes = {
  '/': Home,           // ホームページ
  '/about': About,     // アバウトページ
  '*': NotFound        // 404ページ（マッチしないすべてのルート）
};
```

#### ルーターの実装

アプリケーションのエントリーポイントでルーターを設定します。

```svelte
<!-- src/App.svelte -->
<script lang="ts">
  import Router from 'svelte-spa-router';
  import { routes } from './routes';
</script>

<!-- ルーターコンポーネントがルートに応じて適切なコンポーネントをレンダリング -->
<Router {routes} />
```

### 3. 状態管理の実装

Svelte 5のRunesシステムを活用したグローバル状態管理の実装です。`.svelte.ts`ファイルを使用することで、コンポーネント外でもリアクティブな状態を管理できます。

```typescript
// src/stores/app.svelte.ts
// Svelte 5のRunesを使用したストアクラス
class AppStore {
  // $stateでリアクティブな状態を定義
  user = $state<User | null>(null);     // 現在のユーザー情報
  loading = $state(false);               // ローディング状態
  
  // ログイン処理
  async login(email: string, password: string) {
    this.loading = true;
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      if (response.ok) {
        // レスポンスからユーザー情報を取得し、状態を更新
        this.user = await response.json();
      }
    } finally {
      this.loading = false;
    }
  }
  
  // ログアウト処理
  logout() {
    this.user = null;
    // 必要に応じてlocalStorageやセッションをクリア
  }
}

// シングルトンインスタンスとしてエクスポート
export const appStore = new AppStore();
```

このストアは以下の特徴を持ちます。
- **リアクティブ** - `$state`によりコンポーネント内で自動的に再レンダリング
- **型安全** - TypeScriptの型定義により安全な状態管理
- **シングルトン** - アプリ全体で同一のインスタンスを共有

## API通信の実装

バックエンドAPIとの通信を効率的に行うために、専用のAPIクライアントクラスを実装します。これにより、認証トークンの管理、エラーハンドリング、リクエスト/レスポンスの型定義を一元化できます。

### 1. API クライアントの作成

再利用可能なAPIクライアントクラスを実装し、認証、エラーハンドリング、型安全性を確保します。

```typescript
// src/lib/api.ts
class ApiClient {
  // 環境変数からAPIのベースURLを取得（デフォルト: localhost:3000）
  private baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  private token: string | null = null;
  
  // 認証トークンを設定し、localStorageに保存
  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }
  
  // 汎用的なリクエストメソッド（ジェネリクスで型安全性を確保）
  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    // デフォルトのヘッダー設定
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers  // カスタムヘッダーをマージ
    };
    
    // 認証トークンがある場合は Authorization ヘッダーを追加
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    // fetchリクエストを実行
    const response = await fetch(url, {
      ...options,
      headers
    });
    
    // エラーレスポンスの場合は例外をスロー
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    // JSONレスポンスを型付きで返す
    return response.json();
  }
  
  // GETリクエスト用のヘルパーメソッド
  get<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'GET' });
  }
  
  // POSTリクエスト用のヘルパーメソッド
  post<T>(endpoint: string, data: any) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
  
  // 必要に応じてPUT、DELETE、PATCHメソッドも追加可能
}

// シングルトンインスタンスとしてエクスポート
export const api = new ApiClient();
```

### 2. 型定義の共有

フロントエンドとバックエンド間で共有する型定義を一元管理します。これにより、APIレスポンスの型安全性が保証され、開発時のミスを防げます。

```typescript
// src/types/api.ts

// ユーザー情報の型定義
export interface User {
  id: string;           // ユニークID
  email: string;        // メールアドレス
  name: string;         // 表示名
  avatar?: string;      // アバター画像URL（オプショナル）
}

// ブログ投稿の型定義
export interface Post {
  id: string;           // 投稿ID
  title: string;        // タイトル
  content: string;      // 本文
  author: User;         // 投稿者（User型でネスト）
  createdAt: Date;      // 作成日時
}

// API レスポンスの汎用型
// ジェネリクスを使用して様々なデータ型に対応
export interface ApiResponse<T> {
  data: T;              // 実際のデータ
  message?: string;     // 成功/エラーメッセージ
  error?: string;       // エラー詳細
}
```

#### 使用例
```typescript
// 型定義を使用したAPI呼び出し
const response = await api.get<ApiResponse<User[]>>('/users');
// response.data は User[] 型として推論される
```

## デプロイオプション

SPAは静的ファイルとしてビルドされるため、様々なホスティングサービスに簡単にデプロイできます。各サービスの特徴とデプロイ方法を説明します。

### 静的ホスティングサービス

主要なホスティングサービスとその特徴、デプロイコマンドを比較します。

| サービス | 特徴 | デプロイコマンド |
|---------|------|-----------------|
| **Vercel** | 自動デプロイ、プレビュー環境 | `vercel` |
| **Netlify** | フォーム、Functions対応 | `netlify deploy` |
| **GitHub Pages** | 無料、GitHubとの統合 | `gh-pages -d dist` |
| **Cloudflare Pages** | 高速CDN、Workers統合 | `wrangler pages deploy` |

### ビルド設定

package.jsonにデプロイ用のスクリプトを追加することで、ワンコマンドでビルドとデプロイを実行できます。

```json
// package.json
{`{
  "scripts": {
    "dev": "vite",                          // 開発サーバー起動
    "build": "vite build",                  // プロダクションビルド
    "preview": "vite preview",              // ビルド結果のプレビュー
    "deploy": "npm run build && netlify deploy --prod"  // ビルド後にNetlifyへデプロイ
  }
}`}
```

#### 各コマンドの役割
- **dev**: 開発時のホットリロード付きサーバー
- **build**: 最適化されたプロダクションビルドを`dist`フォルダに生成
- **preview**: ビルド結果をローカルで確認
- **deploy**: ビルドとデプロイを連続実行

## ベストプラクティス

SPA開発における重要なベストプラクティスを紹介します。これらを実践することで、セキュアでメンテナブルなアプリケーションを構築できます。

### 1. 環境変数の管理

開発環境と本番環境で異なる設定値を管理するため、環境変数を適切に設定します。Viteは`.env`ファイルから環境変数を読み込み、`import.meta.env`でアクセスできます。

```typescript
// src/config/env.ts
// 環境変数を一元管理するコンフィグオブジェクト
export const config = {
  // APIエンドポイント
  apiUrl: import.meta.env.VITE_API_URL,
  
  // Firebase設定（必要に応じて）
  firebaseConfig: {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    // その他の設定...
  },
  
  // 環境判定フラグ（Viteが自動提供）
  isDevelopment: import.meta.env.DEV,   // 開発環境かどうか
  isProduction: import.meta.env.PROD     // 本番環境かどうか
};
```

#### .env ファイルの例
```bash
# .env.local（開発環境）
VITE_API_URL=http://localhost:3000
VITE_FIREBASE_API_KEY=your-dev-api-key

# .env.production（本番環境）
VITE_API_URL=https://api.example.com
VITE_FIREBASE_API_KEY=your-prod-api-key
```

### 2. エラーハンドリング

適切なエラーハンドリングにより、ユーザーに分かりやすいエラーメッセージを表示し、デバッグを容易にします。

```typescript
// src/lib/error-handler.ts

// カスタムエラークラス（APIエラー用）
export class ApiError extends Error {
  constructor(
    public status: number,        // HTTPステータスコード
    message: string,              // エラーメッセージ
    public data?: any            // 追加のエラーデータ
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// 汎用エラーハンドリング関数
export function handleError(error: unknown): string {
  // ApiErrorの場合
  if (error instanceof ApiError) {
    // ステータスコードに応じた処理も可能
    if (error.status === 401) {
      // 認証エラーの場合はログイン画面へリダイレクト等
      return '認証が必要です';
    }
    return error.message;
  }
  
  // 通常のErrorの場合
  if (error instanceof Error) {
    return error.message;
  }
  
  // 予期しないエラーの場合
  console.error('Unknown error:', error);
  return '予期しないエラーが発生しました';
}
```

### 3. SEO対策

SPAはクライアントサイドレンダリングのため、SEO対策が重要です。動的にメタタグを更新する関数を実装します。

```typescript
// src/lib/seo.ts

// メタタグを動的に更新する関数
export function updateMetaTags(data: {
  title?: string;        // ページタイトル
  description?: string;   // ページ説明
  image?: string;        // OGP画像
}) {
  // タイトルの更新
  if (data.title) {
    document.title = data.title;
  }
  
  // メタタグを設定/更新するヘルパー関数
  const setMeta = (name: string, content: string) => {
    let element = document.querySelector(`meta[name="${name}"]`);
    
    // メタタグが存在しない場合は新規作成
    if (!element) {
      element = document.createElement('meta');
      element.setAttribute('name', name);
      document.head.appendChild(element);
    }
    
    // コンテンツを更新
    element.setAttribute('content', content);
  };
  
  // descriptionメタタグの更新
  if (data.description) {
    setMeta('description', data.description);
    // OGP用のメタタグも同時に更新
    setMeta('og:description', data.description);
  }
  
  // OGP画像の更新
  if (data.image) {
    setMeta('og:image', data.image);
    setMeta('twitter:image', data.image);
  }
}

// 使用例：ルート変更時にメタタグを更新
// updateMetaTags({
//   title: '商品詳細 | My Shop',
//   description: 'この商品の詳細説明...',
//   image: 'https://example.com/product.jpg'
// });
```

:::tip[パフォーマンス最適化]
- コード分割でバンドルサイズを削減
- 遅延読み込みで初期表示を高速化
- Service Workerでオフライン対応
- 画像の最適化とLazy Loading
:::

## まとめ

SPA + API構成は以下のようなケースに最適です。

- ✅ **既存のAPIがある** - REST API、GraphQLサーバーなど
- ✅ **BaaSを活用したい** - Firebase、Supabase、AWS Amplify
- ✅ **マイクロサービス** - フロントエンドとバックエンドを分離
- ✅ **クロスプラットフォーム** - Web、モバイル、デスクトップで共通API

次のステップとして、具体的な統合パターンを学んでみてください。
- [Firebase統合](/svelte/architecture/spa-patterns/firebase/)
- [Supabase統合](/svelte/architecture/spa-patterns/supabase/)
- [GraphQL統合](/svelte/architecture/spa-patterns/graphql/)