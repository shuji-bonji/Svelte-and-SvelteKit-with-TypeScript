---
title: $derivedルーン
description: 他の値から自動的に計算される派生値
---

`$derived`は、Svelte 5のRunesシステムで提供される派生値（computed value）を作成するための機能です。このページでは、`$derived`の基本的な使い方から応用パターンまで、TypeScriptと組み合わせた実践的な活用方法を解説します。

:::tip[React/Vue経験者向け]
- `$derived`は React の `useMemo` や Vue の `computed` に相当
- 依存する値が変更されたときのみ再計算される（メモ化）
- 副作用を含めることはできない（純粋な計算のみ）
:::

## $derivedとは

`$derived`は、他のリアクティブな値から自動的に計算される値を作成するルーンです。依存する値が変更されると、自動的に再計算されます。

### 主な特徴

- **自動的な依存追跡**: 使用している`$state`値を自動で追跡
- **効率的な再計算**: 依存値が変更されたときのみ再計算
- **純粋な計算**: 副作用を含まない計算に限定
- **TypeScript型推論**: 計算結果の型を自動推論

:::warning[重要な注意点]
`$derived`は式を直接受け取ります。関数でラップする必要はありません。
```typescript
// ❌ 間違い
let value = $derived(() => count * 2);

// ✅ 正しい
let value = $derived(count * 2);
```
ただし、複雑な計算には`$derived.by()`を使用します。
:::

## リアクティブな値が必須

`$derived`は**リアクティブな値**から派生する必要があります。通常の変数からは派生できません。

### リアクティブな値の種類

Svelte 5でリアクティブな値となるのは、
1. **`$state`で定義された値** - 最も一般的
2. **`$props`で受け取った値** - コンポーネントのプロパティ
3. **他の`$derived`で計算された値** - 派生値の連鎖
4. **`$bindable`なprops** - 双方向バインディング可能なプロパティ

```typescript
// ✅ $stateから派生
let count = $state(0);
let doubled = $derived(count * 2);

// ✅ 他の$derivedから派生
let quadrupled = $derived(doubled * 2);

// ✅ $propsから派生
let { price, quantity } = $props();
let total = $derived(price * quantity);

// ✅ 複数のリアクティブ値から派生
let firstName = $state('太郎');
let { lastName } = $props(); // propsから
let fullName = $derived(`${lastName} ${firstName}`);

// ❌ 通常の変数からは派生できない
let normalVar = 10; // リアクティブでない
// let result = $derived(normalVar * 2); // 意味がない・更新されない
```

:::info[重要なポイント]
`$derived`は`$state`が必須ではありません。`$props`や他の`$derived`など、任意のリアクティブな値から派生できます。重要なのは「リアクティブな値」であることです。
:::

## 基本的な使い方

### シンプルな計算

```typescript
let count = $state(10);
let doubled = $derived(count * 2);
let quadrupled = $derived(doubled * 2);

// count が変更されると、doubled と quadrupled が自動的に更新される
count = 20; // doubled = 40, quadrupled = 80
```

### 複数の値から派生

```typescript
let firstName = $state('太郎');
let lastName = $state('山田');

let fullName = $derived(`${lastName} ${firstName}`);

// どちらかが変更されると fullName が更新される
firstName = '次郎'; // fullName = "山田 次郎"
```

### propsのみから派生

```typescript
// Parent.svelte
<Child width={100} height={50} />

// Child.svelte
<script lang="ts">
  // $stateは一切使わない
  let { width, height } = $props();
  
  // propsから直接派生
  let area = $derived(width * height);
  let perimeter = $derived(2 * (width + height));
  let diagonal = $derived(Math.sqrt(width ** 2 + height ** 2));
</script>

<p>面積: {area}</p>
<p>周囲: {perimeter}</p>
<p>対角線: {diagonal.toFixed(2)}</p>
```

## 関数を使った複雑な計算

```typescript
let items = $state([
  { name: 'りんご', price: 100, quantity: 2 },
  { name: 'バナナ', price: 50, quantity: 3 },
  { name: 'みかん', price: 80, quantity: 1 }
]);

// 合計金額の計算
let total = $derived(() => {
  return items.reduce((sum, item) => {
    return sum + (item.price * item.quantity);
  }, 0);
});

// 税込価格
let totalWithTax = $derived(() => {
  const taxRate = 0.1;
  return Math.floor(total * (1 + taxRate));
});
```

## 条件付き派生

```typescript
let isLoggedIn = $state(false);
let username = $state('');

let greeting = $derived(() => {
  if (!isLoggedIn) {
    return 'ゲストさん、ようこそ';
  }
  return `${username}さん、こんにちは`;
});
```

## 配列とオブジェクトの派生

### フィルタリング

```typescript
type Todo = {
  id: number;
  text: string;
  done: boolean;
};

let todos = $state<Todo[]>([
  { id: 1, text: '買い物', done: false },
  { id: 2, text: '掃除', done: true },
  { id: 3, text: '勉強', done: false }
]);

// 未完了のTODOのみ
let activeTodos = $derived(
  todos.filter(todo => !todo.done)
);

// 完了したTODOの数
let completedCount = $derived(
  todos.filter(todo => todo.done).length
);

// 進捗率
let progress = $derived(() => {
  if (todos.length === 0) return 0;
  return Math.round((completedCount / todos.length) * 100);
});
```

### マッピング

```typescript
let products = $state([
  { name: 'ノートPC', price: 100000 },
  { name: 'マウス', price: 3000 },
  { name: 'キーボード', price: 10000 }
]);

let discountRate = $state(0.1); // 10%割引

// 割引後の価格リスト
let discountedProducts = $derived(() => 
  products.map(product => ({
    ...product,
    discountedPrice: product.price * (1 - discountRate),
    savings: product.price * discountRate
  }))
);
```

## $derived.by

より複雑なロジックが必要な場合は`$derived.by`を使用します。

```typescript
let searchQuery = $state('');
let sortOrder = $state<'asc' | 'desc'>('asc');
let items = $state(['apple', 'banana', 'orange', 'grape']);

let filteredAndSorted = $derived.by(() => {
  // フィルタリング
  let filtered = items.filter(item => 
    item.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // ソート
  filtered.sort((a, b) => {
    if (sortOrder === 'asc') {
      return a.localeCompare(b);
    } else {
      return b.localeCompare(a);
    }
  });
  
  return filtered;
});
```

## 実践例：ショッピングカート

`$derived`を活用したショッピングカートの実装例です。商品の追加・削除、数量変更、割引適用、税計算などを実装しています。

```svelte live ln title=ShoppingCart.svelte
<script lang="ts">
  type Product = {
    id: number;
    name: string;
    price: number;
    category: string;
  };

  type CartItem = {
    product: Product;
    quantity: number;
  };

  // 商品リスト
  const products: Product[] = [
    { id: 1, name: 'ノートPC', price: 120000, category: 'electronics' },
    { id: 2, name: 'マウス', price: 3000, category: 'electronics' },
    { id: 3, name: 'キーボード', price: 10000, category: 'electronics' },
    { id: 4, name: 'モニター', price: 40000, category: 'electronics' },
    { id: 5, name: 'USBケーブル', price: 1000, category: 'accessories' },
    { id: 6, name: 'ノート', price: 500, category: 'stationery' }
  ];

  // 状態管理
  let cart = $state<CartItem[]>([]);
  let taxRate = $state(0.1); // 10%
  let shippingFee = $state(500);
  let discountCode = $state('');
  let discountRate = $state(0);

  // カート内の商品数（$derivedで自動計算）
  let itemCount = $derived(
    cart.reduce((sum, item) => sum + item.quantity, 0)
  );

  // 小計
  let subtotal = $derived(
    cart.reduce((sum, item) => 
      sum + (item.product.price * item.quantity), 0
    )
  );

  // 割引額
  let discountAmount = $derived(
    Math.floor(subtotal * discountRate)
  );

  // 割引後の金額
  let afterDiscount = $derived(
    subtotal - discountAmount
  );

  // 税額
  let tax = $derived(
    Math.floor(afterDiscount * taxRate)
  );

  // 送料（5000円以上で無料）
  let shipping = $derived(
    afterDiscount >= 5000 ? 0 : shippingFee
  );

  // 合計
  let total = $derived(
    afterDiscount + tax + shipping
  );

  // 送料無料まであといくら？
  let freeShippingThreshold = $derived.by(() => {
    if (afterDiscount >= 5000) return 0;
    return 5000 - afterDiscount;
  });

  // カート操作関数
  function addToCart(product: Product) {
    const existingItem = cart.find(item => item.product.id === product.id);
    
    if (existingItem) {
      cart = cart.map(item =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      cart = [...cart, { product, quantity: 1 }];
    }
  }

  function removeFromCart(productId: number) {
    cart = cart.filter(item => item.product.id !== productId);
  }

  function updateQuantity(productId: number, quantity: number) {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      cart = cart.map(item =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      );
    }
  }

  function applyDiscount() {
    // 簡単な割引コードの検証
    if (discountCode === 'SAVE10') {
      discountRate = 0.1; // 10%割引
    } else if (discountCode === 'SAVE20') {
      discountRate = 0.2; // 20%割引
    } else {
      discountRate = 0;
      alert('無効な割引コードです');
    }
  }

  function clearCart() {
    cart = [];
    discountCode = '';
    discountRate = 0;
  }
</script>

<div class="shopping-cart">
  <div class="products-section">
    <h3>商品リスト</h3>
    <div class="products-grid">
      {#each products as product}
        <div class="product-card">
          <h4>{product.name}</h4>
          <p class="price">¥{product.price.toLocaleString()}</p>
          <button onclick={() => addToCart(product)}>
            カートに追加
          </button>
        </div>
      {/each}
    </div>
  </div>

  <div class="cart-section">
    <h3>ショッピングカート ({itemCount}点)</h3>
    
    {#if cart.length === 0}
      <p class="empty-cart">カートは空です</p>
    {:else}
      <div class="cart-items">
        {#each cart as item}
          <div class="cart-item">
            <div class="item-info">
              <span class="item-name">{item.product.name}</span>
              <span class="item-price">
                ¥{item.product.price.toLocaleString()}
              </span>
            </div>
            <div class="quantity-controls">
              <button onclick={() => updateQuantity(item.product.id, item.quantity - 1)}>
                -
              </button>
              <span class="quantity">{item.quantity}</span>
              <button onclick={() => updateQuantity(item.product.id, item.quantity + 1)}>
                +
              </button>
              <button class="remove" onclick={() => removeFromCart(item.product.id)}>
                削除
              </button>
            </div>
            <div class="item-total">
              ¥{(item.product.price * item.quantity).toLocaleString()}
            </div>
          </div>
        {/each}
      </div>

      <div class="discount-section">
        <input
          type="text"
          bind:value={discountCode}
          placeholder="割引コード（例: SAVE10）"
        />
        <button onclick={applyDiscount}>適用</button>
      </div>

      <div class="summary">
        <div class="summary-row">
          <span>小計:</span>
          <span>¥{subtotal.toLocaleString()}</span>
        </div>
        
        {#if discountAmount > 0}
          <div class="summary-row discount">
            <span>割引 ({(discountRate * 100).toFixed(0)}%):</span>
            <span>-¥{discountAmount.toLocaleString()}</span>
          </div>
        {/if}
        
        <div class="summary-row">
          <span>税金 (10%):</span>
          <span>¥{tax.toLocaleString()}</span>
        </div>
        
        <div class="summary-row">
          <span>送料:</span>
          <span>
            {shipping === 0 ? '無料' : `¥${shipping.toLocaleString()}`}
          </span>
        </div>
        
        {#if freeShippingThreshold > 0}
          <div class="free-shipping-info">
            あと¥{freeShippingThreshold.toLocaleString()}で送料無料！
          </div>
        {/if}
        
        <div class="summary-row total">
          <span>合計:</span>
          <span>¥{total.toLocaleString()}</span>
        </div>
      </div>

      <div class="actions">
        <button class="clear-btn" onclick={clearCart}>
          カートをクリア
        </button>
        <button class="checkout-btn">
          購入手続きへ
        </button>
      </div>
    {/if}
  </div>
</div>

<style>
  .shopping-cart {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    padding: 2rem;
    background: #f9f9f9;
    border-radius: 8px;
  }

  .products-section h3,
  .cart-section h3 {
    color: #ff3e00;
    margin-bottom: 1rem;
  }

  .products-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .product-card {
    background: white;
    padding: 1rem;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }

  .product-card h4 {
    margin: 0 0 0.5rem 0;
    font-size: 1rem;
  }

  .price {
    color: #ff3e00;
    font-weight: bold;
    margin: 0.5rem 0;
  }

  button {
    padding: 0.5rem 1rem;
    background: #ff3e00;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
  }

  button:hover {
    background: #ff5a00;
  }

  .empty-cart {
    text-align: center;
    color: #999;
    padding: 2rem;
    background: white;
    border-radius: 4px;
  }

  .cart-items {
    background: white;
    border-radius: 4px;
    padding: 1rem;
    margin-bottom: 1rem;
  }

  .cart-item {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr;
    align-items: center;
    padding: 0.75rem 0;
    border-bottom: 1px solid #eee;
  }

  .cart-item:last-child {
    border-bottom: none;
  }

  .item-info {
    display: flex;
    flex-direction: column;
  }

  .item-name {
    font-weight: 500;
  }

  .item-price {
    color: #666;
    font-size: 0.9rem;
  }

  .quantity-controls {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .quantity-controls button {
    width: 30px;
    height: 30px;
    padding: 0;
  }

  .quantity {
    min-width: 30px;
    text-align: center;
    font-weight: bold;
  }

  .remove {
    background: #dc3545;
    font-size: 0.8rem;
    padding: 0.3rem 0.6rem;
  }

  .item-total {
    text-align: right;
    font-weight: bold;
    color: #ff3e00;
  }

  .discount-section {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .discount-section input {
    flex: 1;
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
  }

  .summary {
    background: white;
    padding: 1rem;
    border-radius: 4px;
    margin-bottom: 1rem;
  }

  .summary-row {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 0;
    border-bottom: 1px solid #eee;
  }

  .summary-row.discount {
    color: #28a745;
  }

  .summary-row.total {
    border-bottom: none;
    border-top: 2px solid #ff3e00;
    margin-top: 0.5rem;
    padding-top: 1rem;
    font-size: 1.2rem;
    font-weight: bold;
    color: #ff3e00;
  }

  .free-shipping-info {
    background: #fff3cd;
    color: #856404;
    padding: 0.5rem;
    margin: 0.5rem 0;
    border-radius: 4px;
    text-align: center;
    font-size: 0.9rem;
  }

  .actions {
    display: flex;
    gap: 1rem;
  }

  .clear-btn {
    background: #6c757d;
  }

  .checkout-btn {
    flex: 1;
    background: #28a745;
    font-size: 1.1rem;
    padding: 0.75rem;
  }

  @media (max-width: 768px) {
    .shopping-cart {
      grid-template-columns: 1fr;
    }
    
    .products-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
```

## パフォーマンスの考慮

### メモ化

`$derived`は自動的にメモ化されます。依存する値が変わらない限り、再計算されません。

```typescript
let count = $state(0);

// この計算は count が変更された時のみ実行される
let expensive = $derived(() => {
  console.log('計算中...');
  return count * 2;
});
```

### 注意点


```typescript
// ❌ 副作用を含めない
let value = $derived(() => {
  localStorage.setItem('key', 'value'); // 副作用
  return calculateValue();
});

// ✅ 純粋な計算のみ
let value = $derived(calculateValue());

// 副作用は $effect で
$effect(() => {
  localStorage.setItem('key', value);
});
```

## ベストプラクティス

### 1. シンプルに保つ

```typescript
// ❌ 複雑すぎる
let result = $derived(() => {
  // 100行のロジック...
});

// ✅ 関数に分割
function calculateResult(data: Data) {
  // ロジック
}

let result = $derived(calculateResult(data));
```

### 2. 型を明確に

```typescript
// TypeScriptが型を推論できない場合は明示的に指定
let result = $derived<string | null>(() => {
  if (condition) return 'value';
  return null;
});
```

### 3. 不要な再計算を避ける

```typescript
// ❌ 毎回新しいオブジェクトを作成
let config = $derived(() => ({
  theme: 'dark',
  lang: 'ja'
}));

// ✅ 値が変わらない場合は定数として定義
const CONFIG = {
  theme: 'dark',
  lang: 'ja'
};
```

## さらに詳しく学ぶ

:::info[ディープダイブ]
`$derived`、`$effect`、`derived.by`の詳細な違いと使い分けについては、[完全比較ガイド](/deep-dive/derived-vs-effect-vs-derived-by/)をご覧ください。
:::

## 次のステップ

派生値の作成方法を理解したら、[$effect - 副作用](/runes/effect/)で副作用の処理方法を学びましょう。