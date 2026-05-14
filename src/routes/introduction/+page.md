---
title: はじめに
description: Svelte 5とSvelteKitの入門ガイド。コンパイラベースの仕組みとRunesリアクティビティの特徴、TypeScript前提の開発フロー、環境構築からHello World、学習パスと教材の選び方までを一気に把握できるスタートページ。初心者向けの導線付き。詳しい手順とチェックリスト付き。補足
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
  <a href="{base}/introduction/why-svelte/" class="flex no-underline group h-full not-prose" style="color: inherit;">
    <div class="section-card p-4 cursor-pointer flex flex-col w-full">
      <div class="text-3xl mb-2">🚀</div>
      <h3 class="font-bold text-lg mb-2" style="color: var(--color-card-title);">
        なぜSvelteか
        <span class="inline-block ml-1 text-xs opacity-60">→</span>
      </h3>
      <p class="text-sm mb-3" style="color: var(--color-card-desc);">Svelteが他のフレームワークと比較してどのような利点があるかを詳しく解説します。</p>
      <ul class="text-sm space-y-1 flex-grow list-disc pl-5" style="color: var(--color-card-list);">
        <li>コンパイル時最適化の仕組み</li>
        <li>Virtual DOMを使わない理由</li>
        <li>パフォーマンスの実測値比較</li>
        <li>実世界での成功事例</li>
      </ul>
    </div>
  </a>
  
  <a href="{base}/introduction/setup/" class="flex no-underline group h-full not-prose" style="color: inherit;">
    <div class="section-card p-4 cursor-pointer flex flex-col w-full">
      <div class="text-3xl mb-2">🛠️</div>
      <h3 class="font-bold text-lg mb-2" style="color: var(--color-card-title);">
        環境構築
        <span class="inline-block ml-1 text-xs opacity-60">→</span>
      </h3>
      <p class="text-sm mb-3" style="color: var(--color-card-desc);">Svelte開発環境を最速でセットアップする方法を説明します。</p>
      <ul class="text-sm space-y-1 flex-grow list-disc pl-5" style="color: var(--color-card-list);">
        <li>Node.jsとパッケージマネージャー</li>
        <li>SvelteKitプロジェクトの作成</li>
        <li>開発ツールの設定</li>
        <li>VS Code拡張機能</li>
      </ul>
    </div>
  </a>
  
  <a href="{base}/introduction/hello-world/" class="flex no-underline group h-full not-prose" style="color: inherit;">
    <div class="section-card p-4 cursor-pointer flex flex-col w-full">
      <div class="text-3xl mb-2">👋</div>
      <h3 class="font-bold text-lg mb-2" style="color: var(--color-card-title);">
        Hello World
        <span class="inline-block ml-1 text-xs opacity-60">→</span>
      </h3>
      <p class="text-sm mb-3" style="color: var(--color-card-desc);">最初のSvelteコンポーネントを作成し、基本的な構文を学びます。</p>
      <ul class="text-sm space-y-1 flex-grow list-disc pl-5" style="color: var(--color-card-list);">
        <li>Svelteコンポーネントの基本</li>
        <li>変数の表示と式の埋め込み</li>
        <li>従来の書き方とSvelte 5の比較</li>
        <li>$stateルーンの初歩</li>
      </ul>
    </div>
  </a>
  
  <a href="{base}/introduction/why-typescript/" class="flex no-underline group h-full not-prose" style="color: inherit;">
    <div class="section-card p-4 cursor-pointer flex flex-col w-full">
      <div class="text-3xl mb-2">🎯</div>
      <h3 class="font-bold text-lg mb-2" style="color: var(--color-card-title);">
        なぜTypeScriptが必要か
        <span class="inline-block ml-1 text-xs opacity-60">→</span>
      </h3>
      <p class="text-sm mb-3" style="color: var(--color-card-desc);">モダンなWeb開発におけるTypeScriptの重要性を理解します。</p>
      <ul class="text-sm space-y-1 flex-grow list-disc pl-5" style="color: var(--color-card-list);">
        <li>TypeScriptの利点</li>
        <li>開発時の安全性向上</li>
        <li>Svelte 5との相性</li>
        <li>他フレームワークとの比較</li>
      </ul>
    </div>
  </a>
  
  <a href="{base}/introduction/typescript-setup/" class="flex no-underline group h-full not-prose" style="color: inherit;">
    <div class="section-card p-4 cursor-pointer flex flex-col w-full">
      <div class="text-3xl mb-2">📘</div>
      <h3 class="font-bold text-lg mb-2" style="color: var(--color-card-title);">
        TypeScript設定
        <span class="inline-block ml-1 text-xs opacity-60">→</span>
      </h3>
      <p class="text-sm mb-3" style="color: var(--color-card-desc);">SvelteプロジェクトでTypeScriptを最大限活用するための設定を解説します。</p>
      <ul class="text-sm space-y-1 flex-grow list-disc pl-5" style="color: var(--color-card-list);">
        <li>tsconfig.jsonの詳細設定</li>
        <li>型定義ファイルの構成</li>
        <li>厳密な型チェック設定</li>
        <li>エディタ統合の最適化</li>
      </ul>
    </div>
  </a>

  <a href="{base}/introduction/cli/" class="flex no-underline group h-full not-prose" style="color: inherit;">
    <div class="section-card p-4 cursor-pointer flex flex-col w-full">
      <div class="text-3xl mb-2">⌨️</div>
      <h3 class="font-bold text-lg mb-2" style="color: var(--color-card-title);">
        CLI tools
        <span class="inline-block ml-1 text-xs opacity-60">→</span>
      </h3>
      <p class="text-sm mb-3" style="color: var(--color-card-desc);">公式 <code>sv</code> CLI でプロジェクトの作成・拡張・診断を行う方法を学びます。</p>
      <ul class="text-sm space-y-1 flex-grow list-disc pl-5" style="color: var(--color-card-list);">
        <li><code>npx sv create</code>: 新規プロジェクト</li>
        <li><code>sv add</code>: アドオンの追加</li>
        <li><code>sv check</code>: 型・構文チェック</li>
        <li><code>sv migrate</code>: 自動マイグレーション</li>
      </ul>
    </div>
  </a>

  <a href="{base}/introduction/eslint-prettier/" class="flex no-underline group h-full not-prose" style="color: inherit;">
    <div class="section-card p-4 cursor-pointer flex flex-col w-full">
      <div class="text-3xl mb-2">🧹</div>
      <h3 class="font-bold text-lg mb-2" style="color: var(--color-card-title);">
        ESLint / Prettier
        <span class="inline-block ml-1 text-xs opacity-60">→</span>
      </h3>
      <p class="text-sm mb-3" style="color: var(--color-card-desc);">flat config 時代の最新セットアップで Svelte プロジェクトを整えます。</p>
      <ul class="text-sm space-y-1 flex-grow list-disc pl-5" style="color: var(--color-card-list);">
        <li>ESLint flat config の構成</li>
        <li><code>eslint-plugin-svelte</code> の有効化</li>
        <li>Prettier と <code>prettier-plugin-svelte</code></li>
        <li>VS Code・CI との統合</li>
      </ul>
    </div>
  </a>

  <a href="{base}/introduction/ai-coding-setup/" class="flex no-underline group h-full not-prose" style="color: inherit;">
    <div class="section-card p-4 cursor-pointer flex flex-col w-full">
      <div class="text-3xl mb-2">🤖</div>
      <h3 class="font-bold text-lg mb-2" style="color: var(--color-card-title);">
        AI コーディング支援
        <span class="inline-block ml-1 text-xs opacity-60">→</span>
      </h3>
      <p class="text-sm mb-3" style="color: var(--color-card-desc);">Copilot / Cursor が <code>on:click</code> 等の古い構文を提案するのを防ぐ多層防御の設定。</p>
      <ul class="text-sm space-y-1 flex-grow list-disc pl-5" style="color: var(--color-card-list);">
        <li><code>.github/instructions/</code> による指示注入</li>
        <li><code>Chat: Configure Instructions</code> ユーザー設定</li>
        <li>コンパイラ警告のエラー昇格</li>
        <li>Cursor / Claude Code との比較</li>
      </ul>
    </div>
  </a>
</div>

## 学習の進め方

このセクションは、Svelteを初めて学ぶ方向けの導入部分です。以下の順序で学習を進めることをお勧めします。

1. **なぜSvelteか** - Svelteの利点と他フレームワークとの違いを理解
2. **環境構築** - 開発環境を整えて実際に手を動かす準備
3. **Hello World** - 最初のSvelteコンポーネントを作成
4. **なぜTypeScriptが必要か** - TypeScriptの重要性を理解
5. **TypeScript設定** - 型安全な開発のための環境を構築
6. **CLI tools** - `sv` コマンドで作成・拡張・診断・移行を効率化
7. **ESLint / Prettier** - flat config による静的解析とフォーマットを整備
8. **AI コーディング支援** - Copilot / Cursor を Svelte 5 純度で使うための多層防御
9. **次の一歩** - Svelte 編 / SvelteKit 編へ進む準備

## 前提知識

このガイドを始める前に、以下の知識があることを前提としています。

- HTML/CSS の基本的な知識
- JavaScript（ES6+）の基本的な構文
- コマンドラインの基本的な操作
- npm/pnpmなどのパッケージマネージャーの基本的な使い方

TypeScriptの経験があれば理想的ですが、必須ではありません。このガイドを通じてTypeScriptも学べるように構成されています。

## 次のステップ

準備ができたら、[なぜSvelteか](/introduction/why-svelte/)から始めましょう。Svelteがなぜ注目されているのか、その理由を詳しく見ていきます。
