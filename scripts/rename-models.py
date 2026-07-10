"""
Rename Prisma models to match code expectations (plural snake_case).
Keeps @@map pointing to the same DB table names.
Updates all field type references between models.
"""
import re
from pathlib import Path

SCHEMA_PATH = Path('/Users/tanmoymondal/nabome/prisma/schema.prisma')
BACKUP_PATH = Path('/Users/tanmoymondal/nabome/prisma/schema.prisma.bak2')

content = SCHEMA_PATH.read_text()
BACKUP_PATH.write_text(content)
print(f'Backup: {BACKUP_PATH}')

# Extract all model names and their @@map table names
model_info = {}  # old_name -> { table_name, new_name, line_idx }
for i, line in enumerate(content.split('\n')):
    m = re.match(r'^model (\w+) \{', line)
    if m:
        model_info[m.group(1)] = {'line_idx': i, 'table_name': None, 'new_name': None}

# For each model, find its @@map to determine the target name
current_model = None
for i, line in enumerate(content.split('\n')):
    m = re.match(r'^model (\w+) \{', line)
    if m:
        current_model = m.group(1)
    elif current_model and line.strip().startswith('@@map('):
        table_name = re.match(r'@@map\("([^"]+)"\)', line.strip())
        if table_name:
            model_info[current_model]['table_name'] = table_name.group(1)
            model_info[current_model]['new_name'] = table_name.group(1)
    elif line.strip() == '}':
        current_model = None

# For models without @@map, derive name from model name
for old, info in model_info.items():
    if info['new_name'] is None:
        info['new_name'] = old

# Print mapping
for old, info in sorted(model_info.items()):
    if old != info['new_name']:
        print(f'  {old:30s} -> {info["new_name"]}')
print(f'Total: {len(model_info)} models')

# Build replacement: sort longest-first to avoid partial matches
sorted_models = sorted(model_info.keys(), key=lambda x: -len(x))

def replace_type_refs(text, model_info):
    """Replace all field type references to renamed models."""
    for old in sorted(model_info.keys()):
        new = model_info[old]['new_name']
        if old != new:
            # Use word boundary to avoid partial matches (e.g., "Product" in "ProductVariant")
            text = re.sub(r'\b' + re.escape(old) + r'\b', new, text)
    return text

lines = content.split('\n')
output = []

for i, line in enumerate(lines):
    stripped = line.strip()

    # Model declaration
    m = re.match(r'^(\s*)model (\w+) \{', line)
    if m:
        indent = m.group(1)
        old_name = m.group(2)
        new_name = model_info[old_name]['new_name']
        output.append(f'{indent}model {new_name} {{')
        continue

    # Skip @@map lines entirely (model name now matches table name = redundant @@map)
    if stripped.startswith('@@map('):
        continue

    output.append(line)

result = '\n'.join(output)

# Now update all type references in field definitions and attributes
result = replace_type_refs(result, model_info)

SCHEMA_PATH.write_text(result)
print(f'Written: {SCHEMA_PATH}')
print('Run: npx prisma generate')
