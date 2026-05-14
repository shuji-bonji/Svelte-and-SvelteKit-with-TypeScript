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

`&#123;@render&#125;`（renderアノテーション）は、[Snippets](/svelte/advanced/snippets/)や`children`を呼び出してレンダリングするためのタグです。

#### 基本的な使い方

```svelte
<script lang="ts">
  // Snippet定義
  let count = $state(0);
</script>

{#snippet counter(value: number)}
  <div class="counter">
    カウント: {value}
  </div>
{/snippet}

<!-- Snippetをレンダリング -->
{@render counter(count)}

<!-- 条件付きレンダリング -->
{#if count > 0}
  {@render counter(count)}
{/if}

<!-- オプショナルなSnippetの安全な呼び出し -->
{@render counter?.(count)}
```

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

### @html - HTML文字列の挿入（インタラクティブデモ）

`@html`（htmlアノテーション）は、文字列をHTMLとして解釈してDOMに挿入します。XSS攻撃のリスクがあるため、信頼できるコンテンツのみに使用してください。

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
    />
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
      {'@html'}を使用 {renderAsHtml ? '（危険！）' : '（オフ）'}
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

```svelte
<script lang="ts">
  let items = $state([
    { name: '商品A', price: 1000, quantity: 2 },
    { name: '商品B', price: 2000, quantity: 1 },
    { name: '商品C', price: 1500, quantity: 3 }
  ]);
</script>

{#each items as item (item.id)}
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
  {@const totalAmount = items.reduce((sum, item) =>
    sum + item.price * item.quantity, 0
  )}
  <div class="summary">
    合計金額: {totalAmount}円
  </div>
{/if}
```

<Admonition type="info" title="使用場所の制限">

`@const`タグは、ブロック構文（`&#123;#if&#125;`、`&#123;#each&#125;`、`&#123;#await&#125;`、`&#123;#snippet&#125;`、`&#123;#key&#125;`）の直下でのみ使用できます。コンポーネントのトップレベルでは使用できません。

</Admonition>

### #key - 強制的な再レンダリング

`#key`ブロックは、式の値が変更されたときに、その内部のコンテンツを完全に破棄して再作成します。

```svelte
<script lang="ts">
  let userId = $state(1);
  let refreshKey = $state(0);

  // コンポーネントを完全にリセットする関数
  function resetComponent() {
    refreshKey++;
  }
</script>

<!-- userIdが変更されたら、UserProfileを再作成 -->
{#key userId}
  <UserProfile {userId} />
{/key}

<!-- 手動でコンポーネントをリセット -->
{#key refreshKey}
  <ComplexForm />
{/key}
<button onclick={resetComponent}>
  フォームをリセット
</button>

<!-- トランジションと組み合わせる -->
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
  <textarea bind:value={formData.message} placeholder="メッセージ" />
</form>
```

## 特殊なバインディング

### `bind:innerHTML`

要素のinnerHTMLプロパティにバインドします。`@html`タグと同様にXSSリスクがあります。

```svelte
<script lang="ts">
  let htmlContent = $state('');
  let editorContent = $state('<p>初期コンテンツ</p>');
</script>

<!-- contenteditable要素でのWYSIWYGエディター -->
<div
  contenteditable="true"
  bind:innerHTML={editorContent}
  class="editor"
></div>

<!-- プレビュー -->
<div class="preview">
  {@html editorContent}
</div>
```

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

<textarea bind:value={markdown} />

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
