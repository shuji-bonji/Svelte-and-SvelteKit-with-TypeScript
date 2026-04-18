<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { base } from '$app/paths';
	import '../app.css';
	import Navbar from '$lib/components/Navbar.svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import AutoPageNavigation from '$lib/components/AutoPageNavigation.svelte';
	import TableOfContents from '$lib/components/TableOfContents.svelte';
	import PwaUpdatePrompt from '$lib/components/PwaUpdatePrompt.svelte';
	import { theme } from '$lib/stores/theme.svelte';
	import { sidebar } from '$lib/stores/sidebar.svelte';

	let { children } = $props();

	// トップページ判定
	let isTopPage = $derived(
		page.url.pathname === `${base}/` || page.url.pathname === base || page.url.pathname === '/'
	);

	onMount(() => {
		theme.init();
	});
</script>

<!-- title/descriptionは各ページのDocLayoutで設定 -->

<div class="app-layout">
	<Navbar />

	{#if isTopPage}
		<!-- トップページ：デスクトップ幅ではサイドバーなし・フルワイド -->
		<main class="main-content-full">
			{@render children()}
		</main>
	{:else}
		<div class="app-body">
			<!-- サイドバー（デスクトップ） -->
			<aside class="sidebar-desktop">
				<Sidebar />
			</aside>

			<!-- メインコンテンツ -->
			<main class="main-content">
				{@render children()}
				<AutoPageNavigation />
			</main>

			<!-- 目次: デスクトップは右サイドバー、〜1280px では FAB + ドロワー -->
			<TableOfContents />
		</div>
	{/if}

	<!--
		サイドバー（モバイル オーバーレイ）は isTopPage 分岐の外に置く。
		トップページでもハンバーガーから他セクションへ遷移できるようにするため、
		モバイル幅では全ページで sidebar.open による開閉を有効にする。
	-->
	{#if sidebar.open}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="sidebar-overlay" onclick={() => sidebar.close()} onkeydown={() => {}}></div>
		<aside class="sidebar-mobile">
			<Sidebar />
		</aside>
	{/if}

	<!-- PWA: 新版検知時にユーザーへ更新確認プロンプトを出す -->
	<PwaUpdatePrompt />
</div>

<style>
	.app-layout {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	.app-body {
		display: flex;
		flex: 1;
		max-width: 90rem;
		margin: 0 auto;
		width: 100%;
	}

	.sidebar-desktop {
		position: sticky;
		top: 3.75rem;
		width: 16rem;
		height: calc(100vh - 3.75rem);
		overflow-y: auto;
		border-right: 1px solid var(--color-border);
		background: var(--color-sidebar-bg);
		flex-shrink: 0;
	}

	.main-content {
		flex: 1;
		min-width: 0;
		padding: 2rem 3rem;
		max-width: 56rem;
	}

	/* トップページ用：サイドバーなし・フルワイド */
	.main-content-full {
		flex: 1;
		min-width: 0;
	}

	.sidebar-overlay {
		display: none;
	}

	.sidebar-mobile {
		display: none;
	}

	/* Navbar のハンバーガー表示ブレークポイント (960px) に揃える */
	@media (max-width: 960px) {
		.sidebar-desktop {
			display: none;
		}

		.sidebar-overlay {
			display: block;
			position: fixed;
			inset: 0;
			z-index: 30;
			background: rgba(0, 0, 0, 0.5);
		}

		.sidebar-mobile {
			display: block;
			position: fixed;
			top: 3.75rem;
			left: 0;
			bottom: 0;
			width: 16rem;
			z-index: 35;
			background: var(--color-bg);
			border-right: 1px solid var(--color-border);
			overflow-y: auto;
		}
	}

	@media (max-width: 768px) {
		.main-content {
			padding: 1.5rem 1rem;
		}
	}
</style>
