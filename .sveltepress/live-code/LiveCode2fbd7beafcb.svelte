<script lang="ts">
  interface User {
    name: string;
    age: number;
    email: string;
  }
  
  // オブジェクト全体がリアクティブ
  let user = $state<User>({
    name: '太郎',
    age: 25,
    email: 'taro@example.com'
  });
  
  // プロパティの更新
  function updateName(newName: string) {
    user.name = newName; // UIが自動更新される
  }
  
  // オブジェクト全体の置き換え
  function resetUser() {
    user = {
      name: '新しいユーザー',
      age: 0,
      email: ''
    };
  }
</script>

<input bind:value={user.name} />
<input type="number" bind:value={user.age} />
<input type="email" bind:value={user.email} />

<p>名前: {user.name}</p>
<p>年齢: {user.age}</p>
<p>メール: {user.email}</p>