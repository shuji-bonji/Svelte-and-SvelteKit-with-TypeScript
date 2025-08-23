<script lang="ts">
  interface Repository {
    id: number;
    name: string;
    full_name: string;
    description: string;
    html_url: string;
    stargazers_count: number;
    language: string;
  }
  
  let searchQuery = $state('');
  let repositories = $state<Repository[]>([]);
  let searching = $state(false);
  let totalCount = $state(0);
  let errorMessage = $state('');
  
  // デバウンス付き検索
  $effect(() => {
    if (!searchQuery.trim()) {
      repositories = [];
      totalCount = 0;
      errorMessage = '';
      return;
    }
    
    searching = true;
    errorMessage = '';
    
    // 800ms のデバウンス
    const timeoutId = setTimeout(async () => {
      try {
        // GitHub API を使用（認証不要）
        const response = await fetch(
          `https://api.github.com/search/repositories?q=${encodeURIComponent(searchQuery)}&sort=stars&order=desc&per_page=10`
        );
        
        if (!response.ok) {
          if (response.status === 403) {
            throw new Error('APIのレート制限に達しました。しばらくお待ちください。');
          }
          throw new Error(`検索に失敗しました: ${response.status}`);
        }
        
        const data = await response.json();
        repositories = data.items || [];
        totalCount = data.total_count || 0;
      } catch (e) {
        console.error('検索エラー:', e);
        errorMessage = e instanceof Error ? e.message : '検索中にエラーが発生しました';
        repositories = [];
        totalCount = 0;
      } finally {
        searching = false;
      }
    }, 800);
    
    // クリーンアップ: タイマーをクリア
    return () => {
      clearTimeout(timeoutId);
    };
  });
  
  function formatStars(count: number): string {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  }
</script>

<div class="search-container">
  <h4>GitHubリポジトリ検索</h4>
  
  <input 
    bind:value={searchQuery}
    placeholder="リポジトリを検索（例: svelte, react, vue）"
    class="search-input"
  />
  
  <div class="status">
    {#if searching}
      <span class="searching">🔍 検索中...</span>
    {:else if searchQuery && !errorMessage}
      <span class="results-count">
        {totalCount.toLocaleString()}件の結果
        {#if totalCount > 10}
          （上位10件を表示）
        {/if}
      </span>
    {/if}
  </div>
  
  {#if errorMessage}
    <div class="error-message">
      ⚠️ {errorMessage}
    </div>
  {/if}
  
  {#if repositories.length > 0}
    <ul class="repo-list">
      {#each repositories as repo}
        <li class="repo-item">
          <div class="repo-header">
            <a href={repo.html_url} target="_blank" rel="noopener noreferrer" class="repo-name">
              {repo.full_name}
            </a>
            <span class="stars">
              ⭐ {formatStars(repo.stargazers_count)}
            </span>
          </div>
          {#if repo.description}
            <p class="repo-description">{repo.description}</p>
          {/if}
          {#if repo.language}
            <span class="language" style="--lang-color: {getLanguageColor(repo.language)}">
              {repo.language}
            </span>
          {/if}
        </li>
      {/each}
    </ul>
  {:else if searchQuery && !searching && !errorMessage}
    <p class="no-results">検索結果がありません</p>
  {/if}
</div>

<script module lang="ts">
  function getLanguageColor(language: string): string {
    const colors: Record<string, string> = {
      JavaScript: '#f1e05a',
      TypeScript: '#3178c6',
      Python: '#3572A5',
      Java: '#b07219',
      'C++': '#f34b7d',
      'C#': '#178600',
      PHP: '#4F5D95',
      Ruby: '#701516',
      Go: '#00ADD8',
      Swift: '#FA7343',
      Kotlin: '#A97BFF',
      Rust: '#dea584',
      Vue: '#41b883',
      HTML: '#e34c26',
      CSS: '#563d7c',
      Shell: '#89e051',
      PowerShell: '#012456'
    };
    return colors[language] || '#6e7681';
  }
</script>

<style>
  .search-container {
    max-width: 600px;
    margin: 0 auto;
  }
  
  .search-input {
    width: 100%;
    padding: 0.75rem;
    font-size: 1rem;
    border: 2px solid #e1e4e8;
    border-radius: 6px;
    transition: border-color 0.2s;
  }
  
  .search-input:focus {
    outline: none;
    border-color: #0366d6;
  }
  
  .status {
    margin: 0.5rem 0;
    font-size: 0.9rem;
    min-height: 1.5rem;
  }
  
  .searching {
    color: #0366d6;
  }
  
  .results-count {
    color: #586069;
  }
  
  .error-message {
    padding: 0.75rem;
    background: #ffeef0;
    color: #d73a49;
    border-radius: 6px;
    margin: 1rem 0;
  }
  
  .repo-list {
    list-style: none;
    padding: 0;
    margin: 1rem 0 0 0;
  }
  
  .repo-item {
    padding: 1rem;
    border: 1px solid #e1e4e8;
    border-radius: 6px;
    margin-bottom: 0.75rem;
    transition: border-color 0.2s;
  }
  
  .repo-item:hover {
    border-color: #0366d6;
  }
  
  .repo-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }
  
  .repo-name {
    font-weight: 600;
    color: #0366d6;
    text-decoration: none;
    font-size: 1.1rem;
  }
  
  .repo-name:hover {
    text-decoration: underline;
  }
  
  .stars {
    color: #586069;
    font-size: 0.9rem;
    white-space: nowrap;
  }
  
  .repo-description {
    margin: 0.5rem 0;
    color: #586069;
    font-size: 0.95rem;
    line-height: 1.5;
  }
  
  .language {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    background: #f6f8fa;
    border-radius: 3px;
    font-size: 0.85rem;
    color: #24292e;
    position: relative;
    padding-left: 1.5rem;
  }
  
  .language::before {
    content: '';
    position: absolute;
    left: 0.5rem;
    top: 50%;
    transform: translateY(-50%);
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background-color: var(--lang-color);
  }
  
  .no-results {
    text-align: center;
    color: #586069;
    padding: 2rem;
  }
</style>