---
title: $effect - 副作用
description: リアクティブな値の変更に応じて副作用を実行する
---

`$effect`ルーンは、リアクティブな値が変更されたときに副作用（side effects）を実行するために使用します。DOM操作、API呼び出し、ロギング、外部ライブラリとの統合などに使用されます。

## 基本的な使い方

### シンプルな副作用

```svelte
<script lang="ts">
  let count = $state(0);
  
  // countが変更されるたびに実行
  $effect(() => {
    console.log(`カウントが更新されました: ${count}`);
  });
  
  // 複数の値を監視
  let name = $state('');
  let age = $state(0);
  
  $effect(() => {
    // nameまたはageが変更されると実行
    console.log(`${name}さんは${age}歳です`);
  });
</script>
```

:::tip[React との比較]
`$effect`はReactの`useEffect`と似ていますが、依存配列を指定する必要がありません。Svelteが自動的に依存関係を追跡します。
:::

## クリーンアップ処理

副作用のクリーンアップは、関数を返すことで実行できます。

```svelte
<script lang="ts">
  let enabled = $state(true);
  let interval = $state(1000);
  
  $effect(() => {
    if (!enabled) return;
    
    console.log('タイマー開始');
    const timer = setInterval(() => {
      console.log('Tick');
    }, interval);
    
    // クリーンアップ関数
    return () => {
      console.log('タイマー停止');
      clearInterval(timer);
    };
  });
</script>
```

### イベントリスナーの管理

```svelte live ln
<script lang="ts">
  let element = $state<HTMLElement | null>(null);
  let clickCount = $state(0);
  
  $effect(() => {
    if (!element) return;
    
    const handleClick = (e: MouseEvent) => {
      clickCount++;
      console.log('クリック位置:', e.clientX, e.clientY);
    };
    
    element.addEventListener('click', handleClick);
    
    // クリーンアップ
    return () => {
      element.removeEventListener('click', handleClick);
    };
  });
</script>

<div bind:this={element}>
  クリックしてください: {clickCount}回
</div>
```

## DOM操作

`$effect`はDOM要素が利用可能になった後に実行されるため、DOM操作に適しています。

```svelte ln live
<script lang="ts">
  let canvasElement = $state<HTMLCanvasElement | null>(null);
  let color = $state('#ff3e00');
  let size = $state(10);
  
  $effect(() => {
    if (!canvasElement) return;
    
    const ctx = canvasElement.getContext('2d');
    if (!ctx) return;
    
    // キャンバスをクリア
    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    
    // 新しい設定で描画
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(150, 150, size, 0, Math.PI * 2);
    ctx.fill();
  });
</script>

<canvas 
  bind:this={canvasElement}
  width="300"
  height="300"
></canvas>

<input type="color" bind:value={color} />
<input type="range" bind:value={size} min="5" max="50" />
```

## 外部ライブラリとの統合

### Chart.jsの例

```svelte
<script lang="ts">
  import Chart from 'chart.js/auto';
  
  let chartCanvas = $state<HTMLCanvasElement | null>(null);
  let chartInstance = $state<Chart | null>(null);
  let data = $state([12, 19, 3, 5, 2, 3]);
  let labels = $state(['1月', '2月', '3月', '4月', '5月', '6月']);
  
  $effect(() => {
    if (!chartCanvas) return;
    
    // 既存のチャートを破棄
    if (chartInstance) {
      chartInstance.destroy();
    }
    
    // 新しいチャートを作成
    chartInstance = new Chart(chartCanvas, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: '売上',
          data: data,
          backgroundColor: 'rgba(255, 62, 0, 0.5)'
        }]
      }
    });
    
    // クリーンアップ
    return () => {
      if (chartInstance) {
        chartInstance.destroy();
        chartInstance = null;
      }
    };
  });
</script>

<canvas bind:this={chartCanvas}></canvas>
```

## $effect.pre - DOM更新前の実行

`$effect.pre`は、DOM更新前に実行される特別なeffectです。APIからデータを取得してDOM要素のアニメーションを制御する例を見てみましょう。

```svelte live ln
<script lang="ts">
  interface Quote {
    content: string;
    author: string;
  }
  
  let quote = $state<Quote | null>(null);
  let quoteElement = $state<HTMLElement | null>(null);
  let isLoading = $state(false);
  let previousHeight = $state(0);
  let isAnimating = $state(false);
  
  // DOM更新前に現在の高さを記録
  $effect.pre(() => {
    if (quoteElement && quote) {
      previousHeight = quoteElement.offsetHeight;
    }
  });
  
  // DOM更新後にアニメーション効果を適用
  $effect(() => {
    if (quoteElement && quote && previousHeight > 0) {
      const newHeight = quoteElement.offsetHeight;
      
      if (Math.abs(newHeight - previousHeight) > 10) {
        // 高さの変化を検出したらアニメーション
        isAnimating = true;
        
        // CSSトランジションの終了を待つ
        setTimeout(() => {
          isAnimating = false;
        }, 300);
      }
    }
  });
  
  async function fetchQuote() {
    isLoading = true;
    try {
      // JSONPlaceholder APIを使用（常に利用可能なモックAPI）
      const userId = Math.floor(Math.random() * 10) + 1;
      const response = await fetch(`https://jsonplaceholder.typicode.com/users/${userId}`);
      if (response.ok) {
        const data = await response.json();
        // ユーザー情報を名言風に変換
        quote = {
          content: `${data.company.catchPhrase} - ${data.company.bs}`,
          author: data.name
        };
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      // フォールバック：ローカルの名言データ
      const localQuotes = [
        { content: 'シンプルさは究極の洗練である', author: 'レオナルド・ダ・ヴィンチ' },
        { content: '完璧を目指すよりまず終わらせろ', author: 'マーク・ザッカーバーグ' },
        { content: 'プログラミングは考えることについて考えることだ', author: 'Leslie Lamport' }
      ];
      quote = localQuotes[Math.floor(Math.random() * localQuotes.length)];
    } finally {
      isLoading = false;
    }
  }
  
  // 初回ロード
  $effect(() => {
    fetchQuote();
  });
</script>

<div class="quote-container">
  <div 
    bind:this={quoteElement}
    class="quote-box"
    class:animating={isAnimating}
  >
    {#if isLoading}
      <p class="loading">読み込み中...</p>
    {:else if quote}
      <blockquote>
        <p>"{quote.content}"</p>
        <footer>— {quote.author}</footer>
      </blockquote>
    {/if}
  </div>
  
  <button onclick={fetchQuote} disabled={isLoading}>
    新しい名言を取得
  </button>
  
  {#if previousHeight > 0}
    <div class="debug">
      <small>前の高さ: {previousHeight}px</small>
      {#if quoteElement}
        <small>現在の高さ: {quoteElement.offsetHeight}px</small>
      {/if}
    </div>
  {/if}
</div>

<style>
  .quote-container {
    max-width: 500px;
    margin: 0 auto;
  }
  
  .quote-box {
    padding: 1.5rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 10px;
    color: white;
    min-height: 100px;
    transition: all 0.3s ease;
  }
  
  .quote-box.animating {
    transform: scale(1.02);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  }
  
  blockquote {
    margin: 0;
  }
  
  blockquote p {
    font-size: 1.1rem;
    line-height: 1.6;
    margin: 0 0 1rem 0;
  }
  
  blockquote footer {
    font-size: 0.9rem;
    opacity: 0.9;
    text-align: right;
  }
  
  .loading {
    text-align: center;
    opacity: 0.7;
  }
  
  button {
    margin-top: 1rem;
    width: 100%;
    padding: 0.75rem;
    background: #4c51bf;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1rem;
    transition: background 0.2s;
  }
  
  button:hover:not(:disabled) {
    background: #434190;
  }
  
  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .debug {
    margin-top: 1rem;
    display: flex;
    justify-content: space-between;
    color: #666;
    font-size: 0.85rem;
  }
</style>
```

## $effect.root - 独立したエフェクトスコープ

`$effect.root`は、コンポーネントのライフサイクルから独立したエフェクトスコープを作成します。

```svelte
<script lang="ts">
  import { onDestroy } from 'svelte';
  
  // 独立したエフェクトスコープを作成
  const cleanup = $effect.root(() => {
    let count = $state(0);
    
    $effect(() => {
      const timer = setInterval(() => {
        count++;
        console.log('独立したカウント:', count);
      }, 1000);
      
      return () => clearInterval(timer);
    });
    
    // スコープ内の状態とエフェクトを返す
    return {
      getCount: () => count,
      reset: () => count = 0
    };
  });
  
  // コンポーネント破棄時にクリーンアップ
  onDestroy(() => {
    cleanup();
  });
</script>
```

## 非同期処理との組み合わせ

### API呼び出し

```svelte live ln
<script lang="ts">
  interface User {
    id: number;
    name: string;
    email: string;
    phone: string;
    website: string;
    company: {
      name: string;
      catchPhrase: string;
    };
  }
  
  let userId = $state(1);
  let user = $state<User | null>(null);
  let loading = $state(false);
  let error = $state<Error | null>(null);
  
  $effect(() => {
    // AbortControllerを使用してキャンセル可能にする
    const abortController = new AbortController();
    
    loading = true;
    error = null;
    
    // 非同期処理を内部関数として定義
    async function fetchUser() {
      try {
        // JSONPlaceholder APIを使用
        const response = await fetch(
          `https://jsonplaceholder.typicode.com/users/${userId}`,
          {
            signal: abortController.signal
          }
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        user = data;
      } catch (e) {
        if (e instanceof Error && e.name !== 'AbortError') {
          error = e;
          console.error('Failed to fetch user:', e);
        }
      } finally {
        loading = false;
      }
    }
    
    fetchUser();
    
    // クリーンアップ: リクエストをキャンセル
    return () => {
      abortController.abort();
    };
  });
  
  function nextUser() {
    userId = userId >= 10 ? 1 : userId + 1;
  }
  
  function prevUser() {
    userId = userId <= 1 ? 10 : userId - 1;
  }
</script>

<div class="user-viewer">
  <div class="controls">
    <button onclick={prevUser}>前のユーザー</button>
    <span>ユーザーID: {userId}</span>
    <button onclick={nextUser}>次のユーザー</button>
  </div>
  
  {#if loading}
    <div class="loading">読み込み中...</div>
  {:else if error}
    <div class="error">エラー: {error.message}</div>
  {:else if user}
    <div class="user-card">
      <h3>{user.name}</h3>
      <p>📧 {user.email}</p>
      <p>📱 {user.phone}</p>
      <p>🌐 {user.website}</p>
      <div class="company">
        <p><strong>{user.company.name}</strong></p>
        <p class="catchphrase">"{user.company.catchPhrase}"</p>
      </div>
    </div>
  {/if}
</div>

<style>
  .user-viewer {
    max-width: 400px;
    margin: 0 auto;
  }
  
  .controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding: 0.5rem;
    background: #f5f5f5;
    border-radius: 5px;
  }
  
  .controls button {
    padding: 0.5rem 1rem;
    background: #4a5568;
    color: white;
    border: none;
    border-radius: 3px;
    cursor: pointer;
  }
  
  .controls button:hover {
    background: #2d3748;
  }
  
  .loading {
    text-align: center;
    padding: 2rem;
    color: #718096;
  }
  
  .error {
    padding: 1rem;
    background: #fed7d7;
    color: #c53030;
    border-radius: 5px;
  }
  
  .user-card {
    padding: 1.5rem;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .user-card h3 {
    margin: 0 0 1rem 0;
    color: #2d3748;
  }
  
  .user-card p {
    margin: 0.5rem 0;
    color: #4a5568;
  }
  
  .company {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #e2e8f0;
  }
  
  .catchphrase {
    font-style: italic;
    color: #718096;
  }
</style>
```

### デバウンス処理

実際のAPIを使用した、デバウンス付きの検索機能の例です。

```svelte live ln
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
```

## 実践例：リアルタイムチャート

```svelte live ln title=RealtimeChart.svelte
<script lang="ts">
  let dataPoints = $state<number[]>([]);
  let maxPoints = $state(20);
  let updateInterval = $state(1000);
  let isRunning = $state(false);
  let svgElement = $state<SVGElement | null>(null);
  
  // データ生成
  $effect(() => {
    if (!isRunning) return;
    
    const interval = setInterval(() => {
      const newValue = Math.random() * 100;
      dataPoints = [...dataPoints, newValue].slice(-maxPoints);
    }, updateInterval);
    
    return () => clearInterval(interval);
  });
  
  // チャートの描画設定
  let chartPath = $derived(() => {
    if (dataPoints.length === 0) return '';
    
    const width = 400;
    const height = 200;
    const xStep = width / (maxPoints - 1);
    
    return dataPoints
      .map((value, index) => {
        const x = index * xStep;
        const y = height - (value / 100) * height;
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  });
  
  // 統計情報
  let stats = $derived(() => {
    if (dataPoints.length === 0) {
      return { min: 0, max: 0, avg: 0, current: 0 };
    }
    
    const min = Math.min(...dataPoints);
    const max = Math.max(...dataPoints);
    const avg = dataPoints.reduce((a, b) => a + b, 0) / dataPoints.length;
    const current = dataPoints[dataPoints.length - 1] || 0;
    
    return { 
      min: min.toFixed(1), 
      max: max.toFixed(1), 
      avg: avg.toFixed(1),
      current: current.toFixed(1)
    };
  });
  
  function toggleRunning() {
    isRunning = !isRunning;
  }
  
  function clear() {
    dataPoints = [];
    isRunning = false;
  }
</script>

<div class="chart-container">
  <h3>リアルタイムデータチャート</h3>
  
  <div class="controls">
    <button onclick={toggleRunning}>
      {isRunning ? '停止' : '開始'}
    </button>
    <button onclick={clear}>クリア</button>
    
    <label>
      更新間隔:
      <input 
        type="range" 
        bind:value={updateInterval}
        min="100"
        max="2000"
        step="100"
        disabled={isRunning}
      />
      {updateInterval}ms
    </label>
    
    <label>
      最大ポイント数:
      <input 
        type="range" 
        bind:value={maxPoints}
        min="10"
        max="50"
        step="5"
        disabled={isRunning}
      />
      {maxPoints}
    </label>
  </div>
  
  <div class="chart">
    <svg 
      bind:this={svgElement}
      width="400" 
      height="200"
      viewBox="0 0 400 200"
    >
      <!-- グリッド線 -->
      {#each [0, 25, 50, 75, 100] as percent}
        <line
          x1="0"
          y1={200 - percent * 2}
          x2="400"
          y2={200 - percent * 2}
          stroke="#e0e0e0"
          stroke-dasharray="2,2"
        />
        <text
          x="5"
          y={200 - percent * 2 + 4}
          font-size="10"
          fill="#666"
        >
          {percent}
        </text>
      {/each}
      
      <!-- データライン -->
      {#if chartPath}
        <path
          d={chartPath}
          fill="none"
          stroke="#ff3e00"
          stroke-width="2"
        />
      {/if}
      
      <!-- データポイント -->
      {#each dataPoints as value, index}
        <circle
          cx={index * (400 / (maxPoints - 1))}
          cy={200 - (value / 100) * 200}
          r="3"
          fill="#ff3e00"
        />
      {/each}
    </svg>
  </div>
  
  <div class="stats">
    <div class="stat">
      <span class="label">現在値:</span>
      <span class="value">{stats.current}</span>
    </div>
    <div class="stat">
      <span class="label">最小値:</span>
      <span class="value">{stats.min}</span>
    </div>
    <div class="stat">
      <span class="label">最大値:</span>
      <span class="value">{stats.max}</span>
    </div>
    <div class="stat">
      <span class="label">平均値:</span>
      <span class="value">{stats.avg}</span>
    </div>
  </div>
</div>

<style>
  .chart-container {
    max-width: 500px;
    margin: 0 auto;
    padding: 1rem;
  }
  
  .controls {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }
  
  .controls button {
    padding: 0.5rem 1rem;
    background: #ff3e00;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .controls button:hover {
    background: #ff5a00;
  }
  
  .controls label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
  }
  
  .chart {
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 0.5rem;
    background: white;
  }
  
  .stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
    margin-top: 1rem;
    padding: 1rem;
    background: #f5f5f5;
    border-radius: 4px;
  }
  
  .stat {
    text-align: center;
  }
  
  .stat .label {
    display: block;
    font-size: 0.8rem;
    color: #666;
    margin-bottom: 0.25rem;
  }
  
  .stat .value {
    display: block;
    font-size: 1.2rem;
    font-weight: bold;
    color: #333;
  }
</style>
```

## ベストプラクティス

### 1. クリーンアップを忘れない

```typescript
// ✅ 良い例：クリーンアップ関数を返す
$effect(() => {
  const timer = setInterval(() => {}, 1000);
  return () => clearInterval(timer);
});

// ❌ 悪い例：クリーンアップなし
$effect(() => {
  setInterval(() => {}, 1000); // メモリリーク！
});
```

### 2. 条件付き実行

```typescript
// ✅ 良い例：早期リターン
$effect(() => {
  if (!element) return;
  // element が存在する場合のみ実行
});

// ❌ 悪い例：ネストが深い
$effect(() => {
  if (element) {
    // 全体をネスト
  }
});
```

### 3. 非同期処理の適切な処理

```typescript
// ✅ 良い例：AbortControllerを使用
$effect(() => {
  const controller = new AbortController();
  
  fetch(url, { signal: controller.signal })
    .then(/* ... */);
  
  return () => controller.abort();
});
```

## まとめ

`$effect`ルーンは、

- **自動追跡** - 使用する値を自動的に追跡
- **クリーンアップ** - 返り値でクリーンアップ処理
- **柔軟性** - DOM操作、API呼び出し、外部ライブラリとの統合
- **タイミング制御** - `$effect.pre`でDOM更新前に実行

:::info[他のフレームワークとの比較]
- **React**: `useEffect`と似ているが、依存配列不要
- **Vue**: `watchEffect`とほぼ同じ
- **Angular**: `effect()`と類似
- **SolidJS**: `createEffect`と同様の概念
:::

## 次のステップ

[他フレームワークとの比較](/runes/comparison/)では、React、Vue、Angularの経験者向けに、Runesシステムの違いと類似点を詳しく解説します。