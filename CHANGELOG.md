# Changelog

このプロジェクトの主要な変更履歴を記録します。

## [2026-04-18] - PWA 化（SveltePress 廃止で失われた機能を復活）

### 概要
SveltePress 時代に備わっていた PWA 機能がコンテンツ刷新（mdsvex 移行）で消失していたため、`vite-plugin-pwa` + Workbox で再実装。インストール可能 / オフライン対応 / 更新通知の三点を復活させた。

### 依存追加
- `vite-plugin-pwa` ^1.2.0
- `@vite-pwa/sveltekit` ^1.1.0（SvelteKit 統合）
- `workbox-window` ^7.4.0（型解決用）

### 設定ファイル
- **`vite.config.js`**: `SvelteKitPWA` プラグインを追加。以下を設定:
  - `strategies: 'generateSW'`（Workbox で SW 自動生成）
  - `base` / `scope`: `process.env.BASE_PATH` 連動で GitHub Pages の `/Svelte-and-SvelteKit-with-TypeScript/` 配下に閉じる
  - `registerType: 'prompt'`、`injectRegister: false`（登録は `PwaUpdatePrompt` から制御）
  - `pwaAssets.disabled: true`（既存の `static/icon-*.png` を使うため自動生成は無効）
  - `kit.outDir: 'dist'` / `kit.trailingSlash: 'always'`（`+layout.ts` と整合）
- **`manifest` 定義**
  - `name`: TypeScriptで学ぶ Svelte 5/SvelteKit 完全マスター学習ガイド
  - `short_name`: `Svelte & Kit Guide`
  - `display: 'standalone'`、`orientation: 'portrait-primary'`
  - `theme_color: '#ff3e00'`、`background_color: '#1a1a1a'`
  - `icons`: `icon-192.png` / `icon-512.png` (purpose=any) ＋ `icon-maskable-512.png` (purpose=maskable)
  - `categories: ['education', 'developer', 'books']`
- **`workbox` 設定**
  - `globPatterns`: 核となる `index.html` / `404.html` / 静的アセットのみ precache（全記事は肥大化するため runtime cache に任せる）
  - `runtimeCaching`:
    - HTML ドキュメント（同一オリジン）: `NetworkFirst`、最大 100 件・30 日、3 秒タイムアウト
    - 画像: `StaleWhileRevalidate`、最大 100 件・60 日
    - Google Fonts / gstatic: `CacheFirst`、最大 30 件・365 日
  - `navigateFallback: '${base}/'`（SPA fallback）
  - `navigateFallbackDenylist`: `/api/`、`sw.js`、`sitemap.xml` を除外
  - `clientsClaim: false` / `skipWaiting: false`: 更新通知経由でユーザー確認してから切替

### 追加ファイル
- **`src/lib/components/PwaUpdatePrompt.svelte`**: Svelte 5 runes で書かれた更新通知 UI
  - `virtual:pwa-register` を dynamic import で読み込み（`@ts-expect-error` 付与。vite が build 時に解決）
  - `$state` でリアクティブに `needRefresh` / `offlineReady` を管理
  - 新版 SW 検知時に右下トースト表示（「更新」/「後で」ボタン）
  - 1 時間ごとに `registration.update()` で更新チェック
  - SSR 時（`typeof window === 'undefined'`）は何もしない
  - dev 環境や SW 未対応ブラウザでは `console.warn` で静かに失敗
- **`src/app.d.ts`**: `virtual:pwa-register` / `virtual:pwa-info` の ambient 型宣言を追加（triple-slash reference で解決できないケースの保険）

### 更新ファイル
- **`src/app.html`**
  - `<link rel="manifest" href="%sveltekit.assets%/manifest.webmanifest" />` を追加
  - iOS 向け: `apple-mobile-web-app-capable` / `apple-mobile-web-app-status-bar-style` (`black-translucent`) / `apple-mobile-web-app-title` (`Svelte & Kit Guide`)
  - Android 向け: `mobile-web-app-capable`
  - Windows 向け: `application-name`
- **`src/routes/+layout.svelte`**: `<PwaUpdatePrompt />` をルートレイアウトに挿入。全ページで SW 登録と更新通知が走る

### Svelte Playground との相性
Playground の LiveCode iframe は **`svelte.dev/playground` の外部ドメイン**なので、SW 介入の対象外（同一オリジン制約）。Playground 側の独自 SW に委譲される。runtimeCaching で外部ドメインを明示的にキャッシュしていないため、Playground の最新 Svelte 5 での動作保証が崩れる心配はない。

### 検証
- `npx svelte-check` エラー 0 件
- Svelte MCP `svelte-autofixer` で `PwaUpdatePrompt.svelte` 検証 → issue なし
- `vite.config.js` のプラグイン構成を動的 import で確認（`vite-plugin-pwa:sveltekit:build` が正しくロードされる）
- ※ 本環境のサンドボックス制約で `npm run build` 実機検証は未実施。開発者PCでの `npm run build` で `dist/sw.js` と `dist/manifest.webmanifest` の生成を確認してほしい

### 手動確認手順（ビルド後）
1. `npm run build && npm run preview`
2. Chrome DevTools → Application → Manifest でマニフェスト検証
3. Application → Service Workers で SW 登録確認
4. Network → Offline でオフライン動作確認
5. アドレスバーの「インストール」アイコンからホーム画面追加

## [2026-04-18] - OGP / Twitter Card 整備

### 概要
これまで OGP 画像はサイトのスクリーンショット（`og-image.png` 2560×1440、`og-image-narrow.png` 1290×2796）を流用しており、SNS カード規格に合っていなかった。1200×630（Retina 2x の 2400×1260）の専用 OGP 画像に差し替え、メタタグも全プラットフォーム対応に再設計。

### 変更
- **`static/og-image.png`**: 2400×1260（1.91:1、Retina 2x）に差し替え。Svelte オレンジを基調にロゴ／タイトル／キャッチコピーを中央寄せ（X の `summary_large_image` の上下切れにも強い構図）
- **`static/og-image-narrow.png`**: 削除。OGP 規格に縦長用途は存在しないため
- **`src/lib/components/SeoMeta.svelte`**: 新規追加。OGP / Twitter Card の集約コンポーネント。`title` / `description` / `type` / `noTitleSuffix` を props で受け取り以下を出力:
  - `<title>`、`<meta name="description">`、`<link rel="canonical">`
  - OGP: `og:type` / `og:site_name` / `og:locale` (`ja_JP`) / `og:url` / `og:title` / `og:description` / `og:image` / `og:image:width|height|alt`
  - Twitter Card: `twitter:card=summary_large_image` / `twitter:title` / `twitter:description` / `twitter:image` / `twitter:image:alt`
- **`og:image` / `og:url` を絶対 URL で出力**: `page.url.origin + base + '/og-image.png'` で構成し、dev / prod の base 差を吸収
- **`src/lib/layouts/DocLayout.svelte`**: OGP メタの直接記述を `<SeoMeta>` 利用に置換。`type="article"` を渡す
- **`src/routes/+page.svelte`**: トップページのメタを `<SeoMeta>` 利用に置換。`type="website"` ＋ `noTitleSuffix`

### 補足
- `twitter:site` / `twitter:creator` は X アカウント未確認のため未設定。後日アカウント名確定後に追加予定
- 旧 `og:image=svelteAndTypescript.png`（生ロゴ 1024×1024）の参照を停止

### 検証
- `npx svelte-check` エラー 0 件
- Svelte MCP `svelte-autofixer` で `SeoMeta.svelte` 検証 → issue なし

## [2026-04-18] - robots.txt 刷新・Favicon 整備

### robots.txt
旧 URL（`/runes/`、`/basics/`）の `Disallow` を削除。`_redirects`（Netlify 形式）は GitHub Pages 上で動作しないため旧 URL は実質 404 を返しており、`Disallow` があると Google 側から 404 を発見できずインデックスから落ちにくい状態だったため。構造的な `*.html$` と `/404.html` の `Disallow` は維持。

### Favicon 整備
`static/svelteAndTypescript.png`（1024×1024）をマスターに、favicon セット＋PWA 用アイコンを一括生成。

- **追加ファイル**（`static/` 配下）
  - `favicon.ico`（16/32/48 マルチ解像度）
  - `favicon-16.png` / `favicon-32.png`
  - `apple-touch-icon.png`（180×180、白背景フラット塗り：iOS の透過非対応対策）
  - `icon-192.png` / `icon-512.png`（PWA any purpose 用）
  - `icon-maskable-512.png`（PWA maskable 用。中心 80% の安全領域に収めた余白付き）
- **`src/app.html`**: `<head>` に favicon / apple-touch-icon / `theme-color`（`#ff3e00`、Svelte オレンジ）の link を追加。`%sveltekit.assets%` を使って `paths.base` に追従
- **メモ**: `svelteAndTypescript.svg`（2MB）は中身が raster PNG を埋め込んだラッパー SVG だったため、favicon.svg としては不採用。将来真の vector SVG を用意したら差し替える

### 検証
- `npx svelte-check` エラー 0 件（警告 1 件は既存 Mermaid.svelte、本変更と無関係）

### 次フェーズ
- PWA 化（SveltePress 廃止で失われた機能の復活）で `manifest.webmanifest` と service worker を追加予定。上記アイコンはそのまま再利用する

## [2026-04-18] - Svelte / SvelteKit ハブページの大改訂（Tier 1）

`svelte/` と `sveltekit/` 配下のハブページ 7 枚を `sidebar.ts` の実態と整合させ、Svelte 5.x / SvelteKit 2.x の新機能（`{@attach}`、`svelte/motion`、`svelte/events`、`hydratable`、`await expressions` 実験的、`svelte/reactivity/window`、Shallow routing、Link options、Server-only modules、Remote Functions 実験的、PWA、Observability、実行環境、Packaging 等）への導線を追加。「Svelte 5 は最新版」といった時限的表現や React 18 / Angular 17 の比較を現行バージョンに更新。

### 更新（Tier 1 ハブ 7 ページ）
- **`src/routes/svelte/+page.md`**
  - タイトル変更: 「Svelte 5 Runes完全ガイド - TypeScriptで学ぶモダンUI開発」→「Svelte 5完全ガイド」（sidebar.ts line 69 と整合）
  - description を Runes 偏重から「Svelte 5 全体」に拡張
  - 基本編テーブルに 4 記事（`{@attach}` アタッチメント、`svelte/motion`、`svelte/easing`、`svelte/events`）を追加
  - 実践編テーブルに 3 記事（hydratable、await expressions 実験的、`svelte/reactivity/window`）を追加
  - 他フレームワーク比較表を React 19 / Angular 19 ベースに更新（バンドルサイズ注記も追加）
  - 「Svelte 5 は最新版」表現を時限的でない説明に置換、レガシー構文の注記を追加
  - プロジェクト作成コマンドに `npx sv create`（SvelteKit 推奨）を追記
- **`src/routes/sveltekit/+page.md`**
  - ルーティングテーブルにエラーページ、Shallow routing、Link options を追加
  - サーバーサイド編テーブルに Server-only modules、Remote Functions（実験的）を追加
  - アプリケーション構築編テーブルに認証ベストプラクティス、Snapshots を追加
  - 最適化編テーブルにビルド最適化、Service Workers / PWA、Observability を追加
  - デプロイ・運用編テーブルに実行環境とランタイム、Packaging を追加
  - CLI コマンドを `npm create svelte@latest` → `npx sv create` に更新（2 箇所）
  - FAQ 見出しの「A:」重複表示を修正
- **`src/routes/svelte/basics/+page.md`**: カードを 7 → 11 枚に拡張（`{@attach}`、`svelte/motion`、`svelte/easing`、`svelte/events` を追加）
- **`src/routes/svelte/advanced/+page.md`**: カードを 7 → 10 枚に拡張（hydratable、await expressions 実験的、`svelte/reactivity/window` を追加）
- **`src/routes/sveltekit/routing/+page.md`**: カードを 3 → 6 枚に拡張（エラーページ、Shallow routing、Link options を追加）＋ 「6 つのセクション」に冒頭説明を更新
- **`src/routes/sveltekit/server/+page.md`**: カードを 5 → 7 枚に拡張（Server-only modules、Remote Functions 実験的を追加）＋ 推奨学習順序を 7 ステップに更新
- **`src/routes/sveltekit/optimization/+page.md`**: カードを 4 → 6 枚に拡張（Service Workers / PWA、Observability を追加）＋ 推奨学習順序を 6 ステップに再整理

### 検証
- `npx svelte-check` エラー 0 件（警告 1 件は既存 Mermaid.svelte、本変更と無関係）

### 関連
- 計画書: `UPDATE-PLAN-2026-04.md`
- 次フェーズ: Tier 2（主要記事の情報精度、約 20 枚）、Tier 3（細部精度、残り約 70 枚）

## [2026-04-18] - ESLint/Prettier解説追加・sitemap.xml生成復旧

Svelte MCP × ESLint × typescript-eslint の品質保証三点セットを体系的に解説する記事を2本追加。また、SveltePress廃止時に消失していた `sitemap.xml` 生成機能をSvelteKitネイティブの `+server.ts` エンドポイント方式で復旧。

### 追加（ESLint/Prettier解説）
- **`src/routes/introduction/eslint-prettier/+page.md`**（492行、新規）- 初心者向けESLint + Prettier入門
  - Prettier（見た目統一）・ESLint（バグ/悪いパターン検出）・svelte-check（型検証）の役割分担を明確化
  - Mermaid図2点（役割分担・典型ワークフロー）
  - `npx sv add` によるクイックスタート vs 手動flat config設定の両パターン
  - `parserOptions.svelteConfig` の指定（Svelte 5 Runes 認識に必須）
  - `.prettierrc` / `.prettierignore` / `package.json` scripts
  - VS Code / Cursor の `settings.json` 共有設定
  - `eslint-config-prettier` による Prettier/ESLint 競合解消
  - husky + lint-staged によるpre-commit hooks
- **`src/routes/svelte-mcp/eslint-integration/+page.md`**（585行、新規）- 上級者向けSvelte MCP × eslint-plugin-svelte × typescript-eslint 連携ガイド
  - Mermaid図3点（役割分担・検出範囲の重なり・CI実行シーケンス）
  - 2026年4月時点の安定性評価表（三点セットいずれも★★★★★）
  - `strictTypeChecked` + `stylisticTypeChecked` を含む本番想定のフル設定
  - Claude Code / Cursor / AGENTS.md 連携
  - pnpm対応 GitHub Actions ワークフロー例
  - バージョン固定運用とアップグレードチェックリスト
  - トラブルシューティング（`.svelte.ts` / Runes が未定義扱い / パフォーマンス）

### 追加（sitemap.xml 生成）
- **`src/routes/sitemap.xml/+server.ts`**（新規）- SvelteKitネイティブの sitemap 生成エンドポイント
  - `prerender = true` によりビルド時に `dist/sitemap.xml` として静的出力
  - `sidebar.ts` を単一情報源として全ページを再帰フラット化
  - `git log` から `lastmod` を取得（失敗時は `fs.statSync` の mtime にフォールバック）
  - XMLエスケープ対応
- **`package.json` に `@types/node@^22.0.0` 追加**: `+server.ts` が `node:fs` / `node:child_process` / `process.cwd()` を使用するため必須

### 更新
- **`src/lib/config/sidebar.ts`**: 2つの新規記事へのリンクを追加
  - `{ title: 'ESLint + Prettier 設定', to: '/introduction/eslint-prettier/' }`（「はじめに」配下）
  - `{ title: 'ESLint × typescript-eslint 連携', to: '/svelte-mcp/eslint-integration/' }`（「Svelte MCP」配下）
- **`src/routes/svelte-mcp/integration/+page.md`**: 既存「ESLint との連携」セクションを最小構成ベースに再構成し、詳細ガイドへの `Admonition` リンクを追加

### 修正（バージョン表記）
- **`src/routes/svelte-mcp/eslint-integration/+page.md`**: `svelte-eslint-parser` を `1.4.x` → **`1.6.x`**（2026年3月リリースの最新安定版）に更新。バージョン固定サンプルも `1.4.0` → `1.6.0` へ
- **`src/routes/svelte-mcp/architecture/+page.md`**: 依存関係サンプルの `svelte-eslint-parser: "^0.x"` → **`"^1.x"`** に修正

### 背景
- 2026年4月時点で `eslint-plugin-svelte@3.17.x` / `svelte-eslint-parser@1.6.x` / `typescript-eslint@8.x` が実務投入に耐える安定性に到達したため、従来「Svelte ESLint は不安定」と避けていた読者向けに最新情報を提供
- SveltePress廃止（2026-04-13）で `scripts/generate-sitemap.js` が build パイプラインから外れたまま復旧されていなかったことを発見・対応

## [2026-04-17] - Svelte公式Playground embed統合・LiveCode刷新

### 変更（LiveCodeの実装方式刷新）
- **LiveCodes → svelte.dev公式Playground embed iframe 移行**: サードパーティ依存（`livecodes@0.13.0`）を廃止し、[svelte.dev/playground/[id]/embed](https://svelte.dev/playground) の公式埋め込みに全面刷新
- **URLハッシュ方式**: Svelte公式Playgroundと同じ `gzip + base64url` 圧縮方式（`CompressionStream`）でコード→URLハッシュを生成（ブラウザ側で完結）
- **デフォルトを`outputOnly=true`に変更**: Playgroundでは「コードに戻る」機能があるため、初期表示はResult全画面の方が学習体験として最適

### 追加
- **`src/lib/utils/playground-url.ts`**: コードからPlayground互換URLハッシュを生成するユーティリティ（新規）
- **`svelte.config.js` mdsvex highlighter拡張**: コードブロックのmeta（` ```svelte live console ` 等）を解析し、`console`キーワードでブロック単位の`outputOnly={false}`を切り替え
- **`LiveCode.svelte` 全面書き換え**: iframe埋め込み、`outputOnly`、`version`、`sandbox` 属性、JSDocコメント整備

### 更新（14ファイル・14ブロックに `console` メタ付与）
Consoleログを使用する実行可能コード例を対象に、ブロック単位で`live console`に変更しConsoleパネルを表示：

- `svelte/basics/component-lifecycle/+page.md`（3ブロック）
- `svelte/basics/component-basics/+page.md`（1ブロック）
- `svelte/basics/actions/+page.md`（1ブロック）
- `svelte/basics/special-elements/+page.md`（1ブロック）
- `svelte/basics/typescript-integration/+page.md`（1ブロック）
- `svelte/runes/state/+page.md`（1ブロック）
- `svelte/runes/effect/+page.md`（4ブロック）
- `svelte/runes/inspect/+page.md`（1ブロック）
- `svelte/runes/runes-introduction/+page.md`（1ブロック）

### 修正
- **`component-basics/+page.md` postMessage エラー修正**: `console.log('...', event)` でMouseEvent全体を渡すとPlayground iframeへの`postMessage`時に「Message could not be cloned」が発生。プリミティブ値（`type`、`clientX`、`clientY`）に分解するパターンに修正
- **`runes/state/+page.md` プリミティブboolean demoのUX改善**: チェックボックスでtrue/false切り替え時に視覚的な変化が無かったため、`{#if isActive}`で✅有効状態/⛔無効状態のステータスパネルを追加

### 削除
- **`package.json`から`livecodes`依存削除**: `livecodes@0.13.0`の削除、および関連するランタイム初期化コードの除去

### 技術的詳細
- **embed のサポート済みパラメータ**: svelte.dev公式embedは `version` と `output-only` のみサポート（editor表示のON/OFFは存在せず、`output-only`時はViewer.svelteで`{#if !onLog}`によりConsoleも非表示になる）
- **per-blockオプトインの採用理由**: Consoleが必要なのは全52ライブブロック中14ブロックのみ。デフォルトはResult全画面（最適UX）とし、Consoleが必要な箇所のみ ` ```svelte live console ` でオプトイン
- **postMessage制約**: DOM Events（MouseEvent/KeyboardEvent等）は構造化クローンアルゴリズムでコピーできないため、Playground内から親へログを送る場合はプリミティブ値への分解が必須

## [2026-04-13] - SveltePress廃止・SvelteKit + mdsvex基盤への全面移行

長年使用してきたSveltePressを廃止し、SvelteKit + mdsvex + Shiki + Tailwind CSS v4 による独自ドキュメント基盤に全面刷新。レンダリング、テーマ、ナビゲーション、検索、コードハイライトを自前のコンポーネントで構築することで、Svelte 5への追従性とカスタマイズ性を大幅に向上。

### 削除（SveltePress関連依存・実装）
- **`@sveltepress/theme-default`、`@sveltepress/vite` 依存を削除**
- **`src/lib/components/CustomNavbar.svelte`** — SveltePress用カスタムナビゲーション（306行）を削除
- **`src/styles/theme.css`** — SveltePressテーマスタイル（199行）を削除
- **`vite.config.ts`** — SveltePressプラグイン統合設定（87行）を削除し、`vite.config.js` にスリム化
- **`src/routes/+page.md`** — SveltePress形式のホームページmdを削除（`+page.svelte` に置き換え）

### 追加（新ドキュメント基盤）
- **mdsvex + Shiki 統合** (`svelte.config.js`): Markdown + Svelte の前処理と、コードブロックのShikiハイライト（`github-dark` / `github-light` 対応、14言語サポート）
- **`rehype-slug` / `rehype-autolink-headings`** — 見出しID自動付与とアンカーリンク
- **`@tailwindcss/vite` / `@tailwindcss/typography`** (v4.2.2) — ユーティリティCSSと`prose`クラスによる記事スタイル
- **`svelte-check` (v4.4.6)** — 型チェックコマンド（`pnpm check` / `pnpm check:watch`）
- **`pagefind` 検索統合更新** — `--force-language ja` で日本語全文検索対応

### 追加（新規コンポーネント・レイアウト）
- **`src/lib/components/Admonition.svelte`** — `:::note` / `:::tip` / `:::warning` / `:::caution` / `:::info` を描画する強調表示コンポーネント
- **`src/lib/components/Navbar.svelte`** — ヘッダーナビゲーション（旧CustomNavbarの後継）
- **`src/lib/components/Sidebar.svelte`** — サイドバー（レスポンシブ対応・開閉制御）
- **`src/lib/components/TableOfContents.svelte`** — ページ内目次（見出し自動抽出・スクロール追従）
- **`src/lib/components/LiveCode.svelte`** — 実行可能コード例の表示コンポーネント（初期版、2026-04-17 で Playground embed へ刷新）
- **`src/lib/components/icons.ts`** — アイコン定義
- **`src/lib/layouts/DocLayout.svelte`** — ドキュメントページ共通レイアウト

### 追加（ストア・ユーティリティ）
- **`src/lib/stores/sidebar.svelte.ts`** — サイドバー開閉状態を管理するRunesストア
- **`src/lib/stores/theme.svelte.ts`** — ダークモード切り替え（`prefers-color-scheme` 自動追従、`localStorage` 永続化）
- **`src/lib/utils/playground-url.ts`** — svelte.dev Playground互換URLハッシュ生成（gzip + base64url）

### 更新（レイアウト・エントリポイント）
- **`src/routes/+layout.svelte`** — 新レイアウト基盤へ大幅書き換え（Sidebar/Navbar/TableOfContents統合、ダークモード切り替え、pagefind検索統合）
- **`src/app.html`** — SveltePress前提から脱却し、Tailwind CSS v4 と新レイアウトに合わせて書き換え
- **`src/app.css`** — Tailwind CSS v4 ベースのグローバルスタイル（`@theme`、`prose` カスタマイズを含む新規作成、210行）
- **`src/routes/+page.svelte`** — ホームページを`.md`から`.svelte`に変更し、リッチなランディングページに刷新（237行）
- **`tsconfig.json`** — SveltePress参照を除去し、SvelteKit + mdsvex 標準構成に統一

### 更新（全コンテンツページ）
約150のMarkdownページ（`src/routes/**/*/+page.md`）を新基盤に対応。主な調整点：
- `# {title}` 見出しをfrontmatterに統一（mdsvex + `+layout.svelte` で自動描画）
- SveltePress独自構文（旧LiveCode、旧Admonition等）を新コンポーネント向けに置換
- Shikiでのシンタックスハイライト対応のためのコードブロックlang属性明示
- 一部ページ（`derived-vs-effect-vs-derived-by`、`sveltekit-placeholders`、`blog-system`、`rendering-strategies`、`data-loading/basic` 等）は内容の大規模見直しも同時実施

### 技術スタック変更
| 項目 | 変更前 | 変更後 |
|---|---|---|
| ドキュメント基盤 | `@sveltepress/vite` 1.3.8 / `@sveltepress/theme-default` 7.2.2 | `mdsvex` 0.12.7 + `shiki` 4.0.2 |
| CSS | SveltePressテーマCSS | `tailwindcss` 4.2.2 + `@tailwindcss/typography` 0.5.19 |
| Vite設定 | TypeScript (`vite.config.ts`) | JavaScript (`vite.config.js`) |
| 型チェック | 未導入 | `svelte-check` 4.4.6 |
| 検索 | `pagefind` | `pagefind --force-language ja` |

### 移行の効果
- **Svelte 5への追従性向上**: SveltePressのテーマに縛られず、Runes/Snippetsを全コンポーネントで即時採用可能
- **ビルド・プレビューの高速化**: SveltePressの内部レイヤーが消え、素のSvelteKit + mdsvexで最短経路のビルド
- **デザインのフルカスタマイズ**: Tailwind v4 + 自前コンポーネントで、ダークモード・タイポグラフィ・レイアウトを完全制御
- **依存削減**: `package-lock.json` が -17,000行級で大幅スリム化

## [2026-04-12] - コンテンツ検証・不備修正・最新API対応

### 修正（コンテンツ検証による7件の不備修正）
- **`$app/stores` → `$app/state` 移行**: `error-pages`（8箇所）、`file-system`（3箇所）、`blog-system`（2箇所）でレガシーAPIを新APIに統一
- **`$state.is()` 削除**: `state/+page.md` から公式ドキュメントに存在しないAPIセクションを削除
- **`import { pending }` 修正**: `reference/svelte5/+page.md` の不正確なインポートを `$effect.pending()` に統一
- **イベントハンドラ説明文更新**: `component-basics/+page.md` の説明をSvelte 5標準構文に合わせて更新
- **TypeScript型修正**: `markdown-blog/+page.md` の `NodeJS.Timeout` を `ReturnType<typeof setTimeout>` に修正

### 追加（リファレンス・ドキュメント最新化）
- **CONTENT-VALIDATION-REPORT-2026-04.md**: Svelte MCPによる143ファイルのAPI/構文検証レポート
- **DIFF-REPORT-2026-04.md**: 2026年4月の全セクション差分レポート
- **UPDATE-PLAN-2026-04.md**: 刷新計画書（残作業一覧）
- **svelte5-coding-standards Skill**: `.claude/skills/svelte5-coding-standards/SKILL.md` — コーディング規約のSkill化（331行）

### 更新（リファレンス最新化）
- **Svelte 5リファレンス** (`reference/svelte5/+page.md`): `$state.raw`、overridable `$derived`、`$effect.pending()`、Svelte 5イベント構文、`Component`型対応を追加
- **SvelteKit 2.xリファレンス** (`reference/sveltekit2/+page.md`): Remote Functions拡充（`query.batch()`、Standard Schema）、`/types`、`PageProps`/`LayoutProps`、`handleValidationError`を追加

### 更新（コンテンツページ）
- **Remote Functions** (`server/remote-functions/+page.md`): `requested()`、`preflight`、`for()`、機密データ保護、`unchecked`を追加
- **Hooks** (`server/hooks/+page.md`): `handleValidationError`フックを追加
- **エラーハンドリング** (`application/error-handling/+page.md`): 大幅加筆（+549行）
- **環境変数** (`application/environment/+page.md`): 大幅加筆（+310行）
- **SEO** (`optimization/seo/+page.md`): 大幅加筆（+430行）
- **$appモジュール** (`basics/app-modules/+page.md`): `$app/state` と `$app/stores` の比較セクション充実（+223行）
- **イベントモジュール** (`basics/events-module/+page.md`): 新規作成（442行）
- **特殊要素** (`basics/special-elements/+page.md`): `<svelte:boundary>` の `pending` snippet追加
- **データ取得型** (`data-loading/typescript-types/+page.md`): `PageProps`/`LayoutProps`専用セクション追加
- **CLIツール** (`introduction/cli/+page.md`): `better-auth`対応、`mcp`アドオン追加

### 更新（型パターン一括変更）
- 約25ファイルで `{ data: PageData }` → `PageProps` パターンに一括更新
- `LayoutData` → `LayoutProps` を3ファイルで更新
- Mermaidダイアグラム内の型表記も更新

### リファクタリング
- **CLAUDE.md**: 2124行 → 222行に大幅スリム化。コーディング規約をSkill（`.claude/skills/svelte5-coding-standards/SKILL.md`）として分離

## [2026-01-12] - 新規ドキュメントページ追加・Mermaid修正

### 追加
以下の新規ドキュメントページを作成し、サイドバーナビゲーションに追加：

**Svelte 基本編:**
- **svelte/motion** (`/svelte/basics/motion/`) - Tweened/Spring によるモーションプリミティブ
- **svelte/easing** (`/svelte/basics/easing/`) - イージング関数の解説

**Svelte 実践編:**
- **svelte/reactivity/window** (`/svelte/advanced/reactivity-window/`) - ウィンドウ状態のリアクティブ管理

**SvelteKit ルーティング:**
- **Shallow routing** (`/sveltekit/routing/shallow/`) - 履歴駆動のUI（pushState/replaceState）
- **Link options** (`/sveltekit/routing/link-options/`) - プリロード最適化

**SvelteKit サーバーサイド:**
- **Server-only modules** (`/sveltekit/server/server-only-modules/`) - 機密情報の保護

**SvelteKit アプリケーション:**
- **Snapshots** (`/sveltekit/application/snapshots/`) - DOM状態の保持（capture/restore）

**SvelteKit 最適化:**
- **Service Workers / PWA** (`/sveltekit/optimization/pwa/`) - オフライン対応とキャッシュ戦略
- **Observability** (`/sveltekit/optimization/observability/`) - OpenTelemetryトレーシング

**SvelteKit デプロイ:**
- **Packaging** (`/sveltekit/deployment/packaging/`) - コンポーネントライブラリの公開

**入門編:**
- **CLI tools** (`/introduction/cli/`) - sv コマンドの使い方

### 修正
Markdownの ` ```mermaid ` コードブロックを `<Mermaid>` コンポーネント形式に変換し、Shikiハイライターとの互換性問題を解決：

- **hydratable** (`/svelte/advanced/hydratable/`)
- **motion** (`/svelte/basics/motion/`) - 2箇所
- **easing** (`/svelte/basics/easing/`)
- **link-options** (`/sveltekit/routing/link-options/`)
- **shallow** (`/sveltekit/routing/shallow/`)
- **snapshots** (`/sveltekit/application/snapshots/`) - 2箇所
- **cli** (`/introduction/cli/`)
- **observability** (`/sveltekit/optimization/observability/`)
- **packaging** (`/sveltekit/deployment/packaging/`)
- **pwa** (`/sveltekit/optimization/pwa/`)
- **server-only-modules** (`/sveltekit/server/server-only-modules/`)

### 技術的詳細
- SveltePressはShikiハイライターを使用しており、`mermaid`は認識されない言語
- プロジェクトの`$lib/components/Mermaid.svelte`コンポーネントを使用することで解決
- 一部のダイアグラムで特殊文字（✓ ❌ `<br/>`等）を削除/修正
- サイドバー構成（`src/lib/config/sidebar.ts`）を更新し、新規ページをナビゲーションに追加

## [2026-01-11] - ドキュメント説明文の充実化

### 改善
以下のドキュメントページに説明文（セクション導入、コード例の前後説明）を追加し、読み物としての品質を向上：

- **Remote Functions** (`/sveltekit/server/remote-functions/`)
  - query、form、command、prerenderの各セクションに導入説明を追加
  - 従来のLoad関数/Form Actionsとの比較や使い分けガイダンスを充実化

- **{@attach}** (`/svelte/basics/attachments/`)
  - use:アクションとの違いを詳しく説明
  - fromAction移行ガイドの各ステップに説明を追加
  - 実践例（ドラッグ可能な要素）に導入説明を追加

- **hydratable** (`/svelte/advanced/hydratable/`)
  - キーの重要性とシリアライゼーションの仕組みを説明
  - CSP対応（nonce vs hash）の使い分けを詳細化
  - 動作の流れ図をMermaidダイアグラムに変換（3フェーズの色分け）

- **await expressions** (`/svelte/advanced/await-expressions/`)
  - スクリプト/マークアップ/$derived内での使い方を個別に説明
  - 同期された更新と並行処理の動作原理を詳細化
  - fork()によるプリローディングの仕組みを説明

## [2026-01-11] - 新機能ドキュメント追加（Svelte 5.29+/SvelteKit 2.27+）

### 追加
- **Remote Functions**: SvelteKit 2.27+の新しいサーバー連携機能（実験的）
  - `query` - 型安全なデータ取得
  - `form` - フォーム処理の簡略化
  - `command` - サーバーサイド処理の実行
  - `prerender` - ビルド時データ生成
  - Standard Schema（Zod/Valibot）によるバリデーション連携
  - Load関数/Form Actionsとの比較表

- **{@attach ...}**: Svelte 5.29+のリアクティブDOM操作パターン
  - `use:`アクションとの違いと使い分け
  - Attachment factoriesによる再利用パターン
  - コンポーネントへのアタッチメント適用
  - `svelte/attachments`ユーティリティ（`createAttachmentKey`、`fromAction`）
  - 外部ライブラリ（tippy.js等）との統合例

- **hydratable**: SSRハイドレーション最適化の低レベルAPI
  - SSR時のデータ再取得問題の解決
  - シリアライゼーション（devalue）の型サポート
  - CSP（Content Security Policy）対応（nonce/hash）
  - SvelteKit Remote Functionsとの関係

- **await expressions**: Svelte 5.36+の実験的非同期構文
  - スクリプト/マークアップ内での直接await
  - 同期された更新（Synchronized Updates）の仕組み
  - `<svelte:boundary>`のpendingスニペット
  - `$effect.pending()`によるローディング状態検出
  - `fork()`によるプリロード

## [2026-01-11] - $state.eager ドキュメント追加

### 追加
- **$state.eager**: 非同期操作中の即時UI更新機能のドキュメント（Svelte 5）
  - ナビゲーション中のメニューハイライト、楽観的UI更新のユースケース解説
  - 通常の`$state`/`$derived`との比較表
  - TypeScriptによる実践的なコード例

## [2026-01-11] - コードブロック品質改善（全セクションレビュー）

### 修正
全セクションのコードブロックをレビューし、以下の問題を修正：

#### Svelte 5イベント構文の修正
- `on:click` → `onclick`
- `on:submit` → `onsubmit`
- `on:mouseenter` → `onmouseenter`
- 他、すべてのイベントハンドラをSvelte 5構文に統一

#### SvelteKitインポートの追加
不足していた`error`、`redirect`、型定義のインポートを追加：

| セクション | 修正ファイル数 | 主な修正内容 |
|-----------|--------------|-------------|
| svelte/runes | 5 | `onclick`構文修正 |
| svelte/advanced | 3 | イベント構文修正 |
| sveltekit/basics | 2 | `error`インポート追加 |
| sveltekit/routing | 1 | `error`インポート追加 |
| sveltekit/data-loading | 4 | `error`、`redirect`インポート追加 |
| sveltekit/architecture | 1 | `onmouseenter`構文修正 |
| sveltekit/server | 2 | `error`、`redirect`、型定義追加 |
| sveltekit/application | 2 | `error`、`redirect`インポート追加 |
| sveltekit/optimization | 1 | `redirect`、`LayoutServerLoad`追加 |
| examples | 1 | `error`、`redirect`、型定義追加 |
| reference | 2 | `error`、型定義追加 |

### 品質向上
- すべてのコードブロックでSvelte 5構文を統一
- `throw error()`、`throw redirect()`使用箇所に適切なインポート文を追加
- 型定義（`PageServerLoad`、`LayoutServerLoad`、`RequestHandler`等）のインポートを補完
- ビルド検証によりすべての修正を確認

## [2026-01-10] - Svelte MCPセクション追加

### 新規セクション
Svelte公式MCPサーバーに関する包括的なドキュメントを追加（7ページ）

- **Svelte MCPとは**: 公式MCPサーバーの概要、対応クライアント一覧
- **セットアップ**: Claude Code、Cursor、VS Code等への導入手順
- **ツール詳解**: list-sections、get-documentation、svelte-autofixer、playground-linkの詳細解説
- **ユースケース**: 学習支援、コード生成、Svelte 4→5移行支援、品質保証の6つのシナリオ
- **アーキテクチャ**: モノレポ構造、Local版/Remote版の仕組み、レイヤーアーキテクチャ
- **開発環境との統合**: ESLint連携、CI/CD統合、AGENTS.md/CLAUDE.md/GEMINI.md設定
- **エコシステム**: 関連ツールとリソースへのリンク集

### 改善
- 各ページに説明文を追加し、読み物としての品質を向上
- Mermaidダイアグラムのダークモード対応を改善（テキスト色の視認性向上）
- README.mdの絵文字数字を通常の数字に変更

## [2026-01-08] - ドキュメント品質改善

### 修正
- **$state.raw**: 誤った`$get`/`$set` API記載を削除し、正確な使用方法に修正
- **$derived vs $derived.by**: 複雑なロジックには`$derived.by()`を使用するよう統一
- **テンプレート構文**: `$derived.by()`の戻り値を関数呼び出しではなくプロパティアクセスに修正

### 追加
- **$state.snapshot**: オブジェクトの静的スナップショット取得機能のドキュメント
- **$state.is**: 同一オブジェクト比較機能のドキュメント
- **$props.id()**: コンポーネント固有ID生成（Svelte 5.20+）
- **$effect.tracking()**: リアクティブコンテキスト判定機能
- **$effect.pending()**: 保留中Effect数の取得機能
- **$derived オーバーライド**: 派生値の強制上書き機能（Svelte 5.25+）
- **$app/state**: SvelteKit 2.12+の推奨状態管理パターン

## [2025-01-29] - セキュリティアップデート

### セキュリティ修正
- **vite**: 5.4.11 → 5.4.14
  - Path traversal vulnerability (CVE-2025-0291)修正
  - DOM Clobbering脆弱性修正
  - `server.fs.deny`バイパス脆弱性修正

- **@babel/helpers**: 7.26.0 → 7.26.10
  - Prototype Pollution脆弱性修正

- **esbuild**: 0.21.5 → 0.24.2
  - 開発サーバーのコマンドインジェクション対策

- **rollup**: 4.27.4 → 4.34.2
  - DOM Clobbering脆弱性修正

### 依存関係更新
- path-to-regexp: 6.3.0 → 8.2.0（ReDoS対策）
- cookie: 0.6.0 → 0.7.2（セキュリティ強化）

## [2025-12-08] - Vite 7 / SveltePress 7 アップグレード

### 破壊的変更への対応
- **Vite 7**: Node.js 18.x未満のサポート終了に対応
- **SveltePress 7**: サイドバー構造の仕様変更に対応
  - `sidebar.ts`による単一情報源管理システムの導入

### アップグレード
- Vite: 5.x → 7.x
- SveltePress: 6.x → 7.x
- その他依存パッケージの互換性対応

### アーキテクチャ改善
- `src/lib/config/sidebar.ts`: サイドバー構造の一元管理
- `vite.config.ts`と`navigation-from-config.ts`での設定共有

## [2025-09] - SvelteKitアーキテクチャセクション追加

### 追加コンテンツ
- アーキテクチャ概要ページ
- 実行環境別アーキテクチャ解説（SSR/SSG/SPA）
- ファイル構成と実行環境
- データロードフロー詳解
- レンダリングパイプライン解説

### データ取得セクションの大幅改善
- データ取得を独立セクションとして分離（7つのサブセクション）
- SPAモードとデータ無効化の詳細解説
- ストリーミングSSRの実装例

## [2025-08-08] - 初期リリース

### 主要機能
- Svelte 5 Runesシステムの完全ガイド
- SvelteKit 2.xのファイルベースルーティング解説
- TypeScript統合のベストプラクティス
- SveltePressによる静的サイト生成
- GitHub Pagesへの自動デプロイ

### 初期コンテンツ
- 入門編（introduction）- Svelte概要、環境構築、TypeScript設定
- 基礎編（basics）- Runesシステム（$state, $derived, $effect, $props, $bindable）
- Mermaidダイアグラム表示機能

---

このCHANGELOGは[Keep a Changelog](https://keepachangelog.com/ja/1.0.0/)の形式を参考にしています。
