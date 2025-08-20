<script lang="ts">
  import { scale } from 'svelte/transition';
  import { elasticOut } from 'svelte/easing';
  
  let showModal = $state(false);
</script>

{#if showModal}
  <div class="modal-backdrop" transition:fade>
    <div 
      class="modal"
      transition:scale={{
        duration: 300,
        start: 0.5,    // 開始時のスケール
        opacity: 0.5,  // 開始時の不透明度
        easing: elasticOut
      }}
    >
      <h2>モーダルウィンドウ</h2>
      <p>スケールトランジションで表示</p>
      <button onclick={() => showModal = false}>閉じる</button>
    </div>
  </div>
{/if}