---
title: $derived - 派生値・計算プロパティ
description: Svelte 5の$derived/$derived.by完全ガイド - TypeScriptで計算プロパティ・派生値・メモ化を実装。React useMemo/Vue computedとの違い、配列フィルタリング、パフォーマンス最適化を実践コードで解説
---

<script>
	import Admonition from '$lib/components/Admonition.svelte';
	import LiveCode from '$lib/components/LiveCode.svelte';
</script>

`$derived`ルーンは、他のリアクティブな値から自動的に計算される値を作成します。依存する値が変更されると、派生値も自動的に再計算されます。

## この記事で学べること

- `$derived`の基本的な使い方と TypeScript 型推論
- `$derived.by()`で複雑な計算ロジックを実装する
- 配列のフィルタリング・ソート・グルーピングのパターン
- 自動メモ化によるパフォーマンス最適化
- `$derived`のオーバーライド機能（Svelte 5.25+）
- React `useMemo` / Vue `computed` との違い

<Admonition type="tip" title="React 開発者の方へ">

`$derived`は React の`useMemo`と似ていますが、**依存配列を指定する必要がありません**。Svelte が自動的に依存関係を追跡するため、依存配列の管理ミスによるバグから解放されます。

</Admonition>

## $derived と $derived.by の使い分け早見表

`$derived` には**式を直接渡す形**と、**関数 `$derived.by()` を渡す形**の 2 つがあります。まず全体像を先に押さえておきます。

| 書き方 | 用途 | 例 |
| --- | --- | --- |
| `$derived(式)` | 1 行の単純な式で書ける派生値 | `count * 2` / `items.length` |
| `$derived.by(() => { ... })` | 複数ステートメント・条件分岐・配列加工など複雑なロジック | 集計・フィルタ・ソート・グルーピング |

両者の違いを最小コードで確認します。

```svelte
<script lang="ts">
  let count = $state(0);
  let items = $state([10, 20, 30, 40]);

  // $derived(式) - 単純な 1 行で表現できるケース
  let doubled = $derived(count * 2);

  // $derived.by(() => { ... }) - 複数行・条件分岐・配列加工などのケース
  let summary = $derived.by(() => {
    const total = items.reduce((a, b) => a + b, 0);
    const average = total / items.length;
    return { total, average };
  });
</script>

<p>2倍: {doubled}</p>
<p>合計: {summary.total} / 平均: {summary.average}</p>
```

この 2 つの使い分けが分かれば、後述の配列フィルタリングや集計のパターンもそのまま読み進められます。

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

<Admonition type="tip" title="Vue や React との比較">

<ul>
<li>Vue の <code>computed</code> と同じ概念</li>
<li>React の <code>useMemo</code> に似ているが、依存関係の指定が不要</li>
<li>自動的に依存関係を追跡し、必要な時だけ再計算</li>
</ul>

</Admonition>

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

## $derived.by - 複雑な計算ロジック

単純な式では表現しにくい複雑な計算や、複数のステップが必要な処理には、`$derived.by()` を使用します。前述の[早見表](#derived-と-derivedby-の使い分け早見表)のとおり、**複数ステートメント・条件分岐・配列加工**が必要な場面がこちらの担当です。

以下は、商品リストから小計・割引・税額・合計をまとめて計算する実例です。

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

  // $derived.by で複雑な計算
  let summary = $derived.by(() => {
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
  <p>商品数: {summary.itemCount}点</p>
  <p>小計: ¥{summary.subtotal?.toLocaleString() ?? 0}</p>
  <p>割引: -¥{summary.discount?.toLocaleString() ?? 0}</p>
  <p>割引後: ¥{summary.afterDiscount?.toLocaleString() ?? 0}</p>
  <p>税額: ¥{summary.tax?.toLocaleString() ?? 0}</p>
  <p>合計: ¥{summary.total?.toLocaleString() ?? 0}</p>
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

  // フィルタリングされたタスク（複雑なロジックには$derived.byを使用）
  let filteredTasks = $derived.by(() => {
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
  let stats = $derived.by(() => {
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
Map や Object を使って、カテゴリごとの集計や整理が可能です。

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

  // カテゴリごとにグループ化（複雑なロジックには$derived.byを使用）
  let groupedItems = $derived.by(() => {
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
  let categoryTotals = $derived.by(() => {
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

## $derived vs $derived.by の使い分け

`$derived`と`$derived.by`は異なる用途に最適化されています。

```svelte
<script lang="ts">
  let count = $state(0);
  let items = $state<string[]>(['apple', 'banana', 'cherry']);
  let searchTerm = $state('');

  // ✅ $derived - 単純な式に使用
  let doubled = $derived(count * 2);
  let itemCount = $derived(items.length);
  let hasItems = $derived(items.length > 0);

  // ✅ $derived.by - 複雑なロジックに使用
  let searchResults = $derived.by(() => {
    if (!searchTerm) return items;

    const term = searchTerm.toLowerCase();
    return items.filter(item =>
      item.toLowerCase().includes(term)
    );
  });
</script>
```

:::warning[よくある間違い]

```typescript
// ❌ 間違い：複雑なロジックに $derived を使用
let filtered = $derived(() => {
  // 複数行のロジック...
});

// ✅ 正しい：$derived.by を使用
let filtered = $derived.by(() => {
  // 複数行のロジック...
});
```
:::

## $derived のオーバーライド（Svelte 5.25+）

Svelte 5.25 以降では、`$derived`で作成した値を一時的にオーバーライドできるようになりました。
これは、ユーザー入力で派生値を一時的に上書きしたい場合に便利です。

```svelte
<script lang="ts">
  let count = $state(0);

  // 通常は count * 2 を返す
  let doubled = $derived(count * 2);

  function overrideValue() {
    // 一時的にオーバーライド（Svelte 5.25+）
    doubled = 100;
  }

  function resetToCalculated() {
    // count を変更すると、派生値が再計算される
    count = count;
  }
</script>

<p>Count: {count}</p>
<p>Doubled: {doubled}</p>
<button onclick={() => count++}>Increment</button>
<button onclick={overrideValue}>Override to 100</button>
```

:::note[オーバーライドの動作]
- オーバーライドされた値は、依存する状態が変更されるまで維持されます
- 依存状態が変更されると、派生値は再計算されオーバーライドは解除されます
- フォーム入力の一時的な上書きなどに便利です
:::

## 非同期処理との組み合わせ

`$derived`自体は同期的な計算のみをサポートしますが、非同期処理の結果を扱うパターンは非常に重要です。
ここでは、検索需要の多い「非同期データの派生」について詳しく解説します。

:::warning[非同期派生値の注意]
`$derived`は同期的に値を返す必要があります。非同期処理には`$effect`を組み合わせて使用します。
:::

### やってはいけないパターン

```typescript
// ❌ これは動作しません - dataはPromiseになってしまう
let data = $derived(async () => {
  const res = await fetch('/api/data');
  return res.json();
});

// ❌ $derived.byでも同様
let data = $derived.by(async () => {
  const res = await fetch('/api/data');
  return res.json();
});
```

### パターン1: $effect + $state の組み合わせ（基本）

最も基本的なパターンです。URLを同期的に派生させ、データ取得は`$effect`で行います。

```svelte
<script lang="ts">
  interface User {
    id: number;
    name: string;
    email: string;
  }

  let userId = $state(1);
  let userData = $state<User | null>(null);
  let loading = $state(false);
  let error = $state<string | null>(null);

  // URLは同期的に派生（これはOK）
  let apiUrl = $derived(`/api/users/${userId}`);

  // 非同期処理は$effectで実行
  $effect(() => {
    loading = true;
    error = null;

    const controller = new AbortController();

    fetch(apiUrl, { signal: controller.signal })
      .then(response => {
        if (!response.ok) throw new Error('Failed to fetch');
        return response.json();
      })
      .then(data => {
        userData = data;
        loading = false;
      })
      .catch(e => {
        if (e.name !== 'AbortError') {
          error = e.message;
          loading = false;
        }
      });

    // クリーンアップ: コンポーネント破棄時やuserIdが変わった時にリクエストをキャンセル
    return () => controller.abort();
  });

  // 取得したデータから同期的に派生値を計算
  let userDisplayName = $derived(
    userData ? `${userData.name} (${userData.email})` : ''
  );
</script>

<select bind:value={userId}>
  <option value={1}>ユーザー 1</option>
  <option value={2}>ユーザー 2</option>
  <option value={3}>ユーザー 3</option>
</select>

{#if loading}
  <p>読み込み中...</p>
{:else if error}
  <p class="error">エラー: {error}</p>
{:else if userData}
  <p>ユーザー: {userDisplayName}</p>
{/if}
```

### パターン2: デバウンス付き検索

入力値の変更を検知して、デバウンス後にAPIを呼び出すパターンです。

```svelte
<script lang="ts">
  interface SearchResult {
    id: string;
    title: string;
    score: number;
  }

  let searchInput = $state('');
  let debouncedQuery = $state('');
  let results = $state<SearchResult[]>([]);
  let loading = $state(false);

  // デバウンス処理（300ms待機）
  $effect(() => {
    const timer = setTimeout(() => {
      debouncedQuery = searchInput;
    }, 300);

    return () => clearTimeout(timer);
  });

  // デバウンス後のクエリでAPI呼び出し
  $effect(() => {
    if (!debouncedQuery.trim()) {
      results = [];
      return;
    }

    loading = true;
    const controller = new AbortController();

    fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`, {
      signal: controller.signal
    })
      .then(res => res.json())
      .then(data => {
        results = data;
        loading = false;
      })
      .catch(e => {
        if (e.name !== 'AbortError') {
          loading = false;
        }
      });

    return () => controller.abort();
  });

  // 結果から派生値を計算（これは同期的）
  let resultCount = $derived(results.length);
  let hasResults = $derived(results.length > 0);
  let topResults = $derived(results.filter(r => r.score > 0.8));
</script>

<input
  type="search"
  bind:value={searchInput}
  placeholder="検索..."
/>

{#if loading}
  <p>検索中...</p>
{:else if hasResults}
  <p>{resultCount}件の結果（上位: {topResults.length}件）</p>
  <ul>
    {#each results as result}
      <li>&#123;result.title&#125; (スコア: &#123;result.score&#125;)</li>
    {/each}
  </ul>
{:else if searchInput}
  <p>結果なし</p>
{/if}
```

### パターン3: SvelteKitのload関数を活用（推奨）

最も推奨されるパターンです。サーバーサイドでデータを取得し、クライアントでは同期的に派生値を計算します。

```typescript
// src/routes/users/[id]/+page.server.ts
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, fetch }) => {
  const response = await fetch(`/api/users/${params.id}`);

  if (!response.ok) {
    error(404, 'ユーザーが見つかりません');
  }

  const user = await response.json();
  const posts = await fetch(`/api/users/${params.id}/posts`).then((r) =>
    r.json(),
  );

  return { user, posts };
};
```

```svelte
<!-- src/routes/users/[id]/+page.svelte -->
<script lang="ts">
  import type { PageProps } from './$types';

  let { data }: PageProps = $props();

  // サーバーから取得したデータを同期的に派生
  // 非同期処理は不要！
  let fullName = $derived(
    `${data.user.firstName} ${data.user.lastName}`
  );

  let recentPosts = $derived(
    data.posts.filter(post => {
      const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      return new Date(post.createdAt).getTime() > oneWeekAgo;
    })
  );

  let postCount = $derived(data.posts.length);
  let hasRecentActivity = $derived(recentPosts.length > 0);
</script>

<h1>{fullName}</h1>
<p>投稿数: {postCount}件</p>

{#if hasRecentActivity}
  <h2>最近の投稿 ({recentPosts.length}件)</h2>
  <ul>
    {#each recentPosts as post}
      <li>&#123;post.title&#125;</li>
    {/each}
  </ul>
{:else}
  <p>最近の投稿はありません</p>
{/if}
```

### パターン比較表

| パターン         | 用途                   | メリット               | デメリット                         |
| ---------------- | ---------------------- | ---------------------- | ---------------------------------- |
| $effect + $state | クライアントサイド検索 | リアルタイム更新、柔軟 | 初期表示が空、ローディング管理必要 |
| SvelteKit load   | ページ単位のデータ     | SEO対応、SSR、シンプル | URLパラメータ必要                  |
| デバウンス付き   | 入力連動検索           | リクエスト削減         | 遅延が発生                         |

### 非同期処理のベストプラクティス

```typescript
// ✅ 推奨: 非同期データ取得と同期的な派生を分離
let rawData = $state<Data | null>(null);

$effect(() => {
  // 非同期処理
  fetchData().then((data) => {
    rawData = data;
  });
});

// 同期的に派生
let processedData = $derived.by(() => {
  if (!rawData) return [];
  return rawData.items.filter((item) => item.active);
});

// ❌ 避ける: 派生値の中で非同期処理
let data = $derived(await fetchData()); // コンパイルエラー
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
  let expensiveCalculation = $derived.by(() => {
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

```svelte
<script lang="ts">
  // ❌ 悪い例：すべてを1つの派生値で計算
  let everything = $derived.by(() => {
    const filtered = items.filter(/* ... */);
    const sorted = filtered.sort(/* ... */);
    const grouped = groupBy(sorted, /* ... */);
    const stats = calculateStats(grouped);
    return { filtered, sorted, grouped, stats };
  });

  // ✅ 良い例：段階的に派生値を作成（単純な式は$derivedでOK）
  let filtered = $derived(items.filter(i => i.active));
  let sorted = $derived([...filtered].sort((a, b) => a.name.localeCompare(b.name)));
  let grouped = $derived.by(() => groupBy(sorted, 'category'));
  let stats = $derived.by(() => calculateStats(grouped));
</script>
```

## まとめ

`$derived`ルーンは、リアクティブな値から新しい値を派生させる強力な機能です。
主な特徴と利点は以下の通りです。

- **自動追跡** - 依存関係を自動的に検出
- **メモ化** - 不要な再計算を避ける
- **型安全** - TypeScript の型推論が機能
- **宣言的** - 計算ロジックを明確に表現

:::info[他のフレームワークとの比較]

- **Vue**: `computed`とほぼ同じ
- **React**: `useMemo`と似ているが、依存配列が不要
- **Angular**: Computed signals と類似
- **MobX**: `computed`と同じ概念
  :::

## 関連ドキュメント

### さらに深く理解する

- [📖 $derived vs $effect vs $derived.by 完全比較ガイド](/deep-dive/derived-vs-effect-vs-derived-by/)
  - 3 つのリアクティビティ手法の詳細な比較
  - 使い分けのガイドライン
  - パフォーマンスの考慮事項

## よくある質問（FAQ）

### React useMemo との違いは？

| 項目             | React `useMemo`                | Svelte 5 `$derived`  |
| ---------------- | ------------------------------ | -------------------- |
| 宣言方法         | `useMemo(() => value, [deps])` | `$derived(value)`    |
| 依存配列         | **必須**（手動で指定）         | **不要**（自動追跡） |
| 再計算タイミング | deps 変更時                    | 依存値変更時（自動） |
| 複雑なロジック   | 同じ構文                       | `$derived.by()`      |
| メモ化           | deps 指定ミスで無効            | 常に正確             |
| 参照安定性       | deps 次第                      | 値が同じなら同じ     |

### Vue computed との違いは？

| 項目              | Vue 3 `computed`        | Svelte 5 `$derived`          |
| ----------------- | ----------------------- | ---------------------------- |
| 宣言方法          | `computed(() => value)` | `$derived(value)`            |
| ゲッター/セッター | あり                    | なし（オーバーライドで代替） |
| デバッグ          | `onTrack`/`onTrigger`   | `$inspect`                   |
| TypeScript        | `.value`アクセス必要    | 直接アクセス                 |
| 書き込み可能      | 別途定義必要            | 5.25+でオーバーライド可      |

### $derived vs $derived.by の使い分け

| 条件                 | 使うべき API  | 例                            |
| -------------------- | ------------- | ----------------------------- |
| 単純な式（1 行）     | `$derived`    | `$derived(count * 2)`         |
| 配列メソッドチェーン | `$derived`    | `$derived(items.filter(...))` |
| 複数ステートメント   | `$derived.by` | if 文、変数宣言を含む         |
| 早期リターン         | `$derived.by` | 条件による return             |
| ループ処理           | `$derived.by` | for 文、reduce                |

### コード比較：React useMemo vs Svelte $derived

```typescript
// === React useMemo ===
const [items, setItems] = useState<Item[]>([]);
const [filter, setFilter] = useState('');

// 依存配列を手動で管理（漏れるとバグの原因）
const filteredItems = useMemo(() => {
  return items.filter((item) => item.name.includes(filter));
}, [items, filter]); // ← 依存配列必須

// === Svelte 5 $derived ===
let items = $state<Item[]>([]);
let filter = $state('');

// 依存関係は自動追跡（依存配列不要）
let filteredItems = $derived(
  items.filter((item) => item.name.includes(filter)),
);
```

### 配列のフィルタリングパターン

```typescript
// 検索 + フィルタ + ソートの組み合わせ
let items = $state<Product[]>([...]);
let searchQuery = $state('');
let category = $state('all');
let sortBy = $state<'name' | 'price'>('name');

let results = $derived.by(() => {
  let filtered = items;

  // 検索フィルタ
  if (searchQuery) {
    filtered = filtered.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // カテゴリフィルタ
  if (category !== 'all') {
    filtered = filtered.filter(item => item.category === category);
  }

  // ソート
  return [...filtered].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return a.price - b.price;
  });
});
```

### パフォーマンス：いつ$derived を分割すべきか？

| シナリオ               | アプローチ     | 理由               |
| ---------------------- | -------------- | ------------------ |
| 軽量な計算             | 1 つの$derived | オーバーヘッド少   |
| 重い計算 + 軽い計算    | 分割           | 軽い方の再計算回避 |
| 異なる依存関係         | 分割           | 独立した再計算     |
| UI 表示用 + API 送信用 | 分割           | 用途別に最適化     |

```typescript
// ❌ 結合された派生値（どちらかの依存が変わると全て再計算）
let combined = $derived.by(() => ({
  filtered: heavyFilter(items),
  stats: calculateStats(otherData),
}));

// ✅ 分割された派生値（独立して再計算）
let filtered = $derived.by(() => heavyFilter(items));
let stats = $derived.by(() => calculateStats(otherData));
```

## 次のステップ

`$derived`で派生値の作成方法を学んだら、次は副作用の管理方法を学びましょう。
[$effect - 副作用](/svelte/runes/effect/)では、リアクティブな値の変更に応じて副作用を実行する方法を詳しく解説します。
