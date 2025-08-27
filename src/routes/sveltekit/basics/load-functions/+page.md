---
title: Load関数とデータフェッチング
description: SvelteKitのデータ取得戦略を完全マスター - Universal/Server Load、ストリーミング、キャッシュ戦略まで
---

SvelteKitのLoad関数は、ページレンダリング前にデータを取得する強力な仕組みです。Universal LoadとServer Loadの使い分け、並列データ取得、ストリーミングSSR、エラーハンドリングまで、実践的なTypeScriptコード例で完全解説します。

## Load関数の基本

### Universal Load vs Server Load

SvelteKitには2種類のLoad関数があります。

| | Universal Load (`+page.ts`) | Server Load (`+page.server.ts`) |
|---|---|---|
| **実行環境** | サーバー＆クライアント | サーバーのみ |
| **用途** | 公開APIからのデータ取得 | DB接続、秘密情報の扱い |
| **返り値** | シリアライズ可能な値 | あらゆる値（Dateオブジェクト等も可） |
| **アクセス可能** | fetch、params、url等 | cookies、locals、platform等も追加 |

### Universal Load の実装

```typescript
// src/routes/blog/[slug]/+page.ts
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, fetch }) => {
  // SvelteKitが提供する特別なfetch関数を使用
  // - SSR時はサーバー内部で直接実行
  // - CSR時は通常のfetch
  const response = await fetch(`/api/posts/${params.slug}`);
  
  if (!response.ok) {
    throw error(response.status, 'Post not found');
  }
  
  const post = await response.json();
  
  return {
    post
  };
};
```

### Server Load の実装

```typescript
// src/routes/dashboard/+page.server.ts
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/database';

export const load: PageServerLoad = async ({ locals, cookies }) => {
  // サーバーのみで実行される
  const sessionId = cookies.get('session');
  
  if (!sessionId) {
    throw redirect(303, '/login');
  }
  
  // データベースに直接アクセス
  const user = await db.user.findUnique({
    where: { sessionId }
  });
  
  const stats = await db.stats.findMany({
    where: { userId: user.id }
  });
  
  // Dateオブジェクトなども直接返せる
  return {
    user,
    stats,
    lastUpdated: new Date()
  };
};
```

## 型安全なデータ取得

### 自動生成される型定義

SvelteKitは`$types`を自動生成し、完全な型安全性を提供

```typescript
// src/routes/products/[id]/+page.ts
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, url, fetch }) => {
  // params.id は自動的に string 型
  const productId = params.id;
  
  // URLSearchParamsも型安全
  const variant = url.searchParams.get('variant');
  
  const product = await fetch(`/api/products/${productId}`).then(r => r.json());
  
  return {
    product,
    variant
  };
};
```

```svelte
<!-- src/routes/products/[id]/+page.svelte -->
<script lang="ts">
  import type { PageData } from './$types';
  
  // data.product と data.variant が自動的に型付け
  export let data: PageData;
</script>

<h1>{data.product.name}</h1>
{#if data.variant}
  <p>選択中: {data.variant}</p>
{/if}
```

## 並列データ取得

### Promise.all を使った並列取得

```typescript
// src/routes/dashboard/+page.ts
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
  // 複数のAPIを並列で呼び出し
  const [user, posts, notifications, analytics] = await Promise.all([
    fetch('/api/user').then(r => r.json()),
    fetch('/api/posts?limit=10').then(r => r.json()),
    fetch('/api/notifications').then(r => r.json()),
    fetch('/api/analytics/summary').then(r => r.json())
  ]);
  
  return {
    user,
    posts,
    notifications,
    analytics
  };
};
```

### エラー処理付き並列取得

```typescript
// src/routes/feed/+page.ts
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
  // エラーが発生してもページ全体をクラッシュさせない
  const results = await Promise.allSettled([
    fetch('/api/feed').then(r => r.json()),
    fetch('/api/trending').then(r => r.json()),
    fetch('/api/recommendations').then(r => r.json())
  ]);
  
  return {
    feed: results[0].status === 'fulfilled' ? results[0].value : [],
    trending: results[1].status === 'fulfilled' ? results[1].value : [],
    recommendations: results[2].status === 'fulfilled' ? results[2].value : []
  };
};
```

## データの依存関係

### parent()を使った親データへのアクセス

```typescript
// src/routes/+layout.server.ts
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
  const user = await locals.getUser();
  
  return {
    user
  };
};
```

```typescript
// src/routes/profile/+page.ts
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent, fetch }) => {
  // 親レイアウトのデータを取得
  const { user } = await parent();
  
  if (!user) {
    throw redirect(303, '/login');
  }
  
  // userデータに基づいて追加データを取得
  const profile = await fetch(`/api/users/${user.id}/profile`).then(r => r.json());
  
  return {
    profile
  };
};
```

### depends と invalidate

```typescript
// src/routes/notifications/+page.ts
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, depends }) => {
  // この依存関係を登録
  depends('app:notifications');
  
  const notifications = await fetch('/api/notifications').then(r => r.json());
  
  return {
    notifications
  };
};
```

```svelte
<!-- src/routes/notifications/+page.svelte -->
<script lang="ts">
  import { invalidate } from '$app/navigation';
  import type { PageData } from './$types';
  
  export let data: PageData;
  
  async function markAsRead(id: string) {
    await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
    
    // 'app:notifications'に依存するデータを再取得
    await invalidate('app:notifications');
  }
</script>
```

## ストリーミングSSR

### 基本的なストリーミング

```typescript
// src/routes/feed/+page.server.ts
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
  // 即座に返すデータ
  const user = await fetch('/api/user').then(r => r.json());
  
  // ストリーミングで後から送信するデータ
  const posts = fetch('/api/posts?limit=50')
    .then(r => r.json())
    .catch(() => []); // エラー時のフォールバック
  
  const recommendations = fetch('/api/recommendations')
    .then(r => r.json())
    .catch(() => []);
  
  return {
    user, // 即座に利用可能
    streamed: {
      posts,          // Promiseとして後から解決
      recommendations // Promiseとして後から解決
    }
  };
};
```

```svelte
<!-- src/routes/feed/+page.svelte -->
<script lang="ts">
  import type { PageData } from './$types';
  
  export let data: PageData;
</script>

<h1>Welcome, {data.user.name}!</h1>

{#await data.streamed.posts}
  <p>投稿を読み込み中...</p>
{:then posts}
  <section>
    <h2>最新の投稿</h2>
    {#each posts as post}
      <article>{post.title}</article>
    {/each}
  </section>
{:catch error}
  <p>投稿の読み込みに失敗しました</p>
{/await}
```

### 段階的なデータ表示

```typescript
// src/routes/analytics/+page.server.ts
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
  // 優先度順にデータを取得
  const summary = await fetch('/api/analytics/summary').then(r => r.json());
  
  // 重いクエリは非同期で
  const detailedStats = fetch('/api/analytics/detailed')
    .then(r => r.json());
  
  const historicalData = fetch('/api/analytics/history')
    .then(r => r.json());
  
  return {
    summary, // すぐ表示
    streamed: {
      detailedStats,  // 後から表示
      historicalData  // さらに後から表示
    }
  };
};
```

## エラーハンドリング

### 構造化されたエラー処理

```typescript
// src/routes/posts/[id]/+page.ts
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, fetch }) => {
  try {
    const response = await fetch(`/api/posts/${params.id}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw error(404, {
          message: '記事が見つかりません',
          code: 'POST_NOT_FOUND'
        });
      }
      
      throw error(response.status, {
        message: 'データの取得に失敗しました'
      });
    }
    
    return {
      post: await response.json()
    };
  } catch (err) {
    // ネットワークエラー等
    console.error('Load error:', err);
    throw error(500, {
      message: 'サーバーエラーが発生しました'
    });
  }
};
```

### フォールバック付きデータ取得

```typescript
// src/routes/products/+page.ts
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, url }) => {
  const category = url.searchParams.get('category');
  
  // メインデータの取得を試みる
  let products;
  try {
    const response = await fetch(`/api/products?category=${category}`);
    products = await response.json();
  } catch {
    // フォールバック: キャッシュまたはデフォルトデータ
    products = await getCachedProducts(category) || [];
  }
  
  return {
    products,
    fallback: products.length === 0
  };
};
```

## キャッシュ戦略

### HTTP キャッシュヘッダーの設定

```typescript
// src/routes/api/posts/+server.ts
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ setHeaders }) => {
  const posts = await fetchPosts();
  
  // キャッシュ制御
  setHeaders({
    'cache-control': 'public, max-age=3600', // 1時間キャッシュ
    'vary': 'Accept-Encoding'
  });
  
  return json(posts);
};
```

### load関数でのキャッシュ制御

```typescript
// src/routes/blog/+page.ts
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, setHeaders }) => {
  const posts = await fetch('/api/posts', {
    headers: {
      'cache-control': 'max-age=60' // 1分間キャッシュ
    }
  }).then(r => r.json());
  
  // ページ全体のキャッシュ設定
  setHeaders({
    'cache-control': 'public, max-age=300'
  });
  
  return {
    posts
  };
};
```

## リアルタイムデータ

### WebSocketとの統合

```typescript
// src/routes/chat/+page.ts
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
  // 初期データの取得
  const messages = await fetch('/api/messages').then(r => r.json());
  
  return {
    messages,
    // WebSocket接続情報
    wsUrl: import.meta.env.VITE_WS_URL || 'ws://localhost:3000'
  };
};
```

```svelte
<!-- src/routes/chat/+page.svelte -->
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import type { PageData } from './$types';
  
  export let data: PageData;
  
  let messages = $state(data.messages);
  let ws: WebSocket;
  
  onMount(() => {
    ws = new WebSocket(data.wsUrl);
    
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      messages = [...messages, message];
    };
  });
  
  onDestroy(() => {
    ws?.close();
  });
</script>
```

## 実践的なパターン

### 無限スクロール実装

```typescript
// src/routes/feed/+page.ts
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ url, fetch }) => {
  const page = Number(url.searchParams.get('page')) || 1;
  const limit = 20;
  
  const response = await fetch(`/api/posts?page=${page}&limit=${limit}`);
  const { posts, hasMore } = await response.json();
  
  return {
    posts,
    hasMore,
    nextPage: hasMore ? page + 1 : null
  };
};
```

```svelte
<!-- src/routes/feed/+page.svelte -->
<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import type { PageData } from './$types';
  
  export let data: PageData;
  
  let posts = $state(data.posts);
  let loading = $state(false);
  
  async function loadMore() {
    if (!data.nextPage || loading) return;
    
    loading = true;
    
    // URLを更新してデータを取得
    const url = new URL($page.url);
    url.searchParams.set('page', String(data.nextPage));
    
    const response = await fetch(url.pathname + url.search);
    const newData = await response.json();
    
    posts = [...posts, ...newData.posts];
    data.nextPage = newData.nextPage;
    loading = false;
  }
</script>
```

### 検索with デバウンス

```typescript
// src/routes/search/+page.ts
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ url, fetch }) => {
  const query = url.searchParams.get('q') || '';
  
  if (!query) {
    return {
      results: [],
      query: ''
    };
  }
  
  const results = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
    .then(r => r.json())
    .catch(() => []);
  
  return {
    results,
    query
  };
};
```

```svelte
<!-- src/routes/search/+page.svelte -->
<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import type { PageData } from './$types';
  
  export let data: PageData;
  
  let searchInput = $state(data.query);
  let timeoutId: number;
  
  function debounceSearch(value: string) {
    clearTimeout(timeoutId);
    
    timeoutId = setTimeout(() => {
      const url = new URL($page.url);
      
      if (value) {
        url.searchParams.set('q', value);
      } else {
        url.searchParams.delete('q');
      }
      
      goto(url, { replaceState: true, keepFocus: true });
    }, 300);
  }
  
  $effect(() => {
    if (searchInput !== data.query) {
      debounceSearch(searchInput);
    }
  });
</script>

<input 
  bind:value={searchInput} 
  placeholder="検索..."
/>
```

## パフォーマンス最適化

### 選択的なプリロード

```typescript
// src/routes/+layout.ts
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ fetch }) => {
  // 重要なデータのみ事前取得
  const criticalData = await fetch('/api/critical').then(r => r.json());
  
  return {
    critical: criticalData,
    // 遅延読み込み
    lazy: {
      async getAdditionalData() {
        return fetch('/api/additional').then(r => r.json());
      }
    }
  };
};
```

### データの重複排除

```typescript
// src/lib/cache.ts
const cache = new Map<string, Promise<any>>();

export function cachedFetch(url: string, ttl = 60000) {
  const cached = cache.get(url);
  
  if (cached) {
    return cached;
  }
  
  const promise = fetch(url).then(r => r.json());
  cache.set(url, promise);
  
  setTimeout(() => cache.delete(url), ttl);
  
  return promise;
}
```

## トラブルシューティング

:::warning[Load関数が実行されない]
- ファイル名が正しいか確認（`+page.ts`、`+page.server.ts`）
- exportが正しいか確認（`export const load`）
- 型定義が正しいか確認（`PageLoad`、`PageServerLoad`）
:::

:::tip[データが更新されない]
`invalidate`や`invalidateAll`を使用してデータを再取得
```typescript
await invalidate('app:data');
await invalidateAll(); // 全データ再取得
```
:::

:::caution[シリアライズエラー]
Universal Load（`+page.ts`）では、シリアライズ可能な値のみ返す。
- ❌ Date、Map、Set、関数
- ✅ プレーンオブジェクト、配列、プリミティブ値
:::

## まとめ

SvelteKitのLoad関数は、
- **柔軟**：Universal/Serverの使い分けが可能
- **型安全**：完全な TypeScript サポート
- **高性能**：並列取得、ストリーミングSSR対応
- **実践的**：エラー処理、キャッシュ戦略を完備

## 次のステップ

[フォーム処理とActions](/sveltekit/basics/forms/)で、インタラクティブなフォーム処理について学びましょう。