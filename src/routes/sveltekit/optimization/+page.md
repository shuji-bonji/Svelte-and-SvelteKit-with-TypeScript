---
title: SvelteKit 最適化編
description: SvelteKitでパフォーマンスを極限まで高めるための総合ガイド。バンドル削減、画像とフォント最適化、ハイドレーション戦略、計測とプロファイル手順、CIでの検証フローまで実践的なチューニング道筋を提示し、チェックリストも付属。改善優先度も示す。詳しい手順とチェックリスト付き。運用時の確認ポイントも掲載
---
<script>
	import Admonition from '$lib/components/Admonition.svelte';
  import { base } from '$app/paths';
</script>

<Admonition type="caution" title="タイトル">

一部、執筆中

</Admonition>

SvelteKitアプリケーションの**パフォーマンスを最大限に引き出す**ための最適化技術を学びます。Core Web Vitals の改善、バンドルサイズの削減、レンダリング最適化など、実践的な手法を網羅します。

## 最適化の重要性

高速なWebアプリケーションは、ユーザー体験とビジネス成果に直結します。

### パフォーマンスの影響

1. **ユーザー体験** - 直帰率を50%削減
2. **SEOランキング** - Core Web Vitalsがランキング要因
3. **コンバージョン率** - 1秒の改善で7%向上
4. **開発効率** - 最適化されたコードは保守しやすい
5. **インフラコスト** - リソース使用量を削減

## このセクションで学ぶこと

<div class="grid grid-cols-1 md:grid-cols-2 gap-4 my-8 auto-rows-[1fr]">
  <a href="{base}/sveltekit/optimization/performance/" class="flex no-underline group h-full not-prose" style="color: inherit;">
    <div class="section-card p-4 cursor-pointer flex flex-col w-full">
      <div class="text-3xl mb-2">⚡</div>
      <h3 class="font-bold text-lg mb-2" style="color: var(--color-card-title);">
        パフォーマンス最適化 <span class="text-xs">(準備中)</span>
        <span class="inline-block ml-1 text-xs opacity-60">→</span>
      </h3>
      <p class="text-sm mb-3" style="color: var(--color-card-desc);">Core Web Vitalsを改善し、高速なUXを実現します。</p>
      <ul class="text-sm space-y-1 flex-grow list-disc pl-5" style="color: var(--color-card-list);">
        <li><strong>LCP最適化</strong>: 2.5秒以内の表示</li>
        <li><strong>INP改善</strong>: 200ms以内の応答</li>
        <li><strong>CLS削減</strong>: レイアウトシフト防止</li>
        <li><strong>ランタイム最適化</strong>: 実行時パフォーマンス</li>
        <li><strong>メモリ管理</strong>: リーク防止</li>
      </ul>
    </div>
  </a>
  
  <a href="{base}/sveltekit/optimization/build-optimization/" class="flex no-underline group h-full not-prose" style="color: inherit;">
    <div class="section-card p-4 cursor-pointer flex flex-col w-full">
      <div class="text-3xl mb-2">🚀</div>
      <h3 class="font-bold text-lg mb-2" style="color: var(--color-card-title);">
        ビルド最適化
        <span class="inline-block ml-1 text-xs opacity-60">→</span>
      </h3>
      <p class="text-sm mb-3" style="color: var(--color-card-desc);">ビルドプロセスを最適化し、バンドルサイズを削減します。</p>
      <ul class="text-sm space-y-1 flex-grow list-disc pl-5" style="color: var(--color-card-list);">
        <li><strong>コード分割</strong>: 動的インポート戦略</li>
        <li><strong>Tree Shaking</strong>: 不要コードの除去</li>
        <li><strong>バンドル分析</strong>: Bundle Analyzer</li>
        <li><strong>画像最適化</strong>: 次世代フォーマット</li>
        <li><strong>圧縮戦略</strong>: Gzip/Brotli</li>
      </ul>
    </div>
  </a>
  
  <a href="{base}/sveltekit/optimization/caching/" class="flex no-underline group h-full not-prose" style="color: inherit;">
    <div class="section-card p-4 cursor-pointer flex flex-col w-full">
      <div class="text-3xl mb-2">💾</div>
      <h3 class="font-bold text-lg mb-2" style="color: var(--color-card-title);">
        キャッシュ戦略 <span class="text-xs">(準備中)</span>
        <span class="inline-block ml-1 text-xs opacity-60">→</span>
      </h3>
      <p class="text-sm mb-3" style="color: var(--color-card-desc);">効果的なキャッシュ戦略で高速化とコスト削減を実現します。</p>
      <ul class="text-sm space-y-1 flex-grow list-disc pl-5" style="color: var(--color-card-list);">
        <li><strong>ブラウザキャッシュ</strong>: Cache-Control最適化</li>
        <li><strong>CDNキャッシュ</strong>: エッジ配信</li>
        <li><strong>Service Worker</strong>: オフライン対応</li>
        <li><strong>データキャッシュ</strong>: Redis/メモリ</li>
        <li><strong>ISR</strong>: 増分静的再生成</li>
      </ul>
    </div>
  </a>
  
  <a href="{base}/sveltekit/optimization/pwa/" class="flex no-underline group h-full not-prose" style="color: inherit;">
    <div class="section-card p-4 cursor-pointer flex flex-col w-full">
      <div class="text-3xl mb-2">📱</div>
      <h3 class="font-bold text-lg mb-2" style="color: var(--color-card-title);">
        Service Workers / PWA
        <span class="inline-block ml-1 text-xs opacity-60">→</span>
      </h3>
      <p class="text-sm mb-3" style="color: var(--color-card-desc);">オフライン対応とインストール可能なWebアプリを実装します。</p>
      <ul class="text-sm space-y-1 flex-grow list-disc pl-5" style="color: var(--color-card-list);">
        <li><strong>service-worker.ts</strong>: SvelteKit規約</li>
        <li><strong>プリキャッシュ</strong>: ビルド成果物</li>
        <li><strong>ランタイムキャッシュ</strong>: fetchの制御</li>
        <li><strong>manifest.json</strong>: インストール対応</li>
        <li><strong>更新戦略</strong>: skipWaiting と通知</li>
      </ul>
    </div>
  </a>

  <a href="{base}/sveltekit/optimization/observability/" class="flex no-underline group h-full not-prose" style="color: inherit;">
    <div class="section-card p-4 cursor-pointer flex flex-col w-full">
      <div class="text-3xl mb-2">📊</div>
      <h3 class="font-bold text-lg mb-2" style="color: var(--color-card-title);">
        Observability
        <span class="inline-block ml-1 text-xs opacity-60">→</span>
      </h3>
      <p class="text-sm mb-3" style="color: var(--color-card-desc);">ログ／メトリクス／トレースで本番環境を計測します。</p>
      <ul class="text-sm space-y-1 flex-grow list-disc pl-5" style="color: var(--color-card-list);">
        <li><strong>Web Vitals</strong>: RUM の収集</li>
        <li><strong>OpenTelemetry</strong>: 分散トレース</li>
        <li><strong>server hooks</strong>: リクエスト計測</li>
        <li><strong>Sentry</strong>: エラーモニタリング</li>
        <li><strong>ダッシュボード</strong>: 可視化戦略</li>
      </ul>
    </div>
  </a>

  <a href="{base}/sveltekit/optimization/seo/" class="flex no-underline group h-full not-prose" style="color: inherit;">
    <div class="section-card p-4 cursor-pointer flex flex-col w-full">
      <div class="text-3xl mb-2">🔍</div>
      <h3 class="font-bold text-lg mb-2" style="color: var(--color-card-title);">
        SEO最適化 <span class="text-xs">(準備中)</span>
        <span class="inline-block ml-1 text-xs opacity-60">→</span>
      </h3>
      <p class="text-sm mb-3" style="color: var(--color-card-desc);">検索エンジン最適化で可視性を向上させます。</p>
      <ul class="text-sm space-y-1 flex-grow list-disc pl-5" style="color: var(--color-card-list);">
        <li><strong>メタタグ管理</strong>: 動的なSEOタグ</li>
        <li><strong>構造化データ</strong>: JSON-LD実装</li>
        <li><strong>サイトマップ</strong>: 自動生成</li>
        <li><strong>OGP設定</strong>: SNSシェア最適化</li>
        <li><strong>i18n対応</strong>: 多言語SEO</li>
      </ul>
    </div>
  </a>
</div>

## パフォーマンス指標と目標

### Core Web Vitals 目標値

| 指標 | 良好 | 改善が必要 | 悪い |
|------|------|----------|------|
| **LCP** | &lt; 2.5s | 2.5s - 4s | &gt; 4s |
| **INP** | &lt; 200ms | 200ms - 500ms | &gt; 500ms |
| **CLS** | &lt; 0.1 | 0.1 - 0.25 | &gt; 0.25 |
| **FCP** | &lt; 1.8s | 1.8s - 3s | &gt; 3s |
| **TTI** | &lt; 3.8s | 3.8s - 7.3s | &gt; 7.3s |

:::info[2024-03 に FID は INP へ置き換えられた]
Google が定義する Core Web Vitals は、2024 年 3 月の更新で **FID（First Input Delay）** が **INP（Interaction to Next Paint）** に置き換わりました。INP は「ユーザー操作の最初の遅延」だけでなく、**ページ表示中のあらゆるインタラクションのうち最も遅いもの**を測るため、より実態に近い体感性能の指標になっています。`web-vitals` ライブラリは v4 系で `onINP` をエクスポートしているので、計測コードでは `onFID` から `onINP` への移行を行ってください。
:::

### 最適化チェックリスト

```typescript
// 最適化設定例
export const config = {
  // プリレンダリング
  prerender: {
    crawl: true,
    entries: ['*'],
  },
  // トレーリングスラッシュ
  trailingSlash: 'never',
  // CSP設定
  csp: {
    mode: 'auto',
    directives: {
      'script-src': ['self'],
    },
  },
};
```

## 最適化テクニック

### 即効性のある最適化

1. **画像の遅延読み込み** - loading="lazy"
2. **フォント最適化** - font-display: swap
3. **Critical CSS** - インライン化
4. **プリコネクト** - DNS事前解決
5. **バンドル分割** - 動的インポート

### バンドルサイズ削減

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['svelte'],
          utils: ['lodash-es'],
        },
      },
    },
    // Tree shaking
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
});
```

## 学習の進め方

### 推奨学習順序

1. **ビルド最適化** - バンドル分析、Tree Shaking、圧縮
2. **キャッシュ戦略** - HTTP/CDN/Service Worker
3. **Service Workers / PWA** - オフラインとインストール対応
4. **Observability** - 本番環境の計測と可視化
5. **パフォーマンス最適化（準備中）** - Core Web Vitals の改善
6. **SEO最適化（準備中）** - 検索エンジン対策

### 学習目標

このセクションを完了すると、以下ができるようになります。

- Lighthouseスコア90点以上を達成できる
- Core Web Vitalsをすべて「良好」にできる
- 効果的なキャッシュ戦略を実装できる
- SEOに最適化されたサイトを構築できる

## 次のステップ

最適化編を習得したら、[デプロイ・運用編](/sveltekit/deployment/)で本番環境への展開を学びましょう。

<Admonition type="tip" title="継続的な最適化">

パフォーマンス最適化は一度きりの作業ではありません。定期的な測定と改善のサイクルを回すことで、常に高いパフォーマンスを維持できます。

</Admonition>
<Admonition type="warning" title="過度な最適化に注意">

最適化は重要ですが、過度な最適化は開発速度を低下させます。まず測定して、本当に必要な最適化に集中しましょう。

</Admonition>