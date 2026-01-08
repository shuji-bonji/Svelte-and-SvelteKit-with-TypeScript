---
title: Svelte 5 完全リファレンス
description: Svelte 5の完全リファレンス。Runesシステム、コンポーネント構造、テンプレート構文、トランジションとストア、TypeScript統合、パフォーマンス最適化のベストプラクティスを体系的に収録し、実装時の逆引き辞典として活用できる。関連ページ動線と索引用リンク付き。詳しい手順とチェックリスト付き
---

<script>
  import { base } from '$app/paths';
</script>

:::tip[AI開発には公式のSvelte MCPサーバーの利用を推奨]
**Claude Code / Claude Desktop等のLLMを使った開発では、公式の[Svelte MCP](https://svelte.dev/docs/mcp)サーバーの利用を強く推奨します。**

Svelte MCPは、Svelteチームが提供する公式のModel Context Protocolサーバーで、以下の利点があります。

- **常に最新**: Svelte 5とSvelteKitの公式ドキュメントから直接情報を取得
- **包括的な機能**: ドキュメント検索、コード分析、自動修正提案、Playgroundリンク生成
- **公式サポート**: Svelteチームによる保守
- **このリファレンスとの相乗効果**: MCPで最新情報を取得し、このページで体系的な理解を深める

#### Claude Code（CLI）でのセットアップ

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
:::

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
    language: 'ja'
  }
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

#### $state.frozen - 読み取り専用

```typescript
let config = $state.frozen({
  apiUrl: 'https://api.example.com',
  version: '1.0.0'
});

// ❌ エラー: Cannot assign to read only property
// config.apiUrl = 'new-url';

// ✅ 新しいオブジェクトで置き換える
config = $state.frozen({ ...config, version: '1.0.1' });
```

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
  let filtered = items.filter(item => 
    item.name.toLowerCase().includes(filter.toLowerCase())
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
    signal: controller.signal
  })
    .then(res => res.json())
    .then(data => {
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

let { 
  value = $bindable(''),
  checked = $bindable(false)
}: Props = $props();
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

<!-- イベント修飾子 -->
<button onclick|preventDefault|stopPropagation={handleClick}>
  Submit
</button>

<!-- 一度だけ実行 -->
<button onclick|once={() => alert('Once!')}>
  Click Once
</button>
```

### カスタムイベント

```typescript
// 子コンポーネント
import { createEventDispatcher } from 'svelte';

const dispatch = createEventDispatcher<{
  message: { text: string };
  delete: { id: number };
}>();

function sendMessage() {
  dispatch('message', { text: 'Hello!' });
}
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
    }
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

const coords = spring({ x: 0, y: 0 }, {
  stiffness: 0.1,
  damping: 0.25
});

const progress = tweened(0, {
  duration: 400,
  easing: cubicOut
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
    }
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
  import type { ComponentType, SvelteComponent } from 'svelte';
  
  let currentComponent = $state<ComponentType<SvelteComponent>>(ComponentA);
</script>

<svelte:component this={currentComponent} {...componentProps} />
```

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
import type { ComponentType, SvelteComponent, ComponentProps } from 'svelte';

// コンポーネント型
type ButtonComponent = ComponentType<SvelteComponent<{
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}>>;

// プロパティの抽出
type ButtonProps = ComponentProps<Button>;
type NativeButtonProps = ComponentProps<'button'>;

// 組み合わせ
type CustomButtonProps = ComponentProps<'button'> & {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
};
```

### イベント型定義

```typescript
interface CustomEvents {
  submit: CustomEvent<{ data: FormData }>;
  cancel: CustomEvent<void>;
}

function handleClick(event: MouseEvent & { currentTarget: HTMLButtonElement }) {
  console.log(event.currentTarget.textContent);
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
  
  const result = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
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

### 遅延読み込み

```typescript
import { onMount } from 'svelte';

let HeavyComponent: ComponentType<SvelteComponent> | null = null;

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
    props: { text: 'Click me' }
  });
  
  expect(getByText('Click me')).toBeInTheDocument();
});

test('calls onclick handler', async () => {
  const handleClick = vi.fn();
  const { getByRole } = render(Button, {
    props: { 
      text: 'Click me',
      onclick: handleClick
    }
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
- [ ] `<slot />` を `{@render children?.()}` に変更
- [ ] ストアの `$` プレフィックスを削除

## 関連リソース

- [Svelte完全ガイド]({base}/svelte/) - Svelteの基礎から応用まで
- [SvelteKit 2.x 完全リファレンス]({base}/reference/sveltekit2/) - SvelteKitの詳細
- [実装例]({base}/examples/) - 実践的なサンプルコード

## まとめ

Svelte 5は、Runesシステムにより明示的で型安全なリアクティビティを提供します。TypeScriptとの完全な統合により、保守性が高く、パフォーマンスに優れたアプリケーションを構築できます。
