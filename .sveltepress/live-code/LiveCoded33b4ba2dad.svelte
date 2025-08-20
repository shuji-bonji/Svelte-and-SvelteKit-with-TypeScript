<script lang="ts">
  interface Props {
    value: $bindable<string>;
    checked?: $bindable<boolean>;
  }
  
  let { 
    value = $bindable(''),
    checked = $bindable(false)
  }: Props = $props();
</script>

<input bind:value={value} />
<input type="checkbox" bind:checked={checked} />