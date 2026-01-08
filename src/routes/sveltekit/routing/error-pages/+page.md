---
title: エラーページのカスタマイズ - 404/500をTypeScriptで実装
description: SvelteKitでカスタム404/500エラーページを実装する方法。+error.svelte、handleError hooks、動的エラーページ、SEO対応を実践コードで解説
---

SvelteKitでは、404（Not Found）や500（Server Error）などのエラーページを柔軟にカスタマイズできます。このページでは、ユーザーフレンドリーなエラーページの実装方法を詳しく解説します。

## この記事で学べること

- `+error.svelte` で404/500ページをカスタマイズ
- ルート階層ごとのエラーページ設定
- `hooks.server.ts` でエラーをカスタマイズ
- エラーページでもSEOを考慮する方法
- 開発環境と本番環境でのエラー表示の違い
- プログラムから404/500を投げる方法

## 基本的な404ページ

### src/routes/+error.svelte

最もシンプルなエラーページの実装です。

```svelte
<script lang="ts">
  import { page } from '$app/stores';
</script>

<svelte:head>
  <title>{$page.status} | サイト名</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<div class="error-container">
  <h1>{$page.status}</h1>

  {#if $page.status === 404}
    <h2>ページが見つかりません</h2>
    <p>お探しのページは存在しないか、移動した可能性があります。</p>
    <p>URLが正しいかご確認ください。</p>
  {:else if $page.status >= 500}
    <h2>サーバーエラー</h2>
    <p>サーバーで問題が発生しました。</p>
    <p>しばらく時間をおいてから再度お試しください。</p>
  {:else}
    <h2>エラーが発生しました</h2>
    <p>{$page.error?.message}</p>
  {/if}

  <nav class="error-actions">
    <a href="/" class="btn-primary">ホームに戻る</a>
    <a href="/sitemap" class="btn-secondary">サイトマップ</a>
  </nav>
</div>

<style>
  .error-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
    text-align: center;
    padding: 2rem;
  }

  h1 {
    font-size: 8rem;
    margin: 0;
    color: var(--color-primary, #ff3e00);
    line-height: 1;
  }

  h2 {
    margin: 1rem 0;
    color: var(--color-text, #333);
  }

  p {
    color: var(--color-text-muted, #666);
    margin: 0.5rem 0;
  }

  .error-actions {
    display: flex;
    gap: 1rem;
    margin-top: 2rem;
  }

  .btn-primary {
    padding: 0.75rem 1.5rem;
    background: var(--color-primary, #ff3e00);
    color: white;
    text-decoration: none;
    border-radius: 4px;
  }

  .btn-secondary {
    padding: 0.75rem 1.5rem;
    background: transparent;
    color: var(--color-primary, #ff3e00);
    text-decoration: none;
    border: 1px solid var(--color-primary, #ff3e00);
    border-radius: 4px;
  }
</style>
```

## 階層別エラーページ

ルートごとに異なるエラーページを設定できます。より深い階層のエラーページが優先されます。

```
src/routes/
├── +error.svelte           # グローバルエラーページ
├── +layout.svelte
├── blog/
│   ├── +error.svelte       # /blog/* 専用エラーページ
│   ├── +page.svelte
│   └── [slug]/
│       └── +page.svelte
├── admin/
│   ├── +error.svelte       # /admin/* 専用エラーページ
│   ├── +layout.svelte
│   └── dashboard/
│       └── +page.svelte
└── api/
    └── +server.ts          # APIにはエラーページなし（JSONを返す）
```

### ブログ専用エラーページ

```svelte
<!-- src/routes/blog/+error.svelte -->
<script lang="ts">
  import { page } from '$app/stores';
</script>

<svelte:head>
  <title>記事が見つかりません | ブログ</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<div class="blog-error">
  <h1>記事が見つかりません</h1>

  {#if $page.status === 404}
    <p>お探しの記事は削除されたか、URLが変更された可能性があります。</p>

    <div class="suggestions">
      <h2>こちらの記事はいかがですか？</h2>
      <!-- 関連記事や人気記事を表示 -->
      <ul>
        <li><a href="/blog/getting-started">Svelte入門ガイド</a></li>
        <li><a href="/blog/sveltekit-basics">SvelteKitの基本</a></li>
      </ul>
    </div>
  {:else}
    <p>エラーが発生しました: {$page.error?.message}</p>
  {/if}

  <a href="/blog">ブログ一覧に戻る</a>
</div>
```

### 管理画面専用エラーページ

```svelte
<!-- src/routes/admin/+error.svelte -->
<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';

  function handleRetry() {
    // 現在のページをリロード
    goto($page.url.pathname, { invalidateAll: true });
  }
</script>

<svelte:head>
  <title>エラー | 管理画面</title>
</svelte:head>

<div class="admin-error">
  <div class="error-icon">⚠️</div>

  {#if $page.status === 403}
    <h1>アクセス権限がありません</h1>
    <p>このページにアクセスする権限がありません。</p>
    <a href="/admin">ダッシュボードに戻る</a>
  {:else if $page.status === 404}
    <h1>ページが見つかりません</h1>
    <p>管理画面のこのセクションは存在しません。</p>
    <a href="/admin">ダッシュボードに戻る</a>
  {:else}
    <h1>エラーが発生しました</h1>
    <p>ステータス: {$page.status}</p>
    <p>{$page.error?.message}</p>
    <button onclick={handleRetry}>再試行</button>
  {/if}
</div>
```

## プログラムからエラーを投げる

### 404 Not Found

```typescript
// src/routes/blog/[slug]/+page.server.ts
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getPost } from '$lib/server/posts';

export const load: PageServerLoad = async ({ params }) => {
  const post = await getPost(params.slug);

  if (!post) {
    // 404エラーを投げる
    throw error(404, {
      message: '記事が見つかりません',
      code: 'POST_NOT_FOUND'
    });
  }

  // 下書き記事は非公開
  if (post.status === 'draft') {
    throw error(404, {
      message: 'この記事は公開されていません'
    });
  }

  return { post };
};
```

### 403 Forbidden

```typescript
// src/routes/admin/+layout.server.ts
import { error, redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
  // 未認証
  if (!locals.user) {
    throw redirect(302, '/login?redirect=/admin');
  }

  // 管理者権限がない
  if (locals.user.role !== 'admin') {
    throw error(403, {
      message: '管理者権限が必要です'
    });
  }

  return {
    user: locals.user
  };
};
```

### 500 Internal Server Error

```typescript
// src/routes/api/data/+server.ts
import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
  try {
    const data = await fetchExternalAPI();
    return json(data);
  } catch (e) {
    console.error('API Error:', e);

    // 500エラーを投げる
    throw error(500, {
      message: 'データの取得に失敗しました'
    });
  }
};
```

## hooks.server.ts でエラーをカスタマイズ

`handleError` フックを使って、エラーのログ記録やカスタマイズを行えます。

```typescript
// src/hooks.server.ts
import type { HandleServerError } from '@sveltejs/kit';

export const handleError: HandleServerError = async ({
  error,
  event,
  status,
  message
}) => {
  // エラーIDを生成（ユーザーサポート用）
  const errorId = crypto.randomUUID();

  // 500番台エラーのみログ（クライアントエラーは除外）
  if (status >= 500) {
    // 本番環境では外部サービスにエラーを送信
    console.error({
      errorId,
      status,
      message,
      url: event.url.href,
      method: event.request.method,
      error: error instanceof Error ? error.stack : error,
      timestamp: new Date().toISOString()
    });

    // Sentryなどに送信
    // await sendToSentry({ errorId, error, event });
  }

  // クライアントに返すエラーオブジェクト
  return {
    message: status >= 500
      ? 'サーバーエラーが発生しました。しばらくしてから再度お試しください。'
      : message,
    errorId // サポート問い合わせ用
  };
};
```

### エラーページでエラーIDを表示

```svelte
<!-- src/routes/+error.svelte -->
<script lang="ts">
  import { page } from '$app/stores';

  // hooks.server.tsで設定したカスタムプロパティ
  let errorId = $derived($page.error?.errorId);
</script>

{#if $page.status >= 500 && errorId}
  <p class="error-id">
    お問い合わせの際は以下のIDをお伝えください:
    <code>{errorId}</code>
  </p>
{/if}
```

## app.d.ts での型定義

カスタムエラープロパティの型を定義します。

```typescript
// src/app.d.ts
declare global {
  namespace App {
    interface Error {
      message: string;
      errorId?: string;
      code?: string;
    }

    interface Locals {
      user?: {
        id: string;
        email: string;
        role: 'user' | 'admin';
      };
    }
  }
}

export {};
```

## SEO対応

エラーページでもSEOを考慮することが重要です。

```svelte
<script lang="ts">
  import { page } from '$app/stores';
</script>

<svelte:head>
  <!-- タイトルにステータスコードを含める -->
  <title>{$page.status} - ページが見つかりません | サイト名</title>

  <!-- 検索エンジンにインデックスさせない -->
  <meta name="robots" content="noindex, nofollow" />

  <!-- 正規URLは設定しない（エラーページには不要） -->

  <!-- OGPは設定しない（シェアされることを想定しない） -->
</svelte:head>
```

## 開発環境 vs 本番環境

### 開発環境での詳細なエラー表示

```svelte
<script lang="ts">
  import { page } from '$app/stores';
  import { dev } from '$app/environment';
</script>

{#if dev && $page.error}
  <details class="dev-error-details">
    <summary>開発者向けエラー詳細</summary>
    <pre>{JSON.stringify($page.error, null, 2)}</pre>
  </details>
{/if}

<style>
  .dev-error-details {
    margin-top: 2rem;
    padding: 1rem;
    background: #f0f0f0;
    border-radius: 4px;
    text-align: left;
  }

  .dev-error-details pre {
    overflow-x: auto;
    font-size: 0.875rem;
  }
</style>
```

## よくあるパターン

### 404ページに検索機能を追加

```svelte
<!-- src/routes/+error.svelte -->
<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';

  let searchQuery = $state('');

  function handleSearch(e: Event) {
    e.preventDefault();
    if (searchQuery.trim()) {
      goto(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  }
</script>

{#if $page.status === 404}
  <div class="search-suggestion">
    <p>お探しの内容を検索してみてください:</p>
    <form onsubmit={handleSearch}>
      <input
        type="search"
        bind:value={searchQuery}
        placeholder="キーワードを入力..."
      />
      <button type="submit">検索</button>
    </form>
  </div>
{/if}
```

### エラー発生時の自動リダイレクト

```svelte
<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';

  let countdown = $state(10);

  // 10秒後に自動でホームへリダイレクト
  $effect(() => {
    if ($page.status === 404) {
      const timer = setInterval(() => {
        countdown--;
        if (countdown <= 0) {
          clearInterval(timer);
          goto('/');
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  });
</script>

{#if $page.status === 404}
  <p>{countdown}秒後にホームページへ移動します...</p>
  <a href="/">今すぐ移動</a>
{/if}
```

## ベストプラクティス

| ポイント | 推奨事項 |
|---------|---------|
| ユーザー体験 | 次のアクションを明確に提示する |
| SEO | `noindex` を設定してインデックスを防ぐ |
| セキュリティ | 本番環境では詳細なエラー情報を隠す |
| ログ | 500エラーは必ずログに記録する |
| デザイン | サイト全体のデザインと統一する |
| アクセシビリティ | 適切な見出し構造とコントラストを維持 |

## 関連ドキュメント

- [特殊ファイルシステム](/sveltekit/basics/file-system/) - +error.svelteの配置
- [Hooks](/sveltekit/server/hooks/) - handleErrorの詳細
- [エラーハンドリング](/sveltekit/application/error-handling/) - アプリ全体のエラー戦略

## 次のステップ

エラーページのカスタマイズを理解したら、次はフォーム処理とActionsについて学びましょう。
[フォーム処理とActions](/sveltekit/server/forms/)では、プログレッシブエンハンスメントを活用したフォーム実装を解説します。
