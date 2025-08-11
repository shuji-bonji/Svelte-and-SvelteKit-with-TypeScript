---
title: $stateルーン
description: Svelte 5のリアクティブな状態管理
---

`$state`は、Svelte 5の新しいリアクティビティシステム「Runes」の中核となる機能です。このページでは、`$state`を使った状態管理の基本から応用まで、TypeScriptと組み合わせた実践的な使い方を解説します。

:::tip[React/Vue経験者向け]
- `$state`は React の `useState` や Vue の `ref` に相当
- ただし、セッター関数は不要で、値を直接変更可能
- オブジェクトのプロパティも自動的にリアクティブになる（深いリアクティビティ）
:::

## $stateとは

`$state`は、Svelte 5でリアクティブな値を作成するための基本的なルーンです。  
値が変更されると、それを使用しているコンポーネントが自動的に更新されます。

### 主な特徴

- **自動的な変更検知**: 値の変更を自動で追跡し、UIを更新
- **深いリアクティビティ**: オブジェクトや配列の内部プロパティも追跡
- **TypeScript完全対応**: 型推論と型安全性を提供
- **シンプルな構文**: 特別なセッター関数不要で直接値を変更可能

## 基本的な使い方

### プリミティブ値

```typescript
let count = $state(0);
let message = $state('Hello');
let isActive = $state(false);

function increment() {
  count++; // 自動的にUIが更新される
}
```

### オブジェクト

```typescript
let user = $state({
  name: '太郎',
  age: 25,
  email: 'taro@example.com'
});

// プロパティの変更も追跡される
user.name = '次郎'; // UIが更新される
user.age++; // UIが更新される
```

### 配列

```typescript
let items = $state<string[]>([]);

// 配列メソッドも追跡される
items.push('新しいアイテム'); // UIが更新される
items.pop(); // UIが更新される
items[0] = '変更'; // UIが更新される
```

## 深いリアクティビティ

`$state`は深いリアクティビティを持ちます。ネストされたオブジェクトのプロパティも自動的に追跡されます。

```typescript
let data = $state({
  user: {
    profile: {
      name: '太郎',
      settings: {
        theme: 'dark',
        notifications: true
      }
    }
  }
});

// ネストされたプロパティの変更も追跡
data.user.profile.settings.theme = 'light'; // UIが更新される
```

## クラスでの使用

```typescript
class Counter {
  value = $state(0);
  
  increment() {
    this.value++;
  }
  
  decrement() {
    this.value--;
  }
  
  reset() {
    this.value = 0;
  }
}

let counter = new Counter();
```

## $state.raw

`$state.raw`は、深いリアクティビティを持たない状態を作成します。これは、大きなオブジェクトや頻繁に変更されないデータに対してパフォーマンスを最適化したい場合に有用です。

:::info[$state.rawの特徴]
- **浅いリアクティビティ**: トップレベルの値の変更のみを追跡
- **プロパティの変更は追跡されない**: オブジェクト内部のプロパティ変更は自動的にUIを更新しない
- **パフォーマンス最適化**: 深いリアクティビティのオーバーヘッドがない
- **初期化時のみ使用可能**: 変数宣言時にのみ使用でき、後から再代入で`$state.raw`を使うことはできない

通常の`$state`との違いは、オブジェクトのプロパティ変更が自動追跡されないことです。
:::

```typescript
// 初期化時に$state.rawを使用
let config = $state.raw({
  apiUrl: 'https://api.example.com',
  version: '1.0.0'
});

// プロパティの直接変更はUIを更新しない
config.apiUrl = 'https://new-api.example.com'; // UIは更新されない

// 新しいオブジェクトで置き換えるとUIが更新される
config = {
  apiUrl: 'https://new-api.example.com',
  version: '1.0.1'
}; // UIが更新される
```

### 使用場面

1. **大きなデータセット**: 深いリアクティビティが不要な大規模なオブジェクト
2. **パフォーマンス最適化**: 頻繁に変更されない設定データ
3. **外部ライブラリのデータ**: リアクティビティが不要な外部データ

```typescript
// 大きな設定オブジェクトの例（深いリアクティビティ不要）
let appConfig = $state.raw({
  theme: 'dark',
  language: 'ja',
  features: {
    notifications: true,
    autoSave: false
  }
});

// 設定全体を置き換える場合
function updateConfig(newConfig) {
  appConfig = newConfig; // 全体を置き換えるとUIが更新される
}

// 注意: プロパティの直接変更はUIを更新しない
// appConfig.theme = 'light'; // UIは更新されない
```

## $state.snapshot

リアクティブな値の現在のスナップショットを取得します。

```typescript
let todos = $state([
  { id: 1, text: '買い物', done: false },
  { id: 2, text: '掃除', done: true }
]);

// スナップショットを取得（非リアクティブなコピー）
let snapshot = $state.snapshot(todos);

// LocalStorageに保存
localStorage.setItem('todos', JSON.stringify(snapshot));
```

## 実践例：カウンターアプリ

シンプルなカウンターアプリで`$state`の基本動作を確認しましょう。

```svelte live ln title=Counter.svelte
<script lang="ts">
  // 基本的な$state
  let count = $state(0);
  
  // オブジェクトの$state
  let stats = $state({
    clicks: 0,
    lastClickTime: null as Date | null
  });
  
  // 設定オブジェクト（通常の$stateで管理し、直接変更を避ける）
  let config = $state({
    min: -10,
    max: 10,
    step: 1
  });
  
  function increment() {
    if (count < config.max) {
      count += config.step;
      stats.clicks++;
      stats.lastClickTime = new Date();
    }
  }
  
  function decrement() {
    if (count > config.min) {
      count -= config.step;
      stats.clicks++;
      stats.lastClickTime = new Date();
    }
  }
  
  function reset() {
    count = 0;
    stats = {
      clicks: 0,
      lastClickTime: null
    };
  }
  
  function changeStep() {
    // イミュータブルな更新パターン（新しいオブジェクトで置き換える）
    config = {
      ...config,
      step: config.step === 1 ? 2 : 1
    };
  }
</script>

<div class="counter-app">
  <h3>カウンター: {count}</h3>
  
  <div class="controls">
    <button onclick={decrement} disabled={count <= config.min}>
      -
    </button>
    <button onclick={reset}>
      リセット
    </button>
    <button onclick={increment} disabled={count >= config.max}>
      +
    </button>
  </div>
  
  <div class="stats">
    <p>クリック回数: {stats.clicks}</p>
    {#if stats.lastClickTime}
      <p>最終クリック: {stats.lastClickTime.toLocaleTimeString('ja-JP')}</p>
    {/if}
  </div>
  
  <div class="config">
    <p>範囲: {config.min} 〜 {config.max}</p>
    <p>ステップ: {config.step}</p>
    <button onclick={changeStep}>
      ステップ切り替え
    </button>
  </div>
</div>

<style>
  .counter-app {
    padding: 2rem;
    background: #f9f9f9;
    border-radius: 8px;
    max-width: 400px;
    margin: 0 auto;
  }
  
  h3 {
    text-align: center;
    color: #ff3e00;
    font-size: 2rem;
    margin-bottom: 1rem;
  }
  
  .controls {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-bottom: 1.5rem;
  }
  
  button {
    padding: 0.5rem 1rem;
    font-size: 1.2rem;
    background: #ff3e00;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.2s;
  }
  
  button:hover:not(:disabled) {
    background: #ff5a00;
  }
  
  button:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
  
  .stats, .config {
    background: white;
    padding: 1rem;
    border-radius: 4px;
    margin-bottom: 1rem;
  }
  
  .stats p, .config p {
    margin: 0.5rem 0;
    color: #666;
  }
  
  .config button {
    margin-top: 0.5rem;
    font-size: 0.9rem;
    padding: 0.3rem 0.8rem;
  }
</style>
```

## 実践例：TODOリスト

より実践的な例として、TODOリストアプリを実装してみましょう。

```svelte live ln title=TodoList.svelte
<script lang="ts">
  type Todo = {
    id: number;
    text: string;
    done: boolean;
    createdAt: Date;
  };
  
  // TODOリストの状態
  let todos = $state<Todo[]>([]);
  let newTodoText = $state('');
  let filter = $state<'all' | 'active' | 'completed'>('all');
  
  // フィルタリングされたTODO（$derivedとの組み合わせ例）
  let filteredTodos = $derived(
    filter === 'active' ? todos.filter(t => !t.done) :
    filter === 'completed' ? todos.filter(t => t.done) :
    todos
  );
  
  // 統計情報
  let stats = $derived({
    total: todos.length,
    completed: todos.filter(t => t.done).length,
    active: todos.filter(t => !t.done).length
  });
  
  function addTodo() {
    if (!newTodoText.trim()) return;
    
    todos = [...todos, {
      id: Date.now(),
      text: newTodoText,
      done: false,
      createdAt: new Date()
    }];
    
    newTodoText = '';
  }
  
  function toggleTodo(id: number) {
    todos = todos.map(todo =>
      todo.id === id ? { ...todo, done: !todo.done } : todo
    );
  }
  
  function deleteTodo(id: number) {
    todos = todos.filter(todo => todo.id !== id);
  }
  
  function clearCompleted() {
    todos = todos.filter(todo => !todo.done);
  }
</script>

<div class="todo-app">
  <h3>TODOリスト</h3>
  
  <div class="input-group">
    <input
      type="text"
      bind:value={newTodoText}
      placeholder="新しいTODOを入力..."
      onkeydown={(e) => e.key === 'Enter' && addTodo()}
    />
    <button onclick={addTodo}>追加</button>
  </div>
  
  <div class="filters">
    <button
      class:active={filter === 'all'}
      onclick={() => filter = 'all'}
    >
      全て ({stats.total})
    </button>
    <button
      class:active={filter === 'active'}
      onclick={() => filter = 'active'}
    >
      未完了 ({stats.active})
    </button>
    <button
      class:active={filter === 'completed'}
      onclick={() => filter = 'completed'}
    >
      完了 ({stats.completed})
    </button>
  </div>
  
  <ul class="todo-list">
    {#each filteredTodos as todo (todo.id)}
      <li class="todo-item" class:done={todo.done}>
        <input
          type="checkbox"
          checked={todo.done}
          onchange={() => toggleTodo(todo.id)}
        />
        <span class="todo-text">{todo.text}</span>
        <button class="delete-btn" onclick={() => deleteTodo(todo.id)}>
          ×
        </button>
      </li>
    {:else}
      <li class="empty">TODOがありません</li>
    {/each}
  </ul>
  
  {#if stats.completed > 0}
    <button class="clear-btn" onclick={clearCompleted}>
      完了済みを削除
    </button>
  {/if}
</div>

<style>
  .todo-app {
    padding: 2rem;
    background: #f9f9f9;
    border-radius: 8px;
    max-width: 500px;
    margin: 0 auto;
  }
  
  h3 {
    color: #ff3e00;
    margin-bottom: 1rem;
  }
  
  .input-group {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }
  
  input[type="text"] {
    flex: 1;
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
  }
  
  button {
    padding: 0.5rem 1rem;
    background: #ff3e00;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  button:hover {
    background: #ff5a00;
  }
  
  .filters {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }
  
  .filters button {
    background: #e9ecef;
    color: #333;
  }
  
  .filters button.active {
    background: #ff3e00;
    color: white;
  }
  
  .todo-list {
    list-style: none;
    padding: 0;
    margin: 0 0 1rem 0;
  }
  
  .todo-item {
    display: flex;
    align-items: center;
    padding: 0.75rem;
    background: white;
    margin-bottom: 0.5rem;
    border-radius: 4px;
  }
  
  .todo-item.done .todo-text {
    text-decoration: line-through;
    color: #999;
  }
  
  .todo-text {
    flex: 1;
    margin: 0 0.5rem;
  }
  
  .delete-btn {
    background: #dc3545;
    color: white;
    width: 30px;
    height: 30px;
    padding: 0;
    font-size: 1.5rem;
    line-height: 1;
  }
  
  .empty {
    text-align: center;
    color: #999;
    padding: 2rem;
  }
  
  .clear-btn {
    width: 100%;
  }
</style>
```

## ベストプラクティス

### 1. 型定義を明確に

```typescript
// ❌ 型推論に頼る
let items = $state([]);

// ✅ 明示的な型定義
let items = $state<Item[]>([]);
```

### 2. 初期値の設定

```typescript
// ❌ undefined から始める
let user = $state();

// ✅ 適切な初期値を設定
let user = $state<User | null>(null);
```

### 3. イミュータブルな更新

配列やオブジェクトを更新する際、新しいオブジェクトを作成することで予期しない副作用を防げます。

```typescript
// 配列の更新
let items = $state([1, 2, 3]);

// ミュータブルな更新（動作するが推奨されない）
items.push(4);

// イミュータブルな更新（推奨）
items = [...items, 4];

// オブジェクトの更新
let user = $state({ name: '太郎', age: 25 });

// イミュータブルな更新
user = { ...user, age: 26 };
```

## よくある間違い

### 1. 非リアクティブな値の変更

```typescript
// ❌ $stateを使わない
let count = 0;
count++; // UIは更新されない

// ✅ $stateを使う
let count = $state(0);
count++; // UIが更新される
```

### 2. リアクティビティの喪失

```typescript
let data = $state({ value: 10 });

// ❌ リアクティビティが失われる
let value = data.value;
value++; // data.valueは更新されない

// ✅ 参照を保持
data.value++; // 正しく更新される
```

## 技術的な詳細

`$state`がどのように動作するかをより深く理解したい場合は、以下のディープダイブ記事も参照してください。


:::info[RuneとProxyオブジェクト]
- [Svelte 5におけるProxyオブジェクトの活用](/deep-dive/leveraging-proxy-objects-in-svelte-5/) - `$state`の内部でProxyがどのように使われているか
- [$stateとProxyオブジェクト](/deep-dive/state-use-proxy-object/) - 実践的な例とパフォーマンス最適化
- [$state: リアクティブな状態変数と、バインディングの違い](/deep-dive/reactive-state-variables-vs-bindings/) - `$state`と`bind:`構文の違いを詳しく解説
- [$derived vs $effect vs derived.by 完全比較ガイド](/deep-dive/derived-vs-effect-vs-derived-by/) - Runesシステムの主要な3つの機能を徹底比較
:::

## 次のステップ

`$state`の基本を理解したら、[$derived - 計算値](/runes/derived/)で派生値の作成方法を学びましょう。

開発時のデバッグには[$inspect - デバッグツール](/runes/inspect/)が便利です。