<script lang="ts">
  let mounted = $state(false);
  let updateCount = $state(0);
  
  // このeffectはコンポーネントのライフサイクルに自動的に紐づく
  $effect(() => {
    // 初回実行 = マウント時
    if (!mounted) {
      mounted = true;
      console.log('Initial mount');
    }
    
    // 更新時（updateCountが変更されるたび）
    console.log(`Update count: ${updateCount}`);
    
    // このreturn文はコンポーネント破棄時にも実行される
    return () => {
      console.log('Cleanup for update count:', updateCount);
    };
  });
</script>

<div>
  <p>マウント状態: {mounted ? 'マウント済み' : '未マウント'}</p>
  <p>更新回数: {updateCount}</p>
  <button onclick={() => updateCount++}>更新</button>
</div>