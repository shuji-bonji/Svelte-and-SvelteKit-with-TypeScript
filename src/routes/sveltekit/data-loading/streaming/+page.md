---
title: ストリーミングSSR
description: SvelteKitのストリーミングSSR実装ガイド。awaitブロックでの段階的レンダリング、ReadableStream配信、エラー再試行やフォールバック表示、パフォーマンス測定とキャッシュ戦略をTypeScriptで具体的に解説する実践手引き。検証コマンドと落とし穴も紹介。詳しい手順とチェックリスト付き
---

<script>
  import Mermaid from '$lib/components/Mermaid.svelte';

  const generalStreamingDiagram = `sequenceDiagram
    participant User as ユーザー
    participant Browser as ブラウザ
    participant Server as サーバー
    participant DB1 as 高速DB/Cache
    participant DB2 as 低速DB/API

    User->>Browser: ページアクセス
    Browser->>Server: HTTPリクエスト

    par クリティカルデータと非クリティカルデータ
        Server->>DB1: クリティカルデータ取得
        DB1-->>Server: 即座に返却
    and
        Server->>DB2: 非クリティカルデータ（非同期）
        Note right of DB2: 処理継続中...
    end

    Server-->>Browser: 初期HTML + クリティカルデータ
    Browser->>User: 初期コンテンツ表示

    Note over User: ユーザーは既に基本コンテンツを閲覧可能

    DB2-->>Server: 非同期データ準備完了
    Server-->>Browser: ストリーミングでデータ送信
    Browser->>Browser: DOMを動的に更新
    Browser->>User: 完全なページ表示

    rect rgba(34, 197, 94, 0.1)
        Note over User,DB2: 段階的なコンテンツ表示により体感速度向上
    end`;

  const streamingSSRDiagram = `sequenceDiagram
    participant User as ユーザー
    participant Browser as ブラウザ
    participant SvelteKit as SvelteKitサーバー
    participant PageServer as +page.server.ts
    participant PageSvelte as +page.svelte
    participant CriticalAPI as 高速API/Cache
    participant SlowAPI as 低速API/DB

    User->>Browser: ページアクセス
    Browser->>SvelteKit: HTTPリクエスト
    SvelteKit->>PageServer: load関数実行

    Note over PageServer: PageServerLoad関数

    par 並列データ取得
        PageServer->>CriticalAPI: getCriticalData()
        CriticalAPI-->>PageServer: { title: "ページタイトル" }
    and
        PageServer->>SlowAPI: getSlowData()
        Note right of SlowAPI: Promise返却（待機しない）
    end

    PageServer-->>SvelteKit: { critical, streamed: { slow: Promise } }
    SvelteKit-->>Browser: 初期HTML生成
    Browser->>PageSvelte: コンポーネントマウント

    Note over PageSvelte: let { data }: { data: PageData } = $props()
    PageSvelte->>PageSvelte: criticalデータ即座に表示
    Browser->>User: <h1>{data.critical.title}</h1> 表示

    Note over PageSvelte: await data.streamed.slow (awaitブロック)
    PageSvelte->>Browser: ローディング表示
    Browser->>User: "読み込み中..." 表示

    SlowAPI-->>PageServer: { items: [...] }
    PageServer-->>SvelteKit: Promiseが解決
    SvelteKit-->>Browser: ストリーミングデータ送信
    Browser->>PageSvelte: Promiseが解決

    Note over PageSvelte: then slowData (thenブロック)
    PageSvelte->>PageSvelte: slowDataをレンダリング
    Browser->>User: 完全なコンテンツ表示

    rect rgba(34, 197, 94, 0.1)
        Note over User: ユーザーは最初から基本コンテンツを見られる
    end`;

  const streamingArchitecture = `graph LR
    subgraph "ストリーミングSSRの仕組み"
        A[ブラウザリクエスト] --> B{Load関数実行}

        B --> C[クリティカルデータ]
        B --> D[非同期データ（Promise）]

        C --> E[即座に返却]
        D --> F[Promiseのまま返却]

        E --> G[初期HTMLレンダリング]
        F --> G

        G --> H[ブラウザに送信]

        H --> I[クリティカル部分表示]
        H --> J["{#await}ブロック待機"]

        K[非同期処理完了] --> L[Promise解決]
        L --> M[ストリーミング送信]
        M --> N[DOMアップデート]

        N --> O[完全なページ表示]
    end

    style A fill:#e8f5e9,color:#000
    style O fill:#e3f2fd,color:#000
    style G fill:#fff3e0,color:#000`;

  const streamingDataFlow = `sequenceDiagram
    participant L as Load関数
    participant C as クリティカルデータ
    participant S as ストリーミングデータ
    participant D as DOM

    Note over L,D: ストリーミングSSRのデータフロー

    L->>C: await getCriticalData()
    C-->>L: データ即座に返却

    L->>S: getStreamedData() (awaitなし)
    S-->>L: Promise返却

    L->>D: return { critical, streamed }

    D->>D: critical部分を即座にレンダリング
    Note over D: ユーザーはこの時点で基本コンテンツを閲覧可能

    D->>D: await streamed.slowでローディング表示

    S-->>D: Promiseが解決
    D->>D: thenブロックでコンテンツ更新

    Note over D: 完全なページが表示される`;
</script>

ストリーミングSSRは、重要なコンテンツを即座に表示しながら、時間のかかるデータを後から段階的に送信する高度な技術です。これにより、初回表示の高速化とユーザー体験の向上を両立できます。

## ストリーミングSSRとは

**ストリーミングSSR**は、従来のSSRが全てのデータが揃うまで待機するのに対し、段階的にコンテンツを配信する技術です。

### 従来のSSRとの違い

#### 従来のSSR：すべてのデータを待つ必要がある
```typescript
// ❌ Traditional SSR: Wait for all data
export const load: PageServerLoad = async () => {
  // Screen is blank until everything is ready
  const criticalData = await getCriticalData();  // 100ms
  const slowData = await getSlowData();          // 3000ms
  return { criticalData, slowData };
  // Total: 3100ms until page displays
};
```

#### ストリーミングSSR：段階的にコンテンツを表示
```typescript
// ✅ Streaming SSR: Progressive display
export const load: PageServerLoad = async () => {
  const criticalData = await getCriticalData();  // 100ms

  return {
    critical: criticalData,  // Render immediately
    streamed: {
      slow: getSlowData()  // Return Promise (no await)
    }
  };
  // Basic content shows after 100ms,
  // Full content shows after 3000ms
};
```

**効果**: 初期表示が100msで開始（3100ms → 100ms）、体感速度が大幅に向上

### ストリーミングSSRの仕組み

<Mermaid diagram={generalStreamingDiagram} />

### SvelteKitでのストリーミングSSR動作

<Mermaid diagram={streamingSSRDiagram} />

### アーキテクチャの概要

<Mermaid diagram={streamingArchitecture} />

## 基本的な実装

### サーバーサイドの実装

Load関数からPromiseを直接返すことで、ストリーミングSSRを実現します。

#### データの分類と返却方法
- **クリティカルデータ**: `await`で待機して即座に表示（タイトル、価格、在庫状況など）
- **ストリーミングデータ**: Promiseのまま返して後から表示（レビュー、関連商品など）

```typescript
// +page.server.ts
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
  // クリティカルデータ：awaitで待機して即座に表示
  const criticalData = await fetch('/api/critical').then(r => r.json());

  return {
    // 初期HTMLに含めて即座にレンダリング
    critical: criticalData,

    // ストリーミングデータ：Promiseのまま返す
    streamed: {
      slow: fetch('/api/slow').then(r => r.json()),        // レビュー、詳細情報
      optional: fetch('/api/optional').then(r => r.json()) // 関連商品
    }
  };
};
```

### コンポーネントでの表示

Svelteの`{#await}`ブロックを使用して、ストリーミングデータを段階的に表示します。

#### 表示の3つの状態
1. **即座表示**: クリティカルデータ（既に解決済み）
2. **ローディング中**: Promiseが解決されるまで
3. **完全表示**: すべてのデータが揃った状態

```svelte
<!-- +page.svelte -->
<script lang="ts">
  import type { PageData } from './$types';

  // Load関数からデータを受け取る
  let { data }: { data: PageData } = $props();
</script>

<!-- クリティカルデータ：即座に表示 -->
<header>
  <h1>{data.critical.title}</h1>
  <p class="subtitle">{data.critical.subtitle}</p>
</header>

<!-- ストリーミングデータ：準備でき次第表示 -->
<main>
  {#await data.streamed.slow}
    <!-- ローディング状態：スケルトンスクリーン表示 -->
    <div class="loading">
      <div class="skeleton">
        <div class="skeleton-line"></div>
        <div class="skeleton-line"></div>
        <div class="skeleton-line short"></div>
      </div>
    </div>
  {:then slowData}
    <!-- データ読み込み完了：コンテンツ表示 -->
    <article>
      <p>{slowData.content}</p>
      <ul>
        {#each slowData.items as item}
          <li>{item.name}: {item.value}</li>
        {/each}
      </ul>
    </article>
  {:catch error}
    <!-- エラー時のフォールバック：エラーメッセージ表示 -->
    <div class="error">
      <p>コンテンツの読み込みに失敗しました</p>
      <button onclick={() => location.reload()}>再試行</button>
    </div>
  {/await}
</main>

<!-- サイドバー：オプショナルデータ -->
<aside>
  <h2>関連情報</h2>
  {#await data.streamed.optional}
    <!-- シンプルなローディングテキスト（非クリティカル） -->
    <p class="loading-text">読み込み中...</p>
  {:then optionalData}
    <!-- オプショナルコンテンツを表示 -->
    <div class="related">
      {#each optionalData.items as item}
        <a href={item.url}>{item.title}</a>
      {/each}
    </div>
  {:catch error}
    <!-- 優雅なエラー処理（非クリティカル） -->
    <p class="muted">追加情報は現在利用できません</p>
  {/await}
</aside>

<style>
  .skeleton {
    background: #f0f0f0;
    border-radius: 4px;
    padding: 1rem;
  }

  .skeleton-line {
    height: 1em;
    background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
    margin-bottom: 0.5rem;
    border-radius: 2px;
  }

  .skeleton-line.short {
    width: 60%;
  }

  @keyframes loading {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  .error {
    background: #fee;
    border: 1px solid #fcc;
    padding: 1rem;
    border-radius: 4px;
  }
</style>
```

## 実践的な使用例

### ECサイトの商品ページ

商品の基本情報は即座に表示し、レビューや関連商品は後から読み込みます。

```typescript
// +page.server.ts
export const load: PageServerLoad = async ({ params, fetch }) => {
  // 商品の基本情報（必須・高速）
  const productInfo = await fetch(`/api/products/${params.id}`)
    .then(r => r.json());

  // 在庫情報（購入判断に重要）
  const stockStatus = await fetch(`/api/products/${params.id}/inventory`)
    .then(r => r.json());

  return {
    // 即座に表示（SEOのためSSR）
    product: productInfo,
    inventory: stockStatus,

    // ストリーミングデータ（並列取得）
    streamed: {
      reviews: fetch(`/api/products/${params.id}/reviews`).then(r => r.json()),     // ユーザーレビュー
      related: fetch(`/api/products/${params.id}/related`).then(r => r.json()),     // 関連商品
      analytics: fetch(`/api/products/${params.id}/analytics`).then(r => r.json())  // 閲覧履歴
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

<!-- 商品情報：即座に表示 -->
<section class="product-info">
  <h1>{data.product.name}</h1>
  <p class="price">¥{data.product.price.toLocaleString()}</p>

  {#if data.inventory.inStock}
    <!-- 在庫あり：購入ボタンを有効化 -->
    <button class="buy-button">カートに追加</button>
  {:else}
    <!-- 在庫切れ：ボタンを無効化 -->
    <button disabled>在庫切れ</button>
  {/if}

  <div class="description">
    {data.product.description}
  </div>
</section>

<!-- レビュー：ストリーミング表示 -->
<section class="reviews">
  <h2>カスタマーレビュー</h2>
  {#await data.streamed.reviews}
    <!-- ローディングスケルトン（レイアウトシフト防止） -->
    <div class="review-skeleton">
      {#each Array(3) as _}
        <div class="skeleton-review">
          <div class="skeleton-rating"></div>
          <div class="skeleton-text"></div>
        </div>
      {/each}
    </div>
  {:then reviewData}
    <!-- レビューデータ表示 -->
    {#each reviewData.items as review}
      <article class="review">
        <div class="rating">★ {review.rating}/5</div>
        <h3>{review.title}</h3>
        <p>{review.comment}</p>
        <small>by {review.author}</small>
      </article>
    {/each}
  {:catch}
    <!-- 非クリティカルなエラーフォールバック -->
    <p>レビューを読み込めませんでした</p>
  {/await}
</section>

<!-- 関連商品：段階的表示 -->
<section class="related-products">
  <h2>関連商品</h2>
  {#await data.streamed.related}
    <!-- シンプルなローディング（低優先度） -->
    <div class="products-loading">関連商品を読み込み中...</div>
  {:then relatedItems}
    <!-- 商品グリッド -->
    <div class="product-grid">
      {#each relatedItems.items as item}
        <a href="/products/{item.id}" class="product-card">
          <img src={item.image} alt={item.name} />
          <h3>{item.name}</h3>
          <p>¥{item.price.toLocaleString()}</p>
        </a>
      {/each}
    </div>
  {/await}
  <!-- catchブロックなし（オプショナルコンテンツ） -->
</section>
```

### ダッシュボード画面

ダッシュボードでは、重要なKPI（売上、ユーザー数など）を即座に表示し、詳細なグラフやデータは段階的に読み込みます。これにより、ユーザーは最も重要な情報をすぐに確認でき、詳細データが読み込まれるのを待つ必要がありません。

```typescript
// +page.server.ts
export const load: PageServerLoad = async ({ locals, fetch }) => {
  // 認証チェック
  if (!locals.user) {
    throw redirect(302, '/login');
  }

  // 重要なKPI指標（高速・数値データ）
  const keyMetrics = await fetch('/api/dashboard/kpi').then(r => r.json());

  return {
    // 即座に表示
    kpi: keyMetrics,
    user: locals.user,

    // 段階的に読み込み
    streamed: {
      charts: fetch('/api/dashboard/charts').then(r => r.json()),           // グラフデータ（重い）
      recentActivity: fetch('/api/dashboard/activity').then(r => r.json()), // 活動履歴
      notifications: fetch('/api/dashboard/notifications').then(r => r.json()) // 通知一覧
    }
  };
};
```

## 高度な実装パターン

### 複数の段階的読み込み

データの重要度と処理時間に応じて、3段階の読み込みパターンを実装できます。第1段階は100ms以内の最重要データ、第2段階は500ms以内の重要データ、第3段階は時間がかかってもよい補足データという構成です。

```typescript
// +page.server.ts
export const load: PageServerLoad = async () => {
  // 第1段階：クリティカルデータ（100ms以内）
  const criticalContent = await getCriticalData();

  // 第2段階：重要データ（500ms以内）
  const importantDataPromise = new Promise(async (resolve) => {
    const importantInfo = await getImportantData();
    resolve(importantInfo);
  });

  // 第3段階：補足データ（時間制限なし）
  const supplementaryDataPromise = getSupplementaryData();

  return {
    critical: criticalContent,
    streamed: {
      important: importantDataPromise,
      supplementary: supplementaryDataPromise
    }
  };
};
```

### エラーハンドリングの強化

ストリーミングデータでエラーが発生しても、ページ全体の動作に影響しないようにするためのパターンです。エラー時にはフォールバックデータを提供し、UIが壊れないようにします。

```typescript
// +page.server.ts
export const load: PageServerLoad = async () => {
  // 必須データ
  const criticalData = await getCriticalData();

  return {
    critical: criticalData,
    streamed: {
      // Promiseチェーンでエラーハンドリング
      slowData: fetch('/api/slow')
        .then(r => r.json())
        .catch(error => {
          // エラー時のフォールバックデータ
          console.error('Slow data failed:', error);
          return {
            error: true,        // エラーフラグ
            fallback: true,     // フォールバック指標
            message: 'データの取得に失敗しました',
            items: []          // 空配列（UIのクラッシュ防止）
          };
        })
    }
  };
};
```

```svelte
<!-- エラーハンドリングの表示 -->
{#await data.streamed.slowData}
  <div class="loading">読み込み中...</div>
{:then resultData}
  {#if resultData.error}
    <!-- エラー時のフォールバックUI -->
    <div class="error-fallback">
      <p>{resultData.message}</p>
      <button onclick={() => location.reload()}>再試行</button>
    </div>
  {:else}
    <!-- 正常データの表示 -->
    <div>{resultData.content}</div>
  {/if}
{/await}
```

### 条件付きストリーミング

ユーザーの認証状態や権限レベルに応じて、動的にストリーミングするデータを決定するパターンです。プレミアムユーザーには追加のデータを提供するなど、柔軟な対応が可能です。

```typescript
// +page.server.ts
export const load: PageServerLoad = async ({ locals }) => {
  // すべてのユーザー向け基本データ
  const baseData = await getBasicData();

  // 動的なストリーミングデータ
  const streamedContent: any = {
    publicData: getPublicData()  // 公開データ（全員）
  };

  // 認証済みユーザーには追加データ
  if (locals.user) {
    // パーソナライズされたコンテンツ
    streamedContent.personalData = getPersonalData(locals.user.id);

    // プレミアムユーザーにはプレミアム機能
    if (locals.user.isPremium) {
      // 追加のプレミアムデータ
      streamedContent.premiumData = getPremiumData(locals.user.id);
    }
  }

  return {
    basic: basicData,
    streamed  // ユーザータイプに応じたデータが含まれる
  };
};
```

## データフローの詳細

<Mermaid diagram={streamingDataFlow} />

## パフォーマンス最適化

### 適切なデータ分割

ユーザーが最初に見る画面上部のコンテンツ（Above the Fold）を優先的に読み込み、スクロールが必要な部分は後から読み込む戦略です。

```typescript
// ✅ 良い例：適切なデータ分割
export const load: PageServerLoad = async () => {
  return {
    // Above the foldコンテンツ（可視領域）
    critical: await getFoldData(),

    // Below the foldコンテンツ（遅延読み込み）
    streamed: {
      belowFold: getBelowFoldData(),       // スクロール後のコンテンツ
      analytics: getAnalyticsData(),       // バックグラウンド分析
      recommendations: getRecommendations() // 低優先度
    }
  };
};

// ❌ 悪い例：優先度を考慮していない
export const load: PageServerLoad = async () => {
  return {
    critical: await getRandomData1(),  // 重要度が不明
    streamed: {
      random: getRandomData2()  // 優先度が不明
    }
  };
};
```

### キャッシュとの組み合わせ

メモリキャッシュを活用して、2回目以降のアクセスを高速化する実装パターンです。

```typescript
// lib/cache.ts
const memoryCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5分間

export async function getCachedData<T>(
  cacheKey: string,
  dataFetcher: () => Promise<T>
): Promise<T> {
  const cachedEntry = memoryCache.get(cacheKey);
  const currentTime = Date.now();

  // 有効なキャッシュを返す
  if (cachedEntry && currentTime - cachedEntry.timestamp < CACHE_DURATION) {
    return cachedEntry.data;  // メモリから即座にアクセス
  }

  // キャッシュミス時は新データを取得
  const freshData = await dataFetcher();
  memoryCache.set(cacheKey, { data: freshData, timestamp: currentTime });
  return freshData;
}

// +page.server.ts
import { getCachedData } from '$lib/cache';

export const load: PageServerLoad = async () => {
  return {
    // 高速なキャッシュされたクリティカルデータ
    critical: await getCachedData('critical', getCriticalData),

    streamed: {
      // キャッシュチェック付きストリーミング
      slow: getCachedData('slow', getSlowData)
    }
  };
};
```

## ストリーミングSSRのメリット

### 1. 初期表示の高速化

- **TTFB改善**: 重要なコンテンツが即座に送信される
- **FCP向上**: First Contentful Paintが大幅に改善
- **CLS削減**: レイアウトシフトを最小限に抑制

### 2. ユーザー体験の向上

- **段階的表示**: ユーザーは待ち時間を感じにくい
- **プログレッシブエンハンスメント**: 基本機能から徐々に充実
- **エラー耐性**: 一部の失敗でもページは表示される

### 3. SEO対応

- **クリティカルコンテンツ**: 検索エンジンが重要な情報を即座に認識
- **構造化データ**: 基本的なメタデータはSSRで配信
- **パフォーマンス指標**: Core Web Vitalsが改善

## 注意点と制限事項

### 1. 実装の複雑さ

```svelte
<!-- エラー処理を含む完全な実装例 -->
{#await data.streamed.slow}
  <!-- ローディング状態：アクセシビリティも考慮 -->
  <div class="loading" aria-label="読み込み中">
    <div class="spinner"></div>
    <p>データを読み込んでいます...</p>
  </div>
{:then loadedData}
  <!-- データ取得後：空データのチェックも必要 -->
  {#if loadedData?.items?.length > 0}
    <!-- データがある場合の表示 -->
    <ul>
      {#each loadedData.items as item}
        <li>{item.name}</li>
      {/each}
    </ul>
  {:else}
    <!-- 空データの場合のフォールバック -->
    <p>データがありません</p>
  {/if}
{:catch error}
  <!-- エラー時：role="alert"でスクリーンリーダーに通知 -->
  <div class="error" role="alert">
    <h3>エラーが発生しました</h3>
    <p>{error.message}</p>
    <button onclick={() => window.location.reload()}>
      ページを再読み込み
    </button>
  </div>
{/await}
```

### 2. デバッグの難しさ

```typescript
// デバッグ用のログ出力
export const load: PageServerLoad = async () => {
  console.log('Load function started');

  // クリティカルデータの取得とログ
  const critical = await getCriticalData();
  console.log('Critical data loaded:', critical);

  // ストリーミングデータの非同期処理
  const slowPromise = getSlowData()
    .then(data => {
      // 成功時のログ
      console.log('Slow data loaded:', data);
      return data;
    })
    .catch(error => {
      // エラー時のログ（エラーを再スロー）
      console.error('Slow data failed:', error);
      throw error;
    });

  return {
    critical,
    streamed: { slow: slowPromise }
  };
};
```

### 3. キャッシング戦略

Server-Timingヘッダーを使用してパフォーマンスを監視し、Chrome DevToolsで最適化の効果を確認できます。

```typescript
// Performance monitoring with Server-Timing
export const load: PageServerLoad = async ({ setHeaders }) => {
  const startTime = performance.now();

  // Measure critical data fetch
  const criticalData = await getCriticalData();
  const duration = performance.now() - startTime;

  // Send timing info to browser DevTools
  setHeaders({
    'Server-Timing': `critical;dur=${duration}`
  });

  return {
    critical: criticalData,
    streamed: {
      slow: getSlowData()  // Not measured (streaming)
    }
  };
};
```

## ベストプラクティス

### 1. 適切なデータ分割

- **Above the fold**: ユーザーが最初に見る部分は即座に表示
- **Below the fold**: スクロールしないと見えない部分はストリーミング
- **Interactive elements**: ボタンやフォームは重要度に応じて判断

### 2. ローディング状態の設計

```svelte
<!-- Good loading state example -->
{#await data.streamed.articles}
  <div class="articles-loading">
    <!-- Skeleton loading -->
    {#each Array(3) as _}
      <article class="article-skeleton">
        <div class="skeleton-title"></div>
        <div class="skeleton-content"></div>
        <div class="skeleton-meta"></div>
      </article>
    {/each}
  </div>
{:then articles}
  <!-- Actual content here -->
{/await}
```

### 3. エラー処理の戦略

```typescript
// Streaming with fallback
export const load: PageServerLoad = async () => {
  return {
    critical: await getCriticalData(),
    streamed: {
      optional: getOptionalData().catch(() => ({
        fallback: true,
        message: 'オプショナルデータは現在利用できません'
      }))
    }
  };
};
```

## トラブルシューティング

### よくある問題と解決法

1. **Promiseが解決されない**
   ```typescript
   // ❌ Problem: Missing .then()
   const slowData = fetch('/api/slow'); // Returns Response, not data

   // ✅ Fixed: Parse JSON
   const slowData = fetch('/api/slow').then(r => r.json());
   ```

2. **メモリリーク**
   ```svelte
   <script lang="ts">
     let abortController: AbortController;

     // Svelte 5: $effectを使用
     $effect(() => {
       abortController = new AbortController();
       return () => abortController.abort();
     });
   </script>
   ```

3. **型エラー**
   ```typescript
   // 型定義を明確に
   type StreamedData = {
     slow: Promise<{ items: Item[] }>;
     optional: Promise<OptionalData>;
   };

   export const load: PageServerLoad = async (): Promise<{
     critical: CriticalData;
     streamed: StreamedData;
   }> => {
     // 実装
   };
   ```

## まとめ

ストリーミングSSRは、以下の場面で特に効果的です。

- **大量データの表示**: 記事一覧、商品カタログ、検索結果
- **外部API依存**: サードパーティAPIからのデータ取得
- **複雑な計算処理**: 重いデータ処理や分析結果の表示
- **段階的な情報提示**: ユーザーの関心に応じた情報の出し分け

適切に実装することで、ユーザー体験を大幅に改善し、パフォーマンス指標を向上させることができます。

## 次のステップ

- [キャッシュ戦略](../../optimization/caching/) - PWA・CDN・エッジコンピューティングによる最適化
- [WebSocket・SSE通信](../../server/websocket-sse/) - リアルタイム通信の実装
- [最適化](../../optimization/) - 総合的なパフォーマンス改善手法
