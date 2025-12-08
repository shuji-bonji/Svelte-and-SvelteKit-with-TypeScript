---
title: アクセスログと分析戦略
description: SvelteKitのレンダリング戦略がWebサーバーのアクセスログに与える影響を深掘り。SSR/SSG/SPAでのリクエストパターン、セッション識別、CDNキャッシュ可否、分析ツール連携と監査ログ設計を解説する技術ノート。可観測性の指針付き。詳しい手順とチェックリスト付き。運用時の確認ポイントも掲載
---

<script>
  import { base } from '$app/paths';
  import Mermaid from '$lib/components/Mermaid.svelte';
  
  // SSRのログ取得タイミング
  const ssrLogTimingDiagram = `sequenceDiagram
    participant U as ユーザー
    participant B as ブラウザ
    participant S as Webサーバー
    participant L as アクセスログ
    
    Note over U,L: SSR：すべてのページ遷移がログに記録
    
    U->>B: ページアクセス
    B->>S: GET /
    S->>L: 📋 ログ記録: / アクセス
    S->>S: SSR実行
    S-->>B: HTML + Data
    B-->>U: ページ表示
    
    U->>B: リンククリック
    B->>S: GET /about
    S->>L: 📋 ログ記録: /about アクセス
    S->>S: SSR実行
    S-->>B: HTML + Data
    B-->>U: ページ表示
    
    rect rgba(50, 200, 50, 0.2)
        Note over L: 完全なユーザーパスが記録される
    end`;
  
  // SPAのログ取得タイミング
  const spaLogTimingDiagram = `sequenceDiagram
    participant U as ユーザー
    participant B as ブラウザ
    participant S as Webサーバー
    participant L as アクセスログ
    
    Note over U,L: SPA：初回アクセスのみログに記録
    
    U->>B: ページアクセス
    B->>S: GET /
    S->>L: 📋 ログ記録: / アクセス
    S-->>B: HTMLシェル
    B->>S: GET /app.js
    S->>L: 📋 ログ記録: /app.js
    S-->>B: JavaScript
    B-->>U: ページ表示
    
    U->>B: リンククリック
    B->>B: クライアントルーティング
    Note over S,L: ❌ サーバーリクエストなし
    B-->>U: ページ表示
    
    rect rgba(200, 50, 50, 0.2)
        Note over L: ページ遷移が記録されない
    end`;
  
  // SSGのログ取得タイミング
  const ssgLogTimingDiagram = `sequenceDiagram
    participant U as ユーザー
    participant B as ブラウザ
    participant CDN as CDN
    participant S as オリジンサーバー
    participant L as アクセスログ
    
    Note over U,L: SSG：CDNキャッシュ時のみオリジンログ
    
    U->>B: ページアクセス
    B->>CDN: GET /index.html
    
    alt CDNキャッシュミス
        CDN->>S: GET /index.html
        S->>L: 📋 ログ記録: /index.html
        S-->>CDN: 静的HTML
        CDN-->>B: HTML (キャッシュ)
    else CDNキャッシュヒット
        Note over S,L: ❌ オリジンリクエストなし
        CDN-->>B: HTML (キャッシュ済)
    end
    
    B-->>U: ページ表示
    
    rect rgba(100, 100, 200, 0.2)
        Note over L: CDNキャッシュ後はログなし
    end`;
  
  // ログ記録パターンの比較図
  const logPatternComparison = `graph TB
    subgraph "SSR - 完全記録"
        direction TB
        SSR1["🏠 Home"] -->|LOG| SSR2["📝 About"]
        SSR2 -->|LOG| SSR3["🛒 Products"]
        SSR3 -->|LOG| SSR4["📎 Product/123"]
        style SSR1 fill:#90EE90
        style SSR2 fill:#90EE90
        style SSR3 fill:#90EE90
        style SSR4 fill:#90EE90
    end
    
    subgraph "SPA - エントリーポイントのみ"
        direction TB
        SPA1["🏠 Home<br/>(エントリー)"] -->|NO LOG| SPA2["📝 About"]
        SPA2 -->|NO LOG| SPA3["🛒 Products"]
        SPA3 -->|NO LOG| SPA4["📎 Product/123"]
        style SPA1 fill:#90EE90
        style SPA2 fill:#FFB6C1
        style SPA3 fill:#FFB6C1
        style SPA4 fill:#FFB6C1
        
        SPA5["📝 About<br/>(直接アクセス)"]
        style SPA5 fill:#90EE90
        Note1["※ 直接URLアクセスした<br/>ページはログに記録される"]
        SPA5 -.-> Note1
    end
    
    subgraph "SSG - CDN配信"
        direction TB
        SSG1["🏠 Home"] -->|MAYBE LOG| SSG2["📝 About"]
        SSG2 -->|MAYBE LOG| SSG3["🛒 Products"]
        SSG3 -->|MAYBE LOG| SSG4["📎 Product/123"]
        style SSG1 fill:#FFFFE0
        style SSG2 fill:#FFFFE0
        style SSG3 fill:#FFFFE0
        style SSG4 fill:#FFFFE0
        Note2["※ CDNキャッシュミス時のみ<br/>オリジンサーバーに記録"]
        SSG4 -.-> Note2
    end
    
    classDef logged fill:#90EE90,stroke:#333,stroke-width:2px
    classDef notLogged fill:#FFB6C1,stroke:#333,stroke-width:2px
    classDef maybeLogged fill:#FFFFE0,stroke:#333,stroke-width:2px`;
  
  // ログ取得タイミングのサマリー図
  const logTimingSummary = `graph LR
    subgraph "Browser<br>[🖥️ ブラウザ]"
        UA["👤 ユーザーアクション"]
    end
    
    subgraph "Server [🏛️ サーバー]"
        WS["Webサーバー"]
        LOG["📋 アクセスログ"]
    end
    
    UA -.->|"SSR: 全ページアクセス"| WS
    WS -->|"ログ記録"| LOG
    
    UA -.->|"SPA: 初回のみ"| WS
    WS -->|"初回ログ"| LOG
    
    UA -.->|"SSG: CDN経由"| WS
    WS -->|"キャッシュ時"| LOG
    
    style UA fill:#e1f5fe,color:black
    style WS fill:#fff3e0,color:black
    style LOG fill:#f3e5f5,color:black`;
  
  // ハイブリッド戦略のログパターン
  const hybridStrategyPattern = `flowchart TB
    subgraph "ハイブリッドアプリケーション"
        HP["🏠 ホームページ<br/>SSG"]
        BLOG["📝 ブログ<br/>SSR"]
        DASH["📊 ダッシュボード<br/>SPA"]
        API["🔌 API<br/>SSR"]
    end
    
    subgraph "ログ記録状況"
        L1["🟢 CDNキャッシュ時"]
        L2["🟢 全アクセス記録"]
        L3["🟡 初回のみ"]
        L4["🟢 全APIコール"]
    end
    
    HP --> L1
    BLOG --> L2
    DASH --> L3
    API --> L4
    
    style HP fill:#e8f5e9
    style BLOG fill:#e3f2fd
    style DASH fill:#fff3e0
    style API fill:#f3e5f5`;
  
  // ログ分析ツールの比較
  const analyticsToolsComparison = `graph LR
    subgraph "サーバーサイド分析"
        direction TB
        AWStats["AWStats<br/>✅ SSR ✅ SSG ❌ SPA"]
        GoAccess["GoAccess<br/>✅ SSR ✅ SSG ❌ SPA"]
        Custom["Custom Logger<br/>✅ SSR ✅ SSG ✅ SPA*"]
    end
    
    subgraph "クライアントサイド分析"
        direction TB
        GA["Google Analytics<br/>✅ SSR ✅ SSG ✅ SPA"]
        Plausible["Plausible<br/>✅ SSR ✅ SSG ✅ SPA"]
        Matomo["Matomo<br/>✅ SSR ✅ SSG ✅ SPA"]
    end
    
    subgraph "ハイブリッドアプローチ"
        direction TB
        Combined["Server + Client<br/>完全な追跡"]
    end
    
    AWStats --> Combined
    GA --> Combined
    Custom --> Combined
    
    style AWStats fill:#c8e6c9
    style GoAccess fill:#c8e6c9
    style Custom fill:#fff9c4
    style GA fill:#bbdefb
    style Plausible fill:#bbdefb
    style Matomo fill:#bbdefb
    style Combined fill:#d1c4e9`;
</script>

レンダリング戦略の選択は、Webサーバーのアクセスログに記録される情報に大きく影響します。このページでは、各レンダリング戦略でのログ記録パターン、ユーザー行動分析の手法、セキュリティ監査への対応について詳しく解説します。

## なぜレンダリング戦略でログが変わるのか？

レンダリング戦略によってログの記録パターンが異なる理由は、**リクエストがサーバーに到達するタイミングと頻度**が異なるためです。

### SSRが生まれた背景とマーケティングへの影響

:::info[SPAからSSRへの進化の真の理由]
SSRが誕生した主な理由は「SPAのSEO問題」でしたが、実はそれだけではありません。

1. **検索エンジンの視点（SEO）**
   - SPAは初回HTMLが空のため、検索エンジンがコンテンツを認識できない
   - SSRは完全なHTMLを返すため、検索エンジンが正しくインデックス化できる

2. **マーケティング分析の視点（アクセスログ）**
   - SPAは初回アクセスしか記録されないため、ユーザー行動の把握が困難
   - SSRは全ページ遷移が記録されるため、詳細な行動分析が可能

3. **ビジネス価値の視点**
   - SEO改善 → **新規ユーザー獲得**（検索流入の増加）
   - ログ分析改善 → **既存ユーザー理解**（行動パターンの把握）

つまり、SSRは「ユーザー獲得」と「ユーザー理解」の両方を改善する戦略なのです。
:::

## ログ取得タイミングの概要

まず、各レンダリング戦略でのログ取得タイミングの全体像を示します。

<Mermaid diagram={logTimingSummary} />

## アクセスログ記録パターンの比較

各レンダリング戦略によって、Webサーバーに記録されるアクセスログのパターンが大きく異なります。これはSEO分析、ユーザー行動追跡、セキュリティ監査において重要な考慮事項となります。

### レンダリング戦略別のログ特性

| レンダリング戦略 | 初回アクセス | ページ遷移 | ログ記録 | 分析可能性 |
|---|---|---|---|---|
| **SSR** | サーバーリクエスト | サーバーリクエスト | 全ページアクセスが記録 | 完全な行動追跡可能 |
| **SSG** | 静的ファイル配信 | クライアントサイド | 初回のみ記録 | 限定的な追跡 |
| **SPA** | index.html配信 | クライアントサイド | エントリーポイントのみ | 最小限の記録 |
| **ハイブリッド** | ページごとに異なる | ページごとに異なる | 部分的に記録 | 戦略的な追跡 |

:::tip[なぜこれが重要か]
- **SEO**: 検索エンジンのクローラーがアクセスした際の挙動を把握
- **分析**: Google Analytics以外のサーバーサイド分析ツールの利用可能性
- **セキュリティ**: 不正アクセスの検知と追跡の精度
- **パフォーマンス**: CDNキャッシュのヒット率測定
:::

## ログ記録パターンの視覚的比較

各レンダリング戦略で、ユーザーのページ遷移がどのようにログに記録されるかを視覚的に示します。

<Mermaid diagram={logPatternComparison} />

## SSR（サーバーサイドレンダリング）のログ特性

SSRでは、各ページリクエストがサーバーで処理されるため、すべてのナビゲーションがアクセスログに記録されます。これにより、ユーザーの完全な行動パスを追跡することが可能です。

### SSRのログ取得タイミング

<Mermaid diagram={ssrLogTimingDiagram} />

### 典型的なアクセスログパターン

SSRモードでは、ユーザーの全ての行動がサーバーログに詳細に記録されます。シーケンス図が示すように、各ページ遷移でサーバーリクエストが発生し、それぞれがログに記録されます。以下は実際のWebサーバーアクセスログの例です。

```
# Webサーバーアクセスログの例（SSR）
192.168.1.1 - - [29/Aug/2025:10:00:00 +0900] "GET / HTTP/1.1" 200 12345
192.168.1.1 - - [29/Aug/2025:10:00:05 +0900] "GET /about HTTP/1.1" 200 8765
192.168.1.1 - - [29/Aug/2025:10:00:10 +0900] "GET /products HTTP/1.1" 200 15432
192.168.1.1 - - [29/Aug/2025:10:00:15 +0900] "GET /products/123 HTTP/1.1" 200 9876
```

### SSRでのログ活用例

サーバーサイドでカスタムログを記録し、詳細な分析を行うための実装例です。

```typescript
// hooks.server.ts - SSRでの詳細なログ記録
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  const startTime = performance.now();
  
  // リクエスト情報の記録
  const requestInfo = {
    ip: event.getClientAddress(),
    path: event.url.pathname,
    method: event.request.method,
    userAgent: event.request.headers.get('user-agent'),
    referer: event.request.headers.get('referer'),
    timestamp: new Date().toISOString()
  };
  
  console.log('[REQUEST]', JSON.stringify(requestInfo));
  
  const response = await resolve(event);
  
  // レスポンス情報の記録
  const duration = performance.now() - startTime;
  console.log(`[RESPONSE] ${event.url.pathname} - ${response.status} - ${duration.toFixed(2)}ms`);
  
  // カスタムヘッダーで処理時間を返す
  response.headers.set('X-Response-Time', `${duration.toFixed(2)}ms`);
  
  return response;
};
```

### メリットとデメリット

**メリット:**
- 全てのページアクセスがログに記録される
- ユーザーの完全な行動パスを追跡可能
- 404エラーや異常なアクセスパターンを検知しやすい
- サーバーサイドの分析ツール（AWStats、GoAccess等）が利用可能

**デメリット:**
- サーバー負荷が高い
- ログファイルサイズが大きくなる
- リアルタイム処理のコストが高い

## SPA（シングルページアプリケーション）のログ特性

SPAモードでは、初回ロード後のナビゲーションはクライアント側で処理されるため、サーバーログには記録されません。ユーザー行動の追跡にはクライアントサイドの分析ツールが必要です。

### SPAのログ取得タイミング

<Mermaid diagram={spaLogTimingDiagram} />

### 典型的なアクセスログパターン

SPAでは初回アクセスとJavaScript/CSSファイルのロードのみが記録されます。

```
# Webサーバーアクセスログの例（SPA）
192.168.1.1 - - [29/Aug/2025:10:00:00 +0900] "GET / HTTP/1.1" 200 2345
192.168.1.1 - - [29/Aug/2025:10:00:01 +0900] "GET /_app/immutable/entry/app.js HTTP/1.1" 200 45678
192.168.1.1 - - [29/Aug/2025:10:00:01 +0900] "GET /_app/immutable/chunks/index.js HTTP/1.1" 200 12345
# 以降のページ遷移はログに記録されない
```

### SPAでのナビゲーション追跡実装

クライアントサイドのナビゲーションをサーバーに送信して記録する実装例です。

```typescript
// app.html - SPAナビゲーションの追跡
<script>
  if (typeof window !== 'undefined') {
    let previousPath = window.location.pathname;
    
    // History APIの監視
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    
    function trackNavigation(newPath: string) {
      // サーバーに記録を送信
      fetch('/api/analytics/navigation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          from: previousPath,
          to: newPath,
          timestamp: Date.now(),
          referrer: document.referrer,
          screenSize: `${screen.width}x${screen.height}`
        })
      }).catch(console.error);
      
      previousPath = newPath;
    }
    
    // pushStateをオーバーライド
    history.pushState = function() {
      originalPushState.apply(history, arguments);
      trackNavigation(window.location.pathname);
    };
    
    // replaceStateをオーバーライド
    history.replaceState = function() {
      originalReplaceState.apply(history, arguments);
      trackNavigation(window.location.pathname);
    };
    
    // popstateイベント（戻る/進む）の監視
    window.addEventListener('popstate', () => {
      trackNavigation(window.location.pathname);
    });
  }
</script>
```

### メリットとデメリット

**メリット:**
- サーバー負荷が最小限
- 高速なページ遷移
- オフライン対応が可能

**デメリット:**
- ページ遷移がログに記録されない
- サーバーサイドの分析ツールでは行動追跡不可
- クライアントサイドの分析（Google Analytics等）に依存
- JavaScriptが無効な環境では追跡不可

## SSG（静的サイト生成）のログ特性

SSGでは、ビルド時に生成された静的ファイルが配信されます。CDN経由の配信の場合、オリジンサーバーのログには初回キャッシュ時のみ記録される可能性があります。

### SSGのログ取得タイミング

<Mermaid diagram={ssgLogTimingDiagram} />

### 典型的なアクセスログパターン

直接アクセスされた静的ファイルのみが記録されます。

```
# Webサーバーアクセスログの例（SSG）
192.168.1.1 - - [29/Aug/2025:10:00:00 +0900] "GET /index.html HTTP/1.1" 200 12345
192.168.1.1 - - [29/Aug/2025:10:00:05 +0900] "GET /about.html HTTP/1.1" 200 8765
# プリレンダリングされたページは個別にアクセスされる可能性がある
```

### CDN配信時の考慮事項

SSGとCDNを組み合わせた場合の分析戦略を実装します。

```typescript
// hooks.server.ts - CDN配信時のオリジンサーバーログ
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  // CDNからのリクエストを識別
  const cfRay = event.request.headers.get('cf-ray');
  const cdnIp = event.request.headers.get('x-forwarded-for');
  
  if (cfRay) {
    console.log(`[CDN Request] Ray ID: ${cfRay}, Original IP: ${cdnIp}`);
  }
  
  const response = await resolve(event);
  
  // キャッシュヘッダーの設定
  if (event.url.pathname.endsWith('.html')) {
    response.headers.set('Cache-Control', 's-maxage=3600, max-age=0');
  }
  
  return response;
};
```

## ハイブリッド戦略での分析

異なるレンダリング戦略を組み合わせた場合の分析方法を解説します。

### ハイブリッドアプリケーションのログパターン

実際のアプリケーションでは、ページの特性に応じて異なるレンダリング戦略を使い分けることが一般的です。

<Mermaid diagram={hybridStrategyPattern} />

### ページタイプ別の戦略設定

各ページの特性に応じて最適な分析戦略を選択します。

```typescript
// svelte.config.js - ハイブリッド戦略の設定
import adapter from '@sveltejs/adapter-node';

export default {
  kit: {
    adapter: adapter(),
    prerender: {
      // 重要なランディングページはSSG
      entries: ['/', '/features', '/pricing'],
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
        // ブログはSSG（SEO重視）
        match: /^\/blog/,
        prerender: true,
        ssr: true
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

### 統合分析システムの実装

すべてのレンダリング戦略に対応した統合分析システムの構築例です。

```typescript
// lib/analytics/tracker.ts - 統合分析クラス
export class UniversalTracker {
  private queue: AnalyticsEvent[] = [];
  private flushInterval: number = 5000; // 5秒ごとに送信
  
  constructor() {
    if (typeof window !== 'undefined') {
      this.initClientTracking();
      setInterval(() => this.flush(), this.flushInterval);
    }
  }
  
  // イベント記録
  track(event: string, properties?: Record<string, any>) {
    const analyticsEvent: AnalyticsEvent = {
      event,
      properties,
      timestamp: Date.now(),
      sessionId: this.getSessionId(),
      userId: this.getUserId(),
      context: this.getContext()
    };
    
    this.queue.push(analyticsEvent);
    
    // キューが大きくなったら即座に送信
    if (this.queue.length >= 10) {
      this.flush();
    }
  }
  
  // クライアントサイドの初期化
  private initClientTracking() {
    // ページビューの追跡
    this.trackPageView();
    
    // SPAナビゲーションの監視
    if ('navigation' in window) {
      navigation.addEventListener('navigate', (event) => {
        this.track('page_view', {
          url: event.destination.url,
          type: 'spa_navigation'
        });
      });
    }
    
    // エラーの追跡
    window.addEventListener('error', (event) => {
      this.track('error', {
        message: event.message,
        source: event.filename,
        line: event.lineno,
        column: event.colno
      });
    });
  }
  
  // サーバーへのデータ送信
  private async flush() {
    if (this.queue.length === 0) return;
    
    const events = [...this.queue];
    this.queue = [];
    
    try {
      await fetch('/api/analytics/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events })
      });
    } catch (error) {
      // 失敗した場合はキューに戻す
      this.queue.unshift(...events);
      console.error('Analytics flush failed:', error);
    }
  }
  
  private trackPageView() {
    this.track('page_view', {
      url: window.location.href,
      referrer: document.referrer,
      title: document.title
    });
  }
  
  private getSessionId(): string {
    // セッションIDの取得または生成
    let sessionId = sessionStorage.getItem('analytics_session');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem('analytics_session', sessionId);
    }
    return sessionId;
  }
  
  private getUserId(): string | null {
    // ユーザーIDの取得（ログイン済みの場合）
    return localStorage.getItem('user_id');
  }
  
  private getContext(): AnalyticsContext {
    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      screen: {
        width: screen.width,
        height: screen.height,
        colorDepth: screen.colorDepth
      },
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
  }
}

// 型定義
interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  timestamp: number;
  sessionId: string;
  userId: string | null;
  context: AnalyticsContext;
}

interface AnalyticsContext {
  userAgent: string;
  language: string;
  screen: {
    width: number;
    height: number;
    colorDepth: number;
  };
  viewport: {
    width: number;
    height: number;
  };
  timezone: string;
}
```

## セキュリティ監査とコンプライアンス

アクセスログはセキュリティ監査とコンプライアンスにおいて重要な役割を果たします。

### セキュリティログの強化

不正アクセスの検出と防御のための実装例です。

```typescript
// hooks.server.ts - セキュリティ監査ログ
import type { Handle } from '@sveltejs/kit';
import { RateLimiter } from '$lib/security/rate-limiter';
import { SecurityLogger } from '$lib/security/logger';

const rateLimiter = new RateLimiter();
const securityLogger = new SecurityLogger();

export const handle: Handle = async ({ event, resolve }) => {
  const ip = event.getClientAddress();
  const userAgent = event.request.headers.get('user-agent') || '';
  
  // 疑わしいユーザーエージェントの検出
  if (isSuspiciousUserAgent(userAgent)) {
    await securityLogger.log('suspicious_agent', {
      ip,
      userAgent,
      path: event.url.pathname
    });
  }
  
  // レート制限チェック
  const rateLimitResult = await rateLimiter.check(ip);
  if (!rateLimitResult.allowed) {
    await securityLogger.log('rate_limit_exceeded', {
      ip,
      requests: rateLimitResult.count,
      period: rateLimitResult.period
    });
    
    return new Response('Too Many Requests', { 
      status: 429,
      headers: {
        'Retry-After': String(rateLimitResult.retryAfter)
      }
    });
  }
  
  // SQLインジェクション検出
  const suspiciousPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION)\b)/gi,
    /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
    /javascript:/gi
  ];
  
  const url = event.url.toString();
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(url)) {
      await securityLogger.log('potential_attack', {
        ip,
        type: 'injection_attempt',
        url,
        pattern: pattern.source
      });
      
      return new Response('Bad Request', { status: 400 });
    }
  }
  
  // 正常なリクエストの処理
  const response = await resolve(event);
  
  // 異常なステータスコードの記録
  if (response.status >= 400) {
    await securityLogger.log('error_response', {
      ip,
      path: event.url.pathname,
      status: response.status,
      method: event.request.method
    });
  }
  
  return response;
};

function isSuspiciousUserAgent(userAgent: string): boolean {
  const suspiciousPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i,
    /python/i
  ];
  
  // 既知の正当なボットは除外
  const legitimateBots = [
    /googlebot/i,
    /bingbot/i,
    /slackbot/i
  ];
  
  const isSuspicious = suspiciousPatterns.some(p => p.test(userAgent));
  const isLegitimate = legitimateBots.some(p => p.test(userAgent));
  
  return isSuspicious && !isLegitimate;
}
```

### GDPR/プライバシー対応

個人情報保護規制に準拠したログ記録の実装例です。

```typescript
// lib/analytics/privacy-compliant-logger.ts
export class PrivacyCompliantLogger {
  // IPアドレスの匿名化
  private anonymizeIp(ip: string): string {
    if (ip.includes(':')) {
      // IPv6: 後半を削除
      const parts = ip.split(':');
      return parts.slice(0, 4).join(':') + '::';
    } else {
      // IPv4: 最後のオクテットを0に
      const parts = ip.split('.');
      parts[3] = '0';
      return parts.join('.');
    }
  }
  
  // 個人情報のマスキング
  private sanitizeData(data: any): any {
    const sensitiveFields = ['email', 'password', 'ssn', 'credit_card'];
    
    if (typeof data === 'object' && data !== null) {
      const sanitized = { ...data };
      
      for (const key in sanitized) {
        if (sensitiveFields.includes(key.toLowerCase())) {
          sanitized[key] = '[REDACTED]';
        } else if (typeof sanitized[key] === 'object') {
          sanitized[key] = this.sanitizeData(sanitized[key]);
        }
      }
      
      return sanitized;
    }
    
    return data;
  }
  
  // GDPR準拠のログ記録
  async log(event: string, data: Record<string, any>, consent: boolean = false) {
    const logEntry = {
      event,
      timestamp: new Date().toISOString(),
      data: this.sanitizeData(data),
      consent_given: consent
    };
    
    // IPアドレスは匿名化
    if (data.ip) {
      logEntry.data.ip = this.anonymizeIp(data.ip);
    }
    
    // ユーザーの同意がない場合は最小限のデータのみ
    if (!consent) {
      delete logEntry.data.userId;
      delete logEntry.data.sessionId;
    }
    
    // ログの保存（30日後に自動削除）
    await this.store(logEntry, 30);
  }
  
  private async store(entry: any, retentionDays: number) {
    // データベースまたはログシステムへの保存
    // 保存期限の設定を含む
  }
}
```

## パフォーマンス指標の測定

レンダリング戦略ごとのパフォーマンス測定方法を解説します。

### Core Web Vitalsの測定

各レンダリング戦略でのCore Web Vitals測定実装です。

```typescript
// lib/analytics/web-vitals.ts
import { onCLS, onFID, onLCP, onFCP, onINP, onTTFB } from 'web-vitals';

export class WebVitalsTracker {
  private metrics: Record<string, number> = {};
  
  init() {
    // Cumulative Layout Shift
    onCLS((metric) => {
      this.metrics.cls = metric.value;
      this.report('CLS', metric);
    });
    
    // First Input Delay
    onFID((metric) => {
      this.metrics.fid = metric.value;
      this.report('FID', metric);
    });
    
    // Largest Contentful Paint
    onLCP((metric) => {
      this.metrics.lcp = metric.value;
      this.report('LCP', metric);
    });
    
    // First Contentful Paint
    onFCP((metric) => {
      this.metrics.fcp = metric.value;
      this.report('FCP', metric);
    });
    
    // Interaction to Next Paint
    onINP((metric) => {
      this.metrics.inp = metric.value;
      this.report('INP', metric);
    });
    
    // Time to First Byte
    onTTFB((metric) => {
      this.metrics.ttfb = metric.value;
      this.report('TTFB', metric);
    });
  }
  
  private report(name: string, metric: any) {
    const data = {
      metric: name,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      navigationType: this.getNavigationType(),
      renderingStrategy: this.getRenderingStrategy(),
      url: window.location.href,
      timestamp: Date.now()
    };
    
    // サーバーに送信
    fetch('/api/analytics/vitals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      keepalive: true
    });
  }
  
  private getNavigationType(): string {
    if (performance.navigation) {
      switch (performance.navigation.type) {
        case 0: return 'navigate';
        case 1: return 'reload';
        case 2: return 'back_forward';
        default: return 'unknown';
      }
    }
    return 'unknown';
  }
  
  private getRenderingStrategy(): string {
    // メタタグからレンダリング戦略を取得
    const metaTag = document.querySelector('meta[name="rendering-strategy"]');
    return metaTag?.getAttribute('content') || 'unknown';
  }
}
```

## 分析ダッシュボードの構築

収集したデータを可視化するダッシュボードの実装例です。

```svelte
<!-- +page.svelte - 分析ダッシュボード -->
<script lang="ts">
  import { onMount } from 'svelte';
  import type { PageData } from './$types';
  
  let { data }: { data: PageData } = $props();
  
  let chartContainer: HTMLElement;
  let Chart: any;
  
  onMount(async () => {
    // Chart.jsの動的インポート
    const module = await import('chart.js/auto');
    Chart = module.Chart;
    
    // アクセスログチャート
    new Chart(chartContainer, {
      type: 'line',
      data: {
        labels: data.analytics.dates,
        datasets: [
          {
            label: 'SSR Pages',
            data: data.analytics.ssr,
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.5)'
          },
          {
            label: 'SSG Pages',
            data: data.analytics.ssg,
            borderColor: 'rgb(54, 162, 235)',
            backgroundColor: 'rgba(54, 162, 235, 0.5)'
          },
          {
            label: 'SPA Navigation',
            data: data.analytics.spa,
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.5)'
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Page Access by Rendering Strategy'
          },
          tooltip: {
            mode: 'index',
            intersect: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Page Views'
            }
          }
        }
      }
    });
  });
</script>

<div class="analytics-dashboard">
  <h1>アクセス分析ダッシュボード</h1>
  
  <div class="stats-grid">
    <div class="stat-card">
      <h3>総ページビュー</h3>
      <p class="stat-value">{data.analytics.totalPageViews.toLocaleString()}</p>
    </div>
    
    <div class="stat-card">
      <h3>ユニークユーザー</h3>
      <p class="stat-value">{data.analytics.uniqueUsers.toLocaleString()}</p>
    </div>
    
    <div class="stat-card">
      <h3>平均セッション時間</h3>
      <p class="stat-value">{data.analytics.avgSessionDuration}分</p>
    </div>
    
    <div class="stat-card">
      <h3>直帰率</h3>
      <p class="stat-value">{data.analytics.bounceRate}%</p>
    </div>
  </div>
  
  <div class="chart-container">
    <canvas bind:this={chartContainer}></canvas>
  </div>
  
  <div class="rendering-breakdown">
    <h2>レンダリング戦略別の内訳</h2>
    <table>
      <thead>
        <tr>
          <th>戦略</th>
          <th>ページビュー</th>
          <th>割合</th>
          <th>平均読み込み時間</th>
        </tr>
      </thead>
      <tbody>
        {#each data.analytics.strategyBreakdown as strategy}
          <tr>
            <td>{strategy.name}</td>
            <td>{strategy.views.toLocaleString()}</td>
            <td>{strategy.percentage}%</td>
            <td>{strategy.avgLoadTime}ms</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

<style>
  .analytics-dashboard {
    padding: 2rem;
  }
  
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin: 2rem 0;
  }
  
  .stat-card {
    padding: 1.5rem;
    background: var(--color-surface);
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .stat-value {
    font-size: 2rem;
    font-weight: bold;
    color: var(--color-primary);
  }
  
  .chart-container {
    margin: 2rem 0;
    height: 400px;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
  }
  
  th, td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid var(--color-border);
  }
</style>
```

## ベストプラクティス

### 重要指標の定義と測定

アプリケーションの成功を測定するための重要指標を定義します。

| 指標 | SSR | SSG | SPA | 推奨用途 |
|---|---|---|---|---|
| **ページビュー追跡** | ◎ | △ | ✗ | コンテンツサイト |
| **ユーザーフロー分析** | ◎ | △ | ✗ | ECサイト |
| **リアルタイム分析** | ◎ | ✗ | △ | ダッシュボード |
| **SEOパフォーマンス** | ◎ | ◎ | ✗ | マーケティングサイト |
| **サーバー負荷** | ✗ | ◎ | ◎ | 高トラフィックサイト |

### 分析ツールの比較と選定

各レンダリング戦略に対応した分析ツールの選択が重要です。

<Mermaid diagram={analyticsToolsComparison} />

### 分析ツールの選定ガイド

用途に応じた分析ツールの選び方を解説します。

```typescript
// analytics.config.ts - 分析ツールの設定
export const analyticsConfig = {
  // サーバーサイド分析
  server: {
    enabled: true,
    tools: ['custom-logger', 'prometheus'],
    sampling: 0.1, // 10%サンプリング
  },
  
  // クライアントサイド分析
  client: {
    enabled: true,
    tools: ['google-analytics', 'mixpanel'],
    trackingConsent: true, // GDPR対応
  },
  
  // パフォーマンス測定
  performance: {
    enabled: true,
    webVitals: true,
    customMetrics: ['api-latency', 'db-query-time'],
  },
  
  // セキュリティ監査
  security: {
    enabled: true,
    logSuspiciousActivity: true,
    rateLimit: {
      requests: 100,
      window: 60000, // 1分
    },
  },
};
```

## まとめ

レンダリング戦略の選択は、アクセスログと分析戦略に直接的な影響を与えます。各戦略の特性を理解し、アプリケーションの要件に応じて適切な分析手法を選択することが重要です。

:::warning[重要な考慮事項]
- **SSR**: 完全なアクセスログが必要な場合に選択
- **SPA**: ユーザー体験を最優先する場合に選択
- **SSG**: SEOとパフォーマンスのバランスを重視する場合に選択
- **ハイブリッド**: ページごとに最適な戦略を選択
:::

## 次のステップ

- [レンダリング戦略（詳解）]({base}/sveltekit/architecture/rendering-strategies/) - 各戦略の詳細な仕組み
- [実行環境とランタイム]({base}/sveltekit/architecture/execution-environments/) - 様々な実行環境での動作
- [ビルド最適化]({base}/sveltekit/architecture/build-optimization/) - パフォーマンス改善手法
