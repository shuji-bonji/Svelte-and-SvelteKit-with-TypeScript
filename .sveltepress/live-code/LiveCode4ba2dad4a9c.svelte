<script lang="ts">
  interface Todo {
    id: string;
    text: string;
    completed: boolean;
    createdAt: Date;
  }
  
  let todos = $state<Todo[]>([]);
  let newTodoText = $state('');
  
  function addTodo() {
    if (!newTodoText.trim()) return;
    
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      text: newTodoText,
      completed: false,
      createdAt: new Date()
    };
    
    todos = [...todos, newTodo];
    newTodoText = '';
  }
  
  function toggleTodo(id: string) {
    todos = todos.map(todo =>
      todo.id === id 
        ? { ...todo, completed: !todo.completed }
        : todo
    );
  }
  
  function deleteTodo(id: string) {
    todos = todos.filter(todo => todo.id !== id);
  }
  
  // 派生値
  let completedCount = $derived(
    todos.filter(todo => todo.completed).length
  );
  
  let pendingCount = $derived(
    todos.length - completedCount
  );
</script>

<div>
  <input 
    bind:value={newTodoText}
    onkeydown={(e) => e.key === 'Enter' && addTodo()}
    placeholder="新しいタスクを入力"
  />
  <button onclick={addTodo}>追加</button>
</div>

<ul>
  {#each todos as todo (todo.id)}
    <li class:completed={todo.completed}>
      <input 
        type="checkbox"
        checked={todo.completed}
        onchange={() => toggleTodo(todo.id)}
      />
      <span>{todo.text}</span>
      <button onclick={() => deleteTodo(todo.id)}>削除</button>
    </li>
  {/each}
</ul>

<p>
  完了: {completedCount} / 未完了: {pendingCount}
</p>

<style>
  .completed {
    text-decoration: line-through;
    opacity: 0.6;
  }
</style>