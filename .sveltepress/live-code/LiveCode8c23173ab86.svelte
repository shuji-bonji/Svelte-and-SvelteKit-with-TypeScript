<script lang="ts">
  import { fade, fly, slide } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  
  let showMessage = $state(false);
  let showPanel = $state(false);
</script>

<div style="display: flex; gap: 1rem; margin-bottom: 1rem;">
  <button onclick={() => showMessage = !showMessage}>
    通知を{showMessage ? '非表示' : '表示'}
  </button>
  <button onclick={() => showPanel = !showPanel}>
    パネルを{showPanel ? '非表示' : '表示'}
  </button>
</div>

<div style="position: relative; min-height: 200px;">
  {#if showMessage}
    <!-- 入場時は上から、退場時はフェード -->
    <div 
      in:fly={{ y: -50, duration: 300, easing: quintOut }}
      out:fade={{ duration: 200 }}
      class="notification"
    >
      <span>📢 通知メッセージ</span>
      <button onclick={() => showMessage = false}>×</button>
    </div>
  {/if}
  
  {#if showPanel}
    <!-- 入場時は右から、退場時は左へ -->
    <div
      in:fly={{ x: 100, duration: 400, easing: quintOut }}
      out:fly={{ x: -100, duration: 400 }}
      class="panel"
    >
      <h3>スライドパネル</h3>
      <p>右から入って、左へ出ていきます</p>
      <button onclick={() => showPanel = false}>閉じる</button>
    </div>
  {/if}
</div>

<style>
  .notification {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background: linear-gradient(135deg, #ffd89b 0%, #19547b 100%);
    color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  .notification button {
    background: none;
    border: none;
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .panel {
    position: absolute;
    top: 60px;
    left: 0;
    right: 0;
    padding: 1.5rem;
    background: white;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  }
  
  .panel h3 {
    margin: 0 0 0.5rem;
    color: #2d3748;
  }
  
  .panel p {
    margin: 0 0 1rem;
    color: #4a5568;
  }
  
  .panel button {
    background: #667eea;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    cursor: pointer;
  }
  
  .panel button:hover {
    background: #5a67d8;
  }
</style>