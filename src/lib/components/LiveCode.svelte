<script lang="ts">
	import type { Snippet } from 'svelte';
	import {
		buildPlaygroundEmbedUrl,
		buildPlaygroundEmbedUrlMulti
	} from '$lib/utils/playground-url';

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

	// ネットワーク状態（online/offline）。SSR では undefined となるため、
	// $effect 内（クライアントでのみ実行）で初期化する。
	let isOnline = $state(true);

	$effect(() => {
		if (typeof navigator === 'undefined' || typeof window === 'undefined') return;
		isOnline = navigator.onLine;
		const handleOnline = () => {
			isOnline = true;
		};
		const handleOffline = () => {
			isOnline = false;
		};
		window.addEventListener('online', handleOnline);
		window.addEventListener('offline', handleOffline);
		return () => {
			window.removeEventListener('online', handleOnline);
			window.removeEventListener('offline', handleOffline);
		};
	});

	// Base64+URIエンコードされたコードをデコード
	function decodeCode(encoded: string): string {
		try {
			return decodeURIComponent(atob(encoded));
		} catch {
			return encoded;
		}
	}

	// `<!-- @file: FileName.svelte -->` マーカーで区切られたマルチファイル形式の
	// ソースをファイル配列に分割する。マーカーが無ければ null を返す。
	// 先頭のマーカーより前にあるテキストは破棄される。
	// 例 (具体的なマークアップは記事側の `live` ブロックを参照):
	//   <!-- @file: Hello.svelte -->  ...Hello.svelte の中身...
	//   <!-- @file: App.svelte -->    ...App.svelte の中身...
	function splitMultiFile(
		source: string
	): Array<{ name: string; contents: string }> | null {
		const markerRE = /<!--\s*@file:\s*([^\s]+\.svelte)\s*-->\s*\n?/g;
		const markers: Array<{ name: string; index: number; length: number }> = [];
		let match: RegExpExecArray | null;
		while ((match = markerRE.exec(source)) !== null) {
			markers.push({
				name: match[1],
				index: match.index,
				length: match[0].length
			});
		}
		if (markers.length === 0) return null;

		const files: Array<{ name: string; contents: string }> = [];
		for (let i = 0; i < markers.length; i++) {
			const marker = markers[i];
			const start = marker.index + marker.length;
			const end = i + 1 < markers.length ? markers[i + 1].index : source.length;
			files.push({
				name: marker.name,
				contents: source.slice(start, end).trim() + '\n'
			});
		}
		return files;
	}

	/**
	 * Playground エントリポイント（App.svelte）が files の先頭に来るよう並び替える。
	 * App.svelte が無い場合は配列をそのまま返す。
	 */
	function ensureAppFirst(
		files: Array<{ name: string; contents: string }>
	): Array<{ name: string; contents: string }> {
		const appIdx = files.findIndex((f) => f.name === 'App.svelte');
		if (appIdx <= 0) return files;
		const reordered = [...files];
		const [app] = reordered.splice(appIdx, 1);
		reordered.unshift(app);
		return reordered;
	}

	/**
	 * オフライン時、svelte.dev 側の SW（別オリジン）がこの URL をキャッシュ済みか軽く確認する。
	 *
	 * - mode: 'no-cors' でクロスオリジンの opaque フェッチ
	 * - svelte.dev 側 SW が cache hit する → resolve（ネットワーク不要）
	 * - cache miss かつオフライン → TypeError で reject → false
	 *
	 * 同一オリジン SW 側では svelte.dev 宛は一切インターセプトしないため、
	 * この probe はブラウザのネットワークスタックまで下りていく。
	 */
	async function probePlaygroundReachable(url: string): Promise<boolean> {
		try {
			await fetch(url, {
				method: 'GET',
				mode: 'no-cors',
				cache: 'default',
				redirect: 'follow'
			});
			return true;
		} catch {
			return false;
		}
	}

	async function openPlayground() {
		if (showPlayground || loading) return;
		loading = true;
		error = undefined;

		try {
			const source = decodeCode(code);
			const multi = splitMultiFile(source);
			const url = multi
				? await buildPlaygroundEmbedUrlMulti(ensureAppFirst(multi), {
						version: svelteVersion,
						outputOnly
					})
				: await buildPlaygroundEmbedUrl(source, {
						version: svelteVersion,
						outputOnly
					});

			// オフライン時のみ、svelte.dev 側 SW キャッシュの有無を事前 probe する。
			// オンライン時は直接 iframe をマウントして svelte.dev に任せる。
			if (typeof navigator !== 'undefined' && navigator.onLine === false) {
				const reachable = await probePlaygroundReachable(url);
				if (!reachable) {
					error =
						'オフラインのため Svelte Playground（svelte.dev）に到達できません。このコード例はまだブラウザにキャッシュされていないため、オンラインに戻ってから再度お試しください。コード自体は上に表示されています。';
					iframeUrl = url; // 外部リンクだけ使えるよう保持
					return;
				}
			}

			iframeUrl = url;
			showPlayground = true;
		} catch (e) {
			console.error('Playground URL の生成に失敗しました:', e);
			error =
				'プレビューを生成できませんでした。ブラウザが CompressionStream に対応していない可能性があります。';
		} finally {
			loading = false;
		}
	}

	function closePlayground() {
		showPlayground = false;
	}

	function dismissError() {
		error = undefined;
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
		<div class="error-message" role="alert">
			<div class="error-message-body">
				{error}
			</div>
			<div class="error-message-actions">
				{#if iframeUrl}
					<a
						class="action-btn action-btn-sm"
						href={iframeUrl.replace('/embed', '')}
						target="_blank"
						rel="noopener noreferrer"
					>
						svelte.dev で開く ↗
					</a>
				{/if}
				<button
					type="button"
					class="action-btn action-btn-sm"
					onclick={dismissError}
					aria-label="メッセージを閉じる"
				>
					閉じる
				</button>
			</div>
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
			{#if !isOnline}
				<span class="offline-indicator" title="オフラインです。キャッシュ済みのコード例のみ実行できます。">
					● オフライン
				</span>
			{/if}
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
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
		background: #fef2f2;
		color: #991b1b;
		border-top: 1px solid #fecaca;
		font-size: 0.875rem;
	}

	.error-message-body {
		line-height: 1.5;
	}

	.error-message-actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.5rem;
	}

	:global(.dark) .error-message {
		background: #450a0a;
		color: #fecaca;
		border-top-color: #991b1b;
	}

	.offline-indicator {
		display: inline-flex;
		align-items: center;
		font-size: 0.75rem;
		color: #b45309;
		padding: 0 0.5rem;
		user-select: none;
	}

	:global(.dark) .offline-indicator {
		color: #fbbf24;
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

	.action-btn-sm {
		padding: 0.25rem 0.5rem;
		font-size: 0.75rem;
	}
</style>
