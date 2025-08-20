---
title: Runesシステム（基礎編）
description: Svelte 5の新しいリアクティビティシステムの基礎
---

<script>
  import { base } from '$app/paths';
</script>

Svelte 5では、新しいリアクティビティシステム「Runes」が導入されました。Runesは、より明示的で予測可能なリアクティビティを提供し、TypeScriptとの統合も向上しています。

## Runesとは何か

Runesは、Svelte 5で導入された新しいリアクティビティシステムです。`$`で始まる特別な関数を使用して、リアクティブな状態やロジックを明示的に宣言します。

### なぜRunesが必要か

#### Svelte 4以前の問題点
- すべての`let`変数が自動的にリアクティブになり、どれがリアクティブか分かりにくい
- パフォーマンスの観点で無駄がある場合がある
- TypeScriptとの統合が複雑
- リアクティビティの挙動が暗黙的で予測しにくい

#### Svelte 5（Runes）の改善点
- `$state`で明示的にリアクティブな状態を宣言
- より予測可能で理解しやすい
- TypeScriptの型推論が向上
- パフォーマンスの最適化
- 他のフレームワーク経験者にも理解しやすい

## 主要なRunes

Runesシステムには、以下の主要な機能があります。

1. **`$state`** - リアクティブな状態を作成
2. **`$derived`** - 他の値から派生する計算値
3. **`$effect`** - 副作用の実行
4. **`$props`** - コンポーネントのプロパティ定義
5. **`$bindable`** - 双方向バインディング可能なプロパティ

## このセクションで学ぶこと

<div class="grid grid-cols-1 md:grid-cols-2 gap-4 my-8 auto-rows-[1fr]">
  <a href="{base}/runes-basics/state/" class="flex no-underline group h-full">
    <div class="p-4 border border-gray-2 dark:border-gray-7 rounded-lg shadow-md hover:shadow-lg hover:border-pink-400 dark:hover:border-pink-400 transition-all cursor-pointer flex flex-col w-full">
      <div class="text-3xl mb-2">📦</div>
      <h3 class="font-bold text-lg mb-2 text-pink-600 dark:text-pink-400 group-hover:text-pink-700 dark:group-hover:text-pink-300 transition-colors">
        $state - リアクティブな状態
        <span class="inline-block ml-1 text-xs opacity-60">→</span>
      </h3>
      <p class="text-sm mb-3 text-gray-7 dark:text-gray-3">リアクティブな状態変数の作成と管理方法を学びます。</p>
      <ul class="text-sm text-gray-6 dark:text-gray-4 space-y-1 flex-grow">
        <li>基本的な使い方</li>
        <li>オブジェクトと配列の扱い</li>
        <li>深いリアクティビティ</li>
        <li>クラスとの統合</li>
      </ul>
    </div>
  </a>
  
  <a href="{base}/runes-basics/derived/" class="flex no-underline group h-full">
    <div class="p-4 border border-gray-2 dark:border-gray-7 rounded-lg shadow-md hover:shadow-lg hover:border-pink-400 dark:hover:border-pink-400 transition-all cursor-pointer flex flex-col w-full">
      <div class="text-3xl mb-2">🔄</div>
      <h3 class="font-bold text-lg mb-2 text-pink-600 dark:text-pink-400 group-hover:text-pink-700 dark:group-hover:text-pink-300 transition-colors">
        $derived - 派生値
        <span class="inline-block ml-1 text-xs opacity-60">→</span>
      </h3>
      <p class="text-sm mb-3 text-gray-7 dark:text-gray-3">他の値から自動的に計算される値の作成方法を学びます。</p>
      <ul class="text-sm text-gray-6 dark:text-gray-4 space-y-1 flex-grow">
        <li>計算プロパティの作成</li>
        <li>複数の依存関係</li>
        <li>最適化とメモ化</li>
        <li>非同期派生値</li>
      </ul>
    </div>
  </a>
  
  <a href="{base}/runes-basics/effect/" class="flex no-underline group h-full">
    <div class="p-4 border border-gray-2 dark:border-gray-7 rounded-lg shadow-md hover:shadow-lg hover:border-pink-400 dark:hover:border-pink-400 transition-all cursor-pointer flex flex-col w-full">
      <div class="text-3xl mb-2">⚡</div>
      <h3 class="font-bold text-lg mb-2 text-pink-600 dark:text-pink-400 group-hover:text-pink-700 dark:group-hover:text-pink-300 transition-colors">
        $effect - 副作用
        <span class="inline-block ml-1 text-xs opacity-60">→</span>
      </h3>
      <p class="text-sm mb-3 text-gray-7 dark:text-gray-3">リアクティブな値の変更に応じて副作用を実行する方法を学びます。</p>
      <ul class="text-sm text-gray-6 dark:text-gray-4 space-y-1 flex-grow">
        <li>副作用の基本</li>
        <li>クリーンアップ処理</li>
        <li>依存関係の自動追跡</li>
        <li>実行タイミングの制御</li>
      </ul>
    </div>
  </a>
  
  <a href="{base}/runes-basics/comparison/" class="flex no-underline group h-full">
    <div class="p-4 border border-gray-2 dark:border-gray-7 rounded-lg shadow-md hover:shadow-lg hover:border-pink-400 dark:hover:border-pink-400 transition-all cursor-pointer flex flex-col w-full">
      <div class="text-3xl mb-2">🔍</div>
      <h3 class="font-bold text-lg mb-2 text-pink-600 dark:text-pink-400 group-hover:text-pink-700 dark:group-hover:text-pink-300 transition-colors">
        他フレームワークとの比較
        <span class="inline-block ml-1 text-xs opacity-60">→</span>
      </h3>
      <p class="text-sm mb-3 text-gray-7 dark:text-gray-3">React、Vue、Angularとの比較でRunesを理解します。</p>
      <ul class="text-sm text-gray-6 dark:text-gray-4 space-y-1 flex-grow">
        <li>React Hooksとの比較</li>
        <li>Vue Composition APIとの比較</li>
        <li>Angularシグナルとの比較</li>
        <li>移行のヒント</li>
      </ul>
    </div>
  </a>
</div>

## 学習の前提知識

このセクションを始める前に、以下の知識があることを前提としています。

- JavaScript（ES6+）の基本的な構文
- TypeScriptの基本的な型定義（推奨）
- HTML/CSSの基本的な知識

:::note[Svelteの基本知識について]
Runesシステムを学んだ後、[Svelteの基本](/svelte-basics/)セクションでコンポーネントの構造やテンプレート構文について詳しく学びます。Runesは基礎となる概念なので、まずこちらを理解することが重要です。
:::

## クイックスタート

簡単な例でRunesの使い方を見てみましょう。

```svelte
<script lang="ts">
  // リアクティブな状態を作成
  let count = $state(0);
  
  // 派生値（自動的に更新される）
  let doubled = $derived(count * 2);
  
  // 副作用（countが変更されると実行）
  $effect(() => {
    console.log(`Count is now: ${count}`);
  });
  
  function increment() {
    count++;
  }
</script>

<button onclick={increment}>
  カウント: {count}
</button>
<p>2倍: {doubled}</p>
```

:::info[他のフレームワークとの類似性]
- Reactの`useState`に似た`$state`
- Vueの`computed`に似た`$derived`
- Reactの`useEffect`に似た`$effect`

これらの概念に慣れている方は、Runesも直感的に理解できるでしょう。
:::

## 次のステップ

準備ができたら、[$state - リアクティブな状態](/runes-basics/state/)から始めましょう。Svelte 5の新しいリアクティビティシステムの核心を学びます。