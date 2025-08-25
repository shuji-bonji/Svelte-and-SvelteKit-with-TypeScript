---
title: スクリプトコンテキスト
description: script要素とscript context="module"の違いと使い分け
---

<script>
  import Mermaid from '$lib/components/Mermaid.svelte';
  
  const executionFlowDiagram = `graph TB
      Start([ファイルインポート]) --> ModuleCheck{script module<br/>が存在？}
      
      ModuleCheck -->|Yes| ModuleExec[script module 実行<br/>📦 一度だけ]
      ModuleCheck -->|No| ComponentCreate
      
      ModuleExec --> ModuleStore[(モジュール変数<br/>すべてのインスタンスで共有)]
      ModuleStore --> ComponentCreate
      
      ComponentCreate[コンポーネント作成] --> Instance1[インスタンス 1]
      ComponentCreate --> Instance2[インスタンス 2]
      ComponentCreate --> Instance3[インスタンス n...]
      
      Instance1 --> Script1[script 実行<br/>🎯 独立した状態]
      Instance2 --> Script2[script 実行<br/>🎯 独立した状態]
      Instance3 --> Script3[script 実行<br/>🎯 独立した状態]
      
      Script1 --> State1[(インスタンス変数 1)]
      Script2 --> State2[(インスタンス変数 2)]
      Script3 --> State3[(インスタンス変数 n)]
      `;
  
  const decisionFlowDiagram = `flowchart TD
    Start([機能を実装したい]) --> Q1{リアクティブな<br/>状態が必要？}
    
    Q1 -->|Yes| Q2{複数インスタンスで<br/>共有する？}
    Q1 -->|No| Q3{定数や静的な<br/>関数？}
    
    Q2 -->|Yes| UseStore[.svelte.ts ファイル<br/>+ Runes を使用<br/>💡 推奨]
    Q2 -->|No| UseScript[script を使用<br/>🎯 インスタンス毎の状態]
    
    Q3 -->|Yes| Q4{SvelteKit の<br/>設定？}
    Q3 -->|No| UseScript2[script を使用<br/>📝 通常の処理]
    
    Q4 -->|Yes| UseModule[script module を使用<br/>📦 prerender, load など]
    Q4 -->|No| Q5{全インスタンスで<br/>共有する定数？}
    
    Q5 -->|Yes| UseModule2[script module を使用<br/>🔧 静的な値]
    Q5 -->|No| UseScript3[script を使用<br/>🎨 コンポーネント固有]
    
`;
    
  const scopeDiagram = `graph LR
    subgraph "モジュールレベル（1回のみ）"
        ModuleScope[script module<br/>📦 静的な値・関数]
        ModuleScope --> Shared[(共有領域)]
    end
    
    subgraph "インスタンスレベル（n回）"
        Instance1[script インスタンス1<br/>🎯 独立状態]
        Instance2[script インスタンス2<br/>🎯 独立状態]
        Instance3[script インスタンス3<br/>🎯 独立状態]
    end
    
    subgraph "外部ストア（推奨）"
        Store[.svelte.ts<br/>💡 Runes + 共有状態]
    end
    
    Shared -.->|参照可能| Instance1
    Shared -.->|参照可能| Instance2
    Shared -.->|参照可能| Instance3
    
    Store ==>|import| Instance1
    Store ==>|import| Instance2
    Store ==>|import| Instance3
    `;
</script>


Svelteコンポーネントには2種類のスクリプトブロックがあります。  
通常の`<script>`と`<script context="module">`です。  
これらの違いを理解することで、より効率的なコンポーネント設計が可能になります。


## 通常の `<script>`

通常の`<script>`ブロックは、コンポーネントのインスタンスごとに実行されます。各コンポーネントが作成されるたびに、このブロック内のコードが実行され、独立した状態を持ちます。

```svelte
<script lang="ts">
  // インスタンスごとに実行される
  // コンポーネントのインスタンス変数を定義
  let count = 0;
  
  // このコンポーネントが作成されるたびに実行
  console.log('コンポーネントインスタンスが作成されました');
</script>
```

## `<script module>`

モジュールレベルのスクリプトは、ファイルが最初にインポートされた時に一度だけ実行されます。すべてのコンポーネントインスタンスで共有される値や関数を定義するために使用します。

:::tip[Svelte 5の短縮構文]
Svelte 5では、`<script context="module">`を`<script module>`と短縮して書くことができます。両方の構文は同じ動作をします。
:::

```svelte
<!-- Svelte 5: 新しい短縮構文（推奨） -->
<script module lang="ts">
  // モジュールレベルで一度だけ実行される
  let totalInstances = 0;
  console.log('モジュールが読み込まれました');
</script>

<!-- 従来の構文（後方互換性のため動作する） -->
<script context="module" lang="ts">
  // モジュールレベルで一度だけ実行される
  // すべてのインスタンスで共有される
  let totalInstances = 0;
  
  // このモジュールが最初にインポートされた時に一度だけ実行
  console.log('モジュールが読み込まれました');
</script>
```

## 基本比較表

| 種類 | 記述方法 | 実行タイミング | スコープ | 主な用途 |
|---|---|---|---|---|
| インスタンススクリプト | `<script>` | クライアントで実行 | コンポーネントのインスタンスごと | リアクティブ変数、イベント、状態管理など |
| モジュールスクリプト（module） | `<script module>` | ビルド時または SSR時 | モジュール単位（1度のみ） | `load()`、`prerender` などSvelteKit固有の設定やサーバー向け処理 |

### スコープと実行タイミングの視覚化

<Mermaid diagram={scopeDiagram} />

### 実行フローの図解

<Mermaid diagram={executionFlowDiagram} />


## script module の特徴

### 1. 静的な値の共有（Svelte 5推奨方法）

:::warning[Svelte 5での推奨アプローチ]
Svelte 5では、コンポーネント間での状態共有には`.svelte.js`/`.svelte.ts`ファイルとRunesを使用することが推奨されています。`script module`での変数共有は、リアクティビティが必要ない静的な値に限定すべきです。
:::

#### 推奨：.svelte.tsファイルでのRunes使用

```typescript
// counter.svelte.ts
let totalCount = $state(0);
const instances = new Set<any>();

export function useCounter() {
  let localCount = $state(0);
  
  function increment() {
    if (localCount < 100) {
      localCount++;
      totalCount++;
    }
  }
  
  function reset() {
    localCount = 0;
  }
  
  return {
    get localCount() { return localCount; },
    get totalCount() { return totalCount; },
    increment,
    reset,
    resetAll() {
      totalCount = 0;
      instances.forEach(instance => instance.reset());
    }
  };
}
```

```svelte
<!-- Counter.svelte -->
<script lang="ts">
  import { useCounter } from './counter.svelte';
  
  const counter = useCounter();
</script>

<div>
  <p>ローカルカウント: {counter.localCount}</p>
  <p>総カウント: {counter.totalCount}</p>
  <button onclick={counter.increment}>+1</button>
  <button onclick={counter.reset}>リセット</button>
</div>
```

#### script moduleでの静的値（定数のみ推奨）

```svelte
<!-- Constants.svelte -->
<script module lang="ts">
  // 定数の定義（リアクティビティ不要）
  export const MAX_COUNT = 100;
  export const MIN_COUNT = 0;
  export const API_VERSION = 'v1';
  
  // 純粋関数（副作用なし）
  export function formatCurrency(amount: number): string {
    return `¥${amount.toLocaleString()}`;
  }
</script>
```

### 2. エクスポート可能な関数と値

モジュールスクリプトから`export`された関数や値は、他のファイルからインポートして使用できます。これにより、コンポーネントファイルをユーティリティモジュールとしても活用できます。

```svelte
<!-- utils.svelte -->
<script module lang="ts">
  // 他のファイルからインポート可能
  export interface Config {
    apiUrl: string;
    timeout: number;
  }
  
  export const defaultConfig: Config = {
    apiUrl: 'https://api.example.com',
    timeout: 5000
  };
  
  export function formatDate(date: Date): string {
    return date.toLocaleDateString('ja-JP');
  }
  
  export async function fetchData<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${defaultConfig.apiUrl}${endpoint}`);
    return response.json();
  }
  
  // SvelteKitのload関数で使用される型
  export interface User {
    id: string;
    name: string;
    email: string;
  }
</script>

<script lang="ts">
  // Svelte 5: $props()を使用し、適切な型定義
  interface Props {
    user: User;
  }
  
  let { user }: Props = $props();
</script>
```

### 3. シングルトンパターンの実装

モジュールスクリプトは一度だけ実行されるため、シングルトンパターンの実装に最適です。イベントバスやグローバルな状態管理などに活用できます。

```svelte
<!-- EventBus.svelte -->
<script module lang="ts">
  // ジェネリック型を使用して型安全性を向上
  type EventHandler<T = unknown> = (data: T) => void;
  
  class EventBus {
    private events: Map<string, Set<EventHandler<any>>> = new Map();
    
    on<T = unknown>(event: string, handler: EventHandler<T>): void {
      if (!this.events.has(event)) {
        this.events.set(event, new Set());
      }
      this.events.get(event)!.add(handler as EventHandler<any>);
    }
    
    off<T = unknown>(event: string, handler: EventHandler<T>): void {
      this.events.get(event)?.delete(handler as EventHandler<any>);
    }
    
    emit<T = unknown>(event: string, data: T): void {
      this.events.get(event)?.forEach(handler => {
        handler(data);
      });
    }
  }
  
  // シングルトンインスタンス
  export const eventBus = new EventBus();
</script>

<!-- 使用例 -->
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  
  function handleMessage(message: string): void {
    console.log('Received:', message);
  }
  
  onMount(() => {
    eventBus.on('message', handleMessage);
  });
  
  onDestroy(() => {
    eventBus.off('message', handleMessage);
  });
  
  function sendMessage(): void {
    eventBus.emit('message', 'Hello from component!');
  }
</script>
```

## 実践的な使用例

### 1. グローバル設定の管理

アプリケーション全体で共有される設定（テーマ、言語設定など）をモジュールスクリプトで管理できます。

```svelte
<!-- ThemeProvider.svelte -->
<script module lang="ts">
  export type Theme = 'light' | 'dark' | 'auto';
  
  interface ThemeConfig {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  }
  
  const themes: Record<Theme, ThemeConfig> = {
    light: {
      primary: '#007bff',
      secondary: '#6c757d',
      background: '#ffffff',
      text: '#212529'
    },
    dark: {
      primary: '#0d6efd',
      secondary: '#6c757d',
      background: '#212529',
      text: '#ffffff'
    },
    auto: {
      // システム設定に基づく
      primary: '#007bff',
      secondary: '#6c757d',
      background: '#ffffff',
      text: '#212529'
    }
  };
  
  // 現在のテーマ（全インスタンスで共有）
  let currentTheme: Theme = 'light';
  
  export function setTheme(theme: Theme): void {
    currentTheme = theme;
    applyTheme(themes[theme]);
  }
  
  export function getTheme(): Theme {
    return currentTheme;
  }
  
  function applyTheme(config: ThemeConfig): void {
    const root = document.documentElement;
    root.style.setProperty('--primary', config.primary);
    root.style.setProperty('--secondary', config.secondary);
    root.style.setProperty('--background', config.background);
    root.style.setProperty('--text', config.text);
  }
</script>

<script lang="ts">
  import { onMount } from 'svelte';
  
  export let theme: Theme = 'light';
  
  onMount(() => {
    setTheme(theme);
  });
</script>

<slot />
```

### 2. APIクライアントの共有

APIクライアントのインスタンスを一度だけ作成し、アプリケーション全体で再利用することで、効率的なネットワーク通信を実現できます。

```svelte
<!-- ApiClient.svelte -->
<script module lang="ts">
  interface RequestConfig<T = unknown> {
    method?: string;
    headers?: Record<string, string>;
    body?: T;
  }
  
  class ApiClient {
    private baseUrl: string;
    private defaultHeaders: Record<string, string>;
    
    constructor(baseUrl: string) {
      this.baseUrl = baseUrl;
      this.defaultHeaders = {
        'Content-Type': 'application/json'
      };
    }
    
    setAuthToken(token: string): void {
      this.defaultHeaders['Authorization'] = `Bearer ${token}`;
    }
    
    async request<T, B = unknown>(endpoint: string, config: RequestConfig<B> = {}): Promise<T> {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        method: config.method || 'GET',
        headers: {
          ...this.defaultHeaders,
          ...config.headers
        },
        body: config.body ? JSON.stringify(config.body) : undefined
      });
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      
      return response.json();
    }
    
    get<T>(endpoint: string): Promise<T> {
      return this.request<T>(endpoint);
    }
    
    post<T, B = unknown>(endpoint: string, data: B): Promise<T> {
      return this.request<T, B>(endpoint, {
        method: 'POST',
        body: data
      });
    }
    
    put<T, B = unknown>(endpoint: string, data: B): Promise<T> {
      return this.request<T, B>(endpoint, {
        method: 'PUT',
        body: data
      });
    }
    
    delete<T>(endpoint: string): Promise<T> {
      return this.request<T>(endpoint, {
        method: 'DELETE'
      });
    }
  }
  
  // シングルトンインスタンス
  export const api = new ApiClient('https://api.example.com');
</script>
```

### 3. キャッシュの実装

データキャッシュをモジュールレベルで管理することで、コンポーネント間でキャッシュを共有し、不要なAPIコールを削減できます。

```svelte
<!-- DataCache.svelte -->
<script module lang="ts">
  interface CacheEntry<T> {
    data: T;
    timestamp: number;
    ttl: number;
  }
  
  class DataCache {
    private cache: Map<string, CacheEntry<any>> = new Map();
    
    set<T>(key: string, data: T, ttl: number = 60000): void {
      this.cache.set(key, {
        data,
        timestamp: Date.now(),
        ttl
      });
    }
    
    get<T>(key: string): T | null {
      const entry = this.cache.get(key);
      
      if (!entry) {
        return null;
      }
      
      const isExpired = Date.now() - entry.timestamp > entry.ttl;
      
      if (isExpired) {
        this.cache.delete(key);
        return null;
      }
      
      return entry.data;
    }
    
    clear(): void {
      this.cache.clear();
    }
    
    remove(key: string): void {
      this.cache.delete(key);
    }
  }
  
  export const cache = new DataCache();
  
  // キャッシュ付きデータフェッチ
  export async function fetchWithCache<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    // キャッシュをチェック
    const cached = cache.get<T>(key);
    if (cached !== null) {
      console.log('Cache hit:', key);
      return cached;
    }
    
    // データをフェッチ
    console.log('Cache miss:', key);
    const data = await fetcher();
    
    // キャッシュに保存
    cache.set(key, data, ttl);
    
    return data;
  }
</script>

<script lang="ts">
  import { onMount } from 'svelte';
  
  interface User {
    id: number;
    name: string;
  }
  
  let users: User[] = [];
  let loading = true;
  
  onMount(async () => {
    try {
      users = await fetchWithCache(
        'users',
        () => fetch('/api/users').then(r => r.json()),
        300000 // 5分間キャッシュ
      );
    } finally {
      loading = false;
    }
  });
</script>
```

## ベストプラクティス

### 1. 使い分けの指針

モジュールスクリプトと通常のスクリプトの使い分けは、データのスコープと共有の必要性によって決まります。

```svelte
<script module lang="ts">
  // ✅ module contextに適している
  // - 定数の定義
  export const API_VERSION = 'v1';
  
  // - ユーティリティ関数
  export function formatCurrency(amount: number): string {
    return `¥${amount.toLocaleString()}`;
  }
  
  // - 静的なデータ
  const ROUTES = {
    home: '/',
    about: '/about',
    contact: '/contact'
  };
  
  // - シングルトンインスタンス
  const logger = new Logger();
</script>

<script lang="ts">
  // ✅ 通常のscriptに適している
  // - コンポーネントの状態
  let isOpen = false;
  
  // - Props
  export let title: string;
  
  // - イベントハンドラ
  function handleClick(): void {
    isOpen = !isOpen;
  }
  
  // - ライフサイクル
  import { onMount } from 'svelte';
  onMount(() => {
    // 初期化処理
  });
</script>
```

### 2. 注意点

モジュールスクリプトを使用する際は、すべてのインスタンスで共有されることを常に意識する必要があります。

```svelte
<script module lang="ts">
  // ❌ 避けるべきパターン
  // インスタンス固有のデータを module context に置かない
  let userInput = ''; // これは全インスタンスで共有される！
  
  // ❌ DOMへの直接アクセス
  // const element = document.getElementById('...'); // まだDOMが存在しない
  
  // ✅ 正しいパターン
  // 共有すべきデータのみを配置
  let totalUsers = 0;
  const MAX_USERS = 100;
</script>

<script lang="ts">
  // ✅ インスタンス固有のデータは通常のscriptに
  let userInput = '';
  
  // ✅ DOM操作はライフサイクル内で
  import { onMount } from 'svelte';
  onMount(() => {
    const element = document.getElementById('...');
  });
</script>
```

## 🔁 使い分けの指針

| シーン | 適用するスクリプト | 理由 |
|---|---|---|
| クライアントで状態管理をしたい | `<script>` | 状態（countなど）を動的に扱いたい |
| ページの事前レンダリングを有効化 | `<script module>` | `export const prerender = true` を定義 |
| SSRでのデータフェッチを記述したい | `<script module>` | `load()` を使う |
| ページ内でイベントバインディングしたい| `<script>` | DOM と連動した動的処理を書くため |

### 使い分けフローチャート

<Mermaid diagram={decisionFlowDiagram} />

## まとめ

- **通常の`<script>`**：コンポーネントインスタンスごとに実行され、リアクティブな状態管理やイベント処理に使用
- **`<script module>`**：モジュールレベルで一度だけ実行され、定数の定義や純粋関数のエクスポートに最適
- **Svelte 5の推奨**：コンポーネント間での状態共有には`.svelte.ts`ファイルとRunesを使用
- **モジュールスクリプトの用途**：静的な値の定義やSvelteKitの設定（`prerender`、`load`関数など）
- **適切な使い分け**：スクリプトの役割を理解することで、効率的で保守しやすいコンポーネント設計が可能

## 次のステップ

[Runesシステム入門](/runes/runes-introduction/)では、Svelte 5の新しいリアクティビティシステムについて学びます。