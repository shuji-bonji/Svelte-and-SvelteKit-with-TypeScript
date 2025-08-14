<script lang="ts">
  interface Product {
    id: number;
    name: string;
    price: number;
    quantity: number;
  }
  
  let products = $state<Product[]>([
    { id: 1, name: 'ノートPC', price: 100000, quantity: 2 },
    { id: 2, name: 'マウス', price: 3000, quantity: 5 },
    { id: 3, name: 'キーボード', price: 8000, quantity: 3 }
  ]);
  
  let taxRate = $state(0.1);
  let discountRate = $state(0.05);
  
  // ブロック構文で複雑な計算
  let summary = $derived(() => {
    const subtotal = products.reduce((sum, product) => {
      return sum + product.price * product.quantity;
    }, 0);
    
    const discount = subtotal * discountRate;
    const afterDiscount = subtotal - discount;
    const tax = afterDiscount * taxRate;
    const total = afterDiscount + tax;
    
    return {
      subtotal,
      discount,
      afterDiscount,
      tax,
      total,
      itemCount: products.reduce((sum, p) => sum + p.quantity, 0)
    };
  });
</script>

<div class="summary">
  <p>商品数: {summary().itemCount}点</p>
  <p>小計: ¥{summary().subtotal?.toLocaleString() ?? 0}</p>
  <p>割引: -¥{summary().discount?.toLocaleString() ?? 0}</p>
  <p>割引後: ¥{summary().afterDiscount?.toLocaleString() ?? 0}</p>
  <p>税額: ¥{summary().tax?.toLocaleString() ?? 0}</p>
  <p>合計: ¥{summary().total?.toLocaleString() ?? 0}</p>
</div>