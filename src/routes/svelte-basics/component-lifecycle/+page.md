---
title: コンポーネントライフサイクル
description: Svelte 5におけるコンポーネントのライフサイクル管理
---

コンポーネントライフサイクルとは、コンポーネントが作成されてから破棄されるまでの一連の段階を指します。Svelte 5では、主に`$effect`ルーンを使用してライフサイクルを管理します。

## なぜ$effectでライフサイクルを管理できるのか

`$effect`は単なる副作用の実行ツールではなく、コンポーネントのライフサイクルと密接に結びついています。その理由を理解することが重要です。

### $effectの実行タイミング

```typescript
// $effectは以下のタイミングで動作します。
$effect(() => {
  // 1. 初回実行：コンポーネントがDOMにマウントされた直後
  console.log('コンポーネントがマウントされました');
  
  // 2. 再実行：依存する値が変更されるたび
  console.log('依存値が更新されました');
  
  // 3. クリーンアップ：次の実行前、またはコンポーネント破棄時
  return () => {
    console.log('クリーンアップ処理');
  };
});
```

### コンポーネントとの結びつき

`$effect`がライフサイクルとして機能する理由

1. **コンポーネントスコープ** - `$effect`はコンポーネントインスタンスに紐づいている
2. **自動的な登録と解除** - コンポーネントの作成時に登録され、破棄時に自動的にクリーンアップ
3. **リアクティビティとの統合** - Svelteのリアクティブシステムと完全に統合

```svelte live
<script lang="ts">
  let mounted = $state(false);
  let updateCount = $state(0);
  
  // このeffectはコンポーネントのライフサイクルに自動的に紐づく
  $effect(() => {
    // 初回実行 = マウント時
    if (!mounted) {
      mounted = true;
      console.log('Initial mount');
    }
    
    // 更新時（updateCountが変更されるたび）
    console.log(`Update count: ${updateCount}`);
    
    // このreturn文はコンポーネント破棄時にも実行される
    return () => {
      console.log('Cleanup for update count:', updateCount);
    };
  });
</script>

<div>
  <p>マウント状態: {mounted ? 'マウント済み' : '未マウント'}</p>
  <p>更新回数: {updateCount}</p>
  <button onclick={() => updateCount++}>更新</button>
</div>
```

:::info[重要な概念]
`$effect`は「エフェクト」という名前ですが、実際にはコンポーネントのライフサイクル全体を管理する仕組みです。これは、
- コンポーネントの作成時に自動的に開始
- コンポーネントの破棄時に自動的にクリーンアップ
- 依存値の変更を自動的に追跡

つまり、`$effect`はライフサイクルフックというより、**コンポーネントの生存期間と同期した反応的な処理**を定義する方法なのです。
:::

## Svelte 5の新しいアプローチ

### $effectによるライフサイクル管理

Svelte 5では、`$effect`ルーンがライフサイクル管理の中心的な役割を果たします。

```svelte live
<script lang="ts">
  let count = $state(0);
  let mounted = $state(false);
  
  // マウント時とアンマウント時の処理
  $effect(() => {
    // マウント時の処理（componentDidMountに相当）
    mounted = true;
    console.log('コンポーネントがマウントされました');
    
    // クリーンアップ関数（componentWillUnmountに相当）
    return () => {
      console.log('コンポーネントがアンマウントされます');
      mounted = false;
    };
  });
  
  // 値の変更を監視
  $effect(() => {
    console.log(`カウント値が変更されました: ${count}`);
  });
</script>

<div>
  <p>マウント状態: {mounted ? 'マウント済み' : '未マウント'}</p>
  <p>カウント: {count}</p>
  <button onclick={() => count++}>カウントアップ</button>
</div>
```

:::tip[React/Vueとの比較]
- **React**: `useEffect`と同様の概念
- **Vue**: `onMounted`、`onUnmounted`、`watchEffect`を組み合わせたような機能
- **Angular**: ライフサイクルフックよりも柔軟で宣言的
:::

### $effect.preによる初期化処理

DOMアクセスが不要な初期化処理には`$effect.pre`を使用します。

```svelte live
<script lang="ts">
  interface User {
    id: number;
    name: string;
    email: string;
  }
  
  let userId = $state(1);
  let user = $state<User | null>(null);
  let loading = $state(false);
  
  // DOMアクセス前に実行される
  $effect.pre(() => {
    loading = true;
    
    // APIからデータを取得
    fetch(`https://jsonplaceholder.typicode.com/users/${userId}`)
      .then(res => res.json())
      .then(data => {
        user = data;
        loading = false;
      })
      .catch(() => {
        user = null;
        loading = false;
      });
  });
</script>

<div>
  <label>
    ユーザーID:
    <input type="number" bind:value={userId} min="1" max="10" />
  </label>
  
  {#if loading}
    <p>読み込み中...</p>
  {:else if user}
    <div>
      <h3>{user.name}</h3>
      <p>{user.email}</p>
    </div>
  {:else}
    <p>ユーザーが見つかりません</p>
  {/if}
</div>
```

### $effect.rootによる独立したスコープ

コンポーネントから独立したエフェクトスコープを作成できます。

```svelte live
<script lang="ts">
  let autoSave = $state(false);
  let content = $state('');
  let savedContent = $state('');
  let saveCount = $state(0);
  
  $effect(() => {
    if (autoSave) {
      // 独立したエフェクトスコープを作成
      const cleanup = $effect.root(() => {
        // 1秒ごとに自動保存
        $effect(() => {
          const timer = setTimeout(() => {
            if (content !== savedContent) {
              savedContent = content;
              saveCount++;
              console.log('自動保存しました');
            }
          }, 1000);
          
          return () => clearTimeout(timer);
        });
      });
      
      // autoSaveがfalseになったらクリーンアップ
      return cleanup;
    }
  });
</script>

<div>
  <label>
    <input type="checkbox" bind:checked={autoSave} />
    自動保存を有効にする
  </label>
  
  <textarea 
    bind:value={content} 
    placeholder="テキストを入力..."
    rows="4"
    style="width: 100%; margin-top: 1rem;"
  />
  
  <p>保存回数: {saveCount}</p>
  <p>最後に保存された内容: {savedContent}</p>
</div>
```

## 従来のライフサイクルAPI

後方互換性のため、Svelte 5でも従来のライフサイクル関数を使用できます。

### onMount

コンポーネントがDOMにマウントされた後に実行されます。

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  
  let canvas: HTMLCanvasElement;
  
  onMount(() => {
    // DOM要素へのアクセスが保証される
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = 'blue';
      ctx.fillRect(10, 10, 100, 50);
    }
    
    // 非同期処理も可能
    return async () => {
      // クリーンアップ処理
      console.log('クリーンアップ');
    };
  });
</script>

<canvas bind:this={canvas} width="200" height="100"></canvas>
```

### onDestroy

コンポーネントが破棄される直前に実行されます。

```svelte
<script lang="ts">
  import { onDestroy } from 'svelte';
  
  let interval: number;
  let count = $state(0);
  
  // インターバルの設定
  interval = setInterval(() => {
    count++;
  }, 1000);
  
  // クリーンアップ
  onDestroy(() => {
    clearInterval(interval);
    console.log('インターバルをクリア');
  });
</script>

<p>経過時間: {count}秒</p>
```

### beforeUpdate / afterUpdate

これらのAPIはSvelte 5では非推奨です。代わりに`$effect`を使用してください。

```svelte
<script lang="ts">
  // ❌ 非推奨
  import { beforeUpdate, afterUpdate } from 'svelte';
  
  // ✅ 推奨：$effectを使用
  let value = $state(0);
  
  $effect.pre(() => {
    // beforeUpdateの代替
    console.log('更新前の処理');
  });
  
  $effect(() => {
    // afterUpdateの代替
    console.log('更新後の処理');
  });
</script>
```

## ライフサイクルの流れ

Svelte 5のコンポーネントライフサイクルは、以下の段階を経て進行します。各段階で何が起こるのか、詳しく見ていきましょう。

<script>
  import Mermaid from '$lib/components/Mermaid.svelte';
  
  const diagramCode = `graph TD
    A[コンポーネント作成] --> B[$state初期化]
    B --> C[$effect.pre実行]
    C --> D[DOM構築]
    D --> E[$effect実行]
    E --> F[レンダリング完了]
    F --> G{状態変更?}
    G -->|Yes| H[$effect.pre再実行]
    H --> I[DOM更新]
    I --> J[$effect再実行]
    J --> G
    G -->|No| K{破棄?}
    K -->|Yes| L[$effectクリーンアップ]
    L --> M[コンポーネント破棄]
    K -->|No| G`;
</script>
<Mermaid code={diagramCode} />

### 各段階の詳細

<div class="grid grid-cols-1 md:grid-cols-2 gap-4 my-8 auto-rows-[1fr]">
  <div class="card">
    <h4>1. コンポーネント作成</h4>
    <ul>
    <li>Svelteがコンポーネントインスタンスを生成</li>
    <li>この時点ではまだDOMには何も存在しない</li>
    <li>コンポーネントのスコープが確立される</li>
    </ul>
  </div>
  <div class="card">
    <h4>2. $state初期化</h4>
    <ul>
    <li>`$state`で定義された状態変数が初期値で初期化</li>
    <li>リアクティブな値の追跡システムが準備される</li>
    <li>TypeScriptの型チェックが行われる</li>
    </ul>
  </div>
  <div class="card">
    <h4>3. $effect.pre実行</h4>
    <ul>
    <li>DOM構築前に実行が必要な処理が実行される</li>
    <li>データの事前準備や計算処理に適している</li>
    <li>この段階ではDOM要素へのアクセスはできない</li>
    </ul>
  </div>
  <div class="card">
    <h4>4. DOM構築</h4>
    <ul>
    <li>テンプレートに基づいてDOM要素が作成される</li>
    <li>イベントリスナーが登録される</li>
    <li>バインディングが確立される</li>
    </ul>
  </div>
  <div class="card">
    <h4>5. $effect実行</h4>
    <ul>
    <li>DOM構築後に実行される副作用処理</li>
    <li>DOM要素へのアクセスが可能</li>
    <li>外部APIとの連携やサブスクリプションの設定</li>
    </ul>
  </div>
  <div class="card">
    <h4>6. レンダリング完了</h4>
    <ul>
    <li>コンポーネントが完全に画面に表示される</li>
    <li>ユーザーインタラクションが可能になる</li>
    <li>初期ライフサイクルが完了</li>
    </ul>
  </div>
</div>

### 更新サイクル

状態が変更されると、以下のサイクルが実行されます。

1. **変更の検出** - Svelteが状態の変更を検出
2. **$effect.pre再実行** - 変更された値に依存する`$effect.pre`が再実行
3. **DOM更新** - 必要最小限のDOM更新が効率的に実行
4. **$effect再実行** - 変更された値に依存する`$effect`が再実行

### 破棄プロセス

コンポーネントが破棄される際は。

1. **破棄の開始** - 親コンポーネントから破棄が指示される
2. **クリーンアップ実行** - すべての`$effect`のクリーンアップ関数が実行
3. **リソースの解放** - イベントリスナー、タイマー、サブスクリプションの解除
4. **メモリの解放** - コンポーネントインスタンスがガベージコレクションの対象に

:::tip[パフォーマンスの最適化]
Svelte 5のライフサイクルは以下の点で最適化されています。
- 必要な部分だけを更新する細粒度のリアクティビティ
- コンパイル時の最適化により実行時のオーバーヘッドが最小
- 自動的なメモリ管理によりメモリリークを防止
:::

## 実践例：データフェッチング

実際のアプリケーションでよく使われる、APIからデータを取得して表示するパターンを詳しく見ていきましょう。このパターンは、ライフサイクル管理の重要な要素をすべて含んでいます。

### 基本的なデータフェッチング

```svelte live
<script lang="ts">
  interface Post {
    id: number;
    title: string;
    body: string;
  }
  
  let posts = $state<Post[]>([]);
  let loading = $state(true);
  let error = $state<string | null>(null);
  
  // コンポーネントマウント時にデータを取得
  $effect(() => {
    let aborted = false; // クリーンアップ用のフラグ
    
    async function fetchPosts() {
      try {
        loading = true;
        error = null;
        
        const response = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=5');
        if (!response.ok) throw new Error('Failed to fetch');
        
        const data = await response.json();
        
        // コンポーネントが破棄されていない場合のみ状態を更新
        if (!aborted) {
          posts = data;
          loading = false;
        }
      } catch (e) {
        if (!aborted) {
          error = e instanceof Error ? e.message : 'Unknown error';
          loading = false;
        }
      }
    }
    
    fetchPosts();
    
    // クリーンアップ：コンポーネント破棄時にリクエストを中断
    return () => {
      aborted = true;
    };
  });
</script>

<div>
  <h2>投稿一覧</h2>
  
  {#if loading}
    <p>読み込み中...</p>
  {:else if error}
    <p style="color: red;">エラー: {error}</p>
  {:else}
    <ul>
      {#each posts as post}
        <li>
          <h3>{post.title}</h3>
          <p>{post.body.substring(0, 100)}...</p>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  ul {
    list-style: none;
    padding: 0;
  }
  
  li {
    margin-bottom: 1.5rem;
    padding: 1rem;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  
  h3 {
    margin: 0 0 0.5rem;
    color: #333;
  }
</style>
```

### 重要なポイント

この実装例では、以下のライフサイクル管理のベストプラクティスが含まれています。

1. **非同期処理の管理** - `aborted`フラグを使用して、コンポーネント破棄後の状態更新を防止
2. **エラーハンドリング** - try-catchブロックで適切にエラーを処理
3. **ローディング状態** - ユーザーに進行状況を表示
4. **クリーンアップ** - returnでクリーンアップ関数を提供し、メモリリークを防止

### AbortControllerを使用した高度な例

より洗練された実装では、`AbortController`を使用してネットワークリクエスト自体をキャンセルできます。

```typescript
$effect(() => {
  const controller = new AbortController();
  
  async function fetchData() {
    try {
      const response = await fetch(url, {
        signal: controller.signal
      });
      // データ処理
    } catch (e) {
      if (e.name === 'AbortError') {
        // リクエストがキャンセルされた
        console.log('Request was cancelled');
      } else {
        // その他のエラー
        handleError(e);
      }
    }
  }
  
  fetchData();
  
  return () => {
    controller.abort(); // リクエストをキャンセル
  };
});
```

## ベストプラクティス

Svelte 5でライフサイクルを管理する際の推奨事項とアンチパターンを詳しく見ていきましょう。

### 1. $effectを優先的に使用

Svelte 5では、従来のライフサイクル関数よりも`$effect`を使用することが推奨されます。

```typescript
// ✅ 推奨：$effectによる統一的な管理
$effect(() => {
  const timer = setTimeout(() => {
    console.log('1秒後');
  }, 1000);
  
  return () => clearTimeout(timer);
});

// ⚠️ 動作するが非推奨：onMount
import { onMount } from 'svelte';

onMount(() => {
  const timer = setTimeout(() => {
    console.log('1秒後');
  }, 1000);
  
  return () => clearTimeout(timer);
});
```

#### $effectを使うメリット
- リアクティビティと密接に統合
- 依存関係の自動追跡
- より宣言的でわかりやすいコード

### 2. クリーンアップを忘れない

メモリリークを防ぐため、必ずクリーンアップ処理を実装しましょう。

```typescript
// ✅ 良い例：適切なクリーンアップ
$effect(() => {
  const handler = (e: Event) => console.log(e);
  window.addEventListener('resize', handler);
  
  return () => {
    window.removeEventListener('resize', handler);
  };
});

// ❌ 悪い例：クリーンアップなし
$effect(() => {
  // リスナーが残り続ける！
  window.addEventListener('resize', (e) => console.log(e));
});
```

#### クリーンアップが必要な場面
- イベントリスナー
- タイマー（setTimeout、setInterval）
- WebSocketやServer-Sent Events
- IntersectionObserverなどのオブザーバー
- 外部ライブラリのインスタンス

### 3. 非同期処理の適切な管理

非同期処理では、コンポーネントの破棄後に状態を更新しないよう注意が必要です。

```typescript
// ✅ 良い例：中断フラグを使用
$effect(() => {
  let cancelled = false;
  
  async function loadData() {
    const data = await fetchData();
    if (!cancelled) {
      // 中断されていない場合のみ状態を更新
      updateState(data);
    }
  }
  
  loadData();
  
  return () => {
    cancelled = true;
  };
});

// ❌ 悪い例：破棄後の更新
$effect(() => {
  async function loadData() {
    const data = await fetchData();
    updateState(data); // コンポーネント破棄後に実行される可能性
  }
  
  loadData();
});
```

### 4. 依存関係の明確化

`$effect`は自動的に依存関係を追跡しますが、意図を明確にすることが重要です。

```typescript
// ✅ 良い例：依存関係が明確
let userId = $state(1);
let userData = $state(null);

$effect(() => {
  // userIdの変更時のみ実行される
  fetchUserData(userId).then(data => {
    userData = data;
  });
});

// ⚠️ 注意が必要：外部変数への依存
let config = { apiUrl: 'https://api.example.com' };

$effect(() => {
  // configオブジェクトは追跡されない
  fetch(config.apiUrl); // 変更を検知できない
});
```

### 5. $effect.preとの使い分け

DOM操作の有無で適切に使い分けましょう。

```typescript
// ✅ DOM操作なし：$effect.pre
$effect.pre(() => {
  // データの計算や準備
  const processedData = processData(rawData);
  displayData = processedData;
});

// ✅ DOM操作あり：$effect
$effect(() => {
  // DOM要素への直接操作
  const element = document.getElementById('chart');
  if (element) {
    renderChart(element, data);
  }
});
```

## まとめ

Svelte 5のコンポーネントライフサイクル

- **`$effect`** - マウント、更新、アンマウントを統一的に管理
- **`$effect.pre`** - DOM構築前の処理
- **`$effect.root`** - 独立したエフェクトスコープ
- **従来のAPI** - 後方互換性のために利用可能だが非推奨

:::info[移行のヒント]
既存のSvelteプロジェクトから移行する場合
1. `onMount` → `$effect`に置き換え
2. `beforeUpdate` → `$effect.pre`に置き換え
3. `afterUpdate` → `$effect`に置き換え
4. `onDestroy` → `$effect`のクリーンアップ関数に置き換え
:::

## 次のステップ

- [$effect - 副作用の管理](/runes/effect/) - より詳細な`$effect`の使い方
- [Actions](/svelte-basics/actions/) - DOM要素レベルのライフサイクル管理
- [Transitions](/svelte-basics/transitions/) - アニメーションとライフサイクル