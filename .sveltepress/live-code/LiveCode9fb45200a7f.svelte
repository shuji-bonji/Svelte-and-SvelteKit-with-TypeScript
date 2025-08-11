<script lang="ts">
  type Todo = {
    id: number;
    text: string;
    done: boolean;
    createdAt: Date;
  };
  
  // TODOリストの状態
  let todos = $state<Todo[]>([]);
  let newTodoText = $state('');
  let filter = $state<'all' | 'active' | 'completed'>('all');
  
  // フィルタリングされたTODO（$derivedとの組み合わせ例）
  let filteredTodos = $derived(
    filter === 'active' ? todos.filter(t => !t.done) :
    filter === 'completed' ? todos.filter(t => t.done) :
    todos
  );
  
  // 統計情報
  let stats = $derived({
    total: todos.length,
    completed: todos.filter(t => t.done).length,
    active: todos.filter(t => !t.done).length
  });
  
  function addTodo() {
    if (!newTodoText.trim()) return;
    
    todos = [...todos, {
      id: Date.now(),
      text: newTodoText,
      done: false,
      createdAt: new Date()
    }];
    
    newTodoText = '';
  }
  
  function toggleTodo(id: number) {
    todos = todos.map(todo =>
      todo.id === id ? { ...todo, done: !todo.done } : todo
    );
  }
  
  function deleteTodo(id: number) {
    todos = todos.filter(todo => todo.id !== id);
  }
  
  function clearCompleted() {
    todos = todos.filter(todo => !todo.done);
  }
</script>

<div class="todo-app">
  <h3>TODOリスト</h3>
  
  <div class="input-group">
    <input
      type="text"
      bind:value={newTodoText}
      placeholder="新しいTODOを入力..."
      onkeydown={(e) => e.key === 'Enter' && addTodo()}
    />
    <button onclick={addTodo}>追加</button>
  </div>
  
  <div class="filters">
    <button
      class:active={filter === 'all'}
      onclick={() => filter = 'all'}
    >
      全て ({stats.total})
    </button>
    <button
      class:active={filter === 'active'}
      onclick={() => filter = 'active'}
    >
      未完了 ({stats.active})
    </button>
    <button
      class:active={filter === 'completed'}
      onclick={() => filter = 'completed'}
    >
      完了 ({stats.completed})
    </button>
  </div>
  
  <ul class="todo-list">
    {#each filteredTodos as todo (todo.id)}
      <li class="todo-item" class:done={todo.done}>
        <input
          type="checkbox"
          checked={todo.done}
          onchange={() => toggleTodo(todo.id)}
        />
        <span class="todo-text">{todo.text}</span>
        <button class="delete-btn" onclick={() => deleteTodo(todo.id)}>
          ×
        </button>
      </li>
    {:else}
      <li class="empty">TODOがありません</li>
    {/each}
  </ul>
  
  {#if stats.completed > 0}
    <button class="clear-btn" onclick={clearCompleted}>
      完了済みを削除
    </button>
  {/if}
</div>

<style>
  .todo-app {
    padding: 2rem;
    background: #f9f9f9;
    border-radius: 8px;
    max-width: 500px;
    margin: 0 auto;
  }
  
  h3 {
    color: #ff3e00;
    margin-bottom: 1rem;
  }
  
  .input-group {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }
  
  input[type="text"] {
    flex: 1;
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
  }
  
  button {
    padding: 0.5rem 1rem;
    background: #ff3e00;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  button:hover {
    background: #ff5a00;
  }
  
  .filters {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }
  
  .filters button {
    background: #e9ecef;
    color: #333;
  }
  
  .filters button.active {
    background: #ff3e00;
    color: white;
  }
  
  .todo-list {
    list-style: none;
    padding: 0;
    margin: 0 0 1rem 0;
  }
  
  .todo-item {
    display: flex;
    align-items: center;
    padding: 0.75rem;
    background: white;
    margin-bottom: 0.5rem;
    border-radius: 4px;
  }
  
  .todo-item.done .todo-text {
    text-decoration: line-through;
    color: #999;
  }
  
  .todo-text {
    flex: 1;
    margin: 0 0.5rem;
  }
  
  .delete-btn {
    background: #dc3545;
    color: white;
    width: 30px;
    height: 30px;
    padding: 0;
    font-size: 1.5rem;
    line-height: 1;
  }
  
  .empty {
    text-align: center;
    color: #999;
    padding: 2rem;
  }
  
  .clear-btn {
    width: 100%;
  }
</style>