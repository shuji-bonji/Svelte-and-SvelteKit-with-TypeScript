<script lang="ts">
  // 双方向バインディングのデモ
  let username = $state('');
  let email = $state('');
  let password = $state('');
  
  // 入力値の検証
  let usernameError = $derived(
    username && username.length < 3 ? 'ユーザー名は3文字以上必要です' : ''
  );
  
  let emailError = $derived(
    email && !email.includes('@') ? '有効なメールアドレスを入力してください' : ''
  );
  
  let passwordError = $derived(
    password && password.length < 8 ? 'パスワードは8文字以上必要です' : ''
  );
  
  // フォームが有効かどうか
  let isValid = $derived(
    username.length >= 3 && 
    email.includes('@') && 
    password.length >= 8
  );
</script>

<div class="demo-container">
  <h4>フォーム入力の双方向バインディング</h4>
  
  <div class="input-group">
    <label>
      ユーザー名:
      <input 
        bind:value={username} 
        placeholder="ユーザー名を入力"
        class="custom-input"
        class:error={usernameError}
      />
    </label>
    {#if usernameError}
      <span class="error-message">{usernameError}</span>
    {/if}
  </div>
  
  <div class="input-group">
    <label>
      メール:
      <input 
        bind:value={email} 
        placeholder="メールアドレスを入力"
        type="email"
        class="custom-input"
        class:error={emailError}
      />
    </label>
    {#if emailError}
      <span class="error-message">{emailError}</span>
    {/if}
  </div>
  
  <div class="input-group">
    <label>
      パスワード:
      <input 
        bind:value={password} 
        placeholder="パスワードを入力"
        type="password"
        class="custom-input"
        class:error={passwordError}
      />
    </label>
    {#if passwordError}
      <span class="error-message">{passwordError}</span>
    {/if}
  </div>
  
  <button 
    onclick={() => { username = ''; email = ''; password = ''; }}
    class="clear-button"
    disabled={!username && !email && !password}
  >
    クリア
  </button>
  
  <button 
    class="submit-button"
    disabled={!isValid}
  >
    送信 {isValid ? '✓' : ''}
  </button>
</div>

<style>
  .demo-container {
    padding: 1.5rem;
    background: var(--sp-color-gray-100);
    border-radius: 8px;
  }
  
  .input-group {
    margin-bottom: 1rem;
  }
  
  .custom-input {
    display: block;
    width: 100%;
    padding: 0.5rem;
    margin-top: 0.25rem;
    border: 2px solid var(--sp-color-gray-300);
    border-radius: 4px;
    font-size: 1rem;
    transition: border-color 0.2s;
  }
  
  .custom-input:focus {
    outline: none;
    border-color: var(--sp-color-primary);
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
  }
  
  .custom-input.error {
    border-color: var(--sp-color-danger);
  }
  
  .error-message {
    display: block;
    color: var(--sp-color-danger);
    font-size: 0.875rem;
    margin-top: 0.25rem;
  }
  
  .clear-button, .submit-button {
    padding: 0.5rem 1rem;
    margin-right: 0.5rem;
    background: var(--sp-color-primary);
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: opacity 0.2s;
  }
  
  .submit-button {
    background: var(--sp-color-success);
  }
  
  .clear-button:hover:not(:disabled), 
  .submit-button:hover:not(:disabled) {
    opacity: 0.9;
  }
  
  .clear-button:disabled, 
  .submit-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>