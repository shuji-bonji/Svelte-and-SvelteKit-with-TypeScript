# TypeScriptで学ぶ Svelte 5/SvelteKit 完全ガイド

[![Deploy to GitHub Pages](https://github.com/shuji-bonji/Svelte-and-SvelteKit-with-TypeScript/actions/workflows/deploy.yml/badge.svg)](https://github.com/shuji-bonji/Svelte-and-SvelteKit-with-TypeScript/actions/workflows/deploy.yml)
[![SveltePress](https://img.shields.io/badge/SveltePress-v6.0.4-blue?logo=svelte&logoColor=white)](https://sveltepress.site/)
[![SvelteKit](https://img.shields.io/badge/SvelteKit-v2.16-red?logo=svelte&labelColor=000)](https://svelte.dev/)
[![TypeScript](https://img.shields.io/badge/-TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Svelte5](https://img.shields.io/badge/-Svelte%205-%23ff3e00?logo=svelte&logoColor=ffffff)](https://svelte.dev/)
[![CC BY 4.0](https://img.shields.io/badge/License-CC%20BY%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by/4.0/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
[![Claude](https://img.shields.io/badge/Claude-D97757?logo=claude&logoColor=fff)](https://claude.ai)


日本語によるTypeScript中心のSvelte 5/SvelteKit完全マスター学習コンテンツです。最新のSvelte 5 Runesシステムを使用し、Mermaidダイアグラムによる視覚的な解説も充実。実際に動作するAPI連携例（JSONPlaceholder、GitHub Search API）を含む実践的な内容。Load関数のデータフローや実行環境別アーキテクチャ（SSR/SSG/SPA）についても詳細に解説。

🌐 **公開サイト**: [https://shuji-bonji.github.io/Svelte-and-SvelteKit-with-TypeScript/](https://shuji-bonji.github.io/Svelte-and-SvelteKit-with-TypeScript/)

## 📚 このドキュメントについて

このドキュメントは、TypeScriptを使用してSvelte 5とSvelteKitを学習するための包括的なガイドです。最新のSvelte 5 Runesシステムを中心に、実践的なコード例と共に解説しています。

### 対象読者

- TypeScript/JavaScriptでのWeb開発経験がある方
- SPA/WebAPI開発経験があるがSSR/SSGは不慣れな方
- Svelteの公式ドキュメントでTypeScript情報が少なく苦労している方
- SvelteKitでビジネスレベルのサービスを構築したい方
- エンタープライズ開発者（Spring Boot、ASP.NET Core、Angular等の経験者）

### 特徴

- 🎯 **TypeScript中心** - すべてのコード例でTypeScriptを使用
- 🚀 **Svelte 5対応** - 最新のRunesシステムを完全網羅（`$derived.by()`など最新構文）
- 📊 **Mermaidダイアグラム** - Load関数のデータフロー、実行順序を視覚的に解説
- 📖 **日本語** - 日本語による詳細な解説
- 💡 **実践的** - Universal LoadとServer Loadの使い分けを具体例で解説
- 🌙 **ダークモード対応** - テーマ切り替えに完全対応
- 🔧 **SSR完全対応** - サーバーサイドレンダリングのエラーを回避する実装
- 🌐 **実API連携** - JSONPlaceholder、GitHub APIを使用した実動作例
- 🏗️ **アーキテクチャ詳解** - SSR/SSG/SPAの実行環境別の動作を詳細に解説
- 📈 **アクセスログ分析** - レンダリング戦略がWebサーバーログに与える影響を説明
- 🏢 **エンタープライズ対応** - レイヤードアーキテクチャ、DDD、Clean Architecture対応（計画中）

## 🗂 コンテンツ構成

### 1️⃣ はじめに
- Svelte 5の概要
- なぜSvelteか
- 環境構築
- TypeScript設定
- 学習パス

### 2️⃣ Svelteの基本
- Hello World
- コンポーネントの基本構造
- テンプレート構文
- TypeScript統合
- Actions
- トランジション・アニメーション

### 3️⃣ Runes基礎編
- `$state` - リアクティブな状態管理
- `$derived` / `$derived.by()` - 計算値と明示的な派生値
- `$effect` / `$effect.pre` - 副作用の処理とDOM更新前実行
- 他フレームワークとの比較

### 4️⃣ Runes応用編
- Runesシステム詳細
- `$props` - プロパティ定義
- `$bindable` - 双方向バインディング
- `$inspect` - デバッグツール

### 5️⃣ 実践編
- リアクティブストア（.svelte.ts）
- クラスとリアクティビティ
- 組み込みリアクティブクラス
- Snippets機能
- コンポーネントパターン
- TypeScriptパターン
- スクリプトコンテキスト

### 6️⃣ Svelteアーキテクチャ（計画中）
- SPA + 既存API統合パターン
- BaaS統合（Firebase、Supabase）
- GraphQL統合
- マイクロフロントエンド

### 7️⃣ SvelteKit基礎編
- SvelteKit概要とアーキテクチャ
- プロジェクト構造
- ルーティング
- Load関数とデータフェッチング

### 8️⃣ SvelteKitアーキテクチャ詳解
- 実行環境別アーキテクチャ（SSR/SSG/SPA）
- ファイル構成と実行環境
- データロードフロー
- レンダリングパイプライン

### 9️⃣ SvelteKitサーバーサイド編
- フォーム処理とActions
- サーバーサイド処理
- APIルート設計
- Hooks

### 🔟 SvelteKitエンタープライズ開発（計画中）
- レイヤードアーキテクチャ
- ドメイン駆動設計（DDD）
- リポジトリパターン
- 依存性注入（DI）
- Clean Architecture実装

### 1️⃣1️⃣ SvelteKitデプロイ・運用編
- プラットフォーム別デプロイ
- セキュリティ
- モニタリング

### 1️⃣2️⃣ 実装例
- TODOアプリ
- 認証システム
- データフェッチング
- WebSocket実装
- Mermaidダイアグラム（SSR対応）

### 1️⃣3️⃣ ディープダイブ（技術詳細）
Svelte 5の内部実装や高度なトピックを扱います。
- Proxyオブジェクトの活用
- リアクティブ状態変数とバインディングの違い
- `$state.raw` vs `$state`の使い分け
- `$derived` vs `$effect` vs `$derived.by`の違い
- コンパイル時最適化
- HTMLテンプレートとSnippets
- カスタム要素とSvelteコンポーネント

## 📊 Mermaidダイアグラム機能

このドキュメントでは、複雑な概念を視覚的に理解できるよう、Mermaidダイアグラムを豊富に使用しています。

### サポートしているダイアグラムタイプ

- **フローチャート** - プロセスや処理フローの表現
- **シーケンス図** - コンポーネント間の相互作用
- **クラス図** - TypeScript型定義や構造の表現
- **ガントチャート** - 学習ロードマップや進捗管理
- **円グラフ** - データの割合や構成比

### 特徴

- 🌙 **ダークモード完全対応** - システムテーマに自動追従
- 🎨 **Svelteブランドカラー** - 統一されたデザイン
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

詳細は[Mermaidデモページ](https://shuji-bonji.github.io/Svelte-and-SvelteKit-with-TypeScript/examples/mermaid-demo/)をご確認ください。

## 🛠 技術スタック

### コア技術
- **Svelte 5** (5.0.0+) - 最新のRunesシステム対応
- **SvelteKit** (2.8.1+) - フルスタックフレームワーク
- **TypeScript** (5.3.3+) - 型安全な開発環境
- **Vite** (5.1.4+) - 高速ビルドツール

### ドキュメント・可視化
- **SveltePress** (6.0.4+) - 静的サイト生成
- **Mermaid** (11.9.0+) - ダイアグラム描画
- **Rehype-Mermaid** (3.0.0+) - Markdown統合

### カスタム機能
- **AutoPageNavigation** - ページ間の自動ナビゲーション生成
- **navigation-from-config** - vite.config.tsから自動的にナビゲーション構造を生成

### 推奨環境
- **Node.js** 18.19+ (推奨: 20.x LTS)
- **pnpm** 9.15.0+ (パッケージマネージャー)

## 🚀 ローカル開発

### 前提条件

- Node.js 18.19以上（推奨: 20.x LTS）
- pnpm 9.15.0以上（推奨パッケージマネージャー）

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

本プロジェクトではSveltePressの標準機能に加えて、独自の自動ナビゲーションシステムを実装しています。

#### 特徴
- **自動生成**: 各ページに前後のページへのナビゲーションリンクが自動的に追加
- **単一情報源**: `vite.config.ts`のサイドバー構造から自動的に生成（二重管理不要）
- **メンテナンス性**: 新しいページを追加するだけで自動的にナビゲーションに反映

#### 実装詳細
- `src/lib/components/AutoPageNavigation.svelte` - ナビゲーション表示コンポーネント
- `src/lib/utils/navigation-from-config.ts` - vite.config.tsから構造を生成するユーティリティ

詳細は[CLAUDE.md](./CLAUDE.md#自動ナビゲーションシステム)を参照してください。

### ビルド・デプロイ

```bash
# プロダクションビルド
pnpm build

# ビルド結果のプレビュー
pnpm preview
```

プロダクションビルドは自動的にGitHub Pagesにデプロイされます。

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

- すべてのコード例でTypeScriptを使用
- Svelte 5のRunesシステムを使用（古い文法は避ける）
- 複雑な派生値には`$derived.by()`を使用
- 型定義を明確に記述
- 日本語でコメントを記述
- SSR対応のためOptional chainingを活用

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

**Note**: このドキュメントは継続的に更新されています。Svelte 5の最新機能やMermaidダイアグラムによる視覚的解説を随時追加しています。最新の情報は[公開サイト](https://shuji-bonji.github.io/Svelte-and-SvelteKit-with-TypeScript/)をご確認ください。

**Last Updated**: 2025年8月 - 自動ナビゲーションシステム実装、Load関数のデータフロー可視化、実行環境別アーキテクチャ詳解追加、Universal/Server Load使い分けガイド、アクセスログ分析セクション追加

