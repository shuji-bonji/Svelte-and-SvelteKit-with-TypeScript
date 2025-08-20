<script lang="ts">
  // 数値
  let count = $state(0); // 初期値 `0`
  
  // 文字列
  let message = $state('Hello'); // 初期値 `Hello`
  
  // ブール値
  let isActive = $state(false); // 初期値 `false`
  
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