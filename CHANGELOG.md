# Changelog

このプロジェクトの主要な変更履歴を記録します。

## [2026-04-12] - コンテンツ検証・不備修正・最新API対応

### 修正（コンテンツ検証による7件の不備修正）
- **`$app/stores` → `$app/state` 移行**: `error-pages`（8箇所）、`file-system`（3箇所）、`blog-system`（2箇所）でレガシーAPIを新APIに統一
- **`$state.is()` 削除**: `state/+page.md` から公式ドキュメントに存在しないAPIセクションを削除
- **`import { pending }` 修正**: `reference/svelte5/+page.md` の不正確なインポートを `$effect.pending()` に統一
- **イベントハンドラ説明文更新**: `component-basics/+page.md` の説明をSvelte 5標準構文に合わせて更新
- **TypeScript型修正**: `markdown-blog/+page.md` の `NodeJS.Timeout` を `ReturnType<typeof setTimeout>` に修正

### 追加（リファレンス・ドキュメント最新化）
- **CONTENT-VALIDATION-REPORT-2026-04.md**: Svelte MCPによる143ファイルのAPI/構文検証レポート
- **DIFF-REPORT-2026-04.md**: 2026年4月の全セクション差分レポート
- **UPDATE-PLAN-2026-04.md**: 刷新計画書（残作業一覧）
- **svelte5-coding-standards Skill**: `.claude/skills/svelte5-coding-standards/SKILL.md` — コーディング規約のSkill化（331行）

### 更新（リファレンス最新化）
- **Svelte 5リファレンス** (`reference/svelte5/+page.md`): `$state.raw`、overridable `$derived`、`$effect.pending()`、Svelte 5イベント構文、`Component`型対応を追加
- **SvelteKit 2.xリファレンス** (`reference/sveltekit2/+page.md`): Remote Functions拡充（`query.batch()`、Standard Schema）、`/types`、`PageProps`/`LayoutProps`、`handleValidationError`を追加

### 更新（コンテンツページ）
- **Remote Functions** (`server/remote-functions/+page.md`): `requested()`、`preflight`、`for()`、機密データ保護、`unchecked`を追加
- **Hooks** (`server/hooks/+page.md`): `handleValidationError`フックを追加
- **エラーハンドリング** (`application/error-handling/+page.md`): 大幅加筆（+549行）
- **環境変数** (`application/environment/+page.md`): 大幅加筆（+310行）
- **SEO** (`optimization/seo/+page.md`): 大幅加筆（+430行）
- **$appモジュール** (`basics/app-modules/+page.md`): `$app/state` と `$app/stores` の比較セクション充実（+223行）
- **イベントモジュール** (`basics/events-module/+page.md`): 新規作成（442行）
- **特殊要素** (`basics/special-elements/+page.md`): `<svelte:boundary>` の `pending` snippet追加
- **データ取得型** (`data-loading/typescript-types/+page.md`): `PageProps`/`LayoutProps`専用セクション追加
- **CLIツール** (`introduction/cli/+page.md`): `better-auth`対応、`mcp`アドオン追加

### 更新（型パターン一括変更）
- 約25ファイルで `{ data: PageData }` → `PageProps` パターンに一括更新
- `LayoutData` → `LayoutProps` を3ファイルで更新
- Mermaidダイアグラム内の型表記も更新

### リファクタリング
- **CLAUDE.md**: 2124行 → 222行に大幅スリム化。コーディング規約をSkill（`.claude/skills/svelte5-coding-standards/SKILL.md`）として分離

## [2026-01-12] - 新規ドキュメントページ追加・Mermaid修正

### 追加
以下の新規ドキュメントページを作成し、サイドバーナビゲーションに追加：

**Svelte 基本編:**
- **svelte/motion** (`/svelte/basics/motion/`) - Tweened/Spring によるモーションプリミティブ
- **svelte/easing** (`/svelte/basics/easing/`) - イージング関数の解説

**Svelte 実践編:**
- **svelte/reactivity/window** (`/svelte/advanced/reactivity-window/`) - ウィンドウ状態のリアクティブ管理

**SvelteKit ルーティング:**
- **Shallow routing** (`/sveltekit/routing/shallow/`) - 履歴駆動のUI（pushState/replaceState）
- **Link options** (`/sveltekit/routing/link-options/`) - プリロード最適化

**SvelteKit サーバーサイド:**
- **Server-only modules** (`/sveltekit/server/server-only-modules/`) - 機密情報の保護

**SvelteKit アプリケーション:**
- **Snapshots** (`/sveltekit/application/snapshots/`) - DOM状態の保持（capture/restore）

**SvelteKit 最適化:**
- **Service Workers / PWA** (`/sveltekit/optimization/pwa/`) - オフライン対応とキャッシュ戦略
- **Observability** (`/sveltekit/optimization/observability/`) - OpenTelemetryトレーシング

**SvelteKit デプロイ:**
- **Packaging** (`/sveltekit/deployment/packaging/`) - コンポーネントライブラリの公開

**入門編:**
- **CLI tools** (`/introduction/cli/`) - sv コマンドの使い方

### 修正
Markdownの ` ```mermaid ` コードブロックを `<Mermaid>` コンポーネント形式に変換し、Shikiハイライターとの互換性問題を解決：

- **hydratable** (`/svelte/advanced/hydratable/`)
- **motion** (`/svelte/basics/motion/`) - 2箇所
- **easing** (`/svelte/basics/easing/`)
- **link-options** (`/sveltekit/routing/link-options/`)
- **shallow** (`/sveltekit/routing/shallow/`)
- **snapshots** (`/sveltekit/application/snapshots/`) - 2箇所
- **cli** (`/introduction/cli/`)
- **observability** (`/sveltekit/optimization/observability/`)
- **packaging** (`/sveltekit/deployment/packaging/`)
- **pwa** (`/sveltekit/optimization/pwa/`)
- **server-only-modules** (`/sveltekit/server/server-only-modules/`)

### 技術的詳細
- SveltePressはShikiハイライターを使用しており、`mermaid`は認識されない言語
- プロジェクトの`$lib/components/Mermaid.svelte`コンポーネントを使用することで解決
- 一部のダイアグラムで特殊文字（✓ ❌ `<br/>`等）を削除/修正
- サイドバー構成（`src/lib/config/sidebar.ts`）を更新し、新規ページをナビゲーションに追加

## [2026-01-11] - ドキュメント説明文の充実化

### 改善
以下のドキュメントページに説明文（セクション導入、コード例の前後説明）を追加し、読み物としての品質を向上：

- **Remote Functions** (`/sveltekit/server/remote-functions/`)
  - query、form、command、prerenderの各セクションに導入説明を追加
  - 従来のLoad関数/Form Actionsとの比較や使い分けガイダンスを充実化

- **{@attach}** (`/svelte/basics/attachments/`)
  - use:アクションとの違いを詳しく説明
  - fromAction移行ガイドの各ステップに説明を追加
  - 実践例（ドラッグ可能な要素）に導入説明を追加

- **hydratable** (`/svelte/advanced/hydratable/`)
  - キーの重要性とシリアライゼーションの仕組みを説明
  - CSP対応（nonce vs hash）の使い分けを詳細化
  - 動作の流れ図をMermaidダイアグラムに変換（3フェーズの色分け）

- **await expressions** (`/svelte/advanced/await-expressions/`)
  - スクリプト/マークアップ/$derived内での使い方を個別に説明
  - 同期された更新と並行処理の動作原理を詳細化
  - fork()によるプリローディングの仕組みを説明

## [2026-01-11] - 新機能ドキュメント追加（Svelte 5.29+/SvelteKit 2.27+）

### 追加
- **Remote Functions**: SvelteKit 2.27+の新しいサーバー連携機能（実験的）
  - `query` - 型安全なデータ取得
  - `form` - フォーム処理の簡略化
  - `command` - サーバーサイド処理の実行
  - `prerender` - ビルド時データ生成
  - Standard Schema（Zod/Valibot）によるバリデーション連携
  - Load関数/Form Actionsとの比較表

- **{@attach ...}**: Svelte 5.29+のリアクティブDOM操作パターン
  - `use:`アクションとの違いと使い分け
  - Attachment factoriesによる再利用パターン
  - コンポーネントへのアタッチメント適用
  - `svelte/attachments`ユーティリティ（`createAttachmentKey`、`fromAction`）
  - 外部ライブラリ（tippy.js等）との統合例

- **hydratable**: SSRハイドレーション最適化の低レベルAPI
  - SSR時のデータ再取得問題の解決
  - シリアライゼーション（devalue）の型サポート
  - CSP（Content Security Policy）対応（nonce/hash）
  - SvelteKit Remote Functionsとの関係

- **await expressions**: Svelte 5.36+の実験的非同期構文
  - スクリプト/マークアップ内での直接await
  - 同期された更新（Synchronized Updates）の仕組み
  - `<svelte:boundary>`のpendingスニペット
  - `$effect.pending()`によるローディング状態検出
  - `fork()`によるプリロード

## [2026-01-11] - $state.eager ドキュメント追加

### 追加
- **$state.eager**: 非同期操作中の即時UI更新機能のドキュメント（Svelte 5）
  - ナビゲーション中のメニューハイライト、楽観的UI更新のユースケース解説
  - 通常の`$state`/`$derived`との比較表
  - TypeScriptによる実践的なコード例

## [2026-01-11] - コードブロック品質改善（全セクションレビュー）

### 修正
全セクションのコードブロックをレビューし、以下の問題を修正：

#### Svelte 5イベント構文の修正
- `on:click` → `onclick`
- `on:submit` → `onsubmit`
- `on:mouseenter` → `onmouseenter`
- 他、すべてのイベントハンドラをSvelte 5構文に統一

#### SvelteKitインポートの追加
不足していた`error`、`redirect`、型定義のインポートを追加：

| セクション | 修正ファイル数 | 主な修正内容 |
|-----------|--------------|-------------|
| svelte/runes | 5 | `onclick`構文修正 |
| svelte/advanced | 3 | イベント構文修正 |
| sveltekit/basics | 2 | `error`インポート追加 |
| sveltekit/routing | 1 | `error`インポート追加 |
| sveltekit/data-loading | 4 | `error`、`redirect`インポート追加 |
| sveltekit/architecture | 1 | `onmouseenter`構文修正 |
| sveltekit/server | 2 | `error`、`redirect`、型定義追加 |
| sveltekit/application | 2 | `error`、`redirect`インポート追加 |
| sveltekit/optimization | 1 | `redirect`、`LayoutServerLoad`追加 |
| examples | 1 | `error`、`redirect`、型定義追加 |
| reference | 2 | `error`、型定義追加 |

### 品質向上
- すべてのコードブロックでSvelte 5構文を統一
- `throw error()`、`throw redirect()`使用箇所に適切なインポート文を追加
- 型定義（`PageServerLoad`、`LayoutServerLoad`、`RequestHandler`等）のインポートを補完
- ビルド検証によりすべての修正を確認

## [2026-01-10] - Svelte MCPセクション追加

### 新規セクション
Svelte公式MCPサーバーに関する包括的なドキュメントを追加（7ページ）

- **Svelte MCPとは**: 公式MCPサーバーの概要、対応クライアント一覧
- **セットアップ**: Claude Code、Cursor、VS Code等への導入手順
- **ツール詳解**: list-sections、get-documentation、svelte-autofixer、playground-linkの詳細解説
- **ユースケース**: 学習支援、コード生成、Svelte 4→5移行支援、品質保証の6つのシナリオ
- **アーキテクチャ**: モノレポ構造、Local版/Remote版の仕組み、レイヤーアーキテクチャ
- **開発環境との統合**: ESLint連携、CI/CD統合、AGENTS.md/CLAUDE.md/GEMINI.md設定
- **エコシステム**: 関連ツールとリソースへのリンク集

### 改善
- 各ページに説明文を追加し、読み物としての品質を向上
- Mermaidダイアグラムのダークモード対応を改善（テキスト色の視認性向上）
- README.mdの絵文字数字を通常の数字に変更

## [2026-01-08] - ドキュメント品質改善

### 修正
- **$state.raw**: 誤った`$get`/`$set` API記載を削除し、正確な使用方法に修正
- **$derived vs $derived.by**: 複雑なロジックには`$derived.by()`を使用するよう統一
- **テンプレート構文**: `$derived.by()`の戻り値を関数呼び出しではなくプロパティアクセスに修正

### 追加
- **$state.snapshot**: オブジェクトの静的スナップショット取得機能のドキュメント
- **$state.is**: 同一オブジェクト比較機能のドキュメント
- **$props.id()**: コンポーネント固有ID生成（Svelte 5.20+）
- **$effect.tracking()**: リアクティブコンテキスト判定機能
- **$effect.pending()**: 保留中Effect数の取得機能
- **$derived オーバーライド**: 派生値の強制上書き機能（Svelte 5.25+）
- **$app/state**: SvelteKit 2.12+の推奨状態管理パターン

## [2025-01-29] - セキュリティアップデート

### セキュリティ修正
- **vite**: 5.4.11 → 5.4.14
  - Path traversal vulnerability (CVE-2025-0291)修正
  - DOM Clobbering脆弱性修正
  - `server.fs.deny`バイパス脆弱性修正

- **@babel/helpers**: 7.26.0 → 7.26.10
  - Prototype Pollution脆弱性修正

- **esbuild**: 0.21.5 → 0.24.2
  - 開発サーバーのコマンドインジェクション対策

- **rollup**: 4.27.4 → 4.34.2
  - DOM Clobbering脆弱性修正

### 依存関係更新
- path-to-regexp: 6.3.0 → 8.2.0（ReDoS対策）
- cookie: 0.6.0 → 0.7.2（セキュリティ強化）

## [2025-12-08] - Vite 7 / SveltePress 7 アップグレード

### 破壊的変更への対応
- **Vite 7**: Node.js 18.x未満のサポート終了に対応
- **SveltePress 7**: サイドバー構造の仕様変更に対応
  - `sidebar.ts`による単一情報源管理システムの導入

### アップグレード
- Vite: 5.x → 7.x
- SveltePress: 6.x → 7.x
- その他依存パッケージの互換性対応

### アーキテクチャ改善
- `src/lib/config/sidebar.ts`: サイドバー構造の一元管理
- `vite.config.ts`と`navigation-from-config.ts`での設定共有

## [2025-09] - SvelteKitアーキテクチャセクション追加

### 追加コンテンツ
- アーキテクチャ概要ページ
- 実行環境別アーキテクチャ解説（SSR/SSG/SPA）
- ファイル構成と実行環境
- データロードフロー詳解
- レンダリングパイプライン解説

### データ取得セクションの大幅改善
- データ取得を独立セクションとして分離（7つのサブセクション）
- SPAモードとデータ無効化の詳細解説
- ストリーミングSSRの実装例

## [2025-08-08] - 初期リリース

### 主要機能
- Svelte 5 Runesシステムの完全ガイド
- SvelteKit 2.xのファイルベースルーティング解説
- TypeScript統合のベストプラクティス
- SveltePressによる静的サイト生成
- GitHub Pagesへの自動デプロイ

### 初期コンテンツ
- 入門編（introduction）- Svelte概要、環境構築、TypeScript設定
- 基礎編（basics）- Runesシステム（$state, $derived, $effect, $props, $bindable）
- Mermaidダイアグラム表示機能

---

このCHANGELOGは[Keep a Changelog](https://keepachangelog.com/ja/1.0.0/)の形式を参考にしています。
