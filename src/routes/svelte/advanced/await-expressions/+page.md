---
title: await expressions - コンポーネント内の非同期処理
description: Svelte 5.36+のawait expressionsでスクリプトやマークアップ内で直接awaitを使用。実験的な非同期コンポーネントの設定方法と使い方をTypeScriptで解説
---

<script>
	import Admonition from '$lib/components/Admonition.svelte';
</script>

Svelte 5.36 以降では、コンポーネントの `&lt;script&gt;` タグやマークアップ内で直接 `await` を使用できるようになりました。
これにより、非同期データの取得と表示がより直感的に書けます。

## この記事で学べること

- `await` expressions の基本的な使い方
- 同期された更新（Synchronized updates）の仕組み
- 並行処理（Concurrency）の挙動
- ローディング状態の表示方法
- エラーハンドリング
- サーバーサイドレンダリング（SSR）での動作

<Admonition type="warning" title="実験的機能">

`await` expressions は現在実験的な機能です。今後のリリースで破壊的変更が行われる可能性があります。
Svelte 6 で実験的フラグが削除される予定です。

</Admonition>

## 設定

`await` expressions を使用するには、`svelte.config.js` で実験的オプションを有効化します。

```typescript
// svelte.config.js
import type { Config } from '@sveltejs/kit';

const config: Config = {
  compilerOptions: {
    experimental: {
      async: true,
    },
  },
};

export default config;
```

## 基本的な使い方

`await` expressions は、スクリプト内、マークアップ内、そして `$derived` 内で使用できます。それぞれの使い方を見ていきましょう。

### スクリプト内での await

最もシンプルな使い方は、`&lt;script&gt;` タグ内でトップレベル `await` を使用することです。以下の例では、コンポーネントがマウントされる前にユーザーデータを取得しています。

```svelte
<script lang="ts">
  interface User {
    id: string;
    name: string;
  }

  // トップレベルで直接awaitが使用可能
  const user: User = await fetchUser();

  async function fetchUser(): Promise<User> {
    const response = await fetch('/api/user');
    return response.json();
  }
</script>

<h1>ようこそ、{user.name}さん</h1>
```

### マークアップ内での await

マークアップ内でも直接 `await` を使用できます。これは `&#123;#await&#125;` ブロックよりも簡潔に書けますが、ローディング状態やエラー状態を表示するには `&lt;svelte:boundary&gt;` と組み合わせる必要があります。

```svelte
<script lang="ts">
  async function getTitle(): Promise<string> {
    const response = await fetch('/api/title');
    const data = await response.json();
    return data.title;
  }
</script>

<!-- マークアップ内で直接await -->
<h1>{await getTitle()}</h1>
```

### $derived 内での await

`$derived` 内で `await` を使用すると、依存する状態が変更されたときに自動的に非同期処理が再実行されます。以下の例では、`userId` が変更されるたびに対応するユーザーデータを取得します。

```svelte
<script lang="ts">
  let userId = $state('user-1');

  // $derived内でもawaitが使用可能
  let userData = $derived(await fetchUser(userId));

  async function fetchUser(id: string) {
    const response = await fetch(`/api/users/${id}`);
    return response.json();
  }
</script>

<select bind:value={userId}>
  <option value="user-1">ユーザー1</option>
  <option value="user-2">ユーザー2</option>
</select>

<p>名前: {userData.name}</p>
```

## 同期された更新（Synchronized Updates）

`await` expressions を使用すると、非同期処理が完了するまで UI の更新が同期されます。
これにより、UI が不整合な状態になることを防ぎます。

以下の例では、入力値 `a` と `b` を変更しても、`add(a, b)` の計算が完了するまで UI は更新されません。これにより、「入力値は変わったのに計算結果は古いまま」という不整合を防ぎます。

```svelte
<script lang="ts">
  let a = $state(1);
  let b = $state(2);

  async function add(x: number, y: number): Promise<number> {
    // 人工的な遅延
    await new Promise((resolve) => setTimeout(resolve, 500));
    return x + y;
  }
</script>

<input type="number" bind:value={a} />
<input type="number" bind:value={b} />

<!-- aを変更しても、add(a, b)が完了するまでUIは更新されない -->
<p>{a} + {b} = {await add(a, b)}</p>
```

### 不整合の防止

通常の状態では、以下のような不整合が発生する可能性があります。

```html
<!-- aを1から2に変更した直後の不整合な状態 -->
<p>2 + 2 = 3</p>
<!-- ← 計算結果がまだ古い -->
```

`await` expressions では、この不整合を防ぎ、すべてが同期された状態でのみ UI を更新します。

```html
<!-- 計算が完了してから更新 -->
<p>2 + 2 = 4</p>
```

## 並行処理（Concurrency）

複数の独立した `await` expressions は並行して実行されます。これにより、複数のデータを効率的に取得できます。

以下の例では、`fetchPosts()` が1秒、`fetchComments()` が2秒かかりますが、並行して実行されるため合計2秒で完了します（直列なら3秒かかるところです）。

```svelte
<script lang="ts">
  async function fetchPosts() {
    // 1秒かかる
    await new Promise(r => setTimeout(r, 1000));
    return [{ title: 'Post 1' }];
  }

  async function fetchComments() {
    // 2秒かかる
    await new Promise(r => setTimeout(r, 2000));
    return [{ text: 'Comment 1' }];
  }
</script>

<!-- これらは並行して実行される（合計2秒で完了） -->
<ul>
  {#each await fetchPosts() as post}
    <li>&#123;post.title&#125;</li>
  {/each}
</ul>

<ul>
  {#each await fetchComments() as comment}
    <li>&#123;comment.text&#125;</li>
  {/each}
</ul>
```

### $derived の場合

複数の `$derived` は初回は順次実行されますが、その後の更新は独立して行われます。これは、Svelte の Runes がトップレベルで宣言された順に実行されるためです。

```svelte
<script lang="ts">
  // 初回は順次実行（posts → comments の順）
  // その後はそれぞれ独立して更新（依存する状態が変わったものだけ）
  let posts = $derived(await fetchPosts());
  let comments = $derived(await fetchComments());
</script>
```

<Admonition type="note" title="await_waterfall 警告">

複数の await が順次実行されると、`await_waterfall` という警告が表示されることがあります。
独立した await は並行して実行できるよう、コードを整理することを検討してください。

</Admonition>

## ローディング状態の表示

`await` expressions を使用する場合、ローディング状態の表示方法が重要です。初回ロード時と更新時では異なるアプローチを使用します。

### svelte:boundary の pending スニペット

初回のローディング状態を表示するには、`&lt;svelte:boundary&gt;` の `pending` スニペットを使用します。非同期処理が完了するまで、このスニペットが表示されます。

```svelte
<script lang="ts">
  async function fetchData() {
    await new Promise(r => setTimeout(r, 2000));
    return { message: 'データが読み込まれました' };
  }
</script>

<svelte:boundary>
  {#snippet pending()}
    <p>読み込み中...</p>
  {/snippet}

  <p>{(await fetchData()).message}</p>
</svelte:boundary>
```

### $effect.pending() による検出

初回以降の更新中は、`$effect.pending()` を使用してローディング状態を検出できます。この関数は、現在進行中の非同期エフェクトの数を返します。これを使って、検索中のスピナー表示などを実装できます。

```svelte
<script lang="ts">
  let query = $state('');

  async function search(q: string) {
    const response = await fetch(`/api/search?q=${q}`);
    return response.json();
  }

  // 検索結果
  let results = $derived(await search(query));

  // 非同期処理が進行中かどうか
  let isSearching = $derived($effect.pending() > 0);
</script>

<input bind:value={query} placeholder="検索..." />

{#if isSearching}
  <span class="spinner">検索中...</span>
{/if}

<ul>
  {#each results as result}
    <li>&#123;result.title&#125;</li>
  {/each}
</ul>
```

### settled() による更新完了の待機

`settled()` を使用して、すべての非同期更新が完了するまで待機できます。これは、更新中フラグを正確に管理したい場合や、更新完了後に何か処理を行いたい場合に便利です。

```svelte
<script lang="ts">
  import { tick, settled } from 'svelte';

  let updating = $state(false);
  let data = $state({ value: 0 });

  async function handleClick() {
    updating = true;

    // tickでupdatingの変更をUIに反映
    await tick();

    // データを更新
    data = { value: data.value + 1 };

    // すべての非同期更新が完了するまで待機
    await settled();

    updating = false;
  }
</script>

<button onclick={handleClick} disabled={updating}>
  {updating ? '更新中...' : '更新'}
</button>

<p>値: {data.value}</p>
```

## エラーハンドリング

`await` expressions でエラーが発生した場合、最も近い `&lt;svelte:boundary&gt;` のエラーハンドリングが実行されます。これにより、try-catch を使わずに宣言的にエラーを処理できます。

以下の例では、`failed` スニペットでエラーメッセージを表示し、再読み込みボタンを提供しています。

```svelte
<script lang="ts">
  async function fetchData() {
    const response = await fetch('/api/data');
    if (!response.ok) {
      throw new Error('データの取得に失敗しました');
    }
    return response.json();
  }
</script>

<svelte:boundary>
  {#snippet failed(error)}
    <p class="error">エラー: {error.message}</p>
    <button onclick={() => location.reload()}>再読み込み</button>
  {/snippet}

  {#snippet pending()}
    <p>読み込み中...</p>
  {/snippet}

  <div>
    <h1>{(await fetchData()).title}</h1>
  </div>
</svelte:boundary>
```

## サーバーサイドレンダリング（SSR）

`await` expressions は SSR でも動作します。コンポーネント内の非同期処理が完了してからHTMLがレンダリングされます。

### 非同期 SSR

Svelte は非同期 SSR をサポートしています。`render()` 関数を `await` することで、すべての非同期処理が完了した後の完全なHTMLを取得できます。

```typescript
// server.ts
import { render } from 'svelte/server';
import App from './App.svelte';

// awaitで非同期レンダリングを待機
const { head, body } = await render(App);
```

### pending スニペットの SSR 動作

SSR 中に `&lt;svelte:boundary&gt;` の `pending` スニペットに到達すると、興味深い動作をします。非同期コンテンツを待たずに `pending` スニペットがレンダリングされ、内部の非同期コンテンツは無視されます。これにより、サーバーはすぐにHTMLを返し、クライアント側でデータを取得する「ストリーミング的」な動作を実現できます。

```svelte
<svelte:boundary>
  {#snippet pending()}
    <!-- SSR時はこれがレンダリングされる -->
    <p>読み込み中...</p>
  {/snippet}

  <!-- SSR時は無視される -->
  <p>{await fetchData()}</p>
</svelte:boundary>
```

<Admonition type="tip" title="SvelteKit を使用している場合">

SvelteKit を使用している場合、非同期 SSR は自動的に処理されます。

</Admonition>

## fork() による事前実行

<Admonition type="info" title="バージョン要件">

`fork()` は Svelte 5.42 以降で利用可能です。

</Admonition>
`fork()` を使用すると、将来実行される可能性のある非同期処理を事前に開始できます。
これは主にプリローディング（事前読み込み）に使用されます。

例えば、ユーザーがボタンにホバーした時点でメニュー内のデータを先読みし、実際にクリックした時には即座に表示できるようにします。`fork()` は3つの状態を持ちます。

- **作成時**: 非同期処理を開始するが、結果はまだ適用しない
- **commit()**: 結果を実際に適用する
- **discard()**: 結果を破棄する

```svelte
<script lang="ts">
  import { fork, type Fork } from 'svelte';
  import Menu from './Menu.svelte';

  let open = $state(false);
  let pending: Fork | null = null;

  function preload() {
    // フォークを作成して事前に非同期処理を開始
    pending ??= fork(() => {
      open = true;
    });
  }

  function discard() {
    // フォークを破棄
    pending?.discard();
    pending = null;
  }
</script>

<button
  onfocusin={preload}
  onfocusout={discard}
  onpointerenter={preload}
  onpointerleave={discard}
  onclick={() => {
    // フォークをコミット（実際に適用）
    pending?.commit();
    pending = null;
    open = true;
  }}
>
  メニューを開く
</button>

{#if open}
  <!-- Menu内の非同期処理はフォーク作成時に開始される -->
  <Menu onclose={() => (open = false)} />
{/if}
```

## 注意事項と制限

`await` expressions は強力ですが、実験的機能のため、いくつかの注意点があります。

### 破壊的変更

実験的機能のため、`experimental.async` オプションを有効にすると、エフェクトの実行順序が若干変わる場合があります。

具体的には、`&#123;#if ...&#125;` や `&#123;#each ...&#125;` などのブロックエフェクトが、同じコンポーネント内の `$effect.pre` や `beforeUpdate` よりも先に実行されるようになります。

### 推奨される使い方

1. **新規プロジェクト**: 実験的機能を理解した上で使用
2. **既存プロジェクト**: 慎重に導入し、十分なテストを実施
3. **ライブラリ**: まだ使用を控えることを推奨

## Remote Functions との組み合わせ

[Remote Functions](/sveltekit/server/remote-functions/) と組み合わせることで、より強力な非同期パターンが実現できます。Remote Functions は型安全なサーバー通信を提供し、`await` expressions はその結果を直感的にUIに反映します。

以下の例では、サーバーサイドで定義した `getUser` と `getPosts` 関数を、マークアップ内で直接 await しています。

```svelte
<script lang="ts">
  import { getPosts, getUser } from './data.remote';

  let userId = $state('user-1');
</script>

<svelte:boundary>
  {#snippet pending()}
    <p>読み込み中...</p>
  {/snippet}

  <header>
    <h1>ようこそ、{(await getUser()).name}さん</h1>
  </header>

  <main>
    <h2>最新の投稿</h2>
    <ul>
      {#each await getPosts() as post}
        <li>&#123;post.title&#125;</li>
      {/each}
    </ul>
  </main>
</svelte:boundary>
```

## まとめ

`await` expressions は、Svelte でのデータ取得を劇的に簡素化します。

- **直感的な構文**: スクリプトやマークアップで直接 `await` を使用
- **同期された更新**: UI の不整合を自動的に防止
- **並行処理**: 独立した非同期処理は自動的に並行実行
- **ローディング状態**: `&lt;svelte:boundary&gt;` と `$effect.pending()` で簡単に表示

実験的機能ではありますが、Svelte 6 で正式採用される予定です。新規プロジェクトでは積極的に試してみてください。

## 次のステップ

- [Remote Functions](/sveltekit/server/remote-functions/) - サーバーとの型安全な通信
- [hydratable](/svelte/advanced/hydratable/) - SSR データの再利用
- [$effect - 副作用](/svelte/runes/effect/) - エフェクトの詳細
