---
title: $bindableルーン
description: 親子コンポーネント間の双方向データバインディング
---

`$bindable`は、親コンポーネントから受け取ったプロパティを子コンポーネント内で変更可能にするルーンです。従来の`bind:`ディレクティブと組み合わせることで、親子間の双方向データバインディングを実現します。

:::tip[React/Vue経験者向け]
- Reactの`useState`のセッター関数を子に渡すパターンに相当
- Vueの`v-model`による双方向バインディングに相当
- ただし、Svelteの`$bindable`はより直感的で型安全
:::

## $bindableとは

`$bindable`は、Svelte 5で導入された新しいルーンで、以下の特徴があります。

- **双方向バインディング**: 子コンポーネントから親の状態を直接更新可能
- **型安全**: TypeScriptとの完全な統合で型チェックが効く
- **明示的**: どのプロパティが変更可能かを明確に宣言
- **オプショナル**: 必須またはオプショナルなバインディングを選択可能

### 従来の方法との違い

```typescript
// ❌ Svelte 4以前（export let）
export let value: string;
// 親の値を変更するにはイベントディスパッチが必要

// ✅ Svelte 5（$bindable）
let { value = $bindable('') }: Props = $props();
// 直接値を変更すると親も更新される
```

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

以下の実践的な例を通じて、`$bindable`の様々な使用パターンを理解しましょう。

### 実際の$bindableコンポーネント

実際に`$bindable`を使用したコンポーネントの実装例を見てみましょう。

<script lang="ts">
  import BindableDemo from '$lib/components/BindableDemo.svelte';
  import BindableComponentsDemo from '$lib/components/BindableComponentsDemo.svelte';
</script>

<BindableDemo />

#### フォーム入力デモ - 実装コード

**BindableDemo.svelte** - フォームデモコンポーネント全体の実装
```svelte
<script lang="ts">
  import BindableInput from './BindableInput.svelte';
  import BindableCheckbox from './BindableCheckbox.svelte';
  
  // フォームの状態
  let username = $state('');
  let email = $state('');
  let password = $state('');
  
  // チェックボックスの状態
  let acceptTerms = $state(false);
  let receiveNewsletter = $state(false);
  let enableNotifications = $state(false);
  
  // バリデーション
  let usernameError = $derived(
    username && username.length < 3 ? 'ユーザー名は3文字以上必要です' : ''
  );
  
  let emailError = $derived(
    email && !email.includes('@') ? '有効なメールアドレスを入力してください' : ''
  );
  
  let passwordError = $derived(
    password && password.length < 8 ? 'パスワードは8文字以上必要です' : ''
  );
  
  // フォームが有効かどうか
  let isValid = $derived(
    username.length >= 3 && 
    email.includes('@') && 
    password.length >= 8 &&
    acceptTerms
  );
  
  // フォーム送信
  function handleSubmit() {
    if (isValid) {
      alert(`送信完了！\nユーザー名: ${username}\nメール: ${email}\nニュースレター: ${receiveNewsletter ? 'はい' : 'いいえ'}\n通知: ${enableNotifications ? 'はい' : 'いいえ'}`);
    }
  }
  
  // リセット
  function handleReset() {
    username = '';
    email = '';
    password = '';
    acceptTerms = false;
    receiveNewsletter = false;
    enableNotifications = false;
  }
</script>

<div class="demo-container">
  <h3>$bindableコンポーネントデモ</h3>
  
  <form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
    <section class="form-section">
      <h4>基本情報</h4>
      
      <BindableInput 
        bind:value={username}
        label="ユーザー名"
        placeholder="3文字以上で入力"
        error={usernameError}
      />
      
      <BindableInput 
        bind:value={email}
        label="メールアドレス"
        type="email"
        placeholder="email@example.com"
        error={emailError}
      />
      
      <BindableInput 
        bind:value={password}
        label="パスワード"
        type="password"
        placeholder="8文字以上で入力"
        error={passwordError}
      />
    </section>
    
    <section class="form-section">
      <h4>オプション設定</h4>
      
      <div class="checkbox-group">
        <BindableCheckbox 
          bind:checked={acceptTerms}
          label="利用規約に同意する（必須）"
        />
        
        <BindableCheckbox 
          bind:checked={receiveNewsletter}
          label="ニュースレターを受け取る"
        />
        
        <BindableCheckbox 
          bind:checked={enableNotifications}
          label="通知を有効にする"
        />
      </div>
    </section>
    
    <div class="form-actions">
      <button 
        type="submit"
        disabled={!isValid}
        class="submit-btn"
      >
        送信
      </button>
      
      <button 
        type="button"
        onclick={handleReset}
        class="reset-btn"
      >
        リセット
      </button>
    </div>
  </form>
  
  <div class="status-panel">
    <h4>現在の状態</h4>
    <ul>
      <li>ユーザー名: <strong>{username || '(未入力)'}</strong></li>
      <li>メール: <strong>{email || '(未入力)'}</strong></li>
      <li>パスワード: <strong>{password ? '●'.repeat(password.length) : '(未入力)'}</strong></li>
      <li>利用規約: <strong>{acceptTerms ? '✅ 同意' : '❌ 未同意'}</strong></li>
      <li>ニュースレター: <strong>{receiveNewsletter ? '✅ 受信する' : '❌ 受信しない'}</strong></li>
      <li>通知: <strong>{enableNotifications ? '✅ 有効' : '❌ 無効'}</strong></li>
    </ul>
  </div>
</div>

<style>
  /* スタイルはコンポーネントファイルを参照 */
</style>
```

**BindableInput.svelte** - 双方向バインディング可能な入力フィールドコンポーネント
```svelte
<script lang="ts">
  type Props = {
    value: $bindable<string>;
    label?: string;
    placeholder?: string;
    type?: 'text' | 'email' | 'password';
    error?: string;
  };

  let { 
    value = $bindable(''),
    label,
    placeholder = '',
    type = 'text',
    error
  }: Props = $props();
</script>

<div class="input-wrapper">
  {#if label}
    <label class="input-label">{label}</label>
  {/if}
  <input 
    bind:value={value}
    {type}
    {placeholder}
    class="input-field"
    class:error={!!error}
  />
  {#if error}
    <span class="error-message">{error}</span>
  {/if}
</div>

<style>
  .input-wrapper {
    margin-bottom: 1rem;
  }

  .input-label {
    display: block;
    margin-bottom: 0.25rem;
    font-weight: 500;
    color: var(--sp-color-text-1);
  }

  .input-field {
    width: 100%;
    padding: 0.625rem 0.875rem;
    border: 2px solid #cbd5e1;
    border-radius: 6px;
    font-size: 1rem;
    transition: all 0.2s;
    background: white;
    color: #1e293b;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }

  .input-field:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12), 0 1px 2px rgba(0, 0, 0, 0.05);
    transform: translateY(-1px);
  }

  .input-field.error {
    border-color: #ef4444;
  }

  .error-message {
    display: block;
    margin-top: 0.25rem;
    color: #ef4444;
    font-size: 0.875rem;
  }
</style>
```

**BindableCheckbox.svelte** - カスタマイズ可能なチェックボックスコンポーネント
```svelte
<script lang="ts">
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
</script>

<label class="checkbox-wrapper" class:disabled>
  <input 
    type="checkbox"
    bind:checked={checked}
    {disabled}
    class="checkbox-input"
  />
  <span class="checkbox-mark"></span>
  {#if label}
    <span class="checkbox-label">{label}</span>
  {/if}
</label>

<style>
  .checkbox-wrapper {
    display: inline-flex;
    align-items: center;
    cursor: pointer;
    user-select: none;
    position: relative;
    padding: 0.5rem 0.5rem 0.5rem 32px;
    min-height: 32px;
    background: white;
    border-radius: 6px;
    border: 1px solid transparent;
    transition: all 0.2s;
  }
  
  .checkbox-wrapper:hover:not(.disabled) {
    background: #f8fafc;
    border-color: #e2e8f0;
  }

  .checkbox-input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
  }

  .checkbox-mark {
    position: absolute;
    left: 8px;
    top: 50%;
    transform: translateY(-50%);
    height: 20px;
    width: 20px;
    background-color: white;
    border: 2px solid #94a3b8;
    border-radius: 4px;
    transition: all 0.2s;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }

  .checkbox-input:checked ~ .checkbox-mark {
    background-color: #22c55e;
    border-color: #22c55e;
  }

  .checkbox-mark:after {
    content: "";
    position: absolute;
    display: none;
    left: 6px;
    top: 2px;
    width: 5px;
    height: 10px;
    border: solid white;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
  }

  .checkbox-input:checked ~ .checkbox-mark:after {
    display: block;
  }

  .checkbox-label {
    margin-left: 8px;
    color: #1e293b;
    font-weight: 500;
  }
</style>
```

:::tip[ポイント]
`$bindable`を使用することで、子コンポーネント内で値を変更しても、親コンポーネントの状態が自動的に更新されます。これにより、イベントディスパッチなどのボイラープレートコードが不要になります。
:::

### 統合コンポーネントデモ

各種`$bindable`コンポーネントの動作を確認できます。

<BindableComponentsDemo />

#### 統合デモの実装コード

**BindableComponentsDemo.svelte** - 統合デモコンポーネント全体の実装
```svelte
<script lang="ts">
  import BindableSlider from './BindableSlider.svelte';
  import BindableCounter from './BindableCounter.svelte';
  import BindableCheckbox from './BindableCheckbox.svelte';
  
  // スライダーの状態
  let volume = $state(50);
  let brightness = $state(75);
  let contrast = $state(100);
  
  // カウンターの状態
  let count1 = $state(0);
  let count2 = $state(0);
  let count3 = $state(0);
  
  // チェックボックスの状態
  let selectAll = $state(false);
  let option1 = $state(false);
  let option2 = $state(false);
  let option3 = $state(false);
  
  // 合計値（カウンター）
  let total = $derived(count1 + count2 + count3);
  
  // 全選択の処理
  $effect(() => {
    if (selectAll) {
      option1 = true;
      option2 = true;
      option3 = true;
    }
  });
  
  // 個別チェックボックスの変更を監視
  $effect(() => {
    if (!option1 || !option2 || !option3) {
      selectAll = false;
    }
  });
  
  // リセット機能
  function resetSliders() {
    volume = 50;
    brightness = 75;
    contrast = 100;
  }
  
  function resetCounters() {
    count1 = 0;
    count2 = 0;
    count3 = 0;
  }
  
  function resetCheckboxes() {
    selectAll = false;
    option1 = false;
    option2 = false;
    option3 = false;
  }
</script>

<div class="demo-container">
  <h3>$bindableコンポーネント実装例</h3>
  
  <!-- スライダーセクション -->
  <section class="demo-section">
    <h4>スライダーコンポーネント</h4>
    
    <BindableSlider 
      bind:value={volume}
      label="音量"
      min={0}
      max={100}
      unit="%"
    />
    
    <BindableSlider 
      bind:value={brightness}
      label="明るさ"
      min={0}
      max={100}
      unit="%"
    />
    
    <BindableSlider 
      bind:value={contrast}
      label="コントラスト"
      min={0}
      max={200}
      unit="%"
    />
    
    <div class="preview" style="filter: brightness({brightness}%) contrast({contrast}%);">
      <div class="preview-box">
        <div class="preview-text">プレビュー</div>
        <div class="volume-indicator" style="width: {volume}%;"></div>
      </div>
    </div>
    
    <button onclick={resetSliders} class="reset-btn">
      デフォルトに戻す
    </button>
  </section>
  
  <!-- カウンターセクション -->
  <section class="demo-section">
    <h4>カウンターコンポーネント</h4>
    
    <div class="counter-grid">
      <BindableCounter 
        bind:value={count1}
        label="カウンター 1"
        min={0}
        max={10}
      />
      
      <BindableCounter 
        bind:value={count2}
        label="カウンター 2"
        min={0}
        max={10}
      />
      
      <BindableCounter 
        bind:value={count3}
        label="カウンター 3"
        min={0}
        max={10}
      />
    </div>
    
    <div class="total-section">
      <div class="total-label">合計値:</div>
      <div class="total-value">{total}</div>
    </div>
    
    <button onclick={resetCounters} class="reset-btn">
      すべてリセット
    </button>
  </section>
  
  <!-- チェックボックスセクション -->
  <section class="demo-section">
    <h4>チェックボックスコンポーネント</h4>
    
    <div class="checkbox-group">
      <BindableCheckbox 
        bind:checked={selectAll}
        label="すべて選択"
      />
      
      <hr />
      
      <BindableCheckbox 
        bind:checked={option1}
        label="オプション 1"
      />
      
      <BindableCheckbox 
        bind:checked={option2}
        label="オプション 2"
      />
      
      <BindableCheckbox 
        bind:checked={option3}
        label="オプション 3"
      />
    </div>
    
    <div class="status">
      <h5>選択状態:</h5>
      <ul>
        <li>オプション 1: {option1 ? '✅ 選択' : '❌ 未選択'}</li>
        <li>オプション 2: {option2 ? '✅ 選択' : '❌ 未選択'}</li>
        <li>オプション 3: {option3 ? '✅ 選択' : '❌ 未選択'}</li>
      </ul>
    </div>
    
    <button onclick={resetCheckboxes} class="reset-btn">
      選択をクリア
    </button>
  </section>
</div>

<style>
  /* スタイルはコンポーネントファイルを参照 */
</style>
```

**BindableSlider.svelte** - レンジスライダーコンポーネント
```svelte
<script lang="ts">
  type Props = {
    value: $bindable<number>;
    label?: string;
    min?: number;
    max?: number;
    step?: number;
    unit?: string;
  };

  let { 
    value = $bindable(50),
    label,
    min = 0,
    max = 100,
    step = 1,
    unit = ''
  }: Props = $props();
  
  // スライダーの進捗を計算
  let progress = $derived(((value - min) / (max - min)) * 100);
</script>

<div class="slider-wrapper">
  {#if label}
    <label class="slider-label">
      {label}: <span class="slider-value">{value}{unit}</span>
    </label>
  {/if}
  <div class="slider-container">
    <input 
      type="range"
      bind:value={value}
      {min}
      {max}
      {step}
      class="slider"
    />
    <div class="slider-track" style="width: {progress}%;"></div>
  </div>
  <div class="slider-marks">
    <span>{min}{unit}</span>
    <span>{Math.round((min + max) / 2)}{unit}</span>
    <span>{max}{unit}</span>
  </div>
</div>
```

**BindableCounter.svelte** - カウンターコンポーネント
```svelte
<script lang="ts">
  type Props = {
    value: $bindable<number>;
    label?: string;
    min?: number;
    max?: number;
    step?: number;
  };

  let { 
    value = $bindable(0),
    label,
    min = Number.MIN_SAFE_INTEGER,
    max = Number.MAX_SAFE_INTEGER,
    step = 1
  }: Props = $props();
  
  // ボタンの有効/無効状態
  let canIncrement = $derived(value + step <= max);
  let canDecrement = $derived(value - step >= min);
  
  function increment() {
    if (canIncrement) {
      value += step;
    }
  }
  
  function decrement() {
    if (canDecrement) {
      value -= step;
    }
  }
</script>

<div class="counter-wrapper">
  {#if label}
    <label class="counter-label">{label}</label>
  {/if}
  <div class="counter-controls">
    <button 
      onclick={decrement}
      disabled={!canDecrement}
      class="counter-btn minus"
      aria-label="減少"
    >
      −
    </button>
    <div class="counter-value">{value}</div>
    <button 
      onclick={increment}
      disabled={!canIncrement}
      class="counter-btn plus"
      aria-label="増加"
    >
      +
    </button>
  </div>
</div>
```

----

### 入力フィールドの基本実装

以下は`$bindable`を使った入力フィールドの基本的な実装例です。

```svelte
<script lang="ts">
  // 双方向バインディングのデモ
  let username = $state('');
  let email = $state('');
  let password = $state('');
  
  // 入力値の検証
  let usernameError = $derived(
    username && username.length < 3 ? 'ユーザー名は3文字以上必要です' : ''
  );
  
  let emailError = $derived(
    email && !email.includes('@') ? '有効なメールアドレスを入力してください' : ''
  );
  
  let passwordError = $derived(
    password && password.length < 8 ? 'パスワードは8文字以上必要です' : ''
  );
  
  // フォームが有効かどうか
  let isValid = $derived(
    username.length >= 3 && 
    email.includes('@') && 
    password.length >= 8
  );
</script>

<div class="demo-container">
  <h4>フォーム入力の双方向バインディング</h4>
  
  <div class="input-group">
    <label>
      ユーザー名:
      <input 
        bind:value={username} 
        placeholder="ユーザー名を入力"
        class="custom-input"
        class:error={usernameError}
      />
    </label>
    {#if usernameError}
      <span class="error-message">{usernameError}</span>
    {/if}
  </div>
  
  <div class="input-group">
    <label>
      メール:
      <input 
        bind:value={email} 
        placeholder="メールアドレスを入力"
        type="email"
        class="custom-input"
        class:error={emailError}
      />
    </label>
    {#if emailError}
      <span class="error-message">{emailError}</span>
    {/if}
  </div>
  
  <div class="input-group">
    <label>
      パスワード:
      <input 
        bind:value={password} 
        placeholder="パスワードを入力"
        type="password"
        class="custom-input"
        class:error={passwordError}
      />
    </label>
    {#if passwordError}
      <span class="error-message">{passwordError}</span>
    {/if}
  </div>
  
  <button 
    onclick={() => { username = ''; email = ''; password = ''; }}
    class="clear-button"
    disabled={!username && !email && !password}
  >
    クリア
  </button>
  
  <button 
    class="submit-button"
    disabled={!isValid}
  >
    送信 {isValid ? '✓' : ''}
  </button>
</div>

<style>
  .demo-container {
    padding: 1.5rem;
    background: var(--sp-color-gray-100);
    border-radius: 8px;
  }
  
  .input-group {
    margin-bottom: 1rem;
  }
  
  .custom-input {
    display: block;
    width: 100%;
    padding: 0.5rem;
    margin-top: 0.25rem;
    border: 2px solid var(--sp-color-gray-300);
    border-radius: 4px;
    font-size: 1rem;
    transition: border-color 0.2s;
  }
  
  .custom-input:focus {
    outline: none;
    border-color: var(--sp-color-primary);
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
  }
  
  .custom-input.error {
    border-color: var(--sp-color-danger);
  }
  
  .error-message {
    display: block;
    color: var(--sp-color-danger);
    font-size: 0.875rem;
    margin-top: 0.25rem;
  }
  
  .clear-button, .submit-button {
    padding: 0.5rem 1rem;
    margin-right: 0.5rem;
    background: var(--sp-color-primary);
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: opacity 0.2s;
  }
  
  .submit-button {
    background: var(--sp-color-success);
  }
  
  .clear-button:hover:not(:disabled), 
  .submit-button:hover:not(:disabled) {
    opacity: 0.9;
  }
  
  .clear-button:disabled, 
  .submit-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
```

### チェックボックスの実装例

複数のチェックボックスを連動させる実装例です。

```svelte
<script lang="ts">
  // チェックボックスの状態管理
  let acceptTerms = $state(false);
  let receiveNewsletter = $state(false);
  let enableNotifications = $state(false);
  
  // 全選択の状態
  let selectAll = $state(false);
  
  // 全選択の処理
  $effect(() => {
    if (selectAll) {
      acceptTerms = true;
      receiveNewsletter = true;
      enableNotifications = true;
    }
  });
  
  // 個別チェックボックスの変更を監視
  $effect(() => {
    if (!acceptTerms || !receiveNewsletter || !enableNotifications) {
      selectAll = false;
    }
  });
</script>

<div class="checkbox-demo">
  <h4>設定オプション</h4>
  
  <div class="checkbox-group">
    <label class="checkbox-label">
      <input 
        type="checkbox" 
        bind:checked={selectAll}
        class="checkbox-input"
      />
      <span class="checkmark"></span>
      <span class="label-text">すべて選択</span>
    </label>
  </div>
  
  <hr />
  
  <div class="checkbox-group">
    <label class="checkbox-label">
      <input 
        type="checkbox" 
        bind:checked={acceptTerms}
        class="checkbox-input"
      />
      <span class="checkmark"></span>
      <span class="label-text">利用規約に同意する</span>
    </label>
    
    <label class="checkbox-label">
      <input 
        type="checkbox" 
        bind:checked={receiveNewsletter}
        class="checkbox-input"
      />
      <span class="checkmark"></span>
      <span class="label-text">ニュースレターを受け取る</span>
    </label>
    
    <label class="checkbox-label">
      <input 
        type="checkbox" 
        bind:checked={enableNotifications}
        class="checkbox-input"
      />
      <span class="checkmark"></span>
      <span class="label-text">通知を有効にする</span>
    </label>
  </div>
  
  <div class="status">
    <h5>選択状態:</h5>
    <ul>
      <li>利用規約: {acceptTerms ? '✅ 同意' : '❌ 未同意'}</li>
      <li>ニュースレター: {receiveNewsletter ? '✅ 受信する' : '❌ 受信しない'}</li>
      <li>通知: {enableNotifications ? '✅ 有効' : '❌ 無効'}</li>
    </ul>
  </div>
</div>

<style>
  .checkbox-demo {
    padding: 1.5rem;
    background: var(--sp-color-gray-100);
    border-radius: 8px;
  }
  
  .checkbox-group {
    margin: 1rem 0;
  }
  
  .checkbox-label {
    display: flex;
    align-items: center;
    margin-bottom: 0.75rem;
    cursor: pointer;
    user-select: none;
  }
  
  .checkbox-input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
  }
  
  .checkmark {
    position: relative;
    height: 20px;
    width: 20px;
    background-color: white;
    border: 2px solid var(--sp-color-gray-400);
    border-radius: 4px;
    margin-right: 0.5rem;
    transition: all 0.2s;
  }
  
  .checkbox-input:checked ~ .checkmark {
    background-color: #22c55e;
    border-color: #22c55e;
  }
  
  .checkmark:after {
    content: "";
    position: absolute;
    display: none;
    left: 6px;
    top: 2px;
    width: 5px;
    height: 10px;
    border: solid white;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
  }
  
  .checkbox-input:checked ~ .checkmark:after {
    display: block;
  }
  
  .label-text {
    font-size: 0.95rem;
  }
  
  hr {
    margin: 1rem 0;
    border: none;
    border-top: 1px solid var(--sp-color-gray-300);
  }
  
  .status {
    margin-top: 1.5rem;
    padding: 1rem;
    background: white;
    border-radius: 4px;
  }
  
  .status h5 {
    margin: 0 0 0.5rem 0;
    color: var(--sp-color-gray-700);
  }
  
  .status ul {
    margin: 0;
    padding-left: 1.5rem;
  }
  
  .status li {
    margin: 0.25rem 0;
    color: var(--sp-color-gray-600);
    font-size: 0.9rem;
  }
</style>
```

### スライダーコンポーネントの実装

カスタムスライダーの実装例です。

```svelte
<script lang="ts">
  // 音量コントロール
  let volume = $state(50);
  let brightness = $state(75);
  let contrast = $state(100);
  
  // リセット機能
  function resetValues() {
    volume = 50;
    brightness = 75;
    contrast = 100;
  }
</script>

<div class="slider-demo">
  <h4>設定コントロール</h4>
  
  <div class="slider-group">
    <label class="slider-label">
      <span class="label-name">音量: {volume}%</span>
      <div class="slider-container">
        <input 
          type="range" 
          bind:value={volume}
          min="0" 
          max="100" 
          class="slider"
        />
        <div class="slider-track"></div>
      </div>
      <div class="slider-marks">
        <span>0</span>
        <span>50</span>
        <span>100</span>
      </div>
    </label>
  </div>
  
  <div class="slider-group">
    <label class="slider-label">
      <span class="label-name">明るさ: {brightness}%</span>
      <div class="slider-container">
        <input 
          type="range" 
          bind:value={brightness}
          min="0" 
          max="100" 
          class="slider"
        />
        <div class="slider-track"></div>
      </div>
      <div class="slider-marks">
        <span>0</span>
        <span>50</span>
        <span>100</span>
      </div>
    </label>
  </div>
  
  <div class="slider-group">
    <label class="slider-label">
      <span class="label-name">コントラスト: {contrast}%</span>
      <div class="slider-container">
        <input 
          type="range" 
          bind:value={contrast}
          min="0" 
          max="200" 
          class="slider"
        />
        <div class="slider-track"></div>
      </div>
      <div class="slider-marks">
        <span>0</span>
        <span>100</span>
        <span>200</span>
      </div>
    </label>
  </div>
  
  <div class="preview" style="filter: brightness({brightness}%) contrast({contrast}%);">
    <div class="preview-box">
      <div class="preview-text">プレビュー</div>
      <div class="volume-indicator" style="width: {volume}%;"></div>
    </div>
  </div>
  
  <button onclick={resetValues} class="reset-button">
    デフォルトに戻す
  </button>
</div>

<style>
  .slider-demo {
    padding: 1.5rem;
    background: var(--sp-color-gray-100);
    border-radius: 8px;
  }
  
  .slider-group {
    margin-bottom: 1.5rem;
  }
  
  .slider-label {
    display: block;
  }
  
  .label-name {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: var(--sp-color-gray-700);
  }
  
  .slider-container {
    position: relative;
    width: 100%;
    height: 24px;
    display: flex;
    align-items: center;
  }
  
  .slider-track {
    position: absolute;
    width: 100%;
    height: 6px;
    background: var(--sp-color-gray-300);
    border-radius: 3px;
    pointer-events: none;
  }
  
  .slider {
    position: relative;
    width: 100%;
    height: 6px;
    border-radius: 3px;
    background: transparent;
    outline: none;
    -webkit-appearance: none;
    appearance: none;
    z-index: 1;
  }
  
  .slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: white;
    border: 3px solid var(--sp-color-primary);
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    transition: transform 0.2s;
  }
  
  .slider::-webkit-slider-thumb:hover {
    transform: scale(1.1);
  }
  
  .slider::-moz-range-thumb {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: white;
    border: 3px solid var(--sp-color-primary);
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    transition: transform 0.2s;
  }
  
  .slider::-moz-range-thumb:hover {
    transform: scale(1.1);
  }
  
  .slider-marks {
    display: flex;
    justify-content: space-between;
    margin-top: 0.5rem;
    padding: 0 2px;
    font-size: 0.75rem;
    color: var(--sp-color-gray-600);
    font-weight: 500;
  }
  
  .slider-marks span {
    position: relative;
  }
  
  .slider-marks span::before {
    content: '';
    position: absolute;
    top: -28px;
    left: 50%;
    transform: translateX(-50%);
    width: 1px;
    height: 10px;
    background: var(--sp-color-gray-400);
  }
  
  .preview {
    margin: 1.5rem 0;
    padding: 1rem;
    background: white;
    border-radius: 4px;
    transition: filter 0.3s;
  }
  
  .preview-box {
    position: relative;
    padding: 2rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 4px;
    text-align: center;
  }
  
  .preview-text {
    color: white;
    font-size: 1.25rem;
    font-weight: bold;
    position: relative;
    z-index: 2;
  }
  
  .volume-indicator {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 4px;
    background: rgba(255, 255, 255, 0.8);
    border-radius: 0 0 0 4px;
    transition: width 0.3s;
  }
  
  .reset-button {
    width: 100%;
    padding: 0.75rem;
    background: var(--sp-color-primary);
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    transition: opacity 0.2s;
  }
  
  .reset-button:hover {
    opacity: 0.9;
  }
</style>
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

### カウンターコンポーネントの実装

複数のカウンターを管理する実装例です。

```svelte
<script lang="ts">
  // 複数のカウンター
  let count1 = $state(0);
  let count2 = $state(0);
  let count3 = $state(0);
  
  // 合計値
  let total = $derived(count1 + count2 + count3);
  
  // カウンター操作関数
  function increment(counter: 'count1' | 'count2' | 'count3') {
    if (counter === 'count1') count1++;
    else if (counter === 'count2') count2++;
    else if (counter === 'count3') count3++;
  }
  
  function decrement(counter: 'count1' | 'count2' | 'count3') {
    if (counter === 'count1' && count1 > 0) count1--;
    else if (counter === 'count2' && count2 > 0) count2--;
    else if (counter === 'count3' && count3 > 0) count3--;
  }
  
  function resetAll() {
    count1 = 0;
    count2 = 0;
    count3 = 0;
  }
</script>

<div class="counter-demo">
  <h4>カウンター管理</h4>
  
  <div class="counter-grid">
    <div class="counter-card">
      <h5>カウンター 1</h5>
      <div class="counter-display">{count1}</div>
      <div class="counter-controls">
        <button 
          onclick={() => decrement('count1')}
          disabled={count1 === 0}
          class="counter-btn minus"
        >
          −
        </button>
        <button 
          onclick={() => increment('count1')}
          class="counter-btn plus"
        >
          +
        </button>
      </div>
    </div>
    
    <div class="counter-card">
      <h5>カウンター 2</h5>
      <div class="counter-display">{count2}</div>
      <div class="counter-controls">
        <button 
          onclick={() => decrement('count2')}
          disabled={count2 === 0}
          class="counter-btn minus"
        >
          −
        </button>
        <button 
          onclick={() => increment('count2')}
          class="counter-btn plus"
        >
          +
        </button>
      </div>
    </div>
    
    <div class="counter-card">
      <h5>カウンター 3</h5>
      <div class="counter-display">{count3}</div>
      <div class="counter-controls">
        <button 
          onclick={() => decrement('count3')}
          disabled={count3 === 0}
          class="counter-btn minus"
        >
          −
        </button>
        <button 
          onclick={() => increment('count3')}
          class="counter-btn plus"
        >
          +
        </button>
      </div>
    </div>
  </div>
  
  <div class="total-section">
    <div class="total-label">合計値:</div>
    <div class="total-value">{total}</div>
  </div>
  
  <button onclick={resetAll} class="reset-all-btn">
    すべてリセット
  </button>
</div>

<style>
  .counter-demo {
    padding: 1.5rem;
    background: var(--sp-color-gray-100);
    border-radius: 8px;
  }
  
  .counter-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
  
  .counter-card {
    background: white;
    padding: 1rem;
    border-radius: 8px;
    text-align: center;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  
  .counter-card h5 {
    margin: 0 0 0.5rem 0;
    color: var(--sp-color-gray-700);
    font-size: 0.9rem;
  }
  
  .counter-display {
    font-size: 2.5rem;
    font-weight: bold;
    color: #3b82f6;
    margin: 0.5rem 0;
    text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
  }
  
  .counter-controls {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
  }
  
  .counter-btn {
    width: 40px;
    height: 40px;
    border: 2px solid;
    border-radius: 50%;
    font-size: 1.25rem;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    background: white;
  }
  
  .counter-btn.plus {
    border-color: #22c55e;
    color: #22c55e;
  }
  
  .counter-btn.plus:hover:not(:disabled) {
    background: #22c55e;
    color: white;
  }
  
  .counter-btn.minus {
    border-color: #ef4444;
    color: #ef4444;
  }
  
  .counter-btn.minus:hover:not(:disabled) {
    background: #ef4444;
    color: white;
  }
  
  .counter-btn:hover:not(:disabled) {
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }
  
  .counter-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
    border-color: var(--sp-color-gray-300);
    color: var(--sp-color-gray-400);
  }
  
  .total-section {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: white;
    border-radius: 8px;
    margin-bottom: 1rem;
  }
  
  .total-label {
    font-size: 1.25rem;
    color: var(--sp-color-gray-600);
  }
  
  .total-value {
    font-size: 2rem;
    font-weight: bold;
    color: #3b82f6;
    text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
  }
  
  .reset-all-btn {
    width: 100%;
    padding: 0.75rem;
    background: var(--sp-color-gray-600);
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    transition: background 0.2s;
  }
  
  .reset-all-btn:hover {
    background: var(--sp-color-gray-700);
  }
</style>
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

:::info[技術詳解]
`$bindable`と従来の`bind:`構文の違い、そして`$state`との関係について詳しく知りたい場合は

- [$state: リアクティブな状態変数と、バインディングの違い](/deep-dive/reactive-state-variables-vs-bindings/) - Svelte 5の新しいリアクティビティモデルと従来のバインディングの違いを解説
:::

次は[実践編](/advanced/)で、より高度なパターンを学びましょう。