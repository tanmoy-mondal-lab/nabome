# NABOME Developer Onboarding Guide

## Welcome to NABOME

NABOME is a premium fashion e-commerce platform built with modern web technologies. This guide will help you get started with development.

## Prerequisites

- Node.js 18+ 
- pnpm 8+
- PostgreSQL 14+ (or Supabase account)
- Cloudflare account (for deployment)
- Git

## Tech Stack

### Frontend
- **Framework**: React 18 + Vite
- **Styling**: TailwindCSS
- **State**: React Context + Hooks
- **Routing**: React Router
- **UI Components**: Custom components with shadcn/ui patterns

### Backend
- **Runtime**: Cloudflare Workers
- **Database**: PostgreSQL via Prisma ORM
- **Authentication**: Supabase Auth + JWT
- **Payments**: Razorpay
- **File Storage**: Cloudinary

### Development Tools
- **TypeScript**: Strict mode enabled
- **Testing**: Vitest + Playwright
- **Linting**: ESLint + Prettier
- **CI/CD**: GitHub Actions

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/nabome/nabome.git
cd nabome
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Environment Setup

Copy the example environment file:

```bash
cp .env.example .env
```

Fill in the required environment variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/nabome"

# Supabase
SUPABASE_URL="your-supabase-url"
SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Cloudflare
CLOUDFLARE_ACCOUNT_ID="your-account-id"
CLOUDFLARE_API_TOKEN="your-api-token"

# Razorpay
RAZORPAY_KEY_ID="your-key-id"
RAZORPAY_KEY_SECRET="your-key-secret"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

### 4. Database Setup

Generate Prisma client:

```bash
pnpm prisma generate
```

Run migrations:

```bash
pnpm prisma migrate dev
```

Seed the database:

```bash
pnpm prisma db seed
```

### 5. Start Development Servers

**Frontend (Vite):**
```bash
pnpm dev
```
Runs on `http://localhost:5173`

**Backend (Cloudflare Workers):**
```bash
pnpm wrangler dev
```
Runs on `http://localhost:8787`

**API Dev Server:**
```bash
pnpm run api-dev-server
```
Runs on `http://localhost:3001`

## Project Structure

```
nabome/
├── api/                 # Cloudflare Workers API
│   ├── _handlers/      # API route handlers
│   ├── _lib/          # API utilities (auth, prisma, etc.)
│   └── [[path]].ts     # Catch-all route
├── src/               # Frontend React application
│   ├── admin/         # Admin dashboard
│   ├── app/           # Main app components
│   ├── components/    # Reusable UI components
│   ├── lib/           # Frontend utilities
│   └── storefront/    # Customer-facing pages
├── prisma/            # Database schema and migrations
├── public/            # Static assets
├── docs/              # Documentation
└── e2e/              # End-to-end tests
```

## Key Modules

### Authentication
- Supabase Auth for user management
- JWT tokens for API authentication
- Role-based access control (customer/admin)
- Email verification flow

### Products
- Product catalog with variants (size, color)
- Category and brand organization
- Collection management
- Inventory tracking

### Orders
- Order lifecycle management
- Payment integration with Razorpay
- Order status tracking
- Refund processing

### Cart & Checkout
- Server-side cart with guest support
- Address management
- Coupon/discount system
- Tax and shipping calculation

## Common Tasks

### Adding a New API Endpoint

1. Create handler in `api/_handlers/`:
```typescript
// api/_handlers/example.ts
import { success } from "../_lib/response";

export async function handleExample(req: Request, ctx: RequestContext) {
  return success({ message: "Hello" });
}
```

2. Register in `api/[[path]].ts`:
```typescript
if (path === "example") {
  return handleExample(req, ctx);
}
```

### Adding Database Fields

1. Update `prisma/schema.prisma`
2. Create migration: `pnpm prisma migrate dev --name add_field`
3. Update TypeScript types

### Creating a New Component

1. Create in `src/components/` or appropriate subdirectory
2. Follow existing component patterns
3. Use TailwindCSS for styling
4. Add TypeScript props interface

### Running Tests

**Unit Tests:**
```bash
pnpm test
```

**E2E Tests:**
```bash
pnpm playwright test
```

## Development Workflow

1. Create a feature branch from `main`
2. Make changes with clear commit messages
3. Run tests locally
4. Submit pull request with description
5. Code review and approval
6. Merge to main

## Code Style

- Use TypeScript strict mode
- Follow existing naming conventions
- Add JSDoc comments for public functions
- Keep functions focused and small
- Use descriptive variable names

## Troubleshooting

### Database Connection Issues
- Check DATABASE_URL in .env
- Ensure PostgreSQL is running
- Verify Prisma client is generated

### Build Errors
- Clear node_modules: `rm -rf node_modules && pnpm install`
- Clear cache: `pnpm clean`
- Check TypeScript errors

### API Not Responding
- Verify wrangler is running
- Check environment variables
- Review Cloudflare Workers logs

## Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [React Documentation](https://react.dev)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [Razorpay API Docs](https://razorpay.com/docs/api)

## Getting Help

- Check existing documentation in `docs/`
- Review audit reports for known issues
- Ask in team Slack channel
- Create GitHub issue for bugs

## Next Steps

1. Complete the setup above
2. Read the architecture documentation
3. Review the code quality standards
4. Start with a small bug fix or feature
5. Join the team standup to introduce yourself

Happy coding! 🚀
