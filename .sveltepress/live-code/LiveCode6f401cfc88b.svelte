<script lang="ts">
  import { draw } from 'svelte/transition';
  import { quintInOut } from 'svelte/easing';
  
  let showSvg = $state(false);
</script>

<button onclick={() => showSvg = !showSvg}>
  SVGを描画
</button>

{#if showSvg}
  <svg width="200" height="200">
    <path
      d="M 10 10 L 190 10 L 190 190 L 10 190 Z"
      stroke="black"
      fill="none"
      stroke-width="2"
      transition:draw={{
        duration: 2000,
        easing: quintInOut
      }}
    />
  </svg>
{/if}