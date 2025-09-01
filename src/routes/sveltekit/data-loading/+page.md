---
title: Load関数とデータフェッチング
description: SvelteKitのデータ取得戦略をTypeScriptで完全理解。Load関数の基礎からストリーミングSSR、キャッシュ戦略まで体系的に解説
---

<script>
  import { base } from '$app/paths';
</script>

SvelteKitのLoad関数は、ページやレイアウトに必要なデータを取得する仕組みです。サーバーサイドとクライアントサイドの両方で動作し、効率的なデータフェッチングを実現します。

## 学習パス

Load関数とデータフェッチングを段階的に学習できるよう、3つのセクションに分けて解説します。

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-8">
  <a href="{base}/sveltekit/data-loading/basic/" class="flex no-underline group">
    <div class="p-6 border border-gray-2 dark:border-gray-7 rounded-lg shadow-md hover:shadow-lg hover:border-orange-400 dark:hover:border-orange-400 transition-all cursor-pointer flex flex-col w-full">
      <div class="text-3xl mb-3">📚</div>
      <h3 class="font-bold text-xl mb-3 text-orange-600 dark:text-orange-400 group-hover:text-orange-700 dark:group-hover:text-orange-300 transition-colors">
        Load関数の基礎
      </h3>
      <p class="text-sm mb-3 text-gray-7 dark:text-gray-3">
        Universal LoadとServer Loadの違い、基本的な使い方、よくあるパターンを学びます。
      </p>
      <ul class="text-sm text-gray-6 dark:text-gray-4 space-y-1">
        <li>Universal Load vs Server Load</li>
        <li>型安全なデータ取得</li>
        <li>親子間のデータ共有</li>
        <li>エラーハンドリング</li>
      </ul>
    </div>
  </a>

  <a href="{base}/sveltekit/data-loading/auto-types/" class="flex no-underline group">
    <div class="p-6 border border-gray-2 dark:border-gray-7 rounded-lg shadow-md hover:shadow-lg hover:border-orange-400 dark:hover:border-orange-400 transition-all cursor-pointer flex flex-col w-full">
      <div class="text-3xl mb-3">🔷</div>
      <h3 class="font-bold text-xl mb-3 text-orange-600 dark:text-orange-400 group-hover:text-orange-700 dark:group-hover:text-orange-300 transition-colors">
        TypeScript型の自動生成
      </h3>
      <p class="text-sm mb-3 text-gray-7 dark:text-gray-3">
        ./$typesによる型安全な開発とボイラープレート削減の仕組みを理解します。
      </p>
      <ul class="text-sm text-gray-6 dark:text-gray-4 space-y-1">
        <li>PageLoad、Actions等の型</li>
        <li>ルートパラメータの型推論</li>
        <li>app.d.tsとの連携</li>
        <li>トラブルシューティング</li>
      </ul>
    </div>
  </a>

  <a href="{base}/sveltekit/data-loading/strategies/" class="flex no-underline group">
    <div class="p-6 border border-gray-2 dark:border-gray-7 rounded-lg shadow-md hover:shadow-lg hover:border-orange-400 dark:hover:border-orange-400 transition-all cursor-pointer flex flex-col w-full">
      <div class="text-3xl mb-3">🚀</div>
      <h3 class="font-bold text-xl mb-3 text-orange-600 dark:text-orange-400 group-hover:text-orange-700 dark:group-hover:text-orange-300 transition-colors">
        データフェッチング戦略
      </h3>
      <p class="text-sm mb-3 text-gray-7 dark:text-gray-3">
        高度なデータ取得技術で、パフォーマンスを最大化します。
      </p>
      <ul class="text-sm text-gray-6 dark:text-gray-4 space-y-1">
        <li>ストリーミングSSR</li>
        <li>並列データ取得</li>
        <li>キャッシング戦略</li>
        <li>リアルタイム更新</li>
      </ul>
    </div>
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

