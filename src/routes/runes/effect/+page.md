---
title: $effectルーン
description: リアクティブな副作用の処理
---

`$effect`は、Svelte 5のRunesシステムで副作用（side effects）を管理するための機能です。このページでは、`$effect`の基本的な使い方から、クリーンアップ処理、実践的なパターンまで、TypeScriptと組み合わせた活用方法を解説します。

:::tip[React/Vue経験者向け]
- `$effect`は React の `useEffect` や Vue の `watchEffect` に相当
- 依存する値が変更されたときに自動実行される
- クリーンアップ関数を返すことができる
- コンポーネントのマウント時に自動実行される
:::

## $effectとは

`$effect`は、リアクティブな値が変更されたときに副作用を実行するルーンです。DOM操作、API呼び出し、ログ出力など、純粋でない処理を行う際に使用します。

### 主な特徴

- **自動的な依存追跡**: 使用しているリアクティブ値を自動で追跡
- **初回実行**: コンポーネントマウント時に必ず実行される
- **クリーンアップ対応**: リソースの解放処理を定義可能
- **非同期処理対応**: async/awaitを使った処理も記述可能

:::warning[重要な原則]
**副作用は`$effect`で、計算は`$derived`で**
- 値の計算や変換 → `$derived`を使用
- 外部への影響（DOM、API、ログなど） → `$effect`を使用

この原則を守ることで、予測可能で保守しやすいコードになります。
:::

## 基本的な使い方

### シンプルな例

```typescript
let count = $state(0);

$effect(() => {
  console.log(`カウント: ${count}`);
  // count が変更されるたびに実行される
});
```

### DOM操作

```typescript
let title = $state('初期タイトル');

$effect(() => {
  // ページタイトルを更新
  document.title = title;
});

// titleが変更されると自動的にページタイトルも更新される
title = '新しいタイトル';
```

## クリーンアップ関数

リソースの解放やイベントリスナーの削除など、クリーンアップが必要な場合は関数を返します。

```typescript
let enabled = $state(true);

$effect(() => {
  if (!enabled) return;
  
  const timer = setInterval(() => {
    console.log('tick');
  }, 1000);
  
  // クリーンアップ関数
  return () => {
    clearInterval(timer);
  };
});
```

### イベントリスナーの例

```typescript
let handleResize = $state(true);

$effect(() => {
  if (!handleResize) return;
  
  const handler = () => {
    console.log('Window resized:', window.innerWidth);
  };
  
  window.addEventListener('resize', handler);
  
  return () => {
    window.removeEventListener('resize', handler);
  };
});
```

## 条件付き実行

```typescript
let isActive = $state(false);
let data = $state<string | null>(null);

$effect(() => {
  // isActive が false の場合は早期リターン
  if (!isActive) return;
  
  // isActive が true の時のみ実行
  console.log('データ:', data);
});
```

## $effect.pre

コンポーネントがDOMに追加される前に実行する必要がある場合は`$effect.pre`を使用します。

```typescript
let width = $state(0);
let height = $state(0);

$effect.pre(() => {
  // DOM更新前に実行される
  console.log(`サイズ変更前: ${width}x${height}`);
});
```

## $effect.root

独立したエフェクトのルートスコープを作成します。

```typescript
let cleanup = $effect.root(() => {
  // 独立したエフェクトスコープ
  let interval = $state(1000);
  
  $effect(() => {
    const timer = setInterval(() => {
      console.log('tick');
    }, interval);
    
    return () => clearInterval(timer);
  });
  
  // クリーンアップ関数を返す
  return () => {
    console.log('ルートエフェクトのクリーンアップ');
  };
});

// 必要に応じてクリーンアップを呼び出す
// cleanup();
```

## 実践例。リアルタイムダッシュボード

`$effect`を活用したリアルタイムダッシュボードの実装例です。時計、マウス追跡、キーボード監視、LocalStorage同期などを実装しています。

```svelte live ln title=RealtimeDashboard.svelte
<script lang="ts">
  // === 状態管理 ===
  let currentTime = $state(new Date());
  let mousePosition = $state({ x: 0, y: 0 });
  let keyPressed = $state<string | null>(null);
  let isOnline = $state(navigator.onLine);
  let pageViews = $state(0);
  let timeSpent = $state(0);
  let isDarkMode = $state(false);
  
  // LocalStorageから保存された設定を読み込む
  let savedSettings = $state({
    username: '',
    notifications: true,
    theme: 'light' as 'light' | 'dark'
  });
  
  // === Effect 1: リアルタイム時計 ===
  $effect(() => {
    const interval = setInterval(() => {
      currentTime = new Date();
    }, 1000);
    
    return () => clearInterval(interval);
  });
  
  // === Effect 2: マウス位置追跡 ===
  $effect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePosition = { x: e.clientX, y: e.clientY };
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  });
  
  // === Effect 3: キーボード監視 ===
  $effect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keyPressed = e.key;
    };
    
    const handleKeyUp = () => {
      keyPressed = null;
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  });
  
  // === Effect 4: オンライン状態監視 ===
  $effect(() => {
    const handleOnline = () => {
      isOnline = true;
    };
    
    const handleOffline = () => {
      isOnline = false;
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  });
  
  // === ページビューカウント（初回のみ） ===
  // 注: $effectの中で状態を変更すると無限ループになるため、
  // マウント時に一度だけ実行
  let hasCountedPageView = false;
  $effect(() => {
    if (!hasCountedPageView) {
      pageViews++;
      hasCountedPageView = true;
      console.log(`ページビュー: ${pageViews}`);
    }
  });
  
  // === Effect 6: 滞在時間計測 ===
  $effect(() => {
    const interval = setInterval(() => {
      timeSpent++;
    }, 1000);
    
    return () => clearInterval(interval);
  });
  
  // === Effect 7: LocalStorage同期（読み込み） ===
  $effect(() => {
    const saved = localStorage.getItem('dashboardSettings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        savedSettings = parsed;
        isDarkMode = parsed.theme === 'dark';
      } catch (e) {
        console.error('設定の読み込みエラー:', e);
      }
    }
  });
  
  // === Effect 8: LocalStorage同期（保存） ===
  $effect(() => {
    const settings = {
      ...savedSettings,
      theme: isDarkMode ? 'dark' : 'light'
    };
    localStorage.setItem('dashboardSettings', JSON.stringify(settings));
  });
  
  // === Effect 9: ドキュメントタイトル更新 ===
  $effect(() => {
    document.title = `Dashboard - ${currentTime.toLocaleTimeString('ja-JP')}`;
  });
  
  // === Effect 10: テーマ切り替え ===
  $effect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
    
    return () => {
      document.body.classList.remove('dark-theme');
    };
  });
  
  // 設定変更ハンドラー
  function updateUsername(e: Event) {
    const target = e.target as HTMLInputElement;
    savedSettings.username = target.value;
  }
  
  function toggleNotifications() {
    savedSettings.notifications = !savedSettings.notifications;
  }
  
  function toggleTheme() {
    isDarkMode = !isDarkMode;
  }
</script>

<div class="dashboard" class:dark={isDarkMode}>
  <header>
    <h2>🎯 リアルタイムダッシュボード</h2>
    <button class="theme-toggle" onclick={toggleTheme}>
      {isDarkMode ? '☀️' : '🌙'}
    </button>
  </header>
  
  <div class="grid">
    <!-- 時計 -->
    <div class="card">
      <h3>⏰ 現在時刻</h3>
      <div class="time">
        {currentTime.toLocaleTimeString('ja-JP')}
      </div>
      <div class="date">
        {currentTime.toLocaleDateString('ja-JP', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}
      </div>
    </div>
    
    <!-- マウス位置 -->
    <div class="card">
      <h3>🖱️ マウス位置</h3>
      <div class="coords">
        X: <span class="value">{mousePosition.x}</span>
        Y: <span class="value">{mousePosition.y}</span>
      </div>
      <div class="mouse-indicator" style="
        left: {mousePosition.x}px;
        top: {mousePosition.y}px;
      "></div>
    </div>
    
    <!-- キーボード -->
    <div class="card">
      <h3>⌨️ キーボード</h3>
      {#if keyPressed}
        <div class="key-display">
          押されたキー: <span class="key">{keyPressed}</span>
        </div>
      {:else}
        <div class="key-display muted">
          キーを押してください
        </div>
      {/if}
    </div>
    
    <!-- ステータス -->
    <div class="card">
      <h3>📊 ステータス</h3>
      <div class="status-item">
        接続状態: 
        <span class="status" class:online={isOnline}>
          {isOnline ? '🟢 オンライン' : '🔴 オフライン'}
        </span>
      </div>
      <div class="status-item">
        ページビュー: <span class="value">{pageViews}</span>
      </div>
      <div class="status-item">
        滞在時間: <span class="value">{timeSpent}秒</span>
      </div>
    </div>
    
    <!-- 設定 -->
    <div class="card settings">
      <h3>⚙️ 設定</h3>
      <div class="setting-item">
        <label>
          ユーザー名:
          <input 
            type="text" 
            value={savedSettings.username}
            oninput={updateUsername}
            placeholder="名前を入力"
          />
        </label>
      </div>
      <div class="setting-item">
        <label>
          <input 
            type="checkbox" 
            checked={savedSettings.notifications}
            onchange={toggleNotifications}
          />
          通知を有効にする
        </label>
      </div>
      {#if savedSettings.username}
        <div class="welcome">
          ようこそ、{savedSettings.username}さん！
        </div>
      {/if}
    </div>
    
    <!-- Effect情報 -->
    <div class="card">
      <h3>🎬 アクティブなEffect</h3>
      <ul class="effect-list">
        <li>⏰ 時計更新 (1秒ごと)</li>
        <li>🖱️ マウス追跡</li>
        <li>⌨️ キーボード監視</li>
        <li>🌐 オンライン状態監視</li>
        <li>💾 LocalStorage同期</li>
        <li>📄 タイトル更新</li>
        <li>🎨 テーマ切り替え</li>
      </ul>
    </div>
  </div>
</div>

<style>
  .dashboard {
    padding: 2rem;
    background: #f5f5f5;
    min-height: 100vh;
    transition: background 0.3s;
  }
  
  .dashboard.dark {
    background: #1a1a1a;
    color: #fff;
  }
  
  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }
  
  h2 {
    margin: 0;
    color: #ff3e00;
  }
  
  .theme-toggle {
    background: transparent;
    border: 2px solid #ff3e00;
    font-size: 1.5rem;
    padding: 0.5rem;
    cursor: pointer;
    border-radius: 8px;
  }
  
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
  }
  
  .card {
    background: white;
    padding: 1.5rem;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    position: relative;
  }
  
  .dark .card {
    background: #2a2a2a;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  }
  
  h3 {
    margin-top: 0;
    color: #ff3e00;
    font-size: 1.1rem;
  }
  
  .time {
    font-size: 2rem;
    font-weight: bold;
    color: #ff3e00;
    font-family: monospace;
  }
  
  .date {
    margin-top: 0.5rem;
    color: #666;
  }
  
  .dark .date {
    color: #aaa;
  }
  
  .coords {
    font-size: 1.2rem;
    font-family: monospace;
  }
  
  .value {
    color: #ff3e00;
    font-weight: bold;
  }
  
  .mouse-indicator {
    position: fixed;
    width: 20px;
    height: 20px;
    background: radial-gradient(circle, #ff3e00, transparent);
    border-radius: 50%;
    pointer-events: none;
    transform: translate(-50%, -50%);
    z-index: 1000;
    opacity: 0.5;
  }
  
  .key-display {
    font-size: 1.2rem;
    padding: 1rem;
    background: #f0f0f0;
    border-radius: 8px;
    text-align: center;
  }
  
  .dark .key-display {
    background: #333;
  }
  
  .key {
    color: #ff3e00;
    font-weight: bold;
    font-size: 1.5rem;
    font-family: monospace;
  }
  
  .muted {
    color: #999;
  }
  
  .status-item {
    margin: 0.5rem 0;
  }
  
  .status.online {
    color: #4caf50;
  }
  
  .setting-item {
    margin: 1rem 0;
  }
  
  .setting-item label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  input[type="text"] {
    flex: 1;
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  
  .dark input[type="text"] {
    background: #333;
    border-color: #555;
    color: #fff;
  }
  
  input[type="checkbox"] {
    width: 20px;
    height: 20px;
  }
  
  .welcome {
    margin-top: 1rem;
    padding: 0.75rem;
    background: #fff3cd;
    color: #856404;
    border-radius: 4px;
  }
  
  .dark .welcome {
    background: #3a3a2a;
    color: #ffd700;
  }
  
  .effect-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  
  .effect-list li {
    padding: 0.5rem 0;
    border-bottom: 1px solid #eee;
  }
  
  .dark .effect-list li {
    border-bottom-color: #444;
  }
  
  .effect-list li:last-child {
    border-bottom: none;
  }
</style>
```

## 実践例：コード例

### LocalStorage同期

```typescript
type Settings = {
  theme: 'light' | 'dark';
  language: 'ja' | 'en';
  fontSize: number;
};

let settings = $state<Settings>({
  theme: 'light',
  language: 'ja',
  fontSize: 14
});

// LocalStorageから読み込み
$effect(() => {
  const saved = localStorage.getItem('settings');
  if (saved) {
    try {
      Object.assign(settings, JSON.parse(saved));
    } catch (e) {
      console.error('設定の読み込みに失敗:', e);
    }
  }
});

// LocalStorageに保存
$effect(() => {
  localStorage.setItem('settings', JSON.stringify(settings));
});
```

### デバウンス処理

```typescript
let searchQuery = $state('');
let searchResults = $state<string[]>([]);

$effect(() => {
  // 空文字の場合はスキップ
  if (!searchQuery) {
    searchResults = [];
    return;
  }
  
  // デバウンス処理
  const timeoutId = setTimeout(async () => {
    try {
      const response = await fetch(`/api/search?q=${searchQuery}`);
      const data = await response.json();
      searchResults = data.results;
    } catch (error) {
      console.error('検索エラー:', error);
    }
  }, 300);
  
  return () => clearTimeout(timeoutId);
});
```

### スクロール位置の追跡

```typescript
let scrollY = $state(0);
let isScrollingUp = $state(false);
let lastScrollY = 0;

$effect(() => {
  const handleScroll = () => {
    const currentScrollY = window.scrollY;
    scrollY = currentScrollY;
    isScrollingUp = currentScrollY < lastScrollY;
    lastScrollY = currentScrollY;
  };
  
  window.addEventListener('scroll', handleScroll, { passive: true });
  
  return () => {
    window.removeEventListener('scroll', handleScroll);
  };
});
```

### WebSocket接続

```typescript
type Message = {
  id: string;
  text: string;
  timestamp: number;
};

let messages = $state<Message[]>([]);
let connected = $state(false);
let wsUrl = $state('wss://example.com/socket');

$effect(() => {
  const ws = new WebSocket(wsUrl);
  
  ws.onopen = () => {
    connected = true;
    console.log('WebSocket接続成功');
  };
  
  ws.onmessage = (event) => {
    try {
      const message: Message = JSON.parse(event.data);
      messages = [...messages, message];
    } catch (error) {
      console.error('メッセージパースエラー:', error);
    }
  };
  
  ws.onerror = (error) => {
    console.error('WebSocketエラー:', error);
    connected = false;
  };
  
  ws.onclose = () => {
    connected = false;
    console.log('WebSocket切断');
  };
  
  // クリーンアップ
  return () => {
    ws.close();
  };
});
```

## 注意点とベストプラクティス

### 1. 無限ループを避ける

```typescript
// ❌ 無限ループになる
let count = $state(0);

$effect(() => {
  count++; // count を変更すると再度 effect が実行される
});

// ✅ 条件を付けて制御
$effect(() => {
  if (count < 10) {
    setTimeout(() => count++, 1000);
  }
});
```

### 2. 重い処理は避ける

```typescript
// ❌ 重い同期処理
$effect(() => {
  // 重い計算処理...
});

// ✅ 非同期処理や最適化
$effect(() => {
  requestAnimationFrame(() => {
    // 重い処理
  });
});
```

### 3. 依存関係を明確に

```typescript
let a = $state(1);
let b = $state(2);

// 自動的に a と b の変更を追跡
$effect(() => {
  console.log(a + b);
});
```

### 4. クリーンアップを忘れない

```typescript
// ❌ リソースリーク
$effect(() => {
  const timer = setInterval(() => {}, 1000);
  // クリーンアップなし
});

// ✅ 適切なクリーンアップ
$effect(() => {
  const timer = setInterval(() => {}, 1000);
  return () => clearInterval(timer);
});
```

## $effectと$derivedの使い分け

```typescript
let count = $state(0);

// ✅ 純粋な計算は $derived
let doubled = $derived(count * 2);

// ✅ 副作用は $effect
$effect(() => {
  console.log('Count changed:', count);
  localStorage.setItem('count', String(count));
});

// ❌ $derived で副作用
let bad = $derived(() => {
  localStorage.setItem('count', String(count)); // 副作用
  return count * 2;
});
```

:::info[さらに詳しく]
- `$derived`、`$effect`、`derived.by`の詳細な比較と使い分けについては、[完全比較ガイド](/deep-dive/derived-vs-effect-vs-derived-by/)をご覧ください
- DOM要素への直接的な操作が必要な場合は、[use:アクション](/svelte-basics/actions/)を使用することも検討してください
:::

## 次のステップ

副作用の処理方法を理解したら、[$props - プロパティ](/runes/props/)でコンポーネント間のデータ受け渡しを学びましょう。

:::tip[デバッグのヒント]
`$effect`内での値の変化を確認したい場合は、[$inspect - デバッグツール](/runes/inspect/)を使うと便利です。
:::