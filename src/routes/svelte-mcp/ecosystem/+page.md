---
title: エコシステム
description: Svelte MCP関連のツールとリソース - 公式MCP、関連パッケージ、MCP開発リソースの紹介
---

<script>
  import { base } from '$app/paths';
</script>

Svelte 公式 MCP 以外にも、Svelte 開発を支援するツールやリソースが存在します。

## 公式 MCP

| パッケージ                                                     | 特徴                                  |
| -------------------------------------------------------------- | ------------------------------------- |
| [`@sveltejs/mcp`](https://www.npmjs.com/package/@sveltejs/mcp) | Svelte チームが保守、最も信頼性が高い |

:::tip[推奨]
基本的には**公式の `@sveltejs/mcp`** を使用することを推奨します。
公式 MCP は Svelte チームによって保守され、常に最新の仕様に対応しています。
:::

## 関連パッケージ

Svelte MCP の内部で使用されている、または関連するパッケージです。

### svelte-eslint-parser

Svelte ファイルを解析する ESLint パーサー。`svelte-autofixer`の内部で使用されています。

```bash
npm install -D svelte-eslint-parser
```

### eslint-plugin-svelte

Svelte 向けの ESLint ルール集。MCP と組み合わせることで、より強力な静的解析が可能です。

```bash
npm install -D eslint-plugin-svelte
```

### 設定例

```javascript
// eslint.config.js
import svelte from 'eslint-plugin-svelte';
import svelteParser from 'svelte-eslint-parser';

export default [
	...svelte.configs['flat/recommended'],
	{
		files: ['**/*.svelte'],
		languageOptions: {
			parser: svelteParser,
		},
	},
];
```

## UI ライブラリとの統合

### shadcn-svelte

[shadcn-svelte](https://www.shadcn-svelte.com/) は、Radix UI をベースにした高品質なコンポーネントライブラリです。
MCP と組み合わせて使用することで、コンポーネントの使い方を LLM に質問しながら開発できます。

```bash
npx shadcn-svelte@latest init
```

### Flowbite-Svelte

[Flowbite-Svelte](https://flowbite-svelte.com/) は、Tailwind CSS ベースの UI コンポーネントライブラリです。

```bash
npm install flowbite-svelte
```

## MCP 開発に興味がある方へ

独自の MCP サーバーを開発したい場合は、以下のリソースを参照してください。

- [Model Context Protocol 公式ドキュメント](https://modelcontextprotocol.io/)
- [Svelte MCP GitHub リポジトリ](https://github.com/sveltejs/mcp) - 公式実装の参考に
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)

### 基本的な MCP サーバーの構造

```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';

const server = new Server({
	name: 'my-svelte-mcp',
	version: '1.0.0',
});

// ツールの定義
server.setRequestHandler('tools/list', async () => ({
	tools: [
		{
			name: 'my-tool',
			description: 'My custom tool',
			inputSchema: { type: 'object', properties: {} },
		},
	],
}));

// ツールの実装
server.setRequestHandler('tools/call', async (request) => {
	const { name, arguments: args } = request.params;
	// ツールのロジック
});
```

## まとめ

Svelte MCP エコシステムはまだ発展途上ですが、公式 MCP を中心に以下の方向で進化しています。

1. **公式 MCP の機能拡充** - より多くのドキュメント、より精度の高い静的解析
2. **UI ライブラリ対応** - shadcn-svelte、Flowbite 等との連携
3. **開発ツール統合** - ESLint、Prettier 等との連携強化

公式の動向は [svelte.dev/docs/mcp](https://svelte.dev/docs/mcp) で確認してください。
