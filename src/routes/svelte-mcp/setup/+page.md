---
title: セットアップ
description: Svelte MCPのセットアップ方法 - Claude Code、Claude Desktop、Cursor、VS Code、Zed、Codex、Gemini CLIでの設定手順
---

Svelte MCP には**Local 版**と**Remote 版**の 2 つのバージョンがあります。
使用する MCP クライアントに応じて適切な設定を行ってください。

:::tip[おすすめ]
日常的な開発には**Local 版**を推奨します。オフラインでも動作し、レスポンスも高速です。
:::

## Local 版のセットアップ

Local 版は `@sveltejs/mcp` パッケージを使用します。

### Claude Code（CLI）

```bash
claude mcp add -t stdio -s [scope] svelte -- npx -y @sveltejs/mcp
```

`[scope]` は `user`、`project`、`local` から選択できます。

設定後、Claude Code を再起動してください。

```bash
# 登録済みMCPサーバーの確認
claude mcp list
```

会話中は `/mcp` コマンドでも接続状態を確認できます。

### Claude Desktop

Settings > Developer セクションで「Edit Config」をクリックし、`claude_desktop_config.json` を編集します。

**設定ファイルの場所：**

- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
	"mcpServers": {
		"svelte": {
			"command": "npx",
			"args": ["-y", "@sveltejs/mcp"]
		}
	}
}
```

設定後、Claude Desktop を再起動してください。

### Cursor

1. コマンドパレットを開く
2. 「View: Open MCP Settings」を選択
3. 「Add custom MCP」をクリック

MCP サーバーの設定ファイルが開くので、以下を追加します。

```json
{
	"mcpServers": {
		"svelte": {
			"command": "npx",
			"args": ["-y", "@sveltejs/mcp"]
		}
	}
}
```

### VS Code

1. コマンドパレットを開く
2. 「MCP: Add Server...」を選択
3. 「Command (stdio)」を選択
4. `npx -y @sveltejs/mcp` を入力して Enter
5. 名前の入力を求められたら `svelte` と入力
6. `Global` または `Workspace` を選択

### Zed

[Svelte MCP Server 拡張機能](https://zed.dev/extensions/svelte-mcp)をインストールするか、以下の手順でマニュアル設定します。

<details>
<summary>マニュアル設定</summary>

1. コマンドパレットを開く
2. 「agent:open settings」を検索して選択
3. 「Model Context Protocol (MCP) Servers」セクションで「Add Server」をクリック
4. 「Add Custom Server」を選択

以下の設定を追加します。

```json
{
	"svelte": {
		"command": "npx",
		"args": ["-y", "@sveltejs/mcp"]
	}
}
```

</details>

### Codex CLI

`~/.codex/config.toml` に以下を追加（詳細は[設定ドキュメント](https://github.com/openai/codex/blob/main/docs/config.md)を参照）

```toml
[mcp_servers.svelte]
command = "npx"
args = ["-y", "@sveltejs/mcp"]
```

### Gemini CLI

```bash
gemini mcp add -t stdio -s [scope] svelte npx -y @sveltejs/mcp
```

`[scope]` は `user`、`project`、`local` から選択できます。

### OpenCode

```
opencode mcp add
┌ Add MCP server
│ ◇ Enter MCP server name
│ svelte
│ ◇ Select MCP server type
│ Local
│ ◆ Enter command to run
│ npx -y @sveltejs/mcp
```

### その他のクライアント

上記以外の MCP クライアントを使用している場合は、各ドキュメントの `stdio` サーバー設定を参照し、コマンドに `npx`、引数に `-y @sveltejs/mcp` を指定してください。

## Remote 版のセットアップ

Remote 版は `https://mcp.svelte.dev/mcp` を使用します。
ローカルにパッケージをインストールする必要がないため、設定が簡単です。

### Claude Code（CLI）

```bash
claude mcp add -t http -s [scope] svelte https://mcp.svelte.dev/mcp
```

`[scope]` は `user`、`project`、`local` から選択できます。

### Claude Desktop

1. Settings > Connectors を開く
2. 「Add Custom Connector」をクリック
3. 名前に `svelte` と入力
4. Remote MCP server URL に `https://mcp.svelte.dev/mcp` を入力
5. 「Add」をクリック

### Cursor

1. コマンドパレットを開く
2. 「View: Open MCP Settings」を選択
3. 「Add custom MCP」をクリック

```json
{
	"mcpServers": {
		"svelte": {
			"url": "https://mcp.svelte.dev/mcp"
		}
	}
}
```

### VS Code

1. コマンドパレットを開く
2. 「MCP: Add Server...」を選択
3. 「HTTP (HTTP or Server-Sent-Events)」を選択
4. `https://mcp.svelte.dev/mcp` を入力して Enter
5. 任意の名前を入力
6. `Global` または `Workspace` を選択

### Codex CLI

`~/.codex/config.toml` に以下を追加

```toml
experimental_use_rmcp_client = true

[mcp_servers.svelte]
url = "https://mcp.svelte.dev/mcp"
```

### Gemini CLI

```bash
gemini mcp add -t http -s [scope] svelte https://mcp.svelte.dev/mcp
```

`[scope]` は `user` または `project` から選択できます。

### OpenCode

```
opencode mcp add
┌ Add MCP server
│ ◇ Enter MCP server name
│ svelte
│ ◇ Select MCP server type
│ Remote
│ ◇ Enter MCP server URL
│ https://mcp.svelte.dev/mcp
```

### GitHub Coding Agent

1. GitHub でリポジトリを開く
2. Settings > Copilot > Coding agent に移動
3. MCP configuration を編集

```json
{
	"mcpServers": {
		"svelte": {
			"type": "http",
			"url": "https://mcp.svelte.dev/mcp",
			"tools": ["*"]
		}
	}
}
```

4. 「Save MCP configuration」をクリック

### その他のクライアント

上記以外の MCP クライアントを使用している場合は、各ドキュメントの `remote` サーバー設定を参照し、URL に `https://mcp.svelte.dev/mcp` を指定してください。

## SvelteKit プロジェクトへの追加

SvelteKit プロジェクトでは、`sv` コマンドで簡単にセットアップできます。

```bash
npx sv add mcp
```

このコマンドは以下を自動的に行います。

1. MCP の設定を追加
2. `CLAUDE.md`（または`AGENTS.md`）に推奨プロンプトを追加

## 動作確認

セットアップ後、以下のような質問をして動作を確認してください。

```
Svelte 5の$stateの使い方を教えて
```

MCP が正しく動作していれば、LLM は `list-sections` → `get-documentation` の順でツールを呼び出し、最新のドキュメントに基づいた回答を返します。

## トラブルシューティング

### MCP サーバーが認識されない

1. 設定ファイルの JSON/TOML 構文を確認
2. クライアントを再起動
3. `npx -y @sveltejs/mcp` が単独で実行できるか確認

### タイムアウトエラー

Remote 版で発生する場合は、Local 版への切り替えを検討してください。

### ツールが呼び出されない

`CLAUDE.md` または `AGENTS.md` に推奨プロンプトを追加してください。
詳細は [公式ドキュメント](https://svelte.dev/docs/mcp/overview#Usage) を参照。
