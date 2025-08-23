<script lang="ts">
  let firstName = $state('太郎');
  let lastName = $state('山田');
  let separator = $state(' ');
  
  // 複数の値に依存する派生値
  let fullName = $derived(
    lastName + separator + firstName
  );
  
  // さらに派生値から派生
  let displayName = $derived(
    `${fullName}様`
  );
  
  let nameLength = $derived(fullName.length);
</script>

<input bind:value={firstName} placeholder="名" />
<input bind:value={lastName} placeholder="姓" />
<select bind:value={separator}>
  <option value=" ">スペース</option>
  <option value="・">中点</option>
  <option value="">なし</option>
</select>

<p>フルネーム: {fullName}</p>
<p>表示名: {displayName}</p>
<p>文字数: {nameLength}</p>