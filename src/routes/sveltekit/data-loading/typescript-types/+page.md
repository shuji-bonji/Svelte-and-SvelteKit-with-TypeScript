---
title: TypeScript型の自動生成システム
description: SvelteKitが自動生成する型システムで型安全なLoad関数とコンポーネントを実装 - PageData、LayoutData、RequestEventなどの型定義とapp.d.tsによる拡張方法をTypeScriptで解説
---

<script>
  import Mermaid from '$lib/components/Mermaid.svelte';

  const typeSystemDiagram = `graph LR
    subgraph "ファイル構造"
      direction TB
      routes[routes/]
      layout["+layout.ts"]
      page["+page.ts"]
      server["+page.server.ts"]
      component["+page.svelte"]
    end

    subgraph "自動生成される型"
      direction TB
      types["./$types"]
      PageLoad["PageLoad"]
      PageData["PageData"]
      LayoutLoad["LayoutLoad"]
      LayoutData["LayoutData"]
      PageServerLoad["PageServerLoad"]
      ActionData["ActionData"]
    end

    subgraph "型の使用"
      direction TB
      load["load関数"]
      props["$props()"]
      actions["Form Actions"]
    end

    routes --> types
    page --> PageLoad
    layout --> LayoutLoad
    server --> PageServerLoad

    PageLoad --> PageData
    LayoutLoad --> LayoutData
    PageServerLoad --> PageData

    PageData --> props
    ActionData --> props

    load --> types
    component --> props
    actions --> ActionData
  `;

  const typeInheritanceDiagram = `graph TB
    subgraph "Server Load"
      direction TB
      ServerLoad["+page.server.ts"]
      ServerData["data: ServerData"]
    end

    subgraph "Universal Load"
      direction TB
      UniversalLoad["+page.ts"]
      UniversalParams["{ data }"]
      MergedData["data: ServerData + ClientData"]
    end

    subgraph "Page Component"
      direction TB
      PageComponent["+page.svelte"]
      Props["let { data } = $props()"]
      FinalData["data: PageData"]
    end

    ServerLoad --> ServerData
    ServerData --> UniversalParams
    UniversalParams --> UniversalLoad
    UniversalLoad --> MergedData
    MergedData --> FinalData
    FinalData --> Props
  `;
</script>

SvelteKitは強力な型自動生成システムを持ち、ファイル構造から適切な型を推論して提供します。このページでは、その仕組みと活用方法を詳しく解説します。

## 型システムの概要

SvelteKitは、ルート構造とファイル名から自動的に型を生成し、完全な型安全性を実現します。開発者は型定義を手動で書く必要がなく、`./$types`からインポートするだけで適切な型を使用できます。

<Mermaid diagram={typeSystemDiagram} />

## $typesの仕組み

### 自動生成される型の種類

```typescript
// ./$typesから利用可能な型
import type {
  PageLoad,        // +page.tsのload関数用
  PageData,        // +page.svelteのdata prop用
  PageServerLoad,  // +page.server.tsのload関数用
  PageServerData,  // Server Loadが返すデータ
  LayoutLoad,      // +layout.tsのload関数用
  LayoutData,      // +layout.svelteのdata prop用
  LayoutServerLoad,// +layout.server.tsのload関数用
  LayoutServerData,// Layout Server Loadが返すデータ
  ActionData,      // Form Actionsの結果用
  RequestEvent     // Load関数のパラメータ型
} from './$types';
```

### 型の自動推論

SvelteKitは、パスパラメータやクエリ文字列の型も自動的に推論します。

```typescript
// src/routes/posts/[id]/+page.ts
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
  // params.idは自動的にstring型として推論される
  // ファイル名の[id]から、SvelteKitが自動的にparams.idの存在を保証
  const postId = params.id;  // 型: string（undefinedにはならない）

  // TypeScriptエラーなし：params.idの存在が型レベルで保証されている
  // もし[slug]などの別名を使っていたら、params.slugが推論される
  return {
    postId
  };
};
```

## PageData / LayoutData

Load関数の戻り値は自動的に`PageData`または`LayoutData`型として推論されます。

### 基本的な使用方法

```typescript
// +page.ts - Universal Load関数
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
  // SvelteKitが提供するカスタムfetch関数を使用
  // サーバー/クライアント両方で動作し、cookieも自動的に含まれる
  const user = await fetch('/api/user').then(r => r.json());

  return {
    user,      // 型: any（明示的な型定義がない場合）
    timestamp: Date.now()  // 型: number（自動推論）
  };
  // この戻り値の型がPageDataとして自動生成される
};
```

```svelte
<!-- +page.svelte - ページコンポーネント -->
<script lang="ts">
  import type { PageData } from './$types';

  // PageDataは+page.tsのload関数の戻り値から自動生成
  // { user: any, timestamp: number } の型を持つ
  let { data }: { data: PageData } = $props();

  // TypeScriptが型チェック：data.timestampはnumber型
  // data.userはany型なので、.nameアクセスでもエラーにならない
</script>

<h1>ユーザー: {data.user.name}</h1>
<p>時刻: {data.timestamp}</p>
```

### 型の明示的な定義

より厳密な型定義が必要な場合は、Load関数内で型を明示できます。

```typescript
// +page.ts - 明示的な型定義で型安全性を向上
import type { PageLoad } from './$types';

// ユーザーデータの型を明示的に定義
interface User {
  id: string;
  name: string;
  email: string;
}

export const load: PageLoad = async ({ fetch }) => {
  // 型アサーションで戻り値をUser型として扱う
  const user: User = await fetch('/api/user').then(r => r.json());

  return {
    user  // PageDataには明示的にuser: User型が含まれる
    // コンポーネント側でdata.user.nameなどが型安全にアクセス可能
  };
};
```

## PageServerData / LayoutServerData

Server Load専用の型で、サーバーサイドでのみ利用可能なデータを扱います。

<Mermaid diagram={typeInheritanceDiagram} />

### Server LoadとUniversal Loadの連携

```typescript
// +page.server.ts - サーバーサイド専用のLoad関数
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies }) => {
  // cookiesはサーバーサイドでのみ利用可能
  // クライアントサイドでは使えない（Universal Loadでは未定義）
  const sessionId = cookies.get('session');

  // データベースへの直接アクセス（サーバーサイドのみ）
  // Prismaなどのサーバー専用ライブラリを使用可能
  const user = await db.user.findUnique({
    where: { sessionId }
  });

  return {
    user,           // DBから取得したユーザー情報
    serverTime: new Date()  // サーバー側の現在時刻
  };
  // この戻り値がPageServerDataとして型定義される
};
```

```typescript
// +page.ts - Universal LoadでServer Loadのデータを受け取る
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ data, fetch }) => {
  // dataパラメータにはPageServerDataが自動的に含まれる
  // +page.server.tsが存在する場合のみ、dataが渡される
  console.log('Server user:', data.user);
  console.log('Server time:', data.serverTime);

  // 追加のクライアントサイドデータを取得
  // このfetchはクライアントサイドでも実行される
  const posts = await fetch('/api/posts').then(r => r.json());

  return {
    ...data,  // サーバーデータを展開（user, serverTime）
    posts     // クライアントデータを追加
    // 最終的なPageData: { user, serverTime, posts }
  };
};
```

## ActionData

Form Actionsの結果を型付けするための型です。

```typescript
// +page.server.ts - Form Actionsの実装
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  // 初期データのロード
  return {
    items: []  // 空のアイテムリスト
  };
};

// Form Actionsの定義。satisfies Actionsで型チェック
export const actions = {
  // default actionではなく、名前付きaction（create）
  create: async ({ request }) => {
    // フォームデータを取得
    const data = await request.formData();
    const title = data.get('title');  // input name="title"の値

    // バリデーションエラーの場合
    if (!title) {
      return {
        success: false,
        error: 'タイトルは必須です'
      };
      // この戻り値がActionDataとして型定義される
    }

    // データベースに保存（サーバーサイドでのみ実行）
    const item = await db.item.create({
      data: { title: String(title) }  // FormDataはstring | Fileなのでキャスト
    });

    // 成功時のレスポンス
    return {
      success: true,
      item  // 作成されたアイテムを返す
    };
  }
} satisfies Actions;  // Actions型で型チェック（型推論と検証）
```

```svelte
<!-- +page.svelte - Form Actionの結果を表示 -->
<script lang="ts">
  import type { PageData, ActionData } from './$types';

  let { data, form }: {
    data: PageData;      // Load関数の戻り値
    form: ActionData;     // Form Actionの戻り値（フォーム送信後）
  } = $props();

  // formはフォーム送信前はundefined
  // 送信後はcreate actionの戻り値が入る
</script>

<!-- Optional chainingで安全にアクセス -->
{#if form?.success}
  <p>作成成功: {form.item.title}</p>
{:else if form?.error}
  <p>エラー: {form.error}</p>
{/if}

<!-- フォームはaction属性で名前付きactionを指定 -->
<form method="POST" action="?/create">
  <input name="title" required />
  <button>作成</button>
</form>
```

## RequestEvent型

Load関数やActionsのパラメータとして渡される型です。

```typescript
import type { RequestEvent } from './$types';

// RequestEventの主要なプロパティ
interface RequestEvent {
  params: Record<string, string>;  // ルートパラメータ
  url: URL;                       // リクエストURL
  request: Request;               // Fetchリクエストオブジェクト
  fetch: typeof fetch;            // カスタムfetch関数
  setHeaders: (headers: Record<string, string>) => void;
  cookies: Cookies;               // Cookie操作（server-onlyで利用可能）
  locals: App.Locals;             // カスタムローカルデータ
  platform?: App.Platform;        // プラットフォーム固有データ
}
```

### 使用例

```typescript
// +page.ts - RequestEventの各プロパティを活用
import type { PageLoad } from './$types';

export const load: PageLoad = async (event) => {
  // eventはRequestEvent型で、リクエストに関するすべての情報を含む
  const { params, url, fetch, setHeaders } = event;

  // params: ルートパラメータ（[id]など）が自動的に型付けされる
  const id = params.id;  // src/routes/items/[id]/+page.tsの場合

  // url: 完全なURLオブジェクト（クエリパラメータを含む）
  const page = url.searchParams.get('page') || '1';  // ?page=2 など

  // setHeaders: レスポンスヘッダーを設定（キャッシュ制御など）
  setHeaders({
    'cache-control': 'max-age=3600'  // 1時間キャッシュ
  });

  // fetch: SvelteKitが提供するカスタムfetch
  // - サーバー/クライアント両方で動作
  // - cookieを自動的に含む
  // - 相対パスを解決
  const data = await fetch(`/api/items?page=${page}`);

  return {
    items: await data.json(),
    currentPage: parseInt(page)
  };
};
```

## 型の自動更新メカニズム

### svelte-kit syncコマンド

SvelteKitは開発中に自動的に型を更新しますが、手動で更新することも可能です。

```bash
# 型の手動再生成（通常は自動で更新される）
npx svelte-kit sync

# package.jsonのprepareスクリプト
# npm install時に自動的に型を生成
{
  "scripts": {
    "prepare": "svelte-kit sync"  # git clone後の初回セットアップに便利
  }
}
```

### .svelte-kit/typesディレクトリ

自動生成された型は`.svelte-kit/types`ディレクトリに保存されます。

```
.svelte-kit/types/   # 自動生成されるディレクトリ（.gitignoreされる）
├── src/
│   └── routes/
│       ├── $types.d.ts          # /ルート用の型定義
│       └── posts/
│           └── [id]/
│               └── $types.d.ts  # /posts/[id]ルート用の型
                                   # params.idがstring型であることを保証
```

:::warning[注意事項]
`.svelte-kit`ディレクトリは自動生成されるため、手動で編集しないでください。変更は`svelte-kit sync`実行時に上書きされます。
:::

## カスタム型の拡張

### app.d.tsでの型定義

グローバルな型を定義するには、`src/app.d.ts`を使用します。

```typescript
// src/app.d.ts - グローバルな型定義ファイル
declare global {
  namespace App {
    // Error: エラーページで使用されるエラー情報
    interface Error {
      code?: string;      // エラーコード（例: 'NOT_FOUND', 'UNAUTHORIZED'）
      message: string;    // ユーザー向けメッセージ
    }

    // Locals: リクエストごとのコンテキストデータ
    // hooks.server.tsで設定し、Load関数で取得可能
    interface Locals {
      user?: {
        id: string;
        name: string;
        role: 'admin' | 'user';  // 権限レベル
      };
      session?: string;   // セッションID
    }

    // PageData: すべてのページで共通して使えるデータ
    interface PageData {
      // フラッシュメッセージ（一度だけ表示する通知）
      flash?: {
        type: 'success' | 'error' | 'info';  // メッセージタイプ
        message: string;                      // 表示内容
      };
    }

    // Platform: プラットフォーム固有の情報（Cloudflare Workersなど）
    interface Platform {
      env?: {
        DATABASE_URL: string;   // 環境変数
        SECRET_KEY: string;     // 秘密鍵
      };
    }
  }
}

export {};  // モジュールとして扱うために必要
```

### Localsの使用例

```typescript
// hooks.server.ts - すべてのリクエストで実行されるフック
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  // クッキーからセッションIDを取得
  const session = event.cookies.get('session');

  if (session) {
    // Localsにユーザー情報を設定
    // app.d.tsのLocalsインターフェースに従って型付けされる
    event.locals.user = await getUserFromSession(session);
    event.locals.session = session;
    // これらの値は、すべてのLoad関数でlocals経由でアクセス可能
  }

  // リクエストの処理を続行
  return resolve(event);
};
```

```typescript
// +page.server.ts - Localsを使用した認証チェック
import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
  // localsはapp.d.tsのLocalsインターフェースに基づいて型付け
  // hooks.server.tsで設定された値が取得できる
  if (!locals.user) {
    // 未認証の場合はログインページへリダイレクト
    throw redirect(303, '/login');
  }

  // locals.userの型は{ id: string, name: string, role: 'admin' | 'user' }
  const isAdmin = locals.user.role === 'admin';  // TypeScriptが型チェック

  return {
    user: locals.user,  // 型安全にユーザー情報を返す
    isAdmin
  };
};
```

## 実践例：完全型安全なデータフロー

複数のLoad関数とForm Actionsを組み合わせた型安全な実装例です。

```typescript
// +layout.server.ts - 全ページで共通のデータをロード
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
  // レイアウトLoadでユーザー情報を取得
  // すべての子ページで利用可能になる
  return {
    user: locals.user || null  // ユーザーがいない場合はnull
  };
};
```

```typescript
// +page.server.ts - 記事編集ページの完全な実装
import type { PageServerLoad, Actions } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ parent, params }) => {
  // parent()でレイアウトLoadのデータを取得
  const { user } = await parent();  // LayoutServerLoadの戻り値

  if (!user) {
    // ユーザーがログインしていない場合
    throw redirect(303, '/login');
  }

  // params.idは[id]ルートから自動推論
  const post = await db.post.findUnique({
    where: { id: params.id }  // 型安全: idはstring
  });

  return {
    post  // PageDataに含まれる
  };
};

// Form Actions: 記事の更新処理
export const actions = {
  // 名前付きaction: ?/updateでアクセス
  update: async ({ request, params, locals }) => {
    const data = await request.formData();

    try {
      // データベース更新
      const updated = await db.post.update({
        where: { id: params.id },
        data: {
          title: String(data.get('title')),      // FormDataから値を取得
          content: String(data.get('content'))
        }
      });

      return {
        type: 'success' as const,  // as constでリテラル型に
        post: updated
      };
    } catch (error) {
      return {
        type: 'error' as const,
        message: 'Update failed'
      };
    }
  }
} satisfies Actions;  // Actions型で検証
```

```svelte
<!-- +page.svelte - 記事編集コンポーネント -->
<script lang="ts">
  import type { PageData, ActionData } from './$types';
  import { enhance } from '$app/forms';  // Progressive Enhancement

  let { data, form }: {
    data: PageData;      // Load関数の戻り値
    form: ActionData;     // Form Actionの結果
  } = $props();

  // Svelte 5の$derivedでリアクティブな値を定義
  // 型が完全に推論される
  $: user = data.user;  // 型: User | null（レイアウトから）
  $: post = data.post;  // 型: Post（ページLoadから）
</script>

<h1>編集: {post.title}</h1>

<!-- Form Actionの結果を表示 -->
{#if form?.type === 'success'}
  <p>更新成功！</p>
{:else if form?.type === 'error'}
  <p>エラー: {form.message}</p>
{/if}

<!-- use:enhanceでJavaScriptなしでも動作するProgressive Enhancement -->
<form method="POST" action="?/update" use:enhance>
  <input name="title" value={post.title} />
  <textarea name="content">{post.content}</textarea>
  <button>更新</button>
</form>
```

## トラブルシューティング

### 型が更新されない場合

```bash
# 開発サーバーを再起動
npm run dev

# または型を手動で再生成
npx svelte-kit sync

# TypeScriptサービスを再起動（VSCode）
Cmd+Shift+P -> "TypeScript: Restart TS Server"
```

### 型エラーの対処

```typescript
// 型エラーが発生する場合の確認事項

// 1. インポートパスの確認
import type { PageLoad } from './$types';  // ✅ 正しい: 相対パス
// import type { PageLoad } from '$types';  // ❌ 間違い: $typesという別名は存在しない

// 2. ファイル名と型の対応を確認
// ファイル名によって使用できる型が決まる
// +page.ts         → PageLoad, PageData
// +page.server.ts  → PageServerLoad, PageServerData, Actions
// +layout.ts       → LayoutLoad, LayoutData
// +layout.server.ts → LayoutServerLoad, LayoutServerData

// 3. 返り値の型を明示（型推論が効かない場合）
export const load = (async () => {
  return {
    data: 'test'
  };
}) satisfies PageLoad;  // satisfiesで型チェックしつつ推論を維持
```

## まとめ

SvelteKitの型自動生成システムは、以下の利点を提供します。

- **完全な型安全性** - Load関数からコンポーネントまで一貫した型チェック
- **自動推論** - パラメータや返り値の型を自動的に推論
- **開発効率の向上** - 型定義の手間を削減
- **エラーの早期発見** - コンパイル時に型エラーを検出
- **IDE支援** - 自動補完とリファクタリングのサポート

次のステップ：[データフローの詳細](../flow/)で、データがどのように流れるかを学びましょう。