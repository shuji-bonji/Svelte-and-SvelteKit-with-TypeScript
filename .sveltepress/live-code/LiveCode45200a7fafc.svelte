<script lang="ts">
  // === 状態管理 ===
  let currentTime = $state(new Date());
  let mousePosition = $state({ x: 0, y: 0 });
  let keyPressed = $state<string | null>(null);
  let isOnline = $state(navigator.onLine);
  let pageViews = $state(0);
  let timeSpent = $state(0);
  let isDarkMode = $state(false);
  
  // LocalStorageから保存された設定を読み込む
  let savedSettings = $state({
    username: '',
    notifications: true,
    theme: 'light' as 'light' | 'dark'
  });
  
  // === Effect 1: リアルタイム時計 ===
  $effect(() => {
    const interval = setInterval(() => {
      currentTime = new Date();
    }, 1000);
    
    return () => clearInterval(interval);
  });
  
  // === Effect 2: マウス位置追跡 ===
  $effect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePosition = { x: e.clientX, y: e.clientY };
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  });
  
  // === Effect 3: キーボード監視 ===
  $effect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keyPressed = e.key;
    };
    
    const handleKeyUp = () => {
      keyPressed = null;
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  });
  
  // === Effect 4: オンライン状態監視 ===
  $effect(() => {
    const handleOnline = () => {
      isOnline = true;
    };
    
    const handleOffline = () => {
      isOnline = false;
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  });
  
  // === ページビューカウント（初回のみ） ===
  // 注: $effectの中で状態を変更すると無限ループになるため、
  // マウント時に一度だけ実行
  let hasCountedPageView = false;
  $effect(() => {
    if (!hasCountedPageView) {
      pageViews++;
      hasCountedPageView = true;
      console.log(`ページビュー: ${pageViews}`);
    }
  });
  
  // === Effect 6: 滞在時間計測 ===
  $effect(() => {
    const interval = setInterval(() => {
      timeSpent++;
    }, 1000);
    
    return () => clearInterval(interval);
  });
  
  // === Effect 7: LocalStorage同期（読み込み） ===
  $effect(() => {
    const saved = localStorage.getItem('dashboardSettings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        savedSettings = parsed;
        isDarkMode = parsed.theme === 'dark';
      } catch (e) {
        console.error('設定の読み込みエラー:', e);
      }
    }
  });
  
  // === Effect 8: LocalStorage同期（保存） ===
  $effect(() => {
    const settings = {
      ...savedSettings,
      theme: isDarkMode ? 'dark' : 'light'
    };
    localStorage.setItem('dashboardSettings', JSON.stringify(settings));
  });
  
  // === Effect 9: ドキュメントタイトル更新 ===
  $effect(() => {
    document.title = `Dashboard - ${currentTime.toLocaleTimeString('ja-JP')}`;
  });
  
  // === Effect 10: テーマ切り替え ===
  $effect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
    
    return () => {
      document.body.classList.remove('dark-theme');
    };
  });
  
  // 設定変更ハンドラー
  function updateUsername(e: Event) {
    const target = e.target as HTMLInputElement;
    savedSettings.username = target.value;
  }
  
  function toggleNotifications() {
    savedSettings.notifications = !savedSettings.notifications;
  }
  
  function toggleTheme() {
    isDarkMode = !isDarkMode;
  }
</script>

<div class="dashboard" class:dark={isDarkMode}>
  <header>
    <h2>🎯 リアルタイムダッシュボード</h2>
    <button class="theme-toggle" onclick={toggleTheme}>
      {isDarkMode ? '☀️' : '🌙'}
    </button>
  </header>
  
  <div class="grid">
    <!-- 時計 -->
    <div class="card">
      <h3>⏰ 現在時刻</h3>
      <div class="time">
        {currentTime.toLocaleTimeString('ja-JP')}
      </div>
      <div class="date">
        {currentTime.toLocaleDateString('ja-JP', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}
      </div>
    </div>
    
    <!-- マウス位置 -->
    <div class="card">
      <h3>🖱️ マウス位置</h3>
      <div class="coords">
        X: <span class="value">{mousePosition.x}</span>
        Y: <span class="value">{mousePosition.y}</span>
      </div>
      <div class="mouse-indicator" style="
        left: {mousePosition.x}px;
        top: {mousePosition.y}px;
      "></div>
    </div>
    
    <!-- キーボード -->
    <div class="card">
      <h3>⌨️ キーボード</h3>
      {#if keyPressed}
        <div class="key-display">
          押されたキー: <span class="key">{keyPressed}</span>
        </div>
      {:else}
        <div class="key-display muted">
          キーを押してください
        </div>
      {/if}
    </div>
    
    <!-- ステータス -->
    <div class="card">
      <h3>📊 ステータス</h3>
      <div class="status-item">
        接続状態: 
        <span class="status" class:online={isOnline}>
          {isOnline ? '🟢 オンライン' : '🔴 オフライン'}
        </span>
      </div>
      <div class="status-item">
        ページビュー: <span class="value">{pageViews}</span>
      </div>
      <div class="status-item">
        滞在時間: <span class="value">{timeSpent}秒</span>
      </div>
    </div>
    
    <!-- 設定 -->
    <div class="card settings">
      <h3>⚙️ 設定</h3>
      <div class="setting-item">
        <label>
          ユーザー名:
          <input 
            type="text" 
            value={savedSettings.username}
            oninput={updateUsername}
            placeholder="名前を入力"
          />
        </label>
      </div>
      <div class="setting-item">
        <label>
          <input 
            type="checkbox" 
            checked={savedSettings.notifications}
            onchange={toggleNotifications}
          />
          通知を有効にする
        </label>
      </div>
      {#if savedSettings.username}
        <div class="welcome">
          ようこそ、{savedSettings.username}さん！
        </div>
      {/if}
    </div>
    
    <!-- Effect情報 -->
    <div class="card">
      <h3>🎬 アクティブなEffect</h3>
      <ul class="effect-list">
        <li>⏰ 時計更新 (1秒ごと)</li>
        <li>🖱️ マウス追跡</li>
        <li>⌨️ キーボード監視</li>
        <li>🌐 オンライン状態監視</li>
        <li>💾 LocalStorage同期</li>
        <li>📄 タイトル更新</li>
        <li>🎨 テーマ切り替え</li>
      </ul>
    </div>
  </div>
</div>

<style>
  .dashboard {
    padding: 2rem;
    background: #f5f5f5;
    min-height: 100vh;
    transition: background 0.3s;
  }
  
  .dashboard.dark {
    background: #1a1a1a;
    color: #fff;
  }
  
  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }
  
  h2 {
    margin: 0;
    color: #ff3e00;
  }
  
  .theme-toggle {
    background: transparent;
    border: 2px solid #ff3e00;
    font-size: 1.5rem;
    padding: 0.5rem;
    cursor: pointer;
    border-radius: 8px;
  }
  
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
  }
  
  .card {
    background: white;
    padding: 1.5rem;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    position: relative;
  }
  
  .dark .card {
    background: #2a2a2a;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  }
  
  h3 {
    margin-top: 0;
    color: #ff3e00;
    font-size: 1.1rem;
  }
  
  .time {
    font-size: 2rem;
    font-weight: bold;
    color: #ff3e00;
    font-family: monospace;
  }
  
  .date {
    margin-top: 0.5rem;
    color: #666;
  }
  
  .dark .date {
    color: #aaa;
  }
  
  .coords {
    font-size: 1.2rem;
    font-family: monospace;
  }
  
  .value {
    color: #ff3e00;
    font-weight: bold;
  }
  
  .mouse-indicator {
    position: fixed;
    width: 20px;
    height: 20px;
    background: radial-gradient(circle, #ff3e00, transparent);
    border-radius: 50%;
    pointer-events: none;
    transform: translate(-50%, -50%);
    z-index: 1000;
    opacity: 0.5;
  }
  
  .key-display {
    font-size: 1.2rem;
    padding: 1rem;
    background: #f0f0f0;
    border-radius: 8px;
    text-align: center;
  }
  
  .dark .key-display {
    background: #333;
  }
  
  .key {
    color: #ff3e00;
    font-weight: bold;
    font-size: 1.5rem;
    font-family: monospace;
  }
  
  .muted {
    color: #999;
  }
  
  .status-item {
    margin: 0.5rem 0;
  }
  
  .status.online {
    color: #4caf50;
  }
  
  .setting-item {
    margin: 1rem 0;
  }
  
  .setting-item label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  input[type="text"] {
    flex: 1;
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  
  .dark input[type="text"] {
    background: #333;
    border-color: #555;
    color: #fff;
  }
  
  input[type="checkbox"] {
    width: 20px;
    height: 20px;
  }
  
  .welcome {
    margin-top: 1rem;
    padding: 0.75rem;
    background: #fff3cd;
    color: #856404;
    border-radius: 4px;
  }
  
  .dark .welcome {
    background: #3a3a2a;
    color: #ffd700;
  }
  
  .effect-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  
  .effect-list li {
    padding: 0.5rem 0;
    border-bottom: 1px solid #eee;
  }
  
  .dark .effect-list li {
    border-bottom-color: #444;
  }
  
  .effect-list li:last-child {
    border-bottom: none;
  }
</style>