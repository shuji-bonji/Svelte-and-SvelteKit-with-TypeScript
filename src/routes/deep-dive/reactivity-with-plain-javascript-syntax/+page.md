---
title: 素のJavaScript構文でリアクティビティを実現
description: Object.definePropertyとProxyを使ったリアクティビティシステムの実装
---

## 概要

モダンフレームワークの「リアクティビティ」は、実はJavaScriptの標準機能で実装できます。本記事では、`Object.defineProperty()`から始まり、現代的な`Proxy`オブジェクトまで、リアクティビティシステムの内部実装を技術的に解説します。

:::info[この記事で学べること]
- Vue 2、Vue 3、Svelte 5などのフレームワークがどのようにリアクティビティを実現しているか
- `Object.defineProperty()`を使った古典的な実装方法とその限界
- `Proxy`を使った現代的な実装とその利点
- Svelte 5の`$state`ルーンの内部動作原理
- 各フレームワークがどのような技術的選択をしたか、その理由
:::

:::tip[対象読者]
- フレームワークの内部動作に興味がある方
- リアクティビティシステムを自作したい方
- Vue 2からVue 3、またはSvelte 4からSvelte 5への移行で、なぜ実装が変わったか理解したい方
- 「なぜProxyが必要なのか」という疑問を持っている方
:::

## リアクティビティとは

リアクティビティとは、**データの変更を自動的に検知し、関連する処理を実行する仕組み**です。

```javascript
// 理想的なリアクティビティ
let count = 0;
let doubled = count * 2;  // doubledが自動的に更新されてほしい

count = 5;
console.log(doubled);  // 10になってほしい（でも実際は0のまま）
```

## Object.defineProperty()によるリアクティビティ

### 基本的な仕組み

`Object.defineProperty()`を使用すると、プロパティのgetter/setterをカスタマイズできます。

```javascript
// シンプルなリアクティブオブジェクトの実装
function reactive(obj, key, value) {
  let internalValue = value;
  const deps = new Set();  // 依存関係を保存
  
  Object.defineProperty(obj, key, {
    get() {
      // 現在実行中の処理を依存関係として記録
      if (activeEffect) {
        deps.add(activeEffect);
      }
      return internalValue;
    },
    set(newValue) {
      internalValue = newValue;
      // 依存している処理をすべて実行
      deps.forEach(effect => effect());
    }
  });
}
```

### 実装例：簡易リアクティブシステム

```javascript
// グローバルな実行コンテキスト
let activeEffect = null;

// リアクティブなデータを作成
function createReactive(target) {
  const deps = new Map();  // プロパティごとの依存関係
  
  Object.keys(target).forEach(key => {
    let value = target[key];
    
    // 各プロパティの依存関係を管理
    deps.set(key, new Set());
    
    Object.defineProperty(target, key, {
      get() {
        // getter実行時に依存関係を記録
        if (activeEffect) {
          deps.get(key).add(activeEffect);
        }
        console.log(`Getting ${key}: ${value}`);
        return value;
      },
      set(newValue) {
        console.log(`Setting ${key}: ${value} -> ${newValue}`);
        value = newValue;
        
        // このプロパティに依存する処理を実行
        deps.get(key).forEach(effect => effect());
      }
    });
  });
  
  return target;
}

// エフェクト（副作用）を登録
function watchEffect(effect) {
  activeEffect = effect;
  effect();  // 初回実行で依存関係を収集
  activeEffect = null;
}

// 使用例
const state = createReactive({
  count: 0,
  message: 'Hello'
});

// 自動的に再実行される処理
watchEffect(() => {
  console.log(`Count is: ${state.count}`);
  document.getElementById('output').textContent = `Count: ${state.count}`;
});

// 値を変更すると自動的にエフェクトが実行される
state.count = 1;  // "Count is: 1" が出力される
state.count = 2;  // "Count is: 2" が出力される
```

### 計算プロパティの実装

```javascript
// 計算プロパティ（computed）の実装
function computed(getter) {
  let value;
  let dirty = true;  // キャッシュの有効性
  
  const runner = () => {
    dirty = true;  // 依存が変更されたらキャッシュを無効化
  };
  
  return {
    get value() {
      if (dirty) {
        activeEffect = runner;
        value = getter();
        activeEffect = null;
        dirty = false;
      }
      return value;
    }
  };
}

// 使用例
const state = createReactive({
  price: 100,
  quantity: 2
});

const total = computed(() => state.price * state.quantity);

console.log(total.value);  // 200

state.price = 150;
console.log(total.value);  // 300（自動的に再計算）
```

## Object.defineProperty()の限界

### 1. 配列の変更検知の問題

```javascript
const state = createReactive({
  items: [1, 2, 3]
});

// これらは検知できない
state.items[0] = 999;     // インデックスによる代入
state.items.length = 0;   // lengthの変更

// Vue 2での回避策
state.items = [...state.items];  // 新しい配列を代入
Vue.set(state.items, 0, 999);    // 特別なAPIを使用
```

### 2. プロパティの追加・削除

```javascript
const state = createReactive({
  name: 'John'
});

// 新しいプロパティは検知できない
state.age = 30;  // リアクティブにならない

// 削除も検知できない
delete state.name;  // 検知されない
```

### 3. ネストしたオブジェクト

```javascript
const state = createReactive({
  user: {
    name: 'John',
    address: {
      city: 'Tokyo'
    }
  }
});

// 深いプロパティはリアクティブにならない
state.user.address.city = 'Osaka';  // 検知されない
```

## Proxyによる次世代リアクティビティ

### Proxyの基本

`Proxy`は、オブジェクトの基本的な操作をすべてインターセプトできます。

```javascript
// Proxyを使った包括的なリアクティビティ
function createReactiveProxy(target) {
  const deps = new Map();
  
  return new Proxy(target, {
    get(target, key, receiver) {
      // すべてのプロパティアクセスをインターセプト
      track(deps, key);
      
      const value = Reflect.get(target, key, receiver);
      
      // ネストしたオブジェクトも自動的にProxyでラップ
      if (typeof value === 'object' && value !== null) {
        return createReactiveProxy(value);
      }
      
      return value;
    },
    
    set(target, key, value, receiver) {
      const oldValue = target[key];
      const result = Reflect.set(target, key, value, receiver);
      
      // 値が実際に変更された場合のみトリガー
      if (oldValue !== value) {
        trigger(deps, key);
      }
      
      return result;
    },
    
    deleteProperty(target, key) {
      const result = Reflect.deleteProperty(target, key);
      trigger(deps, key);
      return result;
    },
    
    has(target, key) {
      track(deps, key);
      return Reflect.has(target, key);
    }
  });
}

// 依存関係の追跡
function track(deps, key) {
  if (!activeEffect) return;
  
  if (!deps.has(key)) {
    deps.set(key, new Set());
  }
  deps.get(key).add(activeEffect);
}

// エフェクトのトリガー
function trigger(deps, key) {
  const effects = deps.get(key);
  if (effects) {
    effects.forEach(effect => effect());
  }
}
```

### Proxyの利点

```javascript
// 1. 配列の変更も検知できる
const state = createReactiveProxy({
  items: [1, 2, 3]
});

watchEffect(() => {
  console.log('Items:', state.items.join(', '));
});

state.items[0] = 999;      // ✅ 検知される
state.items.push(4);       // ✅ 検知される
state.items.length = 2;    // ✅ 検知される

// 2. 動的なプロパティ追加も検知
const user = createReactiveProxy({
  name: 'John'
});

watchEffect(() => {
  console.log('User:', JSON.stringify(user));
});

user.age = 30;             // ✅ 検知される
delete user.name;          // ✅ 検知される

// 3. ネストしたオブジェクトも自動的にリアクティブ
const nested = createReactiveProxy({
  level1: {
    level2: {
      value: 'deep'
    }
  }
});

nested.level1.level2.value = 'changed';  // ✅ 検知される
```

## SvelteのRunesとの関連

### Svelte 5のシグナルベース実装

Svelte 5のRunesは、内部的にシグナルベースのリアクティビティを採用しています。

```javascript
// Svelte 5の$stateの簡略化した実装イメージ
function $state(initialValue) {
  let value = initialValue;
  const subscribers = new Set();
  
  // Proxyを使って、プロパティアクセスを検知
  if (typeof initialValue === 'object' && initialValue !== null) {
    return new Proxy(initialValue, {
      get(target, key) {
        // 依存関係を追跡
        trackSignal(subscribers);
        return Reflect.get(target, key);
      },
      set(target, key, newValue) {
        const result = Reflect.set(target, key, newValue);
        // 購読者に通知
        notifySubscribers(subscribers);
        return result;
      }
    });
  }
  
  // プリミティブ値の場合
  return {
    get value() {
      trackSignal(subscribers);
      return value;
    },
    set value(newValue) {
      value = newValue;
      notifySubscribers(subscribers);
    }
  };
}

// $derivedの簡略化した実装
function $derived(computation) {
  let cachedValue;
  let isDirty = true;
  
  const recompute = () => {
    isDirty = true;
  };
  
  return {
    get value() {
      if (isDirty) {
        // 計算を実行し、依存関係を収集
        cachedValue = trackComputation(computation, recompute);
        isDirty = false;
      }
      return cachedValue;
    }
  };
}
```

### コンパイル時の最適化

Svelteはコンパイル時に、これらのリアクティビティAPIを最適なコードに変換します。

```javascript
// 開発者が書くコード
let count = $state(0);
let doubled = $derived(count * 2);

// コンパイル後のコード（簡略化）
let count = createSignal(0);
let doubled = createComputed(() => count.value * 2);

// UIの更新コード
if (count.changed) {
  updateTextNode(node, count.value);
}
```

## パフォーマンス比較

| 手法 | メモリ使用量 | 実行速度 | 機能性 | ブラウザサポート |
|-----|------------|---------|--------|---------------|
| **Object.defineProperty** | 低 | 高速 | 制限あり | IE9+ |
| **Proxy** | 中 | 中速 | 完全 | モダンブラウザ |
| **手動追跡** | 最低 | 最速 | 手動実装 | すべて |

### ベンチマーク例

```javascript
// パフォーマンステスト
const iterations = 100000;

// Object.defineProperty版
console.time('defineProperty');
const obj1 = {};
for (let i = 0; i < iterations; i++) {
  Object.defineProperty(obj1, `prop${i}`, {
    value: i,
    writable: true
  });
}
console.timeEnd('defineProperty');

// Proxy版
console.time('proxy');
const obj2 = new Proxy({}, {
  set(target, key, value) {
    target[key] = value;
    return true;
  }
});
for (let i = 0; i < iterations; i++) {
  obj2[`prop${i}`] = i;
}
console.timeEnd('proxy');
```

## 実装のベストプラクティス

### 1. WeakMapを使用したメモリリーク対策

```javascript
// グローバルな依存関係マップ
const targetMap = new WeakMap();

function reactive(target) {
  // WeakMapを使用することで、オブジェクトがGCされた時に
  // 自動的に依存関係も削除される
  const depsMap = new Map();
  targetMap.set(target, depsMap);
  
  return new Proxy(target, {
    get(target, key) {
      track(targetMap.get(target), key);
      return Reflect.get(target, key);
    },
    set(target, key, value) {
      const result = Reflect.set(target, key, value);
      trigger(targetMap.get(target), key);
      return result;
    }
  });
}
```

### 2. バッチ更新の実装

```javascript
// 更新をバッチ処理して、パフォーマンスを向上
let pending = false;
const pendingEffects = new Set();

function queueEffect(effect) {
  pendingEffects.add(effect);
  
  if (!pending) {
    pending = true;
    Promise.resolve().then(flushEffects);
  }
}

function flushEffects() {
  pending = false;
  const effects = [...pendingEffects];
  pendingEffects.clear();
  effects.forEach(effect => effect());
}
```

### 3. 循環参照の検出

```javascript
const effectStack = [];

function runEffect(effect) {
  // 循環参照を検出
  if (effectStack.includes(effect)) {
    console.warn('Circular dependency detected!');
    return;
  }
  
  effectStack.push(effect);
  effect();
  effectStack.pop();
}
```

## まとめ

### 技術の進化

1. **Object.defineProperty時代**（Vue 2, 古いMobX）
   - 制限は多いが、広いブラウザサポート
   - 配列や動的プロパティに課題

2. **Proxy時代**（Vue 3, MobX 6+, Svelte 5）
   - 完全なインターセプトが可能
   - よりシンプルで直感的なAPI

3. **コンパイル最適化**（Svelte, Solid.js）
   - 実行時オーバーヘッドの最小化
   - 静的解析による最適化

### 実装選択の指針

- **小規模プロジェクト**: 手動の状態管理で十分
- **中規模プロジェクト**: Object.definePropertyベースのシンプルな実装
- **大規模プロジェクト**: Proxyベースの完全なリアクティビティシステム
- **パフォーマンス重視**: コンパイル時最適化を行うフレームワーク

:::warning[フレームワーク選択のポイント]
リアクティビティの実装方法は、フレームワークの特性を大きく左右します：
- **Vue 2 → Vue 3**: Object.definePropertyからProxyへの移行により、より自然な記法が可能に
- **Svelte 4 → Svelte 5**: コンパイラベースの最適化に加えて、Proxyによる実行時リアクティビティを追加
- **React**: リアクティビティを持たず、明示的な状態更新（setState）を採用
:::

素のJavaScriptでリアクティビティを実装することで、フレームワークの内部動作を深く理解し、より良いアプリケーション設計が可能になります。この知識は、フレームワークの制限を理解し、適切な回避策を見つける際にも役立ちます。