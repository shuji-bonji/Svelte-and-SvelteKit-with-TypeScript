<script lang="ts">
  import {
    linear,
    quadIn, quadOut, quadInOut,
    cubicIn, cubicOut, cubicInOut,
    quartIn, quartOut, quartInOut,
    quintIn, quintOut, quintInOut,
    sineIn, sineOut, sineInOut,
    expoIn, expoOut, expoInOut,
    circIn, circOut, circInOut,
    elasticIn, elasticOut, elasticInOut,
    backIn, backOut, backInOut,
    bounceIn, bounceOut, bounceInOut
  } from 'svelte/easing';
  
  import { fly } from 'svelte/transition';
  
  let selectedEasing = $state('cubicOut');
  let demo = $state(false);
  
  const easings = [
    'linear',
    'quadOut', 'cubicOut', 'quartOut', 'quintOut',
    'sineOut', 'expoOut', 'circOut',
    'elasticOut', 'backOut', 'bounceOut'
  ];
</script>

<select bind:value={selectedEasing}>
  {#each easings as easing}
    <option value={easing}>{easing}</option>
  {/each}
</select>

<button onclick={() => demo = !demo}>
  デモを実行
</button>

{#if demo}
  <div
    class="demo-box"
    transition:fly={{
      x: -200,
      duration: 1000,
      easing: eval(selectedEasing) // 実際のコードでは適切にインポート
    }}
  >
    イージング: {selectedEasing}
  </div>
{/if}