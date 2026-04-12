---
title: ハイドレーション詳解
description: SvelteKitのハイドレーションを完全理解 - SSRで生成されたHTMLがインタラクティブになる仕組み、ハイドレーションマーカーの役割、ミスマッチエラーの原因と対策、パフォーマンス最適化まで詳しく解説
---

<script>
  import Mermaid from '$lib/components/Mermaid.svelte';

  const hydrationFlowDiagram = `sequenceDiagram
    participant Server as サーバー
    participant Network as ネットワーク
    participant Browser as ブラウザ
    participant DOM as DOM
    participant Svelte as SvelteKit Runtime

    Note over Server: SSRフェーズ
    Server->>Server: Svelteコンポーネントを実行
    Server->>Server: HTMLを生成
    Server->>Server: 状態データをシリアライズ
    Server->>Network: HTML + 埋め込みデータ + JS送信

    Note over Browser: 初期表示フェーズ
    Network->>Browser: HTML受信
    Browser->>DOM: HTMLをパース・描画
    Browser-->>Browser: ユーザーにコンテンツ表示（非インタラクティブ）

    Note over Browser: ハイドレーションフェーズ
    Browser->>Browser: JavaScriptをロード・実行
    Browser->>Svelte: SvelteKit Runtime起動
    Svelte->>DOM: 既存DOMを検証
    Svelte->>Svelte: 埋め込みデータから状態を復元
    Svelte->>DOM: イベントリスナーをアタッチ
    Svelte->>DOM: リアクティビティを有効化
    DOM-->>Browser: インタラクティブな状態に

    Note over Browser,DOM: 以降はCSRモード（SPAとして動作）`;

  const hydrationMarkerDiagram = `graph TB
    subgraph "SSRで生成されるHTML"
        HTML[HTML Document]
        HEAD[head要素]
        BODY[body要素]

        HTML --> HEAD
        HTML --> BODY

        HEAD --> META["メタデータ"]
        HEAD --> PRELOAD["modulepreload<br/>JSバンドルの事前読み込み"]

        BODY --> APP["div#app<br/>data-sveltekit-hydrate属性"]
        BODY --> DATA["script#__sveltekit_data<br/>シリアライズされた状態"]
        BODY --> MODULES["script type=module<br/>エントリーポイント"]

        APP --> CONTENT["サーバーで生成された<br/>HTMLコンテンツ"]
    end

    style APP fill:#e3f2fd,color:#000
    style DATA fill:#fff3e0,color:#000
    style MODULES fill:#e8f5e9,color:#000`;

  const mismatchDiagram = `graph LR
    subgraph "正常なハイドレーション"
        SSR1["SSR: &lt;div&gt;Hello&lt;/div&gt;"]
        CSR1["CSR: &lt;div&gt;Hello&lt;/div&gt;"]
        SSR1 -->|一致| CSR1
        CSR1 -->|✅ 成功| OK[イベントリスナー付与]
    end

    subgraph "ミスマッチエラー"
        SSR2["SSR: &lt;div&gt;2024-01-01&lt;/div&gt;"]
        CSR2["CSR: &lt;div&gt;2024-01-02&lt;/div&gt;"]
        SSR2 -->|不一致| CSR2
        CSR2 -->|❌ エラー| ERR[Hydration mismatch]
    end

    style OK fill:#c8e6c9,color:#000
    style ERR fill:#ffcdd2,color:#000`;

  const islandsArchitectureDiagram = `graph TB
    subgraph "従来のハイドレーション"
        FULL[ページ全体をハイドレート]
        FULL --> ALL["すべてのコンポーネントが<br/>JavaScriptを必要とする"]
    end

    subgraph "Islands Architecture"
        PAGE[静的HTML（大部分）]
        ISLAND1["🏝️ Island 1<br/>検索フォーム"]
        ISLAND2["🏝️ Island 2<br/>カート"]
        ISLAND3["🏝️ Island 3<br/>コメント"]

        PAGE --- ISLAND1
        PAGE --- ISLAND2
        PAGE --- ISLAND3
    end

    subgraph "利点"
        PERF["⚡ JSバンドルサイズ削減"]
        TTI["⚡ TTI改善"]
        PART["⚡ 部分的な読み込み"]
    end

    ISLAND1 --> PERF
    ISLAND2 --> TTI
    ISLAND3 --> PART

    style FULL fill:#ffcdd2,color:#000
    style PAGE fill:#e8f5e9,color:#000
    style ISLAND1 fill:#bbdefb,color:#000
    style ISLAND2 fill:#bbdefb,color:#000
    style ISLAND3 fill:#bbdefb,color:#000`;

  const ssrHydrationRelationDiagram = `graph TB
    subgraph STEP1["1️⃣ サーバー: HTML生成"]
        SERVER["Svelteコンポーネント実行"]
        HTML_GEN["HTMLを生成<br/>（静的、見た目だけ）"]
        SERVER --> HTML_GEN
    end

    subgraph STEP2["2️⃣ ブラウザ: HTML表示"]
        HTML_RECV["HTMLを受信・描画"]
        STATIC["コンテンツは見える<br/>❌ ボタンは押せない"]
        HTML_RECV --> STATIC
    end

    subgraph STEP3["3️⃣ ブラウザ: JS実行"]
        JS_LOAD["JavaScriptをダウンロード"]
        HYDRATE_START["ハイドレーション開始"]
        JS_LOAD --> HYDRATE_START
    end

    subgraph STEP4["4️⃣ ハイドレーション完了"]
        INTERACTIVE["インタラクティブに！"]
        FEATURES["✅ ボタンが押せる<br/>✅ フォームが動く<br/>✅ 状態が更新される"]
        INTERACTIVE --> FEATURES
    end

    STEP1 -->|"FCP改善<br/>素早く表示"| STEP2
    STEP2 -->|"JSはまだ<br/>実行されていない"| STEP3
    STEP3 -->|"DOM接続<br/>イベント登録"| STEP4

    style STEP1 fill:#e3f2fd,color:#000
    style STEP2 fill:#fff3e0,color:#000
    style STEP3 fill:#fff9c4,color:#000
    style STEP4 fill:#c8e6c9,color:#000`;

  const performanceTimelineDiagram = `gantt
    title ページ読み込みとハイドレーションのタイムライン
    dateFormat X
    axisFormat %s秒

    section SSR
    HTML生成           :done, ssr, 0, 200

    section ネットワーク
    HTML転送           :done, transfer, 200, 400
    JS転送            :done, js, 400, 800

    section ブラウザ
    HTML解析・描画     :done, parse, 400, 600
    FCP達成           :milestone, fcp, 600, 0
    JSパース          :active, jsparse, 800, 1000
    ハイドレーション   :active, hydrate, 1000, 1400
    TTI達成           :milestone, tti, 1400, 0`;
</script>

SvelteKitのSSRでは、サーバーで生成されたHTMLがブラウザに送られた後、JavaScriptが「ハイドレーション」という処理を行い、静的なHTMLをインタラクティブなアプリケーションに変換します。このページでは、ハイドレーションの仕組みを詳しく解説します。

## この記事で学べること

- ハイドレーションとは何か、なぜ必要なのか
- SvelteKitが生成するHTMLの構造とハイドレーションマーカー
- ハイドレーションの実行フローとタイミング
- ハイドレーションミスマッチの原因と対策
- パフォーマンスへの影響と最適化手法
- Islands Architectureと部分的ハイドレーション

## ハイドレーションとは

**ハイドレーション（Hydration）** とは、サーバーサイドレンダリング（SSR）で生成された静的なHTMLに対して、クライアントサイドのJavaScriptが「水を与えるように」イベントリスナーやリアクティビティを付与し、インタラクティブな状態にする処理です。

### なぜハイドレーションが必要か

SSRには大きなメリットがありますが、サーバーで生成されたHTMLだけでは**インタラクティブな機能が動作しません**。

| 状態 | ボタンクリック | フォーム入力 | 状態更新 |
|------|--------------|-------------|---------|
| SSR直後（ハイドレーション前） | ❌ 反応なし | ❌ 反応なし | ❌ 不可 |
| ハイドレーション後 | ✅ 動作 | ✅ 動作 | ✅ リアクティブ |

### SSRとハイドレーションの関係

<Mermaid diagram={ssrHydrationRelationDiagram} />

## ハイドレーションのフロー

SvelteKitにおけるハイドレーションの詳細なフローを見てみましょう。

<Mermaid diagram={hydrationFlowDiagram} />

### 各フェーズの詳細

#### 1. SSRフェーズ（サーバー側）

```typescript
// サーバー側で実行される処理のイメージ
// 1. Svelteコンポーネントをサーバー上で実行
const html = render(App, { props: data });

// 2. 状態データをJSON形式でシリアライズ
const serializedData = JSON.stringify({
  type: 'data',
  nodes: [...],  // ページ階層のデータ
});

// 3. HTMLに埋め込んで送信
const fullHtml = `
  <!DOCTYPE html>
  <html>
    <body>
      <div id="app">${html}</div>
      <script id="__sveltekit_data">
        ${serializedData}
      </script>
    </body>
  </html>
`;
```

#### 2. 初期表示フェーズ（ブラウザ側）

ブラウザはHTMLを受信すると、JavaScriptの実行を待たずにHTMLをパースして画面に描画します。この時点でユーザーはコンテンツを見ることができますが、ボタンをクリックしても何も起きません。

#### 3. ハイドレーションフェーズ（ブラウザ側）

```typescript
// SvelteKitランタイムが行う処理のイメージ
// 1. 埋め込みデータを取得
const dataScript = document.getElementById('__sveltekit_data');
const data = JSON.parse(dataScript.textContent);

// 2. 既存のDOMを取得
const target = document.getElementById('app');

// 3. ハイドレーション実行
// - DOMを再生成せず、既存のDOMに「接続」
// - イベントリスナーを付与
// - Runesのリアクティビティを有効化
hydrate(App, { target, props: data });
```

## SSRで生成されるHTMLの構造

SvelteKitがSSR時に生成するHTMLには、ハイドレーションに必要な情報が埋め込まれています。

<Mermaid diagram={hydrationMarkerDiagram} />

### 実際のHTML出力例

以下は、SvelteKitが生成する典型的なHTMLの構造です。

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>ページタイトル</title>

  <!-- JSバンドルの事前読み込み -->
  <link rel="modulepreload" href="/_app/immutable/entry/start.js">
  <link rel="modulepreload" href="/_app/immutable/entry/app.js">
  <link rel="modulepreload" href="/_app/immutable/chunks/scheduler.js">
</head>
<body data-sveltekit-preload-data="hover">
  <!-- SSRで生成されたHTMLコンテンツ -->
  <div id="app" data-sveltekit-hydrate="1a2b3c">
    <header>
      <nav>...</nav>
    </header>
    <main>
      <h1>ようこそ</h1>
      <button>カウント: 0</button>
    </main>
  </div>

  <!-- シリアライズされた状態データ -->
  <script type="application/json" id="__sveltekit_data">
    {
      "type": "data",
      "nodes": [
        { "type": "data", "data": { "count": 0 } },
        { "type": "data", "data": { "title": "ようこそ" } }
      ]
    }
  </script>

  <!-- エントリーポイント -->
  <script type="module">
    import { start } from '/_app/immutable/entry/start.js';
    start();
  </script>
</body>
</html>
```

### ハイドレーションマーカーの役割

| マーカー | 役割 |
|---------|------|
| `data-sveltekit-hydrate` | ハイドレーション対象の要素を識別。値はビルドごとのユニークID |
| `#__sveltekit_data` | Load関数で取得したデータをJSONでシリアライズ |
| `data-sveltekit-preload-data` | リンクホバー時のデータプリロード設定 |
| `modulepreload` | 重要なJSモジュールを事前に読み込み |

## ハイドレーションミスマッチ

ハイドレーションミスマッチは、SSRで生成されたHTMLとクライアントで生成されるHTMLが一致しない場合に発生するエラーです。

<Mermaid diagram={mismatchDiagram} />

### よくある原因と対策

#### 1. 日時の表示

```svelte
<!-- ❌ NG: サーバーとクライアントで時刻が異なる -->
<script lang="ts">
  const now = new Date().toLocaleString();
</script>
<p>現在時刻: {now}</p>

<!-- ✅ OK: クライアントでのみ表示 -->
<script lang="ts">
  import { browser } from '$app/environment';

  let now = $state('');

  $effect(() => {
    if (browser) {
      now = new Date().toLocaleString();
    }
  });
</script>
<p>現在時刻: {now || '読み込み中...'}</p>
```

#### 2. ランダムな値

```svelte
<!-- ❌ NG: 毎回異なる値が生成される -->
<script lang="ts">
  const id = Math.random().toString(36).slice(2);
</script>
<div id={id}>...</div>

<!-- ✅ OK: サーバーで生成した値を使う -->
<script lang="ts">
  import type { PageProps } from './$types';

  let { data }: PageProps = $props();
</script>
<div id={data.generatedId}>...</div>
```

```typescript
// +page.server.ts
export const load = async () => {
  return {
    generatedId: crypto.randomUUID()
  };
};
```

#### 3. ブラウザ専用APIの使用

```svelte
<!-- ❌ NG: windowはサーバーに存在しない -->
<script lang="ts">
  const width = window.innerWidth;
</script>
<p>画面幅: {width}px</p>

<!-- ✅ OK: browserガードを使用 -->
<script lang="ts">
  import { browser } from '$app/environment';

  let width = $state(0);

  $effect(() => {
    if (browser) {
      width = window.innerWidth;

      const handleResize = () => {
        width = window.innerWidth;
      };
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  });
</script>
<p>画面幅: {width ? `${width}px` : '計測中...'}</p>
```

#### 4. 条件付きレンダリング

```svelte
<!-- ❌ NG: localStorageはサーバーに存在しない -->
<script lang="ts">
  const theme = localStorage.getItem('theme') || 'light';
</script>
{#if theme === 'dark'}
  <DarkTheme />
{:else}
  <LightTheme />
{/if}

<!-- ✅ OK: onMountで初期化 -->
<script lang="ts">
  import { onMount } from 'svelte';

  let theme = $state<'light' | 'dark'>('light');
  let mounted = $state(false);

  onMount(() => {
    theme = (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
    mounted = true;
  });
</script>

{#if !mounted}
  <!-- SSR時のフォールバック -->
  <LightTheme />
{:else if theme === 'dark'}
  <DarkTheme />
{:else}
  <LightTheme />
{/if}
```

### エラーメッセージの読み方

開発モードでハイドレーションミスマッチが発生すると、以下のような警告が表示されます。

```
[svelte] hydration_mismatch
Hydration failed because the initial UI does not match what was rendered on the server.
```

デバッグのポイント：

1. **どの要素で発生しているか**を特定
2. **サーバーとクライアントで異なる値**を生成していないか確認
3. **ブラウザ専用API**を直接使用していないか確認
4. **条件分岐**がサーバーとクライアントで異なる結果になっていないか確認

## パフォーマンスへの影響

ハイドレーションはパフォーマンスに大きな影響を与えます。

### ページ読み込みのタイムライン

以下の図は、SSRページの読み込みからハイドレーション完了までの典型的なタイムラインを示しています。

<Mermaid diagram={performanceTimelineDiagram} />

- **FCP（First Contentful Paint）**: HTMLが描画された時点で達成。ユーザーはコンテンツを見られる
- **TTI（Time to Interactive）**: ハイドレーション完了後に達成。ユーザーが操作できるようになる

### 重要な指標

| 指標 | 説明 | ハイドレーションの影響 |
|------|------|----------------------|
| **FCP** (First Contentful Paint) | 最初のコンテンツが表示されるまで | SSRにより改善（ハイドレーション前に表示） |
| **TTI** (Time to Interactive) | ページがインタラクティブになるまで | ハイドレーション完了まで待つ必要あり |
| **TBT** (Total Blocking Time) | メインスレッドがブロックされた時間 | ハイドレーション中に増加 |

### ハイドレーションのコスト

```
コンポーネント数が増えると...
├── JSバンドルサイズ増加 → ダウンロード時間増加
├── パース時間増加 → CPUブロック
└── ハイドレーション処理時間増加 → TTI悪化
```

### 最適化手法

#### 1. コード分割（Code Splitting）

SvelteKitは自動的にルートごとにコード分割を行いますが、大きなコンポーネントは動的インポートで分割できます。

```svelte
<script lang="ts">
  import type { Component } from 'svelte';

  // 動的インポートでコンポーネントを遅延読み込み
  let HeavyComponent = $state<Component | null>(null);

  // クライアントサイドでのみ読み込み
  $effect(() => {
    import('$lib/components/HeavyComponent.svelte').then((module) => {
      HeavyComponent = module.default;
    });
  });
</script>

{#if HeavyComponent}
  <HeavyComponent />
{:else}
  <div>読み込み中...</div>
{/if}
```

または、`&#123;#await&#125;`ブロックを使用したより簡潔な方法もあります。

```svelte
{#await import('$lib/components/HeavyComponent.svelte')}
  <div>読み込み中...</div>
{:then { default: HeavyComponent }}
  <HeavyComponent />
{/await}
```

#### 2. 遅延ハイドレーション

重要度の低いコンポーネントのハイドレーションを遅延させることで、TTIを改善できます。

```svelte
<script lang="ts">
  import { browser } from '$app/environment';

  let shouldHydrate = $state(false);

  $effect(() => {
    if (browser) {
      // Intersection Observerで可視になったらハイドレート
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          shouldHydrate = true;
          observer.disconnect();
        }
      });

      const element = document.getElementById('lazy-section');
      if (element) observer.observe(element);

      return () => observer.disconnect();
    }
  });
</script>

<div id="lazy-section">
  {#if shouldHydrate}
    <InteractiveWidget />
  {:else}
    <!-- 静的なプレースホルダー -->
    <StaticPlaceholder />
  {/if}
</div>
```

#### 3. SSGの活用

インタラクティブ性が不要なページは、SSGでプリレンダリングすることでハイドレーションコストを最小化できます。

```typescript
// +page.ts
export const prerender = true;

// インタラクティブ性が不要ならCSRも無効化
export const csr = false;  // ハイドレーションをスキップ
```

## Islands Architecture（発展）

**Islands Architecture**は、ページ全体をハイドレートする代わりに、インタラクティブな「島（Island）」だけを選択的にハイドレートするアーキテクチャパターンです。

<Mermaid diagram={islandsArchitectureDiagram} />

### 従来のハイドレーションとの比較

| 項目 | 従来のハイドレーション | Islands Architecture |
|------|----------------------|---------------------|
| ハイドレーション範囲 | ページ全体 | 必要な部分のみ |
| JSバンドルサイズ | 大きい | 小さい |
| TTI | 遅い | 速い |
| 実装の複雑さ | シンプル | やや複雑 |
| 適したサイト | 高インタラクティブなアプリ | コンテンツ中心のサイト |

### Islands Architectureを採用しているフレームワーク

- **Astro**: 明示的なIslandsサポート
- **Fresh (Deno)**: デフォルトでIslands
- **Qwik**: Resumability（ハイドレーション不要）

### SvelteKitでの実現方法

SvelteKitは標準ではIslands Architectureをサポートしていませんが、以下のアプローチで近い効果を得られます。

#### アプローチ1: 部分的なCSR無効化

```typescript
// 静的なページはCSRを無効化
// +page.ts
export const csr = false;  // ハイドレーションをスキップ
export const prerender = true;
```

#### アプローチ2: 動的コンポーネントの遅延読み込み

```svelte
<!-- 静的な部分 -->
<article>
  <h1>{data.title}</h1>
  <div>{@html data.content}</div>
</article>

<!-- インタラクティブな「島」だけを遅延ハイドレート -->
<div id="comments-island">
  {#await import('$lib/components/Comments.svelte') then { default: Comments }}
    <Comments postId={data.id} />
  {/await}
</div>
```

#### アプローチ3: Web Componentsとの組み合わせ

```svelte
<script lang="ts">
  import { onMount } from 'svelte';

  onMount(async () => {
    // 必要な時だけWeb Componentを読み込み
    await import('$lib/web-components/interactive-chart.js');
  });
</script>

<!-- 静的コンテンツ -->
<article>
  <h1>売上レポート</h1>
  <p>2024年の売上推移です。</p>
</article>

<!-- Web Componentとして実装されたインタラクティブ要素 -->
<interactive-chart data-src="/api/sales-data"></interactive-chart>
```

## まとめ

ハイドレーションはSSRの恩恵を受けながらインタラクティブなアプリケーションを構築するための重要な技術です。

### 押さえておくべきポイント

1. **ハイドレーションの役割**: SSRのHTMLにイベントリスナーとリアクティビティを付与
2. **ミスマッチの回避**: サーバーとクライアントで同じ出力になるようにする
3. **パフォーマンスへの意識**: TTIに影響するため、必要に応じて最適化
4. **適切な戦略選択**: インタラクティブ性が不要なページはSSG + `csr: false`を検討

### チェックリスト

- [ ] `window`/`document`/`localStorage`を直接使っていないか
- [ ] 日時やランダム値をサーバー/クライアントで別々に生成していないか
- [ ] `browser`ガードや`onMount`を適切に使用しているか
- [ ] 静的なページで不要なハイドレーションをしていないか

## 関連ドキュメント

- [レンダリング戦略（基礎）](/sveltekit/basics/rendering-strategies/) - SSR/SSG/SPAの基本
- [レンダリング戦略（詳解）](/sveltekit/architecture/rendering-strategies/) - 詳細なアーキテクチャ
- [SPA/MPA混在アーキテクチャ](/sveltekit/architecture/spa-mpa-hybrid/) - ハイブリッド構成
- [実行環境とランタイム](/sveltekit/deployment/execution-environments/) - サーバー/クライアントの違い

## 次のステップ

ハイドレーションを理解したら、次はSvelteKitのデータフローをより深く学びましょう。
[データロードアーキテクチャ](/sveltekit/architecture/data-loading/)では、Load関数の詳細な動作と最適化について解説します。
