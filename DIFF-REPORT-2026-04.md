# 差分レポート：Svelte/SvelteKit 最新ドキュメント vs サイト内容

> 作成日: 2026-04-12
> 比較元: Svelte MCP 最新ドキュメント（公式）
> 比較先: https://shuji-bonji.github.io/Svelte-and-SvelteKit-with-TypeScript/
> パッケージ: Svelte ^5.53.11 / SvelteKit ^2.55.0 / Vite ^7.3.1

---

## 凡例

- 🔴 **重要** — API変更・新機能の未反映で、読者が誤った情報を得る可能性
- 🟡 **中程度** — 網羅性の不足。機能は存在するが詳細が足りない
- 🟢 **軽微** — 表現の改善や補足情報の追加で済む
- ✅ **問題なし** — 最新ドキュメントと整合性あり
- 🆕 **新規作成推奨** — 対応ページが存在しない

---

## 第1部：Svelte 基本編（/svelte/basics/）

### 1.1 コンポーネントの基本（component-basics）
| 項目 | 状態 | 詳細 |
|------|------|------|
| 基本構造 | ✅ | script/markup/style の3要素は正確 |
| $props() | ✅ | Svelte 5構文で記述済み |
| イベントハンドラ | ✅ | onclick= 構文を使用 |

### 1.2 テンプレート構文（template-syntax）
| 項目 | 状態 | 詳細 |
|------|------|------|
| {#snippet} / {@render} | ✅ | 正しく記述 |
| {@html} | ✅ | XSS警告付き |
| {@const} | 🟡 | 公式ドキュメントにある `{@const}` の詳細（ループ内計算値）が薄い可能性 |
| {@debug} | 🟡 | 公式にある `{@debug}` の記述が `$inspect` ページに分散。テンプレート構文ページへの言及追加推奨 |

### 1.3 特別な要素（special-elements）
| 項目 | 状態 | 詳細 |
|------|------|------|
| `<svelte:boundary>` | 🔴 | **重大更新**: 公式ドキュメントでは `pending` snippetが追加（`await` expressions対応）。サイトではエラーハンドリングのみ記述の可能性。`pending`, `failed`, `onerror` の3プロパティ全てをカバーする必要あり |
| `<svelte:element>` | ✅ | 動的要素生成は記述済み |
| `<svelte:window>` | ✅ | イベント・バインディング記述済み |
| `<svelte:document>` | ✅ | 記述済み |
| `<svelte:head>` | ✅ | 記述済み |
| `<svelte:options>` | 🟡 | `runes` モードフラグ、`css: 'injected'` オプションが公式に追加。カバー要確認 |

### 1.4 use:アクション（actions）
| 項目 | 状態 | 詳細 |
|------|------|------|
| 基本構文 | ✅ | ライフサイクル（mount/update/destroy）記述済み |
| `ActionReturn` 型 | 🟡 | 公式の `ActionReturn<Parameter>` TypeScript型定義の詳細確認推奨 |
| `@attach` との関係 | 🟡 | 「`@attach` が今後の推奨」という公式の方向性について言及追加推奨 |

### 1.5 {@attach} アタッチメント（attachments）
| 項目 | 状態 | 詳細 |
|------|------|------|
| 基本概念 | ✅ | Svelte 5.29+の新機能として記述済み |
| `fromAction()` | 🟡 | `svelte/attachments` の `fromAction()` ユーティリティの詳細確認 |
| Attachment型 | ✅ | 型定義記述済み |

### 1.6 トランジション・アニメーション（transitions）
| 項目 | 状態 | 詳細 |
|------|------|------|
| transition/in/out | ✅ | 組み込みトランジション記述済み |
| animate: | 🟡 | `animate:flip` の記述が薄い可能性。公式ではリスト並び替えアニメーションの詳細あり |
| カスタムトランジション | 🟡 | 公式のカスタムトランジション作成方法（`tick` パラメータ）の記述確認 |

### 1.7 svelte/motion（motion）
| 項目 | 状態 | 詳細 |
|------|------|------|
| Tweened/Spring | ✅ | 最近追加されたページ |

### 1.8 svelte/easing（easing）
| 項目 | 状態 | 詳細 |
|------|------|------|
| イージング関数 | ✅ | 最近追加されたページ |

### 1.9 コンポーネントライフサイクル（component-lifecycle）
| 項目 | 状態 | 詳細 |
|------|------|------|
| $effect | ✅ | メインのライフサイクル管理として記述 |
| onMount | ✅ | 使い分けガイドあり |
| `untrack()` | 🟡 | 公式ドキュメントにある `untrack()` 関数の説明（依存追跡からの除外）が不足の可能性 |
| `flushSync()` | 🟡 | 公式にある `flushSync()` の説明（同期的なDOM更新の強制）が不足の可能性 |

### 1.10 TypeScript統合（typescript-integration）
| 項目 | 状態 | 詳細 |
|------|------|------|
| 基本設定 | ✅ | lang="ts" 記述済み |
| ジェネリックコンポーネント | 🟡 | 公式の `generics` 属性（`<script lang="ts" generics="T extends Record<string, unknown>">`）の記述確認 |
| `Component` 型 | 🟡 | 公式の新しい `Component` 型（Svelte 5）の詳細確認 |

### 1.11 🆕 未カバー領域
| 項目 | 詳細 |
|------|------|
| **`svelte/events`モジュール** | 🔴 `on()` ヘルパー関数（プログラマティックなイベントリスナー登録）。`MediaQuery` クラス。公式に新規セクションあり |
| **`class:` ディレクティブ詳解** | 🟡 公式では独立セクションとして `class:name={condition}` と `class={expression}` の詳細解説あり |
| **`style:` ディレクティブ詳解** | 🟡 公式では独立セクションとして `style:property={value}` の詳細解説あり |
| **`bind:` ディレクティブ総合ガイド** | 🟡 公式では独立セクションとして全バインディング（input, select, media, dimensions, this等）を網羅 |
| **スコープドCSS / グローバルCSS** | 🟡 公式には `Scoped styles`, `Global styles`, `Custom properties`, `Nested <style>` が独立セクション |
| **ベストプラクティス** | 🟡 公式に `Best practices` セクション新設（コンポーネント設計指針） |

---

## 第2部：Runes システム（/svelte/runes/）

### 2.1 $state
| 項目 | 状態 | 詳細 |
|------|------|------|
| 基本使用法 | ✅ | プリミティブ・オブジェクト・配列カバー |
| Deep state (Proxy) | 🟡 | 公式の「Proxyの動作詳細」「元のオブジェクトは変更されない」注意書き確認 |
| `$state.raw()` | 🔴 | **パフォーマンス最適化用**。大きな配列や頻繁に変更されないオブジェクト向け。公式では詳細な使い分けガイドあり。サイトでの記述深度を確認 |
| `$state.snapshot()` | 🟡 | デバッグや外部ライブラリへの受け渡し用。記述の深度確認 |

### 2.2 $derived
| 項目 | 状態 | 詳細 |
|------|------|------|
| 基本・$derived.by() | ✅ | 記述済み |
| **Overridable $derived** | 🔴 | **Svelte 5.25+の新機能**。`$derived` の値を一時的にオーバーライドし、依存値が変更されるとリセットされる動作。テキスト入力のオートコンプリート等のユースケース。サイトでの記述確認が必要 |

### 2.3 $effect
| 項目 | 状態 | 詳細 |
|------|------|------|
| 基本・クリーンアップ | ✅ | 記述済み |
| `$effect.pre()` | ✅ | 記述済み |
| `$effect.tracking()` | 🟡 | 公式にあるリアクティブコンテキスト判定の詳細確認 |
| `$effect.root()` | 🟡 | コンポーネント外でのエフェクト実行。公式に記述あり |
| **`$effect.pending()`** | 🔴 | **新API**。非同期操作の保留状態を追跡。`await` expressions関連。サイトでの記述確認が必要 |

### 2.4 $props
| 項目 | 状態 | 詳細 |
|------|------|------|
| 基本・デフォルト値・rest | ✅ | 記述済み |
| `$props.id()` | 🟡 | Svelte 5.20+の新機能として記述あるが、公式の詳細と一致するか確認 |
| Type-only props | 🟡 | `$props<{ variant: string }>()` ジェネリック構文の記述確認 |

### 2.5 $bindable
| 項目 | 状態 | 詳細 |
|------|------|------|
| 基本使用法 | ✅ | 正しく記述 |

### 2.6 $host
| 項目 | 状態 | 詳細 |
|------|------|------|
| カスタムエレメント | ✅ | 記述済み |

### 2.7 $inspect
| 項目 | 状態 | 詳細 |
|------|------|------|
| 基本使用法 | ✅ | 記述済み |
| `.with()` メソッド | 🟡 | 公式の `$inspect(...).with(fn)` カスタムハンドラの記述確認。`console.trace` 等への差し替えが可能 |

---

## 第3部：Svelte 実践編（/svelte/advanced/）

### 3.1 リアクティブストア（reactive-stores）
| 項目 | 状態 | 詳細 |
|------|------|------|
| .svelte.ts パターン | ✅ | Runes使用のモダンストア記述済み |
| レガシーストア互換 | 🟡 | 公式の `svelte/store` モジュールがまだ利用可能であることの言及確認 |

### 3.2 クラスとリアクティビティ（class-reactivity）
| 項目 | 状態 | 詳細 |
|------|------|------|
| $state on クラスプロパティ | ✅ | 記述済み |

### 3.3 組み込みリアクティブクラス（built-in-classes）
| 項目 | 状態 | 詳細 |
|------|------|------|
| SvelteMap/SvelteSet等 | ✅ | 記述済み |
| `SvelteDate` | 🟡 | 公式では `SvelteDate` の詳細あり。サイトでの記述深度確認 |

### 3.4 Snippets
| 項目 | 状態 | 詳細 |
|------|------|------|
| 基本構文・パラメータ | ✅ | 記述済み |
| スニペットのエクスポート | 🟡 | 公式ではモジュールスクリプトからのスニペットエクスポートの記述確認 |

### 3.5 コンポーネントパターン（component-patterns）
| 項目 | 状態 | 詳細 |
|------|------|------|
| HOC/Compound等 | ✅ | 記述済み |

### 3.6 hydratable（SSRデータ再利用）
| 項目 | 状態 | 詳細 |
|------|------|------|
| 基本概念 | ✅ | 最近追加されたページ |

### 3.7 await expressions（実験的）
| 項目 | 状態 | 詳細 |
|------|------|------|
| 基本構文 | ✅ | Svelte 5.36+ として記述 |
| `<svelte:boundary>` との連携 | 🔴 | `pending` snippetによるローディング表示は `await expressions` の中核機能。`<svelte:boundary>` ページと合わせた更新が必要 |

### 3.8 svelte/reactivity/window
| 項目 | 状態 | 詳細 |
|------|------|------|
| 基本API | ✅ | 最近追加されたページ |

---

## 第4部：SvelteKit 基礎編（/sveltekit/basics/）

### 4.1 $appモジュール（app-modules）
| 項目 | 状態 | 詳細 |
|------|------|------|
| `$app/state` | ✅ | Svelte 5推奨として記述済み |
| `$app/stores`（レガシー） | ✅ | 互換性のために言及 |
| **`$app/server`** | 🔴 | **新モジュール**。`query`, `form`, `command`, `prerender`, `getRequestEvent()`, `requested()` をエクスポート。Remote Functions用。ページ内での言及・解説が必要 |
| **`$app/types`** | 🔴 | **新モジュール（v2.26+）**。`RouteId`, `RouteParams<T>`, `Pathname`, `ResolvedPathname`, `LayoutParams`, `Asset` 型を提供。型安全なルーティングの強化。ページ内での解説が必要 |
| `$app/navigation` | 🟡 | `preloadData`, `preloadCode` の最新仕様確認 |
| `$app/paths` | 🟡 | `resolve()` の最新使用法確認 |

### 4.2 プロジェクト構造（project-structure）
| 項目 | 状態 | 詳細 |
|------|------|------|
| ファイル構造 | ✅ | 記述済み |
| **`.remote.ts` ファイル** | 🔴 | Remote Functions用の新ファイルタイプ。プロジェクト構造説明に追加が必要 |

### 4.3 特殊ファイルシステム（file-system）
| 項目 | 状態 | 詳細 |
|------|------|------|
| +page/+layout/+server/+error | ✅ | 記述済み |
| **+page.remote.ts** | 🔴 | Remote Functions用の新ファイル。解説追加が必要 |

### 4.4 🆕 Project Types
| 項目 | 詳細 |
|------|------|
| **プロジェクトタイプガイド** | 🆕 公式に新規セクション。SSG/SPA/SSR/Library/PWA/Desktop/Mobile/Browser Extension等の選択ガイド。新規ページ作成推奨 |

### 4.5 レンダリング戦略（basics/rendering-strategies）
| 項目 | 状態 | 詳細 |
|------|------|------|
| SSR/SSG/SPA | ✅ | 基礎は記述済み |
| **Page options** | 🟡 | 公式の `trailingSlash` オプション、`prerender` のcrawler動作の最新仕様確認 |

---

## 第5部：SvelteKit ルーティング（/sveltekit/routing/）

### 5.1 基本ルーティング（basic）
| 項目 | 状態 | 詳細 |
|------|------|------|
| ファイルベースルーティング | ✅ | 記述済み |

### 5.2 高度なルーティング（advanced）
| 項目 | 状態 | 詳細 |
|------|------|------|
| rest params/optional params | ✅ | 記述済み |
| `(group)` ルーティング | ✅ | 記述済み |

### 5.3 エラーページ（error-pages）
| 項目 | 状態 | 詳細 |
|------|------|------|
| +error.svelte | ✅ | 記述済み |
| `$app/state` での error 参照 | 🟡 | 公式では `page.error` を `$app/state` から取得。サイトが `$page.error`（stores）を使っていないか確認 |

### 5.4 Shallow routing
| 項目 | 状態 | 詳細 |
|------|------|------|
| pushState/replaceState | ✅ | 記述済み |

### 5.5 Link options
| 項目 | 状態 | 詳細 |
|------|------|------|
| data-sveltekit-* 属性 | ✅ | 記述済み |
| `data-sveltekit-preload-data="eager"` | 🟡 | `eager` と `viewport` オプションの詳細確認 |

---

## 第6部：SvelteKit データ取得（/sveltekit/data-loading/）

### 6.1 Load関数の基礎（basic）
| 項目 | 状態 | 詳細 |
|------|------|------|
| universal/server load | ✅ | 記述済み |
| **Svelte 5 propsパターン** | 🔴 | 公式では `let { data } = $props<PageProps>()` を使用（`PageProps` は `./$types` から）。サイトが `let { data }: { data: PageData } = $props()` を使用している場合、最新パターンへの更新推奨 |

### 6.2 TypeScript型の自動生成（typescript-types）
| 項目 | 状態 | 詳細 |
|------|------|------|
| ./$types | ✅ | 記述済み |
| **`PageProps` / `LayoutProps`** | 🔴 | 公式では `PageData` に加えて `PageProps` 型（data + form + params を含む）が推奨。サイトの更新が必要な可能性 |

### 6.3 データフローの詳細（flow）
| 項目 | 状態 | 詳細 |
|------|------|------|
| parent()/depends() | ✅ | 記述済み |

### 6.4 ストリーミングSSR（streaming）
| 項目 | 状態 | 詳細 |
|------|------|------|
| ストリーミング | ✅ | 記述済み |

---

## 第7部：SvelteKit サーバーサイド（/sveltekit/server/）

### 7.1 フォーム処理とActions（forms）
| 項目 | 状態 | 詳細 |
|------|------|------|
| default/named actions | ✅ | 記述済み |
| use:enhance | ✅ | 記述済み |
| fail()/redirect() | ✅ | 記述済み |

### 7.2 Hooks
| 項目 | 状態 | 詳細 |
|------|------|------|
| handle/handleFetch/handleError | ✅ | 記述済み |
| **`handleValidationError`** | 🔴 | **新フック**。Standard Schema バリデーションエラーのカスタムハンドリング。公式に追加済み。サイトへの追記が必要 |
| sequence() | 🟡 | `@sveltejs/kit/hooks` の `sequence()` ヘルパーの記述確認 |

### 7.3 Remote Functions
| 項目 | 状態 | 詳細 |
|------|------|------|
| 基本概念 | ✅ | ページ存在（SvelteKit 2.27+） |
| `query` | 🟡 | 基本記述あり。公式の `query.batch()` (v2.35+) N+1問題解決の詳細確認 |
| `form` / `command` | 🟡 | 公式の詳細な使い分けガイド（form=FormData、command=イベントハンドラ）の記述確認 |
| `prerender` | 🟡 | Remote Functionsのビルドタイム実行の記述確認 |
| **Standard Schema** | 🔴 | バリデーションの核心機能。Zod/Valibot等のスキーマ統合の詳細解説が必要 |
| **`.remote.ts` ファイル規約** | 🟡 | ファイル配置ルールと命名規約の記述確認 |

### 7.4 Server-only modules
| 項目 | 状態 | 詳細 |
|------|------|------|
| $lib/server | ✅ | 記述済み |

### 7.5 APIルート設計（api-routes）
| 項目 | 状態 | 詳細 |
|------|------|------|
| GET/POST/PUT/DELETE | ✅ | 記述済み |

### 7.6 WebSocket/SSE
| 項目 | 状態 | 詳細 |
|------|------|------|
| WebSocket/SSE実装 | ✅ | 記述済み |

---

## 第8部：SvelteKit アプリケーション構築（/sveltekit/application/）

### 8.1 状態管理パターン（state-management）
| 項目 | 状態 | 詳細 |
|------|------|------|
| $state + Context | ✅ | 記述済み |
| **`$app/state` 統合** | 🟡 | 公式のSvelteKit固有状態管理（`$app/state` の `page`, `navigating`, `updated`）の記述深度確認 |

### 8.2 Snapshots
| 項目 | 状態 | 詳細 |
|------|------|------|
| capture/restore | ✅ | 記述済み |

### 8.3 認証（authentication / auth-best-practices）
| 項目 | 状態 | 詳細 |
|------|------|------|
| 基本パターン | ✅ | Cookie/Session/JWT記述済み |
| **公式Authガイド** | 🟡 | SvelteKitの公式ドキュメントに `Auth` セクション新設。hooksベースの認証パターン、セッション管理の推奨方法が記載。サイトの内容と一致するか確認 |
| **better-auth** | 🆕 | `sv add better-auth` による公式認証セットアップ。新規言及推奨 |

### 8.4 エラーハンドリング
| 項目 | 状態 | 詳細 |
|------|------|------|
| 現状 | 🟡 | 「準備中」ステータス。公式のexpected/unexpected errorの区別、`App.Error` 型のカスタマイズなど重要な内容あり |

### 8.5 環境変数管理
| 項目 | 状態 | 詳細 |
|------|------|------|
| 現状 | 🟡 | 「準備中」ステータス。$env/static/private、$env/dynamic/public等は公式に詳細な記述あり |

---

## 第9部：SvelteKit 最適化編（/sveltekit/optimization/）

### 9.1 パフォーマンス最適化（performance）
| 項目 | 状態 | 詳細 |
|------|------|------|
| Core Web Vitals | 🟡 | 「準備中」ステータス。公式に `Performance` セクションあり。診断ツール、バンドル分析の記述あり |

### 9.2 ビルド最適化（build-optimization）
| 項目 | 状態 | 詳細 |
|------|------|------|
| Vite設定・chunk分割 | ✅ | 記述済み |

### 9.3 キャッシュ戦略（caching）
| 項目 | 状態 | 詳細 |
|------|------|------|
| Service Worker/CDN | ✅ | 記述済み |

### 9.4 Service Workers / PWA
| 項目 | 状態 | 詳細 |
|------|------|------|
| 基本実装 | ✅ | 記述済み |
| `$service-worker` | ✅ | build/files/version記述済み |

### 9.5 Observability（可観測性）
| 項目 | 状態 | 詳細 |
|------|------|------|
| OpenTelemetry | ✅ | SvelteKit 2.31+として記述済み |
| `instrumentation.server.ts` | ✅ | セットアップ記述済み |

### 9.6 SEO最適化
| 項目 | 状態 | 詳細 |
|------|------|------|
| meta/OGP/構造化データ | 🟡 | 「準備中」だが一部記述あり。公式の `SEO` セクションと比較して補完推奨 |
| **Icons / Images** | 🆕 | 公式に `Icons` と `Images` セクション新設。画像最適化（`@sveltejs/enhanced-img`）、アイコン管理のベストプラクティスあり |

---

## 第10部：SvelteKit デプロイ・運用（/sveltekit/deployment/）

### 10.1 プラットフォーム別デプロイ（platforms）
| 項目 | 状態 | 詳細 |
|------|------|------|
| 基本的なアダプター | ✅ | 記述済み |
| **Zero-config deployments** | 🟡 | 公式の `adapter-auto` の最新対応プラットフォームリスト確認 |
| Cloudflare Workers | 🟡 | `adapter-cloudflare-workers` と `adapter-cloudflare` の使い分け確認 |

### 10.2 Packaging
| 項目 | 状態 | 詳細 |
|------|------|------|
| @sveltejs/package | ✅ | 記述済み |
| `exports` 条件 | 🟡 | package.json の `exports` フィールドの最新ベストプラクティス確認 |

### 10.3 セキュリティ / モニタリング
| 項目 | 状態 | 詳細 |
|------|------|------|
| 現状 | 🟡 | 「準備中」ステータス |

---

## 第11部：CLI ツール（/introduction/cli/）

### 11.1 既存CLIページ
| 項目 | 状態 | 詳細 |
|------|------|------|
| **`sv` CLI体系** | 🔴 | 公式CLIは `sv` に統一（`sv create`, `sv add`, `sv check`, `sv migrate`）。サイトのCLIページが最新構造を反映しているか確認が必要 |
| **`sv add` 公式アドオン一覧** | 🔴 | 12種の公式アドオン：better-auth, drizzle, eslint, **mcp**, mdsvex, paraglide, playwright, prettier, **storybook**, sveltekit-adapter, tailwindcss, vitest。サイトでの網羅確認 |
| **`sv migrate app-state`** | 🔴 | `$app/stores` → `$app/state` の自動移行コマンド。サイトへの記載推奨 |
| **`sv migrate svelte-5`** | 🟡 | Svelte 4→5自動移行。既存記述との整合確認 |
| **コミュニティアドオン** | 🟡 | `npx sv add @org` でコミュニティアドオン追加可能。新機能として言及推奨 |
| **`sv` プログラマティックAPI** | 🟡 | `defineAddon`, `defineAddonOptions` 等のアドオン開発API。高度な用途として言及推奨 |

---

## 第12部：Svelte MCPセクション（/svelte-mcp/）

### 12.1 既存ページ
| 項目 | 状態 | 詳細 |
|------|------|------|
| `sv add mcp` | 🟡 | 公式の `sv add mcp` コマンドが正式にアドオンとして提供。サイトのセットアップガイドとの整合確認 |
| IDE選択肢 | 🟡 | claude-code, cursor, gemini, opencode, vscode 等の最新対応IDE一覧確認 |

---

## 第13部：リファレンス（/reference/）

### 13.1 Svelte 5 完全リファレンス
| 項目 | 状態 | 詳細 |
|------|------|------|
| 全体構成 | 🟡 | 以下の新API/機能の追記が必要な可能性あり |
| `$effect.pending()` | 🔴 | 新API |
| `$state.raw()` 詳細 | 🔴 | 重要なパフォーマンスAPI |
| overridable $derived | 🔴 | Svelte 5.25+の新機能 |
| `@attach` | ✅ | 最近追加 |
| `svelte/events` | 🔴 | 新モジュール |
| `svelte/attachments` | 🟡 | 新モジュール |
| `<svelte:boundary>` pending | 🔴 | 重大更新 |

### 13.2 SvelteKit 2.x 完全リファレンス
| 項目 | 状態 | 詳細 |
|------|------|------|
| Remote Functions | 🔴 | 大幅な新機能 |
| `$app/server` | 🔴 | 新モジュール |
| `$app/types` | 🔴 | 新モジュール |
| `handleValidationError` | 🔴 | 新フック |
| `PageProps`/`LayoutProps` | 🔴 | 新型定義パターン |
| Standard Schema | 🔴 | バリデーション統合 |
| `query.batch()` | 🟡 | v2.35+の新機能 |

---

## 優先度別サマリー

### 🔴 最優先（API変更・読者への影響大）

1. **`<svelte:boundary>` の `pending` snippet** — await expressions対応の中核機能
2. **`$app/server` モジュール** — Remote Functions用の新モジュール
3. **`$app/types` モジュール** — 型安全ルーティングの新モジュール
4. **`PageProps` / `LayoutProps` 型** — Svelte 5でのデータ受け取り推奨パターン変更
5. **`handleValidationError` フック** — 新しいサーバーフック
6. **`$state.raw()` の詳細解説** — パフォーマンス最適化の重要API
7. **Overridable `$derived`** — Svelte 5.25+の新機能
8. **`$effect.pending()`** — 非同期状態追跡の新API
9. **`svelte/events` モジュール** — プログラマティックイベント管理
10. **`sv` CLI体系の最新化** — `sv add` アドオン一覧更新
11. **Standard Schema バリデーション** — Remote Functionsの核心
12. **Remote Functions の `query.batch()`** — N+1問題解決（v2.35+）
13. **`.remote.ts` ファイル規約** — プロジェクト構造への追記
14. **リファレンスページの更新** — 上記全ての反映

### 🟡 中程度（網羅性の向上）

1. `untrack()` / `flushSync()` の解説追加
2. `$inspect().with()` の詳細
3. `$effect.tracking()` / `$effect.root()` の詳細
4. `bind:` / `class:` / `style:` ディレクティブ総合ガイド
5. スコープドCSS / グローバルCSS の独立解説
6. ジェネリックコンポーネント（`generics` 属性）
7. `sv add better-auth` の言及
8. Icons / Images 最適化ガイド
9. 公式 Auth ガイドとの整合
10. ベストプラクティスセクション

### 🆕 新規ページ作成推奨

1. **Project Types ガイド** — SSG/SPA/SSR/Library等の選択ガイド
2. **Icons / Images 最適化** — 公式ガイドに対応
3. **`svelte/events` モジュール** — 基本セクションまたは実践編に追加

---

## 推奨作業順序

1. **リファレンスページ更新**（svelte5 / sveltekit2）— 全体の基盤となる
2. **`<svelte:boundary>` + await expressions 更新** — 連動する2ページ
3. **$app モジュールページ更新** — $app/server, $app/types 追加
4. **Remote Functions ページ充実** — Standard Schema, query.batch() 追加
5. **Runes 各ページ更新** — $state.raw, overridable $derived, $effect.pending
6. **CLI ページ更新** — sv 体系、アドオン一覧
7. **Hooks ページ更新** — handleValidationError 追加
8. **データ取得セクション更新** — PageProps パターン反映
9. **新規ページ作成** — Project Types, svelte/events
10. **準備中ページの着手** — エラーハンドリング、環境変数管理、SEO
