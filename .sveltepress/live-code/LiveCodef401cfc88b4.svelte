<script lang="ts">
  import { blur } from 'svelte/transition';
  
  let showImage = $state(true);
</script>

{#if showImage}
  <img
    src="image.jpg"
    alt="サンプル画像"
    transition:blur={{
      amount: 5,     // ブラーの強さ
      duration: 300,
      delay: 0
    }}
  />
{/if}