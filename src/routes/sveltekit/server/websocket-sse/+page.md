---
title: WebSocket/SSE
description: SvelteKitでリアルタイム通信を実装するための総合ガイド。WebSocketとSSEの使い分け、チャットや通知の配信設計、ハンドラーの型付け、認証・バックプレッシャー・クリーンアップのポイントを整理し、運用時の考慮点まで触れる。接続監視の実装例付き。詳しい手順とチェックリスト付き。運用時の確認ポイントも掲載
---

<script>
  import Mermaid from '$lib/components/Mermaid.svelte';

  const sseFlow = `sequenceDiagram
    participant Client as クライアント
    participant EventSource as EventSource API
    participant Server as +server.ts
    participant Stream as ReadableStream

    Client->>EventSource: new EventSource('/api/events')
    EventSource->>Server: GET /api/events
    Server->>Stream: ReadableStream作成
    Stream-->>Server: stream

    Server-->>EventSource: Response<br/>Content-Type: text/event-stream

    loop データ送信
        Stream->>Server: 1秒ごとにデータ生成
        Server->>EventSource: data: {...}\\n\\n
        EventSource->>Client: onmessage(event)
        Client->>Client: データ処理・表示
    end

    Client->>EventSource: eventSource.close()
    EventSource->>Server: 接続終了
    Server->>Stream: controller.close()`;

  const webSocketFlow = `sequenceDiagram
    participant Client as クライアント<br/>(Svelte)
    participant WS as WebSocket API
    participant Server as +server.ts
    participant Handler as WebSocketHandler
    participant Broadcast as 全クライアント

    Client->>WS: new WebSocket('ws://...')
    WS->>Server: WebSocket接続要求
    Server->>Handler: upgrade(request)
    Handler->>Handler: 接続確立
    Handler-->>WS: WebSocket接続
    WS-->>Client: onopen()

    Client->>WS: send({type: 'message', ...})
    WS->>Handler: メッセージ受信
    Handler->>Broadcast: 全クライアントに配信
    Broadcast-->>Handler: 配信完了
    Handler->>WS: メッセージ送信
    WS->>Client: onmessage(event)

    Client->>WS: ws.close()
    WS->>Handler: 切断
    Handler->>Handler: クリーンアップ`;

  const socketIOFlow = `sequenceDiagram
    participant Client as クライアント<br/>(Svelte)
    participant IO as Socket.IO<br/>Client
    participant Server as Socket.IO<br/>Server
    participant Room as ルーム管理
    participant Redis as Redis<br/>(オプション)

    Client->>IO: io.connect()
    IO->>Server: 接続リクエスト
    Server->>Server: 認証チェック
    Server-->>IO: 接続確立
    IO-->>Client: 'connect'イベント

    Client->>IO: emit('join', {room: 'chat-1'})
    IO->>Server: joinイベント
    Server->>Room: socket.join('chat-1')
    Room-->>Server: 参加完了
    Server->>IO: emit('joined', {room: 'chat-1'})
    IO->>Client: 'joined'イベント

    Client->>IO: emit('message', {text: 'Hello'})
    IO->>Server: messageイベント
    Server->>Redis: pub: room:chat-1
    Redis-->>Server: 配信
    Server->>Room: io.to('chat-1').emit('message')
    Room->>IO: 全メンバーに送信
    IO->>Client: 'message'イベント`;

  const comparisonChart = `graph TB
    A[リアルタイム通信の選択] --> B{要件分析}

    B --> C{双方向通信が必要?}
    C -->|はい| D{複雑な機能が必要?}
    C -->|いいえ| E[SSE]

    D -->|はい| F{スケーラビリティ重視?}
    D -->|いいえ| G[生WebSocket]

    F -->|はい| H[Socket.IO<br/>+ Redis]
    F -->|いいえ| I[Socket.IO]

    E --> J[通知システム<br/>ライブフィード]
    G --> K[シンプルなチャット<br/>小規模リアルタイム]
    I --> L[チャット<br/>コラボレーション]
    H --> M[大規模チャット<br/>ゲーム<br/>分散システム]

    style E fill:#9f9,stroke:#333,stroke-width:2px,color:#333
    style G fill:#9ff,stroke:#333,stroke-width:2px,color:#333
    style I fill:#f9f,stroke:#333,stroke-width:2px,color:#333
    style H fill:#ff9,stroke:#333,stroke-width:2px,color:#333`;
</script>

SvelteKitでWebSocketとServer-Sent Events (SSE)を使用したリアルタイム通信の実装方法について解説します。

リアルタイム通信は、チャットアプリケーション、通知システム、協働編集ツール、ライブダッシュボードなど、現代のWebアプリケーションに不可欠な機能です。このページでは、SvelteKitで利用可能な複数のリアルタイム通信技術と、それぞれの実装方法を詳しく解説します。

## リアルタイム通信の選択肢

リアルタイム通信を実現する技術にはいくつかの選択肢があり、それぞれ異なる特性と適用場面があります。アプリケーションの要件に応じて最適な技術を選択することが重要です。

### 通信方式の比較

| 方式 | 双方向 | プロトコル | ユースケース |
|------|--------|------------|--------------|
| WebSocket | ○ | ws/wss | チャット、ゲーム、コラボレーション |
| SSE | × (サーバー→クライアント) | HTTP/HTTPS | 通知、ライブフィード、進捗表示 |
| Long Polling | △ | HTTP/HTTPS | レガシー環境対応 |

**WebSocket**は双方向通信が必要な場合に最適で、クライアントとサーバーの両方からリアルタイムでメッセージを送受信できます。**SSE**はサーバーからクライアントへの一方向通信に特化しており、シンプルな実装で済むため、通知やライブフィードに適しています。

### 技術選択のフローチャート

以下の図は、要件に応じて最適なリアルタイム通信技術を選択するためのガイドです。

<Mermaid chart={comparisonChart} />

## Server-Sent Events (SSE)

SSE（Server-Sent Events）は、HTTPプロトコルを使用してサーバーからクライアントへ継続的にデータをプッシュする技術です。標準のHTTP接続を使用するため、プロキシやファイアウォールとの互換性が高く、実装も比較的簡単です。

### SSEの通信フロー

以下の図は、SSE接続の確立からデータ送信、切断までの流れを示しています。EventSource APIがサーバーとの接続を管理し、データを自動的に受信します。

<Mermaid chart={sseFlow} />

### SSEの実装

以下の実装例では、サーバーが1秒ごとにランダムな値をクライアントに送信します。接続が確立されると、クライアントは継続的にデータを受信し、画面に表示します。

#### サーバー側 (+server.ts)

`ReadableStream`を使用してSSEストリームを作成します。`text/event-stream`コンテンツタイプと適切なヘッダーを設定することで、ブラウザがSSE接続として認識します。クライアントが切断した場合、`request.signal`の`abort`イベントでクリーンアップを行います。

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

クライアント側では、ブラウザ標準の`EventSource` APIを使用してSSE接続を確立します。Svelte 5の`$effect`を使用することで、コンポーネントのマウント時に接続を開始し、アンマウント時に自動的にクリーンアップできます。

受信したイベントは配列に追加され、最新10件のみを保持することでメモリ使用量を抑えています。

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

WebSocketは、クライアントとサーバー間で双方向の永続的な接続を提供します。リアルタイムチャット、オンラインゲーム、協働編集など、双方向通信が必要なアプリケーションに最適です。

SvelteKitでWebSocketを実装する方法はいくつかありますが、開発環境ではViteプラグインを使用し、本番環境ではカスタムサーバーを使用するのが一般的です。

### WebSocketの通信フロー

以下の図は、WebSocket接続の確立から双方向メッセージング、切断までの流れを示しています。クライアントからサーバーへ、サーバーからクライアントへ、双方向でメッセージを送受信できます。

<Mermaid chart={webSocketFlow} />

### Viteプラグインを使用したWebSocket

開発環境では、Viteプラグインを使用してWebSocketサーバーを統合できます。この方法により、開発サーバーと同じプロセス内でWebSocketを実行でき、開発体験が向上します。

#### vite.config.tsの設定

以下の設定では、ポート5174でWebSocketサーバーを起動し、接続されたすべてのクライアントにメッセージをブロードキャストする基本的な実装を示しています。`ws`ライブラリを使用して、標準のWebSocket仕様に準拠したサーバーを構築します。

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

クライアント側では、ブラウザ標準の`WebSocket` APIを使用して接続を確立します。接続状態を`$state`で管理し、UIに反映させることで、ユーザーに接続状況をフィードバックします。

この実装では、簡単なチャットアプリケーションを構築しています。メッセージの送信、受信、接続状態の表示など、WebSocketアプリケーションの基本的な要素をすべて含んでいます。

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

Socket.IOは、WebSocketをベースとした高レベルのライブラリで、自動再接続、ルーム機能、イベントベースの通信など、多くの便利な機能を提供します。プロダクションレベルのリアルタイムアプリケーションでは、Socket.IOを使用することで開発効率が大幅に向上します。

### Socket.IOの通信フロー

以下の図は、Socket.IOを使用したルームベースのチャットシステムの動作を示しています。接続確立、ルーム参加、メッセージ配信の流れを確認できます。

<Mermaid chart={socketIOFlow} />

### Socket.IO実装例

Socket.IOは、標準のWebSocketに比べて、より豊富な機能セットを提供します。ルーム管理、ネームスペース、自動再接続、フォールバックなど、複雑なリアルタイムアプリケーションに必要な機能が組み込まれています。

#### サーバー側設定

以下の実装では、ルームベースのチャットシステムを構築しています。ユーザーは複数のルームに参加でき、各ルーム内でのみメッセージが共有されます。この実装パターンは、チームチャット、ゲームロビー、コラボレーションツールなど、多くのアプリケーションに応用できます。

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

Socket.IOクライアントは、`socket.io-client`パッケージを使用して実装します。標準のWebSocket APIよりも高レベルのAPIを提供し、イベントベースの通信やルーム管理が容易になります。

以下の実装では、ユーザーが異なるルーム間を切り替えることができ、ルームに参加/退出する際にサーバーに通知します。

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

リアルタイム通信をプロダクション環境で運用する際は、スケーラビリティ、セキュリティ、パフォーマンスなど、多くの要素を考慮する必要があります。

### スケーラビリティ

複数のサーバーインスタンスでWebSocketアプリケーションを実行する場合、Redisなどのメッセージブローカーを使用して、インスタンス間でメッセージを共有する必要があります。Socket.IOはRedis Adapterを提供しており、これを使用することで水平スケーリングが可能になります。

以下の実装により、複数のサーバーインスタンスが協調して動作し、どのインスタンスに接続しているクライアントにも同じメッセージが配信されます。

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

WebSocket接続では、HTTP接続と同様に認証とセキュリティが重要です。Socket.IOでは、ミドルウェアを使用して接続時に認証を行うことができます。

以下の実装では、JWTトークンを使用してユーザーを認証しています。トークンが有効でない場合、接続は拒否されます。認証されたユーザー情報は`socket.data`に保存され、後続の処理で使用できます。

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

WebSocket接続でも、悪意のあるユーザーからの過剰なメッセージ送信を防ぐため、レート制限を実装する必要があります。以下の実装では、各クライアントが1分間に送信できるメッセージ数を制限しています。

この実装は、メモリベースのシンプルなレート制限ですが、本番環境ではRedisなどの永続ストレージを使用することを推奨します。

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

リアルタイム通信のデプロイメントは、選択するプラットフォームによって大きく異なります。WebSocketは永続的な接続を必要とするため、すべてのホスティングプラットフォームがサポートしているわけではありません。

### Adapterの選択

各プラットフォームのWebSocket対応状況を理解し、要件に応じて適切なプラットフォームを選択することが重要です。

| プラットフォーム | WebSocket対応 | 推奨Adapter |
|-----------------|--------------|------------|
| Vercel | △ (制限あり) | @sveltejs/adapter-vercel |
| Netlify | × | SSEを使用 |
| Node.js | ○ | @sveltejs/adapter-node |
| Cloudflare | ○ (Durable Objects) | @sveltejs/adapter-cloudflare |

**Vercel**は制限付きでWebSocketをサポートしていますが、本格的なリアルタイムアプリケーションには**Node.js**や**Cloudflare Workers**が推奨されます。**Netlify**ではWebSocketがサポートされていないため、SSEを使用する必要があります。

### Node.js Adapterでの実装

Node.js Adapterを使用する場合、カスタムサーバーを作成してSvelteKitとSocket.IOを統合できます。この方法により、完全な制御と柔軟性が得られます。

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

SvelteKitでリアルタイム通信を実装する際の選択肢と、それぞれの適用場面を理解することが重要です。

- **SSE**: シンプルで、サーバーからクライアントへの一方向通信に最適
  - 通知システム、ライブフィード、進捗表示
  - HTTP接続を使用するため、プロキシとの互換性が高い
  - 実装が簡単で、ブラウザ標準API（EventSource）で利用可能

- **WebSocket**: 双方向通信が必要な場合に使用
  - チャットアプリケーション、オンラインゲーム、協働編集
  - 低レイテンシーで、リアルタイム性が高い
  - 標準のWebSocket APIまたはSocket.IOで実装

- **Socket.IO**: WebSocketベースの高レベルライブラリ
  - ルーム管理、自動再接続、フォールバックなどの高度な機能
  - プロダクションレベルのアプリケーションに適している
  - Redis Adapterによる水平スケーリングが可能

プロダクション環境では、以下の点を考慮する必要があります。

- **スケーラビリティ**: Redis Pub/Subによる複数サーバーインスタンスの連携
- **セキュリティ**: JWT認証、レート制限、入力検証
- **デプロイメント**: プラットフォームのWebSocket対応状況を確認
- **監視**: 接続数、メッセージレート、エラー率の監視

適切な技術を選択し、セキュリティとスケーラビリティを考慮した実装により、堅牢なリアルタイムアプリケーションを構築できます。

## 次のステップ

リアルタイム通信の実践的な使用例は以下をご覧ください。
- **[WebSocket実装](/examples/websocket/)** - チャットアプリケーションの完全実装

#### さらに学ぶ
- [アプリケーション構築編](/sveltekit/application/)で、実践的なリアルタイムアプリケーションの実装を学びましょう
- [デプロイ・運用編](/sveltekit/deployment/)で、本番環境でのWebSocket運用を習得しましょう
