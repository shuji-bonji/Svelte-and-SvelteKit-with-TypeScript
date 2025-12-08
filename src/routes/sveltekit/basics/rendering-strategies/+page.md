---
title: レンダリング戦略（基礎）
description: SvelteKitのSSR/SSG/SPAをTypeScriptで比較。prerenderやssr設定、データ取得フロー、ハイドレーションとキャッシュ戦略、SEOと初期表示速度のトレードオフまで網羅し、実装手順と判断軸を示す実践ガイド。導入前のチェックリストと落とし穴まとめ。詳しい手順とチェックリスト付き
---

<script>
  import Mermaid from '$lib/components/Mermaid.svelte';
  
  const renderingComparison = `graph TB
    subgraph SSR["SSR (Server-Side Rendering)"]
      SSR1["リクエスト時にサーバーでHTML生成"]
      SSR2["動的コンテンツに最適"]
      SSR3["SEO対応"]
    end
    
    subgraph SSG["SSG (Static Site Generation)"]
      SSG1["ビルド時にHTML生成"]
      SSG2["高速配信"]
      SSG3["CDN配信に最適"]
    end
    
    subgraph SPA["SPA (Single Page Application)"]
      SPA1["クライアントでレンダリング"]
      SPA2["インタラクティブ"]
      SPA3["オフライン対応可能"]
    end
    
    style SSR fill:#ff6b6b,color:#fff
    style SSG fill:#4ecdc4,color:#fff
    style SPA fill:#45b7d1,color:#fff`;
</script>

SvelteKitは複数のレンダリング戦略をサポートし、ページごとに最適な方法を選択できます。このページでは、SvelteKitで利用できる**SSR、SSG、SPA**の3つの基本的なレンダリング戦略の実装方法を解説します。

:::info[さらに詳しく学ぶ]
レンダリング戦略の理論的背景、SPA/MPAアーキテクチャ、ISRなどの高度な手法、パフォーマンス指標の詳細については、[レンダリング戦略とアーキテクチャパターン](/sveltekit/architecture/rendering-strategies/)で包括的に解説しています。
:::

## レンダリング戦略の概要

<Mermaid diagram={renderingComparison} />

### 3つの主要な戦略

| 戦略 | 実行タイミング | 最適な用途 | SEO | 初期表示速度 |
|------|--------------|------------|-----|-------------|
| **SSR** | リクエスト時 | 動的コンテンツ、リアルタイムデータ | ◎ | ○ |
| **SSG** | ビルド時 | 静的コンテンツ、ブログ、ドキュメント | ◎ | ◎ |
| **SPA** | クライアント側 | 管理画面、インタラクティブアプリ | △ | △ |

## SSR（サーバーサイドレンダリング）

SSR（Server-Side Rendering）は、ユーザーからのリクエストを受けるたびにサーバー側でHTMLを動的に生成する戦略です。リアルタイムデータや個人化されたコンテンツを扱うWebアプリケーションに最適で、SEOとユーザー体験のバランスを取ることができます。

### 基本的な仕組み

SSRでは、ブラウザからのリクエストを受けると、サーバー上でSvelteコンポーネントを実行し、データを取得してHTMLを生成します。生成されたHTMLはデータが埋め込まれた状態でクライアントに送信され、その後JavaScriptによってハイドレーションされます。

#### サーバーサイドのデータ取得

SSRでは、`+page.server.ts`ファイルを使用してサーバー側でデータを取得します。このファイルはNode.jsや他のサーバーランタイムで実行され、データベースへの直接アクセスや環境変数の読み取りなど、サーバー固有の処理が可能です。

```typescript
// +page.server.ts
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
  // サーバー側で実行され、HTMLに含まれる
  const response = await fetch('/api/posts');
  const posts = await response.json();
  
  return {
    posts, // このデータはHTMLに埋め込まれる
    timestamp: new Date().toISOString() // リクエスト時の時刻
  };
};
```

### メリット
- **SEO最適化**: 完全なHTMLが返される
- **動的コンテンツ**: リアルタイムデータの表示
- **初期表示**: データ込みのHTMLで高速表示

### デメリット
- サーバー負荷が高い
- CDNキャッシュが効きにくい
- レスポンス時間がサーバー処理に依存

## SSG（静的サイト生成）

SSG（Static Site Generation）は、ビルド時にすべてのページを事前に生成し、静的なHTMLファイルとして配信する戦略です。コンテンツの更新頻度が低く、高速な配信が求められるWebサイトに最適です。ブログ、ドキュメントサイト、企業サイトなどで広く採用されています。

### 基本的な仕組み

SSGでは、`npm run build`実行時にすべてのページのHTMLが生成されます。データの取得もビルド時に行われ、生成されたHTMLファイルはCDNから高速に配信できます。コンテンツを更新する際は、再ビルドとデプロイが必要になります。

#### ビルド時のプリレンダリング設定

SSGを有効にするには、`prerender`オプションを`true`に設定します。これにより、ビルド時にページが事前生成され、静的ファイルとして出力されます。生成されたHTMLには、ビルド時に取得したデータがすでに含まれているため、クライアントでの追加のデータ取得は不要です。

```typescript
// +page.ts
import type { PageLoad } from './$types';

export const prerender = true; // SSGを有効化

export const load: PageLoad = async ({ fetch }) => {
  // ビルド時に実行される
  const response = await fetch('/api/static-data');
  const data = await response.json();
  
  return {
    data,
    generatedAt: new Date().toISOString() // ビルド時の時刻
  };
};
```

### メリット
- **超高速配信**: 静的ファイルとして配信
- **CDN最適**: エッジ配信で低レイテンシー
- **低コスト**: サーバー処理不要

### デメリット
- 動的コンテンツには不向き
- ビルド時間が長くなる可能性
- 更新にはリビルドが必要

## SPA（シングルページアプリケーション）

SPA（Single Page Application）は、初回ロード時に最小限のHTMLを配信し、その後のレンダリングとルーティングをすべてクライアント側のJavaScriptで処理する戦略です。高度なインタラクティビティが求められる管理画面やダッシュボード、リアルタイムアプリケーションに適しています。

### 基本的な仕組み

SPAモードでは、サーバーはほぼ空のHTMLシェルとJavaScriptバンドルのみを配信します。ページの内容はクライアント側でJavaScriptが実行された後に描画され、以降のページ遷移もクライアント側のルーティングで処理されます。

#### クライアントサイドレンダリングの設定

SPAモードを有効にするには、`ssr`を`false`に設定します。これにより、サーバーサイドレンダリングが無効化され、すべてのレンダリングがブラウザ上で行われます。データの取得もクライアント側で実行され、APIエンドポイントへの直接アクセスが必要になります。

```typescript
// +layout.ts
export const ssr = false; // SPAモードを有効化
export const prerender = false;

// +page.ts
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
  // クライアント側でのみ実行
  const response = await fetch('/api/data');
  const data = await response.json();
  
  return { data };
};
```

### メリット
- **リッチなUI**: 高度なインタラクション
- **オフライン対応**: Service Workerと組み合わせ
- **状態管理**: クライアント側で完全制御

### デメリット
- SEOに弱い（追加対策が必要）
- 初期ロードが遅い
- JavaScriptが必須

## ハイブリッド戦略

SvelteKitの最大の強みは、単一のアプリケーション内でページごとに異なるレンダリング戦略を選択できることです。これにより、各ページの特性に応じた最適な配信方法を実現し、パフォーマンスとユーザー体験を最大化できます。例えば、トップページはSSGで高速配信し、ブログはSSRで動的生成、管理画面はSPAでインタラクティブに、といった柔軟な構成が可能です。

#### ルートグループによる戦略の分離

SvelteKitのルートグループ機能を使用すると、ディレクトリ構造を整理しながら、グループごとに異なるレンダリング戦略を適用できます。括弧で囲まれたディレクトリ名（例：`(ssr)`）はURLパスには含まれませんが、設定の分離に使用できます。

```typescript
// src/routes/
// ├── +layout.ts (全体設定)
// ├── (ssr)/
// │   └── blog/+page.server.ts    // SSR: ブログ記事
// ├── (ssg)/
// │   └── docs/+page.ts           // SSG: ドキュメント
// └── (spa)/
//     └── dashboard/+page.ts      // SPA: 管理画面

// グループごとに戦略を設定
// (ssr)/+layout.ts
export const ssr = true;
export const prerender = false;

// (ssg)/+layout.ts  
export const ssr = true;
export const prerender = true;

// (spa)/+layout.ts
export const ssr = false;
export const prerender = false;
```

## 選択基準のガイドライン

適切なレンダリング戦略を選択することは、Webアプリケーションの成功に直結します。ここでは、各戦略を選択する際の具体的な判断基準と、実際のユースケースを詳しく解説します。

### SSRを選ぶべき場合

SSRは、コンテンツが頻繁に更新され、かつSEOが重要な場合に最適です。以下のような条件に当てはまる場合は、SSRの採用を検討してください。
- ユーザーごとに異なるコンテンツ
- リアルタイムデータの表示
- SEOが重要な動的ページ

### SSGを選ぶべき場合

SSGは、パフォーマンスを最優先し、コンテンツの更新頻度が比較的低い場合に理想的です。静的なHTMLファイルとして配信されるため、サーバー負荷を最小限に抑えながら、最高速度での配信が可能です。

- コンテンツが頻繁に変わらない
- 高速な配信が最優先
- ドキュメント、ブログ、製品ページ

### SPAを選ぶべき場合

SPAは、高度なインタラクティビティとクライアント側での状態管理が重要な場合に適しています。SEOが不要で、JavaScriptの実行が保証される環境での使用が前提となります。

- 認証後の管理画面
- 高度なインタラクティブ機能
- オフライン対応が必要

## パフォーマンス比較

各レンダリング戦略は、異なるパフォーマンス特性を持っています。アプリケーションの要件に応じて、どの指標を優先するかを決定することが重要です。以下の表は、主要なパフォーマンス指標での比較を示しています。

| 指標 | SSR | SSG | SPA |
|-----|-----|-----|-----|
| Time to First Byte (TTFB) | 中 | 最速 | 速 |
| First Contentful Paint (FCP) | 速 | 最速 | 遅 |
| Time to Interactive (TTI) | 速 | 速 | 遅 |
| サーバー負荷 | 高 | なし | 低 |
| CDNキャッシュ効率 | 低 | 最高 | 高 |

## まとめ

SvelteKitのレンダリング戦略の選択は、アプリケーションの成功を左右する重要な決定です。SSR、SSG、SPAそれぞれに明確な長所と短所があり、適切に選択・組み合わせることで、最適なユーザー体験を提供できます。

SvelteKitのレンダリング戦略は柔軟に組み合わせることができます。プロジェクトの要件に応じて、最適な戦略を選択し、必要に応じてページごとに使い分けることが重要です。

:::tip[ベストプラクティス]
- 公開ページ（ランディング、ブログ）: SSGまたはSSR
- 認証が必要なページ: SPA
- リアルタイムデータ: SSR
- 静的コンテンツ: SSG
:::

:::info[関連情報]
- **ファイルの実行タイミング**: 各レンダリングモードでのファイル実行順序は[プロジェクト構造](/sveltekit/basics/project-structure/#レンダリングモード別の実行タイミング)を参照
- **ルーティング設定**: ページごとの戦略設定は[ルーティング](/sveltekit/routing/)を参照
- **アクセスログへの影響**: レンダリング戦略とログの関係は[アクセスログと分析戦略](/sveltekit/architecture/execution-environments/)を参照
:::

## レンダリング戦略とアーキテクチャパターン

各レンダリング戦略は、特定のアーキテクチャパターンと相性が良く、適切な組み合わせを選ぶことで効率的なアプリケーションを構築できます。

:::info[詳細はアーキテクチャ詳解へ]
レンダリング戦略とアーキテクチャパターンの詳細な関係性については、[アーキテクチャ詳解 - レンダリング戦略とアーキテクチャパターン](/sveltekit/architecture/#レンダリング戦略とアーキテクチャパターン)で解説しています。

- SSRとマイクロサービスアーキテクチャ
- SSGとJamstackアーキテクチャ  
- SPAとコンポーネント駆動開発
- ハイブリッド戦略とドメイン駆動設計
- エンタープライズパターンとの統合
:::

## 次のステップ

- [特殊ファイルシステム](/sveltekit/basics/file-system/) - 各ファイルの役割と実行環境
- [データ取得](/sveltekit/data-loading/) - Load関数の詳細な使い方
- [アーキテクチャ詳解](/sveltekit/architecture/) - より深い内部動作の理解
- [プロジェクト構造](/sveltekit/basics/project-structure/) - 実践的なディレクトリ構成
