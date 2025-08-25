---
title: Mermaidダイアグラムデモ
description: SveltePressでMermaidダイアグラムを使用する例（ダークモード対応）
---

<script>
  import Mermaid from '$lib/components/Mermaid.svelte';
  
  const flowChartCode = `graph TD
    A[Svelte Component] --> B["State変更"]
    B -->|$state| C[リアクティブ更新]
    B -->|$derived| D[計算値更新]
    C --> E[DOM更新]
    D --> E`;
    
  const sequenceCode = `sequenceDiagram
    participant U as ユーザー
    participant C as Component
    participant S as Store
    participant API as APIサーバー
    
    U->>C: ボタンクリック
    C->>S: 状態更新
    S->>API: データ取得
    API-->>S: レスポンス
    S-->>C: 状態通知
    C-->>U: UI更新`;
    
  const classDiagramCode = `classDiagram
    class SvelteComponent {
        +props: Props
        +state: State
        +derived: Computed
        +mount()
        +destroy()
        +update()
    }
    
    class Runes {
        +$state()
        +$derived()
        +$effect()
        +$props()
    }
    
    SvelteComponent --> Runes: uses`;
    
  const ganttCode = `gantt
    title Svelte 5 学習ロードマップ
    dateFormat YYYY-MM-DD
    section 基礎
    環境構築           :done,    des1, 2024-01-01, 2d
    TypeScript設定     :done,    des2, after des1, 3d
    基本概念           :active,  des3, after des2, 5d
    section Runes
    state            :         des4, after des3, 3d
    derived          :         des5, after des4, 2d
    effect           :         des6, after des5, 2d
    section 実践
    プロジェクト作成   :         des7, after des6, 7d`;
    
  const pieCode = `pie title Svelte 5の学習時間配分
    "基本概念" : 20
    "Runesシステム" : 30
    "TypeScript統合" : 25
    "実践プロジェクト" : 25`;
</script>

このページではSveltePressでMermaidダイアグラムを使用する方法を紹介します。**ダークモードにも完全対応**しています。

## フローチャート

Svelte 5のリアクティビティフローを表現：

<Mermaid diagram={flowChartCode} />

## シーケンス図

ユーザーインタラクションの流れ：

<Mermaid diagram={sequenceCode} />

## クラス図

Svelteコンポーネントの構造：

<Mermaid diagram={classDiagramCode} />

## ガントチャート

学習ロードマップ：

<Mermaid diagram={ganttCode} />

## 円グラフ

学習時間の配分：

<Mermaid diagram={pieCode} />

## ダークモード対応

このMermaidコンポーネントは以下の機能を持っています。

- 🌙 **自動ダークモード検出** - システムの設定やページのテーマに応じて自動切り替え
- 🎨 **カスタムテーマ** - ライト/ダークモードそれぞれに最適化された配色
- 🔄 **リアルタイム切り替え** - テーマ変更時に即座に反映
- 📱 **レスポンシブ対応** - モバイルでも見やすい表示

## 使用方法

Mermaidダイアグラムを使用するには、

1. Mermaidパッケージをインストール: `npm install mermaid`
2. Mermaidコンポーネントを作成（`$lib/components/Mermaid.svelte`）
3. Markdownファイルでコンポーネントをインポートして使用

## コード例

```svelte
<script>
  import Mermaid from '$lib/components/Mermaid.svelte';
  
  const diagramCode = \`graph TD
    A[開始] --> B[処理]
    B --> C[終了]\`;
</script>

<Mermaid diagram={diagramCode} />
```

## 注意事項

- Mermaidはクライアントサイドでレンダリングされます
- 初回レンダリング時に若干の遅延が発生する可能性があります
- ダークモードの切り替えは自動的に検出されます
- テーマカラーはSvelteのブランドカラーに合わせて調整されています