import { readFileSync } from 'node:fs';
import { mdsvex } from 'mdsvex';
import { admonitionPreprocessor } from './markdown-plugins/preprocess-admonition-import.js';

const file = './src/routes/svelte/runes/derived/+page.md';
const content = readFileSync(file, 'utf8');
const pre = admonitionPreprocessor();
const afterPre = pre.markup({ content, filename: file })?.code ?? content;

// Also check after preprocessor
const lines = afterPre.split('\n');
let preOpen = 0, preClose = 0;
lines.forEach((l, i) => {
	if (/<Admonition[\s>]/.test(l)) preOpen++;
	if (/<\/Admonition>/.test(l)) preClose++;
});
console.log(`After preprocessor: open=${preOpen} close=${preClose}`);

const mdsvexPre = mdsvex({ extensions: ['.md'] });
const r = await mdsvexPre.markup({ content: afterPre, filename: file });
const out = r?.code ?? '';
const openCount = (out.match(/<Admonition\s/g) || []).length;
const closeCount = (out.match(/<\/Admonition>/g) || []).length;
console.log(`After mdsvex: open=${openCount} close=${closeCount}`);

// Find lines in mdsvex output containing Admonition
const outLines = out.split('\n');
outLines.forEach((l, i) => {
	if (l.includes('Admonition')) {
		console.log(`[${i + 1}]`, l.slice(0, 120));
	}
});
