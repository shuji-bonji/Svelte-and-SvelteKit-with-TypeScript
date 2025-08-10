---
title: Svelte はコンパイル時に何をやっているのか？
description: Svelteが行う、コンパイル時最適化 について詳しく解説を行います
---

<script lang="ts">
  import Mermaid from '$lib/components/Mermaid.svelte';
  const svelteCompiler = `graph LR
    A["Svelteコンポーネント .svelte"] --> B["コンパイラ svelte/compiler"]
    B --> C["最適化されたJS バニラJavaScript"]
    C --> D["ブラウザ実行 フレームワークなし"]
    
    style A fill:#ff6b6b
    style B fill:#4ecdc4
    style C fill:#45b7d1
    style D fill:#96ceb4`;
</script>

以下、Svelteの「コンパイル時最適化」について詳しく解説を行います。

## 📊 コンパイル時最適化の全体像

Svelteは**ビルド時にコンポーネントを解析し、必要最小限のJavaScriptコードに変換**します。これは、ReactやVueのようにランタイムでフレームワークのコードを実行するのとは根本的に異なります。

<Mermaid code={svelteCompiler} />


## 🔍 具体的に何をどう最適化するのか

### 1. **リアクティブな変数の依存関係を静的解析**

```svelte
<!-- Svelteコンポーネント -->
<script>
  let count = $state(0);
  let doubled = $derived(count * 2);
  let message = $derived(`Count is ${count}`);
</script>

<button onclick={() => count++}>
  Clicked {count} times
</button>
<p>{doubled}</p>
<p>{message}</p>
```

コンパイル後：
```javascript
// 簡略化したコンパイル結果
let count = 0;
let doubled, message;

// 依存関係を事前に把握し、必要な更新のみ実行
function update_count(value) {
  count = value;
  // コンパイラが依存を解析済み
  doubled = count * 2;
  message = `Count is ${count}`;
  
  // 影響を受ける要素だけを直接更新
  button.textContent = `Clicked ${count} times`;
  p1.textContent = doubled;
  p2.textContent = message;
}
```

### 2. **Virtual DOM diffingの代わりに「サージカルアップデート」**

従来のフレームワーク（React/Vue）の処理フロー：
```
状態変更 → 新Virtual DOM生成 → 旧Virtual DOMと比較 → 差分を実DOMに適用
```

Svelteの処理フロー：
```
状態変更 → 事前に特定された箇所のみ直接更新
```

具体例で比較：

```javascript
// React/Vueの場合（実行時に差分計算）
function render() {
  const newVDOM = {
    type: 'div',
    children: [
      { type: 'h1', props: { children: count }},
      { type: 'p', props: { children: doubled }}
    ]
  };
  // ここで差分計算が発生
  diff(oldVDOM, newVDOM);
}

// Svelteの場合（コンパイル時に更新箇所を特定）
function update(count) {
  // 変更箇所を直接更新（差分計算なし）
  h1.textContent = count;
  p.textContent = count * 2;
}
```

### 3. **使用していないコードの除去（Tree Shaking）**

```svelte
<!-- Svelteコンポーネント -->
<script>
  import { onMount, afterUpdate, beforeUpdate } from 'svelte';
  
  // onMountのみ使用
  onMount(() => {
    console.log('mounted');
  });
</script>
```

コンパイル後、`afterUpdate`と`beforeUpdate`のコードは**バンドルに含まれません**。

Angularの場合、使用していないライフサイクルフックも含めて、フレームワークの基本機能がバンドルに含まれます。

### 4. **条件分岐の最適化**

```svelte
{#if visible}
  <div>Content</div>
{/if}
```

コンパイル後：
```javascript
// ブロックの作成・破棄を効率的に管理
let if_block = visible ? create_if_block() : null;

function update(visible) {
  if (visible) {
    if (!if_block) {
      if_block = create_if_block();
      if_block.mount(target);
    }
  } else if (if_block) {
    if_block.destroy();
    if_block = null;
  }
}
```

## 📈 パフォーマンス比較（具体的な数値）

プロジェクトナレッジの情報を基に：

| 項目 | Angular | React | Vue 3 | Svelte 5 |
|------|---------|--------|-------|----------|
| **Hello Worldのバンドルサイズ** | ~130KB | ~45KB | ~35KB | **~10KB** |
| **1000要素の作成時間** | ~50ms | ~30ms | ~25ms | **~15ms** |
| **メモリ使用量（1000要素）** | ~20MB | ~10MB | ~8MB | **~5MB** |
| **ランタイムオーバーヘッド** | 高 | 中 | 中 | **最小** |

## 🎯 Angularとの決定的な違い

Angularエンジニアの視点から見た主な違い：

| 観点 | Angular | Svelte |
|------|---------|---------|
| **変更検知** | Zone.js + Change Detection Strategy | コンパイル時に依存関係を解決 |
| **テンプレート処理** | ランタイムでテンプレートを解釈 | ビルド時にJSコードに変換 |
| **DI（依存性注入）** | 複雑なDIシステム | なし（シンプルなimport/export） |
| **RxJS** | 標準搭載（リアクティブプログラミング） | `$state`/`$derived`で代替可能 |
| **デコレータ** | `@Component`, `@Injectable`など必須 | 不要（プレーンなJavaScript） |

## 💡 実践的な例：TodoListの比較

Angularでの実装：
```typescript
@Component({
  selector: 'app-todo',
  template: `
    <div *ngFor="let todo of todos$ | async">
      {{ todo.text }}
    </div>
  `
})
export class TodoComponent {
  todos$ = this.todoService.getTodos();
  
  constructor(private todoService: TodoService) {}
}
```

Svelteでの実装：
```svelte
<script lang="ts">
  let todos = $state([]);
  
  // 直接的でシンプル
  onMount(async () => {
    todos = await fetchTodos();
  });
</script>

{#each todos as todo}
  <div>{todo.text}</div>
{/each}
```

## 🚀 なぜSvelteは高速なのか？まとめ

1. **実行時の処理を削減**
   - Virtual DOM diffingなし
   - フレームワークのランタイムコードが最小限
   - 変更検知の処理がない

2. **コンパイル時に最適化**
   - 依存関係を事前に解析
   - 更新箇所を特定
   - 不要なコードを除去

3. **直接的なDOM操作**
   - 仲介層（Virtual DOM）なし
   - メモリ使用量削減
   - CPUサイクル削減

これらの最適化により、Svelteは「Write less, do more」を実現し、開発者は少ないコードで高速なアプリケーションを構築できるのです。
