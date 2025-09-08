---
title: 認証システム実装ガイド
description: SvelteKit 2.xとTypeScriptで実装する認証システムの完全ガイド。Cookie/Session、JWT、ルートグループを使った認証パターンの比較と実装方法を解説
---

<script>
  import Mermaid from '$lib/components/Mermaid.svelte';
  
  const authArchitecture = `
graph TB
    subgraph "Client"
        Browser[ブラウザ]
    end
    
    subgraph "SvelteKit Server"
        Hooks[hooks.server.ts]
        Load[+page.server.ts]
        Actions[Form Actions]
        API[API Routes]
    end
    
    subgraph "認証方式"
        Cookie[Cookie/Session]
        JWT[JWT Token]
        OAuth[OAuth 2.0]
    end
    
    subgraph "Storage"
        DB[(Database)]
        Redis[(Redis/Cache)]
    end
    
    Browser -->|Request| Hooks
    Hooks -->|認証チェック| Cookie
    Hooks -->|認証チェック| JWT
    Hooks -->|認証チェック| OAuth
    
    Cookie -->|Session ID| DB
    JWT -->|Token検証| API
    OAuth -->|外部認証| API
    
    Load -->|データ取得| DB
    Actions -->|フォーム処理| DB
    API -->|CRUD操作| DB
    
    DB -.->|キャッシュ| Redis
`;

  const authFlowComparison = `
graph TB
    subgraph "Cookie/Session"
        direction TB
        CS1[ログイン] --> CS2[Session作成]
        CS2 --> CS3[Cookie設定]
        CS3 --> CS4[HTTPOnly]
    end
    
    subgraph "JWT"
        direction TB
        JWT1[ログイン] --> JWT2[Token生成]
        JWT2 --> JWT3[Client保存]
        JWT3 --> JWT4[Header送信]
    end
    
    subgraph "ルートグループ"
        direction TB
        RG1["/(auth)/"] --> RG2[+layout.server.ts]
        RG2 --> RG3[認証チェック]
        RG3 --> RG4[保護されたページ]
    end
`;
</script>

このセクションでは、SvelteKit 2.xとTypeScriptを使用した様々な認証システムの実装方法を解説します。用途に応じて最適な認証方式を選択してください。

## 🏗️ 認証システムアーキテクチャ

SvelteKitの認証システムは、クライアント、サーバー、ストレージの3層構造で構成されます。以下の図は、各コンポーネントがどのように連携して認証を実現するかを示しています。hooks.server.tsがすべてのリクエストを受け取り、適切な認証方式（Cookie/Session、JWT、OAuth）で検証を行います。

<Mermaid chart={authArchitecture} />

## 📊 認証方式の比較

各認証方式には異なる特徴があり、それぞれ独自のフローを持ちます。Cookie/Session認証はサーバー側でセッション管理を行い、JWT認証はクライアント側でトークンを管理し、ルートグループ認証はSvelteKitのルーティング機能を活用して構造的に認証を実装します。

<Mermaid chart={authFlowComparison} />

## 🔐 実装可能な認証パターン

### 1. [Cookie/Session認証](/examples/auth-cookie-session/)

#### 特徴
- ✅ **最も安全** - HTTPOnlyクッキーによるXSS対策
- ✅ **シンプル** - SvelteKitの標準機能で実装可能
- ✅ **即座に無効化可能** - サーバー側でセッション管理
- ⚠️ スケーラビリティに課題（セッションストア必要）

#### 推奨用途
- 中小規模のWebアプリケーション
- セキュリティ要件が高いシステム
- SSRメインのアプリケーション

**実装状態**： ✅ **完成** - 完全な実装例とデモあり

### 2. [JWT認証](/examples/auth-jwt/)

#### 特徴
- ✅ **ステートレス** - サーバー側でセッション管理不要
- ✅ **スケーラブル** - 複数サーバー間で共有容易
- ✅ **マイクロサービス対応** - API間での認証共有
- ⚠️ トークンの無効化が困難
- ⚠️ XSS攻撃のリスク

#### 推奨用途
- マイクロサービスアーキテクチャ
- モバイルアプリのバックエンド
- 複数ドメイン間での認証共有

**実装状態**： ⏳ **準備中** - 2025年10月公開予定

### 3. [ルートグループ認証](/examples/auth-route-groups/)

#### 特徴
- ✅ **構造的** - ファイルシステムベースの認証境界
- ✅ **型安全** - TypeScriptによる厳密な型チェック
- ✅ **メンテナンス性** - 認証ロジックの集約
- ✅ **柔軟性** - 複数の認証戦略を併用可能

#### 推奨用途
- 大規模アプリケーション
- 複数の認証レベルが必要なシステム
- 管理画面と公開ページの分離

**実装状態**： 📝 **計画中** - 実装構想を以下に記載

## 🎯 認証方式の選択ガイド

以下の表は、各認証方式の特徴を要件ごとに評価したものです。プロジェクトの要件と優先順位に基づいて、最適な認証方式を選択してください。⭐の数が多いほど、その要件に対して優れていることを示します。

| 要件 | Cookie/Session | JWT | ルートグループ |
|------|---------------|-----|--------------|
| **セキュリティ最優先** | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| **実装の簡単さ** | ⭐⭐⭐ | ⭐⭐ | ⭐⭐ |
| **スケーラビリティ** | ⭐ | ⭐⭐⭐ | ⭐⭐ |
| **メンテナンス性** | ⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| **パフォーマンス** | ⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| **柔軟性** | ⭐⭐ | ⭐⭐ | ⭐⭐⭐ |

## 🚀 クイックスタート

### Cookie/Session認証の実装（最も推奨）

Cookie/Session認証は、セキュリティと実装の簡易性のバランスが取れているため、多くのWebアプリケーションに最適です。以下の手順で基本的な認証システムを構築できます。

```bash
# プロジェクト作成
npm create svelte@latest my-auth-app
cd my-auth-app

# 必要なパッケージ
npm install bcryptjs @prisma/client
npm install -D prisma @types/bcryptjs
```

### 基本的な実装ステップ

以下の5つのステップで、堅牢な認証システムを段階的に構築します。各ステップは前のステップに依存しているため、順番に実装することが重要です。

1. **データベースセットアップ**（Prisma） - ユーザーとセッション情報を格納するスキーマを定義
2. **認証ユーティリティの作成**（`src/lib/server/auth.ts`） - パスワードハッシュ化やセッション管理の共通関数
3. **Hooksでのセッション管理**（`src/hooks.server.ts`） - すべてのリクエストで自動的にセッション検証
4. **Form Actionsでの認証処理** - ログイン/ログアウト/登録のサーバーサイド処理
5. **保護されたページの実装** - 認証が必要なページへのアクセス制御

詳細は[Cookie/Session認証ガイド](/examples/auth-cookie-session/)を参照してください。

## 🔮 ルートグループ認証の構想

ルートグループ認証は、SvelteKitのルーティングシステムを活用して、ディレクトリ構造で認証境界を定義する強力なパターンです。この方式により、認証ロジックを一箇所に集約し、メンテナンス性を大幅に向上させることができます。

### 基本構造

以下のディレクトリ構造により、公開ページ、認証必須ページ、管理者専用ページを明確に分離します。

```
src/routes/
├── (public)/          # 認証不要
│   ├── +layout.svelte
│   ├── +page.svelte   # ホーム
│   ├── about/
│   └── blog/
├── (auth)/            # 認証必須
│   ├── +layout.server.ts  # 認証チェック
│   ├── +layout.svelte
│   ├── dashboard/
│   ├── profile/
│   └── settings/
└── (admin)/           # 管理者のみ
    ├── +layout.server.ts  # 管理者権限チェック
    ├── users/
    └── system/
```

### 実装アイデア

各ルートグループの`+layout.server.ts`ファイルで認証チェックを実装することで、そのグループ内のすべてのページに自動的に認証が適用されます。

```typescript
// src/routes/(auth)/+layout.server.ts
// 認証が必要なページグループの基本認証チェック
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
  // 認証チェック
  if (!locals.user) {
    throw redirect(303, `/login?from=${url.pathname}`);
  }
  
  return {
    user: locals.user
  };
};
```

```typescript
// src/routes/(admin)/+layout.server.ts
// 管理者権限が必要なページグループの権限チェック
import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, parent }) => {
  await parent(); // (auth)の認証チェックを継承
  
  // 管理者権限チェック
  if (!locals.user?.roles?.includes('admin')) {
    throw error(403, 'Forbidden');
  }
  
  return {
    admin: true
  };
};
```

### 利点

ルートグループ認証パターンには以下の重要な利点があります。

1. **構造的な認証境界** - ディレクトリ構造を見るだけで認証要件が一目瞭然
2. **DRY原則** - 認証ロジックを各ページで繰り返す必要がなく、一箇所で管理
3. **型安全性** - TypeScriptの型システムにより、各グループで異なる型定義が可能
4. **段階的な認証** - 公開→認証必須→管理者のような複数レベルの認証を簡単に実装

## 🔒 セキュリティのベストプラクティス

認証システムのセキュリティは、アプリケーション全体の安全性を左右する重要な要素です。以下のベストプラクティスを実装することで、一般的な攻撃から保護できます。

### 共通の対策

すべての認証方式で実装すべき基本的なセキュリティ対策

1. **HTTPS必須** - 本番環境では必ずHTTPS使用
2. **CSRF対策** - SvelteKitのForm Actionsが自動対策
3. **入力検証** - サーバー側で必ず検証
4. **レート制限** - ブルートフォース攻撃対策

### Cookie/Session特有の対策

Cookie/Session認証では、以下の設定により高いセキュリティを実現できます。

```typescript
// セキュアなクッキー設定の例
cookies.set('session', token, {
  httpOnly: true,    // XSS対策
  secure: true,      // HTTPS必須
  sameSite: 'lax',  // CSRF対策
  maxAge: 60 * 60 * 24 * 7  // 有効期限
});
```

### JWT特有の対策

JWT認証を安全に実装するための重要な対策

- **リフレッシュトークンの実装** - 短期間のアクセストークンと長期間のリフレッシュトークンを併用
- **トークンのブラックリスト管理** - 無効化したトークンをRedis等で管理し、ログアウト機能を実現
- **短い有効期限の設定** - アクセストークンは15分、リフレッシュトークンは7日程度に設定
- **署名アルゴリズムの選択** - RS256等の非対称鍵暗号を使用してセキュリティを強化

## 📚 関連リソース

### 実装済みの例
- [Cookie/Session認証](/examples/auth-cookie-session/) - 完全な実装例
- [svelte5-auth-basic](https://github.com/shuji-bonji/svelte5-auth-basic) - GitHubリポジトリ
- [デモサイト](https://svelte5-auth-basic.vercel.app) - 動作確認

### 公式ドキュメント
- [SvelteKit Hooks](https://kit.svelte.dev/docs/hooks)
- [SvelteKit Form Actions](https://kit.svelte.dev/docs/form-actions)
- [SvelteKit Routing](https://kit.svelte.dev/docs/routing)

### セキュリティリファレンス
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [OWASP Session Management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)

## 🎓 学習パス

認証システムの実装スキルを段階的に習得するための推奨学習順序

1. **初級** → [Cookie/Session認証](/examples/auth-cookie-session/)から始める
   - 基本的な認証の仕組みを理解
   - Form ActionsとHooksの使い方を習得
   
2. **中級** → JWT認証の理解と実装（準備中）
   - トークンベース認証の概念を学習
   - クライアント側のトークン管理を実装
   
3. **上級** → ルートグループを使った複雑な認証パターン（計画中）
   - 構造的な認証境界の設計
   - 複数の認証レベルの実装
   
4. **応用** → OAuth 2.0、SAML、多要素認証（将来予定）
   - 外部認証プロバイダーとの統合
   - エンタープライズレベルのセキュリティ実装

## まとめ

SvelteKitでの認証システム実装は、アプリケーションの要件に応じて最適な方式を選択することが重要です。セキュリティと使いやすさのバランスを考慮し、段階的に実装を進めることをお勧めします。本ガイドで紹介した3つの認証パターンはそれぞれ異なる強みを持ち、Cookie/Session認証は高いセキュリティを、JWT認証はスケーラビリティを、ルートグループ認証は構造的な明確性を提供します。

まずは[Cookie/Session認証](/examples/auth-cookie-session/)から始めて、SvelteKitの認証パターンを理解した後、より高度な実装に挑戦してください。実装の過程で生じる疑問や課題については、公式ドキュメントやコミュニティリソースを活用することで、より堅牢な認証システムを構築できるでしょう。