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

    <nav class="nav-links" aria-label="Menu">
      <!-- 検索ボタン（左側） -->
      <div class="search-wrapper">
        <Search />
      </div>
      
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
    --at-apply: 'flex items-stretch flex-1 justify-between';
  }
  
  /* 検索ボタンのラッパー */
  .search-wrapper {
    --at-apply: 'flex items-center';
    margin-left: 1rem;
  }
  
  /* デスクトップ: サイドバーロゴの右側に配置 */
  @media (min-width: 950px) {
    .search-wrapper {
      position: absolute;
      left: 240px; /* サイドバーの幅 */
      margin-left: 1rem;
    }
  }
  
  @media (min-width: 1240px) {
    .search-wrapper {
      left: 280px; /* 大画面でのサイドバーの幅 */
    }
  }
  
  .navbar-pc {
    --at-apply: 'items-stretch flex gap-2';
    margin-left: auto;
  }
  
  /* モバイル表示 */
  @media (max-width: 949px) {
    .search-wrapper {
      position: static;
      margin-left: 0.5rem;
      margin-right: 0.5rem;
    }
    
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
    .search-wrapper {
      flex: 0 0 auto;
    }
    
    .navbar-pc :global(.nav-item:not(.nav-item--icon)) {
      --at-apply: 'flex';
    }
  }

  .navbar-pc :global(.nav-item:not(.nav-item--icon)),
  .navbar-pc :global(.nav-item--user-icon) {
    --at-apply: 'hidden sm:flex';
  }
</style>