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