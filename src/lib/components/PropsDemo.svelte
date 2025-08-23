<script lang="ts">
  import Alert from './Alert.svelte';
  import Button from './Button.svelte';
  import Card from './Card.svelte';
  import SimpleFormField from './SimpleFormField.svelte';

  // デモ用の状態
  let formData = $state({
    username: '',
    email: '',
    message: '',
  });

  let errors = $state<Record<string, string>>({});
  let showSuccessAlert = $state(false);

  function handleButtonClick(variant: string, size: string) {
    alert(`${variant} ${size} ボタンがクリックされました！`);
  }

  function validateForm() {
    const newErrors: Record<string, string> = {};

    if (!formData.username || formData.username.trim() === '') {
      newErrors.username = 'ユーザー名は必須です';
    }
    if (!formData.email || formData.email.trim() === '') {
      newErrors.email = 'メールアドレスは必須です';
    } else if (!formData.email.includes('@')) {
      newErrors.email = '有効なメールアドレスを入力してください';
    }

    errors = newErrors;
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(event?: Event) {
    // フォームのデフォルトの送信を防ぐ
    if (event) {
      event.preventDefault();
    }

    console.log('Form data before validation:', $state.snapshot(formData));
    if (validateForm()) {
      showSuccessAlert = true;
      setTimeout(() => {
        showSuccessAlert = false;
      }, 3000);
      // フォームをリセット
      formData = { username: '', email: '', message: '' };
      errors = {};
    } else {
      console.log('Validation errors:', $state.snapshot(errors));
    }
  }
</script>

<div class="demo-container">
  <h2>🎨 $propsを使ったコンポーネントライブラリ</h2>

  <!-- ボタンコンポーネント -->
  <section class="component-section">
    <h3>Buttonコンポーネント</h3>
    <div class="button-grid">
      <Button
        onClick={() => handleButtonClick('primary', 'small')}
        size="small"
      >
        Small Primary
      </Button>
      <Button onClick={() => handleButtonClick('primary', 'medium')}>
        Medium Primary
      </Button>
      <Button
        onClick={() => handleButtonClick('primary', 'large')}
        size="large"
      >
        Large Primary
      </Button>

      <Button
        variant="secondary"
        size="small"
        onClick={() => handleButtonClick('secondary', 'small')}
      >
        Small Secondary
      </Button>
      <Button
        variant="secondary"
        onClick={() => handleButtonClick('secondary', 'medium')}
      >
        Medium Secondary
      </Button>
      <Button
        variant="secondary"
        size="large"
        onClick={() => handleButtonClick('secondary', 'large')}
      >
        Large Secondary
      </Button>

      <Button
        variant="danger"
        size="small"
        onClick={() => handleButtonClick('danger', 'small')}
      >
        Small Danger
      </Button>
      <Button
        variant="danger"
        onClick={() => handleButtonClick('danger', 'medium')}
      >
        Medium Danger
      </Button>
      <Button
        variant="danger"
        size="large"
        onClick={() => handleButtonClick('danger', 'large')}
      >
        Large Danger
      </Button>
    </div>

    <div class="button-group">
      <Button disabled>無効なボタン</Button>
      <Button variant="secondary">
        <span class="icon">📦</span> アイコン付き
      </Button>
    </div>
  </section>

  <!-- カードコンポーネント -->
  <section class="component-section">
    <h3>Cardコンポーネント</h3>
    <div class="card-grid">
      <Card title="基本カード" subtitle="シンプルなカード">
        これは基本的なカードコンポーネントです。$propsを使って親から必要なデータを受け取っています。
      </Card>

      <Card
        title="画像付きカード"
        subtitle="ビジュアル重視"
        image="placeholder"
      >
        プレースホルダー画像を使用したカードです。実際のプロジェクトでは画像URLを渡します。
      </Card>

      <Card title="アクション付き" subtitle="インタラクティブ">
        {#snippet footer()}
          <Button size="small">詳細</Button>
          <Button variant="secondary" size="small">共有</Button>
        {/snippet}
        フッターにアクションボタンがあります。Snippetを使って柔軟なレイアウトを実現しています。
      </Card>
    </div>
  </section>

  <!-- アラートコンポーネント -->
  <section class="component-section">
    <h3>Alertコンポーネント</h3>

    {#if showSuccessAlert}
      <Alert
        type="success"
        title="成功"
        dismissible
        onDismiss={() => (showSuccessAlert = false)}
      >
        フォームが正常に送信されました！
      </Alert>
    {/if}

    <Alert type="info" title="情報">
      これは情報アラートです。重要な情報をユーザーに伝えます。
    </Alert>

    <Alert type="warning" title="警告" dismissible>
      この操作には注意が必要です。dismissibleプロパティで閉じることができます。
    </Alert>

    <Alert type="error" title="エラー">
      問題が発生しました。エラーの詳細を確認してください。
    </Alert>
  </section>

  <!-- フォームコンポーネント -->
  <section class="component-section">
    <h3>FormFieldコンポーネント</h3>
    <form onsubmit={handleSubmit}>
      <SimpleFormField
        label="ユーザー名"
        required
        bind:value={formData.username}
        error={errors.username}
        placeholder="ユーザー名を入力"
      />

      <SimpleFormField
        label="メールアドレス"
        type="email"
        required
        bind:value={formData.email}
        error={errors.email}
        helpText={!errors.email
          ? '連絡先のメールアドレスを入力してください'
          : undefined}
        placeholder="email@example.com"
      />

      <SimpleFormField
        label="メッセージ"
        bind:value={formData.message}
        helpText="任意のメッセージを入力できます"
        placeholder="メッセージを入力..."
      />

      <div class="form-actions">
        <button type="submit" class="btn btn-primary"> 送信 </button>
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
</div>

<style>
  .demo-container {
    padding: 2rem;
    background: #bbb;
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

  .card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
  }

  .form-actions {
    display: flex;
    gap: 1rem;
  }

  .icon {
    display: inline-block;
  }

  @media (max-width: 768px) {
    .button-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
