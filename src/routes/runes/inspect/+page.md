---
title: $inspectルーン（デバッグ用）
description: Svelte 5のデバッグツール
---

## $inspectとは

`$inspect`は、Svelte 5で導入されたデバッグ専用のルーンです。リアクティブな値の変更を監視し、コンソールに自動的にログを出力します。

:::warning[開発環境専用]
`$inspect`は開発環境でのみ動作します。本番ビルドでは自動的に削除されるため、デプロイ前に削除する必要はありません。
:::

## 基本的な使い方

### 単一の値を監視

```typescript
<script lang="ts">
  let count = $state(0);
  
  // countの変更を監視
  $inspect(count);
  
  function increment() {
    count++; // コンソールに "count: 1" などが出力される
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
  
  function updateUser() {
    name = '次郎';
    age = 26;
    isActive = true;
    // 3つの値すべてがコンソールに出力される
  }
</script>
```

## オブジェクトと配列の監視

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
  
  function addTodo() {
    todos.push('新しいタスク');
    // 配列の変更が出力される
  }
  
  function removeTodo(index: number) {
    todos.splice(index, 1);
    // 削除も検出される
  }
</script>
```

## カスタムラベルとフォーマット

### ラベル付き監視

```typescript
<script lang="ts">
  let count = $state(0);
  let doubleCount = $derived(count * 2);
  
  // ラベルを使って区別しやすくする
  $inspect('カウンター:', count);
  $inspect('2倍の値:', doubleCount);
</script>
```

### 返り値を使った条件付き監視

```typescript
<script lang="ts">
  let debugMode = $state(true);
  let data = $state({ value: 0 });
  
  // 条件付きで監視を有効化
  if (debugMode) {
    $inspect(data);
  }
  
  // または、inspectの返り値を使用
  const cleanup = $inspect(data);
  
  // 必要に応じて監視を停止
  // cleanup(); // これは実際には動作しません（$inspectは関数を返さない）
</script>
```

## 実践的な使用例

### フォームデバッグ

```typescript
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
  let items = $state<number[]>([]);
  let filteredItems = $derived(
    items.filter(item => item > 50)
  );
  let sortedItems = $derived(
    filteredItems.toSorted((a, b) => b - a)
  );
  
  // 派生値の再計算を監視
  $inspect('元の配列:', items);
  $inspect('フィルター後:', filteredItems);
  $inspect('ソート後:', sortedItems);
  
  function addRandomItem() {
    items.push(Math.floor(Math.random() * 100));
    // 各派生値の再計算がコンソールで確認できる
  }
</script>
```

## コンソール出力の見方

`$inspect`の出力は以下のような形式でコンソールに表示されます：

```javascript
// 基本的な出力
count: 0
count: 1
count: 2

// オブジェクトの出力
user: {name: "太郎", email: "taro@example.com", settings: {…}}

// 配列の出力
todos: (3) ["タスク1", "タスク2", "タスク3"]

// ラベル付き出力
カウンター: 5
2倍の値: 10
```

## ベストプラクティス

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

## 注意点とTips

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

| 手法 | 利点 | 欠点 | 使用場面 |
|------|------|------|----------|
| `$inspect` | 自動追跡、簡単 | 開発時のみ | リアクティブ値の監視 |
| `console.log` | 柔軟、詳細制御 | 手動、削除忘れ | 特定タイミングの値確認 |
| デバッガー | 詳細な分析 | 実行停止 | 複雑なロジックの解析 |
| 開発者ツール | ビジュアル | 設定が必要 | DOM・ネットワーク監視 |

## まとめ

`$inspect`は、Svelte 5でのデバッグを大幅に簡単にする強力なツールです。リアクティブな値の変更を自動的に追跡し、開発時の問題解決を効率化します。本番環境では自動的に削除されるため、安心して使用できます。

:::info[関連リンク]
- [$stateルーン](/runes/state/) - リアクティブな状態管理
- [$derivedルーン](/runes/derived/) - 派生値の作成
- [$effectルーン](/runes/effect/) - 副作用の管理
:::

次は、より高度なデバッグテクニックやパフォーマンス最適化について[実践編](/advanced/)で学びましょう。