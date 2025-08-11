---
title: Svelte 5におけるProxyオブジェクトの活用
description: Svelte 5のリアクティビティシステムにおけるProxyの広範な活用について詳しく解説
---

Svelte 5では`$state`以外でも**広範囲にProxyオブジェクトを活用**しています。

## $stateによるリアクティビティ

`$state`は内部でProxyを使用して、オブジェクトや配列への読み書きを監視します。

```typescript
let user = $state({
  name: '太郎',
  age: 25
});

// Proxyにより、プロパティへのアクセスや変更が追跡される
user.age++; // 自動的にUIが更新される
```

## ビルトインクラスのリアクティブ拡張

Svelte 5では、以下のネイティブクラスも`$state()`と組み合わせることで**自動的にProxyでラップ**されます。

```typescript
// Map
let myMap = $state(new Map());
myMap.set('key', 'value'); // Proxyによりリアクティブに

// Set
let mySet = $state(new Set(['A']));
mySet.add('B'); // 変更が自動追跡

// Date
let now = $state(new Date());
now.setHours(10); // UIが更新される

// URL
let url = $state(new URL('https://example.com'));
url.searchParams.set('query', 'svelte'); // 変更検知

// URLSearchParams
let params = $state(new URLSearchParams('a=1'));
params.set('b', '2'); // リアクティブに更新
```

## $derivedと$effectの依存関係追跡

`$derived`と`$effect`も内部的にProxyの仕組みを利用して、依存関係を自動追跡しています。

```typescript
let count = $state(0);
let items = $state([1, 2, 3]);

// Proxyによって、countとitemsへのアクセスが追跡される
let total = $derived(() => {
  return count + items.length; // 両方の依存関係が自動検出
});

// effectも同様に依存関係を追跡
$effect(() => {
  console.log(`Count: ${count}, Items: ${items.length}`);
  // countまたはitemsが変更されると再実行
});
```

## 深いリアクティビティの実現

Proxyの再帰的な適用により、ネストされたオブジェクトも自動的にリアクティブになります。

```typescript
let data = $state({
  user: {
    profile: {
      settings: {
        theme: 'dark'
      }
    }
  }
});

// 深くネストされたプロパティもProxyで追跡
data.user.profile.settings.theme = 'light'; // UIが更新される
```

## 配列メソッドの追跡

Svelte 5では、Proxyによって配列の破壊的メソッドも追跡可能になりました。

```typescript
let items = $state([1, 2, 3]);

// これらすべてがProxyによって検知される
items.push(4);      // ✅ UI更新
items.pop();        // ✅ UI更新
items.splice(1, 1); // ✅ UI更新
items[0] = 10;      // ✅ UI更新
```

## まとめ

Svelte 5のリアクティビティシステムは、**Proxyを中核技術**として採用しています。

| 機能 | Proxyの使用 | 効果 |
|------|------------|------|
| `$state` | ✅ | オブジェクト・配列の変更を自動追跡 |
| ビルトインクラス | ✅ | Map/Set/Date等もリアクティブに |
| `$derived` | ✅ | 依存関係の自動検出 |
| `$effect` | ✅ | 必要な時だけ副作用を実行 |
| 深いリアクティビティ | ✅ | ネストされた構造も自動追跡 |

これにより、Angular（RxJS）のような明示的な状態管理と比べて、より**自然でシンプルなコード**が書けるようになっています。特に、TypeScriptとの相性も良く、型推論も正確に動作するのが大きな利点です。
