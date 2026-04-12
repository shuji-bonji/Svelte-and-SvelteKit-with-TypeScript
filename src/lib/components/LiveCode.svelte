<script lang="ts">
	import type { Snippet } from 'svelte';
	import { buildPlaygroundEmbedUrl } from '$lib/utils/playground-url';

	interface Props {
		/** mdsvex の highlighter が base64+URIエンコードして渡してくる元コード */
		code: string;
		lang?: string;
		/** 将来的にバージョンピンを効かせたい場合のフック */
		svelteVersion?: string;
		/**
		 * true = svelte.dev/playground の output-only モード（エディタ非表示、Result全面表示）。
		 * LiveCode の外側には既に shiki で色付けされたコードが表示されているため、
		 * iframe 内の冗長なエディタを隠すことで認知負荷を下げる。
		 *
		 * 注意: output-only モードでは Console パネルも同時に非表示になる（公式仕様）。
		 * Console が必要なコード例では `outputOnly={false}` を明示指定するか、
		 * 「svelte.dev で開く ↗」からフルUIを新規タブで開く。
		 */
		outputOnly?: boolean;
		children?: Snippet;
	}

	let {
		code,
		lang = 'svelte',
		svelteVersion = 'latest',
		outputOnly = true,
		children
	}: Props = $props();

	let showPlayground = $state(false);
	let iframeUrl = $state<string | undefined>(undefined);
	let loading = $state(false);
	let error = $state<string | undefined>(undefined);

	// Base64+URIエンコードされたコードをデコード
	function decodeCode(encoded: string): string {
		try {
			return decodeURIComponent(atob(encoded));
		} catch {
			return encoded;
		}
	}

	async function openPlayground() {
		if (showPlayground || loading) return;
		loading = true;
		error = undefined;

		try {
			const source = decodeCode(code);
			iframeUrl = await buildPlaygroundEmbedUrl(source, {
				version: svelteVersion,
				outputOnly
			});
			showPlayground = true;
		} catch (e) {
			console.error('Playground URL の生成に失敗しました:', e);
			error = 'プレビューを生成できませんでした。ブラウザが CompressionStream に対応していない可能性があります。';
		} finally {
			loading = false;
		}
	}

	function closePlayground() {
		showPlayground = false;
	}

	/**
	 * Svelte.dev のプレイグラウンドを直接開く外部リンク。
	 * 新しいタブで本家のUI付きで試せる。
	 */
	let externalUrl = $derived.by(() => {
		if (!iframeUrl) return undefined;
		// /embed を外すことでフルUIのページに飛べる
		return iframeUrl.replace('/embed', '');
	});
</script>

<div class="live-code-wrapper">
	<!-- 静的コード表示（shikiでハイライト済み） -->
	<div class="code-display" class:hidden={showPlayground}>
		{@render children?.()}
	</div>

	<!-- Svelte Playground 埋め込みプレビュー -->
	{#if showPlayground && iframeUrl}
		<div class="playground-container">
			<iframe
				src={iframeUrl}
				title="Svelte Playground"
				loading="lazy"
				allow="cross-origin-isolated"
				sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-modals"
			></iframe>
		</div>
	{/if}

	{#if error}
		<div class="error-message">
			{error}
		</div>
	{/if}

	<!-- トグル・外部リンク -->
	<div class="live-code-actions">
		{#if showPlayground}
			{#if externalUrl}
				<a
					class="action-btn"
					href={externalUrl}
					target="_blank"
					rel="noopener noreferrer"
				>
					svelte.dev で開く ↗
				</a>
			{/if}
			<button type="button" class="action-btn" onclick={closePlayground}>
				コードに戻る
			</button>
		{:else}
			<button
				type="button"
				class="action-btn action-btn-primary"
				onclick={openPlayground}
				disabled={loading}
			>
				{#if loading}
					読み込み中...
				{:else}
					▶ インタラクティブに試す
				{/if}
			</button>
		{/if}
	</div>
</div>

<style>
	.live-code-wrapper {
		position: relative;
		margin: 1.5rem 0;
		border: 1px solid var(--color-border);
		border-radius: 0.5rem;
		overflow: hidden;
	}

	.code-display {
		position: relative;
	}

	.hidden {
		display: none;
	}

	.code-display :global(pre) {
		margin: 0;
		border: none;
		border-radius: 0;
	}

	.playground-container {
		height: 480px;
		background: var(--color-bg-secondary, #1e1e1e);
	}

	.playground-container iframe {
		width: 100%;
		height: 100%;
		border: 0;
		display: block;
	}

	.error-message {
		padding: 0.75rem 1rem;
		background: #fef2f2;
		color: #991b1b;
		border-top: 1px solid #fecaca;
		font-size: 0.875rem;
	}

	:global(.dark) .error-message {
		background: #450a0a;
		color: #fecaca;
		border-top-color: #991b1b;
	}

	.live-code-actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.5rem;
		padding: 0.5rem;
		background: var(--color-bg-secondary);
		border-top: 1px solid var(--color-border);
	}

	.action-btn {
		padding: 0.375rem 0.75rem;
		font-size: 0.8125rem;
		border: 1px solid var(--color-border);
		border-radius: 0.375rem;
		background: var(--color-bg);
		color: var(--color-text-muted);
		cursor: pointer;
		transition: all 0.15s;
		text-decoration: none;
		display: inline-flex;
		align-items: center;
	}

	.action-btn:hover {
		color: var(--color-text);
		border-color: var(--color-text-muted);
	}

	.action-btn-primary {
		background: var(--color-primary);
		color: white;
		border-color: var(--color-primary);
	}

	.action-btn-primary:hover {
		background: var(--color-primary-light);
		border-color: var(--color-primary-light);
		color: white;
	}

	.action-btn:disabled {
		opacity: 0.6;
		cursor: wait;
	}
</style>
