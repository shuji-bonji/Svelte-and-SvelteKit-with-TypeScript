<script lang="ts">
  import BindableInput from './BindableInput.svelte';
  import BindableCheckbox from './BindableCheckbox.svelte';
  
  // フォームの状態
  let username = $state('');
  let email = $state('');
  let password = $state('');
  
  // チェックボックスの状態
  let acceptTerms = $state(false);
  let receiveNewsletter = $state(false);
  let enableNotifications = $state(false);
  
  // バリデーション
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
    password.length >= 8 &&
    acceptTerms
  );
  
  // フォーム送信
  function handleSubmit() {
    if (isValid) {
      alert(`送信完了！\nユーザー名: ${username}\nメール: ${email}\nニュースレター: ${receiveNewsletter ? 'はい' : 'いいえ'}\n通知: ${enableNotifications ? 'はい' : 'いいえ'}`);
    }
  }
  
  // リセット
  function handleReset() {
    username = '';
    email = '';
    password = '';
    acceptTerms = false;
    receiveNewsletter = false;
    enableNotifications = false;
  }
</script>

<div class="demo-container">
  <h3>$bindableコンポーネントデモ</h3>
  
  <form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
    <section class="form-section">
      <h4>基本情報</h4>
      
      <BindableInput 
        bind:value={username}
        label="ユーザー名"
        placeholder="3文字以上で入力"
        error={usernameError}
      />
      
      <BindableInput 
        bind:value={email}
        label="メールアドレス"
        type="email"
        placeholder="email@example.com"
        error={emailError}
      />
      
      <BindableInput 
        bind:value={password}
        label="パスワード"
        type="password"
        placeholder="8文字以上で入力"
        error={passwordError}
      />
    </section>
    
    <section class="form-section">
      <h4>オプション設定</h4>
      
      <div class="checkbox-group">
        <BindableCheckbox 
          bind:checked={acceptTerms}
          label="利用規約に同意する（必須）"
        />
        
        <BindableCheckbox 
          bind:checked={receiveNewsletter}
          label="ニュースレターを受け取る"
        />
        
        <BindableCheckbox 
          bind:checked={enableNotifications}
          label="通知を有効にする"
        />
      </div>
    </section>
    
    <div class="form-actions">
      <button 
        type="submit"
        disabled={!isValid}
        class="submit-btn"
      >
        送信
      </button>
      
      <button 
        type="button"
        onclick={handleReset}
        class="reset-btn"
      >
        リセット
      </button>
    </div>
  </form>
  
  <div class="status-panel">
    <h4>現在の状態</h4>
    <ul>
      <li>ユーザー名: <strong>{username || '(未入力)'}</strong></li>
      <li>メール: <strong>{email || '(未入力)'}</strong></li>
      <li>パスワード: <strong>{password ? '●'.repeat(password.length) : '(未入力)'}</strong></li>
      <li>利用規約: <strong>{acceptTerms ? '✅ 同意' : '❌ 未同意'}</strong></li>
      <li>ニュースレター: <strong>{receiveNewsletter ? '✅ 受信する' : '❌ 受信しない'}</strong></li>
      <li>通知: <strong>{enableNotifications ? '✅ 有効' : '❌ 無効'}</strong></li>
    </ul>
  </div>
</div>

<style>
  .demo-container {
    padding: 1.5rem;
    background: linear-gradient(to bottom, #f8fafc, #f1f5f9);
    border-radius: 12px;
    border: 1px solid rgba(0, 0, 0, 0.08);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    box-sizing: border-box;
  }

  :global(.dark) .demo-container {
    background: linear-gradient(to bottom, #1e293b, #0f172a);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  }

  h3 {
    margin: 0 0 1.5rem 0;
    color: #1e293b;
  }

  :global(.dark) h3 {
    color: #e2e8f0;
  }

  .form-section {
    margin-bottom: 1.5rem;
    padding: 1.25rem;
    background: white;
    border-radius: 8px;
    border: 1px solid rgba(0, 0, 0, 0.06);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
    box-sizing: border-box;
    overflow: hidden;
  }

  :global(.dark) .form-section {
    background: #0f172a;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .form-section h4 {
    margin: 0 0 1rem 0;
    color: #475569;
    font-size: 0.95rem;
    font-weight: 600;
  }

  :global(.dark) .form-section h4 {
    color: #e2e8f0;
  }

  .checkbox-group {
    display: flex;
    flex-direction: column;
    gap: 0.875rem;
    padding: 0.75rem;
    background: #fafbfc;
    border-radius: 6px;
    border: 1px solid rgba(0, 0, 0, 0.05);
  }

  :global(.dark) .checkbox-group {
    background: #1e293b;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .form-actions {
    display: flex;
    gap: 0.75rem;
    margin-top: 1.5rem;
  }

  .submit-btn, .reset-btn {
    padding: 0.625rem 1.25rem;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .submit-btn {
    background: #22c55e;
    color: white;
  }

  .submit-btn:hover:not(:disabled) {
    background: #16a34a;
  }

  .submit-btn:disabled {
    background: var(--sp-color-gray-400);
    cursor: not-allowed;
    opacity: 0.6;
  }

  .reset-btn {
    background: var(--sp-color-gray-500);
    color: white;
  }

  .reset-btn:hover {
    background: var(--sp-color-gray-600);
  }

  .status-panel {
    margin-top: 1.5rem;
    padding: 1.25rem;
    background: white;
    border-radius: 8px;
    border: 2px solid #e2e8f0;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  }

  :global(.dark) .status-panel {
    background: #0f172a;
    border: 2px solid rgba(255, 255, 255, 0.1);
  }

  .status-panel h4 {
    margin: 0 0 0.75rem 0;
    color: #475569;
    font-size: 0.95rem;
  }

  :global(.dark) .status-panel h4 {
    color: #e2e8f0;
  }

  .status-panel ul {
    margin: 0;
    padding-left: 1.5rem;
  }

  .status-panel li {
    margin: 0.5rem 0;
    color: #64748b;
    font-size: 0.875rem;
  }

  :global(.dark) .status-panel li {
    color: #cbd5e1;
  }

  .status-panel strong {
    color: #1e293b;
  }

  :global(.dark) .status-panel strong {
    color: #f8fafc;
  }
</style>