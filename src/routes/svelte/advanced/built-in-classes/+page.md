---
title: 組み込みリアクティブクラス
description: Svelte 5のSvelteMapやSvelteSet、SvelteDateなど組み込みリアクティブクラスを実践解説。$stateとの違い、更新検知の仕組み、配列・オブジェクト運用の注意点、パフォーマンス観点の設計指針まで詳しくまとめる。コード例とベストプラクティス付き。詳しい手順とチェックリスト付き
---

<script>
	import { base } from '$app/paths';
	import Admonition from '$lib/components/Admonition.svelte';
	import LiveCode from '$lib/components/LiveCode.svelte';
</script>

Svelte 5では、標準的なJavaScriptの組み込みクラスのリアクティブ版が提供されています。これらのクラスは自動的に変更を追跡し、UIの更新をトリガーします。

## 概要

Svelte 5の組み込みリアクティブクラスは、通常のJavaScriptクラスと同じAPIを持ちながら、内部的な変更を自動的に追跡します。これにより、配列やMapのような複雑なデータ構造でも簡単にリアクティビティを実現できます。

<Admonition type="tip" title="React/Vue経験者向け">
<ul>
<li>ReactのuseStateやVueのrefでラップする必要なく、直接的に操作可能</li>
<li>イミュータブルな更新パターンは不要</li>
<li>内部状態の変更が自動的にUIに反映</li>
</ul>

</Admonition>

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
        <td><a href="#SvelteMap"><code>SvelteMap</code></a></td>
        <td>キーと値のペアを管理</td>
        <td>✅ 利用可能</td>
      </tr>
      <tr class="available">
        <td><code>Set</code></td>
        <td><a href="#SvelteSet"><code>SvelteSet</code></a></td>
        <td>一意な値のコレクション</td>
        <td>✅ 利用可能</td>
      </tr>
      <tr class="available">
        <td><code>Date</code></td>
        <td><a href="#SvelteDate"><code>SvelteDate</code></a></td>
        <td>日時の操作と管理</td>
        <td>✅ 利用可能</td>
      </tr>
      <tr class="available">
        <td><code>URL</code></td>
        <td><a href="#SvelteURL"><code>SvelteURL</code></a></td>
        <td>URLの解析と操作</td>
        <td>✅ 利用可能</td>
      </tr>
      <tr class="available">
        <td><code>URLSearchParams</code></td>
        <td><a href="#SvelteURLSearchParams"><code>SvelteURLSearchParams</code></a></td>
        <td>クエリパラメータの管理</td>
        <td>✅ 利用可能</td>
      </tr>
      <tr class="native">
        <td><code>Array</code></td>
        <td><a href="#ArrayとObject（ネイティブ対応）"><code>$state([])</code></a></td>
        <td>配列データの管理</td>
        <td>🔄 ネイティブ対応</td>
      </tr>
      <tr class="native">
        <td><code>Object</code></td>
        <td><a href="#ArrayとObject（ネイティブ対応）"><code>$state(&#123;&#125;)</code></a></td>
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
  
  .class-comparison a {
    color: inherit;
    text-decoration: none;
    border-bottom: 1px dashed currentColor;
    transition: all 0.2s ease;
  }
  
  .class-comparison a:hover {
    color: #ff3e00;
    border-bottom-style: solid;
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
  
  :global(.dark) .class-comparison a:hover {
    color: #ff6b3e;
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

<Admonition type="info" title="リアクティブクラスの選択基準">
<ul>
<li><strong>専用クラスがある場合</strong>: <code>SvelteMap</code>、<code>SvelteSet</code>など専用のリアクティブクラスを使用</li>
<li><strong>ArrayとObject</strong>: <code>$state()</code>でラップするだけで自動的にリアクティブになる</li>
<li><strong>その他のクラス</strong>: 必要に応じてカスタムラッパークラスを作成</li>
</ul>

</Admonition>

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
        <span>&#123;name&#125;: &#123;score&#125;点</span>
        <button onclick=&#123;() => updateScore(name)&#125;>+10</button>
        <button onclick=&#123;() => removeUser(name)&#125;>削除</button>
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

### ArrayとObject（ネイティブ対応）

Svelte 5では、`Array`と`Object`は`$state()`でラップするだけで自動的にディープリアクティブになります。専用のクラスは不要です。

```svelte ln live
<script lang="ts">
  // 配列は$stateで自動的にリアクティブ
  let todos = $state<Array<{id: number; text: string; done: boolean}>>([]);

  // オブジェクトも同様に自動的にリアクティブ
  let userProfile = $state({
    name: '太郎',
    age: 25,
    preferences: {
      theme: 'dark',
      language: 'ja'
    }
  });

  // 配列のメソッドが自動的にリアクティブ
  function addTodo(text: string) {
    todos.push({
      id: Date.now(),
      text,
      done: false
    });
    // pushだけでUIが更新される！
  }

  function toggleTodo(id: number) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
      todo.done = !todo.done; // 直接変更でOK
    }
  }

  // オブジェクトの深いプロパティも自動追跡
  function toggleTheme() {
    userProfile.preferences.theme =
      userProfile.preferences.theme === 'dark' ? 'light' : 'dark';
  }

  // 派生値
  let completedCount = $derived(
    todos.filter(t => t.done).length
  );

  let greeting = $derived(
    `こんにちは、${userProfile.name}さん（${userProfile.age}歳）`
  );
</script>

<div class="native-reactive">
  <h3>ネイティブリアクティブデモ</h3>

  <div class="user-section">
    <h4>{greeting}</h4>
    <button onclick={toggleTheme}>
      テーマ: {userProfile.preferences.theme}
    </button>
    <button onclick={() => userProfile.age++}>
      年齢を増やす
    </button>
  </div>

  <div class="todo-section">
    <h4>TODOリスト（完了: {completedCount}/{todos.length}）</h4>
    <input
      placeholder="新しいTODO"
      onkeydown={(e) => {
        if (e.key === 'Enter' && e.currentTarget.value) {
          addTodo(e.currentTarget.value);
          e.currentTarget.value = '';
        }
      }}
    />

    <ul>
      {#each todos as todo}
        <li>
          <label>
            <input
              type="checkbox"
              checked=&#123;todo.done&#125;
              onchange=&#123;() => toggleTodo(todo.id)&#125;
            />
            <span class:done=&#123;todo.done&#125;>&#123;todo.text&#125;</span>
          </label>
        </li>
      {/each}
    </ul>
  </div>
</div>

<style>
  .done {
    text-decoration: line-through;
    opacity: 0.6;
  }
</style>
```

<Admonition type="tip" title="ArrayとObjectの重要ポイント">
<ul>
<li><strong>専用クラス不要</strong>: <code>SvelteArray</code>や<code>SvelteObject</code>は存在しません</li>
<li><strong>ディープリアクティブ</strong>: ネストしたプロパティも自動的に追跡</li>
<li><strong>標準メソッド対応</strong>: push、pop、splice、sortなど全て使用可能</li>
<li><strong>直接変更OK</strong>: Reactのようなイミュータブル更新は不要</li>
</ul>

</Admonition>

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
      <li>Protocol: &#123;apiUrl.protocol&#125;</li>
      <li>Host: &#123;apiUrl.host&#125;</li>
      <li>Pathname: &#123;apiUrl.pathname&#125;</li>
      <li>Search: &#123;apiUrl.search&#125;</li>
    </ul>
  </div>
</div>
```

### SvelteURLSearchParams

`URLSearchParams`のリアクティブ版で、クエリパラメータを効率的に管理します。

```svelte ln live
<script lang="ts">
  import { SvelteURLSearchParams } from 'svelte/reactivity';

  // 初期パラメータ
  let params = $state(new SvelteURLSearchParams('?category=electronics&sort=price&page=1'));

  // フィルター設定（個別に$stateで定義）
  let category = $state('electronics');
  let minPrice = $state<number | null>(null);
  let maxPrice = $state<number | null>(null);
  let inStock = $state(false);
  let sort = $state('price');

  // フィルターの変更をURLSearchParamsに反映
  $effect(() => {
    params.set('category', category);
    params.set('sort', sort);

    if (minPrice !== null) {
      params.set('min', minPrice.toString());
    } else {
      params.delete('min');
    }

    if (maxPrice !== null) {
      params.set('max', maxPrice.toString());
    } else {
      params.delete('max');
    }

    if (inStock) {
      params.set('inStock', 'true');
    } else {
      params.delete('inStock');
    }
  });

  // クエリ文字列の生成
  let queryString = $derived(params.toString());

  // 完全なURL
  let fullUrl = $derived(`https://shop.example.com/products?${queryString}`);

  // パラメータのクリア
  function clearFilters() {
    category = 'all';
    minPrice = null;
    maxPrice = null;
    inStock = false;
    sort = 'relevance';
    params.delete('page'); // ページネーションもリセット
  }

  // カテゴリ一覧
  const categories = ['all', 'electronics', 'clothing', 'books', 'sports'];
  const sortOptions = ['relevance', 'price', 'rating', 'newest'];
</script>

<div class="search-params">
  <h3>商品検索フィルター</h3>

  <div class="filters">
    <label>
      カテゴリ:
      <select bind:value={category}>
        {#each categories as cat}
          <option value={cat}>{cat}</option>
        {/each}
      </select>
    </label>

    <label>
      最小価格:
      <input
        type="number"
        bind:value={minPrice}
        placeholder="0"
      />
    </label>

    <label>
      最大価格:
      <input
        type="number"
        bind:value={maxPrice}
        placeholder="999999"
      />
    </label>

    <label>
      <input
        type="checkbox"
        bind:checked={inStock}
      />
      在庫あり
    </label>

    <label>
      並び順:
      <select bind:value={sort}>
        {#each sortOptions as sort}
          <option value={sort}>{sort}</option>
        {/each}
      </select>
    </label>

    <button onclick={clearFilters}>フィルターをクリア</button>
  </div>

  <div class="url-output">
    <h4>生成されたURL:</h4>
    <code>{fullUrl}</code>

    <h4>パラメータ一覧:</h4>
    <ul>
      {#each params as [key, value]}
        <li>&#123;key&#125;: &#123;value&#125;</li>
      {/each}
    </ul>
  </div>
</div>

<style>
  .search-params {
    padding: 1rem;
    background: white;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
  }

  :global(.dark) .search-params {
    background: #1f2937;
    border-color: #374151;
  }

  .search-params h3 {
    color: #ff3e00;
    margin-bottom: 1rem;
  }

  .filters {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    margin: 1rem 0;
  }

  .filters label {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    color: #4b5563;
  }

  :global(.dark) .filters label {
    color: #d1d5db;
  }

  .filters select,
  .filters input[type="number"] {
    padding: 0.375rem 0.5rem;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    background: white;
    color: #111827;
    font-size: 0.875rem;
  }

  :global(.dark) .filters select,
  :global(.dark) .filters input[type="number"] {
    background: #374151;
    border-color: #4b5563;
    color: #f3f4f6;
  }

  .filters button {
    padding: 0.5rem 1rem;
    background: #ff3e00;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.875rem;
    transition: background 0.2s;
  }

  .filters button:hover {
    background: #ff5a00;
  }

  .url-output {
    margin-top: 2rem;
    padding: 1rem;
    background: #f5f5f5;
    border-radius: 8px;
  }

  :global(.dark) .url-output {
    background: #374151;
  }

  .url-output h4 {
    color: #1f2937;
    margin: 0.5rem 0;
    font-size: 0.875rem;
    font-weight: 600;
  }

  :global(.dark) .url-output h4 {
    color: #f3f4f6;
  }

  .url-output code {
    display: block;
    padding: 0.75rem;
    background: white;
    border-radius: 4px;
    word-break: break-all;
    margin: 0.5rem 0;
    color: #1f2937;
    font-size: 0.813rem;
    border: 1px solid #e5e7eb;
  }

  :global(.dark) .url-output code {
    background: #1f2937;
    color: #f3f4f6;
    border-color: #4b5563;
  }

  .url-output ul {
    list-style: none;
    padding: 0;
    margin: 0.5rem 0;
  }

  .url-output li {
    padding: 0.375rem 0;
    color: #4b5563;
    font-size: 0.875rem;
    border-bottom: 1px solid #e5e7eb;
  }

  :global(.dark) .url-output li {
    color: #d1d5db;
    border-bottom-color: #4b5563;
  }

  .url-output li:last-child {
    border-bottom: none;
  }
</style>
```

<Admonition type="info" title="SvelteURLSearchParamsの特徴">
<ul>
<li><strong>自動同期</strong>: パラメータの変更が自動的にUIに反映</li>
<li><strong>標準API準拠</strong>: 通常のURLSearchParamsと同じメソッド</li>
<li><strong>リアクティブイテレーション</strong>: <code>&#123;#each params&#125;</code>で直接ループ可能</li>
<li><strong>型安全</strong>: TypeScriptで完全にサポート</li>
</ul>

</Admonition>

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
  // 複数行の処理には $derived.by() を使用
  let targetDate = $derived.by(() => {
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
  let filteredTasks = $derived.by(() => {
    if (selectedTags.size === 0) {
      return Array.from(tasks.values());
    }

    return Array.from(tasks.values()).filter(task => {
      return Array.from(selectedTags).some(tag => task.tags.has(tag));
    });
  });

  // 統計情報
  let stats = $derived.by(() => {
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
// 複数行の処理には $derived.by() を使用
let data = $state(new SvelteMap<string, number>());

let summary = $derived.by(() => {
  const values = Array.from(data.values());
  const sum = values.reduce((a, b) => a + b, 0);
  return {
    count: values.length,
    sum,
    average: values.length > 0 ? sum / values.length : 0,
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

<Admonition type="info" title="関連リンク">
<ul>
<li><a href="{base}/svelte/advanced/class-reactivity/">クラスとリアクティビティ</a> - カスタムクラスの作成</li>
<li><a href="{base}/svelte/runes/state/">$stateルーン</a> - 基本的なリアクティビティ</li>
<li><a href="{base}/svelte/advanced/reactive-stores/">リアクティブストア</a> - 状態管理パターン</li>
</ul>

</Admonition>
次は<a href="{base}/svelte/advanced/typescript-patterns/">TypeScriptパターン</a>で、より高度な型定義テクニックを学びましょう。
