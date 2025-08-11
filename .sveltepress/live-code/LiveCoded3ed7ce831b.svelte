<script lang="ts">
  // 音量コントロール
  let volume = $state(50);
  let brightness = $state(75);
  let contrast = $state(100);
  
  // リセット機能
  function resetValues() {
    volume = 50;
    brightness = 75;
    contrast = 100;
  }
</script>

<div class="slider-demo">
  <h4>設定コントロール</h4>
  
  <div class="slider-group">
    <label class="slider-label">
      <span class="label-name">音量: {volume}%</span>
      <div class="slider-container">
        <input 
          type="range" 
          bind:value={volume}
          min="0" 
          max="100" 
          class="slider"
        />
        <div class="slider-track"></div>
      </div>
      <div class="slider-marks">
        <span>0</span>
        <span>50</span>
        <span>100</span>
      </div>
    </label>
  </div>
  
  <div class="slider-group">
    <label class="slider-label">
      <span class="label-name">明るさ: {brightness}%</span>
      <div class="slider-container">
        <input 
          type="range" 
          bind:value={brightness}
          min="0" 
          max="100" 
          class="slider"
        />
        <div class="slider-track"></div>
      </div>
      <div class="slider-marks">
        <span>0</span>
        <span>50</span>
        <span>100</span>
      </div>
    </label>
  </div>
  
  <div class="slider-group">
    <label class="slider-label">
      <span class="label-name">コントラスト: {contrast}%</span>
      <div class="slider-container">
        <input 
          type="range" 
          bind:value={contrast}
          min="0" 
          max="200" 
          class="slider"
        />
        <div class="slider-track"></div>
      </div>
      <div class="slider-marks">
        <span>0</span>
        <span>100</span>
        <span>200</span>
      </div>
    </label>
  </div>
  
  <div class="preview" style="filter: brightness({brightness}%) contrast({contrast}%);">
    <div class="preview-box">
      <div class="preview-text">プレビュー</div>
      <div class="volume-indicator" style="width: {volume}%;"></div>
    </div>
  </div>
  
  <button onclick={resetValues} class="reset-button">
    デフォルトに戻す
  </button>
</div>

<style>
  .slider-demo {
    padding: 1.5rem;
    background: var(--sp-color-gray-100);
    border-radius: 8px;
  }
  
  .slider-group {
    margin-bottom: 1.5rem;
  }
  
  .slider-label {
    display: block;
  }
  
  .label-name {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: var(--sp-color-gray-700);
  }
  
  .slider-container {
    position: relative;
    width: 100%;
    height: 24px;
    display: flex;
    align-items: center;
  }
  
  .slider-track {
    position: absolute;
    width: 100%;
    height: 6px;
    background: var(--sp-color-gray-300);
    border-radius: 3px;
    pointer-events: none;
  }
  
  .slider {
    position: relative;
    width: 100%;
    height: 6px;
    border-radius: 3px;
    background: transparent;
    outline: none;
    -webkit-appearance: none;
    appearance: none;
    z-index: 1;
  }
  
  .slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: white;
    border: 3px solid var(--sp-color-primary);
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    transition: transform 0.2s;
  }
  
  .slider::-webkit-slider-thumb:hover {
    transform: scale(1.1);
  }
  
  .slider::-moz-range-thumb {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: white;
    border: 3px solid var(--sp-color-primary);
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    transition: transform 0.2s;
  }
  
  .slider::-moz-range-thumb:hover {
    transform: scale(1.1);
  }
  
  .slider-marks {
    display: flex;
    justify-content: space-between;
    margin-top: 0.5rem;
    padding: 0 2px;
    font-size: 0.75rem;
    color: var(--sp-color-gray-600);
    font-weight: 500;
  }
  
  .slider-marks span {
    position: relative;
  }
  
  .slider-marks span::before {
    content: '';
    position: absolute;
    top: -28px;
    left: 50%;
    transform: translateX(-50%);
    width: 1px;
    height: 10px;
    background: var(--sp-color-gray-400);
  }
  
  .preview {
    margin: 1.5rem 0;
    padding: 1rem;
    background: white;
    border-radius: 4px;
    transition: filter 0.3s;
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
  
  .reset-button {
    width: 100%;
    padding: 0.75rem;
    background: var(--sp-color-primary);
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    transition: opacity 0.2s;
  }
  
  .reset-button:hover {
    opacity: 0.9;
  }
</style>