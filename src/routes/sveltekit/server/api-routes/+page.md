---
title: APIルート設計
description: SvelteKitでRESTful APIを構築する方法と設計パターン
---

<script>
  import { base } from '$app/paths';
</script>

SvelteKitの`+server.ts`ファイルを使用して、RESTful APIエンドポイントを構築する方法を学びます。型安全性を保ちながら、効率的なAPIを設計します。

## APIルートの基本

SvelteKitでは、`+server.ts`ファイルでAPIエンドポイントを定義します。

### ファイル構造とURL

```
src/routes/
├── api/
│   ├── posts/
│   │   └── +server.ts      → /api/posts
│   └── posts/[id]/
│       └── +server.ts      → /api/posts/:id
```

### 基本的な実装

```typescript
// src/routes/api/posts/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
  const posts = await fetchPosts();
  return json(posts);
};

export const POST: RequestHandler = async ({ request }) => {
  const data = await request.json();
  const post = await createPost(data);
  return json(post, { status: 201 });
};
```

## SvelteKitのアーキテクチャ

SvelteKitは従来のMVC（Model-View-Controller）とは異なるアプローチを採用しています。

### MVCパターンとの対応

| 従来のMVC | SvelteKitの対応 | 役割 |
|-----------|----------------|------|
| **Controller** | `+server.ts`の各関数 | HTTPリクエストの処理 |
| **Service** | `$lib/server/`のモジュール | ビジネスロジック |
| **Model** | `$lib/server/db/`など | データアクセス層 |
| **View** | `+page.svelte` | UIコンポーネント |

### 責務の分離

大規模なアプリケーションでは、責務を適切に分離することが重要です。

```typescript
// $lib/server/services/post.service.ts（サービス層）
import { db } from '$lib/server/db';
import type { Post, CreatePostDTO } from '$lib/types';

export class PostService {
  async findAll(): Promise<Post[]> {
    return await db.posts.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }
  
  async findById(id: string): Promise<Post | null> {
    return await db.posts.findUnique({
      where: { id }
    });
  }
  
  async create(data: CreatePostDTO): Promise<Post> {
    return await db.posts.create({ data });
  }
  
  async update(id: string, data: Partial<CreatePostDTO>): Promise<Post> {
    return await db.posts.update({
      where: { id },
      data
    });
  }
  
  async delete(id: string): Promise<void> {
    await db.posts.delete({
      where: { id }
    });
  }
}
```

```typescript
// src/routes/api/posts/+server.ts（コントローラー層）
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { PostService } from '$lib/server/services/post.service';

const postService = new PostService();

export const GET: RequestHandler = async () => {
  try {
    const posts = await postService.findAll();
    return json(posts);
  } catch (e) {
    throw error(500, 'データベースエラー');
  }
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    const data = await request.json();
    const post = await postService.create(data);
    return json(post, { status: 201 });
  } catch (e) {
    throw error(400, '不正なリクエスト');
  }
};
```

このように、SvelteKitでも責務の分離は可能ですが、フレームワークが強制するのではなく、開発者が必要に応じて構造化します。

## HTTPメソッドの実装

各HTTPメソッドに対応する関数を実装できます。

```typescript
// src/routes/api/posts/[id]/+server.ts
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// GET /api/posts/:id
export const GET: RequestHandler = async ({ params }) => {
  const post = await db.posts.findUnique({
    where: { id: params.id }
  });
  
  if (!post) {
    throw error(404, 'Post not found');
  }
  
  return json(post);
};

// PUT /api/posts/:id
export const PUT: RequestHandler = async ({ params, request }) => {
  const data = await request.json();
  const post = await db.posts.update({
    where: { id: params.id },
    data
  });
  return json(post);
};

// PATCH /api/posts/:id
export const PATCH: RequestHandler = async ({ params, request }) => {
  const data = await request.json();
  const post = await db.posts.update({
    where: { id: params.id },
    data
  });
  return json(post);
};

// DELETE /api/posts/:id
export const DELETE: RequestHandler = async ({ params }) => {
  await db.posts.delete({
    where: { id: params.id }
  });
  return new Response(null, { status: 204 });
};
```

## リクエストとレスポンス

### リクエストの処理

```typescript
export const POST: RequestHandler = async ({ request, url, params, cookies }) => {
  // JSONボディの取得
  const body = await request.json();
  
  // フォームデータの取得
  const formData = await request.formData();
  
  // URLパラメータ
  const searchParams = url.searchParams;
  const page = searchParams.get('page') || '1';
  
  // ルートパラメータ
  const { id } = params;
  
  // Cookie
  const sessionId = cookies.get('sessionId');
  
  // ヘッダー
  const contentType = request.headers.get('content-type');
  
  return json({ success: true });
};
```

### レスポンスの作成

```typescript
// JSONレスポンス
return json({ data: 'value' });

// ステータスコード付き
return json({ created: true }, { status: 201 });

// カスタムヘッダー
return json(data, {
  headers: {
    'Cache-Control': 'max-age=3600'
  }
});

// テキストレスポンス
return new Response('Plain text', {
  headers: {
    'Content-Type': 'text/plain'
  }
});

// リダイレクト
return new Response(null, {
  status: 302,
  headers: {
    Location: '/login'
  }
});
```

## エラーハンドリング

適切なエラーハンドリングで堅牢なAPIを構築

```typescript
import { error } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params }) => {
  // バリデーション
  if (!params.id) {
    throw error(400, 'ID is required');
  }
  
  try {
    const post = await db.posts.findUnique({
      where: { id: params.id }
    });
    
    if (!post) {
      throw error(404, {
        message: 'Post not found',
        code: 'POST_NOT_FOUND'
      });
    }
    
    return json(post);
  } catch (e) {
    // データベースエラー
    console.error('Database error:', e);
    throw error(500, 'Internal server error');
  }
};
```

## 認証と認可

APIルートで認証を実装

```typescript
// $lib/server/auth.ts
import { error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

export async function requireAuth(event: RequestEvent) {
  const token = event.request.headers.get('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    throw error(401, 'Unauthorized');
  }
  
  const user = await verifyToken(token);
  if (!user) {
    throw error(401, 'Invalid token');
  }
  
  return user;
}

// 使用例
export const GET: RequestHandler = async (event) => {
  const user = await requireAuth(event);
  
  // 認証済みユーザーのみアクセス可能
  const posts = await db.posts.findMany({
    where: { userId: user.id }
  });
  
  return json(posts);
};
```

## CORS設定

Cross-Origin Resource Sharingの設定

```typescript
// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  // APIルートのみCORSを適用
  if (event.url.pathname.startsWith('/api')) {
    // プリフライトリクエストの処理
    if (event.request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      });
    }
  }
  
  const response = await resolve(event);
  
  // APIレスポンスにCORSヘッダーを追加
  if (event.url.pathname.startsWith('/api')) {
    response.headers.append('Access-Control-Allow-Origin', '*');
  }
  
  return response;
};
```

## レート制限

APIの過負荷を防ぐレート制限の実装

```typescript
// $lib/server/rateLimit.ts
const attempts = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(maxAttempts = 10, windowMs = 60000) {
  return async (event: RequestEvent) => {
    const ip = event.getClientAddress();
    const now = Date.now();
    
    const record = attempts.get(ip);
    
    if (!record || record.resetAt < now) {
      attempts.set(ip, { count: 1, resetAt: now + windowMs });
      return;
    }
    
    if (record.count >= maxAttempts) {
      throw error(429, 'Too many requests');
    }
    
    record.count++;
  };
}

// 使用例
const limiter = rateLimit(10, 60000); // 1分間に10リクエストまで

export const POST: RequestHandler = async (event) => {
  await limiter(event);
  // APIの処理
};
```

## ベストプラクティス

### 1. 型安全性の確保

```typescript
// $lib/types/api.ts
export interface CreatePostDTO {
  title: string;
  content: string;
  tags?: string[];
}

export interface PostResponse {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// 使用
export const POST: RequestHandler = async ({ request }) => {
  const data: CreatePostDTO = await request.json();
  // 型チェックされたデータ処理
};
```

### 2. バリデーション

```typescript
// Zodを使用した例
import { z } from 'zod';

const createPostSchema = z.object({
  title: z.string().min(1).max(100),
  content: z.string().min(10),
  tags: z.array(z.string()).optional()
});

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();
  
  try {
    const data = createPostSchema.parse(body);
    // バリデーション済みのデータを使用
  } catch (e) {
    if (e instanceof z.ZodError) {
      throw error(400, e.errors);
    }
    throw error(500, 'Internal error');
  }
};
```

### 3. ログとモニタリング

```typescript
// $lib/server/logger.ts
export function logAPIRequest(event: RequestEvent, status: number, duration: number) {
  console.log({
    method: event.request.method,
    path: event.url.pathname,
    status,
    duration,
    timestamp: new Date().toISOString()
  });
}

// 使用
export const GET: RequestHandler = async (event) => {
  const start = Date.now();
  
  try {
    const data = await fetchData();
    const response = json(data);
    logAPIRequest(event, 200, Date.now() - start);
    return response;
  } catch (e) {
    logAPIRequest(event, 500, Date.now() - start);
    throw error(500, 'Internal error');
  }
};
```

## まとめ

SvelteKitのAPIルートは、

- **シンプルで直感的**: ファイルベースのルーティング
- **型安全**: TypeScriptとの完全な統合
- **柔軟な設計**: MVCパターンの適用も可能
- **フルスタック**: フロントエンドとバックエンドの統合

## 次のステップ

[Hooks](/sveltekit/server/hooks/)で、リクエスト/レスポンスのインターセプトとカスタマイズを学びましょう。