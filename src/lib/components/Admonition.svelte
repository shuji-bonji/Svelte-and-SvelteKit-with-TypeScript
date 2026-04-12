<script lang="ts">
	import type { Snippet } from 'svelte';
	import { icons } from './icons';

	interface Props {
		type?: 'note' | 'tip' | 'warning' | 'caution' | 'info';
		title?: string;
		children?: Snippet;
	}

	let { type = 'note', title, children }: Props = $props();

	const iconMap = {
		note: icons.circleAlert,
		tip: icons.lightbulb,
		warning: icons.triangleAlert,
		caution: icons.triangleAlert,
		info: icons.info
	} as const;

	const defaultTitles = {
		note: '補足',
		tip: 'ヒント',
		warning: '注意',
		caution: '注意',
		info: '情報'
	} as const;

	let icon = $derived(iconMap[type] ?? icons.circleAlert);
	let displayTitle = $derived(title ?? defaultTitles[type] ?? '補足');
</script>

<div class="admonition admonition-{type}">
	<div class="admonition-title">
		{@html icon}
		{displayTitle}
	</div>
	<div class="admonition-content">
		{#if children}{@render children()}{/if}
	</div>
</div>

<style>
	.admonition-content :global(p:first-child) { margin-top: 0; }
	.admonition-content :global(p:last-child) { margin-bottom: 0; }
</style>
