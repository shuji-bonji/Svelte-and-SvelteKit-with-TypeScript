---
title: SvelteKit完全ガイド
description: SvelteKitをTypeScriptでマスターする完全ガイド。SSR/SSG/SPAのレンダリング戦略、ファイルベースルーティング、load関数、APIルートの実装方法を解説
---

<script>
  import { base } from '$app/paths';
  import Mermaid from '$lib/components/Mermaid.svelte';

  const learningFlow = `flowchart LR
    Start([🎯 SvelteKit学習開始])
    Check[Svelte習得済み？]
    Svelte[📚 Svelte基礎へ]
    
    Basics[🔰 基礎編]
    
    Server[⚙️ サーバーサイド編]
    
    App[🏗️ アプリ構築編]
    
    Opt[⚡ 最適化編]
    
    Deploy[🚀 デプロイ・運用編]
    
    Production([🎉 本番運用開始])
    
    Start --> Check
    Check -->|いいえ| Svelte
    Check -->|はい| Basics
    Basics --> Server
    Server --> App
    App --> Opt
    Opt --> Deploy
    Deploy --> Production
    
    style Start fill:#FF5722,color:#fff
    style Check fill:#FFC107,color:#333
    style Svelte fill:#FF4081,color:#fff
    style Basics fill:#2196F3,color:#fff
    style Server fill:#00BCD4,color:#fff
    style App fill:#4CAF50,color:#fff
    style Opt fill:#FF9800,color:#fff
    style Deploy fill:#9C27B0,color:#fff
    style Production fill:#8BC34A,color:#fff`;
</script>

SvelteKitは、Svelteをベースにした**モダンなフルスタックWebアプリケーションフレームワーク**です。Next.js（React）やNuxt（Vue）と同等以上の機能を持ちながら、より軽量で高速、そして優れた開発者体験を提供します。

## なぜSvelteKitを学ぶべきか

<div class="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
  <div class="p-6 border border-gray-2 dark:border-gray-7 rounded-lg shadow-md hover:shadow-lg transition-shadow">
    <div class="text-3xl mb-3">🚀</div>
    <h3 class="font-bold text-xl mb-3">パフォーマンスの優位性</h3>
    <ul class="space-y-2 text-sm">
      <li><strong class="text-orange-500">最小バンドルサイズ:</strong> ~40KB（Next.js: ~70KB）</li>
      <li><strong class="text-orange-500">ランタイムなし:</strong> コンパイル時最適化</li>
      <li><strong class="text-orange-500">高速な初期表示:</strong> 効率的なSSR/SSG</li>
    </ul>
  </div>
  <div class="p-6 border border-gray-2 dark:border-gray-7 rounded-lg shadow-md hover:shadow-lg transition-shadow">
    <div class="text-3xl mb-3">⚡</div>
    <h3 class="font-bold text-xl mb-3">開発者体験の向上</h3>
    <ul class="space-y-2 text-sm">
      <li><strong class="text-orange-500">型安全性:</strong> TypeScript完全対応</li>
      <li><strong class="text-orange-500">ゼロコンフィグ:</strong> すぐに開発開始</li>
      <li><strong class="text-orange-500">統合ツールチェーン:</strong> Vite採用</li>
    </ul>
  </div>
  <div class="p-6 border border-gray-2 dark:border-gray-7 rounded-lg shadow-md hover:shadow-lg transition-shadow">
    <div class="text-3xl mb-3">🏢</div>
    <h3 class="font-bold text-xl mb-3">エンタープライズ対応</h3>
    <ul class="space-y-2 text-sm">
      <li><strong class="text-orange-500">スケーラブル:</strong> マイクロサービス対応</li>
      <li><strong class="text-orange-500">セキュア:</strong> 組み込みセキュリティ機能</li>
      <li><strong class="text-orange-500">柔軟:</strong> 様々なデプロイ環境に対応</li>
    </ul>
  </div>
</div>

## 学習ロードマップ

<Mermaid diagram={learningFlow} />

### 推奨学習順序

1. **Svelte習得確認** - Svelte 5の基礎知識があるか確認
   - ない場合 → [📚 Svelte基礎へ]({base}/svelte/)
2. **🔰 基礎編** - SvelteKit概要、プロジェクト構造、特殊ファイルシステム、app.d.ts
3. **🛤️ ルーティング** - ファイルベースルーティング、動的ルート、ルートグループ
4. **📊 データ取得** - Load関数の基礎、TypeScript型システム、データフロー、ストリーミングSSR
5. **🏛️ アーキテクチャ詳解** - レンダリング戦略、パイプライン、内部動作の詳細理解
6. **⚙️ サーバーサイド編** - フォーム処理/Actions、WebSocket/SSE通信
7. **🏗️ アプリ構築編** - セッション管理、認証ベストプラクティス、状態管理、テスト戦略
8. **⚡ 最適化編** - ビルド最適化、キャッシュ戦略
9. **🚀 デプロイ・運用編** - プラットフォーム別デプロイ、実行環境とランタイム
10. **🎉 本番運用開始**

## 📖 学習コンテンツ

<div class="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
  <!-- 基礎編カード -->
  <div class="p-6 border border-gray-2 dark:border-gray-7 rounded-lg shadow-md hover:shadow-lg transition-shadow">
    <div class="flex items-center gap-3 mb-4">
      <span class="text-3xl">🔰</span>
      <h3 class="font-bold text-xl">基礎編 - SvelteKitの基本を理解</h3>
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
            <td class="py-2"><a href="{base}/sveltekit/basics/" class="text-blue-600 dark:text-blue-400 hover:underline">基礎編概要</a></td>
            <td class="py-2 text-gray-6 dark:text-gray-4">SvelteKitの基本概念</td>
          </tr>
          <tr>
            <td class="py-2"><a href="{base}/sveltekit/basics/overview/" class="text-blue-600 dark:text-blue-400 hover:underline">SvelteKit概要</a></td>
            <td class="py-2 text-gray-6 dark:text-gray-4">フレームワークの全体像</td>
          </tr>
          <tr>
            <td class="py-2"><a href="{base}/sveltekit/basics/project-structure/" class="text-blue-600 dark:text-blue-400 hover:underline">プロジェクト構造</a></td>
            <td class="py-2 text-gray-6 dark:text-gray-4">ファイル構成と規約</td>
          </tr>
          <tr>
            <td class="py-2"><a href="{base}/sveltekit/basics/file-system/" class="text-blue-600 dark:text-blue-400 hover:underline">特殊ファイルシステム</a></td>
            <td class="py-2 text-gray-6 dark:text-gray-4">+page、+layout、+serverの役割</td>
          </tr>
          <tr>
            <td class="py-2"><a href="{base}/sveltekit/basics/app-modules/" class="text-blue-600 dark:text-blue-400 hover:underline">$appモジュール</a></td>
            <td class="py-2 text-gray-6 dark:text-gray-4">$app/state（推奨）、$app/navigation等</td>
          </tr>
          <tr>
            <td class="py-2"><a href="{base}/sveltekit/basics/rendering-strategies/" class="text-blue-600 dark:text-blue-400 hover:underline">レンダリング戦略（基礎）</a></td>
            <td class="py-2 text-gray-6 dark:text-gray-4">SSR/SSG/SPAの基本</td>
          </tr>
          <tr>
            <td class="py-2"><a href="{base}/sveltekit/basics/global-types/" class="text-blue-600 dark:text-blue-400 hover:underline">app.d.tsの役割</a></td>
            <td class="py-2 text-gray-6 dark:text-gray-4">グローバルな型定義</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="mt-4 pt-4 border-t border-gray-2 dark:border-gray-7">
      <a href="{base}/sveltekit/basics/" class="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
        すべて見る <span class="text-xs">→</span>
      </a>
    </div>
  </div>

  <!-- ルーティングカード -->
  <div class="p-6 border border-gray-2 dark:border-gray-7 rounded-lg shadow-md hover:shadow-lg transition-shadow">
    <div class="flex items-center gap-3 mb-4">
      <span class="text-3xl">🛤️</span>
      <h3 class="font-bold text-xl">ルーティング - ファイルベースルーティング</h3>
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
            <td class="py-2"><a href="{base}/sveltekit/routing/" class="text-orange-600 dark:text-orange-400 hover:underline">ルーティング概要</a></td>
            <td class="py-2 text-gray-6 dark:text-gray-4">ルーティングシステムの全体像</td>
          </tr>
          <tr>
            <td class="py-2"><a href="{base}/sveltekit/routing/basic/" class="text-orange-600 dark:text-orange-400 hover:underline">基本ルーティング</a></td>
            <td class="py-2 text-gray-6 dark:text-gray-4">ファイルベースルーティングの基本</td>
          </tr>
          <tr>
            <td class="py-2"><a href="{base}/sveltekit/routing/dynamic/" class="text-orange-600 dark:text-orange-400 hover:underline">動的ルーティング</a></td>
            <td class="py-2 text-gray-6 dark:text-gray-4">パラメータとスラッグの活用</td>
          </tr>
          <tr>
            <td class="py-2"><a href="{base}/sveltekit/routing/advanced/" class="text-orange-600 dark:text-orange-400 hover:underline">高度なルーティング</a></td>
            <td class="py-2 text-gray-6 dark:text-gray-4">ルートグループとレイアウト</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="mt-4 pt-4 border-t border-gray-2 dark:border-gray-7">
      <a href="{base}/sveltekit/routing/" class="text-sm font-medium text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1">
        すべて見る <span class="text-xs">→</span>
      </a>
    </div>
  </div>

  <!-- データ取得カード -->
  <div class="p-6 border border-gray-2 dark:border-gray-7 rounded-lg shadow-md hover:shadow-lg transition-shadow">
    <div class="flex items-center gap-3 mb-4">
      <span class="text-3xl">📊</span>
      <h3 class="font-bold text-xl">データ取得 - Load関数とデータフェッチング</h3>
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
            <td class="py-2"><a href="{base}/sveltekit/data-loading/" class="text-orange-600 dark:text-orange-400 hover:underline">Load関数とデータフェッチング</a></td>
            <td class="py-2 text-gray-6 dark:text-gray-4">データ取得の全体像</td>
          </tr>
          <tr>
            <td class="py-2"><a href="{base}/sveltekit/data-loading/basic/" class="text-orange-600 dark:text-orange-400 hover:underline">Load関数の基礎</a></td>
            <td class="py-2 text-gray-6 dark:text-gray-4">Universal LoadとServer Load</td>
          </tr>
          <tr>
            <td class="py-2"><a href="{base}/sveltekit/data-loading/typescript-types/" class="text-orange-600 dark:text-orange-400 hover:underline">TypeScript型の自動生成</a></td>
            <td class="py-2 text-gray-6 dark:text-gray-4">./$typesによる型安全な開発</td>
          </tr>
          <tr>
            <td class="py-2"><a href="{base}/sveltekit/data-loading/flow/" class="text-orange-600 dark:text-orange-400 hover:underline">データフローの詳細</a></td>
            <td class="py-2 text-gray-6 dark:text-gray-4">親子間のデータ共有とウォーターフォール</td>
          </tr>
          <tr>
            <td class="py-2"><a href="{base}/sveltekit/data-loading/spa-invalidation/" class="text-orange-600 dark:text-orange-400 hover:underline">SPAモードとデータ無効化</a></td>
            <td class="py-2 text-gray-6 dark:text-gray-4">CSRとデータ更新の制御</td>
          </tr>
          <tr>
            <td class="py-2"><a href="{base}/sveltekit/data-loading/streaming/" class="text-orange-600 dark:text-orange-400 hover:underline">ストリーミングSSR</a></td>
            <td class="py-2 text-gray-6 dark:text-gray-4">段階的データ送信で高速化</td>
          </tr>
          <tr>
            <td class="py-2"><a href="{base}/sveltekit/data-loading/strategies/" class="text-orange-600 dark:text-orange-400 hover:underline">データフェッチング戦略</a></td>
            <td class="py-2 text-gray-6 dark:text-gray-4">実践的なパターンとベストプラクティス</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="mt-4 pt-4 border-t border-gray-2 dark:border-gray-7">
      <a href="{base}/sveltekit/data-loading/" class="text-sm font-medium text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1">
        すべて見る <span class="text-xs">→</span>
      </a>
    </div>
  </div>
  
  <!-- アーキテクチャ詳解カード -->
  <div class="p-6 border border-gray-2 dark:border-gray-7 rounded-lg shadow-md hover:shadow-lg transition-shadow">
    <div class="flex items-center gap-3 mb-4">
      <span class="text-3xl">🏛️</span>
      <h3 class="font-bold text-xl">アーキテクチャ詳解 - 内部動作を深く理解</h3>
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
            <td class="py-2"><a href="{base}/sveltekit/architecture/" class="text-indigo-600 dark:text-indigo-400 hover:underline">アーキテクチャ概要</a></td>
            <td class="py-2 text-gray-6 dark:text-gray-4">内部動作メカニズムの全体像</td>
          </tr>
          <tr>
            <td class="py-2"><a href="{base}/sveltekit/architecture/rendering-strategies/" class="text-indigo-600 dark:text-indigo-400 hover:underline">レンダリング戦略（詳解）</a></td>
            <td class="py-2 text-gray-6 dark:text-gray-4">SPA/MPA、CSR/SSR/SSG/ISR</td>
          </tr>
          <tr>
            <td class="py-2"><a href="{base}/sveltekit/architecture/rendering-pipeline/" class="text-indigo-600 dark:text-indigo-400 hover:underline">レンダリングパイプライン</a></td>
            <td class="py-2 text-gray-6 dark:text-gray-4">コンパイルから実行まで</td>
          </tr>
          <tr>
            <td class="py-2"><a href="{base}/sveltekit/architecture/access-logs/" class="text-indigo-600 dark:text-indigo-400 hover:underline">アクセスログと分析戦略</a></td>
            <td class="py-2 text-gray-6 dark:text-gray-4">レンダリング戦略とログ</td>
          </tr>
          <tr>
            <td class="py-2"><a href="{base}/sveltekit/architecture/data-loading/" class="text-indigo-600 dark:text-indigo-400 hover:underline">データロードアーキテクチャ</a></td>
            <td class="py-2 text-gray-6 dark:text-gray-4">Load関数の内部実装</td>
          </tr>
          <tr>
            <td class="py-2"><a href="{base}/sveltekit/architecture/file-structure/" class="text-indigo-600 dark:text-indigo-400 hover:underline">ファイル構成と実行環境</a></td>
            <td class="py-2 text-gray-6 dark:text-gray-4">各ファイルの役割と環境</td>
          </tr>
          <tr>
            <td class="py-2"><a href="{base}/sveltekit/architecture/routing-internals/" class="text-indigo-600 dark:text-indigo-400 hover:underline">ルーティング内部動作</a></td>
            <td class="py-2 text-gray-6 dark:text-gray-4">ファイルベースルーティング</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="mt-4 pt-4 border-t border-gray-2 dark:border-gray-7">
      <a href="{base}/sveltekit/architecture/" class="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
        すべて見る <span class="text-xs">→</span>
      </a>
    </div>
  </div>
  <!-- サーバーサイド編カード -->
  <div class="p-6 border border-gray-2 dark:border-gray-7 rounded-lg shadow-md hover:shadow-lg transition-shadow">
    <div class="flex items-center gap-3 mb-4">
      <span class="text-3xl">⚙️</span>
      <h3 class="font-bold text-xl">サーバーサイド編 - バックエンド機能をマスター</h3>
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
            <td class="py-2"><a href="{base}/sveltekit/server/server-side/" class="text-green-600 dark:text-green-400 hover:underline">サーバーサイド処理</a></td>
            <td class="py-2 text-gray-6 dark:text-gray-4">アーキテクチャの全体像とファイルタイプ</td>
          </tr>
          <tr>
            <td class="py-2"><a href="{base}/sveltekit/server/forms/" class="text-green-600 dark:text-green-400 hover:underline">フォーム処理とActions</a></td>
            <td class="py-2 text-gray-6 dark:text-gray-4">Progressive Enhancement、バリデーション</td>
          </tr>
          <tr>
            <td class="py-2"><a href="{base}/sveltekit/server/api-routes/" class="text-green-600 dark:text-green-400 hover:underline">APIルート設計</a></td>
            <td class="py-2 text-gray-6 dark:text-gray-4">RESTful API、認証、CORS、レート制限</td>
          </tr>
          <tr>
            <td class="py-2"><a href="{base}/sveltekit/server/hooks/" class="text-green-600 dark:text-green-400 hover:underline">Hooks</a></td>
            <td class="py-2 text-gray-6 dark:text-gray-4">handle、handleFetch、handleError</td>
          </tr>
          <tr>
            <td class="py-2"><a href="{base}/sveltekit/server/websocket-sse/" class="text-green-600 dark:text-green-400 hover:underline">WebSocket/SSE</a></td>
            <td class="py-2 text-gray-6 dark:text-gray-4">リアルタイム通信の実装</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="mt-4 pt-4 border-t border-gray-2 dark:border-gray-7">
      <a href="{base}/sveltekit/server/" class="text-sm font-medium text-green-600 dark:text-green-400 hover:underline flex items-center gap-1">
        すべて見る <span class="text-xs">→</span>
      </a>
    </div>
  </div>

  <!-- アプリケーション構築編カード -->
  <div class="p-6 border border-gray-2 dark:border-gray-7 rounded-lg shadow-md hover:shadow-lg transition-shadow">
    <div class="flex items-center gap-3 mb-4">
      <span class="text-3xl">🏗️</span>
      <h3 class="font-bold text-xl">アプリケーション構築編 - 実践的な実装</h3>
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
            <td class="py-2"><span class="text-gray-5 dark:text-gray-5">認証・認可（準備中）</span></td>
            <td class="py-2 text-gray-6 dark:text-gray-4">Lucia Auth、JWT、OAuth</td>
          </tr>
          <tr>
            <td class="py-2"><a href="{base}/sveltekit/application/session/" class="text-purple-600 dark:text-purple-400 hover:underline">セッション管理と認証戦略</a></td>
            <td class="py-2 text-gray-6 dark:text-gray-4">Cookie/Session、JWT、ルートグループ</td>
          </tr>
          <tr>
            <td class="py-2"><a href="{base}/examples/auth-jwt/" class="text-purple-600 dark:text-purple-400 hover:underline">JWT認証実装</a></td>
            <td class="py-2 text-gray-6 dark:text-gray-4">トークンベース認証、RBAC、ルートグループ活用</td>
          </tr>
          <tr>
            <td class="py-2"><span class="text-gray-5 dark:text-gray-5">データベース統合（準備中）</span></td>
            <td class="py-2 text-gray-6 dark:text-gray-4">Prisma、Drizzle ORM</td>
          </tr>
          <tr>
            <td class="py-2"><span class="text-gray-5 dark:text-gray-5">環境変数管理（準備中）</span></td>
            <td class="py-2 text-gray-6 dark:text-gray-4">PUBLIC_変数、秘密情報</td>
          </tr>
          <tr>
            <td class="py-2"><span class="text-gray-5 dark:text-gray-5">エラーハンドリング（準備中）</span></td>
            <td class="py-2 text-gray-6 dark:text-gray-4">エラーページ、ログ戦略</td>
          </tr>
          <tr>
            <td class="py-2"><a href="{base}/sveltekit/application/testing/" class="text-purple-600 dark:text-purple-400 hover:underline">テスト戦略</a></td>
            <td class="py-2 text-gray-6 dark:text-gray-4">Vitest、Playwright、E2Eテスト</td>
          </tr>
          <tr>
            <td class="py-2"><a href="{base}/sveltekit/application/state-management/" class="text-purple-600 dark:text-purple-400 hover:underline">状態管理パターン</a></td>
            <td class="py-2 text-gray-6 dark:text-gray-4">Store、Context API、グローバル状態</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="mt-4 pt-4 border-t border-gray-2 dark:border-gray-7">
      <a href="{base}/sveltekit/application/" class="text-sm font-medium text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1">
        すべて見る <span class="text-xs">→</span>
      </a>
    </div>
  </div>

  <!-- 最適化編カード -->
  <div class="p-6 border border-gray-2 dark:border-gray-7 rounded-lg shadow-md hover:shadow-lg transition-shadow">
    <div class="flex items-center gap-3 mb-4">
      <span class="text-3xl">⚡</span>
      <h3 class="font-bold text-xl">最適化編 - パフォーマンスを極める</h3>
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
            <td class="py-2"><span class="text-gray-5 dark:text-gray-5">パフォーマンス最適化（準備中）</span></td>
            <td class="py-2 text-gray-6 dark:text-gray-4">コード分割、遅延読み込み</td>
          </tr>
          <tr>
            <td class="py-2"><a href="{base}/sveltekit/optimization/caching/" class="text-orange-600 dark:text-orange-400 hover:underline">キャッシュ戦略</a></td>
            <td class="py-2 text-gray-6 dark:text-gray-4">HTTP、CDN、Service Worker</td>
          </tr>
          <tr>
            <td class="py-2"><span class="text-gray-5 dark:text-gray-5">SEO最適化（準備中）</span></td>
            <td class="py-2 text-gray-6 dark:text-gray-4">メタタグ、構造化データ</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="mt-4 pt-4 border-t border-gray-2 dark:border-gray-7">
      <a href="{base}/sveltekit/optimization/" class="text-sm font-medium text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1">
        すべて見る <span class="text-xs">→</span>
      </a>
    </div>
  </div>

  <!-- デプロイ・運用編カード -->
  <div class="p-6 border border-gray-2 dark:border-gray-7 rounded-lg shadow-md hover:shadow-lg transition-shadow">
    <div class="flex items-center gap-3 mb-4">
      <span class="text-3xl">🚀</span>
      <h3 class="font-bold text-xl">デプロイ・運用編 - 本番環境へ</h3>
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
            <td class="py-2"><a href="{base}/sveltekit/deployment/platforms/" class="text-teal-600 dark:text-teal-400 hover:underline">プラットフォーム別デプロイ</a></td>
            <td class="py-2 text-gray-6 dark:text-gray-4">Vercel、Netlify、Node.js</td>
          </tr>
          <tr>
            <td class="py-2"><span class="text-gray-5 dark:text-gray-5">セキュリティ（準備中）</span></td>
            <td class="py-2 text-gray-6 dark:text-gray-4">CSRF、XSS、CSP</td>
          </tr>
          <tr>
            <td class="py-2"><span class="text-gray-5 dark:text-gray-5">モニタリング（準備中）</span></td>
            <td class="py-2 text-gray-6 dark:text-gray-4">Analytics、エラー追跡</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="mt-4 pt-4 border-t border-gray-2 dark:border-gray-7">
      <a href="{base}/sveltekit/deployment/" class="text-sm font-medium text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1">
        すべて見る <span class="text-xs">→</span>
      </a>
    </div>
  </div>
</div>

## 学習の始め方

### 前提条件をチェック
```bash
# Node.jsバージョン確認（20.x以上推奨）
node --version

# 新規プロジェクト作成
npm create svelte@latest my-first-sveltekit-app
# → TypeScriptを選択
# → ESLint、Prettierを追加
# → Playwrightテストを含める
```

### Step 1: 基礎理解（1-2日）
1. **[SvelteKit概要]({base}/sveltekit/basics/overview/)** - SSR/SSG/SPAの違いとSvelteKitの位置づけを理解
2. **[プロジェクト構造]({base}/sveltekit/basics/project-structure/)** - `routes/`、`+page.svelte`、`+layout.svelte`の役割を把握
3. **[特殊ファイルシステム]({base}/sveltekit/basics/file-system/)** - `+page`、`+layout`、`+server`ファイルの役割を理解
4. **[$appモジュール]({base}/sveltekit/basics/app-modules/)** - `$app/stores`、`$app/navigation`などの組み込みモジュール
5. **[app.d.tsの役割]({base}/sveltekit/basics/global-types/)** - グローバルな型定義の設定方法を理解

### Step 2: コア機能習得（3-5日）
1. **[基本ルーティング]({base}/sveltekit/routing/basic/)** - ファイルベースルーティングで最初のページを作成
2. **[Load関数の基本]({base}/sveltekit/data-loading/basic/)** - サーバーサイドでデータを取得し表示
3. **[動的ルーティング]({base}/sveltekit/routing/dynamic/)** - `[slug]`パラメータでブログ記事ページを実装

### Step 3: 実践的な機能（1週間）
1. **[フォーム処理とActions]({base}/sveltekit/server/forms/)** - TODOアプリのCRUD操作を実装
2. **[WebSocket/SSE通信]({base}/sveltekit/server/websocket-sse/)** - リアルタイム通信の実装
3. **[セッション管理と認証戦略]({base}/sveltekit/application/session/)** - 認証パターンを実装
4. **[認証ベストプラクティス]({base}/sveltekit/application/auth-best-practices/)** - セキュアな認証実装

### クイックスタートプロジェクト
```typescript
// 最小限のTODOアプリで学ぶSvelteKit
// src/routes/+page.server.ts
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  const todos = await db.todo.findMany();
  return { todos };
};

export const actions: Actions = {
  create: async ({ request }) => {
    const data = await request.formData();
    await db.todo.create({ 
      data: { title: data.get('title') as string }
    });
  }
};
```

## 推奨開発環境

<div class="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
  <div class="p-6 border border-gray-2 dark:border-gray-7 rounded-lg shadow-sm hover:shadow-md transition-shadow">
    <div class="text-3xl mb-3">⚙️</div>
    <h3 class="font-bold text-lg mb-3">必須ツール</h3>
    <ul class="space-y-2 text-sm">
      <li class="flex items-start">
        <span class="font-semibold text-orange-500 mr-2">Node.js:</span>
        <span class="text-gray-6 dark:text-gray-4">20.x LTS以上</span>
      </li>
      <li class="flex items-start">
        <span class="font-semibold text-orange-500 mr-2">TypeScript:</span>
        <span class="text-gray-6 dark:text-gray-4">5.x以上</span>
      </li>
      <li class="flex items-start">
        <span class="font-semibold text-orange-500 mr-2">VS Code:</span>
        <span class="text-gray-6 dark:text-gray-4">推奨エディタ</span>
      </li>
    </ul>
  </div>

  <div class="p-6 border border-gray-2 dark:border-gray-7 rounded-lg shadow-sm hover:shadow-md transition-shadow">
    <div class="text-3xl mb-3">🔌</div>
    <h3 class="font-bold text-lg mb-3">推奨拡張機能</h3>
    <ul class="space-y-2 text-sm text-gray-6 dark:text-gray-4">
      <li>Svelte for VS Code</li>
      <li>TypeScript Vue Plugin</li>
      <li>Prettier - Code formatter</li>
      <li>ESLint</li>
      <li>Tailwind CSS IntelliSense</li>
    </ul>
  </div>

  <div class="p-6 border border-gray-2 dark:border-gray-7 rounded-lg shadow-sm hover:shadow-md transition-shadow">
    <div class="text-3xl mb-3">🚀</div>
    <h3 class="font-bold text-lg mb-3">プロジェクト作成</h3>
    <div class="bg-gray-1 dark:bg-gray-8 rounded p-3 text-xs">
      <code class="text-orange-500">
        npm create svelte@latest my-app<br/>
        cd my-app<br/>
        npm install<br/>
        npm run dev
      </code>
    </div>
  </div>
</div>

## 📖 関連リソース

<div class="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
  <div class="p-6 border border-gray-2 dark:border-gray-7 rounded-lg shadow-sm hover:shadow-md transition-shadow">
    <div class="text-3xl mb-3">📚</div>
    <h3 class="font-bold text-lg mb-3">公式ドキュメント</h3>
    <ul class="space-y-2 text-sm">
      <li>
        <a href="https://kit.svelte.dev" class="text-orange-500 hover:text-orange-600 dark:hover:text-orange-400">
          SvelteKit公式サイト →
        </a>
      </li>
      <li>
        <a href="https://svelte.dev" class="text-orange-500 hover:text-orange-600 dark:hover:text-orange-400">
          Svelte公式サイト →
        </a>
      </li>
      <li>
        <a href="https://kit.svelte.dev/docs" class="text-orange-500 hover:text-orange-600 dark:hover:text-orange-400">
          SvelteKitドキュメント →
        </a>
      </li>
    </ul>
  </div>

  <div class="p-6 border border-gray-2 dark:border-gray-7 rounded-lg shadow-sm hover:shadow-md transition-shadow">
    <div class="text-3xl mb-3">👥</div>
    <h3 class="font-bold text-lg mb-3">コミュニティ</h3>
    <ul class="space-y-2 text-sm">
      <li>
        <a href="https://discord.gg/svelte" class="text-orange-500 hover:text-orange-600 dark:hover:text-orange-400">
          Discord サーバー →
        </a>
      </li>
      <li>
        <a href="https://github.com/sveltejs/kit/discussions" class="text-orange-500 hover:text-orange-600 dark:hover:text-orange-400">
          GitHub Discussions →
        </a>
      </li>
      <li>
        <a href="https://www.reddit.com/r/sveltejs/" class="text-orange-500 hover:text-orange-600 dark:hover:text-orange-400">
          Reddit コミュニティ →
        </a>
      </li>
    </ul>
  </div>
</div>

## 実際のプロジェクト例

### SvelteKitで構築されたサービス
- **Vercel Dashboard**: デプロイ管理ダッシュボード
- **GitPod**: クラウドベースのIDE
- **StackBlitz**: オンラインコードエディタ
- **Svelte公式サイト**: svelte.dev自体もSvelteKit製

### プロジェクトテンプレート

#### 1. ブログサイト（初級）
```typescript
// +page.server.ts
export const load: PageServerLoad = async () => {
  const posts = await getPosts();
  return { posts };
};

// +page.svelte
<script lang="ts">
  let { data } = $props();
</script>

{#each data.posts as post}
  <article>
    <h2>{post.title}</h2>
    <p>{post.excerpt}</p>
  </article>
{/each}
```

#### 2. ECサイト（中級）
- Stripeとの決済統合
- 在庫管理システム
- ユーザー認証・注文履歴

#### 3. SaaSダッシュボード（上級）
- リアルタイムデータ更新
- マルチテナント対応
- WebSocket/Server-Sent Events

## ❓ よくある質問

<div class="space-y-4 my-8">
  <div class="p-6 border border-gray-2 dark:border-gray-7 rounded-lg shadow-sm hover:shadow-md transition-shadow">
    <h3 class="font-bold text-lg mb-3 flex items-center">
      <span class="text-2xl mr-2">Q:</span>
      A: Next.jsとの違いは？
    </h3>
    <div class="space-y-3">
      <p class="text-gray-7 dark:text-gray-3">主な違いを比較します。</p>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
        <div class="flex items-start">
          <span class="font-semibold text-orange-500 w-28">ビルドサイズ:</span>
          <span class="text-gray-6 dark:text-gray-4">SvelteKitの方が小さい（40-60%削減）</span>
        </div>
        <div class="flex items-start">
          <span class="font-semibold text-orange-500 w-28">パフォーマンス:</span>
          <span class="text-gray-6 dark:text-gray-4">コンパイル時最適化により高速</span>
        </div>
        <div class="flex items-start">
          <span class="font-semibold text-orange-500 w-28">学習曲線:</span>
          <span class="text-gray-6 dark:text-gray-4">SvelteKitの方がシンプル</span>
        </div>
        <div class="flex items-start">
          <span class="font-semibold text-orange-500 w-28">エコシステム:</span>
          <span class="text-gray-6 dark:text-gray-4">Next.jsの方が成熟</span>
        </div>
      </div>
    </div>
  </div>

  <div class="p-6 border border-gray-2 dark:border-gray-7 rounded-lg shadow-sm hover:shadow-md transition-shadow">
    <h3 class="font-bold text-lg mb-3 flex items-center">
      <span class="text-2xl mr-2">Q:</span>
      A: どのデプロイ先がおすすめ？
    </h3>
    <div class="space-y-3">
      <p class="text-gray-7 dark:text-gray-3">用途別の推奨プラットフォーム</p>
      <div class="space-y-2">
        <div class="flex items-start">
          <span class="font-semibold text-orange-500 w-32">静的サイト:</span>
          <span class="text-gray-6 dark:text-gray-4">Netlify、Vercel、Cloudflare Pages</span>
        </div>
        <div class="flex items-start">
          <span class="font-semibold text-orange-500 w-32">動的アプリ:</span>
          <span class="text-gray-6 dark:text-gray-4">Vercel、Railway、Fly.io</span>
        </div>
        <div class="flex items-start">
          <span class="font-semibold text-orange-500 w-32">エンタープライズ:</span>
          <span class="text-gray-6 dark:text-gray-4">AWS、Google Cloud、Azure</span>
        </div>
      </div>
    </div>
  </div>

  <div class="p-6 border border-gray-2 dark:border-gray-7 rounded-lg shadow-sm hover:shadow-md transition-shadow">
    <h3 class="font-bold text-lg mb-3 flex items-center">
      <span class="text-2xl mr-2">Q:</span>
      SEO対策は十分？
    </h3>
    <div class="space-y-3">
      <p class="text-gray-7 dark:text-gray-3 font-semibold">
        A: はい、完全対応しています。
      </p>
      <div class="space-y-2">
        <div class="flex items-center">
          <span class="text-green-500 font-bold mr-2">✅</span>
          <span class="text-gray-6 dark:text-gray-4">SSR/SSGによる事前レンダリング</span>
        </div>
        <div class="flex items-center">
          <span class="text-green-500 font-bold mr-2">✅</span>
          <span class="text-gray-6 dark:text-gray-4">メタタグの動的生成</span>
        </div>
        <div class="flex items-center">
          <span class="text-green-500 font-bold mr-2">✅</span>
          <span class="text-gray-6 dark:text-gray-4">構造化データのサポート</span>
        </div>
        <div class="flex items-center">
          <span class="text-green-500 font-bold mr-2">✅</span>
          <span class="text-gray-6 dark:text-gray-4">サイトマップ自動生成</span>
        </div>
      </div>
    </div>
  </div>

  <div class="p-6 border border-gray-2 dark:border-gray-7 rounded-lg shadow-sm hover:shadow-md transition-shadow">
    <h3 class="font-bold text-lg mb-3 flex items-center">
      <span class="text-2xl mr-2">Q:</span>
      大規模プロジェクトに向いている？
    </h3>
    <div class="space-y-3">
      <p class="text-gray-7 dark:text-gray-3 font-semibold">
        A: 中〜大規模プロジェクトに最適です。
      </p>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
        <div>
          <span class="font-semibold text-orange-500">モノレポ対応:</span>
          <span class="text-gray-6 dark:text-gray-4 ml-2">pnpm workspaces対応</span>
        </div>
        <div>
          <span class="font-semibold text-orange-500">型安全性:</span>
          <span class="text-gray-6 dark:text-gray-4 ml-2">TypeScript完全統合</span>
        </div>
        <div>
          <span class="font-semibold text-orange-500">テスト:</span>
          <span class="text-gray-6 dark:text-gray-4 ml-2">Vitest、Playwright統合</span>
        </div>
        <div>
          <span class="font-semibold text-orange-500">CI/CD:</span>
          <span class="text-gray-6 dark:text-gray-4 ml-2">GitHub Actions、GitLab CI対応</span>
        </div>
      </div>
    </div>
  </div>
</div>

## 開発のベストプラクティス

### プロジェクト構成
```
src/
├── routes/           # ページとAPI
├── lib/
│   ├── components/   # 共有コンポーネント
│   ├── server/       # サーバー専用
│   └── stores/       # グローバルストア
├── hooks.server.ts   # ミドルウェア
└── app.d.ts          # 型定義
```

### パフォーマンスチェックリスト
- [ ] 画像の最適化（@sveltejs/enhanced-img）
- [ ] コード分割の適切な実装
- [ ] プリロード・プリフェッチの活用
- [ ] キャッシュヘッダーの設定
- [ ] Critical CSSのインライン化

## 次のステップ

**基礎から始める方**:
[概要とアーキテクチャ](/sveltekit/basics/overview/)でSvelteKitの全体像を理解

**すぐに実装したい方**:
[ルーティング](/sveltekit/routing/)で実践的な実装を開始

**特定の機能を学びたい方**:
上記の学習ロードマップから必要なセクションを選択

**Svelteから来た方**:
[プロジェクト構造](/sveltekit/basics/project-structure/)でファイル規約を理解

---

:::tip[学習のコツ]
SvelteKitは「規約重視」のフレームワークです。まずファイル構造と命名規約を理解することが、効率的な学習の鍵となります。
:::

:::info[TypeScript推奨]
このガイドは全てTypeScriptで記述されています。型安全性を最大限活用することで、エンタープライズレベルの堅牢なアプリケーションが構築できます。
:::

:::warning[Svelte 5前提]
このガイドはSvelte 5とSvelteKit 2.x以降を前提としています。古いバージョンを使用している場合は、まず[Svelte 5完全ガイド](/svelte/)で最新のRunesシステムを学習してください。
:::