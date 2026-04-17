---
title: Service Workers / PWA
description: SvelteKitでPWA（Progressive Web App）を構築。Service Workerによるオフライン対応、キャッシュ戦略、Web App Manifest設定をTypeScriptで解説
---

<script>
	import Admonition from '$lib/components/Admonition.svelte';
  import Mermaid from '$lib/components/Mermaid.svelte';

  const serviceWorkerDiagram = `flowchart LR
    subgraph browser[ブラウザ]
        APP[App]
    end

    subgraph sw[Service Worker]
        CACHE[Cache]
    end

    subgraph network[ネットワーク]
        SERVER[Server]
    end

    APP -->|リクエスト| CACHE
    CACHE -->|フェッチ| SERVER
    SERVER -->|レスポンス| CACHE
    CACHE -->|キャッシュ/返却| APP

    style browser fill:#e3f2fd
    style sw fill:#fff3e0
    style network fill:#e8f5e9`;
</script>

SvelteKit は Service Workers を標準でサポートしており、Progressive Web App（PWA）を簡単に構築できます。
オフライン対応やキャッシュ戦略を実装することで、ネイティブアプリに近いユーザー体験を提供できます。

## この記事で学べること

- Service Workers の基本概念と仕組み
- SvelteKit での Service Worker の設定と実装
- キャッシュ戦略とオフライン対応
- Web App Manifest の設定
- PWA のベストプラクティス

## Service Workers とは

Service Workers は、アプリとネットワーク間のプロキシサーバーとして機能します。
これにより、以下のことが可能になります。

<Mermaid diagram={serviceWorkerDiagram} />

**Service Worker の機能:**

- リクエストの傍受と制御
- レスポンスのキャッシュ
- オフライン時のキャッシュ返却
- バックグラウンド同期

## 基本的な設定

SvelteKit では、`src/service-worker.js`（または `src/service-worker/index.js`）を作成すると、自動的にバンドルされて登録されます。特別な設定なしで Service Worker が有効になり、オフライン対応やキャッシュ機能を追加できます。

### 最小限の Service Worker

以下は、SvelteKit の Service Worker の基本的な実装例です。インストール時にアセットをキャッシュし、アクティベート時に古いキャッシュを削除し、フェッチ時にキャッシュ戦略を適用するという、3つの主要なイベントを処理しています。

```javascript
// src/service-worker.js

// Service Worker 環境の型定義
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />
/// <reference types="@sveltejs/kit" />

import { build, files, version } from '$service-worker';

// Service Worker グローバルスコープの型付け
const sw = /** @type {ServiceWorkerGlobalScope} */ (
  /** @type {unknown} */ (globalThis.self)
);

// デプロイメントごとにユニークなキャッシュ名を作成
const CACHE = `cache-${version}`;

// キャッシュするアセット
const ASSETS = [
  ...build, // アプリのビルドファイル
  ...files, // static ディレクトリのファイル
];

// インストール時にアセットをキャッシュ
sw.addEventListener('install', (event) => {
  async function addFilesToCache() {
    const cache = await caches.open(CACHE);
    await cache.addAll(ASSETS);
  }

  event.waitUntil(addFilesToCache());
});

// アクティベート時に古いキャッシュを削除
sw.addEventListener('activate', (event) => {
  async function deleteOldCaches() {
    for (const key of await caches.keys()) {
      if (key !== CACHE) await caches.delete(key);
    }
  }

  event.waitUntil(deleteOldCaches());
});

// ネットワークリクエストの傍受
sw.addEventListener('fetch', (event) => {
  // GET以外のリクエストは無視
  if (event.request.method !== 'GET') return;

  async function respond() {
    const url = new URL(event.request.url);
    const cache = await caches.open(CACHE);

    // ビルドファイルとstaticファイルはキャッシュから返す
    if (ASSETS.includes(url.pathname)) {
      const response = await cache.match(url.pathname);
      if (response) {
        return response;
      }
    }

    // その他はネットワークファースト、オフライン時はキャッシュを使用
    try {
      const response = await fetch(event.request);

      if (!(response instanceof Response)) {
        throw new Error('invalid response from fetch');
      }

      if (response.status === 200) {
        cache.put(event.request, response.clone());
      }

      return response;
    } catch (err) {
      const response = await cache.match(event.request);

      if (response) {
        return response;
      }

      throw err;
    }
  }

  event.respondWith(respond());
});
```

このコードの主要なポイントは以下の通りです。

- **version によるキャッシュ名**: デプロイごとにキャッシュ名が変わるため、新しいバージョンでは自動的に新しいキャッシュが作成されます
- **install イベント**: 初回インストール時にすべてのアセットをプリキャッシュします
- **activate イベント**: 新しい Service Worker がアクティブになった時、古いキャッシュを削除します
- **fetch イベント**: ネットワークリクエストを傍受し、キャッシュ戦略を適用します

### $service-worker モジュール

SvelteKit は Service Worker 内で使用できる特別なモジュール `$service-worker` を提供します。このモジュールは、アプリのビルド情報やバージョン情報にアクセスするために使用します。

```javascript
import { build, files, prerendered, version, base } from '$service-worker';

// build: アプリのJavaScript/CSSファイルのパス配列
// files: staticディレクトリのファイルパス配列
// prerendered: プリレンダリングされたページのパス配列
// version: デプロイメントのバージョン文字列
// base: アプリのベースパス
```

## キャッシュ戦略

Service Worker の最も重要な機能の一つが、リクエストに対するキャッシュ戦略の選択です。用途に応じて適切なキャッシュ戦略を選択することで、パフォーマンスとデータの鮮度のバランスを取ることができます。

### キャッシュファースト（静的アセット向け）

キャッシュファースト戦略は、まずキャッシュを確認し、存在すれば即座に返します。存在しない場合のみネットワークにリクエストします。JavaScript、CSS、画像などの静的アセットに最適です。

```javascript
// アプリのビルドファイルはキャッシュファースト
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  if (cached) {
    return cached;
  }

  const response = await fetch(request);
  cache.put(request, response.clone());
  return response;
}
```

### ネットワークファースト（動的コンテンツ向け）

ネットワークファースト戦略は、まずネットワークからデータを取得し、失敗した場合のみキャッシュを返します。API レスポンスや頻繁に更新されるデータに適しています。オフライン時でも最後に取得したデータを表示できます。

```javascript
// APIレスポンスはネットワークファースト
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);

  try {
    const response = await fetch(request);
    cache.put(request, response.clone());
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    throw error;
  }
}
```

### Stale-While-Revalidate（バランス型）

Stale-While-Revalidate 戦略は、キャッシュがあれば即座に返しつつ、バックグラウンドでネットワークから最新データを取得してキャッシュを更新します。ユーザーには素早くレスポンスを返しながら、次回のリクエストでは最新データが表示されます。ニュースフィードやプロフィール情報など、多少古くても許容されるデータに適しています。

```javascript
// キャッシュを返しつつ、バックグラウンドで更新
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request);

  // バックグラウンドで更新
  const fetchPromise = fetch(request).then((response) => {
    cache.put(request, response.clone());
    return response;
  });

  // キャッシュがあれば即座に返す、なければネットワークを待つ
  return cached || fetchPromise;
}
```

## TypeScript での実装

TypeScript で Service Worker を書くことで、型安全性を確保し、エディタの補完機能を活用できます。ただし、Service Worker は通常の DOM 環境ではなく Web Worker 環境で動作するため、特別な設定が必要です。

### tsconfig.json の設定

Service Worker ファイルで Web Worker の API を使用するため、`lib` に `WebWorker` を追加します。

```json
{
  "compilerOptions": {
    "lib": ["ESNext", "WebWorker"]
  }
}
```

### TypeScript Service Worker

以下は、TypeScript で書かれた完全な Service Worker の実装例です。型アノテーションにより、イベントハンドラやキャッシュ操作の型安全性が保証されます。

```typescript
// src/service-worker.ts
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />
/// <reference types="@sveltejs/kit" />

import { build, files, prerendered, version } from '$service-worker';

declare const self: ServiceWorkerGlobalScope;

const CACHE_NAME = `app-cache-${version}`;

const STATIC_ASSETS = new Set([...build, ...files]);

// プリキャッシュするアセット
const PRECACHE_ASSETS: string[] = [...build, ...files, ...prerendered];

self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    }),
  );
});

self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key)),
      );
    }),
  );
});

self.addEventListener('fetch', (event: FetchEvent) => {
  const { request } = event;
  const url = new URL(request.url);

  // 同一オリジンのリクエストのみ処理
  if (url.origin !== location.origin) return;

  // GET以外は無視
  if (request.method !== 'GET') return;

  event.respondWith(handleFetch(request));
});

async function handleFetch(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const cache = await caches.open(CACHE_NAME);

  // 静的アセットはキャッシュファースト
  if (STATIC_ASSETS.has(url.pathname)) {
    const cached = await cache.match(request);
    if (cached) return cached;
  }

  // その他はネットワークファースト
  try {
    const response = await fetch(request);

    if (response.ok) {
      cache.put(request, response.clone());
    }

    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;

    // オフラインフォールバック
    return new Response('Offline', { status: 503 });
  }
}
```

## Web App Manifest

PWA として動作させるには、Web App Manifest が必要です。これはアプリの名前、アイコン、テーマカラー、表示モードなどを定義する JSON ファイルで、ブラウザに「このサイトはインストール可能なアプリである」ことを伝えます。

### manifest.json の作成

`static` ディレクトリに `manifest.json` を作成します。このファイルには、アプリのメタデータとアイコン情報を記述します。

```json
// static/manifest.json
{
  "name": "My SvelteKit App",
  "short_name": "SvelteApp",
  "description": "SvelteKitで構築したPWA",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#ff3e00",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512-maskable.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ]
}
```

### HTML への組み込み

作成した manifest.json を HTML に読み込みます。`app.html` に `<link>` タグを追加し、テーマカラーと Apple Touch Icon も設定します。

```html
<!-- src/app.html -->
<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#ff3e00" />
    <link rel="manifest" href="/manifest.json" />
    <link rel="apple-touch-icon" href="/icons/icon-192.png" />
    %sveltekit.head%
  </head>
  <body data-sveltekit-preload-data="hover">
    <div style="display: contents">%sveltekit.body%</div>
  </body>
</html>
```

## 手動登録

SvelteKit は Service Worker を自動的に登録しますが、より細かな制御が必要な場合は手動登録を使用できます。例えば、Service Worker の更新を検出してユーザーに通知したい場合や、登録のタイミングを制御したい場合に有効です。

### svelte.config.js での設定

まず、自動登録を無効にする設定を追加します。

```javascript
// svelte.config.js
import adapter from '@sveltejs/adapter-auto';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter(),
    serviceWorker: {
      register: false, // 自動登録を無効化
    },
  },
};

export default config;
```

### 手動登録の実装

ルートレイアウトで Service Worker を手動登録します。この例では、更新の検出とログ出力も実装しています。`updatefound` イベントをリスニングすることで、新しいバージョンが利用可能になったことをユーザーに通知できます。

```svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { dev } from '$app/environment';

  onMount(async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register(
          '/service-worker.js',
          {
            // 開発時はモジュールタイプを指定
            type: dev ? 'module' : 'classic'
          }
        );

        console.log('Service Worker registered:', registration.scope);

        // 更新の検出
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker?.addEventListener('statechange', () => {
            if (newWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // 新しいバージョンが利用可能
                console.log('New version available!');
              }
            }
          });
        });
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  });
</script>

<slot />
```

## オフラインページ

PWA の重要な機能の一つが、オフライン時のユーザー体験です。ネットワークが利用できない場合でも、適切なフォールバックページを表示することで、ユーザーに状況を伝え、接続が回復した際のアクションを促すことができます。

### オフラインページの作成

Svelte 5 の `$state` を使用して、オンライン/オフライン状態をリアクティブに管理するオフラインページを作成します。

```svelte
<!-- src/routes/offline/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';

  let isOnline = $state(true);

  onMount(() => {
    isOnline = navigator.onLine;

    function handleOnline() {
      isOnline = true;
    }

    function handleOffline() {
      isOnline = false;
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  });
</script>

<div class="offline-page">
  <h1>オフラインです</h1>
  <p>インターネット接続がありません。</p>

  {#if isOnline}
    <p>接続が回復しました！</p>
    <a href="/">ホームに戻る</a>
  {:else}
    <p>接続を確認してください。</p>
    <button onclick={() => location.reload()}>再試行</button>
  {/if}
</div>

<style>
  .offline-page {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    text-align: center;
    padding: 2rem;
  }
</style>
```

### Service Worker でのオフラインフォールバック

Service Worker 側では、ナビゲーションリクエスト（ページ遷移）が失敗した場合にオフラインページを返すように設定します。これにより、オフライン時にどのページにアクセスしても、適切なフォールバックが表示されます。

```javascript
// src/service-worker.js（fetchイベント内）
sw.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    (async () => {
      const url = new URL(event.request.url);

      // ナビゲーションリクエストの場合
      if (event.request.mode === 'navigate') {
        try {
          return await fetch(event.request);
        } catch {
          // オフライン時はフォールバックページを返す
          const cache = await caches.open(CACHE);
          return (
            cache.match('/offline') || new Response('Offline', { status: 503 })
          );
        }
      }

      // その他のリクエスト
      // ...既存のロジック
    })(),
  );
});
```

## 開発時の注意事項

Service Worker の開発には、いくつかの注意点があります。開発時と本番時で動作が異なる部分があるため、テスト方法を理解しておくことが重要です。

### 開発モードでの制限

Service Worker は本番ビルド時にアセットがバンドルされるため、開発モードでは一部の機能に制限があります。

```javascript
// 開発時はbuildとprerenderedが空配列
import { build, files, prerendered } from '$service-worker';

console.log(build); // 開発時: []
console.log(prerendered); // 開発時: []
console.log(files); // staticディレクトリのファイルは利用可能
```

<Admonition type="warning" title="モジュールサポート">

開発時は [Service Workers でのモジュール](https://web.dev/es-modules-in-sw) をサポートするブラウザでのみ動作します。

</Admonition>

### デバッグ方法

1. **Chrome DevTools**: Application タブ → Service Workers
2. **更新の強制**: 「Update on reload」を有効化
3. **キャッシュの確認**: Cache Storage で内容を確認
4. **オフラインテスト**: Network タブで「Offline」を有効化

## Workbox との統合

SvelteKit の標準 Service Worker で多くの要件をカバーできますが、より高度な PWA 機能（バックグラウンド同期、プッシュ通知、高度なキャッシュ戦略など）が必要な場合は、Workbox や Vite PWA プラグインを使用できます。これらのツールは、複雑な Service Worker ロジックを簡潔に記述できる API を提供します。

### Vite PWA プラグインの使用

`@vite-pwa/sveltekit` を使用すると、宣言的な設定だけで PWA 機能を追加できます。

```bash
npm install -D @vite-pwa/sveltekit
```

```javascript
// vite.config.ts
import { sveltekit } from '@sveltejs/kit/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    sveltekit(),
    SvelteKitPWA({
      manifest: {
        name: 'My App',
        short_name: 'App',
        theme_color: '#ff3e00',
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
      },
    }),
  ],
});
```

## ベストプラクティス

PWA を本番環境で運用する際のベストプラクティスを紹介します。適切なキャッシュ管理、バージョン管理、エラーハンドリングが重要です。

### キャッシュに関する注意

キャッシュするファイルのサイズと種類に注意が必要です。大きなファイルをキャッシュすると、ストレージ容量を圧迫し、インストール時間が長くなります。

```javascript
// ❌ 大きなファイルをキャッシュしすぎない
const ASSETS = [...build, ...files, ...largeVideoFiles]; // 危険

// ✅ 必要なファイルのみキャッシュ
const ASSETS = [...build, ...files.filter((f) => !f.endsWith('.mp4'))];
```

### バージョン管理

新しいバージョンをデプロイした際に、古いキャッシュが残っているとユーザーに古いコンテンツが表示され続ける問題が発生します。`version` を使用したキャッシュ名と、古いキャッシュの確実な削除が重要です。

```javascript
// デプロイごとにキャッシュを更新
const CACHE = `cache-${version}`;

// 古いキャッシュは確実に削除
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)),
        ),
      ),
  );
});
```

### エラーハンドリング

Service Worker 内でのエラーは、適切に処理しないとユーザーに白い画面が表示されるなどの問題が発生します。すべてのフェッチ処理で適切なエラーハンドリングを実装しましょう。

```javascript
// フェッチエラーを適切に処理
try {
  const response = await fetch(request);

  // 不正なレスポンスをチェック
  if (!(response instanceof Response)) {
    throw new Error('Invalid response');
  }

  return response;
} catch (error) {
  console.error('Fetch failed:', error);
  // フォールバック処理
}
```

## まとめ

SvelteKit の Service Worker サポートを使用することで、以下のことが実現できます。

- **オフライン対応**: ネットワークがなくても動作するアプリ
- **高速なナビゲーション**: プリキャッシュによる即座のページ表示
- **インストール可能**: ホーム画面に追加できる PWA
- **バックグラウンド同期**: オフライン時の操作を後で同期

Service Workers を適切に実装することで、ユーザー体験を大幅に向上させることができます。

## 次のステップ

- [キャッシュ戦略](/sveltekit/optimization/caching/) - より詳細なキャッシュ設定
- [パフォーマンス最適化](/sveltekit/optimization/performance/) - 全体的なパフォーマンス改善
- [ビルド最適化](/sveltekit/optimization/build-optimization/) - ビルド設定の最適化

## 参考リンク

- [MDN Web Docs: Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers)
- [web.dev: Learn PWA](https://web.dev/learn/pwa/)
- [Vite PWA Plugin](https://vite-pwa-org.netlify.app/frameworks/sveltekit.html)
