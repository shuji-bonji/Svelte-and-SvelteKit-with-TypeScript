---
title: TypeScript統合
description: SvelteコンポーネントでTypeScriptを効果的に使用する基本
---

SvelteはTypeScriptを第一級市民として扱い、優れた型安全性とIDEサポートを提供します。このページでは、SvelteコンポーネントでTypeScriptを使用する基本的な方法を学びます。

## TypeScriptの有効化

SvelteでTypeScriptを使用するのは非常に簡単です。`lang="ts"`属性を追加するだけで始められます。

### script タグでTypeScriptを使用

SvelteコンポーネントでTypeScriptを有効にする最も基本的な方法です。

```svelte
<!-- lang="ts"を追加するだけ -->
<script lang="ts">
  let message: string = 'Hello TypeScript!';
  let count: number = 0;
  let isActive: boolean = true;
</script>

<h1>{message}</h1>
<p>Count: {count}</p>
```

### プロジェクト全体の設定

SvelteKitプロジェクトではTypeScriptがデフォルトでサポートされています。`svelte.config.js`でViteのプリプロセッサーが自動的にTypeScriptを処理します。

```javascript
// svelte.config.js
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

export default {
  preprocess: vitePreprocess() // TypeScriptを自動処理
};
```

## Svelte 5 Runesの型定義

Svelte 5のRunesシステムは、TypeScriptと完璧に統合されています。型推論が優秀で、多くの場合明示的な型定義が不要です。

### $stateの型定義

リアクティブな状態を定義する際の型定義方法です。

```svelte
<script lang="ts">
  // 型推論（推奨）
  let count = $state(0);  // number型として自動推論
  let message = $state('Hello');  // string型として自動推論
  
  // 明示的な型指定（複雑な型の場合）
  interface User {
    id: string;
    name: string;
    email: string;
  }
  
  let user = $state<User | null>(null);
  let items = $state<string[]>([]);
</script>
```

### $propsの型定義

Svelte 5の新しいPropsシステムでの型定義方法です。

```svelte
<script lang="ts">
  // Props型を定義
  interface Props {
    title: string;
    count?: number;
    onClose?: () => void;
  }
  
  // $props()で受け取る
  let { title, count = 0, onClose }: Props = $props();
</script>

<article>
  <h2>{title}</h2>
  <p>Count: {count}</p>
  {#if onClose}
    <button onclick={onClose}>Close</button>
  {/if}
</article>
```

### $derivedの型推論

`$derived`は自動的に型を推論するため、通常は型定義が不要です。

```svelte
<script lang="ts">
  let price = $state(100);
  let quantity = $state(2);
  
  // 自動的にnumber型として推論される
  let total = $derived(price * quantity);
  
  // 複雑な計算の場合
  interface CartItem {
    id: string;
    price: number;
    quantity: number;
  }
  
  let items = $state<CartItem[]>([]);
  
  // CartItem[]型として推論される
  let totalPrice = $derived(
    items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  );
</script>
```

### $effectの型安全性

副作用を扱う`$effect`での型安全な実装方法です。

```svelte
<script lang="ts">
  let count = $state(0);
  let logs = $state<string[]>([]);
  
  $effect(() => {
    // countの型はnumberとして推論される
    console.log(`Count changed to: ${count}`);
    
    // 型安全なDOM操作
    const element = document.getElementById('my-element');
    if (element instanceof HTMLDivElement) {
      element.textContent = `Count: ${count}`;
    }
    
    // クリーンアップ関数も型安全
    return () => {
      console.log('Cleanup');
    };
  });
</script>
```

### $bindableの型定義

双方向バインディングを可能にする`$bindable`の使用方法です。

```svelte
<script lang="ts">
  interface Props {
    value: $bindable<string>;
    checked?: $bindable<boolean>;
  }
  
  let { 
    value = $bindable(''),
    checked = $bindable(false)
  }: Props = $props();
</script>

<input bind:value={value} />
<input type="checkbox" bind:checked={checked} />
```

## イベントハンドラの型定義

Svelteでイベントを扱う際の型安全な実装方法です。

### DOM イベント

標準的なDOMイベントの型定義方法です。`currentTarget`を使用することで、要素固有のプロパティに安全にアクセスできます。

```svelte
<script lang="ts">
  // クリックイベント
  function handleClick(event: MouseEvent & { 
    currentTarget: HTMLButtonElement 
  }) {
    console.log(event.currentTarget.textContent);
    console.log(event.clientX, event.clientY);
  }
  
  // 入力イベント
  function handleInput(event: Event & {
    currentTarget: HTMLInputElement
  }) {
    const value = event.currentTarget.value;
    console.log(`Input value: ${value}`);
  }
  
  // フォーム送信
  function handleSubmit(event: SubmitEvent & {
    currentTarget: HTMLFormElement
  }) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    // フォームデータの処理
  }
</script>

<button onclick={handleClick}>Click me</button>
<input oninput={handleInput} />
<form onsubmit={handleSubmit}>
  <!-- フォーム要素 -->
</form>
```

### カスタムイベント

コンポーネント間でカスタムイベントを使用する際の型定義です。

```svelte
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
  // イベントの型を定義
  interface EventMap {
    save: { id: string; data: string };
    delete: { id: string };
    update: null;  // ペイロードなし
  }
  
  const dispatch = createEventDispatcher<EventMap>();
  
  function handleSave() {
    // 型チェックが効く
    dispatch('save', { id: '123', data: 'test' });
  }
  
  function handleDelete(id: string) {
    dispatch('delete', { id });
  }
  
  function handleUpdate() {
    dispatch('update');
  }
</script>
```

### キーボードイベント

キーボードイベントの型安全な処理方法です。

```svelte
<script lang="ts">
  function handleKeydown(event: KeyboardEvent & {
    currentTarget: HTMLInputElement
  }) {
    if (event.key === 'Enter') {
      console.log('Enter pressed');
      const value = event.currentTarget.value;
      // 処理...
    }
    
    if (event.ctrlKey && event.key === 's') {
      event.preventDefault();
      // 保存処理
    }
  }
</script>

<input onkeydown={handleKeydown} />
```

## 基本的な型パターン

### コンポーネントの状態管理

型安全な状態管理の基本パターンです。

```svelte
<script lang="ts">
  // ユーザー情報の型定義
  interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'user' | 'guest';
  }
  
  // 状態の型定義
  let user = $state<User | null>(null);
  let loading = $state(false);
  let error = $state<string | null>(null);
  
  // 非同期データ取得
  async function fetchUser(id: string): Promise<void> {
    loading = true;
    error = null;
    
    try {
      const response = await fetch(`/api/users/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }
      user = await response.json();
    } catch (err) {
      error = err instanceof Error ? err.message : 'Unknown error';
    } finally {
      loading = false;
    }
  }
</script>

{#if loading}
  <p>Loading...</p>
{:else if error}
  <p class="error">{error}</p>
{:else if user}
  <div>
    <h2>{user.name}</h2>
    <p>{user.email}</p>
    <span class="role">{user.role}</span>
  </div>
{/if}
```

### フォームの型定義

フォーム入力を扱う際の型安全な実装です。

```svelte live
<script lang="ts">
  // フォームデータの型
  interface FormData {
    username: string;
    email: string;
    age: number;
    agreed: boolean;
  }
  
  // フォームエラーの型
  type FormErrors = Partial<Record<keyof FormData, string>>;
  
  // 状態
  let formData = $state<FormData>({
    username: '',
    email: '',
    age: 0,
    agreed: false
  });
  
  let errors = $state<FormErrors>({});
  
  // バリデーション
  function validate(): boolean {
    const newErrors: FormErrors = {};
    
    if (!formData.username) {
      newErrors.username = 'ユーザー名は必須です';
    }
    
    if (!formData.email.includes('@')) {
      newErrors.email = '有効なメールアドレスを入力してください';
    }
    
    if (formData.age < 18) {
      newErrors.age = '18歳以上である必要があります';
    }
    
    errors = newErrors;
    return Object.keys(newErrors).length === 0;
  }
  
  function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    if (validate()) {
      console.log('Form submitted:', formData);
    }
  }
</script>

<form onsubmit={handleSubmit}>
  <label>
    ユーザー名:
    <input bind:value={formData.username} />
    {#if errors.username}
      <span class="error">{errors.username}</span>
    {/if}
  </label>
  
  <label>
    メール:
    <input type="email" bind:value={formData.email} />
    {#if errors.email}
      <span class="error">{errors.email}</span>
    {/if}
  </label>
  
  <label>
    年齢:
    <input type="number" bind:value={formData.age} />
    {#if errors.age}
      <span class="error">{errors.age}</span>
    {/if}
  </label>
  
  <label>
    <input type="checkbox" bind:checked={formData.agreed} />
    利用規約に同意する
  </label>
  
  <button type="submit">送信</button>
</form>
```

### リストの型安全な操作

配列を扱う際の型安全なパターンです。

```svelte live
<script lang="ts">
  interface Todo {
    id: string;
    text: string;
    completed: boolean;
    createdAt: Date;
  }
  
  let todos = $state<Todo[]>([]);
  let newTodoText = $state('');
  
  function addTodo() {
    if (!newTodoText.trim()) return;
    
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      text: newTodoText,
      completed: false,
      createdAt: new Date()
    };
    
    todos = [...todos, newTodo];
    newTodoText = '';
  }
  
  function toggleTodo(id: string) {
    todos = todos.map(todo =>
      todo.id === id 
        ? { ...todo, completed: !todo.completed }
        : todo
    );
  }
  
  function deleteTodo(id: string) {
    todos = todos.filter(todo => todo.id !== id);
  }
  
  // 派生値
  let completedCount = $derived(
    todos.filter(todo => todo.completed).length
  );
  
  let pendingCount = $derived(
    todos.length - completedCount
  );
</script>

<div>
  <input 
    bind:value={newTodoText}
    onkeydown={(e) => e.key === 'Enter' && addTodo()}
    placeholder="新しいタスクを入力"
  />
  <button onclick={addTodo}>追加</button>
</div>

<ul>
  {#each todos as todo (todo.id)}
    <li class:completed={todo.completed}>
      <input 
        type="checkbox"
        checked={todo.completed}
        onchange={() => toggleTodo(todo.id)}
      />
      <span>{todo.text}</span>
      <button onclick={() => deleteTodo(todo.id)}>削除</button>
    </li>
  {/each}
</ul>

<p>
  完了: {completedCount} / 未完了: {pendingCount}
</p>

<style>
  .completed {
    text-decoration: line-through;
    opacity: 0.6;
  }
</style>
```

## スロットの型定義

Svelteのスロットシステムでの型定義方法です。

### 基本的なスロット

```svelte
<!-- Card.svelte -->
<script lang="ts">
  interface Props {
    title: string;
    children?: import('svelte').Snippet;
  }
  
  let { title, children }: Props = $props();
</script>

<div class="card">
  <h3>{title}</h3>
  {#if children}
    {@render children()}
  {/if}
</div>
```

### スロットプロップス

スロットに値を渡す場合の型定義です。

```svelte
<!-- List.svelte -->
<script lang="ts">
  interface Item {
    id: string;
    name: string;
  }
  
  interface Props {
    items: Item[];
    children?: import('svelte').Snippet<[Item]>;
  }
  
  let { items, children }: Props = $props();
</script>

<ul>
  {#each items as item (item.id)}
    <li>
      {#if children}
        {@render children(item)}
      {:else}
        {item.name}
      {/if}
    </li>
  {/each}
</ul>
```

## よくあるTypeScriptエラーと解決法

### 1. $stateの型推論エラー

```typescript
// ❌ エラー: any[]として推論される
let items = $state([]);

// ✅ 正しい: 明示的な型指定
let items = $state<string[]>([]);
```

### 2. イベントハンドラの型エラー

```typescript
// ❌ エラー: event.targetが不明
function handleClick(event: Event) {
  console.log(event.target.value);
}

// ✅ 正しい: currentTargetを使用
function handleClick(event: Event & {
  currentTarget: HTMLButtonElement
}) {
  console.log(event.currentTarget.textContent);
}
```

### 3. $propsの型エラー

```typescript
// ❌ エラー: 型定義なし
let props = $props();

// ✅ 正しい: 型を定義
interface Props {
  title: string;
}
let { title }: Props = $props();
```

## まとめ

このページでは、SvelteコンポーネントでTypeScriptを使用する基本について学びました。

- **TypeScriptの有効化** - `lang="ts"`属性の追加
- **Runesの型定義** - $state、$props、$derivedなどの型安全な使用
- **イベントハンドラ** - DOM・カスタムイベントの型定義
- **基本パターン** - 状態管理、フォーム、リストの型安全な実装
- **スロット** - Snippetシステムでの型定義

これらの基本を理解することで、型安全なSvelteコンポーネントを作成できます。

:::info[Actionsの型定義]
DOM要素を直接操作する`use:action`の型定義については、[use:アクション](/svelte-basics/actions/)ページのTypeScriptとの統合セクションを参照してください。
:::

## 次のステップ

TypeScriptの基本的な使い方を理解したら、より高度なパターンを学びましょう。

- [なぜTypeScriptが必要か](/introduction/why-typescript/) - TypeScriptの重要性を理解
- [TypeScript設定](/introduction/typescript-setup/) - プロジェクトの詳細な設定方法
- [TypeScriptパターン](/advanced/typescript-patterns/) - 高度な型定義パターンとベストプラクティス