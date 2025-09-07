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
  
  export let data: LayoutData;
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

## ネストされたレイアウト

レイアウトを階層的に組み合わせる機能です。親レイアウトの中に子レイアウトが入れ子になることで、共通部分を再利用しつつ、セクションごとに特別なレイアウトを追加できます。例えば、サイト全体のヘッダー・フッター、アプリケーションのサイドバー、特定セクションのナビゲーションを重ねることができます。

### レイアウトの階層構造

以下の図は、レイアウトがどのように入れ子になって最終的なページを構成するかを示しています。

<Mermaid diagram={nestedLayoutDiagram} />

### レイアウト適用の流れ

SvelteKitがどのようにレイアウトを階層的に適用してページを生成するかを示すシーケンス図です。

<Mermaid diagram={layoutInheritanceDiagram} />

### レイアウトの継承

レイアウトは階層的に継承され、各レベルで追加の要素を加えることができます。

```svelte
<!-- src/routes/+layout.svelte (ルートレイアウト) -->
<script lang="ts">
  import type { Snippet } from 'svelte';
  let { children }: { children?: Snippet } = $props();
</script>

<div class="root">
  <Header />
  {@render children?.()}
  <Footer />
</div>
```

```svelte
<!-- src/routes/(app)/+layout.svelte (アプリレイアウト) -->
<script lang="ts">
  import type { Snippet } from 'svelte';
  let { children }: { children?: Snippet } = $props();
</script>

<div class="app">
  <Sidebar />
  <main>
    {@render children?.()}
  </main>
</div>
```

```svelte
<!-- src/routes/(app)/dashboard/+layout.svelte (ダッシュボードレイアウト) -->
<script lang="ts">
  import type { Snippet } from 'svelte';
  let { children }: { children?: Snippet } = $props();
</script>

<div class="dashboard">
  <DashboardNav />
  {@render children?.()}
</div>
```

### レイアウトのリセット

`@`記号を使用して、特定のレイアウトまでリセットできます。

```svelte
<!-- src/routes/fullscreen/+layout@.svelte -->
<!-- ルートレイアウトまでリセット（ヘッダー・フッターなし） -->
<script lang="ts">
  import type { Snippet } from 'svelte';
  let { children }: { children?: Snippet } = $props();
</script>

{@render children?.()}
```

```svelte
<!-- src/routes/(app)/print/+layout@(app).svelte -->
<!-- (app)レイアウトまでリセット -->
<script lang="ts">
  import type { Snippet } from 'svelte';
  let { children }: { children?: Snippet } = $props();
</script>

<div class="print-layout">
  {@render children?.()}
</div>
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

<form on:submit={handleSubmit}>
  <!-- フォーム内容 -->
</form>
```

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

## ルートアノテーション

ページやレイアウトファイルでエクスポートする特別な変数により、レンダリング方法やキャッシュ戦略を制御する機能です。プリレンダリング、SSR/CSRの有効化、トレイリングスラッシュの処理など、ルートごとに細かな動作をカスタマイズできます。

### ページごとの設定

ブログページの設定例です。`prerender = true`でビルド時に静的HTMLを生成し、`ssr = true`でサーバーサイドレンダリングを有効化、`csr = true`でクライアントサイドレンダリングも有効にしています。`trailingSlash = 'always'`により、URLの末尾に必ずスラッシュが付くように統一されます（`/blog`→`/blog/`）。

```typescript
// src/routes/blog/+page.ts
import type { PageLoad } from './$types';

// プリレンダリング設定
export const prerender = true;      // ビルド時に静的生成
export const ssr = true;            // SSR有効
export const csr = true;            // CSR有効

// トレイリングスラッシュ設定
export const trailingSlash = 'always'; // 'never' | 'always' | 'ignore'

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
  
  $: error = $page.error;
  $: status = $page.status;
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

## 並列ルート

同じURLパスで条件に応じて異なるコンポーネントを表示する手法です。認証状態やユーザーの権限、デバイスタイプなどに基づいて、適切なUIを提供できます。

### 条件に応じた異なるコンポーネント表示

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
  
  export let data: PageData;
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
- [認証と認可](/sveltekit/application/authentication/) - セキュアなアプリケーション構築