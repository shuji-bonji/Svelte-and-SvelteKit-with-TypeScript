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
  
  <a href="{base}/svelte-basics/template-syntax/" class="flex no-underline group h-full">
    <div class="p-4 border border-gray-2 dark:border-gray-7 rounded-lg shadow-md hover:shadow-lg hover:border-pink-400 dark:hover:border-pink-400 transition-all cursor-pointer flex flex-col w-full">
      <div class="text-3xl mb-2">🔤</div>
      <h3 class="font-bold text-lg mb-2 text-pink-600 dark:text-pink-400 group-hover:text-pink-700 dark:group-hover:text-pink-300 transition-colors">
        テンプレート構文
        <span class="inline-block ml-1 text-xs opacity-60">→</span>
      </h3>
      <p class="text-sm mb-3 text-gray-7 dark:text-gray-3">Svelteの特殊なテンプレートタグと構文を詳しく学びます。</p>
      <ul class="text-sm text-gray-6 dark:text-gray-4 space-y-1 flex-grow">
        <li><code>{`{@render}`}</code>: Snippetsのレンダリング</li>
        <li><code>{`{@html}`}</code>: HTML文字列の挿入</li>
        <li><code>{`{@const}`}</code>: ローカル定数の定義</li>
        <li><code>{`{#key}`}</code>: 強制的な再レンダリング</li>
        <li><code>{`{@debug}`}</code>: デバッグ情報の出力</li>
      </ul>
    </div>
  </a>
  
  <a href="{base}/svelte-basics/component-lifecycle/" class="flex no-underline group h-full">
    <div class="p-4 border border-gray-2 dark:border-gray-7 rounded-lg shadow-md hover:shadow-lg hover:border-pink-400 dark:hover:border-pink-400 transition-all cursor-pointer flex flex-col w-full">
      <div class="text-3xl mb-2">🔄</div>
      <h3 class="font-bold text-lg mb-2 text-pink-600 dark:text-pink-400 group-hover:text-pink-700 dark:group-hover:text-pink-300 transition-colors">
        コンポーネントライフサイクル
        <span class="inline-block ml-1 text-xs opacity-60">→</span>
      </h3>
      <p class="text-sm mb-3 text-gray-7 dark:text-gray-3">Svelte 5におけるコンポーネントのライフサイクル管理を学びます。</p>
      <ul class="text-sm text-gray-6 dark:text-gray-4 space-y-1 flex-grow">
        <li><strong>$effect</strong>: 新しいライフサイクル管理</li>
        <li><strong>$effect.pre</strong>: DOM構築前の処理</li>
        <li><strong>$effect.root</strong>: 独立したスコープ</li>
        <li><strong>従来のAPI</strong>: onMount, onDestroy</li>
        <li><strong>クリーンアップ</strong>: リソースの適切な管理</li>
      </ul>
    </div>
  </a>
  
  <a href="{base}/svelte-basics/actions/" class="flex no-underline group h-full">
    <div class="p-4 border border-gray-2 dark:border-gray-7 rounded-lg shadow-md hover:shadow-lg hover:border-pink-400 dark:hover:border-pink-400 transition-all cursor-pointer flex flex-col w-full">
      <div class="text-3xl mb-2">⚡</div>
      <h3 class="font-bold text-lg mb-2 text-pink-600 dark:text-pink-400 group-hover:text-pink-700 dark:group-hover:text-pink-300 transition-colors">
        use:アクション
        <span class="inline-block ml-1 text-xs opacity-60">→</span>
      </h3>
      <p class="text-sm mb-3 text-gray-7 dark:text-gray-3">DOM要素を直接操作する強力な機能を学びます。</p>
      <ul class="text-sm text-gray-6 dark:text-gray-4 space-y-1 flex-grow">
        <li>アクションの実行タイミング</li>
        <li>ライフサイクルフック</li>
        <li>外部ライブラリの統合</li>
        <li>カスタムディレクティブの作成</li>
        <li>イベントハンドラとの使い分け</li>
      </ul>
    </div>
  </a>
  
  <a href="{base}/svelte-basics/transitions/" class="flex no-underline group h-full">
    <div class="p-4 border border-gray-2 dark:border-gray-7 rounded-lg shadow-md hover:shadow-lg hover:border-pink-400 dark:hover:border-pink-400 transition-all cursor-pointer flex flex-col w-full">
      <div class="text-3xl mb-2">✨</div>
      <h3 class="font-bold text-lg mb-2 text-pink-600 dark:text-pink-400 group-hover:text-pink-700 dark:group-hover:text-pink-300 transition-colors">
        トランジション・アニメーション
        <span class="inline-block ml-1 text-xs opacity-60">→</span>
      </h3>
      <p class="text-sm mb-3 text-gray-7 dark:text-gray-3">美しいアニメーションを簡単に実装する方法を学びます。</p>
      <ul class="text-sm text-gray-6 dark:text-gray-4 space-y-1 flex-grow">
        <li><strong>transition:</strong> 入場・退場アニメーション</li>
        <li><strong>in:/out:</strong> 個別のトランジション</li>
        <li><strong>animate:</strong> FLIPアニメーション</li>
        <li><strong>style:</strong> 動的なスタイル適用</li>
        <li>カスタムトランジションの作成</li>
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

準備ができたら、[コンポーネントの基本](/svelte-basics/component-basics/)から始めましょう。Svelteコンポーネントの核となる機能を学びます。