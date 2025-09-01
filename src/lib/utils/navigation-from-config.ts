// vite.config.tsのサイドバー構造から自動的にナビゲーション構造を生成するユーティリティ
import { sidebarConfig as sharedSidebarConfig, type SidebarItem } from '$lib/config/sidebar';

export interface NavItem {
  title: string;
  href: string;
}

// サイドバー構造をフラットなリストに変換
// 重複するパスを除外（概要ページのスキップ）
function flattenSidebar(items: SidebarItem[], result: NavItem[] = []): NavItem[] {
  // 既に追加されたパスを記録
  const addedPaths = new Set<string>(result.map(item => item.href));
  
  for (const item of items) {
    // パスを正規化（末尾にスラッシュを追加）
    const normalizedPath = item.to.endsWith('/') ? item.to : item.to + '/';
    
    // 既に同じパスが追加されている場合はスキップ
    if (!addedPaths.has(normalizedPath)) {
      result.push({
        title: item.title,
        href: normalizedPath
      });
      addedPaths.add(normalizedPath);
    }
    
    if (item.items) {
      // 子要素を再帰的に処理
      flattenSidebar(item.items, result);
    }
  }
  return result;
}

// 現在のパスから前後のページを取得
export function getNavigationFromSidebar(
  currentPath: string,
  sidebarConfig: { [key: string]: SidebarItem[] }
): { prev?: NavItem; next?: NavItem } {
  // すべてのサイドバーアイテムをフラットなリストに変換
  const allPages: NavItem[] = [];
  
  // すべてのセクションのアイテムを統合
  for (const section in sidebarConfig) {
    flattenSidebar(sidebarConfig[section], allPages);
  }
  
  // パスを正規化（末尾にスラッシュを追加）
  const normalizedCurrentPath = currentPath.endsWith('/') ? currentPath : currentPath + '/';
  
  // 現在のページのインデックスを見つける
  const currentIndex = allPages.findIndex(page => page.href === normalizedCurrentPath);
  
  if (currentIndex === -1) {
    return {}; // ページが見つからない場合
  }
  
  // 前後のページを取得
  const prev = currentIndex > 0 ? allPages[currentIndex - 1] : undefined;
  const next = currentIndex < allPages.length - 1 ? allPages[currentIndex + 1] : undefined;
  
  return { prev, next };
}

// 共有設定からサイドバー構造を使用
export const sidebarConfig: { [key: string]: SidebarItem[] } = sharedSidebarConfig;