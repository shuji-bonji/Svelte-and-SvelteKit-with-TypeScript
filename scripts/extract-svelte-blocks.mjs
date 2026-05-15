#!/usr/bin/env node
/**
 * src/routes 配下の .md ファイルから ```svelte コードブロックを抽出し、
 * .tmp-eslint-check/ 配下に個別 .svelte ファイルとして展開する。
 *
 * - マルチファイル例（<!-- @file: Foo.svelte --> マーカー）はファイル分割
 * - 元ファイルとの行番号マッピングを _map.json に出力
 *
 * Usage:
 *   node scripts/extract-svelte-blocks.mjs
 */
import { readdir, readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const ROUTES = join(ROOT, 'src/routes');
// 出力先：第1引数 > ENV(OUT_DIR) > デフォルト
const OUT = process.argv[2] || process.env.OUT_DIR || join(ROOT, '.tmp-eslint-check');
const MAP_FILE = join(OUT, '_map.json');

/** .md ファイルを再帰的に収集 */
async function* walkMarkdown(dir) {
	const entries = await readdir(dir, { withFileTypes: true });
	for (const entry of entries) {
		const full = join(dir, entry.name);
		if (entry.isDirectory()) {
			yield* walkMarkdown(full);
		} else if (entry.name.endsWith('.md')) {
			yield full;
		}
	}
}

/**
 * Markdown 文字列から ```svelte ... ``` ブロックを抽出。
 * - フロントマター内 (`---` で囲まれた領域) は除外
 * - meta（` ```svelte live console` の "live console" 部分）も保持
 *
 * @returns Array<{ meta: string, content: string, startLine: number, endLine: number }>
 */
function extractSvelteBlocks(content) {
	const lines = content.split('\n');
	const blocks = [];
	let inFrontmatter = false;
	let frontmatterEnded = false;
	let inBlock = false;
	let current = null;

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];

		// フロントマター判定（先頭の --- ... ---）
		if (!frontmatterEnded) {
			if (i === 0 && line === '---') {
				inFrontmatter = true;
				continue;
			}
			if (inFrontmatter) {
				if (line === '---') {
					inFrontmatter = false;
					frontmatterEnded = true;
				}
				continue;
			}
			frontmatterEnded = true;
		}

		if (!inBlock) {
			const m = line.match(/^```svelte(?:\s+(.*))?$/);
			if (m) {
				inBlock = true;
				current = {
					meta: (m[1] || '').trim(),
					content: [],
					startLine: i + 1, // 1-indexed
					endLine: -1
				};
			}
		} else {
			if (line.match(/^```\s*$/)) {
				current.endLine = i + 1;
				blocks.push(current);
				current = null;
				inBlock = false;
			} else {
				current.content.push(line);
			}
		}
	}

	return blocks;
}

/**
 * `<!-- @file: Foo.svelte -->` マーカーでマルチファイル分割。
 * マーカーが無ければ null を返す。
 */
function splitMultiFile(content) {
	const MARKER = /^<!--\s*@file:\s*(.+\.svelte)\s*-->$/;
	const lines = content.split('\n');
	const files = {};
	let currentFile = null;
	let buffer = [];

	for (const line of lines) {
		const m = line.match(MARKER);
		if (m) {
			if (currentFile) {
				files[currentFile] = buffer.join('\n');
			}
			currentFile = m[1];
			buffer = [];
		} else if (currentFile) {
			buffer.push(line);
		}
	}
	if (currentFile) {
		files[currentFile] = buffer.join('\n');
	}
	return Object.keys(files).length > 0 ? files : null;
}

function safeBaseName(relativeMdPath, blockIndex) {
	return (
		relativeMdPath.replace(/[\\/]/g, '__').replace(/\.md$/, '') +
		`__block${String(blockIndex).padStart(3, '0')}`
	);
}

async function main() {
	if (existsSync(OUT)) {
		// FUSE マウント越しだと EPERM が出ることがあるため force: true
		try {
			await rm(OUT, { recursive: true, force: true });
		} catch (err) {
			console.warn(`[warn] rm failed, will overwrite in place: ${err.message}`);
		}
	}
	await mkdir(OUT, { recursive: true });

	const map = [];
	let totalBlocks = 0;
	let totalFiles = 0;

	for await (const mdFile of walkMarkdown(ROUTES)) {
		const relMd = relative(ROOT, mdFile);
		const content = await readFile(mdFile, 'utf-8');
		const blocks = extractSvelteBlocks(content);
		if (blocks.length === 0) continue;
		totalFiles++;

		for (let i = 0; i < blocks.length; i++) {
			const block = blocks[i];
			totalBlocks++;
			// meta に `bad` が含まれる場合は「意図的アンチパターン例」として
			// ESLint 検査の対象外とする（記事側で「悪い例」を見せる用途）。
			// 例: ` ```svelte bad`、` ```svelte live bad`
			//
			// FUSE 経由で旧ファイルを削除できない環境を考慮し、
			// 抽出ファイル自体は空 .svelte で「上書き」する（ESLint は通るが何も検出しない）。
			const metaTokens = block.meta.split(/\s+/).filter(Boolean);
			const isBad = metaTokens.includes('bad');
			const base = safeBaseName(relMd, i);
			const blockContent = isBad ? '<!-- skipped: meta=bad -->\n' : block.content.join('\n');
			const multi = isBad ? null : splitMultiFile(blockContent);

			const outFiles = [];
			if (multi) {
				for (const [fname, fcontent] of Object.entries(multi)) {
					const outPath = join(OUT, `${base}__${fname}`);
					await writeFile(outPath, fcontent + (fcontent.endsWith('\n') ? '' : '\n'));
					outFiles.push(relative(ROOT, outPath));
				}
			} else {
				const outPath = join(OUT, `${base}.svelte`);
				await writeFile(outPath, blockContent + (blockContent.endsWith('\n') ? '' : '\n'));
				outFiles.push(relative(ROOT, outPath));
			}

			map.push({
				sourceFile: relMd,
				blockIndex: i,
				startLine: block.startLine,
				endLine: block.endLine,
				meta: block.meta,
				outFiles,
				skipped: isBad
			});
		}
	}

	await writeFile(MAP_FILE, JSON.stringify(map, null, 2));
	console.log(`Extracted ${totalBlocks} svelte blocks from ${totalFiles} markdown files.`);
	console.log(`Output: ${relative(ROOT, OUT)}`);
	console.log(`Map: ${relative(ROOT, MAP_FILE)}`);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
