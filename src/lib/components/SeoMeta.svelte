<script lang="ts">
	import { page } from '$app/state';
	import { base } from '$app/paths';

	interface Props {
		/** ページタイトル。サイト名は自動で suffix される */
		title?: string;
		/** ページ説明 */
		description?: string;
		/** OGP の type（'website' or 'article'）。デフォルト 'article' */
		type?: 'website' | 'article';
		/** タイトルにサイト名 suffix を付けない（トップページ用） */
		noTitleSuffix?: boolean;
	}

	let {
		title,
		description,
		type = 'article',
		noTitleSuffix = false
	}: Props = $props();

	// サイト共通の定数
	const SITE_NAME = 'TypeScriptで学ぶ Svelte 5/SvelteKit';
	const OG_IMAGE_ALT = 'TypeScriptで学ぶ Svelte 5/SvelteKit 完全マスター学習ガイド';

	// OGP / Twitter Card 用の絶対 URL
	// page.url.origin は dev でも prod でも実ホストになるため、base 環境差を吸収できる
	let ogImageUrl = $derived(`${page.url.origin}${base}/og-image.png`);
	let canonicalUrl = $derived(page.url.href);

	// 表示用タイトル
	let pageTitle = $derived(
		title ? (noTitleSuffix ? title : `${title} | ${SITE_NAME}`) : SITE_NAME
	);
</script>

<svelte:head>
	<title>{pageTitle}</title>

	{#if description}
		<meta name="description" content={description} />
	{/if}

	<!-- canonical -->
	<link rel="canonical" href={canonicalUrl} />

	<!-- OGP -->
	<meta property="og:type" content={type} />
	<meta property="og:site_name" content={SITE_NAME} />
	<meta property="og:locale" content="ja_JP" />
	<meta property="og:url" content={canonicalUrl} />
	<meta property="og:title" content={pageTitle} />
	{#if description}
		<meta property="og:description" content={description} />
	{/if}
	<meta property="og:image" content={ogImageUrl} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:image:alt" content={OG_IMAGE_ALT} />

	<!-- Twitter Card -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={pageTitle} />
	{#if description}
		<meta name="twitter:description" content={description} />
	{/if}
	<meta name="twitter:image" content={ogImageUrl} />
	<meta name="twitter:image:alt" content={OG_IMAGE_ALT} />
</svelte:head>
