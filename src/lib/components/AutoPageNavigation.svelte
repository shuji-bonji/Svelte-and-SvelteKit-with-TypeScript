<script lang="ts">
  import { base } from '$app/paths';
  import { page } from '$app/stores';
  import { getNavigation } from '$lib/utils/navigation';
  import { onMount } from 'svelte';

  // パスの正規化
  let pathname = $state('');
  let navElement: HTMLElement;
  
  $effect(() => {
    const cleanPath = $page.url.pathname.replace(base, '');
    pathname = cleanPath || '/';
  });

  const navigation = $derived(getNavigation(pathname));
  const showNavigation = $derived(!!(navigation.prev || navigation.next));
  
  // コンテンツエリア内に配置し、空のpage-switcherを隠す
  onMount(() => {
    const timer = setTimeout(() => {
      // 空のpage-switcherを隠す
      const pageSwitcher = document.querySelector('.page-switcher');
      if (pageSwitcher) {
        const hasContent = Array.from(pageSwitcher.querySelectorAll('a')).length > 0;
        if (!hasContent) {
          (pageSwitcher as HTMLElement).style.display = 'none';
        }
      }
      
      // コンテンツエリアの最後に移動
      const contentArea = document.querySelector('.content');
      if (contentArea && navElement && showNavigation) {
        contentArea.appendChild(navElement);
      }
    }, 100);
    
    return () => clearTimeout(timer);
  });
</script>

{#if showNavigation}
  <nav bind:this={navElement} class="auto-page-navigation">
    <div class="nav-container">
      {#if navigation.prev}
        <a href="{base}{navigation.prev.href}" class="nav-link nav-prev">
          <span class="nav-arrow">←</span>
          <div class="nav-content">
            <div class="nav-label">前のページ</div>
            <div class="nav-title">{navigation.prev.title}</div>
          </div>
        </a>
      {:else}
        <div class="nav-spacer"></div>
      {/if}

      {#if navigation.next}
        <a href="{base}{navigation.next.href}" class="nav-link nav-next">
          <div class="nav-content">
            <div class="nav-label">次のページ</div>
            <div class="nav-title">{navigation.next.title}</div>
          </div>
          <span class="nav-arrow">→</span>
        </a>
      {:else}
        <div class="nav-spacer"></div>
      {/if}
    </div>
  </nav>
{/if}

<style>
  .auto-page-navigation {
    margin-top: 4rem;
    padding-top: 2rem;
    border-top: 1px solid #e5e5e5;
  }
  
  /* コンテンツエリア内に配置された場合の調整 */
  :global(.content) .auto-page-navigation {
    margin-left: 0;
    margin-right: 0;
    padding-left: 0;
    padding-right: 0;
  }

  :global(.dark) .auto-page-navigation {
    border-top-color: #333;
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
    border: 1px solid #e5e5e5;
    border-radius: 8px;
    text-decoration: none;
    color: inherit;
    transition: all 0.2s ease;
    flex: 1;
    max-width: 48%;
  }

  :global(.dark) .nav-link {
    border-color: #333;
  }

  .nav-link:hover {
    border-color: rgb(251, 113, 133);
    background: rgba(251, 113, 133, 0.05);
  }

  .nav-next {
    justify-content: flex-end;
    text-align: right;
  }

  .nav-arrow {
    font-size: 1.25rem;
    color: #666;
  }

  :global(.dark) .nav-arrow {
    color: #999;
  }

  .nav-content {
    flex: 1;
  }

  .nav-label {
    font-size: 0.875rem;
    color: #666;
    margin-bottom: 0.25rem;
  }

  :global(.dark) .nav-label {
    color: #999;
  }

  .nav-title {
    font-weight: 500;
    color: rgb(251, 113, 133);
  }

  .nav-spacer {
    flex: 1;
    max-width: 48%;
  }

  @media (max-width: 640px) {
    .nav-container {
      flex-direction: column;
    }

    .nav-link,
    .nav-spacer {
      max-width: 100%;
    }
  }
</style>
