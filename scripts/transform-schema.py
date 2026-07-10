"""
Transform Prisma schema to use camelCase models/fields with @map/@@map annotations.
Keeps database schema unchanged while exposing camelCase in Prisma Client.
"""

import re
from pathlib import Path

SCHEMA_PATH = '/Users/tanmoymondal/nabome/prisma/schema.prisma'
BACKUP_PATH = '/Users/tanmoymondal/nabome/prisma/schema.prisma.bak'

def snake_to_pascal(name):
    return ''.join(word.capitalize() for word in name.split('_'))

def snake_to_camel(name):
    parts = name.split('_')
    return parts[0] + ''.join(p.capitalize() for p in parts[1:])

def main():
    content = Path(SCHEMA_PATH).read_text()
    Path(BACKUP_PATH).write_text(content)
    print(f'Backup: {BACKUP_PATH}')

    # Build field renames: snake_case -> camelCase (only for fields with underscores)
    field_renames = {}
    current_model = None
    for line in content.split('\n'):
        m = re.match(r'^model (\w+) \{', line)
        if m:
            current_model = m.group(1)
        elif current_model and re.match(r'^\s{2}(\w+)\s', line):
            f = re.match(r'^\s{2}(\w+)', line).group(1)
            if '_' in f and f == f.lower() and not f.startswith('@@'):
                field_renames[f] = snake_to_camel(f)
        elif line.strip() == '}':
            current_model = None
    print(f'Field renames: {len(field_renames)}')

    # Build model renames: snake_case -> PascalCase
    model_renames = {}
    for m in re.finditer(r'^model (\w+)', content, re.MULTILINE):
        old = m.group(1)
        model_renames[old] = snake_to_pascal(old)

    def replace_field_names(text):
        """Replace all snake_case field names with camelCase inside [brackets]."""
        def replace_bracket_content(m):
            inner = m.group(1)
            parts = [field_renames.get(p.strip(), p.strip()) for p in inner.split(',')]
            return f'[{", ".join(parts)}]'
        return re.sub(r'\[([^\]]+)\]', replace_bracket_content, text)

    lines = content.split('\n')
    output = []
    current_model = None

    for line in lines:
        stripped = line.strip()

        # Model declaration
        m = re.match(r'^(\s*)model (\w+) \{', line)
        if m:
            indent = m.group(1)
            old_model = m.group(2)
            new_model = model_renames.get(old_model, old_model)
            output.append(f'{indent}model {new_model} {{')
            output.append(f'  @@map("{old_model}")')
            current_model = old_model
            continue

        # End of model
        if stripped == '}':
            output.append(line)
            current_model = None
            continue

        # Outside any model - pass through
        if current_model is None:
            output.append(line)
            continue

        # @@index, @@unique, @@map directives - update field references in brackets
        if stripped.startswith('@@') and not stripped.startswith('@@map'):
            line = replace_field_names(line)
            output.append(line)
            continue

        # Empty lines, comments - pass through
        if not stripped or stripped.startswith('//'):
            output.append(line)
            continue

        # Field definition:   field_name Type @attr1 @attr2
        m = re.match(r'^(\s{2})(\w+)(\s+\S.*)', line)
        if not m:
            # Try alternative: field at end of line (no type after)
            m = re.match(r'^(\s{2})(\w+)(\s*)$', line)
            if not m:
                output.append(line)
                continue

        indent = m.group(1)
        field_name = m.group(2)
        rest = m.group(3) if len(m.groups()) >= 3 else ''

        # Update relation field types and references
        for old, new in sorted(model_renames.items(), key=lambda x: -len(x[0])):
            rest = re.sub(r'\b' + re.escape(old) + r'\b', new, rest)

        # Update fields: [...] and references: [...] inside relations
        rest = re.sub(r'fields:\s*\[([^\]]+)\]',
                       lambda m: f'fields: [{", ".join(field_renames.get(p.strip(), p.strip()) for p in m.group(1).split(","))}]',
                       rest)
        rest = re.sub(r'references:\s*\[([^\]]+)\]',
                       lambda m: f'references: [{", ".join(field_renames.get(p.strip(), p.strip()) for p in m.group(1).split(","))}]',
                       rest)

        # Rename the field and add @map (skip for virtual relation fields)
        new_field = field_renames.get(field_name, field_name)
        # Detect relation field: has @relation attribute, OR type is a known model name
        field_type = rest.strip().split()[0] if rest.strip() else ''
        base_type = field_type.rstrip('[]?')
        is_relation = '@relation' in rest or base_type in model_renames.values()
        if field_name in field_renames and not is_relation and '@map' not in rest:
            if '@' in rest:
                idx = rest.index('@')
                rest = rest[:idx] + f'@map("{field_name}") ' + rest[idx:]
            else:
                rest = rest.rstrip() + f' @map("{field_name}")'
        output.append(f'{indent}{new_field}{rest}')

    result = '\n'.join(output)
    Path(SCHEMA_PATH).write_text(result)
    print(f'Written: {SCHEMA_PATH}')
    print('Run: npx prisma generate')

if __name__ == '__main__':
    main()
