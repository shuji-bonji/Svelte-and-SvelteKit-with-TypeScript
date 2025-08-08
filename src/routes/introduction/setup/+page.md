---
title: 環境構築
description: Svelte 5とSvelteKitの開発環境セットアップ
---

## 必要な環境

### 前提条件

- **Node.js** 18.19以上（推奨: 20.x LTS または 22.x LTS）
- **npm** 9以上 または **pnpm** 8以上（推奨）
- **VS Code**（推奨エディタ）

### Node.jsのインストール

#### Windows
[Node.js公式サイト](https://nodejs.org/)からLTS版をダウンロードしてインストール

#### macOS
```bash
# Homebrewを使用
brew install node

# またはnvmを使用
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install --lts
nvm use --lts
```

#### Linux
```bash
# nvmを使用（推奨）
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install --lts
nvm use --lts
```

## プロジェクトの作成

### SvelteKitプロジェクトの初期化

```bash
# npm を使う場合
npm create svelte@latest my-app

# pnpm を使う場合（推奨）
pnpm create svelte@latest my-app

# yarn を使う場合
yarn create svelte my-app

# bunを使う場合
bun create svelte@latest my-app
```

:::note
`@latest`を付けることで常に最新版のSvelteKitがインストールされます
:::

### 対話形式での設定

```bash
┌  Welcome to SvelteKit!
│
◇  Which Svelte app template?
│  ○ SvelteKit demo app
│  ● Skeleton project  # これを選択（基本構造のみ）
│  ○ Library project
│
◇  Add type checking with TypeScript?
│  ○ Yes, using JavaScript with JSDoc comments
│  ● Yes, using TypeScript syntax  # これを選択
│
◇  Select additional options (use arrow keys/space bar)
│  ◼ Add ESLint for code linting        # 推奨
│  ◼ Add Prettier for code formatting    # 推奨
│  ◼ Add Playwright for browser testing  # E2Eテストが必要な場合
│  ◼ Add Vitest for unit testing        # ユニットテストが必要な場合
│  ◼ Add Tailwind CSS                   # CSSフレームワークが必要な場合
└
```
:::important
Svelte 5は2024年10月にリリースされ、デフォルトでインストールされます。`Try the Svelte 5 preview`オプションは不要になりました。
:::


### 依存関係のインストール

```bash
cd my-app
pnpm install  # または npm install
```

### パッケージマネージャの選択

| マネージャ | 特徴 | 推奨度 |
|-----------|------|--------|
| **pnpm** | 高速、効率的なディスク使用量 | ⭐⭐⭐⭐⭐ |
| **npm** | Node.js標準、互換性が高い | ⭐⭐⭐⭐ |
| **yarn** | npmの代替、ワークスペース機能 | ⭐⭐⭐ |
| **bun** | 超高速、実験的 | ⭐⭐ |

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
│   │       └── +server.ts
│   ├── lib/             # 共有コンポーネント
│   │   ├── components/  # UIコンポーネント
│   │   ├── stores/      # グローバルストア
│   │   ├── utils/       # ユーティリティ関数
│   │   └── types/       # 共通型定義
│   ├── params/          # ルートパラメータ検証
│   ├── hooks.client.ts  # クライアントフック
│   ├── hooks.server.ts  # サーバーフック
│   ├── app.html         # HTMLテンプレート
│   └── app.d.ts         # グローバル型定義
├── static/              # 静的ファイル（favicon等）
├── tests/               # テストファイル
├── .svelte-kit/         # ビルド生成ファイル（gitignore）
├── node_modules/        # 依存パッケージ（gitignore）
├── svelte.config.js     # Svelte設定
├── vite.config.ts       # Vite設定
├── tsconfig.json        # TypeScript設定
├── .env                 # 環境変数
├── .env.example         # 環境変数の例
├── .gitignore          # Git除外設定
├── .prettierrc         # Prettier設定
├── .eslintrc.cjs       # ESLint設定
└── package.json        # プロジェクト設定
```

### 重要なファイルの説明

| ファイル | 説明 |
|---------|------|
| `+page.svelte` | ページコンポーネント |
| `+page.ts` | ユニバーサルload関数 |
| `+page.server.ts` | サーバーサイドload関数とActions |
| `+layout.svelte` | レイアウトコンポーネント |
| `+server.ts` | APIエンドポイント |
| `+error.svelte` | エラーページ |
| `app.d.ts` | TypeScript型定義 |

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

`package.json` で最新バージョンが使用されていることを確認。

```
"devDependencies": {
  "svelte": "^5.0.0",               // Svelte 5.x
  "@sveltejs/kit": "^2.0.0",        // SvelteKit 2.x
  "@sveltejs/adapter-auto": "^3.0.0",
  "@sveltejs/vite-plugin-svelte": "^4.0.0",
  "typescript": "^5.0.0",
  "vite": "^5.0.0"
}
```

### 最新版へのアップデート

```bash
# すべての依存関係を最新版に更新
pnpm update --latest

# または特定のパッケージのみ
pnpm add -D svelte@latest @sveltejs/kit@latest
```

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