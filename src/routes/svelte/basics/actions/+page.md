---
title: use:アクション
description: Svelte5のuse:actionディレクティブをTypeScriptで実装 - DOM要素へのカスタム動作追加、パラメータ設定、update・destroy処理、Tippy.js統合などの実践的なアクション作成方法を実例を交えて詳しく解説します
---

<style>
  .aside-box {
    background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
    border-left: 4px solid #667eea;
    border-radius: 8px;
    padding: 1.5rem;
    margin: 2rem 0;
  }
  
  .aside-box h2 {
    margin-top: 0;
    color: #667eea;
  }
  
  .aside-box h3 {
    color: #764ba2;
    margin-top: 1.5rem;
    margin-bottom: 0.5rem;
  }
  
  .aside-box ul {
    margin: 0.5rem 0;
  }
  
  :global(.dark) .aside-box {
    background: linear-gradient(135deg, #667eea20 0%, #764ba220 100%);
  }
  
  :global(.dark) .aside-box h2 {
    color: #9ca3ff;
  }
  
  :global(.dark) .aside-box h3 {
    color: #b794f6;
  }
</style>

`use:action`は、DOM要素に対して直接的な操作を行うための強力な機能です。要素のライフサイクルにフックして、初期化、更新、クリーンアップの処理を実行できます。

:::tip[React/Vue経験者向け]
- React の `useRef` + `useEffect` の組み合わせに相当
- Vue の `カスタムディレクティブ` に相当
- ただし、Svelteのアクションはよりシンプルで直感的
:::

## アクションとは

アクションは、DOM要素がマウントされた時に実行される関数です。要素への参照を受け取り、その要素に対して任意の処理を実行できます。

### 基本構造

```typescript
function myAction(node: HTMLElement, parameter?: any) {
  // 初期化処理
  
  return {
    update(newParameter?: any) {
      // パラメータが変更された時の処理
    },
    destroy() {
      // クリーンアップ処理
    }
  };
}
```

## いつ実行されるか

:::warning[重要な実行タイミング]
アクションは**要素がDOMにマウントされた時**に実行されます。クリックやフォーカスなどのユーザー操作では実行されません。
:::

### ライフサイクル

1. **マウント時**: 要素がDOMに追加された時にアクション関数が実行される
2. **更新時**: パラメータが変更された時に`update`メソッドが呼ばれる
3. **アンマウント時**: 要素がDOMから削除される時に`destroy`メソッドが呼ばれる

```svelte live
<script lang="ts">
  let showElement = $state(true);
  let parameter = $state('初期値');
  
  function lifecycleAction(node: HTMLElement, param: string) {
    console.log(`アクション実行: ${param}`);
    node.style.backgroundColor = '#ffe4e1';
    
    return {
      update(newParam: string) {
        console.log(`アクション更新: ${newParam}`);
        node.style.backgroundColor = newParam === '変更後' ? '#e1f5fe' : '#ffe4e1';
      },
      destroy() {
        console.log('アクション破棄');
      }
    };
  }
</script>

<div class="demo">
  <button onclick={() => showElement = !showElement}>
    要素を{showElement ? '削除' : '表示'}
  </button>
  
  <button onclick={() => parameter = parameter === '初期値' ? '変更後' : '初期値'}>
    パラメータ変更: {parameter}
  </button>
  
  {#if showElement}
    <div use:lifecycleAction={parameter} class="target" >
      この要素にアクションが適用されています
    </div>
  {/if}
  
  <div class="log">
    <small>コンソールを確認してライフサイクルを観察してください</small>
  </div>
</div>

<style>

  .demo {
    padding: 1rem;
    background: #ccc;
    border-radius: 8px;
  }
  
  button {
    margin-right: 0.5rem;
    margin-bottom: 1rem;
  }
  
  .target {
    color: #333;
    padding: 1rem;
    border-radius: 4px;
    transition: background-color 0.3s;
  }
  
  .log {
    margin-top: 1rem;
    color: #666;
  }
</style>
```

## アクション vs イベントハンドラ

アクションとイベントハンドラは異なる目的で使用されます。

### 主な違い

| 特徴 | use:アクション | イベントハンドラ |
|------|--------------|----------------|
| **引数** | DOM要素（node） | イベントオブジェクト |
| **実行タイミング** | 要素のマウント時 | ユーザー操作時 |
| **主な用途** | DOM操作・初期化 | アプリケーションロジック |
| **戻り値** | update/destroyメソッド | なし |

### 使い分けのガイドライン

#### use:アクションを使うべき場合

- DOM要素への直接アクセスが必要
- 要素の初期化処理（フォーカス、スクロール位置など）
- 外部ライブラリの統合
- カスタムイベントリスナーの追加

#### イベントハンドラを使うべき場合

- ユーザー操作への応答
- アプリケーション状態の更新
- ビジネスロジックの実行
- データの送信や検証

## 実践例

### 1. オートフォーカス

```svelte live
<script lang="ts">
  function autofocus(node: HTMLElement) {
    if (node instanceof HTMLInputElement) {
      node.focus();
      node.select();
    }
  }
  
  let showInput = $state(false);
</script>

<button onclick={() => showInput = !showInput}>
  入力フィールドを{showInput ? '隠す' : '表示'}
</button>

{#if showInput}
  <input 
    use:autofocus
    type="text" 
    placeholder="自動的にフォーカスされます"
    value="選択されたテキスト"
  />
{/if}
```

### 2. クリックアウトサイド

```svelte live
<script lang="ts">
  function clickOutside(node: HTMLElement, callback: () => void) {
    function handleClick(event: MouseEvent) {
      if (!node.contains(event.target as Node)) {
        callback();
      }
    }
    
    document.addEventListener('click', handleClick, true);
    
    return {
      destroy() {
        document.removeEventListener('click', handleClick, true);
      }
    };
  }
  
  let isOpen = $state(false);
  let count = $state(0);
</script>

<div class="container">
  <button onclick={() => isOpen = !isOpen}>
    メニューを開く
  </button>
  
  {#if isOpen}
    <div 
      use:clickOutside={() => {
        isOpen = false;
        count++;
      }}
      class="menu"
    >
      <h4>メニュー</h4>
      <p>外側をクリックすると閉じます</p>
      <p>閉じた回数: {count}</p>
    </div>
  {/if}
</div>

<style>
  .container {
    position: relative;
    padding: 1rem;
    background: #ccc;
    min-height: 200px;
  }
  
  .menu {

    color: #ddd;
    position: absolute;
    top: 50px;
    left: 0;
    background: #333;
    border: 1px solid #ccc;
    padding: 1rem;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
</style>
```

### 3. ツールチップ

```svelte live
<script lang="ts">
  function tooltip(node: HTMLElement, text: string) {
    let tooltipElement: HTMLDivElement;
    
    function showTooltip() {
      tooltipElement = document.createElement('div');
      tooltipElement.textContent = text;
      tooltipElement.className = 'tooltip';
      
      const rect = node.getBoundingClientRect();
      tooltipElement.style.position = 'fixed';
      tooltipElement.style.top = `${rect.top - 30}px`;
      tooltipElement.style.left = `${rect.left + rect.width / 2}px`;
      tooltipElement.style.transform = 'translateX(-50%)';
      
      document.body.appendChild(tooltipElement);
    }
    
    function hideTooltip() {
      if (tooltipElement) {
        tooltipElement.remove();
      }
    }
    
    node.addEventListener('mouseenter', showTooltip);
    node.addEventListener('mouseleave', hideTooltip);
    
    return {
      update(newText: string) {
        text = newText;
        if (tooltipElement) {
          tooltipElement.textContent = text;
        }
      },
      destroy() {
        hideTooltip();
        node.removeEventListener('mouseenter', showTooltip);
        node.removeEventListener('mouseleave', hideTooltip);
      }
    };
  }
  
  let tooltipText = $state('これはツールチップです');
</script>

<div class="demo">
  <input 
    bind:value={tooltipText}
    placeholder="ツールチップテキストを編集"
  />
  
  <div class="buttons">
    <button use:tooltip={tooltipText}>
      ホバーしてください
    </button>
    
    <button use:tooltip={'別のツールチップ'}>
      こちらも試してください
    </button>
  </div>
</div>

<style>
  .demo {
    padding: 2rem;
    background: #f5f5f5;
  }
  
  .buttons {
    margin-top: 2rem;
    display: flex;
    gap: 1rem;
  }
  
  :global(.tooltip) {
    background: #333;
    color: white;
    padding: 0.5rem;
    border-radius: 4px;
    font-size: 0.875rem;
    z-index: 1000;
    pointer-events: none;
  }
</style>
```

### 4. インターセクションオブザーバー

```svelte live
<script lang="ts">
  function lazyLoad(node: HTMLElement, options: { threshold?: number } = {}) {
    // 初期状態を設定
    node.style.opacity = '0';
    node.style.transform = 'translateY(20px)';
    node.style.transition = 'all 0.5s ease';
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // 要素が表示領域に入ったらアニメーション
            node.style.opacity = '1';
            node.style.transform = 'translateY(0)';
            // 一度表示したら監視を解除
            observer.unobserve(node);
          }
        });
      },
      { 
        threshold: options.threshold || 0.1,
        rootMargin: '0px 0px -50px 0px' // 少し早めに発火
      }
    );
    
    observer.observe(node);
    
    return {
      destroy() {
        observer.disconnect();
      }
    };
  }
  
  // デモ用にアイテムを多めに作成
  const items = Array(8).fill(null).map((_, i) => ({
    id: i + 1,
    title: `セクション ${i + 1}`,
    content: `このコンテンツは遅延表示されます。スクロールすると要素が表示領域に入った時にフェードインアニメーションが実行されます。`
  }));
</script>

<div class="scroll-container">
  <div class="header">
    <p>📜 下にスクロールしてください</p>
    <p class="hint">要素が表示領域に入るとアニメーションします</p>
  </div>
  
  {#each items as item}
    <div 
      use:lazyLoad={{ threshold: 0.3 }}
      class="lazy-item"
    >
      <h3>🎯 {item.title}</h3>
      <p>{item.content}</p>
      <div class="meta">ID: {item.id}</div>
    </div>
  {/each}
  
  <div class="footer">
    <p>🎉 全ての要素が表示されました！</p>
  </div>
</div>

<style>
  .scroll-container {
    height: 400px;
    overflow-y: auto;
    padding: 1rem;
    background: linear-gradient(to bottom, #f5f5f5, #e8e8e8);
    border: 1px solid #ddd;
    border-radius: 8px;
    position: relative;
  }
  
  .header {
    text-align: center;
    padding: 1rem;
    background: white;
    border-radius: 8px;
    margin-bottom: 2rem;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  
  .header .hint {
    font-size: 0.875rem;
    color: #666;
    margin-top: 0.5rem;
  }
  
  .lazy-item {
    margin: 1.5rem 0;
    padding: 1.5rem;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    border-left: 4px solid #ff3e00;
  }
  
  .lazy-item h3 {
    margin: 0 0 0.5rem 0;
    color: #ff3e00;
  }
  
  .lazy-item p {
    margin: 0.5rem 0;
    line-height: 1.6;
    color: #333;
  }
  
  .meta {
    font-size: 0.75rem;
    color: #999;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #eee;
  }
  
  .footer {
    text-align: center;
    padding: 2rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 8px;
    margin-top: 2rem;
    font-weight: bold;
  }
  
  /* スクロールバーのスタイリング */
  .scroll-container::-webkit-scrollbar {
    width: 8px;
  }
  
  .scroll-container::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }
  
  .scroll-container::-webkit-scrollbar-thumb {
    background: #ff3e00;
    border-radius: 4px;
  }
  
  .scroll-container::-webkit-scrollbar-thumb:hover {
    background: #e03500;
  }
</style>
```

## TypeScriptとの統合

### アクションの型定義

```typescript
// アクションの型定義
type Action<T = any> = (
  node: HTMLElement,
  parameter?: T
) => {
  update?: (parameter: T) => void;
  destroy?: () => void;
} | void;

// 具体的な実装例
const typedAction: Action<{ duration: number; color: string }> = (
  node,
  options
) => {
  const { duration = 300, color = 'red' } = options || {};
  
  node.style.transition = `background-color ${duration}ms`;
  node.style.backgroundColor = color;
  
  return {
    update(newOptions) {
      const { duration = 300, color = 'red' } = newOptions || {};
      node.style.transition = `background-color ${duration}ms`;
      node.style.backgroundColor = color;
    },
    destroy() {
      node.style.transition = '';
      node.style.backgroundColor = '';
    }
  };
};
```

### 要素の型を限定

```typescript
function inputAction(node: HTMLInputElement, config: { maxLength: number }) {
  // HTMLInputElement固有のプロパティにアクセス可能
  node.maxLength = config.maxLength;
  
  const handleInput = () => {
    if (node.value.length >= config.maxLength) {
      node.style.borderColor = 'red';
    } else {
      node.style.borderColor = '';
    }
  };
  
  node.addEventListener('input', handleInput);
  
  return {
    destroy() {
      node.removeEventListener('input', handleInput);
    }
  };
}
```

## ベストプラクティス

### 1. クリーンアップを忘れない

```typescript
// ✅ 良い例：適切なクリーンアップ
function goodAction(node: HTMLElement) {
  const handler = () => console.log('clicked');
  node.addEventListener('click', handler);
  
  return {
    destroy() {
      node.removeEventListener('click', handler);
    }
  };
}

// ❌ 悪い例：メモリリーク
function badAction(node: HTMLElement) {
  node.addEventListener('click', () => console.log('clicked'));
  // リスナーの削除忘れ
}
```

### 2. パラメータの適切な処理

```typescript
// ✅ パラメータの変更に対応
function responsiveAction(node: HTMLElement, value: number) {
  node.textContent = String(value);
  
  return {
    update(newValue: number) {
      node.textContent = String(newValue);
    }
  };
}
```

### 3. 条件付き処理

```typescript
// ✅ 条件に応じた処理
function conditionalAction(node: HTMLElement, enabled: boolean) {
  let cleanup: (() => void) | null = null;
  
  function setup() {
    if (enabled) {
      // 有効時の処理
      cleanup = () => { /* クリーンアップ */ };
    }
  }
  
  setup();
  
  return {
    update(newEnabled: boolean) {
      cleanup?.();
      enabled = newEnabled;
      setup();
    },
    destroy() {
      cleanup?.();
    }
  };
}
```

## まとめ

`use:action`は、DOM要素を直接操作する必要がある場合に最適な機能です。

### 主なポイント

- **実行タイミング**: 要素のマウント時に自動実行
- **用途**: DOM操作、外部ライブラリ統合、カスタム動作の追加
- **ライフサイクル**: mount → update → destroy
- **イベントハンドラとの使い分け**: DOM操作はアクション、アプリロジックはイベントハンドラ

アクションを適切に使用することで、再利用可能でメンテナンスしやすいコンポーネントを作成できます。

<aside class="aside-box">

## 関連リソース

### 関連ページ
- [コンポーネントの基本](/svelte/basics/component-basics/) - イベントハンドリングの基礎
- [$effectルーン](/svelte/runes/effect/) - リアクティブな副作用の処理
- [TypeScript統合](/svelte/basics/typescript-integration/) - アクションの型定義

### 公式ドキュメント
- [Svelte公式: use directive](https://svelte.dev/docs/element-directives#use-action)
- [Svelte公式: Actions](https://svelte.dev/docs/svelte-action)

### よくある質問
- **Q: `use:action`と`$effect`の違いは？**
  - A: `use:action`はDOM要素に対して、`$effect`はリアクティブな値に対して使用します
- **Q: 複数のアクションを1つの要素に適用できる？**
  - A: はい、複数の`use:`ディレクティブを同じ要素に適用できます
- **Q: アクション内でコンポーネントの状態を更新できる？**
  - A: できますが、イベントハンドラを使用する方が推奨されます

</aside>

## 次のステップ

アクションの基本を理解したら、[Runesシステム](/svelte/runes/)に進んで、Svelte 5の新しいリアクティビティシステムを学びましょう。特に`$effect`との違いを理解することが重要です。