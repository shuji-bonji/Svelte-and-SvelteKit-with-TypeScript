<script lang="ts">
  class Counter {
    // クラスプロパティとして$state
    value = $state(0);
    
    increment() {
      this.value++;
    }
    
    decrement() {
      this.value--;
    }
    
    reset() {
      this.value = 0;
    }
  }
  
  let counter = new Counter();
</script>

<div>
  <p>カウント: {counter.value}</p>
  <button onclick={() => counter.increment()}>+</button>
  <button onclick={() => counter.decrement()}>-</button>
  <button onclick={() => counter.reset()}>リセット</button>
</div>