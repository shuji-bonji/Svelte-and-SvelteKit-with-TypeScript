---
title: ルーティング概要
description: SvelteKitのルーティングシステムをTypeScriptで理解。ファイルベースルーティングの基本から動的ルート、高度な機能まで体系的に解説
---

<script>
  import { base } from '$app/paths';
</script>

SvelteKitのルーティングシステムは、ファイルベースの直感的な設計でありながら、エンタープライズレベルのアプリケーションに必要な高度な機能を全て備えています。

## ルーティングの学習パス

SvelteKitのルーティングを段階的に学習できるよう、3つのセクションに分けて解説します。

<div class="grid">
  <a href="{base}/sveltekit/routing/basic/" class="card">
    <h3>📚 基本ルーティング</h3>
    <p>ファイルベースルーティングの基礎、静的ルート、ページの作成方法を学びます。</p>
    <ul>
      <li>ディレクトリ構造とURL</li>
      <li>ページの作成</li>
      <li>レイアウトの基本</li>
      <li>エラーページ</li>
    </ul>
  </a>

  <a href="{base}/sveltekit/routing/dynamic/" class="card">
    <h3>🔄 動的ルーティング</h3>
    <p>動的なURLパラメータを扱い、柔軟なルート設計を実現します。</p>
    <ul>
      <li>動的パラメータ [id]</li>
      <li>Rest Parameters [...slug]</li>
      <li>オプショナルパラメータ [[optional]]</li>
      <li>ルートマッチャー</li>
    </ul>
  </a>

  <a href="{base}/sveltekit/routing/advanced/" class="card">
    <h3>🚀 高度なルーティング</h3>
    <p>プロダクション環境で必要な高度な機能を習得します。</p>
    <ul>
      <li>ルートグループ</li>
      <li>ネストレイアウト</li>
      <li>プログラマティックナビゲーション</li>
      <li>ルートアノテーション</li>
    </ul>
  </a>
</div>

## クイックリファレンス

### ファイルベースルーティングの基本

```
src/routes/
├── +page.svelte              → /
├── about/+page.svelte        → /about
├── blog/
│   ├── +page.svelte          → /blog
│   └── [slug]/+page.svelte   → /blog/:slug
└── (group)/
    └── admin/+page.svelte    → /admin
```

### 特殊ファイルの役割

| ファイル | 役割 | 詳細 |
|---------|------|------|
| `+page.svelte` | ページコンポーネント | [基本ルーティング](./basic/) |
| `+page.ts` | ユニバーサルLoad | [Load関数](../data-loading/) |
| `+page.server.ts` | サーバーLoad & Actions | [フォーム処理](../server/forms/) |
| `+layout.svelte` | レイアウト | [基本ルーティング](./basic/#レイアウト) |
| `+server.ts` | APIエンドポイント | [APIルート](../server/api-routes/) |
| `+error.svelte` | エラーページ | [基本ルーティング](./basic/#エラーハンドリング) |

:::info[ファイルシステムの詳細]
特殊ファイルの詳細な関係性とデータフローについては、[SvelteKitファイルシステム](../architecture/file-system/)をご覧ください。
:::

## TypeScriptとの統合

SvelteKitは自動的に型を生成し、完全な型安全性を提供します。

```typescript
// 自動生成される型をインポート
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
  // params.idは自動的に型付けされる
  const id = params.id;
  
  return {
    id // 返り値も型チェックされる
  };
};
```

## 次のステップ

1. **初心者の方**: [基本ルーティング](./basic/)から始めましょう
2. **基本を理解した方**: [動的ルーティング](./dynamic/)で柔軟なURL設計を学びましょう
3. **実践的な開発**: [高度なルーティング](./advanced/)でプロダクション対応の技術を習得しましょう

<style>
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
    margin: 2rem 0;
  }
  
  .card {
    padding: 1.5rem;
    border: 1px solid var(--border-color, #e0e0e0);
    border-radius: 8px;
    text-decoration: none;
    color: inherit;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  
  .card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  .card h3 {
    margin-top: 0;
    color: var(--primary-color, #ff3e00);
  }
  
  .card ul {
    margin: 0.5rem 0 0 0;
    padding-left: 1.2rem;
    font-size: 0.9em;
    color: var(--text-secondary, #666);
  }
</style>