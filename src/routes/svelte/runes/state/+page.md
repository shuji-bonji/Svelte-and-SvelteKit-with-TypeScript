---
title: $state - Svelte 5のリアクティブ状態管理をTypeScriptで完全理解
description: Svelte 5の$stateルーン完全ガイド - TypeScriptでの型安全な状態管理、配列・オブジェクトの操作、$state.raw/$state.snapshot、クラス統合、Reactとの比較を実践コードで解説
---

`$state`ルーンは、Svelte 5 でリアクティブな状態を作成するための基本的な方法です。値が変更されると、その値を使用している UI が自動的に更新されます。

## この記事で学べること

- `$state`の基本的な使い方と TypeScript 型推論
- オブジェクト・配列のリアクティブな操作方法（push、splice、直接代入）
- 深いリアクティビティによるネスト構造の自動追跡
- `$state.raw`でパフォーマンスを最適化する方法
- `$state.snapshot`で静的なコピーを取得する
- クラスと`$state`の統合パターン
- React `useState`との違いと移行のポイント

:::tip[React 開発者の方へ]
Svelte 5 の`$state`は React の`useState`と似ていますが、**配列やオブジェクトを直接変更できる**点が大きく異なります。`push`や`splice`、プロパティの直接代入がすべて UI の更新をトリガーするため、イミュータブルなパターンを強制されません。
:::

## 基本的な使い方

最もシンプルな`$state`の使い方から始めましょう。数値、文字列、ブール値などの基本的な値をリアクティブにする方法を紹介します。

### プリミティブ値

プリミティブ値（数値、文字列、ブール値など）は`$state`で包むだけで、値の変更が UI に自動反映されるリアクティブな変数になります。

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

:::tip[TypeScript の型推論]
`$state`は初期値から型を推論しますが、明示的に型を指定することもできます。

```typescript
let count = $state<number>(0);
let items = $state<string[]>([]);
```

:::

## オブジェクトと配列

`$state`は複雑なデータ構造もサポートします。オブジェクトや配列を丸ごとリアクティブにでき、プロパティの変更や配列の操作も自動的に追跡されます。

### オブジェクトの扱い

オブジェクト全体を`$state`で包むと、すべてのプロパティがリアクティブになります。深くネストされたプロパティの変更も自動的に検出されます。

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

配列も`$state`でリアクティブにできます。React と異なり、`push`、`splice`、インデックスアクセスなどの直接的な変更操作がすべて UI の更新をトリガーします。

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
Svelte 5 では、以下の配列メソッドがリアクティブです。

- `push()`, `pop()`, `shift()`, `unshift()`
- `splice()`, `sort()`, `reverse()`
- インデックスによる直接代入 `array[0] = value`

これは Vue 3 と似た挙動で、React と異なり配列を直接変更できます。
:::

## 深いリアクティビティ

`$state`の強力な特徴の一つは、深いリアクティビティです。複雑にネストされたデータ構造でも、どんなに深い階層の変更も自動的に検出して UI を更新します。
これにより、複雑な状態管理も簡潔に記述できます。

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

オブジェクト指向プログラミングを好む開発者のために、`$state`はクラスのプロパティとしても使用できます。
これにより、状態とメソッドを一つのクラスにカプセル化し、より構造化されたコードを書くことができます。

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

## $state.raw - Proxy を使わない状態管理

`$state.raw()`は、Proxy を経由せず、生のオブジェクトや配列をそのまま保持するための API です。**ミューテーション（直接変更）は検知されず、再代入のみがリアクティブ**になります。

### $state vs $state.raw の違い

| 項目             | `$state()`               | `$state.raw()`                                       |
| ---------------- | ------------------------ | ---------------------------------------------------- |
| リアクティビティ | 深い（Proxy 経由）       | 浅い（再代入のみ）                                   |
| ミューテーション | 検知される               | 検知されない                                         |
| 適用例           | 通常のフォームや状態管理 | 大きな配列、外部ライブラリ連携、パフォーマンス最適化 |
| 内部処理         | Proxy でラップ           | 生の値をそのまま保持                                 |

### $state.raw の使用例

```typescript
// $state.raw は再代入のみリアクティブ
let person = $state.raw({
	name: 'Heraclitus',
	age: 49,
});

// ❌ ミューテーションは効果なし（UIは更新されない）
person.age += 1;

// ✅ 再代入はリアクティブ（UIが更新される）
person = {
	name: 'Heraclitus',
	age: 50,
};
```

```svelte
<script lang="ts">
  // 大きな配列のパフォーマンス最適化
  let largeDataset = $state.raw<number[]>([]);

  async function loadData() {
    const response = await fetch('/api/large-data');
    const data = await response.json();
    // 再代入で更新
    largeDataset = data;
  }

  function addItem(item: number) {
    // 新しい配列を作成して再代入
    largeDataset = [...largeDataset, item];
  }
</script>
```

### いつ $state.raw を使うべきか

1. **大きな配列やオブジェクト** - Proxy のオーバーヘッドを避けたい場合
2. **イミュータブルなデータ** - 常に新しいオブジェクトを作成するパターン
3. **外部ライブラリ連携** - Proxy が問題を起こす可能性がある場合
4. **パフォーマンス最適化** - 深いリアクティビティが不要な場合

:::tip[通常は $state を使用]
ほとんどの場合、`$state()`で十分です。`$state.raw()`はパフォーマンスが重要な場面や、イミュータブルなデータパターンを使用する場合にのみ検討してください。
:::

## $state.snapshot - 静的なスナップショット

`$state.snapshot()`は、リアクティブな状態の静的なコピーを取得します。Proxy を剥がした純粋な JavaScript オブジェクトを返します。

```typescript
let counter = $state({ count: 0 });

// スナップショットを取得
const snapshot = $state.snapshot(counter);
// snapshot は { count: 0 } という純粋なオブジェクト

// 外部APIへの送信やログ出力に便利
console.log(JSON.stringify($state.snapshot(counter)));
await fetch('/api/save', {
	method: 'POST',
	body: JSON.stringify($state.snapshot(counter)),
});
```

:::warning[用途に注意]
`$state.snapshot()`は静的なコピーを返すため、返されたオブジェクトを変更しても UI は更新されません。デバッグやデータ送信時に使用してください。
:::

## $state.is - 参照の比較

`$state.is(a, b)`は、2 つの値が同じであるかを比較します。Proxy 経由でも正しく比較できます。

```typescript
let obj = $state({ name: 'Alice' });

// 通常の比較は Proxy のため false になることがある
console.log(obj === obj); // true（同じProxy参照）

// $state.is を使うと安全に比較
const copy = obj;
console.log($state.is(obj, copy)); // true
```

## 実践例：フォーム管理

実際のアプリケーションでよく使われるフォーム管理の例を見てみましょう。
`$state`を使えば、複雑なフォームの状態管理も、追加のライブラリなしにシンプルに実装できます。

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

  <fieldset class="form-group">
    <legend>興味のある分野:</legend>
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
  </fieldset>

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

  fieldset.form-group {
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 0.5rem 1rem;
  }

  legend {
    font-weight: bold;
    padding: 0 0.5rem;
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
    background: #555;
    border-radius: 4px;
  }

  pre {
    overflow-x: auto;
  }
</style>
```

## ベストプラクティス

`$state`を効果的に使用するためのベストプラクティスを紹介します。
これらのパターンを理解することで、より保守性の高いコードを書くことができます。

### 1. 適切な初期値の設定

`$state`は必ず初期値を指定する必要があります。TypeScript を使用する場合は、適切な型アノテーションも追加しましょう。

```typescript
// ✅ 良い例：明確な初期値
let user = $state<User | null>(null);
let items = $state<Item[]>([]);
let count = $state(0);

// ❌ 悪い例：undefined の暗黙的な使用
let user = $state(); // エラー：初期値が必要
```

### 2. 型定義の活用

複雑な状態を管理する場合は、インターフェースや型エイリアスを定義することで、コードの可読性と型安全性を向上させることができます。

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
	notifications: [],
});
```

### 3. イミュータブルな更新 vs ミュータブルな更新

Svelte 5 の大きな特徴の一つは、ミュータブルな更新を完全にサポートしていることです。
React や Redux と異なり、オブジェクトや配列を直接変更しても UI が正しく更新されます。

```typescript
// 初期状態の定義
let items = $state<string[]>(['item1', 'item2']);
let user = $state({ name: 'Alice', age: 30 });

// ミュータブルな更新（直接変更）- Svelteでは推奨
items.push('item3'); // 配列に直接追加
user.name = 'Bob'; // プロパティを直接変更
items[0] = 'updated'; // インデックスで直接変更

// イミュータブルな更新（新しいオブジェクト作成）- これも動作
items = [...items, 'item4']; // スプレッド構文で新配列
user = { ...user, name: 'Charlie' }; // スプレッド構文で新オブジェクト
items = items.filter((item) => item !== 'item1'); // フィルターで新配列
```

:::tip[どちらを使うべき？]
Svelte 5 では、ミュータブルな更新の方が簡潔で直感的です。React から移行してきた開発者は、最初はイミュータブルな更新を使いがちですが、Svelte ではミュータブルな更新を恐れる必要はありません。パフォーマンス的にも問題ありません。
:::

## Proxy による内部実装

Svelte 5 の`$state`は内部で Proxy を使用してリアクティビティを実現しています。

### Proxy の仕組み

Proxy は、オブジェクトへの操作を「横取り」して、カスタムの動作を定義できる JavaScript の機能です。

```typescript
// Proxyの基本的な動作
const target = { value: 0 };
const proxy = new Proxy(target, {
	get(target, property) {
		console.log(`読み取り: ${String(property)}`);
		return target[property];
	},
	set(target, property, value) {
		console.log(`書き込み: ${String(property)} = ${value}`);
		target[property] = value;
		// Svelteはここで依存する要素を更新
		return true;
	},
});

proxy.value; // "読み取り: value"
proxy.value = 10; // "書き込み: value = 10"
```

### Svelte が実現している機能

| 機能                     | Proxy の活用                            | 利点                 |
| ------------------------ | --------------------------------------- | -------------------- |
| **自然な文法**           | オブジェクト・配列の通常操作を検知      | 学習コストが低い     |
| **自動追跡**             | get トラップで依存関係を記録            | 明示的な宣言不要     |
| **深いリアクティビティ** | ネストされたオブジェクトも自動 Proxy 化 | 複雑な状態も簡単管理 |
| **破壊的メソッド対応**   | 配列の push/splice 等も検知             | 自然なコードが書ける |

### ビルトインクラスのリアクティブ化

Svelte 5 では、ネイティブのビルトインクラスも`$state()`でリアクティブになります。

```typescript
// Map - キーバリューストアがリアクティブに
let userPreferences = $state(new Map<string, string>());
userPreferences.set('theme', 'dark'); // UIが自動更新

// Set - 重複なしコレクションがリアクティブに
let selectedTags = $state(new Set<string>());
selectedTags.add('svelte'); // 追加を検知

// Date - 日時オブジェクトもリアクティブに
let deadline = $state(new Date());
deadline.setDate(deadline.getDate() + 7); // 1週間後に変更でUI更新

// URL - URL操作がリアクティブに
let apiUrl = $state(new URL('https://api.example.com'));
apiUrl.searchParams.set('page', '2'); // クエリパラメータ変更を検知
```

## まとめ

`$state`ルーンは、Svelte 5 の中核となる機能で、リアクティブな状態管理を直感的かつ強力に実現します。
主な特徴は以下の通りです。

- **明示的** - どの変数がリアクティブか明確
- **型安全** - TypeScript との優れた統合
- **深いリアクティビティ** - ネストされた構造も自動追跡
- **直感的** - JavaScript の通常の操作でリアクティブ

:::info[他のフレームワークとの比較]

- **React**: `useState`と似ているが、直接変更が可能
- **Vue 3**: `ref`/`reactive`と似た概念だが、より簡潔
- **Angular**: Signals と似ているが、より少ないボイラープレート
  :::

## 関連ドキュメント

### さらに深く理解する

- [📖 リアクティブな状態変数とバインディングの違い](/deep-dive/reactive-state-variables-vs-bindings/) - $stateと$bindable の使い分け
- [🔬 素の JavaScript 構文でリアクティビティを実現](/deep-dive/reactivity-with-plain-javascript-syntax/) - Object.defineProperty と Proxy を使ったリアクティビティの内部実装を理解

## よくある質問（FAQ）

### React useState との違いは？

| 項目             | React `useState`                        | Svelte 5 `$state`           |
| ---------------- | --------------------------------------- | --------------------------- |
| 宣言方法         | `const [count, setCount] = useState(0)` | `let count = $state(0)`     |
| 更新方法         | `setCount(count + 1)`                   | `count++`                   |
| 配列への追加     | `setItems([...items, newItem])`         | `items.push(newItem)`       |
| オブジェクト更新 | `setUser({...user, name: 'new'})`       | `user.name = 'new'`         |
| 再レンダリング   | setter 呼び出し時                       | 値の変更時（自動検知）      |
| イミュータブル   | **必須**                                | **任意**（ミュータブル OK） |

### 配列操作の比較：React vs Svelte 5

```typescript
// === React の配列操作（イミュータブル必須） ===
const [items, setItems] = useState<string[]>([]);

// 追加 - 新しい配列を作成
setItems([...items, 'new item']);
setItems((prev) => [...prev, 'new item']);

// 削除 - filterで新しい配列
setItems(items.filter((_, i) => i !== index));

// 更新 - mapで新しい配列
setItems(items.map((item, i) => (i === index ? 'updated' : item)));

// === Svelte 5 の配列操作（ミュータブルOK） ===
let items = $state<string[]>([]);

// 追加 - 直接push
items.push('new item');

// 削除 - 直接splice
items.splice(index, 1);

// 更新 - インデックスで直接代入
items[index] = 'updated';
```

### オブジェクト操作の比較：React vs Svelte 5

```typescript
// === React のオブジェクト操作（イミュータブル必須） ===
const [user, setUser] = useState({ name: 'Alice', age: 30 });

// プロパティ更新 - スプレッド構文
setUser({ ...user, name: 'Bob' });

// ネストされたオブジェクト - 深いスプレッド
setUser({
	...user,
	address: {
		...user.address,
		city: 'Tokyo',
	},
});

// === Svelte 5 のオブジェクト操作（ミュータブルOK） ===
let user = $state({ name: 'Alice', age: 30 });

// プロパティ更新 - 直接代入
user.name = 'Bob';

// ネストされたオブジェクト - 直接代入
user.address.city = 'Tokyo';
```

### $state.raw はいつ使うべき？

| シナリオ                | 推奨         | 理由                       |
| ----------------------- | ------------ | -------------------------- |
| 通常のフォーム          | `$state`     | 深いリアクティビティが便利 |
| 小〜中規模の配列        | `$state`     | パフォーマンス影響は軽微   |
| 大量データ（1000 件超） | `$state.raw` | Proxy オーバーヘッド削減   |
| 外部ライブラリ連携      | `$state.raw` | Proxy が問題を起こす可能性 |
| イミュータブルパターン  | `$state.raw` | 常に再代入するなら最適     |

### 配列のリアクティブなメソッド一覧

Svelte 5 で自動的に UI を更新するメソッド

| メソッド    | 説明             | 例                       |
| ----------- | ---------------- | ------------------------ |
| `push()`    | 末尾に追加       | `items.push('new')`      |
| `pop()`     | 末尾を削除       | `items.pop()`            |
| `shift()`   | 先頭を削除       | `items.shift()`          |
| `unshift()` | 先頭に追加       | `items.unshift('first')` |
| `splice()`  | 要素の削除/追加  | `items.splice(1, 1)`     |
| `sort()`    | ソート           | `items.sort()`           |
| `reverse()` | 反転             | `items.reverse()`        |
| `[index] =` | インデックス代入 | `items[0] = 'updated'`   |

## 次のステップ

`$state`の基本を理解したら、次は派生値の作成方法を学びましょう。
[$derived - 派生値](/svelte/runes/derived/)では、`$state`から自動的に計算される値の作成方法を詳しく解説します。
