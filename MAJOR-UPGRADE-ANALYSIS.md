# メジャーアップグレード対象パッケージ分析

## 📊 対象パッケージ一覧

| パッケージ | 現在 | 最新 | ジャンプ数 | 難易度 |
|-----------|------|------|-----------|--------|
| **Vite** | 5.4.21 | 7.1.12 | 2つ (5→6→7) | 🔴 高 |
| **@sveltejs/vite-plugin-svelte** | 4.0.4 | 6.2.1 | 2つ (4→5→6) | 🔴 高 |
| **@types/node** | 20.19.24 | 24.9.2 | 4つ (20→24) | 🟡 中 |

---

## 1. Vite: v5.4.21 → v7.1.12

### 📈 アップグレードパス
- **Vite 5.x** (現在) → **Vite 6.x** (2024年12月) → **Vite 7.x** (2025年1月)
- 2つのメジャーバージョンをスキップ

### 🔴 破壊的変更（主要なもの）

#### Vite 6.0 の主な変更
1. **Environment API の導入**
   - プラグインAPIの大幅な変更
   - SSRとビルド環境の統一API

2. **デフォルト設定の変更**
   - `resolve.conditions` のデフォルト値変更
   - CSS コード分割のデフォルト動作変更

3. **Node.js 18+ 必須**
   - Node.js 16以下のサポート終了

#### Vite 7.0 の主な変更
1. **rollup 4.x 必須**
   - Rollupのメジャーアップデート

2. **CSS関連の変更**
   - `css.transformer` API の変更
   - Lightning CSS のデフォルト採用検討

3. **プラグインAPI の進化**
   - Environment API のさらなる拡張

### ⚠️ SvelteKit への影響

**重要**: SvelteKit は Vite に強く依存しています。

```bash
# SvelteKitが要求するViteバージョンを確認
npm view @sveltejs/kit peerDependencies
```

**現時点の問題**:
- SvelteKit 2.x は Vite 5.x をベースに設計されている
- Vite 6.x/7.x への対応は SvelteKit側の更新が必要
- **SveltePress も同様に影響を受ける**

### 📋 アップグレード前の確認事項

- [ ] SvelteKit が Vite 7.x に対応しているか確認
- [ ] SveltePress が Vite 7.x に対応しているか確認
- [ ] カスタムViteプラグインの互換性確認
- [ ] ビルド設定 (`vite.config.ts`) の見直し

### 🔗 参考リンク
- [Vite 6.0 Migration Guide](https://vitejs.dev/guide/migration.html#migration-from-v5)
- [Vite 7.0 Changelog](https://github.com/vitejs/vite/blob/main/packages/vite/CHANGELOG.md)

---

## 2. @sveltejs/vite-plugin-svelte: v4.0.4 → v6.2.1

### 📈 アップグレードパス
- **v4.0.4** (現在) → **v5.x** → **v6.2.1** (最新)

### 🔴 破壊的変更

#### v5.0 の主な変更
1. **Svelte 5 専用**
   - Svelte 4以下のサポート終了
   - ✅ 本プロジェクトは既にSvelte 5使用中なので問題なし

2. **Vite 5.x 必須**
   - ✅ 現在のViteバージョンで対応可能

3. **プラグインオプションの変更**
   - `experimental` オプションの一部が標準化

#### v6.0 の主な変更
1. **Vite 6.x+ 必須**
   - ⚠️ Vite 6.x以上が必須
   - **Viteを先にアップグレードする必要がある**

2. **Environment API対応**
   - Vite 6の新APIに対応

3. **デフォルト動作の変更**
   - HMR（Hot Module Replacement）の改善
   - プリプロセッサ処理の最適化

### ⚠️ 依存関係の連鎖

```
@sveltejs/vite-plugin-svelte v6.x
  ↓ 依存
Vite v6.x+
  ↓ 影響
SvelteKit
  ↓ 影響
SveltePress
```

**結論**: このパッケージ単独でのアップグレードは不可能。Viteと一緒にアップグレードする必要がある。

### 📋 アップグレード前の確認事項

- [ ] Vite 6.x/7.x へのアップグレード完了
- [ ] Svelte 5.x 使用確認（✅ 完了済み）
- [ ] vite.config.ts のプラグイン設定確認

### 🔗 参考リンク
- [@sveltejs/vite-plugin-svelte Changelog](https://github.com/sveltejs/vite-plugin-svelte/blob/main/packages/vite-plugin-svelte/CHANGELOG.md)

---

## 3. @types/node: v20.19.24 → v24.9.2

### 📈 アップグレードパス
- **Node.js 20 LTS** (現在) → **Node.js 24**
- 4つのメジャーバージョン差

### 🟡 影響度: 中〜低

**理由**:
- `@types/node` は型定義のみ
- ランタイムには影響しない
- Node.js本体のバージョンとは独立

### 🔍 詳細分析

#### Node.jsのバージョン戦略
- **Node.js 20.x LTS**: 2026年4月までサポート（現在推奨）
- **Node.js 22.x LTS**: 2027年4月までサポート（最新LTS）
- **Node.js 24.x**: まだLTSではない（奇数バージョンは開発版扱い）

#### @types/nodeの役割
```typescript
// これらの型定義を提供
import { readFile } from 'fs/promises';  // Node.js API
import type { Server } from 'http';      // Node.js型
```

### ✅ アップグレード可能性

**安全にアップグレード可能**:
- 型定義のみの変更
- 本番環境のランタイムには影響なし
- 開発時の型チェックが新しいNode.js APIに対応

**注意点**:
- Node.js 24.x の型を使うと、古いNode.jsランタイムで実行時エラーの可能性
- 本プロジェクトは静的サイト生成なので影響は限定的

### 🎯 推奨アクション

**Option 1: 保守的** (推奨)
```bash
# Node.js 20 LTS に対応する型を維持
# package.json で "^20.19.24" を維持
```

**Option 2: 最新LTSに合わせる**
```bash
# Node.js 22 LTS の型にアップグレード
npm install --save-dev @types/node@^22
```

**Option 3: 最新に更新**
```bash
# 最新の型定義にアップグレード（非推奨）
npm install --save-dev @types/node@latest
```

### 📋 アップグレード前の確認事項

- [ ] 現在使用しているNode.jsバージョンを確認
  ```bash
  node --version  # v20.x.x であることを確認
  ```
- [ ] CI/CDのNode.jsバージョン確認
- [ ] 新しい型で型エラーが出ないか確認

### 🔗 参考リンク
- [Node.js Release Schedule](https://github.com/nodejs/release#release-schedule)
- [@types/node on npm](https://www.npmjs.com/package/@types/node)

---

## 🎯 総合的な推奨アクション

### 現時点での判断

#### ❌ **今すぐアップグレードすべきでないもの**

1. **Vite (5.x → 7.x)**
   - ⚠️ 2つのメジャーバージョンジャンプ
   - ⚠️ SvelteKit/SveltePress の互換性が不明
   - ⚠️ テストコストが高い

2. **@sveltejs/vite-plugin-svelte (4.x → 6.x)**
   - ⚠️ Viteのアップグレードが前提
   - ⚠️ 連鎖的な影響が大きい

#### ✅ **検討可能なもの**

3. **@types/node (20 → 22)**
   - ✅ 影響範囲が限定的
   - ✅ Node.js 22 LTS に合わせることは合理的
   - ⚠️ ただし、急ぐ必要はない

---

## 📅 段階的アップグレード計画

### フェーズ1: 情報収集（今すぐ）

```bash
# SvelteKitのVite依存関係を確認
npm view @sveltejs/kit peerDependencies

# SveltePressのVite依存関係を確認
npm view @sveltepress/vite peerDependencies
npm view @sveltepress/theme-default peerDependencies
```

### フェーズ2: @types/node のアップグレード（低リスク）

```bash
# Node.js 22 LTS の型にアップグレード
npm install --save-dev @types/node@^22

# 型チェック
npm run build

# 問題なければコミット
git add package*.json
git commit -m "chore: update @types/node to v22 (Node.js 22 LTS types)"
```

### フェーズ3: 監視と待機（継続中）

- [ ] SvelteKit の Vite 6/7 対応を監視
  - https://github.com/sveltejs/kit/issues
  - https://github.com/sveltejs/kit/releases

- [ ] SveltePress の Vite 6/7 対応を監視
  - https://github.com/SveltePress/sveltepress/issues
  - https://github.com/SveltePress/sveltepress/releases

### フェーズ4: Vite アップグレード（エコシステム対応後）

**条件が揃ったら**:
1. SvelteKit が Vite 6/7 をサポート
2. SveltePress が Vite 6/7 をサポート
3. 十分な時間でテスト可能

**実施手順**:
```bash
# テストブランチ作成
git checkout -b upgrade-vite-7

# Vite と vite-plugin-svelte を同時アップグレード
npm install --save-dev vite@latest @sveltejs/vite-plugin-svelte@latest

# 開発サーバーテスト
npm run dev

# ビルドテスト
npm run build

# プレビューテスト
npm run preview

# 問題なければマージ
```

---

## 🚨 緊急度の評価

| パッケージ | 緊急度 | 理由 |
|-----------|--------|------|
| Vite | 🟡 低 | セキュリティ脆弱性は開発環境のみ、本番に影響なし |
| vite-plugin-svelte | 🟡 低 | Vite に依存、単独でのアップグレード不可 |
| @types/node | 🟢 極低 | 型定義のみ、ランタイムに影響なし |

**結論**: 現時点では緊急にアップグレードする必要はありません。

---

## 💡 ベストプラクティス

### アップグレードの優先順位

1. **セキュリティパッチ** (最優先)
   - Critical/High な脆弱性
   - 本番環境に影響するもの

2. **マイナー・パッチアップデート** (積極的)
   - 破壊的変更なし
   - バグ修正や機能追加

3. **メジャーアップデート** (慎重に)
   - 破壊的変更を含む
   - エコシステム全体の対応を待つ
   - 十分なテスト期間を確保

### 本プロジェクトの戦略

✅ **採用している戦略**: **Conservative Upgrade**
- 安定性を最優先
- エコシステムの成熟を待つ
- セキュリティと機能のバランス

---

## 🔍 監視すべきGitHubリポジトリ

定期的にチェック:

1. **Vite**
   - https://github.com/vitejs/vite/releases
   - https://github.com/vitejs/vite/discussions

2. **SvelteKit**
   - https://github.com/sveltejs/kit/releases
   - https://github.com/sveltejs/kit/discussions

3. **SveltePress**
   - https://github.com/SveltePress/sveltepress/releases
   - https://github.com/SveltePress/sveltepress/issues

4. **@sveltejs/vite-plugin-svelte**
   - https://github.com/sveltejs/vite-plugin-svelte/releases

---

## ✅ アクションアイテム

### 今すぐ実施

- [x] メジャーアップグレード対象を特定
- [x] 影響範囲を分析
- [ ] SvelteKit/SveltePress の Vite 対応状況を確認

### 1週間以内

- [ ] @types/node のアップグレード検討（オプション）
- [ ] 監視対象リポジトリをウォッチ

### 1ヶ月以内

- [ ] 月次セキュリティチェック実施
- [ ] Vite 6/7 対応状況の再確認

### 3ヶ月以内

- [ ] 四半期レビュー
- [ ] メジャーアップグレードの再評価

---

**作成日**: 2025年1月29日
**次回レビュー**: 2025年2月末
