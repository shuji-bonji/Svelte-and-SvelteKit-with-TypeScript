---
title: データフェッチング戦略
description: SvelteKitの高度なデータ取得戦略 - ストリーミングSSR、並列データ取得、キャッシング、TypeScriptによるリアルタイム更新の実装方法
---

<script>
  import { base } from '$app/paths';
</script>

パフォーマンスを最大化するための高度なデータフェッチング戦略を学びます。

## ストリーミングSSR

大量のデータを段階的に送信することで、初期表示を高速化します。

### 基本的なストリーミング

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

## 並列データ取得パターン

### Promise.allを使った最適化

```typescript
// +page.ts
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params }) => {
  // ❌ 悪い例：順次実行（遅い）
  // const user = await fetch(`/api/users/${params.id}`).then(r => r.json());
  // const posts = await fetch(`/api/users/${params.id}/posts`).then(r => r.json());
  // const comments = await fetch(`/api/users/${params.id}/comments`).then(r => r.json());
  
  // ✅ 良い例：並列実行（速い）
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

### ブラウザキャッシュの活用

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

### invalidateを使った更新

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

### 認証に基づくデータ取得

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

### 部分的エラーの処理

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

### タイミング測定

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