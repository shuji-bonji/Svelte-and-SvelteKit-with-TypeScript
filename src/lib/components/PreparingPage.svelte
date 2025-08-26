<script lang="ts">
  type Props = {
    title: string;
    description?: string;
    expectedDate?: string;
  };

  let { 
    title, 
    description = 'このページは現在準備中です。', 
    expectedDate 
  }: Props = $props();
</script>

<div class="preparing-page">
  <div class="icon">🚧</div>
  <h1>{title}</h1>
  <p class="description">{description}</p>
  {#if expectedDate}
    <p class="expected">公開予定: {expectedDate}</p>
  {/if}
  <div class="actions">
    <a href="/Svelte-and-SvelteKit-with-TypeScript/" class="button">ホームへ戻る</a>
    <a href="/Svelte-and-SvelteKit-with-TypeScript/sveltekit/" class="button secondary">SvelteKit概要へ</a>
  </div>
</div>

<style>
  .preparing-page {
    text-align: center;
    padding: 4rem 2rem;
    max-width: 600px;
    margin: 0 auto;
  }

  .icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }

  h1 {
    color: #ff3e00;
    margin-bottom: 1rem;
  }

  .description {
    font-size: 1.2rem;
    color: #666;
    margin-bottom: 1rem;
  }

  .expected {
    font-size: 1rem;
    color: #999;
    margin-bottom: 2rem;
  }

  .actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
  }

  .button {
    display: inline-block;
    padding: 0.75rem 1.5rem;
    background: #ff3e00;
    color: white;
    text-decoration: none;
    border-radius: 4px;
    transition: background 0.3s;
  }

  .button:hover {
    background: #ff5722;
  }

  .button.secondary {
    background: #666;
  }

  .button.secondary:hover {
    background: #888;
  }
</style>