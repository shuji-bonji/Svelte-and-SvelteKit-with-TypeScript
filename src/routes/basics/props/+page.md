---
title: $propsルーン
description: コンポーネントのプロパティ定義と型安全な受け渡し
---

## $propsとは

`$props`は、親コンポーネントからプロパティを受け取るためのルーンです。Svelte 5では、従来の`export let`の代わりに`$props`を使用します。

## 基本的な使い方

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

残りのプロパティをまとめて受け取ることができます。

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

### HTMLAttributes との組み合わせ

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

## 実践例

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

コンポーネントのPropsの型を他のファイルで使用できるようにエクスポートします。

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

### 1. 型定義を明確に

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

```typescript
// ✅ デフォルト値で安全に
let { 
  items = [],
  count = 0,
  enabled = true
}: Props = $props();
```

### 3. オプショナルプロパティの処理

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

```typescript
// ❌ propsを直接変更
let { items }: Props = $props();
items.push(newItem); // エラー

// ✅ 新しい配列を作成
let localItems = $state([...items]);
localItems.push(newItem);
```

## 次のステップ

プロパティの受け渡しを理解したら、[$bindable - 双方向バインディング](/basics/bindable/)で双方向データバインディングを学びましょう。