<script lang="ts">
  type Props = {
    checked: $bindable<boolean>;
    label?: string;
    disabled?: boolean;
  };

  let { 
    checked = $bindable(false),
    label,
    disabled = false
  }: Props = $props();
</script>

<label class="checkbox-wrapper" class:disabled>
  <input 
    type="checkbox"
    bind:checked={checked}
    {disabled}
    class="checkbox-input"
  />
  <span class="checkbox-mark"></span>
  {#if label}
    <span class="checkbox-label">{label}</span>
  {/if}
</label>

<style>
  .checkbox-wrapper {
    display: inline-flex;
    align-items: center;
    cursor: pointer;
    user-select: none;
    position: relative;
    padding: 0.5rem 0.5rem 0.5rem 32px;
    min-height: 32px;
    background: white;
    border-radius: 6px;
    border: 1px solid transparent;
    transition: all 0.2s;
  }
  
  .checkbox-wrapper:hover:not(.disabled) {
    background: #f8fafc;
    border-color: #e2e8f0;
  }

  .checkbox-wrapper.disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  .checkbox-input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
  }

  .checkbox-mark {
    position: absolute;
    left: 8px;
    top: 50%;
    transform: translateY(-50%);
    height: 20px;
    width: 20px;
    background-color: white;
    border: 2px solid #94a3b8;
    border-radius: 4px;
    transition: all 0.2s;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }

  .checkbox-wrapper:hover:not(.disabled) .checkbox-mark {
    border-color: #22c55e;
    box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
  }

  .checkbox-input:checked ~ .checkbox-mark {
    background-color: #22c55e;
    border-color: #22c55e;
  }

  .checkbox-mark:after {
    content: "";
    position: absolute;
    display: none;
    left: 6px;
    top: 2px;
    width: 5px;
    height: 10px;
    border: solid white;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
  }

  .checkbox-input:checked ~ .checkbox-mark:after {
    display: block;
  }

  .checkbox-label {
    margin-left: 8px;
    color: #1e293b;
    font-weight: 500;
  }

  .checkbox-wrapper.disabled .checkbox-label {
    color: var(--sp-color-text-3);
  }
</style>