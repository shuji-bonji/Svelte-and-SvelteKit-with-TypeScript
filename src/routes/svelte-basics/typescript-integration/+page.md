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

`svelte.config.js`でTypeScriptを有効化（通常は自動設定済み）

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

使用例として、ユーザーリストを表示するコンポーネントで型安全に利用

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

## Snippets（Svelte 5推奨）の型定義

Svelte 5では、従来の`<slot>`の代わりにSnippetsを使用することが推奨されています。Snippetsはより型安全で柔軟性があります。

### 基本的なSnippetの使用

```svelte
<!-- Card.svelte -->
<script lang="ts">
  import type { Snippet } from 'svelte';
  
  interface Props {
    title: string;
    header?: Snippet<[{ title: string }]>;
    children: Snippet;  // デフォルトスロットの代わり
    footer?: Snippet<[{ timestamp: Date }]>;
  }
  
  let { title, header, children, footer }: Props = $props();
</script>

<div class="card">
  {#if header}
    {@render header({ title })}
  {/if}
  
  {@render children()}
  
  {#if footer}
    {@render footer({ timestamp: new Date() })}
  {/if}
</div>
```

### Snippetを使用する親コンポーネント

```svelte
<!-- 親コンポーネント -->
<script lang="ts">
  import Card from './Card.svelte';
</script>

<Card title="サンプルカード">
  {#snippet header({ title })}
    <h2>{title}</h2>
  {/snippet}
  
  <!-- childrenはデフォルトコンテンツ -->
  <p>カードの本文内容</p>
  
  {#snippet footer({ timestamp })}
    <small>更新日時: {timestamp.toLocaleString()}</small>
  {/snippet}
</Card>
```

### 従来のスロット（後方互換性）

:::note[Svelte 5でのスロット]
Svelte 5でも`<slot>`は引き続きサポートされていますが、新しいプロジェクトではSnippetsの使用が推奨されます。既存のコードベースとの互換性のために残されています。
:::

```svelte
<!-- 従来のスロット方式（非推奨だが動作する） -->
<script lang="ts">
  export let title: string;
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

子コンポーネントでコンテキストを取得する場合

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

以下は、TypeScriptの型システムを活用した、完全に型安全なフォームコンポーネントの実装例です。実際に入力して動作を確認できます。

### TypeScript の型定義
```typescript
interface FormData {
  name: string;
  email: string;
  age: number;
  role: 'admin' | 'user' | 'guest';
}
```

このフォームは完全に型安全です。TypeScriptが各フィールドの型を検証し、IDEでの自動補完やエラー検出が可能です。

### ライブデモ

```svelte in live
<!-- UserForm.svelte -->
<script lang="ts">
  // フォームデータの型
  interface FormData {
    name: string;
    email: string;
    age: number;
    role: 'admin' | 'user' | 'guest';
  }
  
  // バリデーションエラーの型
  type FormErrors = Partial<Record<keyof FormData, string>>;
  
  // フォームの状態
  let formData: FormData = {
    name: '',
    email: '',
    age: 20,
    role: 'user'
  };
  
  let errors: FormErrors = {};
  let submitted = false;
  let submittedData: FormData | null = null;
  
  // バリデーション
  function validate(): boolean {
    errors = {};
    
    if (!formData.name.trim()) {
      errors.name = '名前は必須です';
    } else if (formData.name.length < 2) {
      errors.name = '名前は2文字以上で入力してください';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'メールアドレスは必須です';
    } else if (!formData.email.includes('@')) {
      errors.email = '有効なメールアドレスを入力してください';
    }
    
    if (formData.age < 0 || formData.age > 120) {
      errors.age = '年齢は0〜120の間で入力してください';
    }
    
    return Object.keys(errors).length === 0;
  }
  
  // リアルタイムバリデーション（名前フィールド）
  function validateName(): void {
    if (!formData.name.trim()) {
      errors.name = '名前は必須です';
    } else if (formData.name.length < 2) {
      errors.name = '名前は2文字以上で入力してください';
    } else {
      delete errors.name;
    }
    errors = errors; // リアクティビティのトリガー
  }
  
  // リアルタイムバリデーション（メールフィールド）
  function validateEmail(): void {
    if (!formData.email.trim()) {
      errors.email = 'メールアドレスは必須です';
    } else if (!formData.email.includes('@')) {
      errors.email = '有効なメールアドレスを入力してください';
    } else {
      delete errors.email;
    }
    errors = errors; // リアクティビティのトリガー
  }
  
  // 送信処理
  function handleSubmit(event: SubmitEvent): void {
    event.preventDefault();
    
    if (validate()) {
      submitted = true;
      submittedData = { ...formData };
      
      // 3秒後に成功メッセージを非表示にする
      setTimeout(() => {
        submitted = false;
      }, 3000);
    }
  }
  
  // リセット処理
  function handleReset(): void {
    formData = {
      name: '',
      email: '',
      age: 20,
      role: 'user'
    };
    errors = {};
    submitted = false;
    submittedData = null;
  }
</script>

<div class="demo-container">
  <h3>🎯 ライブデモ: 型安全なフォームコンポーネント</h3>
  
  <form on:submit={handleSubmit} novalidate>
    <div class="form-group">
      <label for="name">
        名前 <span class="required">*</span>
      </label>
      <input
        id="name"
        type="text"
        bind:value={formData.name}
        on:blur={validateName}
        class:error={errors.name}
        placeholder="山田太郎"
      />
      {#if errors.name}
        <p class="error-message">{errors.name}</p>
      {/if}
    </div>
    
    <div class="form-group">
      <label for="email">
        メールアドレス <span class="required">*</span>
      </label>
      <input
        id="email"
        type="email"
        bind:value={formData.email}
        on:blur={validateEmail}
        class:error={errors.email}
        placeholder="example@example.com"
      />
      {#if errors.email}
        <p class="error-message">{errors.email}</p>
      {/if}
    </div>
    
    <div class="form-group">
      <label for="age">
        年齢
      </label>
      <input
        id="age"
        type="number"
        bind:value={formData.age}
        class:error={errors.age}
        min="0"
        max="120"
      />
      {#if errors.age}
        <p class="error-message">{errors.age}</p>
      {/if}
    </div>
    
    <div class="form-group">
      <label for="role">
        役割
      </label>
      <select id="role" bind:value={formData.role}>
        <option value="admin">管理者</option>
        <option value="user">ユーザー</option>
        <option value="guest">ゲスト</option>
      </select>
    </div>
    
    <div class="button-group">
      <button type="submit" class="btn-primary">
        送信
      </button>
      <button type="button" class="btn-secondary" on:click={handleReset}>
        リセット
      </button>
    </div>
  </form>
  
  {#if submitted && submittedData}
    <div class="success-message">
      <h4>✅ フォームが正常に送信されました！</h4>
      <div class="submitted-data">
        <p><strong>送信されたデータ:</strong></p>
        <pre>{JSON.stringify(submittedData, null, 2)}</pre>
      </div>
    </div>
  {/if}
</div>

<style>
  .demo-container {
    padding: 1.5rem;
    background: var(--vp-c-bg-soft);
    border-radius: 8px;
    margin: 2rem 0;
  }
  
  h3 {
    margin-top: 0;
    margin-bottom: 1.5rem;
    color: var(--vp-c-text-1);
  }
  
  h4 {
    margin-top: 1.5rem;
    margin-bottom: 0.5rem;
    color: var(--vp-c-text-1);
  }
  
  .form-group {
    margin-bottom: 1.25rem;
  }
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: var(--vp-c-text-1);
  }
  
  .required {
    color: #dc2626;
  }
  
  input,
  select {
    width: 100%;
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--vp-c-divider);
    border-radius: 4px;
    background: var(--vp-c-bg);
    color: var(--vp-c-text-1);
    font-size: 0.95rem;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  
  input:focus,
  select:focus {
    outline: none;
    border-color: var(--vp-c-brand);
    box-shadow: 0 0 0 3px rgba(255, 62, 0, 0.1);
  }
  
  input.error {
    border-color: #dc2626;
  }
  
  input.error:focus {
    box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
  }
  
  .error-message {
    margin-top: 0.25rem;
    color: #dc2626;
    font-size: 0.875rem;
  }
  
  .button-group {
    display: flex;
    gap: 1rem;
    margin-top: 1.5rem;
  }
  
  button {
    padding: 0.5rem 1.5rem;
    border: none;
    border-radius: 4px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s, transform 0.1s;
  }
  
  button:active {
    transform: translateY(1px);
  }
  
  .btn-primary {
    background: var(--vp-c-brand);
    color: white;
  }
  
  .btn-primary:hover {
    background: var(--vp-c-brand-dark);
  }
  
  .btn-secondary {
    background: var(--vp-c-gray-soft);
    color: var(--vp-c-text-1);
  }
  
  .btn-secondary:hover {
    background: var(--vp-c-gray);
  }
  
  .success-message {
    margin-top: 1.5rem;
    padding: 1rem;
    background: #10b98114;
    border: 1px solid #10b981;
    border-radius: 4px;
    animation: slideIn 0.3s ease-out;
  }
  
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .submitted-data {
    margin-top: 1rem;
  }
  
  .submitted-data p {
    margin-bottom: 0.5rem;
    color: var(--vp-c-text-1);
  }
  
  pre {
    padding: 0.75rem;
    background: var(--vp-c-bg);
    border-radius: 4px;
    overflow-x: auto;
    font-size: 0.875rem;
    color: var(--vp-c-text-1);
  }
  
  .type-info {
    margin-top: 2rem;
    padding: 1rem;
    background: var(--vp-c-bg);
    border-radius: 4px;
    border: 1px solid var(--vp-c-divider);
  }
  
  .type-info code {
    color: var(--vp-c-text-code);
  }
  
  .note {
    margin-top: 0.75rem;
    font-size: 0.875rem;
    color: var(--vp-c-text-2);
    line-height: 1.6;
  }
  
  /* ダークモード対応 */
  :global(.dark) .demo-container {
    background: rgba(30, 30, 30, 0.5);
  }
  
  :global(.dark) input,
  :global(.dark) select {
    background: #1a1a1a;
  }
  
  :global(.dark) .type-info {
    background: #1a1a1a;
  }
  
  :global(.dark) pre {
    background: #0a0a0a;
  }
</style>
```


### 実装のポイント

このフォームコンポーネントは以下のTypeScript機能を活用しています：

1. **インターフェースによる型定義**
   - `FormData`インターフェースでフォームデータの構造を定義
   - リテラル型（`'admin' | 'user' | 'guest'`）による厳密な型制約

2. **型エイリアスの活用**
   - `FormErrors`型でバリデーションエラーの構造を定義
   - `Partial`と`Record`を組み合わせた柔軟な型定義

3. **イベントハンドラの型安全性**
   - `SubmitEvent`型による送信イベントの型定義
   - `MouseEvent`、`InputEvent`などDOM標準の型を活用

4. **リアルタイムバリデーション**
   - 各フィールドの`blur`イベントで個別バリデーション
   - 型安全性を保ちながら動的なエラー表示

### ソースコード

<details>
<summary>完全なソースコードを見る</summary>

```svelte
<!-- UserForm.svelte -->
<script lang="ts">
  // フォームデータの型
  interface FormData {
    name: string;
    email: string;
    age: number;
    role: 'admin' | 'user' | 'guest';
  }
  
  // バリデーションエラーの型
  type FormErrors = Partial<Record<keyof FormData, string>>;
  
  // フォームの状態
  let formData: FormData = {
    name: '',
    email: '',
    age: 20,
    role: 'user'
  };
  
  let errors: FormErrors = {};
  let submitted = false;
  let submittedData: FormData | null = null;
  
  // バリデーション
  function validate(): boolean {
    errors = {};
    
    if (!formData.name.trim()) {
      errors.name = '名前は必須です';
    } else if (formData.name.length < 2) {
      errors.name = '名前は2文字以上で入力してください';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'メールアドレスは必須です';
    } else if (!formData.email.includes('@')) {
      errors.email = '有効なメールアドレスを入力してください';
    }
    
    if (formData.age < 0 || formData.age > 120) {
      errors.age = '年齢は0〜120の間で入力してください';
    }
    
    return Object.keys(errors).length === 0;
  }
  
  // リアルタイムバリデーション（名前フィールド）
  function validateName(): void {
    if (!formData.name.trim()) {
      errors.name = '名前は必須です';
    } else if (formData.name.length < 2) {
      errors.name = '名前は2文字以上で入力してください';
    } else {
      delete errors.name;
    }
    errors = errors; // リアクティビティのトリガー
  }
  
  // 送信処理
  function handleSubmit(event: SubmitEvent): void {
    event.preventDefault();
    
    if (validate()) {
      submitted = true;
      submittedData = { ...formData };
      
      // 3秒後に成功メッセージを非表示
      setTimeout(() => {
        submitted = false;
      }, 3000);
    }
  }
</script>
```

</details>

### TypeScriptの利点

このフォーム実装により、以下のメリットが得られます：

- **コンパイル時の型チェック** - 型の不一致を事前に検出
- **IDEの自動補完** - プロパティ名やメソッド名を自動提案
- **リファクタリングの安全性** - 型定義の変更が自動的に波及
- **ドキュメントとしての型** - 型定義がAPIドキュメントの役割を果たす

## まとめ

このページで学んだこと

- SvelteコンポーネントでのTypeScript有効化
- Propsの型定義とインターフェース
- DOM/カスタムイベントの型安全な処理
- ジェネリック型を使った汎用コンポーネント
- 型ガードによる型の絞り込み
- コンテキストAPIとストアの型定義
- 実践的な型安全フォームの実装

## 次のステップ

[スクリプトコンテキスト](/svelte-basics/script-context/)では、`<script>`と`<script context="module">`の違いと使い分けを学びます。