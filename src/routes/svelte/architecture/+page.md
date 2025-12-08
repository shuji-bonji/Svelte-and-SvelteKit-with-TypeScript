---
title: アーキテクチャパターン
description: Svelteで採用できる主要アーキテクチャを俯瞰。SPA/MPA/ハイブリッド構成、既存バックエンドとの統合、デスクトップ/モバイル展開、TypeScriptでの設計上のトレードオフや移行戦略をコンパクトに整理した総論。関連パターンへの導線付き。詳しい手順とチェックリスト付き。運用時の確認ポイントも掲載
---

<script>
  import { base } from '$app/paths';
  import Mermaid from '$lib/components/Mermaid.svelte';
  
  const architectureChoice = `flowchart TD
    Start[プロジェクト要件]
    
    Q1{既存バックエンド<br/>があるか？}
    Q2{SSR/SEOが<br/>必要か？}
    Q3{プラットフォーム}
    
    A1[Svelte + API<br/>（SPA構成）]
    A2[SvelteKit<br/>（フルスタック）]
    A3[既存システムに<br/>Svelte統合]
    A4[Tauri/Electron<br/>デスクトップ]
    
    Start --> Q1
    Q1 -->|ない| Q2
    Q1 -->|ある| Q3
    Q2 -->|必要| A2
    Q2 -->|不要| A1
    Q3 -->|Web| A3
    Q3 -->|Desktop| A4
    
    style Start fill:#FF5722,color:#fff
    style A1 fill:#4CAF50,color:#fff
    style A2 fill:#2196F3,color:#fff
    style A3 fill:#FF9800,color:#fff
    style A4 fill:#9C27B0,color:#fff`;
</script>

Svelteは柔軟なフレームワークであり、**様々なバックエンドやプラットフォームと組み合わせて**使用できます。SvelteKitだけでなく、既存システムとの統合やSPA構築など、プロジェクトの要件に応じた最適な構成を選択できます。

## なぜアーキテクチャパターンを学ぶのか？

実際のプロジェクトでは、以下のような状況がよくあります。

- 🏢 **既存のAPIがある** - Rails、Django、Laravelなどの既存バックエンド
- ☁️ **BaaSを使いたい** - Firebase、Supabase、AWS Amplifyなど
- 💻 **デスクトップアプリ** - Electron、Tauriでのネイティブアプリ
- 📱 **モバイルアプリ** - Capacitorでのクロスプラットフォーム開発


## 主要パターン一覧

<div class="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
  <a href="{base}/svelte/architecture/spa-patterns/" class="flex no-underline group">
    <div class="p-6 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md hover:shadow-lg hover:border-orange-400 transition-all">
      <div class="text-3xl mb-3">🌐</div>
      <h3 class="font-bold text-xl mb-3 text-orange-600 dark:text-orange-400">SPA + API構成</h3>
      <p class="text-sm text-gray-700 dark:text-gray-300">
        Firebase、Supabase、GraphQLなどのバックエンドとSvelteを組み合わせたSPA構築
      </p>
      <ul class="text-sm text-gray-600 dark:text-gray-400 mt-3 space-y-1">
        <li>✅ 既存APIの活用</li>
        <li>✅ BaaSとの統合</li>
        <li>✅ リアルタイム機能</li>
      </ul>
    </div>
  </a>

  <a href="{base}/svelte/architecture/hybrid-integration/" class="flex no-underline group">
    <div class="p-6 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md hover:shadow-lg hover:border-orange-400 transition-all">
      <div class="text-3xl mb-3">🔄</div>
      <h3 class="font-bold text-xl mb-3 text-orange-600 dark:text-orange-400">既存システム統合</h3>
      <p class="text-sm text-gray-700 dark:text-gray-300">
        Rails、Laravel、DjangoなどにSvelteコンポーネントを段階的に導入
      </p>
      <ul class="text-sm text-gray-600 dark:text-gray-400 mt-3 space-y-1">
        <li>✅ 段階的移行</li>
        <li>✅ 部分的な導入</li>
        <li>✅ 既存資産の活用</li>
      </ul>
    </div>
  </a>

  <a href="{base}/svelte/architecture/desktop-mobile/" class="flex no-underline group">
    <div class="p-6 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md hover:shadow-lg hover:border-orange-400 transition-all">
      <div class="text-3xl mb-3">💻</div>
      <h3 class="font-bold text-xl mb-3 text-orange-600 dark:text-orange-400">デスクトップ・モバイル</h3>
      <p class="text-sm text-gray-700 dark:text-gray-300">
        Tauri、Electron、Capacitorを使用したネイティブアプリ開発
      </p>
      <ul class="text-sm text-gray-600 dark:text-gray-400 mt-3 space-y-1">
        <li>✅ クロスプラットフォーム</li>
        <li>✅ ネイティブ機能</li>
        <li>✅ オフライン対応</li>
      </ul>
    </div>
  </a>
</div>


## アーキテクチャ選択フロー

<Mermaid diagram={architectureChoice} />


## パターン比較表

| パターン | 適用場面 | メリット | デメリット |
|---------|---------|---------|-----------|
| **Svelte + API** | 既存APIがある、BaaS利用 | 柔軟性が高い、既存資産活用 | SEOが弱い、初期表示が遅い |
| **SvelteKit** | 新規プロジェクト、SSR必要 | SSR/SSG対応、統合環境 | 学習コスト、制約がある |
| **既存システム統合** | レガシー改善、段階的移行 | リスク低、部分導入可能 | 複雑性増加、二重管理 |
| **デスクトップ** | ネイティブアプリ | OS機能アクセス、配布容易 | バンドルサイズ大 |


## SvelteKitを使わない理由

以下のケースでは、**SvelteKit以外の選択肢**が適切な場合があります。

1. **既存のバックエンドが充実している**
   - REST APIが完成している
   - GraphQLサーバーがある
   - 認証・認可が実装済み

2. **特定のBaaSに依存したい**
   - Firebaseのエコシステムを活用
   - Supabaseのリアルタイム機能
   - AWS Amplifyの統合環境

3. **デプロイ環境の制約**
   - 静的ホスティングのみ使用可能
   - 特定のCDNサービスに限定
   - Node.jsランタイムが使えない

:::tip[選択のポイント]
「SvelteKitは素晴らしいフレームワークですが、すべてのプロジェクトに最適とは限りません」
プロジェクトの要件、チームのスキル、既存資産を考慮して選択しましょう。
:::
