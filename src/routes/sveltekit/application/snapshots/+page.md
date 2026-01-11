---
title: Snapshots - DOM状態の保持
description: SvelteKitのSnapshotsでナビゲーション時のフォーム入力やスクロール位置を保持。capture/restoreによるDOM状態の保存・復元をTypeScriptで解説
---

<script>
  import Mermaid from '$lib/components/Mermaid.svelte';

  const comparisonDiagram = `flowchart TB
    subgraph normal[通常の動作]
        direction TB
        N1[1. フォームに入力] --> N2[2. 別ページに移動]
        N2 --> N3[3. 戻るボタン]
        N3 --> N4["4. 入力内容が消えている"]
    end

    subgraph snapshots[Snapshots を使用]
        direction TB
        S1[1. フォームに入力] --> S2["2. 別ページに移動 - capture() で状態を保存"]
        S2 --> S3["3. 戻るボタン - restore() で状態を復元"]
        S3 --> S4["4. 入力内容が保持されている"]
    end

    style normal fill:#ffebee,color:#333
    style snapshots fill:#e8f5e9,color:#333
    style N1 fill:#fff,color:#333
    style N2 fill:#fff,color:#333
    style N3 fill:#fff,color:#333
    style N4 fill:#ffcdd2,color:#333
    style S1 fill:#fff,color:#333
    style S2 fill:#fff,color:#333
    style S3 fill:#fff,color:#333
    style S4 fill:#c8e6c9,color:#333`;

  const sequenceDiagram = `sequenceDiagram
    participant U as ユーザー
    participant A as ページA
    participant SK as SvelteKit
    participant B as ページB

    U->>A: フォームに入力
    U->>SK: 別ページへ移動
    SK->>SK: capture() 実行
    Note over SK: 状態を履歴に保存
    SK->>B: ページB表示
    U->>SK: 「戻る」を実行
    SK->>SK: restore() 実行
    Note over SK: 保存した状態を復元
    SK->>A: ページA表示（入力値が復元）`;
</script>

Snapshots は、ページ間のナビゲーション時に失われてしまう一時的な DOM 状態（フォーム入力値、スクロール位置など）を保持・復元する機能です。

## この記事で学べること

- Snapshots の基本概念と用途
- `capture` / `restore` メソッドの実装
- TypeScript での型安全な Snapshots
- 実践的なユースケースと実装パターン

## なぜ Snapshots が必要か

ユーザーがフォームに入力中に別のページに移動し、戻ってきた場合、通常は入力内容が失われてしまいます。

<Mermaid diagram={comparisonDiagram} />

## 基本的な使い方

Snapshots を使用するには、`+page.svelte` または `+layout.svelte` から `snapshot` オブジェクトをエクスポートします。このオブジェクトには、状態を保存する `capture` 関数と、状態を復元する `restore` 関数を定義します。

以下は、テキストエリアの入力値を保持する最も基本的な例です。

```svelte
<!-- +page.svelte -->
<script lang="ts">
  import type { Snapshot } from './$types';

  let comment = $state('');

  // snapshot オブジェクトをエクスポート
  export const snapshot: Snapshot<string> = {
    // ページを離れる直前に呼ばれる
    capture: () => comment,
    // ページに戻ってきた時に呼ばれる
    restore: (value) => comment = value
  };
</script>

<form method="POST">
  <label for="comment">コメント</label>
  <textarea id="comment" bind:value={comment}></textarea>
  <button>投稿する</button>
</form>
```

このコードの仕組みは以下の通りです。

- **capture**: ページを離れる直前に呼ばれ、保存したい値を返します
- **restore**: ページに戻ってきた時に呼ばれ、保存された値を受け取ります
- **`Snapshot<T>`**: 型パラメータで保存するデータの型を指定します

## 動作の流れ

Snapshots の動作を時系列で見てみましょう。ユーザーがページを離れる時に自動的に `capture` が呼ばれ、戻ってきた時に `restore` が呼ばれます。

<Mermaid diagram={sequenceDiagram} />

## 複数の値を保持する

複数のフォームフィールドやスクロール位置など、複数の値を保持する場合はオブジェクトを使用します。TypeScript のインターフェースを定義することで、型安全に状態を管理できます。

以下は、記事投稿フォームの複数フィールドを保持する例です。

```svelte
<script lang="ts">
  import type { Snapshot } from './$types';

  // フォームの状態
  let title = $state('');
  let content = $state('');
  let category = $state('general');
  let tags = $state<string[]>([]);

  // スナップショットの型定義
  interface FormSnapshot {
    title: string;
    content: string;
    category: string;
    tags: string[];
  }

  export const snapshot: Snapshot<FormSnapshot> = {
    capture: () => ({
      title,
      content,
      category,
      tags
    }),
    restore: (value) => {
      title = value.title;
      content = value.content;
      category = value.category;
      tags = value.tags;
    }
  };
</script>

<form method="POST">
  <div class="field">
    <label for="title">タイトル</label>
    <input id="title" type="text" bind:value={title} />
  </div>

  <div class="field">
    <label for="content">内容</label>
    <textarea id="content" bind:value={content}></textarea>
  </div>

  <div class="field">
    <label for="category">カテゴリ</label>
    <select id="category" bind:value={category}>
      <option value="general">一般</option>
      <option value="tech">技術</option>
      <option value="news">ニュース</option>
    </select>
  </div>

  <button>投稿</button>
</form>
```

## スクロール位置の保持

フォーム入力だけでなく、スクロール位置のような DOM の状態も保持できます。カスタムスクロールコンテナ（`overflow: auto` を持つ要素）のスクロール位置を保持する例を示します。

`requestAnimationFrame` を使用して、DOM の更新後にスクロール位置を復元する点がポイントです。

```svelte
<script lang="ts">
  import type { Snapshot } from './$types';

  let scrollContainer: HTMLDivElement;

  export const snapshot: Snapshot<number> = {
    capture: () => scrollContainer?.scrollTop ?? 0,
    restore: (value) => {
      // DOM更新後にスクロール位置を復元
      requestAnimationFrame(() => {
        if (scrollContainer) {
          scrollContainer.scrollTop = value;
        }
      });
    }
  };
</script>

<div class="scroll-container" bind:this={scrollContainer}>
  <!-- 長いコンテンツ -->
  {#each Array(100) as _, i}
    <div class="item">アイテム {i + 1}</div>
  {/each}
</div>

<style>
  .scroll-container {
    height: 400px;
    overflow-y: auto;
  }
</style>
```

## 実践例：多段階フォーム

Snapshots が特に威力を発揮するのが、複数ステップのフォーム（ウィザード形式）です。ユーザーが途中で別のページを見に行っても、戻ってきた時に入力内容とステップ位置が復元されます。

以下は、会員登録フォームを3ステップで実装する例です。

```svelte
<!-- src/routes/signup/+page.svelte -->
<script lang="ts">
  import type { Snapshot } from './$types';

  // ステップ管理
  let currentStep = $state(1);

  // 各ステップのデータ
  let personalInfo = $state({
    name: '',
    email: '',
    phone: ''
  });

  let accountInfo = $state({
    username: '',
    password: ''
  });

  let preferences = $state({
    newsletter: false,
    notifications: true,
    theme: 'light' as 'light' | 'dark'
  });

  // スナップショットの型
  interface SignupSnapshot {
    step: number;
    personal: typeof personalInfo;
    account: typeof accountInfo;
    prefs: typeof preferences;
  }

  export const snapshot: Snapshot<SignupSnapshot> = {
    capture: () => ({
      step: currentStep,
      personal: personalInfo,
      account: accountInfo,
      prefs: preferences
    }),
    restore: (value) => {
      currentStep = value.step;
      personalInfo = value.personal;
      accountInfo = value.account;
      preferences = value.prefs;
    }
  };

  function nextStep() {
    if (currentStep < 3) currentStep++;
  }

  function prevStep() {
    if (currentStep > 1) currentStep--;
  }
</script>

<div class="signup-form">
  <div class="steps">
    <span class:active={currentStep >= 1}>1. 個人情報</span>
    <span class:active={currentStep >= 2}>2. アカウント</span>
    <span class:active={currentStep >= 3}>3. 設定</span>
  </div>

  {#if currentStep === 1}
    <div class="step">
      <h2>個人情報</h2>
      <input placeholder="お名前" bind:value={personalInfo.name} />
      <input type="email" placeholder="メール" bind:value={personalInfo.email} />
      <input type="tel" placeholder="電話番号" bind:value={personalInfo.phone} />
    </div>
  {:else if currentStep === 2}
    <div class="step">
      <h2>アカウント情報</h2>
      <input placeholder="ユーザー名" bind:value={accountInfo.username} />
      <input type="password" placeholder="パスワード" bind:value={accountInfo.password} />
    </div>
  {:else}
    <div class="step">
      <h2>設定</h2>
      <label>
        <input type="checkbox" bind:checked={preferences.newsletter} />
        ニュースレターを受け取る
      </label>
      <label>
        <input type="checkbox" bind:checked={preferences.notifications} />
        通知を受け取る
      </label>
      <select bind:value={preferences.theme}>
        <option value="light">ライト</option>
        <option value="dark">ダーク</option>
      </select>
    </div>
  {/if}

  <div class="navigation">
    {#if currentStep > 1}
      <button type="button" onclick={prevStep}>戻る</button>
    {/if}
    {#if currentStep < 3}
      <button type="button" onclick={nextStep}>次へ</button>
    {:else}
      <button type="submit">登録</button>
    {/if}
  </div>
</div>
```

## Layout での Snapshots

`+layout.svelte` でも Snapshots を使用できます。これは、複数のページで共通のスクロール位置やサイドバーの状態を保持する場合に便利です。

以下は、ドキュメントサイトのサイドバーの開閉状態とスクロール位置を保持する例です。ユーザーが別のドキュメントページに移動して戻ってきても、サイドバーの状態が維持されます。

```svelte
<!-- src/routes/docs/+layout.svelte -->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { Snapshot } from './$types';

  let { children }: { children: Snippet } = $props();

  let sidebar: HTMLElement;
  let sidebarOpen = $state(true);

  interface LayoutSnapshot {
    sidebarScroll: number;
    sidebarOpen: boolean;
  }

  export const snapshot: Snapshot<LayoutSnapshot> = {
    capture: () => ({
      sidebarScroll: sidebar?.scrollTop ?? 0,
      sidebarOpen
    }),
    restore: (value) => {
      sidebarOpen = value.sidebarOpen;
      requestAnimationFrame(() => {
        if (sidebar) {
          sidebar.scrollTop = value.sidebarScroll;
        }
      });
    }
  };
</script>

<div class="layout">
  <aside class:open={sidebarOpen} bind:this={sidebar}>
    <button onclick={() => sidebarOpen = !sidebarOpen}>
      {sidebarOpen ? '閉じる' : '開く'}
    </button>
    <nav>
      <!-- サイドバーナビゲーション -->
    </nav>
  </aside>

  <main>
    {@render children()}
  </main>
</div>
```

## 注意事項

Snapshots を使用する際には、いくつかの制約と注意点があります。これらを理解しておくことで、予期しない問題を避けることができます。

### JSON シリアライズ可能なデータのみ

`capture` から返すデータは JSON としてシリアライズ可能である必要があります。これは、データが `sessionStorage` に保存されるためです。関数、Date オブジェクト、Map、Set、DOM 要素などは保存できません。

```typescript
// ✅ OK: プリミティブ値、配列、プレーンオブジェクト
capture: () => ({
  text: 'hello',
  count: 42,
  items: ['a', 'b', 'c'],
  nested: { foo: 'bar' }
})

// ❌ NG: 関数、Date、Map、Set、循環参照
capture: () => ({
  callback: () => {},        // 関数は不可
  date: new Date(),          // Dateオブジェクトは不可
  map: new Map(),            // Mapは不可
  element: document.body     // DOM要素は不可
})
```

### データサイズに注意

大きなオブジェクトを保存すると、パフォーマンスとストレージの問題が発生する可能性があります。

- セッション中、メモリに保持され続ける
- `sessionStorage` の容量制限（通常 5MB）を超える可能性
- シリアライズ/デシリアライズのオーバーヘッド

必要最小限のデータのみを保存するようにしましょう。例えば、オブジェクト全体ではなく ID のみを保存し、復元時にデータを再取得する方法もあります。

```typescript
// ⚠️ 注意: 大きなデータは避ける
capture: () => ({
  // 画像データなど大きなデータは避ける
  largeData: veryLargeArray  // 避けるべき
})

// ✅ 推奨: 必要最小限のデータのみ
capture: () => ({
  selectedId: currentItem.id,  // IDのみ保存
  scrollPosition: 150
})
```

### ページリロード時の動作

Snapshots は `sessionStorage` を使用するため、ページをリロードした場合や、別サイトを経由して戻ってきた場合でも状態が復元されます。これは、ブラウザのタブやウィンドウを閉じるまで有効です。

以下は、状態が復元されたことをログに記録する例です。

```svelte
<script lang="ts">
  import { browser } from '$app/environment';
  import type { Snapshot } from './$types';

  let value = $state('');

  export const snapshot: Snapshot<string> = {
    capture: () => value,
    restore: (restored) => {
      value = restored;
      // 復元されたことをログ
      if (browser) {
        console.log('状態が復元されました:', restored);
      }
    }
  };
</script>
```

## まとめ

Snapshots を使用することで、ユーザー体験を大幅に向上させることができます。

- **フォーム入力の保持**: 誤ってページを離れても入力内容が失われない
- **スクロール位置の保持**: 長いリストでの位置を記憶
- **UI 状態の保持**: サイドバーの開閉状態、タブの選択状態など
- **多段階フォーム**: ステップ間を行き来しても入力内容を保持

特に、長いフォームや複雑な UI を持つページでは、Snapshots を活用することでユーザーのフラストレーションを軽減できます。

## 次のステップ

- [フォーム処理とActions](/sveltekit/server/forms/) - フォームの送信処理
- [状態管理パターン](/sveltekit/application/state-management/) - グローバル状態管理
- [Shallow routing](/sveltekit/routing/shallow/) - 履歴駆動の UI
