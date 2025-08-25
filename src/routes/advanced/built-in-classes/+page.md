---
title: 組み込みリアクティブクラス
description: Svelte 5の組み込みリアクティブクラスの活用
---

Svelte 5では、標準的なJavaScriptの組み込みクラスのリアクティブ版が提供されています。これらのクラスは自動的に変更を追跡し、UIの更新をトリガーします。

## 概要

Svelte 5の組み込みリアクティブクラスは、通常のJavaScriptクラスと同じAPIを持ちながら、内部的な変更を自動的に追跡します。これにより、配列やMapのような複雑なデータ構造でも簡単にリアクティビティを実現できます。

:::tip[React/Vue経験者向け]
- ReactのuseStateやVueのrefでラップする必要なく、直接的に操作可能
- イミュータブルな更新パターンは不要
- 内部状態の変更が自動的にUIに反映
:::

## リアクティブクラス対応表

JavaScriptの組み込みクラスとSvelte 5のリアクティブクラスの対応関係を示します。

<div class="class-comparison">
  <table>
    <thead>
      <tr>
        <th>JavaScript標準クラス</th>
        <th>Svelteリアクティブクラス</th>
        <th>主な用途</th>
        <th>状態</th>
      </tr>
    </thead>
    <tbody>
      <tr class="available">
        <td><code>Map</code></td>
        <td><code>SvelteMap</code></td>
        <td>キーと値のペアを管理</td>
        <td>✅ 利用可能</td>
      </tr>
      <tr class="available">
        <td><code>Set</code></td>
        <td><code>SvelteSet</code></td>
        <td>一意な値のコレクション</td>
        <td>✅ 利用可能</td>
      </tr>
      <tr class="available">
        <td><code>Date</code></td>
        <td><code>SvelteDate</code></td>
        <td>日時の操作と管理</td>
        <td>✅ 利用可能</td>
      </tr>
      <tr class="available">
        <td><code>URL</code></td>
        <td><code>SvelteURL</code></td>
        <td>URLの解析と操作</td>
        <td>✅ 利用可能</td>
      </tr>
      <tr class="available">
        <td><code>URLSearchParams</code></td>
        <td><code>SvelteURLSearchParams</code></td>
        <td>クエリパラメータの管理</td>
        <td>✅ 利用可能</td>
      </tr>
      <tr class="native">
        <td><code>Array</code></td>
        <td><code>$state([])</code></td>
        <td>配列データの管理</td>
        <td>🔄 ネイティブ対応</td>
      </tr>
      <tr class="native">
        <td><code>Object</code></td>
        <td><code>$state(&#123;&#125;)</code></td>
        <td>オブジェクトの管理</td>
        <td>🔄 ネイティブ対応</td>
      </tr>
      <tr class="planned">
        <td><code>WeakMap</code></td>
        <td><code>SvelteWeakMap</code></td>
        <td>弱参照キーマップ</td>
        <td>📝 計画中</td>
      </tr>
      <tr class="planned">
        <td><code>WeakSet</code></td>
        <td><code>SvelteWeakSet</code></td>
        <td>弱参照セット</td>
        <td>📝 計画中</td>
      </tr>
    </tbody>
  </table>
</div>

<style>
  .class-comparison {
    margin: 2rem 0;
    overflow-x: auto;
  }
  
  .class-comparison table {
    width: 100%;
    border-collapse: collapse;
    background: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    overflow: hidden;
  }
  
  .class-comparison th {
    background: #f5f5f5;
    padding: 1rem;
    text-align: left;
    font-weight: 600;
    border-bottom: 2px solid #e0e0e0;
  }
  
  .class-comparison td {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #eee;
  }
  
  .class-comparison code {
    background: #f0f0f0;
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
    font-size: 0.9rem;
  }
  
  .class-comparison tr.available {
    background: #f0fdf4;
  }
  
  .class-comparison tr.native {
    background: #fef3c7;
  }
  
  .class-comparison tr.planned {
    background: #f3f4f6;
  }
  
  .class-comparison tr:hover {
    background: #f9fafb;
  }
  
  /* ダークモード対応 */
  :global(.dark) .class-comparison table {
    background: #1f2937;
  }
  
  :global(.dark) .class-comparison th {
    background: #374151;
    color: #f3f4f6;
    border-bottom-color: #4b5563;
  }
  
  :global(.dark) .class-comparison td {
    color: #e5e7eb;
    border-bottom-color: #374151;
  }
  
  :global(.dark) .class-comparison code {
    background: #4b5563;
    color: #f3f4f6;
  }
  
  :global(.dark) .class-comparison tr.available {
    background: rgba(34, 197, 94, 0.1);
  }
  
  :global(.dark) .class-comparison tr.native {
    background: rgba(251, 191, 36, 0.1);
  }
  
  :global(.dark) .class-comparison tr.planned {
    background: rgba(156, 163, 175, 0.05);
  }
  
  :global(.dark) .class-comparison tr:hover {
    background: #4b5563;
  }
</style>

:::info[リアクティブクラスの選択基準]
- **専用クラスがある場合**: `SvelteMap`、`SvelteSet`など専用のリアクティブクラスを使用
- **ArrayとObject**: `$state()`でラップするだけで自動的にリアクティブになる
- **その他のクラス**: 必要に応じてカスタムラッパークラスを作成
:::

## 主要な組み込みクラス

Svelte 5で利用可能なリアクティブクラスの詳細な使い方を解説します。

### SvelteMap

`Map`のリアクティブ版で、キーと値のペアを管理します。

```svelte ln live
<script lang="ts">
  import { SvelteMap } from 'svelte/reactivity';
  
  // 型安全なMapの作成
  let userScores = $state(new SvelteMap<string, number>());
  
  // 初期データの設定
  userScores.set('Alice', 100);
  userScores.set('Bob', 85);
  userScores.set('Charlie', 92);
  
  // 合計スコアの計算（自動更新）
  let totalScore = $derived(
    Array.from(userScores.values()).reduce((sum, score) => sum + score, 0)
  );
  
  let averageScore = $derived(
    userScores.size > 0 ? totalScore / userScores.size : 0
  );
  
  function addUser() {
    const name = prompt('ユーザー名:');
    if (name) {
      userScores.set(name, 0);
    }
  }
  
  function updateScore(name: string) {
    const currentScore = userScores.get(name) || 0;
    userScores.set(name, currentScore + 10);
  }
  
  function removeUser(name: string) {
    userScores.delete(name);
  }
</script>

<div class="scoreboard">
  <h3>スコアボード</h3>
  
  <div class="stats">
    <span>総スコア: {totalScore}</span>
    <span>平均: {averageScore.toFixed(1)}</span>
    <span>参加者: {userScores.size}人</span>
  </div>
  
  <ul>
    {#each userScores as [name, score]}
      <li>
        <span>{name}: {score}点</span>
        <button onclick={() => updateScore(name)}>+10</button>
        <button onclick={() => removeUser(name)}>削除</button>
      </li>
    {/each}
  </ul>
  
  <button onclick={addUser}>ユーザー追加</button>
</div>
```

### SvelteSet

`Set`のリアクティブ版で、一意な値のコレクションを管理します。

```svelte ln live
<script lang="ts">
  import { SvelteSet } from 'svelte/reactivity';
  
  // 選択されたタグを管理
  let selectedTags = $state(new SvelteSet<string>());
  let availableTags = ['JavaScript', 'TypeScript', 'Svelte', 'React', 'Vue', 'CSS', 'HTML'];
  
  // 選択状態の切り替え
  function toggleTag(tag: string) {
    if (selectedTags.has(tag)) {
      selectedTags.delete(tag);
    } else {
      selectedTags.add(tag);
    }
  }
  
  // 全選択/全解除
  function selectAll() {
    availableTags.forEach(tag => selectedTags.add(tag));
  }
  
  function clearAll() {
    selectedTags.clear();
  }
  
  // 選択されたタグの配列（ソート済み）
  let selectedArray = $derived(
    Array.from(selectedTags).sort()
  );
</script>

<div class="tag-selector">
  <h3>タグ選択</h3>
  
  <div class="controls">
    <button onclick={selectAll}>全選択</button>
    <button onclick={clearAll}>クリア</button>
    <span>選択数: {selectedTags.size}</span>
  </div>
  
  <div class="tags">
    {#each availableTags as tag}
      <button
        class="tag"
        class:selected={selectedTags.has(tag)}
        onclick={() => toggleTag(tag)}
      >
        {tag}
      </button>
    {/each}
  </div>
  
  {#if selectedTags.size > 0}
    <div class="selected">
      <h4>選択中:</h4>
      <p>{selectedArray.join(', ')}</p>
    </div>
  {/if}
</div>

<style>
  .tag {
    padding: 0.5rem 1rem;
    margin: 0.25rem;
    border: 2px solid #ccc;
    background: white;
    cursor: pointer;
    border-radius: 20px;
    color: #333;
  }
  
  .tag.selected {
    background: #3b82f6;
    color: white;
    border-color: #3b82f6;
  }
</style>
```

### SvelteURL

`URL`のリアクティブ版で、URLの各部分を動的に管理します。

```typescript
<script lang="ts">
  import { SvelteURL } from 'svelte/reactivity';
  
  // リアクティブなURL
  let apiUrl = $state(new SvelteURL('https://api.example.com/users'));
  
  // クエリパラメータの管理
  let page = $state(1);
  let limit = $state(10);
  let sortBy = $state('name');
  
  // URLの自動更新
  $effect(() => {
    apiUrl.searchParams.set('page', page.toString());
    apiUrl.searchParams.set('limit', limit.toString());
    apiUrl.searchParams.set('sort', sortBy);
  });
  
  // 完全なURLの取得
  let fullUrl = $derived(apiUrl.href);
  
  function nextPage() {
    page++;
  }
  
  function previousPage() {
    if (page > 1) page--;
  }
  
  function changeLimit(newLimit: number) {
    limit = newLimit;
    page = 1; // リセット
  }
</script>

<div class="url-builder">
  <h3>API URLビルダー</h3>
  
  <div class="url-display">
    <code>{fullUrl}</code>
  </div>
  
  <div class="controls">
    <div>
      <label>
        ページ:
        <button onclick={previousPage} disabled={page === 1}>←</button>
        <span>{page}</span>
        <button onclick={nextPage}>→</button>
      </label>
    </div>
    
    <div>
      <label>
        表示件数:
        <select bind:value={limit} onchange={() => page = 1}>
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </label>
    </div>
    
    <div>
      <label>
        ソート:
        <select bind:value={sortBy}>
          <option value="name">名前</option>
          <option value="date">日付</option>
          <option value="score">スコア</option>
        </select>
      </label>
    </div>
  </div>
  
  <div class="url-parts">
    <h4>URL構成要素:</h4>
    <ul>
      <li>Protocol: {apiUrl.protocol}</li>
      <li>Host: {apiUrl.host}</li>
      <li>Pathname: {apiUrl.pathname}</li>
      <li>Search: {apiUrl.search}</li>
    </ul>
  </div>
</div>
```

### SvelteDate

`Date`のリアクティブ版で、日時の操作を追跡します。

```typescript
<script lang="ts">
  import { SvelteDate } from 'svelte/reactivity';
  
  // リアクティブな日時
  let currentDate = $state(new SvelteDate());
  
  // フォーマット済みの表示
  let formattedDate = $derived(
    currentDate.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    })
  );
  
  let formattedTime = $derived(
    currentDate.toLocaleTimeString('ja-JP')
  );
  
  // 相対的な日付計算
  let daysFromNow = $state(0);
  let targetDate = $derived(() => {
    const date = new SvelteDate(currentDate);
    date.setDate(date.getDate() + daysFromNow);
    return date;
  });
  
  function addDays(days: number) {
    currentDate.setDate(currentDate.getDate() + days);
  }
  
  function setToToday() {
    currentDate.setTime(Date.now());
  }
  
  // タイマーで自動更新
  let autoUpdate = $state(false);
  
  $effect(() => {
    if (autoUpdate) {
      const interval = setInterval(() => {
        currentDate.setTime(Date.now());
      }, 1000);
      
      return () => clearInterval(interval);
    }
  });
</script>

<div class="date-picker">
  <h3>日時ピッカー</h3>
  
  <div class="current-datetime">
    <p class="date">{formattedDate}</p>
    <p class="time">{formattedTime}</p>
  </div>
  
  <div class="controls">
    <button onclick={() => addDays(-1)}>前日</button>
    <button onclick={setToToday}>今日</button>
    <button onclick={() => addDays(1)}>翌日</button>
  </div>
  
  <label>
    <input type="checkbox" bind:checked={autoUpdate} />
    リアルタイム更新
  </label>
  
  <div class="relative-date">
    <label>
      相対日付:
      <input type="range" bind:value={daysFromNow} min="-30" max="30" />
      <span>{daysFromNow > 0 ? '+' : ''}{daysFromNow}日</span>
    </label>
    <p>対象日: {targetDate.toLocaleDateString('ja-JP')}</p>
  </div>
</div>
```

## 実践的な使用例

組み込みリアクティブクラスを実際のアプリケーションで活用する方法を実例で紹介します。

### タスク管理システム

複数の組み込みクラスを組み合わせた実践例

```typescript
<script lang="ts">
  import { SvelteMap, SvelteSet, SvelteDate } from 'svelte/reactivity';
  
  type Task = {
    id: string;
    title: string;
    createdAt: SvelteDate;
    tags: SvelteSet<string>;
    completed: boolean;
  };
  
  // タスクの管理
  let tasks = $state(new SvelteMap<string, Task>());
  let selectedTags = $state(new SvelteSet<string>());
  let allTags = $state(new SvelteSet<string>(['work', 'personal', 'urgent', 'someday']));
  
  // フィルタリングされたタスク
  let filteredTasks = $derived(() => {
    if (selectedTags.size === 0) {
      return Array.from(tasks.values());
    }
    
    return Array.from(tasks.values()).filter(task => {
      return Array.from(selectedTags).some(tag => task.tags.has(tag));
    });
  });
  
  // 統計情報
  let stats = $derived(() => {
    const all = Array.from(tasks.values());
    return {
      total: all.length,
      completed: all.filter(t => t.completed).length,
      pending: all.filter(t => !t.completed).length,
      urgent: all.filter(t => t.tags.has('urgent')).length
    };
  });
  
  function addTask(title: string, tagNames: string[] = []) {
    const id = crypto.randomUUID();
    const tags = new SvelteSet(tagNames);
    
    // 新しいタグを全体のタグリストに追加
    tagNames.forEach(tag => allTags.add(tag));
    
    tasks.set(id, {
      id,
      title,
      createdAt: new SvelteDate(),
      tags,
      completed: false
    });
  }
  
  function toggleTask(id: string) {
    const task = tasks.get(id);
    if (task) {
      task.completed = !task.completed;
      tasks.set(id, task); // 更新をトリガー
    }
  }
  
  function deleteTask(id: string) {
    tasks.delete(id);
  }
  
  function toggleTagFilter(tag: string) {
    if (selectedTags.has(tag)) {
      selectedTags.delete(tag);
    } else {
      selectedTags.add(tag);
    }
  }
  
  // サンプルデータ
  addTask('プロジェクト企画書作成', ['work', 'urgent']);
  addTask('買い物リスト作成', ['personal']);
  addTask('新機能の実装', ['work']);
</script>

<div class="task-manager">
  <h2>タスク管理</h2>
  
  <!-- 統計 -->
  <div class="stats">
    <div>全体: {stats.total}</div>
    <div>完了: {stats.completed}</div>
    <div>未完了: {stats.pending}</div>
    <div>緊急: {stats.urgent}</div>
  </div>
  
  <!-- タグフィルター -->
  <div class="tag-filter">
    <h4>フィルター:</h4>
    {#each allTags as tag}
      <button
        class:active={selectedTags.has(tag)}
        onclick={() => toggleTagFilter(tag)}
      >
        {tag}
      </button>
    {/each}
  </div>
  
  <!-- タスクリスト -->
  <div class="task-list">
    {#each filteredTasks as task}
      <div class="task" class:completed={task.completed}>
        <input
          type="checkbox"
          checked={task.completed}
          onchange={() => toggleTask(task.id)}
        />
        <div class="task-content">
          <div class="task-title">{task.title}</div>
          <div class="task-meta">
            <span class="task-date">
              {task.createdAt.toLocaleDateString('ja-JP')}
            </span>
            <div class="task-tags">
              {#each task.tags as tag}
                <span class="tag">{tag}</span>
              {/each}
            </div>
          </div>
        </div>
        <button onclick={() => deleteTask(task.id)}>削除</button>
      </div>
    {/each}
  </div>
</div>
```

## パフォーマンスと最適化

組み込みリアクティブクラスのパフォーマンス特性と最適化テクニックを解説します。

### メモリ効率

組み込みリアクティブクラスは、通常のJavaScriptクラスと比較して最小限のオーバーヘッドで動作します。

```typescript
<script lang="ts">
  // 大量のデータを扱う場合
  let largeDataSet = $state(new SvelteMap<string, any>());
  
  // 遅延初期化パターン
  let lazyMap = $state.raw(null as SvelteMap<string, any> | null);
  
  function initializeMap() {
    if (!lazyMap) {
      lazyMap = new SvelteMap();
      // 大量のデータをロード
    }
  }
  
  // 必要な部分のみリアクティブに
  class DataManager {
    // リアクティブが不要な参照データ
    private staticData = new Map<string, any>();
    
    // リアクティブが必要な動的データ
    dynamicData = $state(new SvelteMap<string, any>());
    
    getStaticValue(key: string) {
      return this.staticData.get(key);
    }
    
    setDynamicValue(key: string, value: any) {
      this.dynamicData.set(key, value); // UIが更新される
    }
  }
</script>
```

### 更新の最適化

リアクティブクラスの更新処理を効率化し、不要な再レンダリングを防ぐ方法です。

```typescript
<script lang="ts">
  let items = $state(new SvelteMap<string, Item>());
  
  // バッチ更新パターン
  function batchUpdate(updates: Array<[string, Item]>) {
    // 一時的にリアクティビティを無効化
    const map = $state.raw(items);
    
    updates.forEach(([key, value]) => {
      map.set(key, value);
    });
    
    // 最後に一度だけ更新をトリガー
    items = new SvelteMap(map);
  }
  
  // 条件付き更新
  function conditionalUpdate(key: string, value: Item) {
    const current = items.get(key);
    
    // 実際に変更がある場合のみ更新
    if (!current || !isEqual(current, value)) {
      items.set(key, value);
    }
  }
</script>
```

## TypeScriptとの統合

組み込みリアクティブクラスでTypeScriptの型システムを最大限活用する方法を紹介します。

### 型定義の活用

厳密な型定義により、コンパイル時にエラーを検出し、安全なコードを書く方法です。

```typescript
<script lang="ts">
  // ジェネリック型を活用
  class TypedSvelteMap<K, V> extends SvelteMap<K, V> {
    // カスタムメソッドの追加
    getOrDefault(key: K, defaultValue: V): V {
      return this.get(key) ?? defaultValue;
    }
    
    // 型安全な更新メソッド
    update(key: K, updater: (value: V | undefined) => V): void {
      this.set(key, updater(this.get(key)));
    }
  }
  
  // 使用例
  let userSettings = $state(
    new TypedSvelteMap<string, UserSettings>()
  );
  
  userSettings.update('theme', (current) => ({
    ...current,
    darkMode: true
  }));
</script>
```

### カスタム型ガード

型の安全性を保証するカスタム型ガード関数の作成と活用方法を解説します。

```typescript
<script lang="ts">
  // 型安全なSetの操作
  class TypedSvelteSet<T> extends SvelteSet<T> {
    hasAll(...values: T[]): boolean {
      return values.every(v => this.has(v));
    }
    
    hasAny(...values: T[]): boolean {
      return values.some(v => this.has(v));
    }
    
    intersection(other: Set<T>): TypedSvelteSet<T> {
      const result = new TypedSvelteSet<T>();
      for (const value of this) {
        if (other.has(value)) {
          result.add(value);
        }
      }
      return result;
    }
  }
  
  // 使用例
  let permissions = $state(
    new TypedSvelteSet<Permission>()
  );
  
  let canEdit = $derived(
    permissions.hasAll('read', 'write')
  );
</script>
```

## ベストプラクティス

組み込みリアクティブクラスを効果的に使用するための推奨パターンと注意点です。

### 1. 適切なクラスの選択

ユースケースに応じて最適なリアクティブクラスを選択するガイドラインです。

```typescript
// ❌ 悪い例：単純な配列操作にMapを使用
let items = $state(new SvelteMap());
items.set(0, 'first');
items.set(1, 'second');

// ✅ 良い例：配列として使用
let items = $state<string[]>([]);
items.push('first');
items.push('second');

// ✅ Mapはキーバリューペアのストレージとして使用
let cache = $state(new SvelteMap<string, CachedData>());
cache.set('user:123', userData);
```

### 2. イミュータブル操作の回避

リアクティブクラスでは直接的な変更が可能なため、不要なイミュータブル操作を避ける方法です。

```typescript
// ❌ 悪い例：不要なイミュータブル操作
let items = $state(new SvelteSet([1, 2, 3]));
items = new SvelteSet([...items, 4]); // 非効率

// ✅ 良い例：直接操作
let items = $state(new SvelteSet([1, 2, 3]));
items.add(4); // 効率的
```

### 3. 派生値の活用

$derivedを使って計算結果を効率的にキャッシュし、パフォーマンスを向上させる方法です。

```typescript
// ✅ 派生値で計算結果をキャッシュ
let data = $state(new SvelteMap());

let summary = $derived(() => {
  const values = Array.from(data.values());
  return {
    count: values.length,
    sum: values.reduce((a, b) => a + b, 0),
    average: values.length > 0 ? sum / values.length : 0
  };
});
```

## まとめ

Svelte 5の組み込みリアクティブクラスは、複雑なデータ構造を扱う際の強力なツールです。通常のJavaScriptクラスと同じAPIを保ちながら、自動的な変更追跡とUI更新を提供します。

### 重要なポイント

このページで学んだ最も重要な概念と実践的な知識のまとめです。

1. **自動的な変更追跡** - 内部状態の変更が自動的に検出される
2. **標準API準拠** - 通常のMap、Set、URL、Dateと同じメソッド
3. **TypeScript対応** - 完全な型安全性
4. **パフォーマンス** - 最小限のオーバーヘッド
5. **直感的な操作** - イミュータブル更新パターンが不要

:::info[関連リンク]
- [クラスとリアクティビティ](/advanced/class-reactivity/) - カスタムクラスの作成
- [$stateルーン](/runes/state/) - 基本的なリアクティビティ
- [リアクティブストア](/advanced/reactive-stores/) - 状態管理パターン
:::

次は[TypeScriptパターン](/advanced/typescript-patterns/)で、より高度な型定義テクニックを学びましょう。