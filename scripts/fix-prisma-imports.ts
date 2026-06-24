#!/usr/bin/env node
/**
 * Script to update all handler files to use getPrisma(env) instead of prisma import
 * This fixes the Cloudflare Pages deployment issue where env is injected at request time
 */

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

interface FileUpdate {
  path: string;
  original: string;
  updated: string;
}

const updates: FileUpdate[] = [];

function updateHandlerFile(filePath: string): void {
  const content = readFileSync(filePath, 'utf-8');
  let updated = content;

  // Skip if already using getPrisma
  if (content.includes('import { getPrisma }')) {
    console.log(`Skipping ${filePath} - already uses getPrisma`);
    return;
  }

  // Replace import statement
  updated = updated.replace(
    /import\s*{\s*prisma\s*}\s*from\s*["']\.\.\/_lib\/prisma["']/g,
    'import { getPrisma } from "../_lib/prisma"'
  );
  updated = updated.replace(
    /import\s*{\s*prisma\s*}\s*from\s*["']\.\.\/\.\.\/_lib\/prisma["']/g,
    'import { getPrisma } from "../../_lib/prisma"'
  );

  // Find all function definitions that need env parameter
  // Pattern: async function name(params): ReturnType
  const functionPattern = /async\s+function\s+(\w+)\s*\(([^)]*)\)\s*:\s*Promise<[^>]+>/g;
  
  let match;
  const functionsToUpdate: { name: string; params: string; hasEnv: boolean }[] = [];
  
  while ((match = functionPattern.exec(content)) !== null) {
    const [, funcName, params] = match;
    const hasEnv = params.includes('env') || params.includes('ctx');
    functionsToUpdate.push({ name: funcName, params, hasEnv });
  }

  // For each function, add env parameter if it uses prisma
  for (const func of functionsToUpdate) {
    if (content.includes(`prisma.`) && !func.hasEnv) {
      // Add env parameter to function signature
      const funcRegex = new RegExp(
        `(async function ${func.name}\\s*\\()(${func.params})(\\)\\s*:\\s*Promise<[^>]+>)`,
        'g'
      );
      
      const newParams = func.params.trim() 
        ? `${func.params.trim()}, env: any` 
        : 'env: any';
      
      updated = updated.replace(funcRegex, `$1${newParams}$3`);
    }
  }

  // Replace prisma. with getPrisma(env).prisma inside functions
  // This is a simple heuristic - we'll need to add const prisma = getPrisma(env); at function start
  const lines = updated.split('\n');
  const newLines: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // If this is a function definition that now has env parameter
    if (line.match(/async function \w+.*env: any/)) {
      newLines.push(line);
      // Check if next line is a try block or opening brace
      if (lines[i + 1]?.trim() === '{') {
        newLines.push(lines[i + 1]);
        // Add prisma initialization after opening brace
        newLines.push('    const prisma = getPrisma(env);');
        i++; // skip the opening brace we just added
      } else if (lines[i + 1]?.trim().startsWith('try')) {
        newLines.push(lines[i + 1]);
        if (lines[i + 2]?.trim() === '{') {
          newLines.push(lines[i + 2]);
          newLines.push('      const prisma = getPrisma(env);');
          i += 2;
        }
      }
    } else {
      newLines.push(line);
    }
  }

  updated = newLines.join('\n');

  if (updated !== content) {
    updates.push({ path: filePath, original: content, updated });
    writeFileSync(filePath, updated, 'utf-8');
    console.log(`Updated ${filePath}`);
  }
}

async function main() {
  const handlerFiles = await glob('api/_handlers/**/*.ts');
  
  console.log(`Found ${handlerFiles.length} handler files`);
  
  for (const file of handlerFiles) {
    updateHandlerFile(file);
  }
  
  console.log(`\nUpdated ${updates.length} files`);
}

main().catch(console.error);
