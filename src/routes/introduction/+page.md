---
title: Svelte 5の概要
description: Svelte 5とRunesシステムの紹介
---

<script>
  import { base } from '$app/paths';
</script>

## Svelte 5とは
Svelteは、**コンパイル時に最適化を行う**という革新的なアプローチを採用したフロントエンドフレームワークです。
他のフレームワークとは異なり、**Virtual DOMを使用しません**。代わりに、ビルド時にコンポーネントを高効率なVanilla JavaScriptに変換します。

:::note[Svelteのコンパイル]
ここで定義されている`Svelteのコンパイル`とは、ブラウザやNode.jsで実行するために、ビルド時にコンポーネントを解析し、必要最小限のJavaScriptコードに変換JavaScriptに変換（コンパイル）することです。
詳しくは、技術詳細の[Svelte はコンパイル時に何をやっているのか？]({base}/deep-dive/compile-time-optimization/)を参照してください。
:::

## 主な特徴

| 項番 | 特徴 | 説明 |
| --- | --- |--- |
| 1 | **コンパイラベース**  | ビルド時に最適化されたコードを生成 |
| 2  | **Virtual DOM不使用** | 直接DOMを操作する効率的なコード |
| 3  | **軽量** | 小さなバンドルサイズ |
| 4  | **高速** | ランタイムオーバーヘッドが最小限  |
| 5  | **シンプル** | 学習曲線が緩やか |


## 他のフレームワークとの違い

### Virtual DOMを使わない理由

React、Vue、AngularなどはVirtual DOMを使用して効率的なDOM更新を実現しています。  
しかし、Svelteは異なるアプローチを取ります。

<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4 my-8">
  <div class="p-4 border border-gray-2 dark:border-gray-7 rounded-lg shadow-md hover:shadow-lg transition-shadow">
    <div class="text-3xl mb-2">🔄</div>
    <h3 class="font-bold text-lg mb-2">従来のフレームワーク</h3>
    <ol>
      <li>Virtual DOMで変更を検出</li>
      <li>差分を計算（Diffing）</li>
      <li>必要な部分のみDOM更新</li>
    </ol>
    <p class="text-sm text-gray-5 dark:text-gray-4">実行時にこの処理が行われる</p>
  </div>
  <div class="p-4 border border-gray-2 dark:border-gray-7 rounded-lg shadow-md hover:shadow-lg transition-shadow">
    <div class="text-3xl mb-2">⚡</div>
    <h3 class="font-bold text-lg mb-2">Svelte</h3>
    <ol>
      <li>コンパイル時に変更を特定</li>
      <li>効率的な更新コードを生成</li>
      <li>直接DOMを更新</li>
    </ol>
    <p class="text-sm text-gray-5 dark:text-gray-4">ビルド時に最適化される</p>
  </div>
</div>

### コンパイラベースのアプローチ

Svelteの最大の特徴は、**フレームワークというよりコンパイラ**として機能することです。

#### コーディング時
```javascript
// 開発時のSvelteコード
let count = $state(0);
let doubled = $derived(count * 2);
```
#### ⬇️コンパイル後
```javascript
// コンパイル後（簡略化）
let count = 0;
let doubled = 0;
function updateCount(value) {
  count = value;
  doubled = count * 2;
  element.textContent = count; // 直接DOM更新
  doubledElement.textContent = doubled; // 関連する要素も更新
}
```


## Svelte 5の革新

Svelte 5は、2024年にリリースされた最新バージョンで、開発体験とパフォーマンスを大幅に改善しました。

### バージョン間の進化

| バージョン | リリース | 主な特徴 |
|-----------|---------|---------|
| Svelte 3 | 2019年 | リアクティビティの導入 |
| Svelte 4 | 2023年 | パフォーマンス改善、移行準備 |
| **Svelte 5** | 2024年 | Runesシステム、完全な型安全性 |

## Svelte 5の新機能

### 1. Runesシステム

Svelte 5の最大の変更点は、新しい**Runesシステム**の導入です。

```typescript
// 従来のSvelte 4
let count = 0;
$: doubled = count * 2;

// Svelte 5 Runes
let count = $state(0);
let doubled = $derived(count * 2);
```

### 2. より明示的なリアクティビティ

Runesにより、リアクティビティがより明示的で予測可能になりました。

- `$state` - リアクティブな状態を定義
- `$derived` - 計算値を定義
- `$effect` - 副作用を実行
- `$props` - コンポーネントのプロパティを定義
- `$bindable` - 双方向バインディング可能なプロパティ

### 3. TypeScriptとの完全な統合

```typescript
type Props = {
  count: number;
  message?: string;
  onChange?: (value: number) => void;
};

let { count, message = 'デフォルト', onChange }: Props = $props();

// 型推論も強化
let items = $state<string[]>([]); // 明示的な型定義
let filtered = $derived(items.filter(item => item.length > 3)); // 型が自動推論される
```

### 4. パフォーマンスの向上

- **20-30%高速化** - Svelte 4と比較
- **メモリ使用量削減** - より効率的なリアクティビティ
- **ビルド時間短縮** - 最適化されたコンパイラ

## なぜSvelte 5を選ぶのか

1. **パフォーマンス** - ランタイムなしの高速な実行
2. **開発体験** - シンプルで直感的な構文
3. **型安全性** - TypeScriptとの優れた統合
4. **小さなバンドルサイズ** - 最適化されたコード生成

## 次のステップ

[なぜSvelteか](/introduction/why-svelte/)で、Svelteが他のフレームワークと比較してどのような利点があるかを詳しく見ていきましょう。