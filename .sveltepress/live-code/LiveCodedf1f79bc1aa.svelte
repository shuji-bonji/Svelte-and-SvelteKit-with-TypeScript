<script lang="ts">
  let searchQuery = $state('');
  let searchResults = $state<string[]>([]);
  let searching = $state(false);
  
  // デバウンス付き検索
  $effect(() => {
    if (!searchQuery) {
      searchResults = [];
      return;
    }
    
    searching = true;
    
    // 500ms のデバウンス
    const timeoutId = setTimeout(async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
        const data = await response.json();
        searchResults = data;
      } catch (e) {
        console.error('検索エラー:', e);
      } finally {
        searching = false;
      }
    }, 500);
    
    // クリーンアップ: タイマーをクリア
    return () => {
      clearTimeout(timeoutId);
      searching = false;
    };
  });
</script>

<input 
  bind:value={searchQuery}
  placeholder="検索..."
/>

{#if searching}
  <p>検索中...</p>
{:else}
  <ul>
    {#each searchResults as result}
      <li>{result}</li>
    {/each}
  </ul>
{/if}