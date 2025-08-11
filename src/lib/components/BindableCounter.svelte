<script lang="ts">
  type Props = {
    value: $bindable<number>;
    label?: string;
    min?: number;
    max?: number;
    step?: number;
  };

  let { 
    value = $bindable(0),
    label,
    min = 0,
    max = Infinity,
    step = 1
  }: Props = $props();

  function increment() {
    if (value + step <= max) {
      value += step;
    }
  }

  function decrement() {
    if (value - step >= min) {
      value -= step;
    }
  }

  let canIncrement = $derived(value + step <= max);
  let canDecrement = $derived(value - step >= min);
</script>

<div class="counter-wrapper">
  {#if label}
    <h5 class="counter-label">{label}</h5>
  {/if}
  
  <div class="counter-display">{value}</div>
  
  <div class="counter-controls">
    <button 
      onclick={decrement}
      disabled={!canDecrement}
      class="counter-btn minus"
      aria-label="減らす"
    >
      −
    </button>
    
    <button 
      onclick={increment}
      disabled={!canIncrement}
      class="counter-btn plus"
      aria-label="増やす"
    >
      +
    </button>
  </div>
</div>

<style>
  .counter-wrapper {
    background: white;
    padding: 1rem;
    border-radius: 8px;
    text-align: center;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  :global(.dark) .counter-wrapper {
    background: #1e293b;
    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
  }

  .counter-label {
    margin: 0 0 0.5rem 0;
    color: #475569;
    font-size: 0.9rem;
    font-weight: 500;
  }

  :global(.dark) .counter-label {
    color: #e2e8f0;
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
    border-color: #d1d5db;
    color: #9ca3af;
  }
</style>