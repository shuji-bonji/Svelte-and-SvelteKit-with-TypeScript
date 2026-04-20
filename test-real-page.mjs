import { readFileSync } from 'node:fs';
import { mdsvex } from 'mdsvex';
import { admonitionPreprocessor } from './markdown-plugins/preprocess-admonition-import.js';

const files = [
	'./src/routes/introduction/setup/+page.md',
	'./src/routes/svelte/runes/derived/+page.md',
	'./src/routes/svelte/basics/component-lifecycle/+page.md'
];

for (const file of files) {
	console.log(`\n========== ${file} ==========`);
	const content = readFileSync(file, 'utf8');

	const pre = admonitionPreprocessor();
	const afterPre = pre.markup({ content, filename: file })?.code ?? content;

	// Admonition を含む行だけ表示してチェック
	const lines = afterPre.split('\n');
	for (let i = 0; i < lines.length; i++) {
		if (lines[i].includes('Admonition') || lines[i].startsWith(':::')) {
			const start = Math.max(0, i - 1);
			const end = Math.min(lines.length, i + 2);
			console.log(`[${i + 1}]`, lines.slice(start, end).join(' / '));
		}
	}

	// Run through mdsvex to make sure it doesn't error
	const mdsvexPre = mdsvex({ extensions: ['.md'] });
	try {
		const result = await mdsvexPre.markup({ content: afterPre, filename: file });
		const out = result?.code ?? '';
		// Check: no bare :::tip in the output
		if (out.match(/<p>:::\w+/)) {
			console.error(`  ✗ mdsvex output still contains raw :::  →`);
			console.error(out.match(/<p>:::\w+[^<]*<\/p>/g)?.slice(0, 3));
		} else {
			console.log(`  ✓ mdsvex output clean (no raw :::  paragraphs)`);
		}
		// Check: number of <Admonition occurrences
		const openCount = (out.match(/<Admonition\s/g) || []).length;
		const closeCount = (out.match(/<\/Admonition>/g) || []).length;
		console.log(`  Admonition open: ${openCount}, close: ${closeCount}`);
	} catch (e) {
		console.error(`  ✗ mdsvex threw:`, e.message);
	}
}
