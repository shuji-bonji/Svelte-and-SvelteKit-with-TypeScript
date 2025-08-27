---
title: SvelteKit 基礎編
description: SvelteKitフレームワークの基本概念とアーキテクチャを理解する
---

:::caution[タイトル]
執筆中
:::
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

## このセクションで学ぶこと

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
  
  <a href="{base}/sveltekit/basics/routing/" class="flex no-underline group h-full">
    <div class="p-4 border border-gray-2 dark:border-gray-7 rounded-lg shadow-md hover:shadow-lg hover:border-blue-400 dark:hover:border-blue-400 transition-all cursor-pointer flex flex-col w-full">
      <div class="text-3xl mb-2">🛤️</div>
      <h3 class="font-bold text-lg mb-2 text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
        ルーティング詳解
        <span class="inline-block ml-1 text-xs opacity-60">→</span>
      </h3>
      <p class="text-sm mb-3 text-gray-7 dark:text-gray-3">柔軟で強力なファイルベースルーティングシステムを習得します。</p>
      <ul class="text-sm text-gray-6 dark:text-gray-4 space-y-1 flex-grow">
        <li><strong>動的ルート</strong>: <code>[param]</code>パラメータ</li>
        <li><strong>レイアウト</strong>: 共通UI要素の管理</li>
        <li><strong>エラーページ</strong>: +error.svelte</li>
        <li><strong>ルートグループ</strong>: (group)ディレクトリ</li>
        <li><strong>Rest parameters</strong>: [...rest]</li>
      </ul>
    </div>
  </a>
  
  <a href="{base}/sveltekit/basics/load-functions/" class="flex no-underline group h-full">
    <div class="p-4 border border-gray-2 dark:border-gray-7 rounded-lg shadow-md hover:shadow-lg hover:border-blue-400 dark:hover:border-blue-400 transition-all cursor-pointer flex flex-col w-full">
      <div class="text-3xl mb-2">📊</div>
      <h3 class="font-bold text-lg mb-2 text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
        データ読み込み
        <span class="inline-block ml-1 text-xs opacity-60">→</span>
      </h3>
      <p class="text-sm mb-3 text-gray-7 dark:text-gray-3">load関数を使った効率的なデータフェッチング戦略を学びます。</p>
      <ul class="text-sm text-gray-6 dark:text-gray-4 space-y-1 flex-grow">
        <li><strong>+page.ts</strong>: ユニバーサルload</li>
        <li><strong>+page.server.ts</strong>: サーバー専用load</li>
        <li><strong>並列フェッチ</strong>: Promise.all最適化</li>
        <li><strong>親子間データ</strong>: 依存関係の管理</li>
        <li><strong>invalidation</strong>: データの再取得</li>
      </ul>
    </div>
  </a>
</div>

## 学習の進め方

### 📚 推奨学習順序

1. **概要とアーキテクチャ** - まずSvelteKitの全体像を理解
2. **プロジェクト構造** - ディレクトリ構造と命名規約を習得
3. **ルーティング詳解** - URLとファイルの関係を理解
4. **データ読み込み** - load関数とデータフローを学習

### 🎯 学習目標

このセクションを完了すると、以下ができるようになります。

- SvelteKitプロジェクトの構造を理解し、適切に構成できる
- ファイルベースルーティングを活用して複雑なURL構造を実装できる
- load関数を使って効率的にデータを取得・管理できる
- SSR/SSG/SPAの違いを理解し、適切に選択できる

## 次のステップ

基礎編を習得したら、[サーバーサイド編](/sveltekit/server/)でより高度なサーバーサイド機能を学びましょう。

:::tip[TypeScript推奨]
すべてのコード例はTypeScriptで記述されています。型安全性を最大限に活用するため、TypeScriptの使用を強く推奨します。
:::

:::info[前提知識]
このセクションは[Svelte 5の基本](/svelte/)を理解していることを前提としています。Svelteの基礎がまだの方は、先にSvelteセクションを学習してください。
:::