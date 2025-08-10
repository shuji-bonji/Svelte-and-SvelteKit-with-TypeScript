<!-- TodoItem.svelte -->
<script lang="ts">
  export interface Todo {
    id: number;
    text: string;
    completed: boolean;
    createdAt: Date;
  }
  
  export let todo: Todo;
  export let onToggle: (id: number) => void;
  export let onDelete: (id: number) => void;
  
  function handleToggle(): void {
    onToggle(todo.id);
  }
  
  function handleDelete(): void {
    if (confirm('削除してもよろしいですか？')) {
      onDelete(todo.id);
    }
  }
  
  $: formattedDate = todo.createdAt.toLocaleDateString('ja-JP');
</script>

<div class="todo-item" class:completed={todo.completed}>
  <input
    type="checkbox"
    checked={todo.completed}
    on:change={handleToggle}
  />
  
  <span class="text">{todo.text}</span>
  
  <span class="date">{formattedDate}</span>
  
  <button
    class="delete"
    on:click={handleDelete}
    aria-label="削除"
  >
    ×
  </button>
</div>

<style>
  .todo-item {
    display: flex;
    align-items: center;
    padding: 0.5rem;
    border-bottom: 1px solid #eee;
    gap: 0.5rem;
  }
  
  .todo-item.completed .text {
    text-decoration: line-through;
    opacity: 0.6;
  }
  
  .text {
    flex: 1;
  }
  
  .date {
    font-size: 0.8rem;
    color: #666;
  }
  
  .delete {
    background: #ff4444;
    color: white;
    border: none;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    cursor: pointer;
    font-size: 1.2rem;
    line-height: 1;
  }
  
  .delete:hover {
    background: #cc0000;
  }
</style>