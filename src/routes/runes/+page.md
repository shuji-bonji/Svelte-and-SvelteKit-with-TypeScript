---
title: Runesシステム
description: Svelte 5の新しいリアクティビティシステム
---

<script>
  import { base } from '$app/paths';
</script>

Svelte 5で導入されたRunesシステムは、リアクティビティをより明示的で予測可能にする新しいプリミティブです。従来の暗黙的なリアクティビティから、明示的な宣言へと進化し、TypeScriptとの統合も大幅に改善されました。

## Runesシステムとは

Runesは、Svelte 5の中核となる新しいリアクティビティAPIです。`$`記号で始まる特別な関数として提供され、コンパイル時に最適化されたコードに変換されます。これにより、より直感的で型安全なリアクティブプログラミングが可能になりました。

## このセクションで学ぶこと

<div class="grid grid-cols-1 md:grid-cols-2 gap-4 my-8">
  <div class="p-4 border border-gray-2 dark:border-gray-7 rounded-lg shadow-md hover:shadow-lg hover:border-pink-400 dark:hover:border-pink-400 transition-all group">
    <div class="text-3xl mb-2">🎯</div>
    <h3 class="font-bold text-lg mb-2">
      <a href="{base}/runes/runes-introduction/" class="text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 underline decoration-pink-300 dark:decoration-pink-600 decoration-2 underline-offset-2 transition-colors">
        Runesシステム入門
      </a>
    </h3>
    <p class="text-sm mb-3">Runesの基本概念と従来のリアクティビティとの違いを理解します。</p>
    <ul class="text-sm text-gray-6 dark:text-gray-4 space-y-1">
      <li>なぜRunesが必要なのか</li>
      <li>Svelte 4からの移行</li>
      <li>基本的な構文と動作原理</li>
    </ul>
  </div>
  
  <div class="p-4 border border-gray-2 dark:border-gray-7 rounded-lg shadow-md hover:shadow-lg hover:border-pink-400 dark:hover:border-pink-400 transition-all group">
    <div class="text-3xl mb-2">💾</div>
    <h3 class="font-bold text-lg mb-2">
      <a href="{base}/runes/state/" class="text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 underline decoration-pink-300 dark:decoration-pink-600 decoration-2 underline-offset-2 transition-colors">
        $stateルーン
      </a>
    </h3>
    <p class="text-sm mb-3">リアクティブな状態を宣言する最も基本的なルーンを学びます。</p>
    <ul class="text-sm text-gray-6 dark:text-gray-4 space-y-1">
      <li>基本的な値の状態管理</li>
      <li>オブジェクトと配列の扱い</li>
      <li>深いリアクティビティ</li>
      <li>TypeScriptとの統合</li>
    </ul>
  </div>
  
  <div class="p-4 border border-gray-2 dark:border-gray-7 rounded-lg shadow-md hover:shadow-lg hover:border-pink-400 dark:hover:border-pink-400 transition-all group">
    <div class="text-3xl mb-2">🔄</div>
    <h3 class="font-bold text-lg mb-2">
      <a href="{base}/runes/derived/" class="text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 underline decoration-pink-300 dark:decoration-pink-600 decoration-2 underline-offset-2 transition-colors">
        $derivedルーン
      </a>
    </h3>
    <p class="text-sm mb-3">他の値から自動的に計算される派生値を作成します。</p>
    <ul class="text-sm text-gray-6 dark:text-gray-4 space-y-1">
      <li>計算プロパティの定義</li>
      <li>複数の依存関係</li>
      <li>メモ化と最適化</li>
      <li>非同期派生値</li>
    </ul>
  </div>
  
  <div class="p-4 border border-gray-2 dark:border-gray-7 rounded-lg shadow-md hover:shadow-lg hover:border-pink-400 dark:hover:border-pink-400 transition-all group">
    <div class="text-3xl mb-2">⚡</div>
    <h3 class="font-bold text-lg mb-2">
      <a href="{base}/runes/effect/" class="text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 underline decoration-pink-300 dark:decoration-pink-600 decoration-2 underline-offset-2 transition-colors">
        $effectルーン
      </a>
    </h3>
    <p class="text-sm mb-3">リアクティブな値の変更に応じて副作用を実行します。</p>
    <ul class="text-sm text-gray-6 dark:text-gray-4 space-y-1">
      <li>副作用の自動実行</li>
      <li>クリーンアップ処理</li>
      <li>依存関係の自動追跡</li>
      <li>実行タイミングの制御</li>
    </ul>
  </div>
  
  <div class="p-4 border border-gray-2 dark:border-gray-7 rounded-lg shadow-md hover:shadow-lg hover:border-pink-400 dark:hover:border-pink-400 transition-all group">
    <div class="text-3xl mb-2">📦</div>
    <h3 class="font-bold text-lg mb-2">
      <a href="{base}/runes/props/" class="text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 underline decoration-pink-300 dark:decoration-pink-600 decoration-2 underline-offset-2 transition-colors">
        $propsルーン
      </a>
    </h3>
    <p class="text-sm mb-3">コンポーネントのプロパティを型安全に定義します。</p>
    <ul class="text-sm text-gray-6 dark:text-gray-4 space-y-1">
      <li>Props の宣言と型定義</li>
      <li>デフォルト値の設定</li>
      <li>分割代入とrest props</li>
      <li>TypeScript統合</li>
    </ul>
  </div>
  
  <div class="p-4 border border-gray-2 dark:border-gray-7 rounded-lg shadow-md hover:shadow-lg hover:border-pink-400 dark:hover:border-pink-400 transition-all group">
    <div class="text-3xl mb-2">🔗</div>
    <h3 class="font-bold text-lg mb-2">
      <a href="{base}/runes/bindable/" class="text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 underline decoration-pink-300 dark:decoration-pink-600 decoration-2 underline-offset-2 transition-colors">
        $bindableルーン
      </a>
    </h3>
    <p class="text-sm mb-3">親子コンポーネント間で双方向バインディングを実現します。</p>
    <ul class="text-sm text-gray-6 dark:text-gray-4 space-y-1">
      <li>双方向データフロー</li>
      <li>フォーム要素との連携</li>
      <li>カスタムコンポーネントでの使用</li>
      <li>バインディングの制約</li>
    </ul>
  </div>
</div>

## 基本的な使い方

```typescript
// カウンターの例
let count = $state(0);
let doubled = $derived(count * 2);

$effect(() => {
  console.log(`現在のカウント: ${count}`);
});

function increment() {
  count++;
}
```

## TypeScriptとの組み合わせ

```typescript
// 型定義付きの状態
let user = $state<{ name: string; age: number }>({
  name: '太郎',
  age: 25
});

// 計算プロパティ
let isAdult = $derived(user.age >= 20);
```

## 学習の流れ

1. [Runesシステム入門](/runes/runes-introduction/) - 基本概念の理解
2. 各Runeの詳細な学習
3. 実践的な使用例

## 次のステップ

[Runesシステム入門](/runes/runes-introduction/)で、Runesの基本概念から学び始めましょう。