---
title: Packaging - コンポーネントライブラリの公開
description: SvelteKitでコンポーネントライブラリを構築・公開。@sveltejs/packageによるビルド、package.json設定、npm公開手順をTypeScriptで解説
---

<script>
  import Mermaid from '$lib/components/Mermaid.svelte';

  const libraryStructureDiagram = `flowchart LR
subgraph app[アプリケーション]
direction LR
AR[src/routes/] -->|公開| AW[Web ページ]
AL[src/lib/] -->|内部| AI[内部ライブラリ]
end

    subgraph lib[コンポーネントライブラリ]
        direction LR
        LR[src/routes/] -->|オプション| LD[ドキュメント/デモサイト]
        LL[src/lib/] -->|公開| LN[npmパッケージ]
    end

    style app fill:#e3f2fd,color:#333
    style lib fill:#e8f5e9,color:#333
    style AW fill:#bbdefb,color:#333
    style LN fill:#c8e6c9,color:#333
    style AR fill:#fff,color:#333
    style AL fill:#fff,color:#333
    style AI fill:#fff,color:#333
    style LR fill:#fff,color:#333
    style LD fill:#fff,color:#333
    style LL fill:#fff,color:#333`;
</script>

SvelteKit では、アプリケーションだけでなくコンポーネントライブラリも構築できます。
`@sveltejs/package` を使用して、`src/lib` のコンテンツを npm パッケージとして公開する方法を解説します。

## この記事で学べること

- コンポーネントライブラリの構造
- `svelte-package` コマンドの使い方
- `package.json` の設定
- TypeScript 型定義の生成
- npm への公開手順

## ライブラリの構造

コンポーネントライブラリは SvelteKit アプリと同じ構造を持ちますが、公開される部分が異なります。

<Mermaid diagram={libraryStructureDiagram} />

## プロジェクトのセットアップ

コンポーネントライブラリを作成するには、SvelteKit のライブラリテンプレートを使用するのが最も簡単です。このテンプレートには、パッケージ公開に必要な設定があらかじめ含まれています。

### 新規ライブラリの作成

以下のコマンドでライブラリプロジェクトを作成します。テンプレート選択時に「Library」を選ぶことで、`svelte-package` の設定が自動的に行われます。

```bash
# sv create でライブラリテンプレートを選択
npx sv create my-component-library
# "Which template would you like?" で "Library" を選択
```

### ディレクトリ構造

以下は、一般的なコンポーネントライブラリのディレクトリ構造です。`src/lib` がパッケージとして公開され、`src/routes` はオプションでドキュメントサイトやデモページとして使用できます。

```
my-component-library/
├── src/
│   ├── lib/               # 公開するコンポーネント
│   │   ├── index.ts       # エントリーポイント
│   │   ├── Button.svelte
│   │   ├── Card.svelte
│   │   └── Modal.svelte
│   └── routes/            # ドキュメント/デモサイト
│       └── +page.svelte
├── package.json
├── svelte.config.js
└── tsconfig.json
```

## svelte-package コマンド

`svelte-package` は `src/lib` の内容を処理し、`dist` ディレクトリに出力します。

### 基本的な使い方

`svelte-package` コマンドを実行すると、`src/lib` の内容がトランスパイルされ、`dist` ディレクトリに出力されます。開発中は `--watch` オプションを使用することで、ファイル変更時に自動的に再ビルドされます。

```bash
# ビルド
npx svelte-package

# ウォッチモード（開発中）
npx svelte-package --watch
```

### 処理内容

`svelte-package` は、ファイルの種類に応じて以下の処理を行います。Svelte コンポーネントや TypeScript ファイルは適切に変換され、型定義も自動生成されます。

1. **Svelte コンポーネント**: プリプロセスされる
2. **TypeScript ファイル**: JavaScript にトランスパイル
3. **型定義ファイル**: `.d.ts` ファイルが自動生成
4. **その他のファイル**: そのままコピー

### オプション

| オプション       | 説明               | デフォルト |
| ---------------- | ------------------ | ---------- |
| `-w`, `--watch`  | ファイル変更を監視 | -          |
| `-i`, `--input`  | 入力ディレクトリ   | `src/lib`  |
| `-o`, `--output` | 出力ディレクトリ   | `dist`     |
| `-t`, `--types`  | 型定義を生成       | `true`     |

## package.json の設定

`package.json` は npm パッケージの設定ファイルで、パッケージの名前、バージョン、エントリーポイントなどを定義します。Svelte ライブラリでは、特に `exports` と `svelte` フィールドの設定が重要です。

### 必須フィールド

以下は、Svelte コンポーネントライブラリの `package.json` に必要な最小限のフィールドです。各フィールドの詳細は後述します。

```json
{
	"name": "my-component-library",
	"version": "1.0.0",
	"license": "MIT",
	"type": "module",
	"files": ["dist"],
	"svelte": "./dist/index.js",
	"types": "./dist/index.d.ts",
	"exports": {
		".": {
			"types": "./dist/index.d.ts",
			"svelte": "./dist/index.js"
		}
	},
	"sideEffects": ["**/*.css"]
}
```

### 各フィールドの説明

#### name

パッケージの名前（npm での識別子）。

```json
{
	"name": "@yourorg/svelte-components"
}
```

#### license

ライセンス情報。MIT ライセンスが一般的です。

```json
{
	"license": "MIT"
}
```

#### files

npm に公開するファイル。`package.json`、`README`、`LICENSE` は自動的に含まれます。

```json
{
	"files": ["dist", "!dist/**/*.test.*", "!dist/**/*.spec.*"]
}
```

#### exports

パッケージのエントリーポイントを定義します。

```json
{
	"exports": {
		".": {
			"types": "./dist/index.d.ts",
			"svelte": "./dist/index.js"
		}
	}
}
```

- `types`: TypeScript の型定義ファイル
- `svelte`: Svelte ツールが認識するエントリーポイント

#### sideEffects

副作用を持つファイルを指定します。CSS ファイルは副作用があるものとしてマークする必要があります。

```json
{
	"sideEffects": ["**/*.css"]
}
```

## 複数エントリーポイント

大きなライブラリでは、すべてのコンポーネントをメインエントリーからインポートするのではなく、個別にインポートできるようにすることで、バンドルサイズを最適化できます。`exports` フィールドで複数のエントリーポイントを定義します。

### ディレクトリ構造

以下のようなシンプルな構造で、各コンポーネントを個別にエクスポートできます。

```
src/lib/
├── index.ts           # メインエントリー
├── Button.svelte
├── Card.svelte
└── Modal.svelte
```

### package.json の exports

`exports` フィールドで、メインエントリーと各コンポーネントへのパスを定義します。これにより、利用者は必要なコンポーネントのみをインポートできます。

```json
{
	"exports": {
		".": {
			"types": "./dist/index.d.ts",
			"svelte": "./dist/index.js"
		},
		"./Button.svelte": {
			"types": "./dist/Button.svelte.d.ts",
			"svelte": "./dist/Button.svelte"
		},
		"./Card.svelte": {
			"types": "./dist/Card.svelte.d.ts",
			"svelte": "./dist/Card.svelte"
		},
		"./Modal.svelte": {
			"types": "./dist/Modal.svelte.d.ts",
			"svelte": "./dist/Modal.svelte"
		}
	}
}
```

### 使用方法

利用者は、メインエントリーからすべてのコンポーネントをインポートするか、必要なコンポーネントのみを個別にインポートするかを選択できます。

メインエントリーからインポート（複数コンポーネントをまとめて）

```svelte
<script lang="ts">
  import { Button, Card, Modal } from 'my-component-library';
</script>
```

または、個別にインポート（バンドルサイズを最小化）

```svelte
<script lang="ts">
  import Button from 'my-component-library/Button.svelte';
</script>
```

## TypeScript サポート

TypeScript を使用することで、ライブラリ利用者に型情報を提供し、開発体験を向上させることができます。`svelte-package` は型定義を自動生成するため、特別な設定なしで TypeScript サポートを提供できます。

### 型定義の自動生成

`svelte-package` は自動的に `.d.ts` ファイルを生成します。Svelte コンポーネントの props や型エクスポートが正しく型定義に反映されます。TypeScript 4.0 以上が必要です。

### typesVersions の設定

複数のエクスポートパスがある場合、古いバージョンの TypeScript が正しく型を解決できるようにするには `typesVersions` を設定します。`>4.0` は TypeScript 4.0 以上を対象としており、各エクスポートパスに対応する型定義ファイルを指定します。

```json
{
	"exports": {
		".": {
			"types": "./dist/index.d.ts",
			"svelte": "./dist/index.js"
		},
		"./Button": {
			"types": "./dist/Button.svelte.d.ts",
			"svelte": "./dist/Button.svelte"
		}
	},
	"typesVersions": {
		">4.0": {
			"index.d.ts": ["./dist/index.d.ts"],
			"Button": ["./dist/Button.svelte.d.ts"]
		}
	}
}
```

### ソースマップの設定

エディタで「定義に移動」機能を使えるようにするには、ソースマップを有効化します。これにより、ライブラリ利用者がコンポーネントの実装を直接参照できるようになり、デバッグが容易になります。

`tsconfig.json` で `declarationMap` を有効化し、`package.json` の `files` にソースファイルを含めます。

```json
// tsconfig.json
{
	"compilerOptions": {
		"declarationMap": true
	}
}
```

```json
// package.json
{
	"files": ["dist", "src/lib", "!src/lib/**/*.test.*"]
}
```

## コンポーネントライブラリの例

実際のコンポーネントライブラリの実装例を見てみましょう。TypeScript と Svelte 5 の Runes を使用して、型安全で再利用可能なコンポーネントを作成します。

### Button コンポーネント

以下は、バリアントとサイズをカスタマイズできる Button コンポーネントの例です。`HTMLButtonAttributes` を継承することで、標準の button 属性をすべてサポートしています。

```svelte
<!-- src/lib/Button.svelte -->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLButtonAttributes } from 'svelte/elements';

  interface Props extends HTMLButtonAttributes {
    variant?: 'primary' | 'secondary' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    children: Snippet;
  }

  let {
    variant = 'primary',
    size = 'md',
    children,
    ...restProps
  }: Props = $props();
</script>

<button
  class="button {variant} {size}"
  {...restProps}
>
  {@render children()}
</button>

<style>
  .button {
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
    transition: background-color 0.2s;
  }

  .primary {
    background-color: #ff3e00;
    color: white;
  }

  .secondary {
    background-color: #e0e0e0;
    color: #333;
  }

  .danger {
    background-color: #dc3545;
    color: white;
  }

  .sm {
    padding: 0.25rem 0.5rem;
    font-size: 0.875rem;
  }

  .md {
    padding: 0.5rem 1rem;
    font-size: 1rem;
  }

  .lg {
    padding: 0.75rem 1.5rem;
    font-size: 1.125rem;
  }
</style>
```

### index.ts（エントリーポイント）

`index.ts` は、ライブラリのメインエントリーポイントとして機能します。すべての公開コンポーネントと型をここでエクスポートします。利用者は `import &#123; Button &#125; from 'my-library'` のようにインポートできます。

```typescript
// src/lib/index.ts
export { default as Button } from './Button.svelte';
export { default as Card } from './Card.svelte';
export { default as Modal } from './Modal.svelte';

// 型も再エクスポート
export type { ButtonProps } from './Button.svelte';
```

## ベストプラクティス

コンポーネントライブラリを設計する際の重要なベストプラクティスを紹介します。これらに従うことで、より多くの環境で使用でき、保守性の高いライブラリを構築できます。

### SvelteKit 固有のモジュールを避ける

ライブラリが SvelteKit 以外（純粋な Svelte や Vite プロジェクト）でも使用できるように、SvelteKit 固有のモジュール（`$app/*`）は避けます。環境検出には `esm-env` パッケージを使用します。

```typescript
// ❌ 避ける
import { browser } from '$app/environment';

// ✅ 代わりに
import { BROWSER } from 'esm-env';
```

### Props で依存を注入

`$app/state` や `$app/navigation` に直接依存せず、必要な値を props で受け取るようにします。これにより、ライブラリがフレームワーク非依存になり、テストも容易になります。

```svelte
<script lang="ts">
  // ❌ 避ける
  import { page } from '$app/state';

  // ✅ 代わりに props で受け取る
  let { currentUrl }: { currentUrl: URL } = $props();
</script>
```

### エイリアスの設定

ライブラリ内でパスエイリアスを使用する場合は、`svelte.config.js` で設定します。`vite.config.js` ではなく `svelte.config.js` で設定することで、`svelte-package` がエイリアスを正しく解決できます。

```javascript
// svelte.config.js
const config = {
	kit: {
		alias: {
			$components: 'src/lib/components',
		},
	},
};

export default config;
```

### 破壊的変更に注意

`exports` フィールドの変更は、利用者のコードに影響を与える可能性があります。パスの削除やエクスポート条件の変更は破壊的変更として扱い、メジャーバージョンをアップする必要があります。

```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      // "svelte" を "default" に変更 → 破壊的変更
      "svelte": "./dist/index.js"
    },
    // パスの削除 → 破壊的変更
    "./foo": { ... }
  }
}
```

## npm への公開

ライブラリが完成したら、npm に公開して他の開発者が利用できるようにします。公開前に必ず dry-run で確認し、意図しないファイルが含まれていないかチェックしましょう。

### ビルドと公開

以下のコマンドで、ライブラリをビルドして npm に公開します。スコープ付きパッケージ（`@yourorg/package-name`）の場合は、`--access public` オプションが必要です。

```bash
# ビルド
npm run package

# 公開前の確認（dry-run）
npm publish --dry-run

# 公開
npm publish

# スコープ付きパッケージを公開
npm publish --access public
```

### package.json スクリプト

以下のスクリプトを設定することで、開発・ビルド・公開のワークフローを効率化できます。`prepublishOnly` スクリプトにより、`npm publish` 実行時に自動的にパッケージがビルドされます。

```json
{
	"scripts": {
		"dev": "vite dev",
		"build": "vite build",
		"package": "svelte-kit sync && svelte-package",
		"prepublishOnly": "npm run package"
	}
}
```

### .npmignore

`.npmignore` ファイルで、npm パッケージに含めないファイルを指定します。テストファイル、デモページ、ビルド成果物などを除外することで、パッケージサイズを小さく保ちます。

```
src/routes
tests
*.test.ts
*.spec.ts
.svelte-kit
```

## 注意事項

パッケージを公開する際に注意すべき技術的な制約があります。これらを理解しておくことで、ビルドエラーやランタイムエラーを防ぐことができます。

### ESM インポートの完全な指定

ESM（ECMAScript Modules）では、相対インポートに完全なパス（ファイル拡張子を含む）を指定する必要があります。ディレクトリインポートは自動的に `index.js` に解決されないため、明示的に指定します。

```typescript
// ❌ 不完全
import { something } from './something';

// ✅ 完全な指定
import { something } from './something/index.js';
```

### TypeScript でのインポート

TypeScript ファイルをインポートする際も `.js` 拡張子を使用します。これは TypeScript がトランスパイル後のファイル構造を想定しているためです。実際には `.ts` ファイルが存在しますが、インポート文では `.js` を指定します。

```typescript
// ❌ .ts 拡張子
import { util } from './utils.ts';

// ✅ .js 拡張子
import { util } from './utils.js';
```

## まとめ

SvelteKit でコンポーネントライブラリを構築する際のポイント

- **`src/lib`** がパッケージのエントリーポイント
- **`svelte-package`** でビルド、型定義を自動生成
- **`package.json`** の `exports` で適切なエントリーポイントを設定
- **SvelteKit 固有のモジュール**は避け、汎用的に設計
- **セマンティックバージョニング**で破壊的変更を管理

これらの手順に従うことで、再利用可能なコンポーネントライブラリを構築・公開できます。

## 次のステップ

- [プラットフォーム別デプロイ](/sveltekit/deployment/platforms/) - アプリのデプロイ
- [TypeScript 統合](/svelte/basics/typescript-integration/) - TypeScript の詳細
- [コンポーネントパターン](/svelte/advanced/component-patterns/) - 高度なコンポーネント設計
