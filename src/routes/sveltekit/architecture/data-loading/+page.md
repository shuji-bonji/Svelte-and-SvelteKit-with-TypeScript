---
title: データロードアーキテクチャ
description: SvelteKitのLoad関数の内部実装とデータ処理メカニズムをTypeScriptで詳解。Request/Responseサイクル、キャッシュ層、ミドルウェア統合の仕組みを理解
---

<script>
  import Mermaid from '$lib/components/Mermaid.svelte';
  
  // Load関数の内部処理フロー
  const internalFlowDiagram = `flowchart LR
    subgraph "リクエスト処理パイプライン"
        A[HTTPリクエスト] --> B[ルートマッチング]
        B --> C{Hooks実行}
        C --> D[handle関数]
        D --> E[Load関数の決定]
        
        E --> F{Server Load?}
        F -->|Yes| G[Server Load実行]
        F -->|No| H[Universal Load実行]
        
        G --> I[データマージ]
        H --> I
        
        I --> J[レスポンス生成]
        J --> K[HTTPレスポンス]
    end
    
    style A fill:#e8f5e9,color:#000
    style K fill:#e3f2fd,color:#000
    style C fill:#fff3e0,color:#000
    style F fill:#fff3e0,color:#000`;
    
  // キャッシュメカニズム
  const cacheMechanismDiagram = `sequenceDiagram
    participant Client as クライアント
    participant Router as ルーター
    participant Cache as キャッシュ層
    participant Loader as Load関数
    participant API as APIサーバー
    
    Client->>Router: ナビゲーション要求
    Router->>Cache: キャッシュ確認
    
    alt キャッシュヒット（有効期限内）
        Cache-->>Router: キャッシュデータ
        Router-->>Client: 即座にレンダリング
    else キャッシュミス/期限切れ
        Router->>Loader: Load関数実行
        
        rect rgba(255, 152, 0, 0.1)
            Note over Loader,API: 依存関係の追跡開始
            Loader->>API: fetch('/api/data')
            API-->>Loader: レスポンス
            Loader->>Cache: depends登録
        end
        
        Loader-->>Router: 新しいデータ
        Router->>Cache: キャッシュ更新
        Router-->>Client: レンダリング
    end
    
    Note over Client,Cache: invalidate()呼び出し時
    Client->>Router: invalidate('/api/data')
    Router->>Cache: 該当エントリ無効化
    Router->>Loader: 再実行トリガー`;
    
  // Request/Responseオブジェクトのライフサイクル
  const requestLifecycleDiagram = `flowchart TB
    subgraph "Request生成"
        direction TB
        A[ブラウザ/サーバー] --> B[Request作成]
        B --> C[Headers設定]
        C --> D[Cookies追加]
    end
    
    subgraph "Load関数内"
        direction TB
        D --> E[RequestEvent生成]
        E --> F[fetch関数拡張]
        F --> G[platform情報追加]
        G --> H[locals設定]
    end
    
    subgraph "Response処理"
        direction TB
        H --> I[データ取得]
        I --> J[setHeaders]
        J --> K[Response生成]
        K --> L[クライアント送信]
    end
    
    style A fill:#e8f5e9,color:#000
    style L fill:#e3f2fd,color:#000`;
    
  // ミドルウェア統合
  const middlewareIntegrationDiagram = `sequenceDiagram
    participant Request as HTTPリクエスト
    participant Server as SvelteKitサーバー
    participant Handle as handle Hook
    participant Sequence as sequence関数
    participant Auth as 認証ミドルウェア
    participant Logger as ロガーミドルウェア
    participant Load as Load関数
    
    Request->>Server: リクエスト受信
    Server->>Handle: handle実行開始
    
    Handle->>Sequence: sequence(...middlewares)
    
    rect rgba(100, 180, 255, 0.2)
        Note over Sequence,Logger: ミドルウェアチェーン
        Sequence->>Logger: ロギング開始
        Logger->>Auth: 認証チェック
        
        alt 認証成功
            Auth->>Auth: locals.user設定
            Auth->>Load: resolve(event)
        else 認証失敗
            Auth-->>Request: 401/リダイレクト
        end
    end
    
    Load->>Load: localsからユーザー情報取得
    Load-->>Server: データ返却
    Server-->>Request: レスポンス`;
    
  // 並列処理の最適化
  const parallelOptimizationDiagram = `sequenceDiagram
    participant Client as クライアント
    participant Server as サーバー
    participant LayoutServer as +layout.server.ts
    participant PageServer as +page.server.ts
    participant Layout as +layout.ts
    participant Page as +page.ts
    participant DB as データベース
    participant API as 外部API
    
    Client->>Server: /posts/123 リクエスト
    
    rect rgba(255, 200, 100, 0.2)
        Note over Server,PageServer: Server Load並列実行（待ち時間なし）
        par Layout Server Load
            Server->>LayoutServer: load()実行
            LayoutServer->>DB: ユーザー情報取得
            DB-->>LayoutServer: ユーザーデータ
            LayoutServer-->>Server: { user }
        and Page Server Load
            Server->>PageServer: load()実行
            PageServer->>DB: 記事データ取得
            DB-->>PageServer: 記事データ
            PageServer-->>Server: { post }
        end
    end
    
    Note over Server: データマージ { user, post }
    
    rect rgba(100, 200, 255, 0.2)
        Note over Server,Page: Universal Load並列実行（Server Loadのデータを使用）
        par Layout Universal Load
            Server->>Layout: load({ data: serverData })
            Layout->>API: 追加データ取得
            API-->>Layout: メタデータ
            Layout-->>Server: { metadata }
        and Page Universal Load
            Server->>Page: load({ data: serverData })
            Page->>API: コメント取得
            API-->>Page: コメントデータ
            Page-->>Server: { comments }
        end
    end
    
    Server->>Server: 最終データ統合
    Server-->>Client: HTML + データ`;
    
  // ウォーターフォール vs 並列処理
  const waterfallVsParallelDiagram = `sequenceDiagram
    participant Load as Load関数
    participant API1 as API 1
    participant API2 as API 2
    participant API3 as API 3
    
    rect rgba(255, 100, 100, 0.1)
        Note over Load,API3: ❌ ウォーターフォール（順次実行）- 3秒
        Load->>API1: fetch('/api/user')
        Note right of API1: 1秒待機
        API1-->>Load: ユーザーデータ
        Load->>API2: fetch('/api/posts')
        Note right of API2: 1秒待機
        API2-->>Load: 投稿データ
        Load->>API3: fetch('/api/comments')
        Note right of API3: 1秒待機
        API3-->>Load: コメントデータ
    end
    
    rect rgba(100, 255, 100, 0.1)
        Note over Load,API3: ✅ 並列処理（Promise.all）- 1秒
        par 並列実行
            Load->>API1: fetch('/api/user')
        and
            Load->>API2: fetch('/api/posts')
        and
            Load->>API3: fetch('/api/comments')
        end
        Note right of API3: 最大1秒で完了
        API1-->>Load: ユーザーデータ
        API2-->>Load: 投稿データ
        API3-->>Load: コメントデータ
    end`;
    
  // ストリーミングSSRのフロー
  const streamingSSRDiagram = `sequenceDiagram
    participant Browser as ブラウザ
    participant Server as SvelteKitサーバー
    participant Load as Load関数
    participant DB as データベース
    participant API as 外部API
    
    Browser->>Server: /products/123 リクエスト
    
    rect rgba(100, 255, 100, 0.2)
        Note over Server,DB: 重要データ（即座に表示）
        Server->>Load: load()実行開始
        Load->>DB: 商品基本情報取得
        DB-->>Load: { title, price, image }
        Load-->>Server: 即座に返却
    end
    
    Server->>Browser: 初期HTML送信開始
    Note over Browser: ヘッダー・商品情報を即座に表示
    
    rect rgba(255, 200, 100, 0.2)
        Note over Server,API: ストリーミングデータ（Promise）
        par 並列で非同期データ取得
            Load->>API: レビュー取得（Promise）
            Note right of API: 2秒かかる
        and
            Load->>API: 関連商品取得（Promise）
            Note right of API: 1.5秒かかる
        and
            Load->>DB: 在庫情報取得（Promise）
            Note right of DB: 0.5秒かかる
        end
    end
    
    DB-->>Server: 在庫データ到着（0.5秒後）
    Server->>Browser: [script]在庫情報更新[/script]
    Note over Browser: 在庫情報が表示される
    
    API-->>Server: 関連商品到着（1.5秒後）
    Server->>Browser: [script]関連商品更新[/script]
    Note over Browser: 関連商品が表示される
    
    API-->>Server: レビュー到着（2秒後）
    Server->>Browser: [script]レビュー更新[/script]
    Note over Browser: レビューが表示される
    
    Server->>Browser: [body/html完了]
    Note over Browser: ページ完成`;
    
  // ストリーミング vs 通常のSSR
  const streamingComparisonDiagram = `sequenceDiagram
    participant Browser as ブラウザ
    participant Server as サーバー
    participant API as 遅いAPI
    
    rect rgba(255, 100, 100, 0.1)
        Note over Browser,API: ❌ 通常のSSR（すべて待つ）
        Browser->>Server: リクエスト
        Server->>API: すべてのデータ取得
        Note right of API: 3秒待機...
        API-->>Server: 全データ
        Server->>Server: HTML生成
        Server-->>Browser: 完全なHTML（3秒後）
        Note over Browser: 3秒後に全て表示
    end
    
    rect rgba(100, 255, 100, 0.1)
        Note over Browser,API: ✅ ストリーミングSSR（段階的送信）
        Browser->>Server: リクエスト
        Server->>API: 重要データのみ取得
        API-->>Server: 基本データ（0.1秒）
        Server-->>Browser: 初期HTML（0.1秒後）
        Note over Browser: 重要部分を即座に表示
        Server->>API: 追加データ取得（Promise）
        Note over Server: HTMLストリーミング継続
        API-->>Server: 追加データ到着
        Server-->>Browser: [script]更新[/script]
        Note over Browser: 段階的に内容が充実
    end`;
</script>

SvelteKitのデータロードシステムは、高度に最適化された内部メカニズムによって動作しています。このページでは、Load関数がどのように実装され、データがどのように処理されるかを内部実装の観点から詳しく解説します。

## Load関数の内部処理フロー

SvelteKitがLoad関数を実行する際の内部処理の流れを理解することで、パフォーマンス最適化やデバッグが容易になります。

<Mermaid diagram={internalFlowDiagram} />

### RequestEventオブジェクトの構造

Load関数に渡される`event`オブジェクトは、リクエストに関するすべての情報を含む重要なオブジェクトです。このオブジェクトはSvelteKitが自動的に生成し、Load関数やHooksに渡されます。


```typescript
// SvelteKit内部でのRequestEvent生成（簡略化）
// このインターフェースは、Load関数が受け取るeventパラメータの型定義です
interface RequestEvent {
  // コアプロパティ
  request: Request;           // 標準のWeb Request API
  url: URL;                  // パースされたURL
  params: Record<string, string>;  // ルートパラメータ
  route: RouteDefinition;    // マッチしたルート情報
  
  // 拡張プロパティ
  locals: App.Locals;        // サーバー間で共有されるデータ
  platform?: App.Platform;  // プラットフォーム固有の情報
  
  // メソッド
  fetch: typeof fetch;       // 拡張されたfetch関数
  setHeaders: (headers: Record<string, string>) => void;
  cookies: Cookies;          // Cookie操作API
  
  // 内部使用
  depends: (...deps: string[]) => void;  // 依存関係の登録
  parent: () => Promise<Record<string, any>>;  // 親のデータ取得
}

// 実際の内部実装（概念的な例）
// SvelteKitが内部でRequestEventを生成する際の処理を簡略化したものです
// 実際のコードはより複雑ですが、基本的な仕組みは以下のようになっています
class RequestEventImpl implements RequestEvent {
  private _dependencies = new Set<string>();
  private _headers: Headers = new Headers();
  
  constructor(
    private _request: Request,
    private _route: RouteDefinition,
    private _params: Record<string, string>
  ) {
    this.url = new URL(_request.url);
    this.fetch = this.createEnhancedFetch();
  }
  
  // fetch関数の拡張実装
  private createEnhancedFetch(): typeof fetch {
    return async (input: RequestInfo, init?: RequestInit) => {
      // URLを依存関係として自動登録
      const url = typeof input === 'string' ? input : input.url;
      this._dependencies.add(url);
      
      // Cookieの自動転送
      const headers = new Headers(init?.headers);
      headers.set('cookie', this._request.headers.get('cookie') || '');
      
      // 実際のfetch実行
      const response = await fetch(input, {
        ...init,
        headers
      });
      
      return response;
    };
  }
  
  depends(...deps: string[]) {
    deps.forEach(dep => this._dependencies.add(dep));
  }
  
  setHeaders(headers: Record<string, string>) {
    Object.entries(headers).forEach(([key, value]) => {
      this._headers.set(key, value);
    });
  }
}
```

#### プロパティ一覧

| プロパティ | 型 | 説明 | 実行環境 |
|-----------|-----|------|---------|
| `request` | `Request` | 標準のWeb Request APIオブジェクト。HTTPリクエストの詳細情報を含む | 両方 |
| `url` | `URL` | パース済みのURLオブジェクト。クエリパラメータやパス情報に簡単にアクセス可能 | 両方 |
| `params` | `Record<string, string>` | 動的ルートパラメータ。例：`/posts/[id]`の`id`部分 | 両方 |
| `route` | `RouteDefinition` | マッチしたルートの定義情報。ルートIDやパターンを含む | 両方 |
| `locals` | `App.Locals` | リクエスト間で共有されるデータ。主にHooksで設定される（例：ユーザー情報） | 両方 |
| `platform` | `App.Platform \| undefined` | プラットフォーム固有の情報（Cloudflare Workers、Vercel等） | サーバー |
| `cookies` | `Cookies` | Cookie操作用のユーティリティオブジェクト | 両方 |
| `isDataRequest` | `boolean` | クライアントサイドナビゲーションによるデータリクエストかどうか | 両方 |
| `isSubRequest` | `boolean` | サブリクエスト（内部的なAPI呼び出し等）かどうか | サーバー |

#### メソッド一覧

| メソッド | 型 | 説明 | 実行環境 | 使用例 |
|---------|-----|------|---------|--------|
| `fetch` | `typeof fetch` | 拡張されたfetch関数。Cookie転送と依存関係追跡を自動化 | 両方 | `await event.fetch('/api/data')` |
| `depends` | `(...deps: string[]) => void` | カスタム依存関係を登録。invalidate()での無効化対象を設定 | 両方 | `event.depends('custom:data')` |
| `parent` | `() => Promise<Record<string, any>>` | 親レイアウトのLoad関数の結果を取得 | 両方 | `const parent = await event.parent()` |
| `setHeaders` | `(headers: Record<string, string>) => void` | レスポンスヘッダーを設定（キャッシュ制御等） | サーバー | `event.setHeaders({ 'cache-control': 'max-age=3600' })` |
| `getClientAddress` | `() => string` | クライアントのIPアドレスを取得 | サーバー | `const ip = event.getClientAddress()` |

#### cookies オブジェクトのメソッド

| メソッド | 説明 | 使用例 |
|---------|------|--------|
| `get(name)` | Cookieの値を取得 | `event.cookies.get('session')` |
| `getAll()` | すべてのCookieを取得 | `event.cookies.getAll()` |
| `set(name, value, options)` | Cookieを設定 | `event.cookies.set('theme', 'dark', { path: '/', httpOnly: true })` |
| `delete(name, options)` | Cookieを削除 | `event.cookies.delete('session', { path: '/' })` |
| `serialize(name, value, options)` | Cookie文字列を生成 | `event.cookies.serialize('auth', token, { secure: true })` |

### 実際の使用例

```typescript
// +page.server.ts でのRequestEvent活用例
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
  // 1. URLパラメータとクエリパラメータの取得
  const postId = event.params.id;  // /posts/[id] の id部分
  const page = event.url.searchParams.get('page') || '1';
  
  // 2. 認証情報の確認（Hooksでセットされたlocals）
  const user = event.locals.user;
  if (!user) {
    // 3. レスポンスヘッダーの設定（キャッシュなし）
    event.setHeaders({
      'cache-control': 'no-store'
    });
    return { authenticated: false };
  }
  
  // 4. Cookie の読み取り
  const theme = event.cookies.get('theme') || 'light';
  
  // 5. 拡張fetch関数でAPIコール（Cookie自動転送）
  const response = await event.fetch(`/api/posts/${postId}?page=${page}`);
  const post = await response.json();
  
  // 6. カスタム依存関係の登録
  event.depends(`post:${postId}`);
  
  // 7. キャッシュ制御ヘッダーの設定
  event.setHeaders({
    'cache-control': 'public, max-age=3600'  // 1時間キャッシュ
  });
  
  return {
    post,
    theme,
    user: { name: user.name, id: user.id }
  };
};

// +page.ts でのクライアントサイド処理
import type { PageLoad } from './$types';

export const load: PageLoad = async (event) => {
  // 8. 親レイアウトのデータ取得
  const parentData = await event.parent();
  console.log('Layout data:', parentData);
  
  // 9. データリクエストかどうかの判定
  if (event.isDataRequest) {
    // クライアントサイドナビゲーションの場合
    console.log('Client-side navigation detected');
  }
  
  // 10. 追加のAPIコール
  const comments = await event.fetch(`/api/posts/${event.params.id}/comments`);
  
  return {
    comments: await comments.json(),
    layoutTheme: parentData.theme  // 親から継承
  };
};
```

## キャッシュメカニズムの詳細

SvelteKitの内部キャッシュは、**クライアントサイド（ブラウザ）**で効率的なデータ管理を実現する重要な仕組みです。このキャッシュはクライアントサイドルーターによって管理され、ページ間のナビゲーション時にデータの再利用を可能にします。

:::info[実行環境について]
ここで説明するキャッシュメカニズムは**クライアントサイドのみ**で動作します。
- **クライアント**: ナビゲーション時にLoad関数の結果をメモリにキャッシュし、`invalidate()`まで再利用
- **サーバー**: SSR時は毎回新規にLoad関数を実行（キャッシュなし・ステートレス）

サーバーサイドでキャッシュが必要な場合は、RedisやMemcachedなどの外部キャッシュを別途実装する必要があります。
:::

<Mermaid diagram={cacheMechanismDiagram} />

### キャッシュ層の実装（クライアントサイド）

クライアントサイドルーターは、Load関数の結果をブラウザのメモリ上にキャッシュし、invalidate()による無効化まで再利用します。以下は、その仕組みの概念的な実装です。

```typescript
// クライアントサイドでのキャッシュ管理（概念的な実装）
// このコードはブラウザ上で動作し、ページナビゲーション時の
// Load関数の結果をメモリに保持して再利用します
interface CacheEntry {
  data: any;
  timestamp: number;
  dependencies: Set<string>;
  ttl?: number;  // Time To Live
}

class LoadFunctionCache {
  private cache = new Map<string, CacheEntry>();
  private dependencies = new Map<string, Set<string>>();
  
  // キャッシュエントリの保存
  set(key: string, data: any, deps: Set<string>, ttl?: number) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      dependencies: deps,
      ttl
    });
    
    // 逆引き用の依存関係マップを更新
    deps.forEach(dep => {
      if (!this.dependencies.has(dep)) {
        this.dependencies.set(dep, new Set());
      }
      this.dependencies.get(dep)!.add(key);
    });
  }
  
  // キャッシュの取得
  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    // TTLチェック
    if (entry.ttl && Date.now() - entry.timestamp > entry.ttl) {
      this.delete(key);
      return null;
    }
    
    return entry.data;
  }
  
  // 依存関係に基づく無効化
  invalidate(dependency: string) {
    const affected = this.dependencies.get(dependency);
    if (!affected) return;
    
    // 影響を受けるすべてのキャッシュエントリを削除
    affected.forEach(key => {
      this.delete(key);
    });
    
    // 依存関係マップからも削除
    this.dependencies.delete(dependency);
  }
  
  // キャッシュエントリの削除
  private delete(key: string) {
    const entry = this.cache.get(key);
    if (!entry) return;
    
    // 依存関係マップから削除
    entry.dependencies.forEach(dep => {
      const keys = this.dependencies.get(dep);
      if (keys) {
        keys.delete(key);
        if (keys.size === 0) {
          this.dependencies.delete(dep);
        }
      }
    });
    
    this.cache.delete(key);
  }
  
  // 全キャッシュクリア
  clear() {
    this.cache.clear();
    this.dependencies.clear();
  }
}
```

### invalidate()の内部動作（クライアントサイド）

invalidate()関数は、**クライアントサイド**で特定のURLやカスタム識別子に依存するキャッシュを無効化し、関連するLoad関数を再実行します。これはブラウザ上でのみ動作し、サーバーサイドのデータには影響しません。

```typescript
// クライアントサイドでのinvalidate関数の内部実装
// この関数は$app/navigationからエクスポートされ、
// ブラウザ上でキャッシュを手動で無効化する際に使用します
async function invalidate(href: string | ((href: URL) => boolean)) {
  const cache = getLoadFunctionCache();
  
  if (typeof href === 'string') {
    // 文字列の場合は直接無効化
    cache.invalidate(href);
  } else {
    // 関数の場合はすべてのキャッシュエントリをチェック
    cache.forEach((entry, key) => {
      try {
        const url = new URL(key, location.origin);
        if (href(url)) {
          cache.invalidate(key);
        }
      } catch {
        // URLパースエラーは無視
      }
    });
  }
  
  // 影響を受けるLoad関数を再実行
  await rerunAffectedLoadFunctions();
}
```

## Request/Responseライフサイクル

リクエストからレスポンスまでの完全なライフサイクルを理解することで、データの流れを完全に制御できます。

<Mermaid diagram={requestLifecycleDiagram} />

### 内部的なfetch関数の拡張

Load関数内で使用できる`fetch`関数は、標準のFetch APIを拡張したもので、Cookie転送、依存関係追跡、内部API最適化などの機能が追加されています。

#### fetch関数の取得方法と使い分け

| 取得方法 | 使用場所 | 構文 | 特徴 |
|---------|---------|------|------|
| **引数から取得** | Load関数 | `async ({ fetch }) => ...` | Cookie自動転送、依存関係追跡、SSR最適化 |
| **eventから取得** | Load関数 | `async (event) => event.fetch(...)` | 上記と同じ（別の書き方） |
| **引数から取得** | Hooks | `async ({ event }) => event.fetch(...)` | リクエスト処理のカスタマイズ |
| **引数から取得** | Form Actions | `async ({ fetch }) => ...` | フォーム送信時のAPI呼び出し |
| **グローバル** | コンポーネント/その他 | `fetch(...)` | 標準のFetch API（インポート不要） |

:::tip[使い分けのポイント]
- **Load関数内では必ず引数の`fetch`を使用**：Cookie転送や依存関係追跡が自動化される
- **コンポーネント内ではグローバル`fetch`でOK**：クライアントサイドのみの処理
- **インポートは不要**：Node.js 18+およびモダンブラウザでは標準で利用可能
:::

```typescript
// SvelteKitが提供する拡張fetch関数の実装
// この関数はLoad関数のevent.fetchとして提供され、
// 通常のfetchにSvelteKit固有の機能を追加しています
function createEnhancedFetch(event: RequestEvent): typeof fetch {
  return async function fetch(
    input: RequestInfo | URL,
    init?: RequestInit
  ): Promise<Response> {
    const url = typeof input === 'string' 
      ? new URL(input, event.url)
      : input instanceof URL 
        ? input 
        : new URL(input.url, event.url);
    
    // 内部APIへのリクエストの場合
    if (url.origin === event.url.origin && url.pathname.startsWith('/api/')) {
      // サーバーサイドでは直接ハンドラを呼び出し
      if (typeof window === 'undefined') {
        const handler = await resolveAPIHandler(url.pathname);
        if (handler) {
          // RequestEventを構築して直接実行
          const apiEvent = createAPIEvent(url, init, event);
          return await handler(apiEvent);
        }
      }
    }
    
    // Cookie転送の自動化
    const headers = new Headers(init?.headers);
    if (!headers.has('cookie') && event.request.headers.has('cookie')) {
      headers.set('cookie', event.request.headers.get('cookie')!);
    }
    
    // 依存関係の自動追跡
    event.depends(url.href);
    
    // 実際のfetch実行
    const response = await globalThis.fetch(input, {
      ...init,
      headers,
      // SSR時はcredentialsを自動設定
      credentials: init?.credentials ?? 'same-origin'
    });
    
    return response;
  };
}
```

## ミドルウェア統合アーキテクチャ

Hooks（handle、handleFetch、handleError）を通じたミドルウェア統合の内部実装を理解します。

<Mermaid diagram={middlewareIntegrationDiagram} />

### Hooksとの統合実装

Hooksは、**リクエストをインターセプト**してリクエスト処理のライフサイクルに介入し、認証、ロギング、エラーハンドリングなどのミドルウェア処理を実装できます。

:::info[Hooksの基本概念]
Hooksは以下のタイミングでリクエスト/レスポンスをインターセプトします。
- **handle**: すべてのリクエスト → Load関数実行 → レスポンス
- **handleFetch**: Load関数内のfetch呼び出し時
- **handleError**: エラー発生時

処理の流れ：`リクエスト → [Hooks処理] → Load関数 → [Hooks処理] → レスポンス`
:::

```typescript
// hooks.server.tsの内部処理
// handleフックで使用可能なオプションの型定義
interface ResolveOptions {
  transformPageChunk?: (input: { html: string; done: boolean }) => string;
  filterSerializedResponseHeaders?: (name: string) => boolean;
  preload?: (input: { type: 'font' | 'css' | 'js'; path: string }) => boolean;
}

// sequence関数の内部実装
// 複数のミドルウェアを連鎖的に実行するためのヘルパー関数
// hooks.server.tsでミドルウェアを組み合わせる際に使用します
export function sequence(...handlers: Handle[]): Handle {
  const combined: Handle = handlers.reduce(
    (prev, next) => {
      return async (input, opts) => {
        // 前のハンドラを実行し、その中で次のハンドラを呼び出す
        return prev(input, async (event) => {
          // 次のハンドラに制御を渡す
          return next(
            { ...input, event }, 
            opts
          );
        });
      };
    },
    // 初期ハンドラ（最後に実行される）
    (({ event }, resolve) => resolve(event)) as Handle
  );
  
  return combined;
}

// Load関数実行前のミドルウェア処理
// Hooksで設定されたミドルウェアを通過してからLoad関数が実行される仕組み
async function executeMiddlewareChain(
  event: RequestEvent,
  loadFunctions: LoadFunction[]
): Promise<any> {
  // handle hookを通過
  const transformedEvent = await runHandleHook(event);
  
  // localsに格納されたデータはLoad関数で利用可能
  const results = await Promise.all(
    loadFunctions.map(load => {
      // 各Load関数にtransformedEventを渡す
      return load(transformedEvent);
    })
  );
  
  return mergeLoadResults(results);
}
```

## 並列処理の最適化

### Load関数の並列実行フロー

SvelteKitは、レイアウトとページのLoad関数を効率的に並列実行し、待ち時間を最小化します。

<Mermaid diagram={parallelOptimizationDiagram} />

### ウォーターフォール問題と解決策

順次実行（ウォーターフォール）と並列処理の違いを理解することで、パフォーマンスを大幅に改善できます。

<Mermaid diagram={waterfallVsParallelDiagram} />

### Load関数の並列実行メカニズム

以下は、SvelteKitが内部的にLoad関数を並列実行する仕組みの概念的な実装です。

```typescript
// 内部的な並列実行の実装
// Layout ServerLoad、Page ServerLoad、Layout Load、Page Loadを
// 最適な順序で並列実行するためのエグゼキューター
class LoadFunctionExecutor {
  private runningLoads = new Map<string, Promise<any>>();
  
  async executeLoads(
    route: RouteDefinition,
    event: RequestEvent
  ): Promise<Record<string, any>> {
    const loads = this.collectLoadFunctions(route);
    const results: Record<string, any> = {};
    
    // Server LoadとUniversal Loadを分離
    const serverLoads = loads.filter(l => l.type === 'server');
    const universalLoads = loads.filter(l => l.type === 'universal');
    
    // Server Loadを並列実行
    if (serverLoads.length > 0) {
      const serverResults = await this.executeParallel(
        serverLoads,
        event
      );
      Object.assign(results, serverResults);
    }
    
    // Universal LoadにServer Loadの結果を渡して並列実行
    if (universalLoads.length > 0) {
      const universalEvent = {
        ...event,
        data: results  // Server Loadの結果を含む
      };
      
      const universalResults = await this.executeParallel(
        universalLoads,
        universalEvent
      );
      Object.assign(results, universalResults);
    }
    
    return results;
  }
  
  private async executeParallel(
    loads: LoadFunction[],
    event: RequestEvent
  ): Promise<Record<string, any>> {
    // デデュープ: 同じLoad関数の重複実行を防ぐ
    const promises = loads.map(load => {
      const key = load.id;
      
      if (!this.runningLoads.has(key)) {
        this.runningLoads.set(
          key,
          this.executeLoad(load, event)
            .finally(() => this.runningLoads.delete(key))
        );
      }
      
      return this.runningLoads.get(key)!;
    });
    
    const results = await Promise.all(promises);
    
    // 結果をオブジェクトにマージ
    return loads.reduce((acc, load, index) => {
      acc[load.name] = results[index];
      return acc;
    }, {} as Record<string, any>);
  }
  
  private async executeLoad(
    load: LoadFunction,
    event: RequestEvent
  ): Promise<any> {
    try {
      // タイムアウト設定
      const timeout = load.timeout || 30000;
      const result = await Promise.race([
        load.fn(event),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Load timeout')), timeout)
        )
      ]);
      
      return result;
    } catch (error) {
      // エラーハンドリング
      if (load.optional) {
        return null;  // オプショナルな場合はnullを返す
      }
      throw error;  // 必須の場合はエラーを伝播
    }
  }
}
```

## ストリーミングSSRの内部実装

### ストリーミングSSRの処理フロー

ストリーミングSSRでは、重要なコンテンツを即座に送信し、時間のかかるデータは後から順次送信します。

<Mermaid diagram={streamingSSRDiagram} />

### 通常のSSRとストリーミングSSRの比較

ストリーミングSSRは、ユーザー体験を大幅に改善します。

<Mermaid diagram={streamingComparisonDiagram} />

### ストリーミングレスポンスの生成

以下は、ストリーミングSSRの内部実装の概念です。

```typescript
// ストリーミングSSRの内部実装
// ReadableStreamを使用して、データをチャンク単位で順次送信する仕組み
class StreamingRenderer {
  async renderStreaming(
    component: Component,
    props: Props,
    loadPromises: Map<string, Promise<any>>
  ): Promise<ReadableStream> {
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    
    return new ReadableStream({
      async start(controller) {
        // 初期HTMLを即座に送信
        const initialHTML = await renderInitialHTML(component, props);
        controller.enqueue(encoder.encode(initialHTML));
        
        // ストリーミングデータのプレースホルダーを挿入
        controller.enqueue(encoder.encode(
          '<' + 'script id="__SVELTE_KIT_STREAMING__" type="application/json">'
        ));
        
        // Promiseが解決されるたびにデータを送信
        for (const [key, promise] of loadPromises) {
          try {
            const data = await promise;
            const chunk = JSON.stringify({ key, data });
            controller.enqueue(encoder.encode(chunk + '\n'));
            
            // クライアントサイドでの即座の更新トリガー
            controller.enqueue(encoder.encode(
              `<${'script'}>__sveltekit_stream_update(${JSON.stringify(key)})</${'script'}>`
            ));
          } catch (error) {
            // エラーもストリーミング
            const errorChunk = JSON.stringify({ 
              key, 
              error: error.message 
            });
            controller.enqueue(encoder.encode(errorChunk + '\n'));
          }
        }
        
        // ストリーミング完了マーカー
        controller.enqueue(encoder.encode('</' + 'script>'));
        controller.close();
      }
    });
  }
}
```

## パフォーマンス計測と最適化

### 内部的なパフォーマンス計測

SvelteKitは内部的にLoad関数の実行時間を計測し、開発環境ではパフォーマンス問題を警告します。以下は、その仕組みの概念的な実装です。

```typescript
// Load関数のパフォーマンス計測
// 実行時間、依存関係、キャッシュヒット率などを追跡し、
// Server-Timingヘッダーとしてブラウザの開発者ツールに表示できます
interface LoadMetrics {
  name: string;
  startTime: number;
  endTime: number;
  duration: number;
  dependencies: string[];
  cacheHit: boolean;
  error?: Error;
}

class PerformanceMonitor {
  private metrics: LoadMetrics[] = [];
  
  async measureLoad<T>(
    name: string,
    fn: () => Promise<T>,
    deps: string[]
  ): Promise<T> {
    const startTime = performance.now();
    const metric: LoadMetrics = {
      name,
      startTime,
      endTime: 0,
      duration: 0,
      dependencies: deps,
      cacheHit: false
    };
    
    try {
      const result = await fn();
      metric.endTime = performance.now();
      metric.duration = metric.endTime - metric.startTime;
      
      // 開発環境では警告を出力
      if (import.meta.env.DEV && metric.duration > 1000) {
        console.warn(
          `Slow Load function: ${name} took ${metric.duration}ms`
        );
      }
      
      this.metrics.push(metric);
      return result;
    } catch (error) {
      metric.error = error as Error;
      metric.endTime = performance.now();
      metric.duration = metric.endTime - metric.startTime;
      this.metrics.push(metric);
      throw error;
    }
  }
  
  getMetrics(): LoadMetrics[] {
    return this.metrics;
  }
  
  // Server-Timingヘッダーの生成
  generateServerTiming(): string {
    return this.metrics
      .map(m => `${m.name};dur=${m.duration.toFixed(2)}`)
      .join(', ');
  }
}
```

## メモリ管理とガベージコレクション

### キャッシュのメモリ管理

キャッシュがメモリを圧迫しないよう、WeakRefとFinalizationRegistryを使用した高度なメモリ管理が行われています。

```typescript
// メモリ効率的なキャッシュ管理
// WeakRefを使用してガベージコレクションを妨げずにキャッシュを管理
// メモリが逸迫した場合は自動的にキャッシュが解放されます
class MemoryEfficientCache {
  private cache = new Map<string, WeakRef<any>>();
  private registry = new FinalizationRegistry((key: string) => {
    // オブジェクトがGCされたらキャッシュからも削除
    this.cache.delete(key);
  });
  
  set(key: string, value: any) {
    // WeakRefを使用してメモリリークを防ぐ
    const ref = new WeakRef(value);
    this.cache.set(key, ref);
    
    // GC時のクリーンアップを登録
    this.registry.register(value, key);
  }
  
  get(key: string): any | null {
    const ref = this.cache.get(key);
    if (!ref) return null;
    
    const value = ref.deref();
    if (value === undefined) {
      // オブジェクトがGCされていた場合
      this.cache.delete(key);
      return null;
    }
    
    return value;
  }
  
  // 定期的なクリーンアップ
  cleanup() {
    for (const [key, ref] of this.cache) {
      if (ref.deref() === undefined) {
        this.cache.delete(key);
      }
    }
  }
}
```

## デバッグとトラブルシューティング

### Load関数のデバッグツール

開発中のLoad関数の動作を追跡するためのデバッグユーティリティです。パラメータ、実行時間、結果をコンソールに詳細に出力します。

```typescript
// デバッグ用のLoad関数ラッパー
// 開発環境でのみ動作し、Load関数の入出力を詳細にログ出力します
function debugLoadFunction(name: string, load: LoadFunction): LoadFunction {
  return async (event) => {
    if (import.meta.env.DEV) {
      console.group(`🔄 Load: ${name}`);
      console.log('URL:', event.url.toString());
      console.log('Params:', event.params);
      console.log('Locals:', event.locals);
      console.time(`Load: ${name}`);
    }
    
    try {
      const result = await load(event);
      
      if (import.meta.env.DEV) {
        console.log('Result:', result);
        console.timeEnd(`Load: ${name}`);
        console.groupEnd();
      }
      
      return result;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error:', error);
        console.timeEnd(`Load: ${name}`);
        console.groupEnd();
      }
      throw error;
    }
  };
}

// 使用例
// +page.tsや+layout.tsでデバッグラッパーを使用することで、
// Load関数の動作を詳細に追跡できます
export const load = debugLoadFunction('products', async ({ fetch }) => {
  const response = await fetch('/api/products');
  return {
    products: await response.json()
  };
});
```

## まとめ

SvelteKitのデータロードアーキテクチャは、以下の要素で構成されています。

### サーバー・クライアント共通
- **RequestEventオブジェクト**: リクエスト情報の統一的な管理
- **並列処理**: Load関数の最適な実行順序
- **ミドルウェア統合**: Hooksを通じた拡張性

### クライアントサイド特有
- **キャッシュメカニズム**: ブラウザメモリでのデータ再利用
- **invalidate機能**: キャッシュの手動無効化と再取得
- **メモリ管理**: WeakRefによる効率的なリソース利用

### サーバーサイド特有
- **ストリーミングSSR**: プログレッシブな表示の実現
- **ステートレス処理**: リクエストごとに独立した実行

これらの内部実装を理解することで、より効率的なアプリケーション開発が可能になります。

## 次のステップ

- [データフローの詳細](/sveltekit/data-loading/flow/) - 実装レベルのデータフロー
- [レンダリングパイプライン](../rendering-pipeline/) - レンダリング処理の詳細
- [ルーティング内部動作](../routing-internals/) - ルーティングの実装詳細