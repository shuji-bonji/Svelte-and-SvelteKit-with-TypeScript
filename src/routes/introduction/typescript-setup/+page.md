---
title: TypeScript設定
description: Svelte 5とSvelteKitプロジェクトのTypeScript環境構築
---

TypeScriptを使用したSvelte 5プロジェクトのセットアップ方法と、最適な設定について解説します。プロジェクトの作成から、tsconfig.jsonの設定、VSCodeの設定まで、実践的な環境構築を行います。

## プロジェクトのセットアップ

### 新規プロジェクトの作成

最新のSvelteKit CLIを使用してTypeScript対応のプロジェクトを作成します。`sv create`コマンドにより、必要な設定が自動的に最適化され、すぐに型安全な開発を始めることができます。

```bash
# npm
npx sv create my-app

# pnpm（高速・推奨）
pnpm dlx sv create my-app
# または
pnpx sv create my-app

# yarn
yarn dlx sv create my-app

# bun
bunx sv create my-app

# deno
deno run npm:sv create my-app
```

プロンプトでは以下のオプションを選択します。

```
┌ Welcome to SvelteKit!
│
◇ Which template would you like?
│ ● SvelteKit minimal （最小構成）
│ ○ SvelteKit demo app （デモアプリ）
│ ○ Library project （ライブラリプロジェクト）
│
◇ Add type checking with TypeScript?
│ ● Yes, using TypeScript syntax （TypeScript構文を使用）
│
◇ Select additional options (スペースで選択、複数可）
│ ◻ Add ESLint for code linting （コードの品質チェック）
│ ◻ Add Prettier for code formatting （コードフォーマット）
│ ◻ Add Playwright for browser testing （E2Eテスト）
│ ◻ Add Vitest for unit testing （ユニットテスト）
│ ◻ Try Svelte 5 beta （Svelte 5ベータ版）
│
└ Your project is ready!
```

:::tip[推奨オプション]
- **TypeScript syntax**: 必須。型安全な開発のため
- **ESLint**: 推奨。コード品質の維持
- **Prettier**: 推奨。一貫したコードスタイル
- **Vitest**: テストを書く場合は推奨
:::

### パッケージマネージャの選択

プロジェクトで使用するパッケージマネージャは、チーム全体で統一することが重要です。

```bash
# pnpm（推奨 - 高速で効率的）
cd my-app
pnpm install
pnpm dev

# npm（標準）
cd my-app
npm install
npm run dev

# yarn
cd my-app
yarn
yarn dev

# bun（最新・実験的）
cd my-app
bun install
bun dev
```

:::note[パッケージマネージャの違い]
- **pnpm**: ディスク容量を節約し、高速。モノレポに最適
- **npm**: Node.js標準。最も広くサポート
- **yarn**: npmの改良版。ワークスペース機能が充実
- **bun**: 最新のランタイム。非常に高速だが成熟度は低い
:::

### プロジェクト構造の確認

作成されたプロジェクトの構造を理解しておきましょう。

```
my-app/
├── src/
│   ├── routes/          # ページとレイアウト
│   │   └── +page.svelte # ホームページ
│   ├── lib/             # 共有コンポーネント・ユーティリティ
│   │   └── index.ts     # $lib エクスポート
│   ├── app.d.ts         # グローバル型定義
│   └── app.html         # HTMLテンプレート
├── static/              # 静的ファイル（画像、フォントなど）
├── tests/               # テストファイル（オプション）
├── .svelte-kit/         # 自動生成される型定義（Git無視）
├── svelte.config.js     # Svelte/SvelteKit設定
├── tsconfig.json        # TypeScript設定
├── vite.config.ts       # Vite設定
└── package.json         # 依存関係とスクリプト
```

### 既存プロジェクトへのTypeScript追加

既存のJavaScriptプロジェクトをTypeScriptに移行する場合の手順です。段階的な移行により、既存のコードを壊さずにTypeScriptの恩恵を受けられます。

```bash
# 必要なパッケージをインストール
pnpm add -D typescript tslib @tsconfig/svelte svelte-check

# tsconfig.jsonを作成（SvelteKit用に最適化）
cat > tsconfig.json << 'EOF'
{
  "extends": "./.svelte-kit/tsconfig.json",
  "compilerOptions": {
    "allowJs": true,
    "checkJs": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "sourceMap": true,
    "strict": true
  }
}
EOF

# 型定義の生成
pnpm exec svelte-kit sync

# 段階的な移行
# 1. .jsファイルを.tsに変更
# 2. .svelteファイルに lang="ts" を追加
# 3. 型エラーを修正
```

## tsconfig.json の設定

TypeScriptプロジェクトの心臓部となる`tsconfig.json`は、コンパイラの動作を制御する重要な設定ファイルです。適切な設定により、型チェックの厳密さ、モジュール解決の方法、出力されるJavaScriptのバージョンなどを細かく制御できます。

### 推奨設定

Svelte 5プロジェクトに最適化された`tsconfig.json`の推奨設定を以下に示します。

```typescript
// tsconfig.json
{
  "extends": "./.svelte-kit/tsconfig.json",
  "compilerOptions": {
    // 厳密な型チェック
    "strict": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    
    // 追加の型チェック
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    
    // モジュール解決
    "moduleResolution": "bundler",
    "target": "ESNext",
    "module": "ESNext",
    
    // パスエイリアス
    "paths": {
      "$lib": ["./src/lib"],
      "$lib/*": ["./src/lib/*"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.svelte"]
}
```

### 設定オプションの詳細

#### 厳密な型チェックオプション

- **strict**: すべての厳密な型チェックオプションを有効化
- **strictNullChecks**: null/undefinedの厳密なチェック
- **strictFunctionTypes**: 関数型の厳密なチェック
- **noImplicitAny**: 暗黙的なany型を禁止

#### 追加の型チェックオプション

- **noUnusedLocals**: 未使用のローカル変数を検出
- **noUnusedParameters**: 未使用のパラメータを検出
- **noImplicitReturns**: 暗黙的なreturnを禁止
- **noUncheckedIndexedAccess**: インデックスアクセスの安全性を強化

### 段階的な厳密性の導入

既存プロジェクトにTypeScriptを導入する場合、段階的に厳密性を上げていくアプローチが有効です。

```typescript
// 段階1: 最小限の設定から始める
{
  "extends": "./.svelte-kit/tsconfig.json",
  "compilerOptions": {
    "allowJs": true,
    "checkJs": false,
    "strict": false
  }
}

// 段階2: 基本的な型チェックを有効化
{
  "extends": "./.svelte-kit/tsconfig.json",
  "compilerOptions": {
    "allowJs": true,
    "checkJs": true,
    "strict": false,
    "noImplicitAny": true
  }
}

// 段階3: 完全な厳密モード
{
  "extends": "./.svelte-kit/tsconfig.json",
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

## グローバル型定義（app.d.ts）

SvelteKitアプリケーション全体で使用する型定義は、`app.d.ts`ファイルで管理します。

### app.d.tsの基本構造

```typescript
// src/app.d.ts
declare global {
  namespace App {
    // エラー型
    interface Error {
      message: string;
      code?: string;
    }
    
    // ローカル変数（サーバーサイドで使用）
    interface Locals {
      user?: {
        id: string;
        name: string;
        role: 'admin' | 'user';
      };
    }
    
    // ページデータ
    interface PageData {
      flash?: {
        type: 'success' | 'error';
        message: string;
      };
    }
    
    // ページ状態
    interface PageState {
      selected?: string;
    }
    
    // プラットフォーム固有の設定
    interface Platform {}
  }
}

export {};
```

### カスタム型の追加

プロジェクト全体で使用する共通の型定義を追加できます。

```typescript
// src/app.d.ts
declare global {
  // カスタム型定義
  interface User {
    id: string;
    name: string;
    email: string;
    createdAt: Date;
  }
  
  interface Post {
    id: string;
    title: string;
    content: string;
    authorId: string;
    publishedAt?: Date;
  }
  
  // 環境変数の型定義
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string;
      API_KEY: string;
      NODE_ENV: 'development' | 'production' | 'test';
    }
  }
}

export {};
```

## VSCode設定

VS CodeでSvelteとTypeScriptの開発体験を最適化するための設定を行います。

### .vscode/settings.json

プロジェクトルートに`.vscode/settings.json`ファイルを作成し、プロジェクト固有の設定を定義します。

```typescript
// .vscode/settings.json
{
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "svelte.enable-ts-plugin": true,
  "[svelte]": {
    "editor.defaultFormatter": "svelte.svelte-vscode"
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.preferences.quoteStyle": "single",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

### 推奨拡張機能

`.vscode/extensions.json`に推奨拡張機能を定義します。

```typescript
// .vscode/extensions.json
{
  "recommendations": [
    "svelte.svelte-vscode",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss"
  ]
}
```

### 拡張機能の説明

- **Svelte for VS Code**: Svelteファイルのシンタックスハイライトと補完
- **ESLint**: コード品質チェック
- **Prettier**: コードフォーマッター
- **Tailwind CSS IntelliSense**: Tailwind CSSを使用する場合

## パフォーマンスとビルド設定

### 型チェックの最適化

大規模プロジェクトでの型チェックを高速化する設定です。

```typescript
// tsconfig.json の追加設定
{
  "compilerOptions": {
    "incremental": true,
    "tsBuildInfoFile": ".tsbuildinfo",
    "skipLibCheck": true,
    "skipDefaultLibCheck": true
  }
}
```

### ビルド時の型チェック

開発中だけでなく、ビルド時にも型チェックを実行することで、本番環境へのデプロイ前に型エラーを検出できます。

```typescript
// package.json
{
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "preview": "vite preview",
    "check": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json",
    "check:watch": "svelte-check --tsconfig ./tsconfig.json --watch",
    "lint": "eslint .",
    "format": "prettier --write .",
    "test": "vitest",
    "test:unit": "vitest run",
    "prepare": "svelte-kit sync"
  }
}
```

### CI/CDパイプラインでの型チェック

GitHub Actionsなどを使用して、プルリクエスト時に自動的に型チェックを実行します。

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  type-check:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - uses: actions/setup-node@v3
        with:
          node-version: 20
          cache: 'pnpm'
      
      - run: pnpm install
      
      - run: pnpm check
      
      - run: pnpm lint
      
      - run: pnpm test:unit
```

## トラブルシューティング

TypeScriptとSvelteを使用する際に遭遇する可能性のある問題と、その解決方法を紹介します。

### よくある問題と解決策

#### 1. 型定義ファイルが見つからない

SvelteKitが生成する型定義ファイルが見つからない場合の対処法です。

```bash
# 型定義を再生成
npm run svelte-kit sync

# または
pnpm exec svelte-kit sync
```

#### 2. VS Codeで型エラーが表示されない

VS Codeが正しくTypeScriptを認識していない場合の解決方法です。

```bash
# TypeScriptバージョンの確認
npx tsc --version

# VS CodeでワークスペースのTypeScriptを使用
# Cmd/Ctrl + Shift + P → "TypeScript: Select TypeScript Version"
# "Use Workspace Version"を選択
```

#### 3. $app/pathsなどのインポートエラー

SvelteKitの特殊なモジュールがインポートできない場合の対処法です。

```typescript
// tsconfig.jsonの確認
// "extends": "./.svelte-kit/tsconfig.json" が必須
// この設定により、SvelteKitの型定義が読み込まれる
```

#### 4. Svelte 5のRunesが認識されない

最新のSvelte 5とsvelte-checkがインストールされていることを確認します。

```bash
# 最新版にアップデート
pnpm update svelte@latest
pnpm update svelte-check@latest
```

### デバッグのヒント

#### TypeScriptのログを有効化

VS Codeで詳細なTypeScriptログを確認できます。

1. Cmd/Ctrl + Shift + P → "TypeScript: Open TS Server Log"
2. ログレベルを"Verbose"に設定
3. 問題の詳細を確認

#### 型定義の確認

型がどのように推論されているか確認する方法

```typescript
// VS Codeでホバーして型を確認
let value = $state(0);  // ホバーで型を表示

// 明示的な型チェック
type Check = typeof value;  // number
```

## まとめ

このページでは、Svelte 5プロジェクトのTypeScript環境構築について解説しました。

- **プロジェクトセットアップ** - sv createコマンドでの新規作成
- **tsconfig.json設定** - 最適な型チェック設定
- **グローバル型定義** - app.d.tsでの型管理
- **VSCode設定** - 開発体験の最適化
- **パフォーマンス最適化** - ビルドとCI/CDの設定
- **トラブルシューティング** - よくある問題の解決

これらの設定により、型安全で生産的なSvelte開発環境が構築できます。

## 次のステップ

プロジェクトの設定が完了したら、次はSvelteコンポーネントでTypeScriptを使う方法を学びましょう。

- [なぜTypeScriptが必要か](/introduction/why-typescript/) - TypeScriptの重要性を理解
- [TypeScript統合](/svelte/basics/typescript-integration/) - SvelteコンポーネントでのTypeScriptの使い方
- [TypeScriptパターン](/svelte/advanced/typescript-patterns/) - 高度な型定義パターンとベストプラクティス