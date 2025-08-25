<script lang="ts">
  import { page } from '$app/stores';
  import themeOptions from 'virtual:sveltepress/theme-default';
  import Discord from '@sveltepress/theme-default/components/icons/Discord.svelte';
  import Github from '@sveltepress/theme-default/components/icons/Github.svelte';
  import { scrollDirection } from '@sveltepress/theme-default/components/layout';
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

    <!-- 検索アイコンボタン（中央） -->
    <button
      class="search-icon-button"
      onclick={() => searchInstance?.openSearch()}
      aria-label="サイト内検索"
      title="検索 (Cmd/Ctrl + K)"
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
<Search bind:this={searchInstance} showButton={false} />

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
  
  /* デスクトップ用検索アイコンボタン（header-inner内） */
  .search-icon-button {
    --at-apply: 'flex items-center justify-center';
    padding: 0.5rem;
    background: transparent;
    border: none;
    cursor: pointer;
    color: var(--sp-c-text-2, #3c3c43);
    transition: color 0.2s, background 0.2s;
    border-radius: 8px;
    margin: 0 0.5rem;
    /* デスクトップのみ表示 */
    display: none;
  }
  
  .search-icon-button:hover {
    background: var(--sp-c-bg-soft, #f6f6f7);
    color: var(--sp-c-brand, #42b883);
  }
  
  /* デスクトップでは表示して左側に配置 */
  @media (min-width: 950px) {
    .search-icon-button {
      display: flex;
      margin-left: 2rem;
      margin-right: auto;
    }
  }
  
  @media (min-width: 1240px) {
    .search-icon-button {
      margin-left: 3rem;
    }
  }
  
  /* モバイル/タブレット用検索アイコン（navbar-pc内） */
  .mobile-search-icon {
    --at-apply: 'flex items-center justify-center';
    padding: 0.5rem;
    background: transparent;
    border: none;
    cursor: pointer;
    color: var(--sp-c-text-2, #3c3c43);
    transition: color 0.2s, opacity 0.2s;
    border-radius: 8px;
    /* モバイル/タブレットのみ表示 */
    display: flex;
  }
  
  .mobile-search-icon:hover {
    opacity: 0.7;
  }
  
  /* デスクトップでは非表示 */
  @media (min-width: 950px) {
    .mobile-search-icon {
      display: none;
    }
  }
  
  .navbar-pc {
    --at-apply: 'items-stretch flex gap-2';
  }
  
  /* モバイル表示 */
  @media (max-width: 639px) {
    .navbar-pc :global(.nav-item:not(.nav-item--icon)),
    .navbar-pc :global(.nav-item--user-icon) {
      --at-apply: 'hidden';
    }
    
    /* モバイルではアイコンのみ表示 */
    .navbar-pc {
      gap: 0.5rem;
    }
  }
  
  /* タブレット表示 */
  @media (min-width: 640px) and (max-width: 949px) {
    .navbar-pc :global(.nav-item:not(.nav-item--icon)) {
      --at-apply: 'flex';
    }
  }

  .navbar-pc :global(.nav-item:not(.nav-item--icon)),
  .navbar-pc :global(.nav-item--user-icon) {
    --at-apply: 'hidden sm:flex';
  }
  
  /* ダークモードの検索アイコン */
  :global(.dark) .search-icon-button {
    color: rgba(235, 235, 245, 0.6);
  }
  
  :global(.dark) .search-icon-button:hover {
    background: rgba(30, 30, 32, 0.8);
    color: var(--sp-c-brand, #42b883);
  }
  
  :global(.dark) .mobile-search-icon {
    color: rgba(235, 235, 245, 0.6);
  }
  
  :global(.dark) .mobile-search-icon:hover {
    opacity: 1;
    color: var(--sp-c-brand, #42b883);
  }
</style>