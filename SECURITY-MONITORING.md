# Security Monitoring and Maintenance Plan

## 📊 Current Status (2025年1月29日)

### Package Versions
- **Node.js**: 20.x LTS (推奨)
- **npm**: 10.x
- **Svelte**: 5.42.3
- **SvelteKit**: 2.48.2
- **Vite**: 5.4.21
- **@sveltejs/vite-plugin-svelte**: 4.0.4
- **TypeScript**: 5.9.3
- **SveltePress**: 6.0.4 / 1.2.2

### 脆弱性サマリー
- **総数**: 18件
- **重大度**: 4件（低）、14件（中）
- **影響**: 開発環境のみ（本番環境は静的サイトのため影響なし）

---

## 🎯 監視対象パッケージ

### 1. cookie パッケージ（低）

**現在の問題**:
- バージョン: < 0.7.0
- 脆弱性: 不正な文字を含むcookie名/パス/ドメインを受け入れる
- CVE: GHSA-pxg6-pf52-xh8x

**影響範囲**:
- `@sveltejs/kit` >= 1.0.0-next.0
- `@sveltejs/adapter-static`
- `@sveltepress/theme-default`
- `@sveltepress/vite`
- `@vite-pwa/sveltekit`

**監視すべきアップデート**:
```bash
# 以下のコマンドで cookie のバージョンを確認
npm list cookie
```

**更新タイミング**:
- [ ] `@sveltejs/kit` が `cookie@0.7.0` 以上に依存するようになったら
- [ ] または `@sveltejs/kit@3.x` がリリースされたら

**更新手順**:
```bash
npm update @sveltejs/kit @sveltejs/adapter-static
npm audit
npm run build  # ビルドテスト
```

---

### 2. esbuild パッケージ（中）

**現在の問題**:
- バージョン: <= 0.24.2
- 脆弱性: 開発サーバーが不正なリクエストを受け入れる
- CVE: GHSA-67mh-4wv8-2f99

**影響範囲**:
- `vite` 0.11.0 - 6.1.6
- `@sveltejs/vite-plugin-svelte` <= 5.0.0
- `@sveltejs/vite-plugin-svelte-inspector` <= 3.0.1
- `unocss` および関連パッケージ

**監視すべきバージョン**:
- **Vite**: 現在 5.4.21 → 目標 7.x（安定版）
- **@sveltejs/vite-plugin-svelte**: 現在 4.0.4 → 目標 6.x（安定版）

**重要な注意事項**:
⚠️ Vite 6.x と 7.x はメジャーアップデートのため、破壊的変更が含まれます
⚠️ SveltePress の互換性を確認する必要があります

**更新タイミング**:
- [ ] SveltePress が Vite 7.x をサポートしたら
- [ ] または Vite 5.x のセキュリティパッチ版がリリースされたら

**確認方法**:
```bash
# SveltePress の最新バージョン確認
npm view @sveltepress/vite peerDependencies

# Vite の最新安定版確認
npm view vite versions --json | grep -v beta | tail -5
```

**更新手順** (SveltePress互換性確認後):
```bash
# バックアップ
git checkout -b update-vite-7

# 更新
npm install vite@latest @sveltejs/vite-plugin-svelte@latest

# テスト
npm run dev    # 開発サーバー起動確認
npm run build  # ビルド確認
npm run preview # プレビュー確認

# 問題なければ
git add .
git commit -m "chore: update vite to 7.x and related packages"

# 問題があれば
git checkout main
git branch -D update-vite-7
```

---

## 🔍 定期チェックリスト

### 毎月のメンテナンス

```bash
# 1. 依存関係の更新確認
npm outdated

# 2. セキュリティ監査
npm audit

# 3. 利用可能な更新を適用（セマンティックバージョニング範囲内）
npm update

# 4. ビルドテスト
npm run build

# 5. 変更をコミット（更新があった場合）
git add package*.json
git commit -m "chore: update dependencies within semver range"
```

### 四半期ごとのレビュー

```bash
# 1. メジャーバージョンアップデートの確認
npm outdated | grep -E "Wanted.*Latest"

# 2. SveltePress の最新版確認
npm view @sveltepress/theme-default versions --json | tail -5
npm view @sveltepress/vite versions --json | tail -5

# 3. Svelte / SvelteKit の最新版確認
npm view svelte version
npm view @sveltejs/kit version

# 4. 破壊的変更のチェンジログ確認
# - https://github.com/vitejs/vite/blob/main/packages/vite/CHANGELOG.md
# - https://github.com/sveltejs/kit/blob/main/packages/kit/CHANGELOG.md
# - https://github.com/sveltejs/svelte/blob/main/packages/svelte/CHANGELOG.md
```

---

## 📦 主要パッケージの監視リンク

### Svelte エコシステム
- **Svelte**: https://github.com/sveltejs/svelte/releases
- **SvelteKit**: https://github.com/sveltejs/kit/releases
- **Vite Plugin**: https://github.com/sveltejs/vite-plugin-svelte/releases

### ビルドツール
- **Vite**: https://github.com/vitejs/vite/releases
  - ⚠️ Vite 6.0 (2024年12月) - メジャーアップデート
  - ⚠️ Vite 7.0 (2025年1月) - メジャーアップデート
- **esbuild**: https://github.com/evanw/esbuild/releases

### SveltePress
- **Theme**: https://github.com/SveltePress/sveltepress/releases
- **Vite Plugin**: https://github.com/SveltePress/sveltepress/releases

### セキュリティ情報
- **GitHub Advisory Database**: https://github.com/advisories
- **npm Security Advisories**: https://github.com/advisories?query=ecosystem%3Anpm

---

## 🚨 緊急対応が必要な場合

以下の場合は即座に対応を検討してください：

### 高 (High) または 致命的 (Critical) な脆弱性
```bash
# 1. 詳細確認
npm audit --json > audit-report.json

# 2. 影響範囲の分析
# - 本番環境に影響するか？
# - 開発環境のみか？
# - 回避策はあるか？

# 3. 緊急更新
npm audit fix --force  # 最終手段（テスト必須）

# 4. 徹底的なテスト
npm run build
npm run preview
# 手動での機能テスト
```

### 本番環境に影響する脆弱性
現在の構成では、以下の理由により本番環境への影響は限定的です：

✅ **静的サイト生成** (adapter-static)
- サーバーサイドのランタイムなし
- Node.js 依存関係は本番環境に含まれない

✅ **GitHub Pages デプロイ**
- ビルド済みの静的ファイルのみ配信
- 開発依存関係は除外される

⚠️ **注意が必要なケース**:
- クライアントサイドの依存関係（mermaid など）
- ビルドプロセスで生成される静的ファイル

---

## 📝 更新履歴

### 2025年1月29日
- ✅ `npm audit fix` 実行
- ✅ `npm update` 実行（セマンティックバージョニング範囲内）
- ✅ ビルド動作確認
- 📊 残存脆弱性: 18件（4低、14中）
- 📌 パッケージバージョン:
  - Svelte: 5.38.0 → 5.42.3
  - TypeScript: 5.9.2 → 5.9.3
  - @types/node: 20.19.9 → 20.19.24
  - その他多数のマイナー更新

### 次回チェック予定
- **次回定期チェック**: 2025年2月末
- **次回四半期レビュー**: 2025年4月末

---

## 🔗 参考資料

### npm コマンド
```bash
# 脆弱性の詳細表示
npm audit

# 自動修正（非破壊的）
npm audit fix

# 強制修正（破壊的変更含む）
npm audit fix --force

# 古いパッケージ確認
npm outdated

# 更新可能なパッケージを更新
npm update

# 特定パッケージの情報確認
npm view <package-name> versions
npm view <package-name> peerDependencies

# 依存関係ツリー表示
npm list <package-name>
npm list <package-name> --depth=0
```

### 推奨ワークフロー
1. **開発前**: `npm outdated` で更新確認
2. **開発中**: 定期的に `npm audit` 実行
3. **リリース前**: `npm update` + ビルドテスト
4. **リリース後**: package-lock.json を含めてコミット

---

## 💡 ベストプラクティス

### 依存関係の管理
- ✅ `package-lock.json` をバージョン管理に含める
- ✅ セマンティックバージョニングを理解する（^, ~, * の違い）
- ✅ メジャーアップデートは慎重に（破壊的変更の可能性）
- ✅ マイナー・パッチアップデートは積極的に適用

### セキュリティ
- ✅ 月1回の `npm audit` 実行
- ✅ 開発環境と本番環境の脆弱性を区別
- ✅ 静的サイトの場合、ビルド時の依存関係に注目
- ✅ GitHub Dependabot を有効化（自動PR作成）

### テスト
- ✅ 更新後は必ずビルドテスト
- ✅ 主要なページの手動確認
- ✅ 本番環境デプロイ前にプレビュー確認

---

## 🤖 自動化の提案

### GitHub Dependabot の設定

`.github/dependabot.yml` を作成:

```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 5
    labels:
      - "dependencies"
      - "npm"
    # セキュリティアップデートのみ自動マージ
    allow:
      - dependency-type: "direct"
        update-type: "security"
```

### GitHub Actions の改善

セキュリティチェックを CI/CD に追加:

```yaml
# .github/workflows/security-check.yml
name: Security Check

on:
  schedule:
    - cron: '0 0 * * 1' # 毎週月曜日
  workflow_dispatch:

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm audit --audit-level=moderate
```

---

## ✅ まとめ

### 現在の状態
- 🟢 **本番環境**: 安全（静的サイト）
- 🟡 **開発環境**: 低〜中リスクの脆弱性あり
- 🟢 **ビルドプロセス**: 正常動作

### 推奨アクション
1. **今すぐ**: 特になし（現状で問題なし）
2. **毎月**: 定期チェックリストを実行
3. **四半期**: メジャーバージョンアップデートの検討
4. **監視**: SveltePress の Vite 7.x サポート状況

### 重要な判断基準
静的サイト生成プロジェクトでは、**開発依存関係の脆弱性は本番環境に影響しない**ため、安定性を優先して慎重にアップデートすることが推奨されます。
