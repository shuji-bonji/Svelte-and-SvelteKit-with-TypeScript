---
title: TypeScript設定
description: Svelte 5とSvelteKitでTypeScriptを最大限活用する設定
---

## TypeScriptの重要性

現代のWebアプリケーション開発において、TypeScriptは単なる選択肢ではなく、プロジェクトの成功を左右する重要な要素となっています。特にSvelte 5では、TypeScriptとの統合が設計の中核に据えられており、開発者により良い体験を提供します。

Svelte 5でTypeScriptを使用することで、以下のメリットが得られます。

- **型安全性** - コンパイル時にエラーを検出
- **IDE支援** - 自動補完とリファクタリング
- **ドキュメント** - 型定義がそのままドキュメントに
- **保守性** - 大規模プロジェクトでも安心

### TypeScriptの基本概念

TypeScriptを使いこなすために理解しておくべき基本概念を紹介します。

#### 型アノテーション

変数や関数に型を明示的に指定する方法です。TypeScriptの最も基本的な機能であり、コードの意図を明確にし、予期しない型の値が渡されることを防ぎます。型アノテーションにより、開発時点でエラーを検出し、実行時のバグを大幅に削減できます。

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

複雑な型を定義する2つの方法を理解することで、より構造化されたコードを書くことができます。インターフェースは主にオブジェクトの形状を定義し、拡張可能性を持ちます。一方、型エイリアスはユニオン型や交差型など、より柔軟な型定義に適しています。適切に使い分けることで、保守性の高いコードベースを構築できます。

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

型を抽象化して再利用可能にする強力な機能です。ジェネリクスを使用することで、型の安全性を保ちながら、様々な型に対応できる汎用的な関数やクラスを作成できます。これにより、コードの重複を避けつつ、型チェックの恩恵を最大限に受けることができます。

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

実行時に型を安全に判定する仕組みです。TypeScriptは静的型チェックを行いますが、実行時には型情報が失われます。型ガードを使用することで、実行時でも型を安全に絞り込み、その型特有のプロパティやメソッドにアクセスできます。これは特に、外部APIからのデータやユーザー入力を扱う際に重要です。

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

モダンなWebアプリケーション開発において、TypeScriptは必須のツールとなっています。JavaScriptの動的な性質は開発の初期段階では柔軟性をもたらしますが、プロジェクトが成長するにつれて、型の不整合によるバグが増加し、メンテナンスコストが上昇します。TypeScriptはこれらの問題を根本的に解決します。特にSvelte 5では、新しいRunesシステムと組み合わせることで、より堅牢で保守しやすいコードを書くことができます。

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

Svelte 5は、TypeScriptとの統合が大幅に改善されました。従来のバージョンでは、TypeScriptサポートは後付けの機能でしたが、Svelte 5では設計段階からTypeScriptを考慮して開発されています。この結果、より自然で直感的な型定義が可能になり、開発者の生産性が向上しました。

1. **Runesの型推論** - `$state`、`$derived`などが正確に型推論される
2. **Props型の強化** - コンポーネント間のデータ受け渡しが型安全に
3. **ビルトイン型定義** - SvelteKitの型定義が自動生成される
4. **エディタサポート** - VS CodeなどのIDEで優れた開発体験

## tsconfig.json の設定

TypeScriptプロジェクトの心臓部となる`tsconfig.json`は、コンパイラの動作を制御する重要な設定ファイルです。適切な設定により、型チェックの厳密さ、モジュール解決の方法、出力されるJavaScriptのバージョンなどを細かく制御できます。

### 推奨設定

Svelte 5プロジェクトに最適化された`tsconfig.json`の推奨設定を以下に示します。これらの設定は、型安全性を最大化しつつ、Svelteの機能を最大限に活用できるように調整されています。

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

SvelteKitプロジェクトを作成する際、TypeScriptテンプレートを選択します。最新のCLIツールは、TypeScriptの設定を自動的に最適化し、必要な型定義ファイルも同時にインストールします。これにより、すぐに型安全な開発を始めることができます。

```bash
npm create svelte@latest my-app
# 以下のオプションを選択
# - Skeleton project
# - Yes, using TypeScript syntax
# - Add ESLint for code linting? Yes
# - Add Prettier for code formatting? Yes
```

### 既存プロジェクトへのTypeScript追加

既存のJavaScriptプロジェクトにTypeScriptを追加する場合の手順です。段階的な移行が可能で、まずは`.js`ファイルを`.ts`に変更し、徐々に型定義を追加していくことができます。この漸進的なアプローチにより、既存のコードベースを壊すことなく、TypeScriptの恩恵を受けられます。

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

TypeScriptの組み込み型を活用した型変換の手法です。ユーティリティ型は、既存の型から新しい型を導出する強力な機能を提供します。これらを活用することで、型定義の重複を避け、一貫性のある型システムを構築できます。また、型の変更が必要な場合も、元の型定義を変更するだけで、派生型も自動的に更新されます。

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

文字列リテラル型を動的に生成する高度な機能です。テンプレートリテラル型により、文字列の組み合わせパターンを型レベルで表現できます。これは、CSSクラス名やAPIエンドポイントなど、特定のパターンに従う文字列を扱う際に特に有用です。コンパイル時にパターンの妥当性をチェックできるため、タイポや不正な文字列の使用を防げます。

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

型レベルでの条件分岐を実現する強力な機能です。条件型を使用することで、型の値に応じて異なる型を返すことができます。`infer`キーワードと組み合わせることで、複雑な型から特定の部分を抽出することも可能です。これらの機能は、ライブラリの型定義を作成する際や、複雑な型変換を行う際に不可欠です。

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

Svelte 5では、新しいRunesシステムと共に型定義の方法も進化しました。コンポーネントの型安全性を確保するための基本的なパターンを見ていきましょう。

### Propsの型定義

コンポーネントのプロパティは`$props()`ルーンを使用して定義します。TypeScriptの型定義により、親コンポーネントから渡されるデータの型を厳密にチェックできます。

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

双方向バインディングを可能にする`$bindable`は、親子コンポーネント間でデータを同期させる際に使用します。子コンポーネントから親コンポーネントの値を直接更新できるようになります。

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

Svelteコンポーネントでイベントを扱う際は、適切な型定義により、イベントオブジェクトのプロパティに安全にアクセスできます。`currentTarget`を使用することで、イベントが発生した要素を確実に参照できます。

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

Svelte 5では、`.svelte.ts`ファイルを使用してリアクティブなストアを作成できます。これは従来のストアAPIの代替として、より直感的でTypeScriptフレンドリーな方法です。

### 基本的なストア

リアクティブストアは、複数のコンポーネント間で状態を共有する際に使用します。`$state`ルーンをファイル内で使用することで、自動的にリアクティブな値を作成できます。

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

ジェネリクスを使用することで、様々な型のデータを扱える汎用的なストアを作成できます。これにより、コードの再利用性が向上し、型安全性も保たれます。

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

SvelteKitは、自動的に型定義を生成する強力な型システムを持っています。`$types`から型をインポートすることで、各ルートに特有の型を使用できます。

### Load関数

Load関数は、ページレンダリング前にデータを取得するために使用されます。`PageLoad`型を使用することで、パラメータや戻り値の型が自動的に推論されます。

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

Actionsは、フォーム送信を処理するサーバーサイドの関数です。`Actions`型を使用することで、フォームデータの処理とレスポンスの型が保証されます。

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

`+server.ts`ファイルでAPIエンドポイントを定義する際、`RequestHandler`型を使用してHTTPメソッドごとの処理を型安全に実装できます。

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

アプリケーション全体で使用する型定義は、`app.d.ts`ファイルで管理します。これにより、SvelteKitの名前空間を拡張して、カスタムの型を追加できます。

### app.d.ts

`app.d.ts`ファイルは、SvelteKitアプリケーションのグローバルな型定義を行う特別なファイルです。ここで定義した型は、アプリケーション全体で使用できます。

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

プロジェクト全体で使用する共通の型定義やユーティリティ型を作成することで、コードの一貫性と保守性が向上します。

### 便利な型定義

よく使用するパターンを型として定義しておくことで、開発効率が向上し、型の重複を避けることができます。

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

VS CodeでSvelteとTypeScriptの開発体験を最適化するための設定を行います。適切な設定により、自動補完、型チェック、フォーマッティングが改善されます。

### .vscode/settings.json

プロジェクトルートに`.vscode/settings.json`ファイルを作成し、プロジェクト固有の設定を定義します。

#### VS Codeの推奨設定

- **typescript.tsdk**: "node_modules/typescript/lib"
- **typescript.enablePromptUseWorkspaceTsdk**: true
- **svelte.enable-ts-plugin**: true
- **[svelte] editor.defaultFormatter**: "svelte.svelte-vscode"
- **typescript.preferences.importModuleSpecifier**: "relative"
- **typescript.preferences.quoteStyle**: "single"

## 実践的な型定義パターン

### コンポーネントの型エクスポート

コンポーネントの型を他のファイルで使用する場合

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

プロパティによって型が変わる場合

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

Svelte 5では、コンポーネント自体にジェネリクスを適用できます。これにより、様々な型のデータを扱える汎用的なコンポーネントを作成できます。

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

Svelte 5とTypeScriptを使用する際によく遭遇する型エラーとその解決方法を紹介します。これらのパターンを理解することで、効率的にデバッグできます。

### 1. $props()の型エラー

`$props()`を使用する際は、必ず型定義を明示的に指定する必要があります。

```typescript
// ❌ エラー
let props = $props();

// ✅ 正しい
type Props = { /* ... */ };
let props: Props = $props();
```

### 2. $stateの型推論

空配列を初期値とする場合、TypeScriptは型を推論できないため、明示的な型指定が必要です。

```typescript
// ❌ 型が any[] になる
let items = $state([]);

// ✅ 正しい型定義
let items = $state<Item[]>([]);
```

### 3. イベントハンドラの型

イベントハンドラでは、イベントオブジェクトと対象要素の型を正確に指定することが重要です。

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

非同期関数の戻り値は`Promise`型になるため、適切な型定義が必要です。

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

Svelteのカスタムイベントシステムを型安全に使用するには、イベントの型を事前に定義します。

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

大規模プロジェクトでの型チェックを高速化する設定

```typescript
// tsconfig.json
// compilerOptionsの設定例
// incremental: true - インクリメンタルビルド有効化
// tsBuildInfoFile: ".tsbuildinfo" - ビルド情報ファイル
// skipLibCheck: true - 型定義ファイルのチェックをスキップ
// skipDefaultLibCheck: true - デフォルトライブラリのチェックをスキップ
```

### ビルド時の型チェック

開発中だけでなく、ビルド時にも型チェックを実行することで、本番環境へのデプロイ前に型エラーを検出できます。

```bash
# package.jsonのscripts設定例
npm run check       # svelte-kit sync && svelte-check --tsconfig ./tsconfig.json
npm run check:watch # 監視モード
npm run build       # 型チェック後にビルド
```

## トラブルシューティング

TypeScriptとSvelteを使用する際に遭遇する可能性のある問題と、その解決方法を紹介します。

### よくある問題と解決策

#### 1. 型定義ファイルが見つからない

SvelteKitが生成する型定義ファイルが見つからない場合の対処法です。

```bash
# 型定義を再生成
npm run svelte-kit sync
```

#### 2. VS Codeで型エラーが表示されない

VS Codeが正しくTypeScriptを認識していない場合の解決方法です。

```bash
# TypeScriptバージョンの確認
npx tsc --version

# VS CodeでワークスペースのTypeScriptを使用
# Cmd/Ctrl + Shift + P → "TypeScript: Select TypeScript Version"
```

#### 3. $app/pathsなどのインポートエラー

SvelteKitの特殊なモジュールがインポートできない場合の対処法です。

```typescript
// tsconfig.jsonの確認
// "extends": "./.svelte-kit/tsconfig.json" が必須
// この設定により、SvelteKitの型定義が読み込まれる
```

## 推奨リソース

TypeScriptとSvelteの学習を深めるための追加リソースを紹介します。

### 学習リソース

以下のリソースは、TypeScriptとSvelteの理解を深めるのに役立ちます。

- [TypeScript公式ドキュメント](https://www.typescriptlang.org/docs/)
- [Svelte TypeScript Guide](https://svelte.dev/docs/typescript)
- [SvelteKit Types Documentation](https://kit.svelte.dev/docs/types)

### 型定義ライブラリ

外部ライブラリを使用する際は、対応する型定義パッケージをインストールすることで、TypeScriptの恩恵を最大限に受けられます。

```bash
# よく使う型定義
npm install -D @types/node
npm install -D @types/cookie
npm install -D @types/markdown-it
```

## Svelteコンポーネントの実践的なTypeScript

### 完全な型安全コンポーネントの例

実際のプロジェクトで使える、完全に型定義されたコンポーネントの例

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

フォームを扱う際の型安全な実装

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

TypeScriptの設定が完了したら、[Svelteの基本](/svelte-basics/)でSvelteの基礎を学びましょう。TypeScriptの型定義を活用しながら、実践的なコンポーネントを作成していきます。