---
title: Snippets
description: Svelte 5の新機能 - コンポーネント内で再利用可能なマークアップ片
---

Svelte 5では、コンポーネント内で再利用可能なマークアップの断片を定義できる「Snippets」機能が導入されました。これにより、重複するマークアップを削減し、より保守性の高いコードを書くことができます。

## Snippetsとは

Snippetsは、コンポーネント内で定義される再利用可能なマークアップのブロックです。関数のように引数を受け取り、動的なコンテンツを生成できます。

### 主な特徴

Snippetsの重要な特徴を理解して、効果的に活用しましょう。

1. **コンポーネントスコープ** - 定義したコンポーネント内でのみ使用可能
2. **パラメータ対応** - 引数を受け取って動的なコンテンツを生成
3. **型安全** - TypeScriptによる完全な型推論
4. **パフォーマンス** - コンパイル時に最適化される
5. **スロットとの連携** - スロットにSnippetを渡すことも可能

:::tip[React/Vue経験者向け]
- ReactのRender Props やコンポーネント内の関数に似た概念
- Vueのscoped slotsと似ているが、より柔軟
- コンポーネントの外部からは直接アクセスできない
:::

## 基本的な使い方

### シンプルなSnippet

最も基本的なSnippetの定義と使用方法を見てみましょう。

```svelte
<script lang="ts">
  let items = $state(['Apple', 'Banana', 'Orange']);
</script>

<!-- Snippetの定義 -->
{#snippet listItem(item: string)}
  <li class="item">
    <span class="bullet">•</span>
    <span class="text">{item}</span>
  </li>
{/snippet}

<!-- Snippetの使用 -->
<ul>
  {#each items as item}
    {@render listItem(item)}
  {/each}
</ul>

<style>
  .item {
    display: flex;
    align-items: center;
    padding: 0.5rem;
  }
  
  .bullet {
    color: #ff3e00;
    margin-right: 0.5rem;
  }
</style>
```

### パラメータ付きSnippet

複数のパラメータを受け取るSnippetの例です。

```svelte
<script lang="ts">
  type User = {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'user' | 'guest';
  };
  
  let users = $state<User[]>([
    { id: 1, name: '田中太郎', email: 'tanaka@example.com', role: 'admin' },
    { id: 2, name: '鈴木花子', email: 'suzuki@example.com', role: 'user' },
    { id: 3, name: '佐藤次郎', email: 'sato@example.com', role: 'guest' }
  ]);
  
  let showEmail = $state(true);
</script>

<!-- 複数パラメータを受け取るSnippet -->
{#snippet userCard(user: User, index: number)}
  <div class="card" class:admin={user.role === 'admin'}>
    <h3>#{index + 1} {user.name}</h3>
    {#if showEmail}
      <p>{user.email}</p>
    {/if}
    <span class="badge badge-{user.role}">{user.role}</span>
  </div>
{/snippet}

<label>
  <input type="checkbox" bind:checked={showEmail} />
  メールアドレスを表示
</label>

<div class="user-list">
  {#each users as user, i}
    {@render userCard(user, i)}
  {/each}
</div>

<style>
  .card {
    border: 1px solid #ddd;
    padding: 1rem;
    margin: 0.5rem;
    border-radius: 8px;
  }
  
  .card.admin {
    border-color: #ff3e00;
    background: #fff5f5;
  }
  
  .badge {
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.875rem;
  }
  
  .badge-admin { background: #ff3e00; color: white; }
  .badge-user { background: #0066cc; color: white; }
  .badge-guest { background: #666; color: white; }
</style>
```

## 高度な使用パターン

### ネストされたSnippets

Snippetの中で別のSnippetを呼び出すことができます。

```svelte
<script lang="ts">
  type MenuItem = {
    label: string;
    icon?: string;
    children?: MenuItem[];
  };
  
  let menuItems = $state<MenuItem[]>([
    {
      label: 'ファイル',
      icon: '📁',
      children: [
        { label: '新規作成', icon: '📝' },
        { label: '開く', icon: '📂' },
        { label: '保存', icon: '💾' }
      ]
    },
    {
      label: '編集',
      icon: '✏️',
      children: [
        { label: 'コピー', icon: '📋' },
        { label: 'ペースト', icon: '📌' }
      ]
    }
  ]);
</script>

<!-- アイコン表示用のSnippet -->
{#snippet icon(iconText?: string)}
  {#if iconText}
    <span class="icon">{iconText}</span>
  {/if}
{/snippet}

<!-- メニューアイテム用のSnippet（再帰的） -->
{#snippet menuItem(item: MenuItem, level: number = 0)}
  <div class="menu-item" style="padding-left: {level * 20}px">
    {@render icon(item.icon)}
    <span>{item.label}</span>
  </div>
  
  {#if item.children}
    {#each item.children as child}
      {@render menuItem(child, level + 1)}
    {/each}
  {/if}
{/snippet}

<nav class="menu">
  {#each menuItems as item}
    {@render menuItem(item)}
  {/each}
</nav>

<style>
  .menu {
    background: #f5f5f5;
    padding: 1rem;
    border-radius: 8px;
  }
  
  .menu-item {
    padding: 0.5rem;
    cursor: pointer;
    transition: background 0.2s;
  }
  
  .menu-item:hover {
    background: rgba(0, 0, 0, 0.05);
  }
  
  .icon {
    margin-right: 0.5rem;
  }
</style>
```

### 条件付きレンダリング

Snippetと条件分岐を組み合わせた実装例です。

```svelte
<script lang="ts">
  type Status = 'pending' | 'success' | 'error' | 'warning';
  
  type Notification = {
    id: number;
    message: string;
    status: Status;
    timestamp: Date;
  };
  
  let notifications = $state<Notification[]>([
    { id: 1, message: '処理を開始しました', status: 'pending', timestamp: new Date() },
    { id: 2, message: '正常に完了しました', status: 'success', timestamp: new Date() },
    { id: 3, message: 'エラーが発生しました', status: 'error', timestamp: new Date() },
    { id: 4, message: '警告: メモリ使用量が高いです', status: 'warning', timestamp: new Date() }
  ]);
  
  function removeNotification(id: number) {
    notifications = notifications.filter(n => n.id !== id);
  }
</script>

<!-- ステータスアイコンのSnippet -->
{#snippet statusIcon(status: Status)}
  {#if status === 'pending'}
    <span class="icon">⏳</span>
  {:else if status === 'success'}
    <span class="icon">✅</span>
  {:else if status === 'error'}
    <span class="icon">❌</span>
  {:else if status === 'warning'}
    <span class="icon">⚠️</span>
  {/if}
{/snippet}

<!-- 通知アイテムのSnippet -->
{#snippet notificationItem(notification: Notification)}
  <div class="notification notification-{notification.status}">
    {@render statusIcon(notification.status)}
    <div class="content">
      <p class="message">{notification.message}</p>
      <time class="timestamp">
        {notification.timestamp.toLocaleTimeString()}
      </time>
    </div>
    <button 
      class="close-btn"
      onclick={() => removeNotification(notification.id)}
    >
      ×
    </button>
  </div>
{/snippet}

<div class="notifications">
  <h3>通知</h3>
  {#if notifications.length > 0}
    {#each notifications as notification}
      {@render notificationItem(notification)}
    {/each}
  {:else}
    <p class="empty">通知はありません</p>
  {/if}
</div>

<style>
  .notifications {
    max-width: 400px;
    padding: 1rem;
  }
  
  .notification {
    display: flex;
    align-items: center;
    padding: 0.75rem;
    margin: 0.5rem 0;
    border-radius: 8px;
    border-left: 4px solid;
  }
  
  .notification-pending {
    background: #fff3cd;
    border-color: #ffc107;
  }
  
  .notification-success {
    background: #d4edda;
    border-color: #28a745;
  }
  
  .notification-error {
    background: #f8d7da;
    border-color: #dc3545;
  }
  
  .notification-warning {
    background: #fff3cd;
    border-color: #ff9800;
  }
  
  .icon {
    font-size: 1.5rem;
    margin-right: 0.75rem;
  }
  
  .content {
    flex: 1;
  }
  
  .message {
    margin: 0;
    font-weight: 500;
  }
  
  .timestamp {
    font-size: 0.75rem;
    color: #666;
  }
  
  .close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #999;
    padding: 0 0.5rem;
  }
  
  .close-btn:hover {
    color: #333;
  }
  
  .empty {
    text-align: center;
    color: #999;
    padding: 2rem;
  }
</style>
```

## スロットとの連携

### スロットにSnippetを渡す

親コンポーネントから子コンポーネントにSnippetを渡すパターンです。

```svelte
<!-- Modal.svelte -->
<script lang="ts">
  import type { Snippet } from 'svelte';
  
  type Props = {
    open?: boolean;
    title?: string;
    children?: Snippet;
    footer?: Snippet;
  };
  
  let { 
    open = $bindable(false),
    title = 'モーダル',
    children,
    footer
  }: Props = $props();
</script>

{#if open}
  <div class="modal-backdrop" onclick={() => open = false}>
    <div class="modal" onclick={(e) => e.stopPropagation()}>
      <div class="modal-header">
        <h2>{title}</h2>
        <button class="close" onclick={() => open = false}>×</button>
      </div>
      
      <div class="modal-body">
        {#if children}
          {@render children()}
        {/if}
      </div>
      
      {#if footer}
        <div class="modal-footer">
          {@render footer()}
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }
  
  .modal {
    background: white;
    border-radius: 8px;
    max-width: 500px;
    width: 90%;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
  }
  
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid #ddd;
  }
  
  .modal-header h2 {
    margin: 0;
  }
  
  .close {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
  }
  
  .modal-body {
    padding: 1rem;
    overflow-y: auto;
    flex: 1;
  }
  
  .modal-footer {
    padding: 1rem;
    border-top: 1px solid #ddd;
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
  }
</style>
```

```svelte
<!-- 親コンポーネント -->
<script lang="ts">
  import Modal from './Modal.svelte';
  
  let showModal = $state(false);
  let formData = $state({
    name: '',
    email: ''
  });
  
  function handleSubmit() {
    console.log('Submitted:', formData);
    showModal = false;
  }
</script>

<button onclick={() => showModal = true}>
  モーダルを開く
</button>

<Modal bind:open={showModal} title="ユーザー登録">
  <!-- bodyのSnippet -->
  {#snippet children()}
    <form>
      <div class="form-group">
        <label for="name">名前</label>
        <input 
          id="name"
          type="text" 
          bind:value={formData.name}
          placeholder="名前を入力"
        />
      </div>
      
      <div class="form-group">
        <label for="email">メールアドレス</label>
        <input 
          id="email"
          type="email" 
          bind:value={formData.email}
          placeholder="email@example.com"
        />
      </div>
    </form>
  {/snippet}
  
  <!-- footerのSnippet -->
  {#snippet footer()}
    <button onclick={() => showModal = false}>
      キャンセル
    </button>
    <button onclick={handleSubmit} class="primary">
      登録
    </button>
  {/snippet}
</Modal>

<style>
  .form-group {
    margin-bottom: 1rem;
  }
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }
  
  input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  
  button {
    padding: 0.5rem 1rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    background: white;
    cursor: pointer;
  }
  
  button.primary {
    background: #ff3e00;
    color: white;
    border-color: #ff3e00;
  }
  
  button:hover {
    opacity: 0.9;
  }
</style>
```

## 実践的な使用例

### テーブルコンポーネント

カスタマイズ可能なテーブルコンポーネントの実装例です。

```svelte
<script lang="ts">
  type Column<T> = {
    key: keyof T;
    label: string;
    width?: string;
  };
  
  type Product = {
    id: number;
    name: string;
    price: number;
    stock: number;
    category: string;
  };
  
  let products = $state<Product[]>([
    { id: 1, name: 'ノートPC', price: 120000, stock: 5, category: 'Electronics' },
    { id: 2, name: 'マウス', price: 3000, stock: 50, category: 'Accessories' },
    { id: 3, name: 'キーボード', price: 8000, stock: 20, category: 'Accessories' },
    { id: 4, name: 'モニター', price: 45000, stock: 10, category: 'Electronics' }
  ]);
  
  let columns: Column<Product>[] = [
    { key: 'id', label: 'ID', width: '60px' },
    { key: 'name', label: '商品名' },
    { key: 'price', label: '価格', width: '120px' },
    { key: 'stock', label: '在庫', width: '80px' },
    { key: 'category', label: 'カテゴリ', width: '120px' }
  ];
  
  let sortKey = $state<keyof Product>('id');
  let sortOrder = $state<'asc' | 'desc'>('asc');
  
  let sortedProducts = $derived(() => {
    return [...products].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  });
  
  function handleSort(key: keyof Product) {
    if (sortKey === key) {
      sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      sortKey = key;
      sortOrder = 'asc';
    }
  }
</script>

<!-- ヘッダーセルのSnippet -->
{#snippet headerCell(column: Column<Product>)}
  <th 
    style="width: {column.width || 'auto'}"
    onclick={() => handleSort(column.key)}
    class="sortable"
  >
    <div class="header-content">
      {column.label}
      {#if sortKey === column.key}
        <span class="sort-indicator">
          {sortOrder === 'asc' ? '▲' : '▼'}
        </span>
      {/if}
    </div>
  </th>
{/snippet}

<!-- データセルのSnippet -->
{#snippet dataCell(product: Product, column: Column<Product>)}
  <td style="width: {column.width || 'auto'}">
    {#if column.key === 'price'}
      ¥{product[column.key].toLocaleString()}
    {:else if column.key === 'stock'}
      <span class:low-stock={product.stock < 10}>
        {product[column.key]}
      </span>
    {:else}
      {product[column.key]}
    {/if}
  </td>
{/snippet}

<!-- テーブル行のSnippet -->
{#snippet tableRow(product: Product)}
  <tr>
    {#each columns as column}
      {@render dataCell(product, column)}
    {/each}
  </tr>
{/snippet}

<div class="table-container">
  <table>
    <thead>
      <tr>
        {#each columns as column}
          {@render headerCell(column)}
        {/each}
      </tr>
    </thead>
    <tbody>
      {#each sortedProducts() as product}
        {@render tableRow(product)}
      {/each}
    </tbody>
  </table>
</div>

<style>
  .table-container {
    overflow-x: auto;
    border: 1px solid #ddd;
    border-radius: 8px;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
  }
  
  th, td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid #eee;
  }
  
  th {
    background: #f5f5f5;
    font-weight: 600;
  }
  
  th.sortable {
    cursor: pointer;
    user-select: none;
  }
  
  th.sortable:hover {
    background: #e8e8e8;
  }
  
  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .sort-indicator {
    color: #ff3e00;
    font-size: 0.75rem;
  }
  
  tr:hover {
    background: #f9f9f9;
  }
  
  .low-stock {
    color: #dc3545;
    font-weight: bold;
  }
</style>
```

## パフォーマンスの最適化

### メモ化されたSnippet

計算コストの高い処理を含むSnippetの最適化方法です。

```svelte
<script lang="ts">
  type DataPoint = {
    x: number;
    y: number;
    label: string;
  };
  
  let dataPoints = $state<DataPoint[]>([
    { x: 10, y: 20, label: 'A' },
    { x: 30, y: 45, label: 'B' },
    { x: 50, y: 30, label: 'C' },
    { x: 70, y: 60, label: 'D' },
    { x: 90, y: 40, label: 'E' }
  ]);
  
  let scale = $state(1);
  
  // 重い計算をメモ化
  let processedData = $derived(() => {
    console.log('データ処理中...');
    return dataPoints.map(point => ({
      ...point,
      scaledX: point.x * scale,
      scaledY: point.y * scale,
      distance: Math.sqrt(point.x ** 2 + point.y ** 2)
    }));
  });
</script>

<!-- 効率的なデータポイント表示 -->
{#snippet dataPointView(data: typeof processedData[0])}
  <div class="data-point">
    <strong>{data.label}</strong>
    <span>位置: ({data.scaledX}, {data.scaledY})</span>
    <span>距離: {data.distance.toFixed(2)}</span>
  </div>
{/snippet}

<div class="controls">
  <label>
    スケール: {scale}
    <input 
      type="range" 
      bind:value={scale}
      min="0.5"
      max="2"
      step="0.1"
    />
  </label>
</div>

<div class="data-points">
  {#each processedData() as data}
    {@render dataPointView(data)}
  {/each}
</div>

<style>
  .controls {
    margin-bottom: 1rem;
    padding: 1rem;
    background: #f5f5f5;
    border-radius: 8px;
  }
  
  label {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  input[type="range"] {
    flex: 1;
  }
  
  .data-points {
    display: grid;
    gap: 0.5rem;
  }
  
  .data-point {
    display: flex;
    justify-content: space-between;
    padding: 0.75rem;
    background: white;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  
  .data-point:hover {
    background: #f9f9f9;
  }
</style>
```

## TypeScriptとの統合

### 型安全なSnippets

TypeScriptを使用した型安全なSnippetの実装例です。

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';
  
  // カスタム型定義
  type ListItem<T> = {
    id: string | number;
    data: T;
  };
  
  type RenderItem<T> = Snippet<[item: ListItem<T>, index: number]>;
  
  // ジェネリックなリストコンポーネントの型
  type ListProps<T> = {
    items: ListItem<T>[];
    renderItem: RenderItem<T>;
    emptyMessage?: string;
  };
  
  // サンプルデータの型
  type Task = {
    title: string;
    completed: boolean;
    priority: 'low' | 'medium' | 'high';
  };
  
  let tasks = $state<ListItem<Task>[]>([
    { id: 1, data: { title: 'TypeScript学習', completed: false, priority: 'high' } },
    { id: 2, data: { title: 'Svelte 5習得', completed: true, priority: 'high' } },
    { id: 3, data: { title: 'プロジェクト作成', completed: false, priority: 'medium' } }
  ]);
  
  function toggleTask(id: string | number) {
    const task = tasks.find(t => t.id === id);
    if (task) {
      task.data.completed = !task.data.completed;
    }
  }
</script>

<!-- 型安全なタスクアイテムSnippet -->
{#snippet taskItem(item: ListItem<Task>, index: number)}
  <div class="task-item priority-{item.data.priority}">
    <input 
      type="checkbox" 
      checked={item.data.completed}
      onchange={() => toggleTask(item.id)}
    />
    <span class:completed={item.data.completed}>
      {index + 1}. {item.data.title}
    </span>
    <span class="priority-badge">
      {item.data.priority}
    </span>
  </div>
{/snippet}

<!-- 汎用リスト表示Snippet -->
{#snippet genericList(props: ListProps<Task>)}
  {#if props.items.length > 0}
    {#each props.items as item, i}
      {@render props.renderItem(item, i)}
    {/each}
  {:else}
    <p class="empty">{props.emptyMessage || 'アイテムがありません'}</p>
  {/if}
{/snippet}

<div class="task-list">
  <h3>タスクリスト</h3>
  {@render genericList({ 
    items: tasks, 
    renderItem: taskItem,
    emptyMessage: 'タスクがありません'
  })}
</div>

<style>
  .task-list {
    max-width: 500px;
    padding: 1rem;
  }
  
  .task-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    margin: 0.5rem 0;
    background: white;
    border-left: 4px solid;
    border-radius: 4px;
  }
  
  .task-item.priority-high {
    border-color: #dc3545;
  }
  
  .task-item.priority-medium {
    border-color: #ffc107;
  }
  
  .task-item.priority-low {
    border-color: #28a745;
  }
  
  .completed {
    text-decoration: line-through;
    opacity: 0.6;
  }
  
  .priority-badge {
    margin-left: auto;
    padding: 0.25rem 0.5rem;
    background: #f5f5f5;
    border-radius: 4px;
    font-size: 0.75rem;
    text-transform: uppercase;
  }
  
  .empty {
    text-align: center;
    color: #999;
    padding: 2rem;
  }
</style>
```

## ベストプラクティス

### Snippetsを使うべき場面

Snippetsが効果的な場面と使用上の注意点をまとめます。

<div class="best-practices">
  <div class="practice-card do">
    <div class="card-icon">✅</div>
    <h4>推奨される使用方法</h4>
    <ul>
      <li>
        <span class="list-title">同一コンポーネント内での重複削減</span>
        <span class="list-desc">似たマークアップが複数回現れる場合</span>
      </li>
      <li>
        <span class="list-title">条件付きレンダリング</span>
        <span class="list-desc">複雑な条件分岐を含むマークアップ</span>
      </li>
      <li>
        <span class="list-title">リスト項目のカスタマイズ</span>
        <span class="list-desc">each文の中で使用する複雑なアイテム</span>
      </li>
      <li>
        <span class="list-title">動的なスロットコンテンツ</span>
        <span class="list-desc">親から子へ渡すカスタムレンダリング</span>
      </li>
    </ul>
  </div>
  
  <div class="practice-card dont">
    <div class="card-icon">❌</div>
    <h4>避けるべき使用方法</h4>
    <ul>
      <li>
        <span class="list-title">単純なマークアップ</span>
        <span class="list-desc">1-2行程度の簡単なHTML</span>
      </li>
      <li>
        <span class="list-title">1回しか使わない</span>
        <span class="list-desc">再利用性がない場合は不要</span>
      </li>
      <li>
        <span class="list-title">別コンポーネントが適切</span>
        <span class="list-desc">独立性が高い場合</span>
      </li>
      <li>
        <span class="list-title">過度な抽象化</span>
        <span class="list-desc">読みやすさを損なう複雑化</span>
      </li>
    </ul>
  </div>
</div>

<style>
  .best-practices {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 1.5rem;
    margin: 2rem 0;
  }
  
  .practice-card {
    padding: 1.5rem;
    border-radius: 12px;
    border: 1px solid;
    background: white;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    transition: all 0.3s ease;
  }
  
  .practice-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  }
  
  .practice-card.do {
    border-color: #10b981;
    background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  }
  
  .practice-card.dont {
    border-color: #ef4444;
    background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  }
  
  .card-icon {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }
  
  .practice-card h4 {
    margin: 0 0 1rem 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: #1f2937;
  }
  
  .practice-card ul {
    margin: 0;
    padding: 0;
    list-style: none;
  }
  
  .practice-card li {
    margin: 0.75rem 0;
    padding-left: 1.5rem;
    position: relative;
  }
  
  .practice-card li::before {
    content: "•";
    position: absolute;
    left: 0;
    color: #6b7280;
    font-weight: bold;
  }
  
  .practice-card.do li::before {
    color: #10b981;
  }
  
  .practice-card.dont li::before {
    color: #ef4444;
  }
  
  .list-title {
    font-weight: 600;
    color: #1f2937;
    display: block;
  }
  
  .list-desc {
    color: #6b7280;
    font-size: 0.875rem;
    display: block;
    margin-top: 0.25rem;
  }
  
  /* ダークモード対応 */
  :global(.dark) .practice-card {
    background: #1f2937;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2);
  }
  
  :global(.dark) .practice-card:hover {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2);
  }
  
  :global(.dark) .practice-card.do {
    border-color: rgba(16, 185, 129, 0.5);
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%);
  }
  
  :global(.dark) .practice-card.dont {
    border-color: rgba(239, 68, 68, 0.5);
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%);
  }
  
  :global(.dark) .practice-card h4 {
    color: #f3f4f6;
  }
  
  :global(.dark) .list-title {
    color: #f3f4f6;
  }
  
  :global(.dark) .list-desc {
    color: #9ca3af;
  }
  
  :global(.dark) .practice-card li::before {
    color: #9ca3af;
  }
  
  :global(.dark) .practice-card.do li::before {
    color: #34d399;
  }
  
  :global(.dark) .practice-card.dont li::before {
    color: #f87171;
  }
  
  /* Tailwind風のレスポンシブ対応 */
  @media (max-width: 640px) {
    .best-practices {
      grid-template-columns: 1fr;
    }
  }
  
  @media (min-width: 1024px) {
    .best-practices {
      grid-template-columns: repeat(2, 1fr);
    }
  }
</style>

## まとめ

Snippetsは、Svelte 5で導入された強力な機能で、コンポーネント内のマークアップの再利用性を大幅に向上させます。

### 重要なポイント

Snippetsを効果的に活用するための要点をまとめます。

1. **コンポーネントスコープ** - Snippetsは定義されたコンポーネント内でのみ有効
2. **パラメータ対応** - 引数を通じて動的なコンテンツ生成が可能
3. **型安全性** - TypeScriptとの完全な統合による型チェック
4. **パフォーマンス** - コンパイル時の最適化により高速
5. **可読性向上** - 重複コードの削減とロジックの整理

### 次のステップ

- [コンポーネントパターン](/advanced/component-patterns/)でより高度な実装パターンを学ぶ
- [TypeScriptパターン](/advanced/typescript-patterns/)で型安全な実装を深める
- [リアクティブストア](/advanced/reactive-stores/)と組み合わせた状態管理

:::info[関連リソース]
- [Svelte 5公式ドキュメント - Snippets](https://svelte.dev/docs/svelte/snippet)
- [RFC: Snippets](https://github.com/sveltejs/rfcs/pull/68)
:::