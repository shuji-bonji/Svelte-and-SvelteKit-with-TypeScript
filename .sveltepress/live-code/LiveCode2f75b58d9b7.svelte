<script lang="ts">
  type FormData = {
    username: string;
    email: string;
    password: string;
    agreed: boolean;
  };
  
  let formData = $state<FormData>({
    username: '',
    email: '',
    password: '',
    agreed: false
  });
  
  let formErrors = $state<Partial<FormData>>({});
  let isValid = $derived(
    formData.username.length > 0 &&
    formData.email.includes('@') &&
    formData.password.length >= 8 &&
    formData.agreed
  );
  
  // フォームの状態を包括的に監視
  $inspect('フォームデータ:', formData);
  $inspect('エラー:', formErrors);
  $inspect('バリデーション結果:', isValid);
  
  function validateForm() {
    formErrors = {};
    
    if (formData.username.length < 3) {
      formErrors.username = 'ユーザー名は3文字以上必要です';
    }
    
    if (!formData.email.includes('@')) {
      formErrors.email = '有効なメールアドレスを入力してください';
    }
    
    if (formData.password.length < 8) {
      formErrors.password = 'パスワードは8文字以上必要です';
    }
  }
</script>

<form>
  <input 
    type="text" 
    bind:value={formData.username}
    oninput={validateForm}
    placeholder="ユーザー名"
  />
  
  <input 
    type="email" 
    bind:value={formData.email}
    oninput={validateForm}
    placeholder="メールアドレス"
  />
  
  <input 
    type="password" 
    bind:value={formData.password}
    oninput={validateForm}
    placeholder="パスワード"
  />
  
  <label>
    <input 
      type="checkbox" 
      bind:checked={formData.agreed}
    />
    利用規約に同意する
  </label>
  
  <button disabled={!isValid}>
    送信
  </button>
</form>