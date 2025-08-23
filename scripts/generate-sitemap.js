import { exec } from 'child_process';
import { promisify } from 'util';
import { readdir, stat, writeFile } from 'fs/promises';
import { join } from 'path';

const execAsync = promisify(exec);

/**
 * Gitから最終更新日時を取得
 */
async function getLastModified(filePath) {
  try {
    const { stdout } = await execAsync(`git log -1 --format=%cI "${filePath}"`);
    const date = stdout.trim();
    if (date) {
      // ISO 8601形式で返す（W3C Datetime形式）
      return new Date(date).toISOString();
    }
  } catch (error) {
    // Gitログが取得できない場合（新規ファイルなど）
    console.warn(`Could not get git date for ${filePath}`);
  }
  return null;
}

/**
 * distディレクトリ内のHTMLファイルを再帰的に探索
 */
async function findHtmlFiles(dir, baseDir = dir) {
  const files = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      // pagefindディレクトリは除外
      if (entry.name !== 'pagefind') {
        files.push(...await findHtmlFiles(fullPath, baseDir));
      }
    } else if (entry.name === 'index.html') {
      // 相対パスを取得
      const relativePath = fullPath.replace(baseDir + '/', '');
      files.push(relativePath);
    }
  }

  return files;
}

/**
 * HTMLファイルパスから元のソースファイルパスを推定
 */
function getSourcePath(htmlPath) {
  // dist/Svelte-and-SvelteKit-with-TypeScript/runes/state/index.html
  // -> src/routes/runes/state/+page.md
  
  let sourcePath = htmlPath
    .replace('Svelte-and-SvelteKit-with-TypeScript/', '')
    .replace('/index.html', '');
  
  if (sourcePath === 'index.html') {
    sourcePath = '';
  }
  
  // +page.mdまたは+page.svelteを探す
  const mdPath = `src/routes/${sourcePath}/+page.md`.replace(/\/+/g, '/');
  const sveltePath = `src/routes/${sourcePath}/+page.svelte`.replace(/\/+/g, '/');
  
  return { mdPath, sveltePath };
}

/**
 * sitemap.xmlを生成
 */
async function generateSitemap() {
  const domain = 'https://shuji-bonji.github.io/Svelte-and-SvelteKit-with-TypeScript';
  const distDir = 'dist';
  
  console.log('Generating sitemap with git lastmod dates...');
  
  // HTMLファイルを探索
  const htmlFiles = await findHtmlFiles(distDir);
  
  // URL情報を収集
  const urls = [];
  
  for (const htmlPath of htmlFiles) {
    const { mdPath, sveltePath } = getSourcePath(htmlPath);
    
    // 最終更新日時を取得（mdファイルを優先）
    let lastmod = null;
    try {
      await stat(mdPath);
      lastmod = await getLastModified(mdPath);
    } catch {
      try {
        await stat(sveltePath);
        lastmod = await getLastModified(sveltePath);
      } catch {
        // ソースファイルが見つからない
      }
    }
    
    // URLを構築
    const urlPath = htmlPath
      .replace('Svelte-and-SvelteKit-with-TypeScript/', '')
      .replace('/index.html', '')
      .replace('index.html', '');
    
    const url = {
      loc: urlPath ? `${domain}/${urlPath}` : domain,
      lastmod
    };
    
    urls.push(url);
  }
  
  // XMLを生成
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  xml += '  <!-- Generated with git lastmod dates -->\n';
  
  for (const url of urls) {
    xml += '  <url>\n';
    xml += `    <loc>${url.loc}</loc>\n`;
    if (url.lastmod) {
      xml += `    <lastmod>${url.lastmod}</lastmod>\n`;
    }
    xml += '  </url>\n';
  }
  
  xml += '</urlset>';
  
  // ファイルに書き込み
  await writeFile(join(distDir, 'sitemap.xml'), xml);
  console.log(`✓ Sitemap generated with ${urls.length} URLs`);
}

// 実行
generateSitemap().catch(console.error);