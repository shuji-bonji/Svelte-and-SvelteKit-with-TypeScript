<script lang="ts">
  // 複数のカウンター
  let count1 = $state(0);
  let count2 = $state(0);
  let count3 = $state(0);
  
  // 合計値
  let total = $derived(count1 + count2 + count3);
  
  // カウンター操作関数
  function increment(counter: 'count1' | 'count2' | 'count3') {
    if (counter === 'count1') count1++;
    else if (counter === 'count2') count2++;
    else if (counter === 'count3') count3++;
  }
  
  function decrement(counter: 'count1' | 'count2' | 'count3') {
    if (counter === 'count1' && count1 > 0) count1--;
    else if (counter === 'count2' && count2 > 0) count2--;
    else if (counter === 'count3' && count3 > 0) count3--;
  }
  
  function resetAll() {
    count1 = 0;
    count2 = 0;
    count3 = 0;
  }
</script>

<div class="counter-demo">
  <h4>カウンター管理</h4>
  
  <div class="counter-grid">
    <div class="counter-card">
      <h5>カウンター 1</h5>
      <div class="counter-display">{count1}</div>
      <div class="counter-controls">
        <button 
          onclick={() => decrement('count1')}
          disabled={count1 === 0}
          class="counter-btn minus"
        >
          −
        </button>
        <button 
          onclick={() => increment('count1')}
          class="counter-btn plus"
        >
          +
        </button>
      </div>
    </div>
    
    <div class="counter-card">
      <h5>カウンター 2</h5>
      <div class="counter-display">{count2}</div>
      <div class="counter-controls">
        <button 
          onclick={() => decrement('count2')}
          disabled={count2 === 0}
          class="counter-btn minus"
        >
          −
        </button>
        <button 
          onclick={() => increment('count2')}
          class="counter-btn plus"
        >
          +
        </button>
      </div>
    </div>
    
    <div class="counter-card">
      <h5>カウンター 3</h5>
      <div class="counter-display">{count3}</div>
      <div class="counter-controls">
        <button 
          onclick={() => decrement('count3')}
          disabled={count3 === 0}
          class="counter-btn minus"
        >
          −
        </button>
        <button 
          onclick={() => increment('count3')}
          class="counter-btn plus"
        >
          +
        </button>
      </div>
    </div>
  </div>
  
  <div class="total-section">
    <div class="total-label">合計値:</div>
    <div class="total-value">{total}</div>
  </div>
  
  <button onclick={resetAll} class="reset-all-btn">
    すべてリセット
  </button>
</div>

<style>
  .counter-demo {
    padding: 1.5rem;
    background: var(--sp-color-gray-100);
    border-radius: 8px;
  }
  
  .counter-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
  
  .counter-card {
    background: white;
    padding: 1rem;
    border-radius: 8px;
    text-align: center;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  
  .counter-card h5 {
    margin: 0 0 0.5rem 0;
    color: var(--sp-color-gray-700);
    font-size: 0.9rem;
  }
  
  .counter-display {
    font-size: 2.5rem;
    font-weight: bold;
    color: #3b82f6;
    margin: 0.5rem 0;
    text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
  }
  
  .counter-controls {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
  }
  
  .counter-btn {
    width: 40px;
    height: 40px;
    border: 2px solid;
    border-radius: 50%;
    font-size: 1.25rem;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    background: white;
  }
  
  .counter-btn.plus {
    border-color: #22c55e;
    color: #22c55e;
  }
  
  .counter-btn.plus:hover:not(:disabled) {
    background: #22c55e;
    color: white;
  }
  
  .counter-btn.minus {
    border-color: #ef4444;
    color: #ef4444;
  }
  
  .counter-btn.minus:hover:not(:disabled) {
    background: #ef4444;
    color: white;
  }
  
  .counter-btn:hover:not(:disabled) {
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }
  
  .counter-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
    border-color: var(--sp-color-gray-300);
    color: var(--sp-color-gray-400);
  }
  
  .total-section {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: white;
    border-radius: 8px;
    margin-bottom: 1rem;
  }
  
  .total-label {
    font-size: 1.25rem;
    color: var(--sp-color-gray-600);
  }
  
  .total-value {
    font-size: 2rem;
    font-weight: bold;
    color: #3b82f6;
    text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
  }
  
  .reset-all-btn {
    width: 100%;
    padding: 0.75rem;
    background: var(--sp-color-gray-600);
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    transition: background 0.2s;
  }
  
  .reset-all-btn:hover {
    background: var(--sp-color-gray-700);
  }
</style>