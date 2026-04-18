---
title: SvelteKit サーバーサイド編
description: SvelteKitのサーバーサイド機能をTypeScriptで完全マスター - フォーム処理、Actions、APIルート設計、Hooks、WebSocket/SSE実装、ミドルウェアによるバックエンド開発を実例を交えて体系的かつ実践的に詳しく解説します
---
<script>
	import Admonition from '$lib/components/Admonition.svelte';
  import { base } from '$app/paths';
</script>

SvelteKitは、サーバーサイドの機能を**シームレスに統合**したフルスタックフレームワークです。このセクションでは、フォーム処理、API開発、SSR、認証など、サーバーサイド開発に必要なすべてを学びます。

## サーバーサイド機能の特徴

SvelteKitのサーバーサイド機能は、モダンなWeb開発のベストプラクティスを取り入れています。

### 主な特徴

1. **プログレッシブエンハンスメント** - JavaScriptなしでも動作するフォーム
2. **型安全なAPI** - TypeScriptによるエンドツーエンドの型安全性
3. **統合されたSSR** - 高速な初期表示とSEO最適化
4. **セキュアな設計** - CSRF保護とセキュリティヘッダー
5. **エッジ対応** - Cloudflare WorkersやVercel Edgeでの実行

## このセクションで学ぶこと

<div class="grid grid-cols-1 md:grid-cols-2 gap-4 my-8 auto-rows-[1fr]">
  <a href="{base}/sveltekit/server/server-side/" class="flex no-underline group h-full not-prose" style="color: inherit;">
    <div class="section-card p-4 cursor-pointer flex flex-col w-full">
      <div class="text-3xl mb-2">⚙️</div>
      <h3 class="font-bold text-lg mb-2" style="color: var(--color-card-title);">
        サーバーサイド処理
        <span class="inline-block ml-1 text-xs opacity-60">→</span>
      </h3>
      <p class="text-sm mb-3" style="color: var(--color-card-desc);">サーバーサイドアーキテクチャの全体像を理解します。</p>
      <ul class="text-sm space-y-1 flex-grow list-disc pl-5" style="color: var(--color-card-list);">
        <li><strong>ファイルタイプ</strong>: +page.server.ts、+server.ts</li>
        <li><strong>実行環境</strong>: サーバー/クライアント境界</li>
        <li><strong>セキュリティモデル</strong>: 機密情報の保護</li>
        <li><strong>リクエストフロー</strong>: 処理の流れを図解</li>
        <li><strong>実装パターン</strong>: カード形式でナビゲーション</li>
      </ul>
    </div>
  </a>

  <a href="{base}/sveltekit/server/forms/" class="flex no-underline group h-full not-prose" style="color: inherit;">
    <div class="section-card p-4 cursor-pointer flex flex-col w-full">
      <div class="text-3xl mb-2">📝</div>
      <h3 class="font-bold text-lg mb-2" style="color: var(--color-card-title);">
        フォーム処理とActions
        <span class="inline-block ml-1 text-xs opacity-60">→</span>
      </h3>
      <p class="text-sm mb-3" style="color: var(--color-card-desc);">Form Actionsを使った堅牢なフォーム処理を実装します。</p>
      <ul class="text-sm space-y-1 flex-grow list-disc pl-5" style="color: var(--color-card-list);">
        <li><strong>Form Actions</strong>: サーバー側の処理</li>
        <li><strong>バリデーション</strong>: Zodによる型安全な検証</li>
        <li><strong>エラーハンドリング</strong>: ユーザーフレンドリーな表示</li>
        <li><strong>ファイルアップロード</strong>: マルチパート処理</li>
        <li><strong>プログレッシブ強化</strong>: JS無効でも動作</li>
      </ul>
    </div>
  </a>
  
  <a href="{base}/sveltekit/server/api-routes/" class="flex no-underline group h-full not-prose" style="color: inherit;">
    <div class="section-card p-4 cursor-pointer flex flex-col w-full">
      <div class="text-3xl mb-2">🔌</div>
      <h3 class="font-bold text-lg mb-2" style="color: var(--color-card-title);">
        APIルート設計
        <span class="inline-block ml-1 text-xs opacity-60">→</span>
      </h3>
      <p class="text-sm mb-3" style="color: var(--color-card-desc);">RESTful APIエンドポイントを構築します。</p>
      <ul class="text-sm space-y-1 flex-grow list-disc pl-5" style="color: var(--color-card-list);">
        <li><strong>+server.ts</strong>: APIルートハンドラー</li>
        <li><strong>RESTful設計</strong>: CRUD操作の実装</li>
        <li><strong>認証・認可</strong>: JWT認証パターン</li>
        <li><strong>CORS設定</strong>: クロスオリジン対応</li>
        <li><strong>レート制限</strong>: APIの保護</li>
      </ul>
    </div>
  </a>
  
  <a href="{base}/sveltekit/server/hooks/" class="flex no-underline group h-full not-prose" style="color: inherit;">
    <div class="section-card p-4 cursor-pointer flex flex-col w-full">
      <div class="text-3xl mb-2">🎣</div>
      <h3 class="font-bold text-lg mb-2" style="color: var(--color-card-title);">
        Hooks
        <span class="inline-block ml-1 text-xs opacity-60">→</span>
      </h3>
      <p class="text-sm mb-3" style="color: var(--color-card-desc);">リクエスト/レスポンスのライフサイクルをカスタマイズします。</p>
      <ul class="text-sm space-y-1 flex-grow list-disc pl-5" style="color: var(--color-card-list);">
        <li><strong>handle</strong>: リクエストインターセプター</li>
        <li><strong>handleFetch</strong>: 外部API呼び出し制御</li>
        <li><strong>handleError</strong>: エラー処理のカスタマイズ</li>
        <li><strong>認証ミドルウェア</strong>: グローバル認証チェック</li>
        <li><strong>sequence</strong>: 複数Hooksの連鎖</li>
      </ul>
    </div>
  </a>
  
  <a href="{base}/sveltekit/server/websocket-sse/" class="flex no-underline group h-full not-prose" style="color: inherit;">
    <div class="section-card p-4 cursor-pointer flex flex-col w-full">
      <div class="text-3xl mb-2">🔄</div>
      <h3 class="font-bold text-lg mb-2" style="color: var(--color-card-title);">
        WebSocket/SSE
        <span class="inline-block ml-1 text-xs opacity-60">→</span>
      </h3>
      <p class="text-sm mb-3" style="color: var(--color-card-desc);">リアルタイム通信の実装方法を解説します。</p>
      <ul class="text-sm space-y-1 flex-grow list-disc pl-5" style="color: var(--color-card-list);">
        <li><strong>WebSocket</strong>: 双方向リアルタイム通信</li>
        <li><strong>SSE</strong>: サーバーからのプッシュ通知</li>
        <li><strong>Socket.IO</strong>: ライブラリ統合</li>
        <li><strong>スケーラビリティ</strong>: Redis Pub/Sub</li>
        <li><strong>デプロイ戦略</strong>: プラットフォーム別対応</li>
      </ul>
    </div>
  </a>

  <a href="{base}/sveltekit/server/server-only-modules/" class="flex no-underline group h-full not-prose" style="color: inherit;">
    <div class="section-card p-4 cursor-pointer flex flex-col w-full">
      <div class="text-3xl mb-2">🔒</div>
      <h3 class="font-bold text-lg mb-2" style="color: var(--color-card-title);">
        Server-only modules
        <span class="inline-block ml-1 text-xs opacity-60">→</span>
      </h3>
      <p class="text-sm mb-3" style="color: var(--color-card-desc);">秘密情報やサーバー専用コードをクライアントに漏らさない仕組みを理解します。</p>
      <ul class="text-sm space-y-1 flex-grow list-disc pl-5" style="color: var(--color-card-list);">
        <li><code>$lib/server/</code> 命名規約</li>
        <li><code>$env/static/private</code> / <code>$env/dynamic/private</code></li>
        <li>ビルド時検査と実行時エラー</li>
        <li>Load 関数での安全な参照</li>
        <li>DB 接続・APIキー管理の実例</li>
      </ul>
    </div>
  </a>

  <a href="{base}/sveltekit/server/remote-functions/" class="flex no-underline group h-full not-prose" style="color: inherit;">
    <div class="section-card p-4 cursor-pointer flex flex-col w-full">
      <div class="text-3xl mb-2">📡</div>
      <h3 class="font-bold text-lg mb-2" style="color: var(--color-card-title);">
        Remote Functions <span class="text-xs opacity-70">（実験的）</span>
        <span class="inline-block ml-1 text-xs opacity-60">→</span>
      </h3>
      <p class="text-sm mb-3" style="color: var(--color-card-desc);">型付き RPC スタイルでクライアントから関数を呼び出せる新機能を学びます。</p>
      <ul class="text-sm space-y-1 flex-grow list-disc pl-5" style="color: var(--color-card-list);">
        <li><code>query</code> / <code>command</code> / <code>form</code></li>
        <li>Zod 等によるバリデーション</li>
        <li>Load 関数・Form Actions との使い分け</li>
        <li><code>kit.experimental.remoteFunctions</code> 有効化</li>
        <li>認証・認可の組み込み</li>
      </ul>
    </div>
  </a>
</div>

## 実践的なユースケース

### 構築できるもの

- **認証システム** - セッション管理とJWT認証
- **RESTful API** - CRUDオペレーション
- **リアルタイムアプリ** - WebSocketとSSE
- **ファイル管理システム** - アップロードと処理
- **決済システム** - Stripe/PayPal統合

### パフォーマンス指標

| 機能 | パフォーマンス |
|------|--------------|
| SSRレンダリング | &lt; 50ms |
| API応答時間 | &lt; 100ms |
| フォーム送信 | &lt; 200ms |
| WebSocket接続 | &lt; 10ms |

## 学習の進め方

### 推奨学習順序

1. **サーバーサイド処理** - アーキテクチャの全体像を把握
2. **フォーム処理とActions** - 基本的なサーバー通信を理解
3. **APIルート設計** - RESTful APIの構築方法を学習
4. **Hooks** - 高度なリクエスト処理をマスター
5. **WebSocket/SSE** - リアルタイム機能の実装
6. **Server-only modules** - 秘密情報とサーバー限定コードの隔離
7. **Remote Functions（実験的）** - 型付き RPC スタイルでの呼び出し

### 学習目標

このセクションを完了すると、以下ができるようになります。

- プログレッシブエンハンスメント対応のフォームを実装できる
- 型安全なAPIエンドポイントを設計・実装できる
- SSR/SSGを使い分けて最適なレンダリング戦略を選択できる
- セキュアで高性能なサーバーサイドアプリケーションを構築できる

## 次のステップ

サーバーサイド編を習得したら、[アプリケーション構築編](/sveltekit/application/)で実践的な開発パターンを学びましょう。

<Admonition type="warning" title="セキュリティ重要">

サーバーサイド開発では、SQLインジェクション、XSS、CSRF などの脆弱性に注意が必要です。このセクションではセキュアなコーディングプラクティスを重視しています。

</Admonition>
<Admonition type="tip" title="エッジ対応">

SvelteKitはCloudflare Workers、Vercel Edge Functions などのエッジ環境でも動作します。グローバルに分散したアプリケーションの構築が可能です。

</Admonition>