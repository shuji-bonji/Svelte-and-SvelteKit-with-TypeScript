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

## 設定（experimental フラグ）

Remote Functions は 2 つの experimental フラグを **両方** 有効化することで本来の使い勝手になります。

1. `kit.experimental.remoteFunctions` — Remote Functions そのものを有効化
2. `compilerOptions.experimental.async` — Svelte 5.36+ の `await expressions` を有効化し、`<script>` のトップレベルやマークアップ内で `await getXxx()` を直接書けるようにする（コンポーネントの `<svelte:boundary>` と組み合わせて使う）

```typescript
// svelte.config.js
import type { Config } from '@sveltejs/kit';

const config: Config = {
  kit: {
    experimental: {
      // .remote.ts / .remote.js の認識と $app/server からの export を解放
      remoteFunctions: true,
    },
  },
  compilerOptions: {
    experimental: {
      // await expressions: コンポーネント内で直接 `await` が書ける
      // ※ 非同期境界は <svelte:boundary> で囲うのが定石
      async: true,
    },
  },
};

export default config;
```

:::caution[experimental である点に注意]
両フラグともマイナーリリース単位で挙動が変わりうる experimental 機能です。プロダクション投入時は SvelteKit / Svelte のバージョンを固定し、リリースノートを必ず確認してください。`compilerOptions.experimental.async` を有効にしない場合、コンポーネント側では後述の「クエリプロパティ（`loading` / `error` / `current`）」経由でアクセスします。
:::

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
  {#each await getPosts() as post (post.id)}
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

{#each cities as city (city)}
  <!-- これらの呼び出しは自動的にバッチ化される -->
  <CityWeather weather={await getWeather(city.id)} />
{/each}
```

### query.live - リアルタイムストリーミング（AsyncIterable）

`query.live` は **サーバーから値をストリーミング** するためのバリエーションです。コールバックには **async generator function**（`async function*`）を渡し、`yield` した値が逐次クライアントに届きます。ポーリング・サーバー時計・通知バッジ・Pub/Sub の購読など、`query` の単発取得では表現しにくいリアルタイムユースケースを宣言的に書けます。

```typescript
// src/routes/time.remote.ts
import { query } from '$app/server';

// 1 秒ごとに現在時刻を yield するライブクエリ
export const getTime = query.live(async function* () {
  while (true) {
    yield new Date();
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
});
```

```svelte
<script lang="ts">
  import { getTime } from './time.remote';

  const time = getTime();
</script>

<p>現在時刻: {await time}</p>
<p>接続状態: {time.connected ? '接続中' : '切断'}</p>
<button onclick={() => time.reconnect()}>再接続</button>
```

#### `query` との挙動の違い

- **SSR**: `await getTime()` は **最初に yield された値だけ** を返してイテレーターを閉じます。この初期値はそのままハイドレーション時に再利用されます。
- **クライアント**: コンポーネントがアクティブな間だけストリーミング接続が維持されます。**同じ引数の `query.live` を複数箇所で参照しても接続は 1 本に共有** され、参照がなくなると自動切断されます。
- **`refresh()` は存在しません**（自己更新するため）。代わりに `connected` プロパティと `reconnect()` メソッドが生えます。
- 接続が切れると `connected` が `false` になり、SvelteKit が指数バックオフで自動再接続を試みます。`navigator.onLine` が `false → true` に変わったタイミングでも能動的に再接続します。
- 命令的に取得したい場合（後述の `.run()`）、戻り値は `Promise<AsyncGenerator<T>>` です。

:::caution[Service Worker のキャッシュに注意]
ライブクエリのレスポンスを Service Worker でキャッシュしてしまうと、ページを閉じた後もクローンされたレスポンスが延々とストリーミングを続けてしまいます。`Cache-Control: no-store` を含むレスポンスは Service Worker のキャッシュ対象から除外してください。
:::

#### Single-flight でライブクエリを再接続する

`form` / `command` ハンドラ内では、ライブクエリに対して `.reconnect()` を呼ぶことで Single-flight mutation の一部として再接続をスケジュールできます。Cookie を書き換えた直後にライブクエリを張り直したいときなどに有効です。

```typescript
// src/routes/notifications.remote.ts
import * as v from 'valibot';
import { form, query } from '$app/server';
import * as db from '$lib/server/database';

export const getNotifications = query.live(
  v.string(),
  async function* (userId) {
    while (true) {
      yield await db.notifications(userId);
      await new Promise((r) => setTimeout(r, 1000));
    }
  },
);

export const markAllRead = form(
  v.object({ userId: v.string() }),
  async ({ userId }) => {
    await db.markAllRead(userId);
    // ミューテーションのレスポンスと同じフライトで再接続を要求
    getNotifications(userId).reconnect();
  },
);
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
    {#each query.current as post (post.id)}
      <li><a href="/blog/{post.slug}">{post.title}</a></li>
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

`.run()` の戻り値は対象に応じて変わります。

| 対象          | `.run()` の戻り値                  | 用途                                   |
| ------------- | ---------------------------------- | -------------------------------------- |
| `query`       | `Promise<Output>`                  | キャッシュをバイパスして 1 回取得      |
| `query.batch` | `Promise<Output>`                  | バッチに参加せず即時実行               |
| `query.live`  | `Promise<AsyncGenerator<Output>>`  | 命令的にストリームをイテレート         |

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
    {#each createPost.fields.title.issues() as issue (issue.id)}
      <p class="error">{issue.message}</p>
    {/each}
    <input {...createPost.fields.title.as('text')} />
  </label>

  <label>
    <h2>本文</h2>
    {#each createPost.fields.content.issues() as issue (issue.id)}
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

### フィールド API リファレンス（`form.fields.*`）

`form` がスキーマから自動生成する `fields` ツリーは、各フィールドに対して以下の API を提供します。HTML 入力要素・バリデーション表示・初期値設定をひとまとめに扱える設計です。

| API                                  | 用途                                                                                                 |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| `field.as(type)`                     | `type` に対応した HTML 属性（`name` / `type` / `aria-invalid` 等）をスプレッド可能な形で返す         |
| `field.as(type, value)`              | レンダリング値を指定。`radio` / `submit` / `hidden` は **必須**、`checkbox` の配列要素にも必要         |
| `field.issues()`                     | このフィールドの現在の Issue 配列（バリデーションエラー）                                            |
| `field.value()`                      | このフィールドの現在値（ユーザー入力で自動更新される）                                               |
| `field.set(value)`                   | このフィールドの値をプログラム的に更新                                                               |
| `form.fields.value()`                | 全フィールドの値を 1 つのオブジェクトとして取得                                                      |
| `form.fields.set({...})`             | 複数フィールドをまとめて更新                                                                         |
| `form.fields.allIssues()`            | フォーム全体の Issue（フィールド非依存のものを含む）                                                 |
| `form.validate()`                    | プログラム的にバリデーションを実行（`oninput` / `onchange` と組み合わせる）                          |
| `form.validate({ includeUntouched })`| 未操作フィールドを含めて全件検証                                                                     |
| `form.preflight(schema)`             | クライアント側で先行バリデーション。失敗時はサーバーに送信されない                                   |
| `form.for(id)`                       | 同じフォームを **独立インスタンス** として複数生成（リスト編集に必須）                                |
| `form.enhance(callback)`             | 送信処理をカスタマイズ。`callback({ form, data, submit })`                                            |
| `form.result`                        | ハンドラの戻り値が代入される（ephemeral：再送信・離脱・リロードで消える）                            |
| `form.pending`                       | 送信中のリクエスト数（`for(id)` ごとに独立）                                                         |

#### `.as(type)` でサポートされる input type

`text` / `number` / `password` / `email` / `url` / `tel` / `search` / `date` / `datetime-local` / `time` / `color` / `range` / `file` / `checkbox` / `radio` / `submit` / `hidden` のほか、`select` と `select multiple` も指定可能です。

```svelte
<!-- 単一値の radio / checkbox は as(type, value) の第 2 引数が必須 -->
{#each operatingSystems as os (os)}
  <label>
    <input {...survey.fields.operatingSystem.as('radio', os)} />
    {os}
  </label>
{/each}

<!-- select も同じ field API で扱える -->
<select {...survey.fields.languages.as('select multiple')}>
  {#each languages as lang (lang)}
    <option>{lang}</option>
  {/each}
</select>
```

:::info[`name` 属性の自動命名規則]

- `name` は `info.height` や `attributes[0]` のような JS オブジェクト記法で生成されます。`object['nested-key']` のような引用符必須のキーには未対応です。
- 内部的に `boolean` は `b:`、`number` は `n:` のプレフィックスが付き、バリデーション前にコース（型変換）されます。
- `checkbox` が未チェックの場合 `FormData` には何も含まれないため、スキーマ側で `v.optional(v.boolean(), false)`（Valibot）や `z.coerce.boolean<boolean>()`（Zod）として `undefined` を許容する必要があります。

:::

#### 既存データを編集するフォーム（`as(type, value)` の第 2 引数）

編集画面では各 `<input>` に初期値を流し込む必要があります。

```svelte
<form {...updateProfile}>
  <!-- 第 2 引数で初期値を指定 -->
  <input {...updateProfile.fields.name.as('text', user.name)} />
  <input {...updateProfile.fields.age.as('number', user.age)} />
  <input {...updateProfile.fields.subscribe.as('checkbox', user.subscribe)} />
  <button>更新</button>
</form>
```

#### 複数の Submit ボタン（`as('submit', value)`）

スキーマに `action` フィールドを足し、ボタンに `as('submit', 値)` を割り当てることで「ログイン」「新規登録」など 1 つのフォーム内で分岐できます。

```svelte
<form {...loginOrRegister}>
  <input {...loginOrRegister.fields.username.as('text')} />
  <input {...loginOrRegister.fields._password.as('password')} />
  <button {...loginOrRegister.fields.action.as('submit', 'login')}>ログイン</button>
  <button {...loginOrRegister.fields.action.as('submit', 'register')}>登録</button>
</form>
```

サーバー側はスキーマで `v.picklist(['login', 'register'])` のように受け、ハンドラ内で分岐します。

#### `form.result` でハンドラの戻り値を表示

`redirect()` しない場合、ハンドラの戻り値は `form.result` に代入されます。**ephemeral**（再送信・遷移・リロードで消える）な値であることに注意してください。

```svelte
<form {...createPost}>
  <!-- ... -->
</form>

{#if createPost.result?.success}
  <p>投稿しました！</p>
{/if}
```

### プログラマティックバリデーション（`invalid` + `issue`）

宣言的なスキーマで表現しきれない検証（DB 重複チェック、在庫切れ、外部 API 連携など）は、ハンドラの第 2 引数 `issue` と `invalid()` を組み合わせて実装します。

- **`@sveltejs/kit` の `invalid()`** — `error()` / `redirect()` と同じく **戻り値で投げる必要のない special return** です。SvelteKit 2 では `throw` を付けません。
- **複数引数を渡せる** — 文字列を渡せばフォーム全体に紐付く Issue（`fields.allIssues()` でのみ取得可能）、`issue.fieldName(...)` を渡せば特定フィールドの Issue になります。
- **`issue.fieldName(message)`** はスキーマから型推論される **タイプセーフな Issue ファクトリ** です。

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
    // データベースで重複チェック（スキーマで書けないバリデーション）
    const existing = await db.findUserByEmail(data.email);
    if (existing) {
      // フィールド固有 Issue + フォーム全体に紐付く文字列メッセージを同時に投げる
      invalid(
        issue.email('このメールアドレスは既に使用されています'),
        '登録に失敗しました。入力内容を確認してください。',
      );
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
    {#each createPost.fields.title.issues() as issue (issue.id)}
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

{#each await getTodos() as todo (todo.id)}
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

`enhance` メソッドでフォーム送信の動作をカスタマイズできます。`callback({ form, data, submit })` の形で **フォーム要素・送信データ・送信関数** を受け取ります。

#### `submit()` の戻り値で「バリデーション失敗 vs ネットワークエラー」を区別する

これは Remote Functions の特徴的な API です。`await submit()` は **boolean** を返します。

- **`true`** — サーバーまで届き、ハンドラが正常完了した（`form.result` も更新される）
- **`false`** — クライアント側 `preflight` またはサーバー側スキーマでバリデーションに失敗した（`invalid()` を含む）
- **例外を throw** — ネットワーク障害、500 系、`error()` などの実行時エラー

つまり「ユーザー入力ミス」と「通信/サーバー障害」を **try/catch と boolean の両方** でハンドリングするのが定石です。

```svelte
<script lang="ts">
  import { createPost } from '../data.remote';
  import { showToast } from '$lib/toast';
</script>

<form
  {...createPost.enhance(async ({ form, data, submit }) => {
    try {
      // submit() は boolean: true = 成功, false = バリデーション失敗
      if (await submit()) {
        form.reset();
        showToast('投稿しました！');
      } else {
        // preflight / サーバースキーマで弾かれた
        showToast('入力内容を確認してください');
      }
    } catch (error) {
      // ネットワーク・5xx・error() などの実行時エラー
      console.error(error);
      showToast('通信エラーが発生しました');
    }
  })}
>
  <!-- フォーム内容 -->
</form>
```

:::caution[`enhance` 利用時はフォームが自動 reset されない]
通常の Remote Functions フォームは送信成功時に自動でリセットされますが、`enhance` を使うと **明示的に `form.reset()` を呼ぶ必要があります**。意図的なリセットタイミング制御が可能になる代わりに、忘れると古い値が残り続ける挙動になります。
:::

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

#### クライアント主導の更新（`submit().updates(...)` + `requested()`）

サーバーがどのクエリインスタンスを更新すべきか分からない場合（例: フィルタ付きクエリ）、クライアントから更新を要求し、サーバーで `requested()` を使って受け取ります。

##### クライアント側: `submit().updates(...)` で更新対象を宣言

`submit()` は `Promise<boolean>` に加えて **`.updates(...)` メソッドを生やしたチェーン可能オブジェクト** を返します。`getPosts`（関数そのもの）/`getPosts(args)`（特定インスタンス）/`.withOverride(...)`（楽観的更新付き）の 3 通りを混在可能です。

```svelte
<form
  {...createPost.enhance(async ({ submit }) => {
    await submit().updates(
      // (1) getPosts の全アクティブインスタンスを更新要求
      getPosts,
      // (2) 特定の引数のインスタンスのみ更新要求
      getPosts({ filter: 'author:santa' }),
      // (3) サーバー応答を待たず即座に UI を書き換える楽観的更新
      getPosts({ filter: 'recent' }).withOverride((posts) => [
        newPost,
        ...posts,
      ]),
    );
  })}
>
  <!-- フォーム内容 -->
</form>
```

##### サーバー側: `requested()` で受け取り、`{ arg, query }` を反復

`requested(queryFn, limit)` は **イテラブル** を返し、各要素は `{ arg, query }` の形を取ります。

- **`arg`** — スキーマで **バリデーション済み** の引数（`InferOutput<Schema>` 相当）
- **`query`** — クライアントの **元のキャッシュキー** にバインド済みの `RemoteQuery`。`query.refresh()` / `query.set(...)` を呼ぶと **そのキャッシュキー** が更新されます（スキーマで引数が変換されていても正しい）

```typescript
import * as v from 'valibot';
import { redirect } from '@sveltejs/kit';
import { query, form, requested } from '$app/server';
import * as db from '$lib/server/database';

export const getPosts = query(
  v.object({ filter: v.string() }),
  async ({ filter }) => {
    /* ... */
  },
);

export const createPost = form(schema, async (data) => {
  await db.createPost(data);

  // (A) 個別に処理したい場合は { arg, query } 形式で反復
  //     ※ `query` は arg ではなく既にバインド済みなので .refresh() を直接呼ぶ
  for (const { arg, query } of requested(getPosts, 5)) {
    // arg を見てログ出力やフィルタ分岐などに使える
    console.log('refreshing filter:', arg.filter);
    void query.refresh();
  }

  // (B) 単に全部 refresh するだけなら refreshAll() の短縮形が便利
  // await requested(getPosts, 5).refreshAll();

  // (C) ライブクエリの場合は同じパターンで reconnect / reconnectAll が使える
  // await requested(getNotifications, 5).reconnectAll();

  redirect(303, '/blog');
});
```

:::info[`requested()` の仕様メモ]

- **`limit` は必須** — クライアントから無制限に更新リクエストを送りつける DoS を防ぐためです。最悪ケースで許容できる数を指定します（`Infinity` も渡せますが非推奨）。
- **個別失敗は全体に伝搬しない** — `arg` のバリデーションに失敗した個別の要求はそのクエリ単体のエラーになり、command/form 全体は失敗しません。
- **`query.batch` でも使える** — `requested()` 内の refresh は 1 回のバッチコールに自動集約されます。
- **`query.live` 用には reconnect 系** — `requested(liveQueryFn, n).reconnectAll()` のように `reconnect` / `reconnectAll` を使います。
- **なぜ command 側が明示的に列挙する必要があるのか** — (1) バンドルサイズの観点（暗黙的にどのクエリでも refresh できると、すべての query コードが command バンドルに混入してしまう）、(2) DoS 防止（悪意あるクライアントが大量の refresh を要求できないようにするため）。
:::

##### `withOverride(...)` による楽観的更新

`withOverride(updater)` は **サーバー応答を待たずに即座にクライアントキャッシュを書き換える** ためのメソッドです。Updater 関数の引数は現在のキャッシュ値、戻り値は新しい値です。サーバーから本当の値が返ってきたら自動的に上書きされます。

```typescript
// 単独でも使える: getLikes を +1 した状態に即座に書き換える
await addLike(postId).updates(getLikes(postId).withOverride((n) => n + 1));
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
| リアルタイム更新           | -          | -            | ✅ (`query.live`)   |
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

### バリデーションの省略（`'unchecked'`）

内容を理解した上でバリデーションを省略したい場合は、スキーマの代わりに **文字列 `'unchecked'`** を渡すことができます。`query` / `query.batch` / `command` / `form` / `prerender` のすべてで受け付けられますが、エンドポイントが外部から不正なデータで呼び出されるリスクがあるため、内部利用に限定するなど慎重に扱う必要があります。

```typescript
import { query, command } from '$app/server';

// 型は手書きする必要があり、実行時の値が型と一致する保証はない
export const getStuff = query('unchecked', async ({ id }: { id: string }) => {
  // ...
});

export const internalAction = command(
  'unchecked',
  async (payload: { token: string; op: string }) => {
    // 信頼できるコンテキスト内でのみ使用する
  },
);
```

## カスタム型のシリアライズ（`transport` Universal hook）

Remote Functions の引数・戻り値はクライアント / サーバー間でシリアライズされます。`Date`・`Map`・`Set`・`Error` などはデフォルトでサポートされますが、**自前のクラス**（`Vector` や独自の `Money` 型など）を Remote Functions の境界をまたいで渡したい場合は `src/hooks.ts`（**Universal hook**）の `transport` で **トランスポーター** を定義します。

:::info[Universal hooks の位置づけ]
`transport` は `src/hooks.ts` に書く **Universal hook**（サーバーとクライアントの両方で実行される）です。`src/hooks.server.ts`（サーバー専用）や `src/hooks.client.ts`（クライアント専用）とは別ファイルである点に注意してください。
:::

```typescript
// src/hooks.ts
import type { Transport } from '@sveltejs/kit';
import { Vector } from '$lib/math';

export const transport: Transport = {
  Vector: {
    // encode: 該当インスタンスのときだけ「シリアライズ可能な値」を返す
    //         該当しないときは false / undefined を返すこと
    encode: (value) => value instanceof Vector && [value.x, value.y],
    // decode: encode の戻り値からインスタンスを復元
    decode: ([x, y]) => new Vector(x, y),
  },
};
```

この `transport` を定義しておけば、Remote Functions（および Load 関数 / Form Actions）の戻り値で `Vector` をそのまま返したり、引数として渡したりできるようになります。

```typescript
// src/routes/geometry.remote.ts
import { query } from '$app/server';
import { Vector } from '$lib/math';

export const getOrigin = query(async () => {
  // transport により Vector がそのままクライアントへ届く
  return new Vector(0, 0);
});
```

## prerender Remote Functions と `$app/server` の補助 API

### `prerender` Remote Functions

`prerender(...)` で定義した Remote Functions は **ビルド時** に実行され、結果は静的アセットとして CDN から配信されます。

- **クローラ自動収集**: `prerender` 中にページから `getPost('...')` のような呼び出しが見つかれば自動的に収集されます。
- **`inputs` で明示列挙**: クローラに頼らず、`inputs: () => [...]` で確実にプリレンダリング対象を指定できます。
- **`dynamic: true`**: プリレンダリングされなかった引数値でも、ランタイムサーバー上で動的に取得可能にします（デフォルトは false でビルド時値以外は呼び出せない）。
- **ブラウザ側キャッシュ**: ブラウザは `Cache` API で永続化し、新しいデプロイメントにアクセスするまでクリアされません。
- **制約**: `+page.svelte` で `export const prerender = true` を宣言した完全静的ページからは、動的な `query` は呼べません（`prerender` 関数か通常の Load しか使えない）。

### `getRequestEvent()` の使いどころと制約

`$app/server` の `getRequestEvent()` は `query` / `form` / `command` / サーバー hooks / `load` などのリクエストコンテキスト内で **現在の `RequestEvent`** を取得できます（2.20.0+）。

```typescript
// src/routes/user.remote.ts
import { getRequestEvent, query } from '$app/server';
import { findUser } from '$lib/server/database';

// Cookie からユーザーを引く共通関数を切り出す（同一リクエスト内で 1 回だけ走る）
const getUser = query(async () => {
  const { cookies } = getRequestEvent();
  return findUser(cookies.get('session_id'));
});

export const getProfile = query(async () => {
  const user = await getUser();
  return user && { name: user.name, avatar: user.avatar };
});
```

:::caution[getRequestEvent の制約]

- **ヘッダーは書き換え不可**（Cookie のセットは `form` / `command` 内のみ可）
- **`route` / `params` / `url` は呼び出し元のページ情報**であり、Remote Function のエンドポイントの URL ではありません。クエリは引数が変わらない限り再実行されないため、**認可判定にこれらの値を使うのは絶対に避けてください**
- `AsyncLocalStorage` が無い環境では **`await` の前に同期的に呼ぶ** 必要があります

:::

### `read()` でビルド済みアセットを読む

`$app/server` の `read(asset)` は、`import` した静的アセット（テキストや画像）のバイナリを `Response` として読み出すサーバー API です（2.4.0+）。`prerender` や `query` の内部でテンプレートファイル・OG 画像生成元データなどを読み込むときに便利です。

```typescript
// src/routes/og/page.remote.ts
import { read } from '$app/server';
import { query } from '$app/server';
import template from './template.txt';

export const renderOg = query(async () => {
  const asset = read(template);
  const text = await asset.text();
  return text.replace('{{title}}', 'Hello');
});
```

## まとめ

Remote Functions は、SvelteKit でのデータ取得とフォーム処理を大幅に簡素化します。

- **`query`**: サーバーからの型安全なデータ取得
- **`query.batch`**: N+1 問題を解決するバッチクエリ
- **`query.live`**: AsyncIterable によるリアルタイムストリーミング（`connected` / `reconnect()`）
- **`form`**: 宣言的なフォーム処理とバリデーション（`fields.*.as()` / `preflight` / `for` / `enhance` / `result`）
- **`command`**: イベントドリブンなサーバー操作
- **`prerender`**: ビルド時のデータ静的化
- **Single-flight mutations**: `submit().updates(...)` と `requested().refreshAll()` で更新を 1 リクエストに集約
- **楽観的 UI**: `withOverride((cache) => ...)` でサーバー応答を待たずキャッシュを差し替え
- **`transport` hook**: 自前クラスをクライアント / サーバー間で透過的にやり取り

実装の要点:

- `enhance` の `await submit()` は **boolean** を返す（`false` = バリデーション失敗、`throw` = ネットワーク/サーバーエラー）
- `requested(queryFn, limit)` は `{ arg, query }` イテラブル。短縮形 `.refreshAll()` / `.reconnectAll()` がある
- 内部利用に限り `'unchecked'` でスキーマを省略可能
- experimental: `kit.experimental.remoteFunctions` と `compilerOptions.experimental.async` を **両方** 有効にするのが推奨

## 次のステップ

- [フォーム処理と Actions](/sveltekit/server/forms/) - 従来の Form Actions との比較
- [データフェッチング戦略](/sveltekit/data-loading/strategies/) - Load 関数との使い分け
- [状態管理パターン](/sveltekit/application/state-management/) - グローバル状態との連携
