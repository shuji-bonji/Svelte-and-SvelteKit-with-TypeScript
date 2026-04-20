import { readFileSync } from 'node:fs';
import { globSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { mdsvex } from 'mdsvex';
import { admonitionPreprocessor } from './markdown-plugins/preprocess-admonition-import.js';

// Find all .md files that use ::: directive syntax
const output = execSync(
	`grep -rlE '^:::(note|tip|warning|caution|info|important)' src/routes`,
	{ encoding: 'utf8' }
).trim();
const files = output.split('\n').filter(Boolean);

console.log(`Checking ${files.length} files with ::: usage\n`);

const mdsvexPre = mdsvex({ extensions: ['.md'] });
const pre = admonitionPreprocessor();

for (const file of files) {
	const content = readFileSync(file, 'utf8');
	const afterPre = pre.markup({ content, filename: file })?.code ?? content;
	let out = '';
	try {
		const r = await mdsvexPre.markup({ content: afterPre, filename: file });
		out = r?.code ?? '';
	} catch (e) {
		console.log(`✗ ${file}\n  mdsvex error: ${e.message}`);
		continue;
	}

	const openCount = (out.match(/<Admonition\s/g) || []).length;
	const closeCount = (out.match(/<\/Admonition>/g) || []).length;
	const stray = out.match(/<p>:::\w*/g) || [];
	const strayImportant = afterPre.match(/^:::important/gm) || [];
	const indentedClose = content.match(/^\s+:::\s*$/gm) || [];

	const issues = [];
	if (openCount !== closeCount) issues.push(`open=${openCount} close=${closeCount}`);
	if (stray.length > 0) issues.push(`stray ::: (${stray.length})`);
	if (strayImportant.length > 0) issues.push(`:::important (${strayImportant.length})`);
	if (indentedClose.length > 0) issues.push(`indented ::: (${indentedClose.length})`);

	if (issues.length > 0) {
		console.log(`✗ ${file.replace('src/routes/', '')}: ${issues.join(', ')}`);
	} else {
		console.log(`✓ ${file.replace('src/routes/', '')}: open=${openCount} close=${closeCount}`);
	}
}
