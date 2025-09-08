---
title: セッション管理と認証戦略
description: SvelteKitでのセッション管理戦略を完全解説。クッキーベース、JWT、ステートレス認証の実装方法とベストプラクティスをTypeScriptで学ぶ
---

<script>
  import Mermaid from '$lib/components/Mermaid.svelte';
  
  const cookieSessionFlow = `sequenceDiagram
    participant B as ブラウザ
    participant H as hooks.server.ts
    participant L as +server.ts(Login)
    participant S as Session Store
    participant P as +page.server.ts
    
    Note over B,P: ログイン処理
    B->>L: POST /api/auth/login<br/>(email, password)
    L->>S: セッション作成
    S-->>L: sessionId
    L-->>B: Set-Cookie: session_id=xxx<br/>+ ユーザー情報
    
    Note over B,P: 認証が必要なページへのアクセス
    B->>H: GET /dashboard<br/>Cookie: session_id=xxx
    H->>S: セッション取得(sessionId)
    S-->>H: セッション情報
    H->>H: event.locals.user = user
    H->>P: リクエスト処理
    P->>P: locals.userをチェック
    P-->>B: ページコンテンツ`;
    
  const jwtAuthFlow = `sequenceDiagram
    participant B as ブラウザ
    participant H as hooks.server.ts
    participant L as +server.ts(Login)
    participant R as +server.ts(Refresh)
    participant A as +server.ts(API)
    
    Note over B,A: ログイン処理
    B->>L: POST /api/auth/login<br/>(email, password)
    L->>L: JWT生成<br/>(access + refresh)
    L-->>B: Set-Cookie: access_token=xxx<br/>Set-Cookie: refresh_token=yyy
    
    Note over B,A: API呼び出し
    B->>H: GET /api/posts<br/>Cookie: access_token=xxx
    H->>H: JWT検証
    H->>H: event.locals.user = payload
    H->>A: リクエスト処理
    A->>A: locals.userをチェック
    A-->>B: JSONレスポンス
    
    Note over B,A: トークンリフレッシュ
    B->>H: Cookie: access_token=expired
    H->>H: JWT検証失敗
    B->>R: POST /api/auth/refresh<br/>Cookie: refresh_token=yyy
    R->>R: リフレッシュトークン検証
    R->>R: 新しいアクセストークン生成
    R-->>B: Set-Cookie: access_token=new`;
</script>

現代のWebアプリケーションでは、ユーザーの認証状態を管理する方法が多様化しています。このページでは、SvelteKitで利用可能なセッション管理の手法を体系的に解説し、プロジェクトに最適な戦略を選択できるようにします。

## セッション管理の基礎概念

### ステートフル vs ステートレス

セッション管理には大きく分けて2つのアプローチがあります。

| アプローチ | 特徴 | 適用場面 |
|----------|------|---------|
| **ステートフル** | サーバー側でセッション情報を保持 | 従来型Webアプリ、高セキュリティ要件 |
| **ステートレス** | クライアント側にすべての情報を保持 | マイクロサービス、スケーラブルなAPI |

### SvelteKitでの選択肢

1. **クッキーベースセッション** - 従来型、SSR向き
2. **JWT認証** - モダン、API向き
3. **ハイブリッド** - 両方の利点を活用

## 従来のクッキーベースセッション

最も一般的で安全なセッション管理方法です。サーバー側でセッション情報を保持し、クライアントにはセッションIDのみを送信します。

### 処理フロー図

<Mermaid diagram={cookieSessionFlow} />

このシーケンス図は、クッキーベースのセッション管理における主要なコンポーネント間の通信を示しています。
- **hooks.server.ts**: すべてのリクエストを受け取り、セッションを検証
- **Session Store**: セッション情報を保持（Redis、DBなど）
- **+server.ts**: ログインAPIエンドポイント
- **+page.server.ts**: 認証が必要なページのLoad関数

### 基本実装

すべてのリクエストで実行される`hooks.server.ts`でセッション管理を実装します。クッキーからセッションIDを取得し、セッションストアから対応するユーザー情報を復元して`event.locals`に設定することで、後続の処理で利用可能にします。

```typescript
// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit';
import { createSessionStore } from '$lib/server/session';

const sessions = createSessionStore();

export const handle: Handle = async ({ event, resolve }) => {
  // セッションIDをクッキーから取得
  const sessionId = event.cookies.get('session_id');
  
  if (sessionId) {
    // セッションストアから情報を取得
    const session = await sessions.get(sessionId);
    if (session && session.expiresAt > Date.now()) {
      event.locals.user = session.user;
      event.locals.session = session;
    } else {
      // 期限切れセッションを削除
      event.cookies.delete('session_id', { path: '/' });
    }
  }
  
  return resolve(event);
};
```

### セッションストアの実装

セッション情報をサーバー側で管理するストアを実装します。開発環境ではメモリ（Map）を使用しますが、本番環境ではRedisやデータベースなどの永続化ストレージを使用します。

```typescript
// src/lib/server/session.ts
interface Session {
  id: string;
  userId: string;
  user: User;
  expiresAt: number;
  data: Record<string, any>;
}

export function createSessionStore() {
  // 本番環境ではRedisやデータベースを使用
  const store = new Map<string, Session>();
  
  return {
    async create(user: User): Promise<string> {
      const sessionId = crypto.randomUUID();
      const session: Session = {
        id: sessionId,
        userId: user.id,
        user,
        expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7日間
        data: {}
      };
      
      store.set(sessionId, session);
      return sessionId;
    },
    
    async get(sessionId: string): Promise<Session | null> {
      return store.get(sessionId) || null;
    },
    
    async destroy(sessionId: string): Promise<void> {
      store.delete(sessionId);
    },
    
    async refresh(sessionId: string): Promise<void> {
      const session = store.get(sessionId);
      if (session) {
        session.expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
      }
    }
  };
}
```

### ログイン処理

ログインAPIエンドポイントの実装です。メールアドレスとパスワードを検証し、認証に成功したらセッションを作成してセッションIDをHTTPOnlyクッキーに保存します。`sameSite: 'lax'`によりCSRF攻撃を防ぎ、`secure: true`でHTTPS通信のみでクッキーを送信するようにしています。

```typescript
// src/routes/api/auth/login/+server.ts
import type { RequestHandler } from './$types';
import { createSessionStore } from '$lib/server/session';
import bcrypt from 'bcrypt';

const sessions = createSessionStore();

export const POST: RequestHandler = async ({ request, cookies }) => {
  const { email, password } = await request.json();
  
  // ユーザー認証
  const user = await getUserByEmail(email);
  if (!user || !await bcrypt.compare(password, user.passwordHash)) {
    return json({ error: 'Invalid credentials' }, { status: 401 });
  }
  
  // セッション作成
  const sessionId = await sessions.create(user);
  
  // セキュアなクッキー設定
  cookies.set('session_id', sessionId, {
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7 // 7日間
  });
  
  return json({ success: true, user });
};
```

## JWT（JSON Web Token）認証

ステートレスな認証方式で、API中心のアーキテクチャに適しています。トークン自体に情報を含むため、サーバー側でセッション情報を保持する必要がありません。

### 処理フロー図

<Mermaid diagram={jwtAuthFlow} />

JWT認証のシーケンス図では、以下の処理フローを示しています。
1. **ログイン処理**: JWTトークンの生成と配布
2. **API呼び出し**: トークン検証とリクエスト処理
3. **トークンリフレッシュ**: 期限切れトークンの更新

#### 主要コンポーネント
- **hooks.server.ts**: JWTトークンの検証とlocalsへの設定
- **+server.ts(Login)**: ログインエンドポイント
- **+server.ts(Refresh)**: トークンリフレッシュエンドポイント
- **+server.ts(API)**: 保護されたAPIエンドポイント

### JWT基本構造

JWTは3つの部分（ヘッダー、ペイロード、署名）から構成され、ドット（.）で区切られた文字列として表現されます。ペイロードにはユーザー情報や有効期限などのクレーム（主張）を含めます。

```typescript
// JWTペイロードの型定義
interface JWTPayload {
  sub: string;      // Subject (user ID)
  email: string;
  role: string;
  iat: number;      // Issued At
  exp: number;      // Expiration
}
```

### 実装パターン1: HTTPOnlyクッキーでJWT保存

最もセキュアな方法で、XSS攻撃からトークンを保護します。JavaScriptからアクセスできないHTTPOnlyクッキーにトークンを保存することで、悪意のあるスクリプトによるトークン窃取を防ぎます。この方法はサーバーサイドレンダリングと相性が良く、SvelteKitのようなフレームワークに最適です。

```typescript
// src/routes/api/auth/login/+server.ts
import jwt from 'jsonwebtoken';
import type { RequestHandler } from './$types';

const JWT_SECRET = process.env.JWT_SECRET!;
const REFRESH_SECRET = process.env.REFRESH_SECRET!;

export const POST: RequestHandler = async ({ request, cookies }) => {
  const { email, password } = await request.json();
  
  // ユーザー認証
  const user = await authenticateUser(email, password);
  if (!user) {
    return json({ error: 'Invalid credentials' }, { status: 401 });
  }
  
  // アクセストークン（短期）
  const accessToken = jwt.sign(
    { 
      sub: user.id, 
      email: user.email, 
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: '15m' }
  );
  
  // リフレッシュトークン（長期）
  const refreshToken = jwt.sign(
    { sub: user.id },
    REFRESH_SECRET,
    { expiresIn: '7d' }
  );
  
  // HTTPOnlyクッキーに保存
  cookies.set('access_token', accessToken, {
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 15 // 15分
  });
  
  cookies.set('refresh_token', refreshToken, {
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7 // 7日
  });
  
  return json({ success: true, user });
};
```

### 実装パターン2: LocalStorageでJWT保存

SPAやモバイルアプリとの連携に適していますが、XSS攻撃に注意が必要です。クライアントサイドでトークンを管理するため、APIリクエスト時にAuthorizationヘッダーを手動で設定する必要があります。この方法は柔軟性が高い反面、セキュリティ対策をより慎重に行う必要があります。

```typescript
// src/routes/api/auth/login/+server.ts
export const POST: RequestHandler = async ({ request }) => {
  const { email, password } = await request.json();
  
  const user = await authenticateUser(email, password);
  if (!user) {
    return json({ error: 'Invalid credentials' }, { status: 401 });
  }
  
  const accessToken = jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '15m' }
  );
  
  const refreshToken = jwt.sign(
    { sub: user.id },
    REFRESH_SECRET,
    { expiresIn: '7d' }
  );
  
  // トークンをレスポンスボディで返す
  return json({ 
    accessToken,
    refreshToken,
    user 
  });
};
```

#### クライアント側での保存と使用

LocalStorageパターンでは、クライアント側でトークンを管理するストアを実装します。このストアは認証状態の管理、トークンの保存・取得、自動リフレッシュなどを担当します。

```typescript
// src/lib/stores/auth.ts
import { writable, derived } from 'svelte/store';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
}

function createAuthStore() {
  const { subscribe, set, update } = writable<AuthState>({
    user: null,
    accessToken: null,
    refreshToken: null
  });
  
  return {
    subscribe,
    
    async login(email: string, password: string) {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // LocalStorageに保存
        localStorage.setItem('access_token', data.accessToken);
        localStorage.setItem('refresh_token', data.refreshToken);
        
        set({
          user: data.user,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken
        });
        
        return true;
      }
      return false;
    },
    
    logout() {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      set({ user: null, accessToken: null, refreshToken: null });
    },
    
    // 初期化時にLocalStorageから復元
    init() {
      const accessToken = localStorage.getItem('access_token');
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (accessToken) {
        // トークンの検証とユーザー情報の取得
        this.validateToken(accessToken);
      }
    }
  };
}

export const auth = createAuthStore();
```

### JWT検証ミドルウェア

hooks.server.tsでJWTトークンを検証し、リクエストごとにユーザー情報をlocalsに設定します。このミドルウェアはすべてのリクエストで実行され、クッキーまたはAuthorizationヘッダーからトークンを取得して検証します。

```typescript
// src/hooks.server.ts
import jwt from 'jsonwebtoken';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  let token: string | null = null;
  
  // 1. クッキーから取得を試みる
  token = event.cookies.get('access_token') || null;
  
  // 2. Authorizationヘッダーから取得を試みる
  if (!token) {
    const authorization = event.request.headers.get('Authorization');
    if (authorization?.startsWith('Bearer ')) {
      token = authorization.slice(7);
    }
  }
  
  if (token) {
    try {
      const payload = jwt.verify(token, JWT_SECRET) as JWTPayload;
      event.locals.user = {
        id: payload.sub,
        email: payload.email,
        role: payload.role
      };
    } catch (error) {
      // トークンが無効または期限切れ
      event.locals.user = null;
    }
  }
  
  return resolve(event);
};
```

## リフレッシュトークンの実装

アクセストークンの有効期限を短く保ちつつ、ユーザー体験を損なわない仕組みです。アクセストークン（15分など短期）とリフレッシュトークン（7日など長期）の2つのトークンを使い分けることで、セキュリティと利便性のバランスを取ります。アクセストークンが期限切れになった際、リフレッシュトークンを使って新しいアクセストークンを取得します。

```typescript
// src/routes/api/auth/refresh/+server.ts
import jwt from 'jsonwebtoken';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ cookies, request }) => {
  let refreshToken = cookies.get('refresh_token');
  
  // ボディからも取得を試みる（LocalStorage使用時）
  if (!refreshToken) {
    const body = await request.json();
    refreshToken = body.refreshToken;
  }
  
  if (!refreshToken) {
    return json({ error: 'No refresh token' }, { status: 401 });
  }
  
  try {
    const payload = jwt.verify(refreshToken, REFRESH_SECRET) as { sub: string };
    
    // ユーザー情報を取得
    const user = await getUserById(payload.sub);
    if (!user) {
      return json({ error: 'User not found' }, { status: 404 });
    }
    
    // 新しいアクセストークンを発行
    const newAccessToken = jwt.sign(
      { sub: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '15m' }
    );
    
    // クッキー使用時
    cookies.set('access_token', newAccessToken, {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 15
    });
    
    return json({ 
      accessToken: newAccessToken,
      user 
    });
  } catch (error) {
    return json({ error: 'Invalid refresh token' }, { status: 401 });
  }
};
```

## ルートグループとAPIの配置戦略

SvelteKitのルートグループ機能を活用して、認証状態に応じたページを効率的に管理します。APIエンドポイントはグループ外に配置することで、柔軟なアクセス制御を実現します。

### 推奨ディレクトリ構造

```
src/routes/
├── api/                          # APIエンドポイント（グループ外）
│   ├── auth/
│   │   ├── login/
│   │   │   └── +server.ts       # POST: ログイン
│   │   ├── logout/
│   │   │   └── +server.ts       # POST: ログアウト
│   │   └── refresh/
│   │       └── +server.ts       # POST: トークンリフレッシュ
│   ├── posts/
│   │   ├── +server.ts           # GET: 公開記事一覧、POST: 要認証
│   │   └── [id]/
│   │       └── +server.ts       # GET: 公開記事、PUT/DELETE: 要認証
│   └── admin/
│       └── +server.ts           # すべて要管理者権限
│
├── (auth)/                       # 認証関連ページ（URLに影響なし）
│   ├── +layout.svelte           # 認証用レイアウト（シンプル）
│   ├── login/                   # /login
│   │   └── +page.svelte
│   ├── register/                # /register
│   │   └── +page.svelte
│   └── forgot-password/         # /forgot-password
│       └── +page.svelte
│
├── (protected)/                  # 認証必須ページ
│   ├── +layout.server.ts        # 認証チェック
│   ├── dashboard/               # /dashboard
│   │   └── +page.svelte
│   ├── profile/                 # /profile
│   │   └── +page.svelte
│   └── settings/                # /settings
│       └── +page.svelte
│
├── (admin)/                      # 管理者専用ページ
│   ├── +layout.server.ts        # 管理者権限チェック
│   └── admin/                   # /admin
│       ├── users/               # /admin/users
│       └── settings/            # /admin/settings
│
└── (public)/                     # 公開ページ（任意）
    ├── +page.svelte             # / (ホーム)
    ├── about/                   # /about
    └── pricing/                 # /pricing
```

### ルートグループの使い分け

ルートグループは括弧で囲まれたディレクトリで、URLパスに影響を与えずにページをグループ化できます。各グループで異なるレイアウトや認証ロジックを適用できます。

#### 1. (auth) - 認証関連ページ

認証フォームやパスワードリセットなど、認証に関連するUIをグループ化します。このグループでは、すでにログイン済みのユーザーがアクセスした場合、自動的にダッシュボードへリダイレクトする処理を実装します。

```typescript
// src/routes/(auth)/+layout.svelte
<script lang="ts">
  import { page } from '$app/stores';
  import type { Snippet } from 'svelte';
  
  let { children }: { children?: Snippet } = $props();
  
  // すでにログイン済みの場合はダッシュボードへリダイレクト
  $effect(() => {
    if ($page.data.user) {
      goto('/dashboard');
    }
  });
</script>

<div class="auth-layout">
  <div class="auth-container">
    <h1>MyApp</h1>
    {@render children?.()}
  </div>
</div>

<style>
  .auth-layout {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
```

#### 2. (protected) - 認証必須ページ

ログインユーザーのみアクセス可能なページをグループ化します。+layout.server.tsで認証チェックを実装し、未認証ユーザーはログインページへリダイレクトされます。このアプローチにより、グループ内のすべてのページで一貫した認証保護を提供できます。

```typescript
// src/routes/(protected)/+layout.server.ts
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url, cookies }) => {
  // セッション認証の場合
  if (!locals.user) {
    // リダイレクト前のURLを保存
    const redirectTo = url.pathname + url.search;
    throw redirect(302, `/login?redirectTo=${encodeURIComponent(redirectTo)}`);
  }
  
  // JWT認証の場合（トークンの有効性チェック）
  const accessToken = cookies.get('access_token');
  if (!accessToken || !isTokenValid(accessToken)) {
    throw redirect(302, '/login');
  }
  
  return {
    user: locals.user
  };
};
```

#### 3. (admin) - 管理者専用ページ

管理者権限が必要なページをグループ化します。通常の認証チェックに加えて、ロールベースのアクセス制御（RBAC）を実装し、管理者以外のアクセスを拒否します。この実装により、管理機能への不正アクセスを防ぎ、システムの安全性を確保します。

```typescript
// src/routes/(admin)/+layout.server.ts
import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
  if (!locals.user) {
    throw redirect(302, '/login');
  }
  
  if (locals.user.role !== 'admin') {
    throw error(403, {
      message: 'アクセス権限がありません',
      code: 'FORBIDDEN'
    });
  }
  
  return {
    user: locals.user,
    adminData: await getAdminDashboardData()
  };
};
```

### APIエンドポイントの認証パターン

APIエンドポイントの認証には主に2つのパターンがあります。それぞれにメリットがあり、プロジェクトの要件に応じて選択します。

#### パターン1: 個別認証（推奨）

APIエンドポイントは各々で認証を行います。これにより、公開/非公開を柔軟に制御できます。各エンドポイントごとに異なる認証要件を設定でき、例えばGETは公開、POSTは認証必要、DELETEは管理者のみといった細かい制御が可能です。

```typescript
// src/routes/api/posts/+server.ts
import type { RequestHandler } from './$types';

// GETは公開（認証不要）
export const GET: RequestHandler = async ({ url }) => {
  const posts = await getPublicPosts();
  return json(posts);
};

// POSTは認証必要
export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const data = await request.json();
  const post = await createPost(locals.user.id, data);
  
  return json(post, { status: 201 });
};

// PUTは作成者または管理者のみ
export const PUT: RequestHandler = async ({ request, locals, params }) => {
  if (!locals.user) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const post = await getPost(params.id);
  
  if (post.authorId !== locals.user.id && locals.user.role !== 'admin') {
    return json({ error: 'Forbidden' }, { status: 403 });
  }
  
  const data = await request.json();
  const updatedPost = await updatePost(params.id, data);
  
  return json(updatedPost);
};
```

#### パターン2: ミドルウェアでの統一認証

hooks.server.tsで特定のパスに対して統一的な認証を適用します。このアプローチは、多数のAPIエンドポイントで同じ認証ロジックを適用する場合に効果的で、コードの重複を減らし、認証ロジックの一元管理を実現します。

```typescript
// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  // APIパスの認証ルール
  const path = event.url.pathname;
  
  // 保護されたAPIパス
  const protectedApiPaths = [
    '/api/admin',
    '/api/user/profile',
    '/api/posts/create'
  ];
  
  // 保護されたAPIへのアクセスチェック
  if (protectedApiPaths.some(p => path.startsWith(p))) {
    if (!event.locals.user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }), 
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  }
  
  // 管理者APIのチェック
  if (path.startsWith('/api/admin')) {
    if (event.locals.user?.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Forbidden' }), 
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  }
  
  return resolve(event);
};
```

### グループ選択のベストプラクティス

適切なルートグループの選択により、認証ロジックの重複を避け、保守性の高いコード構造を実現します。以下の表は、各グループの使い分けのガイドラインです。

| グループ | 用途 | 認証チェック場所 |
|---------|------|-----------------|
| **(auth)** | ログイン・登録フォーム | なし（むしろログイン済みを除外） |
| **(protected)** | ユーザー向けページ | +layout.server.ts |
| **(admin)** | 管理者向けページ | +layout.server.ts |
| **(public)** | 公開ページ | なし |
| **api/** | APIエンドポイント | 各+server.tsまたはhooks.server.ts |

### 重要なポイント

ルートグループとAPIの配置戦略を成功させるために、以下の設計原則を理解し実践することが重要です。

1. **APIはルートグループの外に配置**
   - 理由：APIは独自の認証ロジックを持つため
   - メリット：公開/非公開を柔軟に制御可能

2. **UIページはグループで整理**
   - 理由：レイアウトやミドルウェアを共有
   - メリット：認証ロジックの重複を避ける

3. **hooks.server.tsで共通処理**
   - JWTトークンの検証
   - セッションの取得
   - localsへのユーザー情報設定

### API認証の実装例

実際のAPIエンドポイントで認証と権限チェックを実装する例です。hooks.server.tsで設定されたユーザー情報を活用し、適切なアクセス制御を行います。

```typescript
// src/routes/api/protected/posts/+server.ts
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
  // hooks.server.tsで設定されたユーザー情報をチェック
  if (!locals.user) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // 権限チェック
  if (locals.user.role !== 'admin' && locals.user.role !== 'editor') {
    return json({ error: 'Forbidden' }, { status: 403 });
  }
  
  const data = await request.json();
  const post = await createPost(locals.user.id, data);
  
  return json(post, { status: 201 });
};
```

## セキュリティのベストプラクティス

認証システムのセキュリティを確保するために、以下のベストプラクティスを実装します。これらの対策により、XSS、CSRF、セッションハイジャックなどの一般的な攻撃から保護します。

### 1. トークンの安全な保存

各保存方法にはセキュリティ上のトレードオフがあります。アプリケーションの特性に応じて適切な方法を選択します。

| 保存場所 | XSS耐性 | CSRF耐性 | 推奨用途 |
|---------|---------|----------|---------|
| HTTPOnly Cookie | ✅ | ⚠️ | SSRアプリ |
| LocalStorage | ❌ | ✅ | SPA（注意必要） |
| SessionStorage | ❌ | ✅ | 一時的な保存 |
| メモリ | ✅ | ✅ | 高セキュリティ |

### 2. CSRF対策

クロスサイトリクエストフォージェリ（CSRF）攻撃を防ぐため、状態を変更するリクエストにはCSRFトークンを要求します。Double Submit Cookie パターンを使用して、安全性を確保します。

```typescript
// src/hooks.server.ts
import { randomBytes } from 'crypto';

export const handle: Handle = async ({ event, resolve }) => {
  // CSRFトークンの生成
  if (event.request.method === 'GET') {
    const csrfToken = randomBytes(32).toString('hex');
    event.cookies.set('csrf_token', csrfToken, {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'lax'
    });
    event.locals.csrfToken = csrfToken;
  }
  
  // POSTリクエストでCSRFトークンを検証
  if (event.request.method === 'POST') {
    const cookieToken = event.cookies.get('csrf_token');
    const headerToken = event.request.headers.get('X-CSRF-Token');
    
    if (!cookieToken || cookieToken !== headerToken) {
      return new Response('CSRF token mismatch', { status: 403 });
    }
  }
  
  return resolve(event);
};
```

### 3. レート制限

ブルートフォース攻撃やDoS攻撃を防ぐため、APIエンドポイントや認証試行にレート制限を実装します。IPアドレスやユーザーIDベースで試行回数を制限し、一定期間内の過剰なリクエストをブロックします。

```typescript
// src/lib/server/rate-limiter.ts
const attempts = new Map<string, number[]>();

export function rateLimiter(
  maxAttempts: number = 5,
  windowMs: number = 15 * 60 * 1000 // 15分
) {
  return (identifier: string): boolean => {
    const now = Date.now();
    const userAttempts = attempts.get(identifier) || [];
    
    // 期限切れの試行を削除
    const validAttempts = userAttempts.filter(
      timestamp => now - timestamp < windowMs
    );
    
    if (validAttempts.length >= maxAttempts) {
      return false; // レート制限に達した
    }
    
    validAttempts.push(now);
    attempts.set(identifier, validAttempts);
    return true;
  };
}
```

## 実装例：完全な認証システム

ここまでの概念を統合した、実践的な認証システムの完全な実装例を示します。このシステムは、ログイン、ログアウト、セッション管理、認証保護されたページへのアクセス制御を含みます。

### ログインフォーム

進行状況の表示とエラーハンドリングを含む、ユーザーフレンドリーなログインフォームの実装です。

```svelte
<!-- src/routes/(public)/login/+page.svelte -->
<script lang="ts">
  import { goto } from '$app/navigation';
  import { applyAction, enhance } from '$app/forms';
  
  let loading = $state(false);
  let error = $state<string | null>(null);
</script>

<form 
  method="POST" 
  action="/api/auth/login"
  use:enhance={() => {
    loading = true;
    error = null;
    
    return async ({ result }) => {
      loading = false;
      
      if (result.type === 'success') {
        await applyAction(result);
        goto('/dashboard');
      } else if (result.type === 'failure') {
        error = result.data?.error || 'ログインに失敗しました';
      }
    };
  }}
>
  <label>
    メールアドレス
    <input type="email" name="email" required />
  </label>
  
  <label>
    パスワード
    <input type="password" name="password" required />
  </label>
  
  {#if error}
    <p class="error">{error}</p>
  {/if}
  
  <button type="submit" disabled={loading}>
    {loading ? 'ログイン中...' : 'ログイン'}
  </button>
</form>
```

### 自動トークンリフレッシュ

アクセストークンの有効期限が切れた際に、自動的にリフレッシュトークンを使って新しいアクセストークンを取得する仕組みです。この実装により、ユーザーが操作中に突然ログアウトされることを防ぎ、シームレスな体験を提供します。複数のAPIリクエストが同時に401エラーを受け取った場合でも、リフレッシュ処理を1回だけ実行するようにPromiseを共有しています。

```typescript
// src/lib/utils/auth-interceptor.ts
let refreshPromise: Promise<any> | null = null;

export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  let response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${getAccessToken()}`
    }
  });
  
  // 401エラーの場合、トークンをリフレッシュして再試行
  if (response.status === 401) {
    if (!refreshPromise) {
      refreshPromise = refreshAccessToken();
    }
    
    await refreshPromise;
    refreshPromise = null;
    
    // 新しいトークンで再試行
    response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${getAccessToken()}`
      }
    });
  }
  
  return response;
}

async function refreshAccessToken() {
  const response = await fetch('/api/auth/refresh', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      refreshToken: getRefreshToken()
    })
  });
  
  if (response.ok) {
    const data = await response.json();
    setAccessToken(data.accessToken);
    return data;
  }
  
  // リフレッシュ失敗時はログイン画面へ
  goto('/login');
  throw new Error('Token refresh failed');
}
```

## まとめ

SvelteKitでのセッション管理は、アプリケーションの要件に応じて選択する必要があります。このページで紹介した各認証戦略には、それぞれメリットとデメリットがあり、プロジェクトの特性を考慮して最適な方法を選択することが重要です。

- **SSRメインのアプリ**: クッキーベースセッション
- **API中心のアプリ**: JWT認証
- **高セキュリティ要件**: HTTPOnlyクッキー + CSRF対策
- **スケーラビリティ重視**: ステートレスJWT

適切な実装により、セキュアで使いやすい認証システムを構築できます。

## 次のステップ

認証システムの実装後は、以下のトピックについても検討してください。これらは認証システムと密接に関連しており、完全なアプリケーションを構築する上で重要な要素です。

- [認証ベストプラクティス](/sveltekit/application/auth-best-practices/) - 認証・認可パターンのベストプラクティス
- [データベース統合](/sveltekit/application/database/) - ユーザー情報の永続化
- [環境変数管理](/sveltekit/application/environment/) - シークレットの安全な管理
- [エラーハンドリング](/sveltekit/application/error-handling/) - 認証エラーの適切な処理