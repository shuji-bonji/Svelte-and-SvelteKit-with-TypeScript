<script lang="ts">
  // 基本的な$state
  let count = $state(0);
  
  // オブジェクトの$state
  let stats = $state({
    clicks: 0,
    lastClickTime: null as Date | null
  });
  
  // 設定オブジェクト（通常の$stateで管理し、直接変更を避ける）
  let config = $state({
    min: -10,
    max: 10,
    step: 1
  });
  
  function increment() {
    if (count < config.max) {
      count += config.step;
      stats.clicks++;
      stats.lastClickTime = new Date();
    }
  }
  
  function decrement() {
    if (count > config.min) {
      count -= config.step;
      stats.clicks++;
      stats.lastClickTime = new Date();
    }
  }
  
  function reset() {
    count = 0;
    stats = {
      clicks: 0,
      lastClickTime: null
    };
  }
  
  function changeStep() {
    // イミュータブルな更新パターン（新しいオブジェクトで置き換える）
    config = {
      ...config,
      step: config.step === 1 ? 2 : 1
    };
  }
</script>

<div class="counter-app">
  <h3>カウンター: {count}</h3>
  
  <div class="controls">
    <button onclick={decrement} disabled={count <= config.min}>
      -
    </button>
    <button onclick={reset}>
      リセット
    </button>
    <button onclick={increment} disabled={count >= config.max}>
      +
    </button>
  </div>
  
  <div class="stats">
    <p>クリック回数: {stats.clicks}</p>
    {#if stats.lastClickTime}
      <p>最終クリック: {stats.lastClickTime.toLocaleTimeString('ja-JP')}</p>
    {/if}
  </div>
  
  <div class="config">
    <p>範囲: {config.min} 〜 {config.max}</p>
    <p>ステップ: {config.step}</p>
    <button onclick={changeStep}>
      ステップ切り替え
    </button>
  </div>
</div>

<style>
  .counter-app {
    padding: 2rem;
    background: #f9f9f9;
    border-radius: 8px;
    max-width: 400px;
    margin: 0 auto;
  }
  
  h3 {
    text-align: center;
    color: #ff3e00;
    font-size: 2rem;
    margin-bottom: 1rem;
  }
  
  .controls {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-bottom: 1.5rem;
  }
  
  button {
    padding: 0.5rem 1rem;
    font-size: 1.2rem;
    background: #ff3e00;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.2s;
  }
  
  button:hover:not(:disabled) {
    background: #ff5a00;
  }
  
  button:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
  
  .stats, .config {
    background: white;
    padding: 1rem;
    border-radius: 4px;
    margin-bottom: 1rem;
  }
  
  .stats p, .config p {
    margin: 0.5rem 0;
    color: #666;
  }
  
  .config button {
    margin-top: 0.5rem;
    font-size: 0.9rem;
    padding: 0.3rem 0.8rem;
  }
</style>