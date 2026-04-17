import adapter from '@sveltejs/adapter-static';
import { mdsvex } from 'mdsvex';
import { createHighlighter } from 'shiki';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

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
		]
	],
	layout: {
		_: new URL('./src/lib/layouts/DocLayout.svelte', import.meta.url).pathname
	}
};

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: ['.svelte', '.md'],
	preprocess: [mdsvex(mdsvexOptions)],
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
		// paths: { base: '/Svelte-and-SvelteKit-with-TypeScript' },  // デプロイ時に有効化
		prerender: {
			entries: ['*'],
			crawl: true,
			handleMissingId: 'warn',
			handleHttpError: 'warn'
		}
	}
};

export default config;
