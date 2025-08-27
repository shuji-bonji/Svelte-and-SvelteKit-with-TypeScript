---
title: Runesシステム入門
description: Svelte 5の新しいリアクティビティシステム
---

## Runesとは

Runesは、Svelte 5で導入された新しいリアクティビティシステムです。従来のSvelte 3, 4では`let`宣言した変数が暗黙的にリアクティブになっていましたが、Runesでは`$state`や`$derived`などの明示的な関数を使ってリアクティビティを宣言します。これにより、より予測可能でTypeScriptとの統合も優れた状態管理が実現されました。

## 主要なRunes

Runesは大きく分けて「状態管理」と「コンポーネント間通信」の2つのカテゴリに分類されます。

### 状態管理
- [**$state**](../state/) - リアクティブな状態を定義。値が変更されるとUIが自動的に更新されます
- [**$derived**](../derived/) - 他の値から導出される計算値。依存する値が変更されると自動的に再計算されます
- [**$effect**](../effect/) - 副作用の実行。依存する値が変更されるたびに自動的に実行されます

### コンポーネント間通信
- [**$props**](../props/) - コンポーネントのプロパティを定義。親コンポーネントからデータを受け取ります
- [**$bindable**](../bindable/) - 双方向バインディングを可能にし、親子間で値を同期します

## 基本的な使い方

### $state - 状態の定義

`$state`はリアクティブな状態を宣言する最も基本的なRuneです。値が変更されると、その値を参照しているUIが自動的に更新されます。

```svelte ln live
<script lang="ts">
  // プリミティブ値
  let count = $state(0);
  
  // オブジェクト
  let user = $state({
    name: '太郎',
    age: 25
  });
  
  // 配列
  let items = $state<string[]>([]);
</script>

<button onclick={() => count++}>
  カウント: {count}
</button>
```

### $derived - 計算値

`$derived`は他のリアクティブな値から自動的に計算される値を作成します。依存する値が変更されるたびに、自動的に再計算されます。

```svelte ln live
<script lang="ts">
  let price = $state(100);
  let quantity = $state(2);
  
  // priceやquantityが変更されると自動的に再計算
  let total = $derived(price * quantity);
  
  // 複雑な計算も可能
  let summary = $derived(() => {
    const subtotal = price * quantity;
    const tax = subtotal * 0.1;
    return {
      subtotal,
      tax,
      total: subtotal + tax
    };
  });
</script>

<p>合計: {total}円</p>
<p>税込: {summary().total}円</p>
```

### $effect - 副作用

`$effect`はリアクティブな値の変更に応じて副作用を実行します。DOM操作、ログ出力、外部APIへの通信などに使用されます。

```typescript
<script lang="ts">
  let count = $state(0);
  
  // countが変更されるたびに実行
  $effect(() => {
    console.log(`カウント: ${count}`);
    document.title = `カウント: ${count}`;
    
    // クリーンアップ関数（オプション）
    return () => {
      console.log('クリーンアップ');
    };
  });
</script>
```

## Svelte 4との違い

Svelte 4からSvelte 5への移行で、リアクティビティの書き方が大きく変わりました。以下は同じ機能を実装した例です。

### 古い書き方（Svelte 4）

```svelte
<script>
  let count = 0;
  $: doubled = count * 2;
  
  $: {
    console.log(`Count: ${count}`);
  }
</script>
```

### 新しい書き方（Svelte 5）

```svelte
<script lang="ts">
  let count = $state(0);
  let doubled = $derived(count * 2);
  
  $effect(() => {
    console.log(`Count: ${count}`);
  });
</script>
```

## 基本的な使い方

### $state - 状態の定義

`$state`はリアクティブな状態を宣言する最も基本的なRuneです。値が変更されると、その値を参照しているUIが自動的に更新されます。

```svelte ln live
<script lang="ts">
  // プリミティブ値
  let count = $state(0);
  
  // オブジェクト
  let user = $state({
    name: '太郎',
    age: 25
  });
  
  // 配列
  let items = $state<string[]>([]);
</script>

<button onclick={() => count++}>
  カウント: {count}
</button>
```



### $derived - 計算値

`$derived`は他のリアクティブな値から自動的に計算される値を作成します。依存する値が変更されるたびに、自動的に再計算されます。

```svelte ln live
<script lang="ts">
  let price = $state(100);
  let quantity = $state(2);
  
  // priceやquantityが変更されると自動的に再計算
  let total = $derived(price * quantity);
  
  // 複雑な計算も可能
  let summary = $derived(() => {
    const subtotal = price * quantity;
    const tax = subtotal * 0.1;
    return {
      subtotal,
      tax,
      total: subtotal + tax
    };
  });
</script>

<p>合計: {total}円</p>
<p>税込: {summary().total}円</p>
```

### $effect - 副作用

`$effect`はリアクティブな値の変更に応じて副作用を実行します。DOM操作、ログ出力、外部APIへの通信などに使用されます。

```typescript
<script lang="ts">
  let count = $state(0);
  
  // countが変更されるたびに実行
  $effect(() => {
    console.log(`カウント: ${count}`);
    document.title = `カウント: ${count}`;
    
    // クリーンアップ関数（オプション）
    return () => {
      console.log('クリーンアップ');
    };
  });
</script>
```

## Svelte 4との違い

Svelte 4からSvelte 5への移行で、リアクティビティの書き方が大きく変わりました。以下は同じ機能を実装した例です。

### 古い書き方（Svelte 4）

```svelte
<script>
  let count = 0;
  $: doubled = count * 2;
  
  $: {
    console.log(`Count: ${count}`);
  }
</script>
```

### 新しい書き方（Svelte 5）

```svelte
<script lang="ts">
  let count = $state(0);
  let doubled = $derived(count * 2);
  
  $effect(() => {
    console.log(`Count: ${count}`);
  });
</script>
```

## なぜRunesを使うのか

Svelte 3, 4でのリアクティビティは便利でしたが、いくつかの問題がありました。Runesはこれらの問題を解決します。

### 1. 明示的なリアクティビティ

Svelte 3, 4では、どの変数がリアクティブかが一目では分かりませんでした。Runesでは`$state`を使うことで、リアクティブな変数が明確になります。

```typescript
// 一目でリアクティブな値とわかる
let count = $state(0);
let normalValue = 0; // 通常の変数
```

### 2. TypeScriptとの相性

RunesはTypeScriptと完璧に統合されており、型推論が正確に動作します。以下の例では、`selected`の型が自動的に`Item[]`と推論され、IDEでの補完も完璧に動作します。

```typescript
let items = $state<Item[]>([]);
let selected = $derived(() => 
  items.filter(item => item.selected)
);
```

### 3. 予測可能な動作

`$derived`や`$effect`は依存関係を自動的に追跡し、必要な時だけ再実行されます。これにより、パフォーマンスが向上し、バグも減少します。

## 実践例：TODOリスト

Runesシステムを使った実際のTODOリストアプリケーションです。`$state`、`$derived`、`$effect`の組み合わせを確認できます。

```svelte live ln title=TodoList.svelte
<script lang="ts">
  type Todo = {
    id: string;
    text: string;
    done: boolean;
  };
  
  let todos = $state<Todo[]>([
    { id: '1', text: 'Svelte 5を学習する', done: false },
    { id: '2', text: 'Runesシステムを理解する', done: false }
  ]);
  let newTodoText = $state('');
  let darkMode = $state(false);
  
  // ダークモード初期化（システム設定を検出）
  $effect(() => {
    if (typeof window !== 'undefined') {
      darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      // システム設定の変更を監視
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = (e: MediaQueryListEvent) => {
        darkMode = e.matches;
      };
      mediaQuery.addEventListener('change', handler);
      
      return () => mediaQuery.removeEventListener('change', handler);
    }
  });
  
  // 完了していないTODOの数
  let remainingCount = $derived(
    todos.filter(t => !t.done).length
  );
  
  // 完了率
  let completionRate = $derived(() => {
    if (todos.length === 0) return 0;
    const completed = todos.filter(t => t.done).length;
    return Math.round((completed / todos.length) * 100);
  });
  
  // 統計情報のログ出力（副作用の例）
  $effect(() => {
    console.log(`TODOs: ${todos.length}個、残り: ${remainingCount}個`);
  });
  
  function addTodo() {
    if (!newTodoText.trim()) return;
    
    todos = [...todos, {
      id: Date.now().toString(),
      text: newTodoText,
      done: false
    }];
    
    newTodoText = '';
  }
  
  function toggleTodo(id: string) {
    todos = todos.map(todo => 
      todo.id === id ? { ...todo, done: !todo.done } : todo
    );
  }
  
  function deleteTodo(id: string) {
    todos = todos.filter(todo => todo.id !== id);
  }
</script>

<div class="todo-container" class:dark={darkMode}>
  <div class="header">
    <h2>TODOリスト（Runesシステム）</h2>
    <button 
      onclick={() => darkMode = !darkMode} 
      class="theme-toggle"
      aria-label="テーマ切り替え"
    >
      {darkMode ? '☀️' : '🌙'}
    </button>
  </div>
  
  <div class="input-group">
    <input 
      bind:value={newTodoText}
      onkeydown={(e) => e.key === 'Enter' && addTodo()}
      placeholder="新しいTODOを入力"
      class="todo-input"
    />
    <button onclick={addTodo} class="add-btn">追加</button>
  </div>
  
  {#if todos.length > 0}
    <ul class="todo-list">
      {#each todos as todo (todo.id)}
        <li class="todo-item">
          <input
            type="checkbox"
            checked={todo.done}
            onchange={() => toggleTodo(todo.id)}
            class="todo-checkbox"
          />
          <span class:done={todo.done} class="todo-text">
            {todo.text}
          </span>
          <button onclick={() => deleteTodo(todo.id)} class="delete-btn">
            削除
          </button>
        </li>
      {/each}
    </ul>
    
    <div class="stats">
      <p>📊 残りのタスク: <strong>{remainingCount}</strong>個</p>
      <p>✅ 完了率: <strong>{completionRate()}</strong>%</p>
      <div class="progress-bar">
        <div class="progress-fill" style="width: {completionRate()}%"></div>
      </div>
    </div>
  {:else}
    <p class="empty-message">TODOがありません。新しいタスクを追加してください。</p>
  {/if}
</div>

<style>
  .todo-container {
    max-width: 500px;
    margin: 0 auto;
    padding: 2rem;
    background: #f9f9f9;
    border-radius: 8px;
    transition: background-color 0.3s ease, color 0.3s ease;
  }
  
  .todo-container.dark {
    background: #1a1a1a;
    color: #e0e0e0;
  }
  
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }
  
  h2 {
    color: #ff3e00;
    margin: 0;
  }
  
  .theme-toggle {
    background: transparent;
    border: 2px solid #ff3e00;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    font-size: 1.2rem;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .theme-toggle:hover {
    background: #ff3e00;
    transform: rotate(180deg);
  }
  
  .input-group {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
  }
  
  .todo-input {
    flex: 1;
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
    background: white;
    color: #333;
    transition: all 0.3s ease;
  }
  
  .dark .todo-input {
    background: #2a2a2a;
    border-color: #444;
    color: #e0e0e0;
  }
  
  .dark .todo-input::placeholder {
    color: #888;
  }
  
  .add-btn {
    padding: 0.5rem 1rem;
    background: #ff3e00;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
  }
  
  .add-btn:hover {
    background: #ff5a00;
  }
  
  .todo-list {
    list-style: none;
    padding: 0;
    margin: 0 0 1.5rem 0;
  }
  
  .todo-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem;
    background: white;
    border-radius: 4px;
    margin-bottom: 0.5rem;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    transition: all 0.3s ease;
  }
  
  .dark .todo-item {
    background: #2a2a2a;
    box-shadow: 0 1px 3px rgba(0,0,0,0.3);
  }
  
  .todo-checkbox {
    width: 20px;
    height: 20px;
    cursor: pointer;
  }
  
  .todo-text {
    flex: 1;
    font-size: 1rem;
    color: #333;
    transition: all 0.3s ease;
  }
  
  .dark .todo-text {
    color: #e0e0e0;
  }
  
  .todo-text.done {
    text-decoration: line-through;
    opacity: 0.5;
    color: #666;
  }
  
  .dark .todo-text.done {
    color: #888;
  }
  
  .delete-btn {
    padding: 0.25rem 0.5rem;
    background: #dc3545;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.875rem;
  }
  
  .delete-btn:hover {
    background: #c82333;
  }
  
  .stats {
    padding: 1rem;
    background: white;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    transition: all 0.3s ease;
  }
  
  .dark .stats {
    background: #2a2a2a;
    box-shadow: 0 1px 3px rgba(0,0,0,0.3);
  }
  
  .stats p {
    margin: 0.5rem 0;
    color: #333;
  }
  
  .dark .stats p {
    color: #e0e0e0;
  }
  
  .stats strong {
    color: #ff3e00;
  }
  
  .progress-bar {
    width: 100%;
    height: 20px;
    background: #e9ecef;
    border-radius: 10px;
    overflow: hidden;
    margin-top: 0.5rem;
    transition: background 0.3s ease;
  }
  
  .dark .progress-bar {
    background: #444;
  }
  
  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #ff3e00 0%, #ff5a00 100%);
    transition: width 0.3s ease;
  }
  
  .empty-message {
    text-align: center;
    color: #666;
    padding: 2rem;
    background: white;
    border-radius: 4px;
    transition: all 0.3s ease;
  }
  
  .dark .empty-message {
    background: #2a2a2a;
    color: #999;
  }
</style>
```

## Runesが使える場所・使えない場所

Runesは特定の場所（ファイルタイプ）でのみ使用可能です。  
特にSvelteKitプロジェクトでは、ファイルの種類によって使用可否が異なるため注意が必要です。

### Svelteコンポーネント
| ファイル（場所） | 使用可否 | 理由 |
|---|:---:|---|
| `*.svelte` | 使用可能✅ | Svelteコンポーネント内で完全にサポート |
| `+page.svelte` |使用可能✅ | SvelteKitのページコンポーネント。UI と連動する状態を管理できる |
| `+layout.svelte` | 使用可能✅ | SvelteKitのレイアウトコンポーネント。グローバルな UI 状態やヘッダー・ナビゲーションなどで有用 |

### リアクティブモジュール
| ファイル（場所） | 使用可否 | 理由 |
|---|:---:|---|
| `.svelte.js`、<br>`.svelte.ts` | 使用可能✅ | リアクティブなストアやユーティリティを作成できる特別なファイル |

### 通常のモジュール
| ファイル（場所） | 使用可否 | 理由 |
|---|:---:|---|
| 通常の `.ts` / `.js` | 使用不可❌ | Rune は Svelte のコンパイラが処理する特別な構文 |

### SvelteKitファイル
| ファイル（場所） | 使用可否 | 理由 |
|---|:---:|---|
| `+page.ts`、<br>`+layout.ts` | 条件付き⚠️ | `load()` 関数内では使えないが、トップレベルでは使用可能 |
| `+page.server.ts` | 使用不可❌ | サーバーサイド専用。SSR 実行時に1回限りで状態管理の意味がないため |
| `+layout.server.ts` | 使用不可❌ | 同上 |
| `hooks.server.ts` | 使用不可❌ | Rune のリアクティブ性が不要なサーバーロジック専用ファイル |

:::tip[重要：`.svelte.js` / `.svelte.ts` ファイル]
`.svelte.js`と`.svelte.ts`は、Svelte 5で導入された特別な拡張子で、**コンポーネント外でRunesを使用できる唯一の方法**です。これらのファイルでは、
- グローバルな状態管理（ストア）を作成できる
- 複数コンポーネントで共有するリアクティブなロジックを定義できる  
- カスタムのリアクティブなクラスやユーティリティを作成できる

**例：グローバルカウンターストア（counter.svelte.ts）**
```typescript
// counter.svelte.ts
export function createCounter(initial = 0) {
  let count = $state(initial);
  
  return {
    get value() { return count; },
    increment() { count++; },
    decrement() { count--; }
  };
}
```

詳しい使い方は[リアクティブストア（.svelte.js/.svelte.ts）](/svelte/advanced/reactive-stores/)で解説しています。
:::

## ベストプラクティス

### 1. 初期値の型を明示

```typescript
// ❌ 型推論に頼る
let items = $state([]);

// ✅ 明示的な型定義
let items = $state<Item[]>([]);
```

### 2. $derivedは純粋に

```typescript
// ❌ 副作用を含む
let value = $derived(() => {
  localStorage.setItem('key', 'value'); // 副作用
  return calculateValue();
});

// ✅ 純粋な計算のみ
let value = $derived(calculateValue());

// 副作用は$effectで
$effect(() => {
  localStorage.setItem('key', value);
});
```

### 3. クリーンアップを忘れずに

```typescript
$effect(() => {
  const timer = setInterval(() => {
    console.log('tick');
  }, 1000);
  
  // クリーンアップ関数を返す
  return () => {
    clearInterval(timer);
  };
});
```

## 次のステップ

各Runeの詳細な使い方を学びましょう。

1. [$state - 状態管理](../state/)
2. [$derived - 計算値](../derived/)
3. [$effect - 副作用](../effect/)
4. [$props - プロパティ](../props/)
5. [$bindable - 双方向バインディング](../bindable/)

:::info[ディープダイブ]
Runesシステムの各機能の詳細な比較と使い分けについては、以下のガイドもご参照ください。
- [$derived vs $effect vs derived.by 完全比較ガイド](/deep-dive/derived-vs-effect-vs-derived-by/)
- [リアクティブな状態変数とバインディングの違い](/deep-dive/reactive-state-variables-vs-bindings/)
:::