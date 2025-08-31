---
title: $inspectルーン（デバッグ用）
description: Svelte 5の$inspectルーンでリアクティブ値をデバッグ - 開発時の値変更追跡とカスタムロギング
---


## $inspectとは

`$inspect`は、Svelte 5で導入されたデバッグ専用のルーンです。リアクティブな値の変更を監視し、コンソールに自動的にログを出力します。

### 主な特徴

- **自動追跡**: リアクティブな値の変更を自動的に検出
- **深い監視**: オブジェクトや配列の内部変更も追跡
- **開発環境限定**: 本番ビルドでは自動的に削除
- **TypeScript対応**: 型安全なデバッグが可能
- **パフォーマンス最適化**: 必要最小限のオーバーヘッド

:::warning[開発環境専用]
`$inspect`は開発環境でのみ動作します。本番ビルドでは自動的に削除されるため、デプロイ前に削除する必要はありません。
:::

:::tip[React/Vue経験者向け]
- Reactの`useDebugValue`やRedux DevToolsのログ機能に相当
- Vueの`Vue.config.devtools`やComposition APIの`watchEffect`デバッグに相当
- ただし、Svelteの`$inspect`はより簡潔で直感的
:::

## 基本的な使い方

最も基本的な`$inspect`の使用方法で、単一の値から複数の値まで様々なパターンで監視できます。

### 単一の値を監視

```typescript
<script lang="ts">
  let count = $state(0);
  
  // countの変更を監視
  $inspect(count);
  // コンソールに 以下のように出力される
  // init 0

  // `increment()`が実行される度に以下のように出力される
  // update 1
  // update 2  
  function increment() {
    count++; 
  }
</script>

<button onclick={increment}>
  Count: {count}
</button>
```

### 複数の値を同時に監視

```typescript
<script lang="ts">
  let name = $state('太郎');
  let age = $state(25);
  let isActive = $state(false);
  
  // 複数の値を一度に監視
  $inspect(name, age, isActive);
  // 初期値として `init 太郎 25 false`と出力
  
  function updateUser() {
    name = '次郎';
    age = 26;
    isActive = true;
  }
  // `updateUser()`実行後 `update 太郎 25 false`と出力
</script>
```

## オブジェクトと配列の監視

複雑なデータ構造も`$inspect`で簡単に監視でき、ネストされた変更も自動的に検出されます。

### オブジェクトの監視

```typescript
<script lang="ts">
  let user = $state({
    name: '太郎',
    email: 'taro@example.com',
    settings: {
      theme: 'dark',
      notifications: true
    }
  });
  
  // オブジェクト全体の変更を監視
  // init {name: '太郎', email: 'taro@example.com', settings: {…}}
  $inspect(user);
  
  function updateTheme() {
    user.settings.theme = 'light';
    // ネストされたプロパティの変更も検出される
  }
</script>
```

### 配列の監視

```typescript
<script lang="ts">
  let todos = $state<string[]>([
    'タスク1',
    'タスク2'
  ]);
  
  $inspect(todos);
  // init (2) ['タスク1', 'タスク2']
  
  function addTodo() {
    todos.push('新しいタスク');
    // 配列の変更が出力される
    // update (3) ['タスク1', 'タスク2', '新しいタスク']
  }
  
  function removeTodo(index: number) {
    todos.splice(index, 1);
    // 削除も検出される
    // update (3) ['タスク1', '新しいタスク'
  }
</script>
```

## カスタムラベルとフォーマット

出力を見やすくするために、ラベルを付けたり条件付きで監視を制御したりできます。

### ラベル付き監視

```typescript
<script lang="ts">
  let count = $state(0);
  let doubleCount = $derived(count * 2);
  
  // ラベルを使って区別しやすくする
  $inspect('カウンター:', count);
  // init カウンター: 0
  $inspect('2倍の値:', doubleCount);
  // init 2倍の値: 0
</script>
```

### 条件付き監視

```typescript
<script lang="ts">
  let debugMode = $state(true);
  let data = $state({ value: 0 });
  
  // 条件付きで監視を有効化
  if (debugMode) {
    $inspect(data);
    // init {value: 0}
  }
  
  // 環境変数を使った制御
  if (import.meta.env.DEV && import.meta.env.VITE_DEBUG) {
    $inspect('詳細デバッグ:', data);
  }
</script>
```

### 複雑なデータ構造の監視

```typescript
<script lang="ts">
  // User型を定義
  type User = {
    id: string;
    name: string;
    // 必要に応じて他のプロパティを追加
  };

  // Map/Setの監視
  let userMap = $state(new Map<string, User>());
  let selectedIds = $state(new Set<string>());
  
  $inspect('ユーザーマップ:', userMap);
  // init ユーザーマップ: Map(0) {size: 0}
  $inspect('選択ID:', selectedIds);
  // init 選択ID: Set(0) {size: 0}
  
  // クラスインスタンスの監視
  class TodoItem {
    id = crypto.randomUUID();
    text = $state('');
    done = $state(false);
    
    constructor(text: string) {
      this.text = text;
      $inspect(`Todo[${this.id}]:`, this);
    }
  }
  
  let todos = $state<TodoItem[]>([]);
</script>
```

## 実践的な使用例

実際の開発で`$inspect`を活用する様々なシナリオと効果的なデバッグ方法を紹介します。

### リアクティブな計算の追跡

```typescript
<script lang="ts">
  // 複雑な計算処理のデバッグ
  let items = $state([
    { id: 1, name: '商品A', price: 1000, quantity: 2 },
    { id: 2, name: '商品B', price: 2000, quantity: 1 },
    { id: 3, name: '商品C', price: 1500, quantity: 3 }
  ]);
  
  let taxRate = $state(0.1);
  
  // 各段階の計算を監視
  let subtotal = $derived(
    items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  );
  
  let tax = $derived(Math.floor(subtotal * taxRate));
  let total = $derived(subtotal + tax);
  
  // 計算の流れを追跡
  $inspect('商品リスト:', items);
  // init 商品リスト: (3) [{…}, {…}, {…}]
  $inspect('小計:', subtotal);
  // init 小計: 8500
  $inspect('税額:', tax);
  // init 税額: 850
  $inspect('合計:', total);
  // init 合計: 9350
  
  function updateQuantity(id: number, quantity: number) {
    const item = items.find(i => i.id === id);
    if (item) {
      item.quantity = quantity;
      // 全ての派生値が自動的に再計算され、ログに出力される
    }
  }
</script>
```

### フォームデバッグ

ブラウザの開発ツールコンソールで出力を確認してください。

```svelte ln live
<script lang="ts">
  type FormData = {
    username: string;
    email: string;
    password: string;
    agreed: boolean;
  };
  
  let formData = $state<FormData>({
    username: '',
    email: '',
    password: '',
    agreed: false
  });
  
  let formErrors = $state<Partial<FormData>>({});
  let isValid = $derived(
    formData.username.length > 0 &&
    formData.email.includes('@') &&
    formData.password.length >= 8 &&
    formData.agreed
  );
  
  // フォームの状態を包括的に監視
  $inspect('フォームデータ:', formData);
  $inspect('エラー:', formErrors);
  $inspect('バリデーション結果:', isValid);
  
  function validateForm() {
    formErrors = {};
    
    if (formData.username.length < 3) {
      formErrors.username = 'ユーザー名は3文字以上必要です';
    }
    
    if (!formData.email.includes('@')) {
      formErrors.email = '有効なメールアドレスを入力してください';
    }
    
    if (formData.password.length < 8) {
      formErrors.password = 'パスワードは8文字以上必要です';
    }
  }
</script>

<form>
  <input 
    type="text" 
    bind:value={formData.username}
    oninput={validateForm}
    placeholder="ユーザー名"
  />
  
  <input 
    type="email" 
    bind:value={formData.email}
    oninput={validateForm}
    placeholder="メールアドレス"
  />
  
  <input 
    type="password" 
    bind:value={formData.password}
    oninput={validateForm}
    placeholder="パスワード"
  />
  
  <label>
    <input 
      type="checkbox" 
      bind:checked={formData.agreed}
    />
    利用規約に同意する
  </label>
  
  <button disabled={!isValid}>
    送信
  </button>
</form>
```

### 非同期処理のデバッグ

```typescript
<script lang="ts">
  type ApiState = {
    loading: boolean;
    data: any;
    error: Error | null;
  };
  
  let apiState = $state<ApiState>({
    loading: false,
    data: null,
    error: null
  });
  
  // API通信の状態を監視
  $inspect('API状態:', apiState);
  // init API状態: {loading: false, data: null, error: null}
  
  async function fetchData() {
    apiState.loading = true;
    apiState.error = null;
    
    try {
      const response = await fetch('/api/data');
      apiState.data = await response.json();
    } catch (err) {
      apiState.error = err as Error;
    } finally {
      apiState.loading = false;
    }
  }
</script>
```

### パフォーマンス分析

```typescript
<script lang="ts">
  import { derived, get, writable } from 'svelte/store';

  const items = writable<number[]>([]);
  const searchQuery = writable('');
  const sortOrder = writable<'asc' | 'desc'>('asc');
  
  // パフォーマンスを監視しながら最適化
  let startTime = performance.now();

  const filteredItems = derived(items, $items => {
    const result = $items.filter(item => item > 50);
    const time = performance.now() - startTime;
    // $inspect(`フィルター処理時間: ${time.toFixed(2)}ms`);
    return result;
  });

  const sortedItems = derived(
    [filteredItems, sortOrder],
    ([$filteredItems, $sortOrder]) => {
      const result = [...$filteredItems].sort((a, b) =>
        $sortOrder === 'asc' ? a - b : b - a
      );
      const time = performance.now() - startTime;
      $inspect(`ソート処理時間: ${time.toFixed(2)}ms`);
      return result;
    }
  );

  // 派生値の再計算を監視
  $inspect('元の配列:', get(items).length);
  $inspect('フィルター後:', get(filteredItems).length);
  $inspect('最終結果:', get(sortedItems));

  function addRandomItems(count: number) {
    items.update(arr => {
      const newArr = [...arr];
      for (let i = 0; i < count; i++) {
        newArr.push(Math.floor(Math.random() * 100));
      }
      return newArr;
    });
    // 大量データ追加時のパフォーマンスを確認
  }
</script>
```

### コンポーネント間の状態共有デバッグ

```typescript
// stores/app.svelte.ts
type User = {
  id: string;
  name: string;
  // add other user properties as needed
};

export function createAppStore() {
  let user = $state<User | null>(null);
  let theme = $state<'light' | 'dark'>('light');
  let notifications = $state<Notification[]>([]);
  
  // 開発環境でストア全体を監視
  if (import.meta.env.DEV) {
    $inspect('AppStore:', { user, theme, notifications });
  }
  
  return {
    get user() { return user; },
    get theme() { return theme; },
    get notifications() { return notifications; },
    
    login(userData: User) {
      user = userData;
      $inspect('ログイン:', userData);
    },
    
    logout() {
      user = null;
      $inspect('ログアウト');
    },
    
    toggleTheme() {
      theme = theme === 'light' ? 'dark' : 'light';
      $inspect('テーマ変更:', theme);
    },
    
    addNotification(notification: Notification) {
      notifications.push(notification);
      $inspect('通知追加:', notification);
    }
  };
}

// Component.svelte
<script lang="ts">
  import { getContext } from 'svelte';
  import type { AppStore } from './stores/app.svelte';
  
  const store = getContext<AppStore>('app');
  
  // コンポーネント内でストアの特定部分を監視
  $inspect('現在のユーザー:', store.user);
  $inspect('通知数:', store.notifications.length);
</script>
```

## コンソール出力の見方

ブラウザの開発者ツールで`$inspect`の出力を効果的に読み取る方法と、出力形式の詳細を解説します。

`$inspect`の出力は以下のような形式でコンソールに表示されます。

```javascript
// 基本的な出力
count: 0
count: 1
count: 2

// オブジェクトの出力（展開可能）
user: {name: "太郎", email: "taro@example.com", settings: {…}}
  ▶ name: "太郎"
  ▶ email: "taro@example.com"
  ▶ settings: {theme: "dark", notifications: true}

// 配列の出力（インデックス付き）
todos: (3) ["タスク1", "タスク2", "タスク3"]
  0: "タスク1"
  1: "タスク2"
  2: "タスク3"
  length: 3

// ラベル付き出力
カウンター: 5
2倍の値: 10

// タイムスタンプ付き（ブラウザ設定による）
[12:34:56.789] データ更新: {id: 1, value: "新しい値"}
```

### ブラウザ開発者ツールでの活用

1. **フィルタリング**: コンソールのフィルター機能で`$inspect`出力を絞り込み
2. **グループ化**: 同じラベルの出力を自動グループ化
3. **保存**: ログをファイルに保存して後から分析
4. **ブレークポイント**: 特定の値でブレークポイントを設定

## ベストプラクティス

`$inspect`を効果的に使用するための推奨される方法と、デバッグを効率化するテクニックです。

### 1. 開発初期段階での活用

```typescript
<script lang="ts">
  // 開発中は積極的に$inspectを使用
  let complexState = $state({
    // 複雑な状態構造
  });
  
  // 開発中のデバッグ
  $inspect('複雑な状態:', complexState);
  
  // TODO: 実装が安定したら$inspectを削除またはコメントアウト
</script>
```

### 2. 問題の切り分け

```typescript
<script lang="ts">
  let input = $state('');
  let processed = $derived(processInput(input));
  let final = $derived(finalizeData(processed));
  
  // 各段階を個別に監視して問題を特定
  $inspect('入力:', input);
  $inspect('処理後:', processed);
  $inspect('最終結果:', final);
</script>
```

### 3. 条件付きデバッグ

```typescript
<script lang="ts">
  // 環境変数やフラグでデバッグを制御
  const DEBUG = import.meta.env.DEV;
  
  let criticalData = $state({});
  
  if (DEBUG) {
    $inspect('重要なデータ:', criticalData);
  }
</script>
```

## 高度なデバッグテクニック

より複雑なデバッグシナリオに対応するための高度な`$inspect`の活用方法とカスタマイズ手法です。

### カスタムフォーマッター

```typescript
<script lang="ts">
  // デバッグ用のフォーマッター関数
  function formatForDebug(data: any): string {
    if (data instanceof Date) {
      return data.toLocaleString('ja-JP');
    }
    if (typeof data === 'number') {
      return data.toLocaleString('ja-JP');
    }
    return JSON.stringify(data, null, 2);
  }
  
  let complexData = $state({
    date: new Date(),
    amount: 1234567.89,
    items: ['A', 'B', 'C']
  });
  
  // フォーマット済みの出力
  $effect(() => {
    console.group('📊 デバッグ情報');
    $inspect('生データ:', complexData);
    console.log('整形済み:', formatForDebug(complexData));
    console.groupEnd();
  });
</script>
// 📊 デバッグ情報
// inspect.js:31 init 生データ: {date: Wed Aug 27 2025 14:27:00 GMT+0900 (日本標準時), amount: 1234567.89, items: Array(3)}
// +page.svelte:23 整形済み: {
//   "date": "2025-08-27T05:27:00.770Z",
//   "amount": 1234567.89,
//   "items": [
//     "A",
//     "B",
//     "C"
//   ]
// }
```

### エラー追跡

```typescript
<script lang="ts">
  let errorLog = $state<Error[]>([]);
  
  // エラーを自動的に記録
  function trackError(error: Error, context?: string) {
    errorLog.push(error);
    $inspect(`❌ エラー発生 ${context || ''}:`, {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  }
  
  // try-catchと組み合わせ
  async function riskyOperation() {
    try {
      // 危険な処理
      const result = await fetchData();
      $inspect('✅ 成功:', result);
    } catch (error) {
      trackError(error as Error, 'fetchData');
    }
  }
</script>
```

## 注意点とTips

`$inspect`を使用する際の重要な注意事項と、より効果的に活用するためのヒントです。

:::tip[効果的な使い方]
1. **一時的な使用を前提に** - `$inspect`は問題解決のための一時的なツールとして使用
2. **意味のあるラベルを付ける** - 複数の値を監視する場合は、区別しやすいラベルを使用
3. **開発者ツールと併用** - ブラウザの開発者ツールのブレークポイントと組み合わせて使用
:::

:::caution[注意事項]
1. **本番環境では自動削除** - 本番ビルドでは自動的に削除されるが、コードの可読性のために適切に管理
2. **パフォーマンスへの影響** - 開発時でも大量のデータを頻繁に出力すると、パフォーマンスに影響する可能性
3. **機密情報の扱い** - パスワードやトークンなどの機密情報を誤って出力しないよう注意
:::

## $inspectと他のデバッグ手法の比較

各種デバッグ手法の特徴を比較し、適切な使い分けのガイドラインを提供します。

| 手法 | 利点 | 欠点 | 使用場面 |
|------|------|------|----------|
| `$inspect` | 自動追跡、簡単、型安全 | 開発時のみ、基本的な出力 | リアクティブ値の監視 |
| `console.log` | 柔軟、詳細制御、本番でも使用可 | 手動、削除忘れ、型チェックなし | 特定タイミングの値確認 |
| `debugger` | 詳細な分析、変数の変更可能 | 実行停止、自動化困難 | 複雑なロジックの解析 |
| 開発者ツール | ビジュアル、包括的 | 設定が必要、学習コスト | DOM・ネットワーク監視 |
| テストコード | 自動化、回帰テスト | 実装コスト、実行時間 | 品質保証、CI/CD |

### 使い分けのガイドライン

```typescript
<script lang="ts">
  // 1. リアクティブな値の変更追跡 → $inspect
  let count = $state(0);
  $inspect(count);
  
  // 2. 一時的な値の確認 → console.log
  function calculate(x: number) {
    const temp = x * 2;
    console.log('計算中:', temp);
    return temp + 10;
  }
  
  // 3. 複雑なロジックの解析 → debugger
  function complexAlgorithm(data: any[]) {
    debugger; // ブレークポイント
    // 複雑な処理...
  }
  
  // 4. パフォーマンス測定 → performance API
  function measurePerformance() {
    performance.mark('start');
    // 処理...
    performance.mark('end');
    performance.measure('duration', 'start', 'end');
  }
</script>
```

## よくある質問（FAQ）

`$inspect`に関してよく寄せられる質問と、その回答をまとめました。

### Q: $inspectは本番環境に影響しますか？
A: いいえ。本番ビルド時に自動的に削除されるため、パフォーマンスへの影響はありません。

### Q: $inspectとconsole.logの使い分けは？
A: `$inspect`はリアクティブな値の継続的な監視に、`console.log`は特定タイミングでの値確認に使用します。

### Q: 大量のデータを$inspectしても大丈夫？
A: 開発環境でもパフォーマンスに影響する可能性があるため、必要な部分のみを監視することを推奨します。

### Q: TypeScriptの型情報も出力できますか？
A: 実行時には型情報は失われますが、開発時のIDEサポートにより型安全なデバッグが可能です。

## まとめ

`$inspect`は、Svelte 5でのデバッグを大幅に簡単にする強力なツールです。リアクティブな値の変更を自動的に追跡し、開発時の問題解決を効率化します。本番環境では自動的に削除されるため、安心して使用できます。

### 重要なポイント

1. **自動追跡**: リアクティブな値の変更を自動的に検出
2. **深い監視**: オブジェクトや配列の内部変更も追跡
3. **開発環境限定**: 本番ビルドでは自動削除
4. **簡潔な構文**: 一行追加するだけで監視開始
5. **型安全**: TypeScriptとの完全な統合

:::info[関連リンク]
- [$stateルーン](/svelte/runes/state/) - リアクティブな状態管理
- [$derivedルーン](/svelte/runes/derived/) - 派生値の作成
- [$effectルーン](/svelte/runes/effect/) - 副作用の管理
:::

次は、より高度なデバッグテクニックやパフォーマンス最適化について[実践編](/svelte/advanced/)で学びましょう。

