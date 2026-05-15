# CLAUDE.md - TypeScriptで学ぶ Svelte5/SvelteKit 学習ガイド

## プロジェクト概要

日本語によるTypeScript中心のSvelte 5/SvelteKit完全マスター学習コンテンツ。

- **リポジトリ**: https://github.com/shuji-bonji/Svelte-and-SvelteKit-with-TypeScript
- **公開URL**: https://shuji-bonji.github.io/Svelte-and-SvelteKit-with-TypeScript/
- **ビルドツール**: SvelteKit + mdsvex（SveltePressは廃止済み）

### 対象読者

- TypeScript/JavaScriptでのWeb開発経験者
- SPA/WebAPI開発経験があるがSSR/SSGは不慣れなエンジニア
- SvelteKitでビジネスレベルのサービスを構築したい人
- Spring Boot、ASP.NET Core、Angular等の経験を活かしたいエンタープライズ開発者

## 技術スタック

| 技術 | バージョン | 備考 |
|------|-----------|------|
| Svelte | 5.x以上 | Runesシステム必須 |
| SvelteKit | 2.x以上 | |
| TypeScript | 6.x以上 | strictモード必須 |
| Vite | 8.x以上 | |
| Node.js | 20.x LTS以上 | 推奨: 20.x LTS |

## コーディング規約

**Skill化済み**: `.claude/skills/svelte5-coding-standards/SKILL.md` を参照。

主要ルール:
- Svelte 5 Runes（$state, $derived, $effect, $props）のみ使用
- レガシー構文（$:、export let、`<slot />`、on:event、createEventDispatcher）は禁止
- TypeScript strictモード、`any`禁止
- `$app/state` 推奨（`$app/stores` はレガシー）
- `PageProps` / `LayoutProps` 推奨（`PageData` / `LayoutData` の直接使用はレガシー）

## 品質チェック（必須）

このプロジェクトのコード修正・記事追加・記事更新時は、以下 2 つを必ず利用してコードを検証すること。

### 1. Svelte MCP — 個別コードと最新仕様の確認

[Svelte MCP](https://svelte.dev/docs/mcp) を利用する。

- **`svelte-autofixer`**: Svelteコンポーネントやコード例を書いた/修正した際に必ず実行し、レガシーパターンがないか検証する。**新しい / 修正したコードは送信前に必ず通す**。
- **`get-documentation`**: Svelte 5 / SvelteKit の最新仕様を確認する際に使用する
- **`list-sections`**: 関連するドキュメントセクションを特定する際に使用する

### 2. eslint-plugin-svelte — 記事内 ```svelte ブロックの一括チェック

`svelte-autofixer` は単一コード単位の検査なので、**既存記事の網羅的スキャン**には別途 ESLint を回す。

```bash
npm run lint:articles
```

このスクリプトは、

1. `src/routes/**/*.md` 内のすべての ` ```svelte` コードブロックを `.tmp-eslint-check/` に展開（`scripts/extract-svelte-blocks.mjs`）
2. `eslint-plugin-svelte` で検査（`eslint.config.js`）
3. ファイル別／ルール別／元 .md 行番号付きで Markdown レポートを `eslint-svelte-blocks-report.md` に出力

**新しい記事を追加した時、既存記事のコードを修正した時は必ず実行**して、新しい問題が混入していないか確認すること。レポート末尾の「ブロック単位」セクションには元 .md ファイル内の正確な行番号が出るので、Edit で直接修正できる。

#### `bad` meta — 意図的アンチパターン例の除外

「❌ 悪い例」「旧 API のリファレンス」など **意図的に lint エラーになるコード** を載せたい場合は、コードフェンスに `bad` メタを付けて ESLint 検査から除外する。

````markdown
```svelte bad
<!-- ❌ アンチパターン：$effect で双方向 sync -->
<script lang="ts">
  let celsius = $state(20);
  let fahrenheit = $state(68);
  $effect(() => { fahrenheit = celsius * 9 / 5 + 32; });
  $effect(() => { celsius = (fahrenheit - 32) * 5 / 9; });
</script>
```
````

抽出スクリプトが `bad` メタを検出すると、抽出対象ファイルを空 `.svelte` で上書きし、ESLint レポートに上がらないようにする。記事側の表示には影響しない（mdsvex の highlighter は `bad` を無視する）。

主な使いどころ：

- 比較目的の「❌ NG / ✅ OK」両方を 1 ブロックに詰めた学習用断片
- `<svelte:component>` / `<svelte:self>` などの **deprecated API のリファレンス**
- `<script>` を伴わない **コード断片**（`bind:value={text}` の説明だけ抜粋した例など）
- `live` ブロックではない学習目的の悪い例

逆に、`live` メタ付きブロック（実行可能サンプル）には絶対に `bad` を付けないこと。`live` は実際に Playground で動くべきコードなので、エラーは必ず修正する。

#### 抑制中のルール

`eslint.config.js` で意図的に `'off'` にしているルールがある。理由は設定ファイル内のコメントを参照：

- `svelte/no-navigation-without-resolve` — 説明用 `<a href="/about">` が大半で false positive 多数のため抑制（SvelteKit 2.x の `resolve()` 推奨は記事内の解説で明示）

新規ルールの導入や緩和を検討する際は、`eslint.config.js` を更新して `CHANGELOG.md` に記録すること。

## カリキュラム構成

### 第1部：入門編 (`/introduction/`)
環境構築、Hello World、TypeScript設定、学習パス、CLIツール

### 第2部：Svelte編 (`/svelte/`)

```
svelte/
├── basics/          # Svelteの基本（コンポーネント、テンプレート構文、ライフサイクル、アクション、トランジション、TypeScript統合）
├── runes/           # Runesシステム（$state, $derived, $effect, $props, $bindable, $host, $inspect, 比較）
├── advanced/        # 実践編（ストア、クラス、組み込みクラス、Snippets、コンポーネントパターン、TypeScriptパターン、await expressions、hydratable、reactivity-window）
└── architecture/    # アーキテクチャ（SPA+API、BaaS=Firebase/Supabase、GraphQL、既存システム統合、デスクトップ・モバイル=Tauri/Electron/Capacitor）
                     #  ※ hybrid-integration はスタブ、それ以外は実装済み
```

### 第3部：SvelteKit編 (`/sveltekit/`)

```
sveltekit/
├── basics/          # 基礎編（概要、プロジェクト構造、ファイルシステム、レンダリング戦略、app.d.ts、$appモジュール）
├── routing/         # ルーティング（基本、動的、高度、shallow、link-options）
├── data-loading/    # データ取得（Load関数、TypeScript型、データフロー、SPA/無効化、ストリーミング、戦略）
├── architecture/    # アーキテクチャ詳解（レンダリング戦略/パイプライン、ハイドレーション、アクセスログ、データロード、ルーティング内部）
├── server/          # サーバーサイド（フォーム処理、WebSocket/SSE、Remote Functions、server-only-modules）
├── application/     # アプリケーション構築（認証、セッション、テスト、状態管理、snapshots）
├── optimization/    # 最適化（ビルド、キャッシュ、PWA、observability）
└── deployment/      # デプロイ（プラットフォーム、実行環境、packaging）
```

### 第4部：実装例 (`/examples/`)
ブログシステム（基礎/Markdown）、TODOアプリ、認証システム（Cookie/JWT）、データフェッチング、WebSocket、Mermaid SSRデモ

### 第5部：リファレンス (`/reference/`)
Svelte 5完全リファレンス、SvelteKit 2.x完全リファレンス

### 第6部：技術詳解 (`/deep-dive/`)
コンパイル時最適化、リアクティブ状態、派生値比較、HTMLテンプレート、素のJS構文、自動生成型、Web Components/CSS戦略、プレースホルダー

## ディレクトリ構造

```
Svelte-and-SvelteKit-with-TypeScript/
├── src/
│   ├── routes/              # ページとレイアウト
│   ├── lib/
│   │   ├── components/      # 再利用可能コンポーネント
│   │   │                    #   - AutoPageNavigation（前後ページナビ）
│   │   │                    #   - TableOfContents（右サイドバー目次）
│   │   │                    #   - Sidebar / Navbar
│   │   │                    #   - LiveCode（svelte.dev/playground iframe 埋め込み）
│   │   │                    #   - Mermaid（SSR 対応の Mermaid 描画）
│   │   │                    #   - SeoMeta（OGP/Twitter Card メタ集約）
│   │   │                    #   - PwaUpdatePrompt（PWA 新版検知＆更新通知 UI）
│   │   │                    #   - Admonition（:::note などの情報強調）
│   │   ├── config/
│   │   │   └── sidebar.ts   # サイドバー構造の単一情報源
│   │   ├── stores/          # グローバルストア(.svelte.ts)
│   │   └── utils/           # ユーティリティ（navigation-from-config.ts、playground-url.ts 等）
│   ├── app.html             # HTML シェル＋favicon/OGP/PWA メタ
│   └── app.d.ts             # ambient 型（virtual:pwa-register 等）
├── static/                  # 静的ファイル（favicon 一式、og-image.png、icon-*.png、robots.txt）
├── markdown-plugins/        # mdsvex 前段で走る Svelte preprocessor 群
│   └── preprocess-admonition-import.js  # ::: ディレクティブ → <Admonition> 変換＋import 自動注入
├── .claude/
│   └── skills/
│       └── svelte5-coding-standards/  # コーディング規約Skill
├── vite.config.js           # Vite 設定（@vite-pwa/sveltekit で PWA 生成）
├── svelte.config.js         # mdsvex 設定・LiveCode コードブロック変換ロジック・admonitionPreprocessor 登録
├── tsconfig.json
├── CLAUDE.md                # このファイル
└── CHANGELOG.md             # 変更履歴詳細
```

## コンテンツ作成ガイドライン

### Markdownファイル構造

```markdown
---
title: ページタイトル（35 文字以内）
description: 120-160文字。「TypeScript」「Svelte5」を必ず含める。具体的な学習内容を列挙。
---

導入文：ページの目的と概要

## 基本的な使い方
（TypeScriptコード例）

## 実践例

## よくある間違い

## まとめ

## 次のステップ
```

**重要**: フロントマター直後の `# {title}` は不要（`+layout.svelte` 側でfrontmatterの`title`から自動レンダリング）。

#### title の文字数制約（SEO）

`SeoMeta.svelte` が `<title>{title} | TypeScriptで学ぶ Svelte 5/SvelteKit</title>` の形でサフィックス（35 文字）を自動付与する。Bing Webmaster Tools の警告（70 文字超過）を回避するため、**frontmatter `title` は 35 文字以内**に収めること。

サフィックスに `TypeScript` / `Svelte 5` / `SvelteKit` の 3 キーワードが既に含まれるため、ページ title では：
- これらの繰り返し（例：`Svelte 5 の ...`、`TypeScript で ...`、`SvelteKit Remote Functions`）を避ける
- ページ固有の概念・API 名・機能名（例：`$state`、`$derived.by`、`SPA/MPA ハイブリッド構築`）を主役にする
- 例外：`Svelte 5 Runes` のように **意味ユニットとして強い複合語** はページ title 側に残してよい

### コード例の記述ルール

1. **説明は文章で**: コードの前に実装の意図を文章で説明
2. **コメントは日本語**: コード内コメントはすべて日本語
3. **変数名は英語**: 説明的でわかりやすい英語名
4. **TypeScript必須**: `lang="ts"` を必ず使用
5. **完全なコード**: コピー&ペーストで動作するもの
6. **インポート省略不可**: `error`、`redirect`、型定義のインポートを必ず記述

### 情報の強調表示（Admonition）

**原則**: Markdown 内での情報強調は `:::` ディレクティブ記法を **本命ルート** とする。`<Admonition>` コンポーネント直書きは、動的プロパティや特殊な子要素（`<details>`・テーブル・コード断片の差し込みなど）が必要な例外のみ使用する。

#### サポート種別

```markdown
:::note[タイトル]     — 補足情報（デフォルトタイトル: 補足）
:::tip[タイトル]      — ベストプラクティス（デフォルトタイトル: ヒント）
:::warning[タイトル]  — 注意点（デフォルトタイトル: 注意）
:::caution[タイトル]  — 間違えやすい点（デフォルトタイトル: 注意）
:::info[タイトル]     — 技術詳細・ディープダイブ（デフォルトタイトル: 情報）
```

`[タイトル]` は省略可。省略時は上記のデフォルトタイトルが使われる。
**`:::important` はサポート外**（`:::info[重要]` などで代替する）。

#### 記法ルール

- 開始マーカー `:::type[title]` と終了マーカー `:::` はそれぞれ独立した行に書く
- マーカー行の先頭に空白（インデント）があっても解釈されるが、原則として行頭に揃えること
- ブロック内にはリスト・テーブル・コードフェンス・インラインHTML（`<ul>` 等）を含めてよい
- コードフェンス（` ``` ` / ` ~~~ `）の内側に出現する `:::` は変換されない（記法の例示に安全）

#### 変換の仕組み

- `markdown-plugins/preprocess-admonition-import.js` が Svelte の preprocessor として `mdsvex` の**前段**で走り、以下を行う
  1. `:::type[title]` → `<Admonition type="type" title="title">` に変換
  2. 対応する `:::` → `</Admonition>` に変換（スタックベースでネスト対応）
  3. 変換を行った `.md` ファイルには `import Admonition from '$lib/components/Admonition.svelte'` を自動注入（既存 `<script>` があればマージ、無ければフロントマター直後に挿入）
- `svelte.config.js` の `preprocess` 配列の先頭に `admonitionPreprocessor()` を配置しているため、新規 `.md` ファイル追加時に個別の import は不要
- 実体レンダリングは `src/lib/components/Admonition.svelte`（Svelte 5 Runes）

#### 例外ケース（`<Admonition>` 直書きを使う場合）

以下のケースは `:::` では表現できないため、`<Admonition>` を直書きする（**その場合は該当 `.md` の先頭 `<script>` に `import Admonition from '$lib/components/Admonition.svelte';` を明示的に書く**）。

- `type` や `title` を変数・式で渡したい動的ケース
- `<svelte:fragment>`・slot/Snippets 的な差し込みを使いたい高度なパターン
- `:::` ブロック内だと衝突してしまうような特殊な Markdown 構造

上記以外は原則 `:::` 記法を使う。既存記事を修正する際も、`<Admonition>` 直書きが上記例外に該当しない場合は `:::` 記法への置換を推奨する。

### 国際化対応（ブラウザ自動翻訳考慮）

- Mermaidダイアグラム内テキストは自動翻訳されるため日本語でOK
- 変数名・関数名は説明的な英語
- エラーメッセージは英語ベース

## ナレッジベース

### 自動ナビゲーションシステム

`src/lib/config/sidebar.ts` を単一情報源として、前後ページへのナビゲーションを自動生成。

- **sidebar.ts**: サイドバー構造の定義（Single Source of Truth）
- **navigation-from-config.ts**: サイドバー構造をフラットリストに変換し前後ページを判定
- **AutoPageNavigation.svelte**: 各ページに自動挿入（`+layout.svelte`経由）
- **新しいページ追加時**: `sidebar.ts` に追加するだけで自動反映

### ハブページのカード一覧（手動管理）

`sidebar.ts` はサイドバー・前後ナビ・sitemap の Single Source of Truth だが、**各ハブページに並ぶカード一覧・学習ロードマップの Mermaid 図・ステップ番号は手動管理**である点に注意する。

ページを追加・削除・改名・並び替えた場合は、`sidebar.ts` の更新に加えて以下の該当するハブページも手動で同期すること。

**トップレベル・ハブ**:

- `/svelte/+page.md` — Svelte 5 ガイド全体のカード一覧＋学習ロードマップ
- `/sveltekit/+page.md` — SvelteKit ガイド全体のカード一覧＋学習ロードマップ

**セクション・ハブ**（配下のページ一覧カードを持つ）:

- `/svelte/basics/+page.md`、`/svelte/runes/+page.md`、`/svelte/advanced/+page.md`、`/svelte/architecture/+page.md`
- `/sveltekit/basics/+page.md`、`/sveltekit/routing/+page.md`、`/sveltekit/data-loading/+page.md`、`/sveltekit/architecture/+page.md`、`/sveltekit/server/+page.md`、`/sveltekit/application/+page.md`、`/sveltekit/optimization/+page.md`、`/sveltekit/deployment/+page.md`
- `/examples/+page.md`、`/reference/+page.md`、`/deep-dive/+page.md`、`/introduction/+page.md`

**チェックリスト**（ページ追加・削除・改名時）:

1. `sidebar.ts` の配列を更新
2. 該当するセクション・ハブ（例: `/svelte/runes/+page.md`）のカード一覧を更新
3. トップレベル・ハブ（`/svelte/+page.md` または `/sveltekit/+page.md`）の学習ロードマップ Mermaid 図とステップ番号を更新
4. `CHANGELOG.md` に変更を記録

### sitemap.xml 生成

`src/routes/sitemap.xml/+server.ts` が SvelteKit ネイティブの prerender エンドポイントとして `dist/sitemap.xml` を静的出力。

- **単一情報源**: `sidebar.ts` から再帰的にフラット化して全ページURLを生成
- **lastmod**: `git log -1 --format=%cI` で最終更新日時を取得（git使用不可時は `fs.statSync` の mtime にフォールバック）
- **Post-buildスクリプト不要**: `export const prerender = true` により vite build 時に自動生成
- **ページ追加時**: `sidebar.ts` 更新のみで sitemap も自動追従

### LiveCodeコンポーネント

[svelte.dev/playground](https://svelte.dev/playground) の公式 embed iframe を使用した実行可能コード例。

**仕組み**:
- `svelte.config.js` の mdsvex highlighter がコードブロックのmetaを解析
- `live` 付きブロック → `<LiveCode>` コンポーネントに変換
- URLハッシュは `src/lib/utils/playground-url.ts` で gzip + base64url 圧縮（Playground公式と同じ方式）

**デフォルト挙動**:
- `outputOnly={true}` — Result全画面で表示（Playgroundには「コードに戻る」機能があるため）

**Console付きにしたい場合**:
コードブロックに `console` メタを付与する：

````markdown
```svelte live console
<script lang="ts">
  let count = $state(0);
  $effect(() => console.log('count:', count));
</script>
```
````

- `svelte.config.js` 側で `meta?.includes('console')` を検出し `outputOnly={false}` を発行する
- 新しい記事を書く際、`console.log` を含む例では **必ず** `console` メタを付けること

**マルチファイル（複数の `.svelte` ファイルを Playground で同時に試す）**:

`<!-- @file: ファイル名.svelte -->` マーカーで区切ることで、ひとつの `live` ブロック内に複数ファイルを記述できます。コンポーネント間の import、Snippets ライブラリ、`<script module>` の分離例などを動かしたい場合に使用します。

````markdown
```svelte live
<!-- @file: Hello.svelte -->
<script lang="ts">
  let name = 'World';
</script>

<h1>Hello, {name}!</h1>

<!-- @file: App.svelte -->
<script lang="ts">
  import Hello from './Hello.svelte';
</script>

<Hello />
```
````

- マーカーは `<!-- @file: Foo.svelte -->` 形式（半角空白・コロン・末尾の `.svelte` 拡張子必須）
- 先頭のマーカーより前にあるテキストは破棄される
- `App.svelte` を必ず含めること（Playground のエントリポイント）
- `App.svelte` が配列の先頭以外にあっても、`LiveCode.svelte` 側で自動的に先頭へ並び替える
- LiveCode は `splitMultiFile()` でマーカーを検出し、`buildPlaygroundEmbedUrlMulti()` で Playground 埋め込み URL を生成する
- マーカーが無い `live` ブロックは従来通り単一ファイル（`App.svelte`）として扱われる（後方互換）

**コード例作成時の注意点**:
- SSR対応: Optional chaining (`?.`) と Nullish coalescing (`??`) を徹底
- 複雑な派生値: `$derived.by()` を使用
- TypeScriptの厳密な型定義
- **フェンスコードブロック内では `{` `}` を素のまま書く**: `svelte.config.js` の highlighter が shiki 出力後に `{` → `&#123;` と自動エスケープするため、ソース側で `&#123;` を直書きすると二重エスケープになり、ブラウザに `&#123;` が literal 表示される。
  - ❌ NG: ``` ```svelte ... <li>&#123;item.name&#125;</li> ... ``` ```
  - ✅ OK: ``` ```svelte ... <li>{item.name}</li> ... ``` ```
  - **インラインコード（バッククォート `` `…` ``）・テーブルセル内 `code`・raw HTML 内では `&#123;`/`&#125;` のエスケープが必須**（shiki を通らないため Svelte template として解釈される）。例: `\`&#123;#if&#125;\` ブロックは...`、`<h3>&#123;@attach&#125;</h3>`
- **DOM Events（MouseEvent/KeyboardEvent等）は `console.log` で直接渡さない**: Playground iframe 内で親へ `postMessage` する際、構造化クローンアルゴリズムでDOM Eventsはクローン不可。「Message could not be cloned」エラーになる。以下のようにプリミティブ値に分解してログする：

  ```ts
  // NG
  function handleClick(event: MouseEvent) {
    console.log('clicked', event);  // Message could not be cloned
  }

  // OK
  function handleClick(event: MouseEvent) {
    console.log('clicked', {
      type: event.type,
      x: event.clientX,
      y: event.clientY
    });
  }
  ```

## 実装例プロジェクト

### 完成済み

| プロジェクト | リポジトリ | デモ | 学習サイト記事 |
|------------|-----------|------|--------------|
| 基礎版ブログ | [svelte5-blog-example](https://github.com/shuji-bonji/svelte5-blog-example) | [デモ](https://shuji-bonji.github.io/svelte5-blog-example/) | [ブログシステム（基礎）](/examples/blog-system/) |
| Markdownブログ | [svelte5-blog-markdown](https://github.com/shuji-bonji/svelte5-blog-markdown) | [デモ](https://shuji-bonji.github.io/svelte5-blog-markdown/) | [Markdownブログ](/examples/markdown-blog/) |
| TODOマネージャー | [svelte5-todo-example](https://github.com/shuji-bonji/svelte5-todo-example) | — | [TODOアプリ](/examples/todo-app/) |
| Cookie/Session認証 | [svelte5-auth-basic](https://github.com/shuji-bonji/svelte5-auth-basic) | [デモ](https://svelte5-auth-basic.vercel.app/) | [Cookie/Session認証](/examples/auth-cookie-session/) |

### 準備中 / 開発中

| プロジェクト | リポジトリ | 状態 | 学習サイト記事 |
|------------|-----------|------|--------------|
| JWT認証 | `svelte5-auth-jwt`（未作成） | ⏳ 準備中 | [JWT認証](/examples/auth-jwt/)（記事もスタブ） |
| ルートグループ認証 | `svelte5-auth-route-groups`（未作成） | 🛠️ 開発中 | [ルートグループ認証](/examples/auth-route-groups/) |

> **注意**: 記事を更新する際、実装例の「完成／準備中」状態は **必ず実リポジトリと実デモ URL の存在を確認してから** 反映すること。過去に CLAUDE.md 上は「完成」だが実体がなかったケースが発生している（2026-05-13 確認、Sprint 1-D で取り消し）。

## 参考資料

### 公式ドキュメント
- [Svelte 5 Docs](https://svelte.dev/docs)
- [SvelteKit Docs](https://kit.svelte.dev/docs)
- [mdsvex](https://mdsvex.pngwn.io/)
- [svelte.dev Playground](https://svelte.dev/playground)

### Docs for LLMs
- https://svelte.jp/docs/llms — Svelte日本語LLMドキュメント
- https://svelte.jp/docs/svelte/llms.txt — Svelte用
- https://svelte.jp/docs/kit/llms.txt — SvelteKit用

### 使用している外部API
- [JSONPlaceholder](https://jsonplaceholder.typicode.com/) — テスト用RESTful API
- [GitHub API](https://docs.github.com/en/rest) — リポジトリ検索（認証不要）

## LLM向けリファレンス

プロジェクト内の包括的リファレンスガイド:
- **Svelte 5**: `/src/routes/reference/svelte5/+page.md`
- **SvelteKit 2.x**: `/src/routes/reference/sveltekit2/+page.md`

AI開発時は公式の [Svelte MCP](https://svelte.dev/docs/mcp) サーバーの併用を推奨。

## 関連ファイル

| ファイル | 内容 |
|---------|------|
| `CHANGELOG.md` | 変更履歴の詳細記録 |
| `.claude/skills/svelte5-coding-standards/SKILL.md` | コーディング規約Skill |

## アーカイブ

以下のデモページは通常のナビゲーションからは非表示ですが、機能テスト用に保持:
- `/_archive/examples/mermaid-demo/` — Mermaid図表の表示テスト
- `/_archive/examples/features-demo/` — Svelte 5機能の動作確認
