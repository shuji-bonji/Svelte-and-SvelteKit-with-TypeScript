# TypeScriptで学ぶ Svelte 5/SvelteKit 完全ガイド

[![Deploy to GitHub Pages](https://github.com/shuji-bonji/Svelte-and-SvelteKit-with-TypeScript/actions/workflows/deploy.yml/badge.svg)](https://github.com/shuji-bonji/Svelte-and-SvelteKit-with-TypeScript/actions/workflows/deploy.yml)

日本語によるTypeScript中心のSvelte 5/SvelteKit完全マスター学習コンテンツです。

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
- 📖 **日本語** - 日本語による詳細な解説
- 💡 **実践的** - 実際のプロジェクトで使えるパターンを紹介

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

## 🛠 技術スタック

- **Svelte 5** (最新版)
- **SvelteKit** (最新版)
- **TypeScript** 5.x以上
- **Vite** 5.x以上
- **SveltePress** (ドキュメントサイト構築)

## 🚀 ローカル開発

### 前提条件

- Node.js 18.19以上（推奨: 20.x LTS）
- npm 9以上

### セットアップ

```bash
# リポジトリのクローン
git clone https://github.com/shuji-bonji/Svelte-and-SvelteKit-with-TypeScript.git
cd Svelte-and-SvelteKit-with-TypeScript

# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

開発サーバーは `http://localhost:5173` で起動します。

### ビルド

```bash
# プロダクションビルド
npm run build

# ビルド結果のプレビュー
npm run preview
```

### その他のコマンド

```bash
# 型チェック
npm run check

# リント
npm run lint

# フォーマット
npm run format
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

MIT License - 詳細は[LICENSE](./LICENSE)ファイルを参照してください。

## 🙏 謝辞

- [Svelte](https://svelte.dev/) - The Svelte contributors
- [SvelteKit](https://kit.svelte.dev/) - The SvelteKit team
- [SveltePress](https://sveltepress.site/) - Documentation framework

## 📬 連絡先

- GitHub: [@shuji-bonji](https://github.com/shuji-bonji)
- Issues: [GitHub Issues](https://github.com/shuji-bonji/Svelte-and-SvelteKit-with-TypeScript/issues)

---

**Note**: このドキュメントは継続的に更新されています。最新の情報は[公開サイト](https://shuji-bonji.github.io/Svelte-and-SvelteKit-with-TypeScript/)をご確認ください。