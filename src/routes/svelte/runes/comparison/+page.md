---
title: 他フレームワークとの比較
description: React、Vue、Angularの経験者向けRunesシステム比較ガイド
---


他のフレームワークの経験がある方向けに、Svelte 5のRunesシステムと、React、Vue、Angularの類似機能を比較します。

## React との比較

React開発者向けに、Hooks APIとSvelte 5のRunesシステムの対応関係と主な違いを解説します。

### 状態管理

<div class="comparison-table">

| React (Hooks) | Svelte 5 (Runes) | 説明 |
|--------------|------------------|------|
| `useState` | `$state` | リアクティブな状態の作成 |
| `useMemo` | `$derived` | 計算値のメモ化 |
| `useEffect` | `$effect` | 副作用の実行 |
| `useRef` | 通常の変数 | 非リアクティブな参照 |
| `useCallback` | 通常の関数 | Svelteでは不要 |

</div>

#### コード比較：カウンター

```javascript
// React
import { useState, useMemo, useEffect } from 'react';
  
function Counter() {
  const [count, setCount] = useState(0);
  const doubled = useMemo(() => count * 2, [count]);
  
  useEffect(() => {
    console.log(`Count: ${count}`);
  }, [count]);
  
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}, Doubled: {doubled}
    </button>
  );
}
```

```svelte
<!-- Svelte 5 -->
<script lang="ts">
  let count = $state(0);
  let doubled = $derived(count * 2);
  
  $effect(() => {
    console.log(`Count: ${count}`);
  });
</script>

<button onclick={() => count++}>
  Count: {count}, Doubled: {doubled}
</button>
```

### 主な違い

ReactとSvelteのアプローチの根本的な違いを、具体的なコード例と共に説明します。

#### 1. 直接変更 vs イミュータブル更新

```javascript
// React - イミュータブル更新が必要
const [user, setUser] = useState({ name: 'Alice', age: 25 });
setUser({ ...user, name: 'Bob' }); // 新しいオブジェクトを作成

const [items, setItems] = useState([1, 2, 3]);
setItems([...items, 4]); // 新しい配列を作成
```

```svelte
<!-- Svelte - 直接変更可能 -->
<script lang="ts">
  let user = $state({ name: 'Alice', age: 25 });
  user.name = 'Bob'; // 直接変更でOK
  
  let items = $state([1, 2, 3]);
  items.push(4); // 直接変更でOK
</script>
```

#### 2. 依存配列の有無

```javascript
// React - 依存配列を明示的に指定
useEffect(() => {
  // nameとageが変更されたときのみ実行
  console.log(`${name} is ${age} years old`);
}, [name, age]); // 依存配列が必要

useMemo(() => {
  return expensiveCalculation(data);
}, [data]); // 依存配列が必要
```

```svelte
<!-- Svelte - 自動的に依存関係を追跡 -->
<script lang="ts">
  $effect(() => {
    // 使用している変数を自動追跡
    console.log(`${name} is ${age} years old`);
  }); // 依存配列不要
  
  let result = $derived(() => {
    return expensiveCalculation(data);
  }); // 依存配列不要
</script>
```

#### 3. カスタムフックとの比較

```javascript
// React - カスタムフック
function useCounter(initial = 0) {
  const [count, setCount] = useState(initial);
  const increment = () => setCount(c => c + 1);
  const decrement = () => setCount(c => c - 1);
  
  return { count, increment, decrement };
}
```

```typescript
// Svelte - .svelte.ts ファイル
export function createCounter(initial = 0) {
  let count = $state(initial);
  
  return {
    get value() { return count; },
    increment() { count++; },
    decrement() { count--; }
  };
}
```

## Vue との比較

Vue 3のComposition APIユーザー向けに、Svelte 5のRunesとの対応関係を示します。

### Composition API との対応

<div class="comparison-table">

| Vue 3 (Composition API) | Svelte 5 (Runes) | 説明 |
|-------------------------|------------------|------|
| `ref()` | `$state` | プリミティブ値のリアクティビティ |
| `reactive()` | `$state` | オブジェクトのリアクティビティ |
| `computed()` | `$derived` | 計算プロパティ |
| `watchEffect()` | `$effect` | 自動追跡の副作用 |
| `watch()` | `$effect` | 値の監視 |

</div>

#### コード比較：リアクティブなフォーム

```html
<!-- Vue 3 -->
<script setup>
import { ref, reactive, computed, watchEffect } from 'vue';

const firstName = ref('');
const lastName = ref('');
const user = reactive({
  email: '',
  age: 0
});

const fullName = computed(() => 
  `${firstName.value} ${lastName.value}`
);

watchEffect(() => {
  console.log(`Full name: ${fullName.value}`);
});
</script>

<template>
  <input v-model="firstName" />
  <input v-model="lastName" />
  <p>{{ fullName }}</p>
</template>
```

```svelte
<!-- Svelte 5 -->
<script lang="ts">
  let firstName = $state('');
  let lastName = $state('');
  let user = $state({
    email: '',
    age: 0
  });
  
  let fullName = $derived(
    `${firstName} ${lastName}`
  );
  
  $effect(() => {
    console.log(`Full name: ${fullName}`);
  });
</script>

<input bind:value={firstName} />
<input bind:value={lastName} />
<p>{fullName}</p>
```

### 主な違い

VueとSvelteのリアクティビティシステムの違いと、テンプレート構文の比較を行います。

#### 1. .value アクセス vs 直接アクセス

```javascript
// Vue - .value が必要
const count = ref(0);
console.log(count.value); // .value でアクセス
count.value++; // .value で更新

// reactive の場合は不要
const state = reactive({ count: 0 });
state.count++; // 直接アクセス
```

```svelte
<!-- Svelte - 常に直接アクセス -->
<script lang="ts">
  let count = $state(0);
  console.log(count); // 直接アクセス
  count++; // 直接更新
  
  let state = $state({ count: 0 });
  state.count++; // 直接アクセス
</script>
```

#### 2. テンプレート構文

```html
<!-- Vue - ディレクティブベース -->
<template>
  <div v-if="show">表示</div>
  <div v-for="item in items" :key="item.id">
    {{ item.name }}
  </div>
  <button @click="handleClick">クリック</button>
</template>
```

```svelte
<!-- Svelte - HTMLに近い構文 -->
{#if show}
  <div>表示</div>
{/if}

{#each items as item (item.id)}
  <div>{item.name}</div>
{/each}

<button onclick={handleClick}>クリック</button>
```

## Angular との比較

Angular 16以降のSignals APIとSvelte 5のRunesの類似点と相違点を解説します。

### Signals との対応

Angular 16以降で導入されたSignalsは、Svelte 5のRunesと非常に似ています。

<div class="comparison-table">

| Angular (Signals) | Svelte 5 (Runes) | 説明 |
|------------------|------------------|------|
| `signal()` | `$state` | リアクティブな状態 |
| `computed()` | `$derived` | 計算値 |
| `effect()` | `$effect` | 副作用 |
| `@Input()` | `$props` | プロパティ |

</div>

#### コード比較：コンポーネント

```typescript
// Angular with Signals
@Component({
  selector: 'app-counter',
  template: `
    <button (click)="increment()">
      Count: {{ count() }}, Doubled: {{ doubled() }}
    </button>
  `
})
export class CounterComponent {
  count = signal(0);
  doubled = computed(() => this.count() * 2);
  
  constructor() {
    effect(() => {
      console.log(`Count: ${this.count()}`);
    });
  }
  
  increment() {
    this.count.update(c => c + 1);
  }
}
```

```svelte
<!-- Svelte 5 -->
<script lang="ts">
  let count = $state(0);
  let doubled = $derived(count * 2);
  
  $effect(() => {
    console.log(`Count: ${count}`);
  });
  
  function increment() {
    count++;
  }
</script>

<button onclick={increment}>
  Count: {count}, Doubled: {doubled}
</button>
```

### 主な違い

Angularの構造化されたアプローチとSvelteのシンプルなアプローチの違いを比較します。

#### 1. クラスベース vs 関数ベース

```typescript
// Angular - クラスベース
@Component({ /* ... */ })
export class MyComponent {
  private count = signal(0);
  protected doubled = computed(() => this.count() * 2);
  
  public increment(): void {
    this.count.update(c => c + 1);
  }
}
```

```svelte
<!-- Svelte - 関数ベース（シンプル） -->
<script lang="ts">
  let count = $state(0);
  let doubled = $derived(count * 2);
  
  function increment() {
    count++;
  }
</script>
```

#### 2. 依存性注入

```typescript
// Angular - DIコンテナ
@Injectable()
export class DataService {
  private data = signal<Data[]>([]);
  
  getData() {
    return this.data.asReadonly();
  }
}

@Component({ /* ... */ })
export class MyComponent {
  constructor(private dataService: DataService) {}
}
```

```typescript
// Svelte - モジュールシステム
// dataService.svelte.ts
export function createDataService() {
  let data = $state<Data[]>([]);
  
  return {
    get data() { return data; },
    // ...
  };
}

// Component.svelte
import { createDataService } from './dataService.svelte.ts';
const dataService = createDataService();
```

## 移行のヒント

各フレームワークからSvelte 5へ移行する際の重要なポイントと、よくある落とし穴を解説します。

### React からの移行

1. **思考の転換**
   - セッター関数 → 直接代入
   - イミュータブル更新 → ミュータブル更新OK
   - 依存配列 → 自動追跡

2. **よくあるパターンの変換**
```javascript
// React
const [items, setItems] = useState([]);
setItems(prev => [...prev, newItem]);

// Svelte
let items = $state([]);
items.push(newItem);
```

### Vue からの移行

1. **シンプルな構文**
   - `.value` 不要
   - `ref` と `reactive` の区別不要
   - すべて `$state` で統一

2. **テンプレート構文**
   - `v-if` → `{#if}`
   - `v-for` → `{#each}`
   - `@event` → `on:event`

### Angular からの移行

1. **軽量化**
   - デコレータ不要
   - クラス不要（オプション）
   - DI コンテナ不要

2. **シンプルな構造**
   - モジュール不要
   - コンポーネント単位でシンプル

## パフォーマンス比較

各フレームワークのバンドルサイズとランタイムパフォーマンスを数値で比較します。

### バンドルサイズ

| フレームワーク | Hello World | 実際のアプリ |
|--------------|-------------|-------------|
| Svelte 5 | ~10KB | ~30KB |
| React 18 | ~45KB | ~150KB |
| Vue 3 | ~35KB | ~100KB |
| Angular 17 | ~130KB | ~500KB |

### ランタイムパフォーマンス

#### Svelte 5の利点
- **コンパイル時最適化** - 実行時のオーバーヘッドが最小
- **仮想DOM不要** - 直接DOM操作で高速
- **細粒度のリアクティビティ** - 必要な部分のみ更新

## まとめ

Svelte 5のRunesシステムの特徴を他フレームワークと比較し、それぞれの強みを整理します。

### Svelte 5 Runesの優位性

1. **シンプルさ**
   - 学習曲線が緩やか
   - ボイラープレートが少ない
   - 直感的なAPI

2. **パフォーマンス**
   - 小さなバンドルサイズ
   - 高速な実行速度
   - 効率的な更新

3. **開発体験**
   - TypeScript統合が優れている
   - 依存関係の自動追跡
   - 直接的な値の操作

:::tip[フレームワーク選択のポイント]
- **小〜中規模プロジェクト**: Svelte が最適
- **大規模エンタープライズ**: Angular の構造が有利な場合も
- **エコシステム重視**: React/Vue の方が充実
- **パフォーマンス重視**: Svelte が最速
:::

## 次のステップ

他フレームワークとの比較を理解したら、実際にSvelteでコンポーネントを作成してみましょう。

基礎的なRunesの理解ができたら、[Svelteの基本](/svelte/basics/)でコンポーネントの作り方を学びましょう。

