<script lang="ts">
  interface User {
    id: number;
    name: string;
    email: string;
  }
  
  let userId = $state(1);
  let user = $state<User | null>(null);
  let loading = $state(false);
  
  // DOMアクセス前に実行される
  $effect.pre(() => {
    loading = true;
    
    // APIからデータを取得
    fetch(`https://jsonplaceholder.typicode.com/users/${userId}`)
      .then(res => res.json())
      .then(data => {
        user = data;
        loading = false;
      })
      .catch(() => {
        user = null;
        loading = false;
      });
  });
</script>

<div>
  <label>
    ユーザーID:
    <input type="number" bind:value={userId} min="1" max="10" />
  </label>
  
  {#if loading}
    <p>読み込み中...</p>
  {:else if user}
    <div>
      <h3>{user.name}</h3>
      <p>{user.email}</p>
    </div>
  {:else}
    <p>ユーザーが見つかりません</p>
  {/if}
</div>