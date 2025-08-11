<script lang="ts">
  function tooltip(node: HTMLElement, text: string) {
    let tooltipElement: HTMLDivElement;
    
    function showTooltip() {
      tooltipElement = document.createElement('div');
      tooltipElement.textContent = text;
      tooltipElement.className = 'tooltip';
      
      const rect = node.getBoundingClientRect();
      tooltipElement.style.position = 'fixed';
      tooltipElement.style.top = `${rect.top - 30}px`;
      tooltipElement.style.left = `${rect.left + rect.width / 2}px`;
      tooltipElement.style.transform = 'translateX(-50%)';
      
      document.body.appendChild(tooltipElement);
    }
    
    function hideTooltip() {
      if (tooltipElement) {
        tooltipElement.remove();
      }
    }
    
    node.addEventListener('mouseenter', showTooltip);
    node.addEventListener('mouseleave', hideTooltip);
    
    return {
      update(newText: string) {
        text = newText;
        if (tooltipElement) {
          tooltipElement.textContent = text;
        }
      },
      destroy() {
        hideTooltip();
        node.removeEventListener('mouseenter', showTooltip);
        node.removeEventListener('mouseleave', hideTooltip);
      }
    };
  }
  
  let tooltipText = $state('これはツールチップです');
</script>

<div class="demo">
  <input 
    bind:value={tooltipText}
    placeholder="ツールチップテキストを編集"
  />
  
  <div class="buttons">
    <button use:tooltip={tooltipText}>
      ホバーしてください
    </button>
    
    <button use:tooltip={'別のツールチップ'}>
      こちらも試してください
    </button>
  </div>
</div>

<style>
  .demo {
    padding: 2rem;
    background: #f5f5f5;
  }
  
  .buttons {
    margin-top: 2rem;
    display: flex;
    gap: 1rem;
  }
  
  :global(.tooltip) {
    background: #333;
    color: white;
    padding: 0.5rem;
    border-radius: 4px;
    font-size: 0.875rem;
    z-index: 1000;
    pointer-events: none;
  }
</style>