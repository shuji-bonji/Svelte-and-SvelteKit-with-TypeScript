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
    Dev["開発者がコードを書く"]
    Build["SvelteKitがビルド"]
    Server["サーバーでHTML生成"]
    Browser["ブラウザで表示"]
    
    Dev --> Build
    Build --> Server
    Server --> Browser
    
    style Dev fill:#ff3e00,color:#fff
    style Build fill:#40b3ff,color:#fff
    style Server fill:#4CAF50,color:#fff
    style Browser fill:#FF9800,color:#fff`;


  const progressiveEnhancementDiagram = `graph TB
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

## 基本的な仕組み

SvelteKitがどのように動作するか、基本的な流れを理解しましょう。

### 基本的な動作フロー

SvelteKitがどのように動作するか、シンプルな流れで理解しましょう。

<Mermaid diagram={basicFlowDiagram} />

**主な処理の流れ**
1. 開発者がSvelteコンポーネントとTypeScriptでコードを書く
2. SvelteKitがコードをコンパイル・最適化
3. サーバーでHTMLを生成（SSR）またはビルド時に生成（SSG）
4. ブラウザで高速に表示され、その後インタラクティブ化

:::info[ファイル構造について]
SvelteKitの特殊なファイル命名規則については、[プロジェクト構造](/sveltekit/basics/project-structure/)のページで詳しく解説しています。
:::

## レンダリングモード

SvelteKitは複数のレンダリングモードを柔軟に組み合わせることができます。

### 1. サーバーサイドレンダリング（SSR）

サーバー側でHTMLを生成することで、SEO対応と初期表示の高速化を実現します。

```typescript
// +page.ts
export const ssr = true; // デフォルト

// サーバーでHTMLを生成
// - SEO対応
// - 初期表示高速
// - サーバー負荷あり
```

### 2. クライアントサイドレンダリング（CSR）

SPAとして動作し、クライアント側で動的にコンテンツを生成・更新します。

```typescript
// +page.ts
export const ssr = false;
export const csr = true;

// ブラウザでレンダリング
// - SPAとして動作
// - サーバー負荷軽減
// - SEO非対応
```

### 3. 静的サイト生成（SSG）

ビルド時にHTMLを事前生成し、CDNから配信することで最高のパフォーマンスを実現します。

```typescript
// +page.ts
export const prerender = true;

// ビルド時にHTML生成
// - 最高のパフォーマンス
// - CDN配信可能
// - 動的コンテンツ非対応
```

### 4. ハイブリッドレンダリング

ページごとに最適なレンダリング方式を選択し、パフォーマンスとユーザー体験を最大化します。

```typescript
// 各ページで個別に設定可能
// +page.ts (ホームページ：SSG)
export const prerender = true;

// +page.server.ts (ダッシュボード：SSR)
export const ssr = true;

// +page.ts (管理画面：CSR)
export const ssr = false;
```

## データの流れ

SvelteKitでは、Load関数を使ってデータを取得します。

### シンプルな例

```typescript
// +page.server.ts
export async function load() {
  // サーバーでデータを取得
  const posts = await fetchPostsFromDB();
  return {
    posts
  };
}
```

```svelte
<!-- +page.svelte -->
<script lang="ts">
  // Load関数のデータを受け取る
  export let data;
</script>

<h1>投稿一覧</h1>
{#each data.posts as post}
  <article>{post.title}</article>
{/each}
```

このシンプルなパターンで、サーバーサイドでデータを取得し、コンポーネントで表示できます。

:::info[詳細なデータフロー]
Load関数の詳細や、より複雑なデータフローについては、[データ読み込み](/sveltekit/basics/load-functions/)のページで解説しています。
:::

## プログレッシブエンハンスメント

SvelteKitの設計思想の中核：**JavaScriptが無効でも動作する**

### フォーム処理の例

JavaScriptの有無に関わらず動作するフォーム実装により、アクセシビリティと信頼性を確保します。

```svelte
<!-- JavaScript無効時：通常のフォーム送信 -->
<!-- JavaScript有効時：ページリロードなし -->
<form method="POST" use:enhance>
  <input name="email" type="email" required />
  <button type="submit">送信</button>
</form>
```

### 段階的な機能強化

HTML、CSS、JavaScriptの順に機能を追加し、すべてのユーザーに適切な体験を提供します。

<Mermaid diagram={progressiveEnhancementDiagram} />

## ビルドとデプロイメント

アダプターシステムにより、様々なプラットフォームへの柔軟なデプロイが可能です。

### アダプターシステム

SvelteKitは様々な環境にデプロイ可能

```typescript
// svelte.config.js
import adapter from '@sveltejs/adapter-node';     // Node.js
// import adapter from '@sveltejs/adapter-vercel';  // Vercel
// import adapter from '@sveltejs/adapter-netlify'; // Netlify
// import adapter from '@sveltejs/adapter-static';  // 静的サイト

export default {
  kit: {
    adapter: adapter()
  }
};
```

### アダプター選定ガイド

<Mermaid diagram={adapterChoiceFlow} />

### デプロイメントターゲット一覧

各プラットフォームに最適化されたアダプターを選択することで、最高のパフォーマンスを実現します。

| アダプター | プラットフォーム | 特徴 | 用途例 |
|-----------|-----------------|------|--------|
| **`adapter-static`** | GitHub Pages, Netlify (静的) | 静的HTML/JS/CSSで完結 | ブログ、LP、ドキュメントサイト |
| **`adapter-node`** | Node.js サーバー | 従来型サーバーで稼働 | VPS、EC2、Firebase Hosting with Functions |
| **`adapter-vercel`** | Vercel | エッジファンクション対応 | Vercel公式推奨、エッジ最適化 |
| **`adapter-netlify`** | Netlify | 自動デプロイ、専用機能対応 | Netlify Forms、Redirects活用 |
| **`adapter-cloudflare`** | Cloudflare Pages | Workers/Pages向け最適化 | Edge Functions環境 |
| **`adapter-auto`** | 汎用 | 多くの環境で自動選択 | 開発中の自動判別や汎用利用 |

## パフォーマンス最適化

SvelteKitは多くの最適化を自動で行い、高速なWebアプリケーションを実現します。

### 自動最適化機能

SvelteKitが自動的に行う最適化

```typescript
// 1. コード分割
// ルートごとに自動分割
// 必要なJSのみロード

// 2. プリフェッチ
<a href="/about" data-sveltekit-preload-data>
  <!-- ホバー時にデータを事前取得 -->
</a>

// 3. リンクプリロード
<link rel="modulepreload" href="...">
<!-- 必要なモジュールを事前読み込み -->

// 4. サービスワーカー
// オフライン対応（オプション）
```

### バンドルサイズの比較

他のフレームワークと比較して、SvelteKitは最小のバンドルサイズを実現しています。

<Mermaid diagram={bundleSizeDiagram} />

## 開発者体験（DX）

型安全性、HMR、デバッグツールなど、開発効率を最大化する機能が充実しています。

### 型安全性

自動生成される型定義により、TypeScriptの恩恵を最大限に活用できます。

```typescript
// 自動生成される型定義
import type { PageLoad } from './$types';
import type { PageData } from './$types';
import type { ActionData } from './$types';

// 完全な型補完とエラーチェック
```

### ホットモジュールリロード（HMR）

変更を即座に反映し、開発中の状態を保持したまま更新できます。

```bash
# 開発サーバー起動
npm run dev

# 即座に変更が反映
# - コンポーネントの状態を保持
# - CSSの即座更新
# - エラーオーバーレイ
```

### デバッグツール

$inspectルーンや開発環境専用の機能により、効率的なデバッグが可能です。

```typescript
// $inspectルーンでデバッグ
let count = $state(0);
$inspect(count); // コンソールに値を出力

// SvelteKit固有のデバッグ
import { dev } from '$app/environment';
if (dev) {
  console.log('開発環境のみ実行');
}
```

## 実世界での利用例

SvelteKitは様々な種類のWebアプリケーションに適していますが、特に得意とする分野があります。

### 適したユースケース

コンテンツサイト、Eコマース、ダッシュボードなど、多様な用途で活用されています。

✅ **最適な用途**
- コンテンツサイト（ブログ、ドキュメント）
- Eコマースサイト
- ダッシュボード・管理画面
- プログレッシブWebアプリ（PWA）
- JAMstackサイト

⚠️ **検討が必要な用途**
- リアルタイムコラボレーション（要WebSocket）
- 大規模エンタープライズ（エコシステムがまだ発展途上）
- ネイティブモバイルアプリ（React Native等が優位）

## 他のフレームワークとの比較

Next.js、Nuxt、Remixなどの主要フレームワークと比較した際のSvelteKitの特徴を理解しましょう。

### 主要メトリクス比較

バンドルサイズ、ビルド速度、学習曲線など、重要な指標で優れた結果を示しています。

| 項目 | SvelteKit | Next.js | Nuxt | Remix |
|------|-----------|---------|------|--------|
| **初期バンドル** | ~40KB | ~70KB | ~65KB | ~60KB |
| **ビルド速度** | ⚡ 高速 | 中速 | 中速 | 高速 |
| **ランタイムなし** | ✅ | ❌ | ❌ | ❌ |
| **TypeScript** | ✅ 完全対応 | ✅ 完全対応 | ✅ 完全対応 | ✅ 完全対応 |
| **学習曲線** | 緩やか | 急 | 中 | 中 |
| **エコシステム** | 成長中 | 巨大 | 大 | 成長中 |

:::tip[なぜSvelteKitを選ぶのか]
- **パフォーマンス重視**: 最小のバンドルサイズと高速な実行
- **シンプルさ**: 少ない記述量で多くを実現
- **標準準拠**: Web標準に近いAPI設計
- **将来性**: コンパイラベースの革新的アプローチ
:::

## セキュリティ機能

CSRF保護、XSS対策、CSPヘッダーなど、Webアプリケーションのセキュリティを標準で提供します。

### 組み込みのセキュリティ対策

追加設定なしで基本的なセキュリティ対策が有効になり、安全なアプリケーションを構築できます。

```typescript
// CSRF保護
// フォーム送信時に自動的にトークン検証

// XSS対策
// テンプレート内の自動エスケープ
<div>{userInput}</div> // 自動的にエスケープ

// CSPヘッダー
// svelte.config.jsで設定可能
export default {
  kit: {
    csp: {
      directives: {
        'script-src': ['self']
      }
    }
  }
};
```

## エコシステムと統合

豊富なライブラリとツールとの統合により、複雑な要件にも対応可能です。

### 主要なツール・ライブラリ

状態管理、フォーム処理、認証、データベース連携など、必要な機能を簡単に追加できます。

```typescript
// 状態管理
import { writable } from 'svelte/store';

// フォームライブラリ
import { superForm } from 'sveltekit-superforms';

// 認証
import { Auth } from '@auth/sveltekit';

// データベースORM
import { PrismaClient } from '@prisma/client';

// テスティング
import { render } from '@testing-library/svelte';
import { expect, test } from '@playwright/test';
```

## まとめ

SvelteKitは現代的なWebアプリケーション開発に必要なすべてを提供する、完成度の高いフレームワークです。

SvelteKitは、
- **モダン**: 最新のWeb標準に準拠
- **高速**: コンパイル時最適化による高パフォーマンス
- **柔軟**: SSR/SSG/CSRを自由に組み合わせ
- **堅牢**: プログレッシブエンハンスメント
- **生産的**: 優れた開発者体験

:::tip[次に学ぶこと]
基本を理解したら、[プロジェクト構造](/sveltekit/basics/project-structure/)のページで、実際のファイル構成と規約を詳しく学びましょう。
:::

## 次のステップ

[プロジェクト構造](/sveltekit/basics/project-structure/)で、SvelteKitプロジェクトのファイル構成と各ファイルの役割について詳しく学びましょう。