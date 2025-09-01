---
title: ルーティング概要
description: SvelteKitのルーティングシステムをTypeScriptで理解。ファイルベースルーティングの基本から動的ルート、高度な機能まで体系的に解説
---

<script>
  import { base } from '$app/paths';
</script>

SvelteKitのルーティングシステムは、ファイルベースの直感的な設計でありながら、エンタープライズレベルのアプリケーションに必要な高度な機能を全て備えています。

## ルーティングの学習パス

SvelteKitのルーティングを段階的に学習できるよう、3つのセクションに分けて解説します。

<div class="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
  <a href="{base}/sveltekit/routing/basic/" class="flex no-underline group">
    <div class="p-6 border border-gray-2 dark:border-gray-7 rounded-lg shadow-md hover:shadow-lg hover:border-orange-400 dark:hover:border-orange-400 transition-all cursor-pointer flex flex-col w-full">
      <div class="text-3xl mb-3">📚</div>
      <h3 class="font-bold text-xl mb-3 text-orange-600 dark:text-orange-400 group-hover:text-orange-700 dark:group-hover:text-orange-300 transition-colors">
        基本ルーティング
      </h3>
      <p class="text-sm mb-3 text-gray-7 dark:text-gray-3">
        ファイルベースルーティングの基礎、静的ルート、ページの作成方法を学びます。
      </p>
      <ul class="text-sm text-gray-6 dark:text-gray-4 space-y-1">
        <li>ディレクトリ構造とURL</li>
        <li>ページの作成</li>
        <li>レイアウトの基本</li>
        <li>エラーページ</li>
      </ul>
    </div>
  </a>

  <a href="{base}/sveltekit/routing/dynamic/" class="flex no-underline group">
    <div class="p-6 border border-gray-2 dark:border-gray-7 rounded-lg shadow-md hover:shadow-lg hover:border-orange-400 dark:hover:border-orange-400 transition-all cursor-pointer flex flex-col w-full">
      <div class="text-3xl mb-3">🔄</div>
      <h3 class="font-bold text-xl mb-3 text-orange-600 dark:text-orange-400 group-hover:text-orange-700 dark:group-hover:text-orange-300 transition-colors">
        動的ルーティング
      </h3>
      <p class="text-sm mb-3 text-gray-7 dark:text-gray-3">
        動的なURLパラメータを扱い、柔軟なルート設計を実現します。
      </p>
      <ul class="text-sm text-gray-6 dark:text-gray-4 space-y-1">
        <li>動的パラメータ [id]</li>
        <li>Rest Parameters [...slug]</li>
        <li>オプショナルパラメータ [[optional]]</li>
        <li>ルートマッチャー</li>
      </ul>
    </div>
  </a>

  <a href="{base}/sveltekit/routing/advanced/" class="flex no-underline group">
    <div class="p-6 border border-gray-2 dark:border-gray-7 rounded-lg shadow-md hover:shadow-lg hover:border-orange-400 dark:hover:border-orange-400 transition-all cursor-pointer flex flex-col w-full">
      <div class="text-3xl mb-3">🚀</div>
      <h3 class="font-bold text-xl mb-3 text-orange-600 dark:text-orange-400 group-hover:text-orange-700 dark:group-hover:text-orange-300 transition-colors">
        高度なルーティング
      </h3>
      <p class="text-sm mb-3 text-gray-7 dark:text-gray-3">
        プロダクション環境で必要な高度な機能を習得します。
      </p>
      <ul class="text-sm text-gray-6 dark:text-gray-4 space-y-1">
        <li>ルートグループ</li>
        <li>ネストレイアウト</li>
        <li>プログラマティックナビゲーション</li>
        <li>ルートアノテーション</li>
      </ul>
    </div>
  </a>
</div>

## 次のステップ

1. **初心者の方**: [基本ルーティング](./basic/)から始めましょう
2. **基本を理解した方**: [動的ルーティング](./dynamic/)で柔軟なURL設計を学びましょう
3. **実践的な開発**: [高度なルーティング](./advanced/)でプロダクション対応の技術を習得しましょう

