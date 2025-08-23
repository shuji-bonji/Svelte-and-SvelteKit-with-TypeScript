<script lang="ts">
  let src: string = '/images/logo.png';
  let alt: string = 'Company Logo';
  let width: number = 200;
  let isDisabled: boolean = false;
</script>

<img {src} {alt} width={width} />
<button disabled={isDisabled}>Click me</button>

<!-- 省略記法。変数名と属性名が同じ場合 -->
<img {src} {alt} />