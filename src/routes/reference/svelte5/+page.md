---
title: Svelte 5 完全リファレンス
description: Svelte 5の完全リファレンス。Runesシステム、コンポーネント構造、テンプレート構文、トランジションとストア、TypeScript統合、パフォーマンス最適化のベストプラクティスを体系的に収録し、実装時の逆引き辞典として活用できる。関連ページ動線と索引用リンク付き。詳しい手順とチェックリスト付き
---

<script>
	import Admonition from '$lib/components/Admonition.svelte';
  import { base } from '$app/paths';
</script>

<Admonition type="tip" title="AI開発には公式のSvelte MCPサーバーの利用を推奨">
**Claude Code / Claude Desktop等のLLMを使った開発では、公式の[Svelte MCP](https://svelte.dev/docs/mcp)サーバーの利用を強く推奨します。**

Svelte MCPは、Svelteチームが提供する公式のModel Context Protocolサーバーで、以下の利点があります。

<ul>
<li><strong>常に最新</strong>: Svelte 5とSvelteKitの公式ドキュメントから直接情報を取得</li>
<li><strong>包括的な機能</strong>: ドキュメント検索、コード分析、自動修正提案、Playgroundリンク生成</li>
<li><strong>公式サポート</strong>: Svelteチームによる保守</li>
<li><strong>このリファレンスとの相乗効果</strong>: MCPで最新情報を取得し、このページで体系的な理解を深める</li>
</ul>

#### Claude Code（CLI）でのセットアップ

</Admonition>

```bash
# プロジェクトスコープで追加（推奨）
claude mcp add svelte -- npx -y @sveltejs/mcp

# または、グローバルスコープで追加
claude mcp add --scope user svelte -- npx -y @sveltejs/mcp
```

設定後、Claude Codeを再起動してください。

```bash
# 登録済みMCPサーバーの一覧を確認
claude mcp list
```

会話中は `/mcp` コマンドでも接続状態を確認できます。

#### Claude Desktopでのセットアップ

```js
// claude_desktop_config.json
{
  "mcpServers": {
    "svelte": {
      "command": "npx",
      "args": ["-y", "@sveltejs/mcp"]
    }
  }
}
```

設定後、Claude Desktopを再起動してください。

詳細: [Svelte MCP公式ドキュメント](https://svelte.dev/docs/mcp)

## Svelte 5の特徴

### なぜSvelte 5なのか

- **コンパイル時最適化**: ランタイムオーバーヘッドを最小限に
- **仮想DOMなし**: 直接DOMを操作し高速なレンダリング
- **明示的なリアクティビティ**: Runesによる予測可能な状態管理
- **TypeScript完全対応**: 型安全な開発環境
- **少ないボイラープレート**: シンプルで読みやすいコード

## Runesシステム

### $state - リアクティブ状態

```typescript
// プリミティブ値
let count = $state(0);
let message = $state<string>('Hello');

// オブジェクト（深いリアクティビティ）
let user = $state({
  name: '太郎',
  age: 25,
  preferences: {
    theme: 'dark',
    language: 'ja',
  },
});

// 配列
let todos = $state<Todo[]>([]);

// クラスインスタンス
class Counter {
  value = $state(0);

  increment() {
    this.value++;
  }

  reset() {
    this.value = 0;
  }
}

let counter = new Counter();
```

#### $state.raw - 非プロキシ状態

`$state.raw` は深いリアクティビティ（Proxy）を適用しない状態を作成します。大きな配列や頻繁に変更されないオブジェクトのパフォーマンス最適化に有効です。

```typescript
// 大きなデータセット（Proxyのオーバーヘッドを回避）
let largeList = $state.raw<Item[]>(fetchedItems);

// 設定オブジェクト（個別プロパティの変更追跡が不要）
let config = $state.raw({
  apiUrl: 'https://api.example.com',
  version: '1.0.0',
});

// プロパティの変更は追跡されない
// config.apiUrl = 'new-url'; // UIは更新されない

// ✅ オブジェクト全体を置き換えることでUIを更新
config = $state.raw({ ...config, version: '1.0.1' });
```

<Admonition type="warning" title="$state.frozen は $state.raw にリネーム済み">
以前の `$state.frozen` は `$state.raw` にリネームされました。`$state.frozen` を使用している場合は `$state.raw` に置き換えてください。
</Admonition>

#### $state.snapshot - スナップショット

```typescript
let state = $state({ count: 0, items: [] });

// 現在の状態のスナップショットを取得
const snapshot = $state.snapshot(state);
localStorage.setItem('appState', JSON.stringify(snapshot));
```

### $derived - 計算値

```typescript
// シンプルな計算
let area = $derived(width * height);

// 複数の依存関係
let subtotal = $derived(price * quantity);
let tax = $derived(subtotal * taxRate);
let total = $derived(subtotal + tax);
```

#### $derived.by - 複雑な計算

```typescript
let processedItems = $derived.by(() => {
  // フィルタリング
  let filtered = items.filter((item) =>
    item.name.toLowerCase().includes(filter.toLowerCase()),
  );

  // ソート
  return filtered.sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    }
    return a.price - b.price;
  });
});
```

#### Overridable $derived（Svelte 5.25+）

`$derived` の値を一時的にオーバーライドできます。依存値が変更されると、オーバーライドはリセットされます。

```typescript
// 検索候補からの入力補完パターン
let input = $state('');
let suggestion = $derived(getSuggestion(input));

// ユーザーがTabキーで候補を選択→inputが更新→suggestionがリセット
function acceptSuggestion() {
  input = suggestion;
}
```

```svelte
<script lang="ts">
  let selected = $state('apple');

  // selectedが変更されるたびにリセットされる
  let editableLabel = $derived(selected.toUpperCase());
</script>

<!-- ユーザーが直接編集可能だが、selected変更でリセット -->
<input bind:value={editableLabel} />
<select bind:value={selected}>
  <option value="apple">Apple</option>
  <option value="banana">Banana</option>
</select>
```

### $effect - 副作用

```typescript
// 基本的な副作用
$effect(() => {
  console.log(`Count changed to: ${count}`);
  document.title = `Count: ${count}`;
});

// クリーンアップ付き
$effect(() => {
  const timer = setInterval(() => {
    console.log('Tick');
  }, 1000);

  return () => clearInterval(timer);
});

// 非同期処理
$effect(() => {
  const controller = new AbortController();

  fetch(`/api/data?count=${count}`, {
    signal: controller.signal,
  })
    .then((res) => res.json())
    .then((data) => {
      message = data.message;
    });

  return () => controller.abort();
});
```

#### $effect.pre - DOM更新前に実行

```typescript
let value = $state('');
let previousValue = $state('');

$effect.pre(() => {
  previousValue = value;
});
```

#### $effect.tracking - トラッキング確認

```typescript
$effect(() => {
  if ($effect.tracking()) {
    console.log('This is reactive');
    console.log(tracked); // 依存関係として追跡される
  }

  untrack(() => {
    console.log(untracked); // 追跡されない
  });
});
```

#### $effect.root - エフェクトスコープ

```typescript
onMount(() => {
  const cleanup = $effect.root(() => {
    let count = $state(0);

    $effect(() => {
      console.log(`Count: ${count}`);
    });

    const interval = setInterval(() => {
      count++;
    }, 1000);

    return () => clearInterval(interval);
  });

  return cleanup;
});
```

#### $effect.pending() - 非同期保留状態の追跡

`$effect.pending()` は、現在のコンポーネント内で非同期操作が保留中かどうかを追跡します。`await expressions` と組み合わせて使用します。

```typescript
// await expressionsで非同期データを取得するコンポーネント内で
$effect(() => {
  if ($effect.pending()) {
    // ローディングスピナーの表示など
    showSpinner = true;
  } else {
    showSpinner = false;
  }
});
```

<Admonition type="info" title="$effect.pending() vs svelte:boundary">
`&lt;svelte:boundary&gt;` の `pending` snippetは初回ローディングに使用します。
`$effect.pending()` は後続の非同期更新でのローディング状態の検出に使用します。
</Admonition>

### $props - コンポーネントプロパティ

```typescript
interface Props {
  title: string;
  count?: number;
  variant?: 'primary' | 'secondary';
  onClose?: () => void;
}

let {
  title,
  count = 0,
  variant = 'primary',
  onClose,
  ...restProps
}: Props = $props();
```

#### childrenとSnippets

```typescript
import type { Snippet } from 'svelte';

interface Props {
  title: string;
  children?: Snippet;
  header?: Snippet<[string]>;
  footer?: Snippet;
}

let { title, children, header, footer }: Props = $props();
```

```svelte
<div class="container">
  {#if header}
    {@render header(title)}
  {:else}
    <h1>{title}</h1>
  {/if}

  <main>
    {@render children?.()}
  </main>

  {#if footer}
    <footer>
      {@render footer()}
    </footer>
  {/if}
</div>
```

### $bindable - 双方向バインディング

```typescript
// 子コンポーネント
interface Props {
  value: string;
  checked?: boolean;
}

let { value = $bindable(''), checked = $bindable(false) }: Props = $props();
```

```svelte
<!-- 親コンポーネント -->
<ChildComponent bind:value={text} bind:checked={isChecked} />
```

### $inspect - デバッグ

```typescript
let count = $state(0);

// 開発環境でのみ動作
$inspect(count); // count: 0

// ラベル付き
$inspect('カウント', count);

// カスタムロガー
$inspect(count).with((type, value) => {
  if (type === 'update') {
    console.log(`Count updated to: ${value}`);
  }
});
```

### $host - カスタムエレメント

```typescript
<svelte:options customElement="my-counter" />

<script lang="ts">
  // カスタムエレメントのホスト要素にアクセス
  $host().addEventListener('custom-event', (e) => {
    console.log('Custom event received', e);
  });

  // ホスト要素のスタイル設定
  $effect(() => {
    $host().style.setProperty('--count', String(count));
  });
</script>
```

### $state.eager - 非同期中の即時UI更新

ナビゲーションなどの非同期操作中でも即座にUIを更新する機能です（Svelte 5.36+）。

```typescript
import { page } from '$app/state';

// 通常の$derivedはナビゲーション完了後に更新
let currentPath = $derived(page.url.pathname);

// $state.eagerはナビゲーション開始時に即座に更新
let eagerPath = $state.eager(page.url.pathname);
```

#### ユースケース

```svelte
<script lang="ts">
  import { page } from '$app/state';

  // ナビゲーション中もアクティブなメニュー項目を即座に更新
  let activePath = $state.eager(page.url.pathname);
</script>

<nav>
  <a href="/" class:active={activePath === '/'}>ホーム</a>
  <a href="/about" class:active={activePath === '/about'}>About</a>
</nav>
```

### hydratable - SSRデータの再利用

SSRで取得したデータをハイドレーション時に再利用する低レベルAPIです。

```typescript
import { hydratable } from 'svelte';

// サーバー: getUser()を実行し、結果をシリアライズしてHTMLに埋め込む
// クライアント（ハイドレーション時）: シリアライズされたデータを使用
// クライアント（ハイドレーション後）: getUser()を実行
const user = await hydratable('user', () => getUser());
```

#### ランダム値・時刻の安定化

```typescript
// サーバーで生成されたランダム値がクライアントでも同じになる
const randomId = hydratable('random-id', () =>
  Math.random().toString(36).slice(2),
);

// SSR時の時刻がハイドレーション時にも維持される
const timestamp = hydratable('page-timestamp', () => Date.now());
```

<Admonition type="info" title="Remote Functionsを推奨">
通常の開発では、SvelteKitの[Remote Functions](/sveltekit/server/remote-functions/)がこのAPIを内部的に使用しています。
</Admonition>

### await expressions - 非同期構文（実験的）

Svelte 5.36+でサポートされる実験的な非同期構文です。

```svelte
<script lang="ts">
  // スクリプト内でのawait
  const user = await fetchUser();
</script>

<!-- マークアップ内でのawait -->
<h1>{(await fetchTitle()).toUpperCase()}</h1>

<!-- $derivedと組み合わせ -->
{@const data = await $derived(fetchData(id))}
<div>{data.content}</div>
```

#### svelte:boundaryとの連携

```svelte
<svelte:boundary>
  {#snippet pending()}
    <Loading />
  {/snippet}

  <AsyncContent />
</svelte:boundary>
```

#### ローディング状態の検出

```typescript
$effect(() => {
  if ($effect.pending()) {
    console.log('非同期処理中...');
  }
});
```

## コンポーネント構造

### 基本構造

```svelte
<!-- MyComponent.svelte -->
<script lang="ts">
  // TypeScriptコード
  import type { Snippet } from 'svelte';

  // Props定義
  interface Props {
    title: string;
    count?: number;
    children?: Snippet;
  }

  let { title, count = 0, children }: Props = $props();

  // リアクティブな状態
  let internalCount = $state(count);

  // 計算値
  let doubled = $derived(internalCount * 2);

  // メソッド
  function increment() {
    internalCount++;
  }
</script>

<!-- HTMLテンプレート -->
<div class="component">
  <h2>{title}</h2>
  <p>Count: {internalCount}, Doubled: {doubled}</p>
  <button onclick={increment}>Increment</button>

  {@render children?.()}
</div>

<!-- スタイル -->
<style>
  .component {
    padding: 1rem;
    border: 1px solid #ccc;
    border-radius: 8px;
  }
</style>
```

### スクリプトコンテキスト

```svelte
<!-- モジュールコンテキスト（一度だけ実行） -->
<script context="module" lang="ts">
  let totalInstances = 0;

  export function resetInstances() {
    totalInstances = 0;
  }
</script>

<!-- インスタンスコンテキスト（コンポーネントごと） -->
<script lang="ts">
  totalInstances++;
  const instanceId = totalInstances;
</script>
```

## テンプレート構文

### 条件分岐

```svelte
{#if loading}
  <p>読み込み中...</p>
{:else if error}
  <p>エラー: {error.message}</p>
{:else if data}
  <div>{data.content}</div>
{:else}
  <p>データがありません</p>
{/if}
```

### ループ処理

```svelte
<!-- 基本的なeach -->
{#each items as item (item.id)}
  <Item {item} />
{/each}

<!-- インデックス付き -->
{#each items as item, index (item.id)}
  <div>{index + 1}. {item.name}</div>
{/each}

<!-- 分割代入 -->
{#each users as { id, name, email } (id)}
  <User {name} {email} />
{/each}

<!-- 空の場合の処理 -->
{#each items as item}
  <li>&#123;item&#125;</li>
{:else}
  <p>アイテムがありません</p>
{/each}
```

### 非同期処理

```svelte
{#await promise}
  <Loading />
{:then data}
  <Success {data} />
{:catch error}
  <Error {error} />
{/await}

<!-- 成功のみ -->
{#await promise then data}
  <div>{data}</div>
{/await}
```

### キー付きブロック

```svelte
{#key value}
  <div transition:fade>
    Value: {value}
  </div>
{/key}
```

### HTMLコンテンツ

```svelte
<!-- HTML文字列をレンダリング（XSS注意） -->
<div>{@html htmlContent}</div>

<!-- デバッグ出力 -->
{@debug value}
```

### Attachments - リアクティブDOM操作

Svelte 5.29+で導入されたリアクティブなDOM操作パターン（`&#123;@attach&#125;`）です。`use:`アクションと異なり、リアクティブコンテキストで動作します。

```svelte
<script lang="ts">
  import { createAttachmentKey } from 'svelte/attachments';

  // アタッチメントキーを作成
  const tooltip = createAttachmentKey();

  // リアクティブな値を使用可能
  let tooltipText = $state('ヒント');
</script>

<button {@attach tooltip((node) => {
  // リアクティブ: tooltipTextの変更で再実行される
  node.title = tooltipText;

  return () => {
    node.title = '';
  };
})}>
  ホバーしてください
</button>
```

#### use:アクションとの違い

| 機能             | `use:action`             | `&#123;@attach&#125;` |
| ---------------- | ------------------------ | --------------------- |
| リアクティビティ | パラメータ変更でupdate() | 自動再実行            |
| 実行タイミング   | マウント時のみ           | リアクティブ値変更時  |
| クリーンアップ   | destroy()                | 戻り値の関数          |

#### 外部ライブラリとの統合

```svelte
<script lang="ts">
  import tippy from 'tippy.js';
  import { fromAction } from 'svelte/attachments';

  // 既存のuse:アクションをアタッチメントに変換
  const tippyAttachment = fromAction(tippy);
</script>

<button {@attach tippyAttachment({ content: 'ツールチップ' })}>
  ホバー
</button>
```

## イベント処理

### 基本的なイベント

```svelte
<!-- インラインハンドラー -->
<button onclick={() => console.log('Clicked!')}>
  Click me
</button>

<!-- メソッド参照 -->
<button onclick={handleClick}>
  Click me
</button>

<!-- preventDefault等は関数内で呼び出す -->
<form onsubmit={(e: SubmitEvent) => {
  e.preventDefault();
  handleSubmit(e);
}}>
  <button type="submit">Submit</button>
</form>
```

<Admonition type="caution" title="Svelte 5ではイベント修飾子構文は非サポート">
Svelte 4の `on:click|preventDefault|stopPropagation` のような修飾子構文は使用できません。
`e.preventDefault()` や `e.stopPropagation()` を関数内で直接呼び出してください。
</Admonition>

### コンポーネントイベント（コールバックProps）

Svelte 5ではコールバックpropsパターンが推奨です（`createEventDispatcher` はレガシー）。

```typescript
// 子コンポーネント
interface Props {
  onMessage?: (data: { text: string }) => void;
  onDelete?: (data: { id: number }) => void;
}

let { onMessage, onDelete }: Props = $props();

function sendMessage() {
  onMessage?.({ text: 'Hello!' });
}
```

```svelte
<!-- 親コンポーネント -->
<ChildComponent
  onMessage={(data) => console.log(data.text)}
  onDelete={(data) => removeItem(data.id)}
/>
```

### svelte/events モジュール

プログラマティックなイベントリスナー登録やメディアクエリの監視に使用します。

```typescript
import { on, MediaQuery } from 'svelte/events';

// DOM要素にイベントリスナーを追加（クリーンアップ関数を返す）
const off = on(document, 'click', (e: MouseEvent) => {
  console.log('Document clicked at', e.clientX, e.clientY);
});

// 解除
off();

// メディアクエリのリアクティブ監視
const isMobile = new MediaQuery('max-width: 768px');

$effect(() => {
  if (isMobile.current) {
    console.log('モバイルビュー');
  }
});
```

## バインディング

### 入力要素

```svelte
<input bind:value={text} />
<input type="number" bind:value={number} />
<input type="checkbox" bind:checked />
<select bind:value={selected}>
  <option value="a">A</option>
  <option value="b">B</option>
</select>

<!-- グループバインディング -->
{#each items as item}
  <label>
    <input type="checkbox" bind:group={selectedItems} value={item} />
    {item.name}
  </label>
{/each}
```

### 要素プロパティ

```svelte
<!-- 要素への参照 -->
<input bind:this={inputElement} />

<!-- 読み取り専用プロパティ -->
<div bind:clientWidth={width} bind:clientHeight={height}>
  Resizable content
</div>

<!-- ウィンドウバインディング -->
<svelte:window
  bind:innerWidth
  bind:innerHeight
  bind:scrollY
/>
```

## スタイリング

### Scopedスタイル

```svelte
<style>
  /* このコンポーネントにのみ適用 */
  p {
    color: purple;
  }

  /* グローバルスタイル */
  :global(body) {
    margin: 0;
  }

  /* 子要素のグローバルスタイル */
  div :global(strong) {
    color: red;
  }
</style>
```

### 動的スタイル

```svelte
<!-- style:property -->
<div
  style:color={color}
  style:font-size="{size}px"
  style:font-weight={bold ? 'bold' : 'normal'}
>
  Style directives
</div>

<!-- CSS変数 -->
<div style:--theme-color={color}>
  <p>Uses CSS variable</p>
</div>
```

### クラスディレクティブ

```svelte
<!-- class:name -->
<div class:active class:important>
  Conditional classes
</div>

<!-- class:name={value} -->
<div
  class:active={isActive}
  class:disabled={!enabled}
>
  Conditional with expression
</div>
```

## 🎬 トランジションとアニメーション

### ビルトイントランジション

```typescript
import { fade, fly, slide, scale, blur } from 'svelte/transition';
import { quintOut } from 'svelte/easing';

<div transition:fade={{ duration: 500 }}>
  Fades in and out
</div>

<div transition:fly={{ x: 200, duration: 500, easing: quintOut }}>
  Flies in
</div>

<!-- in/out別々 -->
<div in:fly={{ x: -200 }} out:fade>
  Different transitions
</div>
```

### カスタムトランジション

```typescript
function typewriter(node: HTMLElement, { speed = 1 }) {
  const text = node.textContent!;
  const duration = text.length / (speed * 0.01);

  return {
    duration,
    tick: (t: number) => {
      const i = Math.trunc(text.length * t);
      node.textContent = text.slice(0, i);
    },
  };
}
```

### アニメーション

```typescript
import { flip } from 'svelte/animate';

{#each items as item (item.id)}
  <div animate:flip={{ duration: 250 }}>
    {item.name}
  </div>
{/each}
```

### モーション

```typescript
import { spring, tweened } from 'svelte/motion';
import { cubicOut } from 'svelte/easing';

const coords = spring(
  { x: 0, y: 0 },
  {
    stiffness: 0.1,
    damping: 0.25,
  },
);

const progress = tweened(0, {
  duration: 400,
  easing: cubicOut,
});
```

## Actions

### 基本的なAction

```typescript
function tooltip(node: HTMLElement, text: string) {
  const tooltipEl = document.createElement('div');
  tooltipEl.textContent = text;
  tooltipEl.className = 'tooltip';

  function show() {
    document.body.appendChild(tooltipEl);
  }

  function hide() {
    tooltipEl.remove();
  }

  node.addEventListener('mouseenter', show);
  node.addEventListener('mouseleave', hide);

  return {
    update(newText: string) {
      tooltipEl.textContent = newText;
    },

    destroy() {
      node.removeEventListener('mouseenter', show);
      node.removeEventListener('mouseleave', hide);
      tooltipEl.remove();
    },
  };
}
```

```svelte
<button use:tooltip={'Click me!'}>
  Hover me
</button>
```

## 特殊要素

### svelte:self - 再帰コンポーネント

```svelte
<!-- Tree.svelte -->
<script lang="ts">
  interface TreeNode {
    name: string;
    children?: TreeNode[];
  }

  let { node }: { node: TreeNode } = $props();
</script>

<li>
  &#123;node.name&#125;
  &#123;#if node.children&#125;
    <ul>
      &#123;#each node.children as child&#125;
        <svelte:self node=&#123;child&#125; />
      &#123;/each&#125;
    </ul>
  &#123;/if&#125;
</li>
```

### svelte:component - 動的コンポーネント

```svelte
<script lang="ts">
  import type { Component } from 'svelte';

  let currentComponent: Component = $state(ComponentA);
</script>

<!-- Svelte 5では直接コンポーネントを動的に使用可能 -->
<svelte:component this={currentComponent} {...componentProps} />
```

<Admonition type="tip" title="Svelte 5での動的コンポーネント">
Svelte 5では `&lt;svelte:component&gt;` なしで直接 `<currentComponent />` と書くこともできます（変数名が大文字始まりの場合）。
</Admonition>

### svelte:element - 動的要素

```svelte
<svelte:element this={tag} class="dynamic">
  Dynamic element
</svelte:element>
```

### svelte:window, svelte:body, svelte:document, svelte:head

```svelte
<svelte:window bind:scrollY onkeydown={handleKeydown} />
<svelte:body onmouseenter={() => console.log('Mouse entered')} />
<svelte:document onvisibilitychange={() => console.log('Visibility changed')} />
<svelte:head>
  <title>Page Title</title>
  <meta name="description" content="Page description" />
</svelte:head>
```

## TypeScript統合

### コンポーネント型定義

```typescript
import type { Component, ComponentProps } from 'svelte';

// Svelte 5のComponent型（推奨）
type ButtonComponent = Component<{
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}>;

// プロパティの抽出
type ButtonProps = ComponentProps<typeof Button>;
type NativeButtonProps = ComponentProps<'button'>;

// 組み合わせ
type CustomButtonProps = ComponentProps<'button'> & {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
};
```

<Admonition type="info" title="Component型について">
Svelte 5では `Component` 型を使用します。`SvelteComponent` / `ComponentType` はレガシー互換です。
</Admonition>

### ジェネリックコンポーネント

`generics` 属性で型パラメータを宣言できます。

```svelte
<script lang="ts" generics="T extends Record<string, unknown>">
  interface Props {
    items: T[];
    selected?: T;
    onSelect?: (item: T) => void;
  }

  let { items, selected, onSelect }: Props = $props();
</script>

{#each items as item}
  <button onclick={() => onSelect?.(item)}>
    {JSON.stringify(item)}
  </button>
{/each}
```

### イベント型定義

```typescript
function handleClick(event: MouseEvent & { currentTarget: HTMLButtonElement }) {
  console.log(event.currentTarget.textContent);
}

// フォームイベント
function handleSubmit(event: SubmitEvent) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget as HTMLFormElement);
}
```

## パフォーマンス最適化

### untrack - 依存関係の除外

```typescript
import { untrack } from 'svelte';

$effect(() => {
  console.log('Trigger:', trigger);

  // unrelated の変更では再実行されない
  untrack(() => {
    console.log('Unrelated:', unrelated);
  });
});
```

### メモ化パターン

```typescript
const cache = new Map();

let filteredItems = $derived.by(() => {
  const key = `${searchTerm}-${items.length}`;

  if (cache.has(key)) {
    return cache.get(key);
  }

  const result = items.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  cache.set(key, result);

  // キャッシュサイズ制限
  if (cache.size > 10) {
    const firstKey = cache.keys().next().value;
    cache.delete(firstKey);
  }

  return result;
});
```

### デバウンス処理

```typescript
$effect(() => {
  const timer = setTimeout(async () => {
    if (searchInput.length > 2) {
      const res = await fetch(`/api/search?q=${searchInput}`);
      searchResults = await res.json();
    }
  }, 300);

  return () => clearTimeout(timer);
});
```

### flushSync - 同期的なDOM更新

```typescript
import { flushSync } from 'svelte';

let count = $state(0);

function increment() {
  // 通常はバッチ処理される更新を即座にDOMに反映
  flushSync(() => {
    count++;
  });
  // ここでDOMは既に更新されている
  console.log(document.querySelector('#count')?.textContent); // 最新の値
}
```

<Admonition type="warning" title="使用は最小限に">
`flushSync` は測定やスクロール位置の調整など、DOM更新の即時反映が必要な場合に限定してください。通常の更新はSvelteのバッチ処理に任せる方がパフォーマンスが良好です。

</Admonition>

### 遅延読み込み

```typescript
import { onMount } from 'svelte';
import type { Component } from 'svelte';

let HeavyComponent: Component | null = $state(null);

onMount(async () => {
  const module = await import('./HeavyComponent.svelte');
  HeavyComponent = module.default;
});
```

## テスト

### コンポーネントテスト

```typescript
import { render, fireEvent } from '@testing-library/svelte';
import { expect, test, vi } from 'vitest';
import Button from './Button.svelte';

test('renders button with text', () => {
  const { getByText } = render(Button, {
    props: { text: 'Click me' },
  });

  expect(getByText('Click me')).toBeInTheDocument();
});

test('calls onclick handler', async () => {
  const handleClick = vi.fn();
  const { getByRole } = render(Button, {
    props: {
      text: 'Click me',
      onclick: handleClick,
    },
  });

  const button = getByRole('button');
  await fireEvent.click(button);

  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

## Svelte 4からの移行

### 主な変更点

```typescript
// === 状態管理 ===
// Svelte 4
let count = 0;
$: doubled = count * 2;

// Svelte 5
let count = $state(0);
let doubled = $derived(count * 2);

// === Props ===
// Svelte 4
export let prop: string;

// Svelte 5
let { prop }: { prop: string } = $props();

// === Slots ===
// Svelte 4
<slot />

// Svelte 5
{@render children?.()}
```

### 移行チェックリスト

- [ ] `let` 宣言を `$state()` に変更
- [ ] `$:` リアクティブ文を `$derived` または `$effect` に変更
- [ ] `export let` を `$props()` に変更
- [ ] `<slot />` を `&#123;@render children?.()&#125;` に変更
- [ ] ストアの `$` プレフィックスを削除
- [ ] `on:event` を `onevent` に変更（例: `on:click` → `onclick`）
- [ ] `createEventDispatcher` をコールバックpropsに変更
- [ ] `on:event|modifier` を関数内での直接呼び出しに変更
- [ ] `$state.frozen` を `$state.raw` に変更
- [ ] `ComponentType<SvelteComponent>` を `Component` に変更

## 関連リソース

- [Svelte完全ガイド]({base}/svelte/) - Svelteの基礎から応用まで
- [SvelteKit 2.x 完全リファレンス]({base}/reference/sveltekit2/) - SvelteKitの詳細
- [実装例]({base}/examples/) - 実践的なサンプルコード

## まとめ

Svelte 5は、Runesシステムにより明示的で型安全なリアクティビティを提供します。TypeScriptとの完全な統合により、保守性が高く、パフォーマンスに優れたアプリケーションを構築できます。
