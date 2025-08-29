---
title: 実行環境別アーキテクチャ
description: SSR/SSG/SPAそれぞれの動作原理とアクセスログへの影響を詳細に理解する
---

:::caution[タイトル]
執筆中
:::

SvelteKitの実行環境別アーキテクチャを理解することで、パフォーマンス、SEO、ユーザー行動分析の観点から最適な戦略を選択できます。

## レンダリング戦略とWebサーバーアクセスログ

レンダリング戦略の選択は、Webサーバーのアクセスログに記録される情報に大きく影響します。これはSEOだけでなく、ユーザー行動分析やセキュリティ監査においても重要な考慮事項です。

### アクセスログ記録パターンの比較

| レンダリング戦略 | 初回アクセス | ページ遷移 | ログ記録 | 分析可能性 |
|---|---|---|---|---|
| **SSR** | サーバーリクエスト | サーバーリクエスト | 全ページアクセスが記録 | 完全な行動追跡可能 |
| **SSG** | 静的ファイル配信 | クライアントサイド | 初回のみ記録 | 限定的な追跡 |
| **SPA** | index.html配信 | クライアントサイド | エントリーポイントのみ | 最小限の記録 |
| **ハイブリッド** | ページごとに異なる | ページごとに異なる | 部分的に記録 | 戦略的な追跡 |

:::tip[なぜこれが重要か]
- **SEO**: 検索エンジンのクローラーがアクセスした際の挙動
- **分析**: Google Analytics以外のサーバーサイド分析ツールの利用
- **セキュリティ**: 不正アクセスの検知と追跡
- **パフォーマンス**: CDNキャッシュのヒット率測定
:::

### SSR（サーバーサイドレンダリング）のログ特性

```
# Webサーバーアクセスログの例（SSR）
192.168.1.1 - - [29/Aug/2025:10:00:00 +0900] "GET / HTTP/1.1" 200 12345
192.168.1.1 - - [29/Aug/2025:10:00:05 +0900] "GET /about HTTP/1.1" 200 8765
192.168.1.1 - - [29/Aug/2025:10:00:10 +0900] "GET /products HTTP/1.1" 200 15432
192.168.1.1 - - [29/Aug/2025:10:00:15 +0900] "GET /products/123 HTTP/1.1" 200 9876
```

**メリット:**
- 全てのページアクセスがログに記録される
- ユーザーの完全な行動パスを追跡可能
- 404エラーや異常なアクセスパターンを検知しやすい
- サーバーサイドの分析ツール（AWStats、GoAccess等）が利用可能

**デメリット:**
- サーバー負荷が高い
- ログファイルサイズが大きくなる

### SPA（シングルページアプリケーション）のログ特性

```
# Webサーバーアクセスログの例（SPA）
192.168.1.1 - - [29/Aug/2025:10:00:00 +0900] "GET / HTTP/1.1" 200 2345
192.168.1.1 - - [29/Aug/2025:10:00:01 +0900] "GET /_app/immutable/entry/app.js HTTP/1.1" 200 45678
192.168.1.1 - - [29/Aug/2025:10:00:01 +0900] "GET /_app/immutable/chunks/index.js HTTP/1.1" 200 12345
# 以降のページ遷移はログに記録されない
```

**メリット:**
- サーバー負荷が最小限
- 高速なページ遷移

**デメリット:**
- ページ遷移がログに記録されない
- サーバーサイドの分析ツールでは行動追跡不可
- クライアントサイドの分析（Google Analytics等）に依存

### SSG（静的サイト生成）のログ特性

```
# Webサーバーアクセスログの例（SSG）
192.168.1.1 - - [29/Aug/2025:10:00:00 +0900] "GET /index.html HTTP/1.1" 200 12345
192.168.1.1 - - [29/Aug/2025:10:00:05 +0900] "GET /about.html HTTP/1.1" 200 8765
# プリレンダリングされたページは個別にアクセスされる可能性がある
```

**特徴:**
- CDN配信の場合、オリジンサーバーのログには記録されない可能性
- 直接URLアクセスは記録されるが、SPAナビゲーションは記録されない

## 分析戦略の選択

### ユーザー行動分析の要件別推奨戦略

```typescript
// svelte.config.js での設定例
import adapter from '@sveltejs/adapter-node';

export default {
  kit: {
    adapter: adapter(),
    prerender: {
      // 重要なランディングページはSSG
      entries: ['/'],
    },
    // ページごとの戦略設定
    routes: [
      {
        // ユーザーダッシュボードはSSR（完全な追跡が必要）
        match: /^\/dashboard/,
        prerender: false,
        ssr: true
      },
      {
        // マーケティングページはSSG（SEO重視）
        match: /^\/blog/,
        prerender: true,
        ssr: false
      },
      {
        // 管理画面はSPA（ログイン後のみアクセス）
        match: /^\/admin/,
        prerender: false,
        ssr: false
      }
    ]
  }
};
```

### 分析ツールの併用戦略

```typescript
// hooks.server.ts - サーバーサイドでのカスタムログ記録
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  const startTime = Date.now();
  
  // カスタムログ記録（SPAナビゲーションも含む）
  if (event.url.pathname.startsWith('/api/navigation')) {
    // クライアントサイドナビゲーションをAPIで記録
    const { pathname } = await event.request.json();
    console.log(`[NAVIGATION] ${event.getClientAddress()} - ${pathname}`);
  }
  
  const response = await resolve(event);
  
  // レスポンスタイムの記録
  const duration = Date.now() - startTime;
  console.log(`[ACCESS] ${event.getClientAddress()} - ${event.url.pathname} - ${duration}ms`);
  
  return response;
};
```

```svelte
<!-- app.html - クライアントサイド分析の統合 -->
<script>
  // SPAナビゲーションの追跡
  if (typeof window !== 'undefined') {
    let previousPath = window.location.pathname;
    
    // History APIの監視
    const originalPushState = history.pushState;
    history.pushState = function() {
      originalPushState.apply(history, arguments);
      
      // サーバーに記録を送信
      fetch('/api/navigation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          pathname: window.location.pathname,
          previousPath,
          timestamp: Date.now()
        })
      });
      
      previousPath = window.location.pathname;
    };
  }
</script>
```

## ベストプラクティス

### 1. ハイブリッドアプローチの活用

```typescript
// +page.ts - ページごとの戦略設定
export const prerender = false; // SSR を使用
export const ssr = true;

// または
export const prerender = true;  // SSG を使用
export const ssr = false;
```

### 2. 重要指標の定義と測定

| 指標 | SSR | SSG | SPA | 推奨用途 |
|---|---|---|---|---|
| **ページビュー追跡** | ◎ | △ | ✗ | コンテンツサイト |
| **ユーザーフロー分析** | ◎ | △ | ✗ | ECサイト |
| **リアルタイム分析** | ◎ | ✗ | △ | ダッシュボード |
| **SEOパフォーマンス** | ◎ | ◎ | ✗ | マーケティングサイト |
| **サーバー負荷** | ✗ | ◎ | ◎ | 高トラフィックサイト |

### 3. セキュリティ監査への配慮

```typescript
// セキュリティログの強化
export const handle: Handle = async ({ event, resolve }) => {
  // 疑わしいアクセスパターンの検出
  const ip = event.getClientAddress();
  const userAgent = event.request.headers.get('user-agent');
  
  // レート制限チェック
  if (await isRateLimited(ip)) {
    return new Response('Too Many Requests', { status: 429 });
  }
  
  // アクセスログ記録
  await logAccess({
    ip,
    path: event.url.pathname,
    method: event.request.method,
    userAgent,
    timestamp: new Date()
  });
  
  return resolve(event);
};
```

## 予定している内容

- **SSR（サーバーサイドレンダリング）の詳細**
  - サーバーでの処理フロー
  - ハイドレーションの仕組み
  - パフォーマンス最適化

- **SSG（静的サイト生成）の詳細**
  - ビルド時の処理
  - プリレンダリングの設定
  - 動的ルートの扱い

- **SPA（シングルページアプリケーション）モード**
  - クライアントサイドルーティング
  - データフェッチング
  - 状態管理

- **ハイブリッドアプローチ**
  - ページごとの最適化
  - 実行環境の選択基準
  - ベストプラクティス

## まとめ

レンダリング戦略の選択は、単なる技術的な判断ではなく、ビジネス要件（SEO、ユーザー分析、セキュリティ）を総合的に考慮する必要があります。

:::warning[重要な考慮事項]
- **SSR**: 完全なアクセスログが必要な場合に選択
- **SPA**: ユーザー体験を最優先する場合に選択
- **SSG**: SEOとパフォーマンスのバランスを重視する場合に選択
- **ハイブリッド**: ページごとに最適な戦略を選択
:::