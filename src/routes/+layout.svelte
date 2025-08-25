<script lang="ts">
  import { page } from '$app/stores';
  import Search from '$lib/components/Search.svelte';
  import { onMount } from 'svelte';

  const { children } = $props();

  // ページの状態を判定
  const routeId = $derived($page.route.id);
  const isHome = $derived(routeId === '/');
  const showSearch = $derived($page.url.pathname !== '/search');
  let mounted = $state(false);

  onMount(() => {
    mounted = true;
  });
</script>

<!-- カスタム検索コンポーネント -->
{#if mounted && showSearch}
  <div class="search-container" class:is-home={isHome}>
    <Search />
  </div>
{/if}

<!-- Leave this. Or you can add more content for your custom layout -->
{@render children?.()}

<style>

  /* ヘッダーのレイアウト調整 */
  :global(.header .header-inner) {
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
  }

  /* ホームページでのヘッダー調整 */
  :global(.home .header .left) {
    flex: 0 0 auto !important;
  }

  /* ナビゲーションリンクを右寄せ */
  :global(.header .nav-links) {
    margin-left: auto !important;
    flex: 0 0 auto !important;
  }

  :global(.header .navbar-pc) {
    gap: 0.75rem !important;
    display: flex !important;
    align-items: center !important;
  }

  /* 検索ボックスのスタイル調整 */
  :global(.search-teleport .search-button) {
    background: rgba(255, 255, 255, 0.9) !important;
    backdrop-filter: blur(10px) !important;
    border: 1px solid rgba(0, 0, 0, 0.1) !important;
  }

  :global(.dark .search-teleport .search-button) {
    background: rgba(30, 30, 30, 0.9) !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
  }

  /* サイドバーのパディング調整 */
  :global(.theme-default-sidebar) {
    padding-left: 1rem !important;
  }

  /* サイドバーのフォントサイズ調整（セクションタイトル以外） */
  :global(.sidebar-group .link) {
    font-size: 15px !important;
  }

  :global(.sidebar-group .link .text) {
    font-size: 15px !important;
  }

  /* セクションタイトルはそのまま */
  :global(.sidebar-group .group-title) {
    font-size: 16px !important;
    font-weight: 600 !important;
  }

  /* ホームページでのロゴ調整 */
  :global(.home .header .logo-container) {
    position: relative !important;
    z-index: 891 !important; /* 検索ボタンより上に表示 */
  }

  /* モバイルサイドバーのスタイル改善 */
  @media (max-width: 949px) {
    :global(.theme-default-sidebar) {
      box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15) !important;
      background: linear-gradient(to bottom, #f8f9fa, #ffffff) !important;
    }

    :global(.dark .theme-default-sidebar) {
      background: linear-gradient(to bottom, #1a1a1a, #0f0f0f) !important;
      box-shadow: 2px 0 8px rgba(0, 0, 0, 0.5) !important;
    }

    /* サイドバーのヘッダー部分を強調 */
    :global(.sidebar-logo) {
      background: rgba(251, 113, 133, 0.05) !important;
      border-bottom: 2px solid rgb(251, 113, 133) !important;
      padding: 1rem !important;
    }

    :global(.dark .sidebar-logo) {
      background: rgba(251, 113, 133, 0.1) !important;
    }

    /* サイドバーグループのスタイル改善 */
    :global(.sidebar-group .group-title) {
      font-size: 0.9rem !important;
      font-weight: 700 !important;
      color: rgb(251, 113, 133) !important;
      padding: 0.5rem 0 !important;
      border-bottom: 1px solid rgba(251, 113, 133, 0.2) !important;
      margin-bottom: 0.5rem !important;
    }

    /* リンクのホバー効果 */
    :global(.sidebar-group .link:hover) {
      background: rgba(251, 113, 133, 0.1) !important;
      padding-left: 1rem !important;
      border-radius: 0.25rem !important;
      transition: all 0.2s ease !important;
    }
  }

  @media (min-width: 950px) {
    :global(.theme-default-sidebar) {
      width: 240px !important;
    }
    :global(.sidebar-logo .title) {
      font-size: 14px;
    }
  }

  @media (min-width: 1240px) {
    :global(.theme-default-sidebar) {
      padding-left: 1.5rem !important;
      width: 280px !important;
    }
    :global(.sidebar-logo .title) {
      font-size: 16px;
    }
  }

  :global(.toc) {
    width: 240px !important;
  }

  :global(.toc .anchors) {
    width: 224px !important;
    max-height: calc(100vh - 120px) !important; /* ヘッダー分を引いた高さ */
    overflow-y: auto !important; /* スクロール可能にする */
    overflow-x: hidden !important;
    padding-bottom: 2rem !important; /* 下部に余白 */
  }

  /* スクロールバーのスタイリング */
  :global(.toc .anchors::-webkit-scrollbar) {
    width: 6px;
  }

  :global(.toc .anchors::-webkit-scrollbar-track) {
    background: rgba(0, 0, 0, 0.05);
    border-radius: 3px;
  }

  :global(.toc .anchors::-webkit-scrollbar-thumb) {
    background: rgba(251, 113, 133, 0.3);
    border-radius: 3px;
  }

  :global(.toc .anchors::-webkit-scrollbar-thumb:hover) {
    background: rgba(251, 113, 133, 0.5);
  }

  /* ダークモードのスクロールバー */
  :global(.dark .toc .anchors::-webkit-scrollbar-track) {
    background: rgba(255, 255, 255, 0.05);
  }

  :global(.dark .toc .anchors::-webkit-scrollbar-thumb) {
    background: rgba(251, 113, 133, 0.4);
  }

  :global(.dark .toc .anchors::-webkit-scrollbar-thumb:hover) {
    background: rgba(251, 113, 133, 0.6);
  }

  /* モバイルでハンバーガーメニューボタンをシンプルに */
  @media (max-width: 949px) {
    :global(.nav-trigger) {
      background: transparent !important;
      color: rgb(251, 113, 133) !important;
      padding: 0.5rem !important;
      border-radius: 0.25rem !important;
      transition: all 0.2s ease !important;
    }

    :global(.nav-trigger:hover) {
      background: rgba(251, 113, 133, 0.1) !important;
    }

    :global(.nav-trigger:active) {
      background: rgba(251, 113, 133, 0.2) !important;
    }

    /* ハンバーガーアイコンのスタイル */
    :global(.nav-trigger svg) {
      font-size: 1.5rem !important;
      stroke-width: 2.5 !important;
    }

    /* ダークモードでの色調整 */
    :global(.dark .nav-trigger) {
      color: rgb(251, 113, 133) !important;
    }

    /* On this page (TOC) の幅調整 */
    :global(.toc) {
      width: 240px !important;
      max-width: 85vw !important;
      box-shadow: -2px 0 8px rgba(0, 0, 0, 0.15) !important;
      background: linear-gradient(to bottom, #f8f9fa, #ffffff) !important;
      z-index: 1000 !important; /* ヘッダーより上に表示 */
      position: fixed !important;
      top: 48px !important; /* ヘッダーの高さ分下げる */
    }

    :global(.dark .toc) {
      background: linear-gradient(to bottom, #1a1a1a, #0f0f0f) !important;
      box-shadow: -2px 0 8px rgba(0, 0, 0, 0.5) !important;
    }

    /* TOCのタイトルを強調 */
    :global(.toc .title) {
      background: rgba(251, 113, 133, 0.05) !important;
      padding: 1rem !important;
      border-bottom: 2px solid rgb(251, 113, 133) !important;
      color: rgb(251, 113, 133) !important;
      font-weight: 700 !important;
    }

    :global(.dark .toc .title) {
      background: rgba(251, 113, 133, 0.1) !important;
    }

    /* TOCのアンカーエリアのパディング調整 */
    :global(.toc .anchors) {
      padding: 1rem !important;
    }

    /* TOCのリンクのホバー効果 */
    :global(.toc .item:hover) {
      background: rgba(251, 113, 133, 0.1) !important;
      padding-left: 0.5rem !important;
      border-radius: 0.25rem !important;
      transition: all 0.2s ease !important;
    }
  }

  /* モバイルでヘッダーを常に表示 */
  @media (max-width: 949px) {
    :global(.header) {
      position: fixed !important;
      top: 0 !important;
      transform: translateY(0) !important;
      transition: none !important;
      background: rgba(255, 255, 255, 0.95) !important;
      backdrop-filter: blur(10px) !important;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
      z-index: 999 !important;
    }

    :global(.dark .header) {
      background: rgba(0, 0, 0, 0.95) !important;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3) !important;
    }

    :global(.header.hidden-in-mobile) {
      transform: translateY(0) !important;
    }

    /* ヘッダー分のパディングを確保 */
    :global(main) {
      padding-top: 48px !important;
    }

    /* サブナビゲーションの固定表示 */
    :global(.sub-nav) {
      position: fixed !important;
      top: 48px !important;
      left: 0 !important;
      right: 0 !important;
      background: rgba(255, 255, 255, 0.95) !important;
      backdrop-filter: blur(10px) !important;
      border-bottom: 1px solid rgba(0, 0, 0, 0.1) !important;
      z-index: 998 !important;
    }

    :global(.dark .sub-nav) {
      background: rgba(0, 0, 0, 0.95) !important;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
    }

    /* サブナビゲーションがある場合はさらにパディングを追加 */
    :global(.theme-default--page-layout) {
      padding-top: 48px !important;
    }

    /* ホームページの場合はサブナビなし */
    :global(.home-page) {
      padding-top: 0 !important;
    }
  }

  /* ホームページのコンテンツエリア調整 */
  :global(.home-page) {
    max-width: 1200px !important;
    padding-left: 1rem;
    padding-right: 1rem;
  }

  @media (min-width: 950px) {
    :global(.home-page) {
      width: 80vw !important;
      padding-left: 2rem;
      padding-right: 2rem;
    }
  }

  /* コードブロックの横幅調整 - 負のマージンを無効化 */
  :global(.svp-code-block-wrapper) {
    margin-left: 0 !important;
    margin-right: 0 !important;
    margin-bottom: 2rem;
  }

  @media (min-width: 950px) {
    :global(.svp-code-block-wrapper) {
      margin-left: 0 !important;
      margin-right: 0 !important;
      border-radius: 0.5rem;
    }
  }

  /* ライブコードコンテナも同様に調整 */
  :global(.svp-live-code--container) {
    margin-left: 0 !important;
    margin-right: 0 !important;
  }

  @media (min-width: 950px) {
    :global(.svp-live-code--container) {
      margin-left: 0 !important;
      margin-right: 0 !important;
    }
  }

  /* コンテンツエリアの幅を調整 - サイドバーとTOCの間を最大限活用 */
  @media (min-width: 950px) and (max-width: 1239px) {
    /* サイドバーのみ表示、TOCなし */
    :global(.theme-default--page-layout .content) {
      /* max-width: none !important; */
      width: calc(
        100vw - 240px - 240px - 4rem
      ) !important; /* viewport - sidebar(240px) - margins */
      margin-left: calc(240px + 1rem) !important;
      margin-right: 2rem !important;
    }
  }

  @media (min-width: 1240px) and (max-width: 1439px) {
    /* サイドバー拡大、TOCなし */
    :global(.theme-default--page-layout .content) {
      /* max-width: none !important; */
      width: calc(
        100vw - 280px - 240px - 4rem
      ) !important; /* viewport - sidebar(280px) - margins */
      margin-left: calc(240px + 4rem) !important;
      margin-right: 3rem !important;
    }
  }

  @media (min-width: 1440px) {
    /* サイドバーとTOC両方表示 */
    :global(.theme-default--page-layout .content) {
      /* max-width: none !important; */
      width: calc(
        100vw - 280px - 240px - 5rem
      ) !important; /* viewport - sidebar - toc - margins */
      margin-left: calc(240px + 4rem) !important;
      margin-right: 4rem !important;
    }
  }

  /* 超ワイドスクリーン対応 - 読みやすさのため最大幅を設定 */
  @media (min-width: 1920px) {
    :global(.theme-default--page-layout .content) {
      max-width: 1000px !important;
      margin-left: auto !important;
      margin-right: auto !important;
    }
  }
</style>
