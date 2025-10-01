---
title: Runesシステム
description: Svelte5のRunesシステムをTypeScriptで完全マスター - $state、$derived、$effect、$props、$bindable、$inspect、$hostによるリアクティビティの新パラダイム、使い方を実例を交えて体系的かつ実践的に詳しく解説します
---

<script>
  import { base } from '$app/paths';
</script>

Svelte 5で導入されたRunesシステムは、リアクティビティをより明示的で予測可能にする新しいプリミティブです。従来の暗黙的なリアクティビティから、明示的な宣言へと進化し、TypeScriptとの統合も大幅に改善されました。

## Runesシステムとは

Runesは、Svelte 5の中核となる新しいリアクティビティAPIです。`$`記号で始まる特別な関数として提供され、コンパイル時に最適化されたコードに変換されます。これにより、より直感的で型安全なリアクティブプログラミングが可能になりました。

## このセクションで学ぶこと

<div class="grid grid-cols-1 md:grid-cols-2 gap-4 my-8 auto-rows-[1fr]">
  <a href="{base}/svelte/runes/runes-introduction/" class="flex no-underline group h-full">
    <div class="p-4 border border-gray-2 dark:border-gray-7 rounded-lg shadow-md hover:shadow-lg hover:border-pink-400 dark:hover:border-pink-400 transition-all cursor-pointer flex flex-col w-full">
      <div class="text-3xl mb-2">🎯</div>
      <h3 class="font-bold text-lg mb-2 text-pink-600 dark:text-pink-400 group-hover:text-pink-700 dark:group-hover:text-pink-300 transition-colors">
        Runesシステム入門
        <span class="inline-block ml-1 text-xs opacity-60">→</span>
      </h3>
      <p class="text-sm mb-3 text-gray-7 dark:text-gray-3">Runesの基本概念と従来のリアクティビティとの違いを理解します。</p>
      <ul class="text-sm text-gray-6 dark:text-gray-4 space-y-1 flex-grow">
        <li>なぜRunesが必要なのか</li>
        <li>Svelte 4からの移行</li>
        <li>基本的な構文と動作原理</li>
      </ul>
    </div>
  </a>
  
  <a href="{base}/svelte/runes/state/" class="flex no-underline group h-full">
    <div class="p-4 border border-gray-2 dark:border-gray-7 rounded-lg shadow-md hover:shadow-lg hover:border-pink-400 dark:hover:border-pink-400 transition-all cursor-pointer flex flex-col w-full">
      <div class="text-3xl mb-2">💾</div>
      <h3 class="font-bold text-lg mb-2 text-pink-600 dark:text-pink-400 group-hover:text-pink-700 dark:group-hover:text-pink-300 transition-colors">
        $stateルーン
        <span class="inline-block ml-1 text-xs opacity-60">→</span>
      </h3>
      <p class="text-sm mb-3 text-gray-7 dark:text-gray-3">リアクティブな状態を宣言する最も基本的なルーンを学びます。</p>
      <ul class="text-sm text-gray-6 dark:text-gray-4 space-y-1 flex-grow">
        <li>基本的な値の状態管理</li>
        <li>オブジェクトと配列の扱い</li>
        <li>深いリアクティビティ</li>
        <li>TypeScriptとの統合</li>
      </ul>
    </div>
  </a>
  
  <a href="{base}/svelte/runes/derived/" class="flex no-underline group h-full">
    <div class="p-4 border border-gray-2 dark:border-gray-7 rounded-lg shadow-md hover:shadow-lg hover:border-pink-400 dark:hover:border-pink-400 transition-all cursor-pointer flex flex-col w-full">
      <div class="text-3xl mb-2">🔄</div>
      <h3 class="font-bold text-lg mb-2 text-pink-600 dark:text-pink-400 group-hover:text-pink-700 dark:group-hover:text-pink-300 transition-colors">
        $derivedルーン
        <span class="inline-block ml-1 text-xs opacity-60">→</span>
      </h3>
      <p class="text-sm mb-3 text-gray-7 dark:text-gray-3">他の値から自動的に計算される派生値を作成します。</p>
      <ul class="text-sm text-gray-6 dark:text-gray-4 space-y-1 flex-grow">
        <li>計算プロパティの定義</li>
        <li>複数の依存関係</li>
        <li>メモ化と最適化</li>
        <li>非同期派生値</li>
      </ul>
    </div>
  </a>
  
  <a href="{base}/svelte/runes/effect/" class="flex no-underline group h-full">
    <div class="p-4 border border-gray-2 dark:border-gray-7 rounded-lg shadow-md hover:shadow-lg hover:border-pink-400 dark:hover:border-pink-400 transition-all cursor-pointer flex flex-col w-full">
      <div class="text-3xl mb-2">⚡</div>
      <h3 class="font-bold text-lg mb-2 text-pink-600 dark:text-pink-400 group-hover:text-pink-700 dark:group-hover:text-pink-300 transition-colors">
        $effectルーン
        <span class="inline-block ml-1 text-xs opacity-60">→</span>
      </h3>
      <p class="text-sm mb-3 text-gray-7 dark:text-gray-3">リアクティブな値の変更に応じて副作用を実行します。</p>
      <ul class="text-sm text-gray-6 dark:text-gray-4 space-y-1 flex-grow">
        <li>副作用の自動実行</li>
        <li>クリーンアップ処理</li>
        <li>依存関係の自動追跡</li>
        <li>実行タイミングの制御</li>
      </ul>
    </div>
  </a>
  
  <a href="{base}/svelte/runes/props/" class="flex no-underline group h-full">
    <div class="p-4 border border-gray-2 dark:border-gray-7 rounded-lg shadow-md hover:shadow-lg hover:border-pink-400 dark:hover:border-pink-400 transition-all cursor-pointer flex flex-col w-full">
      <div class="text-3xl mb-2">📦</div>
      <h3 class="font-bold text-lg mb-2 text-pink-600 dark:text-pink-400 group-hover:text-pink-700 dark:group-hover:text-pink-300 transition-colors">
        $propsルーン
        <span class="inline-block ml-1 text-xs opacity-60">→</span>
      </h3>
      <p class="text-sm mb-3 text-gray-7 dark:text-gray-3">コンポーネントのプロパティを型安全に定義します。</p>
      <ul class="text-sm text-gray-6 dark:text-gray-4 space-y-1 flex-grow">
        <li>Props の宣言と型定義</li>
        <li>デフォルト値の設定</li>
        <li>分割代入とrest props</li>
        <li>TypeScript統合</li>
      </ul>
    </div>
  </a>
  
  <a href="{base}/svelte/runes/bindable/" class="flex no-underline group h-full">
    <div class="p-4 border border-gray-2 dark:border-gray-7 rounded-lg shadow-md hover:shadow-lg hover:border-pink-400 dark:hover:border-pink-400 transition-all cursor-pointer flex flex-col w-full">
      <div class="text-3xl mb-2">🔗</div>
      <h3 class="font-bold text-lg mb-2 text-pink-600 dark:text-pink-400 group-hover:text-pink-700 dark:group-hover:text-pink-300 transition-colors">
        $bindableルーン
        <span class="inline-block ml-1 text-xs opacity-60">→</span>
      </h3>
      <p class="text-sm mb-3 text-gray-7 dark:text-gray-3">親子コンポーネント間で双方向バインディングを実現します。</p>
      <ul class="text-sm text-gray-6 dark:text-gray-4 space-y-1 flex-grow">
        <li>双方向データフロー</li>
        <li>フォーム要素との連携</li>
        <li>カスタムコンポーネントでの使用</li>
        <li>バインディングの制約</li>
      </ul>
    </div>
  </a>
  
  <a href="{base}/svelte/runes/inspect/" class="flex no-underline group h-full">
    <div class="p-4 border border-gray-2 dark:border-gray-7 rounded-lg shadow-md hover:shadow-lg hover:border-pink-400 dark:hover:border-pink-400 transition-all cursor-pointer flex flex-col w-full">
      <div class="text-3xl mb-2">🔍</div>
      <h3 class="font-bold text-lg mb-2 text-pink-600 dark:text-pink-400 group-hover:text-pink-700 dark:group-hover:text-pink-300 transition-colors">
        $inspectルーン
        <span class="inline-block ml-1 text-xs opacity-60">→</span>
      </h3>
      <p class="text-sm mb-3 text-gray-7 dark:text-gray-3">開発時のデバッグを効率化する値監視ツール。</p>
      <ul class="text-sm text-gray-6 dark:text-gray-4 space-y-1 flex-grow">
        <li>リアクティブ値の自動監視</li>
        <li>コンソールへの出力</li>
        <li>開発環境でのみ動作</li>
        <li>本番ビルドで自動削除</li>
      </ul>
    </div>
  </a>
  
  <a href="{base}/svelte/runes/comparison/" class="flex no-underline group h-full">
    <div class="p-4 border border-gray-2 dark:border-gray-7 rounded-lg shadow-md hover:shadow-lg hover:border-pink-400 dark:hover:border-pink-400 transition-all cursor-pointer flex flex-col w-full">
      <div class="text-3xl mb-2">🔄</div>
      <h3 class="font-bold text-lg mb-2 text-pink-600 dark:text-pink-400 group-hover:text-pink-700 dark:group-hover:text-pink-300 transition-colors">
        他フレームワークとの比較
        <span class="inline-block ml-1 text-xs opacity-60">→</span>
      </h3>
      <p class="text-sm mb-3 text-gray-7 dark:text-gray-3">React、Vue、Angularの経験者向けに、Runesシステムの違いと類似点を解説します。</p>
      <ul class="text-sm text-gray-6 dark:text-gray-4 space-y-1 flex-grow">
        <li>React Hooksとの比較</li>
        <li>Vue Composition APIとの比較</li>
        <li>Angular Signalsとの比較</li>
        <li>移行のベストプラクティス</li>
      </ul>
    </div>
  </a>
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

このシンプルな例は、Runesシステムの核心を示しています。

- **`$state`** - リアクティブな状態を宣言
- **`$derived`** - 他の値から自動計算される派生値
- **`$effect`** - 値の変更に応じて実行される副作用

## なぜRunesが必要なのか

### 1. 明示的なリアクティビティ

従来のSvelteでは、`let`宣言した変数が自動的にリアクティブになりましたが、これは時に混乱を招きました。Runesを使うことで、どの値がリアクティブなのかが一目で分かります。

### 2. TypeScriptとの完全な統合

Runesは型推論が完全に動作し、IDEのサポートも充実しています。これにより、型安全なアプリケーション開発が容易になりました。

### 3. パフォーマンスの向上

コンパイル時に最適化されたコードが生成され、実行時のオーバーヘッドが最小限に抑えられます。

## Runesの種類と役割

| ルーン | 役割 | 使用頻度 |
|--------|------|----------|
| `$state` | リアクティブな状態を作成 | ⭐⭐⭐ |
| `$derived` | 計算値を作成 | ⭐⭐⭐ |
| `$effect` | 副作用を実行 | ⭐⭐⭐ |
| `$props` | プロパティを定義 | ⭐⭐⭐ |
| `$bindable` | 双方向バインディング | ⭐⭐ |
| `$inspect` | デバッグ用監視 | ⭐⭐ |
| `$state.frozen` | 不変状態 | ⭐ |
| `$derived.by` | 複雑な派生値 | ⭐ |

## 学習の進め方

1. **基礎を固める** - まず`$state`と`$derived`を理解
2. **副作用を学ぶ** - `$effect`で外部システムとの連携
3. **コンポーネント間通信** - `$props`と`$bindable`
4. **高度な使い方** - 実践編で複雑なパターンを習得

## 次のステップ

準備ができたら、[Runesシステム入門](/svelte/runes/runes-introduction/)から始めましょう。従来のSvelteとの違いや、なぜRunesが必要なのかを詳しく解説します。

