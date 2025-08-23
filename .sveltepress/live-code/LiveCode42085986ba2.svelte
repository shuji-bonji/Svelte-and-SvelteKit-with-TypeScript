<script lang="ts">
  let element = $state<HTMLElement | null>(null);
  let clickCount = $state(0);
  
  $effect(() => {
    if (!element) return;
    
    const handleClick = (e: MouseEvent) => {
      clickCount++;
      console.log('クリック位置:', e.clientX, e.clientY);
    };
    
    element.addEventListener('click', handleClick);
    
    // クリーンアップ
    return () => {
      element.removeEventListener('click', handleClick);
    };
  });
</script>

<div bind:this={element}>
  クリックしてください: {clickCount}回
</div>