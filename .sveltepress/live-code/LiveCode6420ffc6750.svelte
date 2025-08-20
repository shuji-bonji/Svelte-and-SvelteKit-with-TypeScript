<script lang="ts">
  let color = $state('blue');
  let size = $state(16);
  let rotation = $state(0);
  let opacity = $state(1);
  let isActive = $state(false);
  let disabled = $state(false);
</script>

<!-- 基本的な使い方 -->
<div style:color={color}>
  色が変わるテキスト
</div>

<!-- 複数のスタイル -->
<div
  style:font-size="{size}px"
  style:transform="rotate({rotation}deg)"
  style:opacity={opacity}
>
  動的スタイル
</div>

<!-- 短縮記法（変数名とプロパティ名が同じ場合） -->
<div style:color style:opacity>
  短縮記法
</div>

<!-- 条件付きスタイル -->
<button
  style:background-color={isActive ? 'blue' : 'gray'}
  style:cursor={disabled ? 'not-allowed' : 'pointer'}
  onclick={() => {
    if (!disabled) isActive = !isActive;
  }}
>
  {isActive ? 'アクティブ' : '非アクティブ'}
</button>

<label style="margin-left: 1rem;">
  <input type="checkbox" bind:checked={disabled} />
  無効化
</label>