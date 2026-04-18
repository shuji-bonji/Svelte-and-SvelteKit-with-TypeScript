---
title: Svelteの基本
description: Svelte5の基本をTypeScriptで学ぶ入門ガイド - コンポーネント構造、テンプレート構文、リアクティビティ、イベント処理、プロパティ、バインディング、ライフサイクルの基礎を実例を交えて体系的かつ実践的に詳しく解説します
---

<script>
  import { base } from '$app/paths';
</script>


まず、Svelteの基本的な概念とコンポーネントの仕組みを理解することが重要です。このセクションでは、Svelteの核となる機能と、コンポーネントベースの開発アプローチについて学びます。

## Svelteとは何か

Svelteは「コンパイラ」として動作するフロントエンドフレームワークです。ReactやVueのような他のフレームワークとは異なり、ランタイムライブラリを必要とせず、ビルド時にコンポーネントを効率的なVanilla JavaScriptに変換します。

### 主な特徴

1. **ビルド時の最適化** - コンパイル時に最適化されたコードを生成
2. **リアクティビティ** - データの変更を自動的にUIに反映
3. **コンポーネントベース** - 再利用可能なコンポーネントで構築
4. **軽量** - 小さなバンドルサイズで高速な実行
5. **シンプルな構文** - HTMLに近い直感的な記法

## このセクションで学ぶこと

<div class="grid grid-cols-1 md:grid-cols-2 gap-4 my-8 auto-rows-[1fr]">
  <a href="{base}/svelte/basics/component-basics/" class="flex no-underline group h-full not-prose" style="color: inherit;">
    <div class="section-card p-4 cursor-pointer flex flex-col w-full">
      <div class="text-3xl mb-2">🧩</div>
      <h3 class="font-bold text-lg mb-2" style="color: var(--color-card-title);">
        コンポーネントの基本
        <span class="inline-block ml-1 text-xs opacity-60">→</span>
      </h3>
      <p class="text-sm mb-3" style="color: var(--color-card-desc);">Svelteコンポーネントの核となる機能をすべて学びます。</p>
      <ul class="text-sm space-y-1 flex-grow list-disc pl-5" style="color: var(--color-card-list);">
        <li><strong>3つの主要部分</strong>: script、markup、style</li>
        <li><strong>テンプレート構文</strong>: 条件分岐、ループ、非同期処理</li>
        <li><strong>イベント処理</strong>: DOMイベント、修飾子</li>
        <li><strong>プロパティ</strong>: 親子間のデータ受け渡し</li>
        <li><strong>双方向バインディング</strong>: フォーム連携</li>
        <li><strong>スタイリング</strong>: スコープ付きCSS</li>
      </ul>
    </div>
  </a>
  
  <a href="{base}/svelte/basics/template-syntax/" class="flex no-underline group h-full not-prose" style="color: inherit;">
    <div class="section-card p-4 cursor-pointer flex flex-col w-full">
      <div class="text-3xl mb-2">🔤</div>
      <h3 class="font-bold text-lg mb-2" style="color: var(--color-card-title);">
        テンプレート構文
        <span class="inline-block ml-1 text-xs opacity-60">→</span>
      </h3>
      <p class="text-sm mb-3" style="color: var(--color-card-desc);">Svelteの特殊なテンプレートタグと構文を詳しく学びます。</p>
      <ul class="text-sm space-y-1 flex-grow list-disc pl-5" style="color: var(--color-card-list);">
        <li><code>&#123;@render&#125;</code>: Snippetsのレンダリング</li>
        <li><code>&#123;@html&#125;</code>: HTML文字列の挿入</li>
        <li><code>&#123;@const&#125;</code>: ローカル定数の定義</li>
        <li><code>&#123;#key&#125;</code>: 強制的な再レンダリング</li>
        <li><code>&#123;@debug&#125;</code>: デバッグ情報の出力</li>
      </ul>
    </div>
  </a>
  
  <a href="{base}/svelte/basics/special-elements/" class="flex no-underline group h-full not-prose" style="color: inherit;">
    <div class="section-card p-4 cursor-pointer flex flex-col w-full">
      <div class="text-3xl mb-2">🔮</div>
      <h3 class="font-bold text-lg mb-2" style="color: var(--color-card-title);">
        特別な要素
        <span class="inline-block ml-1 text-xs opacity-60">→</span>
      </h3>
      <p class="text-sm mb-3" style="color: var(--color-card-desc);">Svelteの特別な要素（svelte:プレフィックス）を詳しく学びます。</p>
      <ul class="text-sm space-y-1 flex-grow list-disc pl-5" style="color: var(--color-card-list);">
        <li><code>svelte:element</code>: 動的要素の作成</li>
        <li><code>svelte:window</code>: ウィンドウイベント</li>
        <li><code>svelte:head</code>: メタタグの設定</li>
        <li><code>svelte:boundary</code>: エラーハンドリング</li>
        <li>レガシー要素と代替方法</li>
      </ul>
    </div>
  </a>
  
  <a href="{base}/svelte/basics/component-lifecycle/" class="flex no-underline group h-full not-prose" style="color: inherit;">
    <div class="section-card p-4 cursor-pointer flex flex-col w-full">
      <div class="text-3xl mb-2">🔄</div>
      <h3 class="font-bold text-lg mb-2" style="color: var(--color-card-title);">
        コンポーネントライフサイクル
        <span class="inline-block ml-1 text-xs opacity-60">→</span>
      </h3>
      <p class="text-sm mb-3" style="color: var(--color-card-desc);">Svelte 5におけるコンポーネントのライフサイクル管理を学びます。</p>
      <ul class="text-sm space-y-1 flex-grow list-disc pl-5" style="color: var(--color-card-list);">
        <li><strong>$effect</strong>: 新しいライフサイクル管理</li>
        <li><strong>$effect.pre</strong>: DOM構築前の処理</li>
        <li><strong>$effect.root</strong>: 独立したスコープ</li>
        <li><strong>従来のAPI</strong>: onMount, onDestroy</li>
        <li><strong>クリーンアップ</strong>: リソースの適切な管理</li>
      </ul>
    </div>
  </a>
  
  <a href="{base}/svelte/basics/actions/" class="flex no-underline group h-full not-prose" style="color: inherit;">
    <div class="section-card p-4 cursor-pointer flex flex-col w-full">
      <div class="text-3xl mb-2">⚡</div>
      <h3 class="font-bold text-lg mb-2" style="color: var(--color-card-title);">
        use:アクション
        <span class="inline-block ml-1 text-xs opacity-60">→</span>
      </h3>
      <p class="text-sm mb-3" style="color: var(--color-card-desc);">DOM要素を直接操作する強力な機能を学びます。</p>
      <ul class="text-sm space-y-1 flex-grow list-disc pl-5" style="color: var(--color-card-list);">
        <li>アクションの実行タイミング</li>
        <li>ライフサイクルフック</li>
        <li>外部ライブラリの統合</li>
        <li>カスタムディレクティブの作成</li>
        <li>イベントハンドラとの使い分け</li>
      </ul>
    </div>
  </a>

  <a href="{base}/svelte/basics/attachments/" class="flex no-underline group h-full not-prose" style="color: inherit;">
    <div class="section-card p-4 cursor-pointer flex flex-col w-full">
      <div class="text-3xl mb-2">🧷</div>
      <h3 class="font-bold text-lg mb-2" style="color: var(--color-card-title);">
        &#123;@attach&#125; アタッチメント
        <span class="inline-block ml-1 text-xs opacity-60">→</span>
      </h3>
      <p class="text-sm mb-3" style="color: var(--color-card-desc);">Svelte 5 で導入された DOM 連携の新 API を学びます。</p>
      <ul class="text-sm space-y-1 flex-grow list-disc pl-5" style="color: var(--color-card-list);">
        <li><code>&#123;@attach&#125;</code> の基本</li>
        <li><strong>use: との違い</strong>: 再評価と型付け</li>
        <li>コンポーネントへの attach と合成</li>
        <li>クリーンアップとライフサイクル</li>
        <li>実装例：tooltip、autofocus</li>
      </ul>
    </div>
  </a>

  <a href="{base}/svelte/basics/transitions/" class="flex no-underline group h-full not-prose" style="color: inherit;">
    <div class="section-card p-4 cursor-pointer flex flex-col w-full">
      <div class="text-3xl mb-2">✨</div>
      <h3 class="font-bold text-lg mb-2" style="color: var(--color-card-title);">
        トランジション・アニメーション
        <span class="inline-block ml-1 text-xs opacity-60">→</span>
      </h3>
      <p class="text-sm mb-3" style="color: var(--color-card-desc);">美しいアニメーションを簡単に実装する方法を学びます。</p>
      <ul class="text-sm space-y-1 flex-grow list-disc pl-5" style="color: var(--color-card-list);">
        <li><strong>transition:</strong> 入場・退場アニメーション</li>
        <li><strong>in:/out:</strong> 個別のトランジション</li>
        <li><strong>animate:</strong> FLIPアニメーション</li>
        <li><strong>style:</strong> 動的なスタイル適用</li>
        <li>カスタムトランジションの作成</li>
      </ul>
    </div>
  </a>

  <a href="{base}/svelte/basics/motion/" class="flex no-underline group h-full not-prose" style="color: inherit;">
    <div class="section-card p-4 cursor-pointer flex flex-col w-full">
      <div class="text-3xl mb-2">🎞️</div>
      <h3 class="font-bold text-lg mb-2" style="color: var(--color-card-title);">
        svelte/motion
        <span class="inline-block ml-1 text-xs opacity-60">→</span>
      </h3>
      <p class="text-sm mb-3" style="color: var(--color-card-desc);">数値を滑らかに補間する Tween / Spring の使い方を学びます。</p>
      <ul class="text-sm space-y-1 flex-grow list-disc pl-5" style="color: var(--color-card-list);">
        <li><strong>Tween</strong>: 線形補間ベース</li>
        <li><strong>Spring</strong>: 物理ベースの追従</li>
        <li>Runesとの組み合わせ（<code>.current</code>）</li>
        <li>easing 関数との合成</li>
        <li>実装例：カウンターアニメーション</li>
      </ul>
    </div>
  </a>

  <a href="{base}/svelte/basics/easing/" class="flex no-underline group h-full not-prose" style="color: inherit;">
    <div class="section-card p-4 cursor-pointer flex flex-col w-full">
      <div class="text-3xl mb-2">📐</div>
      <h3 class="font-bold text-lg mb-2" style="color: var(--color-card-title);">
        svelte/easing
        <span class="inline-block ml-1 text-xs opacity-60">→</span>
      </h3>
      <p class="text-sm mb-3" style="color: var(--color-card-desc);">Svelte 標準の easing 関数カタログと選び方を学びます。</p>
      <ul class="text-sm space-y-1 flex-grow list-disc pl-5" style="color: var(--color-card-list);">
        <li>cubic/quad/quart など主要カーブ</li>
        <li>In / Out / InOut の違い</li>
        <li>transition・motion との併用</li>
        <li>カスタム easing の作成</li>
        <li>選び方の指針</li>
      </ul>
    </div>
  </a>

  <a href="{base}/svelte/basics/events-module/" class="flex no-underline group h-full not-prose" style="color: inherit;">
    <div class="section-card p-4 cursor-pointer flex flex-col w-full">
      <div class="text-3xl mb-2">🎛️</div>
      <h3 class="font-bold text-lg mb-2" style="color: var(--color-card-title);">
        svelte/events
        <span class="inline-block ml-1 text-xs opacity-60">→</span>
      </h3>
      <p class="text-sm mb-3" style="color: var(--color-card-desc);">型安全にイベントを扱うための <code>on</code> ヘルパーを学びます。</p>
      <ul class="text-sm space-y-1 flex-grow list-disc pl-5" style="color: var(--color-card-list);">
        <li><code>on()</code> による手動バインド</li>
        <li>DOMイベントの型推論</li>
        <li><code>on:</code> 廃止に伴う移行</li>
        <li>クリーンアップの仕組み</li>
        <li>キーボード／ポインタの実装例</li>
      </ul>
    </div>
  </a>

  <a href="{base}/svelte/basics/typescript-integration/" class="flex no-underline group h-full not-prose" style="color: inherit;">
    <div class="section-card p-4 cursor-pointer flex flex-col w-full">
      <div class="text-3xl mb-2">📘</div>
      <h3 class="font-bold text-lg mb-2" style="color: var(--color-card-title);">
        TypeScript統合
        <span class="inline-block ml-1 text-xs opacity-60">→</span>
      </h3>
      <p class="text-sm mb-3" style="color: var(--color-card-desc);">SvelteでTypeScriptを効果的に使用する方法を学びます。</p>
      <ul class="text-sm space-y-1 flex-grow list-disc pl-5" style="color: var(--color-card-list);">
        <li>Propsの型定義</li>
        <li>イベントの型定義</li>
        <li>ジェネリック型の使用</li>
        <li>型ガードと型の絞り込み</li>
        <li>ストアとコンテキストAPIの型定義</li>
      </ul>
    </div>
  </a>
</div>

## 学習の進め方

各トピックは実践的なコード例と共に説明されています。以下の順序で学習を進めることをお勧めします。

1. **概念の理解** - 各機能の目的と使用場面を理解
2. **コード例の実践** - 実際にコードを書いて動作を確認
3. **TypeScriptへの移行** - JavaScriptからTypeScriptへの書き換え
4. **応用** - 学んだ知識を組み合わせて実際のコンポーネントを作成

## 前提知識

このセクションを始める前に、以下の知識があることを前提としています。

- HTML/CSS の基本的な知識
- JavaScript（ES6+）の基本的な構文
- TypeScriptの基本的な型定義（推奨）
- Node.jsとnpmの基本的な使い方

## 次のステップ

準備ができたら、[コンポーネントの基本](/svelte/basics/component-basics/)から始めましょう。Svelteコンポーネントの核となる機能を学びます。