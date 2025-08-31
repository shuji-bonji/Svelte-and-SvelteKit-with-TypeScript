---
title: Load関数とデータフェッチング
description: SvelteKitのデータ取得戦略をTypeScriptで完全理解。Load関数の基礎からストリーミングSSR、キャッシュ戦略まで体系的に解説
---

<script>
  import { base } from '$app/paths';
</script>

SvelteKitのLoad関数は、ページやレイアウトに必要なデータを取得する仕組みです。サーバーサイドとクライアントサイドの両方で動作し、効率的なデータフェッチングを実現します。

## 学習パス

Load関数とデータフェッチングを段階的に学習できるよう、2つのセクションに分けて解説します。

<div class="grid">
  <a href="{base}/sveltekit/data-loading/basic/" class="card">
    <h3>📚 Load関数の基礎</h3>
    <p>Universal LoadとServer Loadの違い、基本的な使い方、よくあるパターンを学びます。</p>
    <ul>
      <li>Universal Load vs Server Load</li>
      <li>型安全なデータ取得</li>
      <li>親子間のデータ共有</li>
      <li>エラーハンドリング</li>
    </ul>
  </a>

  <a href="{base}/sveltekit/data-loading/strategies/" class="card">
    <h3>🚀 データフェッチング戦略</h3>
    <p>高度なデータ取得技術で、パフォーマンスを最大化します。</p>
    <ul>
      <li>ストリーミングSSR</li>
      <li>並列データ取得</li>
      <li>キャッシング戦略</li>
      <li>リアルタイム更新</li>
    </ul>
  </a>
</div>

## クイックリファレンス

### Load関数の種類

| 種類 | ファイル | 実行環境 | 用途 |
|------|---------|---------|------|
| Universal Load | `+page.ts`<br/>`+layout.ts` | サーバー & クライアント | 公開データの取得 |
| Server Load | `+page.server.ts`<br/>`+layout.server.ts` | サーバーのみ | 秘密情報・DB接続 |

### 基本的な使い方

```typescript
// +page.ts (Universal Load)
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, url, fetch }) => {
  const response = await fetch(`/api/posts/${params.id}`);
  const post = await response.json();
  
  return {
    post
  };
};
```

```typescript
// +page.server.ts (Server Load)
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/database';

export const load: PageServerLoad = async ({ params }) => {
  const post = await db.post.findUnique({
    where: { id: params.id }
  });
  
  return {
    post
  };
};
```

## Load関数の選び方

データ取得の要件に応じて、適切なLoad関数を選択します。

1. **Server Load を使用すべき場合**:
   - 秘密情報（APIキー、DBクレデンシャル）を扱う
   - データベースに直接アクセスする
   - サーバーサイドのみのライブラリを使用する

2. **Universal Load を使用すべき場合**:
   - 公開APIからデータを取得する
   - SEOが重要（サーバーサイドレンダリング必要）
   - クライアントサイドでも再実行が必要

3. **Client Load を使用すべき場合**:
   - クライアントサイドのみで必要なデータ
   - ユーザーのブラウザ情報が必要
   - リアルタイム更新が必要

## パフォーマンスのヒント

### 並列データ取得

```typescript
// ❌ 悪い例：順次実行
const user = await fetch('/api/user').then(r => r.json());
const posts = await fetch('/api/posts').then(r => r.json());

// ✅ 良い例：並列実行
const [user, posts] = await Promise.all([
  fetch('/api/user').then(r => r.json()),
  fetch('/api/posts').then(r => r.json())
]);
```

### ストリーミングSSR

```typescript
// 即座に返すデータとストリーミングデータを分離
export const load = async () => {
  return {
    // 即座に返す
    critical: await getCriticalData(),
    
    // ストリーミングで後から送信
    streamed: {
      slow: getSlowData()
    }
  };
};
```

:::info[ファイルシステムとの関係]
Load関数がどのファイルでどのように実行されるかの詳細は、[SvelteKitファイルシステム](../architecture/file-system/)をご覧ください。
:::

## TypeScriptとの統合

SvelteKitは自動的に型を生成し、Load関数の引数と返り値を完全に型付けします。

```typescript
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, url, fetch, parent }) => {
  // すべての引数が型付けされている
  // 返り値も自動的に型チェックされる
  return {
    data: 'type-safe'
  };
};
```

## 次のステップ

1. **初心者の方**: [Load関数の基礎](./basic/)から始めましょう
2. **基本を理解した方**: [データフェッチング戦略](./strategies/)で高度な技術を学びましょう

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