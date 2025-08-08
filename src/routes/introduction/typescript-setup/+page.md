---
title: TypeScript設定
description: Svelte 5とSvelteKitでTypeScriptを最大限活用する設定
---

## TypeScriptの重要性

Svelte 5でTypeScriptを使用することで、以下のメリットが得られます。

- **型安全性** - コンパイル時にエラーを検出
- **IDE支援** - 自動補完とリファクタリング
- **ドキュメント** - 型定義がそのままドキュメントに
- **保守性** - 大規模プロジェクトでも安心

## tsconfig.json の設定

### 推奨設定

`tsconfig.json` ファイルの推奨設定

#### 基本設定
- **extends**: "./.svelte-kit/tsconfig.json"
- **compilerOptions**:
  - **厳密な型チェック**
    - strict: true
    - strictNullChecks: true
    - strictFunctionTypes: true
    - strictBindCallApply: true
    - strictPropertyInitialization: true
    - noImplicitThis: true
    - alwaysStrict: true
  - **追加の型チェック**
    - noUnusedLocals: true
    - noUnusedParameters: true
    - noImplicitReturns: true
    - noFallthroughCasesInSwitch: true
    - noUncheckedIndexedAccess: true
  - **モジュール解決**
    - moduleResolution: "bundler"
    - target: "ESNext"
    - module: "ESNext"
  - **パスエイリアス**
    - paths: $lib → ./src/lib, $lib/* → ./src/lib/*
- **include**: ["src/**/*.ts", "src/**/*.svelte"]

## Svelte 5での型定義

### Propsの型定義

```typescript
// Component.svelte 内のスクリプト部分
type Props = {
  title: string;
  count?: number;
  onClose?: () => void;
};

let { 
  title, 
  count = 0,
  onClose
}: Props = $props();
```

### Bindableプロップス

```typescript
type Props = {
  value: $bindable<string>;
  checked?: $bindable<boolean>;
};

let { 
  value = $bindable(''),
  checked = $bindable(false)
}: Props = $props();
```

### イベントハンドラの型

```typescript
// クリックイベント
function handleClick(event: MouseEvent & { 
  currentTarget: HTMLButtonElement 
}) {
  console.log(event.currentTarget.dataset.id);
}

// フォームイベント
function handleSubmit(event: SubmitEvent & {
  currentTarget: HTMLFormElement
}) {
  const formData = new FormData(event.currentTarget);
}
```

## リアクティブストア (.svelte.ts)

### 基本的なストア

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
```

### ジェネリックストア

```typescript
// store.svelte.ts
export function createStore<T>(initial: T) {
  let value = $state(initial);
  
  return {
    get current() { return value; },
    set(newValue: T) { value = newValue; },
    update(fn: (value: T) => T) { 
      value = fn(value); 
    }
  };
}

// 使用例
const userStore = createStore<User>({
  id: '',
  name: '',
  email: ''
});
```

## SvelteKitの型定義

### Load関数

```typescript
// +page.ts
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, fetch }) => {
  const response = await fetch(`/api/posts/${params.id}`);
  const post: Post = await response.json();
  
  return {
    post
  };
};
```

### Actions

```typescript
// +page.server.ts
import type { Actions } from './$types';

export const actions: Actions = {
  create: async ({ request }) => {
    const formData = await request.formData();
    const title = formData.get('title');
    
    if (typeof title !== 'string' || !title) {
      return {
        success: false,
        errors: { title: 'タイトルは必須です' }
      };
    }
    
    // 処理...
    return { success: true };
  }
};
```

### APIエンドポイント

```typescript
// +server.ts
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, url }) => {
  const page = Number(url.searchParams.get('page') ?? 1);
  const data = await fetchData(page);
  
  return new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json'
    }
  });
};

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();
  
  // バリデーション
  if (!isValidData(body)) {
    return new Response('Bad Request', { status: 400 });
  }
  
  // 処理...
  return new Response('Created', { status: 201 });
};
```

## グローバル型定義

### app.d.ts

```typescript
// src/app.d.ts
declare global {
  namespace App {
    interface Error {
      message: string;
      code?: string;
    }
    
    interface Locals {
      user?: {
        id: string;
        name: string;
        role: 'admin' | 'user';
      };
    }
    
    interface PageData {
      flash?: {
        type: 'success' | 'error';
        message: string;
      };
    }
    
    interface PageState {
      selected?: string;
    }
    
    interface Platform {}
  }
}

export {};
```

## 型ユーティリティ

### 便利な型定義

```typescript
// lib/types.ts

// APIレスポンス型
export type ApiResponse<T> = 
  | { success: true; data: T }
  | { success: false; error: string };

// フォームエラー型
export type FormErrors<T> = {
  [K in keyof T]?: string;
};

// Nullable型
export type Nullable<T> = T | null | undefined;

// DeepPartial型
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object 
    ? DeepPartial<T[P]> 
    : T[P];
};
```

## VSCode設定

### .vscode/settings.json

#### VS Codeの推奨設定

- **typescript.tsdk**: "node_modules/typescript/lib"
- **typescript.enablePromptUseWorkspaceTsdk**: true
- **svelte.enable-ts-plugin**: true
- **[svelte] editor.defaultFormatter**: "svelte.svelte-vscode"
- **typescript.preferences.importModuleSpecifier**: "relative"
- **typescript.preferences.quoteStyle**: "single"

## よくある型エラーと解決法

### 1. $props()の型エラー

```typescript
// ❌ エラー
let props = $props();

// ✅ 正しい
type Props = { /* ... */ };
let props: Props = $props();
```

### 2. $stateの型推論

```typescript
// ❌ 型が any[] になる
let items = $state([]);

// ✅ 正しい型定義
let items = $state<Item[]>([]);
```

### 3. イベントハンドラの型

```typescript
// ❌ event の型が any
function handleInput(event) {
  console.log(event.target.value);
}

// ✅ 正しい型定義
function handleInput(event: Event & {
  currentTarget: HTMLInputElement
}) {
  console.log(event.currentTarget.value);
}
```

## 次のステップ

TypeScriptの設定が完了したら、[基礎編](/basics/)でSvelte 5のRunesシステムを学びましょう。