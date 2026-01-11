---
title: hydratable - SSRデータの再利用
description: Svelteのhydratable APIでSSR時のデータをハイドレーション時に再利用。サーバーで取得したデータの再取得を防ぎ、パフォーマンスを最適化する方法をTypeScriptで解説
---

`hydratable` は、SSR（サーバーサイドレンダリング）で取得したデータを、ハイドレーション時にクライアントで再利用するための低レベル API です。

## この記事で学べること

- `hydratable` が解決する問題
- 基本的な使い方とシリアライゼーション
- ランダム値や時間ベースの値の安定化
- CSP（Content Security Policy）への対応
- SvelteKit Remote Functions との関係

:::info[低レベル API]
`hydratable` は低レベル API であり、通常のアプリケーション開発で直接使用する機会は少ないです。
多くの場合、SvelteKit の [Remote Functions](/sveltekit/server/remote-functions/) がこの API を内部的に使用しています。
:::

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

```
┌─────────────────────────────────────────────────────────────────┐
│ サーバー（SSR）                                                   │
├─────────────────────────────────────────────────────────────────┤
│ 1. hydratable('user', () => getUser()) が実行される              │
│ 2. getUser() が呼ばれ、データを取得                               │
│ 3. 結果をシリアライズして <head> に埋め込む                        │
│ 4. コンポーネントをHTMLにレンダリング                             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ クライアント（ハイドレーション中）                                 │
├─────────────────────────────────────────────────────────────────┤
│ 1. hydratable('user', () => getUser()) が実行される              │
│ 2. キー 'user' に対応するシリアライズ済みデータを検索              │
│ 3. データが見つかれば、それを返す（getUser()は呼ばない）          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ クライアント（ハイドレーション後）                                 │
├─────────────────────────────────────────────────────────────────┤
│ 1. hydratable('user', () => getUser()) が実行される              │
│ 2. 通常通り getUser() を呼び出す                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 基本的な使い方

### TypeScript での型定義

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

`hydratable` の第一引数はユニークなキーです。同じキーを使用すると、同じデータが返されます。

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

:::warning[キーの衝突に注意]
ライブラリ開発者は、キーにライブラリ名をプレフィックスとして付けることを推奨します。

```typescript
// ライブラリの場合
const data = await hydratable('my-library:user-data', () => getData());
```

:::

## ランダム値や時間ベースの値

`hydratable` は、ハイドレーション時に一貫した値を保証したい場合にも使用できます。

### ランダム値の安定化

```typescript
import { hydratable } from 'svelte';

// サーバーで生成されたランダム値がクライアントでも同じになる
const randomId = hydratable('random-id', () => Math.random().toString(36).slice(2));
```

### 現在時刻の安定化

```typescript
import { hydratable } from 'svelte';

// SSR時の時刻がハイドレーション時にも維持される
const timestamp = hydratable('page-timestamp', () => Date.now());
```

これにより、ハイドレーションミスマッチを防げます。

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

`hydratable` は Promise を含むオブジェクトもサポートしています。

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

`hydratable` は、データを `<script>` ブロックとして `<head>` に埋め込みます。
CSP を使用している場合、このスクリプトを許可する設定が必要です。

### nonce を使用する場合

動的にサーバーレンダリングする場合は、`nonce` を使用します。

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

静的に生成する場合は、`hash` を使用します。

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
	`script-src ${hashes.script.map((h) => `'${h}'`).join(' ')}`
);
```

:::tip[nonce vs hash]
動的レンダリングには `nonce` を、静的生成には `hash` を使用してください。
`nonce` は毎回異なる値を使用する必要があるため、静的生成には不向きです。
また、将来的に `hash` はストリーミング SSR と互換性がない可能性があります。
:::

## SvelteKit との関係

SvelteKit の [Remote Functions](/sveltekit/server/remote-functions/) は、内部的に `hydratable` を使用しています。

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

### データベースからのユーザー取得

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
