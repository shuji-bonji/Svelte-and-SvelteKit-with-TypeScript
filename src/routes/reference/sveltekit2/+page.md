---
title: SvelteKit 2.x 完全リファレンス
description: SvelteKit 2.xの包括的リファレンス - ファイルベースルーティング、データローディング、フォーム処理、APIルート、Hooks、デプロイメントまですべてを網羅
---

<script>
  import { base } from '$app/paths';
</script>

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

| ファイル名 | 用途 | 実行環境 |
|----------|------|---------|
| `+page.svelte` | ページコンポーネント | Universal |
| `+page.ts` | Universal Load関数 | Universal |
| `+page.server.ts` | Server Load関数とActions | Server |
| `+layout.svelte` | レイアウトコンポーネント | Universal |
| `+layout.ts` | レイアウトUniversal Load | Universal |
| `+layout.server.ts` | レイアウトServer Load | Server |
| `+server.ts` | APIエンドポイント | Server |
| `+error.svelte` | エラーページ | Universal |

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
    throw error(404, 'Post not found');
  }
  
  const post = await res.json();
  
  return {
    post,
    slug: params.slug
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
  setHeaders 
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
    'cache-control': 'max-age=3600'
  });
  
  // 依存関係の宣言
  depends('app:items');
  
  return {
    items,
    page: parseInt(page),
    user: parentData.user
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
  platform 
}) => {
  // 認証チェック
  if (!locals.user) {
    throw redirect(303, '/login');
  }
  
  // データベースアクセス
  const data = await db.getData(params.id);
  
  if (!data) {
    throw error(404, 'Not found');
  }
  
  // 機密データを含む
  return {
    data,
    secretKey: process.env.SECRET_KEY
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
      slow: fetchSlowData(),         // Promise
      verySlow: fetchVerySlowData()  // Promise
    }
  };
};
```

```svelte
<!-- +page.svelte -->
<script lang="ts">
  import type { PageData } from './$types';
  let { data }: { data: PageData } = $props();
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
  password: z.string().min(8)
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
        errors: result.error.flatten().fieldErrors
      });
    }
    
    // 処理実行
    const user = await authenticateUser(result.data);
    
    if (!user) {
      return fail(401, {
        data: result.data,
        message: 'Invalid credentials'
      });
    }
    
    // セッション設定
    cookies.set('session', user.sessionId, {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7
    });
    
    return { success: true };
  }
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
        error: 'タイトルは必須です' 
      });
    }
    
    const todo = await db.todo.create({
      data: {
        title,
        userId: locals.user.id
      }
    });
    
    return { success: true, todo };
  },
  
  update: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get('id');
    const completed = formData.get('completed') === 'true';
    
    await db.todo.update({
      where: { id: String(id) },
      data: { completed }
    });
    
    return { success: true };
  },
  
  delete: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get('id');
    
    await db.todo.delete({
      where: { id: String(id) }
    });
    
    return { success: true };
  }
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
      filename
    };
  }
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
    throw error(401, 'Unauthorized');
  }
  
  // クエリパラメータ
  const page = parseInt(url.searchParams.get('page') ?? '1');
  const limit = parseInt(url.searchParams.get('limit') ?? '10');
  
  const posts = await db.posts.findMany({
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: 'desc' }
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
      authorId: locals.user.id
    }
  });
  
  return json(post, { status: 201 });
};

export const DELETE: RequestHandler = async ({ params }) => {
  await db.posts.delete({
    where: { id: params.id }
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
    }
  });
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache'
    }
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
    "default-src 'self'; script-src 'self' 'unsafe-inline';"
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
      code: 'INTERNAL_ERROR'
    };
  }
  
  return {
    message: error.message,
    stack: error.stack
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
    code: 'CLIENT_ERROR'
  };
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
    throw redirect(303, '/dashboard');
  }
};

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    const formData = await request.formData();
    const email = formData.get('email');
    const password = formData.get('password');
    
    const user = await db.user.findUnique({
      where: { email: String(email) }
    });
    
    if (!user || !await bcrypt.compare(String(password), user.hashedPassword)) {
      return fail(400, {
        email,
        error: 'メールアドレスまたはパスワードが正しくありません'
      });
    }
    
    const session = await createSession(user.id);
    
    cookies.set('session', session.token, {
      path: '/',
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30 // 30日
    });
    
    throw redirect(303, '/dashboard');
  }
};
```

### 保護されたルート

```typescript
// src/routes/admin/+layout.server.ts
import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: LayoutServerLoad = async ({ locals }) => {
  if (!locals.user) {
    throw redirect(303, '/login');
  }
  
  if (!locals.user.isAdmin) {
    throw redirect(303, '/unauthorized');
  }
  
  return {
    user: locals.user
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
  PageServerLoad,
  PageServerData,
  LayoutLoad,
  LayoutData,
  LayoutServerLoad,
  LayoutServerData,
  Actions,
  ActionData,
  RequestHandler
} from './$types';
```

## 環境変数

### 静的環境変数

```typescript
// サーバーのみ
import { 
  DATABASE_URL,
  API_SECRET 
} from '$env/static/private';

// パブリック
import { 
  PUBLIC_API_URL,
  PUBLIC_SITE_NAME 
} from '$env/static/public';
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
      entries: ['*']
    },
    
    // CSP
    csp: {
      directives: {
        'script-src': ['self'],
        'style-src': ['self', 'unsafe-inline']
      }
    },
    
    // パス設定
    paths: {
      base: process.env.BASE_PATH || ''
    }
  }
};
```

### レンダリングモード制御

```typescript
// +page.ts or +page.server.ts
export const prerender = true;  // プリレンダリング
export const ssr = true;        // SSR有効
export const csr = true;        // CSR有効

// 動的プリレンダリング
export const entries = () => {
  return [
    { slug: 'post-1' },
    { slug: 'post-2' }
  ];
};

// トレイリングスラッシュ
export const trailingSlash = 'always'; // 'never' | 'always' | 'ignore'
```

## パフォーマンス最適化

### プリフェッチ戦略

```svelte
<!-- hover時にプリフェッチ（デフォルト） -->
<a href="/about">About</a>

<!-- 即座にプリフェッチ -->
<a href="/products" data-sveltekit-preload-data="eager">
  Products
</a>

<!-- タップ時にプリフェッチ -->
<a href="/heavy" data-sveltekit-preload-data="tap">
  Heavy Page
</a>

<!-- プリフェッチ無効 -->
<a href="/external" data-sveltekit-preload-data="off">
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
    'etag': generateEtag(data)
  });
  
  return json(data);
};
```

## 高度な機能

### Service Worker

```typescript
// src/service-worker.ts
/// <reference types="@sveltejs/kit" />
import { build, files, version } from '$service-worker';

const CACHE = `cache-${version}`;
const ASSETS = [...build, ...files];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(async keys => {
      for (const key of keys) {
        if (key !== CACHE) await caches.delete(key);
      }
    })
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
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
      }
    }
  ]
});
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
export const load: PageServerLoad = async ({ params }) => {
  try {
    const data = await fetchData(params.id);
    return { data };
  } catch (err) {
    throw error(500, {
      message: 'Failed to load data',
      code: 'LOAD_ERROR'
    });
  }
};
```

### 4. エラーバウンダリー

```svelte
<!-- src/routes/+error.svelte -->
<script lang="ts">
  import { page } from '$app/stores';
  import type { PageData } from './$types';
  
  let { error, status }: { error: App.Error; status: number } = $props();
</script>

<div class="error-page">
  <h1>{status}</h1>
  <p>{error.message}</p>
  
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