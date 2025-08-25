---
title: コンポーネントパターン
description: Svelte 5でよく使われるコンポーネント設計パターンとTypeScriptによる実装
---

<script lang="ts">
  import Mermaid from '$lib/components/Mermaid.svelte';

  const PropsPattern = `
graph TD
    A[親コンポーネント] -->|props| B[Button.svelte]
    B --> C[variant: 'primary']
    B --> D[size: 'large']
    B --> E[children: Snippet]
    B --> F[...restProps]
    
    style A fill:#e0f2fe
    style B fill:#dbeafe
    style C fill:#f0f9ff
    style D fill:#f0f9ff
    style E fill:#f0f9ff
    style F fill:#f0f9ff
`;

  const SlotsPattern = `
graph TB
    A[Card.svelte] --> B[header: Snippet?]
    A --> C[children: Snippet]
    A --> D[footer: Snippet?]
    
    B --> E[card-header]
    C --> F[card-body]
    D --> G[card-footer]
    
    style A fill:#fef3c7
    style B fill:#fef9c3
    style C fill:#fef9c3
    style D fill:#fef9c3
    style E fill:#fffbeb
    style F fill:#fffbeb
    style G fill:#fffbeb
`;

  const BindablePattern = `
graph LR
    A[親コンポーネント] <-->|bind:value| B[TextInput.svelte]
    B --> C[$bindable value]
    C --> D[input要素]
    D -->|変更| C
    C -->|同期| A
    
    style A fill:#dcfce7
    style B fill:#ecfccb
    style C fill:#f7fee7
    style D fill:#fef9c3
`;

  const CompoundPattern = `
graph TD
    A[TabContainer] --> B[Context: TabContext]
    B --> C[TabList]
    B --> D[Tab]
    B --> E[TabPanel]
    
    C --> F[Tab 1]
    C --> G[Tab 2]
    C --> H[Tab 3]
    
    D --> I[activeTab状態]
    E --> J[条件付きレンダリング]
    
    style A fill:#ede9fe
    style B fill:#f3e8ff
    style C fill:#faf5ff
    style D fill:#faf5ff
    style E fill:#faf5ff
    style I fill:#fdf4ff
    style J fill:#fdf4ff
`;

  const SnippetPropsPattern = `
graph TD
    A[DataList.svelte] --> B[items: T配列]
    A --> C[renderItem: Snippet]
    
    B --> D[各アイテムをループ]
    D --> E[renderItem呼び出し]
    E --> F[カスタムレンダリング]
    
    C --> G[親が定義]
    G --> H[表示ロジック制御]
    
    style A fill:#fee2e2
    style B fill:#fecaca
    style C fill:#fecaca
    style D fill:#fef2f2
    style E fill:#fef2f2
    style F fill:#fff5f5
`;

  const HOCPattern = `
graph TD
    A[WithAuth.svelte] --> B{認証チェック}
    B -->|認証済み| C[children表示]
    B -->|未認証| D[fallback表示]
    
    A --> E[AuthContext設定]
    E --> F[user情報]
    E --> G[isAuthenticated]
    
    C --> H[保護されたコンテンツ]
    D --> I[ログイン画面]
    
    style A fill:#e0e7ff
    style B fill:#eef2ff
    style C fill:#f0f4ff
    style D fill:#f0f4ff
    style E fill:#f5f7ff
    style H fill:#fafbff
    style I fill:#fafbff
`;

  const EventPattern = `
graph TD
    A[SearchBox.svelte] --> B[createEventDispatcher]
    B --> C[search イベント]
    B --> D[clear イベント]
    
    C --> E[親: onsearch]
    D --> F[親: onclear]
    
    G[ユーザー入力] --> H[handleSearch]
    H --> C
    
    I[クリアボタン] --> J[handleClear]
    J --> D
    
    style A fill:#fef3c7
    style B fill:#fef9c3
    style C fill:#fffbeb
    style D fill:#fffbeb
    style E fill:#ecfccb
    style F fill:#ecfccb
`;
</script>

Svelte 5で実装する際の再利用可能なコンポーネントパターンを、TypeScriptの型定義と共に紹介します。React、Vue、Angularなどから移行してきた開発者にも理解しやすいよう、各パターンの用途と実装方法を詳しく解説します。

## 基本的なコンポーネントパターン

再利用可能で保守しやすいコンポーネントを作成するための基本的な設計パターンを紹介します。

### Propsパターン

コンポーネント間でデータを受け渡す最も基本的なパターンです。

<Mermaid diagram={PropsPattern} />

```typescript
<!-- Button.svelte -->
<script lang="ts">
  import type { HTMLButtonAttributes } from 'svelte/elements';
  
  type Props = HTMLButtonAttributes & {
    variant?: 'primary' | 'secondary' | 'danger';
    size?: 'small' | 'medium' | 'large';
  };
  
  let { 
    variant = 'primary',
    size = 'medium',
    children,
    ...restProps
  }: Props = $props();
  
  const classes = $derived(
    `btn btn-${variant} btn-${size}`
  );
</script>

<button class={classes} {...restProps}>
  {@render children?.()}
</button>

<style>
  .btn {
    padding: 0.5rem 1rem;
    border-radius: 0.25rem;
    border: none;
    cursor: pointer;
    font-size: 1rem;
  }
  
  .btn-primary {
    background-color: #3498db;
    color: white;
  }
  
  .btn-secondary {
    background-color: #95a5a6;
    color: white;
  }
  
  .btn-danger {
    background-color: #e74c3c;
    color: white;
  }
  
  .btn-small {
    font-size: 0.875rem;
    padding: 0.25rem 0.5rem;
  }
  
  .btn-large {
    font-size: 1.125rem;
    padding: 0.75rem 1.5rem;
  }
</style>
```

#### 使用例

```typescript
<!-- App.svelte -->
<script lang="ts">
  import Button from './Button.svelte';
  
  function handleClick() {
    console.log('クリックされました');
  }
</script>

<Button variant="primary" size="large" onclick={handleClick}>
  送信
</Button>

<Button variant="danger" disabled={true}>
  削除
</Button>
```

:::tip[型定義のポイント]
`HTMLButtonAttributes`を拡張することで、標準のHTML属性も全て受け取れるようになります。これにより、`onclick`、`disabled`、`aria-*`属性などを自然に使用できます。
:::

### Slots（スロット）パターン

コンポーネントの特定の部分に子要素を挿入するパターンです。

<Mermaid diagram={SlotsPattern} />

```typescript
<!-- Card.svelte -->
<script lang="ts">
  import type { Snippet } from 'svelte';
  
  type Props = {
    header?: Snippet;
    footer?: Snippet;
    children: Snippet;
  };
  
  let { header, footer, children }: Props = $props();
</script>

<div class="card">
  {#if header}
    <div class="card-header">
      {@render header()}
    </div>
  {/if}
  
  <div class="card-body">
    {@render children()}
  </div>
  
  {#if footer}
    <div class="card-footer">
      {@render footer()}
    </div>
  {/if}
</div>

<style>
  .card {
    border: 1px solid #ddd;
    border-radius: 8px;
    overflow: hidden;
    margin: 1rem 0;
  }
  
  .card-header {
    background-color: #f5f5f5;
    padding: 1rem;
    border-bottom: 1px solid #ddd;
  }
  
  .card-body {
    padding: 1rem;
  }
  
  .card-footer {
    background-color: #f5f5f5;
    padding: 1rem;
    border-top: 1px solid #ddd;
  }
</style>
```

#### 使用例

```typescript
<!-- App.svelte -->
<script lang="ts">
  import Card from './Card.svelte';
</script>

<Card>
  {#snippet header()}
    <h2>カードタイトル</h2>
  {/snippet}
  
  <p>これはカードの本文です。</p>
  <p>複数の要素を含むことができます。</p>
  
  {#snippet footer()}
    <button>アクション</button>
  {/snippet}
</Card>
```

## 双方向バインディングパターン

親子コンポーネント間でデータを双方向に同期させる実装パターンを解説します。

### Bindableプロパティ

親コンポーネントと子コンポーネント間で双方向にデータを同期するパターンです。

<Mermaid diagram={BindablePattern} />

```typescript
<!-- TextInput.svelte -->
<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements';
  
  type Props = Omit<HTMLInputAttributes, 'value' | 'type'> & {
    value: string;
    label?: string;
    error?: string;
  };
  
  let { 
    value = $bindable(''),
    label,
    error,
    ...restProps
  }: Props = $props();
  
  const hasError = $derived(!!error);
</script>

<div class="form-group">
  {#if label}
    <label for={restProps.id}>{label}</label>
  {/if}
  
  <input
    type="text"
    bind:value
    class:error={hasError}
    {...restProps}
  />
  
  {#if error}
    <span class="error-message">{error}</span>
  {/if}
</div>

<style>
  .form-group {
    margin-bottom: 1rem;
  }
  
  label {
    display: block;
    margin-bottom: 0.25rem;
    font-weight: 500;
  }
  
  input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
  }
  
  input.error {
    border-color: #e74c3c;
  }
  
  .error-message {
    color: #e74c3c;
    font-size: 0.875rem;
    margin-top: 0.25rem;
    display: block;
  }
</style>
```

#### 使用例

```typescript
<!-- App.svelte -->
<script lang="ts">
  import TextInput from './TextInput.svelte';
  
  let username = $state('');
  let email = $state('');
  
  const emailError = $derived(
    email && !email.includes('@') 
      ? '有効なメールアドレスを入力してください' 
      : ''
  );
</script>

<form>
  <TextInput 
    bind:value={username}
    label="ユーザー名"
    placeholder="ユーザー名を入力"
    id="username"
  />
  
  <TextInput 
    bind:value={email}
    label="メールアドレス"
    error={emailError}
    placeholder="example@email.com"
    id="email"
  />
  
  <p>入力値: {username} / {email}</p>
</form>
```

:::warning[bindableの使用時の注意]
`$bindable`を使用すると、親コンポーネントは`bind:`ディレクティブで値をバインドできるようになります。ただし、過度な使用は複雑性を増すため、本当に双方向バインディングが必要な場合のみ使用してください。
:::

## コンポジションパターン

複数のコンポーネントを組み合わせて、より複雑で柔軟なUIを構築する設計手法を紹介します。

### Compound Components（複合コンポーネント）

関連する複数のコンポーネントを組み合わせて、より複雑なUIを構築するパターンです。

<Mermaid diagram={CompoundPattern} />

```typescript
<!-- Tabs/TabContainer.svelte -->
<script lang="ts" context="module">
  import { setContext, getContext } from 'svelte';
  
  const TAB_CONTEXT_KEY = Symbol('tabs');
  
  export type TabContext = {
    activeTab: string;
    setActiveTab: (id: string) => void;
  };
  
  export function getTabContext(): TabContext {
    const context = getContext<TabContext>(TAB_CONTEXT_KEY);
    if (!context) {
      throw new Error('TabContext not found');
    }
    return context;
  }
</script>

<script lang="ts">
  import type { Snippet } from 'svelte';
  
  type Props = {
    activeTab?: string;
    children: Snippet;
  };
  
  let { activeTab: initialTab = '', children }: Props = $props();
  
  let activeTab = $state(initialTab);
  
  function setActiveTab(id: string) {
    activeTab = id;
  }
  
  setContext<TabContext>(TAB_CONTEXT_KEY, {
    get activeTab() { return activeTab; },
    setActiveTab
  });
</script>

<div class="tab-container">
  {@render children()}
</div>

<style>
  .tab-container {
    border: 1px solid #ddd;
    border-radius: 8px;
    overflow: hidden;
  }
</style>
```

```typescript
<!-- Tabs/TabList.svelte -->
<script lang="ts">
  import type { Snippet } from 'svelte';
  
  type Props = {
    children: Snippet;
  };
  
  let { children }: Props = $props();
</script>

<div class="tab-list" role="tablist">
  {@render children()}
</div>

<style>
  .tab-list {
    display: flex;
    background-color: #f5f5f5;
    border-bottom: 1px solid #ddd;
  }
</style>
```

```typescript
<!-- Tabs/Tab.svelte -->
<script lang="ts">
  import { getTabContext } from './TabContainer.svelte';
  import type { Snippet } from 'svelte';
  
  type Props = {
    id: string;
    children: Snippet;
  };
  
  let { id, children }: Props = $props();
  
  const context = getTabContext();
  const isActive = $derived(context.activeTab === id);
  
  function handleClick() {
    context.setActiveTab(id);
  }
</script>

<button
  class="tab"
  class:active={isActive}
  role="tab"
  aria-selected={isActive}
  onclick={handleClick}
>
  {@render children()}
</button>

<style>
  .tab {
    padding: 0.75rem 1.5rem;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1rem;
    transition: background-color 0.2s;
  }
  
  .tab:hover {
    background-color: #e8e8e8;
  }
  
  .tab.active {
    background-color: white;
    border-bottom: 2px solid #3498db;
  }
</style>
```

```typescript
<!-- Tabs/TabPanel.svelte -->
<script lang="ts">
  import { getTabContext } from './TabContainer.svelte';
  import type { Snippet } from 'svelte';
  
  type Props = {
    id: string;
    children: Snippet;
  };
  
  let { id, children }: Props = $props();
  
  const context = getTabContext();
  const isActive = $derived(context.activeTab === id);
</script>

{#if isActive}
  <div class="tab-panel" role="tabpanel">
    {@render children()}
  </div>
{/if}

<style>
  .tab-panel {
    padding: 1.5rem;
  }
</style>
```

#### 使用例

```typescript
<!-- App.svelte -->
<script lang="ts">
  import TabContainer from './Tabs/TabContainer.svelte';
  import TabList from './Tabs/TabList.svelte';
  import Tab from './Tabs/Tab.svelte';
  import TabPanel from './Tabs/TabPanel.svelte';
</script>

<TabContainer activeTab="tab1">
  <TabList>
    <Tab id="tab1">基本情報</Tab>
    <Tab id="tab2">詳細設定</Tab>
    <Tab id="tab3">セキュリティ</Tab>
  </TabList>
  
  <TabPanel id="tab1">
    <h3>基本情報</h3>
    <p>ユーザーの基本的な情報を設定します。</p>
  </TabPanel>
  
  <TabPanel id="tab2">
    <h3>詳細設定</h3>
    <p>アプリケーションの詳細な設定を行います。</p>
  </TabPanel>
  
  <TabPanel id="tab3">
    <h3>セキュリティ</h3>
    <p>セキュリティ関連の設定を管理します。</p>
  </TabPanel>
</TabContainer>
```

:::info[Compound Componentsの利点]
複合コンポーネントパターンを使用すると、複雑なUIコンポーネントを柔軟に組み立てることができます。各コンポーネントは独立していながら、コンテキストを通じて協調動作します。
:::

## レンダープロップパターン

コンポーネントの表示ロジックを外部から制御し、動的なレンダリングを実現するパターンです。

### Snippet Props

子コンポーネントに関数を渡して、レンダリングロジックを制御するパターンです。

<Mermaid diagram={SnippetPropsPattern} />

```typescript
<!-- DataList.svelte -->
<script lang="ts" generics="T">
  import type { Snippet } from 'svelte';
  
  type Props<T> = {
    items: T[];
    renderItem: Snippet<[T, number]>;
    emptyMessage?: string;
    loading?: boolean;
  };
  
  let { 
    items,
    renderItem,
    emptyMessage = 'データがありません',
    loading = false
  }: Props<T> = $props();
</script>

<div class="data-list">
  {#if loading}
    <div class="loading">読み込み中...</div>
  {:else if items.length === 0}
    <div class="empty">{emptyMessage}</div>
  {:else}
    <ul>
      {#each items as item, index}
        <li>
          {@render renderItem(item, index)}
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .data-list {
    padding: 1rem;
  }
  
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  
  li {
    padding: 0.5rem;
    border-bottom: 1px solid #eee;
  }
  
  li:last-child {
    border-bottom: none;
  }
  
  .loading, .empty {
    text-align: center;
    padding: 2rem;
    color: #666;
  }
</style>
```

#### 使用例

```typescript
<!-- App.svelte -->
<script lang="ts">
  import DataList from './DataList.svelte';
  
  type User = {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  
  let users = $state<User[]>([
    { id: 1, name: '田中太郎', email: 'tanaka@example.com', role: 'admin' },
    { id: 2, name: '佐藤花子', email: 'sato@example.com', role: 'user' },
    { id: 3, name: '鈴木一郎', email: 'suzuki@example.com', role: 'user' }
  ]);
  
  let loading = $state(false);
</script>

<DataList items={users} {loading}>
  {#snippet renderItem(user: User, index: number)}
    <div class="user-item">
      <span class="index">{index + 1}.</span>
      <strong>{user.name}</strong>
      <span class="email">{user.email}</span>
      <span class="role role-{user.role}">{user.role}</span>
    </div>
  {/snippet}
</DataList>

<style>
  .user-item {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .index {
    color: #999;
  }
  
  .email {
    color: #666;
    flex: 1;
  }
  
  .role {
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.875rem;
  }
  
  .role-admin {
    background-color: #e74c3c;
    color: white;
  }
  
  .role-user {
    background-color: #3498db;
    color: white;
  }
</style>
```

## HOC（Higher-Order Component）パターン

既存のコンポーネントを拡張し、共通の機能や振る舞いを追加する高階コンポーネントパターンです。

### コンポーネントラッパー

既存のコンポーネントに機能を追加するパターンです。

<Mermaid diagram={HOCPattern} />

```typescript
<!-- withAuth.svelte -->
<script lang="ts" context="module">
  export type AuthContext = {
    user: User | null;
    isAuthenticated: boolean;
  };
  
  export type User = {
    id: string;
    name: string;
    role: 'admin' | 'user';
  };
</script>

<script lang="ts">
  import type { Snippet } from 'svelte';
  import { setContext } from 'svelte';
  
  type Props = {
    user: User | null;
    fallback?: Snippet;
    children: Snippet;
  };
  
  let { user, fallback, children }: Props = $props();
  
  const isAuthenticated = $derived(!!user);
  
  setContext<AuthContext>('auth', {
    get user() { return user; },
    get isAuthenticated() { return isAuthenticated; }
  });
</script>

{#if isAuthenticated}
  {@render children()}
{:else if fallback}
  {@render fallback()}
{:else}
  <div class="auth-required">
    <p>このコンテンツを表示するにはログインが必要です。</p>
    <button>ログイン</button>
  </div>
{/if}

<style>
  .auth-required {
    text-align: center;
    padding: 2rem;
    background-color: #f5f5f5;
    border-radius: 8px;
  }
  
  button {
    margin-top: 1rem;
    padding: 0.5rem 1rem;
    background-color: #3498db;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
</style>
```

#### 使用例

```typescript
<!-- App.svelte -->
<script lang="ts">
  import WithAuth from './withAuth.svelte';
  import type { User } from './withAuth.svelte';
  
  let currentUser = $state<User | null>({
    id: '1',
    name: '田中太郎',
    role: 'admin'
  });
  
  function logout() {
    currentUser = null;
  }
</script>

<WithAuth user={currentUser}>
  <div class="dashboard">
    <h1>ダッシュボード</h1>
    <p>ようこそ、{currentUser?.name}さん！</p>
    <button onclick={logout}>ログアウト</button>
  </div>
  
  {#snippet fallback()}
    <div class="login-prompt">
      <h2>ログインが必要です</h2>
      <p>ダッシュボードにアクセスするにはログインしてください。</p>
    </div>
  {/snippet}
</WithAuth>
```

## カスタムイベントパターン

子コンポーネントから親コンポーネントへ、型安全にイベントを伝達する実装方法を解説します。

### イベントディスパッチ

コンポーネントからカスタムイベントを発火するパターンです。

<Mermaid diagram={EventPattern} />

```typescript
<!-- SearchBox.svelte -->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
  type SearchEvent = {
    search: { query: string };
    clear: void;
  };
  
  const dispatch = createEventDispatcher<SearchEvent>();
  
  let query = $state('');
  
  function handleSearch() {
    if (query.trim()) {
      dispatch('search', { query: query.trim() });
    }
  }
  
  function handleClear() {
    query = '';
    dispatch('clear');
  }
  
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      handleSearch();
    }
  }
</script>

<div class="search-box">
  <input
    type="text"
    bind:value={query}
    placeholder="検索..."
    onkeydown={handleKeydown}
  />
  
  <div class="buttons">
    <button onclick={handleSearch} disabled={!query.trim()}>
      検索
    </button>
    
    {#if query}
      <button onclick={handleClear} class="clear">
        クリア
      </button>
    {/if}
  </div>
</div>

<style>
  .search-box {
    display: flex;
    gap: 0.5rem;
    padding: 1rem;
    background-color: #f5f5f5;
    border-radius: 8px;
  }
  
  input {
    flex: 1;
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
  }
  
  .buttons {
    display: flex;
    gap: 0.5rem;
  }
  
  button {
    padding: 0.5rem 1rem;
    background-color: #3498db;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  button.clear {
    background-color: #95a5a6;
  }
</style>
```

#### 使用例

```typescript
<!-- App.svelte -->
<script lang="ts">
  import SearchBox from './SearchBox.svelte';
  
  let searchResults = $state<string[]>([]);
  let searching = $state(false);
  
  async function handleSearch(event: CustomEvent<{ query: string }>) {
    searching = true;
    const { query } = event.detail;
    
    // 実際のAPI呼び出しをシミュレート
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    searchResults = [
      `「${query}」の検索結果1`,
      `「${query}」の検索結果2`,
      `「${query}」の検索結果3`
    ];
    searching = false;
  }
  
  function handleClear() {
    searchResults = [];
  }
</script>

<SearchBox onsearch={handleSearch} onclear={handleClear} />

{#if searching}
  <p>検索中...</p>
{:else if searchResults.length > 0}
  <ul>
    {#each searchResults as result}
      <li>{result}</li>
    {/each}
  </ul>
{/if}
```

:::note[カスタムイベントとTypeScript]
`createEventDispatcher`にジェネリクス型を指定することで、イベント名とペイロードの型安全性を確保できます。
:::

## まとめ

Svelte 5のコンポーネントパターンは、TypeScriptと組み合わせることで型安全性を保ちながら、柔軟で再利用可能なコンポーネントを作成できます。

重要なポイント：

- **Props**: `$props()`を使用し、型定義を明確にする
- **Snippets**: `Snippet`型を使用して、レンダリング可能な要素を受け渡す
- **双方向バインディング**: `$bindable`を適切に使用する
- **コンテキスト**: `setContext`/`getContext`で親子間の情報共有
- **カスタムイベント**: `createEventDispatcher`で型安全なイベント発火

これらのパターンを適切に組み合わせることで、保守性が高く、拡張しやすいSvelteアプリケーションを構築できます。

## 次のステップ

[TypeScriptパターン](/advanced/typescript-patterns/)で、さらに高度なTypeScript統合パターンを学びましょう。