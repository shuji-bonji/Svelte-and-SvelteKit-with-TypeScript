---
title: データベース統合 — Drizzle / Prisma 戦略
description: SvelteKit でのデータベース統合を Drizzle / Prisma 比較、SQLite/PostgreSQL/MySQL の選択軸、Remote Functions 連携、マイグレーション管理、コネクションプーリング、トランザクション、N+1 対策まで TypeScript で構築する戦略ガイド
---

<script lang="ts">
  import Mermaid from '$lib/components/Mermaid.svelte';
</script>

SvelteKit でデータベースを扱うには **「どの DB を使うか」** と **「どの ORM を使うか」** の 2 軸で決まります。本ページではこの 2 軸の比較と、Drizzle セットアップ、Remote Functions 連携、マイグレーション運用までを通しで解説します。

:::tip[隣接ページとの役割分担]

「SQL インジェクション対策」は [セキュリティ対策](/sveltekit/deployment/security/) に集約しています。「サーバー専用モジュールの配置」は [`$lib/server`](/sveltekit/server/server-only-modules/) を参照。本ページは **DB レイヤの設計判断** に絞ります。

:::

## DB 選択フロー

```mermaid
flowchart TD
  start[DB を選びたい] --> q1{デプロイ先}
  q1 -->|Cloudflare Workers| cf[D1 / PlanetScale]
  q1 -->|Vercel / Netlify| q2{スケール要件}
  q1 -->|adapter-node / VPS| q3{使い慣れた DB?}

  q2 -->|スタートアップ・軽量| neon[Neon / Supabase / Vercel Postgres]
  q2 -->|エンタープライズ| rds[AWS RDS / GCP Cloud SQL]

  q3 -->|あり| existing[既存の MySQL/PostgreSQL/SQLite]
  q3 -->|なし・選びたい| q4{書き込み頻度}

  q4 -->|低・読み中心| sqlite[SQLite + Turso/LiteFS]
  q4 -->|高・スケール必要| pg[PostgreSQL]
```

**SQLite** はファイルベースで運用が極めて楽。Turso や LiteFS のようなレプリケーション基盤と組み合わせれば中規模まで耐えます。**PostgreSQL** は機能・拡張性のバランスが取れた万能選手。**MySQL** は歴史的選択肢で、PlanetScale のような Vitess ベースのスケール基盤が選べる。

## DB 比較

| DB | 特徴 | 強み | 弱み | 適したホスティング |
|----|------|------|------|-------------------|
| **SQLite** | ファイルベース、組み込み | 運用シンプル、高速、ゼロ設定 | 単一書き込み、ネットワーク非対応 | adapter-node + Turso/LiteFS、Bun |
| **PostgreSQL** | リレーショナル、機能豊富 | JSON/GIS/全文検索、拡張機能 | コネクション数の制約 | Neon / Supabase / Vercel Postgres / RDS |
| **MySQL** | リレーショナル、歴史長い | 普及度、ツール豊富 | JSON 関連の表現力が PG より低い | PlanetScale / RDS / Aurora |
| **D1** | Cloudflare の SQLite ベース | Workers との一体運用、低レイテンシ | プレビュー段階の機能あり | Cloudflare Workers/Pages |
| **MongoDB** | ドキュメント DB | 柔軟なスキーマ、地理分散 | リレーション弱い、トランザクション制約 | MongoDB Atlas |

## ORM 比較 — Drizzle vs Prisma

| 観点 | **Drizzle** | **Prisma** |
|------|------------|------------|
| **スタイル** | SQL に近い query builder | スキーマファイル + 高レベル API |
| **TypeScript 型** | クエリから自動推論（schema が source of truth） | `prisma generate` で生成 |
| **バンドルサイズ** | 軽量（純粋 TS） | 重い（Rust エンジン同梱） |
| **Edge 対応** | ✅ Workers/Edge で動く | ⚠️ Driver Adapters 経由（追加設定必要） |
| **マイグレーション** | `drizzle-kit` で SQL ベース | `prisma migrate` で宣言的 |
| **学習コスト** | SQL 知識があれば即理解 | スキーマ DSL を覚える |
| **本ガイドの推奨度** | ⭐⭐⭐⭐⭐ 新規実装、Edge 環境 | ⭐⭐⭐⭐ チームで共有しやすいスキーマが必要なとき |

:::info[なぜ Drizzle 推奨か]

Drizzle は **`schema.ts` がそのまま TypeScript 型** になります。クエリも `db.select().from(users).where(eq(users.id, 1))` のように TS で書け、別ファイル（Prisma の `schema.prisma`）を見に行く必要がない。Edge 環境（Cloudflare Workers）でも素直に動きます。SvelteKit と特に相性が良い ORM です。

:::

## Drizzle セットアップ — PostgreSQL の例

### 導入

```bash
npm install drizzle-orm postgres
npm install -D drizzle-kit
```

### スキーマ定義

```ts
// src/lib/server/db/schema.ts
import { pgTable, serial, text, timestamp, integer, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow()
});

export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  body: text('body').notNull(),
  authorId: uuid('author_id').notNull().references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow()
});

// リレーション定義（クエリ時の include 用）
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts)
}));

export const postsRelations = relations(posts, ({ one }) => ({
  author: one(users, { fields: [posts.authorId], references: [users.id] })
}));

// TypeScript 型は自動推論
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Post = typeof posts.$inferSelect;
```

### クライアント

```ts
// src/lib/server/db/index.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { DATABASE_URL } from '$env/static/private';
import * as schema from './schema';

const queryClient = postgres(DATABASE_URL, {
  max: 10,                  // コネクションプール最大
  idle_timeout: 20,
  connect_timeout: 10
});

export const db = drizzle(queryClient, { schema });
export type DB = typeof db;
```

:::warning[`$lib/server` の配下に置く]

DB 接続を含むモジュールは **`$lib/server/` 配下**（または `*.server.ts`）に置いてください。SvelteKit はこの規約のファイルがクライアント側にバンドルされるとビルドエラーで止めてくれます。`DATABASE_URL` 等のシークレット漏洩を防ぐ重要な機構です。

:::

## クエリパターン

### 取得（select）

```ts
import { db } from '$lib/server/db';
import { users, posts } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';

// 単一取得
const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);

// JOIN 込み（relations 経由）
const userWithPosts = await db.query.users.findFirst({
  where: eq(users.id, userId),
  with: { posts: { orderBy: desc(posts.createdAt), limit: 10 } }
});
```

### 挿入

```ts
const [newUser] = await db.insert(users).values({
  email: 'alice@example.com',
  name: 'Alice',
  passwordHash: await hashPassword('...')
}).returning();
```

### 更新

```ts
await db.update(users).set({ name: 'Alice 2' }).where(eq(users.id, userId));
```

### 削除

```ts
await db.delete(posts).where(eq(posts.id, postId));
```

### トランザクション

```ts
import { db } from '$lib/server/db';

await db.transaction(async (tx) => {
  const [order] = await tx.insert(orders).values({ userId }).returning();

  for (const item of items) {
    await tx.insert(orderItems).values({ orderId: order.id, ...item });
  }

  await tx.update(users).set({ totalOrders: sql`${users.totalOrders} + 1` })
    .where(eq(users.id, userId));
});
```

トランザクション内で `throw` するとロールバックされます。

## Remote Functions との連携

Drizzle と Remote Functions（2.27+）は相性抜群です。スキーマから型が流れ、Remote Functions のスキーマ検証もそのままパス。

```ts
// src/routes/posts.remote.ts
import { query, command } from '$app/server';
import { z } from 'zod';
import { db } from '$lib/server/db';
import { posts } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';
import { getRequestEvent } from '$app/server';

export const listPosts = query(
  z.object({ limit: z.number().min(1).max(100).default(10) }),
  async ({ limit }) => {
    return db.query.posts.findMany({
      with: { author: { columns: { name: true, email: true } } },
      orderBy: desc(posts.createdAt),
      limit
    });
  }
);

export const createPost = command(
  z.object({
    title: z.string().min(1).max(200),
    body: z.string().min(1)
  }),
  async (input) => {
    const { locals } = getRequestEvent();
    if (!locals.user) throw new Error('Unauthorized');

    const [post] = await db.insert(posts).values({
      ...input,
      authorId: locals.user.id
    }).returning();

    await listPosts({ limit: 10 }).refresh();
    return post;
  }
);

export const deletePost = command(z.object({ id: z.number() }), async ({ id }) => {
  const { locals } = getRequestEvent();
  if (!locals.user) throw new Error('Unauthorized');

  const [post] = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
  if (post.authorId !== locals.user.id) throw new Error('Forbidden');

  await db.delete(posts).where(eq(posts.id, id));
  await listPosts({ limit: 10 }).refresh();
});
```

クライアントは型安全に呼べます：

```svelte
<script lang="ts">
  import { listPosts, createPost, deletePost } from './posts.remote';

  const posts = listPosts({ limit: 10 });
</script>

{#if posts.current}
  {#each posts.current as post (post.id)}
    <article>
      <h2>{post.title}</h2>
      <p>By {post.author.name}</p>
      <button onclick={() => deletePost({ id: post.id })}>削除</button>
    </article>
  {/each}
{/if}
```

## マイグレーション管理

### drizzle.config.ts

```ts
import type { Config } from 'drizzle-kit';

export default {
  schema: './src/lib/server/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: { url: process.env.DATABASE_URL! }
} satisfies Config;
```

### マイグレーション生成と適用

```bash
# スキーマから SQL マイグレーションを生成
npx drizzle-kit generate

# 開発用に DB へ直接 push（マイグレーションファイル経由しない）
npx drizzle-kit push

# 本番ではマイグレーションを適用
npx drizzle-kit migrate
```

CI でのマイグレーション適用：

```yaml
- name: Run migrations
  run: npx drizzle-kit migrate
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

:::warning[本番への push は厳禁]

`drizzle-kit push` は **マイグレーションファイルを作らずに直接 DB スキーマを変更** します。開発環境ではプロトタイピングに便利ですが、本番では必ず `generate` → レビュー → `migrate` のフローを通してください。

:::

## コネクションプーリング

SvelteKit を **サーバーレス環境**（Vercel、Cloudflare、AWS Lambda）で動かす場合、リクエストごとに DB 接続を作ると **接続枯渇** に陥ります。

### 対策 1: 外部プーラー（PgBouncer / Supabase Pooler）

```ts
// .env
DATABASE_URL=postgres://user:pass@pooler.example.com:6543/db?pgbouncer=true
```

PgBouncer（または Neon/Supabase の組み込みプーラー）を経由することで、サーバーレス関数の起動回数に左右されずに DB 側の接続数を抑えられます。

### 対策 2: HTTP ベースの DB ドライバ

- **Neon**: `@neondatabase/serverless`
- **Supabase**: `@supabase/supabase-js`
- **PlanetScale**: `@planetscale/database`

```ts
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

const sql = neon(DATABASE_URL);
export const db = drizzle(sql);
```

HTTP ベースは **TCP コネクションを張りっぱなしにしない** ため、サーバーレスと相性最高。ただしストリーミング応答やトランザクションの長時間保持はできません。

## N+1 問題の解決

「N 件のレコードに対して、それぞれ関連レコードを 1 件ずつ取りに行く」アンチパターン。

```ts bad
// ❌ N+1: posts.length 回の追加クエリが走る
const posts = await db.select().from(posts);
for (const post of posts) {
  post.author = await db.select().from(users).where(eq(users.id, post.authorId));
}
```

Drizzle の `with` で JOIN 解決：

```ts
// ✅ 1 クエリで解決
const posts = await db.query.posts.findMany({
  with: { author: true }
});
```

または `IN` でバッチ：

```ts
const posts = await db.select().from(posts);
const authorIds = posts.map((p) => p.authorId);
const authors = await db.select().from(users).where(inArray(users.id, authorIds));
const authorMap = new Map(authors.map((a) => [a.id, a]));
const enriched = posts.map((p) => ({ ...p, author: authorMap.get(p.authorId) }));
```

## チェックリスト

- [ ] **DB 接続を `$lib/server/`** に置く（クライアント漏洩防止）
- [ ] **シークレットは `$env/static/private`** または `$env/dynamic/private`
- [ ] **コネクションプール** をプラットフォームに合わせて選択（HTTP ドライバ or 外部プーラー）
- [ ] **マイグレーションは `generate` → コミット → `migrate`** のフロー
- [ ] **トランザクション** で複数テーブル更新の整合性を確保
- [ ] **N+1 を `with` または `inArray` で解決**
- [ ] **インデックス** を `schema.ts` で明示（`unique`, `index`）
- [ ] **`returning()`** で更新後の値を取得（追加クエリ回避）
- [ ] **Zod スキーマ** を Drizzle スキーマから派生（`drizzle-zod`）
- [ ] **DB は Remote Functions と組み合わせる**（型が流れる）

## 関連ページ

- [Remote Functions](/sveltekit/server/remote-functions/) — Drizzle と組み合わせる
- [`$lib/server`](/sveltekit/server/server-only-modules/) — サーバー専用モジュールの配置
- [API ルート](/sveltekit/server/api-routes/) — `+server.ts` での DB アクセス
- [環境変数管理](/sveltekit/application/environment/) — `DATABASE_URL` の管理
- [認証・認可](/sveltekit/application/authentication/) — User テーブル設計
- [セキュリティ対策](/sveltekit/deployment/security/) — SQL インジェクション防止
- [モニタリング](/sveltekit/deployment/monitoring/) — クエリパフォーマンス監視

## 次のステップ

1. **[Remote Functions](/sveltekit/server/remote-functions/)** で型安全な RPC + DB のセット
2. **[認証・認可](/sveltekit/application/authentication/)** で User テーブルと Better Auth を連携
3. **[モニタリング](/sveltekit/deployment/monitoring/)** で N+1 やスロークエリを検出
