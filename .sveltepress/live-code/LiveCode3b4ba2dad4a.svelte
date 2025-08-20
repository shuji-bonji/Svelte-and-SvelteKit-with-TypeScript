<script lang="ts">
  // ユーザー情報の型定義
  interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'user' | 'guest';
  }
  
  // 状態の型定義
  let user = $state<User | null>(null);
  let loading = $state(false);
  let error = $state<string | null>(null);
  
  // 非同期データ取得
  async function fetchUser(id: string): Promise<void> {
    loading = true;
    error = null;
    
    try {
      const response = await fetch(`/api/users/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }
      user = await response.json();
    } catch (err) {
      error = err instanceof Error ? err.message : 'Unknown error';
    } finally {
      loading = false;
    }
  }
</script>

{#if loading}
  <p>Loading...</p>
{:else if error}
  <p class="error">{error}</p>
{:else if user}
  <div>
    <h2>{user.name}</h2>
    <p>{user.email}</p>
    <span class="role">{user.role}</span>
  </div>
{/if}