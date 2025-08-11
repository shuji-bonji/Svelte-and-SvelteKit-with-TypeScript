<script lang="ts">
  import type { Snippet } from 'svelte';
  
  type Props = {
    type?: 'info' | 'success' | 'warning' | 'error';
    title?: string;
    dismissible?: boolean;
    onDismiss?: () => void;
    children: Snippet;
  };
  
  let { 
    type = 'info',
    title,
    dismissible = false,
    onDismiss,
    children 
  }: Props = $props();
  
  let visible = $state(true);
  
  function handleDismiss() {
    visible = false;
    onDismiss?.();
  }
</script>

{#if visible}
  <div class="alert alert-{type}">
    <div class="alert-content">
      {#if title}
        <strong>{title}:</strong>
      {/if}
      {@render children()}
    </div>
    {#if dismissible}
      <button class="alert-close" onclick={handleDismiss}>
        ×
      </button>
    {/if}
  </div>
{/if}

<style>
  .alert {
    padding: 1rem;
    border-radius: 4px;
    margin-bottom: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .alert-content {
    flex: 1;
  }
  
  .alert-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.7;
  }
  
  .alert-close:hover {
    opacity: 1;
  }
  
  .alert-info {
    background: #cfe2ff;
    color: #084298;
    border: 1px solid #b6d4fe;
  }
  
  .alert-success {
    background: #d1e7dd;
    color: #0f5132;
    border: 1px solid #badbcc;
  }
  
  .alert-warning {
    background: #fff3cd;
    color: #856404;
    border: 1px solid #ffecb5;
  }
  
  .alert-error {
    background: #f8d7da;
    color: #842029;
    border: 1px solid #f5c2c7;
  }
</style>