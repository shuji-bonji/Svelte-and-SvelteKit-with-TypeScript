---
title: 実装例一覧
description: 実践的なアプリケーション開発例
---

<script>
  import { base } from '$app/paths';
</script>

## 実際のアプリケーション開発

このセクションでは、実際のアプリケーション開発を通じて、Svelte 5とSvelteKitの実践的な使い方を学びます。

## プロジェクト一覧

<div class="grid grid-cols-1 md:grid-cols-2 gap-4 my-8 auto-rows-[1fr]">
  <a href="{base}/examples/todo-app/" class="flex no-underline group h-full">
    <div class="p-4 border border-gray-2 dark:border-gray-7 rounded-lg shadow-md hover:shadow-lg hover:border-pink-400 dark:hover:border-pink-400 transition-all cursor-pointer flex flex-col w-full">
      <div class="text-3xl mb-2">📝</div>
      <h3 class="font-bold text-lg mb-2 text-pink-600 dark:text-pink-400 group-hover:text-pink-700 dark:group-hover:text-pink-300 transition-colors">
        TODOアプリ
        <span class="inline-block ml-1 text-xs opacity-60">→</span>
      </h3>
      <p class="text-sm mb-3 text-gray-7 dark:text-gray-3">基本的なCRUD操作とリアクティビティ</p>
      <ul class="text-sm text-gray-6 dark:text-gray-4 space-y-1 flex-grow">
        <li>Runesを使った状態管理</li>
        <li>ローカルストレージとの連携</li>
        <li>TypeScriptでの型定義</li>
      </ul>
      <div class="mt-3 p-2 bg-gray-1 dark:bg-gray-8 rounded">
        <code class="text-xs">
          type Todo = {'{'} id: string; text: string; done: boolean; {'}'}
        </code>
      </div>
    </div>
  </a>
  
  <a href="{base}/examples/auth-system/" class="flex no-underline group h-full">
    <div class="p-4 border border-gray-2 dark:border-gray-7 rounded-lg shadow-md hover:shadow-lg hover:border-pink-400 dark:hover:border-pink-400 transition-all cursor-pointer flex flex-col w-full">
      <div class="text-3xl mb-2">🔐</div>
      <h3 class="font-bold text-lg mb-2 text-pink-600 dark:text-pink-400 group-hover:text-pink-700 dark:group-hover:text-pink-300 transition-colors">
        認証システム
        <span class="inline-block ml-1 text-xs opacity-60">→</span>
      </h3>
      <p class="text-sm mb-3 text-gray-7 dark:text-gray-3">セキュアな認証フローの実装</p>
      <ul class="text-sm text-gray-6 dark:text-gray-4 space-y-1 flex-grow">
        <li>JWTトークンの管理</li>
        <li>Protected Routes</li>
        <li>セッション管理</li>
      </ul>
    </div>
  </a>
  
  <a href="{base}/examples/data-fetching/" class="flex no-underline group h-full">
    <div class="p-4 border border-gray-2 dark:border-gray-7 rounded-lg shadow-md hover:shadow-lg hover:border-pink-400 dark:hover:border-pink-400 transition-all cursor-pointer flex flex-col w-full">
      <div class="text-3xl mb-2">📊</div>
      <h3 class="font-bold text-lg mb-2 text-pink-600 dark:text-pink-400 group-hover:text-pink-700 dark:group-hover:text-pink-300 transition-colors">
        データフェッチング
        <span class="inline-block ml-1 text-xs opacity-60">→</span>
      </h3>
      <p class="text-sm mb-3 text-gray-7 dark:text-gray-3">効率的なデータ取得パターン</p>
      <ul class="text-sm text-gray-6 dark:text-gray-4 space-y-1 flex-grow">
        <li>Load関数の活用</li>
        <li>ストリーミングSSR</li>
        <li>エラーハンドリング</li>
      </ul>
    </div>
  </a>
  
  <a href="{base}/examples/websocket/" class="flex no-underline group h-full">
    <div class="p-4 border border-gray-2 dark:border-gray-7 rounded-lg shadow-md hover:shadow-lg hover:border-pink-400 dark:hover:border-pink-400 transition-all cursor-pointer flex flex-col w-full">
      <div class="text-3xl mb-2">🔌</div>
      <h3 class="font-bold text-lg mb-2 text-pink-600 dark:text-pink-400 group-hover:text-pink-700 dark:group-hover:text-pink-300 transition-colors">
        WebSocket実装
        <span class="inline-block ml-1 text-xs opacity-60">→</span>
      </h3>
      <p class="text-sm mb-3 text-gray-7 dark:text-gray-3">リアルタイム通信の実装</p>
      <ul class="text-sm text-gray-6 dark:text-gray-4 space-y-1 flex-grow">
        <li>WebSocket接続管理</li>
        <li>リアルタイムアップデート</li>
        <li>再接続ロジック</li>
      </ul>
    </div>
  </a>
</div>

## 各実装例で学べること

### 共通して学べる内容

- TypeScriptでの型安全な実装
- Svelte 5 Runesの実践的な使用
- エラーハンドリングとバリデーション
- パフォーマンス最適化

### プロジェクト構造

```
src/
├── lib/
│   ├── components/  # 再利用可能コンポーネント
│   ├── stores/      # グローバル状態管理
│   └── utils/       # ユーティリティ関数
├── routes/
│   └── (app)/       # アプリケーションルート
└── app.d.ts         # グローバル型定義
```

## 前提知識

実装例を最大限活用するために、以下の内容を理解しておくことをお勧めします。

- <a href="{base}/svelte/runes/" class="text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 underline decoration-pink-300 dark:decoration-pink-600 decoration-2 underline-offset-2 transition-colors">Runesシステム</a> - Runesシステムの基本
- <a href="{base}/svelte/advanced/" class="text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 underline decoration-pink-300 dark:decoration-pink-600 decoration-2 underline-offset-2 transition-colors">実践編</a> - 高度なパターン
- <a href="{base}/sveltekit/" class="text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 underline decoration-pink-300 dark:decoration-pink-600 decoration-2 underline-offset-2 transition-colors">SvelteKit</a> - フレームワークの基本

## 次のステップ

<a href="{base}/examples/todo-app/" class="text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 underline decoration-pink-300 dark:decoration-pink-600 decoration-2 underline-offset-2 transition-colors">TODOアプリ</a>から始めて、段階的に複雑なアプリケーションに挑戦しましょう。