# NABOME Seed System Documentation

## Overview

The NABOME seed system is a production-grade, modular architecture for database seeding. It provides a scalable, maintainable foundation for populating development, testing, and staging databases with realistic data.

## Architecture

### Directory Structure

```
prisma/seed-new/
├── config/              # Configuration system
│   ├── types.ts        # TypeScript types
│   ├── presets.ts      # Dataset presets (dev, small, large, etc.)
│   ├── dependencies.ts # Dependency graph and execution order
│   ├── environment.ts  # Environment verification
│   └── index.ts        # Configuration loader
├── utils/              # Shared utilities
│   ├── slug.ts         # Slug generation
│   ├── random.ts       # Random selection
│   ├── date.ts         # Date generation
│   ├── id.ts           # ID generation (UUID, ULID)
│   ├── crypto.ts       # Password hashing, tokens
│   ├── logger.ts       # Logging system
│   ├── batching.ts     # Batch processing
│   ├── retry.ts        # Retry logic
│   └── index.ts
├── constants/          # Centralized constants
│   └── index.ts        # Counts, limits, defaults
├── shared/             # Shared types and registry
│   ├── types.ts        # Seed module types
│   ├── registry.ts     # Module registry
│   ├── media-hooks.ts  # Media service integration
│   ├── module-template.ts # Template for new modules
│   └── index.ts
├── orchestrator.ts     # Master seed runner
├── index.ts            # Entry point
└── [modules]/          # Individual seed modules
    ├── settings/
    ├── users/
    ├── products/
    └── ...
```

## Key Features

### 1. Modular Architecture

Each entity has its own seed module that:
- Owns its seeding logic
- Declares dependencies
- Can be enabled/disabled independently
- Follows a consistent interface

### 2. Dependency Management

The system automatically resolves dependencies and executes modules in the correct order:

```
Settings → Roles → Permissions → Users → Brands → Categories → Products → ...
```

### 3. Configuration Presets

Built-in presets for different use cases:

- **development**: Balanced dataset for local development
- **small**: Minimal dataset for quick testing
- **large**: Comprehensive dataset for realistic testing
- **performance**: Large dataset for performance testing
- **stress**: Maximum dataset for stress testing

### 4. Environment Safety

- Blocks seeding in production by default
- Requires explicit `SEED_FORCE=true` to override
- Verifies environment before execution

### 5. Transaction Support

- Optional transactional execution
- Rollback on failure
- Configurable per module

### 6. Media Integration

- Hooks for centralized MediaService
- No hardcoded Cloudinary URLs
- Mock service for development
- Ready for production media uploads

### 7. Comprehensive Logging

- Module-level timing
- Success/failure tracking
- Detailed error messages
- Summary statistics

## Usage

### Basic Usage

```bash
# Run seed with default (development) preset
npm run db:seed

# Run with specific preset
SEED_PRESET=small npm run db:seed
SEED_PRESET=large npm run db:seed

# Run with custom options
SEED_CLEAR_BEFORE_SEED=false npm run db:seed
SEED_USE_TRANSACTIONS=false npm run db:seed
SEED_VERBOSE=true npm run db:seed
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SEED_PRESET` | Dataset preset | `development` |
| `SEED_CLEAR_BEFORE_SEED` | Clear database before seeding | `true` |
| `SEED_USE_TRANSACTIONS` | Use transactions | `true` |
| `SEED_STOP_ON_ERROR` | Stop on first error | `true` |
| `SEED_UPLOAD_MEDIA` | Upload media to Cloudinary | `false` |
| `SEED_USE_LOCAL_MEDIA` | Use local media files | `false` |
| `SEED_VERBOSE` | Verbose logging | `false` |
| `SEED_LOG_SQL` | Log SQL queries | `false` |
| `SEED_BATCH_SIZE` | Batch size for bulk operations | `100` |
| `SEED_CONCURRENCY` | Concurrency limit | `10` |
| `SEED_VALIDATE_DATA` | Validate seeded data | `true` |
| `SEED_FORCE` | Force seeding in production | `false` |

## Adding a New Seed Module

### Step 1: Create Module Directory

```bash
mkdir -p prisma/seed-new/your-module
```

### Step 2: Create Module File

```typescript
// prisma/seed-new/your-module/index.ts
import type { SeedModule, SeedContext, SeedResult } from '../shared/types';
import { registry } from '../shared/registry';
import { getCount } from '../config';
import { generateSlug } from '../utils';

export const yourModuleModule: SeedModule = {
  name: 'your-module',
  dependsOn: ['settings'], // List dependencies
  idempotent: true,
  transactional: true,
  
  async seed(context: SeedContext): Promise<SeedResult> {
    const startTime = Date.now();
    let count = 0;

    try {
      const countToCreate = getCount(context.config, 'YOUR_MODULE_COUNT');
      
      // Your seeding logic here
      for (let i = 0; i < countToCreate; i++) {
        await context.prisma.yourModel.create({
          data: {
            name: `Example ${i}`,
            slug: generateSlug(`Example ${i}`),
            // ... other fields
          },
        });
        count++;
      }

      return {
        success: true,
        count,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      return {
        success: false,
        count,
        duration: Date.now() - startTime,
        error: error as Error,
      };
    }
  },
};

// Register the module
registry.register(yourModuleModule);
```

### Step 3: Add to Dependency Graph

Edit `prisma/seed-new/config/dependencies.ts`:

```typescript
export const SEED_DEPENDENCY_GRAPH: ModuleMetadata[] = [
  // ... existing modules
  { name: 'your-module', dependsOn: ['settings'], enabled: true },
];
```

### Step 4: Add to Constants

Edit `prisma/seed-new/constants/index.ts`:

```typescript
export const SEED_COUNTS = {
  // ... existing counts
  YOUR_MODULE_COUNT: 10,
};
```

### Step 5: Import in Entry Point

Edit `prisma/seed-new/index.ts`:

```typescript
import './your-module';
```

## Dependency Order

The system uses topological sorting to determine execution order. Current order:

1. **Foundation**: Settings, Roles, Permissions
2. **Users**: Users, Sellers, Customers
3. **Taxonomy**: Brands, Categories, Collections, Labels, Sizes, Colors, Materials
4. **Products**: Products, Inventory
5. **Media**: Media (depends on products, brands, categories)
6. **Homepage**: Homepage, Hero
7. **CMS**: CMS, FAQ, Announcements, Blogs, Lookbooks
8. **Orders**: Addresses, Wishlist, Cart, Coupons, Orders, Payments, Shipping, Returns
9. **Reviews**: Reviews
10. **Support**: Notifications, Support
11. **Meta**: SEO, Search, Analytics, Verification

## Utilities

### Slug Generation

```typescript
import { generateSlug, generateUniqueSlug } from '../utils';

const slug = generateSlug('Product Name'); // 'product-name'
const uniqueSlug = generateUniqueSlug('product-name', existingSlugs);
```

### Random Selection

```typescript
import { randomItem, randomItems, randomInt } from '../utils';

const item = randomItem(array);
const items = randomItems(array, 5);
const number = randomInt(1, 100);
```

### Date Generation

```typescript
import { randomPastDate, randomFutureDate, recentDate } from '../utils';

const past = randomPastDate(365);
const future = randomFutureDate(30);
const recent = recentDate(7);
```

### ID Generation

```typescript
import { generateUUID, generateULID, generateSKU } from '../utils';

const uuid = generateUUID();
const ulid = generateULID();
const sku = generateSKU('PROD', { size: 'M', color: 'RED' });
```

### Password Hashing

```typescript
import { hashPassword, generateToken } from '../utils';

const hashed = hashPassword('password123');
const token = generateToken(32);
```

### Logging

```typescript
import { logger } from '../utils';

logger.info('Information message');
logger.success('Success message');
logger.warning('Warning message');
logger.error('Error message');
logger.debug('Debug message');
```

### Media Upload

```typescript
import { uploadSeedMedia } from '../shared/media-hooks';

const result = await uploadSeedMedia(prisma, {
  entityType: 'products',
  entityId: product.id,
  file: imageBuffer,
  filename: 'product.jpg',
  mimeType: 'image/jpeg',
  isPrimary: true,
  altText: 'Product image',
});
```

## Best Practices

### 1. Idempotency

Make your modules idempotent - they should be safe to run multiple times:

```typescript
// Use upsert instead of create
await prisma.model.upsert({
  where: { slug },
  update: {},
  create: data,
});
```

### 2. Batch Operations

Use batch processing for large datasets:

```typescript
import { chunkForDatabase } from '../utils';

const chunks = chunkForDatabase(items, 100);
for (const chunk of chunks) {
  await prisma.model.createMany({ data: chunk });
}
```

### 3. Error Handling

Always handle errors and return proper results:

```typescript
try {
  // seeding logic
  return { success: true, count, duration };
} catch (error) {
  return { success: false, count, duration, error };
}
```

### 4. Dependencies

Only declare actual dependencies - the system will handle the rest:

```typescript
// If your module needs products, declare it
dependsOn: ['products']

// Don't declare transitive dependencies
// Don't do: dependsOn: ['products', 'brands', 'categories']
```

### 5. Configuration

Use configuration instead of hardcoding values:

```typescript
const count = getCount(context.config, 'YOUR_MODULE_COUNT');
const limit = getLimit(context.config, 'MAX_PRICE');
```

## Troubleshooting

### Module Not Found

If you see "Module 'xyz' not found in registry":
- Ensure the module is imported in `index.ts`
- Ensure the module calls `registry.register()`
- Check the module name matches the dependency graph

### Circular Dependency

If you see "Circular dependency detected":
- Check the dependency graph in `config/dependencies.ts`
- Ensure no module indirectly depends on itself
- Use the `validateDependencyGraph()` function to debug

### Environment Blocked

If seeding is blocked in production:
- Set `NODE_ENV=development` or `NODE_ENV=test`
- Or use `SEED_FORCE=true` (not recommended in production)

### Transaction Errors

If transactions fail:
- Try disabling transactions: `SEED_USE_TRANSACTIONS=false`
- Check for foreign key violations
- Ensure dependencies are seeded first

## Migration from Old Seed System

The old seed system (`prisma/seed.ts`) is still available via:

```bash
npm run db:seed:legacy
```

To migrate a module:
1. Create a new module following the template
2. Copy logic from the old seed file
3. Update to use the new utilities and context
4. Add to dependency graph
5. Test with the new system

## Performance Tips

### For Large Datasets

- Use the `performance` or `stress` presets
- Disable transactions: `SEED_USE_TRANSACTIONS=false`
- Increase batch size: `SEED_BATCH_SIZE=500`
- Increase concurrency: `SEED_CONCURRENCY=20`
- Disable validation: `SEED_VALIDATE_DATA=false`

### For Quick Testing

- Use the `small` preset
- Enable transactions for rollback capability
- Keep batch size moderate (50-100)

## Testing

To test individual modules:

```typescript
import { registry } from './shared/registry';
import { SeedOrchestrator } from './orchestrator';

const orchestrator = new SeedOrchestrator();
const module = registry.get('your-module');

// Test single module
await orchestrator.executeModule('your-module');
```

## Support

For issues or questions:
1. Check this documentation
2. Review the module template
3. Examine existing modules
4. Check logs for error details
