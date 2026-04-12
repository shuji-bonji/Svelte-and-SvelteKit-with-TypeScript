---
title: Shallow routing - 履歴駆動のUI
description: SvelteKitのShallow routingでモーダルやダイアログをブラウザ履歴と連動。pushState/replaceStateによる履歴エントリ作成、preloadDataでのデータプリロードをTypeScriptで解説
---

<script>
	import Admonition from '$lib/components/Admonition.svelte';
  import Mermaid from '$lib/components/Mermaid.svelte';

  const shallowRoutingDiagram = `flowchart TB
    subgraph old[従来のモーダル - 履歴なし]
        direction TB
        O1[1. モーダルを開く] --> O2[2. スワイプで戻る]
        O2 --> O3["3. 前のページに移動してしまう"]
    end

    subgraph shallow[Shallow routing - 履歴あり]
        direction TB
        S1["1. モーダルを開く → 履歴エントリを作成"] --> S2[2. スワイプで戻る]
        S2 --> S3["3. モーダルが閉じる"]
    end

    style old fill:#ffebee,color:#333
    style shallow fill:#e8f5e9,color:#333
    style O1 fill:#fff,color:#333
    style O2 fill:#fff,color:#333
    style O3 fill:#ffcdd2,color:#333
    style S1 fill:#fff,color:#333
    style S2 fill:#fff,color:#333
    style S3 fill:#c8e6c9,color:#333`;
</script>

Shallow routing は、実際のページ遷移を行わずにブラウザの履歴エントリを作成する機能です。
モーダルダイアログやギャラリーなど、「戻る」ボタンで閉じられる UI を実装する際に非常に便利です。

## この記事で学べること

- Shallow routing の基本概念と用途
- `pushState` / `replaceState` の使い方
- 型安全な `App.PageState` の定義
- `preloadData` を使ったデータのプリロード
- 実践的なモーダル実装パターン

## なぜ Shallow routing が必要か

モバイルデバイスでは、スワイプジェスチャーで「戻る」操作を行うことが一般的です。
履歴エントリに関連付けられていないモーダルは、ユーザーがスワイプで閉じようとすると予期しないページに移動してしまい、フラストレーションの原因になります。

<Mermaid diagram={shallowRoutingDiagram} />

## 基本的な使い方

Shallow routing の基本的な実装方法を説明します。`pushState` でモーダルを開き、`history.back()` で閉じるパターンが最も一般的です。

### pushState でモーダルを開く

`pushState` を使用すると、現在の URL を維持しつつ、新しい履歴エントリと状態を追加できます。以下の例では、モーダルの表示状態を履歴に関連付けています。

```svelte
<script lang="ts">
  import { pushState } from '$app/navigation';
  import { page } from '$app/state';
  import Modal from './Modal.svelte';

  function showModal() {
    // 現在のURLを維持しつつ、状態を履歴に追加
    pushState('', {
      showModal: true
    });
  }
</script>

<button onclick={showModal}>
  モーダルを開く
</button>

{#if page.state.showModal}
  <Modal close={() => history.back()} />
{/if}
```

このコードのポイントは以下の通りです。

- **pushState の第1引数**: 空文字列を指定すると、現在の URL を維持します
- **pushState の第2引数**: `page.state` に保存される状態オブジェクトです
- **history.back()**: ブラウザの「戻る」機能を使用してモーダルを閉じます

### Modal コンポーネントの例

アクセシビリティに配慮した基本的なモーダルコンポーネントの実装例です。`role="dialog"` と `aria-modal="true"` を指定し、背景クリックやスワイプジェスチャーで閉じられるようにしています。

```svelte
<!-- Modal.svelte -->
<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    close,
    children
  }: {
    close: () => void;
    children?: Snippet;
  } = $props();
</script>

<div class="modal-backdrop" onclick={close} role="presentation">
  <div
    class="modal-content"
    onclick={(e) => e.stopPropagation()}
    role="dialog"
    aria-modal="true"
  >
    <button class="close-button" onclick={close} aria-label="閉じる">
      ✕
    </button>
    {@render children?.()}
  </div>
</div>

<style>
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal-content {
    background: white;
    border-radius: 8px;
    padding: 2rem;
    max-width: 90vw;
    max-height: 90vh;
    overflow: auto;
    position: relative;
  }

  .close-button {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
  }
</style>
```

## API

Shallow routing で使用する主要な API を説明します。どちらも `$app/navigation` からインポートして使用します。

### pushState

`pushState` は新しい履歴エントリを作成し、ページ状態を保存します。「戻る」ボタンで元の状態に戻れます。

```typescript
import { pushState } from '$app/navigation';

// 第1引数: 新しいURL（現在のURLからの相対パス）
// 第2引数: ページ状態オブジェクト
pushState('/photos/123', { showDetail: true });

// 現在のURLを維持する場合は空文字列
pushState('', { showModal: true });
```

### replaceState

`replaceState` は新しい履歴エントリを作成せず、現在のエントリを置き換えます。タブの切り替えなど、「戻る」で元に戻す必要がない状態更新に適しています。

```typescript
import { replaceState } from '$app/navigation';

// 履歴を増やさずに状態を更新
replaceState('', {
  showModal: true,
  selectedTab: 'details',
});
```

<Admonition type="tip" title="pushState vs replaceState">
<ul>
<li><strong>pushState</strong>: 新しい履歴エントリを作成（「戻る」で元に戻れる）</li>
<li><strong>replaceState</strong>: 現在の履歴エントリを置き換え（「戻る」で前のページに戻る）</li>
</ul>

</Admonition>

## 型安全な PageState の定義

TypeScript を使用する場合、`App.PageState` インターフェースを定義することで、`page.state` を型安全に扱えます。これにより、存在しないプロパティへのアクセスがコンパイル時に検出されます。

`src/app.d.ts` に以下のように型定義を追加します。

```typescript
// src/app.d.ts
declare global {
  namespace App {
    interface PageState {
      showModal?: boolean;
      selectedPhotoId?: string;
      selectedTab?: 'overview' | 'details' | 'comments';
    }
  }
}

export {};
```

これにより、`page.state` へのアクセスが型チェックされます。

```svelte
<script lang="ts">
  import { page } from '$app/state';

  // page.state.showModal は boolean | undefined 型
  // page.state.unknownProp はコンパイルエラー
</script>
```

## 別ルートのデータをプリロードする

Shallow routing の強力な使い方として、別のページのコンポーネントを現在のページ内でレンダリングすることができます。`preloadData` 関数を使用すると、ターゲットページの load 関数を実行し、そのデータを現在のページで使用できます。

### 画像ギャラリーの例

画像一覧から詳細をモーダルで表示する実装例です。デスクトップではモーダル表示、モバイルでは通常のページ遷移を行うレスポンシブな設計になっています。

```svelte
<!-- src/routes/photos/+page.svelte -->
<script lang="ts">
  import { preloadData, pushState, goto } from '$app/navigation';
  import { page } from '$app/state';
  import Modal from './Modal.svelte';
  import PhotoPage from './[id]/+page.svelte';
  import type { PageProps } from './$types';

  let { data }: PageProps = $props();
</script>

{#each data.thumbnails as thumbnail}
  <a
    href="/photos/{thumbnail.id}"
    data-sveltekit-preload-data
    onclick={async (e) => {
      // 小さい画面、新しいウィンドウ/タブの場合は通常のナビゲーション
      if (
        innerWidth < 640 ||
        e.shiftKey ||
        e.metaKey || e.ctrlKey
      ) return;

      e.preventDefault();

      const { href } = e.currentTarget;

      // Load関数の結果を取得（プリロード済みの場合は再利用）
      const result = await preloadData(href);

      if (result.type === 'loaded' && result.status === 200) {
        // 履歴にデータを保存してモーダル表示
        pushState(href, { selected: result.data });
      } else {
        // エラー時は通常のナビゲーション
        goto(href);
      }
    }}
  >
    <img alt={thumbnail.alt} src={thumbnail.src} />
  </a>
{/each}

{#if page.state.selected}
  <Modal onclose={() => history.back()}>
    <!-- +page.svelte にデータを渡す -->
    <PhotoPage data={page.state.selected} />
  </Modal>
{/if}
```

このコードの主要なポイントを解説します。

- **data-sveltekit-preload-data**: ホバー時にデータをプリロードし、クリック時の応答を高速化
- **画面サイズ判定**: `innerWidth < 640` でモバイルかどうかを判定
- **修飾キーの処理**: Shift、Ctrl、Meta キーが押されている場合は通常のナビゲーション
- **preloadData**: load 関数の結果をキャッシュから取得（プリロード済みの場合）
- **エラーハンドリング**: データ取得に失敗した場合は通常のページ遷移にフォールバック

### app.d.ts の型定義

画像詳細ページのデータ型を `PageState` に追加することで、`page.state.selected` の型が正しく推論されます。

```typescript
// src/app.d.ts
import type { PageProps as PhotoPageProps } from './routes/photos/[id]/$types';

declare global {
  namespace App {
    interface PageState {
      selected?: PhotoPageProps;
    }
  }
}

export {};
```

## 実践例：商品詳細モーダル

EC サイトで商品一覧から詳細をモーダルで表示する実践的な例です。モバイルデバイスでは通常のページ遷移を行い、デスクトップではモーダル表示することで、それぞれのデバイスに最適化された UX を提供します。

```svelte
<!-- src/routes/products/+page.svelte -->
<script lang="ts">
  import { preloadData, pushState, goto } from '$app/navigation';
  import { page } from '$app/state';
  import ProductModal from '$lib/components/ProductModal.svelte';
  import ProductDetail from './[slug]/+page.svelte';
  import type { PageProps } from './$types';

  let { data }: PageProps = $props();

  async function openProduct(e: MouseEvent, slug: string) {
    // モバイルや修飾キー押下時は通常ナビゲーション
    if (innerWidth < 768 || e.metaKey || e.ctrlKey || e.shiftKey) {
      return;
    }

    e.preventDefault();

    const href = `/products/${slug}`;
    const result = await preloadData(href);

    if (result.type === 'loaded' && result.status === 200) {
      pushState(href, {
        productData: result.data,
        fromList: true
      });
    } else {
      goto(href);
    }
  }
</script>

<h1>商品一覧</h1>

<div class="product-grid">
  {#each data.products as product}
    <a
      href="/products/{product.slug}"
      data-sveltekit-preload-data="hover"
      onclick={(e) => openProduct(e, product.slug)}
      class="product-card"
    >
      <img src={product.image} alt={product.name} />
      <h2>{product.name}</h2>
      <p class="price">¥{product.price.toLocaleString()}</p>
    </a>
  {/each}
</div>

{#if page.state.productData}
  <ProductModal onclose={() => history.back()}>
    <ProductDetail data={page.state.productData} />
  </ProductModal>
{/if}
```

## 注意事項

Shallow routing を使用する際に注意すべき点をまとめます。

### SSR での動作

サーバーサイドレンダリング中、`page.state` は常に空のオブジェクトです。これは、履歴状態がブラウザ固有の機能であるためです。
また、ユーザーが最初にアクセスしたページでも同様です。

```svelte
<script lang="ts">
  import { page } from '$app/state';
  import { browser } from '$app/environment';

  // SSR中やページリロード時は page.state は空
  // ナビゲーションが発生するまで状態は適用されない
</script>

{#if browser && page.state.showModal}
  <!-- クライアントサイドでのみ表示 -->
  <Modal />
{/if}
```

### JavaScript が無効な場合

Shallow routing は JavaScript を必要とする機能です。
JavaScript が無効な場合でも適切に動作するフォールバックを検討してください。

```svelte
<script lang="ts">
  import { browser } from '$app/environment';
</script>

<!-- JavaScript無効時は通常のリンクとして機能 -->
<a
  href="/photos/{photo.id}"
  onclick={browser ? handleShallowNav : undefined}
>
  <img src={photo.thumbnail} alt={photo.title} />
</a>
```

### 状態の永続化について

`page.state` はブラウザのセッション履歴に保存されますが、以下の点に注意してください。

- ページをリロードすると状態は失われる
- 別のドキュメント（外部サイト）から戻ってきた場合も状態は適用されない
- 大きなオブジェクトを状態に保存すると、パフォーマンスに影響する可能性がある

## まとめ

Shallow routing を使用すると、ユーザー体験を大幅に向上させることができます。

- **モーダル/ダイアログ**: 「戻る」ボタンで閉じられる
- **画像ギャラリー**: URL を変更しながらモーダル表示
- **タブ切り替え**: 履歴に残るタブナビゲーション
- **フィルター/ソート**: 状態を URL に反映

特にモバイルデバイスでは、スワイプジェスチャーとの相性が良く、ネイティブアプリのような操作感を実現できます。

## 次のステップ

- [Link options](/sveltekit/routing/link-options/) - プリロード最適化
- [動的ルーティング](/sveltekit/routing/dynamic/) - 動的パラメータ
- [状態管理パターン](/sveltekit/application/state-management/) - グローバル状態管理
