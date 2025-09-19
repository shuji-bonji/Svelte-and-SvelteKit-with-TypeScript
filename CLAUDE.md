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
│   │   ├── overview/+page.md    # SvelteKit概要 ✅完成
│   │   ├── project-structure/+page.md # プロジェクト構造 ✅完成
│   │   ├── file-system/+page.md # 特殊ファイルシステム ✅完成
│   │   ├── rendering-strategies/+page.md # レンダリング戦略（基礎） ✅完成
│   │   └── global-types/+page.md # app.d.tsの役割 ✅完成
│   ├── routing/                  # ルーティング
│   │   ├── +page.md             # ルーティング概要
│   │   ├── basic/+page.md       # 基本ルーティング
│   │   ├── dynamic/+page.md     # 動的ルーティング
│   │   └── advanced/+page.md    # 高度なルーティング
│   ├── data-loading/             # データ取得
│   │   ├── +page.md             # Load関数とデータフェッチング
│   │   ├── basic/+page.md       # Load関数の基礎
│   │   ├── typescript-types/+page.md # TypeScript型の自動生成システム
│   │   ├── flow/+page.md        # データフローの詳細
│   │   ├── spa-invalidation/+page.md # SPAモードとデータ無効化
│   │   ├── streaming/+page.md   # ストリーミングSSR
│   │   └── strategies/+page.md  # データフェッチング戦略
│   ├── architecture/             # アーキテクチャ詳解
│   │   ├── +page.md             # アーキテクチャ概要 ✅完成
│   │   ├── rendering-strategies/+page.md # レンダリング戦略（詳解）
│   │   ├── rendering-pipeline/+page.md # レンダリングパイプライン
│   │   ├── access-logs/+page.md # アクセスログと分析戦略
│   │   ├── data-loading/+page.md # データロードアーキテクチャ
│   │   ├── routing-internals/+page.md # ルーティング内部動作
│   │   └── file-structure/+page.md # ファイル構成と実行環境（準備中）
│   ├── server/                   # サーバーサイド編
│   │   ├── +page.md             # サーバーサイド編概要
│   │   ├── forms/+page.md       # フォーム処理とActions ✅完成
│   │   ├── websocket-sse/+page.md # WebSocket/SSE ✅完成
│   │   ├── server-side/+page.md # サーバーサイド処理（準備中）
│   │   ├── api-routes/+page.md  # APIルート設計（準備中）
│   │   └── hooks/+page.md       # Hooks（準備中）
│   ├── application/              # アプリケーション構築編
│   │   ├── +page.md             # アプリケーション構築編概要
│   │   ├── authentication/+page.md # 認証・認可（準備中）
│   │   ├── session/+page.md     # セッション管理と認証戦略 ✅完成
│   │   ├── auth-best-practices/+page.md # 認証ベストプラクティス ✅完成
│   │   ├── testing/+page.md     # テスト戦略 ✅完成
│   │   ├── state-management/+page.md # 状態管理パターン ✅完成
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
│   │   ├── build-optimization/+page.md # ビルド最適化 ✅完成
│   │   ├── caching/+page.md     # キャッシュ戦略 ✅完成
│   │   └── seo/+page.md         # SEO最適化（準備中）
│   └── deployment/               # デプロイ・運用編
│       ├── +page.md             # デプロイ・運用編概要
│       ├── platforms/+page.md   # プラットフォーム別デプロイ ✅完成
│       ├── execution-environments/+page.md # 実行環境とランタイム ✅完成
│       ├── security/+page.md    # セキュリティ（準備中）
│       └── monitoring/+page.md  # モニタリング（準備中）
```

### 第4部：実装例
```
├── examples/
│   ├── +page.md                  # 実装例一覧
│   ├── blog-system/+page.md      # ブログシステム（基礎）
│   ├── markdown-blog/+page.md    # Markdownブログ（発展）
│   ├── todo-app/+page.md         # TODOアプリ
│   ├── auth-system/+page.md      # 認証システム概要
│   ├── auth-cookie-session/+page.md # Cookie/Session認証
│   ├── auth-jwt/+page.md         # JWT認証
│   ├── auth-route-groups/+page.md # ルートグループ認証（計画中）
│   ├── data-fetching/+page.md    # データフェッチング
│   ├── websocket/+page.md        # WebSocket実装
│   └── mermaid-ssr-demo/+page.md # Mermaid SSRデモ
```


### 第5部：リファレンス
```
├── reference/
│   ├── +page.md                  # リファレンス概要
│   ├── svelte5/+page.md          # Svelte 5 完全リファレンス
│   └── sveltekit2/+page.md       # SvelteKit 2.x 完全リファレンス
```

### 第6部：技術詳解（ディープダイブ）
```
├── deep-dive/
│   ├── +page.md                  # ディープダイブ概要
│   ├── compile-time-optimization/+page.md      # コンパイル時最適化
│   ├── reactive-state-variables-vs-bindings/+page.md # リアクティブ状態とバインディング
│   ├── derived-vs-effect-vs-derived-by/+page.md # 派生値の完全比較
│   ├── html-templates-and-snippets/+page.md    # HTMLテンプレートとSnippets
│   ├── reactivity-with-plain-javascript-syntax/+page.md # 素のJS構文でリアクティビティ
│   ├── auto-generated-types/+page.md           # SvelteKitが自動生成する型
│   ├── webcomponents-svelte-css-strategies/+page.md # Web Components、Svelte、CSS戦略の実践ガイド
│   └── sveltekit-placeholders/+page.md         # SvelteKitプレースホルダー
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

#### ✅ データ取得セクションの大幅改善（2025年9月16日）
- **問題**: データ取得に関する内容が分散していた
- **解決策**:
  - データ取得を独立セクションとして分離（7つのサブセクション）
  - SPAモードとデータ無効化の詳細解説
  - ストリーミングSSRの実装例
  - TypeScript型の自動生成システムの詳細解説
- **効果**:
  - 学習者がデータ取得のパターンを体系的に理解できる
  - SvelteKitの強力なデータフェッチング機能の完全理解

#### ✅ アーキテクチャ詳解セクションの充実
- **追加内容**:
  - アクセスログと分析戦略（実用的なログ管理）
  - データロードアーキテクチャ（内部動作の詳細）
  - ルーティング内部動作（ルーターの仕組み）
- **特徴**:
  - 実際のプロダクション環境で必要な知識
  - デバッグとトラブルシューティングに役立つ

#### ✅ 最適化編の実質的な完成
- **完成済み**:
  - ビルド最適化（Vite設定、chunk分割、プリロード戦略）
  - キャッシュ戦略（ブラウザキャッシュ、CDN、SWR戦略）
- **効果**:
  - プロダクションレベルのパフォーマンス最適化
  - 実測値に基づく最適化手法

#### ✅ アプリケーション構築編の拡充
- **新規追加**:
  - セッション管理と認証戦略（実践的な認証実装）
  - 認証ベストプラクティス（セキュリティ重視）
  - テスト戦略（Vitest、Playwright統合）
  - 状態管理パターン（企業レベルの設計）
- **特徴**:
  - 実際のWebサービス開発で必要な知識
  - セキュリティとスケーラビリティを重視

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
  - 特別な要素 - svelte:component、svelte:element等
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

#### フェーズ2：コンテンツ移行（大幅進展）
1. ✅ Svelteの基本セクションの作成
2. ✅ Svelte 5 Runesシステムの詳細解説（基本実装完了）
3. ✅ 実践的なコード例への更新（公開API使用）
4. ✅ データ取得セクションの独立・充実化（7つのサブセクション）
5. ✅ 最適化編の実質的完成（ビルド最適化、キャッシュ戦略）
6. ✅ アプリケーション構築編の拡充（認証、テスト、状態管理）
7. ⏳ TypeScript型定義のさらなる改善

#### フェーズ3：新規コンテンツ作成（一部完了、継続中）
1. ✅ リファレンスセクションの完成（Svelte 5、SvelteKit 2.x）
2. ✅ ディープダイブセクションの拡充（8つの技術詳解記事）
3. ✅ 実装例の充実化（認証システム3パターン、ブログシステム2パターン）
4. ⏳ TypeScriptパターン集の作成
5. ⏳ トラブルシューティングガイド
6. **Svelteアーキテクチャパターン** - 既存システムへのSvelte統合（計画中）
7. **SvelteKitエンタープライズ開発** - 大規模システム設計パターン（計画中）

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

### 🌍 国際化対応方針（ブラウザ自動翻訳対応）

2025年9月より、ブラウザの自動翻訳機能（Safari等）を考慮した国際化対応を実施。

#### 背景と目的
- **現状**: Mermaidダイアグラム（SVG）内のテキストは自動翻訳される
- **課題**: コード内のコメントが翻訳されない
- **方針**: コスト効率的に国際読者への配慮を実現

#### 実装ガイドライン

##### 1. コード内コメントの二言語化
```typescript
// ❌ 避けるべき：日本語のみ
// ユーザーデータを並列で取得

// ✅ 推奨：二言語併記
// ユーザーデータを並列で取得 / Fetch user data in parallel
const [user, posts] = await Promise.all([
  fetch('/api/user'),
  fetch('/api/posts')
]);

// ✅ より良い：簡潔な英語コメント
const [user, posts] = await Promise.all([
  fetch('/api/user'),    // User data
  fetch('/api/posts')   // Posts data
]);
```

##### 2. 重要な説明の本文移動
```markdown
<!-- ❌ 避けるべき：コード内に詳細説明 -->
```typescript
// この関数は親コンポーネントから子コンポーネントへ
// データを共有するために使用されます
export const load: LayoutLoad = async () => {
```

<!-- ✅ 推奨：本文で説明 -->
以下のコードは親から子へデータを共有します：

```typescript
// Parent to child data sharing
export const load: LayoutLoad = async () => {
```
```

##### 3. 変数名・関数名の工夫
```typescript
// ❌ 避けるべき：略語や不明瞭な名前
const auth = $state(false);

// ✅ 推奨：説明的な英語名
const isAuthenticated = $state(false);
const userAuthenticationStatus = $state<AuthStatus>('pending');
```

##### 4. エラーメッセージとログ
```typescript
// ✅ 推奨：英語ベースのエラーメッセージ
throw new Error('Authentication failed: Invalid credentials');

// デバッグログは二言語可
console.log('認証開始 / Starting authentication');
```

##### 5. Mermaidダイアグラムの活用継続
- SVG内テキストは自動翻訳される利点を活用
- 複雑な概念は図表で視覚化
- 言語に依存しない理解を促進

#### 優先順位
1. **最優先**: 新規作成ページでの実践
2. **高**: データ取得・認証などの重要セクション
3. **中**: 人気ページの段階的改善
4. **低**: アーカイブページ

#### 段階的実施計画
- **フェーズ1**: コード内重要コメントの英語併記
- **フェーズ2**: 変数名の説明的英語化
- **フェーズ3**: 重要ページへのEnglish summaryセクション追加（将来構想）

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

#### 📝 ドキュメント作成ガイドライン

##### コード例の記述ルール
以下のルールに従ってコード例を記述してください：

1. **説明は文章で**: コードの前に、実装の意図や仕組みを文章で説明
2. **コメントは日本語**: コード内のコメントはすべて日本語で統一
3. **変数名は英語**: 説明的でわかりやすい英語の変数名を使用

##### 理由
- 日本語学習者への配慮を最優先
- ブラウザ翻訳機能での多言語対応は文章部分で実現
- サイト全体の統一性を保持
- メンテナンスの簡潔性

##### 適用方法
- **新規ページ作成時**: このルールを必ず適用
- **既存ページ更新時**: 「CLAUDE.mdのドキュメント作成ガイドラインに従って修正」で対応
- **部分的な修正時**: 「CLAUDE.mdのコード例の記述ルールに従って修正」で対応

##### 実装例
```markdown
## セクションタイトル

このセクションでは、〜について説明します。
重要なポイントは以下の通りです：
- ポイント1の説明
- ポイント2の説明
- ポイント3の説明

実装では、〜という理由で〜のようなアプローチを取ります。

\```typescript
// 実装例
export const load: PageServerLoad = async () => {
  // 重要なデータを最初に取得
  const criticalData = await fetchCriticalData();

  return {
    // 即座に表示するデータ
    critical: criticalData,

    // 後から読み込むデータ
    streamed: {
      slowData: fetchSlowData()
    }
  };
};
\```
```

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
- `onDestroy`、`beforeUpdate`、`afterUpdate`などのライフサイクル関数（`$effect`で代替）
- `tick()`の過度な使用（多くの場合`$effect`で解決可能）

**注意**:
1. レガシー構文の説明や比較を目的とした例示では、これらの構文を使用しても構いません。実際の実装コードでのみ、Svelte 5の新しい構文を使用してください。

#### ライフサイクル関数の適切な使い分け

##### `onMount`を使うべき場合：
- **動的インポート** - クライアントサイドのみで実行する必要がある場合
- **初回のみの処理** - グローバルイベントリスナーの登録など、一度だけ実行したい処理
- **DOM操作の初期化** - コンポーネントマウント時に一度だけ実行したいDOM操作
- **サードパーティライブラリの初期化** - Mermaid、D3.js、Chart.jsなどの初期化

##### `$effect`を使うべき場合：
- **リアクティブな副作用** - 依存値の変更に反応する必要がある場合
- **継続的な同期** - データの変更を監視し、DOM を更新する場合
- **クリーンアップが必要な購読** - WebSocket、イベントリスナー等（ただし依存値が変わる場合）
- **デバウンス・スロットル処理** - 入力値の変更に対する遅延処理

##### `use:action`を検討すべき場合：
- **DOM要素の初期化とクリーンアップ** - 特定のDOM要素に対する処理
- **サードパーティライブラリの統合** - DOM要素へのライブラリのアタッチ（Tippy.js、Popper.jsなど）
- **カスタムイベントハンドリング** - 要素固有のイベント処理
- **要素のライフサイクル管理** - 要素の追加・削除に応じた処理

#### 推奨パターン（Svelte 5）
- `$state` による明示的なリアクティビティ
- `$derived` による計算値
- `$props` によるprops定義
- `{@render children?.()}` による子要素のレンダリング
- `.svelte.ts`ファイルでのストア定義

#### SvelteKitでのURL処理ガイドライン

##### `resolve`を使うべき場合：
- **静的なルート名からURLを生成** - ルート名とパラメータから型安全なURLを作成
- **base pathを考慮したURL生成** - サブディレクトリでホストする場合に必須
- **リンクのhref属性** - `<a href={resolve('/about')}>` のように使用
- **プログラマティックナビゲーション** - `goto(resolve('/login'))` のように使用

##### 正しいURL処理の例：
```typescript
import { resolve } from '$app/paths';
import { goto } from '$app/navigation';

// ✅ 良い例：静的ルートの場合
const aboutUrl = resolve('/about');
const loginUrl = resolve('/login');

// ナビゲーション
await goto(resolve('/dashboard'));

// リンク生成
<a href={resolve('/products')}>商品一覧</a>

// ❌ 悪い例：ハードコードされたパス
await goto('/dashboard');  // base pathが考慮されない
<a href="/products">商品一覧</a>  // サブディレクトリで動作しない
```

##### 動的URLの場合：
```typescript
// 動的パラメータを含む場合はテンプレートリテラルでOK
const productUrl = `/products/${id}`;
await goto(productUrl);

// ただし、base pathが必要な場合は注意
import { base } from '$app/paths';
const productUrl = `${base}/products/${id}`;
```

##### Hooks内での`resolve`関数：
```typescript
// hooks.server.tsのresolveは別物（ミドルウェアチェーン用）
export const handle: Handle = async ({ event, resolve }) => {
  // このresolveはリクエスト処理を次のミドルウェアに渡す関数
  return resolve(event);
};
```

**注意**:
- `resolve`は SvelteKit の最新バージョンで利用可能（`resolveRoute`は非推奨）
- 古いバージョンでは`base`を手動で結合する必要がある
- 外部URLへのナビゲーションはそのまま`goto('https://example.com')`でOK

### SvelteKit 新旧記述の違い

#### レガシーなSvelteKit記述（避けるべき）

##### 1. Load関数のレガシー記述
```typescript
// ❌ 古い：load関数の型注釈
import type { Load } from '@sveltejs/kit';

export const load: Load = async ({ fetch, params }) => {
  // ...
};

// ✅ 新しい：PageLoad/LayoutLoadを使用
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params }) => {
  // ...
};
```

##### 2. エラーハンドリング
```typescript
// ❌ 古い：errorオブジェクトを直接throw
throw {
  status: 404,
  message: 'Not found'
};

// ✅ 新しい：error関数を使用
import { error } from '@sveltejs/kit';
throw error(404, 'Not found');
```

##### 3. リダイレクト
```typescript
// ❌ 古い：オブジェクトでリダイレクト
throw {
  status: 302,
  redirect: '/login'
};

// ✅ 新しい：redirect関数を使用
import { redirect } from '@sveltejs/kit';
throw redirect(302, '/login');
```

##### 4. ページコンポーネントのprops
```svelte
<!-- ❌ 古い：export let data -->
<script>
  export let data;
</script>

<!-- ✅ 新しい：$props()を使用（Svelte 5） -->
<script>
  let { data } = $props();
</script>
```

##### 5. フォームActions（旧action）
```typescript
// ❌ 古い：actionsという名前
export const actions = {
  default: async ({ request }) => {
    // ...
  }
};

// ✅ 現在も同じ名前だが、型安全性を重視
import type { Actions } from './$types';

export const actions: Actions = {
  default: async ({ request }) => {
    // ...
  }
};
```

##### 6. RequestHandlerの型
```typescript
// ❌ 古い：RequestHandler型を直接インポート
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
  // ...
};

// ✅ 新しい：./$typesから型をインポート
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
  // ...
};
```

##### 7. page/sessionストア
```typescript
// ❌ 古い：sessionストア（廃止）
import { session } from '$app/stores';

// ❌ 古い：getStores関数
import { getStores } from '$app/stores';
const { page, session } = getStores();

// ✅ 新しい：pageストアのみ、dataプロパティを使用
import { page } from '$app/stores';
// セッション情報は$page.dataに含める
```

##### 8. load関数の戻り値
```typescript
// ❌ 古い：propsプロパティ
export const load = async () => {
  return {
    props: {
      message: 'Hello'
    }
  };
};

// ✅ 新しい：直接オブジェクトを返す
export const load = async () => {
  return {
    message: 'Hello'
  };
};
```

##### 9. エンドポイント（API Routes）
```typescript
// ❌ 古い：エンドポイントという名前、bodyプロパティ
export async function get() {
  return {
    body: {
      message: 'Hello'
    }
  };
}

// ✅ 新しい：大文字のメソッド名、Response/jsonを使用
import { json } from '@sveltejs/kit';

export async function GET() {
  return json({
    message: 'Hello'
  });
}
```

##### 10. hydrate/routerオプション
```typescript
// ❌ 古い：app.htmlでのオプション設定
export const hydrate = false;
export const router = false;

// ✅ 新しい：+page.jsでcsr/ssrオプション
export const csr = false;
export const ssr = true;
```

##### 11. prefetch属性
```svelte
<!-- ❌ 古い：sveltekit:prefetch -->
<a href="/about" sveltekit:prefetch>About</a>

<!-- ✅ 新しい：data-sveltekit-prefetch -->
<a href="/about" data-sveltekit-preload-data>About</a>
```

##### 12. $app/pathsの使い方
```typescript
// ❌ 古い：assetsとbase を個別に使用
import { assets, base } from '$app/paths';
const imagePath = `${assets}/images/logo.png`;

// ✅ 新しい：base のみ、またはresolve
import { base } from '$app/paths';
import { resolve } from '$app/paths';
const aboutUrl = resolve('/about');
```

#### SvelteKit 2.x 推奨パターン

1. **型安全性を重視** - `./$types`から自動生成される型を使用
2. **明示的なエラー/リダイレクト** - `error()`、`redirect()`関数を使用
3. **シンプルなデータフロー** - load関数は直接データを返す
4. **標準的なWeb API** - Response、Request、Headers等を使用
5. **Progressive Enhancement** - form actionsとuse:enhanceの活用

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

## 🤖 LLM向けリファレンス

### 包括的なリファレンスガイド

このプロジェクトには、Svelte 5とSvelteKit 2.xの包括的なリファレンスガイドが用意されています。
これらは、AIアシスタント（Claude、ChatGPT等）がプロジェクトを理解し、適切なコード生成やアドバイスを提供する際のコンテキストとして最適化されています。

#### 利用可能なリファレンス（完全統合済み）

1. **Svelte 5 完全リファレンス** (`/src/routes/reference/svelte5/+page.md`)
   - Runesシステム完全解説（$state、$derived、$effect、$props、$bindable、$inspect、$host）
   - コンポーネント構造とライフサイクル
   - テンプレート構文（条件分岐、ループ、イベント、バインディング）
   - 特別な要素（svelte:component、svelte:element等）
   - トランジション、アニメーション、Actions
   - TypeScript完全統合（型定義、ジェネリクス、ユーティリティ型）
   - スタイリング戦略（CSS-in-JS、CSS Modules、Tailwind）
   - 組み込みクラス（SvelteMap、SvelteSet、SvelteURL）
   - パフォーマンス最適化とベストプラクティス
   - 他フレームワークとの比較（React、Vue、Angular）

2. **SvelteKit 2.x 完全リファレンス** (`/src/routes/reference/sveltekit2/+page.md`)
   - ファイルベースルーティングシステム（基本・動的・高度なパターン）
   - 特殊ファイル（+page、+layout、+server、+error）
   - Load関数とデータフェッチング戦略（7つの包括的パターン）
   - Form ActionsとProgressive Enhancement
   - APIルート設計（GET、POST、PUT、DELETE、PATCH）
   - Hooks（handle、handleFetch、handleError）
   - SSR/SSG/SPA/ISRレンダリング戦略（詳細解説）
   - アダプターとデプロイメント（プラットフォーム別）
   - 認証・認可パターン（Cookie/Session、JWT、OAuth）
   - 型安全性（./$types、app.d.ts、自動生成システム）
   - 最適化戦略（ビルド、キャッシュ、パフォーマンス）
   - WebSocket/SSE実装パターン

#### AIアシスタントへの指示例

```markdown
# Svelte 5とSvelteKit 2.xのプロジェクトです

以下の2つのリファレンスをコンテキストとして使用してください。

1. `/src/routes/reference/svelte5/+page.md` - Svelte 5のすべて
2. `/src/routes/reference/sveltekit2/+page.md` - SvelteKit 2.xのすべて

### 重要な原則
- Svelte 5 Runesシステムを使用（古い文法は使わない）
- TypeScript必須（型定義を明確に）
- SvelteKit 2.xのファイルベースルーティング
- Progressive Enhancement優先
```

### GitHubディスカッション

詳細な技術情報はGitHubディスカッションでも公開されています。

- [Discussion #59: Svelte 5 Runes](https://github.com/shuji-bonji/Svelte-and-SvelteKit-with-TypeScript/discussions/59)
- [Discussion #60: SvelteKit 2.x](https://github.com/shuji-bonji/Svelte-and-SvelteKit-with-TypeScript/discussions/60)
- [Discussion #61: 完全ガイド](https://github.com/shuji-bonji/Svelte-and-SvelteKit-with-TypeScript/discussions/61)

### 実装例プロジェクトのリポジトリ

全ての実装例プロジェクトは、完全なTypeScript対応とSvelte 5 Runes使用でコーディングされており、そのままプロダクションで使用可能なレベルで実装されています。

**ブログシステム系**:
- [svelte5-blog-example](https://github.com/shuji-bonji/svelte5-blog-example) - 基礎版ブログ
- [svelte5-blog-markdown](https://github.com/shuji-bonji/svelte5-blog-markdown) - Markdown版ブログ

**認証システム系**:
- [svelte5-auth-cookie-session](https://github.com/shuji-bonji/svelte5-auth-cookie-session) - Cookie/Session認証
- [svelte5-auth-jwt](https://github.com/shuji-bonji/svelte5-auth-jwt) - JWT認証

## 🚀 実装例プロジェクト

### ブログシステム実装例

#### 1. **基礎版** - `svelte5-blog-example` ✅完成
```
https://github.com/shuji-bonji/svelte5-blog-example
```
- **目的**: SvelteKitの基本を学ぶ
- **実装**: 静的データによるブログ
- **技術**: Svelte 5 Runes、TypeScript、静的配列データ
- **デプロイ**: GitHub Pages（adapter-static）
- **デモ**: https://shuji-bonji.github.io/svelte5-blog-example/
- **学習サイト記事**: [ブログシステム（基礎）](/examples/blog-system/)

**特徴**：
- 最小限の依存関係
- 基本的なルーティング
- タグフィルタリング（クライアントサイド）
- レスポンシブデザイン
- TypeScript完全対応

#### 2. **Markdown版** - `svelte5-blog-markdown` ✅完成
```
https://github.com/shuji-bonji/svelte5-blog-markdown
```
- **目的**: 実践的なMarkdownブログ
- **実装**: Vite glob importによる自動読み込み
- **技術**: marked、front-matter、MiniSearch、Prism.js
- **デプロイ**: GitHub Pages
- **デモ**: https://shuji-bonji.github.io/svelte5-blog-markdown/
- **学習サイト記事**: [Markdownブログ（発展）](/examples/markdown-blog/)

**特徴**：
- Markdownファイルベースの記事管理
- 全文検索機能（MiniSearch）
- タグクラウド
- シンタックスハイライト（Prism.js）
- 読了時間計算
- TypeScript完全統合

### TODOアプリ実装例

#### 1. **TODOマネージャー** - `svelte5-todo-example` ✅完成
```
https://github.com/shuji-bonji/svelte5-todo-example
```
- **目的**: Svelte 5 Runesシステムの完全理解
- **実装**: クライアントサイドTODOアプリ
- **技術**: Svelte 5 Runes（$state、$derived、$effect）、TypeScript
- **デプロイ**: なし（ローカル実行）
- **学習サイト記事**: [TODOアプリ](/examples/todo-app/)

**特徴**：
- Svelte 5 Runesシステムの完全活用
- `.svelte.ts`によるストア実装
- GitHub風のモダンなUI/UXデザイン
- ダークモード対応（システムテーマ検出）
- LocalStorage永続化
- フィルタリング機能（全て/アクティブ/完了）
- TypeScript完全対応

#### 3. **CMS統合版** - `svelte5-blog-cms`（構想）
```
github.com/shuji-bonji/svelte5-blog-cms
```
- **目的**: ヘッドレスCMSとの統合
- **実装**: Contentful/Strapi統合
- **技術**: GraphQL、ISR（Incremental Static Regeneration）
- **デプロイ**: Vercel

**特徴**：
- CMSダッシュボード
- リアルタイムプレビュー
- 画像最適化（Cloudinary）
- 多言語対応
- Webhook連携

#### 4. **プロダクション版** - `svelte5-blog-production`（構想）
```
github.com/shuji-bonji/svelte5-blog-production
```
- **目的**: 商用レベルのブログシステム
- **実装**: 完全な機能を持つブログプラットフォーム
- **技術**: PostgreSQL、Redis、S3、ElasticSearch
- **デプロイ**: AWS/GCP/Azure

**特徴**：
- ユーザー管理と権限制御
- コメントシステム
- メール通知
- RSS/Atom配信
- Analytics統合
- SEO最適化
- CDN配信
- A/Bテスト機能

### 認証システム実装例

#### 1. **Cookie/Session認証** - `svelte5-auth-basic` ✅完成
```
https://github.com/shuji-bonji/svelte5-auth-basic
```
- **目的**: 認証の基礎を学ぶ
- **実装**: Cookie + Session認証
- **DB**: SQLite（Prisma）
- **デプロイ**: Vercel
- **デモ**: https://svelte5-auth-basic.vercel.app/
- **学習サイト記事**: [Cookie/Session認証](/examples/auth-cookie-session/)

**特徴**：
- ユーザー登録/ログイン/ログアウト
- Form Actionsによるサーバーサイド処理
- bcryptパスワードハッシュ
- セッション管理
- 保護されたルート
- TypeScript完全対応

#### 2. **JWT認証** - `svelte5-auth-jwt` ✅完成
```
https://github.com/shuji-bonji/svelte5-auth-jwt
```
- **目的**: モダンな認証パターン
- **実装**: JWT + リフレッシュトークン
- **DB**: PostgreSQL（Supabase）
- **デプロイ**: Vercel + Supabase
- **デモ**: https://svelte5-auth-jwt.vercel.app/
- **学習サイト記事**: [JWT認証](/examples/auth-jwt/)

**特徴**：
- JWTトークン発行/検証
- リフレッシュトークン自動更新
- ロールベースアクセス制御（RBAC）
- APIルート保護
- トークン無効化リスト
- TypeScript完全統合

#### 3. **OAuth統合** - `svelte5-auth-oauth`（構想）
```
github.com/shuji-bonji/svelte5-auth-oauth
```
- **目的**: 実践的な認証システム
- **実装**: Auth.js + OAuth + 2FA
- **DB**: PostgreSQL（Neon）
- **デプロイ**: Vercel

**特徴**：
- Google/GitHub/Twitter OAuth
- Auth.js（旧NextAuth）統合
- 2要素認証（TOTP）
- メール認証
- パスワードリセット
- Remember Me機能
- アカウント連携

#### 4. **エンタープライズ認証** - `svelte5-auth-enterprise`（構想）
```
github.com/shuji-bonji/svelte5-auth-enterprise
```
- **目的**: 企業向け認証システム
- **実装**: SAML/LDAP/AD統合
- **DB**: PostgreSQL + Redis
- **デプロイ**: オンプレミス/プライベートクラウド

**特徴**：
- SAML 2.0 SSO
- Active Directory統合
- LDAP認証
- 多要素認証（MFA）
- セッション管理ダッシュボード
- 監査ログ
- IPアドレス制限
- デバイス管理

### 統合プロジェクト

#### **ブログ + 認証統合** - `svelte5-blog-auth`（構想）
```
github.com/shuji-bonji/svelte5-blog-auth
```
- **目的**: 実践的な統合例
- **実装**: Markdownブログ + 認証システム
- **技術スタック**:
  - Svelte 5 + SvelteKit 2
  - PostgreSQL（記事メタデータ + ユーザー）
  - Markdownファイル（記事本文）
  - Auth.js（認証）
  - Prisma（ORM）

**機能一覧**：
- **公開機能**:
  - 記事閲覧
  - 検索/フィルタリング
  - コメント投稿（認証ユーザーのみ）
  
- **認証ユーザー機能**:
  - プロフィール管理
  - 記事のお気に入り
  - コメント管理
  - 通知設定

- **管理者機能**:
  - 記事の作成/編集/削除
  - 下書き/予約投稿
  - カテゴリー/タグ管理
  - ユーザー管理
  - コメントモデレーション
  - アクセス統計

### 実装優先順位と進捗

1. ✅ **完成**: `svelte5-blog-example`（基礎版ブログ）
2. ✅ **完成**: `svelte5-blog-markdown`（Markdown版ブログ）
3. ✅ **完成**: `svelte5-todo-example`（TODOマネージャー）
4. ✅ **完成**: `svelte5-auth-basic`（Cookie/Session認証）
5. ✅ **完成**: `svelte5-auth-jwt`（JWT認証）
5. 🚧 **開発中**: `svelte5-auth-route-groups`（ルートグループ認証）
6. 📋 **計画中**: `svelte5-blog-auth`（ブログ + 認証統合）
7. 📋 **構想**: その他の実装例（CMS統合、プロダクション版）

### 技術選定の指針

**データベース選択**：
- **開発/学習**: SQLite（ファイルベース、設定不要）
- **小規模**: PostgreSQL on Supabase/Neon（無料枠あり）
- **本番**: PostgreSQL/MySQL（専用インスタンス）

**デプロイ先選択**：
- **静的サイト**: GitHub Pages（無料、簡単）
- **SSR対応**: Vercel/Netlify（無料枠あり）
- **フルスタック**: Railway/Render（DB込み）
- **エンタープライズ**: AWS/GCP/Azure

**認証ライブラリ選択**：
- **学習用**: 自前実装（理解を深める）
- **実用**: Auth.js（多機能、実績あり）
- **シンプル**: Lucia Auth（軽量、TypeScript）
- **エンタープライズ**: Auth0/Okta（SaaS）

## 📚 今後の実装予定セクション

### `/svelte/architecture/` - Svelteアーキテクチャ（計画中）

現在`sidebar.ts`でコメントアウト中。以下の内容を実装予定：

#### 予定コンテンツ
1. **アーキテクチャ概要** (`/svelte/architecture/`)
   - Svelteを使った設計パターン
   - 既存システムへの統合方法

2. **SPA + 既存API統合** (`/svelte/architecture/spa-patterns/`)
   - REST API統合
   - GraphQL統合
   - 認証付きAPI呼び出し
   - エラーハンドリング

3. **BaaS統合パターン** (`/svelte/architecture/baas-integration/`)
   - **Firebase統合** (`/firebase/`)
     - Firestore リアルタイムDB
     - Firebase Auth
     - Cloud Functions
   - **Supabase統合** (`/supabase/`)
     - PostgreSQL + リアルタイム
     - Row Level Security
     - Edge Functions

4. **GraphQL統合** (`/svelte/architecture/graphql/`)
   - Apollo Client
   - urql
   - graphql-request

5. **マイクロフロントエンド** (`/svelte/architecture/micro-frontends/`)
   - Module Federation
   - Web Components
   - iframe統合

### `/sveltekit/enterprise/` - SvelteKitエンタープライズ開発（計画中）

現在`sidebar.ts`でコメントアウト中。以下の内容を実装予定：

#### 予定コンテンツ
1. **エンタープライズ開発概要** (`/sveltekit/enterprise/`)
   - 大規模システム設計
   - チーム開発のベストプラクティス

2. **レイヤードアーキテクチャ** (`/sveltekit/enterprise/layered-architecture/`)
   - プレゼンテーション層
   - ビジネスロジック層
   - データアクセス層
   - 実装例とディレクトリ構造

3. **ドメイン駆動設計（DDD）** (`/sveltekit/enterprise/domain-driven-design/`)
   - エンティティとバリューオブジェクト
   - リポジトリパターン
   - アグリゲート
   - TypeScriptでの実装

4. **リポジトリパターン** (`/sveltekit/enterprise/repository-pattern/`)
   - インターフェース定義
   - 具象実装の切り替え
   - テスタビリティの向上

5. **依存性注入（DI）** (`/sveltekit/enterprise/dependency-injection/`)
   - DIコンテナの実装
   - SvelteKitでのDIパターン
   - テストでのモック注入

6. **ユニットテスト戦略** (`/sveltekit/enterprise/testing-strategies/`)
   - Vitest設定
   - コンポーネントテスト
   - E2Eテスト（Playwright）
   - カバレッジ戦略

7. **Clean Architecture実装** (`/sveltekit/enterprise/clean-architecture/`)
   - 同心円アーキテクチャ
   - 依存性の方向
   - 実装例（完全なサンプルアプリ）

### 実装時の重点事項

**Svelteアーキテクチャセクション**：
- 実際に動作するコード例を多数掲載
- 各BaaSの無料枠での実装方法
- TypeScriptの型定義を完備
- セキュリティベストプラクティス

**SvelteKitエンタープライズセクション**：
- Spring Boot、ASP.NET Core経験者向けの説明
- 実務で使えるプロダクションレベルのコード
- パフォーマンス計測と最適化
- CI/CDパイプラインの構築例
- モノレポ構成の実例

### 実装優先順位

1. **最優先**: BaaS統合パターン（Firebase/Supabase）
   - 需要が高く、実践的
   - 無料で試せる

2. **次点**: Clean Architecture実装
   - エンタープライズ開発の基礎
   - 多くの開発者が求めている

3. **将来**: マイクロフロントエンド
   - 先進的なアーキテクチャ
   - 大規模チーム向け

これらのセクションは、実装例プロジェクトと連動して、実際に動作するコードとともに提供予定。

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

**LLM/AI利用時の推奨**: 上記2つのリファレンス（`/src/routes/reference/svelte5/+page.md`と`/src/routes/reference/sveltekit2/+page.md`）を、AIアシスタントのコンテキストとして読み込ませることで、より正確で効果的なコード生成とアドバイスが可能になります。