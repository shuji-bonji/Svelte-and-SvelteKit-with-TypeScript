# 刷新計画書：Svelte/SvelteKit 学習サイト最新化（2026年4月）

> 作成日: 2026-04-12
> ベース: DIFF-REPORT-2026-04.md（Svelte MCP による全セクション差分レポート）
> パッケージ: Svelte ^5.53.11 / SvelteKit ^2.55.0 / Vite ^7.3.1

---

## 進捗サマリー

| フェーズ | 完了 | 残り | 進捗率 |
|---------|------|------|--------|
| ステップ1〜3（基盤更新） | 3/3 | 0 | ✅ 100% |
| ステップ4〜7（各セクション更新） | 0/4 | 4 | ⏳ 0% |
| ステップ8〜10（拡張・新規） | 0/3 | 3 | ⏳ 0% |
| **全体** | **3/10** | **7** | **30%** |

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

## 未着手作業（ステップ4〜10）

### ⏳ ステップ4：Remote Functionsページ充実

**対象ファイル:**
- `src/routes/sveltekit/server/remote-functions/+page.md`（既存ページ）

**作業内容:**
- [ ] Standard Schema バリデーションの詳細例（Zod, Valibot両方）
- [ ] `query.batch()` の実践例とN+1問題の解説
- [ ] `getRequestEvent()` の使用例
- [ ] `requested()` の使用例
- [ ] `.remote.ts` ファイルの命名規約と配置ルール
- [ ] Remote Functions vs Form Actions の使い分けガイド

**推定作業量:** 中（既存ページの拡充）
**依存:** なし

---

### ⏳ ステップ5：Runes各ページ更新

**対象ファイル:**
- `src/routes/svelte/runes/state/+page.md`
- `src/routes/svelte/runes/derived/+page.md`
- `src/routes/svelte/runes/effect/+page.md`
- `src/routes/svelte/runes/inspect/+page.md`

**作業内容:**
- [ ] `$state` ページ: `$state.raw()` の詳細解説（パフォーマンス比較、使用ケース）
- [ ] `$derived` ページ: Overridable `$derived`（Svelte 5.25+）の解説と実践例
- [ ] `$effect` ページ: `$effect.pending()` の解説（非同期状態追跡）
- [ ] `$effect` ページ: `$effect.tracking()` / `$effect.root()` の詳細
- [ ] `$inspect` ページ: `$inspect().with()` の詳細例

**推定作業量:** 中〜大（複数ページの更新）
**依存:** なし

---

### ⏳ ステップ6：CLIページ更新

**対象ファイル:**
- CLI関連ページ（要特定）

**作業内容:**
- [ ] `sv` CLI体系の最新化（`sv create`, `sv add`, `sv check` 等）
- [ ] `sv add` アドオン一覧の更新（`better-auth` 等の新規追加分）
- [ ] `sv check` の機能強化内容

**推定作業量:** 小〜中
**依存:** なし

---

### ⏳ ステップ7：Hooksページ更新

**対象ファイル:**
- `src/routes/sveltekit/server/hooks/+page.md`（準備中→実装）

**作業内容:**
- [ ] `handleValidationError` フックの解説追加
- [ ] Remote Functionsとの連携パターン
- [ ] Standard Schema エラーのカスタマイズ例
- [ ] 既存Hooks（handle, handleFetch, handleError）の最新確認

**推定作業量:** 中（準備中ページの本格実装を含む可能性）
**依存:** ステップ4（Remote Functions）の知見

---

### ⏳ ステップ8：データ取得セクション更新

**対象ファイル:**
- `src/routes/sveltekit/data-loading/` 配下の複数ページ

**作業内容:**
- [ ] `PageProps` / `LayoutProps` パターンの反映（全コード例）
- [ ] `export let data` → `$props()` パターンの統一確認
- [ ] ストリーミングSSR例の最新化

**推定作業量:** 中（既存コード例の一括更新）
**依存:** なし

---

### ⏳ ステップ9：新規ページ作成

**新規作成ファイル:**
- `src/routes/sveltekit/basics/project-types/+page.md`（または適切な配置）
- `src/routes/svelte/basics/events-module/+page.md`（または適切な配置）

**作業内容:**
- [ ] **Project Types ガイド** — SSG/SPA/SSR/Library等の選択ガイド
  - 各タイプの特徴、メリット/デメリット
  - ユースケース別の推奨構成
  - adapter選択との関連
- [ ] **`svelte/events` モジュール解説** — プログラマティックイベント管理
  - `on()` ヘルパー関数
  - `MediaQuery` クラス
  - 使用例とユースケース
- [ ] sidebar.ts へのナビゲーション追加

**推定作業量:** 大（ゼロからの新規作成）
**依存:** なし

---

### ⏳ ステップ10：準備中ページの着手

**対象ファイル（現在「準備中」のページ）:**
- `src/routes/sveltekit/application/error-handling/+page.md`
- `src/routes/sveltekit/application/environment/+page.md`
- `src/routes/sveltekit/optimization/seo/+page.md`
- `src/routes/sveltekit/server/api-routes/+page.md`
- `src/routes/sveltekit/server/hooks/+page.md`

**作業内容:**
- [ ] 各ページの本格的なコンテンツ作成
- [ ] CLAUDE.mdのガイドラインに準拠した構成
- [ ] TypeScript完全対応のコード例
- [ ] Svelte 5 / SvelteKit 2.x最新構文の使用

**推定作業量:** 特大（複数ページのゼロからの作成）
**依存:** ステップ4〜8の完了が望ましい

---

## 作業見積もり

| ステップ | 推定作業量 | 推奨セッション数 |
|---------|-----------|----------------|
| 4: Remote Functions充実 | 中 | 1セッション |
| 5: Runes各ページ更新 | 中〜大 | 1〜2セッション |
| 6: CLIページ更新 | 小〜中 | 1セッション |
| 7: Hooksページ更新 | 中 | 1セッション |
| 8: データ取得セクション更新 | 中 | 1セッション |
| 9: 新規ページ作成 | 大 | 2セッション |
| 10: 準備中ページ着手 | 特大 | 3〜5セッション |

**合計推定:** 10〜13セッション（ステップ4〜10）

---

## 推奨進行順序

### フェーズA：コア機能の最新化（ステップ4〜5）
Remote FunctionsとRunesは学習サイトの中核。最優先で対応。

### フェーズB：周辺セクション更新（ステップ6〜8）
CLI、Hooks、データ取得は独立して進行可能。並行作業に適する。

### フェーズC：拡張（ステップ9〜10）
新規ページと準備中ページは、フェーズA/Bの知見を活かして最後に着手。

---

## 注意事項

### 未コミットの変更
ステップ1〜3の変更はファイルに反映済みですが、**gitコミットが未作成**です。
以下のコマンドでセクションごとにコミットしてください：

```bash
# コミット1: 差分レポート
git add DIFF-REPORT-2026-04.md
git commit -m "docs: 2026年4月の全セクション差分レポートを作成"

# コミット2: Svelte 5リファレンス
git add src/routes/reference/svelte5/+page.md
git commit -m "docs(reference): Svelte 5リファレンス最新化 - \$state.raw、overridable \$derived、\$effect.pending()、イベント構文、Component型"

# コミット3: SvelteKit 2.xリファレンス
git add src/routes/reference/sveltekit2/+page.md
git commit -m "docs(reference): SvelteKit 2.xリファレンス最新化 - Remote Functions拡充、query.batch()、Standard Schema、\$app/types、PageProps"

# コミット4: svelte:boundaryと$appモジュール
git add src/routes/svelte/basics/special-elements/+page.md src/routes/sveltekit/basics/app-modules/+page.md
git commit -m "docs: svelte:boundaryにpending snippet追加、\$appモジュールに\$app/server・\$app/types詳細追加"

# コミット5: 刷新計画書
git add UPDATE-PLAN-2026-04.md
git commit -m "docs: 2026年4月の刷新計画書を作成"
```

### Svelte MCPの活用
各ステップの作業時は、Svelte MCPで最新の公式ドキュメントを確認しながら進めることを推奨します。

### ビルド確認
ローカル環境で `npm run build` を実行し、Markdownの構文エラーがないことを確認してください。
