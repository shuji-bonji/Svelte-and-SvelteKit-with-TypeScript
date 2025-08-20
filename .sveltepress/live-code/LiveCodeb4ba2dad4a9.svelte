<script lang="ts">
  // フォームデータの型
  interface FormData {
    username: string;
    email: string;
    age: number;
    agreed: boolean;
  }
  
  // フォームエラーの型
  type FormErrors = Partial<Record<keyof FormData, string>>;
  
  // 状態
  let formData = $state<FormData>({
    username: '',
    email: '',
    age: 0,
    agreed: false
  });
  
  let errors = $state<FormErrors>({});
  
  // バリデーション
  function validate(): boolean {
    const newErrors: FormErrors = {};
    
    if (!formData.username) {
      newErrors.username = 'ユーザー名は必須です';
    }
    
    if (!formData.email.includes('@')) {
      newErrors.email = '有効なメールアドレスを入力してください';
    }
    
    if (formData.age < 18) {
      newErrors.age = '18歳以上である必要があります';
    }
    
    errors = newErrors;
    return Object.keys(newErrors).length === 0;
  }
  
  function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    if (validate()) {
      console.log('Form submitted:', formData);
    }
  }
</script>

<form onsubmit={handleSubmit}>
  <label>
    ユーザー名:
    <input bind:value={formData.username} />
    {#if errors.username}
      <span class="error">{errors.username}</span>
    {/if}
  </label>
  
  <label>
    メール:
    <input type="email" bind:value={formData.email} />
    {#if errors.email}
      <span class="error">{errors.email}</span>
    {/if}
  </label>
  
  <label>
    年齢:
    <input type="number" bind:value={formData.age} />
    {#if errors.age}
      <span class="error">{errors.age}</span>
    {/if}
  </label>
  
  <label>
    <input type="checkbox" bind:checked={formData.agreed} />
    利用規約に同意する
  </label>
  
  <button type="submit">送信</button>
</form>