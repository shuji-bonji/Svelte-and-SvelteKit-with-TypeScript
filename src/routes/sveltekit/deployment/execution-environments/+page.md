---
title: 実行環境とランタイム
description: SvelteKitが動作する様々な実行環境とランタイムをTypeScriptで理解。Node.js、Edge Runtime、Cloudflare Workers、ブラウザ環境での動作とアダプターの仕組みを解説
---

<script>
	import Admonition from '$lib/components/Admonition.svelte';
</script>

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
    version: process.version,
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
  runtime: 'edge', // Edge Runtimeを指定
};

export const GET: RequestHandler = async ({ url, platform }) => {
  // Edge RuntimeではWeb標準APIのみ使用可能
  // fs、path、processなどのNode.js APIは使用不可

  const response = await fetch('https://api.example.com/data');
  const data = await response.json();

  return new Response(
    JSON.stringify({
      data,
      runtime: 'Edge',
      region: platform?.env?.REGION || 'unknown',
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 's-maxage=60',
      },
    },
  );
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
        source: 'KV Cache',
      };
    }
  }

  // キャッシュがない場合はAPIから取得
  const response = await fetch('https://api.example.com/posts');
  const posts = await response.json();

  // KVストアにキャッシュ（1時間）
  if (kv) {
    await kv.put('posts', JSON.stringify(posts), {
      expirationTtl: 3600,
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
    isClient: browser,
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

Node.js環境向けの標準的なアダプターで、Express/Connect/Polka互換のリクエストハンドラを生成します。`@sveltejs/adapter-node` 5.x（SvelteKit 2.x系列）では、デフォルトで `SIGTERM` / `SIGINT` 時のグレースフルシャットダウンが組み込まれています。

```javascript
// svelte.config.js
import adapter from '@sveltejs/adapter-node';

export default {
  kit: {
    adapter: adapter({
      out: 'build',
      precompress: true,
      envPrefix: 'APP_',
    }),
  },
};
```

##### グレースフルシャットダウンと `sveltekit:shutdown` イベント

`adapter-node` は `SIGTERM` / `SIGINT` を受信すると次のシーケンスで停止します。

1. 新規リクエストの受付を停止（`server.close`）
2. 進行中リクエストが完了したコネクションから順にクローズ（`server.closeIdleConnections`）
3. `SHUTDOWN_TIMEOUT` 秒（既定: 30秒）経過後、残ったコネクションを強制的に切断（`server.closeAllConnections`）

すべてのコネクションが閉じられた後、Node標準の `exit` イベントとは異なり**非同期処理を待てる** `sveltekit:shutdown` イベントが発行されます。DB接続やジョブキューの後始末はここで行うのが推奨です。

```typescript
// hooks.server.ts - グレースフルシャットダウンのハンドリング
import { db } from '$lib/server/db';
import { jobs } from '$lib/server/jobs';

// reason: 'SIGINT' | 'SIGTERM' | 'IDLE'
process.on('sveltekit:shutdown', async (reason) => {
  console.log(`[shutdown] reason=${reason}`);

  // 非同期処理を待てる
  await jobs.stop();
  await db.close();

  console.log('[shutdown] cleanup completed');
});
```

SIGTERMの強制終了タイムアウトを変更したい場合は環境変数で調整します。

```sh
# 60秒待ってから残コネクションを強制切断
SHUTDOWN_TIMEOUT=60 node build
```

:::tip[Kubernetes / Docker でのグレースフルシャットダウン]
コンテナオーケストレータが送る `SIGTERM` を確実にNodeプロセスへ届けるには、`CMD ["node", "build"]` のように **exec form** でエントリポイントを書く必要があります。`CMD node build`（shell form）の場合は `/bin/sh` がPID 1となり、シグナルが転送されません。
:::

#### adapter-vercel（Vercel Edge Functions / Serverless Functions）

VercelのEdge FunctionsとServerless Functionsの両方をサポートします。指定可能な `runtime` は `'edge'`、`'nodejs20.x'`、`'nodejs22.x'` です（`'nodejs18.x'` はSvelteKit 2.x現行版ではサポート対象外）。

```javascript
// svelte.config.js
import adapter from '@sveltejs/adapter-vercel';

export default {
  kit: {
    adapter: adapter({
      // 'edge' / 'nodejs20.x' / 'nodejs22.x' のいずれか
      // 未指定の場合、Vercelダッシュボード側のNodeバージョン設定が自動採用される
      runtime: 'nodejs22.x',
      regions: ['iad1'], // エッジリージョンの指定
      split: true, // ルートごとに関数を分割
    }),
  },
};
```

:::warning[`runtime` オプションは非推奨化が進行中]
Vercel側のFunctions Configurationの方針変更により、`@sveltejs/adapter-vercel` の `runtime` オプションは将来のバージョンで削除される予定です。今後はVercelダッシュボードのプロジェクト設定（Settings → General → Node.js Version）で指定したNodeバージョンが自動的に使われるようになります。

`export const config = { runtime: '...' }` をページ・エンドポイント単位で書いている場合も、新規コードでは原則指定せず、Vercel側の設定に任せることが推奨されます。
:::

#### adapter-cloudflare（Cloudflare Workers / Pages 統合）

Cloudflare WorkersとCloudflare Pagesの両方を扱える統合アダプターです。

:::info[`adapter-cloudflare-workers` は廃止]
従来のWorkers Sites向けアダプター `@sveltejs/adapter-cloudflare-workers` は **deprecated** となり、Cloudflare自体も[Workers Sites](https://developers.cloudflare.com/workers/configuration/sites/configuration/)ではなく[Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/)を推奨しています。新規・既存とも `@sveltejs/adapter-cloudflare` への移行が必要です。
:::

```javascript
// svelte.config.js
import adapter from '@sveltejs/adapter-cloudflare';

export default {
  kit: {
    adapter: adapter({
      // 非マッチアセット時のフォールバック: 'plaintext'（既定） または 'spa'
      fallback: 'plaintext',
      // Pages 向け _routes.json の生成カスタマイズ（Workers では不要）
      routes: {
        include: ['/*'],
        exclude: ['<all>'],
      },
    }),
  },
};
```

##### Workers Static Assets の構成

Cloudflare Workersへデプロイする場合、`wrangler.jsonc` で `assets` セクションを定義し、SvelteKitビルド出力ディレクトリを静的アセットとしてバインドします。

```jsonc
// wrangler.jsonc
{
  "name": "my-sveltekit-app",
  "main": ".svelte-kit/cloudflare/_worker.js",
  "compatibility_date": "2026-01-01",
  "compatibility_flags": ["nodejs_als"],
  "assets": {
    // SvelteKitのアダプター出力先
    "directory": ".svelte-kit/cloudflare",
    // Worker から `env.ASSETS.fetch(request)` で参照できるバインディング名
    "binding": "ASSETS",
    // SPA フォールバックを使う場合
    "not_found_handling": "single-page-application"
  }
}
```

- `assets.directory` … SvelteKitビルド出力先（`.svelte-kit/cloudflare`）
- `assets.binding` … Workerコードから静的アセットへアクセスする際のバインディング名（慣習的に `ASSETS`）
- `assets.not_found_handling` … `"404-page"` か `"single-page-application"` を指定。SPAフォールバックを使うとアダプター側の `fallback` 設定よりも優先されます
- `_routes.json` … Cloudflare Pagesの場合のみ自動生成され、Function実行対象のパスを制御します（最大100件の `include` + `exclude` 制限あり）

### カスタムアダプターの作成

特殊な要件がある場合、カスタムアダプターを作成することも可能です。SvelteKit 2.x系列のアダプターAPIでは、必須の `name` / `adapt` に加えて、オプションで `emulate`（ローカル開発時の `platform` エミュレーション）と `supports`（特定機能のサポート可否を申告）を実装できます。

```typescript
// my-adapter/index.ts
import type { Adapter } from '@sveltejs/kit';

export default function myAdapter(options: { out?: string } = {}): Adapter {
  return {
    name: 'adapter-my-custom',

    async adapt(builder) {
      // ビルダーAPIを使用してファイルを生成
      builder.log.minor('Generating custom output...');

      const out = options.out ?? 'build';
      const tmp = builder.getBuildDirectory('my-adapter');

      builder.rimraf(tmp);
      builder.mkdirp(tmp);

      // サーバーコードの生成
      builder.writeServer(tmp);

      // クライアントアセットのコピー
      builder.writeClient(`${out}/public`);

      // プリレンダリングされたページの処理
      builder.writePrerendered(`${out}/prerendered`);
    },

    // dev/build/preview 時に event.platform として注入される値をエミュレート
    async emulate() {
      return {
        async platform({ config, prerender }) {
          // App.Platform の形に合わせて返す
          return {
            env: {
              // 例: ローカルでのバインディングをモック
            },
          };
        },
      };
    },

    // 機能サポートの申告
    supports: {
      // $app/server の `read` がプロダクションで使えるかどうか
      read: ({ config, route }) => {
        // 使えるなら true、使えないなら false、
        // 設定で有効化できる場合は説明的なエラーを throw する
        return true;
      },

      // OpenTelemetry など `instrumentation.server.js` をロードできるか
      instrumentation: () => {
        return true;
      },
    },
  };
}
```

##### `supports.read`（`$app/server` の `read`）

`$app/server` の `read` は、ビルド成果物に同梱されたファイルを実行時に読み出すためのAPIです。アダプターは `supports.read` を実装することで、自身のターゲット環境でこの機能が使えるかをSvelteKitに伝えます。

- `true` を返すと、ユーザーがそのルートで `read` を呼び出してもエラーになりません
- `false` を返すと、`read` を含むコードに対してビルド時にわかりやすいエラーを出せます
- ある条件下でだけ動く場合は、`throw new Error('...')` で設定方法を案内するのが推奨です

##### `supports.instrumentation`（OpenTelemetry サポート）

`instrumentation.server.js` を読み込めるかを宣言します。OpenTelemetryのようなツールをアダプター側で初期化できる場合に `true` を返してください。Edge環境のように `require('perf_hooks')` 等が動かない場合は `false` を返すか、説明的なエラーを投げるのが安全です。

##### `emulate` API

`emulate` はローカル開発（`vite dev` / `vite preview`）時に `event.platform` の値をエミュレートするためのAPIです。`platform({ config, prerender })` は対象ルートごとに呼ばれ、返したオブジェクトがそのまま `event.platform` として参照可能になります。

たとえば `adapter-cloudflare` は、内部的にWranglerの `getPlatformProxy()` を呼んで `env` / `caches` / `cf` などをローカルでも本物に近い形で再現しています。自作アダプターでも、KV/DB/オブジェクトストレージなどのバインディングをモックして注入することで、ローカルとプロダクションの挙動差を小さくできます。

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
    siteName: PUBLIC_SITE_NAME,
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
// +server.ts - Vercel Edge Function / Serverless Function の設定
import type { RequestHandler } from './$types';
import type { Config } from '@sveltejs/adapter-vercel';

// ページ・エンドポイント単位での runtime 指定（非推奨化進行中）
// 新規コードでは原則 Vercel ダッシュボード側の Node バージョン設定に任せ、
// edge / serverless の選択以外を細かく書かないことが推奨される
export const config: Config = {
  runtime: 'edge',
  regions: ['iad1', 'sfo1'], // マルチリージョン配信
};

export const GET: RequestHandler = async ({ platform }) => {
  // Vercel固有の環境変数
  const region = platform?.env?.VERCEL_REGION;
  const url = platform?.env?.VERCEL_URL;

  return new Response(
    JSON.stringify({
      region,
      url,
      timestamp: Date.now(),
    }),
  );
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
      expires: ttl ? Date.now() + ttl * 1000 : undefined,
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
      expirationTtl: ttl,
    });
  }

  async delete(key: string) {
    await this.kv.delete(key);
  }
}
```

### 3. 重要指標の定義と測定

| 指標                   | SSR | SSG | SPA | 推奨用途             |
| ---------------------- | --- | --- | --- | -------------------- |
| **ページビュー追跡**   | ◎   | △   | ✗   | コンテンツサイト     |
| **ユーザーフロー分析** | ◎   | △   | ✗   | ECサイト             |
| **リアルタイム分析**   | ◎   | ✗   | △   | ダッシュボード       |
| **SEOパフォーマンス**  | ◎   | ◎   | ✗   | マーケティングサイト |
| **サーバー負荷**       | ✗   | ◎   | ◎   | 高トラフィックサイト |

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
    timestamp: new Date(),
  });

  return resolve(event);
};
```

## パフォーマンス最適化

### ランタイム別の最適化戦略

各ランタイム環境には固有の最適化手法があり、適切に活用することでパフォーマンスを大幅に改善できます。

| ランタイム             | 最適化手法                    | 注意点         |
| ---------------------- | ----------------------------- | -------------- |
| **Node.js**            | Worker Threads、Cluster       | メモリ使用量   |
| **Edge Runtime**       | Response Streaming、Cache API | API制限        |
| **Cloudflare Workers** | KV Cache、Durable Objects     | CPU時間制限    |
| **ブラウザ**           | Code Splitting、Lazy Loading  | バンドルサイズ |

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
    `sveltekit;dur=${duration};desc="Total SvelteKit processing"`,
  );

  return response;
};
```

## まとめ

SvelteKitの実行環境とランタイムを理解することで、アプリケーションを最適な環境にデプロイし、パフォーマンスを最大化できます。各ランタイムの特性を理解し、適切なアダプターを選択することが重要です。

<Admonition type="tip" title="重要なポイント">

<ul>
<li><strong>Node.js</strong>: フルスタック機能が必要な場合</li>
<li><strong>Edge Runtime</strong>: 低レイテンシーとグローバル配信が必要な場合</li>
<li><strong>Cloudflare Workers</strong>: KVストアやDurable Objectsを活用する場合</li>
<li><strong>環境変数</strong>: PUBLIC_プレフィックスでクライアント露出を制御</li>
<li><strong>アダプター</strong>: デプロイ先に応じて適切に選択</li>
</ul>

</Admonition>

## 関連情報

- [アクセスログと分析戦略](/sveltekit/architecture/access-logs/) - レンダリング戦略ごとのログ記録パターン
- [プラットフォーム別デプロイ](/sveltekit/deployment/platforms/) - 各プラットフォームへのデプロイ方法

## 次のステップ

- [アクセスログと分析戦略](/sveltekit/architecture/access-logs/) - レンダリング戦略とログの関係
- [ルーティング内部動作](/sveltekit/architecture/routing-internals/) - ファイルベースルーティングの仕組み
- [ビルド最適化](/sveltekit/optimization/build-optimization/) - パフォーマンス改善手法
