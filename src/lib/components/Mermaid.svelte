<script lang="ts">
  import { onMount } from 'svelte';
  import mermaid from 'mermaid';
  
  let { code }: { code: string } = $props();
  let container: HTMLDivElement;
  let id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
  
  onMount(async () => {
    // ダークモードの検出（SveltePressのクラスをチェック）
    const isDarkMode = document.documentElement.classList.contains('dark') || 
                      (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    mermaid.initialize({ 
      startOnLoad: false,
      theme: isDarkMode ? 'dark' : 'default',
      themeVariables: {
        primaryColor: '#ff3e00',
        primaryTextColor: isDarkMode ? '#fff' : '#333',
        primaryBorderColor: '#ff3e00',
        lineColor: '#5C5C5C',
        secondaryColor: '#ff6b6b',
        tertiaryColor: isDarkMode ? '#2d2d2d' : '#f9f9f9',
        // クラス図の設定
        classText: isDarkMode ? '#fff' : '#333',
        labelBoxBkgColor: isDarkMode ? '#1a1a1a' : '#fff',
        labelBoxBorderColor: '#ff3e00',
        labelTextColor: isDarkMode ? '#fff' : '#333',
        // ノードのテキスト色
        nodeTextColor: isDarkMode ? '#fff' : '#333',
        textColor: isDarkMode ? '#fff' : '#333',
        fillType0: isDarkMode ? '#1a1a1a' : '#fff',
        fillType1: isDarkMode ? '#2d2d2d' : '#f9f9f9',
        fillType2: isDarkMode ? '#3d3d3d' : '#f3f3f3',
        fillType3: isDarkMode ? '#4d4d4d' : '#ededed',
        fillType4: isDarkMode ? '#5d5d5d' : '#e7e7e7',
        fillType5: isDarkMode ? '#6d6d6d' : '#e1e1e1',
        fillType6: isDarkMode ? '#7d7d7d' : '#dbdbdb',
        fillType7: isDarkMode ? '#8d8d8d' : '#d5d5d5'
      }
    });
    
    try {
      const { svg } = await mermaid.render(id, code);
      container.innerHTML = svg;
    } catch (error) {
      console.error('Mermaid rendering error:', error);
      container.innerHTML = `<pre class="error">Error rendering diagram: ${error}</pre>`;
    }
  });
</script>

<div bind:this={container} class="mermaid-container"></div>

<style>
  .mermaid-container {
    width: 100%;
    display: flex;
    justify-content: center;
    margin: 2rem 0;
    overflow-x: auto;
  }
  
  .mermaid-container :global(svg) {
    max-width: 100%;
    height: auto;
  }
  
  .error {
    color: red;
    background: #fee;
    padding: 1rem;
    border-radius: 4px;
  }
</style>