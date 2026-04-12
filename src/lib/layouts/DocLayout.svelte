<script lang="ts">
	import type { Snippet } from 'svelte';
	import { page } from '$app/state';
	import { base } from '$app/paths';

	// mdsvexがフロントマターから渡すメタデータ
	interface Props {
		title?: string;
		description?: string;
		children: Snippet;
	}

	let { title, description, children }: Props = $props();

	// トップページではh1を自動表示しない（hero内に独自タイトルがあるため）
	let isTopPage = $derived(page.url.pathname === `${base}/` || page.url.pathname === base);
</script>

<svelte:head>
	{#if title && isTopPage}
		<title>{title}</title>
	{:else if title}
		<title>{title} | TypeScriptで学ぶ Svelte 5/SvelteKit</title>
	{/if}
	{#if description}
		<meta name="description" content={description} />
		<meta property="og:description" content={description} />
	{/if}
	{#if title}
		<meta property="og:title" content={title} />
	{/if}
	<meta property="og:type" content="article" />
	<meta property="og:image" content="{base}/svelteAndTypescript.png" />
</svelte:head>

<article class="prose max-w-none">
	{#if title && !isTopPage}
		<h1>{title}</h1>
	{/if}
	{@render children()}
</article>
