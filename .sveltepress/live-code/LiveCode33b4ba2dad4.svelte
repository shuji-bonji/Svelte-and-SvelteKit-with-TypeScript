<script lang="ts">
  function handleKeydown(event: KeyboardEvent & {
    currentTarget: HTMLInputElement
  }) {
    if (event.key === 'Enter') {
      console.log('Enter pressed');
      const value = event.currentTarget.value;
      // 処理...
    }
    
    if (event.ctrlKey && event.key === 's') {
      event.preventDefault();
      // 保存処理
    }
  }
</script>

<input onkeydown={handleKeydown} />