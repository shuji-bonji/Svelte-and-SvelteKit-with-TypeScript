---
title: データフローの詳細
description: SvelteKitのLoad関数実行順序、データの流れ、並列処理の仕組みをTypeScriptで完全理解。SSR/CSR両方のデータフローをMermaidダイアグラムで視覚的に解説
---

<script>
  import Mermaid from '$lib/components/Mermaid.svelte';
  
  
  const ssrDataFlowDiagram = `sequenceDiagram
    participant Browser as ブラウザ
    participant Component as コンポーネント
    participant Server as SvelteKitサーバー
    participant LayoutServer as +layout.server.ts
    participant PageServer as +page.server.ts
    participant Layout as +layout.ts
    participant Page as +page.ts
    
    Browser->>Server: GET /posts/123
    
    rect rgba(255, 152, 0, 0.1)
        Note over Server,PageServer: サーバーサイドでの実行
        
        par 並列実行
            Server->>LayoutServer: load()実行
            Server->>PageServer: load()実行
        end
        
        LayoutServer-->>Server: レイアウトデータ
        PageServer-->>Server: ページデータ
        
        par Universal Load実行
            Server->>Layout: load(サーバーデータ)
            Server->>Page: load(サーバーデータ)
        end
        
        Layout-->>Server: 追加データ
        Page-->>Server: 追加データ
    end
    
    Server->>Server: HTMLレンダリング
    Server-->>Browser: HTML + データ(JSON)
    
    rect rgba(0, 123, 255, 0.1)
        Note over Browser,Component: クライアントサイドでのハイドレーション
        Browser->>Component: データをpropsとして渡す
        Component->>Component: インタラクティブ化
    end`;
    
  const clientNavigationDiagram = `sequenceDiagram
    participant User as ユーザー
    participant Component as コンポーネント
    participant Router as SvelteKitルーター
    participant Cache as キャッシュ
    participant Layout as +layout.ts
    participant Page as +page.ts
    participant API as APIサーバー
    
    User->>Router: リンククリック/goto()
    
    Router->>Cache: キャッシュ確認
    
    alt キャッシュヒット
        Cache-->>Router: キャッシュデータ
    else キャッシュミス
        rect rgba(255, 152, 0, 0.1)
            Note over Router,Page: クライアントサイドでのデータ取得
            
            par 並列実行
                Router->>Layout: load()実行
                Router->>Page: load()実行
            end
            
            par API呼び出し
                Layout->>API: fetch('/api/user')
                Page->>API: fetch('/api/posts/123')
            end
            
            API-->>Layout: ユーザーデータ
            API-->>Page: 記事データ
            
            Layout-->>Router: レイアウトデータ
            Page-->>Router: ページデータ
        end
        
        Router->>Cache: データをキャッシュ
    end
    
    Router->>Component: データ更新
    Component->>Component: 再レンダリング
    Component-->>User: 新しいページ表示`;
    
  const parallelLoadDiagram = `graph TB
    subgraph "Load関数の並列実行"
        direction TB
        Start[ナビゲーション開始]
        
        Start --> Parallel{並列実行}
        
        Parallel --> LayoutServer["+layout.server.ts<br/>load()"]
        Parallel --> PageServer["+page.server.ts<br/>load()"]
        
        LayoutServer --> LayoutData[レイアウトデータ]
        PageServer --> PageData[ページデータ]
        
        LayoutData --> Merge[データマージ]
        PageData --> Merge
        
        Merge --> Universal{Universal Load実行}
        
        Universal --> Layout["+layout.ts<br/>load(data)"]
        Universal --> Page["+page.ts<br/>load(data)"]
        
        Layout --> FinalData[最終データ]
        Page --> FinalData
        
        FinalData --> Render[レンダリング]
    end
    
    style Start fill:#e8f5e9,color:#000
    style Render fill:#e3f2fd,color:#000
    style Parallel fill:#fff3e0,color:#000
    style Universal fill:#fff3e0,color:#000`;
</script>

SvelteKitのデータフローは、サーバーサイドとクライアントサイドで異なる動作をします。このページでは、Load関数の実行順序、データの流れ、並列処理の仕組みを詳しく解説します。

## SSR時のデータフロー

初回アクセスやページリロード時のサーバーサイドレンダリングでは、以下の順序でデータが処理されます。SSRにより、SEOに優れた完全なHTMLがサーバー側で生成され、初回表示が高速化されます。

<Mermaid diagram={ssrDataFlowDiagram} />

### 実行順序の詳細

サーバーサイドレンダリング時のデータ取得は、効率的な並列処理と段階的な実行により最適化されています。

#### 1. リクエスト受信
ブラウザからのHTTPリクエストをSvelteKitサーバーが受信し、URLパラメータやクエリパラメータを解析します。この段階で、どのルートにマッチするかが決定され、対応するLoad関数が特定されます。

#### 2. Server Load関数の並列実行
レイアウトとページのServer Load関数が同時に実行されます。これにより、独立したデータ取得が並列化され、待ち時間が最小限に抑えられます。

```typescript
// +layout.server.ts と +page.server.ts が同時に実行される
// お互いのデータを待つ必要がない
// 例：ユーザー情報と商品情報を並列で取得
export const load: LayoutServerLoad = async () => {
  return { user: await getUser() };  // 非同期だが他を待たない
};

export const load: PageServerLoad = async () => {
  return { products: await getProducts() };  // 上記と同時実行
};
```

#### 3. Universal Load関数の実行
Server Loadの完了後、そのデータを引き継いでUniversal Load関数が実行されます。ここで追加のデータ取得や、Server Loadのデータの加工が可能です。

```typescript
// Server Loadのデータを受け取って実行
export const load: PageLoad = async ({ data, fetch }) => {
  // data: Server Loadからのデータ
  // fetch: SSR対応のfetch関数（Cookie等を自動で引き継ぐ）
  const additional = await fetch('/api/extra');
  return {
    ...data,  // Server Loadのデータを展開
    additional: await additional.json()  // 追加データ
  };
};
```

#### 4. HTMLレンダリングとハイドレーション
すべてのLoad関数が完了すると、サーバーで完全なHTMLが生成されます。データはJSONとしてHTMLに埋め込まれ、クライアントサイドでハイドレーションされることで、インタラクティブなアプリケーションになります。

## クライアントサイドナビゲーション

一度SvelteKitアプリケーションが起動した後のページ遷移では、SPA的なクライアントサイドナビゲーションが行われます。これにより、ページ全体のリロードなしに高速な画面遷移が実現されます。

<Mermaid diagram={clientNavigationDiagram} />

### キャッシュとプリフェッチ

SvelteKitは自動的にデータをキャッシュし、ユーザーがリンクにホバーした時点でデータの先読みを行うことができます。これにより、実際のクリック時には瞬時にページが表示されます。

```svelte
<!-- プリフェッチ戦略の設定 -->
<!-- hover: マウスオーバー時に先読み（デフォルト） -->
<a href="/posts/123" data-sveltekit-preload-data="hover">
  記事を読む
</a>

<!-- tap: タッチ/クリック時に先読み（モバイル向け） -->
<a href="/posts/456" data-sveltekit-preload-data="tap">
  重い記事を読む
</a>

<!-- off: プリフェッチを無効化 -->
<a href="/large-page" data-sveltekit-preload-data="off">
  大きなページへ
</a>
```

プログラマティックにプリフェッチを制御することも可能です。

```typescript
import { prefetch, prefetchRoutes } from '$app/navigation';

// 単一ページのプリフェッチ
await prefetch('/posts/123');

// 複数ページの一括プリフェッチ
await prefetchRoutes(['/about', '/contact', '/products']);
```

### データの差分更新

特定のデータのみを無効化して再取得することで、必要最小限の更新で画面を最新化できます。これにより、パフォーマンスを維持しながらリアルタイムな情報更新が可能になります。

```typescript
// 特定のデータのみ無効化
import { invalidate } from '$app/navigation';

// URLベースの無効化 - このURLに依存するLoad関数が再実行される
await invalidate('/api/user');
// 例：/api/userをfetchしているすべてのLoad関数が再実行

// カスタム識別子による無効化
await invalidate('app:user');
// depends('app:user')を宣言したLoad関数のみ再実行

// 全データの無効化 - すべてのLoad関数を再実行
import { invalidateAll } from '$app/navigation';
await invalidateAll();
// 画面全体のデータをリフレッシュ
```


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

## 並列データ取得の仕組み

SvelteKitは、レイアウトとページのLoad関数を可能な限り並列実行することで、データ取得のパフォーマンスを最大化します。これにより、待ち時間を最小限に抑え、高速なページ表示を実現します。

<Mermaid diagram={parallelLoadDiagram} />

### 並列実行の実装例

複数のAPIからデータを取得する場合、`Promise.all`を使用することで並列処理が可能です。これにより、最も遅いAPIのレスポンス時間がボトルネックとなりますが、順次実行と比較して大幅な高速化が期待できます。

```typescript
// +page.server.ts - 並列でデータ取得
export const load: PageServerLoad = async ({ fetch }) => {
  // Promise.allで3つのAPIを同時に呼び出す
  const [posts, categories, tags] = await Promise.all([
    fetch('/api/posts').then(r => r.json()),
    fetch('/api/categories').then(r => r.json()),
    fetch('/api/tags').then(r => r.json())
  ]);
  
  // 例：各APIが1秒かかる場合
  // 順次実行: 3秒
  // 並列実行: 1秒（3倍高速）
  
  return { posts, categories, tags };
};
```

### ウォーターフォールの回避

データ取得が連鎖的に依存する場合でも、工夫により並列化を最大化できます。ウォーターフォール（順次実行）を避けることで、大幅なパフォーマンス改善が可能です。

```typescript
// ❌ 悪い例：順次実行（ウォーターフォール）
export const load: PageServerLoad = async ({ fetch }) => {
  // 1. ユーザー取得（1秒）
  const user = await fetch('/api/user').then(r => r.json());
  // 2. 投稿取得（1秒）- ユーザー取得を待つ
  const posts = await fetch(`/api/users/${user.id}/posts`).then(r => r.json());
  // 3. コメント取得（1秒）- 投稿取得を待つ
  const comments = await fetch(`/api/users/${user.id}/comments`).then(r => r.json());
  
  // 合計: 3秒かかる
  return { user, posts, comments };
};

// ✅ 良い例：並列実行の最大化
export const load: PageServerLoad = async ({ fetch }) => {
  // 1. ユーザー取得を開始（Promiseを保持）
  const userPromise = fetch('/api/user').then(r => r.json());
  
  // 2. ユーザー情報を取得（ここで初めてawait）
  const user = await userPromise;
  
  // 3. 依存するデータを並列取得
  const [posts, comments] = await Promise.all([
    fetch(`/api/users/${user.id}/posts`).then(r => r.json()),
    fetch(`/api/users/${user.id}/comments`).then(r => r.json())
  ]);
  
  // 合計: 2秒（ユーザー取得1秒 + 並列取得1秒）
  return { user, posts, comments };
};
```

## データの無効化と再取得

SvelteKitでは、`invalidate()`と`depends()`を使用してLoad関数を選択的に再実行できます。これにより、ページ全体をリロードすることなく、必要なデータのみを効率的に更新できます。

:::info[詳細な解説]
データ無効化の詳細な仕組み、`depends()`と`invalidate()`の使い方、SPAモードでの動作については、[SPAモードとデータ無効化](../spa-invalidation/)の専用ページで包括的に解説しています。
:::

## ストリーミングSSR

ストリーミングSSRを使用すると、重要なコンテンツを即座に表示しながら、時間のかかるデータを後から段階的に送信できます。

:::info[詳細な実装方法]
ストリーミングSSRの仕組み、実装パターン、最適化手法、エラーハンドリングについては、[ストリーミングSSR](../streaming/)の専用ページで包括的に解説しています。
:::

## パフォーマンス最適化のベストプラクティス

### 1. 並列実行を最大化

```typescript
// レイアウトとページで独立したデータは並列取得
// +layout.server.ts
export const load = async () => {
  return { user: await getUser() };
};

// +page.server.ts（レイアウトのデータを待たない）
export const load = async () => {
  return { posts: await getPosts() };
};
```

### 2. 適切なLoad関数の選択

| Load関数 | 使用場面 |
|---------|---------|
| `+page.server.ts` | 機密データ、DBアクセス、APIキー使用 |
| `+page.ts` | 公開API、クライアントサイド処理 |
| `+layout.server.ts` | 共通の認証情報、セッション |
| `+layout.ts` | 共通のUI状態、設定 |

### 3. キャッシュ戦略

```typescript
// HTTPキャッシュヘッダーの設定
export const load: PageServerLoad = async ({ setHeaders }) => {
  setHeaders({
    'cache-control': 'max-age=3600' // 1時間キャッシュ
  });
  
  return { data: await fetchData() };
};
```

## CSR/SPAモードでのデータフロー

CSR/SPAモードでのデータフローとデータ無効化の詳細については、[SPAモードとデータ無効化](../spa-invalidation/)の専用ページで解説しています。


## まとめ

SvelteKitのデータフローは以下の特徴を持ちます。

- **並列実行**: Load関数は可能な限り並列実行される
- **型安全**: TypeScriptによる完全な型推論
- **柔軟な無効化**: 細かい粒度でのデータ更新制御
- **ストリーミング対応**: 大量データの段階的配信
- **レンダリングモードの選択**: SSRとCSR/SPAを柔軟に切り替え可能

これらの仕組みを理解することで、高速でユーザー体験の良いアプリケーションを構築できます。

## 次のステップ

- [データフェッチング戦略](../strategies/) - より高度な最適化技術
- [SPAモードとデータ無効化](../spa-invalidation/) - SPAモードの詳細とデータ更新
- [ストリーミングSSR](../streaming/) - 段階的なコンテンツ配信