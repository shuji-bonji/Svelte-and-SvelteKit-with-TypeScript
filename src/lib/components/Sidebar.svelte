<script lang="ts">
	import { page } from '$app/state';
	import { base } from '$app/paths';
	import { tick } from 'svelte';
	import { sidebarConfig, type SidebarItem } from '$lib/config/sidebar';
	import { sidebar } from '$lib/stores/sidebar.svelte';
	import { icons } from './icons';

	let openSections = $state<Record<string, boolean>>({});

	// ページ遷移時にアクティブなメニュー項目へ自動スクロール
	$effect(() => {
		// page.url.pathname への依存を明示
		const _path = page.url.pathname;
		tick().then(() => {
			const activeEl = document.querySelector('.sidebar-item.active') as HTMLElement | null;
			if (activeEl) {
				activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
			}
		});
	});

	function toggleSection(path: string) {
		openSections[path] = !openSections[path];
	}

	// パスを正規化（末尾スラッシュを統一して比較）
	function normalizePath(path: string): string {
		const p = path.replace(base, '') || '/';
		// 末尾スラッシュを除去して統一（ルートは除く）
		return p === '/' ? '/' : p.replace(/\/$/, '');
	}

	// 完全一致でアクティブ判定
	function isActive(itemPath: string): boolean {
		return normalizePath(page.url.pathname) === normalizePath(itemPath);
	}

	function isSectionOpen(item: SidebarItem): boolean {
		if (openSections[item.to] !== undefined) return openSections[item.to];
		if (!item.collapsed) return true;
		const current = normalizePath(page.url.pathname);
		const target = normalizePath(item.to);
		return current.startsWith(target);
	}

	function handleLinkClick() {
		sidebar.close();
	}
</script>

<nav class="sidebar-nav">
	{#each sidebarConfig['/'] ?? [] as section}
		<div class="sidebar-section">
			{#if section.collapsible}
				<button
					class="sidebar-section-title"
					onclick={() => toggleSection(section.to)}
					aria-expanded={isSectionOpen(section)}
				>
					<span class="chevron" style="transform: rotate({isSectionOpen(section) ? 90 : 0}deg)">
						{@html icons.chevronRight}
					</span>
					{section.title}
				</button>
			{:else}
				<span class="sidebar-section-title">{section.title}</span>
			{/if}

			{#if isSectionOpen(section) && section.items}
				<ul class="sidebar-items">
					{#each section.items as item}
						{@render sidebarItem(item, 0)}
					{/each}
				</ul>
			{/if}
		</div>
	{/each}
</nav>

{#snippet sidebarItem(item: SidebarItem, depth: number)}
	<li>
		{#if item.items && item.collapsible}
			<button
				class="sidebar-item sidebar-item-group"
				style="padding-left: {(depth + 1) * 0.75}rem"
				onclick={() => toggleSection(item.to)}
			>
				<span class="chevron" style="transform: rotate({isSectionOpen(item) ? 90 : 0}deg)">
					{@html icons.chevronRight}
				</span>
				{item.title}
			</button>
			{#if isSectionOpen(item) && item.items}
				<ul class="sidebar-items">
					{#each item.items as child}
						{@render sidebarItem(child, depth + 1)}
					{/each}
				</ul>
			{/if}
		{:else}
			<a
				href="{base}{item.to}"
				class="sidebar-item"
				class:active={isActive(item.to)}
				style="padding-left: {(depth + 1) * 0.75 + 1.25}rem"
				onclick={handleLinkClick}
			>
				{item.title}
			</a>
		{/if}
	</li>
{/snippet}

<style>
	.sidebar-nav { padding: 1rem 0; }
	.sidebar-section { margin-bottom: 0.25rem; }

	.sidebar-section-title {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.5rem 0.75rem;
		font-size: 0.8125rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--color-text-muted);
		background: none;
		border: none;
		cursor: pointer;
		width: 100%;
		text-align: left;
		border-radius: 0.25rem;
		transition: color 0.15s, background 0.15s;
	}

	.sidebar-section-title:hover {
		color: var(--color-text);
	}

	.sidebar-items { list-style: none; padding: 0; margin: 0; }

	.sidebar-item {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.4375rem 0.75rem;
		font-size: 0.8125rem;
		color: var(--color-text-muted);
		text-decoration: none;
		border-left: 3px solid transparent;
		transition: all 0.15s ease;
		background: none;
		border-right: none;
		border-top: none;
		border-bottom: none;
		cursor: pointer;
		width: 100%;
		text-align: left;
		line-height: 1.4;
	}

	.sidebar-item:hover {
		color: var(--color-text);
		background: var(--color-sidebar-active);
	}

	/* 現在のページ（完全一致） */
	.sidebar-item.active {
		color: var(--color-primary);
		font-weight: 600;
		border-left-color: var(--color-primary);
		background: var(--color-sidebar-active);
		position: relative;
	}

	/* アクティブインジケーターのドット */
	.sidebar-item.active::before {
		content: '';
		position: absolute;
		left: -3px;
		top: 50%;
		transform: translateY(-50%);
		width: 3px;
		height: 1.25rem;
		background: var(--color-primary);
		border-radius: 0 2px 2px 0;
	}

	.chevron {
		display: inline-flex;
		flex-shrink: 0;
		transition: transform 0.2s ease;
	}
</style>
