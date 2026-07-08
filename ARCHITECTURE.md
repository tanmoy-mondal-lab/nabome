# NABOME Architecture Documentation

## System Overview

NABOME is a premium fashion e-commerce platform built as a modern headless commerce solution with a serverless architecture.

## High-Level Architecture

```
┌─────────────────┐
│   Client (React) │
│   Vite + SPA     │
└────────┬────────┘
         │ HTTP/HTTPS
         ↓
┌─────────────────┐
│ Cloudflare Pages │
│   Static Assets  │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Cloudflare Workers│
│   API Gateway    │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  PostgreSQL DB   │
│   (Supabase)     │
└─────────────────┘
```

## Module Architecture

### Frontend Layer

**Technology Stack:**
- React 18 with TypeScript
- Vite for build tooling
- TailwindCSS for styling
- React Router for navigation

**Key Modules:**
- `src/storefront/` - Customer-facing pages
- `src/admin/` - Admin dashboard
- `src/components/` - Shared UI components
- `src/lib/` - Frontend utilities and API client

### API Layer

**Technology Stack:**
- Cloudflare Workers (serverless)
- Prisma ORM for database access
- Supabase Auth for authentication
- Razorpay for payments

**Key Modules:**
- `api/_handlers/` - API route handlers
- `api/_lib/` - Shared utilities (auth, prisma, response)
- `api/[[path]].ts` - Catch-all router

### Database Layer

**Technology Stack:**
- PostgreSQL 14+
- Prisma ORM
- Supabase hosting

**Key Models:**
- Auth: Profile, AuthSession, LoginAttempt
- Products: Product, ProductVariant, ProductImage, Category, Brand
- Orders: Order, OrderItem, OrderStatusHistory
- Cart: Cart, CartItem
- Marketing: Coupon, Campaign, AnnouncementBar
- CMS: HomepageSection, NavigationMenu, StaticPage
- Support: SupportTicket, SupportTicketReply, FAQ

## Data Flow

### Authentication Flow

```
1. User registers/logs in via Supabase Auth
2. Supabase returns JWT access token
3. Client stores token in localStorage
4. Client includes token in Authorization header
5. API validates token via middleware
6. Request proceeds to handler
```

### Order Flow

```
1. User adds items to cart (server-side or localStorage)
2. User proceeds to checkout
3. API validates stock and calculates totals
4. API creates Razorpay order
5. User completes payment
6. Webhook confirms payment
7. API creates order and updates inventory
8. Notification sent to user
```

### Product Catalog Flow

```
1. Admin creates product with variants
2. Images uploaded to Cloudinary
3. Product saved to database
4. Product indexed for search
5. Customer views product listing
6. API fetches with filters/pagination
7. Customer views product details
8. Reviews and ratings displayed
```

## API Architecture

### Request Handling

```
Request → Cloudflare Workers → [[path]].ts → Handler → Prisma → Database
                                      ↓
                                   Response
```

### Authentication Middleware

```typescript
authenticate(req, options, env) → Validate JWT → Set userId → Proceed
```

### Error Handling

```typescript
try {
  // Handler logic
} catch (error) {
  return serverError(error); // Standardized error response
}
```

## Database Schema Design

### Key Relationships

- Profile → Orders (1:N)
- Profile → Cart (1:1)
- Product → ProductVariants (1:N)
- Product → ProductImages (1:N)
- Order → OrderItems (1:N)
- Order → OrderStatusHistory (1:N)
- Category → Products (1:N)

### Indexing Strategy

- Foreign keys indexed
- Composite indexes for common query patterns
- Status + createdAt indexes for filtering
- UUID primary keys for distributed systems

## Security Architecture

### Authentication
- Supabase Auth for user management
- JWT tokens with expiration
- Refresh token rotation
- Email verification required

### Authorization
- Role-based access control (customer/admin)
- Middleware checks on protected routes
- Resource ownership validation

### Data Protection
- Environment variables for secrets
- Encrypted database connections
- API key rotation support
- Webhook signature verification

## Performance Optimization

### Database
- Query optimization with selective includes
- Composite indexes for common patterns
- N+1 query prevention
- Connection pooling

### API
- Response caching (planned)
- Query result caching (planned)
- Request timeout configuration
- Batch operations

### Frontend
- Code splitting with React.lazy
- Image optimization
- Lazy loading components
- Memoization with useMemo/React.memo

## Deployment Architecture

### Frontend
- Cloudflare Pages for static hosting
- Automatic deployments from Git
- Edge caching for assets
- CDN distribution

### Backend
- Cloudflare Workers for serverless API
- Global edge deployment
- Automatic scaling
- Durable Objects for state (if needed)

### Database
- Supabase managed PostgreSQL
- Automatic backups
- Read replicas (if needed)
- Connection pooling

## Monitoring & Observability

### Logging
- Structured logging
- Error tracking (planned)
- Audit trail for user actions
- Webhook event logging

### Analytics
- Event tracking (AnalyticsEvent model)
- User behavior tracking
- Order analytics
- Performance metrics

### Monitoring (Planned)
- Uptime monitoring
- Synthetic monitoring
- Real user monitoring (RUM)
- API usage metrics

## Scalability Considerations

### Horizontal Scaling
- Serverless architecture auto-scales
- Database read replicas for read-heavy workloads
- CDN for static assets
- Edge computing for API

### Vertical Scaling
- Database connection pooling
- Query optimization
- Caching strategies
- Resource limits per worker

## Integration Points

### External Services
- **Supabase**: Auth, Database, Storage
- **Razorpay**: Payment processing
- **Cloudinary**: Image management
- **Cloudflare**: Hosting, Workers, CDN

### Webhooks
- Razorpay payment events
- Order status changes
- Inventory alerts
- Notification triggers

## Development Workflow

### Local Development
- Vite dev server for frontend
- Wrangler for local Workers simulation
- PostgreSQL for local database
- Environment variable management

### Testing
- Unit tests with Vitest
- E2E tests with Playwright
- API testing with integration tests
- Database seeding for test data

### CI/CD
- GitHub Actions for automation
- Automated testing on PR
- Deployment to staging environment
- Manual approval for production

## Technology Decisions

### Why Cloudflare Workers?
- Serverless, pay-per-use
- Global edge deployment
- Fast cold starts
- Built-in DDoS protection

### Why Supabase?
- PostgreSQL with extensions
- Built-in authentication
- Real-time subscriptions
- Easy management UI

### Why Prisma?
- Type-safe database access
- Migration management
- Query optimization
- Great TypeScript support

### Why React + Vite?
- Fast development experience
- Large ecosystem
- Server-side rendering ready
- Modern build tooling

## Future Architecture Improvements

### Short-term
- Implement API response caching
- Add database query caching
- Configure request timeouts
- Add API deprecation strategy

### Medium-term
- Implement real-time features
- Add search optimization
- Implement advanced analytics
- Add A/B testing framework

### Long-term
- Microservices for specific modules
- Event-driven architecture
- GraphQL API layer
- Multi-region deployment

## Documentation References

- [API Documentation](./docs/API_DOCUMENTATION.md)
- [Onboarding Guide](./ONBOARDING.md)
- [Database Schema](./prisma/schema.prisma)
- [Audit Reports](./NABOME_COMPLETE_AUDIT_REPORT.md)
