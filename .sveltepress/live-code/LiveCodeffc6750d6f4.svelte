<script lang="ts">
  let hue = $state(0);
  let theme = $state<'light' | 'dark'>('light');
  
  // アニメーションループ
  $effect(() => {
    const interval = setInterval(() => {
      hue = (hue + 1) % 360;
    }, 50);
    
    return () => clearInterval(interval);
  });
</script>

<div
  class="gradient-box"
  style:--hue="{hue}"
  style:--theme={theme}
>
  <h2>グラデーションアニメーション</h2>
  <p>CSS変数を使った動的スタイル</p>
</div>

<style>
  .gradient-box {
    background: linear-gradient(
      45deg,
      hsl(var(--hue), 70%, 50%),
      hsl(calc(var(--hue) + 60), 70%, 50%)
    );
    color: var(--theme) === 'light' ? black : white;
    padding: 2rem;
    border-radius: 8px;
    transition: background 0.3s;
  }
</style>