<script lang="ts">
  // Props型を定義
  interface Props {
    title: string;
    count?: number;
    onClose?: () => void;
  }
  
  // $props()で受け取る
  let { title, count = 0, onClose }: Props = $props();
</script>

<article>
  <h2>{title}</h2>
  <p>Count: {count}</p>
  {#if onClose}
    <button onclick={onClose}>Close</button>
  {/if}
</article>