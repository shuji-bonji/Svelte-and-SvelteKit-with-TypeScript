---
title: SPAモードとデータ無効化
description: SvelteKitのSPAモードとデータ無効化システム - ssr=falseによるクライアントサイドレンダリングとinvalidate/dependsによるリアクティブなデータ更新をTypeScriptで実装
---

<script>
  import Mermaid from '$lib/components/Mermaid.svelte';

  // SPAモードのナビゲーション図
  const spaNavigationDiagram = `sequenceDiagram
    participant User as ユーザー
    participant Browser as ブラウザ
    participant API as 外部API

    rect rgba(100, 180, 255, 0.2)
        Note over User,API: 初回アクセス
        User->>Browser: /dashboard アクセス
        Browser->>Browser: 空のHTMLを表示
        Browser->>Browser: JSバンドルをロード
        Browser->>Browser: layout.ts → page.ts 実行
        Browser->>API: fetch('/api/dashboard')
        API-->>Browser: JSONデータ
        Browser->>Browser: layout.svelte → page.svelte レンダリング
        Browser->>User: 画面表示
    end

    rect rgba(255, 150, 100, 0.2)
        Note over User,API: クライアントサイドナビゲーション
        User->>Browser: /settings リンククリック
        Browser->>Browser: settings/+page.ts 実行
        Browser->>API: fetch('/api/settings')
        API-->>Browser: JSONデータ
        Browser->>Browser: settings/+page.svelte レンダリング
        Browser->>User: 画面更新（ページリロードなし）
    end`;

  const invalidateFlowDiagram = `sequenceDiagram
    participant U as ユーザー
    participant C as コンポーネント
    participant N as Navigation API
    participant L as Load関数
    participant API as APIサーバー
    participant R as Svelteリアクティビティ

    Note over C: 初期状態
    C->>C: let { data } = $props()
    Note over C: data.user = { name: "太郎" }

    U->>C: 更新ボタンクリック
    C->>N: await invalidate('/api/user')

    Note over N: 依存関係の確認
    N->>N: '/api/user'を使用する<br/>Load関数を特定

    Note over N: Load関数の再実行
    N->>L: +page.ts load()を再実行
    L->>API: fetch('/api/user')
    API-->>L: { name: "次郎", ... }
    L-->>N: return { user: 新データ }

    Note over N: データの伝播
    N->>R: 新しいPageDataを設定

    Note over R: リアクティブ更新
    R->>C: $propsの自動更新
    Note over C: data.user = { name: "次郎" }

    R->>C: UIの再レンダリング
    Note over C: 画面に"次郎"が表示される

    C-->>U: 更新完了
  `;

  // depends()とinvalidate()の動作を示すシーケンス図
  const dependsInvalidateDiagram = `sequenceDiagram
    participant Component as +page.svelte
    participant Router as SvelteKitルーター
    participant LayoutLoad as +layout.ts
    participant PageLoad as +page.ts
    participant PageServerLoad as +page.server.ts
    participant API as APIサーバー

    Note over LayoutLoad,PageServerLoad: 初期ロード時の依存関係登録

    rect rgba(200, 200, 255, 0.1)
        Note over LayoutLoad: depends('app:posts')を登録
        LayoutLoad->>Router: 依存関係登録: 'app:posts'
        LayoutLoad->>API: getPopularPostsFromDB()
        API-->>LayoutLoad: 人気投稿データ
    end

    rect rgba(200, 255, 200, 0.1)
        Note over PageLoad: depends('app:posts')を登録
        PageLoad->>Router: 依存関係登録: 'app:posts'
        PageLoad->>API: fetch('/api/posts')
        Note over PageLoad: '/api/posts'への依存も自動登録
        PageLoad->>Router: 依存関係登録: '/api/posts'（自動）
        API-->>PageLoad: 投稿一覧データ
    end

    rect rgba(255, 200, 200, 0.1)
        Note over PageServerLoad: 複数の依存関係を登録
        PageServerLoad->>Router: 依存関係登録: 'app:posts'
        PageServerLoad->>Router: 依存関係登録: 'user:profile'
        PageServerLoad->>Router: 依存関係登録: 'app:settings'
        PageServerLoad->>API: getComplexData()
        API-->>PageServerLoad: 複合データ
    end

    Note over Component,API: ユーザーアクション後のinvalidate

    Component->>Component: createPost()実行
    Component->>API: POST /api/posts
    API-->>Component: 作成成功

    Component->>Router: invalidate('app:posts')

    Note over Router: 'app:posts'に依存する全Load関数を特定

    par 並列再実行
        Router->>LayoutLoad: 再実行（'app:posts'に依存）
        LayoutLoad->>API: getPopularPostsFromDB()
        API-->>LayoutLoad: 新しい人気投稿

        Router->>PageLoad: 再実行（'app:posts'に依存）
        PageLoad->>API: fetch('/api/posts')
        API-->>PageLoad: 新しい投稿一覧

        Router->>PageServerLoad: 再実行（'app:posts'に依存）
        PageServerLoad->>API: getComplexData()
        API-->>PageServerLoad: 新しい複合データ
    end

    Router-->>Component: 新しいデータで更新
    Component->>Component: UIの自動再レンダリング

    Note over Component: 別のinvalidateパターン

    Component->>Router: invalidate('/api/posts')
    Note over Router: '/api/posts'に依存するLoad関数のみ再実行
    Router->>PageLoad: 再実行（'/api/posts'をfetch）
    Note over LayoutLoad,PageServerLoad: 再実行されない（'/api/posts'未使用）

    Component->>Router: invalidate('user:profile')
    Note over Router: 'user:profile'に依存するLoad関数のみ再実行
    Router->>PageServerLoad: 再実行（'user:profile'に依存）
    Note over LayoutLoad,PageLoad: 再実行されない（'user:profile'未登録）`;

  const dataInvalidationDiagram = `flowchart LR
    subgraph "invalidate()の動作"
        A[invalidate呼び出し] --> B{対象判定}

        B -->|URL| C[特定URLのデータ無効化]
        B -->|depends| D[依存関係の無効化]
        B -->|invalidateAll| E[全データ無効化]

        C --> F[該当Load関数再実行]
        D --> F
        E --> G[全Load関数再実行]

        F --> H[データ更新]
        G --> H

        H --> I[コンポーネント再レンダリング]
    end

    style A fill:#ffebee,color:#000
    style I fill:#e8f5e9,color:#000`;
</script>

SvelteKitのSPAモードとデータ無効化システムについて詳しく解説します。これらの機能により、高度にインタラクティブなアプリケーションと効率的なデータ管理が実現できます。

## CSR/SPAモードのデータフロー

`ssr = false`を設定すると、SvelteKitは完全にクライアントサイドで動作するSPAモードになります。この場合、データフローが根本的に変わり、すべての処理がブラウザ上で実行されます。

<Mermaid diagram={spaNavigationDiagram} />

### SPAモードの設定

```typescript
// +layout.ts または +page.ts
export const ssr = false;    // サーバーサイドレンダリングを無効化
export const csr = true;      // クライアントサイドレンダリングは有効（デフォルト）
export const prerender = false; // プリレンダリングも無効化

// この設定により
// 1. Server Load（+page.server.ts）は実行されない
// 2. Universal Load（+page.ts）はクライアントでのみ実行
// 3. 初回アクセスでも空のHTMLシェルのみ返される
```

### SPAモードの動作フロー

CSR/SPAモードでは、初回アクセスも含めてすべてのデータ取得がクライアントサイドで行われます。サーバーは最小限のHTMLとJavaScriptバンドルを返すだけで、実際のコンテンツはブラウザ上で構築されます。

```typescript
// SPAモードのデータフロー
// 1. ブラウザがページにアクセス
// 2. サーバーから空のHTMLシェル + JSバンドル
// 3. JavaScriptが実行される
// 4. クライアントでLoad関数実行
// 5. APIからデータ取得
// 6. DOMを構築・表示

// +page.ts（クライアントでのみ実行）
export const load: PageLoad = async ({ fetch }) => {
  // このコードはブラウザでのみ実行される
  const response = await fetch('/api/posts');
  const posts = await response.json();

  // Server Loadは存在しないため、dataパラメータは空
  return { posts };
};
```

### 通常モードとSPAモードの比較

| 項目 | 通常モード（SSR有効） | SPAモード（`ssr = false`） |
|------|---------------------|--------------------------|
| **初回表示速度** | 高速（完成したHTML） | 遅い（JS実行後に表示） |
| **SEO** | 優れている | 弱い（コンテンツが空） |
| **Server Load** | 実行される | **実行されない** |
| **Universal Load初回** | サーバーで実行 | クライアントで実行 |
| **データ取得タイミング** | サーバーで事前取得 | クライアントで後から取得 |
| **認証チェック** | サーバーで可能 | クライアントのみ |

### SPAモードが適している場面

```typescript
// 管理画面やダッシュボード（SEO不要、インタラクティブ）
// src/routes/(admin)/+layout.ts
export const ssr = false;
export const prerender = false;

// この設定により
// - 管理画面全体がSPAとして動作
// - 高度なインタラクションが可能
// - しかしSEOは犠牲になる
```

:::warning[SPAモードの注意点]
SPAモードでは以下の制限があります。
- Server Load関数（`+page.server.ts`）は一切実行されない
- 初回表示が遅くなる（JavaScriptのダウンロード・実行を待つ必要）
- SEOに大きな影響（検索エンジンはコンテンツを認識できない）
- 機密情報の扱いに注意（すべてがクライアントコードに含まれる）
:::

## データの無効化と再取得

SvelteKitは、特定のデータのみを無効化して再取得する仕組みを提供しています。これにより、画面全体をリロードすることなく、必要な部分のみを更新できます。

<Mermaid diagram={dataInvalidationDiagram} />

### invalidate()の使い方

`invalidate()`関数を使用すると、特定の条件に一致するLoad関数を再実行できます。これは、データの更新後や定期的なリフレッシュに便利です。

:::info[重要な動作原理]
`invalidate()`を実行すると、
1. 指定したURLまたは識別子に依存するLoad関数が再実行される
2. Load関数が新しいデータを返す
3. **コンポーネントの`$props()`で受け取るデータが自動的に更新される**
4. Svelteのリアクティビティにより、UIが自動的に再レンダリングされる
:::

```typescript
// +page.svelte
<script lang="ts">
  import { invalidate, invalidateAll } from '$app/navigation';
  import type { PageData } from './$types';

  // Load関数から取得したデータを$propsで受け取る
  let { data }: { data: PageData } = $props();
  // data.userが自動的に更新される

  // 特定URLのデータを無効化
  async function refreshUserData() {
    // /api/userをfetchしているすべてのLoad関数が再実行される
    await invalidate('/api/user');
    // この後、data.userは新しい値に自動更新される
    // 手動でdataを更新する必要はない！
  }

  // カスタム識別子による無効化
  async function refreshCustomData() {
    // 'custom:data'に依存するLoad関数のみ再実行
    await invalidate('custom:data');
    // 該当するデータが自動的に更新される
  }

  // 全データを無効化
  async function refreshAll() {
    // ページ内のすべてのLoad関数を再実行
    await invalidateAll();
    // data全体が新しい値で置き換わる
  }
</script>

<!-- UIは自動的に更新される -->
<p>現在のユーザー: {data.user.name}</p>

<!-- 使用例：データ更新ボタン -->
<button onclick={refreshUserData}>
  ユーザー情報を更新
</button>
```

<Mermaid diagram={invalidateFlowDiagram} />

### depends()による依存関係の登録

`depends()`関数を使用して、Load関数にカスタムの依存関係を登録できます。これにより、特定の識別子でのみ無効化される、より細かい制御が可能になります。

:::tip[なぜdepends()が必要？]
- **fetch()を使う場合**: URLへの依存が自動登録される
- **fetch()を使わない場合**: 手動で`depends()`を使って依存関係を登録する必要がある
- **カスタム制御**: 複数のLoad関数を同じタイミングで更新したい場合
:::

:::info[識別子の命名について]
`depends()`に渡す識別子（`'app:posts'`、`'custom:data'`など）は**完全に任意の文字列**です。
- URLである必要はない（ただしURLも使える）
- `app:posts`は単なるラベル（`/api/posts`とは無関係）
- 慣習として`app:`、`custom:`、`data:`などのプレフィックスを使うことが多い
- 重要なのは`invalidate()`で使う文字列と一致すること
- わかりやすい名前を付けることが大切（例：`user:profile`、`cart:items`）
- **1つのLoad関数で複数の識別子を登録可能**（複数回`depends()`を呼べる）
:::

#### 実践的な例：投稿とコメントの連動更新

```typescript
// +layout.ts - サイドバーの人気投稿
export const load: LayoutLoad = async ({ fetch, depends }) => {
  // 任意の識別子で依存関係を登録（URLではない！）
  depends('app:posts');  // "投稿関連のデータ"という意味の任意のラベル

  // データベースから直接取得（fetchを使わない）
  const popularPosts = await getPopularPostsFromDB();

  return { popularPosts };
};
```

```typescript
// +page.ts - メインコンテンツの投稿一覧
export const load: PageLoad = async ({ fetch, depends }) => {
  // 同じ識別子を登録（layout.tsと連動させるため）
  depends('app:posts');  // この文字列はlayout.tsと同じならなんでもOK

  // APIから投稿を取得
  const posts = await fetch('/api/posts').then(r => r.json());
  // fetch()を使うと'/api/posts'への依存も自動登録される
  // つまりこのLoad関数は2つの識別子に依存
  // 1. 'app:posts' (手動登録)
  // 2. '/api/posts' (自動登録)

  return { posts };
};
```

```typescript
// +page.server.ts - 複数の識別子を登録する例
export const load: PageServerLoad = async ({ depends, locals }) => {
  // 複数の識別子を登録可能
  depends('app:posts');      // 投稿更新時に再実行
  depends('user:profile');   // ユーザー情報更新時に再実行
  depends('app:settings');   // 設定変更時に再実行

  // 条件によって追加の識別子を登録
  if (locals.user?.isAdmin) {
    depends('admin:dashboard');  // 管理者なら管理画面更新時も再実行
  }

  // このLoad関数は以下のいずれかで再実行される
  // - invalidate('app:posts')
  // - invalidate('user:profile')
  // - invalidate('app:settings')
  // - invalidate('admin:dashboard') (管理者の場合)
  // - invalidateAll()

  const data = await getComplexData();
  return { data };
};
```

```typescript
// +page.svelte - UIから更新
<script lang="ts">
  import { invalidate } from '$app/navigation';

  async function createPost() {
    // 新しい投稿を作成
    await fetch('/api/posts', {
      method: 'POST',
      body: JSON.stringify(newPost)
    });

    // 任意の識別子'app:posts'に依存するすべてのLoad関数を再実行
    await invalidate('app:posts');
    // → layout.tsとpage.tsの両方が再実行される（両方にdepends('app:posts')があるため）
    // → サイドバーとメインコンテンツが同時に更新される
  }

  async function refreshOnlyAPI() {
    // URL '/api/posts'に依存するLoad関数のみ再実行
    await invalidate('/api/posts');
    // → page.tsのみ再実行される（fetch('/api/posts')を使っているため）
    // → layout.tsは再実行されない（'/api/posts'をfetchしていないため）
  }

  async function refreshOnlyCustom() {
    // もし他の任意の識別子を使った場合
    await invalidate('user:settings');
    // → depends('user:settings')を登録したLoad関数のみ再実行
    // → 'app:posts'とは無関係なので、投稿関連は更新されない
  }
</script>
```

#### 動作の流れ（シーケンス図）

<Mermaid diagram={dependsInvalidateDiagram} />

#### depends()の使い分け

| ケース | 方法 | 再実行される範囲 |
|--------|------|-----------------|
| **fetch()使用** | 自動登録 | そのURLをfetchしているLoad関数のみ |
| **depends('custom:id')** | 手動登録 | 同じ識別子を登録したすべてのLoad関数 |
| **invalidateAll()** | - | ページ内のすべてのLoad関数 |

## まとめ

SvelteKitのSPAモードとデータ無効化システムにより以下が実現できます。

### SPAモードの特徴
- **完全なクライアントサイドレンダリング** - サーバーは最小限のHTMLシェルのみ
- **高度なインタラクティビティ** - フルSPAとしての機能
- **既存APIとの統合** - レガシーシステムとの親和性
- **オフライン対応** - Service Workerとの組み合わせ

### データ無効化の利点
- **細粒度の更新制御** - 必要な部分のみを効率的に更新
- **自動リアクティビティ** - `$props()`と連携した自動UI更新
- **柔軟な依存関係管理** - URLとカスタム識別子の組み合わせ
- **パフォーマンス最適化** - 全画面リロードの回避

これらの機能を適切に活用することで、モダンで高性能なWebアプリケーションを構築できます。

## 次のステップ

- [ストリーミングSSR](../streaming/) - 段階的なコンテンツ配信
- [フォーム処理とActions](../../server/forms/) - データの送信と処理
- [アーキテクチャ詳解](../../architecture/) - システム全体の動作原理