---
title: Load関数とデータフェッチング
description: SvelteKitのデータ取得戦略を完全マスター - Universal/Server Load、ストリーミング、キャッシュ戦略まで
---

<script lang="ts">
  import Mermaid from '$lib/components/Mermaid.svelte';

  const FlowchartForDifferentUses = `graph TB
    Start["データ取得が必要"] --> Q1{"秘密情報を<br/>扱う？"}
    
    Q1 -->|Yes| Server[Server Load<br/>+page.server.ts]
    Q1 -->|No| Q2{"データベース<br/>アクセス？"}
    
    Q2 -->|Yes| Server
    Q2 -->|No| Q3{"ファイルシステム<br/>アクセス？"}
    
    Q3 -->|Yes| Server
    Q3 -->|No| Q4{"クライアントで<br/>実行可能？"}
    
    Q4 -->|Yes| Universal[Universal Load<br/>+page.ts]
    Q4 -->|No| Server
    
    Server --> ServerBenefit["✅ セキュア<br/>✅ サーバーリソース活用<br/>⚠️ サーバー負荷"]
    Universal --> UniversalBenefit["✅ 高速ナビゲーション<br/>✅ CDNキャッシュ<br/>⚠️ バンドルサイズ"]`;

  // Load関数のデータフロー図
  const DataFlowDiagram = `graph TB
    subgraph "初回アクセス (SSR)"
      direction TB
      Browser1[ブラウザ] -->|リクエスト| Server1[サーバー]
      Server1 -->|1. layout.server.ts| LayoutServerLoad[layout.server.ts<br/>実行]
      Server1 -->|2. page.server.ts| PageServerLoad[page.server.ts<br/>実行]
      Server1 -->|3. layout.ts| LayoutLoad[layout.ts<br/>実行]
      Server1 -->|4. page.ts| PageLoad[page.ts<br/>実行]
      PageLoad -->|HTML + データ| Browser1
    end
    
    subgraph "クライアントサイドナビゲーション"
      direction TB
      Browser2[ブラウザ] -->|ナビゲーション| ClientRouter[クライアント<br/>ルーター]
      ClientRouter -->|必要に応じて| ServerAPI[サーバー API]
      ServerAPI -->|Server Load| ServerData[サーバーデータ]
      ClientRouter -->|Universal Load| ClientData[クライアント<br/>実行]
      ServerData --> Component[Svelteコンポーネント]
      ClientData --> Component
    end
    
    style LayoutServerLoad fill:#f9f,stroke:#333,stroke-width:2px,color:black
    style PageServerLoad fill:#f9f,stroke:#333,stroke-width:2px,color:black
    style LayoutLoad fill:#9ff,stroke:#333,stroke-width:2px,color:black
    style PageLoad fill:#9ff,stroke:#333,stroke-width:2px,color:black
    style ServerData fill:#f9f,stroke:#333,stroke-width:2px,color:black
    style ClientData fill:#9ff,stroke:#333,stroke-width:2px,color:black`;

  // Load関数の実行順序
  const LoadSequenceDiagram = `sequenceDiagram
    participant B as ブラウザ
    participant S as サーバー
    participant LS as layout.server.ts
    participant PS as page.server.ts
    participant L as layout.ts
    participant P as page.ts
    participant C as コンポーネント
    
    B->>S: ページリクエスト
    S->>LS: ① 実行（サーバーのみ）
    LS-->>S: 認証・DB データ
    S->>PS: ② 実行（サーバーのみ）
    PS-->>S: ページ固有データ
    S->>L: ③ 実行（ユニバーサル）
    L-->>S: 共通データ
    S->>P: ④ 実行（ユニバーサル）
    P-->>S: 公開データ
    S->>C: ⑤ データを props として渡す
    C-->>B: レンダリング済み HTML
    
    Note over B,C: クライアントサイドナビゲーション時
    B->>L: layout.ts 実行
    B->>P: page.ts 実行
    P->>S: 必要に応じて Server Load を呼び出し
    S-->>P: サーバーデータ
    P-->>C: データ更新
    C-->>B: 画面更新`;
</script>


SvelteKitのLoad関数は、ページレンダリング前にデータを取得する強力な仕組みです。Universal LoadとServer Loadの使い分け、並列データ取得、ストリーミングSSR、エラーハンドリングまで、実践的なTypeScriptコード例で完全解説します。

## Load関数のデータフロー

Load関数がどのようにデータを取得し、コンポーネントに渡すかを理解することで、効率的なデータ管理が可能になります。

### 実行の流れ

Load関数は階層構造に従って順番に実行されます。最初にサーバー専用のLoad関数（`.server.ts`）が実行され、その後ユニバーサルLoad関数（`.ts`）が実行されます。各関数で取得したデータは、最終的にコンポーネントのpropsとして渡されます。

<Mermaid diagram={LoadSequenceDiagram} />

この図が示すように、
- **①②** サーバー専用Load関数は、機密データやデータベースアクセスなど、サーバーでのみ実行すべき処理を担当
- **③④** ユニバーサルLoad関数は、公開可能なデータの取得や、クライアントサイドでも実行可能な処理を担当
- **⑤** すべてのデータが統合され、コンポーネントに渡される

### SSRとクライアントサイドナビゲーションの違い

初回アクセス時のSSR（サーバーサイドレンダリング）と、その後のクライアントサイドナビゲーションでは、Load関数の実行場所が異なります。この違いを理解することで、パフォーマンスの最適化とセキュアな実装が可能になります。

<Mermaid diagram={DataFlowDiagram} />

#### 主な違い
- **SSR時（初回アクセス）**: すべてのLoad関数がサーバー上で実行され、完全にレンダリングされたHTMLが返される
- **クライアントサイドナビゲーション時**: Server Load関数はAPIとして呼び出され、Universal Load関数はブラウザで直接実行される
- **パフォーマンス**: クライアントサイドナビゲーションは差分のみを更新するため高速

## Load関数の基本

Load関数は、ページやレイアウトのレンダリング前にデータを取得するための仕組みです。SvelteKitでは、実行環境と用途に応じて2種類のLoad関数を使い分けることで、セキュリティとパフォーマンスを最適化できます。

### Universal Load vs Server Load

SvelteKitには2種類のLoad関数があり、それぞれ異なる特性と使用場面があります。適切に使い分けることで、セキュアで高速なアプリケーションを構築できます。

| | Universal Load (`+page.ts`) | Server Load (`+page.server.ts`) |
|---|---|---|
| **実行環境** | サーバー＆クライアント | サーバーのみ |
| **用途** | 公開APIからのデータ取得 | DB接続、秘密情報の扱い |
| **返り値** | シリアライズ可能な値 | あらゆる値（Dateオブジェクト等も可） |
| **アクセス可能** | fetch、params、url等 | cookies、locals、platform等も追加 |
| **再実行タイミング** | ナビゲーション時に毎回 | 必要に応じて（invalidate時） |
| **キャッシュ** | ブラウザでキャッシュ可能 | サーバーサイドのみ |


<Tabs activeName="  Universal Load (+page.ts) " > 
  <TabPanel name="  Universal Load (+page.ts) " > 

### Universal Load (+page.ts)

#### 使うべき場面

**🌐 公開APIからのデータ取得**
- GitHub API
- 天気情報API
- 公開ニュースAPI
- CDN上の静的データ

**🚀 クライアントサイド実行可能な処理**
- URLパラメータの解析
- ローカルストレージの読み取り
- ブラウザAPIの利用

**✅ メリット**
- クライアントサイドナビゲーション時に高速
- サーバー負荷を軽減
- プログレッシブエンハンスメント対応
- CDNキャッシュが効く

**⚠️ 注意点**
- APIキーなどの秘密情報を含めてはいけない
- クライアントで実行されるためバンドルサイズに影響
- ブラウザのセキュリティ制約を受ける

**📝 コード例**
```typescript
// src/routes/blog/+page.ts
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
  // 公開APIからデータ取得
  const posts = await fetch('https://api.example.com/posts')
    .then(r => r.json());
  
  return {
    posts
  };
};
```

### Universal Load の実装

Universal Loadは、サーバーとクライアントの両方で実行可能な汎用的なデータ取得関数です。公開APIからのデータ取得や、クライアントサイドでも安全に実行できる処理に最適です。

```typescript
// src/routes/blog/[slug]/+page.ts
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, fetch }) => {
  // SvelteKitが提供する特別なfetch関数を使用
  // - SSR時はサーバー内部で直接実行
  // - CSR時は通常のfetch
  const response = await fetch(`/api/posts/${params.slug}`);
  
  if (!response.ok) {
    throw error(response.status, 'Post not found');
  }
  
  const post = await response.json();
  
  return {
    post
  };
};
```

  </TabPanel >
  <TabPanel  name=" Server Load (+page.server.ts) " > 

### Server Load (+page.server.ts)

#### 使うべき場面

**🔒 秘密情報を扱う処理**
- APIキーを使った外部APIアクセス
- 認証トークンの検証
- 環境変数の利用

**🗄️ データベースアクセス**
- Prisma/Drizzle等のORM使用
- SQLクエリの実行
- トランザクション処理

**📁 ファイルシステム操作**
- サーバー上のファイル読み書き
- アップロードファイルの処理
- ログファイルの操作

**✅ メリット**
- セキュアな情報を扱える
- クライアントバンドルサイズを削減
- サーバーリソースを活用できる
- Dateオブジェクト等も直接返せる

**⚠️ 注意点**
- クライアントサイドナビゲーション時もサーバーにリクエスト
- サーバー負荷が増加する可能性
- キャッシュ戦略の考慮が必要

**📝 コード例**
```typescript
// src/routes/dashboard/+page.server.ts
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/database';

export const load: PageServerLoad = async ({ locals }) => {
  // データベースから直接取得
  const user = await db.user.findUnique({
    where: { id: locals.userId }
  });
  
  return {
    user,
    serverTime: new Date() // DateオブジェクトもOK
  };
};
```

### Server Load の実装

Server Loadは、サーバーサイドでのみ実行される安全なデータ取得関数です。データベースアクセス、ファイル操作、秘密情報を扱う処理など、クライアントに公開できない処理を実行する場合に使用します。

```typescript
// src/routes/dashboard/+page.server.ts
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/database';

export const load: PageServerLoad = async ({ locals, cookies }) => {
  // サーバーのみで実行される
  const sessionId = cookies.get('session');
  
  if (!sessionId) {
    throw redirect(303, '/login');
  }
  
  // データベースに直接アクセス
  const user = await db.user.findUnique({
    where: { sessionId }
  });
  
  const stats = await db.stats.findMany({
    where: { userId: user.id }
  });
  
  // Dateオブジェクトなども直接返せる
  return {
    user,
    stats,
    lastUpdated: new Date()
  };
};
```
  </TabPanel >
</Tabs >


### 使い分けフローチャート

どちらのLoad関数を使うべきか迷った時は、このフローチャートに従って判断できます。セキュリティ要件とパフォーマンス要件のバランスを考慮して、最適な選択をしましょう。

<Mermaid diagram={FlowchartForDifferentUses} />

#### 判断基準の詳細

| 判断ポイント | Server Load を選ぶ理由 | Universal Load を選ぶ理由 |
|---|---|---|
| **秘密情報の扱い** | APIキー、認証トークン、環境変数などの機密情報を扱う必要がある | 公開可能な情報のみを扱う |
| **データソース** | データベース、ファイルシステム、内部APIへの直接アクセスが必要 | 公開API、CDN、静的データの取得で十分 |
| **実行環境** | Node.js固有の機能（fs、crypto等）を使用する | ブラウザでも実行可能な処理のみ |
| **レスポンス形式** | Dateオブジェクト、Map、Set等の複雑な型を返したい | JSONシリアライズ可能な値のみ返す |
| **キャッシュ戦略** | サーバーサイドでのキャッシュ制御が必要 | CDNやブラウザキャッシュを活用したい |

#### 実際の使用例

| 推奨 | ユースケース | 理由 |
|---|---|---|
| Universal Load | ブログ記事一覧の取得 | 公開APIから取得可能、CDNキャッシュも効く |
|| 天気情報の表示 | 公開APIから取得、クライアントでも実行可能 |
|| 検索結果の表示 | 公開検索APIを使用、高速なナビゲーション |
| Server Load | ユーザー認証情報の取得 | セッションやJWTトークンの検証が必要 |
|| 決済情報の処理 | 秘密鍵や決済APIキーを使用 |
|| ファイルアップロード処理 | ファイルシステムへの書き込みが必要 |


## 型安全なデータ取得

SvelteKitの強力な型システムにより、Load関数からコンポーネントまで一貫した型安全性が保証されます。これにより、実行時エラーを未然に防ぎ、開発効率を大幅に向上させます。

### 自動生成される型定義

SvelteKitは`$types`を自動生成し、完全な型安全性を提供

```typescript
// src/routes/products/[id]/+page.ts
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, url, fetch }) => {
  // params.id は自動的に string 型
  const productId = params.id;
  
  // URLSearchParamsも型安全
  const variant = url.searchParams.get('variant');
  
  const product = await fetch(`/api/products/${productId}`).then(r => r.json());
  
  return {
    product,
    variant
  };
};
```

```svelte
<!-- src/routes/products/[id]/+page.svelte -->


<h1>{data.product.name}</h1>
{#if data.variant}
  <p>選択中: {data.variant}</p>
{/if}
```

## 並列データ取得

複数のデータソースから効率的にデータを取得するための並列処理パターンです。適切な並列化により、ページの読み込み時間を大幅に短縮できます。

### Promise.all を使った並列取得

```typescript
// src/routes/dashboard/+page.ts
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
  // 複数のAPIを並列で呼び出し
  const [user, posts, notifications, analytics] = await Promise.all([
    fetch('/api/user').then(r => r.json()),
    fetch('/api/posts?limit=10').then(r => r.json()),
    fetch('/api/notifications').then(r => r.json()),
    fetch('/api/analytics/summary').then(r => r.json())
  ]);
  
  return {
    user,
    posts,
    notifications,
    analytics
  };
};
```

### エラー処理付き並列取得

一部のAPIがエラーになってもページ全体が失敗しないよう、個別にエラーハンドリングを行うパターンです。

```typescript
// src/routes/feed/+page.ts
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
  // エラーが発生してもページ全体をクラッシュさせない
  const results = await Promise.allSettled([
    fetch('/api/feed').then(r => r.json()),
    fetch('/api/trending').then(r => r.json()),
    fetch('/api/recommendations').then(r => r.json())
  ]);
  
  return {
    feed: results[0].status === 'fulfilled' ? results[0].value : [],
    trending: results[1].status === 'fulfilled' ? results[1].value : [],
    recommendations: results[2].status === 'fulfilled' ? results[2].value : []
  };
};
```

## データの依存関係

レイアウトとページ間でデータを共有し、階層的なデータ構造を構築するための仕組みです。parent()関数を使用することで、親レイアウトのデータを子ページで利用できます。

### parent()を使った親データへのアクセス

```typescript
// src/routes/+layout.server.ts
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
  const user = await locals.getUser();
  
  return {
    user
  };
};
```

```typescript
// src/routes/profile/+page.ts
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent, fetch }) => {
  // 親レイアウトのデータを取得
  const { user } = await parent();
  
  if (!user) {
    throw redirect(303, '/login');
  }
  
  // userデータに基づいて追加データを取得
  const profile = await fetch(`/api/users/${user.id}/profile`).then(r => r.json());
  
  return {
    profile
  };
};
```

### depends と invalidate

データの依存関係を明示的に宣言し、必要に応じてデータを再取得する仕組みです。リアルタイムデータ更新が必要なアプリケーションで重要な機能です。

```typescript
// src/routes/notifications/+page.ts
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, depends }) => {
  // この依存関係を登録
  depends('app:notifications');
  
  const notifications = await fetch('/api/notifications').then(r => r.json());
  
  return {
    notifications
  };
};
```

```svelte
<!-- src/routes/notifications/+page.svelte -->
<script lang="ts">
  import { invalidate } from '$app/navigation';
  import type { PageData } from './$types';
  
  export let data: PageData;
  
  async function markAsRead(id: string) {
    await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
    
    // 'app:notifications'に依存するデータを再取得
    await invalidate('app:notifications');
  }
</script>
```

## ストリーミングSSR

ストリーミングSSRは、重要なデータを先に送信し、時間のかかるデータを後から送信することで、体感速度を向上させる技術です。ユーザーはページの基本部分をすぐに閲覧でき、詳細データは順次表示されます。

### 基本的なストリーミング

```typescript
// src/routes/feed/+page.server.ts
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
  // 即座に返すデータ
  const user = await fetch('/api/user').then(r => r.json());
  
  // ストリーミングで後から送信するデータ
  const posts = fetch('/api/posts?limit=50')
    .then(r => r.json())
    .catch(() => []); // エラー時のフォールバック
  
  const recommendations = fetch('/api/recommendations')
    .then(r => r.json())
    .catch(() => []);
  
  return {
    user, // 即座に利用可能
    streamed: {
      posts,          // Promiseとして後から解決
      recommendations // Promiseとして後から解決
    }
  };
};
```

```svelte
<!-- src/routes/feed/+page.svelte -->
<script lang="ts">
  import type { PageData } from './$types';
  
  export let data: PageData;
</script>

<h1>Welcome, {data.user.name}!</h1>

{#await data.streamed.posts}
  <p>投稿を読み込み中...</p>
{:then posts}
  <section>
    <h2>最新の投稿</h2>
    {#each posts as post}
      <article>{post.title}</article>
    {/each}
  </section>
{:catch error}
  <p>投稿の読み込みに失敗しました</p>
{/await}
```

### 段階的なデータ表示

優先度に応じてデータを段階的に表示するパターンです。重要な情報を先に表示し、補助的な情報を後から表示することで、ユーザー体験を最適化します。

```typescript
// src/routes/analytics/+page.server.ts
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
  // 優先度順にデータを取得
  const summary = await fetch('/api/analytics/summary').then(r => r.json());
  
  // 重いクエリは非同期で
  const detailedStats = fetch('/api/analytics/detailed')
    .then(r => r.json());
  
  const historicalData = fetch('/api/analytics/history')
    .then(r => r.json());
  
  return {
    summary, // すぐ表示
    streamed: {
      detailedStats,  // 後から表示
      historicalData  // さらに後から表示
    }
  };
};
```

## エラーハンドリング

Load関数で発生するエラーを適切に処理し、ユーザーに分かりやすいエラーメッセージを表示するためのパターンです。エラーの種類に応じた適切な処理を行うことで、アプリケーションの信頼性を向上させます。

### 構造化されたエラー処理

```typescript
// src/routes/posts/[id]/+page.ts
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, fetch }) => {
  try {
    const response = await fetch(`/api/posts/${params.id}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw error(404, {
          message: '記事が見つかりません',
          code: 'POST_NOT_FOUND'
        });
      }
      
      throw error(response.status, {
        message: 'データの取得に失敗しました'
      });
    }
    
    return {
      post: await response.json()
    };
  } catch (err) {
    // ネットワークエラー等
    console.error('Load error:', err);
    throw error(500, {
      message: 'サーバーエラーが発生しました'
    });
  }
};
```

### フォールバック付きデータ取得

APIが失敗した場合でもアプリケーションが完全に停止しないよう、フォールバックデータを提供するパターンです。

```typescript
// src/routes/products/+page.ts
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, url }) => {
  const category = url.searchParams.get('category');
  
  // メインデータの取得を試みる
  let products;
  try {
    const response = await fetch(`/api/products?category=${category}`);
    products = await response.json();
  } catch {
    // フォールバック: キャッシュまたはデフォルトデータ
    products = await getCachedProducts(category) || [];
  }
  
  return {
    products,
    fallback: products.length === 0
  };
};
```

## キャッシュ戦略

データのキャッシュ戦略を適切に設定することで、パフォーマンスを向上させサーバー負荷を軽減できます。HTTPキャッシュヘッダーやアプリケーションレベルのキャッシュを組み合わせることが重要です。

### HTTP キャッシュヘッダーの設定

```typescript
// src/routes/api/posts/+server.ts
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ setHeaders }) => {
  const posts = await fetchPosts();
  
  // キャッシュ制御
  setHeaders({
    'cache-control': 'public, max-age=3600', // 1時間キャッシュ
    'vary': 'Accept-Encoding'
  });
  
  return json(posts);
};
```

### load関数でのキャッシュ制御

Load関数内でキャッシュ戦略を制御し、ページ全体のキャッシュ動作を最適化する方法です。

```typescript
// src/routes/blog/+page.ts
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, setHeaders }) => {
  const posts = await fetch('/api/posts', {
    headers: {
      'cache-control': 'max-age=60' // 1分間キャッシュ
    }
  }).then(r => r.json());
  
  // ページ全体のキャッシュ設定
  setHeaders({
    'cache-control': 'public, max-age=300'
  });
  
  return {
    posts
  };
};
```

## リアルタイムデータ

リアルタイム更新が必要なアプリケーションで、WebSocketやServer-Sent Eventsを使用してデータをストリーミングする方法です。Load関数で初期データを取得し、その後リアルタイム接続を確立します。

### WebSocketとの統合

```typescript
// src/routes/chat/+page.ts
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
  // 初期データの取得
  const messages = await fetch('/api/messages').then(r => r.json());
  
  return {
    messages,
    // WebSocket接続情報
    wsUrl: import.meta.env.VITE_WS_URL || 'ws://localhost:3000'
  };
};
```

```svelte
<!-- src/routes/chat/+page.svelte -->
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import type { PageData } from './$types';
  
  export let data: PageData;
  
  let messages = $state(data.messages);
  let ws: WebSocket;
  
  onMount(() => {
    ws = new WebSocket(data.wsUrl);
    
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      messages = [...messages, message];
    };
  });
  
  onDestroy(() => {
    ws?.close();
  });
</script>
```

## 実践的なパターン

実際のアプリケーションで頻繁に使用されるデータ取得パターンを紹介します。これらのパターンをマスターすることで、様々な要件に対応できるようになります。

### 無限スクロール実装

```typescript
// src/routes/feed/+page.ts
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ url, fetch }) => {
  const page = Number(url.searchParams.get('page')) || 1;
  const limit = 20;
  
  const response = await fetch(`/api/posts?page=${page}&limit=${limit}`);
  const { posts, hasMore } = await response.json();
  
  return {
    posts,
    hasMore,
    nextPage: hasMore ? page + 1 : null
  };
};
```

```svelte
<!-- src/routes/feed/+page.svelte -->
<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import type { PageData } from './$types';
  
  export let data: PageData;
  
  let posts = $state(data.posts);
  let loading = $state(false);
  
  async function loadMore() {
    if (!data.nextPage || loading) return;
    
    loading = true;
    
    // URLを更新してデータを取得
    const url = new URL($page.url);
    url.searchParams.set('page', String(data.nextPage));
    
    const response = await fetch(url.pathname + url.search);
    const newData = await response.json();
    
    posts = [...posts, ...newData.posts];
    data.nextPage = newData.nextPage;
    loading = false;
  }
</script>
```

### 検索with デバウンス

ユーザーの入力に応じてリアルタイム検索を実装するパターンです。デバウンス処理により、過剰なAPIリクエストを防ぎます。

```typescript
// src/routes/search/+page.ts
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ url, fetch }) => {
  const query = url.searchParams.get('q') || '';
  
  if (!query) {
    return {
      results: [],
      query: ''
    };
  }
  
  const results = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
    .then(r => r.json())
    .catch(() => []);
  
  return {
    results,
    query
  };
};
```

```svelte
<!-- src/routes/search/+page.svelte -->
<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import type { PageData } from './$types';
  
  export let data: PageData;
  
  let searchInput = $state(data.query);
  let timeoutId: number;
  
  function debounceSearch(value: string) {
    clearTimeout(timeoutId);
    
    timeoutId = setTimeout(() => {
      const url = new URL($page.url);
      
      if (value) {
        url.searchParams.set('q', value);
      } else {
        url.searchParams.delete('q');
      }
      
      goto(url, { replaceState: true, keepFocus: true });
    }, 300);
  }
  
  $effect(() => {
    if (searchInput !== data.query) {
      debounceSearch(searchInput);
    }
  });
</script>

<input 
  bind:value={searchInput} 
  placeholder="検索..."
/>
```

## パフォーマンス最適化

Load関数のパフォーマンスを最適化するためのテクニックです。適切な最適化により、ページの読み込み速度を大幅に改善できます。

### 選択的なプリロード

```typescript
// src/routes/+layout.ts
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ fetch }) => {
  // 重要なデータのみ事前取得
  const criticalData = await fetch('/api/critical').then(r => r.json());
  
  return {
    critical: criticalData,
    // 遅延読み込み
    lazy: {
      async getAdditionalData() {
        return fetch('/api/additional').then(r => r.json());
      }
    }
  };
};
```

### データの重複排除

同じデータを何度も取得することを防ぎ、ネットワークリソースを節約するパターンです。

```typescript
// src/lib/cache.ts
const cache = new Map<string, Promise<any>>();

export function cachedFetch(url: string, ttl = 60000) {
  const cached = cache.get(url);
  
  if (cached) {
    return cached;
  }
  
  const promise = fetch(url).then(r => r.json());
  cache.set(url, promise);
  
  setTimeout(() => cache.delete(url), ttl);
  
  return promise;
}
```

## トラブルシューティング

Load関数でよく発生する問題とその解決方法をまとめました。これらのポイントを理解することで、問題を素早く解決できます。

:::warning[Load関数が実行されない]
- ファイル名が正しいか確認（`+page.ts`、`+page.server.ts`）
- exportが正しいか確認（`export const load`）
- 型定義が正しいか確認（`PageLoad`、`PageServerLoad`）
:::

:::tip[データが更新されない]
`invalidate`や`invalidateAll`を使用してデータを再取得
```typescript
await invalidate('app:data');
await invalidateAll(); // 全データ再取得
```
:::

:::caution[シリアライズエラー]
Universal Load（`+page.ts`）では、シリアライズ可能な値のみ返す。
- ❌ Date、Map、Set、関数
- ✅ プレーンオブジェクト、配列、プリミティブ値
:::

## まとめ

SvelteKitのLoad関数は、
- **柔軟**：Universal/Serverの使い分けが可能
- **型安全**：完全な TypeScript サポート
- **高性能**：並列取得、ストリーミングSSR対応
- **実践的**：エラー処理、キャッシュ戦略を完備

## 次のステップ

[フォーム処理とActions](/sveltekit/server/forms/)で、インタラクティブなフォーム処理について学びましょう。

