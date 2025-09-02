<script lang="ts">
  type Strategy = {
    id: string;
    title: string;
    subtitle: string;
    benefits: string[];
    useCases: string[];
    performance: number;
    complexity: number;
    recommended?: boolean;
  };
  
  const strategies: Strategy[] = [
    {
      id: 'scoped',
      title: 'Scoped CSS',
      subtitle: 'Svelteネイティブ',
      benefits: [
        '追加設定不要',
        'コンパイル時最適化',
        '適度なカプセル化'
      ],
      useCases: [
        'ほとんどのSvelteプロジェクト',
        '中小規模アプリケーション',
        'プロトタイピング'
      ],
      performance: 5,
      complexity: 1,
      recommended: true
    },
    {
      id: 'modules',
      title: 'CSS Modules',
      subtitle: '厳格なカプセル化',
      benefits: [
        '完全なスタイル分離',
        '既存CSS資産の活用',
        'TypeScript型サポート'
      ],
      useCases: [
        '大規模チーム開発',
        '既存CSS資産が豊富',
        '厳格な命名規則管理'
      ],
      performance: 4,
      complexity: 3,
      recommended: false
    },
    {
      id: 'css-in-js',
      title: 'CSS-in-JS',
      subtitle: '動的スタイル生成',
      benefits: [
        '実行時の動的変更',
        'JS機能の活用',
        'テーマ切り替え容易'
      ],
      useCases: [
        'カスタマイズ可能テーマ',
        'アニメーション制御',
        '状態依存スタイル'
      ],
      performance: 3,
      complexity: 4,
      recommended: false
    }
  ];
  
  function getStars(score: number, max: number = 5) {
    return '★'.repeat(score) + '☆'.repeat(max - score);
  }
</script>

<div class="strategy-cards">
  {#each strategies as strategy}
    <div class="strategy-card" class:recommended={strategy.recommended}>
      {#if strategy.recommended}
        <div class="badge">推奨</div>
      {/if}
      
      <div class="card-header">
        <h3>{strategy.title}</h3>
        <span class="subtitle">{strategy.subtitle}</span>
      </div>
      
      <div class="metrics">
        <div class="metric">
          <span class="metric-label">パフォーマンス</span>
          <span class="metric-value performance">{getStars(strategy.performance)}</span>
        </div>
        <div class="metric">
          <span class="metric-label">複雑度</span>
          <span class="metric-value complexity">{getStars(strategy.complexity)}</span>
        </div>
      </div>
      
      <div class="card-section">
        <h4>🎯 利点</h4>
        <ul class="benefit-list">
          {#each strategy.benefits as benefit}
            <li>{benefit}</li>
          {/each}
        </ul>
      </div>
      
      <div class="card-section">
        <h4>📌 適用場面</h4>
        <ul class="usecase-list">
          {#each strategy.useCases as useCase}
            <li>{useCase}</li>
          {/each}
        </ul>
      </div>
    </div>
  {/each}
</div>

<style>
  .strategy-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
    margin: 2rem 0;
  }
  
  .strategy-card {
    background: var(--sl-color-bg);
    border: 2px solid var(--sl-color-gray-5);
    border-radius: 12px;
    padding: 1.5rem;
    position: relative;
    transition: all 0.3s ease;
  }
  
  .strategy-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  }
  
  .strategy-card.recommended {
    border-color: var(--sl-color-accent);
    background: linear-gradient(
      135deg,
      var(--sl-color-bg) 0%,
      rgba(255, 62, 0, 0.03) 100%
    );
  }
  
  .badge {
    position: absolute;
    top: -10px;
    right: 20px;
    background: var(--sl-color-accent);
    color: white;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
  }
  
  .card-header {
    margin-bottom: 1rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--sl-color-gray-6);
  }
  
  .card-header h3 {
    margin: 0 0 0.25rem 0;
    color: var(--sl-color-text);
    font-size: 1.25rem;
  }
  
  .subtitle {
    color: var(--sl-color-gray-3);
    font-size: 0.9rem;
  }
  
  .metrics {
    display: flex;
    gap: 1.5rem;
    margin-bottom: 1rem;
    padding: 0.75rem;
    background: var(--sl-color-gray-7);
    border-radius: 8px;
  }
  
  .metric {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .metric-label {
    font-size: 0.75rem;
    color: var(--sl-color-gray-3);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .metric-value {
    font-size: 1rem;
  }
  
  .metric-value.performance {
    color: var(--sl-color-green);
  }
  
  .metric-value.complexity {
    color: var(--sl-color-orange);
  }
  
  .card-section {
    margin-bottom: 1rem;
  }
  
  .card-section:last-child {
    margin-bottom: 0;
  }
  
  .card-section h4 {
    margin: 0 0 0.5rem 0;
    color: var(--sl-color-text);
    font-size: 0.95rem;
    font-weight: 600;
  }
  
  .benefit-list,
  .usecase-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  
  .benefit-list li,
  .usecase-list li {
    padding: 0.25rem 0 0.25rem 1.25rem;
    position: relative;
    font-size: 0.9rem;
    color: var(--sl-color-gray-2);
    line-height: 1.4;
  }
  
  .benefit-list li::before {
    content: "✓";
    position: absolute;
    left: 0;
    color: var(--sl-color-green);
    font-weight: bold;
  }
  
  .usecase-list li::before {
    content: "•";
    position: absolute;
    left: 0.5rem;
    color: var(--sl-color-accent);
  }
  
  @media (max-width: 768px) {
    .strategy-cards {
      grid-template-columns: 1fr;
    }
    
    .metrics {
      flex-direction: column;
      gap: 0.75rem;
    }
  }
</style>