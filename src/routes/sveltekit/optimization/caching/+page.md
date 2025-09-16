---
title: キャッシュ戦略
description: SvelteKitでPWA・CDN・エッジコンピューティングを活用したキャッシュ戦略 - Service Worker、エッジキャッシュ、オフライン対応による最適化をTypeScriptで実装
---

<script lang="ts">
  import { base } from '$app/paths';
</script>

PWA（Progressive Web App）、CDN、エッジコンピューティングを組み合わせることで、SvelteKitアプリケーションのパフォーマンスを大幅に向上させることができます。このページでは、インフラレベルのキャッシュ戦略と最適化技術を解説します。

## キャッシュ戦略が必要な理由

適切なキャッシュ戦略により、パフォーマンスの向上、サーバー負荷の軽減、オフライン対応を実現できます。PWA、CDN、エッジコンピューティングを組み合わせることで、より高度な最適化が可能になります。

### 現代のWebアプリケーションの課題

- 🌍 **グローバル配信**: 世界中のユーザーへの低遅延アクセス
- 📱 **オフライン対応**: ネットワーク不安定な環境での動作
- ⚡ **極限の高速化**: ミリ秒単位のパフォーマンス最適化
- 💰 **コスト最適化**: サーバーリソースとCDN費用の削減
- 🔄 **リアルタイム性**: 常に最新データを表示

これらの課題を解決するには、単純なSSR/SSGだけでなく、複数の技術を組み合わせた戦略が必要です。

## PWAとService Workerの活用

Progressive Web App技術により、ネイティブアプリのような体験をWebで実現します。Service Workerを活用することで、オフライン対応、バックグラウンド同期、プッシュ通知などの高度な機能を実装できます。

### Service Workerによるキャッシュ戦略

Service Workerを使用すると、ネットワークリクエストをインターセプトしてカスタムキャッシュ戦略を実装できます。適切な戦略を選択することで、パフォーマンスとデータの鮮度のバランスを最適化できます。

```typescript
// src/service-worker.ts
// SvelteKitが提供する特殊なインポート。ビルド情報とファイルリストを取得
import { build, files, version } from '$service-worker';

// キャッシュ名にバージョンを含めることで、更新時に古いキャッシュをクリア
const CACHE_NAME = `cache-v${version}`;
// ビルド成果物と静的ファイルをマージしてキャッシュ対象リストを作成
const ASSETS = [...build, ...files];

// インストール時にアセットをプリキャッシュ
// Service Worker登録時に一度だけ実行される。アプリのシェルをキャッシュ
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// キャッシュ戦略の実装
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 静的アセット: Cache First戦略
  // JS/CSS/画像などの変更頻度が低いアセットは、キャッシュを優先して高速化
  if (ASSETS.includes(url.pathname)) {
    event.respondWith(
      caches.match(request).then((response) => {
        return response || fetch(request);
      })
    );
    return;
  }

  // API呼び出し: Network First with Cache Fallback戦略
  // 最新データを優先しつつ、オフライン時はキャッシュで対応
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // 成功したレスポンスをキャッシュに保存
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // ネットワークエラー時はキャッシュから返す
          return caches.match(request);
        })
    );
    return;
  }

  // HTML: Stale While Revalidate戦略
  // 古いキャッシュを即座に表示しながら、バックグラウンドで最新版を取得
  // ユーザー体験を最適化する高度なパターン
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.match(request).then((response) => {
        const fetchPromise = fetch(request).then((networkResponse) => {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, networkResponse.clone());
          });
          return networkResponse;
        });
        // キャッシュがあれば即座に返し、裏で更新
        return response || fetchPromise;
      })
    );
  }
});
```

### SvelteKitでのPWA実装

SvelteKitアプリケーションをPWA化するための基本的な設定を示します。マニフェストファイルとService Worker登録により、インストール可能なWebアプリを構築できます。

```html
<!-- app.html -->
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="utf-8" />
  <link rel="manifest" href="%sveltekit.assets%/manifest.json" />
  <meta name="theme-color" content="#000000" />
</head>
<body>
  <div style="display: contents">%sveltekit.body%</div>
  <script>
    // Service Worker登録
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js');
    }
  </script>
</body>
</html>
```

PWAマニフェストファイル（`static/manifest.json`）の設定:

```javascript
const manifest = {
  name: "My SvelteKit PWA",
  short_name: "MySKPWA",
  description: "高度なデータフェッチング戦略を実装したPWA",
  start_url: "/",
  display: "standalone",
  theme_color: "#000000",
  background_color: "#ffffff",
  icons: [
    {
      src: "/icon-192.png",
      sizes: "192x192",
      type: "image/png"
    },
    {
      src: "/icon-512.png",
      sizes: "512x512",
      type: "image/png"
    }
  ]
};
```

## CDNとエッジキャッシング

CDN（Content Delivery Network）とエッジコンピューティングを活用することで、ユーザーに物理的に近い場所からコンテンツを配信し、レイテンシを大幅に削減できます。また、エッジでの計算処理により、オリジンサーバーの負荷も軽減されます。

### Cloudflare Workersでのエッジ処理

```typescript
// cloudflare-worker.ts
// Cloudflare Workersで実行されるエッジ関数。世界中のエッジロケーションで動作
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // 地域別のキャッシュキー生成
    // CF-IPCountryヘッダーからユーザーの国を取得し、地域固有のキャッシュを管理
    const country = request.headers.get('CF-IPCountry') || 'US';
    const cacheKey = new Request(
      `https://cache.example.com${url.pathname}?country=${country}`,
      request
    );

    // エッジキャッシュの確認
    // CloudflareのグローバルキャッシュAPIを使用して、エッジでキャッシュを検索
    const cache = caches.default;
    let response = await cache.match(cacheKey);

    if (!response) {
      // オリジンサーバーへリクエスト
      response = await fetch(request);

      // レスポンスをカスタマイズ
      response = new Response(response.body, response);
      response.headers.append('X-Cached', 'false');
      response.headers.append('X-Country', country);

      // 条件付きでキャッシュ
      // 商品APIのように更新頻度が低いエンドポイントのみキャッシュ
      if (response.ok && url.pathname.startsWith('/api/products')) {
        response.headers.append('Cache-Control', 'public, max-age=3600');
        await cache.put(cacheKey, response.clone());
      }
    } else {
      response = new Response(response.body, response);
      response.headers.append('X-Cached', 'true');
    }

    return response;
  }
};
```

### SvelteKitでのCDN最適化

SvelteKitの`setHeaders`関数を使用して、適切なキャッシュヘッダーを設定し、CDNでのキャッシュ効率を最大化します。

```typescript
// +page.server.ts
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ setHeaders, platform }) => {
  // 静的コンテンツ: 長期キャッシュ
  // ビルドハッシュ付きアセットは1年間キャッシュ、immutableで変更なしを明示
  setHeaders({
    'cache-control': 'public, max-age=31536000, immutable',
    'cdn-cache-control': 'max-age=31536000'
  });

  // 動的コンテンツ: SWRパターン
  // 1分間はキャッシュを使用、その後24時間は古いコンテンツを表示しながら更新
  setHeaders({
    'cache-control': 'public, max-age=60, stale-while-revalidate=86400',
    'cdn-cache-control': 'max-age=3600'
  });

  // エッジでの処理ヒント
  if (platform?.env) {
    // Cloudflare KVストレージの使用
    // KVはグローバルに分散されたKey-Valueストアで、高速な読み取りが可能
    const cachedData = await platform.env.KV_NAMESPACE.get('data-key');
    if (cachedData) {
      return {
        data: JSON.parse(cachedData),
        cached: true
      };
    }
  }

  // 通常のデータ取得
  const data = await fetchData();

  // バックグラウンドでKVを更新
  // waitUntilでレスポンスを返した後も処理を継続、ユーザーを待たせない
  platform?.context?.waitUntil(
    platform.env.KV_NAMESPACE.put('data-key', JSON.stringify(data), {
      expirationTtl: 3600
    })
  );

  return {
    data,
    cached: false
  };
};
```

## レイヤードキャッシング戦略

複数のキャッシュ層を組み合わせることで、パフォーマンスと可用性を最大化します。各層が異なる特性を持ち、適切に組み合わせることで、様々なシナリオに対応できます。

### 多層キャッシュアーキテクチャ

```typescript
// lib/cache-layers.ts
// 4層のキャッシュを統合管理するクラス。上位層から順に検索し、最速のレスポンスを実現
export class LayeredCache {
  // L1: メモリキャッシュ（ブラウザ）
  // 最速アクセス、但し容量制限あり、ページリロードで消える
  private memoryCache = new Map<string, any>();

  // L2: Service Workerキャッシュ
  // オフラインでも利用可能、ブラウザ内で永続化
  private async getFromServiceWorker(key: string) {
    if ('caches' in self) {
      const cache = await caches.open('data-cache');
      const response = await cache.match(key);
      return response ? await response.json() : null;
    }
    return null;
  }

  // L3: CDNエッジキャッシュ
  // グローバルに分散、地理的に近いエッジから配信
  private async getFromEdge(key: string) {
    const response = await fetch(`/api/cache/${key}`, {
      headers: {
        'Cache-Control': 'only-if-cached'
      }
    });
    return response.ok ? await response.json() : null;
  }

  // L4: オリジンサーバー
  // 最新データのソース、最も遅いが確実
  private async getFromOrigin(key: string) {
    const response = await fetch(`/api/data/${key}`);
    return response.ok ? await response.json() : null;
  }

  // 統合取得メソッド
  // 各キャッシュ層を順番に確認し、最速でデータを返す
  async get(key: string): Promise<any> {
    // L1チェック：メモリから即座に返す
    if (this.memoryCache.has(key)) {
      console.log('L1 Cache Hit: Memory');
      return this.memoryCache.get(key);
    }

    // L2チェック：Service Workerから取得
    const swData = await this.getFromServiceWorker(key);
    if (swData) {
      console.log('L2 Cache Hit: Service Worker');
      this.memoryCache.set(key, swData);
      return swData;
    }

    // L3チェック：CDNエッジから取得
    const edgeData = await this.getFromEdge(key);
    if (edgeData) {
      console.log('L3 Cache Hit: CDN Edge');
      this.updateLowerCaches(key, edgeData);
      return edgeData;
    }

    // L4: オリジンから取得（最終手段）
    console.log('L4: Fetching from Origin');
    const originData = await this.getFromOrigin(key);
    if (originData) {
      this.updateAllCaches(key, originData);
      return originData;
    }

    throw new Error(`Failed to fetch data for key: ${key}`);
  }

  private async updateLowerCaches(key: string, data: any) {
    // 下位キャッシュを更新し、次回アクセス時の高速化を図る
    // メモリキャッシュを更新
    this.memoryCache.set(key, data);

    // Service Workerキャッシュを更新
    if ('caches' in self) {
      const cache = await caches.open('data-cache');
      const response = new Response(JSON.stringify(data));
      await cache.put(key, response);
    }
  }

  private async updateAllCaches(key: string, data: any) {
    await this.updateLowerCaches(key, data);
    // CDNキャッシュは自動的に更新される
  }
}
```

## 適応的フェッチング戦略

ユーザーのネットワーク環境やデバイス性能をリアルタイムで検出し、最適なフェッチング戦略を自動選択します。これにより、あらゆる環境で最良のユーザー体験を提供できます。

### ネットワーク状況に応じた戦略切り替え

```typescript
// lib/adaptive-fetch.ts
// ネットワーク状況を動的に監視し、最適なフェッチング戦略を自動選択するクラス
export class AdaptiveFetcher {
  // 3つの戦略：積極的（高速回線）、バランス（標準）、保守的（低速/節約モード）
  private strategy: 'aggressive' | 'balanced' | 'conservative' = 'balanced';

  constructor() {
    this.detectNetworkConditions();
    this.monitorPerformance();
  }

  private detectNetworkConditions() {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;

      // 接続タイプによる戦略決定
      // Network Information APIを使用してネットワーク品質を判定
      if (connection.effectiveType === '4g' && !connection.saveData) {
        this.strategy = 'aggressive';  // プリフェッチ積極的、先読みでUX向上
      } else if (connection.effectiveType === '2g' || connection.saveData) {
        this.strategy = 'conservative';  // キャッシュ優先、データ通信量節約
      } else {
        this.strategy = 'balanced';  // バランス型
      }

      // 接続変更の監視
      connection.addEventListener('change', () => {
        this.detectNetworkConditions();
      });
    }
  }

  private monitorPerformance() {
    // Navigation Timing APIでパフォーマンス監視
    // 実際のページロード時間を計測し、動的に戦略を調整
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            const loadTime = navEntry.loadEventEnd - navEntry.fetchStart;

            // ロード時間に基づく戦略調整
            // 3秒以上は遅いと判断、1秒未満は高速と判断
            if (loadTime > 3000) {
              this.strategy = 'conservative';
            } else if (loadTime < 1000) {
              this.strategy = 'aggressive';
            }
          }
        }
      });

      observer.observe({ entryTypes: ['navigation'] });
    }
  }

  async fetch(url: string, options?: RequestInit): Promise<Response> {
    switch (this.strategy) {
      case 'aggressive':
        return this.aggressiveFetch(url, options);
      case 'conservative':
        return this.conservativeFetch(url, options);
      default:
        return this.balancedFetch(url, options);
    }
  }

  private async aggressiveFetch(url: string, options?: RequestInit) {
    // 積極的戦略：プリフェッチとプリコネクトで先読み最適化
    this.prefetchRelated(url);

    // 並列フェッチと10秒タイムアウト
    // AbortControllerで長時間のリクエストを防ぐ
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        // @ts-ignore
        priority: 'high'
      });
      clearTimeout(timeout);
      return response;
    } catch (error) {
      clearTimeout(timeout);
      throw error;
    }
  }

  private async conservativeFetch(url: string, options?: RequestInit) {
    // キャッシュ優先
    const cachedResponse = await caches.match(url);
    if (cachedResponse) {
      // バックグラウンドで更新
      this.backgroundUpdate(url, options);
      return cachedResponse;
    }

    // 低優先度でフェッチ
    return fetch(url, {
      ...options,
      // @ts-ignore
      priority: 'low'
    });
  }

  private async balancedFetch(url: string, options?: RequestInit) {
    // SWRパターン
    const cache = await caches.open('adaptive-cache');
    const cachedResponse = await cache.match(url);

    const fetchPromise = fetch(url, options).then(response => {
      cache.put(url, response.clone());
      return response;
    });

    return cachedResponse || fetchPromise;
  }

  private prefetchRelated(url: string) {
    // 関連リソースのプリフェッチ
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    document.head.appendChild(link);
  }

  private async backgroundUpdate(url: string, options?: RequestInit) {
    // Web Workerでバックグラウンド更新
    if ('Worker' in window) {
      const worker = new Worker('/update-worker.js');
      worker.postMessage({ url, options });
    }
  }
}
```

## 実装パターン別ガイド

実際のアプリケーションタイプごとに、最適なデータフェッチング戦略の実装例を示します。これらのパターンを参考に、自分のプロジェクトに適用できます。

### ニュースサイトの実装例

```typescript
// +layout.server.ts
export const load: LayoutServerLoad = async ({ setHeaders }) => {
  // トップニュースは短期キャッシュ
  // 速報性を保ちつつ、サーバー負荷を軽減
  setHeaders({
    'cache-control': 'public, max-age=300, stale-while-revalidate=600'
  });

  return {
    topNews: await getTopNews()
  };
};

// +page.server.ts
export const load: PageServerLoad = async ({ params, setHeaders }) => {
  // 記事詳細は長期キャッシュ
  // 一度公開された記事はめったに変更されないため、積極的にキャッシュ
  setHeaders({
    'cache-control': 'public, max-age=3600, stale-while-revalidate=86400'
  });

  // 記事本文は即座に返す（重要コンテンツ）
  const article = await getArticle(params.id);

  // コメントはストリーミング（副次的コンテンツ）
  return {
    article,
    streamed: {
      comments: getComments(params.id),
      relatedArticles: getRelatedArticles(params.id)
    }
  };
};
```

### ECサイトの実装例

ECサイトでは、商品情報のキャッシュと在庫のリアルタイム性のバランスが重要です。

```typescript
// +page.server.ts (商品一覧)
export const load: PageServerLoad = async ({ url, platform, setHeaders }) => {
  const category = url.searchParams.get('category');

  // カテゴリごとにエッジでキャッシュ
  // Cloudflare KVを使用してグローバルに分散キャッシュ
  if (platform?.env?.KV) {
    const cached = await platform.env.KV.get(`products:${category}`);
    if (cached) {
      setHeaders({
        'cache-control': 'public, max-age=60',
        'x-cache': 'HIT'
      });
      return JSON.parse(cached);
    }
  }

  // 商品情報を取得
  const products = await getProducts(category);

  // 在庫情報は別途リアルタイム取得
  // 在庫は常に最新である必要があるため、キャッシュしない
  const inventory = products.map(p => getInventory(p.id));

  // エッジキャッシュを更新
  platform?.context?.waitUntil(
    platform.env.KV.put(
      `products:${category}`,
      JSON.stringify({ products }),
      { expirationTtl: 300 }
    )
  );

  return {
    products,
    streamed: {
      inventory: Promise.all(inventory)
    }
  };
};
```

### SaaSダッシュボードの実装例

SaaSダッシュボードでは、リアルタイムデータと静的UIの組み合わせが重要です。

```typescript
// +layout.server.ts
export const load: LayoutServerLoad = async ({ locals }) => {
  // ユーザー情報は必須
  // 認証チェックをレイアウトレベルで実施
  if (!locals.user) {
    throw redirect(303, '/login');
  }

  // 基本UIデータ
  return {
    user: locals.user,
    navigation: getNavigationForRole(locals.user.role)
  };
};

// +page.ts (クライアントサイド)
import { browser } from '$app/environment';

export const load: PageLoad = async ({ parent, fetch }) => {
  const { user } = await parent();

  if (browser) {
    // ブラウザではリアルタイムデータを取得
    // WebSocketでダッシュボードのメトリクスをリアルタイム更新
    const ws = new WebSocket(`wss://api.example.com/dashboard/${user.id}`);

    // 初期データ
    const metrics = await fetch('/api/metrics').then(r => r.json());

    return {
      metrics,
      // リアルタイム更新用のWebSocket
      realtimeConnection: ws
    };
  }

  // SSRでは静的データのみ
  return {
    metrics: await getStaticMetrics()
  };
};
```

## パフォーマンス測定と最適化

高度な戦略の効果を測定し、継続的に最適化するための監視システムを実装します。Googleが提唱するCore Web Vitalsを中心に、ユーザー体験を定量的に評価します。

### Core Web Vitalsの監視

```typescript
// lib/performance-monitor.ts
// パフォーマンス指標をリアルタイムで収集し、分析サービスに送信
export function monitorPerformance() {
  // LCP (Largest Contentful Paint): 最大コンテンツの描画時間
  new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1];
    console.log('LCP:', lastEntry.startTime);

    // 分析サービスに送信
    sendAnalytics('lcp', lastEntry.startTime);
  }).observe({ entryTypes: ['largest-contentful-paint'] });

  // FID (First Input Delay): 最初の入力遅延
  // ユーザーが最初にインタラクションしたときの応答性を測定
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const eventEntry = entry as PerformanceEventTiming;
      const inputDelay = eventEntry.processingStart - eventEntry.startTime;
      console.log('FID:', inputDelay);
      sendAnalytics('fid', inputDelay);
    }
  }).observe({ entryTypes: ['first-input'] });

  // CLS (Cumulative Layout Shift): 累積レイアウトシフト
  // ページ読み込み中の要素の移動量を累積計測
  let clsValue = 0;
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (!(entry as any).hadRecentInput) {
        clsValue += (entry as any).value;
        console.log('CLS:', clsValue);
        sendAnalytics('cls', clsValue);
      }
    }
  }).observe({ entryTypes: ['layout-shift'] });
}

function sendAnalytics(metric: string, value: number) {
  // Google Analytics 4に送信
  // Web Vitalsメトリクスをリアルタイムで分析サービスに送信
  if (typeof gtag !== 'undefined') {
    gtag('event', 'web_vitals', {
      metric_name: metric,
      metric_value: value,
      metric_delta: value
    });
  }
}
```

## ベストプラクティス

高度な戦略を成功させるための実践的なアプローチと注意点をまとめます。

### 1. 段階的な実装

```typescript
// フェーズ1: 基本的なキャッシュ
//   - ブラウザキャッシュヘッダーの設定
//   - メモリキャッシュの実装
// フェーズ2: Service Worker追加
//   - オフライン対応
//   - バックグラウンド同期
// フェーズ3: CDN統合
//   - グローバル配信
//   - エッジキャッシュ
// フェーズ4: エッジコンピューティング
//   - KVストレージ
//   - 動的な処理最適化
```

### 2. 測定駆動の最適化

```typescript
// 必ず測定してから最適化
// 1. 現状のパフォーマンス測定
//    - Core Web Vitalsの計測
//    - ネットワークウォーターフォール分析
// 2. ボトルネックの特定
//    - 遅いエンドポイントの発見
//    - キャッシュミスの分析
// 3. 適切な戦略の選択
//    - コストと効果のバランス
//    - 段階的実装計画
// 4. 実装と再測定
//    - A/Bテストによる検証
//    - 継続的な改善
```

### 3. フォールバック戦略

```typescript
// 常にフォールバックを用意
try {
  // 最適化された取得（キャッシュ、エッジなど）
  return await optimizedFetch();
} catch (error) {
  console.warn('最適化フェッチ失敗、フォールバックへ:', error);
  // 基本的な取得にフォールバック（直接fetch）
  return await basicFetch();
}
```

## まとめ

高度なデータフェッチング戦略により、従来のアプローチでは実現できなかったレベルのパフォーマンスとユーザー体験を実現できます。

- 🚀 **極限のパフォーマンス**: ミリ秒単位の最適化
- 🌐 **グローバル対応**: CDNとエッジで世界中に配信
- 📱 **オフライン対応**: PWAで常に利用可能
- 💰 **コスト削減**: 効率的なキャッシングでサーバー負荷軽減
- 🎯 **ユーザー体験向上**: 状況に応じた最適な戦略

これらの技術を適切に組み合わせることで、あらゆる環境で高速に動作するWebアプリケーションを構築できます。

## 次のステップ

- [WebSocket・SSE通信]({base}/sveltekit/server/websocket-sse/) - リアルタイム通信の実装
- [最適化編]({base}/sveltekit/optimization/) - さらなるパフォーマンス向上
- [デプロイメント]({base}/sveltekit/deployment/) - 本番環境への展開