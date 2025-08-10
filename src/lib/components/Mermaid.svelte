<script lang="ts">
  import { onMount } from 'svelte';
  import mermaid from 'mermaid';
  
  let { code }: { code: string } = $props();
  
  let container: HTMLDivElement;
  let isDarkMode = $state(false);
  let id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
  
  onMount(() => {
    // ダークモードの検出
    const checkDarkMode = () => {
      isDarkMode = document.documentElement.classList.contains('dark') || 
                   document.documentElement.getAttribute('data-theme') === 'dark' ||
                   window.matchMedia('(prefers-color-scheme: dark)').matches;
    };
    
    checkDarkMode();
    
    // Mermaidの初期化
    const initMermaid = () => {
      mermaid.initialize({
        startOnLoad: false,
        theme: isDarkMode ? 'dark' : 'default',
        themeVariables: isDarkMode ? {
          primaryColor: '#1e293b',
          primaryTextColor: '#e2e8f0',
          primaryBorderColor: '#475569',
          lineColor: '#64748b',
          secondaryColor: '#475569',
          tertiaryColor: '#334155',
          background: '#0f172a',
          mainBkg: '#1e293b',
          secondBkg: '#334155',
          tertiaryBkg: '#475569',
          primaryBorderColor: '#64748b',
          secondaryBorderColor: '#475569',
          tertiaryBorderColor: '#334155',
          textColor: '#e2e8f0',
          labelTextColor: '#e2e8f0',
          altBackground: '#1e293b',
          edgeLabelBackground: '#1e293b',
          nodeTextColor: '#e2e8f0',
        } : {
          primaryColor: '#ff3e00',
          primaryTextColor: '#333',
          primaryBorderColor: '#ff3e00',
          lineColor: '#ff3e00',
          secondaryColor: '#40b3ff',
          tertiaryColor: '#ffa500',
        }
      });
      
      if (container) {
        container.innerHTML = `<div class="mermaid">${code}</div>`;
        mermaid.run({
          querySelector: `.mermaid`,
          suppressErrors: true
        });
      }
    };
    
    initMermaid();
    
    // テーマ変更の監視
    const observer = new MutationObserver(() => {
      const newDarkMode = document.documentElement.classList.contains('dark') || 
                          document.documentElement.getAttribute('data-theme') === 'dark';
      if (newDarkMode !== isDarkMode) {
        checkDarkMode();
        initMermaid();
      }
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme']
    });
    
    // メディアクエリの変更を監視
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      checkDarkMode();
      initMermaid();
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener('change', handleChange);
    };
  });
</script>

<div bind:this={container} class="mermaid-container" {id}></div>

<style>
  .mermaid-container {
    width: 100%;
    overflow-x: auto;
    padding: 1rem;
    border-radius: 0.5rem;
    background-color: var(--sp-color-bg-soft, #f5f5f5);
    margin: 1rem 0;
  }
  
  :global(.dark) .mermaid-container,
  :global([data-theme="dark"]) .mermaid-container {
    background-color: var(--sp-color-bg-soft, #1a1a1a);
  }
  
  .mermaid-container :global(.mermaid) {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .mermaid-container :global(svg) {
    max-width: 100%;
    height: auto;
  }
</style>