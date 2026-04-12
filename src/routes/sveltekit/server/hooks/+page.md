---
title: Hooks
description: SvelteKitのHooksシステムを完全理解 - handle、handleFetch、handleErrorを使用したリクエスト処理のカスタマイズとTypeScriptでの実装方法を解説
---

<script>
	import { base } from '$app/paths';
	import Admonition from '$lib/components/Admonition.svelte';
  import Mermaid from '$lib/components/Mermaid.svelte';

  const hooksFlowChart = `graph LR
    A[クライアント] --> B[handle]
    B --> C[ルート処理]
    C --> D[handleFetch]
    D --> E[外部API]

    C --> F[エラー発生]
    F --> G[handleError]

    B --> H[レスポンス]
    H --> A

    style B fill:#f9f,stroke:#333,stroke-width:2px,color:#333
    style D fill:#9ff,stroke:#333,stroke-width:2px,color:#333
    style G fill:#ff9,stroke:#333,stroke-width:2px,color:#333`;

  const handleAuthFlow = `sequenceDiagram
    participant Client as クライアント
    participant Handle as handle Hook
    participant Cookie as Cookie/JWT
    participant DB as データベース
    participant Route as ルート処理
    participant Response as レスポンス

    Client->>Handle: リクエスト送信
    Handle->>Cookie: session_id取得

    alt セッション有効
        Cookie-->>Handle: session_id
        Handle->>DB: セッション検証
        DB-->>Handle: User情報
        Handle->>Handle: event.locals.user = user
        Handle->>Route: resolve(event)
        Route-->>Handle: response
        Handle-->>Client: 200 OK
    else セッション無効/なし
        Cookie-->>Handle: なし/期限切れ
        Handle->>Handle: event.locals.user = null
        Handle->>Route: resolve(event)
        Route-->>Handle: response
        Handle-->>Client: 401 Unauthorized
    end`;

  const handleFetchFlow = `sequenceDiagram
    participant Server as サーバー
    participant HandleFetch as handleFetch Hook
    participant Cache as キャッシュ
    participant API as 外部API

    Server->>HandleFetch: fetch('https://api.example.com')
    HandleFetch->>Cache: キャッシュ確認

    alt キャッシュヒット
        Cache-->>HandleFetch: キャッシュデータ
        HandleFetch-->>Server: レスポンス返却
    else キャッシュミス
        Cache-->>HandleFetch: なし
        HandleFetch->>API: リクエスト送信<br/>Authorization: Bearer key
        API-->>HandleFetch: データ返却
        HandleFetch->>Cache: キャッシュ保存
        HandleFetch-->>Server: レスポンス返却
    end`;

  const handleErrorFlow = `sequenceDiagram
    participant Route as ルート処理
    participant Error as handleError Hook
    participant Logger as ロギング
    participant Sentry as Sentry
    participant Client as クライアント

    Route->>Route: エラー発生
    Route->>Error: handleError(error, event)
    Error->>Logger: エラーログ記録
    Logger-->>Error: 完了

    alt 本番環境
        Error->>Sentry: エラー送信<br/>スタックトレース付き
        Sentry-->>Error: 記録完了
        Error-->>Client: {message: '一般的なエラー'}
    else 開発環境
        Error-->>Client: {message, stack, ...details}
    end`;

  const sequenceHooksFlow = `sequenceDiagram
    participant Client as クライアント
    participant Handle1 as handle 1
    participant Handle2 as handle 2
    participant Route as ルート処理
    participant HandleFetch as handleFetch

    Client->>Handle1: リクエスト
    Handle1->>Handle1: 認証処理
    Handle1->>Handle2: 次のhandleへ
    Handle2->>Handle2: ロギング
    Handle2->>Route: resolve(event)

    Route->>HandleFetch: fetch()呼び出し
    HandleFetch->>HandleFetch: リクエスト変換
    HandleFetch-->>Route: レスポンス

    Route-->>Handle2: response
    Handle2->>Handle2: ヘッダー追加
    Handle2-->>Handle1: response
    Handle1-->>Client: 最終レスポンス`;
</script>

SvelteKitのHooksは、アプリケーション全体のリクエスト処理をカスタマイズする強力な仕組みです。認証、ログ、エラー処理などの横断的関心事を一元管理できます。

## Hooksの概要

Hooksは、すべてのリクエストが通過するミドルウェアのような役割を果たします。Express.jsのミドルウェアやASP.NET Coreのミドルウェアパイプラインと同様の概念で、リクエスト・レスポンスサイクルの各段階で処理を挿入できます。

### Hooksの種類

以下の図は、Hooksがリクエスト処理フローのどこで実行されるかを示しています。各Hookは特定のタイミングで呼び出され、アプリケーション全体に影響を与えます。

<Mermaid chart={hooksFlowChart} />

| Hook                      | 役割                                     | 実行タイミング           |
| ------------------------- | ---------------------------------------- | ------------------------ |
| **handle**                | リクエスト/レスポンスの処理              | すべてのリクエスト       |
| **handleFetch**           | fetch関数のカスタマイズ                  | サーバーサイドfetch時    |
| **handleError**           | エラー処理                               | 未処理エラー発生時       |
| **handleValidationError** | Remote Functionsバリデーションエラー処理 | 引数バリデーション失敗時 |

これらのHooksを適切に組み合わせることで、認証、ロギング、セキュリティヘッダー、国際化など、アプリケーション全体に影響する機能を効率的に実装できます。

## handle Hook

`handle`フックは、すべてのリクエストに対して実行される最も基本的なHookです。リクエストを受け取り、処理を実行し、レスポンスを返します。認証、ログ記録、セキュリティヘッダーの追加など、あらゆる共通処理を実装できます。

### 基本的な実装

最もシンプルな`handle`フックの実装例です。`resolve(event)`を呼び出すことでリクエスト処理を実行し、その前後で独自の処理を挟むことができます。この例では、リクエストのログ記録とカスタムヘッダーの追加を行っています。

```typescript
// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  // リクエスト前の処理
  console.log(`${event.request.method} ${event.url.pathname}`);

  // リクエスト処理を実行
  const response = await resolve(event);

  // レスポンス後の処理
  response.headers.set('X-Custom-Header', 'value');

  return response;
};
```

### 認証処理の実装

認証は、ほぼすべてのWebアプリケーションで必要となる機能です。`handle`フックで認証処理を実装することで、すべてのページとAPIエンドポイントで自動的に認証状態をチェックできます。

以下の例では、Cookie認証とJWT認証の両方に対応しています。Cookieベースのセッション認証は通常のページアクセスに、JWTはAPI呼び出しに使用されます。認証済みユーザー情報は`event.locals`に格納され、すべてのルートでアクセス可能になります。

#### 認証フロー

以下の図は、handleフックでの認証処理の流れを示しています。Cookieまたはトークンからセッション情報を取得し、データベースで検証した後、ユーザー情報をlocalsに設定します。

<Mermaid chart={handleAuthFlow} />

<Admonition type="info" title="実践例">
Hooksを使用した認証実装の完全なコード例は以下で確認できます。
<ul>
<li><strong><a href="{base}/examples/auth-cookie-session/">Cookie/Session認証</a></strong> - hooks.server.tsでの認証実装</li>
<li><strong><a href="{base}/sveltekit/application/session/">セッション管理と認証戦略</a></strong> - 認証戦略の詳細</li>
</ul>

</Admonition>

#### 実装コード

```typescript
// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';
import { db } from '$lib/server/database';

export const handle: Handle = async ({ event, resolve }) => {
  // Cookieからセッショントークンを取得
  const sessionId = event.cookies.get('session_id');

  if (sessionId) {
    try {
      // セッションの検証
      const session = await db.session.findUnique({
        where: { id: sessionId },
        include: { user: true },
      });

      if (session && session.expiresAt > new Date()) {
        // ユーザー情報をlocalsに設定
        event.locals.user = session.user;
      } else {
        // 期限切れセッションを削除
        event.cookies.delete('session_id', { path: '/' });
      }
    } catch (error) {
      console.error('セッション検証エラー:', error);
    }
  }

  // JWTトークンの検証（API用）
  const authHeader = event.request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET!) as any;
      const user = await db.user.findUnique({
        where: { id: payload.userId },
      });
      if (user) {
        event.locals.user = user;
      }
    } catch (error) {
      // トークンが無効
    }
  }

  return resolve(event);
};
```

### 複数のHandleを連鎖

複雑なアプリケーションでは、複数の異なる関心事（認証、ログ、セキュリティなど）を処理する必要があります。`sequence`ヘルパーを使用することで、複数の`handle`フックを組み合わせて、保守しやすいコードを書くことができます。

各Handleは独立した責務を持ち、順番に実行されます。認証が最初に実行され、次にログ記録、最後にセキュリティヘッダーの追加が行われます。このパターンは、ミドルウェアパイプラインの概念に基づいています。

#### Hooks連鎖の実行フロー

以下の図は、複数のhandleフックが順番に実行され、handleFetchと連携しながら最終的にレスポンスが返されるまでの流れを示しています。

<Mermaid chart={sequenceHooksFlow} />

#### 実装例

```typescript
// src/hooks.server.ts
import { sequence } from '@sveltejs/kit/hooks';
import type { Handle } from '@sveltejs/kit';

// 認証処理
const authentication: Handle = async ({ event, resolve }) => {
  // 認証ロジック
  const session = event.cookies.get('session_id');
  if (session) {
    event.locals.user = await validateSession(session);
  }
  return resolve(event);
};

// ログ処理
const logging: Handle = async ({ event, resolve }) => {
  const start = performance.now();

  // リクエストログ
  console.log(
    `[${new Date().toISOString()}] ${event.request.method} ${event.url.pathname}`,
  );

  const response = await resolve(event);

  // レスポンスログ
  const duration = performance.now() - start;
  console.log(`  └─ ${response.status} (${duration.toFixed(2)}ms)`);

  return response;
};

// セキュリティヘッダー
const security: Handle = async ({ event, resolve }) => {
  const response = await resolve(event);

  // セキュリティヘッダーを追加
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // CSPヘッダー
  if (!event.url.pathname.startsWith('/admin')) {
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
    );
  }

  return response;
};

// Hooksを連鎖
export const handle = sequence(authentication, logging, security);
```

## handleFetch Hook

`handleFetch`フックは、サーバーサイドで実行される`fetch`関数をカスタマイズします。外部APIへのリクエストに認証ヘッダーを追加したり、内部APIへのリクエストを最適化したり、リトライロジックを実装したりできます。

Load関数やAPIルートから呼び出される`fetch`は、このフックを通過します。これにより、すべての外部通信を一箇所で制御できます。

### handleFetchの実行フロー

以下の図は、handleFetchフックがfetchリクエストをどのように処理するかを示しています。キャッシュチェック、認証ヘッダーの追加、レスポンスのキャッシュ保存などを自動化できます。

<Mermaid chart={handleFetchFlow} />

### 基本的な実装

以下の例では、内部APIへのリクエストを最適化し、外部APIへのリクエストに自動的に認証ヘッダーを追加しています。環境変数に保存されたAPIキーをサーバーサイドで安全に使用できます。

```typescript
// src/hooks.server.ts
import type { HandleFetch } from '@sveltejs/kit';

export const handleFetch: HandleFetch = async ({ request, fetch, event }) => {
  // 内部APIへのリクエストを最適化
  if (request.url.startsWith('http://localhost:5173/api/')) {
    // HTTPリクエストをスキップして直接関数を呼び出す
    const url = new URL(request.url);
    request = new Request(url.origin + url.pathname + url.search, request);
  }

  // 外部APIへの認証ヘッダー追加
  if (request.url.startsWith('https://api.external.com/')) {
    request = new Request(request, {
      headers: {
        ...Object.fromEntries(request.headers),
        Authorization: `Bearer ${process.env.EXTERNAL_API_KEY}`,
      },
    });
  }

  return fetch(request);
};
```

### APIプロキシの実装

より高度な`handleFetch`の実装例です。外部APIをプロキシし、リトライロジックを実装しています。GitHub APIへのアクセスを例に、レート制限（429エラー）に対する適切な対処と、ネットワークエラー時の自動リトライを実装しています。

このパターンは、外部APIの不安定性を吸収し、アプリケーションの信頼性を高めるのに有効です。

```typescript
// src/hooks.server.ts
import type { HandleFetch } from '@sveltejs/kit';

export const handleFetch: HandleFetch = async ({ request, fetch, event }) => {
  // 外部APIをプロキシ
  if (request.url.startsWith('/proxy/github/')) {
    const path = request.url.replace('/proxy/github/', '');
    const githubUrl = `https://api.github.com/${path}`;

    request = new Request(githubUrl, {
      headers: {
        ...Object.fromEntries(request.headers),
        Authorization: `token ${process.env.GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });
  }

  // リトライロジック
  let lastError;
  for (let i = 0; i < 3; i++) {
    try {
      const response = await fetch(request);
      if (response.ok) return response;

      // 429 Too Many Requests の場合は待機
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        const delay = retryAfter ? parseInt(retryAfter) * 1000 : 1000 * (i + 1);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      return response;
    } catch (error) {
      lastError = error;
      // ネットワークエラーの場合はリトライ
      await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
    }
  }

  throw lastError;
};
```

## handleError Hook

`handleError`フックは、アプリケーション内で発生した未処理エラーを一元的に管理します。エラーのログ記録、外部サービスへの通知、ユーザーへの適切なエラーメッセージの表示など、エラー処理のベストプラクティスを実装できます。

開発環境では詳細なエラー情報を表示し、本番環境では最小限の情報のみをクライアントに返すことで、セキュリティとデバッグ性の両立が可能です。

### エラー処理のフロー

以下の図は、エラーが発生した際の処理の流れを示しています。エラーログの記録、Sentryへの通知、クライアントへのレスポンスなど、環境に応じた適切な処理を実行します。

<Mermaid chart={handleErrorFlow} />

### エラーハンドリングの実装

以下の実装では、エラーに一意のIDを付与し、詳細なログを記録します。本番環境では、Sentryなどの外部エラートラッキングサービスに通知を送信し、データベースにもログを保存します。これにより、問題の追跡と分析が容易になります。

```typescript
// src/hooks.server.ts
import type { HandleServerError } from '@sveltejs/kit';
import { dev } from '$app/environment';

export const handleError: HandleServerError = async ({
  error,
  event,
  status,
  message,
}) => {
  // エラーID生成
  const errorId = crypto.randomUUID();

  // エラーログ記録
  const errorLog = {
    id: errorId,
    timestamp: new Date().toISOString(),
    status,
    message,
    url: event.url.toString(),
    method: event.request.method,
    userAgent: event.request.headers.get('user-agent'),
    userId: event.locals.user?.id,
    error:
      error instanceof Error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : error,
  };

  // コンソールにログ出力
  console.error('🚨 Server Error:', errorLog);

  // 本番環境では外部サービスに通知
  if (!dev) {
    await sendErrorNotification(errorLog);
    await logToDatabase(errorLog);
  }

  // クライアントに返すエラー情報
  return {
    message: dev ? message : 'Internal Server Error',
    errorId,
    timestamp: new Date().toISOString(),
  };
};

// エラー通知サービス
async function sendErrorNotification(errorLog: any) {
  try {
    // Sentryやその他のエラートラッキングサービスに送信
    await fetch('https://sentry.io/api/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `DSN ${process.env.SENTRY_DSN}`,
      },
      body: JSON.stringify(errorLog),
    });
  } catch (e) {
    console.error('エラー通知の送信に失敗:', e);
  }
}

// データベースへのログ記録
async function logToDatabase(errorLog: any) {
  try {
    await db.errorLog.create({
      data: errorLog,
    });
  } catch (e) {
    console.error('エラーログの保存に失敗:', e);
  }
}
```

## handleValidationError Hook

`handleValidationError`フックは、[Remote Functions](/sveltekit/server/remote-functions/)の引数バリデーションが失敗した際に呼び出されます。デフォルトでは `400 Bad Request` が返されますが、このフックでレスポンスをカスタマイズできます。

バリデーション失敗の主な原因は、デプロイ間のバージョン不一致（ユーザーが古いクライアントコードを実行している場合）や、不正なリクエスト（攻撃的なリクエスト）です。

```typescript
// src/hooks.server.ts
import type { HandleValidationError } from '@sveltejs/kit';

export const handleValidationError: HandleValidationError = ({
  event,
  issues,
}) => {
  // issuesにはStandard Schemaのバリデーションエラー情報が含まれる
  console.warn('バリデーションエラー:', {
    path: event.url.pathname,
    ip: event.getClientAddress(),
    issues: issues.map((i) => i.message),
  });

  // App.Error型のオブジェクトを返す
  return {
    message: '不正なリクエストです',
  };
};
```

<Admonition type="tip" title="handleError との違い">
`handleError` はアプリケーション内の**未処理エラー**（予期しないエラー）を処理します。一方、`handleValidationError` はRemote Functionsへの**バリデーション失敗**（400エラー）を処理します。両者は独立したフックで、それぞれ異なるエラーカテゴリを担当します。

</Admonition>

## 実践的な例

Hooksの実践的な使用例を紹介します。これらのパターンは、実際のプロダクション環境で広く使用されています。

### レート制限の実装

レート制限は、APIの過負荷やDDoS攻撃を防ぐための重要なセキュリティ対策です。IPアドレスごとにリクエスト回数を制限し、制限を超えた場合は429ステータスコードを返します。

この実装では、`limiter`ライブラリを使用してトークンバケット方式のレート制限を実現しています。レスポンスヘッダーには、残りのリクエスト数とリセット時刻を含めることで、クライアントが適切に対応できるようにしています。

```typescript
// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit';
import { RateLimiter } from 'limiter';

// IPアドレスごとのレート制限
const limiters = new Map<string, RateLimiter>();

const rateLimitHandle: Handle = async ({ event, resolve }) => {
  const ip = event.getClientAddress();

  // レート制限の設定（1分間に60リクエストまで）
  if (!limiters.has(ip)) {
    limiters.set(
      ip,
      new RateLimiter({
        tokensPerInterval: 60,
        interval: 'minute',
        fireImmediately: true,
      }),
    );
  }

  const limiter = limiters.get(ip)!;

  // トークンが利用可能か確認
  const remainingRequests = await limiter.removeTokens(1);
  if (remainingRequests < 0) {
    return new Response('Too Many Requests', {
      status: 429,
      headers: {
        'Retry-After': '60',
      },
    });
  }

  const response = await resolve(event);

  // レート制限情報をヘッダーに追加
  response.headers.set('X-RateLimit-Limit', '60');
  response.headers.set('X-RateLimit-Remaining', String(remainingRequests));
  response.headers.set('X-RateLimit-Reset', String(Date.now() + 60000));

  return response;
};
```

### 国際化（i18n）の実装

多言語対応は、グローバルなWebアプリケーションには不可欠です。Hooksを使用することで、ユーザーの言語設定を自動的に検出し、適切なロケールを設定できます。

この実装では、3つの情報源から言語設定を取得します：URLパラメータ（最優先）、Cookie（2番目）、Accept-Languageヘッダー（最後）。検出した言語は`event.locals`に保存され、すべてのページとAPIルートでアクセス可能になります。

```typescript
// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit';

const i18nHandle: Handle = async ({ event, resolve }) => {
  // 言語設定の優先順位
  // 1. URLパラメータ
  // 2. Cookie
  // 3. Accept-Languageヘッダー

  let locale =
    event.url.searchParams.get('lang') ||
    event.cookies.get('locale') ||
    parseAcceptLanguage(event.request.headers.get('accept-language'));

  // サポートされている言語
  const supportedLocales = ['ja', 'en', 'zh'];
  if (!supportedLocales.includes(locale)) {
    locale = 'ja'; // デフォルト
  }

  // localeをlocalsに設定
  event.locals.locale = locale;

  // URLを変換（/en/about -> /about）
  const segments = event.url.pathname.split('/');
  if (supportedLocales.includes(segments[1])) {
    segments.splice(1, 1);
    event.url.pathname = segments.join('/') || '/';
  }

  const response = await resolve(event, {
    transformPageChunk: ({ html }) => {
      // HTMLのlang属性を設定
      return html.replace('<html', `<html lang="${locale}"`);
    },
  });

  // 言語設定をCookieに保存
  response.headers.set(
    'Set-Cookie',
    `locale=${locale}; Path=/; Max-Age=31536000`,
  );

  return response;
};

function parseAcceptLanguage(header: string | null): string {
  if (!header) return 'ja';

  const languages = header.split(',').map((lang) => {
    const [locale, q = '1'] = lang.trim().split(';q=');
    return { locale: locale.split('-')[0], quality: parseFloat(q) };
  });

  languages.sort((a, b) => b.quality - a.quality);
  return languages[0]?.locale || 'ja';
}
```

### メンテナンスモード

システムのメンテナンス時に、一般ユーザーのアクセスを制限しながら、管理者はアクセス可能にする機能です。環境変数でメンテナンスモードを切り替えることで、アプリケーションを再デプロイすることなく、メンテナンスページを表示できます。

この実装では、管理者と静的ファイルのアクセスは許可し、APIは503エラーを返し、通常のページには美しいメンテナンスページを表示します。

```typescript
// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit';
import { dev } from '$app/environment';

const maintenanceHandle: Handle = async ({ event, resolve }) => {
  // メンテナンスモードのチェック
  const isMaintenanceMode = process.env.MAINTENANCE_MODE === 'true';

  if (isMaintenanceMode && !dev) {
    // 管理者は除外
    const isAdmin = event.locals.user?.role === 'admin';

    // 静的ファイルは許可
    const isStaticFile = event.url.pathname.startsWith('/static');

    // APIは503を返す
    const isApi = event.url.pathname.startsWith('/api');

    if (!isAdmin && !isStaticFile) {
      if (isApi) {
        return new Response(
          JSON.stringify({
            error: 'Service Unavailable',
            message: 'メンテナンス中です',
          }),
          {
            status: 503,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': '3600',
            },
          },
        );
      }

      // メンテナンスページを表示
      return new Response(getMaintenanceHTML(), {
        status: 503,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Retry-After': '3600',
        },
      });
    }
  }

  return resolve(event);
};

function getMaintenanceHTML() {
  return `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>メンテナンス中</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    .container {
      text-align: center;
      padding: 2rem;
    }
    h1 { font-size: 3rem; margin-bottom: 1rem; }
    p { font-size: 1.2rem; opacity: 0.9; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🔧</h1>
    <h1>メンテナンス中</h1>
    <p>システムメンテナンスを実施しています</p>
    <p>しばらくお待ちください</p>
  </div>
</body>
</html>
  `;
}
```

## app.d.ts の型定義

Hooksで使用するカスタム型を定義するためには、`app.d.ts`ファイルで型を拡張します。これにより、`event.locals`やエラーオブジェクトなどに型安全なプロパティを追加できます。

以下の定義により、すべてのルートで型チェックされた`locals`オブジェクトにアクセスできるようになります。

```typescript
// src/app.d.ts
/// <reference types="@sveltejs/kit" />

declare global {
  namespace App {
    interface Error {
      code?: string;
      errorId?: string;
    }

    interface Locals {
      user?: {
        id: string;
        email: string;
        name: string;
        role: 'user' | 'admin';
      };
      session?: {
        id: string;
        expiresAt: Date;
      };
      locale: string;
      requestId: string;
    }

    interface PageData {
      user?: Locals['user'];
    }

    interface Platform {
      env?: {
        KV: KVNamespace;
        DB: D1Database;
      };
    }
  }
}

export {};
```

## パフォーマンス最適化

パフォーマンスの監視と最適化は、プロダクション環境で重要です。Hooksを使用して、リクエストの処理時間やデータベースクエリの実行時間を計測できます。

### リクエストのトレーシング

この実装では、各リクエストに一意のIDを付与し、データベース処理の時間を自動的に計測します。Server-Timingヘッダーを使用することで、ブラウザの開発者ツールでパフォーマンスを可視化できます。

Proxyを使用してデータベースオブジェクトをラップすることで、すべてのクエリの実行時間を透過的に計測しています。

```typescript
// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit';

const tracingHandle: Handle = async ({ event, resolve }) => {
  // リクエストIDの生成
  const requestId = crypto.randomUUID();
  event.locals.requestId = requestId;

  // タイミング計測
  const timings: Record<string, number> = {};
  const start = performance.now();

  // データベース処理の計測
  const originalDb = globalThis.db;
  globalThis.db = new Proxy(originalDb, {
    get(target, prop) {
      const value = target[prop];
      if (typeof value === 'function') {
        return async (...args: any[]) => {
          const dbStart = performance.now();
          const result = await value.apply(target, args);
          timings[`db.${String(prop)}`] = performance.now() - dbStart;
          return result;
        };
      }
      return value;
    },
  });

  const response = await resolve(event);

  // Server-Timingヘッダーの追加
  const totalTime = performance.now() - start;
  const serverTiming = Object.entries(timings)
    .map(([name, time]) => `${name};dur=${time.toFixed(2)}`)
    .concat([`total;dur=${totalTime.toFixed(2)}`])
    .join(', ');

  response.headers.set('Server-Timing', serverTiming);
  response.headers.set('X-Request-Id', requestId);

  return response;
};
```

## まとめ

SvelteKitのHooksは、アプリケーション全体に影響する横断的関心事を効率的に管理する強力な仕組みです。

- **強力**: アプリケーション全体の動作をカスタマイズ
- **柔軟**: 複数のHooksを組み合わせて使用可能
- **型安全**: TypeScriptによる完全な型サポート
- **効率的**: パフォーマンスへの影響を最小限に
- **保守的**: 責務の分離により、コードの可読性と保守性が向上

`handle`、`handleFetch`、`handleError`、`handleValidationError`の4つのHooksを適切に組み合わせることで、認証、ログ、セキュリティ、国際化、エラー処理など、エンタープライズグレードのWebアプリケーションに必要な機能をすべて実装できます。

Hooksは、Express.jsのミドルウェアやASP.NET Coreのミドルウェアパイプラインと同様の概念ですが、SvelteKitの型安全性と統合されており、より堅牢な開発体験を提供します。

## 次のステップ

- [認証・認可](/sveltekit/application/authentication/)で、Hooksを使った認証システムの実装を学びましょう
- [デプロイ・運用編](/sveltekit/deployment/)で、本番環境でのHooks活用を習得しましょう
