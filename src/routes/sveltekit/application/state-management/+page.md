---
title: 状態管理パターン
description: SvelteKitアプリケーションにおける効果的な状態管理パターン
---

SvelteKitアプリケーションで使用できる様々な状態管理パターンとベストプラクティスを解説します。小規模から大規模まで、アプリケーションの規模に応じた最適な手法を選択できます。

## 状態管理の階層

状態管理はアプリケーションの複雑さを制御する重要な要素です。SvelteKitでは、状態のスコープと永続性に応じて、適切な管理方法を選択することが重要です。以下の表は、各種状態の特性と最適な管理手法をまとめたものです。

### 状態の種類と管理方法

| 状態の種類 | スコープ | 管理方法 | 使用例 |
|-----------|---------|----------|--------|
| ローカル状態 | コンポーネント | `$state` | フォーム入力、UIトグル |
| 共有状態 | 複数コンポーネント | Context API、Props | モーダル、タブ |
| グローバル状態 | アプリ全体 | Stores、`.svelte.ts` | ユーザー認証、テーマ |
| サーバー状態 | サーバー/クライアント | Load関数、Actions | データベースのデータ |
| URL状態 | ブラウザ | Query params、Hash | フィルター、ページネーション |

## Svelte 5の新しい状態管理

Svelte 5では、`.svelte.ts`ファイルを使用した新しい状態管理パターンが導入されました。このパターンは、TypeScriptのクラスとSvelteのリアクティビティを組み合わせることで、型安全で再利用可能な状態管理を実現します。従来のWritable/Readableストアよりも直感的で、TypeScriptとの相性も優れています。

### .svelte.tsファイルによるストア

以下は、ECサイトのショッピングカート機能を実装した例です。クラスベースのストアパターンを使用することで、ビジネスロジックをカプセル化し、型安全な状態管理を実現しています。

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

カートストアをコンポーネントで使用する際は、通常のJavaScriptオブジェクトのように扱えます。Svelte 5のリアクティビティシステムが自動的に変更を検知し、UIを更新します。

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

Context APIは、コンポーネントツリー内で状態を共有するための仕組みです。PropsドリリングSpellを避けつつ、グローバルストアほど広範囲でない状態共有を実現できます。テーマ設定、認証情報、フォーム状態など、特定のコンポーネントツリー内でのみ必要な状態管理に最適です。

### 親子間での状態共有

Context APIを使用する際は、型安全性を保つために専用のヘルパー関数を作成します。以下の例では、テーマ設定を管理するContextを実装しています。

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

Context Providerコンポーネントは、子コンポーネントに状態を提供する役割を持ちます。Svelte 5では、`$state`と`$effect`を活用してリアクティブなContext状態を実装できます。

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

大規模なアプリケーションでは、より構造化された状態管理パターンが必要になります。以下では、エンタープライズアプリケーションでよく使用される設計パターンをSvelteKitで実装する方法を紹介します。

### Command Pattern実装

Command Patternは、操作を独立したオブジェクトとしてカプセル化し、アンドゥ/リドゥ機能を実装する際に有効です。テキストエディタ、図形描画ツール、ゲームなど、操作の履歴管理が必要なアプリケーションで活用できます。

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

State Machine（状態機械）パターンは、アプリケーションの状態遷移を明示的に管理する手法です。認証フロー、ワークフロー、ウィザード形式のフォームなど、複雑な状態遷移を持つ機能の実装に適しています。各状態で許可される操作を制限することで、バグを防ぎやすくなります。

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

サーバーから取得したデータの管理は、クライアント側の状態管理とは異なる課題があります。データの取得、キャッシュ、同期、エラーハンドリングなど、多くの側面を考慮する必要があります。TanStack Query（旧React Query）は、これらの課題を解決する強力なライブラリです。

### TanStack Query統合

TanStack QueryをSvelteKitで使用することで、サーバー状態の管理が大幅に簡素化されます。自動的なキャッシュ管理、バックグラウンドでの再フェッチ、楽観的更新など、プロダクション環境で必要な機能が提供されています。

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

TanStack Queryの`useQuery`と`useMutation`を組み合わせることで、データの取得と更新を効率的に管理できます。以下の例では、ブログ投稿の一覧表示と新規作成を実装しています。

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

URLのクエリパラメータを活用することで、アプリケーションの状態をURLに反映させることができます。これにより、ブックマーク可能、共有可能、ブラウザの戻る/進むボタンに対応した状態管理が実現できます。検索フィルター、ページネーション、ソート順など、UIの状態をURLと同期させる場面で有効です。

### Query Parametersの活用

以下の例では、フィルター条件をURLのクエリパラメータと同期させるストアを実装しています。`$page`ストアと`goto`関数を活用することで、URLとアプリケーション状態の双方向同期を実現しています。

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

状態管理におけるパフォーマンス最適化は、大規模なデータセットを扱う際に特に重要です。適切なメモ化、計算のキャッシュ、不要な再計算の防止により、アプリケーションのレスポンスを大幅に改善できます。

### メモ化と最適化

以下の例では、フィルタリングとソートの結果をキャッシュすることで、重い計算処理を最適化しています。キャッシュサイズの制限も実装し、メモリ使用量の増大を防いでいます。

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

状態管理ロジックのテストは、アプリケーションの品質を保証する上で重要です。Vitestを使用することで、Svelte 5の`.svelte.ts`ストアを効率的にテストできます。単体テストでビジネスロジックを検証し、統合テストでコンポーネントとの連携を確認します。

### ストアのテスト

以下は、カートストアの単体テストの例です。各メソッドの動作を個別に検証し、エッジケースも含めてテストすることで、信頼性の高い状態管理を実現します。

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

SvelteKitの状態管理は、アプリケーションの規模と複雑さに応じて選択すべきです。小規模なアプリケーションではSvelte 5の`$state`と`.svelte.ts`ファイルで十分ですが、大規模なアプリケーションでは状態マシンやコマンドパターンなどの高度なパターンが有効です。

#### 重要なポイント
- **適切なスコープの選択**: ローカル状態、Context、グローバルストアを使い分ける
- **型安全性の確保**: TypeScriptを活用して、コンパイル時にエラーを検出
- **パフォーマンスの考慮**: 必要に応じてメモ化とキャッシュを実装
- **テストの実施**: ビジネスロジックを単体テストで検証
- **保守性の重視**: 過度な抽象化を避け、チームで理解しやすいコードを維持

適切な状態管理パターンを選択することで、保守性とパフォーマンスのバランスが取れた、スケーラブルなアプリケーションを構築できます。