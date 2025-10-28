# 🔒 セキュリティ・クイックリファレンス

## 📋 よく使うコマンド

### セキュリティチェック
```bash
# 総合チェック（推奨）
npm run security-check

# セキュリティ監査
npm audit

# 詳細レポート（JSON形式）
npm audit --json
```

### パッケージ更新
```bash
# 古いパッケージの確認
npm run check-outdated
# または
npm outdated

# 安全な更新（セマンティックバージョニング範囲内 + ビルドテスト）
npm run update-safe

# セマンティックバージョニング範囲内の更新のみ
npm update

# セキュリティの自動修正（非破壊的）
npm audit fix
```

### 緊急時
```bash
# 強制的にすべて修正（⚠️ 破壊的変更含む）
npm audit fix --force

# 必ずビルドテストを実行
npm run build
npm run preview
```

---

## 🎯 定期メンテナンス

### 毎月（推奨）
```bash
npm run security-check
npm run update-safe
```

### 四半期ごと
1. SECURITY-MONITORING.md をレビュー
2. メジャーアップデートの検討
3. SveltePress の互換性確認

---

## 📊 現在の状態

**最終更新**: 2025年1月29日

**脆弱性**: 18件（4低、14中）
- 本番環境への影響: なし（静的サイト）
- 開発環境のみ

**主要な監視対象**:
- cookie < 0.7.0 (低)
- esbuild <= 0.24.2 (中)

**次のアクション**:
- 毎月のセキュリティチェック
- SveltePress の Vite 7.x サポート待ち

---

## 🔗 詳細情報

- **詳細ガイド**: [SECURITY-MONITORING.md](../../SECURITY-MONITORING.md)
- **プロジェクトガイド**: [CLAUDE.md](../../CLAUDE.md)

---

## 💡 重要なポイント

✅ **本番環境は安全**
- 静的サイト（GitHub Pages）
- サーバーランタイムなし
- 開発依存関係は除外される

⚠️ **メジャーアップデートは慎重に**
- Vite 5.x → 7.x は破壊的変更あり
- SveltePress の互換性確認が必要
- 必ずテストブランチで試す

🔄 **自動化されている**
- GitHub Dependabot が有効
- 毎週自動チェック
- セキュリティアップデートの PR 自動作成
