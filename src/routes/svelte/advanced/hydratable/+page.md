---
title: hydratable - SSRデータの再利用
description: Svelteのhydratable APIでSSR時のデータをハイドレーション時に再利用。サーバーで取得したデータの再取得を防ぎ、パフォーマンスを最適化する方法をTypeScriptで解説
---

<script>
	import Admonition from '$lib/components/Admonition.svelte';
  import Mermaid from '$lib/components/Mermaid.svelte';

  const hydratableDiagram = `flowchart TB
    subgraph SSR["サーバー（SSR）"]
        direction TB
        S1["1. hydratable('user', () => getUser()) が実行される"]
        S2["2. getUser() が呼ばれ、データを取得"]
        S3["3. 結果をシリアライズして head に埋め込む"]
        S4["4. コンポーネントをHTMLにレンダリング"]
        S1 --> S2 --> S3 --> S4
    end

    subgraph HYDRATING["クライアント（ハイドレーション中）"]
        direction TB
        H1["1. hydratable('user', () => getUser()) が実行される"]
        H2["2. キー 'user' に対応するシリアライズ済みデータを検索"]
        H3["3. データが見つかれば、それを返す（getUser()は呼ばない）"]
        H1 --> H2 --> H3
    end

    subgraph AFTER["クライアント（ハイドレーション後）"]
        direction TB
        A1["1. hydratable('user', () => getUser()) が実行される"]
        A2["2. 通常通り getUser() を呼び出す"]
        A1 --> A2
    end

    SSR --> HYDRATING --> AFTER

    style SSR fill:#e3f2fd,stroke:#1976d2,color:#333
    style HYDRATING fill:#fff3e0,stroke:#f57c00,color:#333
    style AFTER fill:#e8f5e9,stroke:#388e3c,color:#333
    style S1 fill:#fff,color:#333
    style S2 fill:#fff,color:#333
    style S3 fill:#fff,color:#333
    style S4 fill:#fff,color:#333
    style H1 fill:#fff,color:#333
    style H2 fill:#fff,color:#333
    style H3 fill:#fff,color:#333
    style A1 fill:#fff,color:#333
    style A2 fill:#fff,color:#333`;
</script>

`hydratable` は、SSR（サーバーサイドレンダリング）で取得したデータを、ハイドレーション時にクライアントで再利用するための低レベル API です。

## この記事で学べること

- `hydratable` が解決する問題
- 基本的な使い方とシリアライゼーション
- ランダム値や時間ベースの値の安定化
- CSP（Content Security Policy）への対応
- SvelteKit Remote Functions との関係

<Admonition type="info" title="低レベル API">

`hydratable` は低レベル API であり、通常のアプリケーション開発で直接使用する機会は少ないです。
多くの場合、SvelteKit の [Remote Functions](/sveltekit/server/remote-functions/) がこの API を内部的に使用しています。

</Admonition>

## 問題: SSR 時のデータ再取得

Svelte では、コンポーネント内で非同期データを `await` で取得できます。
しかし、これには問題があります。

```svelte
<script lang="ts">
  import { getUser } from 'my-database-library';

  // サーバーでユーザーデータを取得し、HTMLをレンダリング
  // しかし、ハイドレーション時にクライアントで再度取得してしまう！
  const user = await getUser();
</script>

<h1>{user.name}</h1>
```

#### この問題点

1. **サーバー側**: `getUser()` を実行してデータを取得
2. **HTML に埋め込み**: ユーザー名をレンダリング
3. **クライアント側**: ハイドレーション時に `getUser()` を**再度実行**
4. **ハイドレーションがブロック**: データ取得完了まで待機

すでにサーバーで取得したデータを、クライアントで再取得するのは無駄です。

## 解決策: hydratable

`hydratable` を使用すると、サーバーで取得したデータをシリアライズして HTML に埋め込み、ハイドレーション時にはそのデータを再利用できます。

```svelte
<script lang="ts">
  import { hydratable } from 'svelte';
  import { getUser } from 'my-database-library';

  // サーバー: getUser()を実行し、結果をシリアライズしてHTMLに埋め込む
  // クライアント（ハイドレーション時）: シリアライズされたデータを使用
  // クライアント（ハイドレーション後）: getUser()を実行
  const user = await hydratable('user', () => getUser());
</script>

<h1>{user.name}</h1>
```

### 動作の流れ

<Mermaid diagram={hydratableDiagram} />

## 基本的な使い方

`hydratable` の基本的な使い方と、TypeScript との組み合わせ方を解説します。

### TypeScript での型定義

`hydratable` はジェネリクスをサポートしており、返されるデータの型を明示的に指定できます。以下の例では、`User` インターフェースを定義し、型安全にデータを取得しています。

```typescript
import { hydratable } from 'svelte';

interface User {
  id: string;
  name: string;
  email: string;
}

// 型安全なhydratable
const user = await hydratable<User>('user', async () => {
  const response = await fetch('/api/user');
  return response.json();
});
```

### キーの重要性

`hydratable` の第一引数はユニークなキーです。このキーは、サーバーでシリアライズしたデータをクライアントで識別するために使用されます。同じキーを使用すると、関数を再実行せずに同じデータが返されます。

以下の例では、異なるキーで異なるデータを取得し、同じキーを使った場合にキャッシュされたデータが返されることを示しています。

```svelte
<script lang="ts">
  import { hydratable } from 'svelte';

  // 異なるキーで異なるデータを取得
  const posts = await hydratable('posts', () => fetchPosts());
  const comments = await hydratable('comments', () => fetchComments());

  // 同じキーなら同じデータを返す（関数は再実行されない）
  const postsAgain = await hydratable('posts', () => fetchPosts());
  // posts === postsAgain
</script>
```

<Admonition type="warning" title="キーの衝突に注意">

ライブラリ開発者は、キーにライブラリ名をプレフィックスとして付けることを推奨します。

</Admonition>

```typescript
// ライブラリの場合
const data = await hydratable('my-library:user-data', () => getData());
```

## ランダム値や時間ベースの値

`hydratable` は、データ取得だけでなく、ハイドレーション時に一貫した値を保証したい場合にも使用できます。サーバーとクライアントで異なる値が生成されると「ハイドレーションミスマッチ」が発生しますが、`hydratable` を使うことでこれを防げます。

### ランダム値の安定化

サーバーで生成されたランダム値は、通常クライアントでは異なる値になります。`hydratable` を使うと、サーバーで生成した値をそのままクライアントで再利用できます。

```typescript
import { hydratable } from 'svelte';

// サーバーで生成されたランダム値がクライアントでも同じになる
const randomId = hydratable('random-id', () =>
  Math.random().toString(36).slice(2),
);
```

### 現在時刻の安定化

`Date.now()` もサーバーとクライアントで異なる値を返します。「○分前」のような相対時刻表示や、ページの生成時刻を表示する場合に `hydratable` が役立ちます。

```typescript
import { hydratable } from 'svelte';

// SSR時の時刻がハイドレーション時にも維持される
const timestamp = hydratable('page-timestamp', () => Date.now());
```

これにより、「サーバーでは『5分前』と表示されていたのに、クライアントでは『0分前』になる」といったハイドレーションミスマッチを防げます。

## シリアライゼーション

`hydratable` から返されるデータは、[devalue](https://npmjs.com/package/devalue) を使用してシリアライズされます。
JSON だけでなく、以下の型もサポートされています。

- `Map`
- `Set`
- `Date`
- `URL`
- `BigInt`
- `RegExp`
- `undefined`
- `Infinity` / `-Infinity` / `NaN`
- 循環参照

### Promise のサポート

`hydratable` は Promise を含むオブジェクトもサポートしています。これにより、複数の非同期データを個別に待機できる柔軟な構造を作成できます。

以下の例では、ユーザー情報と投稿データを別々の Promise として保持し、テンプレート内で個別に await しています。

```svelte
<script lang="ts">
  import { hydratable } from 'svelte';

  // Promiseを含むオブジェクトも正しくシリアライズされる
  const data = hydratable('async-data', () => {
    return {
      user: Promise.resolve({ name: 'Alice' }),
      posts: Promise.resolve([{ title: 'First Post' }])
    };
  });
</script>

<h1>{await data.user.then(u => u.name)}</h1>
{#each await data.posts as post}
  <p>{post.title}</p>
{/each}
```

## CSP（Content Security Policy）対応

`hydratable` は、データを `&lt;script&gt;` ブロックとして `<head>` に埋め込みます。
CSP を使用している場合、このスクリプトを許可する設定が必要です。

### nonce を使用する場合

動的にサーバーレンダリングする場合は、`nonce`（Number used Once）を使用します。リクエストごとにユニークな値を生成し、それをスクリプトタグとCSPヘッダーの両方に設定することで、そのスクリプトのみを許可します。

```typescript
// server.ts
import { render } from 'svelte/server';
import App from './App.svelte';

// ユニークなnonce（一度だけ使用する数値）を生成
const nonce = crypto.randomUUID();

const { head, body } = await render(App, {
  csp: { nonce },
});

// レスポンスヘッダーにnonceを設定
response.headers.set('Content-Security-Policy', `script-src 'nonce-${nonce}'`);
```

### hash を使用する場合

静的に生成する場合（SSG）は、`hash` を使用します。Svelte がスクリプトの内容からハッシュ値を計算し、そのハッシュをCSPヘッダーに設定します。スクリプトの内容が変わらない限りハッシュも変わらないため、静的生成に適しています。

```typescript
// build.ts
import { render } from 'svelte/server';
import App from './App.svelte';

const { head, body, hashes } = await render(App, {
  csp: { hash: true },
});

// hashes.scriptは["sha256-abcd123"]のような形式
response.headers.set(
  'Content-Security-Policy',
  `script-src ${hashes.script.map((h) => `'${h}'`).join(' ')}`,
);
```

<Admonition type="tip" title="nonce vs hash">

動的レンダリングには `nonce` を、静的生成には `hash` を使用してください。
`nonce` は毎回異なる値を使用する必要があるため、静的生成には不向きです。
また、将来的に `hash` はストリーミング SSR と互換性がない可能性があります。

</Admonition>

## SvelteKit との関係

SvelteKit の [Remote Functions](/sveltekit/server/remote-functions/) は、内部的に `hydratable` を使用しています。Remote Functions は `hydratable` の上に構築された高レベル API であり、自動的なキー生成やバリデーション、エラーハンドリングなどの機能を提供します。

以下は同じ機能を Remote Functions と hydratable で実装した場合の比較です。

```typescript
// Remote Functions（推奨）
import { query } from '$app/server';

export const getUser = query(async () => {
  return await db.getUser();
});
```

```typescript
// 低レベルAPI（hydratable）
import { hydratable } from 'svelte';

const user = await hydratable('user', () => db.getUser());
```

**ほとんどの場合、Remote Functions を使用することを推奨します。**

### Remote Functions の利点

- 自動的なキー生成
- Standard Schema によるバリデーション
- 型安全なクライアント-サーバー通信
- キャッシュ管理
- エラーハンドリング

## 実践例

`hydratable` を直接使用するケースは限られますが、SvelteKit を使用せずにカスタムの SSR 環境を構築する場合や、ライブラリ開発時に役立ちます。

### データベースからのユーザー取得

以下は、認証済みユーザーの情報を取得する例です。サーバーでのみ `/api/me` が呼び出され、ハイドレーション時にはシリアライズされたデータが使用されます。

```svelte
<script lang="ts">
  import { hydratable } from 'svelte';

  interface User {
    id: string;
    name: string;
    avatar: string;
  }

  // セッションからユーザー情報を取得
  const user = await hydratable<User | null>('current-user', async () => {
    // この関数はサーバーでのみ実行される（ハイドレーション中は実行されない）
    const response = await fetch('/api/me', {
      credentials: 'include'
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  });
</script>

{#if user}
  <header>
    <img src={user.avatar} alt={user.name} />
    <span>ようこそ、{user.name}さん</span>
  </header>
{:else}
  <a href="/login">ログイン</a>
{/if}
```

### 設定データの取得

以下は、サーバーサイドの環境変数からアプリケーション設定を構築する例です。機密情報はサーバーでのみ処理され、必要な設定のみがクライアントに渡されます。

```svelte
<script lang="ts">
  import { hydratable } from 'svelte';

  interface Config {
    apiEndpoint: string;
    featureFlags: Record<string, boolean>;
    theme: 'light' | 'dark';
  }

  // アプリケーション設定を取得
  const config = await hydratable<Config>('app-config', async () => {
    // サーバーサイドで環境変数から設定を構築
    return {
      apiEndpoint: process.env.API_ENDPOINT ?? '/api',
      featureFlags: JSON.parse(process.env.FEATURE_FLAGS ?? '{}'),
      theme: 'light'
    };
  });
</script>

<!-- 設定を使用 -->
<app-root data-api={config.apiEndpoint} data-theme={config.theme}>
  <!-- ... -->
</app-root>
```

## まとめ

`hydratable` は、SSR とハイドレーション間でデータを効率的に共有するための低レベル API です。

- **問題解決**: SSR で取得したデータをハイドレーション時に再取得しない
- **シリアライゼーション**: devalue による豊富な型サポート
- **CSP 対応**: nonce または hash による設定
- **推奨**: 通常は SvelteKit の Remote Functions を使用

## 次のステップ

- [Remote Functions](/sveltekit/server/remote-functions/) - 推奨される高レベル API
- [ハイドレーション詳解](/sveltekit/architecture/hydration/) - ハイドレーションの仕組み
- [レンダリングパイプライン](/sveltekit/architecture/rendering-pipeline/) - SSR の詳細
