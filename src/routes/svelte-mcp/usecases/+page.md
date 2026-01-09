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

    style UC1 fill:#dbeafe,stroke:#2563eb,color:#1e3a5f
    style UC6 fill:#dbeafe,stroke:#2563eb,color:#1e3a5f
    style UC2 fill:#dcfce7,stroke:#16a34a,color:#14532d
    style UC5 fill:#dcfce7,stroke:#16a34a,color:#14532d
    style UC3 fill:#fef3c7,stroke:#d97706,color:#78350f
    style UC4 fill:#fef3c7,stroke:#d97706,color:#78350f`;
</script>

Svelte MCP の具体的な活用シナリオを紹介します。

Svelte MCP は単なるドキュメント検索ツールではありません。学習から開発、保守まで、Svelte 開発のあらゆるフェーズで活用できます。以下では、実際の開発現場で想定される 6 つのユースケースを、具体的な会話例やコード例とともに解説します。

<Mermaid diagram={overviewDiagram} />

上の図は、ユースケースを「学習」「開発」「保守」の 3 つのカテゴリに分類したものです。実際の開発では、これらのユースケースは相互に関連しています。例えば、新しい Runes を学習（UC1）した後、その知識を使ってコンポーネントを生成（UC2）し、Playground で動作確認（UC5）するという流れが一般的です。

## UC1: Svelte 5 の Runes について学ぶ

Svelte 5 で導入された Runes システムは、従来の `$:` リアクティブ文や `export let` とは全く異なるアプローチを取ります。公式ドキュメントを読むだけでは理解しにくい場合も、AI に質問することで自分のペースで学習できます。

### シナリオ

開発者が「`$state`の使い方を教えて」と AI に質問する。

### フロー

以下の図は、学習時の典型的なツール呼び出しフローです。LLM は最初に `list-sections` でドキュメント構造を把握し、関連するセクションを `get-documentation` で取得してから回答を生成します。

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

AI によるコード生成は非常に便利ですが、生成されたコードが古い構文を使っていたり、ベストプラクティスに従っていなかったりすることがあります。Svelte MCP を使うと、生成されたコードは `svelte-autofixer` によって自動検証され、問題があれば修正された上でユーザーに提供されます。

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

既存の Svelte 4 プロジェクトを Svelte 5 に移行する作業は、単純な置換では済みません。`$:` から `$derived` へ、`export let` から `$props()` へ、`on:click` から `onclick` へなど、多くの変更が必要です。Svelte MCP は、古いコードを解析して問題点を特定し、最新の構文に変換する手助けをします。

### シナリオ

開発者が Svelte 4 のコードを Svelte 5 に移行したい。

### フロー

以下の図は、移行支援の流れを示しています。まず `svelte-autofixer` で古い構文を検出し、関連するドキュメントを参照した上で、新しい構文に変換したコードを生成します。

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

チーム開発では、メンバーによって Svelte の習熟度が異なることがあります。経験の浅いメンバーが古い構文を使ったコードをコミットしてしまうと、コードベースの一貫性が損なわれます。CI/CD パイプラインに Svelte MCP を統合することで、PR 時に自動的にコード品質をチェックし、問題があればレビューコメントとして指摘できます。

### シナリオ

PR（Pull Request）時に AI が自動で Svelte コードの品質をチェックする。

### フロー

以下の図は、PR 時の自動チェックフローを示しています。変更された Svelte ファイルに対して `svelte-autofixer` を実行し、問題があればレビューコメントとして自動的にフィードバックします。

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

コードを見ただけでは、実際にどのように動作するかイメージしにくいことがあります。特に、アニメーションやインタラクティブな UI の場合は、実際に動かしてみないとわかりません。`playground-link` ツールを使うと、生成したコードをワンクリックで Svelte Playground 上で実行でき、その場で編集・実験することも可能です。

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

開発中に「この書き方で正しいのかな？」「もっと良い方法があるのでは？」と疑問に思うことがあります。ドキュメントを検索して読み込む時間がない場合でも、AI に質問すれば即座に回答が得られます。Svelte MCP が接続されていれば、その回答は最新の公式ドキュメントに基づいた正確なものになります。

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

ここまで紹介した 6 つのユースケースからわかるように、Svelte MCP は Svelte 開発のあらゆる場面で価値を発揮します。個人の学習から、チーム全体の品質管理まで、その恩恵は幅広く及びます。

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
