# TypeScriptで学ぶ Svelte 5/SvelteKit 完全ガイド

[![Deploy to GitHub Pages](https://github.com/shuji-bonji/Svelte-and-SvelteKit-with-TypeScript/actions/workflows/deploy.yml/badge.svg)](https://github.com/shuji-bonji/Svelte-and-SvelteKit-with-TypeScript/actions/workflows/deploy.yml)
[Sveltepress]
[![SvelteKit](https://img.shields.io/badge/SvelteKit-v2.16-red?logo=svelte&
labelColor=000)](https://svelte.dev/)
[![TypeScript](https://img.shields.io/badge/-TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Svelte5](https://img.shields.io/badge/-Svelte%205-%23ff3e00?logo=svelte&logoColor=ffffff)](https://svelte.dev/)
[![CC BY 4.0](https://img.shields.io/badge/License-CC%20BY%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by/4.0/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
[![Claude](https://img.shields.io/badge/Claude-D97757?logo=claude&logoColor=fff)](https://claude.ai)


日本語によるTypeScript中心のSvelte 5/SvelteKit完全マスター学習コンテンツです。最新のSvelte 5 Runesシステムを使用し、Mermaidダイアグラムによる視覚的な解説も充実。

🌐 **公開サイト**: [https://shuji-bonji.github.io/Svelte-and-SvelteKit-with-TypeScript/](https://shuji-bonji.github.io/Svelte-and-SvelteKit-with-TypeScript/)

## 📚 このドキュメントについて

このドキュメントは、TypeScriptを使用してSvelte 5とSvelteKitを学習するための包括的なガイドです。最新のSvelte 5 Runesシステムを中心に、実践的なコード例と共に解説しています。

### 対象読者

- TypeScript/JavaScriptでのWeb開発経験がある方
- SPA/WebAPI開発経験があるがSSR/SSGは不慣れな方
- Svelteの公式ドキュメントでTypeScript情報が少なく苦労している方
- SvelteKitでビジネスレベルのサービスを構築したい方

### 特徴

- 🎯 **TypeScript中心** - すべてのコード例でTypeScriptを使用
- 🚀 **Svelte 5対応** - 最新のRunesシステムを完全網羅
- 📊 **Mermaidダイアグラム** - 視覚的な図解でわかりやすく解説
- 📖 **日本語** - 日本語による詳細な解説
- 💡 **実践的** - 実際のプロジェクトで使えるパターンを紹介
- 🌙 **ダークモード対応** - テーマ切り替えに完全対応

## 🗂 コンテンツ構成

### 1️⃣ はじめに
- Svelte 5の概要
- なぜSvelteか
- 環境構築
- TypeScript設定

### 2️⃣ Svelteの基本
- Hello World
- コンポーネントの基本構造
- TypeScript統合
- スクリプトコンテキスト

### 3️⃣ Runesシステム
- Runesシステム概要
- Runesシステム入門
- `$state` - リアクティブな状態管理
- `$derived` - 計算値
- `$effect` - 副作用の処理
- `$props` - プロパティ定義
- `$bindable` - 双方向バインディング

### 4️⃣ 実践編
- リアクティブストア（.svelte.ts）
- クラスとリアクティビティ
- Snippets機能
- コンポーネントパターン
- TypeScriptパターン

### 5️⃣ SvelteKit
- ルーティング
- Load関数
- サーバーサイド処理
- フォーム処理
- APIルート
- デプロイメント

### 6️⃣ 実装例
- TODOアプリ
- 認証システム
- データフェッチング
- WebSocket実装

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

<Mermaid code={diagramCode} />
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
- 型定義を明確に記述
- 日本語でコメントを記述

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

**Last Updated**: 2025年1月 - Mermaidダイアグラム機能追加、技術スタック情報更新