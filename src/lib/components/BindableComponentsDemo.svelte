<script lang="ts">
  import BindableSlider from './BindableSlider.svelte';
  import BindableCounter from './BindableCounter.svelte';
  import BindableCheckbox from './BindableCheckbox.svelte';
  
  // スライダーの状態
  let volume = $state(50);
  let brightness = $state(75);
  let contrast = $state(100);
  
  // カウンターの状態
  let count1 = $state(0);
  let count2 = $state(0);
  let count3 = $state(0);
  
  // チェックボックスの状態
  let selectAll = $state(false);
  let option1 = $state(false);
  let option2 = $state(false);
  let option3 = $state(false);
  
  // 合計値（カウンター）
  let total = $derived(count1 + count2 + count3);
  
  // 全選択の処理
  $effect(() => {
    if (selectAll) {
      option1 = true;
      option2 = true;
      option3 = true;
    }
  });
  
  // 個別チェックボックスの変更を監視
  $effect(() => {
    if (!option1 || !option2 || !option3) {
      selectAll = false;
    }
  });
  
  // リセット機能
  function resetSliders() {
    volume = 50;
    brightness = 75;
    contrast = 100;
  }
  
  function resetCounters() {
    count1 = 0;
    count2 = 0;
    count3 = 0;
  }
  
  function resetCheckboxes() {
    selectAll = false;
    option1 = false;
    option2 = false;
    option3 = false;
  }
</script>

<div class="demo-container">
  <h3>$bindableコンポーネント実装例</h3>
  
  <!-- スライダーセクション -->
  <section class="demo-section">
    <h4>スライダーコンポーネント</h4>
    
    <BindableSlider 
      bind:value={volume}
      label="音量"
      min={0}
      max={100}
      unit="%"
    />
    
    <BindableSlider 
      bind:value={brightness}
      label="明るさ"
      min={0}
      max={100}
      unit="%"
    />
    
    <BindableSlider 
      bind:value={contrast}
      label="コントラスト"
      min={0}
      max={200}
      unit="%"
    />
    
    <div class="preview" style="filter: brightness({brightness}%) contrast({contrast}%);">
      <div class="preview-box">
        <div class="preview-text">プレビュー</div>
        <div class="volume-indicator" style="width: {volume}%;"></div>
      </div>
    </div>
    
    <button onclick={resetSliders} class="reset-btn">
      デフォルトに戻す
    </button>
  </section>
  
  <!-- カウンターセクション -->
  <section class="demo-section">
    <h4>カウンターコンポーネント</h4>
    
    <div class="counter-grid">
      <BindableCounter 
        bind:value={count1}
        label="カウンター 1"
        min={0}
        max={10}
      />
      
      <BindableCounter 
        bind:value={count2}
        label="カウンター 2"
        min={0}
        max={10}
      />
      
      <BindableCounter 
        bind:value={count3}
        label="カウンター 3"
        min={0}
        max={10}
      />
    </div>
    
    <div class="total-section">
      <div class="total-label">合計値:</div>
      <div class="total-value">{total}</div>
    </div>
    
    <button onclick={resetCounters} class="reset-btn">
      すべてリセット
    </button>
  </section>
  
  <!-- チェックボックスセクション -->
  <section class="demo-section">
    <h4>チェックボックスコンポーネント</h4>
    
    <div class="checkbox-group">
      <BindableCheckbox 
        bind:checked={selectAll}
        label="すべて選択"
      />
      
      <hr />
      
      <BindableCheckbox 
        bind:checked={option1}
        label="オプション 1"
      />
      
      <BindableCheckbox 
        bind:checked={option2}
        label="オプション 2"
      />
      
      <BindableCheckbox 
        bind:checked={option3}
        label="オプション 3"
      />
    </div>
    
    <div class="status">
      <h5>選択状態:</h5>
      <ul>
        <li>オプション 1: {option1 ? '✅ 選択' : '❌ 未選択'}</li>
        <li>オプション 2: {option2 ? '✅ 選択' : '❌ 未選択'}</li>
        <li>オプション 3: {option3 ? '✅ 選択' : '❌ 未選択'}</li>
      </ul>
    </div>
    
    <button onclick={resetCheckboxes} class="reset-btn">
      選択をクリア
    </button>
  </section>
</div>

<style>
  .demo-container {
    padding: 1.5rem;
    background: linear-gradient(to bottom, #f8fafc, #f1f5f9);
    border-radius: 12px;
    border: 1px solid rgba(0, 0, 0, 0.08);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
  }

  :global(.dark) .demo-container {
    background: linear-gradient(to bottom, #1e293b, #0f172a);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  h3 {
    margin: 0 0 1.5rem 0;
    color: #1e293b;
  }

  :global(.dark) h3 {
    color: #e2e8f0;
  }

  .demo-section {
    margin-bottom: 2rem;
    padding: 1.5rem;
    background: white;
    border-radius: 10px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  }

  :global(.dark) .demo-section {
    background: #0f172a;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .demo-section:last-child {
    margin-bottom: 0;
  }

  h4 {
    margin: 0 0 1rem 0;
    color: #475569;
    font-size: 1.1rem;
  }

  :global(.dark) h4 {
    color: #e2e8f0;
  }

  .counter-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;
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

  :global(.dark) .total-section {
    background: #1e293b;
  }

  .total-label {
    font-size: 1.25rem;
    color: #475569;
  }

  :global(.dark) .total-label {
    color: #e2e8f0;
  }

  .total-value {
    font-size: 2rem;
    font-weight: bold;
    color: #3b82f6;
    text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
  }

  .checkbox-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 1rem;
    background: #fafbfc;
    border-radius: 8px;
    border: 1px solid rgba(0, 0, 0, 0.04);
  }

  :global(.dark) .checkbox-group {
    background: #1e293b;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  hr {
    margin: 0.75rem 0;
    border: none;
    border-top: 2px solid #e2e8f0;
  }

  .status {
    margin-top: 1.5rem;
    padding: 1.25rem;
    background: #f8fafc;
    border-radius: 8px;
    border: 1px solid #cbd5e1;
  }

  :global(.dark) .status {
    background: #1e293b;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .status h5 {
    margin: 0 0 0.5rem 0;
    color: #475569;
  }

  :global(.dark) .status h5 {
    color: #e2e8f0;
  }

  .status ul {
    margin: 0;
    padding-left: 1.5rem;
  }

  .status li {
    margin: 0.25rem 0;
    color: #64748b;
    font-size: 0.9rem;
  }

  :global(.dark) .status li {
    color: #cbd5e1;
  }

  .preview {
    margin: 1.5rem 0;
    padding: 1rem;
    background: white;
    border-radius: 4px;
    transition: filter 0.3s;
  }

  :global(.dark) .preview {
    background: #0f172a;
  }

  .preview-box {
    position: relative;
    padding: 2rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 4px;
    text-align: center;
  }

  .preview-text {
    color: white;
    font-size: 1.25rem;
    font-weight: bold;
    position: relative;
    z-index: 2;
  }

  .volume-indicator {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 4px;
    background: rgba(255, 255, 255, 0.8);
    border-radius: 0 0 0 4px;
    transition: width 0.3s;
  }

  .reset-btn {
    width: 100%;
    padding: 0.75rem;
    background: #475569;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    transition: background 0.2s;
  }

  .reset-btn:hover {
    background: #334155;
  }
</style>