#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Fix duplicate script tags in markdown files
function fixDuplicateScripts(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Check if file has navigation script added
  if (!content.includes("import { base } from '$app/paths';")) {
    return false;
  }
  
  // Find all script tag positions
  const scriptMatches = [];
  const regex = /<script[^>]*>/g;
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    scriptMatches.push({
      index: match.index,
      tag: match[0],
      isNavScript: content.slice(Math.max(0, match.index - 50), match.index + 200).includes("import { base }")
    });
  }
  
  if (scriptMatches.length <= 1) {
    return false;
  }
  
  // Find the navigation script (should be first)
  const navScriptMatch = scriptMatches.find(m => m.isNavScript);
  if (!navScriptMatch) {
    return false;
  }
  
  // Find the closing tag for nav script
  const navScriptEnd = content.indexOf('</script>', navScriptMatch.index) + 9;
  const navScriptContent = content.slice(navScriptMatch.index, navScriptEnd);
  
  // Extract just the base import
  const baseImportMatch = navScriptContent.match(/import { base } from '\$app\/paths';/);
  if (!baseImportMatch) {
    return false;
  }
  
  // Find other script tags (for imports like Mermaid)
  const otherScripts = scriptMatches.filter(m => !m.isNavScript);
  if (otherScripts.length === 0) {
    return false;
  }
  
  // Get the content of the second script tag
  const secondScript = otherScripts[0];
  const secondScriptEnd = content.indexOf('</script>', secondScript.index) + 9;
  const secondScriptContent = content.slice(secondScript.index, secondScriptEnd);
  
  // Extract imports and code from second script
  const secondScriptInner = secondScriptContent.match(/<script[^>]*>([\s\S]*?)<\/script>/)?.[1];
  if (!secondScriptInner) {
    return false;
  }
  
  // Combine imports into first script tag
  const combinedScript = `<script>
  import { base } from '$app/paths';${secondScriptInner.trim() ? '\n' + secondScriptInner.trim() : ''}
</script>`;
  
  // Remove the nav script and second script, replace with combined
  let newContent = content.slice(0, navScriptMatch.index) + 
                   combinedScript + 
                   content.slice(navScriptEnd, secondScript.index) +
                   content.slice(secondScriptEnd);
  
  fs.writeFileSync(filePath, newContent, 'utf-8');
  return true;
}

// Find all markdown files with potential issues
function findAndFixFiles() {
  const srcDir = path.join(process.cwd(), 'src', 'routes');
  const filesToCheck = [];
  
  function walkDir(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        walkDir(fullPath);
      } else if (file.endsWith('.md')) {
        filesToCheck.push(fullPath);
      }
    }
  }
  
  walkDir(srcDir);
  
  console.log(`Checking ${filesToCheck.length} markdown files...`);
  
  let fixedCount = 0;
  for (const file of filesToCheck) {
    if (fixDuplicateScripts(file)) {
      console.log(`✅ Fixed: ${path.relative(process.cwd(), file)}`);
      fixedCount++;
    }
  }
  
  console.log(`\nFixed ${fixedCount} files with duplicate script tags.`);
}

findAndFixFiles();