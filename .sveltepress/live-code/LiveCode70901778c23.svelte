<script lang="ts">
  interface Post {
    id: number;
    title: string;
    body: string;
  }
  
  let posts = $state<Post[]>([]);
  let loading = $state(true);
  let error = $state<string | null>(null);
  
  // コンポーネントマウント時にデータを取得
  $effect(() => {
    let aborted = false;
    
    async function fetchPosts() {
      try {
        loading = true;
        error = null;
        
        const response = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=5');
        if (!response.ok) throw new Error('Failed to fetch');
        
        const data = await response.json();
        
        if (!aborted) {
          posts = data;
          loading = false;
        }
      } catch (e) {
        if (!aborted) {
          error = e instanceof Error ? e.message : 'Unknown error';
          loading = false;
        }
      }
    }
    
    fetchPosts();
    
    // クリーンアップ：リクエストの中断
    return () => {
      aborted = true;
    };
  });
</script>

<div>
  <h2>投稿一覧</h2>
  
  {#if loading}
    <p>読み込み中...</p>
  {:else if error}
    <p style="color: red;">エラー: {error}</p>
  {:else}
    <ul>
      {#each posts as post}
        <li>
          <h3>{post.title}</h3>
          <p>{post.body.substring(0, 100)}...</p>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  ul {
    list-style: none;
    padding: 0;
  }
  
  li {
    margin-bottom: 1.5rem;
    padding: 1rem;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  
  h3 {
    margin: 0 0 0.5rem;
    color: #333;
  }
</style>