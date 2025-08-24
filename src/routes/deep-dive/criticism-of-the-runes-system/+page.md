---
title: Runesシステムへの批判と評価
description: Svelte 5のRunesが失った「魔法」と得られた「実用性」について
---

# Runesシステムへの批判と評価

## 概要

「**Svelte特有の利点を捨ててまでRunesを導入する**」という批判は、Svelteの最大の特徴だった「**素のJavaScript構文でリアクティビティを実現**」という哲学からの離脱を指しています。

この記事では、Runesシステムがもたらした変化と、それに対する様々な視点からの評価を包括的に解説します。

## Svelte 3/4の「魔法」とは

### これまでの革命的なシンプルさ

Svelte 3/4は「**普通のJavaScriptに見える**」ことが最大の売りでした。

```javascript
// Svelte 3/4 - 見た目は完全に普通のJavaScript！
let count = 0;           // ただのlet宣言がリアクティブ
$: doubled = count * 2;  // ラベル構文でリアクティブな計算値

function increment() {
  count++;               // 普通の代入で自動的にUIが更新
}
```

### 2019年当時の衝撃

他のフレームワークと比較すると、その革命性が明確でした。

```javascript
// React（当時）
import React, { useState } from 'react';
function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}

// Vue 2（当時）
export default {
  data() {
    return { count: 0 };
  },
  methods: {
    increment() { this.count++; }
  }
}

// Svelte 3（革命的！）
<script>
  let count = 0;
</script>
<button on:click={() => count++}>{count}</button>
```

**「え、これだけ！？」という衝撃**が開発者コミュニティを駆け巡りました。

## Svelte 5 Runesの導入

### 新しい構文

```javascript
// Svelte 5 - 特殊な関数を使う必要がある
let count = $state(0);           // $state()という特殊関数
let doubled = $derived(count * 2); // $derived()という特殊関数

function increment() {
  count++;  // これは同じように動く
}
```

これらは通常のJavaScriptには存在しない特殊な関数です。
- `$state()`
- `$derived()`
- `$effect()`
- `$props()`

### 他のフレームワークとの類似性

```javascript
// Vue 3のComposition API
const count = ref(0);
const doubled = computed(() => count.value * 2);

// Solid.js
const [count, setCount] = createSignal(0);
const doubled = () => count() * 2;

// Svelte 5（Runes）
let count = $state(0);
let doubled = $derived(count * 2);
```

「他のフレームワークと似てきた」という批判が生まれました。

## なぜこの変更が行われたのか

### 1. コンパイラマジックの限界

```javascript
// Svelte 3/4で問題になるケース
let todos = [];
todos.push(newTodo);  // ❌ UIが更新されない！
todos = todos;        // これが必要（不自然）

// 配列やオブジェクトの更新が直感的でない
let obj = { count: 0 };
obj.count++;          // ❌ UIが更新されない！
```

### 2. TypeScriptとの相性問題

```typescript
// Svelte 3/4 - 型推論が難しい
let count = 0;
$: doubled = count * 2;  // TypeScriptが$:を理解できない

// Svelte 5 - 完璧な型推論
let count = $state(0);
let doubled = $derived(count * 2);  // 型が自動推論される
```

### 3. リアクティブなストアの作成

```typescript
// Svelte 5なら.tsファイルでもリアクティブなストアが作れる
// store.svelte.ts
export function createCounter() {
  let count = $state(0);
  return {
    get value() { return count; },
    increment() { count++; }
  };
}
```

## 実際の影響とトレードオフ

### コンパイル結果の比較

重要な点として、**最終的にはどちらも純粋なJavaScriptにコンパイルされます**。

```javascript
// Svelte 3/4のソースコード
let count = 0;
$: doubled = count * 2;

// ↓ コンパイル後（簡略化）
let count = 0;
let doubled;
$: doubled = count * 2;  // リアクティブな更新処理に変換

// Svelte 5のソースコード  
let count = $state(0);
let doubled = $derived(count * 2);

// ↓ コンパイル後（簡略化）
let count = source(0);
let doubled = derived(() => count.value * 2);
// 内部的にシグナルベースの実装に変換
```

### トレードオフの評価

| 観点 | Svelte 3/4 | Svelte 5 (Runes) |
|------|-----------|------------------|
| **シンプルさ** | ✅ 素のJSに見える | ❌ 特殊な関数が必要 |
| **学習曲線** | ✅ JSを知ってれば書ける | ❌ Runes APIを覚える必要 |
| **予測可能性** | ❌ 暗黙的で分かりにくい時がある | ✅ 明示的で予測しやすい |
| **TypeScript** | ❌ 型推論が不完全 | ✅ 完璧な型サポート |
| **パフォーマンス** | ○ 良い | ✅ より最適化しやすい |
| **デバッグ** | ❌ マジックが多く難しい | ✅ 明示的で追いやすい |
| **バンドルサイズ** | ○ 小さい | ✅ より最適化可能 |

### 実務的な影響

| 観点 | 実際の影響 | 批判の本質 |
|------|----------|-----------|
| **実行時パフォーマンス** | ✅ むしろ向上 | - |
| **バンドルサイズ** | ✅ より小さくなる可能性 | - |
| **ブラウザ互換性** | ✅ 変わらず良好 | - |
| **開発時の書き味** | - | ❌ 特殊な構文が必要 |
| **学習コスト** | - | ❌ 新しいAPIを覚える必要 |
| **マーケティング的な独自性** | - | ❌ 失われた |

## 視点による評価の違い

### 古参ユーザーの視点

古参ユーザーにとって、Svelteの魅力は「**魔法のようなシンプルさ**」でした。

- 「普通のJavaScriptに見える」という革命性
- 初心者でも直感的に理解できる構文
- 他のフレームワークとの明確な差別化

**批判の声：**
> 「Svelteの最大の魅力だった『シンプルさ』を失った」  
> 「ReactやVueと変わらなくなってきた」  
> 「初心者に優しくなくなった」

### 新規参入者の視点

途中から参入した開発者にとって、Svelte 5は理想的です。

- **TypeScriptファースト** - 最初から型安全
- **明示的なリアクティビティ** - 学習しやすい
- **SvelteKitとの統合** - フルスタック対応
- **モダンな開発体験** - 最新のベストプラクティス

**評価の声。**
> 「TypeScript対応が完璧で使いやすい」  
> 「明示的で予測可能な動作が安心」  
> 「大規模アプリケーションでも安心して使える」

### 視点別の評価表

| 特徴 | 古参ユーザー | 新規参入者 |
|-----|------------|-----------|
| **Runes** | 😢 魔法が失われた | 😊 TypeScript対応が完璧！ |
| **$state()** | 😔 特殊な構文... | 🎯 明示的で分かりやすい |
| **コンパイラ** | 🤷 前から良かった | 😲 Virtual DOMなし凄い！ |
| **SvelteKit** | 📈 進化して良い | 🚀 最初から統合されてて最高 |
| **バンドルサイズ** | ✅ これは変わらず良い | 😍 こんなに小さいの！？ |

## 現在も残るSvelteの優位性

批判はあるものの、**Svelteには依然として強力な差別化要因が残っています**。

### 1. コンパイル時の最適化（No Virtual DOM）

```javascript
// React/Vue → 実行時に差分計算
// Svelte → コンパイル時に最適な更新コードを生成

// 生成されるコードが手術的に正確
if (dirty & /*count*/ 1) {
  set_data(t, /*count*/ ctx[0]);
}
```

### 2. 圧倒的に小さいバンドルサイズ

```
React App:  ~45KB (React本体)
Vue App:    ~34KB (Vue本体)  
Svelte App: ~10KB (フレームワーク部分がほぼない)
```

### 3. SvelteKitの統合性と型自動生成

```typescript
// ファイルベースルーティング + 型自動生成
// これは本当に他にない体験
import type { PageLoad } from './$types'; // 自動生成！
```

### 4. ビルトインの機能群

```svelte
<!-- アニメーション/トランジション -->
{#if visible}
  <div transition:fade={{ duration: 300 }}>
    <!-- 追加ライブラリ不要！ -->
  </div>
{/if}

<!-- ストアのシンプルさ -->
<script>
  import { count } from './stores.js';
</script>
<button on:click={() => $count++}>{$count}</button>
```

## 哲学の変化

```javascript
// Svelte 3/4の哲学
"Write less code"  // より少ないコードで
"No virtual DOM"   // 仮想DOMなし
"Truly reactive"   // 真にリアクティブ

// Svelte 5の哲学
"Explicit is better than implicit"  // 明示的が暗黙的より良い
"Type safety first"                 // 型安全性を優先
"Scalability matters"               // スケーラビリティ重視
```

## 結論

### 技術的評価

```javascript
// 技術的には
"コンパイル後は同じJavaScript" ✅
"パフォーマンスも問題ない"     ✅
"むしろ改善されている"         ✅

// でも開発者の心理としては
"あの魔法のようなシンプルさはどこへ..." 😢
"他のフレームワークと同じになってきた" 😔
```

### 総括

Svelte 5のRunesシステムは**「魔法のようなシンプルさ」と「実用的な堅牢性」のトレードオフ**で、後者を選択しました。

- **失ったもの**: 「素のJavaScriptに見える」という革命的なシンプルさ
- **得たもの**: TypeScript対応、予測可能性、スケーラビリティ

この変更が良いか悪いかは、**プロジェクトの規模や開発者の好み**によって評価が分かれます。

**重要なのは**：
- 実害はなく、技術的にはむしろ改善されている
- 初期の「魔法」を知らない新規参入者には十分魅力的
- Svelteの独自性（コンパイル時最適化、小さいバンドル等）は健在

最終的に、**「何を重視するか」の違い**であり、どちらの視点も正しいと言えるでしょう。