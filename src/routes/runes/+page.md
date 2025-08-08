---
title: Runesシステム概要
description: Svelte 5 Runesシステムの基礎
---

## Runesシステムとは

Svelte 5で導入されたRunesは、リアクティビティを管理するための新しいプリミティブです。

## 主要なRunes

### 基本的なRunes

1. **[$state](/runes/state/)** - リアクティブな状態を定義
2. **[$derived](/runes/derived/)** - 他の値から派生する計算値
3. **[$effect](/runes/effect/)** - 副作用の実行

### コンポーネント用Runes

4. **[$props](/runes/props/)** - コンポーネントのプロパティ
5. **[$bindable](/runes/bindable/)** - 双方向バインディング

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