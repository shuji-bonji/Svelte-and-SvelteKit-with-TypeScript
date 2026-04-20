import { readFileSync } from 'node:fs';
import { admonitionPreprocessor } from './markdown-plugins/preprocess-admonition-import.js';

const file = './src/routes/svelte/runes/derived/+page.md';
const content = readFileSync(file, 'utf8');
const pre = admonitionPreprocessor();
const afterPre = pre.markup({ content, filename: file })?.code ?? content;

const lines = afterPre.split('\n');
lines.forEach((l, i) => {
	if (l.includes('Admonition') || l.includes(':::')) {
		console.log(`[${i + 1}]`, l.slice(0, 120));
	}
});
