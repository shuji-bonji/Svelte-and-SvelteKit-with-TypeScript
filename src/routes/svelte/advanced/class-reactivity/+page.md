---
title: クラスとリアクティビティ
description: Svelte5のクラスとリアクティビティをTypeScriptで実装 - $stateプロパティ、メソッド、ゲッター/セッター、継承、プライベートフィールド、static、OOPパターンの使い方を実例を交えて実践的に詳しく解説します
---


<script>
	import { base } from '$app/paths';
	import Admonition from '$lib/components/Admonition.svelte';
</script>
Svelte 5では、クラスとRunesシステムを組み合わせることで、オブジェクト指向プログラミングの利点とリアクティビティを融合させた強力なパターンを実現できます。

このページでは、クラスベースのリアクティビティパターンについて詳しく解説します。関数ベースのアプローチについては、[リアクティブストア](/svelte/advanced/reactive-stores/)のページで、`.svelte.js`/`.svelte.ts`ファイルを使った再利用可能なリアクティブロジックの作成方法を解説しています。

## なぜクラスを使うのか

### クラスベース設計の利点

1. **カプセル化** - データとメソッドを1つの単位にまとめる
2. **再利用性** - 継承やコンポジションによる効率的なコード再利用
3. **型安全性** - TypeScriptとの親和性が高く、強力な型推論
4. **保守性** - 明確な構造により、大規模アプリケーションでも管理しやすい
5. **テスタビリティ** - 単体テストが書きやすい

<Admonition type="tip" title="React/Vue経験者向け">
ReactのクラスコンポーネントやVueのクラススタイルコンポーネントとは異なり、Svelte 5のクラスは純粋なJavaScript/TypeScriptクラスです。`$state`ルーンにより、クラスのプロパティが自動的にリアクティブになります。
</Admonition>
## クラスでのリアクティビティ

### 基本的なリアクティブクラス

クラスのプロパティに`$state`を使用することで、リアクティブなクラスを作成できます。`$state`でマークされたプロパティは、変更時に自動的にUIを更新します。

```typescript
// todo.svelte.ts
export class TodoItem {
  // リアクティブなプロパティ
  text = $state('');
  done = $state(false);
  createdAt = $state(new Date());
  
  constructor(text: string) {
    this.text = text;
  }
  
  // メソッドでプロパティを変更
  toggle() {
    this.done = !this.done;
  }
  
  // 派生値をgetterで定義
  get age() {
    const now = new Date();
    const diff = now.getTime() - this.createdAt.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24)); // 日数
  }
}
```

このクラスでは

- `text`、`done`、`createdAt`が`$state`によってリアクティブなプロパティになっています
- `toggle()`メソッドで`done`プロパティを変更すると、UIが自動的に更新されます
- `get age()`は通常のgetterですが、`createdAt`の値に基づいて計算されます

#### 使用例

```svelte
<script lang="ts">
  import { TodoItem } from './todo.svelte';
  
  let todos = $state<TodoItem[]>([
    new TodoItem('Svelte 5を学ぶ'),
    new TodoItem('リアクティブクラスを理解する')
  ]);
  
  function addTodo(text: string) {
    todos.push(new TodoItem(text));
  }
</script>

<ul>
  {#each todos as todo}
    <li>
      <input type="checkbox" bind:checked=&#123;todo.done&#125; />
      <span class:completed=&#123;todo.done&#125;>&#123;todo.text&#125;</span>
      <small>(&#123;todo.age&#125;日前)</small>
    </li>
  {/each}
</ul>

<style>
  .completed {
    text-decoration: line-through;
    opacity: 0.6;
  }
</style>
```

## 高度なクラスパターン

### 派生値とエフェクトを持つクラス

クラス内で`$derived`は使用できませんが、getterを使用して派生値を実現できます。また、コンストラクタやメソッド内で`$effect`を使用して副作用を管理できます。

```typescript
// user.svelte.ts
export class User {
  firstName = $state('');
  lastName = $state('');
  email = $state('');
  
  // 派生値：フルネーム
  get fullName() {
    return `${this.firstName} ${this.lastName}`.trim();
  }
  
  // 派生値：バリデーション
  get isValid() {
    return this.firstName.length > 0 && 
           this.lastName.length > 0 && 
           this.email.includes('@');
  }
  
  constructor(firstName: string, lastName: string, email: string) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    
    // エフェクト：変更を監視
    $effect(() => {
      console.log(`User updated: ${this.fullName}`);
    });
  }
  
  updateName(first: string, last: string) {
    this.firstName = first;
    this.lastName = last;
  }
}
```

<Admonition type="info" title="getterの特徴">
<ul>
<li>getterは毎回呼び出される際に再計算されます</li>
<li>依存する<code>$state</code>プロパティが変更されると、getterを使用している箇所が自動的に再レンダリングされます</li>
<li>複雑な計算の場合は、メモ化を検討してください</li>
</ul>

</Admonition>
### ネストされたリアクティビティ

複数のクラスを組み合わせて、階層的なリアクティブ構造を作成できます。

```typescript
// shopping-cart.svelte.ts
export class CartItem {
  product = $state<Product>();
  quantity = $state(1);
  
  constructor(product: Product) {
    this.product = product;
  }
  
  get subtotal() {
    return this.product.price * this.quantity;
  }
  
  increment() {
    this.quantity++;
  }
  
  decrement() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }
}

export class ShoppingCart {
  items = $state<CartItem[]>([]);
  discountPercent = $state(0);
  
  // 派生値：合計金額
  get subtotal() {
    return this.items.reduce((sum, item) => sum + item.subtotal, 0);
  }
  
  // 派生値：割引額
  get discountAmount() {
    return this.subtotal * (this.discountPercent / 100);
  }
  
  // 派生値：最終金額
  get total() {
    return this.subtotal - this.discountAmount;
  }
  
  addItem(product: Product) {
    const existing = this.items.find(i => i.product.id === product.id);
    if (existing) {
      existing.increment();
    } else {
      this.items.push(new CartItem(product));
    }
  }
  
  removeItem(productId: string) {
    const index = this.items.findIndex(i => i.product.id === productId);
    if (index !== -1) {
      this.items.splice(index, 1);
    }
  }
  
  applyDiscount(percent: number) {
    this.discountPercent = Math.min(100, Math.max(0, percent));
  }
  
  clear() {
    this.items = [];
    this.discountPercent = 0;
  }
}
```

このショッピングカートの例では

- `CartItem`クラスが個々の商品アイテムを管理
- `ShoppingCart`クラスが複数の`CartItem`を管理
- 各getterは依存するプロパティの変更を自動的に反映
- ネストされたオブジェクトの変更も適切に追跡されます

## 継承とコンポジション

### クラス継承でのリアクティビティ

基底クラスで定義した`$state`プロパティは、派生クラスでもリアクティブ性を保持します。

```typescript
// base-model.svelte.ts
export abstract class BaseModel {
  id = $state(crypto.randomUUID());
  createdAt = $state(new Date());
  updatedAt = $state(new Date());
  
  protected updateTimestamp() {
    this.updatedAt = new Date();
  }
}

// task.svelte.ts
export class Task extends BaseModel {
  title = $state('');
  description = $state('');
  completed = $state(false);
  priority = $state<'low' | 'medium' | 'high'>('medium');
  
  constructor(title: string, description: string = '') {
    super();
    this.title = title;
    this.description = description;
  }
  
  complete() {
    this.completed = true;
    this.updateTimestamp();
  }
  
  setPriority(priority: 'low' | 'medium' | 'high') {
    this.priority = priority;
    this.updateTimestamp();
  }
  
  // 派生値：緊急度スコア
  get urgencyScore() {
    const priorityScore = {
      low: 1,
      medium: 2,
      high: 3
    };
    
    const age = Date.now() - this.createdAt.getTime();
    const daysSinceCreated = age / (1000 * 60 * 60 * 24);
    
    return priorityScore[this.priority] * (1 + daysSinceCreated * 0.1);
  }
}
```

<Admonition type="warning" title="継承の注意点">
<ul>
<li>基底クラスの<code>$state</code>プロパティは自動的に継承されます</li>
<li><code>super()</code>を呼ぶ前に<code>$state</code>を使用することはできません</li>
<li>深い継承階層は避け、コンポジションを優先することを推奨します</li>
</ul>

</Admonition>
### コンポジションパターン

コンポジションを使用して、再利用可能な機能を組み合わせることができます。

```typescript
// validation.svelte.ts
export class Validator<T> {
  value = $state<T>();
  errors = $state<string[]>([]);
  validators: Array<(value: T) => string | null> = [];
  
  constructor(initialValue: T, validators: Array<(value: T) => string | null> = []) {
    this.value = initialValue;
    this.validators = validators;
    
    // 値が変更されたら自動的にバリデーション
    $effect(() => {
      this.validate();
    });
  }
  
  validate() {
    this.errors = [];
    for (const validator of this.validators) {
      const error = validator(this.value);
      if (error) {
        this.errors.push(error);
      }
    }
  }
  
  get isValid() {
    return this.errors.length === 0;
  }
  
  setValue(newValue: T) {
    this.value = newValue;
  }
}

// form.svelte.ts
export class FormField {
  name: string;
  validator: Validator<string>;
  
  constructor(name: string, initialValue: string = '', validators: Array<(value: string) => string | null> = []) {
    this.name = name;
    this.validator = new Validator(initialValue, validators);
  }
  
  get value() {
    return this.validator.value;
  }
  
  set value(v: string) {
    this.validator.setValue(v);
  }
  
  get errors() {
    return this.validator.errors;
  }
  
  get isValid() {
    return this.validator.isValid;
  }
}

// バリデータ関数
export const required = (value: string) => 
  value.trim() === '' ? '必須項目です' : null;

export const minLength = (min: number) => (value: string) =>
  value.length < min ? `${min}文字以上入力してください` : null;

export const email = (value: string) =>
  !value.includes('@') ? '有効なメールアドレスを入力してください' : null;
```

このバリデーションパターンでは

- `Validator`クラスが汎用的なバリデーション機能を提供
- `FormField`クラスが`Validator`を内部で使用（コンポジション）
- バリデータ関数を組み合わせて柔軟な検証ルールを構築
- 値の変更時に自動的にバリデーションが実行されます

## リアクティブコレクション

### カスタムコレクションクラス

標準的なコレクション操作にリアクティビティを追加したカスタムクラスを作成できます。

<Admonition type="tip" title="関数ベースの実装">
コレクションの管理を関数ベースで行う場合は、[リアクティブストア](/svelte/advanced/reactive-stores/)でファクトリー関数を使った実装方法も利用できます。クラスベースと関数ベース、それぞれのアプローチには利点があるので、プロジェクトのニーズに合わせて選択してください。
</Admonition>

```typescript
// reactive-list.svelte.ts
export class ReactiveList<T> {
  private items = $state<T[]>([]);
  private filter = $state<(item: T) => boolean>(() => true);
  private sortFn = $state<(a: T, b: T) => number>(() => 0);
  
  // 派生値：フィルタリング・ソート済みリスト
  get filtered() {
    return this.items
      .filter(this.filter)
      .sort(this.sortFn);
  }
  
  get length() {
    return this.items.length;
  }
  
  get filteredLength() {
    return this.filtered.length;
  }
  
  add(item: T) {
    this.items.push(item);
  }
  
  remove(index: number) {
    this.items.splice(index, 1);
  }
  
  update(index: number, item: T) {
    this.items[index] = item;
  }
  
  setFilter(fn: (item: T) => boolean) {
    this.filter = fn;
  }
  
  setSort(fn: (a: T, b: T) => number) {
    this.sortFn = fn;
  }
  
  clear() {
    this.items = [];
  }
  
  // イテレータープロトコル
  *[Symbol.iterator]() {
    for (const item of this.filtered) {
      yield item;
    }
  }
}
```

<Admonition type="tip" title="イテレータープロトコル">
`Symbol.iterator`を実装することで、`for...of`ループやスプレッド演算子（`...`）で使用できるようになります。
</Admonition>
## パフォーマンス最適化

### 遅延初期化とメモ化

重い計算を含む処理では、メモ化を使用してパフォーマンスを最適化できます。

```typescript
// expensive-computation.svelte.ts
export class DataProcessor {
  private rawData = $state<any[]>([]);
  private processedCache = new Map<string, any>();
  
  // 遅延評価される派生値
  get processed() {
    const key = JSON.stringify(this.rawData);
    
    if (!this.processedCache.has(key)) {
      console.log('Processing data...');
      const result = this.expensiveProcess(this.rawData);
      this.processedCache.set(key, result);
    }
    
    return this.processedCache.get(key);
  }
  
  setData(data: any[]) {
    this.rawData = data;
    // キャッシュサイズの管理
    if (this.processedCache.size > 10) {
      const firstKey = this.processedCache.keys().next().value;
      this.processedCache.delete(firstKey);
    }
  }
  
  private expensiveProcess(data: any[]): any {
    // 重い処理をシミュレート
    return data.map(item => ({
      ...item,
      processed: true,
      timestamp: Date.now()
    }));
  }
}
```

このパターンでは

- 計算結果をMapにキャッシュして再計算を避ける
- キャッシュサイズを制限してメモリ使用量を管理
- getterアクセス時のみ計算を実行（遅延評価）

### バッチ更新

複数の更新をまとめて処理することで、レンダリング回数を削減できます。

```typescript
// batch-updater.svelte.ts
export class BatchUpdater<T> {
  items = $state<T[]>([]);
  private pendingUpdates: Array<() => void> = [];
  private updateScheduled = false;
  
  batchAdd(items: T[]) {
    this.pendingUpdates.push(() => {
      this.items.push(...items);
    });
    this.scheduleUpdate();
  }
  
  batchRemove(indices: number[]) {
    this.pendingUpdates.push(() => {
      // インデックスを降順でソートして削除
      indices.sort((a, b) => b - a);
      for (const index of indices) {
        this.items.splice(index, 1);
      }
    });
    this.scheduleUpdate();
  }
  
  private scheduleUpdate() {
    if (!this.updateScheduled) {
      this.updateScheduled = true;
      queueMicrotask(() => {
        this.pendingUpdates.forEach(update => update());
        this.pendingUpdates = [];
        this.updateScheduled = false;
      });
    }
  }
}
```

<Admonition type="info" title="queueMicrotask">
`queueMicrotask`を使用することで、現在の実行コンテキストの終了後、次のレンダリング前に更新を実行します。これにより、複数の更新が1回のレンダリングにまとめられます。
</Admonition>
## TypeScriptとの統合

### ジェネリック型とインターフェース

TypeScriptの高度な型機能を活用して、型安全で再利用可能なクラスを作成できます。

```typescript
// interfaces.ts
export interface Identifiable {
  id: string;
}

export interface Timestamped {
  createdAt: Date;
  updatedAt: Date;
}

// generic-store.svelte.ts
export class GenericStore<T extends Identifiable> {
  protected items = $state<Map<string, T>>(new Map());
  
  get all(): T[] {
    return Array.from(this.items.values());
  }
  
  get(id: string): T | undefined {
    return this.items.get(id);
  }
  
  add(item: T) {
    this.items.set(item.id, item);
  }
  
  update(id: string, updates: Partial<T>) {
    const item = this.items.get(id);
    if (item) {
      Object.assign(item, updates);
      this.items.set(id, item);
    }
  }
  
  remove(id: string) {
    this.items.delete(id);
  }
  
  // 派生値：フィルタリング
  filter(predicate: (item: T) => boolean): T[] {
    return this.all.filter(predicate);
  }
  
  // 派生値：検索
  find(predicate: (item: T) => boolean): T | undefined {
    return this.all.find(predicate);
  }
}

// 使用例
interface Product extends Identifiable {
  name: string;
  price: number;
  category: string;
}

class ProductStore extends GenericStore<Product> {
  // カテゴリー別に取得
  getByCategory(category: string) {
    return this.filter(p => p.category === category);
  }
  
  // 価格範囲で取得
  getByPriceRange(min: number, max: number) {
    return this.filter(p => p.price >= min && p.price <= max);
  }
}
```

このジェネリックストアパターンでは

- `Identifiable`インターフェースを実装する任意の型を扱える
- 基底クラスで共通の機能を定義
- 派生クラスで特定のドメインロジックを追加
- 完全な型安全性を保持

## ベストプラクティス

### 1. プロパティの初期化

リアクティブプロパティは明確な初期値を設定することが重要です。

```typescript
// ✅ 良い例：明確な初期値
class GoodExample {
  name = $state('');
  count = $state(0);
  items = $state<string[]>([]);
}

// ❌ 悪い例：undefined の可能性
class BadExample {
  name = $state(); // undefined になる
  count = $state(); // undefined になる
}
```

### 2. メソッドのバインディング

イベントハンドラーとして使用するメソッドは、適切にバインドする必要があります。

```typescript
class Counter {
  count = $state(0);
  
  // ✅ アロー関数で自動バインド
  increment = () => {
    this.count++;
  }
  
  // ⚠️ 通常のメソッド（バインドが必要な場合がある）
  decrement() {
    this.count--;
  }
}
```

<Admonition type="warning" title="メソッドバインディングの注意">
通常のメソッドをイベントハンドラーとして直接渡すと、`this`コンテキストが失われる可能性があります。アロー関数を使用するか、明示的にバインドしてください。
</Admonition>
### 3. プライベートプロパティ

内部状態を隠蔽し、制御されたアクセスを提供します。

```typescript
class DataManager {
  // プライベートな状態
  #data = $state<any[]>([]);
  
  // パブリックなgetter
  get data() {
    return this.#data;
  }
  
  // 制御されたsetter
  setData(newData: any[]) {
    // バリデーションやサニタイズ
    this.#data = this.validateData(newData);
  }
  
  private validateData(data: any[]): any[] {
    // バリデーションロジック
    return data;
  }
}
```

プライベートフィールド（`#`記法）を使用することで

- 外部からの直接アクセスを防ぐ
- データの整合性を保つ
- バリデーションロジックを強制できる

## よくある質問

### Q: クラス内で`$derived`が使えないのはなぜ？

A: `$derived`はトップレベルまたは関数内でのみ使用可能です。クラスではgetterを使用して同様の機能を実現します。

```typescript
class Example {
  // ❌ エラー：クラスプロパティで$derivedは使えない
  // doubled = $derived(this.value * 2);
  
  // ✅ 正しい：getterを使用
  value = $state(1);
  get doubled() {
    return this.value * 2;
  }
}
```

### Q: クラスインスタンスを`$state`に入れる必要はある？

A: クラス内部で`$state`を使用している場合、インスタンス自体を`$state`でラップする必要はありません。

```typescript
// ❌ 不要な二重ラップ
let todo = $state(new TodoItem());

// ✅ クラス内部で$stateを使用
let todo = new TodoItem();
```

### Q: クラスと関数ベースのストア、どちらを使うべき？

A: 状況に応じて選択してください。

<div class="approach-cards">
  <div class="approach-card">
    <h4><span class="icon">🏗️</span> クラスベースが適している場合</h4>
    <ul>
      <li><strong style="color: #3b82f6;">複雑な内部状態</strong>を持つエンティティを表現する時</li>
      <li><strong style="color: #3b82f6;">継承やポリモーフィズム</strong>が必要な時</li>
      <li><strong style="color: #3b82f6;">インスタンスメソッド</strong>を多く持つ場合</li>
    </ul>
    <div class="card-example">
      <code>例: TodoItem, User, ShoppingCart</code>
    </div>
  </div>
  
  <div class="approach-card">
    <h4><span class="icon">⚡</span> 関数ベースが適している場合</h4>
    <ul>
      <li><strong style="color: #10b981;">シンプルな状態管理</strong>の時</li>
      <li><strong style="color: #10b981;">グローバルストア</strong>（シングルトン）を作成する時</li>
      <li><strong style="color: #10b981;">コンポジション</strong>を重視する設計の時</li>
    </ul>
    <div class="card-example">
      <code>例: counter, theme, auth</code>
    </div>
  </div>
</div>

<style>
  .approach-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
    margin: 2rem 0;
  }
  
  .approach-card {
    background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 1.5rem;
    transition: all 0.3s ease;
  }
  
  .approach-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    border-color: #cbd5e1;
  }
  
  .approach-card h4 {
    margin: 0 0 1rem 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: #1e293b;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .approach-card .icon {
    font-size: 1.5rem;
  }
  
  .approach-card ul {
    margin: 0;
    padding-left: 1.5rem;
    color: #475569;
  }
  
  .approach-card li {
    margin: 0.5rem 0;
    line-height: 1.6;
  }
  
  .card-example {
    margin-top: 1rem;
    padding: 0.75rem;
    background: rgba(0, 0, 0, 0.03);
    border-radius: 6px;
    border-left: 3px solid;
  }
  
  .approach-card:first-child .card-example {
    border-left-color: #3b82f6;
  }
  
  .approach-card:last-child .card-example {
    border-left-color: #10b981;
  }
  
  .card-example code {
    font-size: 0.9rem;
    color: #64748b;
    background: none;
    padding: 0;
  }
  
  /* ダークモード対応 */
  :global(.dark) .approach-card {
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
    border-color: #334155;
  }
  
  :global(.dark) .approach-card:hover {
    border-color: #475569;
  }
  
  :global(.dark) .approach-card h4 {
    color: #f1f5f9;
  }

  :global(.dark) .approach-card ul {
    color: #cbd5e1;
  }
  
  :global(.dark) .card-example {
    background: rgba(255, 255, 255, 0.05);
  }
  
  :global(.dark) .card-example code {
    color: #94a3b8;
  }
</style>

詳しくは[リアクティブストア](/svelte/advanced/reactive-stores/)のページで関数ベースのアプローチを確認してください。

### Q: 継承とコンポジション、どちらを使うべき？

A: 一般的にコンポジションを推奨します。継承は「is-a」関係が明確な場合のみ使用してください。

```typescript
// 継承：TodoはTaskである（is-a関係）
class Todo extends Task { }

// コンポジション：TodoはValidatorを持つ（has-a関係）
class Todo {
  validator = new Validator();
}
```

## まとめ

クラスとSvelte 5のリアクティビティを組み合わせることで

1. **オブジェクト指向の利点** - カプセル化、継承、ポリモーフィズム
2. **自動的な更新** - `$state`による自動的なUI更新
3. **型安全性** - TypeScriptとの完全な統合
4. **再利用性** - クラスベースの設計による高い再利用性
5. **保守性** - 明確な構造と責任の分離

<Admonition type="info" title="関連リンク">
<ul>
<li><a href="{base}/svelte/advanced/reactive-stores/">リアクティブストア</a> - 関数ベースのストア</li>
<li><a href="{base}/svelte/advanced/built-in-classes/">組み込みリアクティブクラス</a> - SvelteMap、SvelteSetなど</li>
<li><a href="{base}/svelte/runes/state/">$stateルーン</a> - 基本的なリアクティビティ</li>
</ul>

</Admonition>
次は<a href="{base}/svelte/advanced/built-in-classes/">組み込みリアクティブクラス</a>で、Svelte 5が提供する組み込みクラスについて学びましょう。