---
title: "@renderディレクティブとSnippetオブジェクト、#snippetディレクティブ"
description: 
---

## Snippetとは何か

Svelte 5で導入された**Snippet**は、コンポーネント内で再利用可能なマークアップのブロックを定義する機能です。Angularの`ng-template`に似ていますが、より直感的で柔軟な実装となっています。

## 基本的な仕組み

### 1. #snippetディレクティブ

`{#snippet}`でマークアップのテンプレートを定義します：

```svelte
<!-- 基本的なsnippetの定義 -->
{#snippet greeting()}
  <p>こんにちは！</p>
{/snippet}

<!-- パラメータ付きsnippet -->
{#snippet userCard(name: string, age: number)}
  <div class="card">
    <h3>{name}</h3>
    <p>年齢: {age}歳</p>
  </div>
{/snippet}
```

### 2. @renderディレクティブ

`{@render}`でsnippetを呼び出します：

```svelte
<!-- snippetの呼び出し -->
{@render greeting()}
{@render userCard("太郎", 30)}
```

## TypeScriptでの完全な例

### 基本的なSnippetの使用

```svelte
<script lang="ts">
  interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'user' | 'guest';
  }

  let users = $state<User[]>([
    { id: 1, name: '山田太郎', email: 'yamada@example.com', role: 'admin' },
    { id: 2, name: '鈴木花子', email: 'suzuki@example.com', role: 'user' },
    { id: 3, name: '佐藤次郎', email: 'sato@example.com', role: 'guest' }
  ]);

  let selectedUser = $state<User | null>(null);
</script>

<!-- roleに応じたバッジを表示するsnippet -->
{#snippet roleBadge(role: User['role'])}
  <span class="badge badge-{role}">
    {#if role === 'admin'}
      👑 管理者
    {:else if role === 'user'}
      👤 ユーザー
    {:else}
      👥 ゲスト
    {/if}
  </span>
{/snippet}

<!-- ユーザーカードのsnippet -->
{#snippet userCard(user: User, detailed: boolean = false)}
  <div class="user-card" class:detailed>
    <h3>{user.name}</h3>
    {@render roleBadge(user.role)}
    
    {#if detailed}
      <p>📧 {user.email}</p>
      <p>ID: {user.id}</p>
    {/if}
    
    <button onclick={() => selectedUser = user}>
      詳細を見る
    </button>
  </div>
{/snippet}

<!-- メインのUI -->
<div class="container">
  <h1>ユーザー一覧</h1>
  
  <div class="user-list">
    {#each users as user}
      {@render userCard(user, false)}
    {/each}
  </div>
  
  {#if selectedUser}
    <div class="selected-user">
      <h2>選択されたユーザー</h2>
      {@render userCard(selectedUser, true)}
    </div>
  {/if}
</div>
```

### Snippetを引数として渡す

Snippetは**第一級オブジェクト**として扱えるため、変数に代入したり、引数として渡すことができます：

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';
  
  interface ListProps<T> {
    items: T[];
    renderItem: Snippet<[T, number]>; // Tとindexを受け取るSnippet
    emptyMessage?: Snippet;
  }
  
  // ジェネリックなリストコンポーネント
  class GenericList<T> {
    items = $state<T[]>([]);
    
    constructor(initialItems: T[]) {
      this.items = initialItems;
    }
  }
  
  interface Product {
    id: number;
    name: string;
    price: number;
    inStock: boolean;
  }
  
  const products = new GenericList<Product>([
    { id: 1, name: 'ノートPC', price: 120000, inStock: true },
    { id: 2, name: 'マウス', price: 3000, inStock: false },
    { id: 3, name: 'キーボード', price: 8000, inStock: true }
  ]);
</script>

<!-- 商品アイテムの表示用snippet -->
{#snippet productItem(product: Product, index: number)}
  <div class="product-item">
    <span class="index">{index + 1}.</span>
    <h4>{product.name}</h4>
    <p class="price">¥{product.price.toLocaleString()}</p>
    {#if product.inStock}
      <span class="in-stock">✅ 在庫あり</span>
    {:else}
      <span class="out-of-stock">❌ 在庫なし</span>
    {/if}
  </div>
{/snippet}

<!-- 空のメッセージ用snippet -->
{#snippet emptyProducts()}
  <div class="empty">
    <p>🛒 商品がありません</p>
  </div>
{/snippet}

<!-- 汎用リストコンポーネントの使用 -->
<div class="products">
  <h2>商品一覧</h2>
  
  {#if products.items.length > 0}
    {#each products.items as item, i}
      {@render productItem(item, i)}
    {/each}
  {:else}
    {@render emptyProducts()}
  {/if}
</div>
```

### コンポーネント間でのSnippet共有

```svelte
<!-- Modal.svelte -->
<script lang="ts">
  import type { Snippet } from 'svelte';
  
  interface Props {
    isOpen: boolean;
    title: string;
    header?: Snippet;
    children: Snippet;  // デフォルトスロット
    footer?: Snippet;
  }
  
  let { isOpen, title, header, children, footer }: Props = $props();
</script>

{#if isOpen}
  <div class="modal-backdrop">
    <div class="modal">
      <div class="modal-header">
        {#if header}
          {@render header()}
        {:else}
          <h2>{title}</h2>
        {/if}
      </div>
      
      <div class="modal-body">
        {@render children()}
      </div>
      
      {#if footer}
        <div class="modal-footer">
          {@render footer()}
        </div>
      {/if}
    </div>
  </div>
{/if}
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
</script>

{#snippet modalHeader()}
  <div class="custom-header">
    <h2>👤 ユーザー登録</h2>
    <button onclick={() => showModal = false}>✕</button>
  </div>
{/snippet}

{#snippet modalFooter()}
  <button class="btn-primary" onclick={() => console.log(formData)}>
    登録
  </button>
  <button class="btn-secondary" onclick={() => showModal = false}>
    キャンセル
  </button>
{/snippet}

<Modal isOpen={showModal} title="ユーザー登録" {header: modalHeader} {footer: modalFooter}>
  <form>
    <label>
      名前:
      <input bind:value={formData.name} type="text" />
    </label>
    <label>
      メール:
      <input bind:value={formData.email} type="email" />
    </label>
  </form>
</Modal>
```

## 高度な使用例：条件付きレンダリング

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';
  
  type LoadingState<T> = 
    | { status: 'idle' }
    | { status: 'loading' }
    | { status: 'success'; data: T }
    | { status: 'error'; error: Error };
  
  interface AsyncData<T> {
    state: LoadingState<T>;
    idle?: Snippet;
    loading?: Snippet;
    success: Snippet<[T]>;
    error?: Snippet<[Error]>;
  }
  
  // APIからデータを取得
  let userState = $state<LoadingState<User>>({ status: 'loading' });
  
  onMount(async () => {
    try {
      const response = await fetch('/api/user');
      const data = await response.json();
      userState = { status: 'success', data };
    } catch (e) {
      userState = { status: 'error', error: e as Error };
    }
  });
</script>

<!-- 各状態のsnippet定義 -->
{#snippet loadingView()}
  <div class="loading">
    <div class="spinner"></div>
    <p>読み込み中...</p>
  </div>
{/snippet}

{#snippet userView(user: User)}
  <div class="user-profile">
    <h1>{user.name}</h1>
    <p>{user.email}</p>
    {@render roleBadge(user.role)}
  </div>
{/snippet}

{#snippet errorView(error: Error)}
  <div class="error">
    <h2>❌ エラーが発生しました</h2>
    <p>{error.message}</p>
    <button onclick={() => location.reload()}>
      再読み込み
    </button>
  </div>
{/snippet}

<!-- 状態に応じた表示 -->
{#if userState.status === 'loading'}
  {@render loadingView()}
{:else if userState.status === 'success'}
  {@render userView(userState.data)}
{:else if userState.status === 'error'}
  {@render errorView(userState.error)}
{/if}
```

## AngularのTemplateRefとの比較

### Angular（ng-template）
```typescript
@Component({
  template: `
    <ng-template #userCard let-user="user">
      <div class="card">{{ user.name }}</div>
    </ng-template>
    
    <ng-container *ngTemplateOutlet="userCard; context: { user: currentUser }">
    </ng-container>
  `
})
```

### Svelte（snippet）
```svelte
{#snippet userCard(user)}
  <div class="card">{user.name}</div>
{/snippet}

{@render userCard(currentUser)}
```

## まとめ

Svelte 5のSnippetシステムは：

1. **型安全**: TypeScriptとの完全な統合
2. **シンプル**: 直感的な構文
3. **柔軟**: 第一級オブジェクトとして扱える
4. **パフォーマンス**: コンパイル時に最適化

Angularの`ng-template`に慣れている開発者にとって、Snippetはより簡潔で表現力豊かな選択肢となるでしょう。特に、型推論が効き、引数の受け渡しが自然に書ける点は大きな利点です。