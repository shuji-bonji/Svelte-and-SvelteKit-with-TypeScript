---
title: SvelteKit 基礎編
description: SvelteKit基礎編をTypeScriptで学ぶ。プロジェクト構造、ファイルベースルーティング、load関数、サーバー/クライアントの実行環境を解説
---

<script>
  import { base } from '$app/paths';
</script>

SvelteKitはSvelteをベースにした**フルスタックWebアプリケーションフレームワーク**です。このセクションでは、SvelteKitの核となる概念とアーキテクチャについて体系的に学びます。

## SvelteKitの特徴

SvelteKitは、モダンなWebアプリケーション開発に必要なすべての機能を提供します。

### 主な特徴

1. **ファイルベースルーティング** - ディレクトリ構造がそのままURLに対応
2. **SSR/SSG/SPA対応** - レンダリング戦略を柔軟に選択
3. **TypeScript完全対応** - 型安全な開発が可能
4. **エッジ対応** - Cloudflare Workers等での動作
5. **開発者体験** - HMR、自動インポート、Viteベース

## 基礎編の内容

<div class="grid grid-cols-1 md:grid-cols-2 gap-4 my-8 auto-rows-[1fr]">
  <a href="{base}/sveltekit/basics/overview/" class="flex no-underline group h-full">
    <div class="p-4 border border-gray-2 dark:border-gray-7 rounded-lg shadow-md hover:shadow-lg hover:border-blue-400 dark:hover:border-blue-400 transition-all cursor-pointer flex flex-col w-full">
      <div class="text-3xl mb-2">🎯</div>
      <h3 class="font-bold text-lg mb-2 text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
        SvelteKit概要
        <span class="inline-block ml-1 text-xs opacity-60">→</span>
      </h3>
      <p class="text-sm mb-3 text-gray-7 dark:text-gray-3">SvelteKitの全体像とフレームワーク設計を理解します。</p>
      <ul class="text-sm text-gray-6 dark:text-gray-4 space-y-1 flex-grow">
        <li><strong>MPA vs SPA</strong>: ハイブリッドアプローチ</li>
        <li><strong>レンダリング戦略</strong>: SSR/SSG/CSR</li>
        <li><strong>データフロー</strong>: サーバーとクライアント</li>
        <li><strong>ビルド最適化</strong>: コード分割とプリロード</li>
        <li><strong>開発ツール</strong>: Viteとの統合</li>
      </ul>
    </div>
  </a>
  
  <a href="{base}/sveltekit/basics/project-structure/" class="flex no-underline group h-full">
    <div class="p-4 border border-gray-2 dark:border-gray-7 rounded-lg shadow-md hover:shadow-lg hover:border-blue-400 dark:hover:border-blue-400 transition-all cursor-pointer flex flex-col w-full">
      <div class="text-3xl mb-2">📁</div>
      <h3 class="font-bold text-lg mb-2 text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
        プロジェクト構造
        <span class="inline-block ml-1 text-xs opacity-60">→</span>
      </h3>
      <p class="text-sm mb-3 text-gray-7 dark:text-gray-3">SvelteKitプロジェクトのディレクトリ構造と命名規約を学びます。</p>
      <ul class="text-sm text-gray-6 dark:text-gray-4 space-y-1 flex-grow">
        <li><code>src/routes</code>: ページとレイアウト</li>
        <li><code>src/lib</code>: 共有コンポーネント</li>
        <li><code>+page/+layout</code>: 特殊ファイル</li>
        <li><code>+server</code>: APIエンドポイント</li>
        <li><code>app.html</code>: アプリケーションシェル</li>
      </ul>
    </div>
  </a>

  <a href="{base}/sveltekit/basics/global-types/" class="flex no-underline group h-full">
    <div class="p-4 border border-gray-2 dark:border-gray-7 rounded-lg shadow-md hover:shadow-lg hover:border-blue-400 dark:hover:border-blue-400 transition-all cursor-pointer flex flex-col w-full">
      <div class="text-3xl mb-2">🌍</div>
      <h3 class="font-bold text-lg mb-2 text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
        app.d.tsの役割
        <span class="inline-block ml-1 text-xs opacity-60">→</span>
      </h3>
      <p class="text-sm mb-3 text-gray-7 dark:text-gray-3">プロジェクト全体で共有されるグローバルな型定義</p>
      <ul class="text-sm text-gray-6 dark:text-gray-4 space-y-1 flex-grow">
        <li><strong>App.Locals</strong>: サーバーサイドのリクエスト固有データ</li>
        <li><strong>App.PageData</strong>: すべてのページで共通のデータ型</li>
        <li><strong>App.Error</strong>: カスタムエラー型</li>
        <li><strong>App.PageState</strong>: 履歴エントリの状態</li>
        <li><strong>App.Platform</strong>: プラットフォーム固有のAPI</li>
      </ul>
    </div>
  </a>
</div>

## 🔗 関連セクション

基礎編を学んだら、次のセクションでSvelteKitのコア機能を習得しましょう。

<div class="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
  <a href="{base}/sveltekit/routing/" class="flex no-underline group">
    <div class="p-6 border border-gray-2 dark:border-gray-7 rounded-lg shadow-md hover:shadow-lg hover:border-orange-400 dark:hover:border-orange-400 transition-all cursor-pointer flex flex-col w-full">
      <div class="text-3xl mb-3">🛤️</div>
      <h3 class="font-bold text-xl mb-3 text-orange-600 dark:text-orange-400 group-hover:text-orange-700 dark:group-hover:text-orange-300 transition-colors">
        ルーティング
      </h3>
      <p class="text-sm text-gray-6 dark:text-gray-4">
        ファイルベースルーティングの完全ガイド。動的ルート、レイアウト、ルートグループなどを詳しく解説。
      </p>
    </div>
  </a>
  
  <a href="{base}/sveltekit/data-loading/" class="flex no-underline group">
    <div class="p-6 border border-gray-2 dark:border-gray-7 rounded-lg shadow-md hover:shadow-lg hover:border-orange-400 dark:hover:border-orange-400 transition-all cursor-pointer flex flex-col w-full">
      <div class="text-3xl mb-3">📊</div>
      <h3 class="font-bold text-xl mb-3 text-orange-600 dark:text-orange-400 group-hover:text-orange-700 dark:group-hover:text-orange-300 transition-colors">
        データ取得
      </h3>
      <p class="text-sm text-gray-6 dark:text-gray-4">
        Load関数を使った効率的なデータフェッチング。Universal LoadとServer Loadの使い分け、ストリーミングSSRなど。
      </p>
    </div>
  </a>
</div>

## 学習の進め方

### 📚 推奨学習順序

1. **概要とアーキテクチャ** - まずSvelteKitの全体像を理解
2. **プロジェクト構造** - ディレクトリ構造と命名規約を習得
3. **TypeScript型の自動生成** - `./$types`による型安全な開発

### 🎯 学習目標

このセクションを完了すると、以下ができるようになります。

- SvelteKitプロジェクトの構造を理解し、適切に構成できる
- ファイルベースルーティングを活用して複雑なURL構造を実装できる
- load関数を使って効率的にデータを取得・管理できる
- SSR/SSG/SPAの違いを理解し、適切に選択できる
- `./$types`を活用して型安全なアプリケーションを構築できる

## 次のステップ

基礎編を習得したら、[サーバーサイド編](/sveltekit/server/)でより高度なサーバーサイド機能を学びましょう。

:::tip[TypeScript推奨]
すべてのコード例はTypeScriptで記述されています。型安全性を最大限に活用するため、TypeScriptの使用を強く推奨します。
:::

:::info[前提知識]
このセクションは[Svelte 5の基本](/svelte/)を理解していることを前提としています。Svelteの基礎がまだの方は、先にSvelteセクションを学習してください。
:::


