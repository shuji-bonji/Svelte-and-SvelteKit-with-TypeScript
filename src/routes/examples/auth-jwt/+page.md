---
title: JWT認証システム（準備中）
description: SvelteKit 2.xとTypeScriptで実装するJWT（JSON Web Token）ベースの認証システム完全ガイド。トークン管理、リフレッシュトークン、セキュリティ実装パターン
---

<script>
  import Mermaid from '$lib/components/Mermaid.svelte';
  
  // Mermaidチャート定義
  const loginTokenFlow = `
sequenceDiagram
    participant Browser as ブラウザ
    participant SK as SvelteKit
    participant API as API Route
    participant Auth as Auth Service
    participant Store as Token Store
    
    Browser->>SK: /login アクセス
    SK->>Browser: ログインフォーム表示
    
    Browser->>SK: 認証情報送信<br/>(email, password)
    SK->>API: POST /api/auth/login
    
    API->>Auth: ユーザー認証
    
    alt 認証成功
        Auth->>Auth: JWT生成<br/>- Access Token (15分)<br/>- Refresh Token (7日)
        Auth->>API: {accessToken, refreshToken}
        API->>Store: Refresh Token保存
        API->>SK: 200 OK + Tokens
        SK->>Browser: トークン保存<br/>- Access: Memory/Store<br/>- Refresh: HttpOnly Cookie
    else 認証失敗
        Auth->>API: 401 Unauthorized
        API->>SK: エラーレスポンス
        SK->>Browser: エラー表示
    end
`;

  const apiAccessFlow = `
sequenceDiagram
    participant Browser as ブラウザ
    participant SK as SvelteKit
    participant Hooks as hooks.client.ts
    participant API as API Route
    participant Auth as Auth Service
    
    Browser->>SK: 保護されたリソースへアクセス
    
    SK->>Hooks: fetch interceptor
    Hooks->>Hooks: Access Token取得
    Hooks->>SK: Authorizationヘッダー追加
    
    SK->>API: GET /api/protected<br/>Authorization: Bearer {token}
    
    API->>Auth: JWT検証
    
    alt トークン有効
        Auth->>API: ユーザー情報
        API->>SK: 200 OK + データ
        SK->>Browser: データ表示
    else トークン期限切れ
        Auth->>API: 401 Token Expired
        API->>SK: トークン期限切れ
        SK->>SK: Refresh Token使用
        note over SK: 自動トークン更新フロー
    else トークン無効
        Auth->>API: 401 Invalid Token
        API->>SK: 認証エラー
        SK->>Browser: ログインページへ
    end
`;

  const tokenRefreshFlow = `
sequenceDiagram
    participant Browser as ブラウザ
    participant SK as SvelteKit
    participant API as API Route
    participant Auth as Auth Service
    participant Store as Token Store
    
    Note over Browser,Store: Access Token期限切れ検出
    
    SK->>API: POST /api/auth/refresh<br/>Cookie: refreshToken={token}
    
    API->>Store: Refresh Token検証
    
    alt Refresh Token有効
        Store->>API: ユーザー情報
        API->>Auth: 新しいJWT生成
        Auth->>API: {newAccessToken, newRefreshToken}
        API->>Store: Refresh Token更新
        API->>SK: 200 OK + 新トークン
        SK->>Browser: トークン更新<br/>リクエスト再実行
    else Refresh Token無効/期限切れ
        Store->>API: Invalid/Expired
        API->>SK: 401 Unauthorized
        SK->>Browser: ログインページへ
    end
`;
</script>

:::warning[準備中]
このページは現在準備中です。JWT認証システムの実装例は近日公開予定です。
:::

## 🎯 概要

JWT（JSON Web Token）認証は、ステートレスなトークンベースの認証方式で、マイクロサービスアーキテクチャやSPAに適した認証システムです。トークンにユーザー情報を含めることができるため、サーバー側でセッション情報を保持する必要がなく、水平スケーリングが容易になります。

### JWTの特徴

JWTは3つの部分（Header、Payload、Signature）から構成され、`.`で区切られたBase64エンコード文字列として表現されます。

| 特徴 | 説明 |
|------|------|
| **ステートレス** | サーバー側でセッション管理不要、トークン自体が認証情報を持つ |
| **スケーラブル** | 複数サーバー間で共有可能、ロードバランサーの設定が簡単 |
| **自己完結型** | トークン内にユーザー情報を含む、DBアクセスを削減 |
| **標準規格** | RFC 7519で定義された標準、多くのライブラリでサポート |

## 🔐 JWT認証フローのシーケンス図

### ログインとトークン発行

ユーザーがログイン情報を送信してから、JWTトークンペア（Access TokenとRefresh Token）が発行されるまでの流れを示します。Access Tokenは短期間（15分程度）、Refresh Tokenは長期間（7日程度）有効に設定します。

<Mermaid chart={loginTokenFlow} />

### APIアクセスとトークン検証

保護されたAPIエンドポイントにアクセスする際の、JWTトークン検証フローを示します。クライアント側のhooksを使用してAuthorizationヘッダーを自動追加し、サーバー側でトークンの有効性を検証します。

<Mermaid chart={apiAccessFlow} />

### トークンリフレッシュフロー

Access Tokenの有効期限が切れた際に、Refresh Tokenを使用して新しいトークンペアを取得する流れを示します。この仕組みにより、ユーザーは頻繁にログインし直す必要がなくなります。

<Mermaid chart={tokenRefreshFlow} />

## 🛠 実装プレビュー（準備中）

### JWTトークンの構造

```typescript
// JWTペイロードの型定義
// JWTの標準クレーム（claims）とカスタムクレームを含む
interface JWTPayload {
  // 標準クレーム
  sub: string;        // Subject - ユーザーの一意識別子（通常はユーザーID）
  email: string;      // ユーザーのメールアドレス
  name?: string;      // ユーザーの表示名（オプション）
  roles?: string[];   // ユーザーが持つロール（admin, user等）
  iat: number;        // Issued At - トークン発行時刻（Unix時間）
  exp: number;        // Expiration Time - トークン有効期限（Unix時間）
  jti?: string;       // JWT ID - トークンの一意識別子（リボーク管理用）
}

// トークンペアの型定義
// Access TokenとRefresh Tokenのペアを管理
interface TokenPair {
  accessToken: string;   // APIアクセス用の短期間有効トークン（15分）
  refreshToken: string;  // トークン更新用の長期間有効トークン（7日）
  expiresIn: number;     // Access Tokenの有効期限（秒単位、900 = 15分）
}
```

### セキュリティ考慮事項

JWT実装時は特にセキュリティに注意を払う必要があります。トークンベースの認証は便利ですが、適切に実装しないと重大なセキュリティリスクを招きます。

:::caution[セキュリティ注意点]
JWT実装時は以下のセキュリティリスクに注意が必要です。
- **XSS攻撃によるトークン窃取**: localStorageに保存すると悪意のあるスクリプトからアクセス可能
- **トークンの無効化が困難**: 一度発行したトークンをサーバー側で無効化するにはブラックリストが必要
- **トークンサイズによるパフォーマンス影響**: ペイロードが大きいとリクエストごとのオーバーヘッドが増加
- **秘密鍵の管理**: 署名検証用の秘密鍵が漏洩すると、攻撃者が任意のトークンを作成可能
:::

## 🔑 JWT vs Cookie/Session比較

それぞれの認証方式には長所と短所があり、アプリケーションの要件に応じて選択する必要があります。

| 観点 | JWT | Cookie/Session |
|------|-----|----------------|
| **状態管理** | ステートレス（サーバーに状態を持たない） | ステートフル（セッション情報をサーバーで管理） |
| **スケーラビリティ** | 優秀（サーバー間共有容易、ロードバランサー設定不要） | 要セッションストア（Redis等の共有ストレージが必要） |
| **セキュリティ** | XSSリスクあり（localStorage保存時） | HTTPOnlyで安全（JavaScriptからアクセス不可） |
| **無効化** | 困難（ブラックリスト必要、即座の無効化不可） | 即座に可能（セッション削除で即無効化） |
| **パフォーマンス** | トークンサイズ大（1KB〜数KB） | Cookie小さい（数十バイト） |
| **実装複雑度** | 中〜高（トークン管理、更新ロジックが複雑） | 低〜中（標準的な実装パターン） |

## 📊 推奨される使用ケース

アプリケーションの特性やアーキテクチャに応じて、適切な認証方式を選択することが重要です。

### JWT認証が適している場合

以下のようなケースではJWT認証が効果的です。

- **マイクロサービスアーキテクチャ**: サービス間でトークンを共有し、それぞれが独立して検証可能
- **モバイルアプリのバックエンド**: トークンベースでステートレスなAPI設計が可能
- **複数ドメイン間での認証共有**: CORSの制約を受けずにトークンを共有
- **ステートレスなAPI設計**: RESTfulの原則に従った設計が可能
- **サーバーレスアーキテクチャ**: Lambda等の関数単位での認証処理

### Cookie/Session認証が適している場合

以下のようなケースではCookie/Session認証が推奨されます。

- **従来型のWebアプリケーション**: サーバーサイドレンダリング中心のアプリ
- **セキュリティ要件が高い**: 金融系、医療系など高度なセキュリティが必要
- **セッション管理が重要**: ユーザーの活動状態を詳細に追跡する必要がある
- **SSRメインのアプリケーション**: SvelteKitのSSR機能を最大限活用
- **即座のログアウトが必要**: セッション無効化で即座にアクセス拒否

## 🚧 実装予定内容

以下の内容を含む完全な実装例を準備中です。

### 1. JWT生成と検証
   - **jsonwebtokenライブラリ**: 業界標準のJWTライブラリを使用
   - **RS256アルゴリズム**: 公開鍵暗号方式による安全な署名
   - **鍵管理**: 環境変数による秘密鍵の安全な管理

### 2. トークン管理
   - **Access/Refresh Token**: 短期・長期トークンの二重構造
   - **自動更新メカニズム**: 401エラー時の自動リトライ
   - **トークン保存戦略**: メモリ vs localStorage vs Cookie

### 3. セキュア実装
   - **XSS対策**: HTTPOnly Cookieとセキュアなトークン保存
   - **CSRF対策**: SameSite Cookieとトークン検証
   - **トークンブラックリスト**: Redisを使用した無効化リスト
   - **Rate Limiting**: ブルートフォース攻撃への対策

### 4. SvelteKit統合
   - **カスタムhooks**: hooks.server.tsでの認証ミドルウェア
   - **API route保護**: +server.tsでのトークン検証
   - **クライアント側ストア**: Svelte storeでのトークン状態管理
   - **自動インターセプター**: fetchラッパーによるヘッダー自動追加

### 5. 実践的な機能
   - **ロールベースアクセス制御（RBAC）**: admin、user等の権限管理
   - **マルチデバイス対応**: デバイスごとのトークン管理
   - **ログアウト処理**: 全デバイスログアウトオプション
   - **セッション管理UI**: アクティブセッション一覧と管理

## 📚 参考リソース

- [JWT.io](https://jwt.io/) - JWT仕様とデバッガー
- [RFC 7519](https://datatracker.ietf.org/doc/html/rfc7519) - JWT標準仕様
- [OWASP JWT Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)

## 🔄 関連ページ

- [Cookie/Session認証](/examples/auth-cookie-session/) - 実装済み
- OAuth 2.0認証 - 準備中
- 認証システムのテスト - 準備中

---

:::info[公開予定]
JWT認証システムの完全な実装例は、2025年10月頃の公開を予定しています。
Cookie/Session認証の実装例は[こちら](/examples/auth-cookie-session/)でご覧いただけます。
:::