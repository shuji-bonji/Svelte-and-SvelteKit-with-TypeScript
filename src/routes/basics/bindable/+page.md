---
title: $bindableルーン
description: 親子コンポーネント間の双方向データバインディング
---

## $bindableとは

`$bindable`は、親コンポーネントから受け取ったプロパティを子コンポーネント内で変更可能にするルーンです。双方向データバインディングを実現します。

## 基本的な使い方

### 子コンポーネント

```typescript
// Input.svelte
type Props = {
  value: $bindable<string>;
};

let { value = $bindable('') }: Props = $props();

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement;
  value = target.value; // 親コンポーネントの値も更新される
}
```

### 親コンポーネント

```svelte
<script lang="ts">
  import Input from './Input.svelte';
  
  let name = $state('');
</script>

<!-- bind:value で双方向バインディング -->
<Input bind:value={name} />
<p>入力された名前: {name}</p>
```

## オプショナルなバインディング

```typescript
type Props = {
  value?: $bindable<string>;
  checked?: $bindable<boolean>;
};

let { 
  value = $bindable('デフォルト値'),
  checked = $bindable(false)
}: Props = $props();
```

## 複数の値のバインディング

```typescript
// RangeSlider.svelte
type Props = {
  min: $bindable<number>;
  max: $bindable<number>;
  step?: number;
};

let { 
  min = $bindable(0),
  max = $bindable(100),
  step = 1
}: Props = $props();

function handleMinChange(event: Event) {
  const target = event.target as HTMLInputElement;
  min = Number(target.value);
  if (min > max) max = min;
}

function handleMaxChange(event: Event) {
  const target = event.target as HTMLInputElement;
  max = Number(target.value);
  if (max < min) min = max;
}
```

## オブジェクトと配列のバインディング

### オブジェクト

```typescript
// UserForm.svelte
type User = {
  name: string;
  email: string;
  age: number;
};

type Props = {
  user: $bindable<User>;
};

let { user = $bindable<User>({
  name: '',
  email: '',
  age: 0
}) }: Props = $props();

// オブジェクトのプロパティを直接更新
function updateName(event: Event) {
  const target = event.target as HTMLInputElement;
  user.name = target.value;
}
```

### 配列

```typescript
// TodoList.svelte
type Todo = {
  id: string;
  text: string;
  done: boolean;
};

type Props = {
  todos: $bindable<Todo[]>;
};

let { todos = $bindable<Todo[]>([]) }: Props = $props();

function addTodo(text: string) {
  todos = [...todos, {
    id: crypto.randomUUID(),
    text,
    done: false
  }];
}

function toggleTodo(id: string) {
  todos = todos.map(todo =>
    todo.id === id ? { ...todo, done: !todo.done } : todo
  );
}

function removeTodo(id: string) {
  todos = todos.filter(todo => todo.id !== id);
}
```

## 実践例

### カスタムチェックボックス

```typescript
// Checkbox.svelte
type Props = {
  checked: $bindable<boolean>;
  label?: string;
  disabled?: boolean;
};

let { 
  checked = $bindable(false),
  label,
  disabled = false
}: Props = $props();

function toggle() {
  if (!disabled) {
    checked = !checked;
  }
}
```

```svelte
<label class="checkbox" class:disabled>
  <input
    type="checkbox"
    {checked}
    {disabled}
    on:change={toggle}
  />
  <span class="checkmark" class:checked></span>
  {#if label}
    <span class="label">{label}</span>
  {/if}
</label>
```

### カラーピッカー

```typescript
// ColorPicker.svelte
type RGB = {
  r: number;
  g: number;
  b: number;
};

type Props = {
  color: $bindable<string>;
  format?: 'hex' | 'rgb';
};

let { 
  color = $bindable('#000000'),
  format = 'hex'
}: Props = $props();

let rgb = $state<RGB>({ r: 0, g: 0, b: 0 });

// HEXからRGBへ変換
$effect(() => {
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    rgb = {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16)
    };
  }
});

// RGBからHEXへ変換
function updateColor() {
  if (format === 'hex') {
    const toHex = (n: number) => n.toString(16).padStart(2, '0');
    color = `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
  } else {
    color = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  }
}
```

### モーダルの開閉状態

```typescript
// Modal.svelte
type Props = {
  open: $bindable<boolean>;
  title?: string;
  children: Snippet;
};

let { 
  open = $bindable(false),
  title,
  children
}: Props = $props();

function close() {
  open = false;
}

// ESCキーで閉じる
function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && open) {
    close();
  }
}
```

```svelte
<!-- 親コンポーネント -->
<script lang="ts">
  import Modal from './Modal.svelte';
  
  let showModal = $state(false);
</script>

<button onclick={() => showModal = true}>
  モーダルを開く
</button>

<Modal bind:open={showModal} title="確認">
  <p>本当に削除しますか？</p>
  <button onclick={() => showModal = false}>キャンセル</button>
  <button onclick={handleDelete}>削除</button>
</Modal>
```

### フォームバリデーション付き入力

```typescript
// ValidatedInput.svelte
type Props = {
  value: $bindable<string>;
  error: $bindable<string | null>;
  validator?: (value: string) => string | null;
  label?: string;
  required?: boolean;
};

let { 
  value = $bindable(''),
  error = $bindable<string | null>(null),
  validator,
  label,
  required = false
}: Props = $props();

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement;
  value = target.value;
  
  // バリデーション実行
  if (validator) {
    error = validator(value);
  } else if (required && !value) {
    error = '必須項目です';
  } else {
    error = null;
  }
}

function handleBlur() {
  // フォーカスが外れた時にもバリデーション
  if (validator) {
    error = validator(value);
  }
}
```

## バインディングの制御

### 条件付きバインディング

```typescript
type Props = {
  value: $bindable<string>;
  readonly?: boolean;
};

let { 
  value = $bindable(''),
  readonly = false
}: Props = $props();

let localValue = $state('');

// readonlyの場合はローカル値を使用
$effect(() => {
  if (readonly) {
    localValue = value;
  }
});

function handleChange(newValue: string) {
  if (!readonly) {
    value = newValue;
  } else {
    localValue = newValue;
  }
}
```

### デバウンス付きバインディング

```typescript
type Props = {
  value: $bindable<string>;
  debounce?: number;
};

let { 
  value = $bindable(''),
  debounce = 300
}: Props = $props();

let localValue = $state(value);
let timeoutId: number;

$effect(() => {
  // 親からの値の変更を反映
  localValue = value;
});

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement;
  localValue = target.value;
  
  // デバウンス処理
  clearTimeout(timeoutId);
  timeoutId = setTimeout(() => {
    value = localValue;
  }, debounce);
}
```

## ベストプラクティス

### 1. 必要な場合のみ使用

```typescript
// ❌ 読み取り専用なら$bindableは不要
type Props = {
  label: $bindable<string>;
};

// ✅ 読み取り専用
type Props = {
  label: string;
};

// ✅ 双方向バインディングが必要な場合のみ
type Props = {
  value: $bindable<string>;
};
```

### 2. デフォルト値の設定

```typescript
// ✅ 適切なデフォルト値
let { 
  text = $bindable(''),
  number = $bindable(0),
  items = $bindable<Item[]>([])
}: Props = $props();
```

### 3. 型の一貫性

```typescript
// ✅ 型を明確に定義
type Props = {
  selected: $bindable<string | null>;
};

let { selected = $bindable<string | null>(null) }: Props = $props();
```

### 4. イミュータブルな更新

```typescript
// ❌ 配列を直接変更
todos.push(newTodo);

// ✅ 新しい配列を作成
todos = [...todos, newTodo];
```

## トラブルシューティング

### バインディングが機能しない

```typescript
// ❌ $bindableを忘れている
type Props = {
  value: string; // バインディングできない
};

// ✅ $bindableを使用
type Props = {
  value: $bindable<string>;
};
```

### 無限ループ

```typescript
// ❌ $effect内で直接値を変更
$effect(() => {
  value = value.trim(); // 無限ループ
});

// ✅ 条件を付けて制御
$effect(() => {
  const trimmed = value.trim();
  if (trimmed !== value) {
    value = trimmed;
  }
});
```

## まとめ

`$bindable`を使うことで、親子コンポーネント間で簡単に双方向データバインディングを実現できます。適切に使用することで、フォーム処理やインタラクティブなUIの実装が容易になります。

次は[実践編](/advanced/)で、より高度なパターンを学びましょう。