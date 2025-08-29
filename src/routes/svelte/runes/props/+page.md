---
title: $propsルーン
description: コンポーネントのプロパティ定義と型安全な受け渡し
---

<script>
  import PropsDemo from '$lib/components/PropsDemo.svelte';
</script>

`$props`は、Svelte 5のRunesシステムでコンポーネント間のデータ受け渡しを行うための機能です。このページでは、`$props`の基本的な使い方から、TypeScriptとの統合、高度なパターンまで、実践的な活用方法を解説します。

:::tip[React/Vue経験者向け]
- `$props`は React の props や Vue の props に相当
- TypeScriptの型定義により完全な型安全性を提供
- デフォルト値の設定やrest propsのサポート
- Svelte 5では従来の`export let`から`$props`に移行
:::

## $propsとは

`$props`は、親コンポーネントからプロパティを受け取るためのルーンです。Svelte 5では、従来の`export let`の代わりに`$props`を使用します。

### 主な特徴

- **型安全**: TypeScriptとの完全な統合
- **デフォルト値**: 分割代入時にデフォルト値を設定可能
- **Rest Props**: 残りのプロパティを`...rest`で受け取り可能
- **リアクティブ**: propsの変更は自動的に追跡される

:::warning[重要な変更点]
Svelte 5では`export let`は非推奨となり、`$props`の使用が推奨されます。
```typescript
// ❌ 古い書き方（Svelte 4以前）
export let name: string;
export let age = 0;

// ✅ 新しい書き方（Svelte 5）
let { name, age = 0 } = $props<{ name: string; age?: number }>();
```
:::

## 基本的な使い方

最もシンプルな`$props`の使い方から、デフォルト値の設定方法までを見ていきましょう。

### シンプルなProps

```typescript
// Button.svelte
type Props = {
  label: string;
  disabled?: boolean;
};

let { label, disabled = false }: Props = $props();
```

```svelte
<!-- 親コンポーネント -->
<Button label="クリック" disabled={true} />
```

### デフォルト値

propsが渡されなかった場合に使用されるデフォルト値を、分割代入時に設定できます。

```typescript
type Props = {
  count?: number;
  message?: string;
  items?: string[];
};

let { 
  count = 0,
  message = 'デフォルトメッセージ',
  items = []
}: Props = $props();
```

## Rest Props

HTML属性の透過や、予期しないpropsの処理に便利なrest propsパターンを紹介します。

```typescript
type Props = {
  variant: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
};

let { 
  variant,
  size = 'medium',
  ...restProps
}: Props = $props();

// restPropsには、variant と size 以外のすべてのプロパティが含まれる
```

```svelte
<!-- ボタン要素に残りのプロパティを展開 -->
<button {...restProps} class="btn btn-{variant} btn-{size}">
  <slot />
</button>
```

## 高度な型定義

TypeScriptの型システムを活用した、より複雑で型安全なpropsの定義方法を解説します。

### HTMLAttributes との組み合わせ

ネイティブHTML要素の属性を継承しつつ、独自のpropsを追加するパターンです。

```typescript
import type { HTMLButtonAttributes } from 'svelte/elements';

type Props = HTMLButtonAttributes & {
  variant?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
};

let { 
  variant = 'primary',
  loading = false,
  disabled,
  ...restProps
}: Props = $props();

// disabled は loading 中も true にする
$: isDisabled = disabled || loading;
```

### ジェネリック型を使用

汎用的なコンポーネントを作成する際に、ジェネリック型を使用して柔軟性を保ちます。

```typescript
// SelectList.svelte
type Props<T> = {
  items: T[];
  selected?: T;
  getLabel?: (item: T) => string;
  getValue?: (item: T) => string;
};

let { 
  items,
  selected,
  getLabel = (item) => String(item),
  getValue = (item) => String(item)
}: Props<T> = $props();
```

## イベントハンドラ

親コンポーネントにイベントを伝えるためのコールバック関数のprops定義パターンです。

```typescript
type Props = {
  onClick?: (event: MouseEvent) => void;
  onChange?: (value: string) => void;
  onSubmit?: (data: FormData) => void;
};

let { onClick, onChange, onSubmit }: Props = $props();

function handleClick(event: MouseEvent) {
  // 内部処理
  console.log('ボタンクリック');
  
  // 親のハンドラを呼び出す
  onClick?.(event);
}
```

## 子要素としてのコンポーネント

Snippetを使用して、子要素やスロットのような柔軟なコンテンツの受け渡しを実現します。

```typescript
import type { Snippet } from 'svelte';

type Props = {
  title: string;
  icon?: Snippet;
  actions?: Snippet;
  children: Snippet;
};

let { title, icon, actions, children }: Props = $props();
```

```svelte
<div class="card">
  <header>
    {#if icon}
      {@render icon()}
    {/if}
    <h2>{title}</h2>
    {#if actions}
      {@render actions()}
    {/if}
  </header>
  <main>
    {@render children()}
  </main>
</div>
```

## 実践例：コンポーネントライブラリ

`$props`を活用した再利用可能なコンポーネントライブラリの実装例です。ボタン、カード、フォーム要素など、実際のプロジェクトで使えるコンポーネントを作成します。

<PropsDemo />

### コンポーネントのソースコード

以下は、上記デモで使用している各コンポーネントの実装です。

#### PropsDemo（親コンポーネント）

```svelte
<!-- PropsDemo.svelte -->
<script lang="ts">
  import Button from './Button.svelte';
  import Card from './Card.svelte';
  import Alert from './Alert.svelte';
  import SimpleFormField from './SimpleFormField.svelte';
  
  // デモ用の状態
  let formData = $state({
    username: '',
    email: '',
    message: ''
  });
  
  let errors = $state<Record<string, string>>({});
  let showSuccessAlert = $state(false);
  
  function handleButtonClick(variant: string, size: string) {
    alert(`${variant} ${size} ボタンがクリックされました！`);
  }
  
  function validateForm() {
    errors = {};
    
    if (!formData.username) {
      errors.username = 'ユーザー名は必須です';
    }
    if (!formData.email) {
      errors.email = 'メールアドレスは必須です';
    } else if (!formData.email.includes('@')) {
      errors.email = '有効なメールアドレスを入力してください';
    }
    
    return Object.keys(errors).length === 0;
  }
  
  function handleSubmit() {
    if (validateForm()) {
      showSuccessAlert = true;
      setTimeout(() => {
        showSuccessAlert = false;
      }, 3000);
      formData = { username: '', email: '', message: '' };
    }
  }
</script>

<div class="demo-container">
  <h2>🎨 $propsを使ったコンポーネントライブラリ</h2>
  
  <!-- ボタンコンポーネント -->
  <section class="component-section">
    <h3>Buttonコンポーネント</h3>
    <div class="button-grid">
      <Button onClick={() => handleButtonClick('primary', 'small')} size="small">
        Small Primary
      </Button>
      <Button onClick={() => handleButtonClick('primary', 'medium')}>
        Medium Primary
      </Button>
      <!-- 他のボタンも同様に配置... -->
    </div>
  </section>
  
  <!-- カードコンポーネント -->
  <section class="component-section">
    <h3>Cardコンポーネント</h3>
    <div class="card-grid">
      <Card title="基本カード" subtitle="シンプルなカード">
        これは基本的なカードコンポーネントです。
      </Card>
      
      <Card title="アクション付き" subtitle="インタラクティブ">
        {#snippet footer()}
          <Button size="small">詳細</Button>
          <Button variant="secondary" size="small">共有</Button>
        {/snippet}
        フッターにアクションボタンがあります。
      </Card>
    </div>
  </section>
  
  <!-- フォームコンポーネント -->
  <section class="component-section">
    <h3>FormFieldコンポーネント</h3>
    <form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
      <SimpleFormField
        label="ユーザー名"
        required
        bind:value={formData.username}
        error={errors.username}
        placeholder="ユーザー名を入力"
      />
      
      <SimpleFormField
        label="メールアドレス"
        type="email"
        required
        bind:value={formData.email}
        error={errors.email}
        helpText={!errors.email ? "連絡先のメールアドレスを入力してください" : undefined}
        placeholder="email@example.com"
      />
      
      <div class="form-actions">
        <Button onClick={handleSubmit}>送信</Button>
        <Button variant="secondary" onClick={() => {...}}>リセット</Button>
      </div>
    </form>
  </section>
</div>
```

#### Buttonコンポーネント

```svelte
<!-- Button.svelte -->
<script lang="ts">
  import type { Snippet } from 'svelte';
  
  type Props = {
    variant?: 'primary' | 'secondary' | 'danger';
    size?: 'small' | 'medium' | 'large';
    disabled?: boolean;
    onClick?: () => void;
    children: Snippet;
  };
  
  let { 
    variant = 'primary', 
    size = 'medium', 
    disabled = false,
    onClick,
    children 
  }: Props = $props();
</script>

<button
  class="btn btn-{variant} btn-{size}"
  {disabled}
  onclick={onClick}
>
  {@render children()}
</button>

<style>
  .btn {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .btn-primary {
    background: #ff3e00;
    color: white;
  }
  
  .btn-primary:hover:not(:disabled) {
    background: #ff5a00;
  }
  
  .btn-secondary {
    background: #6c757d;
    color: white;
  }
  
  .btn-secondary:hover:not(:disabled) {
    background: #5a6268;
  }
  
  .btn-danger {
    background: #dc3545;
    color: white;
  }
  
  .btn-danger:hover:not(:disabled) {
    background: #c82333;
  }
  
  .btn-small {
    padding: 0.25rem 0.5rem;
    font-size: 0.875rem;
  }
  
  .btn-medium {
    padding: 0.5rem 1rem;
    font-size: 1rem;
  }
  
  .btn-large {
    padding: 0.75rem 1.5rem;
    font-size: 1.125rem;
  }
  
  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
```

#### Cardコンポーネント

```svelte
<!-- Card.svelte -->
<script lang="ts">
  import type { Snippet } from 'svelte';
  
  type Props = {
    title: string;
    subtitle?: string;
    image?: string;
    footer?: Snippet;
    children: Snippet;
  };
  
  let { 
    title,
    subtitle,
    image,
    footer,
    children 
  }: Props = $props();
</script>

<div class="card">
  {#if image}
    <div class="card-image">
      {#if image === 'placeholder'}
        <div class="placeholder">📷</div>
      {:else}
        <img src={image} alt={title} />
      {/if}
    </div>
  {/if}
  
  <div class="card-header">
    <h4>{title}</h4>
    {#if subtitle}
      <p class="card-subtitle">{subtitle}</p>
    {/if}
  </div>
  
  <div class="card-body">
    {@render children()}
  </div>
  
  {#if footer}
    <div class="card-footer">
      {@render footer()}
    </div>
  {/if}
</div>

<style>
  .card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    overflow: hidden;
  }
  
  .card-image {
    height: 150px;
    background: #f0f0f0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .card-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .placeholder {
    font-size: 3rem;
  }
  
  .card-header {
    padding: 1rem;
    border-bottom: 1px solid #eee;
  }
  
  .card-header h4 {
    margin: 0;
    color: #333;
  }
  
  .card-subtitle {
    margin: 0.25rem 0 0;
    color: #666;
    font-size: 0.875rem;
  }
  
  .card-body {
    padding: 1rem;
  }
  
  .card-footer {
    padding: 1rem;
    border-top: 1px solid #eee;
    display: flex;
    gap: 0.5rem;
  }
</style>
```

#### Alertコンポーネント

```svelte
<!-- Alert.svelte -->
<script lang="ts">
  import type { Snippet } from 'svelte';
  
  type Props = {
    type?: 'info' | 'success' | 'warning' | 'error';
    title?: string;
    dismissible?: boolean;
    onDismiss?: () => void;
    children: Snippet;
  };
  
  let { 
    type = 'info',
    title,
    dismissible = false,
    onDismiss,
    children 
  }: Props = $props();
  
  let visible = $state(true);
  
  function handleDismiss() {
    visible = false;
    onDismiss?.();
  }
</script>

{#if visible}
  <div class="alert alert-{type}">
    <div class="alert-content">
      {#if title}
        <strong>{title}:</strong>
      {/if}
      {@render children()}
    </div>
    {#if dismissible}
      <button class="alert-close" onclick={handleDismiss}>
        ×
      </button>
    {/if}
  </div>
{/if}

<style>
  .alert {
    padding: 1rem;
    border-radius: 4px;
    margin-bottom: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .alert-content {
    flex: 1;
  }
  
  .alert-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.7;
  }
  
  .alert-close:hover {
    opacity: 1;
  }
  
  .alert-info {
    background: #cfe2ff;
    color: #084298;
    border: 1px solid #b6d4fe;
  }
  
  .alert-success {
    background: #d1e7dd;
    color: #0f5132;
    border: 1px solid #badbcc;
  }
  
  .alert-warning {
    background: #fff3cd;
    color: #856404;
    border: 1px solid #ffecb5;
  }
  
  .alert-error {
    background: #f8d7da;
    color: #842029;
    border: 1px solid #f5c2c7;
  }
</style>
```

#### SimpleFormFieldコンポーネント

```svelte
<!-- SimpleFormField.svelte -->
<script lang="ts">
  type Props = {
    label: string;
    error?: string;
    helpText?: string;
    required?: boolean;
    value: string;
    type?: string;
    placeholder?: string;
  };
  
  let {
    label,
    error,
    helpText,
    required = false,
    value = $bindable(''),
    type = 'text',
    placeholder = ''
  }: Props = $props();
</script>

<div class="form-field">
  <label class="form-label">
    {label}
    {#if required}
      <span class="required">*</span>
    {/if}
  </label>
  
  <input
    {type}
    bind:value
    {placeholder}
    class="form-input"
    class:error={!!error}
    aria-invalid={!!error}
    aria-describedby={error ? 'error-message' : helpText ? 'help-text' : undefined}
  />
  
  {#if error}
    <span id="error-message" class="error-text">{error}</span>
  {:else if helpText}
    <span id="help-text" class="help-text">{helpText}</span>
  {/if}
</div>

<style>
  .form-field {
    margin-bottom: 1.5rem;
  }
  
  .form-label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #333;
  }
  
  .required {
    color: #dc3545;
  }
  
  .form-input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
  }
  
  .form-input:focus {
    outline: none;
    border-color: #ff3e00;
    box-shadow: 0 0 0 2px rgba(255, 62, 0, 0.1);
  }
  
  .form-input.error {
    border-color: #dc3545;
  }
  
  .error-text {
    display: block;
    color: #dc3545;
    font-size: 0.875rem;
    margin-top: 0.25rem;
  }
  
  .help-text {
    display: block;
    color: #6c757d;
    font-size: 0.875rem;
    margin-top: 0.25rem;
  }
</style>
```

## 実践例：コード例

実際のプロジェクトで使える、再利用可能なコンポーネントの実装例を見ていきましょう。

### カスタムInputコンポーネント

```typescript
// Input.svelte
import type { HTMLInputAttributes } from 'svelte/elements';

type Props = HTMLInputAttributes & {
  label?: string;
  error?: string;
  helpText?: string;
};

let { 
  label,
  error,
  helpText,
  value = '',
  type = 'text',
  required = false,
  ...restProps
}: Props = $props();
```

```svelte
<div class="form-field">
  {#if label}
    <label>
      {label}
      {#if required}
        <span class="required">*</span>
      {/if}
    </label>
  {/if}
  
  <input
    {type}
    {value}
    {...restProps}
    class:error={!!error}
    aria-invalid={!!error}
    aria-describedby={error ? 'error-message' : undefined}
  />
  
  {#if error}
    <span id="error-message" class="error-text">{error}</span>
  {:else if helpText}
    <span class="help-text">{helpText}</span>
  {/if}
</div>
```

### モーダルコンポーネント

ユーザーインタラクションを管理するモーダルダイアログの実装例です。

```typescript
// Modal.svelte
import type { Snippet } from 'svelte';

type Props = {
  open: boolean;
  title?: string;
  closable?: boolean;
  onClose?: () => void;
  header?: Snippet;
  footer?: Snippet;
  children: Snippet;
};

let { 
  open,
  title,
  closable = true,
  onClose,
  header,
  footer,
  children
}: Props = $props();

function handleBackdropClick(event: MouseEvent) {
  if (closable && event.target === event.currentTarget) {
    onClose?.();
  }
}

function handleEscape(event: KeyboardEvent) {
  if (closable && event.key === 'Escape') {
    onClose?.();
  }
}
```

### データテーブル

ジェネリック型を活用した、汎用的なデータテーブルコンポーネントの実装例です。

```typescript
// DataTable.svelte
type Column<T> = {
  key: keyof T;
  label: string;
  sortable?: boolean;
  width?: string;
  render?: (value: T[keyof T], row: T) => string;
};

type Props<T> = {
  data: T[];
  columns: Column<T>[];
  selectable?: boolean;
  onSelect?: (selected: T[]) => void;
  loading?: boolean;
};

let { 
  data,
  columns,
  selectable = false,
  onSelect,
  loading = false
}: Props<T> = $props();

let selected = $state<Set<T>>(new Set());
let sortColumn = $state<keyof T | null>(null);
let sortDirection = $state<'asc' | 'desc'>('asc');

// ソート済みデータ
let sortedData = $derived(() => {
  if (!sortColumn) return data;
  
  return [...data].sort((a, b) => {
    const aVal = a[sortColumn];
    const bVal = b[sortColumn];
    
    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });
});
```

## 型のエクスポート

コンポーネントのProps型をエクスポートして、他のファイルで再利用する方法を紹介します。

```typescript
// Button.svelte
export type ButtonProps = {
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
};

let props: ButtonProps = $props();
```

```typescript
// 他のファイルで使用
import type { ButtonProps } from './Button.svelte';

function createButtonProps(): ButtonProps {
  return {
    variant: 'primary',
    size: 'medium'
  };
}
```

## ベストプラクティス

`$props`を効果的に使用するためのベストプラクティスとアンチパターンを紹介します。

### 1. 型定義を明確に

TypeScriptを使用する場合は、必ずPropsの型を明示的に定義しましょう。

```typescript
// ❌ 型定義なし
let props = $props();

// ✅ 明確な型定義
type Props = {
  value: string;
  onChange: (value: string) => void;
};
let props: Props = $props();
```

### 2. デフォルト値の設定

オプショナルなpropsには必ずデフォルト値を設定して、安全に使用できるようにしましょう。

```typescript
// ✅ デフォルト値で安全に
let { 
  items = [],
  count = 0,
  enabled = true
}: Props = $props();
```

### 3. オプショナルプロパティの処理

オプショナルチェーン演算子を使用して、安全にオプショナルなコールバックを呼び出しましょう。

```typescript
type Props = {
  onSave?: (data: Data) => void;
};

let { onSave }: Props = $props();

function handleSave(data: Data) {
  // オプショナルチェーン演算子を使用
  onSave?.(data);
}
```

### 4. 不変性の維持

propsは読み取り専用として扱い、直接変更しないように注意しましょう。

```typescript
// ❌ propsを直接変更
let { items }: Props = $props();
items.push(newItem); // エラー

// ✅ 新しい配列を作成
let localItems = $state([...items]);
localItems.push(newItem);
```

## 次のステップ

`$props`で単方向のデータ受け渡しをマスターしたら、次は双方向バインディングを学びましょう。
[$bindable - 双方向バインディング](/svelte/runes/bindable/)では、子コンポーネントから親の状態を更新する方法を解説します。

