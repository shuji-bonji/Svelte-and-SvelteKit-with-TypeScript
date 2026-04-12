---
title: Link options - リンクのカスタマイズ
description: SvelteKitのlink optionsでプリロード、履歴、スクロール動作を最適化。data-sveltekit属性によるナビゲーション制御をTypeScriptで解説
---

<script>
  import Mermaid from '$lib/components/Mermaid.svelte';

  const preloadDiagram = `sequenceDiagram
    participant U as ユーザー
    participant B as ブラウザ
    participant S as サーバー

    rect rgba(255, 235, 238, 0.3)
        Note over U,S: 通常のナビゲーション
        U->>B: クリック
        B->>S: コード読み込み
        S-->>B: コード
        B->>S: データ取得
        S-->>B: データ
        B->>U: 表示（待ち時間あり）
    end

    rect rgba(232, 245, 233, 0.3)
        Note over U,S: プリロードあり
        U->>B: ホバー
        B->>S: コード＋データを事前取得
        S-->>B: コード＋データ
        U->>B: クリック
        B->>U: 即座に表示
    end`;
</script>

SvelteKit では、標準の `<a>` 要素を使用してページ間をナビゲートします。
`data-sveltekit-*` 属性を使うことで、プリロード、履歴管理、スクロール動作などをカスタマイズできます。

## この記事で学べること

- プリロード属性（`data-sveltekit-preload-data`、`data-sveltekit-preload-code`）
- 履歴操作（`data-sveltekit-replacestate`）
- スクロール制御（`data-sveltekit-noscroll`、`data-sveltekit-keepfocus`）
- フルページリロード（`data-sveltekit-reload`）

## 属性の適用範囲

`data-sveltekit-*` 属性は、`<a>` 要素自体、または親要素に適用できます。
`method="GET"` の `<form>` 要素にも適用されます。親要素に設定した属性は、その子孫のすべてのリンクに継承されるため、ナビゲーションバー全体に一括で設定することも可能です。

```html
<!-- 個別のリンクに適用 -->
<a data-sveltekit-preload-data="hover" href="/about">About</a>

<!-- 親要素に適用（子孫のすべてのリンクに影響） -->
<nav data-sveltekit-preload-data="hover">
  <a href="/home">Home</a>
  <a href="/about">About</a>
  <a href="/contact">Contact</a>
</nav>
```

## data-sveltekit-preload-data

リンクのホバーやタップ時に、事前にデータを読み込む（プリロード）ことで、ナビゲーションを高速化します。

### 動作の仕組み

<Mermaid diagram={preloadDiagram} />

### hover（デフォルト）

マウスがリンク上で止まった時、またはモバイルで `touchstart` が発生した時にプリロードを開始します。SvelteKit のデフォルトテンプレートでは、`body` 要素に `hover` が設定されており、サイト全体のリンクがホバー時にプリロードされます。

```html
<!-- デフォルトテンプレートでは body に設定されている -->
<body data-sveltekit-preload-data="hover">
  <div style="display: contents">%sveltekit.body%</div>
</body>
```

### tap

`touchstart` または `mousedown` イベント時にプリロードを開始します。
データが頻繁に更新される場合や、ホバーによる誤ったプリロードを避けたい場合に使用します。

```html
<!-- リアルタイムデータを表示するページへのリンク -->
<a data-sveltekit-preload-data="tap" href="/stocks">
  最新の株価を見る
</a>
```

### プログラマティックなプリロード

`$app/navigation` の `preloadData` 関数を使うと、属性ではなく JavaScript から任意のタイミングでプリロードを実行できます。例えば、検索入力フィールドにフォーカスした時に検索結果ページをプリロードする、といった実装が可能です。

```svelte
<script lang="ts">
  import { preloadData } from '$app/navigation';

  function handleFocus() {
    // フォーカス時にプリロード
    preloadData('/target-page');
  }
</script>

<input onfocus={handleFocus} placeholder="検索..." />
```

### データ節約モードへの配慮

ユーザーが `navigator.connection.saveData` を有効にしている場合、プリロードは自動的に無効化されます。

## data-sveltekit-preload-code

データのプリロードが不要でも、コード（JavaScript/CSS）のみを事前に読み込むことで高速化できます。データは変更される可能性が高いが、コードは変わらない場合に有効です。4つの積極性レベルがあり、用途に応じて選択できます。

### 積極性のレベル

各レベルは、プリロードが開始されるタイミングを制御します。

| 値 | 説明 | 用途 |
|---|---|---|
| `eager` | 即座にプリロード | メインナビゲーション |
| `viewport` | ビューポートに入ったらプリロード | 一覧ページのリンク |
| `hover` | ホバー時にプリロード | 一般的なリンク |
| `tap` | タップ時にプリロード | データ節約重視 |

```html
<!-- 即座にコードをプリロード -->
<nav data-sveltekit-preload-code="eager">
  <a href="/dashboard">Dashboard</a>
  <a href="/settings">Settings</a>
</nav>

<!-- ビューポートに入ったらプリロード -->
<ul data-sveltekit-preload-code="viewport">
  {#each items as item}
    <li><a href="/items/{item.id}">{item.name}</a></li>
  {/each}
</ul>
```

:::warning[viewport と eager の制限]
`viewport` と `eager` は、ナビゲーション直後に DOM に存在するリンクにのみ適用されます。
後から追加されたリンク（`{#if}` ブロック内など）は `hover` または `tap` でトリガーされます。
:::

### preload-data との関係

コードのプリロードは、データのプリロードの前提条件です。データをプリロードするには、まずコードが読み込まれている必要があるためです。そのため、`data-sveltekit-preload-code` は、`data-sveltekit-preload-data` よりも積極的な値を指定した場合のみ効果があります。

```html
<!-- 効果あり: コードは即座に、データはホバー時に -->
<a
  data-sveltekit-preload-code="eager"
  data-sveltekit-preload-data="hover"
  href="/page"
>
  Link
</a>

<!-- 効果なし: データが hover なのでコードも hover になる -->
<a
  data-sveltekit-preload-code="tap"
  data-sveltekit-preload-data="hover"
  href="/page"
>
  Link
</a>
```

## data-sveltekit-reload

SvelteKit のクライアントサイドナビゲーションを使用せず、ブラウザにフルページリロードを行わせます。通常 SvelteKit は、ページ遷移を JavaScript で処理してスムーズなトランジションを実現しますが、この属性を使うと従来の HTML リンクのように動作します。

```html
<!-- フルページリロードを強制 -->
<a data-sveltekit-reload href="/legacy-page">
  レガシーページ
</a>

<!-- rel="external" でも同じ効果 -->
<a rel="external" href="/external-app">
  外部アプリ
</a>
```

### 使用シーン

- レガシーページとの統合
- 別のフレームワークで構築されたページへのリンク
- 認証後の完全なリロードが必要な場合

## data-sveltekit-replacestate

ナビゲーション時に新しい履歴エントリを作成せず、現在のエントリを置き換えます。通常、リンクをクリックすると履歴スタックに新しいエントリが追加されますが、この属性を使うと「戻る」ボタンで前のページに直接戻れます。フィルターやソートの変更など、論理的に同じページを表示する場合に適しています。

```html
<!-- 履歴を増やさない -->
<a data-sveltekit-replacestate href="/step-2">
  次のステップへ
</a>
```

### 使用シーン

以下の例は、フィルタータブの実装です。「すべて」「アクティブ」「完了」の切り替えで URL が変化しますが、履歴には追加されません。

```svelte
<script lang="ts">
  // フィルター変更時に履歴を増やさない
  let filter = $state('all');
</script>

<nav>
  <a
    data-sveltekit-replacestate
    href="?filter=all"
    class:active={filter === 'all'}
  >
    すべて
  </a>
  <a
    data-sveltekit-replacestate
    href="?filter=active"
    class:active={filter === 'active'}
  >
    アクティブ
  </a>
  <a
    data-sveltekit-replacestate
    href="?filter=completed"
    class:active={filter === 'completed'}
  >
    完了
  </a>
</nav>
```

## data-sveltekit-keepfocus

ナビゲーション後もフォーカスを維持します。
検索フォームなど、入力中にナビゲーションが発生する場合に便利です。

```html
<!-- フォーカスを維持する検索フォーム -->
<form data-sveltekit-keepfocus action="/search">
  <input type="text" name="q" placeholder="検索..." />
</form>
```

:::warning[アクセシビリティへの配慮]
`<a>` 要素にはこの属性を使用しないでください。
スクリーンリーダーユーザーは、ナビゲーション後にフォーカスが移動することを期待しています。
また、ナビゲーション後に要素が存在しなくなる場合は使用しないでください。
:::

## data-sveltekit-noscroll

ナビゲーション後のスクロール位置を維持します。
通常、SvelteKit は新しいページの先頭（0, 0）にスクロールします。

```html
<!-- スクロール位置を維持 -->
<a data-sveltekit-noscroll href="/same-page-section">
  同じセクション内のリンク
</a>
```

### 使用シーン

- タブ切り替えのようなUI
- 同一ページ内での部分的な更新
- 無限スクロールのページネーション

## オプションの無効化

親要素で有効にした属性を、子要素で `false` を指定して無効化できます。これにより、特定のリンクだけ異なる動作をさせることができます。

```html
<div data-sveltekit-preload-data="hover">
  <!-- プリロードされる -->
  <a href="/a">A</a>
  <a href="/b">B</a>

  <div data-sveltekit-preload-data="false">
    <!-- プリロードされない -->
    <a href="/c">C</a>
    <a href="/d">D</a>
  </div>
</div>
```

### 条件付きの適用

```svelte
<script lang="ts">
  let { shouldPreload }: { shouldPreload: boolean } = $props();
</script>

<a
  data-sveltekit-preload-data={shouldPreload ? 'hover' : false}
  href="/page"
>
  条件付きプリロード
</a>
```

## 実践例

ここからは、link options を活用した実践的な実装例を紹介します。

### ナビゲーションバー

メインナビゲーションでは、コードを即座にプリロードし、ホバー時にデータをプリロードする組み合わせが効果的です。

```svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { page } from '$app/state';

  let { children }: { children: Snippet } = $props();

  const navItems = [
    { href: '/', label: 'ホーム' },
    { href: '/products', label: '商品' },
    { href: '/about', label: '会社概要' },
    { href: '/contact', label: 'お問い合わせ' }
  ];
</script>

<nav data-sveltekit-preload-code="eager">
  {#each navItems as item}
    <a
      href={item.href}
      class:active={page.url.pathname === item.href}
      data-sveltekit-preload-data="hover"
    >
      {item.label}
    </a>
  {/each}
</nav>

<main>
  {@render children()}
</main>
```

### 検索フォーム

検索入力中にリアルタイムで結果を更新する場合、`keepfocus`（フォーカス維持）、`replacestate`（履歴を増やさない）、`noscroll`（スクロール位置維持）を組み合わせます。

```svelte
<script lang="ts">
  import { goto } from '$app/navigation';

  let query = $state('');
  let debounceTimer: ReturnType<typeof setTimeout>;

  function handleInput() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      if (query) {
        goto(`/search?q=${encodeURIComponent(query)}`);
      }
    }, 300);
  }
</script>

<form
  data-sveltekit-keepfocus
  data-sveltekit-replacestate
  data-sveltekit-noscroll
>
  <input
    type="search"
    name="q"
    bind:value={query}
    oninput={handleInput}
    placeholder="検索..."
  />
</form>
```

### 商品一覧

商品一覧ページでは、ビューポートに入った時点でコードをプリロードし、ホバー時にデータをプリロードします。スクロールしながら多くの商品を見るユーザーのために最適化されています。

```svelte
<script lang="ts">
  import type { PageProps } from './$types';

  let { data }: PageProps = $props();
</script>

<div class="product-grid" data-sveltekit-preload-code="viewport">
  {#each data.products as product}
    <a
      href="/products/{product.slug}"
      data-sveltekit-preload-data="hover"
      class="product-card"
    >
      <img src={product.image} alt={product.name} />
      <h3>{product.name}</h3>
      <p class="price">¥{product.price.toLocaleString()}</p>
    </a>
  {/each}
</div>
```

### タブインターフェース

タブ切り替えは URL パラメータで管理しつつ、履歴を増やさず、スクロール位置も維持するのが一般的です。これにより、ページ内での切り替えが自然に感じられます。

```svelte
<script lang="ts">
  import { page } from '$app/state';

  const tabs = [
    { id: 'overview', label: '概要' },
    { id: 'specs', label: '仕様' },
    { id: 'reviews', label: 'レビュー' }
  ];

  let currentTab = $derived(
    page.url.searchParams.get('tab') || 'overview'
  );
</script>

<div class="tabs">
  {#each tabs as tab}
    <a
      href="?tab={tab.id}"
      class:active={currentTab === tab.id}
      data-sveltekit-replacestate
      data-sveltekit-noscroll
    >
      {tab.label}
    </a>
  {/each}
</div>

<div class="tab-content">
  {#if currentTab === 'overview'}
    <p>概要の内容...</p>
  {:else if currentTab === 'specs'}
    <p>仕様の内容...</p>
  {:else if currentTab === 'reviews'}
    <p>レビューの内容...</p>
  {/if}
</div>
```

## 属性一覧

| 属性 | 値 | 説明 |
|---|---|---|
| `data-sveltekit-preload-data` | `hover`, `tap`, `false` | データのプリロードタイミング |
| `data-sveltekit-preload-code` | `eager`, `viewport`, `hover`, `tap`, `false` | コードのプリロードタイミング |
| `data-sveltekit-reload` | （なし） | フルページリロードを強制 |
| `data-sveltekit-replacestate` | （なし） | 履歴を置き換え |
| `data-sveltekit-keepfocus` | （なし） | フォーカスを維持 |
| `data-sveltekit-noscroll` | （なし） | スクロール位置を維持 |

## まとめ

Link options を適切に使用することで、以下のことが実現できます。

- **高速なナビゲーション**: プリロードによる待ち時間の削減
- **適切な履歴管理**: フィルターやタブでの履歴制御
- **スムーズなUX**: スクロールやフォーカスの最適化
- **データ節約への配慮**: ユーザー設定の尊重

これらの属性を組み合わせることで、ユーザー体験を大幅に向上させることができます。

## 次のステップ

- [Shallow routing](/sveltekit/routing/shallow/) - 履歴駆動のUI
- [高度なルーティング](/sveltekit/routing/advanced/) - ルーティングの詳細
- [パフォーマンス最適化](/sveltekit/optimization/performance/) - 全体的な最適化
