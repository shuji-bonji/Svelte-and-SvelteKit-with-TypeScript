import { statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';
import { sidebarConfig, type SidebarItem } from '$lib/config/sidebar';

// ビルド時に静的ファイルとして生成
export const prerender = true;

// 公開ドメイン（GitHub Pages）
const DOMAIN = 'https://shuji-bonji.github.io/Svelte-and-SvelteKit-with-TypeScript';

// プロジェクトルートからの src/routes パス
const ROUTES_DIR = join(process.cwd(), 'src', 'routes');

/**
 * SidebarItem ツリーを再帰的にフラット化
 */
function flattenPaths(items: SidebarItem[]): string[] {
  const result: string[] = [];
  for (const item of items) {
    result.push(item.to);
    if (item.items) {
      result.push(...flattenPaths(item.items));
    }
  }
  return result;
}

/**
 * URL パス（例: /introduction/setup/）から対応する +page.md / +page.svelte の
 * ファイルシステム上のパスを返す。
 */
function resolveSourceFile(urlPath: string): string | null {
  // 先頭と末尾のスラッシュを除去
  const cleanPath = urlPath.replace(/^\/|\/$/g, '');
  const baseDir = cleanPath === '' ? ROUTES_DIR : join(ROUTES_DIR, cleanPath);

  const candidates = ['+page.md', '+page.svelte'];
  for (const name of candidates) {
    const full = join(baseDir, name);
    if (existsSync(full)) return full;
  }
  return null;
}

/**
 * git log から最終更新日時（ISO 8601）を取得。
 * 取得失敗時は fs.statSync の mtime で代替。
 */
function getLastModified(filePath: string): string | null {
  try {
    const stdout = execSync(`git log -1 --format=%cI -- "${filePath}"`, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'ignore']
    }).trim();
    if (stdout) return new Date(stdout).toISOString();
  } catch {
    // git が使えない環境では fs.statSync にフォールバック
  }
  try {
    return statSync(filePath).mtime.toISOString();
  } catch {
    return null;
  }
}

/**
 * XML エスケープ（URL に含まれる & など）
 */
function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function GET() {
  // sidebar の全パスを収集 + ホームを追加
  const rawPaths = ['/', ...Object.values(sidebarConfig).flatMap(flattenPaths)];

  // 重複除去
  const uniquePaths = [...new Set(rawPaths)];

  // 各パスの URL 情報を構築
  const entries = uniquePaths.map((path) => {
    const sourceFile = resolveSourceFile(path);
    const lastmod = sourceFile ? getLastModified(sourceFile) : null;
    const normalizedPath = path === '/' ? '' : path;
    return {
      loc: `${DOMAIN}${normalizedPath}`,
      lastmod
    };
  });

  // XML 生成
  const body = entries
    .map(({ loc, lastmod }) => {
      const lines = [`    <loc>${escapeXml(loc)}</loc>`];
      if (lastmod) lines.push(`    <lastmod>${lastmod}</lastmod>`);
      return `  <url>\n${lines.join('\n')}\n  </url>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'max-age=0, s-maxage=3600'
    }
  });
}
