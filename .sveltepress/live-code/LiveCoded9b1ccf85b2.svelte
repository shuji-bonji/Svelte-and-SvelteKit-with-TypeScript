<script lang="ts">
  // フィルター状態をMapで管理（各カテゴリごとに選択された値の配列を保持）
  let filters = $state(new Map<string, string[]>([
    ['category', []],
    ['price', []],
    ['brand', []]
  ]));
  
  // 選択されたタグをSetで管理（重複なしのコレクション）
  let selectedTags = $state(new Set<string>());
  
  // URLパラメータで管理
  let urlParams = $state(new URLSearchParams());
  
  // フィルターの追加/削除
  function toggleFilter(type: string, value: string) {
    const current = filters.get(type) || [];
    const index = current.indexOf(value);
    
    if (index === -1) {
      // 新しい配列を作成してMapを更新（リアクティビティのトリガー）
      filters.set(type, [...current, value]);
    } else {
      // フィルターから削除
      filters.set(type, current.filter(v => v !== value));
    }
    
    // URLパラメータも更新
    const updatedFilters = filters.get(type) || [];
    if (updatedFilters.length > 0) {
      urlParams.set(type, updatedFilters.join(','));
    } else {
      urlParams.delete(type);
    }
  }
  
  // タグの切り替え（Setの操作が自動的にリアクティブに）
  function toggleTag(tag: string) {
    if (selectedTags.has(tag)) {
      selectedTags.delete(tag);
    } else {
      selectedTags.add(tag);
    }
  }
  
  // アクティブフィルター数（自動的に再計算される）
  let activeFilterCount = $derived(
    Array.from(filters.values()).reduce((sum, arr) => sum + arr.length, 0) +
    selectedTags.size
  );
  
  // クエリ文字列（URLパラメータが変更されると自動更新）
  let queryString = $derived(urlParams.toString());
  
  // すべてクリア
  function clearAll() {
    // Map.clear()とSet.clear()が自動的にUIを更新
    filters.forEach((_, key) => {
      filters.set(key, []);
    });
    selectedTags.clear();
    // URLパラメータをクリア
    Array.from(urlParams.keys()).forEach(key => {
      urlParams.delete(key);
    });
  }
</script>

<div class="filter-demo">
  <h3>フィルター管理デモ</h3>
  
  <div class="filter-section">
    <h4>カテゴリー</h4>
    {#each ['電子機器', '書籍', '衣類'] as category}
      <label>
        <input
          type="checkbox"
          checked={filters.get('category')?.includes(category)}
          onchange={() => toggleFilter('category', category)}
        />
        {category}
      </label>
    {/each}
  </div>
  
  <div class="filter-section">
    <h4>価格帯</h4>
    {#each ['0-1000', '1000-5000', '5000+'] as price}
      <label>
        <input
          type="checkbox"
          checked={filters.get('price')?.includes(price)}
          onchange={() => toggleFilter('price', price)}
        />
        ¥{price}
      </label>
    {/each}
  </div>
  
  <div class="filter-section">
    <h4>タグ</h4>
    {#each ['新着', 'セール', '人気'] as tag}
      <button
        class="tag"
        class:active={selectedTags.has(tag)}
        onclick={() => toggleTag(tag)}
      >
        {tag}
      </button>
    {/each}
  </div>
  
  <div class="status">
    <p>アクティブフィルター: <strong>{activeFilterCount}</strong>個</p>
    <p>クエリ文字列: <code>{queryString || '(なし)'}</code></p>
    
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
    display: block;
    margin: 0.25rem 0;
    cursor: pointer;
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
</style>