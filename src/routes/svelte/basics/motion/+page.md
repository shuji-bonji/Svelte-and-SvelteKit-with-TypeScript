---
title: svelte/motion - アニメーション値
description: Svelteのsvelte/motionモジュールでスムーズなアニメーションを実現。Spring、Tweenクラス、prefersReducedMotionをTypeScriptで解説
---

<script>
	import Admonition from '$lib/components/Admonition.svelte';
  import Mermaid from '$lib/components/Mermaid.svelte';

  const parametersDiagram = `flowchart LR
    subgraph stiffness[stiffness - 硬さ]
        direction LR
        SL["低い値 (0.1) ゆっくり、柔らかい動き"] --> SH["高い値 (1.0) 素早く、硬い動き"]
    end

    subgraph damping[damping - 減衰]
        direction LR
        DL["低い値 (0.3) よく弾む、振動が続く"] --> DH["高い値 (0.9) すぐに収束する"]
    end

    style stiffness fill:#fff3e0,color:#333
    style damping fill:#e3f2fd,color:#333
    style SL fill:#fff,color:#333
    style SH fill:#fff,color:#333
    style DL fill:#fff,color:#333
    style DH fill:#fff,color:#333`;

  const comparisonDiagram = `flowchart LR
    subgraph spring["Spring（バネ）"]
        direction TB
        S1["物理的に自然な動き"]
        S2["ユーザー操作に即座に反応"]
        S3["ドラッグ、ジェスチャー、インタラクティブUI"]
        S4["終了時間が不確定"]
    end

    subgraph tween["Tween（トゥイーン）"]
        direction TB
        T1["予測可能な動き"]
        T2["正確なタイミング制御"]
        T3["ページ遷移、プログレスバー、カウンター"]
        T4["終了時間が確定"]
    end

    style spring fill:#e3f2fd,color:#333
    style tween fill:#fff3e0,color:#333
    style S1 fill:#bbdefb,color:#333
    style S2 fill:#bbdefb,color:#333
    style S3 fill:#bbdefb,color:#333
    style S4 fill:#bbdefb,color:#333
    style T1 fill:#ffe0b2,color:#333
    style T2 fill:#ffe0b2,color:#333
    style T3 fill:#ffe0b2,color:#333
    style T4 fill:#ffe0b2,color:#333`;
</script>

`svelte/motion` モジュールは、値の変化を滑らかにアニメーションさせるための機能を提供します。
Spring（バネ）や Tween（トゥイーン）を使って、自然な動きのある UI を実装できます。

## この記事で学べること

- `Spring` クラスによるバネアニメーション
- `Tween` クラスによるトゥイーンアニメーション
- `prefersReducedMotion` によるアクセシビリティ対応
- 実践的なアニメーションパターン

## Spring クラス

<Admonition type="info" title="バージョン要件">

`Spring` クラスは Svelte 5.8.0 以降で利用可能です。

</Admonition>
`Spring` は、バネのような物理シミュレーションで値を滑らかに変化させます。
`stiffness`（硬さ）と `damping`（減衰）パラメータで動きを制御できます。

### 基本的な使い方

以下の例では、スライダーを動かすと `target` 値が即座に変化し、`current` 値がバネのようにゆっくり追従します。これにより、自然で心地よい動きが実現できます。

```svelte
<script lang="ts">
  import { Spring } from 'svelte/motion';

  // 初期値を指定してSpringを作成
  const spring = new Spring(0);
</script>

<div>
  <label>
    Target: {spring.target}
    <input type="range" min="0" max="100" bind:value={spring.target} />
  </label>

  <label>
    Current: {spring.current.toFixed(2)}
    <input type="range" min="0" max="100" value={spring.current} disabled />
  </label>
</div>

<div
  class="box"
  style="transform: translateX({spring.current}px)"
></div>

<style>
  .box {
    width: 50px;
    height: 50px;
    background: #ff3e00;
    border-radius: 8px;
  }
</style>
```

### Spring のオプション

Spring の動きは、3つのパラメータで細かく調整できます。`stiffness` を高くすると素早く動き、`damping` を低くするとよく弾みます。

```typescript
import { Spring } from 'svelte/motion';

interface SpringOptions {
	stiffness?: number; // 硬さ（0-1、デフォルト: 0.15）
	damping?: number; // 減衰（0-1、デフォルト: 0.8）
	precision?: number; // 精度（デフォルト: 0.01）
}

const spring = new Spring(0, {
	stiffness: 0.3, // より硬いバネ（素早く動く）
	damping: 0.5, // 低い減衰（より弾む）
	precision: 0.001,
});
```

### パラメータの効果

<Mermaid diagram={parametersDiagram} />

### Spring.of() - リアクティブバインディング

`Spring.of()` を使用すると、他のリアクティブな値の変化に自動的に追従する Spring を作成できます。props として受け取った値や、他の `$state` 変数の変化をスムーズにアニメーションさせたい場合に便利です。

```svelte
<script lang="ts">
  import { Spring } from 'svelte/motion';

  let { value }: { value: number } = $props();

  // valueの変化に自動的に追従するSpring
  const spring = Spring.of(() => value, {
    stiffness: 0.2,
    damping: 0.7
  });
</script>

<div style="transform: scale({spring.current})">
  スケール: {spring.current.toFixed(2)}
</div>
```

### set() メソッド

`set()` メソッドで値を設定し、アニメーションの完了を Promise で待つことができます。連続したアニメーションを実装する場合や、アニメーション完了後に処理を実行したい場合に使用します。`instant` オプションを使うと即座に値を変更でき、`preserveMomentum` を使うと現在の勢いを保持しながら移動できます。

```svelte
<script lang="ts">
  import { Spring } from 'svelte/motion';

  const position = new Spring({ x: 0, y: 0 });

  async function moveTo(x: number, y: number) {
    // アニメーションが完了するまで待機
    await position.set({ x, y });
    console.log('アニメーション完了');
  }

  async function moveInstantly(x: number, y: number) {
    // 即座に移動（アニメーションなし）
    await position.set({ x, y }, { instant: true });
  }

  async function fling(x: number, y: number) {
    // 現在の勢いを保持しながら移動
    await position.set({ x, y }, { preserveMomentum: 500 });
  }
</script>

<button onclick={() => moveTo(100, 100)}>
  アニメーション移動
</button>

<button onclick={() => moveInstantly(0, 0)}>
  即座に原点へ
</button>

<div
  class="dot"
  style="
    left: {position.current.x}px;
    top: {position.current.y}px;
  "
></div>
```

## Tween クラス

<Admonition type="info" title="バージョン要件">

`Tween` クラスは Svelte 5.8.0 以降で利用可能です。

</Admonition>
`Tween` は、指定した時間で値を滑らかに補間します。
`duration`（継続時間）と `easing`（イージング関数）で動きを制御できます。

### 基本的な使い方

以下の例では、スライダーの値が変化すると、指定した時間（400ms）をかけて `current` 値が滑らかに追従します。Spring と異なり、終了時間が確定しているため、タイミングが重要なアニメーションに適しています。

```svelte
<script lang="ts">
  import { Tween } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';

  const tween = new Tween(0, {
    duration: 400,
    easing: cubicOut
  });
</script>

<div>
  <input type="range" min="0" max="100" bind:value={tween.target} />
  <p>Current: {tween.current.toFixed(2)}</p>
</div>

<div
  class="progress"
  style="width: {tween.current}%"
></div>

<style>
  .progress {
    height: 20px;
    background: #ff3e00;
    border-radius: 10px;
    transition: none;
  }
</style>
```

### Tween のオプション

Tween では、遅延、継続時間、イージング関数、カスタム補間関数を設定できます。`duration` は固定値だけでなく、開始値と終了値に応じて動的に計算する関数を渡すこともできます。

```typescript
import { Tween } from 'svelte/motion';
import { cubicInOut, elasticOut, bounceOut } from 'svelte/easing';

interface TweenOptions<T> {
	delay?: number; // 開始までの遅延（ms）
	duration?: number | ((from: T, to: T) => number); // 継続時間（ms）
	easing?: (t: number) => number; // イージング関数
	interpolate?: (from: T, to: T) => (t: number) => T; // カスタム補間
}

const tween = new Tween(0, {
	delay: 100,
	duration: 500,
	easing: cubicInOut,
});

// duration を関数で指定（値の差に応じて変動）
const dynamicTween = new Tween(0, {
	duration: (from, to) => Math.abs(to - from) * 10,
});
```

### Tween.of() - リアクティブバインディング

`Tween.of()` を使用すると、他のリアクティブな値の変化を自動的にトゥイーンアニメーションで追従できます。カウンターやスコア表示など、数値が頻繁に変化する場面で滑らかな表示を実現できます。

```svelte
<script lang="ts">
  import { Tween } from 'svelte/motion';
  import { quintOut } from 'svelte/easing';

  let count = $state(0);

  // countの変化に自動的に追従するTween
  const smoothCount = Tween.of(() => count, {
    duration: 300,
    easing: quintOut
  });
</script>

<button onclick={() => count++}>
  Count: {count}
</button>

<p>Animated: {smoothCount.current.toFixed(1)}</p>
```

### set() メソッド

`set()` メソッドを使うと、値を設定しながらアニメーションの完了を Promise で待つことができます。また、呼び出し時にオプションを上書きすることで、状況に応じて異なるアニメーション設定を適用できます。

```svelte
<script lang="ts">
  import { Tween } from 'svelte/motion';
  import { linear, cubicOut } from 'svelte/easing';

  const opacity = new Tween(1);

  async function fadeOut() {
    // デフォルト設定でフェードアウト
    await opacity.set(0);
  }

  async function fadeIn() {
    // カスタム設定でフェードイン
    await opacity.set(1, {
      duration: 800,
      easing: cubicOut
    });
  }
</script>

<div style="opacity: {opacity.current}">
  <p>フェード効果のあるコンテンツ</p>
  <button onclick={fadeOut}>フェードアウト</button>
  <button onclick={fadeIn}>フェードイン</button>
</div>
```

## prefersReducedMotion

<Admonition type="info" title="バージョン要件">

`prefersReducedMotion` は Svelte 5.7.0 以降で利用可能です。

</Admonition>
`prefersReducedMotion` は、ユーザーがシステム設定で「視覚効果を減らす」を有効にしているかを検出します。
アクセシビリティに配慮したアニメーションを実装する際に重要です。

### 基本的な使い方

以下の例では、`prefersReducedMotion.current` の値に基づいて、トランジションの距離と時間を条件分岐しています。ユーザーが「視覚効果を減らす」を有効にしている場合は、アニメーションなしで即座に表示されます。

```svelte
<script lang="ts">
  import { prefersReducedMotion } from 'svelte/motion';
  import { fly, fade } from 'svelte/transition';

  let visible = $state(false);
</script>

<button onclick={() => visible = !visible}>
  Toggle
</button>

{#if visible}
  <div
    transition:fly={{
      y: prefersReducedMotion.current ? 0 : 200,
      duration: prefersReducedMotion.current ? 0 : 400
    }}
  >
    アニメーションで表示されるコンテンツ
  </div>
{/if}
```

### アクセシビリティ対応のパターン

Spring や Tween のオプションを `prefersReducedMotion` の値に基づいて設定することで、すべてのアニメーションを一括して制御できます。

```svelte
<script lang="ts">
  import { Spring, Tween, prefersReducedMotion } from 'svelte/motion';

  // アニメーションを無効化するオプション
  const springOptions = prefersReducedMotion.current
    ? { stiffness: 1, damping: 1 }  // 即座に変化
    : { stiffness: 0.2, damping: 0.7 };

  const spring = new Spring(0, springOptions);

  // Tweenでも同様に
  const tweenOptions = prefersReducedMotion.current
    ? { duration: 0 }
    : { duration: 400 };

  const tween = new Tween(0, tweenOptions);
</script>

<p>
  Reduced motion: {prefersReducedMotion.current ? '有効' : '無効'}
</p>
```

## 実践例

ここからは、`svelte/motion` を使った実践的なアニメーション実装例を紹介します。

### カードのホバーエフェクト

マウスホバー時にカードが拡大し、わずかに回転するエフェクトです。2つの Spring を組み合わせることで、より豊かな動きを表現できます。

```svelte
<script lang="ts">
  import { Spring } from 'svelte/motion';

  const scale = new Spring(1, { stiffness: 0.3, damping: 0.6 });
  const rotation = new Spring(0, { stiffness: 0.2, damping: 0.5 });

  function handleMouseEnter() {
    scale.set(1.05);
    rotation.set(2);
  }

  function handleMouseLeave() {
    scale.set(1);
    rotation.set(0);
  }
</script>

<div
  class="card"
  onmouseenter={handleMouseEnter}
  onmouseleave={handleMouseLeave}
  style="
    transform: scale({scale.current}) rotate({rotation.current}deg);
  "
>
  <h3>カードタイトル</h3>
  <p>ホバーするとアニメーションします</p>
</div>

<style>
  .card {
    padding: 2rem;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    cursor: pointer;
  }
</style>
```

### スムーズなカウンター

数値が変化する際に、即座に変わるのではなく滑らかにアニメーションするカウンターです。`Tween.of()` を使って、`targetValue` の変化を自動的に追従します。スコア表示や統計データの表示に最適です。

```svelte
<script lang="ts">
  import { Tween } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';

  let targetValue = $state(0);

  const displayValue = Tween.of(() => targetValue, {
    duration: 500,
    easing: cubicOut
  });

  function addValue(amount: number) {
    targetValue += amount;
  }
</script>

<div class="counter">
  <span class="value">{Math.round(displayValue.current)}</span>
  <div class="buttons">
    <button onclick={() => addValue(-10)}>-10</button>
    <button onclick={() => addValue(-1)}>-1</button>
    <button onclick={() => addValue(1)}>+1</button>
    <button onclick={() => addValue(10)}>+10</button>
  </div>
</div>

<style>
  .counter {
    text-align: center;
  }
  .value {
    font-size: 4rem;
    font-weight: bold;
  }
  .buttons {
    display: flex;
    gap: 0.5rem;
    justify-content: center;
  }
</style>
```

### ドラッグ可能な要素

PointerEvents API と Spring を組み合わせたドラッグ可能な要素です。ドラッグ中は `instant: true` で即座に追従し、離すとバネのように元の位置に戻ります。この実装パターンは、カードのソートやドラッグ＆ドロップ UI の基礎となります。

```svelte
<script lang="ts">
  import { Spring } from 'svelte/motion';

  const position = new Spring({ x: 0, y: 0 }, {
    stiffness: 0.2,
    damping: 0.8
  });

  let isDragging = $state(false);
  let startPos = { x: 0, y: 0 };

  function handlePointerDown(e: PointerEvent) {
    isDragging = true;
    startPos = {
      x: e.clientX - position.current.x,
      y: e.clientY - position.current.y
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: PointerEvent) {
    if (!isDragging) return;

    position.set({
      x: e.clientX - startPos.x,
      y: e.clientY - startPos.y
    }, { instant: true });
  }

  function handlePointerUp(e: PointerEvent) {
    isDragging = false;

    // 離したら中央に戻る
    position.set({ x: 0, y: 0 });
  }
</script>

<div class="container">
  <div
    class="draggable"
    class:dragging={isDragging}
    style="transform: translate({position.current.x}px, {position.current.y}px)"
    onpointerdown={handlePointerDown}
    onpointermove={handlePointerMove}
    onpointerup={handlePointerUp}
  >
    ドラッグ可能
  </div>
</div>

<style>
  .container {
    height: 300px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f0f0f0;
    border-radius: 8px;
  }

  .draggable {
    width: 100px;
    height: 100px;
    background: #ff3e00;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    cursor: grab;
    user-select: none;
  }

  .dragging {
    cursor: grabbing;
  }
</style>
```

### プログレスバー

ファイルアップロードやローディング表示に使えるスムーズなプログレスバーです。`Tween.of()` で進捗値の変化を追従し、`cubicInOut` イージングで自然な動きを実現しています。

```svelte
<script lang="ts">
  import { Tween } from 'svelte/motion';
  import { cubicInOut } from 'svelte/easing';

  let progress = $state(0);

  const smoothProgress = Tween.of(() => progress, {
    duration: 600,
    easing: cubicInOut
  });

  function setProgress(value: number) {
    progress = Math.max(0, Math.min(100, value));
  }
</script>

<div class="progress-container">
  <div
    class="progress-bar"
    style="width: {smoothProgress.current}%"
  >
    <span class="progress-text">
      {Math.round(smoothProgress.current)}%
    </span>
  </div>
</div>

<div class="controls">
  <button onclick={() => setProgress(0)}>0%</button>
  <button onclick={() => setProgress(25)}>25%</button>
  <button onclick={() => setProgress(50)}>50%</button>
  <button onclick={() => setProgress(75)}>75%</button>
  <button onclick={() => setProgress(100)}>100%</button>
</div>

<style>
  .progress-container {
    height: 30px;
    background: #e0e0e0;
    border-radius: 15px;
    overflow: hidden;
  }

  .progress-bar {
    height: 100%;
    background: linear-gradient(90deg, #ff3e00, #ff6b3d);
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding-right: 10px;
    min-width: 50px;
    border-radius: 15px;
  }

  .progress-text {
    color: white;
    font-weight: bold;
    font-size: 0.875rem;
  }

  .controls {
    display: flex;
    gap: 0.5rem;
    margin-top: 1rem;
  }
</style>
```

## レガシー API（非推奨）

<Admonition type="warning" title="非推奨">

`spring()` と `tweened()` 関数は非推奨です。代わりに `Spring` と `Tween` クラスを使用してください。

</Admonition>
以前のバージョンとの互換性のために、ストアベースの API も利用可能です。

```svelte
<script lang="ts">
  import { spring, tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';

  // レガシーAPI（非推奨）
  const oldSpring = spring(0, { stiffness: 0.3, damping: 0.8 });
  const oldTween = tweened(0, { duration: 400, easing: cubicOut });

  // ストアとして使用
  $: console.log($oldSpring, $oldTween);
</script>
```

## Spring vs Tween の使い分け

<Mermaid diagram={comparisonDiagram} />

## まとめ

`svelte/motion` モジュールを使用することで、以下のことが実現できます。

- **Spring**: バネのような自然な動きを持つアニメーション
- **Tween**: 時間ベースの滑らかな補間アニメーション
- **prefersReducedMotion**: アクセシビリティに配慮したアニメーション制御
- **of() メソッド**: リアクティブな値に追従するアニメーション

適切なアニメーションを使用することで、ユーザー体験を大幅に向上させることができます。

## 次のステップ

- [トランジション・アニメーション](/svelte/basics/transitions/) - 要素の出入りアニメーション
- [svelte/easing](/svelte/basics/easing/) - イージング関数
- [$effect - 副作用](/svelte/runes/effect/) - エフェクトとの組み合わせ
