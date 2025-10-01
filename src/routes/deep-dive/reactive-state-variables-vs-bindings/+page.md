---
title: "$state: リアクティブな状態変数と、バインディングの違い"
description: Svelte5のリアクティブ状態とバインディングをTypeScriptで完全理解 - $state vs bind、単方向/双方向データフロー、$bindableの使い分け、パフォーマンス考慮を実例を交えて実践的かつ詳しく解説します
---


Svelte開発において、「状態管理」と「バインディング」は似て非なる概念です。`$state`はコンポーネント内部でリアクティブな状態を管理するための仕組みであり、`bind:`はDOM要素やコンポーネント間でデータを同期させるための仕組みです。

:::info[初心者向けの解説]
この2つは組み合わせて使うことが多いですが、それぞれ異なる目的と役割を持っています。`$state`で定義した変数を`bind:`でDOM要素に接続することで、ユーザー入力とアプリケーションの状態を連動させることができます。
:::

このページでは、Svelte 5の新しいリアクティビティモデル「Runes」の中核となる`$state`と、従来から存在する`bind:`構文の違いを、実践的な例を交えて詳しく解説します。

## $state（Svelte 5の新リアクティブ変数）

#### 概要

- `$state`は、リアクティブな状態（状態の変更を自動で追跡）を定義する方法
- Svelte 5では、runesという新しい仕組みで、より明示的なリアクティビティ制御が可能
- `$state()`で定義された変数は直接アクセス・更新が可能（`$`プレフィックスは不要）

#### 例

```svelte ln live
<script>
  let count = $state(0);
</script>

<button onclick={() => count++}>
  Clicked {count} times
</button>
```

#### 特徴
- `$state()`で定義された変数は、プリミティブな値やオブジェクトでもリアクティブに追跡される
- 変数に直接アクセスし、通常の変数のように読み取り・書き込みができる
- 書き込み時も自動的に再描画が起きる

## bind:（双方向バインディング）

#### 概要
- DOM要素の属性（例: value, checked, selected）と変数を同期させる。
- ユーザーの入力に応じて変数が自動的に更新される。

#### 例

```svelte
<script>
  let name = $state('');
</script>

<input bind:value={name} />
<p>Hello {name}!</p>
```

#### 特徴
- DOMとの 双方向バインディング を行う
- ユーザー入力と内部状態を同期させたい場合に便利
- コンポーネント間のbind:propによるバインディングも可能

## 違いのまとめ

|項目|`$state`(Svelte 5)|`bind:` (従来機能)|
|---|---|---|
|主な用途|状態管理（内部）|DOMや子コンポーネントとの同期|
|宣言方法|$state()関数|`bind:xxx={var}`|
|リアクティブ性|直接アクセス・更新|DOMイベントで自動更新|
|状態更新時|自動再描画|自動再描画|
|Svelteバージョン|5以降（Runes）|3以降（継続使用可）|

## 実践例：両者を組み合わせた使用

### フォーム入力の例

```svelte
<script lang="ts">
  // $stateで状態を定義
  let username = $state('');
  let email = $state('');
  let isValid = $derived(username.length > 0 && email.includes('@'));
</script>

<!-- bind:でDOM要素と状態を同期 -->
<input type="text" bind:value={username} placeholder="ユーザー名" />
<input type="email" bind:value={email} placeholder="メールアドレス" />

<button disabled={!isValid}>
  送信
</button>

<p>入力状況: {isValid ? '有効' : '無効'}</p>
```

### コンポーネント間のデータ共有

```svelte
<!-- Parent.svelte -->
<script lang="ts">
  import Child from './Child.svelte';
  
  let parentValue = $state('親の値');
</script>

<Child bind:value={parentValue} />
<p>親コンポーネント: {parentValue}</p>

<!-- Child.svelte -->
<script lang="ts">
  let { value = $bindable() } = $props();
</script>

<input bind:value={value} />
```

:::warning[React/Vue経験者への注意]
- Reactの`useState`とは異なり、`$state`の値は直接変更可能です（セッター関数は不要）
- Vueの`ref`に似ていますが、`.value`プロパティは不要です
- `bind:`は Vue の`v-model`に相当しますが、より柔軟で明示的です
:::

## よくある質問

### Q: `$state`なしで`bind:`は使えますか？
A: はい、使えます。Svelte 5でも通常の変数に`bind:`を使用できます。

```svelte
<script>
  let normalVariable = 'initial';
</script>

<input bind:value={normalVariable} />
```

### Q: `$state`と`bind:`を常に一緒に使うべきですか？
A: いいえ、必須ではありません。`$state`は内部状態の管理に、`bind:`はDOM要素との同期に使います。それぞれ独立して使用可能です。

## まとめ

- **`$state`**: コンポーネント内部のリアクティブな状態を管理する
- **`bind:`**: DOM要素やコンポーネント間でデータを双方向に同期する
- 両者は補完的な関係にあり、組み合わせることで強力なリアクティブUIを構築できる

:::tip[ベストプラクティス]
- フォーム要素には`bind:`を使って入力を簡潔に処理
- 複雑な状態管理には`$state`と`$derived`を組み合わせる
- コンポーネント間のデータ共有には`$bindable`プロップを活用
:::