---
title: カスタムエレメントと通常のSvelteコンポーネントの違い
description: 
---

Svelteでは、コンポーネントを「通常のSvelteコンポーネント」として使う方法と、「Web Components（カスタムエレメント）」として使う方法の2つが存在します。それぞれの使い方と特徴の違いをまとめます。

## ✅ 使い方の違い

### 通常のコンポーネント

```svelte
<!-- Parent.svelte -->
<script>
  import Widget from './Widget.svelte';
</script>

<Widget name="Svelte" />
```

- Svelteアプリ内でのみ使用。
- `props` の受け渡し、型補完が効く。
- SSRやSvelteKitとの統合が容易。

### カスタムエレメント（Web Components）

```svelte
<!-- Stepper.svelte -->
<svelte:options customElement="my-stepper" />

<script>
  export let step = 0;
</script>

<p>現在のステップ: {step}</p>
```

```html
<!-- 外部HTMLや別フレームワークで利用 -->
<my-stepper step="2"></my-stepper>
```

- `svelte:options` で customElement 名を指定。
- Shadow DOM によるスタイルのカプセル化。
- 外部アプリケーション（React, Vue, HTML）でも使用可能。

## 📊 比較表

| 観点                     | 通常のSvelteコンポーネント           | カスタムエレメント（Web Component） |
|--------------------------|------------------------------------|--------------------------------------|
| 使用場所                | Svelte内                          | 任意のHTML環境                       |
| バインディング           | propsで安全に渡す                  | 属性やDOMプロパティ経由              |
| スタイリング            | スコープ付きCSS                   | Shadow DOMでカプセル化               |
| SSR対応                 | ✅ 可能                            | ❌ 非対応                             |
| 型補完・ツール連携      | ✅ TypeScript対応良好              | ❌ 限定的                             |
| ライフサイクルフック    | Svelteの独自API                   | Web Componentsの仕様に準拠           |

## 💡 どちらを使うべき？

| 目的                                             | 推奨方法             |
|--------------------------------------------------|----------------------|
| Svelteアプリ内で再利用                          | 通常のコンポーネント |
| 他フレームワークやHTMLでも再利用したい           | カスタムエレメント   |
| SSRしたい                                        | 通常のコンポーネント |
| 完全にスタイルを隔離したい                       | カスタムエレメント   |

## 🧠 補足

- カスタムエレメントは一種のWeb標準で、Svelteはそれに準拠した形で出力できます。
- ただし、SEOやSSRを重視する場合は、通常のSvelteコンポーネントを選びましょう。