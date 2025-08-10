<script lang="ts">
  let name: string = '';
  let email: string = '';
  let age: number = 0;
  let agreed: boolean = false;
  let selected: string = '';
  let multiSelect: string[] = [];
</script>

<!-- テキスト入力 -->
<input type="text" bind:value={name} />
<input type="email" bind:value={email} />
<input type="number" bind:value={age} />

<!-- チェックボックス -->
<input type="checkbox" bind:checked={agreed} />

<!-- ラジオボタン -->
<input type="radio" bind:group={selected} value="option1" />
<input type="radio" bind:group={selected} value="option2" />

<!-- セレクトボックス -->
<select bind:value={selected}>
  <option value="">選択してください</option>
  <option value="apple">Apple</option>
  <option value="banana">Banana</option>
</select>

<!-- 複数選択 -->
<select multiple bind:value={multiSelect}>
  <option value="red">Red</option>
  <option value="green">Green</option>
  <option value="blue">Blue</option>
</select>

<!-- テキストエリア -->
<textarea bind:value={name} />