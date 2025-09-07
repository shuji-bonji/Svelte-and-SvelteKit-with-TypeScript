# CLAUDE.md - TypeScriptで学ぶ Svelte5/SvelteKit 学習ガイド構築指示書

## 🎯 プロジェクト概要

### 目的
日本語によるTypeScript中心のSvelte 5/SvelteKit完全マスター学習コンテンツの提供

### リポジトリ
- **旧**: `https://github.com/shuji-bonji/Svelte-SvelteKit-with-TypeScript`
- **新**: `https://github.com/shuji-bonji/Svelte-and-SvelteKit-with-TypeScript`

### 公開URL
`https://shuji-bonji.github.io/Svelte-and-SvelteKit-with-TypeScript/`

### 対象読者
- TypeScript/JavaScriptでのWeb開発経験者
- SPA/WebAPI開発経験があるがSSR/SSGは不慣れなエンジニア
- Svelteの公式ドキュメントを見ているがTypeScript情報が少なく苦労している人
- SvelteKitでビジネスレベルのサービスを構築したい人
- **エンタープライズ開発者** - Spring Boot、ASP.NET Core、Angular等の経験を活かしたい開発者

## 🛠 技術スタック

### コア技術
- **Svelte 5** (最新版・Runesシステム対応)
- **SvelteKit** (最新版)
- **TypeScript** (全コード例で使用)
- **SveltePress** (サイトビルドツール)

### 重要：バージョン要件
- **Svelte 5最新版** (2024年10月リリース版以降)を使用
- Svelte 5のRunes（$state, $derived, $effect, $props等）を使用
- Svelte 4以前の文法（let宣言によるリアクティビティ、$:文法）は使用しない
- TypeScriptの型定義を厳密に行う
- **常に最新バージョンを前提とした記述を心がける**

### バージョン情報（2025年9月時点）
- Svelte: 5.x以上
- SvelteKit: 2.x以上
- TypeScript: 5.x以上
- Vite: 5.x以上
- Node.js: 20.x LTS以上（推奨: 20.x LTS、次点: 22.x LTS）
  - 最低要件: Node.js 18.13（SvelteKit 2の要件）
  - Node.js 20.x LTS: 安定性重視、エコシステム対応が完璧
  - Node.js 22.x LTS: 最新機能、2027年まで長期サポート
- npm: 10.x以上（Node.js 20/22に同梱）
- pnpm: 8.x以上（推奨パッケージマネージャ）

## 📚 カリキュラム構成

### 第1部：入門編
```
src/routes/
├── +layout.svelte                # ルートレイアウト
├── +page.md                      # ホーム
├── introduction/
│   ├── +page.md                  # Svelte5の概要
│   ├── why-svelte/+page.md       # なぜSvelteか
│   ├── why-typescript/+page.md   # なぜTypeScriptが必要か
│   ├── setup/+page.md            # 環境構築
│   ├── hello-world/+page.md      # Hello World
│   ├── typescript-setup/+page.md # TypeScript設定
│   └── learning-path/+page.md    # 学習パス
```

### 第2部：Svelte編
```
├── svelte/
│   ├── +page.md                  # Svelte完全ガイド（ランディングページ）
│   ├── basics/                   # Svelteの基本
│   │   ├── +page.md             # Svelteの基本概要
│   │   ├── component-basics/+page.md    # コンポーネントの基本
│   │   ├── template-syntax/+page.md     # テンプレート構文
│   │   ├── component-lifecycle/+page.md # コンポーネントライフサイクル
│   │   ├── actions/+page.md            # use:アクション
│   │   ├── transitions/+page.md        # トランジション・アニメーション
│   │   ├── typescript-integration/+page.md # TypeScript統合
│   │   └── hello-world/+page.md        # Hello World（基本例）
│   ├── runes/                    # Runesシステム
│   │   ├── +page.md             # Runesシステム概要
│   │   ├── runes-introduction/+page.md # Runesシステム入門
│   │   ├── state/+page.md      # $state - リアクティブな状態
│   │   ├── derived/+page.md    # $derived - 派生値
│   │   ├── effect/+page.md     # $effect - 副作用
│   │   ├── props/+page.md      # $props - プロパティ
│   │   ├── bindable/+page.md   # $bindable - 双方向バインディング
│   │   ├── host/+page.md        # $host - カスタムエレメント
│   │   ├── inspect/+page.md    # $inspect - デバッグ
│   │   └── comparison/+page.md # 他フレームワークとの比較
│   ├── advanced/                 # 実践編
│   │   ├── +page.md             # 実践概要
│   │   ├── reactive-stores/+page.md     # リアクティブストア
│   │   ├── class-reactivity/+page.md    # クラスとリアクティビティ
│   │   ├── built-in-classes/+page.md    # 組み込みリアクティブクラス
│   │   ├── snippets/+page.md            # Snippets機能
│   │   ├── script-context/+page.md      # スクリプトコンテキスト
│   │   ├── component-patterns/+page.md  # コンポーネントパターン
│   │   └── typescript-patterns/+page.md # TypeScriptパターン
│   └── architecture/             # アーキテクチャ（計画中）
│       ├── +page.md             # アーキテクチャ概要
│       ├── spa-patterns/+page.md        # SPA + 既存API統合
│       ├── baas-integration/            # BaaS統合パターン
│       │   ├── firebase/+page.md        # Firebase統合
│       │   └── supabase/+page.md        # Supabase統合
│       ├── graphql/+page.md             # GraphQL統合
│       └── micro-frontends/+page.md     # マイクロフロントエンド
```

### 第3部：SvelteKit編
```
├── sveltekit/
│   ├── +page.md                  # SvelteKit完全ガイド（ランディングページ）
│   ├── basics/                   # 基礎編
│   │   ├── +page.md             # 基礎編概要
│   │   ├── overview/+page.md    # 概要とアーキテクチャ ✅完成
│   │   ├── project-structure/+page.md # プロジェクト構造 ✅完成
│   │   ├── routing/+page.md     # ルーティング ✅完成
│   │   └── load-functions/+page.md # データ読み込み ✅完成
│   ├── architecture/             # アーキテクチャ詳解
│   │   ├── +page.md             # アーキテクチャ概要 ✅完成
│   │   ├── execution-environments/+page.md # 実行環境別アーキテクチャ（準備中）
│   │   ├── file-structure/+page.md # ファイル構成と実行環境（準備中）
│   │   ├── data-loading/+page.md # データロードフロー（準備中）
│   │   └── rendering-pipeline/+page.md # レンダリングパイプライン（準備中）
│   ├── server/                   # サーバーサイド編
│   │   ├── +page.md             # サーバーサイド編概要
│   │   ├── forms/+page.md       # フォーム処理とActions ✅完成
│   │   ├── server-side/+page.md # サーバーサイド処理（準備中）
│   │   ├── api-routes/+page.md  # APIルート設計（準備中）
│   │   └── hooks/+page.md       # Hooks（準備中）
│   ├── application/              # アプリケーション構築編
│   │   ├── +page.md             # アプリケーション構築編概要
│   │   ├── authentication/+page.md # 認証・認可（準備中）
│   │   ├── database/+page.md    # データベース統合（準備中）
│   │   ├── environment/+page.md # 環境変数管理（準備中）
│   │   └── error-handling/+page.md # エラーハンドリング（準備中）
│   ├── enterprise/               # エンタープライズ開発（計画中）
│   │   ├── +page.md             # エンタープライズ開発概要
│   │   ├── layered-architecture/+page.md # レイヤードアーキテクチャ
│   │   ├── domain-driven-design/+page.md # ドメイン駆動設計（DDD）
│   │   ├── repository-pattern/+page.md   # リポジトリパターン
│   │   ├── dependency-injection/+page.md # 依存性注入（DI）
│   │   ├── testing-strategies/+page.md  # ユニットテスト戦略
│   │   └── clean-architecture/+page.md  # Clean Architecture実装
│   ├── optimization/             # 最適化編
│   │   ├── +page.md             # 最適化編概要
│   │   ├── performance/+page.md # パフォーマンス最適化（準備中）
│   │   ├── caching/+page.md     # キャッシュ戦略（準備中）
│   │   └── seo/+page.md         # SEO最適化（準備中）
│   └── deployment/               # デプロイ・運用編
│       ├── +page.md             # デプロイ・運用編概要
│       ├── platforms/+page.md   # プラットフォーム別デプロイ ✅完成
│       ├── security/+page.md    # セキュリティ（準備中）
│       └── monitoring/+page.md  # モニタリング（準備中）
```

### 第4部：実装例
```
├── examples/
│   ├── +page.md                  # 実装例一覧
│   ├── todo-app/+page.md         # TODOアプリ
│   ├── auth-system/+page.md     # 認証システム
│   ├── data-fetching/+page.md   # データフェッチング
│   ├── websocket/+page.md       # WebSocket実装
│   └── mermaid-ssr-demo/+page.md # Mermaid SSRデモ
```

### 第5部：技術詳解（ディープダイブ）
```
├── deep-dive/
│   ├── compile-time-optimization/+page.md      # コンパイル時最適化
│   ├── reactive-state-variables-vs-bindings/+page.md # リアクティブ状態とバインディング
│   ├── derived-vs-effect-vs-derived-by/+page.md # 派生値の完全比較
│   ├── html-templates-and-snippets/+page.md    # HTMLテンプレートとSnippets
│   ├── reactivity-with-plain-javascript-syntax/+page.md # 素のJS構文でリアクティビティ
│   └── auto-generated-types/+page.md           # SvelteKitが自動生成する型
```

### その他のページ
```
├── about/+page.md                # このサイトについて
├── search/+page.md               # 検索ページ
├── docs/+page.md                 # ドキュメント
├── blog/                         # ブログ（準備中）
└── _archive/                     # アーカイブ（非公開）
    └── examples/
        ├── mermaid-demo/         # Mermaidデモ（テスト用）
        └── features-demo/        # 機能デモ（テスト用）
```

## 🔄 移行計画と変更履歴

### 完了した変更（2025年9月）

#### ✅ サイドバー構造の統一管理システム導入（2025年9月）
- **問題**: `vite.config.ts`と`navigation-from-config.ts`でサイドバー構造が重複定義されていた
- **解決策**: 
  - `src/lib/config/sidebar.ts`を作成し、単一情報源として管理
  - 両ファイルから共有設定をインポートして使用
  - 概要ページの重複を自動スキップする仕組みを実装
- **効果**:
  - 設定の二重管理を排除
  - 型安全性の向上
  - メンテナンス性の大幅改善

#### ✅ 「Svelteの基本」セクションの追加
- **理由**: Svelte 5のRunesシステムを学ぶ前に、Svelteの基本概念を理解する必要があるため
- **追加内容**:
  - Hello World - 最初のSvelteコンポーネント
  - コンポーネントの基本 - script、markup、styleの3要素、テンプレート構文、イベント、プロパティを包括的にカバー
  - TypeScript統合 - SvelteでのTypeScript活用
  - スクリプトコンテキスト - `<script>`と`<script context="module">`の違い
- **設計方針**: 「コンポーネントの基本」ページに、テンプレート構文（条件分岐、ループ）、イベントハンドリング、プロパティ、双方向バインディングなどの基本機能を統合

#### ✅ ナビゲーション構造の改善
- ナビゲーションバー: 「基礎」を「Runes」に変更、「Svelteの基本」を追加
- サイドバー: 新セクション「Svelteの基本」を「はじめに」と「Runesシステム」の間に配置
- 学習パス: Runesシステムの前にSvelteの基本を学ぶ流れに変更
- ディレクトリ名変更: `basics` → `runes` (より明確な命名)

#### ✅ SSR互換性とビルドエラーの修正
- **問題**: LiveCodeコンポーネントでSSR時に`toLocaleString()`が未定義値で呼ばれるエラー
- **解決策**:
  - Optional chaining (`?.`) と Nullish coalescing (`??`) を活用
  - `$derived.by()` 構文を使用して適切なリアクティビティを確保
  - フォームのアクセシビリティ属性（id/for）を追加

#### ✅ 実践的なAPI使用例への更新
- **変更内容**: モックAPIから実際の公開APIへの移行
- **使用API**:
  - **JSONPlaceholder API**: ユーザーデータの取得（`$effect.pre`セクション、非同期処理）
  - **GitHub Search API**: リポジトリ検索（デバウンス処理セクション）
- **改善点**:
  - 実際に動作するコード例の提供
  - エラーハンドリングとフォールバック処理の実装
  - AbortControllerを使用したリクエストキャンセル
  - 800msのデバウンス処理による効率的な検索

#### ✅ コンテンツガイドラインの更新
- フロントマター後の`# {title}`重複を避けるルールを追加
- ページ構成のテンプレートを提供

### 完了した変更（2024年12月）

#### ✅ SvelteKitアーキテクチャセクションの追加（2024年12月）
- **理由**: 基礎編の概要ページにあった複雑なアーキテクチャ内容を独立セクションとして分離
- **追加内容**:
  - アーキテクチャ概要ページ - セクションのランディングページ
  - 実行環境別アーキテクチャ - SSR/SSG/SPAの詳細な動作原理
  - ファイル構成と実行環境 - 各ファイルの役割と実行場所
  - データロードフロー - Load関数の実行順序とデータの流れ
  - レンダリングパイプライン - コンパイルから実行までの詳細
- **配置**: 基礎編とサーバーサイド編の間に配置し、段階的な学習を促進

### 今後の計画

#### フェーズ1：基盤構築（完了）
1. ✅ SveltePressプロジェクトの初期設定
2. ✅ 基本レイアウトとナビゲーション構築
3. ✅ TypeScript設定の最適化
4. ✅ GitHub Actions設定（自動デプロイ）

#### フェーズ2：コンテンツ移行（進行中）
1. ✅ Svelteの基本セクションの作成
2. ✅ Svelte 5 Runesシステムの詳細解説（基本実装完了）
3. ✅ 実践的なコード例への更新（公開API使用）
4. ⏳ TypeScript型定義のさらなる改善

#### フェーズ3：新規コンテンツ作成（予定）
1. TypeScriptパターン集の作成
2. 実装例の充実化
3. トラブルシューティングガイド
4. パフォーマンス最適化ガイド
5. **Svelteアーキテクチャパターン** - 既存システムへのSvelte統合
6. **SvelteKitエンタープライズ開発** - 大規模システム設計パターン

#### フェーズ4：最適化と公開（予定）
1. パフォーマンス最適化
2. SEO対策
3. アクセシビリティ改善
4. 最終テストと公開

## 📋 開発ルール

### コーディング規約

#### TypeScript
```typescript
// ✅ 良い例：型定義を明確に
type Props = {
  count: number;
  message?: string;
};

let { count, message = 'デフォルト' }: Props = $props();

// ❌ 悪い例：型定義なし
let { count, message } = $props();
```

#### Svelte 5 Runes
```svelte
<!-- ✅ 良い例：Svelte 5 Runes -->
<script lang="ts">
  let count = $state(0);
  let doubled = $derived(count * 2);
  
  $effect(() => {
    console.log(`Count: ${count}`);
  });
</script>

<!-- ❌ 悪い例：古い文法 -->
<script lang="ts">
  let count = 0;
  $: doubled = count * 2;
  
  $: console.log(`Count: ${count}`);
</script>
```

### ディレクトリ構造
```
Svelte-and-SvelteKit-with-TypeScript/
├── src/
│   ├── routes/          # ページとレイアウト
│   ├── lib/             # 共有コンポーネント・ユーティリティ
│   │   ├── components/  # 再利用可能コンポーネント
│   │   │   └── AutoPageNavigation.svelte  # 自動ナビゲーション生成
│   │   ├── stores/      # グローバルストア(.svelte.ts)
│   │   └── utils/       # ユーティリティ関数
│   │       └── navigation-from-config.ts  # ナビゲーション構造生成
│   └── app.html         # アプリケーションシェル
├── static/              # 静的ファイル
├── .sveltepress/        # SveltePress設定
├── vite.config.ts       # Vite設定（サイドバー構造定義）
├── svelte.config.js     # Svelte設定
├── tsconfig.json        # TypeScript設定
└── package.json         # 依存関係
```

### コンテンツ作成ガイドライン

#### Markdownファイル構造

##### フロントマター（メタデータ）のルール
```markdown
---
title: ページタイトル
description: ページの説明（SEO最適化済み - 詳細は下記ガイドライン参照）
---
```

**重要**: フロントマター直後の`# {title}`は不要です。ページの本文は直接記述してください。タイトルはSveltePressが自動的にレンダリングします。

##### SEO最適化：meta description作成ガイドライン

**目的**: Google検索結果でのクリック率向上とSEO効果の最大化

**必須要件**:
1. **文字数**: 120-160文字に収める（日本語の場合）
2. **必須キーワード**: 
   - 「TypeScript」を必ず含める（本プロジェクトの核心）
   - 「Svelte5」または「SvelteKit」を含める
   - ページ固有の技術用語を含める（例：$state、$derived、SSR/SSG等）

**記述ルール**:
- アクションを促す動詞を使用：「実装」「解説」「学ぶ」「マスター」「構築」など
- 具体的な内容を列挙：主要な3-4つの学習内容を明記
- 自然な日本語で記述：キーワードの詰め込みすぎを避ける

**テンプレート例**:
```markdown
---
title: $derived - 派生値
description: Svelte5の$derivedルーンで計算プロパティを作成 - リアクティブな派生値の定義と$derived.byによる複雑な計算処理をTypeScriptで実装する方法を解説
---
```

**ページタイプ別の書き方**:
- **Runesページ**: `Svelte5の[ルーン名]ルーンで[機能]を[動作] - [具体的な使用例]をTypeScriptで[アクション]`
- **基礎ページ**: `Svelte5[機能]の基本をTypeScriptで学ぶ。[主要トピック1]、[主要トピック2]、[主要トピック3]の実装方法を解説`
- **実装例ページ**: `Svelte5とTypeScriptで作る[アプリ名]完全実装ガイド。[技術1]、[技術2]、[技術3]のサンプルコード付き解説`
- **SvelteKitページ**: `SvelteKitを TypeScriptで[目的]。[機能1]、[機能2]、[機能3]の実装パターンを解説`

**避けるべきパターン**:
- ❌ 「準備中」のような仮の説明
- ❌ 50文字未満の短すぎる説明
- ❌ TypeScriptへの言及がない説明
- ❌ 抽象的すぎる説明（「高度な機能」「基本的な内容」など）
- ❌ 重複する説明（他のページと同じ文言）

##### 情報の強調表示ルール

他のフレームワーク（React、Vue、Angular等）の経験者が疑問に思う点や、Svelte特有の概念については、以下のMarkdown記法を使って目立たせてください。

```markdown
:::note[タイトル]
一般的な補足情報や参考情報
:::

:::tip[タイトル]
便利なヒントやベストプラクティス
:::

:::warning[タイトル]
注意すべき点や気をつけるべきこと
:::

:::caution[タイトル]
間違えやすい点や非推奨の書き方
:::

:::info[タイトル]
追加の技術情報やディープダイブへのリンク
:::
```

**使用例**
- Virtual DOMを使わない理由 → `:::info`で説明
- React/VueからSvelte 5への移行時の注意点 → `:::warning`で警告
- Runesシステムの内部実装 → `:::info`でディープダイブ記事へリンク
- `$state`と`useState`の違い → `:::note`で比較説明
- ReactのuseEffectとSvelteの$effectの違い → `:::tip`でベストプラクティス
- 間違えやすいリアクティビティの罠 → `:::caution`で注意喚起

##### 正しい例
```markdown
---
title: コンポーネントの基本
description: Svelteコンポーネントの構造と基本的な機能
---

Svelteコンポーネントには3つの主要な部分があります。このページでは、それぞれの役割と使い方を詳しく解説します。

## 基本構造

コンポーネントは以下の要素で構成されます...
```

##### 間違った例（避けるべき）
```markdown
---
title: コンポーネントの基本
description: Svelteコンポーネントの構造と基本的な機能
---

# コンポーネントの基本  <!-- ❌ 不要：titleの重複 -->

## 概要
簡潔な説明
```

##### ページ構成のテンプレート
```markdown
---
title: ページタイトル
description: ページの説明
---

<!-- 導入文：ページの目的と概要を説明 -->
このページでは〜について学びます。

## 基本的な使い方
\```typescript
// TypeScriptコード例
\```

## 実践例
実際の使用例を示す

## よくある間違い
アンチパターンと解決策

## まとめ
重要ポイントの整理

## 次のステップ
[次のページへのリンク](/path/to/next/)で、さらに詳しく学びます。
```

#### コード例の要件
1. **必ずTypeScriptを使用**
2. **型定義を明確に記述**
3. **Svelte 5のRunesを使用**
4. **実行可能な完全なコード**
5. **日本語コメントで説明**

#### Svelte 5構文の使用ルール

**重要**: 必ずSvelte 5の最新構文を使用してください。レガシー構文は使用しないでください。

##### Props受け取り
```typescript
// ❌ 悪い例：Svelte 4以前の構文
export let data: PageData;
export let form: ActionData;

// ✅ 良い例：Svelte 5の構文
let { data, form }: { data: PageData; form: ActionData } = $props();
```

##### リアクティブな値
```typescript
// ❌ 悪い例：$: によるリアクティブ文
$: currentPath = $page.url.pathname;
$: doubled = count * 2;

// ✅ 良い例：$derivedを使用
let currentPath = $derived($page.url.pathname);
let doubled = $derived(count * 2);
```

##### 子要素のレンダリング（レイアウト）
```svelte
<!-- ❌ 悪い例：<slot />を使用 -->
<main>
  <slot />
</main>

<!-- ✅ 良い例：childrenとSnippetを使用 -->
<script lang="ts">
  import type { Snippet } from 'svelte';
  let { children }: { children?: Snippet } = $props();
</script>

<main>
  {@render children?.()}
</main>
```

##### SvelteKitのデータ受け取り
```typescript
// +page.svelte, +layout.svelte など
<script lang="ts">
  import type { PageData } from './$types';
  
  // ❌ 悪い例
  export let data: PageData;
  
  // ✅ 良い例
  let { data }: { data: PageData } = $props();
</script>
```

##### 重要な注意事項

1. **ドキュメント内のコード例**：すべてのコード例でSvelte 5構文を使用する
   - Markdownファイル内のコード例
   - シーケンス図やMermaidダイアグラム内の注釈
   - 比較のために意図的にレガシー構文を示す場合は明示的に注記する

2. **`<slot />`から`children`への移行**：
   ```svelte
   <!-- ❌ 悪い例：<slot />のみ -->
   <button>
     <slot />
   </button>
   
   <!-- ✅ 良い例：childrenをpropsに追加し、@renderを使用 -->
   <script lang="ts">
     import type { Snippet } from 'svelte';
     let { children }: { children?: Snippet } = $props();
   </script>
   
   <button>
     {@render children?.()}
   </button>
   ```

3. **型付きpropsの定義**：
   ```typescript
   // ✅ 良い例：型付きprops
   let { 
     variant = 'primary',
     size = 'md',
     children
   } = $props<{
     variant?: 'primary' | 'secondary';
     size?: 'sm' | 'md' | 'lg';
     children?: Snippet;
   }>();
   ```

## 🧠 ナレッジベース

### カスタム機能実装

#### 自動ナビゲーションシステム

本プロジェクトでは、SveltePressの標準機能に加えて、独自の自動ナビゲーションシステムを実装しています。これにより、各ページに前後のページへのナビゲーションリンクが自動的に追加されます。

##### 実装コンポーネント

1. **AutoPageNavigation.svelte** (`/src/lib/components/`)
   - 各ページに自動的にナビゲーションを追加するコンポーネント
   - 現在のパスから前後のページを自動判定
   - コンテンツエリア内に動的に配置
   - 空のpage-switcherを自動的に非表示化

2. **navigation-from-config.ts** (`/src/lib/utils/`)
   - 共有サイドバー構造からナビゲーション構造を自動生成
   - サイドバー構造をフラットなリストに変換
   - 現在のページの前後を判定する関数を提供
   - 概要ページの重複を自動的にスキップ

3. **sidebar.ts** (`/src/lib/config/`) - **2025年9月追加**
   - サイドバー構造の単一情報源（Single Source of Truth）
   - `vite.config.ts`と`navigation-from-config.ts`で共有使用
   - TypeScript型定義付きの設定ファイル

##### 動作原理

```typescript
// navigation-from-config.ts の主要機能
export function getNavigationFromSidebar(
  currentPath: string,
  sidebarConfig: { [key: string]: SidebarItem[] }
): { prev?: NavItem; next?: NavItem } {
  // 1. すべてのサイドバーアイテムをフラットなリストに変換
  const allPages: NavItem[] = [];
  for (const section in sidebarConfig) {
    flattenSidebar(sidebarConfig[section], allPages);
  }
  
  // 2. 現在のページの位置を特定
  const normalizedCurrentPath = currentPath.endsWith('/') ? currentPath : currentPath + '/';
  const currentIndex = allPages.findIndex(page => page.href === normalizedCurrentPath);
  
  // 3. 前後のページを返す
  const prev = currentIndex > 0 ? allPages[currentIndex - 1] : undefined;
  const next = currentIndex < allPages.length - 1 ? allPages[currentIndex + 1] : undefined;
  
  return { prev, next };
}
```

##### 利点

1. **単一情報源の原則**: `src/lib/config/sidebar.ts`を唯一の情報源として使用
2. **メンテナンス性**: ナビゲーション構造の二重管理を排除
3. **自動化**: 新しいページを追加するだけで自動的にナビゲーションに反映
4. **一貫性**: すべてのページで統一されたナビゲーション体験
5. **型安全性**: TypeScriptによる型チェックで設定ミスを防止

##### 使用方法

1. `src/lib/config/sidebar.ts`でサイドバー構造を定義・更新
2. `vite.config.ts`と`navigation-from-config.ts`が自動的にこの設定を参照
3. AutoPageNavigationコンポーネントが自動的に各ページにナビゲーションを追加
4. 新しいページを追加する際は、`sidebar.ts`の構造に追加するだけ

##### 注意事項

- Markdownファイル内では直接Svelteコンポーネントを使用できないため、`+layout.svelte`経由で自動挿入
- パスの正規化（末尾スラッシュの処理）に注意
- サイドバー構造の階層をフラット化して順序を決定

### 技術的な実装詳細

#### LiveCodeコンポーネントの最適化
- **SSR対応**: サーバーサイドレンダリング時のエラーを防ぐため、Optional chainingを徹底
- **$derived.by()の使用**: 複雑な派生値計算で明示的な関数構文を使用
- **型安全性**: TypeScriptの厳密な型定義により実行時エラーを削減

### Svelte 5 Runesチートシート

#### $state
```typescript
// 基本的な使い方
let count = $state(0);

// オブジェクト（深いリアクティビティ）
let user = $state({ name: '太郎', age: 25 });

// 配列
let items = $state<string[]>([]);

// クラスインスタンス（プロパティも$stateにする）
class Counter {
  value = $state(0);
  increment() { this.value++; }
}
```

#### $derived
```typescript
// 計算プロパティ
let count = $state(0);
let doubled = $derived(count * 2);

// 複雑な計算には$derived.by()を使用
let filtered = $derived.by(() => {
  return items.filter(item => item.active);
});

// 注意: $derived(() => {...})は誤用。$derived.by()を使用すること
```

#### $effect
```typescript
// 副作用の実行
$effect(() => {
  console.log('Count changed:', count);
  // クリーンアップ関数
  return () => {
    console.log('Cleanup');
  };
});

// 依存関係は自動追跡
$effect(() => {
  // countが変更された時のみ実行
  document.title = `Count: ${count}`;
});
```

#### $props
```typescript
// Props定義
type Props = {
  required: string;
  optional?: number;
  withDefault?: boolean;
};

let { 
  required,
  optional,
  withDefault = true,
  ...restProps
}: Props = $props();
```

#### $bindable
```typescript
// 双方向バインディング可能なprop
type Props = {
  value: string;
};

let { value = $bindable('default') }: Props = $props();
```

### TypeScript統合のベストプラクティス

1. **コンポーネントの型定義**
```typescript
import type { ComponentProps } from 'svelte';

type Props = ComponentProps<'button'> & {
  variant?: 'primary' | 'secondary';
};
```

2. **ストアの型定義（.svelte.ts）**
```typescript
// counter.svelte.ts
export function createCounter(initial = 0) {
  let count = $state(initial);
  
  return {
    get value() { return count; },
    increment() { count++; },
    decrement() { count--; },
    reset() { count = initial; }
  };
}

export type Counter = ReturnType<typeof createCounter>;
```

3. **イベントハンドラの型定義**
```typescript
function handleClick(event: MouseEvent & { currentTarget: HTMLButtonElement }) {
  console.log(event.currentTarget.textContent);
}
```

### 移行時の注意点

#### 避けるべきパターン（レガシー構文）
- `let` による暗黙的なリアクティビティ
- `$:` によるリアクティブステートメント
- `export let` によるprops定義
- `<slot />` による子要素の挿入
- ストアの`$`プレフィックス（自動サブスクリプション）
- `$derived(() => {...})` の誤用（`$derived.by()` を使用すべき場合）

#### 推奨パターン（Svelte 5）
- `$state` による明示的なリアクティビティ
- `$derived` による計算値
- `$props` によるprops定義
- `{@render children?.()}` による子要素のレンダリング
- `.svelte.ts`ファイルでのストア定義

#### 具体的な移行例

```typescript
// === Props ===
// 旧: export let prop: Type;
// 新: let { prop }: { prop: Type } = $props();

// === リアクティブ値 ===
// 旧: $: value = computation;
// 新: let value = $derived(computation);

// === レイアウト ===
// 旧: <slot />
// 新: {@render children?.()}

// === SvelteKitデータ ===
// 旧: export let data: PageData;
// 新: let { data }: { data: PageData } = $props();
```

## 🚀 実装手順（Claude Code用）

### 1. プロジェクト初期化
```bash
# 既存リポジトリをクローン
git clone https://github.com/shuji-bonji/Svelte-and-SvelteKit-with-TypeScript.git
cd Svelte-and-SvelteKit-with-TypeScript

# 依存関係のインストール
npm install

# 開発サーバー起動
npm run dev
```

### 2. SveltePress設定
```typescript
// vite.config.ts
import { sveltepress } from '@sveltepress/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    sveltepress({
      theme: {
        // テーマ設定
      },
      // その他の設定
    }),
    sveltekit()
  ]
});
```

### 3. 基本レイアウト作成
```svelte
<!-- src/routes/+layout.md -->
<script lang="ts">
  import { page } from '$app/stores';
  // レイアウトロジック
</script>

<!-- ナビゲーション等 -->
```

### 4. GitHub Actions設定
```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
```

## 📝 参考資料

### 公式ドキュメント
- [Svelte 5 Docs](https://svelte.dev/docs)
- [SvelteKit Docs](https://kit.svelte.dev/docs)
- [SveltePress](https://sveltepress.site)

#### Docs for LLMs
- https://svelte.jp/docs/llms
- https://svelte.jp/llms.txt
- https://svelte.jp/llms-full.txt
- https://svelte.jp/docs/svelte/llms.txt
- https://svelte.jp/docs/kit/llms.txt
- https://svelte.jp/docs/cli/llms.txt

### 使用している外部API
- [JSONPlaceholder](https://jsonplaceholder.typicode.com/) - テスト用のRESTful API
- [GitHub API](https://docs.github.com/en/rest) - リポジトリ検索API（認証不要）

### ナレッジリポジトリ
- [Notes on Svelte](https://github.com/shuji-bonji/Notes-on-Svelte)

### アーカイブ済みコンテンツ（内部参照用）
以下のデモページは通常のナビゲーションからは非表示ですが、機能テストやコンポーネント動作確認のナレッジとして保持しています。

- **Mermaidデモ**: `/_archive/examples/mermaid-demo/`
  - Mermaid図表の表示テスト
  - ダイアグラム描画機能の実装例
  
- **機能デモ**: `/_archive/examples/features-demo/`
  - Svelte 5の各種機能の動作確認
  - コンポーネントパターンのテスト実装
  - LiveCodeコンポーネントの動作テスト

**注意**: 
- これらのページは`_`プレフィックスによりSvelteKitのルーティングから除外されます
- 直接URLアクセスすることで表示可能です
- sitemapには含まれません
- 新機能のテストや動作確認時に参照してください

## ✅ チェックリスト

### 移行前確認
- [ ] 既存コンテンツのバックアップ
- [ ] Svelte 5最新版の確認
- [ ] TypeScript 5.x以上の確認

### 実装時確認
- [ ] 全コード例がTypeScript
- [ ] Svelte 5 Runesのみ使用
- [ ] 型定義の厳密性
- [ ] 日本語での説明充実

### 公開前確認
- [ ] ビルドエラーなし
- [ ] GitHub Pages動作確認
- [ ] レスポンシブ対応
- [ ] パフォーマンス最適化

---

**Note**: このドキュメントは生きたドキュメントとして、プロジェクトの進行に応じて更新してください。