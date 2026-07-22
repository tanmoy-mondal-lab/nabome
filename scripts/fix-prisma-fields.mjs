import { readFileSync, writeFileSync } from 'fs';

// Read all .ts files
import { execSync } from 'child_process';

// Generate camelCase from snake_case
function toCamelCase(str) {
  return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

// Read Prisma schema and extract all fields
const schema = readFileSync('/Users/tanmoymondal/nabome/prisma/schema.prisma', 'utf8');
const fields = new Set();
const lines = schema.split('\n');
let inModel = false;
for (const line of lines) {
  if (line.startsWith('model ')) { inModel = true; continue; }
  if (inModel && line.startsWith('}')) { inModel = false; continue; }
  if (!inModel) continue;
  const match = line.match(/^\s{2}([a-z]\w+)/);
  if (match) {
    const fieldName = match[1];
    if (fieldName.includes('_')) {
      fields.add(fieldName);
    }
  }
}

// Build mapping: camelCase -> snake_case
const camelToSnake = {};
for (const snake of fields) {
  const camel = toCamelCase(snake);
  if (camel !== snake) {
    camelToSnake[camel] = snake;
  }
}

// Sort by length descending to avoid partial matches
const sorted = Object.entries(camelToSnake).sort((a, b) => b[0].length - a[0].length);

// Also add specific relation names
sorted.push(
  ['shippingAddress', 'shipping_address_id'],
  ['billingAddress', 'billing_address_id'],
  ['newEmail', 'new_email'],
  ['currentPassword', 'current_password'],
  ['newPassword', 'new_password'],
);

// eslint-disable-next-line no-console
console.log(`Generated ${sorted.length} field mappings from Prisma schema`);

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function fixFile(filePath) {
  let content = readFileSync(filePath, 'utf8');
  let original = content;

  for (const [camel, snake] of sorted) {
    // Replace anywhere `camelCase:` appears as a property key
    // Matches patterns like `  fieldName:` or `fieldName:` in object literals
    // But NOT inside strings, NOT as variable names, NOT as function names
    
    // Match: property key followed by colon (object literal key)
    // Need to be careful not to match inside string literals
    const propRegex = new RegExp(`(?<![\\w\\d])${escapeRegex(camel)}(?=\\s*:)`, 'g');
    content = content.replace(propRegex, snake);
    
    // Also handle shorthand properties: `{ fieldName }` -> `{ field_name: fieldName }`
    // This is risky, skip for now
  }

  if (content !== original) {
    writeFileSync(filePath, content, 'utf8');
    return true;
  }
  return false;
}

const dirs = [
  '/Users/tanmoymondal/nabome/api',
  '/Users/tanmoymondal/nabome/src',
];

let fileCount = 0;

for (const dir of dirs) {
  const result = execSync(`find "${dir}" -name "*.ts" -not -path "*/node_modules/*"`, { encoding: 'utf8' });
  const files = result.trim().split('\n').filter(Boolean);
  
  for (const file of files) {
    if (fixFile(file)) {
      // eslint-disable-next-line no-console
      console.log(`Fixed: ${file}`);
      fileCount++;
    }
  }
}

// eslint-disable-next-line no-console
console.log(`\nDone! Fixed ${fileCount} files with Prisma field name mismatches.`);
