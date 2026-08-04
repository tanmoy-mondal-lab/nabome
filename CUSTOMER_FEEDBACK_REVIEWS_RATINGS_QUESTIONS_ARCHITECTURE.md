# নবME (Nabome) — Customer Reviews, Ratings, Questions & Community Architecture Standard

> **Version:** 1.0
> **Date:** August 03, 2026
> **Status:** Active — All AI agents must follow this document
> **Priority:** This document is the single source of truth for customer feedback ecosystem — reviews, ratings, product questions, moderation, trust, reporting, and future community features
> **Supersedes:** None — complements ARCHITECTURE.md (v3.0), DATABASE_ARCHITECTURE.md (v1.0), PRODUCT_ENGINE_ARCHITECTURE.md (v1.0), IDENTITY_ACCESS_MANAGEMENT_ARCHITECTURE.md (v1.0), CUSTOMER_ACCOUNT_PROFILE_ARCHITECTURE.md (v1.0), ORDER_MANAGEMENT_ARCHITECTURE.md (v1.0), SEARCH_ENGINE_ARCHITECTURE.md (v1.0), CUSTOMER_EXPERIENCE_ARCHITECTURE.md (v1.0)

---

## Table of Contents

1. [Feedback Foundation](#1-feedback-foundation)
2. [Ratings Architecture](#2-ratings-architecture)
3. [Reviews Architecture](#3-reviews-architecture)
4. [Product Questions Architecture](#4-product-questions-architecture)
5. [Moderation Architecture](#5-moderation-architecture)
6. [Trust System Architecture](#6-trust-system-architecture)
7. [Visibility Architecture](#7-visibility-architecture)
8. [Notifications Architecture](#8-notifications-architecture)
9. [Search Architecture](#9-search-architecture)
10. [Permissions Architecture](#10-permissions-architecture)
11. [Performance Architecture](#11-performance-architecture)
12. [Security Architecture](#12-security-architecture)
13. [Accessibility Architecture](#13-accessibility-architecture)
14. [Future Readiness Architecture](#14-future-readiness-architecture)
15. [Mandatory Rules for AI Agents](#15-mandatory-rules-for-ai-agents)

---

## 1. Feedback Foundation

### 1.1 What

The foundational philosophy, ownership model, lifecycle, trust model, moderation model, visibility model, and community principles that govern every piece of customer feedback on the Nabome platform — reviews, ratings, questions, answers, and community interactions.

### 1.2 Why

- **Trust amplification:** Customer feedback is the most powerful trust signal — but only if authentic and well-moderated.
- **Decision confidence:** Every review should help future customers make confident purchasing decisions.
- **Noise reduction:** Premium brand requires signal-rich, noise-free feedback.
- **Brand integrity:** Customers interact only with the Nabome brand — Shop Owner identities are never exposed.
- **Scalability:** Feedback architecture must handle 0 to 10M+ reviews without redesign.
- **Legal compliance:** Meets consumer protection laws for authentic reviews.

### 1.3 Where

Product detail pages, search results, review listings, question sections, admin moderation dashboard, email notifications, analytics dashboards, and any surface displaying customer-generated content.

### 1.4 Feedback Philosophy

| Principle | Description | Rationale |
|-----------|-------------|-----------|
| **Trust without noise** | Feedback must increase trust without creating clutter | Premium brand |
| **Authentic voices** | Only real purchasers can leave reviews | Social proof integrity |
| **Nabome brand first** | Customers see only Nabome — never Shop Owner identities | Brand integrity |
| **Quality over quantity** | One thoughtful review outweighs ten one-liners | Decision value |
| **Moderated transparency** | Moderation preserves trust without reducing transparency | Balanced trust |
| **Independent modules** | Reviews, ratings, questions are independent modules | Scalable architecture |
| **Mobile-first feedback** | Writing reviews optimized for mobile | 70%+ mobile traffic |
| **Beginner-friendly** | Every feedback action immediately understandable | Accessibility |
| **Enterprise-grade** | Moderation, reporting, trust signals at enterprise scale | Reliability |

### 1.5 Feedback Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│                    FEEDBACK LIFECYCLE                             │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                  CUSTOMER SUBMITS                          │   │
│  │  • Review / Rating / Question / Answer                    │   │
│  │  • Validated against schema                               │   │
│  │  • Created with status = pending (if moderated)           │   │
│  │       OR status = published (if auto-approved)            │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                  MODERATION                                │   │
│  │  • Auto-screen (spam, offensive, duplicate)               │   │
│  │  • Manual review (if flagged)                             │   │
│  │  • Admin approve / reject                                 │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│              ┌───────────┼───────────┐                          │
│              ▼           ▼           ▼                          │
│  ┌────────────────┐ ┌───────────┐ ┌───────────┐                │
│  │   PUBLISHED    │ │  HIDDEN   │ │ REJECTED  │                │
│  │  Public view   │ │ Admin only│ │ Customer  │                │
│  └────────────────┘ └───────────┘ └───────────┘                │
│              │                                                  │
│              ▼                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                  ENGAGEMENT                                │   │
│  │  • Helpful votes                                          │   │
│  │  • Report review                                          │   │
│  │  • Featured review                                        │   │
│  │  • Search indexing                                         │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                  LIFECYCLE END                             │   │
│  │  • Edit window expires (30 days)                          │   │
│  │  • Review archived if product deleted                     │   │
│  │  • Analytics aggregation                                  │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 1.6 Feedback Ownership

| Entity | Owner | Location | Access |
|--------|-------|----------|--------|
| **Reviews** | Products domain | `api/_handlers/products/reviews.ts` | Customer (own) + Public (read) |
| **Ratings** | Products domain | `api/_handlers/products/reviews.ts` | Customer (own) + Public (read) |
| **Questions** | Products domain | `api/_handlers/products/questions.ts` | Customer (own) + Public (read) |
| **Answers** | Products domain | `api/_handlers/products/questions.ts` | Admin only |
| **Review moderation** | Admin domain | `api/_handlers/admin/reviews.ts` | Admin only |
| **Reported content** | Admin domain | `api/_handlers/admin/reviews.ts` | Admin only |
| **Review analytics** | Shared | `api/_handlers/products/analytics.ts` | Admin (read) |
| **Helpful votes** | Products domain | `api/_handlers/products/reviews.ts` | Customer (own) |

### 1.7 Trust Model

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Verified purchase** | Only purchasers can review after delivery | Authentic social proof |
| **Identity protection** | Customer first name + last initial displayed | Privacy |
| **Shop anonymity** | Shop Owner identity never exposed to customers | Brand integrity |
| **Moderation pipeline** | All reviews pass through moderation before publication | Quality control |
| **Report mechanism** | Customers can flag inappropriate content | Community self-policing |
| **Helpful signals** | Community votes surface best reviews | Quality ranking |
| **Authenticity checks** | Duplicate, spam, and fake review detection | Trust integrity |
| **Audit trail** | All moderation actions logged | Accountability |

### 1.8 Moderation Model

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Default moderation** | New reviews require approval (v1) | Quality control at scale |
| **Auto-approve option** | Trusted reviewers bypass moderation (future) | Efficiency |
| **Auto-reject** | Spam, offensive, and duplicate content auto-rejected | Scale |
| **Manual review** | Flagged content reviewed by admin | Human judgment |
| **Appeal process** | Customer can appeal rejected review | Fairness |
| **Moderation SLA** | Reviews moderated within 24 hours | Timeliness |
| **Moderation audit** | All moderation actions logged with reason | Accountability |

### 1.9 Visibility Model

| Visibility | Description | Audience |
|------------|-------------|----------|
| **Public** | Visible on product page and search results | Everyone |
| **Hidden** | Visible only in admin panel | Admin only |
| **Pending** | Awaiting moderation approval | Admin only |
| **Rejected** | Rejected by moderation, not visible publicly | Admin + Author |
| **Archived** | Product deleted, review preserved for integrity | Admin only |

### 1.10 Community Principles

| Principle | Description | Rationale |
|-----------|-------------|-----------|
| **Constructive feedback** | Reviews must be helpful, not harmful | Quality |
| **Respectful communication** | No personal attacks, profanity, or discrimination | Safety |
| **Relevant content** | Reviews must relate to the product | Signal |
| **No self-promotion** | Reviews cannot promote external links or products | Integrity |
| **No Shop Owner manipulation** | Shop Owners cannot review their own products | Fairness |
| **Privacy respect** | No personal information of other customers | Privacy |
| **No competitor sabotage** | Fake negative reviews from competitors are prohibited | Fairness |

### 1.11 Feedback Anti-Patterns

| Anti-Pattern | Why It's Wrong | Correct Approach |
|--------------|----------------|------------------|
| Allowing guest reviews | Unverified feedback destroys trust | Verified purchase required |
| Exposing Shop Owner identity | Violates brand integrity | Nabome-only branding |
| Auto-publishing reviews | Spam and fake reviews go live | Moderation pipeline |
| No helpful vote system | Good reviews buried under noise | Community curation |
| Hard-deleting reviews | Audit trail broken | Soft delete with archive |
| Allowing review of unpublished products | Confuses customers | Only review active products |
| No mobile-optimized writing | 70%+ mobile users cannot write easily | Mobile-first review UI |
| Moderation without audit | No accountability | Full audit logging |

---

## 2. Ratings Architecture

### 2.1 What

The complete architecture for star ratings — rating creation, aggregation, distribution, validation, updates, visibility, and their impact on product trust signals.

### 2.2 Why

- **Quick signal:** Star ratings provide instant purchase confidence.
- **Aggregate trust:** Average ratings and distribution histograms reveal product quality.
- **Search ranking:** Ratings influence product ranking in search results.
- **Decision support:** Rating distribution helps customers compare products.
- **Analytics:** Rating trends inform product quality and inventory decisions.

### 2.3 Where

Product detail pages, product cards, search results, review listings, admin dashboards, analytics reports, and recommendation engines.

---

### 2.4 Star Ratings

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Scale** | 1-5 stars (integer values only) | Industry standard, simple |
| **Half-star support** | No (v1) — integer only | Simplicity |
| **Required** | Yes — every review must include a star rating | Rating integrity |
| **One per product** | One rating per customer per product | Prevent rating manipulation |
| **Editable** | Customer can edit rating within 30 days of submission | Flexibility |
| **Display** | Filled stars in Nabome brand gold | Visual clarity |
| **Default** | No default rating — customer must explicitly select | Intentional input |

#### 2.4.1 Star Rating Schema

```typescript
interface RatingInput {
  productId: string;    // UUID, required
  orderId: string;      // UUID, required — must reference delivered order
  rating: number;       // 1-5, integer, required
}
```

#### 2.4.2 Star Rating Validation

| Field | Required | Validation | Error Code |
|-------|----------|------------|------------|
| `productId` | Yes | Valid UUID, product exists and isActive | `RATING_PRODUCT_INVALID` |
| `orderId` | Yes | Valid UUID, order delivered, belongs to customer | `RATING_ORDER_INVALID` |
| `rating` | Yes | Integer 1-5 | `RATING_VALUE_INVALID` |
| `duplicate` | — | One rating per customer per product | `RATING_DUPLICATE` |

---

### 2.5 Average Rating

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Calculation** | Sum of all ratings / count of ratings | Standard arithmetic mean |
| **Storage** | `averageRating` on Product model (denormalized) | Query performance |
| **Precision** | DECIMAL(3,2) — e.g., 4.75 | Display precision |
| **Update strategy** | Recalculate on every rating add/edit/delete | Data accuracy |
| **Rounding** | Display 1 decimal place (4.8), store 2 decimal places | Display vs precision |
| **Empty state** | Show "No ratings yet" when count = 0 | Honest representation |
| **Cached** | Cached at edge, invalidated on rating change | Performance |

#### 2.5.1 Average Rating Calculation

```typescript
async function recalculateAverageRating(productId: string): Promise<void> {
  const stats = await db.rating.aggregate({
    where: { productId, isActive: true },
    _avg: { rating: true },
    _count: { rating: true },
  });

  await db.product.update({
    where: { id: productId },
    data: {
      averageRating: stats._avg.rating ?? 0,
      reviewCount: stats._count.rating,
    },
  });
}
```

---

### 2.6 Rating Distribution

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Display** | Horizontal bar chart for 5-4-3-2-1 stars | Visual clarity |
| **Storage** | Recalculated on every rating change (not stored separately) | Data accuracy |
| **Percentage** | Show percentage of total for each star level | Context |
| **Count** | Show count for each star level | Volume signal |
| **Filterable** | Customer can filter reviews by star level | Discovery |
| **Animated** | Bars animate on load | Premium feel |

#### 2.6.1 Rating Distribution Query

```typescript
async function getRatingDistribution(productId: string): Promise<RatingDistribution> {
  const ratings = await db.rating.groupBy({
    by: ['rating'],
    where: { productId, isActive: true },
    _count: { rating: true },
  });

  const total = ratings.reduce((sum, r) => sum + r._count.rating, 0);

  return {
    5: { count: ratings.find(r => r.rating === 5)?._count.rating ?? 0, percentage: ... },
    4: { count: ratings.find(r => r.rating === 4)?._count.rating ?? 0, percentage: ... },
    3: { count: ratings.find(r => r.rating === 3)?._count.rating ?? 0, percentage: ... },
    2: { count: ratings.find(r => r.rating === 2)?._count.rating ?? 0, percentage: ... },
    1: { count: ratings.find(r => r.rating === 1)?._count.rating ?? 0, percentage: ... },
    total,
  };
}
```

---

### 2.7 Rating Updates

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Edit window** | 30 days from initial submission | Flexibility with integrity |
| **Update method** | PATCH request — only rating value changes | Partial update |
| **Recalculation** | Average rating recalculated on every update | Accuracy |
| **History** | Rating change logged in audit trail | Accountability |
| **Notification** | No notification on rating update (silent) | Minimal noise |

---

### 2.8 Rating Validation

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Purchase verification** | Must reference a delivered order | Authentic reviews |
| **One per product** | Unique constraint on (customerId, productId) | Prevent manipulation |
| **Order status** | Order must be in `delivered` or `completed` state | Only purchased products |
| **Product active** | Product must be `published` or `archived` | No ratings on drafts |
| **Time delay** | Rating allowed 24 hours after delivery | Prevent premature ratings |
| **Customer identity** | Must be authenticated customer | Security |

---

### 2.9 Rating Visibility

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Public display** | Average rating visible on product card and detail page | Trust signal |
| **Distribution display** | Rating distribution visible on product detail page | Detailed insight |
| **Reviewer identity** | First name + last initial displayed | Privacy |
| **Order reference** | "Verified Purchase" badge shown | Authenticity |
| **Admin view** | All ratings visible in admin panel | Oversight |
| **Search index** | Average rating indexed for sorting | Discoverability |

---

## 3. Reviews Architecture

### 3.1 What

The complete architecture for customer product reviews — review creation, content standards, media support, helpful votes, editing, deletion, history, and their role in building product trust.

### 3.2 Why

- **Decision confidence:** Detailed reviews help customers understand products beyond descriptions.
- **Social proof:** Verified purchase reviews are the strongest trust signal.
- **SEO:** User-generated content improves search rankings.
- **Product insights:** Reviews reveal product issues early.
- **Community:** Reviews create a feedback loop between customers and the platform.

### 3.3 Where

Product detail pages, review listings, search results, customer account pages, admin moderation dashboard, email notifications, and analytics.

---

### 3.4 Review Creation

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Prerequisite** | Must have delivered order containing the product | Verified purchase |
| **One review per order item** | Each order item can be reviewed once | Prevent spam |
| **Rating required** | Star rating mandatory with review | Quick signal |
| **Title optional** | Short summary of review (encouraged) | Scannable |
| **Body optional** | Detailed review text (encouraged) | Depth |
| **Minimum body length** | 10 characters if body provided | Quality floor |
| **Maximum body length** | 2000 characters | Prevent bloat |
| **Maximum title length** | 150 characters | Prevent overflow |
| **Profanity filter** | Auto-screen for offensive language | Quality control |
| **Time limit** | Can review within 90 days of delivery | Relevant feedback |
| **Edit window** | Can edit within 30 days of submission | Flexibility |

#### 3.4.1 Review Schema

```typescript
interface ReviewInput {
  productId: string;     // UUID, required
  orderId: string;       // UUID, required
  rating: number;        // 1-5, integer, required
  title?: string;        // Max 150 chars, optional
  body?: string;         // Min 10, max 2000 chars, optional (if provided)
  pros?: string[];       // Max 5 items, max 100 chars each, optional
  cons?: string[];       // Max 5 items, max 100 chars each, optional
  images?: string[];     // Max 5 Cloudinary URLs, optional
  videos?: string[];     // Max 2 Cloudinary URLs, optional (future)
}
```

#### 3.4.2 Review Validation

| Field | Required | Validation | Error Code |
|-------|----------|------------|------------|
| `productId` | Yes | Valid UUID, product exists and isActive | `REVIEW_PRODUCT_INVALID` |
| `orderId` | Yes | Valid UUID, order delivered, belongs to customer | `REVIEW_ORDER_INVALID` |
| `rating` | Yes | Integer 1-5 | `REVIEW_RATING_INVALID` |
| `title` | No | Max 150 chars, no HTML | `REVIEW_TITLE_INVALID` |
| `body` | No* | Min 10, max 2000 chars, no HTML if provided | `REVIEW_BODY_INVALID` |
| `pros` | No | Array, max 5, each max 100 chars | `REVIEW_PROS_INVALID` |
| `cons` | No | Array, max 5, each max 100 chars | `REVIEW_CONS_INVALID` |
| `images` | No | Array, max 5, valid Cloudinary URLs | `REVIEW_IMAGES_INVALID` |
| `videos` | No | Array, max 2, valid Cloudinary URLs | `REVIEW_VIDEOS_INVALID` |
| `duplicate` | — | One review per customer per order item | `REVIEW_DUPLICATE` |

*If body is provided, must be minimum 10 characters.

---

### 3.5 Review Title

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Purpose** | One-liner summarizing the review | Quick scanning |
| **Max length** | 150 characters | Prevent overflow |
| **Min length** | 5 characters if provided | Meaningful titles |
| **Required** | No (but strongly encouraged) | Flexibility |
| **No HTML** | Plain text only | Security |
| **Display** | Bold text above review body | Visual hierarchy |

---

### 3.6 Review Body

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Purpose** | Detailed customer experience | Informed decisions |
| **Max length** | 2000 characters | Prevent bloat |
| **Min length** | 10 characters if provided | Meaningful content |
| **Required** | No (at least title or body required) | Flexibility |
| **No HTML** | Plain text only | Security |
| **Line breaks** | Preserve single line breaks | Readability |
| **Display** | Regular weight text below title | Visual clarity |

---

### 3.7 Review Images

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Purpose** | Visual proof of product quality/fit | Social proof |
| **Max count** | 5 images per review | Prevent bloat |
| **Format** | JPG, PNG, WebP only | Security |
| **Max size** | 5MB per image | Performance |
| **Storage** | Cloudinary with transformations | Optimization |
| **Upload** | Drag-and-drop or tap to select | Mobile-first |
| **Display** | Thumbnail grid, tap to expand lightbox | Visual clarity |
| **Moderation** | Images moderated before publication | Quality control |
| **Alt text** | Auto-generated from review context | Accessibility |

---

### 3.8 Review Videos

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Purpose** | Rich product demonstration | Future-ready |
| **Max count** | 2 videos per review | Performance |
| **Format** | MP4, WebM only | Compatibility |
| **Max size** | 50MB per video | Performance |
| **Max duration** | 60 seconds | Conciseness |
| **Storage** | Cloudinary Video | Optimization |
| **Upload** | Record or upload | Flexibility |
| **Moderation** | Videos moderated before publication | Quality control |
| **Display** | Inline player with poster | Visual clarity |

---

### 3.9 Pros & Cons Readiness

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Purpose** | Structured positive/negative feedback | Quick scanning |
| **Max pros** | 5 items | Prevent bloat |
| **Max cons** | 5 items | Prevent bloat |
| **Max length** | 100 characters per item | Conciseness |
| **Required** | No (optional enhancement) | Flexibility |
| **Display** | Green checkmarks (pros), Red crosses (cons) | Visual clarity |
| **Storage** | String array in Review model | Flexibility |

---

### 3.10 Helpful Votes

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Purpose** | Community signals which reviews are most useful | Quality ranking |
| **Button** | "Was this review helpful?" with Yes/No | Clear CTA |
| **Display** | Count of helpful votes below review | Social proof |
| **One vote per user** | Unique constraint on (userId, reviewId) | Prevent manipulation |
| **No self-vote** | Cannot vote on own review | Fairness |
| **Real-time update** | Count updates immediately on vote | Perceived speed |
| **Sorting influence** | Helpful votes influence review sort order | Quality surface |

#### 3.10.1 Helpful Vote Schema

```typescript
interface HelpfulVoteInput {
  reviewId: string;    // UUID, required
  helpful: boolean;    // true = helpful, false = not helpful
}
```

---

### 3.11 Review Editing

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Edit window** | 30 days from initial submission | Flexibility with integrity |
| **Editable fields** | Rating, title, body, pros, cons, images, videos | Full flexibility |
| **Version history** | Previous version preserved in audit trail | Accountability |
| **Re-moderation** | Edited reviews re-enter moderation queue | Quality control |
| **Notification** | No notification on edit (silent) | Minimal noise |
| **Edit indicator** | "Edited" badge shown if review was modified | Transparency |

---

### 3.12 Review Deletion Policy

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Customer delete** | Customer can delete own review | Control |
| **Admin delete** | Admin can delete any review | Oversight |
| **Soft delete** | `isActive = false`, review hidden but preserved | Audit integrity |
| **Cascade** | Rating recalculation on deletion | Data accuracy |
| **No hard delete** | Reviews are never permanently removed | Audit trail |
| **Order integrity** | Order item review slot reopens after deletion | Re-review capability |

---

### 3.13 Review History

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Version tracking** | Every edit creates a new version record | Full history |
| **Version storage** | Previous content stored in ReviewVersion table | Audit trail |
| **Version display** | Admin can view all versions | Oversight |
| **Version comparison** | Admin can compare versions side by side | Moderation |
| **Retention** | Review versions retained indefinitely | Compliance |
| **Immutable** | Version records are never modified | Audit integrity |

---

## 4. Product Questions Architecture

### 4.1 What

The complete architecture for product questions and answers — customer questions, admin answers, official answers, question visibility, search, moderation, and future AI answer readiness.

### 4.2 Why

- **Purchase confidence:** Answers to specific questions remove purchase barriers.
- **Reduced support:** Common questions answered publicly reduce support tickets.
- **SEO:** Questions and answers create long-tail content.
- **Community:** Questions create a knowledge base around products.
- **Discovery:** Questions reveal customer concerns and product attributes.

### 4.3 Where

Product detail pages, question listings, search results, admin dashboard, customer notifications, and analytics.

---

### 4.4 Customer Questions

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Purpose** | Customers ask questions about products | Information gap |
| **Required** | Must be authenticated to ask | Prevent spam |
| **One question per product** | One active question per customer per product | Prevent noise |
| **Question length** | Min 10, max 500 characters | Quality floor and ceiling |
| **No HTML** | Plain text only | Security |
| **Moderation** | Questions moderated before publication | Quality control |
| **Anonymous option** | Customer can ask anonymously (name hidden) | Privacy |
| **Notification** | Shop Owner notified of new question | Response prompt |
| **Searchable** | Questions indexed for search | Discoverability |

#### 4.4.1 Question Schema

```typescript
interface QuestionInput {
  productId: string;    // UUID, required
  body: string;         // Min 10, max 500 chars, required
  isAnonymous: boolean; // Default: false
}
```

#### 4.4.2 Question Validation

| Field | Required | Validation | Error Code |
|-------|----------|------------|------------|
| `productId` | Yes | Valid UUID, product exists and isActive | `QUESTION_PRODUCT_INVALID` |
| `body` | Yes | Min 10, max 500 chars, no HTML | `QUESTION_BODY_INVALID` |
| `duplicate` | — | One active question per customer per product | `QUESTION_DUPLICATE` |

---

### 4.5 Admin Answers

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Purpose** | Admin responds to customer questions on behalf of platform | Official response |
| **Actor** | Admin only | Brand voice |
| **One answer per question** | Single official answer per question | Clean UX |
| **Answer length** | Min 10, max 1000 characters | Quality floor and ceiling |
| **No HTML** | Plain text only | Security |
| **Moderation** | Admin answers auto-approved | Trusted source |
| **Notification** | Customer notified when question is answered | Engagement |
| **Edit** | Admin can edit answer | Accuracy |
| **Delete** | Admin can delete answer | Oversight |

#### 4.5.1 Answer Schema

```typescript
interface AnswerInput {
  questionId: string;   // UUID, required
  body: string;         // Min 10, max 1000 chars, required
}
```

---

### 4.6 Official Answers

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Purpose** | Distinguish admin answers from customer answers | Authority signal |
| **Badge** | "Official Answer" badge displayed | Trust signal |
| **Source** | Always from admin account | Brand voice |
| **Display** | Pinned to top of answers list | Visibility |
| **Styling** | Subtle background color differentiation | Visual hierarchy |

---

### 4.7 Question Visibility

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Public** | Approved questions visible on product page | Community value |
| **Pending** | Awaiting moderation, not visible publicly | Quality control |
| **Hidden** | Rejected questions, visible only in admin | Oversight |
| **Answered indicator** | Visual indicator when question has answer | Quick scanning |
| **Unanswered priority** | Unanswered questions surfaced to admin | Response prompt |
| **Sort** | Most recent first (default) | Freshness |
| **Sort option** | Most helpful (future) | Relevance |

---

### 4.8 Question Search

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Full-text search** | Questions indexed for full-text search | Discoverability |
| **Auto-suggest** | Suggest existing questions as customer types | Prevent duplicates |
| **Product-scoped** | Search within product's questions | Relevance |
| **Platform-wide** | Search across all product questions (admin) | Insights |
| **Search indexing** | Questions indexed on creation, updated on edit | Freshness |
| **Relevance ranking** | Questions ranked by recency and helpful votes | Quality |

---

### 4.9 Question Moderation

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Auto-screen** | Spam and offensive content auto-rejected | Scale |
| **Manual review** | Flagged questions reviewed by admin | Human judgment |
| **Moderation SLA** | Questions moderated within 24 hours | Timeliness |
| **Rejection reasons** | Predefined reasons for rejection | Transparency |
| **Appeal** | Customer can appeal rejected question | Fairness |
| **Audit** | All moderation actions logged | Accountability |

---

### 4.10 Future AI Answers Readiness

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **AI response field** | `aiAnswer` JSONB column on Question | Future extensibility |
| **AI confidence score** | Confidence metric for AI answers | Quality gate |
| **AI review** | AI answers reviewed by admin before publication | Quality control |
| **AI badge** | "AI-generated" badge for AI answers | Transparency |
| **Fallback to admin** | If AI confidence below threshold, route to admin | Quality assurance |
| **Training data** | Approved Q&A pairs used to train AI model | Continuous improvement |

---

## 5. Moderation Architecture

### 5.1 What

The complete architecture for content moderation — review approval, rejection, reporting, spam detection, abuse detection, offensive content handling, duplicate detection, and media validation.

### 5.2 Why

- **Trust preservation:** Moderation prevents spam, fake, and harmful content.
- **Brand protection:** Offensive content damages brand reputation.
- **Legal compliance:** Meets consumer protection laws for authentic reviews.
- **Scalability:** Automated moderation handles volume at scale.
- **Quality control:** Human judgment for nuanced decisions.

### 5.3 Where

Admin moderation dashboard, API handlers (`api/_handlers/admin/reviews.ts`), automated moderation pipeline, notification system, and audit logs.

---

### 5.4 Review Approval

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Default state** | New reviews start as `pending` | Quality gate |
| **Approval workflow** | Admin reviews and approves | Human judgment |
| **Batch approval** | Admin can approve multiple reviews at once | Efficiency |
| **Approval reason** | Optional reason for approval | Audit trail |
| **Auto-approve** | Trusted reviewers bypass moderation (future) | Efficiency |
| **Notification** | Customer notified on approval | Engagement |
| **Re-index** | Approved reviews indexed in search | Discoverability |

#### 5.4.1 Approval Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    REVIEW APPROVAL FLOW                          │
│                                                                  │
│  1. Customer submits review                                      │
│     → Review created with status = pending                       │
│     → Auto-screen runs (spam, offensive, duplicate)              │
│                                                                  │
│  2. Auto-screen passes                                           │
│     → Review enters moderation queue                             │
│     → Admin sees review in pending list                          │
│                                                                  │
│  3. Admin reviews                                                │
│     → Reads review content                                       │
│     → Checks for policy violations                               │
│     → Views uploaded media                                       │
│                                                                  │
│  4. Admin approves                                               │
│     → Status = published                                         │
│     → Customer notified                                          │
│     → Review indexed in search                                   │
│     → Average rating recalculated                                │
│     → Audit log: REVIEW_APPROVED                                 │
│                                                                  │
│  5. Admin rejects                                                │
│     → Status = rejected                                          │
│     → Customer notified with reason                              │
│     → Audit log: REVIEW_REJECTED                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

### 5.5 Review Rejection

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Reason required** | Admin must select rejection reason | Transparency |
| **Customer notification** | Customer notified with rejection reason | Communication |
| **Appeal process** | Customer can appeal rejected review | Fairness |
| **Re-submission** | Customer can edit and re-submit | Flexibility |
| **Rejection reasons** | Predefined list + custom option | Standardization |
| **Soft reject** | Review marked as rejected, not deleted | Audit trail |

#### 5.5.1 Rejection Reasons

| Reason | Description | Auto-Generated |
|--------|-------------|----------------|
| `spam` | Promotional or irrelevant content | Yes |
| `offensive` | Profanity, hate speech, harassment | Yes |
| `fake` | Suspected fake or purchased review | Yes |
| `duplicate` | Review already exists for this product | Yes |
| `irrelevant` | Review does not relate to the product | Manual |
| `inappropriate` | Inappropriate content or language | Manual |
| `personal_attack` | Attacks on other customers or the brand | Manual |
| `other` | Other reason (admin must specify) | Manual |

---

### 5.6 Report Review

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Trigger** | Customer clicks "Report" on review | Community policing |
| **Reason required** | Customer must select report reason | Data for moderation |
| **Anonymous** | Reporter identity hidden from review author | Privacy |
| **One report per user** | One report per user per review | Prevent abuse |
| **Threshold** | 3+ reports triggers automatic review queue | Efficiency |
| **Admin notification** | Admin notified of new report | Timeliness |
| **Resolution** | Admin resolves report and takes action | Accountability |
| **Reporter notification** | Reporter notified of resolution | Transparency |

#### 5.6.1 Report Reasons

| Reason | Description |
|--------|-------------|
| `fake` | Suspected fake or purchased review |
| `offensive` | Profanity, hate speech, or harassment |
| `spam` | Promotional or irrelevant content |
| `misleading` | Review contains false information |
| `personal_info` | Contains personal information |
| `other` | Other reason (must specify) |

---

### 5.7 Spam Detection Readiness

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Content analysis** | Auto-screen for spam patterns | Scale |
| **Keyword filtering** | Block known spam keywords | Basic defense |
| **Link detection** | Flag reviews with external links | Promotion prevention |
| **Rate limiting** | Limit reviews per customer per day | Abuse prevention |
| **Pattern detection** | Detect suspicious review patterns | Advanced defense |
| **ML readiness** | Schema supports ML-based classification | Future-proof |

---

### 5.8 Abuse Detection Readiness

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Profanity filter** | Auto-detect and flag profanity | Brand protection |
| **Hate speech detection** | Auto-detect hate speech patterns | Safety |
| **Harassment detection** | Auto-detect harassment patterns | Safety |
| **Threat detection** | Auto-detect threat patterns | Safety |
| **Severity levels** | Low, medium, high, critical | Response prioritization |
| **Auto-reject** | Critical severity auto-rejected | Scale |
| **Manual review** | Low/medium severity reviewed by admin | Human judgment |

---

### 5.9 Offensive Content

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Auto-detection** | Offensive content flagged automatically | Scale |
| **Severity assessment** | Content rated by severity | Prioritization |
| **Immediate hide** | High-severity content hidden immediately | Brand protection |
| **Admin review** | Flagged content reviewed within 4 hours | Timeliness |
| **Customer notification** | Customer notified if content rejected | Transparency |
| **Appeal** | Customer can appeal content rejection | Fairness |
| **Escalation** | Critical content escalated to senior admin | Oversight |

---

### 5.10 Duplicate Reviews

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Unique constraint** | Database enforces one review per customer per order item | Prevention |
| **Content similarity** | Auto-detect similar reviews from same customer | Pattern detection |
| **Product overlap** | Detect reviews for same product from same customer | Prevention |
| **Cross-product** | Detect same review text across products | Spam detection |
| **Admin override** | Admin can merge or delete duplicates | Cleanup |

---

### 5.11 Media Validation

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **File type check** | Only allowed image/video formats accepted | Security |
| **Size validation** | Max 5MB per image, 50MB per video | Performance |
| **Content scan** | Auto-scan for inappropriate images | Brand protection |
| **NSFW detection** | Auto-detect and reject NSFW content | Brand protection |
| **Watermark check** | Detect stock photos or watermarked images | Authenticity |
| **EXIF data** | Strip EXIF data for privacy | Privacy |
| **Format conversion** | Convert to WebP for optimization | Performance |

---

## 6. Trust System Architecture

### 6.1 What

The complete architecture for trust signals — verified purchase badges, review authenticity, helpful reviews, featured reviews, trusted feedback, and their role in building customer confidence.

### 6.2 Why

- **Decision confidence:** Trust signals help customers evaluate review reliability.
- **Quality surfacing:** Best reviews rise to the top.
- **Authenticity proof:** Verified purchase badges confirm genuine customers.
- **Premium brand:** Trust signals reinforce Nabome's premium positioning.
- **Anti-fake:** Trust system deters fake and manipulated reviews.

### 6.3 Where

Product detail pages, review listings, search results, review cards, and email notifications.

---

### 6.4 Verified Purchase Badge

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Badge text** | "Verified Purchase" | Clear signal |
| **Badge icon** | Green checkmark | Universal trust symbol |
| **Placement** | Next to reviewer name | Association with reviewer |
| **Condition** | Review linked to delivered order | Authenticity proof |
| **Display** | Always visible, cannot be removed | Permanent signal |
| **Admin view** | Order ID linked for verification | Oversight |
| **Customer view** | Order ID masked (e.g., NAB-****123) | Privacy |

---

### 6.5 Verified Review

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Definition** | Review from authenticated customer with delivered order | Authentic review |
| **Verification check** | System validates order delivery before publication | Integrity |
| **Badge** | "Verified Purchase" badge displayed | Visual signal |
| **Sorting boost** | Verified reviews sorted higher than unverified | Quality signal |
| **Trust score** | Verified reviews contribute more to product trust | Weighted trust |
| **Display priority** | Verified reviews shown first by default | Quality surface |

---

### 6.6 Review Authenticity

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Purchase verification** | Review must reference delivered order | Authenticity |
| **Identity verification** | Customer must be authenticated | Identity proof |
| **Content analysis** | Auto-screen for fake review patterns | Detection |
| **Behavior analysis** | Detect suspicious review patterns | Advanced detection |
| **Network analysis** | Detect coordinated fake review campaigns | Enterprise defense |
| **Temporal analysis** | Detect unusual review timing patterns | Pattern detection |
| **IP analysis** | Detect multiple reviews from same IP | Bot detection |
| **Device fingerprinting** | Detect same device posting multiple reviews | Advanced detection |

---

### 6.7 Helpful Reviews

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Definition** | Reviews with high helpful vote count | Community validated |
| **Sorting** | Helpful reviews sorted higher | Quality surfacing |
| **Display** | "Most Helpful" section on product page | Discovery |
| **Badge** | "Most Helpful" badge for top reviews | Recognition |
| **Threshold** | 5+ helpful votes to qualify | Minimum signal |
| **Decay** | Older helpful reviews lose weight over time | Freshness |
| **Algorithm** | Helpful votes + recency + verified status | Composite ranking |

---

### 6.8 Featured Reviews

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Definition** | Reviews selected by admin as featured | Editorial curation |
| **Selection** | Admin manually selects quality reviews | Human judgment |
| **Badge** | "Featured" badge displayed | Visual signal |
| **Placement** | Top of review listing, before sort | Maximum visibility |
| **Max featured** | 5 featured reviews per product | Curated quality |
| **Display** | Featured section above regular reviews | Visual hierarchy |
| **Rotation** | Admin can rotate featured reviews | Freshness |

---

### 6.9 Trusted Feedback

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Definition** | Reviews meeting all trust criteria | Highest trust level |
| **Criteria** | Verified purchase + helpful votes + quality content | Composite trust |
| **Badge** | "Trusted Review" badge | Premium signal |
| **Algorithm** | Verified + 10+ helpful votes + 50+ char body | Automated detection |
| **Display** | Sorted to top by default | Quality surface |
| **Weight** | Trusted reviews weighted 2x in average | Quality influence |
| **Admin override** | Admin can mark/unmark as trusted | Manual control |

---

## 7. Visibility Architecture

### 7.1 What

The complete architecture for review and question visibility — public, hidden, archived, pending, reported, and their rules for display across the platform.

### 7.2 Why

- **Quality control:** Only appropriate content is publicly visible.
- **Moderation efficiency:** Pending content is queued for review.
- **Brand protection:** Hidden content protects brand reputation.
- **Transparency:** Authors see their own content regardless of status.
- **Compliance:** Archived content meets legal retention requirements.

### 7.3 Where

Product detail pages, review listings, search results, admin dashboard, customer account pages, and API responses.

---

### 7.4 Public Reviews

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Definition** | Approved reviews visible to everyone | Public trust signal |
| **Display locations** | Product page, search results, review listings | Maximum visibility |
| **SEO** | Public reviews indexed by search engines | Organic discovery |
| **Caching** | Public reviews cached at edge | Performance |
| **Pagination** | Paginated for performance | Scalability |
| **Sort options** | Most recent, Most helpful, Highest rated, Lowest rated | Discovery |

---

### 7.5 Hidden Reviews

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Definition** | Reviews hidden by admin, not visible publicly | Moderation action |
| **Admin access** | Visible in admin panel with "Hidden" badge | Oversight |
| **Author access** | Visible to author with "Hidden" status | Transparency |
| **Reason** | Admin must provide reason for hiding | Accountability |
| **Unhide** | Admin can unhide reviews | Reversibility |
| **Audit** | Hide/unhide actions logged | Accountability |

---

### 7.6 Archived Reviews

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Definition** | Reviews from deleted/archived products | Data preservation |
| **Display** | Not visible on storefront | Clean storefront |
| **Admin access** | Visible in admin archive section | Oversight |
| **Integrity** | Preserved for order and product integrity | Legal compliance |
| **Analytics** | Included in historical analytics | Complete data |
| **Search** | Not included in product search | Relevance |

---

### 7.7 Pending Reviews

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Definition** | Reviews awaiting moderation approval | Quality gate |
| **Admin access** | Visible in moderation queue | Moderation |
| **Author access** | Visible to author with "Pending" status | Transparency |
| **Auto-screen** | Processed by auto-screen before queue | Efficiency |
| **SLA** | Must be reviewed within 24 hours | Timeliness |
| **Priority** | Older pending reviews prioritized | Fairness |
| **Notification** | Admin notified of new pending reviews | Prompt action |

---

### 7.8 Reported Reviews

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Definition** | Reviews flagged by customers for review | Community policing |
| **Admin access** | Visible in reports queue | Moderation |
| **Report count** | Number of reports displayed | Severity signal |
| **Auto-hide** | 5+ reports auto-hide review | Efficiency |
| **Admin review** | Admin reviews reported content | Human judgment |
| **Resolution** | Admin resolves report with action | Accountability |
| **Reporter notification** | Reporter notified of resolution | Transparency |
| **Appeal** | Review author can appeal report resolution | Fairness |

---

## 8. Notifications Architecture

### 8.1 What

The complete architecture for feedback-related notifications — review submitted, review approved, review rejected, question submitted, question answered, and report resolved.

### 8.2 Why

- **Engagement:** Notifications bring customers back to the platform.
- **Transparency:** Customers know the status of their submissions.
- **Timeliness:** Admin notified of new content requiring moderation.
- **Trust:** Resolution notifications close the feedback loop.
- **Retention:** Notification touchpoints drive repeat engagement.

### 8.3 Where

Email notifications, in-app notifications, push notifications (future), admin dashboard notifications, and customer account notifications.

---

### 8.4 Review Submitted

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Trigger** | Customer submits review | Confirmation |
| **Recipient** | Customer (author) | Acknowledgment |
| **Channel** | Email + in-app | Multi-channel |
| **Timing** | Immediate | Confirmation |
| **Content** | "Your review for [product] has been submitted and is pending moderation" | Transparency |
| **CTA** | Link to view review status | Self-service |
| **Admin notification** | Admin notified of new pending review | Moderation prompt |

---

### 8.5 Review Approved

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Trigger** | Admin approves review | Approval |
| **Recipient** | Customer (author) | Good news |
| **Channel** | Email + in-app | Multi-channel |
| **Timing** | Immediate on approval | Timeliness |
| **Content** | "Your review for [product] has been published!" | Engagement |
| **CTA** | Link to view published review | Social proof |
| **Display** | Review now visible on product page | Public trust |

---

### 8.6 Review Rejected

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Trigger** | Admin rejects review | Rejection |
| **Recipient** | Customer (author) | Transparency |
| **Channel** | Email + in-app | Multi-channel |
| **Timing** | Immediate on rejection | Timeliness |
| **Content** | "Your review for [product] was not approved" + reason | Transparency |
| **CTA** | Link to edit and re-submit | Recovery path |
| **Appeal** | Link to appeal rejection | Fairness |

---

### 8.7 Question Submitted

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Trigger** | Customer submits question | Confirmation |
| **Recipient** | Customer (author) | Acknowledgment |
| **Channel** | Email + in-app | Multi-channel |
| **Timing** | Immediate | Confirmation |
| **Content** | "Your question for [product] has been submitted" | Transparency |
| **Admin notification** | Admin notified of new question | Response prompt |

---

### 8.8 Question Answered

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Trigger** | Admin answers question | Resolution |
| **Recipient** | Customer (question author) | Engagement |
| **Channel** | Email + in-app | Multi-channel |
| **Timing** | Immediate on answer | Timeliness |
| **Content** | "Your question about [product] has been answered!" | Engagement |
| **CTA** | Link to view answer | Discovery |
| **Display** | Answer visible on product page | Community value |

---

### 8.9 Report Resolved

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Trigger** | Admin resolves report | Resolution |
| **Recipient** | Customer (reporter) | Closure |
| **Channel** | In-app | Multi-channel |
| **Timing** | Immediate on resolution | Timeliness |
| **Content** | "Your report has been reviewed. Thank you for helping keep our community safe." | Appreciation |
| **Action taken** | "We've taken appropriate action" (without specifics) | Privacy |
| **No appeal notification** | Reporter not notified if report dismissed | Simplicity |

---

## 9. Search Architecture

### 9.1 What

The complete architecture for review and question search — full-text search, filtering, sorting, media filters, and their integration with the product search system.

### 9.2 Why

- **Discoverability:** Customers can find relevant reviews and questions quickly.
- **Decision support:** Filtering by rating, media, and helpfulness aids decisions.
- **SEO:** Searchable reviews create additional organic content.
- **Efficiency:** Quick access to relevant feedback reduces purchase hesitation.
- **Insights:** Search analytics reveal customer concerns and preferences.

### 9.3 Where

Product detail pages, review listings, question sections, search results, admin dashboard, and analytics.

---

### 9.4 Review Search

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Full-text search** | Reviews indexed for full-text search | Discoverability |
| **Search scope** | Product-scoped (within product's reviews) | Relevance |
| **Search fields** | Title, body, pros, cons | Comprehensive |
| **Auto-suggest** | Suggest matching reviews as customer types | Speed |
| **Highlight** | Highlight matching terms in results | Visual clarity |
| **Pagination** | Paginated results (20 per page) | Performance |
| **Empty state** | "No reviews match your search" | Honest feedback |

---

### 9.5 Question Search

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Full-text search** | Questions indexed for full-text search | Discoverability |
| **Search scope** | Product-scoped (within product's questions) | Relevance |
| **Search fields** | Question body, answer body | Comprehensive |
| **Auto-suggest** | Suggest existing questions as customer types | Prevent duplicates |
| **Highlight** | Highlight matching terms in results | Visual clarity |
| **Answer status** | Show answered/unanswered indicator | Quick scanning |
| **Pagination** | Paginated results (20 per page) | Performance |

---

### 9.6 Review Filters

| Filter | Options | Default | Rationale |
|--------|---------|---------|-----------|
| **Rating** | 5, 4, 3, 2, 1 stars | All | Star-level filtering |
| **Media** | With photos, With videos, All | All | Media-specific filtering |
| **Verified only** | Toggle | Off | Authenticity filtering |
| **Helpful only** | Toggle | Off | Quality filtering |
| **Has pros/cons** | Toggle | Off | Structured feedback filtering |
| **Date range** | Last 7 days, 30 days, 90 days, All time | All time | Recency filtering |

---

### 9.7 Rating Filters

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Star filtering** | Filter reviews by specific star level | Targeted discovery |
| **Multi-select** | Select multiple star levels | Flexible filtering |
| **Count display** | Show count of reviews per star level | Context |
| **Percentage** | Show percentage of total | Relative context |
| **Clear filter** | Easy clear-all filter option | UX |
| **URL state** | Filters reflected in URL for sharing | Shareability |

---

### 9.8 Media Filters

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **With photos** | Filter reviews containing customer photos | Visual proof |
| **With videos** | Filter reviews containing customer videos | Rich content |
| **Photo count** | Show number of photos in review | Expectation setting |
| **Video count** | Show number of videos in review | Expectation setting |
| **Media gallery** | Aggregate all review media in one view | Discovery |
| **Lightbox** | Full-screen media viewer | Visual experience |

---

### 9.9 Sorting

| Sort Option | Description | Default |
|-------------|-------------|---------|
| **Most recent** | Newest reviews first | Yes |
| **Most helpful** | Highest helpful vote count first | No |
| **Highest rated** | 5-star reviews first | No |
| **Lowest rated** | 1-star reviews first | No |
| **Most photos** | Reviews with most photos first | No |
| **Oldest** | Oldest reviews first | No |

---

## 10. Permissions Architecture

### 10.1 What

The complete permission matrix for reviews, ratings, questions, answers, moderation, and reporting across all user roles.

### 10.2 Why

- **Security:** Users can only perform actions their role allows.
- **Clarity:** Clear boundaries prevent unauthorized access.
- **Auditability:** Permission checks are logged for compliance.
- **Scalability:** New roles added without restructuring.

### 10.3 Where

API handlers, middleware, frontend route guards, and admin dashboard.

---

### 10.4 Permission Matrix

| Permission | Customer | Shop Owner | Admin |
|------------|----------|------------|-------|
| **Review:read** | ✓ (public) | ✓ (public) | ✓ (all) |
| **Review:create** | ✓ (own orders) | ✓ (own orders) | ✓ (all) |
| **Review:update** | ✓ (own, 30 days) | ✓ (own, 30 days) | ✓ (all) |
| **Review:delete** | ✓ (own) | ✓ (own) | ✓ (all) |
| **Rating:read** | ✓ (public) | ✓ (public) | ✓ (all) |
| **Rating:create** | ✓ (own orders) | ✓ (own orders) | ✓ (all) |
| **Rating:update** | ✓ (own, 30 days) | ✓ (own, 30 days) | ✓ (all) |
| **Rating:delete** | ✓ (own) | ✓ (own) | ✓ (all) |
| **Question:read** | ✓ (public) | ✓ (public) | ✓ (all) |
| **Question:create** | ✓ | ✓ | ✓ |
| **Question:update** | ✓ (own) | ✓ (own) | ✓ (all) |
| **Question:delete** | ✓ (own) | ✓ (own) | ✓ (all) |
| **Answer:create** | ✗ | ✗ | ✓ |
| **Answer:update** | ✗ | ✗ | ✓ |
| **Answer:delete** | ✗ | ✗ | ✓ |
| **Review:moderate** | ✗ | ✗ | ✓ |
| **Review:approve** | ✗ | ✗ | ✓ |
| **Review:reject** | ✗ | ✗ | ✓ |
| **Review:feature** | ✗ | ✗ | ✓ |
| **Review:hide** | ✗ | ✗ | ✓ |
| **Report:create** | ✓ | ✓ | ✓ |
| **Report:resolve** | ✗ | ✗ | ✓ |
| **HelpfulVote:create** | ✓ | ✓ | ✓ |
| **HelpfulVote:delete** | ✓ (own) | ✓ (own) | ✓ |

---

### 10.5 Permission Rules

| Rule | Standard | Rationale |
|--------|----------|-----------|
| **Own resource** | Customers access only their own reviews/questions | Privacy |
| **Admin override** | Admin can access all feedback resources | Oversight |
| **No self-moderation** | Shop Owners cannot moderate reviews of their products | Fairness |
| **No self-answer** | Shop Owners cannot answer questions about their products | Brand voice |
| **Verified purchase** | Review creation requires delivered order | Authenticity |
| **Time-bound edit** | Edit window enforced by permission check | Integrity |
| **Audit all** | All permission checks logged | Compliance |

---

## 11. Performance Architecture

### 11.1 What

The complete architecture for feedback system performance — large review volume handling, lazy loading, pagination, search optimization, media optimization, and caching strategies.

### 11.2 Why

- **User experience:** Fast feedback browsing maintains premium feel.
- **Mobile performance:** Optimized for 70%+ mobile traffic.
- **Scalability:** Performance maintained as review volume grows.
- **Cost efficiency:** Optimized queries reduce database load.
- **SEO:** Fast page loads improve search rankings.

### 11.3 Where

API handlers, frontend components, CDN configuration, database queries, and caching layer.

---

### 11.4 Large Review Volume

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Denormalization** | `averageRating` and `reviewCount` cached on Product | Query performance |
| **Pagination** | Reviews paginated (20 per page) | Memory efficiency |
| **Cursor-based** | Use cursor pagination for large datasets | Scalability |
| **Background jobs** | Rating recalculation in background | Request performance |
| **Batch operations** | Moderate multiple reviews in batch | Efficiency |
| **Index strategy** | Composite indexes for common query patterns | Query performance |
| **Connection pooling** | Use Hyperdrive for connection pooling | Edge performance |

---

### 11.5 Lazy Loading

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Reviews section** | Reviews loaded on scroll into viewport | Initial page speed |
| **Media thumbnails** | Images lazy-loaded below fold | Bandwidth savings |
| **Rating distribution** | Distribution chart loaded after hero section | Initial render |
| **Questions section** | Questions loaded on scroll | Initial page speed |
| **Infinite scroll** | Optional infinite scroll for reviews | Mobile UX |
| **Skeleton states** | Skeleton loading states for feedback sections | Perceived speed |

---

### 11.6 Pagination

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Page size** | 20 reviews per page | Balance |
| **Cursor-based** | Use cursor pagination for scroll-based UIs | Scalability |
| **Offset-based** | Use offset pagination for page-based UIs | Simplicity |
| **Total count** | Include total count in response | UX |
| **Load more** | "Load more" button on mobile | Mobile UX |
| **Page numbers** | Page numbers on desktop | Desktop UX |
| **URL state** | Page state reflected in URL | Shareability |

---

### 11.7 Search Optimization

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Index** | Full-text search index on review body and title | Speed |
| **Trigram** | pg_trgm for fuzzy matching | Flexibility |
| **Partial index** | Index only active reviews | Performance |
| **Debounce** | 300ms debounce on search input | Request reduction |
| **Minimum length** | 3 characters minimum for search | Performance |
| **Stop words** | Filter common stop words | Relevance |

---

### 11.8 Media Optimization

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Cloudinary** | All media served via Cloudinary CDN | Performance |
| **Transformations** | Automatic resize, format conversion, compression | Optimization |
| **Responsive images** | Serve appropriate size for viewport | Bandwidth savings |
| **WebP format** | Auto-convert to WebP for modern browsers | Performance |
| **Lazy loading** | Images lazy-loaded below fold | Initial load |
| **Blur placeholders** | Show blur placeholder while loading | Perceived speed |
| **Max dimensions** | Limit max display dimensions | Performance |

---

## 12. Security Architecture

### 12.1 What

The complete architecture for feedback system security — spam prevention, fake review prevention, duplicate prevention, rate limiting, audit logging, and permission enforcement.

### 12.2 Why

- **Trust:** Security prevents manipulation of feedback.
- **Brand protection:** Spam and fake reviews damage brand reputation.
- **Compliance:** Audit trail meets legal requirements.
- **Fairness:** Security ensures authentic feedback.
- **Scalability:** Automated security handles volume at scale.

### 12.3 Where

API handlers, middleware, database constraints, automated moderation pipeline, and audit logs.

---

### 12.4 Spam Prevention

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Rate limiting** | Max 5 reviews per customer per day | Abuse prevention |
| **Content analysis** | Auto-screen for spam patterns | Detection |
| **Link detection** | Flag reviews with external links | Promotion prevention |
| **Keyword filtering** | Block known spam keywords | Basic defense |
| **Duplicate detection** | Detect duplicate content across reviews | Spam prevention |
| **IP analysis** | Detect multiple reviews from same IP | Bot detection |
| **Turnstile** | CAPTCHA on review submission | Bot prevention |

---

### 12.5 Fake Review Prevention

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Purchase verification** | Must reference delivered order | Authenticity |
| **Identity verification** | Must be authenticated customer | Identity proof |
| **Temporal analysis** | Detect suspicious review timing | Pattern detection |
| **Content analysis** | Detect generic/template reviews | Quality detection |
| **Network analysis** | Detect coordinated campaigns | Enterprise defense |
| **Behavior analysis** | Detect unusual review patterns | Advanced detection |
| **Product restriction** | Cannot review own products (Shop Owner) | Conflict prevention |

---

### 12.6 Duplicate Prevention

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Database constraint** | Unique constraint on (customerId, orderItemId) | Prevention |
| **Application check** | Check before insert | Defense in depth |
| **Content similarity** | Detect similar reviews from same customer | Pattern detection |
| **Cross-product** | Detect same review text across products | Spam detection |
| **Time window** | Cannot review same product within 24 hours | Rapid-fire prevention |

---

### 12.7 Rate Limiting

| Endpoint | Limit | Window | Rationale |
|----------|-------|--------|-----------|
| `POST /api/reviews` | 5 | 24 hours | Review creation |
| `PATCH /api/reviews/:id` | 10 | 24 hours | Review editing |
| `POST /api/questions` | 5 | 24 hours | Question creation |
| `POST /api/reports` | 10 | 24 hours | Report creation |
| `POST /api/helpful-votes` | 50 | 24 hours | Vote creation |

---

### 12.8 Audit Logging

| Event | Resource | Changes | Rationale |
|-------|----------|---------|-----------|
| `REVIEW_CREATED` | Review | — | Creation tracking |
| `REVIEW_APPROVED` | Review | — | Moderation action |
| `REVIEW_REJECTED` | Review | `{ reason: rejectionReason }` | Moderation action |
| `REVIEW_HIDDEN` | Review | `{ reason: hideReason }` | Moderation action |
| `REVIEW_DELETED` | Review | — | Deletion tracking |
| `REVIEW_EDITED` | Review | `{ fields: changedFields }` | Edit tracking |
| `QUESTION_CREATED` | Question | — | Creation tracking |
| `QUESTION_ANSWERED` | Question | — | Answer tracking |
| `REPORT_CREATED` | Report | `{ reason: reportReason }` | Report tracking |
| `REPORT_RESOLVED` | Report | `{ action: resolutionAction }` | Resolution tracking |
| `HELPFUL_VOTE_CREATED` | HelpfulVote | — | Vote tracking |

---

### 12.9 Permission Enforcement

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Authentication** | All write operations require authentication | Security |
| **Authorization** | Role-based permission checks on every operation | Security |
| **Ownership check** | Verify customer owns review before edit/delete | Privacy |
| **Order verification** | Verify order delivery before review creation | Authenticity |
| **CSRF protection** | CSRF token required for all mutations | CSRF prevention |
| **Input validation** | Zod schema validation on all inputs | Data integrity |
| **Output sanitization** | Sanitize all user-generated content | XSS prevention |

---

## 13. Accessibility Architecture

### 13.1 What

The complete architecture for feedback system accessibility — mobile review writing, keyboard navigation, screen readers, accessible rating controls, and inclusive design standards.

### 13.2 Why

- **Inclusivity:** Every customer must be able to provide feedback.
- **Legal compliance:** Meets WCAG 2.1 AA standards.
- **Brand values:** Premium brand serves all customers.
- **Mobile-first:** Accessibility optimized for 70%+ mobile traffic.
- **SEO:** Accessible content improves search rankings.

### 13.3 Where

Review writing forms, rating controls, review listings, question forms, moderation dashboard, and all feedback-related UI.

---

### 13.4 Mobile Review Writing

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Touch targets** | Min 44x44px touch targets | Mobile usability |
| **Input sizing** | Min 16px font size for inputs | Prevent zoom on iOS |
| **Virtual keyboard** | Appropriate keyboard type for each field | Mobile UX |
| **Auto-save** | Auto-save draft every 30 seconds | Prevent data loss |
| **Progress indicator** | Show completion progress | Motivation |
| **Submit CTA** | Prominent submit button, thumb-reachable | Mobile UX |
| **Error display** | Inline error messages, not modals | Mobile clarity |

---

### 13.5 Keyboard Navigation

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Tab order** | Logical tab order through review form | Keyboard navigation |
| **Star rating** | Arrow keys to select rating | Keyboard accessible |
| **Submit** | Enter key submits form | Keyboard shortcut |
| **Cancel** | Escape key cancels edit | Keyboard shortcut |
| **Focus visible** | Visible focus indicators | Visual clarity |
| **Skip links** | Skip to review content link | Efficiency |

---

### 13.6 Screen Readers

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **ARIA labels** | All interactive elements labeled | Screen reader support |
| **ARIA live** | Rating changes announced via ARIA live | Real-time feedback |
| **ARIA roles** | Proper roles for review cards, ratings | Structure |
| **Alt text** | Review images have descriptive alt text | Image description |
| **Heading hierarchy** | Proper heading levels in review section | Structure |
| **Form labels** | All form fields have visible labels | Form accessibility |
| **Error announcements** | Form errors announced to screen readers | Error accessibility |

---

### 13.7 Accessible Rating Controls

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Star selection** | Click and keyboard accessible | Multi-modal input |
| **Visual feedback** | Selected stars clearly visible | Visual clarity |
| **Text alternative** | "X out of 5 stars" text alternative | Screen reader support |
| **Hover state** | Hover preview of rating | Visual feedback |
| **Focus state** | Keyboard focus visible on stars | Keyboard accessibility |
| **Error state** | Invalid rating clearly indicated | Error feedback |

---

## 14. Future Readiness Architecture

### 14.1 What

The complete architecture for future feedback features — AI moderation, AI summaries, AI sentiment analysis, community reputation, customer badges, expert reviews, video-first reviews, and multi-language reviews.

### 14.2 Why

- **Scalability:** Architecture supports growth without redesign.
- **Innovation:** Ready for AI-powered features.
- **Community:** Features build long-term engagement.
- **Competitive advantage:** Advanced features differentiate Nabome.
- **Global readiness:** Multi-language support for international expansion.

### 14.3 Where

API handlers, database schema, frontend components, and ML pipeline.

---

### 14.4 AI Moderation

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **ML classification** | Auto-classify reviews as spam, offensive, fake | Scale |
| **Confidence scoring** | AI confidence score for each classification | Quality gate |
| **Human review** | Low-confidence classifications routed to admin | Quality assurance |
| **Training data** | Approved/rejected reviews train ML model | Continuous improvement |
| **Feedback loop** | Admin corrections improve AI accuracy | Learning |
| **API readiness** | Schema supports ML API integration | Future-proof |

---

### 14.5 AI Summaries

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Review summaries** | AI-generated summaries of review themes | Quick scanning |
| **Sentiment summary** | Overall sentiment analysis of reviews | Decision support |
| **Key themes** | Extract key themes from reviews | Pattern recognition |
| **Pro/con summary** | Auto-extract pros and cons from reviews | Structured insights |
| **Refresh** | Summaries regenerated on new reviews | Freshness |
| **Admin review** | AI summaries reviewed before publication | Quality control |

---

### 14.6 AI Sentiment Analysis

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Sentiment scoring** | Positive/negative/neutral sentiment per review | Quality signal |
| **Aspect sentiment** | Sentiment per product aspect (fit, quality, etc.) | Granular insights |
| **Trend analysis** | Sentiment trends over time | Product monitoring |
| **Alert system** | Alert on sudden sentiment drops | Early warning |
| **Dashboard** | Sentiment analytics for admin | Product intelligence |
| **Integration** | Feed into product quality scoring | Quality management |

---

### 14.7 Community Reputation

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Reputation score** | Customer reputation based on review quality | Gamification |
| **Factors** | Helpful votes, review quality, consistency | Quality signals |
| **Levels** | Bronze, Silver, Gold, Platinum tiers | Motivation |
| **Perks** | Higher tiers get moderation bypass | Efficiency |
| **Display** | Reputation badge on reviews | Social proof |
| **Privacy** | Reputation visible only to customer | Privacy |

---

### 14.8 Customer Badges

| Badge | Criteria | Benefit |
|-------|----------|---------|
| **First Review** | First approved review | Recognition |
| **Top Reviewer** | 10+ helpful votes | Visibility |
| **Photo Reviewer** | 5+ reviews with photos | Media badge |
| **Verified Expert** | 50+ verified reviews | Premium badge |
| **Helpful Hero** | 25+ helpful votes | Community badge |
| **Early Adopter** | First review on new product | Pioneer badge |

---

### 14.9 Expert Reviews

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Expert designation** | Admin can designate expert reviewers | Authority |
| **Expert badge** | "Expert Review" badge displayed | Trust signal |
| **Weighted reviews** | Expert reviews weighted higher in ranking | Authority |
| **Expert section** | Dedicated expert review section | Visibility |
| **Selection criteria** | Admin selects experts manually | Quality control |
| **Future readiness** | Schema supports expert role | Extensibility |

---

### 14.10 Video-First Reviews

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Video upload** | Support video upload in reviews | Rich content |
| **Video moderation** | Videos moderated before publication | Quality control |
| **Video player** | Inline video player in review cards | Visual experience |
| **Video thumbnails** | Auto-generated thumbnails | Performance |
| **Video compression** | Auto-compress for web delivery | Performance |
| **Mobile recording** | Record video directly from mobile camera | Mobile-first |

---

### 14.11 Multi-Language Reviews

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Language detection** | Auto-detect review language | Intelligence |
| **Translation readiness** | Schema supports language field | International |
| **Language filter** | Filter reviews by language | Discovery |
| **Translation API** | Ready for translation service integration | Future-proof |
| **RTL support** | Right-to-left language support | Inclusivity |
| **Localized display** | Reviews displayed in user's language | UX |

---

## 15. Mandatory Rules for AI Agents

### 15.1 What

Non-negotiable rules that every AI agent must follow when implementing or modifying the customer feedback system.

### 15.2 Why

- **Consistency:** Every implementation follows the same standards.
- **Quality:** Prevents common mistakes and anti-patterns.
- **Trust:** Maintains the integrity of the feedback ecosystem.
- **Compliance:** Meets legal and brand requirements.
- **Scalability:** Ensures architecture supports growth.

### 15.3 Where

Every file, every function, every component related to reviews, ratings, questions, answers, moderation, and community features.

---

### 15.4 Non-Negotiable Rules

| # | Rule | Rationale |
|---|------|-----------|
| 1 | **Only verified purchasers may publish product reviews** | Trust integrity |
| 2 | **Customer privacy must always be protected** | Legal compliance |
| 3 | **Shop Owner identities must never be exposed** | Brand integrity |
| 4 | **Reviews must remain authentic** | Social proof value |
| 5 | **Moderation must preserve trust without reducing transparency** | Balanced trust |
| 6 | **Feedback modules must remain independent** | Scalable architecture |
| 7 | **Design for enterprise-scale growth without redesign** | Long-term viability |
| 8 | **All feedback operations must be auditable** | Compliance |
| 9 | **Soft delete only — no hard deletes of feedback** | Audit integrity |
| 10 | **Rating recalculation on every add/edit/delete** | Data accuracy |
| 11 | **Edit window enforced — 30 days for reviews/ratings** | Integrity |
| 12 | **Moderation SLA — 24 hours for pending content** | Timeliness |
| 13 | **No auto-publishing of reviews without moderation** | Quality control |
| 14 | **All user-generated content must be sanitized** | Security |
| 15 | **Mobile-first for all feedback UI** | 70%+ mobile traffic |

---

### 15.5 Architecture Compliance Checklist

| Area | Requirement | Status |
|------|-------------|--------|
| **Database** | Reviews, ratings, questions, answers, helpful votes, reports tables defined | Required |
| **API** | CRUD endpoints for all feedback entities | Required |
| **Moderation** | Auto-screen + manual review pipeline | Required |
| **Trust** | Verified purchase badges, helpful votes, featured reviews | Required |
| **Visibility** | Public, hidden, pending, rejected, archived states | Required |
| **Notifications** | All notification events defined | Required |
| **Search** | Full-text search on reviews and questions | Required |
| **Permissions** | Role-based access control for all operations | Required |
| **Performance** | Pagination, lazy loading, caching strategy | Required |
| **Security** | Rate limiting, audit logging, input validation | Required |
| **Accessibility** | WCAG 2.1 AA compliance for all feedback UI | Required |
| **Future readiness** | AI moderation, summaries, sentiment analysis ready | Recommended |

---

### 15.6 Integration Points

| Module | Integration | Standard |
|--------|-------------|----------|
| **Product Engine** | Reviews linked to products via FK | Referential integrity |
| **Order Management** | Reviews linked to delivered orders | Verified purchase |
| **Customer Account** | Reviews linked to customer profiles | Ownership |
| **Search Engine** | Reviews indexed for full-text search | Discoverability |
| **Notification Engine** | Review events trigger notifications | Engagement |
| **Storage Engine** | Review media stored in Cloudinary | Performance |
| **Analytics** | Review data feeds into analytics | Intelligence |
| **Admin Dashboard** | Moderation queue in admin panel | Operations |

---

### 15.7 File Structure

```
src/features/reviews/
├── components/
│   ├── ReviewCard.tsx
│   ├── ReviewList.tsx
│   ├── ReviewForm.tsx
│   ├── ReviewStats.tsx
│   ├── RatingStars.tsx
│   ├── RatingDistribution.tsx
│   ├── HelpfulVoteButton.tsx
│   ├── ReviewMedia.tsx
│   ├── ReviewFilters.tsx
│   └── QuestionSection.tsx
├── hooks/
│   ├── useReviews.ts
│   ├── useRatings.ts
│   ├── useQuestions.ts
│   ├── useHelpfulVotes.ts
│   └── useReviewModeration.ts
├── api/
│   ├── reviews.ts
│   ├── ratings.ts
│   ├── questions.ts
│   ├── helpful-votes.ts
│   └── reports.ts
├── validators/
│   └── feedback.ts
└── types.ts

api/_handlers/products/
├── reviews.ts
├── questions.ts
└── helpful-votes.ts

api/_handlers/admin/
├── reviews.ts
└── moderation.ts
```

---

**End of Document**

> This document is the official Customer Reviews, Ratings, Questions & Community Architecture Standard for the Nabome Commerce Operating System. Every AI agent must follow this document when implementing or modifying customer feedback features.
