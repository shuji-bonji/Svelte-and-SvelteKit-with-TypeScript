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

リアクティビティとは、**データの変更を自動的に検知し、関連する処理を実行する仕組み**です。通常のJavaScriptでは、変数の値を変更しても、その変数に依存する他の値は自動的に更新されません。リアクティビティシステムは、この問題を解決します。

```javascript
// 通常のJavaScriptの問題点
let count = 0;
let doubled = count * 2;  // この時点で doubled = 0 と固定される

count = 5;                // count を変更しても...
console.log(doubled);     // doubled は 0 のまま（期待値は 10）

// リアクティビティがあれば、doubled が自動的に 10 になる
```

## Object.defineProperty()によるリアクティビティ

### 基本的な仕組み

`Object.defineProperty()`を使用すると、プロパティのgetter/setterをカスタマイズできます。これはVue 2やMobXの初期バージョンで採用された手法です。

```javascript
// シンプルなリアクティブオブジェクトの実装
function reactive(obj, key, value) {
  let internalValue = value;     // 実際の値を保持する内部変数
  const deps = new Set();         // このプロパティに依存する関数を保存
  
  Object.defineProperty(obj, key, {
    get() {
      // プロパティが読み取られたときに実行される
      if (activeEffect) {
        // 現在実行中のエフェクトを依存関係として記録
        deps.add(activeEffect);
      }
      return internalValue;
    },
    set(newValue) {
      // プロパティに値が代入されたときに実行される
      internalValue = newValue;
      // このプロパティに依存するすべての関数を再実行
      deps.forEach(effect => effect());
    }
  });
}
```

### 実装例：簡易リアクティブシステム

より完全なリアクティブシステムの実装例を見てみましょう。この実装は、Vue 2の内部動作と似た仕組みになっています。

```javascript
// グローバルな実行コンテキスト（現在実行中のエフェクトを追跡）
let activeEffect = null;

// リアクティブなデータを作成する関数
function createReactive(target) {
  const deps = new Map();  // 各プロパティごとの依存関係を管理
  
  // すべてのプロパティをリアクティブに変換
  Object.keys(target).forEach(key => {
    let value = target[key];  // プロパティの現在値を保持
    
    // このプロパティに依存するエフェクトのセット
    deps.set(key, new Set());
    
    Object.defineProperty(target, key, {
      get() {
        // プロパティが読み取られたとき
        if (activeEffect) {
          // 現在実行中のエフェクトを依存関係に追加
          deps.get(key).add(activeEffect);
        }
        console.log(`Getting ${key}: ${value}`);
        return value;
      },
      set(newValue) {
        // プロパティに値が設定されたとき
        console.log(`Setting ${key}: ${value} -> ${newValue}`);
        value = newValue;
        
        // このプロパティに依存するすべてのエフェクトを実行
        deps.get(key).forEach(effect => effect());
      }
    });
  });
  
  return target;
}

// エフェクト（副作用）を登録する関数
function watchEffect(effect) {
  // エフェクトを実行中であることを記録
  activeEffect = effect;
  
  // 初回実行 - この時にプロパティへのアクセスが発生し、
  // 依存関係が自動的に収集される
  effect();
  
  // 実行コンテキストをクリア
  activeEffect = null;
}

// 実際の使用例
const state = createReactive({
  count: 0,
  message: 'Hello'
});

// state.count が変更されるたびに自動実行される処理を登録
watchEffect(() => {
  // この関数内で state.count にアクセスすると、
  // 自動的に依存関係として登録される
  console.log(`Count is: ${state.count}`);
  
  // DOM更新も自動化できる
  const element = document.getElementById('output');
  if (element) {
    element.textContent = `Count: ${state.count}`;
  }
});

// 値を変更すると、依存するエフェクトが自動実行される
state.count = 1;  // "Getting count: 0" → "Setting count: 0 -> 1" → "Count is: 1"
state.count = 2;  // "Getting count: 1" → "Setting count: 1 -> 2" → "Count is: 2"

// message は使われていないので、変更してもエフェクトは実行されない
state.message = 'World';  // エフェクトは実行されない
```

### 計算プロパティの実装

Vue の `computed` や Svelte の `$derived` のような、計算プロパティの実装例です。計算結果をキャッシュし、依存が変更されたときだけ再計算します。

```javascript
// 計算プロパティ（computed）の実装
function computed(getter) {
  let value;              // 計算結果のキャッシュ
  let dirty = true;       // true の場合、再計算が必要
  
  // 依存が変更されたときに呼ばれる関数
  const runner = () => {
    dirty = true;  // キャッシュを無効化（次回アクセス時に再計算）
  };
  
  return {
    get value() {
      if (dirty) {
        // 再計算が必要な場合
        activeEffect = runner;  // runnerを依存関係として登録
        value = getter();       // getter内でアクセスしたプロパティに依存
        activeEffect = null;
        dirty = false;          // キャッシュを有効化
      }
      return value;  // キャッシュされた値を返す
    }
  };
}

// 計算プロパティの使用例
const state = createReactive({
  price: 100,
  quantity: 2
});

// price と quantity に依存する計算プロパティ
const total = computed(() => state.price * state.quantity);

console.log(total.value);  // 200（初回計算）
console.log(total.value);  // 200（キャッシュから返される、再計算されない）

state.price = 150;         // price を変更
console.log(total.value);  // 300（自動的に再計算される）

state.quantity = 3;        // quantity を変更
console.log(total.value);  // 450（自動的に再計算される）
```

## Object.defineProperty()の限界

Object.defineProperty()は強力ですが、JavaScript言語仕様の制限により、いくつかの重要な制限があります。

### 1. 配列の変更検知の問題

配列のインデックスアクセスや length プロパティの変更は検知できません。

```javascript
const state = createReactive({
  items: [1, 2, 3]
});

watchEffect(() => {
  console.log('Items:', state.items);
});

// ❌ これらの変更は検知できない
state.items[0] = 999;     // インデックスによる代入 → エフェクトが実行されない
state.items.length = 0;   // length プロパティの変更 → エフェクトが実行されない

// Vue 2 での回避策
// 方法1: 新しい配列を作成して代入
state.items = [...state.items];  // ✅ 新しい配列なので検知される

// 方法2: Vue専用のAPIを使用
Vue.set(state.items, 0, 999);    // ✅ Vue.set は内部で通知を発火

// 方法3: 配列メソッドを使用（pushやspliceは動作する）
state.items.push(4);              // ✅ pushメソッドは検知される
```

### 2. プロパティの追加・削除

Object.defineProperty()は、初期化時に存在するプロパティのみをリアクティブにできます。

```javascript
const state = createReactive({
  name: 'John'
});

watchEffect(() => {
  console.log('State:', JSON.stringify(state));
});

// ❌ 新しいプロパティの追加は検知できない
state.age = 30;  // age はリアクティブにならない
                 // エフェクトは実行されない

// ❌ プロパティの削除も検知できない
delete state.name;  // delete 操作は検知されない
                    // エフェクトは実行されない

// Vue 2 での回避策
// Vue.set を使って新しいプロパティを追加
Vue.set(state, 'age', 30);  // ✅ リアクティブなプロパティとして追加

// または、事前にプロパティを定義しておく
const state = createReactive({
  name: 'John',
  age: undefined  // 初期値として undefined を設定
});
```

### 3. ネストしたオブジェクト

ネストしたオブジェクトは、自動的にはリアクティブになりません。

```javascript
const state = createReactive({
  user: {
    name: 'John',
    address: {
      city: 'Tokyo'
    }
  }
});

watchEffect(() => {
  // userオブジェクト自体の変更は検知される
  console.log('User:', state.user);
});

// ❌ ネストしたプロパティの変更は検知されない
state.user.address.city = 'Osaka';  // address.city はリアクティブではない
                                     // エフェクトは実行されない

// ✅ user オブジェクト全体を置き換えれば検知される
state.user = {
  ...state.user,
  address: { ...state.user.address, city: 'Osaka' }
};  // エフェクトが実行される

// Vue 2 では、深い監視（deep watch）を使用する必要があった
// または、ネストしたオブジェクトも再帰的にリアクティブ化する必要があった
```

## Proxyによる次世代リアクティビティ

### Proxyの基本

`Proxy`は、ES2015で導入された強力な機能で、オブジェクトの基本的な操作（プロパティアクセス、代入、削除など）をすべてインターセプト（横取り）できます。Vue 3、MobX 6以降、Svelte 5などのモダンなフレームワークで採用されています。

```javascript
// Proxyを使った包括的なリアクティビティシステム
function createReactiveProxy(target) {
  const deps = new Map();  // 依存関係を管理
  
  return new Proxy(target, {
    // プロパティの読み取りをインターセプト
    get(target, key, receiver) {
      // どんなプロパティアクセスも検知できる（配列のインデックスも含む）
      track(deps, key);
      
      // 実際の値を取得
      const value = Reflect.get(target, key, receiver);
      
      // ネストしたオブジェクトも自動的にリアクティブ化
      if (typeof value === 'object' && value !== null) {
        return createReactiveProxy(value);  // 再帰的にProxyでラップ
      }
      
      return value;
    },
    
    // プロパティへの代入をインターセプト
    set(target, key, value, receiver) {
      const oldValue = target[key];
      const result = Reflect.set(target, key, value, receiver);
      
      // 値が実際に変更された場合のみ依存を更新（無駄な更新を防ぐ）
      if (oldValue !== value) {
        trigger(deps, key);  // 依存するエフェクトを実行
      }
      
      return result;
    },
    
    // プロパティの削除をインターセプト
    deleteProperty(target, key) {
      const result = Reflect.deleteProperty(target, key);
      trigger(deps, key);  // delete 操作も検知できる
      return result;
    },
    
    // 'in' 演算子をインターセプト
    has(target, key) {
      track(deps, key);  // 'key in obj' の形式も追跡
      return Reflect.has(target, key);
    },
    
    // その他、ownKeys、getOwnPropertyDescriptor なども
    // インターセプト可能（ここでは省略）
  });
}

// 依存関係の追跡（どのエフェクトがどのプロパティに依存しているか記録）
function track(deps, key) {
  if (!activeEffect) return;  // エフェクト実行中でなければ何もしない
  
  // このプロパティの依存関係セットを作成（初回のみ）
  if (!deps.has(key)) {
    deps.set(key, new Set());
  }
  
  // 現在のエフェクトをこのプロパティの依存として追加
  deps.get(key).add(activeEffect);
}

// エフェクトのトリガー（プロパティが変更されたときに依存を実行）
function trigger(deps, key) {
  const effects = deps.get(key);  // このプロパティに依存するエフェクト
  if (effects) {
    // すべての依存エフェクトを実行
    effects.forEach(effect => effect());
  }
}
```

### Proxyの利点

Proxyを使うことで、Object.defineProperty()の制限をすべて克服できます。

```javascript
// 1. 配列の変更も完璧に検知できる
const state = createReactiveProxy({
  items: [1, 2, 3]
});

watchEffect(() => {
  console.log('Items:', state.items.join(', '));
});

// Object.defineProperty()では検知できなかった操作もすべて検知
state.items[0] = 999;      // ✅ インデックスアクセスも検知される
state.items.push(4);       // ✅ 配列メソッドも検知される
state.items.length = 2;    // ✅ length プロパティの変更も検知される

// 2. 動的なプロパティ追加・削除も検知
const user = createReactiveProxy({
  name: 'John'
});

watchEffect(() => {
  console.log('User:', JSON.stringify(user));
});

// 初期化時に存在しなかったプロパティも追加可能
user.age = 30;             // ✅ 新しいプロパティの追加も検知される
user.email = 'john@example.com';  // ✅ さらに追加しても検知される
delete user.name;          // ✅ プロパティの削除も検知される

// 3. ネストしたオブジェクトも自動的にリアクティブ
const nested = createReactiveProxy({
  level1: {
    level2: {
      value: 'deep'
    }
  }
});

watchEffect(() => {
  // 深いプロパティへのアクセスも自動追跡
  console.log('Deep value:', nested.level1.level2.value);
});

// どんなに深いプロパティの変更も検知
nested.level1.level2.value = 'changed';  // ✅ 検知される
nested.level1.newProp = { test: 'new' }; // ✅ 新しいネストも検知される
```

## SvelteのRunesとの関連

### Svelte 5のシグナルベース実装

Svelte 5のRunesは、内部的にシグナルベースのリアクティビティを採用しています。これは、Vue 3のリアクティビティシステムと類似していますが、コンパイル時の最適化が加わっています。

```javascript
// Svelte 5の$stateの簡略化した実装イメージ
function $state(initialValue) {
  let value = initialValue;
  const subscribers = new Set();  // この状態を監視しているコンポーネント
  
  // オブジェクトや配列の場合、Proxyでラップ
  if (typeof initialValue === 'object' && initialValue !== null) {
    return new Proxy(initialValue, {
      get(target, key) {
        // プロパティアクセス時に依存関係を追跡
        trackSignal(subscribers);
        return Reflect.get(target, key);
      },
      set(target, key, newValue) {
        const result = Reflect.set(target, key, newValue);
        // 値が変更されたら、購読者（コンポーネント）に通知
        notifySubscribers(subscribers);
        return result;
      }
    });
  }
  
  // プリミティブ値（数値、文字列など）の場合
  // getter/setter を持つオブジェクトとして返す
  return {
    get value() {
      trackSignal(subscribers);  // 値の読み取りを追跡
      return value;
    },
    set value(newValue) {
      value = newValue;
      notifySubscribers(subscribers);  // 変更を通知
    }
  };
}

// $derivedの簡略化した実装
function $derived(computation) {
  let cachedValue;      // 計算結果のキャッシュ
  let isDirty = true;   // 再計算が必要かどうか
  
  // 依存が変更されたときに呼ばれる関数
  const recompute = () => {
    isDirty = true;  // 次回アクセス時に再計算するフラグを立てる
  };
  
  return {
    get value() {
      if (isDirty) {
        // キャッシュが無効なら再計算
        // computation 内でアクセスした $state に自動的に依存
        cachedValue = trackComputation(computation, recompute);
        isDirty = false;
      }
      return cachedValue;  // キャッシュされた値を返す
    }
  };
}
```

### コンパイル時の最適化

Svelteはコンパイル時に、これらのリアクティビティAPIを最適なコードに変換します。これが、Svelteが「消えるフレームワーク」と呼ばれる理由です。

```javascript
// 開発者が書くコード（Svelte 5のRunes）
let count = $state(0);
let doubled = $derived(count * 2);

// コンパイル後のコード（簡略化）
let count = createSignal(0);  // シグナル（リアクティブな値）を作成
let doubled = createComputed(() => count.value * 2);  // 計算プロパティ

// UIの更新コード（Svelteが自動生成）
if (count.changed) {  // 値が変更されたかチェック
  updateTextNode(node, count.value);  // DOM ノードを直接更新
  // Virtual DOM を使わず、直接DOMを更新するので高速
}
```

## パフォーマンス比較

各リアクティビティ実装手法のトレードオフを理解することが重要です。

| 手法 | メモリ使用量 | 実行速度 | 機能性 | ブラウザサポート | 採用フレームワーク |
|-----|------------|---------|--------|---------------|------------------|
| **Object.defineProperty** | 低 | 高速 | 制限あり（配列・動的プロパティ非対応） | IE9+ | Vue 2、古いMobX |
| **Proxy** | 中 | 中速 | 完全（すべての操作を検知） | モダンブラウザ | Vue 3、MobX 6+、Svelte 5 |
| **手動追跡** | 最低 | 最速 | 手動実装が必要 | すべて | React（setState） |
| **コンパイル時生成** | 低 | 最速 | コンパイラ依存 | すべて | Svelte、Solid.js |

### ベンチマーク例

リアクティビティの実装方法によるパフォーマンスの違いを測定するコード例です。

```javascript
// パフォーマンステスト
const iterations = 100000;

// 1. Object.defineProperty版のベンチマーク
console.time('defineProperty');
const obj1 = {};
for (let i = 0; i < iterations; i++) {
  Object.defineProperty(obj1, `prop${i}`, {
    value: i,
    writable: true,
    enumerable: true,
    configurable: true
  });
}
console.timeEnd('defineProperty');
// 結果例: defineProperty: 45ms

// 2. Proxy版のベンチマーク
console.time('proxy');
const obj2 = new Proxy({}, {
  set(target, key, value) {
    target[key] = value;
    return true;
  }
});
for (let i = 0; i < iterations; i++) {
  obj2[`prop${i}`] = i;  // Proxyのsetトラップが毎回実行される
}
console.timeEnd('proxy');
// 結果例: proxy: 120ms（definePropertyより遅いが、機能性は高い）

// 3. 通常のオブジェクト（比較用）
console.time('plain object');
const obj3 = {};
for (let i = 0; i < iterations; i++) {
  obj3[`prop${i}`] = i;  // 何のインターセプトもなし
}
console.timeEnd('plain object');
// 結果例: plain object: 15ms（最速）
```

## 実装のベストプラクティス

本番環境でリアクティビティシステムを実装する際の重要なテクニックを紹介します。

### 1. WeakMapを使用したメモリリーク対策

WeakMapを使用することで、オブジェクトがガベージコレクションされたときに、自動的に依存関係も削除されます。

```javascript
// グローバルな依存関係マップ（メモリリークを防ぐためWeakMapを使用）
const targetMap = new WeakMap();  // オブジェクト → 依存関係のマッピング

function reactive(target) {
  // このオブジェクトの依存関係マップ
  const depsMap = new Map();  // プロパティ名 → エフェクトのセット
  
  // WeakMapに保存（targetがGCされると自動的に削除される）
  targetMap.set(target, depsMap);
  
  return new Proxy(target, {
    get(target, key) {
      // 依存関係の追跡
      track(targetMap.get(target), key);
      return Reflect.get(target, key);
    },
    set(target, key, value) {
      const result = Reflect.set(target, key, value);
      // 依存するエフェクトを実行
      trigger(targetMap.get(target), key);
      return result;
    }
  });
}

// メモリリークの例（WeakMapを使わない場合）
let hugeObject = { data: new Array(1000000) };
const reactiveObj = reactive(hugeObject);
hugeObject = null;  // WeakMapなら、依存関係も自動削除される
```

### 2. バッチ更新の実装

複数の状態変更を一度にまとめて処理することで、無駄な再レンダリングを防ぎます。

```javascript
// 更新をバッチ処理して、パフォーマンスを向上
let pending = false;              // バッチ処理中かどうか
const pendingEffects = new Set(); // 実行待ちのエフェクト

function queueEffect(effect) {
  // エフェクトをキューに追加
  pendingEffects.add(effect);
  
  if (!pending) {
    pending = true;
    // マイクロタスクキューで非同期実行（同期的な変更をまとめる）
    Promise.resolve().then(flushEffects);
  }
}

function flushEffects() {
  pending = false;
  // キューに溜まったエフェクトをまとめて実行
  const effects = [...pendingEffects];
  pendingEffects.clear();
  effects.forEach(effect => effect());
}

// 使用例
const state = reactive({ a: 1, b: 2, c: 3 });

watchEffect(() => {
  console.log(`Sum: ${state.a + state.b + state.c}`);
});

// これらの変更は1回のバッチで処理される
state.a = 10;  // エフェクトをキューに追加
state.b = 20;  // 同じエフェクトは重複しない
state.c = 30;  // まだ実行されない
// マイクロタスク後に、エフェクトが1回だけ実行される
```

### 3. 循環参照の検出

リアクティビティシステムでは、循環参照による無限ループを防ぐ必要があります。

```javascript
const effectStack = [];  // 現在実行中のエフェクトのスタック

function runEffect(effect) {
  // 同じエフェクトが既にスタックにあれば循環参照
  if (effectStack.includes(effect)) {
    console.warn('Circular dependency detected!', {
      currentStack: effectStack.map(e => e.name || 'anonymous'),
      attemptedEffect: effect.name || 'anonymous'
    });
    return;  // 実行を中断して無限ループを防ぐ
  }
  
  try {
    effectStack.push(effect);  // スタックに追加
    effect();                  // エフェクトを実行
  } finally {
    effectStack.pop();         // 必ずスタックから削除
  }
}

// 循環参照の例
const state = reactive({ a: 1, b: 2 });

// ❌ 悪い例：循環参照を起こすコード
watchEffect(function badEffect() {
  state.a = state.b + 1;  // a を b に依存させる
});

watchEffect(function anotherBadEffect() {
  state.b = state.a + 1;  // b を a に依存させる（循環！）
});
// 上記のコードは検出されて警告が出る
```

## まとめ

### 技術の進化

リアクティビティシステムの実装は、JavaScript言語機能の進化とともに改善されてきました。

1. **Object.defineProperty時代**（2010年代前半〜）
   - Vue 2、古いMobXが採用
   - 制限は多いが、IE9以降で動作する広いブラウザサポート
   - 配列のインデックスアクセスや動的プロパティの追加に課題
   - 回避策として特殊なAPIが必要（Vue.set、Vue.delete など）

2. **Proxy時代**（2010年代後半〜）
   - Vue 3、MobX 6+、Svelte 5が採用
   - オブジェクトのあらゆる操作を完全にインターセプト可能
   - よりシンプルで直感的なAPI（特殊なメソッド不要）
   - モダンブラウザのみサポート（IE非対応）

3. **コンパイル最適化時代**（2020年代〜）
   - Svelte、Solid.jsが先駆け
   - コンパイル時に最適化されたコードを生成
   - 実行時オーバーヘッドの最小化
   - Virtual DOMを使わず、直接DOM操作を行う

### 実装選択の指針

プロジェクトの規模と要件に応じて、適切なリアクティビティ手法を選択することが重要です。

- **小規模プロジェクト（〜1000行）**: 
  - 手動の状態管理（setState、イベントハンドラ）で十分
  - 例：React の useState、素のJavaScript

- **中規模プロジェクト（〜10000行）**: 
  - Object.definePropertyベースのシンプルな実装
  - 例：Vue 2、簡易的な自作リアクティビティ

- **大規模プロジェクト（10000行〜）**: 
  - Proxyベースの完全なリアクティビティシステム
  - 例：Vue 3、MobX、Svelte 5

- **パフォーマンス重視のプロジェクト**: 
  - コンパイル時最適化を行うフレームワーク
  - 例：Svelte、Solid.js、Qwik

:::warning[フレームワーク選択のポイント]
リアクティビティの実装方法は、フレームワークの特性を大きく左右します。

- **Vue 2 → Vue 3**: Object.definePropertyからProxyへの移行により、より自然な記法が可能に
  - 配列操作が自然に書ける、動的プロパティの追加が可能
  - パフォーマンスも向上（特に大規模アプリケーション）

- **Svelte 4 → Svelte 5**: コンパイラベースの最適化に加えて、Runesによる明示的なリアクティビティ
  - `$state`、`$derived`などの明示的なAPI
  - より予測可能で、TypeScriptとの相性も向上

- **React**: あえてリアクティビティを持たず、明示的な状態更新（setState）を採用
  - 学習曲線は緩やか、動作が予測しやすい
  - 代わりにVirtual DOMで差分更新を最適化
:::

### この知識を活かす場面

素のJavaScriptでリアクティビティを実装する知識は、以下の場面で役立ちます。

1. **フレームワークのデバッグ**：なぜ更新が起きないのか、なぜ無限ループするのかを理解
2. **パフォーマンス最適化**：不要な再レンダリングの原因を特定
3. **カスタムソリューション**：特殊な要件に対して、独自のリアクティビティシステムを構築
4. **技術選定**：プロジェクトに最適なフレームワークを選択する判断材料

フレームワークは便利なツールですが、その内部動作を理解することで、より効果的に活用できるようになります。