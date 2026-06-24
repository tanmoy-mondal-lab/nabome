#!/usr/bin/env node
/**
 * Bulk update handler files to use getPrisma(env) instead of prisma import
 * This fixes Cloudflare Pages deployment issue
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const HANDLERS_DIR = path.join(__dirname, '../api/_handlers');

function updateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  const original = content;

  // Skip if already using getPrisma
  if (content.includes('import { getPrisma }')) {
    console.log(`Skipping ${path.basename(filePath)} - already uses getPrisma`);
    return false;
  }

  // Replace import
  content = content.replace(
    /import\s*{\s*prisma\s*}\s*from\s*["']\.\.\/_lib\/prisma["']/g,
    'import { getPrisma } from "../_lib/prisma"'
  );
  content = content.replace(
    /import\s*{\s*prisma\s*}\s*from\s*["']\.\.\/\.\.\/_lib\/prisma["']/g,
    'import { getPrisma } from "../../_lib/prisma"'
  );

  // Add env parameter to handler functions and add prisma initialization
  const lines = content.split('\n');
  const newLines = [];
  let inFunction = false;
  let functionIndent = '';
  let needsPrismaInit = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Detect function definition
    const asyncFuncMatch = trimmed.match(/^async function (\w+)\s*\(([^)]*)\)\s*:/);
    if (asyncFuncMatch && !trimmed.includes('env')) {
      const funcName = asyncFuncMatch[1];
      const params = asyncFuncMatch[2];
      
      // Add env parameter
      const newParams = params.trim() ? `${params.trim()}, env: any` : 'env: any';
      const newLine = line.replace(params, newParams);
      newLines.push(newLine);
      inFunction = true;
      functionIndent = line.match(/^(\s*)/)[1];
      needsPrismaInit = true;
      continue;
    }

    // If we're in a function and need to add prisma init
    if (inFunction && needsPrismaInit) {
      if (trimmed === '{' || trimmed.startsWith('try {')) {
        newLines.push(line);
        const indent = trimmed === '{' ? functionIndent + '  ' : functionIndent + '    ';
        newLines.push(`${indent}const prisma = getPrisma(env);`);
        needsPrismaInit = false;
        continue;
      }
    }

    // End of function
    if (inFunction && trimmed.startsWith('}') && !trimmed.includes('else')) {
      inFunction = false;
      needsPrismaInit = false;
    }

    newLines.push(line);
  }

  content = newLines.join('\n');

  // Update function calls to pass ctx.env
  // Find patterns like handleXxx() and change to handleXxx(ctx.env)
  const functionCallPattern = /handle(\w+)\(\)/g;
  content = content.replace(functionCallPattern, (match, funcName) => {
    return `handle${funcName}(ctx.env)`;
  });

  // Find patterns like handleXxx(params[0]) and change to handleXxx(params[0], ctx.env)
  const functionCallWithParamsPattern = /handle(\w+)\(([^)]+)\)(?!\s*,)/g;
  content = content.replace(functionCallWithParamsPattern, (match, funcName, params) => {
    if (params.includes('env')) return match; // Already has env
    if (params.includes('ctx')) return match; // Already has ctx
    return `handle${funcName}(${params}, ctx.env)`;
  });

  // Update logAction calls to pass env
  content = content.replace(/logAction\(/g, 'logAction(ctx.userId, ');
  content = content.replace(/logAction\(ctx\.userId,/g, 'logAction(ctx.userId, ');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Updated ${path.basename(filePath)}`);
    return true;
  }

  return false;
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  let updated = 0;

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      updated += walkDir(filePath);
    } else if (file.endsWith('.ts')) {
      if (updateFile(filePath)) {
        updated++;
      }
    }
  }

  return updated;
}

console.log('Updating handler files to use getPrisma(env)...');
const updatedCount = walkDir(HANDLERS_DIR);
console.log(`\nUpdated ${updatedCount} files`);
