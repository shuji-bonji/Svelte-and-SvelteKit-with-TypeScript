---
title: 高度なルーティング
description: SvelteKitの高度なルーティング機能をTypeScriptで実装。ルートグループ、ネストレイアウト、プログラマティックナビゲーション、ルートアノテーションを解説
---

<script>
  import Mermaid from '$lib/components/Mermaid.svelte';
  
  const nestedLayoutDiagram = `graph TB
    subgraph "ルートレイアウト /+layout.svelte"
      Header[Header]
      subgraph "アプリレイアウト /app/+layout.svelte"
        Sidebar[Sidebar]
        subgraph "ダッシュボードレイアウト /app/dashboard/+layout.svelte"
          DashNav[Dashboard Navigation]
          Page["+page.svelte<br/>実際のコンテンツ"]
        end
      end
      Footer[Footer]
    end
    
    style Header fill:#e1f5fe,color:#000
    style Footer fill:#e1f5fe,color:#000
    style Sidebar fill:#fff3e0,color:#000
    style DashNav fill:#f3e5f5,color:#000
    style Page fill:#e8f5e9,color:#000`;
    
  const routeGroupDiagram = `graph LR
    subgraph "ファイルシステム構造"
      A["src/routes/<br/>(app)/dashboard/+page.svelte"]
      B["src/routes/<br/>(marketing)/+page.svelte"]
      C["src/routes/<br/>(auth)/login/+page.svelte"]
    end
    
    subgraph "URL構造"
      D["/dashboard"]
      E["/"]
      F["/login"]
    end
    
    A --> D
    B --> E
    C --> F
    
    style A fill:#e3f2fd,color:#000
    style B fill:#fff3e0,color:#000
    style C fill:#fce4ec,color:#000
    
    classDef urlStyle fill:#e8f5e9,stroke:#4caf50,stroke-width:2px,color:#000
    class D,E,F urlStyle`;
    
  const navigationFlowDiagram = `sequenceDiagram
    participant User as ユーザー
    participant Component as Svelteコンポーネント
    participant BeforeNav as beforeNavigate
    participant Router as SvelteKitルーター
    participant AfterNav as afterNavigate
    participant NewPage as 新しいページ
    
    User->>Component: リンククリック/goto()呼び出し
    Component->>BeforeNav: ナビゲーション開始
    
    alt 未保存の変更がある場合
        BeforeNav->>BeforeNav: confirm()ダイアログ表示
        alt ユーザーがキャンセル
            BeforeNav->>Component: cancel()実行
            Note over Component: ナビゲーション中止
        else ユーザーが続行
            BeforeNav->>Router: ナビゲーション続行
        end
    else 変更なし
        BeforeNav->>Router: ナビゲーション続行
    end
    
    Router->>NewPage: 新しいページをロード
    NewPage->>AfterNav: ページロード完了
    
    AfterNav->>AfterNav: スクロール位置リセット
    AfterNav->>AfterNav: アナリティクス送信
    AfterNav->>User: 新しいページ表示
    
    rect rgba(255, 152, 0, 0.1)
        Note over BeforeNav,AfterNav: ナビゲーションフック
    end`;
    
  const errorPropagationDiagram = `graph TB
    subgraph "エラー伝播の階層"
      direction TB
      PageError["/app/posts/[id]/+page.server.ts<br/>throw error(404)"]
      PostsError["/app/posts/+error.svelte"]
      AppError["/app/+error.svelte"]
      RootError["/+error.svelte"]
      
      PageError -.->|"最も近い+error.svelte"| PostsError
      PostsError -.->|"存在しない場合"| AppError
      AppError -.->|"存在しない場合"| RootError
    end
    
    style PageError fill:#ffebee,stroke:#f44336,color:#000
    style PostsError fill:#e8f5e9,stroke:#4caf50,color:#000
    style AppError fill:#fff3e0,color:#000
    style RootError fill:#e3f2fd,color:#000
    
    classDef errorHandler fill:#c8e6c9,stroke:#388e3c,stroke-width:2px,color:#000
    class PostsError errorHandler`;
    
  const layoutInheritanceDiagram = `sequenceDiagram
    participant User as ユーザー
    participant Browser as ブラウザ
    participant SvelteKit
    participant RootLayout as /+layout.svelte
    participant AppLayout as /(app)/+layout.svelte
    participant DashLayout as /(app)/dashboard/+layout.svelte
    participant Page as /(app)/dashboard/+page.svelte
    
    User->>Browser: /dashboard へアクセス
    Browser->>SvelteKit: HTTPリクエスト
    
    SvelteKit->>RootLayout: ルートレイアウト実行
    Note over RootLayout: Header + slot + Footer
    
    SvelteKit->>AppLayout: アプリレイアウト実行
    Note over AppLayout: Sidebar + slot
    
    SvelteKit->>DashLayout: ダッシュボードレイアウト実行
    Note over DashLayout: DashboardNav + slot
    
    SvelteKit->>Page: ページコンポーネント実行
    Note over Page: 実際のコンテンツ
    
    Page-->>DashLayout: コンテンツを返す
    DashLayout-->>AppLayout: ダッシュボードをslotに挿入
    AppLayout-->>RootLayout: アプリ部分をslotに挿入
    RootLayout-->>SvelteKit: 完全なHTMLを生成
    
    SvelteKit-->>Browser: レンダリング済みHTML
    Browser->>User: ページ表示
    
    rect rgba(34, 197, 94, 0.1)
        Note over RootLayout,Page: レイアウトは階層的に適用される
    end`;
</script>

プロダクションレベルのアプリケーション開発に必要な、SvelteKitの高度なルーティング機能を学びます。ルートグループによる論理的な整理、複雑なレイアウト構造、動的なナビゲーション制御などを習得します。

## ルートグループ

URLに影響を与えずに、ルートを論理的に整理する機能です。異なるレイアウトや認証要件を持つページをグループ化し、コードの保守性を向上させます。例えば、管理画面、マーケティングサイト、認証ページなどを別々のグループとして管理できます。

### ルートグループの仕組み

以下の図は、括弧で囲まれたディレクトリ名がURLに反映されない仕組みを示しています。

<Mermaid diagram={routeGroupDiagram} />

:::tip[レイアウトのリセット]
ルートグループで`@`記号を使用すると、レイアウトの継承をリセットできます。
例：`(app)@/`は親レイアウトを無視して、ルートレイアウトから直接継承します。

詳しくは[特殊ファイルシステム - レイアウトのリセット](/sveltekit/basics/file-system/#レイアウトのリセット)を参照してください。
:::

### (group) - URLに影響しないグループ化

括弧`()`で囲まれたディレクトリは、URLパスに影響を与えずにルートを論理的にグループ化できます。

ルートグループのディレクトリ構造例です。`(app)`、`(marketing)`、`(auth)`はそれぞれ異なるレイアウトを持ちますが、URLには表れません。例えば`(app)/dashboard`はURL上では`/dashboard`となり、グループ名が省略されます。

```
src/routes/
├── (app)/                    # URLパスには含まれない
│   ├── +layout.svelte        # アプリケーションレイアウト
│   ├── dashboard/            # /dashboard
│   │   └── +page.svelte
│   └── settings/             # /settings
│       └── +page.svelte
├── (marketing)/              # URLパスには含まれない
│   ├── +layout.svelte        # マーケティングサイトレイアウト
│   ├── +page.svelte          # / (ホームページ)
│   └── pricing/              # /pricing
│       └── +page.svelte
└── (auth)/                   # URLパスには含まれない
    ├── +layout.svelte        # 認証用レイアウト
    ├── login/                # /login
    └── register/             # /register
```

### 認証が必要なルートグループ

`(protected)`グループのレイアウトLoad関数で認証チェックを実装した例です。`locals.getUser()`でユーザー情報を取得し、未認証の場合はログインページへリダイレクトします。`redirectTo`パラメータで元のURLを保持し、ログイン後に元のページに戻れるようにしています。

```typescript
// src/routes/(protected)/+layout.server.ts
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
  const user = await locals.getUser();
  
  if (!user) {
    // 未認証の場合はログインページへリダイレクト
    throw redirect(302, `/login?redirectTo=${url.pathname}`);
  }
  
  return {
    user
  };
};
```

認証済みユーザー向けのレイアウトコンポーネントです。Load関数から受け取った`data.user`を使って、ユーザーメニューを表示しています。このグループ内のすべてのページで、このナビゲーションとレイアウトが適用されます。

```svelte
<!-- src/routes/(protected)/+layout.svelte -->
<script lang="ts">
  import type { LayoutData } from './$types';
  import UserMenu from '$lib/components/UserMenu.svelte';
  import type { Snippet } from 'svelte';
  
  let { data, children }: { data: LayoutData; children?: Snippet } = $props();
</script>

<div class="app-layout">
  <header>
    <nav>
      <a href="/dashboard">Dashboard</a>
      <a href="/profile">Profile</a>
      <a href="/settings">Settings</a>
    </nav>
    <UserMenu user={data.user} />
  </header>
  
  <main>
    {@render children?.()}
  </main>
</div>
```

### 管理者専用ルートグループ

管理者権限をチェックするグループの実装例です。`user.isAdmin`フラグを確認し、管理者でない場合は403エラー（アクセス拒否）をスローします。このエラーは最も近い`+error.svelte`でキャッチされ、適切なエラーメッセージが表示されます。

```typescript
// src/routes/(admin)/+layout.server.ts
import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
  const user = await locals.getUser();
  
  if (!user?.isAdmin) {
    throw error(403, {
      message: 'Access denied: Admin only',
      code: 'FORBIDDEN'
    });
  }
  
  return {
    user
  };
};
```


## プログラマティックナビゲーション

JavaScriptコードから直接ページ遷移を制御する機能です。ユーザーの操作に応じた動的なナビゲーション、フォーム送信後の遷移、条件に基づくリダイレクトなど、プログラムロジックでページ遷移を管理できます。

### ナビゲーションフローの全体像

以下の図は、beforeNavigate/afterNavigateフックがどのタイミングで実行されるかを示しています。

<Mermaid diagram={navigationFlowDiagram} />

### goto関数

`$app/navigation`から提供される関数で、JavaScriptから直接ページ遷移を実行します。フォーム送信後の遷移、条件に基づくリダイレクト、プログラムロジックによる動的なナビゲーションなどに使用します。

フォーム送信後に作成した記事ページへ遷移する実装例です。`/api/posts`に記事データをPOSTし、レスポンスで返される記事IDを使って`/posts/123`のような動的ルートへ遷移します。`replaceState: false`で履歴に残し、`invalidateAll: true`ですべてのデータを再取得することで、新しい記事が確実に表示されます。

```svelte
<script lang="ts">
  import { goto } from '$app/navigation';
  
  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    
    const formData = new FormData(event.target as HTMLFormElement);
    const response = await fetch('/api/posts', {
      method: 'POST',
      body: formData
    });
    
    if (response.ok) {
      const { id } = await response.json();
      
      // 作成した記事ページへ遷移
      await goto(`/posts/${id}`, {
        replaceState: false,     // 履歴を残す
        invalidateAll: true      // 全データを再取得
      });
    }
  }
</script>

<form onsubmit={handleSubmit}>
  <!-- フォーム内容 -->
</form>
```

:::info[SPA出身者向け：SvelteKitのナビゲーション動作]
SvelteKitのプログラマティックナビゲーション（`goto()`, `replaceState()`, `pushState()`）は、**すべてSPA的なクライアントサイドルーティング**として動作します。

**重要なポイント：**
- ページ全体のリロードは発生しません
- ブラウザのURLは変化します
- 必要な部分のみが更新されます（仮想DOMではなく、Svelteのコンパイラによる効率的な更新）

**初回アクセスとナビゲーションの違い：**
```typescript
// ブラウザで直接アクセス（またはF5リロード）
GET /about → SSR/SSGされた完全なHTMLが返される

// goto()でのナビゲーション（SvelteKitアプリ起動後）
await goto('/about');
→ GET /about/__data.json （JSONデータのみ取得）
→ クライアントサイドでレンダリング
→ 必要なJSチャンクを動的にロード（初めてのページの場合）
```

**3つのナビゲーション関数の動作：**
```typescript
// すべて同じSPA的な動作（違いは履歴管理のみ）
await goto('/about');           // 新しい履歴エントリを追加
await replaceState('/about', {}); // 現在の履歴を置き換え
await pushState('/about', {});    // 明示的に履歴を追加（goto()と同じ）
```

これはSvelteKitの**ハイブリッドアプローチ**の核心です。
- **初回アクセス**: SEOとパフォーマンスのためにSSR/SSG
- **その後のナビゲーション**: SPAのような高速な遷移
:::

### beforeNavigate / afterNavigate

ページ遷移の前後にフック処理を実行する関数です。`beforeNavigate`は遷移前の確認やキャンセル、`afterNavigate`は遷移後のスクロール位置リセットやアナリティクス送信などに使用します。

ナビゲーションフックの実装例です。`beforeNavigate`で未保存の変更がある場合に確認ダイアログを表示し、ユーザーがキャンセルを選択すれば`cancel()`で遷移を中止します。`afterNavigate`では遷移完了後にページトップへスクロールし、Google Analyticsにページビューイベントを送信しています。

```svelte
<script lang="ts">
  import { beforeNavigate, afterNavigate } from '$app/navigation';
  
  beforeNavigate(({ from, to, cancel }) => {
    // 未保存の変更がある場合
    if (hasUnsavedChanges && !confirm('変更を破棄しますか？')) {
      cancel();
    }
  });
  
  afterNavigate(() => {
    // ページ遷移後にスクロール位置をリセット
    window.scrollTo(0, 0);
    
    // アナリティクスにページビューを送信
    gtag('event', 'page_view');
  });
</script>
```

### prefetch / prefetchRoutes

ページデータを事前に読み込むことで、実際の遷移時の表示を高速化する機能です。重要なページやユーザーが次に訪れる可能性の高いページを先読みすることで、体感速度を向上させます。

プリフェッチの実装例です。`onMount`で重要な3つのページ（ダッシュボード、プロフィール、設定）を一括で事前読み込みし、初回アクセス時の表示を高速化します。リンクのマウスオーバー時に`prefetch()`を呼び出すことで、クリック前にページデータの読み込みを開始し、瞬時にページ遷移できるようにしています。

```svelte
<script lang="ts">
  import { prefetch, prefetchRoutes } from '$app/navigation';
  import { onMount } from 'svelte';
  
  onMount(async () => {
    // 重要なページを事前読み込み
    await prefetchRoutes([
      '/dashboard',
      '/profile',
      '/settings'
    ]);
  });
  
  async function preloadNextPage() {
    // 次のページを事前読み込み
    await prefetch('/posts/next-article');
  }
</script>

<!-- マウスオーバーで事前読み込み -->
<a 
  href="/important-page"
  on:mouseenter={() => prefetch('/important-page')}
>
  重要なページ
</a>
```

## ルートアノテーション（ページオプション詳細）

ページやレイアウトファイルでエクスポートする特別な変数により、レンダリング方法やキャッシュ戦略を制御する高度な機能です。基本的な設定に加えて、条件付きプリレンダリング、エッジランタイム設定、継承の仕組みなど、より詳細な制御が可能です。

### 設定の継承と優先順位

ルートアノテーションは**レイアウトツリーを通じて継承**されます。

```typescript
// src/routes/+layout.ts（ルートレイアウト）
export const ssr = true;
export const csr = true;
export const prerender = false;

// src/routes/blog/+layout.ts（ブログセクション）
export const prerender = true;  // ブログセクション全体を静的生成

// src/routes/blog/admin/+page.ts（管理画面）
export const prerender = false; // 管理画面は動的に
export const ssr = false;       // SPAとして動作
```

**優先順位**: ページ > 直近のレイアウト > 親レイアウト > ルートレイアウト

### 全設定オプション一覧

```typescript
// src/routes/blog/+page.ts
import type { PageLoad } from './$types';

// レンダリング設定
export const prerender = true;      // ビルド時に静的生成
export const ssr = true;            // SSR有効
export const csr = true;            // CSR有効

// URL設定
export const trailingSlash = 'always'; // 'never' | 'always' | 'ignore'

// プラットフォーム設定（+page.server.tsのみ）
export const config = {
  runtime: 'edge',              // エッジランタイムで実行
  regions: ['us-east-1'],       // デプロイリージョン
  isr: {                        // Incremental Static Regeneration
    expiration: 60              // キャッシュ有効期限（秒）
  }
};

export const load: PageLoad = async () => {
  // データ取得
};
```

### 条件付きプリレンダリング

動的ルートで特定のページのみをプリレンダリングする設定です。`entries`関数で生成するページのパラメータを指定し、ビルド時に静的HTMLを作成します。

ブログ記事の動的ルートで最新10件のみをプリレンダリングする例です。`entries`関数で全記事から最新10件を選択し、それぞれのslug（`post-1`、`post-2`など）を返すことで、ビルド時に`/posts/post-1`、`/posts/post-2`などの静的HTMLが生成されます。11件目以降はアクセス時に動的に生成されます。

```typescript
// src/routes/posts/[slug]/+page.ts
import type { PageLoad, EntryGenerator } from './$types';

// プリレンダリングするエントリを生成
export const entries: EntryGenerator = async () => {
  const posts = await getAllPosts();
  
  // 最新10件のみプリレンダリング
  return posts
    .slice(0, 10)
    .map(post => ({ slug: post.slug }));
};

export const prerender = 'auto'; // または true

export const load: PageLoad = async ({ params }) => {
  // 実装
};
```

## 高度なエラーハンドリング

エラー発生時の処理をカスタマイズする機能です。HTTPステータスコードに応じた表示の切り替え、エラー情報の伝播制御、開発環境と本番環境での表示の差別化など、きめ細かなエラー処理を実装できます。

### エラー伝播の仕組み

以下の図は、エラーがどのように階層を遡って処理されるかを示しています。

<Mermaid diagram={errorPropagationDiagram} />

### カスタムエラーページ

HTTPステータスコードに応じて異なるエラー画面を表示する実装例です。404エラーでは「ページが見つかりません」、403エラーでは「アクセス拒否」、その他のエラーでは「サーバーエラー」を表示します。開発環境（`dev`が`true`）では詳細なエラー情報を表示し、本番環境では隠すことでセキュリティを確保しています。

```svelte
<!-- src/routes/(app)/+error.svelte -->
<script lang="ts">
  import { page } from '$app/stores';
  import { dev } from '$app/environment';
  
  let error = $derived($page.error);
  let status = $derived($page.status);
</script>

{#if status === 404}
  <div class="error-404">
    <h1>ページが見つかりません</h1>
    <p>お探しのページは移動または削除された可能性があります。</p>
    <a href="/">ホームに戻る</a>
  </div>
{:else if status === 403}
  <div class="error-403">
    <h1>アクセス拒否</h1>
    <p>{error?.message || 'このページへのアクセス権限がありません。'}</p>
    <a href="/login">ログイン</a>
  </div>
{:else}
  <div class="error-500">
    <h1>サーバーエラー</h1>
    <p>申し訳ございません。エラーが発生しました。</p>
    {#if dev && error}
      <pre>{JSON.stringify(error, null, 2)}</pre>
    {/if}
  </div>
{/if}
```

### エラーの伝播制御

Load関数でエラーを適切にスローし、最も近い`+error.svelte`で処理する仕組みです。

ブログ記事を取得するLoad関数のエラー処理例です。記事が見つからない場合は404エラーをスロー、未公開記事に管理者以外がアクセスした場合は403エラーをスローします。データベースエラーなどの予期しないエラーは500エラーとして処理します。これらのエラーは階層内の最も近い`+error.svelte`でキャッチされ、適切なエラー画面が表示されます。

```typescript
// src/routes/(app)/posts/[id]/+page.server.ts
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
  try {
    const post = await getPost(params.id);
    
    if (!post) {
      // 最も近い+error.svelteで処理される
      throw error(404, {
        message: 'Post not found',
        id: params.id
      });
    }
    
    if (!post.published && !locals.user?.isAdmin) {
      throw error(403, 'This post is not published');
    }
    
    return { post };
  } catch (e) {
    // データベースエラーなど
    console.error('Failed to load post:', e);
    
    throw error(500, {
      message: 'Failed to load post',
      code: 'DB_ERROR'
    });
  }
};
```

## 条件付きコンポーネント表示

同じURLパスで、サーバーサイドのデータに基づいて異なるコンポーネントを表示する手法です。認証状態やユーザーの権限、デバイスタイプなどに応じて、適切なUIを動的に選択できます。

:::note[「並列ルート」ではない理由]
このパターンは複数のルートが並列に存在するわけではなく、単一のルートで条件に応じてコンポーネントを切り替えているだけです。Next.jsの「Parallel Routes」のような機能とは異なります。
:::

### サーバーサイドでのコンポーネント選択

プロフィールページで認証状態に応じて異なるコンポーネントを表示する実装例です。Load関数でユーザーの認証状態を確認し、認証済みなら`'authenticated'`、未認証なら`'guest'`をcomponentプロパティに設定します。ページコンポーネントではこの値に基づいて、認証済みユーザーには`UserProfile`を、未認証ユーザーには`GuestProfile`を表示します。

```typescript
// src/routes/profile/+page.server.ts
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const user = await locals.getUser();
  
  return {
    component: user ? 'authenticated' : 'guest',
    user
  };
};
```

```svelte
<!-- src/routes/profile/+page.svelte -->
<script lang="ts">
  import type { PageData } from './$types';
  import GuestProfile from './GuestProfile.svelte';
  import UserProfile from './UserProfile.svelte';
  
  let { data }: { data: PageData } = $props();
</script>

{#if data.component === 'authenticated'}
  <UserProfile user={data.user} />
{:else}
  <GuestProfile />
{/if}
```

## パフォーマンス最適化

ページ遷移やデータ読み込みを高速化するための最適化手法です。プリロード戦略の選択、コード分割の制御、リンクごとの最適化設定により、ユーザー体験を向上させます。

### リンクの最適化

リンクごとにプリロード戦略を設定する例です。`eager`は表示と同時に即座にデータを読み込み（重要なページ向け）、`hover`はマウスオーバー時に読み込み（デフォルト動作）、`tap`はタップ時に読み込み（モバイルのデータ通信量を節約）、`off`はプリロードを無効化（重いページや外部リンク向け）します。

```svelte
<!-- プリロード戦略 -->
<nav>
  <!-- 表示時に即座にプリロード -->
  <a href="/critical" data-sveltekit-preload-data="eager">
    重要なページ
  </a>
  
  <!-- ホバー時にプリロード（デフォルト） -->
  <a href="/normal" data-sveltekit-preload-data="hover">
    通常のページ
  </a>
  
  <!-- タップ時にプリロード（モバイル向け） -->
  <a href="/mobile" data-sveltekit-preload-data="tap">
    モバイル向けページ
  </a>
  
  <!-- プリロードしない -->
  <a href="/heavy" data-sveltekit-preload-data="off">
    重いページ
  </a>
</nav>
```

### コード分割の制御

動的インポートを使用して、必要な時だけ重いコンポーネントを読み込む手法です。

ダッシュボードページで重いコンポーネントを動的に読み込む例です。`import()`を使用することで、このコンポーネントのコードは別のJavaScriptファイルに分割され、ダッシュボードページにアクセスした時だけ読み込まれます。初期バンドルサイズを削減し、アプリケーション全体の起動を高速化します。

```typescript
// src/routes/dashboard/+page.ts
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
  // 動的インポートで必要な時だけロード
  const { HeavyComponent } = await import('$lib/components/HeavyComponent.svelte');
  
  return {
    component: HeavyComponent
  };
};
```

## 実践例：マルチテナントアプリケーション

複数のテナント（組織）をサポートするSaaSアプリケーションの実装例です。URLパスからテナントを識別し、テナントごとに異なるテーマや設定を適用する、実践的なルーティング構造を紹介します。

マルチテナントアプリケーションのディレクトリ構造です。`[tenant]`動的パラメータでテナントを識別し、`(public)`グループには認証不要なページ、`(app)`グループには認証が必要なページを配置しています。例えば`/acme/dashboard`ではacme社のダッシュボードが表示されます。

```
src/routes/
└── [tenant]/
    ├── +layout.server.ts    # テナント検証
    ├── +layout.svelte       # テナント別レイアウト
    ├── (public)/
    │   ├── +page.svelte     # /{tenant}
    │   └── about/
    │       └── +page.svelte # /{tenant}/about
    └── (app)/
        ├── +layout.server.ts # 認証チェック
        ├── dashboard/
        │   └── +page.svelte  # /{tenant}/dashboard
        └── settings/
            └── +page.svelte  # /{tenant}/settings
```

テナント検証を行うレイアウトLoad関数です。URLパスから取得したテナント名（`params.tenant`）でデータベースを検索し、存在しない場合は404エラーを返します。有効なテナントの場合は、そのテナント固有のテーマ設定やコンフィグを返し、すべての子ページで利用可能にします。

```typescript
// src/routes/[tenant]/+layout.server.ts
import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ params, locals }) => {
  const tenant = await getTenantBySlug(params.tenant);
  
  if (!tenant) {
    throw error(404, 'Tenant not found');
  }
  
  // テナント情報を設定
  locals.tenant = tenant;
  
  return {
    tenant,
    theme: tenant.theme,
    config: tenant.config
  };
};
```

## まとめ

高度なルーティング機能により

- **整理された構造**: ルートグループで論理的な整理
- **柔軟なレイアウト**: ネストと継承による再利用
- **動的な制御**: プログラマティックナビゲーション
- **最適化**: プリフェッチとコード分割

## 次のステップ

- [Load関数とデータフェッチング](/sveltekit/data-loading/) - データ取得戦略
- [フォーム処理とActions](/sveltekit/server/forms/) - サーバーサイド処理
- [セッション管理](/sveltekit/application/session/) - セッションとCookieの管理
- [認証のベストプラクティス](/sveltekit/application/auth-best-practices/) - セキュアな認証実装