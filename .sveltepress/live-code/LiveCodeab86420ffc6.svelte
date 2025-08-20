<script lang="ts">
  import { fade, slide } from 'svelte/transition';
  
  let items = $state(Array.from({ length: 20 }, (_, i) => ({
    id: i,
    text: `アイテム ${i + 1}`
  })));
  
  let showItems = $state(false);
</script>

<button onclick={() => showItems = !showItems}>
  リストを表示
</button>

{#if showItems}
  <ul>
    {#each items as item, index (item.id)}
      <!-- インデックスに基づいて遅延を設定 -->
      <li
        in:slide={{ delay: index * 50, duration: 300 }}
        out:fade={{ duration: 200 }}
      >
        {item.text}
      </li>
    {/each}
  </ul>
{/if}