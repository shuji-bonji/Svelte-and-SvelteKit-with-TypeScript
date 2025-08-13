<script lang="ts">
  import Chart from 'chart.js/auto';
  
  let chartCanvas = $state<HTMLCanvasElement | null>(null);
  let chartInstance = $state<Chart | null>(null);
  let data = $state([12, 19, 3, 5, 2, 3]);
  let labels = $state(['1月', '2月', '3月', '4月', '5月', '6月']);
  
  $effect(() => {
    if (!chartCanvas) return;
    
    // 既存のチャートを破棄
    if (chartInstance) {
      chartInstance.destroy();
    }
    
    // 新しいチャートを作成
    chartInstance = new Chart(chartCanvas, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: '売上',
          data: data,
          backgroundColor: 'rgba(255, 62, 0, 0.5)'
        }]
      }
    });
    
    // クリーンアップ
    return () => {
      if (chartInstance) {
        chartInstance.destroy();
        chartInstance = null;
      }
    };
  });
</script>

<canvas bind:this={chartCanvas}></canvas>