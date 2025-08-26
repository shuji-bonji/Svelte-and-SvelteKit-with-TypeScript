---
title: Svelte 5完全ガイド
description: コンパイラベースの革新的UIフレームワークをマスターする
---

<script>
  import Mermaid from '$lib/components/Mermaid.svelte';

  const learningFlow = `flowchart LR
    Start([🚀 学習開始])
    
    Basics["📚 基本編"]
    
    Runes["⚡ Runesシステム"]
    
    Advanced["🏗️ 実践編"]
    
    Choice["次のステップ"]
    SvelteKit[🎯 SvelteKit学習へ]
    Project[📱 実プロジェクト開発]
    
    Start --> Basics
    Basics --> Runes
    Runes --> Advanced
    Advanced --> Choice
    Choice -->|フルスタック開発| SvelteKit
    Choice -->|プロジェクト実践| Project
    
    style Start fill:#4CAF50,color:#fff
    style Basics fill:#2196F3,color:#fff
    style Runes fill:#FF9800,color:#fff
    style Advanced fill:#9C27B0,color:#fff
    style SvelteKit fill:#FF5722,color:#fff
    style Project fill:#795548,color:#fff
    style Choice fill:#FFF,stroke:#333`;

</script>

Svelteは、**コンパイル時に最適化された Vanilla JavaScriptを生成する**革新的なUIフレームワークです。Virtual DOMを使わず、直接DOMを操作する効率的なコードを生成することで、React、Vue、Angularを凌駕するパフォーマンスと開発者体験を実現します。

## 🚀 なぜSvelteが選ばれるのか

<div class="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
  <div class="p-6 border border-gray-2 dark:border-gray-7 rounded-lg shadow-md hover:shadow-lg transition-shadow">
    <div class="text-3xl mb-3">⚡</div>
    <h3 class="font-bold text-xl mb-3">パフォーマンスの革新</h3>
    <ul class="space-y-2 text-sm">
      <li><strong class="text-orange-500">ランタイムなし:</strong> ~5KB（React: ~45KB、Vue: ~34KB）</li>
      <li><strong class="text-orange-500">Virtual DOMなし:</strong> 直接DOM操作で高速レンダリング</li>
      <li><strong class="text-orange-500">最小バンドル:</strong> コンパイル時の不要コード除去</li>
    </ul>
  </div>
  <div class="p-6 border border-gray-2 dark:border-gray-7 rounded-lg shadow-md hover:shadow-lg transition-shadow">
    <div class="text-3xl mb-3">💻</div>
    <h3 class="font-bold text-xl mb-3">開発者体験の向上</h3>
    <ul class="space-y-2 text-sm">
      <li><strong class="text-orange-500">シンプルな構文:</strong> HTMLに近い直感的な記述</li>
      <li><strong class="text-orange-500">真のリアクティビティ:</strong> Runesシステムによる宣言的な状態管理</li>
      <li><strong class="text-orange-500">TypeScript完全対応:</strong> 型安全な開発が可能</li>
    </ul>
  </div>
  <div class="p-6 border border-gray-2 dark:border-gray-7 rounded-lg shadow-md hover:shadow-lg transition-shadow">
    <div class="text-3xl mb-3">📚</div>
    <h3 class="font-bold text-xl mb-3">学習コストの低さ</h3>
    <ul class="space-y-2 text-sm">
      <li><strong class="text-orange-500">標準的なWeb技術:</strong> HTML、CSS、JavaScriptの知識で開始可能</li>
      <li><strong class="text-orange-500">少ない概念:</strong> 覚えることが最小限</li>
      <li><strong class="text-orange-500">段階的な学習:</strong> 基本から高度な機能まで順次習得</li>
    </ul>
  </div>
</div>

## 📚 学習ロードマップ

<Mermaid diagram={learningFlow} />

### 推奨学習順序

1. **基本編** - Svelteの基本概念とコンポーネント開発
2. **Runesシステム** - Svelte 5の革新的なリアクティビティシステム
3. **実践編** - 実際のアプリケーション開発テクニック
4. **次のステップ**
   - **フルスタック開発** → [SvelteKit学習へ](/sveltekit/)
   - **プロジェクト実践** → 実プロジェクトでの開発

## 🎯 基本編 - Svelteの基礎を理解

| セクション | 内容 |
|-----------|------|
| [Svelteの基本概要](/svelte/basics/) | フレームワークの基本概念 |
| [コンポーネントの基本](/svelte/basics/component-basics/) | script、markup、styleの3要素 |
| [テンプレート構文](/svelte/basics/template-syntax/) | 条件分岐、ループ、イベント |
| [コンポーネントライフサイクル](/svelte/basics/component-lifecycle/) | onMount、onDestroy、tick |
| [use:アクション](/svelte/basics/actions/) | DOM要素の直接操作 |
| [トランジション・アニメーション](/svelte/basics/transitions/) | 要素の出入りアニメーション |
| [TypeScript統合](/svelte/basics/typescript-integration/) | 型安全な開発 |

## ⚡ Runesシステム - Svelte 5の革新

| セクション | 内容 |
|-----------|------|
| [Runesシステム概要](/svelte/runes/) | Svelte 5の新しいリアクティビティ |
| [Runesシステム入門](/svelte/runes/runes-introduction/) | 基本的な使い方 |
| [$state - リアクティブな状態](/svelte/runes/state/) | 状態管理の基本 |
| [$derived - 派生値](/svelte/runes/derived/) | 計算プロパティ |
| [$effect - 副作用](/svelte/runes/effect/) | 副作用の実行 |
| [$props - プロパティ](/svelte/runes/props/) | コンポーネント間通信 |
| [$bindable - 双方向バインディング](/svelte/runes/bindable/) | 双方向データフロー |
| [$host - カスタムエレメント](/svelte/runes/host/) | Web Components対応 |
| [$inspect - デバッグ](/svelte/runes/inspect/) | 開発時のデバッグ |
| [他フレームワークとの比較](/svelte/runes/comparison/) | React、Vue、Angularとの違い |

## 🏗️ 実践編 - 高度な機能と実装パターン

| セクション | 内容 |
|-----------|------|
| [実践概要](/svelte/advanced/) | 高度な機能の概要 |
| [リアクティブストア](/svelte/advanced/reactive-stores/) | .svelte.js/.svelte.tsファイル |
| [クラスとリアクティビティ](/svelte/advanced/class-reactivity/) | OOPとリアクティビティ |
| [組み込みリアクティブクラス](/svelte/advanced/built-in-classes/) | SvelteDate、SvelteURLなど |
| [Snippets機能](/svelte/advanced/snippets/) | 再利用可能なテンプレート |
| [スクリプトコンテキスト](/svelte/advanced/script-context/) | module contextの活用 |
| [コンポーネントパターン](/svelte/advanced/component-patterns/) | 実践的な設計パターン |
| [TypeScriptパターン](/svelte/advanced/typescript-patterns/) | 型安全な実装パターン |

## 🎓 学習の始め方

### Step 1: 基礎を固める
まず[Svelteの基本概要](/svelte/basics/)で基本概念を理解し、[コンポーネントの基本](/svelte/basics/component-basics/)で実際にコンポーネントを作成します。

### Step 2: Runesシステムをマスター
Svelte 5の核心である[Runesシステム](/svelte/runes/)を学び、モダンなリアクティビティを習得します。

### Step 3: 実践的な実装
[実践編](/svelte/advanced/)で、プロダクションレベルのアプリケーション開発に必要な高度な機能を学びます。

## 🛠️ 推奨開発環境

<div class="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
  <div class="p-6 border border-gray-2 dark:border-gray-7 rounded-lg shadow-sm hover:shadow-md transition-shadow">
    <div class="text-3xl mb-3">⚙️</div>
    <h3 class="font-bold text-lg mb-3">必須ツール</h3>
    <ul class="space-y-2 text-sm">
      <li class="flex items-start">
        <span class="font-semibold text-orange-500 mr-2">Node.js:</span>
        <span class="text-gray-6 dark:text-gray-4">20.x LTS以上</span>
      </li>
      <li class="flex items-start">
        <span class="font-semibold text-orange-500 mr-2">TypeScript:</span>
        <span class="text-gray-6 dark:text-gray-4">5.x以上</span>
      </li>
      <li class="flex items-start">
        <span class="font-semibold text-orange-500 mr-2">VS Code:</span>
        <span class="text-gray-6 dark:text-gray-4">推奨エディタ</span>
      </li>
    </ul>
  </div>

  <div class="p-6 border border-gray-2 dark:border-gray-7 rounded-lg shadow-sm hover:shadow-md transition-shadow">
    <div class="text-3xl mb-3">🔌</div>
    <h3 class="font-bold text-lg mb-3">推奨拡張機能</h3>
    <ul class="space-y-2 text-sm text-gray-6 dark:text-gray-4">
      <li>• Svelte for VS Code</li>
      <li>• Prettier - Code formatter</li>
      <li>• ESLint</li>
      <li>• TypeScript Vue Plugin</li>
      <li>• Tailwind CSS IntelliSense</li>
    </ul>
  </div>

  <div class="p-6 border border-gray-2 dark:border-gray-7 rounded-lg shadow-sm hover:shadow-md transition-shadow">
    <div class="text-3xl mb-3">🚀</div>
    <h3 class="font-bold text-lg mb-3">プロジェクト作成</h3>
    <div class="bg-gray-1 dark:bg-gray-8 rounded p-3 text-xs">
      <code class="text-orange-500">
        npm create vite@latest my-app -- --template svelte-ts<br/>
        cd my-app<br/>
        npm install<br/>
        npm run dev
      </code>
    </div>
  </div>
</div>

## 📊 他フレームワークとの比較

| 特徴 | Svelte 5 | React 18 | Vue 3 | Angular 17 |
|-----|----------|----------|-------|------------|
| **バンドルサイズ** | ~5KB | ~45KB | ~34KB | ~130KB |
| **Virtual DOM** | ❌ なし | ✅ あり | ✅ あり | ❌ なし |
| **コンパイル** | ✅ ビルド時 | ❌ ランタイム | 🔶 ハイブリッド | ✅ ビルド時 |
| **学習曲線** | 低い | 中程度 | 低い | 高い |
| **TypeScript** | ✅ 完全対応 | ✅ 完全対応 | ✅ 完全対応 | ✅ 完全対応 |
| **リアクティビティ** | Runes | Hooks | Composition API | Signals |

## 📖 関連リソース

<div class="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
  <div class="p-6 border border-gray-2 dark:border-gray-7 rounded-lg shadow-sm hover:shadow-md transition-shadow">
    <div class="text-3xl mb-3">📚</div>
    <h3 class="font-bold text-lg mb-3">公式ドキュメント</h3>
    <ul class="space-y-2 text-sm">
      <li>
        <a href="https://svelte.dev" class="text-orange-500 hover:text-orange-600 dark:hover:text-orange-400">
          Svelte公式サイト →
        </a>
      </li>
      <li>
        <a href="https://svelte.dev/docs" class="text-orange-500 hover:text-orange-600 dark:hover:text-orange-400">
          Svelte 5 ドキュメント →
        </a>
      </li>
      <li>
        <a href="https://learn.svelte.dev" class="text-orange-500 hover:text-orange-600 dark:hover:text-orange-400">
          インタラクティブチュートリアル →
        </a>
      </li>
    </ul>
  </div>

  <div class="p-6 border border-gray-2 dark:border-gray-7 rounded-lg shadow-sm hover:shadow-md transition-shadow">
    <div class="text-3xl mb-3">👥</div>
    <h3 class="font-bold text-lg mb-3">コミュニティ</h3>
    <ul class="space-y-2 text-sm">
      <li>
        <a href="https://discord.gg/svelte" class="text-orange-500 hover:text-orange-600 dark:hover:text-orange-400">
          Discord サーバー →
        </a>
      </li>
      <li>
        <a href="https://github.com/sveltejs/svelte" class="text-orange-500 hover:text-orange-600 dark:hover:text-orange-400">
          GitHub リポジトリ →
        </a>
      </li>
      <li>
        <a href="https://www.reddit.com/r/sveltejs/" class="text-orange-500 hover:text-orange-600 dark:hover:text-orange-400">
          Reddit コミュニティ →
        </a>
      </li>
    </ul>
  </div>
</div>

## 🎯 実際のプロジェクト例

### 企業での採用事例
- **The New York Times**: インタラクティブなデータビジュアライゼーション
- **Apple**: Spotlightでのドキュメント検索
- **1Password**: ブラウザ拡張機能
- **Spotify**: 音楽プレイヤーのUIコンポーネント

### 学習プロジェクト例

#### 1. TODOアプリ（初級）
```svelte
<script lang="ts">
  type Todo = { id: number; text: string; done: boolean };
  
  let todos = $state<Todo[]>([]);
  let newTodo = $state('');
  
  function addTodo() {
    if (newTodo.trim()) {
      todos.push({ 
        id: Date.now(), 
        text: newTodo, 
        done: false 
      });
      newTodo = '';
    }
  }
</script>
```

#### 2. リアルタイムチャット（中級）
- WebSocket通信
- リアクティブストア活用
- メッセージの永続化

#### 3. ダッシュボード（上級）
- データビジュアライゼーション
- コンポーネントの再利用
- パフォーマンス最適化

## ❓ よくある質問

<div class="space-y-4 my-8">
  <div class="p-6 border border-gray-2 dark:border-gray-7 rounded-lg shadow-sm hover:shadow-md transition-shadow">
    <h3 class="font-bold text-lg mb-3 flex items-center">
      <span class="text-2xl mr-2">Q:</span>
      ReactやVueから移行すべき？
    </h3>
    <p class="text-gray-7 dark:text-gray-3">
      A: プロジェクトの要件次第です。パフォーマンスとバンドルサイズが重要な場合、Svelteは優れた選択肢です。特に以下のケースでは移行を検討する価値があります。
    </p>
    <ul class="mt-2 space-y-1 text-sm text-gray-6 dark:text-gray-4">
      <li>バンドルサイズを最小限に抑えたい</li>
      <li>初期ロード時間を改善したい</li>
      <li>よりシンプルな開発体験を求めている</li>
    </ul>
  </div>

  <div class="p-6 border border-gray-2 dark:border-gray-7 rounded-lg shadow-sm hover:shadow-md transition-shadow">
    <h3 class="font-bold text-lg mb-3 flex items-center">
      <span class="text-2xl mr-2">Q:</span>
      学習期間はどのくらい？
    </h3>
    <p class="text-gray-7 dark:text-gray-3">
      A: 基本的な機能は<strong class="text-orange-500">1-2週間</strong>、Runesシステムまで含めて<strong class="text-orange-500">1ヶ月</strong>程度で習得可能です。
    </p>
    <div class="mt-3 space-y-2 text-sm">
      <div class="flex items-center">
        <span class="font-semibold text-orange-500 w-24">1週目:</span>
        <span class="text-gray-6 dark:text-gray-4">基本的なコンポーネント作成、テンプレート構文</span>
      </div>
      <div class="flex items-center">
        <span class="font-semibold text-orange-500 w-24">2週目:</span>
        <span class="text-gray-6 dark:text-gray-4">Runesシステム、リアクティビティの理解</span>
      </div>
      <div class="flex items-center">
        <span class="font-semibold text-orange-500 w-24">3-4週目:</span>
        <span class="text-gray-6 dark:text-gray-4">実践的なアプリケーション構築、最適化</span>
      </div>
    </div>
  </div>

  <div class="p-6 border border-gray-2 dark:border-gray-7 rounded-lg shadow-sm hover:shadow-md transition-shadow">
    <h3 class="font-bold text-lg mb-3 flex items-center">
      <span class="text-2xl mr-2">Q:</span>
      エコシステムは充実している？
    </h3>
    <p class="text-gray-7 dark:text-gray-3 mb-3">
      A: React/Vueほどではありませんが、主要なライブラリは揃っています。
    </p>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
      <div>
        <span class="font-semibold text-orange-500">UI:</span>
        <span class="text-gray-6 dark:text-gray-4 ml-2">Skeleton UI、Svelte Material UI</span>
      </div>
      <div>
        <span class="font-semibold text-orange-500">状態管理:</span>
        <span class="text-gray-6 dark:text-gray-4 ml-2">組み込みストア、Tanstack Query</span>
      </div>
      <div>
        <span class="font-semibold text-orange-500">フォーム:</span>
        <span class="text-gray-6 dark:text-gray-4 ml-2">Superforms、Felte</span>
      </div>
      <div>
        <span class="font-semibold text-orange-500">テスト:</span>
        <span class="text-gray-6 dark:text-gray-4 ml-2">Vitest、Testing Library</span>
      </div>
    </div>
  </div>

  <div class="p-6 border border-gray-2 dark:border-gray-7 rounded-lg shadow-sm hover:shadow-md transition-shadow">
    <h3 class="font-bold text-lg mb-3 flex items-center">
      <span class="text-2xl mr-2">Q:</span>
      どんなプロジェクトに向いている？
    </h3>
    <div class="space-y-3">
      A: 以下のようなプロジェクトに向いています。
      <div class="flex items-start">
        <span class="text-green-500 font-bold mr-2">✅</span>
        <div>
          <span class="font-semibold text-gray-8 dark:text-gray-2">最適：</span>
          <span class="text-gray-6 dark:text-gray-4 ml-1">SPAダッシュボード、インタラクティブなWebアプリ</span>
        </div>
      </div>
      <div class="flex items-start">
        <span class="text-green-500 font-bold mr-2">✅</span>
        <div>
          <span class="font-semibold text-gray-8 dark:text-gray-2">良い：</span>
          <span class="text-gray-6 dark:text-gray-4 ml-1">ブラウザ拡張機能、組み込みウィジェット</span>
        </div>
      </div>
      <div class="flex items-start">
        <span class="text-yellow-500 font-bold mr-2">⚠️</span>
        <div>
          <span class="font-semibold text-gray-8 dark:text-gray-2">要検討：</span>
          <span class="text-gray-6 dark:text-gray-4 ml-1">大規模エンタープライズ（エコシステムの成熟度）</span>
        </div>
      </div>
    </div>
  </div>
</div>

## 🎯 次のステップ

**完全初心者の方**:
[Svelteの基本概要](/svelte/basics/)から始めて、基礎をしっかり学習

**他フレームワーク経験者**:
[Runesシステム概要](/svelte/runes/)でSvelte 5の革新的な機能を理解

**すぐに実装したい方**:
[コンポーネントの基本](/svelte/basics/component-basics/)で実践的な開発を開始

**フルスタック開発を目指す方**:
Svelteをマスター後、[SvelteKit完全ガイド](/sveltekit/)へ進む

---

:::tip[Svelte 5の特徴]
Svelte 5は2024年10月にリリースされた最新版で、Runesシステムという革新的なリアクティビティシステムを導入しています。従来のSvelte 4以前の文法とは大きく異なるため、最新の文法で学習することが重要です。
:::

:::info[Virtual DOMを使わない理由]
SvelteはVirtual DOMを使わず、コンパイル時に効率的なDOM操作コードを生成します。これにより、ランタイムのオーバーヘッドがなく、より高速で軽量なアプリケーションが実現できます。
:::

:::note[TypeScript推奨]
このガイドは全てTypeScriptで記述されています。JavaScriptでも動作しますが、型安全性を活用することで、より堅牢なアプリケーション開発が可能になります。
:::