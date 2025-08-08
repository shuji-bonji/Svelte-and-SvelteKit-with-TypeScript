---
title: 実装例一覧
description: 実践的なアプリケーション開発例
---

## 実際のアプリケーション開発

このセクションでは、実際のアプリケーション開発を通じて、Svelte 5とSvelteKitの実践的な使い方を学びます。

## プロジェクト一覧

### 1. [TODOアプリ](/examples/todo-app/)

基本的なCRUD操作とリアクティビティ

- Runesを使った状態管理
- ローカルストレージとの連携
- TypeScriptでの型定義

```typescript
type Todo = {
  id: string;
  text: string;
  done: boolean;
};

let todos = $state<Todo[]>([]);
```

### 2. [認証システム](/examples/auth-system/)

セキュアな認証フローの実装

- JWTトークンの管理
- Protected Routes
- セッション管理

### 3. [データフェッチング](/examples/data-fetching/)

効率的なデータ取得パターン

- Load関数の活用
- ストリーミングSSR
- エラーハンドリング

### 4. [WebSocket実装](/examples/websocket/)

リアルタイム通信の実装

- WebSocket接続管理
- リアルタイムアップデート
- 再接続ロジック

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

実装例を最大限活用するために、以下の内容を理解しておくことをお勧めします：

- [基礎編](/basics/) - Runesシステムの基本
- [実践編](/advanced/) - 高度なパターン
- [SvelteKit](/sveltekit/) - フレームワークの基本

## 次のステップ

[TODOアプリ](/examples/todo-app/)から始めて、段階的に複雑なアプリケーションに挑戦しましょう。