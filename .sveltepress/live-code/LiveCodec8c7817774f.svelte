<!-- MyComponent.svelte -->

<!-- 1. Script部分：ロジックとデータ -->
<script lang="ts">
  // コンポーネントのロジック
  let count: number = 0;
  
  function increment(): void {
    count++;
  }
</script>

<!-- 2. Markup部分：HTML構造 -->
<div class="counter">
  <h2>カウンター: {count}</h2>
  <button onclick={increment}>
    クリック
  </button>
</div>

<!-- 3. Style部分：スタイリング -->
<style>
  .counter {
    padding: 1rem;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  
  h2 {
    color: #333;
  }
  
  button {
    background: #ff3e00;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    cursor: pointer;
  }
</style>