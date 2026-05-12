---
title: Service Workers / PWA（@vite-pwa/sveltekit 実装）
description: SvelteKit で PWA を構築する実践ガイド。@vite-pwa/sveltekit 1.1+ による Workbox 統合、registerType prompt、manifestTransforms、devOptions まで本サイトの実装をケーススタディとして TypeScript で解説
---

<script>
	import Mermaid from '$lib/components/Mermaid.svelte';

	const swArchitectureDiagram = `flowchart LR
		subgraph browser[ブラウザ]
			APP[SvelteKit App]
			REGISTER[virtual:pwa-register]
		end

		subgraph sw[Service Worker - Workbox 生成]
			PRECACHE[Precache<br/>prerendered/**/*.html]
			RUNTIME[Runtime Cache<br/>NetworkFirst / SWR]
		end

		subgraph build[ビルド時 - @vite-pwa/sveltekit]
			VITE[vite build]
			MANIFEST[manifestTransforms]
			GENSW[generateSW]
		end

		VITE --> MANIFEST
		MANIFEST --> GENSW
		GENSW --> PRECACHE
		APP --> REGISTER
		REGISTER --> sw
		APP -->|fetch| RUNTIME
		RUNTIME -->|miss| NET[ネットワーク]

		style browser fill:#e3f2fd
		style sw fill:#fff3e0
		style build fill:#e8f5e9`;
</script>

SvelteKit には素の `$service-worker` モジュールによる Service Worker サポートが組み込まれていますが、Workbox の高度なキャッシュ戦略・更新通知 UX・manifest 管理を統合したい場合は **`@vite-pwa/sveltekit`** プラグインの利用が現実的な選択肢になります。

本記事では `@vite-pwa/sveltekit` 1.1+ を軸に、本プロジェクト（[shuji-bonji/Svelte-and-SvelteKit-with-TypeScript](https://github.com/shuji-bonji/Svelte-and-SvelteKit-with-TypeScript)）の実装をケーススタディとして引用しながら、SvelteKit における PWA 構築のベストプラクティスを TypeScript で解説します。

## この記事で学べること

- `@vite-pwa/sveltekit` 1.1+ の全体像と素の `$service-worker` との違い
- `registerType: 'prompt'` による更新通知 UX 設計
- `virtual:pwa-register` を Svelte 5 Runes と組み合わせた hook
- `manifestTransforms` と `kit.trailingSlash: 'always'` の整合
- `globPatterns` で全 prerender 済み HTML を precache する戦略
- dev サーバでの SW 有効化と HMR との干渉回避
- `clientsClaim: false` / `skipWaiting: false` の UX 判断
- manifest / アイコン生成のワークフロー

## アーキテクチャ全体像

`@vite-pwa/sveltekit` は内部で `vite-plugin-pwa`（Workbox ベース）を SvelteKit 向けにラップしたプラグインです。ビルド時に `manifestTransforms` で SvelteKit 固有の URL を整形し、Workbox の `generateSW` モードで Service Worker を生成します。

<Mermaid diagram={swArchitectureDiagram} />

## `@vite-pwa/sveltekit` と素の `$service-worker` の違い

SvelteKit には標準で [`src/service-worker.ts` をバンドルする仕組み](https://svelte.jp/docs/kit/service-worker)が用意されています。シンプルな precache であれば素の `$service-worker` で十分ですが、以下の要件が出てきたら `@vite-pwa/sveltekit` が有利になります。

| 機能 | 素の `$service-worker` | `@vite-pwa/sveltekit` |
|------|----------------------|---------------------|
| precache の生成 | `build` + `files` を手で配列に詰める | Workbox の precache manifest を自動生成 |
| 更新検出 UX | 自前で `updatefound` を実装 | `virtual:pwa-register` + `workbox-window` が提供 |
| Web App Manifest | `static/manifest.json` を手書き | プラグイン設定オブジェクトから生成 |
| ランタイムキャッシュ戦略 | `fetch` イベントで自前実装 | `runtimeCaching` の宣言的設定 |
| `trailingSlash` 整合 | 手動 | `manifestTransforms` で自動 |
| dev サーバでの SW | 手動登録が必要 | `devOptions.enabled` 一発で有効化 |
| アイコン生成 | 自前 | `@vite-pwa/assets-generator` 連携 |

:::info[ハイブリッドは推奨されない]
`@vite-pwa/sveltekit` を導入すると `src/service-worker.ts` は **使われなくなる** ことに注意してください。Workbox が生成する SW が `dist/sw.js` として配置されるため、両者を同時に有効化することは想定されていません。
:::

## 基本セットアップ

### インストール

```bash
npm install -D @vite-pwa/sveltekit workbox-window
# アイコン自動生成を使う場合
npm install -D @vite-pwa/assets-generator
```

### vite.config.js

本プロジェクトの `vite.config.js` から、最小限の構成を抜粋します（全文は次節以降で順番に解説）。

```javascript
// vite.config.js
import { sveltekit } from '@sveltejs/kit/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import { defineConfig } from 'vite';

const base = process.env.BASE_PATH ?? '';

export default defineConfig({
  plugins: [
    sveltekit(),
    SvelteKitPWA({
      strategies: 'generateSW',     // Workbox の generateSW モード
      scope: `${base}/`,            // 静的サイト出力に合わせて base 配下に固定
      base: `${base}/`,
      registerType: 'prompt',       // 新版検知時にユーザーへ確認
      injectRegister: false,        // 登録は手動制御（後述）
      manifest: {
        /* ... */
      },
      workbox: {
        /* ... */
      },
      devOptions: {
        enabled: false              // dev では SW 無効（HMR 干渉回避）
      },
      kit: {
        trailingSlash: 'always'     // SvelteKit 側の trailingSlash と整合
      }
    })
  ]
});
```

:::tip[`strategies` の選択]
- `'generateSW'`: Workbox が SW を一括生成（本プロジェクトはこちら）
- `'injectManifest'`: 自前の SW ソースに precache manifest だけ注入。`navigation` などを細かく書きたい場合に有効

シンプルさを最優先するなら `'generateSW'` で十分です。
:::

## registerType: 'prompt' vs 'autoUpdate'

`registerType` は新版 SW を **どう適用するか** を決める最重要オプションです。

| 値 | 挙動 | 向く用途 |
|----|------|---------|
| `'autoUpdate'` | 新版検出時、即座に新 SW を `skipWaiting()` させ自動リロード | 管理画面など、ユーザーへの中断を許容できるアプリ |
| `'prompt'` | 新版検出時、ユーザーに「更新しますか？」と確認 | 記事・ブログ・ドキュメントなど読み中の状態を尊重したい用途 |

本プロジェクトは学習ガイドなので、**読み途中でリロードされない** `'prompt'` を採用しています。

```javascript
SvelteKitPWA({
  registerType: 'prompt',
  injectRegister: false, // 登録 UI を自前で描画するため、自動インジェクトは無効
  workbox: {
    clientsClaim: false,  // 既存タブを自動奪取しない
    skipWaiting: false    // 自動でアクティベートしない
  }
});
```

:::caution[`registerType` と `skipWaiting` の関係]
`registerType: 'autoUpdate'` でも、内部的には `skipWaiting()` を呼ぶことで即時切り替えを実現しています。逆に `'prompt'` にしたうえで `skipWaiting: true` にしてしまうと、確認 UI を出している最中に SW が切り替わって挙動が破綻します。`'prompt'` のときは **`clientsClaim: false` / `skipWaiting: false` を必ずセット** にしてください。
:::

## virtual:pwa-register / workbox-window 連携

`@vite-pwa/sveltekit` は `virtual:pwa-register` という仮想モジュールを提供し、Workbox の `registerSW` 関数を呼び出せます。本プロジェクトの `PwaUpdatePrompt.svelte` は、これを Svelte 5 の Runes と組み合わせて更新通知トーストを実装しています。

### 型定義

仮想モジュールは `svelte-check` から見えないため、`src/app.d.ts` で ambient 宣言します。

```typescript
// src/app.d.ts
declare module 'virtual:pwa-register' {
  import type { RegisterSWOptions } from 'vite-plugin-pwa/types';
  export type { RegisterSWOptions };
  export function registerSW(
    options?: RegisterSWOptions
  ): (reloadPage?: boolean) => Promise<void>;
}

declare module 'virtual:pwa-info' {
  export interface PwaInfo {
    webManifest: {
      href: string;
      useCredentials: boolean;
      linkTag: string;
    };
    registerSW?: {
      inline?: boolean;
      mode?: 'registerSW' | 'auto';
      scope?: string;
      type?: 'classic' | 'module';
      script?: string;
    };
  }
  export const pwaInfo: PwaInfo | undefined;
}
```

### Svelte 5 Runes による更新通知コンポーネント

本プロジェクトの `src/lib/components/PwaUpdatePrompt.svelte` から、コア部分を抜粋します。

```svelte
<script lang="ts">
  import { onMount } from 'svelte';

  // SW 登録状態（リアクティブ）
  let needRefresh = $state(false);
  let offlineReady = $state(false);
  let updateSW: ((reloadPage?: boolean) => Promise<void>) | undefined = $state();

  onMount(async () => {
    // SSR 時には実行しない（onMount はクライアントのみ）
    if (typeof window === 'undefined') return;

    try {
      // virtual:pwa-register は vite-plugin-pwa が提供する仮想モジュール
      const mod = await import('virtual:pwa-register');

      updateSW = mod.registerSW({
        immediate: true,
        onNeedRefresh() {
          // 新版が waiting 状態になったタイミングで呼ばれる
          needRefresh = true;
        },
        onOfflineReady() {
          // 初回 install が完了し、オフライン閲覧可能になったタイミング
          offlineReady = true;
          setTimeout(() => {
            offlineReady = false;
          }, 5000);
        },
        onRegisteredSW(_url, registration) {
          // 1 時間ごとに更新チェック（ポーリング）
          if (registration) {
            setInterval(
              () => {
                void registration.update();
              },
              60 * 60 * 1000
            );
          }
        }
      });
    } catch (err) {
      // dev 環境や SW 未対応ブラウザでは静かに失敗させる
      console.warn('[PWA] SW registration skipped:', err);
    }
  });

  function handleReload() {
    needRefresh = false;
    // updateSW(true) で skipWaiting + reload が走る
    void updateSW?.(true);
  }
</script>

{#if needRefresh}
  <div class="pwa-toast" role="alert" aria-live="polite">
    <strong>新しいバージョンがあります</strong>
    <button onclick={handleReload}>更新</button>
    <button onclick={() => (needRefresh = false)}>後で</button>
  </div>
{/if}

{#if offlineReady}
  <div class="pwa-toast" role="status" aria-live="polite">
    <strong>オフライン対応の準備ができました</strong>
  </div>
{/if}
```

:::tip[`updateSW(true)` の意味]
`registerSW` が返す関数を `updateSW(true)` のように呼ぶと、内部で `skipWaiting()` メッセージを SW に送ったあと、`controllerchange` を待ってページをリロードします。これにより **ユーザーが「更新」を押した瞬間に確実に新版へ切り替わる** ことが保証されます。
:::

### レイアウトでの呼び出し

`src/routes/+layout.svelte` でコンポーネントを配置するだけです。

```svelte
<script lang="ts">
  import PwaUpdatePrompt from '$lib/components/PwaUpdatePrompt.svelte';
  import type { Snippet } from 'svelte';

  let { children }: { children: Snippet } = $props();
</script>

{@render children()}

<PwaUpdatePrompt />
```

## manifestTransforms と trailingSlash 整合

本プロジェクトは `svelte.config.js` で `paths.relative: false` を使い、また URL の末尾には常にスラッシュを付ける運用です（`adapter-static` + `prerender.entries: ['*']` で全ページ事前生成）。

`@vite-pwa/sveltekit` は `kit.trailingSlash: 'always'` を指定すると、Workbox の `manifestTransforms` を自動挿入して precache 対象の URL に末尾スラッシュを付与します。

```javascript
SvelteKitPWA({
  /* ... */
  kit: {
    // SvelteKit 側の trailingSlash 設定と揃える
    // 'always' を指定すると prerendered HTML の URL が `/foo/` 形式に変換される
    trailingSlash: 'always'
  }
});
```

:::warning[`navigateFallback` を明示的に書かない]
プラグインは自動で `navigateFallback` を `${base}/` （= manifestTransforms 後の root index.html URL）に設定します。`workbox.navigateFallback` を独自に書き換えると、precache manifest と URL がズレて Workbox の **`non-precached-url` エラー** が発生しやすくなります。デフォルトに任せましょう。
:::

## globPatterns 戦略：全 prerender HTML を precache

本プロジェクトでは記事ページのリロード時に「トップに戻ってしまう」現象を防ぐため、**すべての prerender 済み HTML を precache** する戦略を採用しています。

```javascript
workbox: {
  globPatterns: [
    'client/**/*.{js,css,ico,png,svg,webp,woff,woff2,webmanifest}',
    'prerendered/**/*.html'
  ],
  // 記事 HTML が大きめになるため上限を引き上げ
  maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
  globIgnores: ['**/sw*', '**/workbox-*', 'server/**'],
  navigateFallbackDenylist: [
    /^\/api\//,
    /sw\.js$/,
    /sitemap\.xml$/
  ]
}
```

:::info[なぜ全 HTML を precache するのか]
`@vite-pwa/sveltekit` のデフォルト挙動では、ナビゲーションリクエストはすべて `navigateFallback`（= root index.html）にフォールバックします。SvelteKit のクライアントルータは URL を見てハイドレーションするため理屈の上では動きますが、**リロード時にハイドレーションがトップページの状態から始まる**ため UX が破綻します。

各 URL ごとに専用の HTML を precache しておくと、リロード時もそのページの HTML が直接返り、ハイドレーションも正しい位置から始まります。サイズは増えますが、静的サイトであれば許容範囲です。
:::

### runtimeCaching の例

precache に乗らない動的リソース（外部画像、Google Fonts など）は `runtimeCaching` でカバーします。

```javascript
runtimeCaching: [
  {
    // 記事ページ HTML: ネットワーク優先、失敗時はキャッシュ
    urlPattern: ({ request, url }) =>
      request.destination === 'document' &&
      url.origin === self.location.origin,
    handler: 'NetworkFirst',
    options: {
      cacheName: 'pages-cache',
      expiration: {
        maxEntries: 100,
        maxAgeSeconds: 60 * 60 * 24 * 30 // 30 日
      },
      networkTimeoutSeconds: 3
    }
  },
  {
    // 同一オリジンの画像
    urlPattern: ({ request, url }) =>
      request.destination === 'image' &&
      url.origin === self.location.origin,
    handler: 'StaleWhileRevalidate',
    options: {
      cacheName: 'images-cache',
      expiration: {
        maxEntries: 100,
        maxAgeSeconds: 60 * 60 * 24 * 60
      }
    }
  },
  {
    // Google Fonts
    urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
    handler: 'CacheFirst',
    options: {
      cacheName: 'fonts-cache',
      expiration: {
        maxEntries: 30,
        maxAgeSeconds: 60 * 60 * 24 * 365
      }
    }
  }
]
```

| handler | 戦略 | 主な用途 |
|---------|------|---------|
| `NetworkFirst` | ネットワーク優先、失敗時キャッシュ | 動的 HTML、API レスポンス |
| `CacheFirst` | キャッシュ優先 | フォント、不変な静的アセット |
| `StaleWhileRevalidate` | キャッシュ即返し + 裏で更新 | 画像、滅多に変わらない記事サムネ |
| `NetworkOnly` | 常にネットワーク | 認証 API |
| `CacheOnly` | 常にキャッシュ | 完全オフライン専用リソース |

## dev サーバでの SW 有効化と HMR 干渉

`devOptions.enabled: true` を指定すると、`vite dev` 中にも Service Worker が動作します。

```javascript
devOptions: {
  enabled: true,
  type: 'module',
  navigateFallback: '/'
}
```

ただし、HMR と Service Worker は **キャッシュレイヤーが衝突する** ため、開発体験を著しく損なうケースがあります。

:::caution[本プロジェクトでは dev では SW を無効化]
本プロジェクトは `devOptions.enabled: false` にしています。理由は次のとおりです。

1. HMR で更新された JS/CSS が古いキャッシュから返されると、変更が反映されない
2. `vite dev` は `prerendered/**/*.html` を生成しないため、precache manifest が空になり挙動が異なる
3. デバッグのたびに DevTools の「Application > Service Workers > Unregister」が必要になる

PWA の最終確認は `npm run build && npm run preview` で行うのが現実的です。
:::

### dev で SW を有効化する場合の対策

どうしても dev で動かす場合は、次の対策が有効です。

- DevTools の「Application > Service Workers > Update on reload」を有効にする
- 「Bypass for network」をオンにして SW を一時的に迂回
- `vite dev` 起動時に毎回 Unregister するスクリプトを用意

## clientsClaim / skipWaiting の UX 設計

これらは Workbox の SW に渡るオプションで、「新版 SW がいつ既存タブを支配するか」を制御します。

| オプション | デフォルト | 意味 |
|-----------|----------|------|
| `skipWaiting` | `false` | `true` だと新版 SW が install 完了と同時にアクティベート（waiting フェーズをスキップ）|
| `clientsClaim` | `false` | `true` だと新版 SW がアクティベート直後に **既存タブ** を奪う（`Clients.claim()`）|

### 自動更新（managed app など）

ユーザー操作を待たずに最新版に揃えたい場合。

```javascript
SvelteKitPWA({
  registerType: 'autoUpdate',
  workbox: {
    clientsClaim: true,
    skipWaiting: true
  }
});
```

### ユーザー確認型（本プロジェクト採用）

読み中の状態を尊重し、明示的な「更新」操作を待つ。

```javascript
SvelteKitPWA({
  registerType: 'prompt',
  workbox: {
    clientsClaim: false,
    skipWaiting: false
  }
});
```

:::tip[ハイブリッド方針]
「初回インストール直後は自動で完了させたいが、その後の更新は確認を取りたい」というケースでは、`registerSW` の `onOfflineReady` で初回フラグを記憶する設計が有効です。Workbox 側は `clientsClaim: false / skipWaiting: false` のまま、`updateSW(true)` 呼び出し条件を JS 側で制御します。
:::

## Web App Manifest

`manifest` オプションに JSON 相当のオブジェクトを渡すと、ビルド時に `manifest.webmanifest` が自動生成されます。

```javascript
manifest: {
  name: 'TypeScriptで学ぶ Svelte 5/SvelteKit 完全マスター学習ガイド',
  short_name: 'Svelte & Kit Guide',
  description:
    'TypeScript による Svelte 5 / SvelteKit の日本語完全学習ガイド',
  lang: 'ja',
  dir: 'ltr',
  start_url: `${base}/`,
  scope: `${base}/`,
  display: 'standalone',
  orientation: 'portrait-primary',
  theme_color: '#ff3e00',
  background_color: '#1a1a1a',
  categories: ['education', 'developer', 'books'],
  icons: [
    {
      src: `${base}/icon-192.png`,
      sizes: '192x192',
      type: 'image/png',
      purpose: 'any'
    },
    {
      src: `${base}/icon-512.png`,
      sizes: '512x512',
      type: 'image/png',
      purpose: 'any'
    },
    {
      src: `${base}/icon-maskable-512.png`,
      sizes: '512x512',
      type: 'image/png',
      purpose: 'maskable'
    }
  ]
}
```

### app.html のメタタグ

`manifest.webmanifest` への参照と、iOS Safari 向けのメタタグは `src/app.html` で明示します（本プロジェクトの実装）。

```html
<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />

    <!-- Favicons -->
    <link rel="icon" href="%sveltekit.assets%/favicon.ico" sizes="any" />
    <link rel="apple-touch-icon" sizes="180x180"
          href="%sveltekit.assets%/apple-touch-icon.png" />

    <!-- PWA -->
    <link rel="manifest" href="%sveltekit.assets%/manifest.webmanifest" />
    <meta name="theme-color" content="#ff3e00" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="Svelte & Kit Guide" />
    <meta name="application-name" content="Svelte & Kit Guide" />

    %sveltekit.head%
  </head>
  <body data-sveltekit-preload-data="hover">
    <div style="display: contents">%sveltekit.body%</div>
  </body>
</html>
```

:::info[`pwaAssets.disabled: true` の意味]
本プロジェクトは `pwaAssets: { disabled: true }` を指定し、`static/` に手動配置したアイコンを使用しています。`@vite-pwa/assets-generator` で生成済みのファイルがあるため、ビルド時の再生成は不要です。
:::

## アイコン生成のワークフロー（@vite-pwa/assets-generator）

192 / 512 / maskable / Apple Touch Icon を 1 枚の SVG から一括生成できます。

### インストールと設定

```bash
npm install -D @vite-pwa/assets-generator
```

プロジェクト直下に `pwa-assets.config.ts` を置きます。

```typescript
// pwa-assets.config.ts
import {
  defineConfig,
  minimal2023Preset as preset
} from '@vite-pwa/assets-generator/config';

export default defineConfig({
  headLinkOptions: {
    preset: '2023'
  },
  preset,
  images: ['static/logo.svg']
});
```

### 生成コマンド

```bash
npx pwa-assets-generator
```

これで以下が `static/` 配下に出力されます。

- `favicon.ico`、`favicon-16.png`、`favicon-32.png`
- `apple-touch-icon.png`
- `icon-192.png`、`icon-512.png`
- `icon-maskable-192.png`、`icon-maskable-512.png`

:::tip[CI への組み込み]
ロゴ SVG を更新したときだけ走らせれば十分なので、`npm run` スクリプトに `"pwa:assets": "pwa-assets-generator"` を追加し、デザイン変更時に手動実行する運用がシンプルです。本プロジェクトもこの方針です。
:::

## トラブルシューティング

### `non-precached-url` エラーが出る

precache manifest に含まれていない URL が `navigateFallback` に指定されています。`navigateFallback` を明示的に書かず、プラグインのデフォルトに任せてください。

### リロードでトップに戻る

`globPatterns` に `prerendered/**/*.html` が含まれていないか、`manifestTransforms` の trailingSlash 設定がずれています。本記事の戦略どおりに設定すれば解消します。

### 新版が反映されない

`registerType: 'prompt'` 採用時は **必ず `updateSW(true)`** を呼ぶこと。引数なしの `updateSW()` だと `skipWaiting()` が走らず、既存タブを閉じるまで反映されません。

### dev で SW が消えない

DevTools「Application > Service Workers > Unregister」で明示的に解除するか、シークレットウィンドウで開発するのが確実です。

## まとめ

`@vite-pwa/sveltekit` を採用すると、SvelteKit の prerender 出力・base path・trailingSlash と Workbox の precache manifest を自動で整合させながら、Svelte 5 Runes 流の更新通知 UI を組めます。

- 素の `$service-worker` で足りるならそれが最もシンプル
- 高度な戦略・更新 UX が欲しいなら `@vite-pwa/sveltekit`
- 「読み途中で勝手にリロードしない」UX を作るなら `registerType: 'prompt'` + `clientsClaim: false`
- precache 戦略は `prerendered/**/*.html` を全部入りにするのが SvelteKit と相性が良い

本プロジェクトのソースコード（[`vite.config.js`](https://github.com/shuji-bonji/Svelte-and-SvelteKit-with-TypeScript/blob/main/vite.config.js) / [`PwaUpdatePrompt.svelte`](https://github.com/shuji-bonji/Svelte-and-SvelteKit-with-TypeScript/blob/main/src/lib/components/PwaUpdatePrompt.svelte) / [`app.d.ts`](https://github.com/shuji-bonji/Svelte-and-SvelteKit-with-TypeScript/blob/main/src/app.d.ts) / [`app.html`](https://github.com/shuji-bonji/Svelte-and-SvelteKit-with-TypeScript/blob/main/src/app.html)）も併せて参照してください。

## 次のステップ

- [キャッシュ戦略](/sveltekit/optimization/caching/) - より詳細なキャッシュ設定
- [observability](/sveltekit/optimization/observability/) - 本番監視と性能計測
- [ビルド最適化](/sveltekit/optimization/build-optimization/) - ビルド設定の最適化

## 参考リンク

- [@vite-pwa/sveltekit ドキュメント](https://vite-pwa-org.netlify.app/frameworks/sveltekit.html)
- [Workbox: Caching Strategies](https://developer.chrome.com/docs/workbox/caching-strategies-overview)
- [SvelteKit 公式: Service workers](https://svelte.jp/docs/kit/service-workers)
- [MDN: Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers)
- [web.dev: Learn PWA](https://web.dev/learn/pwa/)
