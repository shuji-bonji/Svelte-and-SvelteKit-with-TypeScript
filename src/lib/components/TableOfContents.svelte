<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { onMount, onDestroy } from 'svelte';
	import { icons } from '$lib/components/icons';

	interface Heading {
		id: string;
		text: string;
		level: 2 | 3;
	}

	let headings = $state<Heading[]>([]);
	let activeId = $state<string>('');
	let mobileOpen = $state(false);
	let observer: IntersectionObserver | null = null;

	/**
	 * 記事内の h2 / h3 を走査して headings を更新する
	 * rehype-slug により各見出しには id が自動付与されている前提
	 */
	function scanHeadings(): void {
		const article = document.querySelector('article.prose');
		if (!article) {
			headings = [];
			return;
		}
		const nodes = article.querySelectorAll<HTMLElement>('h2[id], h3[id]');
		headings = Array.from(nodes).map((el) => ({
			id: el.id,
			// rehype-autolink-headings 由来の末尾の "#" を除去
			text: (el.textContent ?? '').replace(/#\s*$/, '').trim(),
			level: el.tagName === 'H2' ? 2 : 3
		}));
		setupObserver();
	}

	/**
	 * 見出し要素を IntersectionObserver で監視して
	 * ビューポート上部に来た見出しをアクティブにする
	 */
	function setupObserver(): void {
		observer?.disconnect();
		if (headings.length === 0) return;

		observer = new IntersectionObserver(
			(entries) => {
				const visible = entries
					.filter((e) => e.isIntersecting)
					.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
				if (visible.length > 0) {
					activeId = visible[0].target.id;
				}
			},
			{
				rootMargin: '-80px 0px -70% 0px',
				threshold: 0
			}
		);

		for (const h of headings) {
			const el = document.getElementById(h.id);
			if (el) observer.observe(el);
		}
	}

	function handleClick(e: MouseEvent, id: string): void {
		e.preventDefault();
		const el = document.getElementById(id);
		if (!el) return;
		const y = el.getBoundingClientRect().top + window.scrollY - 80;
		window.scrollTo({ top: y, behavior: 'smooth' });
		history.replaceState(null, '', `#${id}`);
		activeId = id;
		// モバイルではリンククリックで閉じる
		closeMobile();
	}

	function openMobile(): void {
		mobileOpen = true;
	}

	function closeMobile(): void {
		mobileOpen = false;
	}

	function handleKeydown(e: KeyboardEvent): void {
		if (e.key === 'Escape' && mobileOpen) {
			closeMobile();
		}
	}

	onMount(() => {
		requestAnimationFrame(() => setTimeout(scanHeadings, 50));
	});

	afterNavigate(() => {
		mobileOpen = false;
		requestAnimationFrame(() => setTimeout(scanHeadings, 50));
	});

	onDestroy(() => {
		observer?.disconnect();
	});
</script>

<svelte:window on:keydown={handleKeydown} />

{#if headings.length >= 2}
	<!-- デスクトップ（1280px 以上）: 右サイドバー -->
	<aside class="toc-desktop" aria-label="このページの目次">
		<div class="toc-title">このページ</div>
		<ul class="toc-list">
			{#each headings as h (h.id)}
				<li class="toc-item toc-level-{h.level}">
					<a
						href="#{h.id}"
						class="toc-link"
						class:active={activeId === h.id}
						onclick={(e) => handleClick(e, h.id)}
					>
						{h.text}
					</a>
				</li>
			{/each}
		</ul>
	</aside>

	<!-- モバイル・タブレット（〜1280px）: FAB + ドロワー -->
	<button
		type="button"
		class="toc-fab"
		class:hidden={mobileOpen}
		aria-label="目次を開く"
		aria-expanded={mobileOpen}
		aria-controls="toc-mobile-drawer"
		onclick={openMobile}
	>
		<span class="toc-fab-icon" aria-hidden="true">{@html icons.menu}</span>
		<span class="toc-fab-label">目次</span>
	</button>

	{#if mobileOpen}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="toc-backdrop" onclick={closeMobile}></div>
		<aside
			id="toc-mobile-drawer"
			class="toc-drawer"
			aria-label="このページの目次"
		>
			<div class="toc-drawer-header">
				<span class="toc-title">このページ</span>
				<button
					type="button"
					class="toc-close"
					aria-label="目次を閉じる"
					onclick={closeMobile}
				>
					<span class="toc-close-icon" aria-hidden="true">{@html icons.x}</span>
				</button>
			</div>
			<ul class="toc-list toc-list-drawer">
				{#each headings as h (h.id)}
					<li class="toc-item toc-level-{h.level}">
						<a
							href="#{h.id}"
							class="toc-link"
							class:active={activeId === h.id}
							onclick={(e) => handleClick(e, h.id)}
						>
							{h.text}
						</a>
					</li>
				{/each}
			</ul>
		</aside>
	{/if}
{/if}

<style>
	/* ==========================================================
	   デスクトップ TOC: 右サイドバー
	   ========================================================== */
	.toc-desktop {
		position: sticky;
		top: 3.75rem;
		align-self: flex-start;
		width: 14rem;
		max-height: calc(100vh - 3.75rem);
		overflow-y: auto;
		padding: 2rem 1rem 2rem 0;
		flex-shrink: 0;
		font-size: 0.875rem;
		line-height: 1.5;
	}

	.toc-title {
		font-weight: 600;
		color: var(--color-text);
		padding-left: 0.75rem;
		letter-spacing: 0.02em;
	}

	.toc-desktop .toc-title {
		margin-bottom: 0.75rem;
	}

	.toc-list {
		list-style: none;
		padding: 0;
		margin: 0;
		border-left: 1px solid var(--color-border);
	}

	.toc-item {
		margin: 0;
	}

	.toc-link {
		display: block;
		padding: 0.25rem 0.75rem;
		color: var(--color-text-muted);
		text-decoration: none;
		border-left: 2px solid transparent;
		margin-left: -1px;
		transition:
			color 0.15s ease,
			border-color 0.15s ease,
			background-color 0.15s ease;
		word-break: break-word;
	}

	.toc-link:hover {
		color: var(--color-text);
	}

	.toc-link.active {
		color: var(--color-primary);
		border-left-color: var(--color-primary);
		font-weight: 500;
	}

	.toc-level-3 .toc-link {
		padding-left: 1.5rem;
		font-size: 0.8125rem;
	}

	/* ==========================================================
	   モバイル/タブレット: フローティングボタン + 右ドロワー
	   ========================================================== */
	.toc-fab,
	.toc-backdrop,
	.toc-drawer {
		display: none;
	}

	@media (max-width: 1280px) {
		.toc-desktop {
			display: none;
		}

		.toc-fab {
			display: inline-flex;
			align-items: center;
			gap: 0.375rem;
			position: fixed;
			right: 1rem;
			bottom: 1.25rem;
			z-index: 40;
			padding: 0.625rem 0.875rem;
			border: 1px solid var(--color-border);
			border-radius: 9999px;
			background: var(--color-bg);
			color: var(--color-text);
			font-size: 0.875rem;
			font-weight: 500;
			cursor: pointer;
			box-shadow:
				0 4px 12px rgba(0, 0, 0, 0.12),
				0 1px 3px rgba(0, 0, 0, 0.08);
			transition:
				transform 0.15s ease,
				box-shadow 0.15s ease,
				opacity 0.15s ease;
		}

		.toc-fab:hover {
			transform: translateY(-2px);
			box-shadow:
				0 6px 16px rgba(0, 0, 0, 0.16),
				0 2px 4px rgba(0, 0, 0, 0.1);
		}

		.toc-fab-icon,
		.toc-close-icon {
			display: inline-flex;
			align-items: center;
			justify-content: center;
			line-height: 0;
		}

		.toc-fab.hidden {
			opacity: 0;
			pointer-events: none;
		}

		:global(.dark) .toc-fab {
			box-shadow:
				0 4px 12px rgba(0, 0, 0, 0.4),
				0 1px 3px rgba(0, 0, 0, 0.25);
		}

		.toc-backdrop {
			display: block;
			position: fixed;
			inset: 0;
			z-index: 45;
			background: rgba(0, 0, 0, 0.5);
			animation: toc-fade-in 0.15s ease;
		}

		.toc-drawer {
			display: flex;
			flex-direction: column;
			position: fixed;
			top: 0;
			right: 0;
			bottom: 0;
			z-index: 50;
			width: 18rem;
			max-width: 85vw;
			background: var(--color-bg);
			border-left: 1px solid var(--color-border);
			box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
			animation: toc-slide-in 0.2s ease;
		}

		.toc-drawer-header {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 1rem 1rem 0.75rem 1rem;
			border-bottom: 1px solid var(--color-border);
		}

		.toc-drawer-header .toc-title {
			padding-left: 0;
		}

		.toc-close {
			display: inline-flex;
			align-items: center;
			justify-content: center;
			width: 2rem;
			height: 2rem;
			border: none;
			border-radius: 0.375rem;
			background: transparent;
			color: var(--color-text-muted);
			cursor: pointer;
			transition:
				background-color 0.15s ease,
				color 0.15s ease;
		}

		.toc-close:hover {
			background: var(--color-bg-secondary);
			color: var(--color-text);
		}

		.toc-list-drawer {
			flex: 1;
			overflow-y: auto;
			padding: 0.75rem 1rem 1.5rem 1rem;
			font-size: 0.9375rem;
			line-height: 1.6;
		}
	}

	@media (max-width: 480px) {
		.toc-fab-label {
			display: none;
		}

		.toc-fab {
			padding: 0.625rem;
		}
	}

	@keyframes toc-fade-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes toc-slide-in {
		from {
			transform: translateX(100%);
		}
		to {
			transform: translateX(0);
		}
	}
</style>
