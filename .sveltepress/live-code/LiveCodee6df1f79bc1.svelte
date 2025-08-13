<script lang="ts">
  interface Quote {
    content: string;
    author: string;
  }
  
  let quote = $state<Quote | null>(null);
  let quoteElement = $state<HTMLElement | null>(null);
  let isLoading = $state(false);
  let previousHeight = $state(0);
  let isAnimating = $state(false);
  
  // DOM更新前に現在の高さを記録
  $effect.pre(() => {
    if (quoteElement && quote) {
      previousHeight = quoteElement.offsetHeight;
    }
  });
  
  // DOM更新後にアニメーション効果を適用
  $effect(() => {
    if (quoteElement && quote && previousHeight > 0) {
      const newHeight = quoteElement.offsetHeight;
      
      if (Math.abs(newHeight - previousHeight) > 10) {
        // 高さの変化を検出したらアニメーション
        isAnimating = true;
        
        // CSSトランジションの終了を待つ
        setTimeout(() => {
          isAnimating = false;
        }, 300);
      }
    }
  });
  
  async function fetchQuote() {
    isLoading = true;
    try {
      // JSONPlaceholder APIを使用（常に利用可能なモックAPI）
      const userId = Math.floor(Math.random() * 10) + 1;
      const response = await fetch(`https://jsonplaceholder.typicode.com/users/${userId}`);
      if (response.ok) {
        const data = await response.json();
        // ユーザー情報を名言風に変換
        quote = {
          content: `${data.company.catchPhrase} - ${data.company.bs}`,
          author: data.name
        };
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      // フォールバック：ローカルの名言データ
      const localQuotes = [
        { content: 'シンプルさは究極の洗練である', author: 'レオナルド・ダ・ヴィンチ' },
        { content: '完璧を目指すよりまず終わらせろ', author: 'マーク・ザッカーバーグ' },
        { content: 'プログラミングは考えることについて考えることだ', author: 'Leslie Lamport' }
      ];
      quote = localQuotes[Math.floor(Math.random() * localQuotes.length)];
    } finally {
      isLoading = false;
    }
  }
  
  // 初回ロード
  $effect(() => {
    fetchQuote();
  });
</script>

<div class="quote-container">
  <div 
    bind:this={quoteElement}
    class="quote-box"
    class:animating={isAnimating}
  >
    {#if isLoading}
      <p class="loading">読み込み中...</p>
    {:else if quote}
      <blockquote>
        <p>"{quote.content}"</p>
        <footer>— {quote.author}</footer>
      </blockquote>
    {/if}
  </div>
  
  <button onclick={fetchQuote} disabled={isLoading}>
    新しい名言を取得
  </button>
  
  {#if previousHeight > 0}
    <div class="debug">
      <small>前の高さ: {previousHeight}px</small>
      {#if quoteElement}
        <small>現在の高さ: {quoteElement.offsetHeight}px</small>
      {/if}
    </div>
  {/if}
</div>

<style>
  .quote-container {
    max-width: 500px;
    margin: 0 auto;
  }
  
  .quote-box {
    padding: 1.5rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 10px;
    color: white;
    min-height: 100px;
    transition: all 0.3s ease;
  }
  
  .quote-box.animating {
    transform: scale(1.02);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  }
  
  blockquote {
    margin: 0;
  }
  
  blockquote p {
    font-size: 1.1rem;
    line-height: 1.6;
    margin: 0 0 1rem 0;
  }
  
  blockquote footer {
    font-size: 0.9rem;
    opacity: 0.9;
    text-align: right;
  }
  
  .loading {
    text-align: center;
    opacity: 0.7;
  }
  
  button {
    margin-top: 1rem;
    width: 100%;
    padding: 0.75rem;
    background: #4c51bf;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1rem;
    transition: background 0.2s;
  }
  
  button:hover:not(:disabled) {
    background: #434190;
  }
  
  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .debug {
    margin-top: 1rem;
    display: flex;
    justify-content: space-between;
    color: #666;
    font-size: 0.85rem;
  }
</style>