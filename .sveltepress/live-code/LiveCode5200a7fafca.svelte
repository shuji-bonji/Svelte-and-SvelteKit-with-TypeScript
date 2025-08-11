<script lang="ts">
  import type { Snippet } from 'svelte';
  
  // === 1. Buttonコンポーネント ===
  // 内部コンポーネントとして定義
  function Button(props: {
    variant?: 'primary' | 'secondary' | 'danger';
    size?: 'small' | 'medium' | 'large';
    disabled?: boolean;
    onClick?: () => void;
    children: Snippet;
  }) {
    const { 
      variant = 'primary', 
      size = 'medium', 
      disabled = false,
      onClick,
      children 
    } = props;
    
    return {
      variant,
      size,
      disabled,
      onClick,
      children
    };
  }
  
  // === 2. Cardコンポーネント用の型定義 ===
  type CardProps = {
    title: string;
    subtitle?: string;
    image?: string;
    footer?: Snippet;
    children: Snippet;
  };
  
  // === 3. Alertコンポーネント用の型定義 ===
  type AlertProps = {
    type: 'info' | 'success' | 'warning' | 'error';
    title?: string;
    dismissible?: boolean;
    onDismiss?: () => void;
    children: Snippet;
  };
  
  // === 4. FormFieldコンポーネント用の型定義 ===
  type FormFieldProps = {
    label: string;
    required?: boolean;
    error?: string;
    helpText?: string;
    children: Snippet;
  };
  
  // === デモ用の状態管理 ===
  let showAlert = $state(true);
  let formData = $state({
    username: '',
    email: '',
    message: ''
  });
  let errors = $state<Record<string, string>>({});
  
  // バリデーション
  function validateForm() {
    errors = {};
    
    if (!formData.username) {
      errors.username = 'ユーザー名は必須です';
    }
    if (!formData.email) {
      errors.email = 'メールアドレスは必須です';
    } else if (!formData.email.includes('@')) {
      errors.email = '有効なメールアドレスを入力してください';
    }
    if (!formData.message) {
      errors.message = 'メッセージは必須です';
    }
    
    return Object.keys(errors).length === 0;
  }
  
  function handleSubmit() {
    if (validateForm()) {
      alert('フォームが送信されました！\n' + JSON.stringify(formData, null, 2));
      formData = { username: '', email: '', message: '' };
    }
  }
</script>

<div class="demo-container">
  <h2>🎨 コンポーネントライブラリデモ</h2>
  
  <!-- ボタンコンポーネント -->
  <section class="component-section">
    <h3>ボタンコンポーネント</h3>
    <div class="button-grid">
      {#each ['primary', 'secondary', 'danger'] as variant}
        {#each ['small', 'medium', 'large'] as size}
          <button
            class="btn btn-{variant} btn-{size}"
            onclick={() => alert(`${variant} ${size} clicked!`)}
          >
            {variant} {size}
          </button>
        {/each}
      {/each}
    </div>
    
    <div class="button-group">
      <button class="btn btn-primary" disabled>
        無効なボタン
      </button>
      <button class="btn btn-secondary">
        <span class="icon">📦</span> アイコン付き
      </button>
    </div>
  </section>
  
  <!-- カードコンポーネント -->
  <section class="component-section">
    <h3>カードコンポーネント</h3>
    <div class="card-grid">
      {#each [
        { title: '基本カード', subtitle: 'シンプルなカード', content: 'これは基本的なカードコンポーネントです。' },
        { title: '画像付きカード', subtitle: 'ビジュアル重視', content: 'プレースホルダー画像を使用したカードです。', hasImage: true },
        { title: 'アクション付き', subtitle: 'インタラクティブ', content: 'フッターにアクションボタンがあります。', hasFooter: true }
      ] as card}
        <div class="card">
          {#if card.hasImage}
            <div class="card-image">
              <div class="placeholder-image">📷</div>
            </div>
          {/if}
          <div class="card-header">
            <h4>{card.title}</h4>
            {#if card.subtitle}
              <p class="card-subtitle">{card.subtitle}</p>
            {/if}
          </div>
          <div class="card-body">
            <p>{card.content}</p>
          </div>
          {#if card.hasFooter}
            <div class="card-footer">
              <button class="btn btn-primary btn-small">詳細</button>
              <button class="btn btn-secondary btn-small">共有</button>
            </div>
          {/if}
        </div>
      {/each}
    </div>
  </section>
  
  <!-- アラートコンポーネント -->
  <section class="component-section">
    <h3>アラートコンポーネント</h3>
    {#if showAlert}
      <div class="alert alert-info">
        <div class="alert-content">
          <strong>情報:</strong> これは情報アラートです
        </div>
        <button class="alert-close" onclick={() => showAlert = false}>×</button>
      </div>
    {/if}
    
    <div class="alert alert-success">
      <div class="alert-content">
        <strong>成功:</strong> 操作が正常に完了しました
      </div>
    </div>
    
    <div class="alert alert-warning">
      <div class="alert-content">
        <strong>警告:</strong> この操作には注意が必要です
      </div>
    </div>
    
    <div class="alert alert-error">
      <div class="alert-content">
        <strong>エラー:</strong> 問題が発生しました
      </div>
    </div>
  </section>
  
  <!-- フォームコンポーネント -->
  <section class="component-section">
    <h3>フォームコンポーネント</h3>
    <form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
      <div class="form-field">
        <label class="form-label">
          ユーザー名 <span class="required">*</span>
        </label>
        <input 
          type="text" 
          class="form-input" 
          class:error={!!errors.username}
          bind:value={formData.username}
          placeholder="ユーザー名を入力"
        />
        {#if errors.username}
          <span class="error-text">{errors.username}</span>
        {/if}
      </div>
      
      <div class="form-field">
        <label class="form-label">
          メールアドレス <span class="required">*</span>
        </label>
        <input 
          type="email" 
          class="form-input"
          class:error={!!errors.email}
          bind:value={formData.email}
          placeholder="email@example.com"
        />
        {#if errors.email}
          <span class="error-text">{errors.email}</span>
        {:else}
          <span class="help-text">連絡先のメールアドレスを入力してください</span>
        {/if}
      </div>
      
      <div class="form-field">
        <label class="form-label">
          メッセージ <span class="required">*</span>
        </label>
        <textarea 
          class="form-input"
          class:error={!!errors.message}
          bind:value={formData.message}
          rows="4"
          placeholder="メッセージを入力..."
        ></textarea>
        {#if errors.message}
          <span class="error-text">{errors.message}</span>
        {/if}
      </div>
      
      <div class="form-actions">
        <button type="submit" class="btn btn-primary">
          送信
        </button>
        <button 
          type="button" 
          class="btn btn-secondary"
          onclick={() => {
            formData = { username: '', email: '', message: '' };
            errors = {};
          }}
        >
          リセット
        </button>
      </div>
    </form>
  </section>
  
  <!-- タグコンポーネント -->
  <section class="component-section">
    <h3>タグコンポーネント</h3>
    <div class="tags">
      {#each ['JavaScript', 'TypeScript', 'Svelte', 'React', 'Vue'] as tag}
        <span class="tag">{tag}</span>
      {/each}
      <span class="tag tag-primary">Primary</span>
      <span class="tag tag-success">Success</span>
      <span class="tag tag-warning">Warning</span>
      <span class="tag tag-danger">Danger</span>
    </div>
  </section>
</div>

<style>
  .demo-container {
    padding: 2rem;
    background: #f9f9f9;
    border-radius: 8px;
  }
  
  h2 {
    color: #ff3e00;
    margin-bottom: 2rem;
    text-align: center;
  }
  
  .component-section {
    margin-bottom: 3rem;
  }
  
  .component-section h3 {
    color: #333;
    margin-bottom: 1.5rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid #ff3e00;
  }
  
  /* ボタンスタイル */
  .button-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    margin-bottom: 1rem;
  }
  
  .button-group {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
  }
  
  .btn {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .btn-primary {
    background: #ff3e00;
    color: white;
  }
  
  .btn-primary:hover:not(:disabled) {
    background: #ff5a00;
  }
  
  .btn-secondary {
    background: #6c757d;
    color: white;
  }
  
  .btn-secondary:hover:not(:disabled) {
    background: #5a6268;
  }
  
  .btn-danger {
    background: #dc3545;
    color: white;
  }
  
  .btn-danger:hover:not(:disabled) {
    background: #c82333;
  }
  
  .btn-small {
    padding: 0.25rem 0.5rem;
    font-size: 0.875rem;
  }
  
  .btn-medium {
    padding: 0.5rem 1rem;
    font-size: 1rem;
  }
  
  .btn-large {
    padding: 0.75rem 1.5rem;
    font-size: 1.125rem;
  }
  
  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  /* カードスタイル */
  .card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
  }
  
  .card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    overflow: hidden;
  }
  
  .card-image {
    height: 150px;
    background: #f0f0f0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .placeholder-image {
    font-size: 3rem;
  }
  
  .card-header {
    padding: 1rem;
    border-bottom: 1px solid #eee;
  }
  
  .card-header h4 {
    margin: 0;
    color: #333;
  }
  
  .card-subtitle {
    margin: 0.25rem 0 0;
    color: #666;
    font-size: 0.875rem;
  }
  
  .card-body {
    padding: 1rem;
  }
  
  .card-footer {
    padding: 1rem;
    border-top: 1px solid #eee;
    display: flex;
    gap: 0.5rem;
  }
  
  /* アラートスタイル */
  .alert {
    padding: 1rem;
    border-radius: 4px;
    margin-bottom: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .alert-content {
    flex: 1;
  }
  
  .alert-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .alert-info {
    background: #cfe2ff;
    color: #084298;
    border: 1px solid #b6d4fe;
  }
  
  .alert-success {
    background: #d1e7dd;
    color: #0f5132;
    border: 1px solid #badbcc;
  }
  
  .alert-warning {
    background: #fff3cd;
    color: #856404;
    border: 1px solid #ffecb5;
  }
  
  .alert-error {
    background: #f8d7da;
    color: #842029;
    border: 1px solid #f5c2c7;
  }
  
  /* フォームスタイル */
  .form-field {
    margin-bottom: 1.5rem;
  }
  
  .form-label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #333;
  }
  
  .required {
    color: #dc3545;
  }
  
  .form-input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
  }
  
  .form-input:focus {
    outline: none;
    border-color: #ff3e00;
    box-shadow: 0 0 0 2px rgba(255, 62, 0, 0.1);
  }
  
  .form-input.error {
    border-color: #dc3545;
  }
  
  textarea.form-input {
    resize: vertical;
    font-family: inherit;
  }
  
  .error-text {
    display: block;
    color: #dc3545;
    font-size: 0.875rem;
    margin-top: 0.25rem;
  }
  
  .help-text {
    display: block;
    color: #6c757d;
    font-size: 0.875rem;
    margin-top: 0.25rem;
  }
  
  .form-actions {
    display: flex;
    gap: 1rem;
  }
  
  /* タグスタイル */
  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .tag {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    background: #e9ecef;
    color: #495057;
    border-radius: 20px;
    font-size: 0.875rem;
    font-weight: 500;
  }
  
  .tag-primary {
    background: #ff3e00;
    color: white;
  }
  
  .tag-success {
    background: #28a745;
    color: white;
  }
  
  .tag-warning {
    background: #ffc107;
    color: #000;
  }
  
  .tag-danger {
    background: #dc3545;
    color: white;
  }
</style>