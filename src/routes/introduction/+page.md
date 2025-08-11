---
title: はじめに
description: Svelte 5とSvelteKitによる最新のWeb開発
---

<script>
  import { base } from '$app/paths';
</script>

Svelte 5とSvelteKitの世界へようこそ！このセクションでは、最新のWeb開発フレームワークであるSvelteの概要と、なぜ多くの開発者がSvelteを選ぶのかを理解します。

## Svelte 5とは

Svelteは「コンパイラ」として動作する革新的なフロントエンドフレームワークです。React やVueのような従来のフレームワークとは異なり、ランタイムライブラリを必要とせず、ビルド時にコンポーネントを効率的なVanilla JavaScriptに変換します。

### 革新的な特徴

1. **コンパイラベース** - ビルド時に最適化されたコードを生成
2. **Virtual DOM不使用** - 直接DOMを操作する効率的なコード
3. **Runesシステム** - 明示的で予測可能なリアクティビティ
4. **TypeScript完全対応** - 型安全な開発が標準
5. **軽量・高速** - 最小限のバンドルサイズで最高のパフォーマンス

## このセクションで学ぶこと

<div class="grid grid-cols-1 md:grid-cols-2 gap-4 my-8 auto-rows-[1fr]">
  <a href="{base}/introduction/why-svelte/" class="flex no-underline group h-full">
    <div class="p-4 border border-gray-2 dark:border-gray-7 rounded-lg shadow-md hover:shadow-lg hover:border-pink-400 dark:hover:border-pink-400 transition-all cursor-pointer flex flex-col w-full">
      <div class="text-3xl mb-2">🚀</div>
      <h3 class="font-bold text-lg mb-2 text-pink-600 dark:text-pink-400 group-hover:text-pink-700 dark:group-hover:text-pink-300 transition-colors">
        なぜSvelteか
        <span class="inline-block ml-1 text-xs opacity-60">→</span>
      </h3>
      <p class="text-sm mb-3 text-gray-7 dark:text-gray-3">Svelteが他のフレームワークと比較してどのような利点があるかを詳しく解説します。</p>
      <ul class="text-sm text-gray-6 dark:text-gray-4 space-y-1 flex-grow">
        <li>コンパイル時最適化の仕組み</li>
        <li>Virtual DOMを使わない理由</li>
        <li>パフォーマンスの実測値比較</li>
        <li>実世界での成功事例</li>
      </ul>
    </div>
  </a>
  
  <a href="{base}/introduction/setup/" class="flex no-underline group h-full">
    <div class="p-4 border border-gray-2 dark:border-gray-7 rounded-lg shadow-md hover:shadow-lg hover:border-pink-400 dark:hover:border-pink-400 transition-all cursor-pointer flex flex-col w-full">
      <div class="text-3xl mb-2">🛠️</div>
      <h3 class="font-bold text-lg mb-2 text-pink-600 dark:text-pink-400 group-hover:text-pink-700 dark:group-hover:text-pink-300 transition-colors">
        環境構築
        <span class="inline-block ml-1 text-xs opacity-60">→</span>
      </h3>
      <p class="text-sm mb-3 text-gray-7 dark:text-gray-3">Svelte開発環境を最速でセットアップする方法を説明します。</p>
      <ul class="text-sm text-gray-6 dark:text-gray-4 space-y-1 flex-grow">
        <li>Node.jsとパッケージマネージャー</li>
        <li>SvelteKitプロジェクトの作成</li>
        <li>開発ツールの設定</li>
        <li>VS Code拡張機能</li>
      </ul>
    </div>
  </a>
  
  <a href="{base}/introduction/typescript-setup/" class="flex no-underline group h-full">
    <div class="p-4 border border-gray-2 dark:border-gray-7 rounded-lg shadow-md hover:shadow-lg hover:border-pink-400 dark:hover:border-pink-400 transition-all cursor-pointer flex flex-col w-full">
      <div class="text-3xl mb-2">📘</div>
      <h3 class="font-bold text-lg mb-2 text-pink-600 dark:text-pink-400 group-hover:text-pink-700 dark:group-hover:text-pink-300 transition-colors">
        TypeScript設定
        <span class="inline-block ml-1 text-xs opacity-60">→</span>
      </h3>
      <p class="text-sm mb-3 text-gray-7 dark:text-gray-3">SvelteプロジェクトでTypeScriptを最大限活用するための設定を解説します。</p>
      <ul class="text-sm text-gray-6 dark:text-gray-4 space-y-1 flex-grow">
        <li>tsconfig.jsonの詳細設定</li>
        <li>型定義ファイルの構成</li>
        <li>厳密な型チェック設定</li>
        <li>エディタ統合の最適化</li>
      </ul>
    </div>
  </a>
</div>

## 学習の進め方

このセクションは、Svelteを初めて学ぶ方向けの導入部分です。以下の順序で学習を進めることをお勧めします：

1. **なぜSvelteか** - Svelteの利点と他フレームワークとの違いを理解
2. **環境構築** - 開発環境を整えて実際に手を動かす準備
3. **TypeScript設定** - 型安全な開発のための環境を構築

## 前提知識

このガイドを始める前に、以下の知識があることを前提としています：

- HTML/CSS の基本的な知識
- JavaScript（ES6+）の基本的な構文
- コマンドラインの基本的な操作
- npm/pnpmなどのパッケージマネージャーの基本的な使い方

TypeScriptの経験があれば理想的ですが、必須ではありません。このガイドを通じてTypeScriptも学べるように構成されています。

## 次のステップ

準備ができたら、[なぜSvelteか](/introduction/why-svelte/)から始めましょう。Svelteがなぜ注目されているのか、その理由を詳しく見ていきます。