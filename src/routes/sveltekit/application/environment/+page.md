---
title: 環境変数管理
description: SvelteKitでの環境変数管理。$env/static、$env/dynamic、.envファイル設定とTypeScriptでの型安全な環境変数アクセス
---

:::warning[準備中]
このページは現在作成中です。基本的な概要と予定コンテンツを掲載しています。
:::

## 概要

SvelteKitでの環境変数の管理方法を解説します。静的/動的環境変数の使い分け、セキュリティ考慮事項、本番環境での設定方法を学びます。

## 予定コンテンツ

- [ ] 環境変数の基本（PUBLIC_ プレフィックス）
- [ ] `$env/static/private` と `$env/static/public`
- [ ] `$env/dynamic/private` と `$env/dynamic/public`
- [ ] `.env` ファイルの設定
- [ ] 環境別設定（development、production）
- [ ] シークレット管理のベストプラクティス
- [ ] CI/CDでの環境変数設定
- [ ] 型定義による安全なアクセス

## 関連ページ

- [プロジェクト構造](/sveltekit/basics/project-structure/) - 設定ファイルの配置
- [app.d.tsの役割](/sveltekit/basics/global-types/) - 環境変数の型定義
- [プラットフォーム別デプロイ](/sveltekit/deployment/platforms/) - 各環境での設定方法
