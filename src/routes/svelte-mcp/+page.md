---
title: Svelte MCPとは
description: Svelte公式MCPサーバーの概要 - AIがリアルタイムで最新Svelteドキュメントを参照し、正確なコードを生成するためのツール
---

<script>
  import { base } from '$app/paths';
  import Mermaid from '$lib/components/Mermaid.svelte';

  const architectureDiagram = `graph TB
    subgraph "開発者の環境"
      Dev[開発者]
      Client[MCPクライアント<br/>Claude Code / Desktop等]
    end

    subgraph "Svelte MCP Server"
      MCP[MCP Server<br/>@sveltejs/mcp]
      Tools[ツール]
      Resources[リソース]
      Prompts[プロンプト]
    end

    subgraph "Svelteエコシステム"
      Docs[Svelte/SvelteKit<br/>公式ドキュメント]
      Playground[Svelte Playground]
    end

    Dev -->|質問・コード| Client
    Client <-->|MCP Protocol| MCP
    MCP --> Tools
    MCP --> Resources
    MCP --> Prompts
    Tools -->|参照| Docs
    Tools -->|リンク生成| Playground
    MCP -->|正確な回答| Client
    Client -->|結果| Dev

    style MCP fill:#ff3e00,stroke:#ff3e00,color:#fff
    style Tools fill:#40b3ff,stroke:#40b3ff,color:#fff
    style Docs fill:#676778,stroke:#676778,color:#fff`;

  const problemSolutionDiagram = `graph LR
    subgraph "問題"
      P1[LLMの学習データが古い]
      P2[Svelte 4と5の混同]
      P3[存在しない構文を生成]
    end

    subgraph "解決策"
      S1[リアルタイムで<br/>最新ドキュメント参照]
      S2[静的解析による<br/>コード検証]
      S3[修正提案の<br/>自動生成]
    end

    P1 --> S1
    P2 --> S2
    P3 --> S3

    style P1 fill:#fee2e2,stroke:#dc2626,color:#000
    style P2 fill:#fee2e2,stroke:#dc2626,color:#000
    style P3 fill:#fee2e2,stroke:#dc2626,color:#000
    style S1 fill:#dcfce7,stroke:#16a34a,color:#000
    style S2 fill:#dcfce7,stroke:#16a34a,color:#000
    style S3 fill:#dcfce7,stroke:#16a34a,color:#000`;
</script>

**Svelte MCP**（Model Context Protocol）は、Svelte チームが提供する公式の MCP サーバーです。Claude Desktop や Claude Code、GitHub Copilot などの**AI ツールが常に最新の Svelte ドキュメントを参照**し、正確なコードを生成できるようにします。

:::tip[公式ドキュメント]
Svelte MCP の公式ドキュメントは [svelte.dev/docs/mcp](https://svelte.dev/docs/mcp) で公開されています。
このセクションでは、日本語での解説とユースケースを中心に紹介します。
:::

## このセクションで学ぶこと

<div class="grid grid-cols-1 md:grid-cols-2 gap-4 my-8 auto-rows-[1fr]">
  <a href="{base}/svelte-mcp/setup/" class="flex no-underline group h-full">
    <div class="p-4 border border-gray-2 dark:border-gray-7 rounded-lg shadow-md hover:shadow-lg hover:border-orange-500 dark:hover:border-orange-400 transition-all cursor-pointer flex flex-col w-full">
      <div class="text-3xl mb-2">🛠️</div>
      <h3 class="font-bold text-lg mb-2 text-orange-600 dark:text-orange-400 group-hover:text-orange-700 dark:group-hover:text-orange-300 transition-colors">
        セットアップ
        <span class="inline-block ml-1 text-xs opacity-60">→</span>
      </h3>
      <p class="text-sm mb-3 text-gray-7 dark:text-gray-3">各 MCP クライアントでの設定方法を解説します。</p>
      <ul class="text-sm text-gray-6 dark:text-gray-4 space-y-1 flex-grow">
        <li>Local 版 / Remote 版の違い</li>
        <li>Claude Code、Cursor、VS Code</li>
        <li>Codex CLI、Gemini CLI</li>
        <li>SvelteKit プロジェクトへの追加</li>
      </ul>
    </div>
  </a>

  <a href="{base}/svelte-mcp/tools/" class="flex no-underline group h-full">
    <div class="p-4 border border-gray-2 dark:border-gray-7 rounded-lg shadow-md hover:shadow-lg hover:border-orange-500 dark:hover:border-orange-400 transition-all cursor-pointer flex flex-col w-full">
      <div class="text-3xl mb-2">🔧</div>
      <h3 class="font-bold text-lg mb-2 text-orange-600 dark:text-orange-400 group-hover:text-orange-700 dark:group-hover:text-orange-300 transition-colors">
        ツール詳解
        <span class="inline-block ml-1 text-xs opacity-60">→</span>
      </h3>
      <p class="text-sm mb-3 text-gray-7 dark:text-gray-3">MCP が提供する 4 つのツールを詳しく解説します。</p>
      <ul class="text-sm text-gray-6 dark:text-gray-4 space-y-1 flex-grow">
        <li>list-sections - セクション一覧取得</li>
        <li>get-documentation - ドキュメント取得</li>
        <li>svelte-autofixer - コード静的解析</li>
        <li>playground-link - Playground リンク生成</li>
      </ul>
    </div>
  </a>

  <a href="{base}/svelte-mcp/usecases/" class="flex no-underline group h-full">
    <div class="p-4 border border-gray-2 dark:border-gray-7 rounded-lg shadow-md hover:shadow-lg hover:border-orange-500 dark:hover:border-orange-400 transition-all cursor-pointer flex flex-col w-full">
      <div class="text-3xl mb-2">💡</div>
      <h3 class="font-bold text-lg mb-2 text-orange-600 dark:text-orange-400 group-hover:text-orange-700 dark:group-hover:text-orange-300 transition-colors">
        ユースケース
        <span class="inline-block ml-1 text-xs opacity-60">→</span>
      </h3>
      <p class="text-sm mb-3 text-gray-7 dark:text-gray-3">実践的な活用シナリオを紹介します。</p>
      <ul class="text-sm text-gray-6 dark:text-gray-4 space-y-1 flex-grow">
        <li>Svelte 5 の学習支援</li>
        <li>コンポーネント生成</li>
        <li>Svelte 4 → 5 移行</li>
        <li>チーム開発での品質保証</li>
      </ul>
    </div>
  </a>

  <a href="{base}/svelte-mcp/architecture/" class="flex no-underline group h-full">
    <div class="p-4 border border-gray-2 dark:border-gray-7 rounded-lg shadow-md hover:shadow-lg hover:border-orange-500 dark:hover:border-orange-400 transition-all cursor-pointer flex flex-col w-full">
      <div class="text-3xl mb-2">🏗️</div>
      <h3 class="font-bold text-lg mb-2 text-orange-600 dark:text-orange-400 group-hover:text-orange-700 dark:group-hover:text-orange-300 transition-colors">
        アーキテクチャ
        <span class="inline-block ml-1 text-xs opacity-60">→</span>
      </h3>
      <p class="text-sm mb-3 text-gray-7 dark:text-gray-3">内部アーキテクチャを詳しく解説します。</p>
      <ul class="text-sm text-gray-6 dark:text-gray-4 space-y-1 flex-grow">
        <li>Local版 vs Remote版</li>
        <li>autofixer の仕組み</li>
        <li>ドキュメント同期フロー</li>
        <li>技術スタック</li>
      </ul>
    </div>
  </a>

  <a href="{base}/svelte-mcp/integration/" class="flex no-underline group h-full">
    <div class="p-4 border border-gray-2 dark:border-gray-7 rounded-lg shadow-md hover:shadow-lg hover:border-orange-500 dark:hover:border-orange-400 transition-all cursor-pointer flex flex-col w-full">
      <div class="text-3xl mb-2">⚙️</div>
      <h3 class="font-bold text-lg mb-2 text-orange-600 dark:text-orange-400 group-hover:text-orange-700 dark:group-hover:text-orange-300 transition-colors">
        開発環境との統合
        <span class="inline-block ml-1 text-xs opacity-60">→</span>
      </h3>
      <p class="text-sm mb-3 text-gray-7 dark:text-gray-3">プロジェクトへの統合方法を解説します。</p>
      <ul class="text-sm text-gray-6 dark:text-gray-4 space-y-1 flex-grow">
        <li>プロジェクト初期化</li>
        <li>ESLint との連携</li>
        <li>CLAUDE.md / AGENTS.md 設定</li>
        <li>CI/CD 統合</li>
      </ul>
    </div>
  </a>

  <a href="{base}/svelte-mcp/ecosystem/" class="flex no-underline group h-full">
    <div class="p-4 border border-gray-2 dark:border-gray-7 rounded-lg shadow-md hover:shadow-lg hover:border-orange-500 dark:hover:border-orange-400 transition-all cursor-pointer flex flex-col w-full">
      <div class="text-3xl mb-2">🌐</div>
      <h3 class="font-bold text-lg mb-2 text-orange-600 dark:text-orange-400 group-hover:text-orange-700 dark:group-hover:text-orange-300 transition-colors">
        エコシステム
        <span class="inline-block ml-1 text-xs opacity-60">→</span>
      </h3>
      <p class="text-sm mb-3 text-gray-7 dark:text-gray-3">関連するツールとリソースを紹介します。</p>
      <ul class="text-sm text-gray-6 dark:text-gray-4 space-y-1 flex-grow">
        <li>公式 MCP パッケージ</li>
        <li>ESLint 関連パッケージ</li>
        <li>UI ライブラリとの統合</li>
        <li>MCP 開発リソース</li>
      </ul>
    </div>
  </a>
</div>

## なぜ MCP が必要か

LLM（大規模言語モデル）を Svelte 開発に使う際、以下のような問題が頻繁に発生します。

1. **学習データの古さ** - LLM の学習データには Svelte 5 の情報が不足している
2. **バージョンの混同** - Svelte 4 の古いリアクティビティ構文と Svelte 5 の Runes を混同する
3. **存在しない構文の生成** - ハルシネーションにより、存在しない構文や API を生成する

<Mermaid diagram={problemSolutionDiagram} />

### MCP による解決

Svelte MCP は以下の方法でこれらの問題を解決します。

| 問題             | MCP の解決策                                |
| ---------------- | ------------------------------------------- |
| 学習データが古い | リアルタイムで最新ドキュメントを取得        |
| バージョン混同   | 静的解析でコードを検証し、問題を検出        |
| 存在しない構文   | 自動修正提案（autofixer）で正しい構文を提示 |

## アーキテクチャ概要

<Mermaid diagram={architectureDiagram} />

Svelte MCP は**3 つの主要機能**を提供します。

### 1. ツール（Tools）

LLM が呼び出せる 4 つのツール

| ツール              | 機能                                       |
| ------------------- | ------------------------------------------ |
| `list-sections`     | 利用可能なドキュメントセクション一覧を取得 |
| `get-documentation` | 指定セクションの完全なドキュメントを取得   |
| `svelte-autofixer`  | コードを静的解析し、問題と修正提案を返す   |
| `playground-link`   | Svelte Playground へのリンクを生成         |

### 2. リソース（Resources）

ユーザーが明示的に含めることができるドキュメントリソース。特定の機能（例：トランジション）のドキュメントを事前にセッションに含めておくことで、LLM の応答精度を向上させます。

### 3. プロンプト（Prompts）

LLM への定型的な指示を提供。`svelte-task`プロンプトを使うことで、MCP サーバーの効果的な使い方を LLM に指示できます。

## 2 つのバージョン

| バージョン                       | 特徴                           | 推奨用途     |
| -------------------------------- | ------------------------------ | ------------ |
| **Local 版** (`@sveltejs/mcp`)   | ローカルで実行、オフライン対応 | 日常的な開発 |
| **Remote 版** (`mcp.svelte.dev`) | サーバーレス、設定簡単         | 試用、CI/CD  |

## 対応クライアント

Svelte MCP は以下の MCP クライアントに対応しています。

- **Claude Code** - Anthropic 公式 CLI
- **Claude Desktop** - Anthropic 公式デスクトップアプリ
- **Cursor** - AI 搭載エディタ
- **VS Code** - MCP サポート
- **Zed** - Svelte MCP Server 拡張機能
- **Codex CLI** - OpenAI
- **Gemini CLI** - Google
- **GitHub Coding Agent** - GitHub
- **OpenCode** - オープンソースクライアント

## 推奨設定

MCP サーバーを最大限に活用するには、プロジェクトの `AGENTS.md`（または `CLAUDE.md`、`GEMINI.md`）に推奨プロンプトを追加することを推奨します。

:::note[自動設定]
`npx sv add mcp` コマンドを使用すると、この設定が自動的に追加されます。
:::

推奨プロンプトには以下の内容が含まれます。

- 利用可能なツールの説明
- 各ツールの適切な使用タイミング
- `svelte-autofixer` の繰り返し呼び出しの指示

また、MCP クライアントが対応している場合は、`svelte-task` プロンプトを使用することで、LLM に MCP サーバーの効果的な使い方を指示できます。

## 次のステップ

準備ができたら、[セットアップ]({base}/svelte-mcp/setup/)から始めましょう。使用している MCP クライアントに合わせた設定方法を詳しく解説しています。
