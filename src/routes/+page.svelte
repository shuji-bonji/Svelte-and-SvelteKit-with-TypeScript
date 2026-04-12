<script lang="ts">
	import { base } from '$app/paths';

	const features = [
		{ title: 'Svelte 5 Runes', description: '$state, $derived, $effect など最新のRunesシステムを完全解説', icon: '✨' },
		{ title: 'TypeScript完全対応', description: 'すべてのコード例でTypeScriptを使用し、型安全な開発を実現', icon: '🛡️' },
		{ title: '実践的な内容', description: 'ビジネスレベルのアプリケーション開発に必要な知識を網羅', icon: '🏗️' },
		{ title: 'Svelte MCP対応', description: '公式MCPサーバーでAI支援開発を加速', icon: '🤖' }
	];
</script>

<svelte:head>
	<title>TypeScriptで学ぶ Svelte 5/SvelteKit</title>
	<meta name="description" content="Svelte5とSvelteKitをTypeScriptで学ぶ日本語完全ガイド。Runesシステム、SSR/SSG実装、型安全なコンポーネント開発を実践コードで解説" />
</svelte:head>

<!-- ヒーロー -->
<section class="hero">
	<div class="hero-inner">
		<img src="{base}/svelteAndTypescript.png" alt="Svelte & TypeScript" class="hero-image" />
		<h1 class="hero-title">
			TypeScriptで学ぶ<br />
			<span class="hero-highlight">Svelte 5 / SvelteKit</span>
		</h1>
		<p class="hero-tagline">
			日本語による TypeScript 中心の Svelte 5 / SvelteKit 完全マスター学習ガイド
		</p>
		<div class="hero-actions">
			<a href="{base}/introduction/" class="btn-primary">学習を始める →</a>
			<a href="https://github.com/shuji-bonji/Svelte-and-SvelteKit-with-TypeScript" class="btn-secondary" target="_blank" rel="noopener">GitHub</a>
		</div>
	</div>
</section>

<!-- 特徴 -->
<section class="container features-section">
	<div class="features-grid">
		{#each features as feature}
			<div class="feature-card">
				<span class="feature-icon">{feature.icon}</span>
				<h3 class="feature-title">{feature.title}</h3>
				<p class="feature-desc">{feature.description}</p>
			</div>
		{/each}
	</div>
</section>

<!-- フッター -->
<footer class="site-footer">
	<div class="footer-inner">
		<p class="footer-license">
			このサイトのコンテンツは
			<a href="https://creativecommons.org/licenses/by-sa/4.0/deed.ja" target="_blank" rel="noopener">CC BY-SA 4.0</a>
			ライセンスの下で提供されています。コードサンプルは
			<a href="https://opensource.org/licenses/MIT" target="_blank" rel="noopener">MIT License</a>
			です。
		</p>
		<p class="footer-meta">
			Built with <a href="https://svelte.dev" target="_blank" rel="noopener">SvelteKit</a>
			&middot;
			<a href="https://github.com/shuji-bonji/Svelte-and-SvelteKit-with-TypeScript" target="_blank" rel="noopener">ソースコード</a>
		</p>
	</div>
</footer>

<style>
	/* ====== ヒーロー ====== */
	.hero {
		text-align: center;
		padding: 5rem 1.5rem 4rem;
		background:
			radial-gradient(ellipse 80% 60% at 50% 0%, color-mix(in srgb, var(--color-primary) 6%, transparent), transparent);
	}
	.hero-inner {
		max-width: 42rem;
		margin: 0 auto;
	}
	.hero-image {
		width: 160px;
		height: auto;
		margin: 0 auto 2rem;
		display: block;
		filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.1));
	}
	.hero-title {
		font-size: 2.5rem;
		font-weight: 800;
		line-height: 1.25;
		color: var(--color-text);
		margin: 0 0 1rem;
		letter-spacing: -0.02em;
	}
	.hero-highlight {
		background: linear-gradient(135deg, #ff3e00 0%, #ff8c5a 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}
	.hero-tagline {
		color: var(--color-text-muted);
		font-size: 1.15rem;
		margin: 0 0 2rem;
		line-height: 1.7;
	}
	.hero-actions {
		display: flex;
		gap: 0.75rem;
		justify-content: center;
		flex-wrap: wrap;
	}
	.btn-primary {
		display: inline-block;
		padding: 0.75rem 2rem;
		background: var(--color-primary);
		color: #fff;
		border-radius: 2rem;
		font-weight: 600;
		font-size: 0.95rem;
		text-decoration: none;
		transition: background 0.15s, transform 0.15s, box-shadow 0.15s;
	}
	.btn-primary:hover {
		background: var(--color-primary-light);
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(255, 62, 0, 0.25);
	}
	.btn-secondary {
		display: inline-block;
		padding: 0.75rem 2rem;
		border: 1px solid var(--color-border);
		color: var(--color-text-muted);
		border-radius: 2rem;
		font-weight: 600;
		font-size: 0.95rem;
		text-decoration: none;
		transition: color 0.15s, border-color 0.15s;
	}
	.btn-secondary:hover {
		color: var(--color-text);
		border-color: var(--color-text-muted);
	}

	/* ====== 特徴セクション ====== */
	.container {
		max-width: 64rem;
		margin: 0 auto;
		padding: 0 1.5rem;
	}
	.features-section {
		padding: 3rem 1.5rem 4rem;
	}
	.features-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 1.5rem;
	}
	.feature-card {
		padding: 1.5rem;
		border-radius: 0.75rem;
		background: var(--color-bg-secondary);
		border: 1px solid var(--color-border);
		transition: box-shadow 0.15s, transform 0.15s;
	}
	.feature-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
	}
	.feature-icon {
		font-size: 1.5rem;
		display: block;
		margin-bottom: 0.75rem;
	}
	.feature-title {
		font-size: 1rem;
		font-weight: 700;
		color: var(--color-text);
		margin: 0 0 0.5rem;
	}
	.feature-desc {
		font-size: 0.875rem;
		color: var(--color-text-muted);
		line-height: 1.6;
		margin: 0;
	}

	/* ====== フッター ====== */
	.site-footer {
		border-top: 1px solid var(--color-border);
		padding: 2rem 1.5rem;
		margin-top: 2rem;
		text-align: center;
	}
	.footer-inner {
		max-width: 42rem;
		margin: 0 auto;
	}
	.footer-license {
		font-size: 0.8125rem;
		color: var(--color-text-muted);
		margin: 0 0 0.5rem;
		line-height: 1.6;
	}
	.footer-license a {
		color: var(--color-text-muted);
		text-decoration: underline;
		text-underline-offset: 2px;
	}
	.footer-license a:hover {
		color: var(--color-text);
	}
	.footer-meta {
		font-size: 0.75rem;
		color: var(--color-text-muted);
		margin: 0;
		opacity: 0.7;
	}
	.footer-meta a {
		color: var(--color-text-muted);
		text-decoration: underline;
		text-underline-offset: 2px;
	}
	.footer-meta a:hover {
		color: var(--color-text);
	}

	/* ====== レスポンシブ ====== */
	@media (max-width: 768px) {
		.hero { padding: 3rem 1rem 2.5rem; }
		.hero-title { font-size: 1.75rem; }
		.hero-tagline { font-size: 1rem; }
		.features-grid { grid-template-columns: repeat(2, 1fr); gap: 1rem; }
		.features-section { padding: 2rem 1rem 3rem; }
	}
	@media (max-width: 480px) {
		.features-grid { grid-template-columns: 1fr; }
	}
</style>
