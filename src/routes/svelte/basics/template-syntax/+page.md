---
title: テンプレート構文 - 特殊タグとアノテーション
description: Svelte5の特殊なテンプレート構文を解説。@render/@html/@const/@debugアノテーション、{#key}ブロック、{#snippet}定義の実装パターンをTypeScriptで解説
---

<script>
	import { base } from '$app/paths';
	import Admonition from '$lib/components/Admonition.svelte';
	import LiveCode from '$lib/components/LiveCode.svelte';
</script>

Svelteのテンプレートは、HTMLをベースに独自の構文を追加したものです。このページでは、Svelteが提供する**特殊なタグとアノテーション**について詳しく解説します。

<Admonition type="info" title="基本的なテンプレート構文について">

`&#123;#if&#125;`、`&#123;#each&#125;`、`&#123;#await&#125;`などの基本的な制御フロー構文については、<a href="{base}/svelte/basics/component-basics/">コンポーネントの基本</a>ページで解説しています。このページでは、より高度な特殊タグとアノテーションを扱います。

</Admonition>

## レンダリングタグ

### @render - Snippetsとchildrenのレンダリング

`&#123;@render&#125;`（render アノテーション）は、[Snippets](/svelte/advanced/snippets/) や `children` を呼び出してレンダリングするためのタグです。

#### 基本的な使い方

下の例では、上部の **「+1」「リセット」ボタン** で `count` を操作すると、3 種類の `{@render}` パターン（常時表示・偶数時のみ・正値時のみ）の表示／非表示がリアルタイムで切り替わる様子が観察できます。同じ `counter` Snippet を **条件に応じて呼び分け** ているのがポイントです。

```svelte live
<script lang="ts">
  let count = $state(0);

  function increment() { count++; }
  function reset() { count = 0; }
</script>

<div class="controls">
  <button onclick={increment}>+1 インクリメント</button>
  <button onclick={reset}>リセット</button>
  <span class="count-display">現在の値: <strong>{count}</strong></span>
</div>

<!-- Snippet 定義: counter(value) -->
{#snippet counter(value: number)}
  <div class="counter">カウント: {value}</div>
{/snippet}

<!-- ① 常に Snippet をレンダリング -->
<h4>① 常にレンダリング</h4>
{@render counter(count)}

<!-- ② 偶数のときだけレンダリング -->
<h4>② 偶数のときだけレンダリング (count % 2 === 0)</h4>
{#if count % 2 === 0}
  {@render counter(count)}
{:else}
  <p class="muted">奇数なので非表示</p>
{/if}

<!-- ③ count > 0 のときだけレンダリング -->
<h4>③ count が 0 より大きいときだけレンダリング</h4>
{#if count > 0}
  {@render counter(count)}
{:else}
  <p class="muted">0 のときは非表示(「+1」を押してください)</p>
{/if}

<style>
  .controls {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    flex-wrap: wrap;
    padding: 0.75rem 1rem;
    background: #f5f5f5;
    color: #222;
    border-radius: 6px;
    margin-bottom: 1rem;
  }
  .controls button {
    padding: 0.4rem 0.8rem;
    background: #ff3e00;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  .controls button:hover { background: #ff5a00; }
  .count-display {
    margin-left: auto;
    color: #222;
  }
  .count-display strong {
    color: #ff3e00;
    font-size: 1.1rem;
  }
  .counter {
    padding: 0.5rem 0.75rem;
    background: #fff3e0;
    color: #222;
    border-left: 3px solid #ff3e00;
    border-radius: 4px;
    margin: 0.25rem 0;
  }
  h4 {
    margin: 0.75rem 0 0.25rem;
    font-size: 0.85rem;
  }
  .muted {
    color: #888;
    font-style: italic;
    margin: 0.25rem 0;
  }
</style>
```

:::tip[オプショナルチェイニングで安全に呼ぶ]

Snippet が **存在するかどうか分からない** 場合（たとえば `children` prop として外から渡されるケース）は、`{@render counter?.(count)}` のように **オプショナルチェイニング** で呼び出せます。`counter` が `undefined` でもエラーにならず、何も描画されないだけで済みます。

```svelte
<!-- counter が undefined の場合でも安全 -->
{@render counter?.(count)}
```

:::

#### コンポーネントの合成：childrenパターン

<Admonition type="info" title="Svelte 5の重要な変更">

Svelte 5では、コンポーネントの合成方法が`<slot />`から`children`パターンに変更されました。これにより、TypeScriptの型安全性が向上し、より明示的なコードが書けるようになりました。

</Admonition>

##### Svelte 5の新しいパターン

```svelte
<!-- Card.svelte -->
<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    title,
    children
  }: {
    title: string;
    children?: Snippet;
  } = $props();
</script>

<div class="card">
  <h2>{title}</h2>
  <div class="content">
    <!-- childrenをレンダリング -->
    {@render children?.()}
  </div>
</div>
```

##### 親コンポーネントでの使用

```svelte
<script lang="ts">
  import Card from './Card.svelte';
</script>

<Card title="ユーザー情報">
  <!-- この部分がchildrenとして渡される -->
  <p>名前: 田中太郎</p>
  <p>メール: tanaka@example.com</p>
</Card>
```

<Admonition type="warning" title="非推奨">

以下の`<slot />`構文はSvelte 4以前のレガシー構文です。新規プロジェクトではSvelte 5の`children`パターンを使用してください。

</Admonition>
<details>
<summary>レガシー構文：slot（Svelte 4以前）の詳細 👈👈 クリックすると展開されます。</summary>

##### Svelte 4以前の書き方

```svelte
<!-- Card.svelte (Svelte 4以前) -->
<script lang="ts">
  export let title: string;
</script>

<div class="card">
  <h2>{title}</h2>
  <div class="content">
    <!-- slotで子コンテンツを受け取る -->
    <slot />
  </div>
</div>
```

##### 名前付きスロット（Svelte 4以前）

```svelte
<!-- Modal.svelte (Svelte 4以前) -->
<div class="modal">
  <div class="modal-header">
    <slot name="header" />
  </div>
  <div class="modal-body">
    <slot />
  </div>
  <div class="modal-footer">
    <slot name="footer" />
  </div>
</div>
```

##### 移行のポイント

| Svelte 4以前              | Svelte 5                           | 説明             |
| ------------------------- | ---------------------------------- | ---------------- |
| `<slot />`                | `&#123;@render children?.()&#125;` | 基本的なスロット |
| `<slot name="header" />`  | `&#123;@render header?.()&#125;`   | 名前付きスロット |
| `<slot>デフォルト</slot>` | 条件分岐で実装                     | フォールバック   |
| 暗黙的な受け取り          | 明示的なprops定義                  | 型安全性の向上   |

</details>

<Admonition type="tip" title="Snippetsとchildrenの使い分け">

<ul>
<li><strong>children</strong>: 親コンポーネントから子コンポーネントにコンテンツを渡す場合</li>
<li><strong>Snippets</strong>: コンポーネント内で再利用可能なテンプレートを定義する場合</li>
<li>両方とも<code>@render</code>でレンダリングします</li>
</ul>

</Admonition>

### @html - HTML文字列の挿入

`@html`（html アノテーション）は、**文字列を HTML として解釈して DOM に挿入** するためのタグです。通常のテンプレート展開 `{value}` が文字列を **エスケープして表示** するのに対し、`{@html value}` は **HTML タグとして実行** します。

#### 基本: `{value}` と `{@html value}` の違い

まず最も単純な比較例から見ます。**同じ文字列を 2 通りで描画** すると、片方は HTML タグがそのまま文字として表示され、もう片方は太字・斜体としてレンダリングされます。

```svelte live
<script lang="ts">
  const htmlString = '<strong>太字</strong> と <em>斜体</em>';
</script>

<div class="example">
  <h4>① 通常の展開: <code>{'{htmlString}'}</code></h4>
  <p class="output">{htmlString}</p>

  <h4>② @html で展開: <code>{'{@html htmlString}'}</code></h4>
  <p class="output">{@html htmlString}</p>
</div>

<style>
  .example {
    padding: 1rem;
    background: #fafafa;
    color: #222;
    border: 1px solid #ddd;
    border-radius: 6px;
  }
  h4 {
    margin: 0.75rem 0 0.25rem;
    font-size: 0.85rem;
    color: #555;
    font-family: monospace;
  }
  code {
    background: #fff;
    color: #ff3e00;
    padding: 0.1rem 0.35rem;
    border-radius: 3px;
    border: 1px solid #eee;
  }
  .output {
    margin: 0;
    padding: 0.5rem 0.75rem;
    background: #fff;
    color: #222;
    border-radius: 4px;
    border: 1px solid #ddd;
  }
</style>
```

①では `<strong>` などのタグが **文字列として可視化** されるのに対し、②では実際に **HTML として解釈** されて太字・斜体になる点を確認してください。これが `@html` の基本動作です。

#### XSS リスクを体感する（インタラクティブデモ）

ここまでが `@html` の素直な使い方ですが、HTML 文字列をそのまま実行可能なコードとして解釈する性質上、**ユーザー入力をそのまま `@html` に渡すと XSS（クロスサイトスクリプティング）攻撃の入り口** になります。下のデモは、入力内容と `@html` のオン／オフを切り替えながら、このリスクを目で見て理解できる構成です。

```svelte live
<script lang="ts">
  let htmlInput = $state('<h3>見出し</h3><p style="color: blue;">青いテキスト</p>');
  let renderAsHtml = $state(false);

  // 危険な例
  let dangerousExample = '<img src=x onerror="alert(\'XSS攻撃！\')">';
</script>

<div style="padding: 1rem; border: 1px solid #ddd; border-radius: 8px;">
  <h4 style="margin-top: 0; color: #ff3e00;">@html デモ - セキュリティを理解する</h4>

  <div style="margin-bottom: 1rem;">
    <label for="html-input" style="display: block; margin-bottom: 0.5rem; font-weight: bold;">HTML入力:</label>
    <textarea
      id="html-input"
      bind:value={htmlInput}
      style="width: 100%; height: 100px; padding: 0.5rem; font-family: monospace; font-size: 0.9rem; border: 1px solid #ccc; border-radius: 4px; background: #f9f9f9; color: #333"
      placeholder="HTMLコードを入力..."
    ></textarea>
  </div>

  <div style="margin-bottom: 1rem;">
    <button
      onclick={() => htmlInput = dangerousExample}
      style="padding: 0.5rem 1rem; background: #ff6b6b; color: white; border: none; border-radius: 4px; cursor: pointer; margin-right: 0.5rem;"
    >
      ⚠️ 危険な例を試す
    </button>
    <button
      onclick={() => htmlInput = '<h3>安全な見出し</h3><p>通常のテキスト</p>'}
      style="padding: 0.5rem 1rem; background: #4ecdc4; color: white; border: none; border-radius: 4px; cursor: pointer;"
    >
      ✅ 安全な例に戻す
    </button>
  </div>

  <label style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem; font-weight: bold;">
    <input type="checkbox" bind:checked={renderAsHtml} />
    <span style="color: {renderAsHtml ? '#ff6b6b' : '#999'};">
      @html を使用 {renderAsHtml ? '（危険！）' : '（オフ）'}
    </span>
  </label>

  <div style="padding: 1rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 4px;">
    <div style="padding: 1rem; background: white; border-radius: 4px; min-height: 60px;">
      <strong style="display: block; margin-bottom: 0.5rem;">出力結果:</strong>
      {#if renderAsHtml}
        {@html htmlInput}
      {:else}
        <pre style="margin: 0; white-space: pre-wrap; font-family: monospace; color: #666;">{htmlInput}</pre>
      {/if}
    </div>
  </div>

  {#if renderAsHtml}
    <div style="margin-top: 1rem; padding: 1rem; background: #ffebee; border-left: 4px solid #f44336; border-radius: 4px;">
      <strong style="color: #c62828;">⚠️ セキュリティ警告</strong>
      <p style="margin: 0.5rem 0 0; color: #c62828;">
        本番環境では、ユーザー入力を直接@htmlで表示しないでください。
        必ずDOMPurifyなどのサニタイズライブラリを使用してください。
      </p>
    </div>
  {:else}
    <div style="margin-top: 1rem; padding: 1rem; background: #e8f5e9; border-left: 4px solid #4caf50; border-radius: 4px;">
      <strong style="color: #2e7d32;">✅ 安全モード</strong>
      <p style="margin: 0.5rem 0 0; color: #2e7d32;">
        HTMLはエスケープされて表示されています。これが最も安全な方法です。
      </p>
    </div>
  {/if}
</div>
```

<Admonition type="warning" title="セキュリティ警告">

`@html`タグは非常に危険です。ユーザー入力や信頼できないソースからのコンテンツには**絶対に使用しないでください**。必ずサニタイズライブラリ（DOMPurify等）を使用してXSS攻撃を防いでください。

</Admonition>

## 制御フロータグ

### @const - ローカル定数の定義

`@const`（constアノテーション）は、テンプレート内でローカル定数を定義します。`&#123;#if&#125;`、`&#123;#each&#125;`、`&#123;#snippet&#125;`などのブロック内でのみ使用できます。

```svelte live
<script lang="ts">
  let items = $state([
    { name: '商品A', price: 1000, quantity: 2 },
    { name: '商品B', price: 2000, quantity: 1 },
    { name: '商品C', price: 1500, quantity: 3 }
  ]);
</script>

{#each items as item (item.name)}
  <!-- ブロック内でローカル定数を定義 -->
  {@const total = item.price * item.quantity}
  {@const tax = total * 0.1}
  {@const totalWithTax = total + tax}

  <div class="item">
    <h3>{item.name}</h3>
    <p>単価: {item.price}円 × {item.quantity}個</p>
    <p>小計: {total}円</p>
    <p>税込: {totalWithTax}円</p>
  </div>
{/each}

{#if items.length > 0}
  {@const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0)}
  <div class="summary">
    合計金額: {totalAmount}円
  </div>
{/if}

```

<Admonition type="info" title="使用場所の制限">

`@const`タグは、ブロック構文（`&#123;#if&#125;`、`&#123;#each&#125;`、`&#123;#await&#125;`、`&#123;#snippet&#125;`、`&#123;#key&#125;`）の直下でのみ使用できます。コンポーネントのトップレベルでは使用できません。

</Admonition>

### #key - 強制的な再レンダリング

`{#key 式}` ブロックは、**式の値が変更されたときに、その内部のコンテンツを完全に破棄して再作成** します。通常 Svelte は効率化のため要素を可能な限り使い回しますが、`{#key}` で囲んだ範囲は **強制的に DOM ごと作り直し** になるため、ローカル DOM 状態のリセットや入場アニメーションの再生に活用できます。

#### 動作を実機で確認

下の例は **「`{#key}` 無し」と「`{#key userId}` 付き」を左右に並べた比較デモ** です。両方の `<input>` に文字を入力してから「User ID を +1」ボタンを押すと、

- **左（`{#key}` 無し）**: 入力値は保持され、アニメーションも再生されない
- **右（`{#key userId}` 付き）**: 入力値がリセットされ、フェードインアニメーションが再生される

という差がはっきり見えます。

```svelte live
<script lang="ts">
  let userId = $state(1);

  function changeUser() { userId++; }
  function reset() { userId = 1; }
</script>

<div class="controls">
  <button onclick={changeUser}>User ID を +1 (現在: {userId})</button>
  <button onclick={reset}>リセット</button>
</div>

<div class="grid">
  <!-- 左: key で囲んでいない版 -->
  <div class="panel">
    <h4>① key 無し版</h4>
    <p class="hint">User ID 変更後も入力値が保持される</p>
    <input type="text" placeholder="ここに何か入力" />
    <div class="animation-box">この箱は再生成されない</div>
  </div>

  <!-- 右: {#key userId} ... {/key} で囲んだ版 -->
  <div class="panel">
    <h4>② key 付き版</h4>
    <p class="hint">User ID 変更で input が再生成 → 値リセット & アニメ再生</p>
    {#key userId} <!-- userId が変わった瞬間にブロック内をリセットしてゼロから組み立て直す。 -->
      <input type="text" placeholder="ここに何か入力" />
      <div class="animation-box">User 変更時にフェードイン</div>
    {/key}
  </div>
</div>

<style>
  .controls {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    align-items: center;
    margin-bottom: 1rem;
    padding: 0.75rem;
    background: #f5f5f5;
    color: #222;
    border-radius: 6px;
  }
  .controls button {
    padding: 0.4rem 0.8rem;
    background: #ff3e00;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
  }
  @media (max-width: 600px) {
    .grid { grid-template-columns: 1fr; }
  }
  .panel {
    padding: 0.75rem;
    background: #fff;
    color: #222;
    border: 1px solid #ddd;
    border-radius: 6px;
  }
  .panel h4 {
    margin: 0 0 0.25rem;
    color: #ff3e00;
    font-size: 0.95rem;
  }
  .hint {
    margin: 0 0 0.5rem;
    color: #666;
    font-size: 0.8rem;
  }
  .panel input {
    width: 100%;
    padding: 0.4rem;
    border: 1px solid #888;
    background: #fff;
    color: #222;
    border-radius: 4px;
    box-sizing: border-box;
  }
  .animation-box {
    margin-top: 0.5rem;
    padding: 0.5rem 0.75rem;
    background: #fff3e0;
    color: #222;
    border-left: 3px solid #ff3e00;
    border-radius: 4px;
    animation: fadeIn 1.2s;
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-4px); }
    to { opacity: 1; transform: translateY(0); }
  }
</style>
```

:::tip[なぜ「入力値が保持される」のか]

Svelte は描画を効率化するため、**式の値が変わっても DOM 要素自体は使い回し**、属性や中身だけを更新します。`<input>` の current value、focus、選択範囲などの **ブラウザネイティブな状態** は要素自身が持つため、Svelte の更新では消えません。`{#key}` で囲むと「式が変わったら要素ごと作り直し」になるため、これらの状態もリセットされます。

:::

#### 実用パターン

実プロジェクトでは以下のような形で使われます（コンポーネント名は例示）。

```svelte
<script lang="ts">
  let userId = $state(1);
  let refreshKey = $state(0);
  let currentPage = $state('home');

  // コンポーネントを完全にリセットする関数
  function resetComponent() {
    refreshKey++;
  }
</script>

<!-- ① ルーティング: userId が変わったら UserProfile を作り直す -->
{#key userId}
  <UserProfile {userId} />
{/key}

<!-- ② 手動リセット: ボタンクリックで refreshKey をインクリメント -->
{#key refreshKey}
  <ComplexForm />
{/key}
<button onclick={resetComponent}>フォームをリセット</button>

<!-- ③ トランジションと組み合わせ: ページ遷移時にフェードを再生 -->
{#key currentPage}
  <div transition:fade>
    <PageContent page={currentPage} />
  </div>
{/key}
```

<Admonition type="tip" title="使用例">

<ul>
<li>ルーティングでページが変わった時にコンポーネントをリセット</li>
<li>フォームを初期状態に戻す</li>
<li>アニメーションを再実行する</li>
<li>外部ライブラリのウィジェットを再初期化する</li>
</ul>

</Admonition>

## デバッグタグ

### @debug - デバッグ情報の出力

`@debug`（debugアノテーション）は、指定した変数の値が変更されるたびに、ブラウザのデバッガーを一時停止し、コンソールに値を出力します。

```svelte
<script lang="ts">
  let user = $state({ name: '太郎', age: 25 });
  let count = $state(0);
  let items = $state<string[]>([]);
</script>

<!-- 特定の変数をデバッグ -->
{@debug user}

<!-- 複数の変数をデバッグ -->
{@debug user, count, items}

<!-- 引数なしで全ての状態をデバッグ -->
{@debug}

<!-- 条件付きデバッグ -->
{#if count > 10}
  {@debug count}
{/if}

<button onclick={() => count++}>
  カウント: {count}
</button>
```

<Admonition type="warning" title="本番環境での使用">

`@debug`タグは開発時のデバッグ用です。本番環境にデプロイする前に、必ず削除するか、ビルド設定で無効化してください。

</Admonition>
<Admonition type="tip" title="@debugと$inspectの使い分け">

Svelte 5では、`$inspect`ルーンも利用できます。それぞれの特徴を理解して使い分けましょう。

**`@debug`タグ（テンプレート内）**

<ul>
<li>ブラウザのデバッガーで一時停止</li>
<li>特定の条件下でのデバッグに便利</li>
<li>テンプレート内の任意の位置に配置可能</li>
</ul>

**`$inspect`ルーン（script内）**

<ul>
<li>コンソールに継続的に値を出力</li>
<li>リアクティブな値の変化を追跡</li>
<li>本番ビルドで自動的に削除される</li>
</ul>

</Admonition>

```svelte
<script lang="ts">
  let count = $state(0);

  // $inspectで継続的に監視
  $inspect(count);  // countの変化を常にコンソールに出力
</script>

<!-- @debugで特定のタイミングで停止 -->
{#if count > 5}
  {@debug count}  // count > 5の時のみデバッガー停止
{/if}
```

詳しくは[`$inspect`ルーン](/svelte/runes/inspect/)を参照してください。

### デバッグタグの動作

1. **ブレークポイント**: デバッガーが開いている場合、`@debug`タグの位置で実行が一時停止
2. **コンソール出力**: 指定した変数の現在値をコンソールに出力
3. **変更検知**: 変数の値が変更されるたびに発火

```svelte
<script lang="ts">
  let formData = $state({
    name: '',
    email: '',
    message: ''
  });
</script>

<!-- フォームデータの変更を監視 -->
{@debug formData}

<form>
  <input bind:value={formData.name} placeholder="名前" />
  <input bind:value={formData.email} placeholder="メール" />
  <textarea bind:value={formData.message} placeholder="メッセージ"></textarea>
</form>
```

## 特殊なバインディング

### `bind:innerHTML`

`<div contenteditable="true">` などに `bind:innerHTML` を使うと、要素の `innerHTML` プロパティと Svelte の状態変数を **双方向にバインド** できます。ユーザーがリッチテキスト編集すると、その結果の HTML 文字列が自動で変数に反映されます。

下のデモは、上段の編集領域で太字（`Cmd/Ctrl + B`）やリスト化を試すと、下段の「バインドされた HTML ソース」が **リアルタイムで更新** される様子が確認できます。

```svelte live
<script lang="ts">
  let editorContent = $state('<p>初期コンテンツ</p>');
</script>

<!-- contenteditable 要素での WYSIWYG エディター -->
<p class="label">📝 編集エリア(リッチテキストで直接編集できます)</p>
<div contenteditable="true" bind:innerHTML={editorContent} class="editor"></div>

<!-- バインドされた HTML ソースをそのまま文字列として表示 -->
<p class="label">🔎 バインドされた HTML ソース(編集と同期して更新)</p>
<pre class="preview">{editorContent}</pre>

<style>
  .label {
    margin: 0.75rem 0 0.25rem;
    color: #999;
    font-size: 0.85rem;
    font-weight: 600;
  }
  .editor {
    border: 1px solid #888;
    padding: 0.75rem;
    min-height: 80px;
    background: #fff;
    color: #222;
    border-radius: 4px;
  }
  .editor:focus {
    outline: 2px solid #ff3e00;
    outline-offset: -2px;
  }
  .preview {
    margin: 0;
    border: 1px solid #ccc;
    padding: 0.75rem;
    min-height: 80px;
    background: #fafafa;
    color: #222;
    border-radius: 4px;
    font-family: monospace;
    font-size: 0.85rem;
    white-space: pre-wrap;
    word-break: break-word;
  }
</style>
```

:::tip[なぜプレビュー側で `{@html}` を使わないのか]

ESLint の [`svelte/no-at-html-tags`](https://sveltejs.github.io/eslint-plugin-svelte/rules/no-at-html-tags/) ルールが指摘するとおり、`{@html ユーザー入力}` は **XSS の温床** になります。

本デモでは「**編集領域＝ `contenteditable` 自体が WYSIWYG 表示**」「**プレビュー領域＝バインドで取得した HTML ソースを `{editorContent}` でエスケープ表示**」という分業にすることで、`@html` を一切使わずに **編集とソース確認を両立** しています。

実プロジェクトで生成 HTML を「再レンダリングして見せたい」場合は、必ず [DOMPurify](https://github.com/cure53/DOMPurify) などのサニタイザを通してから `{@html}` を使う、もしくは [Markdown レンダラ](#安全なmarkdownレンダリング) のように **信頼できる変換器の出力のみ** を扱うようにしてください。

:::

### `bind:textContent`

要素のtextContentプロパティにバインドします。

```svelte
<script lang="ts">
  let textContent = $state('');
</script>

<div
  contenteditable="true"
  bind:textContent={textContent}
  class="text-editor"
></div>

<p>文字数: {textContent.length}</p>
```

## 高度な使用例

### 動的なSnippetレンダリング（実行可能デモ）

```svelte live
<script lang="ts">
  let activeTab = $state('tab1');
  let count = $state(0);
</script>

{#snippet tab1Content()}
  <div style="padding: 1rem; background: #f0f0f0; border-radius: 4px; color: #333">
    <h3>📝 タブ1: 基本情報</h3>
    <p>Snippetを使った動的なコンテンツレンダリングの例です。</p>
    <button onclick={() => count++} style="padding: 0.5rem; background: #ff3e00; color: white; border: none; border-radius: 4px;">
      カウント: {count}
    </button>
  </div>
{/snippet}

{#snippet tab2Content()}
  <div style="padding: 1rem; background: #e8f5e9; border-radius: 4px; color: #333">
    <h3>🎨 タブ2: デザイン設定</h3>
    <p>異なるSnippetを切り替えて表示できます。</p>
    <p>現在のカウント値: <strong>{count}</strong></p>
  </div>
{/snippet}

{#snippet tab3Content()}
  {@const doubled = count * 2}
  <div style="padding: 1rem; background: #fff3e0; border-radius: 4px; color: #333">
    <h3>⚙️ タブ3: 詳細設定</h3>
    <p>@constを使って計算値を定義: {count} × 2 = <strong>{doubled}</strong></p>
  </div>
{/snippet}

<div style="padding: 1rem;">
  <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem;">
    <button
      onclick={() => activeTab = 'tab1'}
      style="padding: 0.5rem 1rem; background: {activeTab === 'tab1' ? '#ff3e00' : '#ccc'}; color: white; border: none; border-radius: 4px; cursor: pointer;"
    >
      タブ1
    </button>
    <button
      onclick={() => activeTab = 'tab2'}
      style="padding: 0.5rem 1rem; background: {activeTab === 'tab2' ? '#ff3e00' : '#ccc'}; color: white; border: none; border-radius: 4px; cursor: pointer;"
    >
      タブ2
    </button>
    <button
      onclick={() => activeTab = 'tab3'}
      style="padding: 0.5rem 1rem; background: {activeTab === 'tab3' ? '#ff3e00' : '#ccc'}; color: white; border: none; border-radius: 4px; cursor: pointer;"
    >
      タブ3
    </button>
  </div>

  {#if activeTab === 'tab1'}
    {@render tab1Content()}
  {:else if activeTab === 'tab2'}
    {@render tab2Content()}
  {:else if activeTab === 'tab3'}
    {@render tab3Content()}
  {/if}
</div>
```

## 実践的な実装パターン

ここからは、テンプレート構文を組み合わせた実践的な実装例を紹介します。

### タブシステムの実装

Snippetsと条件分岐を組み合わせた、実用的なタブコンポーネントの実装例です。

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';
  type TabContent = {
    id: string;
    title: string;
    snippet: Snippet;
  };

  let activeTab = $state('tab1');
</script>

{#snippet tab1Content()}
  <div>タブ1のコンテンツ</div>
{/snippet}

{#snippet tab2Content()}
  <div>タブ2のコンテンツ</div>
{/snippet}

{#snippet tab3Content()}
  <div>タブ3のコンテンツ</div>
{/snippet}

{#if true}
  {@const tabs = [
    { id: 'tab1', title: 'タブ1', snippet: tab1Content },
    { id: 'tab2', title: 'タブ2', snippet: tab2Content },
    { id: 'tab3', title: 'タブ3', snippet: tab3Content }
  ]}

  <div class="tabs">
    {#each tabs as tab (tab.id)}
      <button
        class:active={activeTab === tab.id}
        onclick={() => activeTab = tab.id}
      >
        {tab.title}
      </button>
    {/each}
  </div>

  <div class="tab-content">
    {#each tabs as tab (tab.id)}
      {#if activeTab === tab.id}
        {@render tab.snippet()}
      {/if}
    {/each}
  </div>
{/if}
```

### 安全なMarkdownレンダリング

`@html`を使用してMarkdownコンテンツを安全にレンダリングする実装例です。DOMPurifyによるサニタイズで、XSS攻撃を防ぎます。

```svelte
<script lang="ts">
  import { marked } from 'marked';
  import DOMPurify from 'dompurify';

  let markdown = $state('# Hello World\n\nThis is **markdown**');
  let renderAsHtml = $state(true);

  // Markdownを安全なHTMLに変換
  // 複数行の処理が必要な場合は $derived.by() を使用
  let safeHtml = $derived.by(() => {
    const rawHtml = marked(markdown);
    return DOMPurify.sanitize(rawHtml);
  });
</script>

<textarea bind:value={markdown}></textarea>

<label>
  <input type="checkbox" bind:checked={renderAsHtml} />
  HTMLとして表示
</label>

<div class="output">
  {#if renderAsHtml}
    {@html safeHtml}
  {:else}
    <pre>{markdown}</pre>
  {/if}
</div>
```

### フォームバリデーション with デバッグ機能

`@debug`と`@const`を組み合わせた、実用的なフォームバリデーションの実装例です。

```svelte
<script lang="ts">
  type FormData = {
    username: string;
    password: string;
    rememberMe: boolean;
  };

  let formData = $state<FormData>({
    username: '',
    password: '',
    rememberMe: false
  });

  let showDebug = $state(false);
</script>

<label>
  <input type="checkbox" bind:checked={showDebug} />
  デバッグモード
</label>

{#if showDebug}
  {@debug formData}
{/if}

<form>
  {#key formData.username}
    {@const isValidUsername = formData.username.length >= 3}
    <input
      bind:value={formData.username}
      class:valid={isValidUsername}
      placeholder="ユーザー名"
    />
    {#if !isValidUsername && formData.username}
      <span class="error">3文字以上入力してください</span>
    {/if}
  {/key}

  <input
    type="password"
    bind:value={formData.password}
    placeholder="パスワード"
  />

  <label>
    <input type="checkbox" bind:checked={formData.rememberMe} />
    ログイン状態を保持
  </label>
</form>
```

## ベストプラクティス

### 1. セキュリティを最優先に

```typescript
// ❌ 悪い例：生のユーザー入力
{@html userInput}

// ✅ 良い例：サニタイズ済み
import DOMPurify from 'dompurify';
{@html DOMPurify.sanitize(userInput)}
```

### 2. @constで計算を最適化

```svelte
<!-- ❌ 悪い例：同じ計算を繰り返す -->
{#each items as item (item.id)}
  <div>小計: {item.price * item.quantity}円</div>
  <div>税込: {item.price * item.quantity * 1.1}円</div>
{/each}

<!-- ✅ 良い例：計算結果を保存 -->
{#each items as item (item.id)}
  {@const subtotal = item.price * item.quantity}
  {@const tax = subtotal * 0.1}
  <div>小計: {subtotal}円</div>
  <div>税込: {subtotal + tax}円</div>
{/each}
```

### 3. #keyの適切な使用

```svelte
<!-- ❌ 悪い例：不要な再レンダリング -->
{#key Math.random()}
  <ExpensiveComponent />
{/key}

<!-- ✅ 良い例：意味のあるキー -->
{#key userId}
  <UserProfile {userId} />
{/key}
```

### 4. デバッグタグの管理

```typescript
// svelte.config.js
export default {
  compilerOptions: {
    // 本番ビルドでデバッグタグを無効化
    dev: process.env.NODE_ENV !== 'production',
  },
};
```

## まとめ

Svelteのテンプレート構文は、宣言的で強力な機能を提供します。

- **`&#123;@render&#125;`** - Snippetsのレンダリング
- **`&#123;@html&#125;`** - HTML文字列の挿入（要サニタイズ）
- **`&#123;@const&#125;`** - ブロック内でのローカル定数定義
- **`&#123;#key&#125;`** - 強制的な再レンダリング
- **`&#123;@debug&#125;`** - 開発時のデバッグ支援

これらの機能を適切に使用することで、より効率的で保守しやすいコンポーネントを作成できます。

<Admonition type="info" title="関連リンク">

<ul>
<li><a href="{base}/svelte/basics/component-basics/">コンポーネントの基本</a> - 基本的なテンプレート構文</li>
<li><a href="{base}/svelte/advanced/snippets/">Snippets</a> - @renderの詳細な使い方</li>
<li><a href="{base}/svelte/basics/transitions/">トランジション・アニメーション</a> - #keyとの組み合わせ</li>
</ul>

</Admonition>
次は<a href="{base}/svelte/basics/special-elements/">特別な要素</a>で、Svelteの高度な要素について学びましょう。
