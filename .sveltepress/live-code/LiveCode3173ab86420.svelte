<script lang="ts">
  import { fly, fade } from 'svelte/transition';
  import { flip } from 'svelte/animate';
  import { quintOut } from 'svelte/easing';
  
  type Notification = {
    id: number;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    icon: string;
  };
  
  let notifications = $state<Notification[]>([]);
  let nextId = 1;
  
  function notify(message: string, type: Notification['type'] = 'info') {
    const icons = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    };
    
    const id = nextId++;
    notifications = [...notifications, { id, message, type, icon: icons[type] }];
    
    // 自動削除
    setTimeout(() => {
      notifications = notifications.filter(n => n.id !== id);
    }, 5000);
  }
  
  function dismiss(id: number) {
    notifications = notifications.filter(n => n.id !== id);
  }
</script>

<div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1rem;">
  <button onclick={() => notify('情報メッセージです', 'info')}>
    情報通知
  </button>
  <button onclick={() => notify('正常に完了しました！', 'success')}>
    成功通知
  </button>
  <button onclick={() => notify('注意が必要です', 'warning')}>
    警告通知
  </button>
  <button onclick={() => notify('エラーが発生しました', 'error')}>
    エラー通知
  </button>
</div>

<div class="notifications-container">
  {#each notifications as notification (notification.id)}
    <div
      class="notification notification-{notification.type}"
      in:fly={{ x: 300, duration: 300, easing: quintOut }}
      out:fade={{ duration: 200 }}
      animate:flip={{ duration: 300 }}
    >
      <span class="notification-content">
        <span class="notification-icon">{notification.icon}</span>
        {notification.message}
      </span>
      <button class="dismiss-btn" onclick={() => dismiss(notification.id)}>×</button>
    </div>
  {/each}
</div>

<style>
  .notifications-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 1000;
    max-width: 400px;
  }
  
  .notification {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    margin-bottom: 8px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    backdrop-filter: blur(10px);
  }
  
  .notification-content {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .notification-icon {
    font-size: 1.2rem;
  }
  
  .notification-info { 
    background: linear-gradient(135deg, rgba(66, 165, 245, 0.9), rgba(33, 150, 243, 0.9));
    color: white;
  }
  .notification-success { 
    background: linear-gradient(135deg, rgba(102, 187, 106, 0.9), rgba(76, 175, 80, 0.9));
    color: white;
  }
  .notification-warning { 
    background: linear-gradient(135deg, rgba(255, 183, 77, 0.9), rgba(255, 152, 0, 0.9));
    color: white;
  }
  .notification-error { 
    background: linear-gradient(135deg, rgba(239, 83, 80, 0.9), rgba(229, 57, 53, 0.9));
    color: white;
  }
  
  .dismiss-btn {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s;
  }
  
  .dismiss-btn:hover {
    background: rgba(255, 255, 255, 0.3);
  }
</style>