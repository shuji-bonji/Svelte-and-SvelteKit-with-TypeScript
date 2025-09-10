---
title: Load関数の基礎
description: SvelteKitのLoad関数の基本を理解 - Universal LoadとServer Loadの違い、TypeScriptによる型安全なデータ取得、レイアウトとページ間のデータ共有パターン
---

<script>
  import { base } from '$app/paths';
  import Mermaid from '$lib/components/Mermaid.svelte';
  
  const spaPattern = `sequenceDiagram
    participant User as ユーザー
    participant Browser as ブラウザ
    participant Component as コンポーネント
    participant API as APIサーバー
    
    User->>Browser: ページにアクセス
    Browser->>Component: コンポーネントをレンダリング
    Note over Component: 空の状態で表示
    Component->>Component: onMount()実行
    Component->>API: データ取得リクエスト
    Note over User: ローディング表示
    API-->>Component: データレスポンス
    Component->>Browser: 再レンダリング
    Browser->>User: データ表示
    
    rect rgb(255, 200, 200)
        Note over User,API: 問題点：初期表示が遅い、SEO非対応
    end`;
    
  const loadPattern = `sequenceDiagram
    participant User as ユーザー
    participant SvelteKit as SvelteKit
    participant Load as Load関数
    participant API as APIサーバー
    participant Component as コンポーネント
    
    User->>SvelteKit: ページにアクセス
    SvelteKit->>Load: Load関数を実行
    Load->>API: データ取得リクエスト
    API-->>Load: データレスポンス
    Load-->>SvelteKit: データを返す
    SvelteKit->>Component: データ付きでレンダリング
    Component->>User: 完全なページを表示
    
    rect rgb(200, 255, 200)
        Note over User,API: メリット：初期表示が速い、SEO対応
    end`;
    
  const executionTiming = `flowchart LR
    A[ユーザーがリンクをクリック] --> B[Load関数実行]
    B --> C[データ取得完了]
    C --> D[ページレンダリング]
    D --> E[画面表示]
    
    style B fill:#ff6b6b,color:#fff
    style C fill:#4ecdc4,color:#fff
    style D fill:#45b7d1,color:#fff`;

  const selectionFlowchart = `flowchart TD
    Start[データ取得が必要] --> Secret[秘密情報を扱う？]
    Secret -->|Yes| ServerLoad[Server Loadを使用]
    Secret -->|No| Database[データベース直接アクセス？]
    Database -->|Yes| ServerLoad
    Database -->|No| ClientRerun[クライアントで再実行必要？]
    ClientRerun -->|Yes| UniversalLoad[Universal Loadを使用]
    ClientRerun -->|No| BothWork[どちらでもOK]`;

  const UniversalLoad = `sequenceDiagram
    participant User as ユーザー
    participant Browser as ブラウザ
    participant Server as サーバー
    participant API as 外部API
    
    Note over User,API: 初回アクセス（SSR）
    User->>Browser: /products にアクセス
    Browser->>Server: HTTPリクエスト
    Server->>Server: +page.ts のLoad関数実行
    Server->>API: fetch('/api/products')
    API-->>Server: 商品データ
    Server->>Server: HTMLにデータ埋め込み
    Server-->>Browser: 完全なHTML+データ
    Browser->>User: ページ表示（SEO最適化済み）
    
    Note over User,API: クライアントサイド遷移
    User->>Browser: 別ページへのリンククリック
    Browser->>Browser: +page.ts のLoad関数実行
    Browser->>API: fetch('/api/products')
    API-->>Browser: 商品データ（JSON）
    Browser->>Browser: DOMを更新
    Browser->>User: ページ更新（高速遷移）`;

  const ServerLoad = `sequenceDiagram
    participant User as ユーザー
    participant Browser as ブラウザ
    participant Server as サーバー
    participant DB as データベース
    participant Auth as 認証システム
    
    Note over User,DB: 初回アクセス（SSR）
    User->>Browser: /admin/users にアクセス
    Browser->>Server: HTTPリクエスト（Cookie付き）
    Server->>Auth: セッション検証
    Auth-->>Server: ユーザー情報
    Server->>Server: +page.server.ts のLoad関数実行
    Server->>DB: SELECT * FROM users
    DB-->>Server: ユーザー一覧（機密情報含む）
    Server->>Server: HTMLにデータ埋め込み
    Server-->>Browser: 完全なHTML（機密情報は除外）
    Browser->>User: ページ表示
    
    Note over User,DB: クライアントサイド遷移
    User->>Browser: 別ページへ遷移
    Browser->>Server: __data.json リクエスト
    Server->>Auth: セッション検証
    Auth-->>Server: ユーザー情報
    Server->>Server: +page.server.ts のLoad関数実行
    Server->>DB: SELECT * FROM users
    DB-->>Server: ユーザー一覧
    Server-->>Browser: JSONデータ（安全に処理済み）
    Browser->>User: ページ更新`;

  const parentChildDataFlow = `sequenceDiagram
    participant Browser as ブラウザ
    participant Server as サーバー
    participant LayoutLoad as +layout.server.ts
    participant PageLoad as +page.ts
    participant DB as データベース
    participant Component as コンポーネント
    
    Browser->>Server: /dashboard/profile アクセス
    
    Note over Server,DB: レイアウトLoad実行
    Server->>LayoutLoad: load()実行
    LayoutLoad->>DB: ユーザー基本情報取得
    DB-->>LayoutLoad: { user, settings }
    LayoutLoad-->>Server: レイアウトデータ
    
    Note over Server,DB: ページLoad実行
    Server->>PageLoad: load()実行
    PageLoad->>PageLoad: parent()でレイアウトデータ取得
    Note right of PageLoad: userデータを利用
    PageLoad->>DB: ユーザーのプロフィール詳細取得
    DB-->>PageLoad: { profile, posts }
    PageLoad-->>Server: ページデータ
    
    Note over Server,Component: データ統合
    Server->>Server: レイアウト + ページデータ統合
    Server-->>Browser: HTML + 統合データ
    Browser->>Component: data = { user, settings, profile, posts }
    Component->>Browser: レンダリング完了`;
    
  const practicalExample = `sequenceDiagram
    participant User as ユーザー
    participant Browser as ブラウザ
    participant Server as SvelteKitサーバー
    participant Redis as Redisキャッシュ
    participant DB as PostgreSQL
    participant S3 as AWS S3
    
    Note over User,S3: ECサイトの商品詳細ページ
    User->>Browser: /products/abc-123 アクセス
    Browser->>Server: HTTPリクエスト
    
    rect rgba(220, 38, 127, 0.1)
        Note right of Server: +layout.server.ts
        Server->>Redis: セッションID確認
        Redis-->>Server: ユーザー情報（キャッシュ）
        Server->>Server: カート情報を取得
    end
    
    rect rgba(59, 130, 246, 0.1)
        Note right of Server: +page.server.ts
        Server->>Server: parent()でユーザー情報取得
        Server->>DB: 商品情報取得（在庫含む）
        DB-->>Server: 商品データ
        Server->>S3: 商品画像URL生成（署名付き）
        S3-->>Server: セキュアURL
        Server->>DB: レコメンド商品取得
        DB-->>Server: 関連商品リスト
    end
    
    Server->>Server: データ統合・HTML生成
    Server-->>Browser: 完全なページ
    Browser->>User: 商品ページ表示
    
    Note over User,S3: ユーザーアクション
    User->>Browser: カートに追加ボタンクリック
    Browser->>Server: POSTリクエスト（Form Action）
    Server->>DB: 在庫確認・カート更新
    DB-->>Server: 更新完了
    Server->>Redis: セッション更新
    Redis-->>Server: OK
    Server-->>Browser: 成功レスポンス
    Browser->>User: カート更新を表示`;
</script>

このページでは、SvelteKitの中核機能であるLoad関数の基本的な使い方を学びます。

## Load関数とは何か？

Load関数は、SvelteKitにおける**データフェッチングの中心的な仕組み**です。ページやレイアウトがレンダリングされる前に必要なデータを取得し、コンポーネントに渡す役割を担います。

### 主な特徴

1. **自動実行**: SvelteKitがページ遷移時に自動的にload関数を呼び出し、結果をコンポーネントに渡す（開発者が手動で呼び出す必要がない）
2. **非同期処理**: `async/await`を使った非同期データ取得が可能
3. **型安全**: TypeScriptとの完全な統合により型安全性を保証
4. **最適化**: SvelteKitが自動的にキャッシュやプリフェッチを最適化

:::info[「自動実行」の意味]
**自動実行とは「開発者が明示的に呼び出さなくても良い」という意味です。**

React等では：
```javascript
// React - useEffectで手動実行
useEffect(() => {
  fetchData(); // 開発者が明示的に呼び出す
}, []);
```

SvelteKitでは：
```typescript
// +page.ts に定義するだけ
export const load: PageLoad = async ({ params, fetch }) => {
  // paramsやfetchの型が自動推論される
  return {
    post: await fetch(`/api/posts/${params.id}`).then(r => r.json())
  };
};
// コンポーネント側でload()を呼ぶ必要はない！
```
:::

### なぜLoad関数が必要か？

従来のSPAでは、コンポーネントのマウント後にデータを取得することが一般的でした。しかし、これには以下の問題があります。

- **SEOの問題**: 初期HTMLにデータが含まれない
- **パフォーマンス**: 画面表示後にローディングが発生
- **ウォーターフォール**: 親子コンポーネントで順次データ取得

Load関数はこれらの問題を解決します。

```typescript
// 従来のパターン（避けるべき）
<script lang="ts">
  import { onMount } from 'svelte';
  let data = null;
  
  onMount(async () => {
    // コンポーネントマウント後にデータ取得
    const response = await fetch('/api/data');
    data = await response.json();
  });
</script>

// SvelteKitのLoad関数パターン（推奨）
// +page.ts
export const load = async ({ fetch }) => {
  // ページ表示前にデータ取得
  const response = await fetch('/api/data');
  const data = await response.json();
  
  return { data };
};
```

### データ取得パターンの比較

#### 従来のSPAパターン（避けるべき）

<Mermaid diagram={spaPattern} />

#### SvelteKitのLoad関数パターン（推奨）

<Mermaid diagram={loadPattern} />

### Load関数の実行タイミング

<Mermaid diagram={executionTiming} />

## Universal Load vs Server Load

SvelteKitには2種類のLoad関数があります。それぞれ異なる実行環境と用途があり、適切に使い分けることでセキュリティとパフォーマンスを両立できます。


### Universal Load (`+page.ts` / `+layout.ts`)

サーバーとクライアントの両方で実行される関数です。初回アクセス時はSSRのためサーバーで実行され、クライアントサイドナビゲーション時はブラウザで実行されます。これにより、SEOとユーザー体験の両方を最適化できます。

<Mermaid diagram={UniversalLoad} />


```typescript
// +page.ts
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, url, fetch }) => {
  // fetch関数はSvelteKitによって拡張され、
  // サーバー/クライアント両方で動作する
  const response = await fetch('/api/data');
  const data = await response.json();
  
  return {
    data  // このデータはコンポーネントの`data`プロップに渡される
  };
};
```

#### 特徴
- SSR時はサーバーで実行
- クライアントサイドナビゲーション時はブラウザで実行
- 公開APIの呼び出しに適している
- `fetch`は自動的に最適化される

### Server Load (`+page.server.ts` / `+layout.server.ts`)

サーバーサイドでのみ実行される関数です。データベースへの直接アクセスや秘密情報の取り扱いが可能で、セキュリティを保ちながらバックエンド処理を実装できます。

<Mermaid diagram={ServerLoad} />


```typescript
// +page.server.ts
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/database';

export const load: PageServerLoad = async ({ params, locals }) => {
  // データベースに直接アクセス可能
  // このコードはブラウザに送られないため安全
  const user = await db.user.findUnique({
    where: { id: params.id }
  });
  
  return {
    user  // シリアライズ可能なデータのみ返す
  };
};
```

#### 特徴
- 常にサーバーサイドで実行
- 秘密情報（APIキー、DB認証情報）を安全に扱える
- データベースに直接アクセス可能
- Node.js専用のライブラリを使用可能

## 型安全なデータ取得

SvelteKitは自動的に型を生成し、完全な型安全性を提供します。`./$types`からインポートされる型は、ルート構造に基づいて自動生成され、パラメータや返り値の型チェックを行います。

### 自動生成される型

SvelteKitはファイル名とルート構造から適切な型を推論し、`./$types`モジュールとして提供します。

```typescript
// ./$types から型をインポート
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, url }) => {
  // paramsとurlは自動的に型付けされる
  const id = params.id; // string型として推論
  const query = url.searchParams.get('q'); // string | null
  
  return {
    id,
    query
    // 返り値も型チェックされる
    // TypeScriptが返り値の型を検証し、エラーを防ぐ
  };
};
```

### ページコンポーネントでの使用

Load関数が返したデータは、コンポーネントの`data`プロップとして受け取ります。PageData型を使うことで、型安全にデータにアクセスできます。

```svelte
<!-- +page.svelte -->
<script lang="ts">
  import type { PageData } from './$types';
  
  // dataは自動的に型付けされる
  // Load関数の返り値に基づいて型が推論される
  let { data }: { data: PageData } = $props();
</script>

<!-- 型安全にデータにアクセス -->
<h1>ID: {data.id}</h1>
<p>Query: {data.query ?? 'なし'}</p>
```

## レイアウトとページ間のデータ共有

レイアウトとページ間でデータを共有する方法です。SvelteKitはレイアウトのLoad関数を先に実行し、そのデータをページのLoad関数で利用できるようにします。これにより、共通データの重複取得を避け、効率的なデータフローを実現します。

<Mermaid diagram={parentChildDataFlow} />

### レイアウトのLoad関数でのデータ取得

レイアウトのLoad関数で取得したデータは、そのレイアウトに属するすべてのページで共有されます。一般的にユーザー情報や設定など、アプリケーション全体で必要なデータをここで取得します。

```typescript
// +layout.server.ts
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
  // セッションからユーザー情報を取得
  // このデータはすべての子ページで利用可能
  const user = await getUserFromSession(locals.session);
  
  return {
    user  // このユーザー情報はこのレイアウトに属するすべてのページで利用可能
  };
};
```

### ページのLoad関数でのデータ取得

ページのLoad関数で`parent()`関数を使って、上位レイアウトのデータにアクセスします。これにより、レイアウトで取得したデータを基に、追加のデータを取得できます。

```typescript
// +page.ts
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
  // 上位レイアウトのデータを取得
  // parent()は上位のLoad関数の完了を待つ
  const { user } = await parent();
  
  // ユーザー固有のデータを取得
  // 親のデータを活用して追加情報を取得
  const posts = await fetch(`/api/users/${user.id}/posts`)
    .then(r => r.json());
  
  return {
    posts
    // userは自動的に継承される
    // 明示的に返さなくてもコンポーネントで利用可能
  };
};
```

## 実践的な例：ECサイトの商品詳細ページ

実際のECサイトを想定した、Load関数の実践的な使用例です。レイアウトでユーザー情報を取得し、ページで商品データを取得する典型的なパターンを示します。

<Mermaid diagram={practicalExample} />

この例では、以下の処理が行われています。

1. **レイアウトLoad（+layout.server.ts）**
   - Redisからセッション情報を取得
   - ユーザー情報とカート情報を管理

2. **ページLoad（+page.server.ts）**
   - parent()で親のユーザー情報を活用
   - PostgreSQLから商品情報を取得
   - AWS S3から署名付きURLを生成
   - レコメンド商品を取得

3. **Form Action**
   - カート追加処理
   - 在庫確認とデータベース更新
   - セッション更新

## エラーハンドリング

Load関数でのエラー処理方法です。適切なエラーハンドリングにより、ユーザーにわかりやすいエラーメッセージを表示し、アプリケーションの信頼性を向上させます。

### 基本的なエラー処理

SvelteKitの`error`関数を使って、HTTPステータスコードとメッセージを持つエラーを投げます。これにより、適切なエラーページが表示されます。

```typescript
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
  const response = await fetch(`/api/posts/${params.id}`);
  
  if (!response.ok) {
    // HTTPエラーを投げる
    // error関数はステータスコードとオプションデータを受け取る
    throw error(response.status, {
      message: 'Post not found'  // エラーページで表示されるメッセージ
    });
  }
  
  const post = await response.json();
  return { post };
};
```

### カスタムエラーページ

`+error.svelte`ファイルを作成して、エラーの表示をカスタマイズします。このファイルはLoad関数でエラーが発生したときに自動的に表示されます。

```svelte
<!-- +error.svelte -->
<script lang="ts">
  import { page } from '$app/stores';
  // $pageストアからエラー情報にアクセス
</script>

<!-- HTTPステータスコードを表示 -->
<h1>{$page.status}</h1>
<!-- エラーメッセージを表示 -->
<p>{$page.error?.message}</p>
```

## よく使われるパターン

実際のアプリケーションでよく使われるLoad関数のパターンを紹介します。これらの例を参考に、効率的なデータ取得を実装できます。

### 複数データの同時取得

複数のデータソースから同時にデータを取得することで、パフォーマンスを大幅に改善できます。Promise.allを使って並列処理を実現します。

```typescript
export const load: PageLoad = async ({ fetch }) => {
  // 並列でデータを取得（効率的）
  // 3つのAPIコールが同時に実行される
  const [posts, categories, tags] = await Promise.all([
    fetch('/api/posts').then(r => r.json()),
    fetch('/api/categories').then(r => r.json()),
    fetch('/api/tags').then(r => r.json())
  ]);
  
  return {
    posts,      // 投稿データ
    categories, // カテゴリ一覧
    tags        // タグ一覧
  };
};
```

### 動的なデータ取得

URLパラメータやユーザーの状態に応じて、異なるデータを取得するパターンです。動的なコンテンツ表示に役立ちます。

```typescript
export const load: PageLoad = async ({ url, fetch }) => {
  const filter = url.searchParams.get('filter');
  
  // 条件に応じて異なるデータを取得
  // ?filter=active のようなクエリパラメータをチェック
  const data = filter
    ? await fetch(`/api/items?filter=${filter}`).then(r => r.json())
    : await fetch('/api/items').then(r => r.json());
  
  return {
    items: data  // フィルタリングされたデータまたは全データ
  };
};
```

## Load関数の選び方

データ取得の要件に応じて、適切なLoad関数を選択します。

### Server Loadを使用すべき場合

1. **秘密情報の取り扱い**
   - APIキーやデータベースクレデンシャル
   - サードパーティサービスのシークレット
   - 環境変数に保存された機密情報

2. **データベース直接アクセス**
   - Prisma、Drizzle ORMなどのORM使用
   - SQLクエリの直接実行
   - RedisやMongoDBへの接続

3. **サーバーサイド専用ライブラリ**
   - Node.js専用モジュールの使用
   - ファイルシステムへのアクセス
   - システムコマンドの実行

```typescript
// 例：Server Loadが適切なケース
export const load: PageServerLoad = async ({ locals }) => {
  // データベースに直接アクセス
  const posts = await db.post.findMany({
    where: { userId: locals.session.userId }
  });
  
  // 秘密のAPIキーを使用
  const analytics = await fetchWithSecret(process.env.ANALYTICS_KEY);
  
  return { posts, analytics };
};
```

### Universal Loadを使用すべき場合

1. **公開APIの呼び出し**
   - REST APIエンドポイント
   - GraphQLクエリ
   - パブリックAPIのデータ

2. **SEOが重要な場合**
   - サーバーサイドレンダリングが必要
   - メタデータの動的生成
   - Open Graphタグの設定

3. **クライアントサイド再実行**
   - ナビゲーション時のデータ更新
   - リアルタイム更新が必要
   - クライアントサイドキャッシュの活用

```typescript
// 例：Universal Loadが適切なケース
export const load: PageLoad = async ({ fetch, params }) => {
  // 公開APIからデータ取得
  const response = await fetch(`/api/posts/${params.id}`);
  const post = await response.json();
  
  // クライアントサイドでも再実行可能
  return { post };
};
```

### 選択フローチャート

<Mermaid diagram={selectionFlowchart} />


## ベストプラクティス

Load関数を使う際の推奨事項です。これらのベストプラクティスに従うことで、保守性が高くパフォーマントなコードを書けます。

1. **エラーハンドリング**
   - 適切なHTTPステータスコードを返す
   - ユーザーフレンドリーなエラーメッセージ

2. **キャッシュを考慮**
   - `fetch`の`cache`オプションを適切に設定
   - 適切なキャッシュヘッダーの設定

3. **パフォーマンス最適化**
   - 並列処理でデータ取得を高速化
   - 不要なデータ取得を避ける

## 次のステップ

- [TypeScript型の自動生成システム](../auto-types/) - TypeScript型の自動生成の仕組み
- [データフェッチング戦略](../strategies/) - 高度なデータ取得テクニック
- [フォーム処理とActions](../../server/forms/) - データの送信と処理