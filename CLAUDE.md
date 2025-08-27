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

### バージョン情報（2024年12月時点）
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
│   └── advanced/                 # 実践編
│       ├── +page.md             # 実践概要
│       ├── reactive-stores/+page.md     # リアクティブストア
│       ├── class-reactivity/+page.md    # クラスとリアクティビティ
│       ├── built-in-classes/+page.md    # 組み込みリアクティブクラス
│       ├── snippets/+page.md            # Snippets機能
│       ├── script-context/+page.md      # スクリプトコンテキスト
│       ├── component-patterns/+page.md  # コンポーネントパターン
│       └── typescript-patterns/+page.md # TypeScriptパターン
```

### 第3部：SvelteKit編
```
├── sveltekit/
│   ├── +page.md                  # SvelteKit完全ガイド（ランディングページ）
│   ├── basics/                   # 基礎編
│   │   ├── +page.md             # 基礎編概要
│   │   ├── overview/+page.md    # 概要とアーキテクチャ ✅完成
│   │   ├── project-structure/+page.md # プロジェクト構造 ✅完成
│   │   ├── routing/+page.md     # ルーティング詳解 ✅完成
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

### 完了した変更（2024年12月）

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
│   │   ├── stores/      # グローバルストア(.svelte.ts)
│   │   └── utils/       # ユーティリティ関数
│   └── app.html         # アプリケーションシェル
├── static/              # 静的ファイル
├── .sveltepress/        # SveltePress設定
├── vite.config.ts       # Vite設定
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
description: ページの説明
---
```

**重要**: フロントマター直後の`# {title}`は不要です。ページの本文は直接記述してください。タイトルはSveltePressが自動的にレンダリングします。

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

## 🧠 ナレッジベース

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

#### 避けるべきパターン
- `let` による暗黙的なリアクティビティ
- `$:` によるリアクティブステートメント
- `export let` によるprops定義
- ストアの`$`プレフィックス
- `$derived(() => {...})` の誤用（`$derived.by()` を使用すべき場合）

#### 推奨パターン
- `$state` による明示的なリアクティビティ
- `$derived` による計算値
- `$props` によるprops定義
- `.svelte.ts`ファイルでのストア定義

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