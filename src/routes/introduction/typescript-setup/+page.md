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

### TypeScriptの基本概念

TypeScriptを使いこなすために理解しておくべき基本概念を紹介します。

#### 型アノテーション

変数や関数に型を明示的に指定する方法：

```typescript
// 基本的な型
let name: string = "太郎";
let age: number = 25;
let isActive: boolean = true;

// 配列
let numbers: number[] = [1, 2, 3];
let names: Array<string> = ["太郎", "花子"];

// オブジェクト
let user: { name: string; age: number } = {
  name: "太郎",
  age: 25
};

// 関数
function add(a: number, b: number): number {
  return a + b;
}

// アロー関数
const multiply = (a: number, b: number): number => a * b;
```

#### インターフェースと型エイリアス

複雑な型を定義する2つの方法：

```typescript
// インターフェース（拡張可能）
interface User {
  id: string;
  name: string;
  email: string;
  age?: number; // オプショナル
}

// 型エイリアス（ユニオン型などに便利）
type Status = "active" | "inactive" | "pending";
type ID = string | number;

// インターフェースの拡張
interface Admin extends User {
  role: "admin";
  permissions: string[];
}

// 交差型
type Employee = User & {
  employeeId: string;
  department: string;
};
```

#### ジェネリクス

型を抽象化して再利用可能にする：

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

#### 型ガードと型の絞り込み

実行時に型を安全に判定する：

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
function isUser(obj: any): obj is User {
  return obj && typeof obj.name === "string" && typeof obj.email === "string";
}
```

### なぜTypeScriptが必要か

モダンなWebアプリケーション開発において、TypeScriptは必須のツールとなっています。特にSvelte 5では、新しいRunesシステムと組み合わせることで、より堅牢で保守しやすいコードを書くことができます。

```typescript
// JavaScript（型なし）
let count = 0;
function increment(value) {
  return value + 1;  // valueが文字列でもエラーにならない
}

// TypeScript（型あり）
let count: number = 0;
function increment(value: number): number {
  return value + 1;  // 数値以外はコンパイル時にエラー
}
```

### Svelte 5とTypeScriptの相性

Svelte 5は、TypeScriptとの統合が大幅に改善されました：

1. **Runesの型推論** - `$state`、`$derived`などが正確に型推論される
2. **Props型の強化** - コンポーネント間のデータ受け渡しが型安全に
3. **ビルトイン型定義** - SvelteKitの型定義が自動生成される
4. **エディタサポート** - VS CodeなどのIDEで優れた開発体験

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

## プロジェクトのセットアップ

### 新規プロジェクトの作成

SvelteKitプロジェクトを作成する際、TypeScriptテンプレートを選択します：

```bash
npm create svelte@latest my-app
# 以下のオプションを選択
# - Skeleton project
# - Yes, using TypeScript syntax
# - Add ESLint for code linting? Yes
# - Add Prettier for code formatting? Yes
```

### 既存プロジェクトへのTypeScript追加

既存のJavaScriptプロジェクトにTypeScriptを追加する場合：

```bash
# 必要なパッケージをインストール
npm install -D typescript tslib @tsconfig/svelte

# tsconfig.jsonを作成
npx tsc --init

# .jsファイルを.tsに変更
# .svelteファイルにlang="ts"を追加
```

## TypeScriptの高度な機能

### マップ型とユーティリティ型

TypeScriptの組み込み型を活用した型変換：

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
```

### テンプレートリテラル型

文字列リテラル型を動的に生成：

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
```

### 条件型とinfer

型レベルでの条件分岐：

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
```

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

## 実践的な型定義パターン

### コンポーネントの型エクスポート

コンポーネントの型を他のファイルで使用する場合：

```typescript
// Button.svelte
<script lang="ts">
  export type ButtonProps = {
    variant?: 'primary' | 'secondary' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    onClick?: (event: MouseEvent) => void;
  };

  let { 
    variant = 'primary',
    size = 'md',
    disabled = false,
    onClick
  }: ButtonProps = $props();
</script>
```

```typescript
// 他のファイルで使用
import type { ButtonProps } from './Button.svelte';

const buttonConfig: ButtonProps = {
  variant: 'primary',
  size: 'lg'
};
```

### 条件付き型定義

プロパティによって型が変わる場合：

```typescript
type Props = {
  mode: 'view';
  data: string;
} | {
  mode: 'edit';
  data: string;
  onChange: (value: string) => void;
};

let props: Props = $props();

// TypeScriptが自動的に型を絞り込む
if (props.mode === 'edit') {
  props.onChange('new value'); // OK
}
```

### ジェネリック型を使ったコンポーネント

```typescript
// List.svelte
<script lang="ts" generics="T">
  type Props<T> = {
    items: T[];
    renderItem: (item: T) => string;
    onSelect?: (item: T) => void;
  };

  let { items, renderItem, onSelect }: Props<T> = $props();
</script>

{#each items as item}
  <div on:click={() => onSelect?.(item)}>
    {renderItem(item)}
  </div>
{/each}
```

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

### 4. 非同期処理の型

```typescript
// ❌ Promise<any>になる
async function fetchData() {
  const response = await fetch('/api/data');
  return response.json();
}

// ✅ 正しい型定義
async function fetchData(): Promise<Data[]> {
  const response = await fetch('/api/data');
  return response.json() as Promise<Data[]>;
}
```

### 5. カスタムイベントの型

```typescript
// ❌ detailの型が不明
function dispatch(name, detail) {
  // ...
}

// ✅ 型安全なイベントディスパッチ
import { createEventDispatcher } from 'svelte';

type Events = {
  save: { id: string; data: FormData };
  cancel: null;
  change: string;
};

const dispatch = createEventDispatcher<Events>();

// 使用時に型チェックが効く
dispatch('save', { id: '123', data: formData }); // OK
dispatch('save', { id: 123 }); // エラー: idはstring型である必要がある
```

## パフォーマンスとTypeScript

### 型チェックの最適化

大規模プロジェクトでの型チェックを高速化する設定：

```typescript
// tsconfig.json
// compilerOptionsの設定例
// incremental: true - インクリメンタルビルド有効化
// tsBuildInfoFile: ".tsbuildinfo" - ビルド情報ファイル
// skipLibCheck: true - 型定義ファイルのチェックをスキップ
// skipDefaultLibCheck: true - デフォルトライブラリのチェックをスキップ
```

### ビルド時の型チェック

```bash
# package.jsonのscripts設定例
npm run check       # svelte-kit sync && svelte-check --tsconfig ./tsconfig.json
npm run check:watch # 監視モード
npm run build       # 型チェック後にビルド
```

## トラブルシューティング

### よくある問題と解決策

#### 1. 型定義ファイルが見つからない

```bash
# 型定義を再生成
npm run svelte-kit sync
```

#### 2. VS Codeで型エラーが表示されない

```bash
# TypeScriptバージョンの確認
npx tsc --version

# VS CodeでワークスペースのTypeScriptを使用
# Cmd/Ctrl + Shift + P → "TypeScript: Select TypeScript Version"
```

#### 3. $app/pathsなどのインポートエラー

```typescript
// tsconfig.jsonの確認
// "extends": "./.svelte-kit/tsconfig.json" が必須
// この設定により、SvelteKitの型定義が読み込まれる
```

## 推奨リソース

### 学習リソース

- [TypeScript公式ドキュメント](https://www.typescriptlang.org/docs/)
- [Svelte TypeScript Guide](https://svelte.dev/docs/typescript)
- [SvelteKit Types Documentation](https://kit.svelte.dev/docs/types)

### 型定義ライブラリ

```bash
# よく使う型定義
npm install -D @types/node
npm install -D @types/cookie
npm install -D @types/markdown-it
```

## Svelteコンポーネントの実践的なTypeScript

### 完全な型安全コンポーネントの例

実際のプロジェクトで使える、完全に型定義されたコンポーネントの例：

```typescript
<!-- UserCard.svelte -->
<script lang="ts">
  import type { ComponentEvents } from 'svelte';
  
  // ユーザーの型定義
  interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role: 'admin' | 'user' | 'guest';
    createdAt: Date;
  }
  
  // コンポーネントのProps
  type Props = {
    user: User;
    showDetails?: boolean;
    editable?: boolean;
    onEdit?: (user: User) => void;
    onDelete?: (id: string) => Promise<void>;
  };
  
  let { 
    user,
    showDetails = false,
    editable = false,
    onEdit,
    onDelete
  }: Props = $props();
  
  // 内部状態
  let isDeleting = $state(false);
  let error = $state<string | null>(null);
  
  // 派生値
  let roleLabel = $derived(() => {
    const labels: Record<User['role'], string> = {
      admin: '管理者',
      user: 'ユーザー',
      guest: 'ゲスト'
    };
    return labels[user.role];
  });
  
  // 非同期ハンドラ
  async function handleDelete() {
    if (!onDelete) return;
    
    isDeleting = true;
    error = null;
    
    try {
      await onDelete(user.id);
    } catch (err) {
      error = err instanceof Error ? err.message : '削除に失敗しました';
    } finally {
      isDeleting = false;
    }
  }
  
  // イベントハンドラ
  function handleEdit(event: MouseEvent) {
    event.preventDefault();
    onEdit?.(user);
  }
</script>

<div class="user-card">
  <img src={user.avatar ?? '/default-avatar.png'} alt={user.name} />
  <h3>{user.name}</h3>
  <span class="role">{roleLabel()}</span>
  
  {#if showDetails}
    <p>{user.email}</p>
    <time>{user.createdAt.toLocaleDateString()}</time>
  {/if}
  
  {#if editable}
    <button onclick={handleEdit}>編集</button>
    <button 
      onclick={handleDelete} 
      disabled={isDeleting}
    >
      {isDeleting ? '削除中...' : '削除'}
    </button>
  {/if}
  
  {#if error}
    <p class="error">{error}</p>
  {/if}
</div>
```

### フォーム処理の型定義

フォームを扱う際の型安全な実装：

```typescript
<!-- ContactForm.svelte -->
<script lang="ts">
  import { z } from 'zod';
  
  // Zodスキーマで入力値を検証
  const contactSchema = z.object({
    name: z.string().min(1, '名前は必須です'),
    email: z.string().email('有効なメールアドレスを入力してください'),
    subject: z.string().min(1, '件名は必須です'),
    message: z.string().min(10, 'メッセージは10文字以上必要です')
  });
  
  // フォームデータの型
  type ContactData = z.infer<typeof contactSchema>;
  
  // フォームエラーの型
  type FormErrors = Partial<Record<keyof ContactData, string>>;
  
  // Props
  type Props = {
    onSubmit: (data: ContactData) => Promise<void>;
  };
  
  let { onSubmit }: Props = $props();
  
  // フォームの状態
  let formData = $state<ContactData>({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  let errors = $state<FormErrors>({});
  let isSubmitting = $state(false);
  
  // バリデーション
  function validate(): boolean {
    try {
      contactSchema.parse(formData);
      errors = {};
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        errors = err.errors.reduce((acc, curr) => {
          const key = curr.path[0] as keyof ContactData;
          acc[key] = curr.message;
          return acc;
        }, {} as FormErrors);
      }
      return false;
    }
  }
  
  // 送信処理
  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    
    if (!validate()) return;
    
    isSubmitting = true;
    try {
      await onSubmit(formData);
      // 成功時はフォームをリセット
      formData = { name: '', email: '', subject: '', message: '' };
    } catch (err) {
      console.error('送信エラー:', err);
    } finally {
      isSubmitting = false;
    }
  }
</script>

<form onsubmit={handleSubmit}>
  <label>
    名前
    <input 
      bind:value={formData.name}
      class:error={errors.name}
    />
    {#if errors.name}
      <span class="error-message">{errors.name}</span>
    {/if}
  </label>
  
  <!-- 他のフィールドも同様に実装 -->
  
  <button type="submit" disabled={isSubmitting}>
    {isSubmitting ? '送信中...' : '送信'}
  </button>
</form>
```

## まとめ

TypeScriptを使うことで、Svelte 5アプリケーションの品質と保守性が大幅に向上します。最初は型定義に時間がかかるかもしれませんが、長期的には開発効率が向上し、バグの少ない堅牢なアプリケーションを構築できます。

特にSvelte 5のRunesシステムは、TypeScriptとの相性が抜群です。型推論が強化され、より少ない型定義で安全なコードが書けるようになりました。

### TypeScript導入のベストプラクティス

1. **段階的に導入** - 最初から完璧を目指さず、徐々に型定義を強化
2. **strictモードを有効に** - 最初から厳密な型チェックを使用
3. **型定義ファイルを活用** - @typesパッケージや自作の.d.tsファイル
4. **inferを活用** - 型推論に任せられる部分は任せる
5. **ユーティリティ型の活用** - Partial、Pick、Omitなどを使いこなす

## 次のステップ

TypeScriptの設定が完了したら、[基礎編](/basics/)でSvelte 5のRunesシステムを学びましょう。TypeScriptの型定義を活用しながら、実践的なコンポーネントを作成していきます。