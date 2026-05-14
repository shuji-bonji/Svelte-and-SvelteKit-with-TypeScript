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

#### $inspect.trace() - リアクティブ依存関係のトレース（5.14+）

`$inspect.trace()` は、`$effect` や `$derived` の中で関数が再実行された際に、どのリアクティブ状態が原因で再実行されたかをコンソールに出力します。**関数本体の先頭で呼び出す必要があります**。

```svelte
<script lang="ts">
  let count = $state(0);
  let multiplier = $state(2);

  $effect(() => {
    // 関数の先頭で呼び出す
    $inspect.trace('計算エフェクト');

    const result = count * multiplier;
    console.log('result:', result);
  });
</script>
```

引数のラベルは省略可。本番ビルドではnoop（何も実行されない）になります。

| API | 用途 | 動作 |
|-----|------|------|
| `$inspect(value)` | 値の変化をログ出力 | 値が変更されるたびに `console.log` |
| `$inspect(value).with(fn)` | カスタムロガー | `'init'` / `'update'` 種別を受け取る |
| `$inspect.trace(label?)` | 依存関係のトレース | 再実行の原因となった状態をログ |

詳しくは [$inspect - デバッグ]({base}/svelte/runes/inspect/) を参照。

### $host - カスタムエレメント

```svelte
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

#### `<svelte:options customElement>` のオブジェクト構文

文字列リテラル形式（`customElement="my-element"`）は最小構成ですが、Shadow DOM・props属性・ライフサイクル拡張をカスタマイズしたい場合は**オブジェクト構文**を使います。

| プロパティ | 型 | 役割 |
|----------|---|------|
| `tag` | `string` | カスタムエレメントのタグ名 |
| `shadow` | `"none" \| "open" \| ShadowRootInit` | Shadow DOMのモード（`"none"` で無効化） |
| `props` | `Record<string, { attribute?, reflect?, type? }>` | 属性名・反映・型変換の個別設定 |
| `extend` | `(ctor) => CustomElementClass` | クラス拡張（formAssociated 等） |

```svelte
<svelte:options
  customElement={{
    tag: 'my-counter',
    shadow: 'open',
    props: {
      count: { reflect: true, type: 'Number', attribute: 'data-count' }
    },
    extend: (ctor) => {
      return class extends ctor {
        static formAssociated = true;
      };
    }
  }}
/>

<script lang="ts">
  let { count = 0 }: { count?: number } = $props();
</script>

<output>{count}</output>
```

:::caution[props を $props() で個別に列挙する必要あり]
`let props = $props()` のように **まとめて受け取る形は不可**。Svelteがどのpropをカスタムエレメントの属性として公開すべきか判別できないためです。プロパティは個別に分割代入してください。
:::

詳しくは [Web Components / CSS戦略]({base}/deep-dive/webcomponents-svelte-css-strategies/) を参照。

### $state.eager - 非同期中の即時UI更新（5.36+）

`await expressions` を有効化した環境で、依存値の変更を**非同期更新の完了を待たず**即座にUIへ反映するためのリアクティブ状態です。通常の `$derived` は同期的なUI更新を保証するため、内部の `await` が解決するまで古い値を保持しますが、`$state.eager` は次フレームでただちに更新されます。

| API | 更新タイミング | 用途 |
|-----|---------------|------|
| `$state(initial)` | 代入時に即時 | 通常のリアクティブ状態 |
| `$derived(expr)` | 依存関係の解決後（同期化） | 一貫性が必要な計算値 |
| `$state.eager(expr)` | 依存値変更時に即時 | ナビゲーション中のUI更新等 |

```svelte
<script lang="ts">
  import { page } from '$app/state';

  // 通常の$derivedはナビゲーション完了後に更新
  let currentPath = $derived(page.url.pathname);

  // $state.eagerはナビゲーション開始時に即座に更新
  let eagerPath = $state.eager(page.url.pathname);
</script>

<nav>
  <a href="/" class:active={eagerPath === '/'}>ホーム</a>
  <a href="/about" class:active={eagerPath === '/about'}>About</a>
</nav>
```

:::info[await expressions との関係]
`$state.eager` は async対応の同期化挙動と組み合わせて意味を持つ機能です。詳しくは [await expressions]({base}/svelte/advanced/await-expressions/) を参照。
:::

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

### await expressions - 非同期構文（実験的・5.36+）

Svelte 5.36+でサポートされる実験的な非同期構文です。コンポーネントの `<script>` トップレベル、`$derived(...)`、マークアップ内で `await` を使えるようになります。

#### opt-in 手順

`svelte.config.js` に `compilerOptions.experimental.async: true` を設定する必要があります（Svelte 6 で実験フラグは削除予定）。

```javascript
// svelte.config.js
export default {
  compilerOptions: {
    experimental: {
      async: true
    }
  }
};
```

#### 使用箇所

```svelte
<script lang="ts">
  // 1. <script> トップレベルでのawait
  const user = await fetchUser();
</script>

<!-- 2. マークアップ内でのawait -->
<h1>{(await fetchTitle()).toUpperCase()}</h1>

<!-- 3. $derived と組み合わせ -->
{@const data = await $derived(fetchData(id))}
<div>{data.content}</div>
```

#### 同期化（Synchronized updates）

`await` 式が解決するまでUIは前の状態を保持し、一貫性のないUIが表示されないようSvelteが自動的に同期化します。

#### `svelte:boundary` との連携

初回ローディングは `pending` snippet、後続の非同期更新は `$effect.pending()` で検出します。

```svelte
<svelte:boundary>
  {#snippet pending()}
    <Loading />
  {/snippet}

  <AsyncContent />
</svelte:boundary>
```

#### fork() / settled() / tick() - 同期化制御（5.42+）

非同期更新の同期化を制御するための低レベルAPIです。`svelte` モジュールから直接インポートします。

| API | 役割 | 主な用途 |
|-----|------|---------|
| `tick()` | 保留中の状態更新を反映するまで待つ | 状態変更直後にUIへ反映させたい時 |
| `settled()` | 現在の非同期更新がすべて完了するまで待つ | UI遷移完了の検出 |
| `fork(fn)` | 投機的に状態を変更し、commit/discard 可能 | プリロード、ナビゲーション先読み |

```typescript
import { tick, settled, fork } from 'svelte';

// tick() / settled() の組み合わせ
async function updateUI() {
  updating = true;
  await tick(); // updating=true をUIに即時反映

  color = 'blue';
  answer = 42;

  await settled(); // 全ての連鎖更新が完了するまで待つ
  updating = false;
}

// fork() - 投機的な状態更新
let pending: import('svelte').Fork | null = null;

function preload() {
  // ホバー時に「先回りで」状態を変更し、非同期処理を開始させる
  pending ??= fork(() => {
    open = true;
  });
}

function cancel() {
  pending?.discard();
  pending = null;
}

function confirm() {
  pending?.commit();
  pending = null;
}
```

#### ローディング状態の検出

```typescript
$effect(() => {
  if ($effect.pending()) {
    console.log('非同期処理中...');
  }
});
```

詳しくは [await expressions]({base}/svelte/advanced/await-expressions/) を参照。

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
  <li>{item}</li>
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

### Function bindings - getter/setter形式（5.9+）

`bind:property={() => getter, (v) => setter(v)}` 構文で、バインディングに検証・変換ロジックを挟めます。

| 構文 | 用途 |
|------|------|
| `bind:value={variable}` | 通常の双方向バインディング |
| `bind:value={() => get, (v) => set(v)}` | getter/setter付きバインディング |
| `bind:clientWidth={null, redraw}` | 読み取り専用バインディング（getterは `null`） |

```svelte
<script lang="ts">
  let value = $state('');

  // 入力値を常に小文字に変換してから格納
  function setLowercase(v: string) {
    value = v.toLowerCase();
  }
</script>

<input bind:value={
  () => value,
  (v) => setLowercase(v)
} />

<!-- 読み取り専用バインディング：getter位置に null -->
<div bind:clientWidth={null, (w) => redraw(w)}>
  リサイズ検知
</div>
```

:::tip[bind:this との併用]
Function bindingsを使った `bind:this` では、コンポーネント・要素の破棄時に正しく `null` 化するため**必ずgetterを提供**してください。
:::

詳しくは [$bindable - 双方向バインディング]({base}/svelte/runes/bindable/) を参照。

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
  {node.name}
  {#if node.children}
    <ul>
      {#each node.children as child}
        <svelte:self node={child} />
      {/each}
    </ul>
  {/if}
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

### svelte:boundary - エラー・非同期境界（5.3+）

エラーと `await expressions` の保留状態を**境界として隔離**するための要素です。次のプロパティを 1 つ以上指定すると効果を持ちます。

| プロパティ | 種別 | 役割 |
|----------|------|------|
| `pending` | snippet | `await` 式が初回解決するまで表示するUI |
| `failed` | snippet | エラー発生時に表示するUI（`error`, `reset` 引数） |
| `onerror` | 関数 | エラーレポート送信などの副作用 |
| `transformError` | 関数（5.51+） | SSR時のエラーオブジェクト変換（XSS対策・型整形） |

```svelte
<script lang="ts">
  function reportError(error: unknown, reset: () => void) {
    // エラー報告サービスへ送信
    sendToSentry(error);
  }
</script>

<svelte:boundary onerror={reportError}>
  <FlakyComponent />

  {#snippet pending()}
    <p>読み込み中...</p>
  {/snippet}

  {#snippet failed(error: Error, reset: () => void)}
    <p>エラー: {error.message}</p>
    <button onclick={reset}>再試行</button>
  {/snippet}
</svelte:boundary>
```

#### `transformError`（5.51+）

SSR時にエラーオブジェクトを**JSON シリアライズ可能な形に変換**してから `failed` snippetに渡す関数です。`render()` / `mount()` / `hydrate()` のオプションとして指定します。

```typescript
// server.ts
import { render } from 'svelte/server';
import App from './App.svelte';

const { head, body } = await render(App, {
  transformError: (error) => {
    // 元のエラーは内部でログ
    console.error(error);

    // ブラウザへはサニタイズ済みのオブジェクトを返す
    return { message: 'エラーが発生しました' };
  }
});
```

:::warning[SSRエラーの情報漏洩に注意]
`error.message` や `error.stack` には機密情報が含まれる可能性があるため、`transformError` でサニタイズしてから返却してください。
:::

:::info[エラー境界の制限]
`<svelte:boundary>` はレンダリング処理中のエラーのみ捕捉します。**イベントハンドラ・setTimeout・非同期処理中のエラーは捕捉されません**。

詳しくは [特殊要素]({base}/svelte/basics/special-elements/) を参照。
:::

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
