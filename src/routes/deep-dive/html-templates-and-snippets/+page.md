---
title: HTML <template> と Svelte #snippet の違い
description: HTML標準のtemplate要素とSvelte 5のsnippet記法の違いを詳しく解説。両者の特徴、使い分け、実装例を紹介
---

Svelte 5 では `#snippet` という記法が導入され、HTML の `<template>` に似た使い方もできますが、両者には明確な違いがあります。以下に特徴と違いを整理します。

## HTML `<template>` とは？

HTML標準の `<template>` 要素は、**初期状態では描画されないDOM構造**を定義し、JavaScript で複製・挿入して動的に表示する用途に使われます。

##### 使用例

```html
<template id="row">
  <tr><td>テンプレート行</td></tr>
</template>

<script>
  const tmpl = document.getElementById('row');
  const clone = tmpl.content.cloneNode(true);
  document.querySelector('table').appendChild(clone);
</script>
```

### 特徴
- ブラウザネイティブ
- DOMに表示されない
- JSから明示的に展開
- 利用は imperative（命令的）

## Svelte `#snippet` とは？

Svelteの `#snippet` は 再利用可能なコード断片（HTML構造＋動作） を定義し、@render によって明示的に呼び出す コンパイル時のテンプレート展開 機構です。

##### 使用例

```svelte
{#snippet userCard(name: string)}
  <div class="card">
    <p>{name}さん、こんにちは！</p>
  </div>
{/snippet}

{@render userCard('太郎')}
```

### 特徴
- Svelte専用の記法
- コンパイル時に展開される
- 引数による構造変更が可能
- 宣言的・関数的に再利用可能

## 🔁 比較表
|項目|HTML `<template>`|Svelte `#snippet`|
|---|---|---|
|実行タイミング|実行時にJSで制御|コンパイル時に展開|
|再利用方法|cloneNode() で複製|`@render` で呼び出し|
|バインディング|JSで手動設定|props引数で自動反映|
|宣言スタイル|imperative（命令的）|declarative（宣言的）|
|フレームワーク依存性|ブラウザ標準|Svelte 5 特有|


## 💡 結論
- HTML `<template>` は JS で DOM を手動で操作したい場合に使う。
- #snippet は Svelte 内で再利用可能なUIパターンを簡潔に構築したい場合に使う。

Svelte では `<template>` よりも #snippet の方が Svelte的なテンプレート再利用として推奨されます。