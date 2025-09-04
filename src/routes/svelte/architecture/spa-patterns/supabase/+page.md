---
title: Svelte + Supabase
description: SvelteとSupabaseでリアルタイムWebアプリを構築。PostgreSQL、認証、リアルタイム通信、Row Level Securityの実装をTypeScriptで解説
---

<script>
  import { base } from '$app/paths';
  import Mermaid from '$lib/components/Mermaid.svelte';
  
  const supabaseArchitecture = `flowchart TB
    subgraph Frontend[\"🌐 Svelte SPA\"]
      App[Svelteアプリ]
      Store[状態管理]
      Auth[認証状態]
    end
    
    subgraph Supabase[\"⚡ Supabase Cloud\"]
      AuthService[Auth Service]
      Database[(PostgreSQL)]
      Realtime[Realtime]
      Storage[Storage]
      Edge[Edge Functions]
    end
    
    App --> Store
    Store --> Auth
    Auth <--> AuthService
    App <--> Database
    App <--> Realtime
    App <--> Storage
    App <--> Edge
    
    Database --> Realtime
    
    style App fill:#ff3e00,color:#fff
    style Database fill:#3ECF8E,color:#fff
    style Realtime fill:#1E40AF,color:#fff`;
</script>

SupabaseはオープンソースのFirebase代替として人気のBaaSです。PostgreSQLベース、リアルタイム機能、Row Level Security（RLS）など、エンタープライズレベルの機能を提供します。

## Supabaseの特徴

<Mermaid diagram={supabaseArchitecture} />

### 主な機能

- 🐘 **PostgreSQL** - 完全なSQLデータベース
- 🔐 **認証** - Email/Password、OAuth、マジックリンク
- ⚡ **リアルタイム** - データベースの変更をリアルタイムで同期
- 🛡️ **RLS** - Row Level Securityでセキュアなアクセス制御
- 📦 **ストレージ** - ファイルアップロード・管理
- 🚀 **Edge Functions** - Deno Deployベースのサーバーレス関数

## セットアップ

### 1. プロジェクト作成

```bash
npm create vite@latest my-svelte-supabase -- --template svelte-ts
cd my-svelte-supabase
npm install @supabase/supabase-js
```

### 2. Supabaseクライアント設定

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true
    }
  }
);
```

### 3. 型定義の生成

```bash
# Supabase CLIで型定義を自動生成
npx supabase gen types typescript --project-id your-project-id > src/lib/database.types.ts
```

## 認証の実装

### 認証ストア（Svelte 5 Runes）

```typescript
// src/lib/stores/auth.svelte.ts
import { supabase } from '$lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

class AuthStore {
  user = $state<User | null>(null);
  session = $state<Session | null>(null);
  loading = $state(true);
  
  constructor() {
    // 初期セッション取得
    supabase.auth.getSession().then(({ data: { session } }) => {
      this.session = session;
      this.user = session?.user ?? null;
      this.loading = false;
    });
    
    // 認証状態の監視
    supabase.auth.onAuthStateChange((_event, session) => {
      this.session = session;
      this.user = session?.user ?? null;
    });
  }
  
  async signInWithEmail(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    return data;
  }
  
  async signInWithOAuth(provider: 'google' | 'github') {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
    
    if (error) throw error;
    return data;
  }
  
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }
  
  get isAuthenticated() {
    return !!this.user;
  }
}

export const authStore = new AuthStore();
```

### 認証コンポーネント

```svelte
<!-- src/lib/components/AuthForm.svelte -->
<script lang="ts">
  import { authStore } from '$lib/stores/auth.svelte';
  
  let email = $state('');
  let password = $state('');
  let isSignUp = $state(false);
  let error = $state<string | null>(null);
  let loading = $state(false);
  
  async function handleSubmit() {
    loading = true;
    error = null;
    
    try {
      if (isSignUp) {
        await supabase.auth.signUp({ email, password });
      } else {
        await authStore.signInWithEmail(email, password);
      }
    } catch (err) {
      error = err instanceof Error ? err.message : 'エラーが発生しました';
    } finally {
      loading = false;
    }
  }
  
  async function handleOAuth(provider: 'google' | 'github') {
    try {
      await authStore.signInWithOAuth(provider);
    } catch (err) {
      error = err instanceof Error ? err.message : 'エラーが発生しました';
    }
  }
</script>

{#if authStore.user}
  <div class="user-profile">
    <p>ログイン中: {authStore.user.email}</p>
    <button onclick={() => authStore.signOut()}>ログアウト</button>
  </div>
{:else}
  <form onsubmit={handleSubmit}>
    <input
      type="email"
      bind:value={email}
      placeholder="メールアドレス"
      required
    />
    <input
      type="password"
      bind:value={password}
      placeholder="パスワード"
      required
    />
    
    {#if error}
      <p class="error">{error}</p>
    {/if}
    
    <button type="submit" disabled={loading}>
      {isSignUp ? 'サインアップ' : 'ログイン'}
    </button>
    
    <button type="button" onclick={() => isSignUp = !isSignUp}>
      {isSignUp ? 'ログインに切り替え' : 'サインアップに切り替え'}
    </button>
  </form>
  
  <div class="oauth-buttons">
    <button onclick={() => handleOAuth('google')}>
      Googleでログイン
    </button>
    <button onclick={() => handleOAuth('github')}>
      GitHubでログイン
    </button>
  </div>
{/if}
```

## データベース操作

### CRUDの実装

```typescript
// src/lib/stores/todos.svelte.ts
import { supabase } from '$lib/supabase';
import { authStore } from './auth.svelte';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  user_id: string;
  created_at: string;
}

class TodoStore {
  todos = $state<Todo[]>([]);
  loading = $state(false);
  
  constructor() {
    // リアルタイム購読の設定
    this.subscribeToChanges();
  }
  
  async fetchTodos() {
    if (!authStore.user) return;
    
    this.loading = true;
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', authStore.user.id)
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      this.todos = data;
    }
    this.loading = false;
  }
  
  async addTodo(text: string) {
    if (!authStore.user) return;
    
    const { data, error } = await supabase
      .from('todos')
      .insert({
        text,
        user_id: authStore.user.id,
        completed: false
      })
      .select()
      .single();
    
    if (!error && data) {
      this.todos = [data, ...this.todos];
    }
  }
  
  async updateTodo(id: string, updates: Partial<Todo>) {
    const { error } = await supabase
      .from('todos')
      .update(updates)
      .eq('id', id);
    
    if (!error) {
      this.todos = this.todos.map(todo =>
        todo.id === id ? { ...todo, ...updates } : todo
      );
    }
  }
  
  async deleteTodo(id: string) {
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id);
    
    if (!error) {
      this.todos = this.todos.filter(todo => todo.id !== id);
    }
  }
  
  private subscribeToChanges() {
    supabase
      .channel('todos_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'todos',
          filter: `user_id=eq.${authStore.user?.id}`
        },
        (payload) => {
          // リアルタイム更新の処理
          if (payload.eventType === 'INSERT' && payload.new) {
            this.todos = [payload.new as Todo, ...this.todos];
          } else if (payload.eventType === 'UPDATE' && payload.new) {
            this.todos = this.todos.map(todo =>
              todo.id === payload.new!.id ? payload.new as Todo : todo
            );
          } else if (payload.eventType === 'DELETE' && payload.old) {
            this.todos = this.todos.filter(todo => 
              todo.id !== (payload.old as Todo).id
            );
          }
        }
      )
      .subscribe();
  }
}

export const todoStore = new TodoStore();
```

## Row Level Security (RLS)

### データベースポリシーの設定

```sql
-- todos テーブルのRLSを有効化
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分のTODOのみ参照可能
CREATE POLICY "Users can view own todos" ON todos
  FOR SELECT USING (auth.uid() = user_id);

-- ユーザーは自分のTODOのみ作成可能
CREATE POLICY "Users can insert own todos" ON todos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ユーザーは自分のTODOのみ更新可能
CREATE POLICY "Users can update own todos" ON todos
  FOR UPDATE USING (auth.uid() = user_id);

-- ユーザーは自分のTODOのみ削除可能
CREATE POLICY "Users can delete own todos" ON todos
  FOR DELETE USING (auth.uid() = user_id);
```

## ファイルストレージ

### 画像アップロードの実装

```typescript
// src/lib/utils/storage.ts
import { supabase } from '$lib/supabase';

export async function uploadAvatar(file: File, userId: string) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${Date.now()}.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });
  
  if (error) throw error;
  
  // 公開URLの取得
  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName);
  
  return publicUrl;
}

// 画像削除
export async function deleteAvatar(path: string) {
  const { error } = await supabase.storage
    .from('avatars')
    .remove([path]);
  
  if (error) throw error;
}
```

## Edge Functions

### Deno Edge Function の作成

```typescript
// supabase/functions/send-email/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req: Request) => {
  const { email, subject, message } = await req.json();
  
  // Supabaseクライアントの初期化
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
  
  // メール送信処理（例：Resend API）
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'noreply@example.com',
      to: email,
      subject,
      html: message
    })
  });
  
  return new Response(
    JSON.stringify({ success: response.ok }),
    { headers: { 'Content-Type': 'application/json' } }
  );
});
```

### Edge Functionの呼び出し

```typescript
// src/lib/utils/functions.ts
import { supabase } from '$lib/supabase';

export async function sendEmail(
  email: string,
  subject: string,
  message: string
) {
  const { data, error } = await supabase.functions.invoke('send-email', {
    body: { email, subject, message }
  });
  
  if (error) throw error;
  return data;
}
```

## ベストプラクティス

### 1. 環境変数の管理

```bash
# .env.local
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. エラーハンドリング

```typescript
// src/lib/utils/error-handler.ts
import { PostgrestError } from '@supabase/supabase-js';

export function handleSupabaseError(error: PostgrestError | null): string {
  if (!error) return '';
  
  // 一般的なエラーコード
  const errorMessages: Record<string, string> = {
    '23505': '既に登録されています',
    '23503': '参照エラー：関連データが存在しません',
    '22P02': '不正な入力形式です',
    'PGRST301': '認証が必要です',
    'PGRST204': 'データが見つかりません'
  };
  
  return errorMessages[error.code] || error.message;
}
```

### 3. リアルタイム接続の管理

```typescript
// src/lib/stores/realtime.svelte.ts
import { supabase } from '$lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

class RealtimeManager {
  channels = new Map<string, RealtimeChannel>();
  
  subscribe(name: string, channel: RealtimeChannel) {
    this.channels.set(name, channel);
    return channel.subscribe();
  }
  
  unsubscribe(name: string) {
    const channel = this.channels.get(name);
    if (channel) {
      supabase.removeChannel(channel);
      this.channels.delete(name);
    }
  }
  
  unsubscribeAll() {
    this.channels.forEach(channel => {
      supabase.removeChannel(channel);
    });
    this.channels.clear();
  }
}

export const realtimeManager = new RealtimeManager();
```

:::tip[Supabaseの強み]
- PostgreSQLの全機能が使える（トリガー、関数、ビュー）
- RLSによる強力なセキュリティ
- リアルタイムが標準機能
- セルフホスティング可能
:::

## まとめ

Svelte + Supabaseの組み合わせは以下のケースに最適です。

- ✅ **本格的なデータベース** - PostgreSQLの全機能
- ✅ **セキュアなアプリ** - RLSによる細かいアクセス制御
- ✅ **リアルタイム機能** - WebSocketベースの同期
- ✅ **オープンソース** - ベンダーロックインなし

次のステップとして、[GraphQL統合](/svelte/architecture/spa-patterns/graphql/)も検討してみてください。