---
title: "$state: $derived vs $effect vs derived.by 完全比較ガイド"
description: "Svelte 5のリアクティビティを扱う3つの方法（$derived、$effect、derived.by）の違いと使い分けを実践例とともに詳しく解説"
---


Svelte 5のリアクティビティシステムは、状態の変更を追跡し、UIを自動的に更新する仕組みです。このページでは、リアクティブな値を扱うための3つの主要な方法について、実践的な例を交えながら詳しく解説します。

:::tip[React/Vue経験者向け]
- `$derived` は React の `useMemo` や Vue の `computed` に相当
- `$effect` は React の `useEffect` や Vue の `watchEffect` に相当
- `derived.by` は複雑な計算ロジックを整理するための Svelte 独自の機能
:::

## 3つのリアクティビティ手法

Svelte 5では、リアクティビティを扱うための3つの主要な方法があります。

1. **`$derived`** - 他の値から計算される派生値（シンプルな計算向け）
2. **`$effect`** - 副作用を実行するための仕組み（DOM操作、API呼び出しなど）
3. **`derived.by`** - より複雑な派生ロジックのための関数ベースアプローチ

それぞれには明確な役割があり、適切に使い分けることで、効率的でメンテナブルなコードを書くことができます。

## 基本的な違い

### `$derived` - シンプルな派生値

```svelte
<script lang="ts">
  let count = $state(0);
  let doubled = $derived(count * 2);
  let message = $derived(`カウント: ${count}, 2倍: ${doubled}`);
</script>
```

#### 特徴
- 式ベースの派生値
- 自動的に依存関係を追跡
- 純粋な計算に最適
- 副作用は実行できない

### `$effect` - 副作用の実行

```svelte
<script lang="ts">
  let count = $state(0);
  
  $effect(() => {
    console.log(`カウントが変更されました: ${count}`);
    
    // クリーンアップ関数を返せる
    return () => {
      console.log('クリーンアップ');
    };
  });
</script>
```

#### 特徴
- 副作用（DOM操作、API呼び出し、ログ出力など）に使用
- クリーンアップ関数をサポート
- 値を返さない

### `derived.by` - 関数ベースの派生値

```svelte
<script lang="ts">
  let items = $state<Item[]>([]);
  let filter = $state('');
  let sortOrder = $state<'asc' | 'desc'>('asc');
  
  // 複雑なロジックを含む派生値
  let filteredAndSorted = $derived.by(() => {
    // ステップ1: フィルタリング
    const filtered = items.filter(item => 
      item.name.toLowerCase().includes(filter.toLowerCase())
    );
    
    // ステップ2: ソート
    const sorted = [...filtered].sort((a, b) => {
      const comparison = a.name.localeCompare(b.name);
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    // ステップ3: 結果を返す
    return sorted;
  });
</script>
```

#### 特徴
- 関数内で複雑なロジックを記述可能
- 中間変数を使用できる
- デバッグしやすい
- 純粋な計算のみ（副作用は禁止）

## 実践的な比較例

### ショッピングカートの実装

```svelte
<script lang="ts">
  interface CartItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
  }
  
  let cartItems = $state<CartItem[]>([
    { id: 1, name: 'ノートPC', price: 120000, quantity: 1 },
    { id: 2, name: 'マウス', price: 3000, quantity: 2 }
  ]);
  
  let taxRate = $state(0.1); // 10%
  let discountCode = $state('');
  let discountPercent = $state(0);
  
  // 1. $derived - シンプルな計算
  let subtotal = $derived(
    cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  );
  
  // 2. derived.by - 複雑な計算ロジック
  let total = $derived.by(() => {
    // 小計を計算
    const baseAmount = subtotal;
    
    // 割引を適用
    const discountAmount = baseAmount * (discountPercent / 100);
    const afterDiscount = baseAmount - discountAmount;
    
    // 税金を計算
    const tax = afterDiscount * taxRate;
    
    // 最終金額
    return {
      subtotal: baseAmount,
      discount: discountAmount,
      tax: tax,
      total: afterDiscount + tax
    };
  });
  
  // 3. $effect - 副作用（ローカルストレージへの保存）
  $effect(() => {
    // カートの内容をローカルストレージに保存
    localStorage.setItem('cart', JSON.stringify(cartItems));
    
    // デバッグ用のログ
    console.log('カートが更新されました:', {
      items: cartItems.length,
      total: total.total
    });
  });
  
  // 4. 割引コードの検証（$effectの実践例）
  $effect(() => {
    // 非同期処理も可能
    const validateDiscount = async () => {
      if (discountCode) {
        try {
          const response = await fetch(`/api/validate-discount/${discountCode}`);
          const data = await response.json();
          discountPercent = data.percent || 0;
        } catch {
          discountPercent = 0;
        }
      } else {
        discountPercent = 0;
      }
    };
    
    validateDiscount();
  });
</script>

<!-- UI -->
<div class="cart">
  <h2>ショッピングカート</h2>
  
  {#each cartItems as item}
    <div class="item">
      <span>{item.name}</span>
      <input type="number" bind:value={item.quantity} min="1" />
      <span>¥{(item.price * item.quantity).toLocaleString()}</span>
    </div>
  {/each}
  
  <div class="summary">
    <div>小計: ¥{total.subtotal.toLocaleString()}</div>
    {#if total.discount > 0}
      <div>割引: -¥{total.discount.toLocaleString()}</div>
    {/if}
    <div>税金: ¥{total.tax.toLocaleString()}</div>
    <div class="total">合計: ¥{total.total.toLocaleString()}</div>
  </div>
  
  <input 
    type="text" 
    bind:value={discountCode} 
    placeholder="割引コード"
  />
</div>
```

## 使い分けのガイドライン

### `$derived`を使うべき場合

```typescript
// ✅ シンプルな計算
let fullName = $derived(`${firstName} ${lastName}`);

// ✅ 単一の式で表現できる
let isValid = $derived(email.includes('@') && password.length >= 8);

// ✅ 配列の変換
let upperCaseNames = $derived(names.map(n => n.toUpperCase()));
```

### `derived.by`を使うべき場合

```typescript
// ✅ 複数ステップの処理
let processedData = $derived.by(() => {
  const filtered = data.filter(/* ... */);
  const sorted = filtered.sort(/* ... */);
  const grouped = groupBy(sorted, 'category');
  return grouped;
});

// ✅ 条件分岐が複雑
let displayValue = $derived.by(() => {
  if (isLoading) return 'Loading...';
  if (error) return `Error: ${error.message}`;
  if (!data) return 'No data';
  
  return formatData(data);
});

// ✅ デバッグが必要
let complexCalculation = $derived.by(() => {
  console.log('Step 1:', value1);
  const intermediate = calculateSomething(value1);
  console.log('Step 2:', intermediate);
  return finalCalculation(intermediate);
});
```

### `$effect`を使うべき場合

```typescript
// ✅ DOM操作
$effect(() => {
  const element = document.getElementById('chart');
  if (element) {
    renderChart(element, data);
  }
});

// ✅ 外部ライブラリとの連携
$effect(() => {
  const chart = new Chart(canvas, {
    data: chartData,
    options: chartOptions
  });
  
  return () => chart.destroy();
});

// ✅ API呼び出し
$effect(() => {
  fetch(`/api/data/${id}`)
    .then(res => res.json())
    .then(data => result = data);
});

// ✅ タイマーやイベントリスナー
$effect(() => {
  const timer = setInterval(() => {
    time = new Date();
  }, 1000);
  
  return () => clearInterval(timer);
});
```

## パフォーマンスの考慮

### 計算の最適化

```svelte
<script lang="ts">
  let items = $state<Item[]>([]);
  let searchTerm = $state('');
  
  // ❌ 非効率: $effectで結果を設定
  let searchResults = $state<Item[]>([]);
  $effect(() => {
    searchResults = items.filter(item => 
      item.name.includes(searchTerm)
    );
  });
  
  // ✅ 効率的: $derivedを使用
  let searchResults = $derived(
    items.filter(item => 
      item.name.includes(searchTerm)
    )
  );
  
  // ✅ さらに複雑な場合はderived.by
  let searchResults = $derived.by(() => {
    if (!searchTerm) return items;
    
    const term = searchTerm.toLowerCase();
    return items.filter(item => 
      item.name.toLowerCase().includes(term) ||
      item.description?.toLowerCase().includes(term)
    );
  });
</script>
```

## まとめ

| 機能 | `$derived` | `derived.by` | `$effect` |
|------|-----------|--------------|-----------|
| 用途 | シンプルな派生値 | 複雑な派生値 | 副作用 |
| 値を返す | ✅ | ✅ | ❌ |
| 複数ステップ | ❌ | ✅ | ✅ |
| 副作用 | ❌ | ❌ | ✅ |
| クリーンアップ | ❌ | ❌ | ✅ |
| デバッグのしやすさ | 😐 | 😊 | 😊 |
| パフォーマンス | 🚀 | 🚀 | 💨 |

### 選択の指針
1. **シンプルな計算** → `$derived`
2. **複雑な計算ロジック** → `derived.by`
3. **副作用が必要** → `$effect`

これらを適切に使い分けることで、読みやすく、保守しやすく、パフォーマンスの良いSvelteアプリケーションを構築できます。

## 関連ページ

### 基礎を学ぶ
- [Runesシステム入門](/runes/runes-introduction/) - Runesの基本概念と全体像
- [$stateルーン](/runes/state/) - リアクティブな状態管理の基礎
- [$derivedルーン](/runes/derived/) - 派生値の詳細解説
- [$effectルーン](/runes/effect/) - 副作用の詳細解説

### さらに深く理解する
- [リアクティブな状態変数とバインディングの違い](/deep-dive/reactive-state-variables-vs-bindings/) - $stateとbind:の使い分け

### 実践的な活用
- [リアクティブストア（.svelte.js/.svelte.ts）](/advanced/reactive-stores/) - 複数コンポーネント間での状態共有
- [クラスとリアクティビティ](/advanced/class-reactivity/) - オブジェクト指向とRunesの組み合わせ