---
title: トランジション・アニメーション
description: Svelteの組み込みトランジション、アニメーション、モーション機能の完全ガイド
---

Svelteは、美しく滑らかなアニメーションを簡単に実装できる組み込み機能を提供しています。CSSやJavaScriptライブラリを使わずに、宣言的な方法でトランジションやアニメーションを追加できます。

## トランジションの基本

### transition: ディレクティブ

`transition:`ディレクティブは、要素がDOMに追加・削除される際のアニメーションを定義します。

```svelte
<script lang="ts">
  import { fade, slide, scale, fly } from 'svelte/transition';
  
  let visible = $state(true);
</script>

<button onclick={() => visible = !visible}>
  切り替え
</button>

{#if visible}
  <!-- フェードイン・フェードアウト -->
  <div transition:fade>
    フェードトランジション
  </div>
  
  <!-- スライドトランジション -->
  <div transition:slide>
    スライドトランジション
  </div>
  
  <!-- スケールトランジション -->
  <div transition:scale>
    スケールトランジション
  </div>
  
  <!-- フライトランジション -->
  <div transition:fly={{ x: 200, y: 0 }}>
    フライトランジション
  </div>
{/if}
```

### in: と out: ディレクティブ

要素の追加時と削除時で異なるトランジションを指定できます。

```svelte
<script lang="ts">
  import { fade, fly, slide } from 'svelte/transition';
  
  let showMessage = $state(false);
</script>

{#if showMessage}
  <!-- 入場時はフライ、退場時はフェード -->
  <div 
    in:fly={{ y: -50, duration: 300 }}
    out:fade={{ duration: 200 }}
    class="notification"
  >
    通知メッセージ
  </div>
  
  <!-- 入場時は右から、退場時は左へ -->
  <div
    in:fly={{ x: 100, duration: 400 }}
    out:fly={{ x: -100, duration: 400 }}
    class="panel"
  >
    スライドパネル
  </div>
{/if}
```

:::tip[in/outの使い分け]
- `transition:` - 入場と退場で同じアニメーション
- `in:` / `out:` - 入場と退場で異なるアニメーション
- 片方だけ指定することも可能（例：`in:fade`のみ）
:::

## 組み込みトランジション

### fade - フェード

不透明度を変化させるトランジション。

```svelte
<script lang="ts">
  import { fade } from 'svelte/transition';
  
  let show = $state(true);
</script>

{#if show}
  <div transition:fade={{
    delay: 0,      // 遅延（ミリ秒）
    duration: 300, // 持続時間（ミリ秒）
    easing: linear // イージング関数
  }}>
    フェードコンテンツ
  </div>
{/if}
```

### slide - スライド

要素の高さを変化させてスライドするトランジション。

```svelte
<script lang="ts">
  import { slide } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  
  let expanded = $state(false);
</script>

<button onclick={() => expanded = !expanded}>
  {expanded ? '閉じる' : '開く'}
</button>

{#if expanded}
  <div transition:slide={{
    delay: 0,
    duration: 300,
    easing: quintOut,
    axis: 'y' // 'x' または 'y'
  }}>
    <p>スライドして表示されるコンテンツ</p>
    <p>複数行のテキストも</p>
    <p>スムーズにアニメーション</p>
  </div>
{/if}
```

### scale - スケール

要素のサイズを変化させるトランジション。

```svelte
<script lang="ts">
  import { scale } from 'svelte/transition';
  import { elasticOut } from 'svelte/easing';
  
  let showModal = $state(false);
</script>

{#if showModal}
  <div class="modal-backdrop" transition:fade>
    <div 
      class="modal"
      transition:scale={{
        duration: 300,
        start: 0.5,    // 開始時のスケール
        opacity: 0.5,  // 開始時の不透明度
        easing: elasticOut
      }}
    >
      <h2>モーダルウィンドウ</h2>
      <p>スケールトランジションで表示</p>
      <button onclick={() => showModal = false}>閉じる</button>
    </div>
  </div>
{/if}
```

### fly - フライ

要素を指定した位置から/へ移動させるトランジション。

```svelte
<script lang="ts">
  import { fly } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  
  let notifications = $state<string[]>([]);
  
  function addNotification(message: string) {
    notifications.push(message);
    setTimeout(() => {
      notifications = notifications.filter(n => n !== message);
    }, 3000);
  }
</script>

<div class="notifications">
  {#each notifications as notification (notification)}
    <div
      class="notification"
      in:fly={{ x: 300, duration: 400, easing: quintOut }}
      out:fly={{ x: 300, duration: 400 }}
    >
      {notification}
    </div>
  {/each}
</div>
```

### blur - ブラー

ブラー効果を伴うトランジション。

```svelte
<script lang="ts">
  import { blur } from 'svelte/transition';
  
  let showImage = $state(true);
</script>

{#if showImage}
  <img
    src="image.jpg"
    alt="サンプル画像"
    transition:blur={{
      amount: 5,     // ブラーの強さ
      duration: 300,
      delay: 0
    }}
  />
{/if}
```

### draw - SVG描画

SVGパスを描画するトランジション。

```svelte
<script lang="ts">
  import { draw } from 'svelte/transition';
  import { quintInOut } from 'svelte/easing';
  
  let showSvg = $state(false);
</script>

<button onclick={() => showSvg = !showSvg}>
  SVGを描画
</button>

{#if showSvg}
  <svg width="200" height="200">
    <path
      d="M 10 10 L 190 10 L 190 190 L 10 190 Z"
      stroke="black"
      fill="none"
      stroke-width="2"
      transition:draw={{
        duration: 2000,
        easing: quintInOut
      }}
    />
  </svg>
{/if}
```

## アニメーション

### animate: ディレクティブ

`animate:`ディレクティブは、要素の位置が変更されたときにアニメーションを適用します。主に`{#each}`ブロックと一緒に使用します。

```svelte
<script lang="ts">
  import { flip } from 'svelte/animate';
  import { quintOut } from 'svelte/easing';
  
  let items = $state([
    { id: 1, name: 'アイテム1' },
    { id: 2, name: 'アイテム2' },
    { id: 3, name: 'アイテム3' },
    { id: 4, name: 'アイテム4' }
  ]);
  
  function shuffle() {
    items = items.sort(() => Math.random() - 0.5);
  }
  
  function remove(id: number) {
    items = items.filter(item => item.id !== id);
  }
</script>

<button onclick={shuffle}>シャッフル</button>

<ul>
  {#each items as item (item.id)}
    <li animate:flip={{
      duration: 300,
      easing: quintOut
    }}>
      {item.name}
      <button onclick={() => remove(item.id)}>削除</button>
    </li>
  {/each}
</ul>
```

:::info[flipアニメーション]
FLIP（First, Last, Invert, Play）技術を使用して、要素の位置変更を滑らかにアニメーション化します。
:::

### ドラッグ&ドロップとアニメーション

```svelte
<script lang="ts">
  import { flip } from 'svelte/animate';
  import { crossfade } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  
  const [send, receive] = crossfade({
    duration: 300,
    fallback(node) {
      const style = getComputedStyle(node);
      const transform = style.transform === 'none' ? '' : style.transform;
      
      return {
        duration: 300,
        css: t => `
          transform: ${transform} scale(${t});
          opacity: ${t}
        `
      };
    }
  });
  
  let todoItems = $state([
    { id: 1, text: 'タスク1', done: false },
    { id: 2, text: 'タスク2', done: false },
    { id: 3, text: 'タスク3', done: true }
  ]);
  
  let todos = $derived(todoItems.filter(item => !item.done));
  let done = $derived(todoItems.filter(item => item.done));
  
  function toggle(id: number) {
    const item = todoItems.find(i => i.id === id);
    if (item) item.done = !item.done;
  }
</script>

<div class="board">
  <div class="column">
    <h2>TODO</h2>
    {#each todos as item (item.id)}
      <div
        class="item"
        in:receive={{ key: item.id }}
        out:send={{ key: item.id }}
        animate:flip={{ duration: 300 }}
        onclick={() => toggle(item.id)}
      >
        {item.text}
      </div>
    {/each}
  </div>
  
  <div class="column">
    <h2>完了</h2>
    {#each done as item (item.id)}
      <div
        class="item done"
        in:receive={{ key: item.id }}
        out:send={{ key: item.id }}
        animate:flip={{ duration: 300 }}
        onclick={() => toggle(item.id)}
      >
        {item.text}
      </div>
    {/each}
  </div>
</div>
```

## スタイルディレクティブ

### style: ディレクティブ

`style:`ディレクティブを使用して、動的にスタイルを適用できます。

```svelte
<script lang="ts">
  let color = $state('blue');
  let size = $state(16);
  let rotation = $state(0);
  let opacity = $state(1);
</script>

<!-- 基本的な使い方 -->
<div style:color={color}>
  色が変わるテキスト
</div>

<!-- 複数のスタイル -->
<div
  style:font-size="{size}px"
  style:transform="rotate({rotation}deg)"
  style:opacity={opacity}
>
  動的スタイル
</div>

<!-- 短縮記法（変数名とプロパティ名が同じ場合） -->
<div style:color style:opacity>
  短縮記法
</div>

<!-- 条件付きスタイル -->
<button
  style:background-color={isActive ? 'blue' : 'gray'}
  style:cursor={disabled ? 'not-allowed' : 'pointer'}
>
  ボタン
</button>
```

### CSS変数との組み合わせ

```svelte
<script lang="ts">
  let hue = $state(0);
  let theme = $state<'light' | 'dark'>('light');
  
  // アニメーションループ
  $effect(() => {
    const interval = setInterval(() => {
      hue = (hue + 1) % 360;
    }, 50);
    
    return () => clearInterval(interval);
  });
</script>

<div
  class="gradient-box"
  style:--hue="{hue}"
  style:--theme={theme}
>
  <h2>グラデーションアニメーション</h2>
  <p>CSS変数を使った動的スタイル</p>
</div>

<style>
  .gradient-box {
    background: linear-gradient(
      45deg,
      hsl(var(--hue), 70%, 50%),
      hsl(calc(var(--hue) + 60), 70%, 50%)
    );
    color: var(--theme) === 'light' ? black : white;
    padding: 2rem;
    border-radius: 8px;
    transition: background 0.3s;
  }
</style>
```

## カスタムトランジション

### 独自のトランジション関数

```svelte
<script lang="ts">
  import { cubicOut } from 'svelte/easing';
  import type { TransitionConfig } from 'svelte/transition';
  
  // カスタムトランジション関数
  function typewriter(node: HTMLElement, {
    speed = 1
  }: { speed?: number } = {}): TransitionConfig {
    const valid = (
      node.childNodes.length === 1 &&
      node.childNodes[0].nodeType === Node.TEXT_NODE
    );
    
    if (!valid) {
      throw new Error('`typewriter` only works with text nodes');
    }
    
    const text = node.textContent || '';
    const duration = text.length / (speed * 0.01);
    
    return {
      duration,
      tick: t => {
        const i = Math.trunc(text.length * t);
        node.textContent = text.slice(0, i);
      }
    };
  }
  
  let showText = $state(false);
</script>

<button onclick={() => showText = !showText}>
  タイプライター効果
</button>

{#if showText}
  <p in:typewriter={{ speed: 1 }}>
    このテキストはタイプライターのように表示されます。
  </p>
{/if}
```

### 高度なカスタムトランジション

```svelte
<script lang="ts">
  import type { TransitionConfig } from 'svelte/transition';
  
  function spin(node: HTMLElement, {
    delay = 0,
    duration = 400,
    easing = cubicOut,
    spin = 1
  } = {}): TransitionConfig {
    const originalTransform = getComputedStyle(node).transform;
    const originalOpacity = +getComputedStyle(node).opacity;
    
    return {
      delay,
      duration,
      easing,
      css: (t, u) => {
        const rotation = 360 * spin * u;
        const scale = t;
        
        return `
          transform: ${originalTransform} rotate(${rotation}deg) scale(${scale});
          opacity: ${t * originalOpacity};
        `;
      }
    };
  }
  
  let items = $state<string[]>([]);
  
  function addItem() {
    items = [...items, `アイテム ${items.length + 1}`];
  }
  
  function removeItem(index: number) {
    items = items.filter((_, i) => i !== index);
  }
</script>

<button onclick={addItem}>追加</button>

<div class="grid">
  {#each items as item, index (item)}
    <div
      class="card"
      in:spin={{ duration: 500, spin: 2 }}
      out:spin={{ duration: 300, spin: -1 }}
    >
      {item}
      <button onclick={() => removeItem(index)}>×</button>
    </div>
  {/each}
</div>
```

## パフォーマンス最適化

### 遅延トランジション

```svelte
<script lang="ts">
  import { fade, slide } from 'svelte/transition';
  
  let items = $state(Array.from({ length: 20 }, (_, i) => ({
    id: i,
    text: `アイテム ${i + 1}`
  })));
  
  let showItems = $state(false);
</script>

<button onclick={() => showItems = !showItems}>
  リストを表示
</button>

{#if showItems}
  <ul>
    {#each items as item, index (item.id)}
      <!-- インデックスに基づいて遅延を設定 -->
      <li
        in:slide={{ delay: index * 50, duration: 300 }}
        out:fade={{ duration: 200 }}
      >
        {item.text}
      </li>
    {/each}
  </ul>
{/if}
```

### local修飾子

```svelte
<script lang="ts">
  import { slide } from 'svelte/transition';
  
  let currentTab = $state('tab1');
</script>

<div class="tabs">
  <button onclick={() => currentTab = 'tab1'}>タブ1</button>
  <button onclick={() => currentTab = 'tab2'}>タブ2</button>
  <button onclick={() => currentTab = 'tab3'}>タブ3</button>
</div>

<!-- local修飾子で親の状態変更時にトランジションしない -->
{#if currentTab === 'tab1'}
  <div transition:slide|local>
    <h2>タブ1のコンテンツ</h2>
    <p>localを使うと、親の条件変更時にトランジションしません</p>
  </div>
{:else if currentTab === 'tab2'}
  <div transition:slide|local>
    <h2>タブ2のコンテンツ</h2>
  </div>
{:else if currentTab === 'tab3'}
  <div transition:slide|local>
    <h2>タブ3のコンテンツ</h2>
  </div>
{/if}
```

:::tip[local修飾子の使い方]
`|local`修飾子を使用すると、要素自体がDOMに追加・削除される時のみトランジションが発生し、親要素の条件変更時にはトランジションしません。
:::

## イージング関数

Svelteは様々なイージング関数を提供しています。

```svelte
<script lang="ts">
  import {
    linear,
    quadIn, quadOut, quadInOut,
    cubicIn, cubicOut, cubicInOut,
    quartIn, quartOut, quartInOut,
    quintIn, quintOut, quintInOut,
    sineIn, sineOut, sineInOut,
    expoIn, expoOut, expoInOut,
    circIn, circOut, circInOut,
    elasticIn, elasticOut, elasticInOut,
    backIn, backOut, backInOut,
    bounceIn, bounceOut, bounceInOut
  } from 'svelte/easing';
  
  import { fly } from 'svelte/transition';
  
  let selectedEasing = $state('cubicOut');
  let demo = $state(false);
  
  const easings = [
    'linear',
    'quadOut', 'cubicOut', 'quartOut', 'quintOut',
    'sineOut', 'expoOut', 'circOut',
    'elasticOut', 'backOut', 'bounceOut'
  ];
</script>

<select bind:value={selectedEasing}>
  {#each easings as easing}
    <option value={easing}>{easing}</option>
  {/each}
</select>

<button onclick={() => demo = !demo}>
  デモを実行
</button>

{#if demo}
  <div
    class="demo-box"
    transition:fly={{
      x: -200,
      duration: 1000,
      easing: eval(selectedEasing) // 実際のコードでは適切にインポート
    }}
  >
    イージング: {selectedEasing}
  </div>
{/if}
```

## 実践的な例

### 通知システム

```svelte
<script lang="ts">
  import { fly, fade } from 'svelte/transition';
  import { flip } from 'svelte/animate';
  import { quintOut } from 'svelte/easing';
  
  type Notification = {
    id: number;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
  };
  
  let notifications = $state<Notification[]>([]);
  let nextId = 1;
  
  function notify(message: string, type: Notification['type'] = 'info') {
    const id = nextId++;
    notifications = [...notifications, { id, message, type }];
    
    // 自動削除
    setTimeout(() => {
      notifications = notifications.filter(n => n.id !== id);
    }, 5000);
  }
  
  function dismiss(id: number) {
    notifications = notifications.filter(n => n.id !== id);
  }
</script>

<div class="notifications-container">
  {#each notifications as notification (notification.id)}
    <div
      class="notification notification-{notification.type}"
      in:fly={{ x: 300, duration: 300, easing: quintOut }}
      out:fade={{ duration: 200 }}
      animate:flip={{ duration: 300 }}
    >
      <span>{notification.message}</span>
      <button onclick={() => dismiss(notification.id)}>×</button>
    </div>
  {/each}
</div>

<style>
  .notifications-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 1000;
  }
  
  .notification {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    margin-bottom: 8px;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
  
  .notification-info { background: #e3f2fd; }
  .notification-success { background: #e8f5e9; }
  .notification-warning { background: #fff3e0; }
  .notification-error { background: #ffebee; }
</style>
```

### モーダルウィンドウ

```svelte
<script lang="ts">
  import { fade, scale } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  
  let showModal = $state(false);
  
  function openModal() {
    showModal = true;
  }
  
  function closeModal() {
    showModal = false;
  }
  
  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && showModal) {
      closeModal();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<button onclick={openModal}>モーダルを開く</button>

{#if showModal}
  <!-- 背景のオーバーレイ -->
  <div
    class="modal-backdrop"
    transition:fade={{ duration: 200 }}
    onclick={closeModal}
  />
  
  <!-- モーダル本体 -->
  <div
    class="modal"
    transition:scale={{
      start: 0.7,
      duration: 300,
      easing: cubicOut
    }}
    role="dialog"
    aria-modal="true"
  >
    <h2>モーダルタイトル</h2>
    <p>モーダルの内容がここに表示されます。</p>
    <div class="modal-actions">
      <button onclick={closeModal}>キャンセル</button>
      <button class="primary" onclick={closeModal}>確認</button>
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
  }
  
  .modal {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    padding: 24px;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    min-width: 400px;
  }
</style>
```

## まとめ

Svelteのトランジション・アニメーション機能により：

1. **宣言的なアニメーション** - HTMLテンプレート内で直接定義
2. **豊富な組み込み機能** - fade、slide、scale、fly、blur、draw
3. **柔軟なカスタマイズ** - カスタムトランジション関数の作成
4. **パフォーマンス** - CSSアニメーションを活用した効率的な実装
5. **イージング関数** - 多様なアニメーション曲線

これらの機能を組み合わせることで、ユーザー体験を向上させる魅力的なインターフェースを作成できます。

:::info[関連リンク]
- [テンプレート構文](/svelte-basics/template-syntax/) - `{@render}`、`{#key}`などの詳細
- [コンポーネントの基本](/svelte-basics/component-basics/) - 基本的な構文
- [Actions](/svelte-basics/actions/) - use:ディレクティブとの組み合わせ
:::

次は[Actions](/svelte-basics/actions/)で、要素レベルのライフサイクル機能について学びましょう。