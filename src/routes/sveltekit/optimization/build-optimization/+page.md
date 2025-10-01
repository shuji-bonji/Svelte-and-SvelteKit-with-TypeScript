---
title: ビルド最適化
description: SvelteKitのビルド最適化をTypeScriptで実践 - Vite設定によるコード分割、Tree Shaking、画像最適化、Gzip/Brotli圧縮戦略でバンドルサイズ削減とパフォーマンス向上を実現する方法を詳しく解説します
---

<script>
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
          'vendor': ['svelte', '@sveltejs/kit'],
          'utils': ['date-fns', 'lodash-es']
        },
        
        // アセットファイル名の設定
        assetFileNames: 'assets/[name]-[hash][extname]',
        
        // チャンクファイル名の設定
        chunkFileNames: 'chunks/[name]-[hash].js',
        
        // エントリーファイル名の設定
        entryFileNames: 'entries/[name]-[hash].js'
      }
    },
    
    // Terserによる圧縮設定
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info'],
        passes: 2
      },
      mangle: {
        safari10: true
      },
      format: {
        comments: false
      }
    }
  },
  
  // 依存関係の最適化
  optimizeDeps: {
    include: ['svelte', '@sveltejs/kit'],
    exclude: ['@sveltejs/kit/node']
  }
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
          
          manualChunks: isProd ? (id) => {
            // node_modulesのパッケージをvendorチャンクに
            if (id.includes('node_modules')) {
              // 大きなライブラリは個別チャンクに
              if (id.includes('lodash')) return 'lodash';
              if (id.includes('chart.js')) return 'charts';
              if (id.includes('@sveltejs/kit')) return 'sveltekit';
              
              return 'vendor';
            }
          } : undefined
        }
      }
    },
    
    // 開発サーバーの設定
    server: {
      hmr: {
        overlay: isDev
      }
    }
  };
});
```

## コード分割戦略

効果的なコード分割により、初期ロード時間を大幅に短縮できます。

<Mermaid diagram={codeSplittingDiagram} />

### 動的インポートによる遅延ロード

必要な時にのみコードをロードすることで、初期バンドルサイズを削減します。

```typescript
// +page.svelte - 動的インポートの実装
<script lang="ts">
  import { onMount } from 'svelte';
  
  let ChartComponent: any;
  let isLoading = true;
  
  onMount(async () => {
    // 重いライブラリは必要時にのみロード
    const module = await import('$lib/components/HeavyChart.svelte');
    ChartComponent = module.default;
    isLoading = false;
  });
  
  // 条件付き動的インポート
  async function loadAdminPanel() {
    const { AdminPanel } = await import('$lib/components/AdminPanel.svelte');
    return AdminPanel;
  }
</script>

{#if isLoading}
  <div class="skeleton">チャートを読み込み中...</div>
{:else if ChartComponent}
  <svelte:component this={ChartComponent} />
{/if}
```

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
  formatDate: () => { /* ... */ },
  parseJSON: () => { /* ... */ },
  calculateSum: () => { /* ... */ }
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

## 画像とアセットの最適化

### 画像の自動最適化

画像を自動的に最適化し、適切なフォーマットで配信します。

```typescript
// vite.config.ts - 画像最適化プラグイン
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import imagemin from 'vite-plugin-imagemin';

export default defineConfig({
  plugins: [
    sveltekit(),
    imagemin({
      gifsicle: {
        optimizationLevel: 7,
        interlaced: false
      },
      optipng: {
        optimizationLevel: 7
      },
      mozjpeg: {
        quality: 80
      },
      pngquant: {
        quality: [0.8, 0.9],
        speed: 4
      },
      svgo: {
        plugins: [
          {
            name: 'removeViewBox'
          },
          {
            name: 'removeEmptyAttrs',
            active: false
          }
        ]
      }
    })
  ]
});
```

### レスポンシブ画像の実装

適切なサイズの画像を配信することで、パフォーマンスを向上させます。

```svelte
<!-- lib/components/OptimizedImage.svelte -->
<script lang="ts">
  let { src, alt, sizes = '100vw' }: {
    src: string;
    alt: string;
    sizes?: string;
  } = $props();

  // 画像URLから各サイズを生成
  function generateSrcSet(src: string): string {
    const widths = [320, 640, 768, 1024, 1280, 1920];
    return widths
      .map(w => `${src}?w=${w} ${w}w`)
      .join(', ');
  }
  
  // WebP対応の判定
  let supportsWebP = false;
  if (typeof window !== 'undefined') {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    supportsWebP = canvas.toDataURL?.('image/webp').indexOf('image/webp') === 5;
  }
</script>

<picture>
  {#if supportsWebP}
    <source 
      type="image/webp"
      srcset={generateSrcSet(src.replace(/\.(jpg|png)$/, '.webp'))}
      {sizes}
    />
  {/if}
  <source 
    type="image/jpeg"
    srcset={generateSrcSet(src)}
    {sizes}
  />
  <img 
    {src}
    {alt}
    loading="lazy"
    decoding="async"
  />
</picture>
```

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
      template: 'treemap' // or 'sunburst', 'network'
    })
  ]
});
```

### 分析結果の活用

```typescript
// バンドルサイズ監視スクリプト
// scripts/analyze-bundle.js
import { readFileSync } from 'fs';
import { join } from 'path';

const BUDGET = {
  main: 50 * 1024,      // 50KB
  vendor: 200 * 1024,   // 200KB
  total: 500 * 1024     // 500KB
};

function analyzeBundleSize() {
  const buildDir = '.svelte-kit/output/client';
  const manifest = JSON.parse(
    readFileSync(join(buildDir, '.vite/manifest.json'), 'utf-8')
  );
  
  let totalSize = 0;
  const bundles = {};
  
  for (const [key, value] of Object.entries(manifest)) {
    const size = value.file ? 
      readFileSync(join(buildDir, value.file)).length : 0;
    
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

### Gzip/Brotli圧縮

配信時のファイルサイズを削減します。

```typescript
// vite.config.ts - 圧縮設定
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import viteCompression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    sveltekit(),
    // Gzip圧縮
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz'
    }),
    // Brotli圧縮
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 1024,
      deleteOriginFile: false
    })
  ]
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
  const vitals = await page.evaluate(() => {
    return new Promise((resolve) => {
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        resolve({
          LCP: entries.find(e => e.name === 'largest-contentful-paint')?.startTime,
          FID: entries.find(e => e.name === 'first-input')?.processingStart,
          CLS: entries.reduce((acc, e) => {
            if (e.name === 'layout-shift' && !e.hadRecentInput) {
              return acc + e.value;
            }
            return acc;
          }, 0)
        });
      }).observe({ entryTypes: ['paint', 'layout-shift', 'first-input'] });
    });
  });
  
  // カバレッジレポート
  const jsCoverage = await page.coverage.stopJSCoverage();
  const cssCoverage = await page.coverage.stopCSSCoverage();
  
  const totalBytes = [...jsCoverage, ...cssCoverage].reduce(
    (acc, entry) => acc + entry.text.length, 0
  );
  const usedBytes = [...jsCoverage, ...cssCoverage].reduce(
    (acc, entry) => acc + entry.ranges.reduce(
      (acc2, range) => acc2 + range.end - range.start, 0
    ), 0
  );
  
  console.log('Performance Metrics:');
  console.log('===================');
  console.log(`Navigation: ${JSON.parse(metrics)}`);
  console.log(`Core Web Vitals: ${JSON.stringify(vitals)}`);
  console.log(`Code Coverage: ${(usedBytes / totalBytes * 100).toFixed(2)}%`);
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

:::tip[重要なポイント]
- **測定なくして最適化なし** - 常にパフォーマンスを測定し、効果を検証
- **段階的な最適化** - 一度にすべてを最適化せず、効果の高いものから実施
- **ユーザー体験を優先** - 数値だけでなく、実際の使用感を重視
:::

## 次のステップ

- [パフォーマンス最適化]({base}/sveltekit/optimization/performance/) - ランタイムパフォーマンスの改善
- [キャッシュ戦略]({base}/sveltekit/optimization/caching/) - 効果的なキャッシュの実装
- [実行環境とランタイム]({base}/sveltekit/deployment/execution-environments/) - デプロイ環境の最適化