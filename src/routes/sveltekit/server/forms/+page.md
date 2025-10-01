---
title: フォーム処理とActions
description: SvelteKitのフォーム処理を完全マスター - Actions、Progressive Enhancement、バリデーション、ファイルアップロードまで
---

<script>
  import Mermaid from '$lib/components/Mermaid.svelte';

  const executionFlowDiagram = `sequenceDiagram
    participant User as ユーザー
    participant Browser as ブラウザ
    participant SvelteKit as SvelteKit
    participant Action as Action関数
    participant Load as Load関数

    Note over User,Browser: JavaScript無効時
    User->>Browser: フォーム送信
    Browser->>SvelteKit: POSTリクエスト（全画面遷移）
    SvelteKit->>Action: Action実行
    Action-->>SvelteKit: 結果返却
    SvelteKit->>Load: Load関数実行
    Load-->>SvelteKit: データ返却
    SvelteKit->>Browser: HTML全体を返却
    Browser->>User: ページ全体を再描画

    Note over User,Browser: JavaScript有効時 + use:enhance
    User->>Browser: フォーム送信
    Browser->>Browser: use:enhanceが介入
    Browser->>SvelteKit: fetch API（非同期）
    SvelteKit->>Action: Action実行
    Action-->>SvelteKit: 結果返却
    SvelteKit->>Load: Load関数実行（invalidate時）
    Load-->>SvelteKit: データ返却
    SvelteKit->>Browser: JSON返却
    Browser->>Browser: 差分更新
    Browser->>User: 部分的な再描画`;

  const actionFlowDiagram = `flowchart TB
    A[POSTリクエスト受信] --> B[Actionが定義されているか]
    B -->|Yes| C[FormDataを解析]
    B -->|No| D[405 Method Not Allowed]
    C --> E[Named Action]
    E -->|Yes| F[該当するAction関数を実行]
    E -->|No| G[defaultアクションを実行]
    F --> H[結果を処理]
    G --> H
    H --> I[リダイレクト]
    I -->|Yes| J[303リダイレクト]
    I -->|No| K[エラー]
    K -->|Yes| L[エラーデータと共にページ再描画]
    K -->|No| M[成功データと共にページ再描画]`;

  const redirectFlowDiagram = `flowchart LR
    A[Action実行] --> B[成功]
    B -->|Yes| C[redirect throw]
    C --> D[303ステータス返却]
    D --> E[ブラウザがリダイレクト先へ]
    E --> F[新しいページのload実行]
    B -->|No| G[エラーデータ返却]
    G --> H[同じページで再描画]`;

  const namedActionsDiagram = `sequenceDiagram
    participant User as ユーザー
    participant Browser as ブラウザ
    participant Server as サーバー

    Note over User: 更新ボタンクリック
    User->>Browser: form action="?/update"
    Browser->>Server: POST /posts/123?/update
    Server->>Server: actions.update実行
    Server-->>Browser: 成功レスポンス
    Browser->>User: 更新完了表示

    Note over User: 削除ボタンクリック
    User->>Browser: form action="?/delete"
    Browser->>Server: POST /posts/123?/delete
    Server->>Server: actions.delete実行
    Server-->>Browser: リダイレクト(303)
    Browser->>Server: GET /posts
    Server-->>Browser: 一覧ページ
    Browser->>User: 一覧ページ表示`;

  const enhanceLifecycleDiagram = `flowchart TB
    A[フォーム送信イベント] --> B[use:enhance呼び出し]
    B --> C[送信前処理]
    C --> D{cancel呼び出し}
    D -->|Yes| E[処理中止]
    D -->|No| F[fetchでサーバーへ送信]
    F --> G[サーバーでAction実行]
    G --> H[レスポンス受信]
    H --> I[result処理]
    I --> J{result.type判定}
    J -->|success| K[成功処理]
    J -->|failure| L[エラー処理]
    J -->|redirect| M[リダイレクト処理]
    K --> N[update関数呼び出し]
    L --> N
    M --> O[ページ遷移]
    N --> P[DOM更新]
    P --> Q[処理完了]`;

  const validationFlowDiagram = `flowchart TB
    A[フォームデータ受信] --> B[基本バリデーション]
    B --> C{必須項目チェック}
    C -->|NG| D["fail(400) エラー返却"]
    C -->|OK| E[型バリデーション]
    E --> F{型チェック}
    F -->|NG| D
    F -->|OK| G[ビジネスルール検証]
    G --> H{重複チェック等}
    H -->|NG| D
    H -->|OK| I[データ処理実行]
    I --> J{処理結果}
    J -->|失敗| K["fail(500) サーバーエラー"]
    J -->|成功| L[成功レスポンス]

    D --> M[フォーム再表示]
    M --> N[エラーメッセージ表示]
    M --> O[入力値保持]`;

  const fileUploadFlowDiagram = `sequenceDiagram
    participant User as ユーザー
    participant Browser as ブラウザ
    participant Client as クライアント処理
    participant Server as サーバー
    participant Storage as ストレージ

    User->>Browser: ファイル選択
    Browser->>Client: Fileオブジェクト生成

    Note over Client: プログレス表示開始
    Client->>Server: FormData送信（XHR）

    loop アップロード中
        Server-->>Client: プログレスイベント
        Client-->>Browser: 進捗率更新
        Browser-->>User: プログレスバー表示
    end

    Server->>Server: ファイルサイズチェック
    Server->>Server: ファイルタイプ検証
    Server->>Storage: ファイル保存
    Storage-->>Server: 保存完了
    Server-->>Client: 成功レスポンス（URL含む）
    Client->>Browser: 画像プレビュー表示
    Browser->>User: アップロード完了`;
</script>

SvelteKitのActionsは、プログレッシブエンハンスメントに対応した強力なフォーム処理システムです。JavaScriptが無効でも動作し、有効時にはシームレスな体験を提供します。このガイドでは、基本的なフォーム処理から高度なバリデーション、ファイルアップロードまで、実践的なTypeScriptコード例で完全解説します。

## Actions の基本概念

SvelteKitのActionsは、サーバーサイドでフォーム送信を処理する仕組みです。従来のWebアプリケーションと同じようにHTMLフォームを使いながら、モダンなユーザー体験を提供できます。

### Progressive Enhancement とは

Progressive Enhancement（プログレッシブエンハンスメント）は、基本的なHTML機能から始めて、段階的に機能を強化していく開発アプローチです。SvelteKitのフォームは、JavaScript無効でも動作する**プログレッシブエンハンスメント**を実現します。

- **JavaScript無効時**: 通常のHTMLフォーム送信
- **JavaScript有効時**: ページリロードなしでフォーム処理
- **自動的な切り替え**: use:enhance で自動最適化

:::info[重要な理解]
**Actions自体はサーバーサイドのみで動作**します。JavaScript無効時も有効時も、フォーム処理のロジックは常にサーバー側のActionsが実行します。`use:enhance`は、**クライアント側でのUX改善**のみを担当し、処理自体には関与しません。

#### SvelteKit Actionsの役割

**Actions**は、**サーバーサイドでフォーム処理を担当**します。

1. **基本動作（JavaScript無効時）**
   - ブラウザの標準的なフォーム送信（POSTリクエスト）
   - サーバー側のActionsがフォームデータを処理
   - 処理後、ページ全体をリロードして結果を表示
   - **これは純粋なHTMLとサーバーサイド処理で動作**

2. **強化動作（JavaScript有効時 + use:enhance）**
   - `use:enhance`ディレクティブがフォーム送信をインターセプト
   - AJAXでフォームデータをサーバーに送信
   - **同じActions**がサーバー側で処理
   - ページリロードなしで結果を反映
   - ローディング状態やアニメーションを追加可能
:::

### 基本的なAction実装

最もシンプルなActionの実装例です。`+page.server.ts`ファイルで`actions`オブジェクトをエクスポートすることで、フォーム送信を処理できます。

```typescript
// src/routes/contact/+page.server.ts
import type { Actions } from './$types';
import { fail } from '@sveltejs/kit';

export const actions = {
  default: async ({ request }) => {
    const data = await request.formData();
    const name = data.get('name');
    const email = data.get('email');
    const message = data.get('message');
    
    // バリデーション
    if (!name || !email || !message) {
      return fail(400, {
        error: '全ての項目を入力してください',
        name,
        email,
        message
      });
    }
    
    // メール送信処理など
    await sendEmail({ name, email, message });
    
    return {
      success: true
    };
  }
} satisfies Actions;
```

```svelte
<!-- src/routes/contact/+page.svelte -->
<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ActionData } from './$types';
  
  let { form }: { form: ActionData } = $props();
</script>

<form method="POST" use:enhance>
  {#if form?.error}
    <p class="error">{form.error}</p>
  {/if}
  
  {#if form?.success}
    <p class="success">送信完了しました！</p>
  {/if}
  
  <input 
    name="name" 
    placeholder="お名前"
    value={form?.name ?? ''}
    required
  />
  
  <input 
    name="email" 
    type="email"
    placeholder="メールアドレス"
    value={form?.email ?? ''}
    required
  />
  
  <textarea 
    name="message"
    placeholder="メッセージ"
    value={form?.message ?? ''}
    required
  />
  
  <button type="submit">送信</button>
</form>
```

## Actionsの実行タイミングとフロー

Actionsはサーバーサイドで実行され、以下のような流れで処理が進みます。理解することで、より効果的なフォーム処理の実装が可能になります。

### 実行フローの全体像

<Mermaid diagram={executionFlowDiagram} />

上図は、フォーム送信時の処理フローを示しています。

#### JavaScript無効時の流れ（上段）
- ブラウザが標準のHTMLフォーム送信を行い、POSTリクエストとして全画面遷移を伴います
- サーバー側でAction関数が実行され、その後Load関数が実行されます
- 最終的にHTML全体が返却され、ページ全体が再描画されます

#### JavaScript有効時の流れ（下段）
- `use:enhance`がフォーム送信をインターセプトし、fetch APIを使用して非同期送信します
- サーバー側の処理は同じですが、レスポンスはJSONとして返却されます
- ブラウザ側で差分更新を行い、必要な部分だけを再描画します

### 詳細な実行タイミング

#### 1. リクエスト受信からAction実行まで

<Mermaid diagram={actionFlowDiagram} />

POSTリクエストを受信してからActionが実行されるまでの詳細な判定フローです。

##### 処理の流れ
1. **Action定義の確認** - 該当ページにActionsが定義されているか確認します
2. **FormData解析** - リクエストボディからフォームデータを解析します
3. **Named Action判定** - URLに`?/actionName`が含まれているか確認します
4. **Action実行** - 該当するAction関数またはdefaultアクションを実行します
5. **結果処理** - リダイレクト、エラー、成功のいずれかを処理します

#### 2. Actionとload関数の実行順序

Actions実行後のデータフローを理解することが重要です。

```typescript
// +page.server.ts
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  console.log('1. Load関数が実行されます');

  // 初期データの取得
  const posts = await getPosts();

  return {
    posts,
    timestamp: Date.now() // いつ実行されたか確認用
  };
};

export const actions = {
  create: async ({ request }) => {
    console.log('2. Action（create）が実行されます');

    const data = await request.formData();
    const title = data.get('title');

    // 新しい投稿を作成
    await createPost({ title });

    // 成功を返す
    // この後、自動的にload関数が再実行される
    return { success: true };
  }
} satisfies Actions;
```

#### 実行順序
1. **初回ページ読み込み**: `load` → ページレンダリング
2. **フォーム送信時**: `action` → `load` → ページ再レンダリング
3. **use:enhance使用時**: `action` → 必要に応じて`load` → 差分更新

### リダイレクト時の動作

Actionからリダイレクトする場合の処理フローを理解することで、ログイン後の画面遷移などを適切に実装できます。

```typescript
import { redirect } from '@sveltejs/kit';

export const actions = {
  login: async ({ request, cookies }) => {
    // ログイン処理
    const { email, password } = await getFormData(request);
    const user = await authenticate(email, password);

    if (user) {
      // セッション設定
      cookies.set('session', user.sessionId, { path: '/' });

      // リダイレクト（303 See Other）
      // この時点でaction処理は終了
      throw redirect(303, '/dashboard');
      // ↓ これ以降のコードは実行されない
    }

    return fail(401, { message: 'Invalid credentials' });
  }
} satisfies Actions;
```

<Mermaid diagram={redirectFlowDiagram} />

#### リダイレクトの仕組み
- **成功時** - `redirect()`をthrowすることで303ステータスを返却し、ブラウザを新しいページへ遷移させます
- **エラー時** - エラーデータを返却し、同じページで再描画してエラーメッセージを表示します
- **重要** - redirectは`throw`で実行するため、それ以降のコードは実行されません

### エラー処理のタイミング

```typescript
export const actions = {
  default: async ({ request }) => {
    try {
      const data = await request.formData();

      // バリデーションエラー（400番台）
      if (!data.get('email')) {
        // failヘルパーを使用
        return fail(400, {
          missing: true,
          message: 'Email is required'
        });
      }

      // 処理実行
      await processData(data);

      return { success: true };

    } catch (error) {
      // サーバーエラー（500番台）
      // この場合、エラーページが表示される
      throw error;
    }
  }
} satisfies Actions;
```

### use:enhance のライフサイクル

<Mermaid diagram={enhanceLifecycleDiagram} />

`use:enhance`の処理フローを理解することで、柔軟なカスタマイズが可能になります。

#### 各ステージの説明
1. **送信前処理** - バリデーションやローディング表示を開始
2. **キャンセル判定** - 条件によって送信を中止可能
3. **サーバー処理** - Actionが実行され結果を返却
4. **result判定** - success/failure/redirectを判定して適切に処理
5. **DOM更新** - update関数でページを更新

```typescript
use:enhance={({ form, data, action, cancel }) => {
  // ステップ1: 送信前処理（同期的に実行）
  console.log('フォーム送信開始');

  // バリデーションやローディング表示
  const email = data.get('email')?.toString();
  if (!email?.includes('@')) {
    alert('メールアドレスが不正です');
    cancel(); // ステップ2: キャンセル判定
    return;
  }

  // ローディング開始
  submitting = true;

  // ステップ3-7: 非同期処理を返す
  return async ({ result, update }) => {
    // ステップ8: レスポンス受信後の処理
    console.log('サーバーからのレスポンス:', result);

    // ステップ9-10: result.typeの判定と処理
    if (result.type === 'success') {
      // 成功時のカスタム処理
      console.log('処理成功');
      form.reset(); // フォームをリセット
    } else if (result.type === 'failure') {
      // 失敗時のカスタム処理
      console.log('エラー:', result.data);
      errors = result.data?.errors || {};
    } else if (result.type === 'redirect') {
      // リダイレクト時の処理
      console.log('リダイレクト先:', result.location);
      // 通常は自動的に処理される
    }

    // ステップ11: DOM更新（update関数）
    await update();

    // ステップ12: DOM更新後の処理
    submitting = false;
    console.log('すべての処理完了');
  };
}}
```

### パフォーマンスの考慮事項

#### 並列処理の活用

```typescript
export const load: PageServerLoad = async ({ parent }) => {
  // 親のloadを待つ必要がある場合
  const parentData = await parent();

  // 並列でデータ取得
  const [posts, categories, tags] = await Promise.all([
    getPosts(),
    getCategories(),
    getTags()
  ]);

  return {
    ...parentData,
    posts,
    categories,
    tags
  };
};
```

#### invalidateの最適化

```svelte
<script lang="ts">
  import { invalidate, invalidateAll } from '$app/navigation';

  async function handleSubmit() {
    // 特定のloadだけ再実行
    await invalidate('app:posts');

    // または全てのloadを再実行
    // await invalidateAll();
  }
</script>
```

## 複数のActions

一つのページで複数の異なるアクションを処理する必要がある場合、Named Actions（名前付きアクション）を使用します。これにより、更新、削除、公開など、異なる操作を同じページで実装できます。

### Named Actions の実行フロー

<Mermaid diagram={namedActionsDiagram} />

上図は、同一ページで複数のActionを処理する際のフローを示しています。

#### 処理のポイント
- **URLパラメータ** - `?/update`や`?/delete`のようにAction名をURLに付与します
- **適切なAction実行** - URLパラメータに基づいて該当するAction関数を実行します
- **異なる処理** - 更新はその場で結果表示、削除はリダイレクトなど、柔軟な処理が可能です

### Named Actions の実装

```typescript
// src/routes/posts/[id]/+page.server.ts
import type { Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';

export const actions = {
  update: async ({ request, params, locals }) => {
    const data = await request.formData();
    const title = data.get('title')?.toString();
    const content = data.get('content')?.toString();
    
    if (!title || !content) {
      return fail(400, {
        error: 'タイトルと内容は必須です'
      });
    }
    
    await updatePost(params.id, { title, content });
    
    return { success: true };
  },
  
  delete: async ({ params, locals }) => {
    const user = await locals.getUser();
    
    if (!user?.isAdmin) {
      return fail(403, {
        error: '権限がありません'
      });
    }
    
    await deletePost(params.id);
    throw redirect(303, '/posts');
  },
  
  publish: async ({ params }) => {
    await publishPost(params.id);
    return { published: true };
  }
} satisfies Actions;
```

```svelte
<!-- src/routes/posts/[id]/+page.svelte -->
<script lang="ts">
  import { enhance } from '$app/forms';
  import type { PageData, ActionData } from './$types';
  
  let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<!-- 更新フォーム -->
<form method="POST" action="?/update" use:enhance>
  <input name="title" value={data.post.title} />
  <textarea name="content">{data.post.content}</textarea>
  <button type="submit">更新</button>
</form>

<!-- 削除フォーム -->
<form method="POST" action="?/delete" use:enhance>
  <button type="submit" class="danger">削除</button>
</form>

<!-- 公開フォーム -->
<form method="POST" action="?/publish" use:enhance>
  <button type="submit" class="primary">公開</button>
</form>
```

## 高度なバリデーション

フォームデータの検証は、アプリケーションのセキュリティと信頼性にとって極めて重要です。ここでは、型安全性を保ちながら強力なバリデーションを実装する方法を紹介します。

### バリデーションフロー

<Mermaid diagram={validationFlowDiagram} />

バリデーションは段階的に実施し、各ステップでエラーを検出します。

#### バリデーションの流れ
1. **必須項目チェック** - 必要なフィールドが存在するか確認
2. **型バリデーション** - メールアドレス、数値、日付などの形式チェック
3. **ビジネスルール** - 重複チェック、権限確認など
4. **エラーハンドリング** - エラー時は入力値を保持して再表示

### Zodを使った型安全なバリデーション

Zodは、TypeScriptファーストのスキーマ検証ライブラリです。スキーマ定義から型を自動生成でき、実行時とコンパイル時の両方で型安全性を保証します。

```typescript
// src/routes/register/+page.server.ts
import type { Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { z } from 'zod';
import { superValidate, message } from 'sveltekit-superforms/server';

const schema = z.object({
  username: z.string()
    .min(3, 'ユーザー名は3文字以上')
    .max(20, 'ユーザー名は20文字以下')
    .regex(/^[a-zA-Z0-9_]+$/, '英数字とアンダースコアのみ使用可能'),
  
  email: z.string()
    .email('有効なメールアドレスを入力してください'),
  
  password: z.string()
    .min(8, 'パスワードは8文字以上')
    .regex(/[A-Z]/, '大文字を含めてください')
    .regex(/[a-z]/, '小文字を含めてください')
    .regex(/[0-9]/, '数字を含めてください'),
  
  confirmPassword: z.string(),
  
  terms: z.boolean()
    .refine((val) => val === true, '利用規約に同意してください')
}).refine((data) => data.password === data.confirmPassword, {
  message: "パスワードが一致しません",
  path: ["confirmPassword"]
});

export const actions = {
  default: async ({ request }) => {
    const form = await superValidate(request, schema);
    
    if (!form.valid) {
      return fail(400, { form });
    }
    
    // ユーザー登録処理
    const { username, email, password } = form.data;
    
    try {
      await createUser({ username, email, password });
      throw redirect(303, '/welcome');
    } catch (error) {
      return message(form, 'ユーザー登録に失敗しました');
    }
  }
} satisfies Actions;
```

### カスタムバリデーション関数

Zodを使わずに、独自のバリデーションロジックを実装することも可能です。以下は、汎用的なバリデーション関数の実装例です。

```typescript
// src/lib/validators.ts
export interface ValidationError {
  field: string;
  message: string;
}

export function validateForm<T extends Record<string, any>>(
  data: FormData,
  validators: Record<keyof T, (value: any) => string | null>
): { valid: boolean; errors: ValidationError[]; values: Partial<T> } {
  const errors: ValidationError[] = [];
  const values: Partial<T> = {};
  
  for (const [field, validator] of Object.entries(validators)) {
    const value = data.get(field);
    const error = validator(value);
    
    if (error) {
      errors.push({ field, message: error });
    } else {
      values[field as keyof T] = value as T[keyof T];
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    values
  };
}
```

## ファイルアップロード

SvelteKitでファイルアップロードを実装する方法を解説します。セキュリティを考慮しながら、画像やドキュメントなどのファイルを安全に処理します。

### ファイルアップロードのフロー

<Mermaid diagram={fileUploadFlowDiagram} />

ファイルアップロードの全体的な流れを示しています。

#### アップロードの特徴
- **プログレス表示** - XMLHttpRequestを使用してリアルタイムで進捗を表示
- **サーバー検証** - ファイルサイズとタイプをチェック
- **ストレージ保存** - ローカルまたはクラウドストレージへ保存
- **プレビュー表示** - アップロード後に画像を即座に表示

### 基本的なファイルアップロード

FormDataを使用してファイルを受け取り、サーバーに保存する基本的な実装です。

```typescript
// src/routes/upload/+page.server.ts
import type { Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { writeFile } from 'fs/promises';
import path from 'path';

export const actions = {
  default: async ({ request }) => {
    const data = await request.formData();
    const file = data.get('file') as File;
    
    if (!file) {
      return fail(400, { error: 'ファイルを選択してください' });
    }
    
    // ファイルサイズチェック（5MB）
    if (file.size > 5 * 1024 * 1024) {
      return fail(400, { error: 'ファイルサイズは5MB以下にしてください' });
    }
    
    // ファイルタイプチェック
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return fail(400, { error: '画像ファイルのみアップロード可能です' });
    }
    
    // ファイル保存
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = path.join('uploads', fileName);
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    await writeFile(filePath, buffer);
    
    return {
      success: true,
      fileName,
      url: `/uploads/${fileName}`
    };
  }
} satisfies Actions;
```

### プログレス表示付きアップロード

大きなファイルのアップロード時に進捗を表示する方法を2つ紹介します。

#### 方法1: Fetch API + Streams API（モダンな方法）

```svelte
<!-- src/routes/upload/+page.svelte -->
<script lang="ts">
  import type { ActionData } from './$types';

  let { form }: { form: ActionData } = $props();

  let uploading = $state(false);
  let progress = $state(0);
  let fileInput: HTMLInputElement;

  async function handleUpload() {
    const file = fileInput.files?.[0];
    if (!file) return;

    uploading = true;
    progress = 0;

    const formData = new FormData();
    formData.append('file', file);

    try {
      // ReadableStreamを使用してアップロード進捗を追跡
      const response = await fetch('/upload', {
        method: 'POST',
        body: formData,
        // 注意: Fetch APIでのアップロード進捗は限定的
        // ダウンロード進捗の方が簡単に取得可能
      });

      if (response.ok) {
        const data = await response.json();
        // 成功処理
        form = data;
      }
    } catch (error) {
      console.error('アップロードエラー:', error);
    } finally {
      uploading = false;
    }
  }

  // 代替案: チャンク分割アップロード（より正確な進捗）
  async function handleChunkedUpload() {
    const file = fileInput.files?.[0];
    if (!file) return;

    const chunkSize = 1024 * 1024; // 1MB
    const totalChunks = Math.ceil(file.size / chunkSize);

    uploading = true;

    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      const chunk = file.slice(start, end);

      const formData = new FormData();
      formData.append('chunk', chunk);
      formData.append('index', i.toString());
      formData.append('total', totalChunks.toString());
      formData.append('filename', file.name);

      await fetch('/upload/chunk', {
        method: 'POST',
        body: formData
      });

      progress = Math.round(((i + 1) / totalChunks) * 100);
    }

    uploading = false;
  }
</script>

<button onclick={handleChunkedUpload}>
  チャンク分割でアップロード（推奨）
</button>
```

#### 方法2: XMLHttpRequest（レガシーだが確実）

```svelte
<script lang="ts">
  // XMLHttpRequestはアップロード進捗を確実に取得できる
  // 古い方法だが、プログレス表示には最適

  async function handleUploadXHR() {
    const file = fileInput.files?.[0];
    if (!file) return;

    uploading = true;
    progress = 0;

    const formData = new FormData();
    formData.append('file', file);

    const xhr = new XMLHttpRequest();

    // プログレスイベント（これがFetch APIでは難しい）
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        progress = Math.round((e.loaded / e.total) * 100);
      }
    });

    // 完了イベント
    xhr.addEventListener('load', () => {
      uploading = false;
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        form = response;
      }
    });

    xhr.open('POST', '/upload');
    xhr.send(formData);
  }
</script>

<form onsubmit={(e) => { e.preventDefault(); handleUpload(); }}
  <input 
    type="file" 
    bind:this={fileInput}
    accept="image/*"
    disabled={uploading}
  />
  
  {#if uploading}
    <div class="progress-bar">
      <div 
        class="progress-fill" 
        style="width: {progress}%"
      />
    </div>
    <p>{progress}% アップロード中...</p>
  {/if}
  
  <button type="submit" disabled={uploading}>
    アップロード
  </button>
</form>

{#if form?.success}
  <img src={form.url} alt="Uploaded" />
{/if}
```

## CSRFプロテクション

CSRF（Cross-Site Request Forgery）攻撃から保護するため、トークンベースの検証を実装します。これにより、悪意のあるサイトからの不正なフォーム送信を防ぐことができます。

### トークンベースのCSRF対策

Hooksを使用してCSRFトークンを生成し、フォーム送信時に検証する実装です。

:::info[resolve関数について]
`resolve`関数は、SvelteKitのHandleフック内で使用される関数で、**SvelteKitアプリケーション内部のルーティングとリクエスト処理**を実行する役割を持ちます。

```typescript
// Handleフックの基本構造
export const handle: Handle = async ({ event, resolve }) => {
  // リクエスト前の処理（認証、ヘッダー追加など）

  // SvelteKit内部のルーティング処理を実行
  const response = await resolve(event);

  // レスポンス後の処理（ヘッダー追加、ログなど）

  return response;
};
```

`resolve(event)`を呼ぶことで、
- SvelteKitの**アプリケーション内のルート**（`src/routes`配下）へのルーティング
- 該当ページの**Load関数やActions**の実行
- **ページのレンダリング**とレスポンス生成

が行われます。外部サイトへのリクエストではなく、**SvelteKitアプリケーション内部の処理**を指します。

Hooksの詳細については、今後作成予定の[Hooksページ](/sveltekit/server/hooks/)で解説予定です。
:::

```typescript
// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit';
import { randomBytes } from 'crypto';

export const handle: Handle = async ({ event, resolve }) => {
  // CSRFトークンの生成（リクエスト前の処理）
  let token = event.cookies.get('csrf');

  if (!token) {
    token = randomBytes(32).toString('hex');
    event.cookies.set('csrf', token, {
      httpOnly: true,
      sameSite: 'strict',
      secure: true,
      path: '/'
    });
  }

  event.locals.csrf = token;

  // 通常のリクエスト処理を実行
  return resolve(event);
};
```

```typescript
// src/routes/secure/+page.server.ts
import type { Actions } from './$types';
import { fail } from '@sveltejs/kit';

export const actions = {
  default: async ({ request, locals }) => {
    const data = await request.formData();
    const csrfToken = data.get('csrf_token');
    
    // CSRFトークンの検証
    if (csrfToken !== locals.csrf) {
      return fail(403, {
        error: '不正なリクエストです'
      });
    }
    
    // 安全な処理を実行
    // ...
  }
} satisfies Actions;
```

## リアルタイムバリデーション

ユーザーが入力中にリアルタイムでバリデーションを行うことで、エラーを早期に発見し、より良いユーザー体験を提供できます。

### デバウンス付きリアルタイム検証

デバウンス処理により、入力が完了してから一定時間後にバリデーションを実行します。これにより、サーバーへの不要なリクエストを削減できます。

```svelte
<script lang="ts">
  let email = $state('');
  let emailError = $state('');
  let checking = $state(false);
  let timeoutId: number;
  
  async function checkEmail(value: string) {
    // 基本的なバリデーション
    if (!value) {
      emailError = '';
      return;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      emailError = '有効なメールアドレスを入力してください';
      return;
    }
    
    checking = true;
    emailError = '';
    
    try {
      // サーバーでの重複チェック
      const response = await fetch(`/api/check-email?email=${encodeURIComponent(value)}`);
      const { available } = await response.json();
      
      if (!available) {
        emailError = 'このメールアドレスは既に使用されています';
      }
    } finally {
      checking = false;
    }
  }
  
  $effect(() => {
    clearTimeout(timeoutId);
    
    if (email) {
      timeoutId = setTimeout(() => {
        checkEmail(email);
      }, 500);
    }
  });
</script>

<div class="form-field">
  <input 
    type="email"
    bind:value={email}
    placeholder="メールアドレス"
    class:error={emailError}
  />
  
  {#if checking}
    <span class="checking">確認中...</span>
  {/if}
  
  {#if emailError}
    <span class="error-message">{emailError}</span>
  {/if}
</div>
```

## 高度なuse:enhance

`use:enhance`ディレクティブをカスタマイズすることで、フォーム送信の前後に独自の処理を追加できます。ローディング状態の管理やエラーハンドリングなど、きめ細かい制御が可能になります。

### カスタムエンハンス関数

送信前後の処理をカスタマイズし、ローディング状態やエラー表示を制御する実装例です。

```svelte
<script lang="ts">
  import { enhance } from '$app/forms';
  import { invalidateAll } from '$app/navigation';
  
  let submitting = $state(false);
  let errors = $state<Record<string, string>>({});
  
  function handleEnhance() {
    return async ({ action, data, form, cancel }) => {
      // 送信前の処理
      submitting = true;
      errors = {};
      
      // カスタムバリデーション
      const email = data.get('email')?.toString();
      if (email && !email.includes('@')) {
        errors.email = '有効なメールアドレスを入力してください';
        cancel();
        submitting = false;
        return;
      }
      
      // デフォルトの送信処理を実行
      return async ({ result, update }) => {
        submitting = false;
        
        if (result.type === 'success') {
          // 成功時の処理
          form.reset();
          await invalidateAll();
        } else if (result.type === 'failure') {
          // エラー時の処理
          errors = result.data?.errors || {};
        }
        
        // デフォルトの更新処理
        await update();
      };
    };
  }
</script>

<form method="POST" use:enhance={handleEnhance}>
  <input 
    name="email" 
    type="email"
    disabled={submitting}
  />
  
  {#if errors.email}
    <span class="error">{errors.email}</span>
  {/if}
  
  <button type="submit" disabled={submitting}>
    {submitting ? '送信中...' : '送信'}
  </button>
</form>
```

### オプティミスティックUI

オプティミスティックUIは、サーバーレスポンスを待たずに、成功を前提としてUIを即座に更新する手法です。これにより、アプリケーションがより高速に感じられます。エラーが発生した場合は、変更をロールバックします。

```svelte
<script lang="ts">
  import { enhance } from '$app/forms';
  import type { PageData } from './$types';
  
  let { data }: { data: PageData } = $props();
  
  let todos = $state([...data.todos]);
  let newTodo = $state('');
  
  function handleAddTodo() {
    return async ({ data, cancel }) => {
      const tempId = `temp-${Date.now()}`;
      const tempTodo = {
        id: tempId,
        text: newTodo,
        completed: false,
        pending: true
      };
      
      // オプティミスティックアップデート
      todos = [...todos, tempTodo];
      newTodo = '';
      
      return async ({ result }) => {
        if (result.type === 'success') {
          // 実際のIDで更新
          const index = todos.findIndex(t => t.id === tempId);
          if (index !== -1 && result.data?.todo) {
            todos[index] = result.data.todo;
          }
        } else {
          // エラー時はロールバック
          todos = todos.filter(t => t.id !== tempId);
          newTodo = tempTodo.text;
        }
      };
    };
  }
</script>

<form method="POST" action="?/add" use:enhance={handleAddTodo}>
  <input 
    name="text" 
    bind:value={newTodo}
    placeholder="新しいTODO"
  />
  <button type="submit">追加</button>
</form>

<ul>
  {#each todos as todo}
    <li class:pending={todo.pending}>
      {todo.text}
    </li>
  {/each}
</ul>
```

## フォームの状態管理

複雑なフォームでは、状態管理が重要になります。Svelte 5のルーンを活用したフォームストアパターンで、再利用可能な状態管理ロジックを実装します。

### フォームストアパターン

汎用的なフォームストアを作成し、バリデーション、タッチ状態、送信状態などを一元管理する実装です。

```typescript
// src/lib/stores/form.svelte.ts
export function createFormStore<T extends Record<string, any>>(
  initialValues: T
) {
  let values = $state(initialValues);
  let errors = $state<Partial<Record<keyof T, string>>>({});
  let touched = $state<Partial<Record<keyof T, boolean>>>({});
  let submitting = $state(false);
  
  return {
    get values() { return values; },
    get errors() { return errors; },
    get touched() { return touched; },
    get submitting() { return submitting; },
    
    setValue<K extends keyof T>(field: K, value: T[K]) {
      values[field] = value;
      touched[field] = true;
    },
    
    setError<K extends keyof T>(field: K, error: string) {
      errors[field] = error;
    },
    
    clearErrors() {
      errors = {};
    },
    
    reset() {
      values = initialValues;
      errors = {};
      touched = {};
      submitting = false;
    },
    
    async submit(action: (values: T) => Promise<void>) {
      submitting = true;
      try {
        await action(values);
      } finally {
        submitting = false;
      }
    }
  };
}
```

## 実践的な実装例

実際のアプリケーションでよく使われる、複雑なフォームパターンの実装例を紹介します。

### 複雑なフォームウィザード

ステップバイステップでユーザーを導くウィザード形式のフォームです。各ステップでの入力を保持しながら、最後にまとめて送信します。

```svelte
<!-- src/routes/wizard/+page.svelte -->
<script lang="ts">
  import { enhance } from '$app/forms';
  
  let currentStep = $state(1);
  const totalSteps = 3;
  
  let formData = $state({
    // Step 1
    name: '',
    email: '',
    // Step 2
    company: '',
    position: '',
    // Step 3
    plan: 'basic',
    billing: 'monthly'
  });
  
  function nextStep() {
    if (currentStep < totalSteps) {
      currentStep++;
    }
  }
  
  function prevStep() {
    if (currentStep > 1) {
      currentStep--;
    }
  }
</script>

<div class="wizard">
  <div class="progress">
    {#each Array(totalSteps) as _, i}
      <div 
        class="step" 
        class:active={i + 1 <= currentStep}
      >
        {i + 1}
      </div>
    {/each}
  </div>
  
  <form method="POST" use:enhance>
    {#if currentStep === 1}
      <h2>基本情報</h2>
      <input 
        name="name" 
        bind:value={formData.name}
        placeholder="お名前"
        required
      />
      <input 
        name="email" 
        type="email"
        bind:value={formData.email}
        placeholder="メールアドレス"
        required
      />
    {/if}
    
    {#if currentStep === 2}
      <h2>会社情報</h2>
      <input 
        name="company" 
        bind:value={formData.company}
        placeholder="会社名"
      />
      <input 
        name="position" 
        bind:value={formData.position}
        placeholder="役職"
      />
    {/if}
    
    {#if currentStep === 3}
      <h2>プラン選択</h2>
      <select name="plan" bind:value={formData.plan}>
        <option value="basic">ベーシック</option>
        <option value="pro">プロ</option>
        <option value="enterprise">エンタープライズ</option>
      </select>
      
      <label>
        <input 
          type="radio" 
          name="billing" 
          value="monthly"
          bind:group={formData.billing}
        />
        月払い
      </label>
      
      <label>
        <input 
          type="radio" 
          name="billing" 
          value="yearly"
          bind:group={formData.billing}
        />
        年払い（20%オフ）
      </label>
    {/if}
    
    <div class="buttons">
      {#if currentStep > 1}
        <button type="button" onclick={prevStep}>
          戻る
        </button>
      {/if}
      
      {#if currentStep < totalSteps}
        <button type="button" onclick={nextStep}>
          次へ
        </button>
      {:else}
        <button type="submit">
          登録完了
        </button>
      {/if}
    </div>
  </form>
</div>
```

## トラブルシューティング

:::warning[Actionが実行されない]
- ファイル名が `+page.server.ts` であることを確認
- `export const actions` が正しく定義されているか確認
- フォームの `method="POST"` が設定されているか確認
:::

:::tip[フォームデータが取得できない]
`request.formData()` を使用し、適切に型変換
```typescript
const data = await request.formData();
const value = data.get('field')?.toString() || '';
```
:::

:::caution[use:enhanceで問題が発生]
カスタムエンハンス関数では必ず適切な戻り値を返す。
```javascript
use:enhance={() => {
  return async ({ result, update }) => {
    await update(); // 忘れずに呼ぶ
  };
}}
```
:::

## まとめ

SvelteKitのActions とフォーム処理は、
- **プログレッシブ**: JavaScript無効でも動作
- **型安全**: TypeScriptで完全サポート
- **柔軟**: カスタマイズ可能なエンハンスメント
- **実践的**: バリデーション、ファイルアップロード対応

## 次のステップ

Form Actionsの実践的な使用例は以下をご覧ください。
- **[Cookie/Session認証](/examples/auth-cookie-session/)** - ログインフォームの完全実装

[APIルート](/sveltekit/server/api-routes/)で、RESTful APIの構築について学びましょう。

