<script lang="ts">
  import type { Snippet } from 'svelte';

  type Props = {
    title: string;
    subtitle?: string;
    image?: string;
    footer?: Snippet;
    children: Snippet;
  };

  let { title, subtitle, image, footer, children }: Props = $props();
</script>

<div class="card">
  {#if image}
    <div class="card-image">
      {#if image === 'placeholder'}
        <div class="placeholder">📷</div>
      {:else}
        <img src={image} alt={title} />
      {/if}
    </div>
  {/if}

  <div class="card-header">
    <h4>{title}</h4>
    {#if subtitle}
      <p class="card-subtitle">{subtitle}</p>
    {/if}
  </div>

  <div class="card-body">
    {@render children()}
  </div>

  {#if footer}
    <div class="card-footer">
      {@render footer()}
    </div>
  {/if}
</div>

<style>
  .card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }

  .card-image {
    height: 150px;
    background: #f0f0f0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .card-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .placeholder {
    font-size: 3rem;
  }

  .card-header {
    padding: 1rem;
    border-bottom: 1px solid #eee;
  }

  .card-header h4 {
    margin: 0;
    color: #333;
  }

  .card-subtitle {
    margin: 0.25rem 0 0;
    color: #666;
    font-size: 0.875rem;
  }

  .card-body {
    padding: 1rem;
    color: #666;
  }

  .card-footer {
    padding: 1rem;
    border-top: 1px solid #eee;
    display: flex;
    gap: 0.5rem;
  }
</style>
