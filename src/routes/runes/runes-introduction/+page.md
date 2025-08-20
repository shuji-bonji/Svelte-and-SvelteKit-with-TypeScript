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

## Rune が使える場所と使えない場所

RunesはSvelteコンポーネント内でのみ使用可能で、サーバーサイドのコードや通常のTypeScriptモジュールでは使用できません。

| ファイル/場所 | Rune 使用可否 | 理由 |
|---|---|---|
| `+page.svelte` | ✅ 使用可能 | UI と連動する状態を管理できる |
| `+layout.svelte` | ✅ 使用可能 | グローバルな UI 状態やヘッダー・ナビゲーションなどで有用 |
| `+page.ts` / `+layout.ts` | ⚠️ 条件付き | `load()` で Rune は使えないが、コンポーネント内で使う前提のデータ生成には使える場合がある |
| `+page.server.ts` | ❌ 使用不可 | SSR 実行時に1回限りで状態管理の意味がないため |
| `+layout.server.ts` | ❌ 使用不可 | 同上 |
| `hooks.server.ts` | ❌ 使用不可 | Rune のリアクティブ性が不要なサーバーロジック専用ファイル |
| 通常の `.ts` モジュール（サーバー専用） | ❌ 使用不可 | Rune は Svelte runtime が動作するクライアント環境に依存する |

## Rune が必要な場面

Runesは以下のような場面で特に有効です。

- **インタラクティブなUIの構築**: ユーザーがUI上でインタラクションするたびに状態が変わる場面（カウントアップ、チェック状態、フォーム入力など）
- **計算値の管理**: 複数の状態が依存し合うロジックを簡潔に書きたい場合（`$derived`を使った合計計算、フィルタリングなど）
- **副作用の管理**: DOM操作、ローカルストレージへの保存、APIコールなどをリアクティブに実行したい場合（`$effect`）

## Rune が使えない場面（代替方法）

サーバーサイドの処理ではRunesは使用できません。以下の表は一般的なケースとその代替手段を示しています。

| 処理内容 | 使用不可な例 | 代替手段 |
|---|---|---|
| 認証トークンの取得 | `+page.server.ts` 内で `$state` を使う | `load()` + `event.locals` を使って処理 |
| DBへのアクセス | `+page.server.ts` 内で `$effect` を使う | 通常の async 関数として記述 |
| セッション情報の保持 | `hooks.server.ts` 内で `$state` を使う | `handle` フックで `event.locals` に保存 |


## 基本的な使い方

### $state - 状態の定義

`$state`はリアクティブな状態を宣言する最も基本的なRuneです。値が変更されると、その値を参照しているUIが自動的に更新されます。

:::tip[コード展開]
Click fold/expand codeをクリックするとコードが展開表示されます。
:::

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
<p>税込: {summary.total}円</p>
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

依存関係が自動的に追跡され、必要な時だけ再実行されます。

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

<div class="todo-container">
  <h2>TODOリスト（Runesシステム）</h2>
  
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
  }
  
  h2 {
    color: #ff3e00;
    margin-bottom: 1rem;
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
  }
  
  .todo-checkbox {
    width: 20px;
    height: 20px;
    cursor: pointer;
  }
  
  .todo-text {
    flex: 1;
    font-size: 1rem;
  }
  
  .todo-text.done {
    text-decoration: line-through;
    opacity: 0.5;
    color: #666;
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
  }
  
  .stats p {
    margin: 0.5rem 0;
    color: #333;
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
  }
</style>
```

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