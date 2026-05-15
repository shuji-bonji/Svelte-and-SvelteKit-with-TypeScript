---
title: コンポーネントの基本
description: Svelte5コンポーネントの基本をTypeScriptで学ぶ。script/markup/styleの3要素、テンプレート構文、イベントハンドリング、プロパティの実装方法を解説
---

<script>
	import { base } from '$app/paths';
	import Admonition from '$lib/components/Admonition.svelte';
	import LiveCode from '$lib/components/LiveCode.svelte';
</script>

Svelteコンポーネントは、以下の3つの部分から構成されます。

- **script**（ロジック）
- **markup**（HTML）
- **style**（CSS）

これらは単一の`.svelte`ファイル内に記述され、カプセル化されたコンポーネントを形成します。

## まずは最小のコンポーネントから

最も単純な `.svelte` ファイルは、変数を 1 つだけ持ち、それを HTML として描画し、少しスタイルを当てるだけの構造です。3 つのブロックがどう並ぶかをまず体感してみてください。

```svelte live
<!-- Hello.svelte -->

<!-- 1. Script部分：ロジックとデータ -->
<script lang="ts">
  let name = 'World';
</script>

<!-- 2. Markup部分：HTML構造 -->
<h1>Hello, {name}!</h1>

<!-- 3. Style部分：スタイリング -->
<style>
  h1 {
    color: purple;
  }
</style>
```

`script` で宣言した `name` を、markup の `{name}` で展開しているだけのシンプルな構造です。`style` ブロック内の CSS はこのコンポーネントだけに **スコープ** され、他の `<h1>` に影響しません（詳しくは後述）。

### 他のコンポーネントを使う

作ったコンポーネントを別のコンポーネントから利用するには、`script` でインポートして markup 内でタグとして配置するだけです。

```svelte
<!-- App.svelte -->
<script lang="ts">
  // 同じディレクトリにある Hello.svelte をインポート
  import Hello from './Hello.svelte';
</script>

<Hello />
```

ファイル名（拡張子を除く部分）がそのままインポート名・タグ名になります。`PascalCase` で命名するのが Svelte の慣例です。

<Admonition type="info" title="この記事の構成">

ここから先では、3 つのブロックそれぞれの中で使える機能（リアクティブな状態、テンプレート構文、スコープ付きスタイル等）を順に見ていきます。Svelte 5 では `let` だけでリアクティブにはならず、`$state` などの **Runes** を使う点に注意してください。

</Admonition>

## コンポーネントの基本構造

実用的なコンポーネントでは、リアクティブな状態（`$state`）やイベントハンドラ、複数のスタイルが組み合わさります。カウンターを例に、3 ブロックが揃った典型的な形を見ておきましょう。下のサンプルは実行可能で、ボタンを押すと UI が更新され、ブラウザの DevTools コンソール（あるいは Playground の Console パネル）にもログが出ます。

```svelte live console
<!-- Counter.svelte -->

<!-- 1. Script部分：ロジックとデータ -->
<script lang="ts">
  // $state で宣言した値は変更すると UI が自動更新される（Runes）
  let count = $state(0);

  function increment(): void {
    count++;
    console.log(`カウンターが増加しました: ${count}`);
  }
</script>

<!-- 2. Markup部分：HTML構造 -->
<div class="counter">
  <h2>カウンター: {count}</h2>
  <button onclick={increment}>
    クリック
  </button>
</div>

<!-- 3. Style部分：スタイリング -->
<style>
  .counter {
    padding: 1rem;
    border: 1px solid #ddd;
    border-radius: 4px;
  }

  h2 {
    color: #999;
  }

  button {
    background: #ff3e00;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    cursor: pointer;
  }
</style>
```

## Script部分の詳細

### 変数宣言とリアクティビティ

:::caution

> Svelte 5より前のバージョンでは、`let`で宣言した変数は自動的にリアクティブになりました。

Svelte 5では、Runesシステム（`$state`など）を使用してリアクティビティを明示的に制御します。ここに記載している以前のバージョンの宣言方法は使用しないでください。
:::

<details>
<summary>Click to expand/fold panel</summary>

変数宣言とリアクティビティ

Svelte 5より前のバージョンでは、`let`で宣言した変数は自動的にリアクティブになります。

```svelte
<script lang="ts">
  // これらの変数は自動的にリアクティブ（Svelte 4以前）
  let name: string = 'Alice';
  let age: number = 25;
  let isActive: boolean = true;

  // オブジェクトと配列もリアクティブ
  let user = {
    name: 'Bob',
    email: 'bob@example.com'
  };

  let items: string[] = ['item1', 'item2'];

  function updateUser(): void {
    // UIが自動的に更新される
    user.name = 'Charlie';
    items.push('item3');
  }
</script>
```

#### Svelte 3, 4の問題点

- すべてのlet変数が自動的にリアクティブになるため、どれがリアクティブか分かりにくい
- パフォーマンスの観点で無駄がある場合がある
- TypeScriptとの統合が複雑

#### Svelte 5の改善

- $stateで明示的にリアクティブを宣言
- より予測可能で理解しやすい
- TypeScriptの型推論が向上
- パフォーマンスの最適化

</details>

### インポート

他の Svelte コンポーネントや、ユーティリティ・型などは **通常の ES モジュールと同じ構文** でインポートできます。

```svelte
<script lang="ts">
  // 他の Svelte コンポーネントをインポート
  import Button from './Button.svelte';

  // ユーティリティ関数をインポート
  import { formatDate } from '$lib/utils';

  // TypeScript の型をインポート
  import type { User } from '$lib/types';
</script>

<!-- インポートしたコンポーネントは PascalCase のタグとして使う -->
<Button />
```

ファイル名（拡張子を除く部分）がそのまま import 時の名前になります。慣例として **PascalCase** で命名するのが推奨です。`$lib` は SvelteKit が用意するエイリアスで、`src/lib/` を指します。

:::info[Props でデータを受け渡す]

コンポーネント間でデータを渡すには Svelte 5 の `$props` ルーンを使います。本ページでは後の「親から子へデータを渡す（最小の Props）」節で受け渡しの基本を扱います。`$bindable`、Snippets 経由の受け渡しなどの応用は [$props - プロパティ]({base}/svelte/runes/props/) で扱います。

:::

### インポートの実例

実際に **複数ファイルでの import** を動かしてみます。下の例では `Hello.svelte` を別ファイルとして定義し、`App.svelte` からインポートして利用しています。「インタラクティブに試す」を押すと、Playground 上でも 2 つのファイルがタブで表示され、import が機能している様子を確認できます。

```svelte live console
<!-- @file: Hello.svelte -->
<script lang="ts">
  let name = 'World';
</script>

<h1>Hello, {name}!</h1>

<style>
  h1 {
    color: purple;
  }
</style>

<!-- @file: App.svelte -->
<script lang="ts">
  // 同じディレクトリにある Hello.svelte をインポート
  import Hello from './Hello.svelte';
</script>

<Hello />
```

:::info[`<!-- @file: ... -->` マーカーについて]

このサイト独自の記法で、`live` ブロック内を複数のファイルに分けて Playground 埋め込みに渡すためのものです。実際のプロジェクトでは普通に **`Hello.svelte` と `App.svelte` の 2 つの別ファイル** として保存します。マーカー行はファイル間の区切り（およびタブ名の指定）として機能し、ファイル本体には含まれません。

:::

### 親から子へデータを渡す（最小の Props）

import できたら、次は **「親から子へデータを渡す」** ところまで一気に押さえてしまいましょう。Svelte 5 では `$props()` ルーンを使い、TypeScript の分割代入で受け取ります。下の例は `Card.svelte` が親から `title` と `body` を受け取って表示する最小構成です。

```svelte live
<!-- @file: Card.svelte -->
<script lang="ts">
  type Props = { title: string; body: string };
  let { title, body }: Props = $props();
</script>

<article>
  <h3>{title}</h3>
  <p>{body}</p>
</article>

<style>
  article {
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 1rem;
    background: #f9f9f9;
  }
  h3 { margin: 0 0 0.5rem 0; color: #ff3e00; }
  p { margin: 0; color: #444; }
</style>

<!-- @file: App.svelte -->
<script lang="ts">
  import Card from './Card.svelte';
</script>

<Card title="Welcome" body="親から渡された props を子で受け取っています。" />
<Card title="Svelte 5" body="$props ルーンを分割代入で受け取り、Props 型で型付けします。" />
```

ポイントは次のとおりです。

- **`let { ... }: Props = $props()`** — 分割代入で受け取り、Props 型で型付けする
- **属性として渡す** — 親側は `<Card title="..." body="..." />` のように HTML 属性と同じ書き方
- **PascalCase** — タグ名は `Card`（コンポーネント名と同じ）

:::info[`$props` の詳細はリファレンスへ]

オプショナル props、`$bindable`、Snippets 経由のテンプレート受け渡し、`$props.id()` などの応用は [$props - プロパティ]({base}/svelte/runes/props/) で扱います。ここでは「親 → 子へデータを渡せる」という基本だけ押さえれば十分です。

:::

## Markup部分の詳細

Markup 部分には、コンポーネントが描画する **HTML 構造** を記述します。ただし Svelte の Markup は **素の HTML ではなく、テンプレート構文で拡張された HTML** です。`{ }` で JavaScript 式を埋め込んだり、`&#123;#if&#125;` のようなブロック構文や `&#123;@html&#125;` のようなアノテーションで動的な振る舞いを表現できます。

```svelte
<script lang="ts">
  let name = $state('World');
  let isLoggedIn = $state(false);
</script>

<!-- {} で式を埋め込み -->
<h1>Hello, {name}!</h1>

<!-- 三項演算子も普通の JS 式として書ける -->
<p>{isLoggedIn ? 'ログイン中' : '未ログイン'}</p>
```

このように、Markup ブロックの中身は **「HTML + テンプレート式・ブロック構文・アノテーション」** の組み合わせです。

:::tip[テンプレート構文の体系は専用ページで網羅]

`&#123;#if&#125;` / `&#123;#each&#125;` / `&#123;#await&#125;` などの **ブロック構文**、`&#123;@html&#125;` / `&#123;@render&#125;` などの **アノテーション**、`bind:innerHTML` などの **特殊バインディング** といったテンプレート構文の体系は、[テンプレート構文 - 制御フローとアノテーション](/svelte/basics/template-syntax/) ページで網羅的に扱います。

本ページでは、Markup ブロックで最も基本となる **式展開 `{ expr }`** だけを、すぐ下でインタラクティブに体験できる形で扱います。

:::

### 式展開でできること

`{ expr }` の中身は **普通の JavaScript 式** として評価されます。三項演算子・論理演算子・関数呼び出し・メソッドチェーンなど、特別な構文を覚えなくても任意の JS 式がそのまま書けます。下のデモはスライダーとチェックボックスを動かすと、各種パターンが連動して表示更新される様子を観察できます。

```svelte live
<script lang="ts">
  let count = $state(5);
  let isLoggedIn = $state(false);
  let user = $state({ name: 'taro', email: 'taro@example.com' });
</script>

<div class="controls">
  <label>
    カウント: {count}
    <input type="range" min="0" max="20" bind:value={count} />
  </label>
  <label>
    <input type="checkbox" bind:checked={isLoggedIn} />
    ログイン状態
  </label>
</div>

<!-- 単純な値の埋め込み -->
<p>カウント: {count}</p>

<!-- 計算式 -->
<p>2 倍: {count * 2}</p>

<!-- 三項演算子で出し分け -->
<p>状態: {isLoggedIn ? 'ログイン中' : '未ログイン'}</p>

<!-- 論理 AND（短絡評価）で表示制御 -->
<p>{count > 10 && '✨ 10 を超えました！'}</p>

<!-- メソッド呼び出し -->
<p>名前(大文字): {user.name.toUpperCase()}</p>

<!-- プロパティアクセス -->
<p>連絡先: {user.email}</p>

<style>
  .controls {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    padding: 0.75rem 1rem;
    background: #f5f5f5;
    color: #222;
    border-radius: 6px;
    margin-bottom: 1rem;
  }
  .controls label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #222;
  }
  p {
    margin: 0.25rem 0;
  }
</style>
```

ポイントは次のとおりです。

- **`{ }` の中は普通の JS 式** — 三項演算子・論理演算子・関数呼び出しが書ける。新しい構文を覚える必要はない
- **リアクティブ更新の条件** — 式の中で参照する値が `$state` などのリアクティブな源であれば、値が変わるたびに UI が自動で再評価される。普通の `let` 変数だけを参照する式は更新されない
- **三項演算子はルーンの相棒ではない** — `let label = 'Hello'` のような非リアクティブな値でも `{label ? 'A' : 'B'}` は書ける。「テンプレート式の評価」と「リアクティビティ」は独立した話

:::tip[ブロック構文 `&#123;#if&#125;` と三項演算子の使い分け]

| ケース | 推奨 |
|--------|------|
| 複数行・要素ブロック単位で出し分け | `&#123;#if&#125;` / `&#123;:else&#125;` ブロック構文（[テンプレート構文](/svelte/basics/template-syntax/#制御フロー)） |
| テキスト・属性値・クラス名など 1 つの値の出し分け | 三項演算子 `&#123;a ? b : c&#125;` |
| 表示するかどうかだけ（else 不要） | `&#123;#if&#125;` または短絡評価 `&#123;flag && ...&#125;` |

「**ブロックを丸ごと**」なら `&#123;#if&#125;`、「**式 1 つの結果**」なら三項演算子、と覚えると迷いません。

:::

## Style部分の詳細

### スコープ付きスタイル

Svelteのスタイルは、デフォルトでコンポーネントにスコープされます。

```svelte
<style>
  /* このスタイルは現在のコンポーネントにのみ適用される */
  p {
    color: blue;
  }

  /* 生成されるCSSは以下のようになる
     p.svelte-xyz123 { color: blue; } */
</style>
```

### グローバルスタイル

`:global()`を使用してグローバルスタイルを定義

```svelte
<style>
  /* このコンポーネント内のp要素のみ */
  p {
    color: blue;
  }

  /* 全てのp要素に適用 */
  :global(p) {
    margin: 0;
  }

  /* 子要素のグローバルスタイル */
  .container :global(a) {
    color: red;
  }
</style>
```

### 動的スタイル

スタイル属性やクラスを動的に適用できます。条件に応じてスタイルを変更する場合に便利です。下の例では **カラーピッカー・サイズスライダー・チェックボックス** を操作すると、3 種類の動的スタイル指定方法（インラインスタイル / `style:` ディレクティブ / `class:` ディレクティブ）がすべてリアルタイムで連動します。

```svelte live
<script lang="ts">
  let color = $state('#ff3e00');
  let size = $state(16);
  let isActive = $state(true);
</script>

<div class="controls">
  <label>
    色: <input type="color" bind:value={color} />
  </label>
  <label>
    サイズ: {size}px
    <input type="range" min="10" max="40" bind:value={size} />
  </label>
  <label>
    <input type="checkbox" bind:checked={isActive} />
    アクティブ
  </label>
</div>

<!-- 1. インラインスタイル（属性に式を埋め込む） -->
<h4>インラインスタイル</h4>
<p style="color: {color}; font-size: {size}px;">
  動的スタイル
</p>

<!-- 2. style: ディレクティブ（より簡潔な記法） -->
<h4>style: ディレクティブ</h4>
<p
  style:color
  style:font-size="{size}px"
  style:font-weight={isActive ? 'bold' : 'normal'}
>
  style: 記法
</p>

<!-- 3. class: ディレクティブ（クラスの動的適用） -->
<h4>class: ディレクティブ</h4>
<div
  class="base"
  class:active={isActive}
  class:large={size > 20}
>
  条件付きクラス（サイズが 20 を超えると "large" クラス追加）
</div>

<style>
  .controls {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    padding: 0.75rem 1rem;
    background: #f5f5f5;
    color: #222;
    border-radius: 6px;
    margin-bottom: 1rem;
  }
  .controls label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #222;
  }
  h4 {
    margin: 0.75rem 0 0.25rem;
    font-size: 0.8rem;
  }
  .base {
    padding: 1rem;
    border: 1px solid #888;
    border-radius: 4px;
    background: #fafafa;
    color: #222;
  }
  .active {
    background: #ff3e00;
    color: white;
  }
  .large {
    font-size: 1.5rem;
  }
</style>
```

## イベントハンドリング

Svelte 5 では、イベントハンドラの記法が `on:click` から標準的な HTML 属性の `onclick` に変更されました。関数参照でもインライン関数でも登録できます。

```svelte live console
<script lang="ts">
  function handleClick(event: MouseEvent): void {
    console.log('クリックされました', {
      type: event.type,
      x: event.clientX,
      y: event.clientY
    });
  }
</script>

<!-- 関数参照 -->
<button onclick={handleClick}>
  クリック
</button>

<!-- インライン関数 -->
<button onclick={() => console.log('インライン')}>
  インライン関数
</button>
```

:::tip[イベントの詳細な扱い]

`preventDefault` / `stopPropagation` などの修飾子相当パターンや、`window` / `document` へのグローバルイベント登録、`on()` ヘルパーの使い方は [イベントハンドリング]({base}/svelte/basics/events-module/) で詳しく解説しています。

:::

## 双方向バインディング

`bind:` ディレクティブを使用して、フォーム要素の値とコンポーネントの **`$state` 変数** を双方向にバインドできます。入力値が自動的に変数へ反映され、変数の変更も入力フィールドに反映されます。下のデモは **入力するたびに右側のバインド結果が即時更新** されるので、各 `bind:` の挙動を視覚的に確認できます。

```svelte live
<script lang="ts">
  // 各入力要素にひとつずつ独立した状態を用意
  let textName = $state('');
  let textEmail = $state('');
  let textAge = $state(0);
  let checkboxAgreed = $state(false);
  let radioOption = $state('option1');
  let selectFruit = $state('');
  let multiColors = $state<string[]>([]);
  let textareaContent = $state('');
</script>

<h4>① テキスト入力</h4>
<label>
  名前:
  <input type="text" bind:value={textName} placeholder="入力してください" />
</label>
<p class="binding-out">name = "{textName}"</p>

<label>
  メール:
  <input type="email" bind:value={textEmail} placeholder="user@example.com" />
</label>
<p class="binding-out">email = "{textEmail}"</p>

<label>
  年齢:
  <input type="number" bind:value={textAge} />
</label>
<p class="binding-out">age = {textAge} (型: {typeof textAge})</p>

<h4>② チェックボックス</h4>
<label>
  <input type="checkbox" bind:checked={checkboxAgreed} />
  利用規約に同意する
</label>
<p class="binding-out">agreed = {checkboxAgreed}</p>

<h4>③ ラジオボタン(bind:group で 1 つの値に束ねる)</h4>
<label>
  <input type="radio" bind:group={radioOption} value="option1" />
  Option 1
</label>
<label>
  <input type="radio" bind:group={radioOption} value="option2" />
  Option 2
</label>
<label>
  <input type="radio" bind:group={radioOption} value="option3" />
  Option 3
</label>
<p class="binding-out">selected = "{radioOption}"</p>

<h4>④ セレクトボックス(単一選択)</h4>
<select bind:value={selectFruit}>
  <option value="">選択してください</option>
  <option value="apple">Apple</option>
  <option value="banana">Banana</option>
  <option value="orange">Orange</option>
</select>
<p class="binding-out">fruit = "{selectFruit}"</p>

<h4>⑤ セレクトボックス(複数選択、Ctrl/Cmd で選択)</h4>
<select multiple bind:value={multiColors} size="3">
  <option value="red">Red</option>
  <option value="green">Green</option>
  <option value="blue">Blue</option>
</select>
<p class="binding-out">colors = {JSON.stringify(multiColors)}</p>

<h4>⑥ テキストエリア</h4>
<textarea
  bind:value={textareaContent}
  placeholder="複数行のテキストが入力できます"
  rows="3"
></textarea>
<p class="binding-out">content = "{textareaContent}" ({textareaContent.length} 文字)</p>

<style>
  h4 {
    margin: 1rem 0 0.25rem;
    font-size: 0.85rem;
  }
  label {
    display: inline-block;
    margin: 0.25rem 0.5rem 0.25rem 0;
  }
  input[type="text"],
  input[type="email"],
  input[type="number"],
  select,
  textarea {
    margin-left: 0.25rem;
    padding: 0.25rem 0.4rem;
    border: 1px solid #888;
    border-radius: 3px;
    background: #fff;
    color: #222;
  }
  textarea {
    width: 100%;
    box-sizing: border-box;
    font-family: inherit;
  }
  .binding-out {
    margin: 0.15rem 0 0.5rem 1rem;
    font-family: monospace;
    color: #ff3e00;
    font-size: 0.85rem;
    font-weight: 600;
  }
</style>
```

:::tip[`bind:value` の型変換]

`<input type="number">` に `bind:value` すると、文字列ではなく **`number` 型** で変数に値が入ります（デモの「年齢」の `typeof` 表示で確認できます）。同様に `type="checkbox"` の `bind:checked` は `boolean`、`type="date"` は `Date` 型に自動変換されます。Svelte が要素の type に応じて適切な型変換を内部で行ってくれます。

:::

:::caution[`bind:group` と `bind:value` の使い分け]

- **ラジオボタン**: 同じグループの中から 1 つを選ぶ → `bind:group={変数}` を各 input に書き、`value="..."` で各選択肢の値を指定
- **チェックボックス（複数選択）**: 配列を作る → `bind:group={配列変数}` を各 input に書く
- **セレクトボックス**: `bind:value={変数}`（`<select>` 自体にバインド）

ラジオとセレクトは外見が似ていても **バインド方法が異なる** 点に注意してください。

:::

<Admonition type="info" title="技術詳解">

Svelte 5では新しい`$state`ルーンが導入され、リアクティビティの扱い方が変わりました。`bind:`との違いについて詳しく知りたい場合は、以下の記事を参照してください。

<ul>
<li><a href="/deep-dive/reactive-state-variables-vs-bindings/">$state: リアクティブな状態変数と、バインディングの違い</a> - <code>$state</code>と<code>bind:</code>構文の違いと使い分けを解説</li>
</ul>

</Admonition>
<Admonition type="info" title="コンポーネントの合成について">

Svelte 5では、コンポーネントの合成方法が`<slot />`から`children`パターンに変更されました。`@render`ディレクティブを使用した新しいパターンについて詳しく知りたい場合は、[テンプレート構文 - 制御フローとアノテーション](/svelte/basics/template-syntax/)ページの「@render - Snippetsとchildrenのレンダリング」セクションを参照してください。

</Admonition>

## まとめ

このページで学んだこと

- Svelte コンポーネントの 3 つの主要部分（script / markup / style）
- `$state` でのリアクティブな状態管理、`$props` での親子データ受け渡し
- テンプレート式（式展開）と JS 式の関係（三項演算子・論理 AND・関数呼び出し）
- イベントハンドリングと修飾子（Svelte 4 → 5 の移行ポイント）
- 双方向データバインディング（`bind:`）
- スコープ付きスタイルとグローバルスタイル
- 動的なスタイルとクラスの適用

ブロック構文（`&#123;#if&#125;` / `&#123;#each&#125;` / `&#123;#await&#125;` 等）やアノテーション（`@render` / `@html` / `@const` 等）は [テンプレート構文](/svelte/basics/template-syntax/) ページで網羅的に解説しています。

<Admonition type="info" title="関連トピック">

<ul>
<li>DOM 要素を直接操作する必要がある場合は、<a href="{base}/svelte/basics/actions/">use: アクション</a> や <a href="{base}/svelte/basics/attachments/"><code>&#123;@attach&#125;</code></a> を学ぶとより高度な操作が可能になります</li>
<li>本格的な実装例として <a href="{base}/examples/todo-app/">TODO アプリ実装例</a>（<code>svelte5-todo-example</code> リポジトリ・ライブデモ付き）も参照してください</li>
</ul>

</Admonition>

## 次のステップ

<a href="{base}/svelte/basics/typescript-integration/">TypeScript統合</a>では、SvelteでTypeScriptを効果的に使用する方法を詳しく学びます。
