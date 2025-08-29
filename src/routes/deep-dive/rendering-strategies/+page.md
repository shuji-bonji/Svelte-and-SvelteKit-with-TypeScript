---
title: "レンダリング戦略 と アーキテクチャパターン"
description: "SPA/MPAアーキテクチャとCSR/SSR/SSG/ISRなどのレンダリング手法を体系的に理解し、プロジェクトに最適な技術選択を行うための完全ガイド。SvelteKitでの実装方法も詳しく解説。"
---

<script>
  import Mermaid from '$lib/components/Mermaid.svelte';

const architectureDiagram = `graph TB
    subgraph "レンダリング戦略の分類"
        A[レンダリング戦略]
        
        A --> B[アーキテクチャ]
        A --> C[レンダリング手法]
        
        B --> D[SPA<br/>Single Page Application]
        B --> E[MPA<br/>Multi Page Application]
        
        C --> F[CSR<br/>Client Side Rendering]
        C --> G[SSR<br/>Server Side Rendering]
        C --> H[SSG<br/>Static Site Generation]
        C --> I[ISR<br/>Incremental Static<br/>Regeneration]
        
        D -.組み合わせ.-> F
        D -.組み合わせ.-> G
        D -.組み合わせ.-> H
        E -.組み合わせ.-> G
        E -.組み合わせ.-> H
    end
    
    style A fill:#ff3e00,color:#fff
    style B fill:#40b3ff,color:#fff
    style C fill:#40b3ff,color:#fff
    style D fill:#ffd4d4,color:#000
    style E fill:#ffd4d4,color:#000
    style F fill:#d4ffd4,color:#000
    style G fill:#d4ffd4,color:#000
    style H fill:#d4ffd4,color:#000
    style I fill:#d4ffd4,color:#000`;

const csrFlowDiagram = `sequenceDiagram
    participant User as ユーザー
    participant Browser as ブラウザ
    participant CDN
    participant Server as APIサーバー
    
    User->>Browser: URLアクセス
    Browser->>CDN: HTML/JS/CSS要求
    CDN-->>Browser: 空のHTML + JS返却
    Note over Browser: JavaScriptを実行
    Browser->>Server: APIデータ要求
    Server-->>Browser: JSONデータ返却
    Note over Browser: DOMを構築・描画
    Browser-->>User: 画面表示（遅延あり）
    
    Note over User,Server: === 以降、ページ遷移はJSで処理（高速） ===
        User->>Browser: リンククリック
        Note over Browser: JSでルート変更
        Browser->>Server: 必要なデータのみ要求
        Server-->>Browser: JSONデータ
        Note over Browser: 差分更新
        Browser-->>User: 即座に表示`;

const spaSSRFlowDiagram = `sequenceDiagram
    participant User as ユーザー
    participant Browser as ブラウザ
    participant Server as Webサーバー
    participant API as APIサーバー
    
    User->>Browser: URLアクセス
    Browser->>Server: ページ要求
    Server->>API: データ取得
    API-->>Server: データ返却
    Note over Server: サーバーでHTML生成
    Server-->>Browser: 完全なHTML + SPAバンドルJS
    Browser-->>User: 即座に表示
    Note over Browser: Hydration（SPAとして有効化）
    
    Note over User,API: === 以降、CSRモード（SPAとして動作） ===
        User->>Browser: ページ遷移（リンククリック）
        Note over Browser: JSでルート変更（画面遷移なし）
        Browser->>API: 必要なデータのみ取得
        API-->>Browser: JSONデータ
        Note over Browser: 差分更新のみ
        Browser-->>User: 即座に新ページ表示`;
const spaSSGFlowDiagram = `sequenceDiagram
    participant Build as ビルド時
    participant User as ユーザー
    participant Browser as ブラウザ
    participant CDN
    participant API as APIサーバー
    
    Note over Build: ビルド時に全ページ生成
    Build->>API: 全データ取得
    API-->>Build: データ返却
    Note over Build: 静的HTML + SPAバンドル生成
    Build->>CDN: HTML/JS/CSSデプロイ
    
    User->>Browser: URLアクセス
    Browser->>CDN: ページ要求
    CDN-->>Browser: 完全なHTML + SPAバンドルJS
    Browser-->>User: 即座に表示（最速）
    Note over Browser: Hydration（SPAとして有効化）
    
    Note over User,CDN: === 以降のページ遷移 ===
        User->>Browser: リンククリック
        Note over Browser: JSでルート変更
        alt 静的ページ
            Browser->>CDN: 事前生成済みデータ取得
            CDN-->>Browser: JSONまたはHTML片
        else 動的データ必要
            Browser->>API: APIコール
            API-->>Browser: 最新データ
        end
        Browser-->>User: 差分更新（高速）`;
const mpaSSRFlowDiagram = `sequenceDiagram
    participant User as ユーザー
    participant Browser as ブラウザ
    participant Server as Webサーバー
    participant DB as データベース
    
    User->>Browser: URLアクセス
    Browser->>Server: ページ要求
    Server->>DB: データ取得
    DB-->>Server: データ返却
    Note over Server: サーバーでHTML生成
    Server-->>Browser: 完全なHTML（JSなし/少）
    Browser-->>User: 表示
    
    Note over User,DB: === ページ遷移ごとに全体再読み込み ===
        User->>Browser: リンククリック
        Browser->>Server: 新ページ要求
        Server->>DB: データ取得
        DB-->>Server: データ返却
        Note over Server: HTML生成
        Server-->>Browser: 完全なHTML
        Browser-->>User: 全体再描画`;
const mpaSSGDiagram = `sequenceDiagram
    participant Build as ビルド時
    participant User as ユーザー
    participant Browser as ブラウザ
    participant CDN
    
    Note over Build: ビルド時に全ページ生成
    Build->>CDN: 静的HTMLデプロイ
    
    User->>Browser: URLアクセス
    Browser->>CDN: ページ要求
    CDN-->>Browser: 完全な静的HTML
    Browser-->>User: 即座に表示
    
    Note over User,CDN: === ページ遷移（全体再読み込み） ===
        User->>Browser: リンククリック
        Browser->>CDN: 新ページ要求
        CDN-->>Browser: 新しい静的HTML
        Browser-->>User: 全体再描画（CDNから高速）`;

const streamingSSRDiagram = `sequenceDiagram
    participant User as ユーザー
    participant Browser as ブラウザ
    participant Server as Webサーバー
    participant API as APIサーバー
    
    User->>Browser: URLアクセス
    Browser->>Server: ページ要求
    
    Note over Server: HTMLヘッダー即座に送信
    Server-->>Browser: HTML開始（<head>部分）
    Browser-->>User: 初期コンテンツ表示開始
    
    par 並行処理
        Server->>API: データ取得1
        Server->>API: データ取得2
    end
    
    API-->>Server: データ1返却
    Server-->>Browser: HTMLチャンク1（ストリーミング）
    Browser-->>User: 部分的に表示更新
    
    API-->>Server: データ2返却
    Server-->>Browser: HTMLチャンク2（ストリーミング）
    Browser-->>User: 追加コンテンツ表示
    
    Server-->>Browser: HTML終了
    Note over Browser: 完全なページ表示`;

const isrDiagram = `sequenceDiagram
    participant User as ユーザー
    participant Browser as ブラウザ
    participant CDN/Edge
    participant Server as Origin Server
    
    User->>Browser: URLアクセス
    Browser->>CDN/Edge: ページ要求
    
    alt キャッシュあり（有効期限内）
        CDN/Edge-->>Browser: キャッシュされたHTML
        Browser-->>User: 即座に表示
    else キャッシュなし/期限切れ
        CDN/Edge->>Server: 再生成要求
        Note over Server: バックグラウンドで再生成
        CDN/Edge-->>Browser: 古いHTML（stale-while-revalidate）
        Browser-->>User: 即座に表示
        Server-->>CDN/Edge: 新しいHTMLでキャッシュ更新
    end
    
    Note over User,Server: === 次回アクセス時は更新済み ===
        User->>Browser: 再アクセス
        Browser->>CDN/Edge: ページ要求
        CDN/Edge-->>Browser: 更新されたHTML
        Browser-->>User: 最新コンテンツ表示`;
const selectionGuideDiagram = `graph LR
    Start[要件分析] --> Q1{SEO重要？}
    
    Q1 -->|Yes| Q2{更新頻度？}
    Q1 -->|No| CSR[SPA + CSR<br/>管理画面向き]
    
    Q2 -->|高い| Q3{リアルタイム性？}
    Q2 -->|低い| SSG[SPA/MPA + SSG<br/>ブログ・ドキュメント]
    
    Q3 -->|必要| SSR[SPA + SSR<br/>ECサイト]
    Q3 -->|不要| ISR[ISR/On-demand<br/>ニュースサイト]
    
    style CSR fill:#ffd4d4,color:#000
    style SSG fill:#d4ffd4,color:#000
    style SSR fill:#d4d4ff,color:#000
    style ISR fill:#ffffd4,color:#000`;

</script>

## レンダリング戦略（Rendering Strategies）

モダンなWebアプリケーション開発において、パフォーマンス、SEO、ユーザー体験を最適化するための根幹となる技術選択。アーキテクチャパターンとレンダリング手法の組み合わせにより、プロジェクトの要件に最適なソリューションを実現します。

Webアプリケーションの構築には、**アーキテクチャパターン**と**レンダリング手法**の2つの軸があります。

### アーキテクチャパターン
- **SPA (Single Page Application)** - JavaScriptによるクライアントサイドルーティング
- **MPA (Multi Page Application)** - サーバーサイドルーティング、ページごとに全体を再読み込み

### レンダリング手法
- **CSR (Client Side Rendering)** - ブラウザでHTMLを生成
- **SSR (Server Side Rendering)** - サーバーでHTMLを生成してから配信
- **SSG (Static Site Generation)** - ビルド時に静的HTMLを事前生成
- **ISR (Incremental Static Regeneration)** - SSGの拡張、段階的に再生成
- **Streaming SSR** - HTMLを段階的にストリーミング配信

これらは組み合わせて使用でき、現代のフレームワーク（Next.js、Nuxt、SvelteKit等）は複数の手法を混在させる**ハイブリッドレンダリング**をサポートしています。

## レンダリング戦略の分類

レンダリング戦略は、アプリケーションの構造（SPA/MPA）とHTMLの生成場所・タイミング（CSR/SSR/SSG等）の組み合わせで決まります。それぞれの選択が、パフォーマンス特性やユーザー体験に大きく影響します。

<Mermaid diagram={architectureDiagram} />


## 特徴比較表

各レンダリング手法の特性を理解することで、プロジェクトの要件（初期表示速度、SEO要件、インタラクティブ性、インフラコスト等）に応じた最適な選択が可能になります。

### SPAアーキテクチャの場合

| レンダリング手法 | 初期表示速度 | SEO | ページ遷移 | サーバー負荷 | CDN配信 | 適用場面 |
|------|------------|-----|------------|------------|---------|---------|
| **CSR** | ❌ 遅い | ❌ 弱い | ✅ 最速 | ✅ 最小 | ⚠️ 部分的 | 管理画面、ダッシュボード |
| **SSR** | ✅ 速い | ✅ 強い | ✅ 高速 | ❌ 高い | ❌ 困難 | ECサイト、SNS |
| **SSG** | ✅ 最速 | ✅ 強い | ✅ 高速 | ✅ 最小 | ✅ 完全 | ブログ、ドキュメント |
| **ISR** | ✅ 速い | ✅ 強い | ✅ 高速 | ⚠️ 中 | ✅ 部分的 | ニュースサイト、大規模ブログ |

### MPAアーキテクチャの場合

| レンダリング手法 | 初期表示速度 | SEO | ページ遷移 | サーバー負荷 | CDN配信 | 適用場面 |
|------|------------|-----|------------|------------|---------|---------|
| **SSR（従来型）** | ⚠️ 普通 | ✅ 強い | ❌ 遅い（全体再読込） | ❌ 高い | ❌ 困難 | 企業サイト、ポータル |
| **SSG** | ✅ 最速 | ✅ 強い | ⚠️ 普通（全体再読込） | ✅ 最小 | ✅ 完全 | 静的サイト、LP |
| **Streaming SSR** | ✅ 速い | ✅ 強い | ❌ 遅い（全体再読込） | ⚠️ 中 | ❌ 困難 | 動的コンテンツサイト |

### ハイブリッド（最新フレームワーク）

| 手法 | 特徴 | 適用場面 |
|------|------|---------|
| **混在型** | ページごとに最適な手法を選択 | 総合的なWebサービス |
| **Progressive Enhancement** | 基本はSSG/SSR、必要に応じてCSR | パフォーマンス重視サイト |
| **Islands Architecture** | 静的ページに動的な「島」を配置 | コンテンツサイトに動的要素を追加 |

## レンダリングフローのシーケンス図

各レンダリング手法の実際の動作フローを表したシーケンス図です。
ユーザーのリクエストからコンテンツ表示まで、そしてその後のインタラクションまでの詳細なプロセスを理解できます。

### SPAアーキテクチャ

#### 1. SPA + CSR (Client Side Rendering)

初期HTMLは空で、JavaScriptがブラウザ上ですべてのコンテンツを生成。初期表示は遅いが、その後のページ遷移は高速。開発がシンプルで、サーバー負荷が最小。

<Mermaid diagram={csrFlowDiagram} />

#### 2. SPA + SSR (Server Side Rendering)

初回アクセス時はサーバーでHTMLを生成して高速表示を実現。Hydration後はSPAとして動作し、以降のページ遷移はクライアントサイドで処理。SEOと初期表示速度を両立。

<Mermaid diagram={spaSSRFlowDiagram} />


#### 3. SPA + SSG (Static Site Generation)

ビルド時にすべてのページを静的HTMLとして生成。CDNから配信可能で最高速の初期表示。Hydration後はSPAとして動作。更新頻度の低いコンテンツに最適。

<Mermaid diagram={spaSSGFlowDiagram} />


### MPAアーキテクチャ

#### 1. MPA + SSR (従来のサーバーレンダリング)

各ページアクセスごとにサーバーでHTML全体を生成。ページ遷移のたびに全体が再読み込みされるため、遷移は遅いがシンプルな実装。JavaScript依存度が低く、確実な動作が期待できる。

<Mermaid diagram={mpaSSRFlowDiagram} />

#### 2. MPA + SSG (静的サイト生成)

ビルド時にすべてのページを静的HTMLとして生成し、CDNから配信。ページ遷移ごとに新しいHTMLを読み込むが、CDNから配信されるため高速。JavaScriptが最小限で、最も堅牢性が高い。

<Mermaid diagram={mpaSSGDiagram} />

### ハイブリッド手法

#### ISR (Incremental Static Regeneration)

SSGの高速性を維持しながら、コンテンツを段階的に再生成可能。キャッシュの有効期限が切れた場合、バックグラウンドで新しいコンテンツを生成。大規模サイトでもビルド時間を短縮でき、必要なページのみ更新。

<Mermaid diagram={isrDiagram} />

#### Streaming SSR (段階的サーバーサイドレンダリング)

HTMLをチャンク単位で段階的に送信。ヘッダーや重要なコンテンツを先に表示し、残りのコンテンツを順次追加。ユーザーにより早くコンテンツを見せることができ、体感速度が向上。

<Mermaid diagram={streamingSSRDiagram} />


## 使い分けガイドライン

要件分析から最適なレンダリング戦略を選択するためのデシジョンツリー。SEOの重要性、更新頻度、リアルタイム性などの要因を考慮した体系的な判断基準を提供します。

<Mermaid diagram={selectionGuideDiagram} />

### 各判断基準の詳細説明

| 判断基準 | 条件 | 具体例 | 技術的理由 | 推奨戦略 |
|---------|------|--------|-----------|---------|
| **SEO重要性** | 重要 | 企業サイト、メディア、ECサイト、ブログ | 検索エンジンがコンテンツを確実にインデックスする必要がある | SSR/SSG/ISR |
| | 不要 | 管理画面、ダッシュボード、内部システム | SEOより操作性と開発効率を優先できる | **CSR** |
| **更新頻度** | 高（分〜時間） | ニュース、SNS、株価、スポーツ実況 | 常に最新データが必要でキャッシュが活用しにくい | SSR |
| | 低（日〜月） | ブログ、企業情報、ドキュメント | 静的ファイルをCDNから配信でき最高のパフォーマンス | **SSG** |
| **リアルタイム性** | 必要 | 在庫情報、価格、ユーザー固有コンテンツ | リクエストごとに最新データでHTML生成が必要 | **SSR** |
| | 不要 | 過去記事、静的コンテンツ | 高速性を維持しながら定期的に再生成で十分 | **ISR** |

### 補足：ハイブリッドアプローチ
現代のフレームワーク（SvelteKit、Next.js、Nuxt）では、ページごとに異なる戦略を選択できるため：
- トップページ：SSGで高速表示
- 商品詳細：ISRで在庫情報を定期更新
- マイページ：SSRでユーザー固有情報を表示
- 管理画面：CSRで高いインタラクティブ性を実現

このような組み合わせが一つのアプリケーション内で可能です。

## パフォーマンス指標

Core Web Vitalsを含む各種パフォーマンス指標の実測値比較。FCP、TTI、FID、CLS、LCPといった重要指標を理解し、ユーザー体験の品質を定量的に評価できます。

| 指標 | CSR | SSR | SSG | ISR | Streaming SSR |
|-----|-----|-----|-----|-----|--------------|
| **FCP** (First Contentful Paint) | 2-4秒 | 0.5-1秒 | 0.2-0.5秒 | 0.3-0.6秒 | 0.3-0.8秒 |
| **TTI** (Time to Interactive) | 3-5秒 | 1-2秒 | 0.5-1秒 | 0.6-1.2秒 | 0.8-1.5秒 |
| **FID** (First Input Delay) | 高 | 中 | 低 | 低 | 中 |
| **CLS** (Cumulative Layout Shift) | 高 | 低 | 最低 | 最低 | 低 |
| **LCP** (Largest Contentful Paint) | 3-5秒 | 1-1.5秒 | 0.5-1秒 | 0.6-1秒 | 0.8-1.2秒 |

### 指標の説明
- **FCP (First Contentful Paint)**: ページの読み込みが開始されてから、最初のテキストまたは画像が表示されるまでの時間
- **TTI (Time to Interactive)**: ページが完全にインタラクティブになるまでの時間（JavaScriptの実行が完了し、ユーザー入力に応答できる状態）
- **FID (First Input Delay)**: ユーザーが最初にページと対話してから、ブラウザが実際に応答するまでの遅延時間
- **CLS (Cumulative Layout Shift)**: ページ読み込み中の予期しないレイアウトのずれを測定する視覚的安定性の指標（0に近いほど良い）
- **LCP (Largest Contentful Paint)**: ビューポート内で最も大きなコンテンツ要素が表示されるまでの時間

## SvelteKitでの実装

SvelteKitの強力な特徴の一つは、すべてのレンダリング戦略に対応し、さらにページごとに最適な戦略を選択できる柔軟性です。実際のコード例とともに、プロジェクトでの実装方法を詳しく解説します。

SvelteKitは、これらすべてのレンダリング戦略をサポートし、**ページごとに異なる戦略を選択**できます。

### ページごとの設定例
```typescript
// +page.ts または +page.server.ts

// SSG: ビルド時に静的生成
export const prerender = true;

// SSR: リクエストごとにサーバーレンダリング（デフォルト）
export const prerender = false;

// CSR: クライアントサイドのみ
export const ssr = false;

// ISRに近い動作: キャッシュ制御
export async function load({ setHeaders }) {
  setHeaders({
    'cache-control': 'max-age=60, s-maxage=3600'
  });
}
```

### ハイブリッドレンダリングの例
```typescript
// src/routes/blog/+page.ts - ブログ一覧はSSG
export const prerender = true;

// src/routes/blog/[slug]/+page.ts - 記事詳細もSSG
export const prerender = true;

// src/routes/dashboard/+page.ts - ダッシュボードはCSR
export const ssr = false;

// src/routes/api/+server.ts - APIエンドポイント
export async function GET() {
  // APIロジック
}
```

---

これらのレンダリング戦略を理解し、SvelteKitの柔軟な設定を活用することで、最適なパフォーマンスとユーザー体験を実現できます！ 🚀