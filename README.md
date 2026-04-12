# TypeScript で学ぶ Svelte 5/SvelteKit 完全ガイド

> [!IMPORTANT]
> **📢 Svelte MCP Serverの登場について**
>
> 2025年11月、Svelte公式が [MCP Server](https://svelte.dev/docs/mcp/overview) をリリースしました。
> Claude、Cursor、VS Code等のAIツールから公式ドキュメントを直接参照し、コードの自動検証まで行えるようになりました。
>
> **MCP Serverと公式ドキュメントがあれば、このサイトの「Svelte解説サイト」としての役割は終わりつつあります。**
>
> Svelteを学び始める方は、まず [Svelte MCP](/svelte-mcp/) の導入をお勧めします。
> このサイトは今後、MCPでは得られない「実務での設計判断」「フレームワーク比較」などの情報提供にシフトしていく予定です。

[![Deploy to GitHub Pages](https://github.com/shuji-bonji/Svelte-and-SvelteKit-with-TypeScript/actions/workflows/deploy.yml/badge.svg)](https://github.com/shuji-bonji/Svelte-and-SvelteKit-with-TypeScript/actions/workflows/deploy.yml)
[![SveltePress](https://img.shields.io/badge/SveltePress-v1.3-blue?logo=svelte&logoColor=white)](https://sveltepress.site/)
[![SvelteKit](https://img.shields.io/badge/SvelteKit-v2.55-red?logo=svelte&labelColor=000)](https://svelte.dev/)
[![TypeScript](https://img.shields.io/badge/-TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Svelte5](https://img.shields.io/badge/-Svelte%205-%23ff3e00?logo=svelte&logoColor=ffffff)](https://svelte.dev/)
[![CC BY 4.0](https://img.shields.io/badge/License-CC%20BY%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by/4.0/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
[![Claude](https://img.shields.io/badge/Claude-D97757?logo=claude&logoColor=fff)](https://claude.ai)

日本語による TypeScript 中心の Svelte 5/SvelteKit 完全マスター学習コンテンツです。最新の Svelte 5 Runes システムを使用し、Mermaid ダイアグラムによる視覚的な解説も充実。実際に動作する API 連携例（JSONPlaceholder、GitHub Search API）を含む実践的な内容。Load 関数のデータフローや実行環境別アーキテクチャ（SSR/SSG/SPA）についても詳細に解説。フォーム処理の Actions 実行フローもシーケンス図とフローチャートで完全可視化。

🌐 **公開サイト**: [https://shuji-bonji.github.io/Svelte-and-SvelteKit-with-TypeScript/](https://shuji-bonji.github.io/Svelte-and-SvelteKit-with-TypeScript/)

## 📚 このドキュメントについて

このドキュメントは、TypeScript を使用して Svelte 5 と SvelteKit を学習するための包括的なガイドです。最新の Svelte 5 Runes システムを中心に、実践的なコード例と共に解説しています。

## 🚀 実装例プロジェクト

学習内容を実際のコードで確認できる実装例プロジェクトを提供しています。

### ブログシステム実装例

1. **基礎版** - [svelte5-blog-example](https://github.com/shuji-bonji/svelte5-blog-example) ✅ 完成

   - 静的データによる基本的なブログサイト
   - [デモサイト](https://shuji-bonji.github.io/svelte5-blog-example/)

2. **Markdown 版** - [svelte5-blog-markdown](https://github.com/shuji-bonji/svelte5-blog-markdown) ✅ 完成
   - Markdown ファイルベースの実践的なブログシステム
   - 全文検索、タグクラウド、読了時間計算機能付き
   - [デモサイト](https://shuji-bonji.github.io/svelte5-blog-markdown/)

### TODO アプリ実装例

1. **TODO マネージャー** - [svelte5-todo-example](https://github.com/shuji-bonji/svelte5-todo-example) ✅ 完成
   - Svelte 5 Runes システムを使用した完全な TODO アプリ
   - GitHub 風のモダンな UI/UX デザイン
   - ダークモード対応、LocalStorage 永続化
   - フィルタリング（全て/アクティブ/完了）機能

### 認証システム実装例

1. **Cookie/Session 認証** - [svelte5-auth-basic](https://github.com/shuji-bonji/svelte5-auth-basic) ✅ 完成
   - Cookie + Session 認証の基礎
   - SQLite（Prisma）を使用したユーザー管理
   - [デモサイト](https://svelte5-auth-basic.vercel.app/)

2. **JWT 認証** - [svelte5-auth-jwt](https://github.com/shuji-bonji/svelte5-auth-jwt) ✅ 完成
   - JSON Web Token ベースの認証
   - Jose ライブラリによるトークン生成・検証
   - [デモサイト](https://svelte5-auth-jwt.vercel.app/)

これらのプロジェクトは本ドキュメントの学習内容と連動し、実際に動作するコードとして提供されています。

### 対象読者

- TypeScript/JavaScript での Web 開発経験がある方
- SPA/WebAPI 開発経験があるが SSR/SSG は不慣れな方
- Svelte の公式ドキュメントで TypeScript 情報が少なく苦労している方
- SvelteKit でビジネスレベルのサービスを構築したい方
- エンタープライズ開発者（Spring Boot、ASP.NET Core、Angular 等の経験者）

### 特徴

- 🎯 **TypeScript 中心** - すべてのコード例で TypeScript を使用
- 🚀 **Svelte 5 対応** - 最新の Runes システムを完全網羅（`$derived.by()`など最新構文）
- 📊 **Mermaid ダイアグラム** - Load 関数、Actions、フォーム処理の実行フローを視覚的に解説
- 📖 **日本語** - 日本語による詳細な解説
- 💡 **実践的** - Universal Load と Server Load の使い分けを具体例で解説
- 🌙 **ダークモード対応** - テーマ切り替えに完全対応
- 🔧 **SSR 完全対応** - サーバーサイドレンダリングのエラーを回避する実装
- 🌐 **実 API 連携** - JSONPlaceholder、GitHub API を使用した実動作例
- 🏗️ **アーキテクチャ詳解** - SSR/SSG/SPA の実行環境別の動作を詳細に解説
- 📈 **アクセスログ分析** - レンダリング戦略が Web サーバーログに与える影響を説明
- 🏢 **エンタープライズ対応** - レイヤードアーキテクチャ、DDD、Clean Architecture 対応（計画中）

## 🗂 コンテンツ構成

### 1. はじめに

- Svelte 5 の概要
- なぜ Svelte か
- 環境構築
- TypeScript 設定
- 学習パス

### 2. Svelte の基本

- Hello World
- コンポーネントの基本構造
- テンプレート構文
- TypeScript 統合
- Actions / `{@attach}`（Svelte 5.29+）
- トランジション・アニメーション
- `svelte/events` モジュール
- モーション（Spring / Tween）
- 特殊要素（`<svelte:boundary>` の pending snippet 含む）

### 3. Runes 基礎編

- `$state` - リアクティブな状態管理（`$state.raw`, `$state.snapshot`, `$state.eager`含む）
- `$derived` / `$derived.by()` - 計算値と明示的な派生値（オーバーライド機能対応）
- `$effect` / `$effect.pre` - 副作用の処理と DOM 更新前実行（`$effect.tracking()`, `$effect.pending()`含む）
- 他フレームワークとの比較

### 4. Runes 応用編

- Runes システム詳細
- `$props` - プロパティ定義（`$props.id()`によるユニーク ID 生成含む）
- `$bindable` - 双方向バインディング
- `$inspect` - デバッグツール

### 5. 実践編

- リアクティブストア（.svelte.ts）
- クラスとリアクティビティ
- 組み込みリアクティブクラス（SvelteMap, SvelteSet, SvelteDate, SvelteURL）
- Snippets 機能
- コンポーネントパターン
- TypeScript パターン
- スクリプトコンテキスト
- `{@attach}` - リアクティブ DOM 操作（Svelte 5.29+）
- await expressions - 非同期構文（Svelte 5.36+、実験的）
- hydratable - SSR ハイドレーション最適化

### 6. Svelte アーキテクチャ

- SPA + 既存 API 統合パターン
- BaaS 統合（Firebase、Supabase）
- GraphQL 統合
- デスクトップ/モバイル開発（Tauri、Capacitor）
- ハイブリッド統合

### 7. Svelte MCP

- Svelte MCP とは - 公式 MCP サーバーの概要
- セットアップ - Claude Code、Cursor、VS Code 等への導入
- ツール詳解 - list-sections、get-documentation、svelte-autofixer、playground-link
- ユースケース - 学習支援、コード生成、移行支援、品質保証
- アーキテクチャ - モノレポ構造、Local/Remote 版の仕組み
- 開発環境との統合 - ESLint 連携、CI/CD 統合、AGENTS.md 設定
- エコシステム - 関連ツールとリソース

### 8. SvelteKit 基礎編

- SvelteKit 概要とアーキテクチャ
- プロジェクト構造
- 特殊ファイルシステム
- レンダリング戦略（基礎）
- app.d.ts の役割

### 9. SvelteKit ルーティング

- 基本ルーティング
- 動的ルーティング
- 高度なルーティング

### 10. SvelteKit データ取得

- Load 関数の基礎（`$app/state` / `PageProps` / `LayoutProps` 推奨パターン対応）
- TypeScript 型の自動生成システム（PageProps / LayoutProps）
- データフローの詳細
- SPA モードとデータ無効化
- ストリーミング SSR
- データフェッチング戦略
- 高度なデータフェッチング戦略

### 11. SvelteKit アーキテクチャ詳解

- レンダリング戦略（詳解）
- レンダリングパイプライン
- ハイドレーション詳解
- アクセスログと分析戦略
- データロードアーキテクチャ
- ルーティング内部動作

### 12. SvelteKit サーバーサイド編

- フォーム処理と Actions（実行フロー図を大幅拡充）
  - Actions 実行タイミングのシーケンス図
  - Named Actions（複数 Actions）のフロー
  - use:enhance ライフサイクル図
  - バリデーションフロー図
  - ファイルアップロードフロー図
- Remote Functions（SvelteKit 2.27+）- query / form / command / prerender
- WebSocket/SSE
- サーバーサイド処理
- API ルート設計（RESTful エンドポイント、レイヤードアーキテクチャ）
- Hooks（handle / handleFetch / handleError / handleValidationError）
- Server-only modules

### 13. SvelteKit アプリケーション構築編

- セッション管理と認証戦略
- 認証ベストプラクティス
- テスト戦略
- 状態管理パターン
- 環境変数管理（$env モジュール 4種、.env 設定、セキュリティ）
- エラーハンドリング（error() / +error.svelte / handleError / App.Error）
- Snapshots（DOM 状態の保持）
- データベース統合（準備中）

### 14. SvelteKit エンタープライズ開発（計画中）

- レイヤードアーキテクチャ
- ドメイン駆動設計（DDD）
- リポジトリパターン
- 依存性注入（DI）
- Clean Architecture 実装

### 15. SvelteKit 最適化編

- ビルド最適化
- キャッシュ戦略
- パフォーマンス最適化
- SEO 最適化（svelte:head / OGP / JSON-LD / サイトマップ / robots.txt）
- Service Workers / PWA（オフライン対応・キャッシュ戦略）
- Observability（OpenTelemetry トレーシング）

### 16. SvelteKit デプロイ・運用編

- プラットフォーム別デプロイ（準備中）
- 実行環境とランタイム
- パッケージング（コンポーネントライブラリ公開）
- セキュリティ（準備中）
- モニタリング（準備中）

### 17. 実装例

- ブログシステム（基礎・発展）
- Cookie/Session 認証
- JWT 認証
- TODO アプリ
- データフェッチング
- WebSocket 実装
- Mermaid ダイアグラム（SSR 対応）

### 18. リファレンス

- Svelte 5 完全リファレンス
- SvelteKit 2.x 完全リファレンス

### 19. ディープダイブ（技術詳細）

Svelte 5 の内部実装や高度なトピックを扱います。

- Proxy オブジェクトの活用
- リアクティブ状態変数とバインディングの違い
- `$state.raw` vs `$state`の使い分け（浅いリアクティビティ）
- `$derived` vs `$effect` vs `$derived.by`の完全比較
- コンパイル時最適化
- HTML テンプレートと Snippets
- カスタム要素と Svelte コンポーネント
- SvelteKit プレースホルダー（`%sveltekit.*%`）

## 📊 Mermaid ダイアグラム機能

このドキュメントでは、複雑な概念を視覚的に理解できるよう、Mermaid ダイアグラムを豊富に使用しています。

### サポートしているダイアグラムタイプ

- **フローチャート** - プロセスや処理フローの表現
- **シーケンス図** - コンポーネント間の相互作用
- **クラス図** - TypeScript 型定義や構造の表現
- **ガントチャート** - 学習ロードマップや進捗管理
- **円グラフ** - データの割合や構成比

### 特徴

- 🌙 **ダークモード完全対応** - システムテーマに自動追従
- 🎨 **Svelte ブランドカラー** - 統一されたデザイン
- 📱 **レスポンシブ対応** - モバイルでも見やすい表示
- 🔄 **リアルタイム切り替え** - テーマ変更時に即座に更新

### 使用方法

```svelte
<script>
  import Mermaid from '$lib/components/Mermaid.svelte';

  const diagramCode = `graph TD
    A[開始] --> B[処理]
    B --> C[終了]`;
</script>

<Mermaid diagram={diagramCode} />
```

詳細は[Mermaid デモページ](https://shuji-bonji.github.io/Svelte-and-SvelteKit-with-TypeScript/examples/mermaid-demo/)をご確認ください。

## 🛠 技術スタック

### コア技術

- **Svelte 5** (5.53+) - 最新の Runes システム対応
- **SvelteKit** (2.55+) - フルスタックフレームワーク
- **TypeScript** (5.9+) - 型安全な開発環境
- **Vite** (7.3+) - 高速ビルドツール

### ドキュメント・可視化

- **SveltePress** (1.3+) - 静的サイト生成
- **Mermaid** (11.12+) - ダイアグラム描画

### カスタム機能

- **AutoPageNavigation** - ページ間の自動ナビゲーション生成
- **navigation-from-config** - vite.config.ts から自動的にナビゲーション構造を生成

### 推奨環境

- **Node.js** 18.19+ (推奨: 20.x LTS)
- **pnpm** 9.15.0+ (パッケージマネージャー)

## 🚀 ローカル開発

### 前提条件

- Node.js 18.19 以上（推奨: 20.x LTS）
- pnpm 9.15.0 以上（推奨パッケージマネージャー）

### セットアップ

```bash
# リポジトリのクローン
git clone https://github.com/shuji-bonji/Svelte-and-SvelteKit-with-TypeScript.git
cd Svelte-and-SvelteKit-with-TypeScript

# 依存関係のインストール
pnpm install

# 開発サーバーの起動
pnpm dev
```

開発サーバーは `http://localhost:5173` で起動します。

### 自動ナビゲーションシステム

本プロジェクトでは SveltePress の標準機能に加えて、独自の自動ナビゲーションシステムを実装しています。

#### 特徴

- **自動生成**: 各ページに前後のページへのナビゲーションリンクが自動的に追加
- **単一情報源**: `src/lib/config/sidebar.ts`のサイドバー構造から自動的に生成（二重管理不要）
- **メンテナンス性**: 新しいページを追加するだけで自動的にナビゲーションに反映

#### 実装詳細

- `src/lib/components/AutoPageNavigation.svelte` - ナビゲーション表示コンポーネント
- `src/lib/utils/navigation-from-config.ts` - sidebar.ts から構造を生成するユーティリティ
- `src/lib/config/sidebar.ts` - サイドバー構造の単一情報源（Single Source of Truth）

詳細は[CLAUDE.md](./CLAUDE.md#自動ナビゲーションシステム)を参照してください。

### ビルド・デプロイ

```bash
# プロダクションビルド
pnpm build

# ビルド結果のプレビュー
pnpm preview
```

プロダクションビルドは自動的に GitHub Pages にデプロイされます。

### 利用可能なコマンド

```bash
# 開発サーバー起動
pnpm dev

# プロダクションビルド
pnpm build

# ビルド結果をローカルでプレビュー
pnpm preview
```

## 📝 コントリビューション

### バグ報告・機能要望

[Issues](https://github.com/shuji-bonji/Svelte-and-SvelteKit-with-TypeScript/issues)からお願いします。

### プルリクエスト

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

### コーディング規約

- すべてのコード例で TypeScript を使用
- Svelte 5 の Runes システムを使用（古い文法は避ける）
- 複雑な派生値には`$derived.by()`を使用
- 型定義を明確に記述
- 日本語でコメントを記述
- SSR 対応のため Optional chaining を活用

詳細は[CLAUDE.md](./CLAUDE.md)を参照してください。

## 📄 ライセンス

このプロジェクトは[Creative Commons Attribution 4.0 International License](./LICENSE)の下で公開されています。
学習目的での自由な利用・改変・配布が可能です。

## 🙏 謝辞

- [Svelte](https://svelte.dev/) - The Svelte contributors
- [SvelteKit](https://kit.svelte.dev/) - The SvelteKit team
- [SveltePress](https://sveltepress.site/) - Documentation framework
- [Mermaid](https://mermaid.js.org/) - Diagramming and charting tool

## 📬 連絡先

- GitHub: [@shuji-bonji](https://github.com/shuji-bonji)
- Issues: [GitHub Issues](https://github.com/shuji-bonji/Svelte-and-SvelteKit-with-TypeScript/issues)

---

**Note**: このドキュメントは継続的に更新されています。Svelte 5 の最新機能や Mermaid ダイアグラムによる視覚的解説を随時追加しています。最新の情報は[公開サイト](https://shuji-bonji.github.io/Svelte-and-SvelteKit-with-TypeScript/)をご確認ください。

変更履歴の詳細は[CHANGELOG.md](./CHANGELOG.md)を参照してください。

**Last Updated**: 2026 年 4 月 12 日 - Svelte MCP による全コンテンツ検証・修正、リファレンス最新化、PageProps/LayoutProps 対応
