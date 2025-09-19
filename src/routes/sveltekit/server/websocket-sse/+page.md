---
title: WebSocket/SSE
description: リアルタイム通信の実装方法
---

SvelteKitでWebSocketとServer-Sent Events (SSE)を使用したリアルタイム通信の実装方法について解説します。

## リアルタイム通信の選択肢

### 通信方式の比較

| 方式 | 双方向 | プロトコル | ユースケース |
|------|--------|------------|--------------|
| WebSocket | ○ | ws/wss | チャット、ゲーム、コラボレーション |
| SSE | × (サーバー→クライアント) | HTTP/HTTPS | 通知、ライブフィード、進捗表示 |
| Long Polling | △ | HTTP/HTTPS | レガシー環境対応 |

## Server-Sent Events (SSE)

### SSEの実装

#### サーバー側 (+server.ts)
```typescript
// src/routes/api/events/+server.ts
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ request }) => {
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      
      // 初期メッセージ
      controller.enqueue(
        encoder.encode('data: {"type":"connected","timestamp":' + Date.now() + '}\n\n')
      );
      
      // 定期的にデータを送信
      const interval = setInterval(() => {
        const data = {
          type: 'update',
          timestamp: Date.now(),
          value: Math.random()
        };
        
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
        );
      }, 1000);
      
      // クライアント切断時のクリーンアップ
      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    }
  });
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });
};
```

#### クライアント側 (+page.svelte)
```svelte
<script lang="ts">
  type EventData = {
    type: string;
    timestamp: number;
    value?: number;
  };

  let events = $state<EventData[]>([]);
  let eventSource: EventSource | null = null;

  // EventSourceの初期化とクリーンアップ
  $effect(() => {
    eventSource = new EventSource('/api/events');

    eventSource.onmessage = (event) => {
      const data: EventData = JSON.parse(event.data);
      events = [...events, data];

      // 最新10件のみ保持
      if (events.length > 10) {
        events = events.slice(-10);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE error:', error);
      eventSource?.close();
    };

    return () => {
      eventSource?.close();
    };
  });
</script>

<div class="events">
  <h2>リアルタイムイベント</h2>
  {#each events as event}
    <div class="event">
      <span>{event.type}</span>
      <span>{new Date(event.timestamp).toLocaleTimeString()}</span>
      {#if event.value !== undefined}
        <span>{event.value.toFixed(3)}</span>
      {/if}
    </div>
  {/each}
</div>
```

## WebSocket実装

### Viteプラグインを使用したWebSocket

#### vite.config.tsの設定
```typescript
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import type { ViteDevServer } from 'vite';
import { WebSocketServer } from 'ws';

function webSocketPlugin() {
  let wss: WebSocketServer;
  
  return {
    name: 'websocket-plugin',
    configureServer(server: ViteDevServer) {
      wss = new WebSocketServer({ port: 5174 });
      
      wss.on('connection', (ws) => {
        console.log('Client connected');
        
        ws.on('message', (data) => {
          const message = JSON.parse(data.toString());
          
          // すべてのクライアントにブロードキャスト
          wss.clients.forEach((client) => {
            if (client.readyState === 1) {
              client.send(JSON.stringify({
                type: 'broadcast',
                ...message,
                timestamp: Date.now()
              }));
            }
          });
        });
        
        ws.on('close', () => {
          console.log('Client disconnected');
        });
      });
    }
  };
}

export default defineConfig({
  plugins: [sveltekit(), webSocketPlugin()]
});
```

#### クライアント側の実装
```svelte
<script lang="ts">
  type Message = {
    id: string;
    user: string;
    text: string;
    timestamp: number;
  };

  let messages = $state<Message[]>([]);
  let inputText = $state('');
  let username = $state('User' + Math.floor(Math.random() * 1000));
  let ws: WebSocket | null = null;
  let connected = $state(false);

  // WebSocketの初期化とクリーンアップ
  $effect(() => {
    ws = new WebSocket('ws://localhost:5174');

    ws.onopen = () => {
      connected = true;
      console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
      const message: Message = JSON.parse(event.data);
      messages = [...messages, message];
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      connected = false;
    };

    ws.onclose = () => {
      connected = false;
      console.log('WebSocket disconnected');
    };

    return () => {
      ws?.close();
    };
  });
  
  function sendMessage() {
    if (!ws || !inputText.trim()) return;
    
    const message = {
      id: crypto.randomUUID(),
      user: username,
      text: inputText
    };
    
    ws.send(JSON.stringify(message));
    inputText = '';
  }
</script>

<div class="chat">
  <div class="status" class:connected>
    {connected ? '接続中' : '切断'}
  </div>
  
  <div class="messages">
    {#each messages as message}
      <div class="message">
        <strong>{message.user}:</strong>
        <span>{message.text}</span>
        <time>{new Date(message.timestamp).toLocaleTimeString()}</time>
      </div>
    {/each}
  </div>
  
  <form onsubmit={sendMessage}>
    <input
      bind:value={inputText}
      placeholder="メッセージを入力..."
      disabled={!connected}
    />
    <button type="submit" disabled={!connected}>
      送信
    </button>
  </form>
</div>

<style>
  .status {
    padding: 0.5rem;
    background: #f44336;
    color: white;
  }
  
  .status.connected {
    background: #4caf50;
  }
  
  .messages {
    height: 300px;
    overflow-y: auto;
    border: 1px solid #ddd;
    padding: 1rem;
  }
  
  .message {
    margin-bottom: 0.5rem;
  }
  
  time {
    font-size: 0.8em;
    color: #666;
    margin-left: 0.5rem;
  }
</style>
```

## Socket.IOの統合

### Socket.IO実装例

#### サーバー側設定
```typescript
// vite.config.ts
import { createServer } from 'http';
import { Server } from 'socket.io';

function socketIOPlugin() {
  return {
    name: 'socket-io',
    configureServer(server: ViteDevServer) {
      const httpServer = createServer();
      const io = new Server(httpServer, {
        cors: {
          origin: 'http://localhost:5173',
          methods: ['GET', 'POST']
        }
      });
      
      io.on('connection', (socket) => {
        console.log('User connected:', socket.id);
        
        socket.on('join-room', (roomId) => {
          socket.join(roomId);
          socket.to(roomId).emit('user-joined', socket.id);
        });
        
        socket.on('leave-room', (roomId) => {
          socket.leave(roomId);
          socket.to(roomId).emit('user-left', socket.id);
        });
        
        socket.on('message', (data) => {
          io.to(data.room).emit('message', {
            ...data,
            timestamp: Date.now()
          });
        });
        
        socket.on('disconnect', () => {
          console.log('User disconnected:', socket.id);
        });
      });
      
      httpServer.listen(5174);
    }
  };
}
```

#### クライアント側の実装
```svelte
<script lang="ts">
  import io from 'socket.io-client';

  let socket: ReturnType<typeof io>;
  let currentRoom = $state('general');
  let rooms = $state(['general', 'tech', 'random']);

  // Socket.IOの初期化とクリーンアップ
  $effect(() => {
    socket = io('http://localhost:5174');

    socket.on('connect', () => {
      console.log('Connected to Socket.IO');
      socket.emit('join-room', currentRoom);
    });

    socket.on('message', (data) => {
      // メッセージ処理
    });

    socket.on('user-joined', (userId) => {
      console.log('User joined:', userId);
    });

    return () => {
      socket.disconnect();
    };
  });
  
  function switchRoom(room: string) {
    socket.emit('leave-room', currentRoom);
    currentRoom = room;
    socket.emit('join-room', room);
  }
</script>
```

## プロダクション環境での考慮事項

### スケーラビリティ

```typescript
// Redis Pub/Subを使用した水平スケーリング
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

const pubClient = createClient({ url: 'redis://localhost:6379' });
const subClient = pubClient.duplicate();

await Promise.all([
  pubClient.connect(),
  subClient.connect()
]);

io.adapter(createAdapter(pubClient, subClient));
```

### 認証とセキュリティ

```typescript
// JWTトークンによる認証
import jwt from 'jsonwebtoken';

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    socket.data.user = decoded;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});
```

### レート制限

```typescript
// レート制限の実装
const rateLimiter = new Map<string, number[]>();

function checkRateLimit(socketId: string): boolean {
  const now = Date.now();
  const timestamps = rateLimiter.get(socketId) || [];
  
  // 1分以内のリクエストをフィルタ
  const recentRequests = timestamps.filter(t => now - t < 60000);
  
  if (recentRequests.length >= 100) {
    return false; // レート制限に達した
  }
  
  recentRequests.push(now);
  rateLimiter.set(socketId, recentRequests);
  return true;
}
```

## デプロイメント戦略

### Adapterの選択

| プラットフォーム | WebSocket対応 | 推奨Adapter |
|-----------------|--------------|------------|
| Vercel | △ (制限あり) | @sveltejs/adapter-vercel |
| Netlify | × | SSEを使用 |
| Node.js | ○ | @sveltejs/adapter-node |
| Cloudflare | ○ (Durable Objects) | @sveltejs/adapter-cloudflare |

### Node.js Adapterでの実装

```typescript
// server.js (カスタムサーバー)
import { handler } from './build/handler.js';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const server = createServer(app);
const io = new Server(server);

// Socket.IOのセットアップ
io.on('connection', (socket) => {
  // WebSocket処理
});

// SvelteKitハンドラー
app.use(handler);

server.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

## まとめ

SvelteKitでリアルタイム通信を実装する際は、要件に応じて適切な技術を選択することが重要です。SSEは単方向通信に適しており、WebSocketは双方向通信が必要な場合に使用します。プロダクション環境では、スケーラビリティとセキュリティを考慮した実装が必要です。