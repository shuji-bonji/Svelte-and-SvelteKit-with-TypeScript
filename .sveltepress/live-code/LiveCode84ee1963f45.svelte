<script lang="ts">
  function lazyLoad(node: HTMLElement, options: { threshold?: number } = {}) {
    // 初期状態を設定
    node.style.opacity = '0';
    node.style.transform = 'translateY(20px)';
    node.style.transition = 'all 0.5s ease';
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // 要素が表示領域に入ったらアニメーション
            node.style.opacity = '1';
            node.style.transform = 'translateY(0)';
            // 一度表示したら監視を解除
            observer.unobserve(node);
          }
        });
      },
      { 
        threshold: options.threshold || 0.1,
        rootMargin: '0px 0px -50px 0px' // 少し早めに発火
      }
    );
    
    observer.observe(node);
    
    return {
      destroy() {
        observer.disconnect();
      }
    };
  }
  
  // デモ用にアイテムを多めに作成
  const items = Array(8).fill(null).map((_, i) => ({
    id: i + 1,
    title: `セクション ${i + 1}`,
    content: `このコンテンツは遅延表示されます。スクロールすると要素が表示領域に入った時にフェードインアニメーションが実行されます。`
  }));
</script>

<div class="scroll-container">
  <div class="header">
    <p>📜 下にスクロールしてください</p>
    <p class="hint">要素が表示領域に入るとアニメーションします</p>
  </div>
  
  {#each items as item}
    <div 
      use:lazyLoad={{ threshold: 0.3 }}
      class="lazy-item"
    >
      <h3>🎯 {item.title}</h3>
      <p>{item.content}</p>
      <div class="meta">ID: {item.id}</div>
    </div>
  {/each}
  
  <div class="footer">
    <p>🎉 全ての要素が表示されました！</p>
  </div>
</div>

<style>
  .scroll-container {
    height: 400px;
    overflow-y: auto;
    padding: 1rem;
    background: linear-gradient(to bottom, #f5f5f5, #e8e8e8);
    border: 1px solid #ddd;
    border-radius: 8px;
    position: relative;
  }
  
  .header {
    text-align: center;
    padding: 1rem;
    background: white;
    border-radius: 8px;
    margin-bottom: 2rem;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  
  .header .hint {
    font-size: 0.875rem;
    color: #666;
    margin-top: 0.5rem;
  }
  
  .lazy-item {
    margin: 1.5rem 0;
    padding: 1.5rem;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    border-left: 4px solid #ff3e00;
  }
  
  .lazy-item h3 {
    margin: 0 0 0.5rem 0;
    color: #ff3e00;
  }
  
  .lazy-item p {
    margin: 0.5rem 0;
    line-height: 1.6;
    color: #333;
  }
  
  .meta {
    font-size: 0.75rem;
    color: #999;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #eee;
  }
  
  .footer {
    text-align: center;
    padding: 2rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 8px;
    margin-top: 2rem;
    font-weight: bold;
  }
  
  /* スクロールバーのスタイリング */
  .scroll-container::-webkit-scrollbar {
    width: 8px;
  }
  
  .scroll-container::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }
  
  .scroll-container::-webkit-scrollbar-thumb {
    background: #ff3e00;
    border-radius: 4px;
  }
  
  .scroll-container::-webkit-scrollbar-thumb:hover {
    background: #e03500;
  }
</style>