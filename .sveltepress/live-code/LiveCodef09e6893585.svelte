<script lang="ts">
  function handleClick(event: MouseEvent): void {
    console.log('クリックされました', event);
  }
  
  function handleInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    console.log('入力値:', target.value);
  }
  
  let value: string = '';
</script>

<!-- Svelte 5: 標準的なHTML属性 -->
<button onclick={handleClick}>
  クリック
</button>

<!-- インライン関数 -->
<button onclick={() => console.log('インライン')}>
  インライン関数
</button>

<!-- イベントの伝播を止める場合 -->
<button onclick={(e) => {
  e.preventDefault();
  e.stopPropagation();
  handleClick(e);
}}>
  伝播停止
</button>

<!-- 一度だけ実行する場合 -->
<button onclick={(e) => {
  handleClick(e);
  e.currentTarget.onclick = null;
}}>
  一度だけ
</button>

<!-- 入力イベント -->
<input
  type="text"
  oninput={handleInput}
  bind:value
/>