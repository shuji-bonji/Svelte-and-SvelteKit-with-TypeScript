---
title: Cookie/Sessionベース認証システム
description: SvelteKit 2.xとTypeScriptで実装するCookie/Sessionベースの認証システム完全ガイド。セッション管理、Form Actions、Hooksを使った実装パターンとシーケンス図で学ぶ
---

<script>
  import Mermaid from '$lib/components/Mermaid.svelte';
  
  // Mermaidチャート定義
  const registrationFlow = `
sequenceDiagram
    participant Browser as ブラウザ
    participant SK as SvelteKit
    participant FA as Form Actions
    participant DB as Database
    participant Cookie as HTTPOnly Cookie
    
    Browser->>SK: /register アクセス
    SK->>Browser: 登録フォーム表示
    
    Browser->>SK: フォーム送信<br/>(email, password, name)
    SK->>FA: POSTリクエスト
    
    FA->>FA: バリデーション<br/>- メール形式<br/>- パスワード長<br/>- 確認一致
    
    alt バリデーションエラー
        FA->>SK: fail(400, {error})
        SK->>Browser: エラー表示
    else バリデーション成功
        FA->>DB: 既存ユーザー確認
        alt ユーザー存在
            DB->>FA: 既存ユーザー
            FA->>SK: fail(400, {error: "登録済み"})
            SK->>Browser: エラー表示
        else 新規ユーザー
            FA->>FA: bcrypt.hash(password)
            FA->>DB: ユーザー作成
            DB->>FA: user
            FA->>DB: セッション作成<br/>(7日間有効)
            DB->>FA: session
            FA->>Cookie: setSessionCookie()
            FA->>SK: redirect(303, "/dashboard")
            SK->>Browser: ダッシュボードへ<br/>Cookie設定済み
        end
    end
`;

  const loginFlow = `
sequenceDiagram
    participant Browser as ブラウザ
    participant SK as SvelteKit
    participant FA as Form Actions
    participant DB as Database
    participant Cookie as HTTPOnly Cookie
    
    Browser->>SK: /login アクセス
    SK->>Browser: ログインフォーム表示
    
    Browser->>SK: フォーム送信<br/>(email, password)
    SK->>FA: POSTリクエスト
    
    FA->>DB: getUserByEmail(email)
    
    alt ユーザー不在
        DB->>FA: null
        FA->>SK: fail(401, {error})
        SK->>Browser: エラー表示
    else ユーザー存在
        DB->>FA: user
        FA->>FA: bcrypt.compare()<br/>パスワード検証
        
        alt パスワード不一致
            FA->>SK: fail(401, {error})
            SK->>Browser: エラー表示
        else パスワード一致
            FA->>DB: セッション作成
            DB->>FA: session
            FA->>Cookie: setSessionCookie()
            FA->>SK: redirect(303, "/dashboard")
            SK->>Browser: ダッシュボードへ<br/>Cookie設定済み
        end
    end
`;

  const protectedPageFlow = `
sequenceDiagram
    participant Browser as ブラウザ
    participant SK as SvelteKit
    participant Hooks as hooks.server.ts
    participant Load as +page.server.ts
    participant DB as Database
    
    Browser->>SK: /dashboard リクエスト<br/>(Cookie付き)
    
    SK->>Hooks: handle()実行
    Hooks->>Hooks: Cookie取得
    Hooks->>DB: validateSession(token)
    
    alt セッション無効/期限切れ
        DB->>Hooks: null
        Hooks->>SK: event.locals.user = null
    else セッション有効
        DB->>Hooks: {user, session}
        Hooks->>SK: event.locals.user = user
    end
    
    SK->>Load: load()実行
    
    alt 未認証
        Load->>SK: redirect(303, "/login?from=/dashboard")
        SK->>Browser: ログインページへリダイレクト
    else 認証済み
        Load->>SK: return {user}
        SK->>Browser: ダッシュボード表示
    end
`;
</script>

このページでは、SvelteKitを使用したCookie/Sessionベースの認証システムの実装方法を詳しく解説します。サーバーサイドレンダリング（SSR）の利点を最大限に活かし、セキュアで信頼性の高い認証システムを構築する方法を、実際に動作するコード例とシーケンス図を交えながら説明します。

## 概要

Cookie/Sessionベース認証は、サーバーサイドでセッション情報を管理し、クライアントにはセッションIDのみをHTTPOnlyクッキーとして保存する伝統的かつ安全な認証方式です。この方式は、Web開発の初期から使われており、最も枯れた技術であるため、信頼性が高く、セキュリティ上の問題も十分に理解されています。

### なぜCookie/Session認証を選ぶか

Cookie/Session認証を選択する最大の理由は、そのセキュリティの高さと実装のシンプルさです。以下の比較表は、JWT認証との主要な違いを示しています。特にセキュリティ重視のアプリケーションでは、Cookie/Session認証が優れた選択肢となります。

| 特徴 | Cookie/Session | JWT |
|------|---------------|-----|
| セキュリティ | HTTPOnlyで高い | XSS攻撃のリスク |
| セッション管理 | サーバー側で完全制御 | トークンの無効化が困難 |
| スケーラビリティ | セッションストア必要 | ステートレスで優れる |
| 実装の複雑さ | シンプル | やや複雑 |

## 認証フローのシーケンス図

認証システムの動作を理解するために、以下の3つの主要なフローをシーケンス図で示します。各図は、ブラウザ、SvelteKit、Form Actions、データベース間の通信の流れを詳細に表現しています。

### ユーザー登録フロー

新規ユーザーがアカウントを作成する際のフローです。バリデーション、パスワードのハッシュ化、セッションの作成、Cookieの設定までの一連の処理を示しています。

<Mermaid chart={registrationFlow} />

#### ポイント解説
- Form Actionsでサーバーサイドバリデーションを実行
- bcryptによる安全なパスワードハッシュ化
- セッション作成と同時にHTTPOnly Cookieを設定
- 成功時は自動的にダッシュボードへリダイレクト

### ログインフロー

既存ユーザーがログインする際のフローです。メールアドレスとパスワードの検証、セッションの作成、リダイレクト処理の流れを詳細に説明しています。

<Mermaid chart={loginFlow} />

#### ポイント解説
- データベースからユーザー情報を取得
- bcrypt.compare()でパスワードを安全に検証
- セキュリティのため、「ユーザーが存在しない」と「パスワードが間違っている」を区別しないエラーメッセージ
- ログイン後は元のページ（from パラメータ）へリダイレクト

### 認証保護されたページアクセス

認証が必要なページにアクセスする際のフローです。hooks.server.tsでのセッション検証から、+page.server.tsでの認証チェック、未認証ユーザーのリダイレクトまでの流れを示しています。

<Mermaid chart={protectedPageFlow} />

#### ポイント解説
- すべてのリクエストはhooks.server.tsを通過
- Cookieからセッショントークンを自動取得
- セッション検証結果をlocals.userに保存
- 各ページのload関数で認証状態をチェック
- 未認証の場合は、現在のURLをfromパラメータとして保存してログインページへリダイレクト

## 実装詳細

以下では、実際に動作する認証システムをステップバイステップで実装していきます。各コードブロックには詳細な説明を追加し、なぜその実装が必要なのか、どのように動作するのかを明確にします。

### 1. プロジェクトセットアップ

まずは新しいSvelteKitプロジェクトを作成し、必要な依存関係をインストールします。bcryptjsはパスワードの安全なハッシュ化に、Prismaはタイプセーフなデータベース操作に使用します。

```bash
# SvelteKit 2.x + Svelte 5のプロジェクトを作成
# TypeScript、ESLint、Prettierを選択することを推奨
npm create svelte@latest svelte5-auth-basic
cd svelte5-auth-basic

# 認証システムに必要なパッケージをインストール
npm install bcryptjs @prisma/client
# 開発用の型定義とツール
npm install -D prisma @types/bcryptjs @sveltejs/adapter-vercel
```

### 2. データベーススキーマ（Prisma）

Prismaを使用してデータベーススキーマを定義します。Userモデルにはユーザー情報、Sessionモデルにはセッション情報を保存します。両者は1対多の関係で結ばれており、ユーザーが削除されると関連するセッションも自動的に削除されます。

```typescript
// prisma/schema.prisma
// ※ Prismaスキーマの@記号がSvelteのテンプレート構文と衝突するため、
// コメントアウトして記載しています。実際の実装時はコメントを外してください。

// model User {
//   id        String    @id @default(uuid())      // 一意のユーザーID（UUID v4）
//   email     String    @unique                   // メールアドレス（重複不可）
//   password  String                              // ハッシュ化されたパスワード
//   name      String?                             // ユーザー名（オプション）
//   createdAt DateTime  @default(now())           // 作成日時
//   updatedAt DateTime  @updatedAt                // 更新日時（自動更新）
//   sessions  Session[]                           // このユーザーのセッション一覧
// }

// model Session {
//   id        String   @id @default(uuid())       // セッションID
//   token     String   @unique                    // セッショントークン（Cookie値）
//   userId    String                              // 所有者のユーザーID
//   user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
//                                                 // ユーザーとのリレーション（カスケード削除）
//   expiresAt DateTime                           // セッション有効期限
//   createdAt DateTime @default(now())           // セッション作成日時
// }
```

#### 実装のポイント
- UUIDを使用してセキュアなIDを生成
- emailフィールドに@uniqueを付けて重複を防止
- onDelete: Cascadeでユーザー削除時にセッションも自動削除
- expiresAtフィールドで期限切れセッションを管理

### 3. 認証ユーティリティ

認証システムのコアとなるユーティリティ関数を実装します。このファイルはサーバーサイドでのみ実行され、パスワードのハッシュ化、セッションの作成・検証、Cookieの設定など、認証に関わるすべての機能を提供します。

```typescript
// src/lib/server/auth.ts
// 認証システムのコア機能を提供するユーティリティモジュール
// このファイルは/lib/serverディレクトリに配置することで、
// クライアントサイドからのアクセスを防ぎ、セキュリティを保ちます
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import type { Cookies } from '@sveltejs/kit';

// Prismaクライアントのインスタンスを作成
// これにより、データベースとの通信が可能になります
const prisma = new PrismaClient();

// セッションCookieの名前と有効期間を定数として定義
// これらの値を変更することで、システム全体の設定を一括変更できます
const SESSION_COOKIE_NAME = 'session';
const SESSION_EXPIRY_DAYS = 7;

// パスワードハッシュ化関数
// bcryptを使用してパスワードを安全にハッシュ化します
// 第2引数の10はソルトラウンド数で、値が大きいほど安全ですが処理が遅くなります
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// パスワード検証関数
// ユーザーが入力したパスワードとデータベースに保存されたハッシュ値を比較します
// bcrypt.compareはハッシュ化時のソルトを自動的に抽出して検証します
export async function verifyPassword(
  password: string,           // ユーザーが入力した平文パスワード
  hashedPassword: string      // データベースに保存されたハッシュ値
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// セッション作成関数
// 新しいセッションを作成し、データベースに保存します
// UUIDを使用することで、予測不可能でユニークなセッションIDを生成します
export async function createSession(userId: string): Promise<string> {
  // ランダムなUUIDをセッショントークンとして生成
  // crypto.randomUUID()は暗号学的に安全なランダム値を生成
  const token = crypto.randomUUID();
  
  // 現在日時からSESSION_EXPIRY_DAYS日後を有効期限として設定
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_EXPIRY_DAYS);
  
  // データベースにセッション情報を保存
  await prisma.session.create({
    data: {
      token,      // セッショントークン
      userId,     // このセッションを所有するユーザーのID
      expiresAt   // セッションの有効期限
    }
  });
  
  return token;
}

// セッション検証関数
// セッショントークンを検証し、有効な場合はユーザー情報を返します
// 期限切れのセッションは自動的に削除されます
export async function validateSession(token: string) {
  // トークンでセッションを検索し、関連するユーザー情報も取得
  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true }  // ユーザー情報をJOINして取得
  });
  
  // セッションが存在しない、または期限切れの場合
  if (!session || session.expiresAt < new Date()) {
    if (session) {
      // 期限切れのセッションをデータベースから削除（クリーンアップ）
      await prisma.session.delete({ where: { id: session.id } });
    }
    // 認証失敗を示すnullを返す
    return { user: null, session: null };
  }
  
  // 有効なセッションの場合、ユーザー情報とセッションを返す
  return { user: session.user, session };
}

// Cookie設定関数
// セッショントークンを安全なCookieとして設定します
// HTTPOnlyやSecure属性を設定することで、XSSや中間者攻撃から保護します
export function setSessionCookie(cookies: Cookies, token: string): void {
  cookies.set(SESSION_COOKIE_NAME, token, {
    path: '/',                                      // サイト全体でCookieを有効化
    httpOnly: true,                                 // JavaScriptからのアクセスを禁止（XSS対策）
    secure: process.env.NODE_ENV === 'production',  // 本番環境ではHTTPSでのみ送信
    sameSite: 'lax',                               // CSRF攻撃を防ぐための設定
    maxAge: 60 * 60 * 24 * SESSION_EXPIRY_DAYS     // Cookieの有効期間（秒単位）
  });
}
```

### 4. Hooksでのセッション管理

hooks.server.tsは、すべてのリクエストが通過するミドルウェアのような役割を果たします。ここでセッションの検証を行い、結果をlocalsオブジェクトに保存することで、後続の処理でユーザー情報にアクセスできるようにします。

```typescript
// src/hooks.server.ts
// すべてのリクエストをインターセプトし、セッション検証を行うミドルウェア
// このファイルはSvelteKitアプリケーションのエントリーポイントとして機能します
import type { Handle } from '@sveltejs/kit';
import { validateSession } from '$lib/server/auth';

export const handle: Handle = async ({ event, resolve }) => {
  // Cookieからセッショントークンを取得
  const sessionToken = event.cookies.get('session');
  
  if (sessionToken) {
    // セッショントークンが存在する場合、検証を実行
    const { user, session } = await validateSession(sessionToken);
    if (user) {
      // 有効なセッションの場合、localsにユーザー情報を保存
      // localsはリクエスト全体でアクセス可能なオブジェクトです
      event.locals.user = user;
      event.locals.session = session;
    }
  }
  
  // ユーザーが未設定の場合はnullを設定（TypeScriptの型チェックのため）
  event.locals.user = event.locals.user || null;
  
  // リクエストの処理を継続
  return resolve(event);
};
```

### 5. Form Actionsでの認証処理

SvelteKitのForm Actionsは、フォーム送信をサーバーサイドで処理する強力な機能です。Progressive Enhancementにより、JavaScriptが無効な環境でも動作し、CSRF保護も自動的に提供されます。以下はログイン処理の実装例です。

```typescript
// src/routes/login/+page.server.ts
// ログインページのサーバーサイド処理
// Form Actionsを使用してフォーム送信を処理し、認証を実行します
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { 
  getUserByEmail, 
  verifyPassword, 
  createSession, 
  setSessionCookie 
} from '$lib/server/auth';

export const actions: Actions = {
  // defaultアクションは、フォームのaction属性が指定されていない場合に実行されます
  default: async ({ request, cookies, url }) => {
    // フォームデータを取得
    const data = await request.formData();
    const email = data.get('email') as string;
    const password = data.get('password') as string;
    
    // 入力値のバリデーション
    // 必須項目が入力されているか確認します
    if (!email || !password) {
      // fail関数を使用してエラーを返します
      // フォームの値とエラーメッセージをクライアントに返します
      return fail(400, {
        email,  // 入力されたメールアドレスを保持
        error: 'すべての項目を入力してください'
      });
    }
    
    try {
      // データベースからユーザーを検索
      const user = await getUserByEmail(email);
      
      // ユーザーが存在しない、またはパスワードが一致しない場合
      if (!user || !(await verifyPassword(password, user.password))) {
        // 401 Unauthorizedエラーを返します
        // セキュリティ上、「ユーザーが存在しない」と「パスワードが間違っている」を
        // 区別しないメッセージにしています
        return fail(401, {
          email,
          error: 'メールアドレスまたはパスワードが正しくありません'
        });
      }
      
      // 認証成功：新しいセッションを作成
      const sessionToken = await createSession(user.id);
      
      // セッショントークンをCookieに設定
      setSessionCookie(cookies, sessionToken);
      
      // ログイン後のリダイレクト先を決定
      // fromパラメータがあればそこへ、なければダッシュボードへ
      const redirectTo = url.searchParams.get('from') || '/dashboard';
      
      // 303 See Otherステータスでリダイレクト
      // throwを使用することで、SvelteKitが適切にリダイレクトを処理します
      throw redirect(303, redirectTo);
    } catch (error) {
      // redirectのエラーは正常な処理なので、再スローします
      // これにより、SvelteKitがリダイレクトを実行します
      if (error?.status === 303) throw error;
      
      // その他のエラーの場合は、500エラーを返します
      return fail(500, {
        email,
        error: 'ログイン中にエラーが発生しました'
      });
    }
  }
};
```

### 6. 認証保護されたページ

認証が必要なページでは、+page.server.tsのload関数で認証チェックを行います。未認証の場合はログインページへリダイレクトし、ログイン後に元のページに戻れるようにパラメータを付与します。

```typescript
// src/routes/dashboard/+page.server.ts
// ダッシュボードページのサーバーサイド処理
// 認証チェックを行い、未認証ユーザーをリダイレクトします
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  // hooks.server.tsで設定されたlocals.userを確認
  // 未認証の場合はログインページへリダイレクト
  if (!locals.user) {
    // fromパラメータを付与して、ログイン後に戻れるようにする
    throw redirect(303, '/login?from=/dashboard');
  }
  
  // 認証済みユーザーの情報をクライアントに渡す
  return {
    user: locals.user
  };
};
```

## セキュリティのベストプラクティス

Cookie/Session認証を安全に実装するためには、以下のセキュリティ対策を実施することが重要です。これらの対策は、OWASP（Open Web Application Security Project）のガイドラインに基づいています。

### 1. HTTPOnly Cookieの使用

HTTPOnly属性を設定することで、JavaScriptからCookieにアクセスできなくなり、XSS攻撃によるセッショントークンの盗取を防ぎます。
```typescript
// セキュアなCookie設定の例
cookies.set('session', token, {
  httpOnly: true,  // document.cookieやその他のJavaScript APIからアクセス不可
  secure: true,     // HTTPS接続でのみCookieを送信（中間者攻撃対策）
  sameSite: 'lax'   // クロスサイトリクエストでのCookie送信を制限（CSRF対策）
});
```

### 2. パスワードのハッシュ化

パスワードは必ずハッシュ化して保存します。bcryptはソルト付きハッシュを生成し、レインボーテーブル攻撃やブルートフォース攻撃から保護します。
```typescript
// bcryptでソルト付きハッシュを生成
// ソルトラウンド10は、セキュリティとパフォーマンスのバランスが良い値です
// 値を増やすとより安全になりますが、処理時間が増加します
const hashedPassword = await bcrypt.hash(password, 10);
```

### 3. セッション有効期限の管理

セッションには適切な有効期限を設定し、期限切れのセッションを定期的に削除することで、データベースのパフォーマンスを維持し、セキュリティリスクを減らします。
```typescript
// 期限切れセッションのクリーンアップ関数
// cronジョブやタイマーで定期実行することを推奨します
async function cleanupExpiredSessions() {
  // 現在日時より古いexpiresAtを持つセッションをすべて削除
  await prisma.session.deleteMany({
    where: {
      expiresAt: { lt: new Date() }  // lt = less than（より小さい）
    }
  });
}
```

### 4. CSRF対策

SvelteKitのForm Actionsは自動的にCSRF保護を提供します。これは、SvelteKitが内部的にOriginヘッダーを確認し、不正なリクエストを拒否することで実現されています。追加の設定は不要で、Form Actionsを使用するだけでCSRF攻撃から保護されます。

## パフォーマンス最適化

認証システムのパフォーマンスを最適化することで、ユーザー体験を向上させ、サーバーの負荷を軽減できます。以下の最適化手法を実装することを推奨します。

### 1. セッションキャッシュ

Redisなどのインメモリキャッシュを使用することで、データベースへのアクセス回数を削減し、レスポンス時間を短縮できます。
```typescript
// Redisを使用したセッションキャッシュの実装例
// 高トラフィックなアプリケーションで特に効果的です

import { redis } from '$lib/server/redis';

export async function validateSessionCached(token: string) {
  // まずRedisキャッシュを確認
  const cached = await redis.get(`session:${token}`);
  if (cached) {
    // キャッシュヒット：高速にレスポンス
    return JSON.parse(cached);
  }
  
  // キャッシュミス：データベースから取得
  const session = await validateSession(token);
  
  // 取得したデータをRedisにキャッシュ（1時間有効）
  await redis.setex(
    `session:${token}`,  // キー
    3600,                // TTL（秒）
    JSON.stringify(session)
  );
  
  return session;
}
```

### 2. データベースインデックス

適切なインデックスを設定することで、データベースクエリのパフォーマンスを大幅に改善できます。特にセッションテーブルはtokenで検索することが多いため、適切なインデックスが重要です。
```typescript
// Prismaスキーマでのインデックス定義
// @db.Indexアノテーションを使用してインデックスを作成
// model Session {
//   token     String   @unique @db.Index  // tokenでの高速検索を可能に
//   userId    String   @db.Index          // ユーザー別セッション一覧の取得を高速化
//   expiresAt DateTime @db.Index          // 期限切れセッションのクリーンアップを高速化
// }
```

## 実装例

この記事で解説した認証システムの完全な実装例が以下のリポジトリで公開されています。実際に動作するコードを確認し、自分のプロジェクトに適用してみてください。

#### 完全に動作する実装例
- **GitHub**: [svelte5-auth-basic](https://github.com/shuji-bonji/svelte5-auth-basic)
- **デモ**: [https://svelte5-auth-basic.vercel.app](https://svelte5-auth-basic.vercel.app)

## 関連リソース

Cookie/Session認証の理解を深めるための追加リソースです。公式ドキュメントや外部リソースを参照して、さらに高度な実装を目指しましょう。

- [SvelteKit Form Actions](https://kit.svelte.dev/docs/form-actions)
- [SvelteKit Hooks](https://kit.svelte.dev/docs/hooks)
- [Prisma Documentation](https://www.prisma.io/docs)

## 他の認証方式との比較

各認証方式にはそれぞれ適した使用場面があります。以下の表は、Cookie/Session認証と他の認証方式を比較し、それぞれの特徴と推奨用途を示しています。

| 方式 | メリット | デメリット | 推奨用途 |
|------|---------|-----------|----------|
| **Cookie/Session** | セキュア、実装簡単 | スケーラビリティ課題 | 中小規模アプリ |
| [JWT認証](/examples/auth-jwt/) | ステートレス、スケーラブル | トークン無効化困難 | マイクロサービス |
| OAuth 2.0（準備中） | 外部認証利用 | 実装複雑 | ソーシャルログイン |

## まとめ

Cookie/Sessionベース認証は、SvelteKitの標準機能を活用してセキュアで堅牢な認証システムを構築できる優れた選択肢です。本記事で解説した実装パターンは、実際のプロダクションレベルのアプリケーションでも使用できる実用的なものです。

特に以下のような場合に最適です。

- ✅ **セキュリティ重視**のアプリケーション - HTTPOnlyクッキーによる強固な保護
- ✅ **サーバーサイドレンダリング**を活用したい場合 - SSRとの相性が抜群
- ✅ **シンプルな実装**を求める場合 - 複雑な設定不要で実装可能

Cookie/Session認証は、JWTのような新しい技術と比較して「古い」と思われがちですが、実際には多くの大規模サービスで採用されている信頼性の高い手法です。適切に実装すれば、高いセキュリティとユーザビリティを両立できます。

## 次のステップ

認証システムの理解をさらに深めるために、以下のトピックも学習することをお勧めします。

- [JWT認証システム](/examples/auth-jwt/) - トークンベース認証の実装（準備中）
- [ルートグループ認証](/examples/auth-route-groups/) - 構造的な認証境界の実装（計画中）
- 認証システムのテスト - 認証機能のテスト戦略（準備中）

また、実際のコードを確認したい場合は、[GitHubリポジトリ](https://github.com/shuji-bonji/svelte5-auth-basic)をクローンして、ローカル環境で動かしてみることをお勧めします。