<script lang="ts">
  interface User {
    id: number;
    name: string;
    email: string;
    phone: string;
    website: string;
    company: {
      name: string;
      catchPhrase: string;
    };
  }
  
  let userId = $state(1);
  let user = $state<User | null>(null);
  let loading = $state(false);
  let error = $state<Error | null>(null);
  
  $effect(() => {
    // AbortControllerを使用してキャンセル可能にする
    const abortController = new AbortController();
    
    loading = true;
    error = null;
    
    // 非同期処理を内部関数として定義
    async function fetchUser() {
      try {
        // JSONPlaceholder APIを使用
        const response = await fetch(
          `https://jsonplaceholder.typicode.com/users/${userId}`,
          {
            signal: abortController.signal
          }
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        user = data;
      } catch (e) {
        if (e instanceof Error && e.name !== 'AbortError') {
          error = e;
          console.error('Failed to fetch user:', e);
        }
      } finally {
        loading = false;
      }
    }
    
    fetchUser();
    
    // クリーンアップ: リクエストをキャンセル
    return () => {
      abortController.abort();
    };
  });
  
  function nextUser() {
    userId = userId >= 10 ? 1 : userId + 1;
  }
  
  function prevUser() {
    userId = userId <= 1 ? 10 : userId - 1;
  }
</script>

<div class="user-viewer">
  <div class="controls">
    <button onclick={prevUser}>前のユーザー</button>
    <span>ユーザーID: {userId}</span>
    <button onclick={nextUser}>次のユーザー</button>
  </div>
  
  {#if loading}
    <div class="loading">読み込み中...</div>
  {:else if error}
    <div class="error">エラー: {error.message}</div>
  {:else if user}
    <div class="user-card">
      <h3>{user.name}</h3>
      <p>📧 {user.email}</p>
      <p>📱 {user.phone}</p>
      <p>🌐 {user.website}</p>
      <div class="company">
        <p><strong>{user.company.name}</strong></p>
        <p class="catchphrase">"{user.company.catchPhrase}"</p>
      </div>
    </div>
  {/if}
</div>

<style>
  .user-viewer {
    max-width: 400px;
    margin: 0 auto;
  }
  
  .controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding: 0.5rem;
    background: #f5f5f5;
    border-radius: 5px;
  }
  
  .controls button {
    padding: 0.5rem 1rem;
    background: #4a5568;
    color: white;
    border: none;
    border-radius: 3px;
    cursor: pointer;
  }
  
  .controls button:hover {
    background: #2d3748;
  }

  .controls span {
    color: #444
  }
  
  .loading {
    text-align: center;
    padding: 2rem;
    color: #718096;
  }
  
  .error {
    padding: 1rem;
    background: #fed7d7;
    color: #c53030;
    border-radius: 5px;
  }
  
  .user-card {
    padding: 1.5rem;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .user-card h3 {
    margin: 0 0 1rem 0;
    color: #2d3748;
  }
  
  .user-card p {
    margin: 0.5rem 0;
    color: #4a5568;
  }
  
  .company {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #e2e8f0;
  }
  
  .catchphrase {
    font-style: italic;
    color: #718096;
  }
</style>