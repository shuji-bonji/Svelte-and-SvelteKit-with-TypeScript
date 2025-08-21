<script lang="ts">
  // Svelte 5の新しい書き方
  let count = $state(0);
  
  function increment(): void {
    count++;  // 直接変更が可能
  }
</script>

<div style="text-align: center; padding: 2rem;">
  <h2>Svelte 5 カウンター</h2>
  <button onclick={increment} style="padding: 0.5rem 1rem; font-size: 1.2rem;">
    Count: {count}
  </button>
  <p style="margin-top: 1rem;">
    ボタンをクリックすると、$stateによってUIが自動更新されます
  </p>
</div>