import { cpSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

// GitHub Pages用のベースパス
const BASE_PATH = 'Svelte-and-SvelteKit-with-TypeScript';

// distディレクトリの確認
const distDir = 'dist';
if (!existsSync(distDir)) {
  console.error('dist directory not found. Run build first.');
  process.exit(1);
}

// Pagefindファイルのコピー先を作成
const targetDir = join(distDir, BASE_PATH, 'pagefind');
if (!existsSync(join(distDir, BASE_PATH))) {
  mkdirSync(join(distDir, BASE_PATH), { recursive: true });
}

// Pagefindファイルをコピー
const sourceDir = join(distDir, 'pagefind');
if (existsSync(sourceDir)) {
  console.log(`Copying pagefind files from ${sourceDir} to ${targetDir}`);
  cpSync(sourceDir, targetDir, { recursive: true });
  console.log('Pagefind files copied successfully');
} else {
  console.error('Pagefind directory not found in dist. Run pagefind first.');
}