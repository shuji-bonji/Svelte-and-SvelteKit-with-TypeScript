<script lang="ts">
  let count = $state(0);
  let mounted = $state(false);
  
  // マウント時とアンマウント時の処理
  $effect(() => {
    // マウント時の処理（componentDidMountに相当）
    mounted = true;
    console.log('コンポーネントがマウントされました');
    
    // クリーンアップ関数（componentWillUnmountに相当）
    return () => {
      console.log('コンポーネントがアンマウントされます');
      mounted = false;
    };
  });
  
  // 値の変更を監視
  $effect(() => {
    console.log(`カウント値が変更されました: ${count}`);
  });
</script>

<div>
  <p>マウント状態: {mounted ? 'マウント済み' : '未マウント'}</p>
  <p>カウント: {count}</p>
  <button onclick={() => count++}>カウントアップ</button>
</div>