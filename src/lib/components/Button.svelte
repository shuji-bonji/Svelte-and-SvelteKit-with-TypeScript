<script lang="ts">
  import type { Snippet } from 'svelte';
  
  type Props = {
    variant?: 'primary' | 'secondary' | 'danger';
    size?: 'small' | 'medium' | 'large';
    disabled?: boolean;
    onClick?: () => void;
    children: Snippet;
  };
  
  let { 
    variant = 'primary', 
    size = 'medium', 
    disabled = false,
    onClick,
    children 
  }: Props = $props();
</script>

<button
  class="btn btn-{variant} btn-{size}"
  {disabled}
  onclick={onClick}
>
  {@render children()}
</button>

<style>
  .btn {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .btn-primary {
    background: #ff3e00;
    color: white;
  }
  
  .btn-primary:hover:not(:disabled) {
    background: #ff5a00;
  }
  
  .btn-secondary {
    background: #6c757d;
    color: white;
  }
  
  .btn-secondary:hover:not(:disabled) {
    background: #5a6268;
  }
  
  .btn-danger {
    background: #dc3545;
    color: white;
  }
  
  .btn-danger:hover:not(:disabled) {
    background: #c82333;
  }
  
  .btn-small {
    padding: 0.25rem 0.5rem;
    font-size: 0.875rem;
  }
  
  .btn-medium {
    padding: 0.5rem 1rem;
    font-size: 1rem;
  }
  
  .btn-large {
    padding: 0.75rem 1.5rem;
    font-size: 1.125rem;
  }
  
  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>