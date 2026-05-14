---
title: リアクティブストア
description: Svelte5のリアクティブストアをTypeScriptで完全マスター - .svelte.tsファイル、writable、derived、readonly、custom stores、サブスクリプション管理、自動購読の実装を実例を交えて体系的に詳しく解説します
---

<script>
	import { base } from '$app/paths';
	import Admonition from '$lib/components/Admonition.svelte';
</script>

Svelte 5では、`.svelte.js`および`.svelte.ts`ファイルを使用して、コンポーネント間で共有可能なリアクティブストアを作成できます。これは従来のストアシステムを置き換える、より強力で型安全な方法です。

:::caution[新規実装では Runes を優先]
**`svelte/store` API（`writable` / `readable` / `derived` / `readonly`）は Svelte 5 でも引き続き利用可能で非推奨ではありませんが、新規実装では Runes（`.svelte.ts` ファイルでの `$state` / `$derived`）を優先してください。**

公式ドキュメントの位置づけ（[Svelte Docs - Stores](https://svelte.dev/docs/svelte/stores)）も、Svelte 5 以降は次のように明確化されています。

> Prior to Svelte 5, stores were the go-to solution for creating cross-component reactive states or extracting logic. With runes, these use cases have greatly diminished.
> （Svelte 5 以前、ストアはコンポーネント間で状態を共有したりロジックを抽出するための定石でした。Runes の登場により、これらの用途は大幅に減少しています。）

新規コードでは次の方針が推奨されます。

- **ロジック抽出** → `.svelte.js` / `.svelte.ts` ファイル内で Runes を使用（[`$state` ルーン]({base}/svelte/runes/state/)を参照）
- **共有状態** → エクスポートした `$state` オブジェクトを直接読み書き（[状態管理戦略]({base}/sveltekit/application/state-management/)を参照）
- **派生値** → `$derived` / `$derived.by()`

一方で、以下のケースでは現在も `svelte/store` の学習・利用に価値があります。

1. **既存コードベース・サードパーティライブラリとの互換性** — 多くの既存 Svelte エコシステム（`svelte-i18n` 等）は store 契約に依存している
2. **複雑な非同期データストリーム** — 公式も「complex asynchronous data streams や手動制御が重要な場合に依然として有効」と明言
3. **RxJS 等の Observable ベース思想を持ち込みたい場合** — `$` 自動購読が活きる

本ページは上記の互換性・特殊ケースの参考として残しますが、**何もない状態から書く場合は Runes ベースを選んでください**。
:::

## リアクティブストアとは

リアクティブストアは、Runesシステム（`$state`、`$derived`など）を使用して作成される、再利用可能なリアクティブロジックのパッケージです。`.svelte.js`/`.svelte.ts`ファイルに定義することで、複数のコンポーネント間で状態とロジックを共有できます。

### 主な特徴

リアクティブストアを特徴づける5つの重要なポイントを紹介します。

1. **ファイル拡張子** - `.svelte.js`または`.svelte.ts`を使用
2. **Runesシステム** - `$state`、`$derived`、`$effect`などのRunesを活用
3. **型安全** - TypeScriptによる完全な型推論
4. **自動リアクティビティ** - subscribe/unsubscribeの管理が不要
5. **純粋なJavaScript** - テストが簡単で、モックが不要

<Admonition type="tip" title="Svelte 4からの移行">

Svelte 4の`writable`、`readable`、`derived`ストアは、Svelte 5では`.svelte.js`/`.svelte.ts`ファイルと Runesシステムで置き換えられます。

</Admonition>

## Svelte 4ストアとの違い

従来のストアシステムとSvelte 5のリアクティブストアの違いを詳しく比較します。

### Svelte 4（従来のストア）

```javascript
// stores.js - Svelte 4の書き方
import { writable, derived } from 'svelte/store';

// writableストア
export const count = writable(0);

// derivedストア
export const doubled = derived(count, ($count) => $count * 2);

// カスタムストア
function createCounter() {
  const { subscribe, set, update } = writable(0);

  return {
    subscribe,
    increment: () => update((n) => n + 1),
    decrement: () => update((n) => n - 1),
    reset: () => set(0),
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

### Svelte 5（リアクティブストア）

```typescript
// counter.svelte.ts - Svelte 5の書き方
export function createCounter(initial = 0) {
  let count = $state(initial);
  let doubled = $derived(count * 2);

  return {
    get value() {
      return count;
    },
    get doubled() {
      return doubled;
    },
    increment() {
      count++;
    },
    decrement() {
      count--;
    },
    reset() {
      count = initial;
    },
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

### 比較表

Svelte 4とSvelte 5のストアシステムの機能差を一覧で比較します。

| 機能                 | Svelte 4 ストア       | Svelte 5 リアクティブストア |
| -------------------- | --------------------- | --------------------------- |
| **ファイル拡張子**   | `.js`/`.ts`           | `.svelte.js`/`.svelte.ts`   |
| **インポート**       | `svelte/store`から    | 不要（Runesを使用）         |
| **リアクティビティ** | subscribe/unsubscribe | 自動（Runesシステム）       |
| **値へのアクセス**   | `$store`              | `store.property`            |
| **型推論**           | 限定的                | 完全な型推論                |
| **メモリ管理**       | 手動でunsubscribe必要 | 自動管理                    |
| **テスト**           | モック必要            | 純粋なJSとしてテスト可能    |
| **SSR**              | メモリリークのリスク  | 安全                        |

### なぜ変更されたのか？

Svelte 5でストアシステムが大幅に変更された背景と理由を解説します。

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

リアクティブストアの基本的な作成方法と使用パターンを学びます。

### シンプルなカウンターストア

最も基本的なストアパターンで、カウンター機能を実装します。

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
    },
  };
}

// TypeScript型の自動推論
export type Counter = ReturnType<typeof createCounter>;
```

#### 使用例

カウンターストアをコンポーネントで実際に使用する方法を示します。

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
  },
};
```

<Admonition type="warning" title="注意点">

グローバルストアは全てのコンポーネントで同じインスタンスを共有するため、状態の変更が全体に影響します。必要に応じてファクトリー関数を使用して、個別のインスタンスを作成することを検討してください。

</Admonition>

## 高度なパターン

より複雑な要件に対応する高度なストアパターンを紹介します。

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
    items.reduce((sum, item) => sum + item.price * item.quantity, 0),
  );

  // 派生値：アイテム数（自動的に再計算される）
  let itemCount = $derived(items.reduce((sum, item) => sum + item.quantity, 0));

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
      const existing = items.find((i) => i.id === item.id);
      if (existing) {
        existing.quantity++;
      } else {
        items.push({ ...item, quantity: 1 });
      }
    },
    removeItem(id: string) {
      const index = items.findIndex((i) => i.id === id);
      if (index !== -1) {
        items.splice(index, 1);
      }
    },
    updateQuantity(id: string, quantity: number) {
      const item = items.find((i) => i.id === id);
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
    },
  };
}
```

<Admonition type="info" title="派生値のメリット">

<ul>
<li><strong>自動更新</strong>: 依存する値が変更されると自動的に再計算</li>
<li><strong>メモ化</strong>: 依存する値が変わらない限り、再計算されない</li>
<li><strong>型推論</strong>: TypeScriptが戻り値の型を自動的に推論</li>
</ul>

</Admonition>

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
    },
  };
}
```

#### 使用例

```svelte
<script lang="ts">
  import { createUserStore } from './userStore.svelte';

  const userStore = createUserStore();

  // 初回マウント時にユーザーデータを取得
  $effect(() => {
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
export function createPersistentStore<T>(key: string, initialValue: T) {
  // ローカルストレージから初期値を読み込み
  let value = $state<T>(
    (() => {
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
    })(),
  );

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
    },
  };
}
```

#### 使用例

```typescript
const theme = createPersistentStore('theme', 'light');
const settings = createPersistentStore('userSettings', {
  notifications: true,
  language: 'ja',
});
```

<Admonition type="tip" title="SSRの考慮">

`typeof window === 'undefined'`のチェックにより、サーバーサイドレンダリング時のエラーを防いでいます。

</Admonition>

## コンポジションパターン

複数のストアを組み合わせて、より強力な機能を実現する方法です。

### 複数のストアを組み合わせる

複数のストアを組み合わせることで、関心の分離を保ちながら、連携する機能を実装できます。

```typescript
// auth.svelte.ts
export function createAuthStore() {
  let user = $state<User | null>(null);
  let token = $state<string | null>(null);

  return {
    get user() {
      return user;
    },
    get token() {
      return token;
    },
    get isAuthenticated() {
      return !!user && !!token;
    },
    login(userData: User, authToken: string) {
      user = userData;
      token = authToken;
    },
    logout() {
      user = null;
      token = null;
    },
  };
}

// permissions.svelte.ts
export function createPermissionsStore(
  auth: ReturnType<typeof createAuthStore>,
) {
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
    get permissions() {
      return permissions;
    },
    hasPermission(permission: string) {
      return permissions.includes(permission);
    },
    hasAnyPermission(...perms: string[]) {
      return perms.some((p) => permissions.includes(p));
    },
    hasAllPermissions(...perms: string[]) {
      return perms.every((p) => permissions.includes(p));
    },
  };
}

// 組み合わせて使用
const auth = createAuthStore();
const permissions = createPermissionsStore(auth);
```

<Admonition type="info" title="コンポジションの利点">

<ul>
<li><strong>関心の分離</strong>: 各ストアは単一の責任を持つ</li>
<li><strong>再利用性</strong>: 個別のストアを他のコンテキストで再利用可能</li>
<li><strong>テスタビリティ</strong>: 各ストアを独立してテスト可能</li>
<li><strong>保守性</strong>: 機能ごとに分かれているため、変更が容易</li>
</ul>

</Admonition>

### ファクトリーパターン

同じ構造のストアを複数作成する際に便利なファクトリー関数のパターンです。

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
  // 複数行の処理には $derived.by() を使用
  let filteredTodos = $derived.by(() => {
    let result = todos;

    // フィルター適用
    if (filter === 'active') {
      result = result.filter((t) => !t.completed);
    } else if (filter === 'completed') {
      result = result.filter((t) => t.completed);
    }

    // 検索クエリ適用
    if (searchQuery) {
      result = result.filter((t) =>
        t.text.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    return result;
  });

  // 統計情報
  let stats = $derived.by(() => ({
    total: todos.length,
    active: todos.filter((t) => !t.completed).length,
    completed: todos.filter((t) => t.completed).length,
  }));

  return {
    get todos() {
      return filteredTodos;
    },
    get filter() {
      return filter;
    },
    get searchQuery() {
      return searchQuery;
    },
    get stats() {
      return stats;
    },

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
        createdAt: new Date(),
      });
    },

    toggleTodo(id: string) {
      const todo = todos.find((t) => t.id === id);
      if (todo) {
        todo.completed = !todo.completed;
      }
    },

    deleteTodo(id: string) {
      const index = todos.findIndex((t) => t.id === id);
      if (index !== -1) {
        todos.splice(index, 1);
      }
    },

    clearCompleted() {
      todos = todos.filter((t) => !t.completed);
    },
  };
}
```

## リアクティブクラスパターン

クラスベースのアプローチでリアクティブなストアを構築する方法です。

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
    this.subscribers.forEach((callback) => callback(this.value));
  }
}

// 特化したストアクラス
export class NotificationStore extends ReactiveStore<Notification[]> {
  constructor() {
    super([]);
  }

  add(notification: Notification) {
    this.update((notifications) => [...notifications, notification]);

    // 自動削除
    if (notification.autoClose) {
      setTimeout(() => {
        this.remove(notification.id);
      }, notification.duration || 3000);
    }
  }

  remove(id: string) {
    this.update((notifications) => notifications.filter((n) => n.id !== id));
  }

  clear() {
    this.set([]);
  }
}
```

## WebSocketとの統合

リアルタイム通信を実現するWebSocketとストアの統合パターンです。

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
          timestamp: new Date(),
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
    get connected() {
      return connected;
    },
    get messages() {
      return messages;
    },
    get error() {
      return error;
    },
    connect,
    disconnect,
    send,
    clearMessages() {
      messages = [];
    },
  };
}
```

## 実際のアプリケーションでの活用シーン

リアクティブストアは以下のような場面で特に有効です。

<div class="grid grid-cols-1 md:grid-cols-2 gap-4 my-8">
  <div class="card">
    <h3>🔐 認証・ユーザー管理</h3>
    <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">ユーザーの認証状態やセッション情報をアプリ全体で一元管理</p>
    <ul>
      <li><strong class="text-blue-600/80 dark:text-sky-400/80">ログイン状態の管理</strong> - アプリ全体でユーザーの認証状態を共有</li>
      <li><strong class="text-blue-600/80 dark:text-sky-400/80">ユーザープロフィール</strong> - ヘッダー、サイドバー、設定画面など複数箇所で使用</li>
      <li><strong class="text-blue-600/80 dark:text-sky-400/80">権限管理</strong> - ロールベースのアクセス制御（RBAC）</li>
      <li><strong class="text-blue-600/80 dark:text-sky-400/80">セッション管理</strong> - トークンの自動更新、タイムアウト処理</li>
    </ul>
  </div>
  
  <div class="card">
    <h3>🛒 ECサイト・ショッピング</h3>
    <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">カート機能や商品管理など、ECサイトに必要な状態を統合管理</p>
    <ul>
      <li><strong class="text-blue-600/80 dark:text-sky-400/80">カート管理</strong> - 商品の追加/削除、数量変更、合計金額の自動計算</li>
      <li><strong class="text-blue-600/80 dark:text-sky-400/80">お気に入りリスト</strong> - 複数ページで参照・更新</li>
      <li><strong class="text-blue-600/80 dark:text-sky-400/80">商品フィルタリング</strong> - カテゴリ、価格帯、評価などの複合フィルタ</li>
      <li><strong class="text-blue-600/80 dark:text-sky-400/80">在庫管理</strong> - リアルタイム在庫数の表示と更新</li>
      <li><strong class="text-blue-600/80 dark:text-sky-400/80">注文履歴</strong> - ページネーション付きの注文一覧</li>
    </ul>
  </div>
  
  <div class="card">
    <h3>💬 コミュニケーション・チャット</h3>
    <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">リアルタイムメッセージングや通知機能の状態を効率的に管理</p>
    <ul>
      <li><strong class="text-blue-600/80 dark:text-sky-400/80">メッセージ管理</strong> - 送受信、既読管理、タイピングインジケーター</li>
      <li><strong class="text-blue-600/80 dark:text-sky-400/80">通知システム</strong> - プッシュ通知、アプリ内通知、未読バッジ</li>
      <li><strong class="text-blue-600/80 dark:text-sky-400/80">オンラインステータス</strong> - ユーザーのオンライン/オフライン状態</li>
      <li><strong class="text-blue-600/80 dark:text-sky-400/80">リアルタイム更新</strong> - WebSocketを使った双方向通信</li>
      <li><strong class="text-blue-600/80 dark:text-sky-400/80">絵文字リアクション</strong> - メッセージへのリアクション管理</li>
    </ul>
  </div>
  
  <div class="card">
    <h3>📝 フォーム・入力管理</h3>
    <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">複雑なフォームの状態管理とバリデーションを簡潔に実装</p>
    <ul>
      <li><strong class="text-blue-600/80 dark:text-sky-400/80">複数ステップフォーム</strong> - ウィザード形式の入力画面</li>
      <li><strong class="text-blue-600/80 dark:text-sky-400/80">フォームバリデーション</strong> - リアルタイムエラー表示</li>
      <li><strong class="text-blue-600/80 dark:text-sky-400/80">自動保存</strong> - 入力内容の定期的な保存</li>
      <li><strong class="text-blue-600/80 dark:text-sky-400/80">下書き管理</strong> - ブログ投稿やメール作成の下書き</li>
      <li><strong class="text-blue-600/80 dark:text-sky-400/80">アンドゥ/リドゥ</strong> - 編集履歴の管理</li>
    </ul>
  </div>
  
  <div class="card">
    <h3>🎨 UI/UX制御</h3>
    <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">ユーザーインターフェースの設定や表示状態をグローバルに管理</p>
    <ul>
      <li><strong class="text-blue-600/80 dark:text-sky-400/80">テーマ切り替え</strong> - ダーク/ライトモード、カラーテーマ</li>
      <li><strong class="text-blue-600/80 dark:text-sky-400/80">言語切り替え</strong> - 多言語対応（i18n）</li>
      <li><strong class="text-blue-600/80 dark:text-sky-400/80">レイアウト設定</strong> - サイドバーの開閉、表示密度</li>
      <li><strong class="text-blue-600/80 dark:text-sky-400/80">アクセシビリティ設定</strong> - フォントサイズ、コントラスト</li>
      <li><strong class="text-blue-600/80 dark:text-sky-400/80">ツールチップ/ポップオーバー</strong> - グローバルな表示制御</li>
    </ul>
  </div>
  
  <div class="card">
    <h3>📊 データ可視化・ダッシュボード</h3>
    <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">グラフやチャートで使用するデータとフィルター条件を統合管理</p>
    <ul>
      <li><strong class="text-blue-600/80 dark:text-sky-400/80">フィルター条件</strong> - 複数のグラフで共有するフィルター</li>
      <li><strong class="text-blue-600/80 dark:text-sky-400/80">期間選択</strong> - 日付範囲の統一管理</li>
      <li><strong class="text-blue-600/80 dark:text-sky-400/80">リアルタイムデータ</strong> - ライブダッシュボード</li>
      <li><strong class="text-blue-600/80 dark:text-sky-400/80">データキャッシュ</strong> - APIレスポンスのキャッシング</li>
      <li><strong class="text-blue-600/80 dark:text-sky-400/80">エクスポート設定</strong> - CSV/PDF出力の設定管理</li>
    </ul>
  </div>
  
  <div class="card">
    <h3>🎮 ゲーム・インタラクティブアプリ</h3>
    <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">ゲーム進行状況やプレイヤー情報などの複雑な状態を管理</p>
    <ul>
      <li><strong class="text-blue-600/80 dark:text-sky-400/80">ゲーム状態</strong> - スコア、レベル、ライフ管理</li>
      <li><strong class="text-blue-600/80 dark:text-sky-400/80">プレイヤー情報</strong> - キャラクター、インベントリ</li>
      <li><strong class="text-blue-600/80 dark:text-sky-400/80">設定管理</strong> - 音量、グラフィック設定</li>
      <li><strong class="text-blue-600/80 dark:text-sky-400/80">実績システム</strong> - アチーブメント、トロフィー</li>
      <li><strong class="text-blue-600/80 dark:text-sky-400/80">マルチプレイヤー</strong> - 他プレイヤーの状態同期</li>
    </ul>
  </div>
  
  <div class="card">
    <h3>📱 モバイルアプリ的な機能</h3>
    <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">デバイス機能やオフライン対応など、ネイティブアプリ的な状態管理</p>
    <ul>
      <li><strong class="text-blue-600/80 dark:text-sky-400/80">オフライン対応</strong> - データの同期管理</li>
      <li><strong class="text-blue-600/80 dark:text-sky-400/80">位置情報</strong> - GPS座標の追跡と共有</li>
      <li><strong class="text-blue-600/80 dark:text-sky-400/80">カメラ/マイク</strong> - メディアデバイスの状態管理</li>
      <li><strong class="text-blue-600/80 dark:text-sky-400/80">プッシュ通知</strong> - 通知の許可状態と履歴</li>
      <li><strong class="text-blue-600/80 dark:text-sky-400/80">アプリ内購入</strong> - 購入状態と復元処理</li>
    </ul>
  </div>
  
  <div class="card">
    <h3>🔄 非同期処理・バックグラウンドタスク</h3>
    <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">時間のかかる処理やバックグラウンドタスクの進捗と状態を追跡</p>
    <ul>
      <li><strong class="text-blue-600/80 dark:text-sky-400/80">ファイルアップロード</strong> - 進捗状況、複数ファイル管理</li>
      <li><strong class="text-blue-600/80 dark:text-sky-400/80">バックグラウンド同期</strong> - データの定期同期</li>
      <li><strong class="text-blue-600/80 dark:text-sky-400/80">ジョブキュー</strong> - タスクの順次実行</li>
      <li><strong class="text-blue-600/80 dark:text-sky-400/80">ポーリング</strong> - 定期的なデータ取得</li>
      <li><strong class="text-blue-600/80 dark:text-sky-400/80">リトライ処理</strong> - 失敗時の自動再試行</li>
    </ul>
  </div>
  
  <div class="card">
    <h3>🎯 アプリケーション全体の状態</h3>
    <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">アプリケーション全体に影響する横断的な状態やメタ情報を管理</p>
    <ul>
      <li><strong class="text-blue-600/80 dark:text-sky-400/80">ルーティング補助</strong> - ブレッドクラム、ナビゲーション履歴</li>
      <li><strong class="text-blue-600/80 dark:text-sky-400/80">グローバルローディング</strong> - アプリ全体のローディング状態</li>
      <li><strong class="text-blue-600/80 dark:text-sky-400/80">エラーハンドリング</strong> - グローバルエラー管理</li>
      <li><strong class="text-blue-600/80 dark:text-sky-400/80">アナリティクス</strong> - ユーザー行動の追跡</li>
      <li><strong class="text-blue-600/80 dark:text-sky-400/80">フィーチャーフラグ</strong> - 機能の有効/無効切り替え</li>
    </ul>
  </div>
</div>

### 具体的な実装判断基準

以下の条件に当てはまる場合、リアクティブストアの使用を検討すべきです。

1. **複数コンポーネントで共有** - 3つ以上のコンポーネントで同じ状態を使用
2. **永続化が必要** - LocalStorage、SessionStorage、IndexedDBとの連携
3. **複雑なビジネスロジック** - 状態変更に伴う副作用や計算が多い
4. **リアルタイム性** - WebSocket、Server-Sent Eventsなどの統合
5. **グローバルな影響** - アプリ全体に影響する設定や状態
6. **再利用性** - 他のプロジェクトでも使い回せる汎用的な機能
7. **テストの必要性** - ビジネスロジックを分離してテストしたい場合

## 実践的な使用例

### フォーム管理ストア

フォームの状態、バリデーション、エラー処理を一元管理するストアです。

```typescript
// formStore.svelte.ts
type FormField = {
  value: any;
  error: string | null;
  touched: boolean;
  dirty: boolean;
};

type FormFields = Record<string, FormField>;

type ValidationRule = {
  validate: (value: any) => boolean;
  message: string;
};

type ValidationRules = Record<string, ValidationRule[]>;

export function createFormStore<T extends Record<string, any>>(
  initialValues: T,
  validationRules: ValidationRules = {},
) {
  // 各フィールドの状態を初期化
  let fields = $state<FormFields>(
    Object.entries(initialValues).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [key]: {
          value,
          error: null,
          touched: false,
          dirty: false,
        },
      }),
      {},
    ),
  );

  let submitting = $state(false);
  let submitted = $state(false);

  // フォーム全体の状態を派生
  let isValid = $derived.by(() =>
    Object.values(fields).every((field) => !field.error),
  );

  let isDirty = $derived.by(() =>
    Object.values(fields).some((field) => field.dirty),
  );

  let isTouched = $derived.by(() =>
    Object.values(fields).some((field) => field.touched),
  );

  // フォームの値を派生
  let values = $derived.by(() =>
    Object.entries(fields).reduce(
      (acc, [key, field]) => ({
        ...acc,
        [key]: field.value,
      }),
      {} as T,
    ),
  );

  // エラーのみを抽出
  let errors = $derived.by(() =>
    Object.entries(fields).reduce(
      (acc, [key, field]) => {
        if (field.error) {
          acc[key] = field.error;
        }
        return acc;
      },
      {} as Record<string, string>,
    ),
  );

  // バリデーション実行
  function validateField(name: string, value: any) {
    const rules = validationRules[name] || [];

    for (const rule of rules) {
      if (!rule.validate(value)) {
        return rule.message;
      }
    }

    return null;
  }

  // フィールド値の更新
  function setFieldValue(name: string, value: any) {
    if (fields[name]) {
      fields[name].value = value;
      fields[name].dirty = true;
      fields[name].error = validateField(name, value);
    }
  }

  // フィールドのタッチ状態を更新
  function setFieldTouched(name: string, touched = true) {
    if (fields[name]) {
      fields[name].touched = touched;
    }
  }

  // フィールドのエラーを設定
  function setFieldError(name: string, error: string | null) {
    if (fields[name]) {
      fields[name].error = error;
    }
  }

  // すべてのフィールドをバリデート
  function validateAll() {
    let hasError = false;

    for (const [name, field] of Object.entries(fields)) {
      const error = validateField(name, field.value);
      field.error = error;
      field.touched = true;
      if (error) hasError = true;
    }

    return !hasError;
  }

  // フォームのリセット
  function reset() {
    fields = Object.entries(initialValues).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [key]: {
          value,
          error: null,
          touched: false,
          dirty: false,
        },
      }),
      {},
    );
    submitted = false;
  }

  // フォーム送信
  async function handleSubmit(onSubmit: (values: T) => Promise<void> | void) {
    submitted = true;

    if (!validateAll()) {
      return;
    }

    submitting = true;

    try {
      await onSubmit(values);
      reset();
    } catch (error) {
      console.error('Form submission error:', error);
      throw error;
    } finally {
      submitting = false;
    }
  }

  return {
    get fields() {
      return fields;
    },
    get values() {
      return values;
    },
    get errors() {
      return errors;
    },
    get isValid() {
      return isValid;
    },
    get isDirty() {
      return isDirty;
    },
    get isTouched() {
      return isTouched;
    },
    get submitting() {
      return submitting;
    },
    get submitted() {
      return submitted;
    },
    setFieldValue,
    setFieldTouched,
    setFieldError,
    validateField,
    validateAll,
    reset,
    handleSubmit,
  };
}

// 使用例：ユーザー登録フォーム
const registrationForm = createFormStore(
  {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  },
  {
    username: [
      {
        validate: (value) => value.length >= 3,
        message: 'ユーザー名は3文字以上必要です',
      },
      {
        validate: (value) => /^[a-zA-Z0-9_]+$/.test(value),
        message: '英数字とアンダースコアのみ使用可能です',
      },
    ],
    email: [
      {
        validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        message: '有効なメールアドレスを入力してください',
      },
    ],
    password: [
      {
        validate: (value) => value.length >= 8,
        message: 'パスワードは8文字以上必要です',
      },
      {
        validate: (value) =>
          /[A-Z]/.test(value) && /[a-z]/.test(value) && /[0-9]/.test(value),
        message: '大文字、小文字、数字を含む必要があります',
      },
    ],
    confirmPassword: [
      {
        validate: (value) => value === registrationForm.values.password,
        message: 'パスワードが一致しません',
      },
    ],
  },
);
```

#### コンポーネントでの使用

```svelte
<script lang="ts">
  import { createFormStore } from './formStore.svelte';

  const form = createFormStore(
    { email: '', password: '' },
    {
      email: [{
        validate: (v) => !!v && v.includes('@'),
        message: '有効なメールアドレスを入力してください'
      }],
      password: [{
        validate: (v) => v.length >= 8,
        message: 'パスワードは8文字以上必要です'
      }]
    }
  );

  async function handleLogin() {
    await form.handleSubmit(async (values) => {
      // ログイン処理
      const response = await fetch('/api/login', {
        method: 'POST',
        body: JSON.stringify(values)
      });
      // ...
    });
  }
</script>

<form onsubmit={handleLogin}>
  <div>
    <input
      type="email"
      value={form.fields.email.value}
      oninput={(e) => form.setFieldValue('email', e.currentTarget.value)}
      onblur={() => form.setFieldTouched('email')}
      class:error={form.fields.email.touched && form.fields.email.error}
    />
    {#if form.fields.email.touched && form.fields.email.error}
      <span class="error">{form.fields.email.error}</span>
    {/if}
  </div>

  <div>
    <input
      type="password"
      value={form.fields.password.value}
      oninput={(e) => form.setFieldValue('password', e.currentTarget.value)}
      onblur={() => form.setFieldTouched('password')}
      class:error={form.fields.password.touched && form.fields.password.error}
    />
    {#if form.fields.password.touched && form.fields.password.error}
      <span class="error">{form.fields.password.error}</span>
    {/if}
  </div>

  <button
    type="submit"
    disabled={!form.isValid || form.submitting}
  >
    {form.submitting ? 'ログイン中...' : 'ログイン'}
  </button>
</form>
```

### リアルタイム検索ストア

デバウンス機能付きの検索ストアで、APIへの過剰なリクエストを防ぎます。

```typescript
// searchStore.svelte.ts
type SearchResult<T> = {
  items: T[];
  totalCount: number;
  hasMore: boolean;
};

export function createSearchStore<T>(
  searchFn: (query: string, page: number) => Promise<SearchResult<T>>,
  debounceMs = 300,
) {
  let query = $state('');
  let page = $state(1);
  let results = $state<T[]>([]);
  let loading = $state(false);
  let error = $state<string | null>(null);
  let totalCount = $state(0);
  let hasMore = $state(false);

  let debounceTimer: number | null = null;
  let abortController: AbortController | null = null;

  // 検索実行
  async function performSearch() {
    // 空のクエリの場合は検索しない
    if (!query.trim()) {
      results = [];
      totalCount = 0;
      hasMore = false;
      return;
    }

    loading = true;
    error = null;

    // 前回のリクエストをキャンセル
    if (abortController) {
      abortController.abort();
    }

    abortController = new AbortController();

    try {
      const searchResult = await searchFn(query, page);

      // ページが1の場合は結果をリセット、それ以外は追加
      if (page === 1) {
        results = searchResult.items;
      } else {
        results = [...results, ...searchResult.items];
      }

      totalCount = searchResult.totalCount;
      hasMore = searchResult.hasMore;
    } catch (e) {
      if (e.name !== 'AbortError') {
        error = e instanceof Error ? e.message : '検索エラーが発生しました';
      }
    } finally {
      loading = false;
      abortController = null;
    }
  }

  // デバウンス付き検索
  function debouncedSearch() {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    debounceTimer = setTimeout(() => {
      page = 1; // 新しい検索はページ1から
      performSearch();
    }, debounceMs);
  }

  // クエリの変更を監視
  $effect(() => {
    query; // 依存関係として追跡
    debouncedSearch();

    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      if (abortController) {
        abortController.abort();
      }
    };
  });

  return {
    get query() {
      return query;
    },
    get results() {
      return results;
    },
    get loading() {
      return loading;
    },
    get error() {
      return error;
    },
    get totalCount() {
      return totalCount;
    },
    get hasMore() {
      return hasMore;
    },
    get page() {
      return page;
    },

    setQuery(newQuery: string) {
      query = newQuery;
    },

    loadMore() {
      if (!loading && hasMore) {
        page++;
        performSearch();
      }
    },

    refresh() {
      page = 1;
      performSearch();
    },

    clear() {
      query = '';
      results = [];
      totalCount = 0;
      hasMore = false;
      page = 1;
    },
  };
}

// 使用例：商品検索
const productSearch = createSearchStore<Product>(
  async (query, page) => {
    const response = await fetch(
      `/api/products/search?q=${encodeURIComponent(query)}&page=${page}`,
    );
    return response.json();
  },
  500, // 500msのデバウンス
);
```

### 通知システムストア

トースト通知やアラートを管理する高機能な通知ストアです。

```typescript
// notificationStore.svelte.ts
type NotificationType = 'success' | 'error' | 'warning' | 'info';

type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  actions?: Array<{
    label: string;
    action: () => void;
  }>;
  persistent?: boolean;
  timestamp: Date;
};

export function createNotificationStore() {
  let notifications = $state<Notification[]>([]);
  let timers = new Map<string, number>();

  // 通知を追加
  function add(notification: Omit<Notification, 'id' | 'timestamp'>): string {
    const id = crypto.randomUUID();
    const newNotification: Notification = {
      ...notification,
      id,
      timestamp: new Date(),
    };

    // 通知を追加（新しいものを上に）
    notifications = [newNotification, ...notifications];

    // 自動削除のタイマーを設定（persistent でない場合）
    if (!notification.persistent) {
      const duration = notification.duration || 5000;
      const timer = setTimeout(() => {
        remove(id);
      }, duration);
      timers.set(id, timer);
    }

    // 最大表示数を制限（例：5件まで）
    if (notifications.length > 5) {
      // 古い非永続的な通知を削除
      const toRemove = notifications.filter((n) => !n.persistent).slice(5);
      toRemove.forEach((n) => remove(n.id));
    }

    return id;
  }

  // 通知を削除
  function remove(id: string) {
    notifications = notifications.filter((n) => n.id !== id);

    // タイマーをクリア
    const timer = timers.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.delete(id);
    }
  }

  // すべての通知をクリア
  function clear(type?: NotificationType) {
    if (type) {
      notifications = notifications.filter((n) => n.type !== type);
    } else {
      notifications = [];
    }

    // すべてのタイマーをクリア
    timers.forEach((timer) => clearTimeout(timer));
    timers.clear();
  }

  // ヘルパーメソッド
  function success(title: string, message?: string) {
    return add({ type: 'success', title, message });
  }

  function error(title: string, message?: string, persistent = false) {
    return add({ type: 'error', title, message, persistent });
  }

  function warning(title: string, message?: string) {
    return add({ type: 'warning', title, message });
  }

  function info(title: string, message?: string) {
    return add({ type: 'info', title, message });
  }

  // 確認ダイアログ風の通知
  function confirm(
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void,
  ): string {
    // 先にIDを確保するために、空のactionsで一度追加 → そのIDをactionsに渡す
    const id = add({
      type: 'warning',
      title,
      message,
      persistent: true,
    });

    // 追加後にactions付きに差し替え（クロージャでidを束縛するため）
    const target = notifications.find((n) => n.id === id);
    if (target) {
      target.actions = [
        {
          label: '確認',
          action: () => {
            onConfirm();
            remove(id);
          },
        },
        {
          label: 'キャンセル',
          action: () => {
            onCancel?.();
            remove(id);
          },
        },
      ];
    }

    return id;
  }

  // クリーンアップ
  $effect(() => {
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    };
  });

  return {
    get notifications() {
      return notifications;
    },
    add,
    remove,
    clear,
    success,
    error,
    warning,
    info,
    confirm,
  };
}

// グローバルインスタンス
export const notifications = createNotificationStore();
```

#### 通知コンポーネントの実装例

```svelte
<!-- NotificationContainer.svelte -->
<script lang="ts">
  import { notifications } from './notificationStore.svelte';
  import { fly, fade } from 'svelte/transition';

  function getIcon(type: string) {
    switch(type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📢';
    }
  }
</script>

<div class="notification-container">
  {#each notifications.notifications as notification (notification.id)}
    <div
      class="notification notification-{notification.type}"
      transition:fly={{ y: -20, duration: 300 }}
    >
      <div class="notification-icon">
        {getIcon(notification.type)}
      </div>

      <div class="notification-content">
        <h4>{notification.title}</h4>
        {#if notification.message}
          <p>{notification.message}</p>
        {/if}

        {#if notification.actions}
          <div class="notification-actions">
            {#each notification.actions as action (action.id)}
              <button onclick={action.action}>
                {action.label}
              </button>
            {/each}
          </div>
        {/if}
      </div>

      {#if !notification.persistent}
        <button
          class="notification-close"
          onclick={() => notifications.remove(notification.id)}
        >
          ×
        </button>
      {/if}
    </div>
  {/each}
</div>

<style>
  .notification-container {
    position: fixed;
    top: 1rem;
    right: 1rem;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .notification {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1rem;
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    min-width: 300px;
    max-width: 500px;
  }

  .notification-success {
    border-left: 4px solid #10b981;
  }

  .notification-error {
    border-left: 4px solid #ef4444;
  }

  .notification-warning {
    border-left: 4px solid #f59e0b;
  }

  .notification-info {
    border-left: 4px solid #3b82f6;
  }
</style>
```

### モーダル管理ストア

モーダルダイアログを中央管理するストアです。

```typescript
// modalStore.svelte.ts
import type { Component } from 'svelte';

type ModalConfig = {
  id: string;
  component: Component;
  props?: Record<string, any>;
  options?: {
    closeOnEscape?: boolean;
    closeOnBackdrop?: boolean;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    centered?: boolean;
  };
  onClose?: () => void;
};

export function createModalStore() {
  let modals = $state<ModalConfig[]>([]);
  let activeModalId = $state<string | null>(null);

  // モーダルを開く
  function open(
    component: Component,
    props?: Record<string, any>,
    options?: ModalConfig['options'],
  ): string {
    const id = crypto.randomUUID();
    const modal: ModalConfig = {
      id,
      component,
      props,
      options: {
        closeOnEscape: true,
        closeOnBackdrop: true,
        size: 'md',
        centered: true,
        ...options,
      },
    };

    modals = [...modals, modal];
    activeModalId = id;

    // bodyのスクロールを無効化
    if (modals.length === 1) {
      document.body.style.overflow = 'hidden';
    }

    return id;
  }

  // モーダルを閉じる
  function close(id?: string) {
    if (id) {
      const modal = modals.find((m) => m.id === id);
      modal?.onClose?.();
      modals = modals.filter((m) => m.id !== id);
    } else if (activeModalId) {
      const modal = modals.find((m) => m.id === activeModalId);
      modal?.onClose?.();
      modals = modals.filter((m) => m.id !== activeModalId);
    }

    // 最後のモーダルが閉じられたらスクロールを復元
    if (modals.length === 0) {
      document.body.style.overflow = '';
      activeModalId = null;
    } else {
      activeModalId = modals[modals.length - 1].id;
    }
  }

  // すべてのモーダルを閉じる
  function closeAll() {
    modals.forEach((modal) => modal.onClose?.());
    modals = [];
    activeModalId = null;
    document.body.style.overflow = '';
  }

  // 確認ダイアログ
  async function confirm(
    title: string,
    message: string,
    confirmLabel = '確認',
    cancelLabel = 'キャンセル',
  ): Promise<boolean> {
    return new Promise((resolve) => {
      // ConfirmDialog コンポーネントを動的にインポート
      import('./ConfirmDialog.svelte').then(({ default: ConfirmDialog }) => {
        const id = open(
          ConfirmDialog,
          {
            title,
            message,
            confirmLabel,
            cancelLabel,
            onConfirm: () => {
              close(id);
              resolve(true);
            },
            onCancel: () => {
              close(id);
              resolve(false);
            },
          },
          {
            size: 'sm',
            closeOnBackdrop: false,
            closeOnEscape: false,
          },
        );
      });
    });
  }

  // ESCキーハンドリング
  $effect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape' && activeModalId) {
        const modal = modals.find((m) => m.id === activeModalId);
        if (modal?.options?.closeOnEscape) {
          close(activeModalId);
        }
      }
    }

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      // クリーンアップ時にスクロールを復元
      if (modals.length > 0) {
        document.body.style.overflow = '';
      }
    };
  });

  return {
    get modals() {
      return modals;
    },
    get activeModalId() {
      return activeModalId;
    },
    get hasModals() {
      return modals.length > 0;
    },
    open,
    close,
    closeAll,
    confirm,
  };
}

// グローバルインスタンス
export const modals = createModalStore();
```

### ページネーションストア

テーブルやリストのページネーション管理を簡単にするストアです。

```typescript
// paginationStore.svelte.ts
export function createPaginationStore<T>(
  fetchFn: (
    page: number,
    pageSize: number,
    sort?: string,
  ) => Promise<{
    items: T[];
    total: number;
  }>,
  initialPageSize = 20,
) {
  let items = $state<T[]>([]);
  let currentPage = $state(1);
  let pageSize = $state(initialPageSize);
  let totalItems = $state(0);
  let sortBy = $state<string | null>(null);
  let sortOrder = $state<'asc' | 'desc'>('asc');
  let loading = $state(false);
  let error = $state<string | null>(null);

  // 派生値
  let totalPages = $derived(Math.ceil(totalItems / pageSize));

  // 単純な式には $derived() を使用
  let hasNextPage = $derived(currentPage < totalPages);

  let hasPreviousPage = $derived(currentPage > 1);

  // オブジェクトリテラルを返す場合は $derived.by() を使用
  let pageInfo = $derived.by(() => ({
    from: (currentPage - 1) * pageSize + 1,
    to: Math.min(currentPage * pageSize, totalItems),
    total: totalItems,
  }));

  // ページ番号の配列を生成（ページネーションUI用）
  // 複数行の処理には $derived.by() を使用
  let pageNumbers = $derived.by(() => {
    const pages: number[] = [];
    const maxVisible = 5;
    const halfVisible = Math.floor(maxVisible / 2);

    let start = Math.max(1, currentPage - halfVisible);
    let end = Math.min(totalPages, currentPage + halfVisible);

    // 表示するページ数を調整
    if (end - start < maxVisible - 1) {
      if (start === 1) {
        end = Math.min(totalPages, start + maxVisible - 1);
      } else {
        start = Math.max(1, end - maxVisible + 1);
      }
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  });

  // データ取得
  async function loadPage() {
    loading = true;
    error = null;

    try {
      const sortParam = sortBy ? `${sortBy}:${sortOrder}` : undefined;

      const result = await fetchFn(currentPage, pageSize, sortParam);
      items = result.items;
      totalItems = result.total;
    } catch (e) {
      error = e instanceof Error ? e.message : 'データの取得に失敗しました';
    } finally {
      loading = false;
    }
  }

  // ページ変更時に自動的にデータを取得
  $effect(() => {
    currentPage;
    pageSize;
    sortBy;
    sortOrder;
    loadPage();
  });

  return {
    get items() {
      return items;
    },
    get currentPage() {
      return currentPage;
    },
    get pageSize() {
      return pageSize;
    },
    get totalItems() {
      return totalItems;
    },
    get totalPages() {
      return totalPages;
    },
    get hasNextPage() {
      return hasNextPage;
    },
    get hasPreviousPage() {
      return hasPreviousPage;
    },
    get pageInfo() {
      return pageInfo;
    },
    get pageNumbers() {
      return pageNumbers;
    },
    get loading() {
      return loading;
    },
    get error() {
      return error;
    },
    get sortBy() {
      return sortBy;
    },
    get sortOrder() {
      return sortOrder;
    },

    goToPage(page: number) {
      if (page >= 1 && page <= totalPages) {
        currentPage = page;
      }
    },

    nextPage() {
      if (hasNextPage) {
        currentPage++;
      }
    },

    previousPage() {
      if (hasPreviousPage) {
        currentPage--;
      }
    },

    firstPage() {
      currentPage = 1;
    },

    lastPage() {
      currentPage = totalPages;
    },

    setPageSize(size: number) {
      pageSize = size;
      currentPage = 1; // ページサイズ変更時は最初のページに戻る
    },

    setSorting(field: string | null, order: 'asc' | 'desc' = 'asc') {
      sortBy = field;
      sortOrder = order;
      currentPage = 1; // ソート変更時は最初のページに戻る
    },

    toggleSort(field: string) {
      if (sortBy === field) {
        sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        sortBy = field;
        sortOrder = 'asc';
      }
      currentPage = 1;
    },

    refresh() {
      loadPage();
    },
  };
}
```

## テストのベストプラクティス

リアクティブストアのテスト方法と効果的なテスト戦略を解説します。

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

リアクティブストアのパフォーマンスを向上させるための最適化テクニックです。

### メモ化と遅延評価

計算コストの高い処理を最適化するためのメモ化と遅延評価の活用方法です。

```typescript
// optimizedStore.svelte.ts
export function createOptimizedStore<T>(
  initialData: T[],
  expensiveComputation: (data: T[]) => any,
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
    get data() {
      return data;
    },
    get computed() {
      return computed;
    },
    updateData(newData: T[]) {
      data = newData;
    },
    clearCache() {
      computationCache.clear();
    },
  };
}
```

### バッチ更新

複数の更新をまとめて処理し、不要な再レンダリングを防ぐ最適化テクニックです。

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
        pendingUpdates.forEach((update) => update());
        pendingUpdates = [];
        updateScheduled = false;
      });
    }
  }

  return {
    get items() {
      return items;
    },

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
    },
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

<Admonition type="info" title="関連リンク">

<ul>
<li><a href="{base}/svelte/advanced/class-reactivity/">クラスとリアクティビティ</a> - クラスベースのパターン</li>
<li><a href="{base}/svelte/advanced/built-in-classes/">組み込みリアクティブクラス</a> - SvelteMap、SvelteSetなど</li>
<li><a href="{base}/svelte/runes/state/">$stateルーン</a> - 基本的なリアクティビティ</li>
</ul>

</Admonition>
次は<a href="{base}/svelte/advanced/class-reactivity/">クラスとリアクティビティ</a>で、クラスベースのリアクティブパターンを学びましょう。
