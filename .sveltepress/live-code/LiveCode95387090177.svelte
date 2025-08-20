<script lang="ts">
  let htmlInput = $state('<h3>見出し</h3><p style="color: blue;">青いテキスト</p>');
  let renderAsHtml = $state(false);
  
  // 危険な例
  let dangerousExample = '<img src=x onerror="alert(\'XSS攻撃！\')">';
</script>

<div style="padding: 1rem; border: 1px solid #ddd; border-radius: 8px;">
  <h4 style="margin-top: 0; color: #ff3e00;">@html デモ - セキュリティを理解する</h4>
  
  <div style="margin-bottom: 1rem;">
    <label style="display: block; margin-bottom: 0.5rem; font-weight: bold;">HTML入力:</label>
    <textarea
      bind:value={htmlInput}
      style="width: 100%; height: 100px; padding: 0.5rem; font-family: monospace; font-size: 0.9rem; border: 1px solid #ccc; border-radius: 4px; background: #f9f9f9;"
      placeholder="HTMLコードを入力..."
    />
  </div>
  
  <div style="margin-bottom: 1rem;">
    <button
      onclick={() => htmlInput = dangerousExample}
      style="padding: 0.5rem 1rem; background: #ff6b6b; color: white; border: none; border-radius: 4px; cursor: pointer; margin-right: 0.5rem;"
    >
      ⚠️ 危険な例を試す
    </button>
    <button
      onclick={() => htmlInput = '<h3>安全な見出し</h3><p>通常のテキスト</p>'}
      style="padding: 0.5rem 1rem; background: #4ecdc4; color: white; border: none; border-radius: 4px; cursor: pointer;"
    >
      ✅ 安全な例に戻す
    </button>
  </div>
  
  <label style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem; font-weight: bold;">
    <input type="checkbox" bind:checked={renderAsHtml} />
    <span style="color: {renderAsHtml ? '#ff6b6b' : '#666'};">
      {'@html'}を使用 {renderAsHtml ? '（危険！）' : '（オフ）'}
    </span>
  </label>
  
  <div style="padding: 1rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 4px;">
    <div style="padding: 1rem; background: white; border-radius: 4px; min-height: 60px;">
      <strong style="display: block; margin-bottom: 0.5rem;">出力結果:</strong>
      {#if renderAsHtml}
        {@html htmlInput}
      {:else}
        <pre style="margin: 0; white-space: pre-wrap; font-family: monospace; color: #666;">{htmlInput}</pre>
      {/if}
    </div>
  </div>
  
  {#if renderAsHtml}
    <div style="margin-top: 1rem; padding: 1rem; background: #ffebee; border-left: 4px solid #f44336; border-radius: 4px;">
      <strong style="color: #c62828;">⚠️ セキュリティ警告</strong>
      <p style="margin: 0.5rem 0 0; color: #c62828;">
        本番環境では、ユーザー入力を直接@htmlで表示しないでください。
        必ずDOMPurifyなどのサニタイズライブラリを使用してください。
      </p>
    </div>
  {:else}
    <div style="margin-top: 1rem; padding: 1rem; background: #e8f5e9; border-left: 4px solid #4caf50; border-radius: 4px;">
      <strong style="color: #2e7d32;">✅ 安全モード</strong>
      <p style="margin: 0.5rem 0 0; color: #2e7d32;">
        HTMLはエスケープされて表示されています。これが最も安全な方法です。
      </p>
    </div>
  {/if}
</div>