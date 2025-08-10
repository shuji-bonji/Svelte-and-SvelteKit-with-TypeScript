<script lang="ts">
  // 実際のプロジェクトでは以下のようにインポートします
  // import TodoItem from '$lib/components/TodoItem.svelte';
  
  interface Todo {
    id: number;
    text: string;
    completed: boolean;
    createdAt: Date;
  }
  
  let todos = $state<Todo[]>([
    {
      id: 1,
      text: 'Svelte 5を学習する',
      completed: false,
      createdAt: new Date('2024-01-15')
    },
    {
      id: 2,
      text: 'Runesシステムを理解する',
      completed: true,
      createdAt: new Date('2024-01-16')
    },
    {
      id: 3,
      text: 'TODOアプリを作成する',
      completed: false,
      createdAt: new Date('2024-01-17')
    }
  ]);
  
  let newTodoText = $state('');
  
  function addTodo() {
    if (newTodoText.trim()) {
      const newTodo: Todo = {
        id: Date.now(),
        text: newTodoText,
        completed: false,
        createdAt: new Date()
      };
      todos = [...todos, newTodo];
      newTodoText = '';
    }
  }
  
  function toggleTodo(id: number) {
    todos = todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
  }
  
  function deleteTodo(id: number) {
    todos = todos.filter(todo => todo.id !== id);
  }
  
  let completedCount = $derived(todos.filter(t => t.completed).length);
  let totalCount = $derived(todos.length);
  
  // インラインコンポーネントとして定義（通常は別ファイル）
  // TodoItem.svelteの内容をここに含める
</script>

<div class="todo-app">
  <h1>TODOリスト</h1>
  
  <div class="add-todo">
    <input
      type="text"
      bind:value={newTodoText}
      placeholder="新しいタスクを入力..."
      onkeydown={(e) => e.key === 'Enter' && addTodo()}
    />
    <button onclick={addTodo}>追加</button>
  </div>
  
  <div class="todo-list">
    {#each todos as todo (todo.id)}
      <!-- TodoItemコンポーネントの内容をインラインで展開 -->
      {#if todo}
      <div class="todo-item" class:completed={todo.completed}>
        <input
          type="checkbox"
          checked={todo.completed}
          onchange={() => toggleTodo(todo.id)}
        />
        
        <span class="text">{todo.text}</span>
        
        <span class="date">{todo.createdAt.toLocaleDateString('ja-JP')}</span>
        
        <button
          class="delete"
          onclick={() => {
            if (confirm('削除してもよろしいですか？')) {
              deleteTodo(todo.id);
            }
          }}
          aria-label="削除"
        >
          ×
        </button>
      </div>
      {/if}
    {/each}
  </div>
  
  {#if totalCount > 0}
    <div class="summary">
      完了: {completedCount} / {totalCount}
    </div>
  {/if}
</div>

<style>
  .todo-app {
    max-width: 600px;
    margin: 0 auto;
    padding: 2rem;
  }
  
  h1 {
    color: #ff3e00;
    text-align: center;
  }
  
  .add-todo {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 2rem;
  }
  
  .add-todo input {
    flex: 1;
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
  }
  
  .add-todo button {
    padding: 0.5rem 1rem;
    background: #ff3e00;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
  }
  
  .add-todo button:hover {
    background: #ff5a00;
  }
  
  .todo-list {
    border: 1px solid #eee;
    border-radius: 4px;
    overflow: hidden;
  }
  
  .summary {
    text-align: center;
    margin-top: 1rem;
    color: #666;
    font-size: 0.9rem;
  }
  
  /* TodoItemコンポーネントのスタイル */
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
  
  .todo-item .text {
    flex: 1;
  }
  
  .todo-item .date {
    font-size: 0.8rem;
    color: #666;
  }
  
  .todo-item .delete {
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
  
  .todo-item .delete:hover {
    background: #cc0000;
  }
</style>