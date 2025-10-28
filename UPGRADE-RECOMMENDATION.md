# メジャーアップグレード推奨事項

## 📋 対象パッケージと推奨アクション

| # | パッケージ | 現在 | 最新 | 推奨アクション | 優先度 |
|---|-----------|------|------|---------------|--------|
| 1 | **vite** | 5.4.21 | 7.1.12 | ❌ 待機 | 低 |
| 2 | **@sveltejs/vite-plugin-svelte** | 4.0.4 | 6.2.1 | ❌ 待機 | 低 |
| 3 | **@types/node** | 20.19.24 | 24.9.2 | ⚠️ 検討可 | 低 |

---

## 🎯 結論と推奨

### ❌ Vite 7.x へのアップグレード: 実施しない

**理由**:

1. **SveltePressの互換性問題**
   ```
   SveltePress (@sveltepress/vite 1.2.2)
   └─ 対応: Vite ^4.3.9 || ^5.0.0
   └─ 未対応: Vite 6.x / 7.x
   ```

2. **エコシステムの状況**
   - ✅ SvelteKit: Vite 7.x 対応済み
   - ✅ @sveltejs/vite-plugin-svelte: Vite 7.x 対応可能
   - ❌ **SveltePress: Vite 5.x まで** ← ボトルネック

3. **アップグレードの影響**
   - SveltePressが動作しなくなる可能性が高い
   - サイト全体のビルドが失敗する
   - 代替手段がない（SveltePressに依存している）

### ⚠️ @types/node: オプショナル

**現在**: Node.js 20 LTS の型定義
**最新**: Node.js 24.x の型定義

**選択肢**:

#### Option A: 現状維持（推奨）
```bash
# 何もしない
# Node.js 20 LTS は2026年4月までサポートされる
```

**メリット**:
- 安定性の維持
- ランタイムと型定義の一致

**デメリット**:
- なし（Node.js 20で十分）

#### Option B: Node.js 22 LTS に合わせる
```bash
npm install --save-dev @types/node@^22
npm run build  # 型チェック
```

**メリット**:
- 最新LTSの型定義
- 新しいNode.js APIの型サポート

**デメリット**:
- 若干の型エラーの可能性（低い）
- 実用上のメリットは少ない

#### Option C: 最新版（非推奨）
```bash
npm install --save-dev @types/node@latest
```

**デメリット**:
- Node.js 24.x はまだLTSではない
- 不安定な可能性

---

## 🔍 調査結果の詳細

### Vite エコシステムの対応状況

```mermaid
graph TD
    A[Vite 7.x] --> B[SvelteKit]
    A --> C[@sveltejs/vite-plugin-svelte]
    A --> D[SveltePress]

    B -->|✅ 対応済み| E[v2.48.2]
    C -->|✅ 対応可能| F[v6.2.1]
    D -->|❌ 未対応| G[v1.2.2]

    style B fill:#90EE90
    style C fill:#90EE90
    style D fill:#FFB6C6
    style A fill:#87CEEB
```

### peerDependencies の確認結果

#### SvelteKit 2.48.2（最新）
```json
{
  "vite": "^5.0.3 || ^6.0.0 || ^7.0.0-beta.0",
  "@sveltejs/vite-plugin-svelte": "^3.0.0 || ^4.0.0-next.1 || ^5.0.0 || ^6.0.0-next.0",
  "svelte": "^4.0.0 || ^5.0.0-next.0"
}
```
✅ **Vite 5/6/7 すべてサポート**

#### @sveltepress/vite 1.2.2（最新）
```json
{
  "vite": "^4.3.9 || ^5.0.0",
  "@sveltejs/vite-plugin-svelte": "^4.0.1",
  "@sveltejs/kit": "^1.20.4 || ^2.0.0",
  "svelte": "^5.0.0"
}
```
❌ **Vite 5.x まで（6/7 未対応）**

#### @sveltepress/theme-default 6.0.4（最新）
```json
{
  "vite": "^5.0.0",
  "@sveltejs/vite-plugin-svelte": "^4.0.0",
  "@sveltejs/kit": "^2.0.0",
  "svelte": "^5.0.0"
}
```
❌ **Vite 5.x のみ**

---

## 📅 今後の行動計画

### ✅ 今すぐ実施（推奨）

1. **現状を維持**
   - Vite 5.4.21 を継続使用
   - @sveltejs/vite-plugin-svelte 4.0.4 を継続使用
   - @types/node 20.x を継続使用

2. **このドキュメントをコミット**
   ```bash
   git add MAJOR-UPGRADE-ANALYSIS.md UPGRADE-RECOMMENDATION.md
   git commit -m "docs: メジャーアップグレード分析と推奨事項"
   ```

### 📊 定期監視（月次）

**監視項目**:

1. **SveltePress の更新**
   ```bash
   npm view @sveltepress/vite peerDependencies
   ```

   確認ポイント:
   - `vite: "^6.0.0 || ^7.0.0"` が追加されたか？

2. **SveltePress GitHubリポジトリ**
   - https://github.com/SveltePress/sveltepress/issues
   - Vite 6/7 対応のIssueやPRを確認

3. **代替手段の検討**
   - SveltePress以外のドキュメントサイトジェネレーター
   - ただし移行コストが高いため、現実的ではない

### 🚀 アップグレード条件

**以下の条件がすべて満たされたら実施**:

- [ ] SveltePress が Vite 6.x+ をサポート
- [ ] SveltePress の最新版でビルドテスト成功報告あり
- [ ] 十分なテスト時間が確保できる（1週間以上）

**アップグレード手順**:
```bash
# 1. バックアップブランチ作成
git checkout -b upgrade-vite-7-test

# 2. SveltePress を最新版に更新
npm update @sveltepress/vite @sveltepress/theme-default

# 3. Vite と vite-plugin-svelte を更新
npm install --save-dev vite@latest @sveltejs/vite-plugin-svelte@latest

# 4. テスト
npm run dev      # 開発サーバー
npm run build    # ビルド
npm run preview  # プレビュー

# 5. 問題なければマージ、問題があれば破棄
git checkout main
git branch -D upgrade-vite-7-test  # 失敗時
```

---

## 🎯 推奨アクション（まとめ）

### 今すぐやること

1. ✅ **何もしない**（現状維持が最適）
2. ✅ この分析結果をドキュメント化（完了）
3. ✅ 月次チェックスケジュールに追加

### 1ヶ月後（2025年2月末）

```bash
# 定期チェック実施
npm run security-check
npm outdated

# SveltePress の Vite 対応確認
npm view @sveltepress/vite peerDependencies
```

### 3ヶ月後（2025年4月末）

- 四半期レビュー
- アップグレード計画の再評価
- 必要に応じて代替手段の検討

---

## 💡 重要なポイント

### なぜメジャーアップグレードしないのか？

1. **技術的理由**
   - SveltePressの互換性なし
   - 代替手段なし

2. **リスク評価**
   - 現在の脆弱性: 開発環境のみ、低〜中レベル
   - アップグレードのリスク: サイト全体が動作しなくなる可能性
   - **リスク > ベネフィット**

3. **ビジネス判断**
   - 本番環境（静的サイト）は完全に安全
   - 開発環境の脆弱性は限定的
   - 安定性を優先

### この判断は正しいのか？

✅ **はい、正しい判断です**

**理由**:

1. **本番環境への影響なし**
   - 静的サイト生成（adapter-static）
   - サーバーランタイムなし
   - 開発依存関係は本番に含まれない

2. **リスク管理**
   - 既知の低リスク脆弱性 < 未知のビルド失敗リスク

3. **ベストプラクティス準拠**
   - セマンティックバージョニングの尊重
   - エコシステムの成熟を待つ
   - 段階的なアップグレード

---

## 🔗 参考資料

### 公式ドキュメント
- [Vite Migration Guide](https://vitejs.dev/guide/migration.html)
- [SvelteKit Documentation](https://kit.svelte.dev/)
- [SveltePress Documentation](https://sveltepress.site/)

### GitHub リポジトリ
- [SveltePress Issues](https://github.com/SveltePress/sveltepress/issues)
- [Vite Releases](https://github.com/vitejs/vite/releases)
- [SvelteKit Releases](https://github.com/sveltejs/kit/releases)

### 関連ドキュメント
- [SECURITY-MONITORING.md](./SECURITY-MONITORING.md) - セキュリティ監視計画
- [MAJOR-UPGRADE-ANALYSIS.md](./MAJOR-UPGRADE-ANALYSIS.md) - 詳細分析

---

**作成日**: 2025年1月29日
**ステータス**: ✅ 推奨事項確定
**次回レビュー**: 2025年2月末
**監視対象**: SveltePress の Vite 6/7 対応状況
