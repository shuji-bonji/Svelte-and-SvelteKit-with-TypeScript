<script lang="ts">
  import { cubicOut } from 'svelte/easing';
  import type { TransitionConfig } from 'svelte/transition';
  
  // カスタムトランジション関数: タイプライター効果
  function typewriter(node: HTMLElement, {
    speed = 1,
    delay = 0
  }: { speed?: number; delay?: number } = {}): TransitionConfig {
    const valid = (
      node.childNodes.length === 1 &&
      node.childNodes[0].nodeType === Node.TEXT_NODE
    );
    
    if (!valid) {
      throw new Error('`typewriter` only works with text nodes');
    }
    
    const text = node.textContent || '';
    const duration = text.length / (speed * 0.01);
    
    return {
      delay,
      duration,
      tick: t => {
        const i = Math.trunc(text.length * t);
        node.textContent = text.slice(0, i);
      }
    };
  }
  
  // カスタムトランジション関数: 回転＋スケール
  function spin(node: HTMLElement, {
    delay = 0,
    duration = 400,
    easing = cubicOut,
    spin = 1
  } = {}): TransitionConfig {
    const style = getComputedStyle(node);
    const originalTransform = style.transform === 'none' ? '' : style.transform;
    const originalOpacity = +style.opacity;
    
    return {
      delay,
      duration,
      easing,
      css: (t, u) => {
        const rotation = 360 * spin * u;
        const scale = t;
        
        return `
          transform: ${originalTransform} rotate(${rotation}deg) scale(${scale});
          opacity: ${t * originalOpacity};
        `;
      }
    };
  }
  
  let showTypewriter = $state(false);
  let showSpin = $state(false);
  let messages = $state<string[]>([]);
  
  function addMessage() {
    messages = [...messages, `メッセージ ${messages.length + 1}`];
  }
  
  function removeMessage(index: number) {
    messages = messages.filter((_, i) => i !== index);
  }
</script>

<div style="display: grid; gap: 2rem;">
  <!-- タイプライター効果デモ -->
  <div>
    <h3>タイプライター効果</h3>
    <button onclick={() => showTypewriter = !showTypewriter}>
      {showTypewriter ? 'リセット' : 'タイプ開始'}
    </button>
    
    <div style="margin-top: 1rem; min-height: 60px;">
      {#if showTypewriter}
        <p in:typewriter={{ speed: 2 }} style="font-family: monospace; font-size: 1.2rem; color: #2d3748;">
          このテキストはタイプライターのように一文字ずつ表示されます。
        </p>
      {/if}
    </div>
  </div>
  
  <!-- スピン効果デモ -->
  <div>
    <h3>回転トランジション</h3>
    <button onclick={addMessage}>メッセージを追加</button>
    
    <div class="spin-grid">
      {#each messages as message, index (message)}
        <div
          class="spin-card"
          in:spin={{ duration: 500, spin: 2 }}
          out:spin={{ duration: 300, spin: -1 }}
        >
          <span>{message}</span>
          <button 
            class="close-btn"
            onclick={() => removeMessage(index)}
          >
            ×
          </button>
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  h3 {
    margin: 0 0 0.5rem;
    color: #2d3748;
  }
  
  .spin-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
    min-height: 80px;
  }
  
  .spin-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  .close-btn {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: white;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
  }
  
  .close-btn:hover {
    background: rgba(255, 255, 255, 0.3);
  }
</style>