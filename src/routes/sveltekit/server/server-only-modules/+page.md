---
title: Server-only modules - サーバー専用モジュール
description: SvelteKitのServer-only modulesで機密情報を保護。$lib/server、.serverファイル、環境変数の安全な管理をTypeScriptで解説
---

<script>
	import Admonition from '$lib/components/Admonition.svelte';
  import Mermaid from '$lib/components/Mermaid.svelte';

  const serverOnlyDiagram = `flowchart LR
    subgraph server[サーバーコード]
        SEC["APIキー / DB認証情報"]
    end

    subgraph shared[共有コード]
        UTIL[ユーティリティ]
    end

    subgraph client[クライアント]
        PAGE[+page.svelte]
    end

    SEC -->|インポート| UTIL
    UTIL -->|インポート| PAGE

    style server fill:#ffebee,color:#333
    style shared fill:#fff3e0,color:#333
    style client fill:#e3f2fd,color:#333
    style SEC fill:#ffcdd2,color:#333
    style UTIL fill:#fff,color:#333
    style PAGE fill:#fff,color:#333`;
</script>

SvelteKit は、サーバー専用のモジュールを明確に分離することで、APIキーやデータベース認証情報などの機密情報がクライアントに漏洩することを防ぎます。

## この記事で学べること

- サーバー専用モジュールの作成方法
- プライベート環境変数の安全な使用
- エラー検出の仕組み
- 実践的なセキュリティパターン

## なぜサーバー専用モジュールが必要か

フロントエンドとバックエンドを同じリポジトリで開発する場合、機密情報を誤ってクライアントコードに含めてしまうリスクがあります。

<Mermaid diagram={serverOnlyDiagram} />

<Admonition type="warning" title="漏洩リスク">
直接または間接的にインポートすると、クライアントのJSに含まれてしまう可能性があります。
</Admonition>
SvelteKit はこのような危険なインポートを検出し、ビルド時にエラーを発生させます。

## サーバー専用モジュールの作成方法

### 方法 1: $lib/server ディレクトリ

`$lib/server` ディレクトリに配置したファイルは、サーバーコードからのみインポートできます。このディレクトリ内のファイルは、`+page.server.ts`、`+server.ts`、`hooks.server.ts` などのサーバー専用ファイルからのみインポート可能です。

以下の例では、データベースクライアントと機密情報をサーバー専用モジュールとして定義しています。

```typescript
// src/lib/server/database.ts
import { PrismaClient } from '@prisma/client';

// データベースクライアント（サーバー専用）
export const prisma = new PrismaClient();

// データベースクエリ関数
export async function getUsers() {
  return prisma.user.findMany();
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
  });
}
```

```typescript
// src/lib/server/secrets.ts
// 機密データ（サーバー専用）
export const databaseUrl = process.env.DATABASE_URL;
export const apiSecret = process.env.API_SECRET;
export const encryptionKey = process.env.ENCRYPTION_KEY;
```

### 方法 2: .server ファイル名

ファイル名に `.server` を含めることで、そのファイルをサーバー専用にできます。`$lib/server` ディレクトリを使用せずに、関連するファイルをまとめて配置したい場合に便利です。

以下の例では、パスワードハッシュ化とメール送信のサーバー専用モジュールを作成しています。

```typescript
// src/lib/auth.server.ts
import { hash, verify } from 'argon2';

export async function hashPassword(password: string): Promise<string> {
  return hash(password);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  return verify(hashedPassword, password);
}
```

```typescript
// src/lib/email.server.ts
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendEmail(to: string, subject: string, html: string) {
  return transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject,
    html,
  });
}
```

## プライベート環境変数

SvelteKit は環境変数へのアクセスを4つのモジュールに分離しています。プライベート環境変数はサーバーコードからのみアクセスでき、クライアントに漏洩することはありません。

### $env/static/private

ビルド時に埋め込まれるプライベート環境変数です。サーバーコードからのみアクセス可能で、値はビルド時に静的に解決されます。API キーやデータベース接続文字列など、デプロイ時に確定する値に適しています。

```typescript
// src/routes/api/data/+server.ts
import { STRIPE_SECRET_KEY, DATABASE_URL } from '$env/static/private';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
  // STRIPE_SECRET_KEY はサーバーでのみ使用可能
  const stripe = new Stripe(STRIPE_SECRET_KEY);

  const charges = await stripe.charges.list({ limit: 10 });

  return json(charges.data);
};
```

### $env/dynamic/private

実行時に読み込まれるプライベート環境変数です。サーバー起動時やリクエスト処理時に値が評価されるため、環境変数を動的に変更する場合や、コンテナ環境で起動時に設定される値に適しています。

```typescript
// src/routes/api/config/+server.ts
import { env } from '$env/dynamic/private';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
  // env.SOME_VAR は実行時に評価される
  return json({
    configured: !!env.EXTERNAL_API_KEY,
  });
};
```

### 公開環境変数との比較

| モジュール             | 可視性       | 使用場所           |
| ---------------------- | ------------ | ------------------ |
| `$env/static/private`  | サーバーのみ | ビルド時に埋め込み |
| `$env/dynamic/private` | サーバーのみ | 実行時に読み込み   |
| `$env/static/public`   | 公開         | ビルド時に埋め込み |
| `$env/dynamic/public`  | 公開         | 実行時に読み込み   |

## $app/server モジュール

`$app/server` モジュールも、サーバーコードからのみインポートできます。ファイルシステムからアセットを読み取る `read` 関数などを提供し、サーバーサイドでのファイル操作に使用します。

以下の例では、リクエストパラメータに基づいて PDF ファイルを読み取り、レスポンスとして返しています。

```typescript
// src/routes/api/pdf/+server.ts
import { read } from '$app/server';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
  const filename = url.searchParams.get('file');

  if (!filename) {
    return new Response('Filename required', { status: 400 });
  }

  // ファイルシステムからPDFを読み取る
  const file = read(`/files/${filename}.pdf`);

  return new Response(file, {
    headers: {
      'Content-Type': 'application/pdf',
    },
  });
};
```

## エラー検出の仕組み

SvelteKit は、パブリックコードがサーバー専用コードをインポートしようとすると、ビルド時にエラーを発生させます。この検出は間接的なインポートチェーンも追跡するため、中間モジュールを経由した漏洩も防止できます。

### 例：間接的なインポートの検出

以下の例では、`utils.ts` がサーバー専用の `secrets.ts` を再エクスポートしており、それを `+page.svelte` が（意図せず）インポートしています。SvelteKit はこのチェーンを検出してエラーを報告します。

```typescript
// src/lib/server/secrets.ts
export const atlantisCoordinates = [
  /* 機密データ */
];
```

```typescript
// src/routes/utils.ts
// サーバー専用モジュールからの再エクスポート
export { atlantisCoordinates } from '$lib/server/secrets';

// 安全なユーティリティ関数
export const add = (a: number, b: number) => a + b;
```

```svelte
<!-- src/routes/+page.svelte -->
<script lang="ts">
  // add関数のみを使用しているが...
  import { add } from './utils';
</script>
```

このコードは以下のエラーを発生させます。

```
Cannot import $lib/server/secrets.ts into code that runs in the browser,
as this could leak sensitive information.

 src/routes/+page.svelte imports
  src/routes/utils.ts imports
   $lib/server/secrets.ts

If you're only using the import as a type, change it to `import type`.
```

### 動的インポートも検出

静的なインポート文だけでなく、動的な `import()` 式もSvelteKit は検出します。変数を使ったパス指定でも、サーバー専用モジュールへのアクセスは検出されます。

```typescript
// これも検出される
const module = await import(`$lib/server/${name}.ts`);
```

## 実践的なパターン

Server-only modules を効果的に活用するための実践的なパターンを紹介します。これらのパターンを参考に、セキュアで保守性の高いコード構成を実現しましょう。

### 安全なファイル構成

以下は、サーバー専用コード、共有コード、UI コンポーネントを明確に分離したディレクトリ構成の例です。この構成により、機密情報の漏洩リスクを最小化し、コードの見通しを良くすることができます。

```
src/
├── lib/
│   ├── server/           # サーバー専用
│   │   ├── database.ts   # DB接続
│   │   ├── auth.ts       # 認証ロジック
│   │   └── email.ts      # メール送信
│   ├── shared/           # 共有コード
│   │   ├── types.ts      # 型定義
│   │   ├── utils.ts      # ユーティリティ
│   │   └── validation.ts # バリデーション
│   └── components/       # UIコンポーネント
└── routes/
    └── api/
        └── ...
```

### 型のみのインポート

サーバー専用モジュールから型定義のみを使用する場合は、`import type` を使用します。型情報はコンパイル時に消去されるため、実行時のコードに含まれることはなく、クライアントへの漏洩の心配がありません。

以下の例では、Prisma クライアントの型をサーバーモジュールからエクスポートし、クライアントコンポーネントで型のみをインポートしています。

```typescript
// src/lib/server/database.ts
import { PrismaClient } from '@prisma/client';
export const prisma = new PrismaClient();

// 型もエクスポート
export type { User, Post } from '@prisma/client';
```

```svelte
<!-- src/routes/+page.svelte -->
<script lang="ts">
  // 型のみのインポートは許可される
  import type { User, Post } from '$lib/server/database';
  import type { PageProps } from './$types';

  let { data }: PageProps = $props();
</script>
```

### API キーの安全な管理

外部 API を呼び出す際の API キーは、サーバー専用モジュールで管理します。以下の例では、API キーをヘッダーに設定して外部 API を呼び出す汎用関数を作成しています。この関数はサーバーコードからのみ呼び出せるため、API キーがクライアントに露出することはありません。

```typescript
// src/lib/server/external-api.ts
import { EXTERNAL_API_KEY } from '$env/static/private';

interface ApiResponse<T> {
  data: T;
  error?: string;
}

export async function fetchFromExternalApi<T>(
  endpoint: string,
): Promise<ApiResponse<T>> {
  const response = await fetch(`https://api.example.com${endpoint}`, {
    headers: {
      Authorization: `Bearer ${EXTERNAL_API_KEY}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    return {
      data: null as T,
      error: `API error: ${response.status}`,
    };
  }

  return {
    data: await response.json(),
  };
}
```

### データベース接続の管理

データベース接続もサーバー専用モジュールで管理します。以下の例では、Drizzle ORM と PostgreSQL を使用して、コネクションプールを設定しています。環境変数から接続文字列を取得し、適切なプール設定を行うことで、本番環境での安定した接続を実現しています。

```typescript
// src/lib/server/db.ts
import { DATABASE_URL } from '$env/static/private';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// コネクションプールの設定
const client = postgres(DATABASE_URL, {
  max: 10, // 最大接続数
  idle_timeout: 20,
  connect_timeout: 10,
});

export const db = drizzle(client);

// クリーンアップ用（テスト等）
export async function closeDb() {
  await client.end();
}
```

### セッション管理

JWT（JSON Web Token）を使用したセッション管理もサーバー専用モジュールで実装します。以下の例では、jose ライブラリを使用してトークンの生成と検証を行っています。セッションシークレットはプライベート環境変数から取得し、トークンには有効期限を設定しています。

```typescript
// src/lib/server/session.ts
import { SESSION_SECRET } from '$env/static/private';
import { SignJWT, jwtVerify } from 'jose';

const secret = new TextEncoder().encode(SESSION_SECRET);

export interface SessionData {
  userId: string;
  email: string;
  role: 'user' | 'admin';
}

export async function createSession(data: SessionData): Promise<string> {
  return new SignJWT({ ...data })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
}

export async function verifySession(
  token: string,
): Promise<SessionData | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as SessionData;
  } catch {
    return null;
  }
}
```

## テストでの注意事項

サーバー専用モジュールをユニットテストする際には、通常とは異なる動作になることを理解しておく必要があります。

<Admonition type="note" title="テスト環境での動作">
Vitest などのユニットテストフレームワークでは、サーバー専用モジュールの検出が無効化されます。
これは `process.env.TEST === 'true'` の場合に適用されます。
</Admonition>

以下の例では、サーバー専用の認証ユーティリティをテストしています。テスト環境では、通常ならエラーになるインポートが許可されます。

```typescript
// src/lib/server/utils.test.ts
import { describe, it, expect } from 'vitest';
// テスト環境ではサーバー専用モジュールをインポート可能
import { hashPassword } from './auth';

describe('auth utils', () => {
  it('should hash password', async () => {
    const hash = await hashPassword('password123');
    expect(hash).not.toBe('password123');
  });
});
```

## まとめ

Server-only modules を使用することで、以下のことが実現できます。

- **機密情報の保護**: APIキーや認証情報のクライアントへの漏洩を防止
- **明確な分離**: サーバーコードとクライアントコードの境界を明確化
- **ビルド時検出**: 危険なインポートをビルド時にエラーとして検出
- **型安全性**: TypeScript の型情報は安全に共有可能

セキュリティを重視したアプリケーション開発において、Server-only modules は不可欠な機能です。

## 次のステップ

- [Hooks](/sveltekit/server/hooks/) - サーバーサイドのリクエスト処理
- [環境変数管理](/sveltekit/application/environment/) - 環境変数の詳細
- [認証・認可](/sveltekit/application/authentication/) - 認証システムの実装
