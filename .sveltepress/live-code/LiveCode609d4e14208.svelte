<script lang="ts">
  // 配列もリアクティブ
  let todos = $state<string[]>([
    'Svelte 5を学ぶ',
    'Runesを理解する'
  ]);
  
  let newTodo = $state('');
  
  // 配列への追加
  function addTodo() {
    if (newTodo.trim()) {
      todos.push(newTodo); // pushでもリアクティブ
      newTodo = '';
    }
  }
  
  // 配列からの削除
  function removeTodo(index: number) {
    todos.splice(index, 1); // spliceでもリアクティブ
  }
  
  // 配列の更新
  function updateTodo(index: number, value: string) {
    todos[index] = value; // インデックスアクセスでもリアクティブ
  }
</script>

<input bind:value={newTodo} placeholder="新しいTODO" />
<button onclick={addTodo}>追加</button>

<ul>
  {#each todos as todo, index}
    <li>
      <input
        value={todo}
        oninput={(e) => updateTodo(index, e.currentTarget.value)}
      />
      <button onclick={() => removeTodo(index)}>削除</button>
    </li>
  {/each}
</ul>
<p>{todos}</p>