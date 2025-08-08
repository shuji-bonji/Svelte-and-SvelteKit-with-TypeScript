---
title: スクリプトコンテキスト
description: script要素とscript context="module"の違いと使い分け
---

Svelteコンポーネントには2種類のスクリプトブロックがあります：通常の`<script>`と`<script context="module">`です。これらの違いを理解することで、より効率的なコンポーネント設計が可能になります。

## 2つのスクリプトブロックの違い

### 通常のscriptブロック

```svelte
<script lang="ts">
  // インスタンスごとに実行される
  // コンポーネントのインスタンス変数を定義
  let count = 0;
  
  // このコンポーネントが作成されるたびに実行
  console.log('コンポーネントインスタンスが作成されました');
</script>
```

### script context="module"ブロック

```svelte
<script context="module" lang="ts">
  // モジュールレベルで一度だけ実行される
  // すべてのインスタンスで共有される
  let totalInstances = 0;
  
  // このモジュールが最初にインポートされた時に一度だけ実行
  console.log('モジュールが読み込まれました');
</script>
```

## script context="module"の特徴

### 1. 静的な値の共有

```svelte
<!-- Counter.svelte -->
<script context="module" lang="ts">
  // すべてのCounterインスタンスで共有される
  let totalCount = 0;
  let instances: Set<Counter> = new Set();
  
  // 静的なメソッド
  export function resetAll(): void {
    totalCount = 0;
    instances.forEach(instance => {
      instance.reset();
    });
  }
  
  // 定数の定義
  export const MAX_COUNT = 100;
  export const MIN_COUNT = 0;
</script>

<script lang="ts">
  // インスタンスごとの変数
  let localCount = 0;
  
  // コンポーネントのライフサイクル
  import { onMount, onDestroy } from 'svelte';
  
  onMount(() => {
    instances.add(this);
  });
  
  onDestroy(() => {
    instances.delete(this);
  });
  
  function increment(): void {
    if (localCount < MAX_COUNT) {
      localCount++;
      totalCount++;
    }
  }
  
  function reset(): void {
    localCount = 0;
  }
</script>

<div>
  <p>ローカルカウント: {localCount}</p>
  <p>総カウント: {totalCount}</p>
  <button on:click={increment}>+1</button>
  <button on:click={reset}>リセット</button>
</div>
```

### 2. エクスポート可能な関数と値

```svelte
<!-- utils.svelte -->
<script context="module" lang="ts">
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
  
  // プリロード関数（SvelteKit）
  export async function preload({ params }) {
    // ページコンポーネントの場合、サーバーサイドで実行
    const data = await fetchData(`/users/${params.id}`);
    return { props: { user: data } };
  }
</script>

<script lang="ts">
  // インスタンススコープ
  export let user: any;
</script>
```

### 3. シングルトンパターンの実装

```svelte
<!-- EventBus.svelte -->
<script context="module" lang="ts">
  type EventHandler = (...args: any[]) => void;
  
  class EventBus {
    private events: Map<string, Set<EventHandler>> = new Map();
    
    on(event: string, handler: EventHandler): void {
      if (!this.events.has(event)) {
        this.events.set(event, new Set());
      }
      this.events.get(event)!.add(handler);
    }
    
    off(event: string, handler: EventHandler): void {
      this.events.get(event)?.delete(handler);
    }
    
    emit(event: string, ...args: any[]): void {
      this.events.get(event)?.forEach(handler => {
        handler(...args);
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

```svelte
<!-- ThemeProvider.svelte -->
<script context="module" lang="ts">
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

```svelte
<!-- ApiClient.svelte -->
<script context="module" lang="ts">
  interface RequestConfig {
    method?: string;
    headers?: Record<string, string>;
    body?: any;
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
    
    async request<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
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
    
    post<T>(endpoint: string, data: any): Promise<T> {
      return this.request<T>(endpoint, {
        method: 'POST',
        body: data
      });
    }
    
    put<T>(endpoint: string, data: any): Promise<T> {
      return this.request<T>(endpoint, {
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

```svelte
<!-- DataCache.svelte -->
<script context="module" lang="ts">
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

```svelte
<script context="module" lang="ts">
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

```svelte
<script context="module" lang="ts">
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

## まとめ

このページで学んだこと：

- `<script>`と`<script context="module">`の違い
- module contextでの静的な値の共有
- エクスポート可能な関数と値の定義
- シングルトンパターンの実装
- グローバル設定とAPIクライアントの管理
- キャッシュシステムの実装
- 適切な使い分けとベストプラクティス

## 次のステップ

[Runesシステム入門](/runes/runes-introduction/)では、Svelte 5の新しいリアクティビティシステムについて学びます。