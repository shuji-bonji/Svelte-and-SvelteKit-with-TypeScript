<script lang="ts">
  import { fade, scale } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  
  let showModal = $state(false);
  
  function openModal() {
    showModal = true;
  }
  
  function closeModal() {
    showModal = false;
  }
  
  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && showModal) {
      closeModal();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<button onclick={openModal}>モーダルを開く</button>

{#if showModal}
  <!-- 背景のオーバーレイ -->
  <div
    class="modal-backdrop"
    transition:fade={{ duration: 200 }}
    onclick={closeModal}
  />
  
  <!-- モーダル本体 -->
  <div
    class="modal"
    transition:scale={{
      start: 0.7,
      duration: 300,
      easing: cubicOut
    }}
    role="dialog"
    aria-modal="true"
  >
    <h2>モーダルタイトル</h2>
    <p>モーダルの内容がここに表示されます。</p>
    <div class="modal-actions">
      <button onclick={closeModal}>キャンセル</button>
      <button class="primary" onclick={closeModal}>確認</button>
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
  }
  
  .modal {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    padding: 24px;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    min-width: 400px;
  }
</style>