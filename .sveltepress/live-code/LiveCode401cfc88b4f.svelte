<script lang="ts">
  import { fly } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  
  let notifications = $state<string[]>([]);
  
  function addNotification(message: string) {
    notifications.push(message);
    setTimeout(() => {
      notifications = notifications.filter(n => n !== message);
    }, 3000);
  }
</script>

<div class="notifications">
  {#each notifications as notification (notification)}
    <div
      class="notification"
      in:fly={{ x: 300, duration: 400, easing: quintOut }}
      out:fly={{ x: 300, duration: 400 }}
    >
      {notification}
    </div>
  {/each}
</div>