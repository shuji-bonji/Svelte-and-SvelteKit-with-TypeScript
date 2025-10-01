---
title: サーバーサイド処理
description: SvelteKitのサーバーサイドアーキテクチャの全体像 - ファイルタイプ、実行環境、セキュリティモデルを理解し、適切な実装パターンを選択する方法を解説
---

<script>
  import Mermaid from '$lib/components/Mermaid.svelte';
  import { base } from '$app/paths';

  const serverFilesChart = `graph TD
    A[クライアントリクエスト] --> B{ファイルタイプ}
    B --> C[+page.server.ts]
    B --> D[+layout.server.ts]
    B --> E[+server.ts]
    B --> F[hooks.server.ts]

    C --> G[SSR時に実行]
    D --> G
    E --> H[APIエンドポイント]
    F --> I[全リクエストで実行]

    style C fill:#f9f,stroke:#333,stroke-width:2px,color:#333
    style D fill:#f9f,stroke:#333,stroke-width:2px,color:#333
    style E fill:#9ff,stroke:#333,stroke-width:2px,color:#333
    style F fill:#ff9,stroke:#333,stroke-width:2px,color:#333`;

  const executionFlow = `sequenceDiagram
    participant Client as クライアント
    participant Hooks as hooks.server.ts
    participant Layout as +layout.server.ts
    participant Page as +page.server.ts
    participant API as +server.ts

    Client->>Hooks: リクエスト
    Hooks->>Hooks: handle()実行<br/>認証・ログ

    alt ページアクセス
        Hooks->>Layout: load()実行
        Layout->>Layout: 共通データ取得
        Layout->>Page: load()実行
        Page->>Page: ページデータ取得
        Page-->>Client: HTML + データ
    else APIアクセス
        Hooks->>API: GET/POST/PUT/DELETE
        API->>API: ビジネスロジック
        API-->>Client: JSON レスポンス
    end`;

  const securityModel = `graph LR
    A[クライアント] -->|公開情報のみ| B[+page.ts]
    A -->|HTTP リクエスト| C[サーバーサイド]

    C --> D[+page.server.ts]
    C --> E[+server.ts]
    C --> F[hooks.server.ts]

    D --> G[環境変数<br/>DB接続<br/>APIキー]
    E --> G
    F --> G

    G -->|安全に処理| H[レスポンス]
    H -->|必要な情報のみ| A

    style A fill:#e1f5ff,stroke:#333,stroke-width:2px,color:#333
    style C fill:#ffe1e1,stroke:#333,stroke-width:2px,color:#333
    style G fill:#fff4e1,stroke:#333,stroke-width:2px,color:#333`;
</script>

SvelteKitのサーバーサイド処理の全体像を理解し、適切なファイルタイプと実装パターンを選択する方法を学びます。

## SvelteKitのサーバーサイドアーキテクチャ

SvelteKitは、Node.jsベースのサーバーサイド処理を提供し、以下の機能を実現します。

- **SSR（Server-Side Rendering）**: SEOとパフォーマンスの最適化
- **データプリフェッチング**: 高速なページ遷移
- **セキュアな処理**: 機密情報の保護、認証処理
- **API開発**: RESTful APIエンドポイントの構築

### サーバーサイドファイルの種類と役割

SvelteKitでは、ファイル名の命名規則によってサーバーサイドで実行されるコードを明確に分離できます。

<Mermaid chart={serverFilesChart} />

| ファイルタイプ | 実行タイミング | 主な用途 |
|--------------|--------------|---------|
| **+page.server.ts** | ページのSSR時 | ページ固有のデータ取得、Form Actions |
| **+layout.server.ts** | レイアウトのSSR時 | 共通データ取得、認証チェック |
| **+server.ts** | APIリクエスト時 | RESTful APIエンドポイント |
| **hooks.server.ts** | すべてのリクエスト | 認証、ログ、エラー処理、CORS |

:::tip[ファイル選択のガイドライン]
- **ページデータが必要** → `+page.server.ts`
- **複数ページで共通のデータ** → `+layout.server.ts`
- **JSON APIが必要** → `+server.ts`
- **すべてのリクエストで実行** → `hooks.server.ts`
:::

### リクエスト処理フロー

以下の図は、クライアントからのリクエストがどのように処理されるかを示しています。

<Mermaid chart={executionFlow} />

## セキュリティモデル

SvelteKitのサーバーサイド処理は、機密情報を安全に扱うための明確な境界を提供します。

<Mermaid chart={securityModel} />

### クライアントサイドとサーバーサイドの区別

| 実行場所 | アクセス可能な情報 | ファイルタイプ |
|---------|-----------------|--------------|
| **サーバーのみ** | 環境変数、データベース、APIキー | `*.server.ts`、`$lib/server/` |
| **両方** | 公開情報、公開API URL | `*.ts`、`*.svelte` |

:::warning[重要なセキュリティ原則]
- **機密情報**（APIキー、DBパスワード等）は`*.server.ts`または`$lib/server/`に配置
- **環境変数**は`$env/static/private`を使用（`process.env`も可）
- **クライアントに送信するデータ**は必要最小限に絞る
:::

## 実装パターンへのリンク

SvelteKitのサーバーサイド機能は、用途に応じて以下のトピックに分かれています。詳細は各ページを参照してください。

<div class="cards-grid">

<div class="card">

### 📊 データ取得

Load関数を使用したデータフェッチングパターンを学びます。

- **[Load関数の基礎]({base}/sveltekit/data-loading/basic/)**
- **[TypeScript型の自動生成]({base}/sveltekit/data-loading/typescript-types/)**
- **[データフェッチング戦略]({base}/sveltekit/data-loading/strategies/)**

</div>

<div class="card">

### 📝 フォーム処理

Progressive Enhancementなフォーム実装とバリデーション。

- **[フォーム処理とActions]({base}/sveltekit/server/forms/)**

Form Actions、バリデーション、ファイルアップロード

</div>

<div class="card">

### 🔌 API開発

RESTful APIエンドポイントの構築とセキュリティ対策。

- **[APIルート設計]({base}/sveltekit/server/api-routes/)**

APIエンドポイント、認証、CORS、レート制限

</div>

<div class="card">

### ⚡ リアルタイム通信

WebSocketとServer-Sent Eventsを使用したリアルタイム機能。

- **[WebSocket・SSE]({base}/sveltekit/server/websocket-sse/)**

チャット、通知、ライブフィード

</div>

<div class="card">

### 🎣 横断的関心事

すべてのリクエストに対する共通処理。

- **[Hooks]({base}/sveltekit/server/hooks/)**

handle、handleFetch、handleError

</div>

<div class="card">

### 🛠️ アプリケーション開発

実践的なアプリケーション開発のベストプラクティス。

- **[セッション管理と認証戦略]({base}/sveltekit/application/session/)**
- **[認証ベストプラクティス]({base}/sveltekit/application/auth-best-practices/)**
- **[テスト戦略]({base}/sveltekit/application/testing/)**

</div>

<div class="card">

### 🔐 実装例

実践的な認証実装のサンプルコードとチュートリアル。

- **[Cookie/Session認証]({base}/examples/auth-cookie-session/)** - 最も安全な認証方式の完全実装
- **[WebSocket実装]({base}/examples/websocket/)** - リアルタイム通信の実装例

</div>

</div>

<style>
  .cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
    margin: 2rem 0;
  }

  .card {
    border: 1px solid var(--vp-c-divider);
    border-radius: 8px;
    padding: 1.5rem;
    background: var(--vp-c-bg-soft);
    transition: all 0.2s ease;
  }

  .card:hover {
    border-color: var(--vp-c-brand);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }

  .card h3 {
    margin-top: 0;
    margin-bottom: 0.75rem;
    color: var(--vp-c-brand);
    font-size: 1.1rem;
    border-bottom: none;
  }

  .card p {
    margin: 0.5rem 0;
    color: var(--vp-c-text-2);
    font-size: 0.9rem;
  }

  .card ul {
    list-style: none;
    padding: 0;
    margin: 0.5rem 0 0 0;
  }

  .card li {
    margin: 0.5rem 0;
  }

  .card a {
    color: var(--vp-c-brand);
    text-decoration: none;
    font-weight: 500;
  }

  .card a:hover {
    text-decoration: underline;
  }
</style>

## アーキテクチャの詳細

SvelteKitの内部動作やレンダリングパイプラインについて深く理解したい場合は、以下のページを参照してください。

- **[アーキテクチャ概要]({base}/sveltekit/architecture/)** - SvelteKitのアーキテクチャ全体像
- **[レンダリングパイプライン]({base}/sveltekit/architecture/rendering-pipeline/)** - コンパイルから実行まで
- **[データロードアーキテクチャ]({base}/sveltekit/architecture/data-loading/)** - Load関数の内部動作

## まとめ

SvelteKitのサーバーサイド処理は、以下の原則に基づいて設計されています。

1. **明確な境界** - ファイル名規則による実行環境の区別
2. **セキュリティファースト** - 機密情報の安全な取り扱い
3. **柔軟性** - SSR、API、リアルタイム通信など多様なユースケースに対応
4. **型安全性** - TypeScriptとの完全な統合

各実装パターンの詳細は、上記リンクから該当ページを参照してください。
