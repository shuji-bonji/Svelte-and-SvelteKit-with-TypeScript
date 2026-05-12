---
title: '$state: リアクティブな状態変数と、バインディングの違い'
description: Svelte5のリアクティブ状態とバインディングをTypeScriptで完全理解 - $state vs bind、単方向/双方向データフロー、$bindableの使い分け、パフォーマンス考慮を実例を交えて実践的かつ詳しく解説します
---

<script>
	import Admonition from '$lib/components/Admonition.svelte';
	import LiveCode from '$lib/components/LiveCode.svelte';
</script>

Svelte開発において、「状態管理」と「バインディング」は似て非なる概念です。`$state`はコンポーネント内部でリアクティブな状態を管理するための仕組みであり、`bind:`はDOM要素やコンポーネント間でデータを同期させるための仕組みです。

<Admonition type="info" title="初心者向けの解説">

この2つは組み合わせて使うことが多いですが、それぞれ異なる目的と役割を持っています。`$state`で定義した変数を`bind:`でDOM要素に接続することで、ユーザー入力とアプリケーションの状態を連動させることができます。

</Admonition>
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

| 項目             | `$state`(Svelte 5) | `bind:` (従来機能)            |
| ---------------- | ------------------ | ----------------------------- |
| 主な用途         | 状態管理（内部）   | DOMや子コンポーネントとの同期 |
| 宣言方法         | $state()関数       | `bind:xxx=&#123;var&#125;`    |
| リアクティブ性   | 直接アクセス・更新 | DOMイベントで自動更新         |
| 状態更新時       | 自動再描画         | 自動再描画                    |
| Svelteバージョン | 5以降（Runes）     | 3以降（継続使用可）           |

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

<Admonition type="warning" title="React/Vue経験者への注意">

<ul>
<li>Reactの<code>useState</code>とは異なり、<code>$state</code>の値は直接変更可能です（セッター関数は不要）</li>
<li>Vueの<code>ref</code>に似ていますが、<code>.value</code>プロパティは不要です</li>
<li><code>bind:</code>は Vue の<code>v-model</code>に相当しますが、より柔軟で明示的です</li>
</ul>

</Admonition>

## Function bindings：「変数」と「バインディング」の中間

ここまで見てきたように、`$state` は**変数**としてリアクティブに振る舞い、`bind:` は**変数や子コンポーネントの prop と要素を結びつける構文**です。両者は性格が違うため、「片方向に派生させた値を、双方向にバインドしたい」というケースでは表現が難しくなります。

Svelte 5.9.0 で導入された **Function bindings** は、まさにこの中間を埋める構文で、`bind:value` に**変数の代わりに getter/setter のペア**を渡せます。

```svelte
<!-- bind:value に 2-tuple `() => getter, (v) => setter(v)` を渡す -->
<input
  bind:value={
    () => value,
    (v) => value = v.toLowerCase()
  }
/>
```

:::info[Svelte 5.9.0 以降の機能]
Function bindings は Svelte 5.9.0 以降で利用可能です。
:::

### 「変数を bind」と「関数を bind」の違い

これまでの `bind:` と、Function bindings の違いは、**「バインドする対象が lvalue（代入可能な変数）か、それとも getter / setter のペアか」** という点に集約されます。

| 形式 | 書き方 | バインドの対象 | 値の変換・派生 |
| --- | --- | --- | --- |
| 通常の `bind:`（変数バインディング） | `bind:value={count}` | リアクティブな変数（`$state` など） | 不可（同じ値が両方向に流れる） |
| Function bindings（関数バインディング） | `bind:value={() => g, (v) => s(v)}` | getter / setter のペア | **可能**（双方向で変換・派生・正規化できる） |

つまり、「変数 vs バインディング」という整理に **「関数による派生バインディング」** という第 3 の選択肢が加わったと考えるとわかりやすいです。

### 双方向に派生させたいときのパターン

「親が `$state` で持つ source of truth を、子に派生形で渡し、子からの変更を逆算して親に書き戻したい」というケースに最適です。

```svelte
<script lang="ts">
  // source of truth は celsius（摂氏）だけ
  let celsius = $state(20);
</script>

<label>
  摂氏: <input type="number" bind:value={celsius} />
</label>

<label>
  華氏:
  <!--
    getter: 摂氏 → 華氏に変換して表示
    setter: 華氏で書き戻された値を、摂氏に逆変換して celsius に反映
  -->
  <input
    type="number"
    bind:value={
      () => celsius * 9 / 5 + 32,
      (v: number) => celsius = (v - 32) * 5 / 9
    }
  />
</label>
```

`$state` を 2 つ用意して片方を派生させる必要がないため、データフローが単純になります。

### `$effect` で値を同期させるアンチパターンとの対比

Svelte 4 までは、「`$:` で双方向の同期を書く」ようなパターンがしばしば見られました。Svelte 5 でも同じことを `$effect` で書きたくなりますが、**双方向の sync を `$effect` で書くのは原則アンチパターン**です。

```svelte
<!-- ❌ アンチパターン：$effect で双方向 sync -->
<script lang="ts">
  let celsius = $state(20);
  let fahrenheit = $state(68);

  $effect(() => {
    fahrenheit = celsius * 9 / 5 + 32;
  });
  $effect(() => {
    celsius = (fahrenheit - 32) * 5 / 9;
  });
</script>
```

このコードは

1. 状態が `celsius` と `fahrenheit` の **2 つ**になり、どちらが真実かが不明瞭
2. `$effect` が互いを書き換え合うため、**更新タイミングや無限ループの危険**を抱える
3. 初期値が一致していないとレンダリング結果がブレる

といった問題を持ちます。これを Function bindings で書き換えると、

```svelte
<!-- ✅ Function bindings：真実は celsius ひとつ -->
<script lang="ts">
  let celsius = $state(20);
</script>

<input type="number" bind:value={celsius} />
<input
  type="number"
  bind:value={
    () => celsius * 9 / 5 + 32,
    (v: number) => celsius = (v - 32) * 5 / 9
  }
/>
```

状態が 1 つに集約され、変換ロジックが**バインディング箇所に局所化**されます。

:::tip[判断基準]

- 「値の表示と書き戻しで形を変換したいだけ」 → **Function bindings**
- 「外部の世界（DOM API・タイマー・ローカルストレージ等）に副作用を出したい」 → **`$effect`**
- 「派生値を一方向に計算するだけ」 → **`$derived` / `$derived.by`**

`$effect` は副作用専用の escape hatch であり、**状態どうしを同期させる用途には基本使わない**と覚えておくと整理しやすくなります。
:::

### TypeScript での型

getter / setter の戻り値・引数の型は、対象プロパティ（`$bindable` の型や要素プロパティ）から推論されます。明示する場合は setter 側に注釈を書きます。

```typescript
// 子コンポーネント
type Props = {
  value: string;
};

let { value = $bindable('') }: Props = $props();
```

```svelte
<!-- 親側：v は string として推論される -->
<Child
  bind:value={
    () => normalized,
    (v) => normalized = v.trim()
    //    ^? (parameter) v: string
  }
/>

<!-- number 型を明示するパターン -->
<input
  type="number"
  bind:value={
    () => count,
    (v: number) => count = Math.max(0, v)
  }
/>
```

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

<Admonition type="tip" title="ベストプラクティス">

<ul>
<li>フォーム要素には<code>bind:</code>を使って入力を簡潔に処理</li>
<li>複雑な状態管理には<code>$state</code>と<code>$derived</code>を組み合わせる</li>
<li>コンポーネント間のデータ共有には<code>$bindable</code>プロップを活用</li>
</ul>

</Admonition>
