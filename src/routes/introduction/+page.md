---
title: Svelte 5の概要
description: Svelte 5とRunesシステムの紹介
---

## Svelte 5とは

Svelte 5は、コンパイル時に最適化されたJavaScriptコードを生成する革新的なフロントエンドフレームワークの最新バージョンです。

## 主な特徴

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

Runesにより、リアクティビティがより明示的で予測可能になりました：

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
};

let { count, message = 'デフォルト' }: Props = $props();
```

## なぜSvelte 5を選ぶのか

1. **パフォーマンス** - ランタイムなしの高速な実行
2. **開発体験** - シンプルで直感的な構文
3. **型安全性** - TypeScriptとの優れた統合
4. **小さなバンドルサイズ** - 最適化されたコード生成

## 次のステップ

[なぜSvelteか](/introduction/why-svelte/)で、Svelteが他のフレームワークと比較してどのような利点があるかを詳しく見ていきましょう。