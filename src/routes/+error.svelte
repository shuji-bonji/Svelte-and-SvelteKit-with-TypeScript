<script lang="ts">
  import { page } from '$app/stores';
  import { base } from '$app/paths';
</script>

<svelte:head>
  <title>404 - ページが見つかりません</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<div class="error-container">
  <h1>404</h1>
  <h2>ページが見つかりません</h2>
  
  <p>
    お探しのページ「{$page.url.pathname}」は存在しないか、移動した可能性があります。
  </p>
  
  <div class="actions">
    <a href="{base}/" class="btn">ホームに戻る</a>
    <a href="{base}/introduction/" class="btn">学習を始める</a>
  </div>
</div>

<style>
  .error-container {
    max-width: 600px;
    margin: 4rem auto;
    padding: 2rem;
    text-align: center;
  }
  
  h1 {
    font-size: 4rem;
    font-weight: 700;
    color: #e74c3c;
    margin: 0;
  }
  
  h2 {
    font-size: 1.5rem;
    color: #333;
    margin: 1rem 0;
  }
  
  p {
    color: #666;
    margin: 2rem 0;
  }
  
  .actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-top: 2rem;
  }
  
  .btn {
    display: inline-block;
    padding: 0.75rem 1.5rem;
    background: #3498db;
    color: white;
    text-decoration: none;
    border-radius: 0.5rem;
    transition: background 0.3s;
  }
  
  .btn:hover {
    background: #2980b9;
  }
</style>