---
title: Hello World
description: 最初のSvelteコンポーネントを作成する
---

プログラミング学習の第一歩は「Hello World」から始まります。このページでは、最初のSvelteコンポーネントを作成し、Svelteの基本的な仕組みを理解します。

## 環境構築で生成されたファイルを確認

[前のページ](/introduction/setup/)で環境構築を行うと、`src/routes/+page.svelte`というファイルが生成されます。これがホームページとなる最初のSvelteコンポーネントです。

### 生成される基本的な構造

```svelte
<!-- src/routes/+page.svelte -->
<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>
```

## 最初のSvelteコンポーネント

Svelteコンポーネントは`.svelte`拡張子を持つファイルです。最もシンプルなコンポーネントは、HTMLをそのまま書くだけで動作します。

生成された`+page.svelte`を以下のように書き換えてみましょう 。

```svelte
<!-- src/routes/+page.svelte -->
<h1>Hello World!</h1>
```

これだけで完全に有効なSvelteコンポーネントです。ビルド時に、このコンポーネントは効率的なJavaScriptコードに変換されます。

## 動的な値を表示する

変数の値を表示するには、`{}`（中括弧）を使用します。`src/routes/+page.svelte`を更新してみましょう 。

```svelte
<!-- src/routes/+page.svelte -->
<script>
  let message = 'Hello World!';
  let name = 'Svelte';
</script>

<h1>{message}</h1>
<p>Welcome to {name}</p>
```

### TypeScriptを利用

TypeScriptを使用する場合は、`<script lang="ts">`を指定します。

```svelte
<!-- src/routes/+page.svelte -->
<script lang="ts">
  let message: string = 'Hello World!';
  let name: string = 'Svelte';
  let version: number = 5;
</script>

<h1>{message}</h1>
<p>Welcome to {name} {version}</p>
```

## JavaScript式の埋め込み

中括弧内では、任意のJavaScript式を使用できます。

```svelte
<!-- src/routes/+page.svelte -->
<script lang="ts">
  let count: number = 0;
  let items: string[] = ['Apple', 'Banana', 'Orange'];
</script>

<p>Count: {count}</p>
<p>Double: {count * 2}</p>
<p>Items: {items.length}</p>
<p>First item: {items[0]}</p>
<p>Current time: {new Date().toLocaleTimeString()}</p>
```

## 属性への値のバインド

HTML属性にも動的な値を設定できます。

```svelte
<script lang="ts">
  let src: string = '/images/logo.png';
  let alt: string = 'Company Logo';
  let width: number = 200;
  let isDisabled: boolean = false;
</script>

<img {src} {alt} width={width} />
<button disabled={isDisabled}>Click me</button>

<!-- 省略記法。変数名と属性名が同じ場合 -->
<img {src} {alt} />
```

## HTMLの直接出力

通常、Svelteは文字列をエスケープしてXSS攻撃を防ぎます。信頼できるHTMLを直接出力する場合は`@html`を使用します。

```svelte
<script lang="ts">
  let htmlContent: string = '<strong>太字</strong>のテキスト';
  
  // 危険。ユーザー入力を直接HTMLとして出力しない
  let userInput: string = ''; // ユーザーからの入力
</script>

<!-- エスケープされて表示される -->
<p>{htmlContent}</p>

<!-- HTMLとして解釈される（注意して使用） -->
<p>{@html htmlContent}</p>

<!-- 絶対にやってはいけない例 -->
<!-- <p>{@html userInput}</p> -->
```

:::warning
`@html`の使用には注意が必要です。ユーザーからの入力や信頼できないソースからのコンテンツを直接HTMLとして出力すると、XSS（クロスサイトスクリプティング）攻撃の危険があります。
:::

## コメント

Svelteコンポーネント内では、HTMLコメントとJavaScriptコメントの両方が使用できます。

```svelte
<script lang="ts">
  // JavaScriptの単一行コメント
  let message: string = 'Hello';
  
  /* 
    JavaScriptの
    複数行コメント
  */
</script>

<!-- HTMLコメント。ブラウザのソースに表示される -->
<h1>{message}</h1>

{#if false}
  <!-- この部分は条件がfalseなので表示されない -->
  <p>非表示のコンテンツ</p>
{/if}
```

## デバッグ出力

開発中のデバッグには`{@debug}`を使用できます。

```svelte
<script lang="ts">
  let user = {
    name: 'Alice',
    age: 30,
    email: 'alice@example.com'
  };
</script>

<!-- 開発時のみ。変数の値をコンソールに出力 -->
{@debug user}

<p>Name: {user.name}</p>
<p>Age: {user.age}</p>
```

`{@debug}`タグに到達すると、ブラウザの開発者ツールでデバッガーが一時停止し、指定した変数の値を確認できます。

:::note[デバッガーはブラウザの開発者ツールを利用しているときに動作します。]
:::

## 実践例：インタラクティブなHello World

ここまでは基本的な表示方法を学びました。次に`src/routes/+page.svelte`をインタラクティブなコンポーネントに更新してみましょう。

### 従来の書き方

まず、従来のSvelteの書き方を見てみましょう。

```svelte
<!-- src/routes/+page.svelte（従来の書き方） -->
<script lang="ts">
  let count: number = 0;
  
  function increment(): void {
    count = count + 1;
  }
</script>

<button on:click={increment}>
  Count: {count}
</button>
```

### Svelte 5の新しい書き方（Runes）

Svelte 5では、`$state`ルーンを使ってより明示的にリアクティビティを表現します。

```svelte live ln title=Counter.svelte
<script lang="ts">
  // Svelte 5の新しい書き方
  let count = $state(0);
  
  function increment(): void {
    count++;  // 直接変更が可能
  }
</script>

<div style="text-align: center; padding: 2rem;">
  <h2>Svelte 5 カウンター</h2>
  <button onclick={increment} style="padding: 0.5rem 1rem; font-size: 1.2rem;">
    Count: {count}
  </button>
  <p style="margin-top: 1rem;">
    ボタンをクリックすると、$stateによってUIが自動更新されます
  </p>
</div>
```
:::tip[Click fold/expand code をクリックするとコードが展開表示されます。]
:::

:::tip[違いのポイント]
- **従来**: `let`で宣言した変数が自動的にリアクティブ
- **Svelte 5**: `$state()`で明示的にリアクティブな状態を宣言
- **イベント**: `on:click`から`onclick`へ（より標準的なHTML構文に）
:::

### 多言語挨拶の例

ボタンクリックで挨拶を変更する例も、Svelte 5スタイルで書いてみましょう。

```svelte live ln title=HelloWorld.svelte
<script lang="ts">
  // Svelte 5: $stateを使用
  let greetings = $state([
    'Hello World!',
    'こんにちは、世界！',
    'Bonjour le monde!',
    '¡Hola Mundo!',
    'Hallo Welt!'
  ]);
  
  let currentIndex = $state(0);
  
  function nextGreeting(): void {
    currentIndex = (currentIndex + 1) % greetings.length;
  }
</script>

<div class="greeting-container">
  <h2>{greetings[currentIndex]}</h2>
  <button onclick={nextGreeting}>
    次の言語
  </button>
  <p>言語 {currentIndex + 1} / {greetings.length}</p>
</div>

<style>
  .greeting-container {
    text-align: center;
    padding: 2rem;
  }
  
  h1 {
    color: #ff3e00;
    font-size: 2.5rem;
    margin-bottom: 1rem;
  }
  
  button {
    background: #ff3e00;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
  }
  
  button:hover {
    background: #ff5a00;
  }
</style>
```

:::tip[Click fold/expand code をクリックするとコードが展開表示されます。]
:::


## まとめ

このページで学んだこと

- Svelteコンポーネントの基本構造
- 変数の表示と式の埋め込み
- HTML属性への値のバインド
- `@html`ディレクティブの使用（注意事項含む）
- デバッグ機能の活用
- TypeScriptとの統合
- Svelte 5のRunesシステム（`$state`）の基本

## 次のステップ

[なぜTypeScriptが必要か](/introduction/why-typescript/)では、モダンなWeb開発におけるTypeScriptの重要性と、Svelte 5との相性について学びます。その後、[TypeScript設定](/introduction/typescript-setup/)で実際のプロジェクト設定を行います。