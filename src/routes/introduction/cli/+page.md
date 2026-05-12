---
title: CLI tools - Svelte CLIツール
description: Svelte/SvelteKitの公式CLIツール（sv）の完全ガイド。sv create、sv add、sv check、sv migrateの使い方をTypeScriptプロジェクトで解説
---

<script>
	import Admonition from '$lib/components/Admonition.svelte';
  import Mermaid from '$lib/components/Mermaid.svelte';

  const svCheckDiagram = `flowchart TB
    subgraph check["sv check の検出対象"]
        direction TB
        CSS["未使用の CSS セレクター"]
        A11Y["アクセシビリティの問題（a11y）"]
        COMPILE["JavaScript/TypeScript コンパイルエラー"]
        SVELTE["Svelte コンポーネントの構文エラー"]
        TYPE["型の不整合（TypeScript）"]
    end

    style check fill:#e8f5e9
    style CSS fill:#c8e6c9
    style A11Y fill:#c8e6c9
    style COMPILE fill:#c8e6c9
    style SVELTE fill:#c8e6c9
    style TYPE fill:#c8e6c9`;
</script>

`sv` は Svelte/SvelteKit アプリケーションを作成・管理するための公式 CLI ツールキットです。
プロジェクトの作成、機能の追加、コードチェック、マイグレーションを一元的に行えます。

## この記事で学べること

- sv コマンドの基本的な使い方
- sv create でのプロジェクト作成
- sv add での機能追加
- sv check でのコード検証
- sv migrate でのバージョン移行

## 基本的な使い方

`sv` コマンドは、パッケージマネージャの `npx`、`pnpx`、または `yarn dlx` を通じて実行します。グローバルインストールは不要で、常に最新版が自動的にダウンロードされます。

```bash
# npx で実行（推奨）
npx sv <command> <args>

# pnpm の場合
pnpm dlx sv <command> <args>

# yarn の場合
yarn dlx sv <command> <args>

# bun の場合
bun x sv <command> <args>

# deno の場合
deno run -A npm:sv-cli <command> <args>
```

:::caution[`pnpx` は廃止されました]
旧 pnpm の `pnpx sv ...` エイリアスは pnpm v6.13 で削除されました。最新の pnpm では `pnpm dlx sv ...`（npx 相当）または `pnpm exec sv ...`（ローカルインストール済みのバイナリを実行）を使ってください。
:::

<Admonition type="tip" title="ローカルインストール不要">

`sv` はプロジェクト内にインストールされていない場合でも、最新版が自動的にダウンロードされて実行されます。
特に `sv create` は常に最新版を使用することをお勧めします。

</Admonition>

## sv create

新しい SvelteKit プロジェクトをセットアップします。テンプレートの選択、TypeScript の有効化、各種アドオンの追加などを一括で行えます。

### 基本的な使い方

引数なしで実行するとインタラクティブモードが起動し、対話形式で設定を選択できます。オプションを指定することで、非対話的に実行することも可能です。

```bash
# インタラクティブモードで作成
npx sv create my-app

# オプションを指定して作成
npx sv create --template minimal --types ts my-app
```

### オプション

`sv create` には、プロジェクトの初期構成をカスタマイズするための多くのオプションがあります。

| オプション             | 説明                                                                |
| ---------------------- | ------------------------------------------------------------------- |
| `--template <name>`    | プロジェクトテンプレート（`minimal`、`demo`、`library`）            |
| `--types <option>`     | 型チェック方式（`ts`、`jsdoc`）                                     |
| `--no-types`           | 型チェックなし（非推奨）                                            |
| `--add [add-ons...]`   | アドオンを追加（`sv add` と同じ書式）                               |
| `--no-add-ons`         | アドオンの対話プロンプトをスキップ                                  |
| `--from-playground <url>` | Svelte Playground の URL からプロジェクトを生成                  |
| `--install <pm>`       | パッケージマネージャを指定（`npm` / `pnpm` / `yarn` / `bun` / `deno`） |
| `--no-install`         | 依存関係をインストールしない                                        |
| `--no-dir-check`       | 対象ディレクトリが空かのチェックをスキップ                          |

### テンプレートの種類

`sv create` では、用途に応じて 3 種類のテンプレートから選択できます。

#### minimal（最小構成）

最小限のファイル構成で始めたい場合に使用します。不要なサンプルコードがなく、自由に構築を進められます。

```bash
npx sv create --template minimal my-app
```

#### demo（デモアプリ）

SvelteKit の Progressive Enhancement（段階的機能強化）を体験できるサンプルアプリが含まれます。JavaScript なしでも動作するワードゲームが実装されており、実際のコードを参考にできます。

```bash
npx sv create --template demo my-app
```

#### library（ライブラリ）

npm パッケージとして公開可能な Svelte コンポーネントライブラリを作成する場合に使用します。`svelte-package` によるビルド設定が含まれています。

```bash
npx sv create --template library my-library
```

### TypeScript プロジェクトの作成

型安全な開発のために、TypeScript の使用を強く推奨します。`--types ts` を指定すると、TypeScript の設定ファイルと型定義が自動的に追加されます。

```bash
# TypeScript を使用（推奨）
npx sv create --types ts my-app

# JSDoc で型注釈を使用
npx sv create --types jsdoc my-app
```

### アドオンを含めて作成

プロジェクト作成時に `--add` オプションを使用して、開発ツールやライブラリを一括でセットアップできます。後から `sv add` で追加することも可能ですが、最初から必要なツールを含めておくと設定の手間が省けます。

```bash
# ESLint と Prettier を含めて作成
npx sv create --add eslint prettier my-app

# 複数のアドオンを一度に追加
npx sv create --add eslint prettier tailwindcss vitest my-app
```

### Playground からプロジェクトを作成

[Svelte Playground](https://svelte.dev/playground) で作成したコードをローカルプロジェクトとして展開できます。Playground で試したアイデアをそのまま本格的な開発に移行する際に便利です。

```bash
# Svelte Playground の URL から作成
npx sv create --from-playground="https://svelte.dev/playground/hello-world"
```

## sv add

既存のプロジェクトに機能を追加します。ESLint、Prettier、Tailwind CSS、テストフレームワーク、データベース ORM など、公式にサポートされた統合を簡単にセットアップできます。

### 基本的な使い方

引数なしで実行すると、利用可能なアドオンの一覧から対話的に選択できます。追加したいアドオンが決まっている場合は、直接指定することも可能です。

```bash
# インタラクティブモードで選択
npx sv add

# 特定のアドオンを追加
npx sv add tailwindcss

# 複数のアドオンを追加
npx sv add eslint prettier vitest
```

### オプション

`sv add` の動作をカスタマイズするためのオプションです。

| オプション              | 説明                                                              |
| ----------------------- | ----------------------------------------------------------------- |
| `-C`, `--cwd`           | プロジェクトのルートパス                                          |
| `--no-git-check`        | Git のチェックをスキップ（汚れたワークツリーでも実行）            |
| `--no-download-check`   | コミュニティアドオンのダウンロード確認プロンプトをすべてスキップ  |
| `--install <pm>`        | パッケージマネージャを指定（`npm` / `pnpm` / `yarn` / `bun` / `deno`） |
| `--no-install`          | 依存関係をインストールしない                                      |

### 公式アドオン一覧

Svelte チームが公式にサポートするアドオンです。これらは SvelteKit プロジェクトとの互換性が保証されており、設定ファイルが自動的に生成されます。

| アドオン            | 説明                               |
| ------------------- | ---------------------------------- |
| `better-auth`       | Better Auth による認証システム     |
| `drizzle`           | Drizzle ORM によるデータベース統合 |
| `eslint`            | ESLint によるコード品質チェック    |
| `mcp`               | MCP（Model Context Protocol）統合  |
| `mdsvex`            | Markdown in Svelte                 |
| `paraglide`         | 国際化（i18n）サポート             |
| `playwright`        | Playwright による E2E テスト       |
| `prettier`          | Prettier によるコードフォーマット  |
| `storybook`         | Storybook によるコンポーネント開発 |
| `sveltekit-adapter` | デプロイアダプターの設定           |
| `tailwindcss`       | Tailwind CSS の統合                |
| `vitest`            | Vitest によるユニットテスト        |

<Admonition type="note" title="認証アドオンの変更">

以前の公式アドオンだった `lucia` は `better-auth` に置き換わりました。新規プロジェクトでは `better-auth` の使用を推奨します。

</Admonition>

### 使用例

よく使用されるアドオンの組み合わせ例を示します。用途に応じて必要なアドオンを選択してください。

```bash
# Tailwind CSS を追加
npx sv add tailwindcss

# テスト環境を構築
npx sv add vitest playwright

# データベースと認証を追加
npx sv add drizzle better-auth

# 開発ツールをまとめて追加
npx sv add eslint prettier storybook
```

### コミュニティアドオン

公式アドオンに加えて、コミュニティが開発したアドオンも利用できます（実験的機能）。npm パッケージとして公開されており、`@org/sv` の命名規則に従います。

```bash
# コミュニティアドオンをインストール（組織名を指定）
npx sv add @supacool

# 公式アドオンとコミュニティアドオンを混在させる
npx sv add eslint @supacool

# プロジェクト作成時にも指定可能
npx sv create --add eslint @supacool
```

<Admonition type="warning" title="コミュニティアドオンの注意">

コミュニティアドオンは Svelte メンテナーによるセキュリティレビューを受けていません。`--no-download-check` オプションは注意して使用してください。

</Admonition>

## sv check

プロジェクト内のエラーと警告を検出します。TypeScript の型エラー、Svelte コンポーネントの問題、アクセシビリティの警告、未使用の CSS などを一括でチェックできます。

<Mermaid diagram={svCheckDiagram} />

### インストール

`sv check` を使用するには、`svelte-check` パッケージをプロジェクトにインストールする必要があります。

```bash
# svelte-check をインストール
npm i -D svelte-check
```

### 基本的な使い方

開発中は `--watch` モードで実行し、変更を監視しながらリアルタイムでエラーを確認できます。CI/CD パイプラインでは `--fail-on-warnings` を使用して、警告もエラーとして扱うことを推奨します。

```bash
# プロジェクト全体をチェック
npx sv check

# ウォッチモードで実行
npx sv check --watch

# 警告をエラーとして扱う
npx sv check --fail-on-warnings
```

### オプション

`sv check` の動作を制御するためのオプションです。

| オプション                | 説明                                                                            |
| ------------------------- | ------------------------------------------------------------------------------- |
| `--workspace <path>`      | ワークスペースパスを指定                                                        |
| `--output <format>`       | 出力形式（`human` / `human-verbose` / `machine` / `machine-verbose`）           |
| `--watch`                 | ファイル変更を監視                                                              |
| `--preserveWatchOutput`   | watch モードで画面クリアを抑制                                                  |
| `--tsconfig <path>`       | tsconfig ファイルを指定（指定すると files/include/exclude に従う）              |
| `--no-tsconfig`           | tsconfig を使わず Svelte ファイルのみチェック（`.js`/`.ts` は type-check しない）|
| `--fail-on-warnings`      | 警告をエラーとして扱う                                                          |
| `--threshold <level>`     | 表示閾値（`warning` 既定 / `error` のみ）                                       |
| `--ignore <paths>`        | 無視するパスを指定（**`--no-tsconfig` 併用時のみ診断対象に効く**。それ以外はウォッチ対象のみ） |
| `--compiler-warnings <pairs>` | 警告コードごとに `ignore` / `error` を指定                                  |
| `--diagnostic-sources <src>` | 診断ソースの限定（`js` / `svelte` / `css`、複数はカンマ区切り）              |

### CI/CD での使用

CI/CD パイプラインでは、すべての警告をエラーとして扱い、マシンリーダブルな出力形式を使用することで、ビルドの成否を明確に判定できます。

```bash
# CI パイプラインでの使用例
npx sv check --fail-on-warnings --output machine
```

### 特定の警告を無視

プロジェクトの方針によっては、特定の警告を無視したい場合があります。`--compiler-warnings` オプションで、警告タイプごとに `ignore`（無視）または `error`（エラー扱い）を指定できます。

```bash
# 未使用 CSS とアクセシビリティ警告を調整
npx sv check --compiler-warnings "css_unused_selector:ignore,a11y_missing_attribute:error"
```

### 診断ソースの指定

チェック対象を JavaScript と Svelte のみに限定することで、特定の種類のエラーに集中できます。

```bash
# JavaScript と Svelte のみチェック
npx sv check --diagnostic-sources "js,svelte"
```

### マシンリーダブル出力

CI/CD ツールやスクリプトで解析しやすいフォーマットで出力します。タイムスタンプ、ファイルパス、行番号、エラーメッセージが構造化された形式で出力されます。

```bash
# CI/CD パイプライン向け
npx sv check --output machine
```

出力例:

```
1590680325583 START "/home/user/my-project"
1590680326283 ERROR "src/App.svelte" 1:16 "Cannot find module 'missing'"
1590680326807 COMPLETED 20 FILES 1 ERRORS 0 WARNINGS 1 FILES_WITH_PROBLEMS
```

`COMPLETED` 行のフィールド: `FILES`（チェック総数）、`ERRORS`、`WARNINGS`、`FILES_WITH_PROBLEMS`（問題のあったファイル数）。CI で集計するときの参考に。

## sv migrate

Svelte/SvelteKit のコードベースをマイグレーションします。フレームワークのメジャーバージョンアップ時に、コードの自動変換とパッケージの更新を行います。

### 基本的な使い方

引数なしで実行すると、利用可能なマイグレーションの一覧から選択できます。特定のマイグレーションを直接指定することも可能です。

```bash
# インタラクティブモードで選択
npx sv migrate

# 特定のマイグレーションを実行
npx sv migrate svelte-5
```

### 利用可能なマイグレーション

現在サポートされているマイグレーションの一覧です。各マイグレーションは、対象バージョン間の破壊的変更を自動的に処理します。

| マイグレーション    | 説明                                         |
| ------------------- | -------------------------------------------- |
| `svelte-5`          | Svelte 4 → Svelte 5 へのアップグレード       |
| `svelte-4`          | Svelte 3 → Svelte 4 へのアップグレード       |
| `sveltekit-2`       | SvelteKit 1 → SvelteKit 2 へのアップグレード |
| `app-state`         | `$app/stores` → `$app/state` への移行        |
| `self-closing-tags` | 自己終了タグの修正                           |
| `package`           | `@sveltejs/package` v1 → v2                  |
| `routes`            | ファイルシステムルーティングの更新           |

### Svelte 5 へのマイグレーション

Svelte 4 から Svelte 5 への移行は、最も大きな変更を伴うマイグレーションです。Runes システムの導入により、リアクティビティの記述方法が大幅に変わります。

```bash
npx sv migrate svelte-5
```

このマイグレーションは以下を行います。

- Svelte パッケージのアップグレード
- コンポーネントを Runes 構文に変換
- イベントハンドラを新しい構文に更新
- `$:` を `$derived` / `$effect` に変換

### SvelteKit 2 へのマイグレーション

SvelteKit 1 から SvelteKit 2 への移行を行います。ルーティングの変更、API の更新、新しいコンベンションへの適応が自動的に処理されます。

```bash
npx sv migrate sveltekit-2
```

### $app/state への移行

```bash
npx sv migrate app-state
```

`$app/stores` の使用を `$app/state` に移行します（SvelteKit 2.12 以降）。

### マイグレーション後の確認

マイグレーション後は `@migration` コメントを検索して、手動で対応が必要な箇所を確認します。

```bash
# マイグレーションタスクを検索
grep -r "@migration" src/
```

## 実践的なワークフロー

ここでは、`sv` コマンドを使用した一般的な開発ワークフローを紹介します。

### 新規プロジェクトの開始

TypeScript とよく使用されるツールを含む新規プロジェクトを作成する一連の流れです。

```bash
# 1. プロジェクトを作成
npx sv create my-app --types ts

# 2. ディレクトリに移動
cd my-app

# 3. 開発ツールを追加
npx sv add eslint prettier

# 4. テスト環境を追加
npx sv add vitest playwright

# 5. スタイリングを追加
npx sv add tailwindcss

# 6. 開発サーバーを起動
npm run dev
```

### 本番環境向けのチェック

デプロイ前に実行するべきチェックの一連の流れです。すべてのチェックをパスすることで、本番環境での問題を未然に防げます。

```bash
# 型チェックとLint
npx sv check --fail-on-warnings

# テストの実行
npm run test

# ビルド
npm run build
```

### レガシープロジェクトの更新

古いバージョンの Svelte/SvelteKit プロジェクトを最新版に更新する手順です。マイグレーション後は、自動変換できなかった箇所を手動で修正する必要があります。

```bash
# 1. 現在の状態をチェック
npx sv check

# 2. Svelte 5 にマイグレーション
npx sv migrate svelte-5

# 3. マイグレーション後のチェック
npx sv check

# 4. @migration タスクを確認
grep -r "@migration" src/

# 5. 手動で修正が必要な箇所を対応
```

## package.json スクリプトの設定

プロジェクトで頻繁に使用するコマンドは、`package.json` の `scripts` に登録しておくと便利です。以下は、一般的な SvelteKit プロジェクトでのスクリプト設定例です。

```json
{
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "preview": "vite preview",
    "check": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json",
    "check:watch": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json --watch",
    "lint": "prettier --check . && eslint .",
    "format": "prettier --write .",
    "test": "vitest",
    "prepare": "svelte-kit sync"
  }
}
```

:::tip[`"prepare": "svelte-kit sync"` を必ず入れる]
`prepare` は npm のライフサイクルスクリプトで、`npm install` 完了時に自動実行されます。SvelteKit の自動生成型（`./$types`、`$app/*` の ambient 型など）を最新化するため、`"prepare": "svelte-kit sync"` を含めておくと CI やクリーンインストール後の型エラーを防げます。`sv create` の生成物にも標準で含まれています。
:::

## トラブルシューティング

`sv` コマンドの使用中に発生する一般的な問題と解決策を紹介します。

### sv check が遅い場合

大規模なプロジェクトでは、不要なディレクトリを除外することでチェック時間を短縮できます。

```bash
# Svelte ファイルだけチェック（tsconfig を使わない）+ 不要ディレクトリを除外
npx sv check --no-tsconfig --ignore "dist,build,.svelte-kit"
```

:::info[`--ignore` の挙動]
`--ignore` は **`--no-tsconfig` と組み合わせたときだけ「診断対象」から除外**できます。`--tsconfig` 指定時（または既定）は「ウォッチ対象」にしか効きません。チェックされるファイル群は `tsconfig.json` の `files`/`include`/`exclude` で決まります。
:::

:::tip[`node_modules` は既定で除外]
`node_modules` は SvelteKit / svelte-check が **既定でチェック対象から除外** するため、`--ignore` に明示する必要はありません。
:::

### 特定のファイルのみチェックしたい場合

<Admonition type="warning" title="全体チェックが必要">

`sv check` はプロジェクト全体を見る必要があります。
変更されたファイルのみをチェックすると、他のファイルでの参照エラーを見逃す可能性があります。

</Admonition>

### マイグレーションが失敗する場合

1. Git でクリーンな状態にする
2. `node_modules` を削除して再インストール
3. 手動で段階的にマイグレーションを進める

## まとめ

`sv` CLI ツールを使用することで、以下のことが実現できます。

- **プロジェクト作成**: 最適な構成で新規プロジェクトを開始
- **機能追加**: 必要なツールやライブラリを簡単に統合
- **品質管理**: コードの問題を自動検出
- **バージョン移行**: 安全にフレームワークをアップグレード

これらのコマンドを活用して、効率的な Svelte/SvelteKit 開発を行いましょう。

## 次のステップ

- [環境構築](/introduction/setup/) - プロジェクト構築の詳細
- [TypeScript 設定](/introduction/typescript-setup/) - TypeScript の最適化
- [プロジェクト構造](/sveltekit/basics/project-structure/) - SvelteKit のファイル構成
