---
title: $stateとProxyオブジェクト
description: Svelteが行う、コンパイル時最適化 について詳しく解説を行います
---

<script lang="ts">
  import Mermaid from '$lib/components/Mermaid.svelte';
</script>

<!-- <Mermaid code={svelteCompiler} /> -->

Svelteの状態管理は基本的にはProxyオブジェクトを利用しています。

## Proxyオブジェクトとは

Proxyは、オブジェクトへの操作を「横取り」して、カスタムの動作を定義できるJavaScriptの機能です。ES2015で導入され、オブジェクトの基本操作（読み取り、書き込み、削除など）をインターセプトできます。

```typescript
// 基本的な使い方
const target = { value: 0 };
const proxy = new Proxy(target, {
  get(target, property) {
    console.log(`読み取り: ${String(property)}`);
    return target[property];
  },
  set(target, property, value) {
    console.log(`書き込み: ${String(property)} = ${value}`);
    target[property] = value;
    return true;
  }
});

proxy.value; // "読み取り: value"
proxy.value = 10; // "書き込み: value = 10"
```

## なぜSvelteはProxyを採用したのか

Svelte 5では、リアクティビティシステムの中核にProxyを採用しました。

これにより、

1. **自然な文法**: 通常のJavaScriptのように書ける
2. **自動追跡**: 依存関係を自動的に検出
3. **細粒度の更新**: 変更された部分のみを効率的に更新


## 実例：ショッピングカートの実装と、各アプローチの比較
同じショッピングカート機能を、3つの異なるアプローチで実装してみましょう。

<Tabs activeName="rxjs">

  <TabPanel name="rxjs">

  **RxJS（Angularスタイル）での実装**

  ```typescript
  import { BehaviorSubject, combineLatest, map } from 'rxjs';

  interface CartItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
  }

  class CartServiceRxJS {
    private itemsSubject = new BehaviorSubject<CartItem[]>([]);
    
    // 公開用のObservable
    items$ = this.itemsSubject.asObservable();
    
    // 合計金額の計算
    total$ = this.items$.pipe(
      map(items => items.reduce((sum, item) => 
        sum + (item.price * item.quantity), 0
      ))
    );
    
    // アイテムの追加
    addItem(item: Omit<CartItem, 'quantity'>) {
      const currentItems = this.itemsSubject.value;
      const existingItem = currentItems.find(i => i.id === item.id);
      
      if (existingItem) {
        existingItem.quantity++;
      } else {
        currentItems.push({ ...item, quantity: 1 });
      }
      
      this.itemsSubject.next([...currentItems]);
    }
    
    // 数量の更新
    updateQuantity(id: number, quantity: number) {
      const items = this.itemsSubject.value.map(item =>
        item.id === id ? { ...item, quantity } : item
      );
      this.itemsSubject.next(items);
    }
    
    // アイテムの削除
    removeItem(id: number) {
      const items = this.itemsSubject.value.filter(item => item.id !== id);
      this.itemsSubject.next(items);
    }
  }

  // 使用例
  const cart = new CartServiceRxJS();
  cart.total$.subscribe(total => console.log(`合計: ¥${total}`));
  cart.addItem({ id: 1, name: "商品A", price: 1000 });
  ```

  **メリット**
  - 明示的なデータフロー
  - 強力な演算子（debounce、switchMapなど）
  - 非同期処理との親和性が高い

  **デメリット**
  - 学習曲線が急
  - ボイラープレートが多い
  - サブスクリプション管理が必要
  
  </TabPanel>

  <TabPanel name="vanilla-proxy">

  **素のProxyでの実装**

  ```typescript
  interface CartState {
    items: CartItem[];
    total: number;
  }

  class CartServiceProxy {
    private subscribers: Set<() => void> = new Set();
    private state: CartState;
    public proxy: CartState;
    
    constructor() {
      this.state = {
        items: [],
        total: 0
      };
      
      // Proxyでラップ
      this.proxy = new Proxy(this.state, {
        get: (target, property) => {
          // 配列メソッドもインターセプト
          if (property === 'items') {
            return new Proxy(target.items, {
              get: (arr, arrProp) => {
                const value = arr[arrProp as any];
                // push, splice等のメソッドをラップ
                if (typeof value === 'function') {
                  return (...args: any[]) => {
                    const result = (value as Function).apply(arr, args);
                    this.updateTotal();
                    this.notify();
                    return result;
                  };
                }
                return value;
              },
              set: (arr, index, value) => {
                arr[index as any] = value;
                this.updateTotal();
                this.notify();
                return true;
              }
            });
          }
          return target[property as keyof CartState];
        },
        set: (target, property, value) => {
          target[property as keyof CartState] = value;
          if (property === 'items') {
            this.updateTotal();
          }
          this.notify();
          return true;
        }
      });
    }
    
    private updateTotal() {
      this.state.total = this.state.items.reduce((sum, item) => 
        sum + (item.price * item.quantity), 0
      );
    }
    
    private notify() {
      this.subscribers.forEach(callback => callback());
    }
    
    subscribe(callback: () => void) {
      this.subscribers.add(callback);
      return () => this.subscribers.delete(callback);
    }
    
    addItem(item: Omit<CartItem, 'quantity'>) {
      const existingItem = this.proxy.items.find(i => i.id === item.id);
      if (existingItem) {
        existingItem.quantity++;
      } else {
        this.proxy.items.push({ ...item, quantity: 1 });
      }
    }
    
    updateQuantity(id: number, quantity: number) {
      const item = this.proxy.items.find(i => i.id === id);
      if (item) {
        item.quantity = quantity;
      }
    }
    
    removeItem(id: number) {
      const index = this.proxy.items.findIndex(i => i.id === id);
      if (index !== -1) {
        this.proxy.items.splice(index, 1);
      }
    }
  }

  // 使用例
  const cart = new CartServiceProxy();
  cart.subscribe(() => console.log(`合計: ¥${cart.proxy.total}`));
  cart.addItem({ id: 1, name: "商品A", price: 1000 });
  ```

  **メリット**
  - ネイティブJavaScriptの機能
  - 自然な文法
  - フレームワーク非依存
  
  **デメリット**
  - 手動でのサブスクリプション管理
  - エッジケースの処理が複雑
  - TypeScriptの型推論が弱い

  </TabPanel>
  
  <TabPanel name="svelte5-state">
    
  **Svelte 5の$stateでの実装**

  ```typescript
  // CartStore.svelte.ts
  interface CartItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
  }

  class CartStore {
    // $stateで自動的にリアクティブに
    items = $state<CartItem[]>([]);
    
    // 派生値も自動計算
    get total() {
      return this.items.reduce((sum, item) => 
        sum + (item.price * item.quantity), 0
      );
    }
    
    addItem(item: Omit<CartItem, 'quantity'>) {
      const existingItem = this.items.find(i => i.id === item.id);
      if (existingItem) {
        existingItem.quantity++; // 直接変更でOK！
      } else {
        this.items.push({ ...item, quantity: 1 }); // 配列メソッドも使える！
      }
    }
    
    updateQuantity(id: number, quantity: number) {
      const item = this.items.find(i => i.id === id);
      if (item) {
        item.quantity = quantity; // シンプル！
      }
    }
    
    removeItem(id: number) {
      const index = this.items.findIndex(i => i.id === id);
      if (index !== -1) {
        this.items.splice(index, 1); // 破壊的メソッドもOK！
      }
    }
  }

  export const cart = new CartStore();
  ```

  ```svelte
  <!-- Cart.svelte -->
  <script lang="ts">
    import { cart } from './CartStore.svelte.ts';
    
    // リアクティブな値は自動的に更新される
    $: formattedTotal = `¥${cart.total.toLocaleString()}`;
  </script>

  <div class="cart">
    <h2>ショッピングカート</h2>
    
    {#each cart.items as item}
      <div class="cart-item">
        <span>{item.name}</span>
        <input 
          type="number" 
          bind:value={item.quantity}
          min="1"
        />
        <span>¥{(item.price * item.quantity).toLocaleString()}</span>
        <button onclick={() => cart.removeItem(item.id)}>削除</button>
      </div>
    {/each}
    
    <div class="total">
      合計: {formattedTotal}
    </div>
  </div>
  ```

  **メリット**
  - 最もシンプルな記述
  - 自動的な依存関係追跡
  - 破壊的メソッドも使用可能
  - TypeScriptとの完全な互換性

  **デメリット**
  - Svelteコンポーネント内でのみ使用可能
  - まだ新しい機能（Svelte 5） 

  </TabPanel>
</Tabs>


## ビルトインクラスのリアクティブ拡張

Svelte 5では、ネイティブのビルトインクラスも`$state()`と組み合わせることで自動的にProxyでラップされ、リアクティブになります。

```typescript
// Map - キーバリューストアがリアクティブに
let userPreferences = $state(new Map<string, string>());
userPreferences.set('theme', 'dark'); // UIが自動更新
userPreferences.delete('oldKey'); // 削除も検知

// Set - 重複なしコレクションがリアクティブに
let selectedTags = $state(new Set<string>());
selectedTags.add('svelte'); // 追加を検知
selectedTags.clear(); // クリアも検知

// Date - 日時オブジェクトもリアクティブに
let deadline = $state(new Date());
deadline.setDate(deadline.getDate() + 7); // 1週間後に変更でUI更新

// URL - URL操作がリアクティブに
let apiUrl = $state(new URL('https://api.example.com'));
apiUrl.searchParams.set('page', '2'); // クエリパラメータ変更を検知
apiUrl.pathname = '/v2/users'; // パス変更も検知

// URLSearchParams - クエリパラメータ管理
let queryParams = $state(new URLSearchParams('sort=name&order=asc'));
queryParams.set('filter', 'active'); // パラメータ追加を検知
```

### 実践例：リアクティブなフィルター管理

このデモは、Svelte 5のProxyベースのリアクティビティシステムを実演します。

- **Proxyによる配列の監視**：`push()`や`splice()`などの破壊的メソッドも自動検知
- **$derivedの自動計算**：フィルター数が変更されると自動的に再計算
- **オブジェクトのネストした更新**：`filterState.categories`への変更がUIに即座に反映
- **タグボタン**：クリックすると選択状態が切り替わり、スタイルが動的に変更

チェックボックスやタグをクリックしてみてください。選択したフィルターが即座に反映され、アクティブフィルター数やクエリ文字列が自動更新されます。本番環境では実際のURL形式で、開発時は読みやすい形式で確認できます。

```svelte live ln title=ReactiveFilters.svelte
<script lang="ts">
  // フィルターオプションの定義
  const filterOptions = {
    category: ['電子機器', '書籍', '衣類', '食品', '家具'],
    price: ['0-1000', '1000-5000', '5000-10000', '10000+'],
    brand: ['Apple', 'Sony', 'Samsung', 'Nike', 'Adidas']
  };
  
  const tagOptions = ['新着', 'セール', '人気', '限定', 'おすすめ'];
  
  // シンプルなオブジェクトで状態管理（Proxyでリアクティブに）
  let filterState = $state({
    categories: [] as string[],
    prices: [] as string[],
    brands: [] as string[],
    tags: [] as string[]
  });
  
  // URLパラメータ
  let queryParams = $state({
    query: ''
  });
  
  // カテゴリフィルターの切り替え
  function toggleCategory(category: string) {
    const index = filterState.categories.indexOf(category);
    if (index === -1) {
      filterState.categories.push(category);
    } else {
      filterState.categories.splice(index, 1);
    }
    updateQueryParams();
  }
  
  // 価格フィルターの切り替え
  function togglePrice(price: string) {
    const index = filterState.prices.indexOf(price);
    if (index === -1) {
      filterState.prices.push(price);
    } else {
      filterState.prices.splice(index, 1);
    }
    updateQueryParams();
  }
  
  // ブランドフィルターの切り替え
  function toggleBrand(brand: string) {
    const index = filterState.brands.indexOf(brand);
    if (index === -1) {
      filterState.brands.push(brand);
    } else {
      filterState.brands.splice(index, 1);
    }
    updateQueryParams();
  }
  
  // タグの切り替え
  function toggleTag(tag: string) {
    const index = filterState.tags.indexOf(tag);
    if (index === -1) {
      filterState.tags.push(tag);
    } else {
      filterState.tags.splice(index, 1);
    }
    updateQueryParams();
  }
  
  // クエリパラメータを更新
  function updateQueryParams() {
    const params = new URLSearchParams();
    if (filterState.categories.length > 0) {
      params.set('category', filterState.categories.join(','));
    }
    if (filterState.prices.length > 0) {
      params.set('price', filterState.prices.join(','));
    }
    if (filterState.brands.length > 0) {
      params.set('brand', filterState.brands.join(','));
    }
    if (filterState.tags.length > 0) {
      params.set('tags', filterState.tags.join(','));
    }
    queryParams.query = params.toString();
  }
  
  // アクティブフィルター数（$derivedで自動計算）
  let activeFilterCount = $derived(
    filterState.categories.length +
    filterState.prices.length +
    filterState.brands.length +
    filterState.tags.length
  );
  
  // すべてクリア
  function clearAll() {
    filterState.categories = [];
    filterState.prices = [];
    filterState.brands = [];
    filterState.tags = [];
    queryParams.query = '';
  }
  
  // 選択された商品（デモ用）
  let selectedProducts = $derived(() => {
    let result = [];
    if (filterState.categories.length > 0) {
      result.push(`カテゴリー: ${filterState.categories.join(', ')}`);
    }
    if (filterState.prices.length > 0) {
      result.push(`価格帯: ¥${filterState.prices.join(', ¥')}`);
    }
    if (filterState.brands.length > 0) {
      result.push(`ブランド: ${filterState.brands.join(', ')}`);
    }
    if (filterState.tags.length > 0) {
      result.push(`タグ: ${filterState.tags.join(', ')}`);
    }
    return result;
  });
</script>

<div class="filter-demo">
  <h3>🔍 フィルター管理デモ</h3>
  
  <div class="filter-section">
    <h4>カテゴリー</h4>
    {#each filterOptions.category as category}
      <label>
        <input
          type="checkbox"
          checked={filterState.categories.includes(category)}
          onchange={() => toggleCategory(category)}
        />
        {category}
      </label>
    {/each}
  </div>
  
  <div class="filter-section">
    <h4>価格帯</h4>
    {#each filterOptions.price as price}
      <label>
        <input
          type="checkbox"
          checked={filterState.prices.includes(price)}
          onchange={() => togglePrice(price)}
        />
        ¥{price}
      </label>
    {/each}
  </div>
  
  <div class="filter-section">
    <h4>ブランド</h4>
    {#each filterOptions.brand as brand}
      <label>
        <input
          type="checkbox"
          checked={filterState.brands.includes(brand)}
          onchange={() => toggleBrand(brand)}
        />
        {brand}
      </label>
    {/each}
  </div>
  
  <div class="filter-section">
    <h4>タグ</h4>
    {#each tagOptions as tag}
      <button
        class="tag"
        class:active={filterState.tags.includes(tag)}
        onclick={() => toggleTag(tag)}
      >
        {tag}
      </button>
    {/each}
  </div>
  
  <div class="status">
    <p>📊 アクティブフィルター: <strong>{activeFilterCount}</strong>個</p>
    
    {#if queryParams.query}
      <div class="query-display">
        <p>🔗 本番環境のURLクエリ:</p>
        <code class="url-code">?{queryParams.query}</code>
        
        <p>📝 デコード済み（読みやすい形式）:</p>
        <code class="readable-code">{decodeURIComponent(queryParams.query).split('&').join('\n')}</code>
      </div>
    {:else}
      <p>クエリ文字列: <code>(なし)</code></p>
    {/if}
    
    {#if selectedProducts.length > 0}
      <div class="selected-filters">
        <p><strong>選択中のフィルター:</strong></p>
        <ul>
          {#each selectedProducts as filter}
            <li>{filter}</li>
          {/each}
        </ul>
      </div>
    {/if}
    
    {#if activeFilterCount > 0}
      <button 
        onclick={clearAll}
        class="clear-btn"
      >
        すべてクリア
      </button>
    {/if}
  </div>
</div>

<style>
  .filter-demo {
    padding: 1.5rem;
    background: #f9f9f9;
    border-radius: 8px;
  }
  
  .filter-section {
    margin: 1rem 0;
    padding: 1rem;
    background: white;
    border-radius: 4px;
  }
  
  .filter-section h4 {
    margin: 0 0 0.5rem 0;
    color: #333;
  }
  
  label {
    display: flex;
    align-items: center;
    margin: 0.25rem 0;
    cursor: pointer;
  }
  
  label input {
    margin-right: 0.5rem;
  }
  
  .tag {
    margin: 0.25rem;
    padding: 0.5rem 1rem;
    border: 1px solid #ddd;
    border-radius: 20px;
    background: white;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .tag.active {
    background: #ff3e00;
    color: white;
    border-color: #ff3e00;
  }
  
  .status {
    margin-top: 1rem;
    padding: 1rem;
    background: #e9f5ff;
    border-radius: 4px;
  }
  
  .status p {
    margin: 0.5rem 0;
  }
  
  .status code {
    background: #fff;
    padding: 0.25rem 0.5rem;
    border-radius: 3px;
    font-family: monospace;
  }
  
  .clear-btn {
    margin-top: 0.5rem;
    padding: 0.5rem 1rem;
    background: #dc3545;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .clear-btn:hover {
    background: #c82333;
  }
  
  .selected-filters {
    margin: 1rem 0;
    padding: 0.5rem;
    background: #fff3cd;
    border-radius: 4px;
  }
  
  .selected-filters ul {
    margin: 0.5rem 0;
    padding-left: 1.5rem;
  }
  
  .selected-filters li {
    color: #856404;
  }
  
  .query-display {
    margin: 1rem 0;
  }
  
  .query-display p {
    margin: 0.5rem 0;
    font-size: 0.9rem;
  }
  
  .url-code {
    display: block;
    background: #f1f1f1;
    padding: 0.5rem;
    border-radius: 3px;
    font-family: monospace;
    font-size: 0.85rem;
    word-break: break-all;
    margin: 0.25rem 0;
  }
  
  .readable-code {
    display: block;
    background: #e8f5e9;
    padding: 0.5rem;
    border-radius: 3px;
    font-family: monospace;
    font-size: 0.9rem;
    word-break: break-all;
    margin: 0.25rem 0;
    color: #2e7d32;
  }
</style>
```

## パフォーマンスの最適化

Proxyによるリアクティビティは便利ですが、パフォーマンスを考慮した使い方も重要です。

### 1. 大量データの処理

```typescript
// ❌ 非効率：各アイテムの変更で全体が再レンダリング
let items = $state(Array.from({ length: 10000 }, (_, i) => ({ 
  id: i, 
  value: Math.random() 
})));

// ✅ 効率的：仮想スクロールやページネーションを使用
import VirtualList from 'svelte-virtual-list';

let items = $state([]);
let visibleItems = $derived(() => {
  const start = currentPage * pageSize;
  return items.slice(start, start + pageSize);
});
```

### 2. 頻繁な更新の制御

```typescript
// ❌ 非効率：すべての入力で更新
let searchQuery = $state('');
let results = $derived(async () => {
  return await searchAPI(searchQuery); // 毎回APIコール
});

// ✅ 効率的：デバウンスを使用
let searchQuery = $state('');
let debouncedQuery = $state('');

$effect(() => {
  const timer = setTimeout(() => {
    debouncedQuery = searchQuery;
  }, 300);
  
  return () => clearTimeout(timer);
});

let results = $derived(async () => {
  if (debouncedQuery) {
    return await searchAPI(debouncedQuery);
  }
  return [];
});
```

### 3. 不要な深いリアクティビティの回避

```typescript
// ❌ 非効率：静的なデータも追跡される
let config = $state({
  api: {
    endpoints: {
      users: '/api/users',
      posts: '/api/posts'
    },
    timeout: 5000
  },
  ui: {
    theme: 'dark' // これだけが変更される
  }
});

// ✅ 効率的：変更される部分だけをリアクティブに
const API_CONFIG = {
  endpoints: {
    users: '/api/users',
    posts: '/api/posts'
  },
  timeout: 5000
} as const;

let uiConfig = $state({
  theme: 'dark'
});
```

## Proxyの内部動作

Svelte 5の`$state`がどのようにProxyを使用しているか、簡略化した実装例です。

```typescript
// 簡略化されたSvelte 5の内部実装イメージ
function createState<T extends object>(initial: T): T {
  const subscribers = new Set<() => void>();
  const proxyCache = new WeakMap();
  
  function createProxy(target: any): any {
    // キャッシュチェック
    if (proxyCache.has(target)) {
      return proxyCache.get(target);
    }
    
    const proxy = new Proxy(target, {
      get(obj, prop) {
        const value = obj[prop];
        
        // ネストされたオブジェクトも自動的にProxy化
        if (typeof value === 'object' && value !== null) {
          return createProxy(value);
        }
        
        // 現在のeffectやderivedに依存関係を登録
        trackDependency(obj, prop);
        
        return value;
      },
      
      set(obj, prop, value) {
        const oldValue = obj[prop];
        
        // 値が変更された場合のみ更新
        if (oldValue !== value) {
          obj[prop] = value;
          
          // 依存しているeffectやderivedを再実行
          notifySubscribers();
        }
        
        return true;
      },
      
      has(obj, prop) {
        trackDependency(obj, prop);
        return prop in obj;
      },
      
      deleteProperty(obj, prop) {
        delete obj[prop];
        notifySubscribers();
        return true;
      }
    });
    
    proxyCache.set(target, proxy);
    return proxy;
  }
  
  return createProxy(initial);
}
```

## まとめ

Svelte 5の`$state`は、Proxyの力を活用して以下を実現しています。

| 機能 | Proxyの活用 | 利点 |
|------|------------|------|
| **自然な文法** | オブジェクト・配列の通常操作を検知 | 学習コストが低い |
| **自動追跡** | getトラップで依存関係を記録 | 明示的な宣言不要 |
| **深いリアクティビティ** | ネストされたオブジェクトも自動Proxy化 | 複雑な状態も簡単管理 |
| **ビルトインクラス対応** | Map/Set/Date等もProxy化 | 標準APIがそのまま使える |
| **破壊的メソッド対応** | 配列のpush/splice等も検知 | 自然なコードが書ける |
| **TypeScript統合** | 型情報を保持したまま動作 | 型安全性を維持 |

特に、RxJSの明示的なリアクティビティと、通常のJavaScriptの簡潔さの「いいとこ取り」を実現し、開発体験を大きく向上させています。