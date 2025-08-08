---
title: なぜSvelteか
description: Svelteを選ぶ理由と他フレームワークとの比較
---

## Svelteの優位性

### 1. コンパイル時最適化

Svelteは実行時のフレームワークコードを持たず、ビルド時に最適化されたバニラJavaScriptにコンパイルされます。

```typescript
// Svelte 5 のコード
let count = $state(0);

// コンパイル後は最適化されたJSに
```

### 2. 仮想DOMなし

ReactやVueとは異なり、Svelteは仮想DOMを使用せず、DOM操作を直接行います。

**メリット：**
- メモリ使用量の削減
- 差分計算のオーバーヘッドなし
- より高速な更新

### 3. 小さなバンドルサイズ

| フレームワーク | Hello Worldのサイズ |
|--------------|-------------------|
| Svelte 5     | ~10KB            |
| React        | ~45KB            |
| Vue 3        | ~35KB            |
| Angular      | ~130KB           |

### 4. シンプルな構文

```svelte
<script lang="ts">
  let name = $state('World');
</script>

<input bind:value={name} />
<h1>Hello {name}!</h1>
```

## 他フレームワークとの比較

### React との比較

**Svelteの利点：**
- ボイラープレートコードが少ない
- 組み込みの状態管理
- より小さなバンドルサイズ

**Reactの利点：**
- より大きなエコシステム
- より多くのサードパーティライブラリ
- より大きなコミュニティ

### Vue との比較

**Svelteの利点：**
- コンパイル時の最適化
- より高速な実行
- TypeScriptとの統合がよりシンプル

**Vueの利点：**
- より成熟したエコシステム
- より豊富なドキュメント
- より大きな採用実績

## Svelte 5 の新機能

### Runesシステム

Svelte 5で導入されたRunesにより、リアクティビティがより明示的で予測可能になりました。

```typescript
// 明示的なリアクティビティ
let count = $state(0);
let doubled = $derived(count * 2);

$effect(() => {
  console.log(`Count changed: ${count}`);
});
```

### より良いTypeScript統合

```typescript
type Props = {
  name: string;
  age?: number;
};

let { name, age = 0 }: Props = $props();
```

## まとめ

Svelteは以下のような場合に最適です：

- **パフォーマンス重視** のアプリケーション
- **小さなバンドルサイズ** が必要な場合
- **シンプルな構文** を好む開発者
- **TypeScript** を活用したい場合
- **最新の技術** を試したい場合

次は[環境構築](/introduction/setup/)に進みましょう。