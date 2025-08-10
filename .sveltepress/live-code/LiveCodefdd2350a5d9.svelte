
<script lang="ts">
  let greetings: string[] = [
    'Hello World!',
    'こんにちは、世界！',
    'Bonjour le monde!',
    '¡Hola Mundo!',
    'Hallo Welt!'
  ];
  
  let currentIndex: number = 0;
  let currentGreeting: string = greetings[currentIndex];
  
  function nextGreeting(): void {
    currentIndex = (currentIndex + 1) % greetings.length;
    currentGreeting = greetings[currentIndex];
  }
</script>

<div class="greeting-container">
  <h1>{currentGreeting}</h1>
  <button on:click={nextGreeting}>
    次の言語
  </button>
  <p>言語 {currentIndex + 1} / {greetings.length}</p>
</div>

<style>
  .greeting-container {
    text-align: center;
    padding: 2rem;
  }
  
  h1 {
    color: #ff3e00;
    font-size: 2.5rem;
    margin-bottom: 1rem;
  }
  
  button {
    background: #ff3e00;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
  }
  
  button:hover {
    background: #ff5a00;
  }
</style>