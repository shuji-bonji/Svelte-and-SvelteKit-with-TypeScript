---
title: svelte/reactivity/window - リアクティブ値
description: Svelteのsvelte/reactivity/windowモジュールでウィンドウサイズ、スクロール位置、オンライン状態をリアクティブに取得。TypeScriptでの実装を解説
---

<script>
	import Admonition from '$lib/components/Admonition.svelte';
</script>

`svelte/reactivity/window` モジュールは、`window` オブジェクトの各種プロパティをリアクティブな値として提供します。
`&lt;svelte:window&gt;` バインディングや手動のイベントリスナーを使用せずに、ウィンドウの状態を監視できます。

## この記事で学べること

- 利用可能なリアクティブ値
- 各値の使い方と特徴
- 実践的なユースケース
- SSR での動作

<Admonition type="info" title="バージョン要件">

このモジュールは Svelte 5.11.0 以降で利用可能です。

</Admonition>

## 基本的な使い方

このモジュールからエクスポートされる値は、すべて `.current` プロパティを持つオブジェクトです。このプロパティは自動的にウィンドウの状態と同期され、値が変化すると依存するUIも自動的に更新されます。

```svelte
<script lang="ts">
  import { innerWidth, innerHeight } from 'svelte/reactivity/window';
</script>

<p>ウィンドウサイズ: {innerWidth.current}x{innerHeight.current}</p>
```

## 利用可能な値

以下のリアクティブ値がモジュールから利用可能です。各値はウィンドウの対応するプロパティと同期しており、プロパティの変化を自動的に検知します。

### ウィンドウサイズ

ウィンドウのサイズを取得するための値です。`innerWidth`/`innerHeight` はスクロールバーを除いた表示領域、`outerWidth`/`outerHeight` はブラウザウィンドウ全体のサイズを表します。

| 値            | 説明                         |
| ------------- | ---------------------------- |
| `innerWidth`  | ウィンドウの内側の幅（px）   |
| `innerHeight` | ウィンドウの内側の高さ（px） |
| `outerWidth`  | ウィンドウの外側の幅（px）   |
| `outerHeight` | ウィンドウの外側の高さ（px） |

```svelte
<script lang="ts">
  import {
    innerWidth,
    innerHeight,
    outerWidth,
    outerHeight
  } from 'svelte/reactivity/window';
</script>

<div class="size-display">
  <p>内側サイズ: {innerWidth.current}x{innerHeight.current}</p>
  <p>外側サイズ: {outerWidth.current}x{outerHeight.current}</p>
</div>
```

### スクロール位置

ページのスクロール位置をリアクティブに取得できます。スクロールに応じたUIの表示/非表示や、プログレスバーの実装などに便利です。

| 値        | 説明                     |
| --------- | ------------------------ |
| `scrollX` | 水平スクロール位置（px） |
| `scrollY` | 垂直スクロール位置（px） |

以下の例では、スクロール位置を表示し、一定以上スクロールした場合に「トップへ戻る」ボタンを表示しています。

```svelte
<script lang="ts">
  import { scrollX, scrollY } from 'svelte/reactivity/window';

  // スクロール位置に基づく派生値
  let showBackToTop = $derived((scrollY.current ?? 0) > 300);
</script>

<div class="scroll-indicator">
  スクロール: ({scrollX.current}, {scrollY.current})
</div>

{#if showBackToTop}
  <button
    class="back-to-top"
    onclick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
  >
    トップへ戻る
  </button>
{/if}
```

### 画面位置

ブラウザウィンドウのスクリーン上での位置を取得できます。マルチモニター環境でのウィンドウ配置の検知などに使用できます。

| 値           | 説明                             |
| ------------ | -------------------------------- |
| `screenLeft` | ウィンドウの左端のスクリーン座標 |
| `screenTop`  | ウィンドウの上端のスクリーン座標 |

```svelte
<script lang="ts">
  import { screenLeft, screenTop } from 'svelte/reactivity/window';
</script>

<p>ウィンドウ位置: ({screenLeft.current}, {screenTop.current})</p>
```

<Admonition type="note" title="更新タイミング">

`screenLeft` と `screenTop` は `requestAnimationFrame` コールバック内で更新されます。

</Admonition>

### デバイスピクセル比

デバイスピクセル比（DPR）は、CSSピクセルと物理ピクセルの比率を表します。Retina ディスプレイでは 2 以上の値になります。高解像度画像の出し分けなどに使用できます。

```svelte
<script lang="ts">
  import { devicePixelRatio } from 'svelte/reactivity/window';
</script>

<p>デバイスピクセル比: {devicePixelRatio.current}</p>
```

<Admonition type="warning" title="ブラウザごとの違い">

`devicePixelRatio` の動作はブラウザによって異なります。
<ul>
<li><strong>Chrome</strong>: ズームレベルに応じて変化</li>
<li><strong>Firefox/Safari</strong>: ズームレベルに反応しない</li>
</ul>

</Admonition>

### オンライン状態

ブラウザがインターネットに接続しているかどうかを検知できます。オフライン時の警告表示や、オンライン復帰時のデータ同期などに活用できます。

```svelte
<script lang="ts">
  import { online } from 'svelte/reactivity/window';
</script>

{#if online.current}
  <span class="status online">オンライン</span>
{:else}
  <span class="status offline">オフライン</span>
{/if}
```

## 実践例

これらのリアクティブ値を組み合わせることで、様々なUIパターンを実装できます。以下に実践的なユースケースを紹介します。

### レスポンシブレイアウト

ウィンドウ幅に基づいてデバイスタイプを判定し、レイアウトを動的に切り替える例です。CSS メディアクエリでは対応しにくいJavaScriptベースの条件分岐に便利です。

```svelte
<script lang="ts">
  import { innerWidth } from 'svelte/reactivity/window';

  // ブレークポイントの定義
  const breakpoints = {
    mobile: 640,
    tablet: 1024,
    desktop: 1280
  };

  let deviceType = $derived.by(() => {
    const width = innerWidth.current ?? 0;
    if (width < breakpoints.mobile) return 'mobile';
    if (width < breakpoints.tablet) return 'tablet';
    if (width < breakpoints.desktop) return 'laptop';
    return 'desktop';
  });

  let isMobile = $derived((innerWidth.current ?? 0) < breakpoints.mobile);
</script>

<div class="layout" class:mobile={isMobile}>
  <header>
    {#if isMobile}
      <button class="menu-toggle">メニュー</button>
    {:else}
      <nav>
        <a href="/">ホーム</a>
        <a href="/about">概要</a>
        <a href="/contact">連絡先</a>
      </nav>
    {/if}
  </header>

  <main>
    <p>現在のデバイス: {deviceType}</p>
  </main>
</div>
```

### スクロールに応じたヘッダー

スクロール方向を検知して、下方向にスクロール中はヘッダーを非表示にし、上方向にスクロール中は表示する「スマートヘッダー」パターンの実装例です。

```svelte
<script lang="ts">
  import { scrollY } from 'svelte/reactivity/window';

  // 前回のスクロール位置を追跡
  let prevScrollY = $state(0);

  // スクロール方向を検出
  let isScrollingDown = $derived.by(() => {
    const current = scrollY.current ?? 0;
    const down = current > prevScrollY;
    // 次回の比較のために保存
    prevScrollY = current;
    return down;
  });

  // ヘッダーの表示/非表示
  let showHeader = $derived.by(() => {
    const y = scrollY.current ?? 0;
    // 上部近くでは常に表示
    if (y < 100) return true;
    // 上にスクロール中は表示
    return !isScrollingDown;
  });
</script>

<header class:hidden={!showHeader}>
  <nav>ナビゲーション</nav>
</header>

<style>
  header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: white;
    transition: transform 0.3s;
  }

  header.hidden {
    transform: translateY(-100%);
  }
</style>
```

### オンライン/オフライン通知

ネットワーク接続状態の変化をユーザーに通知する例です。オフラインになった時に警告を表示し、オンラインに復帰した時には一時的な成功メッセージを表示します。

```svelte
<script lang="ts">
  import { online } from 'svelte/reactivity/window';
  import { fly } from 'svelte/transition';

  let wasOffline = $state(false);

  // オンラインに戻った時に通知
  let showReconnected = $derived.by(() => {
    if (!online.current) {
      wasOffline = true;
      return false;
    }
    if (wasOffline) {
      // 3秒後に非表示
      setTimeout(() => wasOffline = false, 3000);
      return true;
    }
    return false;
  });
</script>

{#if !online.current}
  <div class="notification offline" transition:fly={{ y: -50 }}>
    インターネット接続がありません
  </div>
{/if}

{#if showReconnected}
  <div class="notification online" transition:fly={{ y: -50 }}>
    接続が回復しました
  </div>
{/if}

<style>
  .notification {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    padding: 1rem 2rem;
    border-radius: 8px;
    z-index: 1000;
  }

  .offline {
    background: #dc3545;
    color: white;
  }

  .online {
    background: #28a745;
    color: white;
  }
</style>
```

### Retina 対応の画像

デバイスピクセル比に応じて適切な解像度の画像を選択する例です。Retina ディスプレイでは高解像度版（@2x、@3x）を、通常ディスプレイでは標準版を読み込みます。

```svelte
<script lang="ts">
  import { devicePixelRatio } from 'svelte/reactivity/window';

  let { src, alt }: { src: string; alt: string } = $props();

  // デバイスピクセル比に応じた画像サイズを計算
  let imageSuffix = $derived.by(() => {
    const dpr = devicePixelRatio.current ?? 1;
    if (dpr >= 3) return '@3x';
    if (dpr >= 2) return '@2x';
    return '';
  });

  let imageSrc = $derived.by(() => {
    const [name, ext] = src.split('.');
    return `${name}${imageSuffix}.${ext}`;
  });
</script>

<img src={imageSrc} {alt} />
```

### スクロールプログレスバー

ページの読み進め具合を視覚的に表示するプログレスバーの実装例です。スクロール位置とドキュメントの高さから進捗率を計算し、バーの幅を動的に変更しています。

```svelte
<script lang="ts">
  import { scrollY, innerHeight } from 'svelte/reactivity/window';

  // ドキュメントの高さは scrollY/innerHeight が変化するたびに再計算
  // （SSR では document が無いので 0 で保護）
  let documentHeight = $derived.by(() => {
    if (typeof document === 'undefined') return 0;
    // scrollY.current を読むことで依存関係を作り、スクロール時に再評価される
    void scrollY.current;
    return document.documentElement.scrollHeight;
  });

  // スクロール進捗（0-100）
  let scrollProgress = $derived.by(() => {
    const y = scrollY.current ?? 0;
    const height = innerHeight.current ?? 0;
    const maxScroll = documentHeight - height;
    if (maxScroll <= 0) return 0;
    return Math.min(100, (y / maxScroll) * 100);
  });
</script>

<div
  class="progress-bar"
  style="width: {scrollProgress}%"
></div>

<style>
  .progress-bar {
    position: fixed;
    top: 0;
    left: 0;
    height: 3px;
    background: #ff3e00;
    z-index: 1000;
    transition: width 0.1s;
  }
</style>
```

## SSR での動作

SvelteKit などでサーバーサイドレンダリング（SSR）を使用する場合、`window` オブジェクトは存在しません。そのため、すべてのリアクティブ値は `undefined` を返します。Nullish coalescing 演算子（`??`）を使用してフォールバック値を設定するか、`browser` チェックを使用してクライアントサイドのみで値を使用するようにしましょう。

```svelte
<script lang="ts">
  import { innerWidth } from 'svelte/reactivity/window';
  import { browser } from '$app/environment';

  // サーバーサイドでのフォールバック
  let width = $derived(innerWidth.current ?? 1024);

  // または browser チェックを使用
  let isMobile = $derived.by(() => {
    if (!browser) return false;
    return (innerWidth.current ?? 0) < 640;
  });
</script>

{#if browser}
  <p>ウィンドウ幅: {innerWidth.current}px</p>
{:else}
  <p>クライアントサイドでレンダリングされます</p>
{/if}
```

## &lt;svelte:window&gt; との比較

`svelte/reactivity/window` モジュールは、従来の `&lt;svelte:window&gt;` バインディングの代替となります。どちらも同じ結果を得られますが、記述量と使い勝手に違いがあります。

### 従来のアプローチ

```svelte
<script lang="ts">
  let innerWidth = $state(0);
  let scrollY = $state(0);
</script>

<svelte:window bind:innerWidth bind:scrollY />

<p>幅: {innerWidth}, スクロール: {scrollY}</p>
```

### svelte/reactivity/window を使用

```svelte
<script lang="ts">
  import { innerWidth, scrollY } from 'svelte/reactivity/window';
</script>

<p>幅: {innerWidth.current}, スクロール: {scrollY.current}</p>
```

### 比較

| 項目               | `&lt;svelte:window&gt;`      | `svelte/reactivity/window` |
| ------------------ | ---------------------------- | -------------------------- |
| コード量           | やや多い                     | 簡潔                       |
| 複数コンポーネント | 各コンポーネントで定義が必要 | インポートするだけ         |
| 型安全性           | 手動で型定義                 | 型が事前定義済み           |
| SSR 対応           | 手動でハンドリング           | `undefined` を返す         |

## 型定義

TypeScript を使用する場合、すべての値は以下の型定義に従います。`current` プロパティは `undefined` を含む可能性があるため、適切な型ガードやフォールバック値を使用してください。

```typescript
interface ReactiveValue<T> {
  readonly current: T;
}

// 各値の型
const innerWidth: ReactiveValue<number | undefined>;
const innerHeight: ReactiveValue<number | undefined>;
const outerWidth: ReactiveValue<number | undefined>;
const outerHeight: ReactiveValue<number | undefined>;
const scrollX: ReactiveValue<number | undefined>;
const scrollY: ReactiveValue<number | undefined>;
const screenLeft: ReactiveValue<number | undefined>;
const screenTop: ReactiveValue<number | undefined>;
const devicePixelRatio: { readonly current: number | undefined };
const online: ReactiveValue<boolean | undefined>;
```

## まとめ

`svelte/reactivity/window` を使用することで、以下のことが実現できます。

- **簡潔なコード**: `&lt;svelte:window&gt;` バインディングより簡潔
- **再利用性**: 複数のコンポーネントで同じ値を使用
- **型安全性**: TypeScript の型が事前定義済み
- **SSR 対応**: サーバーサイドでは `undefined` を返す

ウィンドウの状態に基づいたリアクティブな UI を構築する際に非常に便利なモジュールです。

## 次のステップ

- [$effect - 副作用](/svelte/runes/effect/) - エフェクトとの組み合わせ
- [$derived - 派生値](/svelte/runes/derived/) - 派生値の計算
- [特別な要素](/svelte/basics/special-elements/) - `&lt;svelte:window&gt;` の詳細
