<script lang="ts">
  let showElement = $state(true);
  let parameter = $state('初期値');
  
  function lifecycleAction(node: HTMLElement, param: string) {
    console.log(`アクション実行: ${param}`);
    node.style.backgroundColor = '#ffe4e1';
    
    return {
      update(newParam: string) {
        console.log(`アクション更新: ${newParam}`);
        node.style.backgroundColor = newParam === '変更後' ? '#e1f5fe' : '#ffe4e1';
      },
      destroy() {
        console.log('アクション破棄');
      }
    };
  }
</script>

<div class="demo">
  <button onclick={() => showElement = !showElement}>
    要素を{showElement ? '削除' : '表示'}
  </button>
  
  <button onclick={() => parameter = parameter === '初期値' ? '変更後' : '初期値'}>
    パラメータ変更: {parameter}
  </button>
  
  {#if showElement}
    <div use:lifecycleAction={parameter} class="target" >
      この要素にアクションが適用されています
    </div>
  {/if}
  
  <div class="log">
    <small>コンソールを確認してライフサイクルを観察してください</small>
  </div>
</div>

<style>

  .demo {
    padding: 1rem;
    background: #ccc;
    border-radius: 8px;
  }
  
  button {
    margin-right: 0.5rem;
    margin-bottom: 1rem;
  }
  
  .target {
    color: #333;
    padding: 1rem;
    border-radius: 4px;
    transition: background-color 0.3s;
  }
  
  .log {
    margin-top: 1rem;
    color: #666;
  }
</style>