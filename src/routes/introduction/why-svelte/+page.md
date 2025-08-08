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
let count = 0;
function updateCount(value) {
  count = value;
  element.textContent = count; // 直接DOM更新
}
```

### 2. 仮想DOMなし

ReactやVueとは異なり、Svelteは仮想DOMを使用せず、DOM操作を直接行います。

#### メリット
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

<Tabs activeName="React との比較">
  <TabPanel name="React との比較">
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4 my-8">
      <div class="p-4 border border-gray-2 dark:border-gray-7 rounded-lg shadow-md hover:shadow-lg transition-shadow">
        <h3 class="font-bold text-lg mb-2">Svelteの利点</h3>
        <ul>
          <li>ボイラープレートコードが少ない</li>
          <li>組み込みの状態管理</li>
          <li>より小さなバンドルサイズ</li>
        </ul>
      </div>
      <div class="p-4 border border-gray-2 dark:border-gray-7 rounded-lg shadow-md hover:shadow-lg transition-shadow">
        <h3 class="font-bold text-lg mb-2">Reactの利点 </h3>
        <ul>
          <li>より大きなエコシステム</li>
          <li>より多くのサードパーティライブラリ</li>
          <li>より大きなコミュニティ</li>
        </ul>
      </div>
    </div>
  </TabPanel>

  <TabPanel name="Vue との比較">
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4 my-8">
      <div class="p-4 border border-gray-2 dark:border-gray-7 rounded-lg shadow-md hover:shadow-lg transition-shadow">
        <h3 class="font-bold text-lg mb-2">Svelteの利点</h3>
        <ul>
          <li>コンパイル時の最適化</li>
          <li>より高速な実行</li>
          <li>TypeScriptとの統合がよりシンプル</li>
        </ul>
      </div>
      <div class="p-4 border border-gray-2 dark:border-gray-7 rounded-lg shadow-md hover:shadow-lg transition-shadow">
        <h3 class="font-bold text-lg mb-2">Vueの利点 </h3>
        <ul>
          <li>より成熟したエコシステム</li>
          <li>より豊富なドキュメント</li>
          <li>より大きな採用実績</li>
        </ul>
      </div>
    </div>
  </TabPanel>
</Tabs>

## 実際に動かしてみよう

```svelte live ln title=Counter.svelte
<script>
let count = $state(0);
</script>
<div style="text-align: center; padding: 2rem;">
  <h2>Count: {count}</h2>
  <button onclick={() => count++}>
    Increment
  </button>
  <button onclick={() => count--}>
    Decrement
  </button>
  <button onclick={() => count = 0}>
    Reset
  </button>
</div>
```

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

## 実際のユースケース

### Svelteが適している場面

1. **パフォーマンスクリティカルなアプリケーション**
   - ゲーム、リアルタイムダッシュボード
   - モバイルWebアプリケーション
   - 低スペックデバイス向けアプリ

2. **インタラクティブなコンテンツ**
   - データビジュアライゼーション
   - アニメーション豊富なUI
   - フォーム処理が多いアプリ

3. **プログレッシブWebアプリ（PWA）**
   - オフライン対応
   - 高速な初期ロード
   - ネイティブアプリのような体験

### 採用事例

- **The New York Times** - インタラクティブな記事
- **Apple** - 一部のWebコンテンツ
- **Spotify** - Web Player の一部機能
- **1Password** - ブラウザ拡張機能

## パフォーマンス比較

### 初期ロード時間
```
Svelte:  ~300ms
React:   ~600ms
Vue:     ~500ms
Angular: ~800ms
```
※ 同じ機能を実装した場合の目安

### メモリ使用量
```
Svelte:  ~15MB
React:   ~30MB
Vue:     ~25MB
Angular: ~40MB
```
※ 中規模アプリケーションでの比較

## まとめ

Svelteは以下のような場合に最適です。

- **パフォーマンス重視** のアプリケーション
- **小さなバンドルサイズ** が必要な場合
- **シンプルな構文** を好む開発者
- **TypeScript** を活用したい場合
- **最新の技術** を試したい場合

### Svelteを選ぶべきでない場合

- 大規模なエコシステムが必要な場合 → React
- 企業での実績を重視する場合 → Vue/Angular
- 既存のチームスキルを活かしたい場合 → 現在使用中のフレームワーク

次は[環境構築](/introduction/setup/)に進みましょう。