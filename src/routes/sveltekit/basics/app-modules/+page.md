---
title: $appモジュール
description: SvelteKitの組み込み$appモジュール完全ガイド - TypeScriptで$app/stores、$app/navigation、$app/environment、$app/pathsを解説
---

<script lang="ts">
  import Mermaid from '$lib/components/Mermaid.svelte';
  
  // モジュール関係の図
  const modulesDiagram = `graph LR
    subgraph "$app モジュール群"
      state["$app/state<br/>Svelte 5 Runes対応状態管理<br/>(推奨)"]
      stores["$app/stores<br/>レガシーストアAPI"]
      navigation["$app/navigation<br/>プログラマティックなナビゲーション"]
      environment["$app/environment<br/>実行環境の判定"]
      paths["$app/paths<br/>ベースパスとアセット管理"]
      forms["$app/forms<br/>Progressive Enhancement"]
    end

    subgraph "使用場所"
      page["+page.svelte"]
      layout["+layout.svelte"]
      component["通常のコンポーネント"]
      universal["+page.ts / +layout.ts"]
    end

    state --> page
    state --> layout
    state --> component
    stores --> page
    stores --> layout
    stores --> component
    navigation --> page
    navigation --> component
    environment --> universal
    environment --> component
    paths --> component
    forms --> page

    style state fill:#22c55e,color:#fff
    style stores fill:#94a3b8,color:#fff
    style navigation fill:#4ecdc4,color:#fff
    style environment fill:#45b7d1,color:#fff
    style paths fill:#96ceb4,color:#fff
    style forms fill:#ffeaa7,color:#333`;
</script>

SvelteKitは`$app/`というプレフィックスを持つ組み込みモジュール群を提供しています。これらはSvelteKitアプリケーション内でのみ使用可能な特別なモジュールです。

## モジュール一覧

<Mermaid diagram={modulesDiagram} />

## $app/state (Svelte 5推奨)

**Svelte 5のルーンと連携するリアクティブ状態管理** - SvelteKit 2.12+で導入された、Runesシステムとより自然に統合される新しいモジュール。

### 利用可能な状態

```typescript
import {
  page,        // 現在のページ情報
  navigating,  // ナビゲーション状態
  updated      // アプリ更新状態
} from '$app/state';

// 直接アクセス可能（$プレフィックス不要）
console.log(page.url.pathname);
console.log(page.params.id);
```

## $app/stores (レガシー)

**従来のストアベースの状態管理** - Svelte 4互換性のために残されているAPI。新規プロジェクトでは`$app/state`の使用を推奨。

### 利用可能なストア

```typescript
import {
  page,        // 現在のページ情報
  navigating,  // ナビゲーション状態
  updated,     // アプリ更新状態
  getStores    // ストアの直接取得
} from '$app/stores';

// ストアの$プレフィックスでアクセス
console.log($page.url.pathname);
console.log($page.params.id);
```

### page - 現在のページ情報

#### $app/state での使用（推奨）

```svelte
<script lang="ts">
  import { page } from '$app/state';
</script>

<!-- 直接アクセス -->
<p>現在のURL: {page.url.pathname}</p>
<p>クエリパラメータ: {page.url.searchParams.toString()}</p>
<p>ルートID: {page.route.id}</p>

{#if page.error}
  <p>エラー: {page.error.message}</p>
{/if}
```

#### $app/stores での使用（レガシー）

```svelte
<script lang="ts">
  import { page } from '$app/stores';
</script>

<!-- $プレフィックスでアクセス -->
<p>現在のURL: {$page.url.pathname}</p>
<p>クエリパラメータ: {$page.url.searchParams.toString()}</p>
<p>ルートID: {$page.route.id}</p>

{#if $page.error}
  <p>エラー: {$page.error.message}</p>
{/if}
```

#### pageのプロパティ
```typescript
interface Page {
  url: URL;           // 現在のURL
  params: Record<string, string>; // ルートパラメータ
  route: {
    id: string | null; // ルートID（例: '/blog/[slug]'）
  };
  status: number;     // HTTPステータスコード
  error: App.Error | null; // エラー情報
  data: App.PageData; // load関数の結果
  form: any;          // form actionsの結果
  state: App.PageState; // History APIの状態
}
```

### navigating - ナビゲーション状態

現在のナビゲーション状態を表します。ナビゲーション中は値を持ち、完了後はnullになります。

#### $app/state での使用（推奨）

```svelte
<script lang="ts">
  import { navigating } from '$app/state';
</script>

{#if navigating}
  <div class="loading">
    <p>Loading...</p>
    <p>From: {navigating.from?.url.pathname}</p>
    <p>To: {navigating.to?.url.pathname}</p>
    <p>Type: {navigating.type}</p>
  </div>
{/if}
```

#### $app/stores での使用（レガシー）

```svelte
<script lang="ts">
  import { navigating } from '$app/stores';
</script>

{#if $navigating}
  <div class="loading">
    <p>Loading...</p>
    <p>From: {$navigating.from?.url.pathname}</p>
    <p>To: {$navigating.to?.url.pathname}</p>
    <p>Type: {$navigating.type}</p>
  </div>
{/if}
```

#### navigatingのプロパティ
```typescript
interface Navigation {
  from: { 
    params: Record<string, string>;
    route: { id: string | null };
    url: URL;
  } | null;
  to: {
    params: Record<string, string>; 
    route: { id: string | null };
    url: URL;
  } | null;
  type: 'popstate' | 'link' | 'goto' | 'enter' | 'leave';
  willUnload: boolean;
  delta?: number;
  complete: Promise<void>;
}
```

### updated - アプリ更新状態

アプリケーションの新しいバージョンが利用可能かを示します。

#### $app/state での使用（推奨）

```svelte
<script lang="ts">
  import { updated } from '$app/state';

  $effect(() => {
    if (updated) {
      alert('新しいバージョンが利用可能です。リロードしてください。');
    }
  });
</script>
```

#### $app/stores での使用（レガシー）

```svelte
<script lang="ts">
  import { updated } from '$app/stores';
  
  $effect(() => {
    if ($updated) {
      alert('新しいバージョンが利用可能です。リロードしてください。');
    }
  });
</script>
```

## $app/navigation

**プログラマティックなナビゲーション機能** - JavaScriptからのページ遷移制御。

### 利用可能な関数

```typescript
import {
  goto,              // ページ遷移
  invalidate,        // データ再取得
  invalidateAll,     // 全データ再取得
  preloadCode,       // コードの事前読み込み
  preloadData,       // データの事前読み込み
  afterNavigate,     // ナビゲーション後フック
  beforeNavigate,    // ナビゲーション前フック
  onNavigate,        // View Transitions API
  disableScrollHandling, // スクロール制御の無効化
  pushState,         // History APIのpushState
  replaceState       // History APIのreplaceState
} from '$app/navigation';
```

### goto - ページ遷移

```typescript
// 基本的な使い方
await goto('/about');

// オプション付き
await goto('/products', {
  replaceState: true,     // 履歴を置き換え
  noScroll: true,         // スクロールしない
  keepFocus: true,        // フォーカスを維持
  invalidateAll: true     // 全データを再取得
});

// 外部URLへの遷移（window.location）
await goto('https://example.com');
```

### invalidate - 特定データの再取得

```typescript
// URLパターンで無効化
await invalidate('/api/user');

// 関数で条件指定
await invalidate((url) => url.pathname.startsWith('/api/'));

// load関数内でdependsと組み合わせ
export const load = async ({ depends }) => {
  depends('app:user');
  return { user: await getUser() };
};

// コンポーネントから無効化
await invalidate('app:user');
```

### ナビゲーションフック

```typescript
// ナビゲーション前の処理
beforeNavigate(({ from, to, cancel }) => {
  if (hasUnsavedChanges && !confirm('変更を破棄しますか？')) {
    cancel();
  }
});

// ナビゲーション後の処理
afterNavigate(({ from, to, type }) => {
  // Google Analyticsなどにページビューを送信
  gtag('event', 'page_view', {
    page_path: to?.url.pathname
  });
});

// View Transitions API（実験的）
onNavigate((navigation) => {
  if (!document.startViewTransition) return;
  
  return new Promise((resolve) => {
    document.startViewTransition(async () => {
      resolve();
      await navigation.complete;
    });
  });
});
```

## $app/environment

**実行環境の判定** - ブラウザかサーバーか、開発環境かプロダクションかを判定。

```typescript
import {
  browser,     // ブラウザで実行中か
  building,    // ビルド中か
  dev,         // 開発モード
  version      // アプリのバージョン
} from '$app/environment';
```

### 使用例

実際のアプリケーションでは、これらの環境変数を組み合わせて、適切な処理の分岐を行います。以下の例では、ブラウザ環境でのみCanvas要素をレンダリングし、SSR時には代替画像を表示しています。

```svelte
<script lang="ts">
  import { browser, dev } from '$app/environment';
  import { onMount } from 'svelte';
  
  // ブラウザでのみ実行
  if (browser) {
    // localStorage、window、documentなどにアクセス可能
    const theme = localStorage.getItem('theme');
  }
  
  // 開発環境でのみデバッグ情報を表示
  if (dev) {
    console.log('Debug mode enabled');
  }
</script>

{#if browser}
  <!-- クライアントサイドでのみレンダリング -->
  <canvas></canvas>
{:else}
  <!-- SSR時のフォールバック -->
  <img src="/placeholder.png" alt="Canvas placeholder" />
{/if}
```

## $app/paths

**パス管理** - ベースパスとアセットパスの管理。

```typescript
import {
  base,     // アプリのベースパス
  assets    // アセットのベースパス
} from '$app/paths';
```

### 使用例

パスの値は、リンクや画像、スタイルシートなどのURLを構築する際に使用します。これにより、デプロイ環境に依存しない柔軟なアプリケーションを構築できます。

```svelte
<script lang="ts">
  import { base, assets } from '$app/paths';
</script>

<!-- ベースパスを考慮したリンク -->
<a href="{base}/about">About</a>
<a href="{base}/products">Products</a>

<!-- アセットパス -->
<img src="{assets}/images/logo.png" alt="Logo" />
<link rel="stylesheet" href="{assets}/styles/global.css" />
```

#### 設定例

`svelte.config.js`:
```javascript
export default {
  kit: {
    paths: {
      base: '/my-app',        // サブディレクトリでホスト
      assets: 'https://cdn.example.com' // CDNからアセット配信
    }
  }
};
```

## $app/forms

**Progressive Enhancement** - JavaScriptなしでも動作するフォーム拡張。

```typescript
import {
  enhance,        // フォームの拡張
  applyAction,    // アクション結果の適用
  deserialize     // FormDataのデシリアライズ
} from '$app/forms';
```

### enhance - フォームの拡張

```svelte
<script lang="ts">
  import { enhance } from '$app/forms';
  
  let loading = false;
</script>

<form
  method="POST"
  use:enhance={({
    formElement,
    formData,
    action,
    cancel,
    submitter
  }) => {
    // 送信前の処理
    loading = true;
    
    // バリデーション
    if (!formData.get('email')) {
      cancel();
      alert('メールアドレスは必須です');
      return;
    }
    
    // 送信後の処理を返す
    return async ({ result, update }) => {
      loading = false;
      
      if (result.type === 'success') {
        // 成功時の処理
        alert('送信完了');
      }
      
      // デフォルトの動作を実行
      await update();
    };
  }}
>
  <input type="email" name="email" required />
  <button disabled={loading}>
    {loading ? '送信中...' : '送信'}
  </button>
</form>
```

## 型定義とカスタマイズ

### app.d.ts での型拡張

```typescript
// src/app.d.ts
declare global {
  namespace App {
    interface Error {
      code?: string;
      details?: unknown;
    }
    
    interface Locals {
      user?: {
        id: string;
        name: string;
        role: 'admin' | 'user';
      };
    }
    
    interface PageData {
      // ページデータの型を定義
    }
    
    interface PageState {
      // History API状態の型を定義
    }
    
    interface Platform {
      // プラットフォーム固有の型
    }
  }
}

export {};
```

## よくあるパターン

### 認証状態の管理

```typescript
// stores/auth.svelte.ts
import { page } from '$app/stores';
import { derived } from 'svelte/store';

export const user = derived(page, ($page) => $page.data.user);
export const isAuthenticated = derived(user, ($user) => !!$user);
```

### ローディング表示

```svelte
<script lang="ts">
  import { navigating } from '$app/stores';
  
  let progress = $state(0);
  
  $effect(() => {
    if ($navigating) {
      // プログレスバーのシミュレーション
      progress = 0;
      const interval = setInterval(() => {
        progress = Math.min(progress + 10, 90);
      }, 100);
      
      return () => {
        clearInterval(interval);
        progress = 100;
        setTimeout(() => progress = 0, 200);
      };
    }
  });
</script>

{#if progress > 0}
  <div class="progress-bar" style="width: {progress}%" />
{/if}
```

### 現在ページのハイライト

#### $app/storesを使用（従来の方法）

```svelte
<script lang="ts">
  import { page } from '$app/stores';

  const links = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' }
  ];
</script>

<nav>
  {#each links as link}
    <a
      href={link.href}
      class:active={$page.url.pathname === link.href}
    >
      {link.label}
    </a>
  {/each}
</nav>

<style>
  .active {
    font-weight: bold;
    color: var(--primary);
  }
</style>
```

#### $app/stateを使用（Svelte 5推奨）

```svelte
<script lang="ts">
  import { page } from '$app/state';

  const links = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' }
  ];

  // $derivedを使用してリアクティブな値を作成
  let currentPath = $derived(page.url.pathname);

  // または、直接比較する関数を作成
  function isActive(href: string) {
    return page.url.pathname === href;
  }
</script>

<nav>
  {#each links as link}
    <!-- 方法1: $derivedを使用 -->
    <a
      href={link.href}
      class:active={currentPath === link.href}
    >
      {link.label}
    </a>

    <!-- 方法2: 関数を使用 -->
    <a
      href={link.href}
      class:active={isActive(link.href)}
    >
      {link.label}
    </a>
  {/each}
</nav>
```

## 注意事項

:::warning[サーバーサイドでの使用制限]
`$app/stores`と`$app/navigation`の多くの機能はブラウザでのみ動作します。サーバーサイドで使用する場合は`browser`チェックが必要です。
:::

:::tip[インポートパスの自動補完]
VS Codeなどのエディタでは、`$app/`で始まるインポートは自動補完されます。TypeScript設定が正しければ型情報も提供されます。
:::

## まとめ

SvelteKitの`$app`モジュール群は、

- **統一されたAPI**: アプリケーション全体で使える標準化されたインターフェース
- **型安全**: TypeScriptによる完全な型サポート
- **リアクティブ**: Svelteのストアシステムと統合
- **Progressive Enhancement**: JavaScriptが無効でも動作

これらのモジュールを適切に活用することで、よりネイティブなSvelteKitアプリケーションを構築できます。

## 新しいモジュール (SvelteKit 2.x)

### $app/state (2.12+)

Svelte 5のルーンと連携する新しいリアクティブ状態管理モジュールです。`$app/stores`と同じ情報を提供しますが、Svelte 5のルーンとより自然に統合されます。

#### 基本的な使い方

```typescript
import { page, navigating, updated } from '$app/state';

// 直接アクセス（.currentは不要）
console.log(page.url.pathname);
console.log(page.params.id);
```

#### $app/storesとの主な違い

##### 1. アクセス方法の違い
```svelte
<!-- $app/stores: ストアの$プレフィックスが必要 -->
<script lang="ts">
  import { page } from '$app/stores';
</script>
<p>現在: {$page.url.pathname}</p>

<!-- $app/state: 直接アクセス -->
<script lang="ts">
  import { page } from '$app/state';
</script>
<p>現在: {page.url.pathname}</p>
```

##### 2. リアクティビティの違い
```typescript
// $app/stores: $:またはsubscribe
import { page } from '$app/stores';
$: currentPath = $page.url.pathname;

// $app/state: $derivedを使用
import { page } from '$app/state';
let currentPath = $derived(page.url.pathname);
```

##### 3. エフェクトでの使用
```typescript
// $app/stores
import { page } from '$app/stores';
$effect(() => {
  console.log($page.url.pathname);
});

// $app/state
import { page } from '$app/state';
$effect(() => {
  console.log(page.url.pathname);
});
```

#### 実践的な例：動的なメタタグ更新

```svelte
<script lang="ts">
  import { page } from '$app/state';

  // ページタイトルを動的に生成
  let pageTitle = $derived(
    page.url.pathname === '/'
      ? 'ホーム'
      : `${page.url.pathname.slice(1)} - サイト名`
  );

  // メタディスクリプションを動的に生成
  let description = $derived.by(() => {
    const path = page.url.pathname;
    if (path === '/') return 'サイトのトップページです';
    if (path.startsWith('/blog/')) return 'ブログ記事のページです';
    return '詳細ページです';
  });
</script>

<svelte:head>
  <title>{pageTitle}</title>
  <meta name="description" content={description} />
</svelte:head>
```

:::tip[移行のポイント]
`$app/stores`から`$app/state`への移行は、主に以下の変更が必要です。
1. `$`プレフィックスを削除
2. リアクティブな値には`$derived`を使用
3. ストアのサブスクリプションは不要
:::

### $app/server (2.27+, 実験的)

リモート関数機能を提供する新しいモジュールです。クライアントからサーバー関数を型安全に呼び出すことができます。

```typescript
import { query, command } from '$app/server';

// サーバーでのみ実行されるクエリ
 export const getWeather = query(async () => {
  const data = await fetchWeatherFromAPI();
  return data;
});

// クライアントから呼び出し
const weather = await getWeather();
```

:::warning[実験的機能]
`$app/server`は実験的機能で、設定で明示的に有効化する必要があります。
:::

## 次のステップ

- [ルーティング](/sveltekit/routing/) - ルーティングシステムの詳細
- [データ取得](/sveltekit/data-loading/) - load関数との連携
- [フォーム処理](/sveltekit/server/forms/) - Form Actionsの実装