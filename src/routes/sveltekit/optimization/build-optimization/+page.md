---
title: ビルド最適化
description: SvelteKitのビルド最適化をTypeScriptで実践 - Vite設定によるコード分割、Tree Shaking、画像最適化、Gzip/Brotli圧縮戦略でバンドルサイズ削減とパフォーマンス向上を実現する方法を詳しく解説します
---

<script>
	import Admonition from '$lib/components/Admonition.svelte';
  import { base } from '$app/paths';
  import Mermaid from '$lib/components/Mermaid.svelte';
  
  // ビルドプロセスの全体像
  const buildProcessDiagram = `graph TB
    subgraph "開発環境"
        SOURCE[ソースコード<br/>.svelte/.ts/.css]
        ASSETS[静的アセット<br/>画像/フォント]
    end
    
    subgraph "ビルドプロセス"
        VITE[Vite<br/>バンドラー]
        SVELTE[Svelte<br/>コンパイラ]
        TS[TypeScript<br/>トランスパイル]
        OPT[最適化<br/>処理]
    end
    
    subgraph "出力"
        JS[JavaScript<br/>バンドル]
        CSS[CSS<br/>バンドル]
        HTML[HTML<br/>ファイル]
        STATIC[静的<br/>アセット]
    end
    
    SOURCE --> VITE
    ASSETS --> VITE
    VITE --> SVELTE
    VITE --> TS
    SVELTE --> OPT
    TS --> OPT
    OPT --> JS
    OPT --> CSS
    OPT --> HTML
    OPT --> STATIC
    
    style VITE fill:#ff6b6b
    style OPT fill:#4ecdc4`;
  
  // コード分割の戦略
  const codeSplittingDiagram = `graph LR
    subgraph "Before - 単一バンドル"
        SINGLE[app.js<br/>500KB]
    end
    
    subgraph "After - コード分割"
        MAIN[main.js<br/>50KB]
        VENDOR[vendor.js<br/>200KB]
        LAZY1[page1.js<br/>30KB]
        LAZY2[page2.js<br/>40KB]
        LAZY3[admin.js<br/>180KB]
    end
    
    SINGLE -.->|分割| MAIN
    SINGLE -.->|分割| VENDOR
    SINGLE -.->|分割| LAZY1
    SINGLE -.->|分割| LAZY2
    SINGLE -.->|分割| LAZY3
    
    style SINGLE fill:#ff6b6b
    style MAIN fill:#4ecdc4
    style VENDOR fill:#95e1d3
    style LAZY1 fill:#ffd93d
    style LAZY2 fill:#ffd93d
    style LAZY3 fill:#ffd93d`;
  
  // 最適化の効果
  const optimizationImpactDiagram = `graph TB
    subgraph "最適化前"
        B1[ビルド時間: 60s]
        S1[バンドルサイズ: 2MB]
        L1[初期ロード: 5s]
    end
    
    subgraph "最適化施策"
        O1[Tree Shaking]
        O2[コード分割]
        O3[圧縮・Minify]
        O4[画像最適化]
        O5[キャッシュ戦略]
    end
    
    subgraph "最適化後"
        B2[ビルド時間: 30s]
        S2[バンドルサイズ: 500KB]
        L2[初期ロード: 1.5s]
    end
    
    B1 --> O1
    S1 --> O2
    L1 --> O3
    O1 --> B2
    O2 --> S2
    O3 --> L2
    O4 --> S2
    O5 --> L2
    
    style B2 fill:#4ecdc4
    style S2 fill:#4ecdc4
    style L2 fill:#4ecdc4`;
</script>

SvelteKitのビルドプロセスを最適化することで、アプリケーションのパフォーマンスを大幅に改善できます。このページでは、バンドルサイズの削減、ビルド時間の短縮、デプロイの効率化について詳しく解説します。

## ビルドプロセスの全体像

SvelteKitのビルドプロセスを理解することで、最適化のポイントが明確になります。

<Mermaid diagram={buildProcessDiagram} />

## Vite設定による最適化

### 基本的な最適化設定

Viteの設定を調整することで、ビルドの効率を大幅に改善できます。

```typescript
// vite.config.ts
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],

  build: {
    // ブラウザ互換性の設定
    target: 'es2020',

    // チャンクサイズの警告閾値
    chunkSizeWarningLimit: 1000,

    // ソースマップの生成（本番環境では無効化を推奨）
    sourcemap: false,

    // ロールアップオプション
    rollupOptions: {
      output: {
        // マニュアルチャンク分割
        manualChunks: {
          vendor: ['svelte', '@sveltejs/kit'],
          utils: ['date-fns', 'lodash-es'],
        },

        // アセットファイル名の設定
        assetFileNames: 'assets/[name]-[hash][extname]',

        // チャンクファイル名の設定
        chunkFileNames: 'chunks/[name]-[hash].js',

        // エントリーファイル名の設定
        entryFileNames: 'entries/[name]-[hash].js',
      },
    },

    // Terserによる圧縮設定
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info'],
        passes: 2,
      },
      mangle: {
        safari10: true,
      },
      format: {
        comments: false,
      },
    },
  },

  // 依存関係の最適化
  optimizeDeps: {
    include: ['svelte', '@sveltejs/kit'],
    exclude: ['@sveltejs/kit/node'],
  },
});
```

### 環境別の設定

開発環境と本番環境で異なる最適化戦略を適用します。

```typescript
// vite.config.ts - 環境別設定
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
  const isDev = mode === 'development';
  const isProd = mode === 'production';

  return {
    plugins: [sveltekit()],

    build: {
      // 開発環境では高速ビルド、本番環境では最適化重視
      minify: isProd ? 'terser' : false,
      sourcemap: isDev ? 'inline' : false,

      rollupOptions: {
        output: {
          // 本番環境のみハッシュを付与
          entryFileNames: isProd
            ? 'entries/[name]-[hash].js'
            : 'entries/[name].js',

          manualChunks: isProd
            ? (id) => {
                // node_modulesのパッケージをvendorチャンクに
                if (id.includes('node_modules')) {
                  // 大きなライブラリは個別チャンクに
                  if (id.includes('lodash')) return 'lodash';
                  if (id.includes('chart.js')) return 'charts';
                  if (id.includes('@sveltejs/kit')) return 'sveltekit';

                  return 'vendor';
                }
              }
            : undefined,
        },
      },
    },

    // 開発サーバーの設定
    server: {
      hmr: {
        overlay: isDev,
      },
    },
  };
});
```

## コード分割戦略

効果的なコード分割により、初期ロード時間を大幅に短縮できます。

<Mermaid diagram={codeSplittingDiagram} />

### 動的インポートによる遅延ロード

必要な時にのみコードをロードすることで、初期バンドルサイズを削減します。

```svelte
<!-- +page.svelte - 動的インポートの実装 -->
<script lang="ts">
  import { onMount } from 'svelte';
  import type { Component } from 'svelte';

  // Svelte 5 Runes: $state で宣言したリアクティブな状態として保持する
  // 動的に解決したコンポーネントを `Component` 型として受け取る
  let ChartComponent = $state<Component | null>(null);
  let isLoading = $state(true);

  onMount(async () => {
    // 重いライブラリは必要時にのみロード
    const module = await import('$lib/components/HeavyChart.svelte');
    ChartComponent = module.default;
    isLoading = false;
  });
</script>

{#if isLoading}
  <div class="skeleton">チャートを読み込み中...</div>
{:else if ChartComponent}
  <!--
    Svelte 5 Runes モードでは `<svelte:component this={X} />` は非推奨。
    変数（コンポーネント参照）を直接タグとして書くことで、よりシンプルかつ
    型推論も効くようになる。
  -->
  <ChartComponent />
{/if}
```

:::tip[Runes モードでの動的コンポーネント]
レガシーな `<svelte:component this={X} />` 構文は Svelte 5 Runes モードでは非推奨です。`{#if}` や `{#each}` のブロック内で、変数名をそのままタグとして使う書き方に置き換えてください（例：`<ChartComponent />`）。コンポーネント変数は `$state` で宣言することで、動的な差し替えにリアクティブに追従できます。
:::

### ルートベースのコード分割

SvelteKitは自動的にルートごとにコードを分割しますが、さらに最適化できます。

```typescript
// +layout.ts - ルートグループごとの設定
export const prerender = true;
export const ssr = true;

// 管理画面は別バンドルに
export async function load({ route }) {
  if (route.id?.startsWith('/(admin)')) {
    // 管理画面用の重いライブラリ
    const { setupAdmin } = await import('$lib/admin/setup');
    await setupAdmin();
  }

  return {};
}
```

## Tree Shakingの最適化

使用されていないコードを除去し、バンドルサイズを削減します。

### 副作用フリーなコードの記述

Tree Shakingが効果的に動作するよう、副作用のないコードを書きます。

```typescript
// lib/utils/index.ts - Tree Shaking対応
// ❌ 悪い例：副作用のあるコード
export const utils = {
  formatDate: () => {
    /* ... */
  },
  parseJSON: () => {
    /* ... */
  },
  calculateSum: () => {
    /* ... */
  },
};

// グローバルな副作用
window.myUtils = utils;

// ✅ 良い例：個別エクスポート
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('ja-JP').format(date);
}

export function parseJSON<T>(json: string): T | null {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function calculateSum(numbers: number[]): number {
  return numbers.reduce((sum, n) => sum + n, 0);
}
```

### package.jsonの最適化

パッケージが正しくTree Shakingされるよう設定します。

```javascript
// package.json
{
  "name": "my-sveltekit-app",
  "type": "module",
  "sideEffects": false,
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "svelte": "./dist/index.js",
      "default": "./dist/index.js"
    },
    "./utils": {
      "types": "./dist/utils/index.d.ts",
      "import": "./dist/utils/index.js"
    }
  }
}
```

## SvelteKit 側の出力設定

Vite 設定だけでなく、`svelte.config.js` の `kit` 直下にも出力・ロード戦略を直接コントロールするオプションがあります。

### `kit.output.bundleStrategy`

`bundleStrategy` は SvelteKit v2.13 で追加された、アプリ全体の JavaScript / CSS の **バンドル形態** を選ぶオプションです。

```javascript
// svelte.config.js
import adapter from '@sveltejs/adapter-auto';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter(),
    output: {
      // 'split' | 'single' | 'inline'
      bundleStrategy: 'split',
    },
  },
};

export default config;
```

3 種類の戦略があり、用途に応じて選択します。

| 値 | 挙動 | 想定ユースケース |
|----|------|----------------|
| `'split'`（デフォルト） | ルートごとに `.js` / `.css` を分割し、ナビゲーションに応じて遅延ロード | 一般的な Web アプリ。ほとんどの場合これでよい |
| `'single'` | すべてのコードを 1 本の `.js` と 1 本の `.css` に統合 | 小規模 SPA、初回到達後の追加 HTTP リクエストを抑えたい場合 |
| `'inline'` | JS / CSS をすべて HTML にインライン化 | サーバなしで配布できる単一 HTML（ローカルツール、デモ、オフライン同梱物） |

`'inline'` を使う場合は、Vite 側の `build.assetsInlineLimit` も合わせて調整し、画像なども含めて完全に単一ファイル化することを検討してください。

```typescript
// vite.config.ts - inline 戦略と組み合わせる例
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  build: {
    // すべてのインポート可能なアセットを base64 でインライン化
    assetsInlineLimit: Infinity,
  },
});
```

:::tip[`'split'` を選びつつ細かく調整したい]
`bundleStrategy: 'split'` のまま、Vite の `build.rollupOptions.output.experimentalMinChunkSize` や `output.manualChunks` を調整することで、過剰な分割を抑えてリクエスト数とサイズのバランスを取ることができます。
:::

### `kit.router.resolution`

`router.resolution` は SvelteKit v2.17 で追加された、**ルート解決をクライアントとサーバのどちらで行うか**を選ぶオプションです。

```javascript
// svelte.config.js
/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    router: {
      // 'client' | 'server'
      resolution: 'client',
    },
  },
};
```

| 値 | 挙動 | 主なメリット |
|----|------|--------------|
| `'client'`（デフォルト） | ルートマニフェストをクライアントに配信し、ナビゲーション解決をすべてブラウザで実施 | ナビゲーションが即時。サーバ往復が不要 |
| `'server'` | 未訪問パスへの遷移時はサーバに問い合わせてルートを解決 | 初回ペイロードからルートマニフェストを除外できる／ルート構成を非公開にできる／サーバ側ミドルウェアで A/B テストやリダイレクトを差し込める |

`'server'` を選ぶ場合、未訪問パスへの初回遷移はわずかに遅くなりますが、リンクの `data-sveltekit-preload-data` によるプリロードである程度緩和できます。**ルート数が非常に多い大規模アプリ** や **ルート構成を秘匿したい管理画面** で特に効果が大きい設定です。

:::info[プリレンダリングとの組み合わせ]
`resolution: 'server'` でかつプリレンダリングを行う場合、ルート解決結果もページと一緒にプリレンダリングされるため、静的ホスティング環境でもメリットを享受できます。
:::

## 画像とアセットの最適化

画像最適化は **`@sveltejs/enhanced-img`** を主軸に組み立てるのが現在の SvelteKit 推奨ルートです。Vite の前段プラグインとして動作し、ビルド時に AVIF / WebP などへの自動変換、複数解像度の `srcset` 生成、`width` / `height` の自動付与（CLS 防止）、EXIF 情報の除去までを担います。

### `@sveltejs/enhanced-img` のセットアップ

まずプラグインをインストールし、`vite.config.ts` に `sveltekit()` の **前** に追加します。

```sh
npm install -D @sveltejs/enhanced-img
```

```typescript
// vite.config.ts - @sveltejs/enhanced-img を sveltekit() の前に登録
import { sveltekit } from '@sveltejs/kit/vite';
import { enhancedImages } from '@sveltejs/enhanced-img';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    // enhancedImages() は sveltekit() より前に置く必要がある
    enhancedImages(),
    sveltekit(),
  ],
});
```

初回ビルドは画像変換のため少し時間がかかりますが、`./node_modules/.cache/imagetools` にキャッシュされるため 2 回目以降は高速になります。

### `<enhanced:img>` での基本的な使い方

ビルド時に存在する画像ファイルは `<enhanced:img>` で参照します。タグはビルド時に `<picture>` + `<source>` + `<img>` に展開され、ブラウザが対応する最適なフォーマット・サイズを選択します。

```svelte
<!-- lib/components/Hero.svelte -->
<script lang="ts">
  // ?enhanced クエリで明示的に Enhanced Images の処理対象にする
  // （静的な相対パス指定で <enhanced:img src="./hero.png"> と書く場合は不要）
  import heroImage from '$lib/assets/hero.png?enhanced';
</script>

<!--
  sizes を指定すると、デバイスサイズに応じた srcset が自動生成される。
  LCP 候補となるヒーロー画像には fetchpriority="high" を付け、
  逆に loading="lazy" は付けないようにする（重要画像の読み込みを早める）。
-->
<enhanced:img
  src={heroImage}
  alt="サービスの概要を示すヒーロー画像"
  sizes="min(1280px, 100vw)"
  fetchpriority="high"
/>
```

### コレクションを動的に出し分ける場合

CMS のような完全動的な配信ではなく、ビルド時に確定する複数画像から選ぶようなケースでは、`import.meta.glob` と `?enhanced` クエリを組み合わせます。

```svelte
<script lang="ts">
  // ビルド時に画像をまとめてインポート
  const imageModules = import.meta.glob(
    '$lib/assets/products/*.{avif,jpg,jpeg,png,webp}',
    {
      eager: true,
      query: { enhanced: true },
    },
  );
</script>

{#each Object.entries(imageModules) as [path, mod] (path)}
  <enhanced:img src={(mod as { default: string }).default} alt="" sizes="400px" />
{/each}
```

:::info[CDN から動的にロードする画像は別途設計が必要]
`@sveltejs/enhanced-img` はビルド時にローカルに存在する画像のみを最適化します。CMS / DB / バックエンドから配信される画像は、`@unpic/svelte` や Cloudinary / Contentful などの CDN/CMS 統合ライブラリを使ってください。`<enhanced:img>` と通常の `<img>` / CDN 連携を **混在** させるのが現実的なベストプラクティスです。
:::

:::caution[`vite-plugin-imagemin` は補足的な位置付け]
旧来よく紹介されていた `vite-plugin-imagemin` は本記事執筆時点で長期間メンテナンスされておらず、Svelte / SvelteKit 公式ガイドでも推奨されていません。最適化は `@sveltejs/enhanced-img` を主軸に据え、`vite-plugin-imagemin` は「`@sveltejs/enhanced-img` の対象外（例：`static/` 直下に置く OGP 画像など）を一括で軽量化したい」といった補助用途に留めるのが安全です。
:::

## バンドル分析

### Bundle Analyzerの設定

バンドルの内容を可視化し、最適化の機会を特定します。

```typescript
// vite.config.ts - Bundle Analyzer設定
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    sveltekit(),
    visualizer({
      filename: './stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
      template: 'treemap', // or 'sunburst', 'network'
    }),
  ],
});
```

### 分析結果の活用

```typescript
// バンドルサイズ監視スクリプト
// scripts/analyze-bundle.js
import { readFileSync } from 'fs';
import { join } from 'path';

const BUDGET = {
  main: 50 * 1024, // 50KB
  vendor: 200 * 1024, // 200KB
  total: 500 * 1024, // 500KB
};

function analyzeBundleSize() {
  const buildDir = '.svelte-kit/output/client';
  const manifest = JSON.parse(
    readFileSync(join(buildDir, '.vite/manifest.json'), 'utf-8'),
  );

  let totalSize = 0;
  const bundles = {};

  for (const [key, value] of Object.entries(manifest)) {
    const size = value.file
      ? readFileSync(join(buildDir, value.file)).length
      : 0;

    bundles[key] = size;
    totalSize += size;

    // 予算超過の警告
    if (key.includes('main') && size > BUDGET.main) {
      console.warn(`⚠️ Main bundle exceeds budget: ${size / 1024}KB`);
    }
  }

  console.log('Bundle Analysis:');
  console.log('================');
  Object.entries(bundles)
    .sort((a, b) => b[1] - a[1])
    .forEach(([name, size]) => {
      console.log(`${name}: ${(size / 1024).toFixed(2)}KB`);
    });

  console.log(`\nTotal: ${(totalSize / 1024).toFixed(2)}KB`);

  if (totalSize > BUDGET.total) {
    console.error(`❌ Total size exceeds budget!`);
    process.exit(1);
  }
}

analyzeBundleSize();
```

## 圧縮戦略

### アダプターの `precompress` オプション

`adapter-node` / `adapter-static` は、ビルド時にアセットとプリレンダリングされた HTML を **gzip と brotli で事前圧縮**するオプション `precompress` を備えています。これにより、リクエスト時にサーバ側で動的圧縮を行う必要がなくなり、CPU 負荷とレスポンス時間の双方を削減できます。

```javascript
// svelte.config.js - adapter-node の場合
import adapter from '@sveltejs/adapter-node';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter({
      out: 'build',
      // ビルド時に .gz と .br を生成する（adapter-node のデフォルトは true）
      precompress: true,
      envPrefix: '',
    }),
  },
};

export default config;
```

```javascript
// svelte.config.js - adapter-static の場合
import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: undefined,
      // adapter-static は precompress のデフォルトが false なので明示する
      precompress: true,
      strict: true,
    }),
  },
};

export default config;
```

:::info[adapter ごとのデフォルト値の違い]
- `adapter-node`: `precompress` のデフォルトは **`true`**。明示的に `false` にしない限り `.gz` / `.br` が生成されます。
- `adapter-static`: `precompress` のデフォルトは **`false`**。GitHub Pages や Cloudflare Pages のように、配信側が自前で圧縮してくれる環境では `false` のままで十分なケースもあります。
- Cloudflare Pages や Vercel のような Edge プラットフォームでは、配信レイヤで自動的に gzip/brotli が掛かるため、アダプターの `precompress` を有効にしても二重圧縮にはならず、ビルド時間が伸びるだけになることがあります。
:::

:::caution[リバースプロキシ配下では圧縮レイヤを一本化する]
`adapter-node` の前段に nginx / Cloudflare などのリバースプロキシを置いてそちらで圧縮する場合、Node 側（`@polka/compression` を含む）で圧縮ミドルウェアを多重に挟むのは避けてください。Node はシングルスレッドのため、圧縮は配信レイヤに任せた方が高いスループットを得られます。
:::

### Vite プラグインによる圧縮（補助手段）

アダプターの `precompress` がそのままでは効かない構成（例：カスタムサーバや特殊な配信経路）でも、Vite プラグインで `.gz` / `.br` を生成できます。

```typescript
// vite.config.ts - 圧縮設定（adapter の precompress を使えない場合の補助）
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import viteCompression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    sveltekit(),
    // Gzip圧縮
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
    }),
    // Brotli圧縮
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 1024,
      deleteOriginFile: false,
    }),
  ],
});
```

## 最適化の効果測定

最適化の効果を定量的に測定し、継続的に改善します。

<Mermaid diagram={optimizationImpactDiagram} />

### パフォーマンス測定スクリプト

```typescript
// scripts/measure-performance.ts
import { chromium } from 'playwright';

async function measurePerformance(url: string) {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // パフォーマンス測定を有効化
  await page.coverage.startJSCoverage();
  await page.coverage.startCSSCoverage();

  const metrics = await page.evaluate(() => {
    return JSON.stringify(performance.getEntriesByType('navigation')[0]);
  });

  // Core Web Vitals取得
  // 2024-03 に Core Web Vitals は FID（First Input Delay）から
  // INP（Interaction to Next Paint）へ置き換えられた。
  // INP は web-vitals v4 の onINP() を利用するのが最も確実だが、
  // Playwright 上では event タイミング系の集計を自前で行う必要がある。
  const vitals = await page.evaluate(() => {
    return new Promise((resolve) => {
      let inpValue = 0;
      let clsValue = 0;
      let lcpValue: number | undefined;

      // LCP（Largest Contentful Paint）
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        lcpValue = entries[entries.length - 1]?.startTime;
      }).observe({ type: 'largest-contentful-paint', buffered: true });

      // INP（Interaction to Next Paint）の簡易計測
      // 各イベントの duration の最悪値（98 パーセンタイル相当）を採用する
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as PerformanceEventTiming[]) {
          if (entry.interactionId && entry.duration > inpValue) {
            inpValue = entry.duration;
          }
        }
      }).observe({ type: 'event', buffered: true, durationThreshold: 16 } as PerformanceObserverInit);

      // CLS（Cumulative Layout Shift）
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as PerformanceEntry[]) {
          const layoutShift = entry as PerformanceEntry & {
            hadRecentInput: boolean;
            value: number;
          };
          if (!layoutShift.hadRecentInput) {
            clsValue += layoutShift.value;
          }
        }
      }).observe({ type: 'layout-shift', buffered: true });

      // 一定時間後にスナップショットを返す
      setTimeout(() => {
        resolve({ LCP: lcpValue, INP: inpValue, CLS: clsValue });
      }, 5000);
    });
  });

  // カバレッジレポート
  const jsCoverage = await page.coverage.stopJSCoverage();
  const cssCoverage = await page.coverage.stopCSSCoverage();

  const totalBytes = [...jsCoverage, ...cssCoverage].reduce(
    (acc, entry) => acc + entry.text.length,
    0,
  );
  const usedBytes = [...jsCoverage, ...cssCoverage].reduce(
    (acc, entry) =>
      acc +
      entry.ranges.reduce((acc2, range) => acc2 + range.end - range.start, 0),
    0,
  );

  console.log('Performance Metrics:');
  console.log('===================');
  console.log(`Navigation: ${JSON.parse(metrics)}`);
  console.log(`Core Web Vitals: ${JSON.stringify(vitals)}`);
  console.log(`Code Coverage: ${((usedBytes / totalBytes) * 100).toFixed(2)}%`);
  console.log(`Unused Code: ${((totalBytes - usedBytes) / 1024).toFixed(2)}KB`);

  await browser.close();
}

measurePerformance('http://localhost:5173');
```

## ベストプラクティス

### チェックリスト

ビルド最適化を実施する際の確認事項です。

- [ ] **コード分割**
  - [ ] ルートベースの自動分割を活用
  - [ ] 重いコンポーネントは動的インポート
  - [ ] 管理画面など特定機能は別バンドル

- [ ] **Tree Shaking**
  - [ ] 個別エクスポートを使用
  - [ ] 副作用のないコードを記述
  - [ ] package.jsonでsideEffects: false

- [ ] **画像最適化**
  - [ ] 適切なフォーマット（WebP/AVIF）
  - [ ] レスポンシブ画像の実装
  - [ ] Lazy loadingの活用

- [ ] **圧縮**
  - [ ] Brotli圧縮を優先
  - [ ] 1KB以上のファイルを圧縮
  - [ ] CDNレベルでも圧縮を有効化

- [ ] **測定と監視**
  - [ ] Bundle Analyzerでサイズ確認
  - [ ] Core Web Vitals測定
  - [ ] 継続的なパフォーマンス監視

## まとめ

ビルド最適化は、アプリケーションのパフォーマンスを左右する重要な要素です。Viteの設定、コード分割、Tree Shaking、圧縮戦略を適切に組み合わせることで、高速で効率的なアプリケーションを実現できます。

<Admonition type="tip" title="重要なポイント">

<ul>
<li><strong>測定なくして最適化なし</strong> - 常にパフォーマンスを測定し、効果を検証</li>
<li><strong>段階的な最適化</strong> - 一度にすべてを最適化せず、効果の高いものから実施</li>
<li><strong>ユーザー体験を優先</strong> - 数値だけでなく、実際の使用感を重視</li>
</ul>

</Admonition>

## 次のステップ

- [パフォーマンス最適化]({base}/sveltekit/optimization/performance/) - ランタイムパフォーマンスの改善
- [キャッシュ戦略]({base}/sveltekit/optimization/caching/) - 効果的なキャッシュの実装
- [実行環境とランタイム]({base}/sveltekit/deployment/execution-environments/) - デプロイ環境の最適化
