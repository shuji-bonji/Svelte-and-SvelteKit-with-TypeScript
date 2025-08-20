---
title: TypeScriptパターン
description: Svelte 5での高度な型定義パターンとベストプラクティス
---

Svelte 5とTypeScriptを組み合わせた高度な型定義パターンとベストプラクティスを紹介します。これらのパターンを習得することで、より堅牢で保守性の高いアプリケーションを構築できます。

## TypeScriptの基本概念（詳細）

### ジェネリクス

型を抽象化して再利用可能にする強力な機能です。ジェネリクスを使用することで、型の安全性を保ちながら、様々な型に対応できる汎用的な関数やクラスを作成できます。

```typescript
// ジェネリック関数
function identity<T>(value: T): T {
  return value;
}

// 使用例
const num = identity<number>(42);
const str = identity<string>("hello");

// ジェネリックインターフェース
interface Box<T> {
  value: T;
  getValue(): T;
  setValue(value: T): void;
}

// ジェネリッククラス
class Container<T> {
  private value: T;
  
  constructor(value: T) {
    this.value = value;
  }
  
  get(): T {
    return this.value;
  }
  
  set(value: T): void {
    this.value = value;
  }
}
```

### 型ガードと型の絞り込み

実行時に型を安全に判定する仕組みです。TypeScriptは静的型チェックを行いますが、実行時には型情報が失われます。型ガードを使用することで、実行時でも型を安全に絞り込み、その型特有のプロパティやメソッドにアクセスできます。

```typescript
// typeof型ガード
function processValue(value: string | number) {
  if (typeof value === "string") {
    return value.toUpperCase(); // string型として扱える
  } else {
    return value * 2; // number型として扱える
  }
}

// instanceof型ガード
class Dog {
  bark() { console.log("ワン！"); }
}

class Cat {
  meow() { console.log("ニャー！"); }
}

function petSound(pet: Dog | Cat) {
  if (pet instanceof Dog) {
    pet.bark();
  } else {
    pet.meow();
  }
}

// カスタム型ガード
interface User {
  name: string;
  email: string;
}

function isUser(obj: any): obj is User {
  return obj && typeof obj.name === "string" && typeof obj.email === "string";
}
```

## 高度な型機能

### マップ型とユーティリティ型

TypeScriptの組み込み型を活用した型変換の手法です。ユーティリティ型は、既存の型から新しい型を導出する強力な機能を提供します。

```typescript
// Partial - 全てのプロパティをオプショナルに
interface User {
  id: string;
  name: string;
  email: string;
}

type PartialUser = Partial<User>;
// { id?: string; name?: string; email?: string; }

// Required - 全てのプロパティを必須に
type RequiredUser = Required<PartialUser>;

// Readonly - 全てのプロパティを読み取り専用に
type ReadonlyUser = Readonly<User>;

// Pick - 特定のプロパティのみ抽出
type UserIdAndName = Pick<User, "id" | "name">;

// Omit - 特定のプロパティを除外
type UserWithoutId = Omit<User, "id">;

// Record - キーと値の型を指定
type UserMap = Record<string, User>;

// カスタムマップ型
type Nullable<T> = {
  [P in keyof T]: T[P] | null;
};

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object 
    ? DeepPartial<T[P]> 
    : T[P];
};
```

### テンプレートリテラル型

文字列リテラル型を動的に生成する高度な機能です。テンプレートリテラル型により、文字列の組み合わせパターンを型レベルで表現できます。

```typescript
// 基本的なテンプレートリテラル型
type EventName = "click" | "focus" | "blur";
type EventHandler = `on${Capitalize<EventName>}`;
// "onClick" | "onFocus" | "onBlur"

// 実用例：CSSプロパティ
type Size = "sm" | "md" | "lg";
type Color = "primary" | "secondary" | "danger";
type ButtonClass = `btn-${Size}-${Color}`;
// "btn-sm-primary" | "btn-sm-secondary" | ... 9通り

// パターンマッチング
type ExtractParams<T> = T extends `/api/${infer Endpoint}/${infer Id}`
  ? { endpoint: Endpoint; id: Id }
  : never;

type Result = ExtractParams<"/api/users/123">;
// { endpoint: "users"; id: "123" }

// 実践的な例：APIルートの型定義
type APIRoute = 
  | `/users/${string}`
  | `/posts/${string}`
  | `/comments/${string}`;

function fetchAPI<T extends APIRoute>(route: T): Promise<any> {
  return fetch(route).then(res => res.json());
}
```

### 条件型とinfer

型レベルでの条件分岐を実現する強力な機能です。条件型を使用することで、型の値に応じて異なる型を返すことができます。

```typescript
// 基本的な条件型
type IsString<T> = T extends string ? true : false;
type Test1 = IsString<"hello">; // true
type Test2 = IsString<42>; // false

// inferを使った型の抽出
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;
type Result = ReturnType<() => string>; // string

// 配列要素の型を抽出
type ArrayElement<T> = T extends (infer U)[] ? U : never;
type Item = ArrayElement<string[]>; // string

// Promiseの中身を抽出
type Unwrap<T> = T extends Promise<infer U> ? U : T;
type Data = Unwrap<Promise<string>>; // string

// 関数の引数型を抽出
type Parameters<T> = T extends (...args: infer P) => any ? P : never;
type Params = Parameters<(a: string, b: number) => void>; // [string, number]
```

## Svelte特有の高度なパターン

### リアクティブストア (.svelte.ts)

Svelte 5では、`.svelte.ts`ファイルを使用してリアクティブなストアを作成できます。

```typescript
// counter.svelte.ts
export function createCounter(initial = 0) {
  let count = $state(initial);
  
  return {
    get value() { return count; },
    increment() { count++; },
    decrement() { count--; },
    reset() { count = initial; },
    set(value: number) { count = value; }
  };
}

// 型エクスポート
export type Counter = ReturnType<typeof createCounter>;

// ジェネリックストア
export function createStore<T>(initial: T) {
  let value = $state(initial);
  
  return {
    get current() { return value; },
    set(newValue: T) { value = newValue; },
    update(fn: (value: T) => T) { 
      value = fn(value); 
    },
    subscribe(fn: (value: T) => void) {
      $effect(() => {
        fn(value);
      });
    }
  };
}

// 高度なストアパターン
export function createAsyncStore<T>() {
  let data = $state<T | null>(null);
  let loading = $state(false);
  let error = $state<Error | null>(null);
  
  async function load(fetcher: () => Promise<T>) {
    loading = true;
    error = null;
    
    try {
      data = await fetcher();
    } catch (err) {
      error = err instanceof Error ? err : new Error('Unknown error');
    } finally {
      loading = false;
    }
  }
  
  return {
    get data() { return data; },
    get loading() { return loading; },
    get error() { return error; },
    load
  };
}
```

### ジェネリック型を使ったコンポーネント

Svelte 5では、コンポーネント自体にジェネリクスを適用できます。

```svelte
<!-- DataTable.svelte -->
<script lang="ts" generics="T extends { id: string }">
  import type { Snippet } from 'svelte';
  
  interface Props<T> {
    items: T[];
    columns: {
      key: keyof T;
      label: string;
      render?: (value: T[keyof T]) => string;
    }[];
    onRowClick?: (item: T) => void;
    rowSlot?: Snippet<[T]>;
  }
  
  let { items, columns, onRowClick, rowSlot }: Props<T> = $props();
</script>

<table>
  <thead>
    <tr>
      {#each columns as column}
        <th>{column.label}</th>
      {/each}
    </tr>
  </thead>
  <tbody>
    {#each items as item (item.id)}
      <tr onclick={() => onRowClick?.(item)}>
        {#if rowSlot}
          {@render rowSlot(item)}
        {:else}
          {#each columns as column}
            <td>
              {column.render 
                ? column.render(item[column.key])
                : item[column.key]}
            </td>
          {/each}
        {/if}
      </tr>
    {/each}
  </tbody>
</table>
```

### 高度なProps型定義

条件付き型を使用した柔軟なPropsパターンです。

```typescript
// ユニオン型によるモード切り替え
type Props = 
  | {
      mode: 'view';
      data: string;
    }
  | {
      mode: 'edit';
      data: string;
      onChange: (value: string) => void;
      onSave: () => void;
    }
  | {
      mode: 'create';
      onCreate: (value: string) => void;
    };

// 条件付き必須プロパティ
type ConditionalProps<T extends boolean = false> = {
  editable?: T;
  value: string;
} & (T extends true 
  ? { onChange: (value: string) => void }
  : {});

// 排他的プロパティ
type ExclusiveProps = 
  | { type: 'text'; text: string }
  | { type: 'image'; src: string; alt?: string }
  | { type: 'video'; url: string; autoplay?: boolean };
```

## SvelteKitの高度な型定義

### Load関数の高度なパターン

```typescript
// +page.ts
import type { PageLoad } from './$types';

// 型安全なパラメータ検証
export const load: PageLoad = async ({ params, url, fetch }) => {
  // URLパラメータの型安全な取得
  const page = Number(url.searchParams.get('page') ?? 1);
  const limit = Number(url.searchParams.get('limit') ?? 10);
  
  // 型ガードを使用した検証
  if (isNaN(page) || page < 1) {
    throw new Error('Invalid page parameter');
  }
  
  // 複数のAPIコールを並列実行
  const [posts, categories, tags] = await Promise.all([
    fetch(`/api/posts?page=${page}&limit=${limit}`).then(r => r.json()),
    fetch('/api/categories').then(r => r.json()),
    fetch('/api/tags').then(r => r.json())
  ]);
  
  return {
    posts: posts as Post[],
    categories: categories as Category[],
    tags: tags as Tag[],
    pagination: {
      page,
      limit,
      total: posts.total
    }
  };
};
```

### Actions の高度なパターン

```typescript
// +page.server.ts
import type { Actions } from './$types';
import { z } from 'zod';

// Zodを使用した型安全なバリデーション
const createPostSchema = z.object({
  title: z.string().min(1).max(100),
  content: z.string().min(10),
  tags: z.array(z.string()).optional(),
  published: z.boolean().default(false)
});

export const actions: Actions = {
  create: async ({ request }) => {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);
    
    // バリデーションと型推論
    const result = createPostSchema.safeParse(data);
    
    if (!result.success) {
      return {
        success: false,
        errors: result.error.flatten()
      };
    }
    
    // result.dataは完全に型付けされている
    const post = await createPost(result.data);
    
    return {
      success: true,
      post
    };
  },
  
  update: async ({ request, params }) => {
    // 複数のアクションで共通の型を使用
    const formData = await request.formData();
    const data = Object.fromEntries(formData);
    
    const updateSchema = createPostSchema.partial();
    const result = updateSchema.safeParse(data);
    
    if (!result.success) {
      return {
        success: false,
        errors: result.error.flatten()
      };
    }
    
    const post = await updatePost(params.id, result.data);
    
    return {
      success: true,
      post
    };
  }
};
```

### APIエンドポイントの型定義

```typescript
// +server.ts
import type { RequestHandler } from './$types';

// レスポンスヘルパー
function jsonResponse<T>(data: T, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

// エラーレスポンスの型定義
interface ErrorResponse {
  error: string;
  code?: string;
  details?: unknown;
}

export const GET: RequestHandler = async ({ url, locals }) => {
  // 認証チェック
  if (!locals.user) {
    return jsonResponse<ErrorResponse>(
      { error: 'Unauthorized', code: 'AUTH_REQUIRED' },
      401
    );
  }
  
  // クエリパラメータの型安全な処理
  const filters = {
    status: url.searchParams.get('status') as 'active' | 'inactive' | null,
    sort: url.searchParams.get('sort') as 'asc' | 'desc' | null,
    limit: Number(url.searchParams.get('limit') ?? 10)
  };
  
  try {
    const data = await fetchData(filters);
    return jsonResponse(data);
  } catch (error) {
    return jsonResponse<ErrorResponse>(
      { 
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      500
    );
  }
};

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();
  
  // 型ガードを使用したバリデーション
  if (!isValidRequestBody(body)) {
    return jsonResponse<ErrorResponse>(
      { error: 'Invalid request body', code: 'VALIDATION_ERROR' },
      400
    );
  }
  
  const result = await processRequest(body);
  return jsonResponse(result, 201);
};
```

## 型ユーティリティ

プロジェクト全体で使用する共通の型定義やユーティリティ型を作成します。

### 便利な型定義

```typescript
// lib/types.ts

// APIレスポンス型
export type ApiResponse<T> = 
  | { success: true; data: T }
  | { success: false; error: string; code?: string };

// フォームエラー型
export type FormErrors<T> = {
  [K in keyof T]?: string | string[];
};

// Nullable型
export type Nullable<T> = T | null | undefined;

// DeepPartial型
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object 
    ? DeepPartial<T[P]> 
    : T[P];
};

// DeepReadonly型
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object
    ? DeepReadonly<T[P]>
    : T[P];
};

// 非同期関数の戻り値型を抽出
export type AsyncReturnType<T extends (...args: any[]) => Promise<any>> =
  T extends (...args: any[]) => Promise<infer R> ? R : never;

// オブジェクトのキーを文字列リテラル型として取得
export type StringKeys<T> = Extract<keyof T, string>;

// 特定のプロパティを必須にする
export type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
```

### 実践的な型ヘルパー

```typescript
// 型安全なオブジェクトキー取得
export function objectKeys<T extends object>(obj: T): (keyof T)[] {
  return Object.keys(obj) as (keyof T)[];
}

// 型安全なオブジェクトエントリー
export function objectEntries<T extends object>(obj: T): [keyof T, T[keyof T]][] {
  return Object.entries(obj) as [keyof T, T[keyof T]][];
}

// 型述語を使用した配列フィルター
export function isDefined<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null;
}

// 使用例
const values = [1, undefined, 2, null, 3];
const filtered = values.filter(isDefined); // number[]

// Exhaustive check
export function exhaustiveCheck(value: never): never {
  throw new Error(`Unhandled case: ${value}`);
}

// 使用例
type Status = 'pending' | 'success' | 'error';

function handleStatus(status: Status) {
  switch (status) {
    case 'pending':
      return 'Loading...';
    case 'success':
      return 'Complete!';
    case 'error':
      return 'Failed!';
    default:
      return exhaustiveCheck(status); // コンパイルエラーになる
  }
}
```

## 実践例：完全な型安全コンポーネント

複数の高度なパターンを組み合わせた実践的な例です。

```svelte
<!-- SearchableTable.svelte -->
<script lang="ts" generics="T extends { id: string }">
  import { createEventDispatcher } from 'svelte';
  import type { Snippet } from 'svelte';
  
  // 高度な型定義
  interface Column<T> {
    key: keyof T;
    label: string;
    sortable?: boolean;
    searchable?: boolean;
    render?: (value: T[keyof T], item: T) => string;
    width?: string;
  }
  
  interface Props<T> {
    data: T[];
    columns: Column<T>[];
    searchable?: boolean;
    sortable?: boolean;
    pageSize?: number;
    onRowClick?: (item: T) => void;
    onSelectionChange?: (selected: T[]) => void;
    rowSlot?: Snippet<[T, number]>;
  }
  
  // Props
  let {
    data,
    columns,
    searchable = true,
    sortable = true,
    pageSize = 10,
    onRowClick,
    onSelectionChange,
    rowSlot
  }: Props<T> = $props();
  
  // 状態管理
  let searchQuery = $state('');
  let sortColumn = $state<keyof T | null>(null);
  let sortDirection = $state<'asc' | 'desc'>('asc');
  let currentPage = $state(0);
  let selected = $state<Set<string>>(new Set());
  
  // 派生値（高度な型推論）
  let filteredData = $derived(() => {
    if (!searchQuery) return data;
    
    const searchableColumns = columns
      .filter(col => col.searchable !== false)
      .map(col => col.key);
    
    return data.filter(item =>
      searchableColumns.some(key => {
        const value = item[key];
        if (typeof value === 'string') {
          return value.toLowerCase().includes(searchQuery.toLowerCase());
        }
        return false;
      })
    );
  });
  
  let sortedData = $derived(() => {
    if (!sortColumn) return filteredData();
    
    return [...filteredData()].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];
      
      if (aVal === bVal) return 0;
      
      const comparison = aVal < bVal ? -1 : 1;
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  });
  
  let paginatedData = $derived(() => {
    const start = currentPage * pageSize;
    const end = start + pageSize;
    return sortedData().slice(start, end);
  });
  
  let totalPages = $derived(
    Math.ceil(sortedData().length / pageSize)
  );
  
  let selectedItems = $derived(
    data.filter(item => selected.has(item.id))
  );
  
  // イベントディスパッチ
  const dispatch = createEventDispatcher<{
    sort: { column: keyof T; direction: 'asc' | 'desc' };
    search: { query: string };
    pageChange: { page: number };
  }>();
  
  // ハンドラー
  function handleSort(column: keyof T) {
    if (!sortable) return;
    
    if (sortColumn === column) {
      sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      sortColumn = column;
      sortDirection = 'asc';
    }
    
    dispatch('sort', { column, direction: sortDirection });
  }
  
  function handleSelectAll(event: Event & {
    currentTarget: HTMLInputElement
  }) {
    if (event.currentTarget.checked) {
      paginatedData().forEach(item => selected.add(item.id));
    } else {
      paginatedData().forEach(item => selected.delete(item.id));
    }
    selected = selected; // リアクティビティのトリガー
    onSelectionChange?.(selectedItems());
  }
  
  function handleSelectItem(id: string) {
    if (selected.has(id)) {
      selected.delete(id);
    } else {
      selected.add(id);
    }
    selected = selected;
    onSelectionChange?.(selectedItems());
  }
  
  // エフェクト
  $effect(() => {
    currentPage = 0; // 検索やソート時にページをリセット
  });
</script>

<div class="table-container">
  {#if searchable}
    <input
      type="search"
      bind:value={searchQuery}
      placeholder="検索..."
      class="search-input"
    />
  {/if}
  
  <table>
    <thead>
      <tr>
        <th>
          <input
            type="checkbox"
            onchange={handleSelectAll}
            checked={paginatedData().every(item => selected.has(item.id))}
          />
        </th>
        {#each columns as column}
          <th
            class:sortable={sortable && column.sortable !== false}
            style:width={column.width}
            onclick={() => handleSort(column.key)}
          >
            {column.label}
            {#if sortColumn === column.key}
              <span class="sort-indicator">
                {sortDirection === 'asc' ? '▲' : '▼'}
              </span>
            {/if}
          </th>
        {/each}
      </tr>
    </thead>
    <tbody>
      {#each paginatedData() as item, index (item.id)}
        <tr
          class:selected={selected.has(item.id)}
          onclick={() => onRowClick?.(item)}
        >
          <td>
            <input
              type="checkbox"
              checked={selected.has(item.id)}
              onchange={() => handleSelectItem(item.id)}
            />
          </td>
          {#if rowSlot}
            {@render rowSlot(item, index)}
          {:else}
            {#each columns as column}
              <td>
                {column.render
                  ? column.render(item[column.key], item)
                  : item[column.key]}
              </td>
            {/each}
          {/if}
        </tr>
      {/each}
    </tbody>
  </table>
  
  {#if totalPages > 1}
    <div class="pagination">
      <button
        disabled={currentPage === 0}
        onclick={() => currentPage--}
      >
        前へ
      </button>
      <span>{currentPage + 1} / {totalPages}</span>
      <button
        disabled={currentPage === totalPages - 1}
        onclick={() => currentPage++}
      >
        次へ
      </button>
    </div>
  {/if}
</div>

<style>
  .table-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  .search-input {
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
  }
  
  th, td {
    padding: 0.5rem;
    text-align: left;
    border-bottom: 1px solid #eee;
  }
  
  th.sortable {
    cursor: pointer;
    user-select: none;
  }
  
  th.sortable:hover {
    background-color: #f5f5f5;
  }
  
  .sort-indicator {
    margin-left: 0.25rem;
    font-size: 0.8em;
  }
  
  tr.selected {
    background-color: #e3f2fd;
  }
  
  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    margin-top: 1rem;
  }
  
  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
```

## まとめ

このページでは、Svelte 5とTypeScriptを組み合わせた高度な型定義パターンとベストプラクティスを紹介しました：

- **TypeScriptの基本概念** - ジェネリクス、型ガード、型の絞り込み
- **高度な型機能** - マップ型、テンプレートリテラル型、条件型
- **Svelte特有のパターン** - リアクティブストア、ジェネリックコンポーネント
- **SvelteKitの高度な型定義** - Load関数、Actions、APIエンドポイント
- **型ユーティリティ** - 再利用可能な型定義とヘルパー
- **実践例** - 複数のパターンを組み合わせた実装

これらのパターンを習得することで、型安全性を最大限に活用し、バグの少ない堅牢なアプリケーションを構築できます。

## 次のステップ

TypeScriptの高度なパターンを理解したら、実際のプロジェクトで活用してみましょう。

- [なぜTypeScriptが必要か](/introduction/why-typescript/) - TypeScriptの重要性を再確認
- [TypeScript設定](/introduction/typescript-setup/) - プロジェクトの最適な設定
- [TypeScript統合](/svelte-basics/typescript-integration/) - 基本的な使い方の復習