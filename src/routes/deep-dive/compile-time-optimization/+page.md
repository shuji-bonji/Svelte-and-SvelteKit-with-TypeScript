---
title: Svelte はコンパイル時に何をやっているのか？
description: Svelte5のコンパイル時最適化の仕組みをTypeScriptで徹底解説 - 依存関係の静的解析、サージカルアップデート、Tree Shakingによる高速化、最小バンドルサイズ実現の秘密を実例を交えて体系的に詳しく解説します
---

<script lang="ts">
  import Mermaid from '$lib/components/Mermaid.svelte';
  const svelteCompiler = `graph LR
    A["Svelteコンポーネント .svelte"] --> B["コンパイラ svelte/compiler"]
    B --> C["最適化されたJS Vanilla JavaScript"]
    C --> D["ブラウザ実行 フレームワークなし"]
    
    style A fill:#ff6b6b
    style B fill:#4ecdc4
    style C fill:#45b7d1
    style D fill:#96ceb4`;
</script>

以下、Svelteの「コンパイル時最適化」について詳しく解説を行います。

## コンパイル時最適化の全体像

Svelteは**ビルド時にコンポーネントを解析し、必要最小限のJavaScriptコードに変換**します。これは、ReactやVueのようにランタイムでフレームワークのコードを実行するのとは根本的に異なります。

<Mermaid diagram={svelteCompiler} />


## リアクティブな変数の依存関係を静的解析

Svelteのコンパイラは、コンポーネント内の変数間の依存関係をビルド時に完全に把握します。これにより、ある変数が変更された際に、どの変数を更新し、どのDOM要素を更新すべきかを事前に知ることができます。実行時に依存関係を追跡する必要がないため、パフォーマンスが大幅に向上します。

### 元のSvelteコンポーネント
```svelte
<!-- Svelteコンポーネント -->
<script>
  // $state: リアクティブな状態変数を定義
  let count = $state(0);
  // $derived: countに依存する派生値を定義
  let doubled = $derived(count * 2);
  // 複数の変数から派生値を作成できる
  let message = $derived(`Count is ${count}`);
</script>

<button onclick={() => count++}>
  Clicked {count} times
</button>
<p>{doubled}</p>
<p>{message}</p>
```

### コンパイル後のJavaScriptコード

コンパイラは依存関係を解析し、countが変更されたときにdoubledとmessageも更新する必要があることを把握しています。

```javascript
// 簡略化したコンパイル結果
// Svelteコンパイラが生成する実際のコードを簡略化したもの
let count = 0;
let doubled, message;

// 依存関係を事前に把握し、必要な更新のみ実行
function update_count(value) {
  count = value;
  // コンパイラが依存を解析済み
  // doubledはcountに依存することをコンパイル時に把握
  doubled = count * 2;
  message = `Count is ${count}`;
  
  // 影響を受ける要素だけを直接更新
  // DOM要素への参照はコンパイル時に保存されている
  button.textContent = `Clicked ${count} times`;
  p1.textContent = doubled;
  p2.textContent = message;
}
```

## Virtual DOM diffingの代わりに「サージカルアップデート」

「サージカルアップデート（Surgical Updates）」とは、まるで外科手術のように正確に、変更が必要な箇所だけをピンポイントで更新する手法です。ReactやVueのようなVirtual DOMを使用するフレームワークとは異なり、Svelteは変更箇所を事前に特定し、直接DOMを操作します。

#### 従来のフレームワーク（React/Vue）の処理フロー
```
状態変更 → 新Virtual DOM生成 → 旧Virtual DOMと比較 → 差分を実DOMに適用
```

#### Svelteの処理フロー
```
状態変更 → 事前に特定された箇所のみ直接更新
```

### 具体例で比較

実際のコードで、Virtual DOMを使用するフレームワークとSvelteの違いを見てみましょう。

```javascript
// React/Vueの場合（実行時に差分計算）
// 毎回Virtual DOMツリー全体を生成し、前回のツリーと比較する
function render() {
  // Virtual DOMオブジェクトを生成（メモリ使用）
  const newVDOM = {
    type: 'div',
    children: [
      { type: 'h1', props: { children: count }},
      { type: 'p', props: { children: doubled }}
    ]
  };
  // ここで差分計算が発生（CPUコストが高い）
  // 全てのノードを比較して変更箇所を探す
  diff(oldVDOM, newVDOM);
}

// Svelteの場合（コンパイル時に更新箇所を特定）
// コンパイル時に「countが変更されたらh1とpを更新」と決定済み
function update(count) {
  // 変更箇所を直接更新（差分計算なし）
  // DOMノードへの参照は既に保持されている
  // Virtual DOMの生成や比較は一切不要
  h1.textContent = count;
  p.textContent = count * 2;
}
```

## 使用していないコードの除去（Tree Shaking）

Svelteは、コンポーネントで実際に使用されている機能のみをバンドルに含めます。これは単純なimport文の解析だけでなく、テンプレート内で使用されている機能も含めて、コンパイル時に必要な機能を正確に判断します。

### 使用例：ライフサイクルフック
```svelte
<!-- Svelteコンポーネント -->
<script>
  import { onMount, afterUpdate, beforeUpdate } from 'svelte';
  
  // onMountのみ使用
  // afterUpdateとbeforeUpdateはimportされているが使用されていない
  onMount(() => {
    console.log('mounted');
  });
  // afterUpdateとbeforeUpdateのコードはバンドルに含まれない
</script>
```

コンパイル後、`afterUpdate`と`beforeUpdate`のコードは**バンドルに含まれません**。

Angularの場合、使用していないライフサイクルフックも含めて、フレームワークの基本機能がバンドルに含まれます。

## 条件分岐の最適化

Svelteは`{#if}`ブロックのような条件分岐を、効率的なJavaScriptコードに変換します。条件が変更されたときに、DOM要素の作成・破棄を最小限のオーバーヘッドで実行できるように最適化されます。

### 元のSvelteテンプレート
```svelte
<!-- シンプルな条件分岐 -->
{#if visible}
  <div>Content</div>
{/if}
```

### コンパイル後の最適化されたコード

コンパイラは条件ブロックを管理する効率的な関数を生成します。

```javascript
// ブロックの作成・破棄を効率的に管理
// DOMノードの再利用とメモリ管理が最適化されている

// 初期状態でifブロックを管理
let if_block = visible ? create_if_block() : null;

function update(visible) {
  if (visible) {
    // ブロックが存在しない場合のみ作成
    if (!if_block) {
      if_block = create_if_block();
      if_block.mount(target);  // DOMにマウント
    }
    // 既に存在する場合は何もしない（最適化）
  } else if (if_block) {
    // 非表示時はDOMから完全に削除
    if_block.destroy();
    if_block = null;
  }
}
```

## パフォーマンス比較（具体的な数値）

各フレームワークのパフォーマンスを、実際のベンチマーク結果を基に比較します。バンドルサイズ、実行速度、メモリ使用量のすべてにおいて、Svelteが優れていることがわかります。

### プロジェクトナレッジの情報を基に

| 項目 | Angular | React | Vue 3 | Svelte 5 |
|------|---------|--------|-------|----------|
| **Hello Worldのバンドルサイズ** | ~130KB | ~45KB | ~35KB | **~10KB** |
| **1000要素の作成時間** | ~50ms | ~30ms | ~25ms | **~15ms** |
| **メモリ使用量（1000要素）** | ~20MB | ~10MB | ~8MB | **~5MB** |
| **ランタイムオーバーヘッド** | 高 | 中 | 中 | **最小** |

## Angularとの決定的な違い

Angularは強力なフレームワークですが、その分ランタイムのオーバーヘッドも大きくなります。Svelteは異なるアプローチを取ることで、よりシンプルで高速なアプリケーションを実現します。

### Angularエンジニアの視点から見た主な違い

| 観点 | Angular | Svelte |
|------|---------|---------|
| **変更検知** | Zone.js + Change Detection Strategy | コンパイル時に依存関係を解決 |
| **テンプレート処理** | ランタイムでテンプレートを解釈 | ビルド時にJSコードに変換 |
| **DI（依存性注入）** | 複雑なDIシステム | なし（シンプルなimport/export） |
| **RxJS** | 標準搭載（リアクティブプログラミング） | `$state`/`$derived`で代替可能 |
| **デコレータ** | `@Component`, `@Injectable`など必須 | 不要（プレーンなJavaScript） |

## 実践的な例：TodoListの比較

同じTodoリストアプリケーションを、AngularとSvelteで実装した場合の違いを見てみましょう。コードの量、複雑さ、そして実行時のパフォーマンスに注目してください。

### Angularでの実装

Angularでは、デコレータ、サービス、DIシステム、RxJSなど、多くの概念が必要です。

```typescript
// デコレータでコンポーネントを定義
@Component({
  selector: 'app-todo',
  template: `
    <!-- Angularテンプレート構文 -->
    <div *ngFor="let todo of todos$ | async">
      {{ todo.text }}
    </div>
  `
})
export class TodoComponent {
  // RxJS Observableを使用
  todos$ = this.todoService.getTodos();
  
  // DIシステムでサービスを注入
  constructor(private todoService: TodoService) {}
}
```

### Svelteでの実装

Svelteでは、より直感的でシンプルなコードで同じ機能を実現できます。

```svelte
<script lang="ts">
  // シンプルなリアクティブ変数
  let todos = $state([]);
  
  // 直接的でシンプル
  // DIコンテナ、デコレータ、RxJSなど不要
  onMount(async () => {
    // 通常のFetch APIを使用
    todos = await fetchTodos();
  });
</script>

<!-- Svelteのテンプレート構文 -->
{#each todos as todo}
  <div>{todo.text}</div>
{/each}
```

## なぜSvelteは高速なのか？まとめ

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
