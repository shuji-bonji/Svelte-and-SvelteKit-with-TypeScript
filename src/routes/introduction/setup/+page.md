---
title: 環境構築
description: Svelte5とSvelteKitの開発環境をTypeScriptで構築する完全ガイド - Node.js、pnpm、Vite、VS Code、エディタ設定、プロジェクト作成、必須ツール導入、初期設定を実例を交えてステップバイステップで詳しく解説します
---

## 必要な環境

### 前提条件

- **Node.js** 22.x LTS 以上を推奨（最低: 20.x LTS）
  - 最低要件: Node.js 18.13（SvelteKit 2 の最低要件）
  - **Node.js 22.x LTS**: 最新 LTS。2027 年まで長期サポート（推奨）
  - **Node.js 20.x LTS**: 2026 年 4 月よりメンテナンスフェーズだが引き続き利用可能
- **npm** 10 以上（Node.js 22 に同梱）／**pnpm** 9 以上／**bun** 1.2 以上
- **VS Code**（推奨エディタ）

### Node.jsのインストール

### Windows

[Node.js公式サイト](https://nodejs.org/)からLTS版をダウンロードしてインストール

### macOS

```bash
# Homebrewを使用
brew install node

# またはnvmを使用（v0.40 系を推奨）
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
nvm install --lts
nvm use --lts
```

### Linux

```bash
# nvmを使用（推奨。v0.40 系を利用）
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
nvm install --lts
nvm use --lts
```

## プロジェクトの作成

### 公式 CLI ツール `sv`

SvelteKit プロジェクトの作成には、公式 CLI `sv` を使用します。グローバルインストールは不要で、常に最新版が自動ダウンロードされます。

```bash
# プロジェクト作成
npx sv create my-app

# pnpm を使う場合
pnpm dlx sv create my-app

# bun を使う場合
bun x sv create my-app
```

:::caution[`npm create svelte@latest` は廃止されました]
旧 CLI `npm create svelte@latest` は **廃止**されました。`npx sv create` のみが現行の公式コマンドです。過去の記事で見かけても新規プロジェクトでは使わないでください。
:::

### 対話形式での設定

```bash
┌  Welcome to Svelte!
│
◇  Where would you like your project to be created?
│  ./my-app
│
◇  Which template would you like?
│  ○ SvelteKit demo
│  ● SvelteKit minimal      # 初心者向け（推奨）
│  ○ Svelte library
│
◇  Add type checking with TypeScript?
│  ○ Yes, using JavaScript with JSDoc
│  ● Yes, using TypeScript syntax  # 強く推奨
│  ○ No
│
◇  What would you like to add to your project? (use arrow keys / space bar)
│  ◼ prettier            # コードフォーマッター（推奨）
│  ◼ eslint              # リンター（推奨）
│  ▫︎ vitest              # ユニットテスト
│  ▫︎ playwright          # E2Eテスト
│  ▫︎ tailwindcss         # CSSフレームワーク
│  ▫︎ drizzle             # ORMツール
│  ▫︎ better-auth         # 認証ライブラリ（旧 lucia の後継）
│  ▫︎ mdsvex              # Markdown対応
│  ▫︎ paraglide           # 国際化（i18n）
│  ▫︎ storybook           # コンポーネント開発
│  ▫︎ sveltekit-adapter   # デプロイアダプター設定
│  ▫︎ mcp                 # AI 開発用 MCP サーバー統合
│
◇  Which package manager do you want to install dependencies with?
│  ● npm    # 標準的で安定
│  ○ pnpm   # 高速・効率的なディスク使用量
│  ○ yarn
│  ○ bun    # 超高速、ランタイム込み
│  ○ deno
└
```

### 主要なテンプレートの選択

| テンプレート          | 説明                     | 推奨対象                     |
| --------------------- | ------------------------ | ---------------------------- |
| **SvelteKit minimal** | 基本構造のみ、学習に最適 | 初心者、新規プロジェクト     |
| **SvelteKit demo**    | サンプルコード付き       | 機能確認、参考実装           |
| **Svelte library**    | ライブラリ開発用         | コンポーネントライブラリ作成 |

### 追加ツールの選択ガイド

#### 必須推奨（初心者向け）

- **prettier** - コードを自動整形
- **eslint** - コードの問題を検出
- **TypeScript** - 型安全性の確保

#### プロジェクトに応じて追加

- **vitest** - 単体テストを書く場合
- **playwright** - E2Eテストが必要な場合
- **tailwindcss** - ユーティリティCSSを使いたい場合
- **drizzle** - データベースを使う場合
- **better-auth** - 認証機能が必要な場合（旧 lucia の後継）
- **mdsvex** - Markdown 主体のサイトを作る場合
- **paraglide** - 国際化（i18n）が必要な場合
- **mcp** - AI 開発（Claude Code / Cursor / Copilot 等）で Svelte MCP を使う場合

### 依存関係のインストール

CLIツールが自動的に依存関係をインストールします。

#### 手動でインストールする場合

```bash
cd my-app
npm install
```

### パッケージマネージャの選択

| マネージャ | 特徴                                          | 推奨度     |
| ---------- | --------------------------------------------- | ---------- |
| **npm**    | Node.js標準、互換性が高い、学習リソースが豊富 | ⭐⭐⭐⭐⭐ |
| **pnpm**   | 高速、効率的なディスク使用量、モノレポ対応    | ⭐⭐⭐⭐   |
| **yarn**   | npmの代替、ワークスペース機能                 | ⭐⭐⭐     |
| **bun**    | 超高速、実験的、ランタイム込み                | ⭐⭐       |
| **deno**   | セキュア、TypeScript標準対応                  | ⭐⭐       |

:::tip
初心者の方はnpmを使用することをお勧めします。トラブルシューティングの情報が最も多く、確実に動作します。
:::

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

`.vscode/settings.json` ファイルを作成して、以下の設定を追加

- **editor.defaultFormatter**: "esbenp.prettier-vscode"
- **[svelte] editor.defaultFormatter**: "svelte.svelte-vscode"
- **svelte.enable-ts-plugin**: true
- **svelte.plugin.svelte.format.enable**: true
- **コンパイラ警告の無視設定**:
  - a11y-click-events-have-key-events: "ignore"
  - a11y-no-static-element-interactions: "ignore"

## プロジェクト構造

SvelteKitプロジェクトの標準的なフォルダ構成を示します。

:::tip[このセクションは「全体マップ」です]

ここでは `sv create` 直後のフォルダ構成を眺めることを目的としています。各ディレクトリの**詳しい役割と実例**（`src/lib/` の `$lib` エイリアス、サーバー専用コード、`static/` と `src/lib/assets/` の使い分けなど）は、[プロジェクト構造と規約](/sveltekit/basics/project-structure/) で体系的に解説しています。今すぐすべて理解する必要はありません。**「あとから戻ってきて参照できる場所がある」と覚えておくだけで十分**です。

:::

```
my-app/
├── src/
│   ├── routes/             # ページとルーティング
│   │   ├── +layout.svelte  # 共通レイアウト
│   │   └── +page.svelte    # ホームページ
│   ├── lib/                # 共有コンポーネント・ユーティリティ
│   │   ├── index.ts        # エクスポート定義
│   │   └── assets          # アセット（画像、フォントなど）
│   │       └── favicon.svg # ファビコン
│   ├── app.html            # HTMLテンプレート
│   ├── app.css             # グローバルCSS
│   └── app.d.ts            # TypeScript型定義
├── static/                 # 静的ファイル
├── tests/                  # テストファイル
├── eslint.config.js        # ESLint設定
├── package.json            # プロジェクト設定
├── svelte.config.js        # Svelte設定
├── vite.config.js          # Vite設定
├── tsconfig.json           # TypeScript設定
└── README.md               # プロジェクト説明
```

### 重要なファイルの説明

| ファイル          | 説明                            |
| ----------------- | ------------------------------- |
| `+page.svelte`    | ページコンポーネント            |
| `+page.ts`        | ユニバーサルload関数            |
| `+page.server.ts` | サーバーサイドload関数とActions |
| `+layout.svelte`  | レイアウトコンポーネント        |
| `+server.ts`      | APIエンドポイント               |
| `+error.svelte`   | エラーページ                    |
| `app.d.ts`        | TypeScript型定義                |

## 開発サーバーの起動

```bash
# 開発サーバー起動
npm run dev

# ホットリロード付きで起動（ネットワーク内の他デバイスからアクセス可能）
npm run dev -- --host

# 特定のポートで起動
npm run dev -- --port 3000
```

デフォルトでは `http://localhost:5173` でアクセス可能です。

:::note
`--`（ダブルダッシュ）はnpmスクリプトにオプションを渡すために必要です。
:::

## ビルドとプレビュー

```bash
# プロダクションビルド
npm run build

# ビルド結果のプレビュー
npm run preview

# ビルドして即プレビュー
npm run build && npm run preview
```

## Svelte 5 の確認

`package.json` で最新バージョンが使用されていることを確認

```jsonc
{
  "devDependencies": {
    "svelte": "^5.55.0",                    // Svelte 5.55 以上（Runes 必須）
    "@sveltejs/kit": "^2.58.0",             // SvelteKit 2.58 以上
    "@sveltejs/adapter-auto": "^3.0.0",
    "@sveltejs/vite-plugin-svelte": "^7.0.0", // Svelte 5 / Vite 8 対応
    "typescript": "^6.0.0",                 // TypeScript 6 系
    "vite": "^8.0.0"                        // Vite 8 系
  },
  "scripts": {
    "prepare": "svelte-kit sync"            // npm install 後に自動で型定義を生成
  },
  "engines": {
    "node": ">=22.0.0"                      // Node.js 22 LTS を推奨
  }
}
```

:::note
本ガイドは Svelte 5.55+ / SvelteKit 2.58+ / TypeScript 6 / Vite 8 / Node.js 22 LTS を前提に解説しています。`"prepare": "svelte-kit sync"` を含めておくと `npm install` 後に `./$types` が自動生成されます。
:::

### 最新版へのアップデート

```bash
# 現在のバージョンを確認
npm list svelte @sveltejs/kit

# 最新版の確認
npm outdated

# 特定のパッケージを最新版に更新
npm install -D svelte@latest @sveltejs/kit@latest

# すべての依存関係を更新（npm-check-updatesを使用）
npx npm-check-updates -u
npm install
```

### Svelte 5の新機能確認

プロジェクト作成後、`src/routes/+page.svelte`を開いて、Svelte 5のRunesが使えることを確認。

```svelte
<script lang="ts">
  // Svelte 5のRunes
  let count = $state(0);
  let doubled = $derived(count * 2);

  function increment() {
    count++;
  }
</script>

<button onclick={increment}>
  Count: {count}, Doubled: {doubled}
</button>
```

## トラブルシューティング

### よくある問題

1. **Node.js バージョンエラー**

   ```bash
   # Node.js バージョン確認
   node --version

   # nvm を使ってバージョン切り替え（20.x LTS推奨）
   nvm use 20
   # または22.x LTSを使用
   nvm use 22
   ```

2. **依存関係の問題**

   ```bash
   # キャッシュクリア
   npm cache clean --force

   # node_modules 削除して再インストール
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **TypeScript エラー**

   ```bash
   # TypeScript バージョン確認
   npx tsc --version

   # .svelte-kit フォルダを再生成
   rm -rf .svelte-kit
   npm run dev
   ```

## 次のステップ

環境構築が完了したら、以下のドキュメントに進んでください。

- [Hello World](/introduction/hello-world/) - 最初のSvelteコンポーネントを作成
- [なぜTypeScriptが必要か](/introduction/why-typescript/) - TypeScriptの重要性を理解
- [TypeScript設定](/introduction/typescript-setup/) - TypeScriptの詳細な設定

また、上記の「プロジェクト構造」をもう一歩踏み込んで理解したくなった時は、[プロジェクト構造と規約](/sveltekit/basics/project-structure/) を参照してください。`src/lib/`・`static/`・`src/routes/` などの各ディレクトリの役割、`$lib` エイリアス、特殊ファイルの命名規約、設定ファイルの中身までを体系的に解説しています。
