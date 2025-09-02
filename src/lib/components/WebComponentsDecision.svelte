<script lang="ts">
  type TabType = 'use' | 'avoid';
  
  let activeTab = $state<TabType>('use');
  
  const useItems = [
    {
      title: 'マイクロフロントエンド',
      icon: '🏗️',
      description: '異なるチーム・技術スタックの統合',
      details: ['複数のフレームワークが共存', '独立したデプロイサイクル', 'チーム間の技術的独立性'],
      performance: 3,
      recommended: true
    },
    {
      title: 'サードパーティ配布',
      icon: '📦',
      description: 'ウィジェット、埋め込みコンポーネント',
      details: ['フレームワーク非依存', '単一ファイル配布', 'CDN経由での配信'],
      performance: 3,
      recommended: true
    },
    {
      title: 'CMSへの埋め込み',
      icon: '📝',
      description: 'WordPress、Drupalなど',
      details: ['既存環境への影響最小化', 'プラグインとして動作', 'CMS更新の影響を受けない'],
      performance: 2,
      recommended: true
    },
    {
      title: 'レガシーシステムとの統合',
      icon: '🔧',
      description: '既存システムへの段階的な導入',
      details: ['jQueryやBackboneからの移行', '部分的なモダナイゼーション', 'リスクの最小化'],
      performance: 2,
      recommended: true
    }
  ];
  
  const avoidItems = [
    {
      title: '単一のSvelteアプリ',
      icon: '❌',
      description: '不要なオーバーヘッド',
      details: ['Svelteの機能を活かせない', 'パフォーマンス低下', '開発体験の悪化'],
      performance: 1,
      recommended: false
    },
    {
      title: '高頻度使用コンポーネント',
      icon: '⚠️',
      description: '100個以上のインスタンス',
      details: ['5倍のレンダリング時間', '3.75倍のメモリ使用', 'ユーザー体験に深刻な影響'],
      performance: 1,
      recommended: false
    },
    {
      title: 'SSR/SSGが必要',
      icon: '🚫',
      description: 'Web ComponentsはSSR非対応',
      details: ['SEO重要なサイト', '初期表示速度が重要', 'SvelteKitの利点を失う'],
      performance: 1,
      recommended: false
    },
    {
      title: 'リアクティブなデータフロー',
      icon: '🔄',
      description: '複雑な状態管理が必要',
      details: ['Runesとの統合困難', 'ストアの共有不可', '親子間の通信が複雑'],
      performance: 1,
      recommended: false
    }
  ];
  
  function getPerformanceStars(score: number) {
    return '⭐'.repeat(score) + '☆'.repeat(5 - score);
  }
  
  function getPerformanceLabel(score: number) {
    if (score >= 4) return 'excellent';
    if (score >= 3) return 'good';
    if (score >= 2) return 'fair';
    return 'poor';
  }
</script>

<div class="decision-container">
  <div class="tabs">
    <button 
      class="tab"
      class:active={activeTab === 'use'}
      onclick={() => activeTab = 'use'}
    >
      ✅ 使うべき場合
    </button>
    <button 
      class="tab"
      class:active={activeTab === 'avoid'}
      onclick={() => activeTab = 'avoid'}
    >
      ❌ 避けるべき場合
    </button>
  </div>
  
  <div class="tab-content" class:show={activeTab === 'use'}>
    <div class="cards">
      {#each useItems as item}
        <div class="card" class:recommended={item.recommended}>
          <div class="card-header">
            <span class="icon">{item.icon}</span>
            <h3>{item.title}</h3>
          </div>
          <p class="description">{item.description}</p>
          <ul class="details">
            {#each item.details as detail}
              <li>{detail}</li>
            {/each}
          </ul>
          <div class="performance">
            <span class="label">パフォーマンス:</span>
            <span class="stars" data-performance={getPerformanceLabel(item.performance)}>
              {getPerformanceStars(item.performance)}
            </span>
          </div>
          {#if item.recommended}
            <div class="badge">推奨</div>
          {/if}
        </div>
      {/each}
    </div>
  </div>
  
  <div class="tab-content" class:show={activeTab === 'avoid'}>
    <div class="cards">
      {#each avoidItems as item}
        <div class="card avoid">
          <div class="card-header">
            <span class="icon">{item.icon}</span>
            <h3>{item.title}</h3>
          </div>
          <p class="description">{item.description}</p>
          <ul class="details">
            {#each item.details as detail}
              <li class="warning">{detail}</li>
            {/each}
          </ul>
          <div class="performance">
            <span class="label">パフォーマンス:</span>
            <span class="stars" data-performance={getPerformanceLabel(item.performance)}>
              {getPerformanceStars(item.performance)}
            </span>
          </div>
          <div class="badge danger">非推奨</div>
        </div>
      {/each}
    </div>
  </div>
  
  <div class="summary">
    <div class="summary-card">
      <h4>💡 判断の原則</h4>
      <p>
        Web Componentsは<strong>フレームワーク間の統合</strong>や<strong>独立した配布</strong>が必要な場合にのみ使用。
        単一のSvelteアプリケーションでは<strong>パフォーマンス低下（最大5倍）</strong>を招くため避けるべきです。
      </p>
    </div>
  </div>
</div>

<style>
  .decision-container {
    margin: 2rem 0;
  }
  
  .tabs {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
    border-bottom: 2px solid var(--sl-color-gray-5);
  }
  
  .tab {
    padding: 0.75rem 1.5rem;
    background: none;
    border: none;
    border-bottom: 3px solid transparent;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 600;
    color: var(--sl-color-gray-2);
    transition: all 0.2s;
    position: relative;
    top: 2px;
  }
  
  .tab:hover {
    color: var(--sl-color-accent);
  }
  
  .tab.active {
    color: var(--sl-color-accent);
    border-bottom-color: var(--sl-color-accent);
    background: var(--sl-color-bg);
  }
  
  .tab-content {
    display: none;
    animation: fadeIn 0.3s ease-in-out;
  }
  
  .tab-content.show {
    display: block;
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }
  
  .card {
    background: var(--sl-color-bg);
    border: 1px solid var(--sl-color-gray-5);
    border-radius: 8px;
    padding: 1.5rem;
    position: relative;
    transition: all 0.3s;
  }
  
  .card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  }
  
  .card.recommended {
    border-color: var(--sl-color-green);
    background: linear-gradient(135deg, 
      var(--sl-color-bg) 0%, 
      rgba(34, 197, 94, 0.05) 100%);
  }
  
  .card.avoid {
    border-color: var(--sl-color-red);
    background: linear-gradient(135deg, 
      var(--sl-color-bg) 0%, 
      rgba(239, 68, 68, 0.05) 100%);
  }
  
  .card-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }
  
  .icon {
    font-size: 1.5rem;
  }
  
  .card h3 {
    margin: 0;
    font-size: 1.1rem;
    color: var(--sl-color-text);
  }
  
  .description {
    color: var(--sl-color-gray-2);
    margin-bottom: 1rem;
    font-size: 0.95rem;
  }
  
  .details {
    list-style: none;
    padding: 0;
    margin: 0 0 1rem 0;
  }
  
  .details li {
    padding: 0.25rem 0 0.25rem 1.5rem;
    position: relative;
    font-size: 0.9rem;
    color: var(--sl-color-gray-2);
  }
  
  .details li::before {
    content: "✓";
    position: absolute;
    left: 0;
    color: var(--sl-color-green);
    font-weight: bold;
  }
  
  .details li.warning::before {
    content: "⚠";
    color: var(--sl-color-orange);
  }
  
  .performance {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--sl-color-gray-6);
  }
  
  .performance .label {
    font-size: 0.85rem;
    color: var(--sl-color-gray-3);
  }
  
  .stars {
    font-size: 1rem;
  }
  
  .stars[data-performance="excellent"] {
    color: var(--sl-color-green);
  }
  
  .stars[data-performance="good"] {
    color: var(--sl-color-blue);
  }
  
  .stars[data-performance="fair"] {
    color: var(--sl-color-orange);
  }
  
  .stars[data-performance="poor"] {
    color: var(--sl-color-red);
  }
  
  .badge {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    background: var(--sl-color-green);
    color: white;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
  }
  
  .badge.danger {
    background: var(--sl-color-red);
  }
  
  .summary {
    margin-top: 2rem;
  }
  
  .summary-card {
    background: linear-gradient(135deg, 
      var(--sl-color-bg-accent) 0%, 
      var(--sl-color-bg) 100%);
    border: 1px solid var(--sl-color-accent);
    border-radius: 8px;
    padding: 1.5rem;
  }
  
  .summary-card h4 {
    margin: 0 0 0.75rem 0;
    color: var(--sl-color-text);
  }
  
  .summary-card p {
    margin: 0;
    color: var(--sl-color-gray-2);
    line-height: 1.6;
  }
  
  .summary-card strong {
    color: var(--sl-color-accent);
  }
  
  @media (max-width: 768px) {
    .cards {
      grid-template-columns: 1fr;
    }
    
    .tabs {
      flex-direction: column;
    }
    
    .tab {
      width: 100%;
      text-align: center;
    }
  }
</style>