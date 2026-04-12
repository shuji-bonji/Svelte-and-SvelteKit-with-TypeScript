---
title: リファレンス
description: Svelte 5とSvelteKit 2.xの総合リファレンス。テンプレート構文、ルーティング、フォーム/サーバー処理、ストアやトランジション、TypeScriptの型情報まで実践コード付きで横断的に参照できる索引ページ。関連チャプターへの導線も完備。詳しい手順とチェックリスト付き。運用時の確認ポイントも掲載
---

<script>
  import { base } from '$app/paths';
</script>

Svelte 5 と SvelteKit 2.x の開発に必要なすべての情報を 2 つの包括的なリファレンスにまとめました。TypeScript との完全統合、実践的なコード例、詳細な API 仕様を網羅し、効率的な開発をサポートします。

## 完全リファレンス

<div class="grid grid-cols-1 md:grid-cols-2 gap-4 my-8 auto-rows-[1fr]">
  <a href="{base}/reference/svelte5/" class="flex no-underline group h-full not-prose" style="color: inherit;">
    <div class="section-card p-4 cursor-pointer flex flex-col w-full">
      <div class="text-3xl mb-2">⚡</div>
      <h3 class="font-bold text-lg mb-2" style="color: var(--color-card-title);">
        Svelte 5 完全リファレンス
        <span class="inline-block ml-1 text-xs opacity-60">→</span>
      </h3>
      <p class="text-sm mb-3" style="color: var(--color-card-desc);">Svelte 5のすべてを網羅した包括的なリファレンス。Runesシステム、コンポーネント、テンプレート構文、トランジション、TypeScript統合まで。</p>
      <ul class="text-sm space-y-1 flex-grow list-disc pl-5" style="color: var(--color-card-list);">
        <li>Runesシステム完全解説（$state、$derived、$effect）</li>
        <li>コンポーネント設計とライフサイクル</li>
        <li>スタイリングとアニメーション</li>
        <li>TypeScript完全対応の型定義</li>
      </ul>
    </div>
  </a>

  <a href="{base}/reference/sveltekit2/" class="flex no-underline group h-full not-prose" style="color: inherit;">
    <div class="section-card p-4 cursor-pointer flex flex-col w-full">
      <div class="text-3xl mb-2">🚀</div>
      <h3 class="font-bold text-lg mb-2" style="color: var(--color-card-title);">
        SvelteKit 2.x 完全リファレンス
        <span class="inline-block ml-1 text-xs opacity-60">→</span>
      </h3>
      <p class="text-sm mb-3" style="color: var(--color-card-desc);">SvelteKit 2.xでフルスタックWebアプリケーションを構築するための完全リファレンス。ルーティング、データロード、フォーム処理、APIルート、Hooksまで。</p>
      <ul class="text-sm space-y-1 flex-grow list-disc pl-5" style="color: var(--color-card-list);">
        <li>ファイルベースルーティングシステム</li>
        <li>SSR/SSG/SPA完全対応</li>
        <li>型安全なデータフローと認証</li>
        <li>デプロイメントとアダプター</li>
      </ul>
    </div>
  </a>
</div>

## このリファレンスの特徴

### TypeScript 完全対応

すべてのコード例で TypeScript を使用し、型安全な開発を実現します。

### 実践的なアプローチ

実際のプロジェクトで使用できる、実践的なコード例とパターンを提供します。

### 最新バージョン対応

Svelte 5 と SvelteKit 2.x の最新機能に対応し、常に最新の情報を提供します。

### 包括的な内容

基本から応用まで、開発に必要なすべての情報を網羅しています。

## LLM/AI 向け利用方法

これらのリファレンスは、開発者だけでなく LLM（大規模言語モデル）や AI アシスタントのコンテキストとしても最適化されています。各リファレンスには以下が含まれます。

- **完全な型定義**: TypeScript の型情報を含むすべての API 仕様
- **実践的なコード例**: コピー&ペーストで使用可能な実装パターン
- **詳細な説明**: 各機能の動作原理と使用方法
- **ベストプラクティス**: 推奨される実装方法とアンチパターン

## 関連リソース

- [Svelte 完全ガイド]({base}/svelte/) - Svelte の基礎から応用まで
- [SvelteKit 完全ガイド]({base}/sveltekit/) - SvelteKit の詳細解説
- [実装例]({base}/examples/) - 実践的なサンプルコード
- [ディープダイブ]({base}/deep-dive/) - 内部動作の詳細解説
