<script lang="ts">
  type Product = {
    id: number;
    name: string;
    price: number;
    category: string;
  };

  type CartItem = {
    product: Product;
    quantity: number;
  };

  // 商品リスト
  const products: Product[] = [
    { id: 1, name: 'ノートPC', price: 120000, category: 'electronics' },
    { id: 2, name: 'マウス', price: 3000, category: 'electronics' },
    { id: 3, name: 'キーボード', price: 10000, category: 'electronics' },
    { id: 4, name: 'モニター', price: 40000, category: 'electronics' },
    { id: 5, name: 'USBケーブル', price: 1000, category: 'accessories' },
    { id: 6, name: 'ノート', price: 500, category: 'stationery' }
  ];

  // 状態管理
  let cart = $state<CartItem[]>([]);
  let taxRate = $state(0.1); // 10%
  let shippingFee = $state(500);
  let discountCode = $state('');
  let discountRate = $state(0);

  // カート内の商品数（$derivedで自動計算）
  let itemCount = $derived(
    cart.reduce((sum, item) => sum + item.quantity, 0)
  );

  // 小計
  let subtotal = $derived(
    cart.reduce((sum, item) => 
      sum + (item.product.price * item.quantity), 0
    )
  );

  // 割引額
  let discountAmount = $derived(
    Math.floor(subtotal * discountRate)
  );

  // 割引後の金額
  let afterDiscount = $derived(
    subtotal - discountAmount
  );

  // 税額
  let tax = $derived(
    Math.floor(afterDiscount * taxRate)
  );

  // 送料（5000円以上で無料）
  let shipping = $derived(
    afterDiscount >= 5000 ? 0 : shippingFee
  );

  // 合計
  let total = $derived(
    afterDiscount + tax + shipping
  );

  // 送料無料まであといくら？
  let freeShippingThreshold = $derived.by(() => {
    if (afterDiscount >= 5000) return 0;
    return 5000 - afterDiscount;
  });

  // カート操作関数
  function addToCart(product: Product) {
    const existingItem = cart.find(item => item.product.id === product.id);
    
    if (existingItem) {
      cart = cart.map(item =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      cart = [...cart, { product, quantity: 1 }];
    }
  }

  function removeFromCart(productId: number) {
    cart = cart.filter(item => item.product.id !== productId);
  }

  function updateQuantity(productId: number, quantity: number) {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      cart = cart.map(item =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      );
    }
  }

  function applyDiscount() {
    // 簡単な割引コードの検証
    if (discountCode === 'SAVE10') {
      discountRate = 0.1; // 10%割引
    } else if (discountCode === 'SAVE20') {
      discountRate = 0.2; // 20%割引
    } else {
      discountRate = 0;
      alert('無効な割引コードです');
    }
  }

  function clearCart() {
    cart = [];
    discountCode = '';
    discountRate = 0;
  }
</script>

<div class="shopping-cart">
  <div class="products-section">
    <h3>商品リスト</h3>
    <div class="products-grid">
      {#each products as product}
        <div class="product-card">
          <h4>{product.name}</h4>
          <p class="price">¥{product.price.toLocaleString()}</p>
          <button onclick={() => addToCart(product)}>
            カートに追加
          </button>
        </div>
      {/each}
    </div>
  </div>

  <div class="cart-section">
    <h3>ショッピングカート ({itemCount}点)</h3>
    
    {#if cart.length === 0}
      <p class="empty-cart">カートは空です</p>
    {:else}
      <div class="cart-items">
        {#each cart as item}
          <div class="cart-item">
            <div class="item-info">
              <span class="item-name">{item.product.name}</span>
              <span class="item-price">
                ¥{item.product.price.toLocaleString()}
              </span>
            </div>
            <div class="quantity-controls">
              <button onclick={() => updateQuantity(item.product.id, item.quantity - 1)}>
                -
              </button>
              <span class="quantity">{item.quantity}</span>
              <button onclick={() => updateQuantity(item.product.id, item.quantity + 1)}>
                +
              </button>
              <button class="remove" onclick={() => removeFromCart(item.product.id)}>
                削除
              </button>
            </div>
            <div class="item-total">
              ¥{(item.product.price * item.quantity).toLocaleString()}
            </div>
          </div>
        {/each}
      </div>

      <div class="discount-section">
        <input
          type="text"
          bind:value={discountCode}
          placeholder="割引コード（例: SAVE10）"
        />
        <button onclick={applyDiscount}>適用</button>
      </div>

      <div class="summary">
        <div class="summary-row">
          <span>小計:</span>
          <span>¥{subtotal.toLocaleString()}</span>
        </div>
        
        {#if discountAmount > 0}
          <div class="summary-row discount">
            <span>割引 ({(discountRate * 100).toFixed(0)}%):</span>
            <span>-¥{discountAmount.toLocaleString()}</span>
          </div>
        {/if}
        
        <div class="summary-row">
          <span>税金 (10%):</span>
          <span>¥{tax.toLocaleString()}</span>
        </div>
        
        <div class="summary-row">
          <span>送料:</span>
          <span>
            {shipping === 0 ? '無料' : `¥${shipping.toLocaleString()}`}
          </span>
        </div>
        
        {#if freeShippingThreshold > 0}
          <div class="free-shipping-info">
            あと¥{freeShippingThreshold.toLocaleString()}で送料無料！
          </div>
        {/if}
        
        <div class="summary-row total">
          <span>合計:</span>
          <span>¥{total.toLocaleString()}</span>
        </div>
      </div>

      <div class="actions">
        <button class="clear-btn" onclick={clearCart}>
          カートをクリア
        </button>
        <button class="checkout-btn">
          購入手続きへ
        </button>
      </div>
    {/if}
  </div>
</div>

<style>
  .shopping-cart {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    padding: 2rem;
    background: #f9f9f9;
    border-radius: 8px;
  }

  .products-section h3,
  .cart-section h3 {
    color: #ff3e00;
    margin-bottom: 1rem;
  }

  .products-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .product-card {
    background: white;
    padding: 1rem;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }

  .product-card h4 {
    margin: 0 0 0.5rem 0;
    font-size: 1rem;
  }

  .price {
    color: #ff3e00;
    font-weight: bold;
    margin: 0.5rem 0;
  }

  button {
    padding: 0.5rem 1rem;
    background: #ff3e00;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
  }

  button:hover {
    background: #ff5a00;
  }

  .empty-cart {
    text-align: center;
    color: #999;
    padding: 2rem;
    background: white;
    border-radius: 4px;
  }

  .cart-items {
    background: white;
    border-radius: 4px;
    padding: 1rem;
    margin-bottom: 1rem;
  }

  .cart-item {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr;
    align-items: center;
    padding: 0.75rem 0;
    border-bottom: 1px solid #eee;
  }

  .cart-item:last-child {
    border-bottom: none;
  }

  .item-info {
    display: flex;
    flex-direction: column;
  }

  .item-name {
    font-weight: 500;
  }

  .item-price {
    color: #666;
    font-size: 0.9rem;
  }

  .quantity-controls {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .quantity-controls button {
    width: 30px;
    height: 30px;
    padding: 0;
  }

  .quantity {
    min-width: 30px;
    text-align: center;
    font-weight: bold;
  }

  .remove {
    background: #dc3545;
    font-size: 0.8rem;
    padding: 0.3rem 0.6rem;
  }

  .item-total {
    text-align: right;
    font-weight: bold;
    color: #ff3e00;
  }

  .discount-section {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .discount-section input {
    flex: 1;
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
  }

  .summary {
    background: white;
    padding: 1rem;
    border-radius: 4px;
    margin-bottom: 1rem;
  }

  .summary-row {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 0;
    border-bottom: 1px solid #eee;
  }

  .summary-row.discount {
    color: #28a745;
  }

  .summary-row.total {
    border-bottom: none;
    border-top: 2px solid #ff3e00;
    margin-top: 0.5rem;
    padding-top: 1rem;
    font-size: 1.2rem;
    font-weight: bold;
    color: #ff3e00;
  }

  .free-shipping-info {
    background: #fff3cd;
    color: #856404;
    padding: 0.5rem;
    margin: 0.5rem 0;
    border-radius: 4px;
    text-align: center;
    font-size: 0.9rem;
  }

  .actions {
    display: flex;
    gap: 1rem;
  }

  .clear-btn {
    background: #6c757d;
  }

  .checkout-btn {
    flex: 1;
    background: #28a745;
    font-size: 1.1rem;
    padding: 0.75rem;
  }

  @media (max-width: 768px) {
    .shopping-cart {
      grid-template-columns: 1fr;
    }
    
    .products-grid {
      grid-template-columns: 1fr;
    }
  }
</style>