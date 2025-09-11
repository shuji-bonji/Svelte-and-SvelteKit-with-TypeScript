---
title: フォーム処理とActions
description: SvelteKitのフォーム処理を完全マスター - Actions、Progressive Enhancement、バリデーション、ファイルアップロードまで
---


SvelteKitのActionsは、プログレッシブエンハンスメントに対応した強力なフォーム処理システムです。JavaScriptが無効でも動作し、有効時にはシームレスな体験を提供します。このガイドでは、基本的なフォーム処理から高度なバリデーション、ファイルアップロードまで、実践的なTypeScriptコード例で完全解説します。

## Actions の基本概念

SvelteKitのActionsは、サーバーサイドでフォーム送信を処理する仕組みです。従来のWebアプリケーションと同じようにHTMLフォームを使いながら、モダンなユーザー体験を提供できます。

### Progressive Enhancement とは

Progressive Enhancement（プログレッシブエンハンスメント）は、基本的なHTML機能から始めて、段階的に機能を強化していく開発アプローチです。SvelteKitのフォームは、JavaScript無効でも動作する**プログレッシブエンハンスメント**を実現

- **JavaScript無効時**: 通常のHTMLフォーム送信
- **JavaScript有効時**: ページリロードなしでフォーム処理
- **自動的な切り替え**: use:enhance で自動最適化

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

## 複数のActions

一つのページで複数の異なるアクションを処理する必要がある場合、Named Actions（名前付きアクション）を使用します。これにより、更新、削除、公開など、異なる操作を同じページで実装できます。

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

XMLHttpRequestを使用することで、アップロードの進捗状況をリアルタイムで表示できます。大きなファイルをアップロードする際のユーザー体験を向上させます。

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
    
    const xhr = new XMLHttpRequest();
    
    // プログレスイベント
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
        // 成功処理
      }
    });
    
    xhr.open('POST', '/upload');
    xhr.send(formData);
  }
</script>

<form on:submit|preventDefault={handleUpload}>
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

```typescript
// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit';
import { randomBytes } from 'crypto';

export const handle: Handle = async ({ event, resolve }) => {
  // CSRFトークンの生成
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
        <button type="button" on:click={prevStep}>
          戻る
        </button>
      {/if}
      
      {#if currentStep < totalSteps}
        <button type="button" on:click={nextStep}>
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

[APIルート](/sveltekit/server/api-routes/)で、RESTful APIの構築について学びましょう。

