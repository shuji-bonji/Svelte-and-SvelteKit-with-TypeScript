<script lang="ts">
  import { page } from '$app/stores';
  import themeOptions from 'virtual:sveltepress/theme-default';
  import Discord from '@sveltepress/theme-default/components/icons/Discord.svelte';
  import Github from '@sveltepress/theme-default/components/icons/Github.svelte';
  import { scrollDirection, navCollapsed } from '@sveltepress/theme-default/components/layout';
  import Logo from '@sveltepress/theme-default/components/Logo.svelte';
  import MobileSubNav from '@sveltepress/theme-default/components/MobileSubNav.svelte';
  import NavbarMobile from '@sveltepress/theme-default/components/NavbarMobile.svelte';
  import NavItem from '@sveltepress/theme-default/components/NavItem.svelte';
  import ToggleDark from '@sveltepress/theme-default/components/ToggleDark.svelte';
  import Search from './Search.svelte';

  const routeId = $derived($page.route.id);
  const isHome = $derived(routeId === '/');
  const hasError = $derived($page.error);

  // Search コンポーネントのインスタンス参照
  let searchInstance: Search;

  // ウィンドウリサイズ時にモバイルサイドバーを自動で閉じる
  $effect(() => {
    function handleResize() {
      if (typeof window !== 'undefined' && window.innerWidth >= 950) {
        // デスクトップ幅になったらモバイルサイドバーを閉じる
        $navCollapsed = true;
      }
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  });
</script>

<header class="header" class:hidden-in-mobile={$scrollDirection === 'down'}>
  <div class="header-inner">
    <div class="left">
      <NavbarMobile />
      {#if hasError || isHome}
        <div class="logo-container">
          <Logo />
        </div>
      {/if}
    </div>

    <!-- デスクトップ用検索バー -->
    <button
      class="search-bar"
      onclick={() => searchInstance?.openSearch()}
      aria-label="サイト内検索"
      title="検索 (Cmd/Ctrl + K)"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <circle cx="11" cy="11" r="8"></circle>
        <path d="m21 21-4.35-4.35"></path>
      </svg>
      <span class="search-bar-label">検索</span>
      <kbd class="search-bar-hotkey">⌘K</kbd>
    </button>

    <nav class="nav-links" aria-label="Menu">      
      <!-- ナビゲーションリンク（右側） -->
      <div class="navbar-pc">
        <!-- ホーム -->
        <NavItem to="/" title="ホーム">
          ホーム
        </NavItem>
        
        <!-- はじめに -->
        <NavItem to="/introduction" title="はじめに">
          はじめに
        </NavItem>
        
        <!-- ガイド -->
        <NavItem to="/guide" title="ガイド">
          ガイド
        </NavItem>
        
        <!-- モバイル用検索アイコン（GitHubの左） -->
        <button
          class="mobile-search-icon"
          onclick={() => searchInstance?.openSearch()}
          aria-label="サイト内検索"
          title="検索"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
        </button>
        
        <!-- GitHub -->
        {#if themeOptions.github}
          <NavItem
            to={themeOptions.github}
            external
            icon
            builtInIcon
            title="Github"
          >
            <Github />
          </NavItem>
        {/if}

        <!-- Discord（必要に応じて） -->
        {#if themeOptions.discord}
          <NavItem
            to={themeOptions.discord}
            external
            icon
            builtInIcon
            title="Discord"
          >
            <Discord />
          </NavItem>
        {/if}
        
        <!-- テーマ切り替え -->
        <ToggleDark />
      </div>
    </nav>
  </div>
  {#if !isHome}
    <MobileSubNav />
  {/if}
</header>

<!-- 検索コンポーネント（非表示、モーダルのみ使用） -->
<Search bind:this={searchInstance} />

<style>
  .header {
    --at-apply: 'transition-transform fixed top-0 left-0 right-0 sm:h-[73px] z-888 dark:bg-opacity-40';
    backdrop-filter: blur(5px);
  }
  .hidden-in-mobile {
    --at-apply: 'translate-y-[-100%] sm:translate-y-0';
  }
  .logo-container {
    --at-apply: 'hidden sm:block';
  }
  .header-inner {
    --at-apply: 'sm:w-[80vw] h-full flex items-stretch justify-between mx-auto';
  }
  .left {
    --at-apply: 'flex items-center';
  }
  
  .nav-links {
    --at-apply: 'flex items-stretch justify-end';
    margin-left: auto;
  }
  
  /* デスクトップ用検索バー */
  .search-bar {
    display: none;
    align-items: center;
    gap: 0.5rem;
    padding: 0.4rem 0.75rem;
    background: var(--sp-c-bg-soft, #f6f6f7);
    border: 1px solid var(--sp-c-divider-light, #e5e5e5);
    border-radius: 8px;
    cursor: pointer;
    color: var(--sp-c-text-2, #3c3c43);
    transition: all 0.2s;
    margin: 0 0.5rem;
    font-size: 0.875rem;
    white-space: nowrap;
  }

  .search-bar:hover {
    background: var(--sp-c-bg-mute, #ebebec);
    border-color: var(--sp-c-brand, #42b883);
  }

  .search-bar-label {
    display: none;
  }

  .search-bar-hotkey {
    display: none;
    padding: 0.1rem 0.35rem;
    background: var(--sp-c-bg, white);
    border: 1px solid var(--sp-c-divider, #e5e5e5);
    border-radius: 4px;
    font-size: 11px;
    font-family: monospace;
    color: var(--sp-c-text-3, #8e8e93);
  }

  /* デスクトップ（950px+）: 検索バーをフル表示 */
  @media (min-width: 950px) {
    .search-bar {
      display: flex;
      margin-left: 2rem;
      margin-right: auto;
    }
    .search-bar-label,
    .search-bar-hotkey {
      display: block;
    }
  }

  @media (min-width: 1240px) {
    .search-bar {
      margin-left: 3rem;
    }
  }
  
  /* モバイル/タブレット用検索アイコン（navbar-pc内） */
  .mobile-search-icon {
    display: flex !important;
    align-items: center;
    justify-content: center;
    padding: 0.5rem;
    background: transparent;
    border: none;
    cursor: pointer;
    color: var(--sp-c-text-2, #3c3c43);
    transition: color 0.2s, opacity 0.2s;
    border-radius: 8px;
    width: 36px;
    height: 36px;
    flex-shrink: 0;
  }

  .mobile-search-icon:hover {
    opacity: 0.7;
  }

  /* デスクトップでは非表示 */
  @media (min-width: 950px) {
    .mobile-search-icon {
      display: none !important;
    }
  }
  
  .navbar-pc {
    --at-apply: 'items-stretch flex gap-2';
  }

  /* 950px未満: テキストナビ非表示、アイコンのみ表示 */
  .navbar-pc :global(.nav-item:not(.nav-item--icon)),
  .navbar-pc :global(.nav-item--user-icon) {
    display: none;
  }

  @media (max-width: 949px) {
    .navbar-pc {
      gap: 0.5rem;
    }
  }

  /* デスクトップ（950px+）: テキストナビを表示 */
  @media (min-width: 950px) {
    .navbar-pc :global(.nav-item:not(.nav-item--icon)),
    .navbar-pc :global(.nav-item--user-icon) {
      display: flex;
    }
  }
  
  /* ダークモードの検索バー */
  :global(.dark) .search-bar {
    background: rgba(30, 30, 32, 0.6);
    border-color: rgba(82, 82, 89, 0.5);
    color: rgba(235, 235, 245, 0.6);
  }

  :global(.dark) .search-bar:hover {
    background: rgba(40, 40, 42, 0.8);
    border-color: var(--sp-c-brand, #42b883);
  }

  :global(.dark) .search-bar-hotkey {
    background: rgba(30, 30, 32, 0.8);
    border-color: rgba(82, 82, 89, 0.5);
    color: rgba(235, 235, 245, 0.5);
  }
  
  :global(.dark) .mobile-search-icon {
    color: rgba(235, 235, 245, 0.6);
  }
  
  :global(.dark) .mobile-search-icon:hover {
    opacity: 1;
    color: var(--sp-c-brand, #42b883);
  }
</style>