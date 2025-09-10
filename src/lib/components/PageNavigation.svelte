<script lang="ts">
  // import { page } from '$app/stores';

  type NavLink = { text: string; link: string } | undefined;

  let {
    prev = undefined,
    next = undefined,
  }: {
    prev?: NavLink;
    next?: NavLink;
  } = $props();
</script>

<nav class="page-navigation">
  <div class="nav-container">
    {#if prev}
      <a href={prev.link} class="nav-link prev">
        <span class="nav-arrow">←</span>
        <div>
          <div class="nav-label">前のページ</div>
          <div class="nav-title">{prev.text}</div>
        </div>
      </a>
    {:else}
      <div></div>
    {/if}

    {#if next}
      <a href={next.link} class="nav-link next">
        <div>
          <div class="nav-label">次のページ</div>
          <div class="nav-title">{next.text}</div>
        </div>
        <span class="nav-arrow">→</span>
      </a>
    {:else}
      <div></div>
    {/if}
  </div>
</nav>

<style>
  .page-navigation {
    margin-top: 4rem;
    padding-top: 2rem;
    border-top: 1px solid var(--vp-c-divider);
  }

  .nav-container {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
  }

  .nav-link {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 1.5rem;
    border: 1px solid var(--vp-c-divider);
    border-radius: 8px;
    text-decoration: none;
    color: var(--vp-c-text-1);
    transition: all 0.2s ease;
    flex: 1;
    max-width: 48%;
  }

  .nav-link:hover {
    border-color: var(--vp-c-brand);
    background-color: var(--vp-c-bg-soft);
  }

  .nav-link.prev {
    justify-content: flex-start;
  }

  .nav-link.next {
    justify-content: flex-end;
    text-align: right;
  }

  .nav-arrow {
    font-size: 1.25rem;
    color: var(--vp-c-text-2);
  }

  .nav-label {
    font-size: 0.875rem;
    color: var(--vp-c-text-2);
    margin-bottom: 0.25rem;
  }

  .nav-title {
    font-weight: 500;
    color: var(--vp-c-brand);
  }

  @media (max-width: 768px) {
    .nav-container {
      flex-direction: column;
    }

    .nav-link {
      max-width: 100%;
    }
  }
</style>
