<script lang="ts">
  type Props = {
    value: number;
    label?: string;
    min?: number;
    max?: number;
    step?: number;
    unit?: string;
  };

  let { 
    value = $bindable(0),
    label,
    min = 0,
    max = 100,
    step = 1,
    unit = ''
  }: Props = $props();

  // スライダーの進捗率を計算
  let progress = $derived(((value - min) / (max - min)) * 100);
  
  // ユニークなIDを生成
  const sliderId = `slider-${Math.random().toString(36).substr(2, 9)}`;
</script>

<div class="slider-wrapper">
  {#if label}
    <label class="slider-label" for={sliderId}>
      {label}: {value}{unit}
    </label>
  {/if}
  
  <div class="slider-container">
    <input 
      id={sliderId}
      type="range"
      bind:value={value}
      {min}
      {max}
      {step}
      class="slider"
      style="--progress: {progress}%"
    />
    <div class="slider-track"></div>
    <div class="slider-fill" style="width: {progress}%"></div>
  </div>
  
  <div class="slider-marks">
    <span>{min}{unit}</span>
    {#if max > min * 2}
      <span>{Math.round((min + max) / 2)}{unit}</span>
    {/if}
    <span>{max}{unit}</span>
  </div>
</div>

<style>
  .slider-wrapper {
    margin-bottom: 1.5rem;
  }

  .slider-label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #1e293b;
  }

  :global(.dark) .slider-label {
    color: #e2e8f0;
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

  .slider-fill {
    position: absolute;
    height: 6px;
    background: #3b82f6;
    border-radius: 3px;
    pointer-events: none;
    transition: width 0.1s;
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
    border: 3px solid #3b82f6;
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
    border: 3px solid #3b82f6;
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
    color: #64748b;
    font-weight: 500;
  }

  :global(.dark) .slider-marks {
    color: #cbd5e1;
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
</style>