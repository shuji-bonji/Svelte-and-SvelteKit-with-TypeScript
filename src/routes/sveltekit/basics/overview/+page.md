---
title: SvelteKit概要とアーキテクチャ
description: SvelteKitの全体像を理解する - フルスタックフレームワークの設計思想からアーキテクチャまで
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

  const renderingPipelineDiagram = `graph LR
    subgraph "ビルド時"
        Source["ソースコード<br/>(.svelte, .ts)"] 
        --> Compile["Svelteコンパイラ"]
        --> Bundle["Viteバンドル"]
    end
    
    subgraph "実行時"
        Bundle --> SSR["サーバーサイド<br/>レンダリング"]
        SSR --> HTML["HTML生成"]
        HTML --> Hydration["ハイドレーション"]
        Hydration --> SPA["SPAモード"]
    end
    
    style Compile fill:#ff3e00,color:#fff
    style SSR fill:#40b3ff,color:#fff`;

  const dataFlowDiagram = `sequenceDiagram
    participant Browser
    participant Server
    participant Database
    
    Browser->>Server: ページリクエスト
    
    rect rgba(255, 62, 0, 0.1)
        Note over Server: +layout.server.ts
        Server->>Database: データ取得
        Database-->>Server: レイアウトデータ
    end
    
    rect rgba(64, 179, 255, 0.1)
        Note over Server: +page.server.ts
        Server->>Database: ページデータ取得
        Database-->>Server: ページデータ
    end
    
    Server->>Server: HTML生成（SSR）
    Server-->>Browser: HTML + データ
    
    rect rgba(76, 175, 80, 0.1)
        Note over Browser: ハイドレーション
        Browser->>Browser: イベントリスナー登録
        Browser->>Browser: SPAモード開始
    end`;

  const progressiveEnhancementDiagram = `graph TB
    HTML["1. HTML<br/>基本機能"]
    CSS["2. CSS<br/>見た目の改善"]
    JS["3. JavaScript<br/>インタラクティブ性"]
    
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

  const bundleSizeDiagram = `graph BH
    subgraph "初期バンドルサイズ"
        Next["Next.js<br/>~70KB"]
        Nuxt["Nuxt<br/>~65KB"]
        SvelteKit["SvelteKit<br/>~40KB"]
    end
    
    style SvelteKit fill:#4CAF50,color:#fff
    style Next fill:#ff6b6b
    style Nuxt fill:#ffa94d`;
</script>

---
title: SvelteKit概要とアーキテクチャ
description: SvelteKitの全体像を理解する - フルスタックフレームワークの設計思想からアーキテクチャまで
---

SvelteKitは、Svelteを基盤とした**フルスタックWebアプリケーションフレームワーク**です。Next.js（React）やNuxt（Vue）に相当する位置づけでありながら、より軽量で高速、そして開発者体験に優れた設計となっています。このページでは、SvelteKitの全体像とアーキテクチャを詳しく解説します。

## SvelteKitとは何か

### フレームワークの位置づけ

<Mermaid diagram={frameworkPositionDiagram} />

### 主要な特徴

| 特徴 | 説明 |
|------|------|
| **ファイルベースルーティング** | ディレクトリ構造がそのままURLになる |
| **サーバーサイドレンダリング（SSR）** | SEO最適化と初期表示の高速化 |
| **静的サイト生成（SSG）** | ビルド時にHTMLを生成 |
| **APIルート** | バックエンドAPIを同一プロジェクトで管理 |
| **プログレッシブエンハンスメント** | JavaScriptなしでも動作する堅牢性 |
| **型安全性** | TypeScriptによる完全な型サポート |
| **ゼロコンフィグ** | 設定なしですぐに開発開始可能 |

## アーキテクチャ概要

### レンダリングパイプライン

<Mermaid diagram={renderingPipelineDiagram} />

### コンポーネントアーキテクチャ

```typescript
// SvelteKitのコンポーネント階層
interface SvelteKitArchitecture {
  app: {
    layout: {                    // +layout.svelte
      page: Component            // +page.svelte
      error: ErrorComponent      // +error.svelte
    }
  }
  
  server: {
    hooks: Handle               // hooks.server.ts
    load: ServerLoad           // +page.server.ts
    actions: Actions           // +page.server.ts
    api: RequestHandler        // +server.ts
  }
  
  universal: {
    load: UniversalLoad       // +page.ts
    layout: LayoutLoad        // +layout.ts
  }
}
```

## レンダリングモード

SvelteKitは複数のレンダリングモードを柔軟に組み合わせることができます。

### 1. サーバーサイドレンダリング（SSR）

```typescript
// +page.ts
export const ssr = true; // デフォルト

// サーバーでHTMLを生成
// - SEO対応
// - 初期表示高速
// - サーバー負荷あり
```

### 2. クライアントサイドレンダリング（CSR）

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

```typescript
// +page.ts
export const prerender = true;

// ビルド時にHTML生成
// - 最高のパフォーマンス
// - CDN配信可能
// - 動的コンテンツ非対応
```

### 4. ハイブリッドレンダリング

```typescript
// 各ページで個別に設定可能
// +page.ts (ホームページ：SSG)
export const prerender = true;

// +page.server.ts (ダッシュボード：SSR)
export const ssr = true;

// +page.ts (管理画面：CSR)
export const ssr = false;
```

## データフローアーキテクチャ

### Load関数の実行フロー

<Mermaid diagram={dataFlowDiagram} />

### データの流れ

```typescript
// 1. サーバーサイドLoad（+page.server.ts）
export const load: PageServerLoad = async ({ cookies, locals }) => {
  // データベースアクセス
  // 秘密情報の扱い
  // Cookieの読み取り
  const user = await db.user.findUnique({
    where: { id: locals.userId }
  });
  
  return {
    user // Dateオブジェクトも可
  };
};

// 2. ユニバーサルLoad（+page.ts）
export const load: PageLoad = async ({ data, fetch }) => {
  // data: サーバーLoadの結果
  // 追加のAPI呼び出し
  const posts = await fetch('/api/posts').then(r => r.json());
  
  return {
    ...data,
    posts // シリアライズ可能な値のみ
  };
};

// 3. コンポーネント（+page.svelte）
<script lang="ts">
  import type { PageData } from './$types';
  
  export let data: PageData;
  // data.user と data.posts が利用可能
</script>
```

## プログレッシブエンハンスメント

SvelteKitの設計思想の中核：**JavaScriptが無効でも動作する**

### フォーム処理の例

```svelte
<!-- JavaScript無効時：通常のフォーム送信 -->
<!-- JavaScript有効時：ページリロードなし -->
<form method="POST" use:enhance>
  <input name="email" type="email" required />
  <button type="submit">送信</button>
</form>
```

### 段階的な機能強化

<Mermaid diagram={progressiveEnhancementDiagram} />

## ビルドとデプロイメント

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

### デプロイメントターゲット

| プラットフォーム | アダプター | 特徴 |
|-----------------|-----------|------|
| **Vercel** | `@sveltejs/adapter-vercel` | エッジファンクション対応 |
| **Netlify** | `@sveltejs/adapter-netlify` | 自動デプロイ |
| **Node.js** | `@sveltejs/adapter-node` | 従来型サーバー |
| **静的ホスティング** | `@sveltejs/adapter-static` | GitHub Pages等 |
| **Cloudflare** | `@sveltejs/adapter-cloudflare` | Workers/Pages |
| **AWS** | コミュニティアダプター | Lambda/Amplify |

## パフォーマンス最適化

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

<Mermaid diagram={bundleSizeDiagram} />

## 開発者体験（DX）

### 型安全性

```typescript
// 自動生成される型定義
import type { PageLoad } from './$types';
import type { PageData } from './$types';
import type { ActionData } from './$types';

// 完全な型補完とエラーチェック
```

### ホットモジュールリロード（HMR）

```bash
# 開発サーバー起動
npm run dev

# 即座に変更が反映
# - コンポーネントの状態を保持
# - CSSの即座更新
# - エラーオーバーレイ
```

### デバッグツール

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

### 適したユースケース

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

### 主要メトリクス比較

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

### 組み込みのセキュリティ対策

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

### 主要なツール・ライブラリ

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

SvelteKitは、
- **モダン**: 最新のWeb標準に準拠
- **高速**: コンパイル時最適化による高パフォーマンス
- **柔軟**: SSR/SSG/CSRを自由に組み合わせ
- **堅牢**: プログレッシブエンハンスメント
- **生産的**: 優れた開発者体験

:::info[アーキテクチャの詳細]
より詳しいアーキテクチャの理解には、[プロジェクト構造](/sveltekit/project-structure/)のページで、実際のファイル構成と役割を学びましょう。
:::

## 次のステップ

[プロジェクト構造](/sveltekit/project-structure/)で、SvelteKitプロジェクトのファイル構成と各ファイルの役割について詳しく学びましょう。