---
title: 特別な要素
description: Svelte 5 の特別な要素（svelte:element / svelte:window / svelte:document / svelte:body / svelte:head / svelte:options / svelte:boundary）を TypeScript で活用。動的要素生成、window・document へのイベントバインディング、head へのメタタグ追加、エラーバウンダリの実装パターンを解説。
---

<script>
	import { base } from '$app/paths';
	import Admonition from '$lib/components/Admonition.svelte';
	import LiveCode from '$lib/components/LiveCode.svelte';
</script>

Svelteには、`svelte:`プレフィックスを持つ特別な要素があります。これらは通常のHTML要素ではなく、Svelteコンパイラによって特別に処理される要素で、動的な要素作成、グローバルイベントの処理、エラーハンドリングなど、高度な機能を提供します。

## 特別な要素一覧

Svelteが提供する特別な要素は以下の通りです。

### 現在も推奨される要素

| 要素                                                                           | 用途                         | 主な使用場面                                       |
| ------------------------------------------------------------------------------ | ---------------------------- | -------------------------------------------------- |
| [`svelte:element`](#svelteelement---動的要素の作成)                           | タグを動的に決定             | 権限に応じた要素の切り替え、CMSコンテンツ          |
| [`svelte:window`](#sveltewindow---ウィンドウイベントのバインディング)         | windowイベント・プロパティ   | スクロール位置、リサイズ、キーボードショートカット |
| [`svelte:document`](#sveltedocument---document要素へのイベントバインディング) | documentイベント・プロパティ | ページ表示状態、テキスト選択、フルスクリーン       |
| [`svelte:body`](#sveltebody---body要素へのイベントバインディング)             | bodyイベント                 | マウストラッキング、ドラッグ&ドロップ              |
| [`svelte:head`](#sveltehead---head要素への要素追加)                           | `<head>`に要素を追加         | SEO、メタタグ、外部リソース                        |
| [`svelte:options`](#svelteoptions---コンポーネントオプション)                 | コンパイラオプション         | Web Components、不変性、名前空間                   |
| [`svelte:boundary`](#svelteboundary---エラーバウンダリ)                       | エラーのキャッチ             | エラーハンドリング、フォールバックUI               |

### レガシー要素（Svelte 5では代替方法を推奨）

| 要素                                                                     | 状態     | 代替方法                                                        |
| ------------------------------------------------------------------------ | -------- | --------------------------------------------------------------- |
| [`svelte:component`](#sveltecomponent---動的コンポーネントレガシー) | レガシー | Runesモードでは通常のコンポーネント変数で自動的に再レンダリング |
| [`svelte:fragment`](#sveltefragment---グループ化要素レガシー)       | レガシー | Svelte 5のSnippetsは余計なラッパー要素を作らない                |
| [`svelte:self`](#svelteself---再帰的コンポーネントレガシー)         | レガシー | コンポーネント自体をimportして使用                              |

<Admonition type="tip" title="使い分けのポイント">

<ul>
<li><strong>DOM操作系</strong>: <code>svelte:window</code>、<code>svelte:document</code>、<code>svelte:body</code>、<code>svelte:head</code></li>
<li><strong>動的制御系</strong>: <code>svelte:element</code></li>
<li><strong>設定系</strong>: <code>svelte:options</code>、<code>svelte:boundary</code></li>
</ul>

</Admonition>
<Admonition type="warning" title="Svelte 5での重要な変更">

Svelte 5では、`svelte:component`、`svelte:fragment`、`svelte:self`はレガシー機能となりました。新しいプロジェクトではこれらの代替方法を使用することを推奨します。

</Admonition>

## `svelte:element` - 動的要素の作成

`&lt;svelte:element&gt;`は、実行時に要素のタグを動的に決定できる特別な要素です。ユーザーの権限やコンテンツタイプに応じて、異なるHTML要素を使い分ける場合に便利です。

```svelte live
<script lang="ts">
  let tag = $state('div');
  let href = $state('https://svelte.dev');

  // タグの選択肢
  const tags = ['div', 'section', 'article', 'a', 'button'];
</script>

<div style="padding: 1rem; border: 1px solid #ddd; border-radius: 8px;">
  <label for="tag-select" style="display: block; margin-bottom: 0.5rem; font-weight: bold;">
    要素タグを選択:
  </label>
  <select id="tag-select" bind:value={tag} style="padding: 0.5rem; margin-bottom: 1rem;">
    {#each tags as t (t)}
      <option value={t}>{t}</option>
    {/each}
  </select>

  <!-- 動的にタグが変わる -->
  <svelte:element
    this={tag}
    href={tag === 'a' ? href : undefined}
    onclick={tag === 'button' ? () => alert('クリック！') : undefined}
    style="padding: 0.5rem; background: #f0f0f0; border: 1px solid #ccc; border-radius: 4px; display: inline-block; color: #333;"
  >
    私は{tag}要素です
  </svelte:element>

  <div style="margin-top: 1rem; color: #333; padding: 0.5rem; background: #e8f5e9; border-radius: 4px;">
    <strong>現在のHTML:</strong>
    <code style="color: #333;">&lt;{tag}&gt;私は{tag}要素です&lt;/{tag}&gt;</code>
  </div>
</div>
```

### 実践的な使用例

```svelte
<script lang="ts">
  type UserRole = 'admin' | 'user' | 'guest';

  let userRole: UserRole = $state('user');
  let action = $state('');

  // 権限に応じて要素を変える
  function getElementTag(role: UserRole) {
    switch (role) {
      case 'admin': return 'button';
      case 'user': return 'a';
      case 'guest': return 'span';
    }
  }

  function handleAction() {
    action = `${userRole}がアクションを実行しました`;
  }
</script>

<svelte:element
  this={getElementTag(userRole)}
  href={userRole === 'user' ? '#action' : undefined}
  onclick={userRole === 'admin' ? handleAction : undefined}
  class="action-element"
>
  {userRole === 'admin' ? '削除' : userRole === 'user' ? '詳細を見る' : '閲覧のみ'}
</svelte:element>
```

## `svelte:window` - ウィンドウイベントのバインディング

`&lt;svelte:window&gt;`は、windowオブジェクトのイベントやプロパティにバインドできる特別な要素です。スクロール位置、ウィンドウサイズ、キーボードイベントなどを簡単に扱えます。

```svelte live console
<script lang="ts">
  let scrollY = $state(0);
  let innerWidth = $state(0);
  let innerHeight = $state(0);
  let online = $state(true);

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      console.log('Escapeキーが押されました');
    }
  }
</script>

<svelte:window
  bind:scrollY
  bind:innerWidth
  bind:innerHeight
  bind:online
  onkeydown={handleKeydown}
/>

<div style="padding: 1rem; border: 1px solid #ddd; border-radius: 8px;">
  <h4 style="margin-top: 0; color: #ff3e00;">Window情報</h4>
  <div style="display: grid; gap: 0.5rem;">
    <div>📐 ウィンドウサイズ: {innerWidth} × {innerHeight}px</div>
    <div>📜 スクロール位置: {scrollY}px</div>
    <div>🌐 オンライン状態: {online ? '接続中' : 'オフライン'}</div>
  </div>

  <div style="margin-top: 1rem; padding: 0.5rem; background: #f0f0f0; border-radius: 4px; color: #666;">
    ※ Escapeキーを押すとコンソールにログが出力されます
  </div>
</div>
```

:::tip[svelte/reactivity/window を活用する]
Svelte 5.11+ では `svelte/reactivity/window` モジュールがリアクティブな window ラッパーを提供します。`<svelte:window>` を使わず、`.current` プロパティで値を参照できます（SSR では `undefined`）。

```svelte
<script lang="ts">
  import {
    innerWidth,
    innerHeight,
    online,
    scrollY,
    devicePixelRatio
  } from 'svelte/reactivity/window';

  // .current で値を取得（リアクティブ）
  let screenSize = $derived.by(() => {
    const w = innerWidth.current ?? 0;
    if (w < 640) return 'mobile';
    if (w < 1024) return 'tablet';
    return 'desktop';
  });
</script>

<p>サイズ: {innerWidth.current} × {innerHeight.current}</p>
<p>オンライン: {online.current ? '✅' : '❌'}</p>
<p>スクロールY: {scrollY.current}</p>
<p>DPR: {devicePixelRatio.current}</p>
<p>レイアウト: {screenSize}</p>
```

利用可能な値：`innerWidth`、`innerHeight`、`outerWidth`、`outerHeight`、`scrollX`、`scrollY`、`online`、`devicePixelRatio`、`screenLeft`、`screenTop`。

`<svelte:window>` は **トップレベルに 1 回しか書けない**制約があるため、複数コンポーネントから window 情報を参照したい場合は `svelte/reactivity/window` のほうが扱いやすくなります。
:::

### レスポンシブデザインの実装例

```svelte
<script lang="ts">
  let innerWidth = $state(0);

  // 複数行の処理には $derived.by() を使用
  let screenSize = $derived.by(() => {
    if (innerWidth < 640) return 'mobile';
    if (innerWidth < 1024) return 'tablet';
    return 'desktop';
  });
</script>

<svelte:window bind:innerWidth />

<div class="layout {screenSize}">
  <!-- レスポンシブなレイアウト -->
  {#if screenSize === 'mobile'}
    <MobileLayout />
  {:else if screenSize === 'tablet'}
    <TabletLayout />
  {:else}
    <DesktopLayout />
  {/if}
</div>
```

## `svelte:body` - body要素へのイベントバインディング

`&lt;svelte:body&gt;`は、body要素のイベントにバインドできます。マウストラッキングやドラッグ&ドロップなど、ページ全体での操作を扱う際に使用します。

```svelte
<script lang="ts">
  let mouseX = $state(0);
  let mouseY = $state(0);

  function handleMouseMove(event: MouseEvent) {
    mouseX = event.clientX;
    mouseY = event.clientY;
  }
</script>

<svelte:body onmousemove={handleMouseMove} />

<div class="cursor-tracker">
  マウス位置: ({mouseX}, {mouseY})
</div>

<!-- カスタムカーソルの実装 -->
<div
  class="custom-cursor"
  style="left: {mouseX}px; top: {mouseY}px;"
/>
```

## `svelte:document` - document要素へのイベントバインディング

`&lt;svelte:document&gt;`は、documentオブジェクトのイベントやプロパティにバインドできます。ページの表示状態、テキスト選択、フルスクリーン状態などを監視できます。

```svelte live
<script lang="ts">
  // visibilityState は DocumentVisibilityState 型（'visible' | 'hidden'）
  let visibilityState = $state<DocumentVisibilityState>('visible');
  // fullscreenElement は readonly な Element | null を bind する
  let fullscreenElement = $state<Element | null>(null);
  let selectionText = $state('');

  function handleSelectionChange() {
    const selection = window.getSelection();
    selectionText = selection?.toString() ?? '';
  }

  function handleVisibilityChange() {
    visibilityState = document.visibilityState;
  }
</script>

<svelte:document
  bind:fullscreenElement
  onvisibilitychange={handleVisibilityChange}
  onselectionchange={handleSelectionChange}
/>

<div style="padding: 1rem; border: 1px solid #ddd; border-radius: 8px;">
  <h4 style="margin-top: 0; color: #ff3e00;">Document情報</h4>
  <div style="display: grid; gap: 0.5rem;">
    <div>👁️ ページ表示状態: {visibilityState}</div>
    <div>🖥️ フルスクリーン: {fullscreenElement ? 'ON' : 'OFF'}</div>
    <div>✏️ 選択テキスト: {selectionText || '(なし)'}</div>
  </div>

  <p style="margin-top: 1rem; padding: 0.5rem; background: #fff3e0; border-radius: 4px; color: #666;">
    このテキストを選択すると、選択内容が上に表示されます。
  </p>
</div>
```

<Admonition type="info" title="bind:fullscreenElement は readonly">

`fullscreenElement`、`activeElement`、`pointerLockElement`、`visibilityState` は `<svelte:document>` で bind 可能ですが、いずれも **readonly**（参照専用）です。値を変更するには `document.documentElement.requestFullscreen()` などのブラウザ API を呼び出します。

</Admonition>

## `svelte:head` - head要素への要素追加

`&lt;svelte:head&gt;`は、documentのhead要素に要素を追加できます。SEO対策、メタタグの設定、外部スタイルシートの読み込みなどに使用します。

```svelte
<script lang="ts">
  let pageTitle = $state('ページタイトル');
  let description = $state('ページの説明');
</script>

<svelte:head>
  <title>{pageTitle}</title>
  <meta name="description" content={description} />
  <link rel="canonical" href="https://example.com/page" />

  <!-- Open Graphタグ -->
  <meta property="og:title" content={pageTitle} />
  <meta property="og:description" content={description} />
  <meta property="og:image" content="https://example.com/image.jpg" />
  <meta property="og:type" content="website" />

  <!-- Twitter Cardタグ -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={pageTitle} />
  <meta name="twitter:description" content={description} />

  <!-- 構造化データ -->
  {@html `<script type="application/ld+json">
    ${JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": pageTitle,
      "description": description
    })}
  </script>`}
</svelte:head>
```

## `svelte:options` - コンポーネントオプション

`&lt;svelte:options&gt;`は、コンポーネントのコンパイラオプションを設定します。Web Components化、Runesモードの強制、名前空間の指定などができます。

### Runesモードで有効なオプション

```svelte
<!-- runesオプション：このコンポーネントをRunesモードに固定 -->
<svelte:options runes={true} />

<!-- customElementオプション：Web Componentsとして使用 -->
<svelte:options customElement="my-component" />

<!-- namespaceオプション：SVG / MathML コンポーネント用 -->
<svelte:options namespace="svg" />

<!-- cssオプション：CSSをインライン注入（SSRでは<head>のstyle、CSRではJS経由） -->
<svelte:options css="injected" />

<script lang="ts">
  // コンポーネントのロジック
  let { value = 'default' }: { value?: string } = $props();
</script>
```

:::caution[`accessors` / `immutable` は Runes モードで非対応]
Svelte 4 で利用できた次のオプションは **Svelte 5 で非推奨**となり、Runes モードでは**機能しません**。

- `accessors={true}` — プロパティの getter/setter を自動生成（レガシー専用）
- `immutable={true}` — プロパティが不変であることをコンパイラに伝える（レガシー専用）

Runes モードではこれらの代わりに以下を使います。

- `accessors` → 外部から値を操作したい場合は `$bindable()` でバインド可能な props を公開する、または親で `$state` を作って渡す
- `immutable` → `$state.raw()` / `$state.frozen()` で深いリアクティビティを無効化、または `$state` を新しいオブジェクトに置き換える

既存のレガシーコードを Runes モードへ移行する際は、これらのオプションを削除してください。
:::

### Web Componentsの例

```svelte
<!-- MyButton.svelte -->
<svelte:options customElement={{
  tag: "my-button",
  shadow: "open",
  props: {
    variant: { type: "String" },
    disabled: { type: "Boolean" }
  }
}} />

<script lang="ts">
  let {
    variant = 'primary',
    disabled = false
  }: {
    variant?: 'primary' | 'secondary';
    disabled?: boolean;
  } = $props();
</script>

<button class="btn {variant}" {disabled}>
  {@render children?.()}
</button>
```

## `svelte:boundary` - エラーバウンダリ

`&lt;svelte:boundary&gt;` は **Svelte 5.3.0 で追加**された組み込み要素で、子コンポーネントで発生したエラーをキャッチしてフォールバック UI を表示できます。アプリケーション全体のクラッシュを防ぎ、await expressions の初回解決中はローディング UI を表示できます。

`<svelte:boundary>` が処理できる主な要素は次の 4 つです。

| プロパティ        | 追加バージョン | 役割                                                   |
| ----------------- | -------------- | ------------------------------------------------------ |
| `pending`         | 5.3+           | await expressions の初回解決中に表示するローディング UI |
| `failed`          | 5.3+           | 描画・エフェクト中にエラーが発生したときのフォールバック UI |
| `onerror`         | 5.3+           | エラー発生時のコールバック（ログ送信などに使う）       |
| `transformError`  | 5.51+          | SSR 時のエラーをサニタイズしてクライアントに渡す関数   |

:::caution[React の `<Suspense>` とは別物]
Svelte には `<Suspense>` という API は **存在しません**。非同期 UI の表示は `<svelte:boundary>` の `pending` snippet と [`await` expressions](/svelte/advanced/await-expressions/) を組み合わせて表現します。`import { Suspense } from 'svelte'` のようなコードを書いてはいけません（コンパイルエラーになります）。
:::

:::warning[キャッチされないエラー]
`<svelte:boundary>` がキャッチするのは **レンダリングまたは `$effect` 内** で発生したエラーだけです。以下は **キャッチされません**。

- イベントハンドラ内で発生したエラー
- `setTimeout` / `Promise` の中で発生した非同期エラー
- `onMount` 内の非同期処理で発生したエラー

これらは個別に `try/catch` でハンドリングしてください。
:::

```svelte live
<script lang="ts">
  let shouldError = $state(false);

  // エラーを発生させるコンポーネントのシミュレーション
  function ErrorComponent() {
    if (shouldError) {
      throw new Error('意図的なエラー！');
    }
    return 'エラーなし - 正常動作中';
  }
</script>

<div style="padding: 1rem; border: 1px solid #ddd; border-radius: 8px;">
  <label style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;">
    <input type="checkbox" bind:checked={shouldError} />
    <span>エラーを発生させる</span>
  </label>

  <svelte:boundary>
    <div style="padding: 1rem; background: #e8f5e9; border-radius: 4px; color: #2e7d32;">
      ✅ {ErrorComponent()}
    </div>

    {#snippet failed(error, reset)}
      <div style="padding: 1rem; background: #ffebee; border-radius: 4px; color: #c62828;">
        <strong>⚠️ エラーが発生しました:</strong>
        <pre style="margin: 0.5rem 0 0; font-size: 0.9em;">{error.message}</pre>
        <button
          onclick={() => { shouldError = false; reset(); }}
          style="margin-top: 0.5rem; padding: 0.25rem 0.5rem; background: white; border: 1px solid #c62828; border-radius: 4px; color: #c62828; cursor: pointer;"
        >
          リトライ
        </button>
      </div>
    {/snippet}
  </svelte:boundary>
</div>
```

### 実践的なエラーハンドリング

```svelte
<script lang="ts">
  import { reportError } from './error-reporter';

  async function handleError(error: Error) {
    // エラーレポートサービスに送信
    await reportError(error);

    // ユーザーに通知
    console.error('エラーが発生しました:', error);
  }
</script>

<svelte:boundary>
  <!-- メインアプリケーション -->
  <App />

  {#snippet failed(error, reset)}
    <div class="error-container">
      <h2>申し訳ございません</h2>
      <p>予期しないエラーが発生しました。</p>
      <details>
        <summary>エラー詳細</summary>
        <pre>{error.stack}</pre>
      </details>
      <button onclick={reset}>
        アプリを再起動
      </button>
      <button onclick={() => handleError(error)}>
        エラーを報告
      </button>
    </div>
  {/snippet}
</svelte:boundary>
```

### `pending` snippet — 非同期ローディング表示

`&lt;svelte:boundary&gt;` は `await expressions` と連携し、初回の非同期データ解決中にローディングUIを表示できます。

```svelte
<svelte:boundary>
  <!-- await expressionsで非同期データを取得 -->
  <h1>{await fetchPageTitle()}</h1>
  <p>{await fetchPageContent()}</p>

  {#snippet pending()}
    <!-- すべてのawaitが解決されるまで表示 -->
    <div class="loading">
      <div class="spinner"></div>
      <p>コンテンツを読み込み中...</p>
    </div>
  {/snippet}

  {#snippet failed(error, reset)}
    <div class="error">
      <p>読み込みに失敗しました: {error.message}</p>
      <button onclick={reset}>再試行</button>
    </div>
  {/snippet}
</svelte:boundary>
```

<Admonition type="tip" title="pending vs $effect.pending()">

`pending` snippetは**初回ローディング時**のみ表示されます。後続の非同期更新でのローディング状態は `$effect.pending()` で検出します。

</Admonition>

### `onerror` プロパティ

`failed` snippetの代わりに、またはそれと併用して `onerror` コールバックを使用できます。エラーログサービス（Sentry など）への送信や、バウンダリ外部でのエラー状態管理に有用です。

```svelte
<script lang="ts">
  function reportToSentry(error: unknown) {
    // 外部のエラーレポートサービスへ送信
    console.error('[Sentry]', error);
  }
</script>

<svelte:boundary onerror={(error, reset) => {
  // エラーログサービスに送信
  reportToSentry(error);
  console.error('Boundary caught:', error);
}}>
  <App />

  {#snippet failed(error, reset)}
    <ErrorFallback {error} {reset} />
  {/snippet}
</svelte:boundary>
```

`onerror` の中で再度 throw した場合、エラーは**親のバウンダリ**へ伝播します。

### `transformError` — SSR エラーのサニタイズ（5.51+）

デフォルトでは、SSR 中にバウンダリ内でエラーが発生するとレンダリング全体が失敗します。Svelte 5.51 以降では、`render(...)` に `transformError` 関数を渡すことで、`failed` snippet を持つバウンダリの SSR エラーをサニタイズしてクライアントに渡せます。

```ts
// server.ts
import { render } from 'svelte/server';
import App from './App.svelte';

const { head, body } = await render(App, {
  transformError: (error: unknown) => {
    // 元のエラー（スタックトレース付き）はサーバ側にだけログ
    console.error(error);

    // クライアントには無害化したオブジェクトだけを返す
    return {
      message: 'エラーが発生しました。しばらくしてから再度お試しください。'
    };
  }
});
```

`transformError` が返した JSON シリアライズ可能な値が、ブラウザの `failed` snippet に渡される `error` として復元されます。

:::warning[SSR エラーには機密情報が含まれることがある]
`error.message` や `error.stack` には DB パスワード、API キー、内部パスなどが含まれることがあります。**そのままクライアントへ送らず**、`transformError` で必ずサニタイズしてください。
:::

:::info[SvelteKit を使っている場合]
SvelteKit から直接 `render(...)` を呼び出すことはできません。SvelteKit は近い将来、[`handleError`](https://svelte.dev/docs/kit/hooks#Shared-hooks-handleError) フックを介して `transformError` をサポートする予定です。それまでは `handleError` でログを取り、`error.message` を加工した独自プロパティでテンプレートに渡すなどの代替手段を取ってください。
:::

### プロパティ一覧

| プロパティ        | 型                                          | バージョン | 説明                                                       |
| ----------------- | ------------------------------------------- | ---------- | ---------------------------------------------------------- |
| `pending`         | `Snippet`                                   | 5.3+       | 非同期解決待ちのローディング UI（初回のみ）               |
| `failed`          | `Snippet<[Error, () => void]>`              | 5.3+       | エラー時のフォールバック UI                               |
| `onerror`         | `(error: Error, reset: () => void) => void` | 5.3+       | エラー発生時のコールバック                                |
| `transformError`  | `(error: unknown) => JSONValue`             | 5.51+      | SSR 時にエラーを変換（`render()` / `mount()` / `hydrate()` のオプション経由） |

<Admonition type="info" title="svelte:boundaryの利点">

<ul>
<li><strong>エラーの局所化</strong>: エラーがアプリケーション全体に影響しない</li>
<li><strong>非同期ローディング</strong>: <code>pending</code> snippetでawait式のローディング状態を表示</li>
<li><strong>ユーザー体験の向上</strong>: エラー時でも適切なフィードバックを表示</li>
<li><strong>デバッグの簡易化</strong>: エラーの発生箇所を特定しやすい</li>
<li><strong>プロダクション対応</strong>: 本番環境でのエラーを優雅に処理</li>
</ul>

</Admonition>

## ベストプラクティス

### 1. 適切な要素の選択

```svelte
<!-- ❌ 悪い例：不要な動的要素 -->
<svelte:element this="div">
  常にdivなのに動的にしている
</svelte:element>

<!-- ✅ 良い例：本当に動的な場合のみ使用 -->
<svelte:element this={userRole === 'admin' ? 'button' : 'span'}>
  {content}
</svelte:element>
```

### 2. イベントリスナーの管理

```svelte
<!-- ❌ 悪い例：パフォーマンスの問題 -->
<svelte:window onresize={() => updateLayout()} />

<!-- ✅ 良い例：デバウンスで最適化 -->
<script>
  import { debounce } from 'lodash-es';

  const handleResize = debounce(() => {
    updateLayout();
  }, 100);
</script>

<svelte:window onresize={handleResize} />
```

### 3. SEOとアクセシビリティ

```svelte
<!-- ✅ 良い例：適切なメタタグ -->
<svelte:head>
  <title>{pageTitle} | サイト名</title>
  <meta name="description" content={description} />
  <meta property="og:title" content={pageTitle} />
  <meta property="og:image" content={ogImage} />
  <link rel="canonical" href={canonicalUrl} />

  <!-- プリロード最適化 -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preload" href="/fonts/main.woff2" as="font" type="font/woff2" crossorigin />
</svelte:head>
```

### 4. エラーバウンダリの配置

```svelte
<!-- アプリケーションレベル -->
<svelte:boundary>
  <Router />
  {#snippet failed(error)}
    <CriticalError {error} />
  {/snippet}
</svelte:boundary>

<!-- コンポーネントレベル -->
<svelte:boundary>
  <DataTable {data} />
  {#snippet failed(error)}
    <TableError {error} />
  {/snippet}
</svelte:boundary>
```

## レガシー要素

以下の要素はSvelte 5でレガシー機能となりました。既存のコードとの互換性のためにサポートされていますが、新しいプロジェクトでは代替方法を使用することを推奨します。

### `svelte:fragment` - グループ化要素（レガシー）

<Admonition type="warning" title="Svelte 5での変更">

`&lt;svelte:fragment&gt;`はSvelte 5でレガシー機能となりました。Svelte 5のSnippetsは自動的に余計なラッパー要素を作らないため、この要素は不要になりました。

</Admonition>
`&lt;svelte:fragment&gt;`は、DOM要素を追加せずに複数の要素をグループ化できる要素でした。以下は従来の使用例です。

```svelte
<script lang="ts">
  let items = $state([
    { id: 1, name: 'Item 1', description: 'Description 1' },
    { id: 2, name: 'Item 2', description: 'Description 2' },
    { id: 3, name: 'Item 3', description: 'Description 3' }
  ]);
</script>

<!-- keyedリストでfragmentを使用 -->
<dl>
  {#each items as item (item.id)}
    <svelte:fragment>
      <dt>{item.name}</dt>
      <dd>{item.description}</dd>
    </svelte:fragment>
  {/each}
</dl>

<!-- スロットでfragmentを使用 -->
<Layout>
  <svelte:fragment slot="header">
    <h1>タイトル</h1>
    <nav>ナビゲーション</nav>
  </svelte:fragment>

  <svelte:fragment slot="content">
    <p>コンテンツ1</p>
    <p>コンテンツ2</p>
  </svelte:fragment>
</Layout>
```

### `svelte:component` - 動的コンポーネント（レガシー）

:::caution[Runes モードでは非推奨]
`<svelte:component>` は **Svelte 5 の Runes モードでは非推奨**です。Runes モードでは、`Component` 変数を直接書くだけで、変数が変わると自動で再レンダリングされるため、この要素は不要になりました。新規コードでは使わず、`{#if}` / `{#each}` の中で **コンポーネント変数を直接** 参照してください。
:::

#### Svelte 5 での推奨方法（変数を直接使用）

```svelte
<script lang="ts">
  import ComponentA from './ComponentA.svelte';
  import ComponentB from './ComponentB.svelte';
  import type { Component } from 'svelte';

  // Svelte 5 では `Component` 型を使う（`ComponentType` は legacy）
  let CurrentComponent = $state<Component<{ message: string }>>(ComponentA);
  let componentProps = $state({ message: 'Hello!' });

  function toggle() {
    CurrentComponent = CurrentComponent === ComponentA ? ComponentB : ComponentA;
  }
</script>

<button onclick={toggle}>切り替え</button>

<!-- 変数を大文字始まりにすればそのままタグとして書ける -->
<CurrentComponent {...componentProps} />

<!-- 条件分岐の中でも同じ書き方ができる -->
{#if CurrentComponent}
  <CurrentComponent {...componentProps} />
{/if}

<!-- each ループでも同様（キーには `Item` 自体を渡せる） -->
{#each [ComponentA, ComponentB] as Item (Item)}
  <Item message="Hello!" />
{/each}
```

#### レガシーモードでの使用（互換性のため）

`&lt;svelte:component&gt;`は、レガシーモードや既存コードとの互換性のために引き続き利用可能です。

```svelte
<script lang="ts">
  import ComponentA from './ComponentA.svelte';
  import ComponentB from './ComponentB.svelte';
  import ComponentC from './ComponentC.svelte';
  import type { ComponentType } from 'svelte';

  let selectedComponent = $state<ComponentType>(ComponentA);
  let componentProps = $state({ message: 'Hello!' });

  const components = [
    { name: 'Component A', component: ComponentA },
    { name: 'Component B', component: ComponentB },
    { name: 'Component C', component: ComponentC }
  ];
</script>

<select bind:value={selectedComponent}>
  {#each components as { name, component } (name)}
    <option value={component}>{name}</option>
  {/each}
</select>

<!-- 動的にコンポーネントを切り替え -->
<svelte:component this={selectedComponent} {...componentProps} />

<!-- 条件付きレンダリング -->
{#if selectedComponent}
  <svelte:component this={selectedComponent} {...componentProps} />
{:else}
  <p>コンポーネントが選択されていません</p>
{/if}
```

### `svelte:self` - 再帰的コンポーネント（レガシー）

<Admonition type="warning" title="Svelte 5での変更">

`&lt;svelte:self&gt;`はSvelte 5でレガシー機能となりました。代わりにコンポーネント自体をimportして使用することが推奨されています。

</Admonition>

#### Svelte 5での推奨方法

```svelte
<!-- TreeNode.svelte -->
<script lang="ts">
  import TreeNode from './TreeNode.svelte'; // 自分自身をimport

  type TreeNodeData = {
    name: string;
    children?: TreeNodeData[];
  };

  let { node }: { node: TreeNodeData } = $props();
  let expanded = $state(false);
</script>

<div class="tree-node">
  <button onclick={() => expanded = !expanded}>
    {expanded ? '▼' : '▶'} {node.name}
  </button>

  {#if expanded && node.children}
    <ul>
      {#each node.children as child (child.id)}
        <li>
          <!-- 自分自身を直接使用 -->
          <TreeNode node={child} />
        </li>
      {/each}
    </ul>
  {/if}
</div>
```

#### レガシーモードでの使用（互換性のため）

`&lt;svelte:self&gt;`は、レガシーモードや既存コードとの互換性のために引き続き利用可能です。

```svelte
<!-- TreeNode.svelte -->
<script lang="ts">
  type TreeNode = {
    name: string;
    children?: TreeNode[];
  };

  let { node }: { node: TreeNode } = $props();
  let expanded = $state(false);
</script>

<div class="tree-node">
  <button
    class="toggle-btn"
    onclick={() => expanded = !expanded}
    disabled={!node.children?.length}
  >
    {#if node.children?.length}
      {expanded ? '▼' : '▶'}
    {:else}
      ○
    {/if}
    {node.name}
  </button>

  {#if expanded && node.children}
    <ul class="children">
      {#each node.children as child (child.id)}
        <li>
          <!-- 自分自身を再帰的にレンダリング -->
          <svelte:self node={child} />
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .tree-node {
    margin-left: 1rem;
  }
  .toggle-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.25rem 0.5rem;
    text-align: left;
  }
  .children {
    list-style: none;
    padding-left: 0;
  }
</style>
```

## まとめ

Svelteの特別な要素は、通常のHTML要素では実現できない高度な機能を提供します。

**現在推奨される要素：**

- **動的制御**: `&lt;svelte:element&gt;`
- **グローバルイベント**: `&lt;svelte:window&gt;`、`&lt;svelte:body&gt;`、`&lt;svelte:document&gt;`
- **メタ情報**: `&lt;svelte:head&gt;`
- **エラー処理**: `&lt;svelte:boundary&gt;`
- **設定**: `&lt;svelte:options&gt;`

**レガシー要素（Svelte 5では代替方法を推奨）：**

- **`&lt;svelte:component&gt;`**: コンポーネント変数で自動再レンダリング
- **`&lt;svelte:fragment&gt;`**: Snippetsは自動的にラッパー要素を作らない
- **`&lt;svelte:self&gt;`**: コンポーネント自体をimportして使用

これらの要素を適切に使用することで、より柔軟で堅牢なアプリケーションを構築できます。

<Admonition type="info" title="関連リンク">

<ul>
<li><a href="{base}/svelte/basics/template-syntax/">テンプレート構文</a> - 基本的なテンプレート機能</li>
<li><a href="{base}/svelte/basics/component-basics/">コンポーネントの基本</a> - コンポーネントの基礎</li>
<li><a href="{base}/svelte/basics/component-lifecycle/">コンポーネントライフサイクル</a> - ライフサイクルイベント</li>
</ul>

</Admonition>
次は[コンポーネントライフサイクル](/svelte/basics/component-lifecycle/)で、コンポーネントの生成から破棄までの流れについて学びましょう。
