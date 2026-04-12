<script lang="ts">
  import { page } from '$app/stores';
  import { base } from '$app/paths';
  import AutoPageNavigation from '$lib/components/AutoPageNavigation.svelte';
  import Search from '$lib/components/Search.svelte';
  import '../styles/theme.css';

  const { children } = $props();

  // Search コンポーネント参照
  let searchInstance: Search;

  // 検索トリガーボタンの参照
  let searchTriggerEl: HTMLButtonElement;

  // 検索アイコンを常にヘッダーの navbar-pc 内（GitHubアイコンの前）に挿入
  $effect(() => {
    if (!searchTriggerEl) return;

    const navbarPc = document.querySelector('nav[aria-label="Menu"] .navbar-pc');
    if (!navbarPc) return;

    // GitHub アイコン（.nav-item--icon）の前に挿入
    const githubIcon = navbarPc.querySelector('.nav-item--icon');
    if (githubIcon) {
      navbarPc.insertBefore(searchTriggerEl, githubIcon);
    } else {
      navbarPc.appendChild(searchTriggerEl);
    }
  });

  // 現在のURLから正規URLを生成（末尾スラッシュを統一）
  const canonicalUrl = $derived(() => {
    const pathname = $page.url.pathname;
    // 末尾スラッシュを統一（ホームページ以外は末尾スラッシュを追加）
    const normalizedPath = pathname === base || pathname === `${base}/` 
      ? base || '/'
      : pathname.endsWith('/') ? pathname : `${pathname}/`;
    return `https://shuji-bonji.github.io${normalizedPath}`;
  });

  $effect(() => {
    // サイドバーのアクティブ状態を修正（7.xの仕様変更対応）
    // 7.xでは子パスもアクティブになるため、完全一致のみをハイライトするよう修正
    function fixActiveLinks() {
      setTimeout(() => {
        const sidebar = document.querySelector('.theme-default-sidebar');
        if (!sidebar) return;

        // 現在のパスを取得（末尾スラッシュを正規化）
        const currentPath = $page.url.pathname;
        const normalizedPath = currentPath.endsWith('/') ? currentPath : `${currentPath}/`;

        // まず、すべてのリンクから exact-match クラスを削除
        const allLinks = sidebar.querySelectorAll('.link');
        allLinks.forEach((link) => {
          link.classList.remove('exact-match');
        });

        // すべてのアクティブリンクを取得
        const activeLinks = sidebar.querySelectorAll('.link.active');

        activeLinks.forEach((link) => {
          const href = link.getAttribute('href');
          if (!href) return;

          // 完全一致かどうかをチェック
          const normalizedHref = href.endsWith('/') ? href : `${href}/`;
          const isExactMatch = normalizedPath === normalizedHref;

          if (isExactMatch) {
            // 完全一致の場合のみ強調クラスを追加
            link.classList.add('exact-match');
          }
          // activeクラスは削除しない（SveltePressの挙動を壊さないため）
        });
      }, 50);
    }

    // サイドバーの自動スクロール機能
    function scrollToActiveSection() {
      setTimeout(() => {
        // SveltePressのサイドバー要素を探す
        const sidebar = document.querySelector('.theme-default-sidebar');
        if (!sidebar) return;

        // 完全一致のリンクを優先、なければアクティブなリンクを探す
        const currentLink = sidebar.querySelector('.link.exact-match') ||
                           sidebar.querySelector('.link.active');
        if (!currentLink) return;

        // アクティブなリンクの位置を取得
        const sidebarRect = sidebar.getBoundingClientRect();
        const linkRect = currentLink.getBoundingClientRect();

        // サイドバーの表示領域内にあるかチェック
        const isInView = linkRect.top >= sidebarRect.top &&
                        linkRect.bottom <= sidebarRect.bottom;

        if (!isInView) {
          // リンクが見える位置までスクロール（中央寄せ）
          const scrollTop = linkRect.top - sidebarRect.top - sidebarRect.height / 2 + linkRect.height / 2;

          sidebar.scrollTo({
            top: sidebar.scrollTop + scrollTop,
            behavior: 'smooth'
          });
        }
      }, 200); // DOMの更新を待つ
    }

    // 初回実行
    fixActiveLinks();
    scrollToActiveSection();

    // ページ遷移時にも実行
    const unsubscribe = page.subscribe(() => {
      fixActiveLinks();
      scrollToActiveSection();
    });

    return () => {
      unsubscribe();
    };
  });
</script>

<svelte:head>
  <!-- Canonical URL の設定 -->
  <link rel="canonical" href={canonicalUrl()} />
  
  <!-- ページごとのメタタグ（OGP） -->
  <meta property="og:url" content={canonicalUrl()} />
</svelte:head>

<!-- 検索トリガー（$effectでnavbar-pc内に動的挿入される） -->
<button
  bind:this={searchTriggerEl}
  class="search-trigger"
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

<!-- 検索モーダル（非表示、トリガーで開く） -->
<Search bind:this={searchInstance} />

<!-- Leave this. Or you can add more content for your custom layout -->
<div class="layout-wrapper">
  {@render children?.()}
  <!-- 自動ページナビゲーション -->
  <AutoPageNavigation />
</div>

<style>
  /* ===== 検索トリガーボタン（navbar-pc内にDOM挿入される） ===== */
  .search-trigger {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.4rem;
    background: transparent;
    border: none;
    border-radius: 6px;
    color: var(--sp-c-text-2, #3c3c43);
    cursor: pointer;
    transition: color 0.2s, background 0.2s;
  }

  .search-trigger:hover {
    color: var(--sp-c-text-1, #213547);
    background: var(--sp-c-bg-soft, rgba(0, 0, 0, 0.05));
  }

  /* ダークモード */
  :global(.dark) .search-trigger {
    color: rgba(235, 235, 245, 0.6);
  }

  :global(.dark) .search-trigger:hover {
    color: rgba(235, 235, 245, 0.86);
    background: rgba(255, 255, 255, 0.08);
  }

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

  /* デスクトップ（950px+）: モバイルUIを強制非表示 */
  @media (min-width: 950px) {
    :global(.navbar-mobile) {
      display: none !important;
    }
    :global(.nav-trigger) {
      display: none !important;
    }
  }

  /* ハンバーガーメニュー: 下部の @media (max-width: 949px) .nav-trigger で display: flex を設定 */

  /* サイドバーのパディング調整 */
  :global(.theme-default-sidebar) {
    padding-left: 1rem !important;
    /* スクロール領域の改善 */
    overflow-y: auto !important;
    scroll-behavior: smooth !important;
    max-height: calc(100vh - 64px) !important; /* ヘッダーの高さを引く */
  }
  
  /* サイドバーのアクティブアイコン（👈）を非表示 */
  :global(.theme-default-sidebar .active-icon) {
    display: none !important;
  }

  /* サイドバーのリンク文字色をリセット（親の色を継承しない） */
  :global(.theme-default-sidebar .link) {
    color: var(--sp-color-text, inherit) !important;
  }

  :global(.theme-default-sidebar .link .text) {
    color: inherit !important;
  }

  /* activeクラスがあっても子要素の色は変えない */
  :global(.theme-default-sidebar .sidebar-group.active .link),
  :global(.theme-default-sidebar .link.active) {
    color: var(--sp-color-text, inherit) !important;
  }

  /* 完全一致のリンクのみ左ボーダーで強調 */
  :global(.theme-default-sidebar .link.exact-match) {
    font-weight: 600 !important;
    position: relative !important;
    color: var(--color-sidebar-active-text) !important;
  }

  :global(.theme-default-sidebar .link.exact-match .text) {
    color: inherit !important;
  }

  :global(.theme-default-sidebar .link.exact-match::before) {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background-color: var(--color-sidebar-active-border);
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

  /* モバイルサイドバーのスタイル改善 */
  @media (max-width: 949px) {
    :global(.theme-default-sidebar) {
      box-shadow: var(--shadow-md) !important;
      background: var(--color-sidebar-bg) !important;
    }

    :global(.dark .theme-default-sidebar) {
      background: var(--color-sidebar-bg) !important;
      box-shadow: var(--shadow-lg) !important;
    }

    /* サイドバーのヘッダー部分（シンプルに） */
    :global(.sidebar-logo) {
      border-bottom: 1px solid var(--color-border) !important;
      padding: 1rem !important;
    }

    :global(.dark .sidebar-logo) {
      border-bottom: 1px solid var(--color-border) !important;
    }

    /* サイドバーグループのスタイル改善 */
    :global(.sidebar-group .group-title) {
      font-size: 0.9rem !important;
      font-weight: 700 !important;
      color: var(--color-sidebar-text) !important;
      padding: 0.5rem 0 !important;
      border-bottom: 1px solid var(--color-border-soft) !important;
      margin-bottom: 0.5rem !important;
    }

    :global(.dark .sidebar-group .group-title) {
      color: var(--color-sidebar-text) !important;
      border-bottom: 1px solid var(--color-border-soft) !important;
    }

    /* リンクのホバー効果（控えめに） */
    :global(.sidebar-group .link:hover) {
      background: var(--color-sidebar-hover-bg) !important;
      padding-left: 1rem !important;
      border-radius: 0.25rem !important;
      transition: all var(--transition-base) !important;
    }

    :global(.dark .sidebar-group .link:hover) {
      background: var(--color-sidebar-hover-bg) !important;
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

  /* スクロールバーのスタイリング（ニュートラルカラー） */
  :global(.toc .anchors::-webkit-scrollbar) {
    width: 6px;
  }

  :global(.toc .anchors::-webkit-scrollbar-track) {
    background: rgba(0, 0, 0, 0.03);
    border-radius: 3px;
  }

  :global(.toc .anchors::-webkit-scrollbar-thumb) {
    background: rgba(0, 0, 0, 0.15);
    border-radius: 3px;
  }

  :global(.toc .anchors::-webkit-scrollbar-thumb:hover) {
    background: rgba(0, 0, 0, 0.25);
  }

  /* ダークモードのスクロールバー */
  :global(.dark .toc .anchors::-webkit-scrollbar-track) {
    background: rgba(255, 255, 255, 0.03);
  }

  :global(.dark .toc .anchors::-webkit-scrollbar-thumb) {
    background: rgba(255, 255, 255, 0.15);
  }

  :global(.dark .toc .anchors::-webkit-scrollbar-thumb:hover) {
    background: rgba(255, 255, 255, 0.25);
  }

  /* 950px未満: ハンバーガーメニューを表示（SveltePressの sm:hidden を上書き） */
  @media (max-width: 949px) {
    :global(.nav-trigger) {
      display: flex !important;
      background: transparent !important;
      color: var(--color-nav-text) !important;
      padding: 0.5rem !important;
      border-radius: 0.25rem !important;
      transition: all var(--transition-base) !important;
    }

    :global(.nav-trigger:hover) {
      background: var(--color-sidebar-hover-bg) !important;
    }

    :global(.nav-trigger:active) {
      background: var(--color-primary-bg) !important;
    }

    /* ハンバーガーアイコンのスタイル */
    :global(.nav-trigger svg) {
      font-size: 1.5rem !important;
      stroke-width: 2.5 !important;
    }

    /* ダークモードでの色調整 */
    :global(.dark .nav-trigger) {
      color: var(--color-nav-text) !important;
    }

    :global(.dark .nav-trigger:hover) {
      background: var(--color-sidebar-hover-bg) !important;
    }

    :global(.dark .nav-trigger:active) {
      background: var(--color-primary-bg) !important;
    }

    /* On this page (TOC) の幅調整 */
    :global(.toc) {
      width: 240px !important;
      max-width: 85vw !important;
      box-shadow: var(--shadow-md) !important;
      background: var(--color-bg) !important;
      z-index: 1000 !important; /* ヘッダーより上に表示 */
      position: fixed !important;
      top: 48px !important; /* ヘッダーの高さ分下げる */
    }

    :global(.dark .toc) {
      background: var(--color-bg) !important;
      box-shadow: var(--shadow-lg) !important;
    }

    /* TOCのタイトル（シンプルに） */
    :global(.toc .title) {
      padding: 1rem !important;
      border-bottom: 1px solid var(--color-border) !important;
      color: var(--color-text) !important;
      font-weight: 600 !important;
    }

    :global(.dark .toc .title) {
      border-bottom: 1px solid var(--color-border) !important;
      color: var(--color-text) !important;
    }

    /* TOCのアンカーエリアのパディング調整 */
    :global(.toc .anchors) {
      padding: 1rem !important;
    }

    /* TOCのリンクのホバー効果（控えめに） */
    :global(.toc .item:hover) {
      background: var(--color-sidebar-hover-bg) !important;
      padding-left: 0.5rem !important;
      border-radius: 0.25rem !important;
      transition: all var(--transition-base) !important;
    }

    :global(.dark .toc .item:hover) {
      background: var(--color-sidebar-hover-bg) !important;
    }
  }

  /* モバイルでヘッダーを常に表示 */
  @media (max-width: 949px) {
    :global(.header) {
      position: fixed !important;
      top: 0 !important;
      transform: translateY(0) !important;
      transition: none !important;
      background: var(--color-header-bg) !important;
      backdrop-filter: blur(10px) !important;
      box-shadow: var(--shadow-sm) !important;
      z-index: 999 !important;
    }

    :global(.dark .header) {
      background: var(--color-header-bg) !important;
      box-shadow: var(--shadow-md) !important;
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
      background: var(--color-header-bg) !important;
      backdrop-filter: blur(10px) !important;
      border-bottom: 1px solid var(--color-border) !important;
      z-index: 998 !important;
    }

    :global(.dark .sub-nav) {
      background: var(--color-header-bg) !important;
      border-bottom: 1px solid var(--color-border) !important;
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

  /* ダークモード時のコードブロック背景色統一 */
  :global(.dark .svp-code-block-wrapper) {
    background-color: var(--color-code-bg) !important;
    --shiki-dark-bg: transparent !important;
  }
  
  /* 内部要素の背景を透明に */
  :global(.dark .svp-code-block-wrapper .svp-code-block) {
    background-color: transparent !important;
  }
  
  :global(.dark .svp-code-block-wrapper pre.shiki) {
    background-color: transparent !important;
    --shiki-dark-bg: transparent !important;
  }
  
  :global(.dark .svp-code-block-wrapper .line) {
    background-color: transparent !important;
  }
  
  :global(.dark .svp-code-block-wrapper .line span) {
    background-color: transparent !important;
  }
  
  :global(.dark .svp-code-block-wrapper code) {
    background-color: transparent !important;
  }

  /* ダークモードのハイライトされた行 */
  :global(.dark .svp-code-block-wrapper .line.highlighted) {
    background-color: rgba(255, 255, 255, 0.1) !important;
  }

  /* インラインコード（コードブロック外） */
  :global(.dark p > code),
  :global(.dark li > code),
  :global(.dark td > code),
  :global(.dark h1 > code),
  :global(.dark h2 > code),
  :global(.dark h3 > code),
  :global(.dark h4 > code),
  :global(.dark h5 > code),
  :global(.dark h6 > code) {
    background-color: var(--color-inline-code-bg) !important;
    padding: 0.2em 0.4em;
    border-radius: 3px;
  }

  /* ライトモード時のコードブロック背景色も統一 */
  :global(.svp-code-block-wrapper) {
    background-color: var(--color-code-bg) !important;
  }
  
  /* 内部要素の背景を透明に */
  :global(.svp-code-block-wrapper .svp-code-block) {
    background-color: transparent !important;
  }
  
  :global(.svp-code-block-wrapper pre.shiki) {
    background-color: transparent !important;
  }
  
  :global(.svp-code-block-wrapper .line) {
    background-color: transparent !important;
  }
  
  :global(.svp-code-block-wrapper .line span) {
    background-color: transparent !important;
  }
  
  :global(.svp-code-block-wrapper code) {
    background-color: transparent !important;
  }

  /* ライトモードのハイライトされた行 */
  :global(.svp-code-block-wrapper .line.highlighted) {
    background-color: rgba(0, 0, 0, 0.05) !important;
  }

  /* インラインコード（コードブロック外） */
  :global(p > code),
  :global(li > code),
  :global(td > code),
  :global(h1 > code),
  :global(h2 > code),
  :global(h3 > code),
  :global(h4 > code),
  :global(h5 > code),
  :global(h6 > code) {
    background-color: var(--color-inline-code-bg) !important;
    padding: 0.2em 0.4em;
    border-radius: 3px;
    font-size: 0.875em;
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

  /* SveltePressの空のpage-switcherを非表示 */
  :global(.page-switcher) {
    display: none !important;
  }
  
  /* レイアウトラッパー */
  .layout-wrapper {
    display: contents;
  }
  
  /* コンテンツエリア内のナビゲーション配置 */
  :global(.content + .auto-page-navigation) {
    /* コンテンツの直後に配置された場合のスタイル */
    margin: 0 auto;
    max-width: var(--vp-layout-max-width, 960px);
  }

  /* ホームページのアクションボタンのレイアウト */
  /* 1248px以下で2列表示 */
  @media (min-width: 640px) and (max-width: 1248px) {
    :global(.home-page .actions) {
      display: grid !important;
      grid-template-columns: repeat(2, 1fr) !important;
      gap: 0.75rem !important;
      max-width: 500px !important;
    }

    /* プライマリボタンは2列分の幅 */
    :global(.home-page .actions .svp-action--primary) {
      grid-column: span 2 !important;
    }
  }

  /* ホームページのアクションボタンのカスタマイズ */
  /* 学習コンテンツボタン（Svelte, SvelteKit）をTypeScript青で強調 */
  :global(.home-page .svp-action[href="./svelte"]),
  :global(.home-page .svp-action[href="./sveltekit"]) {
    background-image: linear-gradient(to bottom right, #2196F3 0%, #1976D2 50%, #0D47A1 100%) !important;
    background-color: transparent !important;
    background-size: 200% 200% !important;
    background-position: 0% 0% !important;
    color: white !important;
    border: 1px solid rgba(25, 118, 210, 0.5) !important;
    font-weight: 600 !important;
    box-shadow: 0 4px 14px 0 rgba(13, 71, 161, 0.3) !important;
    transition: all 0.3s ease !important;
  }

  :global(.home-page .svp-action[href="./svelte"]:hover),
  :global(.home-page .svp-action[href="./sveltekit"]:hover) {
    background-position: 100% 100% !important;
    border-color: rgba(13, 71, 161, 0.7) !important;
    box-shadow: 0 6px 20px 0 rgba(13, 71, 161, 0.4) !important;
    transform: translateY(-2px) !important;
  }

  /* 補助コンテンツボタン（実装例、リファレンス、ディープダイブ）をグレーで控えめに */
  :global(.svp-action[href="./examples"]),
  :global(.svp-action[href="./reference"]),
  :global(.svp-action[href="./deep-dive"]) {
    background: transparent !important;
    background-color: transparent !important;
    color: var(--color-text-secondary) !important;
    border: 1px solid var(--color-border) !important;
    font-weight: 500 !important;
  }

  :global(.svp-action[href="./examples"]:hover),
  :global(.svp-action[href="./reference"]:hover),
  :global(.svp-action[href="./deep-dive"]:hover) {
    background: var(--color-bg-soft) !important;
    background-color: var(--color-bg-soft) !important;
    border-color: var(--color-text-secondary) !important;
    color: var(--color-text) !important;
  }

  /* ダークモードでの調整 */
  :global(.dark .home-page .svp-action[href="./svelte"]),
  :global(.dark .home-page .svp-action[href="./sveltekit"]) {
    background-image: linear-gradient(to bottom right, #42A5F5 0%, #2196F3 50%, #1976D2 100%) !important;
    background-color: transparent !important;
    background-size: 200% 200% !important;
    background-position: 0% 0% !important;
    border-color: rgba(66, 165, 245, 0.5) !important;
    box-shadow: 0 4px 14px 0 rgba(33, 150, 243, 0.4) !important;
    transition: all 0.3s ease !important;
  }

  :global(.dark .home-page .svp-action[href="./svelte"]:hover),
  :global(.dark .home-page .svp-action[href="./sveltekit"]:hover) {
    background-position: 100% 100% !important;
    border-color: rgba(25, 118, 210, 0.7) !important;
    box-shadow: 0 6px 20px 0 rgba(33, 150, 243, 0.5) !important;
    transform: translateY(-2px) !important;
  }

  :global(.dark .svp-action[href="./examples"]),
  :global(.dark .svp-action[href="./reference"]),
  :global(.dark .svp-action[href="./deep-dive"]) {
    background: transparent !important;
    background-color: transparent !important;
    color: var(--color-text-secondary) !important;
    border: 1px solid var(--color-border) !important;
  }

  :global(.dark .svp-action[href="./examples"]:hover),
  :global(.dark .svp-action[href="./reference"]:hover),
  :global(.dark .svp-action[href="./deep-dive"]:hover) {
    background: var(--color-bg-soft) !important;
    background-color: var(--color-bg-soft) !important;
    border-color: var(--color-text-secondary) !important;
    color: var(--color-text) !important;
  }
</style>
