import { defaultTheme } from '@sveltepress/theme-default';
import { sveltepress } from '@sveltepress/vite';
import { defineConfig } from 'vite';
import type { Plugin } from 'vite';
import { sidebarConfig } from './src/lib/config/sidebar.js';

// ビルド時の警告を環境変数で制御
process.env.VITE_PLUGIN_SVELTE_DISABLE_WARNINGS = 'true';

// Svelteの警告をフィルタリングするプラグイン
const svelteLiveCodeWarningFilter = (): Plugin => {
  return {
    name: 'svelte-livecode-warning-filter',
    enforce: 'pre',
    config(config) {
      if (!config.server) config.server = {};
      if (!config.server.hmr) config.server.hmr = {};

      // 開発サーバーの警告を抑制
      const originalWarn = console.warn;
      console.warn = (...args: any[]) => {
        const message = args[0]?.toString() || '';
        if (message.includes('.sveltepress/live-code/')) {
          return;
        }
        originalWarn(...args);
      };

      return config;
    },
  };
};

const config = defineConfig({
  plugins: [
    svelteLiveCodeWarningFilter(),
    // @ts-ignore - Viteバージョンの互換性問題を回避
    sveltepress({
      theme: defaultTheme({
        highlighter: {
          languages: [
            'svelte',
            'sh',
            'js',
            'javascript',
            'ts',
            'typescript',
            'html',
            'md',
            'css',
            'scss',
            'json',
            'yaml',
            'bash',
            'sql',
            'prisma',
            'dockerfile',
            'diff',
            'toml',
          ],
        },
        navbar: [
          { title: 'ホーム', to: '/' },
          { title: 'Svelte', to: '/svelte/' },
          { title: 'SvelteKit', to: '/sveltekit/' },
          { title: 'Svelte MCP', to: '/svelte-mcp/' },
          { title: '実装例', to: '/examples/' },
          { title: 'リファレンス', to: '/reference/' },
          { title: 'ディープダイブ', to: '/deep-dive/' },
        ],
        sidebar: sidebarConfig,
        github:
          'https://github.com/shuji-bonji/Svelte-and-SvelteKit-with-TypeScript',
        logo: '/svelteAndTypescript.svg',
        editLink:
          'https://github.com/shuji-bonji/Svelte-and-SvelteKit-with-TypeScript/edit/main/src/routes/',
      }),
      siteConfig: {
        title: 'TypeScriptで学ぶ Svelte 5/SvelteKit',
        description:
          'TypeScript による Svelte 5/SvelteKit 完全マスター学習ガイド',
      },
    }),
  ],
});

export default config;
