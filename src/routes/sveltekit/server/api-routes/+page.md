---
title: APIルート設計
description: SvelteKitでRESTful APIを構築する方法と設計パターン
---

<script>
  import { base } from '$app/paths';
  import Mermaid from '$lib/components/Mermaid.svelte';

  const apiRequestFlow = `sequenceDiagram
    participant Client as クライアント
    participant Router as SvelteKitルーター
    participant Server as +server.ts
    participant Service as サービス層
    participant DB as データベース

    Client->>Router: GET /api/posts
    Router->>Server: RequestHandler実行
    Server->>Service: findAll()
    Service->>DB: SELECT * FROM posts
    DB-->>Service: データ返却
    Service-->>Server: Post[]
    Server-->>Router: json(posts)
    Router-->>Client: 200 OK + JSON`;

  const layeredArchitecture = `graph TD
    A[+server.ts<br/>コントローラー層] --> B[$lib/server/services/<br/>サービス層]
    B --> C[$lib/server/repositories/<br/>リポジトリ層]
    C --> D[データベース]

    A --> E[リクエスト処理<br/>レスポンス生成]
    B --> F[ビジネスロジック<br/>バリデーション]
    C --> G[データアクセス<br/>クエリ構築]

    style A fill:#f9f,stroke:#333,stroke-width:2px,color:#333
    style B fill:#9ff,stroke:#333,stroke-width:2px,color:#333
    style C fill:#ff9,stroke:#333,stroke-width:2px,color:#333
    style D fill:#9f9,stroke:#333,stroke-width:2px,color:#333`;

  const authFlow = `sequenceDiagram
    participant Client as クライアント
    participant API as APIエンドポイント
    participant Auth as requireAuth()
    participant JWT as JWTライブラリ
    participant DB as データベース

    Client->>API: GET /api/posts<br/>Authorization: Bearer token
    API->>Auth: requireAuth(event)
    Auth->>JWT: verify(token)

    alt トークン有効
        JWT-->>Auth: デコード済みペイロード
        Auth->>DB: ユーザー取得
        DB-->>Auth: User情報
        Auth-->>API: User返却
        API->>DB: データ取得
        DB-->>API: データ返却
        API-->>Client: 200 OK + データ
    else トークン無効
        JWT-->>Auth: エラー
        Auth-->>Client: 401 Unauthorized
    end`;

  const corsFlow = `sequenceDiagram
    participant Browser as ブラウザ
    participant API as APIエンドポイント
    participant CORS as handleCors()

    Note over Browser,API: プリフライトリクエスト（OPTIONS）
    Browser->>API: OPTIONS /api/posts<br/>Origin: https://example.com
    API->>CORS: handleCors(event)
    CORS->>CORS: オリジン検証

    alt 許可されたオリジン
        CORS-->>API: CORSヘッダー設定
        API-->>Browser: 200 OK<br/>Access-Control-Allow-Origin: *

        Note over Browser,API: 実際のリクエスト
        Browser->>API: POST /api/posts<br/>データ送信
        API->>CORS: handleCors(event)
        CORS-->>API: CORSヘッダー設定
        API-->>Browser: 200 OK + データ
    else 拒否されたオリジン
        CORS-->>API: CORSヘッダーなし
        API-->>Browser: 403 Forbidden
    end`;

  const rateLimitFlow = `sequenceDiagram
    participant Client as クライアント
    participant API as APIエンドポイント
    participant RateLimit as rateLimit()
    participant Store as 試行回数ストア

    Client->>API: POST /api/data
    API->>RateLimit: limiter(event)
    RateLimit->>RateLimit: IP取得: getClientAddress()
    RateLimit->>Store: 記録確認(ip)

    alt 初回またはウィンドウ期限切れ
        Store-->>RateLimit: なし/期限切れ
        RateLimit->>Store: 新規記録作成<br/>{count: 1, resetAt: now + windowMs}
        RateLimit-->>API: 処理続行
        API-->>Client: 200 OK
    else 制限内
        Store-->>RateLimit: {count: 5, resetAt: ...}
        RateLimit->>Store: count++
        RateLimit-->>API: 処理続行
        API-->>Client: 200 OK
    else 制限超過
        Store-->>RateLimit: {count: 10, resetAt: ...}
        RateLimit-->>API: throw error(429)
        API-->>Client: 429 Too Many Requests
    end`;
</script>

SvelteKitの`+server.ts`ファイルを使用して、RESTful APIエンドポイントを構築する方法を学びます。型安全性を保ちながら、効率的なAPIを設計します。

## APIルートの基本

SvelteKitでは、`+server.ts`ファイルでAPIエンドポイントを定義します。このファイルは、フロントエンドとバックエンドを統合する強力な仕組みを提供し、同じプロジェクト内でフルスタックアプリケーションを構築できます。

### リクエストフロー

APIリクエストがどのように処理されるかを理解することは重要です。以下の図は、クライアントからのリクエストが各レイヤーを通過してデータベースに到達し、レスポンスが返されるまでの流れを示しています。

<Mermaid chart={apiRequestFlow} />

### ファイル構造とURL

SvelteKitのファイルベースルーティングは、APIエンドポイントにも適用されます。ファイルシステムの構造がそのままURLパスに対応するため、直感的で管理しやすいAPI設計が可能です。

```
src/routes/
├── api/
│   ├── posts/
│   │   └── +server.ts      → /api/posts
│   └── posts/[id]/
│       └── +server.ts      → /api/posts/:id
```

### 基本的な実装

最もシンプルなAPIエンドポイントの実装例です。GETメソッドでデータ一覧を取得し、POSTメソッドで新規データを作成します。`json()`ヘルパー関数を使用することで、TypeScriptの型情報を保持したままJSONレスポンスを返すことができます。

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

SvelteKitは従来のMVC（Model-View-Controller）とは異なるアプローチを採用しています。フレームワークが特定のアーキテクチャを強制するのではなく、開発者が柔軟に設計できる自由度を提供します。

### MVCパターンとの対応

| 従来のMVC | SvelteKitの対応 | 役割 |
|-----------|----------------|------|
| **Controller** | `+server.ts`の各関数 | HTTPリクエストの処理 |
| **Service** | `$lib/server/`のモジュール | ビジネスロジック |
| **Model** | `$lib/server/db/`など | データアクセス層 |
| **View** | `+page.svelte` | UIコンポーネント |

### 責務の分離

大規模なアプリケーションでは、責務を適切に分離することが重要です。コントローラー層（`+server.ts`）はHTTPリクエストの処理に専念し、ビジネスロジックはサービス層に、データアクセスはリポジトリ層に分離します。これにより、テストしやすく、保守性の高いコードベースを構築できます。

以下の図は、レイヤードアーキテクチャの構造を示しています。各レイヤーは明確な責務を持ち、上位レイヤーから下位レイヤーへの一方向の依存関係を保ちます。

<Mermaid chart={layeredArchitecture} />

以下の例では、サービス層でビジネスロジックを実装し、コントローラー層からそれを呼び出す典型的なパターンを示します。

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

このように、SvelteKitでも責務の分離は可能ですが、フレームワークが強制するのではなく、開発者が必要に応じて構造化します。Spring BootやASP.NET Coreのような明確なレイヤー分けが可能で、エンタープライズレベルのアプリケーションにも対応できます。

## HTTPメソッドの実装

RESTful APIの原則に従い、各HTTPメソッドに対応する関数を実装します。GET（取得）、POST（作成）、PUT/PATCH（更新）、DELETE（削除）の各メソッドをエクスポートすることで、同一リソースに対する異なる操作を処理できます。

以下は、単一のリソースに対する完全なCRUD操作の実装例です。

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

SvelteKitのAPIルートでは、標準のWeb API（Request、Response）を使用してリクエストとレスポンスを処理します。これにより、他のプラットフォーム（Cloudflare Workers、Deno、Nodeなど）への移植性が高まります。

### リクエストの処理

リクエストオブジェクトから、さまざまな方法でデータを取得できます。JSONボディ、フォームデータ、URLパラメータ、Cookie、ヘッダーなど、必要な情報にアクセスする方法を理解することが重要です。

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

レスポンスを作成する際は、適切なステータスコード、ヘッダー、コンテンツタイプを設定することが重要です。SvelteKitの`json()`ヘルパーを使用すると、自動的に適切なヘッダーが設定されます。

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

適切なエラーハンドリングは、堅牢なAPIを構築する上で不可欠です。SvelteKitの`error()`関数を使用することで、一貫したエラーレスポンスを提供し、クライアントが適切にエラーを処理できるようにします。

バリデーションエラー（400）、認証エラー（401）、リソース不在エラー（404）、サーバーエラー（500）など、状況に応じた適切なHTTPステータスコードを返すことが重要です。

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

APIルートでは、認証（ユーザーの身元確認）と認可（アクセス権限の確認）を実装することが重要です。一般的にはBearerトークン（JWT）を使用した認証が用いられ、リクエストヘッダーからトークンを取得して検証します。

:::info[関連情報]
APIエンドポイントの認証は、アプリケーション全体の認証戦略の一部です。以下のページも参照してください。
- **[Hooks]({base}/sveltekit/server/hooks/)** - handleフックでのグローバル認証実装
- **[セッション管理と認証戦略]({base}/sveltekit/application/session/)** - Cookie/Session、JWT認証の詳細
- **[認証ベストプラクティス]({base}/sveltekit/application/auth-best-practices/)** - セキュリティ対策とベストプラクティス
:::

以下のシーケンス図は、JWT認証の流れを示しています。トークンが有効な場合はデータを返し、無効な場合は401エラーを返します。

<Mermaid chart={authFlow} />

以下の例では、**APIエンドポイント特有の認証パターン**として、再利用可能な認証ヘルパー関数を作成し、保護されたエンドポイントで使用する方法を示します。

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

CORS（Cross-Origin Resource Sharing）設定は、異なるドメインからのAPIアクセスを許可するために必要です。特に、フロントエンドとバックエンドを別々のドメインでホストする場合や、外部のクライアントからAPIを利用する場合に重要です。

:::info[関連情報]
CORS設定は通常、Hooksで一元管理します。以下のページも参照してください。
- **[Hooks]({base}/sveltekit/server/hooks/)** - handleフックでのグローバルCORS設定
:::

以下では、**個別のAPIエンドポイントでのCORS設定**を解説します。アプリケーション全体のCORS設定はHooksで行い、特定のエンドポイントのみ異なる設定が必要な場合にこのパターンを使用します。

### CORSリクエストの流れ

ブラウザは、クロスオリジンリクエストの際に、まず「プリフライトリクエスト」（OPTIONSメソッド）を送信してサーバーの許可を確認します。以下の図は、このフローを示しています。

<Mermaid chart={corsFlow} />

### 実装例

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

レート制限は、APIの過負荷を防ぎ、悪意のある攻撃（DDoS攻撃など）からシステムを保護するための重要なセキュリティ対策です。IPアドレスごとに一定時間内のリクエスト回数を制限することで、公平なリソース利用を実現します。

:::info[関連情報]
レート制限はアプリケーション全体に適用することも可能です。
- **[Hooks]({base}/sveltekit/server/hooks/)** - handleフックでのグローバルレート制限実装
:::

以下では、**特定のAPIエンドポイントのみにレート制限を適用する**パターンを示します。シンプルなメモリベースの実装ですが、本番環境ではRedisなどの永続ストレージを使用することを推奨します。

### レート制限の動作フロー

以下の図は、リクエストがレート制限チェックを通過する流れを示しています。IPアドレスごとにリクエスト回数を追跡し、制限を超えた場合は429エラーを返します。

<Mermaid chart={rateLimitFlow} />

### 実装例

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

APIの品質と保守性を高めるためのベストプラクティスを紹介します。型安全性、バリデーション、ログ記録の3つの重要な要素に焦点を当てます。

### 1. 型安全性の確保

TypeScriptの型システムを活用することで、コンパイル時にエラーを検出し、ランタイムエラーを削減できます。入力と出力の型を明確に定義することで、APIの使用方法が自己文書化され、開発効率が向上します。

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

ユーザー入力のバリデーションは、セキュリティとデータ整合性の両面で重要です。Zodなどのスキーマバリデーションライブラリを使用することで、宣言的で保守しやすいバリデーションロジックを実装できます。

バリデーションエラーは適切なエラーメッセージとともにクライアントに返すことで、ユーザーエクスペリエンスを向上させます。

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

適切なログ記録は、APIのパフォーマンス監視、デバッグ、セキュリティ監査に不可欠です。リクエスト情報、レスポンスステータス、処理時間などを記録することで、問題の早期発見と原因究明が可能になります。

本番環境では、構造化ログ（JSON形式）を使用し、ログ集約サービス（Datadog、CloudWatchなど）に送信することを推奨します。

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

SvelteKitのAPIルートは、フルスタックアプリケーション開発を強力にサポートします。

- **シンプルで直感的**: ファイルベースのルーティングで、URLとファイル構造が一致
- **型安全**: TypeScriptとの完全な統合により、コンパイル時エラー検出
- **柔軟な設計**: MVCパターンなど、エンタープライズレベルのアーキテクチャも実装可能
- **フルスタック**: フロントエンドとバックエンドを同じプロジェクトで管理
- **標準準拠**: Web標準のRequest/Response APIを使用し、高い移植性

適切な認証、バリデーション、エラーハンドリング、ログ記録を実装することで、プロダクションレベルのAPIを構築できます。SvelteKitの柔軟性を活かし、プロジェクトの規模や要件に応じた最適なアーキテクチャを選択しましょう。

## 次のステップ

- [WebSocket・SSE通信](/sveltekit/server/websocket-sse/)で、リアルタイム通信の実装を学びましょう
- [アプリケーション構築編](/sveltekit/application/)で、実践的な開発パターンを習得しましょう