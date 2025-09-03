---
title: 動的ルーティング
description: SvelteKitの動的ルーティングをTypeScriptで実装。動的パラメータ、Rest Parameters、オプショナルパラメータ、ルートマッチャーの使い方を解説
---

<script>
  import Mermaid from '$lib/components/Mermaid.svelte';
  
  const parameterMatchingDiagram = `graph LR
    subgraph "URLパス"
      URL1["/posts/123"]
      URL2["/users/john"]
      URL3["/products/laptop-pro"]
    end
    
    subgraph "ルート定義"
      Route1["/posts/[id]"]
      Route2["/users/[username]"]
      Route3["/products/[slug]"]
    end
    
    subgraph "パラメータ"
      Param1["params.id = '123'"]
      Param2["params.username = 'john'"]
      Param3["params.slug = 'laptop-pro'"]
    end
    
    URL1 --> Route1
    URL2 --> Route2
    URL3 --> Route3
    
    Route1 --> Param1
    Route2 --> Param2
    Route3 --> Param3
    
    style URL1 fill:#e3f2fd,stroke:#1976d2
    style URL2 fill:#e3f2fd,stroke:#1976d2
    style URL3 fill:#e3f2fd,stroke:#1976d2
    style Param1 fill:#e8f5e9,stroke:#388e3c
    style Param2 fill:#e8f5e9,stroke:#388e3c
    style Param3 fill:#e8f5e9,stroke:#388e3c`;
    
  const restParametersDiagram = `graph TB
    subgraph "Rest Parameters の動作"
      URL1["/docs/guide"]
      URL2["/docs/guide/routing"]
      URL3["/docs/api/reference/load"]
      
      Route["[...slug]"]
      
      Param1["slug = 'guide'"]
      Param2["slug = 'guide/routing'"]
      Param3["slug = 'api/reference/load'"]
      
      URL1 --> Route
      URL2 --> Route
      URL3 --> Route
      
      Route --> Param1
      Route --> Param2
      Route --> Param3
    end
    
    style URL1 fill:#fff3e0,stroke:#f57c00
    style URL2 fill:#fff3e0,stroke:#f57c00
    style URL3 fill:#fff3e0,stroke:#f57c00
    style Route fill:#f3e5f5,stroke:#7b1fa2
    style Param1 fill:#e8f5e9,stroke:#388e3c
    style Param2 fill:#e8f5e9,stroke:#388e3c
    style Param3 fill:#e8f5e9,stroke:#388e3c`;
    
  const requestFlowDiagram = `flowchart TD
    A[ブラウザ /posts/123] -->|①リクエスト| B[SvelteKit Router]
    B -->|②ルート解決| C[posts/id/+page.ts]
    C -->|③API呼び出し| D[api/posts/id/+server.ts]
    D -->|④データ取得| E[データベース/外部API]
    E -->|⑤データ返却| D
    D -->|⑥JSONレスポンス| C
    C -->|⑦データ渡し| F[posts/id/+page.svelte]
    F -->|⑧レンダリング| G[HTML生成]
    G -->|⑨レスポンス| A
    
    style A fill:#f9f,stroke:#333,stroke-width:2px
    style B fill:#bbf,stroke:#333,stroke-width:2px
    style C fill:#dfd,stroke:#333,stroke-width:2px,color:black
    style D fill:#ffd,stroke:#333,stroke-width:2px,color:black
    style F fill:#dfd,stroke:#333,stroke-width:2px,color:black`;
</script>

動的ルーティングを使用することで、URLの一部を変数として扱い、柔軟なルート設計が可能になります。ブログ記事、ユーザープロフィール、商品詳細ページなど、同じレイアウトで異なるデータを表示する場合に活用します。

## 動的パラメータの基本

URLの一部を変数として扱う基本的な方法を学びます。角括弧`[]`を使ったディレクトリ名が、URLパラメータとしてキャプチャされる仕組みです。

### パラメータマッチングの仕組み

以下の図は、URLパスがどのように動的パラメータにマッチし、変数として取得されるかを示しています。

<Mermaid diagram={parameterMatchingDiagram} />

### [param] - 必須パラメータ

角括弧`[]`を使用して動的セグメントを定義します。このパラメータはURLに必ず含まれる必要があり、省略できません。

ディレクトリ構造とURLの対応例です。`[id]`や`[username]`ディレクトリが、実際のURLでは具体的な値（123、abc、johnなど）に置き換わります。

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

Load関数で動的パラメータを取得する例です。`params.id`はSvelteKitが自動的に型付けし、URLから抽出した値（例：`/posts/123`の場合は`"123"`）が格納されます。この値を使ってAPIから該当する投稿データを取得しています。

```typescript
// src/routes/posts/[id]/+page.ts
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
  // params.id は自動的に型付けされる
  const postId = params.id;
  
  // SvelteKit内部のAPIルート（src/routes/api/posts/[id]/+server.ts）を呼び出す
  // 外部APIの場合は完全なURL（例: https://api.example.com/posts/${postId}）を使用
  const response = await fetch(`/api/posts/${postId}`);
  
  if (!response.ok) {
    throw error(404, 'Post not found');
  }
  
  return {
    post: await response.json()
  };
};
```

Load関数で取得した投稿データを表示するコンポーネントです。`data.post`にはAPIから取得した記事情報が含まれ、`title`を`<h1>`タグで、`content`をHTMLとしてレンダリングしています。

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

### SvelteKitのリクエスト処理フロー

`/posts/123`にアクセスした際の、SvelteKit内部での処理の流れを詳しく解説します。
#### 処理フロー図

<Mermaid diagram={requestFlowDiagram} />

この一連の流れにより、データ取得ロジック（`+server.ts`）、データ整形（`+page.ts`）、表示（`+page.svelte`）が明確に分離され、保守性の高いアーキテクチャが実現されています。

#### 処理の詳細

<div class="flow-grid">

<div class="flow-card">

**①リクエスト → ②ルート解決**
- ブラウザが `/posts/123` にアクセス
- SvelteKit Routerがルートを特定
- 動的パラメータ `id = "123"` を抽出

</div>

<div class="flow-card">

**③API呼び出し（+page.ts）**
```typescript
export const load: PageLoad = async ({ params }) => {
  // params.id = "123"
  const response = await fetch('/api/posts/123');
  return { post: await response.json() };
};
```

</div>

<div class="flow-card">

**④データ取得 → ⑤データ返却**
- `+server.ts` の GET関数が実行
- データベースから記事情報を取得
- JSON形式で整形して返却

</div>

<div class="flow-card">

**⑥JSONレスポンス → ⑦データ渡し**
- Load関数がJSONを受け取る
- `return { post }` でコンポーネントへ
- TypeScriptで型安全に受け渡し

</div>

<div class="flow-card">

**⑧レンダリング（+page.svelte）**
- `data` プロパティでデータ受け取り
- SSR：サーバーでHTML生成
- CSR：クライアントでDOM構築

</div>

<div class="flow-card">

**⑨レスポンス**
- 生成されたHTMLを送信
- ブラウザがページを表示
- ユーザーに内容が表示される

</div>

</div>

<style>
  .flow-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
  }
  
  .flow-card {
    padding: 1rem;
    background: var(--sp-color-bg-secondary, #f9fafb);
    border-radius: 8px;
    border: 1px solid var(--sp-color-border, #e5e7eb);
  }
  
  :global(.dark) .flow-card {
    background: rgba(31, 41, 55, 0.5);
    border-color: rgba(75, 85, 99, 0.5);
  }
  
  @media (max-width: 768px) {
    .flow-grid {
      grid-template-columns: 1fr;
    }
  }
</style>


## 複数の動的セグメント

一つのURLパスに複数の動的パラメータを含む方法を学びます。ユーザーの投稿、カテゴリー別の商品など、階層的なデータ構造をURLで表現する際に活用します。

### ネストされた動的ルート

ユーザーIDと投稿IDを組み合わせたルート構造の例です。`/users/123/posts/456`のような URLで、特定のユーザーの特定の投稿にアクセスできます。

```
src/routes/
└── users/
    └── [userId]/
        └── posts/
            └── [postId]/
                ├── +page.svelte     → /users/123/posts/456
                └── +page.ts
```

複数の動的パラメータを同時に扱う例です。`params`オブジェクトから`userId`と`postId`を分割代入で取得し、`Promise.all`を使ってユーザー情報と投稿情報を並列で取得しています。これにより、パフォーマンスを最適化しつつ、両方のデータをページに渡しています。

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

URLの任意の深さのパスを一つのパラメータとしてキャプチャする機能です。ドキュメントサイトの階層構造や、ファイルシステムのような可変長のパスを扱う際に便利です。

### Rest Parametersの動作

以下の図は、`[...slug]`がどのように複数のパスセグメントを一つのパラメータとしてキャプチャするかを示しています。

<Mermaid diagram={restParametersDiagram} />

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

Rest Parametersを使ったドキュメントサイトの実装例です。`params.slug`にはURLパスがスラッシュ区切りの文字列として渡され（例：`"guide/routing"`）、これを分割してパンくずリストの生成に使用しています。また、パスを使って対応するMarkdownファイルを動的にインポートしています。

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

ドキュメントページの表示コンポーネントです。`data.segments`配列（例：`["guide", "routing"]`）を使ってパンくずリストを動的に生成し、各セグメントに対応するURLを構築しています。Markdownコンテンツは`{@html}`ディレクティブでHTMLとしてレンダリングされます。

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

URLパラメータを省略可能にする機能です。同じページコンポーネントで、パラメータの有無によって異なる動作を実現できます。例えば、全商品一覧とカテゴリー別一覧を同じコンポーネントで処理する場合に便利です。

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

オプショナルパラメータの実装例です。`params.category`は`undefined`または文字列値になります。この値の有無をチェックして、全商品を取得するか特定カテゴリーの商品のみを取得するかを切り替えています。ページタイトルも動的に変更して、ユーザーに適切な情報を伝えています。

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

URLパラメータの形式を検証する機能です。数値のID、UUID、日付形式など、特定のパターンに一致するパラメータのみを受け付けるように制限できます。これにより、不正なURLへのアクセスを事前に防ぎ、エラーハンドリングを簡素化できます。

### パラメータの検証

カスタムマッチャーを作成して、パラメータのバリデーションを行います。

数値のみを許可する`integer`マッチャーと、UUID形式を検証する`uuid`マッチャーの実装例です。`match`関数はURLパラメータを受け取り、正規表現で検証して`true`または`false`を返します。`false`の場合、そのルートはマッチせず404エラーになります。

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

ディレクトリ名に`[param=matcher]`形式を使ってマッチャーを適用します。`integer`マッチャーを使ったルートは数値のIDのみを受け付け、`uuid`マッチャーを使ったルートはUUID形式の文字列のみを受け付けます。

```
src/routes/
├── posts/
│   └── [id=integer]/        → /posts/123 (数値のみ)
│       └── +page.svelte
└── users/
    └── [id=uuid]/           → /users/550e8400-e29b-41d4-a716-446655440000
        └── +page.svelte
```

マッチャーを使用したルートのLoad関数です。`integer`マッチャーにより`params.id`が数値文字列であることが保証されているため、安全に`parseInt`で数値に変換できます。文字列のパラメータ（例：`/posts/abc`）はマッチャーで拒否され、このLoad関数は実行されません。

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

日付形式を検証する高度なマッチャーの例です。まず正規表現で`YYYY-MM-DD`形式をチェックし、その後`Date`コンストラクタで実際に有効な日付かどうかを検証しています。これにより、`2024-02-30`のような存在しない日付を拒否できます。

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

実際のアプリケーションでよく使われる動的ルーティングのパターンを紹介します。これらのパターンを組み合わせることで、複雑なURL構造を持つアプリケーションを構築できます。

### ブログのアーカイブページ

年月日でフィルタリング可能なブログアーカイブの構造例です。`integer`マッチャーで数値のみを受け付け、記事のslugは`[...slug]`で柔軟に対応しています。

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

月別アーカイブページのLoad関数です。URLから年と月を取得し、妥当性チェック（月は1～12の範囲）を行った後、該当月の記事を取得しています。無効な月の場合は404エラーをスローし、正しいエラーページを表示します。

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

オプショナルパラメータとマッチャーを組み合わせた多言語サイトの構造です。言語コードが省略された場合はデフォルト言語を使用し、すべてのページで言語切り替えが可能になります。

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

サポートする言語コードのみを受け付ける`locale`マッチャーです。配列に含まれる言語コード（ja、en、zh）のみマッチし、それ以外（例：`/fr/about`）は404エラーになります。

```typescript
// src/params/locale.ts
import type { ParamMatcher } from '@sveltejs/kit';

const supportedLocales = ['ja', 'en', 'zh'];

export const match: ParamMatcher = (param) => {
  return supportedLocales.includes(param);
};
```

レイアウトLoad関数で言語設定を読み込む実装です。URLに言語コードがない場合はデフォルトで日本語を使用し、対応する翻訳ファイルを動的インポートしています。読み込んだ翻訳データはすべての子ページで利用可能になります。

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

URLパラメータに基づいてコンポーネントやモジュールを動的に読み込む技術です。コード分割を活用して、必要なコンポーネントのみをロードすることで初期バンドルサイズを削減できます。

### 動的にコンポーネントを読み込む

コンポーネントギャラリーの実装例です。URLパラメータ（`/components/button`など）に基づいて、対応するコンポーネントを動的インポートします。`components`オブジェクトで名前とインポート関数をマッピングし、該当するコンポーネントがない場合は404エラーを返します。

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

動的ルートをビルド時に静的生成する設定です。`entries`関数で生成するすべてのパスを列挙し、`prerender = true`でプリレンダリングを有効化します。この例では、すべてのブログ記事のページがビルド時に静的HTMLとして生成され、CDNから高速に配信できるようになります。

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