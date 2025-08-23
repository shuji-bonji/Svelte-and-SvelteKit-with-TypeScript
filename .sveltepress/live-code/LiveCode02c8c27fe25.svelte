<script>
let count = $state(0);
</script>
<div style="text-align: center; padding: 2rem;">
  <h2>Count: {count}</h2>
  <button onclick={() => count++}>
    Increment
  </button>
  <button onclick={() => count--}>
    Decrement
  </button>
  <button onclick={() => count = 0}>
    Reset
  </button>
</div>