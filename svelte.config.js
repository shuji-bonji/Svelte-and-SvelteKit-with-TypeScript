import adapter from '@sveltejs/adapter-static';
import { mdsvex } from 'mdsvex';
import { createHighlighter } from 'shiki';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import { admonitionPreprocessor } from './markdown-plugins/preprocess-admonition-import.js';

/**
 * Markdown 中の内部絶対リンク `[text](/foo)` に `paths.base` を自動付与する rehype プラグイン。
 *
 * - 対象: `<a href="/...">` のうち、プロトコル相対 `//` を除く絶対パス
 * - 除外: 外部URL、`#fragment`、`mailto:`、`tel:`、既に base 付与済みのもの
 * - 目的: 記事中の `[X](/sveltekit/...)` のようなリンクを書き換え不要で GitHub Pages のサブパスに対応させる
 */
function rehypePrefixInternalLinks(options = {}) {
	const base = options.base ?? '';
	if (!base) {
		// base が空のとき（dev / ローカルビルド）は何もしない
		return () => {};
	}

	const walk = (node, visitor) => {
		visitor(node);
		if (node.children) {
			for (const child of node.children) walk(child, visitor);
		}
	};

	return (tree) => {
		walk(tree, (node) => {
			if (node.type !== 'element' || node.tagName !== 'a') return;
			const href = node.properties?.href;
			if (typeof href !== 'string') return;
			// プロトコル付き/相対パス/フラグメントのみ は対象外
			if (!href.startsWith('/')) return;
			if (href.startsWith('//')) return;
			// 既に base 付与済みならスキップ（冪等性）
			if (href === base || href.startsWith(base + '/')) return;
			node.properties.href = base + href;
		});
	};
}

// shikiハイライターの事前作成
const highlighter = await createHighlighter({
	themes: ['github-dark', 'github-light'],
	langs: [
		'svelte',
		'typescript',
		'javascript',
		'html',
		'css',
		'scss',
		'json',
		'bash',
		'sh',
		'sql',
		'yaml',
		'toml',
		'diff',
		'markdown'
	]
});

/** @type {import('mdsvex').MdsvexOptions} */
const mdsvexOptions = {
	extensions: ['.md'],
	highlight: {
		highlighter: (code, lang, meta) => {
			// mermaidコードブロック: Mermaidコンポーネントで描画
			if (lang?.trim() === 'mermaid') {
				const encodedCode = btoa(encodeURIComponent(code));
				return `<Mermaid code={"${encodedCode}"} />`;
			}

			// mdsvexは ````svelte live` を lang="svelte", meta="live" として分割する
			const isLive = meta?.includes('live');
			// ````svelte live console` のように console キーワードがあると、
			// Playground embed を output-only ではなくフルモードで開いて Console パネルを利用可能にする。
			// $inspect や console.log の出力を確認させたいコード例に使う。
			const needsConsole = meta?.includes('console');
			const actualLang = lang?.trim() || 'text';

			try {
				let html = highlighter.codeToHtml(code, {
					lang: actualLang,
					themes: { dark: 'github-dark', light: 'github-light' }
				});

				// shikiのHTMLに含まれる { } をエスケープしてSvelteの解釈を防ぐ
				html = html.replace(/\{/g, '&#123;').replace(/\}/g, '&#125;');
				// </script> と </style> をエスケープしてSvelteの誤認を防ぐ
				html = html.replace(/<\/script>/g, '&lt;/script&gt;');
				html = html.replace(/<\/style>/g, '&lt;/style&gt;');

				if (isLive) {
					// ライブコードブロック: LiveCodeコンポーネントで包む
					const encodedCode = btoa(encodeURIComponent(code));
					// console キーワードがあれば outputOnly=false（エディタ+Result+Console表示）
					const outputOnlyAttr = needsConsole ? ' outputOnly={false}' : '';
					return `<LiveCode code={"${encodedCode}"} lang="${actualLang}"${outputOnlyAttr}>{@html \`${html.replace(/`/g, '\\`')}\`}</LiveCode>`;
				}

				// 通常のコードブロック: {@html}で安全にレンダリング
				return `{@html \`${html.replace(/`/g, '\\`')}\`}`;
			} catch {
				return `<pre><code>${code}</code></pre>`;
			}
		}
	},
	rehypePlugins: [
		rehypeSlug,
		[
			rehypeAutolinkHeadings,
			{
				// 見出しの末尾にアンカーリンクを追加（クリックで該当見出しの URL をコピー可能にする）
				behavior: 'append',
				properties: {
					className: ['heading-anchor'],
					ariaHidden: 'true',
					tabIndex: -1
				},
				content: {
					type: 'element',
					tagName: 'span',
					properties: { className: ['heading-anchor-icon'] },
					children: [{ type: 'text', value: '#' }]
				}
			}
		],
		// 本番ビルド時（BASE_PATH が設定されているとき）に、Markdown 中の内部絶対リンクへ base を自動付与。
		// 例: `[X](/sveltekit/...)` → `<a href="/Svelte-and-SvelteKit-with-TypeScript/sveltekit/...">`
		// GitHub Pages のサブパス配下で 404 にならないようにする。
		[rehypePrefixInternalLinks, { base: process.env.BASE_PATH ?? '' }]
	],
	layout: {
		_: new URL('./src/lib/layouts/DocLayout.svelte', import.meta.url).pathname
	}
};

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: ['.svelte', '.md'],
	preprocess: [
		// mdsvex より前に走らせる:
		//   `:::tip[…] … :::` の container directive を `<Admonition>` に書き換え、
		//   該当ファイルに Admonition コンポーネントの import を自動注入する。
		//   変換後の Markdown を mdsvex が通常どおり処理する。
		admonitionPreprocessor(),
		mdsvex(mdsvexOptions)
	],
	compilerOptions: {
		// mdsvexが生成するコードは$$propsを使うためrunesモードを無効にする
		runes: ({ filename }) => {
			if (filename?.endsWith('.md')) return false;
			if (filename?.split(/[/\\]/).includes('node_modules')) return undefined;
			return true;
		}
	},
	kit: {
		adapter: adapter({
			pages: 'dist',
			assets: 'dist',
			fallback: '404.html',
			precompress: false,
			strict: false
		}),
		paths: {
			// 本番デプロイ時は GitHub Actions が BASE_PATH=/Svelte-and-SvelteKit-with-TypeScript を渡す。
			// dev / ローカル build では未設定なので空文字列となり、サブパスなしで動作する。
			base: process.env.BASE_PATH ?? '',
			// PWA 対応: navigateFallback で同一の index.html がどのパスからでも返されても
			// asset 解決が破綻しないよう、絶対パス（base 起点）に揃える。
			// SvelteKit 2.x デフォルトの relative: true だと、prerendered の各 HTML が
			// そのページ位置からの ../../ といった相対パスを持つため、SW navigateFallback で
			// 別パスから返された瞬間に asset 404 が発生する。
			relative: false
		},
		prerender: {
			entries: ['*'],
			crawl: true,
			handleMissingId: 'warn',
			handleHttpError: 'warn'
		}
	}
};

export default config;
