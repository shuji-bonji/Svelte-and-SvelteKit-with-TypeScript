<script lang="ts">
  interface FormData {
    username: string;
    email: string;
    age: number;
    country: string;
    newsletter: boolean;
    interests: string[];
  }
  
  let formData = $state<FormData>({
    username: '',
    email: '',
    age: 0,
    country: 'japan',
    newsletter: false,
    interests: []
  });
  
  let availableInterests = ['プログラミング', 'デザイン', 'マーケティング', 'セールス'];
  
  function toggleInterest(interest: string) {
    const index = formData.interests.indexOf(interest);
    if (index > -1) {
      formData.interests.splice(index, 1);
    } else {
      formData.interests.push(interest);
    }
  }
  
  function submitForm() {
    console.log('送信データ:', formData);
    alert('フォームが送信されました！\n' + JSON.stringify(formData, null, 2));
  }
  
  function resetForm() {
    formData = {
      username: '',
      email: '',
      age: 0,
      country: 'japan',
      newsletter: false,
      interests: []
    };
  }
</script>

<div class="form-container">
  <h2>ユーザー登録フォーム</h2>
  
  <div class="form-group">
    <label for="username">ユーザー名:</label>
    <input
      id="username"
      type="text"
      bind:value={formData.username}
      placeholder="山田太郎"
    />
  </div>
  
  <div class="form-group">
    <label for="email">メールアドレス:</label>
    <input
      id="email"
      type="email"
      bind:value={formData.email}
      placeholder="email@example.com"
    />
  </div>
  
  <div class="form-group">
    <label for="age">年齢:</label>
    <input
      id="age"
      type="number"
      bind:value={formData.age}
      min="0"
      max="120"
    />
  </div>
  
  <div class="form-group">
    <label for="country">国:</label>
    <select id="country" bind:value={formData.country}>
      <option value="japan">日本</option>
      <option value="usa">アメリカ</option>
      <option value="uk">イギリス</option>
      <option value="other">その他</option>
    </select>
  </div>
  
  <div class="form-group">
    <label>
      <input
        type="checkbox"
        bind:checked={formData.newsletter}
      />
      ニュースレターを受け取る
    </label>
  </div>
  
  <div class="form-group">
    <label>興味のある分野:</label>
    <div class="checkbox-group">
      {#each availableInterests as interest}
        <label>
          <input
            type="checkbox"
            checked={formData.interests.includes(interest)}
            onchange={() => toggleInterest(interest)}
          />
          {interest}
        </label>
      {/each}
    </div>
  </div>
  
  <div class="form-actions">
    <button onclick={submitForm}>送信</button>
    <button onclick={resetForm}>リセット</button>
  </div>
  
  <div class="preview">
    <h3>プレビュー:</h3>
    <pre>{JSON.stringify(formData, null, 2)}</pre>
  </div>
</div>

<style>
  .form-container {
    max-width: 500px;
    margin: 0 auto;
    padding: 1rem;
  }
  
  .form-group {
    margin-bottom: 1rem;
  }
  
  label {
    display: block;
    margin-bottom: 0.25rem;
    font-weight: bold;
  }
  
  input[type="text"],
  input[type="email"],
  input[type="number"],
  select {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  
  .checkbox-group label {
    display: inline-block;
    margin-right: 1rem;
    font-weight: normal;
  }
  
  .form-actions {
    display: flex;
    gap: 1rem;
    margin-top: 1.5rem;
  }
  
  button {
    padding: 0.5rem 1rem;
    background: #ff3e00;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  button:hover {
    background: #ff5a00;
  }
  
  .preview {
    margin-top: 2rem;
    padding: 1rem;
    background: #f5f5f5;
    border-radius: 4px;
  }
  
  pre {
    overflow-x: auto;
  }
</style>