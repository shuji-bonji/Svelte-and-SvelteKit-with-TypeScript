---
title: SvelteKit概要
description: フルスタックフレームワークSvelteKitの紹介
---

# SvelteKit概要

## SvelteKitとは

SvelteKitは、Svelteをベースにしたフルスタックアプリケーションフレームワークです。

## 主な機能

### 1. ファイルベースルーティング

```
src/routes/
├── +page.svelte        # /
├── about/+page.svelte  # /about
└── blog/
    ├── +page.svelte    # /blog
    └── [slug]/
        └── +page.svelte # /blog/[slug]
```

### 2. サーバーサイドレンダリング（SSR）

```typescript
// +page.server.ts
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  const posts = await fetchPosts();
  
  return {
    posts
  };
};
```

### 3. APIルート

```typescript
// +server.ts
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
  const data = await fetchData();
  
  return new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json'
    }
  });
};
```

### 4. フォーム処理

```typescript
// +page.server.ts
import type { Actions } from './$types';

export const actions: Actions = {
  default: async ({ request }) => {
    const formData = await request.formData();
    const email = formData.get('email');
    
    // 処理...
    
    return { success: true };
  }
};
```

## レンダリングモード

- **SSR** - サーバーサイドレンダリング
- **CSR** - クライアントサイドレンダリング
- **SSG** - 静的サイト生成
- **ISR** - インクリメンタル静的再生成

## 学習内容

1. [ルーティング](/sveltekit/routing/) - ファイルベースルーティング
2. [Load関数](/sveltekit/load-functions/) - データ読み込み
3. [サーバーサイド処理](/sveltekit/server-side/) - SSRとAPI
4. [フォーム処理](/sveltekit/forms/) - Progressive Enhancement
5. [APIルート](/sveltekit/api-routes/) - RESTful API構築
6. [デプロイメント](/sveltekit/deployment/) - 本番環境へのデプロイ

## 次のステップ

[ルーティング](/sveltekit/routing/)から、SvelteKitの基本を学び始めましょう。