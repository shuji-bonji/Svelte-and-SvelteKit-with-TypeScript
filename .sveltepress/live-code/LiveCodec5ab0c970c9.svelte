<script lang="ts">
  let price = $state(100);
  let quantity = $state(2);
  
  // priceやquantityが変更されると自動的に再計算
  let total = $derived(price * quantity);
  
  // 複雑な計算も可能
  let summary = $derived(() => {
    const subtotal = price * quantity;
    const tax = subtotal * 0.1;
    return {
      subtotal,
      tax,
      total: subtotal + tax
    };
  });
</script>

<p>合計: {total}円</p>
<p>税込: {summary.total}円</p>