---
title: 特別な要素
description: Svelte5の特別な要素（svelte:element、svelte:window、svelte:boundaryなど）をTypeScriptで活用。動的要素作成、イベントバインディング、エラー処理の実装パターンを解説
---

Svelteには、`svelte:`プレフィックスを持つ特別な要素があります。これらは通常のHTML要素ではなく、Svelteコンパイラによって特別に処理される要素で、動的な要素作成、グローバルイベントの処理、エラーハンドリングなど、高度な機能を提供します。

## 特別な要素一覧

Svelteが提供する特別な要素は以下の通りです。

### 現在も推奨される要素

| 要素 | 用途 | 主な使用場面 |
|-----|------|------------|
| [`svelte:element`](#sveltelement---動的要素の作成) | タグを動的に決定 | 権限に応じた要素の切り替え、CMSコンテンツ |
| [`svelte:window`](#sveltewindow---ウィンドウイベントのバインディング) | windowイベント・プロパティ | スクロール位置、リサイズ、キーボードショートカット |
| [`svelte:document`](#sveltedocument---document要素へのイベントバインディング) | documentイベント・プロパティ | ページ表示状態、テキスト選択、フルスクリーン |
| [`svelte:body`](#sveltebody---body要素へのイベントバインディング) | bodyイベント | マウストラッキング、ドラッグ&ドロップ |
| [`svelte:head`](#sveltehead---head要素への要素追加) | `<head>`に要素を追加 | SEO、メタタグ、外部リソース |
| [`svelte:options`](#svelteoptions---コンポーネントオプション) | コンパイラオプション | Web Components、不変性、名前空間 |
| [`svelte:boundary`](#svelteboundary---エラーバウンダリ) | エラーのキャッチ | エラーハンドリング、フォールバックUI |

### レガシー要素（Svelte 5では代替方法を推奨）

| 要素 | 状態 | 代替方法 |
|-----|------|--------|
| [`svelte:component`](#sveltecomponent---動的コンポーネント-レガシー) | レガシー | Runesモードでは通常のコンポーネント変数で自動的に再レンダリング |
| [`svelte:fragment`](#sveltefragment---グループ化要素-レガシー) | レガシー | Svelte 5のSnippetsは余計なラッパー要素を作らない |
| [`svelte:self`](#svelteself---再帰的コンポーネント-レガシー) | レガシー | コンポーネント自体をimportして使用 |

:::tip[使い分けのポイント]
- **DOM操作系**: `svelte:window`、`svelte:document`、`svelte:body`、`svelte:head`
- **動的制御系**: `svelte:element`
- **設定系**: `svelte:options`、`svelte:boundary`
:::

:::warning[Svelte 5での重要な変更]
Svelte 5では、`svelte:component`、`svelte:fragment`、`svelte:self`はレガシー機能となりました。新しいプロジェクトではこれらの代替方法を使用することを推奨します。
:::

## `svelte:element` - 動的要素の作成

`<svelte:element>`は、実行時に要素のタグを動的に決定できる特別な要素です。ユーザーの権限やコンテンツタイプに応じて、異なるHTML要素を使い分ける場合に便利です。

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
    {#each tags as t}
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
  
  <div style="margin-top: 1rem; color: #333;　padding: 0.5rem; background: #e8f5e9; border-radius: 4px;　">
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

`<svelte:window>`は、windowオブジェクトのイベントやプロパティにバインドできる特別な要素です。スクロール位置、ウィンドウサイズ、キーボードイベントなどを簡単に扱えます。

```svelte live
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

### レスポンシブデザインの実装例

```svelte
<script lang="ts">
  let innerWidth = $state(0);
  
  let screenSize = $derived(() => {
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

`<svelte:body>`は、body要素のイベントにバインドできます。マウストラッキングやドラッグ&ドロップなど、ページ全体での操作を扱う際に使用します。

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

`<svelte:document>`は、documentオブジェクトのイベントやプロパティにバインドできます。ページの表示状態、テキスト選択、フルスクリーン状態などを監視できます。

```svelte live
<script lang="ts">
  let visibilityState = $state('visible');
  let fullscreen = $state(false);
  let selectionText = $state('');
  
  function handleSelectionChange() {
    const selection = window.getSelection();
    selectionText = selection?.toString() || '';
  }
  
  function handleVisibilityChange() {
    visibilityState = document.visibilityState;
  }
</script>

<svelte:document
  bind:fullscreenElement={fullscreen}
  onvisibilitychange={handleVisibilityChange}
  onselectionchange={handleSelectionChange}
/>

<div style="padding: 1rem; border: 1px solid #ddd; border-radius: 8px;">
  <h4 style="margin-top: 0; color: #ff3e00;">Document情報</h4>
  <div style="display: grid; gap: 0.5rem;">
    <div>👁️ ページ表示状態: {visibilityState}</div>
    <div>🖥️ フルスクリーン: {fullscreen ? 'ON' : 'OFF'}</div>
    <div>✏️ 選択テキスト: {selectionText || '(なし)'}</div>
  </div>
  
  <p style="margin-top: 1rem; padding: 0.5rem; background: #fff3e0; border-radius: 4px; color: #666;">
    このテキストを選択すると、選択内容が上に表示されます。
  </p>
</div>
```

## `svelte:head` - head要素への要素追加

`<svelte:head>`は、documentのhead要素に要素を追加できます。SEO対策、メタタグの設定、外部スタイルシートの読み込みなどに使用します。

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

`<svelte:options>`は、コンポーネントのコンパイラオプションを設定します。Web Components化、不変性の宣言、名前空間の指定などができます。

```svelte
<!-- immutableオプション：プロパティが不変であることを宣言 -->
<svelte:options immutable={true} />

<!-- customElementオプション：Web Componentsとして使用 -->
<svelte:options customElement="my-component" />

<!-- namespaceオプション：SVGコンポーネント用 -->
<svelte:options namespace="svg" />

<!-- accessorsオプション：プロパティのgetterとsetterを生成 -->
<svelte:options accessors={true} />

<!-- cssオプション：CSSをinjectしない -->
<svelte:options css="injected" />

<script lang="ts">
  // コンポーネントのロジック
  let { value = 'default' }: { value?: string } = $props();
</script>
```

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
  <slot />
</button>
```

## `svelte:boundary` - エラーバウンダリ

`<svelte:boundary>`は、子コンポーネントで発生したエラーをキャッチし、フォールバックUIを表示できます。アプリケーション全体のクラッシュを防ぎ、ユーザーに適切なエラーメッセージを表示できます。

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
    
    {#snippet failed(error)}
      <div style="padding: 1rem; background: #ffebee; border-radius: 4px; color: #c62828;">
        <strong>⚠️ エラーが発生しました:</strong>
        <pre style="margin: 0.5rem 0 0; font-size: 0.9em;">{error.message}</pre>
        <button 
          onclick={() => shouldError = false}
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

:::info[svelte:boundaryの利点]
- **エラーの局所化**: エラーがアプリケーション全体に影響しない
- **ユーザー体験の向上**: エラー時でも適切なフィードバックを表示
- **デバッグの簡易化**: エラーの発生箇所を特定しやすい
- **プロダクション対応**: 本番環境でのエラーを優雅に処理
:::

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

:::warning[Svelte 5での変更]
`<svelte:fragment>`はSvelte 5でレガシー機能となりました。Svelte 5のSnippetsは自動的に余計なラッパー要素を作らないため、この要素は不要になりました。
:::

`<svelte:fragment>`は、DOM要素を追加せずに複数の要素をグループ化できる要素でした。以下は従来の使用例です。

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

:::warning[Svelte 5での変更]
`<svelte:component>`はSvelte 5のRunesモードではレガシー機能です。Runesモードでは、コンポーネント変数が変更されると自動的に再レンダリングされるため、この要素は不要になりました。
:::

#### Svelte 5での推奨方法

```svelte
<script lang="ts">
  import ComponentA from './ComponentA.svelte';
  import ComponentB from './ComponentB.svelte';
  import ComponentC from './ComponentC.svelte';
  import type { ComponentType } from 'svelte';
  
  let currentComponent = $state<ComponentType>(ComponentA);
  let componentProps = $state({ message: 'Hello!' });
</script>

<!-- Svelte 5: 変数を直接使用 -->
{#if currentComponent}
  {@const Component = currentComponent}
  <Component {...componentProps} />
{/if}
```

#### レガシーモードでの使用（互換性のため）

`<svelte:component>`は、レガシーモードや既存コードとの互換性のために引き続き利用可能です。

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
  {#each components as { name, component }}
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

:::warning[Svelte 5での変更]
`<svelte:self>`はSvelte 5でレガシー機能となりました。代わりにコンポーネント自体をimportして使用することが推奨されています。
:::

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
      {#each node.children as child}
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

`<svelte:self>`は、レガシーモードや既存コードとの互換性のために引き続き利用可能です。

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
      {#each node.children as child}
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
- **動的制御**: `<svelte:element>`
- **グローバルイベント**: `<svelte:window>`、`<svelte:body>`、`<svelte:document>`
- **メタ情報**: `<svelte:head>`
- **エラー処理**: `<svelte:boundary>`
- **設定**: `<svelte:options>`

**レガシー要素（Svelte 5では代替方法を推奨）：**
- **`<svelte:component>`**: コンポーネント変数で自動再レンダリング
- **`<svelte:fragment>`**: Snippetsは自動的にラッパー要素を作らない
- **`<svelte:self>`**: コンポーネント自体をimportして使用

これらの要素を適切に使用することで、より柔軟で堅牢なアプリケーションを構築できます。

:::info[関連リンク]
- [テンプレート構文](/svelte/basics/template-syntax/) - 基本的なテンプレート機能
- [コンポーネントの基本](/svelte/basics/component-basics/) - コンポーネントの基礎
- [コンポーネントライフサイクル](/svelte/basics/component-lifecycle/) - ライフサイクルイベント
:::

次は[コンポーネントライフサイクル](/svelte/basics/component-lifecycle/)で、コンポーネントの生成から破棄までの流れについて学びましょう。