---
title: SvelteKitプレースホルダー
description: SvelteKitのHTMLテンプレートで使用できるすべてのプレースホルダーを徹底解説 - %sveltekit.head%、%sveltekit.nonce%、環境変数などの使い方と参照元をTypeScriptで実装
---

<script>
  import Mermaid from '$lib/components/Mermaid.svelte';
  
  const placeholderFlowDiagram = `flowchart TB
    subgraph Build["🔧 ビルド時"]
        Config[svelte.config.js]
        Env[環境変数<br/>PUBLIC_*]
        CSP[CSP設定]
    end
    
    subgraph Templates["📄 HTMLテンプレート"]
        AppHTML[app.html]
        ErrorHTML[error.html]
    end
    
    subgraph Runtime["⚡ ランタイム"]
        Server[サーバー処理]
        Client[クライアント処理]
    end
    
    Config --> AppHTML
    Env --> AppHTML
    CSP --> AppHTML
    
    Config --> ErrorHTML
    
    AppHTML --> Server
    Server --> Client
    ErrorHTML --> Server
    
    style AppHTML fill:#ff3e00,color:#fff
    style ErrorHTML fill:#ff6b6b,color:#fff
    style Server fill:#4CAF50,color:#fff`;

  const placeholderReplacementDiagram = `sequenceDiagram
    participant U as 👤 ユーザー
    participant S as 🖥️ SvelteKitサーバー
    participant T as 📄 HTMLテンプレート
    participant C as 💻 クライアント
    
    U->>S: ページリクエスト
    activate S
    S->>T: テンプレート読み込み
    
    Note over S,T: プレースホルダー置換処理
    S->>S: %lang% → 言語設定
    S->>S: %sveltekit.assets% → アセットパス
    S->>S: %sveltekit.nonce% → CSP nonce生成
    S->>S: %sveltekit.env.* → 環境変数
    S->>S: %sveltekit.head% → headコンテンツ
    S->>S: %sveltekit.body% → bodyコンテンツ
    
    S-->>C: 置換済みHTML送信
    deactivate S
    C-->>U: ページ表示`;
</script>

SvelteKitのプレースホルダーは、HTMLテンプレート内で動的な値を埋め込むための特別な構文です。このページでは、すべてのプレースホルダーの詳細な仕様と使用方法を解説します。

## プレースホルダーの仕組み

<Mermaid diagram={placeholderFlowDiagram} />

プレースホルダーは**ビルド時またはレンダリング時**にSvelteKitによって実際の値に置換されます。これらは文字列のテンプレートリテラルであり、JavaScriptコード内では使用できません。

## 全プレースホルダー一覧

:::tip[📋 クイックナビゲーション]
プレースホルダー名をクリックすると、詳細説明にジャンプします。
:::

| 使用可能ファイル | プレースホルダー | 用途 | 参照元 |
|---------------|------------|------|--------|
|  app.html |
||  [`%lang%`](#1.-lang-プレースホルダー)  | HTML言語属性 | hooks.server.tsまたはデフォルト"en" |
||  [`%sveltekit.assets%`](#2.-sveltekit.assets-プレースホルダー) | 静的アセットパス | svelte.config.jsのpaths.assets |
||  [`%sveltekit.head%`](#3.-sveltekit.head-プレースホルダー) | ページ固有のhead要素 | `<svelte:head>`やload関数 |
||  [`%sveltekit.body%`](#4.-sveltekit.body-プレースホルダー) | アプリケーション本体 | ルート/ページコンポーネント |
||  [`%sveltekit.nonce%`](#5.-sveltekit.nonce-プレースホルダー) |  CSP nonce値 | CSP設定から自動生成 |
||  [`%sveltekit.env.[NAME]%`](#6.-sveltekit.env.name-プレースホルダー) | 公開環境変数 | PUBLIC_で始まる環境変数 |
|  error.html |
||  [`%sveltekit.status%`](#7.-sveltekit.status-プレースホルダー) | HTTPステータス | エラーステータスコード |
||  [`%sveltekit.error.message%`](#8.-sveltekit.error.message-プレースホルダー) | エラーメッセージ | エラーオブジェクト |


## app.html用プレースホルダー

### 基本プレースホルダー

#### 1. lang プレースホルダー

**構文**: `%lang%`  
**用途**: HTML要素の言語属性を設定  
**参照元**: `hooks.server.ts`の`handle`関数で設定可能  
**デフォルト値**: `"en"`

```html
<!-- app.html -->
<!DOCTYPE html>
<html lang="%lang%">
```

```typescript
// hooks.server.ts で言語を動的に設定
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  // クッキーやヘッダーから言語を判定
  const lang = event.cookies.get('lang') || 
                event.request.headers.get('accept-language')?.split(',')[0] || 
                'ja';
  
  return await resolve(event, {
    transformPageChunk: ({ html }) => html.replace('%lang%', lang)
  });
};
```

#### 2. sveltekit.assets プレースホルダー

**構文**: `%sveltekit.assets%`  
**用途**: 静的アセットへのベースパス  
**参照元**: `svelte.config.js`の`paths.assets`設定  
**デフォルト値**: `paths.base`への相対パス

```html
<!-- app.html -->
<link rel="icon" href="%sveltekit.assets%/favicon.png" />
```

```javascript
// svelte.config.js での設定
const config = {
  kit: {
    paths: {
      base: '/my-app',
      assets: 'https://cdn.example.com' // CDN使用時
    }
  }
};
```

#### 3. sveltekit.head プレースホルダー

**構文**: `%sveltekit.head%`  
**用途**: ページ固有のhead要素（meta、link、script等）  
**参照元**: 
- 各ページの`<svelte:head>`ブロック
- Load関数から返される`meta`タグ
- SvelteKitが自動生成するプリロードヒント

```html
<!-- app.html -->
<head>
  <meta charset="utf-8" />
  <link rel="icon" href="%sveltekit.assets%/favicon.png" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  %sveltekit.head%
</head>
```

```svelte
<!-- +page.svelte -->
<svelte:head>
  <title>ページタイトル</title>
  <meta name="description" content="ページの説明" />
</svelte:head>
```

#### 4. sveltekit.body プレースホルダー

**構文**: `%sveltekit.body%`  
**用途**: レンダリングされたページのマークアップ  
**参照元**: ルートとページコンポーネントの出力  
**注意**: 直接`<body>`内ではなく、`<div>`等の要素内に配置

```html
<!-- app.html -->
<body>
  <div style="display: contents">
    %sveltekit.body%
  </div>
</body>
```

### セキュリティ関連プレースホルダー

#### 5. sveltekit.nonce プレースホルダー

**構文**: `%sveltekit.nonce%`  
**用途**: Content Security Policy (CSP)のnonce値  
**参照元**: `svelte.config.js`のCSP設定  
**使用場面**: 手動で追加するインラインスクリプトやスタイル

```html
<!-- app.html -->
<script nonce="%sveltekit.nonce%">
  // グローバル設定やポリフィルなど
  console.log('App initialized');
</script>

<style nonce="%sveltekit.nonce%">
  /* クリティカルCSS */
  body { margin: 0; }
</style>
```

```javascript
// svelte.config.js でCSPを設定
const config = {
  kit: {
    csp: {
      mode: 'auto', // 'nonce' | 'hash' | 'auto'
      directives: {
        'script-src': ['self'],
        'style-src': ['self', 'unsafe-inline']
      }
    }
  }
};
```

### 環境変数プレースホルダー

#### 6. sveltekit.env.[NAME] プレースホルダー

**構文**: `%sveltekit.env.[NAME]%`  
**用途**: 公開環境変数の埋め込み  
**参照元**: `PUBLIC_`プレフィックスを持つ環境変数  
**フォールバック**: マッチしない場合は空文字列

```html
<!-- app.html -->
<script nonce="%sveltekit.nonce%">
  window.API_URL = '%sveltekit.env.PUBLIC_API_URL%';
  window.APP_VERSION = '%sveltekit.env.PUBLIC_APP_VERSION%';
</script>
```

```bash
# .env ファイル
PUBLIC_API_URL=https://api.example.com
PUBLIC_APP_VERSION=1.0.0
PRIVATE_SECRET=secret123  # これは使用不可
```

## error.html用プレースホルダー

エラーページ専用のプレースホルダーです。アプリケーションが完全に失敗した場合に使用されます。

#### 7. sveltekit.status プレースホルダー

**構文**: `%sveltekit.status%`  
**用途**: HTTPステータスコード  
**参照元**: エラーのステータスコード（404、500等）

#### 8. sveltekit.error.message プレースホルダー

**構文**: `%sveltekit.error.message%`  
**用途**: エラーメッセージ  
**参照元**: エラーオブジェクトのメッセージ

```html
<!-- error.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Error %sveltekit.status%</title>
</head>
<body>
  <h1>Error %sveltekit.status%</h1>
  <p>%sveltekit.error.message%</p>
</body>
</html>
```

## プレースホルダー置換の流れ

<Mermaid diagram={placeholderReplacementDiagram} />

## 使用可能な場所と制限

### 使用可能な場所

| ファイル | 使用可能なプレースホルダー |
|---------|------------------------|
| **app.html** | `%lang%`, `%sveltekit.assets%`, `%sveltekit.head%`, `%sveltekit.body%`, `%sveltekit.nonce%`, `%sveltekit.env.*%` |
| **error.html** | `%sveltekit.status%`, `%sveltekit.error.message%` |

### 使用できない場所

- **JavaScriptファイル** (`+page.js`, `+server.js`, `hooks.server.js`)
- **Svelteコンポーネント** (`+page.svelte`, `+layout.svelte`)
- **TypeScriptファイル** (`.ts`ファイル全般)
- **Service Worker** (`service-worker.js`)
- **その他の静的ファイル**

## 代替アプローチ

プレースホルダーが使えない場所での代替方法

### 環境変数へのアクセス

```typescript
// +page.server.ts で環境変数を使用
import { PUBLIC_API_URL } from '$env/static/public';
import { PRIVATE_API_KEY } from '$env/static/private';

export async function load() {
  const response = await fetch(PUBLIC_API_URL, {
    headers: {
      'Authorization': `Bearer ${PRIVATE_API_KEY}`
    }
  });
  
  return {
    data: await response.json()
  };
}
```

### アセットパスへのアクセス

```typescript
// +page.svelte でアセットパスを使用
import { base, assets } from '$app/paths';

const logoUrl = `${assets}/images/logo.png`;
```

### CSP nonceの動的生成

```typescript
// hooks.server.ts でカスタムCSP実装
import crypto from 'crypto';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  const nonce = crypto.randomBytes(16).toString('base64');
  
  const response = await resolve(event, {
    transformPageChunk: ({ html }) => {
      return html.replace(/%sveltekit\.nonce%/g, nonce);
    }
  });
  
  response.headers.set(
    'Content-Security-Policy',
    `script-src 'nonce-${nonce}' 'strict-dynamic';`
  );
  
  return response;
};
```

## トラブルシューティング

### よくある問題と解決策

#### 1. プレースホルダーが置換されない

**問題**: `%sveltekit.nonce%`が文字列として表示される  
**原因**: JavaScriptファイル内で使用している  
**解決**: app.htmlでのみ使用する

```javascript
// ❌ 間違い: +page.svelte内
const nonce = '%sveltekit.nonce%'; // 文字列として扱われる

// ✅ 正解: app.html内
<script nonce="%sveltekit.nonce%">
  // ここではnonceが適用される
</script>
```

#### 2. 環境変数が空文字になる

**問題**: `%sveltekit.env.MY_VAR%`が空  
**原因**: `PUBLIC_`プレフィックスがない  
**解決**: 環境変数名を`PUBLIC_MY_VAR`に変更

```bash
# 間違い
MY_VAR=value

# 正解
PUBLIC_MY_VAR=value
```

#### 3. エラーページが正しく表示されない

**問題**: error.htmlが機能しない  
**原因**: プレースホルダーの誤字  
**解決**: 正確な構文を使用

```html
<!-- ❌ 間違い -->
%status% 
%message%

<!-- ✅ 正解 -->
%sveltekit.status%
%sveltekit.error.message%
```

## ベストプラクティス

### 1. セキュリティを考慮した環境変数の使用

```typescript
// svelte.config.js
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  // 環境変数のプレフィックスを明示的に設定
  envPrefix: 'PUBLIC_'
});
```

### 2. CSPの適切な設定

```javascript
// svelte.config.js
const config = {
  kit: {
    csp: {
      mode: 'auto',
      directives: {
        'default-src': ['self'],
        'script-src': ['self', 'https://trusted-cdn.com'],
        'style-src': ['self', 'unsafe-inline'], // 必要最小限に
        'img-src': ['self', 'data:', 'https:'],
        'font-src': ['self'],
        'connect-src': ['self', 'https://api.example.com']
      }
    }
  }
};
```

### 3. 多言語対応の実装

```typescript
// hooks.server.ts
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  // 言語判定ロジック
  const acceptLanguage = event.request.headers.get('accept-language');
  const cookieLang = event.cookies.get('preferred_language');
  
  const lang = cookieLang || 
               acceptLanguage?.split(',')[0].split('-')[0] || 
               'ja';
  
  // HTMLに言語を適用
  return await resolve(event, {
    transformPageChunk: ({ html }) => {
      return html.replace('%lang%', lang);
    }
  });
};
```

## まとめ

SvelteKitのプレースホルダーは、HTMLテンプレートで動的な値を埋め込むための強力な機能です。ただし、使用できる場所が限定されているため、適切な場所で適切な方法を選択することが重要です。

:::tip[ポイント]
- プレースホルダーは**HTMLテンプレートのみ**で使用可能
- JavaScriptコードでは**モジュールAPI**を使用
- セキュリティを考慮して**PUBLIC_プレフィックス**を活用
:::

## 関連リンク

- [プロジェクト構造と規約](/sveltekit/basics/project-structure/)
- [環境変数管理](/sveltekit/application/environment/)
- [セキュリティ](/sveltekit/deployment/security/)