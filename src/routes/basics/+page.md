---
title: Svelte 5 基礎概要
description: Svelte 5 Runesシステムの基礎
---

## Runesシステムとは

Svelte 5で導入されたRunesは、リアクティビティを管理するための新しいプリミティブです。

## 主要なRunes

### 基本的なRunes

1. **[$state](/basics/state/)** - リアクティブな状態を定義
2. **[$derived](/basics/derived/)** - 他の値から派生する計算値
3. **[$effect](/basics/effect/)** - 副作用の実行

### コンポーネント用Runes

4. **[$props](/basics/props/)** - コンポーネントのプロパティ
5. **[$bindable](/basics/bindable/)** - 双方向バインディング

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

1. [Runesシステム入門](/basics/runes-introduction/) - 基本概念の理解
2. 各Runeの詳細な学習
3. 実践的な使用例

## 次のステップ

[Runesシステム入門](/basics/runes-introduction/)で、Runesの基本概念から学び始めましょう。