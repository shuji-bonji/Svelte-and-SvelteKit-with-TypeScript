<script lang="ts">
	import { onMount } from 'svelte';
	import { icons } from './icons';

	interface Props {
		/** base64 + URIエンコード済みのコード（mdsvex の ```mermaid``` ブロック経由の場合に使用） */
		code?: string;
		/** 生の mermaid コード（手動で <Mermaid diagram={...} /> と書く場合に使用） */
		diagram?: string;
		/** 生の mermaid コード（後方互換用エイリアス） */
		chart?: string;
	}

	let {
		code: encodedCode,
		diagram: encodedDiagram,
		chart: encodedChart
	}: Props = $props();

	// code / diagram / chart のいずれも受け付ける（後方互換）
	let finalEncodedCode = $derived(encodedCode ?? encodedDiagram ?? encodedChart ?? '');

	// If raw code passed (not base64 encoded), encode it
	function ensureEncoded(input: string): string {
		if (!input) return '';
		// Check if it looks like base64 (no spaces, contains typical base64 chars)
		if (/^[A-Za-z0-9+/=]+$/.test(input) && input.length > 20) {
			return input; // Already encoded
		}
		// Raw code - encode it
		return btoa(encodeURIComponent(input));
	}

	// Base64+URIエンコードされたコードをデコード
	function decodeCode(encoded: string): string {
		try {
			return decodeURIComponent(atob(encoded));
		} catch {
			return encoded;
		}
	}

	let code = $derived(decodeCode(ensureEncoded(finalEncodedCode)));
	let container: HTMLDivElement | undefined = $state();
	let error = $state('');
	let fullscreen = $state(false);
	let fullscreenContainer: HTMLDivElement | undefined = $state();
	let svgContent = $state('');
	let diagramId = `mermaid-${Math.random().toString(36).slice(2, 10)}`;

	// Mermaidのテーマ設定（ライト/ダーク共通で文字がはっきり見えるように）
	function getMermaidConfig(isDark: boolean) {
		return {
			startOnLoad: false,
			theme: 'base' as const,
			themeVariables: isDark
				? {
						// ダークモード
						primaryColor: '#3b82f6',
						primaryTextColor: '#f1f5f9',
						primaryBorderColor: '#60a5fa',
						secondaryColor: '#1e3a5f',
						secondaryTextColor: '#e2e8f0',
						secondaryBorderColor: '#475569',
						tertiaryColor: '#1e293b',
						tertiaryTextColor: '#e2e8f0',
						tertiaryBorderColor: '#475569',
						lineColor: '#94a3b8',
						textColor: '#e2e8f0',
						mainBkg: '#1e3a5f',
						nodeBorder: '#60a5fa',
						clusterBkg: '#0f172a',
						clusterBorder: '#334155',
						titleColor: '#f1f5f9',
						edgeLabelBackground: '#1e293b',
						nodeTextColor: '#f1f5f9',
						// シーケンス図
						actorBkg: '#1e3a5f',
						actorBorder: '#60a5fa',
						actorTextColor: '#f1f5f9',
						actorLineColor: '#64748b',
						signalColor: '#e2e8f0',
						signalTextColor: '#e2e8f0',
						labelBoxBkgColor: '#1e293b',
						labelBoxBorderColor: '#475569',
						labelTextColor: '#e2e8f0',
						loopTextColor: '#e2e8f0',
						noteBkgColor: '#1e3a5f',
						noteBorderColor: '#60a5fa',
						noteTextColor: '#f1f5f9',
						// フローチャート
						background: '#0f172a'
					}
				: {
						// ライトモード
						primaryColor: '#dbeafe',
						primaryTextColor: '#1e293b',
						primaryBorderColor: '#3b82f6',
						secondaryColor: '#f1f5f9',
						secondaryTextColor: '#334155',
						secondaryBorderColor: '#94a3b8',
						tertiaryColor: '#f8fafc',
						tertiaryTextColor: '#334155',
						tertiaryBorderColor: '#cbd5e1',
						lineColor: '#64748b',
						textColor: '#1e293b',
						mainBkg: '#dbeafe',
						nodeBorder: '#3b82f6',
						clusterBkg: '#f1f5f9',
						clusterBorder: '#cbd5e1',
						titleColor: '#0f172a',
						edgeLabelBackground: '#ffffff',
						nodeTextColor: '#1e293b',
						// シーケンス図
						actorBkg: '#dbeafe',
						actorBorder: '#3b82f6',
						actorTextColor: '#1e293b',
						actorLineColor: '#94a3b8',
						signalColor: '#334155',
						signalTextColor: '#1e293b',
						labelBoxBkgColor: '#f8fafc',
						labelBoxBorderColor: '#cbd5e1',
						labelTextColor: '#1e293b',
						loopTextColor: '#334155',
						noteBkgColor: '#fef3c7',
						noteBorderColor: '#f59e0b',
						noteTextColor: '#1e293b',
						// フローチャート
						background: '#ffffff'
					},
			flowchart: { useMaxWidth: true, htmlLabels: true, curve: 'basis' as const },
			sequence: { useMaxWidth: true },
			mindmap: { useMaxWidth: true }
		};
	}

	/**
	 * 色の相対輝度を計算する（WCAG 2.0 準拠）
	 * 明るい色は 1 に近く、暗い色は 0 に近い値を返す
	 */
	function getRelativeLuminance(hex: string): number {
		const rgb = hex.replace('#', '').match(/.{2}/g);
		if (!rgb || rgb.length < 3) return 0.5;

		const [r, g, b] = rgb.map((c) => {
			const val = parseInt(c, 16) / 255;
			return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
		});
		return 0.2126 * r + 0.7152 * g + 0.0722 * b;
	}

	/**
	 * CSS の color/fill 文字列から hex 値を抽出する
	 * rgb(...) 形式にも対応
	 */
	function extractHexColor(colorStr: string): string | null {
		// #rgb, #rrggbb 形式
		const hexMatch = colorStr.match(/#([0-9a-f]{3,8})\b/i);
		if (hexMatch) {
			let hex = hexMatch[1];
			if (hex.length === 3) {
				hex = hex
					.split('')
					.map((c) => c + c)
					.join('');
			}
			return `#${hex.slice(0, 6)}`;
		}
		// rgb(r, g, b) 形式
		const rgbMatch = colorStr.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
		if (rgbMatch) {
			const toHex = (n: string) => parseInt(n).toString(16).padStart(2, '0');
			return `#${toHex(rgbMatch[1])}${toHex(rgbMatch[2])}${toHex(rgbMatch[3])}`;
		}
		return null;
	}

	/**
	 * ダークモード時に SVG 内のノードテキストの可読性を自動補正する
	 *
	 * Mermaid の style 指示で明るい fill が指定されたノードは、
	 * ダークモードのテーマ文字色（明るい色）と重なって読めなくなる。
	 * レンダリング後に SVG を走査し、背景が明るいノードには暗い文字色を、
	 * 背景が暗いノードには明るい文字色を強制的に付与する。
	 */
	function fixTextContrast(svgRoot: Element) {
		// フローチャート・状態遷移図などのノード
		const nodes = svgRoot.querySelectorAll('.node, .cluster');
		for (const node of nodes) {
			const shape = node.querySelector<SVGElement>('rect, circle, ellipse, polygon, path');
			if (!shape) continue;

			// fill を取得（inline style 優先、なければ属性）
			const fillStyle = shape.style.fill || shape.getAttribute('fill') || '';
			const fillHex = extractHexColor(fillStyle);
			if (!fillHex) continue;

			const lum = getRelativeLuminance(fillHex);
			// テキスト要素にコントラスト確保の色を設定
			const textColor = lum > 0.4 ? '#1e293b' : '#f1f5f9';
			const texts = node.querySelectorAll<SVGElement>('text, .nodeLabel, .label');
			for (const t of texts) {
				t.style.setProperty('fill', textColor, 'important');
				// span 等の中のテキストも
				const spans = t.querySelectorAll<HTMLElement>('span, p, div, foreignObject *');
				for (const s of spans) {
					s.style.setProperty('color', textColor, 'important');
				}
			}
		}

		// シーケンス図のアクター
		const actors = svgRoot.querySelectorAll('.actor-man, .actor');
		for (const actor of actors) {
			if (actor.tagName === 'rect') {
				const fillHex = extractHexColor(
					(actor as SVGElement).style.fill || actor.getAttribute('fill') || ''
				);
				if (!fillHex) continue;
				const lum = getRelativeLuminance(fillHex);
				const textColor = lum > 0.4 ? '#1e293b' : '#f1f5f9';
				// 隣接するテキスト要素を探す
				const parent = actor.parentElement;
				if (parent) {
					const texts = parent.querySelectorAll<SVGElement>('text');
					for (const t of texts) {
						t.style.setProperty('fill', textColor, 'important');
					}
				}
			}
		}

		// エッジラベル（矢印上のテキスト）
		const edgeLabels = svgRoot.querySelectorAll('.edgeLabel');
		for (const label of edgeLabels) {
			const bg = label.querySelector<SVGElement>('rect, .labelBkg');
			if (!bg) continue;
			const fillHex = extractHexColor(
				(bg as SVGElement).style.fill || bg.getAttribute('fill') || ''
			);
			if (!fillHex) continue;
			const lum = getRelativeLuminance(fillHex);
			const textColor = lum > 0.4 ? '#1e293b' : '#f1f5f9';
			const texts = label.querySelectorAll<HTMLElement>('span, text, p');
			for (const t of texts) {
				t.style.setProperty('color', textColor, 'important');
				t.style.setProperty('fill', textColor, 'important');
			}
		}
	}

	async function renderDiagram() {
		if (!container || !code.trim()) return;

		try {
			const mermaid = (await import('mermaid')).default;
			const isDark = document.documentElement.classList.contains('dark');
			mermaid.initialize(getMermaidConfig(isDark));

			// 毎回ユニークなIDで再レンダリング
			const id = `${diagramId}-${Date.now()}`;
			const { svg } = await mermaid.render(id, code.trim());
			svgContent = svg;
			container.innerHTML = svg;

			// SVG内のテキストコントラストを自動補正
			const svgEl = container.querySelector('svg');
			if (svgEl) {
				fixTextContrast(svgEl);
				// 補正後のSVGを保存（全画面表示用）
				svgContent = container.innerHTML;
			}

			error = '';
		} catch (e) {
			error = e instanceof Error ? e.message : '図の描画に失敗しました';
			console.error('Mermaid render error:', e);
		}
	}

	function openFullscreen() {
		fullscreen = true;
		// 次のフレームでSVGを配置
		requestAnimationFrame(() => {
			if (fullscreenContainer && svgContent) {
				fullscreenContainer.innerHTML = svgContent;
				// SVGのサイズを全画面用に調整
				const svg = fullscreenContainer.querySelector('svg');
				if (svg) {
					svg.style.maxWidth = '100%';
					svg.style.maxHeight = '100%';
					svg.style.width = 'auto';
					svg.style.height = 'auto';
				}
			}
		});
	}

	function closeFullscreen() {
		fullscreen = false;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && fullscreen) {
			closeFullscreen();
		}
	}

	onMount(() => {
		renderDiagram();

		// ダークモード切り替えを監視して再描画
		const observer = new MutationObserver(() => {
			renderDiagram();
		});
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['class']
		});

		return () => observer.disconnect();
	});
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="mermaid-wrapper">
	{#if error}
		<div class="mermaid-error">
			<span>図の描画エラー</span>
			<pre>{error}</pre>
		</div>
	{:else}
		<div class="mermaid-container" bind:this={container}></div>
		<button class="mermaid-fullscreen-btn" onclick={openFullscreen} aria-label="全画面表示">
			{@html icons.maximize}
		</button>
	{/if}
</div>

{#if fullscreen}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="mermaid-dialog-backdrop" onclick={closeFullscreen} onkeydown={(e) => { if (e.key === 'Escape') closeFullscreen(); }} role="presentation">
		<div class="mermaid-dialog" onclick={(e) => e.stopPropagation()} role="dialog" tabindex="-1" aria-label="Mermaid図の全画面表示">
			<button class="mermaid-dialog-close" onclick={closeFullscreen} aria-label="閉じる">
				{@html icons.x}
			</button>
			<div class="mermaid-dialog-content" bind:this={fullscreenContainer}></div>
		</div>
	</div>
{/if}

<style>
	.mermaid-wrapper {
		position: relative;
		margin: 1.5rem 0;
		border: 1px solid var(--color-border);
		border-radius: 0.5rem;
		overflow: hidden;
		background: var(--color-bg);
	}

	.mermaid-container {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 1.5rem;
		min-height: 120px;
	}

	.mermaid-container :global(svg) {
		max-width: 100%;
		height: auto;
	}

	/* テキストの視認性を強制 */
	.mermaid-container :global(text),
	.mermaid-container :global(.nodeLabel),
	.mermaid-container :global(.label),
	.mermaid-container :global(.edgeLabel),
	.mermaid-container :global(.messageText),
	.mermaid-container :global(.loopText),
	.mermaid-container :global(.noteText),
	.mermaid-container :global(.actor) {
		font-family: system-ui, -apple-system, sans-serif !important;
		font-weight: 500 !important;
	}

	.mermaid-fullscreen-btn {
		position: absolute;
		top: 0.5rem;
		right: 0.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		background: var(--color-bg-secondary);
		border: 1px solid var(--color-border);
		border-radius: 0.375rem;
		color: var(--color-text-muted);
		cursor: pointer;
		opacity: 0;
		transition: opacity 0.15s, color 0.15s;
	}

	.mermaid-wrapper:hover .mermaid-fullscreen-btn {
		opacity: 1;
	}

	.mermaid-fullscreen-btn:hover {
		color: var(--color-text);
		border-color: var(--color-text-muted);
	}

	/* 全画面ダイアログ */
	.mermaid-dialog-backdrop {
		position: fixed;
		inset: 0;
		z-index: 60;
		background: rgba(0, 0, 0, 0.7);
		backdrop-filter: blur(4px);
		display: flex;
		align-items: center;
		justify-content: center;
		animation: fadeIn 0.15s ease;
	}

	.mermaid-dialog {
		position: relative;
		width: 95vw;
		height: 90vh;
		background: var(--color-bg);
		border-radius: 0.75rem;
		border: 1px solid var(--color-border);
		box-shadow: 0 25px 60px rgba(0, 0, 0, 0.4);
		overflow: hidden;
	}

	.mermaid-dialog-close {
		position: absolute;
		top: 0.75rem;
		right: 0.75rem;
		z-index: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.25rem;
		height: 2.25rem;
		background: var(--color-bg-secondary);
		border: 1px solid var(--color-border);
		border-radius: 50%;
		color: var(--color-text-muted);
		cursor: pointer;
		transition: color 0.15s, background 0.15s;
	}

	.mermaid-dialog-close:hover {
		color: var(--color-text);
		background: var(--color-bg);
	}

	.mermaid-dialog-content {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem;
		overflow: auto;
	}

	.mermaid-dialog-content :global(svg) {
		max-width: 100%;
		max-height: 100%;
	}

	.mermaid-error {
		padding: 1rem;
		color: var(--color-admonition-caution);
	}

	.mermaid-error pre {
		margin-top: 0.5rem;
		font-size: 0.75rem;
		white-space: pre-wrap;
		color: var(--color-text-muted);
	}

	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}
</style>
