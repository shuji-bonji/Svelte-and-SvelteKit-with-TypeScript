---
title: リファレンス
description: Svelte 5とSvelteKit 2.xの完全リファレンス - TypeScript完全対応、実践的なコード例、包括的なAPIドキュメント
---

<script>
  import { base } from '$app/paths';
</script>

Svelte 5とSvelteKit 2.xの開発に必要なすべての情報を2つの包括的なリファレンスにまとめました。TypeScriptとの完全統合、実践的なコード例、詳細なAPI仕様を網羅し、効率的な開発をサポートします。

## 完全リファレンス

<div class="grid">
  <a href="{base}/reference/svelte5/" class="card-link">
    <article class="card">
      <h3>⚡ Svelte 5 完全リファレンス</h3>
      <p>
        Svelte 5のすべてを網羅した包括的なリファレンス。Runesシステム、コンポーネント、テンプレート構文、トランジション、TypeScript統合まで、必要な情報がすべてここに。
      </p>
      <ul>
        <li>🎯 Runesシステム完全解説（$state、$derived、$effect）</li>
        <li>📦 コンポーネント設計とライフサイクル</li>
        <li>🎨 スタイリングとアニメーション</li>
        <li>💎 TypeScript完全対応の型定義</li>
      </ul>
    </article>
  </a>

  <a href="{base}/reference/sveltekit2/" class="card-link">
    <article class="card">
      <h3>🚀 SvelteKit 2.x 完全リファレンス</h3>
      <p>
        SvelteKit 2.xでフルスタックWebアプリケーションを構築するための完全リファレンス。ルーティング、データロード、フォーム処理、APIルート、Hooksまですべてを網羅。
      </p>
      <ul>
        <li>📁 ファイルベースルーティングシステム</li>
        <li>🔄 SSR/SSG/SPA完全対応</li>
        <li>🔐 型安全なデータフローと認証</li>
        <li>🌍 デプロイメントとアダプター</li>
      </ul>
    </article>
  </a>
</div>

## このリファレンスの特徴

### TypeScript完全対応
すべてのコード例でTypeScriptを使用し、型安全な開発を実現します。

### 実践的なアプローチ
実際のプロジェクトで使用できる、実践的なコード例とパターンを提供します。

### 最新バージョン対応
Svelte 5とSvelteKit 2.xの最新機能に対応し、常に最新の情報を提供します。

### 包括的な内容
基本から応用まで、開発に必要なすべての情報を網羅しています。

## LLM/AI向け利用方法

これらのリファレンスは、開発者だけでなくLLM（大規模言語モデル）やAIアシスタントのコンテキストとしても最適化されています。各リファレンスには以下が含まれます。

- **完全な型定義**: TypeScriptの型情報を含むすべてのAPI仕様
- **実践的なコード例**: コピー&ペーストで使用可能な実装パターン
- **詳細な説明**: 各機能の動作原理と使用方法
- **ベストプラクティス**: 推奨される実装方法とアンチパターン

## フィードバック

これらのリファレンスについての質問やフィードバックは、GitHubのDiscussionでお待ちしています。

- [Svelte 5 Discussion #59](https://github.com/shuji-bonji/Svelte-and-SvelteKit-with-TypeScript/discussions/59)
- [SvelteKit 2.x Discussion #60](https://github.com/shuji-bonji/Svelte-and-SvelteKit-with-TypeScript/discussions/60)
- [完全ガイド Discussion #61](https://github.com/shuji-bonji/Svelte-and-SvelteKit-with-TypeScript/discussions/61)

## 関連リソース

- [Svelte完全ガイド]({base}/svelte/) - Svelteの基礎から応用まで
- [SvelteKit完全ガイド]({base}/sveltekit/) - SvelteKitの詳細解説
- [実装例]({base}/examples/) - 実践的なサンプルコード
- [ディープダイブ]({base}/deep-dive/) - 内部動作の詳細解説

<style>
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    margin: 2rem 0;
  }

  .card-link {
    text-decoration: none;
    color: inherit;
    display: block;
    transition: transform 0.2s;
  }

  .card-link:hover {
    transform: translateY(-2px);
  }

  .card {
    padding: 1.5rem;
    border: 1px solid var(--sl-color-gray-5);
    border-radius: 0.5rem;
    background: var(--sl-color-bg-nav);
    height: 100%;
    transition: box-shadow 0.2s, border-color 0.2s;
  }

  .card-link:hover .card {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: var(--sl-color-accent);
  }

  .card h3 {
    margin-top: 0;
    margin-bottom: 1rem;
    color: var(--sl-color-text);
  }

  .card h3 a:hover {
    color: var(--sl-color-accent);
  }

  .card p {
    margin-bottom: 1rem;
    color: var(--sl-color-gray-2);
  }

  .card ul {
    margin: 0;
    padding-left: 1.5rem;
  }

  .card li {
    margin: 0.25rem 0;
    color: var(--sl-color-gray-3);
  }
</style>