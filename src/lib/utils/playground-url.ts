/**
 * svelte.dev/playground/[id]/embed 用の URL エンコーダー。
 *
 * 公式実装 (`apps/svelte.dev/src/routes/(authed)/playground/[id]/gzip.js`) と
 * バイト単位で同一の結果を生成する。
 *
 * 参考:
 *   - embed route : https://svelte.dev/playground/hello-world/embed
 *   - 公式 gzip.js : https://github.com/sveltejs/svelte.dev/blob/main/apps/svelte.dev/src/routes/(authed)/playground/%5Bid%5D/gzip.js
 */

/** Playground が期待する単一ファイル表現 */
export interface PlaygroundFile {
	type: 'file';
	name: string; // 例: 'App.svelte'
	basename: string; // 同上
	contents: string; // 実コード
	text: true;
}

/** URL ハッシュに gzip+base64url エンコードされて入る JSON ペイロード */
export interface PlaygroundPayload {
	files: PlaygroundFile[];
	tailwind?: boolean;
}

export interface PlaygroundUrlOptions {
	/** Svelte のバージョン。省略時は 'latest' */
	version?: string;
	/** true にするとプレビューのみ表示（エディタ非表示） */
	outputOnly?: boolean;
	/** 埋め込みベースとする [id]。通常 'hello-world' でOK */
	baseId?: string;
	/** tailwind を有効化するかどうか */
	tailwind?: boolean;
}

/**
 * 文字列を gzip → base64url エンコードする。
 * svelte.dev 公式の `compress_and_encode_text` と同等の出力。
 *
 * CompressionStream API は Chrome 80+ / Firefox 113+ / Safari 16.4+ 対応。
 */
export async function compressAndEncodeText(input: string): Promise<string> {
	const reader = new Blob([input])
		.stream()
		.pipeThrough(new CompressionStream('gzip'))
		.getReader();

	let buffer = '';
	// eslint-disable-next-line no-constant-condition
	while (true) {
		const { done, value } = await reader.read();
		if (done) {
			reader.releaseLock();
			// URL セーフな base64 に変換（末尾 `=` を除去）
			return btoa(buffer).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
		}
		for (let i = 0; i < value.length; i++) {
			// utf-8 デコードを経ると btoa が拒否するため、バイト単位で文字列化する
			buffer += String.fromCharCode(value[i]);
		}
	}
}

/**
 * Svelte 単一コンポーネントのコードから、
 * svelte.dev/playground の埋め込み用 iframe URL を生成する。
 *
 * @example
 * const url = await buildPlaygroundEmbedUrl('<script>let count = $state(0)</script>', {
 *   version: '5.55.2'
 * });
 * // → 'https://svelte.dev/playground/hello-world/embed?version=5.55.2#<gzip-base64url>'
 */
export async function buildPlaygroundEmbedUrl(
	source: string,
	options: PlaygroundUrlOptions = {}
): Promise<string> {
	const {
		version = 'latest',
		outputOnly = false,
		baseId = 'hello-world',
		tailwind = false
	} = options;

	const payload: PlaygroundPayload = {
		files: [
			{
				type: 'file',
				name: 'App.svelte',
				basename: 'App.svelte',
				contents: source,
				text: true
			}
		],
		tailwind
	};

	const encoded = await compressAndEncodeText(JSON.stringify(payload));

	const params = new URLSearchParams();
	if (version && version !== 'latest') params.set('version', version);
	if (outputOnly) params.set('output-only', '');

	const query = params.toString();
	const queryString = query ? `?${query}` : '';

	return `https://svelte.dev/playground/${baseId}/embed${queryString}#${encoded}`;
}
