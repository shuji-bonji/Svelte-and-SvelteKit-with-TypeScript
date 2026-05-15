#!/usr/bin/env node
/**
 * .tmp-eslint-check/_results.json と _map.json を突合して、
 * 元 .md ファイル / ブロック単位の Markdown レポートを生成する。
 *
 * Usage:
 *   node scripts/eslint-svelte-blocks-report.mjs <output-md-path>
 */
import { readFile, writeFile } from 'node:fs/promises';
import { join, dirname, relative, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
// 入力ディレクトリ：第2引数 > ENV(IN_DIR) > デフォルト
const TMP = process.argv[3] || process.env.IN_DIR || join(ROOT, '.tmp-eslint-check');
const RESULTS = join(TMP, '_results.json');
const MAP = join(TMP, '_map.json');

const SEVERITY = { 1: 'warning', 2: 'error' };

/**
 * Svelte 5 移行で特に重要視したいルール（カテゴリ分類）
 */
const RULE_CATEGORIES = {
	compile: [
		'svelte/valid-compile' // コンパイラ警告（レガシー構文を含む）
	],
	a11y: [], // svelte/a11y-* で動的に判定
	security: ['svelte/no-at-html-tags', 'svelte/no-target-blank'],
	correctness: [], // それ以外
	style: []
};

function categorize(ruleId) {
	if (!ruleId) return 'correctness';
	if (RULE_CATEGORIES.compile.includes(ruleId)) return 'compile';
	if (ruleId.startsWith('svelte/a11y-')) return 'a11y';
	if (RULE_CATEGORIES.security.includes(ruleId)) return 'security';
	if (ruleId.startsWith('svelte/')) return 'correctness';
	return 'correctness';
}

async function main() {
	const outPath = process.argv[2] || join(ROOT, '.tmp-eslint-check/report.md');

	const [resultsRaw, mapRaw] = await Promise.all([
		readFile(RESULTS, 'utf-8'),
		readFile(MAP, 'utf-8')
	]);
	const results = JSON.parse(resultsRaw);
	const map = JSON.parse(mapRaw);

	// outFile (.tmp-eslint-check/foo.svelte) → map entry の逆引き
	const outFileToEntry = new Map();
	for (const entry of map) {
		for (const out of entry.outFiles) {
			outFileToEntry.set(out, entry);
		}
	}

	// ESLint 結果を sourceFile + blockIndex で集約
	/** @type {Map<string, { entry: any, messages: any[] }>} */
	const byBlock = new Map();
	let totalErrors = 0;
	let totalWarnings = 0;
	let filesWithIssues = 0;

	for (const fileResult of results) {
		// outFile は map では ROOT 起点の相対パス。比較も同じ起点に揃える。
		const relOut = relative(ROOT, fileResult.filePath);
		// outDir が ROOT 外の場合（outputs 配下など）は basename での突合にフォールバック
		const byBase = (() => {
			for (const [k, v] of outFileToEntry.entries()) {
				if (basename(k) === basename(fileResult.filePath)) return v;
			}
			return undefined;
		});
		const entry = outFileToEntry.get(relOut) || byBase();
		if (!entry) continue;
		if (fileResult.messages.length === 0) continue;

		const key = `${entry.sourceFile}#${entry.blockIndex}`;
		if (!byBlock.has(key)) {
			byBlock.set(key, { entry, messages: [] });
			filesWithIssues++;
		}
		const slot = byBlock.get(key);
		for (const msg of fileResult.messages) {
			slot.messages.push({ ...msg, outFile: relOut });
			if (msg.severity === 2) totalErrors++;
			else if (msg.severity === 1) totalWarnings++;
		}
	}

	// ルール別集計
	/** @type {Map<string, { count: number, severity: number, category: string }>} */
	const ruleStats = new Map();
	for (const { messages } of byBlock.values()) {
		for (const m of messages) {
			const id = m.ruleId || '(parser-error)';
			const stat = ruleStats.get(id) || {
				count: 0,
				severity: m.severity,
				category: categorize(m.ruleId)
			};
			stat.count++;
			ruleStats.set(id, stat);
		}
	}

	// sourceFile 別集計
	/** @type {Map<string, { errors: number, warnings: number, blocks: number }>} */
	const fileStats = new Map();
	for (const { entry, messages } of byBlock.values()) {
		const stat = fileStats.get(entry.sourceFile) || { errors: 0, warnings: 0, blocks: 0 };
		stat.blocks++;
		for (const m of messages) {
			if (m.severity === 2) stat.errors++;
			else if (m.severity === 1) stat.warnings++;
		}
		fileStats.set(entry.sourceFile, stat);
	}

	// === Markdown レポート生成 ===
	const totalBlocks = map.length;
	const totalSourceFiles = new Set(map.map((m) => m.sourceFile)).size;
	const okBlocks = totalBlocks - byBlock.size;

	const out = [];
	out.push('# 記事内 ```svelte コードブロックの ESLint チェック結果\n');
	out.push(`生成日時: ${new Date().toISOString()}\n`);

	out.push('## サマリー\n');
	out.push('| 指標 | 件数 |');
	out.push('|------|------|');
	out.push(`| 検査対象ファイル数（.md） | ${totalSourceFiles} |`);
	out.push(`| 検査対象ブロック数（\\\`\\\`\\\`svelte） | ${totalBlocks} |`);
	out.push(`| 問題ありブロック数 | ${byBlock.size} |`);
	out.push(`| クリーンなブロック数 | ${okBlocks} |`);
	out.push(`| Error 合計 | ${totalErrors} |`);
	out.push(`| Warning 合計 | ${totalWarnings} |`);
	out.push('');

	// ルール別集計
	out.push('## ルール別の集計\n');
	out.push('| カテゴリ | ルール | 重大度 | 件数 |');
	out.push('|----------|--------|--------|------|');
	const sortedRules = [...ruleStats.entries()].sort((a, b) => b[1].count - a[1].count);
	for (const [ruleId, stat] of sortedRules) {
		const sev = SEVERITY[stat.severity] || `sev=${stat.severity}`;
		out.push(`| ${stat.category} | \`${ruleId}\` | ${sev} | ${stat.count} |`);
	}
	out.push('');

	// ファイル別集計（エラー数の多い順）
	out.push('## ファイル別の集計（上位30件）\n');
	out.push('| ソース .md | 問題ブロック数 | Error | Warning |');
	out.push('|------------|----------------|-------|---------|');
	const sortedFiles = [...fileStats.entries()]
		.sort((a, b) => b[1].errors - a[1].errors || b[1].warnings - a[1].warnings)
		.slice(0, 30);
	for (const [file, stat] of sortedFiles) {
		out.push(`| ${file} | ${stat.blocks} | ${stat.errors} | ${stat.warnings} |`);
	}
	out.push('');

	// 詳細セクション（重要度 error 優先 → ファイル順）
	out.push('## 詳細（ブロック単位）\n');
	out.push('> ※ `Line` は元の `.md` ファイル内の行番号（コードブロックの開始行 + ブロック内の相対行 - 1）。\n');

	const sortedEntries = [...byBlock.values()].sort((a, b) => {
		const aErr = a.messages.filter((m) => m.severity === 2).length;
		const bErr = b.messages.filter((m) => m.severity === 2).length;
		if (aErr !== bErr) return bErr - aErr;
		return a.entry.sourceFile.localeCompare(b.entry.sourceFile);
	});

	let currentFile = '';
	for (const { entry, messages } of sortedEntries) {
		if (entry.sourceFile !== currentFile) {
			currentFile = entry.sourceFile;
			out.push(`\n### ${entry.sourceFile}\n`);
		}
		const errCount = messages.filter((m) => m.severity === 2).length;
		const warnCount = messages.filter((m) => m.severity === 1).length;
		const metaLabel = entry.meta ? ` \`${entry.meta}\`` : '';
		out.push(
			`#### ブロック #${entry.blockIndex}（.md L${entry.startLine}–L${entry.endLine}${metaLabel}） — Error: ${errCount}, Warning: ${warnCount}\n`
		);
		// マルチファイルかどうかも明示
		if (entry.outFiles.length > 1) {
			out.push(`<details><summary>マルチファイル: ${entry.outFiles.length} 個</summary>\n`);
			for (const f of entry.outFiles) out.push(`- \`${f}\``);
			out.push('</details>\n');
		}
		out.push('| Line (.md) | Severity | Rule | Message |');
		out.push('|------------|----------|------|---------|');
		for (const m of messages) {
			// .md 内の行番号 = block.startLine + (msg.line - 1)
			//   * msg.line は抽出ファイルの 1-indexed 行
			//   * block.startLine は .md 内の ```svelte 行番号（1-indexed）
			//   * 抽出ファイルの 1 行目 = .md の (block.startLine + 1) 行目に相当
			const mdLine =
				typeof m.line === 'number' ? entry.startLine + m.line : entry.startLine;
			const sev = SEVERITY[m.severity] || `sev=${m.severity}`;
			const rule = m.ruleId ? `\`${m.ruleId}\`` : '(parser)';
			const msg = (m.message || '').replace(/\n/g, ' ').replace(/\|/g, '\\|');
			out.push(`| ${mdLine} | ${sev} | ${rule} | ${msg} |`);
		}
		out.push('');
	}

	await writeFile(outPath, out.join('\n'));
	console.log(`Report written: ${outPath}`);
	console.log(`  errors=${totalErrors} warnings=${totalWarnings} blocks_with_issues=${byBlock.size}/${totalBlocks}`);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
