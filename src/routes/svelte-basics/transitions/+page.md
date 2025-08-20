---
title: トランジション・アニメーション
description: Svelteの組み込みトランジション、アニメーション、モーション機能の完全ガイド
---

Svelteは、美しく滑らかなアニメーションを簡単に実装できる組み込み機能を提供しています。CSSやJavaScriptライブラリを使わずに、宣言的な方法でトランジションやアニメーションを追加できます。

## トランジションの基本

### transition: ディレクティブ

`transition:`ディレクティブは、要素がDOMに追加・削除される際のアニメーションを定義します。

```svelte live
<script lang="ts">
  import { fade, slide, scale, fly } from 'svelte/transition';
  
  let visible = $state(true);
</script>

<button onclick={() => visible = !visible}>
  切り替え
</button>

<div style="margin-top: 1rem; display: flex; flex-direction: column; gap: 1rem;">
  {#if visible}
    <!-- フェードイン・フェードアウト -->
    <div transition:fade class="demo-box">
      フェードトランジション
    </div>
    
    <!-- スライドトランジション -->
    <div transition:slide class="demo-box">
      スライドトランジション
    </div>
    
    <!-- スケールトランジション -->
    <div transition:scale class="demo-box">
      スケールトランジション
    </div>
    
    <!-- フライトランジション -->
    <div transition:fly={{ x: 200, y: 0 }} class="demo-box">
      フライトランジション（横から）
    </div>
  {/if}
</div>

<style>
  .demo-box {
    padding: 1rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 8px;
    text-align: center;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
</style>
```

### in: と out: ディレクティブ

要素の追加時と削除時で異なるトランジションを指定できます。

```svelte live
<script lang="ts">
  import { fade, fly, slide } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  
  let showMessage = $state(false);
  let showPanel = $state(false);
</script>

<div style="display: flex; gap: 1rem; margin-bottom: 1rem;">
  <button onclick={() => showMessage = !showMessage}>
    通知を{showMessage ? '非表示' : '表示'}
  </button>
  <button onclick={() => showPanel = !showPanel}>
    パネルを{showPanel ? '非表示' : '表示'}
  </button>
</div>

<div style="position: relative; min-height: 200px;">
  {#if showMessage}
    <!-- 入場時は上から、退場時はフェード -->
    <div 
      in:fly={{ y: -50, duration: 300, easing: quintOut }}
      out:fade={{ duration: 200 }}
      class="notification"
    >
      <span>📢 通知メッセージ</span>
      <button onclick={() => showMessage = false}>×</button>
    </div>
  {/if}
  
  {#if showPanel}
    <!-- 入場時は右から、退場時は左へ -->
    <div
      in:fly={{ x: 100, duration: 400, easing: quintOut }}
      out:fly={{ x: -100, duration: 400 }}
      class="panel"
    >
      <h3>スライドパネル</h3>
      <p>右から入って、左へ出ていきます</p>
      <button onclick={() => showPanel = false}>閉じる</button>
    </div>
  {/if}
</div>

<style>
  .notification {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background: linear-gradient(135deg, #ffd89b 0%, #19547b 100%);
    color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  .notification button {
    background: none;
    border: none;
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .panel {
    position: absolute;
    top: 60px;
    left: 0;
    right: 0;
    padding: 1.5rem;
    background: white;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  }
  
  .panel h3 {
    margin: 0 0 0.5rem;
    color: #2d3748;
  }
  
  .panel p {
    margin: 0 0 1rem;
    color: #4a5568;
  }
  
  .panel button {
    background: #667eea;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    cursor: pointer;
  }
  
  .panel button:hover {
    background: #5a67d8;
  }
</style>
```

:::tip[in/outの使い分け]
- `transition:` - 入場と退場で同じアニメーション
- `in:` / `out:` - 入場と退場で異なるアニメーション
- 片方だけ指定することも可能（例：`in:fade`のみ）
:::

## 組み込みトランジション

### fade - フェード

不透明度を変化させるトランジション

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

要素の高さを変化させてスライドするトランジション

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

要素のサイズを変化させるトランジション

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

要素を指定した位置から出現、または指定した位置へ退出させるトランジション


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

ブラー効果を伴うトランジション

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

SVGパスを描画するトランジション

```svelte live
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

```svelte live
<script lang="ts">
  import { flip } from 'svelte/animate';
  import { quintOut } from 'svelte/easing';
  import { fade, scale } from 'svelte/transition';
  
  let items = $state([
    { id: 1, name: 'アイテム1', color: '#FF6B6B' },
    { id: 2, name: 'アイテム2', color: '#4ECDC4' },
    { id: 3, name: 'アイテム3', color: '#45B7D1' },
    { id: 4, name: 'アイテム4', color: '#96CEB4' },
    { id: 5, name: 'アイテム5', color: '#FFEAA7' },
  ]);
  
  let nextId = 6;
  
  function shuffle() {
    items = items.sort(() => Math.random() - 0.5);
  }
  
  function remove(id: number) {
    items = items.filter(item => item.id !== id);
  }
  
  function add() {
    const colors = ['#DDA0DD', '#98D8C8', '#F7DC6F', '#85C1E2', '#F8B739'];
    items = [...items, {
      id: nextId++,
      name: `アイテム${nextId}`,
      color: colors[Math.floor(Math.random() * colors.length)]
    }];
  }
</script>

<div style="display: flex; gap: 0.5rem; margin-bottom: 1rem;">
  <button onclick={shuffle}>🔀 シャッフル</button>
  <button onclick={add}>➕ 追加</button>
</div>

<div class="items-grid">
  {#each items as item (item.id)}
    <div
      class="item-card"
      style="background: {item.color};"
      animate:flip={{
        duration: 300,
        easing: quintOut
      }}
      in:scale={{ duration: 300, easing: quintOut }}
      out:fade={{ duration: 200 }}
    >
      <span>{item.name}</span>
      <button 
        class="remove-btn"
        onclick={() => remove(item.id)}
        aria-label="削除"
      >
        ×
      </button>
    </div>
  {/each}
</div>

<style>
  .items-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 0.75rem;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 8px;
    min-height: 150px;
  }
  
  .item-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem;
    border-radius: 8px;
    color: white;
    font-weight: bold;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s;
  }
  
  .item-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  .remove-btn {
    background: rgba(255, 255, 255, 0.3);
    border: none;
    color: white;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    transition: background 0.2s;
  }
  
  .remove-btn:hover {
    background: rgba(255, 255, 255, 0.5);
  }
</style>
```

:::info[flipアニメーション]
FLIP（First, Last, Invert, Play）技術を使用して、要素の位置変更を滑らかにアニメーション化します。
:::

### クロスフェードとリスト間の移動

`crossfade`を使用して、異なるリスト間で要素が移動する際に連続したアニメーションを作成できます。

```svelte live
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
    <h3>📝 TODO</h3>
    {#each todos as item (item.id)}
      <div
        class="task-item"
        in:receive={{ key: item.id }}
        out:send={{ key: item.id }}
        animate:flip={{ duration: 300 }}
        onclick={() => toggle(item.id)}
      >
        <span class="checkbox">☐</span>
        {item.text}
      </div>
    {/each}
    {#if todos.length === 0}
      <p class="empty">タスクなし</p>
    {/if}
  </div>
  
  <div class="column">
    <h3>✅ 完了</h3>
    {#each done as item (item.id)}
      <div
        class="task-item done"
        in:receive={{ key: item.id }}
        out:send={{ key: item.id }}
        animate:flip={{ duration: 300 }}
        onclick={() => toggle(item.id)}
      >
        <span class="checkbox">☑</span>
        {item.text}
      </div>
    {/each}
    {#if done.length === 0}
      <p class="empty">完了タスクなし</p>
    {/if}
  </div>
</div>

<style>
  .board {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    margin-top: 1rem;
  }
  
  .column {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 1rem;
    min-height: 200px;
  }
  
  .column h3 {
    margin: 0 0 1rem;
    color: #2d3748;
  }
  
  .task-item {
    background: white;
    padding: 0.75rem;
    margin-bottom: 0.5rem;
    border-radius: 6px;
    cursor: pointer;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    transition: box-shadow 0.2s;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .task-item:hover {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
  }
  
  .task-item.done {
    background: #e8f5e9;
    text-decoration: line-through;
    opacity: 0.8;
  }
  
  .checkbox {
    font-size: 1.2rem;
  }
  
  .empty {
    color: #718096;
    text-align: center;
    font-style: italic;
  }
</style>
```

## スタイルディレクティブ

### style: ディレクティブ

`style:`ディレクティブを使用して、動的にスタイルを適用できます。

```svelte live
<script lang="ts">
  let color = $state('blue');
  let size = $state(16);
  let rotation = $state(0);
  let opacity = $state(1);
  let isActive = $state(false);
  let disabled = $state(false);
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
  onclick={() => {
    if (!disabled) isActive = !isActive;
  }}
>
  {isActive ? 'アクティブ' : '非アクティブ'}
</button>

<label style="margin-left: 1rem;">
  <input type="checkbox" bind:checked={disabled} />
  無効化
</label>
```

### CSS変数との組み合わせ

```svelte live
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

```svelte live
<script lang="ts">
  import { cubicOut } from 'svelte/easing';
  import type { TransitionConfig } from 'svelte/transition';
  
  // カスタムトランジション関数: タイプライター効果
  function typewriter(node: HTMLElement, {
    speed = 1,
    delay = 0
  }: { speed?: number; delay?: number } = {}): TransitionConfig {
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
      delay,
      duration,
      tick: t => {
        const i = Math.trunc(text.length * t);
        node.textContent = text.slice(0, i);
      }
    };
  }
  
  // カスタムトランジション関数: 回転＋スケール
  function spin(node: HTMLElement, {
    delay = 0,
    duration = 400,
    easing = cubicOut,
    spin = 1
  } = {}): TransitionConfig {
    const style = getComputedStyle(node);
    const originalTransform = style.transform === 'none' ? '' : style.transform;
    const originalOpacity = +style.opacity;
    
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
  
  let showTypewriter = $state(false);
  let showSpin = $state(false);
  let messages = $state<string[]>([]);
  
  function addMessage() {
    messages = [...messages, `メッセージ ${messages.length + 1}`];
  }
  
  function removeMessage(index: number) {
    messages = messages.filter((_, i) => i !== index);
  }
</script>

<div style="display: grid; gap: 2rem;">
  <!-- タイプライター効果デモ -->
  <div>
    <h3>タイプライター効果</h3>
    <button onclick={() => showTypewriter = !showTypewriter}>
      {showTypewriter ? 'リセット' : 'タイプ開始'}
    </button>
    
    <div style="margin-top: 1rem; min-height: 60px;">
      {#if showTypewriter}
        <p in:typewriter={{ speed: 2 }} style="font-family: monospace; font-size: 1.2rem; color: #2d3748;">
          このテキストはタイプライターのように一文字ずつ表示されます。
        </p>
      {/if}
    </div>
  </div>
  
  <!-- スピン効果デモ -->
  <div>
    <h3>回転トランジション</h3>
    <button onclick={addMessage}>メッセージを追加</button>
    
    <div class="spin-grid">
      {#each messages as message, index (message)}
        <div
          class="spin-card"
          in:spin={{ duration: 500, spin: 2 }}
          out:spin={{ duration: 300, spin: -1 }}
        >
          <span>{message}</span>
          <button 
            class="close-btn"
            onclick={() => removeMessage(index)}
          >
            ×
          </button>
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  h3 {
    margin: 0 0 0.5rem;
    color: #2d3748;
  }
  
  .spin-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
    min-height: 80px;
  }
  
  .spin-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  .close-btn {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: white;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
  }
  
  .close-btn:hover {
    background: rgba(255, 255, 255, 0.3);
  }
</style>
```

### 高度なカスタムトランジション


```svelte live
<script lang="ts">
  import type { TransitionConfig } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  
  function spin(node: HTMLElement, {
    delay = 0,
    duration = 400,
    easing = cubicOut,
    spin = 1
  } = {}): TransitionConfig {
    const style = getComputedStyle(node);
    const originalTransform = style.transform === 'none' ? '' : style.transform;
    const originalOpacity = +style.opacity;
    
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


```svelte live
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


```svelte live
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

```svelte live
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

```svelte live
<script lang="ts">
  import { fly, fade } from 'svelte/transition';
  import { flip } from 'svelte/animate';
  import { quintOut } from 'svelte/easing';
  
  type Notification = {
    id: number;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    icon: string;
  };
  
  let notifications = $state<Notification[]>([]);
  let nextId = 1;
  
  function notify(message: string, type: Notification['type'] = 'info') {
    const icons = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    };
    
    const id = nextId++;
    notifications = [...notifications, { id, message, type, icon: icons[type] }];
    
    // 自動削除
    setTimeout(() => {
      notifications = notifications.filter(n => n.id !== id);
    }, 5000);
  }
  
  function dismiss(id: number) {
    notifications = notifications.filter(n => n.id !== id);
  }
</script>

<div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1rem;">
  <button onclick={() => notify('情報メッセージです', 'info')}>
    情報通知
  </button>
  <button onclick={() => notify('正常に完了しました！', 'success')}>
    成功通知
  </button>
  <button onclick={() => notify('注意が必要です', 'warning')}>
    警告通知
  </button>
  <button onclick={() => notify('エラーが発生しました', 'error')}>
    エラー通知
  </button>
</div>

<div class="notifications-container">
  {#each notifications as notification (notification.id)}
    <div
      class="notification notification-{notification.type}"
      in:fly={{ x: 300, duration: 300, easing: quintOut }}
      out:fade={{ duration: 200 }}
      animate:flip={{ duration: 300 }}
    >
      <span class="notification-content">
        <span class="notification-icon">{notification.icon}</span>
        {notification.message}
      </span>
      <button class="dismiss-btn" onclick={() => dismiss(notification.id)}>×</button>
    </div>
  {/each}
</div>

<style>
  .notifications-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 1000;
    max-width: 400px;
  }
  
  .notification {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    margin-bottom: 8px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    backdrop-filter: blur(10px);
  }
  
  .notification-content {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .notification-icon {
    font-size: 1.2rem;
  }
  
  .notification-info { 
    background: linear-gradient(135deg, rgba(66, 165, 245, 0.9), rgba(33, 150, 243, 0.9));
    color: white;
  }
  .notification-success { 
    background: linear-gradient(135deg, rgba(102, 187, 106, 0.9), rgba(76, 175, 80, 0.9));
    color: white;
  }
  .notification-warning { 
    background: linear-gradient(135deg, rgba(255, 183, 77, 0.9), rgba(255, 152, 0, 0.9));
    color: white;
  }
  .notification-error { 
    background: linear-gradient(135deg, rgba(239, 83, 80, 0.9), rgba(229, 57, 53, 0.9));
    color: white;
  }
  
  .dismiss-btn {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s;
  }
  
  .dismiss-btn:hover {
    background: rgba(255, 255, 255, 0.3);
  }
</style>
```

### モーダルウィンドウ

```svelte live
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

<svelte:window onkeydown={handleKeydown} />

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

Svelteのトランジション・アニメーション機能により、

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