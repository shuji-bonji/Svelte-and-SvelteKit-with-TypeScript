<script lang="ts">
  function autofocus(node: HTMLElement) {
    if (node instanceof HTMLInputElement) {
      node.focus();
      node.select();
    }
  }
  
  let showInput = $state(false);
</script>

<button onclick={() => showInput = !showInput}>
  入力フィールドを{showInput ? '隠す' : '表示'}
</button>

{#if showInput}
  <input 
    use:autofocus
    type="text" 
    placeholder="自動的にフォーカスされます"
    value="選択されたテキスト"
  />
{/if}