---
title: TypeScript統合
description: SvelteコンポーネントでTypeScriptを効果的に使用する
---

SvelteはTypeScriptを第一級市民として扱い、優れた型安全性とIDEサポートを提供します。このページでは、SvelteコンポーネントでTypeScriptを効果的に使用する方法を学びます。

## TypeScriptの有効化

### 1. script タグでTypeScriptを使用

```svelte
<!-- lang="ts"を追加するだけ -->
<script lang="ts">
  let message: string = 'Hello TypeScript!';
  let count: number = 0;
  let isActive: boolean = true;
</script>
```

### 2. プロジェクト全体の設定

`svelte.config.js`でTypeScriptを有効化（通常は自動設定済み）：

```javascript
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

export default {
  preprocess: vitePreprocess() // TypeScriptを自動処理
};
```

## Props の型定義

### 基本的なProps

```svelte
<script lang="ts">
  // 必須のprop
  export let name: string;
  
  // オプショナルなprop（デフォルト値あり）
  export let age: number = 0;
  
  // オプショナルなprop（undefined可能）
  export let email: string | undefined = undefined;
  
  // 複雑な型
  export let user: {
    id: number;
    name: string;
    roles: string[];
  };
</script>
```

### インターフェースを使用したProps

```svelte
<script lang="ts">
  interface UserData {
    id: number;
    name: string;
    email: string;
    createdAt: Date;
  }
  
  interface Props {
    title: string;
    user: UserData;
    onSave?: (user: UserData) => void;
  }
  
  // 個別にエクスポート
  export let title: Props['title'];
  export let user: Props['user'];
  export let onSave: Props['onSave'] = undefined;
</script>
```

## イベントの型定義

### DOM イベント

```svelte
<script lang="ts">
  function handleClick(event: MouseEvent): void {
    const target = event.currentTarget as HTMLButtonElement;
    console.log('Button clicked:', target.textContent);
  }
  
  function handleInput(event: Event): void {
    const target = event.currentTarget as HTMLInputElement;
    console.log('Input value:', target.value);
  }
  
  function handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      console.log('Enter pressed');
    }
  }
  
  function handleSubmit(event: SubmitEvent): void {
    event.preventDefault();
    const formData = new FormData(event.currentTarget as HTMLFormElement);
    // フォーム処理
  }
</script>

<button on:click={handleClick}>クリック</button>
<input on:input={handleInput} on:keydown={handleKeydown} />
<form on:submit={handleSubmit}>
  <!-- フォーム要素 -->
</form>
```

### カスタムイベント

```svelte
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
  // イベントの型定義
  interface EventMap {
    save: { id: number; data: string };
    delete: { id: number };
    update: { field: string; value: any };
  }
  
  const dispatch = createEventDispatcher<EventMap>();
  
  function handleSave(): void {
    // 型安全なイベント発火
    dispatch('save', { id: 1, data: 'test' });
    
    // TypeScriptエラー：型が合わない
    // dispatch('save', { id: 'string' }); // Error!
  }
</script>
```

## ジェネリック型の使用

### ジェネリックコンポーネント

```svelte
<!-- List.svelte -->
<script lang="ts" generics="T">
  export let items: T[];
  export let getKey: (item: T) => string | number;
  export let renderItem: (item: T) => string;
  export let onSelect: ((item: T) => void) | undefined = undefined;
</script>

{#each items as item (getKey(item))}
  <div on:click={() => onSelect?.(item)}>
    {@html renderItem(item)}
  </div>
{/each}
```

使用例：

```svelte
<script lang="ts">
  import List from './List.svelte';
  
  interface User {
    id: number;
    name: string;
  }
  
  let users: User[] = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' }
  ];
</script>

<List
  items={users}
  getKey={(user) => user.id}
  renderItem={(user) => `<strong>${user.name}</strong>`}
  onSelect={(user) => console.log('Selected:', user)}
/>
```

## 型ガードと型の絞り込み

```svelte
<script lang="ts">
  type Status = 'loading' | 'success' | 'error';
  
  interface LoadingState {
    status: 'loading';
  }
  
  interface SuccessState<T> {
    status: 'success';
    data: T;
  }
  
  interface ErrorState {
    status: 'error';
    error: Error;
  }
  
  type State<T> = LoadingState | SuccessState<T> | ErrorState;
  
  let state: State<string[]> = { status: 'loading' };
  
  // 型ガード関数
  function isSuccess<T>(state: State<T>): state is SuccessState<T> {
    return state.status === 'success';
  }
  
  function isError<T>(state: State<T>): state is ErrorState {
    return state.status === 'error';
  }
</script>

{#if state.status === 'loading'}
  <p>読み込み中...</p>
{:else if isSuccess(state)}
  <!-- TypeScriptはここでstateがSuccessStateであることを認識 -->
  <ul>
    {#each state.data as item}
      <li>{item}</li>
    {/each}
  </ul>
{:else if isError(state)}
  <!-- TypeScriptはここでstateがErrorStateであることを認識 -->
  <p>エラー: {state.error.message}</p>
{/if}
```

## スロットの型定義

```svelte
<!-- Card.svelte -->
<script lang="ts">
  export let title: string;
  
  // スロットプロパティの型
  interface SlotProps {
    header: { title: string };
    default: Record<string, never>; // プロパティなし
    footer: { timestamp: Date };
  }
</script>

<div class="card">
  <slot name="header" {title} />
  <slot />
  <slot name="footer" timestamp={new Date()} />
</div>
```

## コンテキストAPI の型定義

```svelte
<!-- Parent.svelte -->
<script lang="ts">
  import { setContext } from 'svelte';
  
  interface AppContext {
    user: {
      id: number;
      name: string;
    };
    theme: 'light' | 'dark';
    updateTheme: (theme: 'light' | 'dark') => void;
  }
  
  const context: AppContext = {
    user: { id: 1, name: 'Alice' },
    theme: 'light',
    updateTheme: (theme) => {
      context.theme = theme;
    }
  };
  
  // キーは Symbol を使用することを推奨
  const CONTEXT_KEY = Symbol('app');
  setContext(CONTEXT_KEY, context);
</script>
```

```svelte
<!-- Child.svelte -->
<script lang="ts">
  import { getContext } from 'svelte';
  
  interface AppContext {
    user: {
      id: number;
      name: string;
    };
    theme: 'light' | 'dark';
    updateTheme: (theme: 'light' | 'dark') => void;
  }
  
  const CONTEXT_KEY = Symbol('app');
  const context = getContext<AppContext>(CONTEXT_KEY);
  
  // contextは型安全に使用できる
  console.log(context.user.name);
  context.updateTheme('dark');
</script>
```

## ストアの型定義

```svelte
<script lang="ts">
  import { writable, derived, type Writable, type Readable } from 'svelte/store';
  
  interface User {
    id: number;
    name: string;
    email: string;
  }
  
  // Writableストア
  const user: Writable<User | null> = writable(null);
  
  // Readableストア（derived）
  const userName: Readable<string> = derived(
    user,
    ($user) => $user?.name ?? 'Guest'
  );
  
  // カスタムストア
  function createCounter(initial = 0) {
    const { subscribe, set, update } = writable(initial);
    
    return {
      subscribe,
      increment: () => update(n => n + 1),
      decrement: () => update(n => n - 1),
      reset: () => set(initial)
    };
  }
  
  const counter = createCounter(10);
</script>

<!-- ストアの値を使用 -->
<p>User: {$userName}</p>
<button on:click={counter.increment}>
  Count: {$counter}
</button>
```

## 実践例：型安全なフォームコンポーネント

```svelte
<!-- UserForm.svelte -->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
  // フォームデータの型
  interface FormData {
    name: string;
    email: string;
    age: number;
    role: 'admin' | 'user' | 'guest';
  }
  
  // バリデーションエラーの型
  type FormErrors = Partial<Record<keyof FormData, string>>;
  
  // Props
  export let initialData: Partial<FormData> = {};
  export let onSubmit: ((data: FormData) => void) | undefined = undefined;
  
  // イベント
  interface Events {
    submit: FormData;
    cancel: null;
  }
  
  const dispatch = createEventDispatcher<Events>();
  
  // フォームの状態
  let formData: FormData = {
    name: initialData.name ?? '',
    email: initialData.email ?? '',
    age: initialData.age ?? 0,
    role: initialData.role ?? 'user'
  };
  
  let errors: FormErrors = {};
  
  // バリデーション
  function validate(): boolean {
    errors = {};
    
    if (!formData.name.trim()) {
      errors.name = '名前は必須です';
    }
    
    if (!formData.email.includes('@')) {
      errors.email = '有効なメールアドレスを入力してください';
    }
    
    if (formData.age < 0 || formData.age > 120) {
      errors.age = '年齢は0〜120の間で入力してください';
    }
    
    return Object.keys(errors).length === 0;
  }
  
  // 送信処理
  function handleSubmit(event: SubmitEvent): void {
    event.preventDefault();
    
    if (validate()) {
      onSubmit?.(formData);
      dispatch('submit', formData);
    }
  }
</script>

<form on:submit={handleSubmit}>
  <div>
    <label>
      名前:
      <input
        type="text"
        bind:value={formData.name}
        class:error={errors.name}
      />
    </label>
    {#if errors.name}
      <p class="error-message">{errors.name}</p>
    {/if}
  </div>
  
  <div>
    <label>
      メール:
      <input
        type="email"
        bind:value={formData.email}
        class:error={errors.email}
      />
    </label>
    {#if errors.email}
      <p class="error-message">{errors.email}</p>
    {/if}
  </div>
  
  <div>
    <label>
      年齢:
      <input
        type="number"
        bind:value={formData.age}
        class:error={errors.age}
      />
    </label>
    {#if errors.age}
      <p class="error-message">{errors.age}</p>
    {/if}
  </div>
  
  <div>
    <label>
      役割:
      <select bind:value={formData.role}>
        <option value="admin">管理者</option>
        <option value="user">ユーザー</option>
        <option value="guest">ゲスト</option>
      </select>
    </label>
  </div>
  
  <button type="submit">送信</button>
  <button type="button" on:click={() => dispatch('cancel', null)}>
    キャンセル
  </button>
</form>

<style>
  .error {
    border-color: red;
  }
  
  .error-message {
    color: red;
    font-size: 0.8rem;
  }
</style>
```

## まとめ

このページで学んだこと：

- SvelteコンポーネントでのTypeScript有効化
- Propsの型定義とインターフェース
- DOM/カスタムイベントの型安全な処理
- ジェネリック型を使った汎用コンポーネント
- 型ガードによる型の絞り込み
- コンテキストAPIとストアの型定義
- 実践的な型安全フォームの実装

## 次のステップ

[スクリプトコンテキスト](/svelte-basics/script-context/)では、`<script>`と`<script context="module">`の違いと使い分けを学びます。