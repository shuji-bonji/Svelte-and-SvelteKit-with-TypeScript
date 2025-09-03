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

Svelte 5では、リアクティビティを扱うための3つの主要な方法があります。これらはそれぞれ異なる目的と使用場面を持ち、適切に使い分けることが重要です。

1. **`$derived`** - 他の値から計算される派生値（シンプルな計算向け）
   - 単一の式で表現できる計算に最適
   - 自動的にメモ化されるため、パフォーマンスが良い
   
2. **`$effect`** - 副作用を実行するための仕組み（DOM操作、API呼び出しなど）
   - 値を返さず、外部への影響を与える処理に使用
   - クリーンアップ処理もサポート
   
3. **`derived.by`** - より複雑な派生ロジックのための関数ベースアプローチ
   - 複数ステップの計算や条件分岐を含む処理に適している
   - デバッグしやすい構造を提供

それぞれには明確な役割があり、適切に使い分けることで、効率的でメンテナブルなコードを書くことができます。

## 基本的な違い

### `$derived` - シンプルな派生値

`$derived`は、他のリアクティブな値から自動的に計算される派生値を作成します。Vue.jsの`computed`やReactの`useMemo`に相当する機能です。

```svelte
<script lang="ts">
  // リアクティブな状態
  let count = $state(0);
  
  // count が変更されると自動的に再計算される
  let doubled = $derived(count * 2);
  
  // 複数の依存関係も自動追跡される
  let message = $derived(`カウント: ${count}, 2倍: ${doubled}`);
  
  // オブジェクトや配列の操作も可能
  let items = $state([1, 2, 3]);
  let sum = $derived(items.reduce((a, b) => a + b, 0));
</script>
```

#### 特徴
- **式ベース**: 単一の式として記述する必要がある
- **自動追跡**: 使用されているリアクティブな値を自動的に検出
- **メモ化**: 依存する値が変わらない限り、再計算されない
- **純粋性**: 副作用（console.log、DOM操作など）は実行できない

### `$effect` - 副作用の実行

`$effect`は、リアクティブな値の変更に応じて副作用を実行するための仕組みです。DOM操作、API呼び出し、外部ライブラリとの連携などに使用します。

```svelte
<script lang="ts">
  let count = $state(0);
  let name = $state('Alice');
  
  // count が変更されるたびに実行される
  $effect(() => {
    console.log(`カウントが変更されました: ${count}`);
    
    // クリーンアップ関数を返すことで、次の実行前に処理を行える
    // コンポーネントのアンマウント時にも実行される
    return () => {
      console.log('前回のエフェクトをクリーンアップ');
    };
  });
  
  // 複数の依存関係も自動的に追跡される
  $effect(() => {
    // count または name が変更されると実行
    document.title = `${name}: ${count}`;
  });
  
  // タイマーの例（クリーンアップが重要）
  $effect(() => {
    const timer = setInterval(() => {
      console.log(`現在のカウント: ${count}`);
    }, 1000);
    
    // タイマーをクリーンアップ（メモリリーク防止）
    return () => clearInterval(timer);
  });
</script>
```

#### 特徴
- **副作用専用**: DOM操作、API呼び出し、ログ出力などの外部への影響を扱う
- **クリーンアップ**: 関数を返すことで、次回実行前やアンマウント時の処理が可能
- **自動実行**: 依存する値が変更されると自動的に再実行される
- **値を返さない**: 計算結果を保持する用途には使用できない

### `derived.by` - 関数ベースの派生値

`derived.by`は、複雑な計算ロジックを含む派生値を作成するための関数ベースのアプローチです。`$derived`では表現しづらい、複数ステップの処理や条件分岐を含む計算に適しています。

```svelte
<script lang="ts">
  interface Item {
    id: number;
    name: string;
    category: string;
    price: number;
  }
  
  let items = $state<Item[]>([]);
  let filter = $state('');
  let sortOrder = $state<'asc' | 'desc'>('asc');
  let selectedCategory = $state<string | null>(null);
  
  // 複雑なロジックを含む派生値
  let filteredAndSorted = $derived.by(() => {
    // ステップ1: カテゴリーフィルタリング
    let result = selectedCategory 
      ? items.filter(item => item.category === selectedCategory)
      : items;
    
    // ステップ2: テキストフィルタリング
    if (filter) {
      const searchTerm = filter.toLowerCase();
      result = result.filter(item => 
        item.name.toLowerCase().includes(searchTerm)
      );
    }
    
    // ステップ3: ソート処理
    const sorted = [...result].sort((a, b) => {
      const comparison = a.name.localeCompare(b.name);
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    // デバッグ用のログ（開発時のみ）
    if (import.meta.env.DEV) {
      console.log('フィルタリング結果:', sorted.length, '件');
    }
    
    // ステップ4: 結果を返す
    return sorted;
  });
</script>
```

#### 特徴
- **関数スコープ**: 中間変数や複数のステップを自然に記述できる
- **条件分岐**: if文やswitch文を使った複雑な条件分岐が可能
- **デバッグ容易**: console.logやブレークポイントを設定しやすい
- **純粋関数**: 副作用は禁止（$effectと同様の処理は書けない）
- **パフォーマンス**: $derivedと同様にメモ化される

## 実践的な比較例

### ショッピングカートの実装

実際のアプリケーションでよくあるショッピングカート機能を例に、3つの手法の使い分けを見てみましょう。

```svelte
<script lang="ts">
  // カートアイテムの型定義
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
  // 単一の式で表現できる小計の計算
  let subtotal = $derived(
    cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  );
  
  // アイテム数も$derivedで簡単に計算
  let totalItems = $derived(
    cartItems.reduce((sum, item) => sum + item.quantity, 0)
  );
  
  // 2. derived.by - 複雑な計算ロジック
  // 複数のステップと条件分岐を含む合計金額の計算
  let total = $derived.by(() => {
    // ステップ1: 小計を取得
    const baseAmount = subtotal;
    
    // ステップ2: 割引を適用（割引コードが有効な場合のみ）
    const discountAmount = discountPercent > 0 
      ? baseAmount * (discountPercent / 100)
      : 0;
    const afterDiscount = baseAmount - discountAmount;
    
    // ステップ3: 税金を計算（割引後の金額に対して）
    const tax = afterDiscount * taxRate;
    
    // ステップ4: 送料を計算（条件付き）
    const shipping = afterDiscount >= 10000 ? 0 : 500; // 1万円以上で送料無料
    
    // ステップ5: 最終的な結果オブジェクトを返す
    return {
      subtotal: baseAmount,
      discount: discountAmount,
      tax: tax,
      shipping: shipping,
      total: afterDiscount + tax + shipping
    };
  });
  
  // 3. $effect - 副作用（ローカルストレージへの保存）
  $effect(() => {
    // カートの内容をローカルストレージに保存（永続化）
    // 注意: これは副作用なので $derived では実行できない
    localStorage.setItem('cart', JSON.stringify(cartItems));
    
    // デバッグ用のログ（開発環境のみ）
    if (import.meta.env.DEV) {
      console.log('カートが更新されました:', {
        items: cartItems.length,
        totalItems: totalItems,
        total: total.total
      });
    }
  });
  
  // 4. 割引コードの検証（$effectの実践例）
  $effect(() => {
    // 非同期処理を含む副作用
    // AbortControllerでキャンセル可能にする（クリーンアップ処理）
    const controller = new AbortController();
    
    const validateDiscount = async () => {
      if (discountCode) {
        try {
          // APIリクエスト（副作用）
          const response = await fetch(
            `/api/validate-discount/${discountCode}`,
            { signal: controller.signal }
          );
          const data = await response.json();
          
          // 状態を更新（この更新も副作用の一部）
          discountPercent = data.percent || 0;
        } catch (error) {
          // エラー時は割引をリセット
          if (error.name !== 'AbortError') {
            discountPercent = 0;
          }
        }
      } else {
        // 割引コードが空の場合はリセット
        discountPercent = 0;
      }
    };
    
    validateDiscount();
    
    // クリーンアップ: 前のリクエストをキャンセル
    return () => controller.abort();
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
    {#if total.shipping > 0}
      <div>送料: ¥{total.shipping.toLocaleString()}</div>
    {:else}
      <div>送料: 無料</div>
    {/if}
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

単一の式で表現できるシンプルな計算には`$derived`が最適です。コードが簡潔で読みやすくなります。

```typescript
// ✅ シンプルな文字列結合
let fullName = $derived(`${firstName} ${lastName}`);

// ✅ 単一の条件式
let isValid = $derived(email.includes('@') && password.length >= 8);

// ✅ 配列の単純な変換
let upperCaseNames = $derived(names.map(n => n.toUpperCase()));

// ✅ 算術計算
let total = $derived(price * quantity);
let discountedPrice = $derived(price * (1 - discountRate));

// ✅ 配列のフィルタリング（シンプルな条件）
let activeUsers = $derived(users.filter(u => u.isActive));

// ❌ 避けるべき例：複雑すぎる式
// これは derived.by を使うべき
let result = $derived(
  items
    .filter(item => item.category === category && item.price < maxPrice)
    .sort((a, b) => a.price - b.price)
    .slice(0, 10)
    .map(item => ({ ...item, discounted: item.price * 0.9 }))
);
```

### `derived.by`を使うべき場合

複雑な計算ロジック、複数のステップ、条件分岐が含まれる場合は`derived.by`を使用します。

```typescript
// ✅ 複数ステップの処理
let processedData = $derived.by(() => {
  // ステップごとに中間変数を使える
  const filtered = data.filter(item => item.active);
  const sorted = filtered.sort((a, b) => b.priority - a.priority);
  const grouped = groupBy(sorted, 'category');
  
  // 最終結果を返す
  return grouped;
});

// ✅ 複雑な条件分岐
let displayValue = $derived.by(() => {
  // early return パターンが使える
  if (isLoading) return 'Loading...';
  if (error) return `Error: ${error.message}`;
  if (!data) return 'No data';
  
  // データの形式に応じて処理を分岐
  if (Array.isArray(data)) {
    return `${data.length} items`;
  } else if (typeof data === 'object') {
    return formatObject(data);
  } else {
    return String(data);
  }
});

// ✅ デバッグが必要な複雑な計算
let complexCalculation = $derived.by(() => {
  console.log('入力値:', value1);
  
  // ステップ1: 前処理
  const normalized = normalizeData(value1);
  console.log('正規化後:', normalized);
  
  // ステップ2: 計算
  const intermediate = calculateSomething(normalized);
  console.log('中間結果:', intermediate);
  
  // ステップ3: 後処理
  const result = finalCalculation(intermediate);
  console.log('最終結果:', result);
  
  return result;
});

// ✅ try-catch が必要な処理
let safeCalculation = $derived.by(() => {
  try {
    return riskyOperation(data);
  } catch (error) {
    console.error('計算エラー:', error);
    return defaultValue;
  }
});
```

### `$effect`を使うべき場合

外部への影響（副作用）を扱う場合は必ず`$effect`を使用します。値を返さない処理が特徴です。

```typescript
// ✅ DOM操作（Svelte外のDOM要素を操作）
$effect(() => {
  const element = document.getElementById('chart');
  if (element) {
    // 外部ライブラリでチャートを描画（副作用）
    renderChart(element, data);
  }
});

// ✅ 外部ライブラリとの連携（クリーンアップ付き）
$effect(() => {
  // Chart.jsなどのライブラリのインスタンスを作成
  const chart = new Chart(canvas, {
    data: chartData,
    options: chartOptions
  });
  
  // クリーンアップ: コンポーネントアンマウント時に破棄
  return () => chart.destroy();
});

// ✅ API呼び出し（非同期処理）
$effect(() => {
  // AbortControllerでキャンセル可能にする
  const controller = new AbortController();
  
  fetch(`/api/data/${id}`, { signal: controller.signal })
    .then(res => res.json())
    .then(data => {
      // 取得したデータで状態を更新（副作用）
      result = data;
    })
    .catch(error => {
      if (error.name !== 'AbortError') {
        console.error('APIエラー:', error);
      }
    });
  
  // クリーンアップ: 前のリクエストをキャンセル
  return () => controller.abort();
});

// ✅ タイマーやイベントリスナー
$effect(() => {
  // 定期的に時刻を更新（副作用）
  const timer = setInterval(() => {
    time = new Date();
  }, 1000);
  
  // ウィンドウサイズの監視
  const handleResize = () => {
    windowWidth = window.innerWidth;
    windowHeight = window.innerHeight;
  };
  window.addEventListener('resize', handleResize);
  
  // クリーンアップ: タイマーとイベントリスナーを削除
  return () => {
    clearInterval(timer);
    window.removeEventListener('resize', handleResize);
  };
});

// ✅ ローカルストレージとの同期
$effect(() => {
  // ブラウザのストレージに保存（副作用）
  localStorage.setItem('user-preferences', JSON.stringify(preferences));
});

// ✅ デバッグ・ロギング
$effect(() => {
  // 開発環境でのみログ出力（副作用）
  if (import.meta.env.DEV) {
    console.log('State changed:', { count, items, total });
  }
});
```

## パフォーマンスの考慮

### 計算の最適化

適切な手法を選ぶことで、パフォーマンスと可読性の両方を向上させることができます。

```svelte
<script lang="ts">
  interface Item {
    id: number;
    name: string;
    description?: string;
    tags: string[];
  }
  
  let items = $state<Item[]>([]);
  let searchTerm = $state('');
  
  // ❌ 非効率: $effectで結果を設定
  // 問題: 不要な再レンダリングとメモ化されない
  let searchResults = $state<Item[]>([]);
  $effect(() => {
    // これは副作用ではなく計算なので、$derivedを使うべき
    searchResults = items.filter(item => 
      item.name.includes(searchTerm)
    );
  });
  
  // ✅ 効率的: $derivedを使用
  // 利点: 自動的にメモ化され、必要な時のみ再計算
  let searchResults = $derived(
    items.filter(item => 
      item.name.includes(searchTerm)
    )
  );
  
  // ✅ さらに複雑な場合はderived.by
  // 利点: 条件分岐と最適化が可能
  let searchResults = $derived.by(() => {
    // 早期リターンで不要な処理をスキップ
    if (!searchTerm) return items;
    
    // 検索用に最適化
    const term = searchTerm.toLowerCase();
    const keywords = term.split(' ').filter(k => k.length > 0);
    
    return items.filter(item => {
      // 名前での検索
      const nameMatch = item.name.toLowerCase().includes(term);
      if (nameMatch) return true;
      
      // 説明での検索（オプショナル）
      const descMatch = item.description?.toLowerCase().includes(term);
      if (descMatch) return true;
      
      // タグでの検索（すべてのキーワードを含む）
      const tagMatch = keywords.every(keyword =>
        item.tags.some(tag => tag.toLowerCase().includes(keyword))
      );
      
      return tagMatch;
    });
  });
  
  // パフォーマンス測定の例
  let performanceMetrics = $derived.by(() => {
    const start = performance.now();
    const results = searchResults;
    const end = performance.now();
    
    return {
      count: results.length,
      time: end - start,
      message: `${results.length}件（${(end - start).toFixed(2)}ms）`
    };
  });
</script>
```

## まとめ

各手法の特性を理解し、適切に使い分けることが重要です。以下の表で、それぞれの特徴を比較します。

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

以下のフローチャートに従って、適切な手法を選択してください。

1. **値を返す必要があるか？**
   - Yes → 2へ進む
   - No → `$effect`を使用（DOM操作、API呼び出し、ログ出力など）

2. **単一の式で表現できるか？**
   - Yes → `$derived`を使用（シンプルな計算）
   - No → 3へ進む

3. **複数ステップや条件分岐が必要か？**
   - Yes → `derived.by`を使用（複雑な計算ロジック）
   - No → `$derived`を使用（可能な限り簡潔に）

これらを適切に使い分けることで、読みやすく、保守しやすく、パフォーマンスの良いSvelteアプリケーションを構築できます。

## 関連ページ

### 基礎を学ぶ
- [Runesシステム入門](/svelte/runes/runes-introduction/) - Runesの基本概念と全体像
- [$stateルーン](/svelte/runes/state/) - リアクティブな状態管理の基礎
- [$derivedルーン](/svelte/runes/derived/) - 派生値の詳細解説
- [$effectルーン](/svelte/runes/effect/) - 副作用の詳細解説

### さらに深く理解する
- [リアクティブな状態変数とバインディングの違い](/deep-dive/reactive-state-variables-vs-bindings/) - $stateとbind:の使い分け

### 実践的な活用
- [リアクティブストア（.svelte.js/.svelte.ts）](/svelte/advanced/reactive-stores/) - 複数コンポーネント間での状態共有
- [クラスとリアクティビティ](/svelte/advanced/class-reactivity/) - オブジェクト指向とRunesの組み合わせ