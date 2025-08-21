<script lang="ts">
  // プリミティブ値
  let count = $state(0);
  
  // オブジェクト
  let user = $state({
    name: '太郎',
    age: 25
  });
  
  // 配列
  let items = $state<string[]>([]);
</script>

<button onclick={() => count++}>
  カウント: {count}
</button>