---
title: データフェッチング戦略
description: SvelteKitの高度なデータ取得戦略 - ストリーミングSSR、並列データ取得、キャッシング、TypeScriptによるリアルタイム更新の実装方法
---

<script>
  import { base } from '$app/paths';
  import Mermaid from '$lib/components/Mermaid.svelte';
  
  const svelteKitParallelDiagram = `sequenceDiagram
    participant User as ユーザー
    participant Browser as ブラウザ
    participant SvelteKit as SvelteKitサーバー
    participant PageTS as +page.ts
    participant API1 as ユーザーAPI
    participant API2 as 投稿API
    participant API3 as コメントAPI
    
    User->>Browser: /users/[id] へアクセス
    Browser->>SvelteKit: HTTPリクエスト
    SvelteKit->>PageTS: load関数実行
    
    Note over PageTS: PageLoad関数<br/>const { fetch, params } = event
    
    PageTS->>PageTS: 3つのfetch呼び出しを準備
    
    par Promise.all による並列実行
        PageTS->>API1: fetch(/api/users/params.id)
        API1-->>PageTS: ユーザーデータ
    and
        PageTS->>API2: fetch(/api/users/params.id/posts)
        API2-->>PageTS: 投稿データ
    and
        PageTS->>API3: fetch(/api/users/params.id/comments)
        API3-->>PageTS: コメントデータ
    end
    
    Note over PageTS: await Promise.all([...])で待機
    PageTS->>PageTS: 全データを統合
    
    PageTS-->>SvelteKit: return { user, posts, comments }
    SvelteKit-->>Browser: HTMLとデータを送信
    Browser->>Browser: +page.svelteでレンダリング
    Browser->>User: 完全なページ表示
    
    rect rgba(59, 130, 246, 0.1)
        Note over User,API3: 最も遅いAPIの時間で完了
    end`;
    
  const parallelFetchingDiagram = `sequenceDiagram
    participant Client as クライアント
    participant Server as サーバー
    participant API1 as ユーザーAPI
    participant API2 as 投稿API
    participant API3 as コメントAPI
    
    Note over Client,API3: 並列データ取得パターン
    
    Client->>Server: Load関数実行
    
    par 並列リクエスト
        Server->>API1: ユーザー情報取得
        API1-->>Server: ユーザーデータ
    and
        Server->>API2: 投稿一覧取得
        API2-->>Server: 投稿データ
    and
        Server->>API3: コメント取得
        API3-->>Server: コメントデータ
    end
    
    Note over Server: Promise.all()で待機
    Server->>Server: 全データ統合
    Server-->>Client: 統合データ返却
    
    rect rgba(34, 197, 94, 0.1)
        Note over Client,API3: 最も遅いAPIの時間で完了
    end`;
    
  const svelteKitCachingDiagram = `sequenceDiagram
    participant User as ユーザー
    participant Browser as ブラウザ
    participant SvelteKit as SvelteKitサーバー
    participant PageServer as +page.server.ts
    participant CacheUtil as cache.ts
    participant DB as データベース
    
    User->>Browser: /posts/popular へアクセス（初回）
    Browser->>SvelteKit: HTTPリクエスト
    SvelteKit->>PageServer: PageServerLoad実行
    
    Note over PageServer: load: PageServerLoad関数
    
    PageServer->>CacheUtil: getCachedData('popular-posts', fetcher)
    CacheUtil->>CacheUtil: cache.get('popular-posts')確認
    Note over CacheUtil: キャッシュなし
    
    CacheUtil->>DB: fetcher()実行<br/>db.post.findMany()
    DB-->>CacheUtil: 投稿データ返却
    CacheUtil->>CacheUtil: cache.set()でキャッシュ保存<br/>TTL: 5分
    CacheUtil-->>PageServer: データ返却
    
    PageServer-->>SvelteKit: return { posts: data }
    SvelteKit-->>Browser: HTMLとデータ送信
    Browser->>User: ページ表示
    
    Note over User,DB: --- 3分後（キャッシュ有効期間内）---
    
    User->>Browser: /posts/popular へアクセス（2回目）
    Browser->>SvelteKit: HTTPリクエスト
    SvelteKit->>PageServer: PageServerLoad実行
    
    PageServer->>CacheUtil: getCachedData('popular-posts', fetcher)
    CacheUtil->>CacheUtil: cache.get('popular-posts')確認
    Note over CacheUtil: キャッシュヒット！<br/>timestamp確認 → 有効
    
    CacheUtil-->>PageServer: キャッシュデータ返却
    PageServer-->>SvelteKit: return { posts: data }
    SvelteKit-->>Browser: HTMLとキャッシュデータ送信
    Browser->>User: ページ表示（高速）
    
    rect rgba(34, 197, 94, 0.1)
        Note over DB: DBアクセスなし → 高速レスポンス
    end`;
    
  const cachingStrategyDiagram = `sequenceDiagram
    participant User as ユーザー
    participant Browser as ブラウザ
    participant Server as サーバー
    participant Cache as メモリキャッシュ
    participant DB as データベース
    
    User->>Browser: ページアクセス（1回目）
    Browser->>Server: データリクエスト
    Server->>Cache: キャッシュ確認
    Cache-->>Server: キャッシュなし
    Server->>DB: データ取得
    DB-->>Server: データ返却
    Server->>Cache: キャッシュに保存
    Server-->>Browser: データ送信
    Browser->>User: ページ表示
    
    Note over User,DB: 5分後（キャッシュ有効期間内）
    
    User->>Browser: ページアクセス（2回目）
    Browser->>Server: データリクエスト
    Server->>Cache: キャッシュ確認
    Cache-->>Server: キャッシュヒット！
    Server-->>Browser: キャッシュデータ送信
    Browser->>User: ページ表示（高速）
    
    rect rgba(59, 130, 246, 0.1)
        Note over DB: DBアクセスなし
    end`;
    
  const svelteKitRealtimeDiagram = `sequenceDiagram
    participant User as ユーザー
    participant Browser as ブラウザ
    participant Component as +page.svelte
    participant SvelteKit as SvelteKitサーバー
    participant ServerTS as +server.ts
    participant EventStream as SSEストリーム
    
    User->>Browser: /realtime-data ページ表示
    Browser->>Component: コンポーネントマウント
    
    Note over Component: onMount()フック
    Component->>Component: new EventSource('/api/stream')
    Component->>SvelteKit: SSE接続リクエスト
    SvelteKit->>ServerTS: GET: RequestHandler実行
    
    ServerTS->>ServerTS: new ReadableStream()作成
    ServerTS->>EventStream: ストリーム開始
    EventStream-->>Component: 接続確立
    
    loop setInterval(1000ms)
        ServerTS->>EventStream: controller.enqueue(data)
        EventStream-->>Component: data: {timestamp}
        Component->>Component: data = JSON.parse(event.data)
        Note over Component: $state変数が更新
        Component->>Browser: UIリアクティブ更新
        Browser->>User: 更新表示
    end
    
    User->>Browser: ページ離脱
    Component->>Component: onDestroy()フック
    Component->>EventStream: eventSource.close()
    EventStream-->>ServerTS: ストリーム終了
    
    rect rgba(59, 130, 246, 0.1)
        Note over Component: invalidate()でのLoad関数再実行も可能
    end`;
    
  const realtimeUpdateDiagram = `sequenceDiagram
    participant User as ユーザー
    participant Browser as ブラウザ
    participant Server as サーバー
    participant EventSource as SSEストリーム
    
    User->>Browser: ページ表示
    Browser->>Server: SSE接続確立
    Server->>EventSource: ストリーム作成
    EventSource-->>Browser: 接続確立
    
    loop 1秒ごと
        Server->>EventSource: データプッシュ
        EventSource-->>Browser: data: {時刻データ}
        Browser->>Browser: UIを更新
        Browser->>User: リアルタイム表示
    end
    
    User->>Browser: ページ離脱
    Browser->>EventSource: 接続クローズ
    EventSource-->>Server: ストリーム終了`;
    
  const svelteKitConditionalDiagram = `sequenceDiagram
    participant User as ユーザー
    participant Browser as ブラウザ
    participant SvelteKit as SvelteKitサーバー
    participant PageServer as +page.server.ts
    participant Hooks as hooks.server.ts
    participant PublicDB as 公開DB
    participant PrivateDB as 個人DB
    
    User->>Browser: /dashboard へアクセス
    Browser->>SvelteKit: HTTPリクエスト（Cookie付き）
    
    SvelteKit->>Hooks: handle()フック実行
    Hooks->>Hooks: cookieからセッション取得
    Hooks->>Hooks: locals.user = getUserFromSession()
    Hooks-->>SvelteKit: event.localsにユーザー情報セット
    
    SvelteKit->>PageServer: PageServerLoad実行
    Note over PageServer: load({ locals })
    
    PageServer->>PageServer: if (!locals.user)チェック
    
    alt 認証済みユーザー（locals.user存在）
        par 並列データ取得
            PageServer->>PublicDB: getPublicData()
            PublicDB-->>PageServer: 公開データ
        and
            PageServer->>PrivateDB: getUserProfile(locals.user.id)
            PrivateDB-->>PageServer: プロフィールデータ
        and
            PageServer->>PrivateDB: getUserPreferences(locals.user.id)
            PrivateDB-->>PageServer: 設定データ
        end
        PageServer-->>SvelteKit: return { ...baseData, user, profile, preferences }
        SvelteKit-->>Browser: 完全なダッシュボード表示
    else 未認証ユーザー
        PageServer->>PublicDB: getPublicData()のみ
        PublicDB-->>PageServer: 公開データ
        PageServer-->>SvelteKit: return { ...baseData, user: null }
        SvelteKit-->>Browser: 制限付きビュー or リダイレクト
    end
    
    Browser->>User: ページ表示`;
    
  const conditionalFetchingDiagram = `sequenceDiagram
    participant User as ユーザー
    participant Browser as ブラウザ
    participant Server as サーバー
    participant Auth as 認証システム
    participant PublicDB as 公開DB
    participant PrivateDB as 個人DB
    
    User->>Browser: ページアクセス
    Browser->>Server: リクエスト（Cookie付き）
    
    Server->>Auth: セッション検証
    
    alt 認証済みユーザー
        Auth-->>Server: ユーザー情報
        par 認証済みデータ取得
            Server->>PublicDB: 公開データ取得
            PublicDB-->>Server: 公開データ
        and
            Server->>PrivateDB: 個人データ取得
            PrivateDB-->>Server: プロフィール・設定
        end
        Server-->>Browser: 完全データセット
    else 未認証ユーザー
        Auth-->>Server: null
        Server->>PublicDB: 公開データのみ取得
        PublicDB-->>Server: 公開データ
        Server-->>Browser: 制限付きデータ
    end
    
    Browser->>User: ページ表示`;
    
  const generalStreamingDiagram = `sequenceDiagram
    participant User as ユーザー
    participant Browser as ブラウザ
    participant Server as サーバー
    participant DB1 as 高速DB/Cache
    participant DB2 as 低速DB/API
    
    User->>Browser: ページアクセス
    Browser->>Server: HTTPリクエスト
    
    par クリティカルデータと非クリティカルデータ
        Server->>DB1: クリティカルデータ取得
        DB1-->>Server: 即座に返却
    and
        Server->>DB2: 非クリティカルデータ（非同期）
        Note right of DB2: 処理継続中...
    end
    
    Server-->>Browser: 初期HTML + クリティカルデータ
    Browser->>User: 初期コンテンツ表示
    
    Note over User: ユーザーは既に基本コンテンツを閲覧可能
    
    DB2-->>Server: 非同期データ準備完了
    Server-->>Browser: ストリーミングでデータ送信
    Browser->>Browser: DOMを動的に更新
    Browser->>User: 完全なページ表示
    
    rect rgba(34, 197, 94, 0.1)
        Note over User,DB2: 段階的なコンテンツ表示により体感速度向上
    end`;
    
  const streamingSSRDiagram = `sequenceDiagram
    participant User as ユーザー
    participant Browser as ブラウザ
    participant SvelteKit as SvelteKitサーバー
    participant PageServer as +page.server.ts
    participant PageSvelte as +page.svelte
    participant CriticalAPI as 高速API/Cache
    participant SlowAPI as 低速API/DB
    
    User->>Browser: ページアクセス
    Browser->>SvelteKit: HTTPリクエスト
    SvelteKit->>PageServer: load関数実行
    
    Note over PageServer: PageServerLoad関数
    
    par 並列データ取得
        PageServer->>CriticalAPI: getCriticalData()
        CriticalAPI-->>PageServer: { title: "ページタイトル" }
    and
        PageServer->>SlowAPI: getSlowData() 
        Note right of SlowAPI: Promise返却（待機しない）
    end
    
    PageServer-->>SvelteKit: { critical, streamed: { slow: Promise } }
    SvelteKit-->>Browser: 初期HTML生成
    Browser->>PageSvelte: コンポーネントマウント
    
    Note over PageSvelte: let { data }: { data: PageData } = $props()
    PageSvelte->>PageSvelte: criticalデータ即座に表示
    Browser->>User: <h1>{data.critical.title}</h1> 表示
    
    Note over PageSvelte: await data.streamed.slow (awaitブロック)
    PageSvelte->>Browser: ローディング表示
    Browser->>User: "読み込み中..." 表示
    
    SlowAPI-->>PageServer: { items: [...] }
    PageServer-->>SvelteKit: Promiseが解決
    SvelteKit-->>Browser: ストリーミングデータ送信
    Browser->>PageSvelte: Promiseが解決
    
    Note over PageSvelte: then slowData (thenブロック)
    PageSvelte->>PageSvelte: slowDataをレンダリング
    Browser->>User: 完全なコンテンツ表示
    
    rect rgba(34, 197, 94, 0.1)
        Note over User: ユーザーは最初から基本コンテンツを見られる
    end`;
    
  const svelteKitErrorHandlingDiagram = `sequenceDiagram
    participant User as ユーザー
    participant Browser as ブラウザ
    participant SvelteKit as SvelteKitサーバー
    participant PageTS as +page.ts
    participant MainAPI as メインAPI
    participant OptAPI as オプションAPI
    participant RecAPI as レコメンドAPI
    participant ErrorPage as +error.svelte
    
    User->>Browser: /products へアクセス
    Browser->>SvelteKit: HTTPリクエスト
    SvelteKit->>PageTS: PageLoad実行
    
    Note over PageTS: load({ fetch })
    
    PageTS->>PageTS: Promise.allSettled()で並列実行
    
    par 複数API呼び出し（エラー許容）
        PageTS->>MainAPI: fetch('/api/products')
        MainAPI-->>PageTS: ✅ 成功 { status: 'fulfilled', value: products }
    and
        PageTS->>OptAPI: fetch('/api/featured')
        OptAPI--xPageTS: ❌ エラー { status: 'rejected', reason: error }
    and
        PageTS->>RecAPI: fetch('/api/recommendations')
        RecAPI-->>PageTS: ✅ 成功 { status: 'fulfilled', value: recommendations }
    end
    
    PageTS->>PageTS: 結果を処理
    
    alt 必須データ（MainAPI）が成功
        Note over PageTS: 部分的成功として処理
        PageTS->>PageTS: フォールバックデータを使用
        PageTS-->>SvelteKit: return {<br/>  mainData: results[0].value,<br/>  optionalData: { fallback: true },<br/>  recommendations: results[2].value<br/>}
        SvelteKit-->>Browser: 部分的なコンテンツ表示
        Browser->>User: 利用可能なデータで表示
    else 必須データ（MainAPI）も失敗
        PageTS->>PageTS: error(500, 'Failed to load')
        SvelteKit->>ErrorPage: +error.svelteを表示
        ErrorPage-->>Browser: エラーページ表示
        Browser->>User: エラーメッセージ表示
    end
    
    rect rgba(220, 38, 127, 0.1)
        Note over User: 完全失敗を回避し、可能な限りコンテンツ表示
    end`;
    
  const svelteKitPerformanceDiagram = `sequenceDiagram
    participant User as ユーザー
    participant Browser as ブラウザ
    participant SvelteKit as SvelteKitサーバー
    participant PageTS as +page.ts
    participant Hooks as hooks.server.ts
    participant API as データAPI
    participant Monitoring as モニタリングサービス
    
    User->>Browser: /analytics へアクセス
    Browser->>SvelteKit: HTTPリクエスト
    
    SvelteKit->>Hooks: handle()フック実行
    Note over Hooks: const start = performance.now()
    
    Hooks->>PageTS: PageLoad実行
    Note over PageTS: load({ fetch, setHeaders })
    
    PageTS->>PageTS: const loadStart = performance.now()
    
    par 複数データ取得（測定付き）
        PageTS->>API: fetch('/api/analytics')
        Note over PageTS: const apiStart = performance.now()
        API-->>PageTS: 分析データ
        PageTS->>PageTS: apiDuration = performance.now() - apiStart
    and
        PageTS->>API: fetch('/api/metrics')
        API-->>PageTS: メトリクスデータ
    end
    
    PageTS->>PageTS: const loadDuration = performance.now() - loadStart
    
    alt パフォーマンス閾値チェック
        Note over PageTS: if (loadDuration > 1000)
        PageTS->>Monitoring: 遅延レポート送信<br/>{ route: '/analytics', duration: loadDuration }
        Monitoring-->>PageTS: レポート受信確認
        PageTS->>PageTS: console.warn('Slow load')
    end
    
    PageTS->>PageTS: setHeaders({ 'Server-Timing': timing })
    PageTS-->>SvelteKit: return { data, performance: metrics }
    
    Hooks->>Hooks: const totalDuration = performance.now() - start
    Hooks->>Monitoring: リクエスト全体のメトリクス送信
    
    SvelteKit-->>Browser: レスポンス（Server-Timingヘッダー付き）
    Browser->>Browser: DevToolsで測定結果表示
    Browser->>User: ページ表示
    
    rect rgba(59, 130, 246, 0.1)
        Note over Browser: ブラウザのPerformance APIでも測定可能
    end`;
    
  const errorHandlingDiagram = `sequenceDiagram
    participant Client as クライアント
    participant Server as サーバー
    participant MainAPI as メインAPI
    participant OptAPI as オプションAPI
    participant RecAPI as レコメンドAPI
    
    Client->>Server: Load関数実行
    
    Note over Server: Promise.allSettled()使用
    
    par 複数API呼び出し
        Server->>MainAPI: 必須データ取得
        MainAPI-->>Server: ✅ 成功
    and
        Server->>OptAPI: オプションデータ取得
        OptAPI--xServer: ❌ エラー
    and
        Server->>RecAPI: レコメンド取得
        RecAPI-->>Server: ✅ 成功
    end
    
    Server->>Server: 結果を処理
    Note over Server: 成功: メイン、レコメンド<br/>失敗: オプション（フォールバック使用）
    
    Server-->>Client: 部分的成功データ
    Client->>Client: 利用可能なデータで表示
    
    rect rgba(220, 38, 127, 0.1)
        Note over Client: 完全失敗を回避
    end`;
</script>

## データフェッチング戦略とは？

**データフェッチング戦略**とは、Webアプリケーションがサーバーやデータベースからデータを取得する際の「方法」と「タイミング」を最適化するためのアプローチです。適切な戦略を選択することで、以下のような効果が得られます。

- **パフォーマンス向上**: ページの読み込み速度を大幅に改善
- **ユーザー体験の最適化**: 待ち時間を減らし、段階的にコンテンツを表示
- **サーバー負荷の軽減**: キャッシュや並列処理で効率的なリソース利用
- **エラー耐性の向上**: 一部のデータ取得に失敗してもページ表示を継続

### なぜ戦略が重要なのか？

単純に「データを取得して表示する」だけでは、以下のような問題が発生します。

1. **遅いAPIがボトルネックに**: 1つの遅いAPIがページ全体の表示を遅延させる
2. **無駄なサーバー負荷**: 同じデータを何度も取得してしまう
3. **全か無かの失敗**: 1つのデータ取得が失敗すると全体がエラーになる
4. **静的な表示**: リアルタイムで更新されるデータに対応できない

これらの問題を解決するために、SvelteKitでは様々なデータフェッチング戦略を提供しています。

## 戦略の分類

SvelteKitのデータフェッチング戦略は、大きく「**基本戦略**」と「**高度な戦略**」に分けられます。

### 基本戦略（Load関数の基礎）
[Load関数の基礎ページ](../basic/)で解説している基本的なパターンも、重要なデータフェッチング戦略です。

- **親子間のデータ共有**: `parent()`を使った効率的なデータ継承
- **認証チェック**: Server Loadでの認証状態確認
- **APIプロキシ**: 外部APIの安全な呼び出し
- **型安全なデータ取得**: TypeScriptによる型推論の活用

### 高度な戦略（このページで解説）

以下の表から、学びたい高度な戦略に直接ジャンプできます。

| 戦略 | 説明 | 使用場面 |
|------|------|----------|
| [ストリーミングSSR](../streaming/) | 段階的にコンテンツを送信し、初期表示を高速化 | 大量データのページ、遅いAPIの呼び出し |
| [並列データ取得](#並列データ取得パターン) | Promise.allで複数のデータを同時取得 | 複数の独立したAPIからのデータ取得 |
| [キャッシング戦略](#キャッシング戦略) | メモリやブラウザキャッシュでパフォーマンス向上 | 頻繁にアクセスされる静的データ |
| [リアルタイム更新](#リアルタイム更新) | SSEやinvalidateで動的にデータ更新 | ライブデータ、チャット、通知 |
| [条件付きフェッチング](#条件付きフェッチング) | ユーザー状態に応じてデータを動的に変更 | 認証、権限管理、デバイス最適化 |
| [エラー境界とフォールバック](#エラー境界とフォールバック) | 部分的な失敗でもページ表示を継続 | 外部API依存、ネットワーク不安定時 |
| [パフォーマンス監視](#パフォーマンス監視) | データ取得のタイミングを測定・最適化 | ボトルネック特定、継続的改善 |

:::tip[学習の順序]
まず[Load関数の基礎](../basic/)で基本戦略を理解してから、このページの高度な戦略に進むことをおすすめします。
:::

ストリーミングSSRの詳細は[ストリーミングSSR](../streaming/)の専用ページで解説しています。

## パフォーマンスのヒント

効率的なデータ取得のための重要なテクニックを紹介します。

### 並列データ取得の重要性

複数のデータソースから情報を取得する際は、並列処理を活用することで大幅にパフォーマンスを改善できます。

```typescript
// ❌ 悪い例：順次実行（遅い）
const user = await fetch('/api/user').then(r => r.json());
const posts = await fetch('/api/posts').then(r => r.json());
const comments = await fetch('/api/comments').then(r => r.json());
// 合計時間 = user取得時間 + posts取得時間 + comments取得時間

// ✅ 良い例：並列実行（速い）
const [user, posts, comments] = await Promise.all([
  fetch('/api/user').then(r => r.json()),
  fetch('/api/posts').then(r => r.json()),
  fetch('/api/comments').then(r => r.json())
]);
// 合計時間 = 最も遅いリクエストの時間のみ
```


## 並列データ取得パターン

複数のデータソースから情報を取得する場合、適切な並列処理戦略を選択することで、大幅なパフォーマンス向上を実現できます。このセクションでは、実践的な並列データ取得のパターンを紹介します。

### 基本的な並列処理の概念

<Mermaid diagram={parallelFetchingDiagram} />

### SvelteKitでの並列データ取得実装

以下のシーケンス図は、SvelteKitの`+page.ts`で実際にどのように並列データ取得が行われるかを示しています。

<Mermaid diagram={svelteKitParallelDiagram} />

### Promise.allを使った最適化

`Promise.all()`を使用することで、複数の非同期処理を同時に実行し、すべての処理が完了するのを待つことができます。これは、独立したデータを取得する際の最も基本的で効果的なパターンです。

```typescript
// +page.ts
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params }) => {
  // 複数のAPIエンドポイントから並列でデータ取得
  const [user, posts, comments] = await Promise.all([
    fetch(`/api/users/${params.id}`).then(r => r.json()),
    fetch(`/api/users/${params.id}/posts`).then(r => r.json()),
    fetch(`/api/users/${params.id}/comments`).then(r => r.json())
  ]);
  
  return {
    user,
    posts,
    comments
  };
};
```

### 依存関係がある場合の最適化

データ間に依存関係がある場合でも、可能な限り並列処理を活用できます。必要最小限のデータを先に取得し、その結果を使って残りのデータを並列で取得するパターンです。

```typescript
export const load: PageLoad = async ({ fetch, params }) => {
  // ユーザー情報を先に取得
  const user = await fetch(`/api/users/${params.id}`).then(r => r.json());
  
  // ユーザーの情報に基づいて並列取得
  const [posts, followers] = await Promise.all([
    fetch(`/api/posts?author=${user.id}`).then(r => r.json()),
    fetch(`/api/users/${user.id}/followers`).then(r => r.json())
  ]);
  
  return {
    user,
    posts,
    followers
  };
};
```

## キャッシング戦略

適切なキャッシング戦略により、不要なネットワークリクエストを削減し、アプリケーションのパフォーマンスを大幅に向上させることができます。キャッシングは、ブラウザレベル、メモリレベル、そしてCDNレベルで実装できます。

### 基本的なキャッシング概念

<Mermaid diagram={cachingStrategyDiagram} />

### SvelteKitでのキャッシング実装

以下のシーケンス図は、SvelteKitで`+page.server.ts`とキャッシュユーティリティを使用した実際のキャッシング実装を示しています。

<Mermaid diagram={svelteKitCachingDiagram} />

### ブラウザキャッシュの活用

HTTPヘッダーを適切に設定することで、ブラウザの組み込みキャッシュ機能を活用できます。静的なデータには長いキャッシュ期間を設定し、動的なデータには短い期間またはキャッシュ無効を設定します。

```typescript
export const load: PageLoad = async ({ fetch }) => {
  // キャッシュを活用
  const staticData = await fetch('/api/static-data', {
    headers: {
      'Cache-Control': 'max-age=3600' // 1時間キャッシュ
    }
  }).then(r => r.json());
  
  // 常に最新データを取得
  const dynamicData = await fetch('/api/dynamic-data', {
    cache: 'no-store'
  }).then(r => r.json());
  
  return {
    staticData,
    dynamicData
  };
};
```

### メモリキャッシュの実装

サーバーサイドでメモリキャッシュを実装することで、データベースへのアクセスを削減し、レスポンス時間を短縮できます。以下は、シンプルなTTL（Time To Live）ベースのキャッシュ実装例です。

```typescript
// lib/cache.ts
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5分

export async function getCachedData<T>(
  key: string,
  fetcher: () => Promise<T>
): Promise<T> {
  const cached = cache.get(key);
  const now = Date.now();
  
  if (cached && now - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  
  const data = await fetcher();
  cache.set(key, { data, timestamp: now });
  
  return data;
}
```

上記のキャッシュユーティリティを使用して、頻繁にアクセスされるが更新頻度の低いデータをキャッシュします。

```typescript
// +page.server.ts
import { getCachedData } from '$lib/cache';

export const load: PageServerLoad = async () => {
  const data = await getCachedData('popular-posts', async () => {
    return await db.post.findMany({
      where: { popular: true },
      take: 10
    });
  });
  
  return { posts: data };
};
```

## リアルタイム更新

リアルタイムでデータを更新する機能は、現代的なWebアプリケーションに欠かせません。SvelteKitは、invalidate関数やServer-Sent Events（SSE）、WebSocketなど、様々なリアルタイム更新の手法をサポートしています。

### 基本的なリアルタイム更新概念

<Mermaid diagram={realtimeUpdateDiagram} />

### SvelteKitでのリアルタイム更新実装

以下のシーケンス図は、SvelteKitで`+page.svelte`と`+server.ts`を使用してSSEによるリアルタイム更新を実装する方法を示しています。

<Mermaid diagram={svelteKitRealtimeDiagram} />

### invalidateを使った更新

`invalidate`関数を使用すると、特定のURLに関連するLoad関数を再実行できます。これは、定期的なデータ更新や、ユーザーアクションに応じたデータの再取得に適しています。

```typescript
// +page.svelte
<script lang="ts">
  import { invalidate } from '$app/navigation';
  import { onMount } from 'svelte';
  import type { PageData } from './$types';
  
  let { data }: { data: PageData } = $props();
  
  onMount(() => {
    // 30秒ごとにデータを更新
    const interval = setInterval(() => {
      invalidate('/api/live-data');
    }, 30000);
    
    return () => clearInterval(interval);
  });
</script>
```

### Server-Sent Events (SSE)

Server-Sent Events（SSE）は、サーバーからクライアントへの単方向リアルタイム通信を実現する技術です。WebSocketよりもシンプルで、HTTPプロトコル上で動作するため、ファイアウォールやプロキシの問題が少ないという利点があります。

```typescript
// +server.ts (APIエンドポイント)
import type { RequestHandler } from './$types';

export const GET: RequestHandler = () => {
  const stream = new ReadableStream({
    start(controller) {
      const interval = setInterval(() => {
        const data = JSON.stringify({ 
          time: new Date().toISOString() 
        });
        controller.enqueue(`data: ${data}\n\n`);
      }, 1000);
      
      return () => clearInterval(interval);
    }
  });
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache'
    }
  });
};
```

クライアント側では、`EventSource` APIを使ってSSEストリームに接続し、リアルタイムでデータを受信します。

```svelte
<!-- +page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  
  let data = $state<any>(null);
  
  onMount(() => {
    const eventSource = new EventSource('/api/stream');
    
    eventSource.onmessage = (event) => {
      data = JSON.parse(event.data);
    };
    
    return () => eventSource.close();
  });
</script>
```

## 条件付きフェッチング

条件付きフェッチングは、ユーザーの状態、デバイス、権限などに基づいて、取得するデータを動的に変更する技術です。これにより、必要なデータのみを効率的に取得し、パフォーマンスとユーザー体験を最適化できます。

### 基本的な条件付きフェッチング概念

<Mermaid diagram={conditionalFetchingDiagram} />

### SvelteKitでの条件付きフェッチング実装

以下のシーケンス図は、SvelteKitで`hooks.server.ts`と`+page.server.ts`を使用して認証ベースの条件付きフェッチングを実装する方法を示しています。

<Mermaid diagram={svelteKitConditionalDiagram} />

### 認証に基づくデータ取得

ユーザーの認証状態に応じて、異なるデータセットを返します。未認証ユーザーには公開情報のみ、認証済みユーザーには追加の個人情報を提供するパターンです。

```typescript
// +page.server.ts
export const load: PageServerLoad = async ({ locals }) => {
  const baseData = await getPublicData();
  
  if (!locals.user) {
    return { ...baseData, user: null };
  }
  
  // 認証済みユーザー向けの追加データ
  const [profile, preferences] = await Promise.all([
    getUserProfile(locals.user.id),
    getUserPreferences(locals.user.id)
  ]);
  
  return {
    ...baseData,
    user: locals.user,
    profile,
    preferences
  };
};
```

### デバイスに応じた最適化

User-Agentヘッダーを解析して、デバイスの種類を判定し、それに応じて異なるデータ量や品質を提供します。モバイルデバイスには軽量版、デスクトップには詳細版を提供することで、最適なユーザー体験を実現します。

```typescript
export const load: PageServerLoad = async ({ request }) => {
  const userAgent = request.headers.get('user-agent') || '';
  const isMobile = /mobile/i.test(userAgent);
  
  if (isMobile) {
    // モバイル向け軽量データ
    return {
      items: await getLightweightData()
    };
  }
  
  // デスクトップ向け詳細データ
  return {
    items: await getDetailedData()
  };
};
```

## エラー境界とフォールバック

堅牢なアプリケーションを構築するには、エラーを適切に処理し、部分的な失敗に対してもユーザーに価値を提供できるようにすることが重要です。SvelteKitは、様々なレベルでエラーを処理する仕組みを提供しています。

### 基本的なエラーハンドリング概念

<Mermaid diagram={errorHandlingDiagram} />

### SvelteKitでのエラーハンドリング実装

以下のシーケンス図は、SvelteKitで`+page.ts`と`+error.svelte`を使用してエラー境界とフォールバックを実装する方法を示しています。

<Mermaid diagram={svelteKitErrorHandlingDiagram} />

### 部分的エラーの処理

`Promise.allSettled()`を使用することで、複数の非同期処理のうち一部が失敗しても、成功した処理の結果を取得できます。これにより、完全な失敗を避け、利用可能なデータでページを表示できます。

```typescript
export const load: PageLoad = async ({ fetch }) => {
  const results = await Promise.allSettled([
    fetch('/api/main-data').then(r => r.json()),
    fetch('/api/optional-data').then(r => r.json()),
    fetch('/api/recommendations').then(r => r.json())
  ]);
  
  return {
    mainData: results[0].status === 'fulfilled' 
      ? results[0].value 
      : null,
    optionalData: results[1].status === 'fulfilled'
      ? results[1].value
      : { fallback: true },
    recommendations: results[2].status === 'fulfilled'
      ? results[2].value
      : []
  };
};
```

## パフォーマンス監視

パフォーマンスの継続的な監視は、アプリケーションの品質を維持するために不可欠です。問題を早期に発見し、ユーザー体験の劣化を防ぐことができます。

### 基本的なパフォーマンス測定

パフォーマンス測定の基本的な概念と手法を紹介します。

### SvelteKitでのパフォーマンス監視実装

以下のシーケンス図は、SvelteKitでパフォーマンス監視を実装する方法を示しています。

<Mermaid diagram={svelteKitPerformanceDiagram} />

### タイミング測定

`performance.now()`を使用して、データ取得にかかった時間を正確に測定します。これにより、パフォーマンスのボトルネックを特定し、最適化の対象を明確にできます。

```typescript
export const load: PageLoad = async ({ fetch }) => {
  const start = performance.now();
  
  const data = await fetch('/api/data').then(r => r.json());
  
  const duration = performance.now() - start;
  
  // パフォーマンスログ
  if (duration > 1000) {
    console.warn(`Slow request: ${duration}ms`);
  }
  
  return { data };
};
```

## ベストプラクティス

1. **重要なデータを優先**
   - クリティカルなデータは即座に返す
   - 補足的なデータはストリーミング

2. **並列処理を最大活用**
   - 独立したデータは`Promise.all()`で同時取得

3. **適切なキャッシュ戦略**
   - 静的データは積極的にキャッシュ
   - 動的データは必要に応じて無効化

4. **エラーに備える**
   - `Promise.allSettled()`で部分的エラーに対応
   - フォールバックデータを用意

## 次のステップ

- [SPAモードとデータ無効化](../spa-invalidation/) - SPAモードとデータ更新の詳細
- [ストリーミングSSR](../streaming/) - 段階的なコンテンツ配信
- [フォーム処理とActions](../../server/forms/) - データの送信と処理