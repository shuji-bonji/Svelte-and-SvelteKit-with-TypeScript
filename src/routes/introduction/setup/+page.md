---
title: 環境構築
description: Svelte 5とSvelteKitの開発環境セットアップ
---

## 必要な環境

### 前提条件

- **Node.js** 18.13以上（推奨: 20.x LTS）
- **npm** 7以上 または **pnpm**（推奨）
- **VS Code**（推奨エディタ）

## プロジェクトの作成

### SvelteKitプロジェクトの初期化

```bash
# npm を使う場合
npm create svelte@latest my-app

# pnpm を使う場合（推奨）
pnpm create svelte@latest my-app

# yarn を使う場合
yarn create svelte my-app
```

### 対話形式での設定

```bash
┌  Welcome to SvelteKit!
│
◇  Which Svelte app template?
│  ○ SvelteKit demo app
│  ● Skeleton project  # これを選択
│  ○ Library project
│
◇  Add type checking with TypeScript?
│  ○ Yes, using JavaScript with JSDoc comments
│  ● Yes, using TypeScript syntax  # これを選択
│
◇  Select additional options (use arrow keys/space bar)
│  ◼ Add ESLint for code linting
│  ◼ Add Prettier for code formatting
│  ◼ Add Playwright for browser testing
│  ◼ Add Vitest for unit testing
│  ◼ Try the Svelte 5 preview  # これを選択
└
```

### 依存関係のインストール

```bash
cd my-app
pnpm install  # または npm install
```

## VS Code の設定

### 必須拡張機能

1. **Svelte for VS Code** - Svelte公式拡張機能
2. **Svelte 5 Snippets** - Svelte 5用のスニペット

### 推奨拡張機能

- **Prettier** - コードフォーマッター
- **ESLint** - リンター
- **Error Lens** - エラー表示の改善
- **GitLens** - Git統合

### VS Code設定

`.vscode/settings.json` ファイルを作成して、以下の設定を追加：

- **editor.defaultFormatter**: "esbenp.prettier-vscode"
- **[svelte] editor.defaultFormatter**: "svelte.svelte-vscode"
- **svelte.enable-ts-plugin**: true
- **svelte.plugin.svelte.format.enable**: true
- **コンパイラ警告の無視設定**:
  - a11y-click-events-have-key-events: "ignore"
  - a11y-no-static-element-interactions: "ignore"

## プロジェクト構造

```
my-app/
├── src/
│   ├── routes/          # ページとレイアウト
│   │   ├── +layout.svelte
│   │   ├── +page.svelte
│   │   └── api/         # APIエンドポイント
│   ├── lib/             # 共有コンポーネント
│   │   ├── components/
│   │   └── stores/
│   ├── app.html         # HTMLテンプレート
│   └── app.d.ts         # グローバル型定義
├── static/              # 静的ファイル
├── svelte.config.js     # Svelte設定
├── vite.config.ts       # Vite設定
├── tsconfig.json        # TypeScript設定
└── package.json
```

## 開発サーバーの起動

```bash
# 開発サーバー起動
pnpm dev

# ホットリロード付きで起動
pnpm dev --host

# 特定のポートで起動
pnpm dev --port 3000
```

デフォルトでは `http://localhost:5173` でアクセス可能です。

## ビルドとプレビュー

```bash
# プロダクションビルド
pnpm build

# ビルド結果のプレビュー
pnpm preview
```

## Svelte 5 の確認

`package.json` で Svelte 5 が使用されていることを確認：

- **svelte**: "^5.0.0"
- **@sveltejs/kit**: "^2.0.0"

## トラブルシューティング

### よくある問題

1. **Node.js バージョンエラー**
   ```bash
   # Node.js バージョン確認
   node --version
   
   # nvm を使ってバージョン切り替え
   nvm use 20
   ```

2. **依存関係の問題**
   ```bash
   # キャッシュクリア
   pnpm store prune
   
   # node_modules 削除して再インストール
   rm -rf node_modules pnpm-lock.yaml
   pnpm install
   ```

3. **TypeScript エラー**
   ```bash
   # TypeScript バージョン確認
   pnpm tsc --version
   
   # .svelte-kit フォルダを再生成
   rm -rf .svelte-kit
   pnpm dev
   ```

## 次のステップ

環境構築が完了したら、[TypeScript設定](/introduction/typescript-setup/)に進んで、型安全な開発環境を整えましょう。