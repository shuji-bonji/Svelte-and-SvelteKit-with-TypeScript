---
title: Svelte $derived完全ガイド - TypeScriptで計算プロパティとメモ化を実装
description: Svelte 5の$derived完全解説 - TypeScriptで計算プロパティ・派生値・メモ化を実装。$derived.by、useMemoとの違い、パフォーマンス最適化、複雑な派生ロジックの実践例を詳しく解説
---


`$derived`ルーンは、他のリアクティブな値から自動的に計算される値を作成します。依存する値が変更されると、派生値も自動的に再計算されます。

## 基本的な使い方

`$derived`の最も基本的な使い方は、既存のリアクティブな値から新しい値を計算することです。
依存関係は自動的に追跡され、必要な時だけ再計算されます。

### シンプルな計算

```svelte live
<script lang="ts">
  let count = $state(0);
  
  // countが変更されると自動的に再計算
  let doubled = $derived(count * 2);
  let squared = $derived(count ** 2);
  let isEven = $derived(count % 2 === 0);
  
  function increment() {
    count++;
  }
</script>

<button onclick={increment}>カウント: {count}</button>
<p>2倍: {doubled}</p>
<p>2乗: {squared}</p>
<p>偶数: {isEven}</p>
```

:::tip[Vue やReactとの比較]
- Vue の `computed` と同じ概念
- React の `useMemo` に似ているが、依存関係の指定が不要
- 自動的に依存関係を追跡し、必要な時だけ再計算
:::

### 複数の依存関係

`$derived`は複数のリアクティブな値に依存する計算もサポートします。
どの依存値が変更されても、派生値は自動的に更新されます。

```svelte live
<script lang="ts">
  let firstName = $state('太郎');
  let lastName = $state('山田');
  let separator = $state(' ');
  
  // 複数の値に依存する派生値
  let fullName = $derived(
    lastName + separator + firstName
  );
  
  // さらに派生値から派生
  let displayName = $derived(
    `${fullName}様`
  );
  
  let nameLength = $derived(fullName.length);
</script>

<input bind:value={firstName} placeholder="名" />
<input bind:value={lastName} placeholder="姓" />
<select bind:value={separator}>
  <option value=" ">スペース</option>
  <option value="・">中点</option>
  <option value="">なし</option>
</select>

<p>フルネーム: {fullName}</p>
<p>表示名: {displayName}</p>
<p>文字数: {nameLength}</p>
```



## ブロック構文での使用

単純な式では表現しにくい複雑な計算や、複数のステップが必要な処理には、
ブロック構文（アロー関数）を使用してより読みやすいコードを書くことができます。

```svelte live ln
<script lang="ts">
  interface Product {
    id: number;
    name: string;
    price: number;
    quantity: number;
  }
  
  let products = $state<Product[]>([
    { id: 1, name: 'ノートPC', price: 100000, quantity: 2 },
    { id: 2, name: 'マウス', price: 3000, quantity: 5 },
    { id: 3, name: 'キーボード', price: 8000, quantity: 3 }
  ]);
  
  let taxRate = $state(0.1);
  let discountRate = $state(0.05);
  
  // ブロック構文で複雑な計算
  let summary = $derived(() => {
    const subtotal = products.reduce((sum, product) => {
      return sum + product.price * product.quantity;
    }, 0);
    
    const discount = subtotal * discountRate;
    const afterDiscount = subtotal - discount;
    const tax = afterDiscount * taxRate;
    const total = afterDiscount + tax;
    
    return {
      subtotal,
      discount,
      afterDiscount,
      tax,
      total,
      itemCount: products.reduce((sum, p) => sum + p.quantity, 0)
    };
  });
</script>

<div class="summary">
  <p>商品数: {summary().itemCount}点</p>
  <p>小計: ¥{summary().subtotal?.toLocaleString() ?? 0}</p>
  <p>割引: -¥{summary().discount?.toLocaleString() ?? 0}</p>
  <p>割引後: ¥{summary().afterDiscount?.toLocaleString() ?? 0}</p>
  <p>税額: ¥{summary().tax?.toLocaleString() ?? 0}</p>
  <p>合計: ¥{summary().total?.toLocaleString() ?? 0}</p>
</div>
```



## 配列とオブジェクトの処理

実際のアプリケーションでは、配列やオブジェクトのデータを加工することが多くあります。
`$derived`を使えば、フィルタリング、ソート、グルーピングなどの処理を効率的に実装できます。

### フィルタリングとソート

```svelte
<script lang="ts">
  interface Task {
    id: number;
    title: string;
    completed: boolean;
    priority: 'low' | 'medium' | 'high';
    dueDate: Date;
  }
  
  let tasks = $state<Task[]>([
    // タスクデータ
  ]);
  
  let showCompleted = $state(false);
  let sortBy = $state<'priority' | 'dueDate'>('priority');
  let searchQuery = $state('');
  
  // フィルタリングされたタスク
  let filteredTasks = $derived(() => {
    let result = tasks;
    
    // 完了タスクのフィルタ
    if (!showCompleted) {
      result = result.filter(t => !t.completed);
    }
    
    // 検索フィルタ
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(t => 
        t.title.toLowerCase().includes(query)
      );
    }
    
    // ソート
    result = [...result].sort((a, b) => {
      if (sortBy === 'priority') {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      } else {
        return a.dueDate.getTime() - b.dueDate.getTime();
      }
    });
    
    return result;
  });
  
  // 統計情報
  let stats = $derived(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;
    const highPriority = tasks.filter(
      t => t.priority === 'high' && !t.completed
    ).length;
    
    return { total, completed, pending, highPriority };
  });
</script>
```



### グルーピング

データを特定のキーでグループ化することも、`$derived`で簡単に実現できます。
MapやObjectを使って、カテゴリごとの集計や整理が可能です。

```svelte
<script lang="ts">
  interface Item {
    category: string;
    name: string;
    value: number;
  }
  
  let items = $state<Item[]>([
    { category: '食品', name: 'りんご', value: 100 },
    { category: '食品', name: 'バナナ', value: 80 },
    { category: '家電', name: 'テレビ', value: 50000 },
    { category: '家電', name: '冷蔵庫', value: 80000 },
    { category: '衣類', name: 'シャツ', value: 3000 }
  ]);
  
  // カテゴリごとにグループ化
  let groupedItems = $derived(() => {
    const groups = new Map<string, Item[]>();
    
    for (const item of items) {
      if (!groups.has(item.category)) {
        groups.set(item.category, []);
      }
      groups.get(item.category)!.push(item);
    }
    
    return groups;
  });
  
  // カテゴリごとの合計
  let categoryTotals = $derived(() => {
    const totals = new Map<string, number>();
    
    for (const [category, categoryItems] of groupedItems) {
      const total = categoryItems.reduce(
        (sum, item) => sum + item.value, 0
      );
      totals.set(category, total);
    }
    
    return totals;
  });
</script>
```


## $derived.by - 明示的な派生値

`$derived.by`は、関数を明示的に渡して派生値を作成する別の構文です。
通常の`$derived`と機能的には同じですが、コードの意図をより明確にしたい場合に使用します。

```svelte
<script lang="ts">
  let searchTerm = $state('');
  let data = $state<string[]>([]);
  
  // $derived.byを使用した明示的な派生値
  let searchResults = $derived.by(() => {
    if (!searchTerm) return data;
    
    const term = searchTerm.toLowerCase();
    return data.filter(item => 
      item.toLowerCase().includes(term)
    );
  });
  
  // 通常の$derivedと同じ（好みの問題）
  let searchResults2 = $derived(() => {
    // 同じロジック
  });
</script>
```


## 非同期処理との組み合わせ

`$derived`自体は同期的な計算のみをサポートしますが、
非同期処理の結果を扱うためのパターンを理解することも重要です。

:::warning[非同期派生値の注意]
`$derived`は同期的に値を返す必要があります。非同期処理には`$effect`を組み合わせて使用します。
:::

```svelte
<script lang="ts">
  let userId = $state(1);
  let userData = $state<User | null>(null);
  let loading = $state(false);
  let error = $state<Error | null>(null);
  
  // URLは同期的に派生
  let apiUrl = $derived(
    `/api/users/${userId}`
  );
  
  // 非同期処理は$effectで実行
  $effect(async () => {
    loading = true;
    error = null;
    
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error('Failed to fetch');
      userData = await response.json();
    } catch (e) {
      error = e as Error;
    } finally {
      loading = false;
    }
  });
</script>
```


## 実践例：シンプルなフィルタリング

実際のアプリケーションでよく使われる、商品リストのフィルタリング機能を実装してみましょう。
複数の条件を組み合わせた動的なフィルタリングと、リアルタイムの統計情報表示を実現します。

```svelte live ln
<script lang="ts">
  interface Product {
    id: number;
    name: string;
    category: string;
    price: number;
    inStock: boolean;
    rating: number;
  }
  
  let products = $state<Product[]>([
    { id: 1, name: 'ノートPC Pro', category: 'パソコン', price: 150000, inStock: true, rating: 4.5 },
    { id: 2, name: 'ワイヤレスマウス', category: '周辺機器', price: 3000, inStock: true, rating: 4.0 },
    { id: 3, name: '機械式キーボード', category: '周辺機器', price: 12000, inStock: false, rating: 4.8 },
    { id: 4, name: 'ウェブカメラ HD', category: '周辺機器', price: 8000, inStock: true, rating: 3.5 },
    { id: 5, name: 'デスクトップPC', category: 'パソコン', price: 200000, inStock: true, rating: 4.7 },
    { id: 6, name: 'USBハブ', category: '周辺機器', price: 2000, inStock: true, rating: 3.8 }
  ]);
  
  // フィルタ条件
  let searchQuery = $state('');
  let selectedCategory = $state('all');
  let minPrice = $state(0);
  let maxPrice = $state(300000);
  let onlyInStock = $state(false);
  let minRating = $state(0);
  
  // カテゴリ一覧を動的に生成
  let categories = $derived.by(() => {
    const cats = new Set(products.map(p => p.category));
    return ['all', ...Array.from(cats)];
  });
  
  // フィルタリングされた商品
  let filteredProducts = $derived.by(() => {
    return products.filter(product => {
      // 検索クエリ
      if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // カテゴリ
      if (selectedCategory !== 'all' && product.category !== selectedCategory) {
        return false;
      }
      
      // 価格範囲
      if (product.price < minPrice || product.price > maxPrice) {
        return false;
      }
      
      // 在庫
      if (onlyInStock && !product.inStock) {
        return false;
      }
      
      // 評価
      if (product.rating < minRating) {
        return false;
      }
      
      return true;
    });
  });
  
  // 統計情報
  let stats = $derived.by(() => {
    const total = filteredProducts.length;
    const avgPrice = total > 0
      ? filteredProducts.reduce((sum, p) => sum + p.price, 0) / total
      : 0;
    const avgRating = total > 0
      ? filteredProducts.reduce((sum, p) => sum + p.rating, 0) / total
      : 0;
    const inStockCount = filteredProducts.filter(p => p.inStock).length;
    
    return {
      total,
      avgPrice: Math.round(avgPrice),
      avgRating: avgRating.toFixed(1),
      inStockCount
    };
  });
</script>

<div class="search-filter-demo">
  <div class="filters">
    <h3>フィルタ条件</h3>
    
    <div class="filter-group">
      <label for="search">検索:</label>
      <input
        id="search"
        type="text"
        bind:value={searchQuery}
        placeholder="商品名で検索..."
      />
    </div>
    
    <div class="filter-group">
      <label for="category">カテゴリ:</label>
      <select id="category" bind:value={selectedCategory}>
        {#each categories as category}
          <option value={category}>
            {category === 'all' ? '全て' : category}
          </option>
        {/each}
      </select>
    </div>
    
    <div class="filter-group">
      <label for="min-price">価格範囲:</label>
      <div class="range-inputs">
        <input
          id="min-price"
          type="number"
          bind:value={minPrice}
          min="0"
          max={maxPrice}
        />
        <span>〜</span>
        <input
          id="max-price"
          type="number"
          bind:value={maxPrice}
          min={minPrice}
        />
      </div>
    </div>
    
    <div class="filter-group">
      <label>
        <input type="checkbox" bind:checked={onlyInStock} />
        在庫ありのみ
      </label>
    </div>
    
    <div class="filter-group">
      <label for="min-rating">最低評価: {minRating}</label>
      <input
        id="min-rating"
        type="range"
        bind:value={minRating}
        min="0"
        max="5"
        step="0.5"
      />
    </div>
  </div>
  
  <div class="results">
    <div class="stats">
      <span>該当商品: {stats.total}件</span>
      <span>平均価格: ¥{stats.avgPrice.toLocaleString()}</span>
      <span>平均評価: ★{stats.avgRating}</span>
      <span>在庫あり: {stats.inStockCount}件</span>
    </div>
    
    <div class="product-list">
      {#if filteredProducts.length === 0}
        <p class="no-results">該当する商品がありません</p>
      {:else}
        {#each filteredProducts as product}
          <div class="product-card">
            <h4>{product.name}</h4>
            <p class="category">{product.category}</p>
            <p class="price">¥{product.price.toLocaleString()}</p>
            <p class="rating">★ {product.rating}</p>
            <p class="stock" class:out-of-stock={!product.inStock}>
              {product.inStock ? '在庫あり' : '在庫なし'}
            </p>
          </div>
        {/each}
      {/if}
    </div>
  </div>
</div>

<style>
  .search-filter-demo {
    display: grid;
    grid-template-columns: 250px 1fr;
    gap: 2rem;
    padding: 1rem;
  }
  
  .filters {
    color: white;
    background: #446;
    padding: 1rem;
    border-radius: 8px;
  }
  
  .filter-group {
    margin-bottom: 1rem;
    width: 100%;
  }
  
  .filter-group label {
    display: block;
    margin-bottom: 0.25rem;
    font-weight: bold;
  }
  
  .filter-group input[type="text"],
  .filter-group input[type="number"],
  .filter-group select {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    box-sizing: border-box;
  }
  
  .range-inputs {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .range-inputs input {
    width: 80px;
  }
  
  .stats {
    display: flex;
    color: black;
    gap: 1rem;
    padding: 1rem;
    background: #e8f4ff;
    border-radius: 4px;
    margin-bottom: 1rem;
    font-size: 0.9rem;
  }
  
  .product-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
  }
  
  .product-card {
    padding: 1rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    background: #cce;
  }
  
  .product-card h4 {
    margin: 0 0 0.5rem 0;
    color: white;
  }
  
  .product-card p {
    margin: 0.25rem 0;
    font-size: 0.9rem;
  }
  
  .category {
    color: #666;
  }
  
  .price {
    font-weight: bold;
    color: #ff3e00;
  }
  
  .stock {
    color: green;
  }
  
  .stock.out-of-stock {
    color: #999;
  }
  .rating {
    color: white;
  }

  .no-results {
    grid-column: 1 / -1;
    text-align: center;
    padding: 2rem;
    color: #666;
  }
</style>
```

## パフォーマンス最適化

`$derived`を効率的に使用するためのパフォーマンス最適化テクニックを紹介します。
大規模なデータや複雑な計算を扱う際に特に重要です。

### メモ化

`$derived`の最大の利点の一つは、自動的なメモ化です。
同じ依存関係の値では再計算されず、キャッシュされた結果が使用されます。

`$derived`は自動的にメモ化されます。同じ依存関係の値では再計算されません。

```svelte
<script lang="ts">
  let numbers = $state([1, 2, 3, 4, 5]);
  let multiplier = $state(2);
  
  // この計算は依存関係が変わらない限り実行されない
  let expensiveCalculation = $derived(() => {
    console.log('計算実行'); // 依存関係が変わった時のみ出力
    return numbers.reduce((sum, n) => {
      // 重い計算をシミュレート
      for (let i = 0; i < 1000000; i++) {
        Math.sqrt(i);
      }
      return sum + n * multiplier;
    }, 0);
  });
</script>
```

### 細分化

大きな派生値を小さな部分に分割することで、パフォーマンスを向上できます。
各派生値が独立してメモ化されるため、必要な部分だけが再計算されます。

大きな派生値を小さな部分に分割することで、パフォーマンスを向上できます。

```svelte
<script lang="ts">
  // ❌ 悪い例：すべてを1つの派生値で計算
  let everything = $derived(() => {
    const filtered = items.filter(/* ... */);
    const sorted = filtered.sort(/* ... */);
    const grouped = groupBy(sorted, /* ... */);
    const stats = calculateStats(grouped);
    return { filtered, sorted, grouped, stats };
  });
  
  // ✅ 良い例：段階的に派生値を作成
  let filtered = $derived(() => items.filter(/* ... */));
  let sorted = $derived(() => [...filtered].sort(/* ... */));
  let grouped = $derived(() => groupBy(sorted, /* ... */));
  let stats = $derived(() => calculateStats(grouped));
</script>
```

## まとめ

`$derived`ルーンは、リアクティブな値から新しい値を派生させる強力な機能です。
主な特徴と利点は以下の通りです。

- **自動追跡** - 依存関係を自動的に検出
- **メモ化** - 不要な再計算を避ける
- **型安全** - TypeScriptの型推論が機能
- **宣言的** - 計算ロジックを明確に表現

:::info[他のフレームワークとの比較]
- **Vue**: `computed`とほぼ同じ
- **React**: `useMemo`と似ているが、依存配列が不要
- **Angular**: Computed signalsと類似
- **MobX**: `computed`と同じ概念
:::

## 関連ドキュメント

### さらに深く理解する

- [📖 $derived vs $effect vs $derived.by 完全比較ガイド](/deep-dive/derived-vs-effect-vs-derived-by/)
  - 3つのリアクティビティ手法の詳細な比較
  - 使い分けのガイドライン
  - パフォーマンスの考慮事項

## 次のステップ

`$derived`で派生値の作成方法を学んだら、次は副作用の管理方法を学びましょう。
[$effect - 副作用](/svelte/runes/effect/)では、リアクティブな値の変更に応じて副作用を実行する方法を詳しく解説します。

