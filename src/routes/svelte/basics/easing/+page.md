---
title: svelte/easing - イージング関数
description: Svelteのsvelte/easingモジュールで提供されるイージング関数。トランジションやアニメーションの動きを制御するTypeScriptでの実装方法を解説
---

<script>
  import Mermaid from '$lib/components/Mermaid.svelte';

  const easingDiagram = `flowchart TB
    subgraph input[入力]
        T["t (0 → 1)"]
    end

    subgraph easing[イージング関数]
        direction TB
        L[linear: 一定速度]
        EI[easeIn: ゆっくり始まり加速]
        EO[easeOut: 速く始まり減速]
        EIO[easeInOut: ゆっくり始まり終わる]
    end

    subgraph output[出力]
        O[変換後の値]
    end

    T --> easing --> O

    style input fill:#e1f5fe,color:#333
    style easing fill:#fff3e0,color:#333
    style output fill:#e8f5e9,color:#333
    style T fill:#fff,color:#333
    style L fill:#fff,color:#333
    style EI fill:#fff,color:#333
    style EO fill:#fff,color:#333
    style EIO fill:#fff,color:#333
    style O fill:#fff,color:#333`;
</script>

`svelte/easing` モジュールは、トランジションやアニメーションの動きを制御するイージング関数を提供します。
これらの関数を使用することで、より自然で魅力的なアニメーションを実現できます。

## この記事で学べること

- イージング関数の基本概念
- 利用可能なイージング関数一覧
- トランジションとの組み合わせ
- svelte/motion との連携
- カスタムイージングの作成

## イージング関数とは

イージング関数は、アニメーションの進行を時間に対してどのように変化させるかを定義します。

<Mermaid diagram={easingDiagram} />

## 基本的な使い方

イージング関数は、トランジションの `easing` オプションに渡して使用します。以下の例では、`fade` トランジションに `cubicOut` イージングを適用しています。

```svelte
<script lang="ts">
  import { fade } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';

  let visible = $state(true);
</script>

<button onclick={() => visible = !visible}>
  切り替え
</button>

{#if visible}
  <div transition:fade={{ duration: 300, easing: cubicOut }}>
    イージング付きフェード
  </div>
{/if}
```

## 利用可能なイージング関数

Svelte は、Robert Penner のイージング方程式に基づいた 31 種類のイージング関数を提供しています。各関数は `In`（加速）、`Out`（減速）、`InOut`（加速→減速）の 3 つのバリエーションがあります。

### 一覧表

| カテゴリ    | In          | Out          | InOut          |
| ----------- | ----------- | ------------ | -------------- |
| **linear**  | -           | -            | `linear`       |
| **sine**    | `sineIn`    | `sineOut`    | `sineInOut`    |
| **quad**    | `quadIn`    | `quadOut`    | `quadInOut`    |
| **cubic**   | `cubicIn`   | `cubicOut`   | `cubicInOut`   |
| **quart**   | `quartIn`   | `quartOut`   | `quartInOut`   |
| **quint**   | `quintIn`   | `quintOut`   | `quintInOut`   |
| **expo**    | `expoIn`    | `expoOut`    | `expoInOut`    |
| **circ**    | `circIn`    | `circOut`    | `circInOut`    |
| **back**    | `backIn`    | `backOut`    | `backInOut`    |
| **elastic** | `elasticIn` | `elasticOut` | `elasticInOut` |
| **bounce**  | `bounceIn`  | `bounceOut`  | `bounceInOut`  |

### インポート方法

必要なイージング関数を `svelte/easing` からインポートします。通常は 1〜2 個の関数のみを使用することが多いですが、以下にすべての関数を示します。

```typescript
import {
	// 線形
	linear,

	// サイン波
	sineIn,
	sineOut,
	sineInOut,

	// 2乗
	quadIn,
	quadOut,
	quadInOut,

	// 3乗（最も一般的）
	cubicIn,
	cubicOut,
	cubicInOut,

	// 4乗
	quartIn,
	quartOut,
	quartInOut,

	// 5乗
	quintIn,
	quintOut,
	quintInOut,

	// 指数関数
	expoIn,
	expoOut,
	expoInOut,

	// 円形
	circIn,
	circOut,
	circInOut,

	// オーバーシュート
	backIn,
	backOut,
	backInOut,

	// 弾性
	elasticIn,
	elasticOut,
	elasticInOut,

	// バウンス
	bounceIn,
	bounceOut,
	bounceInOut,
} from 'svelte/easing';
```

## 各イージング関数の特徴

各イージング関数には異なる特性があり、用途に応じて使い分けることで、より効果的なアニメーションを実現できます。以下に代表的な関数の特徴と使用例を紹介します。

### linear（線形）

一定速度で進行します。加速も減速もありません。

```svelte
<script lang="ts">
  import { slide } from 'svelte/transition';
  import { linear } from 'svelte/easing';

  let show = $state(false);
</script>

{#if show}
  <div transition:slide={{ easing: linear }}>
    一定速度で展開
  </div>
{/if}
```

### sine（サイン波）

最も緩やかな加減速です。

```svelte
<script lang="ts">
  import { fly } from 'svelte/transition';
  import { sineOut } from 'svelte/easing';

  let visible = $state(true);
</script>

{#if visible}
  <div transition:fly={{ y: 20, easing: sineOut }}>
    緩やかに減速
  </div>
{/if}
```

### cubic（3 乗）

最も一般的に使用されるイージングです。自然な動きを実現します。

```svelte
<script lang="ts">
  import { scale } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';

  let open = $state(false);
</script>

<button onclick={() => open = !open}>モーダルを開く</button>

{#if open}
  <div
    class="modal"
    transition:scale={{ duration: 200, easing: cubicOut }}
  >
    モーダルコンテンツ
  </div>
{/if}
```

### back（オーバーシュート）

目標値を少し超えてから戻る動きをします。

```svelte
<script lang="ts">
  import { fly } from 'svelte/transition';
  import { backOut } from 'svelte/easing';

  let items = $state<string[]>([]);

  function addItem() {
    items = [...items, `アイテム ${items.length + 1}`];
  }
</script>

<button onclick={addItem}>追加</button>

{#each items as item (item)}
  <div transition:fly={{ x: -50, easing: backOut }}>
    {item}
  </div>
{/each}
```

### elastic（弾性）

ゴムのような弾性的な動きをします。

```svelte
<script lang="ts">
  import { scale } from 'svelte/transition';
  import { elasticOut } from 'svelte/easing';

  let bounce = $state(false);
</script>

<button onclick={() => bounce = !bounce}>
  弾む
</button>

{#if bounce}
  <div
    class="bouncy-element"
    transition:scale={{ duration: 800, easing: elasticOut }}
  >
    弾性アニメーション
  </div>
{/if}
```

### bounce（バウンス）

床で跳ねるような動きをします。

```svelte
<script lang="ts">
  import { fly } from 'svelte/transition';
  import { bounceOut } from 'svelte/easing';

  let dropped = $state(false);
</script>

<button onclick={() => dropped = true}>
  ドロップ
</button>

{#if dropped}
  <div
    class="dropped-item"
    transition:fly={{ y: -200, duration: 1000, easing: bounceOut }}
  >
    バウンス！
  </div>
{/if}
```

## svelte/motion との連携

イージング関数は `svelte/transition` だけでなく、`svelte/motion` の `Tween` クラスでも使用できます。`Tween` では、数値やオブジェクトを指定した時間で補間する際にイージングを適用します。

### Tween でのイージング

以下の例では、プログレスバーの幅を `Tween` と `cubicOut` イージングを使用してアニメーションしています。

```svelte
<script lang="ts">
  import { Tween } from 'svelte/motion';
  import { cubicOut, elasticOut } from 'svelte/easing';

  let progress = new Tween(0, {
    duration: 400,
    easing: cubicOut
  });

  function animate() {
    progress.set(progress.current === 0 ? 100 : 0);
  }
</script>

<button onclick={animate}>アニメーション</button>

<div class="progress-bar">
  <div
    class="progress-fill"
    style="width: {progress.current}%"
  ></div>
</div>

<style>
  .progress-bar {
    width: 100%;
    height: 20px;
    background: #e0e0e0;
    border-radius: 10px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: #ff3e00;
    transition: none;
  }
</style>
```

### Spring との比較

`Tween` と `Spring` は異なるアプローチでアニメーションを実現します。`Tween` はイージング関数で動きを制御し、`Spring` は物理パラメータ（stiffness、damping）で制御します。以下は同じターゲット値に対する両者の動きの違いを示す例です。

```svelte
<script lang="ts">
  import { Tween, Spring } from 'svelte/motion';
  import { elasticOut } from 'svelte/easing';

  // Tween: イージング関数で制御
  let tweenValue = new Tween(0, {
    duration: 600,
    easing: elasticOut
  });

  // Spring: 物理パラメータで制御
  let springValue = new Spring(0, {
    stiffness: 0.1,
    damping: 0.2
  });

  function animate() {
    const target = tweenValue.current === 0 ? 100 : 0;
    tweenValue.set(target);
    springValue.set(target);
  }
</script>

<button onclick={animate}>比較</button>

<div class="comparison">
  <div class="box" style="transform: translateX({tweenValue.current}px)">
    Tween + elasticOut
  </div>
  <div class="box" style="transform: translateX({springValue.current}px)">
    Spring
  </div>
</div>
```

## 実践例

イージング関数を活用した実践的なUIパターンを紹介します。これらの例を参考に、自分のアプリケーションに適したアニメーションを設計しましょう。

### アニメーション付きリスト

リストアイテムの追加・削除時にイージング付きのアニメーションを適用する例です。`flip` アニメーション（リスト内の位置移動）、`fly` トランジション（アイテム追加）、`fade` トランジション（アイテム削除）を組み合わせています。

```svelte
<script lang="ts">
  import { flip } from 'svelte/animate';
  import { fade, fly } from 'svelte/transition';
  import { quintOut, backOut } from 'svelte/easing';

  interface Todo {
    id: number;
    text: string;
    done: boolean;
  }

  let todos = $state<Todo[]>([
    { id: 1, text: 'Svelteを学ぶ', done: false },
    { id: 2, text: 'イージングを理解する', done: false },
  ]);

  let newTodo = $state('');
  let nextId = $state(3);

  function addTodo() {
    if (!newTodo.trim()) return;
    todos = [...todos, { id: nextId++, text: newTodo, done: false }];
    newTodo = '';
  }

  function removeTodo(id: number) {
    todos = todos.filter(t => t.id !== id);
  }

  function toggleTodo(id: number) {
    todos = todos.map(t =>
      t.id === id ? { ...t, done: !t.done } : t
    );
  }
</script>

<div class="todo-app">
  <form onsubmit={(e) => { e.preventDefault(); addTodo(); }}>
    <input bind:value={newTodo} placeholder="新しいタスク" />
    <button type="submit">追加</button>
  </form>

  <ul>
    {#each todos as todo (todo.id)}
      <li
        animate:flip={{ duration: 300, easing: quintOut }}
        in:fly={{ x: -100, duration: 300, easing: backOut }}
        out:fade={{ duration: 200 }}
      >
        <input
          type="checkbox"
          checked={todo.done}
          onchange={() => toggleTodo(todo.id)}
        />
        <span class:done={todo.done}>{todo.text}</span>
        <button onclick={() => removeTodo(todo.id)}>削除</button>
      </li>
    {/each}
  </ul>
</div>

<style>
  .done {
    text-decoration: line-through;
    opacity: 0.5;
  }
</style>
```

### モーダルダイアログ

モーダルダイアログの表示に `backOut` イージングを使用することで、少しオーバーシュートする動きが生まれ、ユーザーの注目を集めることができます。オーバーレイには `fade` を使用して、背景が自然に暗くなるようにしています。

```svelte
<script lang="ts">
  import { fade, scale } from 'svelte/transition';
  import { cubicOut, backOut } from 'svelte/easing';

  let showModal = $state(false);
</script>

<button onclick={() => showModal = true}>
  モーダルを開く
</button>

{#if showModal}
  <!-- オーバーレイ -->
  <div
    class="overlay"
    transition:fade={{ duration: 200 }}
    onclick={() => showModal = false}
  ></div>

  <!-- モーダル本体 -->
  <div
    class="modal"
    transition:scale={{
      duration: 300,
      start: 0.8,
      easing: backOut
    }}
  >
    <h2>タイトル</h2>
    <p>モーダルの内容</p>
    <button onclick={() => showModal = false}>
      閉じる
    </button>
  </div>
{/if}

<style>
  .overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
  }

  .modal {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  }
</style>
```

### スクロールトリガーアニメーション

Intersection Observer を使用して、要素が画面内に入った時にアニメーションを開始する例です。`fly` トランジションと `cubicOut` イージングを組み合わせることで、セクションが下から滑らかに出現します。

```svelte
<script lang="ts">
  import { fly } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';

  let sections = $state([
    { id: 1, visible: false, title: 'セクション1' },
    { id: 2, visible: false, title: 'セクション2' },
    { id: 3, visible: false, title: 'セクション3' },
  ]);

  function handleIntersection(id: number, isVisible: boolean) {
    sections = sections.map(s =>
      s.id === id ? { ...s, visible: isVisible } : s
    );
  }
</script>

{#each sections as section (section.id)}
  <div
    class="section"
    use:intersectionObserver={{
      callback: (visible) => handleIntersection(section.id, visible)
    }}
  >
    {#if section.visible}
      <div
        in:fly={{ y: 50, duration: 600, easing: cubicOut }}
      >
        <h2>{section.title}</h2>
        <p>セクションの内容</p>
      </div>
    {/if}
  </div>
{/each}
```

## カスタムイージング

標準のイージング関数で希望の動きが得られない場合、独自のイージング関数を作成できます。イージング関数は、0〜1 の範囲の入力値 `t` を受け取り、変換後の値（通常は 0〜1 ですが、backOut のようにオーバーシュートする場合は範囲外も可）を返す単純な関数です。

```typescript
// イージング関数の型
type EasingFunction = (t: number) => number;

// カスタムイージング: ステップ関数
function steps(numSteps: number): EasingFunction {
	return (t: number) => Math.floor(t * numSteps) / numSteps;
}

// カスタムイージング: ベジェ曲線
function bezier(x1: number, y1: number, x2: number, y2: number): EasingFunction {
	// 簡略化した実装
	return (t: number) => {
		const cx = 3 * x1;
		const bx = 3 * (x2 - x1) - cx;
		const ax = 1 - cx - bx;

		const cy = 3 * y1;
		const by = 3 * (y2 - y1) - cy;
		const ay = 1 - cy - by;

		function sampleY(t: number): number {
			return ((ay * t + by) * t + cy) * t;
		}

		return sampleY(t);
	};
}
```

### カスタムイージングの使用

以下は、カスタムのステップ関数を使用した例です。この関数は連続的な動きではなく、指定した段階数で離散的に変化するアニメーションを生成します。

```svelte
<script lang="ts">
  import { fade } from 'svelte/transition';

  // ステップアニメーション
  function steps(n: number) {
    return (t: number) => Math.floor(t * n) / n;
  }

  let show = $state(true);
</script>

{#if show}
  <div transition:fade={{ duration: 500, easing: steps(5) }}>
    5段階のステップフェード
  </div>
{/if}
```

## イージングの選び方

イージング関数の選択は、UIの印象を大きく左右します。一般的には `cubicOut` が最も汎用的で、多くの場面で自然な動きを提供します。以下に用途別の推奨イージングを示します。

### 用途別推奨

| 用途               | 推奨イージング | 理由             |
| ------------------ | -------------- | ---------------- |
| UI 要素の表示      | `cubicOut`     | 自然で速い反応   |
| UI 要素の非表示    | `cubicIn`      | 滑らかな消失     |
| モーダル           | `backOut`      | 注目を集める動き |
| ドロップダウン     | `quintOut`     | 軽快な動き       |
| 通知               | `elasticOut`   | 目立つ動き       |
| ドラッグ＆ドロップ | `quadOut`      | 適度な減速       |
| ページ遷移         | `sineInOut`    | 緩やかで上品     |

### パフォーマンス考慮

`bounceOut` や `elasticOut` のような複雑なイージング関数は、内部で多くの計算を行います。大量の要素を同時にアニメーションさせる場合や、低スペックデバイスを考慮する場合は、`cubicOut` や `quadOut` のようなシンプルなイージングを選択することでパフォーマンスを向上できます。

```svelte
<script lang="ts">
  import { fly } from 'svelte/transition';
  import { cubicOut, bounceOut } from 'svelte/easing';

  // パフォーマンスが重要な場合は単純なイージングを使用
  const performantEasing = cubicOut;

  // 視覚効果が重要な場合は複雑なイージングも可
  const fancyEasing = bounceOut;

  let show = $state(true);
</script>

{#if show}
  <div transition:fly={{ y: 20, easing: performantEasing }}>
    パフォーマンス優先
  </div>
{/if}
```

## 型定義

TypeScript でイージング関数を使用する場合、以下の型定義を参照できます。カスタムイージング関数を作成する際は、この `EasingFunction` 型に準拠するようにしましょう。

```typescript
// イージング関数の型
type EasingFunction = (t: number) => number;

// 全イージング関数の型
declare function backIn(t: number): number;
declare function backInOut(t: number): number;
declare function backOut(t: number): number;
declare function bounceIn(t: number): number;
declare function bounceInOut(t: number): number;
declare function bounceOut(t: number): number;
declare function circIn(t: number): number;
declare function circInOut(t: number): number;
declare function circOut(t: number): number;
declare function cubicIn(t: number): number;
declare function cubicInOut(t: number): number;
declare function cubicOut(t: number): number;
declare function elasticIn(t: number): number;
declare function elasticInOut(t: number): number;
declare function elasticOut(t: number): number;
declare function expoIn(t: number): number;
declare function expoInOut(t: number): number;
declare function expoOut(t: number): number;
declare function linear(t: number): number;
declare function quadIn(t: number): number;
declare function quadInOut(t: number): number;
declare function quadOut(t: number): number;
declare function quartIn(t: number): number;
declare function quartInOut(t: number): number;
declare function quartOut(t: number): number;
declare function quintIn(t: number): number;
declare function quintInOut(t: number): number;
declare function quintOut(t: number): number;
declare function sineIn(t: number): number;
declare function sineInOut(t: number): number;
declare function sineOut(t: number): number;
```

## まとめ

`svelte/easing` を使用することで、以下のことが実現できます。

- **自然な動き**: 物理的に自然なアニメーション
- **視覚的なフィードバック**: ユーザーアクションへの適切な反応
- **UI の洗練**: プロフェッショナルな見た目
- **アクセシビリティ**: `prefers-reduced-motion` との組み合わせ

適切なイージング関数を選ぶことで、アプリケーションの使用感が大きく向上します。

## 次のステップ

- [トランジション・アニメーション](/svelte/basics/transitions/) - トランジションの詳細
- [svelte/motion](/svelte/basics/motion/) - Spring と Tween
- [アニメーション](/svelte/basics/transitions/) - flip アニメーション
