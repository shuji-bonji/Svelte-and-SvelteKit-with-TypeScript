---
title: コンポーネントの基本
description: Svelteコンポーネントの構造と基本的な機能
---

Svelteコンポーネントは、**script**（ロジック）、**markup**（HTML）、**style**（CSS）の3つの部分から構成されます。これらは単一の`.svelte`ファイル内に記述され、カプセル化されたコンポーネントを形成します。

## コンポーネントの基本構造

```svelte
<!-- MyComponent.svelte -->

<!-- 1. Script部分：ロジックとデータ -->
<script lang="ts">
  // コンポーネントのロジック
  let count: number = 0;
  
  function increment(): void {
    count++;
  }
</script>

<!-- 2. Markup部分：HTML構造 -->
<div class="counter">
  <h2>カウンター: {count}</h2>
  <button on:click={increment}>
    クリック
  </button>
</div>

<!-- 3. Style部分：スタイリング -->
<style>
  .counter {
    padding: 1rem;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  
  h2 {
    color: #333;
  }
  
  button {
    background: #ff3e00;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    cursor: pointer;
  }
</style>
```

## Script部分の詳細

### 変数宣言とリアクティビティ

:::caution
> Svelte 5より前のバージョンでは、`let`で宣言した変数は自動的にリアクティブになりました。

Svelte 5では、Runesシステム（`$state`など）を使用してリアクティビティを明示的に制御します。ここに記載している以前のバージョンの宣言方法は使用しないでください。
:::

<Expansion title="Click to expand/fold panel">
変数宣言とリアクティビティ

Svelte 5より前のバージョンでは、`let`で宣言した変数は自動的にリアクティブになります。

```svelte
<script lang="ts">
  // これらの変数は自動的にリアクティブ（Svelte 4以前）
  let name: string = 'Alice';
  let age: number = 25;
  let isActive: boolean = true;
  
  // オブジェクトと配列もリアクティブ
  let user = {
    name: 'Bob',
    email: 'bob@example.com'
  };
  
  let items: string[] = ['item1', 'item2'];
  
  function updateUser(): void {
    // UIが自動的に更新される
    user.name = 'Charlie';
    items.push('item3');
  }
</script>
```

#### Svelte 3/4の問題点
  - すべてのlet変数が自動的にリアクティブになるため、どれがリアクティブか分かりにくい
  - パフォーマンスの観点で無駄がある場合がある
  - TypeScriptとの統合が複雑
#### Svelte 5の改善
  - $stateで明示的にリアクティブを宣言
  - より予測可能で理解しやすい
  - TypeScriptの型推論が向上
  - パフォーマンスの最適化

</Expansion>


### インポートとエクスポート

```svelte
<script lang="ts">
  // 他のコンポーネントやモジュールをインポート
  import AnotherComponent from './AnotherComponent.svelte';
  import { helper } from '$lib/utils';
  import type { User } from '$lib/types';
  
  // propsをエクスポート（親コンポーネントから受け取る）
  export let title: string;
  export let count: number = 0; // デフォルト値
  export let user: User | undefined = undefined;
</script>
```

## Markup部分の詳細

### 条件分岐

```svelte
<script lang="ts">
  let isLoggedIn: boolean = false;
  let score: number = 85;
</script>

<!-- if文 -->
{#if isLoggedIn}
  <p>ログイン済み</p>
{/if}

<!-- if-else文 -->
{#if score >= 80}
  <p>優秀！</p>
{:else}
  <p>もう少し頑張りましょう</p>
{/if}

<!-- if-else if-else文 -->
{#if score >= 90}
  <p>素晴らしい！</p>
{:else if score >= 70}
  <p>良い成績です</p>
{:else if score >= 60}
  <p>合格です</p>
{:else}
  <p>再試験が必要です</p>
{/if}
```

### ループ処理

```svelte
<script lang="ts">
  interface Item {
    id: number;
    name: string;
    price: number;
  }
  
  let items: Item[] = [
    { id: 1, name: 'Apple', price: 100 },
    { id: 2, name: 'Banana', price: 80 },
    { id: 3, name: 'Orange', price: 120 }
  ];
</script>

<!-- 基本的なeach -->
<ul>
  {#each items as item}
    <li>{item.name}: ¥{item.price}</li>
  {/each}
</ul>

<!-- インデックス付きeach -->
<ul>
  {#each items as item, index}
    <li>{index + 1}. {item.name}</li>
  {/each}
</ul>

<!-- key付きeach（パフォーマンス最適化） -->
<ul>
  {#each items as item (item.id)}
    <li>{item.name}</li>
  {/each}
</ul>

<!-- 空の配列の場合の処理 -->
{#each items as item}
  <li>{item.name}</li>
{:else}
  <li>アイテムがありません</li>
{/each}
```

### Await ブロック

```svelte
<script lang="ts">
  async function fetchData(): Promise<User[]> {
    const response = await fetch('/api/users');
    return response.json();
  }
  
  let promise = fetchData();
</script>

<!-- Promise の状態に応じて表示を切り替え -->
{#await promise}
  <p>読み込み中...</p>
{:then users}
  <ul>
    {#each users as user}
      <li>{user.name}</li>
    {/each}
  </ul>
{:catch error}
  <p>エラー: {error.message}</p>
{/await}

<!-- 成功時のみ処理 -->
{#await promise then users}
  <p>ユーザー数: {users.length}</p>
{/await}
```

## Style部分の詳細

### スコープ付きスタイル

Svelteのスタイルは、デフォルトでコンポーネントにスコープされます。

```svelte
<style>
  /* このスタイルは現在のコンポーネントにのみ適用される */
  p {
    color: blue;
  }
  
  /* 生成されるCSSは以下のようになる
     p.svelte-xyz123 { color: blue; } */
</style>
```

### グローバルスタイル

`:global()`を使用してグローバルスタイルを定義

```svelte
<style>
  /* このコンポーネント内のp要素のみ */
  p {
    color: blue;
  }
  
  /* 全てのp要素に適用 */
  :global(p) {
    margin: 0;
  }
  
  /* 子要素のグローバルスタイル */
  .container :global(a) {
    color: red;
  }
</style>
```

### 動的スタイル

```svelte
<script lang="ts">
  let color: string = 'red';
  let size: number = 16;
  let isActive: boolean = true;
</script>

<!-- インラインスタイル -->
<p style="color: {color}; font-size: {size}px;">
  動的スタイル
</p>

<!-- style:ディレクティブ -->
<p
  style:color
  style:font-size="{size}px"
  style:font-weight={isActive ? 'bold' : 'normal'}
>
  より簡潔な記法
</p>

<!-- クラスの動的適用 -->
<div
  class="base"
  class:active={isActive}
  class:large={size > 20}
>
  条件付きクラス
</div>

<style>
  .base {
    padding: 1rem;
  }
  
  .active {
    background: #ff3e00;
    color: white;
  }
  
  .large {
    font-size: 1.5rem;
  }
</style>
```

## イベントハンドリング

### 基本的なイベント

```svelte
<script lang="ts">
  function handleClick(event: MouseEvent): void {
    console.log('クリックされました', event);
  }
  
  function handleInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    console.log('入力値:', target.value);
  }
  
  let value: string = '';
</script>

<!-- on:イベント名 -->
<button on:click={handleClick}>
  クリック
</button>

<!-- インライン関数 -->
<button on:click={() => console.log('インライン')}>
  インライン関数
</button>

<!-- イベント修飾子 -->
<button on:click|preventDefault|stopPropagation={handleClick}>
  修飾子付き
</button>

<!-- once: 一度だけ実行 -->
<button on:click|once={handleClick}>
  一度だけ
</button>

<!-- 入力イベント -->
<input
  type="text"
  on:input={handleInput}
  bind:value
/>
```

### イベント修飾子

| 修飾子 | 説明 |
|--------|------|
| `preventDefault` | `event.preventDefault()`を呼ぶ |
| `stopPropagation` | `event.stopPropagation()`を呼ぶ |
| `passive` | パッシブリスナーとして登録 |
| `capture` | キャプチャフェーズで実行 |
| `once` | 一度だけ実行 |
| `self` | event.targetが要素自身の場合のみ実行 |
| `trusted` | 信頼できるイベントのみ実行 |

## 双方向バインディング

```svelte
<script lang="ts">
  let name: string = '';
  let email: string = '';
  let age: number = 0;
  let agreed: boolean = false;
  let selected: string = '';
  let multiSelect: string[] = [];
</script>

<!-- テキスト入力 -->
<input type="text" bind:value={name} />
<input type="email" bind:value={email} />
<input type="number" bind:value={age} />

<!-- チェックボックス -->
<input type="checkbox" bind:checked={agreed} />

<!-- ラジオボタン -->
<input type="radio" bind:group={selected} value="option1" />
<input type="radio" bind:group={selected} value="option2" />

<!-- セレクトボックス -->
<select bind:value={selected}>
  <option value="">選択してください</option>
  <option value="apple">Apple</option>
  <option value="banana">Banana</option>
</select>

<!-- 複数選択 -->
<select multiple bind:value={multiSelect}>
  <option value="red">Red</option>
  <option value="green">Green</option>
  <option value="blue">Blue</option>
</select>

<!-- テキストエリア -->
<textarea bind:value={name} />
```

## 実践例：TODOアプリケーション

### 子（部品）コンポーネント（TodoItem.svelte）

```svelte
<!-- $lib/components/TodoItem.svelte -->
<script lang="ts">
  interface Todo {
    id: number;
    text: string;
    completed: boolean;
    createdAt: Date;
  }
  
  interface Props {
    todo: Todo;
    onToggle: (id: number) => void;
    onDelete: (id: number) => void;
  }
  
  let { todo, onToggle, onDelete }: Props = $props();
  
  let formattedDate = $derived(
    todo?.createdAt ? todo.createdAt.toLocaleDateString('ja-JP') : ''
  );
  
  function handleToggle(): void {
    if (todo) {
      onToggle(todo.id);
    }
  }
  
  function handleDelete(): void {
    if (todo && confirm('削除してもよろしいですか？')) {
      onDelete(todo.id);
    }
  }
</script>

{#if todo}
<div class="todo-item" class:completed={todo.completed}>
  <input
    type="checkbox"
    checked={todo.completed}
    onchange={handleToggle}
  />
  
  <span class="text">{todo.text}</span>
  
  <span class="date">{formattedDate}</span>
  
  <button
    class="delete"
    onclick={handleDelete}
    aria-label="削除"
  >
    ×
  </button>
</div>
{/if}

<style>
  .todo-item {
    display: flex;
    align-items: center;
    padding: 0.5rem;
    border-bottom: 1px solid #eee;
    gap: 0.5rem;
  }
  
  .todo-item.completed .text {
    text-decoration: line-through;
    opacity: 0.6;
  }
  
  .text {
    flex: 1;
  }
  
  .date {
    font-size: 0.8rem;
    color: #666;
  }
  
  .delete {
    background: #ff4444;
    color: white;
    border: none;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    cursor: pointer;
    font-size: 1.2rem;
    line-height: 1;
  }
  
  .delete:hover {
    background: #cc0000;
  }
</style>
```

### 親（ページ）コンポーネント（+page.svelte）

```svelte
<!-- src/routes/todos/+page.svelte -->
<script lang="ts">
  import TodoItem from '$lib/components/TodoItem.svelte';
  
  interface Todo {
    id: number;
    text: string;
    completed: boolean;
    createdAt: Date;
  }
  
  let todos = $state<Todo[]>([
    // 初期データ
  ]);
  
  function toggleTodo(id: number) {
    todos = todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
  }
  
  function deleteTodo(id: number) {
    todos = todos.filter(todo => todo.id !== id);
  }
</script>

<div class="todo-list">
  {#each todos as todo (todo.id)}
    <TodoItem 
      {todo}
      onToggle={toggleTodo}
      onDelete={deleteTodo}
    />
  {/each}
</div>
```

### デモ

以下は、親コンポーネントと子コンポーネントを組み合わせたTODOアプリの完全な例です。実際のプロジェクトでは別ファイルに分けますが、ここではデモのため1つのファイルにまとめています。

```svelte live ln title=TodoApp.svelte
<script lang="ts">
  // 実際のプロジェクトでは以下のようにインポートします
  // import TodoItem from '$lib/components/TodoItem.svelte';
  
  interface Todo {
    id: number;
    text: string;
    completed: boolean;
    createdAt: Date;
  }
  
  let todos = $state<Todo[]>([
    {
      id: 1,
      text: 'Svelte 5を学習する',
      completed: false,
      createdAt: new Date('2024-01-15')
    },
    {
      id: 2,
      text: 'Runesシステムを理解する',
      completed: true,
      createdAt: new Date('2024-01-16')
    },
    {
      id: 3,
      text: 'TODOアプリを作成する',
      completed: false,
      createdAt: new Date('2024-01-17')
    }
  ]);
  
  let newTodoText = $state('');
  
  function addTodo() {
    if (newTodoText.trim()) {
      const newTodo: Todo = {
        id: Date.now(),
        text: newTodoText,
        completed: false,
        createdAt: new Date()
      };
      todos = [...todos, newTodo];
      newTodoText = '';
    }
  }
  
  function toggleTodo(id: number) {
    todos = todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
  }
  
  function deleteTodo(id: number) {
    todos = todos.filter(todo => todo.id !== id);
  }
  
  let completedCount = $derived(todos.filter(t => t.completed).length);
  let totalCount = $derived(todos.length);
  
  // インラインコンポーネントとして定義（通常は別ファイル）
  // TodoItem.svelteの内容をここに含める
</script>

<div class="todo-app">
  <h1>TODOリスト</h1>
  
  <div class="add-todo">
    <input
      type="text"
      bind:value={newTodoText}
      placeholder="新しいタスクを入力..."
      onkeydown={(e) => e.key === 'Enter' && addTodo()}
    />
    <button onclick={addTodo}>追加</button>
  </div>
  
  <div class="todo-list">
    {#each todos as todo (todo.id)}
      <!-- TodoItemコンポーネントの内容をインラインで展開 -->
      {#if todo}
      <div class="todo-item" class:completed={todo.completed}>
        <input
          type="checkbox"
          checked={todo.completed}
          onchange={() => toggleTodo(todo.id)}
        />
        
        <span class="text">{todo.text}</span>
        
        <span class="date">{todo.createdAt.toLocaleDateString('ja-JP')}</span>
        
        <button
          class="delete"
          onclick={() => {
            if (confirm('削除してもよろしいですか？')) {
              deleteTodo(todo.id);
            }
          }}
          aria-label="削除"
        >
          ×
        </button>
      </div>
      {/if}
    {/each}
  </div>
  
  {#if totalCount > 0}
    <div class="summary">
      完了: {completedCount} / {totalCount}
    </div>
  {/if}
</div>

<style>
  .todo-app {
    max-width: 600px;
    margin: 0 auto;
    padding: 2rem;
  }
  
  h1 {
    color: #ff3e00;
    text-align: center;
  }
  
  .add-todo {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 2rem;
  }
  
  .add-todo input {
    flex: 1;
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
  }
  
  .add-todo button {
    padding: 0.5rem 1rem;
    background: #ff3e00;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
  }
  
  .add-todo button:hover {
    background: #ff5a00;
  }
  
  .todo-list {
    border: 1px solid #eee;
    border-radius: 4px;
    overflow: hidden;
  }
  
  .summary {
    text-align: center;
    margin-top: 1rem;
    color: #666;
    font-size: 0.9rem;
  }
  
  /* TodoItemコンポーネントのスタイル */
  .todo-item {
    display: flex;
    align-items: center;
    padding: 0.5rem;
    border-bottom: 1px solid #eee;
    gap: 0.5rem;
  }
  
  .todo-item.completed .text {
    text-decoration: line-through;
    opacity: 0.6;
  }
  
  .todo-item .text {
    flex: 1;
  }
  
  .todo-item .date {
    font-size: 0.8rem;
    color: #666;
  }
  
  .todo-item .delete {
    background: #ff4444;
    color: white;
    border: none;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    cursor: pointer;
    font-size: 1.2rem;
    line-height: 1;
  }
  
  .todo-item .delete:hover {
    background: #cc0000;
  }
</style>
```

## まとめ

このページで学んだこと

- Svelteコンポーネントの3つの主要部分（script、markup、style）
- 条件分岐とループ処理
- イベントハンドリングと修飾子
- 双方向データバインディング
- スコープ付きスタイルとグローバルスタイル
- 動的なスタイルとクラスの適用

## 次のステップ

[TypeScript統合](/svelte-basics/typescript-integration/)では、SvelteでTypeScriptを効果的に使用する方法を詳しく学びます。