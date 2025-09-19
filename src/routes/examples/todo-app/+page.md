---
title: Todo App
description: Svelte5とTypeScriptで作るTODOアプリ完全実装ガイド。$stateによる状態管理、$derivedでのフィルタリング、型安全なCRUD操作のサンプルコード付き解説
---
<script>
  import { base } from '$app/paths';

  // html.darkクラスの存在をチェックして初期値を設定
  let htmlHasDarkClass = $state(false);

  // DOMの準備ができたらダークモードの状態を確認
  $effect(() => {
    htmlHasDarkClass = document.documentElement.classList.contains('dark');
  });
</script>

Svelte 5のRunesシステムとTypeScriptを使用した、フル機能のTODOアプリケーション実装例です。

## プロジェクト概要

このTODOアプリケーションは、**Svelte 5のRunesシステム学習**に特化した実装例です。あえてSvelteKitを使用せず、純粋なSvelte 5アプリケーションとして構築することで、Runesシステムの理解に集中できるよう設計しています。

### デモとソースコード

- **🌐 ライブデモ**: [GitHub Pagesで試す](https://shuji-bonji.github.io/svelte5-todo-example/)
- **📦 GitHubリポジトリ**: [svelte5-todo-example](https://github.com/shuji-bonji/svelte5-todo-example)
- **💻 ローカル実行**: `npm run dev` でプレビュー可能

### スクリーンショット

<div class="relative max-w-4xl mx-auto">
  <!-- スクリーンショット表示 -->
  <div class="relative overflow-hidden rounded-xl shadow-2xl">
    <!-- ライトモード画像（html.darkクラスがない場合に表示） -->
    <img 
      src="{base}/images/examples/todo-app-light.png" 
      alt="TODOアプリ - ライトモード" 
      class="w-full transition-opacity duration-300 block dark:hidden"
    >
    <!-- ダークモード画像（html.darkクラスがある場合に表示） -->
    <img 
      src="{base}/images/examples/todo-app-dark.png" 
      alt="TODOアプリ - ダークモード" 
      class="w-full transition-opacity duration-300 hidden dark:block"
    >
  </div>
  
  <!-- キャプション -->
  <p class="text-center text-gray-600 dark:text-gray-400 mt-3 text-sm">
    <span class="inline dark:hidden">ライトモード表示</span>
    <span class="hidden dark:inline">ダークモード表示</span>
    - GitHub風のモダンなデザイン
  </p>
</div>

## 実装機能

### 基本機能
- ✅ タスクの追加
- ✅ タスクの完了/未完了の切り替え
- ✅ タスクの削除
- ✅ タスクの編集（ダブルクリックで編集モード）
- ✅ タスクの一括完了/解除

### フィルタリング機能
- All - すべてのタスクを表示
- Active - アクティブなタスクのみ表示
- Completed - 完了済みタスクのみ表示

### データ永続化
- LocalStorageへの自動保存
- ページリロード時の自動復元

## 技術的な実装ポイント

### 1. Svelte 5 Runesによる状態管理

```typescript
// stores/todo.svelte.ts
export function createTodoStore() {
  // リアクティブな状態
  let todos = $state<Todo[]>([]);
  let filter = $state<FilterType>('all');

  // 派生値 - フィルタリングされたTODO
  let filteredTodos = $derived.by(() => {
    switch (filter) {
      case 'active':
        return todos.filter(todo => !todo.completed);
      case 'completed':
        return todos.filter(todo => todo.completed);
      default:
        return todos;
    }
  });

  // 派生値 - カウント
  let activeTodoCount = $derived(
    todos.filter(todo => !todo.completed).length
  );

  return {
    get todos() { return todos; },
    get filteredTodos() { return filteredTodos; },
    get activeTodoCount() { return activeTodoCount; },
    // メソッド...
  };
}
```

### 2. TypeScriptによる型定義

```typescript
// types/todo.ts
export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

export type FilterType = 'all' | 'active' | 'completed';
```

### 3. LocalStorageとの同期

```typescript
// LocalStorageから初期データを読み込み
const loadFromStorage = (): Todo[] => {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem('svelte5-todos');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      return parsed.map((todo: any) => ({
        ...todo,
        createdAt: new Date(todo.createdAt),
        updatedAt: todo.updatedAt ? new Date(todo.updatedAt) : undefined
      }));
    } catch (e) {
      console.error('Failed to parse todos:', e);
    }
  }
  return [];
};

// LocalStorageへの保存（各操作時に呼び出す）
const saveToStorage = (todos: Todo[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('svelte5-todos', JSON.stringify(todos));
};

// 初期化時に読み込み
let todos = $state<Todo[]>(loadFromStorage());

// 各CRUD操作後に保存
function addTodo(text: string) {
  // ... TODOを追加
  saveToStorage(todos);
}
```

## デザインシステム

### GitHub風モダンデザイン

アプリケーションはGitHub風のデザインシステムを採用しています。

- **ダークモード対応**: システム設定を自動検出、手動切り替えも可能
- **レスポンシブデザイン**: モバイルからデスクトップまで対応
- **アイコン**: SVGアイコンで統一された見た目
- **カラーパレット**: GitHubのデザイン言語に基づく配色

### コンポーネント構成

1. **TodoHeader.svelte**
   - タスクマネージャーのロゴ
   - ダークモード切り替えボタン
   - 新しいタスクの入力フィールド
   - 「Add task」ボタン

2. **TodoItem.svelte**
   - カスタムチェックボックスデザイン
   - ホバーで表示される削除ボタン
   - ダブルクリックでの編集モード
   - GitHub Issue風のリスト表示

3. **TodoFooter.svelte**
   - アクティブタスクのカウント表示
   - セグメントコントロール風フィルター
   - 完了済みタスクの一括削除（別行に配置でレイアウト安定）

### 編集モードの実装

```svelte
<script lang="ts">
  let isEditing = $state(false);
  let editText = $state(todo.text);

  function startEdit() {
    isEditing = true;
    editText = todo.text;
  }

  function confirmEdit() {
    if (editText.trim() !== todo.text) {
      onEdit(todo.id, editText);
    }
    isEditing = false;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      confirmEdit();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  }
</script>

{#if isEditing}
  <input
    type="text"
    bind:value={editText}
    onblur={confirmEdit}
    onkeydown={handleKeydown}
    autofocus
  />
{:else}
  <label ondblclick={startEdit}>
    {todo.text}
  </label>
{/if}
```

## 学習のポイント

### Svelte 5 Runesの活用

1. **$state** - リアクティブな状態管理
2. **$derived** - 計算値の自動更新
3. **$effect** - 副作用とクリーンアップ
4. **$props** - コンポーネントプロパティの型安全な定義

### TypeScriptベストプラクティス

- インターフェースによる明確な型定義
- ジェネリック型の活用
- 型ガードによる安全な処理
- strictモードでの開発

### 状態管理パターン

- グローバルストアの設計
- ゲッターによるカプセル化
- 不変性を保つ更新パターン
- リアクティビティの最適化

## 実行方法

```bash
# リポジトリのクローン
git clone https://github.com/shuji-bonji/svelte5-todo-example.git
cd svelte5-todo-example

# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

## 📖 さらに学ぶ

このTODOアプリの実装を通じて、以下のトピックをより深く学ぶことができます。

- [Svelte 5 Runesシステム](/svelte/runes/)
- [TypeScript統合](/svelte/basics/typescript-integration/)
- [リアクティブストア](/svelte/advanced/reactive-stores/)
- [コンポーネントパターン](/svelte/advanced/component-patterns/)

## 次のステップ：応用編

このベースとなるTODOアプリを発展させる2つの方向性を紹介します。

### 1. PWA化してネイティブアプリ化

現在のTODOアプリをProgressive Web App (PWA)として拡張し、モバイルアプリとして動作させる方法

```javascript
// manifest.json の追加
{
  "name": "Svelte 5 TODO App",
  "short_name": "TODO",
  "display": "standalone",
  "theme_color": "#ff3e00"
}

// Service Workerでオフライン対応
// Push通知の実装
// アプリアイコンの設定
```

#### メリット
- オフラインでも動作
- ホーム画面に追加可能
- プッシュ通知対応
- ネイティブアプリのような体験

### 2. SvelteKit + データベース版への移行

クライアントサイドのみから、フルスタックアプリケーションへの進化

```typescript
// +page.server.ts でのサーバーサイド処理
export async function load() {
  const todos = await db.todo.findMany();
  return { todos };
}

// フォームアクションでのCRUD操作
export const actions = {
  add: async ({ request }) => {
    const data = await request.formData();
    await db.todo.create({...});
  }
};
```

#### 実装要素
- PostgreSQL/MySQL/SQLiteなどのDB連携
- Prisma/Drizzleによる型安全なORM
- 認証機能の追加（Lucia Auth、Auth.js）
- マルチユーザー対応
- リアルタイム同期（WebSocket）

### 応用編の学習パス

1. **現在のアプリ** → Svelte 5 Runesの理解
2. **PWA版** → モダンWebアプリの機能拡張
3. **SvelteKit版** → フルスタック開発への移行

:::tip[段階的な学習アプローチ]
まずは現在のシンプルな実装でRunesシステムを完全に理解し、その後ニーズに応じて拡張していくことをお勧めします。各段階で新しい技術を一つずつ追加することで、無理なく学習を進められます。
:::

## まとめ

このTODOアプリケーションは、Svelte 5のRunesシステムを学ぶための理想的な出発点です。シンプルながら実践的な機能を持ち、さらにPWA化やサーバーサイド実装など、様々な方向への発展が可能な基盤となっています。
