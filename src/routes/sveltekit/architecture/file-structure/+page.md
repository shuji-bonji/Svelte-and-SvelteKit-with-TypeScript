---
title: ファイル構成と実行環境
description: 各ファイルがどの環境で動作し、どのような役割を持つかを解説
---

<script>
  import PreparingPage from '$lib/components/PreparingPage.svelte';
</script>

<PreparingPage />

このページでは、SvelteKitのファイル構成と実行環境について解説予定です。

## 予定している内容

- **サーバー専用ファイル**
  - `.server.ts`ファイルの役割
  - データベースアクセス
  - 認証・認可の実装
  - 秘密情報の取り扱い

- **ユニバーサルファイル**
  - `.ts`ファイルの動作
  - 初回ロードとナビゲーション時の違い
  - APIコールの実装パターン

- **クライアントファイル**
  - `.svelte`コンポーネント
  - ブラウザAPIの使用
  - インタラクティブ機能

- **特殊ファイル**
  - hooks.server.ts/hooks.client.ts
  - app.html
  - app.d.ts
  - その他の設定ファイル