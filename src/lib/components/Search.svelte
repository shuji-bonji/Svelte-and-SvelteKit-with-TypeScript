<script lang="ts">
	import { base } from '$app/paths';
	import { goto } from '$app/navigation';
	import { icons } from './icons';

	let open = $state(false);
	let query = $state('');
	let results = $state<Array<{ url: string; title: string; excerpt: string }>>([]);
	let selectedIndex = $state(0);
	let inputEl: HTMLInputElement | undefined = $state();
	let pagefind: any = $state(null);

	let pagefindUnavailable = $state(false);

	async function initPagefind() {
		if (pagefind || pagefindUnavailable) return;
		try {
			// pagefind-entry.json で存在チェック（devモードではpagefindが存在しない）
			// Vite devサーバーはJSに200を返すが、JSONは実在しなければ404になる
			const metaCheck = await fetch(`${base}/pagefind/pagefind-entry.json`, { method: 'HEAD' });
			if (!metaCheck.ok) {
				pagefindUnavailable = true;
				return;
			}

			const module = await import(/* @vite-ignore */ `${base}/pagefind/pagefind.js`);
			pagefind = module?.search ? module : module?.default;
			await pagefind?.init?.();
		} catch {
			pagefindUnavailable = true;
		}
	}

	async function search(q: string) {
		if (!q.trim() || !pagefind) {
			results = [];
			return;
		}
		const searchResult = await pagefind.search(q);
		const items = await Promise.all(
			searchResult.results.slice(0, 8).map(async (r: any) => {
				const data = await r.data();
				return {
					url: data.url,
					title: data.meta?.title ?? data.url,
					excerpt: data.excerpt ?? ''
				};
			})
		);
		results = items;
		selectedIndex = 0;
	}

	function openSearch() {
		open = true;
		initPagefind();
		// 次のフレームでinputにフォーカス
		requestAnimationFrame(() => inputEl?.focus());
	}

	function closeSearch() {
		open = false;
		query = '';
		results = [];
	}

	function navigate(url: string) {
		closeSearch();
		goto(url);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			selectedIndex = Math.min(selectedIndex + 1, results.length - 1);
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			selectedIndex = Math.max(selectedIndex - 1, 0);
		} else if (e.key === 'Enter' && results[selectedIndex]) {
			e.preventDefault();
			navigate(results[selectedIndex].url);
		} else if (e.key === 'Escape') {
			closeSearch();
		}
	}

	// グローバルショートカット: Ctrl+K / Cmd+K
	function handleGlobalKeydown(e: KeyboardEvent) {
		if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
			e.preventDefault();
			if (open) closeSearch();
			else openSearch();
		}
	}

	// queryの変更を監視して検索実行
	$effect(() => {
		search(query);
	});
</script>

<svelte:window onkeydown={handleGlobalKeydown} />

<!-- 検索ボタン -->
<button class="search-trigger" onclick={openSearch} aria-label="検索">
	{@html icons.search}
	<span class="search-shortcut">
		<kbd>⌘</kbd><kbd>K</kbd>
	</span>
</button>

<!-- 検索モーダル -->
{#if open}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="search-overlay" onclick={closeSearch} onkeydown={() => {}}>
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="search-modal" onclick={(e) => e.stopPropagation()} onkeydown={() => {}}>
			<div class="search-input-wrapper">
				{@html icons.search}
				<input
					bind:this={inputEl}
					bind:value={query}
					onkeydown={handleKeydown}
					type="text"
					placeholder="ドキュメントを検索..."
					class="search-input"
					spellcheck="false"
				/>
				<button class="search-close" onclick={closeSearch}>
					<kbd>Esc</kbd>
				</button>
			</div>

			{#if results.length > 0}
				<ul class="search-results">
					{#each results as result, i}
						<li>
							<button
								class="search-result"
								class:selected={i === selectedIndex}
								onclick={() => navigate(result.url)}
								onmouseenter={() => { selectedIndex = i; }}
							>
								<span class="result-title">{result.title}</span>
								<span class="result-excerpt">{@html result.excerpt}</span>
							</button>
						</li>
					{/each}
				</ul>
			{:else if query.trim()}
				<div class="search-empty">該当する結果がありません</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	.search-trigger {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.375rem 0.625rem;
		background: var(--color-bg-secondary);
		border: 1px solid var(--color-border);
		border-radius: 0.5rem;
		color: var(--color-text-muted);
		cursor: pointer;
		font-size: 0.8125rem;
		transition: border-color 0.15s, color 0.15s;
	}

	.search-trigger:hover {
		border-color: var(--color-text-muted);
		color: var(--color-text);
	}

	.search-shortcut {
		display: flex;
		gap: 0.125rem;
	}

	.search-shortcut kbd {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 1.25rem;
		height: 1.25rem;
		padding: 0 0.25rem;
		background: var(--color-bg);
		border: 1px solid var(--color-border);
		border-radius: 0.25rem;
		font-size: 0.6875rem;
		font-family: inherit;
	}

	.search-overlay {
		position: fixed;
		inset: 0;
		z-index: 50;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: flex-start;
		justify-content: center;
		padding-top: 15vh;
	}

	.search-modal {
		width: min(36rem, 90vw);
		background: var(--color-bg);
		border: 1px solid var(--color-border);
		border-radius: 0.75rem;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
		overflow: hidden;
	}

	.search-input-wrapper {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.875rem 1rem;
		border-bottom: 1px solid var(--color-border);
		color: var(--color-text-muted);
	}

	.search-input {
		flex: 1;
		background: none;
		border: none;
		outline: none;
		font-size: 1rem;
		color: var(--color-text);
	}

	.search-input::placeholder {
		color: var(--color-text-muted);
	}

	.search-close kbd {
		display: inline-flex;
		align-items: center;
		padding: 0.125rem 0.375rem;
		background: var(--color-bg-secondary);
		border: 1px solid var(--color-border);
		border-radius: 0.25rem;
		font-size: 0.6875rem;
		font-family: inherit;
		color: var(--color-text-muted);
		cursor: pointer;
	}

	.search-results {
		list-style: none;
		padding: 0.5rem;
		margin: 0;
		max-height: 50vh;
		overflow-y: auto;
	}

	.search-result {
		display: block;
		width: 100%;
		text-align: left;
		padding: 0.625rem 0.75rem;
		border: none;
		background: none;
		border-radius: 0.5rem;
		cursor: pointer;
		transition: background 0.1s;
	}

	.search-result:hover,
	.search-result.selected {
		background: var(--color-bg-secondary);
	}

	.result-title {
		display: block;
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-primary);
	}

	.result-excerpt {
		display: block;
		font-size: 0.8125rem;
		color: var(--color-text-muted);
		margin-top: 0.25rem;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.result-excerpt :global(mark) {
		background: color-mix(in srgb, var(--color-primary) 20%, transparent);
		color: var(--color-text);
		border-radius: 0.125rem;
		padding: 0 0.125rem;
	}

	.search-empty {
		padding: 2rem;
		text-align: center;
		color: var(--color-text-muted);
		font-size: 0.875rem;
	}

	@media (max-width: 768px) {
		.search-shortcut {
			display: none;
		}
	}
</style>
