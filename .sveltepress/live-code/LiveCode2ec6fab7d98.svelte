<script lang="ts">
  // 数値
  let count = $state(0);
  
  // 文字列
  let message = $state('Hello');
  
  // ブール値
  let isActive = $state(false);
  
  // null/undefined
  let data = $state<string | null>(null);
</script>

<button onclick={() => count++}>
  カウント: {count}
</button>

<input bind:value={message} />
<p>{message}</p>

<label>
  <input type="checkbox" bind:checked={isActive} />
  アクティブ: {isActive}
</label>