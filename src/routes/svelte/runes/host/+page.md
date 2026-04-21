---
title: $host - カスタムエレメント
description: Svelte 5 の $host() ルーンで Web Components（カスタムエレメント）を開発する TypeScript ガイド。ホスト要素への参照取得、dispatchEvent によるカスタムイベント発火、Shadow DOM・プロパティ定義・ライフサイクル管理を実コードで解説します。
---

<script>
	import Admonition from '$lib/components/Admonition.svelte';
</script>

`$host()` は、Svelte 5 で導入されたルーンで、**カスタムエレメント（Web Components）としてコンパイルされたコンポーネントの内側から、そのホスト要素（DOM ノード）にアクセスする**ために使います。React・Vue・Angular など Svelte の外にあるフレームワークや素の HTML に対して、Web 標準の形でコンポーネントを提供したいときに必要になります。

代表的な用途は、コンポーネントの状態変化を外の世界に通知する **カスタムイベントの発火** です。

```svelte
<!-- Counter.svelte -->
<svelte:options customElement="my-counter" />

<script lang="ts">
  let count = $state(0);

  function increment() {
    count++;
    // <my-counter> 自身からカスタムイベントを発火
    $host().dispatchEvent(
      new CustomEvent('countchange', { detail: { count } })
    );
  }
</script>

<button onclick={increment}>+{count}</button>
```

`$host()` は **`<svelte:options customElement="..." />` を指定したコンポーネントの中でのみ使用可能** です。通常の Svelte コンポーネント内で呼び出すとコンパイル時にエラーになります。

## カスタムエレメントとは

カスタムエレメント（Web Components）は、再利用可能なカスタムHTML要素を定義するWeb標準技術です。Svelteコンポーネントをカスタムエレメントとしてコンパイルすることで、Svelte以外の環境でも使用できるようになります。

<Admonition type="info" title="さらに詳しく学ぶ">

カスタムエレメント（Web Components）についての詳細は、以下のリソースをご参照ください。

**MDN Web Docs**

<ul>
<li>📖 [Web Components | MDN](https://developer.mozilla.org/ja/docs/Web/API/Web_components)</li>
<li>📖 [カスタムエレメントの使用 | MDN](https://developer.mozilla.org/ja/docs/Web/API/Web_components/Using_custom_elements)</li>
<li>📖 [Shadow DOM の使用 | MDN](https://developer.mozilla.org/ja/docs/Web/API/Web_components/Using_shadow_DOM)</li>
<li>📖 [HTMLElement | MDN](https://developer.mozilla.org/ja/docs/Web/API/HTMLElement)</li>
</ul>

**TypeScriptでのWebComponentsの学習リソース**

<ul>
<li>🎓 [WebComponents完全ガイド - TypeScriptで学ぶWebComponents](https://shuji-bonji.github.io/WebComponents-with-TypeScript/concepts/webcomponents-overview.html)</li>
</ul>

</Admonition>

### カスタムエレメントの定義

```svelte
<!-- Counter.svelte -->
<svelte:options customElement="my-counter" />

<script lang="ts">
  let { initial = 0 } = $props();
  let count = $state(initial);

  function increment() {
    count++;
    // カウント変更をカスタムイベントで通知
    $host().dispatchEvent(
      new CustomEvent('countchange', {
        detail: { count },
        bubbles: true
      })
    );
  }
</script>

<div class="counter">
  <button onclick={increment}>+</button>
  <span>{count}</span>
</div>

<style>
  .counter {
    display: flex;
    align-items: center;
    gap: 10px;
  }
</style>
```

### 他フレームワークでの使用例

```javascript
// React
function App() {
  useEffect(() => {
    const handleCountChange = (e) => {
      console.log('Count:', e.detail.count);
    };

    const counter = document.getElementById('counter');
    counter?.addEventListener('countchange', handleCountChange);

    return () => {
      counter?.removeEventListener('countchange', handleCountChange);
    };
  }, []);

  // JSXで使用
  return React.createElement('my-counter', { id: 'counter', initial: '10' });
}
```

```html
<!-- Vue.jsでの使用例 -->
<!-- Template部分 -->
<div id="app">
  <my-counter :initial="10" @countchange="handleCountChange"> </my-counter>
</div>

<!-- Script部分 -->
<script>
  new Vue({
    el: '#app',
    methods: {
      handleCountChange(event) {
        console.log('Count:', event.detail.count);
      },
    },
  });
</script>
```

## 実践例

`$host`を使ったカスタムエレメントの作成から使用まで、実際のプロジェクトでの完全な手順を説明します。

### ステップ1: Svelteプロジェクトの作成

まず、新しいSvelteプロジェクトを作成します。

```bash
# Svelteプロジェクトの作成
% npx sv create my-custom-elements
Need to install the following packages:
sv@0.9.2
Ok to proceed? (y) y

┌  Welcome to the Svelte CLI! (v0.9.2)
│
◇  Which template would you like?
│  SvelteKit minimal
│
◇  Add type checking with TypeScript?
│  Yes, using TypeScript syntax
│
◆  Project created
│
◇  What would you like to add to your project? (use arrow keys / space bar)
│  none
│
◇  Which package manager do you want to install dependencies with?
│  npm
│
◆  Successfully installed dependencies
│
◇  What's next? ───────────────────────────────╮
│                                              │
│  📁 Project steps                            │
│                                              │
│    1: cd my-custom-elements                  │
│    2: npm run dev -- --open                  │
│                                              │
│  To close the dev server, hit Ctrl-C         │
│                                              │
│  Stuck? Visit us at https://svelte.dev/chat  │
│                                              │
├──────────────────────────────────────────────╯
│
└  You're all set!

cd my-custom-elements

# カスタムエレメント用のビルドプラグインもインストール
npm install -D @sveltejs/vite-plugin-svelte
```

### プロジェクト構成

初期構成を以下のように変更します。

```
my-custom-elements/
├── src/
│   ├── app.d.ts
│   ├── app.html
│   └── lib/
│       ├── assets/
│       │   └── favicon.svg
│       └── components/      # 新規作成
│           ├── index.ts     # 新規作成
│           ├── MyButton.svelte   # 新規作成
│           └── MyCounter.svelte  # 新規作成
├── static/
│   ├── demo.html           # 新規作成
│   ├── demo-dev.html       # 新規作成
│   └── robots.txt
├── vite.lib.config.ts      # 新規作成
├── svelte.config.js
├── tsconfig.json
├── vite.config.ts
└── package.json
```

まず必要なディレクトリとファイルを作成

```bash
# componentsディレクトリを作成
mkdir src/lib/components
```

### ステップ2: カスタムエレメントコンポーネントの作成

カスタムエレメントとして使用するコンポーネントを作成します。

```svelte
<!-- src/lib/components/MyButton.svelte -->
<svelte:options customElement="my-button" />

<script lang="ts">
  let { label = 'Click me', variant = 'primary' }: {
    label?: string;
    variant?: 'primary' | 'secondary' | 'danger';
  } = $props();

  function handleClick() {
    // ホスト要素（<my-button>）にカスタムイベントをディスパッチ
    $host().dispatchEvent(
      new CustomEvent('boom', {
        detail: {
          message: `Button "${label}" was clicked!`,
          timestamp: Date.now()
        },
        bubbles: true,
        composed: true // Shadow DOMの境界を越えてバブリング
      })
    );

    // ホスト要素にアニメーションクラスを追加
    const host = $host();
    host.classList.add('clicked');
    setTimeout(() => host.classList.remove('clicked'), 300);
  }

  // ホスト要素の初期設定
  $effect(() => {
    const host = $host();
    host.setAttribute('role', 'button');
    host.setAttribute('tabindex', '0');
    host.style.display = 'inline-block';
  });
</script>

<button
  onclick={handleClick}
  class="btn btn-{variant}"
>
  {label}
</button>

<style>
  .btn {
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
    transition: all 0.3s ease;
  }

  .btn-primary {
    background: #007bff;
    color: white;
  }

  .btn-primary:hover {
    background: #0056b3;
  }

  .btn-secondary {
    background: #6c757d;
    color: white;
  }

  .btn-danger {
    background: #dc3545;
    color: white;
  }

  :global(.clicked) {
    animation: pulse 0.3s ease;
  }

  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(0.95); }
    100% { transform: scale(1); }
  }
</style>
```

もう一つカウンターコンポーネントも作成

```svelte
<!-- src/lib/components/MyCounter.svelte -->
<svelte:options customElement="my-counter" />

<script lang="ts">
  let { initial = 0, step = 1 }: {
    initial?: number | string;
    step?: number | string;
  } = $props();

  // 文字列の場合は数値に変換
  let count = $state(Number(initial));
  let stepValue = Number(step);

  function increment() {
    count += stepValue;
    notifyChange();
  }

  function decrement() {
    count -= stepValue;
    notifyChange();
  }

  function notifyChange() {
    $host().dispatchEvent(
      new CustomEvent('countchange', {
        detail: { count, step: stepValue },
        bubbles: true
      })
    );
  }

  // ホスト要素の初期設定
  $effect(() => {
    const host = $host();
    host.setAttribute('data-count', String(count));
  });
</script>

<div class="counter">
  <button onclick={decrement}>-</button>
  <span class="count">{count}</span>
  <button onclick={increment}>+</button>
</div>

<style>
  .counter {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 5px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  button {
    width: 30px;
    height: 30px;
    border: none;
    background: #007bff;
    color: white;
    border-radius: 4px;
    cursor: pointer;
    font-size: 18px;
  }

  button:hover {
    background: #0056b3;
  }

  .count {
    min-width: 40px;
    text-align: center;
    font-size: 18px;
    font-weight: bold;
  }
</style>
```

### ステップ3: エクスポート設定

コンポーネントをエクスポートするためのエントリーポイントを作成

```typescript
// src/lib/components/index.ts
// カスタムエレメントの自動登録
import './MyButton.svelte';
import './MyCounter.svelte';

// 必要に応じて追加のコンポーネントをインポート
console.log('Custom elements registered: my-button, my-counter');

export {}; // モジュールとして扱うため
```

### ステップ4: ビルド設定

カスタムエレメント専用のビルド設定ファイルを作成します。

```typescript
// vite.lib.config.ts (新規作成)
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    svelte({
      compilerOptions: {
        customElement: true,
      },
    }),
  ],
  build: {
    lib: {
      entry: 'src/lib/components/index.ts',
      name: 'MyCustomElements',
      // UMDは使用しない（ES moduleのみ）
      formats: ['es'],
      fileName: 'custom-elements',
    },
    rollupOptions: {
      // 必要に応じて外部依存を追加
      external: [],
    },
  },
});
```

<Admonition type="warning" title="IDEの警告について">

VSCodeやWebStormで`&lt;svelte:options customElement="..."&gt;`に対して警告が表示される場合があります。

<ul>
<li><strong>警告内容</strong>: "The customElement option is used when generating a custom element. Did you forget the customElement: true compile option?"</li>
<li><strong>原因</strong>: IDE用の設定（svelte.config.js）とビルド用の設定（vite.lib.config.ts）が異なるため</li>
<li><strong>対処</strong>: この警告は無視して問題ありません。ビルド時は正常に動作します。</li>
</ul>

もし警告を消したい場合は、`svelte.config.js`に以下を追加

</Admonition>

```javascript
// svelte.config.js (オプション)
export default {
  // ... 既存の設定
  compilerOptions: {
    customElement: true, // IDE警告を消す場合のみ
  },
};
```

package.jsonにビルドスクリプトを追加

```javascript
// package.json
{
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "build:lib": "vite build --config vite.lib.config.ts",
    "preview": "vite preview"
  }
}
```

### ステップ5: ビルドとテスト

```bash
# カスタムエレメントとしてビルド
npm run build:lib

# 生成されるファイル:
# dist/custom-elements.js    # ES module
```

### ステップ6: テスト用HTMLファイルの作成

開発用とビルド後で異なるHTMLファイルを作成

#### 開発用（推奨）

```html
<!-- static/demo-dev.html -->
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>カスタムエレメントデモ（開発用）</title>
    <!-- 開発サーバーから直接読み込み -->
    <script type="module" src="/src/lib/components/index.ts"></script>
    <style>
      body {
        font-family: Arial, sans-serif;
        padding: 40px;
        max-width: 800px;
        margin: 0 auto;
      }
    </style>
  </head>
  <body>
    <h1>カスタムエレメントデモ</h1>
    <my-button label="テストボタン"></my-button>
    <my-counter initial="5"></my-counter>
  </body>
</html>
```

#### ビルド後用

```html
<!-- static/demo.html -->
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>カスタムエレメントデモ</title>
    <!-- ビルド後のファイルを参照 -->
    <script type="module" src="./custom-elements.js"></script>
    <style>
      body {
        font-family: Arial, sans-serif;
        padding: 40px;
        max-width: 800px;
        margin: 0 auto;
      }

      h1 {
        color: #333;
      }

      .demo-section {
        margin: 30px 0;
        padding: 20px;
        border: 1px solid #ddd;
        border-radius: 8px;
      }

      .output {
        margin-top: 20px;
        padding: 10px;
        background: #f0f0f0;
        border-radius: 4px;
        font-family: monospace;
      }
    </style>
  </head>
  <body>
    <h1>Svelteカスタムエレメントデモ</h1>

    <div class="demo-section">
      <h2>ボタンコンポーネント</h2>
      <my-button label="Primary Button" variant="primary"></my-button>
      <my-button label="Secondary" variant="secondary"></my-button>
      <my-button label="Danger!" variant="danger"></my-button>

      <div id="button-output" class="output">
        ボタンをクリックしてください...
      </div>
    </div>

    <div class="demo-section">
      <h2>カウンターコンポーネント</h2>
      <my-counter initial="10" step="5"></my-counter>
      <my-counter initial="0" step="1"></my-counter>

      <div id="counter-output" class="output">
        カウンターの値が変更されると表示されます...
      </div>
    </div>

    <script>
      // カスタムエレメントが定義されるまで待つ
      Promise.all([
        customElements.whenDefined('my-button'),
        customElements.whenDefined('my-counter'),
      ]).then(() => {
        // ボタンのイベントリスナー
        const buttons = document.querySelectorAll('my-button');
        const buttonOutput = document.getElementById('button-output');

        buttons.forEach((btn) => {
          btn.addEventListener('boom', (e) => {
            buttonOutput.textContent = `Event: ${e.detail.message} at ${new Date(e.detail.timestamp).toLocaleTimeString()}`;
          });
        });

        // カウンターのイベントリスナー
        const counters = document.querySelectorAll('my-counter');
        const counterOutput = document.getElementById('counter-output');

        counters.forEach((counter) => {
          counter.addEventListener('countchange', (e) => {
            counterOutput.textContent = `Counter changed: ${e.detail.count} (step: ${e.detail.step})`;
          });
        });
      });
    </script>
  </body>
</html>
```

### ステップ7: 開発サーバーでテスト

#### 方法1: 開発サーバーで直接確認（推奨）

```bash
# 開発サーバーを起動
npm run dev

# ブラウザで以下にアクセス
# http://localhost:5173/demo-dev.html
```

開発サーバーではTypeScriptファイルが直接読み込まれ、ホットリロードも動作します。

<Admonition type="tip" title="動作確認">

ブラウザのDevToolsで要素を確認すると、カスタムエレメントが正しく登録されているのが確認できます。

</Admonition>

```html
<my-button
  label="テストボタン"
  role="button"
  tabindex="0"
  style="display: inline-block;"
>
  #shadow-root (open)
  <button class="btn btn-primary">テストボタン</button>
</my-button>
```

カウンターをクリックすると、`data-count`属性が更新されるのも確認できます。

#### 方法2: ビルド後の確認

```bash
# 1. カスタムエレメントをビルド
npm run build:lib

# 2. ビルドしたファイルをstaticディレクトリにコピー
cp dist/custom-elements.js static/

# 3. 開発サーバーを起動
npm run dev

# 4. ブラウザで以下にアクセス
# http://localhost:5173/demo.html
```

<Admonition type="note" title="npm run buildとpreviewについて">

**`npm run build`** はSvelteKitアプリケーション用のビルドコマンドです。
<ul>
<li><code>.svelte-kit/output/</code>にSvelteKitアプリをビルド</li>
<li>カスタムエレメントのビルドには使用しません</li>
<li>カスタムエレメントには<code>npm run build:lib</code>を使用</li>
</ul>

**`npm run preview`** はSvelteKitアプリのプレビュー用です。

<ul>
<li><code>npm run build</code>後のSvelteKitアプリをプレビュー</li>
<li><code>http://localhost:4173/</code>でアクセス</li>
<li>カスタムエレメントのテストには使用しません</li>
</ul>

カスタムエレメントのテストは`npm run dev`と`demo-dev.html`を使用してください。

</Admonition>

### トラブルシューティング

#### よくあるエラーと解決方法

1. **"UMD and IIFE output formats are not supported"エラー**
   - 原因: SvelteKitのデフォルト設定との競合
   - 解決: 別のvite.lib.config.tsファイルを使用し、formatを`['es']`のみに設定

2. **カスタムエレメントが登録されない**
   - 原因: `&lt;svelte:options customElement="..."&gt;`の記述漏れ
   - 解決: 各コンポーネントファイルの先頭に追加

3. **スタイルが適用されない**
   - 原因: Shadow DOMのカプセル化
   - 解決: `:global()`を使用するか、コンポーネント内でスタイルを定義

4. **`$host()`が使えない**
   - 原因: 通常のSvelteコンポーネントで使用している
   - 解決: `&lt;svelte:options customElement="..."&gt;`を追加

5. **403 Forbidden エラー（demo.html）**
   - 原因: Viteの開発サーバーが`/dist`ディレクトリへのアクセスを禁止
   - 解決:
     - 開発時: `/src/lib/components/index.ts`を直接インポート
     - ビルド後: ビルドファイルを`static`ディレクトリにコピー

6. **カスタムエレメントの属性が文字列として扱われる**
   - 原因: HTML属性は常に文字列として渡される
   - 例: `<my-counter initial="5" step="10">` の`5`と`10`は文字列
   - 解決: propsで`string | number`型を受け入れ、`Number()`で変換
   ```typescript
   let { step = 1 }: { step?: number | string } = $props();
   let stepValue = Number(step);
   ```

### NPMパッケージとして配布する場合

package.jsonの設定例:

```javascript
// package.json (NPMパッケージ用)
{
  "name": "my-svelte-components",
  "version": "1.0.0",
  "type": "module",
  "files": ["dist"],
  "main": "./dist/custom-elements.js",
  "module": "./dist/custom-elements.js",
  "exports": {
    ".": {
      "import": "./dist/custom-elements.js"
    }
  }
}
```

使用側:

```javascript
// ESモジュールとしてインポート
import 'my-svelte-components';

// カスタムエレメントが自動的に登録される
// HTMLで<my-button>が使用可能に
```

## $hostでできること

### 1. カスタムイベントのディスパッチ

```svelte
<svelte:options customElement="event-emitter" />

<script lang="ts">
  function emitCustomEvent(eventName: string, data: any) {
    $host().dispatchEvent(
      new CustomEvent(eventName, {
        detail: data,
        bubbles: true,     // 親要素へバブリング
        composed: true,    // Shadow DOMを越える
        cancelable: true   // preventDefault()可能
      })
    );
  }
</script>
```

### 2. ホスト要素の属性操作

```svelte
<svelte:options customElement="dynamic-element" />

<script lang="ts">
  import { onMount } from 'svelte';

  let expanded = $state(false);

  $effect(() => {
    // 状態変化に応じてホスト要素の属性を更新
    const host = $host();
    host.setAttribute('aria-expanded', String(expanded));
    host.classList.toggle('expanded', expanded);
  });

  onMount(() => {
    // 初期化時の処理
    const host = $host();
    host.setAttribute('role', 'button');
    host.setAttribute('tabindex', '0');
  });
</script>

<button onclick={() => expanded = !expanded}>
  Toggle
</button>
```

### 3. ホスト要素のスタイル制御

```svelte
<svelte:options customElement="styled-element" />

<script lang="ts">
  let { theme = 'light' } = $props();

  $effect(() => {
    const host = $host();

    // テーマに応じたスタイルを適用
    if (theme === 'dark') {
      host.style.backgroundColor = '#1a1a1a';
      host.style.color = '#ffffff';
    } else {
      host.style.backgroundColor = '#ffffff';
      host.style.color = '#000000';
    }

    // 共通スタイル
    host.style.display = 'block';
    host.style.padding = '20px';
    host.style.borderRadius = '8px';
  });
</script>
```

### 4. ホスト要素の情報取得

```svelte
<svelte:options customElement="info-element" />

<script lang="ts">
  import { onMount } from 'svelte';

  onMount(() => {
    const host = $host();

    // ホスト要素の各種情報を取得
    console.log('タグ名:', host.tagName);           // "INFO-ELEMENT"
    console.log('ID:', host.id);                    // 設定されたID
    console.log('クラス:', host.className);         // 設定されたクラス
    console.log('親要素:', host.parentElement);     // 親要素への参照

    // カスタム属性の取得
    const customAttr = host.getAttribute('data-custom');
    console.log('カスタム属性:', customAttr);
  });
</script>
```

## 通常のコンポーネントとの違い

### 比較表

| 観点               | 通常のSvelteコンポーネント | カスタムエレメント         |
| ------------------ | -------------------------- | -------------------------- |
| **使用場所**       | Svelteアプリ内のみ         | 任意のHTML/JavaScript環境  |
| **Props受け渡し**  | TypeScript型付きprops      | HTML属性またはプロパティ   |
| **イベント**       | コンポーネントイベント     | CustomEvent（DOMイベント） |
| **スタイリング**   | スコープ付きCSS            | Shadow DOM（カプセル化）   |
| **SSR対応**        | ✅ 完全対応                | ❌ 非対応                  |
| **型安全性**       | ✅ TypeScript完全対応      | ⚠️ 限定的                  |
| **バンドルサイズ** | 最適化される               | Svelteランタイム含む       |
| **$host使用**      | ❌ 使用不可                | ✅ 使用可能                |

### 使い分けの指針

```typescript
// 通常のコンポーネント - Svelteアプリ内で使用
import Button from './Button.svelte';

// カスタムエレメント - 外部環境で使用
<my-button text="Click me"></my-button>
```

| 用途                         | 推奨                 |
| ---------------------------- | -------------------- |
| Svelteアプリ内での再利用     | 通常のコンポーネント |
| 他フレームワークとの共有     | カスタムエレメント   |
| SSR/SSGが必要                | 通常のコンポーネント |
| WordPressなどCMSへの埋め込み | カスタムエレメント   |
| マイクロフロントエンド       | カスタムエレメント   |

## 制限事項と注意点

<Admonition type="warning" title="重要な制限">

<ul>
<li><code>$host()</code>は<strong>カスタムエレメント内でのみ</strong>使用可能</li>
<li>通常のSvelteコンポーネントで使用するとコンパイルエラー</li>
<li><code>&lt;svelte:options customElement="..."&gt;</code>の指定が必須</li>
<li>SSR（サーバーサイドレンダリング）は非対応</li>
</ul>

</Admonition>

### コンパイル設定

```javascript
// vite.config.js
export default {
  plugins: [
    svelte({
      compilerOptions: {
        customElement: true, // すべてをカスタムエレメントとしてコンパイル
      },
    }),
  ],
};
```

#### または、個別に指定

```svelte
<!-- 個別のコンポーネントでのみカスタムエレメント化 -->
<svelte:options customElement="my-component" />
```

## まとめ

`$host`ルーンは、Svelteコンポーネントをカスタムエレメントとして使用する際の重要な機能です。

- **イベント通信**: カスタムイベントによる外部との通信
- **属性制御**: ホスト要素の属性やスタイルの動的制御
- **相互運用性**: 他のフレームワークやVanilla JavaScriptとの統合

カスタムエレメントは、コンポーネントの再利用性を最大化し、フレームワークに依存しない形でUIコンポーネントを提供する強力な手段です。

## 参考資料

### 公式ドキュメント

- 🔗 [Custom elements API - Svelte 5](https://svelte.dev/docs/svelte/custom-elements-api)
- 🔗 [$host - Svelte 5 Docs](https://svelte.dev/docs/svelte/$host)
- 🔗 [Compiling to custom elements - Svelte Tutorial](https://learn.svelte.dev/tutorial/custom-elements-api)

### MDN Web Docs

- 📖 [Web Components | MDN](https://developer.mozilla.org/ja/docs/Web/API/Web_components)
- 📖 [CustomElementRegistry | MDN](https://developer.mozilla.org/ja/docs/Web/API/CustomElementRegistry)
- 📖 [customElements.define() | MDN](https://developer.mozilla.org/ja/docs/Web/API/CustomElementRegistry/define)

## 次のステップ

`$host`の基本を理解したら、次はデバッグに便利な[$inspect](/svelte/runes/inspect/)ルーンについて学びましょう。
