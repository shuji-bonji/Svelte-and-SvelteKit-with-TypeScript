# CLAUDE.md - TypeScriptで学ぶ Svelte5/SvelteKit 学習ガイド構築指示書

## 🎯 プロジェクト概要

### 目的
日本語によるTypeScript中心のSvelte 5/SvelteKit完全マスター学習コンテンツの提供

### リポジトリ
- **旧**: `https://github.com/shuji-bonji/Svelte-SvelteKit-with-TypeScript`
- **新**: `https://github.com/shuji-bonji/Svelte-and-SvelteKit-with-TypeScript`

### 公開URL
`https://shuji-bonji.github.io/Svelte-and-SvelteKit-with-TypeScript/`

### 対象読者
- TypeScript/JavaScriptでのWeb開発経験者
- SPA/WebAPI開発経験があるがSSR/SSGは不慣れなエンジニア
- Svelteの公式ドキュメントを見ているがTypeScript情報が少なく苦労している人
- SvelteKitでビジネスレベルのサービスを構築したい人

## 🛠 技術スタック

### コア技術
- **Svelte 5** (最新版・Runesシステム対応)
- **SvelteKit** (最新版)
- **TypeScript** (全コード例で使用)
- **SveltePress** (サイトビルドツール)

### 重要：バージョン要件
- Svelte 5のRunes（$state, $derived, $effect, $props等）を使用
- Svelte 4以前の文法（let宣言によるリアクティビティ、$:文法）は使用しない
- TypeScriptの型定義を厳密に行う

## 📚 カリキュラム構成

### 第1部：基礎編
```
src/routes/
├── +layout.md                    # ルートレイアウト
├── +page.md                      # ホーム
├── introduction/
│   ├── +page.md                  # Svelte5の概要
│   ├── why-svelte/+page.md       # なぜSvelteか
│   ├── setup/+page.md            # 環境構築
│   └── typescript-setup/+page.md # TypeScript設定
├── basics/
│   ├── +page.md                  # 基礎概要
│   ├── runes-introduction/+page.md # Runesシステム入門
│   ├── state/+page.md            # $stateルーン
│   ├── derived/+page.md          # $derivedルーン
│   ├── effect/+page.md           # $effectルーン
│   ├── props/+page.md            # $propsルーン
│   └── bindable/+page.md         # $bindableルーン
```

### 第2部：実践編
```
├── advanced/
│   ├── +page.md                  # 実践概要
│   ├── reactive-stores/+page.md  # .svelte.js/.svelte.tsファイル
│   ├── class-reactivity/+page.md # クラスとリアクティビティ
│   ├── snippets/+page.md         # Snippets機能
│   ├── component-patterns/+page.md # コンポーネントパターン
│   └── typescript-patterns/+page.md # TypeScriptパターン
```

### 第3部：SvelteKit編
```
├── sveltekit/
│   ├── +page.md                  # SvelteKit概要
│   ├── routing/+page.md          # ルーティング
│   ├── load-functions/+page.md  # Load関数
│   ├── server-side/+page.md     # サーバーサイド処理
│   ├── forms/+page.md            # フォーム処理
│   ├── api-routes/+page.md      # APIルート
│   └── deployment/+page.md      # デプロイメント
```

### 第4部：実装例
```
├── examples/
│   ├── +page.md                  # 実装例一覧
│   ├── todo-app/+page.md         # TODOアプリ
│   ├── auth-system/+page.md     # 認証システム
│   ├── data-fetching/+page.md   # データフェッチング
│   └── websocket/+page.md       # WebSocket実装
```

## 🔄 移行計画

### フェーズ1：基盤構築（Week 1）
1. SveltePressプロジェクトの初期設定
2. 基本レイアウトとナビゲーション構築
3. TypeScript設定の最適化
4. GitHub Actions設定（自動デプロイ）

### フェーズ2：コンテンツ移行（Week 2-3）
1. 既存コンテンツの精査と更新
2. Svelte 5 Runesシステムへの書き換え
3. TypeScript型定義の追加・改善
4. コード例の全面的な見直し

### フェーズ3：新規コンテンツ作成（Week 4-5）
1. Runesシステムの詳細解説
2. TypeScriptパターン集の作成
3. 実装例の充実化
4. トラブルシューティングガイド

### フェーズ4：最適化と公開（Week 6）
1. パフォーマンス最適化
2. SEO対策
3. アクセシビリティ改善
4. 最終テストと公開

## 📋 開発ルール

### コーディング規約

#### TypeScript
```typescript
// ✅ 良い例：型定義を明確に
type Props = {
  count: number;
  message?: string;
};

let { count, message = 'デフォルト' }: Props = $props();

// ❌ 悪い例：型定義なし
let { count, message } = $props();
```

#### Svelte 5 Runes
```svelte
<!-- ✅ 良い例：Svelte 5 Runes -->
<script lang="ts">
  let count = $state(0);
  let doubled = $derived(count * 2);
  
  $effect(() => {
    console.log(`Count: ${count}`);
  });
</script>

<!-- ❌ 悪い例：古い文法 -->
<script lang="ts">
  let count = 0;
  $: doubled = count * 2;
  
  $: console.log(`Count: ${count}`);
</script>
```

### ディレクトリ構造
```
Svelte-and-SvelteKit-with-TypeScript/
├── src/
│   ├── routes/          # ページとレイアウト
│   ├── lib/             # 共有コンポーネント・ユーティリティ
│   │   ├── components/  # 再利用可能コンポーネント
│   │   ├── stores/      # グローバルストア(.svelte.ts)
│   │   └── utils/       # ユーティリティ関数
│   └── app.html         # アプリケーションシェル
├── static/              # 静的ファイル
├── .sveltepress/        # SveltePress設定
├── vite.config.ts       # Vite設定
├── svelte.config.js     # Svelte設定
├── tsconfig.json        # TypeScript設定
└── package.json         # 依存関係
```

### コンテンツ作成ガイドライン

#### Markdownファイル構造
```markdown
---
title: ページタイトル
description: ページの説明
---

# {title}

## 概要
簡潔な説明

## 基本的な使い方
\```typescript
// TypeScriptコード例
\```

## 実践例
実際の使用例を示す

## よくある間違い
アンチパターンと解決策

## まとめ
重要ポイントの整理
```

#### コード例の要件
1. **必ずTypeScriptを使用**
2. **型定義を明確に記述**
3. **Svelte 5のRunesを使用**
4. **実行可能な完全なコード**
5. **日本語コメントで説明**

## 🧠 ナレッジベース

### Svelte 5 Runesチートシート

#### $state
```typescript
// 基本的な使い方
let count = $state(0);

// オブジェクト（深いリアクティビティ）
let user = $state({ name: '太郎', age: 25 });

// 配列
let items = $state<string[]>([]);

// クラスインスタンス（プロパティも$stateにする）
class Counter {
  value = $state(0);
  increment() { this.value++; }
}
```

#### $derived
```typescript
// 計算プロパティ
let count = $state(0);
let doubled = $derived(count * 2);

// 複雑な計算
let filtered = $derived(() => {
  return items.filter(item => item.active);
});
```

#### $effect
```typescript
// 副作用の実行
$effect(() => {
  console.log('Count changed:', count);
  // クリーンアップ関数
  return () => {
    console.log('Cleanup');
  };
});

// 依存関係は自動追跡
$effect(() => {
  // countが変更された時のみ実行
  document.title = `Count: ${count}`;
});
```

#### $props
```typescript
// Props定義
type Props = {
  required: string;
  optional?: number;
  withDefault?: boolean;
};

let { 
  required,
  optional,
  withDefault = true,
  ...restProps
}: Props = $props();
```

#### $bindable
```typescript
// 双方向バインディング可能なprop
type Props = {
  value: $bindable<string>;
};

let { value = $bindable('default') }: Props = $props();
```

### TypeScript統合のベストプラクティス

1. **コンポーネントの型定義**
```typescript
import type { ComponentProps } from 'svelte';

type Props = ComponentProps<'button'> & {
  variant?: 'primary' | 'secondary';
};
```

2. **ストアの型定義（.svelte.ts）**
```typescript
// counter.svelte.ts
export function createCounter(initial = 0) {
  let count = $state(initial);
  
  return {
    get value() { return count; },
    increment() { count++; },
    decrement() { count--; },
    reset() { count = initial; }
  };
}

export type Counter = ReturnType<typeof createCounter>;
```

3. **イベントハンドラの型定義**
```typescript
function handleClick(event: MouseEvent & { currentTarget: HTMLButtonElement }) {
  console.log(event.currentTarget.textContent);
}
```

### 移行時の注意点

#### 避けるべきパターン
- `let` による暗黙的なリアクティビティ
- `$:` によるリアクティブステートメント
- `export let` によるprops定義
- ストアの`$`プレフィックス

#### 推奨パターン
- `$state` による明示的なリアクティビティ
- `$derived` による計算値
- `$props` によるprops定義
- `.svelte.ts`ファイルでのストア定義

## 🚀 実装手順（Claude Code用）

### 1. プロジェクト初期化
```bash
# 既存リポジトリをクローン
git clone https://github.com/shuji-bonji/Svelte-and-SvelteKit-with-TypeScript.git
cd Svelte-and-SvelteKit-with-TypeScript

# 依存関係のインストール
npm install

# 開発サーバー起動
npm run dev
```

### 2. SveltePress設定
```typescript
// vite.config.ts
import { sveltepress } from '@sveltepress/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    sveltepress({
      theme: {
        // テーマ設定
      },
      // その他の設定
    }),
    sveltekit()
  ]
});
```

### 3. 基本レイアウト作成
```svelte
<!-- src/routes/+layout.md -->
<script lang="ts">
  import { page } from '$app/stores';
  // レイアウトロジック
</script>

<!-- ナビゲーション等 -->
```

### 4. GitHub Actions設定
```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
```

## 📝 参考資料

### 公式ドキュメント
- [Svelte 5 Docs](https://svelte.dev/docs)
- [SvelteKit Docs](https://kit.svelte.dev/docs)
- [SveltePress](https://sveltepress.site)

### ナレッジリポジトリ
- [Notes on Svelte](https://github.com/shuji-bonji/Notes-on-Svelte)

## ✅ チェックリスト

### 移行前確認
- [ ] 既存コンテンツのバックアップ
- [ ] Svelte 5最新版の確認
- [ ] TypeScript 5.x以上の確認

### 実装時確認
- [ ] 全コード例がTypeScript
- [ ] Svelte 5 Runesのみ使用
- [ ] 型定義の厳密性
- [ ] 日本語での説明充実

### 公開前確認
- [ ] ビルドエラーなし
- [ ] GitHub Pages動作確認
- [ ] レスポンシブ対応
- [ ] パフォーマンス最適化

---

**Note**: このドキュメントは生きたドキュメントとして、プロジェクトの進行に応じて更新してください。