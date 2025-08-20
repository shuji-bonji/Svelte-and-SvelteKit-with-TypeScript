<script lang="ts">
  let autoSave = $state(false);
  let content = $state('');
  let savedContent = $state('');
  let saveCount = $state(0);
  
  $effect(() => {
    if (autoSave) {
      // 独立したエフェクトスコープを作成
      const cleanup = $effect.root(() => {
        // 1秒ごとに自動保存
        $effect(() => {
          const timer = setTimeout(() => {
            if (content !== savedContent) {
              savedContent = content;
              saveCount++;
              console.log('自動保存しました');
            }
          }, 1000);
          
          return () => clearTimeout(timer);
        });
      });
      
      // autoSaveがfalseになったらクリーンアップ
      return cleanup;
    }
  });
</script>

<div>
  <label>
    <input type="checkbox" bind:checked={autoSave} />
    自動保存を有効にする
  </label>
  
  <textarea 
    bind:value={content} 
    placeholder="テキストを入力..."
    rows="4"
    style="width: 100%; margin-top: 1rem;"
  />
  
  <p>保存回数: {saveCount}</p>
  <p>最後に保存された内容: {savedContent}</p>
</div>