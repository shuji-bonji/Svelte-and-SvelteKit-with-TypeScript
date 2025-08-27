---
title: $host - カスタムエレメント
description: カスタムエレメント内でホスト要素にアクセスするための$hostルーン
---

`$host`ルーンは、Svelte 5で導入された、カスタムエレメント（Web Components）内でホスト要素にアクセスするための特別なルーンです。

## 基本的な使い方

`$host`を使ったカスタムエレメントの作成から使用まで、実際のプロジェクトでの完全な手順を説明します。

### ステップ1: Svelteプロジェクトの作成

まず、新しいSvelteプロジェクトを作成します。

```bash
# Svelteプロジェクトの作成
npx sv create my-custom-elements

# プロンプトで以下を選択:
# - SvelteKit demo app
# - TypeScript
# - その他は必要に応じて選択

cd my-custom-elements
npm install
```

### プロジェクト構成

```
my-custom-elements/
├── src/
│   ├── routes/           # SvelteKitのルート（今回は使用しない）
│   ├── lib/              # 共有コンポーネント
│   │   └── components/   # カスタムエレメント用のコンポーネント
│   │       ├── MyButton.svelte
│   │       ├── MyCounter.svelte
│   │       └── index.ts  # エクスポート用
│   ├── app.d.ts
│   └── app.html
├── static/              # 静的ファイル
│   └── demo.html       # カスタムエレメントのデモページ
├── vite.config.ts
├── svelte.config.js
├── package.json
└── tsconfig.json
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

もう一つカウンターコンポーネントも作成：

```svelte
<!-- src/lib/components/MyCounter.svelte -->
<svelte:options customElement="my-counter" />

<script lang="ts">
  let { initial = 0, step = 1 }: {
    initial?: number;
    step?: number;
  } = $props();
  
  let count = $state(initial);
  
  function increment() {
    count += step;
    notifyChange();
  }
  
  function decrement() {
    count -= step;
    notifyChange();
  }
  
  function notifyChange() {
    $host().dispatchEvent(
      new CustomEvent('countchange', {
        detail: { count, step },
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

コンポーネントをエクスポートするためのエントリーポイントを作成：

```typescript
// src/lib/components/index.ts
// カスタムエレメントの自動登録
import './MyButton.svelte';
import './MyCounter.svelte';

// 必要に応じて追加のコンポーネントをインポート
console.log('Custom elements registered: my-button, my-counter');
```

### ステップ4: ビルド設定

Viteの設定を更新してカスタムエレメントをビルドできるようにします：

```javascript
// vite.config.ts
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  build: {
    lib: {
      entry: 'src/lib/components/index.ts',
      name: 'MyCustomElements',
      fileName: (format) => `custom-elements.${format}.js`
    },
    rollupOptions: {
      // 外部依存を除外（必要に応じて）
      external: [],
      output: {
        globals: {}
      }
    }
  }
});
```

package.jsonにビルドスクリプトを追加：

```javascript
// package.json
{
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "build:lib": "vite build --mode library",
    "preview": "vite preview",
    // ... 他のスクリプト
  }
}
```

### ステップ5: ビルドとテスト

```bash
# カスタムエレメントとしてビルド
npm run build:lib

# 生成されるファイル:
# dist/custom-elements.es.js    # ES module
# dist/custom-elements.umd.js   # UMD
```

### ステップ6: テスト用HTMLファイルの作成

デモ用のHTMLファイルを作成してテスト：

```html
<!-- static/demo.html -->
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>カスタムエレメントデモ</title>
  <script type="module" src="/dist/custom-elements.es.js"></script>
  <style>
    body {
      font-family: Arial, sans-serif;
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
    }
    
    h1 { color: #333; }
    
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
      customElements.whenDefined('my-counter')
    ]).then(() => {
      // ボタンのイベントリスナー
      const buttons = document.querySelectorAll('my-button');
      const buttonOutput = document.getElementById('button-output');
      
      buttons.forEach(btn => {
        btn.addEventListener('boom', (e) => {
          buttonOutput.textContent = `Event: ${e.detail.message} at ${new Date(e.detail.timestamp).toLocaleTimeString()}`;
        });
      });
      
      // カウンターのイベントリスナー
      const counters = document.querySelectorAll('my-counter');
      const counterOutput = document.getElementById('counter-output');
      
      counters.forEach(counter => {
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

```bash
# 開発サーバーを起動
npm run dev

# ブラウザで以下にアクセス
# http://localhost:5173/demo.html
```

### NPMパッケージとして配布する場合

package.jsonの設定例:

```javascript
// package.json
{
  "name": "my-svelte-components",
  "version": "1.0.0",
  "type": "module",
  "files": ["dist"],
  "main": "./dist/my-button.umd.js",
  "module": "./dist/my-button.js",
  "exports": {
    ".": {
      "import": "./dist/my-button.js",
      "require": "./dist/my-button.umd.js"
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

## カスタムエレメントとは

カスタムエレメント（Web Components）は、再利用可能なカスタムHTML要素を定義するWeb標準技術です。Svelteコンポーネントをカスタムエレメントとしてコンパイルすることで、Svelte以外の環境でも使用できるようになります。

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
  <my-counter 
    :initial="10" 
    @countchange="handleCountChange">
  </my-counter>
</div>

<!-- Script部分 -->
<script>
new Vue({
  el: '#app',
  methods: {
    handleCountChange(event) {
      console.log('Count:', event.detail.count);
    }
  }
});
</script>
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

| 観点 | 通常のSvelteコンポーネント | カスタムエレメント |
|-----|-------------------------|------------------|
| **使用場所** | Svelteアプリ内のみ | 任意のHTML/JavaScript環境 |
| **Props受け渡し** | TypeScript型付きprops | HTML属性またはプロパティ |
| **イベント** | コンポーネントイベント | CustomEvent（DOMイベント） |
| **スタイリング** | スコープ付きCSS | Shadow DOM（カプセル化） |
| **SSR対応** | ✅ 完全対応 | ❌ 非対応 |
| **型安全性** | ✅ TypeScript完全対応 | ⚠️ 限定的 |
| **バンドルサイズ** | 最適化される | Svelteランタイム含む |
| **$host使用** | ❌ 使用不可 | ✅ 使用可能 |

### 使い分けの指針

```typescript
// 通常のコンポーネント - Svelteアプリ内で使用
import Button from './Button.svelte';

// カスタムエレメント - 外部環境で使用
<my-button text="Click me"></my-button>
```

| 用途 | 推奨 |
|-----|-----|
| Svelteアプリ内での再利用 | 通常のコンポーネント |
| 他フレームワークとの共有 | カスタムエレメント |
| SSR/SSGが必要 | 通常のコンポーネント |
| WordPressなどCMSへの埋め込み | カスタムエレメント |
| マイクロフロントエンド | カスタムエレメント |

## 制限事項と注意点

:::warning[重要な制限]
- `$host()`は**カスタムエレメント内でのみ**使用可能
- 通常のSvelteコンポーネントで使用するとコンパイルエラー
- `<svelte:options customElement="...">`の指定が必須
- SSR（サーバーサイドレンダリング）は非対応
:::

### コンパイル設定

```javascript
// vite.config.js
export default {
  plugins: [
    svelte({
      compilerOptions: {
        customElement: true // すべてをカスタムエレメントとしてコンパイル
      }
    })
  ]
}
```

#### または、個別に指定

```svelte
<!-- 個別のコンポーネントでのみカスタムエレメント化 -->
<svelte:options customElement="my-component" />
```

## 実践例：フォームコンポーネント

```svelte
<!-- CustomForm.svelte -->
<svelte:options customElement="custom-form" />

<script lang="ts">
  import { onMount } from 'svelte';
  
  type FormData = {
    name: string;
    email: string;
  };
  
  let formData = $state<FormData>({
    name: '',
    email: ''
  });
  
  // フォーム送信
  function handleSubmit(e: Event) {
    e.preventDefault();
    
    // バリデーション
    if (!formData.name || !formData.email) {
      $host().dispatchEvent(
        new CustomEvent('error', {
          detail: { message: '全ての項目を入力してください' },
          bubbles: true
        })
      );
      return;
    }
    
    // 送信イベント
    $host().dispatchEvent(
      new CustomEvent('submit', {
        detail: formData,
        bubbles: true
      })
    );
  }
  
  // 外部からのリセット要求に対応
  onMount(() => {
    const host = $host();
    
    // カスタムメソッドを追加
    (host as any).reset = () => {
      formData = { name: '', email: '' };
    };
    
    // 初期状態を通知
    host.dispatchEvent(
      new CustomEvent('ready', {
        detail: { message: 'Form initialized' }
      })
    );
  });
</script>

<form onsubmit={handleSubmit}>
  <div>
    <label>
      名前:
      <input 
        type="text" 
        bind:value={formData.name}
        required
      />
    </label>
  </div>
  
  <div>
    <label>
      メール:
      <input 
        type="email" 
        bind:value={formData.email}
        required
      />
    </label>
  </div>
  
  <button type="submit">送信</button>
</form>

<style>
  form {
    display: flex;
    flex-direction: column;
    gap: 15px;
    padding: 20px;
  }
  
  label {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  
  input {
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  
  button {
    padding: 10px 20px;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  button:hover {
    background: #0056b3;
  }
</style>
```

### 使用例

```html
<!DOCTYPE html>
<html>
<head>
  <script type="module" src="/custom-form.js"></script>
</head>
<body>
  <custom-form id="myForm"></custom-form>
  
  <script>
    const form = document.getElementById('myForm');
    
    // イベントリスナー
    form.addEventListener('submit', (e) => {
      console.log('Form submitted:', e.detail);
    });
    
    form.addEventListener('error', (e) => {
      alert(e.detail.message);
    });
    
    form.addEventListener('ready', (e) => {
      console.log(e.detail.message);
    });
    
    // カスタムメソッドの呼び出し
    setTimeout(() => {
      form.reset(); // フォームをリセット
    }, 5000);
  </script>
</body>
</html>
```

## まとめ

`$host`ルーンは、Svelteコンポーネントをカスタムエレメントとして使用する際の重要な機能です。

- **イベント通信**: カスタムイベントによる外部との通信
- **属性制御**: ホスト要素の属性やスタイルの動的制御
- **相互運用性**: 他のフレームワークやVanilla JavaScriptとの統合

カスタムエレメントは、コンポーネントの再利用性を最大化し、フレームワークに依存しない形でUIコンポーネントを提供する強力な手段です。

## 次のステップ

`$host`の基本を理解したら、次はデバッグに便利な[$inspect](/svelte/runes/inspect/)ルーンについて学びましょう。