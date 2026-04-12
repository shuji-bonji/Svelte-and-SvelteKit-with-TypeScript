<script lang="ts">
	import { base } from '$app/paths';
	import { theme } from '$lib/stores/theme.svelte';
	import { sidebar } from '$lib/stores/sidebar.svelte';
	import { icons } from './icons';
	import Search from './Search.svelte';

	const navItems = [
		{ title: 'Svelte', href: '/svelte/' },
		{ title: 'SvelteKit', href: '/sveltekit/' },
		{ title: 'Svelte MCP', href: '/svelte-mcp/' },
		{ title: '実装例', href: '/examples/' },
		{ title: 'リファレンス', href: '/reference/' },
		{ title: 'ディープダイブ', href: '/deep-dive/' }
	];
</script>

<header class="navbar">
	<div class="navbar-inner">
		<div class="navbar-left">
			<button class="mobile-menu-btn" onclick={() => sidebar.toggle()} aria-label="メニュー">
				{@html sidebar.open ? icons.x : icons.menu}
			</button>
			<a href="{base}/" class="navbar-brand">
				<img src="{base}/svelteAndTypescript.png" alt="ロゴ" class="brand-logo" />
				<span class="brand-title">
					<span class="brand-line1">TypeScriptで学ぶ</span>
					<span class="brand-line2">Svelte 5/SvelteKit</span>
				</span>
			</a>
		</div>

		<nav class="navbar-center">
			{#each navItems as item}
				<a href="{base}{item.href}" class="nav-link">{item.title}</a>
			{/each}
		</nav>

		<div class="navbar-right">
			<Search />
			<a
				href="https://github.com/shuji-bonji/Svelte-and-SvelteKit-with-TypeScript"
				class="icon-btn"
				target="_blank"
				rel="noopener"
				aria-label="GitHub"
			>
				{@html icons.github}
			</a>
			<button class="icon-btn" onclick={() => theme.toggle()} aria-label="テーマ切替">
				{@html theme.dark ? icons.sun : icons.moon}
			</button>
		</div>
	</div>
</header>

<style>
	.navbar {
		position: sticky;
		top: 0;
		z-index: 40;
		backdrop-filter: blur(12px);
		background: color-mix(in srgb, var(--color-bg) 85%, transparent);
		border-bottom: 1px solid var(--color-border);
	}

	.navbar-inner {
		display: flex;
		align-items: center;
		justify-content: space-between;
		max-width: 90rem;
		margin: 0 auto;
		padding: 0 1.5rem;
		height: 3.75rem;
	}

	.navbar-left {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.mobile-menu-btn {
		display: none;
		background: none;
		border: none;
		color: var(--color-text);
		cursor: pointer;
		padding: 0.375rem;
		border-radius: 0.375rem;
	}

	.navbar-brand {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		text-decoration: none;
		color: var(--color-text);
	}

	.brand-logo {
		width: 2rem;
		height: 2rem;
		border-radius: 0.25rem;
	}

	.brand-title {
		display: flex;
		flex-direction: column;
		line-height: 1.2;
	}

	.brand-line1 {
		font-size: 0.6875rem;
		color: var(--color-text-muted);
		letter-spacing: 0.02em;
	}

	.brand-line2 {
		font-size: 0.875rem;
		font-weight: 700;
		color: var(--color-primary);
	}

	.navbar-center {
		display: flex;
		gap: 0.25rem;
	}

	.nav-link {
		padding: 0.375rem 0.75rem;
		font-size: 0.875rem;
		color: var(--color-text-muted);
		text-decoration: none;
		border-radius: 0.375rem;
		transition: color 0.15s, background 0.15s;
	}

	.nav-link:hover {
		color: var(--color-text);
		background: var(--color-bg-secondary);
	}

	.navbar-right {
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.icon-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		background: none;
		border: none;
		color: var(--color-text-muted);
		cursor: pointer;
		border-radius: 0.375rem;
		transition: color 0.15s, background 0.15s;
		text-decoration: none;
	}

	.icon-btn:hover {
		color: var(--color-text);
		background: var(--color-bg-secondary);
	}

	@media (max-width: 960px) {
		.mobile-menu-btn {
			display: flex;
		}
		.navbar-center {
			display: none;
		}
	}
</style>
