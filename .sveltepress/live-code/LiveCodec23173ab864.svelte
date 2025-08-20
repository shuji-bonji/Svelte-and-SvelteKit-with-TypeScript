<script lang="ts">
  import { flip } from 'svelte/animate';
  import { quintOut } from 'svelte/easing';
  import { fade, scale } from 'svelte/transition';
  
  let items = $state([
    { id: 1, name: 'アイテム1', color: '#FF6B6B' },
    { id: 2, name: 'アイテム2', color: '#4ECDC4' },
    { id: 3, name: 'アイテム3', color: '#45B7D1' },
    { id: 4, name: 'アイテム4', color: '#96CEB4' },
    { id: 5, name: 'アイテム5', color: '#FFEAA7' },
  ]);
  
  let nextId = 6;
  
  function shuffle() {
    items = items.sort(() => Math.random() - 0.5);
  }
  
  function remove(id: number) {
    items = items.filter(item => item.id !== id);
  }
  
  function add() {
    const colors = ['#DDA0DD', '#98D8C8', '#F7DC6F', '#85C1E2', '#F8B739'];
    items = [...items, {
      id: nextId++,
      name: `アイテム${nextId}`,
      color: colors[Math.floor(Math.random() * colors.length)]
    }];
  }
</script>

<div style="display: flex; gap: 0.5rem; margin-bottom: 1rem;">
  <button onclick={shuffle}>🔀 シャッフル</button>
  <button onclick={add}>➕ 追加</button>
</div>

<div class="items-grid">
  {#each items as item (item.id)}
    <div
      class="item-card"
      style="background: {item.color};"
      animate:flip={{
        duration: 300,
        easing: quintOut
      }}
      in:scale={{ duration: 300, easing: quintOut }}
      out:fade={{ duration: 200 }}
    >
      <span>{item.name}</span>
      <button 
        class="remove-btn"
        onclick={() => remove(item.id)}
        aria-label="削除"
      >
        ×
      </button>
    </div>
  {/each}
</div>

<style>
  .items-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 0.75rem;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 8px;
    min-height: 150px;
  }
  
  .item-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem;
    border-radius: 8px;
    color: white;
    font-weight: bold;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s;
  }
  
  .item-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  .remove-btn {
    background: rgba(255, 255, 255, 0.3);
    border: none;
    color: white;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    transition: background 0.2s;
  }
  
  .remove-btn:hover {
    background: rgba(255, 255, 255, 0.5);
  }
</style>