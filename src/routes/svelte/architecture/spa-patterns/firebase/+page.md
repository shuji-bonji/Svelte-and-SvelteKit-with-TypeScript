---
title: Svelte + Firebase
description: SvelteとFirebaseでリアルタイムWebアプリを構築。認証、Firestore、Cloud Storageの統合をTypeScriptで実装する方法を実践的なコード例で解説
---

FirebaseはGoogleが提供するBaaS（Backend as a Service）で、認証、データベース、ストレージなどの機能を提供します。Svelteと組み合わせることで、バックエンド開発なしに高機能なWebアプリを構築できます。

## セットアップ

### 1. プロジェクト作成

```bash
npm create vite@latest my-svelte-firebase -- --template svelte-ts
cd my-svelte-firebase
npm install firebase
```

### 2. Firebase設定

```typescript
// src/lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Firebaseアプリの初期化
const app = initializeApp(firebaseConfig);

// 各サービスのエクスポート
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
```

## 認証の実装

### Google認証コンポーネント

```svelte
<!-- src/lib/components/GoogleAuth.svelte -->
<script lang="ts">
  import { signInWithPopup, GoogleAuthProvider, signOut, type User } from 'firebase/auth';
  import { auth } from '$lib/firebase';
  import { onMount } from 'svelte';
  
  let user = $state<User | null>(null);
  let loading = $state(true);
  
  onMount(() => {
    // 認証状態の監視
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      user = currentUser;
      loading = false;
    });
    
    return unsubscribe;
  });
  
  async function handleGoogleLogin() {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      console.log('ログイン成功:', result.user);
    } catch (error) {
      console.error('ログインエラー:', error);
    }
  }
  
  async function handleLogout() {
    try {
      await signOut(auth);
      console.log('ログアウト成功');
    } catch (error) {
      console.error('ログアウトエラー:', error);
    }
  }
</script>

{#if loading}
  <p>読み込み中...</p>
{:else if user}
  <div class="user-info">
    <img src={user.photoURL || ''} alt={user.displayName || ''} />
    <span>{user.displayName}</span>
    <button onclick={handleLogout}>ログアウト</button>
  </div>
{:else}
  <button onclick={handleGoogleLogin}>Googleでログイン</button>
{/if}

<style>
  .user-info {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  img {
    width: 40px;
    height: 40px;
    border-radius: 50%;
  }
</style>
```

## Firestoreでのリアルタイムデータ

### TODOリストの実装

```svelte
<!-- src/lib/components/TodoList.svelte -->
<script lang="ts">
  import { 
    collection, 
    addDoc, 
    deleteDoc, 
    doc, 
    onSnapshot,
    query,
    orderBy,
    serverTimestamp,
    type DocumentData 
  } from 'firebase/firestore';
  import { db, auth } from '$lib/firebase';
  import { onMount } from 'svelte';
  
  interface Todo {
    id: string;
    text: string;
    completed: boolean;
    createdAt: Date;
    userId: string;
  }
  
  let todos = $state<Todo[]>([]);
  let newTodo = $state('');
  let unsubscribe: (() => void) | null = null;
  
  onMount(() => {
    if (!auth.currentUser) return;
    
    // リアルタイム更新の購読
    const q = query(
      collection(db, 'todos'),
      orderBy('createdAt', 'desc')
    );
    
    unsubscribe = onSnapshot(q, (snapshot) => {
      todos = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Todo));
    });
    
    return () => {
      unsubscribe?.();
    };
  });
  
  async function addTodo() {
    if (!newTodo.trim() || !auth.currentUser) return;
    
    try {
      await addDoc(collection(db, 'todos'), {
        text: newTodo,
        completed: false,
        createdAt: serverTimestamp(),
        userId: auth.currentUser.uid
      });
      newTodo = '';
    } catch (error) {
      console.error('追加エラー:', error);
    }
  }
  
  async function deleteTodo(id: string) {
    try {
      await deleteDoc(doc(db, 'todos', id));
    } catch (error) {
      console.error('削除エラー:', error);
    }
  }
</script>

<div class="todo-container">
  <form on:submit|preventDefault={addTodo}>
    <input
      bind:value={newTodo}
      placeholder="新しいTODOを入力"
    />
    <button type="submit">追加</button>
  </form>
  
  <ul>
    {#each todos as todo (todo.id)}
      <li>
        <span>{todo.text}</span>
        <button onclick={() => deleteTodo(todo.id)}>削除</button>
      </li>
    {/each}
  </ul>
</div>
```

## Cloud Storageでのファイルアップロード

```typescript
// src/lib/utils/storage.ts
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '$lib/firebase';

export async function uploadFile(
  file: File, 
  path: string
): Promise<string> {
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file);
  return getDownloadURL(snapshot.ref);
}

// 使用例
async function handleFileUpload(event: Event) {
  const input = event.target as HTMLInputElement;
  if (!input.files?.[0]) return;
  
  const file = input.files[0];
  const path = `uploads/${Date.now()}_${file.name}`;
  
  try {
    const url = await uploadFile(file, path);
    console.log('アップロード完了:', url);
  } catch (error) {
    console.error('アップロードエラー:', error);
  }
}
```

## デプロイ

### Firebase Hostingへのデプロイ

```bash
# Firebase CLIのインストール
npm install -g firebase-tools

# Firebaseプロジェクトの初期化
firebase init hosting

# ビルド
npm run build

# デプロイ
firebase deploy --only hosting
```

## ベストプラクティス

### 1. セキュリティルールの設定

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ユーザーが自分のTODOのみアクセス可能
    match /todos/{todoId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null 
        && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

### 2. 環境変数の管理

```bash
# .env.local
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 3. リアクティブなユーザー状態管理

```typescript
// src/lib/stores/auth.svelte.ts
import { auth } from '$lib/firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';

class AuthStore {
  user = $state<User | null>(null);
  loading = $state(true);
  
  constructor() {
    onAuthStateChanged(auth, (user) => {
      this.user = user;
      this.loading = false;
    });
  }
  
  get isAuthenticated() {
    return !!this.user;
  }
}

export const authStore = new AuthStore();
```

### 4. エラーハンドリング

```typescript
// src/lib/utils/firebase-errors.ts
export function getErrorMessage(error: any): string {
  const errorCode = error?.code || 'unknown';
  
  const messages: Record<string, string> = {
    'auth/user-not-found': 'ユーザーが見つかりません',
    'auth/wrong-password': 'パスワードが間違っています',
    'auth/email-already-in-use': 'このメールアドレスは既に使用されています',
    'auth/weak-password': 'パスワードが弱すぎます',
    'auth/invalid-email': 'メールアドレスが無効です',
    'permission-denied': 'アクセス権限がありません',
    'unknown': '予期しないエラーが発生しました'
  };
  
  return messages[errorCode] || messages.unknown;
}
```

:::warning[注意点]
Firebaseの設定情報は公開されても問題ありませんが、セキュリティルールの設定が重要です。
必ずFirestoreとStorageのルールを適切に設定してください。
:::

:::tip[パフォーマンス最適化]
- Firestoreのクエリにはインデックスを設定
- 画像はCloud Storageにアップロード前にリサイズ
- リアルタイム更新は必要な箇所のみで使用
:::

## まとめ

Svelte + Firebaseの組み合わせは、以下のようなプロジェクトに最適です。

- ✅ **プロトタイプ開発** - 素早くMVPを構築
- ✅ **リアルタイムアプリ** - チャット、コラボレーションツール
- ✅ **小〜中規模プロジェクト** - スタートアップ、個人開発
- ✅ **サーバーレス構成** - インフラ管理不要

次のステップとして、[Supabase統合](/svelte/architecture/spa-patterns/supabase/)や[GraphQL統合](/svelte/architecture/spa-patterns/graphql/)も検討してみてください。