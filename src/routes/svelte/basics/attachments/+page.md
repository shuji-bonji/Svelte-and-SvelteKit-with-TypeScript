---
title: '{@attach} - 新しいDOM操作パターン'
description: Svelte 5.29+の{@attach}ディレクティブでリアクティブなDOM操作を実現。use:アクションとの違い、Attachment factories、外部ライブラリ統合をTypeScriptで解説
---

<script>
	import Admonition from '$lib/components/Admonition.svelte';
</script>

`&#123;@attach&#125;` は、Svelte 5.29 で追加された新しい DOM 操作パターンです。
従来の `use:` アクションと似ていますが、エフェクト内で実行されるためリアクティブに動作します。

## この記事で学べること

- `&#123;@attach&#125;` の基本的な使い方
- `use:` アクションとの違い
- Attachment factories パターン
- 外部ライブラリ（tippy.js など）との統合
- コンポーネントへのアタッチメント適用
- `svelte/attachments` ユーティリティの使い方

<Admonition type="info" title="バージョン要件">

`&#123;@attach&#125;` は Svelte 5.29 以降で利用可能です。

</Admonition>

## 基本的な使い方

アタッチメントは、要素が DOM にマウントされたときに実行される関数です。
オプションでクリーンアップ関数を返すことができます。

以下の例では、要素のマウント時にログを出力し、アンマウント時にクリーンアップを行います。

```svelte
<script lang="ts">
  import type { Attachment } from 'svelte/attachments';

  // アタッチメント関数を定義
  const myAttachment: Attachment = (element) => {
    console.log('マウントされた:', element.nodeName);

    // クリーンアップ関数を返す
    return () => {
      console.log('アンマウントされた');
    };
  };
</script>

<div {@attach myAttachment}>
  コンテンツ
</div>
```

要素には複数のアタッチメントを適用できます。

```svelte
<div {@attach attachment1} {@attach attachment2}>
  コンテンツ
</div>
```

## use:アクションとの違い

`&#123;@attach&#125;` と `use:` アクションは似ていますが、重要な違いがあります。最も大きな違いは、`&#123;@attach&#125;` がエフェクト内で実行されるため、依存する状態の変更を自動的に追跡できることです。

| 項目               | `use:` アクション        | `&#123;@attach&#125;`        |
| ------------------ | ------------------------ | ---------------------------- |
| 実行タイミング     | マウント時のみ           | エフェクト内（リアクティブ） |
| 状態変更時         | 手動で `update()` を呼ぶ | 自動的に再実行               |
| 依存関係の追跡     | なし                     | 自動追跡                     |
| コンポーネント対応 | ❌                       | ✅                           |
| 利用可能バージョン | Svelte 3+                | Svelte 5.29+                 |

### use:アクションの場合

従来の `use:` アクションでは、引数の変更を検知するために `update` 関数を明示的に定義する必要があります。

```svelte
<script lang="ts">
  import type { Action } from 'svelte/action';

  let content = $state('Hello');

  // アクションは更新時にupdate関数を明示的に呼び出す必要がある
  const tooltip: Action<HTMLElement, string> = (node, initialContent) => {
    let currentContent = initialContent;

    function show() {
      node.title = currentContent;
    }

    show();

    return {
      // contentが変更されたらupdate関数が呼ばれる
      update(newContent) {
        currentContent = newContent;
        show();
      },
      destroy() {
        node.title = '';
      }
    };
  };
</script>

<button use:tooltip={content}>ホバーしてね</button>
```

### @attach の場合

`&#123;@attach&#125;` では、引数の変更を自動的に追跡するため、`update` 関数を定義する必要がありません。アタッチメントファクトリーを使用して、引数を受け取るパターンで実装します。

```svelte
<script lang="ts">
  import type { Attachment } from 'svelte/attachments';

  let content = $state('Hello');

  // contentが変更されると自動的に再実行される
  function tooltip(text: string): Attachment {
    return (element) => {
      element.title = text;

      return () => {
        element.title = '';
      };
    };
  }
</script>

<!-- contentの変更を自動追跡 -->
<button {@attach tooltip(content)}>ホバーしてね</button>
```

<Admonition type="tip" title="どちらを使うべきか">

<ul>
<li><strong>新規プロジェクト</strong>: <code>&#123;@attach&#125;</code> を推奨（リアクティブで扱いやすい）</li>
<li><strong>既存ライブラリの利用</strong>: <code>fromAction()</code> で変換して <code>&#123;@attach&#125;</code> を使用</li>
<li><strong>コンポーネントへの適用</strong>: <code>&#123;@attach&#125;</code> のみ対応</li>
</ul>
:::

## Attachment factories

アタッチメントを返す関数を「Attachment factory」と呼びます。
引数を受け取って動的なアタッチメントを生成できます。これにより、リアクティブな引数に基づいて DOM 操作を行えます。

### tippy.js との統合例

外部ライブラリ [tippy.js](https://atomiks.github.io/tippyjs/) と統合する例です。`content` が変更されると、アタッチメントが自動的に再実行され、新しいツールチップが作成されます。

</Admonition>

```svelte
<script lang="ts">
  import tippy from 'tippy.js';
  import type { Attachment } from 'svelte/attachments';

  let content = $state('こんにちは！');

  // Attachment factory: contentを引数に取り、Attachmentを返す
  function tooltip(content: string): Attachment<HTMLElement> {
    return (element) => {
      const instance = tippy(element, { content });

      // クリーンアップでtippyインスタンスを破棄
      return instance.destroy;
    };
  }
</script>

<input bind:value={content} placeholder="ツールチップの内容" />

<!-- contentが変更されると、アタッチメントが再実行される -->
<button {@attach tooltip(content)}>
  ホバーしてね
</button>
```

### 再実行の仕組み

`&#123;@attach tooltip(content)&#125;` 式はエフェクト内で実行されるため、以下の場合に再実行されます。

<ol>
<li><code>tooltip</code> 関数自体が変更された場合</li>
<li><code>content</code> 引数が変更された場合</li>
<li>アタッチメント関数内で読み取られた状態が変更された場合</li>
</ol>

## インラインアタッチメント

アタッチメントは直接インラインで定義することもできます。`$effect` をネストすることで、初期化処理と更新処理を分離できます。

以下の例では、Canvas の初期化は一度だけ行い、色の変更に応じた描画だけが再実行されます。

```svelte
<script lang="ts">
  let color = $state('#ff3e00');
</script>

<canvas
  width={200}
  height={200}
  {@attach (canvas) => {
    const ctx = canvas.getContext('2d');

    // このエフェクトはcolorの変更時のみ再実行
    $effect(() => {
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    });
  }}
></canvas>

<input type="color" bind:value={color} />
```

:::note[ネストしたエフェクト]
上記の例では、外側のアタッチメント関数は一度だけ実行され、内側の `$effect` は `color` が変更されるたびに実行されます。これにより、`getContext()` の呼び出しを最小限に抑えられます。
:::

## コンポーネントへのアタッチメント

`&#123;@attach&#125;` はコンポーネントに対しても使用できます。
コンポーネントが props をスプレッドすると、アタッチメントも適用されます。これは `use:` アクションでは不可能な機能です。

### ラッパーコンポーネントの例

ボタンをラップするコンポーネントを作成し、外部からアタッチメントを適用する例です。コンポーネント側で `...props` をスプレッドすることで、アタッチメントが内部の要素に伝播します。

```svelte
<!-- Button.svelte -->
<script lang="ts">
  import type { HTMLButtonAttributes } from 'svelte/elements';

  // propsにはアタッチメントも含まれる
  let { children, ...props }: HTMLButtonAttributes = $props();
</script>

<!-- propsをスプレッドするとアタッチメントも適用される -->
<button {...props}>
  {@render children?.()}
</button>
```

```svelte
<!-- App.svelte -->
<script lang="ts">
  import tippy from 'tippy.js';
  import Button from './Button.svelte';
  import type { Attachment } from 'svelte/attachments';

  let content = $state('ボタンのツールチップ');

  function tooltip(content: string): Attachment<HTMLElement> {
    return (element) => {
      const instance = tippy(element, { content });
      return instance.destroy;
    };
  }
</script>

<input bind:value={content} />

<!-- コンポーネントにアタッチメントを適用 -->
<Button {@attach tooltip(content)}>
  ホバーしてね
</Button>
```

## 再実行タイミングの制御

アタッチメントは依存関係が変更されると再実行されますが、これが望ましくない場合があります。特に、高価な初期化処理を含むアタッチメントでは、不要な再実行を避ける工夫が必要です。

### 問題のあるパターン

以下の例では、`bar` が変更されるたびに高価な初期化処理（`veryExpensiveSetupWork`）が再実行されてしまいます。

```svelte
<script lang="ts">
  import type { Attachment } from 'svelte/attachments';

  let bar = $state('initial');

  // 高価な初期化処理を含むアタッチメント
  function foo(bar: string): Attachment {
    return (node) => {
      // 毎回実行される高価な処理
      veryExpensiveSetupWork(node);
      update(node, bar);
    };
  }
</script>

<!-- barが変更されるたびに高価な処理が再実行される -->
<div {@attach foo(bar)}>...</div>
```

### 解決策：内部エフェクトを使用

引数を関数として受け取り、内部で `$effect` を使用することで、初期化処理と更新処理を分離できます。

```svelte
<script lang="ts">
  import type { Attachment } from 'svelte/attachments';

  let bar = $state('initial');

  // 引数を関数として受け取る
  function foo(getBar: () => string): Attachment {
    return (node) => {
      // 初期化は一度だけ
      veryExpensiveSetupWork(node);

      // barの変更時はこのエフェクトだけが再実行される
      $effect(() => {
        update(node, getBar());
      });
    };
  }
</script>

<!-- 関数として渡す -->
<div {@attach foo(() => bar)}>...</div>
```

## svelte/attachments ユーティリティ

`svelte/attachments` モジュールは、アタッチメントを扱うためのユーティリティを提供します。これらは主にライブラリ開発者向けですが、既存のアクションをアタッチメントに変換する場合にも有用です。

### createAttachmentKey

プログラマティックにアタッチメントを作成するための関数です。オブジェクトの props にアタッチメントを含める場合に使用します。

```svelte
<script lang="ts">
  import { createAttachmentKey } from 'svelte/attachments';

  // オブジェクトにアタッチメントを含める
  const props = {
    class: 'button',
    onclick: () => alert('クリック！'),
    // アタッチメントとして認識されるキーを作成
    [createAttachmentKey()]: (node: HTMLElement) => {
      node.dataset.attached = 'true';
      console.log('アタッチされた:', node);
    }
  };
</script>

<!-- propsをスプレッドするとアタッチメントも適用される -->
<button {...props}>クリック</button>
```

### fromAction

既存の `use:` アクションをアタッチメントに変換する関数です。
サードパーティライブラリが提供するアクションを `&#123;@attach&#125;` 構文で使用したい場合や、コンポーネントに適用したい場合に便利です。

```svelte
<script lang="ts">
  import { fromAction } from 'svelte/attachments';
  import { someLibraryAction } from 'some-library';

  let options = $state({ theme: 'dark' });
</script>

<!-- use:アクションの場合 -->
<div use:someLibraryAction={options}>...</div>

<!-- アタッチメントに変換（引数は関数で渡す） -->
<div {@attach fromAction(someLibraryAction, () => options)}>...</div>
```

<Admonition type="warning" title="fromAction の第二引数">

`fromAction` の第二引数は、アクションに渡す引数そのものではなく、**引数を返す関数**である必要があります。

</Admonition>

## 型定義

TypeScript でアタッチメントを型安全に扱うための型定義です。`Attachment` 型はジェネリクスで要素の型を指定でき、より厳密な型チェックが可能です。

```typescript
import type { Attachment } from 'svelte/attachments';

// 基本的なアタッチメント
const basicAttachment: Attachment = (element) => {
  // element は Element 型
  console.log(element.tagName);
};

// 特定の要素型を指定
const buttonAttachment: Attachment<HTMLButtonElement> = (element) => {
  // element は HTMLButtonElement 型
  console.log(element.disabled);
};

// Attachment factory
function createTooltip(content: string): Attachment<HTMLElement> {
  return (element) => {
    element.title = content;
    return () => {
      element.title = '';
    };
  };
}
```

## use:アクションからの移行

既存の `use:` アクションを `&#123;@attach&#125;` に移行する方法です。2 ステップで段階的に移行することで、既存のコードを安全に更新できます。

### ステップ 1: fromAction を使用（即座に移行）

まず `fromAction` を使用して、既存のアクションをそのままアタッチメントとして使用できるようにします。

```svelte
<script lang="ts">
  import { fromAction } from 'svelte/attachments';
  import { existingAction } from './actions';

  let value = $state('hello');
</script>

<!-- 変更前 -->
<div use:existingAction={value}>...</div>

<!-- 変更後 -->
<div {@attach fromAction(existingAction, () => value)}>...</div>
```

### ステップ 2: ネイティブなアタッチメントに書き換え

時間があるときに、アクションをネイティブなアタッチメントとして書き直します。これにより、リアクティビティの自動追跡など、アタッチメントの利点を最大限に活用できます。

```svelte
<script lang="ts">
  import type { Attachment } from 'svelte/attachments';

  let value = $state('hello');

  // 新しいアタッチメント関数
  function myAttachment(value: string): Attachment<HTMLElement> {
    return (element) => {
      // 初期化処理
      element.dataset.value = value;

      return () => {
        // クリーンアップ
        delete element.dataset.value;
      };
    };
  }
</script>

<div {@attach myAttachment(value)}>...</div>
```

## 実践例：ドラッグ可能な要素

以下は、`&#123;@attach&#125;` を使用してドラッグ可能な要素を実装する完全な例です。マウスイベントの設定とクリーンアップを適切に行っています。

```svelte
<script lang="ts">
  import type { Attachment } from 'svelte/attachments';

  let position = $state({ x: 0, y: 0 });

  function draggable(): Attachment<HTMLElement> {
    return (element) => {
      let startX = 0;
      let startY = 0;
      let initialX = 0;
      let initialY = 0;

      function handleMouseDown(e: MouseEvent) {
        startX = e.clientX;
        startY = e.clientY;
        initialX = position.x;
        initialY = position.y;

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
      }

      function handleMouseMove(e: MouseEvent) {
        position.x = initialX + (e.clientX - startX);
        position.y = initialY + (e.clientY - startY);
      }

      function handleMouseUp() {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      }

      element.addEventListener('mousedown', handleMouseDown);
      element.style.cursor = 'grab';

      return () => {
        element.removeEventListener('mousedown', handleMouseDown);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    };
  }
</script>

<div
  {@attach draggable()}
  style="
    position: absolute;
    left: {position.x}px;
    top: {position.y}px;
    padding: 1rem;
    background: #ff3e00;
    color: white;
    border-radius: 8px;
  "
>
  ドラッグして移動
</div>
```

## まとめ

`&#123;@attach&#125;` は Svelte 5.29 で追加された、リアクティブな DOM 操作のための新しいパターンです。

- **リアクティブ**: 依存関係の変更を自動追跡して再実行
- **コンポーネント対応**: `use:` アクションと違い、コンポーネントにも適用可能
- **型安全**: TypeScript との統合が優れている
- **移行が容易**: `fromAction()` で既存のアクションを変換可能

新規プロジェクトでは `&#123;@attach&#125;` を、既存プロジェクトでは段階的に移行することを推奨します。

## 次のステップ

- [use:アクション](/svelte/basics/actions/) - 従来のアクション構文
- [コンポーネントライフサイクル](/svelte/basics/component-lifecycle/) - マウント/アンマウントの詳細
- [$effect - 副作用](/svelte/runes/effect/) - エフェクトとの関係
