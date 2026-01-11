---
title: デスクトップ・モバイルアプリ
description: SvelteとTauri/Electron/Capacitorでデスクトップ・モバイルアプリを構築する方法をTypeScriptで解説。ビルド設定、ネイティブAPI連携、更新配信やセキュリティ、UI共有戦略とストア設計まで実践的にまとめたロードマップ。配布チャネル選定のポイント付き。詳しい手順とチェックリスト付き
---

Svelteは、TauriやElectronを使用したデスクトップアプリ、Capacitorを使用したモバイルアプリの開発にも最適です。Webの技術でネイティブアプリケーションを構築できます。

## プラットフォーム比較

Svelteでクロスプラットフォーム開発を行う際、目的に応じて最適なフレームワークを選択することが重要です。デスクトップアプリには**Tauri**または**Electron**、モバイルアプリには**Capacitor**が主な選択肢となります。

| プラットフォーム | 用途 | 特徴 | バンドルサイズ |
|--------------|------|------|--------------|
| **Tauri** | デスクトップ | Rust製、高速・軽量 | 10MB〜 |
| **Electron** | デスクトップ | 成熟したエコシステム | 50MB〜 |
| **Capacitor** | モバイル | iOS/Android対応 | アプリサイズに依存 |

## Tauri統合

[Tauri](https://tauri.app/)は、Rustで書かれた軽量なデスクトップアプリケーションフレームワークです。Electronと比較して、バンドルサイズが大幅に小さく（10MB程度〜）、メモリ使用量も少ないのが特徴です。バックエンドにRustを使用するため、高パフォーマンスなネイティブ機能の実装が可能です。

### セットアップ

Tauri公式のテンプレートを使用すると、Svelte + TypeScript + Tauriの環境が自動的にセットアップされます。

```bash
npm create tauri-app@latest my-svelte-tauri -- --template svelte-ts
cd my-svelte-tauri
npm install
npm run tauri dev
```

### ネイティブAPI呼び出し

TauriはJavaScriptから`invoke`関数を通じてRustで書かれたバックエンド関数を呼び出せます。ファイルダイアログ、システム通知、ファイルシステムアクセスなど、OSのネイティブ機能に簡単にアクセスできます。

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

上記のSvelteコンポーネントでは、`$state`を使用してリアクティブな状態を管理し、Tauriのネイティブ機能をボタンクリックで呼び出しています。

## Electron統合

[Electron](https://www.electronjs.org/)は、Node.jsとChromiumを組み合わせたデスクトップアプリケーションフレームワークです。VS Code、Slack、Discordなど多くの有名アプリで採用されており、豊富なプラグインエコシステムと充実したドキュメントが特徴です。バンドルサイズはTauriより大きくなりますが、Node.jsの資産をそのまま活用できます。

### プロジェクト構成

Svelteプロジェクトを作成後、Electronと`electron-builder`を追加します。

```bash
npm create vite@latest my-svelte-electron -- --template svelte-ts
cd my-svelte-electron
npm install electron electron-builder --save-dev
```

### メインプロセス

Electronはメインプロセス（Node.js環境）とレンダラープロセス（ブラウザ環境）の2つのプロセスで構成されます。メインプロセスでウィンドウを作成し、IPC（プロセス間通信）を通じてSvelteアプリと連携します。

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

:::note[セキュリティに関する注意]
Electronでは`contextIsolation: true`と`preload`スクリプトを使用してセキュリティを確保することが重要です。レンダラープロセスから直接Node.js APIにアクセスさせず、必要な機能のみをpreloadスクリプト経由で公開します。
:::

## Capacitor統合（モバイル）

[Capacitor](https://capacitorjs.com/)は、Ionicチームが開発したクロスプラットフォームモバイルアプリ開発フレームワークです。Webアプリをネイティブのコンテナにラップし、iOSとAndroid両方に対応したアプリを単一のコードベースから構築できます。React NativeやFlutterとは異なり、標準的なWeb技術（HTML/CSS/JS）をそのまま使用できます。

### セットアップ

既存のSvelteプロジェクトにCapacitorを追加する形で導入します。

```bash
npm create vite@latest my-svelte-mobile -- --template svelte-ts
cd my-svelte-mobile
npm install @capacitor/core @capacitor/cli
npx cap init
```

### ネイティブ機能の使用

Capacitorは公式プラグインを通じて、カメラ、GPS、プッシュ通知、ファイルシステムなどのネイティブ機能にアクセスできます。各プラグインはTypeScript型定義を含んでおり、型安全な開発が可能です。

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

クロスプラットフォーム開発では、Web・デスクトップ・モバイルで共通のコードを最大限活用しつつ、プラットフォーム固有の機能にも対応する設計が重要です。

### 1. プラットフォーム判定

実行環境を判定し、プラットフォームごとに適切な実装を切り替えるユーティリティ関数を用意します。これにより、単一のコードベースで複数のプラットフォームに対応できます。

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

デスクトップとモバイルではUIの最適なレイアウトが異なります。デスクトップではサイドバーナビゲーション、モバイルではボトムナビゲーションなど、プラットフォームに応じたUIを提供することでユーザー体験が向上します。

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

`package.json`にプラットフォームごとのスクリプトを定義することで、開発・ビルド・デプロイのワークフローを統一できます。`concurrently`パッケージを使用すると、複数のプロセスを同時に実行できます。

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

ネイティブアプリを配布するには、各プラットフォームの要件に従って署名とパッケージングを行う必要があります。

### アプリストア配布

各プラットフォームでアプリを配布するための要件は以下の通りです。開発者アカウントの取得と証明書の発行が必要になります。

| プラットフォーム | 配布方法 | 署名要件 |
|--------------|----------|---------|
| **macOS** | App Store、DMG | Apple Developer ID |
| **Windows** | Microsoft Store、MSI/EXE | コード署名証明書 |
| **iOS** | App Store | Apple Developer Program |
| **Android** | Google Play | Play Console |

### 自動アップデート

デスクトップアプリでは、ユーザーに手動でアップデートを促すのではなく、自動アップデート機能を実装することでUXが向上します。TauriとElectronの両方で自動アップデート機能がサポートされています。

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
