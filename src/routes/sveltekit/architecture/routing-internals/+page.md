---
title: ルーティング内部動作
description: SvelteKitルーティング内部動作の完全ガイド - TypeScriptでルート生成とマッチング、プリフェッチ、History API統合を解説
---

<script>
  import { base } from '$app/paths';
  import Mermaid from '$lib/components/Mermaid.svelte';

  const routeGenerationDiagram = `graph LR
    subgraph "ビルド時のルート生成"
        direction TB
        FS[ファイルシステム<br/>src/routes/]
        SCAN[ディレクトリスキャン]
        PARSE[ファイル名パース]
        ROUTE[ルート定義生成]
        MANIFEST[マニフェスト作成]
    end

    FS --> SCAN
    SCAN --> PARSE
    PARSE --> ROUTE
    ROUTE --> MANIFEST

    PARSE --> |"+page.svelte"| PAGE[ページルート]
    PARSE --> |"+layout.svelte"| LAYOUT[レイアウト階層]
    PARSE --> |"+server.ts"| API[APIエンドポイント]
    PARSE --> |"[param]"| DYNAMIC[動的セグメント]
    PARSE --> |"[[optional]]"| OPTIONAL[オプショナル]
    PARSE --> |"\[...rest\]"| REST[Rest パラメータ]
    PARSE --> |"(group)"| GROUP[ルートグループ]

    style FS fill:#e1f5fe
    style MANIFEST fill:#c8e6c9
    style DYNAMIC fill:#fff9c4
    style OPTIONAL fill:#ffe0b2
    style REST fill:#ffccbc`;

  const routeMatchingDiagram = `graph TB
    subgraph "ルートマッチングアルゴリズム"
        URL[URLパス]
        SEGMENTS[セグメント分割]
        CANDIDATES[候補ルート検索]
        SCORE[スコアリング]
        MATCH[最適マッチ選択]
    end

    URL --> SEGMENTS
    SEGMENTS --> CANDIDATES
    CANDIDATES --> SCORE
    SCORE --> MATCH

    SCORE --> |"完全一致"| S1[スコア: 100]
    SCORE --> |"動的一致"| S2[スコア: 50]
    SCORE --> |"オプショナル"| S3[スコア: 25]
    SCORE --> |"Rest"| S4[スコア: 10]

    style URL fill:#e1f5fe
    style MATCH fill:#c8e6c9
    style S1 fill:#4caf50
    style S2 fill:#8bc34a
    style S3 fill:#cddc39
    style S4 fill:#ffeb3b`;

  const prefetchStrategyDiagram = `sequenceDiagram
    participant User as ユーザー
    participant DOM as DOM要素
    participant Router as SvelteKitルーター
    participant Cache as キャッシュ
    participant Server as サーバー

    User->>DOM: hover/tap on link
    DOM->>Router: data-sveltekit-preload-data

    alt hover戦略
        Router->>Router: 200ms待機
        Router->>Cache: キャッシュ確認
        alt キャッシュなし
            Router->>Server: データプリフェッチ
            Server-->>Cache: データ保存
        end
    else tap戦略
        Router->>Cache: 即座に確認
        Router->>Server: 必要なら取得
    else viewport戦略
        DOM->>Router: IntersectionObserver
        Router->>Server: ビューポート内でプリフェッチ
    end

    User->>DOM: クリック
    Router->>Cache: キャッシュから即座に取得
    Router->>DOM: ページ遷移（高速）`;

  const historyApiDiagram = `graph TB
    subgraph "History API統合"
        direction TB
        NAV[ナビゲーション要求]
        INTERCEPT[リンククリック<br/>インターセプト]
        STATE[状態管理]
        HISTORY[History API]
        UPDATE[DOM更新]
    end

    NAV --> INTERCEPT
    INTERCEPT --> |"pushState()"| HISTORY
    HISTORY --> STATE
    STATE --> UPDATE

    HISTORY --> |"popstate"| BACK[戻る/進む]
    BACK --> STATE

    STATE --> SCROLL[スクロール位置復元]
    STATE --> FOCUS[フォーカス管理]
    STATE --> ANNOUNCE[スクリーンリーダー通知]

    style NAV fill:#e1f5fe
    style HISTORY fill:#fff9c4
    style UPDATE fill:#c8e6c9`;

  const routeStructureExample = `graph TB
    subgraph "ファイル構造からルート生成"
        direction LR
        ROOT["src/routes/"]
        ROOT --> HOME["+page.svelte<br/>→ /"]
        ROOT --> ABOUT["about/+page.svelte<br/>→ /about"]
        ROOT --> BLOG["blog/"]
        BLOG --> BLOGINDEX["blog/+page.svelte<br/>→ /blog"]
        BLOG --> POST["blog/[slug]/+page.svelte<br/>→ /blog/:slug"]
        ROOT --> API["api/"]
        API --> USERS["api/users/+server.ts<br/>→ /api/users (API)"]
        ROOT --> ADMIN["(admin)/"]
        ADMIN --> DASH["(admin)/dashboard/+page.svelte<br/>→ /dashboard"]
        ROOT --> CATCH["[...path]/+page.svelte<br/>→ /* (catch-all)"]
    end

    style ROOT fill:#f0f0f0
    style POST fill:#fff9c4
    style ADMIN fill:#e1f5fe
    style CATCH fill:#ffccbc`;
</script>

SvelteKitのルーティングシステムは、ファイルシステムの構造から自動的にルートを生成し、効率的なナビゲーションを実現します。このページでは、その内部メカニズムを詳しく解説します。

## ルート生成プロセス

**SvelteKitは、ビルド時に`src/routes`ディレクトリをスキャンし、ファイル構造から自動的にルーティングテーブルを生成します。** この仕組みにより、設定ファイルを書くことなく、直感的にルートを定義できます。

<Mermaid diagram={routeGenerationDiagram} />

### ファイル構造とルートの対応

以下の図は、実際のファイル構造がどのようにURLルートに変換されるかを示しています。

<Mermaid diagram={routeStructureExample} />

### ルート生成の詳細

ビルド時のルート生成プロセスでは、以下の処理が実行されます。

```typescript
// 内部的なルート生成ロジック（概念的な例）
interface RouteDefinition {
  id: string;
  pattern: RegExp;
  segments: RouteSegment[];
  page?: {
    layouts: number[];
    errors: number[];
    leaf: number;
  };
  endpoint?: {
    file: string;
  };
}

interface RouteSegment {
  content: string;
  dynamic: boolean;
  rest: boolean;
  optional: boolean;
}

// ディレクトリ構造からルートを生成
function generateRoutes(dir: string): RouteDefinition[] {
  const routes: RouteDefinition[] = [];

  // ファイルシステムをスキャン
  const files = scanDirectory(dir);

  for (const file of files) {
    // ファイル名からルートパターンを生成
    const segments = parseFileName(file);
    const pattern = createRoutePattern(segments);

    routes.push({
      id: file.replace(/\+page\.svelte$/, ''),
      pattern,
      segments,
      page: file.endsWith('+page.svelte') ? {
        layouts: findLayouts(file),
        errors: findErrorPages(file),
        leaf: getPageIndex(file)
      } : undefined,
      endpoint: file.endsWith('+server.ts') ? {
        file: file
      } : undefined
    });
  }

  // 優先順位でソート（具体的 → 抽象的）
  return sortBySpecificity(routes);
}
```

## ルートマッチングアルゴリズム

**URLパスから適切なルートを見つけるマッチングアルゴリズムは、SvelteKitの中核機能の一つです。** 効率的かつ正確なマッチングにより、高速なルーティングを実現しています。

<Mermaid diagram={routeMatchingDiagram} />

### マッチングの実装詳細

実際のマッチングロジックは、以下のような優先順位で動作します。

```typescript
// ルートマッチャーの実装例
class RouteMatcher {
  private routes: RouteDefinition[];

  constructor(routes: RouteDefinition[]) {
    this.routes = routes;
  }

  match(pathname: string): MatchResult | null {
    const segments = pathname.split('/').filter(Boolean);

    for (const route of this.routes) {
      const params: Record<string, string> = {};
      const matched = this.matchRoute(route, segments, params);

      if (matched) {
        return {
          route,
          params,
          pathname
        };
      }
    }

    return null;
  }

  private matchRoute(
    route: RouteDefinition,
    segments: string[],
    params: Record<string, string>
  ): boolean {
    let segmentIndex = 0;

    for (const routeSegment of route.segments) {
      if (routeSegment.rest) {
        // [...rest] - 残りすべてをキャプチャ
        params[routeSegment.content] = segments.slice(segmentIndex).join('/');
        return true;
      }

      if (segmentIndex >= segments.length) {
        // オプショナルセグメントの場合はOK
        return routeSegment.optional;
      }

      const segment = segments[segmentIndex];

      if (routeSegment.dynamic) {
        // [param] - 動的セグメント
        params[routeSegment.content] = segment;
      } else if (routeSegment.content !== segment) {
        // 静的セグメントが一致しない
        return false;
      }

      segmentIndex++;
    }

    // すべてのセグメントが一致
    return segmentIndex === segments.length;
  }
}
```

### 特殊なルートパターン

**SvelteKitは、動的なURLに対応するための様々な特殊パターンをサポートしています。** これらのパターンを使用することで、柔軟なルーティング設計が可能になり、RESTfulなURL構造を簡単に実現できます。

各パターンの特徴と使い分け
- **動的ルート `[param]`**：単一の動的セグメントをキャプチャ（例：ブログ記事のスラッグ）
- **オプショナルルート `[[param]]`**：存在しない場合も許容（例：言語切り替え）
- **Restパラメータ `[...rest]`**：複数セグメントをキャプチャ（例：階層的なドキュメント）
- **ルートグループ `(group)`**：URLに影響を与えずにファイルを整理（例：認証エリアのグループ化）

これらのパターンは組み合わせて使用することも可能で、複雑なルーティング要件にも対応できます。

```typescript
// 動的ルート
// src/routes/blog/[slug]/+page.svelte
export async function load({ params }) {
  // params.slug でアクセス
  return {
    post: await getPost(params.slug)
  };
}

// オプショナルルート
// src/routes/[[lang]]/about/+page.svelte
export async function load({ params }) {
  // params.lang は undefined または値
  const lang = params.lang || 'en';
  return {
    content: await getContent(lang)
  };
}

// Rest パラメータ
// src/routes/docs/[...path]/+page.svelte
export async function load({ params }) {
  // params.path は "a/b/c" のような文字列
  return {
    doc: await getDocument(params.path)
  };
}

// ルートグループ（URLに影響しない）
// src/routes/(marketing)/about/+page.svelte → /about
// src/routes/(marketing)/contact/+page.svelte → /contact
```

## プリフェッチ戦略

**SvelteKitの先進的なプリフェッチ機能により、ユーザーがリンクをクリックする前にデータを取得し、瞬時のページ遷移を実現します。**

<Mermaid diagram={prefetchStrategyDiagram} />

### プリフェッチの設定と実装

**プリフェッチはユーザー体験を劇的に改善する重要な機能です。** リンクにカーソルを合わせた瞬間や、リンクがビューポートに入った瞬間にデータを先読みすることで、クリック時の遅延をゼロに近づけます。

SvelteKitは以下の4つのプリフェッチ戦略を提供しています。

1. **hover**：マウスホバー時にプリフェッチ（デスクトップに最適）
2. **tap**：タッチデバイスでタップ開始時にプリフェッチ（モバイルに最適）
3. **viewport**：要素がビューポートに入った時にプリフェッチ（自動先読み）
4. **off**：プリフェッチを無効化（重要なデータや認証が必要なページ）

```svelte
<!-- プリフェッチ戦略の設定 -->
<a href="/about" data-sveltekit-preload-data="hover">
  About (hover時にプリロード)
</a>

<a href="/blog" data-sveltekit-preload-data="tap">
  Blog (タップ時にプリロード)
</a>

<a href="/products" data-sveltekit-preload-data="off">
  Products (プリロードしない)
</a>

<a href="/contact" data-sveltekit-preload-code="viewport">
  Contact (ビューポート内でコードをプリロード)
</a>
```

### プログラマティックなプリフェッチ

**HTMLの属性だけでなく、JavaScriptから動的にプリフェッチを制御することも可能です。** これにより、ユーザーの行動パターンや認証状態に基づいて、より賢いプリフェッチ戦略を実装できます。

プログラマティックなプリフェッチの活用シーン
- **条件付きプリフェッチ**：ログイン状態に応じて異なるページを先読み
- **予測的プリフェッチ**：ユーザーの行動履歴から次のページを予測
- **段階的プリフェッチ**：重要度に応じて順番にプリフェッチ
- **リソース管理**：ネットワーク状態に応じてプリフェッチを制御

```typescript
// +page.svelte
<script lang="ts">
  import { preloadData, preloadCode } from '$app/navigation';
  import { onMount } from 'svelte';

  onMount(() => {
    // 特定条件でプリフェッチ
    if (userIsLoggedIn()) {
      // データのプリフェッチ
      preloadData('/dashboard');

      // コードのプリフェッチ
      preloadCode('/admin/*');
    }
  });

  // イベントベースのプリフェッチ
  async function handleHover(url: string) {
    await preloadData(url);
  }
</script>

<nav>
  <a
    href="/profile"
    on:mouseenter={() => handleHover('/profile')}
  >
    Profile
  </a>
</nav>
```

## History API 統合

**SvelteKitは、ブラウザのHistory APIと緊密に統合され、シームレスなクライアントサイドナビゲーションを実現します。**

<Mermaid diagram={historyApiDiagram} />

### ナビゲーションの実装詳細

**SvelteKitのナビゲーションAPIは、単純な画面遷移から複雑な状態管理まで、あらゆるナビゲーションシナリオに対応できる強力な機能を提供します。** ここでは、ナビゲーションのライフサイクル全体をコントロールする方法を解説します。

ナビゲーションフックの活用
- **beforeNavigate**：ナビゲーション前の検証や確認ダイアログの表示
- **afterNavigate**：ナビゲーション後のスクロール位置調整やアナリティクス送信
- **goto関数**：プログラムから任意のページへ遷移
- **invalidate関数**：特定のデータを再取得してページを更新

```typescript
// 内部的なナビゲーション処理
import { goto, beforeNavigate, afterNavigate } from '$app/navigation';

// ナビゲーション前のフック
beforeNavigate(({ from, to, cancel }) => {
  // 条件によってナビゲーションをキャンセル
  if (hasUnsavedChanges()) {
    if (!confirm('変更が保存されていません。移動しますか？')) {
      cancel();
    }
  }

  // アナリティクスの送信
  trackPageView(from, to);
});

// ナビゲーション後のフック
afterNavigate(({ from, to }) => {
  // スクロール位置の管理
  if (to.route.id !== from?.route.id) {
    // 新しいページの場合はトップへ
    window.scrollTo(0, 0);
  }

  // フォーカス管理
  const main = document.querySelector('main');
  main?.focus();

  // スクリーンリーダーへの通知
  announcePageChange(to);
});

// プログラマティックなナビゲーション
async function navigateToProduct(id: string) {
  // オプション付きナビゲーション
  await goto(`/products/${id}`, {
    replaceState: false,  // History に追加
    noScroll: false,      // スクロール位置リセット
    keepFocus: false,     // フォーカスを維持
    invalidateAll: false  // すべてのデータを再取得
  });
}
```

### 状態管理とスクロール復元

**ブラウザの戻る/進むボタンを使った際も、適切な状態復元とスクロール位置の管理が重要です。** SvelteKitは、History APIの状態管理機能を活用して、SPAでありながらネイティブなブラウザ体験を提供します。

状態管理の重要なユースケース
- **フォーム入力の保持**：ページを戻った際に入力内容を復元
- **モーダル状態の管理**：URLと連動したモーダルの開閉
- **スクロール位置の記憶**：長いページでの読み位置を保持
- **フィルター条件の維持**：検索結果ページでのフィルター状態を保存

pushStateとreplaceStateの使い分け
- **pushState**：新しい履歴エントリを作成（戻るボタンで戻れる）
- **replaceState**：現在の履歴エントリを置換（状態更新のみ）

```typescript
// +page.svelte
<script lang="ts">
  import { page } from '$app/stores';
  import { pushState, replaceState } from '$app/navigation';

  // 現在のURL情報
  let currentUrl = $derived($page.url);
  let currentParams = $derived($page.params);
  let currentRoute = $derived($page.route);

  // 状態の保存
  function saveState() {
    const state = {
      scrollY: window.scrollY,
      formData: getFormData(),
      timestamp: Date.now()
    };

    // 現在のエントリを更新
    replaceState($page.url, state);
  }

  // モーダル表示（URLは変更するが履歴は残さない）
  function openModal(productId: string) {
    const url = new URL($page.url);
    url.searchParams.set('modal', productId);

    pushState(url, {
      modal: true,
      previousScroll: window.scrollY
    });
  }

  // ブラウザの戻るボタン対応
  window.addEventListener('popstate', (event) => {
    if (event.state?.modal) {
      // モーダルを閉じる
      closeModal();
      // スクロール位置を復元
      window.scrollTo(0, event.state.previousScroll);
    }
  });
</script>
```

## ルーティングの最適化

**大規模なアプリケーションでは、ルーティングの最適化がパフォーマンスに直結します。** ここでは、実践的な最適化テクニックを3つの観点から解説します。

最適化の基本戦略
1. **コード分割**：必要なコードだけを読み込み、初期バンドルサイズを削減
2. **ルート設定**：ページごとに最適なレンダリング戦略を選択
3. **エラー処理**：適切なエラーバウンダリで信頼性を向上

### 1. ルート分割とコード分割

**動的インポートを活用して、ルートごとに必要なコードだけを読み込むことで、初期読み込み時間を大幅に短縮できます。**

```typescript
// +layout.ts
// 遅延読み込みによる最適化
export const load: LayoutLoad = async ({ route }) => {
  // ルートに応じて必要なコードのみ読み込み
  if (route.id?.startsWith('/admin')) {
    const { AdminUtils } = await import('$lib/admin');
    return {
      utils: new AdminUtils()
    };
  }

  return {};
};
```

### 2. ルートごとの設定

**各ルートには、そのページの特性に応じた最適な設定を個別に適用できます。** これにより、静的なページはビルド時に生成し、動的なページはサーバーサイドでレンダリングするなど、きめ細かい最適化が可能です。

ページエクスポートの重要な設定
- **prerender**：ビルド時に静的HTMLを生成（高速配信）
- **ssr**：サーバーサイドレンダリングの有効/無効
- **csr**：クライアントサイドレンダリングの有効/無効
- **trailingSlash**：URLの末尾スラッシュの扱い
- **match**：カスタムパラメータバリデーション

```typescript
// +page.ts
// ページごとの最適化設定
export const prerender = true;     // ビルド時に生成
export const ssr = true;           // SSRを有効化
export const csr = true;           // CSRを有効化
export const trailingSlash = 'always'; // URLの末尾スラッシュ

// ルートマッチャーの設定
export const match = ((param) => {
  // カスタムバリデーション
  return /^\d+$/.test(param);
}) satisfies ParamMatcher;
```

### 3. エラーバウンダリ

**エラーが発生した際も、アプリケーション全体がクラッシュすることなく、適切なエラーページを表示することが重要です。** SvelteKitの+error.svelteファイルは、階層的なエラー処理を可能にし、ユーザーフレンドリーなエラー体験を提供します。

エラーハンドリングのベストプラクティス
- **ステータスコード別の処理**：404、500など、エラーの種類に応じた表示
- **リトライ機能**：一時的なエラーからの回復手段を提供
- **エラー報告**：開発環境では詳細、本番環境では簡潔なメッセージ
- **フォールバック**：エラー時でも最低限の機能を維持

```svelte
<!-- +error.svelte -->
<script lang="ts">
  import { page } from '$app/stores';
  import { invalidate } from '$app/navigation';

  // エラー情報
  let error = $derived($page.error);
  let status = $derived($page.status);

  // エラーからの回復
  async function retry() {
    // データを再取得
    await invalidate($page.url);
  }
</script>

{#if status === 404}
  <h1>ページが見つかりません</h1>
  <p>お探しのページは移動または削除された可能性があります。</p>
  <a href="/">ホームへ戻る</a>
{:else if status === 500}
  <h1>サーバーエラー</h1>
  <p>{error?.message}</p>
  <button on:click={retry}>再試行</button>
{:else}
  <h1>エラー {status}</h1>
  <p>{error?.message}</p>
{/if}
```

## パフォーマンス計測

**ルーティングのパフォーマンスを継続的に計測することで、ボトルネックを特定し、ユーザー体験を改善できます。** ここでは、ナビゲーションパフォーマンスの計測とCore Web Vitalsの取得方法を実装します。

計測すべき重要な指標
- **ナビゲーション時間**：ページ遷移にかかった時間
- **LCP (Largest Contentful Paint)**：最大コンテンツの描画時間
- **FID (First Input Delay)**：最初の入力遅延
- **CLS (Cumulative Layout Shift)**：レイアウトのずれ
- **TTFB (Time to First Byte)**：最初のバイトまでの時間

これらの指標を収集し、分析することで、実際のユーザー体験を定量的に把握できます。

```typescript
// hooks.client.ts
import { navigating } from '$app/stores';

// ナビゲーションパフォーマンスの計測
let navigationStart: number;

navigating.subscribe((nav) => {
  if (nav) {
    // ナビゲーション開始
    navigationStart = performance.now();
  } else if (navigationStart) {
    // ナビゲーション完了
    const duration = performance.now() - navigationStart;

    // パフォーマンスメトリクスの送信
    sendAnalytics({
      event: 'navigation',
      duration,
      from: nav?.from?.url.pathname,
      to: nav?.to?.url.pathname
    });

    // Core Web Vitals の計測
    if (window.web-vitals) {
      getCLS(sendToAnalytics);
      getFID(sendToAnalytics);
      getLCP(sendToAnalytics);
    }
  }
});
```

## まとめ

SvelteKitのルーティングシステムは、以下の特徴により高速で使いやすいナビゲーションを実現しています。

- **ファイルベースの直感的な定義**：設定不要で即座にルートを作成
- **効率的なマッチングアルゴリズム**：高速なルート解決
- **先進的なプリフェッチ**：遅延のないページ遷移
- **History API統合**：ネイティブなブラウザ体験
- **柔軟な最適化オプション**：ページごとの細かい制御

これらの仕組みを理解することで、よりパフォーマンスの高いアプリケーションを構築できます。

## 次のステップ

- [データロードアーキテクチャ]({base}/sveltekit/architecture/data-loading/) - Load関数の内部実装
- [レンダリングパイプライン]({base}/sveltekit/architecture/rendering-pipeline/) - コンパイルから実行までの流れ
- [基本ルーティング]({base}/sveltekit/routing/basic/) - 実践的なルーティングの使い方

:::info[関連リソース]
- [ルーティング（基礎編）]({base}/sveltekit/routing/) - 基本的な使い方
- [動的ルーティング]({base}/sveltekit/routing/dynamic/) - パラメータ付きルート
- [高度なルーティング]({base}/sveltekit/routing/advanced/) - 実践的なテクニック
:::