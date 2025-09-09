---
title: JWT認証システム
description: SvelteKit 2.xとTypeScriptで実装するJWT認証システム完全ガイド。トークンベース認証、リフレッシュトークン、役割ベースアクセス制御（RBAC）、高度なルートグループ活用を実践的に解説
---

<script>
  import { base } from '$app/paths';
  import Mermaid from '$lib/components/Mermaid.svelte';
  
  // JWT認証フロー
  const jwtAuthFlow = `
sequenceDiagram
    participant Browser as ブラウザ
    participant SK as SvelteKit
    participant API as APIエンドポイント
    participant DB as Database
    
    Browser->>SK: /login アクセス
    SK->>Browser: ログインフォーム表示
    
    Browser->>SK: 認証情報送信
    SK->>API: POST /api/auth/login
    API->>DB: ユーザー検証
    
    alt 認証成功
        DB->>API: ユーザー情報
        API->>API: JWTトークン生成<br/>(Access + Refresh)
        API->>SK: { accessToken, refreshToken }
        SK->>Browser: トークンを保存<br/>(localStorage/Cookie)
    else 認証失敗
        API->>SK: 401 Unauthorized
        SK->>Browser: エラー表示
    end
`;

  const tokenRefreshFlow = `
sequenceDiagram
    participant Browser as ブラウザ
    participant SK as SvelteKit
    participant Hooks as hooks.server.ts
    participant API as APIエンドポイント
    
    Browser->>SK: 保護されたページへアクセス
    SK->>Hooks: handle()実行
    Hooks->>Hooks: Accessトークン検証
    
    alt トークン期限切れ
        Hooks->>API: POST /api/auth/refresh<br/>(Refreshトークン送信)
        alt Refreshトークン有効
            API->>API: 新しいAccessトークン生成
            API->>Hooks: { accessToken }
            Hooks->>Hooks: 新トークンで再検証
            Hooks->>SK: 認証成功・継続
        else Refreshトークン無効
            API->>Hooks: 401 Unauthorized
            Hooks->>SK: ログインページへリダイレクト
        end
    else トークン有効
        Hooks->>SK: 認証成功・継続
    end
`;

  const rbacFlow = `
graph TB
    subgraph "ルートグループ構造"
        Root["/"]
        
        Root --> Auth["(auth)<br/>認証関連"]
        Root --> Admin["(admin)<br/>管理者専用"]
        Root --> User["(user)<br/>一般ユーザー"]
        Root --> API["(api)<br/>APIエンドポイント"]
        
        Auth --> Login["/login"]
        Auth --> Register["/register"]
        
        Admin --> AdminLayout["+layout.server.ts<br/>role: 'admin'チェック"]
        Admin --> UserMgmt["/users<br/>ユーザー管理"]
        Admin --> Settings["/settings<br/>システム設定"]
        
        User --> UserLayout["+layout.server.ts<br/>認証チェック"]
        User --> Dashboard["/dashboard"]
        User --> Profile["/profile"]
        
        API --> V1["/v1"]
        V1 --> AuthAPI["/auth/*<br/>認証API"]
        V1 --> DataAPI["/data/*<br/>データAPI"]
    end
    
    style Auth fill:#e1f5fe
    style Admin fill:#ffebee
    style User fill:#f3e5f5
    style API fill:#e8f5e9
`;
</script>

SvelteKit 2.xとTypeScriptを使用した、JWTベースの認証システム実装例です。アクセストークンとリフレッシュトークンによる安全な認証、役割ベースアクセス制御（RBAC）、高度なルートグループを活用した実装パターンを解説します。

## 実装プロジェクト（準備中）

JWT認証システムの完全な実装例を準備中です。

- **デモサイト**: 準備中
- **ソースコード**: [https://github.com/shuji-bonji/svelte5-auth-jwt](https://github.com/shuji-bonji/svelte5-auth-jwt)（準備中）

:::info[実装予定の機能]
- JWTトークンによる認証
- アクセストークン + リフレッシュトークン
- 役割ベースアクセス制御（RBAC）
- 高度なルートグループ活用
- トークン自動更新機能
- セキュアなトークン保存戦略
:::

### プロジェクト構成（予定）

JWT認証システムでは、ルートグループを活用した高度な構造を採用します。

```
src/routes/
├── (auth)/                      # 認証関連（未認証ユーザー向け）
│   ├── +layout.svelte          # シンプルな認証用レイアウト
│   ├── login/
│   │   ├── +page.svelte        # ログインフォーム
│   │   └── +page.server.ts     # ログイン処理
│   ├── register/
│   │   ├── +page.svelte        # 登録フォーム
│   │   └── +page.server.ts     # 登録処理
│   └── forgot-password/        # パスワードリセット
│       └── +page.svelte
│
├── (admin)/                     # 管理者専用エリア
│   ├── +layout.server.ts       # role: 'admin' チェック
│   ├── +layout.svelte          # 管理者用レイアウト
│   ├── users/                  # ユーザー管理
│   │   ├── +page.svelte        # ユーザー一覧
│   │   └── [id]/
│   │       └── +page.svelte    # ユーザー詳細・編集
│   ├── settings/               # システム設定
│   └── analytics/              # 分析ダッシュボード
│
├── (user)/                      # 一般ユーザーエリア
│   ├── +layout.server.ts       # 認証チェック
│   ├── +layout.svelte          # ユーザー用レイアウト
│   ├── dashboard/              # ダッシュボード
│   ├── profile/                # プロフィール
│   └── settings/               # ユーザー設定
│
├── (api)/                       # APIエンドポイント（レイアウトなし）
│   └── v1/
│       ├── auth/
│       │   ├── login/+server.ts      # POST: ログイン
│       │   ├── refresh/+server.ts    # POST: トークン更新
│       │   └── logout/+server.ts     # POST: ログアウト
│       └── users/
│           └── +server.ts             # GET/POST/PUT/DELETE
│
├── (marketing)@/                # マーケティング（レイアウトリセット）
│   ├── +layout.svelte          # 独自のマーケティングレイアウト
│   ├── +page.svelte            # ランディングページ
│   ├── pricing/                # 料金プラン
│   └── features/               # 機能紹介
│
├── hooks.server.ts             # JWT検証ミドルウェア
└── app.d.ts                    # 型定義（User, Role等）
```

## この実装の特徴

JWT認証システムでは、Cookie/Session版よりも高度な機能を実装します。

### 技術スタック（予定）

- **SvelteKit 2.x** - フルスタックフレームワーク
- **Jose** - JWT生成・検証ライブラリ
- **Prisma** - TypeScript対応のORM
- **bcryptjs** - パスワードハッシュ化
- **PostgreSQL** - データベース

### 実装のポイント

1. **二重トークン戦略** - アクセストークン（15分）+ リフレッシュトークン（7日）
2. **役割ベースアクセス制御** - admin、user、guestの3つのロール
3. **高度なルートグループ** - 役割別のレイアウトと認証チェック
4. **自動トークン更新** - 期限切れ前の自動更新機能
5. **セキュアなトークン保存** - HTTPOnly Cookie + localStorage のハイブリッド戦略

## 実装の詳細（設計）

### JWT認証フロー

新規ユーザー登録とログイン時のJWT発行フローです。アクセストークンとリフレッシュトークンの2種類を発行し、セキュリティと利便性を両立します。

<Mermaid chart={jwtAuthFlow} />

#### 設計のポイント
- アクセストークン: 15分の短い有効期限
- リフレッシュトークン: 7日間の長い有効期限
- ペイロードには最小限の情報のみ含める（userId、role）
- 署名アルゴリズムはHS256またはRS256を使用

### トークン更新フロー

アクセストークンの期限切れを検出し、リフレッシュトークンを使用して新しいアクセストークンを取得するフローです。

<Mermaid chart={tokenRefreshFlow} />

#### 設計のポイント
- hooks.server.tsで自動的にトークン更新を処理
- リフレッシュトークンのローテーション（セキュリティ向上）
- 更新失敗時は自動的にログアウト処理

### 役割ベースアクセス制御（RBAC）

ルートグループを活用した役割別のアクセス制御構造です。

<Mermaid chart={rbacFlow} />

#### 設計のポイント
- `(admin)`グループ: 管理者のみアクセス可能
- `(user)`グループ: 認証済みユーザーがアクセス可能
- `(auth)`グループ: 未認証ユーザー向け（ログイン・登録）
- `(api)`グループ: RESTful APIエンドポイント
- `(marketing)@`: レイアウトリセットでマーケティング用デザイン

## コード実装（予定）

### 1. JWT生成・検証ユーティリティ

```typescript
// src/lib/server/jwt.ts
import * as jose from 'jose';
import type { User } from '@prisma/client';

const ACCESS_TOKEN_SECRET = new TextEncoder().encode(
  process.env.JWT_ACCESS_SECRET!
);
const REFRESH_TOKEN_SECRET = new TextEncoder().encode(
  process.env.JWT_REFRESH_SECRET!
);

const ACCESS_TOKEN_EXPIRY = '15m';  // 15分
const REFRESH_TOKEN_EXPIRY = '7d';  // 7日

// JWTペイロードの型定義
interface TokenPayload {
  sub: string;      // ユーザーID
  role: string;     // ユーザーロール
  email: string;    // メールアドレス
}

// アクセストークン生成
export async function generateAccessToken(user: User): Promise<string> {
  const jwt = await new jose.SignJWT({
    sub: user.id,
    role: user.role,
    email: user.email
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .sign(ACCESS_TOKEN_SECRET);
    
  return jwt;
}

// リフレッシュトークン生成
export async function generateRefreshToken(user: User): Promise<string> {
  const jwt = await new jose.SignJWT({
    sub: user.id
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(REFRESH_TOKEN_EXPIRY)
    .sign(REFRESH_TOKEN_SECRET);
    
  return jwt;
}

// トークン検証
export async function verifyAccessToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jose.jwtVerify(token, ACCESS_TOKEN_SECRET);
    return payload as TokenPayload;
  } catch {
    return null;
  }
}

// リフレッシュトークン検証
export async function verifyRefreshToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jose.jwtVerify(token, REFRESH_TOKEN_SECRET);
    return payload.sub as string;
  } catch {
    return null;
  }
}
```

### 2. Hooksでのトークン検証

```typescript
// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit';
import { verifyAccessToken, verifyRefreshToken, generateAccessToken } from '$lib/server/jwt';
import { getUserById } from '$lib/server/db';

export const handle: Handle = async ({ event, resolve }) => {
  // Authorizationヘッダーからトークンを取得
  const authHeader = event.request.headers.get('Authorization');
  const accessToken = authHeader?.replace('Bearer ', '');
  
  if (accessToken) {
    // アクセストークンの検証
    const payload = await verifyAccessToken(accessToken);
    
    if (payload) {
      // 有効なトークンの場合、ユーザー情報をlocalsに保存
      event.locals.user = {
        id: payload.sub,
        role: payload.role,
        email: payload.email
      };
    } else {
      // アクセストークンが無効な場合、リフレッシュトークンを確認
      const refreshToken = event.cookies.get('refreshToken');
      
      if (refreshToken) {
        const userId = await verifyRefreshToken(refreshToken);
        
        if (userId) {
          // 新しいアクセストークンを生成
          const user = await getUserById(userId);
          if (user) {
            const newAccessToken = await generateAccessToken(user);
            
            // 新しいトークンをレスポンスヘッダーに設定
            event.setHeaders({
              'X-New-Access-Token': newAccessToken
            });
            
            event.locals.user = {
              id: user.id,
              role: user.role,
              email: user.email
            };
          }
        }
      }
    }
  }
  
  // リクエストの処理を継続
  return resolve(event);
};
```

### 3. 役割別レイアウト保護

```typescript
// src/routes/(admin)/+layout.server.ts
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
  // 未認証またはadmin以外はアクセス拒否
  if (!locals.user || locals.user.role !== 'admin') {
    throw redirect(303, '/login?message=Admin access required');
  }
  
  return {
    user: locals.user
  };
};
```

```typescript
// src/routes/(user)/+layout.server.ts
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
  // 未認証ユーザーはログインページへ
  if (!locals.user) {
    throw redirect(303, '/login?from=' + encodeURIComponent(url.pathname));
  }
  
  return {
    user: locals.user
  };
};
```

### 4. ログインAPIエンドポイント

```typescript
// src/routes/(api)/v1/auth/login/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { verifyPassword, generateAccessToken, generateRefreshToken } from '$lib/server/auth';
import { getUserByEmail } from '$lib/server/db';

export const POST: RequestHandler = async ({ request, cookies }) => {
  const { email, password } = await request.json();
  
  // ユーザー検証
  const user = await getUserByEmail(email);
  if (!user || !(await verifyPassword(password, user.password))) {
    return json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  }
  
  // トークン生成
  const accessToken = await generateAccessToken(user);
  const refreshToken = await generateRefreshToken(user);
  
  // リフレッシュトークンをHTTPOnly Cookieに保存
  cookies.set('refreshToken', refreshToken, {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7 // 7日
  });
  
  // アクセストークンをレスポンスで返す
  return json({
    accessToken,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    }
  });
};
```

## セキュリティのベストプラクティス

JWT認証を安全に実装するための重要なポイントです。

### 1. トークンの保存戦略

```typescript
// 推奨: ハイブリッド戦略
// - リフレッシュトークン: HTTPOnly Cookie（XSS対策）
// - アクセストークン: メモリまたはlocalStorage（利便性）

// Cookieの設定
cookies.set('refreshToken', token, {
  httpOnly: true,     // XSS対策
  secure: true,       // HTTPS必須
  sameSite: 'strict', // CSRF対策
  path: '/',
  maxAge: 60 * 60 * 24 * 7
});
```

### 2. トークンローテーション

```typescript
// リフレッシュトークン使用時に新しいトークンを発行
async function rotateRefreshToken(oldToken: string): Promise<{
  accessToken: string;
  refreshToken: string;
} | null> {
  const userId = await verifyRefreshToken(oldToken);
  if (!userId) return null;
  
  // 古いトークンを無効化
  await invalidateRefreshToken(oldToken);
  
  // 新しいトークンペアを生成
  const user = await getUserById(userId);
  return {
    accessToken: await generateAccessToken(user),
    refreshToken: await generateRefreshToken(user)
  };
}
```

### 3. トークンの無効化リスト

```typescript
// ログアウト時やトークン漏洩時の対策
// Redisなどのキャッシュストアを使用
async function invalidateToken(token: string): Promise<void> {
  const decoded = jose.decodeJwt(token);
  const expiry = decoded.exp! - Math.floor(Date.now() / 1000);
  
  // トークンの残り有効期限だけブラックリストに保存
  await redis.setex(`blacklist:${token}`, expiry, '1');
}

// トークン検証時にブラックリストをチェック
async function isTokenBlacklisted(token: string): Promise<boolean> {
  const result = await redis.get(`blacklist:${token}`);
  return result !== null;
}
```

## Cookie/Session認証との比較

| 観点 | JWT認証 | Cookie/Session認証 |
|------|---------|-------------------|
| **状態管理** | ステートレス | ステートフル |
| **スケーラビリティ** | 高い（サーバー間共有不要） | 低い（セッション共有必要） |
| **トークン無効化** | 困難（ブラックリスト必要） | 簡単（サーバー側で削除） |
| **実装複雑度** | 高い | 低い |
| **マイクロサービス** | 最適 | 不向き |
| **モバイルアプリ** | 最適 | 不向き |

## 実装上の注意点

### よくある間違い

:::warning[セキュリティリスク]
1. **秘密鍵の管理** - 環境変数で管理し、絶対にクライアントに露出させない
2. **ペイロードの内容** - 機密情報を含めない（パスワード、個人情報など）
3. **トークンの有効期限** - アクセストークンは短く（15分以内）設定
4. **HTTPS必須** - 本番環境では必ずHTTPS通信を使用
:::

### パフォーマンス最適化

```typescript
// トークン検証結果のキャッシュ
const tokenCache = new Map<string, TokenPayload>();

async function verifyTokenWithCache(token: string): Promise<TokenPayload | null> {
  // キャッシュチェック
  if (tokenCache.has(token)) {
    return tokenCache.get(token)!;
  }
  
  // 検証実行
  const payload = await verifyAccessToken(token);
  if (payload) {
    // 1分間キャッシュ
    tokenCache.set(token, payload);
    setTimeout(() => tokenCache.delete(token), 60000);
  }
  
  return payload;
}
```

## 関連リソース

- [Jose Documentation](https://github.com/panva/jose) - JWT library for JavaScript
- [JWT.io](https://jwt.io/) - JWT debugger and documentation
- [RFC 7519](https://datatracker.ietf.org/doc/html/rfc7519) - JWT specification

## まとめ

JWT認証は、マイクロサービスやSPAアプリケーションに最適な認証方式です。SvelteKitの高度なルートグループ機能と組み合わせることで、役割ベースの複雑なアクセス制御を実現できます。

### JWT認証が適している場合

- ✅ **マイクロサービスアーキテクチャ** - サービス間でトークンを共有
- ✅ **モバイルアプリとの連携** - APIベースの認証
- ✅ **複数ドメイン対応** - CORS環境での認証
- ✅ **スケーラビリティ重視** - サーバー間のセッション共有不要

### 実装のポイント

1. **二重トークン戦略** でセキュリティと利便性を両立
2. **ルートグループ** で役割別のアクセス制御を実装
3. **トークンローテーション** で漏洩リスクを軽減
4. **適切な有効期限設定** でセキュリティを確保

## 次のステップ

- [Cookie/Session認証システム](/examples/auth-cookie-session/) - 基本的な認証実装
- [高度なルーティング](/sveltekit/routing/advanced/) - ルートグループの詳細
- OAuth認証システム（準備中） - ソーシャルログイン実装