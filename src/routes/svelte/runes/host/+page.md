---
title: $host - カスタムエレメント
description: カスタムエレメント内でホスト要素にアクセスするための$hostルーン
---

`$host`ルーンは、Svelte 5で導入された、カスタムエレメント（Web Components）内でホスト要素にアクセスするための特別なルーンです。

## 基本的な使い方

カスタムエレメントとして定義されたコンポーネント内で、`$host()`を呼び出すことでホスト要素（カスタムエレメント自体）への参照を取得できます。

```svelte
<!-- MyButton.svelte -->
<svelte:options customElement="my-button" />

<script lang="ts">
  function handleClick() {
    // ホスト要素（<my-button>）にカスタムイベントをディスパッチ
    $host().dispatchEvent(
      new CustomEvent('boom', {
        detail: { message: 'ボタンがクリックされました！' },
        bubbles: true,
        composed: true // Shadow DOMの境界を越えてバブリング
      })
    );
  }
</script>

<button onclick={handleClick}>
  クリックしてイベントを発火
</button>
```

### 外部からの使用

```html
<!-- HTML側 -->
<my-button id="custom-btn"></my-button>

<script>
  const btn = document.getElementById('custom-btn');
  btn.addEventListener('boom', (e) => {
    console.log(e.detail.message); // "ボタンがクリックされました！"
  });
</script>
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