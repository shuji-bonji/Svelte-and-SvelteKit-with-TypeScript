<script lang="ts">
	import type { Snippet } from 'svelte';
	import { page } from '$app/state';
	import { base } from '$app/paths';
	import SeoMeta from '$lib/components/SeoMeta.svelte';

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

<SeoMeta {title} {description} type="article" />

<article class="prose max-w-none">
	{#if title && !isTopPage}
		<h1>{title}</h1>
	{/if}
	{@render children()}
</article>
