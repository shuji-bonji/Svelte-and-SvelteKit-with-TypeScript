<script lang="ts">
  import { slide } from 'svelte/transition';
  
  let currentTab = $state('tab1');
</script>

<div class="tabs">
  <button onclick={() => currentTab = 'tab1'}>タブ1</button>
  <button onclick={() => currentTab = 'tab2'}>タブ2</button>
  <button onclick={() => currentTab = 'tab3'}>タブ3</button>
</div>

<!-- local修飾子で親の状態変更時にトランジションしない -->
{#if currentTab === 'tab1'}
  <div transition:slide|local>
    <h2>タブ1のコンテンツ</h2>
    <p>localを使うと、親の条件変更時にトランジションしません</p>
  </div>
{:else if currentTab === 'tab2'}
  <div transition:slide|local>
    <h2>タブ2のコンテンツ</h2>
  </div>
{:else if currentTab === 'tab3'}
  <div transition:slide|local>
    <h2>タブ3のコンテンツ</h2>
  </div>
{/if}