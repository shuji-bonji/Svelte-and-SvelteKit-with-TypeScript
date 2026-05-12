---
title: Svelte + GraphQL
description: SvelteとGraphQLでSPAを構築するための実践ガイド。Apollo Clientやurql、Hasuraを用いたクエリ/ミューテーションの型安全化、キャッシュポリシー設定、リアルタイム購読の実装まで解説する。運用時の注意点も補足。詳しい手順とチェックリスト付き。運用時の確認ポイントも掲載。補足
---

<script>
	import Admonition from '$lib/components/Admonition.svelte';
  import { base } from '$app/paths';
  import Mermaid from '$lib/components/Mermaid.svelte';
  
  const graphqlArchitecture = `flowchart LR
    subgraph Frontend[\"🌐 Svelte SPA\"]
      Component[コンポーネント]
      Client[GraphQL Client]
      Cache[(キャッシュ)]
    end
    
    subgraph Backend[\"🎯 GraphQL Server\"]
      Schema[Schema]
      Resolvers[Resolvers]
      DB[(Database)]
    end
    
    Component --> Client
    Client --> Cache
    Client <--> Schema
    Schema --> Resolvers
    Resolvers --> DB
    
    style Component fill:#ff3e00,color:#fff
    style Schema fill:#E535AB,color:#fff
    style DB fill:#2196F3,color:#fff`;
</script>

GraphQLは、APIのためのクエリ言語で、型安全で効率的なデータフェッチングを実現します。Svelteと組み合わせることで、必要なデータだけを取得する高速なアプリケーションを構築できます。

## GraphQLの利点

<Mermaid diagram={graphqlArchitecture} />

### 主な特徴

- 📊 **単一エンドポイント** - すべてのデータを1つのエンドポイントから取得
- 🎯 **必要なデータのみ** - オーバーフェッチング・アンダーフェッチングを解消
- 🔍 **型安全** - スキーマによる強力な型システム
- ⚡ **リアルタイム** - Subscriptionによるリアルタイム更新
- 🔄 **キャッシュ** - 正規化されたキャッシュで効率的

## Apollo Client統合

### 1. セットアップ

```bash
npm create vite@latest my-svelte-apollo -- --template svelte-ts
cd my-svelte-apollo
npm install @apollo/client graphql
```

### 2. Apollo Clientの設定

```typescript
// src/lib/apollo.ts
import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  split,
} from '@apollo/client/core';
// Apollo Client 3.7+ で WebSocketLink は削除済み。
// 現行は GraphQLWsLink + graphql-ws を使う
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient as createWsClient } from 'graphql-ws';
import { setContext } from '@apollo/client/link/context';
import { getMainDefinition } from '@apollo/client/utilities';

// HTTPリンク
const httpLink = createHttpLink({
  uri: import.meta.env.VITE_GRAPHQL_ENDPOINT || 'http://localhost:4000/graphql',
});

// 認証ヘッダーは setContext で動的に注入（トークン更新にも追従）
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// WebSocket リンク（Subscription用）— graphql-ws ベース
const wsLink = new GraphQLWsLink(
  createWsClient({
    url: import.meta.env.VITE_GRAPHQL_WS_ENDPOINT || 'ws://localhost:4000/graphql',
    connectionParams: () => ({
      authorization: localStorage.getItem('token') ?? '',
    }),
    // 自動再接続は graphql-ws のデフォルト挙動
    retryAttempts: 5,
  }),
);

// リンクの分割（Query/MutationとSubscription）
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  authLink.concat(httpLink),
);

// Apolloクライアントの作成
export const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
  },
});
```

:::info[Apollo Client 3.7+ での変更]
本ガイドは Apollo Client 3.x 系（現行）を前提にしています。

- `WebSocketLink`（`@apollo/client/link/ws`）は **3.7 で削除**されました。代替は `GraphQLWsLink`（`@apollo/client/link/subscriptions`）+ `graphql-ws` パッケージです。
- 認証ヘッダーは `httpLink` の `headers` に直接渡すとトークン更新に追従しないので、`setContext` リンクで動的に注入する書き方が定番です。
:::

### 3. GraphQLスキーマと型生成

```typescript
// schema.graphql
const schema = `
type User {
  id: ID!
  name: String!
  email: String!
  posts: [Post!]!
}

type Post {
  id: ID!
  title: String!
  content: String!
  author: User!
  createdAt: String!
}

type Query {
  users: [User!]!
  user(id: ID!): User
  posts(limit: Int, offset: Int): [Post!]!
}

type Mutation {
  createPost(input: CreatePostInput!): Post!
  updatePost(id: ID!, input: UpdatePostInput!): Post!
  deletePost(id: ID!): Boolean!
}

type Subscription {
  postCreated: Post!
  postUpdated(id: ID!): Post!
}

input CreatePostInput {
  title: String!
  content: String!
  authorId: ID!
}

input UpdatePostInput {
  title: String
  content: String
}
`;
```

```bash
# 型を自動生成
npm install -D @graphql-codegen/cli @graphql-codegen/typescript
npx graphql-codegen init
npx graphql-codegen
```

### 4. Svelteストアとの統合

```typescript
// src/lib/stores/graphql.svelte.ts
import { apolloClient } from '$lib/apollo';
import { gql } from '@apollo/client/core';
import type { Post, User } from '$lib/generated/graphql';

class GraphQLStore {
  posts = $state<Post[]>([]);
  loading = $state(false);
  error = $state<Error | null>(null);

  async fetchPosts(limit = 10) {
    this.loading = true;
    this.error = null;

    try {
      const result = await apolloClient.query({
        query: gql`
          query GetPosts($limit: Int) {
            posts(limit: $limit) {
              id
              title
              content
              createdAt
              author {
                id
                name
              }
            }
          }
        `,
        variables: { limit },
      });

      this.posts = result.data.posts;
    } catch (err) {
      this.error = err as Error;
    } finally {
      this.loading = false;
    }
  }

  async createPost(title: string, content: string, authorId: string) {
    const result = await apolloClient.mutate({
      mutation: gql`
        mutation CreatePost($input: CreatePostInput!) {
          createPost(input: $input) {
            id
            title
            content
            author {
              id
              name
            }
            createdAt
          }
        }
      `,
      variables: {
        input: { title, content, authorId },
      },
    });

    if (result.data) {
      this.posts = [result.data.createPost, ...this.posts];
    }
  }

  subscribeToNewPosts() {
    const subscription = apolloClient
      .subscribe({
        query: gql`
          subscription OnPostCreated {
            postCreated {
              id
              title
              content
              author {
                id
                name
              }
              createdAt
            }
          }
        `,
      })
      .subscribe({
        next: ({ data }) => {
          if (data?.postCreated) {
            this.posts = [data.postCreated, ...this.posts];
          }
        },
      });

    return () => subscription.unsubscribe();
  }
}

export const graphqlStore = new GraphQLStore();
```

## urql統合（軽量な代替案）

### 1. urqlセットアップ

```bash
npm install urql graphql
```

### 2. urqlクライアント設定

```typescript
// src/lib/urql.ts
// urql v4+: defaultExchanges は削除済み。cacheExchange / fetchExchange を個別に指定する
import {
  createClient,
  cacheExchange,
  fetchExchange,
  subscriptionExchange,
} from 'urql';
import { createClient as createWSClient } from 'graphql-ws';

const wsClient = createWSClient({
  url: 'ws://localhost:4000/graphql',
  connectionParams: () => ({
    authorization: localStorage.getItem('token') ?? '',
  }),
  retryAttempts: 5,
});

export const urqlClient = createClient({
  url: 'http://localhost:4000/graphql',
  fetchOptions: () => ({
    headers: {
      authorization: localStorage.getItem('token') ?? '',
    },
  }),
  exchanges: [
    cacheExchange,
    fetchExchange,
    subscriptionExchange({
      forwardSubscription: (operation) => ({
        subscribe: (sink) => ({
          unsubscribe: wsClient.subscribe(operation as any, sink),
        }),
      }),
    }),
  ],
});
```

:::info[urql v4 での変更]
urql v4 で **`defaultExchanges` は削除**されました。`cacheExchange` と `fetchExchange` を個別に import して `exchanges` 配列に並べてください。順序は **`cacheExchange` → `fetchExchange` → `subscriptionExchange`** が標準です。
:::

### 3. Svelteコンポーネントでの使用

```svelte
<!-- src/lib/components/PostList.svelte -->
<script lang="ts">
  import { urqlClient } from '$lib/urql';
  import { gql } from 'urql';

  interface Post {
    id: string;
    title: string;
    content: string;
    author: {
      name: string;
    };
  }

  let posts = $state<Post[]>([]);
  let loading = $state(true);
  let error = $state<Error | null>(null);

  const POSTS_QUERY = gql`
    query GetPosts($limit: Int!) {
      posts(limit: $limit) {
        id
        title
        content
        author {
          name
        }
      }
    }
  `;

  async function fetchPosts() {
    loading = true;
    error = null;

    const result = await urqlClient.query(POSTS_QUERY, { limit: 10 });

    if (result.error) {
      error = result.error;
    } else if (result.data) {
      posts = result.data.posts;
    }

    loading = false;
  }

  // 初期ロード
  $effect(() => {
    fetchPosts();
  });
</script>

{#if loading}
  <p>読み込み中...</p>
{:else if error}
  <p class="error">エラー: {error.message}</p>
{:else}
  <div class="posts">
    {#each posts as post (post.id)}
      <article>
        <h2>{post.title}</h2>
        <p>{post.content}</p>
        <small>by {post.author.name}</small>
      </article>
    {/each}
  </div>
{/if}
```

## Hasura統合（インスタントGraphQL）

### 1. Hasuraセットアップ

```yaml
# docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: postgrespassword
    volumes:
      - db_data:/var/lib/postgresql/data

  hasura:
    image: hasura/graphql-engine:latest
    ports:
      - '8080:8080'
    depends_on:
      - postgres
    environment:
      HASURA_GRAPHQL_DATABASE_URL: postgres://postgres:postgrespassword@postgres:5432/postgres
      HASURA_GRAPHQL_ENABLE_CONSOLE: 'true'
      HASURA_GRAPHQL_ADMIN_SECRET: myadminsecret

volumes:
  db_data:
```

### 2. Hasuraクライアント

```typescript
// src/lib/hasura.ts
import { createClient } from 'urql';

export const hasuraClient = createClient({
  url: 'http://localhost:8080/v1/graphql',
  fetchOptions: () => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        'x-hasura-admin-secret': 'myadminsecret',
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
    };
  },
});

// リアルタイムサブスクリプション
export function subscribeToTable<T>(tableName: string, fields: string[]) {
  const subscription = gql`
    subscription Subscribe {
      ${tableName}(order_by: {created_at: desc}) {
        ${fields.join('\n')}
      }
    }
  `;

  return hasuraClient.subscription(subscription);
}
```

## ベストプラクティス

### 1. Fragment の活用

```typescript
// src/lib/graphql/fragments.ts
import { gql } from '@apollo/client/core';

export const USER_FRAGMENT = gql`
  fragment UserInfo on User {
    id
    name
    email
    avatar
  }
`;

export const POST_FRAGMENT = gql`
  fragment PostInfo on Post {
    id
    title
    content
    createdAt
    author {
      ...UserInfo
    }
  }
  ${USER_FRAGMENT}
`;

// 使用例
const GET_POSTS = gql`
  query GetPosts {
    posts {
      ...PostInfo
    }
  }
  ${POST_FRAGMENT}
`;
```

### 2. エラーハンドリング

```typescript
// src/lib/utils/graphql-error.ts
import type { ApolloError } from '@apollo/client/core';

export function handleGraphQLError(error: ApolloError): string {
  // ネットワークエラー
  if (error.networkError) {
    return 'ネットワークエラーが発生しました';
  }

  // GraphQLエラー
  if (error.graphQLErrors?.length > 0) {
    return error.graphQLErrors[0].message;
  }

  return '予期しないエラーが発生しました';
}
```

### 3. オプティミスティックUI

```typescript
// src/lib/stores/optimistic.svelte.ts
class OptimisticStore {
  items = $state<Item[]>([]);

  async createItem(input: CreateItemInput) {
    // オプティミスティック更新
    const optimisticItem = {
      id: `temp-${Date.now()}`,
      ...input,
      __typename: 'Item',
    };

    this.items = [optimisticItem, ...this.items];

    try {
      const result = await apolloClient.mutate({
        mutation: CREATE_ITEM,
        variables: { input },
        optimisticResponse: {
          createItem: optimisticItem,
        },
        update: (cache, { data }) => {
          // キャッシュ更新
          const newItem = data?.createItem;
          if (newItem) {
            cache.modify({
              fields: {
                items(existingItems = []) {
                  const newItemRef = cache.writeFragment({
                    data: newItem,
                    fragment: ITEM_FRAGMENT,
                  });
                  return [newItemRef, ...existingItems];
                },
              },
            });
          }
        },
      });

      // 一時アイテムを実際のアイテムに置き換え
      if (result.data?.createItem) {
        this.items = this.items.map((item) =>
          item.id === optimisticItem.id ? result.data.createItem : item,
        );
      }
    } catch (error) {
      // エラー時はオプティミスティック更新を取り消し
      this.items = this.items.filter((item) => item.id !== optimisticItem.id);
      throw error;
    }
  }
}
```

### 4. ページネーション

```typescript
// src/lib/stores/pagination.svelte.ts
class PaginationStore {
  items = $state<Item[]>([]);
  hasMore = $state(true);
  loading = $state(false);
  cursor = $state<string | null>(null);

  async loadMore() {
    if (this.loading || !this.hasMore) return;

    this.loading = true;
    const result = await apolloClient.query({
      query: GET_ITEMS,
      variables: {
        limit: 20,
        cursor: this.cursor,
      },
    });

    const newItems = result.data.items;
    this.items = [...this.items, ...newItems];
    this.hasMore = newItems.length === 20;
    this.cursor = newItems[newItems.length - 1]?.id || null;
    this.loading = false;
  }

  // 無限スクロール
  setupInfiniteScroll(element: HTMLElement) {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          this.loadMore();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }
}
```

<Admonition type="tip" title="GraphQLツール">

<ul>
<li><strong>GraphQL Playground</strong> - APIエクスプローラー</li>
<li><strong>GraphQL Code Generator</strong> - 型の自動生成</li>
<li><strong>Apollo DevTools</strong> - デバッグツール</li>
<li><strong>Hasura Console</strong> - 管理画面</li>
</ul>

</Admonition>

## まとめ

Svelte + GraphQLの組み合わせは以下のケースに最適です。

- ✅ **型安全** - スキーマから型を自動生成
- ✅ **効率的なフェッチ** - 必要なデータのみ取得
- ✅ **リアルタイム** - Subscriptionでリアルタイム更新
- ✅ **複雑なデータ** - ネストした関連データも一度に取得

他のアーキテクチャパターンも参考にしてください。

- [Firebase統合](/svelte/architecture/spa-patterns/firebase/)
- [Supabase統合](/svelte/architecture/spa-patterns/supabase/)
