---
title: 環境変数管理
description: SvelteKitでの環境変数管理。$env/static、$env/dynamicモジュール、PUBLIC_プレフィックス、.envファイル設定とTypeScriptでの型安全な環境変数アクセスを解説
---

<script>
	import Admonition from '$lib/components/Admonition.svelte';
  import Mermaid from '$lib/components/Mermaid.svelte';

  const envModuleDiagram = `flowchart TB
    subgraph "ビルド時（static）"
      direction TB
      StaticPrivate["$env/static/private<br/>サーバー専用"]
      StaticPublic["$env/static/public<br/>クライアントOK"]
    end

    subgraph "実行時（dynamic）"
      direction TB
      DynamicPrivate["$env/dynamic/private<br/>サーバー専用"]
      DynamicPublic["$env/dynamic/public<br/>クライアントOK"]
    end

    EnvFile[".envファイル"] --> StaticPrivate
    EnvFile --> StaticPublic
    ProcessEnv["process.env<br/>（実行環境）"] --> DynamicPrivate
    ProcessEnv --> DynamicPublic

    style StaticPrivate fill:#ffebee,stroke:#d32f2f
    style DynamicPrivate fill:#ffebee,stroke:#d32f2f
    style StaticPublic fill:#e8f5e9,stroke:#4caf50
    style DynamicPublic fill:#e8f5e9,stroke:#4caf50`;
</script>

SvelteKitは環境変数を4つのモジュールに分類して提供します。「ビルド時 vs 実行時」と「プライベート vs パブリック」の2軸で整理されており、セキュリティとパフォーマンスを両立する設計です。

<Mermaid diagram={envModuleDiagram} />

## 環境変数の4つのモジュール

|                                  | ビルド時（static）    | 実行時（dynamic）      |
| -------------------------------- | --------------------- | ---------------------- |
| **プライベート（サーバー専用）** | `$env/static/private` | `$env/dynamic/private` |
| **パブリック（クライアントOK）** | `$env/static/public`  | `$env/dynamic/public`  |

## .env ファイルの設定

SvelteKitはViteの仕組みを通じて`.env`ファイルから環境変数を読み込みます。

```bash
# .env — 基本の環境変数ファイル
DATABASE_URL=postgresql://localhost:5432/myapp
API_SECRET_KEY=sk-secret-key-here

# PUBLIC_ プレフィックスで公開変数に
PUBLIC_APP_NAME=マイアプリ
PUBLIC_API_URL=https://api.example.com
```

### 環境別ファイル

Viteの規約に従い、環境別のファイルを設置できます。

```bash
.env                # 常に読み込まれる
.env.local          # 常に読み込まれる（.gitignore推奨）
.env.development    # dev時のみ
.env.production     # build/preview時のみ
```

<Admonition type="warning" title=".gitignore に追加">
`.env`や`.env.local`にはシークレットが含まれるため、必ず`.gitignore`に追加してください。`PUBLIC_`プレフィックスの変数のみを含む`.env.example`をリポジトリに含めると、チーム内での共有に便利です。
</Admonition>

## $env/static/private — ビルド時プライベート変数

ビルド時に値が確定し、バンドルに静的に埋め込まれるサーバー専用の環境変数です。デッドコード除去などの最適化が効きます。

```typescript
// +page.server.ts — サーバーサイドでのみ使用可能
import { DATABASE_URL, API_SECRET_KEY } from '$env/static/private';

export const load: PageServerLoad = async () => {
  // DATABASE_URLはビルド時の値で固定される
  const db = await connectDatabase(DATABASE_URL);

  // API_SECRET_KEYもビルド時に埋め込まれる
  const response = await fetch('https://api.example.com/data', {
    headers: { Authorization: `Bearer ${API_SECRET_KEY}` },
  });

  return { items: await response.json() };
};
```

```svelte
<!-- ❌ クライアントサイドからはインポートできない -->
<script lang="ts">
  // コンパイルエラー: Cannot import $env/static/private into client-side code
  import { DATABASE_URL } from '$env/static/private';
</script>
```

## $env/static/public — ビルド時パブリック変数

`PUBLIC_`プレフィックスを持つ変数のみが含まれ、クライアントサイドでも安全に使用できます。

```typescript
// どこからでもインポート可能（サーバー・クライアント両方）
import { PUBLIC_APP_NAME, PUBLIC_API_URL } from '$env/static/public';
```

```svelte
<script lang="ts">
  import { PUBLIC_APP_NAME, PUBLIC_API_URL } from '$env/static/public';

  // クライアントサイドでも安全に使用できる
  async function fetchPosts() {
    const response = await fetch(`${PUBLIC_API_URL}/posts`);
    return response.json();
  }
</script>

<h1>{PUBLIC_APP_NAME}</h1>
```

<Admonition type="tip" title="staticを使うメリット">
`$env/static/*`はビルド時に値がインライン化されるため、Viteのツリーシェイキングやデッドコード除去の恩恵を受けられます。値がビルド後に変わることがなければ、staticを使うのがパフォーマンス上有利です。
</Admonition>

## $env/dynamic/private — 実行時プライベート変数

実行時の`process.env`（または各プラットフォーム固有の環境変数）にアクセスします。デプロイ先で値を変更可能です。

```typescript
// +page.server.ts
import { env } from '$env/dynamic/private';

export const load: PageServerLoad = async () => {
  // envオブジェクト経由でアクセス（staticとは異なりnamed importではない）
  const dbUrl = env.DATABASE_URL;

  // 実行時に値が決まるため、環境ごとに異なる設定が可能
  if (env.FEATURE_FLAG === 'enabled') {
    // 新機能を有効化
  }

  return {
    /* ... */
  };
};
```

<Admonition type="caution" title="staticとの構文の違い">
`$env/static/*`はnamed import（`import &#123; VAR &#125; from ...`）ですが、`$env/dynamic/*`はオブジェクト経由（`env.VAR`）でアクセスします。この違いに注意してください。
</Admonition>

## $env/dynamic/public — 実行時パブリック変数

実行時の`PUBLIC_`プレフィックス変数に、クライアントサイドからもアクセスできます。

```svelte
<script lang="ts">
  import { env } from '$env/dynamic/public';

  // 実行時に解決される公開変数
  const apiUrl = env.PUBLIC_API_URL;
</script>

<p>API: {apiUrl}</p>
```

## static vs dynamic の使い分け

```typescript
// ✅ staticが適切なケース：ビルド時に確定する値
import { PUBLIC_APP_VERSION } from '$env/static/public';
// → バンドルにインライン化される。実行時オーバーヘッドなし

// ✅ dynamicが適切なケース：デプロイ先ごとに異なる値
import { env } from '$env/dynamic/private';
const dbUrl = env.DATABASE_URL;
// → staging/productionで異なるDBを使用可能
```

| 特性               | static                  | dynamic                          |
| ------------------ | ----------------------- | -------------------------------- |
| 値の決定タイミング | ビルド時                | 実行時                           |
| デッドコード除去   | 可能                    | 不可                             |
| デプロイ後の変更   | 不可（再ビルドが必要）  | 可能                             |
| インポート構文     | named import            | envオブジェクト                  |
| 主な用途           | バージョン番号、API URL | DB接続文字列、フィーチャーフラグ |

## TypeScript での型定義

環境変数の型を正しく推論させるには、`.env`ファイルで変数を宣言しておく必要があります。値が空でも型定義のために記載してください。

```bash
# .env — 型推論のために変数を宣言（値は空でもOK）
DATABASE_URL=
API_SECRET_KEY=
FEATURE_FLAG=
PUBLIC_APP_NAME=
PUBLIC_API_URL=
```

これにより、TypeScriptが`$env/static/private`や`$env/dynamic/private`のインポートに対して正しい補完と型チェックを提供します。

### コマンドラインでのオーバーライド

```bash
# 開発時に特定の変数を上書き
FEATURE_FLAG="enabled" npm run dev

# 本番ビルド
DATABASE_URL="postgres://prod-server/db" npm run build
```

## セキュリティのベストプラクティス

### 1. PUBLIC\_ プレフィックスの厳格な管理

```bash
# ❌ シークレットにPUBLIC_を付けてはいけない
PUBLIC_DATABASE_URL=postgresql://...  # クライアントに漏洩する！

# ✅ シークレットはプレフィックスなし
DATABASE_URL=postgresql://...
API_SECRET_KEY=sk-secret...
```

### 2. サーバーサイドでのみシークレットを使用

```typescript
// +page.server.ts（✅ サーバーサイド）
import { API_SECRET_KEY } from '$env/static/private';

export const load: PageServerLoad = async () => {
  // サーバーサイドでAPIを呼び出し、結果のみクライアントに返す
  const data = await fetch('https://api.example.com/secure', {
    headers: { Authorization: `Bearer ${API_SECRET_KEY}` },
  });

  return {
    items: await data.json(),
    // API_SECRET_KEY自体はクライアントに送信されない
  };
};
```

### 3. 環境変数の存在チェック

```typescript
// src/lib/server/config.ts — 起動時バリデーション
import { DATABASE_URL, API_SECRET_KEY } from '$env/static/private';

// 必須の環境変数が設定されているか検証
function validateEnv() {
  const required = { DATABASE_URL, API_SECRET_KEY };

  for (const [name, value] of Object.entries(required)) {
    if (!value) {
      throw new Error(`必須の環境変数 ${name} が設定されていません`);
    }
  }
}

validateEnv();

export { DATABASE_URL, API_SECRET_KEY };
```

## よくある間違い

### クライアントコードでprivateモジュールをインポート

```typescript
// ❌ +page.svelte や +page.ts ではインポートできない
import { DATABASE_URL } from '$env/static/private';
// → ビルドエラー

// ✅ サーバーファイル（+page.server.ts, +server.ts）で使用
```

### staticとdynamicのインポート構文の混同

```typescript
// ❌ dynamicでnamed importはできない
import { DATABASE_URL } from '$env/dynamic/private';

// ✅ dynamicはenvオブジェクト経由
import { env } from '$env/dynamic/private';
console.log(env.DATABASE_URL);

// ✅ staticはnamed import
import { DATABASE_URL } from '$env/static/private';
```

## まとめ

SvelteKitの環境変数システムは「ビルド時/実行時」×「プライベート/パブリック」の4象限で整理されており、セキュリティとパフォーマンスを自然に両立します。`PUBLIC_`プレフィックスによる公開制御、サーバー専用モジュールのインポートガード、TypeScript型推論を活用して、安全で堅牢な環境変数管理を実現しましょう。

## 次のステップ

- [app.d.tsの役割](/sveltekit/basics/global-types/) — グローバル型定義
- [server-onlyモジュール](/sveltekit/server/server-only-modules/) — サーバー専用コードの保護
- [プロジェクト構造](/sveltekit/basics/project-structure/) — 設定ファイルの配置
