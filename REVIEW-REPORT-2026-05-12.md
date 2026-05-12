# 記事刷新レビューレポート 2026-05-12

> Svelte 5.55.5 / SvelteKit 2.58 / TypeScript 6 / Vite 8 に対する全記事監査結果。
> 各章の精査結果と更新候補を、優先度付きで提示する。

- 作成日: 2026-05-12
- 対象ブランチ: main（commit time の最新）
- 監査対象: `src/routes/` 配下の Markdown ページ全 130 本超
- 監査ツール: `@sveltejs/mcp`（`list-sections` / `get-documentation` / `svelte-autofixer`）+ 手動レビュー
- 分担: 7 エージェント並行（Runes/basics、advanced/architecture、SvelteKit basics/routing/data-loading、SvelteKit architecture/server/application、optimization/deployment、examples、reference/deep-dive、introduction/svelte-mcp）

---

## 0. エグゼクティブサマリ

全体としては Svelte 5 Runes の主要採用と `$app/state` / `PageProps` / `LayoutProps` への移行は概ね完了している。コンテンツ品質は高水準。ただし以下の **3 種の陳腐化** が広範囲に残存する。

1. **SvelteKit 2 移行漏れ** — `throw redirect(...)` / `throw error(...)` 構文が 8 章 30+ 箇所に残存。これは SvelteKit 1→2 の最初の breaking change。
2. **Svelte 5.x で追加された主要 API の欠落・誤情報** — `$inspect.trace`、`<svelte:boundary>` 独立解説、`{@attach}` の正しい主役化、Function bindings、`query.live`、Remote Functions の field API 全般、`$app/types`、`router.resolution`、`transport` hook など。
3. **エコシステム陳腐化** — `lucia`（→ `better-auth`）、`npm create svelte@latest`（→ `npx sv create`）、Tauri 1.x（→ 2.x）、Apollo Client `WebSocketLink`（→ `GraphQLWsLink`）、urql `defaultExchanges`（→ 個別 exchange）、FID（→ INP）、Vercel `runtime: 'nodejs18.x'`（→ `nodejs20.x`/`22.x` または deprecated）、`prefetch`/`prefetchRoutes`（→ `preloadData`/`preloadCode`）。

加えて、Runes コードで **`$derived(() => ...)` の関数引数誤用**（実行時に動かない／挙動が違う）、**`$state(new SvelteMap(...))` の二重ラップ**、**`<svelte:component>` の残存**、**`$props<T>()` のジェネリック呼び出し構文** など、autofixer が機械的に検出できる問題が複数記事で見つかった。これらは CLAUDE.md で「`svelte-autofixer` に必ず通すこと」と書かれているので、**lint パイプラインの強化**が再発防止の鍵。

実装例リポジトリ（`svelte5-auth-basic` 等）と記事内コードに乖離があり、特に **`auth-jwt` の状態表記**（記事「準備中」 vs CLAUDE.md「完成済み」）は即修正対象。

「準備中」スタブが計 6 本（`data-fetching`、`websocket`、`performance`、`monitoring`、`platforms`、`security`、加えて `authentication`/`database` の薄い記事）。ハブカードからリンクされ、SEO description が具体内容を約束しているにも関わらず本体が空のものがあり、読者の信頼を損ねるリスク。

---

## 1. 横断的な是正対象（最優先）

### 1.1 SvelteKit 2: `throw redirect/error` の全廃

SvelteKit 2 では `redirect()` / `error()` 関数自体が例外を投げるため、**`throw` キーワード不要**。「書いても害はない」と公式は注記しているが、最新ドキュメントは `throw` 無しで統一。

#### 該当ファイル（一括検索結果）

| ファイル | 件数（概算） |
| --- | --- |
| `src/routes/sveltekit/server/api-routes/+page.md` | 12 |
| `src/routes/sveltekit/server/forms/+page.md` | 4 |
| `src/routes/sveltekit/application/auth-best-practices/+page.md` | 11 |
| `src/routes/sveltekit/application/session/+page.md` | 4 |
| `src/routes/sveltekit/architecture/spa-mpa-hybrid/+page.md` | 2 |
| `src/routes/sveltekit/data-loading/basic/+page.md` | 2 |
| `src/routes/sveltekit/data-loading/typescript-types/+page.md` | 2 |
| `src/routes/sveltekit/routing/dynamic/+page.md` | 複数 |
| `src/routes/sveltekit/routing/advanced/+page.md` | 5+ |
| `src/routes/sveltekit/routing/error-pages/+page.md` | 5+ |
| `src/routes/sveltekit/basics/file-system/+page.md` | 数件 |
| `src/routes/sveltekit/basics/global-types/+page.md` | 数件 |
| `src/routes/examples/auth-cookie-session/+page.md` | 数件 |
| `src/routes/examples/auth-jwt/+page.md` | 数件 |
| `src/routes/examples/auth-route-groups/+page.md` | 数件 |
| `src/routes/examples/auth-system/+page.md` | 2 |

**置換ルール（機械化注意）**

- `throw redirect(303, '/path')` → `redirect(303, '/path')`
- `throw error(404, 'msg')` → `error(404, 'msg')`
- ただし「`Error` インスタンスを再 throw」する `throw error;`（`error` が catch 変数名）は別物。**変数名と関数呼び出しを正規表現で区別すべし**。
- `catch (err) { if (err?.status === 303) throw err; }` のような再 throw も legacy パターン。`isRedirect(err)` / `isHttpError(err)` ヘルパー（`@sveltejs/kit` 2.x）に置き換え推奨。

### 1.2 Svelte 5.x で追加された主要 API の体系的取り込み

| API | 追加 | 反映状況 | 推奨アクション |
| --- | --- | --- | --- |
| `$inspect.trace` | 5.14 | 🔴 `runes/inspect`/`reference/svelte5` に欠落 | 専用 H3 セクション追加 |
| `<svelte:boundary>` の `pending`/`failed`/`onerror`/`transformError` | 5.3 / 5.51 | ⚠️ `special-elements` 中で部分言及のみ | 独立ページ or リファレンスに独立節 |
| `{@attach}` / `svelte/attachments` | 5.29 | ✅ 専用ページあり / 🔴 `actions` の冒頭で主役化されていない | `basics/actions` 冒頭に「新規は `{@attach}` を推奨」明示。`fromAction` の移行パスも併記 |
| `svelte/reactivity` (`SvelteMap` 等) | 5.7 / 5.11 | 🔴 `state` ページの built-in 例で誤用、`built-in-classes` で二重ラップ | `new Map/Set/Date/URL` を `SvelteMap/SvelteSet/SvelteDate/SvelteURL` に置換 |
| `svelte/reactivity/window` | 5.11 | ⚠️ 専用ページあるが `$derived` 誤用が多数 | `$derived(() => ...)` → `$derived.by(() => ...)` 一括修正 |
| Function bindings `bind:value={() => g, s}` | 5.9 | 🔴 `bindable` / `reactive-state-variables-vs-bindings` / `derived-vs-effect-vs-derived-by` に欠落 | 該当 3 ページに節追加 |
| Overridable `$derived` | 5.25 | ⚠️ `runes/derived` で記載あり、deep-dive で欠落 | deep-dive 側にも反映 |
| `$state.eager` | 5.x | ✅ `runes/state` で網羅 / ⚠️ `reference/svelte5` の説明が SvelteKit 寄り | reference の説明を再構成 |
| `$state.raw` / `$state.snapshot` | 5.x | ✅ 記載あり | OK |
| `$effect.pending()` | 5.36 | ⚠️ `runes/effect` で言及（ただし `Suspense` 誤 import 含む） | 修正必須 |
| Async expressions（`await` in markup） | 5.36 | ⚠️ `advanced/await-expressions` あり、ただし `svelte.config.js` 型注釈が誤り | 修正 |
| `fork()` / `settled()` / `tick()` | 5.42 | ⚠️ `await-expressions` に記載あり / 🔴 リファレンスに欠落 | `reference/svelte5` に追記 |
| `<svelte:options customElement={{ ... }}>` オブジェクト構文 | 既存 | 🔴 文字列リテラル例のみ | `webcomponents-svelte-css-strategies` と `reference/svelte5` に追加 |
| `$host()` rune | 5.0 | ✅ `runes/host` で網羅 / ⚠️ Web Components 記事で未使用 | `deep-dive` 側に追加 |
| `<script lang="ts" generics="T">` | 5.0 | 🔴 `runes/props` のジェネリック例で抜け（コンパイル不能） | 追加必須 |
| `let { ... }: Props = $props()` パターン | 5.0 | ⚠️ `runes/props` 一部で `$props<T>()` 構文使用、Web Components 記事でも残存 | 統一 |
| Snippets の `<script module>` export | 5.5 | 🔴 `advanced/snippets` に欠落 | 追記 |
| `createRawSnippet` | 5.x | 🔴 欠落 | 追記 |

### 1.3 SvelteKit 2.x で追加された主要 API の体系的取り込み

| API | 追加 | 反映状況 | 推奨アクション |
| --- | --- | --- | --- |
| Remote Functions（`$app/server` の `query`/`form`/`command`/`prerender`/`getRequestEvent`/`requested`） | 2.27 | ⚠️ 専用記事あり / 🔴 主要 API（field API、`query.live`、`requested().refreshAll()`、`enhance().submit()` の戻り値 boolean、`.run()`、`.withOverride()`、`'unchecked'`）が抜け | `remote-functions` ページの全面拡充。`reference/sveltekit2` のテーブルも追記 |
| `$app/types`（`RouteId`、`RouteParams<R>`、`Pathname`、`ResolvedPathname`、`Asset`、`LayoutParams<R>`） | 2.26 | 🔴 ほぼ未紹介 | `auto-generated-types`、`reference/sveltekit2`、`basics/global-types` 全てに反映 |
| `$app/server`（含む `read()`） | 2.4+/2.27 | ⚠️ Remote Functions 文脈のみ | `server-only-modules` に「`$app/server` のサーバー専用 API 一覧」節を追加 |
| `refreshAll()` | 2.27 | 🔴 欠落 | `$app/navigation` 解説に追加 |
| `getRequestEvent()` | 2.20 | 🔴 ほぼ欠落 | `basics/app-modules`、`data-loading/basic`、`server-only-modules` などに追加 |
| Universal hooks `hooks.ts`（`reroute`、`transport`） | 2.18 async / `transport` 既存 | 🔴 `server/hooks` で未紹介 | 「Server / Client / Universal」3 系統を冒頭で説明し節を増設 |
| `handleValidationError` の引数 `{ event, issues }` | — | 🔴 `reference/sveltekit2` で `event.issues.map(...)` という誤りあり | 修正 |
| `csrf.trustedOrigins` | 2.x（`checkOrigin` deprecate） | 🔴 旧 API の説明のみ | 移行ガイド追加 |
| `csp.mode: 'auto' | 'hash' | 'nonce'` | — | ⚠️ `sveltekit-placeholders` に部分言及 | `application/security`（stub）に反映 |
| `kit.router.resolution: 'client' | 'server'` | 2.17 | 🔴 欠落 | `reference/sveltekit2` と最適化記事に追加 |
| `kit.router.type: 'pathname' | 'hash'` | 2.14 | 🔴 欠落 | 同上 |
| `kit.output.bundleStrategy: 'split' | 'single' | 'inline'` | 2.13 | 🔴 欠落 | 最適化系記事と reference に追加 |
| `kit.experimental.tracing.server` / `instrumentation.server.ts` | 2.31 | ✅ `optimization/observability` でカバー | OK（軽微修正） |
| `kit.experimental.handleRenderingErrors` | 2.54 | ✅ `error-handling` で紹介 | OK |
| `<form>` / `<a>` の `data-sveltekit-*` 属性（`reload`、`replacestate`、`keepfocus`、`noscroll`、`preload-data`、`preload-code`） | 既存 | ⚠️ `link-options` で正確、`routing/basic` と `data-loading/flow` で誤値 (`eager`/`off`) | 修正 |
| `pushState`/`replaceState` / Shallow routing | 既存 | ✅ 専用ページあり | OK |
| `goto` の `invalidate` / `state` オプション | 既存 | ⚠️ `basics/app-modules` で欠落 | 追記 |
| `isHttpError` / `isRedirect` ヘルパー | 既存 | 🔴 ほぼ未紹介 | `routing/error-pages`、認証系、`reference` に追加 |

### 1.4 CLI / ツールチェイン

| 項目 | 現行 | 反映状況 | 推奨アクション |
| --- | --- | --- | --- |
| プロジェクト作成 | `npx sv create` | ⚠️ `setup` で `npm create svelte@latest` と併記、`project-structure` で旧コマンドのみ | 旧コマンドを削除（または「廃止」と明記） |
| 認証アドオン | `better-auth` | 🔴 `setup` の対話例に `lucia` が残る | `lucia` を `better-auth` に置換 |
| `sv add` ファミリー | `eslint`/`prettier`/`vitest`/`playwright`/`tailwindcss`/`drizzle`/`better-auth`/`mdsvex`/`storybook`/`sveltekit-adapter`/`mcp` 等 | ⚠️ 一部欠落（特に `mcp`、`storybook`、`sveltekit-adapter`） | `setup` プロンプト例を更新 |
| Node.js | 22.x LTS が現行中心、20.x はメンテナンス | ⚠️ `engines.node` を `>=20.0.0` のまま | 注記追加 |
| Vite | 8.x | ⚠️ `setup` の `package.json` 例が Vite 5 表記 | 更新 |
| TypeScript | 6.x | ⚠️ 同上 5.5 表記 | 更新 |
| Svelte 本体 | 5.55+ | ⚠️ 同上 5.1 表記 | 更新 |
| `@sveltejs/vite-plugin-svelte` | 7.x | ⚠️ 同上 v4 表記 | 更新 |
| `nvm` | v0.40 系 | ⚠️ v0.39.0 で固定 | 更新 |
| ESLint | flat config / 9.x | ✅ `eslint-prettier` / `eslint-integration` で完璧 | OK |
| Prettier | 3.x | ✅ 完璧 | OK |
| `actions/checkout@v4` 等 | v4 | ⚠️ `typescript-setup` で v3 表記 | 更新 |

### 1.5 エコシステム陳腐化（外部ライブラリ）

| ライブラリ | 内容 | 反映状況 | 推奨アクション |
| --- | --- | --- | --- |
| Tauri | 2.x（2024-10 GA） | 🔴 `architecture/desktop-mobile` が 1.x ベース。`@tauri-apps/api/tauri` → `@tauri-apps/api/core`、`/dialog`・`/fs`・`/updater` はプラグイン化 | 全コード書き換え |
| Capacitor | 6.x | ⚠️ `@capacitor/storage` が `@capacitor/preferences` に改名済み | 該当例の差し替え |
| Apollo Client | 3.x | 🔴 `WebSocketLink` は 3.7 で removed、現行は `GraphQLWsLink` + `graphql-ws` | 全 GraphQL 例を更新 |
| urql | v4 | 🔴 `defaultExchanges` 削除、`cacheExchange`/`fetchExchange` 個別指定 | コード更新 |
| Firebase Web SDK | v12 | ✅ ほぼ最新と整合 | OK（軽微） |
| Supabase JS | v2.40+ | ✅ 整合 / ⚠️ Edge Functions の `serve` インポートが古い（Deno.serve 推奨） | 軽微更新 |
| `@vercel/otel` | 現行は `registerOTel({ ... })` | ⚠️ `optimization/observability` で `initOpenTelemetry` 表記 | 修正 |
| `vite-plugin-imagemin` | メンテ停滞 | ⚠️ `build-optimization` で主推奨 | `@sveltejs/enhanced-img` を主軸に書き換え |
| `enhanced:img` プラグイン | `@sveltejs/enhanced-img` | 🔴 言及なし | `optimization/build-optimization` と `kit/images` 紹介 |
| Pagefind | v1.5+ | 🔴 本サイトが使用しているのに最適化記事で言及なし | `optimization` 系に追加 |
| `@vite-pwa/sveltekit` | 1.1+ | 🔴 本サイトが採用しているのに `pwa` 記事は素の `$service-worker` 主軸 | 全面書き換え推奨 |
| `marked` | v16 | ✅ 整合 | OK |
| Prism.js | v1.30 | ⚠️ Shiki が SvelteKit エコシステムで主流 | 注記追加 |
| `jose` | v5 | ⚠️ `auth-jwt` で型推論が厳密化されている点（`Date`/秒数指定）に追従が必要 | 軽微 |

### 1.6 Core Web Vitals 指標の更新

**FID（First Input Delay）は 2024-03 に Core Web Vitals から外れ、INP（Interaction to Next Paint）に置き換わっている**。

#### 該当ファイル

- `src/routes/sveltekit/optimization/+page.md`
- `src/routes/sveltekit/optimization/build-optimization/+page.md`
- `src/routes/sveltekit/optimization/caching/+page.md`
- `src/routes/sveltekit/optimization/performance/+page.md`（stub）

FID 表記を INP に統一し、`web-vitals` パッケージのバージョン（v4 で `onINP` を export）を反映。

### 1.7 機械検出された Runes 違反コード

`svelte-autofixer` に通せば検出される、**実行時に動かない／挙動が違うコード**。

| ファイル | 行 | 問題 | 修正案 |
| --- | --- | --- | --- |
| `svelte/runes/state/+page.md` | L818–836 | `$state(new Map())`、`$state(new Set())`、`$state(new Date())`、`$state(new URL())` | `SvelteMap` 等を直接使用（`$state` ラップ不要） |
| `svelte/advanced/built-in-classes/+page.md` | 複数 | 同上の二重ラップ多数、`any` 多用、`each` キー欠落 | 同上 |
| `svelte/advanced/reactivity-window/+page.md` | 複数 | `$derived(() => ...)` が 6 箇所以上。**実行時に関数オブジェクトが表示される** | `$derived.by(() => ...)` に置換 |
| `svelte/advanced/component-patterns/+page.md` | 複数 | `<script lang="ts" context="module">` deprecated 構文 | `<script module lang="ts">` |
| `svelte/runes/effect/+page.md` | L488 | `import { Suspense } from 'svelte'`（**存在しない**） | import を削除（`<svelte:boundary>` で完結） |
| `svelte/runes/props/+page.md` | L47/L142–156/L933 | `$props<T>()` ジェネリック構文、`generics="T"` 欠落 | `let { ... }: Props = $props()` + `<script lang="ts" generics="T">` |
| `svelte/basics/motion/+page.md` | L673 | `$:` ステートメント（Runes モードでコンパイルエラー） | `get()` / `$derived` |
| `svelte/runes/comparison/+page.md` | L451 | Vue 比較で `@event → on:event`（逆向きの誤記） | `@event → onevent` |
| `svelte/basics/attachments/+page.md` | L137–155 | `:::tip` と `<Admonition>` の混在でネスト破綻 | どちらかに統一 |
| `svelte/basics/transitions/+page.md` | L1011 | `|local` の説明が逆向き（Svelte 5 はデフォルトが local） | 説明再構築 |
| `svelte/basics/special-elements/+page.md` | L308 | `<svelte:options accessors>`（Runes モード廃止） | Note 追加 |
| `sveltekit/optimization/build-optimization/+page.md` | 複数 | `<svelte:component this={X}/>` deprecated、`let isLoading = true`（`$state` 未宣言） | runes 化 |
| `sveltekit/optimization/seo/+page.md` | 複数 | `const jsonLd = { ...data.post... }`（`state_referenced_locally` 警告 7 件） | `const jsonLd = $derived({ ... })` |
| `sveltekit/optimization/caching/+page.md` | L139–142 | **`manifest.json` 内に frontmatter `description` 文字列が混入**（記事破損） | 削除 |
| `deep-dive/auto-generated-types/+page.md` | L436 | コードブロック内に frontmatter `description:` が混入 | 削除 |
| `examples/auth-cookie-session/+page.md` | L530–533 | `catch (error)` で `error?.status` を unknown 型に対し参照（TS strict エラー） | `error: unknown` + `isRedirect(error)` ガード |
| `introduction/typescript-setup/+page.md` | L482 | `npm run svelte-kit sync` は **動作しないコマンド**。`scripts` に `"svelte-kit"` という名前のエントリは存在せず `npm ERR! missing script` になる | `npx svelte-kit sync` または `npm run prepare`（package.json の `"prepare": "svelte-kit sync"` 経由）。直下の L485 は `pnpm exec svelte-kit sync` で正しい |
| `introduction/cli/+page.md` | L48 | `pnpx sv <command>` は **pnpm v6.13 で削除された旧エイリアス**。最新 pnpm では使えないか deprecation 警告 | `pnpm dlx sv <command>` または `pnpm exec sv <command>`。`bun x sv` / `deno run -A npm:sv-cli` の追加候補 |
| `introduction/cli/+page.md` | L81–88（`sv create` 表） | 公式オプション欠落：`--from-playground <url>`（本文 L148 で使用例があるのに表に無い）、`--no-add-ons`、`--no-dir-check`。`--install <pm>` の値列挙（`npm | pnpm | yarn | bun | deno`）も欠落 | 3 行追加 |
| `introduction/cli/+page.md` | L173–179（`sv add` 表） | **`--no-download-check` が欠落** — L241 の Admonition で名前だけ出てくるが定義なし。表との不整合 | 行追加 |
| `introduction/cli/+page.md` | L279–286（`sv check` 表） | 公式オプション欠落：`--preserveWatchOutput`、`--no-tsconfig`、`--threshold <level>`（`warning | error`）。`--output` の値も `human-verbose` と `machine-verbose` が欠落 | 表拡張 |
| `introduction/cli/+page.md` | L324–330 | マシンリーダブル出力例の `COMPLETED` 行に **`FILES_WITH_PROBLEMS` フィールドが欠落**。公式は `COMPLETED 20 FILES 21 ERRORS 1 WARNINGS 3 FILES_WITH_PROBLEMS` | フィールド追加 |
| `introduction/cli/+page.md` | L491–494 | `--ignore` の落とし穴説明欠落：`--no-tsconfig` 併用時のみ「診断対象」に効く、`--tsconfig` ありなら「ウォッチ対象」のみ。`node_modules` は既定で除外されるので明示は冗長 | 注記追加 |
| `introduction/cli/+page.md` | L439 / L470–480 | 内部不整合：実践ワークフローで `npm run test` を呼ぶが `package.json scripts` 例に `"test"` が**未定義**。コピペで `npm ERR! Missing script: test` | `"test": "vitest"` 追加、または `npx vitest` に変更 |
| `introduction/cli/+page.md` | L470–480 | `package.json scripts` 例に **`"prepare": "svelte-kit sync"` が欠落**。公式 `sv create` 生成物には `"prepare": "svelte-kit sync || echo ''"` が含まれ、本プロジェクト自身も採用済み。`npm install` 後の自動 sync が動かない | `"prepare"` 行追加 |

### 1.8 リンク切れ・誤参照

| ファイル | 問題 | 修正 |
| --- | --- | --- |
| `sveltekit/deployment/execution-environments/+page.md` | 末尾「次のステップ」が `/sveltekit/architecture/build-optimization/`（存在しない） | `/sveltekit/optimization/build-optimization/` に修正 |
| `svelte/basics/actions/+page.md` | L687–688 公式 URL が旧構造 | `https://svelte.dev/docs/svelte/use` 等の新 URL |
| 認証系全般 | `kit.svelte.dev/docs/...` リンク多数 | `svelte.dev/docs/kit/...` に置換 |

### 1.9 `$app/state` セマンティクスの誤解

`updated` は `{ get current(): boolean; check(): Promise<boolean> }` 型のオブジェクト。`navigating` も常に存在するオブジェクト（ナビ中以外は `from`/`to`/`type` が `null`）。

| ファイル | 問題 | 修正 |
| --- | --- | --- |
| `sveltekit/basics/app-modules/+page.md` L222–240 | `if (updated)` は常に真 / `{#if navigating}` は常に真 | `if (updated.current)` / `{#if navigating.from}` |

### 1.10 「準備中」スタブの整理

| ファイル | 状態 | 推奨 |
| --- | --- | --- |
| `src/routes/examples/data-fetching/+page.md` | 1 行のみ。description は具体内容を約束 | 骨子作成 or ハブ側で「準備中」明示し description 控えめに |
| `src/routes/examples/websocket/+page.md` | 同上 | 同上（SSE 含む 4 パターン比較表だけでも開始） |
| `src/routes/sveltekit/optimization/performance/+page.md` | チェックボックスのみ | 骨子作成 |
| `src/routes/sveltekit/deployment/monitoring/+page.md` | 同上 | 骨子作成 |
| `src/routes/sveltekit/deployment/platforms/+page.md` | 「準備中」1 行 | **ハブ主役なので最優先で骨子作成**。adapter-static + GitHub Pages のケーススタディから |
| `src/routes/sveltekit/deployment/security/+page.md` | 同上 | `kit.csp` / `kit.csrf.trustedOrigins` / `handle` hook ヘッダー設定の骨子作成 |
| `src/routes/sveltekit/application/authentication/+page.md` | 薄い | Better Auth / Auth.js / Lucia の比較表 |
| `src/routes/sveltekit/application/database/+page.md` | 同上 | Drizzle / Prisma / Remote Functions 連携 |

---

## 2. 優先度別アクションプラン

### 🔴 即時修正（高優先度・実害あり）

#### 安全性・正確性に関わるもの

1. **`throw redirect/error` 全廃** — SvelteKit 2 違反。コピペで非推奨警告/エラーが出る可能性。8 章 30+ 箇所一括修正。
2. **`updated`/`navigating` の使い方修正**（`sveltekit/basics/app-modules`） — 論理的に常に真になる判定バグ。
3. **`prefetch`/`prefetchRoutes` を `preloadData`/`preloadCode` に置換**（`routing/advanced`、`data-loading/flow`） — `$app/navigation` から該当 export なし、import 解決失敗。
4. **`data-sveltekit-preload-data` の不正値** `"eager"`、`"off"` を正規値（`"hover"` / `"tap"` / `"false"`）に修正（`routing/basic`、`data-loading/flow`）。
5. **`runes/state` の `new Map/Set/Date/URL` 二重ラップ修正** — `SvelteMap` 等を直接使用。
6. **`advanced/reactivity-window` の `$derived(() => ...)` 全置換** — 実行時に関数表示になる。`$derived.by(() => ...)`。
7. **`runes/effect` L488 の `import { Suspense } from 'svelte'` 削除** — 存在しない import。
8. **`runes/comparison` L451 の Vue 比較誤記** — `on:event` → `onevent`。
9. **`runes/props` のジェネリック例コンパイル不能修正** — `<script lang="ts" generics="T">` を追加、`$props<T>()` を `: Props = $props()` に。
10. **`basics/motion` L673 の `$:` 除去** — Runes モードでコンパイルエラー。
11. **`basics/attachments` L137–155 の Admonition ネスト破綻修正**。
12. **`optimization/caching` の `manifest.json` 内 frontmatter 混入削除** — 記事テキスト破損。
13. **`deep-dive/auto-generated-types` L436 の `description:` 混入削除** — 同上。
14. **`reference/sveltekit2` の `handleValidationError` 誤シグネチャ修正** — `event.issues` → `{ event, issues }`。
14a. **`introduction/typescript-setup` L482 の `npm run svelte-kit sync` 修正** — 動作しないコマンド（`scripts` に該当エントリなし）。`npx svelte-kit sync` または `npm run prepare` に置換。
14b. **`introduction/cli` L48 の `pnpx sv` 修正** — pnpm v6.13 で削除された旧エイリアス。`pnpm dlx sv` に置換。
14c. **`introduction/cli` 各オプション表の補完** — `sv create` に 3 オプション、`sv add` に `--no-download-check`（L241 と整合化）、`sv check` に 3 オプションと `--output` の値 2 種を追加。
14d. **`introduction/cli` の `package.json scripts` 例の修正** — L470–480 に `"test": "vitest"` と `"prepare": "svelte-kit sync"` を追加（実践ワークフローと整合化）。
15. **`examples/auth-jwt` 状態表記の整合** — 「準備中」を「✅ 完成」に。CLAUDE.md と揃える。デモ URL 反映。
16. **Tauri 1.x → 2.x への全コード更新**（`architecture/desktop-mobile`） — `@tauri-apps/api/core`、`@tauri-apps/plugin-*`。コピペで `npm install` 後に解決不能。
17. **Apollo `WebSocketLink` / urql `defaultExchanges` 撤去**（`architecture/spa-patterns/graphql`） — 同上、ビルド時 import エラー。

#### CLI / Setup（新規読者の最初の体験）

18. **`introduction/setup/+page.md` の全面更新** — `lucia` → `better-auth`、`npm create svelte@latest` 削除、Svelte 5.55 / SvelteKit 2.58 / Vite 8 / TS 6 / `@sveltejs/vite-plugin-svelte` 7 への更新、対話プロンプト例を最新 `sv create` に。
19. **`introduction/hello-world/+page.md` 順序見直し** — Svelte 5 を先、レガシー例には `:::caution` で警告。

### 🟠 中優先度（次回リファクタリング）

#### Remote Functions の充実

20. **`sveltekit/server/remote-functions/+page.md` の徹底拡充**
    - `requested()` の戻り値 `{ arg, query }` 正しいイテレーションパターン、`requested().refreshAll()` 短縮形
    - `enhance` の `await submit()` boolean 戻り値で「バリデーション失敗 vs ネットワークエラー」を区別する正しいパターン
    - `query.live`（リアルタイム/AsyncIterable）独立節
    - `query.batch` と `reconnect()` の連動
    - `form.fields.*.as()`, `enhance`, `for`, `preflight`, `result`, `invalid`, `'unchecked'`, `withOverride`, `.run()` の全 API
    - `submit().updates(...)` と optimistic UI
    - `transport` hook との連携（カスタム型シリアライズ）
    - experimental フラグ `compilerOptions.experimental.async` + `kit.experimental.remoteFunctions` の opt-in 手順

21. **`reference/sveltekit2/+page.md` の Remote Functions テーブル拡充**
    - 上記 API すべてをテーブルに反映
    - `query.live`、`form.fields`、`enhance`、`preflight`、`invalid`、`withOverride`、`requested().refreshAll()`

#### Hooks の Universal hooks 追加

22. **`sveltekit/server/hooks/+page.md`** に Server / Client / **Universal** の 3 系統セクション
    - `hooks.ts` の `reroute`（2.18+ async）、`transport`、`init`
    - `handleValidationError` の引数 `{ event, issues }` 明示
    - `event.tracing.root` / `event.tracing.current`（2.31+）

#### Svelte 5 重要 API 追加

23. **`svelte/runes/inspect/+page.md` に `$inspect.trace()` セクション追加**（debugging の中核 API）
24. **`<svelte:boundary>` 独立解説の追加**（`special-elements` の中ではなく、専用節 or 専用ページ）
25. **Function bindings の解説追加**（`runes/bindable`、`deep-dive/reactive-state-variables-vs-bindings`、`deep-dive/derived-vs-effect-vs-derived-by`）
26. **`{@attach}` を `basics/actions` の冒頭で「新規推奨」明示**、`fromAction` の移行パスも併記
27. **`reference/svelte5/+page.md`** に `$inspect.trace`、`<svelte:boundary>`、Function bindings、`<svelte:options customElement={{ ... }}>`、`fork`/`settled`、await expressions の opt-in 手順 を追加

#### コンポーネント・ライフサイクル

28. **`basics/component-lifecycle/+page.md`**
    - L262 の `onMount(() => async () => ...)` 修正（非同期クリーンアップは無視される）
    - `$effect.root` 例の戻り値修正
    - L326–346 のページ途中 `<script>` を先頭に統合

29. **`basics/special-elements/+page.md`**
    - `<svelte:window>` 例に `svelte/reactivity/window` の代替提示
    - `<svelte:options accessors>` を Runes モード legacy と明記
    - `<svelte:component>` の Runes での非推奨化を明示
    - `<svelte:document>` の `fullscreenElement` 型不整合修正

30. **`basics/transitions/+page.md`** L1011 の `|local` 説明逆転を修正

#### TypeScript / 型

31. **`deep-dive/auto-generated-types/+page.md`**
    - L436 の混入バグ修正（緊急）
    - マッピング表に `PageProps`/`LayoutProps` を追加
    - `$app/types`（`RouteId`、`RouteParams<R>`、`Pathname`、`ResolvedPathname`、`Asset`、`LayoutParams<R>`）の節を新設

32. **`introduction/typescript-setup/+page.md`**
    - `verbatimModuleSyntax: true`、`erasableSyntaxOnly`、`isolatedModules` の TS 6 系新オプション
    - VS Code ESLint `"source.fixAll.eslint": "explicit"` に修正
    - GitHub Actions の `actions/*@v3` を `@v4` に

#### state-management の SSR 安全性

33. **`sveltekit/application/state-management/+page.md`**
    - `export const cart = new CartStore();` を「SSR アンチパターン」として明示警告
    - Context API + setContext のリクエストスコープパターンを推奨

34. **`sveltekit/application/session/+page.md`** の `svelte/store` ベース実装を Svelte 5 Runes（`.svelte.ts`）に書き換え

#### PWA / 最適化（プロジェクト自身の差別化要素）

35. **`sveltekit/optimization/pwa/+page.md` を本プロジェクトの `vite.config.js` ベースに刷新**
    - `@vite-pwa/sveltekit` 1.1+ の全像
    - `virtual:pwa-register` / `workbox-window` / `PwaUpdatePrompt.svelte` 連携
    - `registerType: 'prompt'`、`manifestTransforms` の trailingSlash 付与、`globPatterns: prerendered/**/*.html` 戦略
    - dev サーバでの SW 有効化と HMR 干渉
    - `clientsClaim: false` / `skipWaiting: false` の UX 設計判断

36. **`sveltekit/optimization/build-optimization/+page.md`**
    - `<svelte:component>` 修正、`$state` 化
    - `@sveltejs/enhanced-img` を主軸に書き換え
    - `adapter-node` / `adapter-static` の `precompress: true`
    - `kit.output.bundleStrategy` の解説
    - `vite-plugin-imagemin` は補足扱いに

37. **`sveltekit/optimization/seo/+page.md`**
    - JSON-LD を `$derived` で包む
    - `paths.base` を含む canonical / sitemap / OGP URL 組み立て（本プロジェクト実装を引用）
    - `trailingSlash: 'always'` 設定下での canonical URL 整合

38. **Core Web Vitals 一斉更新** — FID → INP

#### Adapter 系（execution-environments）

39. **`sveltekit/deployment/execution-environments/+page.md`**
    - Vercel runtime: `'nodejs18.x'` → `'nodejs20.x'`/`'nodejs22.x'`、`runtime` オプション自体の deprecation
    - Cloudflare Workers Static Assets、`adapter-cloudflare-workers` 廃止経緯
    - `adapter-node` 5.x の graceful shutdown、`sveltekit:shutdown` イベント
    - `kit/writing-adapters` の `supports.read`/`supports.instrumentation`/`emulate` API
    - リンク切れ修正

### 🟢 低優先度（軽微・任意）

40. **`runes/+page.md` ハブの Runes 表** に `$inspect.trace`、`$effect.pending`、`$state.eager` 追記
41. **`basics/+page.md` ハブカード** に attachments、boundary 追加
42. **`introduction/+page.md` ハブ** に「CLI tools」「ESLint/Prettier」カード追加（学習パス 6→8 項目）
43. **`svelte-mcp/setup` と `svelte-mcp/+page.md`** に Copilot CLI セットアップ手順追加
44. **`svelte-mcp/tools/+page.md`** の `svelte-autofixer` 出力 JSON に `require_another_tool_call_after_fixing` フィールド追加、`get - documentation` / `playground - link` の整形崩れ修正
45. **`svelte-mcp/usecases/+page.md`** の `$state.frozen()` を `$state.raw()` に
46. **`svelte-mcp/ecosystem/+page.md`** に公式の Svelte Plugin（Claude Code Marketplace）、Subagent、Skills を追加
47. **`introduction/why-svelte`** のパフォーマンス数値・成功事例の出典明示 or トーンダウン、`<script>` に `lang="ts"` 追加
48. **`reactive-stores` 冒頭** に「`svelte/store` は新規実装で非推奨、`$state` ベースを優先」と強い明示
49. **`reference/sveltekit2`** に `kit.router.resolution`、`kit.output.bundleStrategy`、`csrf.trustedOrigins`、`$app/types` のテーブル追加
50. **`Snippets` 関連** に `<script module>` 経由のエクスポート、`createRawSnippet` の追記

---

## 3. セクション別・サマリ表

### 第1部 introduction（8 本）

| ファイル | 評価 | 主要課題 |
| --- | --- | --- |
| `introduction/+page.md` | ⚠️ | カード欠落（CLI / ESLint-Prettier） |
| `introduction/cli/+page.md` | ⚠️ | **L48 `pnpx sv` 非推奨**、各オプション表に欠落多数（`--no-download-check` 等）、出力例の `FILES_WITH_PROBLEMS` 欠落、`package.json scripts` 例で `test`/`prepare` 不整合 |
| `introduction/eslint-prettier/+page.md` | ✅ | OK（範例） |
| `introduction/hello-world/+page.md` | ⚠️ | レガシー例の順序 |
| `introduction/setup/+page.md` | 🔴 | **lucia、Vite 5、TS 5.5、npm create svelte** |
| `introduction/typescript-setup/+page.md` | ⚠️ | TS 6 新オプション欠落、GH Actions v3、**L482 `npm run svelte-kit sync` は動作しないコマンド** |
| `introduction/why-svelte/+page.md` | ⚠️ | 数値出典なし、`lang="ts"` 漏れ |
| `introduction/why-typescript/+page.md` | ✅ | OK |

### 第2部 svelte/basics（12 本）

| ファイル | 評価 | 主要課題 |
| --- | --- | --- |
| `svelte/basics/+page.md` | ✅ | カード追加候補 |
| `svelte/basics/actions/+page.md` | 🟠 | `{@attach}` 主役化、`Action` 型 |
| `svelte/basics/attachments/+page.md` | 🔴 | Admonition ネスト破綻 |
| `svelte/basics/component-basics/+page.md` | ⚠️ | TS strict 型 |
| `svelte/basics/component-lifecycle/+page.md` | 🟠 | `onMount` async return、`$effect.root` |
| `svelte/basics/easing/+page.md` | ✅ | OK |
| `svelte/basics/events-module/+page.md` | ✅ | OK |
| `svelte/basics/motion/+page.md` | ⚠️ | `$:` 残存、`prefersReducedMotion` の動的反映 |
| `svelte/basics/special-elements/+page.md` | 🟠 | `accessors` legacy、`<svelte:window>` 代替 |
| `svelte/basics/template-syntax/+page.md` | ⚠️ | 軽微 |
| `svelte/basics/transitions/+page.md` | ⚠️ | `|local` 説明逆転 |
| `svelte/basics/typescript-integration/+page.md` | ⚠️ | 軽微 |

### 第2部 svelte/runes（10 本）

| ファイル | 評価 | 主要課題 |
| --- | --- | --- |
| `svelte/runes/+page.md` | ✅ | 表に新規 rune 追加候補 |
| `svelte/runes/bindable/+page.md` | ⚠️ | Function bindings 欠落 |
| `svelte/runes/comparison/+page.md` | 🟠 | **L451 Vue 比較誤記** |
| `svelte/runes/derived/+page.md` | ✅ | OK |
| `svelte/runes/effect/+page.md` | ⚠️ | **`Suspense` 偽 import** |
| `svelte/runes/host/+page.md` | ✅ | OK |
| `svelte/runes/inspect/+page.md` | ⚠️ | **`$inspect.trace` 欠落**、stores 混入 |
| `svelte/runes/props/+page.md` | 🟠 | **`generics="T"` 欠落、`$props<T>()` 構文** |
| `svelte/runes/runes-introduction/+page.md` | ✅ | OK |
| `svelte/runes/state/+page.md` | ✅ | **L818 ビルトイン例の二重ラップ** |

### 第2部 svelte/advanced（11 本）

| ファイル | 評価 | 主要課題 |
| --- | --- | --- |
| `svelte/advanced/+page.md` | ✅ | カード追加候補 |
| `svelte/advanced/await-expressions/+page.md` | ⚠️ | `svelte.config.js` 型注釈誤り |
| `svelte/advanced/built-in-classes/+page.md` | 🟠 | `$state` 二重ラップ、`any` |
| `svelte/advanced/class-reactivity/+page.md` | ⚠️ | FAQ 誤情報 |
| `svelte/advanced/component-patterns/+page.md` | 🔴 | `context="module"` 残存、`state_referenced_locally` |
| `svelte/advanced/hydratable/+page.md` | ⚠️ | ジェネリクス表記検証要 |
| `svelte/advanced/reactive-stores/+page.md` | ⚠️ | 動かないコード例、legacy 明示不足 |
| `svelte/advanced/reactivity-window/+page.md` | 🔴 | **`$derived(() => ...)` 6箇所以上** |
| `svelte/advanced/script-context/+page.md` | ⚠️ | `<script module>` での `load` 廃止 |
| `svelte/advanced/snippets/+page.md` | ⚠️ | `<script module>` export、`createRawSnippet` 欠落 |
| `svelte/advanced/typescript-patterns/+page.md` | ⚠️ | SvelteSet 推奨、設計問題 |

### 第2部 svelte/architecture（7 本）

| ファイル | 評価 | 主要課題 |
| --- | --- | --- |
| `svelte/architecture/+page.md` | ✅ | OK |
| `svelte/architecture/desktop-mobile/+page.md` | 🔴 | **Tauri 1.x、Capacitor `Storage`** |
| `svelte/architecture/hybrid-integration/+page.md` | ✅ | スタブ継続 OK |
| `svelte/architecture/spa-patterns/+page.md` | ⚠️ | `svelte-spa-router` メンテ懸念、`adapter-static` SPA 言及不足 |
| `svelte/architecture/spa-patterns/firebase/+page.md` | ⚠️ | Persistence 言及なし |
| `svelte/architecture/spa-patterns/graphql/+page.md` | 🟠 | **Apollo WebSocketLink、urql defaultExchanges** |
| `svelte/architecture/spa-patterns/supabase/+page.md` | ✅ | 軽微 |

### 第3部 sveltekit/basics（7 本）

| ファイル | 評価 | 主要課題 |
| --- | --- | --- |
| `sveltekit/basics/+page.md` | ✅ | `$app/types`/`$app/server` 言及追加 |
| `sveltekit/basics/app-modules/+page.md` | 🟠 | **`updated`/`navigating` セマンティクス誤り、`refreshAll` 欠落** |
| `sveltekit/basics/file-system/+page.md` | ⚠️ | `throw redirect/error`、`(app)@/` 古表記 |
| `sveltekit/basics/global-types/+page.md` | ✅ | 軽微 |
| `sveltekit/basics/overview/+page.md` | ⚠️ | `fetch` 拡張機能の詳細不足 |
| `sveltekit/basics/project-structure/+page.md` | ⚠️ | `npm create svelte`、`adapter-static` 出力先 |
| `sveltekit/basics/rendering-strategies/+page.md` | ✅ | ISR 言及不足 |

### 第3部 sveltekit/routing（7 本）

| ファイル | 評価 | 主要課題 |
| --- | --- | --- |
| `sveltekit/routing/+page.md` | ✅ | OK |
| `sveltekit/routing/basic/+page.md` | ⚠️ | **`preload-data="eager"` 不正値** |
| `sveltekit/routing/dynamic/+page.md` | ⚠️ | `throw error` 多数 |
| `sveltekit/routing/advanced/+page.md` | 🟠 | **`prefetch`/`prefetchRoutes` 廃止 API** |
| `sveltekit/routing/error-pages/+page.md` | ✅ | `isHttpError`/`isRedirect` 追加候補 |
| `sveltekit/routing/link-options/+page.md` | ✅ | OK（範例） |
| `sveltekit/routing/shallow/+page.md` | ✅ | OK（範例） |

### 第3部 sveltekit/data-loading（7 本）

| ファイル | 評価 | 主要課題 |
| --- | --- | --- |
| `sveltekit/data-loading/+page.md` | ✅ | Remote Functions 言及候補 |
| `sveltekit/data-loading/basic/+page.md` | ⚠️ | `process.env` ＞ `$env/*`、`getRequestEvent` 欠落 |
| `sveltekit/data-loading/flow/+page.md` | 🟠 | **`prefetch`/`prefetchRoutes` 廃止、`preload-data="off"` 不正値** |
| `sveltekit/data-loading/spa-invalidation/+page.md` | ✅ | OK |
| `sveltekit/data-loading/strategies/+page.md` | ⚠️ | SSE `cancel` 改善 |
| `sveltekit/data-loading/streaming/+page.md` | ⚠️ | トップレベル promise 自動ストリーミング欠落 |
| `sveltekit/data-loading/typescript-types/+page.md` | ✅ | `getRequestEvent` 言及候補 |

### 第3部 sveltekit/architecture（10 本）

| ファイル | 評価 | 主要課題 |
| --- | --- | --- |
| `sveltekit/architecture/+page.md` | ✅ | observability 相互参照 |
| `sveltekit/architecture/access-logs/+page.md` | ✅ | OpenTelemetry 言及候補 |
| `sveltekit/architecture/build-optimization/+page.md` | ✅ | 軽微 |
| `sveltekit/architecture/data-loading/+page.md` | ⚠️ | Remote Functions 連携言及 |
| `sveltekit/architecture/file-structure/+page.md` | ✅ | `.remote.ts`、`hooks.ts` 欠落 |
| `sveltekit/architecture/hydration/+page.md` | ✅ | Remote Functions hydration 言及候補 |
| `sveltekit/architecture/rendering-pipeline/+page.md` | ✅ | `await` expressions 言及 |
| `sveltekit/architecture/rendering-strategies/+page.md` | ✅ | Remote prerender 言及 |
| `sveltekit/architecture/routing-internals/+page.md` | ✅ | スタブ。`reroute` async 言及 |
| `sveltekit/architecture/spa-mpa-hybrid/+page.md` | 🟠 | **`throw redirect`** |

### 第3部 sveltekit/server（8 本）

| ファイル | 評価 | 主要課題 |
| --- | --- | --- |
| `sveltekit/server/+page.md` | ⚠️ | `prerender` カード追加 |
| `sveltekit/server/api-routes/+page.md` | 🟠 | **`throw error` 12 箇所** |
| `sveltekit/server/forms/+page.md` | 🟠 | **`throw redirect/error`**、Remote Functions 比較欠落 |
| `sveltekit/server/hooks/+page.md` | 🟠 | **Universal hooks 欠落、`reroute`/`transport`/`init`** |
| `sveltekit/server/remote-functions/+page.md` | 🔴 | **`requested()` 戻り値誤り、`enhance` submit boolean 誤り、`query.live`/field API 大量欠落** |
| `sveltekit/server/server-only-modules/+page.md` | ✅ | `$app/server` 追加 |
| `sveltekit/server/server-side/+page.md` | ⚠️ | `.remote.ts` 欠落、`$env` 優先化 |
| `sveltekit/server/websocket-sse/+page.md` | ⚠️ | Remote Functions `query.live` 比較、adapter-node カスタムサーバー |

### 第3部 sveltekit/application（10 本）

| ファイル | 評価 | 主要課題 |
| --- | --- | --- |
| `sveltekit/application/+page.md` | ✅ | 学習順序に `snapshots` |
| `sveltekit/application/auth-best-practices/+page.md` | 🟠 | **`throw redirect/error` 11 箇所、Better Auth** |
| `sveltekit/application/authentication/+page.md` | ⚠️ | スタブ。Better Auth/Auth.js/Lucia 比較追加 |
| `sveltekit/application/database/+page.md` | ⚠️ | スタブ。Drizzle 紹介 |
| `sveltekit/application/environment/+page.md` | ✅ | `publicPrefix`/`privatePrefix` 言及 |
| `sveltekit/application/error-handling/+page.md` | ✅ | `isHttpError`/`isRedirect` 補足 |
| `sveltekit/application/session/+page.md` | 🟠 | **`throw redirect`、`svelte/store` 残存** |
| `sveltekit/application/snapshots/+page.md` | ✅ | OK |
| `sveltekit/application/state-management/+page.md` | ⚠️ | **SSR shared-state アンチパターン警告欠落** |
| `sveltekit/application/testing/+page.md` | ✅ | Remote Functions テスト戦略追加 |

### 第3部 sveltekit/optimization（7 本）

| ファイル | 評価 | 主要課題 |
| --- | --- | --- |
| `sveltekit/optimization/+page.md` | 🟠 | **FID→INP**、page-option config 誤用 |
| `sveltekit/optimization/build-optimization/+page.md` | 🟠 | **`<svelte:component>`、`$state` 未宣言、enhanced:img 欠落** |
| `sveltekit/optimization/caching/+page.md` | 🟠 | **manifest 内テキスト破損、`platform.context.waitUntil` 誤り** |
| `sveltekit/optimization/observability/+page.md` | ✅ | `@vercel/otel` API 修正 |
| `sveltekit/optimization/performance/+page.md` | 🔴 | スタブ |
| `sveltekit/optimization/pwa/+page.md` | 🟠 | **本プロジェクト実装と乖離（@vite-pwa/sveltekit 未活用）** |
| `sveltekit/optimization/seo/+page.md` | 🟠 | JSON-LD `state_referenced_locally` 7 件 |

### 第3部 sveltekit/deployment（6 本）

| ファイル | 評価 | 主要課題 |
| --- | --- | --- |
| `sveltekit/deployment/+page.md` | 🟠 | `monitoring` export 疑似コード、SvelteKit 固有セキュリティ欠落 |
| `sveltekit/deployment/execution-environments/+page.md` | 🟠 | **`runtime: 'nodejs18.x'`、Cloudflare Workers Static Assets 欠落、リンク切れ** |
| `sveltekit/deployment/monitoring/+page.md` | 🔴 | スタブ |
| `sveltekit/deployment/packaging/+page.md` | ✅ | OK |
| `sveltekit/deployment/platforms/+page.md` | 🔴 | **スタブ。ハブ主役なので最優先** |
| `sveltekit/deployment/security/+page.md` | 🔴 | **スタブ。`csp.mode`/`csrf.trustedOrigins`** |

### 第4部 examples（10 本）

| ファイル | 評価 | 主要課題 |
| --- | --- | --- |
| `examples/+page.md` | ⚠️ | リンク漏れ、状態表記ブレ |
| `examples/auth-cookie-session/+page.md` | 🟠 | **`throw redirect`、unknown 型** |
| `examples/auth-jwt/+page.md` | 🟠 | **`throw redirect`、localStorage 自己矛盾、状態表記古い** |
| `examples/auth-route-groups/+page.md` | 🟠 | **動的ルートグループ仕様誤解、日付古い** |
| `examples/auth-system/+page.md` | ⚠️ | **`throw redirect`、sameSite ブレ** |
| `examples/blog-system/+page.md` | ⚠️ | 軽微 |
| `examples/data-fetching/+page.md` | 🔴 | スタブ |
| `examples/markdown-blog/+page.md` | ⚠️ | mdsvex 比較欠落 |
| `examples/todo-app/+page.md` | ⚠️ | SSR 注記不足、autofocus a11y |
| `examples/websocket/+page.md` | 🔴 | スタブ |

### 第5部 reference（3 本）

| ファイル | 評価 | 主要課題 |
| --- | --- | --- |
| `reference/+page.md` | ✅ | experimental 注意一言 |
| `reference/svelte5/+page.md` | 🟠 | **`$inspect.trace`、`<svelte:boundary>`、Function bindings、customElement オブジェクト構文、await opt-in** |
| `reference/sveltekit2/+page.md` | ⚠️ | **Remote Functions field API、`query.live`、`router.resolution`、`transport`、`handleValidationError` 引数誤り** |

### 第6部 deep-dive（9 本）

| ファイル | 評価 | 主要課題 |
| --- | --- | --- |
| `deep-dive/+page.md` | ✅ | OK |
| `deep-dive/auto-generated-types/+page.md` | ⚠️ | **L436 混入バグ、`PageProps`/`$app/types` 欠落** |
| `deep-dive/compile-time-optimization/+page.md` | 🟠 | signal-based 説明欠落、`beforeUpdate`/`afterUpdate` legacy 明示なし |
| `deep-dive/derived-vs-effect-vs-derived-by/+page.md` | ⚠️ | **表記 `derived.by` → `$derived.by`**、overridable `$derived`、Function bindings、`$inspect.trace` |
| `deep-dive/html-templates-and-snippets/+page.md` | 🟠 | コンテンツ薄い、Snippet 型不足 |
| `deep-dive/reactive-state-variables-vs-bindings/+page.md` | ⚠️ | Function bindings、`$state` Proxy 欠落 |
| `deep-dive/reactivity-with-plain-javascript-syntax/+page.md` | ✅ | signal graph 補足 |
| `deep-dive/sveltekit-placeholders/+page.md` | ✅ | `transformPageChunk` boundary、`paths.relative` |
| `deep-dive/webcomponents-svelte-css-strategies/+page.md` | ⚠️ | **customElement オブジェクト構文、`$host()`、`$props<T>()` 表記** |

### svelte-mcp（8 本）

| ファイル | 評価 | 主要課題 |
| --- | --- | --- |
| `svelte-mcp/+page.md` | ✅ | Copilot CLI 欠落 |
| `svelte-mcp/architecture/+page.md` | ⚠️ | 推測ベース記述の明示 |
| `svelte-mcp/ecosystem/+page.md` | ⚠️ | Svelte Plugin/Subagent/Skills 欠落 |
| `svelte-mcp/eslint-integration/+page.md` | ✅ | OK（範例） |
| `svelte-mcp/integration/+page.md` | ✅ | 軽微 |
| `svelte-mcp/setup/+page.md` | ✅ | Copilot CLI 追加 |
| `svelte-mcp/tools/+page.md` | ✅ | JSON 整形崩れ、`require_another_tool_call_after_fixing` 欠落 |
| `svelte-mcp/usecases/+page.md` | ✅ | `$state.frozen` → `$state.raw` |

---

## 4. 新規追加候補ページ・節

最新仕様カバー率を高めるため、以下を**新規ページ**または**既存ページへの追加節**として検討する。

### Svelte 5 関連

1. **`svelte/advanced/boundary/`**（新規）— `<svelte:boundary>` 専用解説（`pending`/`failed`/`onerror`/`transformError`、async expressions 連携、SvelteKit `handleRenderingErrors` との関係）
2. **`svelte/advanced/reactivity-classes/`** または既存 `built-in-classes` 大幅刷新 — `SvelteMap`/`SvelteSet`/`SvelteDate`/`SvelteURL`/`SvelteURLSearchParams`/`MediaQuery`/`createSubscriber` の完全リファレンス
3. **`svelte/advanced/function-bindings/`**（新規）— `bind:value={() => getter, setter}` の活用パターン、`$effect` 同期アンチパターンとの対比
4. **`svelte/runes/inspect/` に `$inspect.trace()` 節追加**
5. **`svelte/advanced/snippets/` に `<script module>` export と `createRawSnippet` 節追加**

### SvelteKit 2.x 関連

6. **`sveltekit/server/remote-functions/` の全面拡充** — `query.live`、`form.fields` 全 API、`enhance`/`preflight`/`for`/`result`、`requested().refreshAll()`、`withOverride`、`.run()`、`'unchecked'`、experimental opt-in
7. **`sveltekit/server/hooks/` に Universal hooks 節追加** — `reroute`、`transport`、`init`
8. **`sveltekit/basics/app-types/`**（新規）— `$app/types` の `RouteId`/`RouteParams`/`Pathname`/`ResolvedPathname`/`Asset`/`LayoutParams` 詳解
9. **`sveltekit/optimization/router-strategies/`**（新規）— `kit.router.type`、`kit.router.resolution`、`kit.output.bundleStrategy`/`preloadStrategy`
10. **`deep-dive/svelte-signal-graph/`**（新規）— Svelte 5 のシグナルベース fine-grained reactivity の内部実装
11. **`sveltekit/deployment/adapter-static-github-pages/`**（新規 or `platforms/` 内）— 本サイトの GitHub Pages デプロイをケーススタディに

### エコシステム

12. **`sveltekit/application/auth-libraries/`**（新規 or `authentication/` 刷新）— Better Auth / Auth.js / Lucia の比較
13. **`sveltekit/optimization/pagefind-integration/`**（新規）— 本サイトの Pagefind 統合パターン

---

## 5. 機械化・CI 化提案

CLAUDE.md は「コード例は `svelte-autofixer` に通すこと」と明記しているが、今回検出された問題の多くは autofixer または ESLint で機械検出可能。以下を **GitHub Actions の CI ジョブ**に追加することで再発を抑制できる。

1. **`scripts/extract-and-check-code-blocks.ts`** — Markdown 内の ` ```svelte ` / ` ```svelte live ` コードブロックを抽出し、`svelte-autofixer`（MCP 経由 or 直接 ESLint）でバッチ検証
2. **`scripts/check-throw-redirect.sh`** — `grep -rE "throw (redirect|error)\(" src/routes/` で SvelteKit 2 違反を検出
3. **`scripts/check-legacy-svelte.sh`** — `grep -rE "(on:[a-z]+|export let|createEventDispatcher|<slot\\s*/>|\\\$:|context=\"module\")" src/routes/` で legacy 構文を検出
4. **`scripts/check-data-sveltekit-values.sh`** — `data-sveltekit-preload-data` の不正値（`eager`、`off`、`viewport`）を検出
5. **`scripts/check-prefetch.sh`** — `prefetch`/`prefetchRoutes` の使用検出
6. **`scripts/check-throw-redirect-not-in-comment.sh`** — Markdown のコードブロック内のみを対象に、コメント / 説明文の例外を除外

CLAUDE.md の `.claude/skills/svelte5-coding-standards/SKILL.md` に「記事 lint Skill」を追加し、CI と連動させる構成が望ましい。

---

## 6. 実装例リポジトリの整合性

| リポジトリ | 記事との整合 | 推奨アクション |
| --- | --- | --- |
| `svelte5-blog-example` | ✅ 良好 | OK |
| `svelte5-blog-markdown` | ✅ 良好 | OK |
| `svelte5-todo-example` | ⚠️ | 記事が一部省略過多。SSR 注記の追加 |
| `svelte5-auth-basic` | 🟠 | `+page.server.ts` の `throw redirect` を `redirect()` に移行（リポジトリ自体も）、`auth.ts` L128 の `maxAge` コメント「30日」と定数「7日」不一致を修正 |
| `svelte5-auth-jwt` | ❌ | 記事「準備中」表記を「✅ 完成」に修正、デモ URL を `https://svelte5-auth-jwt.vercel.app/` に反映 |
| `svelte5-auth-route-groups` | — | 開発中。記事の「2025年11月公開予定」を 2026 年表記に更新 |

---

## 7. 結論と次の一手

### コンテンツの強み（維持すべき部分）

- **Runes と `$app/state` / `PageProps` への移行は概ね完了**しており、Svelte 5 / SvelteKit 2 学習教材として国内屈指。
- `eslint-prettier`、`svelte-mcp/eslint-integration`、`svelte-mcp/setup`、`reference/`、`auto-generated-types` の TS 部分など、最新公式と完全整合している記事が多数。これらは他章のリファレンスにもなり得る。
- `$state.eager`、`$effect.pending`、`$state.snapshot`、`{@attach}` 専用ページ、Shallow Routing、Snapshots、`handleRenderingErrors` など最新仕様への追従が個別ページレベルでは進んでいる。

### 推奨着手順序

1. **第1スプリント（即時）**: 1.1 全 SvelteKit 2 違反一括修正 + 1.7 機械検出可能 Runes 違反修正 + `setup/+page.md` 全面更新 + 主要混入バグ（L436 / manifest L139-142 等）の修正。これで「コピペで動かない」コード混入を一掃。
2. **第2スプリント**: Remote Functions 拡充（`remote-functions` + `reference/sveltekit2`）と Universal hooks 追加（`server/hooks`）。Svelte 5.x 新 API のリファレンス反映（`$inspect.trace`、`<svelte:boundary>` 独立、Function bindings、customElement オブジェクト構文）。
3. **第3スプリント**: 「準備中」スタブの埋め込み（特に `deployment/platforms`、`deployment/security`、`examples/data-fetching`、`examples/websocket`）。
4. **第4スプリント**: エコシステム陳腐化対応（Tauri 2、Apollo/urql、Vercel runtime、`enhanced:img`、INP）。`pwa` 記事を本プロジェクト実装に整合。
5. **継続**: 機械化 CI 整備、`.claude/skills/` の Skill 拡張、deep-dive の思考モデル更新。

### 注意点

- 修正作業の前に **`CHANGELOG.md` に変更影響を記録**するルール（CLAUDE.md 参照）に従う。
- `sidebar.ts` の追記・並び替えを伴うページ追加・削除では、**ハブページのカード一覧と学習ロードマップ Mermaid 図のステップ番号を手動同期**する必要あり（CLAUDE.md「ハブページのカード一覧（手動管理）」セクション参照）。
- 各記事に Markdown フロントマターの `title` 35 文字以内制約あり（`SeoMeta.svelte` のサフィックス由来）。新規追加ページでは要遵守。
- 「:::」ディレクティブ記法と `<Admonition>` 直書きの使い分け（CLAUDE.md「情報の強調表示」セクション）に従う。

---

以上、2026-05-12 時点での全領域監査結果。次回作業セッションでは、本レポートの優先度高項目から着手することを推奨する。
