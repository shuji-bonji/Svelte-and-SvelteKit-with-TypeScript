---
title: ルートグループを使った認証システム（計画中）
description: SvelteKit 2.xのルートグループ機能を活用した構造的な認証システムの実装方法。TypeScriptによる型安全な認証境界の構築とメンテナンス性の高い設計パターン
---

<script>
  import Mermaid from '$lib/components/Mermaid.svelte';
  
  const routeGroupStructure = `
graph TB
    subgraph "src/routes/"
        Root["/"]
        
        subgraph "(public) - 認証不要"
            PubLayout["(public)/+layout.svelte"]
            Home["(public)/+page.svelte<br/>ホーム"]
            About["(public)/about/"]
            Blog["(public)/blog/"]
        end
        
        subgraph "(auth) - 認証必須"
            AuthLayout["(auth)/+layout.server.ts<br/>認証チェック"]
            AuthLayoutClient["(auth)/+layout.svelte"]
            Dashboard["(auth)/dashboard/"]
            Profile["(auth)/profile/"]
            Settings["(auth)/settings/"]
        end
        
        subgraph "(admin) - 管理者のみ"
            AdminLayout["(admin)/+layout.server.ts<br/>管理者権限チェック"]
            Users["(admin)/users/"]
            System["(admin)/system/"]
        end
        
        subgraph "認証関連"
            Login["login/+page.svelte"]
            Register["register/+page.svelte"]
        end
    end
    
    Root --> PubLayout
    Root --> AuthLayout
    AuthLayout --> AdminLayout
    Root --> Login
`;

  const authFlowDiagram = `
sequenceDiagram
    participant User as ユーザー
    participant Browser as ブラウザ
    participant SK as SvelteKit
    participant Auth as (auth)/+layout.server.ts
    participant Admin as (admin)/+layout.server.ts
    participant Hook as hooks.server.ts
    participant DB as Database
    
    User->>Browser: /dashboard アクセス
    Browser->>SK: GET /dashboard
    SK->>Hook: handle()実行
    Hook->>DB: セッション検証
    DB->>Hook: ユーザー情報
    Hook->>SK: locals.user設定
    
    SK->>Auth: load()実行
    Auth->>Auth: locals.userチェック
    
    alt 未認証
        Auth->>SK: redirect(303, "/login?from=/dashboard")
        SK->>Browser: ログインページへ
    else 認証済み
        Auth->>SK: return {user}
        SK->>Browser: ダッシュボード表示
    end
    
    Note over User,DB: 管理者ページアクセスの場合
    
    User->>Browser: /users アクセス
    Browser->>SK: GET /users
    SK->>Hook: handle()実行
    Hook->>SK: locals.user設定
    SK->>Auth: parent load()
    Auth->>SK: 認証チェック通過
    SK->>Admin: load()実行
    Admin->>Admin: roles.includes('admin')
    
    alt 管理者権限なし
        Admin->>SK: error(403, "Forbidden")
        SK->>Browser: 403エラーページ
    else 管理者権限あり
        Admin->>SK: return {admin: true}
        SK->>Browser: ユーザー管理ページ
    end
`;
</script>

:::info[計画中]
このページは現在計画中です。ルートグループを使った認証システムの実装例は、2025年11月頃の公開を予定しています。
現在は構想と設計パターンのみを掲載しています。
:::

## 🎯 概要

SvelteKitのルートグループ機能を使用すると、ファイルシステムの構造で認証境界を定義できます。これにより、認証ロジックを集約し、メンテナンス性の高い認証システムを構築できます。ルートグループは、括弧で囲まれたディレクトリ名（例：`(auth)`）を使用して作成され、URLパスには影響を与えずに、ルートをグループ化し、共通のレイアウトやロジックを適用できます。

この方式の最大の利点は、認証要件がディレクトリ構造から一目で分かることです。開発者は、ファイルを配置するディレクトリを選ぶだけで、自動的に適切な認証レベルが適用されます。これにより、認証ロジックの重複を防ぎ、一貫性のある認証システムを構築できます。

## 🏗️ ルートグループ構造

以下の図は、ルートグループを使用した認証システムの全体構造を示しています。各グループ（`(public)`、`(auth)`、`(admin)`）が異なる認証レベルを表し、階層的な権限管理を実現しています。この構造により、URLパスに影響を与えることなく、ファイルシステムレベルで認証境界を明確に定義できます。

<Mermaid chart={routeGroupStructure} />

## 🔐 認証フローのシーケンス

ルートグループベースの認証システムでは、リクエストが複数の層を通過して処理されます。以下のシーケンス図は、一般ユーザーと管理者がそれぞれ保護されたリソースにアクセスする際の認証フローを詳細に示しています。特に注目すべきは、`parent()`関数を使用した認証の継承により、DRY原則を保ちながら段階的な権限チェックを実現している点です。

<Mermaid chart={authFlowDiagram} />

## 📁 ディレクトリ構造の設計

ルートグループを使用した認証システムの核心は、ディレクトリ構造そのものが認証要件を表現することです。以下に示す構造では、3つの主要なグループを定義しています：公開エリア（認証不要）、認証必須エリア（ログインユーザー）、管理者専用エリア（特権ユーザー）。各グループは独自のレイアウトとロジックを持ち、必要に応じて親グループの設定を継承できます。

### 基本構造

ルートグループのディレクトリ名は括弧で囲まれ、URLパスには影響しません。例えば、`(auth)/dashboard/+page.svelte`は`/dashboard`としてアクセスされます。これにより、URL構造を変えることなく、認証ロジックを組織化できます。

```
src/routes/
├── (public)/              # 🌐 認証不要エリア
│   ├── +layout.svelte     # 公開用レイアウト
│   ├── +page.svelte       # ホームページ
│   ├── about/
│   │   └── +page.svelte
│   ├── blog/
│   │   ├── +page.svelte
│   │   └── [slug]/
│   │       └── +page.svelte
│   └── pricing/
│       └── +page.svelte
│
├── (auth)/                # 🔒 認証必須エリア
│   ├── +layout.server.ts  # 認証チェック
│   ├── +layout.svelte     # 認証済みレイアウト
│   ├── dashboard/
│   │   └── +page.svelte
│   ├── profile/
│   │   ├── +page.svelte
│   │   └── +page.server.ts
│   └── settings/
│       ├── +page.svelte
│       └── +page.server.ts
│
├── (admin)/               # 👑 管理者専用エリア
│   ├── +layout.server.ts  # 管理者権限チェック
│   ├── +layout.svelte
│   ├── users/
│   │   ├── +page.svelte
│   │   └── [id]/
│   │       └── +page.svelte
│   └── system/
│       └── +page.svelte
│
├── login/                 # 認証ページ（グループ外）
│   ├── +page.svelte
│   └── +page.server.ts
├── register/
│   ├── +page.svelte
│   └── +page.server.ts
└── logout/
    └── +server.ts
```

## 🛠 実装パターン（構想）

以下の実装パターンは、ルートグループを使用した認証システムの構想です。実際の実装では、各層で異なる認証ロジックを適用し、必要に応じて親層の認証を継承します。この階層的なアプローチにより、複雑な権限管理をシンプルかつ保守しやすい形で実現できます。

### 1. 認証チェック層 `(auth)/+layout.server.ts`

認証が必要なすべてのページに適用される基本的な認証チェックです。このファイルは`(auth)`グループ内のすべてのルートで自動的に実行され、未認証ユーザーをログインページへリダイレクトします。

```typescript
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url, cookies }) => {
  // hooks.server.tsで設定されたlocals.userを確認
  // localsはリクエスト全体で共有されるオブジェクトで、
  // 認証情報を保持するのに最適な場所です
  if (!locals.user) {
    // 未認証の場合、現在のURLを保存してログインページへリダイレクト
    // fromパラメータにより、ログイン後に元のページに戻れます
    const redirectTo = url.pathname + url.search;
    throw redirect(303, `/login?from=${encodeURIComponent(redirectTo)}`);
  }
  
  // 認証済みユーザー情報を子コンポーネントに渡す
  // この情報は+page.svelteやその他の子コンポーネントで利用可能
  return {
    user: locals.user,
    session: locals.session
  };
};
```

### 2. 管理者権限チェック層 `(admin)/+layout.server.ts`

管理者専用エリアのための追加の権限チェックです。このファイルは`(auth)`グループの認証チェックを継承しつつ、さらに管理者権限を確認します。

```typescript
import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, parent }) => {
  // parent()関数を呼び出すことで、親グループ（auth）のload関数を実行
  // これにより、まず基本的な認証チェックが行われます
  // 認証されていない場合は、この時点でリダイレクトされます
  const parentData = await parent();
  
  // 認証チェックをパスした後、追加で管理者権限を確認
  // rolesプロパティがない、またはadminロールを持たない場合は拒否
  if (!locals.user?.roles?.includes('admin')) {
    // 403 Forbiddenエラーを投げることで、権限不足を明示
    // 401（Unauthorized）ではなく403を使うのは、
    // 認証済みだが権限が不足していることを示すため
    throw error(403, {
      message: '管理者権限が必要です',
      code: 'ADMIN_REQUIRED'
    });
  }
  
  // 親データを継承しつつ、管理者固有の情報を追加
  return {
    ...parentData,
    admin: true,
    adminPermissions: locals.user.permissions
  };
};
```

### 3. 役割ベースのルートグループ

より柔軟な権限管理のために、動的な役割チェックを実装することも可能です。以下は、URLパラメータから役割を取得して権限を確認する例です。

```typescript
// src/routes/(role-[role])/+layout.server.ts
// 動的な役割チェック（例：(role-editor)、(role-viewer)等）
// この方式により、新しい役割を追加する際に新しいコードを書く必要がありません

import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, parent, params }) => {
  const parentData = await parent();
  
  // URLパラメータから必要な役割を動的に取得
  // 例：(role-editor)の場合、params.role = 'editor'
  const requiredRole = params.role;
  
  // ユーザーが必要な役割を持っているか確認
  if (!locals.user?.roles?.includes(requiredRole)) {
    throw error(403, {
      message: `${requiredRole}権限が必要です`,
      code: 'INSUFFICIENT_PERMISSION'
    });
  }
  
  // 役割情報を追加して返す
  return {
    ...parentData,
    role: requiredRole
  };
};
```

## 🎨 レイアウトの継承と構成

ルートグループごとに異なるレイアウトを定義することで、各認証レベルに適したUI/UXを提供できます。以下の例では、公開エリアと認証済みエリアで異なるナビゲーションとレイアウト構造を実装しています。

### 公開レイアウト `(public)/+layout.svelte`

公開エリア用のシンプルなレイアウトです。ヘッダー、フッター、メインコンテンツエリアを含みます。

```svelte
<script lang="ts">
  import Header from '$lib/components/PublicHeader.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import type { Snippet } from 'svelte';
  
  // Svelte 5の新しいprops構文を使用
  // childrenはSnippet型で、子コンポーネントのコンテンツを表します
  let { children }: { children?: Snippet } = $props();
</script>

<div class="public-layout">
  <!-- 公開用ヘッダー：ログインリンクなどを含む -->
  <Header />
  
  <main>
    <!-- 子ページのコンテンツをレンダリング -->
    {@render children?.()}
  </main>
  
  <!-- 共通フッター -->
  <Footer />
</div>
```

### 認証済みレイアウト `(auth)/+layout.svelte`

認証済みユーザー向けのレイアウトです。サイドバー、ユーザーメニューなど、より豊富なナビゲーション要素を含みます。

```svelte
<script lang="ts">
  import Sidebar from '$lib/components/Sidebar.svelte';
  import UserMenu from '$lib/components/UserMenu.svelte';
  import type { PageData } from './$types';
  import type { Snippet } from 'svelte';
  
  // load関数から渡されたデータ（ユーザー情報を含む）を受け取る
  let { data, children }: { data: PageData; children?: Snippet } = $props();
</script>

<div class="authenticated-layout">
  <!-- ユーザー固有のナビゲーションを表示するサイドバー -->
  <Sidebar user={data.user} />
  
  <div class="content">
    <!-- ユーザープロファイルとログアウトオプションを含むメニュー -->
    <UserMenu user={data.user} />
    
    <main>
      <!-- 子ページのコンテンツ -->
      {@render children?.()}
    </main>
  </div>
</div>
```

## 🔑 型安全性の確保

TypeScriptを使用することで、認証システム全体で型安全性を保証できます。以下の型定義により、開発時にエラーを検出し、実行時エラーを防ぎます。

### app.d.tsでの型定義

SvelteKitのグローバル型定義ファイルで、アプリケーション全体で使用される認証関連の型を定義します。

```typescript
// src/app.d.ts
// SvelteKitのグローバル名前空間を拡張して、
// アプリケーション固有の型を定義します
declare global {
  namespace App {
    // Localsインターフェース：リクエスト全体で共有されるデータ
    interface Locals {
      // ユーザー情報（認証済みの場合のみ存在）
      user?: {
        id: string;
        email: string;
        name: string;
        roles: string[];        // ユーザーの役割（admin、editor等）
        permissions?: string[]; // 詳細な権限リスト（オプション）
      };
      // セッション情報
      session?: {
        id: string;
        expiresAt: Date;       // セッションの有効期限
      };
    }
    
    // PageData：ページコンポーネントに渡されるデータの型
    interface PageData {
      user?: App.Locals['user'];  // ユーザー情報
      admin?: boolean;             // 管理者フラグ
      role?: string;               // 現在の役割
    }
    
    // Error：カスタムエラー情報の型
    interface Error {
      code?: string;       // エラーコード（ADMIN_REQUIRED等）
      details?: unknown;   // 追加のエラー詳細
    }
  }
}

export {};
```

## 🚀 利点と課題

ルートグループベースの認証システムには多くの利点がありますが、同時にいくつかの課題も存在します。実装を検討する際は、これらの特性を理解した上で判断することが重要です。

### 利点

ルートグループ認証の採用により、以下のような開発上の利点が得られます。

1. **構造的な明確性**
   - URLパスを見るだけで認証要件が分かる
   - ディレクトリ構造が認証境界を表現

2. **DRY原則の遵守**
   - 認証ロジックの重複を完全に排除
   - 一箇所で認証ロジックを管理

3. **型安全性**
   - 各グループで異なる型定義が可能
   - TypeScriptによる厳密な型チェック

4. **段階的な認証**
   - 複数レベルの認証を簡単に実装
   - 役割ベースのアクセス制御（RBAC）

5. **メンテナンス性**
   - 新しい認証レベルの追加が容易
   - 既存の認証ロジックに影響なし

### 課題と解決策

一方で、以下のような課題も存在しますが、それぞれに対する解決策があります。

| 課題 | 解決策 |
|------|--------|
| **URLの冗長性** | リダイレクトルールで短縮URL実装 |
| **複雑な権限管理** | ミドルウェアパターンの採用 |
| **動的な権限変更** | リアルタイムでのセッション更新 |
| **テストの複雑化** | モックレイアウトの作成 |

## 🔄 他の認証方式との組み合わせ

ルートグループは単独で使用するだけでなく、Cookie/SessionやJWT認証と組み合わせて使用できます。これにより、それぞれの認証方式の長所を活かしながら、構造的に整理された認証システムを構築できます。

```typescript
// Cookie/Session + ルートグループの組み合わせ
// (auth)/+layout.server.ts
// Cookie/Session認証の安全性とルートグループの構造的明確性を両立
export const load: LayoutServerLoad = async ({ cookies }) => {
  // Cookieからセッショントークンを取得して検証
  const session = await validateSession(cookies.get('session'));
  if (!session) {
    // 未認証の場合はログインページへリダイレクト
    throw redirect(303, '/login');
  }
  // 認証済みユーザー情報を返す
  return { user: session.user };
};

// JWT + ルートグループの組み合わせ
// (api)/+layout.server.ts
// APIルート専用のJWT認証をルートグループで管理
export const load: LayoutServerLoad = async ({ request }) => {
  // AuthorizationヘッダーからBearerトークンを抽出
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  
  // JWTトークンを検証
  const user = await verifyJWT(token);
  if (!user) {
    // 401 Unauthorizedエラーを返す（APIなのでリダイレクトしない）
    throw error(401, 'Unauthorized');
  }
  
  return { user };
};
```

## 📚 参考実装パターン

実際のプロジェクトでルートグループ認証を活用する際の参考パターンです。これらのパターンは、異なるタイプのアプリケーションに最適化されています。

### パターン1: 企業向けSaaS

企業向けSaaSアプリケーションでは、明確な権限分離が重要です。

```
(public)/       # マーケティングサイト
(app)/          # アプリケーション（認証必須）
(admin)/        # 管理画面
(api)/          # APIエンドポイント
```

### パターン2: Eコマース

Eコマースサイトでは、購買フローに応じた段階的な認証が必要です。

```
(shop)/         # 商品閲覧（認証不要）
(account)/      # アカウント管理（認証必須）
(checkout)/     # 決済（部分認証）
(vendor)/       # 出品者管理
```

### パターン3: コンテンツプラットフォーム

コンテンツプラットフォームでは、役割に応じた異なるインターフェースを提供します。

```
(browse)/       # コンテンツ閲覧
(member)/       # メンバー限定
(creator)/      # クリエイター管理
(moderator)/    # モデレーター
```

## 🎓 実装予定の機能

完全な実装例の公開時には、以下の高度な機能も含める予定です。

1. **ミドルウェアチェーン**
   - 複数の認証条件を組み合わせ
   - カスタム認証ロジックの追加

2. **権限の継承と上書き**
   - 親グループの権限を継承
   - 特定ページでの権限上書き

3. **動的ルートグループ**
   - パラメータベースの権限チェック
   - 条件付きレンダリング

4. **認証状態の同期**
   - タブ間での認証状態共有
   - リアルタイム権限更新

## 🔗 関連ドキュメント

ルートグループ認証の理解を深めるために、以下のドキュメントも参照してください。

- [Cookie/Session認証](/examples/auth-cookie-session/) - 実装済み
- [JWT認証](/examples/auth-jwt/) - 準備中
- [認証システム概要](/examples/auth-system/) - 比較と選択ガイド
- [SvelteKitルーティング](/sveltekit/routing/) - ルーティングの基礎

## まとめ

ルートグループを使った認証システムは、SvelteKitの強力な機能を活用して、構造的で保守性の高い認証システムを構築する最良の方法の一つです。ディレクトリ構造が認証要件を明確に表現することで、開発者は直感的に理解でき、新しいメンバーのオンボーディングも容易になります。

このパターンは特に以下のようなプロジェクトで威力を発揮します。

- **大規模なエンタープライズアプリケーション** - 多数の開発者が関わるプロジェクトで、認証ロジックの一貫性を保つ
- **複雑な権限管理が必要なシステム** - 役割ベースのアクセス制御（RBAC）を段階的に実装
- **長期的なメンテナンスを考慮したプロジェクト** - 認証要件の変更や追加が容易で、技術的負債を最小限に抑える

:::tip[実装のヒント]
実際の実装では、まず簡単な2層構造（public/auth）から始めて、必要に応じて管理者層やその他の役割を追加していくことをお勧めします。最初から完璧な構造を作ろうとせず、プロジェクトの成長に合わせて段階的に拡張していくアプローチが成功の鍵です。

また、ルートグループはCookie/SessionやJWT認証と組み合わせて使用できるため、既存の認証システムがある場合でも、段階的に移行することが可能です。
:::

---

*完全な実装例は2025年11月頃に公開予定です。それまでは[Cookie/Session認証](/examples/auth-cookie-session/)の実装例を参考にしてください。*