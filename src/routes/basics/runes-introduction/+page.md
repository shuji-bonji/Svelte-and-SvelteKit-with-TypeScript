---
title: Runesシステム入門
description: Svelte 5の新しいリアクティビティシステム
---

## Runesとは

Runesは、Svelte 5で導入された新しいリアクティビティシステムです。より明示的で予測可能な状態管理を実現します。

## 主要なRunes

### 状態管理
- **$state** - リアクティブな状態を定義
- **$derived** - 他の値から導出される値
- **$effect** - 副作用の実行

### コンポーネント間通信
- **$props** - コンポーネントのプロパティ
- **$bindable** - 双方向バインディング

## 基本的な使い方

### $state - 状態の定義

```typescript
<script lang="ts">
  // プリミティブ値
  let count = $state(0);
  
  // オブジェクト
  let user = $state({
    name: '太郎',
    age: 25
  });
  
  // 配列
  let items = $state<string[]>([]);
</script>

<button onclick={() => count++}>
  カウント: {count}
</button>
```

### $derived - 計算値

```typescript
<script lang="ts">
  let price = $state(100);
  let quantity = $state(2);
  
  // priceやquantityが変更されると自動的に再計算
  let total = $derived(price * quantity);
  
  // 複雑な計算も可能
  let summary = $derived(() => {
    const subtotal = price * quantity;
    const tax = subtotal * 0.1;
    return {
      subtotal,
      tax,
      total: subtotal + tax
    };
  });
</script>

<p>合計: {total}円</p>
<p>税込: {summary.total}円</p>
```

### $effect - 副作用

```typescript
<script lang="ts">
  let count = $state(0);
  
  // countが変更されるたびに実行
  $effect(() => {
    console.log(`カウント: ${count}`);
    document.title = `カウント: ${count}`;
    
    // クリーンアップ関数（オプション）
    return () => {
      console.log('クリーンアップ');
    };
  });
</script>
```

## Svelte 4との違い

### 古い書き方（Svelte 4）

```svelte
<script>
  let count = 0;
  $: doubled = count * 2;
  
  $: {
    console.log(`Count: ${count}`);
  }
</script>
```

### 新しい書き方（Svelte 5）

```svelte
<script lang="ts">
  let count = $state(0);
  let doubled = $derived(count * 2);
  
  $effect(() => {
    console.log(`Count: ${count}`);
  });
</script>
```

## なぜRunesを使うのか

### 1. 明示的なリアクティビティ

```typescript
// 一目でリアクティブな値とわかる
let count = $state(0);
let normalValue = 0; // 通常の変数
```

### 2. TypeScriptとの相性

```typescript
let items = $state<Item[]>([]);
let selected = $derived(() => 
  items.filter(item => item.selected)
);
```

### 3. 予測可能な動作

依存関係が自動的に追跡され、必要な時だけ再実行されます。

## 実践例：TODOリスト

```typescript
<script lang="ts">
  type Todo = {
    id: string;
    text: string;
    done: boolean;
  };
  
  let todos = $state<Todo[]>([]);
  let newTodoText = $state('');
  
  // 完了していないTODOの数
  let remainingCount = $derived(
    todos.filter(t => !t.done).length
  );
  
  // 完了率
  let completionRate = $derived(() => {
    if (todos.length === 0) return 0;
    const completed = todos.filter(t => t.done).length;
    return Math.round((completed / todos.length) * 100);
  });
  
  function addTodo() {
    if (!newTodoText.trim()) return;
    
    todos.push({
      id: crypto.randomUUID(),
      text: newTodoText,
      done: false
    });
    
    newTodoText = '';
  }
  
  function toggleTodo(id: string) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
      todo.done = !todo.done;
    }
  }
</script>

<div>
  <input 
    bind:value={newTodoText}
    on:keydown={(e) => e.key === 'Enter' && addTodo()}
    placeholder="新しいTODOを入力"
  />
  <button onclick={addTodo}>追加</button>
  
  <ul>
    {#each todos as todo}
      <li>
        <input
          type="checkbox"
          checked={todo.done}
          onchange={() => toggleTodo(todo.id)}
        />
        <span class:done={todo.done}>
          {todo.text}
        </span>
      </li>
    {/each}
  </ul>
  
  <p>残り: {remainingCount}個</p>
  <p>完了率: {completionRate}%</p>
</div>

<style>
  .done {
    text-decoration: line-through;
    opacity: 0.5;
  }
</style>
```

## ベストプラクティス

### 1. 初期値の型を明示

```typescript
// ❌ 型推論に頼る
let items = $state([]);

// ✅ 明示的な型定義
let items = $state<Item[]>([]);
```

### 2. $derivedは純粋に

```typescript
// ❌ 副作用を含む
let value = $derived(() => {
  localStorage.setItem('key', 'value'); // 副作用
  return calculateValue();
});

// ✅ 純粋な計算のみ
let value = $derived(calculateValue());

// 副作用は$effectで
$effect(() => {
  localStorage.setItem('key', value);
});
```

### 3. クリーンアップを忘れずに

```typescript
$effect(() => {
  const timer = setInterval(() => {
    console.log('tick');
  }, 1000);
  
  // クリーンアップ関数を返す
  return () => {
    clearInterval(timer);
  };
});
```

## 次のステップ

各Runeの詳細な使い方を学びましょう：

1. [$state - 状態管理](/basics/state/)
2. [$derived - 計算値](/basics/derived/)
3. [$effect - 副作用](/basics/effect/)
4. [$props - プロパティ](/basics/props/)
5. [$bindable - 双方向バインディング](/basics/bindable/)