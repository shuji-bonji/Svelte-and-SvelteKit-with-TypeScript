---
title: 動的ルーティング
description: SvelteKitの動的ルーティングをTypeScriptで実装。動的パラメータ、Rest Parameters、オプショナルパラメータ、ルートマッチャーの使い方を解説
---

動的ルーティングを使用することで、URLの一部を変数として扱い、柔軟なルート設計が可能になります。ブログ記事、ユーザープロフィール、商品詳細ページなど、同じレイアウトで異なるデータを表示する場合に活用します。

## 動的パラメータの基本

### [param] - 必須パラメータ

角括弧`[]`を使用して動的セグメントを定義します。

```
src/routes/
├── posts/
│   └── [id]/                 → /posts/123, /posts/abc
│       └── +page.svelte
└── users/
    └── [username]/           → /users/john, /users/jane
        └── +page.svelte
```

### TypeScriptでの実装

```typescript
// src/routes/posts/[id]/+page.ts
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
  // params.id は自動的に型付けされる
  const postId = params.id;
  
  const response = await fetch(`/api/posts/${postId}`);
  
  if (!response.ok) {
    throw error(404, 'Post not found');
  }
  
  return {
    post: await response.json()
  };
};
```

```svelte
<!-- src/routes/posts/[id]/+page.svelte -->
<script lang="ts">
  import type { PageData } from './$types';
  
  export let data: PageData;
</script>

<article>
  <h1>{data.post.title}</h1>
  <div>{@html data.post.content}</div>
</article>
```

## 複数の動的セグメント

### ネストされた動的ルート

```
src/routes/
└── users/
    └── [userId]/
        └── posts/
            └── [postId]/
                ├── +page.svelte     → /users/123/posts/456
                └── +page.ts
```

```typescript
// src/routes/users/[userId]/posts/[postId]/+page.ts
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
  // 両方のパラメータが型安全に取得できる
  const { userId, postId } = params;
  
  const [user, post] = await Promise.all([
    fetch(`/api/users/${userId}`).then(r => r.json()),
    fetch(`/api/posts/${postId}`).then(r => r.json())
  ]);
  
  return {
    user,
    post
  };
};
```

## Rest Parameters（可変長パラメータ）

### [...slug] - 複数セグメントのキャプチャ

`[...slug]`を使用して、複数のパスセグメントを一つのパラメータとして取得します。

```
src/routes/
└── docs/
    └── [...slug]/
        └── +page.svelte
```

#### URLマッピングの例
- `/docs/guide` → `slug = 'guide'`
- `/docs/guide/routing` → `slug = 'guide/routing'`
- `/docs/api/reference/load` → `slug = 'api/reference/load'`

```typescript
// src/routes/docs/[...slug]/+page.ts
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
  // slugは文字列として渡される
  const path = params.slug;
  
  // パスを分割して処理
  const segments = path.split('/');
  
  // Markdownファイルを読み込む例
  const content = await import(`../../../content/docs/${path}.md`);
  
  return {
    path,
    segments,
    content: content.default,
    metadata: content.metadata
  };
};
```

### 実践例：ドキュメントサイト

```svelte
<!-- src/routes/docs/[...slug]/+page.svelte -->
<script lang="ts">
  import type { PageData } from './$types';
  import Breadcrumb from '$lib/components/Breadcrumb.svelte';
  
  export let data: PageData;
  
  // パンくずリストの生成
  $: breadcrumbs = data.segments.map((segment, i) => ({
    label: segment,
    href: `/docs/${data.segments.slice(0, i + 1).join('/')}`
  }));
</script>

<Breadcrumb items={breadcrumbs} />

<article>
  {@html data.content}
</article>
```

## オプショナルパラメータ

### [[param]] - 省略可能なパラメータ

二重角括弧`[[]]`で囲むことで、パラメータを省略可能にできます。

```
src/routes/
└── products/
    └── [[category]]/
        └── +page.svelte
```

#### URLマッピング
- `/products` → `category = undefined`
- `/products/electronics` → `category = 'electronics'`

```typescript
// src/routes/products/[[category]]/+page.ts
import type { PageLoad } from './$types';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
}

export const load: PageLoad = async ({ params, fetch }) => {
  const category = params.category;
  
  // カテゴリーに応じてAPIエンドポイントを変更
  const endpoint = category 
    ? `/api/products?category=${category}`
    : '/api/products';
  
  const products: Product[] = await fetch(endpoint).then(r => r.json());
  
  return {
    products,
    category,
    title: category ? `${category} Products` : 'All Products'
  };
};
```

### オプショナルRestパラメータ

```
src/routes/
└── [[...path]]/
    └── +page.svelte    → すべてのパスにマッチ
```

これは「キャッチオール」ルートとして使用できます。

## ルートマッチャー

### パラメータの検証

カスタムマッチャーを作成して、パラメータのバリデーションを行います。

```typescript
// src/params/integer.ts
import type { ParamMatcher } from '@sveltejs/kit';

export const match: ParamMatcher = (param) => {
  return /^\d+$/.test(param);
};
```

```typescript
// src/params/uuid.ts
import type { ParamMatcher } from '@sveltejs/kit';

export const match: ParamMatcher = (param) => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(param);
};
```

### マッチャーの使用

```
src/routes/
├── posts/
│   └── [id=integer]/        → /posts/123 (数値のみ)
│       └── +page.svelte
└── users/
    └── [id=uuid]/           → /users/550e8400-e29b-41d4-a716-446655440000
        └── +page.svelte
```

```typescript
// src/routes/posts/[id=integer]/+page.ts
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
  // params.id は数値文字列であることが保証される
  const id = parseInt(params.id, 10);
  
  const post = await getPostById(id);
  
  return {
    post
  };
};
```

### 複雑なマッチャーの例

```typescript
// src/params/date.ts
import type { ParamMatcher } from '@sveltejs/kit';

export const match: ParamMatcher = (param) => {
  // YYYY-MM-DD形式の日付
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  
  if (!regex.test(param)) {
    return false;
  }
  
  // 有効な日付かチェック
  const date = new Date(param);
  return !isNaN(date.getTime());
};
```

## 実践的なパターン

### ブログのアーカイブページ

```
src/routes/
└── blog/
    ├── +page.svelte                  → /blog
    ├── [year=integer]/
    │   ├── +page.svelte              → /blog/2024
    │   └── [month=integer]/
    │       ├── +page.svelte          → /blog/2024/03
    │       └── [day=integer]/
    │           └── +page.svelte      → /blog/2024/03/15
    └── [...slug]/
        └── +page.svelte              → /blog/my-first-post
```

```typescript
// src/routes/blog/[year=integer]/[month=integer]/+page.ts
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
  const year = parseInt(params.year, 10);
  const month = parseInt(params.month, 10);
  
  // 月の妥当性チェック
  if (month < 1 || month > 12) {
    throw error(404, 'Invalid month');
  }
  
  const posts = await getPostsByMonth(year, month);
  
  return {
    year,
    month,
    posts,
    title: `${year}年${month}月の記事`
  };
};
```

### 多言語対応ルート

```
src/routes/
└── [[lang=locale]]/
    ├── +layout.ts
    ├── +page.svelte          → / or /ja or /en
    ├── about/
    │   └── +page.svelte      → /about or /ja/about
    └── products/
        └── [id]/
            └── +page.svelte  → /products/123 or /ja/products/123
```

```typescript
// src/params/locale.ts
import type { ParamMatcher } from '@sveltejs/kit';

const supportedLocales = ['ja', 'en', 'zh'];

export const match: ParamMatcher = (param) => {
  return supportedLocales.includes(param);
};
```

```typescript
// src/routes/[[lang=locale]]/+layout.ts
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ params }) => {
  const locale = params.lang || 'ja'; // デフォルトは日本語
  
  // 言語設定を読み込み
  const translations = await import(`$lib/i18n/${locale}.json`);
  
  return {
    locale,
    t: translations.default
  };
};
```

## 動的インポート

### 動的にコンポーネントを読み込む

```typescript
// src/routes/components/[name]/+page.ts
import type { PageLoad } from './$types';

const components = {
  button: () => import('$lib/components/Button.svelte'),
  card: () => import('$lib/components/Card.svelte'),
  modal: () => import('$lib/components/Modal.svelte')
};

export const load: PageLoad = async ({ params }) => {
  const loader = components[params.name as keyof typeof components];
  
  if (!loader) {
    throw error(404, 'Component not found');
  }
  
  const component = await loader();
  
  return {
    component: component.default,
    name: params.name
  };
};
```

## パフォーマンス最適化

### 動的ルートのプリレンダリング

```typescript
// src/routes/posts/[slug]/+page.ts
import type { PageLoad } from './$types';
import type { EntryGenerator } from './$types';

// ビルド時に生成するパスを指定
export const entries: EntryGenerator = async () => {
  const posts = await getAllPosts();
  
  return posts.map(post => ({
    slug: post.slug
  }));
};

export const prerender = true;

export const load: PageLoad = async ({ params }) => {
  const post = await getPostBySlug(params.slug);
  
  return {
    post
  };
};
```

## トラブルシューティング

:::warning[パラメータが取得できない]
- ディレクトリ名が正しく`[param]`形式になっているか確認
- `+page.ts`の`params`オブジェクトを正しく分割代入しているか確認
:::

:::tip[マッチャーが動作しない]
- `src/params/`ディレクトリにマッチャーファイルがあるか確認
- マッチャー名とファイル名が一致しているか確認
- 開発サーバーを再起動する
:::

## まとめ

#### 動的ルーティングにより

- **柔軟なURL設計**: 様々なパターンに対応
- **型安全**: TypeScriptによる自動型付け
- **バリデーション**: マッチャーによる入力検証
- **最適化**: 必要に応じてプリレンダリング可能

## 次のステップ

- [高度なルーティング](/sveltekit/routing/advanced/) - ルートグループとネストレイアウト
- [Load関数とデータフェッチング](/sveltekit/data-loading/) - データ取得の詳細
- [APIルート](/sveltekit/server/api-routes/) - RESTful APIの実装