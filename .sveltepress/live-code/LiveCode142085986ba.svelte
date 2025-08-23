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