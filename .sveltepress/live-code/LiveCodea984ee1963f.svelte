<script lang="ts">
  function clickOutside(node: HTMLElement, callback: () => void) {
    function handleClick(event: MouseEvent) {
      if (!node.contains(event.target as Node)) {
        callback();
      }
    }
    
    document.addEventListener('click', handleClick, true);
    
    return {
      destroy() {
        document.removeEventListener('click', handleClick, true);
      }
    };
  }
  
  let isOpen = $state(false);
  let count = $state(0);
</script>

<div class="container">
  <button onclick={() => isOpen = !isOpen}>
    メニューを開く
  </button>
  
  {#if isOpen}
    <div 
      use:clickOutside={() => {
        isOpen = false;
        count++;
      }}
      class="menu"
    >
      <h4>メニュー</h4>
      <p>外側をクリックすると閉じます</p>
      <p>閉じた回数: {count}</p>
    </div>
  {/if}
</div>

<style>
  .container {
    position: relative;
    padding: 1rem;
    background: #ccc;
    min-height: 200px;
  }
  
  .menu {

    color: #ddd;
    position: absolute;
    top: 50px;
    left: 0;
    background: #333;
    border: 1px solid ##ccc;
    padding: 1rem;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
</style>