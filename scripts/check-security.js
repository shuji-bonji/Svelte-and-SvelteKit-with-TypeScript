#!/usr/bin/env node

/**
 * セキュリティとパッケージ更新のチェックスクリプト
 *
 * 使い方:
 *   npm run security-check
 */

import { execSync } from 'child_process';
import { readFileSync } from 'fs';

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function section(title) {
  console.log('');
  log(`${'='.repeat(60)}`, colors.cyan);
  log(`  ${title}`, colors.bold + colors.cyan);
  log(`${'='.repeat(60)}`, colors.cyan);
  console.log('');
}

function exec(command) {
  try {
    return execSync(command, { encoding: 'utf8' });
  } catch (error) {
    return error.stdout || error.stderr || '';
  }
}

// メイン処理
async function main() {
  log('\n🔍 セキュリティ & パッケージチェック開始\n', colors.bold);

  // 1. パッケージバージョン情報
  section('📦 現在のパッケージバージョン');

  const packageJson = JSON.parse(readFileSync('./package.json', 'utf8'));
  const devDeps = packageJson.devDependencies || {};
  const deps = packageJson.dependencies || {};

  const keyPackages = {
    'Svelte': 'svelte',
    'SvelteKit': '@sveltejs/kit',
    'Vite': 'vite',
    'Vite Plugin Svelte': '@sveltejs/vite-plugin-svelte',
    'TypeScript': 'typescript',
    'SveltePress Theme': '@sveltepress/theme-default',
    'SveltePress Vite': '@sveltepress/vite',
    'Mermaid': 'mermaid'
  };

  for (const [name, pkg] of Object.entries(keyPackages)) {
    const version = devDeps[pkg] || deps[pkg];
    if (version) {
      const installedVersion = exec(`npm list ${pkg} --depth=0 2>/dev/null | grep ${pkg}`).trim();
      log(`  ${name.padEnd(25)} ${installedVersion || version}`, colors.green);
    }
  }

  // 2. セキュリティ監査
  section('🔒 セキュリティ監査');

  const auditResult = exec('npm audit --json');
  let auditData;

  try {
    auditData = JSON.parse(auditResult);
  } catch (e) {
    log('  監査情報の解析に失敗しました', colors.yellow);
    auditData = { metadata: { vulnerabilities: {} } };
  }

  const vulns = auditData.metadata?.vulnerabilities || {};
  const total = Object.values(vulns).reduce((sum, count) => sum + count, 0);

  if (total === 0) {
    log('  ✅ 脆弱性は検出されませんでした！', colors.green);
  } else {
    log(`  ⚠️  合計 ${total} 件の脆弱性が検出されました:`, colors.yellow);
    if (vulns.critical) log(`    - 致命的: ${vulns.critical}`, colors.red);
    if (vulns.high) log(`    - 高: ${vulns.high}`, colors.red);
    if (vulns.moderate) log(`    - 中: ${vulns.moderate}`, colors.yellow);
    if (vulns.low) log(`    - 低: ${vulns.low}`, colors.yellow);

    log('\n  詳細を確認: npm audit', colors.cyan);
  }

  // 3. 古いパッケージチェック
  section('📊 更新可能なパッケージ');

  const outdated = exec('npm outdated --json');
  let outdatedData;

  try {
    outdatedData = JSON.parse(outdated);
  } catch (e) {
    log('  すべてのパッケージが最新です！', colors.green);
    outdatedData = {};
  }

  const outdatedCount = Object.keys(outdatedData).length;

  if (outdatedCount === 0) {
    log('  ✅ すべてのパッケージが最新です！', colors.green);
  } else {
    log(`  📦 ${outdatedCount} 個のパッケージが更新可能です:\n`, colors.yellow);

    for (const [pkg, info] of Object.entries(outdatedData)) {
      const isMajor = info.current.split('.')[0] !== info.latest.split('.')[0];
      const color = isMajor ? colors.red : colors.yellow;
      const indicator = isMajor ? '🔴' : '🟡';

      log(`  ${indicator} ${pkg}`, color);
      log(`     現在: ${info.current} → 最新: ${info.latest}`, color);

      if (isMajor) {
        log(`     ⚠️  メジャーアップデート（破壊的変更の可能性）`, colors.red);
      }
    }

    log('\n  マイナー/パッチ更新: npm update', colors.cyan);
    log('  メジャー更新前に SECURITY-MONITORING.md を確認してください', colors.cyan);
  }

  // 4. 特定パッケージの監視
  section('👀 監視対象パッケージの状態');

  const monitorPackages = [
    { name: 'cookie', vulnerable: true },
    { name: 'esbuild', vulnerable: true },
    { name: 'devalue', vulnerable: false }
  ];

  for (const { name, vulnerable } of monitorPackages) {
    const versionInfo = exec(`npm list ${name} --depth=0 2>/dev/null | grep ${name}`).trim();
    if (versionInfo) {
      const indicator = vulnerable ? '⚠️ ' : '✅';
      const color = vulnerable ? colors.yellow : colors.green;
      log(`  ${indicator} ${versionInfo}`, color);
    }
  }

  // 5. 推奨アクション
  section('💡 推奨アクション');

  const actions = [];

  if (total > 0) {
    actions.push('• npm audit fix を実行（非破壊的な修正）');
  }

  if (outdatedCount > 0) {
    const hasMinorUpdates = Object.values(outdatedData).some(info =>
      info.current.split('.')[0] === info.latest.split('.')[0]
    );
    if (hasMinorUpdates) {
      actions.push('• npm update を実行（セマンティックバージョニング範囲内）');
    }
  }

  actions.push('• SECURITY-MONITORING.md を確認');

  if (actions.length === 0) {
    log('  ✅ 現時点で必要なアクションはありません', colors.green);
  } else {
    actions.forEach(action => log(`  ${action}`, colors.cyan));
  }

  // 6. サマリー
  section('📋 サマリー');

  const today = new Date().toLocaleDateString('ja-JP');
  log(`  チェック日時: ${today}`, colors.blue);
  log(`  脆弱性: ${total === 0 ? '✅ なし' : `⚠️  ${total}件`}`, total === 0 ? colors.green : colors.yellow);
  log(`  更新可能: ${outdatedCount === 0 ? '✅ なし' : `${outdatedCount}件`}`, outdatedCount === 0 ? colors.green : colors.yellow);

  log('\n' + '='.repeat(60) + '\n', colors.cyan);
  log('詳細は SECURITY-MONITORING.md を参照してください\n', colors.bold);
}

main().catch(error => {
  console.error('エラーが発生しました:', error);
  process.exit(1);
});
