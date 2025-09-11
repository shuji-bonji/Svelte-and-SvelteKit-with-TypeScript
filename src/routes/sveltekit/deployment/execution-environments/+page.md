---
title: 実行環境とランタイム
description: SvelteKitが動作する様々な実行環境とランタイムをTypeScriptで理解。Node.js、Edge Runtime、Cloudflare Workers、ブラウザ環境での動作とアダプターの仕組みを解説
---

SvelteKitは様々な実行環境で動作するように設計されており、それぞれの環境に最適化されたコードを生成します。このページでは、サーバーランタイム、クライアントランタイム、アダプターの仕組み、環境変数の処理について詳しく解説します。

## サーバーランタイム

SvelteKitは複数のサーバーランタイムをサポートしており、それぞれ異なる特性と利点を持っています。アプリケーションの要件に応じて、最適なランタイムを選択することが重要です。

### Node.js環境

Node.jsは最も一般的なサーバーランタイムで、フルスタックのJavaScript実行環境を提供します。ファイルシステムへのアクセス、データベース接続、サードパーティライブラリの豊富なエコシステムが利用可能です。

#### Node.js環境での実行コード例

```typescript
// +page.server.ts - Node.js環境での実行
import { readFile } from 'fs/promises';
import { join } from 'path';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  // Node.js APIを使用したファイル読み込み
  const dataPath = join(process.cwd(), 'data', 'posts.json');
  const fileContent = await readFile(dataPath, 'utf-8');
  const posts = JSON.parse(fileContent);
  
  return {
    posts,
    runtime: 'Node.js',
    version: process.version
  };
};
```

### Edge Runtime環境

Edge Runtimeは、エッジロケーションで実行される軽量なJavaScriptランタイムです。Vercel Edge Functions、Netlify Edge Functions、Deno Deployなどで利用されます。Web標準APIのみを使用し、高速な起動時間と低レイテンシーが特徴です。

#### Edge Runtime環境での制限と実装

```typescript
// +server.ts - Edge Runtime環境での実行
import type { RequestHandler } from './$types';

export const config = {
  runtime: 'edge' // Edge Runtimeを指定
};

export const GET: RequestHandler = async ({ url, platform }) => {
  // Edge RuntimeではWeb標準APIのみ使用可能
  // fs、path、processなどのNode.js APIは使用不可
  
  const response = await fetch('https://api.example.com/data');
  const data = await response.json();
  
  return new Response(JSON.stringify({
    data,
    runtime: 'Edge',
    region: platform?.env?.REGION || 'unknown'
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 's-maxage=60'
    }
  });
};
```

### Cloudflare Workers環境

Cloudflare Workersは、V8エンジン上で動作するサーバーレス実行環境です。グローバルなエッジネットワークで実行され、KVストア、Durable Objects、R2ストレージなどのCloudflareサービスと統合できます。

#### Workers環境での特殊なAPI使用例

```typescript
// +page.server.ts - Cloudflare Workers環境
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ platform }) => {
  // Cloudflare KVストアへのアクセス
  const kv = platform?.env?.MY_KV_NAMESPACE;
  
  if (kv) {
    // KVストアからデータを取得
    const cachedData = await kv.get('posts', 'json');
    
    if (cachedData) {
      return {
        posts: cachedData,
        source: 'KV Cache'
      };
    }
  }
  
  // キャッシュがない場合はAPIから取得
  const response = await fetch('https://api.example.com/posts');
  const posts = await response.json();
  
  // KVストアにキャッシュ（1時間）
  if (kv) {
    await kv.put('posts', JSON.stringify(posts), {
      expirationTtl: 3600
    });
  }
  
  return { posts, source: 'API' };
};
```

## クライアントランタイム

クライアント側では、ブラウザ環境でSvelteKitアプリケーションが実行されます。ブラウザAPIへのアクセス、DOM操作、ユーザーインタラクションの処理が可能です。

### ブラウザ環境の検出と処理

サーバーとクライアントの両方で実行される可能性があるコードでは、実行環境を適切に検出する必要があります。

```typescript
// +page.ts - ユニバーサルコード
import { browser } from '$app/environment';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
  let userData = null;
  
  if (browser) {
    // ブラウザ環境でのみ実行
    // LocalStorageへのアクセス
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      userData = JSON.parse(savedUser);
    }
    
    // ブラウザAPIの使用
    console.log('User Agent:', navigator.userAgent);
    console.log('Screen Size:', `${screen.width}x${screen.height}`);
  } else {
    // サーバー環境での処理
    console.log('Running on server');
  }
  
  return {
    userData,
    isClient: browser
  };
};
```

### Web APIの安全な使用

ブラウザ固有のAPIを使用する際は、サーバーサイドレンダリング時のエラーを防ぐため、適切なガードを設ける必要があります。

```svelte
<!-- +page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  
  let geolocation = $state<GeolocationPosition | null>(null);
  let webglSupported = $state(false);
  
  onMount(() => {
    // onMount内はクライアントのみで実行
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          geolocation = position;
        },
        (error) => {
          console.error('Geolocation error:', error);
        }
      );
    }
    
    // WebGLサポートチェック
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    webglSupported = !!gl;
  });
  
  // 条件付きインポート
  $effect(() => {
    if (browser && webglSupported) {
      import('three').then((THREE) => {
        // Three.jsを使用した3D描画
        console.log('Three.js loaded:', THREE.REVISION);
      });
    }
  });
</script>
```

## アダプターの仕組み

アダプターは、SvelteKitアプリケーションを特定のデプロイメントターゲットに最適化する重要な仕組みです。各プラットフォームの特性に合わせて、ビルド出力を変換します。

### 主要なアダプターと設定

#### adapter-node（Node.js環境）

Node.js環境向けの標準的なアダプターで、Express互換のサーバーを生成します。

```javascript
// svelte.config.js
import adapter from '@sveltejs/adapter-node';

export default {
  kit: {
    adapter: adapter({
      out: 'build',
      precompress: true,
      envPrefix: 'APP_',
    })
  }
};
```

#### adapter-vercel（Vercel Edge Functions）

VercelのEdge FunctionsとServerless Functionsの両方をサポートします。

```javascript
// svelte.config.js
import adapter from '@sveltejs/adapter-vercel';

export default {
  kit: {
    adapter: adapter({
      runtime: 'edge', // または 'nodejs18.x'
      regions: ['iad1'], // エッジリージョンの指定
      split: true // ルートごとに関数を分割
    })
  }
};
```

#### adapter-cloudflare（Cloudflare Workers/Pages）

Cloudflare WorkersまたはCloudflare Pages向けのアダプターです。

```javascript
// svelte.config.js
import adapter from '@sveltejs/adapter-cloudflare';

export default {
  kit: {
    adapter: adapter({
      routes: {
        include: ['/*'],
        exclude: ['<all>']
      }
    })
  }
};
```

### カスタムアダプターの作成

特殊な要件がある場合、カスタムアダプターを作成することも可能です。

```typescript
// my-adapter/index.js
export default function myAdapter(options = {}) {
  return {
    name: 'my-custom-adapter',
    async adapt(builder) {
      // ビルダーAPIを使用してファイルを生成
      builder.log.minor('Generating custom output...');
      
      // アプリケーションのビルド
      const tmp = builder.getBuildDirectory('my-adapter');
      builder.rimraf(tmp);
      builder.mkdirp(tmp);
      
      // サーバーコードの生成
      builder.writeServer(tmp);
      
      // クライアントアセットのコピー
      builder.writeClient(`${tmp}/public`);
      
      // プリレンダリングされたページの処理
      builder.writePrerendered(`${tmp}/prerendered`);
      
      // カスタム設定ファイルの生成
      builder.copy('my-adapter/template', tmp);
    }
  };
}
```

## 環境変数の処理

SvelteKitは環境変数を安全に管理するための仕組みを提供しています。`PUBLIC_`プレフィックスの有無により、クライアント側での利用可否が決まります。

### 環境変数の種類と使用方法

#### プライベート環境変数（サーバーのみ）

セキュリティ上重要な情報は、サーバー側でのみアクセス可能な環境変数として管理します。

```typescript
// +page.server.ts
import { env } from '$env/dynamic/private';
// または
import { SECRET_API_KEY, DATABASE_URL } from '$env/static/private';

export const load = async () => {
  // サーバー側でのみアクセス可能
  const apiKey = env.SECRET_API_KEY;
  const dbUrl = DATABASE_URL;
  
  // データベース接続
  const db = await connectDB(dbUrl);
  const data = await db.query('SELECT * FROM posts');
  
  return {
    posts: data,
    // 注意: apiKeyをreturnしてはいけない（クライアントに露出する）
  };
};
```

#### パブリック環境変数（クライアント/サーバー両方）

`PUBLIC_`プレフィックスを持つ環境変数は、クライアント側でも安全に使用できます。

```typescript
// +page.ts または +page.svelte
import { PUBLIC_API_URL, PUBLIC_SITE_NAME } from '$env/static/public';
// または
import { env } from '$env/dynamic/public';

export const load = async ({ fetch }) => {
  // クライアント側でもアクセス可能
  const response = await fetch(`${PUBLIC_API_URL}/posts`);
  const posts = await response.json();
  
  return {
    posts,
    siteName: PUBLIC_SITE_NAME
  };
};
```

### 環境変数の設定ファイル

開発環境と本番環境で異なる設定を管理するための`.env`ファイルの構成例です。

```bash
# .env（開発環境）
DATABASE_URL=postgresql://localhost:5432/dev_db
SECRET_API_KEY=dev_secret_key_123
PUBLIC_API_URL=http://localhost:3000/api
PUBLIC_SITE_NAME="My Dev Site"

# .env.production（本番環境）
DATABASE_URL=postgresql://prod-server:5432/prod_db
SECRET_API_KEY=prod_secret_key_xyz
PUBLIC_API_URL=https://api.example.com
PUBLIC_SITE_NAME="My Production Site"
```


## プラットフォーム固有の最適化

### Vercel環境での最適化

```typescript
// +server.ts - Vercel Edge Functionの設定
export const config = {
  runtime: 'edge',
  regions: ['iad1', 'sfo1'], // マルチリージョン配信
};

export const GET = async ({ platform }) => {
  // Vercel固有の環境変数
  const region = platform?.env?.VERCEL_REGION;
  const url = platform?.env?.VERCEL_URL;
  
  return new Response(JSON.stringify({
    region,
    url,
    timestamp: Date.now()
  }));
};
```

### Cloudflare環境での最適化

```typescript
// +page.server.ts - Cloudflare Workers KVとDurable Objects
export const load = async ({ platform }) => {
  const kv = platform?.env?.KV_NAMESPACE;
  const durableObject = platform?.env?.DURABLE_OBJECT;
  
  // Durable Objectsを使用した状態管理
  if (durableObject) {
    const id = durableObject.idFromName('session');
    const stub = durableObject.get(id);
    const response = await stub.fetch('https://internal/session');
    const session = await response.json();
    
    return { session };
  }
  
  return { session: null };
};
```

## ベストプラクティス

### 1. 環境検出とフォールバック

```typescript
// lib/utils/environment.ts - 環境検出ユーティリティ
import { browser, building, dev } from '$app/environment';

export function getRuntime() {
  if (browser) return 'browser';
  if (building) return 'build';
  if (typeof Deno !== 'undefined') return 'deno';
  if (typeof process !== 'undefined' && process.versions?.node) return 'node';
  if (typeof EdgeRuntime !== 'undefined') return 'edge';
  return 'unknown';
}

export function hasCapability(capability: string): boolean {
  const runtime = getRuntime();
  
  switch (capability) {
    case 'fs':
      return runtime === 'node';
    case 'websocket':
      return runtime === 'node' || runtime === 'browser';
    case 'webgl':
      return runtime === 'browser';
    case 'kv':
      return runtime === 'cloudflare';
    default:
      return false;
  }
}
```

### 2. プラットフォーム抽象化レイヤー

```typescript
// lib/platform/storage.ts - ストレージ抽象化
export interface StorageAdapter {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
}

// Node.js実装
export class NodeStorage implements StorageAdapter {
  private cache = new Map<string, { value: string; expires?: number }>();
  
  async get(key: string) {
    const item = this.cache.get(key);
    if (!item) return null;
    if (item.expires && item.expires < Date.now()) {
      this.cache.delete(key);
      return null;
    }
    return item.value;
  }
  
  async set(key: string, value: string, ttl?: number) {
    this.cache.set(key, {
      value,
      expires: ttl ? Date.now() + ttl * 1000 : undefined
    });
  }
  
  async delete(key: string) {
    this.cache.delete(key);
  }
}

// Cloudflare KV実装
export class KVStorage implements StorageAdapter {
  constructor(private kv: KVNamespace) {}
  
  async get(key: string) {
    return await this.kv.get(key);
  }
  
  async set(key: string, value: string, ttl?: number) {
    await this.kv.put(key, value, {
      expirationTtl: ttl
    });
  }
  
  async delete(key: string) {
    await this.kv.delete(key);
  }
}
```

### 3. 重要指標の定義と測定

| 指標 | SSR | SSG | SPA | 推奨用途 |
|---|---|---|---|---|
| **ページビュー追跡** | ◎ | △ | ✗ | コンテンツサイト |
| **ユーザーフロー分析** | ◎ | △ | ✗ | ECサイト |
| **リアルタイム分析** | ◎ | ✗ | △ | ダッシュボード |
| **SEOパフォーマンス** | ◎ | ◎ | ✗ | マーケティングサイト |
| **サーバー負荷** | ✗ | ◎ | ◎ | 高トラフィックサイト |

### 4. セキュリティ監査への配慮

```typescript
// セキュリティログの強化
export const handle: Handle = async ({ event, resolve }) => {
  // 疑わしいアクセスパターンの検出
  const ip = event.getClientAddress();
  const userAgent = event.request.headers.get('user-agent');
  
  // レート制限チェック
  if (await isRateLimited(ip)) {
    return new Response('Too Many Requests', { status: 429 });
  }
  
  // アクセスログ記録
  await logAccess({
    ip,
    path: event.url.pathname,
    method: event.request.method,
    userAgent,
    timestamp: new Date()
  });
  
  return resolve(event);
};
```

## パフォーマンス最適化

### ランタイム別の最適化戦略

各ランタイム環境には固有の最適化手法があり、適切に活用することでパフォーマンスを大幅に改善できます。

| ランタイム | 最適化手法 | 注意点 |
|-----------|----------|--------|
| **Node.js** | Worker Threads、Cluster | メモリ使用量 |
| **Edge Runtime** | Response Streaming、Cache API | API制限 |
| **Cloudflare Workers** | KV Cache、Durable Objects | CPU時間制限 |
| **ブラウザ** | Code Splitting、Lazy Loading | バンドルサイズ |

### パフォーマンス測定の実装

```typescript
// hooks.server.ts - パフォーマンス測定
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  const start = performance.now();
  
  const response = await resolve(event);
  
  const duration = performance.now() - start;
  
  // Server-Timingヘッダーで測定結果を送信
  response.headers.set(
    'Server-Timing',
    `sveltekit;dur=${duration};desc="Total SvelteKit processing"`
  );
  
  return response;
};
```

## まとめ

SvelteKitの実行環境とランタイムを理解することで、アプリケーションを最適な環境にデプロイし、パフォーマンスを最大化できます。各ランタイムの特性を理解し、適切なアダプターを選択することが重要です。

:::tip[重要なポイント]
- **Node.js**: フルスタック機能が必要な場合
- **Edge Runtime**: 低レイテンシーとグローバル配信が必要な場合
- **Cloudflare Workers**: KVストアやDurable Objectsを活用する場合
- **環境変数**: PUBLIC_プレフィックスでクライアント露出を制御
- **アダプター**: デプロイ先に応じて適切に選択
:::

## 関連情報

- [アクセスログと分析戦略](/sveltekit/architecture/access-logs/) - レンダリング戦略ごとのログ記録パターン
- [プラットフォーム別デプロイ](/sveltekit/deployment/platforms/) - 各プラットフォームへのデプロイ方法

## 次のステップ

- [アクセスログと分析戦略](/sveltekit/architecture/access-logs/) - レンダリング戦略とログの関係
- [ルーティング内部動作](/sveltekit/architecture/routing-internals/) - ファイルベースルーティングの仕組み
- [ビルド最適化](/sveltekit/architecture/build-optimization/) - パフォーマンス改善手法