---
title: '{@attach} - 新しいDOM操作パターン'
description: Svelte 5.29+の{@attach}ディレクティブでリアクティブなDOM操作を実現。use:アクションとの違い、Attachment factories、外部ライブラリ統合をTypeScriptで解説
---

`{@attach}` は、Svelte 5.29 で追加された新しい DOM 操作パターンです。
従来の `use:` アクションと似ていますが、エフェクト内で実行されるためリアクティブに動作します。

## この記事で学べること

- `{@attach}` の基本的な使い方
- `use:` アクションとの違い
- Attachment factories パターン
- 外部ライブラリ（tippy.js など）との統合
- コンポーネントへのアタッチメント適用
- `svelte/attachments` ユーティリティの使い方

:::info[バージョン要件]
`{@attach}` は Svelte 5.29 以降で利用可能です。
:::

## 基本的な使い方

アタッチメントは、要素が DOM にマウントされたときに実行される関数です。
オプションでクリーンアップ関数を返すことができます。

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

`{@attach}` と `use:` アクションは似ていますが、重要な違いがあります。

| 項目               | `use:` アクション        | `{@attach}`                  |
| ------------------ | ------------------------ | ---------------------------- |
| 実行タイミング     | マウント時のみ           | エフェクト内（リアクティブ） |
| 状態変更時         | 手動で `update()` を呼ぶ | 自動的に再実行               |
| 依存関係の追跡     | なし                     | 自動追跡                     |
| コンポーネント対応 | ❌                       | ✅                           |
| 利用可能バージョン | Svelte 3+                | Svelte 5.29+                 |

### use:アクションの場合

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

:::tip[どちらを使うべきか]

- **新規プロジェクト**: `{@attach}` を推奨（リアクティブで扱いやすい）
- **既存ライブラリの利用**: `fromAction()` で変換して `{@attach}` を使用
- **コンポーネントへの適用**: `{@attach}` のみ対応
  :::

## Attachment factories

アタッチメントを返す関数を「Attachment factory」と呼びます。
引数を受け取って動的なアタッチメントを生成できます。

### tippy.js との統合例

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

`{@attach tooltip(content)}` 式はエフェクト内で実行されるため、以下の場合に再実行されます。

1. `tooltip` 関数自体が変更された場合
2. `content` 引数が変更された場合
3. アタッチメント関数内で読み取られた状態が変更された場合

## インラインアタッチメント

アタッチメントは直接インラインで定義することもできます。

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

`{@attach}` はコンポーネントに対しても使用できます。
コンポーネントが props をスプレッドすると、アタッチメントも適用されます。

### ラッパーコンポーネントの例

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

アタッチメントは依存関係が変更されると再実行されますが、これが望ましくない場合があります。

### 問題のあるパターン

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

`svelte/attachments` モジュールは、アタッチメントを扱うためのユーティリティを提供します。

### createAttachmentKey

プログラマティックにアタッチメントを作成するための関数です。
主にライブラリ開発者向けです。

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
ライブラリが提供するアクションをコンポーネントに適用したい場合に便利です。

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

:::warning[fromAction の第二引数]
`fromAction` の第二引数は、アクションに渡す引数そのものではなく、**引数を返す関数**である必要があります。
:::

## 型定義

TypeScript でアタッチメントを型安全に扱うための型定義です。

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

既存の `use:` アクションを `{@attach}` に移行する方法です。

### ステップ 1: fromAction を使用（即座に移行）

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

`{@attach}` は Svelte 5.29 で追加された、リアクティブな DOM 操作のための新しいパターンです。

- **リアクティブ**: 依存関係の変更を自動追跡して再実行
- **コンポーネント対応**: `use:` アクションと違い、コンポーネントにも適用可能
- **型安全**: TypeScript との統合が優れている
- **移行が容易**: `fromAction()` で既存のアクションを変換可能

新規プロジェクトでは `{@attach}` を、既存プロジェクトでは段階的に移行することを推奨します。

## 次のステップ

- [use:アクション](/svelte/basics/actions/) - 従来のアクション構文
- [コンポーネントライフサイクル](/svelte/basics/component-lifecycle/) - マウント/アンマウントの詳細
- [$effect - 副作用](/svelte/runes/effect/) - エフェクトとの関係
