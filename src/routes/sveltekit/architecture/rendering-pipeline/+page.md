---
title: レンダリングパイプライン
description: SvelteKitのレンダリングパイプラインをTypeScriptで徹底解説 - コンパイルフェーズ、ビルドフェーズ、実行フェーズ、Hydration、最適化プロセスの内部動作を実例を交えて詳細かつ体系的に詳しく解説します
---

<script>
  import Mermaid from '$lib/components/Mermaid.svelte';
  
  const renderingPipelineDiagram = `graph TB
    subgraph "開発時 (dev)"
      direction TB
      DevSvelte[".svelte ファイル"]
      DevCompiler["Svelte Compiler<br/>（リアルタイム変換）"]
      DevVite["Vite Dev Server<br/>（HMR対応）"]
      DevBrowser["ブラウザ<br/>（開発モード）"]
      
      DevSvelte --> DevCompiler
      DevCompiler --> DevVite
      DevVite --> DevBrowser
    end
    
    subgraph "ビルド時 (build)"
      direction TB
      BuildSvelte[".svelte ファイル"]
      BuildCompiler["Svelte Compiler<br/>（最適化変換）"]
      BuildVite["Vite Build<br/>（バンドリング）"]
      BuildOutput["静的アセット<br/>（JS/CSS/HTML）"]
      
      BuildSvelte --> BuildCompiler
      BuildCompiler --> BuildVite
      BuildVite --> BuildOutput
    end
    
    subgraph "実行時 (runtime)"
      Request["リクエスト"]
      direction TB
      SSR["SSR実行<br/>（サーバー）"]
      HTML["HTML生成"]
      Hydration["ハイドレーション<br/>（クライアント）"]
      Interactive["インタラクティブ"]
      
      Request --> SSR
      SSR --> HTML
      HTML --> Hydration
      Hydration --> Interactive
    end
    
    style DevCompiler fill:#ff6b6b,color:#fff
    style BuildCompiler fill:#4ecdc4,color:#fff
    style Hydration fill:#45b7d1,color:#fff`;
    
  const compilationPhaseDiagram = `sequenceDiagram
    participant Source as .svelteファイル
    participant Parser as パーサー
    participant AST as AST生成
    participant Analyzer as 解析器
    participant CodeGen as コード生成
    participant Output as JSモジュール
    
    Source->>Parser: ソースコード
    Parser->>AST: 構文解析
    AST->>Analyzer: 依存関係解析
    Analyzer->>Analyzer: リアクティビティ解析
    Analyzer->>CodeGen: 最適化情報
    CodeGen->>Output: JavaScript生成
    
    Note over Output: ・コンポーネントクラス<br/>・レンダリング関数<br/>・CSSモジュール`;
    
  const hydrationProcessDiagram = `sequenceDiagram
    participant Browser as ブラウザ
    participant HTML as サーバー生成HTML
    participant JS as JSバンドル
    participant Component as Svelteコンポーネント
    participant DOM as リアクティブDOM
    
    Browser->>HTML: HTMLロード
    Browser->>JS: JSバンドルロード
    JS->>Component: コンポーネント初期化
    
    Component->>HTML: 既存DOM探索
    Note over Component: data-svelte-h属性で<br/>サーバー生成要素を識別
    
    Component->>Component: イベントリスナー登録
    Component->>Component: リアクティビティ初期化
    Component->>DOM: インタラクティブ化完了
    
    rect rgba(100, 180, 255, 0.2)
        Note over Browser,DOM: ハイドレーション完了<br/>ユーザー操作可能
    end`;
</script>

## レンダリングパイプラインとは

SvelteKitのレンダリングパイプラインは、Svelteコンポーネントから最終的にユーザーに表示されるWebページまでの変換プロセス全体を指します。このプロセスは複数のフェーズに分かれており、各フェーズで異なる最適化が行われます。

<Mermaid diagram={renderingPipelineDiagram} />

## コンパイルフェーズ

Svelteの最大の特徴は、**コンパイル時の最適化**です。ReactやVueのような仮想DOMを使わず、コンパイル時に効率的なDOM操作コードを生成します。

### コンパイルプロセスの詳細

Svelteコンパイラは、.svelteファイルを解析し、最適化されたJavaScriptコードを生成します。このプロセスは、パース、AST生成、解析、コード生成の4つの主要なステップで構成されています。

<Mermaid diagram={compilationPhaseDiagram} />

### Svelteコンパイラの動作

以下の例では、シンプルなButtonコンポーネントがどのようにコンパイルされ、最適化されたJavaScriptコードに変換されるかを示します。

#### 入力：Svelteコンポーネント
コンパイラに渡される元の.svelteファイルです。Svelte 5のRunesシステムを使用したモダンな構文で記述されています。

```typescript
// 入力: Button.svelte
<script lang="ts">
  let { count = $bindable(0), onclick }: {
    count?: number;
    onclick?: () => void;
  } = $props();
</script>

<button {onclick}>
  クリック回数: {count}
</button>

<style>
  button {
    padding: 8px 16px;
    background: #ff3e00;
    color: white;
  }
</style>
```

#### 出力：コンパイル済みJavaScript
コンパイラが生成する最適化されたJavaScriptコードです。create_fragment関数がコンポーネントのライフサイクルを管理し、効率的なDOM操作を実現します。

```javascript
// 出力: Button.js（簡略化）
import { SvelteComponent, init, safe_not_equal, element, text, attr, insert, listen, set_data, noop } from "svelte/internal";

class Button extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance, create_fragment, safe_not_equal, {
      count: 0,
      onclick: 1
    });
  }
}

function create_fragment(ctx) {
  let button;
  let t0;
  let t1;
  
  return {
    c() { // create
      button = element("button");
      t0 = text("クリック回数: ");
      t1 = text(ctx[0]); // count
      attr(button, "class", "svelte-xyz123");
    },
    m(target, anchor) { // mount
      insert(target, button, anchor);
      append(button, t0);
      append(button, t1);
      if (ctx[1]) listen(button, "click", ctx[1]); // onclick
    },
    p(ctx, dirty) { // update
      if (dirty & 1) set_data(t1, ctx[0]); // count changed
    },
    d(detaching) { // destroy
      if (detaching) detach(button);
    }
  };
}
```

### コンパイル時の最適化

Svelteコンパイラは、以下のような様々な最適化を自動的に適用し、パフォーマンスを最大化します。

1. **デッドコード削除**: 使用されていないコードを削除
2. **インライン化**: 小さな関数をインライン展開
3. **リアクティビティの静的解析**: 変更検知コードの最小化
4. **CSSスコープ化**: コンポーネント固有のクラス名生成

## ビルドフェーズ

ViteによるビルドプロセスでSvelteKitアプリケーションが本番用に最適化されます。

### Viteビルドの設定

SvelteKitはViteをビルドツールとして使用します。以下の設定例では、コード分割、ツリーシェイキング、最小化などの最適化を構成しています。

```typescript
// vite.config.ts
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  build: {
    // コード分割の設定
    rollupOptions: {
      output: {
        manualChunks: {
          // vendorチャンクの分離
          vendor: ['svelte', '@sveltejs/kit'],
          // 大きなライブラリを個別チャンクに
          charts: ['d3', 'chart.js'],
        }
      }
    },
    // ツリーシェイキング
    treeShaking: true,
    // 最小化
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // console.log削除
        drop_debugger: true
      }
    }
  }
});
```

### ビルド成果物の構造

ビルド後に生成されるファイル構造です。clientディレクトリにはブラウザ用のアセット、serverディレクトリにはSSR用のコードが配置されます。

```bash
# ビルド後のディレクトリ構造
.svelte-kit/
├── output/
│   ├── client/         # クライアントバンドル
│   │   ├── _app/
│   │   │   ├── immutable/  # 不変アセット（ハッシュ付き）
│   │   │   │   ├── chunks/ # 共通チャンク
│   │   │   │   ├── pages/  # ページ別チャンク
│   │   │   │   └── assets/ # 静的アセット
│   │   │   └── version.json
│   │   └── index.html
│   └── server/         # サーバーバンドル
│       ├── chunks/
│       ├── pages/
│       └── index.js
```

## 実行フェーズ

### SSR実行の流れ

サーバーサイドレンダリングでは、サーバー上でデータを取得し、HTMLを生成してクライアントに送信します。以下の例では、load関数でデータを取得し、それをHTMLに埋め込むプロセスを示しています。

#### サーバーサイドのデータ取得
load関数でAPIからデータを取得し、コンポーネントに渡します。このデータはHTMLにシリアライズされて埋め込まれます。

```typescript
// +page.server.ts
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, fetch }) => {
  // 1. サーバーサイドでデータ取得
  const response = await fetch(`/api/posts/${params.id}`);
  const post = await response.json();
  
  // 2. データをシリアライズして埋め込み
  return {
    post, // このデータはHTMLに埋め込まれる
    timestamp: Date.now()
  };
};
```

#### 生成されるHTML
サーバーが生成する完全なHTMLです。data-sveltekit-data属性にシリアライズされたデータが含まれ、data-svelte-h属性でハイドレーション用のマーカーが付与されています。

```html
<!-- 生成されるHTML -->
<!DOCTYPE html>
<html>
<head>
  <script type="application/json" data-sveltekit-data>
    {
      "post": {"id": 1, "title": "記事タイトル", "content": "..."},
      "timestamp": 1699123456789
    }
  </script>
  <link rel="modulepreload" href="/_app/immutable/entry/start.js">
  <link rel="modulepreload" href="/_app/immutable/chunks/index.js">
</head>
<body>
  <!-- サーバーレンダリング済みHTML -->
  <div data-svelte-h="svelte-1abc2de">
    <h1>記事タイトル</h1>
    <p>記事の内容...</p>
  </div>
</body>
</html>
```

## ハイドレーション

ハイドレーションは、サーバーでレンダリングされた静的なHTMLを、クライアント側でインタラクティブなアプリケーションに変換するプロセスです。

<Mermaid diagram={hydrationProcessDiagram} />

### ハイドレーションの実装

クライアント側でサーバー生成のHTMLをインタラクティブにするためのコードです。既存のDOM要素を再利用し、イベントリスナーとリアクティビティを追加します。

```typescript
// クライアント側の初期化コード
import { start } from '$app/start';

start({
  target: document.body,
  hydrate: true, // ハイドレーションを有効化
  paths: {
    base: '',
    assets: ''
  },
  trailing_slash: 'never'
});

// コンポーネントのハイドレーション
function hydrateComponent(component: SvelteComponent, target: Element) {
  // 1. サーバー生成のDOM要素を探索
  const elements = target.querySelectorAll('[data-svelte-h]');
  
  // 2. 既存のDOM要素を再利用
  elements.forEach(el => {
    const hash = el.getAttribute('data-svelte-h');
    if (validateHash(hash)) {
      // DOM要素を再利用し、イベントリスナーのみ追加
      attachEventListeners(el);
    }
  });
  
  // 3. リアクティブシステムの初期化
  initializeReactivity(component);
}
```

## コード分割とチャンク戦略

### 動的インポートによるコード分割

大きなライブラリやコンポーネントを必要な時にのみロードすることで、初期バンドルサイズを削減できます。以下の例では、チャートコンポーネントを遅延ロードしています。

```typescript
// +page.svelte
<script lang="ts">
  import { onMount } from 'svelte';
  
  let ChartComponent: any;
  
  onMount(async () => {
    // 必要な時にのみチャートライブラリをロード
    const module = await import('$lib/components/Chart.svelte');
    ChartComponent = module.default;
  });
</script>

{#if ChartComponent}
  <svelte:component this={ChartComponent} data={chartData} />
{:else}
  <div class="skeleton">チャート読み込み中...</div>
{/if}
```

### ルートベースの自動分割

SvelteKitはルートごとに自動的にコードを分割します。各ページが別々のJavaScriptチャンクになり、必要なコードのみがロードされます。

```typescript
// SvelteKitは自動的にルートごとにコードを分割
// routes/
// ├── +layout.svelte     → layout.js
// ├── +page.svelte       → page.js
// ├── about/+page.svelte → about.js（別チャンク）
// └── blog/
//     └── [id]/+page.svelte → blog-[id].js（動的チャンク）
```

## パフォーマンス測定

レンダリングパイプラインのパフォーマンスを測定し、ボトルネックを特定するための実装例です。Server-Timingヘッダーを使用して、ブラウザの開発者ツールで測定結果を確認できます。

```typescript
// hooks.server.ts
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  const start = performance.now();
  
  const response = await resolve(event);
  
  const duration = performance.now() - start;
  
  // Server-Timingヘッダーで測定結果を送信
  response.headers.set(
    'Server-Timing',
    `sveltekit;dur=${duration};desc="Total SvelteKit processing"`
  );
  
  return response;
};
```

## まとめ

SvelteKitのレンダリングパイプラインは以下の特徴を持ちます。

- **コンパイル時最適化**: 実行時オーバーヘッドの最小化
- **効率的なハイドレーション**: 既存DOMの再利用
- **自動コード分割**: ルートベースの最適化
- **プログレッシブエンハンスメント**: JavaScriptなしでも動作

これらの仕組みを理解することで、より効率的なSvelteKitアプリケーションを構築できます。

## 次のステップ

- [実行環境とランタイム](../execution-environments/) - 様々な環境での動作
- [ビルド最適化](../build-optimization/) - さらなるパフォーマンス改善
- [基礎編に戻る](../../basics/) - 基本的な使い方を復習