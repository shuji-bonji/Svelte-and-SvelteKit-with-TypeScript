<script lang="ts">
  let canvasElement = $state<HTMLCanvasElement | null>(null);
  let color = $state('#ff3e00');
  let size = $state(10);
  
  $effect(() => {
    if (!canvasElement) return;
    
    const ctx = canvasElement.getContext('2d');
    if (!ctx) return;
    
    // キャンバスをクリア
    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    
    // 新しい設定で描画
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(150, 150, size, 0, Math.PI * 2);
    ctx.fill();
  });
</script>

<canvas 
  bind:this={canvasElement}
  width="300"
  height="300"
/>

<input type="color" bind:value={color} />
<input type="range" bind:value={size} min="5" max="50" />