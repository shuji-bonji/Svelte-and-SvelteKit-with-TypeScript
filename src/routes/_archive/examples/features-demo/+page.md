---
title: SveltePress機能デモ
description: SveltePressの豊富な機能を紹介
---

## カードレイアウト

<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 my-8">
  <div class="p-4 border border-gray-2 dark:border-gray-7 rounded-lg shadow-md hover:shadow-lg transition-shadow">
    <div class="text-3xl mb-2">🚀</div>
    <h3 class="font-bold text-lg mb-2">高速</h3>
    <p class="text-sm text-gray-5 dark:text-gray-4">Viteによる高速な開発体験とビルド</p>
  </div>
  <div class="p-4 border border-gray-2 dark:border-gray-7 rounded-lg shadow-md hover:shadow-lg transition-shadow">
    <div class="text-3xl mb-2">📝</div>
    <h3 class="font-bold text-lg mb-2">Markdown</h3>
    <p class="text-sm text-gray-5 dark:text-gray-4">拡張Markdown記法でリッチなコンテンツ</p>
  </div>
  <div class="p-4 border border-gray-2 dark:border-gray-7 rounded-lg shadow-md hover:shadow-lg transition-shadow">
    <div class="text-3xl mb-2">🎨</div>
    <h3 class="font-bold text-lg mb-2">カスタマイズ</h3>
    <p class="text-sm text-gray-5 dark:text-gray-4">テーマとスタイルを自由にカスタマイズ</p>
  </div>
</div>

## アラートボックス

:::tip ヒント
SveltePressは様々なアラートボックスをサポートしています。
:::

:::warning 注意
この機能は実験的です。
:::

:::important 重要
必ず最新バージョンを使用してください。
:::

## コードグループ（タブ）

```js [JavaScript]
// JavaScript版
function greet(name) {
  return `Hello, ${name}!`;
}
```

```ts [TypeScript]
// TypeScript版
function greet(name: string): string {
  return `Hello, ${name}!`;
}
```

## インラインコンポーネント

<div class="flex items-center gap-2 p-4 bg-gradient-to-r from-pink-400 to-yellow-400 text-white rounded-lg my-4">
  <span class="text-2xl">✨</span>
  <span class="font-bold">グラデーション背景のカスタムコンポーネント</span>
</div>

## ボタンコレクション

<div class="flex flex-wrap gap-2 my-4">
  <button class="px-4 py-2 bg-svp-primary text-white rounded hover:opacity-80 transition">
    プライマリ
  </button>
  <button class="px-4 py-2 border border-svp-primary text-svp-primary rounded hover:bg-svp-primary hover:text-white transition">
    アウトライン
  </button>
  <button class="px-4 py-2 bg-gray-2 dark:bg-gray-7 rounded hover:opacity-80 transition">
    セカンダリ
  </button>
</div>

## プログレスバー

<div class="my-4">
  <div class="w-full bg-gray-2 dark:bg-gray-7 rounded-full h-2">
    <div class="bg-gradient-to-r from-pink-400 to-yellow-400 h-2 rounded-full" style="width: 75%"></div>
  </div>
  <p class="text-sm text-gray-5 mt-2">進捗: 75%</p>
</div>

## バッジ

<div class="flex gap-2 my-4">
  <span class="px-2 py-1 bg-green-4 text-white text-xs rounded">完了</span>
  <span class="px-2 py-1 bg-yellow-4 text-white text-xs rounded">進行中</span>
  <span class="px-2 py-1 bg-red-4 text-white text-xs rounded">未着手</span>
  <span class="px-2 py-1 bg-blue-4 text-white text-xs rounded">レビュー中</span>
</div>

## アコーディオン風セクション

<details class="border border-gray-2 dark:border-gray-7 rounded-lg p-4 my-4">
  <summary class="cursor-pointer font-bold hover:text-svp-primary transition">
    クリックして詳細を表示
  </summary>
  <div class="mt-4 pl-4 border-l-2 border-svp-primary">
    <p>ここに詳細な内容が表示されます。</p>
    <p>HTMLの`details`要素を使用した簡単な実装です。</p>
  </div>
</details>

## 統計カード

<div class="grid grid-cols-2 sm:grid-cols-4 gap-4 my-8">
  <div class="text-center p-4 border border-gray-2 dark:border-gray-7 rounded-lg">
    <div class="text-3xl font-bold text-svp-primary">100+</div>
    <div class="text-sm text-gray-5">コンポーネント</div>
  </div>
  <div class="text-center p-4 border border-gray-2 dark:border-gray-7 rounded-lg">
    <div class="text-3xl font-bold text-svp-primary">5ms</div>
    <div class="text-sm text-gray-5">ビルド時間</div>
  </div>
  <div class="text-center p-4 border border-gray-2 dark:border-gray-7 rounded-lg">
    <div class="text-3xl font-bold text-svp-primary">TypeScript</div>
    <div class="text-sm text-gray-5">完全対応</div>
  </div>
  <div class="text-center p-4 border border-gray-2 dark:border-gray-7 rounded-lg">
    <div class="text-3xl font-bold text-svp-primary">PWA</div>
    <div class="text-sm text-gray-5">対応可能</div>
  </div>
</div>