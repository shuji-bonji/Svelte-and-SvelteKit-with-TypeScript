---
title: $effectルーン
description: リアクティブな副作用の処理
---

## $effectとは

`$effect`は、リアクティブな値が変更されたときに副作用を実行するルーンです。DOM操作、API呼び出し、ログ出力など、純粋でない処理を行う際に使用します。

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

## 実践例

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

## 次のステップ

副作用の処理方法を理解したら、[$props - プロパティ](/runes/props/)でコンポーネント間のデータ受け渡しを学びましょう。

:::tip[デバッグのヒント]
`$effect`内での値の変化を確認したい場合は、[$inspect - デバッグツール](/runes/inspect/)を使うと便利です。
:::