---
title: $state.raw() vs $state() の違いと使い分け
description: Svelte 5のstate.rawとstateの違いと使い分けを解説
---

<script lang="ts">
  import Mermaid from '$lib/components/Mermaid.svelte';

  const flowChartCode = `flowchart TB
  subgraph UI["UI コンポーネント"]
    A[ ]
  end

  subgraph ProxyState["$state"]
    subgraph Proxyで包まれた状態
      B[ ]
    end
  end

  subgraph RawState["$state.raw()<br>生の状態"]
    subgraph 生の状態
      C[ ]
    end
  end

  A <-- 自動同期 --> B
  A <-- 明示的に $get/$set --> C`;
</script>


Svelte 5 における `$state()` と `$state.raw()` は、どちらもリアクティブな状態管理を行うための仕組みですが、内部動作やユースケースに明確な違いがあります。

このドキュメントでは、それぞれの違いと使い分けのポイントをわかりやすく解説します。
  
## state() とは？

`$state()` は、Svelte のリアクティブステートの基本構文です。これは、**内部で Proxy を用いて読み書きを監視する**ことにより、リアクティブなUI更新を実現します。

### 基本的な使い方

コンポーネントのスクリプト部分では、次のように記述します。

```typescript
// $stateの初期化
let counter = $state(0);

function increment() {
  counter = counter + 1; // 自動的に変更が検知される
}
```

テンプレート部分では通常のJavaScript変数として使用できます。

```html
<p>Count: {counter}</p>
<button onclick={increment}>+1</button>
```

* 直感的に書ける
* 変数の更新が自動的に UI に反映される
* `count++` や `array.push()` などの操作も検知される（Svelte 5では構造化された操作も追跡可能）
  
## state.raw() とは？

`$state.raw()` は、Proxy を経由せず、**生の状態オブジェクトを手動で管理するための低レベルAPI**です。リアクティブな更新を行うためには、明示的に `$get()` や `$set()` を使う必要があります。

### 基本的な使い方

```typescript
// $state.rawの初期化
let counter = $state.raw(0);

function increment() {
  $set(counter, $get(counter) + 1);
  // 手動で更新を通知する必要がある
}
```

テンプレート部分では `$get()` を使用して値を取得します。

```html
<p>Count: {$get(counter)}</p>
<button onclick={increment}>+1</button>
```

* `count` は Proxy ではなくプレーンな値参照
* `$get()` で取得し、`$set()` で更新する必要がある
* より **厳密な制御やトレース** を行いたい場合に使用
  
## 違いまとめ

| 項目 | `$state()` | `$state.raw()` |
| --- |--- |--- |
| リアクティブ | 自動（Proxy） | 手動（`$get` / `$set`） |
| 直感的な書き方 | 可能 | 不可（明示的な操作が必要） |
| 適用例 | 通常のフォームや状態管理 | Map/Set、外部ライブラリ連携、デバッグ用途など |
| 内部処理 | Proxy による追跡 | 生値への直接アクセス |
  
## いつ state.raw() を使う？

以下のような場合に有効です。

* `Map`, `Set`, `Date`, `File` などの **特殊なネイティブ型** を扱うとき
* 外部ライブラリと状態を連携する際に、**変更検知の細かい制御**をしたいとき
* 自作のステート更新処理で、**どのタイミングで再描画させるかを明示的に制御**したいとき
* デバッグ目的で状態の取得・更新をログしたいとき
  

## 図解：状態管理の構造の違い

<Mermaid diagram={flowChartCode} />

## 使用例：Mapなどの特殊型

### stateでMapを使う場合の問題

```typescript
// ❌ $stateでMapを使うと更新がUIに反映されないことがある
let myMap = $state(new Map());
myMap.set('key', 'value'); // 再描画されない可能性
```

### state.rawを使った解決策

```typescript
// ✅ $state.rawを使う
let myMap = $state.raw(new Map());

function updateMap() {
  const map = $get(myMap);
  map.set('key', 'updated');
  $set(myMap, map); // 明示的に通知
}
```

## 外部ライブラリと連携する場合

```typescript
// コンポーネントのスクリプト部分
let chartData = $state.raw([]);

function fetchDataFromLibrary() {
  const data = externalLibrary.getData(); // 外部で生成
  $set(chartData, data); // 手動で設定
}
```

テンプレート部分：

```html
<ChartComponent data={$get(chartData)} />
```

## 結論

通常は `$state()` を使い、必要な場面でだけ `$state.raw()` を使うのがベストです。

> 高度な制御が必要な場面を除いては、`$state()` で完結するコードの方が簡潔かつ安全です。