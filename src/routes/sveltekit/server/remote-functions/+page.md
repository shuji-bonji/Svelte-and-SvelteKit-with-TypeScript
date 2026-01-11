---
title: Remote Functions - 型安全なクライアント-サーバー通信
description: SvelteKit 2.27+のRemote Functionsで型安全なクライアント-サーバー通信を実現。query、form、command、prerenderの4種類の使い分けとZod/ValibotによるバリデーションをTypeScriptで解説
---

Remote Functions は、クライアントとサーバー間の型安全な通信を実現する SvelteKit 2.27+ の新機能です。
`.remote.ts` ファイルに定義した関数は、クライアントから呼び出すとサーバーで実行され、結果が自動的に返されます。

## この記事で学べること

- Remote Functions の概要と従来の Load 関数との違い
- `query`, `form`, `command`, `prerender` の 4 種類の使い分け
- Standard Schema（Zod/Valibot）によるバリデーション
- Single-flight mutations による最適化
- 従来の Load 関数 / Form Actions との比較

:::warning[実験的機能]
Remote Functions は現在実験的な機能です。`svelte.config.js` で明示的に有効化する必要があります。
:::

## 設定

Remote Functions を使用するには、`svelte.config.js` で機能を有効化します。また、Svelte 5.36+ の `await expressions` を組み合わせることで、コンポーネント内で直接 `await` を使用できます。

```typescript
// svelte.config.js
import type { Config } from '@sveltejs/kit';

const config: Config = {
	kit: {
		experimental: {
			remoteFunctions: true,
		},
	},
	// Svelte 5.36+のawait expressionsを使用する場合
	compilerOptions: {
		experimental: {
			async: true,
		},
	},
};

export default config;
```

## 基本的な仕組み

Remote Functions は `.remote.ts` または `.remote.js` ファイルに定義します。
これらのファイルからエクスポートされた関数は、クライアントでは `fetch` ラッパーに変換され、サーバー上で実行されます。

以下のようなディレクトリ構造で、ルートに関連するリモート関数を配置します。

```
src/
├── routes/
│   └── blog/
│       ├── +page.svelte
│       └── data.remote.ts    # Remote Functions定義ファイル
└── lib/
    └── server/
        └── database.ts       # サーバーのみのモジュール
```

## query - サーバーからのデータ読み取り

`query` は、サーバーから動的データを取得するための関数です。従来の Load 関数とは異なり、コンポーネント内の任意の場所から呼び出すことができ、結果は自動的にキャッシュされます。

### 基本的な使い方

最もシンプルなケースでは、引数なしのクエリを定義します。サーバー側で定義した関数は、クライアントから通常の関数呼び出しと同じように使用でき、TypeScript の型推論もそのまま機能します。

```typescript
// src/routes/blog/data.remote.ts
import { query } from '$app/server';
import * as db from '$lib/server/database';

// 引数なしのクエリ
export const getPosts = query(async () => {
	const posts = await db.sql`
    SELECT title, slug, created_at
    FROM posts
    ORDER BY created_at DESC
  `;
	return posts;
});
```

```svelte
<!-- src/routes/blog/+page.svelte -->
<script lang="ts">
  import { getPosts } from './data.remote';
</script>

<h1>ブログ記事一覧</h1>

<ul>
  {#each await getPosts() as post}
    <li>
      <a href="/blog/{post.slug}">{post.title}</a>
    </li>
  {/each}
</ul>
```

### クエリ引数とバリデーション

引数を受け取るクエリでは、[Standard Schema](https://standardschema.dev/)（Zod や Valibot）でバリデーションを行います。スキーマを第一引数に渡すことで、クライアントからの入力が自動的に検証され、型安全が保証されます。

```typescript
// src/routes/blog/data.remote.ts
import * as v from 'valibot';
import { error } from '@sveltejs/kit';
import { query } from '$app/server';
import * as db from '$lib/server/database';

// 引数ありのクエリ（バリデーション付き）
export const getPost = query(v.string(), async (slug) => {
	const [post] = await db.sql`
    SELECT * FROM posts
    WHERE slug = ${slug}
  `;

	if (!post) {
		error(404, '記事が見つかりません');
	}

	return post;
});
```

```svelte
<!-- src/routes/blog/[slug]/+page.svelte -->
<script lang="ts">
  import { getPost } from '../data.remote';

  let { params } = $props();

  // paramsの変更に応じて自動的に再取得
  const post = $derived(await getPost(params.slug));
</script>

<article>
  <h1>{post.title}</h1>
  <div>{@html post.content}</div>
</article>
```

### query.batch - N+1 問題の解決

`query.batch` は、同じマクロタスク内の複数のリクエストをまとめて実行します。例えば、リスト内の各アイテムが個別にデータを取得する場合、それらを 1 回のデータベースクエリにまとめることで、N+1 問題を解決できます。

```typescript
// src/routes/weather.remote.ts
import * as v from 'valibot';
import { query } from '$app/server';
import * as db from '$lib/server/database';

// バッチクエリ: 複数の都市の天気を一度に取得
export const getWeather = query.batch(v.string(), async (cities) => {
	// citiesは呼び出し元の引数の配列
	const weather = await db.sql`
    SELECT * FROM weather
    WHERE city = ANY(${cities})
  `;

	const lookup = new Map(weather.map((w) => [w.city, w]));

	// 各呼び出しに対して結果を返す関数
	return (city: string) => lookup.get(city);
});
```

```svelte
<!-- 複数のコンポーネントから同時に呼び出しても1回のDBアクセス -->
<script lang="ts">
  import { getWeather } from './weather.remote';

  let { cities } = $props();
</script>

{#each cities as city}
  <!-- これらの呼び出しは自動的にバッチ化される -->
  <CityWeather weather={await getWeather(city.id)} />
{/each}
```

### クエリの更新

クエリは `refresh()` メソッドで再取得できます。これにより、ユーザーアクションに応じてデータを更新したり、定期的なポーリングを実装したりできます。

```svelte
<script lang="ts">
  import { getPosts } from './data.remote';
</script>

<button onclick={() => getPosts().refresh()}>
  新着記事を確認
</button>
```

:::tip[クエリのキャッシュ]
クエリはページ上に存在する間キャッシュされます。`getPosts() === getPosts()` は常に `true` です。
:::

## form - フォーム処理の新パターン

`form` は、フォームの送信とバリデーションを簡潔に処理するための関数です。従来の Form Actions と比較して、型安全なバリデーション、フィールドごとのエラー表示、楽観的 UI 更新がより簡単に実装できます。

### 基本的な使い方

`form` 関数は、Valibot や Zod のスキーマでフォームデータを検証し、型安全なハンドラーを提供します。テンプレート側では、スプレッド構文で簡潔にフォーム属性とフィールド属性を設定できます。

```typescript
// src/routes/blog/data.remote.ts
import * as v from 'valibot';
import { error, redirect } from '@sveltejs/kit';
import { form } from '$app/server';
import * as db from '$lib/server/database';
import * as auth from '$lib/server/auth';

export const createPost = form(
	v.object({
		title: v.pipe(v.string(), v.nonEmpty('タイトルは必須です')),
		content: v.pipe(v.string(), v.nonEmpty('本文は必須です')),
	}),
	async ({ title, content }) => {
		// 認証チェック
		const user = await auth.getUser();
		if (!user) {
			error(401, '認証が必要です');
		}

		const slug = title.toLowerCase().replace(/ /g, '-');

		await db.sql`
      INSERT INTO posts (slug, title, content, author_id)
      VALUES (${slug}, ${title}, ${content}, ${user.id})
    `;

		// 作成した記事ページにリダイレクト
		redirect(303, `/blog/${slug}`);
	}
);
```

```svelte
<!-- src/routes/blog/new/+page.svelte -->
<script lang="ts">
  import { createPost } from '../data.remote';
</script>

<h1>新規記事作成</h1>

<form {...createPost}>
  <label>
    <h2>タイトル</h2>
    {#each createPost.fields.title.issues() as issue}
      <p class="error">{issue.message}</p>
    {/each}
    <input {...createPost.fields.title.as('text')} />
  </label>

  <label>
    <h2>本文</h2>
    {#each createPost.fields.content.issues() as issue}
      <p class="error">{issue.message}</p>
    {/each}
    <textarea {...createPost.fields.content.as('text')}></textarea>
  </label>

  <button>投稿する</button>
</form>
```

### フィールドの型

フィールドはスキーマに基づいて型安全に定義されます。ネストしたオブジェクトや配列も、スキーマ定義に従って自動的にフィールドが生成されます。

```typescript
// ネストしたオブジェクトと配列の例
const profileSchema = v.object({
	name: v.string(),
	photo: v.file(),
	info: v.object({
		height: v.number(),
		likesDogs: v.optional(v.boolean(), false),
	}),
	attributes: v.array(v.string()),
});

export const createProfile = form(profileSchema, async (data) => {
	// dataは型安全
	console.log(data.info.height); // number
});
```

```svelte
<form {...createProfile} enctype="multipart/form-data">
  <input {...createProfile.fields.name.as('text')} />
  <input {...createProfile.fields.photo.as('file')} />
  <input {...createProfile.fields.info.height.as('number')} />
  <input {...createProfile.fields.info.likesDogs.as('checkbox')} />

  <h3>特徴</h3>
  <input {...createProfile.fields.attributes[0].as('text')} />
  <input {...createProfile.fields.attributes[1].as('text')} />

  <button>送信</button>
</form>
```

### プログラマティックバリデーション

サーバー側で追加のバリデーションを行う場合は、`invalid` 関数を使用します。例えば、データベースの重複チェックなど、スキーマだけでは表現できない検証ロジックを実装できます。

```typescript
import * as v from 'valibot';
import { invalid } from '@sveltejs/kit';
import { form } from '$app/server';
import * as db from '$lib/server/database';

export const register = form(
	v.object({
		email: v.pipe(v.string(), v.email('有効なメールアドレスを入力してください')),
		username: v.pipe(v.string(), v.minLength(3, '3文字以上必要です')),
	}),
	async (data, issue) => {
		// データベースで重複チェック
		const existing = await db.findUserByEmail(data.email);
		if (existing) {
			// フィールド固有のエラーを追加
			invalid(issue.email('このメールアドレスは既に使用されています'));
		}
	}
);
```

### enhance によるカスタマイズ

`enhance` メソッドでフォーム送信の動作をカスタマイズできます。送信前後の処理、エラーハンドリング、トースト表示などを追加できます。

```svelte
<script lang="ts">
  import { createPost } from '../data.remote';
  import { showToast } from '$lib/toast';
</script>

<form {...createPost.enhance(async ({ form, data, submit }) => {
  try {
    await submit();
    form.reset();
    showToast('投稿しました！');
  } catch (error) {
    showToast('エラーが発生しました');
  }
})}>
  <!-- フォーム内容 -->
</form>
```

### Single-flight mutations

フォーム送信後に関連するクエリを自動更新できます。これにより、データの更新とそれに依存する表示の更新を 1 回のリクエストで完結させることができます。

```typescript
// サーバー側で更新
export const createPost = form(schema, async (data) => {
	// 記事を作成
	await db.createPost(data);

	// getPosts()を自動的に再取得
	await getPosts().refresh();

	redirect(303, '/blog');
});
```

```svelte
<!-- クライアント側で更新を指定 -->
<form {...createPost.enhance(async ({ submit }) => {
  await submit().updates(getPosts());
})}>
```

## command - サーバーへのデータ書き込み

`command` は、フォーム以外の方法でサーバーにデータを書き込むための関数です。ボタンクリックやドラッグ＆ドロップなど、イベントドリブンな操作に適しています。

以下の例では、「いいね」ボタンのクリックでカウントを更新し、関連するクエリも自動的に再取得します。

```typescript
// src/routes/likes.remote.ts
import * as v from 'valibot';
import { query, command } from '$app/server';
import * as db from '$lib/server/database';

export const getLikes = query(v.string(), async (postId) => {
	const [row] = await db.sql`
    SELECT likes FROM posts WHERE id = ${postId}
  `;
	return row.likes;
});

export const addLike = command(v.string(), async (postId) => {
	await db.sql`
    UPDATE posts SET likes = likes + 1 WHERE id = ${postId}
  `;

	// 関連するクエリを更新
	getLikes(postId).refresh();
});
```

```svelte
<script lang="ts">
  import { getLikes, addLike } from './likes.remote';
  import { showToast } from '$lib/toast';

  let { postId } = $props();
</script>

<button
  onclick={async () => {
    try {
      await addLike(postId);
    } catch (error) {
      showToast('エラーが発生しました');
    }
  }}
>
  いいね！
</button>

<p>いいね数: {await getLikes(postId)}</p>
```

### 楽観的 UI 更新

`withOverride` を使用して、サーバー応答を待たずに UI を更新できます。ユーザーに即座にフィードバックを提供し、実際のサーバー応答が返ってきたら正しい値に更新されます。

```svelte
<script lang="ts">
  import { getLikes, addLike } from './likes.remote';

  let { postId } = $props();
</script>

<button
  onclick={async () => {
    // 楽観的に+1してから実際の更新を待つ
    await addLike(postId).updates(
      getLikes(postId).withOverride((n) => n + 1)
    );
  }}
>
  いいね！
</button>
```

:::warning[command の制限]
`command` 内では `redirect()` は使用できません。リダイレクトが必要な場合は、戻り値で `{ redirect: '/path' }` を返し、クライアント側で処理してください。
:::

## prerender - ビルド時データ取得

`prerender` は、ビルド時にデータを取得して静的化するための関数です。CDN から配信される静的データとして扱われるため、ランタイムのサーバー負荷を軽減できます。

```typescript
// src/routes/blog/data.remote.ts
import { prerender } from '$app/server';
import * as db from '$lib/server/database';

// ビルド時にデータを取得し、CDNから配信
export const getPosts = prerender(async () => {
	const posts = await db.sql`
    SELECT title, slug FROM posts ORDER BY created_at DESC
  `;
	return posts;
});
```

### 引数付きプリレンダリング

引数を受け取る `prerender` では、`inputs` オプションでプリレンダリングする値を指定します。`dynamic: true` を設定すると、プリレンダリングされていない値に対しても動的にデータを取得できます。

```typescript
import * as v from 'valibot';
import { prerender } from '$app/server';

export const getPost = prerender(
	v.string(),
	async (slug) => {
		const post = await db.getPost(slug);
		return post;
	},
	{
		// プリレンダリングする入力値を指定
		inputs: () => ['first-post', 'second-post', 'third-post'],
		// trueにすると、プリレンダリングされていない値でも動的に取得可能
		dynamic: true,
	}
);
```

:::tip[部分プリレンダリング]
`prerender` は動的なページでも使用できます。これにより、一部のデータだけを静的化し、他は動的に取得するパターンが実現できます。
:::

## 従来の Load 関数 / Form Actions との比較

Remote Functions は、従来の Load 関数や Form Actions を置き換えるものではなく、補完するものです。以下の表で、それぞれの特徴を比較します。

| 機能                       | Load 関数  | Form Actions | Remote Functions    |
| -------------------------- | ---------- | ------------ | ------------------- |
| データ取得                 | ✅         | ❌           | ✅ (`query`)        |
| フォーム処理               | ❌         | ✅           | ✅ (`form`)         |
| 任意のタイミングで実行     | ❌         | ❌           | ✅                  |
| 型安全なバリデーション     | 手動       | 手動         | ✅ Standard Schema  |
| コンポーネント内で直接使用 | ❌         | ❌           | ✅                  |
| N+1 問題の解決             | 手動       | -            | ✅ (`query.batch`)  |
| 楽観的 UI 更新             | 手動       | 手動         | ✅ (`withOverride`) |
| プリレンダリング           | ページ単位 | -            | ✅ 関数単位         |

### いつ何を使うべきか

プロジェクトの要件に応じて、適切なアプローチを選択しましょう。

**Load 関数を使う場合**:

- ページ全体に必要なデータ
- SEO が重要なページ
- 既存のコードベースとの互換性

**Form Actions を使う場合**:

- シンプルなフォーム処理
- Progressive Enhancement が重要な場合

**Remote Functions を使う場合**:

- コンポーネント内で柔軟にデータを取得したい
- 型安全なバリデーションが必要
- 楽観的 UI 更新を実装したい
- バッチ処理で効率化したい

## getRequestEvent の使用

Remote Functions 内では `getRequestEvent()` を使用して、現在のリクエスト情報にアクセスできます。認証チェックや Cookie の読み取りなど、リクエストコンテキストに依存する処理に使用します。

```typescript
import { getRequestEvent, query } from '$app/server';
import { findUser } from '$lib/server/database';

export const getProfile = query(async () => {
	const { cookies } = getRequestEvent();
	const user = await findUser(cookies.get('session_id'));

	return {
		name: user.name,
		avatar: user.avatar,
	};
});
```

:::warning[getRequestEvent の注意点]

- ヘッダーの設定はできません（Cookie の設定は `form` と `command` 内でのみ可能）
- `route`, `params`, `url` は Remote Function のエンドポイントではなく、呼び出し元のページの情報です
  :::

## まとめ

Remote Functions は、SvelteKit でのデータ取得とフォーム処理を大幅に簡素化します。

- **`query`**: サーバーからの型安全なデータ取得
- **`query.batch`**: N+1 問題を解決するバッチクエリ
- **`form`**: 宣言的なフォーム処理とバリデーション
- **`command`**: イベントドリブンなサーバー操作
- **`prerender`**: ビルド時のデータ静的化

Standard Schema によるバリデーションと、楽観的 UI 更新のサポートにより、モダンな Web アプリケーション開発がより効率的になります。

## 次のステップ

- [フォーム処理と Actions](/sveltekit/server/forms/) - 従来の Form Actions との比較
- [データフェッチング戦略](/sveltekit/data-loading/strategies/) - Load 関数との使い分け
- [状態管理パターン](/sveltekit/application/state-management/) - グローバル状態との連携
