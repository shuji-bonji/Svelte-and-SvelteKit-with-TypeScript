/**
 * Svelte preprocessor:
 *
 *     :::tip[タイトル]
 *     本文（Markdown が使える）
 *     :::
 *
 * のような container directive を `<Admonition type="tip" title="タイトル">…</Admonition>`
 * に書き換え、必要なファイルに Admonition コンポーネントの import を自動注入する。
 *
 * ## なぜ remark プラグインではなく preprocessor で行うか
 * mdsvex 0.12.x は内部で remark-parse v8（古い unified ecosystem）を bundling している。
 * 一方 `remark-directive` は v1 時点で remark 13+ の警告を出し、v4 は unified 11 を要求する。
 * これらは mdsvex 0.12.x とは互換がないため、preprocessor 段階（mdsvex より前）の
 * 行ベースのスキャンで直接 `<Admonition>` に書き換える方式を採用している。
 *
 * ## 変換ルール
 * - 開きタグ: `^:::(note|tip|warning|caution|info)(\[title\])?\s*$`
 * - 閉じタグ: `^:::\s*$`
 * - スタックベースで同種ネストも正しく対応（対応する `:::` が来たときに pop）。
 * - コードフェンス（``` や ~~~）の中は対象外（`:::` の例示が壊れないよう）。
 * - 開閉タグの前後に空行を挿入し、内側の内容を mdsvex が Markdown として解釈できるようにする
 *   （`<Admonition>` 直後に空行がない場合、mdsvex は内側を HTML そのものとみなす）。
 *
 * ## 属性エスケープ
 * title に含まれる特殊文字は Svelte 属性値として安全な形式に変換する:
 *   `&` → `&amp;`, `"` → `&quot;`, `{` → `&#123;`, `}` → `&#125;`
 * （`{…}` は Svelte の式として解釈されてしまうのを防ぐ）
 *
 * ## 冪等性
 * 既に `import Admonition from` を含むファイルには import を重複注入しない。
 * 既に `<Admonition>` が書かれているファイルでも、`:::` が 1 つでも残っていれば
 * import を差し込む（ただし重複チェックは機能する）。
 *
 * @returns {import('svelte/compiler').PreprocessorGroup}
 */
export function admonitionPreprocessor() {
	const ADMONITION_TYPES = ['note', 'tip', 'warning', 'caution', 'info'];
	// 開き/閉じとも、リスト継続などで生じるインデント（行頭の空白）を許容する。
	// `:::` の開閉はブロックレベルの記法なので、行内での誤検出リスクは小さい。
	// コードフェンス内は別途 transformDirectives 側で除外している。
	const OPEN_RE = new RegExp(
		`^\\s*:::(${ADMONITION_TYPES.join('|')})(?:\\[([^\\]]*)\\])?\\s*$`
	);
	const CLOSE_RE = /^\s*:::\s*$/;
	const IMPORT_STMT = `import Admonition from '$lib/components/Admonition.svelte';`;

	return {
		name: 'admonition',
		markup({ content, filename }) {
			if (!filename?.endsWith('.md')) return;

			// 早期リターン: `:::` 自体が登場しないなら何もしない（.md の 9 割はこれ）
			if (!content.includes(':::')) return;

			const { code: transformed, hasAdmonition } = transformDirectives(
				content,
				OPEN_RE,
				CLOSE_RE
			);

			if (!hasAdmonition) return;

			// Admonition の import を注入（既にあればスキップ）
			const finalCode = injectImport(transformed, IMPORT_STMT);
			return { code: finalCode };
		}
	};
}

/**
 * コードフェンスを避けつつ、`:::type[title] … :::` を `<Admonition>` に書き換える。
 * @param {string} content
 * @param {RegExp} openRe
 * @param {RegExp} closeRe
 * @returns {{ code: string, hasAdmonition: boolean }}
 */
function transformDirectives(content, openRe, closeRe) {
	const lines = content.split('\n');
	const out = [];
	/** @type {{ char: '`' | '~', len: number } | null} */
	let fence = null;
	/** @type {Array<'open'>} */
	const stack = [];
	let hasAdmonition = false;

	for (const line of lines) {
		if (fence) {
			out.push(line);
			// フェンスの閉じを検出
			const m = line.match(/^\s*(`{3,}|~{3,})\s*$/);
			if (m && m[1][0] === fence.char && m[1].length >= fence.len) {
				fence = null;
			}
			continue;
		}

		// フェンスの開始を検出
		const fenceOpen = line.match(/^\s*(`{3,}|~{3,})/);
		if (fenceOpen) {
			fence = { char: /** @type {'`' | '~'} */ (fenceOpen[1][0]), len: fenceOpen[1].length };
			out.push(line);
			continue;
		}

		// 開きディレクティブ
		const openMatch = line.match(openRe);
		if (openMatch) {
			const type = openMatch[1];
			const title = openMatch[2];
			const escTitle = title ? escapeAttr(title) : undefined;
			const tag = escTitle
				? `<Admonition type="${type}" title="${escTitle}">`
				: `<Admonition type="${type}">`;
			// 前後に空行を入れ、mdsvex が内側を Markdown として解釈できるようにする
			out.push('');
			out.push(tag);
			out.push('');
			stack.push('open');
			hasAdmonition = true;
			continue;
		}

		// 閉じディレクティブ（スタックに対応する open があるときのみ閉じる）
		if (closeRe.test(line) && stack.length > 0) {
			stack.pop();
			out.push('');
			out.push('</Admonition>');
			out.push('');
			continue;
		}

		out.push(line);
	}

	return { code: out.join('\n'), hasAdmonition };
}

/**
 * Admonition の import を `<script>` に注入する。既存の `<script>` があればその先頭に、
 * 無ければ frontmatter 直後（無ければ先頭）に新規 `<script>` ブロックを追加する。
 * 既に `import Admonition from` を含む場合は何もしない。
 *
 * **注意**: Markdown 本文の code fence（``` や ~~~）の中に登場する `<script>` や
 * `import Admonition from` は、あくまで表示用の例示コードなので判定に使わない。
 * コードフェンス外（= Svelte コンポーネントとしての実体）のみを対象にスキャンする。
 *
 * @param {string} content
 * @param {string} importStmt
 * @returns {string}
 */
function injectImport(content, importStmt) {
	const outside = stripCodeFences(content);
	if (/import\s+Admonition\s+from/.test(outside)) return content;

	const scriptOpen = findFirstScriptOutsideFences(content);
	if (scriptOpen) {
		const insertAt = scriptOpen.index + scriptOpen.length;
		return content.slice(0, insertAt) + `\n  ${importStmt}` + content.slice(insertAt);
	}

	const frontmatter = content.match(/^---\n[\s\S]*?\n---\n/);
	const insertAt = frontmatter ? frontmatter[0].length : 0;
	const block = `\n<script>\n  ${importStmt}\n</script>\n\n`;
	return content.slice(0, insertAt) + block + content.slice(insertAt);
}

/**
 * Markdown 本文から code fence（``` / ~~~）の中身を取り除いた文字列を返す。
 * フェンスの開閉タグとインナー行は同数の空行に置き換えるので、行数は変わらない。
 * @param {string} content
 * @returns {string}
 */
function stripCodeFences(content) {
	const lines = content.split('\n');
	/** @type {{ char: '`' | '~', len: number } | null} */
	let fence = null;
	const out = [];
	for (const line of lines) {
		if (fence) {
			const m = line.match(/^\s*(`{3,}|~{3,})\s*$/);
			if (m && m[1][0] === fence.char && m[1].length >= fence.len) {
				fence = null;
			}
			out.push('');
			continue;
		}
		const fenceOpen = line.match(/^\s*(`{3,}|~{3,})/);
		if (fenceOpen) {
			fence = { char: /** @type {'`' | '~'} */ (fenceOpen[1][0]), len: fenceOpen[1].length };
			out.push('');
			continue;
		}
		out.push(line);
	}
	return out.join('\n');
}

/**
 * code fence の外にある最初の `<script ...>` 開きタグの位置と全体長を返す。
 * 見つからなければ null。
 * @param {string} content
 * @returns {{ index: number, length: number } | null}
 */
function findFirstScriptOutsideFences(content) {
	const outside = stripCodeFences(content);
	const m = outside.match(/<script(\s[^>]*)?>/);
	if (!m || typeof m.index !== 'number') return null;
	return { index: m.index, length: m[0].length };
}

/**
 * Svelte の属性値として安全な形式にエスケープする。
 * `{…}` は Svelte の式として解釈されるため、必ず文字参照化する。
 * @param {string} s
 * @returns {string}
 */
function escapeAttr(s) {
	return s
		.replace(/&/g, '&amp;')
		.replace(/"/g, '&quot;')
		.replace(/\{/g, '&#123;')
		.replace(/\}/g, '&#125;');
}
