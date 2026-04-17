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
| TypeScript | 5.x以上 | strictモード必須 |
| Vite | 7.x以上 | |
| Node.js | 20.x LTS以上 | 推奨: 20.x LTS |

## コーディング規約

**Skill化済み**: `.claude/skills/svelte5-coding-standards/SKILL.md` を参照。

主要ルール:
- Svelte 5 Runes（$state, $derived, $effect, $props）のみ使用
- レガシー構文（$:、export let、`<slot />`、on:event、createEventDispatcher）は禁止
- TypeScript strictモード、`any`禁止
- `$app/state` 推奨（`$app/stores` はレガシー）
- `PageProps` / `LayoutProps` 推奨（`PageData` / `LayoutData` の直接使用はレガシー）

## Svelte MCP の利用（必須）

**このプロジェクトのコード修正・記事更新時は、必ず [Svelte MCP](https://svelte.dev/docs/mcp) を利用すること。**

- **`svelte-autofixer`**: Svelteコンポーネントやコード例を書いた/修正した際に必ず実行し、レガシーパターンがないか検証する
- **`get-documentation`**: Svelte 5 / SvelteKit の最新仕様を確認する際に使用する
- **`list-sections`**: 関連するドキュメントセクションを特定する際に使用する

記事内のコード例（Markdownのコードブロック）も、主要なものは `svelte-autofixer` に通して検証すること。

## カリキュラム構成

### 第1部：入門編 (`/introduction/`)
環境構築、Hello World、TypeScript設定、学習パス、CLIツール

### 第2部：Svelte編 (`/svelte/`)

```
svelte/
├── basics/          # Svelteの基本（コンポーネント、テンプレート構文、ライフサイクル、アクション、トランジション、TypeScript統合）
├── runes/           # Runesシステム（$state, $derived, $effect, $props, $bindable, $host, $inspect, 比較）
├── advanced/        # 実践編（ストア、クラス、組み込みクラス、Snippets、コンポーネントパターン、TypeScriptパターン、await expressions、hydratable、reactivity-window）
└── architecture/    # アーキテクチャ（計画中: SPA統合、BaaS、GraphQL、マイクロFE）
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
│   │   ├── components/      # 再利用可能コンポーネント（AutoPageNavigation等）
│   │   ├── config/
│   │   │   └── sidebar.ts   # サイドバー構造の単一情報源
│   │   ├── stores/          # グローバルストア(.svelte.ts)
│   │   └── utils/           # ユーティリティ（navigation-from-config.ts等）
│   └── app.html
├── static/                  # 静的ファイル
├── .claude/
│   └── skills/
│       └── svelte5-coding-standards/  # コーディング規約Skill
├── vite.config.ts           # Vite設定
├── svelte.config.js         # mdsvex設定・LiveCodeコードブロック変換ロジック
├── tsconfig.json
├── CLAUDE.md                # このファイル
├── CHANGELOG.md             # 変更履歴詳細
├── DIFF-REPORT-2026-04.md   # 最新化差分レポート
└── UPDATE-PLAN-2026-04.md   # 刷新計画書
```

## コンテンツ作成ガイドライン

### Markdownファイル構造

```markdown
---
title: ページタイトル
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

### コード例の記述ルール

1. **説明は文章で**: コードの前に実装の意図を文章で説明
2. **コメントは日本語**: コード内コメントはすべて日本語
3. **変数名は英語**: 説明的でわかりやすい英語名
4. **TypeScript必須**: `lang="ts"` を必ず使用
5. **完全なコード**: コピー&ペーストで動作するもの
6. **インポート省略不可**: `error`、`redirect`、型定義のインポートを必ず記述

### 情報の強調表示

```markdown
:::note[タイトル]     — 補足情報
:::tip[タイトル]      — ベストプラクティス
:::warning[タイトル]  — 注意点
:::caution[タイトル]  — 間違えやすい点
:::info[タイトル]     — 技術詳細・ディープダイブ
```

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

**コード例作成時の注意点**:
- SSR対応: Optional chaining (`?.`) と Nullish coalescing (`??`) を徹底
- 複雑な派生値: `$derived.by()` を使用
- TypeScriptの厳密な型定義
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
| JWT認証 | [svelte5-auth-jwt](https://github.com/shuji-bonji/svelte5-auth-jwt) | [デモ](https://svelte5-auth-jwt.vercel.app/) | [JWT認証](/examples/auth-jwt/) |

### 開発中

- `svelte5-auth-route-groups` — ルートグループ認証

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
