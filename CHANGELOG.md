# Changelog

このプロジェクトの主要な変更履歴を記録します。

## [2026-05-14] - 新規記事「AI コーディング支援のセットアップ」追加

### 概要

Svelte 5 移行期に AI コーディング支援（GitHub Copilot / Cursor / Claude Code）がレガシー構文（`on:click`、`$:`、`export let`、`<slot />` 等）を提案する問題への多層防御アプローチを解説する新規記事を `/introduction/ai-coding-setup/` に追加。フリーランス・業務エンジニア読者層への訴求を狙う。

### 追加・変更ファイル

- **新規**: `src/routes/introduction/ai-coding-setup/+page.md`
  - 第一防衛線: `.github/instructions/*.instructions.md`（`applyTo` 付き）のプロジェクトレベル設定と、`Chat: Configure Instructions...` のユーザーレベル設定の二段構え
  - 第二防衛線: `svelte.config.js` の `onwarn` でコンパイラ deprecated 警告（`event_directive_deprecated` 等 5 種）をエラー昇格
  - 第三防衛線: ESLint の `no-restricted-syntax` で `SvelteDirective[kind="EventHandler"]` を禁止
  - 最終手段: `github.copilot.enable.svelte: false` で Svelte ファイルだけ Copilot を切る選択肢
  - Cursor / Claude Code / Continue.dev との比較表
  - Mermaid 図 3 つ（原因図、多層防御図、二段構え図）
  - フリーランス向けに「個人プロジェクトはユーザーレベル、業務はプロジェクトレベル」の使い分けを明示
- **更新**: `src/lib/config/sidebar.ts` — introduction セクションに新規ページを追加
- **更新**: `src/routes/introduction/+page.md` — カード追加（計 8 枚に）、学習の進め方を 8→9 ステップへ
- **更新**: `src/routes/introduction/eslint-prettier/+page.md` — 「次のステップ」に新記事へのリンクを追加（相互リンク化）

### 検証

- `mcp__svelte__svelte-autofixer` で記事内の主要コード例を検証予定
- リンク先実体の存在確認: `/introduction/eslint-prettier/`、`/svelte-mcp/`、`/svelte-mcp/setup/`、`/svelte-mcp/eslint-integration/`

### 背景

2026-05-14 のユーザーフィードバック「`.github/copilot-instructions.md` だと挙動に一貫性なさそう。`.github/instructions/svelte5.instructions.md` を `applyTo` 付きで作る方が確実」を起点に、フリーランス読者の AI 補完運用パターンを記事化したもの。VS Code 27.x 系で正式化された `Chat: Configure Instructions...` 機能の解説も含む。

---

## [2026-05-14] - AI コーディング支援記事に「最初の数行問題」セクション追加

### 概要

`/introduction/ai-coding-setup/` に **「よくある現象: 最初の数行だけ古い構文が出る」** セクションを追加。ユーザーから「設定をすべて適用しても、新規ファイルの最初だけ `on:click` が提案される」という実体験フィードバックを受けて、Copilot のインライン補完アーキテクチャ（in-context learning が学習データバイアスを上書きする二段階挙動）を解説し、4 つの回避策を提示。

### 追加・変更ファイル

- **更新**: `src/routes/introduction/ai-coding-setup/+page.md`
  - **新セクション「よくある現象: 最初の数行だけ古い構文が出る」** を「第三防衛線」と「最終手段」の間に追加
    - 原因解説: ファイル内文脈（few-shot in-context learning）が空ファイル時の学習データバイアスを上書きする二段階挙動を Mermaid 図で図示
    - 対処策 1: VS Code Snippets（`.vscode/svelte.code-snippets`）で `btn` / `svc` プレフィックスのスニペットを定義し、最初の 1 行に Svelte 5 構文を埋め込む
    - 対処策 2: ファイル冒頭にコメント（Use/Don't use 一覧）を書いて Copilot に文脈を与える
    - 対処策 3: リファレンスファイル（`docs/svelte5-cheatsheet.svelte` 等）を別タブで常時開き neighbor file context として参照させる
    - 対処策 4: 新規コンポーネント作成は **必ずスニペット展開から始める** ワークフローに固定
    - `:::tip` で「最初の 1 回だけを乗り切れば良い」ポイント、`:::info` で「Copilot 固有ではなく LLM 系コーディング支援ツール共通の特性」と補足
  - **「この記事で学べること」更新**: 指示文の書き方の作法・「最初の数行問題」とワークフロー対策の 2 項目を追加（計 7→9 項目）
  - **「まとめ」更新**: 「多層防御 + ワークフロー対策」と表現を変更し、第三防衛線の後に「ワークフロー対策」を 4 段目として明記

### 背景

2026-05-14 にユーザーから「この設定してもダメだな。一番最初だけ `on:click` が提示される。一回記述してしまえば以降は `onclick` になるね」というフィードバックを受領。これは Copilot のインライン補完アーキテクチャ上の限界（few-shot in-context learning と学習データバイアスの相互作用）であり、設定だけでは完全には解決できない。読者も必ずハマる落とし穴なので、独立セクションとして詳しく解説することにした。

instructions ファイル < ファイル内文脈 < スニペット展開、という影響度の階層を理解させることで、読者が自力で適切な対策を選べるようにした。

---

## [2026-05-14] - AI コーディング支援記事の指示文作法を強化

### 概要

`/introduction/ai-coding-setup/` の **指示文の書き方** に関する作法を 2 原則で整理し、テンプレートを実運用に耐える品質に強化した。Qiita 投稿の準備過程で、ユーザーから「`❌`/`✅` だけの指示は LLM への効きが弱いのでは」「`lang="ts"` 強制は JS プロジェクトに不適切」「肯定形『必ず〜を使う』を併記すると Copilot がより正確に提案する」という指摘を受けて反映した。

### 追加・変更ファイル

- **更新**: `src/routes/introduction/ai-coding-setup/+page.md`
  - **新セクション「指示文の書き方の作法（共通原則）」を追加**（「全体像」と「第一防衛線（A）」の間に挿入）
    - 原則 1: 絵文字（`❌`/`✅`）だけに意味を担わせず、「使用する」「使用しない」の明示的な日本語動詞を併用
    - 原則 2: 否定（「Y は禁止」）だけでなく肯定（「必ず X を使う」）も併記する。Anthropic / OpenAI のプロンプトガイドでも推奨されている作法。
    - `:::tip` で「必ず」程度の修飾語が最適（「絶対」「決して」を多用すると優先順位が崩れる）と補足
  - **`.github/instructions/svelte5.instructions.md` テンプレートを全面リライト**
    - `❌`/`✅` 形式から **「必ず X を使用してください」+「Y は使用しないでください」** の二段構えに統一
    - 全項目（イベントハンドラ、リアクティブ状態、Props、Slot/Children、イベント通知、ナビゲーション、Load 関数の型、TypeScript）を新形式に書き換え
    - TypeScript セクションを **「TypeScript を使用するプロジェクトのみ」** に明示変更（JS プロジェクトでも安全に流用可）
    - 末尾に `:::caution` で「TS と JS 混在プロジェクトでは `typescript.instructions.md` を別ファイル分離して `applyTo: "**/*.ts,**/*.svelte.ts"` で適用」という実運用パターンを追記

### 検証

- 既存の Mermaid 図 4 つには影響なし（テキストのみの変更）
- テンプレ内の Svelte 5 構文例（`onclick`、`$state`、`$derived`、`$props`、`{@render children?.()}`）は前回検証済みで変更なし

### 背景

2026-05-14 にユーザーから 3 つのフィードバックを受領:
1. 「`.github/copilot-instructions.md` 側の `❌`/`✅` 形式は検証していない。曖昧では」
2. 「`lang="ts"` 強制は JavaScript プロジェクトには不適切」
3. 「Copilot は肯定形『必ず X を使用してください』を併記すると、より正確に提案する傾向がある」

Qiita 投稿用ドラフトと本サイト記事を並行更新。本サイト側はより詳細な解説（`:::tip` での修飾語強度の塩梅、`:::caution` での実運用パターン）を含めて差別化。

---

## [2026-05-13] - 記事刷新 Sprint 3（低優先度 11 項目）

### 概要

`REVIEW-REPORT-2026-05-12.md` Sprint 3（🟢 低優先度・項目 40–50）を完了。Sprint 1（即時修正）/ Sprint 2（中優先度）を経て、Sprint 3 では「ハブページのカード一覧の整合」「リファレンス・周辺ドキュメントへの新 API 反映」「軽微な誤記訂正」「出典明示」など、コンテンツの完成度を高める仕上げ作業を行った。

下記の項目 43-46 / 48 については、独立したより詳細な CHANGELOG エントリが本エントリの下に続いている。

### Sprint 3-A: ハブページ整合（項目 40-42）

CLAUDE.md「ハブページのカード一覧（手動管理）」の運用ルールに沿って、Sprint 2 で追加された各ページへの導線をハブ側にも反映した。

- **`src/routes/svelte/runes/+page.md` の Runes 表拡充**（項目 40）：既存 8 行に `$inspect.trace()`（5.14+、`/svelte/runes/inspect/`）・`$effect.pending()`（5.36+、`/svelte/runes/effect/`）・`$state.eager`（`/svelte/runes/state/`）の 3 行を追加。既存行もリンク化して整合させた。
- **`src/routes/svelte/basics/+page.md` のカード追加**（項目 41）：`<svelte:boundary>` とエラー境界カードを新規追加（`/svelte/basics/special-elements/#svelte-boundary` への遷移）。Attachments カードは既存のため変更なし。
- **`src/routes/introduction/+page.md` のカード追加**（項目 42）：既存 5 カードに「CLI tools」（`/introduction/cli/`）と「ESLint / Prettier」（`/introduction/eslint-prettier/`）の 2 カードを追加し計 7 枚に。学習の進め方を 5 ステップから 8 ステップへ更新。

### Sprint 3-B: svelte-mcp 系の刷新（項目 43-46）

詳細は本エントリ下の「[2026-05-13] - 記事刷新 Sprint 3 項目 43-46」を参照。

主な内容：
- `svelte-mcp/setup/+page.md` と `svelte-mcp/+page.md` に GitHub Copilot CLI（Local / Remote）のセットアップ手順を追加（項目 43）
- `svelte-mcp/tools/+page.md` の `svelte-autofixer` 出力 JSON に `require_another_tool_call_after_fixing` フィールド追加、`get-documentation` / `playground-link` の整形崩れを修正（項目 44）
- `svelte-mcp/usecases/+page.md` の `$state.frozen()` を `$state.raw()` に置換（項目 45）
- `svelte-mcp/ecosystem/+page.md` に Svelte Plugin（Claude Code Marketplace）・Subagent（`svelte-file-editor`）・Skills（`svelte-code-writer`/`svelte-core-bestpractices`）を追加。本プロジェクトの `.claude/skills/svelte5-coding-standards/SKILL.md` を「公式 Skills」と「プロジェクト固有 Skill」の二段構えの実例として引用（項目 46）

### Sprint 3-C: introduction/why-svelte の出典明示と FID→INP（項目 47）

- **`src/routes/introduction/why-svelte/+page.md`** を全面リライト：
  - `<script>` → `<script lang="ts">` に修正
  - 出典不明な定量数値（FID 12ms、77%改善、バンドルサイズ表 KB 値、コード削減%、20-30%高速化、NYT / Apple / 1Password の具体数値など）を**Krausest ベンチマーク**・**bundlephobia**・**web.dev**・**Akamai 調査**・**Svelte 公式ブログ**・**BuiltWithSvelte** などへの**出典付き参照**または**定性的記述**にトーンダウン
  - FID 表記を **INP**（Interaction to Next Paint）に置換（2024-03 移行）
  - EC サイトの離脱率 7% に Akamai 調査の出典リンクを付与

### Sprint 3-D: reactive-stores で Runes 優先を強調（項目 48）

詳細は本エントリ下の「[2026-05-13] - 記事刷新 Sprint 3 項目 48」を参照。

`svelte/store` API は非推奨ではないが、新規実装では Runes を優先する旨を冒頭 `:::caution` で強く明示。公式ドキュメントの "With runes, these use cases have greatly diminished." を引用。既存の動かないコード例（`createNotificationStore` の `confirm` 関数）も同時に修正。

### Sprint 3-E: reference/sveltekit2 にテーブル追加（項目 49）

- **`src/routes/reference/sveltekit2/+page.md`** に以下を追加：
  - **`$app/types` セクション強化**（2.26+）：`RouteId`/`RouteParams<R>`/`LayoutParams<R>`/`Pathname`/`ResolvedPathname`/`Asset` の 6 行 API テーブル、各型のコード例、`/deep-dive/auto-generated-types/` への内部リンクを `:::info` で追加
  - **ルート解決方式（`kit.router.resolution`）節**（2.17+）：`'client'`/`'server'` の比較表、`svelte.config.js` 例、`bundleStrategy` との関係を `:::tip` で言及
  - **バンドル戦略（`kit.output.bundleStrategy`）節**（2.13+）：`'split'`/`'single'`/`'inline'` の特性表、設定例、`'inline'` 時の `assetsInlineLimit` 注意を `:::caution` で記載
  - **CSRF 設定（`kit.csrf`）節**：`checkOrigin`（deprecated）と `trustedOrigins` の表、設定例、`['*']` の危険性警告を `:::warning` で追加

### Sprint 3-F: Snippets の `<script module>` export / `createRawSnippet`（項目 50）

- **`src/routes/svelte/advanced/snippets/+page.md`** の「TypeScriptとの統合」と「ベストプラクティス」の間に「Snippetのエクスポートとプログラム的生成」節を新設：
  - **`<script module>` 経由のエクスポート**（5.5+）：共通 `tableRow`/`badge` を別コンポーネントから `import` する例、`module` スコープ制約の `:::warning`、共通ライブラリパターンの `:::tip`
  - **`createRawSnippet`**：シグネチャ説明、ゲッター引数・`render`/`setup`・クリーンアップを含むデモ、XSS 対策・最終手段である旨の `:::caution`
- frontmatter `description` と「重要なポイント」を 7 項目目まで同期。コード例 3 点は `svelte-autofixer` で issues 0 件を確認。

### 検証

- `mcp__svelte__svelte-autofixer` で Sprint 3 で書き換えた主要コード例（Snippets エクスポート、`createRawSnippet`、reactive-stores 修正例）を検証し警告 0 件
- `mcp__svelte__get-documentation` で `svelte/$state`、`svelte/$effect`、`svelte/$inspect`、`svelte/snippet`、`svelte/script-module`、`svelte/stores`、`kit/configuration`、`kit/$app-types`、`ai/plugin`、`ai/subagent`、`ai/skills`、`ai/tools` を取得し最新仕様を確認
- 追加リンク先（`/introduction/cli/`、`/introduction/eslint-prettier/`、`/svelte/runes/inspect/`、`/svelte/runes/effect/`、`/svelte/runes/state/`、`/svelte/basics/special-elements/`、`/deep-dive/auto-generated-types/`、`/sveltekit/application/state-management/`）の実体存在を確認

### 影響範囲

修正・追加対象ファイル数: 約 11 ファイル（routes 配下の `.md`）。ハブ表・カード追加、リファレンステーブル追加、出典付与、リライト等が中心。

### preprocessor 改修（Sprint 2 のフォロー）

Sprint 2 で発覚した `markdown-plugins/preprocess-admonition-import.js` の堅牢性問題（インラインコード内の `<script>` を Svelte の script タグと誤認するバグ）も併せて修正済み。`stripCodeFences` に `stripInlineCode` を追加し、`` `…` `` / `` ``…`` `` の中身を同じ長さの空白に置換することで本文中の `` `<script>` `` 表記が安全に書けるようになった。`state-management/+page.md` の該当行も `` `&lt;script&gt;` `` 表記に置換済み（preprocessor 改修と二重防御）。

---

## [2026-05-13] - 記事刷新 Sprint 3 項目 43-46: svelte-mcp 系 4 ファイル統合修正

### 変更内容

- **`src/routes/svelte-mcp/setup/+page.md`**（項目 43）
  - GitHub Copilot CLI（`gh copilot` 拡張）向けの **Local 版**および **Remote 版**セットアップ手順を新規追加
    - インストール手順（`gh extension install github/gh-copilot`）と設定ファイル（`~/.config/github-copilot/mcp-config.json`）の例を明示
    - 公式仕様の変更可能性に関する注意を `:::info`（既存 `<Admonition type="info">` 構造を踏襲）で付記
  - frontmatter `description` に「GitHub Copilot CLI」を追加
- **`src/routes/svelte-mcp/+page.md`**（項目 43）
  - 対応クライアントリストに **GitHub Copilot CLI** を追加
  - セットアップカードのリスト項目に「Codex CLI、Gemini CLI、Copilot CLI」と Copilot CLI を併記
- **`src/routes/svelte-mcp/tools/+page.md`**（項目 44）
  - `svelte-autofixer` の出力 JSON 例に **`require_another_tool_call_after_fixing` フィールド**を追加（fix 適用後に再度ツール呼び出しが必要かを示すフラグ）。実際の MCP サーバー応答に合わせ、`issues` を Svelte 公式の `https://svelte.dev/e/...` リンク付き文字列形式に修正
  - フラグの意味を表形式で解説するサブセクションを新設し、エージェント的ループの停止条件として位置付け
  - `get-documentation` の使用例を `get - documentation(...)` という不正な整形から `get-documentation({ section: ... })` のオブジェクト引数形式に修正
  - `playground-link` の入力例を `playground - link(...)` から正しい関数呼び出し形式 + テンプレートリテラルに修正、出力例も Playground 公式の gzip + base64url ハッシュ形式に揃え、URL ハッシュにコードが格納される旨を補足
- **`src/routes/svelte-mcp/usecases/+page.md`**（項目 45）
  - UC6 内の `$state.frozen()` を `$state.raw()` に置換（公式の現行 API 名）
  - 説明文を「プロパティへの代入や push などのミューテーションは反映されず、配列・オブジェクト全体を再代入する必要があります」と整合させた
- **`src/routes/svelte-mcp/ecosystem/+page.md`**（項目 46）
  - 「公式 Claude Code 統合」セクションを新設し、以下を追加
    - **Svelte Plugin（Claude Code Marketplace）** — `/plugin marketplace add sveltejs/ai-tools` → `/plugin install svelte` の手順
    - **Subagent（`svelte-file-editor`）** — 独自コンテキストウィンドウを持ち `list-sections` / `get-documentation` / `svelte-autofixer` ループを完結する仕組み、明示的委譲の例
    - **Skills（`.claude/skills/`）** — 公式 `svelte-code-writer` / `svelte-core-bestpractices` の概要表、`.claude/skills/` への手動配置オプション
    - **プロジェクト固有 Skill の運用例** — 本リポジトリの `.claude/skills/svelte5-coding-standards/SKILL.md` を「公式 Skills」と「プロジェクト固有 Skill」の二段構えの実例として引用
    - **OpenCode 版**（`@sveltejs/opencode`、`.opencode/skills/`）を補足
  - frontmatter `description` を更新し、まとめセクションに Claude Code / OpenCode 統合の項目を追加、参考リンクに `sveltejs/ai-tools` を併記

### 根拠

- Svelte MCP の `mcp__svelte__get-documentation` で `ai/plugin` / `ai/subagent` / `ai/skills` / `ai/tools` セクションを確認
- 実際に `mcp__svelte__svelte-autofixer` を呼び出し、レスポンスに `require_another_tool_call_after_fixing` フィールドが含まれることを検証
- `$state.raw` が公式の現行 API（`$state.frozen` は存在しない）であることを `svelte/$state` ドキュメントで確認

## [2026-05-13] - 記事刷新 Sprint 3 項目 48: `reactive-stores` で Runes 優先を明示

### 変更内容

- **`src/routes/svelte/advanced/reactive-stores/+page.md`**
  - 導入文直後に `:::caution[新規実装では Runes を優先]` ブロックを追加
    - `svelte/store` API（`writable` / `readable` / `derived` / `readonly`）は**非推奨ではないが**、新規実装では `.svelte.ts` の Runes を優先する旨を強く明示
    - 公式ドキュメント [Svelte Docs - Stores](https://svelte.dev/docs/svelte/stores) の "With runes, these use cases have greatly diminished." を引用し、原文＋日本語訳を併記
    - 新規コードでの推奨方針（ロジック抽出・共有状態・派生値）を 3 項目で提示し、内部リンクで `/svelte/runes/state/` と `/sveltekit/application/state-management/` に誘導
    - 既存コードベース・サードパーティライブラリ互換、複雑な非同期データストリーム、RxJS 思想の持ち込みなど、引き続き学習・利用価値のある 3 ケースを併記
  - **既存の動かないコード例修正**: `createNotificationStore()` 内 `confirm()` 関数は `return` 後に到達不能コードがあり、`id` / `notification` 変数も未定義というバグがあった。`add()` で先に ID を確保し、`notifications` 配列から `find()` で該当エントリを取り出して `actions` を後付けする実装に修正

## [2026-05-13] - 記事刷新 Sprint 2（中優先度 20 項目）

### 概要

`REVIEW-REPORT-2026-05-12.md` Sprint 2（🟠 中優先度・項目 20–39）を完了。Sprint 1 の「コピペで動かない」レベルの即時修正に続き、Sprint 2 では Svelte 5.x / SvelteKit 2.x で追加された主要 API の体系的取り込み、エコシステム陳腐化対応、リファレンス整備を行った。

主要テーマは以下の通り。

1. **Remote Functions / Hooks の最新仕様への追従** — `query.live`、field API、Universal hooks 等の SvelteKit 2.x 系で大幅に拡張された API 群
2. **Svelte 5.x 新 API のリファレンス・解説整備** — `$inspect.trace`、`<svelte:boundary>`、Function bindings、`{@attach}` 主役化など
3. **TypeScript / 型システムの最新化** — `PageProps`/`LayoutProps`、`$app/types`、TS 6 新オプション
4. **SSR セーフネス強化** — モジュールトップで `$state` を export するアンチパターン警告、Runes 化
5. **PWA / 最適化記事の本プロジェクト実装整合化** — `@vite-pwa/sveltekit` 採用パターンを正面解説、Core Web Vitals を FID から INP に統一
6. **デプロイメント・実行環境の最新化** — Vercel Node 22.x、Cloudflare Workers Static Assets、`adapter-node` graceful shutdown、`writing-adapters` の `supports`/`emulate` API

下記の項目 22 / 33+34 / 37 / 39 については、独立したより詳細な CHANGELOG エントリが本エントリの下に続いている。

### Sprint 2-A: Remote Functions の徹底拡充（項目 20-21）

- **`sveltekit/server/remote-functions/+page.md` を全面拡充**
  - **設定（experimental フラグ）節**を新設：`kit.experimental.remoteFunctions` と `compilerOptions.experimental.async` 両方を opt-in する必要性を明示
  - **`query.live` 独立節**：AsyncIterable・`connected` プロパティ・`reconnect()`・SSR 挙動・Single-flight reconnect を実装例付きで解説
  - **`.run()` 戻り値表**（query / batch / live 3 種比較）を追加
  - **フィールド API リファレンス**を新設：`.as(type[, value])`、`issues`、`value`、`set`、`allIssues`、`validate`、`preflight`、`for`、`enhance`、`result`、`pending`、複数 submit ボタン、`_` プレフィックスによる機密保護、`b:`/`n:` 自動命名
  - **`invalid()` + `issue` プログラマティックバリデーション**：`throw` 不要であることを明示
  - **`enhance` の `submit()` boolean 戻り値**：バリデーション失敗 vs ネットワークエラーを区別する正しいパターン
  - **Single-flight 節**：`submit().updates(...)` ＋ `requested(fn, limit)` で `{ arg, query }` 反復、`refreshAll()`/`reconnectAll()` 短縮形、DoS 防止理由
  - **`withOverride` 楽観的更新**、**`transport` Universal hook 連携**（カスタム型シリアライズ）、**`prerender` Remote Functions**（`inputs`/`dynamic`）、**`getRequestEvent()` 制約**、**`$app/server` の `read()`** を追加
- **`reference/sveltekit2/+page.md` の Remote Functions テーブル拡充**
  - `query.batch`/`query.live`/`.run()` の具体仕様と 3 種比較表
  - form フィールド API 表、`submit()` boolean パターン、`invalid()`
  - `$app/server` エクスポート一覧拡充（`query.live`/`requested().refreshAll()`/`read()`）
  - Remote Functions 主要メソッド・プロパティ表（query 系 / form・command 系）
  - experimental opt-in、`transport` Universal hook を反映

### Sprint 2-B: Svelte 5.x 新 API の解説追加（項目 23-27）

- **`svelte/runes/inspect/+page.md`**：`$inspect.trace()`（5.14+）を新節として追加（概要・`$effect`/`$derived.by` 例・ラベル付きトレース・`$inspect()` との比較表・呼び出し位置制約・noop 警告）。
- **`svelte/basics/special-elements/+page.md`**（項目 24 と 29 を統合対応）：
  - `<svelte:boundary>`（5.3+）独立節の強化（`pending`/`failed`/`onerror`/`transformError`（5.51+）プロパティ表、Suspense が存在しない旨の `:::caution`、SSR サニタイズ例）
  - `<svelte:window>` 例直下に `svelte/reactivity/window`（`innerWidth.current` 等）を推奨する `:::tip`
  - `<svelte:options accessors>` / `immutable` を Runes 非対応 legacy として `:::caution`、代替策（`$bindable`、`$state.raw`）を明示
  - `<svelte:component>` を Runes モード非推奨と明記、`{#if}` / `{#each}` の動的参照例に置換
  - `<svelte:document>` の `fullscreenElement` を `Element | null` 型に修正、`visibilityState` を `DocumentVisibilityState` 型に統一
- **Function bindings（5.9+）の解説を 3 ファイルに追加**：
  - `svelte/runes/bindable/+page.md`：API 紹介として getter/setter 2-tuple 構文、摂氏華氏変換、`$effect` 双方向 sync との対比、読み取り専用バインディング応用、`bind:this` 注意点、TypeScript 型推論
  - `deep-dive/reactive-state-variables-vs-bindings/+page.md`：「変数」と「バインディング」の中間として位置づけ、比較表
  - `deep-dive/derived-vs-effect-vs-derived-by/+page.md`：予算配分の `$effect` 2 連発アンチパターン → `$derived` + Function bindings への置き換え例、3 手法 + Function bindings の使い分け表
- **`svelte/basics/actions/+page.md` に `{@attach}` 主役化**：
  - 冒頭導入直後に `:::tip[新規実装は {@attach} を推奨]` を追加
  - `fromAction(tooltip, () => label)` の移行コード例を `:::info` で追加
  - 末尾「次のステップ」を `/svelte/basics/attachments/` 誘導に
  - 旧構造 URL `svelte.dev/docs/use` → `svelte.dev/docs/svelte/use` 系に統一
- **`reference/svelte5/+page.md` に Sprint 2 新 API を集約反映**：
  - `$inspect.trace()`（5.14+）を `$inspect` 節に追加、API 比較表付き
  - `<svelte:boundary>`（5.3+）を特殊要素節に追加、プロパティ表付き
  - Function bindings（5.9+）をバインディング節に追加、`bind:value={getter, setter}` 構文と読み取り専用 `bind:clientWidth={null, redraw}` 形態の表
  - `<svelte:options customElement>` オブジェクト構文（`tag`/`shadow`/`props`/`extend`）
  - `fork()` / `settled()` / `tick()`（5.42+）を await expressions 節に追加
  - await expressions の `compilerOptions.experimental.async: true` opt-in 手順
  - `$state.eager` を `$state`/`$derived`/`$state.eager` 更新タイミング比較表に再構成

### Sprint 2-C: コンポーネント・ライフサイクル（項目 28・30）

- **`svelte/basics/component-lifecycle/+page.md`**（項目 28）：
  - `onMount(() => async () => ...)` 構文の修正：クリーンアップは同期関数でなければならない旨を `:::warning` で明示、`$effect` ＋ `AbortController` 代替例を追加
  - `$effect.root` 戻り値を `destroyRoot` に改名し、role を明示
  - L326–346 のページ途中 `<script>` ブロックを冒頭の単一 `<script lang="ts">` に統合
  - `onDestroy` 例の SSR 不安全な `setInterval` を `onMount` 内に移動、`$effect` 版代替を併記
  - `beforeUpdate`/`afterUpdate` を Runes コンポーネントで利用不可と明記、対応表を追加
- **`svelte/basics/transitions/+page.md` L979–L1030**（項目 30）：
  - `|local` の説明逆転を修正。Svelte 5 のデフォルトは local（属するブロックの変化のみで再生）、`|global` で上位ブロックのマウント時にも再生される、と訂正
  - `:::caution` で Svelte 4 のデフォルト挙動の違いを補足

### Sprint 2-D: TypeScript / 型（項目 31-32）

- **`deep-dive/auto-generated-types/+page.md`**（項目 31）：
  - マッピング表に `+page.svelte` → `PageProps`（推奨）／`PageData`/`PageServerData`/`ActionData`（レガシー）、`+layout.svelte` → `LayoutProps`（推奨）の行を追加
  - 「Props 型（SvelteKit 2.16.0 以降）」新節：`PageProps`/`LayoutProps` の使用例とレガシー個別型付けとの対比
  - 「`$app/types` モジュール（SvelteKit 2.26 以降）」新節：`RouteId`、`RouteParams<R>`、`LayoutParams<R>`、`Pathname`、`ResolvedPathname`、`Asset` の解説と `goto` / `href` / `fetch` への活用例、`./$types` との使い分け表
- **`introduction/typescript-setup/+page.md`**（項目 32）：
  - `tsconfig.json` に `verbatimModuleSyntax: true` / `isolatedModules` / `erasableSyntaxOnly` を追加（各オプションの意味・推奨値・SvelteKit との関係）
  - VS Code 設定 `"source.fixAll.eslint": "explicit"` に修正（1.85+ の文字列リテラル仕様を `:::tip` で解説）
  - GitHub Actions を `actions/checkout@v4` / `actions/setup-node@v4` / `pnpm/action-setup@v4`（pnpm v9）に更新

### Sprint 2-E: 状態管理の SSR セーフネス（項目 33-34）

詳細は本エントリ下の「[2026-05-13] - 記事刷新 Sprint 2 項目 33 / 34」を参照。

### Sprint 2-F: PWA / 最適化（項目 35-38）

- **`sveltekit/optimization/pwa/+page.md` を本プロジェクト実装に整合させる形で全面刷新**（項目 35）：
  - `@vite-pwa/sveltekit` 1.1+ 中心の構成に書き換え
  - 本プロジェクトの `vite.config.js`、`src/lib/components/PwaUpdatePrompt.svelte`、`src/app.d.ts`、`src/app.html` の実装をケーススタディとして引用
  - 追加した節：アーキテクチャ全体像（Mermaid 図）、`@vite-pwa/sveltekit` vs 素の `$service-worker` 比較表、`registerType: 'prompt'` vs `'autoUpdate'`、`virtual:pwa-register`/`workbox-window` 連携、`manifestTransforms` と `trailingSlash: 'always'` 整合、`globPatterns: ['prerendered/**/*.html']` 戦略、dev サーバでの SW 有効化と HMR 干渉、`clientsClaim`/`skipWaiting` UX 設計判断、`@vite-pwa/assets-generator` ワークフロー、トラブルシューティング
- **`sveltekit/optimization/build-optimization/+page.md`**（項目 36）：
  - `<svelte:component>` を変数直接参照（`<ChartComponent />`）に書き換え、Runes 注意の `:::tip`
  - `let isLoading = true` → `let isLoading = $state(true)`、`ChartComponent` も `$state<Component | null>(null)` 化
  - 画像セクションを `@sveltejs/enhanced-img` 主軸に全面書き換え（セットアップ・`<enhanced:img>`・`import.meta.glob` 例・CDN 補足）、`vite-plugin-imagemin` は補助扱いの `:::caution` に
  - 新節「SvelteKit 側の出力設定」追加：`kit.output.bundleStrategy: 'split' | 'single' | 'inline'`（2.13+）、`kit.router.resolution: 'client' | 'server'`（2.17+）
  - 圧縮節に `adapter-node` / `adapter-static` の `precompress` デフォルト差を追記
- **`sveltekit/optimization/seo/+page.md`**（項目 37）：詳細は下記の独立エントリを参照
- **Core Web Vitals FID → INP 一斉更新**（項目 38）：
  - `optimization/+page.md`：カードの「FID改善 100ms」→「INP改善 200ms」、Core Web Vitals 目標値表を INP（Good<200ms / Needs 200-500ms / Poor>500ms）に差し替え、2024-03 移行の `:::info`
  - `optimization/build-optimization/+page.md`：計測スクリプトの `FID` を `INP`（`PerformanceObserver` による interactionId ベースの計測）に置換
  - `optimization/caching/+page.md`：監視コードの `FID` ロジックを `INP`（`interactionId` / `durationThreshold`）に差し替え、`web-vitals` v4 の `onINP, onLCP, onCLS, onTTFB, onFCP` インポート例を追加
  - `optimization/performance/+page.md`：スタブの予定コンテンツ項目を `FID` → `INP` に更新、2024-03 切替の注記を併記

### Sprint 2-G: デプロイ・実行環境（項目 39）

詳細は本エントリ下の「[2026-05-13] - 記事刷新 Sprint 2 項目 39」を参照。

### 検証

- `mcp__svelte__svelte-autofixer` で Sprint 2 で書き換えた主要コード例（Remote Functions 数例、`<svelte:boundary>` 例、Function bindings 摂氏華氏・予算スライダー、`PageProps`/`LayoutProps`、PWA 更新通知、SEO JSON-LD、enhanced-img 動的コンポーネント等）を検証し、`state_referenced_locally` を含む警告 0 件を確認。
- `mcp__svelte__get-documentation` で `kit/remote-functions`、`kit/hooks`、`kit/$app-server`、`kit/$app-types`、`kit/$app-paths`、`kit/page-options`、`kit/observability`、`kit/configuration`、`kit/adapter-vercel`、`kit/adapter-cloudflare`、`kit/adapter-node`、`kit/writing-adapters`、`kit/images`、`kit/service-worker`、`svelte/$inspect`、`svelte/$state`、`svelte/$effect`、`svelte/svelte-boundary`、`svelte/svelte-window`、`svelte/svelte-document`、`svelte/svelte-options`、`svelte/svelte-component`、`svelte/svelte-reactivity-window`、`svelte/svelte-attachments`、`svelte/bind`、`svelte/await-expressions`、`svelte/context` を取得し、最新仕様との整合を確認。

### 影響範囲

修正・追加対象ファイル数: 約 25 ファイル（routes 配下の `.md`）。新規追加した節・表・コード例の合計は 70 以上。Mermaid 図・本プロジェクト実装からの引用も多数。

---

## [2026-05-13] - 記事刷新 Sprint 2 項目 37: SEO 記事の `$derived` 化と `base` / `trailingSlash` 整合

### 概要

`REVIEW-REPORT-2026-05-12.md` Sprint 2 項目 37 に基づき、`sveltekit/optimization/seo/+page.md` を Svelte 5 Runes と SvelteKit 2.x の paths 仕様に整合させた。`$props()` の `data` をローカル定数に直接展開していたコード例で `state_referenced_locally` 警告が 7 件出ていたため、JSON-LD オブジェクト・派生タイトル・派生 URL すべてを `$derived` 化。さらに、本プロジェクト自身が GitHub Pages のサブパス配下で動く `trailingSlash: 'always'` 構成であることを活かし、`$app/paths` の `base` を含む canonical / sitemap / OGP URL の組み立て方をケーススタディとして提示した。

### 追加・修正したセクション

- **SEOメタデータコンポーネント**: SEO コンポーネント例を `$app/state` + `$app/paths` ベースに刷新。`fullTitle` / `canonicalUrl` / `ogImageUrl` を `$derived` で構築し、`page.url.origin + base + imagePath` で OGP 画像の絶対 URL を組み立てる本サイト `SeoMeta.svelte` と同じパターンに統一。ケーススタディ用 `:::tip` を追加。
- **構造化データ（JSON-LD）**: `const jsonLd = { ...data.post... }` を `const jsonLd = $derived({ ... })` に書き換え。`base` を含む `canonicalUrl` を共有し、`publisher.logo.url` も `${page.url.origin}${base}/logo.png` 形式に修正。`:::caution[state_referenced_locally 警告の回避]` を追加し NG / OK パターンを明示。
- **canonical URL の管理**: 「`page.url.href` をそのまま使う基本パターン」と「`base` を明示的に組み立てるパターン」を分離。本サイト `SeoMeta.svelte` の実装抜粋を `:::info` でケーススタディ化し、`trailingSlash` の設定別比較表を `:::warning[trailingSlash と canonical の整合性]` で提示。ページネーション例も `$derived` + `base` 込みに更新。
- **サイトマップの自動生成（静的サイトの場合）**: 本サイト `src/routes/sitemap.xml/+server.ts` の実装抜粋を `:::info` で追加。`+server.ts` では `$app/paths` の `base` が使えないため公開ドメインを定数で持つ理由と、`trailingSlash: 'always'` 環境では `<loc>` も末尾スラッシュ付きで出力すべきことを明記。
- **よくある間違い**: 「JSON-LD オブジェクトを `$derived` で包み忘れる」「canonical URL に `base` を入れ忘れる / `trailingSlash` 設定と矛盾する」の 2 ケースを追加。

### 仕様確認

- Svelte MCP の `mcp__svelte__get-documentation` で `kit/$app-paths`、`kit/$app-state`、`kit/page-options` を取得し、`base`（deprecated 注記あり、`resolve()` 推奨）・`page` の reactive 性質・`trailingSlash: 'always'` 時の `about/index.html` 出力規則に従って記述。
- 代表的なコード例 3 個（SEO コンポーネント、ブログ記事 + JSON-LD、ページネーション canonical）を `mcp__svelte__svelte-autofixer` で検証し、`state_referenced_locally` 警告が 0 件になることを確認済み。

---

## [2026-05-13] - 記事刷新 Sprint 2 項目 33 / 34: 状態管理の SSR セーフネス強化と Runes 化

### 概要

`REVIEW-REPORT-2026-05-12.md` Sprint 2 項目 33・34 を統合対応。`sveltekit/application/state-management/+page.md` には「モジュールトップで `$state` を生成して export するパターンは SSR で複数リクエストの状態が混ざる」アンチパターン警告を `:::warning` で明示し、Context API ベースの安全なパターンに置き換え。`sveltekit/application/session/+page.md` の LocalStorage 用クライアントストアを `svelte/store` (`writable`/`derived`) から Svelte 5 Runes（クラス + `$state`）に書き換えた。

### 追加・修正したセクション（項目 33: state-management）

- **冒頭 SSR アンチパターン警告**: `export const cart = new CartStore()` のような書き方を `:::warning[SSR で複数リクエストの状態が混ざります]` で危険と明示。Node.js プロセスがリクエスト間で共有される点と情報漏洩リスクを説明し、Context API・コンポーネントローカル `$state`・load 関数・CSR 限定の4つの安全策を提示。
- **CartStore 例の Context 化**: `CartStore` クラスを export しつつ、`setCartContext()` / `getCartContext()` ヘルパーを追加。`+layout.svelte` でリクエストごとに `new CartStore()` してリクエストスコープに閉じ込めるパターンに変更。
- **EditorStore / AuthMachine / FilterStore**: モジュールトップ `new` の代わりに「Context API か layout 内で生成すること」のインラインコメントを追加。
- **テストコード**: `cart` 直接 import を `let cart: CartStore; beforeEach(() => cart = new CartStore())` 形式に変更（本番でも同じ単位＝リクエストで作る、と整合）。
- **まとめ**: 「SSR セーフネスを最優先」を重要ポイント先頭に追加。

### 追加・修正したセクション（項目 34: session）

- **LocalStorage 用 AuthStore を Runes 化**: `writable<AuthState>` / `set` / `update` ベースの実装を `class AuthStore { user = $state<User \| null>(null); ... }` に置き換え。`isAuthenticated` は `$derived` 相当の getter で表現。
- **SSR セーフネス警告**: `:::warning[SSR でリクエスト間共有しないこと]` を追加。`browser` ガードで `localStorage` を扱い、Context API でリクエストスコープに閉じ込めることを明示。
- **`setAuthContext` / `getAuthContext` ヘルパー追加**: ルートレイアウトで `setAuthContext()` し `onMount(() => auth.init())` でブラウザ側のみ復元するパターンに統一。
- **`svelte/store` の位置付け注記**: `:::note` で「`svelte/store` API はまだ動作するが、新規実装では Runes 推奨」と明示。

### 仕様確認

- Svelte MCP の `mcp__svelte__get-documentation` で `kit/state-management`、`svelte/context`、`svelte/$state`、`svelte/svelte-js-files` を取得し、公式ドキュメントの「Avoid shared state on the server」「Using state and stores with context」「Passing state across modules」のガイドラインに沿って記述。
- 代表的なコード例 4 個（CartStore 用 layout、CartStore 用ページ、AuthStore 用 layout、AuthStore 利用ページ）を `mcp__svelte__svelte-autofixer` で検証し、`state_referenced_locally` 警告を解消する形に修正済み。

---

## [2026-05-13] - 記事刷新 Sprint 2 項目 39: 実行環境とランタイムのアダプター API 更新

### 概要

`REVIEW-REPORT-2026-05-12.md` Sprint 2 項目 39 に基づき、`sveltekit/deployment/execution-environments/+page.md` を SvelteKit 2.x 系列のアダプター仕様（adapter-vercel / adapter-cloudflare / adapter-node / writing-adapters）に整合させた。

### 追加・修正したセクション

- **adapter-vercel**: `runtime` 例を `'nodejs18.x'` から `'nodejs22.x'` に更新。`'edge' / 'nodejs20.x' / 'nodejs22.x'` のみがサポート対象であることを明記し、`runtime` オプションが将来削除予定で Vercel ダッシュボードの Node バージョン設定が自動採用される旨を `:::warning` で告知。プラットフォーム最適化例も `Config` 型を import するスタイルに更新。
- **adapter-cloudflare**: `adapter-cloudflare-workers` が deprecated であり Workers Static Assets への移行が必要な経緯を `:::info` で記載。`wrangler.jsonc` の `assets.directory` / `assets.binding` / `assets.not_found_handling` と SPA fallback、`_routes.json` の 100 件制限について実例付きで追加。
- **adapter-node 5.x**: グレースフルシャットダウンのシーケンス（`server.close` → `closeIdleConnections` → `closeAllConnections`）と、`sveltekit:shutdown` イベントで非同期クリーンアップを行う例（DB / ジョブ停止）、`SHUTDOWN_TIMEOUT` 環境変数、Docker/K8s での exec form の重要性を `:::tip` で追加。
- **writing-adapters の新 API**: カスタムアダプター例を TypeScript の `Adapter` 型ベースに刷新。`supports.read`（`$app/server` の `read` の可否申告）、`supports.instrumentation`（`instrumentation.server.js` / OpenTelemetry サポート）、`emulate` API（ローカル開発時の `event.platform` エミュレーション）を実装例＋解説付きで追加。
- **リンク切れ修正**: 末尾「次のステップ」の `/sveltekit/architecture/build-optimization/`（存在しないパス）を `/sveltekit/optimization/build-optimization/` に修正。

### 仕様確認

- Svelte MCP の `mcp__svelte__get-documentation` で `kit/adapter-vercel`、`kit/adapter-cloudflare`、`kit/adapter-node`、`kit/writing-adapters` を取得し、上記の `runtime` サポート値・`adapter-cloudflare-workers` 廃止・`sveltekit:shutdown` イベント・`supports` / `emulate` API の最新仕様に基づいて記述。

---

## [2026-05-13] - 記事刷新 Sprint 2 項目 22: Hooks の 3 系統化

### 概要

`REVIEW-REPORT-2026-05-12.md` Sprint 2 項目 22 に基づき、`sveltekit/server/hooks/+page.md` を SvelteKit 公式の最新仕様（Server / Client / Universal の 3 系統）に整合させた。これまで Server hooks のみに集中していた構成を、Client / Universal hooks まで網羅する形に拡張。

### 追加・修正したセクション

- **冒頭「3系統のhooksファイル」セクション新設**: `hooks.server.ts` / `hooks.client.ts` / `hooks.ts` の役割表を追加し、shared hooks（環境別 2 ファイル実装）と Universal hooks（両環境共通実装）の用語区別を明示。
- **「Hooksの種類」表に配置ファイル列を追加**: `init`・`reroute`・`transport` を含む 7 種をどのファイルに置くかを明示。
- **`handle` セクションに `event.tracing` 言及（SvelteKit 2.31+）**: `event.tracing.root` と `event.tracing.current` で OpenTelemetry スパンに属性を付与する例を追加。`kit.experimental.tracing.server` フラグと公式 Observability ドキュメントへのリンクも明記。
- **`handleValidationError` の引数説明を強化**: `{ event, issues }` の引数型を表で明示（`event: RequestEvent` / `issues: StandardSchemaV1.Issue[]`）。戻り値は `App.Error` の形であること、`issues` の中身をクライアントに返さないことを補足。
- **`Client hooks（src/hooks.client.ts）` セクション新設**: 
  - `handleError`（クライアント側）: `HandleClientError` 型の例、`event` が `NavigationEvent` 型である点（`event.to.url.pathname` / `event.from.url.pathname`）を明示。
  - `init`（クライアント側）: `ClientInit` 型の例。ハイドレーション遅延の注意を併記。
  - 「クライアント `handleError` 自体は例外を投げないこと」の `:::caution` を追加。
- **`Universal hooks（src/hooks.ts）` セクション新設**:
  - `reroute` 同期版（基本）: 多言語ルーティング書き換えの例。
  - `reroute` 非同期版（2.18+）: `fetch` 引数を使った短縮 URL 解決例。ナビゲーション遅延・冪等性の `:::caution` を併記。
  - `transport`: カスタム型 `Vector` を `encode`/`decode` する例。`Decimal` / `Temporal` / ドメインモデル等の活用例を `:::tip` で提示。
  - `init`（Universal）: `SharedInit` 型の例と、環境別初期化との使い分けを `:::info` で明示。
- **まとめセクション更新**: 4 hooks 列挙を、Server / Client / Universal の 3 系統 × 全 9 hooks（重複含む）を整理した記述に置換。

### 仕様確認

- Svelte MCP の `mcp__svelte__get-documentation` で `kit/hooks`、`kit/configuration`、`kit/observability` を取得し、3 系統構成・`handleValidationError` 引数・`reroute` async 対応（2.18+）・`event.tracing` API（2.31+）の最新仕様に基づいて記述。
- frontmatter の `description` も「Server/Client/Universalの3系統」を含む内容へ更新（35 文字以内ルールは title 側のみ適用、description は SEO 範囲内）。

## [2026-05-13] - 記事刷新 Sprint 1（即時修正 21 項目）

### 概要

`REVIEW-REPORT-2026-05-12.md` に基づく Sprint 1 を完了。SvelteKit 2 違反、Svelte 5 Runes 違反、エコシステム陳腐化、混入バグ、CLI 表記古さなど「コピペで動かない／論理的に常に真偽になる」レベルの問題を一括是正した。

### Sprint 1-A: 機械的な一括修正

- **`throw redirect / throw error` を全廃**（23 ファイル・86 件）。SvelteKit 2 では `redirect()` / `error()` 関数自体が例外を投げるため `throw` キーワード不要。Mermaid 図内の擬似コード 2 件も整合のため修正。
  - `reference/sveltekit2`、`routing/{basic,dynamic,advanced,error-pages}`、`data-loading/{basic,typescript-types,streaming}`、`basics/{file-system,global-types}`、`server/{api-routes,forms}`、`application/{auth-best-practices,session}`、`architecture/spa-mpa-hybrid`、`optimization/{caching,observability}`、`examples/{auth-cookie-session,auth-jwt,auth-route-groups,auth-system}`、`deep-dive/auto-generated-types`、`svelte/runes/derived`
- **`prefetch` / `prefetchRoutes` → `preloadData` / `preloadCode` 置換**（`routing/advanced`、`data-loading/flow`）。SvelteKit 1 系の API は完全に廃止されており、コピペで `import` 解決失敗していた。
- **`data-sveltekit-preload-data` 不正値修正**：`"eager"`（`routing/basic` L541）と `"off"`（`data-loading/flow` L218）を有効値（`"hover"` / `"tap"` / `"false"`）に修正し、`data-sveltekit-preload-code` 側の値（`"eager"` / `"viewport"`）との違いを Admonition で明示。
- **記事破損バグ 2 件修正**：
  - `optimization/caching/+page.md` L139–142：`manifest.json` 内に frontmatter `description` 文字列が混入していたのを除去
  - `deep-dive/auto-generated-types/+page.md` L436：コードブロック内に frontmatter `description:` が混入していたのを除去
- **`introduction/typescript-setup` L482 の `npm run svelte-kit sync`**（動作しないコマンド）を `npx svelte-kit sync` / `npm run prepare` に置換。
- **`reference/sveltekit2` の `handleValidationError` 誤シグネチャ**を `{ event, issues }` に修正（旧コードは `event.issues.map(...)` で `issues` は未定義）。

### Sprint 1-B: Runes 違反コードの修正

- **`runes/state` のビルトインクラス例**：`$state(new Map/Set/Date/URL())` の二重ラップを撤廃し、`svelte/reactivity` の `SvelteMap` / `SvelteSet` / `SvelteDate` / `SvelteURL` を直接使う形に書き換え。
- **`advanced/reactivity-window` の `$derived(() => ...)` 関数引数誤用**を 8 箇所すべて `$derived.by(() => ...)` に修正（実行時に関数オブジェクトが表示される実害あり）。
- **`runes/effect` の偽 `import { Suspense } from 'svelte'` 削除**（Svelte に `Suspense` は存在せず、`<svelte:boundary>` 単体で完結）。
- **`runes/comparison` L451 の Vue 比較誤記**（`@event → on:event` → `@event → onevent`）を修正。
- **`runes/props` のジェネリック例コンパイル不能修正**：`$props<T>()` ジェネリック呼び出しを `let { ... }: Props = $props()` に統一、`<script lang="ts" generics="T">` 属性を追加。DataTable 例には `SvelteSet` も導入。
- **`basics/motion` L673 の `$:` 残存修正**：Runes モードでは構文エラーになるため、`$effect` ＋ `subscribe()` / `get()` のパターンに書き換え、警告を明示。
- **`basics/attachments` L137–155 の Admonition ネスト破綻修正**：`<Admonition>` と `:::` 終端の混在を解消。

### Sprint 1-C: `$app/state` セマンティクス修正

- **`basics/app-modules` の `updated` 使い方修正**：`if (updated)` は常に真になる論理バグを `if (updated.current)` に修正。`updated.check()` の手動再チェック例を追加。
- **同 `navigating` 使い方修正**：`{#if navigating}` は常に真のため `{#if navigating.from}` に修正。`type` の値リストに `'form'` を追加。

### Sprint 1-D: examples/auth-jwt 状態表記整合（取り消し）+ CLAUDE.md 修正

- 本項目（記事側の「完成」表記）は **取り消し済み**。当初 CLAUDE.md の「✅ 完成済み」表記に従って `auth-jwt` を「完成」へ更新したが、リポジトリ `shuji-bonji/svelte5-auth-jwt` および Vercel デモが実在しないことを WebSearch で確認したため、`auth-jwt/+page.md`、`examples/+page.md`、`auth-system/+page.md` の関連表記を全て「準備中」に戻した。
- **CLAUDE.md の修正**: 「完成済み」表から `svelte5-auth-jwt` を除外し、「準備中 / 開発中」セクションを新設してそちらに移動。`svelte5-auth-route-groups` も同セクションに整理。実態と乖離しないよう運用ルール（実物の存在を確認してから記事に反映する）を表直下に注記として追加。
- **教訓**: 情報源として CLAUDE.md を盲信せず、実リポジトリ・実デモ URL を一次情報として確認すること。

### Sprint 1-E: introduction/setup 全面更新

- **CLI コマンド**：`npm create svelte@latest` を「廃止済み」と明記して削除、`npx sv create` のみを残し、`pnpm dlx` / `bun x` の代替コマンドを追加。
- **対話プロンプト例**：旧 `Svelte CLI (v0.9.2)` 表記を最新の対話フローに置換。`lucia` を削除し `better-auth` を追加、`mcp` / `storybook` / `sveltekit-adapter` を追加。
- **package.json 例**：Svelte 5.55+ / SvelteKit 2.58+ / TypeScript 6 / Vite 8 / vite-plugin-svelte 7 にバージョン更新。`"prepare": "svelte-kit sync"` を追加。
- **Node.js バージョン**：22.x LTS を推奨に格上げ（20.x はメンテナンスフェーズ）。`engines.node >= 22.0.0` に。
- **nvm URL**：v0.39.0 → v0.40.3 に更新。
- **追加ツール選択ガイド**：`lucia` → `better-auth` 置換、`mdsvex` / `paraglide` / `mcp` を追記。

### Sprint 1-F: introduction/hello-world 順序見直し

- **例の順序を Svelte 5 ファースト**に変更。Svelte 4 レガシー例は参考扱いに移動し `:::caution` で「新規コードでは使用禁止」を明示。
- **`let count = 0` が Runes モードで非リアクティブ**である旨を `:::caution` で明示（読者の誤解を防ぐ）。
- **`<img {src} {alt} width={width} />` を `{width}` ショートハンドに統一**。
- 「TypeScriptを使用する」セクションで「本ガイドでは TypeScript を前提とする」と明記。

### Sprint 1-G: introduction/cli オプション表補完

- **`pnpx sv` → `pnpm dlx sv` に修正**（pnpm v6.13 で削除済みのエイリアス）。`bun x` / `deno run` も追加。
- **`sv create` の表**に `--from-playground`、`--no-add-ons`、`--no-dir-check` を追加。`--install <pm>` の値も列挙。
- **`sv add` の表**に `--no-download-check` を追加（本文の Admonition との不整合を解消）。
- **`sv check` の表**に `--preserveWatchOutput`、`--no-tsconfig`、`--threshold`、`--compiler-warnings`、`--diagnostic-sources` を追加。`--output` の値を 4 種すべて記載。
- **マシンリーダブル出力例**に `FILES_WITH_PROBLEMS` フィールドを追加。
- **`--ignore` の落とし穴**を `:::info` で明示（`--no-tsconfig` 併用時のみ「診断対象」に効く、`node_modules` は既定除外）。
- **`package.json scripts` 例**に `"test": "vitest"`、`"prepare": "svelte-kit sync"` を追加し、`prepare` の意義を `:::tip` で説明。

### Sprint 1-H: Tauri 2.x コード更新

- **`architecture/desktop-mobile`** の Tauri 1.x API を全件 Tauri 2.x に書き換え：
  - `@tauri-apps/api/tauri` → `@tauri-apps/api/core`（`invoke`）
  - `@tauri-apps/api/dialog` → `@tauri-apps/plugin-dialog`
  - `@tauri-apps/api/fs` → `@tauri-apps/plugin-fs`
  - `@tauri-apps/api/updater` → `@tauri-apps/plugin-updater`（API も `checkUpdate`/`installUpdate` → `check()`/`downloadAndInstall()` に変更）
- **Capacitor `@capacitor/storage` → `@capacitor/preferences` 置換**（Capacitor 4.x で改名済み）。`any` を排し型安全な実装に。
- Tauri 2.x への移行ポイント全体を `:::info` で集約説明。

### Sprint 1-I: Apollo / urql エコシステム更新

- **`architecture/spa-patterns/graphql`** の Apollo Client 設定：
  - 削除済みの `WebSocketLink`（`@apollo/client/link/ws`）を `GraphQLWsLink`（`@apollo/client/link/subscriptions`）＋ `graphql-ws` に置換
  - 認証ヘッダーを `setContext` リンク経由の動的注入に変更（トークン更新追従）
- **urql v4 設定**：削除済みの `defaultExchanges` を撤廃し、`cacheExchange` / `fetchExchange` / `subscriptionExchange` の個別 import に変更。`fetchOptions` も関数形式（動的トークン）に。
- それぞれの破壊的変更を `:::info` で明示。

### 検証

- `mcp__svelte__svelte-autofixer`：主要書き換えコード 3 件（hello-world Counter、runes/props DataTable、reactivity-window DeviceType）で `issues: [], suggestions: []` クリーン。
- `mcp__svelte__get-documentation` で `kit/load`、`kit/$app-state`、`kit/$app-navigation`、`kit/link-options`、`kit/remote-functions`、`svelte/$state`、`svelte/$derived`、`svelte/$effect`、`svelte/$props`、`svelte/svelte-reactivity`、`svelte/svelte-reactivity-window`、`cli/sv-create`、`cli/sv-add`、`cli/sv-check`、`cli/sv-migrate` を最新仕様として照合。

### 影響範囲

修正ファイル数: 約 35 ファイル（routes 配下の `.md`）。Mermaid 図のテキスト 2 箇所、`package.json` の引用例 2 箇所、`<Admonition>` 構造 1 箇所も含む。

## [2026-05-12] - `static/` と `src/lib/assets/` の使い分けセクション追加＋環境構築からの導線設置

### 概要
SvelteKit 学習者が `sv create` 直後に最初に疑問を持つ「`static/` と `src/lib/assets/` はどう違うのか」を `/sveltekit/basics/project-structure/` に正面から解説する新セクションを追加。あわせて、`/introduction/setup/` のプロジェクト構造セクションから本ページへの**導線リンク**を設置し、「あとから戻ってきて参照できる場所がある」と認識してもらえる構造に変更した。

### 追加：`/sveltekit/basics/project-structure/` の新セクション
`static/` セクション直後に「### `static/` と `src/lib/assets/` の使い分け」を追加。

- **公式方針の明示**：Svelte 公式ドキュメント（[kit/project-structure](https://svelte.dev/docs/kit/project-structure)）の「`static/` のアセット数は最小化し、代わりに `import` を使う」推奨を明示
- **比較表**：参照方法／ハッシュ付与／キャッシュ戦略／Vite 処理／インライン化／ビルド出力／型補完／公式推奨度 の 8 観点で対比
- **コード例**：`import` 経由（推奨）と URL 直書き（例外用途）の Svelte 5 Runes 構文サンプル（`svelte-autofixer` で検証済み、issue 0 件）
- **使い分けの判断基準**：`static/` に置くべきもの（`robots.txt` / `favicon.ico` / OGP 画像など URL 固定が必須なもの）と `$lib/assets/` に置くべきもの（コンポーネントから参照するロゴ・装飾画像・フォント）
- **`$lib/assets/` のメリット 4 点**：キャッシュ破棄の自動化、未使用 tree-shaking、TypeScript 型補完、小さい画像の自動インライン化
- **enhanced-img への導線**：`@sveltejs/enhanced-img` の `:::tip` 補足
- **Angular 出身者向けの補足**：`src/assets/` 感覚で `static/` を使い続けることのキャッシュ上の不利を `:::caution` で明示

### 追加：`/introduction/setup/` の導線リンク
- 「プロジェクト構造」セクション冒頭に `:::tip[このセクションは「全体マップ」です]` を追加し、`/sveltekit/basics/project-structure/` への参照を明示
- 「次のステップ」末尾に同ページへの誘導段落を追加

### 設計判断
- 既存ファイル（project-structure）は `<Admonition>` 直書きベースだが、新規追加分は CLAUDE.md の方針通り `:::` ディレクティブ記法を採用。`admonitionPreprocessor` がファイル内混在を許容するため動作問題なし
- 既存ファイルの全面置換は別途実施

### 検証
- `mcp__svelte__svelte-autofixer`：追加サンプルコードに対し issue 0 件
- `mcp__svelte__get-documentation` `kit/project-structure` / `kit/$lib` / `kit/images` で事実関係を確認

## [2026-05-06] - 依存関係メジャーアップデート（Vite 8 / vite-plugin-svelte 7 / TypeScript 6）

### 概要
Dependabot から提示されていたメジャー更新 3 件と、マイナー／パッチ 2 件を merge し、ビルドツールチェインを 1 段階引き上げた。SveltePress 廃止後はフレームワーク固有のバージョン制約から解放されており、いずれの PR も大きな修正なく適用完了。

### 依存パッケージ更新
- **vite**: 6.4.2 → 8.0.10（#183、メジャー2段飛ばし）
- **@sveltejs/vite-plugin-svelte**: 5.1.1 → 7.x（#180、メジャー2段飛ばし。Vite 8 と組み合わせ前提のためセットで検証）
- **typescript**: 5.9.3 → 6.0.3（#179、メジャー）
- **@sveltejs/kit**: 2.57.1 → 2.58.0（#182、マイナー）
- **svelte**: 5.55.4 → 5.55.5（#181、パッチ）

### TypeScript 6 の事前検証
本体 TS の lib/strictness 変更が広く影響するため、merge 前に sandbox（`/tmp` に本リポジトリを複製、`typescript@6.0.3` 固定）で実走確認を実施。

- 周辺ツールの peerDependencies はいずれも TS 6 を許容
  - `svelte-check` 4.4.8 → `typescript >= 5.0.0`
  - `svelte2tsx` 0.7.55 → `^4.9.4 || ^5.0.0 || ^6.0.0`（**TS 6 を明示**）
  - `@sveltejs/kit` 2.59 → `^5.3.3 || ^6.0.0`（**TS 6 を明示**）
  - `mdsvex` 0.12.7 → TS の peerDependency なし（型処理は svelte2tsx 経由）
- `npm install` → 594 packages、peer-dep 衝突なし
- `npm run check`（`svelte-check`）→ **0 errors / 1 warning**（残った 1 件は `Mermaid.svelte` の既存 a11y 警告で TS 6 とは無関係）
- `vite build` → 21.8s で完走、PWA precache 437 entries 生成、`dist/` 出力までクリーン

### CLAUDE.md 更新
- 技術スタック表の Vite を「7.x以上」→ **「8.x以上」**
- 技術スタック表の TypeScript を「5.x以上」→ **「6.x以上」**

### README.md 更新
- 技術スタックバージョンの最新化（Svelte 5.55+ / SvelteKit 2.58+ / TypeScript 6.0+ / Vite 8.0+ / Mermaid 11.14+）
- SvelteKit バッジを v2.55 → v2.58 に更新
- 推奨環境/前提条件の Node.js を「18.19+」→「20.x LTS+」に統一（CLAUDE.md の最低バージョン記述と整合）
- セットアップ／ビルド／プレビューの記述を実態に合わせて `pnpm` → `npm` に変更（`package-lock.json` 管理・CI の `npm ci` と一致）
- `navigation-from-config` の説明を「vite.config.ts から」→「sidebar.ts から」に修正
- Last Updated を 2026年5月6日に更新

## [2026-04-21] - SEO 改善：タイトル 70 文字超過 14 ページ修正＋ Tier 1 記事 3 本のリライト

### 概要
Bing Webmaster Tools の警告（タイトル 70 文字超過）対策として、`<title>` フルレンダリング（`| TypeScriptで学ぶ Svelte 5/SvelteKit` の 35 文字サフィックス込み）が 70 文字を超えていた 14 ページのタイトルを短縮。あわせて、GSC 3 ヶ月分のデータで **高表示・低 CTR** だった Tier 1 の 3 ページをリライトし、タイトル/ディスクリプション/導入部の SEO 最適化を実施。

### タイトル短縮（14 ページ）
全ページで frontmatter `title` を 35 文字以内に揃え、フルタイトルが 70 文字以下になることを確認（検証スクリプト合格）。

| ページ | Before(full) | After(full) |
| --- | ---: | ---: |
| `introduction/eslint-prettier` | 95 | 69 |
| `svelte/runes/comparison` | 82 | 70 |
| `svelte/runes/effect` | 81 | 65 |
| `svelte-mcp/eslint-integration` | 80 | 68 |
| `svelte/runes/derived` | 80 | 57 |
| `svelte/runes/state` | 79 | 54 |
| `deep-dive/derived-vs-effect-vs-derived-by` | 76 | 68 |
| `svelte/runes/bindable` | 76 | 57 |
| `sveltekit/architecture/spa-mpa-hybrid` | 76 | 51 |
| `svelte/advanced/reactivity-window` | 75 | 67 |
| `deep-dive/html-templates-and-snippets` | 72 | 69 |
| `sveltekit/routing/error-pages` | 72 | 56 |
| `svelte/runes/props` | 71 | 57 |
| `sveltekit/server/remote-functions` | 71 | 59 |

### Tier 1 リライト（高表示・低 CTR 対策）
- **`src/routes/svelte/runes/host/+page.md`**
  - description を「Web Components / $host() / dispatchEvent / Shadow DOM」を含むキーワード豊富な版に刷新
  - 冒頭の 1 文だけだった導入を、「いつ `$host()` が必要か」「代表的な用途は dispatchEvent によるカスタムイベント発火」を明示する 3 段落に拡張。最小の Counter コード例を前倒し配置
- **`src/routes/svelte/basics/special-elements/+page.md`**
  - description に `svelte:element` / `svelte:window` / `svelte:document` / `svelte:body` / `svelte:head` / `svelte:options` / `svelte:boundary` を全列挙し、個別要素名で検索するユーザーとのマッチを強化
- **`src/routes/svelte/runes/derived/+page.md`**
  - 導入直後に「`$derived` と `$derived.by` の使い分け早見表」セクションを新設（比較表＋最小コード例）。「derived」「derived by」で検索するユーザーがページ上部で両者の違いを即確認できるよう前倒し
  - 元々 `## $derived.by - 複雑な計算ロジック` 冒頭にあった重複 tip（同内容の使い分け説明）を削除し、早見表セクションへのアンカーリンクで参照

### 運用ルール追加
- 新規 `+page.md` 追加時は **frontmatter `title` を 35 文字以内** に収めれば、サフィックス付与後の `<title>` が 70 文字以下を自動的に満たす
- サフィックスに `TypeScript` / `Svelte 5` / `SvelteKit` が含まれるため、各ページ title ではこれらの繰り返しを避け、**ページ固有の概念・API 名・機能名** を主役にする

### 検証
- Python スクリプトで `src/routes/**/+page.md` を再帰スキャンし、全 142 ページで `<title>` フル長 ≤ 70 を確認
- 新規コード例は `svelte-autofixer` MCP で検証（`DerivedExample.svelte` クリーン、`Counter.svelte` は `customElement: true` コンパイラオプションに関する meta 警告のみで、既存同ページの例と整合）

## [2026-04-21] - `svelte/architecture/` セクションのハブ同期

### 概要
`src/routes/svelte/architecture/` 配下には `spa-patterns`（概要・Firebase・Supabase・GraphQL）・`hybrid-integration`・`desktop-mobile` の実ページが存在していたが、`/svelte/+page.md`（ハブ）のカード一覧・学習ロードマップ Mermaid 図・推奨学習順序には反映されておらず、サイドバー側も `hybrid-integration` が未登録だった。サイドバーとハブの案内を実態に合わせて同期。

### 更新
- **`src/lib/config/sidebar.ts`**: `/svelte/architecture/` 配下に `既存システム統合 → /svelte/architecture/hybrid-integration/` を追加
- **`src/routes/svelte/+page.md`**
  - 学習コンテンツカードを 3 枚（基本編・Runes・実践編）→ **4 枚**（+ 🏛️ アーキテクチャ編）に拡張。アーキテクチャ編カードには概要／SPA+API／Firebase／Supabase／GraphQL／既存システム統合／デスクトップ・モバイルの 7 リンクを配置
  - 学習ロードマップ Mermaid を `Advanced → Choice` から `Advanced → Architecture → Choice` に変更（teal 配色で `Architecture` ノードを追加）
  - 「推奨学習順序」を 4 項目→**5 項目**に、「学習の始め方」に Step 4（アーキテクチャ選定）を追加
- **`CLAUDE.md`**: 第2部のカリキュラム記述から「計画中:」表記を除去し、実際のサブトピック（SPA+API、BaaS=Firebase/Supabase、GraphQL、既存システム統合、Tauri/Electron/Capacitor）に差し替え。`hybrid-integration` はスタブである旨を注記

### 未対応（今後の宿題）
- **`src/routes/svelte/architecture/hybrid-integration/+page.md`**: 32 行のスタブ状態。本文内の「準備中」Admonition 付きで公開。Rails/Laravel/Django への段階導入の具体例を加筆予定

## [2026-04-21] - Admonition ディレクティブ記法（`:::`）を本命ルートに復活

### 概要
SveltePress 廃止後の mdsvex 移行で機能停止していた `:::note` / `:::tip` / `:::warning` / `:::caution` / `:::info` のディレクティブ記法を復活。原則として `:::` 記法を本命ルートとし、`<Admonition>` コンポーネント直書きは動的プロパティ等の例外用途のみとするルールを CLAUDE.md に明文化した。

### 追加
- **`markdown-plugins/preprocess-admonition-import.js`**: Svelte preprocessor（`markup` フック）として `mdsvex` の**前段**で走る正規表現ベースの変換器
  - `:::type[title]` → `<Admonition type="type" title="title">`、対応する `:::` → `</Admonition>` に変換（スタックベースでネスト対応）
  - コードフェンス（` ``` ` / ` ~~~ `）内の `:::` は変換しない（記法例示に安全）
  - 先頭インデントを許容（`^\s*` 前置）
  - 変換を行ったファイルには `import Admonition from '$lib/components/Admonition.svelte'` を自動注入（既存 `<script>` にマージ、無ければフロントマター直後に新規挿入）
  - Svelte 属性値のサニタイズ（`&` `"` `{` `}` をエスケープ）
- **`svelte.config.js`**: `preprocess` 配列の先頭に `admonitionPreprocessor()` を配置
- **CLAUDE.md**: 「情報の強調表示（Admonition）」セクションを全面刷新。原則 `:::` 記法ルール／サポート種別／変換の仕組み／例外ケースを明記。ディレクトリ構造にも `markdown-plugins/` を追記

### 採用しなかったアプローチ
- **`remark-directive` + `mdast-util-directive`**: mdsvex 0.12.7 が内包する `remark-parse` が v8 系で、`remark-directive` v4 / v1 系いずれも unified 11 系を要求するため互換性が取れず断念。最新 mdsvex で公式対応されるまでは preprocessor アプローチで維持する

### 既存記事の整合修正
- **`src/routes/introduction/setup/+page.md`**: `:::important` → `:::info[重要]`（`important` は Admonition の `type` に存在しないため）
- **`src/routes/svelte/basics/attachments/+page.md`**: `:::note[ネストしたエフェクト]` の閉じ `:::` 欠落を補完
- **`src/routes/svelte/runes/derived/+page.md`**: 複数箇所で `<Admonition>` 直書きと `:::` が混在し対応が取れていなかったのを修正。「オーバーライドの動作」「非同期派生値の注意」ブロックを `:::` 記法に統一

### 検証
- プロジェクト内で `:::` ディレクティブ記法を使っている全 `.md` ファイルに対し、preprocessor + mdsvex 通過後の `<Admonition>` 開閉タグ数が一致することを確認（archive の `_archive/examples/features-demo/+page.md` を除く）
- archive 配下の不整合は通常ナビゲーションから隔離されているため優先度低として後日対応

## [2026-04-18] - レガシー構文の一括検証と残存箇所の刈り取り

### 概要
記事コードブロックに対して Svelte 4 系レガシー構文（`export let` / `on:event` / `createEventDispatcher` / `$:` / `<slot />` / `$app/stores` / `$$props`）の横断チェックを実施。ヒットした箇所を「新旧対比として意図的に提示しているもの」と「そのまま放置されていたもの」に分類し、後者 4 箇所を現行仕様に置換。

### 更新
- **`src/routes/sveltekit/optimization/pwa/+page.md`**: 手動 SW 登録の `+layout.svelte` サンプルから `<slot />` を除去し、`{ children: Snippet } = $props()` + `{@render children()}` に刷新。`newWorker` の optional chaining も漏れていたので併せて修正
- **`src/routes/reference/sveltekit2/+page.md`**: `+error.svelte` ベストプラクティス例の `import { page } from '$app/stores'` を `$app/state` 版に置換。独自 props で `error` / `status` を受け取る旧パターンをやめ、`page.error` / `page.status` を `$derived` で参照する現行スタイルに統一
- **`src/routes/sveltekit/architecture/routing-internals/+page.md`**: ナビゲーションパフォーマンス計測を `navigating.subscribe()` から `$app/state` の `navigating` + `$effect` パターンに書き直し。旧サンプルに混入していた `window.web-vitals` / `getFID` の誤記も除去し、`web-vitals` v4 系の `onLCP` / `onCLS` / `onINP` ベースに更新
- **`src/routes/sveltekit/application/testing/+page.md`**: `vi.mock('$app/stores', ...)` 単独だったモック例を、`$app/state`（プレーンオブジェクト）を主・`$app/stores`（`readable` ストア）を併記という構成に変更。新規プロジェクトでは前者のみで足りる旨を `tip` で補足

### 検証
- 横断グレップで拾ったレガシー構文ヒット箇所を全数目視確認、対比例として意図的な提示（`reference/svelte5/+page.md` の Svelte 4 ↔ 5 対比表、`runes/props`・`runes/bindable`・`basics/template-syntax` の「Svelte 4 以前の書き方」ブロック、`introduction/hello-world` / `introduction/why-svelte` / `runes/runes-introduction` / `advanced/reactive-stores` / `basics/motion` の新旧比較、`svelte-mcp/tools` / `svelte-mcp/usecases` の MCP 入力サンプル、`introduction/cli` の `sv migrate` 解説、`data-loading/basic` の `$app/state` vs `$app/stores` 比較、`basics/app-modules` のレガシー併記セクション）と区別
- Svelte MCP `svelte-autofixer` で PWA の `+layout.svelte`、`+error.svelte`、`routing-internals` の新サンプルを検証 → いずれも `issues: []`

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
