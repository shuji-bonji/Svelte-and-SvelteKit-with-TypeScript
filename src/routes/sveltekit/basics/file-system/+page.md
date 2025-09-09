---
title: 特殊ファイルシステム
description: SvelteKitの特殊ファイルシステムをTypeScriptで完全理解。+page/+layout/+serverファイルの関係性、データフロー、実行環境を実践的なコード例で解説
---

<script lang="ts">
  import Mermaid from '$lib/components/Mermaid.svelte';
  
  // 全体の実行フロー
  const executionFlowDiagram = `flowchart TB
    subgraph initial["初回アクセス（SSR）"]
        direction TB
        I1["+layout.server.ts<br/>認証・セッション"]
        I2["+layout.ts<br/>共通データ"]
        I3["+page.server.ts<br/>ページ固有のDB処理"]
        I4["+page.ts<br/>公開API呼び出し"]
        I5["+layout.svelte<br/>レイアウトレンダリング"]
        I6["+page.svelte<br/>ページレンダリング"]
        I7["HTML生成・送信"]
        
        I1 --> I2
        I2 --> I3
        I3 --> I4
        I4 --> I5
        I5 --> I6
        I6 --> I7
    end
    
    subgraph navigation["クライアントナビゲーション"]
        direction TB
        N1["+layout.server.ts<br/>❌ 実行されない"]
        N2["+layout.ts<br/>✅ キャッシュ or 再実行"]
        N3["+page.server.ts<br/>❌ 実行されない"]
        N4["+page.ts<br/>✅ 必ず実行"]
        N5["+layout.svelte<br/>✅ 必要に応じて再レンダリング"]
        N6["+page.svelte<br/>✅ 必ず再レンダリング"]
        
        N1 -.-> N2
        N2 --> N4
        N3 -.-> N4
        N4 --> N5
        N5 --> N6
    end
    
    subgraph formSubmit["フォーム送信（Actions）"]
        direction TB
        F1["form action実行"]
        F2["+page.server.ts<br/>actions.default()"]
        F3["バリデーション・DB更新"]
        F4["fail() or redirect()"]
        F5["+page.svelte<br/>formプロパティ更新"]
        
        F1 --> F2
        F2 --> F3
        F3 --> F4
        F4 --> F5
    end
    
    style I1 fill:#ff6b6b,color:#fff
    style I3 fill:#ff6b6b,color:#fff
    style N1 fill:#ccc,color:#666
    style N3 fill:#ccc,color:#666
    style F2 fill:#ff6b6b,color:#fff`;
    
  // ネストされたレイアウトの図
  const nestedLayoutDiagram = `graph TD
    subgraph root["ルートレイアウト"]
      RL["+layout.svelte<br/>（全ページ共通）"]
      
      subgraph blog["ブログセクション"]
        BL["+layout.svelte<br/>（ブログ共通）"]
        BP["+page.svelte<br/>（ブログトップ）"]
        BA["[slug]/+page.svelte<br/>（記事ページ）"]
      end
      
      subgraph admin["管理画面"]
        AL["+layout.svelte<br/>（管理画面共通）"]
        AD["dashboard/+page.svelte<br/>（ダッシュボード）"]
        AU["users/+page.svelte<br/>（ユーザー管理）"]
      end
    end
    
    RL --> BL
    RL --> AL
    BL --> BP
    BL --> BA
    AL --> AD
    AL --> AU
    
    style RL fill:#ff6b6b,color:#fff
    style BL fill:#4ecdc4,color:#fff
    style AL fill:#45b7d1,color:#fff`;
    
  // レイアウト適用の流れ
  const layoutApplicationDiagram = `sequenceDiagram
    participant User as ユーザー
    participant Browser as ブラウザ
    participant SvelteKit
    participant RootLayout as /+layout.svelte
    participant BlogLayout as /blog/+layout.svelte
    participant PostLayout as /blog/[id]/+layout.svelte
    participant Page as /blog/[id]/+page.svelte
    
    User->>Browser: /blog/123 へアクセス
    Browser->>SvelteKit: HTTPリクエスト
    
    SvelteKit->>RootLayout: ルートレイアウト実行
    Note over RootLayout: ヘッダー + children + フッター
    
    SvelteKit->>BlogLayout: ブログレイアウト実行
    Note over BlogLayout: サイドバー + children
    
    SvelteKit->>PostLayout: 記事レイアウト実行
    Note over PostLayout: パンくず + children
    
    SvelteKit->>Page: ページコンポーネント実行
    Note over Page: 記事コンテンツ
    
    Page-->>PostLayout: コンテンツを返す
    PostLayout-->>BlogLayout: 記事部分をchildrenに挿入
    BlogLayout-->>RootLayout: ブログ部分をchildrenに挿入
    RootLayout-->>SvelteKit: 完全なHTMLを生成
    
    SvelteKit-->>Browser: レンダリング済みHTML
    Browser->>User: ページ表示
    
    rect rgba(34, 197, 94, 0.1)
        Note over RootLayout,Page: レイアウトは階層的に適用される
    end`;
    
  // データフローの図
  const dataFlowDiagram = `flowchart LR
    subgraph Server["サーバー環境"]
      LS["+layout.server.ts"]
      PS["+page.server.ts"]
    end
    
    subgraph Universal["ユニバーサル環境"]
      LT["+layout.ts"]
      PT["+page.ts"]
    end
    
    subgraph Client["クライアント環境"]
      LSV["+layout.svelte"]
      PSV["+page.svelte"]
    end
    
    LS -->|"認証データ"| LT
    PS -->|"ページデータ"| PT
    LT -->|"共通props"| LSV
    PT -->|"ページprops"| PSV
    LSV -->|"children"| PSV
    
    style Server fill:#ffeeee,stroke:#ff6b6b,stroke-width:2px
    style Universal fill:#eeffff,stroke:#4ecdc4,stroke-width:2px
    style Client fill:#eef5ff,stroke:#45b7d1,stroke-width:2px`;
</script>

SvelteKitのファイルシステムは、ファイル名によって機能と実行環境が決まる規約ベースの設計です。`+`プレフィックスを持つ特殊ファイルが、アプリケーションの骨格を構成します。

## 特殊ファイル一覧

| ファイル名 | 実行環境 | 主な役割 | 秘密情報 |
|-----------|---------|---------|---------|
| `+page.svelte` | クライアント | ページUI | ❌ 不可 |
| `+page.ts` | 両方 | ユニバーサルデータ取得 | ❌ 不可 |
| `+page.server.ts` | サーバーのみ | サーバー処理・Actions | ✅ 可能 |
| `+layout.svelte` | クライアント | 共通レイアウト | ❌ 不可 |
| `+layout.ts` | 両方 | 共通データ取得 | ❌ 不可 |
| `+layout.server.ts` | サーバーのみ | 認証・権限チェック | ✅ 可能 |
| `+server.ts` | サーバーのみ | APIエンドポイント | ✅ 可能 |
| `+error.svelte` | クライアント | エラーページ | ❌ 不可 |

:::warning[セキュリティ]
`.server.ts`ファイル以外では、環境変数や秘密鍵を扱わないでください。
:::

## 実行フローの理解

<Mermaid diagram={executionFlowDiagram} />

## データの流れ

<Mermaid diagram={dataFlowDiagram} />

データは親から子へ、サーバーからクライアントへと一方向に流れます。

## +page.svelte
**ページのUIコンポーネント** - ユーザーに表示される画面を定義します。

- **実行環境**: クライアント（ブラウザ）
- **受け取るデータ**: `data`（load関数の結果）、`form`（Actions結果）
- **用途**: UI表示、イベントハンドリング、ユーザーインタラクション

<Expansion title="コード例">

```svelte
<script lang="ts">
  import type { PageData, ActionData } from './$types';
  
  let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<h1>{data.title}</h1>

{#if form?.error}
  <p class="error">{form.error}</p>
{/if}

<form method="POST">
  <input name="title" value={form?.title ?? ''} />
  <button>送信</button>
</form>
```

</Expansion>

## +page.ts
**ユニバーサルなデータ取得** - サーバーとクライアント両方で実行可能なデータ取得処理。

- **実行環境**: サーバー（初回）＆クライアント（ナビゲーション時）
- **アクセス可能**: 公開API、親のデータ、URLパラメータ
- **用途**: 公開データの取得、データの整形

<Expansion title="コード例">

```typescript
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, url, fetch, parent }) => {
  const parentData = await parent();
  const response = await fetch(`/api/items/${params.id}`);
  const item = await response.json();
  
  return {
    ...parentData,
    item,
    query: url.searchParams.get('q')
  };
};

// ページ設定
export const prerender = false; // SSRを使用
export const ssr = true;
export const csr = true;
```

</Expansion>

## +page.server.ts  
**サーバー専用処理とフォームActions** - データベース操作や秘密情報を扱う処理。

- **実行環境**: サーバーのみ
- **アクセス可能**: DB、環境変数、ファイルシステム
- **用途**: 認証、DB操作、フォーム処理、ファイルアップロード

<Expansion title="コード例">

```typescript
import type { PageServerLoad, Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';

// サーバー専用のデータ取得
export const load: PageServerLoad = async ({ params, locals }) => {
  const post = await db.post.findUnique({
    where: { id: params.id }
  });
  
  if (!post) throw error(404, 'Not found');
  
  return {
    post,
    canEdit: locals.user?.id === post.authorId
  };
};

// フォームActions
export const actions: Actions = {
  default: async ({ request, locals }) => {
    const data = await request.formData();
    const title = data.get('title');
    
    if (!title) {
      return fail(400, { 
        title,
        error: 'タイトルは必須です' 
      });
    }
    
    await db.post.create({
      data: { title, authorId: locals.user.id }
    });
    
    throw redirect(303, '/posts');
  }
};
```

</Expansion>

## +layout.svelte
**共通レイアウトコンポーネント** - 複数ページで共有するUI構造。

- **実行環境**: クライアント（ブラウザ）
- **受け取るデータ**: `data`（layout load関数の結果）
- **用途**: ヘッダー、フッター、サイドバー、ナビゲーション

<Expansion title="コード例">

```svelte
<script lang="ts">
  import type { LayoutData } from './$types';
  import type { Snippet } from 'svelte';
  
  let { data, children }: { data: LayoutData; children?: Snippet } = $props();
</script>

<header>
  <nav>{data.navigation}</nav>
  {#if data.user}
    <span>Welcome, {data.user.name}</span>
  {/if}
</header>

<main>
  {@render children?.()}  <!-- 子ページがここに挿入される -->
</main>

<footer>© 2024</footer>
```

</Expansion>

## +layout.ts
**共通データの取得** - すべての子ページで使用するデータを取得。

- **実行環境**: サーバー（初回）＆クライアント（ナビゲーション時）
- **アクセス可能**: 公開API、親レイアウトのデータ
- **用途**: ナビゲーションメニュー、設定、共通マスタデータ

<Expansion title="コード例">

```typescript
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ fetch }) => {
  const [config, navigation] = await Promise.all([
    fetch('/api/config').then(r => r.json()),
    fetch('/api/navigation').then(r => r.json())
  ]);
  
  return { config, navigation };
};

// レイアウトグループの設定
export const prerender = false;
export const trailingSlash = 'always';
```

</Expansion>

## +layout.server.ts
**認証と権限チェック** - セキュリティ関連の横断的処理。

- **実行環境**: サーバーのみ
- **アクセス可能**: Cookie、セッション、環境変数
- **用途**: 認証、権限チェック、セッション管理

:::info[重要な特性]
**横断的関心事**を扱います。そのディレクトリ以下のすべてのページに影響する処理を記述します。
:::

<Expansion title="コード例">

```typescript
import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: LayoutServerLoad = async ({ cookies, url }) => {
  const token = cookies.get('session');
  
  // 認証が必要なページグループ
  if (url.pathname.startsWith('/admin')) {
    if (!token) {
      throw redirect(303, `/login?redirect=${url.pathname}`);
    }
    
    const user = await validateToken(token);
    if (user.role !== 'admin') {
      throw error(403, 'Admin access required');
    }
    
    return { user };
  }
  
  return {};
};
```

</Expansion>

## +server.ts
**APIエンドポイント** - RESTful APIを実装。

- **実行環境**: サーバーのみ
- **HTTPメソッド**: GET、POST、PUT、DELETE、PATCH
- **用途**: 外部API、データ提供、Webhook受信

<Expansion title="コード例">

```typescript
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
  const limit = Number(url.searchParams.get('limit')) || 10;
  const posts = await db.post.findMany({ take: limit });
  return json(posts);
};

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) {
    throw error(401, 'Authentication required');
  }
  
  const data = await request.json();
  const post = await db.post.create({ data });
  
  return json(post, { status: 201 });
};
```

</Expansion>

## +error.svelte
**エラーページ** - エラー発生時のカスタム表示。

- **実行環境**: クライアント（ブラウザ）
- **アクセス可能**: `$page.status`、`$page.error`
- **用途**: 404、500などのエラー表示

<Expansion title="コード例">

```svelte
<script lang="ts">
  import { page } from '$app/stores';
</script>

<h1>{$page.status}</h1>
<p>{$page.error?.message}</p>

{#if $page.status === 404}
  <p>ページが見つかりません</p>
  <a href="/">ホームに戻る</a>
{:else if $page.status === 500}
  <p>サーバーエラーが発生しました</p>
{/if}
```

</Expansion>

## Layout vs Page の使い分け

:::tip[使い分けの原則]
- **Layout**: 複数ページで**共通**の処理・UI
- **Page**: そのページ**固有**の処理・コンテンツ
:::

| 観点 | Layout | Page |
|-----|--------|------|
| **スコープ** | ディレクトリ全体 | 単一ページ |
| **再利用性** | 高い（継承される） | 低い（そのページのみ） |
| **典型的な処理** | 認証、共通UI、ナビゲーション | 個別データ取得、フォーム |
| **更新頻度** | 低い | 高い |

### サーバーファイルの本質的な違い

:::info[重要：UIレイアウトとは異なる概念]
サーバーサイドでの`layout`と`page`の区別は、**見た目**ではなく**責務の範囲**で決まります。
:::

#### +layout.server.ts vs +page.server.ts

| 観点 | +layout.server.ts | +page.server.ts |
|-----|------------------|-----------------|
| **責務** | **横断的関心事**<br/>（Cross-cutting concerns） | **ページ固有のビジネスロジック** |
| **影響範囲** | ディレクトリ以下すべて | そのページのみ |
| **典型的な処理** | • セッション管理<br/>• ユーザー認証<br/>• アクセス権限チェック<br/>• 共通セキュリティ | • CRUD操作<br/>• フォーム処理（Actions）<br/>• ファイルアップロード<br/>• ページ固有の処理 |
| **実行タイミング** | 子ページアクセス時に必ず実行 | そのページアクセス時のみ |

**具体例：ブログの管理画面**
```
/admin/
├── +layout.server.ts    # 管理者権限チェック（全ページ共通）
├── posts/
│   └── +page.server.ts  # 記事のCRUD処理（このページ固有）
└── users/
    └── +page.server.ts  # ユーザー管理処理（このページ固有）
```

##### この場合
- `+layout.server.ts`：`/admin`以下のすべてのページで管理者チェック
- `+page.server.ts`：各ページ固有の処理のみ

## ネストされたレイアウト

SvelteKitのレイアウトは階層的に構成でき、ディレクトリ構造に応じて自動的にネストされます。

### レイアウトの継承

親ディレクトリの`+layout.svelte`は、子ディレクトリのページやレイアウトを自動的にラップします。

```
src/routes/
├── +layout.svelte        # ルートレイアウト（全ページに適用）
├── blog/
│   ├── +layout.svelte   # ブログレイアウト（ブログセクションのみ）
│   ├── +page.svelte     # ブログトップページ
│   └── [slug]/
│       └── +page.svelte # 個別記事ページ
```

### Mermaidで見る継承構造

<Mermaid diagram={nestedLayoutDiagram} />


### レイアウトのデータフロー

各レイアウトは親のデータを継承し、追加のデータを提供できます。

```typescript
// src/routes/+layout.ts
export const load = async () => {
  return {
    user: await getUser(),
    theme: 'dark'
  };
};

// src/routes/blog/+layout.ts
export const load = async ({ parent }) => {
  const parentData = await parent(); // 親のデータを取得
  return {
    ...parentData,
    categories: await getCategories()
  };
};
```

### レイアウトのリセット

レイアウトの継承をリセットしたい場合は、ルートグループのディレクトリ名に`@`記号を使用します。

```
src/routes/
├── +layout.svelte           # ルートレイアウト
├── (marketing)/             # マーケティンググループ
│   ├── +layout.svelte      # マーケティング用レイアウト
│   └── about/+page.svelte
└── (app)@/                  # @でルートレイアウトに戻る
    ├── +layout.svelte      # アプリ用の新しいレイアウト
    └── dashboard/+page.svelte
```

上記の例では、`(app)@`グループ内のページは、`(marketing)`のレイアウトを継承せず、ルートレイアウトから直接継承します。これにより、異なるデザインや構造を持つセクションを同じアプリケーション内で実現できます。

### レイアウト適用の流れ

以下の図は、レイアウトがどのように階層的に適用されるかを示しています。

<Mermaid diagram={layoutApplicationDiagram} />

### ネスト制御のベストプラクティス

1. **共通要素の抽出**: ヘッダーやフッターなど、複数ページで共有する要素はレイアウトに配置
2. **段階的な構築**: ルートレイアウトは最小限に、セクション固有の要素は子レイアウトに
3. **データの継承**: `parent()`を使って親のデータを継承し、重複を避ける
4. **リセットの活用**: 異なるデザインが必要な場合は`@`記号でレイアウトをリセット

## 実行タイミングの違い

### 初回アクセス/リロード時
すべてのファイルが順番に実行されます。
1. `+layout.server.ts` → `+page.server.ts`（サーバー）
2. `+layout.ts` → `+page.ts`（サーバー）
3. `+layout.svelte` → `+page.svelte`（サーバーでHTML生成）
4. クライアントでハイドレーション

### クライアントナビゲーション時
`.server.ts`ファイルはスキップされます。
1. `+layout.ts`（キャッシュ or 再実行）
2. `+page.ts`（必ず実行）
3. `+layout.svelte` → `+page.svelte`（再レンダリング）

### フォーム送信時
`+page.server.ts`のactionsが実行されます。
1. `actions.default()`または名前付きaction実行
2. 成功時：`redirect()`でページ遷移
3. 失敗時：`fail()`でformプロパティ更新

## ベストプラクティス

### セキュリティ
```typescript
// ❌ 悪い例：+page.tsで秘密情報
export const load = async () => {
  const apiKey = process.env.SECRET_API_KEY; // 露出する！
};

// ✅ 良い例：+page.server.tsで秘密情報
export const load = async () => {
  const apiKey = process.env.SECRET_API_KEY; // サーバーのみ
  const data = await fetchWithApiKey(apiKey);
  return { data }; // APIキーは含まない
};
```

### データフローの最適化
```typescript
// 親レイアウトで共通データ取得
// +layout.server.ts
export const load = async ({ locals }) => {
  const user = await locals.getUser();
  return { user };
};

// 子ページで親のデータを活用
// +page.ts
export const load = async ({ parent }) => {
  const { user } = await parent();
  return { 
    content: user?.premium 
      ? await fetch('/api/premium-content')
      : await fetch('/api/free-content')
  };
};
```

## よくあるエラーと対処法

:::warning[TypeError: Cannot access 'X' before initialization]
**原因**: Load関数の循環参照  
**解決**: `parent()`の呼び出しタイミングを確認
:::

:::warning[Hydration mismatch]
**原因**: サーバーとクライアントで異なる内容  
**解決**: `browser`変数を使用して条件分岐
:::

:::warning[500 Internal Server Error in production]
**原因**: `.server.ts`以外で環境変数にアクセス  
**解決**: 環境変数へのアクセスは`.server.ts`に限定
:::

## まとめ

SvelteKitの特殊ファイルシステムは、

- **規約ベース**: ファイル名が機能を決定
- **型安全**: TypeScriptの完全サポート
- **セキュア**: サーバー専用ファイルで機密情報を保護
- **効率的**: 適切なファイル分割でパフォーマンス最適化

これらのファイルを適切に使い分けることで、安全で高性能なWebアプリケーションを構築できます。

## 次のステップ

- [ルーティング](/sveltekit/routing/) - URLとファイルの対応関係
- [データ取得](/sveltekit/data-loading/) - Load関数の詳細な使い方
- [フォーム処理](/sveltekit/server/forms/) - Actionsの実装パターン