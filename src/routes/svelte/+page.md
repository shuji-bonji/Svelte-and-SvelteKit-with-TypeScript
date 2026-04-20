---
title: Svelte 5完全ガイド
description: Svelte 5をTypeScriptで完全マスター - コンポーネントの基本、Runesシステム（$state/$derived/$effect）、アタッチメント（{@attach}）、トランジション、Snippets、実験的なawait expressionsまで、React/Vue/Angular経験者も安心の実践解説
---

<script>
	import Admonition from '$lib/components/Admonition.svelte';
  import { base } from '$app/paths';
  import Mermaid from '$lib/components/Mermaid.svelte';

  const learningFlow = `flowchart LR
    Start([🚀 学習開始])
    
    Basics["📚 基本編"]
    
    Runes["⚡ Runesシステム"]
    
    Advanced["🏗️ 実践編"]

    Architecture["🏛️ アーキテクチャ編"]
    
    Choice["次のステップ"]
    SvelteKit[🎯 SvelteKit学習へ]
    Project[📱 実プロジェクト開発]
    
    Start --> Basics
    Basics --> Runes
    Runes --> Advanced
    Advanced --> Architecture
    Architecture --> Choice
    Choice -->|フルスタック開発| SvelteKit
    Choice -->|プロジェクト実践| Project
    
    style Start fill:#4CAF50,color:#fff
    style Basics fill:#2196F3,color:#fff
    style Runes fill:#FF9800,color:#fff
    style Advanced fill:#9C27B0,color:#fff
    style Architecture fill:#009688,color:#fff
    style SvelteKit fill:#FF5722,color:#fff
    style Project fill:#795548,color:#fff
    style Choice fill:#FFF,stroke:#333`;

</script>

Svelteは、**コンパイル時に最適化された Vanilla JavaScriptを生成する**革新的なUIフレームワークです。Virtual DOMを使わず、直接DOMを操作する効率的なコードを生成することで、React、Vue、Angularを凌駕するパフォーマンスと開発者体験を実現します。

## なぜSvelteが選ばれるのか

<div class="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
  <div class="content-card p-6">
    <div class="text-3xl mb-3">⚡</div>
    <h3 class="font-bold text-xl mb-3">パフォーマンスの革新</h3>
    <ul class="space-y-2 text-sm">
      <li><strong class="text-slate-500">ランタイムなし:</strong> ~5KB（React: ~45KB、Vue: ~34KB）</li>
      <li><strong class="text-slate-500">Virtual DOMなし:</strong> 直接DOM操作で高速レンダリング</li>
      <li><strong class="text-slate-500">最小バンドル:</strong> コンパイル時の不要コード除去</li>
    </ul>
  </div>
  <div class="content-card p-6">
    <div class="text-3xl mb-3">💻</div>
    <h3 class="font-bold text-xl mb-3">開発者体験の向上</h3>
    <ul class="space-y-2 text-sm">
      <li><strong class="text-slate-500">シンプルな構文:</strong> HTMLに近い直感的な記述</li>
      <li><strong class="text-slate-500">真のリアクティビティ:</strong> Runesシステムによる宣言的な状態管理</li>
      <li><strong class="text-slate-500">TypeScript完全対応:</strong> 型安全な開発が可能</li>
    </ul>
  </div>
  <div class="content-card p-6">
    <div class="text-3xl mb-3">📚</div>
    <h3 class="font-bold text-xl mb-3">学習コストの低さ</h3>
    <ul class="space-y-2 text-sm">
      <li><strong class="text-slate-500">標準的なWeb技術:</strong> HTML、CSS、JavaScriptの知識で開始可能</li>
      <li><strong class="text-slate-500">少ない概念:</strong> 覚えることが最小限</li>
      <li><strong class="text-slate-500">段階的な学習:</strong> 基本から高度な機能まで順次習得</li>
    </ul>
  </div>
</div>

## 学習ロードマップ

<Mermaid diagram={learningFlow} />

### 推奨学習順序

1. **基本編** - Svelteの基本概念とコンポーネント開発
2. **Runesシステム** - Svelte 5の革新的なリアクティビティシステム
3. **実践編** - 実際のアプリケーション開発テクニック
4. **アーキテクチャ編** - SPA/BaaS/既存システム統合/デスクトップ・モバイル展開の選定
5. **次のステップ**
   - **フルスタック開発** → [SvelteKit学習へ]({base}/sveltekit/)
   - **プロジェクト実践** → 実プロジェクトでの開発

## 学習コンテンツ

<div class="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
  <!-- 基本編カード -->
  <div class="content-card p-6">
    <div class="flex items-center gap-3 mb-4">
      <span class="text-3xl">📚</span>
      <h3 class="font-bold text-xl">基本編 - Svelteの基礎を理解</h3>
    </div>
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="border-b border-gray-2 dark:border-gray-7">
          <tr>
            <th class="text-left py-2">ページ</th>
            <th class="text-left py-2">内容</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-1 dark:divide-gray-8">
          <tr>
            <td class="py-2"><a href="{base}/svelte/basics/" class="text-blue-600 dark:text-blue-400 hover:underline">Svelteの基本概要</a></td>
            <td class="py-2 text-gray-6 dark:text-gray-4">フレームワークの基本概念</td>
          </tr>
          <tr>
            <td class="py-2"><a href="{base}/svelte/basics/component-basics/" class="text-blue-600 dark:text-blue-400 hover:underline">コンポーネントの基本</a></td>
            <td class="py-2 text-gray-6 dark:text-gray-4">script、markup、styleの3要素</td>
          </tr>
          <tr>
            <td class="py-2"><a href="{base}/svelte/basics/template-syntax/" class="text-blue-600 dark:text-blue-400 hover:underline">テンプレート構文</a></td>
            <td class="py-2 text-gray-6 dark:text-gray-4">条件分岐、ループ、イベント</td>
          </tr>
          <tr>
            <td class="py-2"><a href="{base}/svelte/basics/special-elements/" class="text-blue-600 dark:text-blue-400 hover:underline">特別な要素</a></td>
            <td class="py-2 text-gray-6 dark:text-gray-4">svelte:プレフィックス要素</td>
          </tr>
          <tr>
            <td class="py-2"><a href="{base}/svelte/basics/component-lifecycle/" class="text-blue-600 dark:text-blue-400 hover:underline">コンポーネントライフサイクル</a></td>
            <td class="py-2 text-gray-6 dark:text-gray-4">onMount、onDestroy、tick</td>
          </tr>
          <tr>
            <td class="py-2"><a href="{base}/svelte/basics/actions/" class="text-blue-600 dark:text-blue-400 hover:underline">use:アクション</a></td>
            <td class="py-2 text-gray-6 dark:text-gray-4">DOM要素の直接操作</td>
          </tr>
          <tr>
            <td class="py-2"><a href="{base}/svelte/basics/attachments/" class="text-blue-600 dark:text-blue-400 hover:underline">&#123;@attach&#125; アタッチメント</a></td>
            <td class="py-2 text-gray-6 dark:text-gray-4">Svelte 5のDOM連携新API</td>
          </tr>
          <tr>
            <td class="py-2"><a href="{base}/svelte/basics/transitions/" class="text-blue-600 dark:text-blue-400 hover:underline">トランジション・アニメーション</a></td>
            <td class="py-2 text-gray-6 dark:text-gray-4">要素の出入りアニメーション</td>
          </tr>
          <tr>
            <td class="py-2"><a href="{base}/svelte/basics/motion/" class="text-blue-600 dark:text-blue-400 hover:underline">svelte/motion</a></td>
            <td class="py-2 text-gray-6 dark:text-gray-4">Tween/Springで数値を滑らかに</td>
          </tr>
          <tr>
            <td class="py-2"><a href="{base}/svelte/basics/easing/" class="text-blue-600 dark:text-blue-400 hover:underline">svelte/easing</a></td>
            <td class="py-2 text-gray-6 dark:text-gray-4">イージング関数のカタログ</td>
          </tr>
          <tr>
            <td class="py-2"><a href="{base}/svelte/basics/events-module/" class="text-blue-600 dark:text-blue-400 hover:underline">svelte/events</a></td>
            <td class="py-2 text-gray-6 dark:text-gray-4">型安全なイベントハンドリング</td>
          </tr>
          <tr>
            <td class="py-2"><a href="{base}/svelte/basics/typescript-integration/" class="text-blue-600 dark:text-blue-400 hover:underline">TypeScript統合</a></td>
            <td class="py-2 text-gray-6 dark:text-gray-4">型安全な開発</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="mt-4 pt-4 border-t border-gray-2 dark:border-gray-7">
      <a href="{base}/svelte/basics/" class="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
        すべて見る <span class="text-xs">→</span>
      </a>
    </div>
  </div>

  <!-- Runesシステムカード -->
  <div class="content-card p-6">
    <div class="flex items-center gap-3 mb-4">
      <span class="text-3xl">⚡</span>
      <h3 class="font-bold text-xl">Runesシステム - Svelte 5の革新</h3>
    </div>
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="border-b border-gray-2 dark:border-gray-7">
          <tr>
            <th class="text-left py-2">ページ</th>
            <th class="text-left py-2">内容</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-1 dark:divide-gray-8">
          <tr>
            <td class="py-2"><a href="{base}/svelte/runes/" class="text-slate-600 dark:text-slate-300 hover:underline">Runesシステム概要</a></td>
            <td class="py-2 text-gray-6 dark:text-gray-4">Svelte 5の新しいリアクティビティ</td>
          </tr>
          <tr>
            <td class="py-2"><a href="{base}/svelte/runes/runes-introduction/" class="text-slate-600 dark:text-slate-300 hover:underline">Runesシステム入門</a></td>
            <td class="py-2 text-gray-6 dark:text-gray-4">基本的な使い方</td>
          </tr>
          <tr>
            <td class="py-2"><a href="{base}/svelte/runes/state/" class="text-slate-600 dark:text-slate-300 hover:underline">$state - リアクティブな状態</a></td>
            <td class="py-2 text-gray-6 dark:text-gray-4">状態管理の基本</td>
          </tr>
          <tr>
            <td class="py-2"><a href="{base}/svelte/runes/derived/" class="text-slate-600 dark:text-slate-300 hover:underline">$derived - 派生値</a></td>
            <td class="py-2 text-gray-6 dark:text-gray-4">計算プロパティ</td>
          </tr>
          <tr>
            <td class="py-2"><a href="{base}/svelte/runes/effect/" class="text-slate-600 dark:text-slate-300 hover:underline">$effect - 副作用</a></td>
            <td class="py-2 text-gray-6 dark:text-gray-4">副作用の実行</td>
          </tr>
          <tr>
            <td class="py-2"><a href="{base}/svelte/runes/props/" class="text-slate-600 dark:text-slate-300 hover:underline">$props - プロパティ</a></td>
            <td class="py-2 text-gray-6 dark:text-gray-4">コンポーネント間通信</td>
          </tr>
          <tr>
            <td class="py-2"><a href="{base}/svelte/runes/bindable/" class="text-slate-600 dark:text-slate-300 hover:underline">$bindable - 双方向バインディング</a></td>
            <td class="py-2 text-gray-6 dark:text-gray-4">双方向データフロー</td>
          </tr>
          <tr>
            <td class="py-2"><a href="{base}/svelte/runes/host/" class="text-slate-600 dark:text-slate-300 hover:underline">$host - カスタムエレメント</a></td>
            <td class="py-2 text-gray-6 dark:text-gray-4">Web Components対応</td>
          </tr>
          <tr>
            <td class="py-2"><a href="{base}/svelte/runes/inspect/" class="text-slate-600 dark:text-slate-300 hover:underline">$inspect - デバッグ</a></td>
            <td class="py-2 text-gray-6 dark:text-gray-4">開発時のデバッグ</td>
          </tr>
          <tr>
            <td class="py-2"><a href="{base}/svelte/runes/comparison/" class="text-slate-600 dark:text-slate-300 hover:underline">他フレームワークとの比較</a></td>
            <td class="py-2 text-gray-6 dark:text-gray-4">React、Vue、Angularとの違い</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="mt-4 pt-4 border-t border-gray-2 dark:border-gray-7">
      <a href="{base}/svelte/runes/" class="text-sm font-medium text-slate-600 dark:text-slate-300 hover:underline flex items-center gap-1">
        すべて見る <span class="text-xs">→</span>
      </a>
    </div>
  </div>

  <!-- 実践編カード -->
  <div class="content-card p-6">
    <div class="flex items-center gap-3 mb-4">
      <span class="text-3xl">🏗️</span>
      <h3 class="font-bold text-xl">実践編 - 高度な機能と実装パターン</h3>
    </div>
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="border-b border-gray-2 dark:border-gray-7">
          <tr>
            <th class="text-left py-2">ページ</th>
            <th class="text-left py-2">内容</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-1 dark:divide-gray-8">
          <tr>
            <td class="py-2"><a href="{base}/svelte/advanced/" class="text-purple-600 dark:text-purple-400 hover:underline">実践概要</a></td>
            <td class="py-2 text-gray-6 dark:text-gray-4">高度な機能の概要</td>
          </tr>
          <tr>
            <td class="py-2"><a href="{base}/svelte/advanced/reactive-stores/" class="text-purple-600 dark:text-purple-400 hover:underline">リアクティブストア</a></td>
            <td class="py-2 text-gray-6 dark:text-gray-4">.svelte.js/.svelte.tsファイル</td>
          </tr>
          <tr>
            <td class="py-2"><a href="{base}/svelte/advanced/class-reactivity/" class="text-purple-600 dark:text-purple-400 hover:underline">クラスとリアクティビティ</a></td>
            <td class="py-2 text-gray-6 dark:text-gray-4">OOPとリアクティビティ</td>
          </tr>
          <tr>
            <td class="py-2"><a href="{base}/svelte/advanced/built-in-classes/" class="text-purple-600 dark:text-purple-400 hover:underline">組み込みリアクティブクラス</a></td>
            <td class="py-2 text-gray-6 dark:text-gray-4">SvelteDate、SvelteURLなど</td>
          </tr>
          <tr>
            <td class="py-2"><a href="{base}/svelte/advanced/snippets/" class="text-purple-600 dark:text-purple-400 hover:underline">Snippets機能</a></td>
            <td class="py-2 text-gray-6 dark:text-gray-4">再利用可能なテンプレート</td>
          </tr>
          <tr>
            <td class="py-2"><a href="{base}/svelte/advanced/script-context/" class="text-purple-600 dark:text-purple-400 hover:underline">スクリプトコンテキスト</a></td>
            <td class="py-2 text-gray-6 dark:text-gray-4">module contextの活用</td>
          </tr>
          <tr>
            <td class="py-2"><a href="{base}/svelte/advanced/component-patterns/" class="text-purple-600 dark:text-purple-400 hover:underline">コンポーネントパターン</a></td>
            <td class="py-2 text-gray-6 dark:text-gray-4">実践的な設計パターン</td>
          </tr>
          <tr>
            <td class="py-2"><a href="{base}/svelte/advanced/typescript-patterns/" class="text-purple-600 dark:text-purple-400 hover:underline">TypeScriptパターン</a></td>
            <td class="py-2 text-gray-6 dark:text-gray-4">型安全な実装パターン</td>
          </tr>
          <tr>
            <td class="py-2"><a href="{base}/svelte/advanced/hydratable/" class="text-purple-600 dark:text-purple-400 hover:underline">hydratable</a></td>
            <td class="py-2 text-gray-6 dark:text-gray-4">SSRデータをクライアントで再利用</td>
          </tr>
          <tr>
            <td class="py-2"><a href="{base}/svelte/advanced/await-expressions/" class="text-purple-600 dark:text-purple-400 hover:underline">await expressions <span class="text-xs opacity-70">（実験的）</span></a></td>
            <td class="py-2 text-gray-6 dark:text-gray-4">テンプレート/モジュールトップレベルでawait</td>
          </tr>
          <tr>
            <td class="py-2"><a href="{base}/svelte/advanced/reactivity-window/" class="text-purple-600 dark:text-purple-400 hover:underline">svelte/reactivity/window</a></td>
            <td class="py-2 text-gray-6 dark:text-gray-4">スクロール・サイズ等をリアクティブに</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="mt-4 pt-4 border-t border-gray-2 dark:border-gray-7">
      <a href="{base}/svelte/advanced/" class="text-sm font-medium text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1">
        すべて見る <span class="text-xs">→</span>
      </a>
    </div>
  </div>

  <!-- アーキテクチャ編カード -->
  <div class="content-card p-6">
    <div class="flex items-center gap-3 mb-4">
      <span class="text-3xl">🏛️</span>
      <h3 class="font-bold text-xl">アーキテクチャ編 - 構成パターンと既存システム統合</h3>
    </div>
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="border-b border-gray-2 dark:border-gray-7">
          <tr>
            <th class="text-left py-2">ページ</th>
            <th class="text-left py-2">内容</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-1 dark:divide-gray-8">
          <tr>
            <td class="py-2"><a href="{base}/svelte/architecture/" class="text-emerald-600 dark:text-emerald-400 hover:underline">アーキテクチャ概要</a></td>
            <td class="py-2 text-gray-6 dark:text-gray-4">構成パターンの俯瞰と選択指針</td>
          </tr>
          <tr>
            <td class="py-2"><a href="{base}/svelte/architecture/spa-patterns/" class="text-emerald-600 dark:text-emerald-400 hover:underline">SPA + API構成</a></td>
            <td class="py-2 text-gray-6 dark:text-gray-4">バックエンド分離型の全体像</td>
          </tr>
          <tr>
            <td class="py-2"><a href="{base}/svelte/architecture/spa-patterns/firebase/" class="text-emerald-600 dark:text-emerald-400 hover:underline">Firebase統合</a></td>
            <td class="py-2 text-gray-6 dark:text-gray-4">BaaSでの認証・Firestore・Storage</td>
          </tr>
          <tr>
            <td class="py-2"><a href="{base}/svelte/architecture/spa-patterns/supabase/" class="text-emerald-600 dark:text-emerald-400 hover:underline">Supabase統合</a></td>
            <td class="py-2 text-gray-6 dark:text-gray-4">PostgreSQLベースのBaaS連携</td>
          </tr>
          <tr>
            <td class="py-2"><a href="{base}/svelte/architecture/spa-patterns/graphql/" class="text-emerald-600 dark:text-emerald-400 hover:underline">GraphQL統合</a></td>
            <td class="py-2 text-gray-6 dark:text-gray-4">Apollo / urql / houdini との連携</td>
          </tr>
          <tr>
            <td class="py-2"><a href="{base}/svelte/architecture/hybrid-integration/" class="text-emerald-600 dark:text-emerald-400 hover:underline">既存システム統合 <span class="text-xs opacity-70">（準備中）</span></a></td>
            <td class="py-2 text-gray-6 dark:text-gray-4">Rails/Laravel/Djangoへの段階的導入</td>
          </tr>
          <tr>
            <td class="py-2"><a href="{base}/svelte/architecture/desktop-mobile/" class="text-emerald-600 dark:text-emerald-400 hover:underline">デスクトップ・モバイル</a></td>
            <td class="py-2 text-gray-6 dark:text-gray-4">Tauri / Electron / Capacitor</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="mt-4 pt-4 border-t border-gray-2 dark:border-gray-7">
      <a href="{base}/svelte/architecture/" class="text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1">
        すべて見る <span class="text-xs">→</span>
      </a>
    </div>
  </div>
</div>

## 学習の始め方

### Step 1: 基礎を固める
まず[Svelteの基本概要]({base}/svelte/basics/)で基本概念を理解し、[コンポーネントの基本]({base}/svelte/basics/component-basics/)で実際にコンポーネントを作成します。

### Step 2: Runesシステムをマスター
Svelte 5の核心である[Runesシステム]({base}/svelte/runes/)を学び、モダンなリアクティビティを習得します。

### Step 3: 実践的な実装
[実践編]({base}/svelte/advanced/)で、プロダクションレベルのアプリケーション開発に必要な高度な機能を学びます。

### Step 4: アーキテクチャ選定
[アーキテクチャ編]({base}/svelte/architecture/)で、SPA+APIやBaaS、既存システム統合、デスクトップ・モバイル展開など、プロジェクトに応じた構成パターンを選定できるようにします。

## 推奨開発環境

<div class="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
  <div class="content-card p-6">
    <div class="text-3xl mb-3">⚙️</div>
    <h3 class="font-bold text-lg mb-3">必須ツール</h3>
    <ul class="space-y-2 text-sm">
      <li class="flex items-start">
        <span class="font-semibold text-slate-500 mr-2">Node.js:</span>
        <span class="text-gray-6 dark:text-gray-4">20.x LTS以上</span>
      </li>
      <li class="flex items-start">
        <span class="font-semibold text-slate-500 mr-2">TypeScript:</span>
        <span class="text-gray-6 dark:text-gray-4">5.x以上</span>
      </li>
      <li class="flex items-start">
        <span class="font-semibold text-slate-500 mr-2">VS Code:</span>
        <span class="text-gray-6 dark:text-gray-4">推奨エディタ</span>
      </li>
    </ul>
  </div>

  <div class="content-card p-6">
    <div class="text-3xl mb-3">🔌</div>
    <h3 class="font-bold text-lg mb-3">推奨拡張機能</h3>
    <ul class="space-y-2 text-sm text-gray-6 dark:text-gray-4">
      <li>Svelte for VS Code</li>
      <li>Prettier - Code formatter</li>
      <li>ESLint</li>
      <li>TypeScript Vue Plugin</li>
      <li>Tailwind CSS IntelliSense</li>
    </ul>
  </div>

  <div class="content-card p-6">
    <div class="text-3xl mb-3">🚀</div>
    <h3 class="font-bold text-lg mb-3">プロジェクト作成</h3>
    <div class="bg-gray-1 dark:bg-gray-8 rounded p-3 text-xs">
      <code class="text-slate-500">
        # SvelteKit想定（推奨）<br/>
        npx sv create my-app<br/>
        cd my-app &amp;&amp; npm install &amp;&amp; npm run dev<br/>
        <br/>
        # Svelte単体（Vite直接）<br/>
        npm create vite@latest my-app -- --template svelte-ts
      </code>
    </div>
  </div>
</div>

## 他フレームワークとの比較

| 特徴 | Svelte 5 | React 19 | Vue 3 | Angular 19 |
|-----|----------|----------|-------|------------|
| **バンドルサイズ（概算）** | ~5KB | ~50KB | ~34KB | ~130KB |
| **Virtual DOM** | ❌ なし | ✅ あり | ✅ あり | ❌ なし（Signals採用） |
| **コンパイル** | ✅ ビルド時 | ❌ ランタイム中心 | 🔶 ハイブリッド | ✅ ビルド時 |
| **学習曲線** | 低い | 中程度 | 低い | 高い |
| **TypeScript** | ✅ 完全対応 | ✅ 完全対応 | ✅ 完全対応 | ✅ 完全対応 |
| **リアクティビティ** | Runes | Hooks | Composition API | Signals |

<Admonition type="note" title="バンドルサイズについて">

数値はランタイム／フレームワークコアのみの概算で、実アプリではアダプタやライブラリで前後します。Svelte 5 は「ランタイムほぼゼロ」ではなくなりましたが、Virtual DOM を持たない点は変わらず、他フレームワークより小さい傾向は継続しています。

</Admonition>

## 📖 関連リソース

<div class="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
  <div class="content-card p-6">
    <div class="text-3xl mb-3">📚</div>
    <h3 class="font-bold text-lg mb-3">公式ドキュメント</h3>
    <ul class="space-y-2 text-sm">
      <li>
        <a href="https://svelte.dev" class="text-slate-500 hover:text-slate-600 dark:hover:text-slate-300">
          Svelte公式サイト →
        </a>
      </li>
      <li>
        <a href="https://svelte.dev/docs" class="text-slate-500 hover:text-slate-600 dark:hover:text-slate-300">
          Svelte 5 ドキュメント →
        </a>
      </li>
      <li>
        <a href="https://learn.svelte.dev" class="text-slate-500 hover:text-slate-600 dark:hover:text-slate-300">
          インタラクティブチュートリアル →
        </a>
      </li>
    </ul>
  </div>

  <div class="content-card p-6">
    <div class="text-3xl mb-3">👥</div>
    <h3 class="font-bold text-lg mb-3">コミュニティ</h3>
    <ul class="space-y-2 text-sm">
      <li>
        <a href="https://discord.gg/svelte" class="text-slate-500 hover:text-slate-600 dark:hover:text-slate-300">
          Discord サーバー →
        </a>
      </li>
      <li>
        <a href="https://github.com/sveltejs/svelte" class="text-slate-500 hover:text-slate-600 dark:hover:text-slate-300">
          GitHub リポジトリ →
        </a>
      </li>
      <li>
        <a href="https://www.reddit.com/r/sveltejs/" class="text-slate-500 hover:text-slate-600 dark:hover:text-slate-300">
          Reddit コミュニティ →
        </a>
      </li>
    </ul>
  </div>
</div>

## 実際のプロジェクト例

### 企業での採用事例
- **The New York Times**: インタラクティブなデータビジュアライゼーション
- **Apple**: Spotlightでのドキュメント検索
- **1Password**: ブラウザ拡張機能
- **Spotify**: 音楽プレイヤーのUIコンポーネント

### 学習プロジェクト例

#### 1. TODOアプリ（初級）
```svelte
<script lang="ts">
  type Todo = { id: number; text: string; done: boolean };
  
  let todos = $state<Todo[]>([]);
  let newTodo = $state('');
  
  function addTodo() {
    if (newTodo.trim()) {
      todos.push({ 
        id: Date.now(), 
        text: newTodo, 
        done: false 
      });
      newTodo = '';
    }
  }
</script>
```

#### 2. リアルタイムチャット（中級）
- WebSocket通信
- リアクティブストア活用
- メッセージの永続化

#### 3. ダッシュボード（上級）
- データビジュアライゼーション
- コンポーネントの再利用
- パフォーマンス最適化

## ❓ よくある質問

<div class="space-y-4 my-8">
  <div class="content-card p-6">
    <h3 class="font-bold text-lg mb-3 flex items-center">
      <span class="text-2xl mr-2">Q:</span>
      ReactやVueから移行すべき？
    </h3>
    <p class="text-gray-7 dark:text-gray-3">
      A: プロジェクトの要件次第です。パフォーマンスとバンドルサイズが重要な場合、Svelteは優れた選択肢です。特に以下のケースでは移行を検討する価値があります。
    </p>
    <ul class="mt-2 space-y-1 text-sm text-gray-6 dark:text-gray-4">
      <li>バンドルサイズを最小限に抑えたい</li>
      <li>初期ロード時間を改善したい</li>
      <li>よりシンプルな開発体験を求めている</li>
    </ul>
  </div>

  <div class="content-card p-6">
    <h3 class="font-bold text-lg mb-3 flex items-center">
      <span class="text-2xl mr-2">Q:</span>
      学習期間はどのくらい？
    </h3>
    <p class="text-gray-7 dark:text-gray-3">
      A: 基本的な機能は<strong class="text-slate-500">1-2週間</strong>、Runesシステムまで含めて<strong class="text-slate-500">1ヶ月</strong>程度で習得可能です。
    </p>
    <div class="mt-3 space-y-2 text-sm">
      <div class="flex items-center">
        <span class="font-semibold text-slate-500 w-24">1週目:</span>
        <span class="text-gray-6 dark:text-gray-4">基本的なコンポーネント作成、テンプレート構文</span>
      </div>
      <div class="flex items-center">
        <span class="font-semibold text-slate-500 w-24">2週目:</span>
        <span class="text-gray-6 dark:text-gray-4">Runesシステム、リアクティビティの理解</span>
      </div>
      <div class="flex items-center">
        <span class="font-semibold text-slate-500 w-24">3-4週目:</span>
        <span class="text-gray-6 dark:text-gray-4">実践的なアプリケーション構築、最適化</span>
      </div>
    </div>
  </div>

  <div class="content-card p-6">
    <h3 class="font-bold text-lg mb-3 flex items-center">
      <span class="text-2xl mr-2">Q:</span>
      エコシステムは充実している？
    </h3>
    <p class="text-gray-7 dark:text-gray-3 mb-3">
      A: React/Vueほどではありませんが、主要なライブラリは揃っています。
    </p>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
      <div>
        <span class="font-semibold text-slate-500">UI:</span>
        <span class="text-gray-6 dark:text-gray-4 ml-2">Skeleton UI、Svelte Material UI</span>
      </div>
      <div>
        <span class="font-semibold text-slate-500">状態管理:</span>
        <span class="text-gray-6 dark:text-gray-4 ml-2">組み込みストア、Tanstack Query</span>
      </div>
      <div>
        <span class="font-semibold text-slate-500">フォーム:</span>
        <span class="text-gray-6 dark:text-gray-4 ml-2">Superforms、Felte</span>
      </div>
      <div>
        <span class="font-semibold text-slate-500">テスト:</span>
        <span class="text-gray-6 dark:text-gray-4 ml-2">Vitest、Testing Library</span>
      </div>
    </div>
  </div>

  <div class="content-card p-6">
    <h3 class="font-bold text-lg mb-3 flex items-center">
      <span class="text-2xl mr-2">Q:</span>
      どんなプロジェクトに向いている？
    </h3>
    <div class="space-y-3">
      A: 以下のようなプロジェクトに向いています。
      <div class="flex items-start">
        <span class="text-green-500 font-bold mr-2">✅</span>
        <div>
          <span class="font-semibold text-gray-8 dark:text-gray-2">最適：</span>
          <span class="text-gray-6 dark:text-gray-4 ml-1">SPAダッシュボード、インタラクティブなWebアプリ</span>
        </div>
      </div>
      <div class="flex items-start">
        <span class="text-green-500 font-bold mr-2">✅</span>
        <div>
          <span class="font-semibold text-gray-8 dark:text-gray-2">良い：</span>
          <span class="text-gray-6 dark:text-gray-4 ml-1">ブラウザ拡張機能、組み込みウィジェット</span>
        </div>
      </div>
      <div class="flex items-start">
        <span class="text-yellow-500 font-bold mr-2">⚠️</span>
        <div>
          <span class="font-semibold text-gray-8 dark:text-gray-2">要検討：</span>
          <span class="text-gray-6 dark:text-gray-4 ml-1">大規模エンタープライズ（エコシステムの成熟度）</span>
        </div>
      </div>
    </div>
  </div>
</div>

## 次のステップ

**完全初心者の方**:
[Svelteの基本概要]({base}/svelte/basics/)から始めて、基礎をしっかり学習

**他フレームワーク経験者**:
[Runesシステム概要]({base}/svelte/runes/)でSvelte 5の革新的な機能を理解

**すぐに実装したい方**:
[コンポーネントの基本]({base}/svelte/basics/component-basics/)で実践的な開発を開始

**フルスタック開発を目指す方**:
Svelteをマスター後、[SvelteKit完全ガイド]({base}/sveltekit/)へ進む

---

<Admonition type="tip" title="Svelte 5の特徴">

Svelte 5 は 2024 年 10 月に Stable リリースされ、以降も 5.x 系でアップデートが継続しています。Runes システム（`$state` / `$derived` / `$effect`）、アタッチメント（`{@attach}`）、`svelte:boundary`、ストリーミング対応など、従来の Svelte 4 以前とは大きく異なる API が導入されているため、**最新の文法で学習する**ことが重要です。Svelte 4 世代の `$:` 文や `export let`、`on:event`、`<slot />` はレガシー扱いになり、新規コードでは使いません。

</Admonition>
<Admonition type="info" title="Virtual DOMを使わない理由">

SvelteはVirtual DOMを使わず、コンパイル時に効率的なDOM操作コードを生成します。これにより、ランタイムのオーバーヘッドがなく、より高速で軽量なアプリケーションが実現できます。

</Admonition>
<Admonition type="note" title="TypeScript推奨">

このガイドは全てTypeScriptで記述されています。JavaScriptでも動作しますが、型安全性を活用することで、より堅牢なアプリケーション開発が可能になります。

</Admonition>