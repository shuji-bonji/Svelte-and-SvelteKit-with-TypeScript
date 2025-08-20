<script lang="ts">
  import type { TransitionConfig } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  
  function spin(node: HTMLElement, {
    delay = 0,
    duration = 400,
    easing = cubicOut,
    spin = 1
  } = {}): TransitionConfig {
    const style = getComputedStyle(node);
    const originalTransform = style.transform === 'none' ? '' : style.transform;
    const originalOpacity = +style.opacity;
    
    return {
      delay,
      duration,
      easing,
      css: (t, u) => {
        const rotation = 360 * spin * u;
        const scale = t;
        
        return `
          transform: ${originalTransform} rotate(${rotation}deg) scale(${scale});
          opacity: ${t * originalOpacity};
        `;
      }
    };
  }
  
  let items = $state<string[]>([]);
  
  function addItem() {
    items = [...items, `アイテム ${items.length + 1}`];
  }
  
  function removeItem(index: number) {
    items = items.filter((_, i) => i !== index);
  }
</script>

<button onclick={addItem}>追加</button>

<div class="grid">
  {#each items as item, index (item)}
    <div
      class="card"
      in:spin={{ duration: 500, spin: 2 }}
      out:spin={{ duration: 300, spin: -1 }}
    >
      {item}
      <button onclick={() => removeItem(index)}>×</button>
    </div>
  {/each}
</div>