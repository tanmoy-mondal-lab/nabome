# NABOME API Documentation

## Overview
NABOME is a premium fashion e-commerce platform with a RESTful API built on Cloudflare Workers and PostgreSQL via Prisma.

**Base URL**: `https://api.nabome.com`

## Authentication
Most endpoints require authentication via Bearer token in the `Authorization` header.

```
Authorization: Bearer <token>
```

## Response Format
All responses follow this structure:

```typescript
{
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
```

## Endpoints

### Authentication

#### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "profile": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe"
    }
  }
}
```

#### POST /auth/login
Authenticate user and receive tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token",
    "profile": { ... }
  }
}
```

### Products

#### GET /products
List products with optional filters.

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)
- `category` (string, optional)
- `brand` (string, optional)
- `minPrice` (number, optional)
- `maxPrice` (number, optional)
- `gender` (string, optional: men, women, unisex)
- `search` (string, optional)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "products": [...],
    "pagination": {
      "total": 100,
      "page": 1,
      "pageSize": 20,
      "totalPages": 5
    }
  }
}
```

#### GET /products/:id
Get product details by ID or slug.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "product": {
      "id": "uuid",
      "name": "Product Name",
      "slug": "product-slug",
      "description": "...",
      "basePrice": 2999,
      "salePrice": 2499,
      "variants": [...],
      "images": [...]
    }
  }
}
```

### Orders

#### GET /orders
List customer orders.

**Query Parameters:**
- `page` (number)
- `limit` (number)
- `status` (string, optional)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "orders": [...],
    "pagination": { ... }
  }
}
```

#### GET /orders/:id
Get order details.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "order": {
      "id": "uuid",
      "orderNumber": "ORD-12345",
      "status": "confirmed",
      "total": 5999,
      "items": [...],
      "shippingAddress": {...}
    }
  }
}
```

#### POST /orders/:id/cancel
Cancel an order.

**Request Body:**
```json
{
  "reason": "Changed mind"
}
```

**Response:** `200 OK`

#### GET /orders/:id/tracking
Get order tracking information.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "timeline": [...],
    "currentStatus": "shipped",
    "shippedAt": "2024-01-15T10:00:00Z"
  }
}
```

### Cart

#### GET /cart
Get current cart.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "items": [...],
    "couponCode": null,
    "discount": 0,
    "total": 0
  }
}
```

#### POST /cart/sync
Sync cart from client.

**Request Body:**
```json
{
  "items": [
    { "variantId": "uuid", "quantity": 2 }
  ]
}
```

**Response:** `200 OK`

### Checkout

#### POST /checkout
Create order and initiate payment.

**Request Body:**
```json
{
  "shippingAddressId": "uuid",
  "billingAddressId": "uuid",
  "couponCode": "SAVE10",
  "paymentMethod": "razorpay",
  "items": [
    { "variantId": "uuid", "quantity": 1 }
  ]
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "order": { ... },
    "razorpayOrderId": "order_123"
  }
}
```

### Payments

#### POST /payments/verify
Verify Razorpay payment.

**Request Body:**
```json
{
  "razorpayPaymentId": "pay_123",
  "razorpayOrderId": "order_123",
  "razorpaySignature": "signature",
  "orderId": "uuid"
}
```

**Response:** `200 OK`

### Profile

#### GET /profile
Get user profile.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "profile": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe"
    }
  }
}
```

#### PUT /profile
Update user profile.

**Request Body:**
```json
{
  "firstName": "Jane",
  "phone": "+919876543210"
}
```

**Response:** `200 OK`

### Addresses

#### GET /addresses
List user addresses.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "addresses": [...]
  }
}
```

#### POST /addresses
Create new address.

**Request Body:**
```json
{
  "fullName": "John Doe",
  "phone": "+919876543210",
  "line1": "123 Main St",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001",
  "addressType": "shipping"
}
```

**Response:** `201 Created`

### Wishlist

#### GET /wishlist
Get wishlist items.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "items": [...]
  }
}
```

#### POST /wishlist
Add item to wishlist.

**Request Body:**
```json
{
  "variantId": "uuid"
}
```

**Response:** `201 Created`

#### DELETE /wishlist/:variantId
Remove item from wishlist.

**Response:** `200 OK`

### Returns

#### GET /returns
List return requests.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "returns": [...]
  }
}
```

#### POST /returns
Create return request.

**Request Body:**
```json
{
  "orderId": "uuid",
  "orderItemId": "uuid",
  "reason": "size_issue",
  "reasonDetail": "Size is too small",
  "evidenceImages": ["https://..."]
}
```

**Response:** `201 Created`

### Notifications

#### GET /notifications
List notifications.

**Query Parameters:**
- `page` (number)
- `limit` (number)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "notifications": [...]
  }
}
```

#### PUT /notifications/:id/read
Mark notification as read.

**Response:** `200 OK`

### Support

#### GET /support
List support tickets.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "tickets": [...]
  }
}
```

#### POST /support
Create support ticket.

**Request Body:**
```json
{
  "subject": "Order issue",
  "message": "My order hasn't arrived",
  "orderId": "uuid"
}
```

**Response:** `201 Created`

### Brands

#### GET /brands
List all active brands.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "brands": [{ "id": "uuid", "name": "Brand Name", "slug": "brand-name", "logoUrl": "...", "sortOrder": 0 }]
  }
}
```

#### GET /brands/:slug
Get brand details by slug.

### Categories

#### GET /categories
List all active categories with subcategories.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "categories": [{
      "id": "uuid", "name": "Category", "slug": "category",
      "subcategories": [{ "id": "uuid", "name": "Subcategory", "slug": "subcategory" }]
    }]
  }
}
```

### Collections

#### GET /collections
List all active collections.

#### GET /collections/:slug
Get collection details with products.

### Reviews

#### GET /products/:slug/reviews
Get paginated reviews for a product.

**Query Parameters:** `page` (default: 1), `limit` (default: 10)

#### POST /api/reviews
Submit a product review (authenticated).

**Request Body:**
```json
{
  "productId": "uuid",
  "rating": 5,
  "title": "Great product",
  "body": "Loved the fit and quality"
}
```

### Wishlist

#### GET /wishlist
Get user's wishlist items.

#### POST /wishlist
Add item to wishlist.

```json
{ "variantId": "uuid" }
```

#### DELETE /wishlist/:variantId
Remove item from wishlist.

### Notifications

#### GET /notifications
Get user notifications. Query params: `page`, `limit`

#### PUT /notifications/:id/read
Mark notification as read.

#### PUT /notifications/read-all
Mark all notifications as read.

### CMS (Public)

#### GET /cms/homepage
Get homepage sections with products and content.

#### GET /cms/pages
List all published static pages.

#### GET /cms/pages/:slug
Get a specific static page by slug.

#### GET /cms/navigation
Get navigation menus (header, footer).

#### GET /cms/announcements
Get active announcement bars.

#### GET /cms/footer
Get footer sections and links.

### Products

#### GET /products/featured
Get featured products.

#### GET /products/new
Get new arrivals.

#### GET /products/search
Search products by query. Query params: `q`, `page`, `limit`, `sort`

#### GET /products/:slug/variants
Get product variants with stock and pricing.

#### GET /products/:slug/similar
Get similar product recommendations.

### Upload

#### POST /upload/customer
Upload an image file (authenticated customer). Uses multipart/form-data.

**Form Data:** `file` (required), `folder` (optional, default: "returns")

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "url": "https://res.cloudinary.com/...",
    "publicId": "...",
    "width": 800,
    "height": 600,
    "format": "jpg"
  }
}
```

### Admin Endpoints

All admin endpoints require admin role authentication.

#### GET /admin/dashboard
Dashboard statistics (revenue, orders, customers, products).

#### GET /admin/products
Paginated product list. Params: `page`, `limit`, `search`, `category`, `status`

#### POST /admin/products
Create new product.

#### PUT /admin/products/:id
Update product details.

#### DELETE /admin/products/:id
Soft-delete (archive) a product.

#### GET /admin/orders
Paginated order list with filters. Params: `page`, `limit`, `status`, `paymentStatus`, `dateFrom`, `dateTo`

#### PUT /admin/orders/:id/status
Update order status and create status history entry.

#### GET /admin/customers
Paginated customer list. Params: `page`, `limit`, `search`

#### GET /admin/categories
CRUD for categories, collections, brands, coupons, reviews.

#### GET /admin/cms/homepage
Manage homepage sections, navigation, footer, announcements.

#### GET /admin/cms/pages
CRUD for static pages with template support.

#### POST /admin/products/import
Import products from CSV/JSON.

#### GET /admin/products/export
Export products as CSV/JSON.

#### GET /admin/inventory/overview
Inventory stats, low stock alerts, recent movements.

#### POST /admin/inventory/variant/:id/adjust
Adjust variant stock with reason tracking.

#### GET /admin/analytics/sales
Sales analytics with date range filtering.

#### GET /admin/analytics/products
Top/bottom performing products.

#### GET /admin/settings
Get and update site settings, preferences, SEO metadata.

#### GET /admin/search
Full-text search across products, orders, customers.

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing or invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |

## Rate Limiting
- 100 requests per minute per IP
- 1000 requests per hour per authenticated user

## Webhooks
NABOME sends webhook events for payment processing.

**Event Types:**
- `payment.captured`
- `payment.failed`
- `refund.processed`

Webhook signatures are verified using Razorpay's signature verification.
