---
title: テスト戦略
description: SvelteKitアプリケーションの包括的なテスト戦略
---

SvelteKitアプリケーションの品質を保証するための包括的なテスト戦略について解説します。単体テストから統合テスト、E2Eテストまで、TypeScriptを活用した型安全なテスト手法を紹介します。

## テストピラミッド

### テストレベルの構成

```mermaid
graph TD
    A[E2Eテスト<br/>10%] --> B[統合テスト<br/>30%]
    B --> C[単体テスト<br/>60%]
    
    style A fill:#ff6b6b
    style B fill:#ffd93d
    style C fill:#6bcf7f
```

## テスト環境のセットアップ

### 必要なパッケージのインストール

```bash
# Vitest（単体テスト・統合テスト）
pnpm add -D vitest @testing-library/svelte @testing-library/jest-dom jsdom

# Playwright（E2Eテスト）
pnpm add -D @playwright/test

# その他のユーティリティ
pnpm add -D @vitest/ui @vitest/coverage-v8 msw
```

### vitest.config.ts

```typescript
import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
  plugins: [sveltekit()],
  test: {
    include: ['src/**/*.{test,spec}.{js,ts}'],
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '*.config.ts',
        '.svelte-kit/'
      ]
    },
    alias: {
      $lib: '/src/lib',
      $app: '/src/test/mocks/app'
    }
  }
});
```

### テストセットアップファイル

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// SvelteKitのモック
vi.mock('$app/environment', () => ({
  browser: true,
  dev: true,
  building: false,
  version: 'test'
}));

vi.mock('$app/navigation', () => ({
  goto: vi.fn(),
  replaceState: vi.fn(),
  pushState: vi.fn(),
  preloadData: vi.fn(),
  preloadCode: vi.fn(),
  invalidate: vi.fn(),
  invalidateAll: vi.fn(),
  afterNavigate: vi.fn()
}));

vi.mock('$app/stores', () => {
  const { readable, writable } = await import('svelte/store');
  
  const page = readable({
    url: new URL('http://localhost'),
    params: {},
    route: { id: '/' },
    status: 200,
    error: null,
    data: {},
    form: undefined
  });
  
  const navigating = readable(null);
  const updated = { subscribe: vi.fn() };
  
  return { page, navigating, updated };
});
```

## 単体テスト

### コンポーネントのテスト

```typescript
// src/lib/components/Counter.test.ts
import { render, fireEvent, screen } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import Counter from './Counter.svelte';

describe('Counter', () => {
  it('初期値が正しく表示される', () => {
    render(Counter, { props: { initial: 5 } });
    expect(screen.getByText('Count: 5')).toBeInTheDocument();
  });
  
  it('インクリメントボタンが機能する', async () => {
    render(Counter, { props: { initial: 0 } });
    const button = screen.getByRole('button', { name: /increment/i });
    
    await fireEvent.click(button);
    expect(screen.getByText('Count: 1')).toBeInTheDocument();
    
    await fireEvent.click(button);
    expect(screen.getByText('Count: 2')).toBeInTheDocument();
  });
  
  it('最大値を超えない', async () => {
    render(Counter, { props: { initial: 9, max: 10 } });
    const button = screen.getByRole('button', { name: /increment/i });
    
    await fireEvent.click(button);
    expect(screen.getByText('Count: 10')).toBeInTheDocument();
    
    await fireEvent.click(button);
    expect(screen.getByText('Count: 10')).toBeInTheDocument();
    expect(button).toBeDisabled();
  });
});
```

### ストアのテスト

```typescript
// src/lib/stores/auth.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import { createAuthStore } from './auth.svelte';

describe('AuthStore', () => {
  let authStore: ReturnType<typeof createAuthStore>;
  
  beforeEach(() => {
    authStore = createAuthStore();
  });
  
  it('初期状態では未認証', () => {
    expect(authStore.isAuthenticated).toBe(false);
    expect(authStore.user).toBeNull();
  });
  
  it('ログインが成功する', async () => {
    const credentials = {
      email: 'test@example.com',
      password: 'password123'
    };
    
    await authStore.login(credentials);
    
    expect(authStore.isAuthenticated).toBe(true);
    expect(authStore.user).toEqual({
      id: '1',
      email: 'test@example.com',
      name: 'Test User'
    });
  });
  
  it('ログアウトが機能する', async () => {
    await authStore.login({
      email: 'test@example.com',
      password: 'password123'
    });
    
    authStore.logout();
    
    expect(authStore.isAuthenticated).toBe(false);
    expect(authStore.user).toBeNull();
  });
});
```

### ユーティリティ関数のテスト

```typescript
// src/lib/utils/validation.test.ts
import { describe, it, expect } from 'vitest';
import { validateEmail, validatePassword, validateForm } from './validation';

describe('Validation Utils', () => {
  describe('validateEmail', () => {
    it('有効なメールアドレスを検証', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name+tag@example.co.jp')).toBe(true);
    });
    
    it('無効なメールアドレスを拒否', () => {
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
    });
  });
  
  describe('validatePassword', () => {
    it('強度の高いパスワードを検証', () => {
      expect(validatePassword('Abc123!@#')).toEqual({
        valid: true,
        errors: []
      });
    });
    
    it('弱いパスワードにエラーを返す', () => {
      const result = validatePassword('abc');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('最低8文字必要です');
      expect(result.errors).toContain('大文字を含む必要があります');
      expect(result.errors).toContain('数字を含む必要があります');
    });
  });
});
```

## 統合テスト

### Load関数のテスト

```typescript
// src/routes/posts/[id]/+page.test.ts
import { describe, it, expect, vi } from 'vitest';
import { load } from './+page.server';
import type { PageServerLoad } from './$types';

vi.mock('$lib/server/database', () => ({
  db: {
    post: {
      findUnique: vi.fn()
    }
  }
}));

describe('Post Page Load Function', () => {
  it('投稿を正常に取得する', async () => {
    const mockPost = {
      id: '1',
      title: 'Test Post',
      content: 'Test content',
      authorId: 'user1'
    };
    
    const { db } = await import('$lib/server/database');
    vi.mocked(db.post.findUnique).mockResolvedValue(mockPost);
    
    const result = await load({
      params: { id: '1' },
      locals: { user: { id: 'user1' } }
    } as Parameters<PageServerLoad>[0]);
    
    expect(result).toEqual({ post: mockPost });
  });
  
  it('投稿が見つからない場合404エラー', async () => {
    const { db } = await import('$lib/server/database');
    vi.mocked(db.post.findUnique).mockResolvedValue(null);
    
    await expect(
      load({
        params: { id: '999' },
        locals: { user: { id: 'user1' } }
      } as Parameters<PageServerLoad>[0])
    ).rejects.toThrow('Not found');
  });
});
```

### Actionのテスト

```typescript
// src/routes/contact/+page.server.test.ts
import { describe, it, expect, vi } from 'vitest';
import { actions } from './+page.server';
import type { RequestEvent } from '@sveltejs/kit';

describe('Contact Form Actions', () => {
  it('フォーム送信が成功する', async () => {
    const formData = new FormData();
    formData.append('name', 'John Doe');
    formData.append('email', 'john@example.com');
    formData.append('message', 'Test message');
    
    const mockRequest = {
      formData: async () => formData,
      locals: {}
    } as RequestEvent;
    
    const result = await actions.submit(mockRequest);
    
    expect(result).toEqual({
      type: 'success',
      status: 200,
      data: {
        message: 'お問い合わせを受け付けました'
      }
    });
  });
  
  it('バリデーションエラーを返す', async () => {
    const formData = new FormData();
    formData.append('name', '');
    formData.append('email', 'invalid-email');
    formData.append('message', '');
    
    const mockRequest = {
      formData: async () => formData,
      locals: {}
    } as RequestEvent;
    
    const result = await actions.submit(mockRequest);
    
    expect(result).toEqual({
      type: 'failure',
      status: 400,
      data: {
        errors: {
          name: '名前は必須です',
          email: '有効なメールアドレスを入力してください',
          message: 'メッセージは必須です'
        }
      }
    });
  });
});
```

## E2Eテスト

### Playwrightの設定

```typescript
// playwright.config.ts
import type { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  testDir: './tests/e2e',
  timeout: 30000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    },
    {
      name: 'mobile',
      use: { ...devices['iPhone 13'] }
    }
  ],
  webServer: {
    command: 'pnpm build && pnpm preview',
    port: 4173,
    reuseExistingServer: !process.env.CI
  }
};

export default config;
```

### E2Eテストの実装

```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('認証フロー', () => {
  test('ユーザー登録からログインまで', async ({ page }) => {
    // 登録ページへ移動
    await page.goto('/register');
    
    // フォーム入力
    await page.fill('[name="email"]', 'newuser@example.com');
    await page.fill('[name="password"]', 'SecurePass123!');
    await page.fill('[name="confirmPassword"]', 'SecurePass123!');
    
    // 送信
    await page.click('button[type="submit"]');
    
    // 成功メッセージを確認
    await expect(page.locator('.success-message')).toContainText(
      '登録が完了しました'
    );
    
    // ログインページへリダイレクト
    await expect(page).toHaveURL('/login');
    
    // ログイン
    await page.fill('[name="email"]', 'newuser@example.com');
    await page.fill('[name="password"]', 'SecurePass123!');
    await page.click('button[type="submit"]');
    
    // ダッシュボードへ遷移
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1')).toContainText('ダッシュボード');
  });
  
  test('無効な認証情報でエラー表示', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('[name="email"]', 'wrong@example.com');
    await page.fill('[name="password"]', 'wrongpass');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('.error-message')).toContainText(
      'メールアドレスまたはパスワードが正しくありません'
    );
  });
});
```

### ビジュアルリグレッションテスト

```typescript
// tests/e2e/visual.spec.ts
import { test, expect } from '@playwright/test';

test.describe('ビジュアルリグレッション', () => {
  test('ホームページのスクリーンショット', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveScreenshot('homepage.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });
  
  test('ダークモードの表示', async ({ page }) => {
    await page.goto('/');
    
    // ダークモード切り替え
    await page.click('[data-testid="theme-toggle"]');
    
    await expect(page).toHaveScreenshot('homepage-dark.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });
});
```

## モックとスタブ

### MSW (Mock Service Worker) の活用

```typescript
// src/mocks/handlers.ts
import { rest } from 'msw';

export const handlers = [
  rest.get('/api/user', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        id: '1',
        name: 'Test User',
        email: 'test@example.com'
      })
    );
  }),
  
  rest.post('/api/login', async (req, res, ctx) => {
    const { email, password } = await req.json();
    
    if (email === 'test@example.com' && password === 'password') {
      return res(
        ctx.status(200),
        ctx.json({
          token: 'mock-jwt-token',
          user: {
            id: '1',
            email: 'test@example.com'
          }
        })
      );
    }
    
    return res(
      ctx.status(401),
      ctx.json({ error: 'Invalid credentials' })
    );
  })
];
```

## CI/CDパイプライン

### GitHub Actions設定

以下は`.github/workflows/test.yml`の設定例です。

```yaml
name: Test

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18, 20]
    
    steps:
      - uses: actions/checkout@v3
      
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - uses: actions/setup-node@v3
        with:
          node-version: 20  # matrixの値を使用
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Type check
        run: pnpm check
      
      - name: Lint
        run: pnpm lint
      
      - name: Unit tests
        run: pnpm test:unit --coverage
      
      - name: Build
        run: pnpm build
      
      - name: E2E tests
        run: pnpm test:e2e
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

:::tip[GitHub Actions変数]
実際の設定では、`node-version`の値にGitHub Actions変数（matrix.node-versionなど）を使用してMatrix戦略を活用できます。
:::

## まとめ

包括的なテスト戦略により、SvelteKitアプリケーションの品質を保証できます。単体テストで個々のコンポーネントの動作を確認し、統合テストでシステム間の連携を検証し、E2Eテストでユーザー視点での動作を確認することで、高品質なアプリケーションを提供できます。