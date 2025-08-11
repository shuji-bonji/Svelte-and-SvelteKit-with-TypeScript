<!-- UserForm.svelte -->
<script lang="ts">
  // フォームデータの型
  interface FormData {
    name: string;
    email: string;
    age: number;
    role: 'admin' | 'user' | 'guest';
  }
  
  // バリデーションエラーの型
  type FormErrors = Partial<Record<keyof FormData, string>>;
  
  // フォームの状態
  let formData: FormData = {
    name: '',
    email: '',
    age: 20,
    role: 'user'
  };
  
  let errors: FormErrors = {};
  let submitted = false;
  let submittedData: FormData | null = null;
  
  // バリデーション
  function validate(): boolean {
    errors = {};
    
    if (!formData.name.trim()) {
      errors.name = '名前は必須です';
    } else if (formData.name.length < 2) {
      errors.name = '名前は2文字以上で入力してください';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'メールアドレスは必須です';
    } else if (!formData.email.includes('@')) {
      errors.email = '有効なメールアドレスを入力してください';
    }
    
    if (formData.age < 0 || formData.age > 120) {
      errors.age = '年齢は0〜120の間で入力してください';
    }
    
    return Object.keys(errors).length === 0;
  }
  
  // リアルタイムバリデーション（名前フィールド）
  function validateName(): void {
    if (!formData.name.trim()) {
      errors.name = '名前は必須です';
    } else if (formData.name.length < 2) {
      errors.name = '名前は2文字以上で入力してください';
    } else {
      delete errors.name;
    }
    errors = errors; // リアクティビティのトリガー
  }
  
  // リアルタイムバリデーション（メールフィールド）
  function validateEmail(): void {
    if (!formData.email.trim()) {
      errors.email = 'メールアドレスは必須です';
    } else if (!formData.email.includes('@')) {
      errors.email = '有効なメールアドレスを入力してください';
    } else {
      delete errors.email;
    }
    errors = errors; // リアクティビティのトリガー
  }
  
  // 送信処理
  function handleSubmit(event: SubmitEvent): void {
    event.preventDefault();
    
    if (validate()) {
      submitted = true;
      submittedData = { ...formData };
      
      // 3秒後に成功メッセージを非表示にする
      setTimeout(() => {
        submitted = false;
      }, 3000);
    }
  }
  
  // リセット処理
  function handleReset(): void {
    formData = {
      name: '',
      email: '',
      age: 20,
      role: 'user'
    };
    errors = {};
    submitted = false;
    submittedData = null;
  }
</script>

<div class="demo-container">
  <h3>🎯 ライブデモ: 型安全なフォームコンポーネント</h3>
  
  <form on:submit={handleSubmit} novalidate>
    <div class="form-group">
      <label for="name">
        名前 <span class="required">*</span>
      </label>
      <input
        id="name"
        type="text"
        bind:value={formData.name}
        on:blur={validateName}
        class:error={errors.name}
        placeholder="山田太郎"
      />
      {#if errors.name}
        <p class="error-message">{errors.name}</p>
      {/if}
    </div>
    
    <div class="form-group">
      <label for="email">
        メールアドレス <span class="required">*</span>
      </label>
      <input
        id="email"
        type="email"
        bind:value={formData.email}
        on:blur={validateEmail}
        class:error={errors.email}
        placeholder="example@example.com"
      />
      {#if errors.email}
        <p class="error-message">{errors.email}</p>
      {/if}
    </div>
    
    <div class="form-group">
      <label for="age">
        年齢
      </label>
      <input
        id="age"
        type="number"
        bind:value={formData.age}
        class:error={errors.age}
        min="0"
        max="120"
      />
      {#if errors.age}
        <p class="error-message">{errors.age}</p>
      {/if}
    </div>
    
    <div class="form-group">
      <label for="role">
        役割
      </label>
      <select id="role" bind:value={formData.role}>
        <option value="admin">管理者</option>
        <option value="user">ユーザー</option>
        <option value="guest">ゲスト</option>
      </select>
    </div>
    
    <div class="button-group">
      <button type="submit" class="btn-primary">
        送信
      </button>
      <button type="button" class="btn-secondary" on:click={handleReset}>
        リセット
      </button>
    </div>
  </form>
  
  {#if submitted && submittedData}
    <div class="success-message">
      <h4>✅ フォームが正常に送信されました！</h4>
      <div class="submitted-data">
        <p><strong>送信されたデータ:</strong></p>
        <pre>{JSON.stringify(submittedData, null, 2)}</pre>
      </div>
    </div>
  {/if}
</div>

<style>
  .demo-container {
    padding: 1.5rem;
    background: var(--vp-c-bg-soft);
    border-radius: 8px;
    margin: 2rem 0;
  }
  
  h3 {
    margin-top: 0;
    margin-bottom: 1.5rem;
    color: var(--vp-c-text-1);
  }
  
  h4 {
    margin-top: 1.5rem;
    margin-bottom: 0.5rem;
    color: var(--vp-c-text-1);
  }
  
  .form-group {
    margin-bottom: 1.25rem;
  }
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: var(--vp-c-text-1);
  }
  
  .required {
    color: #dc2626;
  }
  
  input,
  select {
    width: 100%;
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--vp-c-divider);
    border-radius: 4px;
    background: var(--vp-c-bg);
    color: var(--vp-c-text-1);
    font-size: 0.95rem;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  
  input:focus,
  select:focus {
    outline: none;
    border-color: var(--vp-c-brand);
    box-shadow: 0 0 0 3px rgba(255, 62, 0, 0.1);
  }
  
  input.error {
    border-color: #dc2626;
  }
  
  input.error:focus {
    box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
  }
  
  .error-message {
    margin-top: 0.25rem;
    color: #dc2626;
    font-size: 0.875rem;
  }
  
  .button-group {
    display: flex;
    gap: 1rem;
    margin-top: 1.5rem;
  }
  
  button {
    padding: 0.5rem 1.5rem;
    border: none;
    border-radius: 4px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s, transform 0.1s;
  }
  
  button:active {
    transform: translateY(1px);
  }
  
  .btn-primary {
    background: var(--vp-c-brand);
    color: white;
  }
  
  .btn-primary:hover {
    background: var(--vp-c-brand-dark);
  }
  
  .btn-secondary {
    background: var(--vp-c-gray-soft);
    color: var(--vp-c-text-1);
  }
  
  .btn-secondary:hover {
    background: var(--vp-c-gray);
  }
  
  .success-message {
    margin-top: 1.5rem;
    padding: 1rem;
    background: #10b98114;
    border: 1px solid #10b981;
    border-radius: 4px;
    animation: slideIn 0.3s ease-out;
  }
  
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .submitted-data {
    margin-top: 1rem;
  }
  
  .submitted-data p {
    margin-bottom: 0.5rem;
    color: var(--vp-c-text-1);
  }
  
  pre {
    padding: 0.75rem;
    background: var(--vp-c-bg);
    border-radius: 4px;
    overflow-x: auto;
    font-size: 0.875rem;
    color: var(--vp-c-text-1);
  }
  
  .type-info {
    margin-top: 2rem;
    padding: 1rem;
    background: var(--vp-c-bg);
    border-radius: 4px;
    border: 1px solid var(--vp-c-divider);
  }
  
  .type-info code {
    color: var(--vp-c-text-code);
  }
  
  .note {
    margin-top: 0.75rem;
    font-size: 0.875rem;
    color: var(--vp-c-text-2);
    line-height: 1.6;
  }
  
  /* ダークモード対応 */
  :global(.dark) .demo-container {
    background: rgba(30, 30, 30, 0.5);
  }
  
  :global(.dark) input,
  :global(.dark) select {
    background: #1a1a1a;
  }
  
  :global(.dark) .type-info {
    background: #1a1a1a;
  }
  
  :global(.dark) pre {
    background: #0a0a0a;
  }
</style>