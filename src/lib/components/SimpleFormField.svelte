<script lang="ts">
  type Props = {
    label: string;
    error?: string;
    helpText?: string;
    required?: boolean;
    value: string;
    type?: string;
    placeholder?: string;
  };
  
  let {
    label,
    error,
    helpText,
    required = false,
    value = $bindable(''),
    type = 'text',
    placeholder = ''
  }: Props = $props();
  
  // ユニークなIDを生成
  const inputId = `input-${Math.random().toString(36).substr(2, 9)}`;
</script>

<div class="form-field">
  <label class="form-label" for={inputId}>
    {label}
    {#if required}
      <span class="required">*</span>
    {/if}
  </label>
  
  <input
    id={inputId}
    {type}
    bind:value
    {placeholder}
    class="form-input"
    class:error={!!error}
    aria-invalid={!!error}
    aria-describedby={error ? 'error-message' : helpText ? 'help-text' : undefined}
  />
  
  {#if error}
    <span id="error-message" class="error-text">{error}</span>
  {:else if helpText}
    <span id="help-text" class="help-text">{helpText}</span>
  {/if}
</div>

<style>
  .form-field {
    margin-bottom: 1.5rem;
  }
  
  .form-label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #333;
  }
  
  .required {
    color: #dc3545;
  }
  
  .form-input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
  }
  
  .form-input:focus {
    outline: none;
    border-color: #ff3e00;
    box-shadow: 0 0 0 2px rgba(255, 62, 0, 0.1);
  }
  
  .form-input.error {
    border-color: #dc3545;
  }
  
  .error-text {
    display: block;
    color: #dc3545;
    font-size: 0.875rem;
    margin-top: 0.25rem;
  }
  
  .help-text {
    display: block;
    color: #6c757d;
    font-size: 0.875rem;
    margin-top: 0.25rem;
  }
</style>