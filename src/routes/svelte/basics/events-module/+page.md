---
title: svelte/events - プログラマティックイベント管理
description: Svelte5のsvelte/eventsモジュールでイベントハンドラをプログラム的に管理。on()ヘルパー関数の使い方、イベント委譲との順序保証、TypeScriptでの型安全な実装を解説
---

<script>
	import { base } from '$app/paths';
	import Admonition from '$lib/components/Admonition.svelte';
  import Mermaid from '$lib/components/Mermaid.svelte';

  const overviewDiagram = `flowchart LR
    subgraph "svelte/events"
      direction TB
      on["on() ヘルパー関数"]
    end

    subgraph "対象要素"
      direction TB
      Window["Window"]
      Document["Document"]
      HTMLElement["HTMLElement"]
      EventTarget["EventTarget"]
    end

    subgraph "特徴"
      direction TB
      F1["イベント委譲との順序保証"]
      F2["自動クリーンアップ"]
      F3["TypeScript型推論"]
    end

    on --> Window
    on --> Document
    on --> HTMLElement
    on --> EventTarget
    on --> F1
    on --> F2
    on --> F3

    style on fill:#ff6b35,stroke:#333,color:#fff
    style F1 fill:#e8f5e9,stroke:#4caf50
    style F2 fill:#e8f5e9,stroke:#4caf50
    style F3 fill:#e8f5e9,stroke:#4caf50`;

  const delegationDiagram = `sequenceDiagram
    participant User as ユーザー操作
    participant DOM as DOM要素
    participant Svelte as Svelteランタイム

    User->>DOM: クリック発生
    Note over DOM,Svelte: イベントバブリング

    rect rgb(255, 243, 224)
      Note right of Svelte: addEventListener()で登録
      Svelte->>DOM: ハンドラ1実行
    end

    rect rgb(232, 245, 233)
      Note right of Svelte: on()で登録
      Svelte->>DOM: ハンドラ2実行（順序保証）
    end

    rect rgb(227, 242, 253)
      Note right of Svelte: onclick属性（イベント委譲）
      Svelte->>DOM: ハンドラ3実行
    end

    Note over DOM,Svelte: on()はaddEventListenerと<br/>onclick属性の間の正しい順序を保証`;
</script>

`svelte/events`モジュールは、Svelte 5でプログラム的にイベントハンドラを登録するためのユーティリティを提供します。テンプレート内の`onclick`属性ではなく、`&lt;script&gt;`ブロック内でイベントリスナーを管理する必要がある場面で使用します。

<Mermaid diagram={overviewDiagram} />

## なぜ svelte/events が必要か

Svelte 5では、イベントハンドリングにイベント委譲（event delegation）を使用しています。`onclick`のような属性で宣言的に登録されたハンドラは、パフォーマンスのためにドキュメントルートで一括処理されます。

しかし、`addEventListener()`で直接登録したハンドラは委譲の対象外となり、実行順序が宣言的なハンドラと異なる場合があります。`on()`ヘルパーを使うことで、この順序の問題を解決できます。

<Mermaid diagram={delegationDiagram} />

## on() ヘルパー関数

### 基本的な使い方

`on()`はイベントハンドラを登録し、解除関数を返します。

```svelte
<script lang="ts">
  import { on } from 'svelte/events';

  let clickCount = $state(0);

  // windowにclickイベントを登録
  // 戻り値はイベント解除関数
  const cleanup = on(window, 'click', () => {
    clickCount++;
  });

  // 必要に応じて手動でイベント解除
  // cleanup();
</script>

<p>ページ全体のクリック回数: {clickCount}</p>
```

<Admonition type="tip" title="自動クリーンアップ">
`$effect`内で`on()`を使用すると、effectのクリーンアップ時に自動的にイベントリスナーが解除されます。手動で`cleanup()`を呼ぶ必要はありません。
</Admonition>

### $effect との組み合わせ

`on()`は`$effect`と組み合わせて使うのが最も一般的なパターンです。

```svelte
<script lang="ts">
  import { on } from 'svelte/events';

  let mousePosition = $state({ x: 0, y: 0 });

  // effectが破棄されると自動的にイベントリスナーも解除される
  $effect(() => {
    return on(window, 'mousemove', (event: MouseEvent) => {
      mousePosition = { x: event.clientX, y: event.clientY };
    });
  });
</script>

<p>マウス位置: ({mousePosition.x}, {mousePosition.y})</p>
```

<Admonition type="note" title="returnパターン">
`$effect`のreturnに`on()`の戻り値をそのまま返すと、effectの破棄時にイベントリスナーが自動解除されます。`on()`が返すのは`() => void`型のクリーンアップ関数です。
</Admonition>

### DOM要素への登録

`window`や`document`だけでなく、任意のHTML要素に対しても使用できます。

```svelte
<script lang="ts">
  import { on } from 'svelte/events';

  let el: HTMLDivElement;
  let isHovering = $state(false);

  $effect(() => {
    // DOM要素への参照が確立された後にイベント登録
    const offEnter = on(el, 'mouseenter', () => {
      isHovering = true;
    });

    const offLeave = on(el, 'mouseleave', () => {
      isHovering = false;
    });

    // 両方のリスナーをクリーンアップ
    return () => {
      offEnter();
      offLeave();
    };
  });
</script>

<div bind:this={el} class:highlight={isHovering}>
  ホバーしてください
</div>
```

### イベントオプション

`addEventListener`と同じオプションを第4引数に渡せます。

```svelte
<script lang="ts">
  import { on } from 'svelte/events';

  $effect(() => {
    // once: 一度だけ実行
    const offOnce = on(window, 'resize', () => {
      console.log('初回リサイズのみ検知');
    }, { once: true });

    // capture: キャプチャフェーズで実行
    const offCapture = on(document, 'click', (event: MouseEvent) => {
      console.log('キャプチャフェーズ:', event.target);
    }, { capture: true });

    // passive: スクロールパフォーマンス向上
    const offScroll = on(window, 'scroll', () => {
      console.log('パッシブスクロール');
    }, { passive: true });

    return () => {
      offOnce();
      offCapture();
      offScroll();
    };
  });
</script>
```

## TypeScript での型安全性

`on()`は対象要素ごとに適切なイベント型を自動推論します。

```typescript
import { on } from 'svelte/events';

// Window — WindowEventMapから型推論
on(window, 'resize', (event) => {
  // event: UIEvent & { currentTarget: Window }
  console.log(event.currentTarget.innerWidth);
});

// Document — DocumentEventMapから型推論
on(document, 'visibilitychange', (event) => {
  // event: Event & { currentTarget: Document }
  console.log(document.visibilityState);
});

// HTMLElement — HTMLElementEventMapから型推論
const button = document.querySelector('button')!;
on(button, 'click', (event) => {
  // event: MouseEvent & { currentTarget: HTMLButtonElement }
  console.log(event.currentTarget.textContent);
});

// カスタムイベント — EventTarget + string型
const target = new EventTarget();
on(target, 'custom-event', (event) => {
  // event: Event（汎用型）
  console.log(event.type);
});
```

### currentTarget の型保証

`on()`は`currentTarget`プロパティを正確な要素型に絞り込みます。これにより、`addEventListener`では得られない型安全性が実現します。

```typescript
import { on } from 'svelte/events';

// addEventListenerの場合
window.addEventListener('click', (event) => {
  // event.currentTarget は EventTarget | null 型
  // キャストが必要
});

// on()の場合
on(window, 'click', (event) => {
  // event.currentTarget は Window 型（キャスト不要）
  event.currentTarget.scrollTo(0, 0);
});
```

## 実践例

### キーボードショートカット

```svelte
<script lang="ts">
  import { on } from 'svelte/events';

  let message = $state('');

  $effect(() => {
    return on(window, 'keydown', (event: KeyboardEvent) => {
      // Ctrl+S（またはCmd+S）でセーブ処理
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        message = '保存しました！';
        setTimeout(() => { message = ''; }, 2000);
      }

      // Escape でモーダルクローズ
      if (event.key === 'Escape') {
        message = 'Escapeが押されました';
      }
    });
  });
</script>

{#if message}
  <div class="notification">{message}</div>
{/if}
<p>Ctrl+Sまたは Escapeを押してみてください</p>
```

### スクロール位置の追跡

```svelte
<script lang="ts">
  import { on } from 'svelte/events';

  let scrollY = $state(0);
  let isScrolledDown = $derived(scrollY > 100);

  $effect(() => {
    return on(window, 'scroll', () => {
      scrollY = window.scrollY;
    }, { passive: true });
  });
</script>

{#if isScrolledDown}
  <button onclick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
    トップへ戻る
  </button>
{/if}
```

### ResizeObserver の代替としての使用

```svelte
<script lang="ts">
  import { on } from 'svelte/events';

  let windowSize = $state({ width: 0, height: 0 });

  $effect(() => {
    // 初期値を設定
    windowSize = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    return on(window, 'resize', () => {
      windowSize = {
        width: window.innerWidth,
        height: window.innerHeight
      };
    });
  });
</script>

<p>ウィンドウサイズ: {windowSize.width} x {windowSize.height}</p>
```

## addEventListener との違い

| 特徴                 | `on()`                  | `addEventListener()`                   |
| -------------------- | ----------------------- | -------------------------------------- |
| イベント委譲との順序 | 保証される              | 保証されない                           |
| 戻り値               | クリーンアップ関数      | なし（`removeEventListener`が必要）    |
| TypeScript型推論     | `currentTarget`が正確   | `currentTarget`は`EventTarget \| null` |
| Svelte統合           | `$effect`との自然な連携 | 手動管理が必要                         |

<Admonition type="caution" title="addEventListenerとの順序問題">
`addEventListener()`で直接登録したハンドラは、Svelteのイベント委譲システム（`onclick`属性）とは異なるタイミングで実行される可能性があります。同じ要素で両方を使う場合は、`on()`を使って順序を保証してください。
</Admonition>

## createSubscriber との関連

`on()`は`svelte/reactivity`の`createSubscriber()`と組み合わせて、外部イベントソースをリアクティブシステムに統合できます。実際に`svelte/reactivity`の`MediaQuery`クラスは内部で`on()`を使用しています。

```typescript
// MediaQueryの内部実装イメージ
import { createSubscriber } from 'svelte/reactivity';
import { on } from 'svelte/events';

class MediaQuery {
  #query: MediaQueryList;
  #subscribe: () => void;

  constructor(query: string) {
    this.#query = window.matchMedia(`(${query})`);

    this.#subscribe = createSubscriber((update) => {
      // on()でchangeイベントを監視し、update()で再評価をトリガー
      const off = on(this.#query, 'change', update);
      return () => off();
    });
  }

  get current(): boolean {
    this.#subscribe(); // effectコンテキストでリアクティブに
    return this.#query.matches;
  }
}
```

<Admonition type="info" title="MediaQueryクラスについて">
`MediaQuery`クラス自体は`svelte/reactivity`モジュールからインポートします。詳しくは<a href="{base}/svelte/advanced/built-in-classes/">組み込みリアクティブクラス</a>を参照してください。
</Admonition>

## よくある間違い

### $effect 外での使用

```svelte
<script lang="ts">
  import { on } from 'svelte/events';

  // ❌ $effect外で使うとコンポーネント破棄時にリークする可能性
  on(window, 'resize', () => {
    console.log('リサイズ');
  });

  // ✅ $effect内で使い、自動クリーンアップを活用
  $effect(() => {
    return on(window, 'resize', () => {
      console.log('リサイズ');
    });
  });
</script>
```

### テンプレートイベントとの重複

```svelte
<script lang="ts">
  import { on } from 'svelte/events';

  let el: HTMLButtonElement;
  let count = $state(0);

  // ❌ テンプレートのonclickと重複する必要はない
  $effect(() => {
    return on(el, 'click', () => { count++; });
  });
</script>

<!-- テンプレートで宣言的に書ける場合はそちらが推奨 -->
<!-- ✅ シンプルなケースはonclick属性で十分 -->
<button bind:this={el} onclick={() => count++}>
  カウント: {count}
</button>
```

<Admonition type="tip" title="使い分けの指針">
テンプレート内の`onclick`等の属性で対応できる場合は、宣言的な書き方を優先してください。`on()`は、`window`/`document`へのグローバルイベント、動的に変わるイベント対象、`$effect`内でのプログラム的な管理が必要な場面で使用します。
</Admonition>

## まとめ

`svelte/events`の`on()`ヘルパーは、プログラム的なイベント管理をSvelte 5のリアクティブシステムと統合するための重要なツールです。`addEventListener`の代わりに使用することで、イベント委譲との順序保証、自動クリーンアップ、TypeScript型安全性といった恩恵を得られます。テンプレートの宣言的イベントハンドリングと適切に使い分けることで、堅牢なイベント管理が実現できます。

## 次のステップ

- [use:アクション](/svelte/basics/actions/) — DOM要素に再利用可能な振る舞いを付与する
- [組み込みリアクティブクラス](/svelte/advanced/built-in-classes/) — MediaQuery、SvelteMap等のリアクティブユーティリティ
- [$effect - 副作用](/svelte/runes/effect/) — effectの詳細な使い方
