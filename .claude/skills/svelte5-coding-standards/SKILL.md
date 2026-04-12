---
name: svelte5-coding-standards
description: Svelte 5 + SvelteKit 2.x + TypeScript のコーディング規約・ベストプラクティス。Svelteコンポーネント、Runesの使い方、TypeScript厳密規約、レガシー構文の回避ルール、ドキュメント内コード例の記述ガイドラインを提供する。Svelteのコード生成、レビュー、リファクタリング、学習コンテンツの作成時に必ず参照すること。svelte、sveltekit、runes、$state、$derived、$effect、$props、TypeScript、コンポーネントに関するコード生成や修正を行う場合はこのスキルを使用する。
---

# Svelte 5 + TypeScript コーディング規約

このスキルは、Svelte 5 / SvelteKit 2.x プロジェクトにおけるコーディング規約と品質基準を定義する。コード生成、レビュー、リファクタリング時に参照し、一貫性のある高品質なコードを維持する。

## バージョン要件

- **Svelte**: 5.x以上（Runesシステム必須）
- **SvelteKit**: 2.x以上
- **TypeScript**: 5.x以上（strictモード必須）
- **Vite**: 5.x以上
- **Node.js**: 20.x LTS以上

---

## 1. Svelte 5 Runes 必須ルール

### 使用すべき構文

```svelte
<script lang="ts">
  // リアクティブな状態
  let count = $state(0);
  let user = $state<User>({ name: '太郎', age: 25 });
  let items = $state<string[]>([]);

  // パフォーマンス重視の非プロキシ状態
  let largeData = $state.raw<DataItem[]>([]);

  // 派生値
  let doubled = $derived(count * 2);
  let filtered = $derived.by(() => {
    return items.filter(item => item.length > 3);
  });

  // 副作用
  $effect(() => {
    document.title = `Count: ${count}`;
    return () => { /* クリーンアップ */ };
  });
</script>
```

### Props定義

```typescript
// 型定義を必ず行う
type Props = {
  required: string;
  optional?: number;
  withDefault?: boolean;
};

let {
  required,
  optional,
  withDefault = true,
  ...restProps
}: Props = $props();

// 双方向バインディング
let { value = $bindable('default') }: { value: string } = $props();
```

### 子要素のレンダリング

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';
  let { children }: { children?: Snippet } = $props();
</script>

<main>
  {@render children?.()}
</main>
```

---

## 2. 禁止パターン（レガシー構文）

以下は Svelte 4 以前の構文であり、**新しいコードでは絶対に使用しない**。比較や説明目的の場合は、明示的に「レガシー構文」と注記すること。

| 禁止パターン | 代替（Svelte 5） |
|-------------|-----------------|
| `let x = 0;`（暗黙的リアクティビティ） | `let x = $state(0);` |
| `$: doubled = count * 2;` | `let doubled = $derived(count * 2);` |
| `$: { ... }`（リアクティブブロック） | `$effect(() => { ... });` |
| `export let data;` | `let { data } = $props();` |
| `<slot />` | `{@render children?.()}` |
| `createEventDispatcher()` | callback propsパターン |
| `on:click={handler}` | `onclick={handler}` |
| `on:click\|preventDefault` | `e.preventDefault()` をハンドラ内で呼ぶ |
| `$store`（auto-subscription） | `.svelte.ts` でRunes使用 |
| `$state.frozen()` | `$state.raw()` |
| `ComponentType<SvelteComponent>` | `Component` 型 |
| `$derived(() => { ... })` | `$derived.by(() => { ... })` |

---

## 3. TypeScript 厳密規約

### 必須設定

すべてのファイルで `lang="ts"` を使用。`any` と `unknown` の使用は禁止（やむを得ない場合はコメントで理由を明記）。

### 関数の型定義

```typescript
// 戻り値の型を必ず明記
const add = (a: number, b: number): number => a + b;

async function fetchUser(id: string): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  return response.json() as Promise<User>;
}

// イベントハンドラ
function handleClick(event: MouseEvent & { currentTarget: HTMLButtonElement }): void {
  console.log(event.currentTarget.textContent);
}
```

### オブジェクトとインターフェース

```typescript
interface User {
  readonly id: string;
  name: string;
  age: number;
  email: string | null;
  roles: readonly Role[];
  metadata?: UserMetadata;
}

// ユーティリティ型の活用
type UserUpdate = Partial<Omit<User, 'id'>>;
type UserCreation = Omit<User, 'id'> & { password: string };
```

### 判別可能なユニオン型

```typescript
type Result<T> =
  | { success: true; data: T }
  | { success: false; error: Error };

function isError(result: Result<unknown>): result is { success: false; error: Error } {
  return !result.success;
}
```

### 型アサーションの制限

型アサーション（`as`）は原則禁止。型ガード関数またはスキーマバリデーション（Zod等）を使用する。

```typescript
// 型ガード関数を使用
function isUser(obj: unknown): obj is User {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'name' in obj
  );
}
```

---

## 4. Svelte 5 ストアパターン

`.svelte.ts` ファイルでRunesを使用したストアを定義する。

```typescript
// counter.svelte.ts
export function createCounter(initial = 0) {
  let count = $state(initial);

  return {
    get value() { return count; },
    increment() { count++; },
    decrement() { count--; },
    reset() { count = initial; }
  };
}

export type Counter = ReturnType<typeof createCounter>;
```

---

## 5. SvelteKit データ受け取り

### 推奨パターン（PageProps / LayoutProps）

```svelte
<script lang="ts">
  import type { PageProps } from './$types';
  let { data, form }: PageProps = $props();
</script>
```

### Load関数

```typescript
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, params }) => {
  const user = await fetch(`/api/users/${params.id}`);
  return { user: await user.json() };
};
```

### $app/state の使用（推奨）

```typescript
import { page } from '$app/state';
// 直接アクセス（$プレフィックス不要）
let currentPath = $derived(page.url.pathname);
```

`$app/stores` はレガシー。新規コードでは `$app/state` を使用する。

---

## 6. イベントハンドリング

### Svelte 5 構文

```svelte
<!-- インラインハンドラ -->
<button onclick={() => count++}>Increment</button>

<!-- 名前付きハンドラ -->
<button onclick={handleClick}>Click</button>

<!-- modifierは直接呼び出し -->
<form onsubmit={(e) => {
  e.preventDefault();
  handleSubmit();
}}>
```

### カスタムイベント（callback props）

```svelte
<!-- 子コンポーネント -->
<script lang="ts">
  let { onchange }: { onchange?: (value: string) => void } = $props();
</script>

<input onchange={(e) => onchange?.(e.currentTarget.value)} />
```

---

## 7. ライフサイクルの使い分け

| 用途 | 推奨 |
|------|------|
| クライアントのみの初期化、動的インポート | `onMount` |
| リアクティブな値の変更に反応 | `$effect` |
| DOM要素のライフサイクル管理 | `use:action` |
| サードパーティライブラリ初期化（DOM要素） | `use:action` |
| デバウンス・スロットル | `$effect` |
| グローバルイベントリスナー（1回のみ） | `onMount` |

`onDestroy`、`beforeUpdate`、`afterUpdate` は非推奨。`$effect` のクリーンアップで代替する。

---

## 8. エラーハンドリング

```typescript
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

type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ApiError };
```

SvelteKitでは `error()` と `redirect()` 関数を使用する。

```typescript
import { error, redirect } from '@sveltejs/kit';
throw error(404, 'Not found');
throw redirect(302, '/login');
```

---

## 9. ドキュメント内コード例の記述ルール

学習コンテンツ作成時のルール（このプロジェクト固有）：

1. **説明は文章で**: コードの前に、実装の意図や仕組みを文章で説明
2. **コメントは日本語**: コード内のコメントはすべて日本語で統一
3. **変数名は英語**: 説明的でわかりやすい英語の変数名を使用
4. **TypeScript必須**: すべてのコード例で `lang="ts"` を使用
5. **完全なコード**: そのままコピー&ペーストで動作する
6. **インポートを省略しない**: `error`、`redirect`、型定義のインポートを必ず記述

### LiveCode（実行可能コード例）固有のルール

このプロジェクトの ` ```svelte live ` コードブロックは svelte.dev Playground の embed iframe で実行される。以下の制約がある：

- **Console を使うブロックには `console` メタを付ける**:
  デフォルトは `outputOnly=true`（Result全画面）で Console パネルが非表示。`console.log` を使う例では ` ```svelte live console ` として Console 付きの完全な Playground に切り替える。

- **DOM Events を `console.log` に直接渡さない**:
  Playground iframe 内から親ウィンドウへログを送る際 `postMessage` が使われる。MouseEvent、KeyboardEvent 等の DOM Events は **構造化クローンアルゴリズムでクローンできず**、「Message could not be cloned. Open devtools to see it」エラーとなる。必要なプロパティをプリミティブ値に分解すること。

  ```ts
  // NG: MouseEvent全体を渡す → postMessage失敗
  function handleClick(event: MouseEvent) {
    console.log('clicked', event);
  }

  // OK: 必要なフィールドだけプリミティブに分解
  function handleClick(event: MouseEvent) {
    console.log('clicked', {
      type: event.type,
      x: event.clientX,
      y: event.clientY
    });
  }
  ```

  この制約は `HTMLElement`、`Event` 派生型、`Node`、`Window` など DOM 由来のオブジェクト全般に及ぶ。

### meta description テンプレート

```
Svelte5の[ルーン名]ルーンで[機能]を[動作] - [具体的な使用例]をTypeScriptで[アクション]
```

### 情報の強調表示

```markdown
:::note[タイトル]    - 補足情報
:::tip[タイトル]     - ベストプラクティス
:::warning[タイトル] - 注意点
:::caution[タイトル] - 間違えやすい点
:::info[タイトル]    - 技術詳細・ディープダイブ
```
