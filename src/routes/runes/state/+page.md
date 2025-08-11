---
title: $stateルーン
description: Svelte 5のリアクティブな状態管理
---

## $stateとは

`$state`は、Svelte 5でリアクティブな値を作成するための基本的なルーンです。  
値が変更されると、それを使用しているコンポーネントが自動的に更新されます。

## 基本的な使い方

### プリミティブ値

```typescript
let count = $state(0);
let message = $state('Hello');
let isActive = $state(false);

function increment() {
  count++; // 自動的にUIが更新される
}
```

### オブジェクト

```typescript
let user = $state({
  name: '太郎',
  age: 25,
  email: 'taro@example.com'
});

// プロパティの変更も追跡される
user.name = '次郎'; // UIが更新される
user.age++; // UIが更新される
```

### 配列

```typescript
let items = $state<string[]>([]);

// 配列メソッドも追跡される
items.push('新しいアイテム'); // UIが更新される
items.pop(); // UIが更新される
items[0] = '変更'; // UIが更新される
```

## 深いリアクティビティ

`$state`は深いリアクティビティを持ちます。ネストされたオブジェクトのプロパティも自動的に追跡されます。

```typescript
let data = $state({
  user: {
    profile: {
      name: '太郎',
      settings: {
        theme: 'dark',
        notifications: true
      }
    }
  }
});

// ネストされたプロパティの変更も追跡
data.user.profile.settings.theme = 'light'; // UIが更新される
```

## クラスでの使用

```typescript
class Counter {
  value = $state(0);
  
  increment() {
    this.value++;
  }
  
  decrement() {
    this.value--;
  }
  
  reset() {
    this.value = 0;
  }
}

let counter = new Counter();
```

## $state.frozen

変更不可能なリアクティブ値を作成する場合は`$state.frozen`を使用します。

```typescript
let config = $state.frozen({
  apiUrl: 'https://api.example.com',
  version: '1.0.0'
});

// エラー: frozen オブジェクトは変更できない
// config.apiUrl = 'https://new-api.example.com';

// 新しいオブジェクトで置き換える必要がある
config = $state.frozen({
  apiUrl: 'https://new-api.example.com',
  version: '1.0.1'
});
```

## $state.snapshot

リアクティブな値の現在のスナップショットを取得します。

```typescript
let todos = $state([
  { id: 1, text: '買い物', done: false },
  { id: 2, text: '掃除', done: true }
]);

// スナップショットを取得（非リアクティブなコピー）
let snapshot = $state.snapshot(todos);

// LocalStorageに保存
localStorage.setItem('todos', JSON.stringify(snapshot));
```

## 実践例：フォーム管理

```typescript
type FormData = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
};

let form = $state<FormData>({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  terms: false
});

let errors = $state<Partial<FormData>>({});

function validate() {
  errors = {};
  
  if (form.username.length < 3) {
    errors.username = 'ユーザー名は3文字以上必要です';
  }
  
  if (!form.email.includes('@')) {
    errors.email = '有効なメールアドレスを入力してください';
  }
  
  if (form.password.length < 8) {
    errors.password = 'パスワードは8文字以上必要です';
  }
  
  if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'パスワードが一致しません';
  }
  
  if (!form.terms) {
    errors.terms = '利用規約に同意してください';
  }
  
  return Object.keys(errors).length === 0;
}

function handleSubmit() {
  if (validate()) {
    console.log('送信:', $state.snapshot(form));
  }
}
```

## ベストプラクティス

### 1. 型定義を明確に

```typescript
// ❌ 型推論に頼る
let items = $state([]);

// ✅ 明示的な型定義
let items = $state<Item[]>([]);
```

### 2. 初期値の設定

```typescript
// ❌ undefined から始める
let user = $state();

// ✅ 適切な初期値を設定
let user = $state<User | null>(null);
```

### 3. イミュータブルな更新

配列やオブジェクトを更新する際、新しいオブジェクトを作成することで予期しない副作用を防げます。

```typescript
// 配列の更新
let items = $state([1, 2, 3]);

// ミュータブルな更新（動作するが推奨されない）
items.push(4);

// イミュータブルな更新（推奨）
items = [...items, 4];

// オブジェクトの更新
let user = $state({ name: '太郎', age: 25 });

// イミュータブルな更新
user = { ...user, age: 26 };
```

## よくある間違い

### 1. 非リアクティブな値の変更

```typescript
// ❌ $stateを使わない
let count = 0;
count++; // UIは更新されない

// ✅ $stateを使う
let count = $state(0);
count++; // UIが更新される
```

### 2. リアクティビティの喪失

```typescript
let data = $state({ value: 10 });

// ❌ リアクティビティが失われる
let value = data.value;
value++; // data.valueは更新されない

// ✅ 参照を保持
data.value++; // 正しく更新される
```

## 技術的な詳細

`$state`がどのように動作するかをより深く理解したい場合は、以下のディープダイブ記事も参照してください。


:::note[RuneとProxyオブジェクト]
- [Svelte 5におけるProxyオブジェクトの活用](/deep-dive/leveraging-proxy-objects-in-svelte-5/) - `$state`の内部でProxyがどのように使われているか
- [$stateとProxyオブジェクト](/deep-dive/state-use-proxy-object/) - 実践的な例とパフォーマンス最適化
:::

## 次のステップ

`$state`の基本を理解したら、[$derived - 計算値](/runes/derived/)で派生値の作成方法を学びましょう。