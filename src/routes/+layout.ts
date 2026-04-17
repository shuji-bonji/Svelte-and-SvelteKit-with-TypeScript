// 全ページをプレレンダリング（静的サイト生成）
export const prerender = true;

// 末尾スラッシュ付きURLを正規とする
// sidebar.ts の to: と sitemap.xml が末尾スラッシュ付きで統一されているため、
// adapter-static の出力を `foo/index.html` 形式にしてどちらのURLでも 200 を返せるようにする。
export const trailingSlash = 'always';
