import js from '@eslint/js';
import ts from 'typescript-eslint';
import svelte from 'eslint-plugin-svelte';
import svelteParser from 'svelte-eslint-parser';
import globals from 'globals';

/**
 * 記事 .md 内の ```svelte コードブロックを ESLint でチェックするための flat config。
 *
 * - 対象: `.tmp-eslint-check/` 配下に展開した抽出ファイルのみ
 *   （プロジェクト本体の .svelte / .ts には触れない）
 * - parser: svelte-eslint-parser + typescript-eslint/parser
 * - rule set: eslint-plugin-svelte の flat/recommended
 *
 * 抽出ファイルは断片コードのため、未定義変数や未使用 import は False Positive になりやすい。
 * Svelte 構文・Runes 関連の検出を主目的に、ノイズになる JS/TS ルールは緩和する。
 */
export default [
	// 検査対象を抽出ディレクトリのみに絞る
	{
		ignores: [
			'node_modules/**',
			'.svelte-kit/**',
			'dist/**',
			'build/**',
			'src/**',
			'static/**',
			'markdown-plugins/**',
			'scripts/**',
			'svelte.config.js',
			'vite.config.js',
			'eslint.config.js'
		]
	},

	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs['flat/recommended'],

	{
		// 抽出ディレクトリ（.tmp-eslint-check/ または outputs/eslint-svelte-check/ など）の
		// .svelte ファイルを対象にする。プロジェクト本体は ignores で除外済み。
		files: ['**/*.svelte'],
		languageOptions: {
			parser: svelteParser,
			parserOptions: {
				parser: ts.parser,
				// svelte-eslint-parser に Svelte コンパイラ設定を渡す。
				// `warningFilter` は svelte/valid-compile が参照し、特定の Svelte コンパイラ警告
				// （experimental_async など）を ESLint レポートから除外できる。
				svelteConfig: {
					warningFilter: (warning) => {
						// experimental.async は学習サイトで意図的に多用しているため抑制
						if (warning.code === 'experimental_async') return false;
						// a11y は記事内コード断片では完結に書くため、ESLint レポートでは抑制。
						// 実装ファイル本体（src/lib 配下等）の a11y チェックはこの設定の対象外
						// （eslint.config.js の `files` で抽出ディレクトリのみ対象にしているため）
						if (warning.code?.startsWith('a11y_')) return false;
						// サンプル CSS の未使用セレクタも記事側では許容
						if (warning.code === 'css_unused_selector') return false;
						return true;
					},
					compilerOptions: {
						experimental: { async: true }
					}
				}
			},
			globals: {
				...globals.browser,
				...globals.node
			}
		},
		rules: {
			// 抽出ブロックは断片のため、宣言系のルールはノイズになる → 緩和
			'no-undef': 'off',
			'no-unused-vars': 'off',
			'@typescript-eslint/no-unused-vars': 'off',
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-unused-expressions': 'off',
			'no-empty': 'off',
			'no-constant-condition': 'off',
			'no-self-assign': 'off',
			'no-async-promise-executor': 'off',
			'no-useless-escape': 'off',

			// Svelte 5 Runes / レガシー検出は最大限残す
			'svelte/valid-compile': 'error',
			'svelte/no-at-html-tags': 'warn',
			'svelte/no-target-blank': 'warn',
			'svelte/no-store-async': 'warn',

			// 抽出ブロックは「説明用の <a href="/about">」が大半。
			// SvelteKit 2.x の resolve() 推奨は記事内の解説で明示しているため、
			// コードブロック単位の検査では抑制する（false positive を避ける）。
			'svelte/no-navigation-without-resolve': 'off'
		}
	}
];
