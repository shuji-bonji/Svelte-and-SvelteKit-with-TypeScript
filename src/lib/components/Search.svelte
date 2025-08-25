<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { base } from '$app/paths';

	// プロパティ：ボタンを表示するかどうか
	let { showButton = true }: { showButton?: boolean } = $props();

	let searchContainer = $state<HTMLDivElement>();
	let isOpen = $state(false);
	let pagefindUI: any;
	let pagefindLoaded = false;
	let loadingError = $state<string | null>(null);

	async function loadPagefindUI() {
		if (pagefindLoaded || typeof window === 'undefined') return;

		console.log('Loading Pagefind UI...');
		console.log('Base path:', base);
		
		try {
			// Pagefind UIのCSSを読み込み
			const cssPath = `${base}/pagefind/pagefind-ui.css`;
			console.log('Loading CSS from:', cssPath);
			
			if (!document.querySelector(`link[href="${cssPath}"]`)) {
				const link = document.createElement('link');
				link.rel = 'stylesheet';
				link.href = cssPath;
				document.head.appendChild(link);
			}

			// Pagefind UIのJSを動的に読み込み
			const jsPath = `${base}/pagefind/pagefind-ui.js`;
			console.log('Loading JS from:', jsPath);
			
			if (!(window as any).PagefindUI) {
				const script = document.createElement('script');
				script.src = jsPath;
				await new Promise((resolve, reject) => {
					script.onload = () => {
						console.log('Pagefind script loaded successfully');
						resolve(true);
					};
					script.onerror = (error) => {
						console.error('Failed to load Pagefind script:', error);
						reject(error);
					};
					document.head.appendChild(script);
				});
			}

			pagefindLoaded = true;
			console.log('Pagefind loaded, PagefindUI available:', !!(window as any).PagefindUI);
		} catch (error) {
			console.error('Failed to load Pagefind:', error);
			loadingError = 'Pagefindの読み込みに失敗しました。ページをリロードしてください。';
		}
	}

	async function initializePagefind() {
		if (!searchContainer || pagefindUI) {
			console.log('Skip initialization - container:', !!searchContainer, 'UI:', !!pagefindUI);
			return;
		}

		console.log('Initializing Pagefind UI...');
		
		// Pagefind UIを読み込み
		await loadPagefindUI();

		// PagefindUIがグローバルで利用可能になったら初期化
		if ((window as any).PagefindUI) {
			const PagefindUI = (window as any).PagefindUI;
			console.log('Creating PagefindUI instance...');
			
			try {
				pagefindUI = new PagefindUI({
					element: searchContainer,
					baseUrl: base + '/',
					bundlePath: base + '/pagefind/',
					showSubResults: true,
					showImages: false,
					translations: {
						placeholder: 'サイト内を検索...',
						zero_results: '「[SEARCH_TERM]」の検索結果が見つかりませんでした',
						many_results: '[COUNT]件の検索結果が見つかりました',
						clear_search: '検索をクリア'
					},
					processResult: (result: any) => {
						if (result.url) {
							// .html拡張子を削除
							let url = result.url;
							if (url.endsWith('.html')) {
								url = url.slice(0, -5);
							}
							// index.htmlの場合は/にする
							if (url.endsWith('/index')) {
								url = url.slice(0, -6) || '/';
							}
							// ベースパスを追加
							if (!url.startsWith(base)) {
								url = base + url;
							}
							result.url = url;
						}
						return result;
					}
				});
				console.log('PagefindUI initialized successfully');
				
				// 検索結果のリンククリック処理を追加
				setTimeout(() => {
					const handleResultClick = (e: Event) => {
						const target = e.target as HTMLElement;
						if (target.classList.contains('pagefind-ui__result-link')) {
							e.preventDefault();
							let href = target.getAttribute('href');
							if (href) {
								// .html拡張子を削除
								if (href.endsWith('.html')) {
									href = href.slice(0, -5);
								}
								// index.htmlの場合は/にする
								if (href.endsWith('/index')) {
									href = href.slice(0, -6) || '/';
								}
								// 末尾にスラッシュを追加（ルートページ以外）
								if (!href.endsWith('/') && href !== '/') {
									href = href + '/';
								}
								// ベースパスを考慮したURLに遷移
								const fullUrl = href.startsWith(base) ? href : base + href;
								window.location.href = fullUrl;
								// モーダルを閉じる
								toggleSearch();
							}
						}
					};
					
					searchContainer?.addEventListener('click', handleResultClick);
				}, 100);
			} catch (error) {
				console.error('Failed to initialize Pagefind UI:', error);
				loadingError = 'Pagefind UIの初期化に失敗しました。';
			}
		} else {
			console.error('PagefindUI is not available on window');
			loadingError = 'Pagefind UIが利用できません。ビルド済みのサイトで実行してください。';
		}
	}

	export async function openSearch() {
		isOpen = true;
		loadingError = null;
		// DOMの更新を待つ
		await tick();
		// Pagefind UIを初期化
		await initializePagefind();
		// フォーカスを設定
		setTimeout(() => {
			const input = searchContainer?.querySelector('input');
			if (input) {
				input.focus();
				console.log('Input focused');
			} else {
				console.log('Input element not found');
			}
		}, 200);
	}

	async function toggleSearch() {
		isOpen = !isOpen;
		if (isOpen) {
			await openSearch();
		} else {
			// モーダルを閉じる時にクリーンアップ
			if (pagefindUI) {
				pagefindUI.destroy?.();
				pagefindUI = null;
			}
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		// Cmd/Ctrl + K で検索を開く
		if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
			event.preventDefault();
			toggleSearch();
		}
		// ESCで検索を閉じる
		if (event.key === 'Escape' && isOpen) {
			isOpen = false;
			if (pagefindUI) {
				pagefindUI.destroy?.();
				pagefindUI = null;
			}
		}
	}

	onMount(() => {
		document.addEventListener('keydown', handleKeydown);
		
		// デバッグ情報
		console.log('Search component mounted');
		console.log('Current URL:', window.location.href);
		console.log('Base path:', base);

		return () => {
			document.removeEventListener('keydown', handleKeydown);
			if (pagefindUI) {
				pagefindUI.destroy?.();
			}
		};
	});
</script>

<!-- 検索ボタン（オプション） -->
{#if showButton}
	<div class="search-wrapper">
		<button
			onclick={toggleSearch}
			class="search-button"
			aria-label="サイト内検索"
			title="検索 (Cmd/Ctrl + K)"
		>
			<svg
				class="search-icon"
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
			<span class="search-label">検索</span>
			<kbd class="search-hotkey">⌘K</kbd>
		</button>
	</div>
{/if}

<!-- 検索モーダル -->
{#if isOpen}
	<div class="search-modal" onclick={toggleSearch} onkeydown={(e) => e.key === 'Escape' && toggleSearch()} role="button" tabindex="-1" aria-label="モーダルを閉じる">
		<div class="search-modal-content" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.key === 'Escape' && e.stopPropagation()} role="dialog" aria-modal="true" tabindex="0">
			<div class="search-header">
				<h2>サイト内検索</h2>
				<button onclick={toggleSearch} class="close-button" aria-label="閉じる">
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
						<line x1="18" y1="6" x2="6" y2="18"></line>
						<line x1="6" y1="6" x2="18" y2="18"></line>
					</svg>
				</button>
			</div>
			<div bind:this={searchContainer} class="pagefind-container">
				{#if loadingError}
					<div class="error-message">
						<p>{loadingError}</p>
						<p class="error-note">注意: 検索機能は本番ビルド（npm run build）後のみ動作します。</p>
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	/* フローティング検索ボタン */
	.search-wrapper {
		position: fixed;
		bottom: 24px;
		right: 24px;
		z-index: 900;
	}

	.search-button {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 56px;
		height: 56px;
		background: rgb(251, 113, 133);
		border: none;
		border-radius: 50%;
		cursor: pointer;
		transition: all 0.3s ease;
		box-shadow: 0 4px 12px rgba(251, 113, 133, 0.3);
		color: white;
	}

	.search-button:hover {
		background: rgb(240, 90, 110);
		transform: scale(1.1);
		box-shadow: 0 6px 20px rgba(251, 113, 133, 0.4);
	}

	.search-button:active {
		transform: scale(0.95);
	}

	.search-icon {
		width: 24px;
		height: 24px;
		flex-shrink: 0;
	}

	.search-label,
	.search-hotkey {
		display: none;
	}

	/* デスクトップ: ヘッダーに通常ボタンを表示 */
	@media (min-width: 950px) {
		.search-wrapper {
			position: fixed;
			top: 18px;
			left: 260px;
			bottom: auto;
			right: auto;
			z-index: 890;
		}

		.search-button {
			width: auto;
			height: auto;
			padding: 0.5rem 1rem;
			background: var(--sp-c-bg-soft, #f6f6f7);
			border: 1px solid var(--sp-c-divider-light, #e5e5e5);
			border-radius: 8px;
			box-shadow: none;
			color: var(--sp-c-text-2, #3c3c43);
			gap: 0.5rem;
		}

		.search-button:hover {
			background: var(--sp-c-bg-mute, #ebebec);
			border-color: var(--sp-c-brand, #42b883);
			transform: none;
			box-shadow: none;
		}

		.search-icon {
			width: 20px;
			height: 20px;
		}

		.search-label {
			display: block;
			font-weight: 500;
		}

		.search-hotkey {
			display: block;
			padding: 0.125rem 0.375rem;
			background: var(--sp-c-bg, white);
			border: 1px solid var(--sp-c-divider, #e5e5e5);
			border-radius: 4px;
			font-size: 12px;
			font-family: monospace;
		}
	}

	@media (min-width: 1240px) {
		.search-wrapper {
			left: 300px;
		}
	}

	/* ホームページでの配置 - 4rem右にずらす */
	@media (min-width: 950px) {
		:global(.is-home) .search-wrapper {
			left: calc(260px + 4rem); /* 通常位置から4rem右へ */
		}
	}

	@media (min-width: 1240px) {
		:global(.is-home) .search-wrapper {
			left: calc(300px + 4rem); /* 通常位置から4rem右へ */
		}
	}

	/* ダークモードでのフローティングボタン */
	:global(.dark) .search-button {
		background: rgb(251, 113, 133);
		color: white;
	}

	:global(.dark) .search-button:hover {
		background: rgb(240, 90, 110);
	}

	/* デスクトップのダークモード */
	@media (min-width: 950px) {
		:global(.dark) .search-button {
			background: var(--sp-c-bg-soft);
			color: var(--sp-c-text-2);
		}

		:global(.dark) .search-button:hover {
			background: var(--sp-c-bg-mute);
		}

		:global(.dark) .search-hotkey {
			background: var(--sp-c-bg);
			border-color: var(--sp-c-divider);
		}
	}

	.search-modal {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(4px);
		display: flex;
		align-items: flex-start;
		justify-content: center;
		padding-top: 10vh;
		z-index: 9999;
		animation: fadeIn 0.2s ease;
		cursor: default;
	}

	.search-modal-content {
		background: var(--sp-c-bg, white);
		border-radius: 12px;
		width: 90%;
		max-width: 700px;
		max-height: 70vh;
		overflow: hidden;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
		animation: slideUp 0.2s ease;
	}

	.search-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem 1.5rem;
		border-bottom: 1px solid var(--sp-c-divider-light, #e5e5e5);
	}

	.search-header h2 {
		margin: 0;
		font-size: 1.125rem;
		font-weight: 600;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #feca57 75%, #48c6ef 100%);
		background-clip: text;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-size: 200% 200%;
		animation: gradient-animation 3s ease infinite;
	}

	.close-button {
		background: none;
		border: none;
		cursor: pointer;
		padding: 0.25rem;
		color: var(--sp-c-text-3, #8e8e93);
		transition: color 0.2s;
	}

	.close-button:hover {
		color: var(--sp-c-text-1, #1a1a1e);
	}

	.pagefind-container {
		padding: 1rem;
		max-height: calc(70vh - 4rem);
		overflow-y: auto;
		min-height: 200px;
		position: relative;
	}

	.error-message {
		padding: 2rem;
		text-align: center;
		color: var(--sp-c-text-2, #3c3c43);
	}

	.error-message p {
		margin: 0.5rem 0;
	}

	.error-note {
		font-size: 0.875rem;
		color: var(--sp-c-text-3, #8e8e93);
		margin-top: 1rem !important;
	}

	/* Pagefind UIのスタイル調整 */
	:global(.pagefind-ui) {
		font-family: inherit;
	}

	/* 検索フォームのレイアウト修正 */
	:global(.pagefind-ui__form) {
		position: relative !important;
	}

	:global(.pagefind-ui__search-input) {
		font-size: 16px !important;
		padding: 0.75rem !important;
		padding-left: 2.5rem !important; /* 検索アイコンのスペース */
		padding-right: 2.5rem !important; /* クリアボタンのスペース */
		border-radius: 8px !important;
		border: 1px solid var(--sp-c-divider-light, #e5e5e5) !important;
		background-color: var(--sp-c-bg, white) !important;
		color: var(--sp-c-text-1, #1a1a1e) !important;
		width: 100% !important;
	}

	/* Pagefindのクリアボタンを入力フィールド内に配置 */
	:global(.pagefind-ui__search-clear) {
		position: absolute !important;
		right: 10px !important;
		top: 12px !important; /* 入力フィールドの中央付近に固定配置 */
		background: transparent !important;
		border: none !important;
		padding: 4px !important;
		margin: 0 !important;
		width: 24px !important;
		height: 24px !important;
		display: flex !important;
		align-items: center !important;
		justify-content: center !important;
		cursor: pointer !important;
		opacity: 0.6 !important;
		transition: opacity 0.2s ease !important;
		z-index: 10 !important;
		font-size: 0 !important; /* テキストを隠す */
	}

	:global(.pagefind-ui__search-clear::before) {
		content: '×' !important;
		font-size: 20px !important;
		color: var(--sp-c-text-2, #3c3c43) !important;
		font-weight: bold !important;
		line-height: 1 !important;
	}

	:global(.pagefind-ui__search-clear:hover) {
		opacity: 1 !important;
	}

	:global(.pagefind-ui__search-input:focus) {
		outline: none !important;
		border-color: var(--sp-c-brand, #42b883) !important;
		box-shadow: 0 0 0 3px rgba(66, 184, 131, 0.1) !important;
	}

	:global(.pagefind-ui__result) {
		border: 1px solid var(--sp-c-divider-light, #e5e5e5) !important;
		border-radius: 8px !important;
		padding: 1rem !important;
		margin-bottom: 0.75rem !important;
	}

	:global(.pagefind-ui__result-link) {
		color: var(--sp-c-brand, #42b883) !important;
		font-weight: 600 !important;
		text-decoration: none !important;
		cursor: pointer !important;
	}

	:global(.pagefind-ui__result-link:hover) {
		text-decoration: underline !important;
		color: var(--sp-c-brand-dark, #33a06f) !important;
	}

	:global(.pagefind-ui__result-excerpt) {
		color: var(--sp-c-text-2, #3c3c43) !important;
		line-height: 1.6 !important;
	}

	/* 検索結果がない時のメッセージスタイル */
	:global(.pagefind-ui__message) {
		padding: 0.5rem !important;
		text-align: center !important;
		color: var(--sp-c-text-3, #8e8e93) !important;
		font-size: 0.875rem !important;
	}

	/* 「次を読み込む」ボタンのスタイル修正 */
	:global(.pagefind-ui__button) {
		margin: 1rem 0 2rem 0 !important;
		padding: 0.75rem 1.5rem !important;
		background: var(--sp-c-brand, #42b883) !important;
		color: white !important;
		border: none !important;
		border-radius: 8px !important;
		cursor: pointer !important;
		font-weight: 500 !important;
		transition: background 0.2s !important;
	}

	:global(.pagefind-ui__button:hover) {
		background: var(--sp-c-brand-dark, #33a06f) !important;
	}

	/* 検索結果エリアのパディング調整 */
	:global(.pagefind-ui__results-area) {
		padding-bottom: 2rem !important;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes slideUp {
		from {
			transform: translateY(20px);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}

	/* グラデーションアニメーション */
	@keyframes gradient-animation {
		0% {
			background-position: 0% 50%;
		}
		50% {
			background-position: 100% 50%;
		}
		100% {
			background-position: 0% 50%;
		}
	}

	/* ダークモード対応 */
	:global(.dark) .search-button {
		background: rgba(30, 30, 32, 0.8);
		border-color: rgba(82, 82, 89, 0.5);
		color: rgba(235, 235, 245, 0.9);
	}

	:global(.dark) .search-button:hover {
		background: rgba(40, 40, 42, 0.9);
		border-color: var(--sp-c-brand, #42b883);
	}

	:global(.dark) .search-modal {
		background: rgba(0, 0, 0, 0.7);
	}

	:global(.dark) .search-modal-content {
		background: #1a1a1a;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
	}

	:global(.dark) .search-header {
		border-bottom-color: rgba(82, 82, 89, 0.3);
	}

	:global(.dark) .close-button {
		color: rgba(142, 142, 147, 0.9);
	}

	:global(.dark) .close-button:hover {
		color: rgba(235, 235, 245, 0.9);
	}

	:global(.dark) kbd {
		background: rgba(30, 30, 32, 0.8);
		border-color: rgba(82, 82, 89, 0.5);
		color: rgba(235, 235, 245, 0.6);
	}

	/* Pagefind UIのダークモード対応 */
	:global(.dark .pagefind-ui__search-input) {
		background-color: rgba(30, 30, 32, 0.8) !important;
		border-color: rgba(82, 82, 89, 0.5) !important;
		color: rgba(235, 235, 245, 0.9) !important;
	}

	:global(.dark .pagefind-ui__search-clear::before) {
		color: rgba(235, 235, 245, 0.6) !important;
	}

	:global(.dark .pagefind-ui__search-clear:hover::before) {
		color: rgba(235, 235, 245, 0.9) !important;
	}

	:global(.dark .pagefind-ui__search-input:focus) {
		border-color: var(--sp-c-brand, #42b883) !important;
		box-shadow: 0 0 0 3px rgba(66, 184, 131, 0.2) !important;
	}

	:global(.dark .pagefind-ui__result) {
		background: rgba(30, 30, 32, 0.5) !important;
		border-color: rgba(82, 82, 89, 0.3) !important;
	}

	:global(.dark .pagefind-ui__result-link) {
		color: #42b883 !important;
	}

	:global(.dark .pagefind-ui__result-link:hover) {
		color: #5ecfa5 !important;
	}

	:global(.dark .pagefind-ui__result-excerpt) {
		color: rgba(235, 235, 245, 0.7) !important;
	}

	:global(.dark .pagefind-ui__message) {
		color: rgba(235, 235, 245, 0.6) !important;
	}

	:global(.dark .error-message) {
		color: rgba(235, 235, 245, 0.7);
	}

	:global(.dark .error-note) {
		color: rgba(142, 142, 147, 0.8);
	}

	/* モバイル対応 */
	@media (max-width: 768px) {
		.search-button .search-label {
			display: none;
		}

		.search-button kbd {
			display: none;
		}

		.search-modal-content {
			width: 95%;
			margin-top: 2rem;
		}
	}
</style>