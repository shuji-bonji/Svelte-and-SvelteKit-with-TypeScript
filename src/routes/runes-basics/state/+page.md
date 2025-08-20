---
title: $state - リアクティブな状態
description: Svelte 5のRunesシステムにおける状態管理の基礎
---

`$state`ルーンは、Svelte 5でリアクティブな状態を作成するための基本的な方法です。値が変更されると、その値を使用しているUIが自動的に更新されます。

## 基本的な使い方

### プリミティブ値

:::tip[コード表記]
`Click fold/expand code`をクリックすると実行コードを確認できます。
:::

```svelte live
<script lang="ts">
  // 数値
  let count = $state(0); // 初期値 `0`
  
  // 文字列
  let message = $state('Hello'); // 初期値 `Hello`
  
  // ブール値
  let isActive = $state(false); // 初期値 `false`
  
  // null/undefined
  let data = $state<string | null>(null);
</script>

<button onclick={() => count++}>
  カウント: {count}
</button>

<input bind:value={message} />
<p>{message}</p>

<label>
  <input type="checkbox" bind:checked={isActive} />
  アクティブ: {isActive}
</label>
```

:::tip[TypeScriptの型推論]
`$state`は初期値から型を推論しますが、明示的に型を指定することもできます：
```typescript
let count = $state<number>(0);
let items = $state<string[]>([]);
```
:::

## オブジェクトと配列

### オブジェクトの扱い

```svelte live
<script lang="ts">
  interface User {
    name: string;
    age: number;
    email: string;
  }
  
  // オブジェクト全体がリアクティブ
  let user = $state<User>({
    name: '太郎',
    age: 25,
    email: 'taro@example.com'
  });
  
  // プロパティの更新
  function updateName(newName: string) {
    user.name = newName; // UIが自動更新される
  }
  
  // オブジェクト全体の置き換え
  function resetUser() {
    user = {
      name: '新しいユーザー',
      age: 0,
      email: ''
    };
  }
</script>

<input bind:value={user.name} />
<input type="number" bind:value={user.age} />
<input type="email" bind:value={user.email} />

<p>名前: {user.name}</p>
<p>年齢: {user.age}</p>
<p>メール: {user.email}</p>
```

### 配列の扱い

```svelte live
<script lang="ts">
  // 配列もリアクティブ
  let todos = $state<string[]>([
    'Svelte 5を学ぶ',
    'Runesを理解する'
  ]);
  
  let newTodo = $state('');
  
  // 配列への追加
  function addTodo() {
    if (newTodo.trim()) {
      todos.push(newTodo); // pushでもリアクティブ
      newTodo = '';
    }
  }
  
  // 配列からの削除
  function removeTodo(index: number) {
    todos.splice(index, 1); // spliceでもリアクティブ
  }
  
  // 配列の更新
  function updateTodo(index: number, value: string) {
    todos[index] = value; // インデックスアクセスでもリアクティブ
  }
</script>

<input bind:value={newTodo} placeholder="新しいTODO" />
<button onclick={addTodo}>追加</button>

<ul>
  {#each todos as todo, index}
    <li>
      <input
        value={todo}
        oninput={(e) => updateTodo(index, e.currentTarget.value)}
      />
      <button onclick={() => removeTodo(index)}>削除</button>
    </li>
  {/each}
</ul>
<p>{todos}</p>
```

:::info[配列メソッドのリアクティビティ]
Svelte 5では、以下の配列メソッドがリアクティブです：
- `push()`, `pop()`, `shift()`, `unshift()`
- `splice()`, `sort()`, `reverse()`
- インデックスによる直接代入 `array[0] = value`

これはVue 3と似た挙動で、React と異なり配列を直接変更できます。
:::

## 深いリアクティビティ

`$state`は深いリアクティビティを提供します。ネストされたオブジェクトや配列も自動的にリアクティブになります。

```svelte
<script lang="ts">
  interface TodoItem {
    id: number;
    text: string;
    completed: boolean;
    tags: string[];
  }
  
  interface TodoList {
    title: string;
    items: TodoItem[];
    metadata: {
      createdAt: Date;
      updatedAt: Date;
      author: {
        name: string;
        email: string;
      };
    };
  }
  
  let todoList = $state<TodoList>({
    title: 'プロジェクトタスク',
    items: [
      {
        id: 1,
        text: '設計書作成',
        completed: false,
        tags: ['重要', '急ぎ']
      }
    ],
    metadata: {
      createdAt: new Date(),
      updatedAt: new Date(),
      author: {
        name: '山田太郎',
        email: 'yamada@example.com'
      }
    }
  });
  
  // 深くネストされたプロパティの更新もリアクティブ
  function updateAuthorName(name: string) {
    todoList.metadata.author.name = name; // UIが更新される
  }
  
  function addTag(itemId: number, tag: string) {
    const item = todoList.items.find(i => i.id === itemId);
    if (item) {
      item.tags.push(tag); // 深いレベルの配列操作もリアクティブ
    }
  }
</script>
```

## クラスとの統合

`$state`はクラスのプロパティとしても使用できます。

```svelte live
<script lang="ts">
  class Counter {
    // クラスプロパティとして$state
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
</script>

<div>
  <p>カウント: {counter.value}</p>
  <button onclick={() => counter.increment()}>+</button>
  <button onclick={() => counter.decrement()}>-</button>
  <button onclick={() => counter.reset()}>リセット</button>
</div>
```

## $state.raw - 浅いリアクティビティ

パフォーマンスが重要な場合、`$state.raw`を使用して浅いリアクティビティのみを適用できます。

```svelte
<script lang="ts">
  // 浅いリアクティビティ（第一階層のみ）
  let shallowState = $state.raw({
    level1: {
      level2: {
        value: 'deep value'
      }
    }
  });
  
  // これはリアクティブ
  shallowState.level1 = { level2: { value: 'new' } };
  
  // これはリアクティブではない（深いプロパティ）
  shallowState.level1.level2.value = 'updated'; // UIは更新されない
</script>
```

:::warning[`$state.raw`の使用注意]
`$state.raw`は大きなデータ構造でパフォーマンスを最適化する場合にのみ使用してください。通常は`$state`の深いリアクティビティが便利で十分です。
:::

## 実践例：フォーム管理

```svelte live ln title=FormExample.svelte
<script lang="ts">
  interface FormData {
    username: string;
    email: string;
    age: number;
    country: string;
    newsletter: boolean;
    interests: string[];
  }
  
  let formData = $state<FormData>({
    username: '',
    email: '',
    age: 0,
    country: 'japan',
    newsletter: false,
    interests: []
  });
  
  let availableInterests = ['プログラミング', 'デザイン', 'マーケティング', 'セールス'];
  
  function toggleInterest(interest: string) {
    const index = formData.interests.indexOf(interest);
    if (index > -1) {
      formData.interests.splice(index, 1);
    } else {
      formData.interests.push(interest);
    }
  }
  
  function submitForm() {
    console.log('送信データ:', formData);
    alert('フォームが送信されました！\n' + JSON.stringify(formData, null, 2));
  }
  
  function resetForm() {
    formData = {
      username: '',
      email: '',
      age: 0,
      country: 'japan',
      newsletter: false,
      interests: []
    };
  }
</script>

<div class="form-container">
  <h2>ユーザー登録フォーム</h2>
  
  <div class="form-group">
    <label for="username">ユーザー名:</label>
    <input
      id="username"
      type="text"
      bind:value={formData.username}
      placeholder="山田太郎"
    />
  </div>
  
  <div class="form-group">
    <label for="email">メールアドレス:</label>
    <input
      id="email"
      type="email"
      bind:value={formData.email}
      placeholder="email@example.com"
    />
  </div>
  
  <div class="form-group">
    <label for="age">年齢:</label>
    <input
      id="age"
      type="number"
      bind:value={formData.age}
      min="0"
      max="120"
    />
  </div>
  
  <div class="form-group">
    <label for="country">国:</label>
    <select id="country" bind:value={formData.country}>
      <option value="japan">日本</option>
      <option value="usa">アメリカ</option>
      <option value="uk">イギリス</option>
      <option value="other">その他</option>
    </select>
  </div>
  
  <div class="form-group">
    <label>
      <input
        type="checkbox"
        bind:checked={formData.newsletter}
      />
      ニュースレターを受け取る
    </label>
  </div>
  
  <div class="form-group">
    <label>興味のある分野:</label>
    <div class="checkbox-group">
      {#each availableInterests as interest}
        <label>
          <input
            type="checkbox"
            checked={formData.interests.includes(interest)}
            onchange={() => toggleInterest(interest)}
          />
          {interest}
        </label>
      {/each}
    </div>
  </div>
  
  <div class="form-actions">
    <button onclick={submitForm}>送信</button>
    <button onclick={resetForm}>リセット</button>
  </div>
  
  <div class="preview">
    <h3>プレビュー:</h3>
    <pre>{JSON.stringify(formData, null, 2)}</pre>
  </div>
</div>

<style>
  .form-container {
    max-width: 500px;
    margin: 0 auto;
    padding: 1rem;
  }
  
  .form-group {
    margin-bottom: 1rem;
  }
  
  label {
    display: block;
    margin-bottom: 0.25rem;
    font-weight: bold;
  }
  
  input[type="text"],
  input[type="email"],
  input[type="number"],
  select {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  
  .checkbox-group label {
    display: inline-block;
    margin-right: 1rem;
    font-weight: normal;
  }
  
  .form-actions {
    display: flex;
    gap: 1rem;
    margin-top: 1.5rem;
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
  
  .preview {
    margin-top: 2rem;
    padding: 1rem;
    background: #f5f5f5;
    border-radius: 4px;
  }
  
  pre {
    overflow-x: auto;
  }
</style>
```

## ベストプラクティス

### 1. 適切な初期値の設定

```typescript
// ✅ 良い例：明確な初期値
let user = $state<User | null>(null);
let items = $state<Item[]>([]);
let count = $state(0);

// ❌ 悪い例：undefined の暗黙的な使用
let user = $state(); // エラー：初期値が必要
```

### 2. 型定義の活用

```typescript
// ✅ 良い例：インターフェースの定義
interface AppState {
  user: User | null;
  settings: Settings;
  notifications: Notification[];
}

let appState = $state<AppState>({
  user: null,
  settings: defaultSettings,
  notifications: []
});
```

### 3. イミュータブルな更新 vs ミュータブルな更新

Svelte 5の`$state`は、ReactやReduxと異なり、直接変更（ミュータブル）と新しいオブジェクト作成（イミュータブル）の両方をサポートします。

```typescript
// 初期状態の定義
let items = $state<string[]>(['item1', 'item2']);
let user = $state({ name: 'Alice', age: 30 });

// ミュータブルな更新（直接変更）- Svelteでは推奨
items.push('item3');                  // 配列に直接追加
user.name = 'Bob';                     // プロパティを直接変更
items[0] = 'updated';                  // インデックスで直接変更

// イミュータブルな更新（新しいオブジェクト作成）- これも動作
items = [...items, 'item4'];          // スプレッド構文で新配列
user = { ...user, name: 'Charlie' };  // スプレッド構文で新オブジェクト
items = items.filter(item => item !== 'item1'); // フィルターで新配列
```

:::tip[どちらを使うべき？]
Svelte 5では、ミュータブルな更新の方が簡潔で直感的です。Reactから移行してきた開発者は、最初はイミュータブルな更新を使いがちですが、Svelteではミュータブルな更新を恐れる必要はありません。パフォーマンス的にも問題ありません。
:::

## まとめ

`$state`ルーンは、

- **明示的** - どの変数がリアクティブか明確
- **型安全** - TypeScriptとの優れた統合
- **深いリアクティビティ** - ネストされた構造も自動追跡
- **直感的** - JavaScript の通常の操作でリアクティブ

:::info[他のフレームワークとの比較]
- **React**: `useState`と似ているが、直接変更が可能
- **Vue 3**: `ref`/`reactive`と似た概念だが、より簡潔
- **Angular**: Signalsと似ているが、より少ないボイラープレート
:::

## 次のステップ

[$derived - 派生値](/runes-basics/derived/)では、`$state`から計算される値の作成方法を学びます。