---
title: ストリーミングSSR
description: SvelteKitのストリーミングSSRで段階的データ送信を実装 - awaitブロックによる非同期レンダリング、パフォーマンス最適化、エラーハンドリングをTypeScriptで解説
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

```typescript
// ❌ 従来のSSR：すべてのデータを待つ
export const load: PageServerLoad = async () => {
  // 全て完了するまで画面は真っ白
  const critical = await getCriticalData();  // 100ms
  const slow = await getSlowData();          // 3000ms
  return { critical, slow };
  // 合計 3100ms 後にページが表示される
};

// ✅ ストリーミングSSR：段階的に表示
export const load: PageServerLoad = async () => {
  const critical = await getCriticalData();  // 100ms

  return {
    critical,  // 即座にレンダリング
    streamed: {
      slow: getSlowData()  // Promiseのまま返す（awaitしない）
    }
  };
  // 100ms 後に基本コンテンツが表示され、
  // 3000ms 後に完全なコンテンツが表示される
};
```

### ストリーミングSSRの仕組み

<Mermaid diagram={generalStreamingDiagram} />

### SvelteKitでのストリーミングSSR動作

<Mermaid diagram={streamingSSRDiagram} />

### アーキテクチャの概要

<Mermaid diagram={streamingArchitecture} />

## 基本的な実装

### サーバーサイドの実装

SvelteKitでストリーミングSSRを実装するには、Load関数からPromiseを直接返します。

```typescript
// +page.server.ts
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
  // 即座に表示すべき重要なデータ
  // ページのタイトル、価格、在庫状況など、ユーザーが最初に見る必要がある情報
  const criticalData = await fetch('/api/critical').then(r => r.json());

  // 時間のかかるデータ（Promiseのまま返す）
  // awaitを使わないことで、SvelteKitはこれらを非同期でストリーミング
  return {
    // 即座にレンダリングされるデータ
    // HTMLの初期レスポンスに含まれ、すぐに表示される
    critical: criticalData,

    // ストリーミングされるデータ
    // これらのPromiseは並列で実行され、解決され次第クライアントに送信
    streamed: {
      slow: fetch('/api/slow').then(r => r.json()),        // レビューや詳細情報など
      optional: fetch('/api/optional').then(r => r.json()) // 関連商品やおすすめなど
    }
  };
};
```

### 実装のポイント

1. **クリティカルデータ**: `await`を使って即座に取得・返却
2. **ストリーミングデータ**: `await`を使わずPromiseとして返却
3. **データ構造**: `streamed`オブジェクトにPromiseをまとめる

### コンポーネントでの表示

Svelteの`{#await}`ブロックを使用して、ストリーミングデータを段階的に表示します。

```svelte
<!-- +page.svelte -->
<script lang="ts">
  import type { PageData } from './$types';

  // Load関数から返されたデータを受け取る
  // criticalは既に解決済み、streamedはPromiseを含むオブジェクト
  let { data }: { data: PageData } = $props();
</script>

<!-- criticalDataは即座に表示 -->
<!-- サーバーサイドで既に取得済みなので、初回レンダリングに含まれる -->
<header>
  <h1>{data.critical.title}</h1>
  <p class="subtitle">{data.critical.subtitle}</p>
</header>

<!-- ストリーミングデータは準備でき次第表示 -->
<main>
  <!-- 時間のかかるメインコンテンツ -->
  {#await data.streamed.slow}
    <!-- ローディング状態 -->
    <!-- Promiseが解決されるまでこのブロックが表示される -->
    <!-- スケルトンスクリーンでユーザーに読み込み中であることを視覚的に伝える -->
    <div class="loading">
      <div class="skeleton">
        <div class="skeleton-line"></div>
        <div class="skeleton-line"></div>
        <div class="skeleton-line short"></div>
      </div>
    </div>
  {:then slowData}
    <!-- データ取得完了後 -->
    <!-- Promiseが解決されると、このブロックが表示される -->
    <!-- SvelteKitが自動的にDOMを更新し、スムーズに切り替わる -->
    <article>
      <p>{slowData.content}</p>
      <ul>
        {#each slowData.items as item}
          <li>{item.name}: {item.value}</li>
        {/each}
      </ul>
    </article>
  {:catch error}
    <!-- エラー時のフォールバック -->
    <!-- APIエラーや通信エラーが発生した場合の処理 -->
    <!-- ユーザーに分かりやすいエラーメッセージと回復手段を提供 -->
    <div class="error">
      <p>コンテンツの読み込みに失敗しました</p>
      <button onclick={() => location.reload()}>再試行</button>
    </div>
  {/await}
</main>

<!-- サイドバーのオプショナルデータ -->
<aside>
  <h2>関連情報</h2>
  {#await data.streamed.optional}
    <!-- シンプルなテキストローディング -->
    <!-- オプショナルなコンテンツなので、軽めの表示で十分 -->
    <p class="loading-text">読み込み中...</p>
  {:then optionalData}
    <!-- オプショナルデータの表示 -->
    <!-- メインコンテンツとは独立して読み込まれ、表示される -->
    <div class="related">
      {#each optionalData.items as item}
        <a href={item.url}>{item.title}</a>
      {/each}
    </div>
  {:catch error}
    <!-- オプショナルデータなのでエラーは控えめに -->
    <!-- 必須ではない情報なので、エラーでもUXを損なわないよう配慮 -->
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
  // 商品名、価格、画像など、購入判断に必要な最小限の情報
  const product = await fetch(`/api/products/${params.id}`)
    .then(r => r.json());

  // 在庫情報も重要なので即座に取得
  // 「購入可能か」という重要な情報は初回表示に含める
  const inventory = await fetch(`/api/products/${params.id}/inventory`)
    .then(r => r.json());

  return {
    // 即座に表示
    // SEOにも重要なため、サーバーサイドでレンダリング
    product,
    inventory,

    // ストリーミングで後から表示
    // これらは並列で取得され、完了次第順次表示される
    streamed: {
      reviews: fetch(`/api/products/${params.id}/reviews`).then(r => r.json()),     // ユーザーレビュー
      related: fetch(`/api/products/${params.id}/related`).then(r => r.json()),     // 関連商品
      analytics: fetch(`/api/products/${params.id}/analytics`).then(r => r.json())  // 閲覧履歴等の分析データ
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

<!-- 商品情報は即座に表示 -->
<!-- サーバーでawait済みなので、ページ読み込み時点で表示される -->
<section class="product-info">
  <h1>{data.product.name}</h1>
  <p class="price">¥{data.product.price.toLocaleString()}</p>

  {#if data.inventory.inStock}
    <!-- 在庫ありの場合、購入ボタンを有効化 -->
    <button class="buy-button">カートに追加</button>
  {:else}
    <!-- 在庫切れの場合、ボタンを無効化 -->
    <button disabled>在庫切れ</button>
  {/if}

  <div class="description">
    {data.product.description}
  </div>
</section>

<!-- レビューは後から表示 -->
<section class="reviews">
  <h2>カスタマーレビュー</h2>
  {#await data.streamed.reviews}
    <!-- レビュー読み込み中のスケルトン -->
    <!-- 3つのダミーレビューエリアを表示して、レイアウトシフトを防ぐ -->
    <div class="review-skeleton">
      {#each Array(3) as _}
        <div class="skeleton-review">
          <div class="skeleton-rating"></div>
          <div class="skeleton-text"></div>
        </div>
      {/each}
    </div>
  {:then reviews}
    <!-- レビューデータ取得完了後 -->
    <!-- Promiseが解決されると、実際のレビューを表示 -->
    {#each reviews.items as review}
      <article class="review">
        <div class="rating">★ {review.rating}/5</div>
        <h3>{review.title}</h3>
        <p>{review.comment}</p>
        <small>by {review.author}</small>
      </article>
    {/each}
  {:catch}
    <!-- レビューAPIエラー時 -->
    <!-- レビューは重要度が低いので、エラーでもページ全体の動作に影響しない -->
    <p>レビューを読み込めませんでした</p>
  {/await}
</section>

<!-- 関連商品も段階的に表示 -->
<section class="related-products">
  <h2>関連商品</h2>
  {#await data.streamed.related}
    <!-- シンプルなローディングメッセージ -->
    <!-- 関連商品は重要度が低いので、軽い表示で十分 -->
    <div class="products-loading">関連商品を読み込み中...</div>
  {:then related}
    <!-- 関連商品のグリッド表示 -->
    <!-- ユーザーがスクロールしてここまで来る頃には表示されている -->
    <div class="product-grid">
      {#each related.items as item}
        <a href="/products/{item.id}" class="product-card">
          <img src={item.image} alt={item.name} />
          <h3>{item.name}</h3>
          <p>¥{item.price.toLocaleString()}</p>
        </a>
      {/each}
    </div>
  {/await}
  <!-- catchブロックを省略 - 関連商品はエラーでも問題ない -->
</section>
```

### ダッシュボード画面

重要なKPIは即座に表示し、詳細なグラフやデータは後から読み込みます。

```typescript
// +page.server.ts
export const load: PageServerLoad = async ({ locals, fetch }) => {
  // 認証チェック
  if (!locals.user) {
    throw redirect(302, '/login');
  }

  // 重要なKPIデータは即座に取得
  // 売上、ユーザー数など、ダッシュボードの主要指標
  // これらは数値だけなので高速に取得できる
  const kpi = await fetch('/api/dashboard/kpi').then(r => r.json());

  return {
    // 即座に表示される重要指標
    // ユーザーが最初に確認したい数値をすぐに表示
    kpi,
    user: locals.user,

    // 段階的に表示される詳細データ
    // グラフやリストなど、データ量が多く処理に時間がかかるもの
    streamed: {
      charts: fetch('/api/dashboard/charts').then(r => r.json()),           // グラフデータ（重い）
      recentActivity: fetch('/api/dashboard/activity').then(r => r.json()), // 最近の活動履歴
      notifications: fetch('/api/dashboard/notifications').then(r => r.json()) // 通知一覧
    }
  };
};
```

## 高度な実装パターン

### 複数の段階的読み込み

データの重要度に応じて、3段階の読み込みを実装できます。

```typescript
// +page.server.ts
export const load: PageServerLoad = async () => {
  // 第1段階：最重要データ（即座に表示）
  // ページの基本構造、タイトル、主要なコンテンツ
  // 100ms以内に取得できるデータ
  const critical = await getCriticalData();

  // 第2段階：重要データ（500ms以内に表示）
  // ユーザー体験に影響するが、少し待てるデータ
  // 例：サイドバーの情報、追加のメタデータ
  const importantPromise = new Promise(async (resolve) => {
    const data = await getImportantData();
    resolve(data);
  });

  // 第3段階：補足データ（時間がかかっても良い）
  // あると便利だが、なくても基本機能に影響しないデータ
  // 例：おすすめ、統計情報、履歴データ
  const supplementaryPromise = getSupplementaryData();

  return {
    critical,
    streamed: {
      important: importantPromise,
      supplementary: supplementaryPromise
    }
  };
};
```

### エラーハンドリングの強化

ストリーミングデータでエラーが発生した場合の対処法です。

```typescript
// +page.server.ts
export const load: PageServerLoad = async () => {
  // 必須データは通常通り取得
  const critical = await getCriticalData();

  return {
    critical,
    streamed: {
      // エラーハンドリングをPromiseチェーンに組み込む
      slow: fetch('/api/slow')
        .then(r => r.json())
        .catch(error => {
          // エラー時のフォールバックデータ
          // エラーログを記録しつつ、ユーザーには代替データを提供
          console.error('Slow data failed:', error);
          return {
            error: true,        // エラーフラグ
            fallback: true,     // フォールバックデータであることを示す
            message: 'データの取得に失敗しました',
            // ダミーデータを提供してUIが壊れないようにする
            items: []
          };
        })
    }
  };
};
```

```svelte
<!-- エラー対応の表示 -->
{#await data.streamed.slow}
  <div class="loading">読み込み中...</div>
{:then slowData}
  {#if slowData.error}
    <!-- エラーフラグが立っている場合 -->
    <!-- catchブロックではなく、thenブロック内でエラーハンドリング -->
    <div class="error-fallback">
      <p>{slowData.message}</p>
      <button onclick={() => location.reload()}>再試行</button>
    </div>
  {:else}
    <!-- 正常データの表示 -->
    <!-- errorプロパティがない場合は正常データとして処理 -->
    <div>{slowData.content}</div>
  {/if}
{/await}
```

### 条件付きストリーミング

ユーザーの権限や設定に応じて、ストリーミングするデータを変更します。

```typescript
// +page.server.ts
export const load: PageServerLoad = async ({ locals }) => {
  // すべてのユーザーが見る基本データ
  const basicData = await getBasicData();

  // ストリーミングデータを動的に構築
  const streamed: any = {
    publicData: getPublicData()  // 公開データは全員にストリーミング
  };

  // 認証済みユーザーには追加データをストリーミング
  if (locals.user) {
    // パーソナライズされたデータを追加
    streamed.personalData = getPersonalData(locals.user.id);

    // プレミアムユーザーにはさらに詳細なデータ
    if (locals.user.isPremium) {
      // プレミアム機能のデータも追加
      streamed.premiumData = getPremiumData(locals.user.id);
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

```typescript
// ✅ 良い例：データを適切に分割
export const load: PageServerLoad = async () => {
  return {
    // Above the fold（画面上部）の重要コンテンツ
    // ユーザーがスクロールせずに見える部分
    critical: await getFoldData(),

    // Below the fold（画面下部）は後から読み込み
    // スクロールしないと見えないコンテンツ
    streamed: {
      belowFold: getBelowFoldData(),       // スクロール後のコンテンツ
      analytics: getAnalyticsData(),       // 分析データ（裏側で処理）
      recommendations: getRecommendations() // おすすめ（低優先度）
    }
  };
};

// ❌ 悪い例：重要度を考慮しない分割
export const load: PageServerLoad = async () => {
  return {
    critical: await getRandomData1(),  // どのデータが重要か不明
    streamed: {
      random: getRandomData2()  // 優先度が分からない
    }
  };
};
```

### キャッシュとの組み合わせ

```typescript
// lib/cache.ts
const cache = new Map();
const CACHE_TIME = 5 * 60 * 1000; // 5分

export async function getCachedData<T>(
  key: string,
  fetcher: () => Promise<T>
): Promise<T> {
  const cached = cache.get(key);
  const now = Date.now();

  // キャッシュが有効であればそれを返す
  if (cached && now - cached.timestamp < CACHE_TIME) {
    return cached.data;  // メモリから即座に返す
  }

  // キャッシュがないか古い場合は新しく取得
  const data = await fetcher();
  cache.set(key, { data, timestamp: now });
  return data;
}

// +page.server.ts
import { getCachedData } from '$lib/cache';

export const load: PageServerLoad = async () => {
  return {
    // キャッシュされた重要データは高速
    // 2回目以降のアクセスではメモリから即座に取得
    critical: await getCachedData('critical', getCriticalData),

    streamed: {
      // キャッシュされていない場合でもストリーミング
      // キャッシュヒット時はPromiseが即座に解決される
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
{:then slowData}
  <!-- データ取得後：空データのチェックも必要 -->
  {#if slowData && slowData.items && slowData.items.length > 0}
    <!-- データがある場合の表示 -->
    <ul>
      {#each slowData.items as item}
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

```typescript
// Server-Timingヘッダーでパフォーマンス監視
export const load: PageServerLoad = async ({ setHeaders }) => {
  const start = performance.now();

  // クリティカルデータの取得時間を計測
  const critical = await getCriticalData();
  const criticalTime = performance.now() - start;

  // Server-Timingヘッダーでパフォーマンス情報を伝達
  // Chrome DevToolsのNetworkタブで確認可能
  setHeaders({
    'Server-Timing': `critical;dur=${criticalTime}`
  });

  return {
    critical,
    streamed: {
      slow: getSlowData()  // これは計測しない（ストリーミングのため）
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
<!-- 良いローディング状態の例 -->
{#await data.streamed.articles}
  <div class="articles-loading">
    <!-- スケルトンローディング -->
    {#each Array(3) as _}
      <article class="article-skeleton">
        <div class="skeleton-title"></div>
        <div class="skeleton-content"></div>
        <div class="skeleton-meta"></div>
      </article>
    {/each}
  </div>
{:then articles}
  <!-- 実際のコンテンツ -->
{/await}
```

### 3. エラー処理の戦略

```typescript
// フォールバック機能付きのストリーミング
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
   // ❌ 問題のあるコード
   const slowData = fetch('/api/slow'); // .then()を忘れている

   // ✅ 修正後
   const slowData = fetch('/api/slow').then(r => r.json());
   ```

2. **メモリリーク**
   ```svelte
   <script lang="ts">
     import { onMount } from 'svelte';

     let abortController: AbortController;

     onMount(() => {
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