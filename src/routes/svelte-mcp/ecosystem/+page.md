---
title: エコシステム
description: Svelte MCP関連のツールとリソース - 公式MCP、Svelte Plugin、Subagent、Skills、ESLint、UIライブラリ、MCP開発リソース
---

<script>
	import Admonition from '$lib/components/Admonition.svelte';
  import { base } from '$app/paths';
</script>

Svelte 公式 MCP 以外にも、Svelte 開発を支援するツールやリソースが存在します。

## 公式 MCP

| パッケージ                                                     | 特徴                                  |
| -------------------------------------------------------------- | ------------------------------------- |
| [`@sveltejs/mcp`](https://www.npmjs.com/package/@sveltejs/mcp) | Svelte チームが保守、最も信頼性が高い |

<Admonition type="tip" title="推奨">

基本的には**公式の `@sveltejs/mcp`** を使用することを推奨します。
公式 MCP は Svelte チームによって保守され、常に最新の仕様に対応しています。

</Admonition>

## 公式 Claude Code 統合

Svelte チームは MCP サーバー単体に加えて、**Claude Code Marketplace に公式の `svelte` プラグイン**を公開しています（リポジトリ：[sveltejs/ai-tools](https://github.com/sveltejs/ai-tools)）。プラグインには Remote MCP サーバー、Svelte 専門の **Subagent**、Svelte 5 コーディング規約をまとめた **Skills** がまとめてバンドルされており、ひとつのコマンドでまとめてセットアップできます。

### Svelte Plugin（Claude Code Marketplace）

Claude Code 上で以下を実行すると、Marketplace から Svelte プラグインを取得できます。

```bash
# Marketplace を追加
/plugin marketplace add sveltejs/ai-tools

# Svelte プラグインをインストール
/plugin install svelte
```

インストール後、以下が自動的に有効化されます。

- Remote MCP サーバー（`https://mcp.svelte.dev/mcp`）への接続
- Svelte 5 のコーディング規約を載せた Skills
- `.svelte` / `.svelte.ts` / `.svelte.js` の編集に特化した Subagent

<Admonition type="info" title="リポジトリ">

プラグインの実装と最新の挙動は <a href="https://github.com/sveltejs/ai-tools">sveltejs/ai-tools</a> リポジトリで確認できます。

</Admonition>

### Subagent（`svelte-file-editor`）

Svelte Plugin には `svelte-file-editor` という専用 Subagent が含まれています。Subagent は**独自のコンテキストウィンドウ**を持ち、メインエージェントのコンテキストを消費せずに以下のタスクを処理します。

- `list-sections` → `get-documentation` で関連ドキュメントを取得
- `svelte-autofixer` をエージェント的ループで反復実行（`require_another_tool_call_after_fixing` が `false` になるまで）
- 検証済みのコードをファイルシステムに書き込み

`.svelte` ファイル・`.svelte.ts` モジュールの作成・編集・レビュー時には、メインエージェントから明示的にこの Subagent に委譲することが推奨されています。

```
> Svelte コンポーネント Counter.svelte を作成して。svelte-file-editor を使って。
```

このように依頼すると、Subagent 側でドキュメント参照・コード生成・自動修正のループが完結し、メインエージェントには最終結果だけが返ります。

### Skills（`.claude/skills/`）

公式 Svelte プラグインには次の Skills が含まれています。

| Skill 名                      | 用途                                                                                            |
| ----------------------------- | ----------------------------------------------------------------------------------------------- |
| `svelte-code-writer`          | `@sveltejs/mcp` CLI（`list-sections` / `get-documentation` / `svelte-autofixer`）の使い方を指示 |
| `svelte-core-bestpractices`   | Svelte 5 のリアクティビティ・イベント・スタイリング等のベストプラクティスを LLM に注入          |

Skills は Claude Code Marketplace から自動で取得されますが、リポジトリの[リリースページ](https://github.com/sveltejs/ai-tools/releases)から個別にダウンロードして、プロジェクトの `.claude/skills/` 配下に手動で配置することもできます。

#### プロジェクト固有 Skill の運用例

本サイトのリポジトリ（[Svelte-and-SvelteKit-with-TypeScript](https://github.com/shuji-bonji/Svelte-and-SvelteKit-with-TypeScript)）では、公式 Skills とは別に**プロジェクト固有のコーディング規約**を `.claude/skills/svelte5-coding-standards/SKILL.md` に置いています。

```
.claude/
└── skills/
    └── svelte5-coding-standards/
        └── SKILL.md   # Svelte 5 Runes 必須、レガシー構文禁止、TypeScript strict など
```

このように、

1. **公式 Skills** で Svelte 一般のベストプラクティスをカバー
2. **プロジェクト Skill** でリポジトリ固有のルール（命名規則、許可するパターン、社内ライブラリの使い方など）を追加

という二段構えで運用すると、LLM の出力をプロジェクトの慣習に揃えやすくなります。

### OpenCode 版

同等の機能は OpenCode 用にも `@sveltejs/opencode` プラグインとして提供されており、`.opencode/skills/` に Skills を配置することで Claude Code 以外のエージェントでも利用できます。

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
2. **Claude Code / OpenCode 統合** - Marketplace プラグイン、Subagent、Skills による開発体験の改善
3. **UI ライブラリ対応** - shadcn-svelte、Flowbite 等との連携
4. **開発ツール統合** - ESLint、Prettier 等との連携強化

公式の動向は [svelte.dev/docs/mcp](https://svelte.dev/docs/mcp) と [sveltejs/ai-tools](https://github.com/sveltejs/ai-tools) リポジトリで確認してください。
