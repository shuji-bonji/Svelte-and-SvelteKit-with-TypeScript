---
title: 学習ガイド
description: あなたのレベルに応じた最適な学習パスを提供します
---

<script>
  import { base } from '$app/paths';
  import Mermaid from '$lib/components/Mermaid.svelte';
  

</script>


## 📚 レベル別学習パス

<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 my-8">
  <div class="p-4 border border-gray-2 dark:border-gray-7 rounded-lg shadow-md hover:shadow-lg transition-shadow">
    <h3 class="font-bold text-lg mb-2">🎯 はじめに</h3>
    <ol class="space-y-2">
      <li><a href="{base}/introduction/" class="text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 underline decoration-pink-300 dark:decoration-pink-600 decoration-2 underline-offset-2 transition-colors">Svelte 5の概要</a></li>
      <li><a href="{base}/introduction/why-svelte/" class="text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 underline decoration-pink-300 dark:decoration-pink-600 decoration-2 underline-offset-2 transition-colors">なぜSvelteか</a></li>
      <li><a href="{base}/introduction/setup/" class="text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 underline decoration-pink-300 dark:decoration-pink-600 decoration-2 underline-offset-2 transition-colors">環境構築</a></li>
      <li><a href="{base}/introduction/typescript-setup/" class="text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 underline decoration-pink-300 dark:decoration-pink-600 decoration-2 underline-offset-2 transition-colors">TypeScript設定</a></li>
    </ol>
  </div>
  <div class="p-4 border border-gray-2 dark:border-gray-7 rounded-lg shadow-md hover:shadow-lg transition-shadow">
    <h3 class="font-bold text-lg mb-2">🔧 Svelteの基本</h3>
    <ol class="space-y-2">
      <li><a href="{base}/svelte-basics/" class="text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 underline decoration-pink-300 dark:decoration-pink-600 decoration-2 underline-offset-2 transition-colors">Svelteの基本概要</a></li>
      <li><a href="{base}/svelte-basics/hello-world/" class="text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 underline decoration-pink-300 dark:decoration-pink-600 decoration-2 underline-offset-2 transition-colors">Hello World</a></li>
      <li><a href="{base}/svelte-basics/component-basics/" class="text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 underline decoration-pink-300 dark:decoration-pink-600 decoration-2 underline-offset-2 transition-colors">コンポーネントの基本</a></li>
      <li><a href="{base}/svelte-basics/typescript-integration/" class="text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 underline decoration-pink-300 dark:decoration-pink-600 decoration-2 underline-offset-2 transition-colors">TypeScript統合</a></li>
      <li><a href="{base}/svelte-basics/script-context/" class="text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 underline decoration-pink-300 dark:decoration-pink-600 decoration-2 underline-offset-2 transition-colors">スクリプトコンテキスト</a></li>
    </ol>
  </div>
    <div class="p-4 border border-gray-2 dark:border-gray-7 rounded-lg shadow-md hover:shadow-lg transition-shadow">
    <h3 class="font-bold text-lg mb-2">📚 Runesシステム</h3>
    <ol class="space-y-2">
      <li><a href="{base}/runes/" class="text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 underline decoration-pink-300 dark:decoration-pink-600 decoration-2 underline-offset-2 transition-colors">Runesシステム概要</a></li>
      <li><a href="{base}/runes/runes-introduction/" class="text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 underline decoration-pink-300 dark:decoration-pink-600 decoration-2 underline-offset-2 transition-colors">Runesシステム入門</a></li>
      <li><a href="{base}/runes/state/" class="text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 underline decoration-pink-300 dark:decoration-pink-600 decoration-2 underline-offset-2 transition-colors">$stateルーン</a></li>
      <li><a href="{base}/runes/derived/" class="text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 underline decoration-pink-300 dark:decoration-pink-600 decoration-2 underline-offset-2 transition-colors">$derivedルーン</a></li>
      <li><a href="{base}/runes/effect/" class="text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 underline decoration-pink-300 dark:decoration-pink-600 decoration-2 underline-offset-2 transition-colors">$effectルーン</a></li>
      <li><a href="{base}/runes/props/" class="text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 underline decoration-pink-300 dark:decoration-pink-600 decoration-2 underline-offset-2 transition-colors">$propsルーン</a></li>
      <li><a href="{base}/runes/bindable/" class="text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 underline decoration-pink-300 dark:decoration-pink-600 decoration-2 underline-offset-2 transition-colors">$bindableルーン</a></li>
    </ol>
  </div>
  <div class="p-4 border border-gray-2 dark:border-gray-7 rounded-lg shadow-md hover:shadow-lg transition-shadow">
    <h3 class="font-bold text-lg mb-2">🚀 実践編</h3>
    <ol class="space-y-2">
      <li><a href="{base}/advanced/" class="text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 underline decoration-pink-300 dark:decoration-pink-600 decoration-2 underline-offset-2 transition-colors">実践概要</a></li>
      <li><a href="{base}/advanced/reactive-stores/" class="text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 underline decoration-pink-300 dark:decoration-pink-600 decoration-2 underline-offset-2 transition-colors">リアクティブストア</a></li>
      <li><a href="{base}/advanced/class-reactivity/" class="text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 underline decoration-pink-300 dark:decoration-pink-600 decoration-2 underline-offset-2 transition-colors">クラスとリアクティビティ</a></li>
      <li><a href="{base}/advanced/snippets/" class="text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 underline decoration-pink-300 dark:decoration-pink-600 decoration-2 underline-offset-2 transition-colors">Snippets機能</a></li>
      <li><a href="{base}/advanced/component-patterns/" class="text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 underline decoration-pink-300 dark:decoration-pink-600 decoration-2 underline-offset-2 transition-colors">コンポーネントパターン</a></li>
      <li><a href="{base}/advanced/typescript-patterns/" class="text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 underline decoration-pink-300 dark:decoration-pink-600 decoration-2 underline-offset-2 transition-colors">TypeScriptパターン</a></li>
    </ol>
  </div>
</div>


<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 my-8">

  <div class="p-4 border border-gray-2 dark:border-gray-7 rounded-lg shadow-md hover:shadow-lg transition-shadow">
    <h3 class="font-bold text-lg mb-2">⚡ SvelteKit</h3>
    <ol class="space-y-2">
      <li><a href="{base}/sveltekit/" class="text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 underline decoration-pink-300 dark:decoration-pink-600 decoration-2 underline-offset-2 transition-colors">SvelteKit概要</a></li>
      <li><a href="{base}/sveltekit/routing/" class="text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 underline decoration-pink-300 dark:decoration-pink-600 decoration-2 underline-offset-2 transition-colors">ルーティング</a></li>
      <li><a href="{base}/sveltekit/load-functions/" class="text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 underline decoration-pink-300 dark:decoration-pink-600 decoration-2 underline-offset-2 transition-colors">Load関数</a></li>
      <li><a href="{base}/sveltekit/server-side/" class="text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 underline decoration-pink-300 dark:decoration-pink-600 decoration-2 underline-offset-2 transition-colors">サーバーサイド処理</a></li>
      <li><a href="{base}/sveltekit/forms/" class="text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 underline decoration-pink-300 dark:decoration-pink-600 decoration-2 underline-offset-2 transition-colors">フォーム処理</a></li>
      <li><a href="{base}/sveltekit/api-routes/" class="text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 underline decoration-pink-300 dark:decoration-pink-600 decoration-2 underline-offset-2 transition-colors">APIルート</a></li>
      <li><a href="{base}/sveltekit/deployment/" class="text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 underline decoration-pink-300 dark:decoration-pink-600 decoration-2 underline-offset-2 transition-colors">デプロイメント</a></li>
    </ol>
  </div>
  <div class="p-4 border border-gray-2 dark:border-gray-7 rounded-lg shadow-md hover:shadow-lg transition-shadow">
    <h3 class="font-bold text-lg mb-2">💡 実装例</h3>
    <ol class="space-y-2">
      <li><a href="{base}/examples/" class="text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 underline decoration-pink-300 dark:decoration-pink-600 decoration-2 underline-offset-2 transition-colors">実装例一覧</a></li>
      <li><a href="{base}/examples/todo-app/" class="text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 underline decoration-pink-300 dark:decoration-pink-600 decoration-2 underline-offset-2 transition-colors">TODOアプリ</a></li>
      <li><a href="{base}/examples/auth-system/" class="text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 underline decoration-pink-300 dark:decoration-pink-600 decoration-2 underline-offset-2 transition-colors">認証システム</a></li>
      <li><a href="{base}/examples/data-fetching/" class="text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 underline decoration-pink-300 dark:decoration-pink-600 decoration-2 underline-offset-2 transition-colors">データフェッチング</a></li>
      <li><a href="{base}/examples/websocket/" class="text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 underline decoration-pink-300 dark:decoration-pink-600 decoration-2 underline-offset-2 transition-colors">WebSocket実装</a></li>
      <li><a href="{base}/examples/mermaid-demo/" class="text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 underline decoration-pink-300 dark:decoration-pink-600 decoration-2 underline-offset-2 transition-colors">Mermaidダイアグラム</a></li>
    </ol>
  </div>
</div>

## 🗺️ 推奨学習ロードマップ

### 🌱 初心者コース（3-4週間）

<div class="roadmap-section">
  <h4 class="text-lg font-bold mb-3">Week 1: 基礎を固める</h4>
  <div class="week-content">
    <div class="day">Day 1-2: <a href="{base}/introduction/setup/">環境構築</a> & <a href="{base}/svelte-basics/hello-world/">Hello World</a></div>
    <div class="day">Day 3-4: <a href="{base}/svelte-basics/component-basics/">コンポーネントの基本</a></div>
    <div class="day">Day 5-7: <a href="{base}/runes/state/">リアクティビティ入門</a></div>
  </div>
  
  <h4 class="text-lg font-bold mb-3 mt-4">Week 2-3: 実践開発</h4>
  <div class="week-content">
    <div class="day">Runesシステムの理解</div>
    <div class="day">簡単なアプリケーション作成</div>
    <div class="day">TypeScript統合</div>
  </div>
  
  <h4 class="text-lg font-bold mb-3 mt-4">Week 4: プロジェクト</h4>
  <div class="week-content">
    <div class="day"><a href="{base}/examples/todo-app/">TODOアプリ作成</a></div>
  </div>
</div>

### 🚀 経験者コース（1-2週間）

<div class="roadmap-section">
  <h4 class="text-lg font-bold mb-3">Phase 1: Svelteの哲学（2-3日）</h4>
  <ul class="phase-list">
    <li><a href="{base}/introduction/why-svelte/">なぜSvelteか</a> - 他フレームワークとの違いを理解</li>
    <li><a href="{base}/deep-dive/compile-time-optimization/">コンパイル時最適化</a>の仕組み</li>
  </ul>
  
  <h4 class="text-lg font-bold mb-3 mt-4">Phase 2: Runesマスター（3-4日）</h4>
  <ul class="phase-list">
    <li>useState → $state への移行</li>
    <li>useEffect → $effect への移行</li>
    <li>useMemo → $derived への移行</li>
  </ul>
  
  <h4 class="text-lg font-bold mb-3 mt-4">Phase 3: SvelteKit（4-5日）</h4>
  <ul class="phase-list">
    <li><a href="{base}/sveltekit/routing/">ルーティング</a></li>
    <li><a href="{base}/sveltekit/load-functions/">データローディング</a></li>
    <li><a href="{base}/sveltekit/server-side/">SSR/SSG</a></li>
  </ul>
</div>

### ⚡ 移行者コース（3-5日）

<div class="migration-guide p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
  <h4 class="text-lg font-bold mb-3">Svelte 4 → Svelte 5 移行ガイド</h4>
  
  <div class="migration-table">
    <table class="w-full">
      <thead>
        <tr>
          <th class="text-left">Svelte 4</th>
          <th>→</th>
          <th class="text-left">Svelte 5</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><code>let count = 0</code></td>
          <td>→</td>
          <td><code>let count = $state(0)</code></td>
        </tr>
        <tr>
          <td><code>$: doubled = count * 2</code></td>
          <td>→</td>
          <td><code>let doubled = $derived(count * 2)</code></td>
        </tr>
        <tr>
          <td><code>export let prop</code></td>
          <td>→</td>
          <td><code>let &#123; prop &#125; = $props()</code></td>
        </tr>
      </tbody>
    </table>
  </div>
  
  <p class="mt-4">詳細は<a href="{base}/runes/">Runesシステム</a>を参照してください。</p>
</div>

## ✅ スキルチェックリスト

<div class="skill-checklist grid grid-cols-1 md:grid-cols-2 gap-4 my-8">
  <div class="skill-section">
    <h4 class="font-bold mb-2">基礎スキル</h4>
    <ul class="checklist">
      <li>□ Svelteプロジェクトの作成</li>
      <li>□ コンポーネントの作成と使用</li>
      <li>□ $stateによる状態管理</li>
      <li>□ イベントハンドリング</li>
      <li>□ 条件分岐とループ</li>
    </ul>
  </div>
  
  <div class="skill-section">
    <h4 class="font-bold mb-2">応用スキル</h4>
    <ul class="checklist">
      <li>□ Runesシステムの完全理解</li>
      <li>□ TypeScript統合</li>
      <li>□ SvelteKitルーティング</li>
      <li>□ SSR/SSG/SPAの使い分け</li>
      <li>□ パフォーマンス最適化</li>
    </ul>
  </div>
</div>

## 💡 学習のコツ

<div class="tips-section grid grid-cols-1 md:grid-cols-2 gap-4 my-8">
  <div class="tip-card p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
    <h4 class="font-bold mb-2">✅ 推奨事項</h4>
    <ul>
      <li>コードを実際に書いて試す</li>
      <li>小さなプロジェクトから始める</li>
      <li>TypeScriptを最初から使う</li>
      <li>公式ドキュメントを参照する</li>
    </ul>
  </div>
  
  <div class="tip-card p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
    <h4 class="font-bold mb-2">❌ 避けるべきこと</h4>
    <ul>
      <li>Svelte 4の古い記法を使う</li>
      <li>Reactの書き方をそのまま適用</li>
      <li>TypeScriptを後回しにする</li>
      <li>大規模プロジェクトから始める</li>
    </ul>
  </div>
</div>

<style>
  .level-card {
    padding: 1rem;
    background: white;
    dark:background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
  }
  
  .roadmap-section {
    margin: 1.5rem 0;
    padding: 1rem;
    border-left: 3px solid #ff3e00;
    padding-left: 1.5rem;
  }
  
  .week-content .day {
    margin: 0.5rem 0;
    padding-left: 1rem;
  }
  
  .phase-list {
    list-style: none;
    padding-left: 1rem;
  }
  
  .phase-list li {
    margin: 0.5rem 0;
  }
  
  .migration-table table {
    margin-top: 1rem;
  }
  
  .migration-table td, .migration-table th {
    padding: 0.5rem;
    border-bottom: 1px solid rgba(0,0,0,0.1);
  }
  
  .checklist {
    list-style: none;
    padding: 0;
  }
  
  .checklist li {
    margin: 0.25rem 0;
  }
</style>
