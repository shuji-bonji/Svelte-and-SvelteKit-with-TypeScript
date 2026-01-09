---
title: ツール詳解
description: Svelte MCPが提供する4つのツール - list-sections、get-documentation、svelte-autofixer、playground-linkの詳細解説
---

<script>
  import { base } from '$app/paths';
  import Mermaid from '$lib/components/Mermaid.svelte';

  const toolFlowDiagram = `sequenceDiagram
    participant Dev as 開発者
    participant LLM as LLM
    participant MCP as Svelte MCP
    participant Docs as Svelte Docs

    Dev->>LLM: Svelte 5でカウンターを作って
    LLM->>MCP: list-sections()
    MCP-->>LLM: セクション一覧
    LLM->>MCP: get-documentation(["svelte/runes/state"])
    MCP->>Docs: ドキュメント取得
    Docs-->>MCP: $state の解説
    MCP-->>LLM: ドキュメント内容
    LLM->>LLM: コード生成
    LLM->>MCP: svelte-autofixer(生成コード)
    MCP-->>LLM: {issues: [], suggestions: []}
    LLM-->>Dev: 検証済みコード`;

  const autofixerFlowDiagram = `graph TB
    subgraph "入力"
      Code[Svelteコード]
    end

    subgraph "svelte-autofixer"
      Parse[構文解析]
      Analyze[静的解析]
      Check[ベストプラクティス<br/>チェック]
    end

    subgraph "出力"
      Issues[issues: 問題点]
      Suggestions[suggestions: 改善提案]
    end

    Code --> Parse
    Parse --> Analyze
    Analyze --> Check
    Check --> Issues
    Check --> Suggestions

    style Code fill:#e0f2fe,stroke:#0284c7,color:#0c4a6e
    style Issues fill:#fee2e2,stroke:#dc2626,color:#7f1d1d
    style Suggestions fill:#dcfce7,stroke:#16a34a,color:#14532d`;
</script>

Svelte MCP は**4 つのツール**を提供します。これらは LLM が自動的に呼び出し、最新の Svelte ドキュメントに基づいた正確な応答を生成します。

従来の LLM は学習時点のデータに基づいて回答するため、Svelte 5 のような新しい技術では古い情報や誤った構文を提案することがありました。Svelte MCP のツールを使うことで、LLM は常に最新の公式ドキュメントを参照し、`svelte-autofixer` による検証を経た正確なコードを提供できるようになります。

以下の図は、開発者が Svelte に関する質問をした際の典型的なツール呼び出しフローを示しています。

<Mermaid diagram={toolFlowDiagram} />

## 1. list-sections

**利用可能なドキュメントセクションの一覧を取得**するツールです。

Svelte の公式ドキュメントは多岐にわたるため、LLM が効率的に必要な情報を見つけるにはまず「何が利用可能か」を知る必要があります。`list-sections` は、Runes、コンポーネント、SvelteKit のルーティングなど、すべてのドキュメントセクションとその用途を一覧で返します。

### 用途

LLM が Svelte に関する質問を受けたとき、**最初に呼び出す**べきツールです。
どのドキュメントセクションが利用可能かを把握し、次の `get-documentation` で取得すべきセクションを判断します。

### 戻り値の例

```yaml
- title: $state
  use_cases: reactive state, component state, form inputs, counters, toggles
  path: svelte/runes/state

- title: $derived
  use_cases: computed values, reactive calculations, dependent state
  path: svelte/runes/derived

- title: Load functions
  use_cases: data fetching, SSR, page data, server-side logic
  path: kit/load
```

### ポイント

- `use_cases` フィールドを見て、ユーザーの質問に関連するセクションを特定
- 複数のセクションが関連する場合は、すべてを `get-documentation` で取得

## 2. get-documentation

**指定したセクションの完全なドキュメントを取得**するツールです。

`list-sections` でどのドキュメントが必要かを判断した後、このツールで実際の内容を取得します。公式ドキュメントの完全なテキストが返されるため、LLM は正確な API 仕様、使用例、注意事項を把握した上でコードを生成できます。複数のセクションを一度に取得することも可能なので、関連するトピック（例：`$state` と `$derived` と `$effect`）をまとめて参照できます。

### 用途

`list-sections` で特定したセクションの詳細な情報を取得します。
単一セクションでも、複数セクションでも取得可能です。

### 使用例

```typescript
// 単一セクション
get - documentation('svelte/runes/state');

// 複数セクション
get - documentation(['svelte/runes/state', 'svelte/runes/derived', 'svelte/runes/effect']);
```

### ポイント

- **トークン消費に注意**: 多くのセクションを取得するとトークンを大量消費
- 必要最小限のセクションに絞ることを推奨
- `use_cases` を活用して関連性の高いセクションを選択

## 3. svelte-autofixer

**生成されたコードを静的解析**し、問題点と改善提案を返すツールです。

Svelte MCP の中で最も重要なツールと言えます。LLM は学習データに基づいてコードを生成するため、Svelte 4 の古い構文（`$:`、`on:click`、`export let` など）を使ってしまうことがあります。`svelte-autofixer` は生成されたコードを解析し、このような問題を検出して修正方法を提案します。

内部では `svelte-eslint-parser` を使用しており、構文エラーだけでなく、ベストプラクティスに反するパターンも検出します。LLM は `issues` が空になるまでコードを修正し続けることで、最終的に品質の高いコードをユーザーに提供できます。

<Mermaid diagram={autofixerFlowDiagram} />

### 用途

LLM が Svelte コードを生成した後、**ユーザーに返す前に必ず呼び出す**べきツールです。
以下を検出します。

- 構文エラー
- Svelte 4 の古いパターン（`$:` など）
- アンチパターン
- 移行が必要なコード

### 入力例

```svelte
<script>
  let count = 0;
  $: doubled = count * 2;
</script>

<button on:click={() => count++}>
  {count} × 2 = {doubled}
</button>
```

### 出力例

```json
{
	"issues": [
		{
			"type": "legacy-syntax",
			"message": "Svelte 4の$:リアクティブステートメントが使用されています",
			"line": 3,
			"suggestion": "$derivedルーンを使用してください"
		},
		{
			"type": "legacy-syntax",
			"message": "on:clickは古い構文です",
			"line": 6,
			"suggestion": "onclickを使用してください"
		}
	],
	"suggestions": [
		{
			"type": "best-practice",
			"message": "let count = 0 を let count = $state(0) に変更することを推奨"
		}
	]
}
```

### ポイント

- **issues が空になるまで繰り返し呼び出す**ことを推奨
- LLM は `issues` に基づいてコードを修正し、再度 `svelte-autofixer` を呼び出す
- これにより、最終的に品質の高いコードがユーザーに提供される

## 4. playground-link

**Svelte Playground へのリンクを生成**するツールです。

コードを見ただけでは動作がイメージしにくい場合があります。`playground-link` を使うと、生成したコードを Svelte の公式 Playground で即座に実行できる URL を生成できます。ユーザーはリンクをクリックするだけで、ブラウザ上でコードの動作を確認し、自由に編集して実験できます。

このツールは、学習目的でコードの動作を確認したい場合や、コードスニペットを他の開発者と共有したい場合に特に便利です。ただし、ユーザーのプロジェクトに直接ファイルを書き込んだ場合は Playground リンクは不要なので、使用前にユーザーに確認を取ることが推奨されています。

### 用途

生成したコードをユーザーがすぐに試せるよう、Playground リンクを提供します。

### 使用タイミング

1. コード生成が完了した後
2. **ユーザーに確認を取ってから**呼び出す（ファイルに書き込んだ場合は不要）

### 入力例

```typescript
playground -
	link({
		files: {
			'App.svelte':
				'<script>\n  let count = $state(0);\n</script>\n\n<button onclick={() => count++}>\n  clicks: {count}\n</button>',
		},
	});
```

### 出力例

```
https://svelte.dev/playground/xxxx-xxxx-xxxx
```

### ポイント

- プロジェクトファイルに直接書き込んだ場合は、Playground リンクは不要
- ユーザーが「試してみたい」と言った場合や、確認を求められた場合に使用

## 推奨ワークフロー

LLM が Svelte 関連のタスクを処理する際の推奨フローです。

これらのツールは単独で使うよりも、適切な順序で組み合わせることで真価を発揮します。以下のワークフローは、`CLAUDE.md` や `AGENTS.md` に記述しておくことで、LLM が自動的に従うようになります。重要なのは、**コード生成後に必ず `svelte-autofixer` で検証する**ことです。

```
1. list-sections() で利用可能なドキュメントを確認
     ↓
2. get-documentation() で関連セクションを取得
     ↓
3. コードを生成
     ↓
4. svelte-autofixer() でコードを検証
     ↓
5. issues があれば修正して再度 svelte-autofixer()
     ↓
6. issues が空になったらユーザーに返す
     ↓
7. (必要に応じて) playground-link() でリンク生成
```

この流れを `CLAUDE.md` や `AGENTS.md` に記述しておくことで、LLM が自動的にこのワークフローに従います。
