<script lang="ts">
  let count = $state(0);
  
  // countが変更されると自動的に再計算
  let doubled = $derived(count * 2);
  let squared = $derived(count ** 2);
  let isEven = $derived(count % 2 === 0);
  
  function increment() {
    count++;
  }
</script>

<button onclick={increment}>カウント: {count}</button>
<p>2倍: {doubled}</p>
<p>2乗: {squared}</p>
<p>偶数: {isEven}</p>