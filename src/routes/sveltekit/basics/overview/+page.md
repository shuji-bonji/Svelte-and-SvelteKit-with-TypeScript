---
title: SvelteKit概要
description: SvelteKitの全体像を理解する - フルスタックフレームワークの基本概念と特徴
---

<script>
  import Mermaid from '$lib/components/Mermaid.svelte';
  
  const frameworkPositionDiagram = `graph TB
    subgraph "フロントエンドフレームワーク"
        React
        Vue
        Svelte
    end
    
    subgraph "フルスタックフレームワーク"
        Next["Next.js<br/>(React)"]
        Nuxt["Nuxt<br/>(Vue)"]
        SvelteKit["SvelteKit<br/>(Svelte)"]
    end
    
    React --> Next
    Vue --> Nuxt
    Svelte --> SvelteKit
    
    style SvelteKit fill:#ff3e00,color:#fff`;

  const basicFlowDiagram = `graph TB
    Server@{ shape: cyl, label: "     " }
    Dev["1.開発者がコードを書く"]
    Build["2.SvelteKitがビルド"]
    Generate["リクエスト時にHTML生成(SSR)"]
    GenerateSSG["ビルド時にHTML生成(SSG)"]
    GenerateCSR["クライアントでレンダリング(CSR/SPA)"]
    Browser["ブラウザで表示"]
    
    subgraph "3.実行"
        direction TB
        subgraph "サーバー環境"
            direction LR
            Server
            Generate
            GenerateSSG
        end
        
        subgraph "ブラウザ環境"
            direction LR
            GenerateCSR
            Browser
        end
    end


    Dev --> Build
    Build --> Server
    Build --> GenerateSSG
    GenerateSSG ---> Server
    Server --> Generate
    Generate --> Browser
    GenerateCSR --> Browser
    Server --"事前生成済みHTML(SSG)"-->  Browser
    Server --"JavaScriptバンドル(CSR)"-->  GenerateCSR
    
    style Dev fill:#ff3e00,color:#fff
    style Build fill:#40b3ff,color:#fff
    style Browser fill:#FF9800,color:#fff
    style GenerateCSR fill:#9C27B0,color:#fff`;

  const progressiveEnhancementDiagram = `graph LR
    HTML[1.HTML<br/>基本機能]
    CSS["2.CSS<br/>見た目の改善"]
    JS["3.JavaScript<br/>インタラクティブ性"]
    
    HTML --> CSS
    CSS --> JS
    
    Note1["すべてのユーザーが<br/>アクセス可能"]
    Note2["より良い体験"]
    Note3["最高の体験"]
    
    HTML -.-> Note1
    CSS -.-> Note2
    JS -.-> Note3
    
    style HTML fill:#4CAF50,color:#fff
    style CSS fill:#2196F3,color:#fff
    style JS fill:#FF9800,color:#fff`;

  const bundleSizeDiagram = `graph BT
    subgraph "初期バンドルサイズ"
        Next["Next.js<br/>~70KB"]
        Nuxt["Nuxt<br/>~65KB"]
        SvelteKit["SvelteKit<br/>~40KB"]
    end
    
    style SvelteKit fill:#4CAF50,color:#fff
    style Next fill:#ff6b6b
    style Nuxt fill:#ffa94d`;

  const adapterChoiceFlow = `flowchart TD
    Q1(SSRやAPIを使いたい？) -->|Yes| Q2(どこにホスティングする？)
    Q1 -->|No（静的サイトでOK）| A1[✅ adapter-static]

    Q2 --> Q2A[自前Node.js環境がある？]
    Q2A -->|Yes| A2[✅ adapter-node]
    Q2A -->|No| Q2B[どのサービス？]

    Q2B -->|Vercel| A3[✅ adapter-vercel]
    Q2B -->|Netlify| A4[✅ adapter-netlify]
    Q2B -->|Cloudflare Pages| A5[✅ adapter-cloudflare]
    Q2B -->|その他のサーバレス| A6[✅ adapter-auto（推奨）]`;

  const dataLoadFlow = `flowchart TB
    subgraph Browser["🌐 ブラウザ（クライアント）"]
        Request[ページリクエスト]
        ClientLoad["+page.ts<br/>load()"]
        Component["+page.svelte<br/>data prop"]
    end
    
    subgraph Server["🖥️ サーバー"]
        ServerLoad["+page.server.ts<br/>load()"]
    end
    
    Request --> ServerLoad
    ServerLoad --> ClientLoad
    ClientLoad --> Component
    
    style ServerLoad fill:#4CAF50,color:#fff
    style ClientLoad fill:#2196F3,color:#fff
    style Component fill:#ff3e00,color:#fff`;

  const apiRouteDiagram = `flowchart LR
    subgraph Client["🌐 クライアント"]
        FrontEnd[フロントエンド<br/>+page.svelte]
        FetchAPI["fetch('/api/posts')"]
    end
    
    subgraph SvelteKit["⚡ SvelteKit"]
        APIRoute[+server.ts<br/>APIルート]
        GET["GET()"]
        POST["POST()"]
        PUT["PUT()"]
        DELETE["DELETE()"]
    end
    
    subgraph External["🗄️ データソース"]
        DB[(データベース)]
        ExtAPI[外部API]
    end
    
    FrontEnd --> FetchAPI
    FetchAPI --> APIRoute
    APIRoute --> GET
    APIRoute --> POST
    APIRoute --> PUT
    APIRoute --> DELETE
    GET --> DB
    POST --> DB
    GET --> ExtAPI
    
    style APIRoute fill:#4CAF50,color:#fff
    style FrontEnd fill:#ff3e00,color:#fff
    style DB fill:#2196F3,color:#fff`;
</script>


SvelteKitは、Svelteを基盤とした**フルスタックWebアプリケーションフレームワーク**です。このページでは、SvelteKitの全体像と基本的な概念を理解します。

## SvelteKitとは何か

Svelteをベースにしたフルスタックフレームワークで、サーバーサイド機能とクライアントサイド機能を統合し、モダンなWebアプリケーションを効率的に構築できます。

### フレームワークの位置づけ

Next.js（React）やNuxt（Vue）に相当する位置づけでありながら、より軽量で高速、そして開発者体験に優れた設計となっています。

<Mermaid diagram={frameworkPositionDiagram} />

### 主要な特徴

SvelteKitは開発効率とパフォーマンスを両立させる多くの機能を標準で提供しています。

| 特徴 | 説明 |
|------|------|
| **ファイルベースルーティング** | ディレクトリ構造がそのままURLになる |
| **サーバーサイドレンダリング（SSR）** | SEO最適化と初期表示の高速化 |
| **静的サイト生成（SSG）** | ビルド時にHTMLを生成 |
| **APIルート** | バックエンドAPIを同一プロジェクトで管理 |
| **プログレッシブエンハンスメント** | JavaScriptなしでも動作する堅牢性 |
| **型安全性** | TypeScriptによる完全な型サポート |
| **ゼロコンフィグ** | 設定なしですぐに開発開始可能 |

## 基本的な動作フロー

SvelteKitがどのように動作するか、開発からデプロイまでの流れを理解しましょう。

<Mermaid diagram={basicFlowDiagram} />

**3つのフェーズとレンダリングモード**
1. **開発**: Svelteコンポーネントの作成とTypeScriptでの型定義
2. **ビルド**: コンパイルと最適化、成果物の生成
3. **実行**: 
   - **SSR**: サーバーでリクエスト時にHTML生成
   - **SSG**: ビルド時に事前にHTML生成
   - **CSR/SPA**: ブラウザでJavaScriptによりレンダリング


## ファイルベースルーティング

SvelteKitでは、ディレクトリ構造がそのままURLになる直感的なルーティングシステムを採用しています。

```
src/routes/
├── +page.svelte          → /
├── about/+page.svelte    → /about
└── blog/
    ├── +page.svelte      → /blog
    └── [id]/+page.svelte → /blog/:id
```

:::info[詳細を学ぶ]
[プロジェクト構造](/sveltekit/basics/project-structure/)と[ルーティング詳解](/sveltekit/routing/)で詳しく解説しています。
:::

## レンダリングモード

ページごとに最適なレンダリング方式を選択できます。

| モード | 用途 | 特徴 |
|------|------|------|
| **SSR** | 動的コンテンツ | SEO対応、リアルタイムデータ |
| **SSG** | 静的コンテンツ | 最高速、CDN配信可能 |
| **CSR** | インタラクティブアプリ | SPA体験、クライアント処理 |

:::tip[詳細な解説]
[レンダリング戦略とアーキテクチャパターン](/deep-dive/rendering-strategies/)で各戦略を深く解説しています。
:::

## Load関数とデータフェッチング

サーバーとクライアントの両方でデータを取得できる統一されたパターンです。Load関数は、ページのレンダリング前に必要なデータを取得し、コンポーネントに自動的に渡す仕組みを提供します。

### Load関数の主要な特徴
- **Universal Load** (`+page.ts`): サーバーとクライアント両方で実行可能、公開データの取得に最適
- **Server Load** (`+page.server.ts`): サーバーのみで実行、秘密情報やDB接続を安全に扱える
- **自動的な型生成**: TypeScriptの型が自動生成され、完全な型安全性を実現

<Mermaid diagram={dataLoadFlow} />

```typescript
// +page.server.ts（サーバー側）
export async function load() {
  const posts = await fetchPosts();
  return { posts };
}
```

```svelte
<!-- +page.svelte（コンポーネント） -->
<script lang="ts">
  export let data; // Load関数から自動的に渡される
</script>

{#each data.posts as post}
  <article>{post.title}</article>
{/each}
```

:::info[詳細を学ぶ]
[Load関数とデータフェッチング](/sveltekit/data-loading/)でLoad関数の使い方を、[データロードフロー](/sveltekit/architecture/data-loading/)で内部動作を解説しています。
:::

## APIルート

同一プロジェクト内でRESTful APIを構築できます。フロントエンドとバックエンドが統合された開発体験を提供します。

<Mermaid diagram={apiRouteDiagram} />

### APIルートの特徴

- **統一されたプロジェクト**: フロントエンドとAPIが同じコードベース
- **型安全**: TypeScriptで型定義を共有
- **HTTPメソッド対応**: GET、POST、PUT、DELETE、PATCHをサポート
- **自動ルーティング**: ファイル名（`+server.ts`）でエンドポイント作成

### 実装例

```typescript
// src/routes/api/hello/+server.ts（最小限のAPI）
import { json } from '@sveltejs/kit';

export const GET = () => {
  return json({ message: 'Hello from API' });
};
```

```svelte
<!-- フロントエンドから呼び出し -->
<script lang="ts">
  async function callAPI() {
    const res = await fetch('/api/hello');
    const data = await res.json();
    console.log(data.message); // "Hello from API"
  }
</script>
```

:::info[詳細を学ぶ]
[APIルート設計](/sveltekit/server/api-routes/)でRESTful APIの構築方法を詳しく解説しています。
:::

## プログレッシブエンハンスメント

JavaScriptが無効でも動作する堅牢なアプリケーションを構築できます。SvelteKitは「まずHTMLで動作し、JavaScriptで強化する」という設計思想を採用しています。

<Mermaid diagram={progressiveEnhancementDiagram} />

### 実践的な例

**1. 基本のHTML（JavaScriptなしでも動作）**
```html
<form method="POST" action="?/login">
  <input name="email" type="email" required>
  <input name="password" type="password" required>
  <button type="submit">ログイン</button>
</form>
```

**2. CSSで見た目と使い勝手を改善**
```css
/* HTML5のバリデーション状態に応じたスタイリング */
input:required {
  border-left: 3px solid #ff6b6b;
}

input:valid {
  border-left: 3px solid #51cf66;
}

input:invalid:not(:placeholder-shown) {
  background-color: #ffe3e3;
}

input:focus:invalid {
  outline-color: #ff6b6b;
}

/* 無効な入力時のヒント表示 */
input:invalid:not(:placeholder-shown) + .hint {
  display: block;
  color: #ff6b6b;
}
```

**3. JavaScriptで強化（use:enhance）**
```svelte
<script>
  import { enhance } from '$app/forms';
  let loading = false;
</script>

<form method="POST" action="?/login" use:enhance={() => {
  loading = true;
  return async ({ update }) => {
    await update();
    loading = false;
  };
}}>
  <input name="email" type="email" required>
  <input name="password" type="password" required>
  <button type="submit" disabled={loading}>
    {loading ? 'ログイン中...' : 'ログイン'}
  </button>
</form>
```

### プログレッシブエンハンスメントの利点

- **アクセシビリティ向上**: スクリーンリーダーや低速回線でも確実に動作
- **SEO最適化**: 検索エンジンが内容を正しく理解
- **信頼性**: JavaScriptエラーが発生しても基本機能は維持
- **パフォーマンス**: 初期表示が高速で、段階的に機能を追加

:::info[詳細を学ぶ]
[フォーム処理とActions](/sveltekit/server/forms/)で実装方法を詳しく解説しています。
:::

## 型安全性

TypeScriptによる完全な型サポートで、開発時のエラーを防ぎます。

```typescript
// ./$typesから自動生成される型
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
  // 型安全なデータ取得
};
```

:::info[詳細を学ぶ]
[SvelteKitが自動生成する型](/deep-dive/auto-generated-types/)で型システムの詳細を解説しています。
:::

## デプロイメント - アダプターシステム

SvelteKitの**アダプターシステム**により、一つのコードベースから様々なプラットフォームへ最適化されたビルドを生成できます。

### アダプターとは

アダプターは、SvelteKitアプリケーションを**特定のホスティング環境向けに変換**するプラグインです。

<Mermaid diagram={adapterChoiceFlow} />

### 主要なアダプターの例

- **`adapter-static`**: GitHub Pages、S3などの静的ホスティング向け
- **`adapter-node`**: Node.jsサーバー、Docker、VPS向け  
- **`adapter-vercel`**: Vercel のEdge/Serverless Functions向け
- **`adapter-cloudflare`**: Cloudflare Workers/Pages向け
- **`adapter-auto`**: プラットフォームを自動検出（推奨）

### 基本的な使い方

```javascript
// svelte.config.js
import adapter from '@sveltejs/adapter-auto';

export default {
  kit: {
    adapter: adapter() // 自動でプラットフォームを検出
  }
};
```

同じコードベースから、設定を変えるだけで、
- **静的サイト** (HTML/CSS/JS)
- **Node.jsアプリ** (Express互換)
- **エッジ関数** (Cloudflare Workers)
- **サーバーレス関数** (Vercel、Netlify)

などに変換できます。

:::info[詳細を学ぶ]
[プラットフォーム別デプロイ](/sveltekit/deployment/platforms/)で各アダプターの詳細設定とベストプラクティスを解説しています。
:::

## ゼロコンフィグ - すぐに始められる開発体験

SvelteKitは**設定なしですぐに開発を始められる**ように設計されています。

### デフォルトで含まれる機能

```bash
npm create svelte@latest my-app
cd my-app
npm install
npm run dev
```

これだけで以下がすべて設定済み

- ✅ **開発サーバー**: HMR（ホットモジュールリプレースメント）対応
- ✅ **TypeScript**: 型チェックとインテリセンス
- ✅ **ルーティング**: ファイルベースの自動ルーティング
- ✅ **ビルドツール**: Viteによる高速ビルド
- ✅ **CSS処理**: PostCSS、Sass、Tailwind対応
- ✅ **テスト環境**: Vitest、Playwright設定済み
- ✅ **Linter/Formatter**: ESLint、Prettier設定済み

### 必要に応じて追加

ゼロコンフィグでも、必要な時に簡単に拡張可能  

```javascript
// vite.config.js - 必要な時だけカスタマイズ
export default defineConfig({
  // デフォルト設定を上書き
});
```

:::tip[開発効率]
webpack.config.jsのような複雑な設定ファイルは不要。SvelteKitが最適な設定を提供し、必要な時だけオーバーライドできます。
:::

## パフォーマンスの優位性

SvelteKitはコンパイル時最適化により、他フレームワークより小さいバンドルサイズを実現します。

<Mermaid diagram={bundleSizeDiagram} />

:::info[詳細を学ぶ]
パフォーマンス最適化の詳細は、最適化編で解説予定です。
:::



## なぜSvelteKitを選ぶのか

### 他フレームワークとの比較

| 項目 | SvelteKit | Next.js | Nuxt | Remix |
|------|-----------|---------|------|--------|
| **初期バンドル** | ~40KB | ~70KB | ~65KB | ~60KB |
| **Virtual DOM** | 不要 | 必要 | 必要 | 必要 |
| **学習曲線** | 緩やか | 急 | 中 | 中 |

:::tip[SvelteKitの優位性]
- **パフォーマンス**: 最小のバンドルサイズと高速実行
- **シンプルさ**: 少ない記述量で多くを実現
- **Web標準準拠**: 標準に近いAPI設計
:::


## まとめ

SvelteKitは、Svelteの優れたパフォーマンスとシンプルさを活かしたフルスタックフレームワークです。ファイルベースルーティング、柔軟なレンダリングモード、プログレッシブエンハンスメントなど、モダンなWebアプリケーション開発に必要な機能をすべて備えています。

## 学習の次のステップ

1. **[プロジェクト構造](/sveltekit/basics/project-structure/)** - ファイル構成と規約を理解する
2. **[ルーティング詳解](/sveltekit/routing/)** - URL設計とナビゲーション
3. **[Load関数とデータフェッチング](/sveltekit/data-loading/)** - データ取得戦略
4. **サーバーサイド編** - フォーム処理とAPIルート（準備中）