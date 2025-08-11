---
title: $derivedルーン
description: 他の値から自動的に計算される派生値
---

## $derivedとは

`$derived`は、他のリアクティブな値から自動的に計算される値を作成するルーンです。依存する値が変更されると、自動的に再計算されます。

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

```typescript
type Product = {
  id: string;
  name: string;
  price: number;
};

type CartItem = {
  product: Product;
  quantity: number;
};

let cart = $state<CartItem[]>([]);
let taxRate = $state(0.1);
let shippingFee = $state(500);

// カート内の商品数
let itemCount = $derived(
  cart.reduce((sum, item) => sum + item.quantity, 0)
);

// 小計
let subtotal = $derived(
  cart.reduce((sum, item) => 
    sum + (item.product.price * item.quantity), 0
  )
);

// 税額
let tax = $derived(Math.floor(subtotal * taxRate));

// 送料（5000円以上で無料）
let shipping = $derived(() => {
  if (subtotal >= 5000) return 0;
  return shippingFee;
});

// 合計
let total = $derived(subtotal + tax + shipping);

// 注文サマリー
let orderSummary = $derived(() => ({
  items: itemCount,
  subtotal,
  tax,
  shipping,
  total,
  freeShippingAmount: subtotal < 5000 ? 5000 - subtotal : 0
}));
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