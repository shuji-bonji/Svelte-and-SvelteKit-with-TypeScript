---
title: 状態管理パターン
description: SvelteKitアプリケーションにおける効果的な状態管理パターン
---

SvelteKitアプリケーションで使用できる様々な状態管理パターンとベストプラクティスを解説します。小規模から大規模まで、アプリケーションの規模に応じた最適な手法を選択できます。

## 状態管理の階層

### 状態の種類と管理方法

| 状態の種類 | スコープ | 管理方法 | 使用例 |
|-----------|---------|----------|--------|
| ローカル状態 | コンポーネント | `$state` | フォーム入力、UIトグル |
| 共有状態 | 複数コンポーネント | Context API、Props | モーダル、タブ |
| グローバル状態 | アプリ全体 | Stores、`.svelte.ts` | ユーザー認証、テーマ |
| サーバー状態 | サーバー/クライアント | Load関数、Actions | データベースのデータ |
| URL状態 | ブラウザ | Query params、Hash | フィルター、ページネーション |

## Svelte 5の新しい状態管理

### .svelte.tsファイルによるストア

```typescript
// src/lib/stores/cart.svelte.ts
export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

class CartStore {
  private items = $state<CartItem[]>([]);
  
  get totalItems() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }
  
  get totalPrice() {
    return this.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  }
  
  get cartItems() {
    return this.items;
  }
  
  addItem(item: Omit<CartItem, 'quantity'>) {
    const existing = this.items.find(i => i.id === item.id);
    
    if (existing) {
      existing.quantity++;
    } else {
      this.items.push({ ...item, quantity: 1 });
    }
  }
  
  removeItem(id: string) {
    const index = this.items.findIndex(item => item.id === id);
    if (index !== -1) {
      this.items.splice(index, 1);
    }
  }
  
  updateQuantity(id: string, quantity: number) {
    const item = this.items.find(i => i.id === id);
    if (item) {
      if (quantity <= 0) {
        this.removeItem(id);
      } else {
        item.quantity = quantity;
      }
    }
  }
  
  clear() {
    this.items = [];
  }
}

export const cart = new CartStore();
```

### 使用例

```svelte
<script lang="ts">
  import { cart } from '$lib/stores/cart.svelte';
  
  function addToCart() {
    cart.addItem({
      id: '1',
      name: 'TypeScript Book',
      price: 2980
    });
  }
</script>

<div class="cart-summary">
  <span>アイテム数: {cart.totalItems}</span>
  <span>合計: ¥{cart.totalPrice.toLocaleString()}</span>
</div>

<ul class="cart-items">
  {#each cart.cartItems as item}
    <li>
      {item.name} x {item.quantity}
      <button onclick={() => cart.updateQuantity(item.id, item.quantity + 1)}>
        +
      </button>
      <button onclick={() => cart.updateQuantity(item.id, item.quantity - 1)}>
        -
      </button>
      <button onclick={() => cart.removeItem(item.id)}>
        削除
      </button>
    </li>
  {/each}
</ul>
```

## Context APIパターン

### 親子間での状態共有

```typescript
// src/lib/contexts/theme.ts
import { getContext, setContext } from 'svelte';

const THEME_KEY = Symbol('theme');

export type Theme = 'light' | 'dark' | 'system';

export type ThemeContext = {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
};

export function setThemeContext(context: ThemeContext) {
  setContext(THEME_KEY, context);
}

export function getThemeContext(): ThemeContext {
  const context = getContext<ThemeContext>(THEME_KEY);
  if (!context) {
    throw new Error('Theme context not found');
  }
  return context;
}
```

### Context Provider実装

```svelte
<!-- ThemeProvider.svelte -->
<script lang="ts">
  import { setThemeContext, type Theme } from '$lib/contexts/theme';
  
  let theme = $state<Theme>('system');
  
  const toggleTheme = () => {
    theme = theme === 'light' ? 'dark' : 'light';
  };
  
  const setTheme = (newTheme: Theme) => {
    theme = newTheme;
  };
  
  $effect(() => {
    // テーマ変更時の処理
    document.documentElement.setAttribute('data-theme', theme);
  });
  
  setThemeContext({
    get theme() { return theme; },
    toggleTheme,
    setTheme
  });
  
  import type { Snippet } from 'svelte';
  let { children }: { children?: Snippet } = $props();
</script>

{@render children?.()}
```

## 複雑な状態管理パターン

### Command Pattern実装

```typescript
// src/lib/stores/editor.svelte.ts
interface Command {
  execute(): void;
  undo(): void;
}

class InsertTextCommand implements Command {
  constructor(
    private editor: EditorStore,
    private position: number,
    private text: string
  ) {}
  
  execute() {
    this.editor.insertText(this.position, this.text);
  }
  
  undo() {
    this.editor.deleteText(this.position, this.text.length);
  }
}

class EditorStore {
  private content = $state('');
  private history: Command[] = [];
  private historyIndex = -1;
  
  get text() {
    return this.content;
  }
  
  insertText(position: number, text: string) {
    this.content = 
      this.content.slice(0, position) + 
      text + 
      this.content.slice(position);
  }
  
  deleteText(position: number, length: number) {
    this.content = 
      this.content.slice(0, position) + 
      this.content.slice(position + length);
  }
  
  executeCommand(command: Command) {
    // 現在位置より後の履歴を削除
    this.history = this.history.slice(0, this.historyIndex + 1);
    
    command.execute();
    this.history.push(command);
    this.historyIndex++;
  }
  
  undo() {
    if (this.historyIndex >= 0) {
      this.history[this.historyIndex].undo();
      this.historyIndex--;
    }
  }
  
  redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.history[this.historyIndex].execute();
    }
  }
}

export const editor = new EditorStore();
```

### State Machine Pattern

```typescript
// src/lib/stores/auth-machine.svelte.ts
type AuthState = 
  | 'idle'
  | 'loading'
  | 'authenticated'
  | 'unauthenticated'
  | 'error';

type AuthEvent =
  | { type: 'LOGIN' }
  | { type: 'LOGIN_SUCCESS'; user: User }
  | { type: 'LOGIN_FAILURE'; error: string }
  | { type: 'LOGOUT' }
  | { type: 'LOGOUT_SUCCESS' };

class AuthMachine {
  private state = $state<AuthState>('idle');
  private user = $state<User | null>(null);
  private error = $state<string | null>(null);
  
  get currentState() { return this.state; }
  get currentUser() { return this.user; }
  get currentError() { return this.error; }
  
  transition(event: AuthEvent) {
    switch (this.state) {
      case 'idle':
      case 'unauthenticated':
        if (event.type === 'LOGIN') {
          this.state = 'loading';
          this.performLogin();
        }
        break;
        
      case 'loading':
        if (event.type === 'LOGIN_SUCCESS') {
          this.state = 'authenticated';
          this.user = event.user;
          this.error = null;
        } else if (event.type === 'LOGIN_FAILURE') {
          this.state = 'error';
          this.error = event.error;
        }
        break;
        
      case 'authenticated':
        if (event.type === 'LOGOUT') {
          this.performLogout();
        }
        break;
        
      case 'error':
        if (event.type === 'LOGIN') {
          this.state = 'loading';
          this.error = null;
          this.performLogin();
        }
        break;
    }
  }
  
  private async performLogin() {
    try {
      const user = await api.login();
      this.transition({ type: 'LOGIN_SUCCESS', user });
    } catch (error) {
      this.transition({ 
        type: 'LOGIN_FAILURE', 
        error: error.message 
      });
    }
  }
  
  private async performLogout() {
    await api.logout();
    this.state = 'unauthenticated';
    this.user = null;
  }
}

export const authMachine = new AuthMachine();
```

## サーバー状態の管理

### TanStack Query統合

```typescript
// src/lib/queries/posts.ts
import { createQuery, createMutation } from '@tanstack/svelte-query';

export function usePostsQuery(page: number = 1) {
  return createQuery({
    queryKey: ['posts', page],
    queryFn: async () => {
      const response = await fetch(`/api/posts?page=${page}`);
      if (!response.ok) throw new Error('Failed to fetch posts');
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5分
    gcTime: 10 * 60 * 1000    // 10分
  });
}

export function useCreatePostMutation() {
  const queryClient = useQueryClient();
  
  return createMutation({
    mutationFn: async (newPost: NewPost) => {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPost)
      });
      if (!response.ok) throw new Error('Failed to create post');
      return response.json();
    },
    onSuccess: () => {
      // キャッシュを無効化
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    }
  });
}
```

### 使用例

```svelte
<script lang="ts">
  import { usePostsQuery, useCreatePostMutation } from '$lib/queries/posts';
  
  let page = $state(1);
  const postsQuery = usePostsQuery(page);
  const createMutation = useCreatePostMutation();
  
  async function handleSubmit(event: Event) {
    const formData = new FormData(event.target as HTMLFormElement);
    
    await createMutation.mutateAsync({
      title: formData.get('title') as string,
      content: formData.get('content') as string
    });
  }
</script>

{#if $postsQuery.isLoading}
  <div>読み込み中...</div>
{:else if $postsQuery.error}
  <div>エラー: {$postsQuery.error.message}</div>
{:else if $postsQuery.data}
  <ul>
    {#each $postsQuery.data.posts as post}
      <li>{post.title}</li>
    {/each}
  </ul>
{/if}
```

## URL状態管理

### Query Parametersの活用

```typescript
// src/lib/stores/filters.svelte.ts
import { page } from '$app/stores';
import { goto } from '$app/navigation';

class FilterStore {
  private filters = $state<Record<string, string>>({});
  
  constructor() {
    // URLから初期値を取得
    $effect(() => {
      const params = new URLSearchParams($page.url.search);
      this.filters = Object.fromEntries(params);
    });
  }
  
  get activeFilters() {
    return this.filters;
  }
  
  setFilter(key: string, value: string) {
    this.filters[key] = value;
    this.updateURL();
  }
  
  removeFilter(key: string) {
    delete this.filters[key];
    this.updateURL();
  }
  
  clearFilters() {
    this.filters = {};
    this.updateURL();
  }
  
  private updateURL() {
    const params = new URLSearchParams(this.filters);
    goto(`?${params.toString()}`, { 
      keepFocus: true,
      replaceState: true 
    });
  }
}

export const filterStore = new FilterStore();
```

## パフォーマンス最適化

### メモ化と最適化

```typescript
// src/lib/stores/optimized.svelte.ts
class OptimizedStore {
  private items = $state<Item[]>([]);
  private searchTerm = $state('');
  private sortBy = $state<'name' | 'price'>('name');
  
  // 重い計算をメモ化
  private filteredCache = new Map<string, Item[]>();
  
  get filteredItems() {
    const cacheKey = `${this.searchTerm}-${this.sortBy}`;
    
    if (this.filteredCache.has(cacheKey)) {
      return this.filteredCache.get(cacheKey)!;
    }
    
    const filtered = this.items
      .filter(item => 
        item.name.toLowerCase().includes(this.searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        if (this.sortBy === 'name') {
          return a.name.localeCompare(b.name);
        }
        return a.price - b.price;
      });
    
    this.filteredCache.set(cacheKey, filtered);
    
    // キャッシュサイズ制限
    if (this.filteredCache.size > 10) {
      const firstKey = this.filteredCache.keys().next().value;
      this.filteredCache.delete(firstKey);
    }
    
    return filtered;
  }
  
  updateSearchTerm(term: string) {
    this.searchTerm = term;
    // 検索語が変わったらキャッシュをクリア
    this.filteredCache.clear();
  }
}
```

## テスト戦略

### ストアのテスト

```typescript
// src/lib/stores/cart.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { cart } from './cart.svelte';

describe('CartStore', () => {
  beforeEach(() => {
    cart.clear();
  });
  
  it('アイテムを追加できる', () => {
    cart.addItem({ id: '1', name: 'Item 1', price: 100 });
    
    expect(cart.totalItems).toBe(1);
    expect(cart.totalPrice).toBe(100);
  });
  
  it('同じアイテムの数量が増える', () => {
    cart.addItem({ id: '1', name: 'Item 1', price: 100 });
    cart.addItem({ id: '1', name: 'Item 1', price: 100 });
    
    expect(cart.totalItems).toBe(2);
    expect(cart.cartItems[0].quantity).toBe(2);
  });
});
```

## まとめ

SvelteKitの状態管理は、アプリケーションの規模と複雑さに応じて選択すべきです。小規模なアプリケーションではSvelte 5の`$state`と`.svelte.ts`ファイルで十分ですが、大規模なアプリケーションでは状態マシンやコマンドパターンなどの高度なパターンが有効です。重要なのは、適切な抽象化レベルを保ちながら、保守性とパフォーマンスのバランスを取ることです。