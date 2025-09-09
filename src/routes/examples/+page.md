---
title: 実装例一覧
description: Svelte5とSvelteKitをTypeScriptで実装する実践例集。TODOアプリ、認証システム、データフェッチング、WebSocket通信などの完全動作サンプル
---

<script>
  import { base } from '$app/paths';
</script>

このセクションでは、実際のアプリケーション開発を通じて、Svelte 5とSvelteKitの実践的な使い方を学びます。各実装例は完全に動作するコードと詳細な解説を含み、実際のプロジェクトに適用できる実践的な知識を提供します。

## プロジェクト一覧

<div class="grid grid-cols-1 md:grid-cols-2 gap-4 my-8 auto-rows-[1fr]">
  <a href="{base}/examples/blog-system/" class="flex no-underline group h-full">
    <div class="p-4 border border-gray-2 dark:border-gray-7 rounded-lg shadow-md hover:shadow-lg hover:border-pink-400 dark:hover:border-pink-400 transition-all cursor-pointer flex flex-col w-full">
      <div class="text-3xl mb-2">📖</div>
      <h3 class="font-bold text-lg mb-2 text-pink-600 dark:text-pink-400 group-hover:text-pink-700 dark:group-hover:text-pink-300 transition-colors">
        ブログシステム
        <span class="inline-block ml-1 text-xs opacity-60">→</span>
      </h3>
      <p class="text-sm mb-3 text-gray-7 dark:text-gray-3">最小構成のブログシステム実装</p>
      <ul class="text-sm text-gray-6 dark:text-gray-4 space-y-1 flex-grow">
        <li>ファイルベースルーティング</li>
        <li>動的ルート（[slug]）</li>
        <li>レイアウトシステム</li>
        <li>ナビゲーションコンポーネント</li>
      </ul>
      <div class="mt-3 p-2 bg-gray-1 dark:bg-gray-8 rounded">
        <code class="text-xs">
          /blog/[slug] → 個別記事ページ
        </code>
      </div>
    </div>
  </a>
  
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
        認証システム実装ガイド
        <span class="inline-block ml-1 text-xs opacity-60">→</span>
      </h3>
      <p class="text-sm mb-3 text-gray-7 dark:text-gray-3">3つの認証パターンの完全ガイド</p>
      <ul class="text-sm text-gray-6 dark:text-gray-4 space-y-1 flex-grow">
        <li>Cookie/Session認証（✅実装済）</li>
        <li>JWT認証（📖設計済）</li>
        <li>ルートグループ認証（📝計画中）</li>
        <li>認証方式の比較と選択</li>
      </ul>
      <div class="mt-3 p-2 bg-gray-1 dark:bg-gray-8 rounded">
        <code class="text-xs">
          hooks.server.ts + Form Actions
        </code>
      </div>
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

## 認証システム実装例

認証システムは、現代のWebアプリケーションにおいて最も重要な機能の一つです。以下の3つの実装パターンを詳細に解説しています。

<div class="grid grid-cols-1 md:grid-cols-3 gap-4 my-8">
  <a href="{base}/examples/auth-cookie-session/" class="flex no-underline group">
    <div class="p-4 border-2 border-green-500 dark:border-green-400 rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer flex flex-col w-full bg-green-50 dark:bg-green-900/20">
      <div class="text-2xl mb-2">🍪</div>
      <h4 class="font-bold text-md mb-2 text-green-700 dark:text-green-300">
        Cookie/Session認証
        <span class="ml-2 text-xs bg-green-600 text-white px-2 py-1 rounded">✅ 完成</span>
      </h4>
      <p class="text-sm text-gray-6 dark:text-gray-4 flex-grow">
        最も安全で実装しやすい認証方式。HTTPOnlyクッキーとサーバーサイドセッション管理。
      </p>
    </div>
  </a>
  
  <a href="{base}/examples/auth-jwt/" class="flex no-underline group">
    <div class="p-4 border-2 border-yellow-500 dark:border-yellow-400 rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer flex flex-col w-full bg-yellow-50 dark:bg-yellow-900/20">
      <div class="text-2xl mb-2">🎫</div>
      <h4 class="font-bold text-md mb-2 text-yellow-700 dark:text-yellow-300">
        JWT認証
        <span class="ml-2 text-xs bg-yellow-600 text-white px-2 py-1 rounded">⏳ 準備中</span>
      </h4>
      <p class="text-sm text-gray-6 dark:text-gray-4 flex-grow">
        ステートレスなトークンベース認証。マイクロサービスやAPIに最適。
      </p>
    </div>
  </a>
  
  <a href="{base}/examples/auth-route-groups/" class="flex no-underline group">
    <div class="p-4 border-2 border-blue-500 dark:border-blue-400 rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer flex flex-col w-full bg-blue-50 dark:bg-blue-900/20">
      <div class="text-2xl mb-2">📁</div>
      <h4 class="font-bold text-md mb-2 text-blue-700 dark:text-blue-300">
        ルートグループ認証
        <span class="ml-2 text-xs bg-blue-600 text-white px-2 py-1 rounded">📝 計画中</span>
      </h4>
      <p class="text-sm text-gray-6 dark:text-gray-4 flex-grow">
        SvelteKitのルートグループを活用した構造的な認証境界の実装
      </p>
    </div>
  </a>
</div>

## 各実装例で学べること

### 共通して学べる内容

- **TypeScriptでの型安全な実装** - すべてのコード例で厳密な型定義を提供
- **Svelte 5 Runesの実践的な使用** - $state、$derived、$effectを活用した状態管理
- **エラーハンドリングとバリデーション** - 堅牢なアプリケーションの構築方法
- **パフォーマンス最適化** - SSR/SSG、コード分割、遅延ローディング
- **セキュリティベストプラクティス** - XSS、CSRF対策の実装

### 推奨プロジェクト構造

各実装例では、以下の標準的なプロジェクト構造を採用しています。

```
src/
├── lib/
│   ├── components/      # 再利用可能コンポーネント
│   │   ├── ui/         # UIコンポーネント
│   │   └── features/   # 機能別コンポーネント
│   ├── stores/         # グローバル状態管理（.svelte.ts）
│   ├── server/         # サーバーサイド専用コード
│   │   ├── auth.ts     # 認証ユーティリティ
│   │   └── db.ts       # データベース接続
│   └── utils/          # ユーティリティ関数
├── routes/
│   ├── (public)/       # 公開ルート
│   ├── (auth)/         # 認証必須ルート
│   └── api/            # APIエンドポイント
├── app.d.ts            # グローバル型定義
├── app.html            # HTMLテンプレート
└── hooks.server.ts     # サーバーフック

## 前提知識

実装例を最大限活用するために、以下の内容を理解しておくことをお勧めします。

### 必須の知識
- <a href="{base}/svelte/basics/" class="text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 underline decoration-pink-300 dark:decoration-pink-600 decoration-2 underline-offset-2 transition-colors">Svelteの基本</a> - コンポーネントとテンプレート構文
- <a href="{base}/svelte/runes/" class="text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 underline decoration-pink-300 dark:decoration-pink-600 decoration-2 underline-offset-2 transition-colors">Runesシステム</a> - Svelte 5の新しいリアクティビティ
- <a href="{base}/introduction/typescript-setup/" class="text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 underline decoration-pink-300 dark:decoration-pink-600 decoration-2 underline-offset-2 transition-colors">TypeScript基礎</a> - 型システムの理解

### 推奨される知識
- <a href="{base}/sveltekit/basics/" class="text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 underline decoration-pink-300 dark:decoration-pink-600 decoration-2 underline-offset-2 transition-colors">SvelteKit基礎</a> - ルーティングとSSR
- <a href="{base}/svelte/advanced/" class="text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 underline decoration-pink-300 dark:decoration-pink-600 decoration-2 underline-offset-2 transition-colors">実践編</a> - 高度なパターン

## 学習の進め方

### 初心者向けパス
1. **基礎を固める** - <a href="{base}/examples/todo-app/" class="text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 underline decoration-pink-300 dark:decoration-pink-600 decoration-2 underline-offset-2 transition-colors">TODOアプリ</a>でSvelte 5の基本を習得
2. **ルーティングを学ぶ** - <a href="{base}/examples/blog-system/" class="text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 underline decoration-pink-300 dark:decoration-pink-600 decoration-2 underline-offset-2 transition-colors">ブログシステム</a>でSvelteKitのルーティング
3. **認証を実装** - <a href="{base}/examples/auth-cookie-session/" class="text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 underline decoration-pink-300 dark:decoration-pink-600 decoration-2 underline-offset-2 transition-colors">Cookie/Session認証</a>でセキュアな認証

### 中級者向けパス
1. **データ管理** - <a href="{base}/examples/data-fetching/" class="text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 underline decoration-pink-300 dark:decoration-pink-600 decoration-2 underline-offset-2 transition-colors">データフェッチング</a>で効率的なデータ取得
2. **リアルタイム機能** - <a href="{base}/examples/websocket/" class="text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 underline decoration-pink-300 dark:decoration-pink-600 decoration-2 underline-offset-2 transition-colors">WebSocket実装</a>でリアルタイム通信
3. **高度な認証** - JWT認証やルートグループ認証（準備中）

## 実装のヒント

:::tip[成功のポイント]
- **段階的に学習** - 簡単な例から始めて徐々に複雑な実装へ
- **コードを実際に書く** - 読むだけでなく実際に手を動かす
- **型定義を活用** - TypeScriptの型システムを最大限活用
- **公式ドキュメント参照** - 最新の情報は公式ドキュメントで確認
:::

## 外部リソース

### GitHubリポジトリ
実装例の完全なソースコードは以下で公開しています。
- [svelte5-blog-example](https://github.com/shuji-bonji/svelte5-blog-example) - ブログシステム
- [svelte5-auth-basic](https://github.com/shuji-bonji/svelte5-auth-basic) - 認証システム（開発中）

### 参考ドキュメント
- [Svelte 5公式ドキュメント](https://svelte.dev/docs)
- [SvelteKit公式ドキュメント](https://kit.svelte.dev/docs)
- [TypeScript公式ドキュメント](https://www.typescriptlang.org/docs/)