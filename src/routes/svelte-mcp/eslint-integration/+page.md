---
title: Svelte MCP × ESLint × typescript-eslint 連携ガイド
description: Svelte 5 / SvelteKit 2.x における Svelte MCP、eslint-plugin-svelte、typescript-eslint の三点セット連携。役割分担、フル構成のflat config、2026年時点の安定性、CI/CD統合、トラブルシューティングを TypeScript 前提で解説。
---

<script>
  import Admonition from '$lib/components/Admonition.svelte';
  import Mermaid from '$lib/components/Mermaid.svelte';
  import { base } from '$app/paths';

  const roleDiagram = `flowchart TB
    subgraph ai["AI との対話時"]
        direction TB
        MCP[Svelte MCP]
        AutoFixer["svelte-autofixer<br/>Svelte 5 最新構文保証"]
        Docs["get-documentation<br/>公式仕様参照"]
        MCP --> AutoFixer
        MCP --> Docs
    end

    subgraph static["保存時・CI 時"]
        direction TB
        ESLintPlugin["eslint-plugin-svelte<br/>Svelte 固有ルール"]
        TSESLint["typescript-eslint<br/>TypeScript 固有ルール"]
        Parser["svelte-eslint-parser<br/>共通パーサ"]
        Parser --> ESLintPlugin
        Parser --> TSESLint
    end

    Code[ソースコード] --> ai
    Code --> static
    ai --> Output[品質保証されたコード]
    static --> Output

    style MCP fill:#ff3e00,stroke:#ff3e00,color:#fff
    style AutoFixer fill:#ff3e00,stroke:#ff3e00,color:#fff
    style Docs fill:#ff3e00,stroke:#ff3e00,color:#fff
    style ESLintPlugin fill:#4b32c3,stroke:#4b32c3,color:#fff
    style TSESLint fill:#3178c6,stroke:#3178c6,color:#fff
    style Parser fill:#4b32c3,stroke:#4b32c3,color:#fff`;

  const overlapDiagram = `flowchart LR
    subgraph Overlap["重複領域（ESLint / MCP 両方が検出）"]
        Legacy["\\$: 反応的宣言"]
        Slot["&lt;slot /&gt; 構文"]
        ExportLet["export let プロパティ"]
        OnEvent["on:click 構文"]
    end

    subgraph ESLintOnly["ESLint のみ検出"]
        Unused[未使用変数]
        NoAny[any の使用]
        A11y[a11y 違反]
        Complexity[認知的複雑度]
        ImportOrder[import 順序]
    end

    subgraph MCPOnly["MCP のみ検出"]
        NewRunes["新ルーン対応<br/>（\\$state.eager 等）"]
        OfficialDoc[公式ドキュメント準拠]
        AIContext[AI 生成時の意図]
        Migration[Svelte 4 → 5 移行支援]
    end

    style ESLintOnly fill:#e3f2fd,stroke:#4b32c3
    style MCPOnly fill:#fff3e0,stroke:#ff3e00
    style Overlap fill:#f3e5f5,stroke:#8e24aa`;

  const ciDiagram = `sequenceDiagram
    participant Dev as 開発者
    participant Editor as エディタ<br/>（VS Code / Cursor）
    participant MCP as Svelte MCP
    participant Git as Git Push
    participant CI as GitHub Actions
    participant ESLint as ESLint

    Note over Dev,MCP: 開発フェーズ
    Dev->>MCP: AI にコード生成依頼
    MCP->>MCP: svelte-autofixer で検証
    MCP-->>Dev: Svelte 5 準拠のコード
    Dev->>Editor: コードを編集
    Editor->>ESLint: 保存時にリント
    ESLint-->>Editor: 問題を表示

    Note over Dev,CI: 統合フェーズ
    Dev->>Git: git push
    Git->>CI: ワークフロー起動
    CI->>ESLint: eslint .
    CI->>CI: svelte-check
    alt いずれかで失敗
        CI-->>Dev: PR ブロック
    else 全て成功
        CI-->>Dev: マージ可能
    end`;
</script>

AI 時代の Svelte 5 開発では、**Svelte MCP**、**eslint-plugin-svelte**、**typescript-eslint** の三点セットで品質保証を構築するのが 2026 年時点のベストプラクティスです。それぞれ異なる層で動作し、重複することなく互いを補完します。

この記事では、三者の役割分担、具体的なフル構成 `eslint.config.js`、Claude Code や Cursor との統合方法、CI/CD 連携、よくあるトラブルシューティングを解説します。

<Admonition type="info" title="前提記事">

この記事は ESLint と Prettier の基本的なセットアップを知っている前提で書かれています。未読の場合は先に [ESLint + Prettier 設定](/introduction/eslint-prettier/) を読んでください。

</Admonition>

## この記事で学べること

- Svelte MCP、eslint-plugin-svelte、typescript-eslint の役割分担
- 2026 年 4 月時点の安定性と実用判断
- フル構成の `eslint.config.js`（業務プロジェクト向け）
- Claude Code / Cursor / AGENTS.md との統合
- CI/CD での活用と pre-commit フック
- トラブルシューティング

## 三点セットの役割分担

三つのツールはそれぞれ異なる層で動作します。一言でまとめると：

- **Svelte MCP** は「**AI がコードを書く** 時」の品質保証
- **eslint-plugin-svelte** は「**人間が保存・push する** 時」の静的解析
- **typescript-eslint** は「**TypeScript 固有の問題**」の検出

<Mermaid diagram={roleDiagram} />

### 詳細な役割比較

| 項目 | Svelte MCP | eslint-plugin-svelte | typescript-eslint |
|---|---|---|---|
| 主目的 | AI 生成コードの Svelte 5 準拠保証 | Svelte 構文の静的解析 | TypeScript 構文の静的解析 |
| 実行タイミング | AI との対話時 | 保存時・CI | 保存時・CI |
| 代表的な機能 | `svelte-autofixer`、`get-documentation` | 非推奨構文検出、a11y | 型情報ベースのルール |
| 内部で使うパーサ | `svelte-eslint-parser` | `svelte-eslint-parser` | `@typescript-eslint/parser` |
| 動作する場所 | AI エージェント（Claude Code、Cursor） | エディタ、CI | エディタ、CI |

### 検出能力の重複とユニーク領域

同じコード問題でも、複数のツールが検出できる領域と、片方しか検出できない領域があります。これを理解しておくと「どこまでを何に任せるか」の設計判断ができます。

<Mermaid diagram={overlapDiagram} />

**重複領域**: `$:` 反応的宣言、`<slot />` 構文、`export let` プロパティ、`on:click` など Svelte 4 のレガシー構文は、ESLint と MCP 両方で検出できます。この領域は「二重の安全網」として機能します。

**ESLint のみ検出**: 未使用変数、`any` の使用、a11y 違反、認知的複雑度、import 順序、命名規則など、汎用的な品質問題は ESLint の独壇場です。

**MCP のみ検出**: `$state.eager` のような最新ルーン、公式ドキュメントとの整合性、AI 生成時のコンテキスト保持、Svelte 4 → 5 移行支援は MCP が強みを発揮する領域です。

<Admonition type="tip" title="重複は問題ではなく冗長性">

「同じ問題を二つのツールで検出するのは非効率では？」と思うかもしれません。しかし実務では、人間が保存時に気づけなかった問題を CI で拾う、AI が書いたコードを ESLint が再検証するなど、**冗長性こそが品質保証の本質** です。片方のツールの誤検知・見落としをもう片方がカバーします。

</Admonition>

## 2026 年 4 月時点の安定性評価

三点セットそれぞれの安定性を整理します。

| ツール | バージョン | 安定性 | 評価 |
|---|---|---|---|
| `eslint-plugin-svelte` | 3.17.x | ★★★★★ | Svelte 5 Runes 全対応。実務利用可 |
| `svelte-eslint-parser` | 1.6.x | ★★★★★ | `$state.eager` 含む最新ルーン対応 |
| `typescript-eslint` | 8.x | ★★★★★ | ESLint 9 flat config 完全対応 |
| Svelte MCP | — | ★★★★☆ | 公式提供、日々機能追加中 |

<Admonition type="info" title="どこまで実務投入できるか">

2026 年 4 月時点で、三点セットいずれも **業務プロジェクトへの投入に耐える安定性** に達しています。ただし `eslint-plugin-svelte` は patch リリース頻度が高いため、バージョン固定運用を推奨します（後述）。

</Admonition>

## フル構成の eslint.config.js

業務プロジェクト向けのフル構成を示します。基本の [ESLint + Prettier 設定](/introduction/eslint-prettier/) に、typescript-eslint の型情報ベースルールと Svelte MCP との整合性設定を加えたものです。

```javascript
// eslint.config.js
import js from '@eslint/js';
import ts from 'typescript-eslint';
import svelte from 'eslint-plugin-svelte';
import prettier from 'eslint-config-prettier';
import globals from 'globals';
import svelteConfig from './svelte.config.js';

export default ts.config(
  // 1. JavaScript 標準ルール
  js.configs.recommended,

  // 2. TypeScript の型情報ベース推奨ルール（strictRecommended）
  ...ts.configs.strictTypeChecked,
  ...ts.configs.stylisticTypeChecked,

  // 3. Svelte 推奨ルール
  ...svelte.configs.recommended,

  // 4. Prettier 衝突回避（必ず最後）
  prettier,
  ...svelte.configs.prettier,

  // 5. グローバル変数の宣言
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname
      }
    }
  },

  // 6. .svelte / .svelte.ts / .svelte.js 固有設定
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

  // 7. プロジェクト固有ルールのカスタマイズ
  {
    rules: {
      // TypeScript
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'separate-type-imports' }
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
      ],

      // Svelte 5 Runes 関連
      'svelte/no-at-html-tags': 'error',
      'svelte/valid-compile': 'error',
      'svelte/no-reactive-literals': 'error',
      'svelte/prefer-style-directive': 'warn',

      // Svelte a11y
      'svelte/a11y-missing-attribute': 'error',
      'svelte/a11y-no-redundant-roles': 'error'
    }
  },

  // 8. 除外パターン
  {
    ignores: [
      'build/',
      '.svelte-kit/',
      'dist/',
      'node_modules/',
      '.eslintcache',
      'pnpm-lock.yaml'
    ]
  }
);
```

### 重要な設定ポイント

#### projectService: true と tsconfigRootDir

`projectService: true` は typescript-eslint v8 以降の推奨方式で、プロジェクト全体の TypeScript 設定を自動検出します。これにより型情報ベースのルール（`strictTypeChecked`）が高速かつ正確に動作します。

`tsconfigRootDir: import.meta.dirname` は、モノレポや複雑な構造のプロジェクトで tsconfig の基点を明示するための設定です。

#### parserOptions.svelteConfig が必須

`.svelte` および `.svelte.ts` / `.svelte.js` ファイルでは、必ず `parserOptions.svelteConfig` を指定してください。これがないと Runes が未定義シンボル扱いされます。

```javascript
// NG
{
  files: ['**/*.svelte'],
  languageOptions: {
    parserOptions: { parser: ts.parser }
  }
}

// OK
import svelteConfig from './svelte.config.js';
// ...
{
  files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
  languageOptions: {
    parserOptions: {
      parser: ts.parser,
      svelteConfig  // ← これ
    }
  }
}
```

#### strictTypeChecked と stylisticTypeChecked の採用

typescript-eslint には複数のプリセットがあります。業務利用では以下の組み合わせが推奨されます。

| プリセット | 内容 | 推奨度 |
|---|---|---|
| `recommended` | 最低限のルール | 学習用 |
| `recommendedTypeChecked` | 型情報ベースの基本ルール | 小規模プロジェクト |
| `strict` | 厳格なルール（型情報なし） | 中規模 |
| `strictTypeChecked` | 厳格なルール（型情報あり） | **業務推奨** |
| `stylisticTypeChecked` | スタイル系ルール | 併用推奨 |

### svelte-autofixer と ESLint の役割切り分けルール

プロジェクト固有ルールの設定では、MCP と ESLint の重複を意識的に設計します。

```javascript
{
  rules: {
    // MCP が得意な領域（Svelte 5 固有）は warn に留めて、MCP での修正を推奨
    'svelte/prefer-style-directive': 'warn',

    // ESLint が得意な領域（汎用品質）は error で強制
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': 'error'
  }
}
```

この設計にすることで、保存時の赤線は「ESLint でしか直せないもの」に絞られ、Svelte 5 構文の移行は AI（Claude Code 等）経由で MCP に任せる、という役割分担が自然に確立します。

## Claude Code / Cursor との統合

### AGENTS.md / CLAUDE.md での設定

Claude Code（`CLAUDE.md`）や Cursor（`AGENTS.md` または `.cursorrules`）で、以下のように MCP と ESLint の役割を明記しておくと、AI が一貫した挙動を取れます。

```markdown
## コード品質チェック

このプロジェクトは以下の三点セットで品質保証しています：

1. **Svelte MCP**: AI にコード生成・修正を依頼する際、必ず `svelte-autofixer` で検証すること
2. **eslint-plugin-svelte**: 保存時・CI で自動実行される
3. **typescript-eslint**: `@typescript-eslint/no-explicit-any` は error。any 使用時は必ず理由をコメントで明記

### 優先順位
- Svelte 固有のレガシー構文（`$:`、`<slot />`、`export let`、`on:click`）の検出で MCP と ESLint が衝突した場合は MCP を優先
- その他は ESLint のルールを優先
```

### VS Code / Cursor 設定

`.vscode/settings.json` で、MCP と ESLint の両方が気持ちよく動く設定例：

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
  "svelte.enable-ts-plugin": true,
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

<Admonition type="tip" title="TypeScript の SDK を揃える">

`typescript.tsdk` で `node_modules/typescript/lib` を指定することで、エディタと ESLint で **同じ TypeScript バージョン** を参照させます。これがないとエディタと CI で挙動が食い違うことがあります。

</Admonition>

## CI/CD 統合

典型的な CI パイプラインは以下のようになります。

<Mermaid diagram={ciDiagram} />

### GitHub Actions の例

`.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint-and-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run svelte-check
        run: pnpm check

      - name: Run ESLint
        run: pnpm lint

      - name: Run Prettier check
        run: pnpm exec prettier --check .
```

<Admonition type="info" title="AI レビューとの組み合わせ">

GitHub Actions で Claude や他の AI エージェントをワークフローに組み込み、PR のコード変更を `svelte-autofixer` で検証させる構成も可能です。ESLint で拾えない「AI がうっかり Svelte 4 構文を書いた」ケースをマージ前に検出できます。詳細は [開発環境との統合](/svelte-mcp/integration/) の「CI/CD 統合」セクションを参照してください。

</Admonition>

### pre-commit フック

`husky` + `lint-staged` の組み合わせで、コミット前に三点セットを走らせます。

`.husky/pre-commit`:

```bash
pnpm exec lint-staged
```

`package.json`:

```json
{
  "lint-staged": {
    "*.{ts,js,svelte}": [
      "prettier --write",
      "eslint --fix"
    ],
    "*.{md,json,yml,yaml}": [
      "prettier --write"
    ]
  }
}
```

<Admonition type="caution" title="svelte-check は pre-commit で実行しない">

`svelte-check` は全ファイルを走査するため実行が重く、pre-commit には向きません。CI のみで実行するのが現実的です。

</Admonition>

## バージョン固定運用

`eslint-plugin-svelte` と `svelte-eslint-parser` はリリース頻度が高く、patch アップデートで挙動が微妙に変わることがあります。業務プロジェクトでは `package.json` でバージョンを固定し、明示的なアップグレードタイミングをコントロールすることを推奨します。

```json
{
  "devDependencies": {
    "eslint-plugin-svelte": "3.17.0",
    "svelte-eslint-parser": "1.6.0",
    "typescript-eslint": "8.20.0",
    "eslint-config-prettier": "10.0.1"
  }
}
```

アップグレード時は以下のチェックリストで確認します。

1. `CHANGELOG.md` で breaking changes がないか確認
2. ローカルで `pnpm lint` を実行し、新しい警告が出ていないか確認
3. CI でフルパイプラインを走らせる
4. `svelte-autofixer` のルールとの整合性を確認

## トラブルシューティング

### .svelte.ts が解析されない

flat config の `files` パターンに `**/*.svelte.ts` を明示的に含める必要があります。

```javascript
{
  files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
  // ...
}
```

### Runes が未定義シンボルとして検出される

`parserOptions.svelteConfig` の設定漏れが原因です。`svelte.config.js` を読み込んで parserOptions に渡してください（前述）。

### typescript-eslint が非常に遅い

型情報ベースのルール（`*TypeChecked`）は遅い傾向があります。以下を試してください。

```javascript
{
  languageOptions: {
    parserOptions: {
      projectService: true,      // v8 推奨方式（v7 以前の project: '...' より高速）
      tsconfigRootDir: import.meta.dirname
    }
  }
}
```

また、CI では `eslint --cache` を使用してください。

```bash
pnpm eslint . --cache --cache-location .eslintcache
```

### MCP と ESLint で挙動が違う

基本的に **MCP を優先** してください。MCP は公式ドキュメントと同期しているため、最新の Svelte 仕様に対してより正確です。ESLint プラグインは追随が遅れることがあります。

矛盾を検出したら、`eslint-plugin-svelte` の該当ルールを無効化するか、MCP を信用して ESLint の警告を `// eslint-disable-next-line` でローカル無効化します。

```svelte
<script lang="ts">
  let count = $state(0);
  // MCP 推奨の書き方だが、ESLint のスタイル系ルールと衝突する場合の例
  // eslint-disable-next-line svelte/prefer-style-directive
  let doubled = $derived(count * 2);
</script>

<button onclick={() => count++}>{count}</button>
<p>{doubled}</p>
```

`eslint.config.js` の `rules` で該当ルール自体を `'off'` にする方法もあります。プロジェクト全体で MCP を優先したい場合はこちらが現実的です。

```javascript
{
  rules: {
    'svelte/prefer-style-directive': 'off'  // MCP が推奨する書き方を許容
  }
}
```

### ESLint プラグインのメジャーアップデート

`eslint-plugin-svelte` の major バージョンアップ時は breaking changes が多く、ルール名や挙動が変わることがあります。必ず以下を確認：

1. [公式リリースノート](https://github.com/sveltejs/eslint-plugin-svelte/releases) を熟読
2. プロジェクト全体で `pnpm lint` を走らせて、新しい違反が出ないか確認
3. `svelte-autofixer` との整合性を再確認

## 役割分担チートシート

最後に、三点セットの役割分担を 1 枚にまとめます。

| シチュエーション | 使うツール |
|---|---|
| AI にコード生成を依頼する | Svelte MCP |
| AI にリファクタリングを依頼する | Svelte MCP + get-documentation |
| Svelte 4 → 5 の移行 | Svelte MCP（`svelte-autofixer` が最強） |
| 未使用変数・import 順序の統一 | ESLint (typescript-eslint) |
| `any` の禁止 | ESLint (typescript-eslint) |
| a11y 違反の検出 | ESLint (eslint-plugin-svelte) |
| 型エラーの検出 | svelte-check |
| コードフォーマット | Prettier |
| PR のブロッカーとしての最終チェック | CI 上の ESLint + svelte-check |

## まとめ

Svelte MCP × eslint-plugin-svelte × typescript-eslint の三点セットは、AI 時代の Svelte 5 開発における品質保証の完成形の一つです。それぞれ異なる層で動作し、冗長性によって互いの弱点をカバーします。

- **Svelte MCP** は AI 対話時の Svelte 5 準拠保証
- **eslint-plugin-svelte** は保存時・CI 時の静的解析
- **typescript-eslint** は TypeScript 固有の問題検出
- **役割分担を意識した設定** で、エディタの赤線を意味のあるものに絞る
- **バージョン固定運用** で安定した開発体験を維持
- **CI での二重チェック** で PR 品質を担保

2026 年時点で全て実務投入可能な安定性に達しています。

## 次のステップ

- [Svelte MCP セットアップ](/svelte-mcp/setup/) — MCP 本体のインストール
- [ツール詳解](/svelte-mcp/tools/) — `svelte-autofixer` の詳しい挙動
- [開発環境との統合](/svelte-mcp/integration/) — VS Code / Claude Code / CI/CD 統合
- [ESLint + Prettier 設定]({base}/introduction/eslint-prettier/) — 基本セットアップの復習
