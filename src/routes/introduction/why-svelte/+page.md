---
title: なぜSvelteか
description: Svelteを選ぶ理由を実測ベンチマークと開発体験の両面から整理。コンパイル時最適化で小さなバンドルと高速初期表示を実現し、Runesによる明快なリアクティビティで学習コストを抑えられるメリットを具体的に解説し、採用判断を支援する。詳しい手順とチェックリスト付き。詳しい手順とチェックリスト付き。導入時の確認リストを収録
---

<script lang="ts">
	import Admonition from '$lib/components/Admonition.svelte';
	import LiveCode from '$lib/components/LiveCode.svelte';
  import { base } from '$app/paths';
</script>

## Svelte 5の革新的アプローチ

Svelteは、**コンパイル時に最適化を行う**という革新的なアプローチを採用したフロントエンドフレームワークです。他のフレームワークとは異なり、**Virtual DOMを使用しません**。代わりに、ビルド時にコンポーネントを高効率なVanilla JavaScriptに変換します。

<Admonition type="info" title="Svelteのコンパイル">

ここで定義されている`Svelteのコンパイル`とは、ブラウザやNode.jsで実行するために、ビルド時にコンポーネントを解析し、必要最小限のJavaScriptコードに変換することです。
詳しくは、技術詳細の<a href="{base}/deep-dive/compile-time-optimization/">Svelte はコンパイル時に何をやっているのか？</a>を参照してください。

</Admonition>
<Admonition type="tip" title="リアクティビティの仕組みを理解する">

Svelteのリアクティビティシステムがどのように動作するか、内部実装に興味がある方は<a href="{base}/deep-dive/reactivity-with-plain-javascript-syntax/">素のJavaScript構文でリアクティビティを実現</a>をご覧ください。Object.definePropertyからProxyまで、リアクティビティの実装方法を詳しく解説しています。

</Admonition>

## 主な特徴

<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 my-8">
  <div class="content-card p-4">
    <div class="text-3xl mb-2">⚡</div>
    <h3 class="font-bold text-lg mb-2">コンパイラベース</h3>
    <p>ビルド時に最適化されたコードを生成し、ランタイムオーバーヘッドを最小限に</p>
  </div>
  <div class="content-card p-4">
    <div class="text-3xl mb-2">🎯</div>
    <h3 class="font-bold text-lg mb-2">Virtual DOM不使用</h3>
    <p>直接DOMを操作する効率的なコードで、差分計算のオーバーヘッドなし</p>
  </div>
  <div class="content-card p-4">
    <div class="text-3xl mb-2">📦</div>
    <h3 class="font-bold text-lg mb-2">軽量</h3>
    <p>小さなバンドルサイズで、ネットワーク転送量を大幅削減</p>
  </div>
  <div class="content-card p-4">
    <div class="text-3xl mb-2">🚀</div>
    <h3 class="font-bold text-lg mb-2">高速</h3>
    <p>ランタイムオーバーヘッドが最小限で、初期表示も操作も高速</p>
  </div>
  <div class="content-card p-4">
    <div class="text-3xl mb-2">✨</div>
    <h3 class="font-bold text-lg mb-2">シンプル</h3>
    <p>学習曲線が緩やかで、直感的なAPI設計</p>
  </div>
  <div class="content-card p-4">
    <div class="text-3xl mb-2">🔧</div>
    <h3 class="font-bold text-lg mb-2">TypeScript統合</h3>
    <p>Svelte 5で完全な型安全性を実現</p>
  </div>
</div>

## コンパイル時の最適化

### 従来のフレームワークの問題点

ReactやVueは、アプリケーションに常にフレームワークのランタイムを含める必要があります。つまり、ユーザーは必ず「React本体」や「Vue本体」をダウンロードし、メモリに保持する必要があります。

### Svelteの革新的アプローチ

Svelteはビルド時にすべてを「素のJavaScript」に変換します。フレームワーク自体が消えてなくなるのです。

#### あなたが書くコード（Svelte 5）

```typescript
let count = $state(0);
let doubled = $derived(count * 2);
```

#### 実際にブラウザで動くコード（コンパイル後）

```typescript
let count = 0;
let doubled = 0;
function update_count(value) {
  if (count !== value) {
    count = value;
    doubled = count * 2;
    element.textContent = doubled; // 必要な箇所だけ直接更新
  }
}
```

### 実際の影響

- **初期ロードが軽量** - フレームワーク本体のダウンロード・解析コストが発生しない
- **メモリ使用量の削減** - ランタイムライブラリを常駐させる必要がない
- **モバイル・低スペック端末ほど恩恵が大きい** - 余計なJavaScriptの実行コストが減るため、CPUが非力な環境ほど体感差が出る

:::note[定量的な比較について]
具体的なバンドルサイズ・実行性能の比較は、[js-framework-benchmark by Krausest](https://krausest.github.io/js-framework-benchmark/current.html) で各フレームワークの最新値を確認できます。
:::

## 仮想DOMを使わない

### 仮想DOMの本質的な問題

ReactやVueは変更を検出するために、以下のステップを毎回実行します。

1. 新しい仮想DOMツリーを生成
2. 古い仮想DOMツリーと比較（差分計算）
3. 変更箇所を特定
4. 実際のDOMを更新

これは「どこが変わったか分からないから、全部チェックする」アプローチです。

### Svelteの賢いアプローチ

コンパイル時に「どこが変わる可能性があるか」を完全に把握し、変更箇所だけを直接更新するコードを生成します。

#### React：毎回全体を再計算

```typescript
function Component() {
  const [items, setItems] = useState([...]);
  // 毎回、全itemsを仮想DOMで再生成・比較
  return items.map(item => <li>{item}</li>);
}
```

#### Svelte：変更箇所だけを外科的に更新

```typescript
let items = $state([...]);
// コンパイル時に「配列のindex 3が変わったら、
// DOM の4番目のliだけを更新」というコードを生成
```

### 一般的な傾向

- **大量要素の部分更新が得意** - 「どこを更新すべきか」が静的解析済みなので、差分計算のコストが発生しない
- **複雑なフォームでも更新コストが小さい** - 変更箇所だけが直接DOMに反映される
- **アニメーション系で安定したフレームレートを維持しやすい** - フレーム毎の再計算が少ない

公開された横並びベンチマークとしては [js-framework-benchmark by Krausest](https://krausest.github.io/js-framework-benchmark/current.html) が参考になります。複数のベンチマークシナリオで Svelte は主要フレームワークの中でも軽量・高速な部類に位置付けられています。

## バンドルサイズ：なぜ差が生まれるのか

### Svelte が小さくなる理由

ReactやVueはフレームワーク本体のランタイムをバンドルに含める必要がありますが、Svelteはコンパイル時に必要なコードだけを生成するため、最終的なJavaScriptが小さくなる傾向があります。

### なぜこれほど差が出るのか

- **Svelteはツリーシェイキングと相性が良い** - 使わない機能は最終バンドルに含まれにくい
- **デッドコード削除が徹底的** - コンパイラがコンポーネント単位で不要分岐を削除
- **gzip圧縮後も小さくまとまりやすい** - 生成コードがシンプル

各フレームワークの最新の Hello World サイズや代表的なベンチマークアプリのサイズは、[bundlephobia](https://bundlephobia.com/) や [js-framework-benchmark by Krausest](https://krausest.github.io/js-framework-benchmark/current.html) で実測値が確認できます。

### 実世界での影響

- 初期表示までの体感速度が改善しやすい（特にモバイル回線・低スペック端末）
- Lighthouse のスコアを稼ぎやすい
- ページ離脱率の改善につながり得る（[Google: Find out how you stack up to new industry benchmarks for mobile page speed](https://www.thinkwithgoogle.com/marketing-strategies/app-and-mobile/mobile-page-speed-new-industry-benchmarks/) によれば、表示までの時間が長くなるほど離脱率は急増する）

## 開発体験

### 同じ機能を実装した場合のコード量が半減する

#### React

```typescript
// React（18行）
import React, { useState, useEffect, useMemo } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  const doubled = useMemo(() => count * 2, [count]);

  useEffect(() => {
    console.log(`Count: ${count}`);
  }, [count]);

  return (
    <div>
      <p>Count: {count}, Doubled: {doubled}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}
```

#### Svelte

```typescript
// Svelte（9行）
<script lang="ts">
  let count = $state(0);
  let doubled = $derived(count * 2);

  $effect(() => {
    console.log(`Count: ${count}`);
  });
</script>

<p>Count: {count}, Doubled: {doubled}</p>
<button onclick={() => count++}>Increment</button>
```

### コード削減の傾向

- **ボイラープレートが少ない** - `import`・`export`・`return`文・ラッピング用コンポーネントが不要
- **状態管理が組み込み** - `useState`・`setState` のような専用APIを経由せず、ローカル変数のように記述できる
- **副作用の記述が直感的** - `$effect` は依存配列を手で管理する必要がない
- **イベントハンドリングがシンプル** - 標準DOMの`onclick`属性に近い記法で書ける

> 上記はあくまで同等機能を実装した際の傾向であり、コード量の比率はプロジェクトの規模・コーディングスタイルによって変わります。

## 他フレームワークとの比較

### React との比較

<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4 my-8">
  <div class="content-card p-4">
    <h3 class="font-bold text-lg mb-2">Svelteの利点</h3>
    <ul>
      <li>ボイラープレートコードが少ない</li>
      <li>組み込みの状態管理</li>
      <li>より小さなバンドルサイズ</li>
    </ul>
  </div>
  <div class="content-card p-4">
    <h3 class="font-bold text-lg mb-2">Reactの利点</h3>
    <ul>
      <li>より大きなエコシステム</li>
      <li>より多くのサードパーティライブラリ</li>
      <li>より大きなコミュニティ</li>
    </ul>
  </div>
</div>

### Vue との比較

<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4 my-8">
  <div class="content-card p-4">
    <h3 class="font-bold text-lg mb-2">Svelteの利点</h3>
    <ul>
      <li>コンパイル時の最適化</li>
      <li>より高速な実行</li>
      <li>TypeScriptとの統合がよりシンプル</li>
    </ul>
  </div>
  <div class="content-card p-4">
    <h3 class="font-bold text-lg mb-2">Vueの利点</h3>
    <ul>
      <li>より成熟したエコシステム</li>
      <li>より豊富なドキュメント</li>
      <li>より大きな採用実績</li>
    </ul>
  </div>
</div>

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

:::tip[コードを動かしてみる]
コードブロック下の **▶ インタラクティブに試す** を押すと、svelte.dev の Playground が開いて実際に編集・実行できます。
:::

## Svelte 5の新機能

### Runesシステム

Svelte 5の最大の変更点は、新しい**Runesシステム**の導入です。これにより、リアクティビティがより明示的で予測可能になりました。

#### 従来のSvelte 4

```typescript
let count = 0;
$: doubled = count * 2;
```

#### Svelte 5 Runes

```typescript
let count = $state(0);
let doubled = $derived(count * 2);
```

### より明示的なリアクティビティ

Runesにより、リアクティビティがより明示的で予測可能になりました。

- `$state` - リアクティブな状態を定義（内部でProxyを使用）
- `$derived` - 計算値を定義
- `$effect` - 副作用を実行
- `$props` - コンポーネントのプロパティを定義
- `$bindable` - 双方向バインディング可能なプロパティ

### TypeScriptとの完全な統合

```typescript
type Props = {
  count: number;
  message?: string;
  onChange?: (value: number) => void;
};

let { count, message = 'デフォルト', onChange }: Props = $props();

// 型推論も強化
let items = $state<string[]>([]); // 明示的な型定義
let filtered = $derived(items.filter((item) => item.length > 3)); // 型が自動推論される
```

### パフォーマンスの向上

- **きめ細かい更新（fine-grained reactivity）** - Svelte 4 までのコンポーネント単位の無効化から、シグナルベースの依存追跡に進化
- **メモリ使用量の削減** - リアクティビティの内部実装が刷新され、無駄な再評価が減少
- **コンパイラの最適化** - 出力されるJSがよりシンプルに

詳細は公式ブログ [Introducing Svelte 5](https://svelte.dev/blog/svelte-5-is-alive) と [Runes](https://svelte.dev/blog/runes) を参照してください。

## なぜSvelte 5を選ぶのか

1. **パフォーマンス** - ランタイムなしの高速な実行
2. **開発体験** - シンプルで直感的な構文
3. **型安全性** - TypeScriptとの優れた統合
4. **小さなバンドルサイズ** - 最適化されたコード生成

## 採用事例

Svelte は個人開発から大規模サービスまで幅広く採用されています。代表的な事例としては以下が挙げられます（実際の採用範囲・採用理由は各社の公開情報に基づきます）。

- **The New York Times** — インタラクティブ記事・データジャーナリズムのレンダリングに Svelte を活用。Svelte の生みの親である Rich Harris は元 NYT のグラフィックスエディタです（[Rich Harris on Svelte 5 - The Changelog #586](https://changelog.com/podcast/586)）。
- **Apple** — Apple Music の Web プレイヤーなどで Svelte が使われていることが知られています（参考: [BuiltWithSvelte の事例集](https://www.builtwithsvelte.com/)）。
- **1Password** — Svelte 公式ブログでも紹介されている採用企業のひとつです（[Svelte Origins (公式ドキュメンタリー)](https://svelte.dev/blog/svelte-4)）。
- **その他**: Spotify、IKEA、Cloudflare、Brave 等が部分的に採用していると報告されています（[builtwithsvelte.com](https://www.builtwithsvelte.com/) 参照）。

:::note[事例情報の取り扱い]
本セクションの採用事例は公開情報からの引用です。具体的な「何秒短縮」「○○%改善」といったKPI は各社の社内データに依存するため本記事では掲載していません。最新の事例とインタビューは [Svelte 公式ブログ](https://svelte.dev/blog) や [BuiltWithSvelte](https://www.builtwithsvelte.com/) を参照してください。
:::

### Svelteを選ぶことで得やすいメリット

具体的な数値は環境に強く依存しますが、複数のチームが共通して報告している傾向としては以下が挙げられます。

1. **開発速度の向上**
   - コード量が減りやすく、レビュー・テスト工数を抑えやすい
   - 学習曲線が緩やかで、新規メンバーの立ち上がりが早い

2. **配信・実行コストの削減**
   - バンドルサイズが小さい傾向 = CDN 転送量・モバイル回線負荷の低減
   - SSR・SSG の実行コストが軽く、サーバーリソースを節約しやすい

3. **保守性の向上**
   - 依存ライブラリを最小限にできる = アップデートリスクの低減
   - 生成コードがシンプル = デバッグ・監査がしやすい

## ベンチマークの参照先

「実際にどれくらい速いのか」を知りたい場合、フレームワーク横並びで継続的に計測されている公開ベンチマークを参照するのが確実です。

### 主な公開ベンチマーク

- **[js-framework-benchmark by Krausest](https://krausest.github.io/js-framework-benchmark/current.html)** — Keyed/Non-keyed の代表的な操作（行追加・更新・削除・選択など）を多数のフレームワークで比較。Svelte は常に上位グループに位置し、メモリ使用量・ベンチスコア双方で軽量・高速な部類に評価されています。
- **[Vite + Svelte の bundle 計測](https://bundlephobia.com/)** — 個別パッケージのサイズ確認に。

### Core Web Vitals で見る場合のポイント

[Core Web Vitals](https://web.dev/articles/vitals) は実プロダクションのユーザー体験を測る指標で、以下の3つが現行の主要指標です。

| 指標                              | 内容                                                                     |
| --------------------------------- | ------------------------------------------------------------------------ |
| **LCP (Largest Contentful Paint)** | 最大要素の描画時間。バンドルが小さい Svelte は初期描画で有利になりやすい |
| **INP (Interaction to Next Paint)** | 操作応答性。2024-03 に [FID から INP に置き換わった](https://web.dev/blog/inp-cwv-march-12)。Svelte は更新コストが小さく、INP も短く保ちやすい |
| **CLS (Cumulative Layout Shift)** | 累積レイアウトシフト。フレームワーク固有というよりは実装次第             |

:::note[具体的な数値について]
本記事ではフレームワーク間の Core Web Vitals 比較数値（○○ ms / ○○ 秒）は掲載していません。これらの値はアプリケーションの実装・ホスティング環境・ユーザー回線で大きく変動するため、自プロジェクトでは [PageSpeed Insights](https://pagespeed.web.dev/) や [Chrome User Experience Report (CrUX)](https://developer.chrome.com/docs/crux) を使って実測することを推奨します。
:::

### メモリ・CPU 使用量について

Svelte は Virtual DOM を持たず、コンパイル時に必要な更新コードを直接生成するため、リアクティブシステムを支えるためのランタイム構造が小さくなります。これにより、

- リアクティビティのためにフレームワークが保持するメモリ量が少ない
- 1回の状態更新あたりの実行コードが少なく、CPU 負荷も低くなりやすい

という傾向があります。実測値は [js-framework-benchmark](https://krausest.github.io/js-framework-benchmark/current.html) の memory / startup の各セクションで継続的に公開されています。

## 結論：なぜ今Svelteを選ぶべきなのか

### Svelteが解決する本質的な問題

**従来のフレームワークは「複雑さ」と引き換えに機能を提供してきました。**
Svelteは「シンプルさ」のまま、より高い性能を実現します。

### あなたがSvelteを選ぶべき具体的な状況

#### 今すぐSvelteを採用すべきケース

<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 my-8">
  <div class="content-card p-4">
    <h3 class="font-bold text-lg mb-2">新規プロジェクトを始める場合</h3>
    <ul>
      <li>技術的負債ゼロからスタートできる</li>
      <li>最新のWeb標準に準拠した開発が可能</li>
      <li>長期的な保守性を重視する</li>
    </ul>
  </div>
  <div class="content-card p-4">
    <h3 class="font-bold text-lg mb-2">パフォーマンスが収益に直結する場合</h3>
    <ul>
      <li>ECサイト（表示遅延がコンバージョンを大きく毀損する。<a href="https://www.akamai.com/newsroom/press-release/akamai-releases-spring-2017-state-of-online-retail-performance-report">Akamai の調査</a>参照）</li>
      <li>金融取引システム（ミリ秒単位の応答性が要求される）</li>
      <li>ニュースメディア（初速と直帰率の関係が強い）</li>
    </ul>
  </div>
  <div class="content-card p-4">
    <h3 class="font-bold text-lg mb-2">小規模チームで大きな成果を出したい場合</h3>
    <ul>
      <li>少ないコードで多くの機能を実装</li>
      <li>学習コストが低く、即戦力化が早い</li>
      <li>バグが少なく、デバッグ時間を削減</li>
    </ul>
  </div>
</div>

#### Svelteの採用を慎重に検討すべきケース

<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 my-8">
  <div class="content-card p-4">
    <h3 class="font-bold text-lg mb-2">既存の大規模Reactプロジェクトがある場合</h3>
    <ul>
      <li>移行コストが高い可能性</li>
      <li>ただし、新機能はSvelteで追加する選択肢もある</li>
    </ul>
  </div>
  <div class="content-card p-4">
    <h3 class="font-bold text-lg mb-2">特定のUIライブラリに依存している場合</h3>
    <ul>
      <li>Material-UI、Ant Designなどの代替を探す必要</li>
      <li>ただし、Svelte用のUIライブラリも充実してきている</li>
    </ul>
  </div>
  <div class="content-card p-4">
    <h3 class="font-bold text-lg mb-2">チーム全員がReact/Vueのエキスパートの場合</h3>
    <ul>
      <li>学習コストを考慮する必要</li>
      <li>ただし、Svelteの学習曲線は他より緩やか</li>
    </ul>
  </div>
</div>

### 最終的な判断基準

**「ユーザー体験」を最優先するなら、Svelte一択です。**

- ページ表示が0.1秒早くなれば、ユーザーは気づきます
- アニメーションが滑らかなら、アプリの品質を感じます
- バッテリーが長持ちすれば、ユーザーは感謝します

**「開発者体験」を重視するなら、Svelteを試すべきです。**

- コードを書く喜びを取り戻せます
- 本質的な問題解決に集中できます
- 新しい可能性を発見できます

### 次のアクション

まずは小さなプロジェクトでSvelteを試してみましょう。
きっと、その違いに驚くはずです。

次は[環境構築](/introduction/setup/)に進みましょう。
