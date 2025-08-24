<script lang="ts">
  type Props = {
    value: string;
    label?: string;
    placeholder?: string;
    type?: 'text' | 'email' | 'password';
    error?: string;
  };

  let { 
    value = $bindable(''),
    label,
    placeholder = '',
    type = 'text',
    error
  }: Props = $props();
</script>

<div class="input-wrapper">
  {#if label}
    <label class="input-label">{label}</label>
  {/if}
  <input 
    bind:value={value}
    {type}
    {placeholder}
    class="input-field"
    class:error={!!error}
  />
  {#if error}
    <span class="error-message">{error}</span>
  {/if}
</div>

<style>
  .input-wrapper {
    margin-bottom: 1rem;
  }

  .input-label {
    display: block;
    margin-bottom: 0.25rem;
    font-weight: 500;
    color: #1e293b;
  }

  :global(.dark) .input-label {
    color: #e2e8f0;
  }

  .input-field {
    width: 100%;
    padding: 0.625rem 0.875rem;
    border: 2px solid #cbd5e1;
    border-radius: 6px;
    font-size: 1rem;
    transition: all 0.2s;
    background: white;
    color: #1e293b;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    box-sizing: border-box;
  }

  .input-field:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12), 0 1px 2px rgba(0, 0, 0, 0.05);
    transform: translateY(-1px);
  }

  .input-field.error {
    border-color: #ef4444;
  }

  .input-field.error:focus {
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
  }

  .error-message {
    display: block;
    margin-top: 0.25rem;
    color: #ef4444;
    font-size: 0.875rem;
  }
</style>