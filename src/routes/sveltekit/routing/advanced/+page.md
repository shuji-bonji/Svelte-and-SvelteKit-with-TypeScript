---
title: 高度なルーティング
description: SvelteKitの高度なルーティング機能をTypeScriptで実装。ルートグループ、ネストレイアウト、プログラマティックナビゲーション、ルートアノテーションを解説
---

プロダクションレベルのアプリケーション開発に必要な、SvelteKitの高度なルーティング機能を学びます。ルートグループによる論理的な整理、複雑なレイアウト構造、動的なナビゲーション制御などを習得します。

## ルートグループ

### (group) - URLに影響しないグループ化

括弧`()`で囲まれたディレクトリは、URLパスに影響を与えずにルートを論理的にグループ化できます。

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
    <slot />
  </main>
</div>
```

### 管理者専用ルートグループ

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

### レイアウトの継承

レイアウトは階層的に継承され、各レベルで追加の要素を加えることができます。

```svelte
<!-- src/routes/+layout.svelte (ルートレイアウト) -->
<div class="root">
  <Header />
  <slot />
  <Footer />
</div>
```

```svelte
<!-- src/routes/(app)/+layout.svelte (アプリレイアウト) -->
<div class="app">
  <Sidebar />
  <main>
    <slot />
  </main>
</div>
```

```svelte
<!-- src/routes/(app)/dashboard/+layout.svelte (ダッシュボードレイアウト) -->
<div class="dashboard">
  <DashboardNav />
  <slot />
</div>
```

### レイアウトのリセット

`@`記号を使用して、特定のレイアウトまでリセットできます。

```svelte
<!-- src/routes/fullscreen/+layout@.svelte -->
<!-- ルートレイアウトまでリセット（ヘッダー・フッターなし） -->
<slot />
```

```svelte
<!-- src/routes/(app)/print/+layout@(app).svelte -->
<!-- (app)レイアウトまでリセット -->
<div class="print-layout">
  <slot />
</div>
```

## プログラマティックナビゲーション

### goto関数

JavaScriptから直接ページ遷移を制御します。

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

ナビゲーション前後にフックを実行します。

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

ページを事前に読み込んで高速化します。

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

### ページごとの設定

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

### カスタムエラーページ

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

### 条件に応じた異なるコンポーネント表示

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

### リンクの最適化

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