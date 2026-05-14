---
title: ESLint と Prettier 設定 - Svelte 5 対応
description: Svelte 5 / SvelteKit 2.x プロジェクトにおける ESLint と Prettier の導入方法を TypeScript 前提で解説。sv add による最速セットアップから手動構成、VS Code 統合、よくあるトラブルシューティングまで網羅。
---

<script>
  import Admonition from '$lib/components/Admonition.svelte';
  import Mermaid from '$lib/components/Mermaid.svelte';
  import { base } from '$app/paths';

  const toolRoleDiagram = `flowchart LR
    subgraph tools["開発ツールの役割分担"]
        direction LR
        Prettier["Prettier<br/>コードの見た目を揃える"]
        ESLint["ESLint<br/>バグや悪いパターンを検出"]
        SvelteCheck["svelte-check<br/>TypeScript と Svelte の型検証"]
    end

    Source[ソースコード] --> Prettier
    Prettier --> Formatted[整形済みコード]
    Formatted --> ESLint
    ESLint --> Analyzed[問題を検出したコード]
    Source --> SvelteCheck
    SvelteCheck --> Typed[型安全なコード]

    style Prettier fill:#f7b93e,stroke:#333,color:#000
    style ESLint fill:#4b32c3,stroke:#4b32c3,color:#fff
    style SvelteCheck fill:#ff3e00,stroke:#ff3e00,color:#fff`;

  const flowDiagram = `sequenceDiagram
    participant Dev as 開発者
    participant Editor as エディタ<br/>（VS Code / Cursor）
    participant Prettier as Prettier
    participant ESLint as ESLint
    participant Git as Git commit

    Dev->>Editor: コードを書く
    Editor->>Prettier: 保存時にフォーマット
    Prettier-->>Editor: 整形済みコード
    Editor->>ESLint: 保存時にリント
    ESLint-->>Editor: 警告・エラー表示
    Dev->>Git: git commit
    Git->>Prettier: pre-commit でチェック
    Git->>ESLint: pre-commit でチェック
    alt 問題あり
        ESLint-->>Git: commit 拒否
    else 問題なし
        Git-->>Dev: commit 成功
    end`;
</script>

Svelte 5 / SvelteKit 2.x プロジェクトで **コード品質を保つための二本柱** が、ESLint と Prettier です。どちらも JavaScript エコシステムの標準ツールですが、Svelte では `.svelte` ファイル（単一ファイルコンポーネント）の扱いが特殊なため、専用プラグインと正しい設定が必要になります。

この記事では、まず `sv add` による最短セットアップを紹介し、次にその内側で何が起きているかを理解できるよう手動セットアップも解説します。VS Code / Cursor でのエディタ統合と、よくあるトラブルシューティングまでカバーします。

## この記事で学べること

- ESLint と Prettier のそれぞれの役割と、Svelte プロジェクトでの必要性
- `sv add` による最速セットアップ
- flat config 形式での手動セットアップ（Svelte 5 + TypeScript 対応）
- VS Code / Cursor でのエディタ統合
- Prettier と ESLint の衝突回避
- よくある問題とその解決策

## なぜ ESLint と Prettier が必要か

「SvelteKit には `svelte-check` が標準で付いているのに、さらに ESLint も必要なのか？」という疑問は、Svelte コミュニティでもしばしば議論されます。結論から言えば、**三者は役割が異なるため、併用するのが実務での定番** です。

<Mermaid diagram={toolRoleDiagram} />

| ツール | 役割 | 実行タイミング |
|---|---|---|
| **Prettier** | コードの見た目（インデント・改行・引用符等）を機械的に統一 | 保存時・コミット時 |
| **ESLint** | バグの温床や悪いパターン（未使用変数、`==` の使用、Svelte の非推奨構文等）を検出 | 保存時・CI |
| **svelte-check** | TypeScript の型エラーと Svelte コンパイラ警告を検出 | CI・明示実行時 |

`svelte-check` は「コンパイルが通るか」を見るツールで、`eslint` は「コードの質が高いか」を見るツールです。たとえば未使用の import、`any` の多用、`a11y` 違反（`<img>` の alt 属性忘れ等）、`$state` と `let` の混在は `svelte-check` では検出されませんが、ESLint は検出できます。

<Admonition type="tip" title="小規模プロジェクトなら svelte-check だけでも良い">

個人の学習用プロジェクトや 1 ファイルで完結するデモなら、`svelte-check` だけでも実害は少ないです。しかし **チーム開発、外部公開するライブラリ、業務プロジェクト** では、ESLint + Prettier の導入は事実上必須と考えてください。チームの誰かが `$state` を忘れて `let` で書いたとき、Prettier と ESLint の両輪がなければ気付けません。

</Admonition>

### 典型的なワークフロー

エディタ保存時・コミット時に、それぞれのツールが自動的に走るのが理想形です。

<Mermaid diagram={flowDiagram} />

## sv add による最速セットアップ

SvelteKit 公式 CLI の `sv add` を使えば、ESLint と Prettier は 1 コマンドで導入できます。新規プロジェクトの場合、`sv create` 時にすでに組み込み済みのことも多いですが、後から追加する場合も以下で完結します。

```bash
# ESLint を追加
npx sv add eslint

# Prettier を追加
npx sv add prettier

# 両方まとめて追加することも可能
npx sv add eslint prettier
```

これだけで以下のファイルが自動生成・追記されます。

- `eslint.config.js` — ESLint の flat config（Svelte + TypeScript 対応済み）
- `.prettierrc` — Prettier の設定
- `.prettierignore` — Prettier の除外パターン
- `package.json` の `scripts` に `lint`、`format` が追加
- `package.json` の `devDependencies` に必要なパッケージが追加

<Admonition type="info" title="sv add の詳細">

`sv add` コマンドの全体像は [CLI tools](/introduction/cli/) で解説しています。ESLint / Prettier の他にも `vitest`、`tailwindcss`、`playwright`、`drizzle` など多数のアドオンを追加できます。

</Admonition>

### 生成される package.json の scripts

`sv add` 実行後、`package.json` には以下のようなスクリプトが追加されます。

```json
{
  "scripts": {
    "lint": "prettier --check . && eslint .",
    "format": "prettier --write ."
  }
}
```

開発中は以下のコマンドで実行します。

```bash
# フォーマット（自動整形）
pnpm format

# リント（チェックのみ、修正なし）
pnpm lint
```

## 手動セットアップ（理解を深めたい人向け）

`sv add` の中で何が行われているかを理解しておくと、カスタマイズ時やトラブル時に困りません。ここでは flat config 形式（ESLint 9.x 以降の標準）で、Svelte 5 + TypeScript プロジェクト向けに最小構成を組み立てます。

### 依存パッケージのインストール

```bash
pnpm add -D eslint \
  eslint-plugin-svelte \
  svelte-eslint-parser \
  typescript-eslint \
  globals \
  prettier \
  prettier-plugin-svelte \
  eslint-config-prettier
```

各パッケージの役割は以下の通りです。

| パッケージ | 役割 |
|---|---|
| `eslint` | ESLint 本体 |
| `eslint-plugin-svelte` | Svelte 固有のルール（非推奨構文検出、a11y 等） |
| `svelte-eslint-parser` | `.svelte` ファイルをパースするためのパーサ |
| `typescript-eslint` | TypeScript 用のパーサ・ルールセット |
| `globals` | ブラウザ・Node のグローバル変数定義 |
| `prettier` | Prettier 本体 |
| `prettier-plugin-svelte` | Prettier で `.svelte` ファイルを整形するプラグイン |
| `eslint-config-prettier` | ESLint と Prettier のルール衝突を無効化 |

### eslint.config.js

プロジェクトルートに `eslint.config.js` を作成します。flat config は ESLint 9.x 以降の標準形式で、モジュール形式で設定を書く方式です。

```javascript
// eslint.config.js
import js from '@eslint/js';
import ts from 'typescript-eslint';
import svelte from 'eslint-plugin-svelte';
import prettier from 'eslint-config-prettier';
import globals from 'globals';
import svelteConfig from './svelte.config.js';

export default ts.config(
  // JavaScript 標準ルール
  js.configs.recommended,

  // TypeScript 推奨ルール
  ...ts.configs.recommended,

  // Svelte 推奨ルール
  ...svelte.configs.recommended,

  // Prettier と競合するルールを無効化（必ず最後に置く）
  prettier,
  ...svelte.configs.prettier,

  // グローバル変数の宣言
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      }
    }
  },

  // .svelte / .svelte.ts / .svelte.js 固有のパーサ設定
  {
    files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        extraFileExtensions: ['.svelte'],
        parser: ts.parser,
        svelteConfig
      }
    }
  },

  // 除外パターン
  {
    ignores: ['build/', '.svelte-kit/', 'dist/', 'node_modules/']
  }
);
```

<Admonition type="caution" title="svelteConfig を parserOptions に渡すのが必須">

Svelte 5 では `parserOptions.svelteConfig` に `svelte.config.js` の内容を渡すことで、Runes（`$state`、`$derived` 等）を正しく認識します。これを忘れると `.svelte.ts` ファイル内の Runes が「未定義シンボル」として誤検出されます。

</Admonition>

### .prettierrc

Prettier の設定はプロジェクトルートに `.prettierrc`（JSON 形式）または `.prettierrc.js` として置きます。

```json
{
  "useTabs": true,
  "singleQuote": true,
  "trailingComma": "none",
  "printWidth": 100,
  "plugins": ["prettier-plugin-svelte"],
  "overrides": [
    {
      "files": "*.svelte",
      "options": {
        "parser": "svelte"
      }
    }
  ]
}
```

<Admonition type="tip" title="Svelte 本体のリポジトリと同じスタイル">

上記の設定は Svelte / SvelteKit 公式リポジトリで使われているスタイルに揃えています。「useTabs: true」や「singleQuote: true」は好みで変えても問題ありませんが、チームや OSS 貢献を考えるならこの形が最も馴染みやすいでしょう。

</Admonition>

<Admonition type="note" title="スペース派なら useTabs: false / tabWidth: 2 を選ぶ">

タブ文字ではなく **スペース 2 文字** でインデントを揃えたい場合は、以下のように書き換えます。Angular / Vue / React など他のフロントエンドエコシステムから来た人にはこちらの方が馴染みがあり、GitHub 上での差分も他のリポジトリと揃いやすくなります。

```json
{
  "useTabs": false,
  "tabWidth": 2,
  "singleQuote": true,
  "trailingComma": "none",
  "printWidth": 100,
  "plugins": ["prettier-plugin-svelte"],
  "overrides": [
    {
      "files": "*.svelte",
      "options": {
        "parser": "svelte"
      }
    }
  ]
}
```

`useTabs` と `tabWidth` はチームのスタイルガイドや既存コードベースに合わせて選んでください。一度決めたら途中で切り替えると差分ノイズが大きくなるため、プロジェクト開始時に決定しておくのが理想です。

</Admonition>

### .prettierignore

Prettier が触らないファイルを指定します。

```
# 自動生成ファイル
.svelte-kit/
build/
dist/
node_modules/
pnpm-lock.yaml
package-lock.json
yarn.lock

# ビルド成果物
*.min.js
*.min.css
```

### package.json の scripts 追加

```json
{
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "preview": "vite preview",
    "check": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json",
    "check:watch": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json --watch",
    "format": "prettier --write .",
    "lint": "prettier --check . && eslint ."
  }
}
```

## VS Code / Cursor での統合設定

エディタで保存時に自動フォーマット・リントが走るようにすると、開発体験が大きく向上します。

### 推奨拡張機能

プロジェクトルートに `.vscode/extensions.json` を作成し、推奨拡張機能を宣言します。

```json
{
  "recommendations": [
    "svelte.svelte-vscode",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode"
  ]
}
```

Cursor の場合、VS Code 用の拡張機能がそのまま使えます。

### ワークスペース設定

`.vscode/settings.json` に以下を記述することで、保存時の自動フォーマットと ESLint による自動修正を有効にできます。

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "[svelte]": {
    "editor.defaultFormatter": "svelte.svelte-vscode"
  },
  "eslint.validate": [
    "javascript",
    "typescript",
    "svelte"
  ],
  "svelte.enable-ts-plugin": true
}
```

<Admonition type="info" title="svelte ファイルは Svelte for VS Code が整形">

Prettier が .svelte を整形する場合と、Svelte for VS Code 拡張機能が整形する場合の 2 通りがありますが、後者を使うのが最も安定します。内部的には `prettier-plugin-svelte` を呼び出しているため、Prettier 設定 (`.prettierrc`) の内容がそのまま反映されます。

</Admonition>

## Prettier と ESLint の衝突回避

Prettier と ESLint はどちらも「コードの見た目」に関するルールを持つため、素朴に併用すると衝突します。たとえば ESLint の `indent` ルールと Prettier のインデント設定が違うと、片方を通すともう片方で怒られる無限ループになります。

これを防ぐのが `eslint-config-prettier` です。これは **Prettier と競合する ESLint ルールを全て無効化する** だけの設定で、`eslint.config.js` の **最後** に読み込むのが鉄則です。

```javascript
// eslint.config.js の抜粋（抜粋・再掲）
export default ts.config(
  js.configs.recommended,
  ...ts.configs.recommended,
  ...svelte.configs.recommended,

  // ↓ 必ず最後に置く（上のルールを上書きする形で Prettier と競合する分を無効化）
  prettier,
  ...svelte.configs.prettier,
);
```

<Admonition type="caution" title="順序を間違えると効かない">

`prettier` 設定は **必ず `js.configs.recommended` や `svelte.configs.recommended` より後** に配置してください。ESLint の flat config は「後勝ち」なので、順序を間違えると衝突ルールが消えません。

</Admonition>

## pre-commit フックでの自動化（オプション）

チーム開発では、コミット前にリントとフォーマットを強制する仕組みを入れるのが一般的です。`husky` + `lint-staged` の組み合わせが最も普及しています。

```bash
pnpm add -D husky lint-staged
npx husky init
```

`.husky/pre-commit` を以下の内容に編集します。

```bash
pnpm exec lint-staged
```

`package.json` に以下を追加します。

```json
{
  "lint-staged": {
    "*.{js,ts,svelte}": [
      "prettier --write",
      "eslint --fix"
    ],
    "*.{md,json,yml,yaml}": [
      "prettier --write"
    ]
  }
}
```

これで `git commit` 時に、ステージングされたファイルだけを対象に自動整形＋リントが走り、エラーがあればコミットが中断されます。

## よくある問題とトラブルシューティング

### .svelte.ts ファイル内の Runes が未定義扱いされる

ESLint を実行すると `'$state' is not defined` のようなエラーが出る場合は、`parserOptions.svelteConfig` の設定漏れが原因です。

```javascript
// NG: svelteConfig を渡していない
{
  files: ['**/*.svelte', '**/*.svelte.ts'],
  languageOptions: {
    parserOptions: {
      parser: ts.parser
    }
  }
}

// OK
import svelteConfig from './svelte.config.js';
// ...
{
  files: ['**/*.svelte', '**/*.svelte.ts'],
  languageOptions: {
    parserOptions: {
      parser: ts.parser,
      svelteConfig  // ← これが必要
    }
  }
}
```

### Prettier が .svelte を整形してくれない

`prettier-plugin-svelte` がインストールされていない、または `.prettierrc` の `plugins` に指定されていない可能性があります。

```bash
# インストール確認
pnpm list prettier-plugin-svelte

# .prettierrc で明示的に読み込む
```

```json
{
  "plugins": ["prettier-plugin-svelte"]
}
```

### ESLint と Prettier が毎回衝突する

前述のとおり、`eslint-config-prettier` を `eslint.config.js` の **最後** に置いているか確認してください。

### 実行が遅い

TypeScript のプロジェクトリファレンスを使うプロジェクトでは、ESLint の実行が非常に遅くなることがあります。その場合は以下を検討してください。

- `parserOptions.projectService: true` を `project: './tsconfig.json'` に変更し、必要最小限の tsconfig だけ参照する
- `.eslintignore`（flat config では `ignores` プロパティ）で不要なディレクトリを除外
- CI では `eslint --cache` を使う

```javascript
// eslint.config.js に .eslintcache を無視
{
  ignores: ['build/', '.svelte-kit/', 'dist/', 'node_modules/', '.eslintcache']
}
```

## 2026 年 4 月時点の安定性

`eslint-plugin-svelte` は 2026 年 4 月時点で **v3.17.x** 系が安定版です。Svelte 5 の Runes（`$state`、`$derived`、`$effect`、`$props`、`{#snippet}`、`{@render}` 等）は全て正式サポート済みで、`$state.eager` のような新しいルーンも追随しています。

<Admonition type="info" title="バージョン固定を推奨">

`eslint-plugin-svelte` はリリース頻度が高い（週〜隔週）ので、業務プロジェクトでは `package.json` でバージョン固定を推奨します。

</Admonition>

```json
{
  "devDependencies": {
    "eslint-plugin-svelte": "3.17.0"
  }
}
```

## まとめ

Svelte 5 / SvelteKit 2.x プロジェクトでは、ESLint と Prettier の併用が事実上の標準です。`sv add` で最短導入し、flat config の仕組みを理解しておけば、後からのカスタマイズにも困りません。

- **Prettier**: 見た目を統一
- **ESLint**: バグや悪いパターンを検出
- **svelte-check**: 型検証
- **svelteConfig を parserOptions に渡す** ことで Runes を正しく認識
- **eslint-config-prettier は必ず最後** に読み込む
- **VS Code 統合** で保存時自動整形＋自動修正

## 次のステップ

- [AI コーディング支援のセットアップ](/introduction/ai-coding-setup/) — Copilot / Cursor が古い Svelte 4 構文を提案するのを防ぐ多層防御。ESLint と組み合わせて Svelte 5 純度を保つ
- [AI と組み合わせた高度な統合: Svelte MCP × ESLint × typescript-eslint]({base}/svelte-mcp/eslint-integration/) — Claude Code や Cursor と ESLint を連携させる実践ガイド
- [CLI tools](/introduction/cli/) — `sv add` の他のアドオン（vitest、tailwindcss 等）
- [TypeScript 設定](/introduction/typescript-setup/) — `tsconfig.json` の strict モード
