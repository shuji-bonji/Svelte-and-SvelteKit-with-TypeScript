---
title: リアクティブストア
description: .svelte.js/.svelte.tsファイルによる再利用可能なリアクティブロジック
---

Svelte 5では、`.svelte.js`および`.svelte.ts`ファイルを使用して、コンポーネント間で共有可能なリアクティブストアを作成できます。これは従来のストアシステムを置き換える、より強力で型安全な方法です。

## リアクティブストアとは

リアクティブストアは、Runesシステム（`$state`、`$derived`など）を使用して作成される、再利用可能なリアクティブロジックのパッケージです。`.svelte.js`/`.svelte.ts`ファイルに定義することで、複数のコンポーネント間で状態とロジックを共有できます。

### 主な特徴

1. **ファイル拡張子** - `.svelte.js`または`.svelte.ts`を使用
2. **Runesシステム** - `$state`、`$derived`、`$effect`などのRunesを活用
3. **型安全** - TypeScriptによる完全な型推論
4. **自動リアクティビティ** - subscribe/unsubscribeの管理が不要
5. **純粋なJavaScript** - テストが簡単で、モックが不要

:::tip[Svelte 4からの移行]
Svelte 4の`writable`、`readable`、`derived`ストアは、Svelte 5では`.svelte.js`/`.svelte.ts`ファイルと Runesシステムで置き換えられます。
:::

## Svelte 4ストアとの違い

<Tabs activeName="Svelte 5（リアクティブストア）">
  <TabPanel name="Svelte 4（従来のストア）">


  ```javascript
  // stores.js - Svelte 4の書き方
  import { writable, derived } from 'svelte/store';
  
  // writableストア
  export const count = writable(0);
  
  // derivedストア  
  export const doubled = derived(
    count, 
    $count => $count * 2
  );
  
  // カスタムストア
  function createCounter() {
    const { subscribe, set, update } = writable(0);
    
    return {
      subscribe,
      increment: () => update(n => n + 1),
      decrement: () => update(n => n - 1), 
      reset: () => set(0)
    };
  }
  ```

  **コンポーネントでの使用**
  ```svelte
  <script>
    import { count, doubled } from './stores';
    
    // $プレフィックスで自動購読
    $: console.log($count);
  </script>
  
  <!-- $プレフィックスが必要 -->
  <p>Count: {$count}</p>
  <p>Doubled: {$doubled}</p>
  <button on:click={() => $count++}>
    Increment
  </button>
  ```

  **特徴**
  - `svelte/store`からインポートが必要
  - `$`プレフィックスで自動購読
  - subscribe/unsubscribeの管理が必要な場合がある
  - 型推論が限定的
  
  </TabPanel>
  
  <TabPanel name="Svelte 5（リアクティブストア）">
  

  ```typescript
  // counter.svelte.ts - Svelte 5の書き方
  export function createCounter(initial = 0) {
    let count = $state(initial);
    let doubled = $derived(count * 2);
      
    return {
      get value() { return count; },
      get doubled() { return doubled; },
      increment() { count++; },
      decrement() { count--; },
      reset() { count = initial; }
    };
  }
  ```

  **コンポーネントでの使用**
  ```svelte
  <script lang="ts">
    import { createCounter } from './counter.svelte';
    
    const counter = createCounter();
  </script>
  
  <!-- $プレフィックス不要、直接アクセス -->
  <p>Count: {counter.value}</p>
  <p>Doubled: {counter.doubled}</p>
  <button onclick={counter.increment}>
    Increment
  </button>
  ```

  **特徴**
  - `.svelte.js`/`.svelte.ts`ファイルを使用
  - Runesシステム（`$state`、`$derived`）を活用
  - `$`プレフィックス不要で直接アクセス
  - TypeScriptによる完全な型推論
  - 自動的なメモリ管理


  </TabPanel>
</Tabs>

### 比較表

| 機能 | Svelte 4 ストア | Svelte 5 リアクティブストア |
|------|----------------|--------------------------|
| **ファイル拡張子** | `.js`/`.ts` | `.svelte.js`/`.svelte.ts` |
| **インポート** | `svelte/store`から | 不要（Runesを使用） |
| **リアクティビティ** | subscribe/unsubscribe | 自動（Runesシステム） |
| **値へのアクセス** | `$store` | `store.property` |
| **型推論** | 限定的 | 完全な型推論 |
| **メモリ管理** | 手動でunsubscribe必要 | 自動管理 |
| **テスト** | モック必要 | 純粋なJSとしてテスト可能 |
| **SSR** | メモリリークのリスク | 安全 |

### なぜ変更されたのか？

1. **開発体験の向上**
   - `$`プレフィックスが不要になり、より自然な記法に
   - IDEの補完やリファクタリングが効きやすい
   - デバッグが容易

2. **型安全性**
   - TypeScriptとの完全な統合
   - 型推論が自動的に機能
   - ランタイムエラーの削減

3. **パフォーマンス**
   - subscribe/unsubscribeのオーバーヘッドがない
   - メモリリークのリスクが低い
   - より効率的な更新処理

4. **保守性**
   - テストが簡単（純粋なJavaScript/TypeScript）
   - コードの再利用性が高い
   - より明確な依存関係

## 基本的な使い方

### シンプルなカウンターストア

```typescript
// counter.svelte.ts
export function createCounter(initial = 0) {
  let count = $state(initial);
  
  return {
    get value() {
      return count;
    },
    increment() {
      count++;
    },
    decrement() {
      count--;
    },
    reset() {
      count = initial;
    }
  };
}

// TypeScript型の自動推論
export type Counter = ReturnType<typeof createCounter>;
```

#### 使用例

```svelte
<script lang="ts">
  import { createCounter } from './counter.svelte';
  
  const counter = createCounter(10);
</script>

<div>
  <p>カウント: {counter.value}</p>
  <button onclick={counter.increment}>+1</button>
  <button onclick={counter.decrement}>-1</button>
  <button onclick={counter.reset}>リセット</button>
</div>
```

### グローバルストア（シングルトン）

グローバルストアは、アプリケーション全体で共有される単一のインスタンスです。ファイルのトップレベルで状態を定義し、エクスポートすることで実現します。

```typescript
// globalStore.svelte.ts
let count = $state(0);
let message = $state('');

export const globalStore = {
  get count() {
    return count;
  },
  get message() {
    return message;
  },
  incrementCount() {
    count++;
  },
  setMessage(value: string) {
    message = value;
  }
};
```

:::warning[注意点]
グローバルストアは全てのコンポーネントで同じインスタンスを共有するため、状態の変更が全体に影響します。必要に応じてファクトリー関数を使用して、個別のインスタンスを作成することを検討してください。
:::

## 高度なパターン

### 派生値を含むストア

派生値（`$derived`）を使用することで、状態から自動的に計算される値を定義できます。これらの値は、元の状態が変更されると自動的に再計算されます。

```typescript
// cart.svelte.ts
type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

export function createCart() {
  let items = $state<CartItem[]>([]);
  
  // 派生値：合計金額（自動的に再計算される）
  let totalPrice = $derived(
    items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  );
  
  // 派生値：アイテム数（自動的に再計算される）
  let itemCount = $derived(
    items.reduce((sum, item) => sum + item.quantity, 0)
  );
  
  return {
    get items() {
      return items;
    },
    get totalPrice() {
      return totalPrice;
    },
    get itemCount() {
      return itemCount;
    },
    addItem(item: Omit<CartItem, 'quantity'>) {
      const existing = items.find(i => i.id === item.id);
      if (existing) {
        existing.quantity++;
      } else {
        items.push({ ...item, quantity: 1 });
      }
    },
    removeItem(id: string) {
      const index = items.findIndex(i => i.id === id);
      if (index !== -1) {
        items.splice(index, 1);
      }
    },
    updateQuantity(id: string, quantity: number) {
      const item = items.find(i => i.id === id);
      if (item) {
        if (quantity <= 0) {
          this.removeItem(id);
        } else {
          item.quantity = quantity;
        }
      }
    },
    clear() {
      items = [];
    }
  };
}
```

:::info[派生値のメリット]
- **自動更新**: 依存する値が変更されると自動的に再計算
- **メモ化**: 依存する値が変わらない限り、再計算されない
- **型推論**: TypeScriptが戻り値の型を自動的に推論
:::

### 非同期データを扱うストア

非同期処理を含むストアでは、ローディング状態やエラー処理を適切に管理することが重要です。

```typescript
// userStore.svelte.ts
type User = {
  id: string;
  name: string;
  email: string;
};

export function createUserStore() {
  let user = $state<User | null>(null);
  let loading = $state(false);
  let error = $state<string | null>(null);
  
  async function fetchUser(userId: string) {
    loading = true;
    error = null;
    
    try {
      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }
      user = await response.json();
    } catch (e) {
      error = e instanceof Error ? e.message : 'Unknown error';
      user = null;
    } finally {
      loading = false;
    }
  }
  
  return {
    get user() {
      return user;
    },
    get loading() {
      return loading;
    },
    get error() {
      return error;
    },
    fetchUser,
    logout() {
      user = null;
      error = null;
    }
  };
}
```

#### 使用例

```svelte
<script lang="ts">
  import { createUserStore } from './userStore.svelte';
  import { onMount } from 'svelte';
  
  const userStore = createUserStore();
  
  onMount(() => {
    userStore.fetchUser('123');
  });
</script>

{#if userStore.loading}
  <p>読み込み中...</p>
{:else if userStore.error}
  <p class="error">エラー: {userStore.error}</p>
{:else if userStore.user}
  <div>
    <h2>{userStore.user.name}</h2>
    <p>{userStore.user.email}</p>
  </div>
{/if}
```

### ローカルストレージと同期するストア

ブラウザのローカルストレージと自動的に同期するストアを作成できます。`$effect`を使用して、値の変更を検知し保存します。

```typescript
// persistentStore.svelte.ts
export function createPersistentStore<T>(
  key: string,
  initialValue: T
) {
  // ローカルストレージから初期値を読み込み
  let value = $state<T>((() => {
    if (typeof window === 'undefined') return initialValue;
    
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return initialValue;
      }
    }
    return initialValue;
  })());
  
  // 値が変更されたらローカルストレージに保存
  $effect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(value));
    }
  });
  
  return {
    get value() {
      return value;
    },
    set(newValue: T) {
      value = newValue;
    },
    update(updater: (value: T) => T) {
      value = updater(value);
    },
    reset() {
      value = initialValue;
      if (typeof window !== 'undefined') {
        localStorage.removeItem(key);
      }
    }
  };
}

// 使用例
const theme = createPersistentStore('theme', 'light');
const settings = createPersistentStore('userSettings', {
  notifications: true,
  language: 'ja'
});
```

:::tip[SSRの考慮]
`typeof window === 'undefined'`のチェックにより、サーバーサイドレンダリング時のエラーを防いでいます。
:::

## コンポジションパターン

### 複数のストアを組み合わせる

複数のストアを組み合わせることで、関心の分離を保ちながら、連携する機能を実装できます。

```typescript
// auth.svelte.ts
export function createAuthStore() {
  let user = $state<User | null>(null);
  let token = $state<string | null>(null);
  
  return {
    get user() { return user; },
    get token() { return token; },
    get isAuthenticated() { return !!user && !!token; },
    login(userData: User, authToken: string) {
      user = userData;
      token = authToken;
    },
    logout() {
      user = null;
      token = null;
    }
  };
}

// permissions.svelte.ts
export function createPermissionsStore(auth: ReturnType<typeof createAuthStore>) {
  let permissions = $state<string[]>([]);
  
  // authストアの変更を監視
  $effect(() => {
    if (auth.isAuthenticated && auth.user) {
      // ユーザーの権限を取得
      fetchPermissions(auth.user.id);
    } else {
      permissions = [];
    }
  });
  
  async function fetchPermissions(userId: string) {
    const response = await fetch(`/api/permissions/${userId}`);
    permissions = await response.json();
  }
  
  return {
    get permissions() { return permissions; },
    hasPermission(permission: string) {
      return permissions.includes(permission);
    },
    hasAnyPermission(...perms: string[]) {
      return perms.some(p => permissions.includes(p));
    },
    hasAllPermissions(...perms: string[]) {
      return perms.every(p => permissions.includes(p));
    }
  };
}

// 組み合わせて使用
const auth = createAuthStore();
const permissions = createPermissionsStore(auth);
```

:::info[コンポジションの利点]
- **関心の分離**: 各ストアは単一の責任を持つ
- **再利用性**: 個別のストアを他のコンテキストで再利用可能
- **テスタビリティ**: 各ストアを独立してテスト可能
- **保守性**: 機能ごとに分かれているため、変更が容易
:::

### ファクトリーパターン

```typescript
// todoStore.svelte.ts
type Todo = {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
};

type TodoFilter = 'all' | 'active' | 'completed';

export function createTodoStore(initialTodos: Todo[] = []) {
  let todos = $state<Todo[]>(initialTodos);
  let filter = $state<TodoFilter>('all');
  let searchQuery = $state('');
  
  // フィルタリングされたTODOリスト
  let filteredTodos = $derived(() => {
    let result = todos;
    
    // フィルター適用
    if (filter === 'active') {
      result = result.filter(t => !t.completed);
    } else if (filter === 'completed') {
      result = result.filter(t => t.completed);
    }
    
    // 検索クエリ適用
    if (searchQuery) {
      result = result.filter(t => 
        t.text.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return result;
  });
  
  // 統計情報
  let stats = $derived(() => ({
    total: todos.length,
    active: todos.filter(t => !t.completed).length,
    completed: todos.filter(t => t.completed).length
  }));
  
  return {
    get todos() { return filteredTodos; },
    get filter() { return filter; },
    get searchQuery() { return searchQuery; },
    get stats() { return stats; },
    
    setFilter(newFilter: TodoFilter) {
      filter = newFilter;
    },
    
    setSearchQuery(query: string) {
      searchQuery = query;
    },
    
    addTodo(text: string) {
      todos.push({
        id: crypto.randomUUID(),
        text,
        completed: false,
        createdAt: new Date()
      });
    },
    
    toggleTodo(id: string) {
      const todo = todos.find(t => t.id === id);
      if (todo) {
        todo.completed = !todo.completed;
      }
    },
    
    deleteTodo(id: string) {
      const index = todos.findIndex(t => t.id === id);
      if (index !== -1) {
        todos.splice(index, 1);
      }
    },
    
    clearCompleted() {
      todos = todos.filter(t => !t.completed);
    }
  };
}
```

## リアクティブクラスパターン

```typescript
// store.svelte.ts
export class ReactiveStore<T> {
  private value = $state<T>();
  private subscribers = new Set<(value: T) => void>();
  
  constructor(initial: T) {
    this.value = initial;
  }
  
  get current() {
    return this.value;
  }
  
  set(newValue: T) {
    this.value = newValue;
    this.notify();
  }
  
  update(updater: (value: T) => T) {
    this.value = updater(this.value);
    this.notify();
  }
  
  subscribe(callback: (value: T) => void) {
    this.subscribers.add(callback);
    callback(this.value); // 初期値を通知
    
    return () => {
      this.subscribers.delete(callback);
    };
  }
  
  private notify() {
    this.subscribers.forEach(callback => callback(this.value));
  }
}

// 特化したストアクラス
export class NotificationStore extends ReactiveStore<Notification[]> {
  constructor() {
    super([]);
  }
  
  add(notification: Notification) {
    this.update(notifications => [...notifications, notification]);
    
    // 自動削除
    if (notification.autoClose) {
      setTimeout(() => {
        this.remove(notification.id);
      }, notification.duration || 3000);
    }
  }
  
  remove(id: string) {
    this.update(notifications => 
      notifications.filter(n => n.id !== id)
    );
  }
  
  clear() {
    this.set([]);
  }
}
```

## WebSocketとの統合

```typescript
// websocket.svelte.ts
type Message = {
  id: string;
  type: string;
  data: any;
  timestamp: Date;
};

export function createWebSocketStore(url: string) {
  let socket = $state<WebSocket | null>(null);
  let connected = $state(false);
  let messages = $state<Message[]>([]);
  let error = $state<string | null>(null);
  
  function connect() {
    try {
      socket = new WebSocket(url);
      
      socket.onopen = () => {
        connected = true;
        error = null;
      };
      
      socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        messages.push({
          ...message,
          timestamp: new Date()
        });
        
        // メッセージ数を制限
        if (messages.length > 100) {
          messages.shift();
        }
      };
      
      socket.onerror = (event) => {
        error = 'WebSocket error occurred';
      };
      
      socket.onclose = () => {
        connected = false;
      };
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to connect';
    }
  }
  
  function disconnect() {
    if (socket) {
      socket.close();
      socket = null;
    }
  }
  
  function send(data: any) {
    if (socket && connected) {
      socket.send(JSON.stringify(data));
    }
  }
  
  // コンポーネントがアンマウントされたら切断
  $effect(() => {
    return () => {
      disconnect();
    };
  });
  
  return {
    get connected() { return connected; },
    get messages() { return messages; },
    get error() { return error; },
    connect,
    disconnect,
    send,
    clearMessages() {
      messages = [];
    }
  };
}
```

## テストのベストプラクティス

```typescript
// counter.test.ts
import { describe, it, expect } from 'vitest';
import { createCounter } from './counter.svelte';

describe('Counter Store', () => {
  it('初期値が正しく設定される', () => {
    const counter = createCounter(10);
    expect(counter.value).toBe(10);
  });
  
  it('increment が正しく動作する', () => {
    const counter = createCounter(0);
    counter.increment();
    expect(counter.value).toBe(1);
  });
  
  it('reset が初期値に戻す', () => {
    const counter = createCounter(5);
    counter.increment();
    counter.increment();
    counter.reset();
    expect(counter.value).toBe(5);
  });
});
```

## パフォーマンスの最適化

### メモ化と遅延評価

```typescript
// optimizedStore.svelte.ts
export function createOptimizedStore<T>(
  initialData: T[],
  expensiveComputation: (data: T[]) => any
) {
  let data = $state(initialData);
  let computationCache = new Map();
  
  // 遅延評価される派生値
  let computed = $derived.by(() => {
    const key = JSON.stringify(data);
    
    if (!computationCache.has(key)) {
      computationCache.set(key, expensiveComputation(data));
    }
    
    return computationCache.get(key);
  });
  
  return {
    get data() { return data; },
    get computed() { return computed; },
    updateData(newData: T[]) {
      data = newData;
    },
    clearCache() {
      computationCache.clear();
    }
  };
}
```

### バッチ更新

```typescript
// batchStore.svelte.ts
export function createBatchStore<T>() {
  let items = $state<T[]>([]);
  let pendingUpdates: (() => void)[] = [];
  let updateScheduled = false;
  
  function scheduleUpdate() {
    if (!updateScheduled) {
      updateScheduled = true;
      queueMicrotask(() => {
        pendingUpdates.forEach(update => update());
        pendingUpdates = [];
        updateScheduled = false;
      });
    }
  }
  
  return {
    get items() { return items; },
    
    add(item: T) {
      pendingUpdates.push(() => items.push(item));
      scheduleUpdate();
    },
    
    remove(index: number) {
      pendingUpdates.push(() => items.splice(index, 1));
      scheduleUpdate();
    },
    
    batchUpdate(updates: T[]) {
      pendingUpdates.push(() => {
        items = [...items, ...updates];
      });
      scheduleUpdate();
    }
  };
}
```

## まとめ

リアクティブストアは、Svelte 5における状態管理の中核となる機能です。`.svelte.js`/`.svelte.ts`ファイルとRunesシステムを組み合わせることで

1. **型安全** - TypeScriptによる完全な型推論
2. **再利用可能** - コンポーネント間でロジックを共有
3. **テスト可能** - 純粋な JavaScript/TypeScript として単体テスト可能
4. **パフォーマンス** - 必要な部分のみが更新される効率的なリアクティビティ
5. **柔軟性** - 様々なパターンとの組み合わせが可能

:::info[関連リンク]
- [クラスとリアクティビティ](/advanced/class-reactivity/) - クラスベースのパターン
- [組み込みリアクティブクラス](/advanced/built-in-classes/) - SvelteMap、SvelteSetなど
- [$stateルーン](/runes/state/) - 基本的なリアクティビティ
:::

次は[クラスとリアクティビティ](/advanced/class-reactivity/)で、クラスベースのリアクティブパターンを学びましょう。