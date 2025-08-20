<script lang="ts">
  import { fade, slide, scale, fly } from 'svelte/transition';
  
  let visible = $state(true);
</script>

<button onclick={() => visible = !visible}>
  切り替え
</button>

<div style="margin-top: 1rem; display: flex; flex-direction: column; gap: 1rem;">
  {#if visible}
    <!-- フェードイン・フェードアウト -->
    <div transition:fade class="demo-box">
      フェードトランジション
    </div>
    
    <!-- スライドトランジション -->
    <div transition:slide class="demo-box">
      スライドトランジション
    </div>
    
    <!-- スケールトランジション -->
    <div transition:scale class="demo-box">
      スケールトランジション
    </div>
    
    <!-- フライトランジション -->
    <div transition:fly={{ x: 200, y: 0 }} class="demo-box">
      フライトランジション（横から）
    </div>
  {/if}
</div>

<style>
  .demo-box {
    padding: 1rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 8px;
    text-align: center;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
</style>