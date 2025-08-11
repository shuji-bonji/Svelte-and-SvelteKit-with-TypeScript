---
title: Svelteの基本
description: Svelteフレームワークの基礎概念とコンポーネント構造
---

<script>
  import { base } from '$app/paths';
</script>


まず、Svelteの基本的な概念とコンポーネントの仕組みを理解することが重要です。このセクションでは、Svelteの核となる機能と、コンポーネントベースの開発アプローチについて学びます。

## Svelteとは何か

Svelteは「コンパイラ」として動作するフロントエンドフレームワークです。ReactやVueのような他のフレームワークとは異なり、ランタイムライブラリを必要とせず、ビルド時にコンポーネントを効率的なVanilla JavaScriptに変換します。

### 主な特徴

1. **ビルド時の最適化** - コンパイル時に最適化されたコードを生成
2. **リアクティビティ** - データの変更を自動的にUIに反映
3. **コンポーネントベース** - 再利用可能なコンポーネントで構築
4. **軽量** - 小さなバンドルサイズで高速な実行
5. **シンプルな構文** - HTMLに近い直感的な記法

## このセクションで学ぶこと

<div class="grid grid-cols-1 md:grid-cols-2 gap-4 my-8 auto-rows-[1fr]">
  <a href="{base}/svelte-basics/hello-world/" class="flex no-underline group h-full">
    <div class="p-4 border border-gray-2 dark:border-gray-7 rounded-lg shadow-md hover:shadow-lg hover:border-pink-400 dark:hover:border-pink-400 transition-all cursor-pointer flex flex-col w-full">
      <div class="text-3xl mb-2">👋</div>
      <h3 class="font-bold text-lg mb-2 text-pink-600 dark:text-pink-400 group-hover:text-pink-700 dark:group-hover:text-pink-300 transition-colors">
        Hello World
        <span class="inline-block ml-1 text-xs opacity-60">→</span>
      </h3>
      <p class="text-sm mb-3 text-gray-7 dark:text-gray-3">最初のSvelteコンポーネントを作成し、基本的な構造を理解します。</p>
      <ul class="text-sm text-gray-6 dark:text-gray-4 space-y-1 flex-grow">
        <li>動的な値の表示</li>
        <li>JavaScript式の埋め込み</li>
        <li>HTMLの直接出力（`@html`）</li>
        <li>デバッグ機能（`@debug`）</li>
      </ul>
    </div>
  </a>
  
  <a href="{base}/svelte-basics/component-basics/" class="flex no-underline group h-full">
    <div class="p-4 border border-gray-2 dark:border-gray-7 rounded-lg shadow-md hover:shadow-lg hover:border-pink-400 dark:hover:border-pink-400 transition-all cursor-pointer flex flex-col w-full">
      <div class="text-3xl mb-2">🧩</div>
      <h3 class="font-bold text-lg mb-2 text-pink-600 dark:text-pink-400 group-hover:text-pink-700 dark:group-hover:text-pink-300 transition-colors">
        コンポーネントの基本
        <span class="inline-block ml-1 text-xs opacity-60">→</span>
      </h3>
      <p class="text-sm mb-3 text-gray-7 dark:text-gray-3">Svelteコンポーネントの核となる機能をすべて学びます。</p>
      <ul class="text-sm text-gray-6 dark:text-gray-4 space-y-1 flex-grow">
        <li><strong>3つの主要部分</strong>: script、markup、style</li>
        <li><strong>テンプレート構文</strong>: 条件分岐、ループ、非同期処理</li>
        <li><strong>イベント処理</strong>: DOMイベント、修飾子</li>
        <li><strong>プロパティ</strong>: 親子間のデータ受け渡し</li>
        <li><strong>双方向バインディング</strong>: フォーム連携</li>
        <li><strong>スタイリング</strong>: スコープ付きCSS</li>
      </ul>
    </div>
  </a>
  
  <a href="{base}/svelte-basics/typescript-integration/" class="flex no-underline group h-full">
    <div class="p-4 border border-gray-2 dark:border-gray-7 rounded-lg shadow-md hover:shadow-lg hover:border-pink-400 dark:hover:border-pink-400 transition-all cursor-pointer flex flex-col w-full">
      <div class="text-3xl mb-2">📘</div>
      <h3 class="font-bold text-lg mb-2 text-pink-600 dark:text-pink-400 group-hover:text-pink-700 dark:group-hover:text-pink-300 transition-colors">
        TypeScript統合
        <span class="inline-block ml-1 text-xs opacity-60">→</span>
      </h3>
      <p class="text-sm mb-3 text-gray-7 dark:text-gray-3">SvelteでTypeScriptを効果的に使用する方法を学びます。</p>
      <ul class="text-sm text-gray-6 dark:text-gray-4 space-y-1 flex-grow">
        <li>Propsの型定義</li>
        <li>イベントの型定義</li>
        <li>ジェネリック型の使用</li>
        <li>型ガードと型の絞り込み</li>
        <li>ストアとコンテキストAPIの型定義</li>
      </ul>
    </div>
  </a>
  
  <a href="{base}/svelte-basics/script-context/" class="flex no-underline group h-full">
    <div class="p-4 border border-gray-2 dark:border-gray-7 rounded-lg shadow-md hover:shadow-lg hover:border-pink-400 dark:hover:border-pink-400 transition-all cursor-pointer flex flex-col w-full">
      <div class="text-3xl mb-2">📦</div>
      <h3 class="font-bold text-lg mb-2 text-pink-600 dark:text-pink-400 group-hover:text-pink-700 dark:group-hover:text-pink-300 transition-colors">
        スクリプトコンテキスト
        <span class="inline-block ml-1 text-xs opacity-60">→</span>
      </h3>
      <p class="text-sm mb-3 text-gray-7 dark:text-gray-3">`&lt;script&gt;`と`&lt;script context="module"&gt;`の違いと使い分けを理解します。</p>
      <ul class="text-sm text-gray-6 dark:text-gray-4 space-y-1 flex-grow">
        <li>モジュールレベルのコード実行</li>
        <li>静的な値の共有</li>
        <li>シングルトンパターンの実装</li>
        <li>エクスポート可能な関数と値</li>
      </ul>
    </div>
  </a>
</div>

## 学習の進め方

各トピックは実践的なコード例と共に説明されています。以下の順序で学習を進めることをお勧めします。

1. **概念の理解** - 各機能の目的と使用場面を理解
2. **コード例の実践** - 実際にコードを書いて動作を確認
3. **TypeScriptへの移行** - JavaScriptからTypeScriptへの書き換え
4. **応用** - 学んだ知識を組み合わせて実際のコンポーネントを作成

## 前提知識

このセクションを始める前に、以下の知識があることを前提としています。

- HTML/CSS の基本的な知識
- JavaScript（ES6+）の基本的な構文
- TypeScriptの基本的な型定義（推奨）
- Node.jsとnpmの基本的な使い方

## 次のステップ

準備ができたら、[Hello World](/svelte-basics/hello-world/)から始めましょう。Svelteの世界への第一歩を踏み出します。