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

```svelte
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

コンポーネント間でデータを渡すには Svelte 5 の `$props` ルーンを使います。詳細は [$props - プロパティ]({base}/svelte/runes/props/) で扱います。ここではまず Script ブロックの基本構造を押さえることに集中しましょう。

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

## Markup部分の詳細

### テンプレート構文の基本

Svelteのテンプレート構文には、HTMLを拡張した特殊な構文があります。ここでは最も基本的な制御フロー構文（条件分岐、ループ、非同期処理）を解説します。

<Admonition type="tip" title="より高度なテンプレート構文">

`@render`、`@html`、`@const`、`@debug`などのアノテーションや、`&#123;#key&#125;`、`&#123;#snippet&#125;`などの特殊ブロックについては、[テンプレート構文 - 特殊タグとアノテーション](/svelte/basics/template-syntax/)ページで詳しく解説しています。

</Admonition>

### 条件分岐 - ifブロック

`&#123;#if&#125;`ブロックは、条件に基づいてテンプレートの一部を表示・非表示にするための基本的なテンプレート構文です。下の例では **ログイン状態のチェックボックス** と **スコアのスライダー** を操作すると、3 種類の if 分岐がそれぞれリアルタイムで切り替わる様子を観察できます。

```svelte live
<script lang="ts">
  let isLoggedIn = $state(false);
  let score = $state(85);
</script>

<div class="controls">
  <label>
    <input type="checkbox" bind:checked={isLoggedIn} />
    ログイン状態
  </label>
  <label>
    スコア: {score}
    <input type="range" min="0" max="100" bind:value={score} />
  </label>
</div>

<!-- if 文（条件が真のときだけ表示） -->
<section>
  <h4>if 文</h4>
  {#if isLoggedIn}
    <p>✓ ログイン済み</p>
  {/if}
</section>

<!-- if-else 文 -->
<section>
  <h4>if-else 文</h4>
  {#if score >= 80}
    <p>優秀！</p>
  {:else}
    <p>もう少し頑張りましょう</p>
  {/if}
</section>

<!-- if-else if-else 文 -->
<section>
  <h4>if-else if-else 文</h4>
  {#if score >= 90}
    <p>素晴らしい！</p>
  {:else if score >= 70}
    <p>良い成績です</p>
  {:else if score >= 60}
    <p>合格です</p>
  {:else}
    <p>再試験が必要です</p>
  {/if}
</section>

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
  section {
    margin: 0.5rem 0;
    padding: 0.5rem 0.75rem;
    border-left: 3px solid #ff3e00;
  }
  section h4 {
    margin: 0 0 0.25rem;
    font-size: 0.8rem;
  }
  section p {
    margin: 0;
  }
</style>
```

### ループ処理 - eachブロック

`&#123;#each&#125;`ブロックは、配列やイテラブルオブジェクトをループ処理するためのテンプレート構文です。**項目が一意な ID を持つ場合は、必ず `(item.id)` のように key を指定** してください。これにより Svelte は項目の追加・削除・並び替えを正確に追跡でき、DOM 更新が効率化されるだけでなく、入力フォーカスやトランジションも正しく維持されます。

下の例では「追加」「末尾削除」「全消去」ボタンで配列を操作すると、3 種類の `{#each}` パターン（基本・インデックス付き・空フォールバック）がすべて連動して更新される様子が観察できます。

```svelte live
<script lang="ts">
  interface Item {
    id: number;
    name: string;
    price: number;
  }

  let items = $state<Item[]>([
    { id: 1, name: 'Apple', price: 100 },
    { id: 2, name: 'Banana', price: 80 },
    { id: 3, name: 'Orange', price: 120 }
  ]);

  let nextId = 4;
  const samples = ['Grape', 'Mango', 'Pear', 'Kiwi', 'Peach'];

  function addItem() {
    const name = samples[Math.floor(Math.random() * samples.length)];
    const price = Math.floor(Math.random() * 200) + 50;
    items.push({ id: nextId++, name, price });
  }

  function removeLast() {
    items.pop();
  }

  function clear() {
    items.length = 0;
  }
</script>

<div class="controls">
  <button onclick={addItem}>追加</button>
  <button onclick={removeLast} disabled={items.length === 0}>末尾削除</button>
  <button onclick={clear} disabled={items.length === 0}>全消去</button>
</div>

<!-- 基本的な each（key 付きが推奨デフォルト） -->
<h4>基本的な each</h4>
<ul>
  {#each items as item (item.id)}
    <li>{item.name}: ¥{item.price}</li>
  {/each}
</ul>

<!-- インデックス付き each -->
<h4>インデックス付き each</h4>
<ul>
  {#each items as item, index (item.id)}
    <li>{index + 1}. {item.name}</li>
  {/each}
</ul>

<!-- 空配列のフォールバック（{:else}） -->
<h4>空配列のフォールバック</h4>
<ul>
  {#each items as item (item.id)}
    <li>{item.name}</li>
  {:else}
    <li><em>アイテムがありません（「全消去」を試してください）</em></li>
  {/each}
</ul>

<style>
  .controls {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }
  .controls button {
    padding: 0.4rem 0.8rem;
    background: #ff3e00;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  .controls button:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
  h4 {
    margin: 0.75rem 0 0.25rem;
    color: #666;
    font-size: 0.85rem;
  }
  ul {
    margin: 0 0 0.5rem;
    padding-left: 1.25rem;
  }
</style>
```

:::caution[key の選び方]

key には **配列内で一意かつ安定した値** を渡してください（DB の ID、UUID 等）。配列のインデックス（`index`）を key にするのは**避ける**べきです。要素の追加・削除・並び替えで意味が崩れ、Svelte が「同じ key だから同じ要素」と誤認してしまいます。

項目に一意 ID が存在しない場合のみ、key を省略した `{#each items as item}` 形式を使います。

:::

### 非同期処理 - awaitブロック

`&#123;#await&#125;`ブロックは、非同期処理の結果を待機し、**ローディング → 成功 → エラー** の各状態を宣言的に切り替えるテンプレート構文です。Promise の状態に応じて自動的に表示が切り替わります。

下の例では、無料の REST API モック [JSONPlaceholder](https://jsonplaceholder.typicode.com) からユーザー一覧を取得しています。「インタラクティブに試す」を押すと、Playground 上で **実際の通信が走り、ローディング表示 → 取得完了 → 一覧表示** という遷移を観察できます。

```svelte live
<script lang="ts">
  // JSONPlaceholder のユーザー型（学習用に必要なフィールドだけ）
  type User = {
    id: number;
    name: string;
    email: string;
    company: { name: string };
  };

  async function fetchUsers(): Promise<User[]> {
    const response = await fetch('https://jsonplaceholder.typicode.com/users');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  // コンポーネント初期化時に fetch を開始（Promise を保持）
  let usersPromise = fetchUsers();
</script>

<!-- Promise の状態に応じて表示を切り替え -->
{#await usersPromise}
  <p>読み込み中...</p>
{:then users}
  <h3>ユーザー一覧（{users.length} 件）</h3>
  <ul>
    {#each users as user (user.id)}
      <li>
        <strong>{user.name}</strong>
        <small>— {user.email}</small>
        <br />
        <em>{user.company.name}</em>
      </li>
    {/each}
  </ul>
{:catch error}
  <p style="color: tomato;">エラー: {error.message}</p>
{/await}

<!-- {:then} だけの短縮形（成功時のみ処理したい場合）-->
{#await usersPromise then users}
  <p>取得完了: {users.length} 名のユーザー</p>
{/await}

<style>
  ul { line-height: 1.6; }
  small { color: #666; }
  em { color: #888; font-size: 0.85em; }
</style>
```

ポイントを整理すると、

- `&#123;#await promise&#125;` から `&#123;:then&#125;` までの内容が **ローディング中** に表示される
- `&#123;:then 変数名&#125;` で **解決値** を受け取り、成功時の UI を書く
- `&#123;:catch エラー&#125;` で **失敗時** の表示にフォールバック
- `&#123;#await promise then 変数&#125;` のような短縮形もあり、ローディング・エラーを省略して **成功時のみ** 扱える

:::tip[ネットワークエラーを試したい場合]

`fetch` の URL を `'https://jsonplaceholder.typicode.com/users-not-found'` のような **存在しないパス** に書き換えると、`{:catch error}` ブロックの動作を確認できます。`response.ok` チェックを入れているので、404 が `Error` として投げられて catch 側に流れます。

:::

:::caution[Promise の作り直しに注意]

`let usersPromise = fetchUsers()` は **コンポーネントの初期化時に 1 回だけ** 評価されます。ユーザー操作で再フェッチしたい場合は、リフェッチ時に **新しい Promise を代入し直す** 必要があります（例: ボタンの onclick で `usersPromise = fetchUsers()`）。`{#await}` は Promise の参照が変わったことを検知して、再びローディング状態から始めます。

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

<Admonition type="info" title="Svelte 5の変更点">

Svelte 5では、イベントハンドラの記法が`on:click`から標準的なHTML属性の`onclick`に変更されました。よりネイティブなHTMLに近い構文になっています。

</Admonition>

### 基本的なイベント

DOM要素のイベントを処理します。Svelte 5では標準的なHTML属性（`onclick`、`oninput`など）を使用してイベントハンドラーを登録します。

ブラウザの開発ツールでコンソールの出力を確認できます。

```svelte live console
<script lang="ts">
  function handleClick(event: MouseEvent): void {
    // MouseEvent オブジェクトをそのまま渡すと、svelte.dev Playground の Console では
    // 構造化クローンできず表示できないため、必要なフィールドだけ抽出してログする
    console.log('クリックされました', {
      type: event.type,
      x: event.clientX,
      y: event.clientY
    });
  }

  function handleInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    console.log('入力値:', target.value);
  }

  let value: string = '';
</script>

<!-- Svelte 5: 標準的なHTML属性 -->
<button onclick={handleClick}>
  クリック
</button>

<!-- インライン関数 -->
<button onclick={() => console.log('インライン')}>
  インライン関数
</button>

<!-- イベントの伝播を止める場合 -->
<button onclick={(e) => {
  e.preventDefault();
  e.stopPropagation();
  handleClick(e);
}}>
  伝播停止
</button>

<!-- 一度だけ実行する場合 -->
<button onclick={(e) => {
  handleClick(e);
  e.currentTarget.onclick = null;
}}>
  一度だけ
</button>

<!-- 入力イベント -->
<input
  type="text"
  oninput={handleInput}
  bind:value
/>
```

### イベント修飾子の変更

:::warning[Svelte 5 でイベント修飾子は廃止]

Svelte 5 では `on:click\|preventDefault` のようなパイプ記法（イベント修飾子）が **完全に廃止** されました。代わりに、ハンドラ関数の中で **対応する標準 JavaScript メソッド** を直接呼ぶ形に統一されています。

:::

#### 修飾子 → Svelte 5 等価コードの対応表

各修飾子の Svelte 5 での書き方は以下のとおりです（記事では便宜上 `on:click` を例にしていますが、`on:input` などすべてのイベントで同様）。

| 修飾子 | Svelte 5 でハンドラ内に書くコード |
|---|---|
| `preventDefault` | `e.preventDefault()` を呼ぶ |
| `stopPropagation` | `e.stopPropagation()` を呼ぶ |
| `stopImmediatePropagation` | `e.stopImmediatePropagation()` を呼ぶ |
| `once` | 処理後に `e.currentTarget.onclick = null` を代入（または別途状態管理） |
| `self` | `if (e.target === e.currentTarget) { ... }` で判定 |
| `capture` | 標準の `addEventListener(..., { capture: true })` を使う |
| `passive` / `nonpassive` | 同上、`addEventListener` の `{ passive: true/false }` で指定 |

:::tip[なぜ廃止されたか]

この変更は「フレームワーク固有の構文 → 標準 JavaScript パターン」という Svelte 5 全体の方針の一環です。複数の修飾子を組み合わせるとき、関数の中で **順序や条件分岐を自由に制御** できるため、修飾子では表現できなかった「条件付き preventDefault」のようなロジックも自然に書けます。

:::

#### 動作確認（4 種類の挙動を実機で比較）

下のデモは `preventDefault` / `stopPropagation` / `once` / `self` の **4 つの修飾子相当の挙動** を、それぞれ意味のある文脈（フォーム・ネスト要素・カウンタ・親子クリック領域）で実演しています。ボタンを押すたびにログが追記されるので、**何が起き、何が抑止されたのか** が視覚的に確認できます。

```svelte live
<script lang="ts">
  let log = $state<string[]>([]);
  let onceCount = $state(0);

  function addLog(msg: string) {
    log = [...log, `[${log.length + 1}] ${msg}`];
  }

  function clearLog() {
    log = [];
  }

  // ① preventDefault 相当: フォーム送信のページ遷移を抑止
  function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    addLog('preventDefault: フォーム送信のページ遷移を抑止');
  }

  // ② stopPropagation 相当: 子のクリックを親に伝播させない
  function handleParentClick() {
    addLog('親 div: クリックが伝播してきました');
  }

  function handleChildClick(e: MouseEvent) {
    e.stopPropagation();
    addLog('子ボタン: stopPropagation で親への伝播を停止');
  }

  // ③ once 相当: 1 回だけ実行してハンドラを無効化
  function handleOnce(e: MouseEvent) {
    onceCount++;
    addLog(`once 相当: ${onceCount} 回目 (このボタンは以降クリックしても無反応)`);
    (e.currentTarget as HTMLButtonElement).onclick = null;
  }

  // ④ self 相当: イベントの target が currentTarget と一致するときだけ反応
  function handleSelf(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      addLog('self: 親領域自身のクリック → 反応');
    } else {
      addLog('self: 子要素経由のクリック → 無視');
    }
  }
</script>

<button onclick={clearLog}>ログをクリア</button>

<h4>① preventDefault — フォーム送信のページ遷移を抑止</h4>
<form onsubmit={handleSubmit}>
  <button>送信</button>
</form>

<h4>② stopPropagation — 親へのバブリングを抑止</h4>
<div
  class="parent"
  onclick={handleParentClick}
  onkeydown={(e) => e.key === 'Enter' && handleParentClick()}
  role="button"
  tabindex="0"
>
  親 div（黄色エリアをクリック → 親ハンドラが発火）
  <button onclick={handleChildClick}>子ボタン（stopPropagation で親に伝わらない）</button>
</div>

<h4>③ once — 1 回だけ実行</h4>
<button onclick={handleOnce}>一度だけ実行（その後無効化）</button>

<h4>④ self — 親領域自身のクリックだけ反応</h4>
<div
  class="self-zone"
  onclick={handleSelf}
  onkeydown={(e) => e.key === 'Enter' && handleSelf(e as unknown as MouseEvent)}
  role="button"
  tabindex="0"
>
  灰色エリア自身をクリック → 反応 / 内側ボタンをクリック → 無視
  <button>内側のボタン</button>
</div>

<h4>ログ ({log.length})</h4>
<ul class="log">
  {#each log as entry, i (i)}
    <li>{entry}</li>
  {/each}
</ul>

<style>
  h4 {
    margin: 1rem 0 0.25rem;
    font-size: 0.85rem;
  }
  .parent, .self-zone {
    padding: 0.75rem;
    border-radius: 4px;
    margin: 0.25rem 0;
    color: #222; /* 明るい背景に確実に読めるダーク文字色 */
  }
  .parent { background: #fff3e0; border: 1px solid #f57c00; }
  .self-zone { background: #f0f0f0; border: 1px solid #666; }
  button { margin: 0.25rem; padding: 0.4rem 0.8rem; cursor: pointer; }
  ul.log {
    max-height: 220px;
    overflow-y: auto;
    background: #fafafa;
    color: #222;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    border: 1px solid #ddd;
    font-family: monospace;
    font-size: 0.85rem;
  }
  ul.log li { color: #222; }
</style>
```

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

Svelte 5では、コンポーネントの合成方法が`<slot />`から`children`パターンに変更されました。`@render`ディレクティブを使用した新しいパターンについて詳しく知りたい場合は、[テンプレート構文 - 特殊タグとアノテーション](/svelte/basics/template-syntax/)ページの「@render - Snippetsとchildrenのレンダリング」セクションを参照してください。

</Admonition>

## 実践例：TODOアプリケーション

### 子（部品）コンポーネント（TodoItem.svelte）

```svelte
<!-- $lib/components/TodoItem.svelte -->
<script lang="ts">
  interface Todo {
    id: number;
    text: string;
    completed: boolean;
    createdAt: Date;
  }

  interface Props {
    todo: Todo;
    onToggle: (id: number) => void;
    onDelete: (id: number) => void;
  }

  let { todo, onToggle, onDelete }: Props = $props();

  let formattedDate = $derived(
    todo?.createdAt ? todo.createdAt.toLocaleDateString('ja-JP') : ''
  );

  function handleToggle(): void {
    if (todo) {
      onToggle(todo.id);
    }
  }

  function handleDelete(): void {
    if (todo && confirm('削除してもよろしいですか？')) {
      onDelete(todo.id);
    }
  }
</script>

{#if todo}
<div class="todo-item" class:completed={todo.completed}>
  <input
    type="checkbox"
    checked={todo.completed}
    onchange={handleToggle}
  />

  <span class="text">{todo.text}</span>

  <span class="date">{formattedDate}</span>

  <button
    class="delete"
    onclick={handleDelete}
    aria-label="削除"
  >
    ×
  </button>
</div>
{/if}

<style>
  .todo-item {
    display: flex;
    align-items: center;
    padding: 0.5rem;
    border-bottom: 1px solid #eee;
    gap: 0.5rem;
  }

  .todo-item.completed .text {
    text-decoration: line-through;
    opacity: 0.6;
  }

  .text {
    flex: 1;
  }

  .date {
    font-size: 0.8rem;
    color: #666;
  }

  .delete {
    background: #ff4444;
    color: white;
    border: none;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    cursor: pointer;
    font-size: 1.2rem;
    line-height: 1;
  }

  .delete:hover {
    background: #cc0000;
  }
</style>
```

### 親（ページ）コンポーネント（+page.svelte）

```svelte
<!-- src/routes/todos/+page.svelte -->
<script lang="ts">
  import TodoItem from '$lib/components/TodoItem.svelte';

  interface Todo {
    id: number;
    text: string;
    completed: boolean;
    createdAt: Date;
  }

   let todos = $state<Todo[]>([ // 初期データ
    {
      id: 1,
      text: 'Svelte 5を学習する',
      completed: false,
      createdAt: new Date('2024-01-15')
    },
    {
      id: 2,
      text: 'Runesシステムを理解する',
      completed: true,
      createdAt: new Date('2024-01-16')
    },
    {
      id: 3,
      text: 'TODOアプリを作成する',
      completed: false,
      createdAt: new Date('2024-01-17')
    }
  ]);

  let newTodoText = $state('');

  function toggleTodo(id: number) {
    todos = todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
  }

  function deleteTodo(id: number) {
    todos = todos.filter(todo => todo.id !== id);
  }

  function addTodo() {
    if (newTodoText.trim()) {
      const newTodo: Todo = {
        id: Date.now(),
        text: newTodoText,
        completed: false,
        createdAt: new Date()
      };
      todos = [...todos, newTodo];
      newTodoText = '';
    }
  }
</script>

  <div class="add-todo">
    <input
      type="text"
      bind:value={newTodoText}
      placeholder="新しいタスクを入力..."
      onkeydown={(e) => e.key === 'Enter' && addTodo()}
    />
    <button onclick={addTodo}>追加</button>
  </div>

<div class="todo-list">
  {#each todos as todo (todo.id)}
    <TodoItem
      {todo}
      onToggle={toggleTodo}
      onDelete={deleteTodo}
    />
  {/each}
</div>


<style>
  .todo-app {
    max-width: 600px;
    margin: 0 auto;
    padding: 2rem;
  }

  h1 {
    color: #ff3e00;
    text-align: center;
  }

  .add-todo {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 2rem;
  }

  .add-todo input {
    flex: 1;
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
  }

  .add-todo button {
    padding: 0.5rem 1rem;
    background: #ff3e00;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
  }

  .add-todo button:hover {
    background: #ff5a00;
  }

  .todo-list {
    border: 1px solid #eee;
    border-radius: 4px;
    overflow: hidden;
  }

</style>
```

### デモ

以下は、親コンポーネントと子コンポーネントを組み合わせたTODOアプリの完全な例です。実際のプロジェクトでは別ファイルに分けますが、ここではデモのため1つのファイルにまとめています。

```svelte live ln title=TodoApp.svelte
<script lang="ts">
  // 実際のプロジェクトでは以下のようにインポートします
  // import TodoItem from '$lib/components/TodoItem.svelte';

  interface Todo {
    id: number;
    text: string;
    completed: boolean;
    createdAt: Date;
  }

  let todos = $state<Todo[]>([
    {
      id: 1,
      text: 'Svelte 5を学習する',
      completed: false,
      createdAt: new Date('2024-01-15')
    },
    {
      id: 2,
      text: 'Runesシステムを理解する',
      completed: true,
      createdAt: new Date('2024-01-16')
    },
    {
      id: 3,
      text: 'TODOアプリを作成する',
      completed: false,
      createdAt: new Date('2024-01-17')
    }
  ]);

  let newTodoText = $state('');

  function addTodo() {
    if (newTodoText.trim()) {
      const newTodo: Todo = {
        id: Date.now(),
        text: newTodoText,
        completed: false,
        createdAt: new Date()
      };
      todos = [...todos, newTodo];
      newTodoText = '';
    }
  }

  function toggleTodo(id: number) {
    todos = todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
  }

  function deleteTodo(id: number) {
    todos = todos.filter(todo => todo.id !== id);
  }

  let completedCount = $derived(todos.filter(t => t.completed).length);
  let totalCount = $derived(todos.length);

  // インラインコンポーネントとして定義（通常は別ファイル）
  // TodoItem.svelteの内容をここに含める
</script>

<div class="todo-app">
  <h2>TODOリスト</h2>

  <div class="add-todo">
    <input
      type="text"
      bind:value={newTodoText}
      placeholder="新しいタスクを入力..."
      onkeydown={(e) => e.key === 'Enter' && addTodo()}
    />
    <button onclick={addTodo}>追加</button>
  </div>

  <div class="todo-list">
    {#each todos as todo (todo.id)}
      <!-- TodoItemコンポーネントの内容をインラインで展開 -->
      {#if todo}
      <div class="todo-item" class:completed={todo.completed}>
        <input
          type="checkbox"
          checked={todo.completed}
          onchange={() => toggleTodo(todo.id)}
        />

        <span class="text">{todo.text}</span>

        <span class="date">{todo.createdAt.toLocaleDateString('ja-JP')}</span>

        <button
          class="delete"
          onclick={() => {
            if (confirm('削除してもよろしいですか？')) {
              deleteTodo(todo.id);
            }
          }}
          aria-label="削除"
        >
          ×
        </button>
      </div>
      {/if}
    {/each}
  </div>

  {#if totalCount > 0}
    <div class="summary">
      完了: {completedCount} / {totalCount}
    </div>
  {/if}
</div>

<style>
  .todo-app {
    max-width: 600px;
    margin: 0 auto;
    padding: 2rem;
  }

  h1 {
    color: #ff3e00;
    text-align: center;
  }

  .add-todo {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 2rem;
  }

  .add-todo input {
    flex: 1;
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
  }

  .add-todo button {
    padding: 0.5rem 1rem;
    background: #ff3e00;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
  }

  .add-todo button:hover {
    background: #ff5a00;
  }

  .todo-list {
    border: 1px solid #eee;
    border-radius: 4px;
    overflow: hidden;
  }

  .summary {
    text-align: center;
    margin-top: 1rem;
    color: #666;
    font-size: 0.9rem;
  }

  /* TodoItemコンポーネントのスタイル */
  .todo-item {
    display: flex;
    align-items: center;
    padding: 0.5rem;
    border-bottom: 1px solid #eee;
    gap: 0.5rem;
  }

  .todo-item.completed .text {
    text-decoration: line-through;
    opacity: 0.6;
  }

  .todo-item .text {
    flex: 1;
  }

  .todo-item .date {
    font-size: 0.8rem;
    color: #666;
  }

  .todo-item .delete {
    background: #ff4444;
    color: white;
    border: none;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    cursor: pointer;
    font-size: 1.2rem;
    line-height: 1;
  }

  .todo-item .delete:hover {
    background: #cc0000;
  }
</style>
```

## まとめ

このページで学んだこと

- Svelteコンポーネントの3つの主要部分（script、markup、style）
- 条件分岐とループ処理
- イベントハンドリングと修飾子
- 双方向データバインディング
- スコープ付きスタイルとグローバルスタイル
- 動的なスタイルとクラスの適用

<Admonition type="info" title="関連トピック">

DOM要素を直接操作する必要がある場合は、<a href="{base}/svelte/basics/actions/">use:アクション</a>を学ぶことで、より高度な操作が可能になります。

</Admonition>

## 次のステップ

<a href="{base}/svelte/basics/typescript-integration/">TypeScript統合</a>では、SvelteでTypeScriptを効果的に使用する方法を詳しく学びます。
