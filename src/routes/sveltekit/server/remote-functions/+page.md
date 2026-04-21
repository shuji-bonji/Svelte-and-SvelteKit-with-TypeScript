---
title: Remote Functions - 型安全通信
description: SvelteKit 2.27+のRemote Functionsで型安全なクライアント-サーバー通信を実現。query、form、command、prerenderの4種類の使い分けとZod/ValibotによるバリデーションをTypeScriptで解説
---

<script>
	import Admonition from '$lib/components/Admonition.svelte';
</script>

Remote Functions は、クライアントとサーバー間の型安全な通信を実現する SvelteKit 2.27+ の新機能です。
`.remote.ts` ファイルに定義した関数は、クライアントから呼び出すとサーバーで実行され、結果が自動的に返されます。

## この記事で学べること

- Remote Functions の概要と従来の Load 関数との違い
- `query`, `form`, `command`, `prerender` の 4 種類の使い分け
- Standard Schema（Zod/Valibot）によるバリデーション
- Single-flight mutations による最適化
- 従来の Load 関数 / Form Actions との比較

<Admonition type="warning" title="実験的機能">

Remote Functions は現在実験的な機能です。`svelte.config.js` で明示的に有効化する必要があります。

</Admonition>

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
      <a href="/blog/&#123;post.slug&#125;">&#123;post.title&#125;</a>
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

### クエリプロパティ（await の代替）

`await` を使わずに、クエリの状態に応じた表示分岐を行うこともできます。クエリオブジェクトには `loading`、`error`、`current` プロパティがあります。

```svelte
<script lang="ts">
  import { getPosts } from './data.remote';

  const query = getPosts();
</script>

{#if query.error}
  <p>エラーが発生しました</p>
{:else if query.loading}
  <p>読み込み中...</p>
{:else}
  <ul>
    {#each query.current as post}
      <li><a href="/blog/&#123;post.slug&#125;">&#123;post.title&#125;</a></li>
    {/each}
  </ul>
{/if}
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

<Admonition type="tip" title="クエリのキャッシュ">

クエリはページ上に存在する間キャッシュされます。`getPosts() === getPosts()` は常に `true` です。

</Admonition>

### キャッシュとリアクティブコンテキスト

クエリはメモリリークを防ぐため、リアクティブコンテキスト（`$derived`、`$effect`、コンポーネントテンプレート）内で使用されている間のみキャッシュされます。イベントハンドラ内でキャッシュを経由せずデータを取得したい場合は、`.run()` メソッドを使用します。

```svelte
<script lang="ts">
  import { getData } from './data.remote';

  // リアクティブコンテキストに「アンカー」されている - OK
  const data = getData();
</script>

<!-- アンカーされたクエリを非リアクティブコンテキストでawaitするのはOK -->
<button onclick={async () => console.log(await data)}>
  データ取得
</button>

<!-- キャッシュをバイパスして直接実行する場合は .run() を使用 -->
<button onclick={async () => console.log(await getData().run())}>
  直接実行
</button>
```

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
  },
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
    email: v.pipe(
      v.string(),
      v.email('有効なメールアドレスを入力してください'),
    ),
    username: v.pipe(v.string(), v.minLength(3, '3文字以上必要です')),
  }),
  async (data, issue) => {
    // データベースで重複チェック
    const existing = await db.findUserByEmail(data.email);
    if (existing) {
      // フィールド固有のエラーを追加
      invalid(issue.email('このメールアドレスは既に使用されています'));
    }
  },
);
```

### クライアントサイドバリデーション（preflight）

`preflight` メソッドでクライアントサイドのバリデーションスキーマを指定できます。サーバーにデータを送信する前に、ブラウザ側でバリデーションを実行します。

```svelte
<script lang="ts">
  import * as v from 'valibot';
  import { createPost } from '../data.remote';

  // クライアントサイドのバリデーションスキーマ
  const schema = v.object({
    title: v.pipe(v.string(), v.nonEmpty('タイトルは必須です')),
    content: v.pipe(v.string(), v.nonEmpty('本文は必須です'))
  });
</script>

<!-- preflight でクライアントバリデーションを有効化 -->
<form {...createPost.preflight(schema)}>
  <label>
    <h2>タイトル</h2>
    {#each createPost.fields.title.issues() as issue}
      <p class="error">{issue.message}</p>
    {/each}
    <input {...createPost.fields.title.as('text')} />
  </label>

  <button>投稿する</button>
</form>
```

<Admonition type="tip" title="入力時バリデーション">

`validate()` を `oninput` や `onchange` と組み合わせると、リアルタイムバリデーションも実現できます。

</Admonition>

```svelte
<form {...createPost} oninput={() => createPost.validate()}>
  <!-- フォーム内容 -->
</form>
```

### フォームの複数インスタンス（for）

リスト内でフォームを繰り返し使う場合、`for(id)` で各アイテムに独立したフォームインスタンスを作成できます。

```svelte
<script lang="ts">
  import { getTodos, modifyTodo } from '../data.remote';
</script>

<h1>TODOリスト</h1>

{#each await getTodos() as todo}
  <!-- 各TODOに独立したフォームインスタンスを作成 -->
  {@const modify = modifyTodo.for(todo.id)}
  <form {...modify}>
    <input {...modify.fields.description.as('text', todo.description)} />
    <button disabled={!!modify.pending}>保存</button>
  </form>
{/each}
```

### 機密データの保護

パスワードなどの機密データは、フィールド名の先頭にアンダースコア（`_`）を付けることで、バリデーション失敗時にクライアントへの送り返しを防止できます。

```svelte
<form {...register}>
  <label>
    ユーザー名
    <!-- 通常のフィールド: バリデーション失敗時に値が再表示される -->
    <input {...register.fields.username.as('text')} />
  </label>

  <label>
    パスワード
    <!-- _password: バリデーション失敗時でも値は送り返されない -->
    <input {...register.fields._password.as('password')} />
  </label>

  <button>登録</button>
</form>
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

`form` と `command` によるミューテーション後に、関連するクエリを1回のリクエストで自動更新できます。通常、データ更新後に画面上のクエリを再取得するには2回のラウンドトリップが必要ですが、Single-flight mutationsではこれを1回に削減します。

#### サーバー主導の更新

サーバーハンドラ内で、どのクエリを更新するかを指定します。`refresh()` でサーバー側で再取得、`set()` で値を直接セットできます。

```typescript
export const createPost = form(schema, async (data) => {
  await db.createPost(data);

  // サーバー側で getPosts() を再取得し、結果をクライアントに返す
  void getPosts().refresh();

  redirect(303, '/blog');
});

export const updatePost = form(v.object({ id: v.string() }), async (post) => {
  const result = await externalApi.update(post);

  // APIの戻り値で直接更新（再取得不要）
  getPost(post.id).set(result);
});
```

#### クライアント主導の更新（requested）

サーバーがどのクエリインスタンスを更新すべきか分からない場合（例: フィルタ付きクエリ）、クライアントから更新を要求し、サーバーで `requested()` を使って受け取ります。

```svelte
<!-- クライアント側: submit().updates() で更新対象を指定 -->
<form {...createPost.enhance(async ({ submit }) => {
  await submit().updates(
    // getPostsの全アクティブインスタンスを更新要求
    getPosts,
    // 特定インスタンスの更新要求
    getPosts({ filter: 'author:santa' }),
    // 楽観的更新付き
    getPosts({ filter: 'recent' }).withOverride((posts) => [newPost, ...posts])
  );
})}>
```

```typescript
// サーバー側: requested() でクライアントからの要求を受け取る
import { query, form, requested } from '$app/server';

export const getPosts = query(
  v.object({ filter: v.string() }),
  async ({ filter }) => {
    /* ... */
  },
);

export const createPost = form(schema, async (data) => {
  await db.createPost(data);

  // クライアントが要求した getPosts インスタンスを最大5件まで再取得
  for (const arg of requested(getPosts, 5)) {
    void getPosts(arg).refresh();
  }

  // 短縮形: 全要求インスタンスを一括refresh
  // await requested(getPosts, 5).refreshAll();

  redirect(303, '/blog');
});
```

<Admonition type="info" title="requested() の仕組み">

`requested()` はクライアントが要求したクエリの引数（パース済み）を返します。第2引数の `limit` は返す最大件数で、これを超える要求はエラーになります。パースに失敗した個別の引数はそのクエリだけがエラーになり、全体は失敗しません。

</Admonition>

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

<Admonition type="warning" title="command の制限">

`command` 内では `redirect()` は使用できません。リダイレクトが必要な場合は、戻り値で `&#123; redirect: '/path' &#125;` を返し、クライアント側で処理してください。

</Admonition>

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
  },
);
```

<Admonition type="tip" title="部分プリレンダリング">

`prerender` は動的なページでも使用できます。これにより、一部のデータだけを静的化し、他は動的に取得するパターンが実現できます。

</Admonition>

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

<Admonition type="warning" title="getRequestEvent の注意点">

<ul>
<li>ヘッダーの設定はできません（Cookie の設定は <code>form</code> と <code>command</code> 内でのみ可能）</li>
<li><code>route</code>, <code>params</code>, <code>url</code> は Remote Function のエンドポイントではなく、呼び出し元のページの情報です</li>
</ul>

</Admonition>

## バリデーションエラーのハンドリング

Remote Functions の引数バリデーションが失敗した場合（デプロイ間のバージョン不一致や不正なリクエスト）、デフォルトでは `400 Bad Request` が返されます。`handleValidationError` サーバーフックでレスポンスをカスタマイズできます。

```typescript
// src/hooks.server.ts
import type { HandleValidationError } from '@sveltejs/kit';

export const handleValidationError: HandleValidationError = ({
  event,
  issues,
}) => {
  return {
    message: '不正なリクエストです',
  };
};
```

### バリデーションの省略

内容を理解した上でバリデーションを省略したい場合は、スキーマの代わりに `'unchecked'` を渡すことができます。ただし、エンドポイントが外部から不正なデータで呼び出されるリスクがあるため、注意が必要です。

```typescript
import { query } from '$app/server';

export const getStuff = query('unchecked', async ({ id }: { id: string }) => {
  // TypeScript上の型と実行時の値が一致しない可能性がある
});
```

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
