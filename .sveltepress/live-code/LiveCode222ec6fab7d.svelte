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
  let chartPath = $derived.by(() => {
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
  let stats = $derived.by(() => {
    if (dataPoints.length === 0) {
      return { min: '0', max: '0', avg: '0', current: '0' };
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