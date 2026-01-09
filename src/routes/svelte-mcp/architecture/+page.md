---
title: アーキテクチャ詳解
description: Svelte MCPの内部アーキテクチャ - monorepo構成、処理フロー、autofixerの仕組み、ドキュメント同期、技術スタック
---

<script>
  import { base } from '$app/paths';
  import Mermaid from '$lib/components/Mermaid.svelte';

  const monorepoStructure = `graph TB
    subgraph sveltejs-mcp["sveltejs/mcp monorepo"]
      Root[pnpm workspace]

      subgraph apps["apps/"]
        Remote["mcp-remote<br/>Remote版サーバー"]
      end

      subgraph packages["packages/"]
        Schema["mcp-schema<br/>スキーマ定義"]
        Server["mcp-server<br/>サーバー実装"]
        Stdio["mcp-stdio<br/>stdio通信"]
      end

      subgraph plugins["plugins/"]
        Svelte["svelte<br/>Svelteプラグイン"]
      end

      subgraph docs["docs/"]
        Site["ドキュメントサイト"]
      end
    end

    Root --> Remote
    Root --> Schema
    Root --> Server
    Root --> Stdio
    Root --> Svelte
    Root --> Site

    Server --> Schema
    Stdio --> Server
    Remote --> Server

    style Remote fill:#ff3e00,stroke:#ff3e00,color:#fff
    style Server fill:#40b3ff,stroke:#40b3ff,color:#fff
    style Svelte fill:#ff3e00,stroke:#ff3e00,color:#fff
    style Schema fill:#676778,stroke:#676778,color:#fff`;

  const localVsRemoteDiagram = `graph TB
    subgraph local["Local版 - sveltejs/mcp"]
      LC[MCPクライアント]
      LS[Local Server<br/>stdio]
      LD[ローカルファイル<br/>node_modules内]

      LC <-->|stdio| LS
      LS --> LD
    end

    subgraph remote["Remote版 - mcp.svelte.dev"]
      RC[MCPクライアント]
      RS[Remote Server<br/>Vercel Edge]
      RD[(PostgreSQL<br/>ドキュメントDB)]
      VY[Voyage AI<br/>Embeddings]

      RC <-->|HTTP/SSE| RS
      RS --> RD
      RS --> VY
    end

    style LS fill:#40b3ff,stroke:#40b3ff,color:#fff
    style RS fill:#ff3e00,stroke:#ff3e00,color:#fff
    style RD fill:#336791,stroke:#336791,color:#fff
    style VY fill:#6366f1,stroke:#6366f1,color:#fff`;

  const docSyncFlowDiagram = `sequenceDiagram
    participant GH as GitHub<br/>sveltejs/svelte
    participant Sync as 同期ジョブ<br/>(定期実行)
    participant DB as PostgreSQL
    participant VY as Voyage AI
    participant MCP as MCP Server
    participant Client as MCPクライアント

    Note over Sync: 1時間ごとに実行
    Sync->>GH: 最新ドキュメント取得
    GH-->>Sync: Markdown ファイル群
    Sync->>Sync: メタデータ抽出<br/>use_cases 生成
    Sync->>VY: テキスト → Embeddings
    VY-->>Sync: ベクトルデータ
    Sync->>DB: ドキュメント保存

    Note over Client,MCP: ユーザーリクエスト時
    Client->>MCP: get-documentation("$state")
    MCP->>DB: クエリ実行
    DB-->>MCP: ドキュメント内容
    MCP-->>Client: 最新ドキュメント`;

  const autofixerFlowDiagram = `graph TB
    subgraph "入力"
      Code[Svelteコード<br/>文字列]
      Async[asyncフラグ]
      Version[Svelteバージョン]
    end

    subgraph "svelte-autofixer 内部処理"
      Parse[svelte-eslint-parser<br/>構文解析]
      AST[Svelte AST]
      Analyze[eslint-plugin-svelte<br/>ルール適用]
      Check[ベストプラクティス<br/>チェック]
    end

    subgraph "出力"
      Issues[issues<br/>問題点リスト]
      Suggestions[suggestions<br/>改善提案]
    end

    Code --> Parse
    Async --> Parse
    Version --> Parse
    Parse --> AST
    AST --> Analyze
    Analyze --> Check
    Check --> Issues
    Check --> Suggestions

    style Parse fill:#ff3e00,stroke:#ff3e00,color:#fff
    style Analyze fill:#4B32C3,stroke:#4B32C3,color:#fff
    style Issues fill:#fee2e2,stroke:#dc2626,color:#7f1d1d
    style Suggestions fill:#dcfce7,stroke:#16a34a,color:#14532d`;

  const requestFlowDiagram = `sequenceDiagram
    participant Client as MCPクライアント
    participant MCP as MCP Server
    participant Handler as Tool Handler
    participant Parser as svelte-eslint-parser
    participant Plugin as eslint-plugin-svelte

    Client->>MCP: tools/call<br/>{name: "svelte-autofixer", arguments: {...}}
    MCP->>Handler: dispatch(tool, args)

    alt svelte-autofixer
      Handler->>Parser: parse(code, options)
      Parser-->>Handler: AST
      Handler->>Plugin: lint(AST, rules)
      Plugin-->>Handler: diagnostics
      Handler->>Handler: format(diagnostics)
      Handler-->>MCP: {issues, suggestions}
    else get-documentation
      Handler->>Handler: query DB
      Handler-->>MCP: {content, sections}
    end

    MCP-->>Client: ToolResult`;

  const layerArchitectureDiagram = `graph TB
    subgraph "プレゼンテーション層"
      MCP[MCP Protocol Handler]
      HTTP[HTTP/SSE Endpoint]
    end

    subgraph "アプリケーション層"
      Tools[Tools<br/>list-sections, get-documentation,<br/>svelte-autofixer, playground-link]
      Resources[Resources<br/>ドキュメントリソース]
      Prompts[Prompts<br/>svelte-task]
    end

    subgraph "ドメイン層"
      DocService[Document Service]
      AnalyzeService[Analyze Service]
      PlaygroundService[Playground Service]
    end

    subgraph "インフラ層"
      DB[(PostgreSQL<br/>Drizzle ORM)]
      Parser[svelte-eslint-parser]
      ESLint[eslint-plugin-svelte]
      Voyage[Voyage AI API]
    end

    MCP --> Tools
    HTTP --> MCP
    Tools --> DocService
    Tools --> AnalyzeService
    Tools --> PlaygroundService
    Resources --> DocService
    Prompts --> DocService

    DocService --> DB
    DocService --> Voyage
    AnalyzeService --> Parser
    AnalyzeService --> ESLint

    style MCP fill:#ff3e00,stroke:#ff3e00,color:#fff
    style Tools fill:#40b3ff,stroke:#40b3ff,color:#fff
    style DB fill:#336791,stroke:#336791,color:#fff`;

  const dataFlowDiagram = `graph LR
    subgraph "データソース"
      GH[GitHub Docs]
      User[ユーザーコード]
    end

    subgraph "処理"
      Distill[要約処理<br/>Distillation]
      Embed[Embedding<br/>生成]
      Lint[静的解析]
    end

    subgraph "ストレージ"
      DB[(PostgreSQL)]
      Cache[キャッシュ]
    end

    subgraph "出力"
      Doc[ドキュメント]
      Fix[修正提案]
      Link[Playground URL]
    end

    GH --> Distill
    Distill --> Embed
    Embed --> DB
    DB --> Doc

    User --> Lint
    Lint --> Fix
    User --> Link

    DB --> Cache
    Cache --> Doc

    style DB fill:#336791,stroke:#336791,color:#fff
    style Distill fill:#6366f1,stroke:#6366f1,color:#fff`;

  const techStackDiagram = `graph TB
    subgraph "言語・ランタイム"
      TS[TypeScript 85%]
      Node[Node.js]
    end

    subgraph "フレームワーク"
      SK[SvelteKit]
      MCP_SDK[MCP SDK]
    end

    subgraph "データベース"
      PG[PostgreSQL]
      Drizzle[Drizzle ORM]
    end

    subgraph "解析ツール"
      Parser[svelte-eslint-parser]
      Plugin[eslint-plugin-svelte]
      TSESLint[typescript-eslint]
    end

    subgraph "AI・ML"
      Voyage[Voyage AI<br/>Embeddings]
    end

    subgraph "インフラ"
      Vercel[Vercel Edge]
      NPM[npm Registry]
    end

    TS --> SK
    TS --> MCP_SDK
    SK --> Vercel
    MCP_SDK --> NPM
    Drizzle --> PG
    Parser --> Plugin

    style TS fill:#3178c6,stroke:#3178c6,color:#fff
    style SK fill:#ff3e00,stroke:#ff3e00,color:#fff
    style PG fill:#336791,stroke:#336791,color:#fff
    style Voyage fill:#6366f1,stroke:#6366f1,color:#fff`;
</script>

Svelte MCPの内部アーキテクチャを詳しく解説します。公式リポジトリ [sveltejs/mcp](https://github.com/sveltejs/mcp) のコードを基に、処理フローや技術スタックを図解します。

:::note[対象読者]
このページは、Svelte MCPの内部動作に興味がある開発者、または独自のMCPサーバーを構築したい方向けです。
通常の利用には[セットアップ]({base}/svelte-mcp/setup/)と[ツール詳解]({base}/svelte-mcp/tools/)を参照してください。
:::

## リポジトリ構成

Svelte MCPは **pnpm workspace** による monorepo 構成を採用しています。この構成により、複数のパッケージを単一のリポジトリで効率的に管理し、コードの共有と依存関係の管理を簡素化しています。

モノレポ構成の主なメリットは、パッケージ間でコードを共有しやすいこと、一貫したバージョン管理ができること、そしてCI/CDパイプラインを統一できることです。Svelte MCPでは、スキーマ定義（`mcp-schema`）をサーバー実装（`mcp-server`）と stdio 通信層（`mcp-stdio`）で共有することで、型安全性を保ちながら効率的な開発を実現しています。

<Mermaid diagram={monorepoStructure} />

### ディレクトリ構造

```
sveltejs/mcp/
├── apps/
│   └── mcp-remote/        # Remote版サーバー（Vercelデプロイ）
├── packages/
│   ├── mcp-schema/        # スキーマ定義
│   ├── mcp-server/        # サーバー実装
│   └── mcp-stdio/         # stdio通信
├── plugins/
│   └── svelte/            # Svelteプラグイン
├── docs/                  # ドキュメントサイト
├── documentation/docs/    # MCPドキュメント（Markdownソース）
├── scripts/               # ビルド・同期スクリプト
├── .mcp.json              # MCP設定
├── pnpm-workspace.yaml    # ワークスペース設定
└── CLAUDE.md              # AI向けプロンプト
```

## Local版 vs Remote版

Svelte MCPには2つのバージョンがあり、それぞれ異なるアーキテクチャと用途を持っています。

**Local版**は `@sveltejs/mcp` パッケージとして npm で配布され、開発者のローカルマシン上で動作します。MCP クライアント（Claude Code など）とは標準入出力（stdio）を介して通信し、ドキュメントデータはパッケージに同梱されたローカルファイルから読み込みます。このため、インターネット接続なしでも動作し、レスポンスも高速です。

**Remote版**は `mcp.svelte.dev` で提供されるサーバーレスサービスです。Vercel Edge Functions 上で動作し、PostgreSQL データベースに保存された最新のドキュメントを参照します。Voyage AI による Embeddings を活用した意味検索も可能で、常に最新の情報を提供できます。

<Mermaid diagram={localVsRemoteDiagram} />

### 比較表

| 項目 | Local版 | Remote版 |
|------|---------|----------|
| **パッケージ** | `@sveltejs/mcp` | `mcp.svelte.dev/mcp` |
| **通信方式** | stdio（標準入出力） | HTTP + SSE |
| **データソース** | ローカルファイル | PostgreSQL + Voyage AI |
| **デプロイ** | ローカル実行 | Vercel Edge |
| **オフライン** | ✅ 対応 | ❌ 要インターネット |
| **最新性** | パッケージ更新時 | 常に最新 |

### Local版の利点

- **オフラインで動作** - インターネット接続が不安定な環境でも安定して使用可能
- **レスポンスが高速** - ネットワーク遅延がないため、即座に応答
- **プライバシー保護** - ユーザーのコードがサーバーに送信されないため、機密性の高いプロジェクトでも安心

### Remote版の利点

- **インストール不要** - URL を設定するだけで即座に利用開始
- **常に最新のドキュメント** - Svelte の公式ドキュメントが更新されると自動的に反映
- **Embeddings による意味検索** - キーワードだけでなく、意味的に関連するドキュメントも検索可能

どちらを選ぶかは、オフライン対応の必要性、最新情報の重要度、プライバシー要件によって判断してください。日常的な開発には Local版、試用や CI/CD 統合には Remote版が適しています。

## レイヤーアーキテクチャ

Svelte MCPは典型的な**レイヤードアーキテクチャ**を採用しています。この設計パターンにより、各層の責務が明確に分離され、テスタビリティと保守性が向上しています。

各レイヤーは下位レイヤーにのみ依存し、上位レイヤーを参照しません。これにより、例えばデータベースの実装を変更しても、アプリケーション層以上のコードに影響を与えずに済みます。

<Mermaid diagram={layerArchitectureDiagram} />

### 各レイヤーの責務

| レイヤー | 責務 | 主要コンポーネント |
|---------|------|-------------------|
| **プレゼンテーション** | MCPプロトコル処理 | MCP SDK, HTTP Handler |
| **アプリケーション** | ツール・リソース定義 | Tools, Resources, Prompts |
| **ドメイン** | ビジネスロジック | Document/Analyze/Playground Service |
| **インフラ** | 外部サービス連携 | DB, Parser, ESLint, Voyage AI |

## ドキュメント同期フロー

Remote版では、Svelteの公式ドキュメントを定期的に同期しています。

<Mermaid diagram={docSyncFlowDiagram} />

### 同期プロセスの詳細

1. **ドキュメント取得**（1時間ごと）
   - GitHub の sveltejs/svelte リポジトリから Markdown を取得
   - 変更があったファイルのみ処理

2. **メタデータ抽出**
   - タイトル、説明、パスを抽出
   - `use_cases` フィールドを生成（LLMが検索しやすいように）

3. **要約処理（Distillation）**
   - 完全なドキュメント（約800KB）をLLM用に要約
   - コード例とキーコンセプトは保持
   - 冗長な説明を削減

4. **Embeddings生成**
   - Voyage AI で各セクションをベクトル化
   - 意味検索を可能に

5. **データベース保存**
   - Drizzle ORM で PostgreSQL に保存
   - 古いバージョンは上書き

## svelte-autofixer の内部処理

`svelte-autofixer` ツールは、**eslint-plugin-svelte** と **svelte-eslint-parser** を内部で使用しています。

<Mermaid diagram={autofixerFlowDiagram} />

### 処理フローの詳細

```typescript
// 簡略化した擬似コード
async function svelteAutofixer(
  code: string,
  options: { async?: boolean; version?: number }
): Promise<{ issues: Issue[]; suggestions: Suggestion[] }> {
  // 1. パーサー設定
  const parserOptions = {
    parser: svelteParser,
    svelteFeatures: {
      runes: options.version >= 5,
      experimentalAsync: options.async
    }
  };

  // 2. 構文解析
  const ast = svelteParser.parse(code, parserOptions);

  // 3. ESLint ルール適用
  const linter = new ESLint({
    plugins: { svelte: eslintPluginSvelte },
    rules: {
      'svelte/valid-compile': 'error',
      'svelte/no-reactive-reassign': 'warn',
      // ... その他のルール
    }
  });

  const results = await linter.lintText(code);

  // 4. 結果をフォーマット
  return {
    issues: results.filter(r => r.severity === 2),
    suggestions: results.filter(r => r.severity === 1)
  };
}
```

### 検出される問題の例

| カテゴリ | 例 | 重要度 |
|---------|-----|--------|
| **構文エラー** | 不正なRunes使用 | error |
| **レガシー構文** | `$:` の使用 | warning |
| **アンチパターン** | `on:click` (Svelte 5) | warning |
| **ベストプラクティス** | 型注釈の欠如 | suggestion |

## リクエスト処理フロー

MCPクライアントからのリクエストがどのように処理されるかを示します。

<Mermaid diagram={requestFlowDiagram} />

### MCPプロトコルの主要メソッド

| メソッド | 用途 |
|----------|------|
| `tools/list` | 利用可能なツール一覧を返す |
| `tools/call` | ツールを実行 |
| `resources/list` | 利用可能なリソース一覧 |
| `resources/read` | リソースの内容を取得 |
| `prompts/list` | 利用可能なプロンプト一覧 |
| `prompts/get` | プロンプトの内容を取得 |

## データフロー

システム全体のデータの流れを示します。

<Mermaid diagram={dataFlowDiagram} />

### データの種類

| データ | ソース | 処理 | 出力 |
|--------|--------|------|------|
| **ドキュメント** | GitHub | 要約 + Embedding | クエリ結果 |
| **ユーザーコード** | クライアント | 静的解析 | issues/suggestions |
| **Playground** | 生成コード | URLエンコード | Playground URL |

## 技術スタック

<Mermaid diagram={techStackDiagram} />

### 主要技術

| カテゴリ | 技術 | 用途 |
|---------|------|------|
| **言語** | TypeScript | メイン言語（85%） |
| **フレームワーク** | SvelteKit | Webサーバー・サイト |
| **MCP** | MCP SDK | MCPプロトコル実装 |
| **ORM** | Drizzle | データベースアクセス |
| **DB** | PostgreSQL | ドキュメント保存 |
| **パーサー** | svelte-eslint-parser | Svelte構文解析 |
| **Linter** | eslint-plugin-svelte | 静的解析ルール |
| **AI** | Voyage AI | Embeddings生成 |
| **デプロイ** | Vercel | Edge Functions |

### 依存関係（主要パッケージ）

```json
{
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.x",
    "drizzle-orm": "^0.x",
    "eslint-plugin-svelte": "^3.x",
    "svelte-eslint-parser": "^0.x"
  }
}
```

## スケーラビリティ

### Remote版のスケーリング戦略

```
┌─────────────────────────────────────────────────────────┐
│                    Vercel Edge Network                  │
├─────────────────────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐   │
│  │ Edge 1  │  │ Edge 2  │  │ Edge 3  │  │ Edge N  │   │
│  │ (Tokyo) │  │ (SF)    │  │ (London)│  │ (...)   │   │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘   │
│       │            │            │            │         │
│       └────────────┴─────┬──────┴────────────┘         │
│                          │                             │
│                    ┌─────▼─────┐                       │
│                    │ PostgreSQL │                      │
│                    │  (Neon)    │                      │
│                    └───────────┘                       │
└─────────────────────────────────────────────────────────┘
```

- **Edge Functions**: 世界中のエッジロケーションで実行
- **コネクションプーリング**: データベース接続の効率化
- **キャッシュ**: ドキュメントクエリ結果のキャッシュ

## 独自MCPサーバー構築への応用

Svelte MCPのアーキテクチャを参考に、独自のMCPサーバーを構築できます。

### 基本構造

```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const server = new Server({
  name: 'my-mcp-server',
  version: '1.0.0'
}, {
  capabilities: {
    tools: {},
    resources: {},
    prompts: {}
  }
});

// ツール定義
server.setRequestHandler('tools/list', async () => ({
  tools: [
    {
      name: 'my-tool',
      description: 'My custom tool',
      inputSchema: {
        type: 'object',
        properties: {
          input: { type: 'string' }
        }
      }
    }
  ]
}));

// ツール実装
server.setRequestHandler('tools/call', async (request) => {
  const { name, arguments: args } = request.params;

  if (name === 'my-tool') {
    // カスタムロジック
    return { content: [{ type: 'text', text: 'Result' }] };
  }
});

// サーバー起動
const transport = new StdioServerTransport();
await server.connect(transport);
```

### 参考リソース

- [MCP公式ドキュメント](https://modelcontextprotocol.io/)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Svelte MCP ソースコード](https://github.com/sveltejs/mcp)

## 次のステップ

アーキテクチャを理解したら、[開発環境との統合]({base}/svelte-mcp/integration/)でプロジェクトへの導入方法を確認してください。
