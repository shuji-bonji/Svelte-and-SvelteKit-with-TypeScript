---
title: Hello World
description: 最初のSvelteコンポーネントを作成する
---

プログラミング学習の第一歩は「Hello World」から始まります。このページでは、最初のSvelteコンポーネントを作成し、Svelteの基本的な仕組みを理解します。

## 最初のSvelteコンポーネント

Svelteコンポーネントは`.svelte`拡張子を持つファイルです。最もシンプルなコンポーネントは、HTMLをそのまま書くだけで動作します。

```svelte
<!-- HelloWorld.svelte -->
<h1>Hello World!</h1>
```

これだけで完全に有効なSvelteコンポーネントです。ビルド時に、このコンポーネントは効率的なJavaScriptコードに変換されます。

## 動的な値を表示する

変数の値を表示するには、`{}`（中括弧）を使用します：

```svelte
<script>
  let message = 'Hello World!';
  let name = 'Svelte';
</script>

<h1>{message}</h1>
<p>Welcome to {name}</p>
```

### TypeScriptバージョン

TypeScriptを使用する場合は、`<script lang="ts">`を指定します：

```svelte
<script lang="ts">
  let message: string = 'Hello World!';
  let name: string = 'Svelte';
  let version: number = 5;
</script>

<h1>{message}</h1>
<p>Welcome to {name} {version}</p>
```

## JavaScript式の埋め込み

中括弧内では、任意のJavaScript式を使用できます：

```svelte
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

HTML属性にも動的な値を設定できます：

```svelte
<script lang="ts">
  let src: string = '/images/logo.png';
  let alt: string = 'Company Logo';
  let width: number = 200;
  let isDisabled: boolean = false;
</script>

<img {src} {alt} width={width} />
<button disabled={isDisabled}>Click me</button>

<!-- 省略記法：変数名と属性名が同じ場合 -->
<img {src} {alt} />
```

## HTMLの直接出力

通常、Svelteは文字列をエスケープしてXSS攻撃を防ぎます。信頼できるHTMLを直接出力する場合は`@html`を使用します：

```svelte
<script lang="ts">
  let htmlContent: string = '<strong>太字</strong>のテキスト';
  
  // 危険：ユーザー入力を直接HTMLとして出力しない
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

Svelteコンポーネント内では、HTMLコメントとJavaScriptコメントの両方が使用できます：

```svelte
<script lang="ts">
  // JavaScriptの単一行コメント
  let message: string = 'Hello';
  
  /* 
    JavaScriptの
    複数行コメント
  */
</script>

<!-- HTMLコメント：ブラウザのソースに表示される -->
<h1>{message}</h1>

{#if false}
  <!-- この部分は条件がfalseなので表示されない -->
  <p>非表示のコンテンツ</p>
{/if}
```

## デバッグ出力

開発中のデバッグには`{@debug}`を使用できます：

```svelte
<script lang="ts">
  let user = {
    name: 'Alice',
    age: 30,
    email: 'alice@example.com'
  };
</script>

<!-- 開発時のみ：変数の値をコンソールに出力 -->
{@debug user}

<p>Name: {user.name}</p>
<p>Age: {user.age}</p>
```

`{@debug}`タグに到達すると、ブラウザの開発者ツールでデバッガーが一時停止し、指定した変数の値を確認できます。

## 実践例：インタラクティブなHello World

ボタンクリックで挨拶を変更する簡単な例：

```svelte
<script lang="ts">
  let greetings: string[] = [
    'Hello World!',
    'こんにちは、世界！',
    'Bonjour le monde!',
    '¡Hola Mundo!',
    'Hallo Welt!'
  ];
  
  let currentIndex: number = 0;
  let currentGreeting: string = greetings[currentIndex];
  
  function nextGreeting(): void {
    currentIndex = (currentIndex + 1) % greetings.length;
    currentGreeting = greetings[currentIndex];
  }
</script>

<div class="greeting-container">
  <h1>{currentGreeting}</h1>
  <button on:click={nextGreeting}>
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

## まとめ

このページで学んだこと：

- Svelteコンポーネントの基本構造
- 変数の表示と式の埋め込み
- HTML属性への値のバインド
- `@html`ディレクティブの使用（注意事項含む）
- デバッグ機能の活用
- TypeScriptとの統合

## 次のステップ

[コンポーネントの基本](/svelte-basics/component-basics/)では、Svelteコンポーネントの3つの主要部分（script、markup、style）について詳しく学びます。