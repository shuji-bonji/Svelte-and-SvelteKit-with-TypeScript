# 刷新計画書：Svelte/SvelteKit 学習サイト最新化（2026年4月）

> 作成日: 2026-04-12
> ベース: DIFF-REPORT-2026-04.md（Svelte MCP による全セクション差分レポート）
> パッケージ: Svelte ^5.53.11 / SvelteKit ^2.55.0 / Vite ^7.3.1

---

## 進捗サマリー

| フェーズ | 完了 | 残り | 進捗率 |
|---------|------|------|--------|
| ステップ1〜3（基盤更新） | 3/3 | 0 | ✅ 100% |
| ステップ4〜7（各セクション更新） | 4/4 | 0 | ✅ 100% |
| ステップ8〜10（拡張・新規） | 3/3 | 0 | ✅ 100% |
| **全体** | **10/10** | **0** | **✅ 100%** |

---

## 完了済み作業

### ✅ ステップ1：リファレンスページ更新

**対象ファイル:**
- `src/routes/reference/svelte5/+page.md`
- `src/routes/reference/sveltekit2/+page.md`

**更新内容（Svelte 5リファレンス）:**
- `$state.frozen` → `$state.raw` リネーム対応
- Overridable `$derived`（Svelte 5.25+）セクション追加
- `$effect.pending()` セクション追加
- Svelte 5イベント構文修正（modifier構文削除、callback props化）
- `createEventDispatcher` → callback propsパターン
- `Component` 型（旧 `ComponentType<SvelteComponent>` 置換）
- `flushSync()` セクション追加
- 移行チェックリスト 5項目追加

**更新内容（SvelteKit 2.xリファレンス）:**
- Remote Functions セクション大幅拡充
  - `.remote.ts` ファイル規約の説明
  - `query.batch()`（v2.35+）N+1問題解決
  - Standard Schema バリデーション（Valibot例）
  - `$app/server` エクスポート一覧表
- `handleValidationError` フック追加
- `PageProps` / `LayoutProps` 型パターン追加
- `$app/types` セクション追加（`RouteId`, `RouteParams`, `Pathname`）
- ストリーミングSSRコード例を `PageProps` パターンに更新

### ✅ ステップ2：svelte:boundary + await expressions

**対象ファイル:**
- `src/routes/svelte/basics/special-elements/+page.md`

**更新内容:**
- `pending` snippet セクション追加（await expressions対応）
- `onerror` プロパティのドキュメント追加
- プロパティ一覧表（failed, pending, onerror）追加
- `pending` vs `$effect.pending()` の使い分けTip追加

**確認結果:**
- `src/routes/svelte/advanced/await-expressions/+page.md` — 既に十分に最新。変更不要

### ✅ ステップ3：$appモジュールページ更新

**対象ファイル:**
- `src/routes/sveltekit/basics/app-modules/+page.md`

**更新内容:**
- `$app/server` セクション大幅拡充（query, form, command, prerender, query.batch, Standard Schema）
- `$app/types` セクション新規追加（RouteId, RouteParams, Pathname）
- Mermaidダイアグラムに `$app/server`、`$app/types` 追加
- 認証パターンを `$app/state` 推奨に更新
- ローディング表示パターンを `$app/state` 推奨に更新
- meta description を最新モジュール名に更新

---

## 完了済み作業（ステップ4〜10）

### ✅ ステップ4：Remote Functionsページ充実

**対象ファイル:**
- `src/routes/sveltekit/server/remote-functions/+page.md`（既存ページ）

**更新内容:**
- [x] Standard Schema バリデーションの詳細例（Zod, Valibot両方）
- [x] `query.batch()` の実践例とN+1問題の解説
- [x] `getRequestEvent()` の使用例
- [x] `requested()` の使用例
- [x] `.remote.ts` ファイルの命名規約と配置ルール
- [x] Remote Functions vs Form Actions の使い分けガイド
- [x] `form.preflight()` クライアントサイドバリデーション追加
- [x] `form.for(id)` 複数フォームインスタンス追加
- [x] Single-flight mutations（サーバー駆動/クライアント要求）追加
- [x] `handleValidationError` フック連携追加

---

### ✅ ステップ5：Runes各ページ更新

**対象ファイル:**
- `src/routes/svelte/runes/state/+page.md`
- `src/routes/svelte/runes/derived/+page.md`
- `src/routes/svelte/runes/effect/+page.md`
- `src/routes/svelte/runes/inspect/+page.md`

**確認結果:**
- [x] `$state` ページ: `$state.raw()` — 既に詳細に記載済み。変更不要
- [x] `$derived` ページ: Overridable `$derived`（Svelte 5.25+）— 既に記載済み。変更不要
- [x] `$effect` ページ: `$effect.pending()` — 既に記載済み。変更不要
- [x] `$effect` ページ: `$effect.tracking()` / `$effect.root()` — 既に記載済み
- [x] `$inspect` ページ: `$inspect().with()` — 既に記載済み

※ 前回の刷新時に既に対応済みだったため、追加変更なし

---

### ✅ ステップ6：CLIページ更新

**対象ファイル:**
- CLI関連ページ（要特定）

**更新内容:**
- [x] `sv add` アドオン一覧: `lucia` 削除、`better-auth` 追加
- [x] アドオン一覧をアルファベット順に再整理（12項目）
- [x] lucia → better-auth 移行に関するnoteボックス追加
- [x] コミュニティアドオンセクション新規追加（npm規約、使用例、セキュリティ警告）

---

### ✅ ステップ7：Hooksページ更新

**対象ファイル:**
- `src/routes/sveltekit/server/hooks/+page.md`（準備中→実装）

**更新内容:**
- [x] `handleValidationError` フックの解説追加（概要表、コード例、tip）
- [x] Remote Functionsとの連携パターン
- [x] 既存Hooks（handle, handleFetch, handleError）の最新確認 — 問題なし
- [x] まとめテキストを4フックに更新

---

### ✅ ステップ8：データ取得セクション更新

**対象ファイル:**
- `src/routes/sveltekit/data-loading/` 配下の複数ページ

**更新内容:**
- [x] `typescript-types/+page.md` に PageProps/LayoutProps 専用セクション追加
- [x] Mermaidダイアグラムに PageProps/LayoutProps ノード追加
- [x] 全コード例を `{ data: PageData }` → `PageProps` パターンに更新（約25ファイル）
- [x] `LayoutData` → `LayoutProps` パターン更新（3ファイル）
- [x] Mermaidシーケンス図内の型表記も更新
- [x] 既存パターンとの比較セクション（旧パターンは比較用に保持）

**更新ファイル一覧:**
- `data-loading/typescript-types/+page.md`（主要セクション追加）
- `data-loading/streaming/+page.md`、`spa-invalidation/+page.md`、`strategies/+page.md`
- `routing/basic/+page.md`、`dynamic/+page.md`、`advanced/+page.md`、`shallow/+page.md`、`link-options/+page.md`
- `architecture/spa-mpa-hybrid/+page.md`、`access-logs/+page.md`、`file-structure/+page.md`、`hydration/+page.md`
- `server/server-only-modules/+page.md`、`forms/+page.md`
- `basics/overview/+page.md`、`file-system/+page.md`
- `examples/blog-system/+page.md`
- `deep-dive/auto-generated-types/+page.md`
- `svelte/runes/derived/+page.md`

---

### ✅ ステップ9：新規ページ作成

**作成内容:**
- [x] **`svelte/events` モジュール解説** — `src/routes/svelte/basics/events-module/+page.md`
  - `on()` ヘルパー関数の全API解説
  - TypeScript型推論（Window/Document/HTMLElement/EventTarget）
  - `$effect`との組み合わせパターン
  - イベントオプション（once, capture, passive）
  - 実践例（キーボードショートカット、スクロール追跡、リサイズ）
  - `addEventListener`との比較表
  - `createSubscriber`との連携（MediaQuery実装例）
  - Mermaidダイアグラム2点
- [x] sidebar.ts へのナビゲーション追加

**未作成:**
- Project Types ガイドは今回スコープ外（既存のレンダリング戦略ページで一部カバー）

---

### ✅ ステップ10：準備中ページの着手

**確認・作成結果:**

既に完成済み（変更不要）:
- [x] `src/routes/sveltekit/server/api-routes/+page.md` — 679行、完成済み
- [x] `src/routes/sveltekit/server/hooks/+page.md` — 845行、完成済み（ステップ7で handleValidationError 追加済み）

新規コンテンツ作成:
- [x] `src/routes/sveltekit/application/error-handling/+page.md` — 準備中→本格実装
  - 予期される/予期しないエラーの分類、error()関数、+error.svelte、handleErrorフック
  - App.Error型カスタマイズ、フォールバックエラーページ、レンダリングエラー対応
  - Mermaidダイアグラム2点
- [x] `src/routes/sveltekit/application/environment/+page.md` — 準備中→本格実装
  - 4つの$envモジュール解説、.envファイル設定、static vs dynamic比較表
  - TypeScript型定義、セキュリティベストプラクティス
  - Mermaidダイアグラム1点
- [x] `src/routes/sveltekit/optimization/seo/+page.md` — 準備中→本格実装
  - svelte:head、SEOコンポーネント、OGP/Twitter Card、JSON-LD構造化データ
  - サイトマップ自動生成、robots.txt、canonical URL
  - Mermaidダイアグラム1点

---

## 完了記録

全10ステップが2セッションで完了しました。

| ステップ | 完了セッション |
|---------|--------------|
| 1〜3: 基盤更新 | セッション1 |
| 4〜7: 各セクション更新 | セッション2 |
| 8〜10: 拡張・新規 | セッション2 |

---

## 注意事項

### 未コミットの変更

ステップ4〜10の変更はファイルに反映済みですが、**gitコミットが未作成**です。
以下の推奨コミット例を参考にしてください：

```bash
# Remote Functions拡充
git add src/routes/sveltekit/server/remote-functions/+page.md
git commit -m "docs(remote-functions): query properties, form.preflight(), single-flight mutations, handleValidationError連携追加"

# CLI更新
git add src/routes/introduction/cli/+page.md
git commit -m "docs(cli): better-auth追加、lucia削除、コミュニティアドオンセクション追加"

# Hooks更新
git add src/routes/sveltekit/server/hooks/+page.md
git commit -m "docs(hooks): handleValidationErrorフック追加"

# PageProps/LayoutPropsパターン一括更新
git add src/routes/sveltekit/ src/routes/examples/ src/routes/deep-dive/ src/routes/svelte/runes/derived/
git commit -m "docs: PageData/LayoutDataパターンをPageProps/LayoutPropsに一括更新（SvelteKit 2.16+）"

# svelte/eventsモジュール新規ページ
git add src/routes/svelte/basics/events-module/ src/lib/config/sidebar.ts
git commit -m "docs: svelte/eventsモジュール解説ページ新規作成、サイドバーに追加"

# 準備中ページのコンテンツ作成
git add src/routes/sveltekit/application/error-handling/ src/routes/sveltekit/application/environment/ src/routes/sveltekit/optimization/seo/
git commit -m "docs: エラーハンドリング、環境変数管理、SEO最適化ページを本格実装"

# CLAUDE.md・Skill・計画書
git add CLAUDE.md .claude/skills/ UPDATE-PLAN-2026-04.md
git commit -m "docs: CLAUDE.mdスリム化、コーディング規約Skill化、刷新計画書更新"
```

### Svelte MCPの活用
各ステップの作業時は、Svelte MCPで最新の公式ドキュメントを確認しながら進めました。

### ビルド確認
ローカル環境で `npm run build` を実行し、Markdownの構文エラーがないことを確認してください。
