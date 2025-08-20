<script lang="ts">
  let activeTab = $state('tab1');
  let count = $state(0);
</script>

{#snippet tab1Content()}
  <div style="padding: 1rem; background: #f0f0f0; border-radius: 4px;">
    <h3>📝 タブ1: 基本情報</h3>
    <p>Snippetを使った動的なコンテンツレンダリングの例です。</p>
    <button onclick={() => count++} style="padding: 0.5rem; background: #ff3e00; color: white; border: none; border-radius: 4px;">
      カウント: {count}
    </button>
  </div>
{/snippet}

{#snippet tab2Content()}
  <div style="padding: 1rem; background: #e8f5e9; border-radius: 4px;">
    <h3>🎨 タブ2: デザイン設定</h3>
    <p>異なるSnippetを切り替えて表示できます。</p>
    <p>現在のカウント値: <strong>{count}</strong></p>
  </div>
{/snippet}

{#snippet tab3Content()}
  {@const doubled = count * 2}
  <div style="padding: 1rem; background: #fff3e0; border-radius: 4px;">
    <h3>⚙️ タブ3: 詳細設定</h3>
    <p>@constを使って計算値を定義: {count} × 2 = <strong>{doubled}</strong></p>
  </div>
{/snippet}

<div style="padding: 1rem;">
  <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem;">
    <button 
      onclick={() => activeTab = 'tab1'}
      style="padding: 0.5rem 1rem; background: {activeTab === 'tab1' ? '#ff3e00' : '#ccc'}; color: white; border: none; border-radius: 4px; cursor: pointer;"
    >
      タブ1
    </button>
    <button 
      onclick={() => activeTab = 'tab2'}
      style="padding: 0.5rem 1rem; background: {activeTab === 'tab2' ? '#ff3e00' : '#ccc'}; color: white; border: none; border-radius: 4px; cursor: pointer;"
    >
      タブ2
    </button>
    <button 
      onclick={() => activeTab = 'tab3'}
      style="padding: 0.5rem 1rem; background: {activeTab === 'tab3' ? '#ff3e00' : '#ccc'}; color: white; border: none; border-radius: 4px; cursor: pointer;"
    >
      タブ3
    </button>
  </div>
  
  {#if activeTab === 'tab1'}
    {@render tab1Content()}
  {:else if activeTab === 'tab2'}
    {@render tab2Content()}
  {:else if activeTab === 'tab3'}
    {@render tab3Content()}
  {/if}
</div>