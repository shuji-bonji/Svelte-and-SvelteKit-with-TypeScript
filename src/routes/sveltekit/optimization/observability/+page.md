---
title: Observability - 可観測性とトレーシング
description: SvelteKitのObservabilityでOpenTelemetryベースのトレーシングを実装。パフォーマンス監視、デバッグ、本番環境診断をTypeScriptで解説
---

<script>
	import Admonition from '$lib/components/Admonition.svelte';
  import Mermaid from '$lib/components/Mermaid.svelte';

  const tracingDiagram = `flowchart TB
    REQ[リクエスト] --> HANDLE

    subgraph tracing[SvelteKit のトレーシング対象]
        HANDLE[handle hook] -->|スパン生成| LOAD
        LOAD[load 関数] -->|スパン生成| ACTION
        ACTION[form action] -->|スパン生成| RES
    end

    RES[レスポンス]

    style REQ fill
    style RES fill
    style HANDLE fill
    style LOAD fill
    style ACTION fill`;
</script>

SvelteKit 2.31 以降では、OpenTelemetry ベースのサーバーサイドトレーシングをサポートしています。
これにより、アプリケーションの動作を観察し、パフォーマンスの問題やバグの原因を特定できます。

## この記事で学べること

- OpenTelemetry とトレーシングの基本
- SvelteKit でのトレーシング設定
- スパンの拡張とカスタム属性
- ローカル開発環境でのセットアップ
- 本番環境での運用

<Admonition type="warning" title="実験的機能">
トレーシングとインストルメンテーションは現在実験的機能です。
破壊的変更が行われる可能性があります。
</Admonition>

## Observability とは

Observability（可観測性）は、システムの内部状態を外部から理解する能力です。

<Mermaid diagram={tracingDiagram} />

### トレーシング対象

SvelteKit は以下の操作でスパンを生成します。

- `handle` フック（`sequence` 内の関数を含む）
- サーバー `load` 関数
- ユニバーサル `load` 関数（サーバー実行時）
- Form actions
- Remote functions

## セットアップ

SvelteKit でトレーシングを有効にするには、設定の変更、必要なパッケージのインストール、インストルメンテーションファイルの作成が必要です。以下の手順に従ってセットアップを行います。

### 設定の有効化

まず、`svelte.config.js` で実験的オプションを有効にします。`tracing.server` と `instrumentation.server` の両方を `true` に設定することで、サーバーサイドのトレーシングが有効になります。

```javascript
// svelte.config.js
/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    experimental: {
      tracing: {
        server: true,
      },
      instrumentation: {
        server: true,
      },
    },
  },
};

export default config;
```

### 依存関係のインストール

OpenTelemetry SDK と必要なエクスポーター、自動インストルメンテーションのパッケージをインストールします。`import-in-the-middle` はモジュールフックに必要です。

```bash
npm install @opentelemetry/sdk-node \
  @opentelemetry/auto-instrumentations-node \
  @opentelemetry/exporter-trace-otlp-proto \
  import-in-the-middle
```

### インストルメンテーションファイル

`src/instrumentation.server.ts` を作成します。このファイルはアプリケーションコードの前に実行されることが保証されています。

```typescript
// src/instrumentation.server.ts
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { createAddHookMessageChannel } from 'import-in-the-middle';
import { register } from 'node:module';

// import-in-the-middle の設定
const { registerOptions } = createAddHookMessageChannel();
register('import-in-the-middle/hook.mjs', import.meta.url, registerOptions);

// OpenTelemetry SDK の設定
const sdk = new NodeSDK({
  serviceName: 'my-sveltekit-app',
  traceExporter: new OTLPTraceExporter(),
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();

console.log('OpenTelemetry tracing started');
```

## ローカル開発環境

トレーシングを効果的に活用するには、トレースデータを可視化するツールが必要です。ローカル開発では、Jaeger を Docker で起動することで、すぐにトレースの確認を始めることができます。

### Jaeger のセットアップ

[Jaeger](https://www.jaegertracing.io/) は、分散トレーシングのためのオープンソースツールです。以下のコマンドで Docker コンテナを起動すると、OTLP（OpenTelemetry Protocol）エンドポイントと Web UI が利用可能になります。

```bash
# Docker を使用した Jaeger の起動
docker run -d --name jaeger \
  -e COLLECTOR_ZIPKIN_HOST_PORT=:9411 \
  -e COLLECTOR_OTLP_ENABLED=true \
  -p 16686:16686 \
  -p 4317:4317 \
  -p 4318:4318 \
  jaegertracing/all-in-one:latest
```

### 環境変数の設定

OpenTelemetry は環境変数で設定を制御できます。以下の設定で、トレースデータを Jaeger に送信します。

```bash
# .env
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
OTEL_SERVICE_NAME=my-sveltekit-app
```

### トレースの確認

セットアップが完了したら、以下の手順でトレースを確認できます。

1. SvelteKit アプリを起動
2. ブラウザで [http://localhost:16686](http://localhost:16686) にアクセス
3. サービス名を選択してトレースを表示

Jaeger の Web UI では、各リクエストのトレースを時系列で表示し、各スパンの処理時間や属性を確認できます。

## スパンの拡張

SvelteKit のデフォルトトレーシングでは、基本的なリクエスト情報のみが記録されます。`event.tracing` を使用してカスタム属性を追加することで、ビジネスロジックに関連する情報（ユーザー ID、処理件数、エラー詳細など）も記録できます。

### root スパンと current スパン

SvelteKit では、2 種類のスパンを使い分けることができます。`root` スパンはリクエスト全体に関連する情報（ユーザー情報など）を記録し、`current` スパンは現在の処理に固有の情報を記録します。

```typescript
// src/lib/server/auth.ts
import { getRequestEvent } from '$app/server';

export async function authenticate() {
  const event = getRequestEvent();

  // root スパン: handle フックに関連付けられたスパン
  // current スパン: 現在の load, action, または remote function のスパン

  // ユーザー情報を root スパンに追加
  const user = await getAuthenticatedUser();
  event.tracing.root.setAttribute('userId', user.id);
  event.tracing.root.setAttribute('userRole', user.role);

  return user;
}
```

### カスタム属性の追加

以下は、API エンドポイントでカスタム属性を追加する例です。クエリパラメータ、処理時間、結果件数などを記録することで、後からパフォーマンス分析やデバッグに活用できます。

```typescript
// src/routes/api/products/+server.ts
import type { RequestHandler } from './$types';
import { getRequestEvent } from '$app/server';

export const GET: RequestHandler = async ({ url }) => {
  const event = getRequestEvent();

  // クエリパラメータを記録
  const category = url.searchParams.get('category');
  event.tracing.current.setAttribute('product.category', category || 'all');

  // パフォーマンスメトリクスを記録
  const startTime = performance.now();

  const products = await fetchProducts(category);

  const duration = performance.now() - startTime;
  event.tracing.current.setAttribute('db.query.duration', duration);
  event.tracing.current.setAttribute('product.count', products.length);

  return json(products);
};
```

### load 関数での使用

load 関数でもトレーシングを活用できます。複数のデータソースからデータを取得する場合、各データの取得状況や件数を記録することで、パフォーマンスのボトルネックを特定しやすくなります。

```typescript
// src/routes/dashboard/+page.server.ts
import type { PageServerLoad } from './$types';
import { getRequestEvent } from '$app/server';

export const load: PageServerLoad = async ({ locals }) => {
  const event = getRequestEvent();

  // データ取得の開始を記録
  event.tracing.current.setAttribute('dashboard.loading', true);

  const [stats, activities, notifications] = await Promise.all([
    fetchStats(locals.userId),
    fetchActivities(locals.userId),
    fetchNotifications(locals.userId),
  ]);

  // 結果のサマリーを記録
  event.tracing.current.setAttribute('dashboard.stats.count', stats.length);
  event.tracing.current.setAttribute(
    'dashboard.activities.count',
    activities.length,
  );
  event.tracing.current.setAttribute('dashboard.loading', false);

  return { stats, activities, notifications };
};
```

## 本番環境での運用

本番環境では、Jaeger の代わりに商用の APM（Application Performance Monitoring）サービスを使用することが一般的です。各サービスは OpenTelemetry をサポートしているため、エクスポーターを変更するだけで統合できます。

### Vercel での設定

Vercel にデプロイする場合、`@vercel/otel` パッケージを使用すると、Vercel の組み込み監視機能と簡単に統合できます。

```bash
npm install @vercel/otel
```

```typescript
// src/instrumentation.server.ts
import { initOpenTelemetry } from '@vercel/otel';

initOpenTelemetry({
  serviceName: 'my-sveltekit-app',
});
```

### 他の APM サービス

Vercel 以外のプラットフォームを使用している場合や、より高度な監視機能が必要な場合は、Datadog や New Relic などの APM サービスを使用できます。以下は代表的なサービスとの統合例です。

#### Datadog

Datadog は包括的な監視プラットフォームで、トレーシング、メトリクス、ログを統合的に管理できます。

```typescript
// src/instrumentation.server.ts
import { NodeSDK } from '@opentelemetry/sdk-node';
import { DatadogExporter } from '@opentelemetry/exporter-datadog';

const sdk = new NodeSDK({
  serviceName: process.env.DD_SERVICE || 'my-sveltekit-app',
  traceExporter: new DatadogExporter({
    apiKey: process.env.DD_API_KEY,
  }),
});

sdk.start();
```

#### New Relic

New Relic は OTLP（OpenTelemetry Protocol）エンドポイントを直接サポートしているため、標準の OTLP エクスポーターを使用して統合できます。

```typescript
// src/instrumentation.server.ts
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';

const sdk = new NodeSDK({
  serviceName: 'my-sveltekit-app',
  traceExporter: new OTLPTraceExporter({
    url: 'https://otlp.nr-data.net:4318/v1/traces',
    headers: {
      'api-key': process.env.NEW_RELIC_LICENSE_KEY,
    },
  }),
});

sdk.start();
```

## パフォーマンスへの影響

トレーシングはアプリケーションの動作を監視するために有用ですが、パフォーマンスへの影響を考慮する必要があります。以下のベストプラクティスに従って、オーバーヘッドを最小限に抑えましょう。

<Admonition type="warning" title="オーバーヘッドに注意">
トレーシングには無視できないオーバーヘッドがあります。
本番環境で有効にする前に、本当に必要かを検討してください。

</Admonition>

### 推奨される使用パターン

本番環境では、環境変数や条件分岐を使用して、必要な場合のみトレーシングを有効にすることをお勧めします。開発環境やプレビュー環境では常に有効にし、本番環境では問題調査時のみ有効にするパターンが一般的です。

```typescript
// src/instrumentation.server.ts
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { dev } from '$app/environment';

// 開発環境またはプレビュー環境でのみ有効化
if (dev || process.env.ENABLE_TRACING === 'true') {
  const sdk = new NodeSDK({
    serviceName: 'my-sveltekit-app',
    traceExporter: new OTLPTraceExporter(),
  });

  sdk.start();
}
```

### サンプリング

高トラフィックの本番環境では、すべてのリクエストをトレースするとコストとパフォーマンスに影響します。サンプリングを使用して、一定の割合のリクエストのみをトレースすることで、代表的なデータを収集しつつオーバーヘッドを抑えられます。

```typescript
import { NodeSDK } from '@opentelemetry/sdk-node';
import { TraceIdRatioBasedSampler } from '@opentelemetry/sdk-trace-base';

const sdk = new NodeSDK({
  serviceName: 'my-sveltekit-app',
  // 10% のリクエストのみトレース
  sampler: new TraceIdRatioBasedSampler(0.1),
});
```

## エラーの記録

エラーが発生した場合、その情報をスパンに記録することで、後からエラーの原因を調査しやすくなります。エラーの種類、メッセージ、発生したコンテキストを記録しておきましょう。

```typescript
// src/routes/api/orders/+server.ts
import type { RequestHandler } from './$types';
import { getRequestEvent } from '$app/server';
import { error } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
  const event = getRequestEvent();

  try {
    const data = await request.json();

    // 処理開始を記録
    event.tracing.current.setAttribute('order.processing', true);

    const order = await createOrder(data);

    // 成功を記録
    event.tracing.current.setAttribute('order.id', order.id);
    event.tracing.current.setAttribute('order.status', 'created');

    return json(order);
  } catch (err) {
    // エラーをスパンに記録
    event.tracing.current.setAttribute('error', true);
    event.tracing.current.setAttribute('error.message', err.message);
    event.tracing.current.setAttribute('error.type', err.name);

    throw error(500, 'Order creation failed');
  }
};
```

## トラブルシューティング

トレーシングのセットアップ時に発生しやすい問題と解決策を紹介します。

### @opentelemetry/api が見つからない

```
Error: Cannot find module '@opentelemetry/api'
```

この場合、手動でインストールします。

```bash
npm install @opentelemetry/api
```

### スパンが表示されない

1. `svelte.config.js` の設定を確認
2. `src/instrumentation.server.ts` が存在することを確認
3. コレクターが正しく動作していることを確認
4. 環境変数が正しく設定されていることを確認

## まとめ

SvelteKit の Observability 機能を使用することで、以下のことが実現できます。

- **パフォーマンス監視**: リクエストの処理時間を追跡
- **デバッグ**: 問題の原因を特定
- **本番環境診断**: ボトルネックの特定
- **カスタム属性**: ビジネスメトリクスの追跡

適切に設定することで、アプリケーションの健全性を維持し、問題を迅速に解決できます。

## 次のステップ

- [パフォーマンス最適化](/sveltekit/optimization/performance/) - 全体的な最適化
- [Hooks](/sveltekit/server/hooks/) - handle フックの詳細
- [アクセスログと分析戦略](/sveltekit/architecture/access-logs/) - ログ管理
