---
title: データフェッチング戦略
description: SvelteKitの高度なデータ取得戦略 - ストリーミングSSR、並列データ取得、キャッシング、TypeScriptによるリアルタイム更新の実装方法
---

<script>
  import { base } from '$app/paths';
  import Mermaid from '$lib/components/Mermaid.svelte';
  
  const streamingSSRDiagram = `sequenceDiagram
    participant User as ユーザー
    participant Browser as ブラウザ
    participant Server as SvelteKitサーバー
    participant DB1 as 高速DB/Cache
    participant DB2 as 低速DB/API
    
    User->>Browser: ページアクセス
    Browser->>Server: HTTPリクエスト
    
    Note over Server: Load関数実行開始
    
    par クリティカルデータ取得
        Server->>DB1: 重要データ取得
        DB1-->>Server: 即座に返却
    and ストリーミングデータ
        Server->>DB2: 追加データ取得（Promise）
        Note right of DB2: 処理継続中...
    end
    
    Server-->>Browser: HTML + クリティカルデータ
    Browser->>User: 初期コンテンツ表示
    
    Note over User: ユーザーは既にコンテンツを閲覧可能
    
    DB2-->>Server: 追加データ取得完了
    Server-->>Browser: ストリーミングデータ送信
    Browser->>Browser: DOMを更新
    Browser->>User: 完全なページ表示`;
    
  const parallelFetchingDiagram = `sequenceDiagram
    participant Client as クライアント
    participant Server as サーバー
    participant API1 as ユーザーAPI
    participant API2 as 投稿API
    participant API3 as コメントAPI
    
    Note over Client,API3: 並列データ取得パターン
    
    Client->>Server: Load関数実行
    
    par 並列リクエスト
        Server->>API1: ユーザー情報取得
        API1-->>Server: ユーザーデータ
    and
        Server->>API2: 投稿一覧取得
        API2-->>Server: 投稿データ
    and
        Server->>API3: コメント取得
        API3-->>Server: コメントデータ
    end
    
    Note over Server: Promise.all()で待機
    Server->>Server: 全データ統合
    Server-->>Client: 統合データ返却
    
    rect rgba(34, 197, 94, 0.1)
        Note over Client,API3: 最も遅いAPIの時間で完了
    end`;
    
  const cachingStrategyDiagram = `sequenceDiagram
    participant User as ユーザー
    participant Browser as ブラウザ
    participant Server as サーバー
    participant Cache as メモリキャッシュ
    participant DB as データベース
    
    User->>Browser: ページアクセス（1回目）
    Browser->>Server: データリクエスト
    Server->>Cache: キャッシュ確認
    Cache-->>Server: キャッシュなし
    Server->>DB: データ取得
    DB-->>Server: データ返却
    Server->>Cache: キャッシュに保存
    Server-->>Browser: データ送信
    Browser->>User: ページ表示
    
    Note over User,DB: 5分後（キャッシュ有効期間内）
    
    User->>Browser: ページアクセス（2回目）
    Browser->>Server: データリクエスト
    Server->>Cache: キャッシュ確認
    Cache-->>Server: キャッシュヒット！
    Server-->>Browser: キャッシュデータ送信
    Browser->>User: ページ表示（高速）
    
    rect rgba(59, 130, 246, 0.1)
        Note over DB: DBアクセスなし
    end`;
    
  const realtimeUpdateDiagram = `sequenceDiagram
    participant User as ユーザー
    participant Browser as ブラウザ
    participant Server as サーバー
    participant EventSource as SSEストリーム
    
    User->>Browser: ページ表示
    Browser->>Server: SSE接続確立
    Server->>EventSource: ストリーム作成
    EventSource-->>Browser: 接続確立
    
    loop 1秒ごと
        Server->>EventSource: データプッシュ
        EventSource-->>Browser: data: {時刻データ}
        Browser->>Browser: UIを更新
        Browser->>User: リアルタイム表示
    end
    
    User->>Browser: ページ離脱
    Browser->>EventSource: 接続クローズ
    EventSource-->>Server: ストリーム終了`;
    
  const conditionalFetchingDiagram = `sequenceDiagram
    participant User as ユーザー
    participant Browser as ブラウザ
    participant Server as サーバー
    participant Auth as 認証システム
    participant PublicDB as 公開DB
    participant PrivateDB as 個人DB
    
    User->>Browser: ページアクセス
    Browser->>Server: リクエスト（Cookie付き）
    
    Server->>Auth: セッション検証
    
    alt 認証済みユーザー
        Auth-->>Server: ユーザー情報
        par 認証済みデータ取得
            Server->>PublicDB: 公開データ取得
            PublicDB-->>Server: 公開データ
        and
            Server->>PrivateDB: 個人データ取得
            PrivateDB-->>Server: プロフィール・設定
        end
        Server-->>Browser: 完全データセット
    else 未認証ユーザー
        Auth-->>Server: null
        Server->>PublicDB: 公開データのみ取得
        PublicDB-->>Server: 公開データ
        Server-->>Browser: 制限付きデータ
    end
    
    Browser->>User: ページ表示`;
    
  const errorHandlingDiagram = `sequenceDiagram
    participant Client as クライアント
    participant Server as サーバー
    participant MainAPI as メインAPI
    participant OptAPI as オプションAPI
    participant RecAPI as レコメンドAPI
    
    Client->>Server: Load関数実行
    
    Note over Server: Promise.allSettled()使用
    
    par 複数API呼び出し
        Server->>MainAPI: 必須データ取得
        MainAPI-->>Server: ✅ 成功
    and
        Server->>OptAPI: オプションデータ取得
        OptAPI--xServer: ❌ エラー
    and
        Server->>RecAPI: レコメンド取得
        RecAPI-->>Server: ✅ 成功
    end
    
    Server->>Server: 結果を処理
    Note over Server: 成功: メイン、レコメンド<br/>失敗: オプション（フォールバック使用）
    
    Server-->>Client: 部分的成功データ
    Client->>Client: 利用可能なデータで表示
    
    rect rgba(220, 38, 127, 0.1)
        Note over Client: 完全失敗を回避
    end`;
</script>

パフォーマンスを最大化するための高度なデータフェッチング戦略を学びます。

## ストリーミングSSR

大量のデータを段階的に送信することで、初期表示を高速化します。ストリーミングSSRは、重要なコンテンツを即座に表示し、残りのデータを非同期で送信する技術です。これにより、ユーザーは完全にページが読み込まれるのを待つことなく、コンテンツの閲覧を開始できます。

<Mermaid diagram={streamingSSRDiagram} />

### 基本的なストリーミング

SvelteKitでは、Load関数からPromiseを返すことで自動的にストリーミングが有効になります。クリティカルなデータは即座に返し、時間のかかるデータはPromiseとして返すことで、段階的なレンダリングを実現します。

```typescript
// +page.server.ts
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  // 即座に返すデータ
  const criticalData = await getCriticalData();
  
  // ストリーミングで後から送信
  const slowDataPromise = getSlowData();
  
  return {
    critical: criticalData,
    streamed: {
      slow: slowDataPromise // Promiseのまま返す
    }
  };
};
```

### コンポーネントでの使用

ストリーミングされたデータは、Svelteの`{#await}`ブロックを使って扱います。これにより、データの読み込み状態に応じて、ローディング表示、成功時の表示、エラー時の表示を簡単に切り替えることができます。

```svelte
<!-- +page.svelte -->
<script lang="ts">
  import type { PageData } from './$types';
  export let data: PageData;
</script>

<!-- 即座に表示 -->
<h1>{data.critical.title}</h1>

<!-- ストリーミングデータの表示 -->
{#await data.streamed.slow}
  <p>読み込み中...</p>
{:then slowData}
  <div>
    {#each slowData.items as item}
      <p>{item.name}</p>
    {/each}
  </div>
{:catch error}
  <p>エラー: {error.message}</p>
{/await}
```

## パフォーマンスのヒント

効率的なデータ取得のための重要なテクニックを紹介します。

### 並列データ取得の重要性

複数のデータソースから情報を取得する際は、並列処理を活用することで大幅にパフォーマンスを改善できます。

```typescript
// ❌ 悪い例：順次実行（遅い）
const user = await fetch('/api/user').then(r => r.json());
const posts = await fetch('/api/posts').then(r => r.json());
const comments = await fetch('/api/comments').then(r => r.json());
// 合計時間 = user取得時間 + posts取得時間 + comments取得時間

// ✅ 良い例：並列実行（速い）
const [user, posts, comments] = await Promise.all([
  fetch('/api/user').then(r => r.json()),
  fetch('/api/posts').then(r => r.json()),
  fetch('/api/comments').then(r => r.json())
]);
// 合計時間 = 最も遅いリクエストの時間のみ
```

### ストリーミングSSRによる体感速度向上

重要なデータを先に返し、時間のかかるデータは後から送信することで、ユーザーの体感速度を向上させます。

```typescript
// +page.server.ts
export const load: PageServerLoad = async () => {
  return {
    // 即座に返すデータ（クリティカルパス）
    critical: await getCriticalData(),
    
    // ストリーミングで後から送信（非クリティカル）
    streamed: {
      slow: getSlowData() // Promiseのまま返す
    }
  };
};
```

## 並列データ取得パターン

複数のデータソースから情報を取得する場合、適切な並列処理戦略を選択することで、大幅なパフォーマンス向上を実現できます。このセクションでは、実践的な並列データ取得のパターンを紹介します。

<Mermaid diagram={parallelFetchingDiagram} />

### Promise.allを使った最適化

`Promise.all()`を使用することで、複数の非同期処理を同時に実行し、すべての処理が完了するのを待つことができます。これは、独立したデータを取得する際の最も基本的で効果的なパターンです。

```typescript
// +page.ts
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params }) => {
  // 複数のAPIエンドポイントから並列でデータ取得
  const [user, posts, comments] = await Promise.all([
    fetch(`/api/users/${params.id}`).then(r => r.json()),
    fetch(`/api/users/${params.id}/posts`).then(r => r.json()),
    fetch(`/api/users/${params.id}/comments`).then(r => r.json())
  ]);
  
  return {
    user,
    posts,
    comments
  };
};
```

### 依存関係がある場合の最適化

データ間に依存関係がある場合でも、可能な限り並列処理を活用できます。必要最小限のデータを先に取得し、その結果を使って残りのデータを並列で取得するパターンです。

```typescript
export const load: PageLoad = async ({ fetch, params }) => {
  // ユーザー情報を先に取得
  const user = await fetch(`/api/users/${params.id}`).then(r => r.json());
  
  // ユーザーの情報に基づいて並列取得
  const [posts, followers] = await Promise.all([
    fetch(`/api/posts?author=${user.id}`).then(r => r.json()),
    fetch(`/api/users/${user.id}/followers`).then(r => r.json())
  ]);
  
  return {
    user,
    posts,
    followers
  };
};
```

## キャッシング戦略

適切なキャッシング戦略により、不要なネットワークリクエストを削減し、アプリケーションのパフォーマンスを大幅に向上させることができます。キャッシングは、ブラウザレベル、メモリレベル、そしてCDNレベルで実装できます。

<Mermaid diagram={cachingStrategyDiagram} />

### ブラウザキャッシュの活用

HTTPヘッダーを適切に設定することで、ブラウザの組み込みキャッシュ機能を活用できます。静的なデータには長いキャッシュ期間を設定し、動的なデータには短い期間またはキャッシュ無効を設定します。

```typescript
export const load: PageLoad = async ({ fetch }) => {
  // キャッシュを活用
  const staticData = await fetch('/api/static-data', {
    headers: {
      'Cache-Control': 'max-age=3600' // 1時間キャッシュ
    }
  }).then(r => r.json());
  
  // 常に最新データを取得
  const dynamicData = await fetch('/api/dynamic-data', {
    cache: 'no-store'
  }).then(r => r.json());
  
  return {
    staticData,
    dynamicData
  };
};
```

### メモリキャッシュの実装

サーバーサイドでメモリキャッシュを実装することで、データベースへのアクセスを削減し、レスポンス時間を短縮できます。以下は、シンプルなTTL（Time To Live）ベースのキャッシュ実装例です。

```typescript
// lib/cache.ts
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5分

export async function getCachedData<T>(
  key: string,
  fetcher: () => Promise<T>
): Promise<T> {
  const cached = cache.get(key);
  const now = Date.now();
  
  if (cached && now - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  
  const data = await fetcher();
  cache.set(key, { data, timestamp: now });
  
  return data;
}
```

上記のキャッシュユーティリティを使用して、頻繁にアクセスされるが更新頻度の低いデータをキャッシュします。

```typescript
// +page.server.ts
import { getCachedData } from '$lib/cache';

export const load: PageServerLoad = async () => {
  const data = await getCachedData('popular-posts', async () => {
    return await db.post.findMany({
      where: { popular: true },
      take: 10
    });
  });
  
  return { posts: data };
};
```

## リアルタイム更新

リアルタイムでデータを更新する機能は、現代的なWebアプリケーションに欠かせません。SvelteKitは、invalidate関数やServer-Sent Events（SSE）、WebSocketなど、様々なリアルタイム更新の手法をサポートしています。

<Mermaid diagram={realtimeUpdateDiagram} />

### invalidateを使った更新

`invalidate`関数を使用すると、特定のURLに関連するLoad関数を再実行できます。これは、定期的なデータ更新や、ユーザーアクションに応じたデータの再取得に適しています。

```typescript
// +page.svelte
<script lang="ts">
  import { invalidate } from '$app/navigation';
  import { onMount } from 'svelte';
  
  export let data;
  
  onMount(() => {
    // 30秒ごとにデータを更新
    const interval = setInterval(() => {
      invalidate('/api/live-data');
    }, 30000);
    
    return () => clearInterval(interval);
  });
</script>
```

### Server-Sent Events (SSE)

Server-Sent Events（SSE）は、サーバーからクライアントへの単方向リアルタイム通信を実現する技術です。WebSocketよりもシンプルで、HTTPプロトコル上で動作するため、ファイアウォールやプロキシの問題が少ないという利点があります。

```typescript
// +server.ts (APIエンドポイント)
import type { RequestHandler } from './$types';

export const GET: RequestHandler = () => {
  const stream = new ReadableStream({
    start(controller) {
      const interval = setInterval(() => {
        const data = JSON.stringify({ 
          time: new Date().toISOString() 
        });
        controller.enqueue(`data: ${data}\n\n`);
      }, 1000);
      
      return () => clearInterval(interval);
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

クライアント側では、`EventSource` APIを使ってSSEストリームに接続し、リアルタイムでデータを受信します。

```svelte
<!-- +page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  
  let data = $state<any>(null);
  
  onMount(() => {
    const eventSource = new EventSource('/api/stream');
    
    eventSource.onmessage = (event) => {
      data = JSON.parse(event.data);
    };
    
    return () => eventSource.close();
  });
</script>
```

## 条件付きフェッチング

条件付きフェッチングは、ユーザーの状態、デバイス、権限などに基づいて、取得するデータを動的に変更する技術です。これにより、必要なデータのみを効率的に取得し、パフォーマンスとユーザー体験を最適化できます。

<Mermaid diagram={conditionalFetchingDiagram} />

### 認証に基づくデータ取得

ユーザーの認証状態に応じて、異なるデータセットを返します。未認証ユーザーには公開情報のみ、認証済みユーザーには追加の個人情報を提供するパターンです。

```typescript
// +page.server.ts
export const load: PageServerLoad = async ({ locals }) => {
  const baseData = await getPublicData();
  
  if (!locals.user) {
    return { ...baseData, user: null };
  }
  
  // 認証済みユーザー向けの追加データ
  const [profile, preferences] = await Promise.all([
    getUserProfile(locals.user.id),
    getUserPreferences(locals.user.id)
  ]);
  
  return {
    ...baseData,
    user: locals.user,
    profile,
    preferences
  };
};
```

### デバイスに応じた最適化

User-Agentヘッダーを解析して、デバイスの種類を判定し、それに応じて異なるデータ量や品質を提供します。モバイルデバイスには軽量版、デスクトップには詳細版を提供することで、最適なユーザー体験を実現します。

```typescript
export const load: PageServerLoad = async ({ request }) => {
  const userAgent = request.headers.get('user-agent') || '';
  const isMobile = /mobile/i.test(userAgent);
  
  if (isMobile) {
    // モバイル向け軽量データ
    return {
      items: await getLightweightData()
    };
  }
  
  // デスクトップ向け詳細データ
  return {
    items: await getDetailedData()
  };
};
```

## エラー境界とフォールバック

堅牢なアプリケーションを構築するには、エラーを適切に処理し、部分的な失敗に対してもユーザーに価値を提供できるようにすることが重要です。SvelteKitは、様々なレベルでエラーを処理する仕組みを提供しています。

<Mermaid diagram={errorHandlingDiagram} />

### 部分的エラーの処理

`Promise.allSettled()`を使用することで、複数の非同期処理のうち一部が失敗しても、成功した処理の結果を取得できます。これにより、完全な失敗を避け、利用可能なデータでページを表示できます。

```typescript
export const load: PageLoad = async ({ fetch }) => {
  const results = await Promise.allSettled([
    fetch('/api/main-data').then(r => r.json()),
    fetch('/api/optional-data').then(r => r.json()),
    fetch('/api/recommendations').then(r => r.json())
  ]);
  
  return {
    mainData: results[0].status === 'fulfilled' 
      ? results[0].value 
      : null,
    optionalData: results[1].status === 'fulfilled'
      ? results[1].value
      : { fallback: true },
    recommendations: results[2].status === 'fulfilled'
      ? results[2].value
      : []
  };
};
```

## パフォーマンス監視

パフォーマンスの継続的な監視は、アプリケーションの品質を維持するために不可欠です。問題を早期に発見し、ユーザー体験の劣化を防ぐことができます。

### タイミング測定

`performance.now()`を使用して、データ取得にかかった時間を正確に測定します。これにより、パフォーマンスのボトルネックを特定し、最適化の対象を明確にできます。

```typescript
export const load: PageLoad = async ({ fetch }) => {
  const start = performance.now();
  
  const data = await fetch('/api/data').then(r => r.json());
  
  const duration = performance.now() - start;
  
  // パフォーマンスログ
  if (duration > 1000) {
    console.warn(`Slow request: ${duration}ms`);
  }
  
  return { data };
};
```

## ベストプラクティス

1. **重要なデータを優先**
   - クリティカルなデータは即座に返す
   - 補足的なデータはストリーミング

2. **並列処理を最大活用**
   - 独立したデータは`Promise.all()`で同時取得

3. **適切なキャッシュ戦略**
   - 静的データは積極的にキャッシュ
   - 動的データは必要に応じて無効化

4. **エラーに備える**
   - `Promise.allSettled()`で部分的エラーに対応
   - フォールバックデータを用意

## 次のステップ

- [フォーム処理とActions](../../server/forms/) - データの送信と処理
- [WebSocket/SSE](../../server/websocket-sse/) - リアルタイム通信の実装
- [アーキテクチャ詳解](../../architecture/) - SvelteKitの内部動作を深く理解