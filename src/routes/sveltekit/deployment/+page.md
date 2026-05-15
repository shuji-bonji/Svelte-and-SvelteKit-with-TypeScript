---
title: SvelteKit デプロイ・運用編
description: 本番環境への展開と安定運用のための実践ガイド
---
<script>
	import Admonition from '$lib/components/Admonition.svelte';
  import { base } from '$app/paths';
</script>

<Admonition type="caution" title="タイトル">

執筆中

</Admonition>

SvelteKitアプリケーションを**本番環境で安定稼働**させるための、デプロイメント戦略と運用ノウハウを体系的に学びます。各種プラットフォームへの展開から、監視、スケーリングまでを網羅します。


## デプロイメントの要点

プロフェッショナルなデプロイメントと運用に必要な要素を押さえます。

### 主な特徴

1. **マルチプラットフォーム** - 様々な環境へのデプロイ対応
2. **CI/CD自動化** - 継続的インテグレーション/デリバリー
3. **監視と可観測性** - リアルタイム監視とログ分析
4. **スケーラビリティ** - 負荷に応じた自動スケーリング
5. **セキュリティ** - 本番環境の堅牢な保護

## このセクションで学ぶこと

<div class="grid grid-cols-1 md:grid-cols-2 gap-4 my-8 auto-rows-[1fr]">
  <a href="{base}/sveltekit/deployment/platforms/" class="flex no-underline group h-full not-prose" style="color: inherit;">
    <div class="section-card p-4 cursor-pointer flex flex-col w-full">
      <div class="text-3xl mb-2">🚀</div>
      <h3 class="font-bold text-lg mb-2" style="color: var(--color-card-title);">
        プラットフォーム別デプロイ
        <span class="inline-block ml-1 text-xs opacity-60">→</span>
      </h3>
      <p class="text-sm mb-3" style="color: var(--color-card-desc);">各種プラットフォームへの最適なデプロイ方法を学びます。</p>
      <ul class="text-sm space-y-1 flex-grow list-disc pl-5" style="color: var(--color-card-list);">
        <li><strong>Vercel</strong>: ゼロコンフィグデプロイ</li>
        <li><strong>Netlify</strong>: 静的サイト最適化</li>
        <li><strong>Cloudflare Pages</strong>: エッジ配信</li>
        <li><strong>AWS/GCP/Azure</strong>: エンタープライズ</li>
        <li><strong>Docker</strong>: コンテナ化</li>
      </ul>
    </div>
  </a>
  
  <a href="{base}/sveltekit/deployment/execution-environments/" class="flex no-underline group h-full not-prose" style="color: inherit;">
    <div class="section-card p-4 cursor-pointer flex flex-col w-full">
      <div class="text-3xl mb-2">🌐</div>
      <h3 class="font-bold text-lg mb-2" style="color: var(--color-card-title);">
        実行環境とランタイム
        <span class="inline-block ml-1 text-xs opacity-60">→</span>
      </h3>
      <p class="text-sm mb-3" style="color: var(--color-card-desc);">様々な実行環境でSvelteKitがどう動作するかを理解します。</p>
      <ul class="text-sm space-y-1 flex-grow list-disc pl-5" style="color: var(--color-card-list);">
        <li><strong>Node.js</strong>: 標準的なサーバー環境</li>
        <li><strong>Edge Runtime</strong>: エッジでの実行</li>
        <li><strong>Cloudflare Workers</strong>: サーバーレス</li>
        <li><strong>アダプター</strong>: プラットフォーム最適化</li>
        <li><strong>環境変数</strong>: 設定管理</li>
      </ul>
    </div>
  </a>
  
  <a href="{base}/sveltekit/deployment/security/" class="flex no-underline group h-full not-prose" style="color: inherit;">
    <div class="section-card p-4 cursor-pointer flex flex-col w-full">
      <div class="text-3xl mb-2">🔒</div>
      <h3 class="font-bold text-lg mb-2" style="color: var(--color-card-title);">
        セキュリティ対策 — CSP/CSRF/ヘッダー
        <span class="inline-block ml-1 text-xs opacity-60">→</span>
      </h3>
      <p class="text-sm mb-3" style="color: var(--color-card-desc);">SvelteKit 固有の機能（kit.csp / kit.csrf.trustedOrigins / handle hook）で多重防御を実装します。</p>
      <ul class="text-sm space-y-1 flex-grow list-disc pl-5" style="color: var(--color-card-list);">
        <li><strong>CSP</strong>: kit.csp の mode/directives</li>
        <li><strong>CSRF</strong>: trustedOrigins 許可リスト</li>
        <li><strong>handle hook</strong>: HSTS/Frame-Options/Referrer-Policy</li>
        <li><strong>Cookie</strong>: __Host- + HttpOnly+SameSite</li>
        <li><strong>Rate Limiting / 依存関係スキャン</strong></li>
      </ul>
    </div>
  </a>
  
  <a href="{base}/sveltekit/deployment/monitoring/" class="flex no-underline group h-full not-prose" style="color: inherit;">
    <div class="section-card p-4 cursor-pointer flex flex-col w-full">
      <div class="text-3xl mb-2">📊</div>
      <h3 class="font-bold text-lg mb-2" style="color: var(--color-card-title);">
        モニタリングと運用観測
        <span class="inline-block ml-1 text-xs opacity-60">→</span>
      </h3>
      <p class="text-sm mb-3" style="color: var(--color-card-desc);">Sentry / OpenTelemetry / Pino / web-vitals で観測の 5 層（エラー・トレース・ログ・メトリクス・ヘルス）を構築します。</p>
      <ul class="text-sm space-y-1 flex-grow list-disc pl-5" style="color: var(--color-card-list);">
        <li><strong>Sentry</strong>: クライアント+サーバー両対応 SDK</li>
        <li><strong>OpenTelemetry</strong>: kit.experimental.tracing.server</li>
        <li><strong>Pino</strong>: 構造化ログ + requestId 追跡</li>
        <li><strong>web-vitals v4</strong>: Core Web Vitals RUM</li>
        <li><strong>ヘルスチェック</strong>: /healthz, livez, readyz</li>
      </ul>
    </div>
  </a>
  
  <a href="#" class="flex no-underline group h-full pointer-events-none opacity-50">
    <div class="section-card p-4 cursor-pointer flex flex-col w-full">
      <div class="text-3xl mb-2">🔄</div>
      <h3 class="font-bold text-lg mb-2" style="color: var(--color-card-title);">
        CI/CDパイプライン <span class="text-xs">(準備中)</span>
        <span class="inline-block ml-1 text-xs opacity-60">→</span>
      </h3>
      <p class="text-sm mb-3" style="color: var(--color-card-desc);">自動化されたビルドとデプロイパイプラインを構築します。</p>
      <ul class="text-sm space-y-1 flex-grow list-disc pl-5" style="color: var(--color-card-list);">
        <li><strong>GitHub Actions</strong>: ワークフロー自動化</li>
        <li><strong>自動テスト</strong>: 品質保証</li>
        <li><strong>環境別デプロイ</strong>: dev/staging/prod</li>
        <li><strong>ロールバック</strong>: 安全な復旧</li>
        <li><strong>Blue-Green</strong>: ゼロダウンタイム</li>
      </ul>
    </div>
  </a>
</div>

## デプロイ戦略の選択

### プラットフォーム比較表

| プラットフォーム | 最適な用途 | 価格 | 難易度 |
|----------------|----------|------|--------|
| **Vercel** | SPA/SSR/ISR | 無料枠あり | ⭐ |
| **Netlify** | 静的サイト | 無料枠あり | ⭐ |
| **Cloudflare Pages** | エッジ配信 | 無料枠充実 | ⭐⭐ |
| **AWS** | エンタープライズ | 従量課金 | ⭐⭐⭐ |
| **自前サーバー** | 完全制御 | VPS料金 | ⭐⭐⭐⭐ |

### アダプター設定例

```typescript
// svelte.config.js
import adapter from '@sveltejs/adapter-vercel';
// import adapter from '@sveltejs/adapter-netlify';
// import adapter from '@sveltejs/adapter-cloudflare';
// import adapter from '@sveltejs/adapter-node';

export default {
  kit: {
    adapter: adapter({
      // プラットフォーム固有の設定
      edge: false,
      split: false
    })
  }
};
```

## 本番環境のベストプラクティス

### セキュリティチェックリスト

- ✅ HTTPS強制
- ✅ CSPヘッダー設定
- ✅ 環境変数の暗号化
- ✅ DDoS対策
- ✅ SQLインジェクション防止
- ✅ XSS対策
- ✅ CSRF保護

### パフォーマンス監視

```typescript
// 監視設定例
export const monitoring = {
  // 稼働率目標
  sla: 99.9,
  // アラート閾値
  alerts: {
    responseTime: 1000, // ms
    errorRate: 0.01, // 1%
    cpuUsage: 80, // %
  },
};
```

## 学習の進め方

### 推奨学習順序

1. **プラットフォーム別デプロイ** - 基本的なデプロイ手法
2. **セキュリティ** - 本番環境の保護
3. **モニタリング** - 可観測性の確立
4. **CI/CDパイプライン** - 自動化の構築

### 学習目標

このセクションを完了すると、以下ができるようになります。

- 各種プラットフォームへ適切にデプロイできる
- セキュアな本番環境を構築できる
- 効果的な監視システムを導入できる
- CI/CDパイプラインを構築・運用できる

## 次のステップ

デプロイ・運用編を習得したら、実際のプロジェクトで本番運用を始めましょう。小規模から始めて、徐々にスケールアップすることをお勧めします。

<Admonition type="tip" title="段階的アプローチ">

まずはVercelやNetlifyなどの管理されたプラットフォームから始めて、要件に応じてより複雑な環境へ移行することをお勧めします。

</Admonition>
<Admonition type="warning" title="本番環境の責任">

本番環境では、セキュリティ、可用性、パフォーマンスに対する責任が伴います。適切なバックアップとディザスタリカバリ計画を必ず準備してください。

</Admonition>