---
title: ファイル構成と実行環境
description: SvelteKitのファイル構成と実行環境をTypeScriptで完全理解 - +page、+layout、+server、+error各ファイルの役割、実行タイミング、サーバー/クライアント環境、エクスポート設定を実例を交えて体系的かつ詳しく解説します
---

<script>
  import { base } from '$app/paths';
  import Mermaid from '$lib/components/Mermaid.svelte';

  const executionEnvironmentDiagram = `graph RL
    subgraph "ビルド時"
        direction TB
        B[Viteビルダー]
        B --> B1[+page.svelte]
        B --> B2[+page.ts]
        B --> B3[+page.server.ts]
        B --> B4[+layout.svelte]
        B --> B5[+server.ts]
    end

    subgraph "サーバー実行環境"
        direction TB
        S[Node.js/Edge Runtime]
        S --> S1[+page.server.ts]
        S --> S2[+layout.server.ts]
        S --> S3[+server.ts]
        S --> S4[hooks.server.ts]
        S --> S5[app.html]
    end

    subgraph "クライアント実行環境"
        direction TB
        C[ブラウザ]
        C --> C1[+page.svelte]
        C --> C2[+page.ts]
        C --> C3[+layout.svelte]
        C --> C4[+layout.ts]
        C --> C5[hooks.client.ts]
    end

    subgraph "両方で実行"
        direction TB
        U[Universal]
        U --> U1[+page.ts]
        U --> U2[+layout.ts]
        U --> U3[app.d.ts]
    end

    B1 --> C1
    B1 --> S1
    B2 --> C2
    B2 --> S1
    B3 --> S1
    B4 --> C3
    B4 --> S2
    B5 --> S3

    style B fill:#f9f,stroke:#333,stroke-width:2px
    style S fill:#bbf,stroke:#333,stroke-width:2px
    style C fill:#fbf,stroke:#333,stroke-width:2px
    style U fill:#fbb,stroke:#333,stroke-width:2px`;

  const fileFlowDiagram = `sequenceDiagram
    participant User as ユーザー
    participant Browser as ブラウザ
    participant Server as サーバー
    participant PageServer as +page.server.ts
    participant PageUniversal as +page.ts
    participant PageSvelte as +page.svelte
    participant LayoutServer as +layout.server.ts
    participant LayoutSvelte as +layout.svelte

    User->>Browser: ページアクセス
    Browser->>Server: HTTPリクエスト

    rect rgba(100, 100, 255, 0.1)
        Note over Server: サーバー側実行
        Server->>LayoutServer: layout.server.load()
        LayoutServer-->>Server: サーバー専用データ
        Server->>PageServer: page.server.load()
        PageServer-->>Server: サーバーデータ
    end

    rect rgba(255, 100, 100, 0.1)
        Note over Server: Universal実行（SSR時）
        Server->>PageUniversal: page.load()
        PageUniversal-->>Server: 共通データ
    end

    Server->>PageSvelte: データ渡し
    PageSvelte->>LayoutSvelte: レイアウトに組み込み
    Server-->>Browser: HTML送信

    rect rgba(100, 255, 100, 0.1)
        Note over Browser: クライアント側実行
        Browser->>PageUniversal: page.load()（CSR時）
        PageUniversal-->>Browser: データ取得
        Browser->>PageSvelte: ハイドレーション
    end`;

  const fileTypesTable = `graph TB
    subgraph "ページ関連ファイル"
        P1["+page.svelte<br/>UIコンポーネント"]
        P2["+page.ts<br/>Universal Load"]
        P3["+page.server.ts<br/>Server Load"]
    end

    subgraph "レイアウト関連ファイル"
        L1["+layout.svelte<br/>レイアウトUI"]
        L2["+layout.ts<br/>Universal Load"]
        L3["+layout.server.ts<br/>Server Load"]
    end

    subgraph "API/サーバーファイル"
        A1["+server.ts<br/>APIエンドポイント"]
        A2["hooks.server.ts<br/>サーバーフック"]
        A3["hooks.client.ts<br/>クライアントフック"]
    end

    subgraph "その他の重要ファイル"
        O1["app.html<br/>HTMLテンプレート"]
        O2["app.d.ts<br/>型定義"]
        O3["+error.svelte<br/>エラーページ"]
    end

    style P1 fill:#e1f5fe
    style P2 fill:#fff9c4
    style P3 fill:#e3f2fd
    style L1 fill:#e1f5fe
    style L2 fill:#fff9c4
    style L3 fill:#e3f2fd
    style A1 fill:#e3f2fd
    style A2 fill:#e3f2fd
    style A3 fill:#f3e5f5`;

  const dataFlowDiagram = `graph TB
    subgraph "サーバー側ファイル"
        direction TB
        HS[hooks.server.ts]
        LS[+layout.server.ts]
        PS[+page.server.ts]
        SV[+server.ts]
        ENV[環境変数<br/>$env/static/private]
    end

    subgraph "ユニバーサルファイル"
        LT[+layout.ts]
        PT[+page.ts]
        PUB[公開変数<br/>$env/static/public]
    end

    subgraph "UIファイル"
        LSV[+layout.svelte]
        PSV[+page.svelte]
        ERR[+error.svelte]
    end

    subgraph "型定義"
        APP[app.d.ts]
        TYPES[$types]
    end

    HS --> LS
    LS --> PS
    PS --> PT
    PT --> PSV
    LS --> LT
    LT --> LSV
    LSV --> PSV
    ENV -.-> PS
    ENV -.-> LS
    ENV -.-> SV
    PUB -.-> PT
    PUB -.-> PSV
    APP -.-> TYPES
    TYPES -.-> PS
    TYPES -.-> PT
    TYPES -.-> PSV

    style HS fill:#e3f2fd
    style LS fill:#e3f2fd
    style PS fill:#e3f2fd
    style SV fill:#e3f2fd
    style ENV fill:#ffecb3
    style LT fill:#fff9c4
    style PT fill:#fff9c4
    style PUB fill:#f0f4c3
    style LSV fill:#e1f5fe
    style PSV fill:#e1f5fe
    style ERR fill:#ffccbc
    style APP fill:#f3e5f5
    style TYPES fill:#f3e5f5`;

  const renderingStrategyDiagram = `graph TB
    subgraph "ビルド時（Static）"
        direction TB
        PRE[プリレンダリング<br/>export const prerender = true]
        PRE --> HTML[静的HTML生成]
    end

    subgraph "サーバー実行時（Dynamic）"
        direction TB
        SSR[SSR<br/>export const ssr = true]
        SSR --> SHTML[動的HTML生成]
    end

    subgraph "クライアント実行時（Interactive）"
        direction TB
        CSR[CSR<br/>export const csr = true]
        CSR --> DOM[DOM操作]
    end

    subgraph "ハイブリッド"
        direction TB
        HYB[SSR + CSR]
        HYB --> BOTH[初回はサーバー<br/>以降はクライアント]
    end

    style PRE fill:#c8e6c9
    style SSR fill:#bbdefb
    style CSR fill:#ffe0b2
    style HYB fill:#f8bbd0`;

  const hooksFlowDiagram = `graph LR
    subgraph "Hooksの実行フロー"
        REQ[リクエスト]
        H1[handle 関数 1]
        H2[handle 関数 2]
        H3[handle 関数 3]
        ROUTE[ルート処理]
        RES[レスポンス]
    end

    REQ --> H1
    H1 --> H2
    H2 --> H3
    H3 --> ROUTE
    ROUTE --> RES

    H1 -.-> |"resolve()"| H2
    H2 -.-> |"resolve()"| H3
    H3 -.-> |"resolve()"| ROUTE

    style REQ fill:#e1f5fe
    style RES fill:#c8e6c9
    style ROUTE fill:#fff9c4`;
</script>

SvelteKitのファイル構成は、それぞれのファイルが特定の実行環境と役割を持つよう設計されています。このページでは、各ファイルタイプの詳細な動作と、それらがどの環境で実行されるかを解説します。

## ファイルタイプと実行環境の概要

SvelteKitでは、ファイル名の命名規則によって実行環境が決定されます。これにより、開発者は明示的に実行環境を意識してコードを記述できます。

<Mermaid diagram={executionEnvironmentDiagram} />

### 実行環境の分類

SvelteKitのファイルは、以下の3つの実行環境に分類されます。

1. **サーバー専用**: Node.js/Edge Runtimeでのみ実行
2. **クライアント専用**: ブラウザでのみ実行
3. **ユニバーサル**: 両方の環境で実行可能

## ファイルタイプ詳解

<Mermaid diagram={fileTypesTable} />

### ページファイル（+page）

ページファイルは、個々のページのコンテンツとロジックを定義します。これらは3つの異なる形式があり、それぞれ異なる実行環境と責任を持ちます。

#### +page.svelte

**役割**: ページのUIコンポーネントを定義するファイルです。Svelteコンポーネントとして記述し、HTMLとリアクティブなロジックを含みます。

このファイルは、ページの視覚的な表現を担当し、ユーザーインターフェースの構造とインタラクションを定義します。SSR時はサーバーでHTMLを生成し、CSR時はブラウザでDOMを操作します。

**実行環境**:
- SSR時: サーバーで実行してHTML生成
- CSR時: クライアントで実行してDOM操作
- ハイドレーション: 両環境で実行

以下の例では、+page.svelteファイルの典型的な構造を示します。サーバーとクライアントの両方で動作するコードと、クライアントのみで動作するコードの書き分けに注意してください。

```svelte
<!-- +page.svelte -->
<script lang="ts">
  import type { PageData } from './$types';

  // Load関数からのデータを受け取る
  let { data }: { data: PageData } = $props();

  // クライアント専用のコード
  import { onMount } from 'svelte';

  onMount(() => {
    // ブラウザでのみ実行される
    console.log('Component mounted in browser');
  });
</script>

<h1>{data.title}</h1>
<p>{data.content}</p>

<!-- 条件付きレンダリング -->
{#if data.user}
  <p>ようこそ、{data.user.name}さん</p>
{/if}

<style>
  /* スタイルはコンポーネントスコープ */
  h1 {
    color: #333;
  }
</style>
```

#### +page.ts - ユニバーサルLoad関数

**+page.tsファイルは、サーバーとクライアントの両方で実行される「ユニバーサル」なLoad関数を定義します。** このファイルは、公開可能なデータの取得や、クライアントサイドでのデータ処理に適しています。

ユニバーサルLoad関数の主な特徴
- **初回アクセス時**：サーバー側でSSR時に実行
- **クライアントナビゲーション時**：ブラウザ上で実行
- **fetch関数の自動最適化**：SvelteKitが提供する特別なfetch関数を使用
- **キャッシュ制御**：depends関数によるきめ細かい無効化制御

以下は、ユニバーサルLoad関数の実装例です。

**実行環境**:
- SSR時: サーバーで実行
- CSR/ナビゲーション時: クライアントで実行
- プリレンダリング時: ビルド時に実行

```typescript
// +page.ts
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, url, fetch }) => {
  // 両環境で動作するコード
  const response = await fetch('/api/data');
  const data = await response.json();

  // クライアント限定の処理
  if (typeof window !== 'undefined') {
    // localStorage へのアクセスなど
    const cached = localStorage.getItem('cache');
  }

  return {
    title: 'ページタイトル',
    content: data.content,
    timestamp: Date.now()
  };
};

// プリレンダリング設定
export const prerender = true;  // ビルド時に静的生成
export const ssr = true;         // SSRを有効化
export const csr = true;         // CSRを有効化
```

#### +page.server.ts - サーバー専用Load関数とForm Actions

**+page.server.tsは、機密情報を扱う処理やデータベースアクセスなど、サーバーでのみ実行すべき処理を定義する最も重要なファイルの一つです。** このファイルには、Load関数に加えて、フォーム送信を処理するForm Actionsも定義できます。

サーバー専用ファイルの利点
- **セキュリティ**：APIキーやデータベース接続情報を安全に扱える
- **パフォーマンス**：データベースへの直接アクセスで高速化
- **Form Actions**：プログレッシブエンハンスメント対応のフォーム処理
- **バンドルサイズ削減**：サーバー専用コードはクライアントに送信されない

実装例では、データベースアクセスとフォーム処理の両方を示します。

**実行環境**: サーバーのみ（Node.js/Edge Runtime）

```typescript
// +page.server.ts
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/database';
import { SECRET_API_KEY } from '$env/static/private';

// サーバー専用のLoad関数
export const load: PageServerLoad = async ({ cookies, locals }) => {
  // データベースアクセス（サーバーのみ）
  const user = await db.user.findUnique({
    where: { id: locals.userId }
  });

  // 環境変数へのアクセス（サーバーのみ）
  const apiData = await fetch('https://api.example.com/data', {
    headers: {
      'Authorization': `Bearer ${SECRET_API_KEY}`
    }
  });

  return {
    user,
    serverTime: new Date().toISOString()
  };
};

// Form Actions（サーバーのみ）
export const actions: Actions = {
  update: async ({ request, cookies }) => {
    const formData = await request.formData();
    const name = formData.get('name');

    // データベース更新
    await db.user.update({
      where: { id: cookies.get('userId') },
      data: { name }
    });

    return { success: true };
  }
};
```

### レイアウトファイル（+layout）

**レイアウトファイルは、アプリケーションの構造を階層的に定義し、共通のUI要素やデータを効率的に管理するための仕組みです。** ネストされたルート間でナビゲーションバーやサイドバーなどの共通要素を維持し、ページ遷移時の再レンダリングを最小限に抑えます。

レイアウトシステムの重要な概念
- **階層的な継承**：親レイアウトの設定が子ルートに継承される
- **部分的な再レンダリング**：レイアウトが変わらない限り維持される
- **データの共有**：レイアウトのLoad関数で取得したデータは子ページで利用可能
- **リセット機能**：必要に応じてレイアウトの継承を断ち切ることも可能

#### +layout.svelte - レイアウトUI

**役割**: ページ間で共有されるレイアウトUIを定義します。ナビゲーションバー、サイドバー、フッターなどの共通要素を配置します。

**実行環境**: +page.svelteと同様（サーバー/クライアント両方）

```svelte
<!-- +layout.svelte -->
<script lang="ts">
  import type { LayoutData } from './$types';
  import type { Snippet } from 'svelte';

  // レイアウトデータと子要素
  let { data, children }: { data: LayoutData; children?: Snippet } = $props();
</script>

<nav>
  <a href="/">ホーム</a>
  {#if data.user}
    <a href="/dashboard">ダッシュボード</a>
    <span>{data.user.name}</span>
  {:else}
    <a href="/login">ログイン</a>
  {/if}
</nav>

<main>
  <!-- 子ページのコンテンツ -->
  {@render children?.()}
</main>

<footer>
  <p>&copy; 2025 My App</p>
</footer>

<style>
  nav {
    display: flex;
    gap: 1rem;
    padding: 1rem;
    background: #f0f0f0;
  }

  main {
    min-height: 80vh;
    padding: 2rem;
  }
</style>
```

#### +layout.ts - ユニバーサルLayout Load

**レイアウトのLoad関数は、そのレイアウト配下のすべてのページで共通して必要なデータを取得します。** ユーザー情報、ナビゲーションメニュー、設定情報など、アプリケーション全体で使用するデータの取得に最適です。

```typescript
// +layout.ts
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ url, fetch }) => {
  // ナビゲーションメニューの取得
  const menuResponse = await fetch('/api/menu');
  const menu = await menuResponse.json();

  // 現在のパスに基づく処理
  const currentSection = url.pathname.split('/')[1];

  return {
    menu,
    currentSection
  };
};
```

#### +layout.server.ts - サーバー専用Layout Load

**サーバー専用のレイアウトLoad関数は、認証情報の検証やセッション管理など、セキュリティが重要な共通処理を実装する場所です。** ここで取得したデータは、配下のすべてのページで利用できます。

```typescript
// +layout.server.ts
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
  // 全ページで必要な認証情報
  return {
    user: locals.user
  };
};
```

### APIエンドポイント（+server）

**+server.tsファイルは、SvelteKitアプリケーション内にRESTful APIエンドポイントを実装するための専用ファイルです。** このファイルは完全にサーバーサイドで実行され、外部クライアントやアプリケーション内部からのHTTPリクエストを処理します。

APIエンドポイントの特徴
- **標準的なHTTPメソッド**：GET、POST、PUT、DELETE、PATCHなどに対応
- **Request/Response API**：Web標準のAPIを使用
- **CORS対応**：適切なヘッダー設定で外部からのアクセスも可能
- **ストリーミング対応**：大きなデータの効率的な送信
- **WebSocket/SSEの起点**：リアルタイム通信の実装も可能

以下は、完全なCRUD操作を実装したAPIエンドポイントの例です。

**実行環境**: サーバーのみ

```typescript
// +server.ts
import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { db } from '$lib/server/database';

// GET /api/users
export const GET: RequestHandler = async ({ url }) => {
  const limit = Number(url.searchParams.get('limit') ?? '10');

  const users = await db.user.findMany({
    take: limit
  });

  return json(users);
};

// POST /api/users
export const POST: RequestHandler = async ({ request }) => {
  const data = await request.json();

  const user = await db.user.create({
    data: {
      name: data.name,
      email: data.email
    }
  });

  return json(user, { status: 201 });
};

// DELETE /api/users/[id]
export const DELETE: RequestHandler = async ({ params }) => {
  await db.user.delete({
    where: { id: params.id }
  });

  return new Response(null, { status: 204 });
};
```

## ファイル間のデータフロー

**SvelteKitでは、各ファイルが特定の役割を持ち、データが階層的に流れていきます。** 以下の図は、ファイル間のデータの流れと依存関係を示しています。

<Mermaid diagram={dataFlowDiagram} />

### データフローの重要なポイント

1. **階層的な実行順序**: hooks.server.ts → +layout.server.ts → +page.server.ts → +page.ts の順に実行
2. **環境変数の分離**: `$env/static/private`はサーバー側のみ、`$env/static/public`は両環境でアクセス可能
3. **型の自動生成**: app.d.tsの定義が`$types`を通じて各ファイルで利用可能
4. **レイアウトの継承**: レイアウトのデータは子ページに自動的に引き継がれる

## 実行フローの詳細

<Mermaid diagram={fileFlowDiagram} />

### SSR時の実行順序

1. **hooks.server.ts** - リクエストを受け取り、前処理を実行
2. **+layout.server.ts** - レイアウトのサーバーデータを取得
3. **+page.server.ts** - ページのサーバーデータを取得
4. **+layout.ts** - レイアウトのユニバーサルデータを取得
5. **+page.ts** - ページのユニバーサルデータを取得
6. **+layout.svelte** - レイアウトをサーバーでレンダリング
7. **+page.svelte** - ページをサーバーでレンダリング
8. **app.html** - 最終的なHTMLを生成

### CSR/ナビゲーション時の実行順序

1. **hooks.client.ts** - クライアントでのナビゲーション前処理
2. **+layout.ts** - 必要に応じてレイアウトデータを再取得
3. **+page.ts** - ページデータを取得
4. **+layout.svelte** - レイアウトを更新（必要な場合）
5. **+page.svelte** - ページをレンダリング

## 特殊ファイルの詳細

### 特殊ファイル

**SvelteKitには、アプリケーション全体の動作を制御する特殊なファイルが存在します。** これらのファイルは特定の場所に配置され、フレームワークによって特別な方法で処理されます。

#### app.html - アプリケーションシェル

**app.htmlは、SvelteKitアプリケーションの最外殻となるHTMLテンプレートです。** すべてのページはこのテンプレート内にレンダリングされ、メタタグやグローバルスクリプトの配置場所として機能します。

**役割**: アプリケーション全体のHTMLテンプレートです。SvelteKitが生成するコンテンツを挿入するプレースホルダーを含みます。

**実行環境**: サーバー（SSR時のHTML生成）

```html
<!-- app.html -->
<!DOCTYPE html>
<html lang="ja" data-theme="%sveltekit.theme%">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />

    <!-- SvelteKitが生成するメタタグ -->
    %sveltekit.head%
  </head>
  <body data-sveltekit-preload-data="hover">
    <div style="display: contents">
      <!-- SvelteKitが生成するコンテンツ -->
      %sveltekit.body%
    </div>

    <!-- CSPノンス対応 -->
    %sveltekit.nonce%
  </body>
</html>
```

#### hooks.server.ts - サーバーフック

**hooks.server.tsは、すべてのサーバーリクエストをインターセプトし、共通の処理を実行するための強力な仕組みです。** 認証、ロギング、エラーハンドリング、リクエストの変換など、ミドルウェア的な処理を実装します。

<Mermaid diagram={hooksFlowDiagram} />

サーバーフックの活用例
- **認証チェック**：すべてのリクエストで認証状態を検証
- **ロギング**：アクセスログやエラーログの記録
- **リクエスト変換**：ヘッダーの追加や変更
- **レート制限**：APIの使用制限
- **国際化**：Accept-Languageヘッダーに基づく言語設定

```typescript
// hooks.server.ts
import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';

const authentication: Handle = async ({ event, resolve }) => {
  // 認証トークンの検証
  const token = event.cookies.get('session');

  if (token) {
    // トークンからユーザー情報を取得
    event.locals.user = await validateToken(token);
  }

  return resolve(event);
};

const logging: Handle = async ({ event, resolve }) => {
  const start = performance.now();

  // リクエストを処理
  const response = await resolve(event);

  // レスポンス時間をログ出力
  const duration = performance.now() - start;
  console.log(`${event.request.method} ${event.url.pathname} - ${duration}ms`);

  return response;
};

// 複数のハンドラーを順番に実行
export const handle = sequence(authentication, logging);
```

#### app.d.ts - 型定義

**app.d.tsは、SvelteKitアプリケーション全体で使用される型定義を宣言する中心的なファイルです。** このファイルで定義した型は、すべてのSvelteKitファイルで自動的に利用可能になり、TypeScriptの型安全性を最大限に活用できます。

型定義ファイルの重要性
- **型安全性の保証**：Locals、PageData、Session等の型を厳密に定義
- **開発体験の向上**：IDEの自動補完とエラー検出
- **ドキュメントとしての役割**：アプリケーションの構造を明確化
- **リファクタリングの安全性**：型の変更が全体に反映される

**実行環境**: TypeScriptコンパイル時（型チェックのみ）

```typescript
// app.d.ts
declare global {
  namespace App {
    interface Error {
      code?: string;
      message: string;
    }

    interface Locals {
      user?: {
        id: string;
        name: string;
        email: string;
      };
      session?: string;
    }

    interface PageData {
      // 各ページで共通のデータ型
    }

    interface PageState {
      // History APIのstateオブジェクト
    }

    interface Platform {
      // プラットフォーム固有の設定
      env?: {
        COUNTER: DurableObjectNamespace;
      };
    }
  }
}

export {};
```

### エラーページ（+error）

**+error.svelteファイルは、アプリケーションで発生したエラーを優雅に処理し、ユーザーフレンドリーなエラーページを表示するための特別なコンポーネントです。** 404エラーや500エラーなど、様々なエラー状況に対して適切なUIを提供します。

エラーページの重要な役割
- **ユーザー体験の向上**：技術的なエラーメッセージを分かりやすく表示
- **エラーの階層処理**：最も近い親の+error.svelteが使用される
- **開発時のデバッグ**：詳細なエラー情報の表示
- **本番環境での安全性**：機密情報を隠蔽

**実行環境**: +page.svelteと同様

```svelte
<!-- +error.svelte -->
<script lang="ts">
  import { page } from '$app/stores';
</script>

<div class="error-page">
  <h1>{$page.status}</h1>
  <p>{$page.error?.message}</p>

  {#if $page.status === 404}
    <p>お探しのページが見つかりませんでした。</p>
    <a href="/">ホームに戻る</a>
  {:else if $page.status === 500}
    <p>サーバーエラーが発生しました。</p>
    <button onclick={() => location.reload()}>再読み込み</button>
  {/if}
</div>

<style>
  .error-page {
    text-align: center;
    padding: 2rem;
  }
</style>
```

## セキュリティとベストプラクティス

### 環境変数の使い分け

```typescript
// ❌ 悪い例：クライアントコードでシークレットを使用
// +page.ts
import { SECRET_KEY } from '$env/static/private'; // エラー

// ✅ 良い例：サーバー専用ファイルでシークレットを使用
// +page.server.ts
import { SECRET_KEY } from '$env/static/private'; // OK

// クライアントで使用可能な公開変数
// +page.svelte
import { PUBLIC_API_URL } from '$env/static/public';
```

### データの分離

```typescript
// +page.server.ts
export const load: PageServerLoad = async () => {
  const sensitiveData = await db.getSensitiveInfo();
  const publicData = await db.getPublicInfo();

  return {
    // クライアントに送信されるデータのみ返す
    publicData,
    // sensitiveDataは返さない
  };
};
```

### 実行環境の確認

```typescript
// ユニバーサルコードでの環境チェック
function isServer(): boolean {
  return typeof window === 'undefined';
}

function isClient(): boolean {
  return typeof window !== 'undefined';
}

// 使用例
if (isClient()) {
  // ブラウザ専用のコード
  window.addEventListener('resize', handleResize);
}

if (isServer()) {
  // サーバー専用のコード
  const fs = await import('fs');
}
```

## レンダリング戦略の実行環境

**SvelteKitは複数のレンダリング戦略をサポートし、それぞれ異なる実行環境で動作します。**

<Mermaid diagram={renderingStrategyDiagram} />

### レンダリング戦略の選択基準

| 戦略 | 実行環境 | 用途 | パフォーマンス |
|------|----------|------|----------------|
| **プリレンダリング** | ビルド時 | 静的コンテンツ | 最速 |
| **SSR** | サーバー | 動的コンテンツ | SEO優位 |
| **CSR** | ブラウザ | SPAライクなUX | インタラクティブ |
| **ハイブリッド** | 両方 | バランス型 | 柔軟 |

## パフォーマンス最適化

### プリレンダリングの活用

```typescript
// +page.ts
// ビルド時に静的生成
export const prerender = true;

// 動的ルートのプリレンダリング
export const entries = async () => {
  const posts = await getPosts();
  return posts.map(post => ({ id: post.id }));
};
```

### 遅延読み込み

```typescript
// +page.svelte
<script lang="ts">
  import { onMount } from 'svelte';

  let HeavyComponent;

  onMount(async () => {
    // クライアントでのみ重いコンポーネントを読み込み
    const module = await import('$lib/HeavyComponent.svelte');
    HeavyComponent = module.default;
  });
</script>

{#if HeavyComponent}
  <HeavyComponent />
{/if}
```

## まとめ

SvelteKitのファイル構成は、実行環境を明確に分離することで、以下のメリットを提供します。

- **セキュリティ**: サーバー専用のコードとデータを確実に保護
- **パフォーマンス**: 適切な環境で適切なコードを実行
- **開発効率**: ファイル名から実行環境が明確
- **型安全性**: TypeScriptによる型チェック

これらの仕組みを理解することで、より効率的で安全なSvelteKitアプリケーションを構築できます。

## 次のステップ

- [ルーティング内部動作]({base}/sveltekit/architecture/routing-internals/) - ファイルベースルーティングの詳細
- [データロードアーキテクチャ]({base}/sveltekit/architecture/data-loading/) - Load関数の内部実装
- [レンダリングパイプライン]({base}/sveltekit/architecture/rendering-pipeline/) - コンパイルから実行までの流れ

:::info[関連リソース]
- [プロジェクト構造（基礎編）]({base}/sveltekit/basics/project-structure/) - 基本的なディレクトリ構成
- [特殊ファイルシステム]({base}/sveltekit/basics/file-system/) - ファイルの基本的な役割
- [実行環境とランタイム]({base}/sveltekit/deployment/execution-environments/) - デプロイ環境の詳細
:::