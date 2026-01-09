---
title: ユースケース
description: Svelte MCPの実践的な活用シナリオ - 学習支援、コード生成、移行支援、品質保証、Playground活用
---

<script>
  import { base } from '$app/paths';
  import Mermaid from '$lib/components/Mermaid.svelte';

  const uc1Diagram = `sequenceDiagram
    participant Dev as 開発者
    participant AI as AI (Claude等)
    participant MCP as Svelte MCP
    participant Docs as 公式ドキュメント

    Dev->>AI: $stateの使い方を教えて
    AI->>MCP: list-sections()
    MCP-->>AI: セクション一覧（use_cases付き）
    AI->>MCP: get-documentation("svelte/runes/state")
    MCP->>Docs: 最新ドキュメント取得
    Docs-->>MCP: $state の完全な解説
    MCP-->>AI: ドキュメント内容
    AI-->>Dev: 正確な$stateの使い方を回答`;

  const uc3Diagram = `sequenceDiagram
    participant Dev as 開発者
    participant AI as AI
    participant MCP as Svelte MCP

    Dev->>AI: このコードをSvelte 5に移行して
    Note over Dev,AI: Svelte 4コードを添付

    AI->>MCP: svelte-autofixer(既存コード)
    MCP-->>AI: issues: [古い構文の検出]

    AI->>MCP: get-documentation(["runes/state", "runes/derived"])
    MCP-->>AI: 新しい構文のドキュメント

    AI->>AI: 移行版コード生成

    AI->>MCP: svelte-autofixer(移行版コード)
    MCP-->>AI: issues: [] ← OK!

    AI-->>Dev: 検証済みの移行コード`;

  const uc4Diagram = `sequenceDiagram
    participant Dev as 開発者
    participant PR as Pull Request
    participant CI as CI/CD
    participant AI as AI
    participant MCP as Svelte MCP

    Dev->>PR: コード変更をPush
    PR->>CI: PRトリガー
    CI->>AI: 変更されたSvelteファイル

    loop 各ファイルをチェック
      AI->>MCP: svelte-autofixer(コード)
      MCP-->>AI: issues / suggestions
    end

    alt issues がある場合
      AI-->>CI: ❌ 問題を検出
      CI-->>PR: レビューコメント追加
    else issues がない場合
      AI-->>CI: ✅ チェック通過
      CI-->>PR: Approved
    end`;

  const overviewDiagram = `graph TB
    subgraph "学習"
      UC1[UC1: Runesを学ぶ]
      UC6[UC6: リアルタイム学習支援]
    end

    subgraph "開発"
      UC2[UC2: コンポーネント生成]
      UC5[UC5: Playground確認]
    end

    subgraph "保守"
      UC3[UC3: Svelte 4→5 移行]
      UC4[UC4: 品質保証]
    end

    UC1 --> UC2
    UC6 --> UC2
    UC2 --> UC5
    UC3 --> UC4

    style UC1 fill:#dbeafe,stroke:#2563eb
    style UC6 fill:#dbeafe,stroke:#2563eb
    style UC2 fill:#dcfce7,stroke:#16a34a
    style UC5 fill:#dcfce7,stroke:#16a34a
    style UC3 fill:#fef3c7,stroke:#d97706
    style UC4 fill:#fef3c7,stroke:#d97706`;
</script>

Svelte MCP の具体的な活用シナリオを紹介します。

<Mermaid diagram={overviewDiagram} />

## UC1: Svelte 5 の Runes について学ぶ

### シナリオ

開発者が「`$state`の使い方を教えて」と AI に質問する。

### フロー

<Mermaid diagram={uc1Diagram} />

### 結果

- LLM の学習データではなく、**最新の公式ドキュメント**に基づいた回答
- Svelte 5 の正確な構文とベストプラクティスを取得
- 古い Svelte 4 の情報と混同しない

### 実際の会話例

```
👤: Svelte 5の$stateと$derivedの違いを教えて

🤖: [list-sections を呼び出し]
    [get-documentation で関連セクションを取得]

    $state と $derived は Svelte 5 の Runes システムの中核です。

    **$state** - リアクティブな状態を宣言
    - プリミティブ値、オブジェクト、配列に使用
    - 値を直接変更すると自動的にUIが更新

    **$derived** - 他の状態から計算される派生値
    - 依存する値が変更されると自動再計算
    - 読み取り専用（直接代入不可）

    [コード例を提示...]
```

## UC2: コンポーネント生成

### シナリオ

「Svelte 5 でカウンターコンポーネントを作って」とリクエストする。

### フロー

```
1. 開発者 → AI: "Svelte 5でカウンターを作って"
2. AI → MCP: list-sections()
3. AI → MCP: get-documentation(["svelte/runes/state"])
4. AI: コード生成
5. AI → MCP: svelte-autofixer(生成コード)
6. MCP → AI: {issues: [], suggestions: []}
7. AI → 開発者: 検証済みコード
```

### 結果

Svelte 5 の正しい構文でコンポーネントが生成される。

```svelte
<script lang="ts">
  let count = $state(0);

  function increment() {
    count++;
  }

  function decrement() {
    count--;
  }
</script>

<div class="counter">
  <button onclick={decrement}>-</button>
  <span>{count}</span>
  <button onclick={increment}>+</button>
</div>
```

**ポイント**: `on:click` ではなく `onclick`、`let count = 0` ではなく `$state(0)` が使われている。

## UC3: Svelte 4 → 5 移行支援

### シナリオ

開発者が Svelte 4 のコードを Svelte 5 に移行したい。

### フロー

<Mermaid diagram={uc3Diagram} />

### Before（Svelte 4）

```svelte
<script>
  export let initialCount = 0;

  let count = initialCount;
  $: doubled = count * 2;
  $: {
    console.log('count changed:', count);
  }
</script>

<button on:click={() => count++}>
  {count} (doubled: {doubled})
</button>
```

### After（Svelte 5）

```svelte
<script lang="ts">
  interface Props {
    initialCount?: number;
  }

  let { initialCount = 0 }: Props = $props();

  let count = $state(initialCount);
  let doubled = $derived(count * 2);

  $effect(() => {
    console.log('count changed:', count);
  });
</script>

<button onclick={() => count++}>
  {count} (doubled: {doubled})
</button>
```

### 検出される変更点

| Svelte 4           | Svelte 5                 | 変更理由                 |
| ------------------ | ------------------------ | ------------------------ |
| `export let`       | `$props()`               | 新しい props 構文        |
| `let count = x`    | `$state(x)`              | 明示的なリアクティビティ |
| `$: doubled = ...` | `$derived(...)`          | 派生値の宣言             |
| `$: { ... }`       | `$effect(() => { ... })` | 副作用の明示             |
| `on:click`         | `onclick`                | イベントハンドラ構文     |

## UC4: チーム開発での品質保証

### シナリオ

PR（Pull Request）時に AI が自動で Svelte コードの品質をチェックする。

### フロー

<Mermaid diagram={uc4Diagram} />

### CI/CD 統合例（GitHub Actions）

```yaml
name: Svelte Code Review

on:
  pull_request:
    paths:
      - '**.svelte'

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: AI Code Review
        uses: your-org/ai-review-action@v1
        with:
          mcp-server: svelte
          check-command: svelte-autofixer
```

### 結果

- コード品質が自動的に保証される
- レビュー時間の短縮
- Svelte 5 ベストプラクティスの自動適用

## UC5: Playground での動作確認

### シナリオ

生成したコードをすぐに試したい。

### フロー

```
1. 開発者 → AI: "Todoコンポーネントを作って"
2. AI: コード生成 + svelte-autofixer で検証
3. AI → 開発者: "コードを作成しました。Playgroundで試しますか？"
4. 開発者 → AI: "はい"
5. AI → MCP: playground-link(生成コード)
6. MCP → AI: https://svelte.dev/playground/xxxx
7. 開発者: ブラウザで開いて動作確認
```

### 結果

- すぐに動作確認ができる
- コードをコピー&ペーストする手間が不要
- 共有可能な URL で他のメンバーにも展開可能

## UC6: リアルタイム学習支援

### シナリオ

開発中にわからないことがあったとき、その場で質問して解決する。

### フロー

```
開発者: (コードを書いている)
開発者 → AI: "$stateで配列を扱う時のベストプラクティスは？"
AI → MCP: get-documentation(["svelte/runes/state"])
AI → 開発者: 配列操作のベストプラクティスを解説
開発者: すぐに正しい実装ができる
```

### 実際の会話例

```
👤: $stateの配列でpushを使うとリアクティブにならないんだけど？

🤖: Svelte 5の$stateでは、配列のメソッド（push, pop等）は
    リアクティブに動作します。ただし、以下の点に注意してください。

    ✅ 正しい方法：
    let items = $state<string[]>([]);
    items.push('new item');  // これでOK、自動的に更新される

    ❌ 動作しない場合：
    - $state.frozen() を使っている場合は不変
    - 外部から渡された配列を直接操作している場合

    [詳細な例とパターンを提示...]
```

## MCP の価値まとめ

### 開発者にとって

- ✅ 常に最新の情報にアクセス
- ✅ 学習コストの削減
- ✅ 正確なコード生成

### チームにとって

- ✅ コード品質の自動保証
- ✅ レビュー時間の短縮
- ✅ 統一されたベストプラクティス

### エコシステムにとって

- ✅ Svelte 5 の正しい普及
- ✅ 古いパターンの排除
- ✅ コミュニティ全体の品質向上
