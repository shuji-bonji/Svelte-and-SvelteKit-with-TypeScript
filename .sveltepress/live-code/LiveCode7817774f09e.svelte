<script lang="ts">
  type Todo = {
    id: string;
    text: string;
    done: boolean;
  };
  
  let todos = $state<Todo[]>([
    { id: '1', text: 'Svelte 5を学習する', done: false },
    { id: '2', text: 'Runesシステムを理解する', done: false }
  ]);
  let newTodoText = $state('');
  let darkMode = $state(false);
  
  // ダークモード初期化（システム設定を検出）
  $effect(() => {
    if (typeof window !== 'undefined') {
      darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      // システム設定の変更を監視
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = (e: MediaQueryListEvent) => {
        darkMode = e.matches;
      };
      mediaQuery.addEventListener('change', handler);
      
      return () => mediaQuery.removeEventListener('change', handler);
    }
  });
  
  // 完了していないTODOの数
  let remainingCount = $derived(
    todos.filter(t => !t.done).length
  );
  
  // 完了率
  let completionRate = $derived(() => {
    if (todos.length === 0) return 0;
    const completed = todos.filter(t => t.done).length;
    return Math.round((completed / todos.length) * 100);
  });
  
  // 統計情報のログ出力（副作用の例）
  $effect(() => {
    console.log(`TODOs: ${todos.length}個、残り: ${remainingCount}個`);
  });
  
  function addTodo() {
    if (!newTodoText.trim()) return;
    
    todos = [...todos, {
      id: Date.now().toString(),
      text: newTodoText,
      done: false
    }];
    
    newTodoText = '';
  }
  
  function toggleTodo(id: string) {
    todos = todos.map(todo => 
      todo.id === id ? { ...todo, done: !todo.done } : todo
    );
  }
  
  function deleteTodo(id: string) {
    todos = todos.filter(todo => todo.id !== id);
  }
</script>

<div class="todo-container" class:dark={darkMode}>
  <div class="header">
    <h2>TODOリスト（Runesシステム）</h2>
    <button 
      onclick={() => darkMode = !darkMode} 
      class="theme-toggle"
      aria-label="テーマ切り替え"
    >
      {darkMode ? '☀️' : '🌙'}
    </button>
  </div>
  
  <div class="input-group">
    <input 
      bind:value={newTodoText}
      onkeydown={(e) => e.key === 'Enter' && addTodo()}
      placeholder="新しいTODOを入力"
      class="todo-input"
    />
    <button onclick={addTodo} class="add-btn">追加</button>
  </div>
  
  {#if todos.length > 0}
    <ul class="todo-list">
      {#each todos as todo (todo.id)}
        <li class="todo-item">
          <input
            type="checkbox"
            checked={todo.done}
            onchange={() => toggleTodo(todo.id)}
            class="todo-checkbox"
          />
          <span class:done={todo.done} class="todo-text">
            {todo.text}
          </span>
          <button onclick={() => deleteTodo(todo.id)} class="delete-btn">
            削除
          </button>
        </li>
      {/each}
    </ul>
    
    <div class="stats">
      <p>📊 残りのタスク: <strong>{remainingCount}</strong>個</p>
      <p>✅ 完了率: <strong>{completionRate()}</strong>%</p>
      <div class="progress-bar">
        <div class="progress-fill" style="width: {completionRate()}%"></div>
      </div>
    </div>
  {:else}
    <p class="empty-message">TODOがありません。新しいタスクを追加してください。</p>
  {/if}
</div>

<style>
  .todo-container {
    max-width: 500px;
    margin: 0 auto;
    padding: 2rem;
    background: #f9f9f9;
    border-radius: 8px;
    transition: background-color 0.3s ease, color 0.3s ease;
  }
  
  .todo-container.dark {
    background: #1a1a1a;
    color: #e0e0e0;
  }
  
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }
  
  h2 {
    color: #ff3e00;
    margin: 0;
  }
  
  .theme-toggle {
    background: transparent;
    border: 2px solid #ff3e00;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    font-size: 1.2rem;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .theme-toggle:hover {
    background: #ff3e00;
    transform: rotate(180deg);
  }
  
  .input-group {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
  }
  
  .todo-input {
    flex: 1;
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
    background: white;
    color: #333;
    transition: all 0.3s ease;
  }
  
  .dark .todo-input {
    background: #2a2a2a;
    border-color: #444;
    color: #e0e0e0;
  }
  
  .dark .todo-input::placeholder {
    color: #888;
  }
  
  .add-btn {
    padding: 0.5rem 1rem;
    background: #ff3e00;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
  }
  
  .add-btn:hover {
    background: #ff5a00;
  }
  
  .todo-list {
    list-style: none;
    padding: 0;
    margin: 0 0 1.5rem 0;
  }
  
  .todo-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem;
    background: white;
    border-radius: 4px;
    margin-bottom: 0.5rem;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    transition: all 0.3s ease;
  }
  
  .dark .todo-item {
    background: #2a2a2a;
    box-shadow: 0 1px 3px rgba(0,0,0,0.3);
  }
  
  .todo-checkbox {
    width: 20px;
    height: 20px;
    cursor: pointer;
  }
  
  .todo-text {
    flex: 1;
    font-size: 1rem;
    color: #333;
    transition: all 0.3s ease;
  }
  
  .dark .todo-text {
    color: #e0e0e0;
  }
  
  .todo-text.done {
    text-decoration: line-through;
    opacity: 0.5;
    color: #666;
  }
  
  .dark .todo-text.done {
    color: #888;
  }
  
  .delete-btn {
    padding: 0.25rem 0.5rem;
    background: #dc3545;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.875rem;
  }
  
  .delete-btn:hover {
    background: #c82333;
  }
  
  .stats {
    padding: 1rem;
    background: white;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    transition: all 0.3s ease;
  }
  
  .dark .stats {
    background: #2a2a2a;
    box-shadow: 0 1px 3px rgba(0,0,0,0.3);
  }
  
  .stats p {
    margin: 0.5rem 0;
    color: #333;
  }
  
  .dark .stats p {
    color: #e0e0e0;
  }
  
  .stats strong {
    color: #ff3e00;
  }
  
  .progress-bar {
    width: 100%;
    height: 20px;
    background: #e9ecef;
    border-radius: 10px;
    overflow: hidden;
    margin-top: 0.5rem;
    transition: background 0.3s ease;
  }
  
  .dark .progress-bar {
    background: #444;
  }
  
  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #ff3e00 0%, #ff5a00 100%);
    transition: width 0.3s ease;
  }
  
  .empty-message {
    text-align: center;
    color: #666;
    padding: 2rem;
    background: white;
    border-radius: 4px;
    transition: all 0.3s ease;
  }
  
  .dark .empty-message {
    background: #2a2a2a;
    color: #999;
  }
</style>