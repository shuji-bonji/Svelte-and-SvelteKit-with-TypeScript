<script lang="ts">
  import { flip } from 'svelte/animate';
  import { crossfade } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  
  const [send, receive] = crossfade({
    duration: 300,
    fallback(node) {
      const style = getComputedStyle(node);
      const transform = style.transform === 'none' ? '' : style.transform;
      
      return {
        duration: 300,
        css: t => `
          transform: ${transform} scale(${t});
          opacity: ${t}
        `
      };
    }
  });
  
  let todoItems = $state([
    { id: 1, text: 'タスク1', done: false },
    { id: 2, text: 'タスク2', done: false },
    { id: 3, text: 'タスク3', done: true }
  ]);
  
  let todos = $derived(todoItems.filter(item => !item.done));
  let done = $derived(todoItems.filter(item => item.done));
  
  function toggle(id: number) {
    const item = todoItems.find(i => i.id === id);
    if (item) item.done = !item.done;
  }
</script>

<div class="board">
  <div class="column">
    <h2>TODO</h2>
    {#each todos as item (item.id)}
      <div
        class="item"
        in:receive={{ key: item.id }}
        out:send={{ key: item.id }}
        animate:flip={{ duration: 300 }}
        onclick={() => toggle(item.id)}
      >
        {item.text}
      </div>
    {/each}
  </div>
  
  <div class="column">
    <h2>完了</h2>
    {#each done as item (item.id)}
      <div
        class="item done"
        in:receive={{ key: item.id }}
        out:send={{ key: item.id }}
        animate:flip={{ duration: 300 }}
        onclick={() => toggle(item.id)}
      >
        {item.text}
      </div>
    {/each}
  </div>
</div>