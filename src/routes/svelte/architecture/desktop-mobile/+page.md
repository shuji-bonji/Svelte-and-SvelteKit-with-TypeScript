---
title: デスクトップ・モバイルアプリ
description: SvelteとTauri、Electron、Capacitorでクロスプラットフォームアプリを構築。デスクトップとモバイル向けネイティブアプリの開発方法をTypeScriptで解説
---

Svelteは、TauriやElectronを使用したデスクトップアプリ、Capacitorを使用したモバイルアプリの開発にも最適です。Webの技術でネイティブアプリケーションを構築できます。

## プラットフォーム比較

| プラットフォーム | 用途 | 特徴 | バンドルサイズ |
|--------------|------|------|--------------|
| **Tauri** | デスクトップ | Rust製、高速・軽量 | 10MB〜 |
| **Electron** | デスクトップ | 成熟したエコシステム | 50MB〜 |
| **Capacitor** | モバイル | iOS/Android対応 | アプリサイズに依存 |

## Tauri統合

### セットアップ

```bash
npm create tauri-app@latest my-svelte-tauri -- --template svelte-ts
cd my-svelte-tauri
npm install
npm run tauri dev
```

### ネイティブAPI呼び出し

```typescript
// src/lib/tauri.ts
import { invoke } from '@tauri-apps/api/tauri';
import { open } from '@tauri-apps/api/dialog';
import { writeTextFile } from '@tauri-apps/api/fs';

// バックエンド（Rust）関数の呼び出し
export async function greet(name: string): Promise<string> {
  return await invoke('greet', { name });
}

// ファイルダイアログ
export async function selectFile() {
  const selected = await open({
    multiple: false,
    filters: [{
      name: 'テキスト',
      extensions: ['txt', 'md']
    }]
  });
  return selected;
}
```

```svelte
<!-- src/routes/+page.svelte -->
<script lang="ts">
  import { greet, selectFile } from '$lib/tauri';
  
  let name = $state('');
  let greeting = $state('');
  
  async function handleGreet() {
    greeting = await greet(name);
  }
</script>

<div>
  <input bind:value={name} placeholder="名前を入力" />
  <button onclick={handleGreet}>挨拶</button>
  <button onclick={selectFile}>ファイル選択</button>
  {#if greeting}
    <p>{greeting}</p>
  {/if}
</div>
```

## Electron統合

### プロジェクト構成

```bash
npm create vite@latest my-svelte-electron -- --template svelte-ts
cd my-svelte-electron
npm install electron electron-builder --save-dev
```

### メインプロセス

```javascript
// electron/main.js
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true
    }
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile('dist/index.html');
  }
}

app.whenReady().then(createWindow);

// IPC通信
ipcMain.handle('get-system-info', async () => {
  return {
    platform: process.platform,
    version: process.version,
    memory: process.memoryUsage()
  };
});
```

## Capacitor統合（モバイル）

### セットアップ

```bash
npm create vite@latest my-svelte-mobile -- --template svelte-ts
cd my-svelte-mobile
npm install @capacitor/core @capacitor/cli
npx cap init
```

### ネイティブ機能の使用

```typescript
// src/lib/capacitor.ts
import { Camera, CameraResultType } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { Storage } from '@capacitor/storage';

// カメラアクセス
export async function takePicture() {
  const image = await Camera.getPhoto({
    quality: 90,
    allowEditing: true,
    resultType: CameraResultType.Uri
  });
  
  return image.webPath;
}

// 位置情報取得
export async function getCurrentPosition() {
  const coordinates = await Geolocation.getCurrentPosition();
  return {
    lat: coordinates.coords.latitude,
    lng: coordinates.coords.longitude
  };
}

// ローカルストレージ
export async function saveData(key: string, value: any) {
  await Storage.set({
    key,
    value: JSON.stringify(value)
  });
}
```

## ベストプラクティス

### 1. プラットフォーム判定

```typescript
// src/lib/platform.ts
export function getPlatform() {
  if (typeof window === 'undefined') {
    return 'server';
  }
  
  // Tauri
  if (window.__TAURI__) {
    return 'tauri';
  }
  
  // Electron
  if (window.electron) {
    return 'electron';
  }
  
  // Capacitor
  if (window.Capacitor) {
    return 'capacitor';
  }
  
  return 'web';
}

// 条件付き機能実装
export async function saveFile(content: string) {
  const platform = getPlatform();
  
  switch (platform) {
    case 'tauri':
      // Tauri APIを使用
      return await tauriSaveFile(content);
    case 'electron':
      // Electron IPCを使用
      return await electronSaveFile(content);
    case 'capacitor':
      // Capacitor Filesystemを使用
      return await capacitorSaveFile(content);
    default:
      // Web APIを使用
      return await webSaveFile(content);
  }
}
```

### 2. UIの最適化

```svelte
<script lang="ts">
  import { getPlatform } from '$lib/platform';
  
  const platform = getPlatform();
  const isMobile = platform === 'capacitor';
  const isDesktop = ['tauri', 'electron'].includes(platform);
</script>

<div class="app" class:mobile={isMobile} class:desktop={isDesktop}>
  {#if isDesktop}
    <!-- デスクトップ用UI -->
    <nav class="sidebar">...</nav>
  {/if}
  
  <main>
    <!-- 共通コンテンツ -->
  </main>
  
  {#if isMobile}
    <!-- モバイル用ボトムナビゲーション -->
    <nav class="bottom-nav">...</nav>
  {/if}
</div>

<style>
  .app.mobile {
    padding-bottom: 60px; /* ボトムナビ分 */
  }
  
  .app.desktop {
    display: grid;
    grid-template-columns: 250px 1fr;
  }
</style>
```

### 3. ビルド設定

```json
{`{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    
    "tauri": "tauri",
    "tauri:dev": "tauri dev",
    "tauri:build": "tauri build",
    
    "electron": "electron .",
    "electron:dev": "concurrently \\"npm run dev\\" \\"electron .\\"",
    "electron:build": "npm run build && electron-builder",
    
    "cap:sync": "cap sync",
    "cap:ios": "cap open ios",
    "cap:android": "cap open android"
  }
}`}
```

## デプロイと配布

### アプリストア配布

| プラットフォーム | 配布方法 | 署名要件 |
|--------------|----------|---------|
| **macOS** | App Store、DMG | Apple Developer ID |
| **Windows** | Microsoft Store、MSI/EXE | コード署名証明書 |
| **iOS** | App Store | Apple Developer Program |
| **Android** | Google Play | Play Console |

### 自動アップデート

```typescript
// Tauri自動アップデート
import { checkUpdate, installUpdate } from '@tauri-apps/api/updater';

async function checkForUpdates() {
  const update = await checkUpdate();
  if (update.shouldUpdate) {
    await installUpdate();
  }
}
```

:::tip[選択のポイント]
- **Tauri**: 軽量・高速を求める場合
- **Electron**: 豊富なプラグインが必要な場合
- **Capacitor**: iOS/Androidアプリを作る場合
:::

## まとめ

Svelteのクロスプラットフォーム開発は以下のケースに最適です。

- ✅ **Web技術でネイティブアプリ** - HTML/CSS/JSの知識を活用
- ✅ **コードの再利用** - Web版とネイティブ版で共通コード
- ✅ **高速な開発** - ホットリロードで開発効率向上
- ✅ **統一されたUX** - 全プラットフォームで一貫した体験