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

  const basicFlowDiagram = `graph LR
    Server@{ shape: cyl, label: "     " }
    Dev["開発者がコードを書く"]
    Build["SvelteKitがビルド"]
    Generate["リクエスト時にHTML生成(SSR)"]
    GenerateSSG["ビルド時にHTML生成(SSG)"]
    Browser["ブラウザで表示"]
    
    subgraph "サーバー環境"
        Server
        Generate
        GenerateSSG
    end

    Dev --> Build
    Build --> Server
    Build --> GenerateSSG
    GenerateSSG --> Server
    Server --> Generate
    Generate --> Browser
    Server --"事前生成済みHTML(SSG)"-->  Browser
    
    style Dev fill:#ff3e00,color:#fff
    style Build fill:#40b3ff,color:#fff
    style Browser fill:#FF9800,color:#fff`;

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

**3つのフェーズ**
1. **開発**: Svelteコンポーネントの作成とTypeScriptでの型定義
2. **ビルド**: コンパイルと最適化、成果物の生成
3. **実行**: レンダリング方式に応じたHTML生成と配信


## ファイルベースルーティング

ディレクトリ構造がそのままURLになる直感的なルーティングシステムです。

```
src/routes/
├── +page.svelte          → /
├── about/+page.svelte    → /about
└── blog/
    ├── +page.svelte      → /blog
    └── [id]/+page.svelte → /blog/:id
```

:::info[詳細を学ぶ]
[プロジェクト構造](/sveltekit/basics/project-structure/)と[ルーティング詳解](/sveltekit/basics/routing/)で詳しく解説しています。
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

サーバーとクライアントの両方でデータを取得できる統一されたパターンです。

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
[Load関数とデータフェッチング](/sveltekit/basics/load-functions/)でLoad関数の使い方を、[データロードフロー](/sveltekit/architecture/data-loading/)で内部動作を解説しています。
:::

## APIルート

同一プロジェクト内でRESTful APIを構築できます。

```typescript
// +server.ts
export async function GET() {
  return json({ message: 'Hello API' });
}
```

:::info[詳細を学ぶ]
APIルートの詳細は、サーバーサイド編で解説予定です。
:::

## プログレッシブエンハンスメント

JavaScriptが無効でも動作する堅牢なアプリケーションを構築できます。

<Mermaid diagram={progressiveEnhancementDiagram} />

:::info[詳細を学ぶ]
フォーム処理とActionsの詳細は、サーバーサイド編で解説予定です。
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

## デプロイメント

アダプターシステムにより、様々なプラットフォームへ簡単にデプロイできます。

```typescript
// svelte.config.js
import adapter from '@sveltejs/adapter-auto';

export default {
  kit: {
    adapter: adapter() // 自動でプラットフォームを検出
  }
};
```

:::info[詳細を学ぶ]
[プラットフォーム別デプロイ](/sveltekit/deployment/platforms/)でアダプターの選択と設定方法を解説しています。
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
2. **[ルーティング詳解](/sveltekit/basics/routing/)** - URL設計とナビゲーション
3. **[Load関数とデータフェッチング](/sveltekit/basics/load-functions/)** - データ取得戦略
4. **サーバーサイド編** - フォーム処理とAPIルート（準備中）