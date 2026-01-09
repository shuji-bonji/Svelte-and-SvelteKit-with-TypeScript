---
title: 開発環境との統合
description: Svelte MCPを開発環境に統合する方法 - プロジェクト初期化、ESLint連携、CLAUDE.md設定、CI/CD統合、VS Code設定
---

<script>
  import { base } from '$app/paths';
  import Mermaid from '$lib/components/Mermaid.svelte';

  const cicdDiagram = `sequenceDiagram
    participant Dev as 開発者
    participant Git as Git Push
    participant CI as CI/CD
    participant AI as AI + MCP
    participant PR as Pull Request

    Dev->>Git: コードをPush
    Git->>CI: ワークフロー起動
    CI->>AI: Svelteファイルを検証

    loop 各ファイル
      AI->>AI: svelte-autofixer実行
    end

    alt エラーあり
      AI-->>CI: 問題レポート
      CI-->>PR: レビューコメント追加
    else エラーなし
      AI-->>CI: 検証OK
      CI-->>PR: チェック通過
    end`;

  const eslintStackDiagram = `graph TB
    subgraph "ESLint エコシステム"
      ESLint[ESLint]
      Parser[svelte-eslint-parser]
      Plugin[eslint-plugin-svelte]
    end

    subgraph "Svelte MCP"
      Autofixer[svelte-autofixer]
      Docs[公式ドキュメント]
    end

    subgraph "開発ツール"
      VSCode[VS Code]
      CLI[Claude Code]
    end

    ESLint --> Parser
    Parser --> Plugin
    Autofixer --> Parser
    Autofixer --> Docs
    VSCode --> ESLint
    CLI --> Autofixer

    style Autofixer fill:#ff3e00,stroke:#ff3e00,color:#fff
    style ESLint fill:#4b32c3,stroke:#4b32c3,color:#fff`;

  const workflowDiagram = `graph LR
    subgraph "1. 初期化"
      A[npx sv create]
      B[npx sv add mcp]
    end

    subgraph "2. 開発"
      C[コード作成]
      D[AI支援]
      E[autofixer検証]
    end

    subgraph "3. 品質保証"
      F[ESLint]
      G[CI/CD]
      H[レビュー]
    end

    A --> B --> C
    C --> D --> E --> C
    E --> F --> G --> H

    style B fill:#ff3e00,stroke:#ff3e00,color:#fff
    style D fill:#40b3ff,stroke:#40b3ff,color:#fff
    style E fill:#ff3e00,stroke:#ff3e00,color:#fff`;
</script>

Svelte MCP を開発環境に統合することで、AI 支援を最大限に活用できます。このページでは、プロジェクトへの MCP 統合から、ESLint との連携、CI/CD パイプラインへの組み込みまで、実践的な設定方法を解説します。

適切に統合された環境では、AI がコードを生成するたびに `svelte-autofixer` による検証が行われ、Svelte 5 の最新構文やベストプラクティスに準拠したコードが保証されます。チーム全体で統一された開発環境を構築することで、コードレビューの負担軽減と品質向上を同時に実現できます。

## 統合ワークフロー

以下の図は、プロジェクト初期化から品質保証までの典型的なワークフローを示しています。

<Mermaid diagram={workflowDiagram} />

開発フローは大きく3つのフェーズに分かれます。**初期化フェーズ**でプロジェクトと MCP を設定し、**開発フェーズ**で AI 支援を受けながらコーディング、**品質保証フェーズ**で ESLint と CI/CD による自動検証を行います。

## プロジェクト初期化

### 新規プロジェクト

```bash
# SvelteKitプロジェクト作成
npx sv create my-app
cd my-app

# MCP設定を追加
npx sv add mcp
```

`npx sv add mcp` コマンドは以下を自動的に行います。

1. MCP サーバー設定の追加（Local または Remote）
2. `AGENTS.md`（または `CLAUDE.md`、`GEMINI.md`）の作成
3. 推奨プロンプトの追加

### オプション

```bash
# IDE を指定（複数可）
npx sv add mcp="ide:cursor,vscode"

# セットアップ方式を指定
npx sv add mcp="setup:local"

# 両方指定
npx sv add mcp="ide:claude-code,setup:remote"
```

利用可能な IDE: `claude-code`、`cursor`、`gemini`、`opencode`、`vscode`、`other`

### 既存プロジェクトへの追加

```bash
cd existing-project

# MCP設定を追加
npx sv add mcp
```

## ESLint との連携

Svelte MCP と ESLint は、それぞれ異なる役割を持ちながら補完関係にあります。ESLint はファイル保存時や CI 実行時にコードスタイルと一般的なルールをチェックし、`svelte-autofixer` は AI との対話時に Svelte 固有の問題を検出します。

<Mermaid diagram={eslintStackDiagram} />

`svelte-autofixer` は内部で `svelte-eslint-parser` を使用しているため、同じパーサーを ESLint でも使うことで一貫性のある解析が可能です。両者を組み合わせることで、開発中のリアルタイムフィードバックと AI 生成コードの品質保証を両立できます。

### ESLint 設定

```bash
# 必要なパッケージをインストール
npm install -D eslint eslint-plugin-svelte svelte-eslint-parser
```

```javascript
// eslint.config.js
import svelte from 'eslint-plugin-svelte';
import svelteParser from 'svelte-eslint-parser';
import tsParser from '@typescript-eslint/parser';

export default [
  ...svelte.configs['flat/recommended'],
  {
    files: ['**/*.svelte'],
    languageOptions: {
      parser: svelteParser,
      parserOptions: {
        parser: tsParser,
      },
    },
  },
];
```

### MCP と ESLint の役割分担

| ツール          | 役割                           | 実行タイミング   |
| --------------- | ------------------------------ | ---------------- |
| ESLint          | コードスタイル、一般的なルール | 保存時、CI       |
| svelte-autofixer | Svelte 固有の問題、最新構文    | AI との対話時    |

## AGENTS.md / CLAUDE.md / GEMINI.md 設定

MCP クライアントに応じて、適切な設定ファイルを使用します。

| クライアント | 設定ファイル                                                          |
| ------------ | --------------------------------------------------------------------- |
| 汎用         | [AGENTS.md](https://agents.md)                                        |
| Claude Code  | [CLAUDE.md](https://docs.claude.com/en/docs/claude-code/memory#claude-md-imports) |
| Gemini CLI   | [GEMINI.md](https://geminicli.com/docs/cli/gemini-md/)                |

### 推奨プロンプト

`npx sv add mcp` で自動生成されるプロンプトは以下の内容です。

```markdown
You are able to use the Svelte MCP server, where you have access to comprehensive Svelte 5 and SvelteKit documentation. Here's how to use the available tools effectively:

## Available MCP Tools:

### 1. list-sections

Use this FIRST to discover all available documentation sections. Returns a structured list with titles, use_cases, and paths.
When asked about Svelte or SvelteKit topics, ALWAYS use this tool at the start of the chat to find relevant sections.

### 2. get-documentation

Retrieves full documentation content for specific sections. Accepts single or multiple sections.
After calling the list-sections tool, you MUST analyze the returned documentation sections (especially the use_cases field) and then use the get-documentation tool to fetch ALL documentation sections that are relevant for the user's task.

### 3. svelte-autofixer

Analyzes Svelte code and returns issues and suggestions.
You MUST use this tool whenever writing Svelte code before sending it to the user. Keep calling it until no issues or suggestions are returned.

### 4. playground-link

Generates a Svelte Playground link with the provided code.
After completing the code, ask the user if they want a playground link. Only call this tool after user confirmation and NEVER if code was written to files in their project.
```

:::tip[svelte-task プロンプト]
MCP クライアントがプロンプト機能をサポートしている場合は、`svelte-task` プロンプトを使用することで、LLM に MCP サーバーの効果的な使い方を指示できます。
:::

### カスタマイズ例

プロジェクト固有のルールを追加できます。

```markdown
## プロジェクト固有ルール

- Svelte 5 の Runes のみ使用（レガシー構文禁止）
- TypeScript 必須
- Tailwind CSS でスタイリング
- shadcn-svelte コンポーネントを優先使用
```

## CI/CD 統合

チーム開発では、Pull Request 時に自動的にコード品質をチェックする CI/CD パイプラインが重要です。ESLint による静的解析と TypeScript の型チェックを組み合わせることで、レビュー前に基本的な問題を検出できます。

<Mermaid diagram={cicdDiagram} />

以下の図は、PR 時の自動チェックフローを示しています。将来的には MCP の `svelte-autofixer` を CI/CD に統合し、AI による自動レビューも可能になる見込みです。

### GitHub Actions 例

```yaml
name: Svelte Code Quality

on:
  pull_request:
    paths:
      - '**.svelte'

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint

      - name: Type check
        run: npm run check
```

### AI レビュー統合（構想）

将来的には、CI/CD パイプラインで AI による自動レビューが可能になります。

```yaml
# 将来の構想例
- name: AI Code Review
  uses: ai-review-action@v1
  with:
    mcp-server: svelte
    tools:
      - svelte-autofixer
```

## VS Code 設定

VS Code は Svelte 開発で最も人気のあるエディタの一つです。適切な拡張機能とワークスペース設定を行うことで、シンタックスハイライト、自動補完、リアルタイムエラー検出、フォーマット機能が利用できます。

以下の設定をプロジェクトの `.vscode/` ディレクトリにコミットすることで、チームメンバー全員が同じ開発環境を利用できるようになります。

### 推奨拡張機能

```json
// .vscode/extensions.json
{
  "recommendations": [
    "svelte.svelte-vscode",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode"
  ]
}
```

### ワークスペース設定

```json
// .vscode/settings.json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[svelte]": {
    "editor.defaultFormatter": "svelte.svelte-vscode"
  },
  "eslint.validate": ["javascript", "typescript", "svelte"],
  "svelte.enable-ts-plugin": true
}
```

## トラブルシューティング

### MCP が認識されない

1. 設定ファイルの構文を確認
2. クライアントを再起動
3. `claude mcp list` で登録状態を確認

### ESLint と MCP の競合

両者は補完関係にあるため、基本的に競合しません。
もし異なる指摘が出た場合は、MCP の `svelte-autofixer` の結果を優先してください（最新の Svelte 仕様に基づいているため）。

### autofixer が動作しない

1. Svelte ファイルの構文エラーを確認
2. `<script lang="ts">` タグが正しいか確認
3. MCP サーバーが起動しているか確認

## 次のステップ

開発環境の統合が完了したら、[エコシステム]({base}/svelte-mcp/ecosystem/)で関連ツールとリソースを確認してください。
