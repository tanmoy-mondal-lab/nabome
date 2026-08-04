# Search Engine Architecture Standard

**Nabome (নবME) Commerce Operating System**

Version: 1.0  
Status: Official Standard  
Supersedes: UX_ARCHITECTURE.md §7, CATALOG_ARCHITECTURE.md §6-7

---

## Table of Contents

1. [Search Foundation](#1-search-foundation)
2. [Search Experience](#2-search-experience)
3. [Product Discovery](#3-product-discovery)
4. [Filter Engine](#4-filter-engine)
5. [Sorting Engine](#5-sorting-engine)
6. [Recommendation Engine](#6-recommendation-engine)
7. [Search Index](#7-search-index)
8. [Performance](#8-performance)
9. [UX Standards](#9-ux-standards)
10. [Security](#10-security)
11. [Accessibility](#11-accessibility)
12. [Future Readiness](#12-future-readiness)
13. [Mandatory Rules for AI Agents](#13-mandatory-rules-for-ai-agents)

**Appendices**

- [Appendix A: API Reference](#appendix-a-api-reference)
- [Appendix B: Index Configuration](#appendix-b-index-configuration)
- [Appendix C: Recommendation Configuration](#appendix-c-recommendation-configuration)
- [Appendix D: Implementation Checklist](#appendix-d-implementation-checklist)

---

## 1. Search Foundation

### 1.1 Architecture Principle

The Search Engine is an **independent, read-only service** that operates on a dedicated search index. It **never** reads from product engine tables at query time. This decoupling ensures:

- Independent scaling of search and product operations
- Optimization of search-specific queries without affecting product engine
- Future migration to dedicated search infrastructure (Meilisearch, Typesense) without product engine changes
- Edge caching via Cloudflare KV without cache invalidation complexity

### 1.2 Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Search Backend (MVP) | PostgreSQL `pg_trgm` | Fuzzy matching, trigram similarity |
| Search Backend (Scale) | Meilisearch / Typesense | Advanced full-text search, faceting |
| Index Storage | PostgreSQL `search_documents` table | Read-optimized search index |
| Edge Cache | Cloudflare KV | Sub-50ms response for common queries |
| Query API | Hono RPC | Type-safe search endpoints |

### 1.3 Search Index Structure

The search index is a **read-only materialized view** maintained asynchronously by the Product Engine.

```
┌─────────────────────────────────────────────────────────┐
│                    SEARCH INDEX                         │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │           search_documents (table)               │   │
│  │                                                   │   │
│  │  id, product_id, name, description, category,    │   │
│  │  tags, attributes, price, rating, popularity,    │   │
│  │  search_vector, updated_at                       │   │
│  └─────────────────────────────────────────────────┘   │
│                         ▲                               │
│                         │ async update                  │
│                         │                               │
│  ┌─────────────────────────────────────────────────┐   │
│  │        Product Engine (write side)                │   │
│  └─────────────────────────────────────────────────┘   │
│                         │                               │
│                         ▼                               │
│  ┌─────────────────────────────────────────────────┐   │
│  │        Search Service (read side)                 │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### 1.4 Index Update Mechanism

| Trigger | Latency Target | Method |
|---------|---------------|--------|
| Product create/update | < 2 seconds | Async queue (BullMQ/Cloudflare Queues) |
| Product delete | < 2 seconds | Async queue |
| Bulk import | < 30 seconds | Batch processing |
| Full rebuild | < 10 minutes | Background job |

---

## 2. Search Experience

### 2.1 Search Entry Points

| Entry Point | Trigger | Minimum Characters | Debounce |
|-------------|---------|-------------------|----------|
| Header search bar | Focus | 0 (show recent) | 300ms |
| Autocomplete | Type | 2 | 300ms |
| Full search | Enter / button | 0 | None |
| Voice search | Tap mic | N/A | N/A |
| Camera search | Tap camera | N/A | N/A |

### 2.2 Autocomplete Behavior

```
User types → 300ms debounce → Search API → Results in < 100ms

Autocomplete Results:
┌─────────────────────────────────────────┐
│ 🔍 "wirel"                              │
├─────────────────────────────────────────┤
│ Suggestions                             │
│   wireless earbuds                      │
│   wireless mouse                        │
│   wireless keyboard                     │
├─────────────────────────────────────────┤
│ Products (max 5)                        │
│   [img] Wireless Earbuds Pro    ৳1,299 │
│   [img] Wireless Mouse X1       ৳899  │
├─────────────────────────────────────────┤
│ Categories                              │
│   Electronics > Wireless                │
└─────────────────────────────────────────┘
```

### 2.3 Search Results Page

```
Search Results Layout:
┌─────────────────────────────────────────────────────────┐
│ "wireless earbuds" (142 results)         Sort: [Relevance ▼] │
├─────────────┬───────────────────────────────────────────┤
│ Filters     │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐       │
│             │  │     │ │     │ │     │ │     │       │
│ Category    │  │ P1  │ │ P2  │ │ P3  │ │ P4  │       │
│ ☐ Earbuds   │  │     │ │     │ │     │ │     │       │
│ ☐ Headphones│  └─────┘ └─────┘ └─────┘ └─────┘       │
│             │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐       │
│ Price       │  │     │ │     │ │     │ │     │       │
│ ○ Under ৳1k │  │ P5  │ │ P6  │ │ P7  │ │ P8  │       │
│ ○ ৳1k-৳5k  │  │     │ │     │ │     │ │     │       │
│ ○ Over ৳5k  │  └─────┘ └─────┘ └─────┘ └─────┘       │
│             │                                          │
│ Rating      │  ← 1  2  3  4  5 →                      │
│ ☐ 4★ & up   │                                          │
└─────────────┴───────────────────────────────────────────┘
```

### 2.4 Zero Results Handling

When no results found:

```
┌─────────────────────────────────────────┐
│    No results found for "xyzabc"        │
│                                         │
│    Suggestions:                         │
│    • Check your spelling                │
│    • Try more general keywords          │
│    • Browse categories                  │
│                                         │
│    Popular in this category:            │
│    [Product cards...]                   │
└─────────────────────────────────────────┘
```

---

## 3. Product Discovery

### 3.1 Discovery Channels

| Channel | Purpose | Algorithm |
|---------|---------|-----------|
| Search | Intent-driven | Relevance + business rules |
| Browse | Category navigation | Manual priority + popularity |
| Recommendations | Serendipitous discovery | Collaborative + content-based |
| Collections | Curated sets | Manual curation |
| Trending | Real-time popularity | Velocity-based ranking |
| New Arrivals | Freshness | Recency-based |

### 3.2 Discovery Priorities

1. **Search Results** — Highest priority (user intent)
2. **Category Products** — High priority (user navigation)
3. **Recommendations** — Medium priority (personalization)
4. **Trending** — Medium priority (social proof)
5. **New Arrivals** — Lower priority (freshness)

### 3.3 Product Boosting Rules

| Rule | Boost Factor | Condition |
|------|-------------|-----------|
| In Stock | 1.0x | product.stock > 0 |
| Low Stock | 1.2x | product.stock < 10 |
| New Arrival | 1.3x | product.created_at > 7 days ago |
| Best Seller | 1.5x | orders_30d > 100 |
| High Rating | 1.2x | product.rating >= 4.5 |
| Promoted | 1.4x | product.is_promoted = true |
| Fast Shipping | 1.1x | product.shipping_time <= 2 days |

---

## 4. Filter Engine

### 4.1 Filter Logic

**Within a filter group:** OR logic  
**Between filter groups:** AND logic

```
Example:
Category: [Electronics, Clothing]  ← OR (show Electronics OR Clothing)
Price: [৳500-৳1000]               ← AND (AND price in this range)
Rating: [4★ & up]                 ← AND (AND rating 4+)

Result: (Electronics OR Clothing) AND (৳500-৳1000) AND (4★+)
```

### 4.2 Dynamic Filter Types

| Filter Type | Source | UI Component |
|-------------|--------|--------------|
| Category | Category tree | Multi-select with hierarchy |
| Price | Product price | Range slider / input fields |
| Brand | Attribute (brand) | Checkbox list |
| Rating | Product rating | Star selector |
| Availability | Stock status | Toggle |
| Attribute | Dynamic from product attributes | Context-specific |

### 4.3 Filter Configuration Structure

```json
{
  "filters": [
    {
      "id": "category",
      "type": "hierarchy",
      "source": "category_tree",
      "display": "tree",
      "multiSelect": true
    },
    {
      "id": "price",
      "type": "range",
      "source": "product.price",
      "display": "slider",
      "currency": "BDT"
    },
    {
      "id": "brand",
      "type": "attribute",
      "source": "attributes.brand",
      "display": "checkbox",
      "multiSelect": true
    },
    {
      "id": "rating",
      "type": "rating",
      "source": "product.rating",
      "display": "stars",
      "minRating": 1
    }
  ]
}
```

### 4.4 Filter Performance

| Metric | Target | Strategy |
|--------|--------|----------|
| Filter computation | < 20ms | Pre-computed facet counts |
| Filter UI render | < 50ms | Memoized components |
| Filter state sync | < 100ms | URL params, optimistic updates |
| Mobile filter drawer | < 200ms | Slide animation, lazy load |

### 4.5 Faceted Search

Facet counts update dynamically based on current filters:

```
Current filters: Category=Electronics
                 ↓
Facet counts:
├── Category
│   ├── Electronics (142)     ← only shows Electronics count
│   ├── Clothing (0)          ← hidden or greyed
│   └── Home (0)              ← hidden or greyed
├── Brand
│   ├── Samsung (45)
│   ├── Apple (32)
│   └── Xiaomi (28)
└── Price
    ├── Under ৳1k (22)
    ├── ৳1k-৳5k (89)
    └── Over ৳5k (31)
```

---

## 5. Sorting Engine

### 5.1 Default Sort Behavior

| Context | Default Sort | Rationale |
|---------|-------------|-----------|
| Search results | Relevance | User intent-driven |
| Category browse | Featured | Business control |
| Collection browse | Manual order | Curated experience |
| Vendor shop | Featured | Business control |

### 5.2 Sort Options

| Sort Option | Field | Direction | Use Case |
|-------------|-------|-----------|----------|
| Featured | Manual priority | DESC | Browse, merchandising |
| Relevance | Search score | DESC | Search results |
| Newest | created_at | DESC | New arrivals |
| Price: Low to High | price | ASC | Budget shopping |
| Price: High to Low | price | DESC | Premium shopping |
| Best Selling | sales_30d | DESC | Social proof |
| Rating | rating | DESC | Quality-focused |

### 5.3 Relevance Algorithm

```
Relevance Score = (Text Match × 0.4)
               + (Category Match × 0.2)
               + (Popularity × 0.2)
               + (Recency × 0.1)
               + (Business Boost × 0.1)

Text Match Components:
├── Exact name match: 1.0
├── Prefix match: 0.8
├── Contains match: 0.6
├── Fuzzy match: 0.4
└── Partial match: 0.2
```

### 5.4 Sort Performance

| Metric | Target | Strategy |
|--------|--------|----------|
| Sort computation | < 10ms | Pre-computed sort keys |
| Sort UI update | < 50ms | Client-side reordering (small sets) |
| Infinite scroll | < 200ms | Cursor-based pagination |

---

## 6. Recommendation Engine

### 6.1 Recommendation Types

| Type | Purpose | Data Source | Algorithm |
|------|---------|-------------|-----------|
| "Similar Products" | Alternative options | Product attributes | Content-based |
| "Frequently Bought Together" | Cross-sell | Order history | Association rules |
| "Customers Also Viewed" | Discovery | View history | Collaborative filtering |
| "Trending Now" | Social proof | Recent orders | Velocity-based |
| "Personalized For You" | Engagement | User behavior | Collaborative + content |
| "New Arrivals You'll Like" | Freshness | User preferences + new products | Content-based |

### 6.2 Recommendation Algorithm Progression

| Phase | Algorithm | Data Required | Complexity |
|-------|-----------|---------------|------------|
| MVP | Rule-based | Product attributes | Low |
| V2 | Association rules | Order history | Medium |
| V3 | Collaborative filtering | User interactions | High |
| V4 | AI embeddings | Semantic vectors | Very High |

### 6.3 Rule-Based Recommendations (MVP)

```json
{
  "similar_products": {
    "method": "attribute_match",
    "fields": ["category", "brand", "price_range"],
    "max_results": 6,
    "min_score": 0.5
  },
  "frequently_bought_together": {
    "method": "co_occurrence",
    "min_occurrences": 5,
    "max_results": 4
  },
  "trending": {
    "method": "velocity",
    "window": "7d",
    "min_orders": 10,
    "max_results": 8
  }
}
```

### 6.4 Recommendation Placement

| Placement | Type | Max Items | Refresh Rate |
|-----------|------|-----------|--------------|
| PDP - "Similar Products" | Similar | 6 | On load |
| PDP - "Bought Together" | Cross-sell | 4 | On load |
| Cart - "Complete Your Order" | Cross-sell | 3 | On cart change |
| Home - "Trending" | Trending | 8 | Every 5 min |
| Home - "For You" | Personalized | 8 | Every hour |
| Search - "Related" | Similar | 4 | On search |

### 6.5 Recommendation Performance

| Metric | Target | Strategy |
|--------|--------|----------|
| Recommendation load | < 100ms | Edge cache, pre-computation |
| Cold start | < 500ms | Fallback to popularity |
| Personalization | < 200ms | User profile cache |
| Real-time updates | < 5s | Event-driven invalidation |

---

## 7. Search Index

### 7.1 Index Schema

```sql
CREATE TABLE search_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  
  -- Searchable fields
  name TEXT NOT NULL,
  description TEXT,
  category_name TEXT,
  brand TEXT,
  tags TEXT[],
  
  -- Faceted fields
  price DECIMAL(12,2),
  rating DECIMAL(3,2),
  review_count INTEGER,
  stock_status TEXT,
  
  -- Boost fields
  popularity_score DECIMAL(10,2) DEFAULT 0,
  recency_score DECIMAL(10,2) DEFAULT 0,
  business_boost DECIMAL(5,2) DEFAULT 1.0,
  
  -- Vector search (future)
  search_vector tsvector,
  embedding vector(1536),
  
  -- Metadata
  attributes JSONB,
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Indexes
  CONSTRAINT search_documents_product_id_key UNIQUE (product_id)
);

-- Trigram index for fuzzy search
CREATE INDEX idx_search_documents_name_trgm 
ON search_documents USING gin(name gin_trgm_ops);

-- Full-text search index
CREATE INDEX idx_search_documents_search_vector 
ON search_documents USING gin(search_vector);

-- Price range queries
CREATE INDEX idx_search_documents_price 
ON search_documents(price);

-- Category filtering
CREATE INDEX idx_search_documents_category 
ON search_documents(category_name);
```

### 7.2 Index Population

```sql
-- Populate search index from products
INSERT INTO search_documents (
  product_id, name, description, category_name, brand, tags,
  price, rating, review_count, stock_status,
  search_vector, updated_at
)
SELECT 
  p.id,
  p.name,
  p.description,
  c.name,
  p.brand,
  p.tags,
  p.price,
  p.rating,
  p.review_count,
  CASE WHEN p.stock > 0 THEN 'in_stock' ELSE 'out_of_stock' END,
  to_tsvector('english', 
    COALESCE(p.name, '') || ' ' || 
    COALESCE(p.description, '') || ' ' ||
    COALESCE(c.name, '') || ' ' ||
    COALESCE(p.brand, '')
  ),
  NOW()
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.status = 'active';
```

### 7.3 Search Query Examples

```sql
-- Basic text search with ranking
SELECT product_id, name, 
  ts_rank(search_vector, query) AS rank
FROM search_documents,
  to_tsquery('english', 'wireless & earbuds') query
WHERE search_vector @@ query
ORDER BY rank DESC
LIMIT 24;

-- Fuzzy search with trigrams
SELECT product_id, name,
  similarity(name, 'wirel earbuds') AS score
FROM search_documents
WHERE name % 'wirel earbuds'
ORDER BY score DESC
LIMIT 24;

-- Filtered search
SELECT product_id, name, price, rating
FROM search_documents
WHERE search_vector @@ to_tsquery('english', 'wireless & earbuds')
  AND price BETWEEN 500 AND 5000
  AND rating >= 4.0
  AND stock_status = 'in_stock'
ORDER BY ts_rank(search_vector, to_tsquery('english', 'wireless & earbuds')) DESC
LIMIT 24;
```

---

## 8. Performance

### 8.1 Response Time Targets

| Operation | Target | Strategy |
|-----------|--------|----------|
| Autocomplete | < 100ms | Edge cache, prefix index |
| Search results | < 200ms | Optimized queries, caching |
| Filter application | < 150ms | Pre-computed facets |
| Sort operation | < 50ms | Index-based sorting |
| Recommendation load | < 100ms | Pre-computation, caching |

### 8.2 Caching Strategy

| Cache Layer | TTL | Invalidation |
|-------------|-----|--------------|
| Cloudflare KV (autocomplete) | 5 min | TTL-based |
| Cloudflare KV (search results) | 1 min | TTL-based |
| CDN (product images) | 24 hours | URL-based |
| Browser cache (static assets) | 7 days | Version-based |

### 8.3 Search Query Optimization

```sql
-- Efficient pagination with cursor
SELECT * FROM search_documents
WHERE search_vector @@ $1
  AND id > $cursor  -- cursor from previous page
ORDER BY ts_rank(search_vector, $1) DESC, id
LIMIT 24;

-- Efficient facet counting
SELECT 
  category_name, COUNT(*) as count
FROM search_documents
WHERE search_vector @@ $1
GROUP BY category_name
ORDER BY count DESC
LIMIT 20;
```

### 8.4 Scalability Targets

| Metric | MVP | Scale | Enterprise |
|--------|-----|-------|------------|
| Products indexed | 10K | 100K | 1M+ |
| Queries per second | 100 | 1K | 10K+ |
| Concurrent users | 500 | 5K | 50K+ |
| Index size | 1 GB | 10 GB | 100 GB+ |

### 8.5 Performance Monitoring

| Metric | Alert Threshold | Action |
|--------|----------------|--------|
| P95 latency > 200ms | Warning | Review query patterns |
| P95 latency > 500ms | Critical | Scale resources |
| Cache hit rate < 80% | Warning | Review cache strategy |
| Index size > 10GB | Warning | Review index structure |

---

## 9. UX Standards

### 9.1 Search UI Components

| Component | Mobile | Tablet | Desktop |
|-----------|--------|--------|---------|
| Search bar | Full width | Full width | 400px max |
| Autocomplete dropdown | Bottom sheet | Dropdown | Dropdown |
| Search results grid | 2 columns | 3 columns | 4 columns |
| Filter drawer | Slide-in | Sidebar | Sidebar |
| Product card | Compact | Standard | Standard |

### 9.2 Loading States

| State | UI Treatment |
|-------|--------------|
| Initial search | Skeleton grid (6 cards) |
| Autocomplete loading | Spinner in search bar |
| Filter loading | Skeleton filter list |
| Infinite scroll | Loading spinner at bottom |
| Empty results | Illustration + suggestions |

### 9.3 Animations

| Element | Duration | Easing |
|---------|----------|--------|
| Autocomplete appear | 150ms | ease-out |
| Filter drawer slide | 200ms | ease-out |
| Product card hover | 150ms | ease-in-out |
| Grid layout shift | 200ms | ease-in-out |
| Skeleton pulse | 1.5s | ease-in-out (infinite) |

### 9.4 Touch Interactions (Mobile)

| Gesture | Action |
|---------|--------|
| Swipe left/right | Navigate search history |
| Pull down | Refresh results |
| Long press product | Quick view |
| Pinch zoom | Product image zoom |

### 9.5 Accessibility

| Requirement | Implementation |
|-------------|----------------|
| Keyboard navigation | Full search flow via keyboard |
| Screen reader | ARIA labels for all interactive elements |
| Focus management | Logical focus order |
| Color contrast | WCAG AA compliance |
| Touch targets | Minimum 44×44px |

---

## 10. Security

### 10.1 Input Validation

| Input | Validation | Sanitization |
|-------|------------|--------------|
| Search query | Max 200 chars | Strip HTML, SQL keywords |
| Filter values | Whitelist validation | Parameterized queries |
| Sort parameter | Allowlist check | Enum validation |
| Pagination | Positive integer | Min/max bounds |

### 10.2 Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| Search API | 100 req/min | Per IP |
| Autocomplete API | 60 req/min | Per IP |
| Recommendation API | 30 req/min | Per IP |

### 10.3 Data Protection

- Search queries are **not** logged with user PII
- User search history encrypted at rest
- Search analytics anonymized after 30 days
- No personal data in search index

### 10.4 Query Injection Prevention

```typescript
// Parameterized query example
const searchQuery = `
  SELECT * FROM search_documents 
  WHERE search_vector @@ to_tsquery('english', $1)
  ORDER BY ts_rank(search_vector, to_tsquery('english', $1)) DESC
  LIMIT $2 OFFSET $3
`;

// Never interpolate user input into queries
// Always use parameterized queries
```

---

## 11. Accessibility

### 11.1 WCAG 2.1 AA Compliance

| Criterion | Implementation |
|-----------|----------------|
| 1.1.1 Text Alternatives | Alt text for product images |
| 1.3.1 Info and Relationships | Semantic HTML for filters |
| 1.4.3 Contrast | Minimum 4.5:1 ratio |
| 2.1.1 Keyboard | Full keyboard navigation |
| 2.4.3 Focus Order | Logical focus order |
| 3.3.2 Labels | Labels for all form inputs |
| 4.1.2 Name, Role, Value | ARIA attributes for components |

### 11.2 Screen Reader Support

```html
<!-- Search input -->
<input 
  type="search" 
  aria-label="Search products"
  aria-autocomplete="list"
  aria-controls="search-results"
  role="combobox"
/>

<!-- Filter group -->
<fieldset>
  <legend>Category</legend>
  <label>
    <input type="checkbox" name="category" value="electronics" />
    Electronics (42)
  </label>
</fieldset>

<!-- Search results -->
<div role="region" aria-label="Search results">
  <p aria-live="polite">142 results found</p>
  <ul role="list">
    <li role="listitem">Product card...</li>
  </ul>
</div>
```

### 11.3 Keyboard Navigation

| Key | Action |
|-----|--------|
| `/` | Focus search input |
| `Escape` | Close autocomplete / filter drawer |
| `Tab` | Navigate between elements |
| `Enter` | Select item / submit search |
| `Arrow keys` | Navigate autocomplete suggestions |
| `Space` | Toggle filter checkbox |

---

## 12. Future Readiness

### 12.1 AI Search Capabilities

| Capability | Phase | Implementation |
|------------|-------|----------------|
| Semantic search | V3 | Vector embeddings (OpenAI/Pinecone) |
| Image search | V4 | CLIP model integration |
| Voice search | V3 | Web Speech API |
| Conversational search | V4 | LLM integration |
| Visual recommendations | V5 | Computer vision |

### 12.2 Migration Path

```
Phase 1 (MVP):     PostgreSQL + pg_trgm
                     ↓
Phase 2 (Scale):   Meilisearch / Typesense
                     ↓
Phase 3 (AI):      + Vector database (Pinecone/Qdrant)
                     ↓
Phase 4 (Multi):   + Full AI search stack
```

### 12.3 Extensibility Points

| Extension Point | Purpose | API |
|-----------------|---------|-----|
| Custom filters | Vendor-specific attributes | Filter plugin API |
| Custom ranking | Business-specific algorithms | Ranking plugin API |
| Custom recommendations | Vendor-specific recs | Recommendation plugin API |
| Search analytics | Custom tracking | Analytics event API |

### 12.4 API Versioning

```
/api/v1/search
/api/v1/autocomplete
/api/v1/filters
/api/v1/recommendations

Future versions:
/api/v2/search  (semantic search)
/api/v3/search  (conversational search)
```

---

## 13. Mandatory Rules for AI Agents

### 13.1 Search Implementation Rules

| Rule | Description | Violation |
|------|-------------|-----------|
| NEVER query product tables | Search must use search index only | Performance degradation |
| ALWAYS use parameterized queries | Prevent SQL injection | Security vulnerability |
| ALWAYS debounce autocomplete | Minimize API calls | Cost increase |
| ALWAYS validate filter inputs | Whitelist allowed values | Security vulnerability |
| ALWAYS paginate results | Prevent memory issues | Performance degradation |
| NEVER hardcode filters | All filters must be dynamic | Maintenance burden |
| ALWAYS cache search results | Improve response times | Poor UX |

### 13.2 Filter Implementation Rules

| Rule | Description | Violation |
|------|-------------|-----------|
| ALWAYS use OR within groups | Industry standard | Incorrect results |
| ALWAYS use AND between groups | Industry standard | Incorrect results |
| ALWAYS update facets dynamically | Reflect current filters | Misleading counts |
| ALWAYS persist filter state | URL params or session | Poor UX |
| NEVER block UI during filter | Optimistic updates | Poor UX |

### 13.3 Recommendation Implementation Rules

| Rule | Description | Violation |
|------|-------------|-----------|
| ALWAYS have fallback | Default to popularity | Empty recommendations |
| ALWAYS cache recommendations | Pre-compute when possible | Slow PDP load |
| ALWAYS respect user privacy | No PII in recommendations | Privacy violation |
| NEVER show out of stock | Filter recommendations | Poor UX |
| ALWAYS track performance | Monitor CTR, conversion | No optimization data |

### 13.4 Performance Rules

| Rule | Description | Violation |
|------|-------------|-----------|
| ALWAYS meet latency targets | < 200ms search, < 100ms autocomplete | Poor UX |
| ALWAYS use cursor pagination | Not offset-based | Performance at scale |
| ALWAYS index frequently queried fields | Optimize database queries | Slow queries |
| NEVER do N+1 queries | Use joins or batch loading | Performance degradation |
| ALWAYS monitor cache hit rate | Target > 80% | Cost increase |

### 13.5 Code Quality Rules

| Rule | Description | Violation |
|------|-------------|-----------|
| ALWAYS write search tests | Unit + integration tests | Regressions |
| ALWAYS document API changes | Update OpenAPI spec | Breaking changes |
| ALWAYS use TypeScript types | Type-safe search API | Runtime errors |
| NEVER use any type | Strict typing required | Type safety lost |
| ALWAYS handle errors gracefully | User-friendly error messages | Poor UX |

---

## Appendix A: API Reference

### A.1 Search API

```typescript
// GET /api/v1/search
interface SearchRequest {
  q: string;                    // Search query (required)
  page?: number;                // Page number (default: 1)
  limit?: number;               // Results per page (default: 24)
  sort?: SortOption;            // Sort order
  filters?: FilterParams;       // Active filters
}

interface SearchResponse {
  products: Product[];          // Search results
  total: number;                // Total result count
  page: number;                 // Current page
  pages: number;                // Total pages
  facets: Facet[];              // Available filters with counts
  suggestions: string[];        // Query suggestions
  appliedFilters: Filter[];     // Currently applied filters
}
```

### A.2 Autocomplete API

```typescript
// GET /api/v1/autocomplete
interface AutocompleteRequest {
  q: string;                    // Partial query (required)
  limit?: number;               // Max results (default: 8)
}

interface AutocompleteResponse {
  suggestions: string[];        // Text suggestions
  products: Product[];          // Product matches (max 5)
  categories: Category[];       // Category matches
  recent: string[];             // Recent searches (if logged in)
}
```

### A.3 Filter API

```typescript
// GET /api/v1/filters
interface FilterRequest {
  category?: string;            // Category context
  search?: string;              // Search query context
  appliedFilters?: Filter[];    // Currently applied filters
}

interface FilterResponse {
  filters: FilterDefinition[];  // Available filters
  facetCounts: FacetCount[];    // Counts for each facet value
}
```

### A.4 Recommendation API

```typescript
// GET /api/v1/recommendations
interface RecommendationRequest {
  type: RecommendationType;     // Type of recommendation
  productId?: string;           // Product context (for PDP)
  userId?: string;              // User context (for personalization)
  limit?: number;               // Max results (default: 6)
}

interface RecommendationResponse {
  products: Product[];          // Recommended products
  type: RecommendationType;     // Recommendation type used
  algorithm: string;            // Algorithm used
  confidence: number;           // Confidence score (0-1)
}
```

---

## Appendix B: Index Configuration

### B.1 Search Index Config

```json
{
  "searchIndex": {
    "name": "search_documents",
    "language": "english",
    "fields": {
      "name": { "weight": 1.0, "type": "text" },
      "description": { "weight": 0.5, "type": "text" },
      "category_name": { "weight": 0.8, "type": "keyword" },
      "brand": { "weight": 0.7, "type": "keyword" },
      "tags": { "weight": 0.6, "type": "keyword" }
    },
    "boostFactors": {
      "inStock": 1.0,
      "lowStock": 1.2,
      "newArrival": 1.3,
      "bestSeller": 1.5,
      "highRating": 1.2,
      "promoted": 1.4,
      "fastShipping": 1.1
    },
    "maxResults": 500,
    "defaultPageSize": 24
  }
}
```

### B.2 Autocomplete Config

```json
{
  "autocomplete": {
    "minCharacters": 2,
    "debounceMs": 300,
    "maxSuggestions": 5,
    "maxProducts": 5,
    "maxCategories": 3,
    "cacheTtlSeconds": 300,
    "fuzzyMatching": true,
    "typoTolerance": 2
  }
}
```

---

## Appendix C: Recommendation Configuration

### C.1 Recommendation Types Config

```json
{
  "recommendations": {
    "similarProducts": {
      "enabled": true,
      "maxResults": 6,
      "algorithm": "attribute_match",
      "fields": ["category", "brand", "price_range"],
      "minScore": 0.5,
      "excludeCurrentProduct": true,
      "cacheTtlSeconds": 300
    },
    "frequentlyBoughtTogether": {
      "enabled": true,
      "maxResults": 4,
      "algorithm": "co_occurrence",
      "minOccurrences": 5,
      "lookbackDays": 90,
      "cacheTtlSeconds": 3600
    },
    "trending": {
      "enabled": true,
      "maxResults": 8,
      "algorithm": "velocity",
      "windowDays": 7,
      "minOrders": 10,
      "cacheTtlSeconds": 300
    },
    "personalized": {
      "enabled": false,
      "maxResults": 8,
      "algorithm": "collaborative_filtering",
      "minInteractions": 5,
      "cacheTtlSeconds": 3600
    }
  }
}
```

---

## Appendix D: Implementation Checklist

### D.1 Phase 1: MVP (Weeks 1-4)

- [ ] Set up search index table
- [ ] Implement index population job
- [ ] Create search API endpoint
- [ ] Create autocomplete API endpoint
- [ ] Implement basic text search with pg_trgm
- [ ] Create filter API endpoint
- [ ] Implement dynamic filters
- [ ] Create recommendation API (rule-based)
- [ ] Add caching layer (Cloudflare KV)
- [ ] Implement search UI components
- [ ] Add loading states and skeletons
- [ ] Write unit tests
- [ ] Write integration tests
- [ ] Performance testing

### D.2 Phase 2: Scale (Weeks 5-8)

- [ ] Evaluate Meilisearch/Typesense
- [ ] Migrate search backend (if needed)
- [ ] Implement advanced faceting
- [ ] Add search analytics
- [ ] Optimize query performance
- [ ] Implement A/B testing framework
- [ ] Add search quality metrics
- [ ] Implement search synonyms
- [ ] Add search history
- [ ] Implement saved searches

### D.3 Phase 3: AI (Weeks 9-12)

- [ ] Implement vector embeddings
- [ ] Add semantic search
- [ ] Implement image search
- [ ] Add voice search
- [ ] Implement personalized recommendations
- [ ] Add collaborative filtering
- [ ] Implement search as you type
- [ ] Add natural language queries

### D.4 Phase 4: Enterprise (Ongoing)

- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Custom ranking rules
- [ ] Vendor-specific search configs
- [ ] Search quality monitoring
- [ ] A/B testing for search algorithms
- [ ] Real-time search optimization

---

*This document is the official Search Engine Architecture Standard for Nabome (নবME) Commerce Operating System. Every AI agent must follow these rules when implementing search, discovery, or recommendation features.*