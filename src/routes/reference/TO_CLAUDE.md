# TO_CLAUDE.md - Svelte 5 & SvelteKit 最新版コーディング規約

このドキュメントは、Claude Code（または他のAIアシスタント）に対して、**Svelte 5およびSvelteKit最新版**を使用したコーディングを指示するためのガイドラインです。

## 🚨 最重要原則

**必ずSvelte 5の最新構文を使用してください。レガシー構文は一切使用しないでください。**

## ✅ Svelte 5 必須構文

### 1. Props定義（$props）

```typescript
// ❌ 絶対に使用しない（Svelte 4以前）
export let data: PageData;
export let count: number = 0;

// ✅ 必ず使用（Svelte 5）
let { data, count = 0 }: { data: PageData; count?: number } = $props();
```

### 2. リアクティブな状態（$state）

```typescript
// ❌ 絶対に使用しない（Svelte 4以前）
let count = 0;  // 暗黙的なリアクティビティ

// ✅ 必ず使用（Svelte 5）
let count = $state(0);  // 明示的なリアクティビティ
```

### 3. 派生値（$derived）

```typescript
// ❌ 絶対に使用しない（Svelte 4以前）
$: doubled = count * 2;

// ✅ 必ず使用（Svelte 5）
let doubled = $derived(count * 2);

// 複雑な計算の場合
let result = $derived.by(() => {
  // 複雑な処理
  return computeValue(count);
});
```

### 4. 副作用（$effect）

```typescript
// ❌ 絶対に使用しない（Svelte 4以前）
$: {
  console.log(count);
  updateSomething(count);
}

// ✅ 必ず使用（Svelte 5）
$effect(() => {
  console.log(count);
  updateSomething(count);

  // クリーンアップ関数（必要な場合）
  return () => {
    cleanup();
  };
});

// 事前実行が必要な場合
$effect.pre(() => {
  // DOMレンダリング前に実行
});
```

### 5. 子要素の受け取り（children）

```typescript
// ❌ 絶対に使用しない（Svelte 4以前）
<slot />
<slot name="header" />

// ✅ 必ず使用（Svelte 5）
import type { Snippet } from 'svelte';

let { children, header }: {
  children?: Snippet;
  header?: Snippet;
} = $props();

// テンプレート内
{@render children?.()}
{@render header?.()}
```

### 6. イベントハンドラ

```svelte
<!-- ❌ 絶対に使用しない（Svelte 4以前） -->
<button on:click={handleClick}>クリック</button>

<!-- ✅ 必ず使用（Svelte 5） -->
<button onclick={handleClick}>クリック</button>
```

### 7. 双方向バインディング可能なprops（$bindable）

```typescript
// 子コンポーネント
let { value = $bindable('') }: { value: string } = $props();

// 親コンポーネント
<ChildComponent bind:value={myValue} />
```

## 🔧 SvelteKit 最新版の規約

### 1. Load関数の型

```typescript
// ❌ 絶対に使用しない
import type { Load } from '@sveltejs/kit';

// ✅ 必ず使用
import type { PageLoad } from './$types';
import type { PageServerLoad } from './$types';
import type { LayoutLoad } from './$types';
import type { LayoutServerLoad } from './$types';
```

### 2. エラーとリダイレクト

```typescript
// ❌ 絶対に使用しない
throw { status: 404, message: 'Not found' };

// ✅ 必ず使用
import { error, redirect } from '@sveltejs/kit';
throw error(404, 'Not found');
throw redirect(307, '/login');
```

### 3. Form Actions

```typescript
import type { Actions } from './$types';

export const actions: Actions = {
  default: async ({ request }) => {
    // フォーム処理
  }
};
```

### 4. APIルート

```typescript
import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';

// 大文字のメソッド名を使用
export const GET: RequestHandler = async () => {
  return json({ data: 'value' });
};

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();
  return json({ success: true });
};
```

## 📁 プロジェクト構造

```
src/
├── routes/           # ファイルベースルーティング
│   ├── +page.svelte # ページコンポーネント
│   ├── +page.ts     # ユニバーサルLoad関数
│   ├── +page.server.ts # サーバー専用Load関数とActions
│   ├── +layout.svelte  # レイアウトコンポーネント
│   ├── +server.ts   # APIエンドポイント
│   └── +error.svelte # エラーページ
├── lib/             # 共有コンポーネント・ユーティリティ
│   ├── components/  # Svelteコンポーネント
│   ├── stores/      # ストア（.svelte.ts）
│   └── server/      # サーバー専用コード
└── app.d.ts        # 型定義
```

## 🎯 TypeScript 厳密レベル規約

### 基本原則

- **すべてのファイルでTypeScriptを使用（.ts/.svelte内でlang="ts"）**
- **型定義を省略しない - 推論に頼りすぎない**
- **`any`と`unknown`の使用を禁止（やむを得ない場合はコメントで理由を明記）**
- **strictモードとすべてのstrict系オプションを有効化**

### tsconfig.json 必須設定

```json
{
  "compilerOptions": {
    // 厳密性の最大化
    "strict": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitAny": true,
    "noImplicitThis": true,
    "alwaysStrict": true,

    // 追加の厳密性オプション
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,

    // 未使用コードの検出
    "noUnusedLocals": true,
    "noUnusedParameters": true,

    // 型の一貫性
    "exactOptionalPropertyTypes": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

### 型定義の厳密なルール

#### 1. 関数の型定義

```typescript
// ❌ 悪い例：型推論に依存
const add = (a, b) => a + b;
const handleClick = (e) => { };

// ❌ 悪い例：戻り値の型が不明確
function processData(data: string) {
  return data.length > 0 ? data : null;
}

// ✅ 良い例：完全な型定義
const add = (a: number, b: number): number => a + b;

const handleClick = (event: MouseEvent): void => {
  console.log(event.clientX);
};

function processData(data: string): string | null {
  return data.length > 0 ? data : null;
}

// ✅ 非同期関数も戻り値を明確に
async function fetchUser(id: string): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  return response.json() as Promise<User>;
}
```

#### 2. オブジェクトとインターフェース

```typescript
// ❌ 悪い例：型定義なし
const user = { name: 'John', age: 30 };

// ❌ 悪い例：不完全な型定義
interface User {
  name: string;
  age?: number;  // オプショナルの乱用
}

// ✅ 良い例：詳細な型定義
interface User {
  readonly id: string;  // 読み取り専用
  name: string;
  age: number;
  email: string | null;  // nullableは明示的に
  roles: readonly Role[];  // 配列も読み取り専用
  metadata?: UserMetadata;  // オプショナルは本当に必要な場合のみ
}

// ✅ ユーティリティ型の活用
type UserUpdate = Partial<Omit<User, 'id'>>;
type UserCreation = Omit<User, 'id'> & { password: string };
```

#### 3. 配列とタプル

```typescript
// ❌ 悪い例
const items = [];
const coords = [10, 20];

// ✅ 良い例
const items: string[] = [];
const coords: readonly [x: number, y: number] = [10, 20];
const matrix: number[][] = [[1, 2], [3, 4]];

// ✅ 読み取り専用配列
const immutableList: ReadonlyArray<string> = ['a', 'b', 'c'];
```

#### 4. ユニオン型と型ガード

```typescript
// ✅ 判別可能なユニオン型
type Result<T> =
  | { success: true; data: T }
  | { success: false; error: Error };

// ✅ 型ガード関数
function isError(result: Result<unknown>): result is { success: false; error: Error } {
  return !result.success;
}

// ✅ 使用例
function handleResult<T>(result: Result<T>): T {
  if (isError(result)) {
    throw result.error;
  }
  return result.data;
}
```

#### 5. ジェネリクス

```typescript
// ❌ 悪い例：anyの使用
function getValue(obj: any, key: string): any {
  return obj[key];
}

// ✅ 良い例：ジェネリクスで型安全に
function getValue<T extends object, K extends keyof T>(
  obj: T,
  key: K
): T[K] {
  return obj[key];
}

// ✅ 制約付きジェネリクス
interface HasLength {
  length: number;
}

function logLength<T extends HasLength>(item: T): T {
  console.log(item.length);
  return item;
}
```

### Svelte/SvelteKit特有の型定義

#### 1. コンポーネントProps

```typescript
// ❌ 悪い例
let { data, count } = $props();

// ✅ 良い例：インターフェースで定義
interface Props {
  data: PageData;
  count?: number;
  children?: Snippet;
  onClick?: (event: MouseEvent) => void;
}

let {
  data,
  count = 0,
  children,
  onClick
}: Props = $props();
```

#### 2. Load関数

```typescript
// ✅ 完全な型定義
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, url, fetch }) => {
  // 戻り値の型も自動的に検証される
  return {
    post: await fetchPost(params.id),
    comments: await fetchComments(params.id)
  };
};

// 型を明確にする関数
async function fetchPost(id: string): Promise<Post> {
  const response = await fetch(`/api/posts/${id}`);
  if (!response.ok) {
    throw error(404, 'Post not found');
  }
  return response.json() as Promise<Post>;
}
```

#### 3. ストア（.svelte.ts）

```typescript
// ✅ 型安全なストア
interface CounterState {
  value: number;
  min: number;
  max: number;
}

export function createCounter(initial: Partial<CounterState> = {}) {
  const defaults: CounterState = {
    value: 0,
    min: -Infinity,
    max: Infinity
  };

  let state = $state<CounterState>({ ...defaults, ...initial });

  return {
    get value(): number {
      return state.value;
    },
    increment(): void {
      if (state.value < state.max) {
        state.value++;
      }
    },
    decrement(): void {
      if (state.value > state.min) {
        state.value--;
      }
    },
    reset(): void {
      state.value = defaults.value;
    }
  };
}

// 型の export
export type Counter = ReturnType<typeof createCounter>;
```

### エラーハンドリング

```typescript
// ✅ カスタムエラークラス
class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ✅ Result型パターン
type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ApiError };

async function apiCall<T>(url: string): Promise<ApiResult<T>> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return {
        ok: false,
        error: new ApiError(
          'API call failed',
          response.status,
          'API_ERROR'
        )
      };
    }
    return {
      ok: true,
      data: await response.json() as T
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof ApiError
        ? error
        : new ApiError('Network error', 0, 'NETWORK_ERROR')
    };
  }
}
```

### Null/Undefined の扱い

```typescript
// ✅ 明示的なnullチェック
function processUser(user: User | null): string {
  if (user === null) {
    return 'No user';
  }
  // ここではuserはUser型として扱われる
  return user.name;
}

// ✅ Optional chainingとnullish coalescing
const name = user?.profile?.name ?? 'Anonymous';

// ✅ Non-null assertion（確実な場合のみ）
function getValue(map: Map<string, string>, key: string): string {
  if (!map.has(key)) {
    throw new Error(`Key ${key} not found`);
  }
  return map.get(key)!; // hasでチェック済みなので安全
}
```

### 型アサーションの制限

```typescript
// ❌ 悪い例：安易な型アサーション
const user = {} as User;
const data = <any>response;

// ✅ 良い例：型ガードを使用
function isUser(obj: unknown): obj is User {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'name' in obj &&
    'email' in obj
  );
}

// ✅ zodなどのスキーマバリデーションライブラリを使用
import { z } from 'zod';

const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email()
});

type User = z.infer<typeof UserSchema>;

function parseUser(data: unknown): User {
  return UserSchema.parse(data);
}
```

## ⚡ ストアの定義（.svelte.ts）

```typescript
// stores/counter.svelte.ts
export function createCounter(initial = 0) {
  let count = $state(initial);

  return {
    get value() { return count; },
    increment() { count++; },
    decrement() { count--; }
  };
}
```

## 🚫 避けるべきパターン

### レガシー構文リスト

1. **`export let`** によるprops定義
2. **`$:`** によるリアクティブステートメント
3. **`let`** 変数の暗黙的リアクティビティ
4. **`<slot />`** による子要素の挿入
5. **`on:event`** イベントハンドラ構文
6. **`use:action`** 以外でのDOM操作（可能な限り$effectを使用）
7. **ストアの`$`プレフィックス** （自動サブスクリプション）
8. **`onMount`以外のレガシーライフサイクル**（`beforeUpdate`、`afterUpdate`、`onDestroy`）

### 非推奨のSvelteKit機能

1. **`export const hydrate`** → `export const csr`
2. **`export const router`** → `export const ssr`
3. **`sveltekit:prefetch`** → `data-sveltekit-preload-data`
4. **sessionストア** → pageストアのdataプロパティ

## 💡 ベストプラクティス

### コンポーネント設計

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';

  // 型定義を明確に
  interface Props {
    title: string;
    count?: number;
    children?: Snippet;
  }

  let {
    title,
    count = 0,
    children
  }: Props = $props();

  // リアクティブな状態
  let localCount = $state(count);

  // 派生値
  let doubled = $derived(localCount * 2);

  // 副作用
  $effect(() => {
    console.log(`Count changed: ${localCount}`);
  });
</script>

<div>
  <h1>{title}</h1>
  <p>Count: {localCount}, Doubled: {doubled}</p>
  {@render children?.()}
</div>
```

### エラーハンドリング

```typescript
// Load関数でのエラーハンドリング
export const load: PageLoad = async ({ fetch }) => {
  try {
    const response = await fetch('/api/data');
    if (!ok) throw error(response.status, 'Failed to fetch');
    return { data: await response.json() };
  } catch (e) {
    throw error(500, 'Internal Server Error');
  }
};
```

## 📚 参考リソース

- [Svelte 5 公式ドキュメント](https://svelte.dev/docs)
- [SvelteKit 公式ドキュメント](https://kit.svelte.dev/docs)
- [Svelte 5 移行ガイド](https://svelte.dev/docs/v5-migration-guide)

## ⚠️ 重要な注意事項

1. **このプロジェクトではSvelte 5のRunes構文のみを使用します**
2. **レガシー構文は比較・説明目的以外では一切使用しません**
3. **新しいファイルを作成する際は必ずSvelte 5構文を使用してください**
4. **既存のレガシーコードを見つけた場合は、Svelte 5構文に書き換えてください**

## 🤖 AIアシスタントへの指示

このファイルを読んだAIアシスタントは、以下を厳守してください：

1. **Svelte 5のRunes構文のみを使用する**
2. **TypeScriptを必須とする**
3. **型定義を省略しない**
4. **レガシー構文を一切使用しない**
5. **最新のSvelteKitパターンを使用する**

---

**最終更新**: 2025年1月
**対応バージョン**: Svelte 5.x, SvelteKit 2.x以降