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
    <h3>📝 TODO</h3>
    {#each todos as item (item.id)}
      <div
        class="task-item"
        in:receive={{ key: item.id }}
        out:send={{ key: item.id }}
        animate:flip={{ duration: 300 }}
        onclick={() => toggle(item.id)}
      >
        <span class="checkbox">☐</span>
        {item.text}
      </div>
    {/each}
    {#if todos.length === 0}
      <p class="empty">タスクなし</p>
    {/if}
  </div>
  
  <div class="column">
    <h3>✅ 完了</h3>
    {#each done as item (item.id)}
      <div
        class="task-item done"
        in:receive={{ key: item.id }}
        out:send={{ key: item.id }}
        animate:flip={{ duration: 300 }}
        onclick={() => toggle(item.id)}
      >
        <span class="checkbox">☑</span>
        {item.text}
      </div>
    {/each}
    {#if done.length === 0}
      <p class="empty">完了タスクなし</p>
    {/if}
  </div>
</div>

<style>
  .board {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    margin-top: 1rem;
  }
  
  .column {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 1rem;
    min-height: 200px;
  }
  
  .column h3 {
    margin: 0 0 1rem;
    color: #2d3748;
  }
  
  .task-item {
    background: white;
    padding: 0.75rem;
    margin-bottom: 0.5rem;
    border-radius: 6px;
    cursor: pointer;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    transition: box-shadow 0.2s;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .task-item:hover {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
  }
  
  .task-item.done {
    background: #e8f5e9;
    text-decoration: line-through;
    opacity: 0.8;
  }
  
  .checkbox {
    font-size: 1.2rem;
  }
  
  .empty {
    color: #718096;
    text-align: center;
    font-style: italic;
  }
</style>