<script lang="ts">
  import { onMount } from 'svelte';
  
  type Props = {
    diagram: string;
    class?: string;
  };
  
  let { diagram, class: className = '' }: Props = $props();
  
  let container: HTMLDivElement;
  let mermaidLoaded = $state(false);
  
  onMount(() => {
    const loadMermaid = async () => {
      // Mermaidを動的にインポート（クライアントサイドのみ）
      const mermaid = (await import('mermaid')).default;
      
      // Mermaidの初期設定
      mermaid.initialize({
        startOnLoad: false,
        theme: 'neutral',
        themeVariables: {
          primaryColor: '#f3f4f6',
          primaryTextColor: '#1f2937',
          primaryBorderColor: '#d1d5db',
          lineColor: '#9ca3af',
          secondaryColor: '#e5e7eb',
          tertiaryColor: '#f9fafb',
          background: '#ffffff',
          mainBkg: '#f3f4f6',
          secondBkg: '#e5e7eb',
          tertiaryBkg: '#f9fafb',
          nodeBkg: '#ffffff',
          nodeTextColor: '#1f2937',
          clusterBkg: '#f9fafb',
          clusterBorder: '#d1d5db',
          defaultLinkColor: '#6b7280',
          titleColor: '#111827',
          edgeLabelBackground: '#ffffff',
          actorBorder: '#d1d5db',
          actorBkg: '#ffffff',
          actorTextColor: '#1f2937'
        }
      });
      
      // ダイアグラムをレンダリング
      if (container) {
        try {
          // Mermaidのグラフ定義を検証
          if (!diagram || diagram.trim().length === 0) {
            throw new Error('Empty diagram definition');
          }
          
          // ユニークなIDを生成（タイムスタンプとランダム値）
          const id = `mermaid-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
          
          // 既存のSVGをクリア
          container.innerHTML = '';
          
          // レンダリング実行
          const { svg } = await mermaid.render(id, diagram.trim());
          container.innerHTML = svg;
          mermaidLoaded = true;
        } catch (error) {
          console.error('Mermaid rendering error:', error);
          console.error('Diagram content:', diagram);
          
          // より詳細なエラーメッセージ
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          container.innerHTML = `
            <div class="error">
              <p>ダイアグラムのレンダリングに失敗しました</p>
              <details>
                <summary>エラー詳細</summary>
                <code>${errorMessage}</code>
              </details>
            </div>
          `;
        }
      }
      
      // ダークモード対応
      const updateTheme = () => {
        const isDark = document.documentElement.classList.contains('dark');
        mermaid.initialize({
          startOnLoad: false,
          theme: isDark ? 'dark' : 'neutral',
          themeVariables: isDark ? {
            primaryColor: '#374151',
            primaryTextColor: '#f3f4f6',
            primaryBorderColor: '#4b5563',
            lineColor: '#6b7280',
            secondaryColor: '#4b5563',
            tertiaryColor: '#1f2937',
            background: '#111827',
            mainBkg: '#1f2937',
            secondBkg: '#374151',
            tertiaryBkg: '#111827',
            nodeBkg: '#1f2937',
            nodeTextColor: '#f3f4f6',
            clusterBkg: '#111827',
            clusterBorder: '#4b5563',
            defaultLinkColor: '#9ca3af',
            titleColor: '#f9fafb',
            edgeLabelBackground: '#1f2937',
            actorBorder: '#4b5563',
            actorBkg: '#1f2937',
            actorTextColor: '#f3f4f6',
            textColor: '#e5e7eb'
          } : {
            primaryColor: '#f3f4f6',
            primaryTextColor: '#1f2937',
            primaryBorderColor: '#d1d5db',
            lineColor: '#9ca3af',
            secondaryColor: '#e5e7eb',
            tertiaryColor: '#f9fafb',
            background: '#ffffff',
            mainBkg: '#f3f4f6',
            secondBkg: '#e5e7eb',
            tertiaryBkg: '#f9fafb',
            nodeBkg: '#ffffff',
            nodeTextColor: '#1f2937',
            clusterBkg: '#f9fafb',
            clusterBorder: '#d1d5db',
            defaultLinkColor: '#6b7280',
            titleColor: '#111827',
            edgeLabelBackground: '#ffffff',
            actorBorder: '#d1d5db',
            actorBkg: '#ffffff',
            actorTextColor: '#1f2937'
          }
        });
        
        // 再レンダリング
        if (container) {
          mermaid.render(`mermaid-${Date.now()}`, diagram).then(({ svg }) => {
            container.innerHTML = svg;
          });
        }
      };
      
      // テーマ変更を監視
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.attributeName === 'class') {
            updateTheme();
          }
        });
      });
      
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class']
      });
      
      return () => {
        observer.disconnect();
      };
    };
    
    loadMermaid();
  });
</script>

<div bind:this={container} class="mermaid-container {className}">
  {#if !mermaidLoaded}
    <div class="loading">ダイアグラムを読み込み中...</div>
  {/if}
</div>

<style>
  .mermaid-container {
    margin: 2rem 0;
    padding: 1.5rem;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    overflow-x: auto;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 200px;
  }
  
  :global(.dark) .mermaid-container {
    background: #1e293b;
    border-color: #334155;
  }
  
  .loading {
    color: #64748b;
    font-style: italic;
  }
  
  :global(.dark) .loading {
    color: #94a3b8;
  }
  
  .error {
    color: #ef4444;
    padding: 1rem;
    background: #fee2e2;
    border-radius: 4px;
  }
  
  :global(.dark) .error {
    background: #7f1d1d;
    color: #fca5a5;
  }
  
  /* Mermaid SVGのスタイル調整 */
  :global(.mermaid-container svg) {
    max-width: 100%;
    height: auto;
  }
  
  :global(.mermaid-container .node rect),
  :global(.mermaid-container .node circle),
  :global(.mermaid-container .node ellipse),
  :global(.mermaid-container .node polygon) {
    transition: all 0.3s ease;
  }
  
  :global(.mermaid-container .node:hover rect),
  :global(.mermaid-container .node:hover circle),
  :global(.mermaid-container .node:hover ellipse),
  :global(.mermaid-container .node:hover polygon) {
    filter: brightness(1.1);
    stroke-width: 2px;
  }
</style>