<script lang="ts">
  // チェックボックスの状態管理
  let acceptTerms = $state(false);
  let receiveNewsletter = $state(false);
  let enableNotifications = $state(false);
  
  // 全選択の状態
  let selectAll = $state(false);
  
  // 全選択の処理
  $effect(() => {
    if (selectAll) {
      acceptTerms = true;
      receiveNewsletter = true;
      enableNotifications = true;
    }
  });
  
  // 個別チェックボックスの変更を監視
  $effect(() => {
    if (!acceptTerms || !receiveNewsletter || !enableNotifications) {
      selectAll = false;
    }
  });
</script>

<div class="checkbox-demo">
  <h4>設定オプション</h4>
  
  <div class="checkbox-group">
    <label class="checkbox-label">
      <input 
        type="checkbox" 
        bind:checked={selectAll}
        class="checkbox-input"
      />
      <span class="checkmark"></span>
      <span class="label-text">すべて選択</span>
    </label>
  </div>
  
  <hr />
  
  <div class="checkbox-group">
    <label class="checkbox-label">
      <input 
        type="checkbox" 
        bind:checked={acceptTerms}
        class="checkbox-input"
      />
      <span class="checkmark"></span>
      <span class="label-text">利用規約に同意する</span>
    </label>
    
    <label class="checkbox-label">
      <input 
        type="checkbox" 
        bind:checked={receiveNewsletter}
        class="checkbox-input"
      />
      <span class="checkmark"></span>
      <span class="label-text">ニュースレターを受け取る</span>
    </label>
    
    <label class="checkbox-label">
      <input 
        type="checkbox" 
        bind:checked={enableNotifications}
        class="checkbox-input"
      />
      <span class="checkmark"></span>
      <span class="label-text">通知を有効にする</span>
    </label>
  </div>
  
  <div class="status">
    <h5>選択状態:</h5>
    <ul>
      <li>利用規約: {acceptTerms ? '✅ 同意' : '❌ 未同意'}</li>
      <li>ニュースレター: {receiveNewsletter ? '✅ 受信する' : '❌ 受信しない'}</li>
      <li>通知: {enableNotifications ? '✅ 有効' : '❌ 無効'}</li>
    </ul>
  </div>
</div>

<style>
  .checkbox-demo {
    padding: 1.5rem;
    background: var(--sp-color-gray-100);
    border-radius: 8px;
  }
  
  .checkbox-group {
    margin: 1rem 0;
  }
  
  .checkbox-label {
    display: flex;
    align-items: center;
    margin-bottom: 0.75rem;
    cursor: pointer;
    user-select: none;
  }
  
  .checkbox-input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
  }
  
  .checkmark {
    position: relative;
    height: 20px;
    width: 20px;
    background-color: white;
    border: 2px solid var(--sp-color-gray-400);
    border-radius: 4px;
    margin-right: 0.5rem;
    transition: all 0.2s;
  }
  
  .checkbox-input:checked ~ .checkmark {
    background-color: #22c55e;
    border-color: #22c55e;
  }
  
  .checkmark:after {
    content: "";
    position: absolute;
    display: none;
    left: 6px;
    top: 2px;
    width: 5px;
    height: 10px;
    border: solid white;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
  }
  
  .checkbox-input:checked ~ .checkmark:after {
    display: block;
  }
  
  .label-text {
    font-size: 0.95rem;
  }
  
  hr {
    margin: 1rem 0;
    border: none;
    border-top: 1px solid var(--sp-color-gray-300);
  }
  
  .status {
    margin-top: 1.5rem;
    padding: 1rem;
    background: white;
    border-radius: 4px;
  }
  
  .status h5 {
    margin: 0 0 0.5rem 0;
    color: var(--sp-color-gray-700);
  }
  
  .status ul {
    margin: 0;
    padding-left: 1.5rem;
  }
  
  .status li {
    margin: 0.25rem 0;
    color: var(--sp-color-gray-600);
    font-size: 0.9rem;
  }
</style>