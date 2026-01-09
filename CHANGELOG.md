# Changelog

このプロジェクトの主要な変更履歴を記録します。

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
